// ============================================================
// DSCR Deal Desk v11.0 — Pre-Tax Returns Engine
// Part B: Cap Rate, CoC, Debt Yield, Levered IRR + Exit Model
//         48-cell Hold Matrix
// ============================================================
//
// KEY DEFINITIONS (per Part B):
//   EGI = GPR × (1 - Vacancy)
//   OpEx = Mgmt + Maint + Tax + Ins + HOA + Util + Turnover (NO debt, NO capex)
//   NOI = EGI - OpEx
//   ADS = P&I × 12
//   CapEx reserve = 5-8% EGI (modeled separately)
//
//   Cap Rate = NOI / Price
//   Yield-on-Cost = Stabilized NOI / Total Cost
//   CoC = (NOI - ADS) / Cash Invested
//   Debt Yield = NOI / Loan
//   Break-even Occupancy = (OpEx + ADS) / GPR
//   Equity Multiple = Total Distributions / Equity Invested
//   DSCR-at-Stabilization = Stabilized NOI / ADS
//
// LEVERED IRR + EXIT MODEL:
//   m0: -CashInvested
//   m1..n: (NOI/12 - P&I)
//   mn: +[ExitNOI/ExitCap - SellingCosts - RemainingBalance - Prepay]
// ============================================================

import type { ReturnsResult, HoldMatrixCell, PropertyInputs, LoanStructure } from './types';
import { calculatePI } from './engine';
import { computeXIRR } from './taxEngine';

// Default operating expense ratios (Track 2 / Investor model)
const DEFAULT_VACANCY_LT_PCT = 8;
const DEFAULT_MGMT_PCT = 8;
const DEFAULT_MAINT_PCT = 5;
const DEFAULT_CAPEX_RESERVE_PCT = 5; // 5% of EGI (low end of 5-8% range)
const DEFAULT_TURNOVER_PCT = 2;      // 2% of GPR

// Default hold scenarios for matrix
const HOLD_PERIODS = [3, 5, 7, 10];
const EXIT_CAP_SCENARIOS = [-0.50, 0, 0.50]; // ±50 bps around base, plus base
const RENT_GROWTH_SCENARIOS = [0, 1, 2, 3]; // %

function ioPeriodMonths(ioPeriod: LoanStructure['ioPeriod']): number {
  if (ioPeriod === '5_YR') return 60;
  if (ioPeriod === '7_YR') return 84;
  if (ioPeriod === '10_YR') return 120;
  return 0;
}

function monthlyDebtService(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
  paymentMonth: number,
  interestOnlyMonths: number,
): number {
  if (paymentMonth > termMonths) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (paymentMonth <= interestOnlyMonths) return loanAmount * monthlyRate;
  return calculatePI(loanAmount, annualRate, Math.max(1, termMonths - interestOnlyMonths));
}

function annualDebtServiceForYear(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
  year: number,
  interestOnlyMonths: number,
): number {
  let total = 0;
  for (let month = (year - 1) * 12 + 1; month <= year * 12; month++) {
    total += monthlyDebtService(loanAmount, annualRate, termMonths, month, interestOnlyMonths);
  }
  return total;
}

function requirePositiveExitCap(exitCapRatePct: number): void {
  if (!Number.isFinite(exitCapRatePct) || exitCapRatePct <= 0) {
    throw new RangeError('Exit cap rate must be a finite number greater than zero.');
  }
}

/**
 * Compute full pre-tax returns stack including levered IRR + 48-cell hold matrix.
 *
 * @param property - PropertyInputs (purchase price, taxes, insurance, etc.)
 * @param loan - LoanStructure (LTV, term, points, fees)
 * @param grossRentMonthly - gross potential rent (GPR) monthly
 * @param strategy - rental strategy (LTR/STR/MTR) — drives vacancy
 * @param solvedRate - the engine-solved rate (or quoted rate)
 * @param prepayPenaltyAtExit - $ penalty at expected exit
 */
