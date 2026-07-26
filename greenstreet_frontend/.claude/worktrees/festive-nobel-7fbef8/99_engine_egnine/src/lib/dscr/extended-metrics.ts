import { monthlyPayment } from './math';

// ============================================================================
// EXTENDED FINANCIAL METRICS — Appendix A Data Dictionary
// ============================================================================
// Implements the full set of metrics required by the v5.0 Appendix:
//   - Debt Yield (NOI / Loan)
//   - Loan Constant (Annual DS / Principal)
//   - IRR Levered & Unlevered
//   - NPV Levered
//   - Coverage Ratio at Maturity (balloon scenario)
//   - Total Interest Paid over term
//   - Remaining Balance at Year N
//   - Weighted Average DSCR
//   - Holding Period trajectory (1-30 years)
// ============================================================================

export interface ExtendedMetricsInput {
  loanAmount: number;
  annualRatePct: number;
  amortMonths: number;
  termMonths: number; // actual loan term (may be < amortMonths for balloon)
  interestOnlyMonths: number;
  annualNoi: number;
  noiGrowthRatePct: number; // annual NOI growth
  annualOpex: number;
  purchasePrice: number;
  appraisedValue: number;
  discountRatePct: number; // for NPV (default 8%)
  holdYears: number; // holding period for IRR
  exitCapRatePct: number; // exit cap rate for terminal value
  saleCostsPct: number; // selling costs as % of sale price (default 6%)
  annualCapex: number; // capital expenditures
  incomeTaxRatePct: number; // for levered IRR (default 0 — pre-tax)
}

export interface ExtendedMetrics {
  debtYield: number; // NOI / Loan
  loanConstant: number; // Annual DS / Principal
  breakevenOccupancy: number; // OpEx + DS / Gross Scheduled Rent
  cashOnCashYear1: number;
  irrUnlevered: number;
  irrLevered: number;
  npvLevered: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  remainingBalanceAtTerm: number;
  coverageRatioAtMaturity: number; // DSCR at loan maturity (balloon scenario)
  weightedAvgDscr: number;
  // Holding period trajectory
  holdingTrajectory: {
    year: number;
    dscr: number;
    cashFlow: number;
    remainingBalance: number;
    propertyValue: number;
    equity: number;
  }[];
  // Sale metrics
  salePriceAtExit: number;
  saleNetProceeds: number;
  leveredEquityAtExit: number;
}

// ---------------------------------------------------------------------------
// AMORTIZATION SCHEDULE — needed for total interest, remaining balance
// ---------------------------------------------------------------------------

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
}

