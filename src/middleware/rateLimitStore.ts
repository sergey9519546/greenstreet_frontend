import { createHmac } from "node:crypto";
import { MemoryStore, type ClientRateLimitInfo, type Options, type Store } from "express-rate-limit";
import { Timestamp } from "firebase-admin/firestore";

import { logger } from "../logger";
import { getAdminApp, getAdminFirestore } from "../services/firebaseAdmin";

/**
 * Rate-limit persistence.
 *
 * express-rate-limit's default MemoryStore lives in the process heap. On a
 * serverless host (Cloud Functions / Vercel) every cold start — and every
 * additional concurrent instance — begins with an empty counter, so the
 * advertised "10 requests per minute" is really "10 per minute per warm
 * instance". That is honest DoS mitigation only when it is written down.
 *
 * Set RATE_LIMIT_FIRESTORE=true to persist counters in Firestore instead, so
 * every instance shares one window. It also requires a 32-byte
 * RATE_LIMIT_FIRESTORE_HMAC_SECRET: document IDs are opaque HMACs rather than
 * client IPs or other rate-limit keys. If either prerequisite is unavailable,
 * the store safely falls back to memory rather than failing startup.
 *
 * Deliberately dependency-free (no Redis) and deliberately naive: this is
 * abuse mitigation, not billing. A transaction retry that loses a hit is
 * acceptable; a request rejected because Firestore hiccuped is not — hence the
 * memory fallback on any store error.
 */

/** Firestore collection holding one document per (bucket, client key) window. */
const COLLECTION = process.env.RATE_LIMIT_FIRESTORE_COLLECTION || "apiRateLimits";
const MIN_HMAC_SECRET_BYTES = 32;
const MAX_CLIENT_KEY_BYTES = 1_024;

/**
 * Use an opaque, fixed-width ID in Firestore. Rate-limit keys are normally IP
 * addresses, but callers can configure their own key generator; never persist
 * those raw values (or a reversible sanitized version) in a document name.
 */
function isValidHmacSecret(secret: string | undefined): secret is string {
  return typeof secret === "string" && Buffer.byteLength(secret, "utf8") >= MIN_HMAC_SECRET_BYTES;
}

function opaqueDocumentId(bucket: string, key: string, secret: string): string {
  if (typeof key !== "string" || key.length === 0 || Buffer.byteLength(key, "utf8") > MAX_CLIENT_KEY_BYTES) {
    throw new Error("Invalid rate-limit client key");
  }

  return `rl_${createHmac("sha256", secret)
    .update(`rate-limit-store:v1:${JSON.stringify([bucket, key])}`, "utf8")
    .digest("hex")}`;
}

export class FirestoreRateLimitStore implements Store {
  /** Counters are shared across instances, so express-rate-limit's double-count check must not treat them as local. */
  localKeys = false;
  prefix: string;

  private windowMs = 60_000;
  private readonly fallback = new MemoryStore();
  private degradedLogged = false;

  constructor(
    private readonly bucket: string,
    private readonly hmacSecret: string,
  ) {
    if (!isValidHmacSecret(hmacSecret)) {
      throw new Error("RATE_LIMIT_FIRESTORE_HMAC_SECRET must contain at least 32 bytes");
    }
    this.prefix = `${bucket}:`;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
    this.fallback.init(options);
  }

  private docId(key: string): string {
    return opaqueDocumentId(this.bucket, key, this.hmacSecret);
  }

