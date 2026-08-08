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
  "West Virginia", "Wisconsin", "Wyoming",
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
    role: z.enum(["investor", "foreign", "str", "vacation"]).optional(),
    timeline: z.enum(["exploring", "under-30", "30-90", "refi-soon"]),
    propertyType: z.enum(["sfr", "2-4-unit", "condo", "townhouse", "5-8-unit", "short-term-rental"]),
    propertyValue: z.number().finite().min(50_000).max(100_000_000),
    loanAmount: z.number().finite().positive().max(100_000_000),
    rent: z.number().finite().positive().max(1_000_000),
    rate: z.number().finite().min(2).max(20),
    purpose: z.enum(["purchase", "rate-term", "cash-out"]).optional().default("purchase"),
    state: z.enum(LEAD_STATES),
    ficoBand: z.enum(["under-680", "680-719", "720-759", "760-plus"]),
    borrowerType: z.enum(["individual", "entity"]),
    experience: z.enum(["0", "1-3", "4-9", "10-plus"]),
    investmentConfirmed: z.literal(true),
    contactConsent: z.literal(true),
    page: z.string().trim().regex(/^\/[a-z0-9/_-]*$/i).max(100),
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

type PersistLead = (lead: Omit<LeadSubmission, "website">) => Promise<void>;

export interface LeadsRouterOptions {
  allowedOrigins: readonly string[];
  persistLead?: PersistLead;
}

const LEAD_BODY_LIMIT_BYTES = 8 * 1024;
const ACCEPTED_RESPONSE = Object.freeze({ accepted: true });

function defaultPersistLead(lead: Omit<LeadSubmission, "website">): Promise<void> {
  return getAdminFirestore()
    .collection("leads")
    .add({
      ...lead,
      // Server-owned audit metadata. The client cannot choose or backdate it.
      contactConsentAt: FieldValue.serverTimestamp(),
      consentPolicyVersion: "2026-07",
      submittedAt: FieldValue.serverTimestamp(),
      source: "public-scenario-review-v1",
      status: "new",
    })
    .then(() => undefined);
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
export function createLeadsRouter({ allowedOrigins, persistLead = defaultPersistLead }: LeadsRouterOptions): Router {
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

    try {
      await persistLead(lead);
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
