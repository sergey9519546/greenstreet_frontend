// ============================================================
// DSCR Loan Command Center v7.0 — STR Underwriting Engine
// Section 8: Three STR Worlds (NEVER blended), Legality Gate
//
// World 1 — Long-term market rent: lower of lease and 1007 (no haircut)
// World 2 — Projected STR: STR_Gross × 0.80 (~20% haircut on AirDNA projection)
// World 3 — Documented historical: 12-month actual revenue × 0.90 (~10% haircut, lower than World 2)
//
// LEGALITY GATE runs BEFORE any STR income is computed.
// Market Direction: "Documented history increasingly required
//   over raw projections. [Market pattern, 2026]"
// ============================================================

import type {
  PropertyInputs,
  STRUnderwritingResult,
  STRWorld,
  STRLegalityGate,
  DocChecklistItem,
  STRMonthlySeasonality,
  STRMonthBreakdown,
  IOPeriod,
} from './types';
import { STR_RESTRICTION_STATES } from './types';
import { calculatePI, calculatePITIA, getDSCRGradient } from './engine';

// ============================================================
// CONSTANTS
// ============================================================

const PROJECTED_STR_HAIRCUT_PCT = 20;   // World 2 — AirDNA projections get 20% haircut (audit req #4)
const DOCUMENTED_STR_HAIRCUT_PCT = 10;  // World 3 — 12-mo actual history gets lower 10% haircut (audit req #5)
const MARKET_DIRECTION_WARNING =
  'Documented history increasingly required over raw projections. [Market pattern, 2026]';
const MAX_MONTHLY_INCOME = 10_000_000;
const MAX_ANNUAL_STR_REVENUE = MAX_MONTHLY_INCOME * 12;
const MAX_MONTHLY_PITIA = 10_000_000;
const MAX_LOAN_AMOUNT = 100_000_000;
const MAX_ANNUAL_PROPERTY_COST = 20_000_000;
const MAX_SEASONALITY_INDEX = 300;

function isFiniteInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

function isValidMonthlyIncome(value: number): boolean {
  return isFiniteInRange(value, 0.01, MAX_MONTHLY_INCOME);
}

function safeRound(value: number, decimals = 0): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function safeDSCR(income: number, pitiaTotal: number): number {
  if (!Number.isFinite(income) || income < 0 || !isFiniteInRange(pitiaTotal, 0.01, MAX_MONTHLY_PITIA)) {
    return 0;
  }
  return safeRound(income / pitiaTotal, 3);
}

// ============================================================
// v11.1 STR MONTHLY SEASONALITY (AUDIT-FINAL issue 6)
// National-average seasonality index — AirDNA 2024-2025 US national avg
// 100 = annual mean month. Markets deviate; this is the baseline model.
// Source: AirDNA 2024 national STR performance report (composite of
// top-50 US metros, seasonally adjusted). Caller can override per-market.
// ============================================================

export const US_NATIONAL_STR_SEASONALITY: { month: string; index: number }[] = [
  { month: 'Jan', index: 75 },   // post-holiday lull
  { month: 'Feb', index: 80 },   // slight recovery, Presidents' Day weekend
  { month: 'Mar', index: 95 },   // spring break begins
  { month: 'Apr', index: 105 },  // spring break peak, Easter
  { month: 'May', index: 110 },  // shoulder season begins
  { month: 'Jun', index: 130 },  // summer travel starts
  { month: 'Jul', index: 140 },  // PEAK — summer vacation
  { month: 'Aug', index: 130 },  // late summer, back-to-school
  { month: 'Sep', index: 100 },  // shoulder season
  { month: 'Oct', index: 95 },   // fall travel, leaf-peeping
  { month: 'Nov', index: 80 },   // pre-holiday lull, Thanksgiving bump partial
  { month: 'Dec', index: 90 },   // holiday travel, ski season begins
];

export const FLORIDA_SNOWBIRD_STR_SEASONALITY: { month: string; index: number }[] = [
  { month: 'Jan', index: 140 },
  { month: 'Feb', index: 145 },
  { month: 'Mar', index: 140 },
  { month: 'Apr', index: 120 },
  { month: 'May', index: 95 },
  { month: 'Jun', index: 85 },
  { month: 'Jul', index: 80 },
  { month: 'Aug', index: 75 },
  { month: 'Sep', index: 70 },
  { month: 'Oct', index: 90 },
  { month: 'Nov', index: 120 },
  { month: 'Dec', index: 140 },
];

