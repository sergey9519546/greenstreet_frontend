// ============================================================
// DSCR Loan Command Center v7.0 — Reserve Forecast Engine
// Three-Scenario Output: Likely / Conservative / Stress Ceiling
// Tiered base (not additive), selective overlays, 12-month cap
// ============================================================

import type {
  BorrowerProfile,
  LoanStructure,
  RentalStrategy,
  ReserveScenarios,
  ReserveCalculation,
  ReserveAdjustment,
  ReserveAsset,
  AssetHaircutResult,
  GeographyOverlay,
  ProvenanceLabel,
  ReserveAssetType,
} from './types';

// --- Scenario ceiling ---
// Audit requirement #3: "Capped at 12 months maximum (no scenario exceeds 12)."
// All three scenarios (likely/conservative/stress) are clipped to 12 months.
const RESERVE_CAP = 12;

// ============================================================
// TIERED BASE — not additive; determined solely by DSCR tier
// ============================================================
// Per audit spec #2: "Tiered base by DSCR (3-6-9-12 months based on DSCR tier)"
//   DSCR ≥ 1.25       → range 3-6 months    (Likely 3, Conservative 6, Stress 9)
//   DSCR 1.00 – 1.24  → range 6-9 months    (Likely 6, Conservative 9, Stress 12)
//   DSCR 0.75 – 0.99  → range 9-12 months   (Likely 9, Conservative 12, Stress 12 capped)
//   DSCR < 0.75       → 12 months           (Likely 12, Conservative 12, Stress 12 all capped)
//
// Geography/STR/FICO/foreign/LTV overlays are applied to Conservative
// and Stress only (Likely = best case = base tier low end).

interface TierRange {
  likely: number;        // base tier, low end of range
  conservative: number;  // base tier, high end of range (lender-typical)
  stress: number;        // stress ceiling within tier (before cap)
}

function getTierRange(dscr: number): TierRange {
  if (dscr >= 1.25) return { likely: 3,  conservative: 6,  stress: 9 };
  if (dscr >= 1.00) return { likely: 6,  conservative: 9,  stress: 12 };
  if (dscr >= 0.75) return { likely: 9,  conservative: 12, stress: 15 };
  return                 { likely: 12, conservative: 12, stress: 15 };
}

// ============================================================
// OVERLAY COMPUTATION — selective, each capped at scenario limit
// ============================================================

function computeOverlays(
  strategy: RentalStrategy,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  monthlyPITIA: number
): ReserveAdjustment[] {
  const adjustments: ReserveAdjustment[] = [];

  // STR strategy: +3 months (audit req #g)
  if (strategy === 'STR') {
    adjustments.push({
      factor: 'STR Strategy',
      monthsAdded: 3,
      reason: 'Short-term rental strategy requires +3 months PITIA reserves',
      capped: false,
    });
  }

  // FICO < 680: +3 months (640-679) or +6 months (<640)
  if (borrower.ficoScore < 640) {
    adjustments.push({
      factor: 'FICO < 640',
      monthsAdded: 6,
      reason: 'FICO below 640 requires +6 months reserves',
      capped: false,
    });
  } else if (borrower.ficoScore < 680) {
    adjustments.push({
      factor: 'FICO 640-679',
      monthsAdded: 3,
      reason: 'FICO below 680 requires +3 months reserves',
      capped: false,
    });
  }

  // First-time investor: +3 months (audit req #h)
  if (borrower.experience === 'FIRST_TIME') {
    adjustments.push({
      factor: 'First-Time Investor',
      monthsAdded: 3,
      reason: 'First-time investors require +3 months reserves',
      capped: false,
    });
  }

  // Loan > $1M: +3 months
  const estimatedLoanAmount = estimateLoanAmount(monthlyPITIA);
  if (estimatedLoanAmount > 1_000_000) {
    adjustments.push({
      factor: 'Loan > $1M',
      monthsAdded: 3,
      reason: 'Loan amount exceeding $1M requires +3 months reserves',
      capped: false,
    });
  }

  // Non-US investor: +6 months (audit req #h)
  if (borrower.isNonUsInvestor) {
    adjustments.push({
      factor: 'Non-US Investor',
      monthsAdded: 6,
      reason: 'Non-US investors require +6 months US-account reserves',
      capped: false,
    });
  }

  // LTV > 80%: +1 month (audit req #i)
  if (loan.ltv > 80) {
    adjustments.push({
      factor: 'LTV > 80%',
      monthsAdded: 1,
      reason: 'LTV exceeding 80% requires +1 month reserves',
      capped: false,
    });
  }

  return adjustments;
}

