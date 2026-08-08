// ============================================================
// DSCR Deal Engine v11.7 — Refi & Seasoning Tracker
// Institutional-grade readiness scoring (4-factor composite, 0-100)
// ============================================================

import type {
  PropertyInputs,
  BorrowerProfile,
  RefiAnalysis,
  RefiReadinessFactor,
} from './types';
import { estimateRate, calculatePI } from './engine';
import {
  buildAmortizationSchedule,
  computeRefiBreakEven,
  payoffQuote,
  DEFAULT_HOLD_PERIODS_MONTHS,
  type AmortizationSchedule,
  type PayoffQuote,
  type RefiBreakEvenResult,
} from './amortization';
import { computeRefiProceedsGap } from './refiProceeds';

// v11.7 institutional constants
const CASH_OUT_LTV = 70;          // DSCR cash-out LTV cap (industry std; rate-term uses 75)
const SEASONING_REQUIRED_MONTHS = 6;
const RATE_TERM_LTV = 75;

export function analyzeRefi(
  property: PropertyInputs,
  borrower: BorrowerProfile,
  currentLoan: { balance: number; rate: number; monthlyPayment: number },
  monthsOwned: number,
  projectedAppreciation: number,
  projectedRateEnvironment: number
): RefiAnalysis {
  // Current DSCR (Track 1 — no vacancy)
  const currentPITIA = currentLoan.monthlyPayment + property.annualTaxes / 12 + property.annualInsurance / 12 + property.hoa + property.floodInsurance;
  const qualifyingRent = Math.min(property.leaseRent, property.marketRent);
  const currentDSCR = currentPITIA > 0 ? qualifyingRent / currentPITIA : 0;

  // Projected refi (projectedAppreciation is a percent, e.g. 5 → +5%)
  const appreciatedValue = property.purchasePrice * (1 + projectedAppreciation / 100);
  const refiLTV = 75;
  const refiLoanAmount = appreciatedValue * (refiLTV / 100);

  const isCashOut = refiLoanAmount > currentLoan.balance;
  const actualRefiAmount = Math.min(refiLoanAmount, currentLoan.balance * 1.05);

  const refiRate = estimateRate(
    borrower,
    {
      ltv: refiLTV,
      term: '30_YR',
      ioPeriod: 'NONE',
      armType: 'FIXED',
      prepayPreference: '321',
      purpose: isCashOut ? 'CASH_OUT' : 'RATE_TERM',
      expectedHoldYears: 5,
      points: 0,
      lenderFees: 0,
      brokerFees: 0,
      rateLockCost: 0,
    },
    currentDSCR,
    property.propertyType,
    property.isDecliningMarket ?? false,
  );

  // Adjust rate for projected rate environment
  const adjustedRefiRate = refiRate + (projectedRateEnvironment - 6.125) * 0.5;

  const refiPayment = calculatePI(actualRefiAmount, adjustedRefiRate, 360);

  const projectedRefiDSCR = qualifyingRent / (refiPayment + property.annualTaxes / 12 + property.annualInsurance / 12 + property.hoa + property.floodInsurance);
  const monthlySavings = currentLoan.monthlyPayment - refiPayment;

  const refiClosingCosts = actualRefiAmount * 0.025;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(refiClosingCosts / monthlySavings) : 999;

  const seasoningMonthsRequired = SEASONING_REQUIRED_MONTHS;
  const delayedFinancingAvailable = monthsOwned >= 0;

  const appreciationNeeded = currentLoan.balance <= property.purchasePrice * (RATE_TERM_LTV / 100)
    ? 0
    : ((currentLoan.balance / (RATE_TERM_LTV / 100)) - property.purchasePrice) / property.purchasePrice;

  // ── v11.7: Refi Tracker Enhancements ─────────────────────────────
  // 1) Cash-out capacity at 70% LTV (more conservative than 75% rate-term LTV)
  const cashOutMaxAmount = Math.max(0, appreciatedValue * (CASH_OUT_LTV / 100) - currentLoan.balance);

  // 2) Seasoning status
  const seasoningMet = monthsOwned >= SEASONING_REQUIRED_MONTHS;
  const seasoningMonthsRemaining = Math.max(0, SEASONING_REQUIRED_MONTHS - monthsOwned);

  // 3) Refi type classification
  const rawMonthlySavings = monthlySavings;  // preserve pre-clamp value for scoring
  let refiType: 'RATE_TERM' | 'CASH_OUT' | 'NO_REFI';
  if (rawMonthlySavings <= 0 && cashOutMaxAmount <= 0) {
    refiType = 'NO_REFI';
  } else if (isCashOut && cashOutMaxAmount > 0) {
    refiType = 'CASH_OUT';
  } else {
    refiType = 'RATE_TERM';
  }

  // 4) Four-factor readiness scoring (max 100)
  // Factor A: Seasoning (max 25)
  const seasoningScore: RefiReadinessFactor = (() => {
    if (monthsOwned >= SEASONING_REQUIRED_MONTHS) {
      return {
        factor: 'Seasoning',
        score: 25, maxScore: 25, status: 'PASS',
        detail: `${monthsOwned} months owned — meets ${SEASONING_REQUIRED_MONTHS}-month DSCR seasoning requirement.`,
      };
    } else if (monthsOwned > 0) {
      return {
        factor: 'Seasoning',
        score: 15, maxScore: 25, status: 'WARN',
        detail: `${monthsOwned} months owned — needs ${seasoningMonthsRemaining} more month(s) to meet ${SEASONING_REQUIRED_MONTHS}-month seasoning.`,
      };
    }
    return {
      factor: 'Seasoning',
      score: 0, maxScore: 25, status: 'FAIL',
      detail: 'Property not yet closed — no seasoning established.',
    };
  })();

  // Factor B: Equity (max 25) — based on appreciationNeeded
  const equityScore: RefiReadinessFactor = (() => {
    const needed = Math.max(0, appreciationNeeded);
    if (needed === 0) {
      return {
        factor: 'Equity',
        score: 25, maxScore: 25, status: 'PASS',
        detail: `Current LTV supports refi at ${RATE_TERM_LTV}% — no appreciation required.`,
      };
    } else if (needed < 0.05) {
      return {
        factor: 'Equity',
        score: 15, maxScore: 25, status: 'WARN',
        detail: `Needs ${(needed * 100).toFixed(1)}% appreciation to reach ${RATE_TERM_LTV}% LTV threshold.`,
      };
    }
    return {
      factor: 'Equity',
      score: 0, maxScore: 25, status: 'FAIL',
      detail: `Needs ${(needed * 100).toFixed(1)}% appreciation — refi not viable today.`,
    };
  })();

  // Factor C: Rate incentive (max 25) — based on rawMonthlySavings
  const rateScore: RefiReadinessFactor = (() => {
    if (rawMonthlySavings > 0) {
      // Scale: >$200/mo savings = full 25; >$50 = 20; >0 = 15
      const scaled = rawMonthlySavings >= 200 ? 25 : rawMonthlySavings >= 50 ? 20 : 15;
      return {
        factor: 'Rate Incentive',
        score: scaled, maxScore: 25, status: 'PASS',
        detail: `Projected refi saves $${rawMonthlySavings.toFixed(0)}/mo — ${breakEvenMonths}mo break-even on $${refiClosingCosts.toFixed(0)} closing costs.`,
      };
    } else if (rawMonthlySavings === 0) {
      return {
        factor: 'Rate Incentive',
        score: 10, maxScore: 25, status: 'WARN',
        detail: 'Rate-neutral refi — only justified for cash-out or term extension.',
      };
    }
    return {
      factor: 'Rate Incentive',
      score: 0, maxScore: 25, status: 'FAIL',
      detail: `Refi would increase payment by $${Math.abs(rawMonthlySavings).toFixed(0)}/mo — not viable for rate-term.`,
    };
  })();

  // Factor D: DSCR headroom (max 25) — based on projectedRefiDSCR
  const dscrScore: RefiReadinessFactor = (() => {
    if (projectedRefiDSCR >= 1.25) {
      return {
        factor: 'DSCR Headroom',
        score: 25, maxScore: 25, status: 'PASS',
        detail: `Projected refi DSCR ${projectedRefiDSCR.toFixed(3)} — strong qualifying buffer (≥1.25).`,
      };
    } else if (projectedRefiDSCR >= 1.0) {
      return {
        factor: 'DSCR Headroom',
        score: 15, maxScore: 25, status: 'WARN',
        detail: `Projected refi DSCR ${projectedRefiDSCR.toFixed(3)} — marginal qualifying buffer (1.00–1.25).`,
      };
    }
    return {
      factor: 'DSCR Headroom',
      score: 0, maxScore: 25, status: 'FAIL',
      detail: `Projected refi DSCR ${projectedRefiDSCR.toFixed(3)} — below 1.00 qualifying threshold.`,
    };
  })();

  const readinessFactors: RefiReadinessFactor[] = [
    seasoningScore, equityScore, rateScore, dscrScore,
  ];
  const refiReadinessScore = readinessFactors.reduce((sum, f) => sum + f.score, 0);
  // ── end v11.7 enhancements ────────────────────────────────────────

  return {
    currentDSCR,
    projectedRefiDSCR,
    seasoningMonthsRequired,
    delayedFinancingAvailable,
    projectedRefiRate: adjustedRefiRate,
    projectedRefiPayment: refiPayment,
    monthlySavings: Math.max(0, monthlySavings),
    breakEvenMonths,
    appreciationNeeded: Math.max(0, appreciationNeeded),
    // v11.7 fields
    refiType,
    seasoningMet,
    seasoningMonthsRemaining,
    cashOutMaxAmount,
    refiReadinessScore,
    readinessFactors,
  };
}

