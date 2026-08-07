// ============================================================================
// LLPA (Loan-Level Price Adjustment) CLIFF MATRIX
// ============================================================================
// Implements the v5.0 Spec's pricing matrix with exact FICO tier adjustments,
// LTV caps, DSCR band pricing, property overlays, and loan-purpose premiums.
// Anchor rate: 6.125% for 740 FICO / 75% LTV / 1.0+ DSCR / SFR / 30-yr / 3yr PPP
// Hard bounds: 6.00% floor, 11.50% ceiling
// ============================================================================

export const ANCHOR_RATE = 6.125; // 740 FICO, 75% LTV, 1.0+ DSCR, SFR, 30yr fixed, 3yr PPP
export const RATE_FLOOR = 6.0;
export const RATE_CEILING = 11.5;

// ---------------------------------------------------------------------------
// FICO LLPA Tiers — from v5.0 Spec, validated against Investment Property
// Loan Exchange and LendingOne rate sheets
// ---------------------------------------------------------------------------

export interface FicoTier {
  min: number;
  max: number;
  label: string;
  adjustment: number; // percentage points added to anchor
}

export const FICO_TIERS: FicoTier[] = [
  { min: 760, max: 900, label: '760+', adjustment: -0.125 },
  { min: 740, max: 759, label: '740-759', adjustment: 0.0 }, // base
  { min: 720, max: 739, label: '720-739', adjustment: 0.125 },
  { min: 700, max: 719, label: '700-719', adjustment: 0.25 },
  { min: 680, max: 699, label: '680-699', adjustment: 0.5 },
  { min: 660, max: 679, label: '660-679', adjustment: 0.875 },
  { min: 640, max: 659, label: '640-659', adjustment: 1.5 },
  { min: 620, max: 639, label: '620-639', adjustment: 2.0 },
  { min: 0, max: 619, label: '<620', adjustment: 2.5 }, // sub-620 = aggressive pricing
];

export function ficoAdjustment(fico: number): { adjustment: number; tier: FicoTier } {
  const tier = FICO_TIERS.find((t) => fico >= t.min && fico <= t.max) ?? FICO_TIERS[FICO_TIERS.length - 1];
  return { adjustment: tier.adjustment, tier };
}

// ---------------------------------------------------------------------------
// LTV LLPA Tiers + FICO-based LTV caps
// ---------------------------------------------------------------------------

export interface LtvTier {
  maxLtv: number;
  label: string;
  adjustment: number;
}

export const LTV_TIERS: LtvTier[] = [
  { maxLtv: 60, label: '≤60%', adjustment: -0.25 },
  { maxLtv: 65, label: '≤65%', adjustment: -0.125 },
  { maxLtv: 70, label: '≤70%', adjustment: 0.0 },
  { maxLtv: 75, label: '≤75%', adjustment: 0.125 }, // base
  { maxLtv: 80, label: '≤80%', adjustment: 0.375 },
];

export function ltvAdjustment(ltv: number): { adjustment: number; tier: LtvTier } {
  const tier = LTV_TIERS.find((t) => ltv <= t.maxLtv) ?? LTV_TIERS[LTV_TIERS.length - 1];
  return { adjustment: tier.adjustment, tier };
}

// FICO-based LTV caps — spec validated against market data
export function maxLtvForFico(fico: number): number {
  if (fico >= 700) return 80;
  if (fico >= 680) return 75;
  if (fico >= 660) return 70;
  if (fico >= 620) return 65;
  return 60; // sub-620 = restricted
}

// ---------------------------------------------------------------------------
// DSCR Band Pricing — lower DSCR = higher rate
// ---------------------------------------------------------------------------

export interface DscrBand {
  min: number;
  max: number;
  label: string;
  adjustment: number;
}

export const DSCR_BANDS: DscrBand[] = [
  { min: 1.5, max: 99, label: '≥1.50x', adjustment: -0.25 },
  { min: 1.25, max: 1.499, label: '1.25-1.49x', adjustment: -0.125 },
  { min: 1.10, max: 1.249, label: '1.10-1.24x', adjustment: 0.0 }, // base
  { min: 1.0, max: 1.099, label: '1.00-1.09x', adjustment: 0.25 },
  { min: 0.85, max: 0.999, label: '0.85-0.99x', adjustment: 0.75 }, // sub-1.0 pricing
  { min: 0.75, max: 0.849, label: '0.75-0.84x', adjustment: 1.25 },
  { min: 0, max: 0.749, label: '<0.75x', adjustment: 2.0 },
];

export function dscrAdjustment(dscr: number): { adjustment: number; band: DscrBand } {
  const band = DSCR_BANDS.find((b) => dscr >= b.min && dscr <= b.max) ?? DSCR_BANDS[DSCR_BANDS.length - 1];
  return { adjustment: band.adjustment, band };
}