export const MOUNTAIN_RESORT_STR_SEASONALITY: { month: string; index: number }[] = [
  { month: 'Jan', index: 150 },
  { month: 'Feb', index: 160 },
  { month: 'Mar', index: 140 },
  { month: 'Apr', index: 60 },
  { month: 'May', index: 50 },
  { month: 'Jun', index: 110 },
  { month: 'Jul', index: 130 },
  { month: 'Aug', index: 120 },
  { month: 'Sep', index: 90 },
  { month: 'Oct', index: 60 },
  { month: 'Nov', index: 50 },
  { month: 'Dec', index: 180 },
];

/**
 * Compute monthly STR seasonality breakdown for a deal.
 *
 * Returns 12 monthly data points showing:
 *   - Projected gross revenue (annual projection × monthly index ÷ 1200)
 *   - Haircut revenue (after 20% Track-1 haircut)
 *   - Monthly DSCR (haircut revenue ÷ monthly PITIA)
 *   - Off-season flag (DSCR < 1.0)
 *
 * Plus aggregate stats: off-season months list, worst/best month, warning.
 *
 * The model uses the US national average seasonality index. Per-market
 * overrides can be applied by passing a custom `seasonalityIndex` array
 * (e.g., Florida snowbird peak in winter, Aspen ski peak in Jan/Feb).
 */
