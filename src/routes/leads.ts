import { Router } from "express";
import type { Response } from "express";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { z } from "zod";

import { logger } from "../logger";
import { StateCodeSchema } from "./schemas";

const normalizedText = (maximum: number, minimum = 1) => z.string()
  .transform((value) => value.trim().replace(/\s+/g, " "))
  .pipe(
    z.string()
      .min(minimum)
      .max(maximum)
      .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), "control characters are not allowed")
  );

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const OptionalEmailSchema = z.preprocess(
  blankToUndefined,
  z.string().trim().toLowerCase().max(254).email().optional()
);

const OptionalPhoneSchema = z.preprocess(
  blankToUndefined,
  z.string()
    .trim()
    .max(30)
    .regex(/^\+?[\d().\-\s]+$/, "phone contains unsupported characters")
    .refine((phone) => {
      const digitCount = phone.replace(/\D/g, "").length;
      return digitCount >= 7 && digitCount <= 15;
    }, "phone must contain between 7 and 15 digits")
    .transform((phone) => `${phone.startsWith("+") ? "+" : ""}${phone.replace(/\D/g, "")}`)
    .optional()
);

const nullableShortText = (maximum = 50) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  normalizedText(maximum).nullable()
);

const QualifySnapshotSchema = z.object({
  ltv: z.number().finite().min(0).max(100),
  pitia: z.number().finite().min(0).max(1_000_000),
  piMonthly: z.number().finite().min(0).max(1_000_000),
  dscr: z.number().finite().min(0).max(20),
  outcome: normalizedText(100),
  reasons: z.array(normalizedText(300)).max(12),
  rateRange: normalizedText(80),
  needsHumanReview: z.boolean(),
}).strict();

const ConsentSchema = z.object({
  contact: z.literal(true, { errorMap: () => ({ message: "contact consent is required" }) }),
  sms: z.boolean(),
  timestamp: z.string().datetime({ offset: true }),
  policyVersion: z.string().regex(/^\d{4}-\d{2}$/),
}).strict();

export const LeadRequestSchema = z.object({
  name: normalizedText(120, 2),
  email: OptionalEmailSchema,
  phone: OptionalPhoneSchema,
  role: z.enum(["investor", "foreign", "str", "vacation"]).nullable(),
  timeline: z.enum(["exploring", "under-30", "30-90", "refi-soon"]).nullable(),
  propertyType: nullableShortText(),
  propertyValue: z.number().finite().min(50_000).max(50_000_000),
  loanAmount: z.number().finite().positive().max(50_000_000),
  rent: z.number().finite().min(0).max(1_000_000),
  rate: z.number().finite().min(0).max(25),
  purpose: z.enum(["purchase", "rate-term", "cash-out"]).nullable(),
  state: StateCodeSchema,
  ficoBand: z.enum(["under-680", "680-719", "720-759", "760-plus"]).nullable(),
  borrowerType: nullableShortText(),
  experience: z.enum(["0", "1-3", "4-9", "10-plus"]).nullable(),
  investmentConfirmed: z.boolean(),
  dscr: z.number().finite().min(0).max(20),
  verdict: normalizedText(300),
  verdictTier: normalizedText(80),
  rateEstimate: normalizedText(80),
  qualify: QualifySnapshotSchema,
  consent: ConsentSchema,
  page: z.string().trim().max(200).regex(/^\/[A-Za-z0-9/_-]*$/),
}).strict().superRefine((lead, context) => {
  if (!lead.email && !lead.phone) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "a valid email or phone number is required",
    });
  }
  if (lead.loanAmount > lead.propertyValue) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["loanAmount"],
      message: "loanAmount cannot exceed propertyValue",
    });
  }
});

type PublicError = {
  status: number;
  code: string;
  message: string;
};

export function leadTransportError(method: string, queryKeys: readonly string[]): PublicError | null {
  if (method.toUpperCase() !== "POST") {
    return {
      status: 405,
      code: "method_not_allowed",
      message: "Lead submissions must use POST. Do not put contact details in the URL.",
    };
  }
  if (queryKeys.length > 0) {
    return {
      status: 400,
      code: "url_data_not_allowed",
      message: "Remove all URL parameters and submit contact details only in the secure form.",
    };
  }
  return null;
}

function requestIdFrom(res: Response): string {
  return typeof res.locals.requestId === "string" ? res.locals.requestId : "unassigned";
}

function sendError(
  res: Response,
  requestId: string,
  error: PublicError,
  issues?: Array<{ field: string; code: string; message: string }>
): void {
  res.status(error.status).json({
    ok: false,
    error: { code: error.code, message: error.message },
    ...(issues ? { issues } : {}),
    requestId,
  });
}

function publicValidationIssues(error: z.ZodError): Array<{ field: string; code: string; message: string }> {
  const seen = new Set<string>();
  const issues: Array<{ field: string; code: string; message: string }> = [];
  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "submission";
    if (seen.has(field)) continue;
    seen.add(field);
    const message = field === "email"
      ? "Enter a valid email address or phone number."
      : field === "consent.contact"
        ? "Confirm that we may contact you."
        : field === "submission"
          ? "Remove unsupported fields and try again."
          : "Check this field and try again.";
    issues.push({ field, code: "invalid_value", message });
  }
  return issues;
}

function firestoreLeadData(value: z.infer<typeof LeadRequestSchema>): Record<string, unknown> {
  return { ...value };
}

function leadCollection() {
  if (getApps().length === 0) initializeApp();
  return getFirestore().collection("leads");
}

export const leadsRouter = Router();

leadsRouter.use("/", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  const transportError = leadTransportError(req.method, Object.keys(req.query));
  if (!transportError) {
    next();
    return;
  }
  if (transportError.status === 405) res.setHeader("Allow", "POST");
  sendError(res, requestIdFrom(res), transportError);
});

leadsRouter.post("/", async (req, res) => {
  const requestId = requestIdFrom(res);
  const parsed = LeadRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn(
      {
        requestId,
        outcome: "rejected",
        reason: "validation_failed",
        issueCount: parsed.error.issues.length,
      },
      "Lead submission rejected"
    );
    sendError(
      res,
      requestId,
      {
        status: 422,
        code: "invalid_lead_submission",
        message: "Some form fields need attention.",
      },
      publicValidationIssues(parsed.error)
    );
    return;
  }

  try {
    await leadCollection().add({
      ...firestoreLeadData(parsed.data),
      submittedAt: FieldValue.serverTimestamp(),
      schemaVersion: 1,
      source: "qualify-modal",
    });
    logger.info({ requestId, outcome: "accepted" }, "Lead submission accepted");
    res.status(201).json({
      ok: true,
      status: "received",
      message: "Your submission was received for review. This is not a loan approval.",
      requestId,
    });
  } catch {
    logger.error(
      {
        requestId,
        outcome: "error",
        errorCode: "lead_store_unavailable",
      },
      "Validated lead could not be stored"
    );
    sendError(res, requestId, {
      status: 503,
      code: "lead_service_unavailable",
      message: "The form is temporarily unavailable. Please try again later.",
    });
  }
});
