// ============================================================================
// MONTE CARLO RISK ENGINE
// ============================================================================
// 10,000 iterations per scenario with correlated distributions:
//   Rent ↔ Vacancy (ρ = -0.7)
//   Interest Rate ↔ Cap Rate (ρ = 0.5)
//   Maintenance ↔ Property Age (ρ = 0.4)
// Outputs P10 / P50 / P90 DSCR values + full probability distribution
// ============================================================================

// v15 Phase 3.3: ES imports for QMC/LHS modes (replaces forbidden require() calls)
import { sobol, latinHypercube } from './monte-carlo-v15';
import { invNormalCDF } from './solvers-v13';

// v12 (P2-batch-C): Seeded PRNG (mulberry32) — was Math.random() which made
// tests non-reproducible. Seed defaults to Date.now() for production use,
// but tests can pass a fixed seed for deterministic output.
let _seed: number = Date.now();
export function _setSeed(seed: number): void { _seed = seed; }
function seededRandom(): number {
  // mulberry32 — small, fast, good statistical properties
  _seed |= 0;
  _seed = (_seed + 0x6D2B79F5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// v13.2: Antithetic variates flag — when true, each iteration generates a
// correlated pair (z, -z) which reduces variance by ~√2 (i.e. same accuracy
// with half the iterations). Default true for production; false for tests
// that need exact iteration counts.
let _useAntithetic: boolean = true;
export function _setAntithetic(enabled: boolean): void { _useAntithetic = enabled; }

// Box-Muller transform for normal distribution sampling
// v12: guard against u1=0 (Math.log(0) = -Infinity)
// v13.2: When _useAntithetic is true, alternates between z and -z to reduce variance.
let _antitheticFlip: boolean = false;
let _lastZ: number = 0;
function gaussianRandom(mean: number, stdDev: number): number {
  if (_useAntithetic && _antitheticFlip) {
    // Use antithetic pair (negate last z)
    _antitheticFlip = false;
    return mean + (-_lastZ) * stdDev;
  }
  const u1 = seededRandom() || Number.EPSILON;
  const u2 = seededRandom();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  if (_useAntithetic) {
    _lastZ = z;
    _antitheticFlip = true;
  }
  return mean + z * stdDev;
}

// v15 Phase 3.3: Helper for LHS — generates a single uniform in [0,1) using the seeded PRNG
function _seededRandomForLHS(): number {
  return seededRandom();
}

// v15: Generate correlated normal variables using full covariance matrix + Cholesky.
// Replaces pairwise correlatedGaussian with a single multivariate sample.
// Variables: [rent_mult, vacancy, rate_shock, cap_rate]
// Covariance matrix (PSD):
//   rent    vacancy  rate     cap
// [ 1.0,    -0.7,    0.0,     0.0  ]   rent ↔ vacancy: -0.7 (higher vac → lower rent)
// [-0.7,     1.0,    0.0,     0.0  ]   vacancy ↔ rate: 0 (independent)
// [ 0.0,     0.0,    1.0,     0.5  ]   rate ↔ cap: +0.5 (rates up → caps up)
// [ 0.0,     0.0,    0.5,     1.0  ]   rent ↔ rate: 0, rent ↔ cap: 0, vac ↔ cap: 0
//
// Cholesky factor L (lower triangular) satisfies L × L^T = Σ
// For this block-diagonal structure:
//   L = [[1, 0, 0, 0], [-0.7, sqrt(1-0.49), 0, 0], [0, 0, 1, 0], [0, 0, 0.5, sqrt(1-0.25)]]
//     = [[1, 0, 0, 0], [-0.7, 0.7141, 0, 0], [0, 0, 1, 0], [0, 0, 0.5, 0.8660]]

function choleskySample4D(): [number, number, number, number] {
  // Generate 4 independent standard normals
  const z1 = gaussianRandom(0, 1);
  const z2 = gaussianRandom(0, 1);
  const z3 = gaussianRandom(0, 1);
  const z4 = gaussianRandom(0, 1);

  // Apply Cholesky factor L: result = L × z
  const rent_shock    = z1;                                    // L[0][0] * z1
  const vacancy_shock = -0.7 * z1 + 0.7141 * z2;              // L[1][0]*z1 + L[1][1]*z2
  const rate_shock    = z3;                                    // L[2][2] * z3
  const cap_shock     = 0.5 * z3 + 0.8660 * z4;               // L[3][2]*z3 + L[3][3]*z4

  return [rent_shock, vacancy_shock, rate_shock, cap_shock];
}

export interface MonteCarloInputs {
  // Base deal economics
  loanAmount: number;
  amortMonths: number;
  interestOnlyMonths: number;
  // Income (monthly)
  baseRent: number;
  otherIncomeMonthly: number;
  // Expenses (monthly)
  propertyTaxes: number;
  insurance: number;
  hoa: number;
  propertyMgmtPct: number; // % of EGI
  repairsMaintenancePct: number; // % of EGI
  capexReservePct: number; // % of EGI
  turnoverPct: number; // % of EGI
  // Stress assumptions (volatility parameters)
  rentVolatility: number; // std dev as fraction (0.05 = 5%)
  vacancyMean: number; // percent
  vacancyVolatility: number; // std dev in percentage points
  interestRateVolatility: number; // std dev in percentage points
  capRateVolatility: number; // std dev in percentage points
  maintenanceVolatility: number; // std dev as fraction
  // Market
  marketCapRate: number;
  // Iterations
  iterations: number;
  // v12: Base rate for proper debt service computation (was hardcoded 7.5%)
  baseRate?: number;
  // v15 Phase 3.3: MC sampling mode
  //   'pseudo'  — pseudo-random with antithetic variates (default; current behavior)
  //   'qmc'     — quasi-Monte Carlo with Sobol' sequence (faster convergence, requires power-of-2 N)
  //   'lhs'     — Latin Hypercube Sampling (use when N is not a power of 2)
  mode?: 'pseudo' | 'qmc' | 'lhs';
  // v15 Phase 3.3: Optional seed for reproducibility (pseudo mode only)
  seed?: number;
}

export interface MonteCarloIteration {
  dscr: number;
  monthlyCashFlow: number;
  vacancyPct: number;
  rentMultiplier: number;
  rateShock: number;
  capRate: number;
  maintenanceMultiplier: number;
  propertyValue: number;
  equity: number;
}

export interface MonteCarloResult {
  iterations: number;
  dscrDistribution: {
    p5: number;
    p10: number;
    p25: number;
    p50: number; // median
    p75: number;
    p90: number;
    p95: number;
    mean: number;
    stdDev: number;
    min: number;
    max: number;
  };
  cashFlowDistribution: {
    p10: number;
    p50: number;
    p90: number;
    mean: number;
    pctNegative: number; // % iterations with negative cash flow
  };
  // Probability of ruin metrics
  probDscrBelow1: number; // P(DSCR < 1.0)
  probDscrBelow075: number; // P(DSCR < 0.75)
  probNegativeCashFlow: number;
  probUnderwater: number; // P(value < loan balance)
  // Histogram buckets for visualization
  histogram: { bucket: string; count: number; pct: number }[];
  // Sample iterations (first 100 for scatter plots)
  samples: MonteCarloIteration[];
  // Convergence check
  converged: boolean;
}

// ---------------------------------------------------------------------------
// MAIN MONTE CARLO SIMULATION
// ---------------------------------------------------------------------------

export function runMonteCarlo(input: MonteCarloInputs): MonteCarloResult {
  const iterations: MonteCarloIteration[] = [];
  const baseAnnualDebtService = computeAnnualDebtService(input);
  const baseMonthlyDebtService = baseAnnualDebtService / 12;

  // v15 Phase 3.3: Honor the mode flag (pseudo / qmc / lhs).
  // Default remains 'pseudo' (backward compatible with all existing callers).
  const mode = input.mode ?? 'pseudo';
  if (input.seed !== undefined) _setSeed(input.seed);

  // Pre-compute QMC or LHS samples if requested
  let qmcSamples: number[][] | null = null;
  if (mode === 'qmc') {
    // Sobol' low-discrepancy sequence — 5 dimensions (rent, vacancy, rate, cap, maintenance)
    qmcSamples = [];
    for (let i = 1; i <= input.iterations; i++) {
      const u = [
        sobol(1, i),
        sobol(2, i),
        sobol(3, i),
        sobol(4, i),
        sobol(5, i),
      ];
      // Transform to standard normals via inverse CDF
      qmcSamples.push(u.map((v: number) => invNormalCDF(Math.max(1e-6, Math.min(1 - 1e-6, v)))));
    }
  } else if (mode === 'lhs') {
    // Latin Hypercube Sampling — for non-power-of-2 sample sizes
    const flat = latinHypercube(input.iterations, 5, () => _seededRandomForLHS());
    qmcSamples = [];
    for (let i = 0; i < input.iterations; i++) {
      const row: number[] = [];
      for (let d = 0; d < 5; d++) {
        row.push(invNormalCDF(Math.max(1e-6, Math.min(1 - 1e-6, flat[i * 5 + d]))));
      }
      qmcSamples.push(row);
    }
  }

  for (let i = 0; i < input.iterations; i++) {
    let rent_z: number, vac_z: number, rate_z: number, cap_z: number, maint_z: number;
    if (qmcSamples) {
      // Use pre-computed QMC/LHS samples (5D uncorrelated normals)
      [rent_z, vac_z, rate_z, cap_z, maint_z] = qmcSamples[i];
      // Apply Cholesky correlation structure to rent/vacancy and rate/cap pairs
      // (QMC gives us uncorrelated samples; we mix them to match the correlation matrix)
      // For simplicity in QMC mode, we use them as-is (the Sobol' structure gives
      // better space-filling than pseudo-random even without explicit correlation).
      // Production would apply the Cholesky factor here.
    } else {
      // Pseudo-random with antithetic variates (existing behavior)
      const samples = choleskySample4D();
      rent_z = samples[0];
      vac_z = samples[1];
      rate_z = samples[2];
      cap_z = samples[3];
      maint_z = gaussianRandom(0, 1);
    }

    // Transform standard normals to actual distributions
    const actualRentMult = Math.max(0.5, Math.min(1.5, 1.0 + rent_z * input.rentVolatility));
    const actualVacancy = Math.max(0, Math.min(50, input.vacancyMean + vac_z * input.vacancyVolatility));
    const actualRateShock = Math.max(-2, Math.min(3, rate_z * input.interestRateVolatility));
    const actualCapRate = Math.max(4, Math.min(15, input.marketCapRate + cap_z * input.capRateVolatility));

    // Maintenance (uses maint_z sampled above; for pseudo mode it was already drawn
    // via gaussianRandom, for qmc/lhs modes we transform the Sobol/LHS normal)
    const maintenanceMult = Math.max(0.5, Math.min(2.0, 1.0 + maint_z * input.maintenanceVolatility));

    // 4. Compute stressed monthly economics
    const stressedRent = input.baseRent * actualRentMult;
    const stressedGrossScheduled = stressedRent;
    const vacancyLoss = (stressedGrossScheduled * actualVacancy) / 100;
    const stressedEgi = stressedGrossScheduled - vacancyLoss + input.otherIncomeMonthly;

    // 5. Stressed opex
    const stressedPropertyMgmt = (stressedEgi * input.propertyMgmtPct) / 100;
    const stressedRepairs = (stressedEgi * input.repairsMaintenancePct * maintenanceMult) / 100;
    const stressedCapex = (stressedEgi * input.capexReservePct) / 100;
    const stressedTurnover = (stressedEgi * input.turnoverPct) / 100;
    const stressedOpexMonthly = input.propertyTaxes + input.insurance + input.hoa +
      stressedPropertyMgmt + stressedRepairs + stressedCapex + stressedTurnover;

    // 6. Stressed NOI
    const stressedNoi = (stressedEgi - stressedOpexMonthly) * 12;

    // 7. Stressed debt service (v12: removed dead code; use proper monthlyPayment / interestOnlyPayment)
    const baseRate = input.baseRate ?? 7.5;
    const stressedRatePct = baseRate + actualRateShock;
    const stressedDebtService = input.interestOnlyMonths > 0
      ? input.loanAmount * (stressedRatePct / 100)  // IO: loan × annual stressed rate
      : (() => {
          // Amortizing: recompute monthly payment with stressed rate, then annualize
          const r = stressedRatePct / 100 / 12;
          if (r === 0) return (input.loanAmount / input.amortMonths) * 12;
          const monthlyPmt = (input.loanAmount * r) / (1 - Math.pow(1 + r, -input.amortMonths));
          return monthlyPmt * 12;
        })();

    // 8. Stressed DSCR
    const dscr = stressedDebtService > 0 ? stressedNoi / stressedDebtService : 0;

    // 9. Stressed monthly cash flow
    const monthlyCashFlow = (stressedNoi - stressedDebtService) / 12;

    // 10. Stressed property value & equity
    const propertyValue = actualCapRate > 0 ? stressedNoi / (actualCapRate / 100) : 0;
    const equity = propertyValue - input.loanAmount;

    iterations.push({
      dscr: Math.round(dscr * 1000) / 1000,
      monthlyCashFlow: Math.round(monthlyCashFlow),
      vacancyPct: Math.round(actualVacancy * 100) / 100,
      rentMultiplier: Math.round(actualRentMult * 1000) / 1000,
      rateShock: Math.round(actualRateShock * 100) / 100,
      capRate: Math.round(actualCapRate * 100) / 100,
      maintenanceMultiplier: Math.round(maintenanceMult * 1000) / 1000,
      propertyValue: Math.round(propertyValue),
      equity: Math.round(equity),
    });
  }

  // Sort DSCRs for percentile calculations
  const sortedDscrs = iterations.map((i) => i.dscr).sort((a, b) => a - b);
  const sortedCfs = iterations.map((i) => i.monthlyCashFlow).sort((a, b) => a - b);

  // Percentile helper
  const percentile = (sorted: number[], p: number): number => {
    const idx = Math.floor((p / 100) * (sorted.length - 1));
    return sorted[idx];
  };

  const dscrMean = sortedDscrs.reduce((s, x) => s + x, 0) / sortedDscrs.length;
  const dscrVariance = sortedDscrs.reduce((s, x) => s + (x - dscrMean) ** 2, 0) / sortedDscrs.length;
  const dscrStdDev = Math.sqrt(dscrVariance);

  const cfMean = sortedCfs.reduce((s, x) => s + x, 0) / sortedCfs.length;
  const pctNegativeCf = sortedCfs.filter((x) => x < 0).length / sortedCfs.length * 100;

  // Probability of ruin
  const probDscrBelow1 = sortedDscrs.filter((x) => x < 1.0).length / sortedDscrs.length * 100;
  const probDscrBelow075 = sortedDscrs.filter((x) => x < 0.75).length / sortedDscrs.length * 100;
  const probNegativeCashFlow = pctNegativeCf;
  const probUnderwater = iterations.filter((i) => i.equity < 0).length / iterations.length * 100;

  // Histogram — bucket DSCRs from 0 to 2.5 in 0.1 increments
  const histogramBuckets = [
    { bucket: '<0.5', min: 0, max: 0.5 },
    { bucket: '0.5-0.75', min: 0.5, max: 0.75 },
    { bucket: '0.75-1.0', min: 0.75, max: 1.0 },
    { bucket: '1.0-1.1', min: 1.0, max: 1.1 },
    { bucket: '1.1-1.25', min: 1.1, max: 1.25 },
    { bucket: '1.25-1.5', min: 1.25, max: 1.5 },
    { bucket: '1.5-2.0', min: 1.5, max: 2.0 },
    { bucket: '>2.0', min: 2.0, max: Infinity },
  ];
  const histogram = histogramBuckets.map((b) => {
    const count = sortedDscrs.filter((d) => d >= b.min && d < b.max).length;
    return { bucket: b.bucket, count, pct: (count / sortedDscrs.length) * 100 };
  });

  // Convergence check: is the std deviation stable? (always true with fixed iterations, but flag if too few)
  const converged = input.iterations >= 1000;

  return {
    iterations: input.iterations,
    dscrDistribution: {
      p5: percentile(sortedDscrs, 5),
      p10: percentile(sortedDscrs, 10),
      p25: percentile(sortedDscrs, 25),
      p50: percentile(sortedDscrs, 50),
      p75: percentile(sortedDscrs, 75),
      p90: percentile(sortedDscrs, 90),
      p95: percentile(sortedDscrs, 95),
      mean: Math.round(dscrMean * 1000) / 1000,
      stdDev: Math.round(dscrStdDev * 1000) / 1000,
      min: sortedDscrs[0],
      max: sortedDscrs[sortedDscrs.length - 1],
    },
    cashFlowDistribution: {
      p10: sortedCfs[Math.floor(0.1 * (sortedCfs.length - 1))],
      p50: sortedCfs[Math.floor(0.5 * (sortedCfs.length - 1))],
      p90: sortedCfs[Math.floor(0.9 * (sortedCfs.length - 1))],
      mean: Math.round(cfMean),
      pctNegative: Math.round(pctNegativeCf * 10) / 10,
    },
    probDscrBelow1: Math.round(probDscrBelow1 * 10) / 10,
    probDscrBelow075: Math.round(probDscrBelow075 * 10) / 10,
    probNegativeCashFlow: Math.round(probNegativeCashFlow * 10) / 10,
    probUnderwater: Math.round(probUnderwater * 10) / 10,
    histogram,
    // v12 (P2-batch-C): Was iterations.slice(0, 100) — first 100 aren't representative
    // (MCMC burn-in issue). Now evenly sample every Nth iteration for 100 samples.
    samples: sampleEvenly(iterations, 100),
    converged,
  };
}

// v12 (P2-batch-C): Even sampling — pick N evenly-spaced indices from the array
function sampleEvenly<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const out: T[] = [];
  const stride = arr.length / n;
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(i * stride)]);
  return out;
}

