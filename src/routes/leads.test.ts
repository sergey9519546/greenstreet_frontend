import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../middleware/error";
import { logger } from "../logger";
import { createLeadsRouter, LeadSubmissionSchema } from "./leads";

const ORIGIN = "https://www.greenstreet.finance";
const VALID = {
  name: "Codex Production QA",
  email: "CODEX-PRODUCTION-QA@EXAMPLE.COM",
  phone: "",
  role: "investor",
  timeline: "exploring",
  propertyType: "sfr",
  propertyValue: 425_000,
  loanAmount: 318_750,
  rent: 3_000,
  rate: 7,
  purpose: "purchase",
  state: "Texas",
  ficoBand: "under-680",
  borrowerType: "entity",
  experience: "0",
  investmentConfirmed: true,
  contactConsent: true,
  page: "/book-demo",
  website: "",
} as const;

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
  vi.restoreAllMocks();
});

async function postLead(
  options: Parameters<typeof createLeadsRouter>[0],
  body: unknown,
  headers: Record<string, string> = {},
) {
  const app = express();
  app.use(express.json({ limit: "8kb" }));
  app.use(createLeadsRouter(options));
  const server = createServer(app);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;

  return fetch(`http://127.0.0.1:${address.port}/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: ORIGIN,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function postMalformedLead() {
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  app.use("/api/leads", createLeadsRouter({ allowedOrigins: [ORIGIN], persistLead: vi.fn() }));
  app.use(errorHandler);
  const server = createServer(app);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;

  return fetch(`http://127.0.0.1:${address.port}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: "{",
  });
}

describe("scenario-review lead schema", () => {
  it("accepts the bounded public intake shape and normalizes email", () => {
    const parsed = LeadSubmissionSchema.parse(VALID);
    expect(parsed.email).toBe("codex-production-qa@example.com");
  });

  it("accepts broker submissions and District of Columbia properties", () => {
    const parsed = LeadSubmissionSchema.parse({
      ...VALID,
      role: "broker",
      state: "District of Columbia",
    });

    expect(parsed).toMatchObject({
      role: "broker",
      state: "District of Columbia",
    });
  });

  it("rejects result snapshots, client timestamps, and extra fields", () => {
    for (const extra of [
      { dscr: 1.24 },
      { qualify: { ltv: 0.75 } },
      { submittedAt: new Date().toISOString() },
      { consent: { timestamp: new Date().toISOString() } },
    ]) {
      expect(LeadSubmissionSchema.safeParse({ ...VALID, ...extra }).success).toBe(false);
    }
  });

  it("requires explicit consent and a loan below property value", () => {
    expect(LeadSubmissionSchema.safeParse({ ...VALID, contactConsent: false }).success).toBe(false);
    expect(LeadSubmissionSchema.safeParse({ ...VALID, loanAmount: VALID.propertyValue }).success).toBe(false);
  });

  it("rejects unknown values, unbounded PII, and invalid phone characters", () => {
    expect(LeadSubmissionSchema.safeParse({ ...VALID, state: "Other" }).success).toBe(false);
    expect(LeadSubmissionSchema.safeParse({ ...VALID, name: "x".repeat(101) }).success).toBe(false);
    expect(LeadSubmissionSchema.safeParse({ ...VALID, phone: "not-a-phone" }).success).toBe(false);
  });
});

describe("anonymous lead intake route", () => {
  const trustedOptions = (persistLead = vi.fn().mockResolvedValue(undefined)) => ({
    allowedOrigins: [ORIGIN],
    persistLead,
  });

  it("writes only allowlisted intake data and returns no document id or result", async () => {
    const persistLead = vi.fn().mockResolvedValue(undefined);
    const response = await postLead(trustedOptions(persistLead), VALID);

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ accepted: true });
    expect(persistLead).toHaveBeenCalledWith(expect.objectContaining({
      email: "codex-production-qa@example.com",
      ficoBand: "under-680",
      experience: "0",
    }));
    expect(persistLead.mock.calls[0][0]).not.toHaveProperty("website");
  });

  it("rejects missing and cross-site origins before persistence", async () => {
    const persistLead = vi.fn().mockResolvedValue(undefined);
    const missingOrigin = await postLead(trustedOptions(persistLead), VALID, { origin: "" });
    const crossSite = await postLead(trustedOptions(persistLead), VALID, {
      origin: ORIGIN,
      "sec-fetch-site": "cross-site",
    });

    expect(missingOrigin.status).toBe(403);
    expect(crossSite.status).toBe(403);
    expect(persistLead).not.toHaveBeenCalled();
  });

  it("fails closed when no production origin is configured", async () => {
    const response = await postLead({ allowedOrigins: [], persistLead: vi.fn() }, VALID);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Lead intake is temporarily unavailable" });
  });

  it("returns stable validation and persistence errors", async () => {
    vi.spyOn(logger, "error").mockImplementation(() => undefined);
    const invalid = await postLead(trustedOptions(), { ...VALID, dscr: 1.22 });
    const unavailable = await postLead(trustedOptions(vi.fn().mockRejectedValue(new Error("credential details"))), VALID);

    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toEqual({ error: "Invalid lead submission" });
    expect(unavailable.status).toBe(503);
    expect(await unavailable.json()).toEqual({ error: "Lead intake is temporarily unavailable" });
  });

  it("keeps malformed JSON on the same stable validation response", async () => {
    const response = await postMalformedLead();
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid lead submission" });
  });

  it("acknowledges a filled honeypot without saving it", async () => {
    const persistLead = vi.fn().mockResolvedValue(undefined);
    const response = await postLead(trustedOptions(persistLead), { ...VALID, website: "https://spam.example" });

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ accepted: true });
    expect(persistLead).not.toHaveBeenCalled();
  });
});
