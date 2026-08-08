// ============================================================
// DSCR Loan Command Center v7.0 — Loan Optimizer & Rescue Engine
// Section 5.12: Prepay Penalty Calculator (on REMAINING balance)
// Section 15: Rescue Engine (Track 1 & Track 2 failure modes)
//
// PREPAY: Penalty = REMAINING_Principal_Balance_At_Exit × Step_Rate
//   NEVER original loan amount
//   Partial prepay allowance: ~20%/yr of original principal penalty-free
//   Soft prepay ≠ sale-exempt until doc language confirmed
//
// RESCUE: When Track 1 or Track 2 fails, compute ranked fixes
//   across 9 dimensions: rent increase, price reduction, down payment,
//   rate buy-down, IO change, lender formula swap, STR income,
//   combination fixes, ranked by fastest/cheapest/lowest-risk/best-ROI
// ============================================================

import type {
  PropertyInputs,
  BorrowerProfile,
  LoanStructure,
  RentalStrategy,
  StructureOption,
  PrepayPenaltySchedule,
  PrepayType,
  RescueResult,
  RescueFix,
} from './types';
import {
  calculatePI,
  calculatePaymentFactor,
  solveDSCR,
} from './engine';
import { checkPPPLegal } from './statePppLaws';

// ============================================================
// SECTION 5.12: PREPAY PENALTY SCHEDULE CALCULATOR
// Penalty = REMAINING_Principal_Balance_At_Exit × Step_Rate
// NEVER original loan amount
// ============================================================

export function computePrepaySchedule(
  loanAmount: number,
  rate: number,
  termYears: number,
  prepayType: PrepayType,
  isSoftPrepay: boolean,
  partialAllowancePct: number,
): PrepayPenaltySchedule {
  const termMonths = termYears * 12;
  const structureLabel = getPrepayStructureLabel(prepayType);

  // Every year goes through resolvePrepayPenalty. This block used to multiply
  // the balance by `steps.yearN` directly, which read the six-months-interest
  // sentinels (0.50 / 0.40) as 50% and 40% of the balance — a 14.3x
  // overstatement that computePrepayExitCost, in this same file, did not make.
  const penaltyAt = (monthsHeld: number, loanYear: number) =>
    resolvePrepayPenalty({
      prepayType,
      remainingBalance: computeRemainingBalance(loanAmount, rate, termMonths, monthsHeld),
      annualRatePct: rate,
      loanYear,
    });

  return {
    structure: structureLabel,
    year1: penaltyAt(12, 1),
    year2: penaltyAt(24, 2),
    year3: penaltyAt(36, 3),
    year4: penaltyAt(48, 4),
    year5: penaltyAt(60, 5),
    year6Plus: penaltyAt(72, 6),
    partialAllowancePct,
    softPrepay: isSoftPrepay,
    softPrepaySaleExempt: isSoftPrepay ? 'UNCONFIRMED' : false,
  };
}

// ============================================================
// PREPAY PENALTY — ONE FORMULA, ONE IMPLEMENTATION
// ============================================================
//
// Prepayment penalties come in two genuinely different shapes, and conflating
// them produced a 14x error that reached the page.
//
//   • STEPDOWN — a percent OF THE REMAINING BALANCE that declines by year
//     (5-4-3-2-1, flat 5, soft prepay, yield maintenance).
//   • MONTHS_INTEREST — N months of interest on the remaining balance, which
//     depends on the RATE, not on a percentage at all. "Six months interest"
//     on a $300K/7% loan is ~$10.4K; six percent of that balance would be
//     ~$17.8K, and there is no percentage that expresses it across rates.
//
// `getPrepayStepRates` used to return 0.50 / 0.40 for the six-months
// structures. Those were never percentages — they were sentinels meaning "six
// months" and "6 x 80% = 4.8 months", and only `computePrepayExitCost` knew to
// special-case them. `computePrepaySchedule` read them literally, as 50% and
// 40% of the balance, and published a year-1 penalty of $148,476 on a $300K
// loan where the real figure is $10,393. Both functions live in this file and
// disagreed by 14.3x on the same input.
//
// The shape is now explicit in the type, so no caller can read a "months"
// figure as a percentage: a stepdown table and a months-of-interest rule are
// different variants, and `resolvePrepayPenalty` is the only place either is
// turned into dollars.

/** Penalty percentages of the remaining balance, by loan year. */
export interface PrepayStepRates {
  year1: number; year2: number; year3: number;
  year4: number; year5: number; year6Plus: number;
}

export type PrepayFormula =
  | { kind: 'BALANCE_PCT'; steps: PrepayStepRates }
  /** N months of interest on the remaining balance at the note rate. */
  | { kind: 'MONTHS_INTEREST'; months: number };

export function getPrepayFormula(prepayType: PrepayType): PrepayFormula {
  switch (prepayType) {
    case 'SIX_MONTHS_INTEREST':
      return { kind: 'MONTHS_INTEREST', months: 6 };
    case 'SIX_MONTHS_80_PCT':
      // Six months of interest charged on 80% of the balance — equivalently
      // 4.8 months on the full balance. Written as the literal because
      // `6 * 0.8` is 4.800000000000001 in binary floating point.
      return { kind: 'MONTHS_INTEREST', months: 4.8 };
    default:
      return { kind: 'BALANCE_PCT', steps: getPrepayStepRates(prepayType) };
  }
}

/** The stepdown rate that applies in a given loan year (1-based). */
export function stepRateForYear(steps: PrepayStepRates, loanYear: number): number {
  if (loanYear <= 1) return steps.year1;
  if (loanYear <= 2) return steps.year2;
  if (loanYear <= 3) return steps.year3;
  if (loanYear <= 4) return steps.year4;
  if (loanYear <= 5) return steps.year5;
  return steps.year6Plus;
}

