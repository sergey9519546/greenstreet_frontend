// ============================================================
// DSCR Deal Desk v11.0 — True Cost of Capital (AEY) Engine
// Part D: XIRR-based lender ranking, two-quote rule,
//         points recoup, YSP-adjusted APR
// ============================================================
//
// All-In Effective Yield (AEY) = XIRR of actual borrower cash flows:
//   [Net_Proceeds_0, -P_1, -P_2, ..., -(P_n + Balance_n + PPP_n)]
//   Net_Proceeds_0 = Loan_Amount - (Points$ + Lender_Fees)
//
// The lender with the LOWEST AEY over expected hold = cheapest lender,
// regardless of stated rate. Sort by AEY, NOT by rate.
// ============================================================

import type {
  TrueCostResult,
  TrueCostCashFlow,
  LenderProgram,
  LenderRankingEntry,
  LoanStructure,
  PropertyInputs,
  CounterpartyRisk,
  FitTier,
  ProvenanceLabel,
} from './types';
import { calculatePI, calculatePaymentFactor } from './engine';
import { computeXIRR } from './taxEngine';
import { computeRemainingBalance } from './returnsEngine';

// ============================================================
// COUNTERPARTY RISK DATA (per Part I — lender continuity)
// 2022-23 market shakeout pulled several lenders mid-pipeline.
// Track separately from data-freshness confidence.
// ============================================================

