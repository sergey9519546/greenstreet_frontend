// ============================================================================
// TRUE COST OF CAPITAL ENGINE — v7.0 Section 18
// ============================================================================
// Compare lenders on all-in economics — not note rate alone.
// True_Cost (hold H months) = Interest(H) + Points + Fees + Rate_Lock +
//                             Prepay(if exiting before PPP ends) + Refi_Costs
// Show by hold period: 12, 24, 36, 60 months
// All inputs must be shown — no orphan numbers.
// ============================================================================

import { monthlyPayment, round } from './math';
import { calculatePppPenalty, type PppModelType } from './ppp-optimizer';
import { checkPppEligibility, type VestingType, type ProductType } from './state-ppp-law';

export interface TrueCostInput {
  loanAmount: number;
  annualRatePct: number;
  amortMonths: number;
  pointsPct: number; // origination points as % of loan
  lenderFees: number; // flat dollar amount
  rateLockCost: number;
  // PPP
  pppModel: PppModelType;
  state: string;
  vesting: VestingType;
  productType: ProductType;
  prepayStructure: string;
  // Hold periods to evaluate
  holdPeriods: number[]; // months
  // Refi (optional)
  refiCostIfApplicable?: number;
}

export interface TrueCostRow {
  holdMonths: number;
  totalInterestPaid: number;
  pointsCost: number;
  lenderFees: number;
  rateLockCost: number;
  pppPenalty: number;
  refiCost: number;
  totalCost: number;
  monthlyCostAvg: number; // total / hold months
  effectiveRate: number; // true all-in rate
  pppApplies: boolean;
  notes: string[];
}

export interface TrueCostResult {
  rows: TrueCostRow[];
  bestHoldPeriod: number; // hold period with lowest monthly cost
  cheapestExitMonth: number;
  notes: string[];
}

export function calculateTrueCost(input: TrueCostInput): TrueCostResult {
  const pointsCost = (input.pointsPct / 100) * input.loanAmount;
  const pppEligibility = checkPppEligibility({
    state: input.state,
    vesting: input.vesting,
    loanAmount: input.loanAmount,
    productType: input.productType,
    prepayStructure: input.prepayStructure,
  });

  const rows: TrueCostRow[] = [];
  const notes: string[] = [];

  if (!pppEligibility.pppAllowed) {
    notes.push(`PPP not permitted in ${input.state}: ${pppEligibility.reason}`);
    notes.push(`No-PPP rate impact: +${pppEligibility.rateImpactBps}bps · Origination fee: ${pppEligibility.originationFeePct}%`);
  }

  for (const holdMonths of input.holdPeriods) {
    // Interest paid over hold period (approximate using average balance)
    const monthlyPmt = monthlyPayment(input.loanAmount, input.annualRatePct, input.amortMonths);
    let balance = input.loanAmount;
    let totalInterest = 0;
    const r = input.annualRatePct / 100 / 12;
    for (let m = 1; m <= holdMonths; m++) {
      const interest = balance * r;
      const principal = Math.max(0, monthlyPmt - interest);
      totalInterest += interest;
      balance -= principal;
    }

    // PPP penalty (on outstanding balance at exit)
    let pppPenalty = 0;
    let pppApplies = false;
    if (pppEligibility.pppAllowed) {
      const penaltyResult = calculatePppPenalty(
        input.pppModel,
        balance, // outstanding balance at exit
        input.loanAmount,
        holdMonths,
        input.annualRatePct
      );
      pppPenalty = penaltyResult.penalty;
      pppApplies = penaltyResult.penalty > 0;
    }

    const refiCost = input.refiCostIfApplicable ?? 0;
    const totalCost = totalInterest + pointsCost + input.lenderFees + input.rateLockCost + pppPenalty + refiCost;
    const monthlyCostAvg = totalCost / holdMonths;
    // Effective rate = total cost / loan / years
    const years = holdMonths / 12;
    const effectiveRate = (totalCost / input.loanAmount / years) * 100;

    const rowNotes: string[] = [];
    if (pppApplies) {
      rowNotes.push(`PPP applies at month ${holdMonths}: $${pppPenalty.toFixed(0)}`);
    }

    rows.push({
      holdMonths,
      totalInterestPaid: round(totalInterest),
      pointsCost: round(pointsCost),
      lenderFees: input.lenderFees,
      rateLockCost: input.rateLockCost,
      pppPenalty: round(pppPenalty),
      refiCost: refiCost,
      totalCost: round(totalCost),
      monthlyCostAvg: round(monthlyCostAvg),
      effectiveRate: round(effectiveRate, 3),
      pppApplies,
      notes: rowNotes,
    });
  }

  // Best hold period = lowest monthly average cost
  const bestHoldPeriod = (rows.length > 0 ? rows.reduce((a, b) => (a.monthlyCostAvg < b.monthlyCostAvg ? a : b)).holdMonths : 0);
  // Cheapest exit = lowest total cost
  const cheapestExitMonth = (rows.length > 0 ? rows.reduce((a, b) => (a.totalCost < b.totalCost ? a : b)).holdMonths : 0);

  return { rows, bestHoldPeriod, cheapestExitMonth, notes };
}

// ---------------------------------------------------------------------------
// LENDER COMPARISON — compare two lenders on true cost
// ---------------------------------------------------------------------------

export interface LenderTrueCostComparison {
  lenderA: { name: string; result: TrueCostResult };
  lenderB: { name: string; result: TrueCostResult };
  winnerByHoldPeriod: { holdMonths: number; winner: 'A' | 'B' | 'tie'; savings: number }[];
  recommendation: string;
}

export function compareLendersTrueCost(
  lenderA: { name: string; input: TrueCostInput },
  lenderB: { name: string; input: TrueCostInput }
): LenderTrueCostComparison {
  const resultA = calculateTrueCost(lenderA.input);
  const resultB = calculateTrueCost(lenderB.input);

  const winnerByHoldPeriod = lenderA.input.holdPeriods.map((holdMonths) => {
    const rowA = resultA.rows.find((r) => r.holdMonths === holdMonths)!;
    const rowB = resultB.rows.find((r) => r.holdMonths === holdMonths)!;
    const diff = rowA.totalCost - rowB.totalCost;
    if (Math.abs(diff) < 100) return { holdMonths, winner: 'tie' as const, savings: 0 };
    return {
      holdMonths,
      winner: (diff < 0 ? 'A' : 'B') as 'A' | 'B',
      savings: Math.abs(diff),
    };
  });

  // Recommendation based on most common winner
  const aWins = winnerByHoldPeriod.filter((w) => w.winner === 'A').length;
  const bWins = winnerByHoldPeriod.filter((w) => w.winner === 'B').length;
  const recommendation = aWins > bWins
    ? `${lenderA.name} wins on ${aWins}/${winnerByHoldPeriod.length} hold periods — generally cheaper all-in.`
    : bWins > aWins
      ? `${lenderB.name} wins on ${bWins}/${winnerByHoldPeriod.length} hold periods — generally cheaper all-in.`
      : 'Mixed results — choose based on planned hold period.';

  return {
    lenderA: { name: lenderA.name, result: resultA },
    lenderB: { name: lenderB.name, result: resultB },
    winnerByHoldPeriod,
    recommendation,
  };
}