/**
 * The penalty in dollars to retire `remainingBalance` in `loanYear`.
 *
 * The single implementation. Both the year-by-year schedule and the exit-cost
 * wrapper route through it, so they cannot drift apart again.
 */
export function resolvePrepayPenalty(args: {
  prepayType: PrepayType;
  /** Principal still owed at payoff. Never the original loan amount. */
  remainingBalance: number;
  /** Note rate in percent, needed only by months-of-interest structures. */
  annualRatePct: number;
  /** 1-based loan year of the payoff, used only by stepdown structures. */
  loanYear: number;
}): number {
  const { prepayType, remainingBalance, annualRatePct, loanYear } = args;
  if (prepayType === 'NONE') return 0;
  if (!Number.isFinite(remainingBalance) || remainingBalance <= 0) return 0;

  const formula = getPrepayFormula(prepayType);
  const dollars =
    formula.kind === 'MONTHS_INTEREST'
      ? remainingBalance * (annualRatePct / 100 / 12) * formula.months
      : remainingBalance * stepRateForYear(formula.steps, loanYear);

  return Math.round(Math.max(0, dollars) * 100) / 100;
}

function getPrepayStructureLabel(prepayType: PrepayType): string {
  switch (prepayType) {
    case '54321': return '5-4-3-2-1 Step-Down';
    case '4321': return '4-3-2-1 Step-Down';
    case '321': return '3-2-1 Step-Down';
    case '54333': return '5-4-3-3-3 Floored Step-Down';
    case 'FLAT_5': return 'Flat 5/5/5';
    case 'SIX_MONTHS_INTEREST': return 'Six Months Interest';
    case 'SIX_MONTHS_80_PCT': return 'Six Months Interest (80% of balance)';
    case 'YIELD_MAINTENANCE': return 'Yield Maintenance';
    case 'SOFT_PREPAY': return 'Soft Prepay (sale-exempt UNCONFIRMED)';
    case 'NONE': return 'No Prepayment Penalty';
    default: return 'Unknown Structure';
  }
}

function getPrepayStepRates(prepayType: PrepayType): {
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  year5: number;
  year6Plus: number;
} {
  switch (prepayType) {
    case '54321':
      return { year1: 0.05, year2: 0.04, year3: 0.03, year4: 0.02, year5: 0.01, year6Plus: 0 };
    case '4321':
      return { year1: 0.04, year2: 0.03, year3: 0.02, year4: 0.01, year5: 0, year6Plus: 0 };
    case '321':
      return { year1: 0.03, year2: 0.02, year3: 0.01, year4: 0, year5: 0, year6Plus: 0 };
    case '54333':
      return { year1: 0.05, year2: 0.04, year3: 0.03, year4: 0.03, year5: 0.03, year6Plus: 0 };
    case 'FLAT_5':
      return { year1: 0.05, year2: 0.05, year3: 0.05, year4: 0.05, year5: 0.05, year6Plus: 0 };
    // SIX_MONTHS_INTEREST / SIX_MONTHS_80_PCT deliberately have NO entry here.
    // They are months of interest, not a percent of balance, and the 0.50 /
    // 0.40 that used to sit here were sentinels one caller read literally as
    // 50% and 40%. getPrepayFormula routes them to MONTHS_INTEREST instead; if
    // one reaches this table it falls through to zero rather than to a
    // plausible-looking percentage.
    case 'YIELD_MAINTENANCE':
      return { year1: 0.05, year2: 0.04, year3: 0.03, year4: 0.02, year5: 0.01, year6Plus: 0.01 };
    case 'SOFT_PREPAY':
      return { year1: 0.03, year2: 0.02, year3: 0.01, year4: 0, year5: 0, year6Plus: 0 };
    case 'NONE':
    default:
      return { year1: 0, year2: 0, year3: 0, year4: 0, year5: 0, year6Plus: 0 };
  }
}

// ============================================================
// REMAINING BALANCE CALCULATOR
// Amortization-based remaining principal at a given month
// ============================================================

export function computeRemainingBalance(
  loanAmount: number,
  rate: number,
  termMonths: number,
  monthNumber: number,
): number {
  if (monthNumber <= 0) return loanAmount;
  if (monthNumber >= termMonths) return 0;

  const monthlyRate = rate / 100 / 12;
  if (monthlyRate === 0) {
    const straightLine = loanAmount / termMonths;
    return Math.max(loanAmount - straightLine * monthNumber, 0);
  }

  const factor = calculatePaymentFactor(rate, termMonths);
  const pi = loanAmount * factor;

  let balance = loanAmount;
  for (let i = 0; i < monthNumber; i++) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = pi - interestPortion;
    balance -= principalPortion;
    if (balance < 0) {
      balance = 0;
      break;
    }
  }

  return balance;
}

// calculatePaymentFactor imported from engine.ts (single source of truth)

// ============================================================
// PREPAY EXIT COST (convenience wrapper)
// ============================================================

export function computePrepayExitCost(
  loanAmount: number,
  rate: number,
  termYears: number,
  prepayType: PrepayType,
  holdYears: number,
): number {
  if (prepayType === 'NONE') return 0;

  const termMonths = termYears * 12;
  const holdMonths = holdYears * 12;
  const remainingBalance = computeRemainingBalance(loanAmount, rate, termMonths, holdMonths);

  return resolvePrepayPenalty({
    prepayType,
    remainingBalance,
    annualRatePct: rate,
    loanYear: Math.ceil(holdYears),
  });
}

// ============================================================
// SECTION 15: RESCUE ENGINE — TRACK 1
// When lender qualification DSCR falls below target
// ============================================================

