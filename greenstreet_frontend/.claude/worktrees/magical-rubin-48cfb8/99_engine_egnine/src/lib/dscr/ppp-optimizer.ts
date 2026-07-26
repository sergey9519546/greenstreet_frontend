// ============================================================================
// PPP (PREPAYMENT PENALTY) OPTIMIZER
// ============================================================================
// Implements three prepayment models from v5.0 Spec Module 4:
//   1. Yield Maintenance — PV of remaining payments at Treasury + spread
//   2. Step-Down (3-2-1%) — 3% year 1, 2% year 2, 1% year 3, 0% thereafter
//   3. Soft Prepayment — penalty only if refinanced within N months
//
// Optimizer: Enumerates 12-60 month hold periods × 10 prepayment amounts.
// Outputs ranked strategy list with total cost of capital.
// ============================================================================

export type PppModelType = 'yield_maintenance' | 'step_down_321' | 'step_down_54321' | 'step_down_3yr' | 'soft_5yr' | 'soft_1yr' | 'none';

export interface PppModel {
  type: PppModelType;
  name: string;
  description: string;
}

export const PPP_MODELS: PppModel[] = [
  { type: 'none', name: 'No Prepay Penalty', description: 'Free to refinance anytime — usually 12.5-25 bps higher rate' },
  { type: 'soft_1yr', name: 'Soft 1-Year', description: '1% penalty if refinanced in year 1 only; free after' },
  { type: 'soft_5yr', name: 'Soft 5-Year', description: 'Penalty if refinanced within 5 years; usually 5% declining to 1%' },
  { type: 'step_down_321', name: 'Step-Down 3-2-1%', description: '3% year 1, 2% year 2, 1% year 3, 0% thereafter' },
  { type: 'step_down_54321', name: 'Step-Down 5-4-3-2-1%', description: '5% year 1, declining 1% per year to 0% in year 6' },
  { type: 'step_down_3yr', name: 'Step-Down 3-Year', description: '3% year 1, 2% year 2, 1% year 3, 0% thereafter (same as 3-2-1)' },
  { type: 'yield_maintenance', name: 'Yield Maintenance', description: 'PV of remaining interest payments at Treasury + spread' },
];

// ---------------------------------------------------------------------------
// Calculate prepayment penalty for a given payoff month
// ---------------------------------------------------------------------------

export function calculatePppPenalty(
  model: PppModelType,
  loanBalanceAtPayoff: number,
  originalLoanAmount: number,
  payoffMonth: number, // months from origination
  interestRate: number, // annual %
  treasuryRate: number = 4.5, // annual %
  remainingTermMonths: number = 360
): { penalty: number; penaltyPct: number; explanation: string } {
  if (payoffMonth <= 0) {
    return { penalty: 0, penaltyPct: 0, explanation: 'No payoff — no penalty' };
  }

  const payoffYear = Math.ceil(payoffMonth / 12);

  switch (model) {
    case 'none':
      return { penalty: 0, penaltyPct: 0, explanation: 'No prepay penalty — free to refinance' };

    case 'soft_1yr':
      if (payoffYear <= 1) {
        const penalty = originalLoanAmount * 0.01;
        return { penalty, penaltyPct: 1.0, explanation: `1% soft prepay in year 1` };
      }
      return { penalty: 0, penaltyPct: 0, explanation: `Soft prepay expired after year 1` };

    case 'soft_5yr': {
      // 5% year 1, declining 1% per year to 1% year 5
      if (payoffYear > 5) {
        return { penalty: 0, penaltyPct: 0, explanation: `Soft prepay expired after year 5` };
      }
      const pct = Math.max(1, 6 - payoffYear); // 5,4,3,2,1
      const penalty = originalLoanAmount * (pct / 100);
      return { penalty, penaltyPct: pct, explanation: `${pct}% soft prepay in year ${payoffYear}` };
    }

    case 'step_down_321':
    case 'step_down_3yr': {
      if (payoffYear > 3) {
        return { penalty: 0, penaltyPct: 0, explanation: `Step-down prepay expired after year 3` };
      }
      const pct = 4 - payoffYear; // 3, 2, 1
      const penalty = loanBalanceAtPayoff * (pct / 100);
      return { penalty, penaltyPct: pct, explanation: `${pct}% step-down in year ${payoffYear}` };
    }

    case 'step_down_54321': {
      if (payoffYear > 5) {
        return { penalty: 0, penaltyPct: 0, explanation: `Step-down prepay expired after year 5` };
      }
      const pct = 6 - payoffYear; // 5, 4, 3, 2, 1
      const penalty = loanBalanceAtPayoff * (pct / 100);
      return { penalty, penaltyPct: pct, explanation: `${pct}% step-down in year ${payoffYear}` };
    }

    case 'yield_maintenance': {
      // v15: Proper Yield Maintenance formula (industry standard).
      // YM = max(0, Σ[t=1..N] ((loanRate − reinvestmentRate) × balance / 12) / (1 + reinvestmentRate/12)^t)
      // This sums the MONTHLY payment differential and discounts each monthly cash flow.
      // Previous formula used an annuity factor approximation that was off by 10-20%.
      const rateDiff = (interestRate - treasuryRate) / 100;
      if (rateDiff <= 0) {
        return { penalty: 0, penaltyPct: 0, explanation: `No YM — loan rate ≤ Treasury rate` };
      }

      const monthlyRateDiff = (interestRate - treasuryRate) / 100 / 12;
      const monthlyTreasury = treasuryRate / 100 / 12;
      const remainingMonths = remainingTermMonths;

      // Sum the PV of each month's payment differential
      let penalty = 0;
      for (let t = 1; t <= remainingMonths; t++) {
        const monthlyDiff = (loanBalanceAtPayoff * (interestRate / 100 / 12))
                          - (loanBalanceAtPayoff * (treasuryRate / 100 / 12));
        penalty += monthlyDiff / Math.pow(1 + monthlyTreasury, t);
      }

      // YM penalty cannot be negative (max(0, ...))
      penalty = Math.max(0, penalty);
      const penaltyPct = (penalty / loanBalanceAtPayoff) * 100;
      return {
        penalty: Math.round(penalty),
        penaltyPct: Math.round(penaltyPct * 100) / 100,
        explanation: `YM: PV of ${(interestRate - treasuryRate).toFixed(2)}% × balance × ${remainingMonths}mo at ${treasuryRate}% Treasury (proper monthly PV)`,
      };
    }

    default:
      return { penalty: 0, penaltyPct: 0, explanation: 'Unknown model' };
  }
}

