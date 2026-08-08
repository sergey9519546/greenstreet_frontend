// ============================================================
// DSCR Loan Command Center v7.0 — Decision Support Engine
// Section 11-13: Acquisition Score, Execution Risk Scorecard,
//                Deal-Kill Criteria, Two-Quote Rule
// ============================================================
//
// ACQUISITION SCORE (0-100):
//   Track 2 cash flow     30%
//   Track 1 feasibility   20%
//   STR legality          15% (LTR default = full marks)
//   Reserves adequacy     10%
//   Exit liquidity        10%
//   Rate/PPP risk         10%
//   Capex/property        5%
//
// EXECUTION RISK SCORECARD:
//   DSCR + FICO + LTV + Reserves + property type → 5-tier verdict
//
// DEAL-KILL CRITERIA:
//   - Hard blockers (auto-reject)
//   - Warnings (proceed with caution)
//   - Track 2 acknowledgment required
// ============================================================

import type {
  DSCRResult,
  ReserveScenarios,
  PropertyInputs,
  BorrowerProfile,
  LoanStructure,
  RentalStrategy,
  STRUnderwritingResult,
  PPPCheckResult,
  AcquisitionScore,
  ScoreFactor,
  DealKillCheck,
  DealKillItem,
  // v11 types
  VerdictResult,
  ReturnGrade,
  KillCriterion,
  ICMemo,
  AfterTaxIRRResult,
  ReturnsResult,
  ARMResetResult,
  ReassessmentResult,
  InsuranceGateResult,
  BRRRRSeasoningGate,
  LenderRankingEntry,
  ProvenanceLabel,
} from './types';

// ============================================================
// ACQUISITION SCORE
// ============================================================

export function computeAcquisitionScore(
  dscrResult: DSCRResult,
  reserveScenarios: ReserveScenarios | null,
  property: PropertyInputs,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  strategy: RentalStrategy,
  strResult: STRUnderwritingResult | null,
  pppResult: PPPCheckResult | null,
): AcquisitionScore {
  const factors: ScoreFactor[] = [];

  // ── Factor 1: Track 2 Cash Flow (30%) ──
  const track2DSCR = dscrResult.dualTrackDSCR.track2.dscr;
  const t2Score = clampScore(
    track2DSCR >= 1.25 ? 100 :
    track2DSCR >= 1.10 ? 85 :
    track2DSCR >= 1.00 ? 70 :
    track2DSCR >= 0.85 ? 50 :
    track2DSCR >= 0.75 ? 30 :
    10
  );
  factors.push({
    name: 'Track 2 Cash Flow',
    weight: 30,
    value: track2DSCR,
    contribution: t2Score * 0.30,
  });

  // ── Factor 2: Track 1 Feasibility (20%) ──
  const track1DSCR = dscrResult.dualTrackDSCR.track1.dscr;
  const t1Score = clampScore(
    track1DSCR >= 1.50 ? 100 :
    track1DSCR >= 1.25 ? 90 :
    track1DSCR >= 1.10 ? 75 :
    track1DSCR >= 1.00 ? 60 :
    track1DSCR >= 0.85 ? 40 :
    track1DSCR >= 0.75 ? 25 :
    10
  );
  factors.push({
    name: 'Track 1 Feasibility',
    weight: 20,
    value: track1DSCR,
    contribution: t1Score * 0.20,
  });

  // ── Factor 3: STR Legality (15%) ──
  let legalityScore: number;
  let legalityValue: string;
  if (strategy === 'STR' && strResult) {
    const status = strResult.legalityGate.status;
    legalityScore = status === 'CLEAR' ? 100 :
                    status === 'RESTRICTED' ? 65 :
                    status === 'UNCERTAIN' ? 35 : 0;
    legalityValue = status;
  } else if (strategy === 'MTR') {
    legalityScore = 80;
    legalityValue = 'MTR (verify locally)';
  } else {
    legalityScore = 100; // LTR — no STR legality concerns
    legalityValue = 'LTR (n/a)';
  }
  factors.push({
    name: 'STR Legality',
    weight: 15,
    value: legalityValue as unknown as number,
    contribution: legalityScore * 0.15,
  });

  // ── Factor 4: Reserves Adequacy (10%) ──
  let reserveScore: number;
  let reserveShortfallPct: number;
  if (reserveScenarios) {
    const required = reserveScenarios.conservative.totalDollars;
    const available = borrower.availableReserves;
    const ratio = required > 0 ? available / required : 2;
    reserveShortfallPct = ratio < 1 ? (1 - ratio) * 100 : 0;
    reserveScore = ratio >= 2 ? 100 :
                   ratio >= 1.5 ? 85 :
                   ratio >= 1.0 ? 65 :
                   ratio >= 0.75 ? 40 :
                   ratio >= 0.50 ? 20 : 5;
  } else {
    reserveShortfallPct = 0;
    reserveScore = 50;
  }
  factors.push({
    name: 'Reserves Adequacy',
    weight: 10,
    value: reserveShortfallPct,
    contribution: reserveScore * 0.10,
  });

  // ── Factor 5: Exit Liquidity (10%) ──
  // Combines debt yield (refi-ability) + max purchase at DSCR 1.0
  const debtYieldPct = dscrResult.debtYield * 100;
  const exitScore = clampScore(
    debtYieldPct >= 12 ? 100 :
    debtYieldPct >= 10 ? 85 :
    debtYieldPct >= 8 ? 70 :
    debtYieldPct >= 6 ? 50 :
    25
  );
  factors.push({
    name: 'Exit Liquidity (Debt Yield)',
    weight: 10,
    value: debtYieldPct,
    contribution: exitScore * 0.10,
  });

  // ── Factor 6: Rate / PPP Risk (10%) ──
  // Higher rate headroom = lower risk; PPP blocked adds risk
  const headroomBps = dscrResult.rateHeadroomBps;
  const pppBlocked = pppResult ? !pppResult.allowed : false;
  let rateRiskScore = clampScore(
    headroomBps >= 200 ? 100 :
    headroomBps >= 150 ? 85 :
    headroomBps >= 100 ? 70 :
    headroomBps >= 50 ? 50 :
    headroomBps >= 0 ? 25 : 5
  );
  if (pppBlocked) rateRiskScore = Math.max(0, rateRiskScore - 15);
  factors.push({
    name: 'Rate/PPP Risk',
    weight: 10,
    value: headroomBps,
    contribution: rateRiskScore * 0.10,
  });

  // ── Factor 7: Capex / Property (5%) ──
  const ageYears = new Date().getFullYear() - property.yearBuilt;
  let capexScore: number;
  if (property.propertyType === '5+_UNIT' || property.propertyType === 'MIXED_USE') {
    capexScore = 60;
  } else if (ageYears > 50) {
    capexScore = 50;
  } else if (ageYears > 30) {
    capexScore = 70;
  } else if (ageYears > 15) {
    capexScore = 85;
  } else {
    capexScore = 95;
  }
  if (property.isRural) capexScore = Math.max(40, capexScore - 10);
  if (property.isDecliningMarket) capexScore = Math.max(40, capexScore - 10);
  factors.push({
    name: 'Capex/Property Risk',
    weight: 5,
    value: ageYears,
    contribution: capexScore * 0.05,
  });

  const totalScore = Math.round(factors.reduce((sum, f) => sum + f.contribution, 0));
  const band = totalScore >= 85 ? 'Exceptional' :
              totalScore >= 75 ? 'Strong' :
              totalScore >= 65 ? 'Acceptable' :
              totalScore >= 50 ? 'Marginal' :
              totalScore >= 35 ? 'Weak' : 'Reject';

  return { score: totalScore, band, factors };
}

// ============================================================
// EXECUTION RISK SCORECARD
// ============================================================
//
// Combines 5 dimensions into a 5-tier verdict:
//   Very Likely / Likely / Moderate / Difficult / Fragile
//
// Each dimension produces a 0-100 score; weighted average maps to verdict.

export interface ExecutionRiskResult {
  verdict: 'Very Likely' | 'Likely' | 'Moderate' | 'Difficult' | 'Fragile';
  score: number;
  dimensions: { name: string; score: number; weight: number; detail: string }[];
  summary: string;
}

