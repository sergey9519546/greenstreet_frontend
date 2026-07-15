// ============================================================
// DSCR Deal Engine v11.7 - Refi & Seasoning Tracker
// Scenario math only. Model limits below are input-safety bounds,
// not lender eligibility rules or representations of available terms.
// ============================================================

import type {
  PropertyInputs,
  BorrowerProfile,
  RefiAnalysis,
  RefiReadinessFactor,
} from './types';
import { calculatePI } from './engine';

const CASH_OUT_LTV = 70;
const RATE_TERM_LTV = 75;
const SEASONING_REQUIRED_MONTHS = 6;
const MAX_MODEL_RATE_PCT = 25;
const MIN_MODEL_APPRECIATION_PCT = -95;
const MAX_MODEL_APPRECIATION_PCT = 100;
const MAX_MODEL_OWNERSHIP_MONTHS = 1200;
const NO_BREAK_EVEN = 999;

export type RefiAnalysisStatus = 'AVAILABLE' | 'REVIEW';

export interface RefiAuxiliaryGuidanceState {
  secondLienAvailable: boolean;
  debtGuidanceAvailable: boolean;
  currentRateLabel: string | null;
  projectedRateLabel: string | null;
}

export function getRefiAuxiliaryGuidanceState(
  refiStatus: RefiAnalysisStatus | undefined,
  secondLienStatus: 'AVAILABLE' | 'REVIEW',
  currentRate: number,
  projectedRate: number,
  covenantDscr: number,
  inPlaceRent: number,
): RefiAuxiliaryGuidanceState {
  const primaryAvailable = refiStatus === 'AVAILABLE';
  const currentRateFinite = Number.isFinite(currentRate);
  const projectedRateFinite = Number.isFinite(projectedRate);
  const debtInputsValid = Number.isFinite(covenantDscr)
    && covenantDscr > 0
    && Number.isFinite(inPlaceRent)
    && inPlaceRent >= 0;

  return {
    secondLienAvailable: primaryAvailable && secondLienStatus === 'AVAILABLE' && currentRateFinite,
    debtGuidanceAvailable: primaryAvailable && projectedRateFinite && debtInputsValid,
    currentRateLabel: currentRateFinite ? `${currentRate.toFixed(2)}%` : null,
    projectedRateLabel: projectedRateFinite ? `${projectedRate.toFixed(2)}%` : null,
  };
}

export interface SafeRefiAnalysis extends RefiAnalysis {
  status: RefiAnalysisStatus;
  reviewReasons: string[];
}

const isFiniteNumber = (value: number): boolean => Number.isFinite(value);

function zeroFactor(factor: string, reason: string): RefiReadinessFactor {
  return {
    factor,
    score: 0,
    maxScore: 25,
    status: 'FAIL',
    detail: `Review required: ${reason}`,
  };
}

function unavailableAnalysis(reasons: string[]): SafeRefiAnalysis {
  const detail = reasons.join(' ');
  const readinessFactors = [
    zeroFactor('Seasoning', detail),
    zeroFactor('Equity', detail),
    zeroFactor('Rate Incentive', detail),
    zeroFactor('DSCR Headroom', detail),
  ];

  return {
    status: 'REVIEW',
    reviewReasons: reasons,
    currentDSCR: 0,
    projectedRefiDSCR: 0,
    seasoningMonthsRequired: SEASONING_REQUIRED_MONTHS,
    delayedFinancingAvailable: false,
    projectedRefiRate: 0,
    projectedRefiPayment: 0,
    monthlySavings: 0,
    breakEvenMonths: NO_BREAK_EVEN,
    appreciationNeeded: 0,
    refiType: 'NO_REFI',
    seasoningMet: false,
    seasoningMonthsRemaining: SEASONING_REQUIRED_MONTHS,
    cashOutMaxAmount: 0,
    refiReadinessScore: 0,
    readinessFactors,
  };
}

function safeMonthlyPayment(principal: number, annualRatePct: number): number {
  if (principal === 0) return 0;
  if (annualRatePct === 0) return principal / 360;
  const payment = calculatePI(principal, annualRatePct, 360);
  return Number.isFinite(payment) && payment >= 0 ? payment : Number.NaN;
}

