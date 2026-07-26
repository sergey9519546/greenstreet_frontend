import type { DealInputs, DscrReport, TruthMatrix, FourScores, LenderVerdict, InvestorVerdict } from './types';
import { runEngine, buildTruthMatrix, calculateScores } from './scoring';
import { buildLenderVerdict } from './lender';
import { buildInvestorVerdict } from './investor';
import { buildStressScenarios } from './stress';
import { calculateDataQuality } from './fraud';

// ============================================================================
// RESTRUCTURE SIMULATOR
// ============================================================================
// Auto-applies suggested fixes (one at a time OR in combination) and shows
// what the new verdict would be. Lets the user see "what would it take to
// make this deal work" before negotiating with seller/lender.
// ============================================================================

export interface RestructureOption {
  id: string;
  label: string;
  description: string;
  // Apply the restructure to a copy of inputs
  apply: (inputs: DealInputs) => DealInputs;
  // Estimated difficulty of executing this restructure in the real world
  difficulty: 'easy' | 'moderate' | 'hard' | 'infeasible';
  // Counterparty whose approval is required
  counterparty: 'seller' | 'lender' | 'borrower' | 'insurer' | 'county' | 'multiple';
}

export const RESTRUCTURE_OPTIONS: RestructureOption[] = [
  {
    id: 'lower_ltv_5',
    label: 'Lower LTV by 5% (add down payment)',
    description: 'Add cash to bring LTV from current to −5%. Reduces debt service, lifts both DSCRs.',
    apply: (i) => {
      const valueBase = i.appraisedValue || i.purchasePrice;
      const newLtv = Math.max(50, (i.loanAmount / valueBase * 100) - 5);
      return { ...i, loanAmount: (newLtv / 100) * valueBase };
    },
    difficulty: 'moderate',
    counterparty: 'borrower',
  },
  {
    id: 'lower_ltv_10',
    label: 'Lower LTV by 10% (add down payment)',
    description: 'Add more cash to bring LTV from current to −10%. Stronger DSCR lift but more cash required.',
    apply: (i) => {
      const valueBase = i.appraisedValue || i.purchasePrice;
      const newLtv = Math.max(50, (i.loanAmount / valueBase * 100) - 10);
      return { ...i, loanAmount: (newLtv / 100) * valueBase };
    },
    difficulty: 'hard',
    counterparty: 'borrower',
  },
  {
    id: 'reduce_price_5',
    label: 'Negotiate price down 5%',
    description: 'Seller concedes 5% on price. Lowers purchase price, loan amount, and down payment simultaneously.',
    apply: (i) => {
      const newPrice = i.purchasePrice * 0.95;
      const ltvRatio = i.purchasePrice > 0 ? i.loanAmount / i.purchasePrice : 0;
      return {
        ...i,
        purchasePrice: newPrice,
        appraisedValue: Math.min(i.appraisedValue, newPrice),
        loanAmount: newPrice * ltvRatio,
      };
    },
    difficulty: 'moderate',
    counterparty: 'seller',
  },
  {
    id: 'reduce_price_10',
    label: 'Negotiate price down 10%',
    description: 'Seller concedes 10% on price. Significant — usually requires appraisal gap or market weakness.',
    apply: (i) => {
      const newPrice = i.purchasePrice * 0.90;
      const ltvRatio = i.purchasePrice > 0 ? i.loanAmount / i.purchasePrice : 0;
      return {
        ...i,
        purchasePrice: newPrice,
        appraisedValue: Math.min(i.appraisedValue, newPrice),
        loanAmount: newPrice * ltvRatio,
      };
    },
    difficulty: 'hard',
    counterparty: 'seller',
  },
  {
    id: 'rate_buydown_50',
    label: 'Buy down rate 50 bps',
    description: 'Pay ~1 point upfront to reduce rate 50 bps. Lowers monthly payment, lifts DSCR.',
    apply: (i) => ({ ...i, rate: Math.max(0, i.rate - 0.5), points: i.points + 1 }),
    difficulty: 'easy',
    counterparty: 'lender',
  },
  {
    id: 'rate_buydown_100',
    label: 'Buy down rate 100 bps',
    description: 'Pay ~2 points upfront to reduce rate 100 bps. Larger DSCR lift but more upfront cost.',
    apply: (i) => ({ ...i, rate: Math.max(0, i.rate - 1.0), points: i.points + 2 }),
    difficulty: 'moderate',
    counterparty: 'lender',
  },
  {
    id: 'verify_lease_deposit',
    label: 'Verify lease deposit',
    description: 'Pull bank statements confirming lease deposit was received. Clears fraud flag.',
    apply: (i) => ({ ...i, leaseDepositVerified: true }),
    difficulty: 'easy',
    counterparty: 'borrower',
  },
  {
    id: 'bindable_insurance',
    label: 'Obtain bindable insurance',
    description: 'Replace placeholder quote with bindable policy. Clears documentation condition.',
    apply: (i) => ({ ...i, insuranceQuotedBindable: true }),
    difficulty: 'easy',
    counterparty: 'insurer',
  },
  {
    id: 'estimate_tax_reassessment',
    label: 'Estimate tax reassessment',
    description: 'Model post-sale tax reassessment with county. Removes hidden tax shock risk.',
    apply: (i) => ({ ...i, taxReassessmentEstimated: true }),
    difficulty: 'easy',
    counterparty: 'county',
  },
  {
    id: 'add_reserves_3mo',
    label: 'Add 3 months PITIA reserves',
    description: 'Borrower brings additional cash to bring reserves from current to +3 months.',
    apply: (i) => ({ ...i, reservesMonths: i.reservesMonths + 3 }),
    difficulty: 'moderate',
    counterparty: 'borrower',
  },
  {
    id: 'remove_io',
    label: 'Remove interest-only period',
    description: 'Switch from IO to full amortizing payment. Avoids payment cliff at recast.',
    apply: (i) => ({ ...i, interestOnlyMonths: 0, structure: 'FIXED_30' }),
    difficulty: 'easy',
    counterparty: 'lender',
  },
  {
    id: 'switch_to_30yr',
    label: 'Switch to 30-yr amortization',
    description: 'If currently 15-yr, switch to 30-yr to lower monthly payment. More interest paid over life.',
    apply: (i) => ({ ...i, amortMonths: 360, termMonths: 360, structure: 'FIXED_30' }),
    difficulty: 'easy',
    counterparty: 'lender',
  },
  {
    id: 'switch_to_40yr',
    label: 'Switch to 40-yr amortization',
    description: 'Extend amortization to 40 years. Lowest monthly payment but slowest equity build.',
    apply: (i) => ({ ...i, amortMonths: 480, termMonths: 360, structure: 'FIXED_40' }),
    difficulty: 'moderate',
    counterparty: 'lender',
  },
  {
    id: 'increase_reserves_to_9',
    label: 'Increase reserves to 9 months',
    description: 'Borrower brings reserves up to 9 months PITIA (most non-QM DSCR sweet spot).',
    apply: (i) => ({ ...i, reservesMonths: Math.max(i.reservesMonths, 9) }),
    difficulty: 'moderate',
    counterparty: 'borrower',
  },
  {
    id: 'increase_rent_5',
    label: 'Raise rent 5% (with verified lease)',
    description: 'Negotiate new lease at 5% higher rent. Requires market support and tenant turnover.',
    apply: (i) => ({
      ...i,
      borrowerRentClaim: i.borrowerRentClaim * 1.05,
      appraiserRent: i.appraiserRent * 1.05,
      leaseRent: i.leaseRent * 1.05,
      leaseVerified: true,
      leaseDepositVerified: true,
    }),
    difficulty: 'hard',
    counterparty: 'borrower',
  },
];