export const COUNTERPARTY_RISK: Record<string, CounterpartyRisk> = {
  griffin: {
    lenderId: 'griffin',
    continuityScore: 88,
    knownDisruption: null,
    lastReportedStatus: 'Active, $20.79M May 2026 production, all 50 states',
    flag: 'STABLE',
  },
  kiavi: {
    lenderId: 'kiavi',
    continuityScore: 82,
    knownDisruption: null,
    lastReportedStatus: 'Active, public reporting (SPAC 2024)',
    flag: 'STABLE',
  },
  visio: {
    lenderId: 'visio',
    continuityScore: 80,
    knownDisruption: null,
    lastReportedStatus: 'Active, 48 states, broadest STR acceptance',
    flag: 'STABLE',
  },
  lima_one: {
    lenderId: 'lima_one',
    continuityScore: 78,
    knownDisruption: null,
    lastReportedStatus: 'Active, ~3 week close; portfolio/blanket loans',
    flag: 'STABLE',
  },
  easy_street: {
    lenderId: 'easy_street',
    continuityScore: 76,
    knownDisruption: null,
    lastReportedStatus: 'Active, $500M+ funded, 1500+ loans; STR specialist',
    flag: 'STABLE',
  },
  new_silver: {
    lenderId: 'new_silver',
    continuityScore: 72,
    knownDisruption: null,
    lastReportedStatus: 'Active, tech-forward, instant approval',
    flag: 'STABLE',
  },
  defy: {
    lenderId: 'defy',
    continuityScore: 75,
    knownDisruption: null,
    lastReportedStatus: 'Active, 85% LTV exception',
    flag: 'STABLE',
  },
  angel_oak: {
    lenderId: 'angel_oak',
    continuityScore: 70,
    knownDisruption: null,
    lastReportedStatus: 'Active, public reporting (AOMC)',
    flag: 'STABLE',
  },
  deephaven: {
    lenderId: 'deephaven',
    continuityScore: 60,
    knownDisruption: 'Matrix may be stale — highest reverify priority',
    lastReportedStatus: 'Active but matrix needs re-verification',
    flag: 'WATCH',
  },
  american_heritage: {
    lenderId: 'american_heritage',
    continuityScore: 65,
    knownDisruption: null,
    lastReportedStatus: 'Active, Invest Star program',
    flag: 'STABLE',
  },
  // v11.1 FIX (AUDIT-FINAL-2): Previously MISSING — COUNTERPARTY_RISK only
  // had 10 of 12 lender entries, leaving corevest and rcn_capital falling
  // through to the generic WATCH fallback in rankLendersByAEY (continuityScore 50).
  // Both lenders are active; missing entries understated counterparty stability.
  corevest: {
    lenderId: 'corevest',
    continuityScore: 70,
    knownDisruption: null,
    lastReportedStatus: 'Active, institutional portfolio lender ($2M-$50M+)',
    flag: 'STABLE',
  },
  rcn_capital: {
    lenderId: 'rcn_capital',
    continuityScore: 75,
    knownDisruption: null,
    lastReportedStatus: 'Active, published guidelines, $2.5M cap, delayed financing',
    flag: 'STABLE',
  },
  // v11.2 ADDITIONS: 4 new lender counterparty risk entries
  ad_mortgage: {
    lenderId: 'ad_mortgage',
    continuityScore: 72,
    knownDisruption: null,
    lastReportedStatus: 'Active, formerly Genesis Capital; broad Non-QM/DSCR product mix',
    flag: 'STABLE',
  },
  lendingone: {
    lenderId: 'lendingone',
    continuityScore: 68,
    knownDisruption: null,
    lastReportedStatus: 'Active, private money lender focused on long-term rental DSCR',
    flag: 'STABLE',
  },
  civic_financial: {
    lenderId: 'civic_financial',
    continuityScore: 75,
    knownDisruption: null,
    lastReportedStatus: 'Active, institutional DSCR originator with capital markets access; jumbo/portfolio specialist',
    flag: 'STABLE',
  },
  finance_of_america: {
    lenderId: 'finance_of_america',
    continuityScore: 78,
    knownDisruption: null,
    lastReportedStatus: 'Active, public company (NYSE: FOA); major Non-QM/DSCR originator',
    flag: 'STABLE',
  },
  // v11.3 ADDITIONS: 3 new lender counterparty risk entries
  // (Task ID 12 retroactive audit found these were missing — added in Task ID 13
  // to restore Truth Machine integrity. Without these, rankLendersByAEY falls
  // through to the generic WATCH fallback (continuityScore 50), understating
  // counterparty stability for these lenders.)
  broadmark: {
    lenderId: 'broadmark',
    continuityScore: 72,
    knownDisruption: 'Broadmark brand acquired by Ready Capital (2023) — confirm current program guidelines post-integration',
    lastReportedStatus: 'Active under Ready Capital ownership; Seattle-based bridge + DSCR takeout combo',
    flag: 'STABLE',
  },
  park_place: {
    lenderId: 'park_place',
    continuityScore: 68,
    knownDisruption: null,
    lastReportedStatus: 'Active, Austin TX-based DSCR lender with TX/SE regional strength',
    flag: 'STABLE',
  },
  stratton: {
    lenderId: 'stratton',
    continuityScore: 67,
    knownDisruption: null,
    lastReportedStatus: 'Active, Non-QM specialist with strong wholesale/broker channel',
    flag: 'STABLE',
  },
};

// ============================================================
// AEY COMPUTATION
// ============================================================

/**
 * Compute the All-In Effective Yield (AEY) for a lender quote.
 *
 * Cash flows (from borrower's perspective):
 *   t=0: +LoanAmount - Points - LenderFees - BrokerFees - RateLockCost
 *   t=1..n: -MonthlyPayment (PI; assume fixed for simplicity)
 *   t=n (exit): -RemainingBalance - PrepayPenaltyAtExit
 *
 * AEY = XIRR(cashFlows)
 *
 * @param loanAmount - principal borrowed
 * @param annualRate - stated annual rate (%)
 * @param termMonths - full amortization term (e.g., 360)
 * @param holdMonths - expected hold (exit) period
 * @param pointsPct - origination points (% of loan)
 * @param lenderFees - flat lender fees
 * @param brokerFees - flat broker fees
 * @param rateLockCost - rate lock cost
 * @param prepayPenaltyAtExit - $ penalty at exit
 * @param parRate - par rate for YSP comparison (optional)
 */
