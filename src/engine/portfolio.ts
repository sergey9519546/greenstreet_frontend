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
  const allProperties = newDeal
    ? [...existingProperties, {
        id: `new-${Date.now()}`,
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
    : existingProperties;

  const totalPITIA = allProperties.reduce((sum, p) => sum + p.monthlyPITIA, 0);
  const totalRent = allProperties.reduce((sum, p) => sum + p.monthlyRent, 0);

  // NOI = Gross - vacancy - mgmt - maint (Track 2 income model)
  const totalNOI = allProperties.reduce((sum, p) => {
    const vacancyPct = 0.08;
    const mgmtPct = 0.08;
    const maintPct = 0.05;
    const net = p.monthlyRent * (1 - vacancyPct - mgmtPct - maintPct);
    return sum + net * 12;
  }, 0);

  // Portfolio DSCR = ΣNOI / ΣDebt_Service (totals, NEVER averages)
  const totalAnnualDebtService = totalPITIA * 12;
  const globalDSCR = totalAnnualDebtService > 0 ? totalNOI / totalAnnualDebtService : 0;

  // Debt Yield = NOI / Total Loan Balance
  const totalLoanBalance = allProperties.reduce((sum, p) => sum + p.loanBalance, 0);
  const totalDebtYield = totalLoanBalance > 0 ? totalNOI / totalLoanBalance : 0;

  // Cash-on-Cash (Track 2 income)
  const totalCashInvested = allProperties.reduce((sum, p) => sum + p.loanBalance * (0.25 / 0.75), 0); // estimate 25% down at ~75% LTV (down/loan = 0.25/0.75)
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
    const dollars = group.properties.reduce((sum, p) => sum + p.monthlyPITIA * months, 0);
    return { lender, months, dollars };
  });

  const totalReservesRequired = totalReservesByLender.reduce((sum, r) => sum + r.dollars, 0);
  const reserveShortfall = Math.max(0, totalReservesRequired - availableLiquidity);

  // Blanket loan warning
  const hasBlanket = allProperties.some(p => p.isBlanket);
  const blanketLoanWarning = hasBlanket
    ? 'CRITICAL: Blanket loan detected. Partial release clause must be confirmed before signing. Without partial release, selling one property may trigger full loan payoff on ALL properties.'
    : null;

  // Refi scan — properties with DSCR > 1.25 and rates above current market
  const refiOpportunities: RefiOpportunity[] = allProperties
    .filter(p => p.dscr >= 1.25 && p.loanBalance > 0)
    .map(p => ({
      propertyId: p.id,
      currentRate: 0, // Would need actual rate data
      projectedRate: currentMarketRate - 0.25, // Estimate
      monthlySavings: p.monthlyPITIA * 0.05, // Rough estimate
      seasoningMonthsRemaining: 0,
    }));

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
  const dscrValues = allProperties.map(p => p.dscr).filter(v => typeof v === 'number' && !isNaN(v));
  const dscrDistribution = computeDistributionStats(dscrValues);

  // Track 2 DSCR distribution stats
  const track2Values = allProperties.map(p => p.track2DSCR).filter(v => typeof v === 'number' && !isNaN(v));
  const track2DscrDistribution = computeDistributionStats(track2Values);

  // Negative cash flow bleed analysis
  // A property "bleeds" if track2DSCR < 1.0 (Track 2 income doesn't cover PITIA)
  // Monthly bleed = PITIA - NOI_monthly (Track 2 NOI = rent × (1 - vacancy - mgmt - maint))
  const negativeCashFlowPropertyIds: string[] = [];
  let totalMonthlyBleed = 0;
  for (const p of allProperties) {
    if (p.track2DSCR < 1.0) {
      negativeCashFlowPropertyIds.push(p.id);
      const monthlyNOI_track2 = p.monthlyRent * (1 - 0.08 - 0.08 - 0.05); // vacancy 8% + mgmt 8% + maint 5%
      const bleed = Math.max(0, p.monthlyPITIA - monthlyNOI_track2);
      totalMonthlyBleed += bleed;
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