export interface RestructureResult {
  option: RestructureOption;
  restructuredInputs: DealInputs;
  truthMatrix: TruthMatrix;
  scores: FourScores;
  lenderVerdict: LenderVerdict;
  investorVerdict: InvestorVerdict;
  // Quick deltas from baseline
  deltaLenderDscr: number;
  deltaInvestorDscr: number;
  deltaMonthlyCashFlow: number;
  deltaLenderScore: number;
  deltaInvestorScore: number;
  deltaDataScore: number;
  deltaCashToClose: number;
}

/**
 * Apply a single restructure option and compute the new verdict.
 */
export function simulateRestructure(
  baseline: DscrReport,
  option: RestructureOption
): RestructureResult {
  const restructuredInputs = option.apply(baseline.inputs);

  // Recompute the full engine
  const lenderVerdict = buildLenderVerdict(restructuredInputs);
  const investorVerdict = buildInvestorVerdict(restructuredInputs);
  const stressScenarios = buildStressScenarios(restructuredInputs);
  const dataQuality = calculateDataQuality(restructuredInputs);

  const scores = calculateScores({
    inputs: restructuredInputs,
    lenderPass: lenderVerdict.pass,
    lenderDscr: lenderVerdict.lenderDscr,
    dscrRequired: lenderVerdict.matrix.dscrRequired,
    investorDscr: investorVerdict.result.investorDscr,
    monthlyCashFlow: investorVerdict.result.monthlyCashFlow,
    liquidityRunway: investorVerdict.result.liquidityRunwayMonths,
    ltvActual: lenderVerdict.matrix.ltvActual,
    maxLtvAllowed: lenderVerdict.matrix.maxLtvAllowed,
    reserveMonths: restructuredInputs.reservesMonths,
    reserveRequiredMonths: lenderVerdict.matrix.reserveRequiredMonths,
    stressScenarios,
    dataScore: dataQuality.score,
    postRecastDscr: lenderVerdict.matrix.postRecastDscr,
  });

  const truthMatrix = buildTruthMatrix(lenderVerdict.pass, investorVerdict.survives);

  return {
    option,
    restructuredInputs,
    truthMatrix,
    scores,
    lenderVerdict,
    investorVerdict,
    deltaLenderDscr: lenderVerdict.lenderDscr - baseline.lenderVerdict.lenderDscr,
    deltaInvestorDscr: investorVerdict.result.investorDscr - baseline.investorVerdict.result.investorDscr,
    deltaMonthlyCashFlow: investorVerdict.result.monthlyCashFlow - baseline.investorVerdict.result.monthlyCashFlow,
    deltaLenderScore: scores.lenderQualification - baseline.scores.lenderQualification,
    deltaInvestorScore: scores.investorSurvival - baseline.scores.investorSurvival,
    deltaDataScore: scores.dataConfidence - baseline.scores.dataConfidence,
    deltaCashToClose: lenderVerdict.matrix.cashToClose - baseline.lenderVerdict.matrix.cashToClose,
  };
}

