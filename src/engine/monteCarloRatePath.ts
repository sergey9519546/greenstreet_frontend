// ============================================================
// DSCR Deal Desk v11.9 — Monte Carlo ARM/SOFR Rate-Path Simulator
// Complements the deterministic 5-scenario engine (v11.8) with
// stochastic rate-path modeling using a Vasicek mean-reverting
// process (industry standard for short-rate modeling).
// ============================================================
//
// MODEL: Vasicek Ornstein-Uhlenbeck process
//   dr(t) = κ(θ - r(t-1)) dt + σ dW(t)
//   where:
//     κ (kappa) = mean reversion speed (per year)
//     θ (theta) = long-run mean SOFR
//     σ (sigma) = annual volatility
//     dW(t)     = Brownian motion (Gaussian shock)
//
// PROVENANCE: the r0 / θ levels below are a dated snapshot, registered in
// src/engine/dataVintage.ts as 'sofrModel' (asOf 2026-06-17, 30-day cadence).
// Re-pull them and update that entry together.
//
// CALIBRATION (to 2020-2025 SOFR history):
//   - Initial SOFR (r0): 3.59% (current, June 2026 snapshot)
//   - Long-run mean (θ): 3.50% (Fed long-run neutral rate estimate, Jun 2026 SEP median)
//   - Mean reversion (κ): 0.30 per year (typical for short rates; reaches θ in ~3 years)
//   - Volatility (σ): 1.20% (calibrated to 2020-2025 SOFR realized vol —
//     includes ZIRP era 0.05% and 2023 peak 5.33%)
//   - Fed shock: 8.3% monthly probability of ±50bps jump (~1 shock/year; models unscheduled Fed action, not literal FOMC meeting dates)
//
// REPRODUCIBILITY:
//   Uses Mulberry32 seeded PRNG (same as existing monteCarlo.ts).
//   Default seed = 42. Same seed + same inputs = identical output.
//   This is critical for audit-trail integrity: every simulation
//   result can be reproduced bit-for-bit.
// ============================================================

import type {
  ARMTerms,
  MonteCarloRatePathResult,
  RatePathOutcome,
  MarketIndexSnapshot,
} from './types';
import { simulateARMResetLadder, CURRENT_MARKET_SNAPSHOT, validateARMTerms } from './armResetEngine';
import { calculatePI } from './engine';

// Re-export so pages can import the snapshot from this module
export { CURRENT_MARKET_SNAPSHOT } from './armResetEngine';

// ============================================================
// SEEDED PRNG — Mulberry32 (deterministic, fast, good distribution)
// Same implementation as existing monteCarlo.ts for consistency.
// ============================================================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for standard normal random variate
function normalRandom(rng: () => number, mean: number, std: number): number {
  const u1 = drawUnit(rng);
  const u2 = drawUnit(rng);
  const z = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * std;
}

// ============================================================
// DEFAULT VASICEK MODEL PARAMETERS
// Calibrated to 2020-2025 SOFR history + Fed long-run projections
// ============================================================

export interface VasicekParameters {
  longRunMeanSOFR: number;        // θ — long-run mean (%)
  meanReversionSpeed: number;     // κ — per year
  volatility: number;             // σ — annual vol (%)
  initialSOFR: number;            // r0 — starting rate (%)
  shockProbMonthly: number;       // probability of Fed shock per month
  shockMagnitudeBps: number;      // ±bps when shock occurs
}

export const DEFAULT_VASICEK_PARAMS: VasicekParameters = {
  longRunMeanSOFR: 3.50,          // Fed long-run neutral rate (Jun 2026 SEP median)
  meanReversionSpeed: 0.30,       // 3-year half-life to long-run mean
  volatility: 1.20,               // calibrated to 2020-2025 SOFR realized vol
  initialSOFR: 3.59,              // current SOFR (Jun 17, 2026 snapshot)
  shockProbMonthly: 0.083,        // ~1 per year (12 monthly Bernoulli trials × 8.3%; FOMC itself meets ~8x/year — not modeled on real meeting dates)
  shockMagnitudeBps: 50,          // ±50bps typical FOMC move
};

