// ============================================================================
// PORTFOLIO MODE — Multi-Property DSCR Aggregation
// ============================================================================
// Implements v5.0 Spec Module 8:
//   - Multi-Property DSCR Manager: Aggregate DSCR = ΣNOI / ΣDebt Service
//   - Cross-Collateral Analysis: flags when single lender >40% of portfolio debt
//   - Concentration Risk Heatmap: by geography, property type, lender
// ============================================================================

export interface PortfolioProperty {
  id: string;
  address: string;
  state: string;
  city: string;
  propertyType: string;
  rentType: string;
  // Economics
  annualNoi: number;
  annualDebtService: number;
  loanAmount: number;
  ltv: number; // percent
  currentDscr: number;
  // Lender
  lender: string;
  // Optional
  propertyValue?: number;
  reservesMonths?: number;
}

export interface PortfolioSummary {
  propertyCount: number;
  totalValue: number;
  totalLoanBalance: number;
  totalNoi: number;
  totalDebtService: number;
  portfolioDscr: number; // ΣNOI / ΣDebt Service
  avgDscr: number; // simple average
  weightedAvgDscr: number; // weighted by loan amount
  weakestProperty: PortfolioProperty | null;
  strongestProperty: PortfolioProperty | null;
  totalReservesNeeded: number;
  portfolioDragAdjustment: number; // additional reserves from Portfolio Drag rule
  // Concentration risks
  geographicConcentration: { state: string; count: number; totalLoan: number; pctOfPortfolio: number }[];
  propertyTypeConcentration: { type: string; count: number; totalLoan: number; pctOfPortfolio: number }[];
  lenderConcentration: { lender: string; count: number; totalLoan: number; pctOfPortfolio: number; concentrationRisk: 'low' | 'moderate' | 'high' | 'critical' }[];
  // Cross-collateral warnings
  crossCollateralWarnings: string[];
  // Optimization suggestions
  optimizationSuggestions: string[];
  // Risk distribution
  riskDistribution: {
    healthy: number; // DSCR >= 1.25
    adequate: number; // 1.0 - 1.24
    marginal: number; // 0.85 - 0.99
    distressed: number; // < 0.85
  };
}