export function computeReturns(
  property: PropertyInputs,
  loan: LoanStructure,
  grossRentMonthly: number,
  strategy: 'LTR' | 'STR' | 'MTR',
  solvedRate: number,
  prepayPenaltyAtExit: number = 0,
  cashInvestedOverride?: number,
): ReturnsResult {
  const purchasePrice = property.purchasePrice;
  const loanAmount = purchasePrice * (loan.ltv / 100);
  const closingCosts =
    loanAmount * (loan.points / 100) +
    loan.lenderFees +
    loan.brokerFees +
    loan.rateLockCost;
  const cashInvested = cashInvestedOverride ?? (purchasePrice - loanAmount + closingCosts);

  // Operating expenses
  const vacancyPct = strategy === 'STR' ? 25 : strategy === 'MTR' ? 12 : DEFAULT_VACANCY_LT_PCT;
  const gprMonthly = grossRentMonthly;
  const egiMonthly = gprMonthly * (1 - vacancyPct / 100);
  const egiAnnual = egiMonthly * 12;

  const mgmtAnnual = gprMonthly * 12 * (DEFAULT_MGMT_PCT / 100);
  const maintAnnual = gprMonthly * 12 * (DEFAULT_MAINT_PCT / 100);
  const turnoverAnnual = gprMonthly * 12 * (DEFAULT_TURNOVER_PCT / 100);
  const taxAnnual = property.annualTaxes;
  const insAnnual = property.annualInsurance;
  const hoaAnnual = property.hoa * 12;
  const floodAnnual = property.floodInsurance;

  const totalOpEx = mgmtAnnual + maintAnnual + turnoverAnnual + taxAnnual + insAnnual + hoaAnnual + floodAnnual;
  const noi = egiAnnual - totalOpEx;
  const capExReserveAnnual = egiAnnual * (DEFAULT_CAPEX_RESERVE_PCT / 100);

  // Debt service
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
  const termMonths = termYears * 12;
  const interestOnlyMonths = ioPeriodMonths(loan.ioPeriod);
  const piMonthly = monthlyDebtService(loanAmount, solvedRate, termMonths, 1, interestOnlyMonths);
  const piAnnual = annualDebtServiceForYear(loanAmount, solvedRate, termMonths, 1, interestOnlyMonths);
  const ads = piAnnual;

  // Returns
  const entryCapRate = noi / purchasePrice;
  const yieldOnCost = noi / (purchasePrice + loan.lenderFees + loan.brokerFees); // simplified total cost
  const year1CashOnCash = (noi - capExReserveAnnual - ads) / cashInvested;
  const debtYield = noi / loanAmount;
  const breakEvenOccupancy = (totalOpEx + ads) / (gprMonthly * 12);

  // Hold period for IRR (use expectedHoldYears)
  const holdYears = Math.max(1, Math.floor(loan.expectedHoldYears));

  // Exit model
  const rentGrowthDefault = 0.02; // 2% baseline
  const exitCapRatePct = 0.065; // 6.5% default base cap
  const exitValue = (noi * Math.pow(1 + rentGrowthDefault, holdYears)) / (exitCapRatePct);
  const exitSellingCosts = exitValue * 0.06; // 6% typical
  const remainingLoanBalance = computeRemainingBalance(
    loanAmount,
    solvedRate,
    termMonths,
    holdYears * 12,
    interestOnlyMonths,
  );
  const netExitProceeds = exitValue - exitSellingCosts - remainingLoanBalance - prepayPenaltyAtExit;

  // Equity multiple
  let totalOperatingCashFlow = 0;
  for (let yr = 1; yr <= holdYears; yr++) {
    const growth = Math.pow(1 + rentGrowthDefault, yr - 1);
    totalOperatingCashFlow +=
      noi * growth -
      capExReserveAnnual * growth -
      annualDebtServiceForYear(loanAmount, solvedRate, termMonths, yr, interestOnlyMonths);
  }
  const totalDistributions = totalOperatingCashFlow + netExitProceeds;
  const equityMultiple = totalDistributions / cashInvested;

  // Levered IRR
  const cashFlows: { time: number; amount: number }[] = [
    { time: 0, amount: -cashInvested },
  ];
  for (let yr = 1; yr <= holdYears; yr++) {
    const growth = Math.pow(1 + rentGrowthDefault, yr - 1);
    const yearCashFlow =
      noi * growth -
      capExReserveAnnual * growth -
      annualDebtServiceForYear(loanAmount, solvedRate, termMonths, yr, interestOnlyMonths);
    cashFlows.push({ time: yr, amount: yearCashFlow });
  }
  // Replace last year with last-year-CF + exit proceeds
  cashFlows[cashFlows.length - 1].amount += netExitProceeds;

  const leveredIRR = computeXIRR(cashFlows);

  // Unlevered IRR (no debt)
  const unleveredCashFlows: { time: number; amount: number }[] = [
    { time: 0, amount: -purchasePrice },
  ];
  for (let yr = 1; yr <= holdYears; yr++) {
    const growth = Math.pow(1 + rentGrowthDefault, yr - 1);
    unleveredCashFlows.push({
      time: yr,
      amount: noi * growth - capExReserveAnnual * growth,
    });
  }
  const unleveredExit = exitValue - exitSellingCosts;
  unleveredCashFlows[unleveredCashFlows.length - 1].amount += unleveredExit;
  const unleveredIRR = computeXIRR(unleveredCashFlows);

  // Monthly ADS breakdown (principal vs interest) — Year 1
  const monthlyInterestY1 = loanAmount * (solvedRate / 100 / 12);
  const monthlyPrincipalY1 = interestOnlyMonths > 0 ? 0 : piMonthly - monthlyInterestY1;

  // 48-cell hold matrix: 4 holds × 3 exit caps scenarios × 4 rent growths
  const holdMatrix = computeHoldMatrix(
    cashInvested,
    loanAmount,
    solvedRate,
    termMonths,
    noi,
    rentGrowthDefault,
    exitCapRatePct,
    prepayPenaltyAtExit,
    capExReserveAnnual,
    interestOnlyMonths,
  );

  return {
    entryCapRate: Math.round(entryCapRate * 10000) / 100,  // as percentage, 2 decimals
    yieldOnCost: Math.round(yieldOnCost * 10000) / 100,
    year1CashOnCash: Math.round(year1CashOnCash * 10000) / 100,
    debtYield: Math.round(debtYield * 10000) / 100,
    breakEvenOccupancy: Math.round(breakEvenOccupancy * 1000) / 10,
    equityMultiple: Math.round(equityMultiple * 100) / 100,
    leveredIRR: Math.round(leveredIRR * 1000) / 10, // as percentage, 1 decimal
    unleveredIRR: Math.round(unleveredIRR * 1000) / 10,
    exitYear: holdYears,
    exitCapRate: exitCapRatePct * 100,
    exitValue: Math.round(exitValue),
    exitSellingCosts: Math.round(exitSellingCosts),
    remainingLoanBalance: Math.round(remainingLoanBalance),
    prepayPenaltyAtExit: Math.round(prepayPenaltyAtExit),
    netExitProceeds: Math.round(netExitProceeds),
    holdMatrix,
    capExReservePct: DEFAULT_CAPEX_RESERVE_PCT,
    monthlyAdsBreakdown: {
      principal: Math.round(monthlyPrincipalY1),
      interest: Math.round(monthlyInterestY1),
      total: Math.round(piMonthly),
    },
    note: `Returns computed on Track 2 income (after vacancy/mgmt/maint). Exit cap ${exitCapRatePct * 100}% (sensitivity ±50-150bps). ` +
          `CapEx reserve ${DEFAULT_CAPEX_RESERVE_PCT}% EGI. Pre-tax IRR — for after-tax see taxEngine. ` +
          `IRR is highly sensitive to EXIT CAP — the most fragile input in every model.`,
  };
}

