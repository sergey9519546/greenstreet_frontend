import type {
  DealInputs,
  DscrReport,
  TruthMatrix,
  Quadrant,
  FourScores,
  ActionType,
  ActionVerdict,
  DealSnapshot,
  LenderVerdict,
  InvestorVerdict,
  StressScenario,
  DataQualityResult,
} from './types';
import { buildLenderVerdict } from './lender';
import { buildInvestorVerdict } from './investor';
import { buildStressScenarios } from './stress';
import { calculateDataQuality } from './fraud';
import { validateDealInputs } from './validation';
import { round, ratio, INFINITE_RUNWAY } from './math';
import { PRICING_TIERS, RUNWAY_INFINITE_SENTINEL, CLOSING_COSTS_PCT } from './constants';

// ============================================================================
// SCORING + TRUTH MATRIX + ACTION ENGINE
// ============================================================================
// Combines Track A, Track B, stress, and fraud into four 0-100 scores,
// a 2x2 truth matrix verdict, and an action recommendation.
// ============================================================================

// ---------------------------------------------------------------------------
// FOUR SCORES — structured-object signature (no positional args)
// ---------------------------------------------------------------------------

interface ScoreInputs {
  inputs: DealInputs;
  lenderPass: boolean;
  lenderDscr: number;
  dscrRequired: number;
  investorDscr: number;
  monthlyCashFlow: number;
  liquidityRunway: number;
  ltvActual: number;
  maxLtvAllowed: number;
  reserveMonths: number;
  reserveRequiredMonths: number;
  stressScenarios: StressScenario[];
  dataScore: number;
  postRecastDscr?: number;
}

export function calculateScores(s: ScoreInputs): FourScores {
  const i = s.inputs;

  // 1. Lender Qualification Score (0-100)
  let lender = 0;
  if (s.lenderPass) lender += 35;
  const dscrCushion = s.lenderDscr - s.dscrRequired;
  lender += Math.max(0, Math.min(25, (dscrCushion / 0.5) * 25));
  if (i.fico >= 780) lender += 15;
  else if (i.fico >= 740) lender += 12;
  else if (i.fico >= 700) lender += 9;
  else if (i.fico >= 680) lender += 6;
  else if (i.fico >= 640) lender += 3;
  const ltvCushion = s.maxLtvAllowed - s.ltvActual;
  lender += Math.max(0, Math.min(10, (ltvCushion / 10) * 10));
  const reserveCushion = s.reserveMonths - s.reserveRequiredMonths;
  lender += Math.max(0, Math.min(8, (reserveCushion / 6) * 8));
  lender += Math.min(7, i.experienceProperties * 1.5);
  // Penalty if IO recast creates a problem
  if (s.postRecastDscr !== undefined && s.postRecastDscr < s.dscrRequired) {
    lender = Math.max(0, lender - 10);
  }
  lender = Math.max(0, Math.min(100, Math.round(lender)));

  // 2. Pricing Efficiency Score (0-100) — higher = better pricing for borrower
  // v12 (P2-batch-A): Was 6 hardcoded if/else branches with magic rate/point tiers.
  // Now driven by PRICING_TIERS table from constants.ts.
  let pricing = 50;
  for (const tier of PRICING_TIERS) {
    if (i.rate <= tier.maxRate) { pricing += tier.points; break; }
  }
  if (i.points <= 0) pricing += 15;
  else if (i.points <= 1) pricing += 10;
  else if (i.points <= 2) pricing += 0;
  else if (i.points <= 3) pricing -= 10;
  else pricing -= 20;
  if (i.prepayType === 'NONE') pricing += 10;
  else if (i.prepayType === 'YSP_2_1') pricing += 5;
  else if (i.prepayType === 'YSP_3_2_1') pricing -= 5;
  else if (i.prepayType === 'YSP_5_4_3_2_1') pricing -= 10;
  else if (i.prepayType === 'LOCKOUT_3Y' || i.prepayType === 'DEFIANCE_3Y') pricing -= 20;
  if (i.interestOnlyMonths > 0) pricing -= 5;
  if (i.structure.startsWith('ARM_')) pricing -= 3; // ARM reset risk discount
  pricing = Math.max(0, Math.min(100, Math.round(pricing)));

  // 3. Investor Survival Score (0-100)
  let survival = 0;
  if (s.investorDscr >= 1.4) survival += 30;
  else if (s.investorDscr >= 1.25) survival += 25;
  else if (s.investorDscr >= 1.1) survival += 18;
  else if (s.investorDscr >= 1.0) survival += 10;
  else if (s.investorDscr >= 0.9) survival += 4;
  if (s.monthlyCashFlow > 500) survival += 20;
  else if (s.monthlyCashFlow > 200) survival += 15;
  else if (s.monthlyCashFlow > 0) survival += 10;
  else if (s.monthlyCashFlow > -300) survival += 0;
  else survival -= 10;
  // v12 (P2-batch-A): Use named constant for infinite-runway sentinel (was magic 9999)
  const runwayFinite = Number.isFinite(s.liquidityRunway) ? s.liquidityRunway : RUNWAY_INFINITE_SENTINEL;
  if (runwayFinite >= 24 || s.monthlyCashFlow >= 0) survival += 15;
  else if (runwayFinite >= 12) survival += 10;
  else if (runwayFinite >= 6) survival += 5;
  // Stress survival — fraction of scenarios that Pass/Watch
  const passCount = s.stressScenarios.filter((x) => x.verdict === 'Pass').length;
  const watchCount = s.stressScenarios.filter((x) => x.verdict === 'Watch').length;
  survival += Math.round((passCount / Math.max(1, s.stressScenarios.length)) * 25);
  survival += Math.round((watchCount / Math.max(1, s.stressScenarios.length)) * 10);
  survival = Math.max(0, Math.min(100, Math.round(survival)));

  // 4. Data Confidence Score — directly from fraud/data quality
  const dataConfidence = s.dataScore;

  return {
    lenderQualification: lender,
    pricingEfficiency: pricing,
    investorSurvival: survival,
    dataConfidence,
  };
}