export function computeSTRMonthlySeasonality(
  annualProjectedSTR: number,
  monthlyPITIA: number,
  haircutPct: number = PROJECTED_STR_HAIRCUT_PCT,
  seasonalityIndex: { month: string; index: number }[] = US_NATIONAL_STR_SEASONALITY,
): STRMonthlySeasonality {
  const hasValidRevenue = isFiniteInRange(annualProjectedSTR, 0.01, MAX_ANNUAL_STR_REVENUE);
  const hasValidPITIA = isFiniteInRange(monthlyPITIA, 0.01, MAX_MONTHLY_PITIA);
  const hasValidHaircut = isFiniteInRange(haircutPct, 0, 100);
  const normalizedAnnualRevenue = hasValidRevenue ? annualProjectedSTR : 0;
  const normalizedMonthlyPITIA = hasValidPITIA ? monthlyPITIA : 0;
  const normalizedHaircut = hasValidHaircut ? haircutPct : PROJECTED_STR_HAIRCUT_PCT;

  const suppliedSeasonality = Array.isArray(seasonalityIndex) ? seasonalityIndex : [];
  const hasValidSeasonality =
    suppliedSeasonality.length === 12 &&
    suppliedSeasonality.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        typeof entry.month === 'string' &&
        entry.month.trim().length > 0 &&
        isFiniteInRange(entry.index, 0.01, MAX_SEASONALITY_INDEX),
    );
  const usedFallbackSeasonality = !hasValidSeasonality;
  const normalizedSeasonality = hasValidSeasonality
    ? suppliedSeasonality.map((entry) => ({ month: entry.month.trim(), index: entry.index }))
    : US_NATIONAL_STR_SEASONALITY;
  const indexSum = normalizedSeasonality.reduce((sum, entry) => sum + entry.index, 0);
  const haircutFactor = 1 - normalizedHaircut / 100;

  const months: STRMonthBreakdown[] = normalizedSeasonality.map((month, index) => {
    const projectedRevenue = normalizedAnnualRevenue * month.index / indexSum;
    const haircutRevenue = projectedRevenue * haircutFactor;
    const monthlyDSCR = hasValidRevenue && hasValidPITIA
      ? safeDSCR(haircutRevenue, normalizedMonthlyPITIA)
      : 0;
    return {
      month: month.month,
      monthIndex: index + 1,
      seasonalityIndex: month.index,
      projectedRevenue: safeRound(projectedRevenue),
      haircutRevenue: safeRound(haircutRevenue),
      monthlyPITIA: safeRound(normalizedMonthlyPITIA),
      monthlyDSCR,
      isOffSeason: hasValidRevenue && hasValidPITIA && monthlyDSCR < 1.0,
    };
  });

  const annualRevenueProjected = months.reduce((sum, month) => sum + month.projectedRevenue, 0);
  const annualRevenueHaircut = months.reduce((sum, month) => sum + month.haircutRevenue, 0);
  const offSeasonMonths = months.filter((month) => month.isOffSeason).map((month) => month.month);
  const sortedByDSCR = [...months].sort((a, b) => a.monthlyDSCR - b.monthlyDSCR);
  const worstMonth = sortedByDSCR[0];
  const bestMonth = sortedByDSCR[sortedByDSCR.length - 1];

  const warningParts: string[] = [];
  if (usedFallbackSeasonality && seasonalityIndex !== US_NATIONAL_STR_SEASONALITY) {
    warningParts.push('Custom seasonality was empty or malformed; the 12-month national baseline was used.');
  }
  if (!hasValidHaircut) {
    warningParts.push(`Haircut must be a finite percentage from 0% to 100%; the ${PROJECTED_STR_HAIRCUT_PCT}% default was used.`);
  }
  if (!hasValidRevenue) {
    warningParts.push('Seasonality is incomplete: enter finite annual projected STR revenue greater than $0.');
  }
  if (!hasValidPITIA) {
    warningParts.push('Monthly DSCR is unknown: enter a finite monthly PITIA greater than $0.');
  }
  if (hasValidRevenue && hasValidPITIA && offSeasonMonths.length > 0) {
    warningParts.push(
      `⚠️ ${offSeasonMonths.length} month${offSeasonMonths.length > 1 ? 's' : ''} below 1.0 DSCR: ${offSeasonMonths.join(', ')}. ` +
      `Worst: ${worstMonth.month} (${worstMonth.monthlyDSCR.toFixed(2)}×). ` +
      'Investor must reserve cash for off-season PITIA gaps.',
    );
  }
  if (hasValidRevenue && hasValidPITIA && worstMonth.monthlyDSCR < 0.75) {
    warningParts.push(
      `🚨 ${worstMonth.month} DSCR ${worstMonth.monthlyDSCR.toFixed(2)}× — severe negative carry. ` +
      `Track 2 investor survival requires ~3 months PITIA reserves ($${safeRound(normalizedMonthlyPITIA * 3).toFixed(0)}) to bridge.`,
    );
  }
  if (hasValidRevenue && hasValidPITIA && bestMonth.monthlyDSCR > 1.5) {
    warningParts.push(
      `✓ ${bestMonth.month} peak month DSCR ${bestMonth.monthlyDSCR.toFixed(2)}× — strong seasonal upside; ` +
      'build cash reserves during peak to cover off-season.',
    );
  }
  if (hasValidRevenue && hasValidPITIA && warningParts.length === 0) {
    warningParts.push(
      `Stable year-round DSCR (all months ≥ 1.0). Best: ${bestMonth.month} (${bestMonth.monthlyDSCR.toFixed(2)}×); ` +
      `Worst: ${worstMonth.month} (${worstMonth.monthlyDSCR.toFixed(2)}×).`,
    );
  }

  return {
    months,
    annualRevenueProjected: safeRound(annualRevenueProjected),
    annualRevenueHaircut: safeRound(annualRevenueHaircut),
    offSeasonMonths,
    worstMonth: hasValidRevenue && hasValidPITIA ? worstMonth.month : 'Unknown',
    worstMonthDSCR: worstMonth.monthlyDSCR,
    bestMonth: hasValidRevenue && hasValidPITIA ? bestMonth.month : 'Unknown',
    bestMonthDSCR: bestMonth.monthlyDSCR,
    warningMessage: warningParts.join(' '),
  };
}

// ============================================================
// SECTION 8.2: STR LEGALITY GATE
// Runs BEFORE any STR income is computed.
// Output: CLEAR / RESTRICTED / UNCERTAIN / PROHIBITED
// ============================================================

