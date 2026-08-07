// ============================================================
// DSCR Deal Desk v11.0 — Property-Tax Reassessment Engine
// Part B'.1: Sale resets tax basis in many states.
// Using seller's current bill silently overstates DSCR.
// PITIA MUST use reassessed_tax, NOT current bill.
// ============================================================
//
// Verified state rules (per Part B'.1):
//   CA Prop 13: purchase price = new base; 1% statewide + local bonds;
//               2% annual cap; supplemental bill post-closing
//   TX: 2-3% of market value annual rate; reassesses on purchase (no cap)
//   FL: purchase-year reset to market value (Save Our Homes does NOT
//       protect investment property; non-homestead = annual cap 10%)
//   NJ: rebases to purchase price (post-2024 AFFH law changes pending)
//   NY: rebases to purchase price; STAR exemptions for owner-occupied only
//   IL: rebases to fair market value at sale
//   All others: generally reassess on transfer; default to GENERAL_REASSESS
//
// Source: BOE CA (4,5,6), TX Comptroller (8), FL DOR, NJ Treasury, NY ORPTS, IL DOR
// ============================================================

import type { StateReassessmentRule, ReassessmentResult, ProvenanceLabel } from './types';

// ============================================================
// VERIFIED STATE REASSESSMENT RULES (June 2026)
// effectiveMillRatePct = effective annual tax as % of market value
// ============================================================

export const STATE_REASSESSMENT_RULES: Record<string, StateReassessmentRule> = {
  CA: {
    state: 'CA',
    rule: 'CA_PROP_13',
    // 1% statewide + ~0.25% local bonds / special assessments → ~1.25% avg
    effectiveMillRatePct: 1.25,
    annualIncreaseCapPct: 2,
    purchaseYearReset: true,
    supplementalBillExpected: true,
    provenance: 'VERIFIED_PRIMARY',
    source: 'CA BOE Prop 13 (§1 of Article XIIIA); calstatepayer.com 2026',
    asOfDate: '2026-06',
  },
  TX: {
    state: 'TX',
    rule: 'TX_MARKET_RATE',
    // TX avg ~1.7% of market value, varies by county (1.5%–2.3%)
    effectiveMillRatePct: 1.7,
    annualIncreaseCapPct: 10,  // no homestead; 10% non-homestead cap ( appraisal cap)
    purchaseYearReset: true,
    supplementalBillExpected: false,
    provenance: 'VERIFIED_PRIMARY',
    source: 'TX Comptroller Property Tax Assistance; WindowOnStateGovernment 2026',
    asOfDate: '2026-06',
  },
  FL: {
    state: 'FL',
    rule: 'FL_PURCHASE_RESET',
    // FL avg ~0.89% (non-homestead); 10% annual non-homestead cap
    effectiveMillRatePct: 0.89,
    annualIncreaseCapPct: 10,  // Non-homestead property cap (Save Our Homes = homestead only)
    purchaseYearReset: true,
    supplementalBillExpected: false,
    provenance: 'VERIFIED_PRIMARY',
    source: 'FL Dept. of Revenue; Save Our Homes §193.155 (homestead only); non-homestead §193.1554',
    asOfDate: '2026-06',
  },
  NJ: {
    state: 'NJ',
    rule: 'NJ_RESET',
    // NJ avg ~2.23% (highest in US); rebases on sale
    effectiveMillRatePct: 2.23,
    annualIncreaseCapPct: 0,  // no cap; annual reval cycles
    purchaseYearReset: true,
    supplementalBillExpected: true,
    provenance: 'VERIFIED_PRIMARY',
    source: 'NJ Treasury Division of Taxation; NJ property tax revaluation cycles',
    asOfDate: '2026-06',
  },
  NY: {
    state: 'NY',
    rule: 'NY_RESET',
    // NY avg ~1.4% outside NYC; NYC ~0.8-1.0%
    effectiveMillRatePct: 1.4,
    annualIncreaseCapPct: 0,  // varies by locality; STAR only owner-occupied
    purchaseYearReset: true,
    supplementalBillExpected: false,
    provenance: 'VERIFIED_PRIMARY',
    source: 'NY ORPTS; STAR exemption (owner-occupied only)',
    asOfDate: '2026-06',
  },
  IL: {
    state: 'IL',
    rule: 'IL_RESET',
    // IL avg ~2.0% (2nd highest); reassesses on transfer
    effectiveMillRatePct: 2.0,
    annualIncreaseCapPct: 0,
    purchaseYearReset: true,
    supplementalBillExpected: false,
    provenance: 'VERIFIED_PRIMARY',
    source: 'IL Dept. of Revenue; IL Property Tax Code (35 ILCS 200/)',
    asOfDate: '2026-06',
  },
  // Generic state default — most states reassess on sale to fair market value
  DEFAULT: {
    state: 'OTHER',
    rule: 'GENERAL_REASSESS',
    effectiveMillRatePct: 0.95,  // national median
    annualIncreaseCapPct: 0,
    purchaseYearReset: true,
    supplementalBillExpected: false,
    provenance: 'VERIFIED_SECONDARY',
    source: 'National median property tax rate; state-by-state variation',
    asOfDate: '2026-06',
  },
};

