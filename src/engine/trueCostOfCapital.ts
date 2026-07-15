// ============================================================
// TRUE COST OF CAPITAL (over the hold period)
// ============================================================
// Behavioral finance (INNOVATION_BEHAVIORAL_FINANCE §6): present bias makes
// investors pick the lowest *rate*, ignoring fees, points, and prepay penalties.
// A 7.5% loan with a 2-1-1 prepay + $8k fees can cost MORE over a 3-5yr hold
// than a 7.875% no-prepay loan. Lead with the all-in $ cost, not the rate.
//
// Reuses the existing amortization + prepay engine (calculatePI,
// computeRemainingBalance, computePrepaySchedule) — no new amortization math.

import { calculatePI } from './engine';
import { computeRemainingBalance, computePrepaySchedule } from './loanOptimizer';
import type { PrepayType } from './types';

export interface LoanCostQuote {
  label: string;
  rate: number;       // annual % (note rate)
  points: number;     // % of loan amount, paid upfront
  fees: number;       // flat $ closing costs
  prepayType: PrepayType;
}

export interface TrueCostResult {
  label: string;
  rate: number;
  holdYears: number;
  monthlyPI: number;
  interestPaid: number;     // P&I paid − principal paid down, over the hold
  principalPaidDown: number;
  upfront: number;          // points + fees
  prepayPenalty: number;    // penalty if exiting at holdYears
  /** All-in cost of the financing over the hold (the number to compare). */
  totalCost: number;
}

function prepayPenaltyAtYear(
  loanAmount: number, rate: number, termYears: number, prepayType: PrepayType, holdYears: number,
): number {
  const s = computePrepaySchedule(loanAmount, rate, termYears, prepayType, false, 0);
  // A penalty step changes after each completed year. A 6-month exit is year 1;
  // a 13-month exit is year 2. Rounding assigned fractional holds to the wrong step.
  const y = Math.max(1, Math.min(6, Math.ceil(holdYears)));
  switch (y) {
    case 1: return s.year1;
    case 2: return s.year2;
    case 3: return s.year3;
    case 4: return s.year4;
    case 5: return s.year5;
    default: return s.year6Plus;
  }
}

/** All-in financing cost of one loan over a hold period. */
export function computeTrueCost(
  loanAmount: number,
  quote: LoanCostQuote,
  holdYears: number,
  termYears: number = 30,
): TrueCostResult {
  const values = [loanAmount, quote.rate, quote.points, quote.fees, holdYears, termYears];
  if (values.some(value => !Number.isFinite(value))) {
    throw new RangeError('Loan, quote, hold, and term inputs must be finite numbers.');
  }
  if (loanAmount <= 0 || holdYears <= 0 || termYears <= 0 || holdYears > termYears) {
    throw new RangeError('Loan amount, hold, and term must be positive, with hold no longer than term.');
  }
  if (quote.rate < 0 || quote.points < 0 || quote.fees < 0) {
    throw new RangeError('Rate, points, and fees cannot be negative.');
  }

  const termMonths = termYears * 12;
  const holdMonths = Math.round(holdYears * 12);
  if (holdMonths < 1) {
    throw new RangeError('Hold period must be at least one month.');
  }
  const monthlyPI = calculatePI(loanAmount, quote.rate, termMonths);
  const remaining = computeRemainingBalance(loanAmount, quote.rate, termMonths, holdMonths);
  const principalPaidDown = Math.max(0, loanAmount - remaining);
  const totalPaid = monthlyPI * holdMonths;
  const interestPaid = Math.max(0, totalPaid - principalPaidDown);
  const upfront = loanAmount * (quote.points / 100) + quote.fees;
  const prepayPenalty = prepayPenaltyAtYear(loanAmount, quote.rate, termYears, quote.prepayType, holdYears);
  const totalCost = interestPaid + upfront + prepayPenalty;

  return {
    label: quote.label,
    rate: quote.rate,
    holdYears,
    monthlyPI: Math.round(monthlyPI),
    interestPaid: Math.round(interestPaid),
    principalPaidDown: Math.round(principalPaidDown),
    upfront: Math.round(upfront),
    prepayPenalty: Math.round(prepayPenalty),
    totalCost: Math.round(totalCost),
  };
}

export interface TrueCostComparison {
  ranked: TrueCostResult[];        // cheapest total cost first
  cheapest: TrueCostResult;
  /** $ the cheapest saves vs the lowest-rate option (the rate-myopia trap). */
  savingsVsLowestRate: number;
  lowestRateLabel: string;
}

/**
 * Rank loans by all-in cost over the hold — the choice-architecture default
 * sort (Behavioral §2). Surfaces "you'd pay $X more for the lower rate".
 */
export function compareTrueCost(
  loanAmount: number,
  quotes: LoanCostQuote[],
  holdYears: number,
  termYears: number = 30,
): TrueCostComparison {
  if (quotes.length === 0) {
    throw new RangeError('At least one valid loan quote is required for comparison.');
  }
  const results = quotes.map((q) => computeTrueCost(loanAmount, q, holdYears, termYears));
  const ranked = [...results].sort((a, b) => a.totalCost - b.totalCost);
  const cheapest = ranked[0];
  const lowestRate = [...results].sort((a, b) => a.rate - b.rate)[0];
  return {
    ranked,
    cheapest,
    savingsVsLowestRate: Math.round(lowestRate.totalCost - cheapest.totalCost),
    lowestRateLabel: lowestRate.label,
  };
}
