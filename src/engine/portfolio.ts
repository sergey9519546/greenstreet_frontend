// ============================================================
// DSCR Loan Command Center v7.0 — Portfolio Engine
// Aggregate DSCR, debt yield, refi scan, blanket warnings
// Portfolio DSCR = ΣNOI / ΣDebt_Service (totals, never averages)
// CoC uses Track 2 income — never Track 1
// ============================================================

import type {
  BorrowerProfile,
  PortfolioProperty,
  PortfolioAnalysis,
  RefiOpportunity,
} from './types';
import { computeTcoRate } from './tcoDscr';

const MAX_FINANCIAL_VALUE = Number.MAX_SAFE_INTEGER / 12;

function finiteNonNegative(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(MAX_FINANCIAL_VALUE, Math.max(0, value))
    : 0;
}

function finiteSum(values: number[]): number {
  return Math.min(MAX_FINANCIAL_VALUE, values.reduce((sum, value) => sum + finiteNonNegative(value), 0));
}

function deterministicNewDealId(properties: PortfolioProperty[]): string {
  const ids = new Set(properties.map(property => property.id));
  let id = 'new-deal';
  let suffix = 2;
  while (ids.has(id)) id = `new-deal-${suffix++}`;
  return id;
}

export function analyzePortfolio(
  existingProperties: PortfolioProperty[],
  newDeal: {
    monthlyPITIA: number;
    monthlyRent: number;
    lender: string;
    loanBalance: number;
    dscr: number;
    track2DSCR: number;
    isBlanket: boolean;
  } | null,
  borrower: BorrowerProfile,
  availableLiquidity: number,
  currentMarketRate: number = 7.0,
): PortfolioAnalysis {
  const allProperties = (newDeal
    ? [...existingProperties, {
        id: deterministicNewDealId(existingProperties),
        name: 'Subject Property',
        address: '',
        monthlyPITIA: newDeal.monthlyPITIA,
        monthlyRent: newDeal.monthlyRent,
        lender: newDeal.lender,
        loanBalance: newDeal.loanBalance,
        dscr: newDeal.dscr,
        track2DSCR: newDeal.track2DSCR,
        isBlanket: newDeal.isBlanket,
      }]
    : existingProperties).map(property => ({
      ...property,
      monthlyPITIA: finiteNonNegative(property.monthlyPITIA),
      monthlyRent: finiteNonNegative(property.monthlyRent),
      loanBalance: finiteNonNegative(property.loanBalance),
      dscr: finiteNonNegative(property.dscr),
      track2DSCR: finiteNonNegative(property.track2DSCR),
      lender: typeof property.lender === 'string' && property.lender.trim() ? property.lender : 'Unknown lender',
    }));

  const totalPITIA = finiteSum(allProperties.map(p => p.monthlyPITIA));
  const totalRent = finiteSum(allProperties.map(p => p.monthlyRent));

  // NOI = Gross less the TCO operating-cost haircut (vacancy + mgmt + maint +
  // CapEx). Portfolio-level default = SFR/average/normal (28%); single source of
  // truth in tcoDscr.ts. Replaces the legacy flat 8/8/5.
  const tcoTotal = computeTcoRate({ propertyType: 'SFR' }).total;
  const totalNOI = finiteSum(allProperties.map(p => p.monthlyRent * (1 - tcoTotal) * 12));

  // Portfolio DSCR = ΣNOI / ΣDebt_Service (totals, NEVER averages)
  const totalAnnualDebtService = totalPITIA * 12;
  const globalDSCR = totalAnnualDebtService > 0 ? totalNOI / totalAnnualDebtService : 0;

  // Debt Yield = NOI / Total Loan Balance
  const totalLoanBalance = finiteSum(allProperties.map(p => p.loanBalance));
  const totalDebtYield = totalLoanBalance > 0 ? totalNOI / totalLoanBalance : 0;

  // Cash-on-Cash (Track 2 income)
  const totalCashInvested = finiteSum(allProperties.map(p => p.loanBalance * 0.25)); // estimate 25% down
  const annualTrack2CF = totalNOI - totalAnnualDebtService;
  const weightedCashOnCash = totalCashInvested > 0 ? annualTrack2CF / totalCashInvested : 0;

  // Reserve requirements by lender — auto-stacked
  const lenderGroups = new Map<string, { properties: PortfolioProperty[]; baseMonths: number }>();
  for (const prop of allProperties) {
    const existing = lenderGroups.get(prop.lender) || { properties: [], baseMonths: 6 };
    existing.properties.push(prop);
    lenderGroups.set(prop.lender, existing);
  }

  const totalReservesByLender = Array.from(lenderGroups.entries()).map(([lender, group]) => {
    // Base 6 months + 2 months per additional property with same lender, capped at 12
    const months = Math.min(12, group.baseMonths + (group.properties.length - 1) * 2);
    const dollars = finiteSum(group.properties.map(p => p.monthlyPITIA * months));
    return { lender, months, dollars };
  });

  const totalReservesRequired = finiteSum(totalReservesByLender.map(r => r.dollars));
  const reserveShortfall = Math.max(0, totalReservesRequired - finiteNonNegative(availableLiquidity));

  // Blanket loan warning
  const hasBlanket = allProperties.some(p => p.isBlanket);
  const blanketLoanWarning = hasBlanket
    ? 'CRITICAL: Blanket loan detected. Partial release clause must be confirmed before signing. Without partial release, selling one property may trigger full loan payoff on ALL properties.'
    : null;

  // Refinance economics require note terms, a real quote, closing costs, and
  // seasoning dates that PortfolioProperty does not carry. Do not fabricate
  // savings or rates from PITIA; leave the watchlist empty until those inputs
  // are explicitly supplied by the data model.
  const refiOpportunities: RefiOpportunity[] = [];
  void currentMarketRate;

  // ── v11.6 — Portfolio Analytics Depth ──

  // Lender concentration analysis
  // Threshold: >50% of properties with one lender triggers counterparty risk warning
  const lenderCounts = new Map<string, number>();
  for (const p of allProperties) {
    lenderCounts.set(p.lender, (lenderCounts.get(p.lender) ?? 0) + 1);
  }
  const uniqueLenderCount = lenderCounts.size;
  let topLender: string | null = null;
  let topLenderCount = 0;
  for (const [lender, count] of lenderCounts) {
    if (count > topLenderCount) {
      topLender = lender;
      topLenderCount = count;
    }
  }
  const topLenderPct = allProperties.length > 0 ? topLenderCount / allProperties.length : 0;
  const lenderConcentration = {
    topLender,
    topLenderCount,
    topLenderPct,
    uniqueLenderCount,
    warning:
      topLenderPct > 0.50 && allProperties.length >= 3
        ? `WARNING: ${(topLenderPct * 100).toFixed(0)}% of portfolio (${topLenderCount} of ${allProperties.length} properties) is concentrated with lender "${topLender}". Counterparty risk: if this lender exits the DSCR market mid-pipeline (cf. 2022-23 shakeout), ${topLenderCount} properties face simultaneous refinance risk. Consider diversifying across at least 2-3 lenders.`
        : null,
  };

  // Geographic concentration analysis (only if state field populated)
  // Threshold: >40% of properties in one state triggers regional disaster/regulatory risk warning
  const stateCounts = new Map<string, number>();
  let propertiesWithState = 0;
  for (const p of allProperties) {
    if (p.state && p.state.trim().length === 2) {
      const st = p.state.toUpperCase();
      stateCounts.set(st, (stateCounts.get(st) ?? 0) + 1);
      propertiesWithState++;
    }
  }
  const uniqueStateCount = stateCounts.size;
  let topState: string | null = null;
  let topStateCount = 0;
  for (const [st, count] of stateCounts) {
    if (count > topStateCount) {
      topState = st;
      topStateCount = count;
    }
  }
  const topStatePct = propertiesWithState > 0 ? topStateCount / propertiesWithState : 0;
  const geographicConcentration = {
    topState,
    topStateCount,
    topStatePct,
    uniqueStateCount,
    propertiesWithState,
    warning:
      topStatePct > 0.40 && propertiesWithState >= 3
        ? `WARNING: ${(topStatePct * 100).toFixed(0)}% of portfolio (${topStateCount} of ${propertiesWithState} properties with state data) is concentrated in ${topState}. Regional risk: hurricane/earthquake exposure, state-specific regulatory changes (e.g., ${topState} PPP law amendments), and local economic downturns can simultaneously impact all concentrated properties. Consider geographic diversification.`
        : null,
  };

  // DSCR distribution stats (Track 1)
  const dscrValues = allProperties.map(p => p.dscr).filter(Number.isFinite);
  const dscrDistribution = computeDistributionStats(dscrValues);

  // Track 2 DSCR distribution stats
  const track2Values = allProperties.map(p => p.track2DSCR).filter(Number.isFinite);
  const track2DscrDistribution = computeDistributionStats(track2Values);

  // Negative cash flow bleed analysis
  // A property "bleeds" if track2DSCR < 1.0 (Track 2 income doesn't cover PITIA)
  // Monthly bleed = PITIA - NOI_monthly (Track 2 NOI = rent × (1 - vacancy - mgmt - maint))
  const negativeCashFlowPropertyIds: string[] = [];
  let totalMonthlyBleed = 0;
  for (const p of allProperties) {
    if (p.track2DSCR < 1.0) {
      negativeCashFlowPropertyIds.push(p.id);
      const monthlyNOI_track2 = p.monthlyRent * (1 - tcoTotal);
      const bleed = Math.max(0, p.monthlyPITIA - monthlyNOI_track2);
      totalMonthlyBleed = finiteSum([totalMonthlyBleed, bleed]);
    }
  }
  const negativeCashFlowProperties = {
    count: negativeCashFlowPropertyIds.length,
    totalMonthlyBleed,
    propertyIds: negativeCashFlowPropertyIds,
  };

  return {
    properties: allProperties,
    totalPITIA,
    totalRent,
    totalNOI,
    globalDSCR,
    totalDebtYield,
    totalCashInvested,
    weightedCashOnCash,
    totalReservesRequired,
    totalReservesByLender,
    reserveShortfall,
    blanketLoanWarning,
    refiOpportunities,
    // v11.6 — Portfolio Analytics Depth
    lenderConcentration,
    geographicConcentration,
    dscrDistribution,
    track2DscrDistribution,
    negativeCashFlowProperties,
  };
}