// ---------------------------------------------------------------------------
// Property Type Overlays
// ---------------------------------------------------------------------------

export type PropertyUse = 'SFR' | 'CONDO' | 'TWO_UNIT' | 'THREE_UNIT' | 'FOUR_UNIT' | 'MIXED_USE' | 'RURAL' | 'CONDOTEL' | 'STR' | 'MULTIFAMILY';

export interface PropertyOverlay {
  adjustment: number;
  maxLtvCap: number; // additional LTV cap on top of FICO cap
  note: string;
}

export const PROPERTY_OVERLAYS: Record<PropertyUse, PropertyOverlay> = {
  SFR: { adjustment: 0.0, maxLtvCap: 80, note: 'Base — single-family residential' },
  CONDO: { adjustment: 0.125, maxLtvCap: 75, note: 'Condo warrantable review required' },
  TWO_UNIT: { adjustment: 0.25, maxLtvCap: 75, note: '2-unit income property' },
  THREE_UNIT: { adjustment: 0.375, maxLtvCap: 75, note: '3-unit income property' },
  FOUR_UNIT: { adjustment: 0.375, maxLtvCap: 75, note: '4-unit income property' },
  MIXED_USE: { adjustment: 0.75, maxLtvCap: 70, note: 'Mixed-use — commercial component' },
  RURAL: { adjustment: 0.25, maxLtvCap: 70, note: 'Rural — limited comps' },
  CONDOTEL: { adjustment: 0.5, maxLtvCap: 70, note: 'Condotel — hospitality risk' },
  STR: { adjustment: 0.3, maxLtvCap: 70, note: 'STR — hospitality income volatility' },
  MULTIFAMILY: { adjustment: 0.375, maxLtvCap: 75, note: 'Multifamily 5+ units — commercial' },
};

// ---------------------------------------------------------------------------
// Loan Purpose Premiums
// ---------------------------------------------------------------------------

export type LoanPurpose = 'PURCHASE' | 'RATE_TERM_REFI' | 'CASH_OUT_REFI';

export const LOAN_PURPOSE_ADJUSTMENTS: Record<LoanPurpose, number> = {
  PURCHASE: 0.0,
  RATE_TERM_REFI: 0.125,
  CASH_OUT_REFI: 0.375, // spec: +0.250 to +0.500; we use midpoint
};

// ---------------------------------------------------------------------------
// Special Overlays
// ---------------------------------------------------------------------------

export const STR_PREMIUM = 0.3; // v5.0 Spec validated
export const IO_PENALTY = 0.25; // +25 bps for IO feature
export const SMALL_BALANCE_THRESHOLD = 150000; // loans under $150K
export const SMALL_BALANCE_PENALTY = 0.5;
export const FOREIGN_NATIONAL_PREMIUM_MIN = 0.75;
export const FOREIGN_NATIONAL_PREMIUM_MAX = 1.5;
export const ARM_PREMIUM = 0.125; // ARM structure reset risk

// ---------------------------------------------------------------------------
// Reserve Requirements — v5.0 Spec with Portfolio Drag
// ---------------------------------------------------------------------------

export interface ReserveProfile {
  profile: 'prime' | 'standard' | 'high_risk' | 'no_ratio';
  baseMonths: number;
  label: string;
}

export function classifyReserveProfile(dscr: number, fico: number, ltv: number): ReserveProfile {
  if (dscr < 0.85 || (dscr < 1.0 && fico < 680)) {
    return { profile: 'no_ratio', baseMonths: 12, label: 'No-Ratio / Aggressive' };
  }
  if (dscr < 1.0 || fico < 660 || ltv > 75) {
    return { profile: 'high_risk', baseMonths: 9, label: 'High-Risk (<1.0 DSCR)' };
  }
  if (dscr >= 1.25 && fico >= 740 && ltv <= 70) {
    return { profile: 'prime', baseMonths: 3, label: 'Prime (1.25+ DSCR, 740+ FICO, ≤70% LTV)' };
  }
  return { profile: 'standard', baseMonths: 6, label: 'Standard (1.00-1.24 DSCR)' };
}

// Portfolio Drag: +2 months PITIA per additional financed property
export const PORTFOLIO_DRAG_PER_PROPERTY = 2;

// ---------------------------------------------------------------------------
// Asset Liquidity Haircuts — v5.0 Spec
// ---------------------------------------------------------------------------

export type AssetType = 'cash' | 'stocks' | 'retirement' | 'crypto' | 'realestate' | 'other';

export interface AssetHaircut {
  type: AssetType;
  acceptedPct: number; // 0-100
  note: string;
}

