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
  const currentPITIA = currentLoan.monthlyPayment + property.annualTaxes / 12 + property.annualInsurance / 12 + property.hoa;
  const qualifyingRent = Math.min(property.leaseRent, property.marketRent);
  const currentDSCR = currentPITIA > 0 ? qualifyingRent / currentPITIA : 0;

  // Projected refi
  const appreciatedValue = property.purchasePrice * (1 + projectedAppreciation);
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

  const projectedRefiDSCR = qualifyingRent / (refiPayment + property.annualTaxes / 12 + property.annualInsurance / 12 + property.hoa);
  const monthlySavings = currentLoan.monthlyPayment - refiPayment;

  const refiClosingCosts = actualRefiAmount * 0.025;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(refiClosingCosts / monthlySavings) : 999;

  const seasoningMonthsRequired = SEASONING_REQUIRED_MONTHS;
  const delayedFinancingAvailable = monthsOwned >= 0;

  const appreciationNeeded = currentLoan.balance > property.purchasePrice * (RATE_TERM_LTV / 100)
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