  /**
   * Any Firestore failure (permissions, quota, network) degrades to the
   * in-process counter for that call instead of 500-ing the request. Logged
   * once per store instance so a sustained outage cannot flood the logs.
   */
  private degrade<T>(run: () => T): T {
    if (!this.degradedLogged) {
      this.degradedLogged = true;
      logger.error(
        { code: "RATE_LIMIT_FIRESTORE_UNAVAILABLE" },
        "Firestore rate-limit store unavailable; falling back to per-instance memory counters",
      );
    }
    return run();
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const now = Date.now();

    try {
      const db = getAdminFirestore();
      const ref = db.collection(COLLECTION).doc(this.docId(key));

      return await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        const data = snapshot.exists ? snapshot.data() : undefined;
        const previousExpiry = typeof data?.expiresAtMs === "number" ? data.expiresAtMs : 0;

        // Expired (or absent) window → start a new one. Documents are also
        // reaped server-side by a Firestore TTL policy on `expiresAt`; this
        // check means correctness never depends on that policy running.
        if (previousExpiry <= now) {
          const resetAtMs = now + this.windowMs;
          tx.set(ref, {
            totalHits: 1,
            expiresAtMs: resetAtMs,
            expiresAt: Timestamp.fromMillis(resetAtMs),
          });
          return { totalHits: 1, resetTime: new Date(resetAtMs) };
        }

        const totalHits = (typeof data?.totalHits === "number" ? data.totalHits : 0) + 1;
        tx.set(ref, {
          totalHits,
          expiresAtMs: previousExpiry,
          expiresAt: Timestamp.fromMillis(previousExpiry),
        });
        return { totalHits, resetTime: new Date(previousExpiry) };
      });
    } catch {
      return this.degrade(() => this.fallback.increment(key));
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      const db = getAdminFirestore();
      const ref = db.collection(COLLECTION).doc(this.docId(key));

      await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        if (!snapshot.exists) return;
        const data = snapshot.data();
        const totalHits = typeof data?.totalHits === "number" ? data.totalHits : 0;
        tx.set(ref, { ...data, totalHits: Math.max(0, totalHits - 1) });
      });
    } catch {
      this.degrade(() => this.fallback.decrement(key));
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await getAdminFirestore().collection(COLLECTION).doc(this.docId(key)).delete();
    } catch {
      this.degrade(() => this.fallback.resetKey(key));
    }
  }

  shutdown(): void {
    this.fallback.shutdown();
  }
}

let memoryStoreWarningLogged = false;

function warnAboutMemoryStoreOnce(): void {
  if (memoryStoreWarningLogged) return;
  memoryStoreWarningLogged = true;
  if (process.env.NODE_ENV !== "production") return;

  logger.warn(
    "Rate limiting is using the in-memory store. Counters reset on every cold start and are not " +
      "shared between concurrent instances, so effective limits are per-instance. Set " +
      "RATE_LIMIT_FIRESTORE=true (with firebase-admin credentials) for shared, persistent counters.",
  );
}

/**
 * Returns the store to hand express-rate-limit, or `undefined` to keep its
 * built-in MemoryStore. Callers must omit the `store` option entirely when this
 * returns `undefined` — passing `store: undefined` overrides the default.
 */
export function createRateLimitStore(bucket: string): Store | undefined {
  if (process.env.RATE_LIMIT_FIRESTORE === "true") {
    const hmacSecret = process.env.RATE_LIMIT_FIRESTORE_HMAC_SECRET;
    if (!isValidHmacSecret(hmacSecret)) {
      logger.error(
        { code: "RATE_LIMIT_FIRESTORE_HMAC_SECRET_INVALID" },
        "RATE_LIMIT_FIRESTORE=true requires a valid HMAC secret; using in-memory rate limiting",
      );
    } else {
      try {
        // Cheap probe: constructing the store is useless if admin never initialized.
        getAdminApp();
        logger.info("Rate limiting using Firestore-backed store");
        return new FirestoreRateLimitStore(bucket, hmacSecret);
      } catch {
        logger.error(
          { code: "RATE_LIMIT_FIRESTORE_ADMIN_UNAVAILABLE" },
          "RATE_LIMIT_FIRESTORE=true but firebase-admin is not initialized; using in-memory rate limiting",
        );
      }
    }
  }

  warnAboutMemoryStoreOnce();
  return undefined;
}

/** Test seam: lets a suite re-observe the one-time production warning. */
export function __resetRateLimitStoreWarningForTests(): void {
  memoryStoreWarningLogged = false;
}
