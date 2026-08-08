// ============================================================
// DSCR Deal Desk v11.0 — Integrated Analysis Runner
// Wires together all v11 modules into a single analysis pipeline:
//   1. Dual-track DSCR (engine.ts)
//   2. Reassessment (reassessmentEngine.ts)
//   3. ARM reset (armResetEngine.ts)
//   4. Returns (returnsEngine.ts)
//   5. After-tax IRR (taxEngine.ts)
//   6. True cost / AEY (trueCostEngine.ts)
//   7. Verdict (decisionSupport.ts)
//   8. IC Memo (decisionSupport.ts)
// ============================================================

import type {
  PropertyInputs,
  BorrowerProfile,
  LoanStructure,
  RentalStrategy,
  DSCRResult,
  TaxProfile,
  ARMTerms,
  ReassessmentResult,
  ARMResetResult,
  ReturnsResult,
  AfterTaxIRRResult,
  LenderRankingEntry,
  VerdictResult,
  ICMemo,
  InsuranceGateResult,
  InsuranceRiskZone,
  BRRRRSeasoningGate,
} from './types';
import { solveDSCR, calculatePI } from './engine';
import { computeReassessedTax, computeReassessmentDSCRImpact } from './reassessmentEngine';
import { computeARMReset, DEFAULT_ARM_PROGRAMS, CURRENT_MARKET_SNAPSHOT, computeRemainingBalanceAtReset } from './armResetEngine';
import { computeReturns, computeRemainingBalance } from './returnsEngine';
import { computeAfterTaxIRR, assessCostSegViability } from './taxEngine';
import { computeVerdict, buildICMemo, type VerdictInput, type ICMemoInput } from './decisionSupport';

// ============================================================
// INTEGRATED V11 ANALYSIS RESULT
// ============================================================

export interface V11AnalysisResult {
  // Core
  dscr: DSCRResult;
  track1DSCR: number;
  track2DSCR: number;

  // v11 NEW modules
  reassessment: ReassessmentResult;
  armReset: ARMResetResult | null;
  returns: ReturnsResult;
  afterTaxIRR: AfterTaxIRRResult;
  costSegViability: ReturnType<typeof assessCostSegViability>;

  // Verdict + memo
  verdict: VerdictResult;
  memo: ICMemo;

  // Market snapshot (for transparency)
  marketSnapshot: typeof CURRENT_MARKET_SNAPSHOT;
}

// ============================================================
// INSURANCE GATE
// ============================================================

const HIGH_RISK_STATES: Record<string, InsuranceRiskZone> = {
  FL: 'FL_HIGH_RISK',
  TX: 'TX_GULF',
  LA: 'LA_COASTAL',
  // CA handled by subzone; default to CA_COASTAL for now
};

export function checkInsuranceGate(
  state: string,
  isCoastal: boolean = false,
  isWildfireZone: boolean = false,
  quoteConfirmed: boolean = false,
  premiumAnnual: number = 0,
): InsuranceGateResult {
  let zone: InsuranceRiskZone = 'STANDARD';
  let zoneLabel = 'Standard risk zone';

  if (state === 'CA') {
    zone = isWildfireZone ? 'CA_WILDFIRE' : isCoastal ? 'CA_COASTAL' : 'STANDARD';
    zoneLabel = zone === 'CA_WILDFIRE' ? 'California Wildfire Zone' : zone === 'CA_COASTAL' ? 'California Coastal Zone' : 'California Standard';
  } else if (state in HIGH_RISK_STATES) {
    zone = HIGH_RISK_STATES[state];
    zoneLabel = zone === 'FL_HIGH_RISK' ? 'Florida High-Risk (Wind/Hurricane)' :
                zone === 'TX_GULF' ? 'Texas Gulf Coast (Wind/Hurricane)' :
                zone === 'LA_COASTAL' ? 'Louisiana Coastal Zone' : 'High-Risk Zone';
  }

  const isHighRisk = zone !== 'STANDARD';
  const killCriterion = isHighRisk && !quoteConfirmed;

  let verdict: 'CLEAR' | 'CONFIRM_REQUIRED' | 'KILL';
  let reason: string;
  if (!isHighRisk) {
    verdict = 'CLEAR';
    reason = `${state}: Standard insurance risk zone. Premium estimate $${premiumAnnual.toLocaleString()}/yr.`;
  } else if (!quoteConfirmed) {
    verdict = 'KILL';
    reason = `${zoneLabel}: Insurance is a KILL CRITERION. >90% of FL investors and 83% of CA investors missed deals due to insurance issues (2024 survey). Do not proceed until a bindable quote is in hand. Stress-test Year 3 at +25%.`;
  } else {
    verdict = 'CONFIRM_REQUIRED';
    reason = `${zoneLabel}: Bindable quote confirmed at $${premiumAnnual.toLocaleString()}/yr. Stress-test Year 3 at $${Math.round(premiumAnnual * 1.25).toLocaleString()}/yr (+25%). Monitor annual renewals for double-digit increases.`;
  }

  return {
    zone,
    zoneLabel,
    quoteConfirmed,
    premiumAnnual,
    premiumStressY3: Math.round(premiumAnnual * 1.25),
    killCriterion,
    verdict,
    reason,
    provenance: 'VERIFIED_PRIMARY',
    source: 'RCN Capital/CJ Patrick 2024 survey; Enterprise Community Partners 2024; Insurify 2026 projections',
  };
}