// ============================================================
// SCHEDULE-BASED REFINANCE EVALUATION (fail-closed)
// ============================================================
//
// `analyzeRefi` above scores READINESS from a remembered balance. It cannot
// answer the only question that actually matters at the closing table: does the
// new loan raise enough money to retire the old one?
//
// `evaluateRefinance` does, and it fails CLOSED. It builds the current loan's
// real amortization schedule, takes the payoff from that schedule at the chosen
// month (balance + prepayment penalty + payoff fees), sizes the new loan under
// BOTH the LTV cap and the DSCR floor, and refuses to produce a recommendation
// when the proceeds fall short of payoff + costs. A refinance that cannot
// retire the existing lien is not a cheaper loan; it is a cash call.
//
// Break-even is then measured against BOTH schedules over a range of hold
// periods — total cost, meaning payments made plus the balance still owed —
// rather than the closing-costs ÷ payment-saving shortcut, which silently
// ignores that a new 30-year term restarts amortization.

export type RefiDecision = 'PROCEED' | 'CONDITIONAL' | 'REFUSED';

export type RefiRefusalCode =
  | 'INVALID_INPUTS'
  | 'PROCEEDS_BELOW_PAYOFF'
  | 'PROCEEDS_BELOW_PAYOFF_PLUS_COSTS'
  | 'DSCR_BELOW_FLOOR';