export function rescueTrack1(
  property: PropertyInputs,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  currentTrack1DSCR: number,
  targetDSCR: number,
  pitia: number,
  loanAmount: number,
  rate: number,
  termYears: number,
  strategy: RentalStrategy = 'LTR',
): RescueResult {
  const termMonths = termYears * 12;
  const fixedExpenses =
    property.annualTaxes / 12 +
    property.annualInsurance / 12 +
    property.hoa +
    property.floodInsurance; // MONTHLY — do not divide by 12 (bug audit #1)
  const currentPI = pitia - fixedExpenses;
  const currentRent = currentTrack1DSCR * pitia;
  const targetRent = targetDSCR * pitia;
  const rentShortfall = targetRent - currentRent;
  const currentTrack2DSCR = computeTrack2DSCR(currentRent, pitia);

  const fixes: RescueFix[] = [];

  // ── FIX 1: Required rent increase ──
  const requiredRentIncrease = rentShortfall;
  fixes.push({
    action: 'Increase Rent',
    description: `Raise monthly rent by $${requiredRentIncrease.toFixed(0)} to reach DSCR ${targetDSCR.toFixed(2)}. New rent: $${targetRent.toFixed(0)}/month.`,
    amount: requiredRentIncrease,
    track1Impact: targetDSCR - currentTrack1DSCR,
    track2Impact: (targetRent * TRACK2_NET_FACTOR - pitia) / pitia - currentTrack2DSCR,
    cashOnCashImpact: requiredRentIncrease * 12,
    risk: 'MODERATE' as const,
    cost: 0,
    lenderConfirmation: false,
  });

  // ── FIX 2: Required price reduction ──
  const maxLoanAtTarget = solveMaxLoanAtDSCR(
    targetDSCR,
    rate,
    termMonths,
    loan.ioPeriod,
    fixedExpenses,
    currentRent,
  );
  const maxPriceAtTarget = maxLoanAtTarget / (loan.ltv / 100);
  const priceReduction = property.purchasePrice - maxPriceAtTarget;
  if (priceReduction > 0) {
    const newLoanAmount = maxPriceAtTarget * (loan.ltv / 100);
    const newPI = calculatePI(newLoanAmount, rate, termMonths);
    const newPITIA = newPI + fixedExpenses;
    const newDSCR = currentRent / newPITIA;
    fixes.push({
      action: 'Reduce Purchase Price',
      description: `Reduce price by $${priceReduction.toFixed(0)} to $${maxPriceAtTarget.toFixed(0)}. New loan: $${newLoanAmount.toFixed(0)}. DSCR becomes ${newDSCR.toFixed(2)}.`,
      amount: priceReduction,
      track1Impact: newDSCR - currentTrack1DSCR,
      track2Impact: (currentRent * TRACK2_NET_FACTOR - newPITIA) / newPITIA - currentTrack2DSCR,
      cashOnCashImpact: -priceReduction,
      risk: 'LOW' as const,
      cost: 0,
      lenderConfirmation: false,
    });
  }

  // ── FIX 3: Required additional down payment ──
  const additionalDown = priceReduction > 0 ? priceReduction * (loan.ltv / 100) : 0;
  if (additionalDown > 0) {
    const newLoanAmount = loanAmount - additionalDown;
    const newPI = calculatePI(newLoanAmount, rate, termMonths);
    const newPITIA = newPI + fixedExpenses;
    const newDSCR = currentRent / newPITIA;
    fixes.push({
      action: 'Additional Down Payment',
      description: `Add $${additionalDown.toFixed(0)} to down payment. New loan: $${newLoanAmount.toFixed(0)}. DSCR becomes ${newDSCR.toFixed(2)}.`,
      amount: additionalDown,
      track1Impact: newDSCR - currentTrack1DSCR,
      track2Impact: (currentRent * TRACK2_NET_FACTOR - newPITIA) / newPITIA - currentTrack2DSCR,
      cashOnCashImpact: -additionalDown,
      risk: 'LOW' as const,
      cost: additionalDown,
      lenderConfirmation: false,
    });
  }

  // ── FIX 4: Rate buy-down ──
  // We want: currentRent / newPITIA = targetDSCR
  //   => newPITIA = currentRent / targetDSCR
  //   => newPI    = newPITIA - fixedExpenses
  // (Prior implementation used targetRent - fixedExpenses, which yields a PI
  //  HIGHER than currentPI whenever targetDSCR > 1.0, causing the rate buy-down
  //  fix to never trigger. Corrected to anchor on currentRent, not targetRent.)
  const targetPITIA = currentRent / targetDSCR;
  const targetPI = targetPITIA - fixedExpenses;
  const dealBreakRate = solveDealBreakRateFromPI(loanAmount, termMonths, targetPI, loan.ioPeriod);
  const rateReductionNeeded = rate - dealBreakRate;
  if (rateReductionNeeded > 0) {
    const pointsCost = rateReductionNeeded * 100; // ~1 point per 0.25% buy-down
    const monthlySavings = currentPI - targetPI;
    const breakEvenMonths = monthlySavings > 0 ? (pointsCost * loanAmount / 100) / monthlySavings : 999;
    fixes.push({
      action: 'Rate Buy-Down',
      description: `Buy rate down by ${rateReductionNeeded.toFixed(2)}% from ${rate.toFixed(2)}% to ~${dealBreakRate.toFixed(2)}%. Estimated cost: ${pointsCost.toFixed(1)} points ($${(pointsCost * loanAmount / 100).toFixed(0)}). Break-even: ${Math.round(breakEvenMonths)} months vs ${loan.expectedHoldYears * 12}-month hold.`,
      amount: rateReductionNeeded,
      track1Impact: targetDSCR - currentTrack1DSCR,
      track2Impact: 0.05,
      cashOnCashImpact: -(pointsCost * loanAmount / 100),
      risk: 'LOW' as const,
      cost: pointsCost * loanAmount / 100,
      lenderConfirmation: true,
    });
  }

  // ── FIX 5: IO structure change ──
  const ioPayment = loanAmount * (rate / 100 / 12);
  const ioPITIA = ioPayment + fixedExpenses;
  const ioDSCR = currentRent / ioPITIA;
  if (loan.ioPeriod === 'NONE' && ioDSCR > currentTrack1DSCR) {
    fixes.push({
      action: 'Switch to Interest-Only',
      description: `IO payment drops P&I from $${currentPI.toFixed(0)} to $${ioPayment.toFixed(0)}/month. New PITIA: $${ioPITIA.toFixed(0)}. DSCR becomes ${ioDSCR.toFixed(2)}. WARNING: Payment recasts after IO period.`,
      amount: currentPI - ioPayment,
      track1Impact: ioDSCR - currentTrack1DSCR,
      track2Impact: (currentRent * TRACK2_NET_FACTOR - ioPITIA) / ioPITIA - currentTrack2DSCR,
      cashOnCashImpact: (currentPI - ioPayment) * 12,
      risk: 'MODERATE' as const,
      cost: rate * 0.005 * loanAmount,
      lenderConfirmation: true,
    });
  }

  // ── FIX 6: Lender formula swap (GROSS_PITIA vs NOI_PI) ──
  const noiPIDenominator = currentPI;
  const noiPIDSCR = currentRent / noiPIDenominator;
  const formulaImpact = noiPIDSCR - currentTrack1DSCR;
  if (formulaImpact > 0.05) {
    fixes.push({
      action: 'Lender Formula Swap',
      description: `Switch from GROSS_PITIA (DSCR ${currentTrack1DSCR.toFixed(2)}) to NOI_PI formula (DSCR ${noiPIDSCR.toFixed(2)}). Impact: +${formulaImpact.toFixed(2)}x. Some lenders allow this — GROSS_PITIA vs NOI_PI can move 0.10-0.20x DSCR.`,
      amount: formulaImpact,
      track1Impact: formulaImpact,
      track2Impact: 0,
      cashOnCashImpact: 0,
      risk: 'MODERATE' as const,
      cost: 0,
      lenderConfirmation: true,
    });
  }

  // ── FIX 7: STR income method ──
  const strRent = property.strProjectedRent * 0.80;
  const ltrFallback = Math.min(property.leaseRent, property.marketRent);
  if (strRent > ltrFallback && strRent > currentRent) {
    const strDSCR = strRent / pitia;
    if (strDSCR > currentTrack1DSCR) {
      fixes.push({
        action: 'Use STR Income Method',
        description: `STR projected income ($${strRent.toFixed(0)}/month after 20% haircut) exceeds LT rent ($${ltrFallback.toFixed(0)}). DSCR becomes ${strDSCR.toFixed(2)}. Requires STR legality confirmation and lender acceptance.`,
        amount: strRent - currentRent,
        track1Impact: strDSCR - currentTrack1DSCR,
        track2Impact: (strRent * TRACK2_NET_FACTOR - pitia) / pitia - currentTrack2DSCR,
        cashOnCashImpact: (strRent - currentRent) * 12,
        risk: 'HIGH' as const,
        cost: 0,
        lenderConfirmation: true,
      });
    }
  }

  // ── FIX 8: Combination fix (cheaper than single fix) ──
  if (fixes.length >= 2) {
    const rentHalf = fixes.find(f => f.action === 'Increase Rent');
    const ioFix = fixes.find(f => f.action === 'Switch to Interest-Only');
    const downFix = fixes.find(f => f.action === 'Additional Down Payment');

    const comboParts: RescueFix[] = [];
    let comboRentIncrease = 0;

    if (rentHalf) {
      comboRentIncrease = rentShortfall * 0.5;
      const comboRent = currentRent + comboRentIncrease;
      const comboDSCR = comboRent / pitia;
      comboParts.push({
        action: 'Combination: Partial Rent Increase',
        description: `Raise rent by $${comboRentIncrease.toFixed(0)} (50% of full increase needed). DSCR contribution: +${(comboDSCR - currentTrack1DSCR).toFixed(2)}x.`,
        amount: comboRentIncrease,
        track1Impact: comboDSCR - currentTrack1DSCR,
        track2Impact: comboRentIncrease * TRACK2_NET_FACTOR / pitia,
        cashOnCashImpact: comboRentIncrease * 12,
        risk: 'LOW' as const,
        cost: 0,
        lenderConfirmation: false,
      });
    }

    if (ioFix && loan.ioPeriod === 'NONE') {
      const halfIOImpact = (ioDSCR - currentTrack1DSCR) * 0.5;
      comboParts.push({
        action: 'Combination: Partial IO Switch',
        description: `IO switch contributes ~50% of the DSCR improvement needed.`,
        amount: ioFix.amount * 0.5,
        track1Impact: halfIOImpact,
        track2Impact: ioFix.track2Impact * 0.5,
        cashOnCashImpact: ioFix.cashOnCashImpact * 0.5,
        risk: 'LOW' as const,
        cost: ioFix.cost * 0.5,
        lenderConfirmation: true,
      });
    }

    if (downFix) {
      const halfDown = downFix.amount * 0.5;
      const halfLoanAmount = loanAmount - halfDown;
      const halfPI = calculatePI(halfLoanAmount, rate, termMonths);
      const halfPITIA = halfPI + fixedExpenses;
      const halfDSCR = (currentRent + comboRentIncrease) / halfPITIA;
      comboParts.push({
        action: 'Combination: Partial Down Payment',
        description: `Add $${halfDown.toFixed(0)} to down payment (50% of full amount needed).`,
        amount: halfDown,
        track1Impact: halfDSCR - currentTrack1DSCR,
        track2Impact: 0.02,
        cashOnCashImpact: -halfDown,
        risk: 'LOW' as const,
        cost: halfDown,
        lenderConfirmation: false,
      });
    }

    const comboImpact = comboParts.reduce((sum, f) => sum + f.track1Impact, 0);
    const comboCost = comboParts.reduce((sum, f) => sum + f.cost, 0);
    // Compare against the cheapest SINGLE fix that ACHIEVES the target DSCR
    // (track1Impact >= needed improvement). Comparing against the absolute
    // cheapest fix (which may be free but insufficient — e.g., "raise rent")
    // caused the combo to never trigger. Now we look at fix alternatives that
    // actually solve the problem.
    const neededImpact = targetDSCR - currentTrack1DSCR;
    const cheapestSufficientSingleCost = fixes
      .filter(f => f.track1Impact >= neededImpact * 0.8)
      .reduce((min, f) => (f.cost < min ? f.cost : min), Infinity);

    if (comboImpact >= neededImpact * 0.8 && comboCost < cheapestSufficientSingleCost) {
      fixes.push({
        action: 'Combination Fix (Multiple Levers)',
        description: `Combine partial rent increase + partial IO + partial down payment. Total DSCR improvement: +${comboImpact.toFixed(2)}x. Cost: $${comboCost.toFixed(0)} — cheaper than the cheapest single sufficient fix of $${cheapestSufficientSingleCost.toFixed(0)}.`,
        amount: comboParts.reduce((sum, f) => sum + f.amount, 0),
        track1Impact: comboImpact,
        track2Impact: comboParts.reduce((sum, f) => sum + f.track2Impact, 0),
        cashOnCashImpact: comboParts.reduce((sum, f) => sum + f.cashOnCashImpact, 0),
        risk: 'LOW' as const,
        cost: comboCost,
        lenderConfirmation: comboParts.some(f => f.lenderConfirmation),
      });
    }
  }

  // ── FIX 9: Ranked by categories ──
  const sortedBySpeed = [...fixes].sort((a, b) => a.cost - b.cost);
  const sortedByCost = [...fixes].sort((a, b) => a.cost - b.cost);
  const sortedByRisk = [...fixes].sort((a, b) => riskRank(a.risk) - riskRank(b.risk));
  const sortedByROI = [...fixes].sort((a, b) => {
    const roiA = a.cost > 0 ? a.track1Impact / a.cost : a.track1Impact * 1000;
    const roiB = b.cost > 0 ? b.track1Impact / b.cost : b.track1Impact * 1000;
    return roiB - roiA;
  });

  const fastestFix = sortedBySpeed[0] ?? buildDefaultFix(currentTrack1DSCR, targetDSCR);
  const cheapestFix = sortedByCost[0] ?? buildDefaultFix(currentTrack1DSCR, targetDSCR);
  const lowestRiskFix = sortedByRisk[0] ?? buildDefaultFix(currentTrack1DSCR, targetDSCR);
  const bestROIFix = sortedByROI[0] ?? buildDefaultFix(currentTrack1DSCR, targetDSCR);

  return {
    currentTrack1DSCR,
    targetTrack1DSCR: targetDSCR,
    currentTrack2DSCR,
    fixes,
    fastestFix,
    cheapestFix,
    lowestRiskFix,
    bestROIFix,
    warning: currentTrack1DSCR < 1.0
      ? `Track 1 DSCR is ${currentTrack1DSCR.toFixed(2)} — below the 1.0 qualification floor. This deal will NOT qualify without structural changes. Review rescue options above.`
      : `Track 1 DSCR is ${currentTrack1DSCR.toFixed(2)} — below target ${targetDSCR.toFixed(2)}. Adjustments needed to reach target qualification.`,
  };
}

