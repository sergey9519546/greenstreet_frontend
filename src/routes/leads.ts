import { Request, Response, Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminFirestore } from "../services/firebaseAdmin";
import { logger } from "../logger";

const LEAD_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
] as const;

const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .refine((value) => value === "" || (/^[0-9+().\-\s]+$/.test(value) && value.replace(/\D/g, "").length >= 7), {
    message: "Invalid phone number",
  });

const nameSchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .refine((value) => !/[\u0000-\u001F\u007F]/.test(value), { message: "Invalid name" });

// This schema deliberately accepts only raw intake fields. In particular, it
// rejects client-calculated qualification results, timestamps, and arbitrary
// nested data so a public browser cannot create an unbounded lead record.
export const LeadSubmissionSchema = z
  .object({
    name: nameSchema,
    email: z.string().trim().toLowerCase().email().max(254),
    phone: phoneSchema.optional().default(""),
    role: z.enum(["investor", "broker", "foreign", "str", "vacation"]).optional(),
    timeline: z.enum(["exploring", "under-30", "30-90", "refi-soon"]),
    propertyType: z.enum(["sfr", "2-4-unit", "condo", "townhouse", "5-8-unit", "short-term-rental"]),
    propertyValue: z.number().finite().min(50_000).max(100_000_000),
    loanAmount: z.number().finite().positive().max(100_000_000),
    rent: z.number().finite().positive().max(1_000_000),
    rate: z.number().finite().min(2).max(20),
    taxesAnnual: z.number().finite().min(0).max(10_000_000).optional(),
    insuranceAnnual: z.number().finite().min(0).max(10_000_000).optional(),
    hoaMonthly: z.number().finite().min(0).max(100_000).optional(),
    purpose: z.enum(["purchase", "rate-term", "cash-out"]).optional().default("purchase"),
    state: z.enum(LEAD_STATES),
    ficoBand: z.enum(["under-680", "680-719", "720-759", "760-plus"]),
    borrowerType: z.enum(["individual", "entity"]),
    experience: z.enum(["0", "1-3", "4-9", "10-plus"]),
    investmentConfirmed: z.literal(true),
    contactConsent: z.literal(true),
    page: z.string().trim().regex(/^\/[a-z0-9/_-]*$/i).max(100),
    submissionId: z.string().uuid(),
    // Honeypot. It is accepted only so spam can receive an indistinguishable
    // acknowledgement without creating a document.
    website: z.string().trim().max(200).optional().default(""),
  })
  .strict()
  .refine((value) => value.loanAmount < value.propertyValue, {
    path: ["loanAmount"],
    message: "Loan amount must be below property value",
  });

export type LeadSubmission = z.infer<typeof LeadSubmissionSchema>;

type PublicLead = Omit<LeadSubmission, "website">;
type PersistLead = (lead: PublicLead) => Promise<void>;
type NotifyLead = (lead: PublicLead) => Promise<void>;
type MarkLeadNotification = (
  submissionId: string,
  status: "delivered" | "failed",
) => Promise<void>;

export interface LeadsRouterOptions {
  allowedOrigins: readonly string[];
  persistLead?: PersistLead;
  notifyLead?: NotifyLead;
  markLeadNotification?: MarkLeadNotification;
}

const LEAD_BODY_LIMIT_BYTES = 8 * 1024;
const ACCEPTED_RESPONSE = Object.freeze({ accepted: true });
const LEAD_NOTIFICATION_TIMEOUT_MS = 8_000;

function leadDocument(submissionId: string) {
  return getAdminFirestore().collection("leads").doc(submissionId);
}

function defaultPersistLead(lead: PublicLead): Promise<void> {
  return getAdminFirestore()
    .collection("leads")
    .doc(lead.submissionId)
    .set({
      ...lead,
      // Server-owned audit metadata. The client cannot choose or backdate it.
      contactConsentAt: FieldValue.serverTimestamp(),
      consentPolicyVersion: "2026-07",
      notificationStatus: "pending",
      submittedAt: FieldValue.serverTimestamp(),
      source: "public-preliminary-loan-request-v1",
      status: "notification_pending",
    }, { merge: true })
    .then(() => undefined);
}

function defaultMarkLeadNotification(
  submissionId: string,
  status: "delivered" | "failed",
): Promise<void> {
  return leadDocument(submissionId)
    .set({
      notificationStatus: status,
      notificationUpdatedAt: FieldValue.serverTimestamp(),
      status: status === "delivered" ? "new" : "notification_failed",
    }, { merge: true })
    .then(() => undefined);
}

export interface LeadWebhookConfig {
  endpoint: string;
  bearerToken: string;
}