export interface RefiRefusal {
  code: RefiRefusalCode;
  message: string;
  /** Cash the borrower would have to bring for the refusal to clear, if any. */
  shortfall: number;
}

export interface CurrentLoanTerms {
  /** Original note amount. */
  originalAmount: number;
  annualRatePct: number;
  /** Total term in months, including any interest-only period. */
  termMonths: number;
  ioMonths?: number;
  /** Payments already made. The refinance closes at the end of this month. */
  monthsElapsed: number;
  /** Prepayment penalty as a percent of the payoff balance. */
  prepaymentPenaltyPct?: number;
  /** Demand, recording and statement fees charged by the existing lender. */
  payoffFees?: number;
}

export interface ProposedLoanTerms {
  annualRatePct: number;
  termMonths: number;
  ioMonths?: number;
  /**
   * Requested loan amount. Omit to size the loan to exactly cover payoff plus
   * its own closing costs.
   */
  requestedAmount?: number;
  /** Origination points as a percent of the new loan amount. */
  pointsPct?: number;
  lenderFees?: number;
  /** Title, appraisal, recording — third-party costs. */
  thirdPartyFees?: number;
  /** Prepaid interest and escrow deposits funded at close. */
  prepaidsAndEscrows?: number;
  /** Roll closing costs into the new loan. Default true. */
  financeClosingCosts?: boolean;
}

export interface RefiPropertySnapshot {
  /** Current appraised value at refinance. */
  value: number;
  /** Monthly qualifying rent — lesser of lease and market. */
  qualifyingRent: number;
  /** Taxes + insurance + HOA + flood, monthly. */
  monthlyEscrows: number;
}

export interface RefiPolicy {
  /** Rate-term LTV cap. Default 75. */
  maxLtvPct?: number;
  /** Qualifying DSCR floor. Default 1.00. */
  minDscr?: number;
  /** Seasoning required before a DSCR refinance. Default 6 months. */
  seasoningMonthsRequired?: number;
  holdPeriodsMonths?: number[];
}