export function computeExecutionRisk(
  dscrResult: DSCRResult,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  property: PropertyInputs,
  reserveScenarios: ReserveScenarios | null,
): ExecutionRiskResult {
  const dimensions: { name: string; score: number; weight: number; detail: string }[] = [];

  // ── DSCR (weight 30) ──
  const dscr = dscrResult.dscr;
  const dscrScore = clampScore(
    dscr >= 1.50 ? 100 :
    dscr >= 1.25 ? 90 :
    dscr >= 1.10 ? 75 :
    dscr >= 1.00 ? 60 :
    dscr >= 0.85 ? 35 :
    dscr >= 0.75 ? 20 : 5
  );
  dimensions.push({
    name: 'DSCR',
    score: dscrScore,
    weight: 30,
    detail: `${dscr.toFixed(2)}× Track 1`,
  });

  // ── FICO (weight 20) ──
  const fico = borrower.ficoScore;
  const ficoScore = clampScore(
    fico >= 780 ? 100 :
    fico >= 740 ? 90 :
    fico >= 720 ? 80 :
    fico >= 700 ? 70 :
    fico >= 680 ? 60 :
    fico >= 660 ? 45 :
    fico >= 640 ? 30 : 15
  );
  dimensions.push({
    name: 'FICO',
    score: ficoScore,
    weight: 20,
    detail: `${fico}`,
  });

  // ── LTV (weight 20) ──
  const ltv = loan.ltv;
  const ltvScore = clampScore(
    ltv <= 60 ? 100 :
    ltv <= 65 ? 95 :
    ltv <= 70 ? 90 :
    ltv <= 75 ? 80 :
    ltv <= 80 ? 65 :
    ltv <= 85 ? 45 : 25
  );
  dimensions.push({
    name: 'LTV',
    score: ltvScore,
    weight: 20,
    detail: `${ltv}%`,
  });

  // ── Reserves (weight 20) ──
  let reserveScoreVal = 50;
  let reserveDetail = 'No reserve data';
  if (reserveScenarios) {
    const required = reserveScenarios.conservative.totalDollars;
    const available = borrower.availableReserves;
    const ratio = required > 0 ? available / required : 2;
    reserveScoreVal = clampScore(
      ratio >= 2 ? 100 :
      ratio >= 1.5 ? 85 :
      ratio >= 1.0 ? 65 :
      ratio >= 0.75 ? 40 : 15
    );
    reserveDetail = `${reserveScenarios.conservative.totalMonths}mo req, $${Math.round(available).toLocaleString()} avail`;
  }
  dimensions.push({
    name: 'Reserves',
    score: reserveScoreVal,
    weight: 20,
    detail: reserveDetail,
  });

  // ── Property Type (weight 10) ──
  const pt = property.propertyType;
  const ptScore = clampScore(
    pt === 'SFR' ? 100 :
    pt === 'CONDO_WARRANTABLE' ? 90 :
    pt === '2-4_UNIT' ? 80 :
    pt === 'CONDO_NON_WARRANTABLE' ? 60 :
    pt === 'RURAL' ? 55 :
    pt === '5+_UNIT' ? 50 :
    pt === 'MIXED_USE' ? 45 :
    pt === 'CONDOTEL' ? 30 : 50
  );
  dimensions.push({
    name: 'Property Type',
    score: ptScore,
    weight: 10,
    detail: pt.replace(/_/g, ' '),
  });

  const weightedSum = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const finalScore = Math.round(weightedSum / totalWeight);

  const verdict: ExecutionRiskResult['verdict'] =
    finalScore >= 85 ? 'Very Likely' :
    finalScore >= 70 ? 'Likely' :
    finalScore >= 55 ? 'Moderate' :
    finalScore >= 40 ? 'Difficult' : 'Fragile';

  const summary = `Execution Risk: ${verdict} (${finalScore}/100). ` +
    dimensions.map(d => `${d.name} ${d.score}`).join(' / ') +
    `. ${verdict === 'Very Likely' ? 'The modeled execution inputs are comparatively strong.' :
        verdict === 'Likely' ? 'The modeled execution inputs show fewer identified constraints.' :
        verdict === 'Moderate' ? 'The modeled execution inputs include material constraints requiring review.' :
        verdict === 'Difficult' ? 'The modeled execution inputs indicate structural changes may be needed.' :
        'The modeled execution inputs indicate substantial unresolved risk.'}`;

  return { verdict, score: finalScore, dimensions, summary };
}

// ============================================================
// DEAL-KILL CRITERIA
// ============================================================
//
// Three severities:
//   - BLOCKER: hard reject — deal cannot proceed without structural change
//   - WARNING: proceed with caution — track and disclose
//   - ACKNOWLEDGMENT: investor must explicitly acknowledge (e.g., Track 2 negative carry)

