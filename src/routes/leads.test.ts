import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../middleware/error";
import { logger } from "../logger";
import {
  createLeadsRouter,
  createWebhookLeadNotifier,
  LeadSubmissionSchema,
  readLeadWebhookConfig,
} from "./leads";

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
  page: "/apply",
  submissionId: "00000000-0000-4000-8000-000000000001",
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
  app.use("/api/leads", createLeadsRouter({
    allowedOrigins: [ORIGIN],
    persistLead: vi.fn(),
    notifyLead: vi.fn(),
    markLeadNotification: vi.fn(),
  }));
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

describe("preliminary loan-request lead schema", () => {
  it("accepts the bounded public intake shape and normalizes email", () => {
    const parsed = LeadSubmissionSchema.parse(VALID);
    expect(parsed.email).toBe("codex-production-qa@example.com");
  });

  it("accepts a broker handoff, DC property, and calculator expense inputs", () => {
    const parsed = LeadSubmissionSchema.parse({
      ...VALID,
      role: "broker",
      state: "District of Columbia",
      taxesAnnual: 5_200,
      insuranceAnnual: 2_100,
      hoaMonthly: 375,
    });

    expect(parsed).toMatchObject({
      role: "broker",
      state: "District of Columbia",
      taxesAnnual: 5_200,
      insuranceAnnual: 2_100,
      hoaMonthly: 375,
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
  const trustedOptions = (
    persistLead = vi.fn().mockResolvedValue(undefined),
    notifyLead = vi.fn().mockResolvedValue(undefined),
    markLeadNotification = vi.fn().mockResolvedValue(undefined),
  ) => ({
    allowedOrigins: [ORIGIN],
    persistLead,
    notifyLead,
    markLeadNotification,
  });

  it("stores, notifies, marks delivered, and only then acknowledges the request", async () => {
    const persistLead = vi.fn().mockResolvedValue(undefined);
    const notifyLead = vi.fn().mockResolvedValue(undefined);
    const markLeadNotification = vi.fn().mockResolvedValue(undefined);
    const response = await postLead(
      trustedOptions(persistLead, notifyLead, markLeadNotification),
      VALID,
    );

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ accepted: true });
    expect(persistLead).toHaveBeenCalledWith(expect.objectContaining({
      email: "codex-production-qa@example.com",
      ficoBand: "under-680",
      experience: "0",
      submissionId: VALID.submissionId,
    }));
    expect(persistLead.mock.calls[0][0]).not.toHaveProperty("website");
    expect(notifyLead).toHaveBeenCalledWith(persistLead.mock.calls[0][0]);
    expect(markLeadNotification).toHaveBeenCalledWith(
      VALID.submissionId,
      "delivered",
    );
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
    const response = await postLead({
      allowedOrigins: [],
      persistLead: vi.fn(),
      notifyLead: vi.fn(),
      markLeadNotification: vi.fn(),
    }, VALID);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Lead intake is temporarily unavailable" });
  });

  it("fails closed without a staff notification destination", async () => {
    const persistLead = vi.fn().mockResolvedValue(undefined);
    const response = await postLead({
      allowedOrigins: [ORIGIN],
      persistLead,
      markLeadNotification: vi.fn(),
    }, VALID);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Lead intake is temporarily unavailable" });
    expect(persistLead).not.toHaveBeenCalled();
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

  it("records a failed staff notification and does not show success", async () => {
    vi.spyOn(logger, "error").mockImplementation(() => undefined);
    const persistLead = vi.fn().mockResolvedValue(undefined);
    const notifyLead = vi.fn().mockRejectedValue(new Error("destination unavailable"));
    const markLeadNotification = vi.fn().mockResolvedValue(undefined);
    const response = await postLead(
      trustedOptions(persistLead, notifyLead, markLeadNotification),
      VALID,
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Lead intake is temporarily unavailable" });
    expect(persistLead).toHaveBeenCalledOnce();
    expect(markLeadNotification).toHaveBeenCalledWith(
      VALID.submissionId,
      "failed",
    );
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

describe("lead notification webhook", () => {
  it("requires a complete authenticated HTTPS configuration", () => {
    expect(readLeadWebhookConfig({})).toBeNull();
    expect(() => readLeadWebhookConfig({
      LEAD_NOTIFICATION_WEBHOOK_URL: "https://crm.example.test/leads",
    })).toThrow("configuration is incomplete");
    expect(() => readLeadWebhookConfig({
      LEAD_NOTIFICATION_WEBHOOK_URL: "http://crm.example.test/leads",
      LEAD_NOTIFICATION_WEBHOOK_TOKEN: "0123456789abcdef",
    })).toThrow("credential-free HTTPS URL");
    expect(() => readLeadWebhookConfig({
      LEAD_NOTIFICATION_WEBHOOK_URL: "https://crm.example.test/leads#secret",
      LEAD_NOTIFICATION_WEBHOOK_TOKEN: "0123456789abcdef",
    })).toThrow("credential-free HTTPS URL");
  });

  it("delivers bounded lead data with authentication and an idempotency key", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 202 })) as unknown as typeof fetch;
    const notifyLead = createWebhookLeadNotifier({
      endpoint: "https://crm.example.test/leads",
      bearerToken: "0123456789abcdef",
    }, fetchMock);
    const { website: _website, ...lead } = LeadSubmissionSchema.parse(VALID);

    await notifyLead(lead);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [endpoint, request] = (fetchMock as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(endpoint).toBe("https://crm.example.test/leads");
    expect(request).toMatchObject({
      method: "POST",
      cache: "no-store",
      redirect: "error",
    });
    expect(request.headers).toMatchObject({
      authorization: "Bearer 0123456789abcdef",
      "idempotency-key": VALID.submissionId,
      "x-greenstreet-event": "lead.created.v1",
    });
    const payload = JSON.parse(String(request.body));
    expect(payload).toMatchObject({
      event: "lead.created.v1",
      id: VALID.submissionId,
      lead: {
        email: "codex-production-qa@example.com",
        submissionId: VALID.submissionId,
      },
    });
    expect(payload.lead).not.toHaveProperty("website");
  });
});
