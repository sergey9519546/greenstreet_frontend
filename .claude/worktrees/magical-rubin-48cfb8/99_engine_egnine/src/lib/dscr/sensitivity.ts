// ============================================================================
// SENSITIVITY ANALYSIS — v12.1 (P3-30 missing features)
// ============================================================================
// Two new tools:
//   1. breakEvenTable — what rent, price, rate, LTV each cause DSCR = 1.0/1.1/1.25/1.5
//   2. sensitivityGrid — 2-variable matrix (e.g. rate × LTV) showing DSCR outcomes
// ============================================================================

import { monthlyPayment, interestOnlyPayment } from './math';

export interface BreakEvenTargets {
  // Min rent ($/mo) required to hit each DSCR target at current PITIA
  minRentByDscr: { dscr: number; rent: number }[];
  // Max loan ($) at each DSCR target (fixed rent)
  maxLoanByDscr: { dscr: number; loan: number }[];
  // Max purchase price ($) at each DSCR target (fixed LTV)
  maxPriceByDscr: { dscr: number; price: number }[];
  // Breakeven rate (%) where DSCR = each target (fixed loan/rent)
  breakevenRateByDscr: { dscr: number; rate: number }[];
  // Max LTV (%) at each DSCR target
  maxLtvByDscr: { dscr: number; ltv: number }[];
}

export interface BreakEvenInput {
  currentLoan: number;
  currentValue: number;       // appraised value or purchase price
  currentRate: number;        // annual %
  amortMonths: number;
  interestOnlyMonths: number;
  qualifyingRentMonthly: number;
  taxesMonthly: number;
  insuranceMonthly: number;
  hoaMonthly: number;
}

// ---------------------------------------------------------------------------
// BREAK-EVEN TABLE — for each DSCR target, compute the input that achieves it
// ---------------------------------------------------------------------------
export function calculateBreakEvenTable(input: BreakEvenInput): BreakEvenTargets {
  const { currentLoan, currentValue, currentRate, amortMonths, interestOnlyMonths, qualifyingRentMonthly, taxesMonthly, insuranceMonthly, hoaMonthly } = input;
  const fixedMonthly = taxesMonthly + insuranceMonthly + hoaMonthly;
  const targets = [1.0, 1.1, 1.25, 1.5];

  // 1. Min rent: rent = DSCR × PITIA = DSCR × (P&I + fixed)
  // We need P&I from current loan/rate to compute current PITIA
  const currentPi = interestOnlyMonths > 0
    ? interestOnlyPayment(currentLoan, currentRate)
    : monthlyPayment(currentLoan, currentRate, amortMonths);
  const currentPitia = currentPi + fixedMonthly;
  const minRentByDscr = targets.map(dscr => ({
    dscr,
    rent: Math.round(dscr * currentPitia),
  }));

  // 2. Max loan at each DSCR: solve loan where rent / PITIA = target
  //    PITIA = P(loan, rate) + fixed
  //    rent / target = P(loan, rate) + fixed
  //    P(loan, rate) = rent / target - fixed
  //    For amortizing: loan = P × (1 - (1+r)^-n) / r
  //    For IO: loan = P × 12 / rate
  const maxLoanByDscr = targets.map(dscr => {
    const maxPi = (qualifyingRentMonthly / dscr) - fixedMonthly;
    if (maxPi <= 0) return { dscr, loan: 0 };
    let loan: number;
    if (interestOnlyMonths > 0) {
      loan = currentRate > 0 ? (maxPi * 12) / (currentRate / 100) : 0;
    } else {
      const r = currentRate / 100 / 12;
      loan = r > 0 ? (maxPi * (1 - Math.pow(1 + r, -amortMonths))) / r : maxPi * amortMonths;
    }
    return { dscr, loan: Math.round(loan) };
  });

  // 3. Max purchase price at each DSCR — assume LTV stays constant
  //    Max loan at target DSCR ÷ current LTV = max price
  const currentLtv = currentValue > 0 ? (currentLoan / currentValue) * 100 : 0;
  const maxPriceByDscr = maxLoanByDscr.map(({ dscr, loan }) => ({
    dscr,
    price: currentLtv > 0 ? Math.round((loan / currentLtv) * 100) : 0,
  }));

  // 4. Breakeven rate — bisection on rate where DSCR = target
  const breakevenRateByDscr = targets.map(dscr => {
    const targetPitia = qualifyingRentMonthly / dscr;
    const targetPi = targetPitia - fixedMonthly;
    if (targetPi <= 0) return { dscr, rate: NaN };

    // Bisection: find rate where P(loan, rate) = targetPi
    let lo = 0, hi = 25, mid = 0;
    for (let i = 0; i < 100; i++) {
      mid = (lo + hi) / 2;
      const pi = interestOnlyMonths > 0
        ? interestOnlyPayment(currentLoan, mid)
        : monthlyPayment(currentLoan, mid, amortMonths);
      if (Math.abs(pi - targetPi) < 0.01) return { dscr, rate: Math.round(mid * 1000) / 1000 };
      if (pi > targetPi) hi = mid; else lo = mid;
    }
    return { dscr, rate: Math.round(mid * 1000) / 1000 };
  });

  // 5. Max LTV at each DSCR — assume rate stays constant, vary loan to hit DSCR
  //    Max loan we already have; max LTV = max loan / value × 100
  const maxLtvByDscr = maxLoanByDscr.map(({ dscr, loan }) => ({
    dscr,
    ltv: currentValue > 0 ? Math.round((loan / currentValue) * 1000) / 10 : 0,
  }));

  return {
    minRentByDscr,
    maxLoanByDscr,
    maxPriceByDscr,
    breakevenRateByDscr,
    maxLtvByDscr,
  };
}

