// ============================================================================
// PROPERTY-TAX REASSESSMENT + INSURANCE KILL GATE — v11 Parts B′.1 + B′.3
// ============================================================================

import { round } from './math';
import { BRRRR_CASH_OUT_LTV } from './constants';

// ---------------------------------------------------------------------------
// PROPERTY-TAX REASSESSMENT — v11 Part B′.1
// The sale resets the tax basis in many states. Using the seller's current
// tax bill silently overstates DSCR — same failure mode as the vacancy haircut.
// ---------------------------------------------------------------------------

export interface StateTaxReassessment {
  state: string;
  reset_on_sale: boolean;
  effective_rate_pct: number;  // annual % of value
  cap_annual_increase_pct: number;  // CA Prop 13 = 2%
  supplemental_bill: boolean;  // CA sends supplemental bill post-closing
  notes: string;
}

export const STATE_TAX_REASSESSMENT: Record<string, StateTaxReassessment> = {
  CA: {
    state: 'CA',
    reset_on_sale: true,
    effective_rate_pct: 1.1,  // Prop 13: ~1% + bonds/assessments
    cap_annual_increase_pct: 2,
    supplemental_bill: true,
    notes: 'Prop 13: Purchase price becomes new base-year assessed value. Prior owner may have had locked value from decades ago. 2% annual cap thereafter. Supplemental bill arrives post-closing.',
  },
  TX: {
    state: 'TX',
    reset_on_sale: true,
    effective_rate_pct: 2.2,  // 2-3% range, midpoint
    cap_annual_increase_pct: 10,  // 10% homestead cap (non-homestead = no cap)
    supplemental_bill: false,
    notes: 'Purchase triggers reassessment to market value. Rate 2-3% of value annually. No Prop 13-style protection for investment property.',
  },
  FL: {
    state: 'FL',
    reset_on_sale: true,
    effective_rate_pct: 0.89,
    cap_annual_increase_pct: 10,  // Save Our Homes = homestead only; investment = no cap
    supplemental_bill: false,
    notes: 'Purchase-year reset to market value. Investment properties do not benefit from Save Our Homes cap.',
  },
  NJ: {
    state: 'NJ',
    reset_on_sale: true,
    effective_rate_pct: 2.31,  // highest in US
    cap_annual_increase_pct: 2,
    supplemental_bill: false,
    notes: 'Reassessment on sale. Highest effective property tax rate in the US.',
  },
  NY: {
    state: 'NY',
    reset_on_sale: true,
    effective_rate_pct: 1.65,
    cap_annual_increase_pct: 2,  // tax cap, not assessment cap
    supplemental_bill: false,
    notes: 'Reassessment varies by municipality. NYC has unique system.',
  },
  IL: {
    state: 'IL',
    reset_on_sale: true,
    effective_rate_pct: 2.13,  // second highest
    cap_annual_increase_pct: 5,  // PTELL cap (some counties)
    supplemental_bill: false,
    notes: 'Reassessment on sale. Second-highest property tax rate in US.',
  },
};

export interface ReassessmentResult {
  reassessed_tax_annual: number;
  reassessed_tax_monthly: number;
  seller_current_tax_annual: number;  // what seller was paying
  tax_delta_annual: number;
  tax_delta_monthly: number;
  track1_dscr_before: number;
  track1_dscr_after: number;
  dscr_delta: number;
  supplemental_bill: boolean;
  notes: string[];
}

