import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import type { NextFunction, Request, Response } from "express";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";

import { logger } from "../logger";

export interface LeadRateLimitConfig {
  maxRequests: number;
  windowMs: number;
  hashSecret: string;
}

export interface LeadRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export type LeadRateLimitConsumer = (
  key: string,
  config: LeadRateLimitConfig,
  nowMs: number
) => Promise<LeadRateLimitResult>;

interface LeadRateLimitDependencies {
  config?: LeadRateLimitConfig;
  consume?: LeadRateLimitConsumer;
  now?: () => number;
}

function boundedInteger(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  if (!/^\d+$/.test(raw)) throw new Error(`${name} must be an integer`);
  const value = Number(raw);
  if (value < min || value > max) throw new Error(`${name} is outside its allowed range`);
  return value;
}

export function readLeadRateLimitConfig(): LeadRateLimitConfig {
  const hashSecret = process.env.LEAD_RATE_LIMIT_HASH_SECRET?.trim() ?? "";
  if (Buffer.byteLength(hashSecret, "utf8") < 32) {
    throw new Error("LEAD_RATE_LIMIT_HASH_SECRET must contain at least 32 bytes");
  }

  return {
    maxRequests: boundedInteger("LEAD_RATE_LIMIT_MAX", 5, 1, 100),
    windowMs: boundedInteger("LEAD_RATE_LIMIT_WINDOW_SECONDS", 3600, 60, 86_400) * 1000,
    hashSecret,
  };
}

export function normalizeClientIp(rawIp: string | undefined | null): string | null {
  let ip = rawIp?.trim().toLowerCase() ?? "";
  if (!ip) return null;

  if (ip.startsWith("::ffff:") && isIP(ip.slice(7)) === 4) {
    ip = ip.slice(7);
  }

  const zoneIndex = ip.indexOf("%");
  if (zoneIndex > 0) ip = ip.slice(0, zoneIndex);

  return isIP(ip) === 0 ? null : ip;
}

export function hashClientIp(normalizedIp: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`lead-rate-limit:v1:${normalizedIp}`, "utf8")
    .digest("hex");
}

function adminFirestore(): Firestore {
  if (getApps().length === 0) initializeApp();
  return getFirestore();
}

function timestampMillis(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (value && typeof (value as { toMillis?: unknown }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  return null;
}

export const consumeFirestoreLeadRateLimit: LeadRateLimitConsumer = async (
  key,
  config,
  nowMs
) => {
  const db = adminFirestore();
  const ref = db.collection("leadRateLimits").doc(key);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const currentWindowEnd = timestampMillis(data?.windowEndsAt);

    if (!snapshot.exists || currentWindowEnd === null || nowMs >= currentWindowEnd) {
      const windowEnd = nowMs + config.windowMs;
      transaction.set(ref, {
        count: 1,
        windowStartedAt: Timestamp.fromMillis(nowMs),
        windowEndsAt: Timestamp.fromMillis(windowEnd),
        expiresAt: Timestamp.fromMillis(windowEnd + 7 * 24 * 60 * 60 * 1000),
        schemaVersion: 1,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        retryAfterSeconds: 0,
      };
    }

    const count = data?.count;
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error("Lead rate-limit record is invalid");
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((currentWindowEnd - nowMs) / 1000));
    if (count >= config.maxRequests) {
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    transaction.update(ref, { count: count + 1 });
    return {
      allowed: true,
      remaining: config.maxRequests - count - 1,
      retryAfterSeconds: 0,
    };
  });
};

export function createLeadRateLimitMiddleware(dependencies: LeadRateLimitDependencies = {}) {
  const consume = dependencies.consume ?? consumeFirestoreLeadRateLimit;
  const now = dependencies.now ?? Date.now;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = dependencies.config ?? readLeadRateLimitConfig();
      const normalizedIp = normalizeClientIp(req.ip ?? req.socket.remoteAddress);
      if (!normalizedIp) throw new Error("A valid client IP is unavailable");

      const key = hashClientIp(normalizedIp, config.hashSecret);
      const result = await consume(key, config, now());

      res.setHeader("RateLimit-Limit", String(config.maxRequests));
      res.setHeader("RateLimit-Remaining", String(result.remaining));

      if (!result.allowed) {
        res.setHeader("Retry-After", String(result.retryAfterSeconds));
        res.setHeader("RateLimit-Reset", String(result.retryAfterSeconds));
        res.status(429).json({ error: "Too many lead submissions. Please try again later." });
        return;
      }

      next();
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : "Unknown rate-limit error" },
        "Lead rate limiter unavailable; request denied"
      );
      res.setHeader("Retry-After", "60");
      res.status(503).json({ error: "Lead submission is temporarily unavailable." });
    }
  };
}

export const leadRateLimit = createLeadRateLimitMiddleware();