// ---------------------------------------------------------------------------
// TRUTH MATRIX — 2x2 reconciliation
// ---------------------------------------------------------------------------

export function buildTruthMatrix(
  lenderApproves: boolean,
  investorSurvives: boolean
): TruthMatrix {
  let quadrant: Quadrant;
  let label: string;
  let description: string;

  if (lenderApproves && investorSurvives) {
    quadrant = 'GREEN';
    label = 'Green Deal';
    description =
      'Lender approves AND investor survives real NOI stress. Close if pricing is acceptable.';
  } else if (lenderApproves && !investorSurvives) {
    quadrant = 'TRAP';
    label = 'Trap Deal';
    description =
      'Lender approves BUT investor fails real-world survival. This is the most dangerous quadrant — a normal DSCR calculator would mislead the borrower into closing.';
  } else if (!lenderApproves && investorSurvives) {
    quadrant = 'STRUCTURING';
    label = 'Structuring Opportunity';
    description =
      'Investor survives but lender rejects at current structure. Lower LTV, improve docs, switch product, or use alternative lender to close.';
  } else {
    quadrant = 'KILL';
    label = 'Kill Deal';
    description =
      'Fails both credit and survival logic. Walk away.';
  }

  return { lenderApproves, investorSurvives, quadrant, label, description };
}

// ---------------------------------------------------------------------------
// ACTION VERDICT
// ---------------------------------------------------------------------------

interface ActionInputs {
  inputs: DealInputs;
  truthMatrix: TruthMatrix;
  lenderVerdict: LenderVerdict;
  investorVerdict: InvestorVerdict;
  scores: FourScores;
}

