// ============================================================================
// RESERVE FORECAST ENGINE — v7.0 Section 12
// ============================================================================
// v7.0 Principle 4: Reserve logic is tiered and capped.
// Uses HIGHEST-FACTOR rule (not additive stacking).
// Output is THREE scenarios (Lenient / Median / Strict), never one number.
// 12-month ceiling is the standard cap.
// ============================================================================

export interface ReserveInput {
  dscr: number;
  fico: number;
  loanAmount: number;
  propertyType: string; // SFR, CONDO, 2-4 unit, etc.
  isStr: boolean;
  isRural: boolean; // >35 miles from metro
  isFirstTimeInvestor: boolean;
  experienceProperties: number;
  pitia: number; // monthly PITIA for dollar conversion
  // Portfolio
  additionalFinancedProperties: number;
}

export interface ReserveScenario {
  label: 'Lenient' | 'Market Median' | 'Strict / Sub-DSCR';
  months: number;
  dollars: number;
}

export interface ReserveResult {
  baseMonths: number;
  baseLabel: string;
  overlayApplied: string | null;
  overlayMonths: number;
  cappedMonths: number; // after 12mo cap
  portfolioDragMonths: number;
  totalMonths: number;
  totalDollars: number;
  scenarios: [ReserveScenario, ReserveScenario, ReserveScenario];
  notes: string[];
}

// ---------------------------------------------------------------------------
// Step 1: BASE — highest of DSCR tier or loan-amount tier
// ---------------------------------------------------------------------------

function calculateBaseMonths(dscr: number, loanAmount: number): { months: number; label: string } {
  // By DSCR tier
  let dscrMonths: number;
  let dscrLabel: string;
  if (dscr >= 1.25) { dscrMonths = 3; dscrLabel = '1.25+ DSCR tier: 3mo'; }
  else if (dscr >= 1.10) { dscrMonths = 6; dscrLabel = '1.10-1.24 DSCR tier: 6mo'; }
  else if (dscr >= 1.00) { dscrMonths = 9; dscrLabel = '1.00-1.09 DSCR tier: 6-9mo'; } // use 9 (high end)
  else { dscrMonths = 12; dscrLabel = 'sub-1.0 DSCR tier: 9-12mo'; } // use 12

  // By loan amount — $2M+ adds 3mo
  if (loanAmount >= 2_000_000) {
    const jumboMonths = dscrMonths + 3;
    if (jumboMonths > dscrMonths) {
      return { months: jumboMonths, label: `${dscrLabel} + $2M+ jumbo overlay: +3mo` };
    }
  }

  return { months: dscrMonths, label: dscrLabel };
}

// ---------------------------------------------------------------------------
// Step 2: OVERLAYS — add the SINGLE largest applicable (not all)
// ---------------------------------------------------------------------------

function calculateOverlayMonths(input: ReserveInput): { months: number; label: string | null } {
  const overlays: { months: number; label: string }[] = [];

  if (input.isStr) overlays.push({ months: 3, label: 'STR property: +3mo' });
  if (input.propertyType === 'CONDO') overlays.push({ months: 3, label: 'Condo: +3mo' });
  if (input.isRural) overlays.push({ months: 3, label: 'Rural (>35mi): +3mo' });
  if (input.isFirstTimeInvestor) overlays.push({ months: 3, label: 'First-time investor: +3mo' });
  if (input.fico >= 640 && input.fico <= 679) overlays.push({ months: 3, label: 'FICO 640-679: +3mo' });

  if (overlays.length === 0) return { months: 0, label: null };

  // Return the SINGLE largest (they're all 3mo, so take the first)
  const largest = overlays.reduce((a, b) => (a.months > b.months ? a : b));
  return { months: largest.months, label: largest.label };
}

// ---------------------------------------------------------------------------
// Step 3: CAP at 12 months
// ---------------------------------------------------------------------------