const MAX_RATE_PATHS = 10_000;
const MAX_HORIZON_MONTHS = 1_200;
const MAX_MODEL_RATE_PCT = 25;
const MAX_MODEL_MEAN_REVERSION = 10;
const MAX_MODEL_SHOCK_BPS = 2_500;
const MAX_MONTE_CARLO_AMOUNT = Number.MAX_SAFE_INTEGER / 12;

function isFiniteInRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function finiteIntegerInRange(value: unknown, minimum: number, maximum: number): value is number {
  return isFiniteInRange(value, minimum, maximum) && Number.isInteger(value);
}

function validateVasicekParameters(params: VasicekParameters): string[] {
  const issues: string[] = [];
  const check = (value: unknown, name: string, minimum: number, maximum: number) => {
    if (!isFiniteInRange(value, minimum, maximum)) {
      issues.push(`${name} must be a finite value between ${minimum} and ${maximum}`);
    }
  };

  check(params?.longRunMeanSOFR, 'longRunMeanSOFR', 0, MAX_MODEL_RATE_PCT);
  check(params?.meanReversionSpeed, 'meanReversionSpeed', 0, MAX_MODEL_MEAN_REVERSION);
  check(params?.volatility, 'volatility', 0, MAX_MODEL_RATE_PCT);
  check(params?.initialSOFR, 'initialSOFR', 0, MAX_MODEL_RATE_PCT);
  check(params?.shockProbMonthly, 'shockProbMonthly', 0, 1);
  check(params?.shockMagnitudeBps, 'shockMagnitudeBps', 0, MAX_MODEL_SHOCK_BPS);
  return issues;
}

function validateRatePathInputs(
  armTerms: ARMTerms,
  loanBalanceAtReset: number,
  remainingTermMonths: number,
  qualifyingRent: number,
  monthlyFixedExpenses: number,
  simulations: number,
  horizonMonths: number,
  seed: number,
  params: VasicekParameters,
): string[] {
  const issues = [...validateARMTerms(armTerms), ...validateVasicekParameters(params)];
  const check = (value: unknown, name: string, minimum: number, maximum: number) => {
    if (!isFiniteInRange(value, minimum, maximum)) {
      issues.push(`${name} must be a finite value between ${minimum} and ${maximum}`);
    }
  };

  check(loanBalanceAtReset, 'loanBalanceAtReset', Number.EPSILON, MAX_MONTE_CARLO_AMOUNT);
  if (!finiteIntegerInRange(remainingTermMonths, 1, MAX_HORIZON_MONTHS)) {
    issues.push(`remainingTermMonths must be an integer between 1 and ${MAX_HORIZON_MONTHS}`);
  }
  check(qualifyingRent, 'qualifyingRent', 0, MAX_MONTE_CARLO_AMOUNT);
  check(monthlyFixedExpenses, 'monthlyFixedExpenses', 0, MAX_MONTE_CARLO_AMOUNT);
  if (!finiteIntegerInRange(simulations, 1, MAX_RATE_PATHS)) {
    issues.push(`simulations must be an integer between 1 and ${MAX_RATE_PATHS}`);
  }
  if (!finiteIntegerInRange(horizonMonths, 1, MAX_HORIZON_MONTHS)) {
    issues.push(`horizonMonths must be an integer between 1 and ${MAX_HORIZON_MONTHS}`);
  }
  if (!Number.isFinite(seed)) issues.push('seed must be finite');
  return issues;
}

function normalizeSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0;
}

function emptyHorizonStats(): { mean: number; p10: number; p90: number } {
  return { mean: 0, p10: 0, p90: 0 };
}