export function checkSTRLegality(
  state: string,
  city: string,
  hoaPolicy: 'ALLOWS' | 'SILENT' | 'PROHIBITS' | 'UNKNOWN',
  hasPermit: boolean,
  permitCapOpen: boolean,
  minStayDays: number,
  ownerOccupancyRequired: boolean,
  enforcementIntensity: 'LOW' | 'MODERATE' | 'HIGH',
  pendingLegislation: boolean,
): STRLegalityGate {
  const isRestrictedState = (STR_RESTRICTION_STATES as readonly string[]).includes(state.toUpperCase());

  // --- PROHIBITED conditions ---
  const hoaProhibits = hoaPolicy === 'PROHIBITS';
  const highEnforcementNoPermit = enforcementIntensity === 'HIGH' && !hasPermit;
  const capClosedNoPermit = !permitCapOpen && !hasPermit;
  const restrictedStateNoPermit = isRestrictedState && !hasPermit && enforcementIntensity === 'HIGH';

  if (hoaProhibits || highEnforcementNoPermit || restrictedStateNoPermit) {
    return {
      status: 'PROHIBITED',
      city,
      permitStatus: hasPermit ? 'Permit held' : 'No permit — required in this jurisdiction',
      minStayRestriction: minStayDays > 0 ? `Minimum ${minStayDays}-night stay required` : 'None',
      ownerOccupancyRequired,
      hoaStatus: hoaPolicy,
      enforcementIntensity,
      pendingLegislation,
      summary: `STR is PROHIBITED for this property.${hoaProhibits ? ' HOA prohibits STR.' : ''}${highEnforcementNoPermit ? ' High enforcement jurisdiction without a permit.' : ''}${restrictedStateNoPermit ? ' State-restricted with high enforcement and no permit.' : ''} All STR income is disabled. Only LT fallback rent may be used for qualification.`,
      incomeEnabled: false,
    };
  }

  // --- UNCERTAINTY conditions ---
  // v11.1 (AUDIT-FINAL-6 item 10): HOA SILENT and UNKNOWN both trigger UNCERTAIN
  // with attorney review required. v11.0 only treated UNKNOWN as UNCERTAIN; SILENT
  // fell through to CLEAR/RESTRICTED which understated legal risk — silent HOA
  // docs are NOT the same as explicit permission; attorney must review CC&Rs.
  const hoaUnknown = hoaPolicy === 'UNKNOWN';
  const hoaSilent = hoaPolicy === 'SILENT';
  const pendingLegislationRisk = pendingLegislation && enforcementIntensity !== 'LOW';
  const moderateEnforcementNoPermit = enforcementIntensity === 'MODERATE' && !hasPermit;
  const ownerOccRisk = ownerOccupancyRequired;
  const capClosedWithPermit = !permitCapOpen && hasPermit;

  if (hoaUnknown || hoaSilent || pendingLegislationRisk || moderateEnforcementNoPermit || ownerOccRisk || capClosedWithPermit) {
    const reasons: string[] = [];
    if (hoaUnknown) reasons.push('HOA STR policy is unknown — verify before proceeding.');
    if (hoaSilent) reasons.push('HOA governing docs are SILENT on STR — attorney must review CC&Rs to confirm no implied prohibition before relying on STR income.');
    if (pendingLegislationRisk) reasons.push('Pending legislation with non-trivial enforcement — income shown only as speculative scenario.');
    if (moderateEnforcementNoPermit) reasons.push('Moderate enforcement without a permit — obtain permit before relying on STR income.');
    if (ownerOccRisk) reasons.push('Owner-occupancy required — may restrict STR eligibility.');
    if (capClosedWithPermit) reasons.push('Permit cap is closed but permit is held — confirm permit validity and renewal terms.');

    return {
      status: 'UNCERTAIN',
      city,
      permitStatus: hasPermit ? 'Permit held (verify validity)' : 'No permit — required',
      minStayRestriction: minStayDays > 0 ? `Minimum ${minStayDays}-night stay required` : 'None',
      ownerOccupancyRequired,
      hoaStatus: hoaPolicy,
      enforcementIntensity,
      pendingLegislation,
      summary: `STR status is UNCERTAIN. ${reasons.join(' ')} STR income is shown only as a speculative scenario and should not be relied upon for lender qualification without resolution.`,
      incomeEnabled: false,
    };
  }

  // --- RESTRICTED conditions ---
  const isRestricted = isRestrictedState || minStayDays >= 7 || enforcementIntensity === 'MODERATE';

  if (isRestricted) {
    const reasons: string[] = [];
    if (isRestrictedState) reasons.push(`${state.toUpperCase()} has known statewide STR restrictions.`);
    if (minStayDays >= 7) reasons.push(`Minimum ${minStayDays}-night stay restricts typical STR operation.`);
    if (enforcementIntensity === 'MODERATE') reasons.push('Moderate enforcement — maintain compliance.');

    return {
      status: 'RESTRICTED',
      city,
      permitStatus: hasPermit ? 'Permit held — in compliance' : 'No permit — STR income at risk',
      minStayRestriction: minStayDays > 0 ? `Minimum ${minStayDays}-night stay required` : 'None',
      ownerOccupancyRequired,
      hoaStatus: hoaPolicy,
      enforcementIntensity,
      pendingLegislation,
      summary: `STR is RESTRICTED. ${reasons.join(' ')} STR income may be used with caution — confirm all restrictions with lender and local jurisdiction before underwriting.`,
      incomeEnabled: true,
    };
  }

  // --- CLEAR (default) ---
  return {
    status: 'CLEAR',
    city,
    permitStatus: hasPermit ? 'Permit held — no issues' : 'No permit required or not yet obtained',
    minStayRestriction: minStayDays > 0 ? `Minimum ${minStayDays}-night stay required` : 'None',
    ownerOccupancyRequired,
    hoaStatus: hoaPolicy,
    enforcementIntensity,
    pendingLegislation,
    summary: `STR status is CLEAR. No known prohibitions or significant restrictions.${hasPermit ? ' Permit is in hand.' : ' Verify permit requirements with local jurisdiction.'}${hoaPolicy === 'ALLOWS' ? ' HOA explicitly allows STR.' : ''}`,
    incomeEnabled: true,
  };
}