export interface RefinanceEvaluationInput {
  current: CurrentLoanTerms;
  proposed: ProposedLoanTerms;
  property: RefiPropertySnapshot;
  policy?: RefiPolicy;
}

export interface RefiClosingCosts {
  points: number;
  lenderFees: number;
  thirdPartyFees: number;
  prepaidsAndEscrows: number;
  total: number;
  financed: boolean;
}

export interface RefiSizing {
  maxLoanByLtv: number;
  maxLoanByDscr: number;
  maxNewLoan: number;
  bindingConstraint: 'LTV' | 'DSCR' | 'NONE';
  /** Smallest loan that retires the payoff AND funds its own closing costs. */
  requiredProceeds: number;
  requestedAmount: number | null;
  /** What the loan would actually fund at, after both caps. */
  fundedAmount: number;
  /** fundedAmount − payoff − closing costs. Negative = cash to close. */
  netCashToBorrower: number;
  /** max(0, requiredProceeds − maxNewLoan). */
  proceedsShortfall: number;
  ltvAtFunded: number;
}

export interface RefinanceEvaluation {
  decision: RefiDecision;
  refusals: RefiRefusal[];
  /** The existing loan, month by month. */
  currentSchedule: AmortizationSchedule;
  /** The replacement loan. `null` whenever the evaluation was refused. */
  proposedSchedule: AmortizationSchedule | null;
  payoff: PayoffQuote;
  closingCosts: RefiClosingCosts;
  sizing: RefiSizing;
  /** `null` whenever the evaluation was refused — no recommendation is produced. */
  breakEven: RefiBreakEvenResult | null;
  currentPayment: number;
  proposedPayment: number;
  monthlyPaymentDelta: number;
  currentDscr: number;
  proposedDscr: number;
  seasoningMet: boolean;
  seasoningMonthsRemaining: number;
  summary: string;
}

const DEFAULT_MAX_LTV = 75;
const DEFAULT_MIN_DSCR = 1.0;

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

/** Build the existing loan's schedule from its note terms. */
export function buildCurrentLoanSchedule(current: CurrentLoanTerms): AmortizationSchedule {
  return buildAmortizationSchedule({
    principal: current.originalAmount,
    annualRatePct: current.annualRatePct,
    termMonths: current.termMonths,
    ioMonths: current.ioMonths ?? 0,
  });
}