function invalidRatePathResult(issues: string[], seed: number): MonteCarloRatePathResult {
  return {
    analysisStatus: 'INVALID_ASSUMPTIONS',
    analysisIssues: issues,
    simulations: 0,
    horizonMonths: 0,
    seed: normalizeSeed(seed),
    paths: [],
    finalRateStats: { mean: 0, median: 0, p10: 0, p25: 0, p75: 0, p90: 0, stddev: 0 },
    dscrStats: { mean: 0, median: 0, p10: 0, p25: 0, p75: 0, p90: 0, min: 0, max: 0 },
    probabilityDSCRBelow1_0: 0,
    probabilityDSCRBelow1_25: 0,
    probabilityDSCRBelow1_50: 0,
    probabilityRateAboveLifetimeCap: 0,
    sofrAtHorizon: {
      year1: emptyHorizonStats(),
      year3: emptyHorizonStats(),
      year5: emptyHorizonStats(),
      year10: emptyHorizonStats(),
    },
    modelParameters: { process: 'VASICEK', ...DEFAULT_VASICEK_PARAMS },
    summary: `Analysis unavailable: ${issues.join('; ')}. No rate-path recommendation was produced.`,
  };
}

function assertValidPathSimulation(
  params: VasicekParameters,
  horizonMonths: number,
  rng: () => number,
  floorRate: number,
): void {
  const issues = validateVasicekParameters(params);
  if (!finiteIntegerInRange(horizonMonths, 1, MAX_HORIZON_MONTHS)) {
    issues.push(`horizonMonths must be an integer between 1 and ${MAX_HORIZON_MONTHS}`);
  }
  if (!isFiniteInRange(floorRate, 0, MAX_MODEL_RATE_PCT)) {
    issues.push(`floorRate must be a finite rate between 0 and ${MAX_MODEL_RATE_PCT}`);
  }
  if (isFiniteInRange(params?.initialSOFR, 0, MAX_MODEL_RATE_PCT) && params.initialSOFR < floorRate) {
    issues.push('initialSOFR must be at or above floorRate');
  }
  if (typeof rng !== 'function') issues.push('rng must be a function');
  if (issues.length > 0) throw new RangeError(`Invalid SOFR path assumptions: ${issues.join('; ')}.`);
}

function drawUnit(rng: () => number): number {
  const draw = rng();
  if (!isFiniteInRange(draw, 0, 1) || draw === 1) {
    throw new RangeError('rng must return a finite value in [0, 1).');
  }
  return draw;
}

// ============================================================
// SINGLE-PATH SOFR SIMULATION (Vasicek + Fed shocks)
// ============================================================

/**
 * Simulate a single SOFR rate path over `horizonMonths` months.
 *
 * Per month:
 *   1. Apply mean reversion: drift = κ × (θ - r_prev) × dt, where dt = 1/12
 *   2. Apply stochastic shock: σ × sqrt(dt) × Z, where Z ~ N(0,1)
 *   3. With probability shockProbMonthly, add ±shockMagnitudeBps jump
 *      (simulating unscheduled FOMC action — sign chosen by Z)
 *   4. Floor at 0.0% (nominal rates cannot go below zero in this model;
 *      if user wants negative rates, set floor to negative)
 *
 * Returns the full monthly path (length = horizonMonths + 1, includes r0).
 */
export function simulateSOFRPath(
  params: VasicekParameters,
  horizonMonths: number,
  rng: () => number,
  floorRate: number = 0.0,
): number[] {
  assertValidPathSimulation(params, horizonMonths, rng, floorRate);
  const dt = 1 / 12;
  const sqrtDt = Math.sqrt(dt);
  const path: number[] = [params.initialSOFR];
  let r = params.initialSOFR;

  for (let i = 0; i < horizonMonths; i++) {
    // Mean reversion drift: κ(θ - r) dt
    const drift = params.meanReversionSpeed * (params.longRunMeanSOFR - r) * dt;

    // Stochastic shock: σ sqrt(dt) Z
    const diffusion = params.volatility * sqrtDt * normalRandom(rng, 0, 1);

    // Fed shock jump (Poisson-like — Bernoulli trial per month)
    let jump = 0;
    if (drawUnit(rng) < params.shockProbMonthly) {
      // Sign of jump determined by another Gaussian draw (can be ±)
      jump = (normalRandom(rng, 0, 1) >= 0 ? 1 : -1) * (params.shockMagnitudeBps / 100);
    }

    r = r + drift + diffusion + jump;
    if (r < floorRate) r = floorRate;
    if (r > 25.0) r = 25.0;  // hard ceiling to prevent runaway paths
    path.push(r);
  }

  return path;
}