export function computeAEY(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
  holdMonths: number,
  pointsPct: number,
  lenderFees: number,
  brokerFees: number,
  rateLockCost: number,
  prepayPenaltyAtExit: number,
  parRate?: number,
): TrueCostResult {
  const numericInputs = [
    loanAmount,
    annualRate,
    termMonths,
    holdMonths,
    pointsPct,
    lenderFees,
    brokerFees,
    rateLockCost,
    prepayPenaltyAtExit,
  ];
  if (numericInputs.some((value) => !Number.isFinite(value))) {
    throw new RangeError('True-cost inputs must be finite numbers.');
  }
  if (loanAmount <= 0 || annualRate < 0 || termMonths <= 0 || !Number.isInteger(termMonths)) {
    throw new RangeError('Loan amount and term must be positive, and rate cannot be negative.');
  }
  if (holdMonths <= 0 || !Number.isInteger(holdMonths) || holdMonths > termMonths) {
    throw new RangeError('Hold period must be a whole number of months within the loan term.');
  }
  if ([pointsPct, lenderFees, brokerFees, rateLockCost, prepayPenaltyAtExit].some((value) => value < 0)) {
    throw new RangeError('Points, fees, lock cost, and prepayment penalty cannot be negative.');
  }
  if (parRate !== undefined && (!Number.isFinite(parRate) || parRate < 0)) {
    throw new RangeError('Par rate must be a finite, non-negative number when supplied.');
  }

  const pointsDollars = loanAmount * (pointsPct / 100);
  const netLoanProceeds = loanAmount - pointsDollars - lenderFees - brokerFees - rateLockCost;
  if (!Number.isFinite(netLoanProceeds) || netLoanProceeds <= 0) {
    throw new RangeError('Fees and points must leave positive net loan proceeds.');
  }

  const piMonthly = calculatePI(loanAmount, annualRate, termMonths);
  const remainingBalance = computeRemainingBalance(loanAmount, annualRate, termMonths, holdMonths);
  if (!Number.isFinite(piMonthly) || !Number.isFinite(remainingBalance)) {
    throw new RangeError('True-cost inputs exceeded the supported calculation range.');
  }

  // Build one actual borrower cash-flow row per payment month. The final row
  // also carries the remaining balance and exit penalty at the exact hold month.
  const cashFlows: TrueCostCashFlow[] = [];

  // t=0: net proceeds (positive cash inflow to borrower)
  cashFlows.push({ month: 0, amount: netLoanProceeds });

  for (let month = 1; month <= holdMonths; month++) {
    cashFlows.push({ month, amount: -piMonthly });
  }

  // Exit balloon + prepay penalty land on the exact exit month.
  cashFlows[cashFlows.length - 1].amount += -(remainingBalance + prepayPenaltyAtExit);
  if (cashFlows.some((flow) => !Number.isFinite(flow.amount))) {
    throw new RangeError('True-cost cash flows exceeded the supported calculation range.');
  }

  // Convert to XIRR format
  const xirrFlows = cashFlows.map(cf => ({ time: cf.month / 12, amount: cf.amount }));
  const aey = computeXIRR(xirrFlows);
  if (!Number.isFinite(aey)) {
    throw new RangeError('Unable to compute a finite all-in effective yield.');
  }

  // APR-equivalent (Reg Z style — includes fees, no prepay)
  const aprCashFlows: TrueCostCashFlow[] = [
    { month: 0, amount: netLoanProceeds },
  ];
  for (let m = 1; m <= holdMonths; m++) {
    aprCashFlows.push({ month: m, amount: -piMonthly });
  }
  aprCashFlows[aprCashFlows.length - 1].amount += -remainingBalance; // no prepay for APR
  const aprXirrFlows = aprCashFlows.map(cf => ({ time: cf.month / 12, amount: cf.amount }));
  const aprEquivalent = computeXIRR(aprXirrFlows);
  if (!Number.isFinite(aprEquivalent)) {
    throw new RangeError('Unable to compute a finite APR equivalent.');
  }

  // YSP-adjusted APR (if rate > par, broker earns YSP)
  const yspFlag = parRate !== undefined && annualRate > parRate + 0.125;
  let yspAdjustedAPR: number | null = null;
  if (yspFlag && parRate !== undefined) {
    // Estimate YSP at ~1% of loan per 0.25% above par
    const yspPctOfLoan = (annualRate - parRate) * 0.01; // ~1% per 0.25% above par
    const yspDollars = loanAmount * yspPctOfLoan;
    // YSP reduces borrower effective cost (broker-paid) — net proceeds increase
    const yspNetProceeds = netLoanProceeds + yspDollars;
    const yspFlows: { time: number; amount: number }[] = [
      { time: 0, amount: yspNetProceeds },
    ];
    for (let month = 1; month <= holdMonths; month++) {
      yspFlows.push({ time: month / 12, amount: -piMonthly });
    }
    yspFlows[yspFlows.length - 1].amount += -(remainingBalance + prepayPenaltyAtExit);
    yspAdjustedAPR = computeXIRR(yspFlows);
    if (!Number.isFinite(yspAdjustedAPR)) {
      throw new RangeError('Unable to compute a finite YSP-adjusted APR.');
    }
  }

  // Total cost at 12/24/36/60 months (sum of interest + fees + prepay if applicable)
  const interestAt = (months: number) => {
    const pi = piMonthly * months;
    const bal = computeRemainingBalance(loanAmount, annualRate, termMonths, months);
    const prepaid = months >= holdMonths ? prepayPenaltyAtExit : 0;
    return pi - (loanAmount - bal) + pointsDollars + lenderFees + brokerFees + rateLockCost + prepaid;
  };

  const totalCosts = [interestAt(12), interestAt(24), interestAt(36), interestAt(60)];
  if (totalCosts.some((cost) => !Number.isFinite(cost))) {
    throw new RangeError('True-cost totals exceeded the supported calculation range.');
  }

  // Points recoup: break-even vs par rate (no points)
  const parPiMonthly = parRate !== undefined ? calculatePI(loanAmount, parRate, termMonths) : piMonthly;
  const monthlySavings = parPiMonthly - piMonthly; // positive = savings from buying down rate
  const pointsRecoupMonths = monthlySavings > 0
    ? Math.round(pointsDollars / monthlySavings)
    : Infinity;
  let pointsRecoupVerdict: 'GREEN' | 'YELLOW' | 'RED';
  if (!isFinite(pointsRecoupMonths)) {
    pointsRecoupVerdict = 'RED';
  } else if (pointsRecoupMonths < holdMonths - 12) {
    pointsRecoupVerdict = 'GREEN';
  } else if (pointsRecoupMonths < holdMonths) {
    pointsRecoupVerdict = 'YELLOW';
  } else {
    pointsRecoupVerdict = 'RED';
  }

  return {
    lenderId: '', // filled by caller
    lenderName: '', // filled by caller
    statedRate: annualRate,
    pointsPct,
    pointsDollars: Math.round(pointsDollars),
    lenderFees,
    brokerFees,
    rateLockCost,
    pppPenaltyAtExit: prepayPenaltyAtExit,
    netLoanProceeds: Math.round(netLoanProceeds),
    cashFlows,
    aey: Math.round(aey * 10000) / 100,  // percentage 2-decimals
    aprEquivalent: Math.round(aprEquivalent * 10000) / 100,
    yspAdjustedAPR: yspAdjustedAPR !== null ? Math.round(yspAdjustedAPR * 10000) / 100 : null,
    yspFlag,
    totalCost12mo: Math.round(totalCosts[0]),
    totalCost24mo: Math.round(totalCosts[1]),
    totalCost36mo: Math.round(totalCosts[2]),
    totalCost60mo: Math.round(totalCosts[3]),
    pointsRecoupMonths: isFinite(pointsRecoupMonths) ? pointsRecoupMonths : 999,
    pointsRecoupVerdict,
    provenance: 'VERIFIED_PRIMARY', // filled by caller
    confidenceScore: 0, // filled by caller
  };
}