// ============================================================
// SECTION 8.3: DOCUMENTATION CHECKLIST
// ============================================================

export function getSTRDocumentationChecklist(): DocChecklistItem[] {
  return [
    { item: 'Signed Lease Agreement (if LTR fallback used)', required: true, status: 'NEEDED' },
    { item: '1007/1025 Appraiser Market Rent Analysis', required: true, status: 'NEEDED' },
    { item: 'AirDNA / STR Projection Report', required: true, status: 'NEEDED' },
    { item: '12-Month Platform Revenue History (Airbnb, VRBO, etc.)', required: true, status: 'NEEDED' },
    { item: 'STR Business License / Permit', required: true, status: 'NEEDED' },
    { item: 'HOA STR Approval Letter (if HOA governs)', required: true, status: 'NEEDED' },
    { item: 'Property Insurance with STR Rider', required: true, status: 'NEEDED' },
    { item: 'Local Jurisdiction STR Ordinance Summary', required: true, status: 'NEEDED' },
    { item: 'Zoning Verification Letter', required: false, status: 'NEEDED' },
    { item: 'Furnishing Budget Documentation (for STR)', required: false, status: 'NEEDED' },
    { item: 'Management Agreement (if professionally managed)', required: false, status: 'N/A' },
    { item: 'Utility History (12 months, if available)', required: false, status: 'N/A' },
    { item: 'Pending Legislation Disclosure', required: false, status: 'N/A' },
  ];
}

// ============================================================
// SECTION 8.1: MAIN STR UNDERWRITING EVALUATOR
// ============================================================

