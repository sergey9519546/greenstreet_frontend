// Borrower-facing DSCR loan math — pure, client-side, instant.
// Pricing anchored to UNIFIED_HUB.md §1.5g (verified pricing by profile, June 2026)
// and §1.5h (pricing leverage order). These are ESTIMATES for marketing tools,
// not loan commitments. The deterministic engine (/api/dscr/*) is the source of
// truth for a real quote.

export interface PitiaInputs {
  loanAmount: number;
  annualRatePct: number;   // e.g. 7.0
  termYears?: number;      // default 30
  annualTaxes?: number;
  annualInsurance?: number;
  monthlyHoa?: number;
  interestOnly?: boolean;
}

/** Standard amortizing payment factor: factor(r) = r(1+r)^n / ((1+r)^n - 1). */
export function paymentFactor(annualRatePct: number, termYears = 30): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return 1 / n;
  const g = Math.pow(1 + r, n);
  return (r * g) / (g - 1);
}

/** Principal & interest (or interest-only) for a loan. */
export function monthlyPI(loanAmount: number, annualRatePct: number, termYears = 30, interestOnly = false): number {
  if (interestOnly) return loanAmount * (annualRatePct / 100 / 12);
  return loanAmount * paymentFactor(annualRatePct, termYears);
}

/** Full PITIA (P&I + taxes + insurance + HOA), monthly. */
export function pitia(i: PitiaInputs): number {
  const pi = monthlyPI(i.loanAmount, i.annualRatePct, i.termYears ?? 30, i.interestOnly);
  const taxes = (i.annualTaxes ?? 0) / 12;
  const ins = (i.annualInsurance ?? 0) / 12;
  const hoa = i.monthlyHoa ?? 0;
  return pi + taxes + ins + hoa;
}

/** DSCR = qualifying rent / PITIA. */
export function dscr(monthlyRent: number, monthlyPitia: number): number {
  if (monthlyPitia <= 0) return 0;
  return monthlyRent / monthlyPitia;
}

export type DscrVerdict = "STRONG" | "QUALIFIES" | "MARGINAL" | "TIGHT" | "DECLINE";
export function dscrVerdict(d: number): DscrVerdict {
  if (d >= 1.25) return "STRONG";
  if (d >= 1.1) return "QUALIFIES";
  if (d >= 1.0) return "MARGINAL";
  if (d >= 0.75) return "TIGHT";
  return "DECLINE";
}

export interface RateInputs {
  fico: number;
  ltvPct: number;        // loan / price * 100
  dscr: number;
  units?: number;        // 1 = SFR
  shortTermRental?: boolean;
  interestOnly?: boolean;
  noPrepayPenalty?: boolean;
}

export interface RateEstimate {
  low: number;
  high: number;
  mid: number;
  note: string;
}

/**
 * Estimate a DSCR rate range from borrower profile.
 * Base tiers from UNIFIED_HUB §1.5g; adjustments from §1.5h.
 */
export function estimateRate(i: RateInputs): RateEstimate {
  let low: number, high: number, note: string;

  // Base tier by FICO (the dominant axis, §1.5h)
  if (i.fico >= 740) { low = 6.0; high = 6.625; note = "Best-tier pricing"; }
  else if (i.fico >= 720) { low = 6.375; high = 7.125; note = "Strong profile"; }
  else if (i.fico >= 680) { low = 7.125; high = 7.875; note = "Standard profile"; }
  else if (i.fico >= 660) { low = 7.75; high = 8.75; note = "Moderate profile"; }
  else { low = 8.75; high = 9.5; note = "Specialty pricing"; }

  let add = 0;
  // LTV step (§1.5h: ~0.125–0.25 per 5% above 75)
  if (i.ltvPct > 75) add += Math.min(0.5, ((i.ltvPct - 75) / 5) * 0.1875);
  // Thin DSCR surcharge (§1.5g)
  if (i.dscr < 1.0) add += 0.625;
  else if (i.dscr < 1.15) add += 0.375;
  else if (i.dscr < 1.25) add += 0.125;
  // Property / product adjustments (§1.5g)
  if ((i.units ?? 1) >= 2) add += 0.25;
  if (i.shortTermRental) add += 0.375;
  if (i.noPrepayPenalty) add += 0.65;
  if (i.interestOnly) add += 0.25;

  low += add; high += add;
  return { low: round3(low), high: round3(high), mid: round3((low + high) / 2), note };
}

/** Max loan that still hits a target DSCR at a given rate. */
export function maxLoanForDscr(monthlyRent: number, targetDscr: number, annualRatePct: number, monthlyEscrow = 0, termYears = 30): number {
  // rent / (P&I + escrow) = targetDscr  →  P&I = rent/targetDscr - escrow
  const allowedPI = monthlyRent / targetDscr - monthlyEscrow;
  if (allowedPI <= 0) return 0;
  return allowedPI / paymentFactor(annualRatePct, termYears);
}

/** Cash to close estimate. */
export function cashToClose(price: number, downPct: number, closingCostPct = 3): number {
  return price * (downPct / 100) + price * (closingCostPct / 100);
}

/** Capitalization rate = NOI / price. */
export function capRate(annualRent: number, annualExpenses: number, price: number): number {
  if (price <= 0) return 0;
  return ((annualRent - annualExpenses) / price) * 100;
}

export function round3(n: number): number { return Math.round(n * 1000) / 1000; }
export function money(n: number): string { return `$${Math.round(n).toLocaleString()}`; }
export function pct(n: number, dp = 2): string { return `${n.toFixed(dp)}%`; }
