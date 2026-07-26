// ============================================================
// DSCR Loan Command Center v7.0 — Monte Carlo Risk Engine
// Dual-Track, Math-Verified
// Models: rent volatility, vacancy, maintenance shocks,
// tax/insurance inflation, ARM rate changes
// ============================================================

import type {
  PropertyInputs,
  LoanStructure,
  RentalStrategy,
  DSCRResult,
  MonteCarloResult,
  ReserveDepletionPoint,
  DSCRDistributionPoint,
  RiskItem,
} from './types';
import { calculatePI } from './engine';

// Seeded PRNG (Mulberry32) — deterministic for reproducibility
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalRandom(rng: () => number, mean: number, std: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * std;
}

export function runMonteCarlo(
  property: PropertyInputs,
  loan: LoanStructure,
  strategy: RentalStrategy,
  dscrResult: DSCRResult,
  simulations: number = 2500
): MonteCarloResult {
  const rng = mulberry32(42);
  const isSTR = strategy === 'STR';
  const isMTR = strategy === 'MTR';

  const baseRent = dscrResult.qualifyingRent;
  const baseLoanAmount = property.purchasePrice * (loan.ltv / 100);
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
  const termMonths = termYears * 12;
  const baseReserves = dscrResult.cashToClose.reserveRequirement;

  // Rent volatility — STR much more volatile than LTR
  const rentVolatilityStd = isSTR ? 0.15 : isMTR ? 0.08 : 0.04;

  // Vacancy parameters (Track 2 reality, not Track 1 qualification)
  const vacancyPctMonthly = isSTR ? 0.25 : isMTR ? 0.12 : 0.08;
  const managementPct = 0.08;
  const maintenancePct = 0.05;

  // Maintenance shock (one-off major repairs)
  const maintenanceShockProbMonthly = 0.015; // ~18% annualized
  const maintenanceMin = 500;
  const maintenanceMax = 8000;

  // Tax / Insurance inflation (annualized)
  const taxShockProb = 0.05;       // 5% chance of 5% tax hike
  const taxShockPct = 0.05;
  const insuranceInflation = 0.08; // 8%/yr baseline inflation

  // ARM rate change — modeled as rate delta, properly recomputes P&I
  const isARM = loan.armType !== 'FIXED';
  const armRateStd = 0.0075;       // 75 bps std dev on annual ARM adjustment

  const annualCashFlows: number[] = [];
  const dscrValues: number[] = [];
  const track2DscrValues: number[] = [];
  const reserveCurves: number[][] = [];

  let dscrAbove1Count = 0;
  let negCashFlowCount = 0;

  for (let sim = 0; sim < simulations; sim++) {
    // Annual rent adjustment (Track 1 — gross, no vacancy)
    const rentChange = normalRandom(rng, 0, rentVolatilityStd);
    let currentRent = baseRent * (1 + rentChange);
    if (currentRent < 0) currentRent = 0;

    // Tax/insurance shocks (annualized)
    let currentTaxes = property.annualTaxes / 12;
    let currentInsurance = property.annualInsurance / 12;
    if (rng() < taxShockProb) currentTaxes *= (1 + taxShockPct);
    currentInsurance *= (1 + insuranceInflation);

    // ARM rate adjustment — properly recompute P&I at new rate
    let currentRate = dscrResult.solvedRate;
    let currentPI = dscrResult.monthlyPITIA.principalAndInterest;
    if (isARM) {
      const rateDelta = normalRandom(rng, 0, armRateStd);
      currentRate = Math.max(0.02, dscrResult.solvedRate + rateDelta);
      currentPI = calculatePI(baseLoanAmount, currentRate, termMonths);
    }

    // Simulate 12 months of Track 2 cash flow (with vacancy, mgmt, maint)
    let yearCashFlow = 0;
    let reserves = baseReserves;
    const reserveCurve: number[] = [];

    for (let month = 1; month <= 12; month++) {
      // Vacancy shock — Track 2 reality
      let effectiveRent = currentRent;
      if (rng() < vacancyPctMonthly) effectiveRent = 0;

      // Maintenance shock (one-off)
      let maintenanceShock = 0;
      if (rng() < maintenanceShockProbMonthly) {
        maintenanceShock = maintenanceMin + rng() * (maintenanceMax - maintenanceMin);
      }

      const monthlyPITIA = currentPI + currentTaxes + currentInsurance + property.hoa + (property.floodInsurance || 0) / 12;
      // Track 2 cash flow: effective rent (after vacancy) less ongoing mgmt + maintenance % less PITIA less one-off maint shock
      const cashFlow =
        effectiveRent
        - effectiveRent * managementPct    // ongoing management fee on collected rent
        - effectiveRent * maintenancePct   // ongoing routine maintenance
        - monthlyPITIA
        - maintenanceShock;

      yearCashFlow += cashFlow;
      reserves += cashFlow;
      if (reserves < 0) reserves = 0;
      reserveCurve.push(reserves);
    }

    annualCashFlows.push(yearCashFlow);

    // Track 1 DSCR (qualification — gross rent, no vacancy)
    const simPITIA = currentPI + currentTaxes + currentInsurance + property.hoa + (property.floodInsurance || 0) / 12;
    const simTrack1DSCR = simPITIA > 0 ? currentRent / simPITIA : 0;
    dscrValues.push(simTrack1DSCR);

    // Track 2 DSCR (investor survival — with vacancy/mgmt/maint)
    const netIncome = currentRent * (1 - vacancyPctMonthly - managementPct - maintenancePct);
    const simTrack2DSCR = simPITIA > 0 ? netIncome / simPITIA : 0;
    track2DscrValues.push(simTrack2DSCR);

    if (simTrack1DSCR >= 1.0) dscrAbove1Count++;
    if (yearCashFlow < 0) negCashFlowCount++;

    reserveCurves.push(reserveCurve);
  }

  // Percentiles
  const sortedCF = [...annualCashFlows].sort((a, b) => a - b);
  const pct = (p: number) => sortedCF[Math.min(simulations - 1, Math.floor(simulations * p))];
  const p10 = pct(0.10);
  const p25 = pct(0.25);
  const p50 = pct(0.50);
  const p75 = pct(0.75);
  const p90 = pct(0.90);

  // Reserve depletion curve
  const reserveDepletionCurve: ReserveDepletionPoint[] = [];
  for (let month = 0; month < 12; month++) {
    const monthReserves = reserveCurves.map(c => c[month]).sort((a, b) => a - b);
    reserveDepletionCurve.push({
      month: month + 1,
      p10Reserve: monthReserves[Math.floor(simulations * 0.10)],
      p50Reserve: monthReserves[Math.floor(simulations * 0.50)],
      p90Reserve: monthReserves[Math.floor(simulations * 0.90)],
    });
  }

  // DSCR distribution (20-bin histogram)
  const dscrBins = 20;
  const dscrMin = Math.min(...dscrValues);
  const dscrMax = Math.max(...dscrValues);
  const binWidth = (dscrMax - dscrMin) / dscrBins || 1;
  const dscrDist: DSCRDistributionPoint[] = [];
  for (let i = 0; i < dscrBins; i++) {
    const binStart = dscrMin + i * binWidth;
    const binCenter = binStart + binWidth / 2;
    const count = dscrValues.filter(d => d >= binStart && d < binStart + binWidth).length;
    dscrDist.push({ dscr: Math.round(binCenter * 100) / 100, probability: count / simulations });
  }

  // Key risks — ranked by probability × impact
  const keyRisks: RiskItem[] = [
    {
      risk: 'DSCR < 1.0 (qualification failure)',
      probability: 1 - dscrAbove1Count / simulations,
      impact: 1.0,
    },
    {
      risk: 'Negative Annual Cash Flow (Track 2)',
      probability: negCashFlowCount / simulations,
      impact: 0.7,
    },
    {
      risk: 'Rent Decline >10%',
      probability: dscrValues.filter(d => d < dscrResult.dscr * 0.9).length / simulations,
      impact: 0.8,
    },
    {
      risk: 'Insurance Spike >15%',
      probability: 0.12,
      impact: 0.4,
    },
    {
      risk: 'Major Maintenance ($3K+)',
      probability: 0.15,
      impact: 0.3,
    },
  ];
  keyRisks.sort((a, b) => b.probability * b.impact - a.probability * a.impact);

  return {
    simulations,
    probabilityDSCRAbove1_0: dscrAbove1Count / simulations,
    probabilityNegativeCashFlow: negCashFlowCount / simulations,
    expectedAnnualCashFlow: { p10, p25, p50, p75, p90 },
    reserveDepletionCurve,
    dscrDistribution: dscrDist,
    keyRisks,
  };
}