function resolvePrepayPenaltyAtExit(pppAllowed: boolean, quotedPenalty: number): number {
  if (!Number.isFinite(quotedPenalty) || quotedPenalty < 0) {
    throw new RangeError('Quoted prepayment penalty must be finite and non-negative.');
  }
  return pppAllowed ? quotedPenalty : 0;
}

// ============================================================
// LENDER RANKING
// ============================================================

/**
 * Rank lenders by AEY (lowest = best).
 *
 * Per Part D screening order:
 *   1) ELIGIBILITY GATE (binary): PPP legality, FICO/DSCR floor, LTV ceiling,
 *      property type, loan-size band, citizenship/ITIN, STR acceptance
 *   2) FIT TIER: Strong / Standard / Conditional / Unlikely / Does-not-meet
 *   3) PRICE (anchor+levers, dated band)
 *   4) TRUE COST (AEY) at hold
 *   5) CONFIDENCE (tiebreaker ONLY — never overrides material AEY delta)
 *
 * TWO-QUOTE RULE: always one flex/fit + one rate-competitive lender
 */
export function rankLendersByAEY(
  quotes: Array<{
    lender: LenderProgram;
    estimatedRate: number;
    eligible: boolean;
    ineligibleReasons: string[];
    fitTier: FitTier;
    pppAllowed: boolean;
    pppStructure: string;
    loanAmount: number;
    termMonths: number;
    holdMonths: number;
    parRate: number;
    prepayPenaltyAtExit: number;
    provenanceWarnings: string[];
    // v11 FIX (AUDIT-7 #1): Pass actual fees/points so AEY computes correctly
    pointsPct?: number;
    lenderFees?: number;
    brokerFees?: number;
    rateLockCost?: number;
  }>,
): LenderRankingEntry[] {
  // Filter eligible, compute AEY for each
  const computed = quotes.map(q => {
    if (!q.eligible) {
      return {
        quote: q,
        aey: Infinity,
        trueCost: null as TrueCostResult | null,
      };
    }
    // v11 FIX (AUDIT-7 #1): Use ACTUAL lender fees from the quote, NOT loanAmountMin.value
    // (which is the lender's minimum loan size — a $50K-$2M figure that was inflating AEY by ~700bps)
    try {
      const trueCost = computeAEY(
        q.loanAmount,
        q.estimatedRate,
        q.termMonths,
        q.holdMonths,
        q.pointsPct ?? 0,           // points % from quote
        q.lenderFees ?? 1500,       // actual lender fees from quote (default $1500 if missing)
        q.brokerFees ?? 0,          // broker fees
        q.rateLockCost ?? 0,        // rate lock cost
        resolvePrepayPenaltyAtExit(q.pppAllowed, q.prepayPenaltyAtExit),
        q.parRate,
      );
      trueCost.lenderId = q.lender.id;
      trueCost.lenderName = q.lender.name;
      trueCost.provenance = q.lender.sourceType;
      trueCost.confidenceScore = q.lender.confidenceScore;
      return { quote: q, aey: trueCost.aey, trueCost };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Invalid true-cost quote inputs.';
      return {
        quote: {
          ...q,
          eligible: false,
          ineligibleReasons: [...q.ineligibleReasons, `True-cost unavailable: ${reason}`],
        },
        aey: Infinity,
        trueCost: null as TrueCostResult | null,
      };
    }
  });

  // Sort: eligible first by AEY ascending; ineligible at bottom
  const sorted = computed.sort((a, b) => {
    if (a.quote.eligible && !b.quote.eligible) return -1;
    if (!a.quote.eligible && b.quote.eligible) return 1;
    return a.aey - b.aey;
  });

  return sorted.map((entry, idx) => {
    const counterparty = COUNTERPARTY_RISK[entry.quote.lender.id] ?? {
      lenderId: entry.quote.lender.id,
      continuityScore: 50,
      knownDisruption: null,
      lastReportedStatus: 'Unknown — verify directly',
      flag: 'WATCH' as const,
    };
    return {
      rank: idx + 1,
      lenderId: entry.quote.lender.id,
      lenderName: entry.quote.lender.name,
      fitTier: entry.quote.fitTier,
      eligible: entry.quote.eligible,
      ineligibleReasons: entry.quote.ineligibleReasons,
      estimatedRate: entry.quote.estimatedRate,
      aey: entry.aey,
      totalCost60mo: entry.trueCost?.totalCost60mo ?? 0,
      confidenceScore: entry.quote.lender.confidenceScore,
      counterpartyRisk: counterparty,
      pppAllowed: entry.quote.pppAllowed,
      pppStructure: entry.quote.pppStructure,
      provenance: entry.quote.lender.sourceType,
      provenanceWarnings: entry.quote.provenanceWarnings,
      sourceSnapshot: entry.quote.lender.sourceSnapshot,
    };
  });
}