// ============================================================
// 48-CELL HOLD MATRIX
// ============================================================

/**
 * Compute 48-cell hold matrix:
 *   4 hold periods (3/5/7/10 yr)
 *   × 3 exit cap scenarios (base -50bps, base, base +50bps)
 *   × 4 rent growth rates (0%, 1%, 2%, 3%)
 *
 * Verdict per cell:
 *   ROBUST: IRR ≥ 15% at 0% rent growth (deals work without bull scenarios)
 *   STABLE: IRR ≥ 12% at base cap + 1% rent growth
 *   CONDITIONAL: IRR ≥ 10% at base cap + 2% rent growth
 *   FRAGILE: IRR ≥ 8% only with 3% rent growth OR requires cap compression
 *   BROKEN: IRR < 8% in all scenarios
 */
export function computeHoldMatrix(
  cashInvested: number,
  loanAmount: number,
  rate: number,
  termMonths: number,
  year1NOI: number,
  rentGrowthBaseline: number,
  baseExitCapPct: number, // e.g., 0.065
  prepayPenaltyAtExit: number,
  year1CapExReserve: number = 0,
  interestOnlyMonths: number = 0,
): HoldMatrixCell[][] {
  requirePositiveExitCap(baseExitCapPct * 100);
  const matrix: HoldMatrixCell[][] = [];

  for (const holdYears of HOLD_PERIODS) {
    const row: HoldMatrixCell[] = [];
    for (const rentGrowth of RENT_GROWTH_SCENARIOS) {
      for (const exitCapDelta of EXIT_CAP_SCENARIOS) {
        const exitCap = (baseExitCapPct * 100 + exitCapDelta) / 100;
        const exitNOI = year1NOI * Math.pow(1 + rentGrowth / 100, holdYears);
        const exitValue = exitNOI / exitCap;
        const sellingCosts = exitValue * 0.06;
        const remainingBalance = computeRemainingBalance(
          loanAmount,
          rate,
          termMonths,
          holdYears * 12,
          interestOnlyMonths,
        );
        const netExit = exitValue - sellingCosts - remainingBalance - prepayPenaltyAtExit;

        const cashFlows: { time: number; amount: number }[] = [{ time: 0, amount: -cashInvested }];
        for (let yr = 1; yr <= holdYears; yr++) {
          const yearNOI = year1NOI * Math.pow(1 + rentGrowth / 100, yr - 1);
          const yearCapEx = year1CapExReserve * Math.pow(1 + rentGrowth / 100, yr - 1);
          const piAnnual = annualDebtServiceForYear(
            loanAmount,
            rate,
            termMonths,
            yr,
            interestOnlyMonths,
          );
          cashFlows.push({ time: yr, amount: yearNOI - yearCapEx - piAnnual });
        }
        cashFlows[cashFlows.length - 1].amount += netExit;

        const irr = computeXIRR(cashFlows);
        // FIX (bug audit): Equity Multiple = total distributions / equity invested.
        // Previous code added cashInvested to the numerator, inflating EM by exactly 1.0x
        // (e.g., a true 2.5x EM was reported as 3.5x). Cash flows[1..n] already
        // contain all distributions (operating + exit) — no double-counting needed.
        const equityMultiple = cashFlows.slice(1).reduce((s, cf) => s + cf.amount, 0) / cashInvested;

        const verdict = classifyIRR(irr, rentGrowth, exitCapDelta);

        row.push({
          holdYears,
          rentGrowthPct: rentGrowth,
          exitCapRatePct: Math.round(exitCap * 10000) / 100,
          leveredIRR: Math.round(irr * 1000) / 10,
          afterTaxIRR: Math.round(irr * 0.75 * 1000) / 10, // approximation; full after-tax in taxEngine
          equityMultiple: Math.round(equityMultiple * 100) / 100,
          verdict,
        });
      }
    }
    matrix.push(row);
  }

  return matrix;
}

