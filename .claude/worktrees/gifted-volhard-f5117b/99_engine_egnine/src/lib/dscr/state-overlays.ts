// ============================================================================
// STATE OVERLAY DATABASE
// ============================================================================
// Real per-state prepay restrictions, licensing constraints, and high-cost
// / business-purpose overlays that affect DSCR loan eligibility and pricing.
// Source: typical non-QM DSCR lender matrix overlays (state prepay bans,
// licensing requirements, high-cost thresholds).
// ============================================================================

export interface StateOverlay {
  code: string;
  name: string;
  // True if the state restricts or bans prepayment penalties on investment
  // property loans (NY, NJ, MA, MN, SC for certain loan sizes).
  prepayRestricted: boolean;
  // Human-readable note on the restriction
  prepayNote: string;
  // True if state requires specific mortgage license (NMLS) for originator
  nmlsRequired: boolean;
  // True if state has high-cost loan statute that may affect DSCR loans
  // (typically only affects owner-occupied, but worth flagging)
  highCostState: boolean;
  // True if state requires attorney for closing (NY, NJ, MA, SC, DE, GA)
  attorneyState: boolean;
  // True if state is a judicial foreclosure state (longer timeline, higher risk)
  judicialForeclosure: boolean;
  // Estimated property tax rate (% of value) — used for tax reassessment stress
  estimatedTaxRate: number;
  // True if state has rent control / stabilization that could limit income
  rentControlState: boolean;
  // Notes on STR regulations
  strRegulationNote: string;
}