export function readLeadWebhookConfig(
  environment: NodeJS.ProcessEnv = process.env,
): LeadWebhookConfig | null {
  const endpoint = environment.LEAD_NOTIFICATION_WEBHOOK_URL?.trim();
  const bearerToken = environment.LEAD_NOTIFICATION_WEBHOOK_TOKEN?.trim();

  if (!endpoint && !bearerToken) return null;
  if (!endpoint || !bearerToken) {
    throw new Error("Lead notification webhook configuration is incomplete");
  }

  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    throw new Error("Lead notification webhook URL is invalid");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error("Lead notification webhook URL must be a credential-free HTTPS URL");
  }

  if (bearerToken.length < 16 || bearerToken.length > 512) {
    throw new Error("Lead notification webhook token is invalid");
  }

  return { endpoint: parsed.toString(), bearerToken };
}

export function createWebhookLeadNotifier(
  config: LeadWebhookConfig,
  fetchImpl: typeof fetch = fetch,
): NotifyLead {
  return async (lead) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LEAD_NOTIFICATION_TIMEOUT_MS);

    try {
      const response = await fetchImpl(config.endpoint, {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${config.bearerToken}`,
          "content-type": "application/json",
          "idempotency-key": lead.submissionId,
          "x-greenstreet-event": "lead.created.v1",
        },
        body: JSON.stringify({
          event: "lead.created.v1",
          id: lead.submissionId,
          occurredAt: new Date().toISOString(),
          lead,
        }),
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Lead notification webhook rejected delivery");
      }
    } finally {
      clearTimeout(timeout);
    }
  };
}

function hasTrustedOrigin(req: Request, allowedOrigins: readonly string[]): boolean {
  const origin = req.get("origin");
  return Boolean(origin && allowedOrigins.includes(origin) && req.get("sec-fetch-site") !== "cross-site");
}

function invalidRequest(res: Response) {
  // Keep the response stable: field-level validation details help automated
  // probing and do not improve this guided form's UX.
  res.status(400).json({ error: "Invalid lead submission" });
}

/**
 * A public, browser-only lead intake router. It does not rely on CORS headers
 * alone: CORS prevents reading a response but does not stop a hostile site
 * from sending a request, so the Origin is enforced before parsing/writing.
 */
export function createLeadsRouter({
  allowedOrigins,
  persistLead = defaultPersistLead,
  notifyLead,
  markLeadNotification = defaultMarkLeadNotification,
}: LeadsRouterOptions): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    if (allowedOrigins.length === 0) {
      res.status(503).json({ error: "Lead intake is temporarily unavailable" });
      return;
    }

    if (!hasTrustedOrigin(req, allowedOrigins)) {
      res.status(403).json({ error: "Request origin is not allowed" });
      return;
    }

    const contentLengthHeader = req.get("content-length");
    const contentLength = contentLengthHeader === undefined
      ? undefined
      : Number(contentLengthHeader);
    if (
      (contentLength !== undefined && (!Number.isFinite(contentLength) || contentLength < 0)) ||
      (contentLength !== undefined && contentLength > LEAD_BODY_LIMIT_BYTES)
    ) {
      invalidRequest(res);
      return;
    }

    if (!req.is("application/json")) {
      res.status(415).json({ error: "Content-Type must be application/json" });
      return;
    }

    if (Buffer.byteLength(JSON.stringify(req.body ?? null), "utf8") > LEAD_BODY_LIMIT_BYTES) {
      invalidRequest(res);
      return;
    }

    const parsed = LeadSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      invalidRequest(res);
      return;
    }

    const { website, ...lead } = parsed.data;
    if (website !== "") {
      // Do not reveal the honeypot or create a record. This response matches a
      // successful submission intentionally, which reduces feedback to bots.
      res.status(202).json(ACCEPTED_RESPONSE);
      return;
    }

    if (!notifyLead) {
      res.status(503).json({ error: "Lead intake is temporarily unavailable" });
      return;
    }

    try {
      await persistLead(lead);
      try {
        await notifyLead(lead);
      } catch (error) {
        try {
          await markLeadNotification(lead.submissionId, "failed");
        } catch {
          logger.error(
            { errorName: "NotificationStatusError", route: "lead-intake" },
            "Lead notification failure status could not be recorded",
          );
        }
        throw error;
      }
      await markLeadNotification(lead.submissionId, "delivered");
      // Never return a Firestore id or a calculated/financial result snapshot.
      res.status(202).json(ACCEPTED_RESPONSE);
    } catch (error) {
      // Do not pass this to the global handler: its generated request id is
      // useful for general API calls but unnecessary public metadata here.
      // Do not log the full SDK error either: provider errors can include
      // request context, and an intake route must never risk logging lead PII.
      logger.error(
        { errorName: error instanceof Error ? error.name : "UnknownError", route: "lead-intake" },
        "Lead intake persistence failed",
      );
      res.status(503).json({ error: "Lead intake is temporarily unavailable" });
    }
  });

  return router;
}
