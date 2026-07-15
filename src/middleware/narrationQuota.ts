import { createHash } from "crypto";
import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";
import { logger } from "../logger";
import { AuthenticatedRequest } from "./auth";

const DEFAULT_WINDOW_SECONDS = 60 * 60;
const DEFAULT_MAX_REQUESTS = 20;
const QUOTA_COLLECTION = "narrationQuotas";

interface QuotaConfig {
  maxRequests: number;
  windowMs: number;
}

interface QuotaDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

function positiveIntegerEnv(
  name: string,
  fallback: number,
  maximum: number
): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  if (!/^\d+$/.test(raw)) {
    throw new Error(`${name} must be a positive integer`);
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${name} is outside the supported range`);
  }
  return value;
}

function quotaConfig(): QuotaConfig {
  const windowSeconds = positiveIntegerEnv(
    "NARRATION_QUOTA_WINDOW_SECONDS",
    DEFAULT_WINDOW_SECONDS,
    30 * 24 * 60 * 60
  );
  const maxRequests = positiveIntegerEnv(
    "NARRATION_QUOTA_MAX_REQUESTS",
    DEFAULT_MAX_REQUESTS,
    10_000
  );
  return { maxRequests, windowMs: windowSeconds * 1000 };
}

function quotaDocumentId(uid: string, windowNumber: number): string {
  const userDigest = createHash("sha256")
    .update(`greenstreet:narration-quota:v1:${uid}`, "utf8")
    .digest("hex");
  return `${userDigest}-${windowNumber.toString(36)}`;
}

function safeErrorType(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return error instanceof Error ? error.name : "UnknownError";
}

/**
 * Atomically consumes one per-user narration allowance from Firestore.
 * Storage and configuration errors fail closed so a quota outage cannot turn
 * into an unmetered paid-API path.
 */
export async function enforceNarrationQuota(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authenticatedRequest = req as AuthenticatedRequest;
  const uid = authenticatedRequest.user?.uid;
  if (!uid) {
    res.status(401).json({ error: "Unauthorized: Missing authenticated user" });
    return;
  }

  try {
    const config = quotaConfig();
    const now = Date.now();
    const windowNumber = Math.floor(now / config.windowMs);
    const windowEndsAt = (windowNumber + 1) * config.windowMs;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowEndsAt - now) / 1000)
    );
    const db = admin.firestore();
    const quotaRef = db
      .collection(QUOTA_COLLECTION)
      .doc(quotaDocumentId(uid, windowNumber));

    const decision = await db.runTransaction<QuotaDecision>(async (transaction) => {
      const snapshot = await transaction.get(quotaRef);
      if (!snapshot.exists) {
        transaction.set(quotaRef, {
          count: 1,
          windowStartedAt: new Date(windowNumber * config.windowMs),
          windowEndsAt: new Date(windowEndsAt),
          expiresAt: new Date(windowEndsAt + config.windowMs),
        });
        return { allowed: true, retryAfterSeconds };
      }

      const count = snapshot.get("count");
      if (!Number.isSafeInteger(count) || count < 0) {
        throw new Error("Stored narration quota is invalid");
      }
      if (count >= config.maxRequests) {
        return { allowed: false, retryAfterSeconds };
      }

      transaction.update(quotaRef, { count: count + 1 });
      return { allowed: true, retryAfterSeconds };
    });

    if (!decision.allowed) {
      res.setHeader("Retry-After", String(decision.retryAfterSeconds));
      res.setHeader("Cache-Control", "no-store");
      res.status(429).json({
        error: "Narration quota exceeded",
        retryAfterSeconds: decision.retryAfterSeconds,
      });
      return;
    }

    next();
  } catch (error: unknown) {
    logger.error(
      { errorType: safeErrorType(error) },
      "Narration quota check failed closed"
    );
    res.setHeader("Cache-Control", "no-store");
    res.status(503).json({ error: "Narration quota service unavailable" });
  }
}
