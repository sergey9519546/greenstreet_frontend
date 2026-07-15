/**
 * qualify() — deterministic, explainable preliminary DSCR qualification engine.
 *
 * Pure (no deps). All thresholds live in QUALIFY_POLICY so product can tune
 * without code spelunking. Powers the "See If You Qualify" modal result:
 * LTV, PITIA, DSCR, min-rent, outcome, reasons, and improvement levers.
 *
 * NOT a credit decision or commitment to lend — preliminary estimate only.
 */

export type Purpose = "purchase" | "rate-term" | "cash-out";
export type PropertyType =
  | "sfr" | "2-4-unit" | "condo" | "townhouse" | "5-8-unit" | "short-term-rental";
export type FicoBand =
  | "under-660" | "660-679" | "680-719" | "720-759" | "760-plus";
export type BorrowerType = "individual" | "entity";
export type Outcome =
  | "likely-qualifies" | "borderline" | "requires-review" | "not-currently" | "ineligible";
export type DscrBand = "strong" | "standard" | "borderline" | "sub1" | "low";

export interface QualifyInput {
  propertyType: PropertyType;
  purpose: Purpose;
  state?: string;
  value: number;
  loanAmount: number;
  rent: number;
  taxesAnnual?: number;
  insuranceAnnual?: number;
  hoaMonthly?: number;
  otherMonthly?: number;
  ficoBand: FicoBand;
  borrowerType?: BorrowerType;
  investmentConfirmed?: boolean;
  rentEstimated?: boolean;
  /** PPP tier for the state (0 ok … 3 banned), from the shared SPECIAL data. */
  stateTier?: number;
}

export interface Lever {
  id: string;
  label: string;
  projectedDscr: number;
  detail: string;
}

export interface QualifyResult {
  ltv: number;
  rateLow: number;
  rateHigh: number;
  piMonthly: number;
  taxesM: number;
  insM: number;
  hoaM: number;
  otherM: number;
  pitia: number;
  dscr: number;
  dscrBand: DscrBand;
  minRentStandard: number; // rent needed for 1.10 DSCR
  minRentFloor: number; // rent needed for 1.00 DSCR
  rentGap: number; // extra rent needed to reach standard (0 if already there)
  outcome: Outcome;
  reasons: string[];
  levers: Lever[];
  needsHumanReview: boolean;
}

// ── Policy (single source of truth for tunable thresholds) ───────────────────
export const QUALIFY_POLICY = {
  baseRate: 0.0725, // illustrative base note rate
  rateClamp: { min: 0.06, max: 0.12 },
  ltvCap: { purchase: 0.8, "rate-term": 0.8, "cash-out": 0.75 } as Record<Purpose, number>,
  ltvCapSlack: 0.05, // within cap+slack → review, not hard-fail
  taxFactor: 0.012, // annual taxes as % of value when not provided
  insFactor: 0.005, // annual insurance as % of value when not provided
  dscr: { strong: 1.25, standard: 1.1, borderline: 1.0, sub1: 0.75 },
  eligibleTypes: ["sfr", "2-4-unit", "condo", "townhouse"] as PropertyType[],
  reviewTypes: ["5-8-unit", "short-term-rental"] as PropertyType[],
  valueReview: 50000,
  valueWarn: 75000,
  targetStandard: 1.1,
  targetFloor: 1.0,
} as const;

// ── Math helpers ─────────────────────────────────────────────────────────────
const TERM_MONTHS = 360;