export function buildAction(s: ActionInputs): ActionVerdict {
  const i = s.inputs;
  const { truthMatrix: tm, lenderVerdict, investorVerdict, scores } = s;

  const fixes: { fix: string; impact: string; feasibility: 'high' | 'medium' | 'low' }[] = [];

  // Build fix menu based on what's failing
  if (!investorVerdict.survives) {
    // Reduce leverage — only suggest if there's actual LTV headroom to cut
    const newLtv = Math.max(50, lenderVerdict.matrix.ltvActual - 10);
    if (newLtv < lenderVerdict.matrix.ltvActual) {
      const valueBase = i.appraisedValue || i.purchasePrice;
      const newLoan = (newLtv / 100) * valueBase;
      fixes.push({
        fix: `Reduce leverage to ${newLtv}% LTV (loan ≈ $${(newLoan / 1000).toFixed(0)}k)`,
        impact: 'Lowers debt service, lifts investor DSCR toward 1.0x',
        feasibility: 'high',
      });
    }
    // Reduce purchase price
    const priceReductionNeeded = i.purchasePrice * 0.1;
    fixes.push({
      fix: `Reduce purchase price by $${(priceReductionNeeded / 1000).toFixed(0)}k`,
      impact: 'Improves cap rate, lowers down payment AND debt service',
      feasibility: 'medium',
    });
    // Verify and lock rent
    fixes.push({
      fix: `Verify and lock rent at $${i.borrowerRentClaim.toFixed(0)}/mo with deposit-verified lease`,
      impact: 'Strengthens rent hierarchy, raises lender-eligible rent',
      feasibility: 'high',
    });
    // Rate buydown
    fixes.push({
      fix: 'Buy down rate by 75 bps',
      impact: 'Reduces monthly debt service, lifts both DSCRs',
      feasibility: 'medium',
    });
    if (i.interestOnlyMonths > 0) {
      fixes.push({
        fix: 'Eliminate IO period — use full amortizing payment from day 1',
        impact: 'Avoids payment cliff at recast',
        feasibility: 'high',
      });
    }
    // ARM refi
    if (i.structure.startsWith('ARM_')) {
      fixes.push({
        fix: 'Refinance ARM into fixed-rate before reset',
        impact: 'Eliminates ARM reset risk on payment shock',
        feasibility: 'medium',
      });
    }
  }

  if (!lenderVerdict.pass) {
    if (lenderVerdict.matrix.ltvActual > lenderVerdict.matrix.maxLtvAllowed) {
      const valueBase = i.appraisedValue || i.purchasePrice;
      const additionalDown = ((lenderVerdict.matrix.ltvActual - lenderVerdict.matrix.maxLtvAllowed) / 100) * valueBase;
      fixes.push({
        fix: `Lower LTV from ${lenderVerdict.matrix.ltvActual.toFixed(1)}% to ${lenderVerdict.matrix.maxLtvAllowed}% (add $${(additionalDown / 1000).toFixed(0)}k down)`,
        impact: 'Passes LTV gate, unlocks best program',
        feasibility: 'high',
      });
    }
    if (lenderVerdict.matrix.reserveShortfall > 0) {
      fixes.push({
        fix: `Add ${lenderVerdict.matrix.reserveShortfall} months PITIA to reserves`,
        impact: 'Passes reserve gate',
        feasibility: 'medium',
      });
    }
    fixes.push({
      fix: 'Switch lender/product (alternative non-QM or hard money)',
      impact: 'Different matrix, possibly higher cost but flexible',
      feasibility: 'medium',
    });
  }

  // Documentation fixes
  if (!i.insuranceQuotedBindable) {
    fixes.push({
      fix: 'Obtain bindable insurance quote',
      impact: 'Clears documentation exception',
      feasibility: 'high',
    });
  }
  if (!i.taxReassessmentEstimated) {
    fixes.push({
      fix: 'Estimate post-sale tax reassessment',
      impact: 'Removes hidden tax shock risk',
      feasibility: 'high',
    });
  }
  if (i.leaseVerified && !i.leaseDepositVerified) {
    fixes.push({
      fix: 'Trace lease deposit to borrower bank statements',
      impact: 'Confirms lease authenticity',
      feasibility: 'high',
    });
  }

  // Determine final action — properly ordered for each quadrant
  let action: ActionType;
  let label: string;
  let summary: string;

  switch (tm.quadrant) {
    case 'GREEN':
      if (scores.pricingEfficiency >= 70) {
        action = 'CLOSE_AS_STRUCTURED';
        label = 'Close As Structured';
        summary = 'Lender approves, investor survives, pricing acceptable. Proceed to close.';
      } else if (scores.pricingEfficiency >= 45) {
        action = 'CLOSE_WITH_RATE_BUYDOWN';
        label = 'Close With Rate Buydown';
        summary = 'Deal is sound — buy down rate 50–75 bps to improve pricing efficiency and investor cash flow.';
      } else {
        action = 'SWITCH_LENDER_PRODUCT';
        label = 'Close After Pricing Optimization';
        summary =
          'Deal is sound but pricing is below market — shop 2-3 lenders or negotiate points/rate before committing.';
      }
      break;

    case 'TRAP':
      // FIX (C5): structural failure must be checked BEFORE doc fixes.
      // If investor DSCR is severely broken, no amount of doc cleanup saves it.
      if (investorVerdict.result.investorDscr < 0.85) {
        action = 'KILL';
        label = 'Kill the Deal';
        summary =
          'Investor DSCR is far below 1.00x even before stress. No reasonable restructuring saves this — walk.';
      } else if (investorVerdict.result.monthlyCashFlow < -500 && scores.investorSurvival < 15) {
        action = 'CLOSE_WITH_LOWER_LEVERAGE';
        label = 'Close Only With Lower Leverage';
        summary =
          'Severe cash-flow drain — must reduce leverage AND lower price/rate before closing. Track B is failing on the base case.';
      } else if (lenderVerdict.matrix.documentationExceptions.length > 0 && lenderVerdict.matrix.guidelineConflicts.length === 0) {
        // Only doc issues stand in the way
        action = 'CLOSE_AFTER_LEASE_VERIFICATION';
        label = 'Close After Lease Verification';
        summary =
          'Conditional — must clear documentation conditions (lease deposit, insurance, tax reassessment) before proceeding.';
      } else {
        action = 'CLOSE_WITH_LOWER_LEVERAGE';
        label = 'Close Only With Lower Leverage';
        summary =
          'Restructure required: lower LTV, reduce price, or buy down rate. Deal must survive Track B before closing.';
      }
      break;

    case 'STRUCTURING':
      if (lenderVerdict.matrix.ltvActual > lenderVerdict.matrix.maxLtvAllowed) {
        action = 'CLOSE_WITH_LOWER_LEVERAGE';
        label = 'Close With Lower Leverage';
        summary =
          'Investor survives — just need to bring LTV down to fit lender matrix. Add down payment or negotiate price.';
      } else if (lenderVerdict.matrix.reserveShortfall > 0) {
        action = 'CLOSE_WITH_SELLER_CREDIT';
        label = 'Close With Seller Credit';
        summary =
          'Use seller credit to cover closing costs and free up cash for required reserves.';
      } else if (!i.insuranceQuotedBindable || !i.taxReassessmentEstimated) {
        action = 'DELAY';
        label = 'Delay — Clear Conditions';
        summary =
          'Investor survives but lender conditions (insurance binding, tax reassessment) must clear. Delay 1–2 weeks.';
      } else {
        action = 'SWITCH_LENDER_PRODUCT';
        label = 'Switch Lender / Product';
        summary =
          'Investor survives but current lender matrix rejects. Try alternative non-QM lender or different program.';
      }
      break;

    case 'KILL':
      action = 'KILL';
      label = 'Kill the Deal';
      summary =
        'Fails both lender and investor logic. No structuring can rescue — walk away and redeploy capital.';
      break;
  }

  const alternatives: string[] = [];
  if (action !== 'KILL') {
    alternatives.push('Walk away — opportunity cost of capital should be evaluated.');
  }
  if (i.rentType === 'STR') {
    alternatives.push('Convert to mid-term rental (30+ day stays) to reduce platform fees and seasonality.');
  }
  alternatives.push('Bring in equity partner to share downside and reduce leverage.');
  if (i.interestOnlyMonths > 0) {
    alternatives.push('Switch from IO to amortizing to avoid payment cliff risk.');
  }
  if (i.structure.startsWith('ARM_')) {
    alternatives.push('Refinance ARM into fixed-rate before reset.');
  }

  return {
    action,
    label,
    summary,
    requiredFixes: fixes.map((f) => f.fix),
    alternatives,
    requiredFixMatrix: fixes,
  };
}