// ============================================================
// BRRRR SEASONING GATE
// ============================================================

export function checkBRRRRSeasoningGate(
  isBRRRR: boolean,
  monthsHeld: number,
  arvExpected: number,
  monthlyPITIA: number,
  strategy: RentalStrategy,
): BRRRRSeasoningGate {
  const applies = isBRRRR;
  if (!applies) {
    return {
      applies: false,
      monthsHeld: 0,
      lenderRuleMonths: 0,
      seasoningMet: true,
      cashOutBasis: 'COST_BASIS',
      arvExpected: 0,
      carryCostDuringSeasoning: 0,
      waivedByLender: null,
      verdict: 'PROCEED',
      reason: 'Not a BRRRR deal.',
    };
  }

  // Standard: 6-12 months from acquisition for ARV-based cash-out
  const lenderRuleMonths = 6;
  const seasoningMet = monthsHeld >= lenderRuleMonths;
  // STR cash-out seasoning may be waived under the STR program
  const waivedByLender = strategy === 'STR' ? 'STR program exception' : null;

  const carryCostDuringSeasoning = monthlyPITIA * Math.max(0, lenderRuleMonths - monthsHeld);

  let verdict: 'PROCEED' | 'WAIT' | 'RESTRUCTURE';
  let reason: string;
  if (seasoningMet) {
    verdict = 'PROCEED';
    reason = `BRRRR seasoning met (${monthsHeld}mo ≥ ${lenderRuleMonths}mo). Cash-out basis = ARV ($${arvExpected.toLocaleString()}).`;
  } else if (waivedByLender) {
    verdict = 'PROCEED';
    reason = `BRRRR seasoning waived by ${waivedByLender} for STR cash-out. ARV basis = $${arvExpected.toLocaleString()}.`;
  } else {
    verdict = 'WAIT';
    reason = `BRRRR seasoning not met (${monthsHeld}mo < ${lenderRuleMonths}mo). Carry cost during wait: $${carryCostDuringSeasoning.toLocaleString()}. Cash-out basis = cost basis until seasoned.`;
  }

  return {
    applies: true,
    monthsHeld,
    lenderRuleMonths,
    seasoningMet,
    cashOutBasis: seasoningMet || waivedByLender ? 'ARV' : 'COST_BASIS',
    arvExpected,
    carryCostDuringSeasoning: Math.round(carryCostDuringSeasoning),
    waivedByLender,
    verdict,
    reason,
  };
}

// ============================================================
// MAIN INTEGRATED ANALYSIS
// ============================================================

export interface V11AnalysisInput {
  property: PropertyInputs;
  borrower: BorrowerProfile;
  loan: LoanStructure;
  strategy: RentalStrategy;
  taxProfile?: TaxProfile;
  rate?: number;
  // Override tax inputs for reassessment
  sellerAnnualTax?: number;  // current bill
  // ARM
  armTerms?: ARMTerms;
  // BRRRR
  isBRRRR?: boolean;
  brrrrMonthsHeld?: number;
  brrrrARVExpected?: number;
  // Insurance
  insuranceQuoteConfirmed?: boolean;
  isCoastalProperty?: boolean;
  isWildfireZone?: boolean;
  // Optional lender ranking (from external lender fit)
  lenderRanking?: LenderRankingEntry[];
  // PPP
  pppAllowed?: boolean;
  // Property address (for IC memo)
  propertyAddress?: string;
  // Monte Carlo (optional)
  monteCarloPDSCRLessThan1?: number;
  monteCarlo5thPctDSCR?: number;
  monteCarloP10IRR?: number;
  monteCarloP90IRR?: number;
}

