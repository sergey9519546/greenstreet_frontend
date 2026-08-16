import { Request, Response, Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminFirestore } from "../services/firebaseAdmin";
import { logger } from "../logger";

const LEAD_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho",
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
    role: z.enum(["investor", "broker", "foreign", "str", "vacation"]).optional(),
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

export type PublicLead = Omit<LeadSubmission, "website">;
type PersistLead = (lead: PublicLead) => Promise<void>;
type RecordLeadDeliveryStatus = (lead: PublicLead) => Promise<unknown>;

interface LeadStore {
  collection(name: string): {
    doc(id: string): {
      create(data: Record<string, unknown>): Promise<unknown>;
    };
  };
}

interface LeadDeliveryStore {
  collection(name: string): {
    doc(id: string): {
      create(data: Record<string, unknown>): Promise<unknown>;
    };
  };
}

export interface LeadDeliveryOutcome {
  status: "not_configured" | "existing" | "delivered" | "failed";
}

export interface LeadDeliveryFactoryOptions {
  store?: LeadDeliveryStore;
  /** Injectable for tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** Injectable for tests. Defaults to process.env. */
  env?: NodeJS.ProcessEnv;
}

/**
 * A webhook that has not returned within this budget is treated as failed.
 *
 * The delivery call is awaited rather than fired and forgotten: on a serverless
 * host the instance can be frozen the moment the response is flushed, so an
 * un-awaited request is not guaranteed to leave the machine. Awaiting makes it
 * reliable; the timeout is what stops a slow endpoint from holding the intake
 * 202 open. The lead is already durably stored either way — see
 * persistLeadIdempotently, which runs first and owns the intake contract.
 */
const WEBHOOK_TIMEOUT_MS = 2_500;

export interface LeadsRouterOptions {
  allowedOrigins: readonly string[];
  persistLead?: PersistLead;
  recordDeliveryStatus?: RecordLeadDeliveryStatus;
}

const LEAD_BODY_LIMIT_BYTES = 8 * 1024;
const ACCEPTED_RESPONSE = Object.freeze({ accepted: true });

function isAlreadyExists(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  const code = (error as { code?: unknown }).code;
  return code === 6 || code === "6" || code === "already-exists" || code === "ALREADY_EXISTS";
}

export async function persistLeadIdempotently(
  lead: PublicLead,
  store: LeadStore = getAdminFirestore(),
): Promise<void> {
  try {
    await store
      .collection("leads")
      .doc(lead.submissionId)
      .create({
        ...lead,
        // Server-owned audit metadata. The client cannot choose or backdate it.
        contactConsentAt: FieldValue.serverTimestamp(),
        consentPolicyVersion: "2026-07",
        submittedAt: FieldValue.serverTimestamp(),
        source: "public-scenario-review-v1",
        status: "new",
      });
  } catch (error) {
    // Firestore create() is atomic. A retry using the same UUID therefore
    // acknowledges the original record without duplicating or overwriting it.
    if (isAlreadyExists(error)) return;
    throw error;
  }
}

/**
 * Records the truthful storage-only delivery state in a separate document.
 * Creating the recorder does not initialize Firebase, so `/health` remains
 * independent from lead persistence and any future delivery integration.
 */
export function createStorageOnlyLeadDeliveryRecorder(
  options: LeadDeliveryFactoryOptions = {},
): (lead: PublicLead) => Promise<LeadDeliveryOutcome> {
  return async (lead) => {
    const store = options.store ?? getAdminFirestore();
    try {
      await store
        .collection("leadDelivery")
        .doc(lead.submissionId)
        .create({
          attemptCount: 0,
          channel: "none",
          status: "not_configured",
          updatedAt: FieldValue.serverTimestamp(),
        });
      return { status: "not_configured" };
    } catch (error) {
      // A retry must never reset a later/manual delivery result. Firestore's
      // atomic create preserves whichever status already owns this UUID.
      if (isAlreadyExists(error)) return { status: "existing" };
      throw error;
    }
  };
}

/**
 * Resolves the operator-configured webhook, or null when delivery is off.
 *
 * The URL comes from the environment, never from a request, so this is not an
 * SSRF surface. It is still validated: an http:// endpoint would put borrower
 * PII on the wire in clear text, and embedded credentials would be logged by
 * every proxy in the path.
 */