export function evaluateSTRUnderwriting(
  property: PropertyInputs,
  loanAmount: number,
  rate: number,
  termYears: number,
  ioPeriod: IOPeriod,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): STRUnderwritingResult {
  // ── STEP 1: Run legality gate BEFORE any STR income ──
  const legalityGate = checkSTRLegality(
    property.state,
    '',
    property.hoaSTRPolicy,
    false,
    true,
    0,
    false,
    'LOW',
    false,
  );

  // ── STEP 2: Validate payment and income inputs before calculating ──
  const hasValidPaymentInputs =
    isFiniteInRange(loanAmount, 0.01, MAX_LOAN_AMOUNT) &&
    isFiniteInRange(rate, 0, 30) &&
    isFiniteInRange(termYears, 1, 50) &&
    isFiniteInRange(annualTaxes, 0, MAX_ANNUAL_PROPERTY_COST) &&
    isFiniteInRange(annualInsurance, 0, MAX_ANNUAL_PROPERTY_COST) &&
    isFiniteInRange(hoa, 0, MAX_MONTHLY_PITIA) &&
    isFiniteInRange(floodInsurance, 0, MAX_MONTHLY_PITIA);

  let pitiaTotal = 0;
  if (hasValidPaymentInputs) {
    try {
      const pitia = calculatePITIA(
        loanAmount,
        rate,
        termYears,
        ioPeriod,
        annualTaxes,
        annualInsurance,
        hoa,
        floodInsurance,
      );
      pitiaTotal = isFiniteInRange(pitia.total, 0.01, MAX_MONTHLY_PITIA) ? pitia.total : 0;
    } catch {
      pitiaTotal = 0;
    }
  }

  const hasValidPITIA = pitiaTotal > 0;
  const hasLeaseRent = isValidMonthlyIncome(property.leaseRent);
  const hasMarketRent = isValidMonthlyIncome(property.marketRent);
  const hasLTRFallback = hasMarketRent;
  const hasProjectedSTR = isValidMonthlyIncome(property.strProjectedRent);
  const hasDocumentedSTR = isValidMonthlyIncome(property.strDocumentedRent);
  const ltrFallback = hasMarketRent
    ? (hasLeaseRent ? Math.min(property.leaseRent, property.marketRent) : property.marketRent)
    : 0;

  // ── STEP 3: If PROHIBITED, disable all STR income, return only LT fallback ──
  if (legalityGate.status === 'PROHIBITED') {
    const world1 = buildWorld1(ltrFallback, pitiaTotal, hasLTRFallback, hasLeaseRent);
    const world2 = buildWorld2(0, ltrFallback, pitiaTotal, false);
    const world3 = buildWorld3(0, ltrFallback, pitiaTotal, false);

    // v11.1: Even when PROHIBITED, show what seasonality WOULD look like for
    // investor awareness (Track 2 survival context)
    const annualProjectedSTR = hasProjectedSTR ? property.strProjectedRent * 12 : 0;
    const monthlySeasonality = computeSTRMonthlySeasonality(
      annualProjectedSTR,
      pitiaTotal,
      0, // no haircut when PROHIBITED — investor sees gross gap
    );

    return {
      world1_LTR: world1,
      world2_Projected: world2,
      world3_Documented: world3,
      bestQualifyingRent: hasLTRFallback && hasValidPITIA ? world1.qualifyingRent : 0,
      bestWorld: hasLTRFallback && hasValidPITIA
        ? world1.name
        : 'Incomplete — valid payment and 1007 market-rent inputs required',
      haircutPercent: 0,
      legalityGate,
      documentationChecklist: getSTRDocumentationChecklist(),
      marketDirectionWarning: MARKET_DIRECTION_WARNING,
      monthlySeasonality,
    };
  }

  // ── STEP 4: Compute all three worlds separately (NEVER blended) ──

  // World 1: Long-term market rent — lower of lease and 1007 market rent
  const world1 = buildWorld1(ltrFallback, pitiaTotal, hasLTRFallback, hasLeaseRent);

  // World 2: Projected STR Income — STR_Gross × 0.80 (~20% haircut).
  // v11.1 (AUDIT-FINAL-6): No LT cap per spec item 2 — qualifyingRent = STR net.
  const strGrossProjected = hasProjectedSTR ? property.strProjectedRent : 0;
  const world2 = buildWorld2(strGrossProjected, ltrFallback, pitiaTotal, hasProjectedSTR);

  // World 3: Documented historical STR — 12-month actual platform revenue (10% haircut, lower than World 2)
  // v11.1 (AUDIT-FINAL-6): No LT cap per spec item 3 — qualifyingRent = Doc net.
  const strGrossDocumented = hasDocumentedSTR ? property.strDocumentedRent : 0;
  const world3 = buildWorld3(strGrossDocumented, ltrFallback, pitiaTotal, hasDocumentedSTR);

  // ── STEP 5: If UNCERTAIN, STR income shown only as speculative scenario ──
  // Qualifying rent for worlds 2 and 3 falls back to LT when UNCERTAIN
  if (legalityGate.status === 'UNCERTAIN') {
    if (hasProjectedSTR) {
      world2.qualifyingRent = hasLTRFallback ? ltrFallback : 0;
      world2.method = hasLTRFallback
        ? 'Speculative only — legality UNCERTAIN, LT fallback used for qualification'
        : 'Incomplete — legality is UNCERTAIN and a 1007 market rent is required for the LT fallback';
      world2.lenderConfirmationRequired = true;
      world2.dscr = hasLTRFallback ? safeDSCR(ltrFallback, pitiaTotal) : 0;
    }

    if (hasDocumentedSTR) {
      world3.qualifyingRent = hasLTRFallback ? ltrFallback : 0;
      world3.method = hasLTRFallback
        ? 'Speculative only — legality UNCERTAIN, LT fallback used for qualification'
        : 'Incomplete — legality is UNCERTAIN and a 1007 market rent is required for the LT fallback';
      world3.lenderConfirmationRequired = true;
      world3.dscr = hasLTRFallback ? safeDSCR(ltrFallback, pitiaTotal) : 0;
    }
  }

  // ── STEP 6: Determine GOVERNING qualifying rent across all worlds ──
  // v11.1 (AUDIT-FINAL-6): Spec item 4 — "APPRAISAL GOVERNS: min() across sources."
  // Best world = MIN(world1.qualifyingRent, world2.qualifyingRent, world3.qualifyingRent).
  // Each world's qualifyingRent is computed independently per spec items 1-3 (NO
  // per-world LT cap). The MIN operation ensures the most conservative (lowest)
  // income source governs — typically LT (World 1) when STR net > LT, or STR/Doc
  // net (World 2/3) when LT > STR net. v11.0 incorrectly used MAX (over-stating
  // income); v11.1 fixed to MIN per spec.
  const eligibleWorlds = legalityGate.status === 'UNCERTAIN'
    ? (hasLTRFallback ? [world1] : [])
    : [
        ...(hasLTRFallback ? [world1] : []),
        ...(hasProjectedSTR ? [world2] : []),
        ...(hasDocumentedSTR ? [world3] : []),
      ];
  const bestWorld = hasValidPITIA && eligibleWorlds.length > 0
    ? eligibleWorlds.reduce(
        (best, worldItem) => (worldItem.qualifyingRent < best.qualifyingRent ? worldItem : best),
      )
    : null;

  const bestQualifyingRent = bestWorld?.qualifyingRent ?? 0;
  const effectiveHaircut = bestWorld?.haircutPercent ?? 0;
  const bestWorldName = bestWorld?.name ?? (
    hasValidPITIA
      ? 'Incomplete — no eligible rent source is available'
      : 'Incomplete — valid loan and payment inputs are required'
  );

  // v11.1 (AUDIT-FINAL issue 6): Compute monthly seasonality for STR deals.
  // Uses annual projected STR revenue (World 2 gross × 12) and applies the
  // Track-1 haircut (20% default, or the effective haircut from the best world).
  const annualProjectedSTR = hasProjectedSTR ? property.strProjectedRent * 12 : 0;
  const monthlySeasonality = computeSTRMonthlySeasonality(
    annualProjectedSTR,
    pitiaTotal,
    PROJECTED_STR_HAIRCUT_PCT, // always use 20% Track-1 haircut for seasonality
  );

  return {
    world1_LTR: world1,
    world2_Projected: world2,
    world3_Documented: world3,
    bestQualifyingRent,
    bestWorld: bestWorldName,
    haircutPercent: effectiveHaircut,
    legalityGate,
    documentationChecklist: getSTRDocumentationChecklist(),
    marketDirectionWarning: MARKET_DIRECTION_WARNING,
    monthlySeasonality,
  };
}