// ============================================================
// SECTION 15: RESCUE ENGINE — TRACK 2
// When investor survival DSCR fails (negative cash flow)
// ============================================================

export function rescueTrack2(
  grossRent: number,
  pitia: number,
  currentTrack2DSCR: number,
  vacancyPct: number,
  managementPct: number,
  maintenancePct: number,
): RescueResult {
  const netIncome = grossRent * (1 - vacancyPct / 100) - grossRent * managementPct / 100 - grossRent * maintenancePct / 100;
  const monthlyShortfall = netIncome - pitia;
  const targetTrack2DSCR = 1.0;
  const targetNetIncome = pitia * targetTrack2DSCR;
  const incomeShortfall = targetNetIncome - netIncome;

  const fixes: RescueFix[] = [];

  // ── FIX 1: Raise rent ──
  const rentIncreaseNeeded = incomeShortfall / (1 - vacancyPct / 100 - managementPct / 100 - maintenancePct / 100);
  fixes.push({
    action: 'Raise Rent',
    description: `Increase gross rent by $${rentIncreaseNeeded.toFixed(0)}/month to $${(grossRent + rentIncreaseNeeded).toFixed(0)}. After ${vacancyPct}% vacancy, ${managementPct}% mgmt, ${maintenancePct}% maint, net reaches $${targetNetIncome.toFixed(0)} = PITIA × 1.0.`,
    amount: rentIncreaseNeeded,
    track1Impact: rentIncreaseNeeded / pitia,
    track2Impact: targetTrack2DSCR - currentTrack2DSCR,
    cashOnCashImpact: rentIncreaseNeeded * 12 * (1 - vacancyPct / 100),
    risk: 'MODERATE' as const,
    cost: 0,
    lenderConfirmation: false,
  });

  // ── FIX 2: Self-manage (Track 2 only, never Track 1) ──
  const managementSavings = grossRent * managementPct / 100;
  const selfManageNet = netIncome + managementSavings;
  const selfManageDSCR = pitia > 0 ? selfManageNet / pitia : 0;
  fixes.push({
    action: 'Self-Manage Property',
    description: `Eliminate ${managementPct}% management fee ($${managementSavings.toFixed(0)}/month). Net income rises to $${selfManageNet.toFixed(0)}/month. Track 2 DSCR becomes ${selfManageDSCR.toFixed(2)}. NOTE: Self-manage only improves Track 2 — NEVER Track 1 (lender uses gross rent/PITIA regardless).`,
    amount: managementSavings,
    track1Impact: 0,
    track2Impact: selfManageDSCR - currentTrack2DSCR,
    cashOnCashImpact: managementSavings * 12,
    risk: 'MODERATE' as const,
    cost: 0,
    lenderConfirmation: false,
  });

  // ── FIX 3: Insurance / tax appeal ──
  const insuranceEstimate = pitia * 0.08;
  const taxEstimate = pitia * 0.15;
  const insuranceReshop = insuranceEstimate * 0.20;
  const taxAppealSaving = taxEstimate * 0.10;
  const totalSavings = insuranceReshop + taxAppealSaving;
  const newPITIA = pitia - totalSavings;
  const newTrack2DSCR = newPITIA > 0 ? netIncome / newPITIA : 0;
  fixes.push({
    action: 'Insurance Reshop + Tax Appeal',
    description: `Reshop insurance (save ~$${insuranceReshop.toFixed(0)}/month) and appeal tax assessment (save ~$${taxAppealSaving.toFixed(0)}/month). Total: $${totalSavings.toFixed(0)}/month. Track 2 DSCR becomes ${newTrack2DSCR.toFixed(2)}.`,
    amount: totalSavings,
    track1Impact: totalSavings / pitia * 0.5,
    track2Impact: newTrack2DSCR - currentTrack2DSCR,
    cashOnCashImpact: totalSavings * 12,
    risk: 'LOW' as const,
    cost: 0,
    lenderConfirmation: false,
  });

  // ── FIX 4: Accept negative carry as explicit appreciation bet ──
  const negativeCarry = Math.abs(monthlyShortfall);
  fixes.push({
    action: 'Accept Negative Carry',
    description: `Accept $${negativeCarry.toFixed(0)}/month negative cash flow as an explicit appreciation bet. This is -$${(negativeCarry * 12).toFixed(0)}/year out of pocket. Only justified if projected appreciation and/or tax benefits exceed this cost. Document the thesis.`,
    amount: negativeCarry,
    track1Impact: 0,
    track2Impact: 0,
    cashOnCashImpact: -negativeCarry * 12,
    risk: 'HIGH' as const,
    cost: 0,
    lenderConfirmation: false,
  });

  // ── Rank fixes ──
  const sortedBySpeed = [...fixes].sort((a, b) => a.cost - b.cost);
  const sortedByCost = [...fixes].sort((a, b) => a.cost - b.cost);
  const sortedByRisk = [...fixes].sort((a, b) => riskRank(a.risk) - riskRank(b.risk));
  const sortedByROI = [...fixes].sort((a, b) => {
    const roiA = a.cost > 0 ? a.track2Impact / a.cost : a.track2Impact * 1000;
    const roiB = b.cost > 0 ? b.track2Impact / b.cost : b.track2Impact * 1000;
    return roiB - roiA;
  });

  const fastestFix = sortedBySpeed[0] ?? buildDefaultFix(currentTrack2DSCR, targetTrack2DSCR);
  const cheapestFix = sortedByCost[0] ?? buildDefaultFix(currentTrack2DSCR, targetTrack2DSCR);
  const lowestRiskFix = sortedByRisk[0] ?? buildDefaultFix(currentTrack2DSCR, targetTrack2DSCR);
  const bestROIFix = sortedByROI[0] ?? buildDefaultFix(currentTrack2DSCR, targetTrack2DSCR);

  return {
    currentTrack1DSCR: 0,
    targetTrack1DSCR: 0,
    currentTrack2DSCR,
    fixes,
    fastestFix,
    cheapestFix,
    lowestRiskFix,
    bestROIFix,
    warning: monthlyShortfall < 0
      ? `Track 2 shows $${negativeCarry.toFixed(0)}/month negative carry. This deal does NOT cash flow after expenses. Proceed only if appreciation/tax strategy justifies the $${negativeCarry.toFixed(0)}/month ($${(negativeCarry * 12).toFixed(0)}/year) outlay.`
      : `Track 2 DSCR is ${currentTrack2DSCR.toFixed(2)} — near breakeven. Small improvements could provide a cash flow buffer.`,
  };
}