// ============================================================
// MAIN: MONTE CARLO ARM/SOFR RATE-PATH SIMULATOR
// ============================================================

/**
 * Run a Monte Carlo simulation of ARM/SOFR rate paths and compute
 * the distribution of DSCR outcomes.
 *
 * For each of `simulations` paths:
 *   1. Simulate a SOFR path (Vasicek + Fed shocks) over `horizonMonths`
 *   2. Take the average SOFR over the last 12 months as the "sustained SOFR"
 *      (since ARM reset ladder assumes a sustained index level)
 *   3. Walk the ARM reset ladder with that sustained SOFR
 *   4. Compute the stabilized rate, final DSCR, cap/floor hits
 *
 * Aggregate across all paths:
 *   - Final rate distribution (mean, percentiles, stddev)
 *   - DSCR distribution (mean, percentiles, min, max)
 *   - P(DSCR < 1.0/1.25/1.50)
 *   - P(rate hits lifetime cap)
 *   - SOFR at year 1/3/5/10 (mean + p10/p90)
 *   - Summary text
 *
 * @param armTerms ARM contract terms (caps, margin, etc.)
 * @param loanBalanceAtReset Remaining loan balance at first reset
 * @param remainingTermMonths Amortization term remaining at reset
 * @param qualifyingRent Qualifying rent (Track 1 — gross)
 * @param monthlyFixedExpenses Taxes + insurance + HOA + flood (monthly)
 * @param simulations Number of paths to simulate (default 1000)
 * @param horizonMonths Simulation horizon in months (default 120 = 10 years)
 * @param seed RNG seed for reproducibility (default 42)
 * @param params Vasicek model parameters (default DEFAULT_VASICEK_PARAMS)
 * @param marketSnapshot Market snapshot for current SOFR baseline (default CURRENT)
 */