/**
 * Apply multiple restructure options in sequence (combination scenario).
 */
export function simulateCombinedRestructure(
  baseline: DscrReport,
  options: RestructureOption[]
): RestructureResult {
  // Combine all options into a single transformation
  const combinedOption: RestructureOption = {
    id: 'combined',
    label: `Combined: ${options.length} fixes`,
    description: options.map((o) => o.label).join(' + '),
    apply: (inputs) => options.reduce((acc, opt) => opt.apply(acc), inputs),
    difficulty: options.some((o) => o.difficulty === 'hard') ? 'hard' : 'moderate',
    counterparty: 'multiple',
  };
  return simulateRestructure(baseline, combinedOption);
}

/**
 * Quick helper: returns the option that maximally improves investor survival
 * without making lender pass false.
 */
export function findBestSingleRestructure(
  baseline: DscrReport
): RestructureResult | null {
  let best: RestructureResult | null = null;
  let bestScore = -Infinity;

  for (const option of RESTRUCTURE_OPTIONS) {
    const result = simulateRestructure(baseline, option);
    // Score: prefer deals that improve investor survival AND keep lender pass
    const compositeScore =
      (result.investorVerdict.survives ? 100 : 0) +
      result.scores.investorSurvival +
      result.scores.lenderQualification * 0.5 -
      (option.difficulty === 'hard' ? 10 : option.difficulty === 'moderate' ? 5 : 0);

    if (compositeScore > bestScore) {
      bestScore = compositeScore;
      best = result;
    }
  }

  return best;
}