export function computeDealKillCheck(
  dscrResult: DSCRResult,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  property: PropertyInputs,
  strategy: RentalStrategy,
  reserveScenarios: ReserveScenarios | null,
  pppResult: PPPCheckResult | null,
  strResult: STRUnderwritingResult | null,
): DealKillCheck {
  const criteria: DealKillItem[] = [];

  // ── BLOCKER 1: Track 1 DSCR < 0.75 (LTR/MTR floor) ──
  // v11.1 (AUDIT-FINAL-6): STR deals require DSCR ≥ 1.0 (higher than LTR's 0.75).
  // STR income is volatile (occupancy, seasonality, regulation) so lenders impose
  // a stricter floor. Easy Street (no DSCR minimum) and no-ratio programs are
  // exempt — flagged via lender fit logic, not the deal-kill gate.
  const dscrFloor = strategy === 'STR' ? 1.0 : 0.75;
  if (dscrResult.dscr < dscrFloor) {
    criteria.push({
      criterion: strategy === 'STR'
        ? 'Track 1 DSCR below 1.00× (STR floor)'
        : 'Track 1 DSCR below 0.75×',
      triggered: true,
      severity: 'BLOCKER',
      detail: strategy === 'STR'
        ? `Track 1 DSCR is ${dscrResult.dscr.toFixed(2)}× — below the 1.00× floor for STR deals (higher than LTR's 0.75× due to occupancy/seasonality/regulation volatility).`
        : `Track 1 DSCR is ${dscrResult.dscr.toFixed(2)}× — below the 0.75× floor for nearly all DSCR programs.`,
      action: strategy === 'STR'
        ? 'Reduce purchase price, increase down payment, switch to IO, find no-ratio STR lender (e.g., Easy Street), or switch to LTR strategy.'
        : 'Reduce purchase price, increase down payment, switch to IO, or find a no-ratio lender.',
    });
  }

  // ── BLOCKER 2: LTV > 85% ──
  if (loan.ltv > 85) {
    criteria.push({
      criterion: 'LTV exceeds 85%',
      triggered: true,
      severity: 'BLOCKER',
      detail: `LTV of ${loan.ltv}% exceeds the 85% hard cap for nearly all DSCR lenders.`,
      action: 'Increase down payment or reduce purchase price.',
    });
  }

  // ── BLOCKER 3: FICO < 620 ──
  if (borrower.ficoScore < 620) {
    criteria.push({
      criterion: 'FICO below 620',
      triggered: true,
      severity: 'BLOCKER',
      detail: `FICO of ${borrower.ficoScore} is below the 620 minimum for virtually all DSCR programs.`,
      action: 'Improve credit before applying, or seek hard money with extreme premium.',
    });
  }

  // ── BLOCKER 4: STR PROHIBITED ──
  if (strategy === 'STR' && strResult && strResult.legalityGate.status === 'PROHIBITED') {
    criteria.push({
      criterion: 'STR prohibited at property location',
      triggered: true,
      severity: 'BLOCKER',
      detail: 'STR operation is prohibited at this location. STR income cannot be used for qualification.',
      action: 'Switch to LTR strategy or find a different property.',
    });
  }

  // ── BLOCKER 5: Reserves shortfall exceeds 50% of requirement ──
  if (reserveScenarios) {
    const stressShortfall = reserveScenarios.stress.shortfall;
    const stressRequired = reserveScenarios.stress.totalDollars;
    if (stressRequired > 0 && stressShortfall / stressRequired > 0.5) {
      criteria.push({
        criterion: 'Reserves shortfall exceeds 50% of stress requirement',
        triggered: true,
        severity: 'BLOCKER',
        detail: `Stress-scenario reserve shortfall is $${Math.round(stressShortfall).toLocaleString()} (${Math.round(stressShortfall / stressRequired * 100)}% of $${Math.round(stressRequired).toLocaleString()} required).`,
        action: 'Increase liquid reserves before closing, or reduce loan size / LTV.',
      });
    }
  }

  // ── WARNING 1: Track 1 DSCR 0.75-1.00 (sub-1.0) — LTR/MTR only ──
  // v11.1 (AUDIT-FINAL-6): For STR deals, sub-1.0 DSCR is already a BLOCKER
  // (STR floor = 1.0), so this warning would be redundant — skip when strategy=STR.
  if (strategy !== 'STR' && dscrResult.dscr >= 0.75 && dscrResult.dscr < 1.00) {
    criteria.push({
      criterion: 'Track 1 DSCR sub-1.0 (flex/specialist programs only)',
      triggered: true,
      severity: 'WARNING',
      detail: `Track 1 DSCR of ${dscrResult.dscr.toFixed(2)}× requires flex/specialist lenders at premium pricing.`,
      action: 'Identify no-ratio / flex-DSCR lenders. Expect 0.50-1.00% rate premium.',
    });
  }

  // ── WARNING 2: Track 2 negative carry (requires acknowledgment) ──
  if (dscrResult.dualTrackDSCR.track2.dscr < 1.0) {
    criteria.push({
      criterion: 'Track 2 negative carry — acknowledgment required',
      triggered: true,
      severity: 'ACKNOWLEDGMENT',
      detail: `Track 2 DSCR is ${dscrResult.dualTrackDSCR.track2.dscr.toFixed(2)}× — negative cash flow of $${Math.abs(dscrResult.dualTrackDSCR.track2.monthlyCashFlow).toFixed(0)}/mo after expenses.`,
      action: 'Investor must explicitly acknowledge negative carry and document appreciation/tax thesis.',
    });
  }

  // ── WARNING 3: Rate headroom < 50 bps ──
  if (dscrResult.rateHeadroomBps < 50 && dscrResult.rateHeadroomBps >= 0) {
    criteria.push({
      criterion: 'Deal-break rate headroom below 50 bps',
      triggered: true,
      severity: 'WARNING',
      detail: `Only ${dscrResult.rateHeadroomBps} bps separate the solved rate from the deal-break rate. Small rate movements break the deal.`,
      action: 'Lock rate immediately, consider rate buy-down, or restructure for more headroom.',
    });
  }

  // ── WARNING 4: PPP blocked in state ──
  if (pppResult && !pppResult.allowed) {
    criteria.push({
      criterion: `PPP blocked in ${property.state}`,
      triggered: true,
      severity: 'WARNING',
      detail: `PPP options unavailable: ${pppResult.status.replace(/_/g, ' ')}. Expect ${(pppResult.noPPPPremiumRate * 100).toFixed(2)}% rate premium.`,
      action: 'Accept no-PPP loan, or vest in eligible entity if state allows.',
    });
  }

  // ── WARNING 5: Declining market overlay ──
  if (property.isDecliningMarket) {
    criteria.push({
      criterion: 'Property in declining-market state',
      triggered: true,
      severity: 'WARNING',
      detail: `${property.state} is flagged as a declining-market state. Expect +25 bps rate adjustment and tighter LTV caps.`,
      action: 'Conservatively underwrite — lower LTV, model appraisal risk.',
    });
  }

  // ── WARNING 6: Property age > 50 years ──
  const ageYears = new Date().getFullYear() - property.yearBuilt;
  if (ageYears > 50) {
    criteria.push({
      criterion: `Property age ${ageYears} years`,
      triggered: true,
      severity: 'WARNING',
      detail: `Properties older than 50 years may trigger inspection conditions, capex reserves, or LTV reductions.`,
      action: 'Budget for inspection + capex reserve. Consider 2-4% of value for immediate repairs.',
    });
  }

  // ── WARNING 7: Non-US investor ──
  if (borrower.isNonUsInvestor) {
    criteria.push({
      criterion: 'Non-US investor borrower',
      triggered: true,
      severity: 'WARNING',
      detail: 'Non-US investors face +75 bps rate adjustment and +6 months reserve requirements.',
      action: 'Confirm SSN/ITIN path with lender. Budget for additional reserves and higher pricing.',
    });
  }

  const blockingItems = criteria
    .filter(c => c.severity === 'BLOCKER' && c.triggered)
    .map(c => c.criterion);

  const allClear = blockingItems.length === 0;

  const track2Acknowledgment = criteria.find(c => c.severity === 'ACKNOWLEDGMENT' && c.triggered) ?? null;

  return {
    criteria,
    allClear,
    blockingItems,
    track2Acknowledgment,
  };
}

// ============================================================
// TWO-QUOTE RULE VALIDATION
// ============================================================
//
// Spec: "Always obtain quotes from at least 2 lenders before proceeding."
// Strongest implementation: one flex lender (broadest eligibility)
// + one rate-competitive lender (best pricing for qualified borrowers).
//
// "Flex" = lender accepts DSCR ≤ 0.75 OR explicitly offers no-ratio
// "Rate-competitive" = lender's rateAdjustment ≤ 0 (prices at or below market)
//   OR lender fitTier is STRONG_FIT (top-tier borrower profile gets best pricing)
//
// Falls back to fitTier-based heuristic when rateAdjustment is unavailable.

export interface TwoQuoteValidation {
  satisfied: boolean;
  reason: string;
  recommendedPair: { flex: string | null; rateCompetitive: string | null };
  missingRole: 'FLEX' | 'RATE_COMPETITIVE' | 'BOTH' | null;
}

export function validateTwoQuoteRule(
  selectedLenderIds: string[],
  lenderFits: {
    lenderId: string;
    lenderName: string;
    fitTier: string;
    eligible: boolean;
    rateAdjustment?: number;
    track1DSCR?: number;
  }[],
): TwoQuoteValidation {
  const eligibleLenders = lenderFits.filter(l => l.eligible);
  if (eligibleLenders.length === 0) {
    return {
      satisfied: false,
      reason: 'No eligible lenders — restructure deal before seeking quotes.',
      recommendedPair: { flex: null, rateCompetitive: null },
      missingRole: 'BOTH',
    };
  }

  // "Flex" lender: broadly eligible — accepts DSCR ≤ 0.75 OR fitTier is CONDITIONAL_FIT
  // (i.e., lender willing to flex on guidelines)
  const flexLenders = eligibleLenders.filter(l => {
    if (l.track1DSCR !== undefined && l.track1DSCR < 1.0) return true; // sub-1.0 borrower needs flex
    return l.fitTier === 'STRONG_FIT' || l.fitTier === 'STANDARD_FIT' || l.fitTier === 'CONDITIONAL_FIT';
  });

  // "Rate-competitive" lender: rateAdjustment ≤ 0 (prices at/below market)
  // OR STRONG_FIT (when rateAdjustment unavailable, top-tier profile gets best pricing)
  const rateCompetitiveLenders = eligibleLenders.filter(l => {
    if (l.rateAdjustment !== undefined) return l.rateAdjustment <= 0;
    return l.fitTier === 'STRONG_FIT';
  });

  const selectedSet = new Set(selectedLenderIds);
  const selectedFlex = flexLenders.find(l => selectedSet.has(l.lenderId));
  const selectedRateComp = rateCompetitiveLenders.find(l => selectedSet.has(l.lenderId));

  const hasFlex = !!selectedFlex;
  const hasRateComp = !!selectedRateComp;
  const satisfied = hasFlex && hasRateComp;

  let reason: string;
  let missingRole: 'FLEX' | 'RATE_COMPETITIVE' | 'BOTH' | null;
  if (satisfied) {
    reason = `Two-quote rule satisfied: ${selectedFlex!.lenderName} (flex/eligible) + ${selectedRateComp!.lenderName} (rate-competitive).`;
    missingRole = null;
  } else if (!hasFlex && !hasRateComp) {
    reason = 'Select at least one eligible flex lender and one rate-competitive lender.';
    missingRole = 'BOTH';
  } else if (!hasFlex) {
    reason = 'Select at least one eligible flex lender for breadth of coverage.';
    missingRole = 'FLEX';
  } else {
    reason = 'Select at least one rate-competitive lender (rateAdjustment ≤ 0) for best pricing.';
    missingRole = 'RATE_COMPETITIVE';
  }

  return {
    satisfied,
    reason,
    recommendedPair: {
      flex: flexLenders[0]?.lenderName ?? null,
      rateCompetitive: rateCompetitiveLenders[0]?.lenderName ?? null,
    },
    missingRole,
  };
}

// ============================================================
// HELPER
// ============================================================

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n));
}

