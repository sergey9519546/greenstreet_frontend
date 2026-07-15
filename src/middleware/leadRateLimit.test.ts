import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import {
  createLeadRateLimitMiddleware,
  hashClientIp,
  normalizeClientIp,
  type LeadRateLimitConfig,
} from "./leadRateLimit";

const config: LeadRateLimitConfig = {
  maxRequests: 5,
  windowMs: 60_000,
  hashSecret: "0123456789abcdef0123456789abcdef",
};

function responseDouble() {
  const headers = new Map<string, string>();
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    setHeader: vi.fn((name: string, value: string) => headers.set(name, value)),
    status: vi.fn(function (this: { statusCode: number }, statusCode: number) {
      this.statusCode = statusCode;
      return this;
    }),
    json: vi.fn(function (this: { body: unknown }, body: unknown) {
      this.body = body;
      return this;
    }),
  };
  return { response: response as unknown as Response, headers };
}

describe("lead rate-limit privacy", () => {
  it("normalizes IPv4-mapped addresses and rejects invalid input", () => {
    expect(normalizeClientIp(" ::ffff:203.0.113.10 ")).toBe("203.0.113.10");
    expect(normalizeClientIp("not-an-ip")).toBeNull();
  });

  it("creates a stable non-plaintext HMAC key", () => {
    const first = hashClientIp("203.0.113.10", config.hashSecret);
    const second = hashClientIp("203.0.113.10", config.hashSecret);
    expect(first).toBe(second);
    expect(first).not.toContain("203.0.113.10");
    expect(first).toHaveLength(64);
  });

  it("passes only the hashed address to durable storage", async () => {
    const consume = vi.fn().mockResolvedValue({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 0,
    });
    const middleware = createLeadRateLimitMiddleware({ config, consume, now: () => 1_000 });
    const { response } = responseDouble();
    const next = vi.fn() as NextFunction;

    await middleware({ ip: "203.0.113.10", socket: {} } as Request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(consume).toHaveBeenCalledWith(
      hashClientIp("203.0.113.10", config.hashSecret),
      config,
      1_000
    );
  });

  it("returns Retry-After when the durable limit is exhausted", async () => {
    const consume = vi.fn().mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 42,
    });
    const middleware = createLeadRateLimitMiddleware({ config, consume });
    const { response, headers } = responseDouble();
    const next = vi.fn() as NextFunction;

    await middleware({ ip: "203.0.113.10", socket: {} } as Request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(429);
    expect(headers.get("Retry-After")).toBe("42");
  });
});