// ============================================================
// v11.6 — Distribution stats helper
// Returns min/max/mean/median for an array of numbers.
// Median uses the average-of-middle-two method for even-length arrays.
// Returns zeros for empty arrays (count: 0).
// ============================================================
function computeDistributionStats(values: number[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  count: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, count: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  return { min, max, mean, median, count: values.length };
}

// ============================================================
// Portfolio Health Score — single 0–100 composite rating
// Inputs: PortfolioAnalysis return value from analyzePortfolio()
// Scoring:
//   40 pts — Global DSCR (1.50+ = 40, 1.25–1.49 = 30, 1.0–1.24 = 18, <1.0 = 0)
//   20 pts — Concentration (lender + geo, each 10 pts, lose if warning fires)
//   20 pts — Negative cash-flow count (0 = 20, 1 = 12, 2 = 6, 3+ = 0)
//   20 pts — Reserve shortfall (0 = 20, <3mo PITIA = 12, 3–6mo = 6, >6mo = 0)
// Label thresholds: 80+ STRONG · 65+ HEALTHY · 50+ WATCH · 30+ AT RISK · <30 CRITICAL
// ============================================================
export function computePortfolioHealthScore(result: ReturnType<typeof analyzePortfolio>): {
  score: number;
  label: 'STRONG' | 'HEALTHY' | 'WATCH' | 'AT RISK' | 'CRITICAL';
  color: string;
  breakdown: { dscrPts: number; concentrationPts: number; cashFlowPts: number; reservePts: number };
} {
  // Legacy PortfolioAnalysis fixtures predate the properties field. Only an
  // explicitly present, empty property list proves that the portfolio is empty;
  // missing legacy data must continue through the established score pillars.
  if (Array.isArray(result.properties) && result.properties.length === 0) {
    return {
      score: 0,
      label: 'CRITICAL',
      color: '#e06363',
      breakdown: { dscrPts: 0, concentrationPts: 0, cashFlowPts: 0, reservePts: 0 },
    };
  }

  // DSCR pillar (40 pts)
  const g = result.globalDSCR;
  const dscrPts = g >= 1.50 ? 40 : g >= 1.25 ? 30 : g >= 1.0 ? 18 : 0;

  // Concentration pillar (20 pts)
  const lenderPts  = result.lenderConcentration.warning   ? 0 : 10;
  const geoPts     = result.geographicConcentration.warning ? 0 : 10;
  const concentrationPts = lenderPts + geoPts;

  // Negative cash-flow pillar (20 pts)
  const ncf = result.negativeCashFlowProperties.count;
  const cashFlowPts = ncf === 0 ? 20 : ncf === 1 ? 12 : ncf === 2 ? 6 : 0;

  // Reserve shortfall pillar (20 pts)
  const pitiaMonthly = result.totalPITIA;
  const shortfall = result.reserveShortfall;
  const shortfallMonths = pitiaMonthly > 0 ? shortfall / pitiaMonthly : 0;
  const reservePts = shortfall === 0 ? 20 : shortfallMonths < 3 ? 12 : shortfallMonths < 6 ? 6 : 0;

  const score = dscrPts + concentrationPts + cashFlowPts + reservePts;
  const label =
    score >= 80 ? 'STRONG'   :
    score >= 65 ? 'HEALTHY'  :
    score >= 50 ? 'WATCH'    :
    score >= 30 ? 'AT RISK'  : 'CRITICAL';
  const color =
    score >= 80 ? '#4ade80'  :
    score >= 65 ? '#a3e635'  :
    score >= 50 ? '#e6b84d'  :
    score >= 30 ? '#fb923c'  : '#e06363';

  return { score, label, color, breakdown: { dscrPts, concentrationPts, cashFlowPts, reservePts } };
}

export interface PortfolioAggregateInput {
  value: number;
  balance: number;
  rate: number;
  rent: number;
  pitia: number;
  cf: number;
}

export interface PortfolioAggregates {
  hasProperties: boolean;
  blend: number;
  equity: number;
  totCash: number;
  wRate: number;
  totBal: number;
}

/**
 * Computes the values presented by the portfolio summary strip. The explicit
 * availability flag keeps an empty portfolio distinct from a real portfolio
 * whose valid aggregate happens to be zero.
 */
export function computePortfolioAggregates(
  properties: readonly PortfolioAggregateInput[],
): PortfolioAggregates {
  let totRent = 0;
  let totDebt = 0;
  let totValue = 0;
  let totBal = 0;
  let totCash = 0;
  let wRateNum = 0;

  for (const property of properties) {
    totRent += property.rent;
    totDebt += property.pitia;
    totValue += property.value;
    totBal += property.balance;
    totCash += property.cf;
    wRateNum += property.rate * property.balance;
  }

  return {
    hasProperties: properties.length > 0,
    blend: totDebt > 0 ? totRent / totDebt : 0,
    equity: totValue - totBal,
    totCash,
    wRate: totBal > 0 ? wRateNum / totBal : 0,
    totBal,
  };
}