/**
 * Estimate loan amount from monthly PITIA.
 * P&I ≈ 70% of PITIA (taxes, insurance, HOA ≈ 30%).
 * Reference rate: 7.5% 30-year fixed (payment factor 0.00699 per $1).
 */
function estimateLoanAmount(monthlyPITIA: number): number {
  const PI_RATIO = 0.70;
  const PAYMENT_FACTOR_30YR = 0.00699;
  const estimatedPI = monthlyPITIA * PI_RATIO;
  return estimatedPI / PAYMENT_FACTOR_30YR;
}

// ============================================================
// CAP APPLICATION — overlays truncated at scenario ceiling
// ============================================================

function applyCap(
  baseMonths: number,
  adjustments: ReserveAdjustment[],
  ceiling: number
): { totalMonths: number; adjustments: ReserveAdjustment[] } {
  let running = baseMonths;
  const result: ReserveAdjustment[] = [];

  for (const adj of adjustments) {
    const projected = running + adj.monthsAdded;
    if (projected > ceiling) {
      const allowed = Math.max(0, ceiling - running);
      result.push({
        ...adj,
        monthsAdded: allowed,
        capped: true,
      });
      running = ceiling;
    } else {
      result.push({ ...adj, capped: false });
      running = projected;
    }
  }

  return {
    totalMonths: Math.min(running, ceiling),
    adjustments: result,
  };
}

// ============================================================
// ASSET HAIRCUTS — liquidity hierarchy (audit req #5 and #6)
// ============================================================
// Audit spec tiering:
//   Tier 1 (strongest):    cash (checking, savings, money market) + brokerage — 0-10% haircut
//   Tier 2 (acceptable):   retirement (401k, IRA) — 30% haircut (60-70% eligible)
//   Tier 3 (lender-spec):  gift funds, business accounts, cash-out proceeds — 40% haircut
//   Excluded:              crypto, home equity, unsecured borrowed — 100% haircut
//
// v6.0 audit note: Deephaven accepts gift funds for reserves with conditions —
// gift funds are Tier 3 (lower haircut), NOT EXCLUDED.

const ASSET_HAIRCUT_MAP: Record<ReserveAssetType, { tier: 1 | 2 | 3 | 'EXCLUDED'; haircutPct: number }> = {
  CHECKING:                  { tier: 1, haircutPct: 0 },
  SAVINGS:                   { tier: 1, haircutPct: 0 },
  MONEY_MARKET:              { tier: 1, haircutPct: 0 },
  BROKERAGE:                 { tier: 1, haircutPct: 10 },
  PUBLICLY_TRADED_SECURITIES:{ tier: 1, haircutPct: 10 },
  RETIREMENT_401K:           { tier: 2, haircutPct: 30 },
  RETIREMENT_IRA:            { tier: 2, haircutPct: 30 },
  BUSINESS_ACCOUNT:          { tier: 3, haircutPct: 40 },
  CASH_OUT_PROCEEDS:         { tier: 3, haircutPct: 40 },
  GIFT_FUNDS:                { tier: 3, haircutPct: 40 },
  CRYPTO:                    { tier: 'EXCLUDED', haircutPct: 100 },
  HOME_EQUITY:               { tier: 'EXCLUDED', haircutPct: 100 },
  UNSECURED_BORROWED:        { tier: 'EXCLUDED', haircutPct: 100 },
};

function getAssetTierAndHaircut(
  assetType: ReserveAssetType
): { tier: 1 | 2 | 3 | 'EXCLUDED'; haircutPct: number } {
  return ASSET_HAIRCUT_MAP[assetType] ?? { tier: 'EXCLUDED' as const, haircutPct: 100 };
}

// ============================================================
// GEOGRAPHY OVERLAY (audit req #4)
// ============================================================
// Griffin California schedule: 9/12/15 months vs standard 3/6/9.
// Delta = +6 months (3/6/9 + 6 = 9/12/15).
// Provenance: VERIFIED_SECONDARY, third-party review, 2026.
// Note: stress ceiling still capped at 12 per audit req #3 — CA's nominal
// 9/12/15 schedule is clipped to 9/12/12 once the 12-month cap is applied.

export function getGeographyOverlay(state: string): GeographyOverlay | null {
  const normalized = state.toUpperCase().trim();
  if (normalized === 'CA') {
    return {
      state: 'CA',
      schedule: '9/12/15',
      provenance: 'VERIFIED_SECONDARY' as ProvenanceLabel,
      source: 'Griffin California schedule; third-party review, 2026',
    };
  }
  return null;
}

// CA overlay adds +6 months (audit: "3/6/9 + 6 months = 9/12/15")
const GEOGRAPHY_MONTHS_ADDED = 6;

// ============================================================
// APPLY ASSET HAIRCUTS (exported)
// ============================================================