export function runMonteCarloRatePath(
  armTerms: ARMTerms,
  loanBalanceAtReset: number,
  remainingTermMonths: number,
  qualifyingRent: number,
  monthlyFixedExpenses: number,
  simulations: number = 1000,
  horizonMonths: number = 120,
  seed: number = 42,
  params: VasicekParameters = DEFAULT_VASICEK_PARAMS,
  marketSnapshot: MarketIndexSnapshot = CURRENT_MARKET_SNAPSHOT,
): MonteCarloRatePathResult {
  const issues = validateRatePathInputs(
    armTerms,
    loanBalanceAtReset,
    remainingTermMonths,
    qualifyingRent,
    monthlyFixedExpenses,
    simulations,
    horizonMonths,
    seed,
    params,
  );
  if (issues.length > 0) return invalidRatePathResult(issues, seed);

  const normalizedSeed = normalizeSeed(seed);
  const rng = mulberry32(normalizedSeed);
  const paths: RatePathOutcome[] = [];
  const lifetimeCapRate = armTerms.initialRate + armTerms.lifetimeCapPct;

  // Trackers for SOFR-at-horizon percentiles
  const sofrAtYear1: number[] = [];
  const sofrAtYear3: number[] = [];
  const sofrAtYear5: number[] = [];
  const sofrAtYear10: number[] = [];

  for (let sim = 0; sim < simulations; sim++) {
    // Simulate the SOFR path
    const sofrPath = simulateSOFRPath(params, horizonMonths, rng);

    // Capture SOFR at key horizons (1yr=12mo, 3yr=36mo, 5yr=60mo, 10yr=120mo)
    if (sofrPath.length > 12) sofrAtYear1.push(sofrPath[12]);
    if (sofrPath.length > 36) sofrAtYear3.push(sofrPath[36]);
    if (sofrPath.length > 60) sofrAtYear5.push(sofrPath[60]);
    if (sofrPath.length > 120) sofrAtYear10.push(sofrPath[120]);

    // Take average SOFR over last 12 months as "sustained SOFR" for ARM reset ladder
    const last12 = sofrPath.slice(-12);
    const sustainedSOFR = last12.reduce((a, b) => a + b, 0) / last12.length;

    // Walk ARM reset ladder with sustained SOFR
    const ladder = simulateARMResetLadder(armTerms, sustainedSOFR, horizonMonths / 12);
    const stabilizedRate = ladder.stabilizedRate;

    // Compute final DSCR at stabilized rate
    const payment = calculatePI(loanBalanceAtReset, stabilizedRate, remainingTermMonths);
    const pitia = payment + monthlyFixedExpenses;
    const finalDSCR = pitia > 0 ? qualifyingRent / pitia : 0;

    paths.push({
      pathId: sim,
      finalSOFR: Math.round(sofrPath[sofrPath.length - 1] * 100) / 100,
      stabilizedRate: Math.round(stabilizedRate * 1000) / 1000,
      finalDSCR: Math.round(finalDSCR * 1000) / 1000,
      hitLifetimeCap: stabilizedRate >= lifetimeCapRate - 0.0001,
      hitFloor: stabilizedRate <= armTerms.floorRate + 0.0001,
    });
  }

  if (
    paths.length !== simulations ||
    paths.some((path) =>
      !isFiniteInRange(path.finalSOFR, 0, MAX_MODEL_RATE_PCT) ||
      !isFiniteInRange(path.stabilizedRate, 0, 100) ||
      !Number.isFinite(path.finalDSCR) ||
      path.finalDSCR < 0,
    )
  ) {
    return invalidRatePathResult(['Simulation produced a non-finite or out-of-domain path.'], seed);
  }

  // Aggregate stats
  const finalRates = paths.map(p => p.stabilizedRate);
  const finalDSCRs = paths.map(p => p.finalDSCR);

  const finalRateStats = computeStats(finalRates);
  const dscrStats = computeStats(finalDSCRs);

  // Probability distributions
  const probabilityDSCRBelow1_0 = finalDSCRs.filter(d => d < 1.0).length / simulations;
  const probabilityDSCRBelow1_25 = finalDSCRs.filter(d => d < 1.25).length / simulations;
  const probabilityDSCRBelow1_50 = finalDSCRs.filter(d => d < 1.50).length / simulations;
  const probabilityRateAboveLifetimeCap =
    paths.filter(p => p.hitLifetimeCap).length / simulations;

  const probabilities = [
    probabilityDSCRBelow1_0,
    probabilityDSCRBelow1_25,
    probabilityDSCRBelow1_50,
    probabilityRateAboveLifetimeCap,
  ];
  if (probabilities.some((probability) => !isFiniteInRange(probability, 0, 1))) {
    return invalidRatePathResult(['Simulation produced an invalid probability.'], seed);
  }

  // SOFR at horizons (mean, p10, p90)
  const sofrAtHorizon = {
    year1: computeHorizonStats(sofrAtYear1),
    year3: computeHorizonStats(sofrAtYear3),
    year5: computeHorizonStats(sofrAtYear5),
    year10: computeHorizonStats(sofrAtYear10),
  };

  // Build summary
  const summaryLines: string[] = [];
  summaryLines.push(
    `Monte Carlo ARM/SOFR simulation: ${simulations} paths × ${horizonMonths} months ` +
    `(Vasicek: θ=${params.longRunMeanSOFR}%, κ=${params.meanReversionSpeed}, σ=${params.volatility}%, ` +
    `r0=${params.initialSOFR}%, shock=${(params.shockProbMonthly * 100).toFixed(1)}%/mo × ±${params.shockMagnitudeBps}bps).`,
  );
  summaryLines.push(
    `Stabilized rate: mean ${finalRateStats.mean.toFixed(3)}%, median ${finalRateStats.median.toFixed(3)}%, ` +
    `p10 ${finalRateStats.p10.toFixed(3)}% (low), p90 ${finalRateStats.p90.toFixed(3)}% (high).`,
  );
  summaryLines.push(
    `Track 1 DSCR at stabilization: mean ${dscrStats.mean.toFixed(3)}, median ${dscrStats.median.toFixed(3)}, ` +
    `min ${dscrStats.min.toFixed(3)}, max ${dscrStats.max.toFixed(3)}.`,
  );
  summaryLines.push(
    `Probabilities: P(DSCR < 1.0) = ${(probabilityDSCRBelow1_0 * 100).toFixed(1)}% ` +
    `(deal-break), P(DSCR < 1.25) = ${(probabilityDSCRBelow1_25 * 100).toFixed(1)}% (marginal), ` +
    `P(DSCR < 1.50) = ${(probabilityDSCRBelow1_50 * 100).toFixed(1)}% (comfortable).`,
  );
  summaryLines.push(
    `P(rate hits lifetime cap ${lifetimeCapRate.toFixed(3)}%) = ${(probabilityRateAboveLifetimeCap * 100).toFixed(1)}%.`,
  );
  if (probabilityDSCRBelow1_0 > 0.20) {
    summaryLines.push(
      `🚨 P(DSCR < 1.0) > 20% — deal is FRAGILE under stochastic rate modeling. ` +
      `Recommend fixed product or substantial rate buydown.`,
    );
  } else if (probabilityDSCRBelow1_0 > 0.05) {
    summaryLines.push(
      `⚠️ P(DSCR < 1.0) 5-20% — deal has tail risk under stress rate paths. ` +
      `Monitor SOFR trajectory; consider refi trigger if P rises.`,
    );
  } else {
    summaryLines.push(
      `✅ P(DSCR < 1.0) < 5% — deal is ROBUST under stochastic rate modeling.`,
    );
  }
  const summary = summaryLines.join(' ');

  return {
    analysisStatus: 'READY',
    analysisIssues: [],
    simulations,
    horizonMonths,
    seed: normalizedSeed,
    paths,
    finalRateStats,
    dscrStats,
    probabilityDSCRBelow1_0,
    probabilityDSCRBelow1_25,
    probabilityDSCRBelow1_50,
    probabilityRateAboveLifetimeCap,
    sofrAtHorizon,
    modelParameters: {
      process: 'VASICEK',
      longRunMeanSOFR: params.longRunMeanSOFR,
      meanReversionSpeed: params.meanReversionSpeed,
      volatility: params.volatility,
      initialSOFR: params.initialSOFR,
      shockProbMonthly: params.shockProbMonthly,
      shockMagnitudeBps: params.shockMagnitudeBps,
    },
    summary,
  };
}