// ============================================================
// TWO-QUOTE RULE ENFORCEMENT
// ============================================================

/**
 * Per Part D: "always one flex/fit + one rate-competitive lender, with the AEY
 * delta in dollars. Never a single quote."
 */
export function enforceTwoQuoteRule(
  ranking: LenderRankingEntry[],
): {
  rateCompetitive: LenderRankingEntry | null;
  flexFit: LenderRankingEntry | null;
  aeyDeltaBps: number;
  aeyDeltaDollars: number;
  recommendation: string;
  note: string;
} {
  if (ranking.length === 0) {
    return {
      rateCompetitive: null,
      flexFit: null,
      aeyDeltaBps: 0,
      aeyDeltaDollars: 0,
      recommendation: 'NO LENDERS ELIGIBLE — restructure deal or pass.',
      note: 'Two-quote rule cannot be enforced without eligible lenders.',
    };
  }

  // Rate-competitive = lowest AEY (typically lowest rate)
  const eligible = ranking.filter(r => r.eligible);
  if (eligible.length === 0) {
    return {
      rateCompetitive: null,
      flexFit: null,
      aeyDeltaBps: 0,
      aeyDeltaDollars: 0,
      recommendation: 'NO ELIGIBLE LENDERS — PASS.',
      note: 'All lenders failed eligibility gate.',
    };
  }

  const rateCompetitive = eligible[0]; // lowest AEY
  // Flex-fit = best fit tier among the rest (prefer specialist/flex lenders)
  const flexCandidates = eligible.slice(1).filter(r =>
    r.fitTier === 'STRONG_FIT' || r.fitTier === 'STANDARD_FIT' || r.fitTier === 'CONDITIONAL_FIT'
  );
  const flexFit = flexCandidates[0] ?? eligible[1] ?? null;

  const aeyDeltaBps = flexFit ? Math.round((flexFit.aey - rateCompetitive.aey) * 100) : 0;
  // Approximate dollar delta over hold (60mo default)
  const aeyDeltaDollars = flexFit ? Math.abs(flexFit.totalCost60mo - rateCompetitive.totalCost60mo) : 0;

  let recommendation: string;
  if (!flexFit) {
    recommendation = `Single quote only: ${rateCompetitive.lenderName} at ${rateCompetitive.estimatedRate}% (AEY ${rateCompetitive.aey}%). ` +
                     `WARNING: Two-quote rule violated — seek second lender before proceeding.`;
  } else if (aeyDeltaBps <= 25) {
    recommendation = `Tie: ${rateCompetitive.lenderName} (rate-competitive, AEY ${rateCompetitive.aey}%) vs ` +
                     `${flexFit.lenderName} (flex-fit, AEY ${flexFit.aey}%). AEY delta only ${aeyDeltaBps} bps — ` +
                     `choose based on fit tier, counterparty risk, and prepay flexibility.`;
  } else {
    recommendation = `Recommended: ${rateCompetitive.lenderName} (AEY ${rateCompetitive.aey}%). ` +
                     `Saves ~$${aeyDeltaDollars.toLocaleString()} over 60mo vs ${flexFit.lenderName} (${flexFit.aey}% AEY). ` +
                     `Two-quote satisfied. Consider ${flexFit.lenderName} as backup if structure flexibility matters more than cost.`;
  }

  return {
    rateCompetitive,
    flexFit,
    aeyDeltaBps,
    aeyDeltaDollars,
    recommendation,
    note: 'Two-quote rule: always one rate-competitive + one flex/fit lender, AEY delta in dollars.',
  };
}