const RESERVE_CAP = 12;

// ---------------------------------------------------------------------------
// Step 4: PORTFOLIO DRAG — +2mo per additional financed property, capped at 12 total
// ---------------------------------------------------------------------------

function calculatePortfolioDrag(additionalProperties: number, currentTotal: number): number {
  const drag = additionalProperties * 2;
  return Math.min(drag, Math.max(0, RESERVE_CAP - currentTotal));
}

// ---------------------------------------------------------------------------
// Step 5: REDUCTION for experienced investors (5+ properties) — floor at 3mo
// ---------------------------------------------------------------------------

function applyExperienceReduction(months: number, experienceProperties: number): { months: number; reduced: boolean } {
  if (experienceProperties >= 5 && months > 3) {
    return { months: Math.max(3, months - 3), reduced: true };
  }
  return { months, reduced: false };
}

// ---------------------------------------------------------------------------
// MAIN RESERVE CALCULATOR
// ---------------------------------------------------------------------------

export function calculateReserves(input: ReserveInput): ReserveResult {
  const notes: string[] = [];

  // Step 1: Base
  const base = calculateBaseMonths(input.dscr, input.loanAmount);
  notes.push(`Base: ${base.label}`);

  // Step 2: Overlay (single largest)
  const overlay = calculateOverlayMonths(input);
  if (overlay.label) {
    notes.push(`Overlay: ${overlay.label}`);
  }

  let totalMonths = base.months + overlay.months;

  // Step 3: Cap at 12
  const cappedMonths = Math.min(totalMonths, RESERVE_CAP);
  if (totalMonths > RESERVE_CAP) {
    notes.push(`Capped at ${RESERVE_CAP}mo standard ceiling (was ${totalMonths}mo)`);
  }
  totalMonths = cappedMonths;

  // Step 4: Portfolio drag
  const portfolioDragMonths = calculatePortfolioDrag(input.additionalFinancedProperties, totalMonths);
  if (portfolioDragMonths > 0) {
    notes.push(`Portfolio drag: +${portfolioDragMonths}mo (${input.additionalFinancedProperties} additional financed properties × 2mo)`);
  }
  totalMonths = Math.min(totalMonths + portfolioDragMonths, RESERVE_CAP);

  // Step 5: Experience reduction
  const reduction = applyExperienceReduction(totalMonths, input.experienceProperties);
  if (reduction.reduced) {
    notes.push(`Experienced investor (5+ properties): -3mo reduction (floor at 3mo)`);
  }
  totalMonths = reduction.months;

  const totalDollars = totalMonths * input.pitia;

  // Three scenarios
  // Lenient = lowest reasonable (3mo floor, no overlays)
  // Median = the calculated total
  // Strict = +3mo on top of median (stress case), capped at 12
  const lenientMonths = Math.max(3, Math.min(base.months, 6));
  const medianMonths = totalMonths;
  const strictMonths = Math.min(12, totalMonths + 3);

  const scenarios: [ReserveScenario, ReserveScenario, ReserveScenario] = [
    { label: 'Lenient', months: lenientMonths, dollars: lenientMonths * input.pitia },
    { label: 'Market Median', months: medianMonths, dollars: medianMonths * input.pitia },
    { label: 'Strict / Sub-DSCR', months: strictMonths, dollars: strictMonths * input.pitia },
  ];

  return {
    baseMonths: base.months,
    baseLabel: base.label,
    overlayApplied: overlay.label,
    overlayMonths: overlay.months,
    cappedMonths,
    portfolioDragMonths,
    totalMonths,
    totalDollars: Math.round(totalDollars),
    scenarios,
    notes,
  };
}

// ---------------------------------------------------------------------------
// RESERVE LIQUIDITY HIERARCHY — v7.0 Section 12.3
// ---------------------------------------------------------------------------

export type LiquidAssetTier = 'tier1_universal' | 'tier2_usual' | 'tier3_lender_specific' | 'not_accepted';

