// ============================================================
// DSCR Monte Carlo Risk Engine — v8 (regime-switching, calibrated)
// ============================================================
// Phase 4 recalibration per GAP_MONTE_CARLO_CALIBRATION.md:
//   - 2-state regime-switching Markov chain (normal / stress)
//   - Correlated rent / vacancy / rate shocks (Cholesky of the FRED-verified
//     correlation matrix: rent↔vacancy −0.48, rent↔rate +0.44)
//   - CIR short-rate (non-negative, vol scales with level) for ARM resets
//   - State-calibrated insurance regime (FL/LA high, CA/TX moderate, else low)
//   - Track 2 opex from the TCO single source (tcoDscr.ts)
// API + output shape preserved (adds two optional fields).

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
import { computeTcoRate, mapToTcoType, type TcoPropertyAge, type TcoMarketType } from './tcoDscr';

// Seeded PRNG (Mulberry32) — deterministic.
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal via Box-Muller. */
function stdNormal(rng: () => number): number {
  const u1 = rng() || 1e-9;
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ── Calibration (GAP_MONTE_CARLO_CALIBRATION) ──────────────────────────────
// Monthly regime transition: normal→stress 0.03, stress→normal 0.15.
const P_NORMAL_TO_STRESS = 0.03;
const P_STRESS_TO_NORMAL = 0.15;
// Rent annual drift by regime; stress amplifies σ ×1.5.
const RENT_MU_NORMAL = 0.035;
const RENT_MU_STRESS = -0.025;
const STRESS_SIGMA_MULT = 1.5;
// Vacancy Ornstein-Uhlenbeck (annual reversion 0.7, σ 1.5pp), bounded.
const VAC_MEAN = 0.08;
const VAC_REVERSION = 0.7;
const VAC_SIGMA = 0.015;
// CIR short rate: a=0.5, b=3.5%, σ=0.75%/yr.
const CIR_A = 0.5;
const CIR_B = 0.035;
const CIR_SIGMA = 0.0075;
// This model is calibrated to 2026. Keeping the age bucket on that vintage is
// necessary for a seeded replay to mean the same thing next year.
const CALIBRATION_YEAR = 2026;
const MAX_SIMULATIONS = 10_000;
const MAX_MONTE_CARLO_AMOUNT = Number.MAX_SAFE_INTEGER / 12;

// Lower-Cholesky of corr[(rent, vacancy, rate)] =
//   [[1, -0.48, 0.44], [-0.48, 1, -0.30], [0.44, -0.30, 1]]
// Precomputed (see GAP_MONTE_CARLO_CALIBRATION §6).
const L21 = -0.48, L22 = 0.8773;
const L31 = 0.44, L32 = -0.1012, L33 = 0.8923;

/** Annual rent σ by property profile (Zillow ZORI ranges). */
function rentSigmaAnnual(unitCount: number, isSTR: boolean, isMTR: boolean): number {
  if (isSTR) return 0.15;
  if (isMTR) return 0.08;
  if (unitCount >= 5) return 0.03;
  if (unitCount >= 2) return 0.04;
  return 0.05; // SFR
}

/** State insurance regime: annual growth + post-cat jump probability/size. */
function insuranceProfile(state: string): { muAnnual: number; jumpProb: number; jumpMin: number; jumpMax: number } {
  const s = (state || '').toUpperCase();
  if (s === 'FL' || s === 'LA') return { muAnnual: 0.08, jumpProb: 0.05, jumpMin: 0.30, jumpMax: 0.80 };
  if (s === 'TX') return { muAnnual: 0.06, jumpProb: 0.03, jumpMin: 0.20, jumpMax: 0.50 };
  if (s === 'CA' || s === 'CO' || s === 'OK') return { muAnnual: 0.05, jumpProb: 0.03, jumpMin: 0.15, jumpMax: 0.40 };
  return { muAnnual: 0.04, jumpProb: 0.01, jumpMin: 0.10, jumpMax: 0.25 };
}

function tcoAgeFromYear(yearBuilt: number): TcoPropertyAge {
  const age = CALIBRATION_YEAR - (Number.isFinite(yearBuilt) ? yearBuilt : 2000);
  if (age <= 5) return 'NEW';
  if (age <= 15) return 'AVERAGE';
  if (age <= 30) return 'AGING';
  return 'OLD';
}

function assertFiniteInRange(value: unknown, name: string, minimum: number, maximum: number): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be a finite number between ${minimum} and ${maximum}.`);
  }
}

function assertMonteCarloInputs(
  property: PropertyInputs,
  loan: LoanStructure,
  strategy: RentalStrategy,
  dscrResult: DSCRResult,
  simulations: number,
  seed: number,
): void {
  if (!Number.isInteger(simulations) || simulations < 1 || simulations > MAX_SIMULATIONS) {
    throw new RangeError(`simulations must be an integer between 1 and ${MAX_SIMULATIONS}.`);
  }
  if (!Number.isFinite(seed)) throw new RangeError('seed must be finite.');
  if (!['LTR', 'STR', 'MTR'].includes(strategy)) throw new RangeError('strategy must be LTR, STR, or MTR.');
  if (!['30_YR', '40_YR', '15_YR'].includes(loan.term)) throw new RangeError('loan.term is invalid.');
  if (!['FIXED', '5_6_ARM', '7_6_ARM', '10_6_ARM'].includes(loan.armType)) {
    throw new RangeError('loan.armType is invalid.');
  }

  assertFiniteInRange(property.purchasePrice, 'property.purchasePrice', Number.EPSILON, MAX_MONTE_CARLO_AMOUNT);
  assertFiniteInRange(property.unitCount, 'property.unitCount', 1, 10_000);
  assertFiniteInRange(property.annualTaxes, 'property.annualTaxes', 0, MAX_MONTE_CARLO_AMOUNT);
  assertFiniteInRange(property.annualInsurance, 'property.annualInsurance', 0, MAX_MONTE_CARLO_AMOUNT);
  assertFiniteInRange(property.hoa, 'property.hoa', 0, MAX_MONTE_CARLO_AMOUNT);
  assertFiniteInRange(property.floodInsurance, 'property.floodInsurance', 0, MAX_MONTE_CARLO_AMOUNT);
  assertFiniteInRange(loan.ltv, 'loan.ltv', 0, 100);
  assertFiniteInRange(dscrResult.qualifyingRent, 'dscrResult.qualifyingRent', 0, MAX_MONTE_CARLO_AMOUNT);
  assertFiniteInRange(dscrResult.solvedRate, 'dscrResult.solvedRate', 0, 100);
  assertFiniteInRange(
    dscrResult.monthlyPITIA.principalAndInterest,
    'dscrResult.monthlyPITIA.principalAndInterest',
    0,
    MAX_MONTE_CARLO_AMOUNT,
  );
  assertFiniteInRange(
    dscrResult.cashToClose.reserveRequirement,
    'dscrResult.cashToClose.reserveRequirement',
    0,
    MAX_MONTE_CARLO_AMOUNT,
  );
}

export function runMonteCarlo(
  property: PropertyInputs,
  loan: LoanStructure,
  strategy: RentalStrategy,
  dscrResult: DSCRResult,
  simulations: number = 2500,
  seed: number = 42,
): MonteCarloResult {
  assertMonteCarloInputs(property, loan, strategy, dscrResult, simulations, seed);
  const rng = mulberry32(Math.trunc(seed) >>> 0);
  const isSTR = strategy === 'STR';
  const isMTR = strategy === 'MTR';

  const baseRent = dscrResult.qualifyingRent;
  const baseLoanAmount = property.purchasePrice * (loan.ltv / 100);
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
  const termMonths = termYears * 12;
  const baseReserves = dscrResult.cashToClose.reserveRequirement;
  const isARM = loan.armType !== 'FIXED';

  const rentSigmaMo = rentSigmaAnnual(property.unitCount, isSTR, isMTR) / Math.sqrt(12);
  const ins = insuranceProfile(property.state);
  const marketType: TcoMarketType = property.isDecliningMarket ? 'SLOW' : 'NORMAL';
  const tcoRate = computeTcoRate({
    propertyType: mapToTcoType(property.unitCount, isSTR),
    propertyAge: tcoAgeFromYear(property.yearBuilt),
    marketType,
  });
  // Non-vacancy opex (vacancy is modeled stochastically below).
  const opexNonVac = tcoRate.management + tcoRate.maintenance + tcoRate.capex;

  const maintenanceShockProbMonthly = 0.015;
  const baseFlood = (property.floodInsurance || 0) / 12;

  const annualCashFlows: number[] = [];
  const dscrValues: number[] = [];
  const reserveCurves: number[][] = [];
  let dscrAbove1Count = 0;
  let track2Below1Count = 0;
  let negCashFlowCount = 0;
  let totalStressMonths = 0;

  for (let sim = 0; sim < simulations; sim++) {
    let regimeStress = false;
    let rent = baseRent;
    let vacancy = VAC_MEAN;
    let rate = dscrResult.solvedRate / 100;       // decimal
    let monthlyTax = property.annualTaxes / 12;
    let monthlyIns = property.annualInsurance / 12;
    let pi = dscrResult.monthlyPITIA.principalAndInterest;

    let yearCashFlow = 0;
    let reserves = baseReserves;
    const reserveCurve: number[] = [];

    for (let month = 1; month <= 12; month++) {
      // 1. Regime transition (Markov).
      regimeStress = regimeStress
        ? rng() > P_STRESS_TO_NORMAL
        : rng() < P_NORMAL_TO_STRESS;
      if (regimeStress) totalStressMonths++;
      const sigMult = regimeStress ? STRESS_SIGMA_MULT : 1;

      // 2. Correlated factor draws (rent, vacancy, rate).
      const z1 = stdNormal(rng), z2 = stdNormal(rng), z3 = stdNormal(rng);
      const fRent = z1;
      const fVac = L21 * z1 + L22 * z2;
      const fRate = L31 * z1 + L32 * z2 + L33 * z3;

      // 3. Rent — regime drift + correlated shock.
      const rentMuMo = (regimeStress ? RENT_MU_STRESS : RENT_MU_NORMAL) / 12;
      rent = Math.max(0, rent * (1 + rentMuMo + rentSigmaMo * sigMult * fRent));

      // 4. Vacancy — OU toward 8%, correlated (negatively) with rent.
      vacancy += (VAC_REVERSION / 12) * (VAC_MEAN - vacancy) + (VAC_SIGMA / Math.sqrt(12)) * sigMult * fVac;
      vacancy = Math.min(0.30, Math.max(0.02, vacancy));

      // 5. Rate — CIR (non-negative), only matters for ARMs.
      if (isARM) {
        const dr = CIR_A * (CIR_B - rate) / 12 + CIR_SIGMA * Math.sqrt(Math.max(rate, 0)) * (fRate / Math.sqrt(12));
        rate = Math.max(0.0002, rate + dr);
        pi = calculatePI(baseLoanAmount, rate * 100, termMonths);
      }

      // 6. Insurance — state regime growth + occasional post-cat jump.
      monthlyIns *= (1 + ins.muAnnual / 12);
      if (rng() < ins.jumpProb / 12) {
        monthlyIns *= (1 + ins.jumpMin + rng() * (ins.jumpMax - ins.jumpMin));
      }
      // 7. Tax — modest drift + rare reassessment bump.
      monthlyTax *= (1 + 0.03 / 12);
      if (rng() < 0.02 / 12) monthlyTax *= 1.15;

      // 8. Cash flow (Track 2: effective rent after vacancy − opex − PITIA − shock).
      const effectiveRent = rent * (1 - vacancy);
      let maintenanceShock = 0;
      if (rng() < maintenanceShockProbMonthly) maintenanceShock = 500 + rng() * 7500;
      const monthlyPITIA = pi + monthlyTax + monthlyIns + property.hoa + baseFlood;
      const cashFlow = effectiveRent - effectiveRent * opexNonVac - monthlyPITIA - maintenanceShock;

      yearCashFlow += cashFlow;
      reserves = Math.max(0, reserves + cashFlow);
      reserveCurve.push(reserves);
    }

    annualCashFlows.push(yearCashFlow);

    // Year-end DSCR snapshots.
    const endPITIA = pi + monthlyTax + monthlyIns + property.hoa + baseFlood;
    const track1 = endPITIA > 0 ? rent / endPITIA : 0;
    const track2 = endPITIA > 0 ? (rent * (1 - vacancy - opexNonVac)) / endPITIA : 0;
    dscrValues.push(track1);
    if (track1 >= 1.0) dscrAbove1Count++;
    if (track2 < 1.0) track2Below1Count++;
    if (yearCashFlow < 0) negCashFlowCount++;
    reserveCurves.push(reserveCurve);
  }

  // Percentiles.
  const sortedCF = [...annualCashFlows].sort((a, b) => a - b);
  const pct = (p: number) => sortedCF[Math.min(simulations - 1, Math.floor(simulations * p))];

  // Reserve depletion curve.
  const reserveDepletionCurve: ReserveDepletionPoint[] = [];
  for (let m = 0; m < 12; m++) {
    const r = reserveCurves.map((c) => c[m]).sort((a, b) => a - b);
    reserveDepletionCurve.push({
      month: m + 1,
      p10Reserve: r[Math.floor(simulations * 0.10)],
      p50Reserve: r[Math.floor(simulations * 0.50)],
      p90Reserve: r[Math.floor(simulations * 0.90)],
    });
  }

  // DSCR distribution (20-bin histogram).
  const dscrMin = Math.min(...dscrValues);
  const dscrMax = Math.max(...dscrValues);
  const binWidth = (dscrMax - dscrMin) / 20 || 1;
  const dscrDistribution: DSCRDistributionPoint[] = [];
  for (let i = 0; i < 20; i++) {
    const binStart = dscrMin + i * binWidth;
    const count = dscrValues.filter((d) => d >= binStart && d < binStart + binWidth).length;
    dscrDistribution.push({ dscr: Math.round((binStart + binWidth / 2) * 100) / 100, probability: count / simulations });
  }

  const keyRisks: RiskItem[] = [
    { risk: 'DSCR < 1.0 (qualification failure)', probability: 1 - dscrAbove1Count / simulations, impact: 1.0 },
    { risk: 'Investor-survival DSCR < 1.0 (Track 2)', probability: track2Below1Count / simulations, impact: 0.8 },
    { risk: 'Negative Annual Cash Flow', probability: negCashFlowCount / simulations, impact: 0.7 },
    { risk: 'Recession regime persistence', probability: totalStressMonths / (simulations * 12), impact: 0.6 },
    { risk: 'Insurance post-catastrophe spike', probability: ins.jumpProb, impact: 0.5 },
  ];
  keyRisks.sort((a, b) => b.probability * b.impact - a.probability * a.impact);

  return {
    simulations,
    probabilityDSCRAbove1_0: dscrAbove1Count / simulations,
    probabilityNegativeCashFlow: negCashFlowCount / simulations,
    expectedAnnualCashFlow: { p10: pct(0.10), p25: pct(0.25), p50: pct(0.50), p75: pct(0.75), p90: pct(0.90) },
    reserveDepletionCurve,
    dscrDistribution,
    keyRisks,
    probabilityTrack2Below1: track2Below1Count / simulations,
    avgTimeInStressPct: totalStressMonths / (simulations * 12),
  };
}