export function analyzePortfolio(properties: PortfolioProperty[]): PortfolioSummary {
  if (properties.length === 0) {
    return {
      propertyCount: 0,
      totalValue: 0,
      totalLoanBalance: 0,
      totalNoi: 0,
      totalDebtService: 0,
      portfolioDscr: 0,
      avgDscr: 0,
      weightedAvgDscr: 0,
      weakestProperty: null,
      strongestProperty: null,
      totalReservesNeeded: 0,
      portfolioDragAdjustment: 0,
      geographicConcentration: [],
      propertyTypeConcentration: [],
      lenderConcentration: [],
      crossCollateralWarnings: [],
      optimizationSuggestions: [],
      riskDistribution: { healthy: 0, adequate: 0, marginal: 0, distressed: 0 },
    };
  }

  // Sums
  const totalNoi = properties.reduce((s, p) => s + p.annualNoi, 0);
  const totalDebtService = properties.reduce((s, p) => s + p.annualDebtService, 0);
  const totalLoanBalance = properties.reduce((s, p) => s + p.loanAmount, 0);
  const totalValue = properties.reduce((s, p) => s + (p.propertyValue ?? p.loanAmount / (p.ltv / 100)), 0);

  // Portfolio DSCR = ΣNOI / ΣDebt Service (NOT average)
  const portfolioDscr = totalDebtService > 0 ? totalNoi / totalDebtService : 0;

  // Simple average
  const avgDscr = properties.reduce((s, p) => s + p.currentDscr, 0) / properties.length;

  // Weighted average (by loan amount)
  const weightedAvgDscr = totalLoanBalance > 0
    ? properties.reduce((s, p) => s + p.currentDscr * p.loanAmount, 0) / totalLoanBalance
    : 0;

  // Weakest & strongest
  const sorted = [...properties].sort((a, b) => a.currentDscr - b.currentDscr);
  const weakestProperty = sorted[0];
  const strongestProperty = sorted[sorted.length - 1];

  // Portfolio Drag: +2 months PITIA per additional property beyond the first
  const portfolioDragAdjustment = (properties.length - 1) * 2;

  // Geographic concentration
  const stateMap = new Map<string, { count: number; totalLoan: number }>();
  for (const p of properties) {
    const entry = stateMap.get(p.state) ?? { count: 0, totalLoan: 0 };
    entry.count++;
    entry.totalLoan += p.loanAmount;
    stateMap.set(p.state, entry);
  }
  const geographicConcentration = Array.from(stateMap.entries())
    .map(([state, data]) => ({
      state,
      count: data.count,
      totalLoan: data.totalLoan,
      pctOfPortfolio: (data.totalLoan / totalLoanBalance) * 100,
    }))
    .sort((a, b) => b.totalLoan - a.totalLoan);

  // Property type concentration
  const typeMap = new Map<string, { count: number; totalLoan: number }>();
  for (const p of properties) {
    const entry = typeMap.get(p.propertyType) ?? { count: 0, totalLoan: 0 };
    entry.count++;
    entry.totalLoan += p.loanAmount;
    typeMap.set(p.propertyType, entry);
  }
  const propertyTypeConcentration = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      totalLoan: data.totalLoan,
      pctOfPortfolio: (data.totalLoan / totalLoanBalance) * 100,
    }))
    .sort((a, b) => b.totalLoan - a.totalLoan);

  // Lender concentration — flag >40% as risk
  const lenderMap = new Map<string, { count: number; totalLoan: number }>();
  for (const p of properties) {
    const entry = lenderMap.get(p.lender) ?? { count: 0, totalLoan: 0 };
    entry.count++;
    entry.totalLoan += p.loanAmount;
    lenderMap.set(p.lender, entry);
  }
  const lenderConcentration = Array.from(lenderMap.entries())
    .map(([lender, data]) => {
      const pct = (data.totalLoan / totalLoanBalance) * 100;
      let concentrationRisk: 'low' | 'moderate' | 'high' | 'critical';
      if (pct > 60) concentrationRisk = 'critical';
      else if (pct > 40) concentrationRisk = 'high';
      else if (pct > 25) concentrationRisk = 'moderate';
      else concentrationRisk = 'low';
      return {
        lender,
        count: data.count,
        totalLoan: data.totalLoan,
        pctOfPortfolio: pct,
        concentrationRisk,
      };
    })
    .sort((a, b) => b.totalLoan - a.totalLoan);

  // Cross-collateral warnings
  const crossCollateralWarnings: string[] = [];
  for (const lc of lenderConcentration) {
    if (lc.concentrationRisk === 'critical') {
      crossCollateralWarnings.push(`CRITICAL: ${lc.lender} holds ${lc.pctOfPortfolio.toFixed(1)}% of portfolio debt — extreme concentration risk. Diversify immediately.`);
    } else if (lc.concentrationRisk === 'high') {
      crossCollateralWarnings.push(`HIGH: ${lc.lender} holds ${lc.pctOfPortfolio.toFixed(1)}% of portfolio debt (>40%) — cross-collateral default risk. Consider new lenders for next acquisitions.`);
    }
  }

  // Geographic concentration warnings
  for (const gc of geographicConcentration) {
    if (gc.pctOfPortfolio > 50) {
      crossCollateralWarnings.push(`GEOGRAPHIC: ${gc.state} is ${gc.pctOfPortfolio.toFixed(1)}% of portfolio — local market shock would impact majority of NOI.`);
    }
  }

  // Property type concentration
  for (const pc of propertyTypeConcentration) {
    if (pc.pctOfPortfolio > 60) {
      crossCollateralWarnings.push(`PROPERTY TYPE: ${pc.type} is ${pc.pctOfPortfolio.toFixed(1)}% of portfolio — type-specific risk (e.g., STR regulation) would be portfolio-wide.`);
    }
  }

  // Optimization suggestions
  const optimizationSuggestions: string[] = [];
  for (const p of properties) {
    if (p.currentDscr < 0.85) {
      optimizationSuggestions.push(`Property "${p.address}" has DSCR ${p.currentDscr.toFixed(2)}x — consider selling or restructuring (rate buydown, lower LTV).`);
    } else if (p.currentDscr < 1.0) {
      optimizationSuggestions.push(`Property "${p.address}" has DSCR ${p.currentDscr.toFixed(2)}x (below 1.0) — refinance or add reserves.`);
    }
    if (p.ltv > 80) {
      optimizationSuggestions.push(`Property "${p.address}" is over-levered at ${p.ltv.toFixed(1)}% LTV — add equity or pay down.`);
    }
  }
  if (portfolioDscr < 1.0) {
    optimizationSuggestions.push(`PORTFOLIO DSCR ${portfolioDscr.toFixed(2)}x is below 1.0 — portfolio-wide cash flow negative. Sell weakest property or restructure debt.`);
  }

  // Risk distribution
  const riskDistribution = {
    healthy: properties.filter((p) => p.currentDscr >= 1.25).length,
    adequate: properties.filter((p) => p.currentDscr >= 1.0 && p.currentDscr < 1.25).length,
    marginal: properties.filter((p) => p.currentDscr >= 0.85 && p.currentDscr < 1.0).length,
    distressed: properties.filter((p) => p.currentDscr < 0.85).length,
  };

  // Total reserves needed (basic 6mo PITIA per property + portfolio drag)
  const totalReservesNeeded = properties.reduce((s, p) => s + (p.annualDebtService / 12) * (p.reservesMonths ?? 6), 0) +
    (portfolioDragAdjustment * (totalDebtService / 12));

  return {
    propertyCount: properties.length,
    totalValue: Math.round(totalValue),
    totalLoanBalance: Math.round(totalLoanBalance),
    totalNoi: Math.round(totalNoi),
    totalDebtService: Math.round(totalDebtService),
    portfolioDscr: Math.round(portfolioDscr * 1000) / 1000,
    avgDscr: Math.round(avgDscr * 1000) / 1000,
    weightedAvgDscr: Math.round(weightedAvgDscr * 1000) / 1000,
    weakestProperty,
    strongestProperty,
    totalReservesNeeded: Math.round(totalReservesNeeded),
    portfolioDragAdjustment,
    geographicConcentration,
    propertyTypeConcentration,
    lenderConcentration,
    crossCollateralWarnings,
    optimizationSuggestions,
    riskDistribution,
  };
}
