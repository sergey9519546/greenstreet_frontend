import { createHash } from "node:crypto";
import type { RequestHandler } from "express";

import { logger } from "../logger";
import { getAdminFirestore } from "../services/firebaseAdmin";
import type { AuthenticatedRequest } from "./auth";

export const DEFAULT_NARRATION_QUOTA_MAX = 20;
export const DEFAULT_NARRATION_QUOTA_WINDOW_MS = 60 * 60 * 1_000;

type QuotaDocumentReference = { id: string };
type QuotaSnapshot = {
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
};
type QuotaTransaction = {
  get: (reference: QuotaDocumentReference) => Promise<QuotaSnapshot>;
  set: (reference: QuotaDocumentReference, data: Record<string, unknown>) => void;
};
type QuotaFirestore = {
  collection: (name: string) => { doc: (id: string) => QuotaDocumentReference };
  runTransaction: <T>(work: (transaction: QuotaTransaction) => Promise<T>) => Promise<T>;
};

export interface NarrationQuotaOptions {
  firestore?: QuotaFirestore;
  maximum?: number;
  windowMs?: number;
  now?: () => number;
}

function positiveInteger(value: unknown, maximum: number): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= maximum
    ? value
    : undefined;
}

function configuredPositiveInteger(
  name: string,
  fallback: number,
  maximum: number,
): number | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  if (!/^\d+$/.test(raw)) return undefined;
  return positiveInteger(Number(raw), maximum);
}

function hashedUid(uid: string): string {
  return createHash("sha256").update(uid, "utf8").digest("hex");
}

function finiteStoredNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

async function consumeQuota(
  firestore: QuotaFirestore,
  uid: string,
  now: number,
  maximum: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const reference = firestore.collection("narrationQuota").doc(hashedUid(uid));

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const stored = snapshot.exists ? snapshot.data() : undefined;
    const storedExpiresAtMs = finiteStoredNumber(stored?.expiresAtMs);
    const storedCount = finiteStoredNumber(stored?.count);
    const storedWindowStartedAtMs = finiteStoredNumber(stored?.windowStartedAtMs);
    const isCurrentWindow =
      storedExpiresAtMs !== undefined &&
      storedCount !== undefined &&
      storedWindowStartedAtMs !== undefined &&
      storedExpiresAtMs > now &&
      storedCount >= 0;

    const expiresAtMs = isCurrentWindow ? storedExpiresAtMs : now + windowMs;
    const windowStartedAtMs = isCurrentWindow ? storedWindowStartedAtMs : now;
    const count = isCurrentWindow ? storedCount : 0;

    if (count >= maximum) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((expiresAtMs - now) / 1_000)),
      };
    }

    transaction.set(reference, {
      count: count + 1,
      windowStartedAtMs,
      expiresAtMs,
      updatedAtMs: now,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  });
}

/**
 * Durable quota for the paid narration endpoint. Authentication is mounted
 * upstream; this guard deliberately fails closed if that identity or Firestore
 * cannot be used, so an outage never becomes an unbounded LLM spend path.
 */
export function createNarrationQuota(options: NarrationQuotaOptions = {}): RequestHandler {
  const maximum = options.maximum === undefined
    ? configuredPositiveInteger(
      "NARRATION_QUOTA_MAX_REQUESTS",
      DEFAULT_NARRATION_QUOTA_MAX,
      10_000,
    )
    : positiveInteger(options.maximum, 10_000);
  const windowSeconds = options.windowMs === undefined
    ? configuredPositiveInteger(
      "NARRATION_QUOTA_WINDOW_SECONDS",
      DEFAULT_NARRATION_QUOTA_WINDOW_MS / 1_000,
      30 * 24 * 60 * 60,
    )
    : undefined;
  const windowMs = options.windowMs === undefined
    ? windowSeconds === undefined ? undefined : windowSeconds * 1_000
    : positiveInteger(options.windowMs, 30 * 24 * 60 * 60 * 1_000);
  const now = options.now ?? Date.now;

  return async (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const uid = (req as AuthenticatedRequest).user?.uid;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized: authentication required" });
      return;
    }
    if (maximum === undefined || windowMs === undefined) {
      logger.error("Narration quota configuration is invalid; request rejected fail-closed.");
      res.status(503).json({ error: "Narration is temporarily unavailable." });
      return;
    }

    try {
      const firestore = options.firestore ?? (getAdminFirestore() as unknown as QuotaFirestore);
      const outcome = await consumeQuota(firestore, uid, now(), maximum, windowMs);
      if (!outcome.allowed) {
        res.setHeader("Retry-After", String(outcome.retryAfterSeconds));
        res.status(429).json({ error: "Narration quota exceeded. Please try again later." });
        return;
      }
      next();
    } catch {
      logger.error("Narration quota storage is unavailable; request rejected fail-closed.");
      res.status(503).json({ error: "Narration is temporarily unavailable." });
    }
  };
}