export function applyAssetHaircuts(assets: ReserveAsset[]): AssetHaircutResult[] {
  return assets.map((asset) => {
    const { tier, haircutPct } = getAssetTierAndHaircut(asset.type);
    return {
      assetType: asset.type,
      value: asset.value,
      haircutPct,
      eligibleAmount: asset.value * (1 - haircutPct / 100),
      tier,
    };
  });
}

// ============================================================
// MAIN: THREE-SCENARIO RESERVE COMPUTATION
// ============================================================
// Likely:       tier low end (no overlays), capped at 12
// Conservative: tier high end + overlays, capped at 12
// Stress:       tier stress ceiling + overlays, capped at 12 (audit req #3)

export function computeReserveScenarios(
  dscr: number,
  monthlyPITIA: number,
  strategy: RentalStrategy,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  state: string,
  assets: ReserveAsset[]
): ReserveScenarios {
  const geoOverlay = getGeographyOverlay(state);
  const tier = getTierRange(dscr);

  // Build overlay adjustments (audit req: STR/FICO/first-time/loan/foreign/LTV)
  const overlays = computeOverlays(strategy, borrower, loan, monthlyPITIA);

  // Geography overlay: CA adds +6 months (audit: 3/6/9 + 6 = 9/12/15)
  const geoAdj: ReserveAdjustment | null = geoOverlay
    ? {
        factor: `Geography (${geoOverlay.state})`,
        monthsAdded: GEOGRAPHY_MONTHS_ADDED,
        reason: `${geoOverlay.state} schedule ${geoOverlay.schedule} vs standard 3/6/9`,
        capped: false,
      }
    : null;

  // Geography is a state-level MANDATE (not a borrower-risk overlay), so it
  // applies to ALL three scenarios — CA's base schedule IS 9/12/15, not 3/6/9.
  // Borrower-risk overlays (STR/FICO/first-time/foreign/LTV/loan>$1M) apply to
  // Conservative and Stress only (Likely = best case = base tier low end).
  const allOverlays = geoAdj ? [...overlays, geoAdj] : overlays;
  const geoOnly = geoAdj ? [geoAdj] : [];

  // --- Likely: tier low end + geography mandate, capped at 12 ---
  const likelyCapped = applyCap(tier.likely, geoOnly, RESERVE_CAP);

  // --- Conservative: tier high end + all overlays, capped at 12 ---
  const conservativeCapped = applyCap(tier.conservative, allOverlays, RESERVE_CAP);

  // --- Stress: tier stress ceiling + all overlays, capped at 12 (audit req #3) ---
  const stressCapped = applyCap(tier.stress, allOverlays, RESERVE_CAP);

  // Asset haircuts
  const assetHaircuts = applyAssetHaircuts(assets);
  const totalEligibleReserves = assetHaircuts.reduce(
    (sum, a) => sum + a.eligibleAmount,
    0
  );

  // Seasoning warning: total eligible reserves < 2 months PITIA (60-day proxy)
  const seasoningWarning = totalEligibleReserves < monthlyPITIA * 2;

  // --- Build scenario calculations ---

  const likely: ReserveCalculation = {
    label: 'Likely',
    baseMonths: tier.likely,
    adjustments: likelyCapped.adjustments,
    totalMonths: likelyCapped.totalMonths,
    totalDollars: likelyCapped.totalMonths * monthlyPITIA,
    assetHaircuts,
    totalEligibleReserves,
    shortfall: Math.max(
      0,
      likelyCapped.totalMonths * monthlyPITIA - totalEligibleReserves
    ),
    seasoningWarning,
  };

  const conservative: ReserveCalculation = {
    label: 'Conservative',
    baseMonths: tier.conservative,
    adjustments: conservativeCapped.adjustments,
    totalMonths: conservativeCapped.totalMonths,
    totalDollars: conservativeCapped.totalMonths * monthlyPITIA,
    assetHaircuts,
    totalEligibleReserves,
    shortfall: Math.max(
      0,
      conservativeCapped.totalMonths * monthlyPITIA - totalEligibleReserves
    ),
    seasoningWarning,
  };

  const stress: ReserveCalculation = {
    label: 'Stress Ceiling',
    baseMonths: tier.stress,
    adjustments: stressCapped.adjustments,
    totalMonths: stressCapped.totalMonths,
    totalDollars: stressCapped.totalMonths * monthlyPITIA,
    assetHaircuts,
    totalEligibleReserves,
    shortfall: Math.max(
      0,
      stressCapped.totalMonths * monthlyPITIA - totalEligibleReserves
    ),
    seasoningWarning,
  };

  return {
    likely,
    conservative,
    stress,
    geographyOverlay: geoOverlay,
    cap: RESERVE_CAP,
  };
}