export interface LiquidAsset {
  type: 'checking' | 'savings' | 'money_market' | 'brokerage' | '401k_ira' | 'crypto' | 'home_equity' | 'business_account' | 'gift_funds' | 'unsecured_borrowed';
  value: number;
}

export interface LiquidAssetResult {
  type: LiquidAsset['type'];
  tier: LiquidAssetTier;
  acceptedPct: number;
  acceptedValue: number;
  note: string;
}

export function classifyLiquidAsset(asset: LiquidAsset): LiquidAssetResult {
  const tier1: LiquidAsset['type'][] = ['checking', 'savings', 'money_market'];
  const tier2: LiquidAsset['type'][] = ['brokerage'];
  const tier3: LiquidAsset['type'][] = ['401k_ira'];
  const notAccepted: LiquidAsset['type'][] = ['crypto', 'home_equity', 'unsecured_borrowed'];
  // v7.1 CORRECTION (Mistake #17): Gift funds are NOT universally excluded.
  // Deephaven [VERIFIED — primary] accepts gift funds for down payment, closing costs,
  // AND reserves with documented conditions. Business accounts vary by lender.
  // Both gift_funds and business_account are lender-specific, not "not accepted".

  if (tier1.includes(asset.type)) {
    return {
      type: asset.type,
      tier: 'tier1_universal',
      acceptedPct: 100,
      acceptedValue: asset.value,
      note: 'Tier 1 — accepted everywhere (use these first)',
    };
  }
  if (tier2.includes(asset.type)) {
    return {
      type: asset.type,
      tier: 'tier2_usual',
      acceptedPct: 90, // 80-100%, midpoint
      acceptedValue: asset.value * 0.90,
      note: 'Tier 2 — usually accepted at ~80-100% of market value',
    };
  }
  if (tier3.includes(asset.type)) {
    return {
      type: asset.type,
      tier: 'tier3_lender_specific',
      acceptedPct: 65, // 60-70% at many lenders, 0% at some
      acceptedValue: asset.value * 0.65,
      note: 'Tier 3 — lender-specific. 60-70% at many lenders; NOT counted at some. Verify per lender.',
    };
  }
  // v7.1: Gift funds and business accounts are lender-specific (not "not accepted")
  if (asset.type === 'gift_funds') {
    return {
      type: asset.type,
      tier: 'tier3_lender_specific', // reclassified from not_accepted
      acceptedPct: 50, // lender-specific: Deephaven accepts, others may not
      acceptedValue: asset.value * 0.50,
      note: 'v7.1 CORRECTION: Gift funds are LENDER-SPECIFIC, not universally excluded. Deephaven [VERIFIED — primary] accepts gift funds for down payment, closing costs, AND reserves with documented conditions. Verify per lender.',
    };
  }
  if (asset.type === 'business_account') {
    return {
      type: asset.type,
      tier: 'tier3_lender_specific',
      acceptedPct: 40,
      acceptedValue: asset.value * 0.40,
      note: 'Business accounts — lender-specific. Some accept with documentation, others do not. Verify per lender.',
    };
  }
  if (notAccepted.includes(asset.type)) {
    return {
      type: asset.type,
      tier: 'not_accepted',
      acceptedPct: 0,
      acceptedValue: 0,
      note: 'Not accepted for DSCR reserves',
    };
  }
  return {
    type: asset.type,
    tier: 'not_accepted',
    acceptedPct: 0,
    acceptedValue: 0,
    note: 'Unknown asset type — verify with lender',
  };
}

export function calculateTotalVerifiedReserves(assets: LiquidAsset[]): { total: number; breakdown: LiquidAssetResult[] } {
  const breakdown = assets.map(classifyLiquidAsset);
  const total = breakdown.reduce((sum, b) => sum + b.acceptedValue, 0);
  return { total: Math.round(total), breakdown };
}