export const STATE_OVERLAYS: Record<string, StateOverlay> = {
  AL: { code: 'AL', name: 'Alabama', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.42, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  AK: { code: 'AK', name: 'Alaska', prepayRestricted: true, prepayNote: 'AK restricts prepay penalties on certain residential loans per v5.0 Spec.', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.04, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  AZ: { code: 'AZ', name: 'Arizona', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.63, rentControlState: false, strRegulationNote: 'Phoenix has STR permit requirements.' },
  AR: { code: 'AR', name: 'Arkansas', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.61, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  CA: { code: 'CA', name: 'California', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: true, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.74, rentControlState: true, strRegulationNote: 'Heavy STR regulation — many cities ban or cap STRs. AB-318 requires registration.' },
  CO: { code: 'CO', name: 'Colorado', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: false, estimatedTaxRate: 0.51, rentControlState: false, strRegulationNote: 'Denver/Boulder require STR licenses.' },
  CT: { code: 'CT', name: 'Connecticut', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: true, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 1.76, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  DE: { code: 'DE', name: 'Delaware', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 0.56, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  DC: { code: 'DC', name: 'District of Columbia', prepayRestricted: true, prepayNote: 'DC restricts prepay penalties on certain residential loans.', nmlsRequired: true, highCostState: true, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.56, rentControlState: true, strRegulationNote: 'STR license required, strict caps.' },
  FL: { code: 'FL', name: 'Florida', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.89, rentControlState: false, strRegulationNote: 'Miami-Dade has STR license requirements; state preempts local bans on SFR/condo STR.' },
  GA: { code: 'GA', name: 'Georgia', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 0.92, rentControlState: false, strRegulationNote: 'Atlanta requires STR registration.' },
  HI: { code: 'HI', name: 'Hawaii', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: true, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.28, rentControlState: false, strRegulationNote: 'Honolulu enforces minimum 30-day stays (effectively bans STR outside resort zones).' },
  ID: { code: 'ID', name: 'Idaho', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: false, estimatedTaxRate: 0.69, rentControlState: false, strRegulationNote: 'State preempts local STR bans on SFR.' },
  IL: { code: 'IL', name: 'Illinois', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: true, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 2.13, rentControlState: false, strRegulationNote: 'Chicago requires STR license; high fees.' },
  IN: { code: 'IN', name: 'Indiana', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.81, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  IA: { code: 'IA', name: 'Iowa', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.49, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  KS: { code: 'KS', name: 'Kansas', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.33, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  KY: { code: 'KY', name: 'Kentucky', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.84, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  LA: { code: 'LA', name: 'Louisiana', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 0.52, rentControlState: false, strRegulationNote: 'New Orleans requires STR permit; strict caps.' },
  ME: { code: 'ME', name: 'Maine', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.09, rentControlState: false, strRegulationNote: 'Portland requires STR registration.' },
  MD: { code: 'MD', name: 'Maryland', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: true, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.04, rentControlState: false, strRegulationNote: 'Baltimore requires STR license.' },
  MA: { code: 'MA', name: 'Massachusetts', prepayRestricted: true, prepayNote: 'MA restricts prepay penalties on owner-occupied 1-4 unit properties; non-owner occupied is exempt but lenders typically avoid.', nmlsRequired: true, highCostState: true, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 1.17, rentControlState: false, strRegulationNote: 'Boston requires STR registration; some neighborhoods cap STRs.' },
  MI: { code: 'MI', name: 'Michigan', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.41, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  MN: { code: 'MN', name: 'Minnesota', prepayRestricted: true, prepayNote: 'MN bans prepay penalties for first 3 years on owner-occupied 1-4 unit loans; non-owner occupied is exempt but lenders typically comply.', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.08, rentControlState: false, strRegulationNote: 'Minneapolis requires STR license.' },
  MS: { code: 'MS', name: 'Mississippi', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.79, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  MO: { code: 'MO', name: 'Missouri', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.95, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  MT: { code: 'MT', name: 'Montana', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.85, rentControlState: false, strRegulationNote: 'Recent statewide STR regulation requires registration.' },
  NE: { code: 'NE', name: 'Nebraska', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.69, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  NV: { code: 'NV', name: 'Nevada', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.55, rentControlState: false, strRegulationNote: 'Las Vegas requires STR license; strict caps in residential zones.' },
  NH: { code: 'NH', name: 'New Hampshire', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.86, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  NJ: { code: 'NJ', name: 'New Jersey', prepayRestricted: true, prepayNote: 'NJ restricts prepay penalties on 1-6 unit owner-occupied properties; non-owner occupied is exempt but most lenders comply.', nmlsRequired: true, highCostState: true, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 2.31, rentControlState: false, strRegulationNote: 'Jersey City/Hoboken require STR registration.' },
  NM: { code: 'NM', name: 'New Mexico', prepayRestricted: true, prepayNote: 'NM restricts prepay penalties on residential loans per v5.0 Spec — originating a 5-year step-down PPP would create a defective loan.', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.74, rentControlState: false, strRegulationNote: 'Santa Fe requires STR license.' },
  NY: { code: 'NY', name: 'New York', prepayRestricted: true, prepayNote: 'NY bans prepay penalties on 1-2 family owner-occupied loans under $2.5M; non-owner occupied DSCR loans typically use defeasance instead of step-down prepay.', nmlsRequired: true, highCostState: true, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 1.65, rentControlState: true, strRegulationNote: 'NYC bans most STRs under Local Law 18; Buffalo/Syracuse require registration.' },
  NC: { code: 'NC', name: 'North Carolina', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.84, rentControlState: false, strRegulationNote: 'Asheville requires STR permit.' },
  ND: { code: 'ND', name: 'North Dakota', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.99, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  OH: { code: 'OH', name: 'Ohio', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.31, rentControlState: false, strRegulationNote: 'Columbus requires STR registration.' },
  OK: { code: 'OK', name: 'Oklahoma', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.88, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  OR: { code: 'OR', name: 'Oregon', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: true, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.93, rentControlState: true, strRegulationNote: 'Portland requires STR permit; owner-occupancy required in many zones.' },
  PA: { code: 'PA', name: 'Pennsylvania', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.36, rentControlState: false, strRegulationNote: 'Philadelphia requires STR license; strict owner-occupancy rules.' },
  RI: { code: 'RI', name: 'Rhode Island', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 1.59, rentControlState: false, strRegulationNote: 'Providence requires STR registration.' },
  SC: { code: 'SC', name: 'South Carolina', prepayRestricted: true, prepayNote: 'SC restricts prepay penalties on certain owner-occupied loans; non-owner occupied is exempt.', nmlsRequired: true, highCostState: false, attorneyState: true, judicialForeclosure: true, estimatedTaxRate: 0.57, rentControlState: false, strRegulationNote: 'Charleston requires STR permit.' },
  SD: { code: 'SD', name: 'South Dakota', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.22, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  TN: { code: 'TN', name: 'Tennessee', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.71, rentControlState: false, strRegulationNote: 'Nashville requires STR permit; strict zoning caps.' },
  TX: { code: 'TX', name: 'Texas', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.69, rentControlState: false, strRegulationNote: 'Austin requires STR license; caps in residential zones.' },
  UT: { code: 'UT', name: 'Utah', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.62, rentControlState: false, strRegulationNote: 'Park City requires STR permit.' },
  VT: { code: 'VT', name: 'Vermont', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.78, rentControlState: false, strRegulationNote: 'Statewide STR registration required.' },
  VA: { code: 'VA', name: 'Virginia', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.93, rentControlState: false, strRegulationNote: 'Arlington/Alexandria require STR registration.' },
  WA: { code: 'WA', name: 'Washington', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: true, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.95, rentControlState: false, strRegulationNote: 'Seattle requires STR license; owner-occupancy required in most zones.' },
  WV: { code: 'WV', name: 'West Virginia', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.55, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
  WI: { code: 'WI', name: 'Wisconsin', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 1.65, rentControlState: false, strRegulationNote: 'Madison/Milwaukee require STR registration.' },
  WY: { code: 'WY', name: 'Wyoming', prepayRestricted: false, prepayNote: '', nmlsRequired: true, highCostState: false, attorneyState: false, judicialForeclosure: true, estimatedTaxRate: 0.61, rentControlState: false, strRegulationNote: 'No statewide STR restrictions.' },
};

export function getStateOverlay(stateCode: string): StateOverlay | null {
  if (!stateCode || stateCode.length !== 2) return null;
  return STATE_OVERLAYS[stateCode.toUpperCase()] ?? null;
}

/**
 * Returns a list of state-specific eligibility warnings for the deal.
 */
export function getStateWarnings(stateCode: string, rentType: string): string[] {
  const overlay = getStateOverlay(stateCode);
  if (!overlay) return ['Unknown state code — overlays not applied.'];

  const warnings: string[] = [];
  if (overlay.prepayRestricted) warnings.push(`PREPAY: ${overlay.prepayNote}`);
  if (overlay.highCostState) warnings.push('HIGH-COST STATE: state-specific thresholds apply; verify loan structure passes high-cost test.');
  if (overlay.attorneyState) warnings.push('ATTORNEY STATE: closing requires attorney; higher closing costs (~$500–$1,500).');
  if (overlay.judicialForeclosure) warnings.push('JUDICIAL FORECLOSURE: longer timeline in default (~6–18 months).');
  if (overlay.rentControlState) warnings.push('RENT CONTROL: state permits local rent control; cap upside in regulated markets.');
  if ((rentType === 'STR') && overlay.strRegulationNote) {
    warnings.push(`STR REGULATION: ${overlay.strRegulationNote}`);
  }
  return warnings;
}

import { STATE_TAX_FALLBACK_PCT } from './constants';

/**
 * Estimated property tax as % of value, used for tax-reassessment stress test.
 * v12 (P2-batch-G): Was hardcoded 1.1 fallback — now STATE_TAX_FALLBACK_PCT from constants.
 * Also handles US territories (PR, VI, GU) by returning the fallback rather than
 * silently treating them as the national avg without indicating why.
 */
export function getEstimatedTaxRate(stateCode: string): number {
  const overlay = getStateOverlay(stateCode);
  if (overlay) return overlay.estimatedTaxRate;
  // v12 (P2-batch-G): Territories (PR, VI, GU, AS, MP) and unknown states use fallback.
  // Callers can detect this via getStateOverlay() returning null.
  return STATE_TAX_FALLBACK_PCT;
}