export const ASSET_HAIRCUTS: Record<AssetType, AssetHaircut> = {
  cash: { type: 'cash', acceptedPct: 100, note: 'Liquid cash — full value' },
  stocks: { type: 'stocks', acceptedPct: 75, note: 'Public stocks — 70-80% (midpoint 75%)' },
  retirement: { type: 'retirement', acceptedPct: 65, note: 'Vested retirement — 60-70% net of 401k loans' },
  crypto: { type: 'crypto', acceptedPct: 0, note: 'Cryptocurrency — 0% (ineligible for reserve verification)' },
  realestate: { type: 'realestate', acceptedPct: 65, note: 'Other real estate equity — 60-70% (illiquid)' },
  other: { type: 'other', acceptedPct: 50, note: 'Other assets — 50% default haircut' },
};

export interface ReserveAsset {
  type: AssetType;
  value: number;
}

export function calculateVerifiedReserves(assets: ReserveAsset[]): number {
  return assets.reduce((sum, a) => sum + a.value * (ASSET_HAIRCUTS[a.type].acceptedPct / 100), 0);
}

// ---------------------------------------------------------------------------
// COMPOSITE RATE ESTIMATOR — applies all LLPAs to anchor
// ---------------------------------------------------------------------------

export interface EstimateRateInput {
  fico: number;
  ltv: number;
  dscr: number;
  propertyType: PropertyUse;
  loanPurpose: LoanPurpose;
  loanAmount: number;
  interestOnlyMonths: number;
  isForeignNational: boolean;
  isArmStructure: boolean;
  // v7.1: STR flag for STR-specific LTV cap
  isStr?: boolean;
  // v7.1: State for declining-market overlay
  state?: string;
}

export interface EstimateRateResult {
  estimatedRate: number;
  anchorRate: number;
  adjustments: { factor: string; adjustment: number; note: string }[];
  ficoTier: string;
  ltvTier: string;
  dscrBand: string;
  maxLtvAllowed: number;
  withinBounds: boolean;
  // v7.1: LTV cap explanations
  ltvCapWarnings: string[];
}