export function analyzeRefi(
  property: PropertyInputs,
  borrower: BorrowerProfile,
  currentLoan: { balance: number; rate: number; monthlyPayment: number },
  monthsOwned: number,
  projectedAppreciation: number,
  projectedRateEnvironment: number
): SafeRefiAnalysis {
  // The user-entered replacement rate drives this scenario. Borrower data remains
  // in the signature for API compatibility but is not used to infer an approval.
  void borrower;

  const reasons: string[] = [];
  const requireFinite = (value: number, label: string) => {
    if (!isFiniteNumber(value)) reasons.push(`${label} must be a finite number.`);
  };
  const requireNonNegative = (value: number, label: string) => {
    requireFinite(value, label);
    if (isFiniteNumber(value) && value < 0) reasons.push(`${label} cannot be negative.`);
  };

  requireFinite(property.purchasePrice, 'Property value');
  if (isFiniteNumber(property.purchasePrice) && property.purchasePrice <= 0) {
    reasons.push('Property value must be greater than zero.');
  }
  requireNonNegative(property.leaseRent, 'Lease rent');
  requireNonNegative(property.marketRent, 'Market rent');
  requireNonNegative(property.annualTaxes, 'Annual taxes');
  requireNonNegative(property.annualInsurance, 'Annual insurance');
  requireNonNegative(property.hoa, 'Monthly HOA');
  requireFinite(currentLoan.balance, 'Current loan balance');
  if (isFiniteNumber(currentLoan.balance) && currentLoan.balance <= 0) {
    reasons.push('Current loan balance must be greater than zero.');
  }
  requireFinite(currentLoan.monthlyPayment, 'Current monthly payment');
  if (isFiniteNumber(currentLoan.monthlyPayment) && currentLoan.monthlyPayment <= 0) {
    reasons.push('Current monthly payment must be greater than zero.');
  }
  requireFinite(currentLoan.rate, 'Current rate');
  if (isFiniteNumber(currentLoan.rate) && (currentLoan.rate < 0 || currentLoan.rate > MAX_MODEL_RATE_PCT)) {
    reasons.push(`Current rate must be between 0% and ${MAX_MODEL_RATE_PCT}% for this model.`);
  }
  requireFinite(projectedRateEnvironment, 'Projected refinance rate');
  if (
    isFiniteNumber(projectedRateEnvironment)
    && (projectedRateEnvironment < 0 || projectedRateEnvironment > MAX_MODEL_RATE_PCT)
  ) {
    reasons.push(`Projected refinance rate must be between 0% and ${MAX_MODEL_RATE_PCT}% for this model.`);
  }
  requireFinite(monthsOwned, 'Months owned');
  if (
    isFiniteNumber(monthsOwned)
    && (!Number.isInteger(monthsOwned) || monthsOwned < 0 || monthsOwned > MAX_MODEL_OWNERSHIP_MONTHS)
  ) {
    reasons.push(`Months owned must be a whole number from 0 to ${MAX_MODEL_OWNERSHIP_MONTHS}.`);
  }
  requireFinite(projectedAppreciation, 'Projected appreciation');
  if (
    isFiniteNumber(projectedAppreciation)
    && (
      projectedAppreciation < MIN_MODEL_APPRECIATION_PCT
      || projectedAppreciation > MAX_MODEL_APPRECIATION_PCT
    )
  ) {
    reasons.push(
      `Projected appreciation must be between ${MIN_MODEL_APPRECIATION_PCT}% and ${MAX_MODEL_APPRECIATION_PCT}% for this scenario.`,
    );
  }

  if (reasons.length > 0) return unavailableAnalysis(reasons);

  const qualifyingRent = Math.min(property.leaseRent, property.marketRent);
  const escrows = property.annualTaxes / 12 + property.annualInsurance / 12 + property.hoa;
  const currentPITIA = currentLoan.monthlyPayment + escrows;
  const currentDSCR = currentPITIA > 0 ? qualifyingRent / currentPITIA : 0;
  const appreciatedValue = property.purchasePrice * (1 + projectedAppreciation / 100);

  if (!Number.isFinite(appreciatedValue) || appreciatedValue <= 0) {
    return unavailableAnalysis(['Projected property value is outside the model range.']);
  }

  const projectedRefiRate = projectedRateEnvironment;
  const projectedRefiPayment = safeMonthlyPayment(currentLoan.balance, projectedRefiRate);
  if (!Number.isFinite(projectedRefiPayment)) {
    return unavailableAnalysis(['Projected refinance payment could not be calculated from the entered values.']);
  }

  const projectedPITIA = projectedRefiPayment + escrows;
  const projectedRefiDSCR = projectedPITIA > 0 ? qualifyingRent / projectedPITIA : 0;
  const monthlySavings = currentLoan.monthlyPayment - projectedRefiPayment;
  const refiClosingCosts = currentLoan.balance * 0.025;
  const calculatedBreakEven = monthlySavings > 0
    ? Math.ceil(refiClosingCosts / monthlySavings)
    : NO_BREAK_EVEN;
  const breakEvenMonths = Number.isFinite(calculatedBreakEven)
    ? Math.min(NO_BREAK_EVEN, Math.max(1, calculatedBreakEven))
    : NO_BREAK_EVEN;

  const rateTermMaxLoan = appreciatedValue * (RATE_TERM_LTV / 100);
  const rateTermSupported = currentLoan.balance <= rateTermMaxLoan + 0.01;
  const targetValue = currentLoan.balance / (RATE_TERM_LTV / 100);
  const appreciationNeeded = Math.max(0, targetValue / property.purchasePrice - 1);
  const cashOutMaxAmount = Math.max(
    0,
    appreciatedValue * (CASH_OUT_LTV / 100) - currentLoan.balance,
  );

  if (
    ![
      currentDSCR,
      projectedRefiDSCR,
      monthlySavings,
      appreciationNeeded,
      cashOutMaxAmount,
    ].every(Number.isFinite)
  ) {
    return unavailableAnalysis(['The entered values produced a non-finite refinance result.']);
  }

  const seasoningMet = monthsOwned >= SEASONING_REQUIRED_MONTHS;
  const seasoningMonthsRemaining = Math.max(0, SEASONING_REQUIRED_MONTHS - monthsOwned);

  const seasoningScore: RefiReadinessFactor = seasoningMet
    ? {
        factor: 'Seasoning',
        score: 25,
        maxScore: 25,
        status: 'PASS',
        detail: `${monthsOwned} months owned meets this model's ${SEASONING_REQUIRED_MONTHS}-month scenario threshold.`,
      }
    : monthsOwned > 0
      ? {
          factor: 'Seasoning',
          score: 15,
          maxScore: 25,
          status: 'WARN',
          detail: `${seasoningMonthsRemaining} more month(s) are needed to reach this model's ${SEASONING_REQUIRED_MONTHS}-month threshold.`,
        }
      : {
          factor: 'Seasoning',
          score: 0,
          maxScore: 25,
          status: 'FAIL',
          detail: 'No ownership seasoning is established in the entered scenario.',
        };

  const equityScore: RefiReadinessFactor = appreciationNeeded === 0
    ? {
        factor: 'Equity',
        score: 25,
        maxScore: 25,
        status: 'PASS',
        detail: `The entered balance is at or below this model's ${RATE_TERM_LTV}% rate-and-term LTV scenario limit.`,
      }
    : appreciationNeeded < 0.05
      ? {
          factor: 'Equity',
          score: 15,
          maxScore: 25,
          status: 'WARN',
          detail: `Value must increase ${(appreciationNeeded * 100).toFixed(1)}% for the entered balance to reach ${RATE_TERM_LTV}% LTV.`,
        }
      : {
          factor: 'Equity',
          score: 0,
          maxScore: 25,
          status: 'FAIL',
          detail: `Value must increase ${(appreciationNeeded * 100).toFixed(1)}% for the entered balance to reach ${RATE_TERM_LTV}% LTV.`,
        };

  const rateScore: RefiReadinessFactor = monthlySavings > 0
    ? {
        factor: 'Rate Incentive',
        score: monthlySavings >= 200 ? 25 : monthlySavings >= 50 ? 20 : 15,
        maxScore: 25,
        status: 'PASS',
        detail: `The modeled payment is $${monthlySavings.toFixed(0)}/mo lower, with a ${breakEvenMonths}-month cost break-even.`,
      }
    : monthlySavings === 0
      ? {
          factor: 'Rate Incentive',
          score: 10,
          maxScore: 25,
          status: 'WARN',
          detail: 'The entered replacement rate produces no modeled P&I savings.',
        }
      : {
          factor: 'Rate Incentive',
          score: 0,
          maxScore: 25,
          status: 'FAIL',
          detail: `The modeled payment is $${Math.abs(monthlySavings).toFixed(0)}/mo higher.`,
        };

  const dscrScore: RefiReadinessFactor = projectedRefiDSCR >= 1.25
    ? {
        factor: 'DSCR Headroom',
        score: 25,
        maxScore: 25,
        status: 'PASS',
        detail: `Projected scenario DSCR is ${projectedRefiDSCR.toFixed(3)}.`,
      }
    : projectedRefiDSCR >= 1
      ? {
          factor: 'DSCR Headroom',
          score: 15,
          maxScore: 25,
          status: 'WARN',
          detail: `Projected scenario DSCR is ${projectedRefiDSCR.toFixed(3)} with limited headroom.`,
        }
      : {
          factor: 'DSCR Headroom',
          score: 0,
          maxScore: 25,
          status: 'FAIL',
          detail: `Projected scenario DSCR is ${projectedRefiDSCR.toFixed(3)}, below the model's 1.00x comparison line.`,
        };

  const readinessFactors = [seasoningScore, equityScore, rateScore, dscrScore];
  const refiReadinessScore = readinessFactors.reduce((sum, factor) => sum + factor.score, 0);
  const refiType = rateTermSupported && (monthlySavings > 0 || cashOutMaxAmount > 0)
    ? 'RATE_TERM'
    : 'NO_REFI';

  return {
    status: 'AVAILABLE',
    reviewReasons: [],
    currentDSCR,
    projectedRefiDSCR,
    seasoningMonthsRequired: SEASONING_REQUIRED_MONTHS,
    // Delayed-financing eligibility needs facts not present in this API (including
    // acquisition funding and documentation), so the model does not infer it.
    delayedFinancingAvailable: false,
    projectedRefiRate,
    projectedRefiPayment,
    monthlySavings,
    breakEvenMonths,
    appreciationNeeded,
    refiType,
    seasoningMet,
    seasoningMonthsRemaining,
    cashOutMaxAmount,
    refiReadinessScore,
    readinessFactors,
  };
}