export function evaluateRefinance(input: RefinanceEvaluationInput): RefinanceEvaluation {
  const { current, proposed, property } = input;
  const policy = input.policy ?? {};
  const maxLtvPct = policy.maxLtvPct ?? DEFAULT_MAX_LTV;
  const minDscr = policy.minDscr ?? DEFAULT_MIN_DSCR;
  const seasoningRequired = policy.seasoningMonthsRequired ?? SEASONING_REQUIRED_MONTHS;

  const currentSchedule = buildCurrentLoanSchedule(current);

  const monthsElapsed = Math.max(0, Math.round(current.monthsElapsed) || 0);
  const payoff = payoffQuote({
    schedule: currentSchedule,
    month: monthsElapsed,
    prepaymentPenaltyPct: current.prepaymentPenaltyPct,
    payoffFees: current.payoffFees,
  });

  // ── Cost structure. Points are a percent of the NEW loan, so sizing a loan to
  // cover its own costs is a fixed point: L = (payoff + fixedCosts) / (1 - pts).
  const pointsPct = Math.min(Math.max(Number(proposed.pointsPct ?? 0) || 0, 0), 10);
  const lenderFees = Math.max(0, Number(proposed.lenderFees ?? 0) || 0);
  const thirdPartyFees = Math.max(0, Number(proposed.thirdPartyFees ?? 0) || 0);
  const prepaidsAndEscrows = Math.max(0, Number(proposed.prepaidsAndEscrows ?? 0) || 0);
  const fixedCosts = lenderFees + thirdPartyFees + prepaidsAndEscrows;
  const financeClosingCosts = proposed.financeClosingCosts ?? true;

  const selfFundingAmount = (payoff.totalPayoff + fixedCosts) / (1 - pointsPct / 100);
  const requiredProceeds = financeClosingCosts ? selfFundingAmount : payoff.totalPayoff;

  // ── Sizing caps. Both apply; the lower one is the real ceiling.
  const gap = computeRefiProceedsGap({
    propertyValue: property.value,
    currentBalance: payoff.totalPayoff,
    qualifyingRent: property.qualifyingRent,
    escrowsMonthly: property.monthlyEscrows,
    newRate: proposed.annualRatePct,
    maxLtvPct,
    minDscr,
    termYears: Math.max(1, Math.round(proposed.termMonths / 12)),
  });

  const requestedAmount =
    proposed.requestedAmount !== undefined && Number.isFinite(proposed.requestedAmount)
      ? Math.max(0, Number(proposed.requestedAmount))
      : null;

  const targetAmount = requestedAmount ?? requiredProceeds;
  const fundedAmount = Math.min(targetAmount, gap.maxNewLoan);

  const points = fundedAmount * (pointsPct / 100);
  const closingCosts: RefiClosingCosts = {
    points,
    lenderFees,
    thirdPartyFees,
    prepaidsAndEscrows,
    total: points + fixedCosts,
    financed: financeClosingCosts,
  };

  // Financing the closing costs makes the LOAN bigger; it does not make the
  // costs disappear. Either way the borrower ends up with
  // funded - payoff - costs, which is what this field documents itself as.
  //
  // This used to subtract the costs only when they were financed, so a borrower
  // writing a cheque at the table was told they netted that cheque's full value
  // more than they actually did — overstated by exactly closingCosts.total
  // ($5,700 on the default scenario). It also disagreed with the figure fed to
  // the break-even below, which always subtracted them.
  const netCashToBorrower = fundedAmount - payoff.totalPayoff - closingCosts.total;

  const sizing: RefiSizing = {
    maxLoanByLtv: gap.maxLoanByLtv,
    maxLoanByDscr: gap.maxLoanByDscr,
    maxNewLoan: gap.maxNewLoan,
    bindingConstraint: gap.bindingConstraint,
    requiredProceeds,
    requestedAmount,
    fundedAmount,
    netCashToBorrower,
    proceedsShortfall: Math.max(0, requiredProceeds - fundedAmount),
    ltvAtFunded: property.value > 0 ? (fundedAmount / property.value) * 100 : 0,
  };

  // ── Fail closed. Every one of these is a reason NOT to publish a
  // recommendation, so none of them is downgraded to a warning.
  const refusals: RefiRefusal[] = [];

  const inputsValid =
    Number.isFinite(current.originalAmount) && current.originalAmount > 0 &&
    Number.isFinite(proposed.termMonths) && proposed.termMonths >= 1 &&
    Number.isFinite(property.value) && property.value > 0 &&
    Number.isFinite(property.qualifyingRent) && property.qualifyingRent >= 0;

  if (!inputsValid) {
    refusals.push({
      code: 'INVALID_INPUTS',
      message:
        'Loan amount, new term, property value and qualifying rent are all required before a refinance can be evaluated.',
      shortfall: 0,
    });
  }

  if (inputsValid && fundedAmount < payoff.totalPayoff - 0.5) {
    refusals.push({
      code: 'PROCEEDS_BELOW_PAYOFF',
      message:
        `The new loan tops out at ${usd(fundedAmount)} — ${usd(payoff.totalPayoff - fundedAmount)} short of the ` +
        `${usd(payoff.totalPayoff)} needed to retire the existing lien ` +
        `(${usd(payoff.principalBalance)} balance` +
        (payoff.prepaymentPenalty > 0 ? ` + ${usd(payoff.prepaymentPenalty)} prepayment penalty` : '') +
        (payoff.payoffFees > 0 ? ` + ${usd(payoff.payoffFees)} payoff fees` : '') +
        `). ${sizing.bindingConstraint === 'LTV' ? 'Value (LTV)' : 'Rent (DSCR)'} is the binding limit. ` +
        'No refinance is recommended: the proceeds cannot pay off the loan being replaced.',
      shortfall: payoff.totalPayoff - fundedAmount,
    });
  } else if (inputsValid && fundedAmount < requiredProceeds - 0.5) {
    refusals.push({
      code: 'PROCEEDS_BELOW_PAYOFF_PLUS_COSTS',
      message:
        `The new loan covers the ${usd(payoff.totalPayoff)} payoff but not its own ${usd(closingCosts.total)} of ` +
        `closing costs — ${usd(requiredProceeds - fundedAmount)} short. The borrower would bring that cash to close. ` +
        'No refinance is recommended until the gap is funded or the loan is re-sized.',
      shortfall: requiredProceeds - fundedAmount,
    });
  }

  // ── Proposed schedule + coverage. Only built when the deal can actually fund.
  const canBuildProposed = refusals.length === 0 && fundedAmount > 0;
  const proposedSchedule = canBuildProposed
    ? buildAmortizationSchedule({
        principal: fundedAmount,
        annualRatePct: proposed.annualRatePct,
        termMonths: Math.round(proposed.termMonths),
        ioMonths: proposed.ioMonths ?? 0,
      })
    : null;

  const currentPayment =
    monthsElapsed + 1 <= currentSchedule.rows.length
      ? currentSchedule.rows[monthsElapsed].payment
      : 0;
  const proposedPayment = proposedSchedule ? proposedSchedule.rows[0].payment : 0;

  const currentPitia = currentPayment + property.monthlyEscrows;
  const proposedPitia = proposedPayment + property.monthlyEscrows;
  const currentDscr = currentPitia > 0 ? property.qualifyingRent / currentPitia : 0;
  const proposedDscr = proposedPitia > 0 ? property.qualifyingRent / proposedPitia : 0;

  if (proposedSchedule && proposedDscr < minDscr - 1e-9) {
    refusals.push({
      code: 'DSCR_BELOW_FLOOR',
      message:
        `The new payment puts DSCR at ${proposedDscr.toFixed(3)}, below the ${minDscr.toFixed(2)} qualifying floor. ` +
        'No refinance is recommended at this loan amount.',
      shortfall: 0,
    });
  }

  const refused = refusals.length > 0;

  const breakEven =
    !refused && proposedSchedule
      ? computeRefiBreakEven({
          currentSchedule,
          proposedSchedule,
          refinanceAtMonth: monthsElapsed,
          // The same figure the sizing publishes. This was written as two
          // complementary ternaries that always summed to closingCosts.total,
          // so the branch was a no-op wearing the costume of a decision — and
          // it disagreed with `netCashToBorrower`, leaving the headline cash
          // number and the break-even month describing different deals.
          netCashAtClose: netCashToBorrower,
          holdPeriodsMonths: policy.holdPeriodsMonths ?? [...DEFAULT_HOLD_PERIODS_MONTHS],
        })
      : null;

  const seasoningMet = monthsElapsed >= seasoningRequired;
  const seasoningMonthsRemaining = Math.max(0, seasoningRequired - monthsElapsed);

  let decision: RefiDecision;
  if (refused) decision = 'REFUSED';
  else if (!seasoningMet || (breakEven?.neverRecovers ?? true)) decision = 'CONDITIONAL';
  else decision = 'PROCEED';

  const summary = (() => {
    if (refused) {
      return `Refinance not recommended — ${refusals.map((r) => r.message).join(' ')}`;
    }
    const be = breakEven?.breakEvenMonth ?? null;
    const parts: string[] = [];
    parts.push(
      `Payoff at month ${monthsElapsed} is ${usd(payoff.totalPayoff)}; the new loan funds at ${usd(fundedAmount)} ` +
        `(${sizing.bindingConstraint} binds at ${usd(sizing.maxNewLoan)}).`,
    );
    parts.push(
      netCashToBorrower >= 0
        ? `Net cash to the borrower at close: ${usd(netCashToBorrower)}.`
        : `Cash to close: ${usd(Math.abs(netCashToBorrower))}.`,
    );
    parts.push(
      be === null
        ? 'Total cost never favours the refinance inside the remaining term — hold the existing loan.'
        : `Refinancing is cheaper on total cost from month ${be} onward, so it pays only if the property is held past then.`,
    );
    if (!seasoningMet) {
      parts.push(`Seasoning is ${seasoningMonthsRemaining} month(s) short of the ${seasoningRequired}-month requirement.`);
    }
    return parts.join(' ');
  })();

  return {
    decision,
    refusals,
    currentSchedule,
    proposedSchedule,
    payoff,
    closingCosts,
    sizing,
    breakEven,
    currentPayment,
    proposedPayment,
    monthlyPaymentDelta: currentPayment - proposedPayment,
    currentDscr,
    proposedDscr,
    seasoningMet,
    seasoningMonthsRemaining,
    summary,
  };
}