// ============================================================
// WORLD BUILDERS
// ============================================================

function buildWorld1(
  ltrMarketRent: number,
  pitiaTotal: number,
  isAvailable: boolean,
  hasLeaseRent: boolean,
): STRWorld {
  const income = isAvailable ? ltrMarketRent : 0;
  const dscr = safeDSCR(income, pitiaTotal);
  return {
    name: 'World 1 — Long-term Market Rent',
    grossIncome: income,
    haircutPercent: 0,
    netIncome: income,
    ltrFallback: income,
    qualifyingRent: income,
    dscr,
    method: !isAvailable
      ? 'Unavailable — a finite 1007 market rent greater than $0 is required'
      : !hasLeaseRent
        ? '1007 market rent used because no in-place lease was provided — no vacancy haircut'
      : pitiaTotal > 0
        ? 'Lower of lease and 1007 market rent — no vacancy haircut'
        : 'Rent available, but DSCR is unknown until valid loan and payment inputs are provided',
    lenderConfirmationRequired: false,
  };
}

function buildWorld2(
  strGrossProjected: number,
  ltrFallback: number,
  pitiaTotal: number,
  isAvailable: boolean,
): STRWorld {
  // v11.1 (AUDIT-FINAL-6): Per spec items 2/5, World 2's qualifyingRent =
  // STR_Gross × 0.80 (20% haircut on AirDNA projection). NO LT cap in the
  // CLEAR case — LT fallback is applied ONLY when legality is UNCERTAIN
  // (see STEP 5 in evaluateSTRUnderwriting). The "appraisal governs min()"
  // rule is enforced at the BEST-WORLD selection step (STEP 6 — MIN across
  // the three worlds), not per-world. Previously this builder applied
  // Math.min(netIncome, ltrFallback) which made World 2/3 redundant
  // whenever STR net > LT (the typical STR-deal case).
  const grossIncome = isAvailable ? strGrossProjected : 0;
  const netIncome = grossIncome * (1 - PROJECTED_STR_HAIRCUT_PCT / 100);
  const qualifyingRent = netIncome;
  const dscr = safeDSCR(qualifyingRent, pitiaTotal);

  return {
    name: 'World 2 — Projected STR Income',
    grossIncome,
    haircutPercent: PROJECTED_STR_HAIRCUT_PCT,
    netIncome,
    ltrFallback,
    qualifyingRent,
    dscr,
    method: !isAvailable
      ? 'Unavailable — enter finite projected monthly STR revenue greater than $0; this world is excluded from selection'
      : pitiaTotal > 0
        ? `STR net income ($${netIncome.toFixed(0)}) — ${PROJECTED_STR_HAIRCUT_PCT}% haircut applied to $${grossIncome.toFixed(0)} gross; LT fallback ($${ltrFallback.toFixed(0)}) used only if legality UNCERTAIN or if MIN(worlds) selects World 1`
        : 'Projected STR revenue is available, but DSCR is unknown until valid loan and payment inputs are provided',
    lenderConfirmationRequired: true,
  };
}