function resolveWebhook(env: NodeJS.ProcessEnv): { url: string; token?: string } | null {
  const raw = env.LEAD_DELIVERY_WEBHOOK_URL?.trim();
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    logger.error(
      { route: "lead-intake", stage: "delivery-config" },
      "LEAD_DELIVERY_WEBHOOK_URL is not a valid URL; lead delivery is disabled",
    );
    return null;
  }

  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    logger.error(
      { route: "lead-intake", stage: "delivery-config", protocol: parsed.protocol },
      "LEAD_DELIVERY_WEBHOOK_URL must be https and carry no credentials; lead delivery is disabled",
    );
    return null;
  }

  return { url: parsed.toString(), token: env.LEAD_DELIVERY_WEBHOOK_TOKEN?.trim() || undefined };
}

/**
 * Delivers the lead to the operator's webhook and records the outcome.
 *
 * Falls back to the storage-only recorder when no webhook is configured, so an
 * unconfigured deployment behaves exactly as it did before this existed.
 *
 * Works with anything that accepts a JSON POST — Slack, Make, n8n, Zapier, or a
 * bespoke endpoint. The lead is sent as-is because routing it to a human IS the
 * configured purpose; note that this necessarily sends borrower PII to whatever
 * host the operator names, which is why the https check above is not optional.
 */
export function createLeadDeliveryRecorder(
  options: LeadDeliveryFactoryOptions = {},
): (lead: PublicLead) => Promise<LeadDeliveryOutcome> {
  const env = options.env ?? process.env;
  const webhook = resolveWebhook(env);
  if (!webhook) return createStorageOnlyLeadDeliveryRecorder(options);

  const doFetch = options.fetchImpl ?? fetch;

  return async (lead) => {
    let delivered = false;
    try {
      const response = await doFetch(webhook.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(webhook.token ? { authorization: `Bearer ${webhook.token}` } : {}),
        },
        body: JSON.stringify({ type: "lead.created", lead }),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });
      delivered = response.ok;
      if (!response.ok) {
        // Status only. A webhook error body can echo back the payload we just
        // sent it, which is the borrower PII this route exists to protect.
        logger.warn(
          { route: "lead-intake", stage: "delivery", status: response.status },
          "Lead delivery webhook returned a non-2xx status",
        );
      }
    } catch (error) {
      logger.warn(
        {
          route: "lead-intake",
          stage: "delivery",
          errorName: error instanceof Error ? error.name : "UnknownError",
        },
        "Lead delivery webhook did not complete",
      );
    }

    const store = options.store ?? getAdminFirestore();
    try {
      await store
        .collection("leadDelivery")
        .doc(lead.submissionId)
        .create({
          attemptCount: 1,
          channel: "webhook",
          status: delivered ? "delivered" : "failed",
          updatedAt: FieldValue.serverTimestamp(),
        });
      return { status: delivered ? "delivered" : "failed" };
    } catch (error) {
      // Same reasoning as the storage-only recorder: an atomic create means a
      // retry of the same UUID never overwrites a later or manually-set result.
      if (isAlreadyExists(error)) return { status: "existing" };
      throw error;
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
  persistLead = persistLeadIdempotently,
  recordDeliveryStatus,
}: LeadsRouterOptions): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    // Intake payloads include contact and financial context. Prevent caches
    // from retaining either success or failure responses.
    res.set("Cache-Control", "no-store");

    if (allowedOrigins.length === 0) {
      res.status(503).json({ error: "Lead intake is temporarily unavailable" });
      return;
    }

    if (!hasTrustedOrigin(req, allowedOrigins)) {
      res.status(403).json({ error: "Request origin is not allowed" });
      return;
    }

    // Query strings routinely end up in proxy/browser history and logs. This
    // endpoint accepts its bounded payload only in the JSON body.
    if (req.originalUrl.includes("?")) {
      invalidRequest(res);
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
      if (recordDeliveryStatus) {
        try {
          await recordDeliveryStatus(lead);
        } catch (error) {
          // Persistence is the intake contract. Delivery metadata is separate
          // and must not turn a stored lead into a false "not received"
          // response that encourages a new UUID/document.
          logger.warn(
            {
              errorName: error instanceof Error ? error.name : "UnknownError",
              route: "lead-intake",
              stage: "delivery-status",
            },
            "Lead stored but delivery status could not be recorded",
          );
        }
      }
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