// ============================================================
// v11.0 UPGRADE — VERDICT, RETURN GRADE, IC MEMO
// Part J: PROCEED / RESTRUCTURE / PASS + binding constraint +
//         kill-switch + Return Grade A-F on after-tax IRR
// ============================================================

/**
 * An investor's explicit acknowledgment of Track-2 negative carry.
 *
 * Part J allows PROCEED on a sub-1.0 Track 2 only when there is an "explicit
 * appreciation/tax thesis in $/mo". That is a thesis the investor GIVES, not a
 * flag the engine RAISES — see the semantics note on `computeVerdict`. Absent
 * this object the deal cannot PROCEED on negative carry, which is the fail-
 * closed default.
 */
export interface Track2Acknowledgment {
  /** True only when the investor has explicitly acknowledged the negative carry. */
  acknowledged: boolean;
  /**
   * The appreciation / after-tax thesis, IN DOLLARS PER MONTH. Part J requires
   * the thesis be stated in $/mo, so it is carried as a number and measured
   * against the actual monthly bleed rather than accepted as unfalsifiable prose.
   */
  thesisMonthlyDollars: number;
  /** The thesis itself. An empty statement is not an acknowledgment. */
  thesisStatement: string;
}

export interface VerdictInput {
  track1DSCR: number;
  track2DSCR: number;
  lenderMinDSCR: number;
  /**
   * After-tax IRR as a DECIMAL fraction (0.15 = 15%), computed from a real
   * cash-flow schedule. `null` when the caller has no schedule to compute it
   * from — that is graded as "return not established", NOT as zero. A
   * fabricated stand-in (year-1 cash-on-cash, a 5-year cumulative figure, or a
   * negative return floored at 0) must never be passed here: the grade
   * thresholds (0.15 / 0.12 / 0.08) are ANNUALISED IRR thresholds and comparing
   * anything else against them silently inflates the grade.
   */
  afterTaxIRR: number | null;
  /** Pre-tax levered IRR as a DECIMAL fraction, or null. Reported, not gated. */
  preTaxIRR: number | null;
  /** Year-1 cash-on-cash as a DECIMAL fraction, or null. Signed — may be negative. */
  year1CoC: number | null;
  dealBreakRate: number;
  solvedRate: number;
  rateHeadroomBps: number;
  appraisalBreakpointPercent: number;
  insuranceGate: InsuranceGateResult | null;
  brrrrGate: BRRRRSeasoningGate | null;
  armReset: ARMResetResult | null;
  strLegalityStatus: string;
  pppAllowed: boolean;
  ficoScore: number;
  ltv: number;
  ltvCap: number;
  loanAmount: number;
  lenderMinLoan: number;
  /** Null when no confidence model has scored the best-fit lender. */
  bestLenderConfidence: number | null;
  /**
   * Every lender evaluated, eligible or not. An EMPTY array means "no lender was
   * ever evaluated" and is treated as "no eligible lender" — unknown must never
   * read as approved.
   */
  lenderRanking: LenderRankingEntry[];
  isDecliningMarket: boolean;
  monteCarloPDSCRLessThan1?: number;
  monteCarlo5thPctDSCR?: number;
  /** Track-2 monthly cash flow in dollars; negative = monthly bleed. */
  track2MonthlyCashFlow?: number | null;
  /** The investor's acknowledgment, when one has actually been given. */
  track2Acknowledgment?: Track2Acknowledgment | null;
}

/**
 * One of the gates PROCEED must clear. Exported so a UI can publish the exact
 * evaluation the verdict used instead of re-deriving (and drifting from) it.
 */
export interface ProceedGate {
  id:
    | 'NO_BLOCKERS'
    | 'ELIGIBLE_LENDER'
    | 'TRACK1_CUSHION'
    | 'TRACK2_CARRY'
    | 'RETURN_GRADE'
    | 'RATE_HEADROOM';
  label: string;
  /** What PROCEED demands, stated with its number. */
  requirement: string;
  /** What this deal actually shows, stated with its number. */
  observed: string;
  passed: boolean;
}

export interface VerdictDetail {
  verdict: VerdictResult;
  /** Every PROCEED gate, in evaluation order, with the numbers behind each. */
  gates: ProceedGate[];
}

/**
 * A finite number, or null.
 *
 * Every gate below runs on the null-aware value. NaN and ±Infinity are MISSING,
 * never passing: `NaN < 0.75` is false, so an unguarded NaN skipped every
 * fail-closed comparison in this engine and produced a verdict from nothing.
 */
function finite(n: number | null | undefined): number | null {
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

function fmt(n: number | null, digits = 3, suffix = ''): string {
  return n === null ? 'not established' : `${n.toFixed(digits)}${suffix}`;
}

/**
 * Compute the final verdict per Part J.
 *
 * PROCEED: T1 ≥ floor + cushion ≥0.05; T2 ≥1.0 OR explicit appreciation/tax
 *   thesis in $/mo; Return Grade ≥B on after-tax IRR; no kill criteria;
 *   ≥1 Strong/Standard lender.
 *
 * RESTRUCTURE: one fixable gate; rescue path returned with ranked options.
 *
 * PASS: hard kill; or P(DSCR<1.00) >15%; or 5th-pct DSCR < 0.80; or
 *   Return Grade ≤D with negative T2 and no thesis; or no eligible lender.
 */
/**
 * Ordinal rank for the return grade. Lower is better, so "B or better" is
 * `RETURN_GRADE_RANK[g] <= RETURN_GRADE_RANK.B`.
 *
 * Never compare the grade letters directly: they are single characters, so `>=`
 * compares code points and inverts the intent ('A' >= 'B' is false, 'D' >= 'B'
 * is true).
 */
const RETURN_GRADE_RANK: Record<'A' | 'B' | 'C' | 'D' | 'F', number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  F: 4,
};

/**
 * TRACK-2 SEMANTICS — the decision, and why.
 *
 * The gate used to read `(track2DSCR >= 1.0 || track2AcknowledgmentRequired)`
 * where `track2AcknowledgmentRequired = track2DSCR < 1.0`. That expands to
 * `(t2 >= 1.0 || t2 < 1.0)` — a tautology, true for every input including a
 * negative one. The negative-carry guard could not fail, which is how a deal
 * with Track 2 at 0.763 (a real monthly bleed) reached PROCEED.
 *
 * The flag was read backwards. `track2AcknowledgmentRequired` means an
 * acknowledgment is DEMANDED, i.e. the deal is worse; it was being consumed as
 * though it meant one had been GIVEN.
 *
 * DECISION: thread a real acknowledgment through, and fail closed without it.
 *
 * Not "always fail closed on t2 < 1.0", because Part J deliberately permits a
 * negative-carry deal to proceed on an explicit appreciation/tax thesis stated
 * in $/mo — a hard block would delete a documented, legitimate path and would
 * also be unfalsifiable in the other direction (nothing could ever satisfy it).
 * Not "keep a boolean", because a boolean derived from the DSCR can only ever
 * restate the DSCR. So the acknowledgment is an INPUT (`track2Acknowledgment`),
 * optional, absent by default, and it only unlocks PROCEED when all of:
 *   - `acknowledged === true` (an affirmative act, not a derived flag),
 *   - a non-empty `thesisStatement`,
 *   - `thesisMonthlyDollars > 0` (Part J's "stated in $/mo"), and
 *   - when the bleed is known, the thesis at least covers it — a $200/mo thesis
 *     does not justify a $1,554/mo bleed.
 * Every one of those can fail, and omitting the input entirely fails all four.
 *
 * KNOWN SPEC CONTRADICTION (owner decision required, not resolvable in code):
 * Part J's PROCEED conditions are "T2 ≥1.0 OR explicit thesis" AND "Return
 * Grade ≥B". But Grade B itself requires "T2 ≥1.00" (see `computeReturnGrade`),
 * so grade ≥B strictly implies T2 ≥1.0 and the "OR explicit thesis" branch can
 * never be the deciding factor. In effect PROCEED requires T2 ≥1.0 today.
 * The acknowledgment is still evaluated and published because it clears its own
 * gate — the UI can then show precisely that the thesis was accepted and the
 * RETURN GRADE is what still binds — but no acknowledgment can currently flip a
 * sub-1.0 Track 2 to PROCEED. Pinned by a regression test. Resolving this means
 * the owner deciding which clause wins; do not "fix" it by loosening the grade.
 */
export function computeVerdict(input: VerdictInput): VerdictResult {
  return computeVerdictDetail(input).verdict;
}