// ---------------------------------------------------------------------------
// PPP OPTIMIZER — enumerate hold periods × prepay amounts
// ---------------------------------------------------------------------------

export interface PppOptimizationRow {
  holdMonths: number;
  model: PppModelType;
  penalty: number;
  totalInterestPaid: number;
  totalCostOfCapital: number; // penalty + interest
  rank: number;
  recommendation: 'optimal' | 'good' | 'fair' | 'poor';
}

// v12 (P1-20): Proper amortizing balance — was `loan × (1 - frac × 0.7)` (magic 0.7
// with no math basis). For a 30y 7% loan, balance after 5y is ~94% of original;
// the old formula returned 88%. Errors compounded across all 25 rows.
function remainingBalanceAtMonth(loan: number, annualRatePct: number, amortMonths: number, monthsElapsed: number): number {
  if (monthsElapsed <= 0) return loan;
  if (monthsElapsed >= amortMonths) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return Math.max(0, loan - (loan / amortMonths) * monthsElapsed);
  const monthlyPmt = (loan * r) / (1 - Math.pow(1 + r, -amortMonths));
  // Standard remaining-balance formula: B = L*(1+r)^n - P*((1+r)^n - 1)/r
  const powN = Math.pow(1 + r, monthsElapsed);
  return Math.max(0, loan * powN - monthlyPmt * (powN - 1) / r);
}

// v12 (P1-21): More accurate total interest paid — sum of monthly interest
// over the hold period, not the rough "avg balance × rate × years" approximation.
function totalInterestPaidOver(loan: number, annualRatePct: number, amortMonths: number, monthsHeld: number): number {
  if (monthsHeld <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return 0;
  const monthlyPmt = (loan * r) / (1 - Math.pow(1 + r, -amortMonths));
  let balance = loan;
  let totalInterest = 0;
  for (let m = 1; m <= monthsHeld; m++) {
    const interest = balance * r;
    const principal = monthlyPmt - interest;
    totalInterest += interest;
    balance = Math.max(0, balance - principal);
  }
  return totalInterest;
}

export function optimizePpp(
  loanAmount: number,
  interestRate: number,
  amortMonths: number,
  holdMonthsOptions: number[] = [12, 24, 36, 48, 60]
): PppOptimizationRow[] {
  const results: PppOptimizationRow[] = [];

  for (const holdMonths of holdMonthsOptions) {
    for (const model of PPP_MODELS.map((m) => m.type)) {
      // v12 (P1-20): Proper amortizing balance
      const loanBalanceAtPayoff = remainingBalanceAtMonth(loanAmount, interestRate, amortMonths, holdMonths);

      // v12 (P1-21): Proper total interest (sum of monthly interest over hold)
      const totalInterestPaid = totalInterestPaidOver(loanAmount, interestRate, amortMonths, holdMonths);

      const penaltyResult = calculatePppPenalty(
        model,
        loanBalanceAtPayoff,
        loanAmount,
        holdMonths,
        interestRate
      );

      results.push({
        holdMonths,
        model,
        penalty: penaltyResult.penalty,
        totalInterestPaid: Math.round(totalInterestPaid),
        totalCostOfCapital: Math.round(penaltyResult.penalty + totalInterestPaid),
        rank: 0,
        recommendation: 'fair',
      });
    }
  }

  // Sort by total cost of capital ascending
  results.sort((a, b) => a.totalCostOfCapital - b.totalCostOfCapital);

  // v12 (P2-batch-J): Recommendation based on absolute cost tiers, not arbitrary
  // percentiles. Was top 10%/30%/70% — no financial basis. Now: compare each row's
  // total cost of capital against the best (rank 1) — within 5% = optimal, 10% = good, 25% = fair.
  const bestCost = results.length > 0 ? results[0].totalCostOfCapital : 0;
  results.forEach((r, idx) => {
    r.rank = idx + 1;
    if (bestCost === 0) {
      r.recommendation = 'fair';
    } else {
      const pctAboveBest = (r.totalCostOfCapital - bestCost) / bestCost;
      if (pctAboveBest <= 0.05) r.recommendation = 'optimal';
      else if (pctAboveBest <= 0.10) r.recommendation = 'good';
      else if (pctAboveBest <= 0.25) r.recommendation = 'fair';
      else r.recommendation = 'poor';
    }
  });

  return results;
}