export function buildAmortizationSchedule(
  loanAmount: number,
  annualRatePct: number,
  amortMonths: number,
  interestOnlyMonths: number = 0
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  const r = annualRatePct / 100 / 12;
  const ioPmt = (loanAmount * (annualRatePct / 100)) / 12;
  const amortPmt = monthlyPayment(loanAmount, annualRatePct, amortMonths);
  const postRecastAmortMonths = Math.max(1, amortMonths - interestOnlyMonths);
  const recastPmt = interestOnlyMonths > 0
    ? monthlyPayment(loanAmount, annualRatePct, postRecastAmortMonths)
    : amortPmt;

  for (let m = 1; m <= amortMonths; m++) {
    const isIo = m <= interestOnlyMonths;
    const pmt = isIo ? ioPmt : recastPmt;
    const interest = balance * r;
    const principal = isIo ? 0 : Math.max(0, pmt - interest);
    balance = Math.max(0, balance - principal);

    schedule.push({
      month: m,
      payment: Math.round(pmt * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      remainingBalance: Math.round(balance * 100) / 100,
    });
  }
  return schedule;
}

// ---------------------------------------------------------------------------
// XIRR — for irregular cash flows (year-by-year with terminal sale)
// ---------------------------------------------------------------------------

function xnpv(rate: number, cashflows: { date: Date; amount: number }[]): number {
  const t0 = cashflows[0].date.getTime();
  return cashflows.reduce((sum, cf) => {
    const days = (cf.date.getTime() - t0) / (1000 * 60 * 60 * 24);
    return sum + cf.amount / Math.pow(1 + rate, days / 365);
  }, 0);
}

export function xirr(cashflows: { date: Date; amount: number }[], guess: number = 0.1): number {
  if (cashflows.length < 2) return 0;
  // Bisection for robustness — avoids Newton-Raphson divergence on extreme cash flows
  let lo = -0.99;
  let hi = 10.0;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const npv = xnpv(mid, cashflows);
    if (Math.abs(npv) < 1) return mid;
    if (npv > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------
// MAIN METRICS CALCULATOR
// ---------------------------------------------------------------------------

export function calculateExtendedMetrics(input: ExtendedMetricsInput): ExtendedMetrics {
  // Build amortization schedule
  const schedule = buildAmortizationSchedule(
    input.loanAmount,
    input.annualRatePct,
    input.amortMonths,
    input.interestOnlyMonths
  );

  // Annual debt service (year 1)
  const year1Rows = schedule.slice(0, 12);
  const annualDebtServiceY1 = year1Rows.reduce((s, r) => s + r.payment, 0);

  // Total interest paid over the LOAN TERM (not full amortization if balloon)
  const termRows = schedule.slice(0, Math.min(input.termMonths, schedule.length));
  const totalInterestPaid = termRows.reduce((s, r) => s + r.interest, 0);
  const totalPrincipalPaid = termRows.reduce((s, r) => s + r.principal, 0);

  // Remaining balance at end of term (balloon amount)
  const remainingBalanceAtTerm = termRows.length > 0
    ? termRows[termRows.length - 1].remainingBalance
    : input.loanAmount;

  // Coverage ratio at maturity (DSCR using projected NOI at maturity year)
  const yearsToMaturity = Math.ceil(input.termMonths / 12);
  const projectedNoiAtMaturity = input.annualNoi * Math.pow(1 + input.noiGrowthRatePct / 100, yearsToMaturity - 1);
  const debtServiceAtMaturity = annualDebtServiceY1; // assume fixed-rate
  const coverageRatioAtMaturity = debtServiceAtMaturity > 0 ? projectedNoiAtMaturity / debtServiceAtMaturity : 0;

  // Debt Yield
  const debtYield = input.loanAmount > 0 ? (input.annualNoi / input.loanAmount) * 100 : 0;

  // Loan Constant (Annual DS / Principal)
  const loanConstant = input.loanAmount > 0 ? (annualDebtServiceY1 / input.loanAmount) * 100 : 0;

  // Cash-on-Cash Year 1
  const year1Noi = input.annualNoi;
  const year1CashFlow = year1Noi - annualDebtServiceY1 - input.annualCapex;
  const year1Equity = input.purchasePrice - input.loanAmount;
  const cashOnCashYear1 = year1Equity > 0 ? (year1CashFlow / year1Equity) * 100 : 0;

  // Breakeven occupancy (annual)
  const grossScheduledRent = input.annualNoi + input.annualOpex; // back out gross rent
  const breakevenOccupancy = grossScheduledRent > 0 ? ((input.annualOpex + annualDebtServiceY1) / grossScheduledRent) * 100 : 0;

  // Weighted Average DSCR (weighted by loan balance)
  // Year-by-year DSCR × year, weighted equally
  let dscrSum = 0;
  let dscrCount = 0;
  for (let y = 1; y <= Math.min(30, Math.floor(input.amortMonths / 12)); y++) {
    const yearNoi = input.annualNoi * Math.pow(1 + input.noiGrowthRatePct / 100, y - 1);
    const yearRows = schedule.slice((y - 1) * 12, y * 12);
    const yearDebtService = yearRows.reduce((s, r) => s + r.payment, 0);
    if (yearDebtService > 0) {
      dscrSum += yearNoi / yearDebtService;
      dscrCount++;
    }
  }
  const weightedAvgDscr = dscrCount > 0 ? dscrSum / dscrCount : 0;

  // Holding period trajectory
  const holdingTrajectory: ExtendedMetrics['holdingTrajectory'] = [];
  for (let y = 1; y <= input.holdYears; y++) {
    const yearNoi = input.annualNoi * Math.pow(1 + input.noiGrowthRatePct / 100, y - 1);
    const yearRows = schedule.slice((y - 1) * 12, y * 12);
    const yearDebtService = yearRows.length > 0 ? yearRows.reduce((s, r) => s + r.payment, 0) : 0;
    const yearCashFlow = yearNoi - yearDebtService - input.annualCapex;
    const remainingBalance = yearRows.length > 0 ? yearRows[yearRows.length - 1].remainingBalance : 0;
    const propertyValue = (input.annualNoi * Math.pow(1 + input.noiGrowthRatePct / 100, y)) / (input.exitCapRatePct / 100);
    const equity = propertyValue - remainingBalance;
    const dscr = yearDebtService > 0 ? yearNoi / yearDebtService : 0;

    holdingTrajectory.push({
      year: y,
      dscr: Math.round(dscr * 1000) / 1000,
      cashFlow: Math.round(yearCashFlow),
      remainingBalance: Math.round(remainingBalance),
      propertyValue: Math.round(propertyValue),
      equity: Math.round(equity),
    });
  }

  // Sale at exit (end of hold period)
  const finalYearNoi = input.annualNoi * Math.pow(1 + input.noiGrowthRatePct / 100, input.holdYears);
  const salePriceAtExit = finalYearNoi / (input.exitCapRatePct / 100);
  const saleCosts = salePriceAtExit * (input.saleCostsPct / 100);
  const remainingBalanceAtExit = holdingTrajectory[holdingTrajectory.length - 1]?.remainingBalance ?? 0;
  const saleNetProceeds = salePriceAtExit - saleCosts - remainingBalanceAtExit;
  const leveredEquityAtExit = saleNetProceeds;

  // IRR — unlevered (no debt service, just NOI - capex + sale proceeds)
  // Use a FIXED date (epoch) to avoid SSR hydration mismatch from new Date()
  const unleveredCashflows: { date: Date; amount: number }[] = [];
  const startDate = new Date(0); // epoch — deterministic across server/client
  unleveredCashflows.push({ date: startDate, amount: -input.purchasePrice });
  for (let y = 1; y <= input.holdYears; y++) {
    const yearNoi = input.annualNoi * Math.pow(1 + input.noiGrowthRatePct / 100, y - 1);
    const yearCashFlow = yearNoi - input.annualCapex;
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + y);
    // Add sale proceeds in final year
    if (y === input.holdYears) {
      unleveredCashflows.push({ date, amount: yearCashFlow + salePriceAtExit - saleCosts });
    } else {
      unleveredCashflows.push({ date, amount: yearCashFlow });
    }
  }
  const irrUnlevered = xirr(unleveredCashflows) * 100;

  // IRR — levered (debt service, equity investment, sale net of loan payoff)
  const leveredCashflows: { date: Date; amount: number }[] = [];
  leveredCashflows.push({ date: startDate, amount: -(input.purchasePrice - input.loanAmount) });
  for (let y = 1; y <= input.holdYears; y++) {
    const yearNoi = input.annualNoi * Math.pow(1 + input.noiGrowthRatePct / 100, y - 1);
    const yearRows = schedule.slice((y - 1) * 12, y * 12);
    const yearDebtService = yearRows.length > 0 ? yearRows.reduce((s, r) => s + r.payment, 0) : 0;
    const yearCashFlow = yearNoi - yearDebtService - input.annualCapex;
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + y);
    if (y === input.holdYears) {
      leveredCashflows.push({ date, amount: yearCashFlow + saleNetProceeds });
    } else {
      leveredCashflows.push({ date, amount: yearCashFlow });
    }
  }
  const irrLevered = xirr(leveredCashflows) * 100;

  // NPV Levered (discount the levered cashflows at discount rate)
  const npvLevered = xnpv(input.discountRatePct / 100, leveredCashflows);

  return {
    debtYield: Math.round(debtYield * 100) / 100,
    loanConstant: Math.round(loanConstant * 100) / 100,
    breakevenOccupancy: Math.round(Math.min(200, breakevenOccupancy) * 100) / 100,
    cashOnCashYear1: Math.round(cashOnCashYear1 * 100) / 100,
    irrUnlevered: Math.round(irrUnlevered * 100) / 100,
    irrLevered: Math.round(irrLevered * 100) / 100,
    npvLevered: Math.round(npvLevered),
    totalInterestPaid: Math.round(totalInterestPaid),
    totalPrincipalPaid: Math.round(totalPrincipalPaid),
    remainingBalanceAtTerm: Math.round(remainingBalanceAtTerm),
    coverageRatioAtMaturity: Math.round(coverageRatioAtMaturity * 1000) / 1000,
    weightedAvgDscr: Math.round(weightedAvgDscr * 1000) / 1000,
    holdingTrajectory,
    salePriceAtExit: Math.round(salePriceAtExit),
    saleNetProceeds: Math.round(saleNetProceeds),
    leveredEquityAtExit: Math.round(leveredEquityAtExit),
  };
}
