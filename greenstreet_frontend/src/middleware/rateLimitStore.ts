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
 * every instance shares one window. Requires firebase-admin to be initialized;
 * if it is not, we log and fall back to memory rather than failing startup.
 *
 * Deliberately dependency-free (no Redis) and deliberately naive: this is
 * abuse mitigation, not billing. A transaction retry that loses a hit is
 * acceptable; a request rejected because Firestore hiccuped is not — hence the
 * memory fallback on any store error.
 */

/** Firestore collection holding one document per (bucket, client key) window. */
const COLLECTION = process.env.RATE_LIMIT_FIRESTORE_COLLECTION || "apiRateLimits";

/**
 * Firestore document IDs may not contain "/" and may not be "." or "..".
 * Client keys are IPs (v4 or v6) by default but are operator-configurable, so
 * normalize defensively and cap the length.
 */
function sanitizeKey(key: string): string {
  const safe = key.replace(/[^A-Za-z0-9_.:-]/g, "_").slice(0, 180);
  return safe.length > 0 ? safe : "unknown";
}

export class FirestoreRateLimitStore implements Store {
  /** Counters are shared across instances, so express-rate-limit's double-count check must not treat them as local. */
  localKeys = false;
  prefix: string;

  private windowMs = 60_000;
  private readonly fallback = new MemoryStore();
  private degradedLogged = false;

  constructor(private readonly bucket: string) {
    this.prefix = `${bucket}:`;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
    this.fallback.init(options);
  }

  private docId(key: string): string {
    return `${this.bucket}__${sanitizeKey(key)}`;
  }

  /**
   * Any Firestore failure (permissions, quota, network) degrades to the
   * in-process counter for that call instead of 500-ing the request. Logged
   * once per store instance so a sustained outage cannot flood the logs.
   */
  private degrade<T>(error: unknown, run: () => T): T {
    if (!this.degradedLogged) {
      this.degradedLogged = true;
      logger.error(
        { bucket: this.bucket, error: error instanceof Error ? error.message : String(error) },
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
    } catch (error) {
      return this.degrade(error, () => this.fallback.increment(key));
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
    } catch (error) {
      this.degrade(error, () => this.fallback.decrement(key));
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await getAdminFirestore().collection(COLLECTION).doc(this.docId(key)).delete();
    } catch (error) {
      this.degrade(error, () => this.fallback.resetKey(key));
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
    try {
      // Cheap probe: constructing the store is useless if admin never initialized.
      getAdminApp();
      logger.info({ bucket, collection: COLLECTION }, "Rate limiting using Firestore-backed store");
      return new FirestoreRateLimitStore(bucket);
    } catch (error) {
      logger.error(
        { bucket, error: error instanceof Error ? error.message : String(error) },
        "RATE_LIMIT_FIRESTORE=true but firebase-admin is not initialized; using in-memory rate limiting",
      );
    }
  }

  warnAboutMemoryStoreOnce();
  return undefined;
}

/** Test seam: lets a suite re-observe the one-time production warning. */
export function __resetRateLimitStoreWarningForTests(): void {
  memoryStoreWarningLogged = false;
}