function buildWorld3(
  strGrossDocumented: number,
  ltrFallback: number,
  pitiaTotal: number,
  isAvailable: boolean,
): STRWorld {
  // Documented historical STR: 12-month actual platform revenue.
  // Lower 10% haircut than World 2's 20% because actual data is more reliable
  // than AirDNA projections (audit req #5 — "lower haircut (~10%) since it's actual data").
  // v11.1 (AUDIT-FINAL-6): NO LT cap per spec item 3 — World 3 qualifyingRent =
  // 12-mo actual × 0.90. LT fallback applied only when legality UNCERTAIN (STEP 5).
  const grossIncome = isAvailable ? strGrossDocumented : 0;
  const netIncome = grossIncome * (1 - DOCUMENTED_STR_HAIRCUT_PCT / 100);
  const qualifyingRent = netIncome;
  const dscr = safeDSCR(qualifyingRent, pitiaTotal);

  return {
    name: 'World 3 — Documented Historical STR',
    grossIncome,
    haircutPercent: DOCUMENTED_STR_HAIRCUT_PCT,
    netIncome,
    ltrFallback,
    qualifyingRent,
    dscr,
    method: !isAvailable
      ? 'Unavailable — documented STR history was not provided; this world is excluded rather than treated as $0 income'
      : pitiaTotal > 0
        ? `12-month documented STR revenue ($${netIncome.toFixed(0)}) — ${DOCUMENTED_STR_HAIRCUT_PCT}% haircut applied to $${grossIncome.toFixed(0)} gross (lower than World 2's 20% because actuals are more reliable); LT fallback ($${ltrFallback.toFixed(0)}) used only if legality UNCERTAIN or if MIN(worlds) selects World 1`
        : 'Documented STR revenue is available, but DSCR is unknown until valid loan and payment inputs are provided',
    lenderConfirmationRequired: true,
  };
}
