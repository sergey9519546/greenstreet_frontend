// ============================================================
// PROPERTY INSURANCE AUTO-ESTIMATE
// ============================================================
// IMPROVE_TAX_INSURANCE_AUTO_ESTIMATION.md §8 — a state base-rate model so the
// DSCR calculator can pre-fill a realistic premium instead of a flat guess.
// Insurance has more DSCR impact per dollar than the interest rate, and
// investors systematically underestimate it (behavioral overoptimism). No API:
// a static per-$1,000 state table (NAIC/Bankrate-sourced) × coverage × factors.

/** Annual premium per $1,000 of dwelling coverage, by state. */
export const INSURANCE_BASE_RATE_PER_1000: Record<string, number> = {
  FL: 10.0, LA: 8.5, TX: 6.5, OK: 6.0, MS: 5.5, AL: 5.0, SC: 5.0, GA: 4.5,
  CO: 4.5, CA: 3.5, AZ: 3.0, NC: 4.0, NY: 2.5, NJ: 2.5, PA: 2.0, OH: 1.75,
  IN: 1.75, MI: 1.75, IL: 2.0, WI: 1.5, MN: 1.5, OR: 1.5, WA: 1.5, UT: 1.75,
  TN: 3.0, MO: 3.5, VA: 2.0, MD: 2.5, NV: 2.5, NM: 2.0, ID: 1.75, MT: 2.0,
  WY: 1.75, ND: 1.5, SD: 1.5, NE: 2.0, KS: 2.5, AR: 3.5, KY: 2.0, WV: 2.0,
  CT: 2.5, RI: 2.5, MA: 2.5, NH: 1.75, VT: 1.25, ME: 1.5, DE: 2.0, DC: 2.5,
  HI: 3.5, AK: 2.0,
};

const FLOOD_MULTIPLIER: Record<string, number> = {
  A: 1.15, AE: 1.15, AO: 1.15, AH: 1.15, A1: 1.15, A99: 1.1,
  V: 1.25, VE: 1.25, B: 1.05, X: 1.0, C: 1.0, D: 1.1,
};

export interface InsuranceEstimateOpts {
  isInvestor?: boolean;   // investment property surcharge (default true here)
  yearBuilt?: number;     // age factor
  floodZone?: string;     // FEMA zone, if known
}

/**
 * Estimated annual homeowners/hazard premium.
 * @param state            2-letter code
 * @param dwellingCoverage replacement / property value used as coverage basis
 */
export function estimateAnnualInsurance(
  state: string,
  dwellingCoverage: number,
  opts: InsuranceEstimateOpts = {},
): number {
  if (dwellingCoverage <= 0) return 0;
  const baseRate = INSURANCE_BASE_RATE_PER_1000[(state || '').toUpperCase()] ?? 3.5; // national avg fallback
  let premium = (dwellingCoverage / 1000) * baseRate;

  // Investment property surcharge (25–50%; midpoint). Default on — DSCR deals
  // are non-owner-occupied.
  if (opts.isInvestor !== false) premium *= 1.35;

  if (opts.floodZone) premium *= FLOOD_MULTIPLIER[opts.floodZone.toUpperCase()] ?? 1.0;

  if (opts.yearBuilt) {
    const age = new Date().getFullYear() - opts.yearBuilt;
    if (age > 40) premium *= 1.15;
    else if (age > 25) premium *= 1.1;
    else if (age < 10) premium *= 0.95;
  }
  return Math.round(premium);
}

/** Effective annual rate as a % of coverage — handy for display ("≈X%/yr"). */
export function insuranceRatePctOfValue(state: string, opts: InsuranceEstimateOpts = {}): number {
  const annual = estimateAnnualInsurance(state, 100_000, opts);
  return Math.round((annual / 100_000) * 1000) / 10; // % to 1dp
}