export function calculateReassessment(
  purchasePrice: number,
  state: string,
  sellerCurrentTaxAnnual: number,
  currentTrack1Dscr: number,
  pitiaMonthly: number,
  // v12 (P2-batch-I): Optional qualifyingRent — was backing it out from
  // DSCR × PITIA which is fragile (if DSCR is rounded to 3 decimals, the
  // backed-out rent is off by up to 0.05%). Now callers can pass it directly.
  qualifyingRentOverride?: number,
): ReassessmentResult {
  const stateRule = STATE_TAX_REASSESSMENT[state.toUpperCase()];
  const notes: string[] = [];

  if (!stateRule) {
    return {
      reassessed_tax_annual: sellerCurrentTaxAnnual,
      reassessed_tax_monthly: sellerCurrentTaxAnnual / 12,
      seller_current_tax_annual: sellerCurrentTaxAnnual,
      tax_delta_annual: 0,
      tax_delta_monthly: 0,
      track1_dscr_before: currentTrack1Dscr,
      track1_dscr_after: currentTrack1Dscr,
      dscr_delta: 0,
      supplemental_bill: false,
      notes: [`${state}: No specific reassessment rule — using seller's current tax bill. Verify with county assessor.`],
    };
  }

  const reassessedAnnual = purchasePrice * (stateRule.effective_rate_pct / 100);
  const reassessedMonthly = reassessedAnnual / 12;
  const deltaAnnual = reassessedAnnual - sellerCurrentTaxAnnual;
  const deltaMonthly = reassessedMonthly - sellerCurrentTaxAnnual / 12;

  // Recompute Track 1 with reassessed tax
  const newPitia = pitiaMonthly + deltaMonthly;
  // v12 (P2-batch-I): Use override if provided (no rounding loss); else back out from DSCR × PITIA
  const qualifyingRent = qualifyingRentOverride ?? (currentTrack1Dscr * pitiaMonthly);
  const newTrack1 = newPitia > 0 ? qualifyingRent / newPitia : 0;
  const dscrDelta = newTrack1 - currentTrack1Dscr;

  notes.push(`${state}: ${stateRule.notes}`);
  notes.push(`Seller pays $${sellerCurrentTaxAnnual.toLocaleString()}/yr. You will pay ~$${reassessedAnnual.toLocaleString()}/yr based on purchase price $${purchasePrice.toLocaleString()}.`);
  notes.push(`Tax delta: +$${deltaAnnual.toLocaleString()}/yr (+$${deltaMonthly.toFixed(0)}/mo). DSCR impact: ${currentTrack1Dscr.toFixed(2)}x → ${newTrack1.toFixed(2)}x (${dscrDelta >= 0 ? '+' : ''}${dscrDelta.toFixed(2)}x)`);

  if (stateRule.supplemental_bill) {
    notes.push(`⚠️ ${state} sends a SUPPLEMENTAL tax bill post-closing for the stub period. Budget for this separately.`);
  }

  return {
    reassessed_tax_annual: round(reassessedAnnual),
    reassessed_tax_monthly: round(reassessedMonthly),
    seller_current_tax_annual: sellerCurrentTaxAnnual,
    tax_delta_annual: round(deltaAnnual),
    tax_delta_monthly: round(deltaMonthly),
    track1_dscr_before: round(currentTrack1Dscr, 3),
    track1_dscr_after: round(newTrack1, 3),
    dscr_delta: round(dscrDelta, 3),
    supplemental_bill: stateRule.supplemental_bill,
    notes,
  };
}

// ---------------------------------------------------------------------------
// INSURANCE KILL GATE — v11 Part B′.3
// Insurance is a deal-level kill criterion, not an underwriting assumption.
// >90% of FL investors, 83% of CA investors missed deals due to insurance.
// ---------------------------------------------------------------------------

export const HIGH_RISK_ZONES = [
  'FL',           // statewide — hurricane/wind
  'CA_Coastal',   // wildfire + earthquake
  'CA_Wildfire',  // high fire severity zones
  'TX_Gulf',      // hurricane
  'LA_Coastal',   // hurricane
];

export interface InsuranceKillInput {
  state: string;
  county: string;
  is_high_risk_zone: boolean;
  insurance_quote_confirmed: boolean;  // bindable quote in hand
  quoted_premium_annual: number;
}

export interface InsuranceKillResult {
  kill: boolean;
  reason: string;
  stress_year3_premium: number;  // +25% stress
  notes: string[];
}