// ---------------------------------------------------------------------------
// DEAL SNAPSHOT
// ---------------------------------------------------------------------------

const PREPAY_LABELS: Record<string, string> = {
  NONE: 'None',
  YSP_3_2_1: 'Step-Down 3-2-1 (3yr)',
  YSP_5_4_3_2_1: 'Step-Down 5-4-3-2-1 (5yr)',
  YSP_2_1: 'Step-Down 2-1 (2yr)',
  LOCKOUT_3Y: 'Lockout 3yr',
  DEFIANCE_3Y: 'Defeasance 3yr',
};

export function buildDealSnapshot(i: DealInputs): DealSnapshot {
  const downPayment = i.purchasePrice - i.loanAmount;
  const pointsCost = (i.points / 100) * i.loanAmount;
  // v12 (P2-batch-A): Was hardcoded 0.015 — now CLOSING_COSTS_PCT from constants
  const closingCosts = i.purchasePrice * CLOSING_COSTS_PCT;
  return {
    purchasePrice: i.purchasePrice,
    appraisedValue: i.appraisedValue,
    loanAmount: i.loanAmount,
    ltv: round((i.loanAmount / (i.appraisedValue || i.purchasePrice)) * 100, 2),
    rate: i.rate,
    points: i.points,
    term: `${Math.round(i.termMonths / 12)}-yr`,
    amortization: `${Math.round(i.amortMonths / 12)}-yr`,
    interestOnlyPeriod: i.interestOnlyMonths > 0 ? `${Math.round(i.interestOnlyMonths / 12)}-yr IO` : 'None',
    prepayPenalty: PREPAY_LABELS[i.prepayType] ?? i.prepayType,
    estimatedCashToClose: Math.round(downPayment + pointsCost + closingCosts),
    propertyType: i.propertyType,
    rentType: i.rentType,
    state: i.state,
    entity: i.entity,
  };
}