// ============================================================
// PUBLIC API
// ============================================================

export function getReassessmentRule(state: string): StateReassessmentRule {
  return STATE_REASSESSMENT_RULES[state.toUpperCase()] ?? STATE_REASSESSMENT_RULES.DEFAULT;
}

/**
 * Compute reassessed annual property tax based on purchase price.
 *
 * Sale triggers reassessment in CA, TX, FL, NJ, NY, IL and most other states.
 * The seller's current tax bill is NO LONGER VALID after the sale.
 *
 * @param purchasePrice - buyer's purchase price
 * @param state - 2-letter state code
 * @param sellerAnnualTax - current seller tax bill (for comparison only)
 * @param overrideMillRatePct - optional county-specific override
 */
export function computeReassessedTax(
  purchasePrice: number,
  state: string,
  sellerAnnualTax: number,
  overrideMillRatePct?: number,
): {
  reassessedAnnualTax: number;
  rule: StateReassessmentRule;
  deltaAnnual: number;
  deltaMonthly: number;
  supplementalBillEstimate: number;
  note: string;
} {
  const rule = getReassessmentRule(state);
  const millRate = (overrideMillRatePct ?? rule.effectiveMillRatePct) / 100;
  const reassessedAnnualTax = Math.round(purchasePrice * millRate);
  const deltaAnnual = reassessedAnnualTax - sellerAnnualTax;
  const deltaMonthly = Math.round(deltaAnnual / 12);

  // CA supplemental bill = the catch-up tax for the stub period from sale date to fiscal year-end
  // Approximation: 6 months average stub × delta / 12
  const supplementalBillEstimate = rule.supplementalBillExpected
    ? Math.round((deltaAnnual / 12) * 6)  // ~6 month average stub
    : 0;

  let note: string;
  switch (rule.rule) {
    case 'CA_PROP_13':
      note = `CA Prop 13: Purchase price ($${purchasePrice.toLocaleString()}) becomes new assessed value. ` +
             `Seller paid $${sellerAnnualTax.toLocaleString()}/yr on prior locked basis; ` +
             `your first-year bill = $${reassessedAnnualTax.toLocaleString()}/yr (${rule.effectiveMillRatePct}% of purchase price). ` +
             `Annual increases capped at 2%. Supplemental bill (~$${supplementalBillEstimate.toLocaleString()}) arrives 3-9 months post-closing.`;
      break;
    case 'TX_MARKET_RATE':
      note = `TX: Property tax reassesses to market value (= purchase price) at sale. ` +
             `Effective rate ~${rule.effectiveMillRatePct}% annually. ` +
             `Seller paid $${sellerAnnualTax.toLocaleString()}/yr; new bill = $${reassessedAnnualTax.toLocaleString()}/yr. ` +
             `Non-homestead annual cap is 10% — annual increases can be material.`;
      break;
    case 'FL_PURCHASE_RESET':
      note = `FL: Non-homestead investment property reassesses to market value at sale (Save Our Homes applies only to homestead). ` +
             `Effective rate ~${rule.effectiveMillRatePct}%; 10% annual appraisal cap.`;
      break;
    case 'NJ_RESET':
      note = `NJ: Property reassesses to purchase price at sale (NJ has highest avg property tax in US ~2.23%). ` +
             `Verify exact revaluation cycle in your municipality.`;
      break;
    case 'NY_RESET':
      note = `NY: Property reassesses on transfer. STAR exemption is owner-occupied ONLY — investment property does NOT qualify. ` +
             `Confirm any local abatements expire at sale.`;
      break;
    case 'IL_RESET':
      note = `IL: Property reassesses to fair market value at sale (IL is 2nd highest property tax state). ` +
             `Verify county reassessment cycle.`;
      break;
    default:
      note = `${state}: Most states reassess property to fair market value on sale. ` +
             `Verify with county assessor; the seller's bill is NOT your bill.`;
  }

  return {
    reassessedAnnualTax,
    rule,
    deltaAnnual,
    deltaMonthly,
    supplementalBillEstimate,
    note,
  };
}