// ============================================================
// STRUCTURE OPTIONS GENERATOR
// ============================================================

export function generateStructureOptions(
  property: PropertyInputs,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  strategy: RentalStrategy,
): StructureOption[] {
  const options: StructureOption[] = [];
  const baseLoanAmount = property.purchasePrice * (loan.ltv / 100);

  const pppCheck = checkPPPLegal(
    property.state,
    borrower.entityType,
    baseLoanAmount,
    property.unitCount,
    loan.armType === 'FIXED' ? 'FIXED' : 'ARM',
  );

  const structures: {
    name: string;
    term: string;
    armType: string;
    ioPeriod: string;
    ltv: number;
  }[] = [
    { name: '30yr Fixed', term: '30_YR', armType: 'FIXED', ioPeriod: 'NONE', ltv: loan.ltv },
    { name: '30yr Fixed + 5yr IO', term: '30_YR', armType: 'FIXED', ioPeriod: '5_YR', ltv: loan.ltv },
    { name: '30yr Fixed + 10yr IO', term: '30_YR', armType: 'FIXED', ioPeriod: '10_YR', ltv: loan.ltv },
    { name: '40yr Extended', term: '40_YR', armType: 'FIXED', ioPeriod: 'NONE', ltv: loan.ltv },
    { name: '40yr + 10yr IO', term: '40_YR', armType: 'FIXED', ioPeriod: '10_YR', ltv: loan.ltv },
    { name: '5/6 ARM', term: '30_YR', armType: '5_6_ARM', ioPeriod: 'NONE', ltv: loan.ltv },
    { name: '5/6 ARM + 10yr IO', term: '30_YR', armType: '5_6_ARM', ioPeriod: '10_YR', ltv: loan.ltv },
    { name: '7/6 ARM', term: '30_YR', armType: '7_6_ARM', ioPeriod: 'NONE', ltv: loan.ltv },
    { name: '10/6 ARM', term: '30_YR', armType: '10_6_ARM', ioPeriod: 'NONE', ltv: loan.ltv },
    { name: 'Lower LTV (70%)', term: '30_YR', armType: 'FIXED', ioPeriod: 'NONE', ltv: 70 },
    { name: 'Lower LTV (70%) + IO', term: '30_YR', armType: 'FIXED', ioPeriod: '10_YR', ltv: 70 },
    { name: 'Lower LTV (65%)', term: '30_YR', armType: 'FIXED', ioPeriod: 'NONE', ltv: 65 },
  ];

  for (const struct of structures) {
    const testLoan: LoanStructure = {
      ...loan,
      term: struct.term as LoanStructure['term'],
      armType: struct.armType as LoanStructure['armType'],
      ioPeriod: struct.ioPeriod as LoanStructure['ioPeriod'],
      ltv: struct.ltv,
    };

    const result = solveDSCR(property, borrower, testLoan, strategy);
    const termYears = struct.term === '40_YR' ? 40 : struct.term === '15_YR' ? 15 : 30;
    const structLoanAmount = property.purchasePrice * (struct.ltv / 100);

    const pitiaBreakdown = result.monthlyPITIA;
    const isIO = struct.ioPeriod !== 'NONE';
    const monthlyPayment = pitiaBreakdown.total;
    const monthlyCashFlow = result.qualifyingRent - monthlyPayment;

    // Five-year cost components (audit requirement: interest + points + lender
    // fees + broker fees + rate lock + PPP exit cost). Each component is now
    // explicit instead of lumped into a generic 3% closing-costs figure.
    const pointsCost = (loan.points / 100) * structLoanAmount; // points is a percentage (2.0 = 2%)
    const lenderFees = loan.lenderFees;                       // flat dollar amount
    const brokerFees = loan.brokerFees;                       // flat dollar amount (matches engine.ts)
    const rateLockCost = loan.rateLockCost;                   // flat dollar amount
    // Closing costs (title, escrow, appraisal, etc.) — distinct from points/fees above.
    const closingCosts = structLoanAmount * 0.03;
    // PPP fee premium: ~0.625% of loan amount when PPP is legally blocked.
    const pppPremiumFee = !pppCheck.allowed ? pppCheck.noPPPPremiumFee * structLoanAmount : 0;
    const pppExitCost = computePrepayExitCost(
      structLoanAmount,
      result.solvedRate,
      termYears,
      loan.prepayPreference,
      loan.expectedHoldYears,
    );
    const prepaySchedule = computePrepaySchedule(
      structLoanAmount,
      result.solvedRate,
      termYears,
      loan.prepayPreference,
      loan.prepayPreference === 'SOFT_PREPAY',
      20,
    );

    const pppPremiumRate = !pppCheck.allowed ? pppCheck.noPPPPremiumRate : 0;
    const adjustedRate = result.solvedRate + pppPremiumRate;

    const fiveYearCost = computeFiveYearCost(
      structLoanAmount,
      adjustedRate,
      monthlyPayment,
      closingCosts,
      pppExitCost,
      isIO,
      termYears,
      pointsCost,
      lenderFees,
      brokerFees,
      rateLockCost,
      pppPremiumFee,
    );

    // Reuse the Track2 DSCR solveDSCR() already computed above (engine.ts's
    // buildTrack2, standardized to a flat 8% vacancy for LTR/STR/MTR alike)
    // instead of re-deriving it locally with a divergent 25%/12%/8% vacancy
    // schedule — the two used to disagree for the same deal (CRITICAL: same
    // property/strategy showed two different Track 2 DSCR numbers in one session).
    const track2DSCR = result.dualTrackDSCR.track2.dscr;

    const tags: string[] = [];
    if (struct.armType !== 'FIXED') tags.push('ARM');
    if (isIO) tags.push('IO');
    if (struct.ltv < loan.ltv) tags.push('Lower LTV');
    if (result.dscr >= 1.25) tags.push('Best Pricing');
    if (result.dscr < 1.0) tags.push('Sub-1.0');
    if (result.dscr >= 1.0 && result.dscr < 1.10) tags.push('Tight');
    if (adjustedRate < 6.5) tags.push('Competitive Rate');

    let ioRecastWarning: string | null = null;
    if (isIO) {
      const ioYears = struct.ioPeriod === '5_YR' ? 5 : struct.ioPeriod === '7_YR' ? 7 : 10;
      const remainingTerm = termYears - ioYears;
      const recastLoan = structLoanAmount;
      const recastMonths = remainingTerm * 12;
      const recastPI = calculatePI(recastLoan, adjustedRate, recastMonths);
      const recastPITIA = recastPI + (pitiaBreakdown.taxes + pitiaBreakdown.insurance + pitiaBreakdown.hoa + pitiaBreakdown.floodInsurance);
      ioRecastWarning = `After ${ioYears}-yr IO period, payment recasts to $${recastPITIA.toFixed(0)}/month (P&I jumps from $${(monthlyPayment - pitiaBreakdown.taxes - pitiaBreakdown.insurance - pitiaBreakdown.hoa - pitiaBreakdown.floodInsurance).toFixed(0)} to $${recastPI.toFixed(0)}). DSCR at recast: ${(result.qualifyingRent / recastPITIA).toFixed(2)}.`;
    }

    options.push({
      name: struct.name,
      term: struct.term,
      armType: struct.armType,
      ioPeriod: struct.ioPeriod,
      ltv: struct.ltv,
      rate: adjustedRate,
      track1DSCR: Math.round(result.dscr * 1000) / 1000,
      track2DSCR: Math.round(track2DSCR * 1000) / 1000,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      monthlyCashFlow: Math.round(monthlyCashFlow * 100) / 100,
      fiveYearCost: Math.round(fiveYearCost),
      prepayPenalty: prepaySchedule.structure,
      prepaySchedule,
      totalCostOfCapital: Math.round(fiveYearCost),
      tags,
      pppAllowed: pppCheck.allowed,
      pppStateNote: pppCheck.legalWarning || pppCheck.reason,
      ioRecastWarning,
    });
  }

  options.sort((a, b) => {
    if (a.track1DSCR >= 1.0 && b.track1DSCR < 1.0) return -1;
    if (b.track1DSCR >= 1.0 && a.track1DSCR < 1.0) return 1;
    return a.fiveYearCost - b.fiveYearCost;
  });

  return options;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function riskRank(risk: 'LOW' | 'MODERATE' | 'HIGH'): number {
  switch (risk) {
    case 'LOW': return 1;
    case 'MODERATE': return 2;
    case 'HIGH': return 3;
  }
}

function buildDefaultFix(currentDSCR: number, targetDSCR: number): RescueFix {
  return {
    action: 'No fix available',
    description: `Current DSCR ${currentDSCR.toFixed(2)} does not meet target ${targetDSCR.toFixed(2)}. No single fix identified — consider combination approaches.`,
    amount: 0,
    track1Impact: 0,
    track2Impact: 0,
    cashOnCashImpact: 0,
    risk: 'HIGH' as const,
    cost: 0,
    lenderConfirmation: true,
  };
}

// Track 2 net-income factor: 1 - 8% vacancy - 8% mgmt - 5% maint.
// Matches engine.ts's buildTrack2 flat-8%-vacancy convention for LTR/STR/MTR alike
// ("LTR vacancy: 8%, STR vacancy: 8%, MTR: 8% (standardized to 8%)").
const TRACK2_NET_FACTOR = 0.79;

function computeTrack2DSCR(grossRent: number, pitia: number): number {
  const vacancy = 0.08;
  const management = 0.08;
  const maintenance = 0.05;
  const netIncome = grossRent * (1 - vacancy - management - maintenance);
  return pitia > 0 ? netIncome / pitia : 0;
}

function solveMaxLoanAtDSCR(
  targetDSCR: number,
  rate: number,
  termMonths: number,
  ioPeriod: string,
  fixedExpenses: number,
  qualifyingRent: number,
): number {
  const maxPITIA = qualifyingRent / targetDSCR;
  const maxPI = maxPITIA - fixedExpenses;
  if (maxPI <= 0) return 0;

  const isIO = ioPeriod !== 'NONE';
  if (isIO) {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate <= 0) return 0;
    return maxPI / monthlyRate;
  }

  const r = rate / 100 / 12;
  if (r === 0) return maxPI * termMonths;
  const compoundFactor = Math.pow(1 + r, termMonths);
  const factor = (r * compoundFactor) / (compoundFactor - 1);
  return maxPI / factor;
}