// ============================================================
// HELPERS
// ============================================================

function computeStats(values: number[]): {
  mean: number; median: number; p10: number; p25: number;
  p75: number; p90: number; stddev: number; min: number; max: number;
} {
  if (values.length === 0) {
    return { mean: 0, median: 0, p10: 0, p25: 0, p75: 0, p90: 0, stddev: 0, min: 0, max: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const stddev = Math.sqrt(variance);
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const pct = (p: number) => sorted[Math.min(n - 1, Math.floor(n * p))];
  return {
    mean: Math.round(mean * 1000) / 1000,
    median: Math.round(median * 1000) / 1000,
    p10: Math.round(pct(0.10) * 1000) / 1000,
    p25: Math.round(pct(0.25) * 1000) / 1000,
    p75: Math.round(pct(0.75) * 1000) / 1000,
    p90: Math.round(pct(0.90) * 1000) / 1000,
    stddev: Math.round(stddev * 1000) / 1000,
    min: Math.round(sorted[0] * 1000) / 1000,
    max: Math.round(sorted[n - 1] * 1000) / 1000,
  };
}

function computeHorizonStats(values: number[]): { mean: number; p10: number; p90: number } {
  if (values.length === 0) return { mean: 0, p10: 0, p90: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  return {
    mean: Math.round(mean * 100) / 100,
    p10: Math.round(sorted[Math.floor(n * 0.10)] * 100) / 100,
    p90: Math.round(sorted[Math.floor(n * 0.90)] * 100) / 100,
  };
}