/**
 * `computeVerdict` plus the gate-by-gate evaluation behind it. The verdict and
 * the published "why" come from ONE evaluation, so a UI cannot show a reason
 * that disagrees with the answer.
 */
export function computeVerdictDetail(input: VerdictInput): VerdictDetail {
  const killCriteria: KillCriterion[] = [];
  const killSwitchConditions: string[] = [];

  // Null-aware reads. See `finite` — a non-finite input is MISSING, not passing.
  const track1 = finite(input.track1DSCR);
  const track2 = finite(input.track2DSCR);
  const lenderMinDSCR = finite(input.lenderMinDSCR);
  const afterTaxIRR = finite(input.afterTaxIRR);
  const dealBreakRate = finite(input.dealBreakRate);
  const solvedRate = finite(input.solvedRate);
  const rateHeadroomBps = finite(input.rateHeadroomBps);
  const ficoScore = finite(input.ficoScore);
  const ltv = finite(input.ltv);
  const ltvCap = finite(input.ltvCap);
  const loanAmount = finite(input.loanAmount);
  const lenderMinLoan = finite(input.lenderMinLoan);
  const bestLenderConfidence = finite(input.bestLenderConfidence);
  const appraisalBreakpointPercent = finite(input.appraisalBreakpointPercent);
  const track2MonthlyCashFlow = finite(input.track2MonthlyCashFlow);

  // === UNESTABLISHED-INPUT BLOCKERS ===
  //
  // A missing input is not a passing input. Each of these gates something below
  // that would otherwise be skipped by a false comparison against NaN/undefined.
  const requiredInputs: { present: boolean; criterion: string; detail: string; action: string }[] = [
    {
      present: track1 !== null,
      criterion: 'Track 1 DSCR Not Established',
      detail: 'No finite Track 1 DSCR was supplied, so the lender-qualification floor cannot be tested.',
      action: 'Supply a Track 1 DSCR from the DSCR engine before requesting a verdict.',
    },
    {
      present: track2 !== null,
      criterion: 'Track 2 DSCR Not Established',
      detail: 'No finite Track 2 DSCR was supplied, so monthly carry cannot be tested.',
      action: 'Supply a Track 2 DSCR from the DSCR engine before requesting a verdict.',
    },
    {
      present: lenderMinDSCR !== null,
      criterion: 'Lender DSCR Floor Unknown',
      detail: 'No verified lender DSCR floor was supplied. The qualification cushion cannot be measured against an unknown floor.',
      action: 'Supply the floor from a dated program matrix, or restrict the shortlist to programs whose floor is verified.',
    },
    {
      present: afterTaxIRR !== null,
      criterion: 'Return Not Established',
      detail: 'No finite after-tax IRR was supplied. The return grade thresholds are annualised IRR thresholds and cannot be applied to a missing or substituted figure.',
      action: 'Compute an after-tax IRR from a real cash-flow schedule, or withhold the verdict.',
    },
    {
      present: dealBreakRate !== null && solvedRate !== null,
      criterion: 'Rate Break Point Not Established',
      detail: 'The solved rate or the deal-break rate is missing, so "is this deal already broken on rate?" cannot be answered.',
      action: 'Supply both the solved rate and the deal-break rate from the DSCR engine.',
    },
    {
      present: ficoScore !== null,
      criterion: 'FICO Not Supplied',
      detail: 'No finite FICO was supplied, so the 620 lender floor cannot be tested.',
      action: 'Supply the borrower FICO.',
    },
  ];
  for (const r of requiredInputs) {
    if (!r.present) {
      killCriteria.push({
        criterion: r.criterion,
        triggered: true,
        severity: 'BLOCKER',
        detail: r.detail,
        action: r.action,
      });
    }
  }

  // === KILL CRITERIA (Part J) ===

  // 1. STR prohibited
  if (input.strLegalityStatus === 'PROHIBITED') {
    killCriteria.push({
      criterion: 'STR Prohibited',
      triggered: true,
      severity: 'BLOCKER',
      detail: `STR is legally prohibited in this jurisdiction.`,
      action: 'Switch to LTR strategy or pass on the deal.',
    });
  }

  // 1b. STR legality never evaluated. Not a blocker (an LTR deal has no STR
  // gate) but it must be visible: an unset status is silence, not a clearance.
  const KNOWN_STR_STATUSES = ['CLEAR', 'RESTRICTED', 'UNCERTAIN', 'PROHIBITED', 'NOT_APPLICABLE'];
  if (!KNOWN_STR_STATUSES.includes(input.strLegalityStatus)) {
    killCriteria.push({
      criterion: 'STR Legality Not Evaluated',
      triggered: true,
      severity: 'WARNING',
      detail: `Short-term-rental legality status is "${input.strLegalityStatus ?? 'unset'}" — no jurisdiction check has been recorded for this property.`,
      action: 'Record a jurisdiction legality check, or state on the output that the strategy is long-term rental and the STR gate does not apply.',
    });
  }

  // 2. PPP illegal for this vesting/lender
  if (!input.pppAllowed) {
    killCriteria.push({
      criterion: 'PPP Illegal for Vesting/Lender',
      triggered: true,
      severity: 'WARNING',
      detail: `Prepayment penalty is unavailable. No-PPP premium applies (+0.25% rate / +0.625% fee).`,
      action: 'Switch to entity vesting (LLC) or accept no-PPP pricing.',
    });
  }

  // 3. Insurance unconfirmed in high-risk zone (NEW v10+)
  if (input.insuranceGate && input.insuranceGate.killCriterion) {
    killCriteria.push({
      criterion: 'Insurance Unconfirmed in High-Risk Zone',
      triggered: true,
      severity: 'BLOCKER',
      detail: input.insuranceGate.reason,
      action: 'PASS — Do not proceed until a bindable insurance quote is in hand.',
    });
  } else if (!input.insuranceGate) {
    killCriteria.push({
      criterion: 'Insurance Gate Not Evaluated',
      triggered: true,
      severity: 'WARNING',
      detail: 'No insurance gate was run for this property, so a high-risk-zone premium shock is neither confirmed nor ruled out. Insurance moves DSCR more per dollar than the note rate.',
      action: 'Run the insurance gate with the property location, or obtain a bindable quote before relying on this verdict.',
    });
  }

  // 4. FICO below all floors (<620)
  if (ficoScore !== null && ficoScore < 620) {
    killCriteria.push({
      criterion: 'FICO Below All Lender Floors',
      triggered: true,
      severity: 'BLOCKER',
      detail: `FICO ${ficoScore} is below the 620 minimum floor (Griffin/Defy).`,
      action: 'Improve credit or use no-ratio program with 720+ FICO.',
    });
  }

  // 5. Track 1 < 0.75
  if (track1 !== null && track1 < 0.75) {
    killCriteria.push({
      criterion: 'Track 1 DSCR < 0.75',
      triggered: true,
      severity: 'BLOCKER',
      detail: `Track 1 DSCR ${track1.toFixed(3)} is below 0.75 — no-ratio territory only.`,
      action: 'Restructure: lower price, increase down payment, or use no-ratio program.',
    });
  }

  // 6. Appraiser rent break point exceeded (>4.83% below asking)
  if (appraisalBreakpointPercent !== null && appraisalBreakpointPercent > 4.83) {
    killCriteria.push({
      criterion: 'Appraisal Rent Break Point Exceeded',
      triggered: true,
      severity: 'WARNING',
      detail: `Appraisal break point ${appraisalBreakpointPercent.toFixed(2)}% > 4.83% threshold.`,
      action: 'Renegotiate price or increase down payment to cover appraisal gap.',
    });
  }

  // 7. Reserves not liquid / not in acceptable tier (placeholder — needs reserve engine input)

  // 8. Rate > deal-break rate
  if (solvedRate !== null && dealBreakRate !== null && solvedRate > dealBreakRate) {
    killCriteria.push({
      criterion: 'Rate Above Deal-Break Rate',
      triggered: true,
      severity: 'BLOCKER',
      detail: `Solved rate ${solvedRate.toFixed(3)}% > deal-break rate ${dealBreakRate.toFixed(2)}%.`,
      action: 'Buy down rate, restructure, or pass.',
    });
  }

  // 9. Declining-market LTV cap binds (CT/FL/IL/NJ/NY check).
  // A missing LTV or a missing cap in a declining-market state is itself a
  // blocker: `?? Infinity` on a cap (or NaN) would silently clear the deal.
  if (input.isDecliningMarket) {
    if (ltv === null || ltvCap === null) {
      killCriteria.push({
        criterion: 'Declining-Market LTV Cap Unknown',
        triggered: true,
        severity: 'BLOCKER',
        detail: 'This is a declining-market state, but the LTV or the applicable cap is not established — the overlay cannot be tested.',
        action: 'Supply the deal LTV and the program LTV cap for declining-market states.',
      });
    } else if (ltv > ltvCap) {
      killCriteria.push({
        criterion: 'Declining-Market LTV Cap Binds',
        triggered: true,
        severity: 'BLOCKER',
        detail: `LTV ${ltv}% exceeds ${ltvCap}% cap in declining market state.`,
        action: 'Reduce LTV to cap or pass.',
      });
    }
  }

  // 10. Loan < lender minimum / sub-$150K floor
  if (loanAmount === null) {
    killCriteria.push({
      criterion: 'Loan Amount Not Established',
      triggered: true,
      severity: 'WARNING',
      detail: 'No finite loan amount was supplied, so lender minimum-loan floors cannot be tested.',
      action: 'Supply the loan amount.',
    });
  } else if ((lenderMinLoan !== null && loanAmount < lenderMinLoan) || loanAmount < 150000) {
    killCriteria.push({
      criterion: 'Loan Below Lender Minimum',
      triggered: true,
      severity: 'WARNING',
      detail: `Loan amount $${loanAmount.toLocaleString()} < lender min $${(lenderMinLoan ?? 150000).toLocaleString()} or sub-$150K floor.`,
      action: 'Increase loan amount or find lender with lower minimum.',
    });
  }

  // 11. BRRRR ARV cash-out gated by seasoning (NEW v10+)
  if (input.brrrrGate && input.brrrrGate.applies && !input.brrrrGate.seasoningMet) {
    killCriteria.push({
      criterion: 'BRRRR Seasoning Not Met',
      triggered: true,
      severity: 'WARNING',
      detail: input.brrrrGate.reason,
      action: 'Wait for seasoning period or use Easy Street Capital (waives STR cash-out seasoning).',
    });
  }

  // 12. Confidence <60 on best-fit lender. An unscored lender is not a
  // confident one — it reports as unscored rather than defaulting to a pass.
  if (bestLenderConfidence === null) {
    killCriteria.push({
      criterion: 'Best-Fit Lender Not Confidence-Scored',
      triggered: true,
      severity: 'WARNING',
      detail: 'No confidence score exists for the best-fit lender, so the <60 threshold cannot be applied. Absence of a score is not a passing score.',
      action: 'Verify the lender terms directly against a dated rate sheet before proceeding.',
    });
  } else if (bestLenderConfidence < 60) {
    killCriteria.push({
      criterion: 'Low Confidence on Best-Fit Lender',
      triggered: true,
      severity: 'WARNING',
      detail: `Best-fit lender confidence ${bestLenderConfidence} < 60 threshold.`,
      action: 'Verify lender terms directly before proceeding.',
    });
  }

  // 13. ARM double-shock at reset year breaches DSCR floor (NEW v11)
  if (input.armReset && input.armReset.doubleShockRisk === 'CRITICAL') {
    killCriteria.push({
      criterion: 'ARM Double-Shock Critical Risk',
      triggered: true,
      severity: 'BLOCKER',
      detail: `IO+ARM double-shock year ${input.armReset.ioArmDoubleShockYear}: IO recast AND ARM reset hit simultaneously.`,
      action: 'Switch to fixed-rate product or separate IO expiry from ARM reset.',
    });
  }

  // 14. Monte Carlo triggers (if available). Supplied-but-non-finite is a
  // blocker: a NaN tail statistic passes every `>` comparison silently.
  if (input.monteCarloPDSCRLessThan1 !== undefined) {
    const mcP = finite(input.monteCarloPDSCRLessThan1);
    if (mcP === null) {
      killCriteria.push({
        criterion: 'Monte Carlo P(DSCR<1.00) Not Finite',
        triggered: true,
        severity: 'BLOCKER',
        detail: 'A Monte Carlo probability was supplied but is not a finite number, so the 15% / 10% tail thresholds cannot be applied.',
        action: 'Re-run the simulation, or omit the Monte Carlo inputs entirely rather than passing an invalid one.',
      });
    } else if (mcP > 0.15) {
      killCriteria.push({
        criterion: 'P(DSCR<1.00) > 15%',
        triggered: true,
        severity: 'BLOCKER',
        detail: `Monte Carlo probability of DSCR<1.00 is ${(mcP * 100).toFixed(1)}% — exceeds 15% threshold.`,
        action: 'PASS — risk threshold exceeded.',
      });
    } else if (mcP > 0.10) {
      killCriteria.push({
        criterion: 'P(DSCR<1.00) > 10%',
        triggered: true,
        severity: 'WARNING',
        detail: `Monte Carlo probability of DSCR<1.00 is ${(mcP * 100).toFixed(1)}% — CONDITIONAL.`,
        action: 'Reprice or restructure.',
      });
    }
  }
  if (input.monteCarlo5thPctDSCR !== undefined) {
    const mc5 = finite(input.monteCarlo5thPctDSCR);
    if (mc5 === null) {
      killCriteria.push({
        criterion: 'Monte Carlo 5th-Pct DSCR Not Finite',
        triggered: true,
        severity: 'BLOCKER',
        detail: 'A 5th-percentile DSCR was supplied but is not a finite number, so the 0.80 tail floor cannot be applied.',
        action: 'Re-run the simulation, or omit the Monte Carlo inputs entirely rather than passing an invalid one.',
      });
    } else if (mc5 < 0.80) {
      killCriteria.push({
        criterion: '5th-Pct DSCR < 0.80',
        triggered: true,
        severity: 'BLOCKER',
        detail: `5th-percentile DSCR ${mc5.toFixed(3)} < 0.80 — automatic flag regardless of median.`,
        action: 'PASS — tail risk exceeded.',
      });
    }
  }

  // 15. After-tax IRR outside any plausible range — a UNIT/SCALE error.
  //
  // `afterTaxIRR` is a DECIMAL fraction (0.15 = 15%). This repo has already
  // shipped two scale bugs on exactly this field: a `/100` applied to an
  // already-decimal figure (0.15 → 0.0015, see v11Runner's convention note), and
  // a cash-on-cash percentage multiplied by 5 and passed in as an IRR (22.95 →
  // graded A). A percentage passed as a decimal lands around 15; a multi-year
  // cumulative figure lands well above 1. ±200% is deliberately far outside any
  // real levered IRR, so this never fires on a real deal — only when the number
  // is not what it claims to be.
  const IRR_PLAUSIBLE_ABS_MAX = 2.0;
  if (afterTaxIRR !== null && Math.abs(afterTaxIRR) > IRR_PLAUSIBLE_ABS_MAX) {
    killCriteria.push({
      criterion: 'After-Tax IRR Outside Plausible Range',
      triggered: true,
      severity: 'BLOCKER',
      detail: `After-tax IRR was supplied as ${afterTaxIRR} — i.e. ${(afterTaxIRR * 100).toFixed(0)}%. This field is a decimal fraction (0.15 = 15%); a magnitude beyond ${IRR_PLAUSIBLE_ABS_MAX * 100}% indicates a unit or scale error, not a return.`,
      action: 'Check the units at the call site: pass a decimal fraction computed from a cash-flow schedule, not a percentage and not a multi-year cumulative figure.',
    });
  }

  // === TRACK 2 ACKNOWLEDGMENT (not a kill — forced acknowledgment) ===
  // Required when carry is sub-1.0 OR when Track 2 is unknown. See the
  // semantics note on `computeVerdict`: REQUIRED is not GIVEN.
  const track2AcknowledgmentRequired = track2 === null || track2 < 1.0;
  const ack = input.track2Acknowledgment ?? null;
  const ackThesis = finite(ack?.thesisMonthlyDollars);
  const ackCoversBleed =
    track2MonthlyCashFlow === null || track2MonthlyCashFlow >= 0
      ? true
      : (ackThesis ?? 0) >= Math.abs(track2MonthlyCashFlow);
  const ackGiven =
    ack !== null &&
    ack.acknowledged === true &&
    typeof ack.thesisStatement === 'string' &&
    ack.thesisStatement.trim().length > 0 &&
    ackThesis !== null &&
    ackThesis > 0 &&
    ackCoversBleed;

  if (track2AcknowledgmentRequired) {
    const bleedText =
      track2MonthlyCashFlow !== null && track2MonthlyCashFlow < 0
        ? ` Monthly bleed is $${Math.abs(Math.round(track2MonthlyCashFlow)).toLocaleString()}/mo.`
        : '';
    killCriteria.push({
      criterion: 'Track 2 Negative Carry',
      triggered: true,
      severity: 'ACKNOWLEDGMENT',
      detail:
        track2 === null
          ? 'Track 2 DSCR is not established, so monthly carry is unknown. Unknown carry is treated as negative carry.'
          : `Track 2 DSCR ${track2.toFixed(3)} < 1.0 — deal qualifies but loses money monthly.${bleedText}` +
            (ackGiven ? ' An acknowledgment with a $/mo thesis is on file.' : ' No acknowledgment is on file.'),
      action: 'Record an explicit acknowledgment with an appreciation or after-tax thesis stated in $/mo that at least covers the bleed. Without one this deal cannot PROCEED.',
    });
  }

  // === RETURN GRADE (Part J) ===
  // When the IRR is not established, the grade is reported as F and the
  // 'Return Not Established' BLOCKER above already forces PASS. Grading unknown
  // as anything better would let a missing input read as an approval.
  const returnGrade: ReturnGrade =
    afterTaxIRR === null ? 'F' : computeReturnGrade(afterTaxIRR, track2 ?? -1);
  const returnGradeReason =
    afterTaxIRR === null
      ? 'Return grade not established: no finite after-tax IRR was supplied. Reported as F because an ungraded return must not read as a passing one.'
      : buildReturnGradeReason(returnGrade, afterTaxIRR, track2 ?? -1);

  // === DETERMINE VERDICT ===
  const blockers = killCriteria.filter(k => k.severity === 'BLOCKER' && k.triggered);

  // FAIL-CLOSED LENDER CHECK.
  // This was `length === 0 || some(eligible)` — an empty ranking returned TRUE,
  // so "no lender was ever evaluated" was scored as "an eligible lender exists",
  // and any caller omitting `lenderRanking` got a free pass. In a lending tool
  // unknown must never read as approved.
  const ranking = input.lenderRanking ?? [];
  const eligibleLenderCount = ranking.filter(l => l.eligible).length;
  const hasEligibleLender = eligibleLenderCount > 0;
  const lenderObserved =
    ranking.length === 0
      ? 'no lender evaluated'
      : `${eligibleLenderCount} eligible of ${ranking.length} evaluated`;
  const lenderConstraint =
    ranking.length === 0
      ? 'Lender eligibility not evaluated — no lender ranking was supplied.'
      : `No eligible lender: 0 of ${ranking.length} evaluated programs accept this deal as structured.`;

  // === PROCEED GATES — every gate, with the numbers behind it ===
  const track1Required = lenderMinDSCR === null ? null : lenderMinDSCR + 0.05;
  const gates: ProceedGate[] = [
    {
      id: 'NO_BLOCKERS',
      label: 'No hard blockers',
      requirement: '0 BLOCKER criteria triggered',
      observed: `${blockers.length} triggered${blockers.length > 0 ? ` (${blockers.map(b => b.criterion).join('; ')})` : ''}`,
      passed: blockers.length === 0,
    },
    {
      id: 'ELIGIBLE_LENDER',
      label: 'At least one eligible lender',
      requirement: '≥ 1 evaluated program eligible',
      observed: lenderObserved,
      passed: hasEligibleLender,
    },
    {
      id: 'TRACK1_CUSHION',
      label: 'Track 1 cushion above the lender floor',
      requirement: `Track 1 DSCR ≥ ${fmt(track1Required, 3)} (floor ${fmt(lenderMinDSCR, 2)} + 0.05 cushion)`,
      observed: `Track 1 DSCR ${fmt(track1, 3)}`,
      passed: track1 !== null && track1Required !== null && track1 >= track1Required,
    },
    {
      id: 'TRACK2_CARRY',
      label: 'Track 2 carry, or an acknowledged thesis',
      requirement: 'Track 2 DSCR ≥ 1.000, or an explicit acknowledgment with a $/mo thesis that covers the bleed',
      observed:
        `Track 2 DSCR ${fmt(track2, 3)}` +
        (track2 !== null && track2 >= 1.0
          ? ''
          : ackGiven
            ? ` — acknowledgment on file, thesis $${Math.round(ackThesis ?? 0).toLocaleString()}/mo`
            : ' — no acknowledgment on file'),
      passed: (track2 !== null && track2 >= 1.0) || (track2 !== null && track2 >= 0 && ackGiven),
    },
    {
      id: 'RETURN_GRADE',
      label: 'Return grade B or better',
      requirement: 'Return grade ≤ B on after-tax IRR',
      observed:
        afterTaxIRR === null
          ? 'after-tax IRR not established'
          : `grade ${returnGrade} on after-tax IRR ${(afterTaxIRR * 100).toFixed(1)}%`,
      // `returnGrade >= 'B'` was a STRING comparison: 'A' >= 'B' is false and
      // 'D' >= 'B' is true, so the gate was inverted — grade A was rejected
      // while C and D passed. Compare rank, not code points.
      passed: afterTaxIRR !== null && RETURN_GRADE_RANK[returnGrade] <= RETURN_GRADE_RANK.B,
    },
    {
      id: 'RATE_HEADROOM',
      label: 'Rate headroom before the deal breaks',
      requirement: '≥ 50 bps',
      observed: rateHeadroomBps === null ? 'not established' : `${Math.round(rateHeadroomBps)} bps`,
      passed: rateHeadroomBps !== null && rateHeadroomBps >= 50,
    },
  ];

  const failedGates = gates.filter(g => !g.passed);

  let verdict: 'PROCEED' | 'RESTRUCTURE' | 'PASS';
  let bindingConstraint: string;

  if (blockers.length > 0 || !hasEligibleLender || returnGrade === 'F') {
    verdict = 'PASS';
    bindingConstraint =
      blockers.length > 0
        ? `${blockers[0].criterion} — ${blockers[0].detail}`
        : !hasEligibleLender
          ? lenderConstraint
          : `Return Grade F — ${returnGradeReason}`;
  } else if (failedGates.length === 0) {
    verdict = 'PROCEED';
    bindingConstraint = 'None — every PROCEED gate clears.';
  } else {
    verdict = 'RESTRUCTURE';
    // The binding constraint is the gate that actually BOUND. It was previously
    // the first triggered kill criterion, falling back to the Track-1 cushion —
    // which printed the deal's STRENGTH ("Track 1 cushion: 0.696") as the reason
    // for its rejection. A constraint must be something that failed.
    bindingConstraint = `${failedGates[0].label}: requires ${failedGates[0].requirement}; deal shows ${failedGates[0].observed}.`;
  }

  // === KILL-SWITCH CONDITIONS ===
  killSwitchConditions.push(
    dealBreakRate === null
      ? 'Deal-break rate is not established — the rate at which this verdict flips to PASS is unknown.'
      : `If solved rate rises above ${dealBreakRate.toFixed(2)}% → verdict flips to PASS.`,
  );
  killSwitchConditions.push(
    lenderMinDSCR === null
      ? 'Lender DSCR floor is not established — the DSCR at which this verdict flips is unknown.'
      : `If Track 1 DSCR drops below ${lenderMinDSCR.toFixed(2)} → verdict flips to RESTRUCTURE.`,
  );
  if (input.armReset) {
    killSwitchConditions.push(`If SOFR rises to 5.0% (stress), Track 1 at reset = ${input.armReset.track1DSCRAtStressReset.toFixed(3)} → if <1.0, verdict flips to PASS.`);
  }
  if (input.insuranceGate && input.insuranceGate.zone !== 'STANDARD') {
    killSwitchConditions.push(`If insurance quote not bindable within 14 days → verdict flips to PASS.`);
  }

  // === TRACK 2 ACK TEXT ===
  const track2AcknowledgmentText = track2AcknowledgmentRequired
    ? `Track 1 DSCR ${fmt(track1, 3)} against a lender floor of ${fmt(lenderMinDSCR, 2)}, but Track 2 DSCR ${fmt(track2, 3)} is below 1.0` +
      (track2MonthlyCashFlow !== null && track2MonthlyCashFlow < 0
        ? ` — a bleed of $${Math.abs(Math.round(track2MonthlyCashFlow)).toLocaleString()}/mo.`
        : '.') +
      (ackGiven
        ? ` An acknowledgment is on file with a stated thesis of $${Math.round(ackThesis ?? 0).toLocaleString()}/mo: "${ack?.thesisStatement.trim()}".`
        : ` No acknowledgment is on file. PROCEED requires an explicit acknowledgment whose appreciation or after-tax thesis, stated in $/mo, at least covers the bleed.`)
    : null;

  const verdictResult: VerdictResult = {
    verdict,
    bindingConstraint,
    killSwitchConditions,
    returnGrade,
    returnGradeReason,
    track2AcknowledgmentRequired,
    track2AcknowledgmentText,
    killCriteriaTriggered: killCriteria.filter(k => k.triggered),
    rescueOptions: [], // populated by rescue engine
    note:
      `Verdict ${verdict} from ${killCriteria.length} kill criteria checked, ${blockers.length} blockers triggered. ` +
      `PROCEED gates: ` +
      gates.map(g => `${g.label} ${g.passed ? 'PASS' : 'FAIL'} (${g.observed})`).join(' · ') +
      '.',
  };

  return { verdict: verdictResult, gates };
}