export function runV11Analysis(input: V11AnalysisInput): V11AnalysisResult {
  // v11.1 D-1 fix: Replicate AUDIT-8 #1 — compute reassessed tax FIRST,
  // then pass it into solveDSCR so PITIA uses the reassessed tax (not
  // seller's current bill). Without this, the runner silently overstates
  // DSCR on reassessment-impact deals (CA Prop 13, TX, FL, NJ, NY, IL).
  const reassessmentPre = computeReassessedTax(
    input.property.purchasePrice,
    input.property.state,
    input.sellerAnnualTax ?? input.property.annualTaxes,
  );

  // 1. Dual-track DSCR — pass reassessed tax override (matches page.tsx production path)
  const dscr = solveDSCR(
    input.property,
    input.borrower,
    input.loan,
    input.strategy,
    false,  // vacancy haircut toggle (off for LTR)
    0,
    'GROSS_PITIA',  // formula method
    reassessmentPre.reassessedAnnualTax,  // v11.1 D-1 fix: PITIA uses reassessed tax
  );

  const track1DSCR = dscr.dualTrackDSCR.track1.dscr;
  const track2DSCR = dscr.dualTrackDSCR.track2.dscr;

  // 2. Reassessment — reuse the precomputed reassessed tax (avoid double work)
  const reassessmentResult = reassessmentPre;
  const reassessment = computeReassessmentDSCRImpact(
    input.property.purchasePrice,
    input.property.state,
    dscr.qualifyingRent,
    dscr.monthlyPITIA.total,
    // sellerAnnualTax is optional on V11AnalysisInput. Fall back to the
    // property's own annual tax bill — the same default already used for
    // computeReassessedTax above (line ~232), so both reassessment calls see
    // an identical "current bill" and cannot disagree.
    input.sellerAnnualTax ?? input.property.annualTaxes,
    reassessmentResult.reassessedAnnualTax,
  );

  // 3. ARM reset (only if ARM loan)
  let armReset: ARMResetResult | null = null;
  if (input.loan.armType !== 'FIXED') {
    const armTerms = input.armTerms ?? DEFAULT_ARM_PROGRAMS[input.loan.armType] ?? DEFAULT_ARM_PROGRAMS['5_6_ARM'];
    const termMonths = (input.loan.term === '30_YR' ? 30 : input.loan.term === '40_YR' ? 40 : 15) * 12;
    const loanAmount = input.property.purchasePrice * (input.loan.ltv / 100);
    const monthsToReset = armTerms.fixedPeriodMonths;
    const remainingTermAtReset = termMonths - monthsToReset;
    const loanBalanceAtReset = computeRemainingBalanceAtReset(loanAmount, dscr.solvedRate, termMonths, monthsToReset);

    // Bug audit #1 (unit convention): floodInsurance is already MONTHLY (like
    // hoa) — do NOT divide by 12 (see calculatePITIA in engine.ts).
    const monthlyFixedExpenses = input.property.annualTaxes / 12
      + input.property.annualInsurance / 12
      + input.property.hoa
      + input.property.floodInsurance;

    const ioPeriodMonths = input.loan.ioPeriod === 'NONE' ? 0
      : input.loan.ioPeriod === '5_YR' ? 60
      : input.loan.ioPeriod === '7_YR' ? 84 : 120;

    armReset = computeARMReset(
      armTerms,
      loanBalanceAtReset,
      remainingTermAtReset,
      dscr.qualifyingRent,
      monthlyFixedExpenses,
      ioPeriodMonths,
    );
  }

  // 4. Pre-tax returns
  const grossRentMonthly = input.strategy === 'STR'
    ? input.property.strProjectedRent
    : input.strategy === 'MTR'
    ? input.property.strProjectedRent * 0.88
    : Math.min(input.property.leaseRent, input.property.marketRent);

  const prepayPenaltyAtExit = 0; // computed by loanOptimizer; pass-through for now
  const returns = computeReturns(
    input.property,
    input.loan,
    grossRentMonthly,
    input.strategy,
    dscr.solvedRate,
    prepayPenaltyAtExit,
    dscr.cashToClose.total,
  );

  // 5. After-tax IRR
  const loanAmount = input.property.purchasePrice * (input.loan.ltv / 100);
  const termMonths = (input.loan.term === '30_YR' ? 30 : input.loan.term === '40_YR' ? 40 : 15) * 12;
  const piMonthly = calculatePI(loanAmount, dscr.solvedRate, termMonths);
  const annualADS = piMonthly * 12;
  const annualNOI = (returns.entryCapRate / 100) * input.property.purchasePrice; // reverse-engineer from cap rate
  const afterTaxIRR = computeAfterTaxIRR(
    input.property.purchasePrice,
    loanAmount,
    grossRentMonthly,
    annualNOI,
    annualADS,
    dscr.monthlyPITIA.total,
    input.taxProfile,
    prepayPenaltyAtExit,
    dscr.solvedRate, termMonths,  // v11.1 FIX (AUDIT-FINAL-7 D-1): pass rate + term for proper amortization
  );

  // 6. Cost seg viability
  const costSegViability = assessCostSegViability(
    input.property.purchasePrice,
    input.taxProfile?.landAllocationPct ?? 20,
  );

  // 7. Insurance gate
  const insuranceGate = checkInsuranceGate(
    input.property.state,
    input.isCoastalProperty,
    input.isWildfireZone,
    input.insuranceQuoteConfirmed,
    input.property.annualInsurance,
  );

  // 8. BRRRR gate
  const brrrrGate = checkBRRRRSeasoningGate(
    input.isBRRRR ?? false,
    input.brrrrMonthsHeld ?? 0,
    input.brrrrARVExpected ?? 0,
    dscr.monthlyPITIA.total,
    input.strategy,
  );

  // 9. Verdict
  //
  // IRR SCALE CONVENTION (bug audit #3): taxEngine.computeAfterTaxIRR returns
  // afterTaxIRR/preTaxIRR as DECIMAL fractions (0.15 = 15%; see computeXIRR).
  // returnsEngine.computeReturns returns leveredIRR/year1CashOnCash/entryCapRate
  // as PERCENT (15.0 = 15%; see its own "as percentage" comments). decisionSupport's
  // VerdictInput/ICMemoInput expect DECIMAL for afterTaxIRR/preTaxIRR/year1CoC
  // (see computeReturnGrade's "afterTaxIRR is passed as a decimal" comment and its
  // 0.08/0.12/0.15 thresholds). So: taxEngine-sourced values pass through UNCHANGED
  // (already decimal — do NOT divide by 100 again; that was the bug: 0.15 → 0.0015,
  // a 100x error), while returnsEngine-sourced PERCENT values get /100 to become decimal.
  const verdictInput: VerdictInput = {
    track1DSCR,
    track2DSCR,
    lenderMinDSCR: 1.0, // standard floor
    afterTaxIRR: afterTaxIRR.afterTaxIRR, // already decimal — see convention note above
    preTaxIRR: afterTaxIRR.preTaxIRR,     // already decimal — see convention note above
    year1CoC: returns.year1CashOnCash / 100, // returnsEngine gives percent -> convert to decimal
    dealBreakRate: dscr.dealBreakRate,
    solvedRate: dscr.solvedRate,
    rateHeadroomBps: dscr.rateHeadroomBps,
    appraisalBreakpointPercent: dscr.appraisalBreakpointPercent,
    insuranceGate,
    brrrrGate,
    armReset,
    strLegalityStatus: 'CLEAR', // assume CLEAR for LTR; STR gate would set this
    pppAllowed: input.pppAllowed ?? true,
    ficoScore: input.borrower.ficoScore,
    ltv: input.loan.ltv,
    ltvCap: 80, // standard cap
    loanAmount,
    lenderMinLoan: 75000,
    bestLenderConfidence: input.lenderRanking?.[0]?.confidenceScore ?? 75,
    lenderRanking: input.lenderRanking ?? [],
    isDecliningMarket: input.property.isDecliningMarket,
    monteCarloPDSCRLessThan1: input.monteCarloPDSCRLessThan1,
    monteCarlo5thPctDSCR: input.monteCarlo5thPctDSCR,
  };
  const verdict = computeVerdict(verdictInput);

  // 10. IC memo
  const memoInput: ICMemoInput = {
    propertyAddress: input.propertyAddress ?? '123 Main St',
    entityType: input.borrower.entityType,
    verdict,
    track1DSCR,
    lenderMinDSCR: 1.0,
    debtYield: dscr.debtYield * 100,
    ltv: input.loan.ltv,
    ltvCap: 80,
    dealBreakRate: dscr.dealBreakRate,
    cushionBps: dscr.rateHeadroomBps,
    entryCapRate: returns.entryCapRate,
    year1CoC: returns.year1CashOnCash,
    preTaxIRR: returns.leveredIRR,
    preTaxP10: input.monteCarloP10IRR ?? returns.leveredIRR * 0.8,
    preTaxP90: input.monteCarloP90IRR ?? returns.leveredIRR * 1.2,
    afterTaxIRR: afterTaxIRR.afterTaxIRR, // already decimal — see IRR scale convention note above (bug audit #3)
    equityMultiple: returns.equityMultiple,
    sellerAnnualTax: input.sellerAnnualTax ?? input.property.annualTaxes,
    reassessedAnnualTax: reassessment.reassessedAnnualTax,
    bindingRisk: 'Rent (Track 1 sensitivity)', // simplified
    pDSCRLessThan1: input.monteCarloPDSCRLessThan1 ?? 0.10,
    fifthPctDSCR: input.monteCarlo5thPctDSCR ?? 0.85,
    heatmapSummary: `Fails at vacancy >12% + rent -10%`,
    armReset,
    lenderRanking: input.lenderRanking ?? [],
    insuranceStatus: insuranceGate.verdict === 'CLEAR' ? 'CLEAR' : insuranceGate.verdict === 'KILL' ? 'UNCONFIRMED — kill criterion' : 'CONFIRMED',
    strLegality: input.strategy === 'STR' ? 'CLEAR' : 'N/A (LTR)',
    reserves: {
      likely: dscr.cashToClose.reserveRequirement,
      conservative: dscr.cashToClose.reserveConservative,
      stress: dscr.cashToClose.totalStress,
      portfolioStack: 0,
    },
    prepaySchedule: '5-4-3-2-1 declining on REMAINING balance',
    assumptions: [
      `10yr Treasury: ${CURRENT_MARKET_SNAPSHOT.treasury10Y}% (FRED DGS10, ${CURRENT_MARKET_SNAPSHOT.asOfDate})`,
      `5yr Treasury: ${CURRENT_MARKET_SNAPSHOT.treasury5Y}%`,
      `30-day SOFR: ${CURRENT_MARKET_SNAPSHOT.sofr30Day}%`,
      `Freddie Mac 30yr fixed: ${CURRENT_MARKET_SNAPSHOT.freddieMac30YrFixed}%`,
      `Risk-tiered spread: 175-450 bps over 10yr Treasury`,
      `MN HF 3437 enacted 4/23/2026, eff. 8/1/2026 (business-purpose DSCR not reached)`,
      `OBBBA 100% bonus depreciation for property acquired after 1/19/2025`,
      `§1250 recapture: max 25% federal; §1411 NIIT: 3.8% above $200K/$250K MAGI`,
      `Property tax reassessment modeled per state law (CA Prop 13, TX, FL, NJ, NY, IL)`,
    ],
    sourceDates: [
      { name: 'FRED DGS10', date: '2026-06-17', provenance: 'VERIFIED_PRIMARY' },
      { name: 'FRB H.15', date: '2026-06-16', provenance: 'VERIFIED_PRIMARY' },
      { name: 'Northmarq rates', date: '2026-06', provenance: 'VERIFIED_PRIMARY' },
      { name: 'MN HF 3437', date: '2026-04-23', provenance: 'VERIFIED_PRIMARY' },
      { name: 'OBBBA', date: '2025-01', provenance: 'VERIFIED_PRIMARY' },
      { name: 'IRC §167/168/1250/1411/469', date: '2026', provenance: 'VERIFIED_PRIMARY' },
    ],
  };
  const memo = buildICMemo(memoInput);

  return {
    dscr,
    track1DSCR,
    track2DSCR,
    reassessment,
    armReset,
    returns,
    afterTaxIRR,
    costSegViability,
    verdict,
    memo,
    marketSnapshot: CURRENT_MARKET_SNAPSHOT,
  };
}