export function checkInsuranceGate(input: InsuranceKillInput): InsuranceKillResult {
  const notes: string[] = [];
  let kill = false;
  let reason = '';

  if (input.is_high_risk_zone && !input.insurance_quote_confirmed) {
    kill = true;
    reason = `PASS — Insurance unconfirmed in high-risk zone (${input.state}). Do not proceed until a bindable quote is in hand. >90% of FL investors and 83% of CA investors missed deals due to insurance issues (2024 survey).`;
    notes.push('KILL CRITERION: Insurance is a deal-level gate in high-risk zones, not an underwriting assumption.');
    notes.push('2024 data: 57% of investors nationwide reported insurance-driven missed opportunities.');
    notes.push('1-in-3 affordable housing providers saw 25%+ premium increases; some up to 500%.');
  } else if (input.is_high_risk_zone && input.insurance_quote_confirmed) {
    reason = `Insurance confirmed at $${input.quoted_premium_annual.toLocaleString()}/yr in high-risk zone (${input.state}). Stress-test Year 3 at +25%.`;
    notes.push('High-risk zone — insurance confirmed but volatile. Model 10-30% annual increase.');
  } else {
    reason = `Insurance at $${input.quoted_premium_annual.toLocaleString()}/yr. Standard risk zone.`;
  }

  const stressYear3 = input.quoted_premium_annual * 1.25;

  return {
    kill,
    reason,
    stress_year3_premium: round(stressYear3),
    notes,
  };
}

// ---------------------------------------------------------------------------
// BRRRR REFI-SEASONING GATE — v11 Part B′.4
// ---------------------------------------------------------------------------

export interface BrrrrInput {
  is_brrrr: boolean;
  months_held: number;
  arv: number;
  cost_basis: number;
  lender_seasoning_months: number;  // 6-12 standard
  monthly_pitia: number;
  is_easy_street: boolean;  // waives 12-mo STR cash-out seasoning
}

export interface BrrrrResult {
  seasoning_met: boolean;
  cash_out_basis: 'ARV' | 'cost_basis';
  max_cash_out: number;
  carry_cost: number;
  thesis_fails: boolean;
  notes: string[];
}

export function checkBrrrrGate(input: BrrrrInput): BrrrrResult {
  if (!input.is_brrrr) {
    return {
      seasoning_met: true,
      cash_out_basis: 'cost_basis',
      max_cash_out: 0,
      carry_cost: 0,
      thesis_fails: false,
      notes: ['Not a BRRRR deal — seasoning gate not applicable.'],
    };
  }

  const notes: string[] = [];
  const requiredSeasoning = input.is_easy_street ? 0 : input.lender_seasoning_months;
  const seasoningMet = input.months_held >= requiredSeasoning;
  const carryCost = input.monthly_pitia * requiredSeasoning;

  // Cash-out basis: ARV if seasoned, cost basis if not
  // v12 (P2-batch-I): LTV cap from constants (was hardcoded 0.75)
  const cashOutBasis: 'ARV' | 'cost_basis' = seasoningMet ? 'ARV' : 'cost_basis';
  const cashOutLtvFactor = BRRRR_CASH_OUT_LTV / 100;
  const maxCashOut = seasoningMet ? input.arv * cashOutLtvFactor : input.cost_basis * cashOutLtvFactor;

  if (input.is_easy_street) {
    notes.push('Easy Street Capital: waives 12-month STR cash-out seasoning — BRRRR edge.');
  }

  if (!seasoningMet) {
    notes.push(`⚠️ Seasoning NOT met: ${input.months_held}mo held, ${requiredSeasoning}mo required. Cash-out on cost basis ($${input.cost_basis.toLocaleString()}), NOT ARV ($${input.arv.toLocaleString()}).`);
    notes.push(`Carry cost during season: $${carryCost.toLocaleString()} (${requiredSeasoning}mo × $${input.monthly_pitia}/mo PITIA).`);
    if (input.arv > input.cost_basis * 1.2) {
      notes.push('BRRRR thesis may FAIL: ARV-cash-out gated. The gap between cost basis and ARV cannot be extracted until seasoning met.');
    }
  } else {
    notes.push(`Seasoning met: ${input.months_held}mo ≥ ${requiredSeasoning}mo required. Cash-out on ARV ($${input.arv.toLocaleString()}).`);
  }

  return {
    seasoning_met: seasoningMet,
    cash_out_basis: cashOutBasis,
    max_cash_out: round(maxCashOut),
    carry_cost: round(carryCost),
    thesis_fails: !seasoningMet && input.arv > input.cost_basis * 1.2,
    notes,
  };
}