/**
 * Return Grade (Part J):
 *   A: After-tax IRR ≥15%; T2 ≥1.10
 *   B: 12-15%; T2 ≥1.00
 *   C: 8-12%; T2 <1.00 with appreciation thesis
 *   D: <8% or T2 negative
 *   F: PASS scenario (negative after-tax IRR, hard kill, or no lender)
 */
export function computeReturnGrade(
  afterTaxIRR: number,
  track2DSCR: number,
): ReturnGrade {
  // afterTaxIRR is passed as a decimal (0.15 = 15%)
  const irrPct = afterTaxIRR;

  // A non-finite input fails every `<` comparison below and would have fallen
  // through to 'D'. Unknown grades as F, never as a passing grade.
  if (!Number.isFinite(irrPct) || !Number.isFinite(track2DSCR)) return 'F';
  if (irrPct < 0 || track2DSCR < 0) return 'F';
  if (irrPct >= 0.15 && track2DSCR >= 1.10) return 'A';
  if (irrPct >= 0.12 && track2DSCR >= 1.00) return 'B';
  if (irrPct >= 0.08) return 'C';
  return 'D';
}

function buildReturnGradeReason(
  grade: ReturnGrade,
  afterTaxIRR: number,
  track2DSCR: number,
): string {
  const irrPct = (afterTaxIRR * 100).toFixed(1);
  const t2Val = (track2DSCR ?? 0).toFixed(3);

  switch (grade) {
    case 'A':
      return `Grade A: After-tax IRR ${irrPct}% ≥ 15% AND Track 2 DSCR ${t2Val} ≥ 1.10. Institutional-grade return with survival cushion.`;
    case 'B':
      return `Grade B: After-tax IRR ${irrPct}% in 12-15% range AND Track 2 DSCR ${t2Val} ≥ 1.00. Solid return with adequate cash flow.`;
    case 'C':
      return `Grade C: After-tax IRR ${irrPct}% in 8-12% range. Track 2 DSCR ${t2Val} < 1.00 — proceed only with appreciation thesis in $/mo.`;
    case 'D':
      return `Grade D: After-tax IRR ${irrPct}% < 8% OR Track 2 DSCR ${t2Val} negative. Marginal return; requires structural fix.`;
    case 'F':
      return `Grade F: PASS scenario — negative after-tax IRR, hard kill, or no eligible lender. Do not proceed.`;
  }
}

