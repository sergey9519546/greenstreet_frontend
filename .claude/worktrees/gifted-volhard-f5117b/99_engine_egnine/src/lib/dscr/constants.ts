// ============================================================================
// DSCR ENGINE — SHARED CONSTANTS
// ============================================================================
// v12 (P2-batch-A): Centralized magic numbers. Every value here was previously
// hardcoded in one or more files. Keep this file small and focused — only
// constants that are referenced from multiple files, or that have non-obvious
// business meaning, belong here. Single-use literals can stay inline.
// ============================================================================

// --- Borrower credit ---
export const FICO_FLOOR_SUBPRIME = 580;      // kill-criteria: below this = automatic kill
export const FICO_FLOOR_NEAR_PRIME = 620;    // kill-criteria: below this requires extra docs
export const FICO_PREFERRED_TIER = 680;      // lender.ts: below this triggers 1.1x DSCR + 9mo reserves
export const FICO_DEFAULT_MIN_MATCH = 660;   // lender-matching: default min FICO when lender has none

// --- LTV / DSCR thresholds ---
export const LTV_HIGH_BAND = 75;             // % — above this triggers 1.1x DSCR + 9mo reserves
export const LTV_CASH_OUT_CAP = 75;          // % — typical cash-out refi cap (was hardcoded in reassessment-insurance)
export const DSCR_MINIMUM = 1.0;             // standard DSCR floor
export const DSCR_NO_RATIO_FLOOR = 0.75;     // kill-criteria: below this = automatic kill
export const DSCR_PREFERRED = 1.25;          // hits preferred pricing tier
export const DSCR_HIGH_BAND = 1.1;           // cash-out / STR / FICO < 680 / LTV > 75
export const RATE_CUSHION_WARNING = 0.50;    // % — below this cushion = flag for rate lock
export const RESERVES_MINIMUM_MONTHS = 3;    // kill-criteria: below this = automatic kill
export const LTV_STANDARD_MAX = 80;          // % — standard max LTV
export const LTV_STR_CAP = 75;               // % — STR/condotel LTV cap
export const LTV_DECLINING_MARKET_CAP = 75;  // % — declining-market state overlay cap

// --- Reserves ---
export const RESERVES_STANDARD_MONTHS = 6;
export const RESERVES_STRICT_MONTHS = 9;
export const RESERVES_CAP_MONTHS = 12;       // reserves.ts cap — silently enforces max 12mo

// --- Cost ratios ---
export const CLOSING_COSTS_PCT = 0.015;      // 1.5% of purchase price (engine, investor, scoring)
export const SALE_COSTS_DEFAULT_PCT = 6;     // % of exit value
export const SELLING_COSTS_DEFAULT_PCT = 0.06;

// --- Rate anchors / LLPA bounds ---
export const RATE_GUESS_INITIAL = 7.0;       // solvers: initial rate guess for bisection
export const RATE_LOWER_BOUND = 3.0;         // solvers: hard lower bound
export const RATE_UPPER_BOUND = 25.0;        // solvers: hard upper bound
export const RATE_PRICING_CEILING = 12.0;    // lender: adjusted rate above this triggers restructure warning

// --- LLPA adjustment amounts ---
export const ARM_PREMIUM_BPS = 12.5;         // bps — was hardcoded in lender-matching (now uses LLPA.ARM_PREMIUM)
export const STATE_TAX_FALLBACK_PCT = 1.1;   // state-overlays: national avg property tax rate

// --- IRR / cash flow solvers ---
export const IRR_BOUND_LOW = -0.50;          // engine: solveSimpleIrr lower bound (handles negative IRR)
export const IRR_BOUND_HIGH = 1.00;          // engine: solveSimpleIrr upper bound
export const IRR_CONVERGENCE_THRESHOLD = 0.01;

// --- Stress / runway ---
export const RUNWAY_INFINITE_SENTINEL = 9999;  // stress.ts, scoring.ts: legacy sentinel for infinite runway
                                                // Prefer Number.isFinite(Number.POSITIVE_INFINITY) check.

// --- Pricing score tiers (scoring.ts) ---
export const PRICING_TIERS = [
  { maxRate: 6.5, points: 25 },
  { maxRate: 7.0, points: 18 },
  { maxRate: 7.5, points: 10 },
  { maxRate: 8.0, points: 0 },
  { maxRate: 8.5, points: -10 },
  { maxRate: Infinity, points: -20 },
] as const;

// --- Lender matching thresholds (lender-matching.ts) ---
export const FLEX_LENDER_MAX_DSCR = 0.75;    // flex lenders accept DSCR as low as 0.75
export const FLEX_LENDER_MIN_LTV = 80;       // % — flex lenders go to 80% LTV
export const RATE_COMPETITIVE_THRESHOLD_BPS = -12.5;  // base rate adjustment at or below this = rate-competitive

// --- BRRRR / rehab ---
export const BRRRR_CASH_OUT_LTV = 75;        // % — typical BRRRR cash-out refi LTV cap

// --- Engine versioning ---
export const LENDER_DATA_VERSION = '2026-06-17';

// --- Compliance ---
export const HIGH_COST_TEST_RATE_THRESHOLD = 7.5;  // % — above this, high-cost test may be required

// --- State income tax rates (top marginal, 2026 approx) ---
// v13: Used for §1031 exchange analysis. 0 = no state income tax (FL/TX/WA/NV/etc).
export const STATE_INCOME_TAX_RATE: Record<string, number> = {
  AL: 5.0, AK: 0, AZ: 2.5, AR: 3.9, CA: 13.3, CO: 4.4, CT: 6.99, DE: 6.6,
  FL: 0, GA: 5.49, HI: 11.0, ID: 5.8, IL: 4.95, IN: 3.05, IA: 5.7, KS: 5.7,
  KY: 4.0, LA: 3.0, ME: 7.15, MD: 5.75, MA: 9.0, MI: 4.25, MN: 9.85, MS: 5.0,
  MO: 4.8, MT: 5.9, NE: 6.64, NV: 0, NH: 0, NJ: 10.75, NM: 5.9, NY: 10.9,
  NC: 4.5, ND: 2.5, OH: 3.5, OK: 4.75, OR: 9.9, PA: 3.07, RI: 5.99, SC: 6.4,
  SD: 0, TN: 0, TX: 0, UT: 4.65, VT: 8.75, VA: 5.75, WA: 0, DC: 8.95,
  WV: 5.12, WI: 7.65, WY: 0,
};

export function getStateIncomeTaxRate(state: string): number {
  return STATE_INCOME_TAX_RATE[state.toUpperCase()] ?? 5.0; // 5% national avg fallback
}