/**
 * Compute the DSCR impact of using reassessed taxes vs seller's current bill.
 * Returns the delta in Track 1 DSCR.
 *
 * @param qualifyingRent - monthly qualifying rent
 * @param pitiaBefore - current PITIA (with seller tax)
 * @param sellerAnnualTax - seller's current annual tax
 * @param reassessedAnnualTax - new buyer's annual tax
 * @returns full ReassessmentResult with DSCR before/after
 */
export function computeReassessmentDSCRImpact(
  purchasePrice: number,
  state: string,
  qualifyingRent: number,
  pitiaBefore: number,
  sellerAnnualTax: number,
  reassessedAnnualTax: number,
): ReassessmentResult {
  const rule = getReassessmentRule(state);
  const taxDeltaAnnual = reassessedAnnualTax - sellerAnnualTax;
  const taxDeltaMonthly = taxDeltaAnnual / 12;
  const pitiaAfter = pitiaBefore + taxDeltaMonthly;

  const dscrBefore = pitiaBefore > 0 ? qualifyingRent / pitiaBefore : 0;
  const dscrAfter = pitiaAfter > 0 ? qualifyingRent / pitiaAfter : 0;
  const dscrImpact = dscrAfter - dscrBefore;

  const supplementalBillEstimate = rule.supplementalBillExpected
    ? Math.round((taxDeltaAnnual / 12) * 6)
    : 0;

  return {
    sellerAnnualTax,
    reassessedAnnualTax,
    taxDeltaAnnual,
    taxDeltaMonthly,
    pitiaBefore: Math.round(pitiaBefore * 100) / 100,
    pitiaAfter: Math.round(pitiaAfter * 100) / 100,
    dscrBefore: Math.round(dscrBefore * 1000) / 1000,
    dscrAfter: Math.round(dscrAfter * 1000) / 1000,
    dscrImpact: Math.round(dscrImpact * 1000) / 1000,
    supplementalBillEstimate,
    rule: rule.rule,
    note: buildImpactNote(rule.rule, dscrBefore, dscrAfter, dscrImpact, taxDeltaMonthly),
  };
}

function buildImpactNote(
  rule: string,
  dscrBefore: number,
  dscrAfter: number,
  dscrImpact: number,
  taxDeltaMonthly: number,
): string {
  const sign = dscrImpact < 0 ? '↓' : '↑';
  return `Seller currently pays taxes on prior basis. As the new buyer, your ` +
         `reassessed bill shifts PITIA by $${Math.abs(Math.round(taxDeltaMonthly))}/mo. ` +
         `Track 1 DSCR: ${dscrBefore.toFixed(3)} → ${dscrAfter.toFixed(3)} (${sign}${Math.abs(dscrImpact).toFixed(3)}). ` +
         `This is the same failure mode as the vacancy haircut — using the wrong number silently overstates DSCR.`;
}

/**
 * Get all states with verified reassessment rules.
 * Used to populate the UI for the "show me my state" feature.
 */
export function listVerifiedStates(): string[] {
  return Object.keys(STATE_REASSESSMENT_RULES).filter(s => s !== 'DEFAULT');
}