// ============================================================
// IC MEMO EXPORT (Part J)
// ============================================================

export interface ICMemoInput {
  propertyAddress: string;
  entityType: string;
  verdict: VerdictResult;
  track1DSCR: number;
  lenderMinDSCR: number;
  debtYield: number;
  ltv: number;
  ltvCap: number;
  dealBreakRate: number;
  cushionBps: number;
  entryCapRate: number;
  year1CoC: number;
  preTaxIRR: number;
  preTaxP10: number;
  preTaxP90: number;
  afterTaxIRR: number;
  equityMultiple: number;
  sellerAnnualTax: number;
  reassessedAnnualTax: number;
  bindingRisk: string;
  pDSCRLessThan1: number;
  fifthPctDSCR: number;
  heatmapSummary: string;
  armReset: ARMResetResult | null;
  lenderRanking: LenderRankingEntry[];
  insuranceStatus: string;
  strLegality: string;
  reserves: { likely: number; conservative: number; stress: number; portfolioStack: number };
  prepaySchedule: string;
  assumptions: string[];
  sourceDates: { name: string; date: string; provenance: ProvenanceLabel }[];
}

function sanitizeString(str: string): string {
  return (str || '').replace(/[&<>"']/g, (match) => {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

export function buildICMemo(input: ICMemoInput): ICMemo {
  const riskStatement = buildRiskStatement(input);

  return {
    generatedAt: new Date().toISOString(),
    propertyAddress: sanitizeString(input.propertyAddress),
    entityType: sanitizeString(input.entityType),
    verdict: input.verdict.verdict,
    bindingConstraint: input.verdict.bindingConstraint,
    killSwitch: input.verdict.killSwitchConditions[0] ?? 'None',
    threeMetricCredit: {
      track1DSCR: input.track1DSCR,
      lenderMinDSCR: input.lenderMinDSCR,
      debtYield: input.debtYield,
      debtYieldTarget: 9,
      ltv: input.ltv,
      ltvCap: input.ltvCap,
      dealBreakRate: input.dealBreakRate,
      cushionBps: input.cushionBps,
    },
    returnStack: {
      entryCapRate: input.entryCapRate,
      year1CoC: input.year1CoC,
      preTaxIRR: input.preTaxIRR,
      preTaxP10: input.preTaxP10,
      preTaxP90: input.preTaxP90,
      afterTaxIRR: input.afterTaxIRR,
      returnGrade: input.verdict.returnGrade,
      equityMultiple: input.equityMultiple,
      sellerAnnualTax: input.sellerAnnualTax,
      reassessedAnnualTax: input.reassessedAnnualTax,
    },
    probabilisticStress: {
      bindingRisk: input.bindingRisk,
      pDSCRLessThan1: input.pDSCRLessThan1,
      fifthPctDSCR: input.fifthPctDSCR,
      heatmapSummary: input.heatmapSummary,
    },
    armReset: input.armReset ? {
      initialRate: input.armReset.initialRate,
      resetRateAtCurrent: input.armReset.resetRateAtCurrentIndex,
      resetRateAtStress: input.armReset.resetRateAtStressIndex,
      track1AtStress: input.armReset.track1DSCRAtStressReset,
      doubleShockYear: input.armReset.ioArmDoubleShockYear,
    } : null,
    lenderRanking: input.lenderRanking,
    insuranceStatus: input.insuranceStatus,
    strLegality: input.strLegality,
    reserves: input.reserves,
    prepaySchedule: input.prepaySchedule,
    riskStatement,
    assumptions: input.assumptions,
    sourceDates: input.sourceDates,
    disclaimer: `UNVALIDATED DECISION-SUPPORT MODEL. This output is an educational scenario based on user-entered assumptions and internally configured weights that are not empirically calibrated. It is not a loan commitment, credit decision, appraisal, rate quote, provider match, legal or tax conclusion, investment recommendation, or prediction. Rates, provider guidelines, jurisdiction rules, insurance, taxes, and transaction facts can change and require current primary sources plus review by the responsible licensed or qualified professional. Do not rely on this output for a financing, legal, tax, or investment decision.`,
  };
}

function buildRiskStatement(input: ICMemoInput): string {
  const parts: string[] = [];
  parts.push(`Property: ${input.propertyAddress} (${input.entityType}). `);
  parts.push(`Qualification: Track 1 DSCR ${input.track1DSCR.toFixed(3)} vs lender floor ${input.lenderMinDSCR.toFixed(2)} — cushion ${(input.track1DSCR - input.lenderMinDSCR).toFixed(3)}. `);
  parts.push(`Return: After-tax IRR ${(input.afterTaxIRR * 100).toFixed(1)}% (Grade ${input.verdict.returnGrade}), equity multiple ${input.equityMultiple.toFixed(2)}x. `);
  parts.push(`Risk: Binding risk = ${input.bindingRisk}. P(DSCR<1.00) = ${(input.pDSCRLessThan1 * 100).toFixed(1)}%. `);
  parts.push(`Structural condition that flips verdict: ${input.verdict.killSwitchConditions[0] ?? 'None'}.`);
  return parts.join('');
}