function solveDealBreakRateFromPI(
  loanAmount: number,
  termMonths: number,
  targetPI: number,
  ioPeriod: string = 'NONE',
): number {
  if (targetPI <= 0) return 0;

  const isIO = ioPeriod !== 'NONE';
  if (isIO) {
    // IO: targetPI = loanAmount * rate/12 → rate = targetPI * 12 / loanAmount * 100
    // Mirrors engine.ts's solveDealBreakRate IO branch (bug audit: this local
    // fork previously always ran the amortizing bisection, even for IO loans).
    return Math.round((targetPI * 12 / loanAmount) * 100 * 100) / 100;
  }

  let lowRate = 2.0;
  let highRate = 15.0;

  for (let i = 0; i < 50; i++) {
    const midRate = (lowRate + highRate) / 2;
    const pi = calculatePI(loanAmount, midRate, termMonths);
    if (pi > targetPI) {
      highRate = midRate;
    } else {
      lowRate = midRate;
    }
  }

  return Math.round((lowRate + highRate) / 2 * 100) / 100;
}

function computeFiveYearCost(
  loanAmount: number,
  rate: number,
  monthlyPayment: number,
  closingCosts: number,
  pppExitCost: number,
  isIO: boolean,
  termYears: number,
  pointsCost: number = 0,
  lenderFees: number = 0,
  brokerFees: number = 0,
  rateLockCost: number = 0,
  pppPremiumFee: number = 0,
): number {
  const monthlyRate = rate / 100 / 12;
  let balance = loanAmount;
  let totalInterest = 0;

  if (isIO) {
    const ioPayment = loanAmount * monthlyRate;
    totalInterest = ioPayment * 60;
  } else {
    for (let i = 0; i < 60; i++) {
      const interestPortion = balance * monthlyRate;
      const principalPortion = monthlyPayment - interestPortion;
      totalInterest += interestPortion;
      balance -= principalPortion;
      if (balance < 0) break;
    }
  }

  // Five-year cost = interest + points + lender fees + broker fees + rate lock
  // + closing costs + PPP fee premium + PPP exit cost.
  return (
    totalInterest +
    pointsCost +
    lenderFees +
    brokerFees +
    rateLockCost +
    closingCosts +
    pppPremiumFee +
    pppExitCost
  );
}