// ---------------------------------------------------------------------------
// MAIN ENGINE ORCHESTRATOR
// ---------------------------------------------------------------------------

export function runEngine(i: DealInputs): DscrReport {
  // Validate inputs FIRST — surface issues instead of computing on NaN.
  const validation = validateDealInputs(i);

  // Even if invalid, we still run the engine — but downstream consumers can
  // surface the validation issues. The math utilities propagate NaN/Infinity
  // instead of masking, so calculations will produce NaN where appropriate.
  const lenderVerdict = buildLenderVerdict(i);
  const investorVerdict = buildInvestorVerdict(i);
  const stressScenarios = buildStressScenarios(i);
  const dataQuality = calculateDataQuality(i);

  const scores = calculateScores({
    inputs: i,
    lenderPass: lenderVerdict.pass,
    lenderDscr: lenderVerdict.lenderDscr,
    dscrRequired: lenderVerdict.matrix.dscrRequired,
    investorDscr: investorVerdict.result.investorDscr,
    monthlyCashFlow: investorVerdict.result.monthlyCashFlow,
    liquidityRunway: investorVerdict.result.liquidityRunwayMonths,
    ltvActual: lenderVerdict.matrix.ltvActual,
    maxLtvAllowed: lenderVerdict.matrix.maxLtvAllowed,
    reserveMonths: i.reservesMonths,
    reserveRequiredMonths: lenderVerdict.matrix.reserveRequiredMonths,
    stressScenarios,
    dataScore: dataQuality.score,
    postRecastDscr: lenderVerdict.matrix.postRecastDscr,
  });

  const truthMatrix = buildTruthMatrix(lenderVerdict.pass, investorVerdict.survives);
  const action = buildAction({
    inputs: i,
    truthMatrix,
    lenderVerdict,
    investorVerdict,
    scores,
  });
  const dealSnapshot = buildDealSnapshot(i);

  return {
    inputs: i,
    truthMatrix,
    lenderVerdict,
    investorVerdict,
    stressScenarios,
    dataQuality,
    scores,
    action,
    dealSnapshot,
    generatedAt: '', // Set by UI layer to avoid SSR hydration mismatch from new Date()
    validation,
  };
}

// ---------------------------------------------------------------------------
// Display helpers (re-exported for UI)
// ---------------------------------------------------------------------------

export { round, ratio, INFINITE_RUNWAY };
