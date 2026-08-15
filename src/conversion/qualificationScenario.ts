export type QualificationPurpose = "purchase" | "rate-term" | "cash-out";

/**
 * The only scenario values allowed to cross from a public tool into the
 * qualification flow. This object deliberately has no identity or contact
 * fields and is kept in React memory only.
 */
export type QualificationPropertyType =
  | "sfr"
  | "2-4-unit"
  | "condo"
  | "townhouse"
  | "5-8-unit"
  | "short-term-rental";

export interface QualificationScenarioDraft {
  propertyValue?: number;
  loanAmount?: number;
  rent?: number;
  rate?: number;
  purpose?: QualificationPurpose;
  /**
   * Carried so the homepage hero's property-type answer survives the handoff
   * rather than being asked twice. Same category as `purpose` — a closed enum
   * describing the deal, never anything identifying. Values match
   * LeadSubmissionSchema.propertyType exactly.
   *
   * The hero deliberately does NOT hand off its credit-score answer: its "740+"
   * option straddles two lead bands (720-759 and 760-plus), and guessing would
   * seed a wrong FICO band onto a lending record. The modal asks for it.
   */
  propertyType?: QualificationPropertyType;
}

const PURPOSES = new Set<QualificationPurpose>([
  "purchase",
  "rate-term",
  "cash-out",
]);

const PROPERTY_TYPES = new Set<QualificationPropertyType>([
  "sfr",
  "2-4-unit",
  "condo",
  "townhouse",
  "5-8-unit",
  "short-term-rental",
]);

function boundedNumber(
  value: unknown,
  minimum: number,
  maximum: number,
): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
    ? value
    : undefined;
}

/**
 * Runtime whitelist for the window-level handoff. Callers can be untyped page
 * scripts, so the TypeScript interface alone is not a sufficient PII boundary.
 */
export function sanitizeQualificationScenarioDraft(
  input: unknown,
): QualificationScenarioDraft | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const candidate = input as Record<string, unknown>;
  const draft: QualificationScenarioDraft = {};
  const propertyValue = boundedNumber(candidate.propertyValue, 50_000, 100_000_000);
  const loanAmount = boundedNumber(candidate.loanAmount, 1, 100_000_000);
  const rent = boundedNumber(candidate.rent, 1, 1_000_000);
  const rate = boundedNumber(candidate.rate, 2, 20);

  if (propertyValue !== undefined) draft.propertyValue = propertyValue;
  if (loanAmount !== undefined) draft.loanAmount = loanAmount;
  if (rent !== undefined) draft.rent = rent;
  if (rate !== undefined) draft.rate = rate;
  if (
    typeof candidate.purpose === "string" &&
    PURPOSES.has(candidate.purpose as QualificationPurpose)
  ) {
    draft.purpose = candidate.purpose as QualificationPurpose;
  }
  if (
    typeof candidate.propertyType === "string" &&
    PROPERTY_TYPES.has(candidate.propertyType as QualificationPropertyType)
  ) {
    draft.propertyType = candidate.propertyType as QualificationPropertyType;
  }

  return Object.keys(draft).length > 0 ? draft : null;
}