function finiteNonNegative(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Monthly principal+interest for a fully-amortizing loan. */
export function amortize(loan: number, annualRate: number, n = TERM_MONTHS): number {
  if (!Number.isFinite(loan) || loan <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isFinite(n) || n <= 0) return 0;
  const i = annualRate / 12;
  if (i === 0) return loan / n;
  const denominator = 1 - Math.pow(1 + i, -n);
  const payment = denominator > 0 ? loan * i / denominator : 0;
  return Number.isFinite(payment) && payment >= 0 ? payment : 0;
}

/** Inverse: loan amount whose P&I equals a target monthly payment. */
export function loanForPayment(payment: number, annualRate: number, n = TERM_MONTHS): number {
  if (!Number.isFinite(payment) || payment <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isFinite(n) || n <= 0) return 0;
  const i = annualRate / 12;
  if (i === 0) return payment * n;
  const principal = payment * (1 - Math.pow(1 + i, -n)) / i;
  return Number.isFinite(principal) && principal >= 0 ? principal : 0;
}

function ficoAdj(b: FicoBand): number {
  switch (b) {
    case "under-660": return 1.5; // also gated out below
    case "660-679": return 1.5;
    case "680-719": return 0.75;
    case "720-759": return 0.25;
    case "760-plus": return 0;
    default: return 1.5;
  }
}

/**
 * Illustrative rate. Excludes the DSCR term when used for P&I (avoids the
 * rate↔DSCR circularity); the DSCR adjustment is added only to the *displayed*
 * range via rateRange().
 */
function ratePI(input: QualifyInput, ltv: number): number {
  const p = QUALIFY_POLICY;
  let r = p.baseRate + ficoAdj(input.ficoBand) / 100;
  if (input.purpose === "cash-out") r += 0.00375;
  if (ltv > 0.8) r += 0.005;
  else if (ltv > 0.75) r += 0.0025;
  return clamp(Number.isFinite(r) ? r : p.rateClamp.max, p.rateClamp.min, p.rateClamp.max);
}

function rateRange(piRate: number, dscr: number): { low: number; high: number } {
  const bounds = QUALIFY_POLICY.rateClamp;
  let r = Number.isFinite(piRate) ? piRate : bounds.max;
  const safeDscr = Number.isFinite(dscr) ? dscr : 0;
  if (safeDscr < 1.0) r += 0.005;
  else if (safeDscr < 1.1) r += 0.0025;
  r = clamp(r, bounds.min, bounds.max);
  // Clamp each endpoint after adding the displayed spread. Previously the
  // high endpoint could exceed the policy ceiling by 25 bps.
  return {
    low: clamp(r - 0.00125, bounds.min, bounds.max),
    high: clamp(r + 0.0025, bounds.min, bounds.max),
  };
}

function classifyDscr(dscr: number): DscrBand {
  const d = QUALIFY_POLICY.dscr;
  if (dscr >= d.strong) return "strong";
  if (dscr >= d.standard) return "standard";
  if (dscr >= d.borderline) return "borderline";
  if (dscr >= d.sub1) return "sub1";
  return "low";
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function qualify(input: QualifyInput): QualifyResult {
  const p = QUALIFY_POLICY;
  const value = finiteNonNegative(input.value);
  const loan = finiteNonNegative(input.loanAmount);
  const rent = finiteNonNegative(input.rent);

  const ltv = value > 0 ? loan / value : 0;
  const piRate = ratePI(input, ltv);
  const piMonthly = amortize(loan, piRate);

  const taxesM = finiteNonNegative(input.taxesAnnual, value * p.taxFactor) / 12;
  const insM = finiteNonNegative(input.insuranceAnnual, value * p.insFactor) / 12;
  const hoaM = finiteNonNegative(input.hoaMonthly);
  const otherM = finiteNonNegative(input.otherMonthly);
  const pitia = piMonthly + taxesM + insM + hoaM + otherM;

  const dscr = pitia > 0 ? rent / pitia : 0;
  const dscrBand = classifyDscr(dscr);
  const fixedCosts = taxesM + insM + hoaM + otherM;

  const minRentStandard = pitia * p.targetStandard;
  const minRentFloor = pitia * p.targetFloor;
  const rentGap = Math.max(0, minRentStandard - rent);

  const { low, high } = rateRange(piRate, dscr);
  const cap = p.ltvCap[input.purpose] ?? p.ltvCap.purchase;

  // ── Outcome decision tree (top→down, first match wins) ────────────────────
  const reasons: string[] = [];
  let outcome: Outcome;
  let needsHumanReview = false;

  const eligibleType = p.eligibleTypes.includes(input.propertyType);
  const reviewType = p.reviewTypes.includes(input.propertyType);
  const ficoBlocked = input.ficoBand === "under-660";

  if (input.investmentConfirmed === false) {
    outcome = "ineligible";
    reasons.push("DSCR loans are for non-owner-occupied investment properties only.");
  } else if (!eligibleType && !reviewType) {
    outcome = "ineligible";
    reasons.push("This property type isn't eligible for standard DSCR financing.");
  } else if (ficoBlocked || dscr < p.dscr.sub1 || ltv > cap + p.ltvCapSlack) {
    outcome = "not-currently";
    if (ficoBlocked) reasons.push("Credit below the 660 program floor.");
    if (dscr < p.dscr.sub1) reasons.push(`DSCR of ${dscr.toFixed(2)} is below program minimums.`);
    if (ltv > cap + p.ltvCapSlack) reasons.push(`LTV of ${(ltv * 100).toFixed(0)}% exceeds the ${(cap * 100).toFixed(0)}% cap.`);
  } else if (
    dscr < p.dscr.borderline ||
    ltv > cap ||
    reviewType ||
    (input.stateTier ?? 0) >= 2 ||
    input.rentEstimated ||
    value < p.valueReview
  ) {
    outcome = "requires-review";
    needsHumanReview = true;
    if (dscr < p.dscr.borderline) reasons.push(`DSCR of ${dscr.toFixed(2)} is below 1.00 — sub-1.0 programs exist and need a specialist.`);
    if (ltv > cap) reasons.push(`LTV of ${(ltv * 100).toFixed(0)}% is just over the ${(cap * 100).toFixed(0)}% cap.`);
    if (reviewType) reasons.push("This property type is reviewed case-by-case.");
    if ((input.stateTier ?? 0) >= 2) reasons.push("This state has investor-loan rules we confirm by hand.");
    if (input.rentEstimated) reasons.push("Rent is estimated — we'll validate it.");
    if (value < p.valueReview) reasons.push("Low property value needs manual review.");
  } else if (dscr < p.dscr.standard || input.ficoBand === "660-679" || ltv > cap - 0.02) {
    outcome = "borderline";
    if (dscr < p.dscr.standard) reasons.push(`DSCR of ${dscr.toFixed(2)} is near the qualifying floor.`);
    if (input.ficoBand === "660-679") reasons.push("Credit is in the entry tier.");
  } else {
    outcome = "likely-qualifies";
    reasons.push("DSCR, LTV, and credit are all within standard guidelines.");
  }

  // ── Improvement levers (recomputed targets) ───────────────────────────────
  const levers: Lever[] = [];

  // Lever 1 — more down payment (lower loan) to reach standard DSCR.
  const targetPI = minRentStandard > 0 ? rent / p.targetStandard - fixedCosts : 0;
  if (rent > 0 && targetPI > 0 && targetPI < piMonthly) {
    const targetLoan = loanForPayment(targetPI, piRate);
    const extraDown = Math.max(0, loan - targetLoan);
    if (extraDown > 500) {
      levers.push({
        id: "down-payment",
        label: "Increase your down payment",
        projectedDscr: p.targetStandard,
        detail: `About $${Math.round(extraDown / 1000)}K more down (loan ~$${Math.round(targetLoan / 1000)}K) lifts your DSCR to ${p.targetStandard.toFixed(2)}.`,
      });
    }
  }

  // Lever 2 — buy the rate down 0.50%.
  const buyRate = Math.max(p.rateClamp.min, piRate - 0.005);
  const buyPI = amortize(loan, buyRate);
  const buyDscr = buyPI + fixedCosts > 0 ? rent / (buyPI + fixedCosts) : 0;
  if (buyDscr > dscr + 0.01) {
    levers.push({
      id: "rate-buydown",
      label: "Buy down the rate",
      projectedDscr: buyDscr,
      detail: `A 0.50% lower rate raises your DSCR to about ${buyDscr.toFixed(2)} (illustrative).`,
    });
  }

  // Lever 3 — higher rent / market-rent support.
  if (rentGap > 0) {
    levers.push({
      id: "rent",
      label: "Support a higher rent",
      projectedDscr: p.targetStandard,
      detail: `About $${Math.round(rentGap)}/mo more rent (to $${Math.round(minRentStandard)}) reaches a ${p.targetStandard.toFixed(2)} DSCR.`,
    });
  }

  // Highest projected DSCR first.
  levers.sort((a, b) => b.projectedDscr - a.projectedDscr);

  return {
    ltv,
    rateLow: low,
    rateHigh: high,
    piMonthly,
    taxesM,
    insM,
    hoaM,
    otherM,
    pitia,
    dscr,
    dscrBand,
    minRentStandard,
    minRentFloor,
    rentGap,
    outcome,
    reasons,
    levers,
    needsHumanReview,
  };
}

// ── Display helpers ──────────────────────────────────────────────────────────
export const OUTCOME_META: Record<Outcome, { label: string; headline: string; color: string }> = {
  "likely-qualifies": { label: "Likely qualifies", headline: "Your deal looks likely to qualify.", color: "#4dbd97" },
  borderline: { label: "Conditional", headline: "You're close — and we can likely get you there.", color: "#006565" },
  "requires-review": { label: "Lender review", headline: "This one needs a human look — and that's normal.", color: "#2f7d8a" },
  "not-currently": { label: "Not currently", headline: "Not quite there today — here's what would change that.", color: "#b8860b" },
  ineligible: { label: "Not a fit", headline: "DSCR isn't the right fit — but we may still help.", color: "#7a7a7a" },
};

export function fmtUsd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}
export function fmtPct(n: number, dp = 0): string {
  return (n * 100).toFixed(dp) + "%";
}
export function fmtRateRange(low: number, high: number): string {
  return `${(low * 100).toFixed(2)}% – ${(high * 100).toFixed(2)}%`;
}