function classifyIRR(irr: number, rentGrowth: number, exitCapDelta: number): HoldMatrixCell['verdict'] {
  if (irr >= 0.15 && rentGrowth === 0) return 'ROBUST';
  if (irr >= 0.12 && rentGrowth >= 1 && exitCapDelta === 0) return 'STABLE';
  if (irr >= 0.10 && rentGrowth >= 2 && exitCapDelta === 0) return 'CONDITIONAL';
  if (irr >= 0.08 && (rentGrowth >= 3 || exitCapDelta < 0)) return 'FRAGILE';
  return 'BROKEN';
}

// ============================================================
// REMAINING BALANCE (standard amortization)
// ============================================================

export function computeRemainingBalance(
  loanAmount: number,
  annualRate: number,
  totalTermMonths: number,
  monthsElapsed: number,
  interestOnlyMonths: number = 0,
): number {
  if (!Number.isFinite(monthsElapsed) || !Number.isFinite(totalTermMonths) || totalTermMonths <= 0) {
    throw new RangeError('Loan term and elapsed months must be finite, with a positive term.');
  }
  const boundedIO = Math.max(0, Math.min(Math.floor(interestOnlyMonths), totalTermMonths));
  if (monthsElapsed <= boundedIO) return loanAmount;
  if (monthsElapsed >= totalTermMonths) return 0;
  const amortizationTermMonths = totalTermMonths - boundedIO;
  const amortizingMonthsElapsed = monthsElapsed - boundedIO;
  const r = annualRate / 100 / 12;
  if (r === 0) {
    return loanAmount * Math.max(0, 1 - amortizingMonthsElapsed / amortizationTermMonths);
  }

  const factor = Math.pow(1 + r, amortizationTermMonths);
  const elapsed = Math.pow(1 + r, amortizingMonthsElapsed);
  const remaining = loanAmount * (factor - elapsed) / (factor - 1);
  return Math.max(0, remaining);
}

// ============================================================
// EXIT PROCEEDS COMPUTATION (helper)
// ============================================================

export function computeExitProceeds(
  year1NOI: number,
  rentGrowthPct: number,
  holdYears: number,
  exitCapRatePct: number,
  sellingCostsPct: number,
  remainingLoanBalance: number,
  prepayPenalty: number,
): {
  exitValue: number;
  sellingCosts: number;
  netExitProceeds: number;
} {
  requirePositiveExitCap(exitCapRatePct);
  const exitNOI = year1NOI * Math.pow(1 + rentGrowthPct / 100, holdYears);
  const exitValue = exitNOI / (exitCapRatePct / 100);
  const sellingCosts = exitValue * (sellingCostsPct / 100);
  const netExitProceeds = exitValue - sellingCosts - remainingLoanBalance - prepayPenalty;
  return {
    exitValue: Math.round(exitValue),
    sellingCosts: Math.round(sellingCosts),
    netExitProceeds: Math.round(netExitProceeds),
  };
}