export function estimateRate(input: EstimateRateInput): EstimateRateResult {
  const adjustments: { factor: string; adjustment: number; note: string }[] = [];

  // 1. FICO adjustment
  const ficoAdj = ficoAdjustment(input.fico);
  if (ficoAdj.adjustment !== 0) {
    adjustments.push({
      factor: 'FICO',
      adjustment: ficoAdj.adjustment,
      note: `FICO ${input.fico} → tier ${ficoAdj.tier.label}`,
    });
  }

  // 2. LTV adjustment
  const ltvAdj = ltvAdjustment(input.ltv);
  if (ltvAdj.adjustment !== 0) {
    adjustments.push({
      factor: 'LTV',
      adjustment: ltvAdj.adjustment,
      note: `LTV ${input.ltv.toFixed(1)}% → tier ${ltvAdj.tier.label}`,
    });
  }

  // 3. DSCR band adjustment
  const dscrAdj = dscrAdjustment(input.dscr);
  if (dscrAdj.adjustment !== 0) {
    adjustments.push({
      factor: 'DSCR',
      adjustment: dscrAdj.adjustment,
      note: `DSCR ${input.dscr.toFixed(2)}x → band ${dscrAdj.band.label}`,
    });
  }

  // 4. Property type overlay
  const propOverlay = PROPERTY_OVERLAYS[input.propertyType] ?? PROPERTY_OVERLAYS.SFR;
  if (propOverlay.adjustment !== 0) {
    adjustments.push({
      factor: 'Property Type',
      adjustment: propOverlay.adjustment,
      note: `${input.propertyType} — ${propOverlay.note}`,
    });
  }

  // 5. Loan purpose
  const purposeAdj = LOAN_PURPOSE_ADJUSTMENTS[input.loanPurpose] ?? 0;
  if (purposeAdj !== 0) {
    adjustments.push({
      factor: 'Loan Purpose',
      adjustment: purposeAdj,
      note: `${input.loanPurpose}`,
    });
  }

  // 6. IO penalty
  if (input.interestOnlyMonths > 0) {
    adjustments.push({
      factor: 'Interest-Only',
      adjustment: IO_PENALTY,
      note: `IO period ${input.interestOnlyMonths}mo — +25bps penalty`,
    });
  }

  // 7. ARM premium
  if (input.isArmStructure) {
    adjustments.push({
      factor: 'ARM Structure',
      adjustment: ARM_PREMIUM,
      note: 'ARM — reset risk premium +12.5bps',
    });
  }

  // 8. Small balance penalty
  if (input.loanAmount < SMALL_BALANCE_THRESHOLD) {
    adjustments.push({
      factor: 'Small Balance',
      adjustment: SMALL_BALANCE_PENALTY,
      note: `Loan $${input.loanAmount.toLocaleString()} < $${SMALL_BALANCE_THRESHOLD.toLocaleString()} threshold`,
    });
  }

  // 9. Foreign national
  if (input.isForeignNational) {
    const fnAdj = (FOREIGN_NATIONAL_PREMIUM_MIN + FOREIGN_NATIONAL_PREMIUM_MAX) / 2;
    adjustments.push({
      factor: 'Foreign National',
      adjustment: fnAdj,
      note: `Foreign national — +${fnAdj.toFixed(3)}% (no domestic credit)`,
    });
  }

  // Sum adjustments
  const totalAdjustment = adjustments.reduce((sum, a) => sum + a.adjustment, 0);
  const rawRate = ANCHOR_RATE + totalAdjustment;

  // Clamp to bounds
  const estimatedRate = Math.max(RATE_FLOOR, Math.min(RATE_CEILING, rawRate));
  const withinBounds = rawRate >= RATE_FLOOR && rawRate <= RATE_CEILING;

  // v7.1: Max LTV calculation with multiple caps
  const ltvCapWarnings: string[] = [];
  let maxLtvAllowed = Math.min(maxLtvForFico(input.fico), propOverlay.maxLtvCap);

  // v7.1 Section 14.5: 85% LTV for pristine profiles (740+ FICO, 1.0+ DSCR)
  // Defy [VERIFIED] and others offer 85% for premium credit
  if (input.fico >= 740 && input.dscr >= 1.0 && input.propertyType === 'SFR' && input.loanPurpose === 'PURCHASE') {
    maxLtvAllowed = Math.max(maxLtvAllowed, 85);
    ltvCapWarnings.push('85% LTV available for pristine profile (740+ FICO, 1.0+ DSCR, SFR purchase) — lender-specific (Defy and others) [VERIFIED]');
  }

  // v7.1 Section 14.5: STR LTV cap at 75% (Angel Oak, Visio, others)
  // Multiple lenders explicitly cap STR properties at 75% LTV regardless of DSCR/FICO
  if (input.isStr) {
    if (maxLtvAllowed > 75) {
      maxLtvAllowed = 75;
      ltvCapWarnings.push('STR LTV cap: 75% applied (Angel Oak, Visio, others explicitly cap STR at 75% regardless of DSCR/FICO) [VERIFIED]');
    }
  }

  // v7.1 Section 14.5 + Mistake #16: Declining-market state overlay
  // CT, FL, IL, NJ, NY face automatic LTV reduction to 75% (or 70% for some combos)
  const DECLINING_MARKET_STATES = ['CT', 'FL', 'IL', 'NJ', 'NY'];
  if (input.state && DECLINING_MARKET_STATES.includes(input.state.toUpperCase())) {
    const decliningCap = 75; // standard declining-market cap
    if (maxLtvAllowed > decliningCap) {
      maxLtvAllowed = decliningCap;
      ltvCapWarnings.push(`${input.state.toUpperCase()} is a declining-market state — LTV capped at ${decliningCap}% regardless of DSCR/FICO [market pattern — verify; list changes based on lender-specific determination]`);
    }
  }

  return {
    estimatedRate: Math.round(estimatedRate * 1000) / 1000, // 3 decimal precision
    anchorRate: ANCHOR_RATE,
    adjustments,
    ficoTier: ficoAdj.tier.label,
    ltvTier: ltvAdj.tier.label,
    dscrBand: dscrAdj.band.label,
    maxLtvAllowed,
    withinBounds,
    ltvCapWarnings,
  };
}

// ---------------------------------------------------------------------------
// v7.1: STRUCTURAL RATE ANCHOR — 10-yr Treasury + 200-225 bps
// More durable than a static 6.125% hardcode; re-anchors as Treasury moves
// ---------------------------------------------------------------------------

export const STRUCTURAL_ANCHOR_SPREAD_BPS_MIN = 200;
export const STRUCTURAL_ANCHOR_SPREAD_BPS_MAX = 225;
export const RESIDENTIAL_BAND_MIN = 6.5;
export const RESIDENTIAL_BAND_MAX = 8.75;
export const DSCR_TIER_SPREAD_BPS_MIN = 37.5; // 0.375% between 1.0 and 1.5+ DSCR
export const DSCR_TIER_SPREAD_BPS_MAX = 50;

export function computeStructuralAnchorRate(treasury10yr: number): number {
  // Midpoint of 200-225 bps spread
  const spreadBps = (STRUCTURAL_ANCHOR_SPREAD_BPS_MIN + STRUCTURAL_ANCHOR_SPREAD_BPS_MAX) / 2;
  return treasury10yr + spreadBps / 100;
}

// v7.1: Declining market states
export const DECLINING_MARKET_STATES = ['CT', 'FL', 'IL', 'NJ', 'NY'];

export function isDecliningMarketState(state: string): boolean {
  return DECLINING_MARKET_STATES.includes(state.toUpperCase());
}