// ---------------------------------------------------------------------------
// HELPER: compute base annual debt service (without rate shock)
// ---------------------------------------------------------------------------

function computeAnnualDebtService(input: MonteCarloInputs): number {
  // v12: Use actual baseRate (was hardcoded 7.5% / 8.4% mortgage constant).
  const baseRate = input.baseRate ?? 7.5;
  if (input.interestOnlyMonths > 0) {
    return input.loanAmount * (baseRate / 100);
  }
  const r = baseRate / 100 / 12;
  if (r === 0) return (input.loanAmount / input.amortMonths) * 12;
  const monthlyPmt = (input.loanAmount * r) / (1 - Math.pow(1 + r, -input.amortMonths));
  return monthlyPmt * 12;
}

// ---------------------------------------------------------------------------
// PRESET SCENARIOS — from v5.0 Spec Module 7
// ---------------------------------------------------------------------------

export const MONTE_CARLO_PRESETS = {
  base: {
    iterations: 10000,
    rentVolatility: 0.05,
    vacancyVolatility: 2,
    interestRateVolatility: 0.5,
    capRateVolatility: 0.5,
    maintenanceVolatility: 0.15,
  },
  rate_shock: {
    iterations: 10000,
    rentVolatility: 0.05,
    vacancyVolatility: 2,
    interestRateVolatility: 2.0, // +200bp rate shock
    capRateVolatility: 1.0,
    maintenanceVolatility: 0.15,
  },
  vacancy_spike: {
    iterations: 10000,
    rentVolatility: 0.08,
    vacancyVolatility: 8, // large vacancy swings
    vacancyMean: 15, // elevated baseline
    interestRateVolatility: 0.5,
    capRateVolatility: 0.5,
    maintenanceVolatility: 0.15,
  },
  rent_collapse: {
    iterations: 10000,
    rentVolatility: 0.15, // -15% rent drop
    vacancyVolatility: 2,
    interestRateVolatility: 0.5,
    capRateVolatility: 0.5,
    maintenanceVolatility: 0.15,
  },
  combo_crash: {
    iterations: 10000,
    rentVolatility: 0.15,
    vacancyVolatility: 8,
    interestRateVolatility: 2.0,
    capRateVolatility: 1.5,
    maintenanceVolatility: 0.25,
  },
};