// ---------------------------------------------------------------------------
// 2-VARIABLE SENSITIVITY GRID — DSCR outcomes across 2 variables
// ---------------------------------------------------------------------------
export type SensitivityVariable = 'rate' | 'ltv' | 'rent' | 'vacancy' | 'insurance' | 'taxes';

export interface SensitivityGridInput {
  base: {
    loan: number;
    value: number;
    rate: number;
    amortMonths: number;
    interestOnlyMonths: number;
    rent: number;
    taxes: number;
    insurance: number;
    hoa: number;
    vacancyPct: number;
  };
  xVariable: SensitivityVariable;
  xValues: number[];            // e.g. [6.5, 7.0, 7.5, 8.0, 8.5] for rate
  yVariable: SensitivityVariable;
  yValues: number[];            // e.g. [70, 75, 80] for ltv
}

export interface SensitivityGridResult {
  xVariable: SensitivityVariable;
  yVariable: SensitivityVariable;
  xValues: number[];
  yValues: number[];
  // grid[y][x] = DSCR at yValues[y], xValues[x]
  grid: number[][];
}

export function calculateSensitivityGrid(input: SensitivityGridInput): SensitivityGridResult {
  const { base, xVariable, xValues, yVariable, yValues } = input;
  const grid: number[][] = [];

  for (const yVal of yValues) {
    const row: number[] = [];
    for (const xVal of xValues) {
      // Apply x and y overrides to base
      const rate = xVariable === 'rate' ? xVal : yVariable === 'rate' ? yVal : base.rate;
      const ltvPct = xVariable === 'ltv' ? xVal : yVariable === 'ltv' ? yVal : (base.loan / base.value) * 100;
      const loan = (ltvPct / 100) * base.value;
      const rent = xVariable === 'rent' ? xVal : yVariable === 'rent' ? yVal : base.rent;
      const vacancyPct = xVariable === 'vacancy' ? xVal : yVariable === 'vacancy' ? yVal : base.vacancyPct;
      const taxes = xVariable === 'taxes' ? xVal : yVariable === 'taxes' ? yVal : base.taxes;
      const insurance = xVariable === 'insurance' ? xVal : yVariable === 'insurance' ? yVal : base.insurance;

      // v13.2: Clamp rate to [0, 25] to prevent monthlyPayment from throwing on negative rates
      const safeRate = Math.max(0, Math.min(25, rate));
      const pi = base.interestOnlyMonths > 0
        ? interestOnlyPayment(loan, safeRate)
        : monthlyPayment(loan, safeRate, base.amortMonths);
      const pitia = pi + taxes + insurance + base.hoa;
      const effectiveRent = rent * (1 - vacancyPct / 100);
      const dscr = pitia > 0 ? effectiveRent / pitia : Infinity;
      row.push(Math.round(dscr * 1000) / 1000);
    }
    grid.push(row);
  }

  return { xVariable, yVariable, xValues, yValues, grid };
}
