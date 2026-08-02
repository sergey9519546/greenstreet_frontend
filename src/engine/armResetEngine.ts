// ============================================================
// DSCR Deal Desk v11.0 — ARM / SOFR Rate Reset Engine
// Part B": Model ARM rate reset risk; Track 1 DSCR at reset
// ============================================================
//
// VERIFIED MARKET INDEX SNAPSHOT (June 17, 2026):
//   10yr Treasury: 4.44-4.47% (FRED DGS10)              [Refs 27,28,36]
//   5yr Treasury:  4.26%   (Northmarq, Jun 2026)        [Ref 29]
//   30-day SOFR:   3.59%   (Northmarq, Jun 2026)        [Ref 29]
//   Fed Funds Eff: 3.62%   (FRB H.15, Jun 16, 2026)     [Ref 30]
//   Fed Funds Target: 3.50-3.75% (held 4th consecutive) [Ref 31]
//   Freddie Mac 30yr: 6.53% (Jun 8, 2026)               [Ref 32,33]
// ============================================================

import type {
  ARMTerms,
  ARMResetResult,
  MarketIndexSnapshot,
  PropertyInputs,
  MultiScenarioARMResult,
  ARMScenarioResult,
  ARMScenarioName,
  ARMResetTrajectoryPointLite,
  PaymentShockResult,
  DSCRBreakYearResult,
  RefiTriggerResult,
} from './types';
import { calculatePI, calculatePaymentFactor } from './engine';

// ============================================================
// CURRENT MARKET SNAPSHOT — Verified June 17, 2026
// ============================================================

export const CURRENT_MARKET_SNAPSHOT: MarketIndexSnapshot = {
  asOfDate: '2026-06-17',
  treasury10Y: 4.47,
  treasury5Y: 4.26,
  sofr30Day: 3.59,
  fedFundsEffective: 3.62,
  fedFundsTargetLower: 3.50,
  fedFundsTargetUpper: 3.75,
  freddieMac30YrFixed: 6.53,
  provenance: 'VERIFIED_PRIMARY',
  source: 'FRED DGS10 (Jun 15-17); FRB H.15 (Jun 16); Northmarq (Jun 2026)',
};

// Stress test scenario: SOFR rises 140 bps to 5.00%
export const STRESS_SOFR_PCT = 5.0;

// ============================================================
// DEFAULT ARM PROGRAMS (verified typical structures)
// ============================================================

export const DEFAULT_ARM_PROGRAMS: Record<string, ARMTerms> = {
  '5_6_ARM': {
    armType: '5_6_ARM',
    index: 'SOFR_30D',
    marginPct: 2.75,        // typical 250-350 bps; midpoint
    initialRate: 5.125,     // Griffin June 2026 starting rate
    initialCapPct: 2.0,     // typical first-reset cap
    periodicCapPct: 1.0,    // +1% per reset period
    lifetimeCapPct: 5.0,    // +5% over initial
    floorRate: 5.125,       // most DSCR ARM floors = initial
    fixedPeriodMonths: 60,  // 5yr fixed
    resetFrequencyMonths: 6,
  },
  '7_6_ARM': {
    armType: '7_6_ARM',
    index: 'SOFR_30D',
    marginPct: 2.85,
    initialRate: 5.375,
    initialCapPct: 2.0,
    periodicCapPct: 1.0,
    lifetimeCapPct: 5.0,
    floorRate: 5.375,
    fixedPeriodMonths: 84,
    resetFrequencyMonths: 6,
  },
  '10_6_ARM': {
    armType: '10_6_ARM',
    index: 'SOFR_30D',
    marginPct: 3.00,
    initialRate: 5.625,
    initialCapPct: 2.0,
    periodicCapPct: 1.0,
    lifetimeCapPct: 5.0,
    floorRate: 5.625,
    fixedPeriodMonths: 120,
    resetFrequencyMonths: 6,
  },
};

// ============================================================
// ARM RATE RESET COMPUTATION
// ============================================================

/**
 * Simulate the ARM reset ladder under a sustained index value, enforcing
 * per-reset caps as a real ARM contract does.
 *
 * Reset rules (standard DSCR ARM contract). clamp(x, lo, hi) = min(max(x, lo), hi);
 * the LOWER bound is the contractual `floorRate` (NOT prev_rate — the rate may
 * step down toward the floor when the index falls). This mirrors the code below
 * (`newRate = min(fullyIndexed, ceiling); newRate = max(newRate, floorRate)`):
 *   Reset 1 (first reset, at end of fixed period):
 *     new_rate = clamp(
 *       index + margin,
 *       floorRate,                      // contractual floor (lower bound)
 *       initial + initialCap            // ceiling on first reset
 *     )
 *   Reset 2..N (every resetFrequencyMonths thereafter):
 *     new_rate = clamp(
 *       index + margin,
 *       floorRate,                      // contractual floor (lower bound)
 *       min(prev_rate + periodicCap, initial + lifetimeCap)   // prev_rate only sets the periodic ceiling
 *     )
 *
 * If `index + margin` falls below the previous rate, the rate steps DOWN,
 * bounded only by the contractual `floorRate` (often set at the initial rate).
 *
 * Returns:
 *   - `trajectory`: array of { resetNumber, year, rate } for each reset
 *   - `stabilizedRate`: the rate at the last reset (where it has either hit
 *     the lifetime cap or converged to index + margin)
 *   - `yearsToLifetimeCap`: years until the rate hits lifetime cap, or null
 */
export interface ARMResetTrajectoryPoint {
  resetNumber: number;       // 1 = first reset
  year: number;              // year of reset (from loan origination)
  rate: number;              // rate after this reset
  capBinding: 'NONE' | 'INITIAL_CAP' | 'PERIODIC_CAP' | 'LIFETIME_CAP' | 'FLOOR';
}

export interface ARMResetLadderResult {
  trajectory: ARMResetTrajectoryPoint[];
  stabilizedRate: number;          // final rate after the ladder settles
  yearsToLifetimeCap: number | null;
  lifetimeCapRate: number;         // initial + lifetimeCap
}

export function simulateARMResetLadder(
  armTerms: ARMTerms,
  sustainedIndexPct: number,
  horizonYears: number = 10,
): ARMResetLadderResult {
  const resetPeriodYears = armTerms.resetFrequencyMonths / 12;
  const maxResets = Math.max(
    1,
    Math.floor((horizonYears - armTerms.fixedPeriodMonths / 12) / resetPeriodYears),
  );

  const lifetimeCapRate = armTerms.initialRate + armTerms.lifetimeCapPct;
  const fullyIndexedRate = Math.max(
    armTerms.floorRate,
    sustainedIndexPct + armTerms.marginPct,
  );

  const trajectory: ARMResetTrajectoryPoint[] = [];
  let prevRate = armTerms.initialRate;
  let yearsToLifetimeCap: number | null = null;

  for (let i = 1; i <= maxResets; i++) {
    const year = armTerms.fixedPeriodMonths / 12 + (i - 1) * resetPeriodYears;
    let newRate: number;
    let capBinding: ARMResetTrajectoryPoint['capBinding'];

    if (i === 1) {
      // First reset: bounded by initial + initialCap
      const ceiling = armTerms.initialRate + armTerms.initialCapPct;
      newRate = Math.min(fullyIndexedRate, ceiling);
      newRate = Math.max(newRate, armTerms.floorRate);
      capBinding =
        newRate >= ceiling ? 'INITIAL_CAP' :
        newRate <= armTerms.floorRate ? 'FLOOR' : 'NONE';
    } else {
      // Subsequent resets: bounded by prev + periodicCap, ceiling = lifetime cap
      const ceiling = Math.min(prevRate + armTerms.periodicCapPct, lifetimeCapRate);
      newRate = Math.min(fullyIndexedRate, ceiling);
      newRate = Math.max(newRate, armTerms.floorRate);
      capBinding =
        newRate >= lifetimeCapRate ? 'LIFETIME_CAP' :
        newRate >= prevRate + armTerms.periodicCapPct - 0.0001 ? 'PERIODIC_CAP' :
        newRate <= armTerms.floorRate ? 'FLOOR' : 'NONE';
    }

    trajectory.push({ resetNumber: i, year: Math.round(year * 10) / 10, rate: Math.round(newRate * 1000) / 1000, capBinding });

    if (yearsToLifetimeCap === null && newRate >= lifetimeCapRate - 0.0001) {
      yearsToLifetimeCap = year;
    }

    prevRate = newRate;
    // If we've hit the lifetime cap, no point continuing
    if (newRate >= lifetimeCapRate - 0.0001 && i > 1) break;
  }

  return {
    trajectory,
    stabilizedRate: prevRate,
    yearsToLifetimeCap,
    lifetimeCapRate,
  };
}

/**
 * Compute ARM reset rate under three scenarios:
 *   1. Current index + margin (first reset, capped at initialCap)
 *   2. Stress index (SOFR = 5.0%) — modeled as a sustained shock, walking the
 *      full reset ladder with per-period caps enforced. Per ARM contracts, the
 *      rate cannot jump straight to the lifetime cap in a single reset; it can
 *      only rise by `periodicCapPct` per period (after the first reset which is
 *      governed by `initialCapPct`).
 *   3. Lifetime cap (= initial + lifetime cap) — the structural ceiling that
 *      binds after enough consecutive upward resets.
 *
 * Per Part B":
 *   reset_rate = max(floor_rate, index + margin)
 *   first-reset cap = min(reset_rate, initial + initialCap)
 *   subsequent caps = min(prev_rate + periodicCap, initial + lifetimeCap)
 *
 * For each reset rate, compute:
 *   - Recast P&I (using remaining balance at reset)
 *   - Track 1 DSCR at reset (qualifyingRent / new PITIA)
 *
 * For IO+ARM files: flag the year of "double shock" — IO expiry + ARM reset.
 *
 * v11.1 FIX (AUDIT-FINAL): Previous version applied lifetime cap as a single-
 * reset cap for the stress scenario — that is mathematically and contractually
 * wrong. A 5/6 ARM with initial 5.125%, periodic cap 1%, lifetime cap 5% cannot
 * reach 10.125% in one reset; it requires 5 consecutive upward resets (initial
 * +2% first reset, then +1%/period for 3 more periods = +5% total over ~2 years
 * of resets, i.e. ~7 years after first reset). The new `simulateARMResetLadder`
 * function walks the actual reset schedule.
 */
export function computeARMReset(
  armTerms: ARMTerms,
  loanBalanceAtReset: number,
  remainingTermMonths: number,
  qualifyingRent: number,
  monthlyFixedExpenses: number, // taxes + insurance + HOA + flood (monthly)
  ioPeriodMonths: number = 0,
  marketSnapshot: MarketIndexSnapshot = CURRENT_MARKET_SNAPSHOT,
): ARMResetResult {
  const currentIndex = getIndexValue(armTerms.index, marketSnapshot);

  // Scenario 1: First reset at current index — capped at initialCap
  const rawCurrentResetRate = currentIndex + armTerms.marginPct;
  const currentResetRateBeforeFloor = Math.min(
    rawCurrentResetRate,
    armTerms.initialRate + armTerms.initialCapPct,
  );
  const resetRateAtCurrentIndex = Math.max(currentResetRateBeforeFloor, armTerms.floorRate);

  // Scenario 2: Stress — simulate the full reset ladder under sustained stress
  // SOFR = 5.0% for the entire reset horizon. Each reset applies per-period cap.
  const stressIndex = STRESS_SOFR_PCT;
  const stressLadder = simulateARMResetLadder(
    armTerms,
    stressIndex,
    /* horizonYears */ 10,
  );
  // After sustained stress, rate climbs toward lifetime cap. Take the rate at
  // the point where the ladder stabilizes (typically 4-5 reset periods).
  const resetRateAtStressIndex = stressLadder.stabilizedRate;

  // Scenario 3: Lifetime cap — structural ceiling
  const resetRateAtLifetimeCap = armTerms.initialRate + armTerms.lifetimeCapPct;

  // Compute payments at each reset rate (amortizing over remaining term)
  const paymentAtCurrentReset = calculatePI(loanBalanceAtReset, resetRateAtCurrentIndex, remainingTermMonths);
  const paymentAtStressReset = calculatePI(loanBalanceAtReset, resetRateAtStressIndex, remainingTermMonths);
  const paymentAtLifetimeCap = calculatePI(loanBalanceAtReset, resetRateAtLifetimeCap, remainingTermMonths);

  // Track 1 DSCR at each reset = qualifyingRent / (new_PI + fixed_expenses)
  const pitiaAtCurrentReset = paymentAtCurrentReset + monthlyFixedExpenses;
  const pitiaAtStressReset = paymentAtStressReset + monthlyFixedExpenses;
  const pitiaAtLifetimeCap = paymentAtLifetimeCap + monthlyFixedExpenses;

  const track1DSCRAtCurrentReset = pitiaAtCurrentReset > 0 ? qualifyingRent / pitiaAtCurrentReset : 0;
  const track1DSCRAtStressReset = pitiaAtStressReset > 0 ? qualifyingRent / pitiaAtStressReset : 0;
  const track1DSCRAtLifetimeCap = pitiaAtLifetimeCap > 0 ? qualifyingRent / pitiaAtLifetimeCap : 0;

  // Years to first reset
  const yearsToFirstReset = armTerms.fixedPeriodMonths / 12;

  // Deal-break rate at reset
  const dealBreakRate = solveDealBreakRate(qualifyingRent, loanBalanceAtReset, remainingTermMonths, monthlyFixedExpenses);
  const cushionBpsAtStress = Math.round((dealBreakRate - resetRateAtStressIndex) * 100);

  // IO+ARM double-shock year
  let ioArmDoubleShockYear: number | null = null;
  let doubleShockRisk: 'NONE' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'NONE';

  if (ioPeriodMonths > 0) {
    const ioExpiryYear = Math.ceil(ioPeriodMonths / 12);
    const armResetYear = armTerms.fixedPeriodMonths / 12;
    if (Math.abs(ioExpiryYear - armResetYear) <= 1) {
      ioArmDoubleShockYear = Math.max(ioExpiryYear, armResetYear);
      doubleShockRisk = 'CRITICAL';
    } else if (Math.abs(ioExpiryYear - armResetYear) <= 2) {
      ioArmDoubleShockYear = Math.max(ioExpiryYear, armResetYear);
      doubleShockRisk = 'HIGH';
    } else {
      doubleShockRisk = 'MODERATE';
    }
  }

  // Build warning message
  const warningMessage = buildWarning(
    armTerms,
    currentIndex,
    resetRateAtCurrentIndex,
    resetRateAtStressIndex,
    track1DSCRAtCurrentReset,
    track1DSCRAtStressReset,
    dealBreakRate,
    cushionBpsAtStress,
    ioArmDoubleShockYear,
    doubleShockRisk,
  );

  return {
    initialRate: armTerms.initialRate,
    currentIndex,
    margin: armTerms.marginPct,
    resetRateAtCurrentIndex: Math.round(resetRateAtCurrentIndex * 1000) / 1000,
    resetRateAtStressIndex: Math.round(resetRateAtStressIndex * 1000) / 1000,
    resetRateAtLifetimeCap,
    yearsToFirstReset,
    paymentAtCurrentReset: Math.round(paymentAtCurrentReset),
    paymentAtStressReset: Math.round(paymentAtStressReset),
    paymentAtLifetimeCap: Math.round(paymentAtLifetimeCap),
    track1DSCRAtCurrentReset: Math.round(track1DSCRAtCurrentReset * 1000) / 1000,
    track1DSCRAtStressReset: Math.round(track1DSCRAtStressReset * 1000) / 1000,
    track1DSCRAtLifetimeCap: Math.round(track1DSCRAtLifetimeCap * 1000) / 1000,
    dealBreakRate: Math.round(dealBreakRate * 100) / 100,
    cushionBpsAtStress,
    ioArmDoubleShockYear,
    doubleShockRisk,
    warningMessage,
  };
}

function getIndexValue(index: string, snapshot: MarketIndexSnapshot): number {
  switch (index) {
    case 'SOFR_30D':
    case 'SOFR_30D_AVG':
      return snapshot.sofr30Day;
    case 'TREASURY_5YR':
      return snapshot.treasury5Y;
    case 'TREASURY_10YR':
      return snapshot.treasury10Y;
    default:
      return snapshot.sofr30Day;
  }
}

function solveDealBreakRate(
  qualifyingRent: number,
  loanBalance: number,
  remainingTermMonths: number,
  monthlyFixedExpenses: number,
): number {
  // Find rate where PI(rate) = qualifyingRent - fixedExpenses (DSCR = 1.0)
  const targetPI = qualifyingRent - monthlyFixedExpenses;
  if (targetPI <= 0) return 0;

  let low = 2.0;
  let high = 15.0;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const pi = calculatePI(loanBalance, mid, remainingTermMonths);
    if (pi > targetPI) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return (low + high) / 2;
}

function buildWarning(
  armTerms: ARMTerms,
  currentIndex: number,
  resetCurrent: number,
  resetStress: number,
  dscrCurrent: number,
  dscrStress: number,
  dealBreak: number,
  cushionBps: number,
  doubleShockYear: number | null,
  risk: string,
): string {
  const lines: string[] = [];
  lines.push(`ARM RESET ANALYSIS (${armTerms.armType})`);
  lines.push(`Current ${armTerms.index.replace('_', ' ')} = ${currentIndex}%; margin = ${armTerms.marginPct}%; ` +
             `reset rate @ current = ${resetCurrent.toFixed(3)}%, @ stress SOFR 5.0% = ${resetStress.toFixed(3)}%.`);
  lines.push(`Track 1 DSCR @ current reset = ${dscrCurrent.toFixed(3)}; @ stress reset = ${dscrStress.toFixed(3)}.`);
  lines.push(`Deal-break rate at reset = ${dealBreak.toFixed(2)}%; cushion vs stress = ${cushionBps} bps.`);

  if (dscrStress < 1.0) {
    lines.push(`⚠️ At stress reset (SOFR 5.0%), Track 1 DSCR = ${dscrStress.toFixed(3)} — DEAL FAILS at stress.`);
  }
  if (dscrCurrent < 1.0) {
    lines.push(`⚠️ At current SOFR ${currentIndex}%, Track 1 DSCR at reset = ${dscrCurrent.toFixed(3)} — DEAL FAILS at reset.`);
  }
  if (doubleShockYear) {
    lines.push(`🚨 IO+ARM DOUBLE-SHOCK YEAR: ${doubleShockYear} — IO recast AND ARM reset hit simultaneously. ` +
               `Risk level: ${risk}.`);
  }
  if (cushionBps < 100) {
    lines.push(`⚠️ Cushion <100 bps to deal-break at stress — fragile file, consider rate buydown or fixed product.`);
  }
  return lines.join(' ');
}

// ============================================================
// REMAINING BALANCE AT RESET (for payment recast)
// ============================================================

/**
 * Compute remaining loan balance at ARM reset date.
 *
 * Uses standard amortization formula:
 *   B(n) = L × [(1+r)^n - (1+r)^p] / [(1+r)^n - 1]
 *   where L = original loan, r = monthly rate, n = total months, p = months elapsed
 */
export function computeRemainingBalanceAtReset(
  loanAmount: number,
  annualRate: number,
  totalTermMonths: number,
  monthsElapsed: number,
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return loanAmount * (1 - monthsElapsed / totalTermMonths);

  const factor = Math.pow(1 + r, totalTermMonths);
  const elapsed = Math.pow(1 + r, monthsElapsed);

  const remaining = loanAmount * (factor - elapsed) / (factor - 1);
  return Math.max(0, remaining);
}

// ============================================================
// CONSERVATIVE LENDER STRESS TEST
// ============================================================

/**
 * Per Part B": "many lenders stress-test ARM files at the fully-amortizing
 * payment (max rate or reset rate + 2%). Engine surfaces both."
 *
 * v11.1 FIX (AUDIT-FINAL): The previous version computed `lender stress = min(
 * reset + 2%, lifetime cap)` as a single-step jump. That is incorrect: ARM
 * contracts cap the rate increase at `periodicCapPct` per reset, so the
 * "lender stress rate" should be modeled as either:
 *   (a) The fully-indexed rate after `n` resets — bounded by periodic caps
 *   (b) The lifetime cap rate — only reached after several consecutive upward
 *       resets, never on day one
 *
 * Lender stress tests typically use one of:
 *   - "Stress at +2% over current reset" (industry shorthand; not a contract term)
 *   - "Stress at lifetime cap" (worst case)
 *   - "Stress at fully-indexed rate after 4 resets" (realistic stress horizon)
 *
 * We surface all three so the IC can choose.
 */
export function computeLenderStressRate(
  armTerms: ARMTerms,
  marketSnapshot: MarketIndexSnapshot = CURRENT_MARKET_SNAPSHOT,
): {
  stressRate: number;          // primary stress rate = lifetime cap (most conservative)
  stressPayment: number;       // computed in caller with actual loan balance
  stressDSCR: number;
  note: string;
  resetPlus2Rate: number;      // shorthand stress: current reset + 2% (uncapped)
  rateAfter4Resets: number;    // realistic stress: rate after 4 reset periods
  lifetimeCapRate: number;     // initial + lifetimeCap
  trajectory: ARMResetTrajectoryPoint[];
} {
  const currentIndex = getIndexValue(armTerms.index, marketSnapshot);
  const lifetimeCapRate = armTerms.initialRate + armTerms.lifetimeCapPct;
  const resetRate = Math.max(currentIndex + armTerms.marginPct, armTerms.floorRate);

  // Reset + 2% (industry shorthand) — but bounded by lifetime cap
  const resetPlus2Rate = Math.min(resetRate + 2.0, lifetimeCapRate);

  // Realistic 4-reset stress — sustained stress index, walk the ladder
  const stressLadder = simulateARMResetLadder(armTerms, STRESS_SOFR_PCT, 10);
  const trajectory = stressLadder.trajectory.slice(0, 4);  // first 4 resets
  const rateAfter4Resets = trajectory.length > 0
    ? trajectory[trajectory.length - 1].rate
    : resetRate;

  // Primary stress rate for lender qualification: lifetime cap (most conservative)
  // — this is the structural ceiling and the rate lenders must qualify at per
  // most DSCR ARM guidelines.
  const stressRate = lifetimeCapRate;

  return {
    stressRate,
    stressPayment: 0, // computed in caller with actual loan balance
    stressDSCR: 0,
    note: `Lender stress rate ${stressRate.toFixed(3)}% (lifetime cap). ` +
          `Alternative views: reset+2% = ${resetPlus2Rate.toFixed(3)}%; ` +
          `rate after 4 stress resets = ${rateAfter4Resets.toFixed(3)}%. ` +
          `DSCR at stress rate may bind — confirm with lender which stress they apply.`,
    resetPlus2Rate,
    rateAfter4Resets,
    lifetimeCapRate,
    trajectory,
  };
}

// ============================================================
// v11.8 — MULTI-SCENARIO ARM/SOFR RESET ANALYSIS
// ============================================================
//
// Adds institutional-grade scenario stress testing on top of the v11.0
// single-scenario engine. Five scenarios span the realistic SOFR range
// observed over the past 5 years (2020-2025: 0.05% ZIRP → 5.33% peak):
//
//   BULLISH: SOFR drops 100bps to 2.59% (Fed cuts aggressively)
//   BASE:    SOFR sustained at 3.59% (current, per Jun 2026 snapshot)
//   BEARISH: SOFR rises 100bps to 4.59% (modest Fed hiking)
//   STRESS:  SOFR = 5.00% (existing stress, sustained shock)
//   CRISIS:  SOFR = 7.00% (2023-style repo crisis / inflation resurgence)
//
// Each scenario walks the full reset ladder (simulateARMResetLadder) and
// reports the stabilized rate, payment, Track 1 DSCR, deal-break flag,
// and cushion in bps.
//
// Plus three companion analyses:
//   - computePaymentShockPct() — Reg Z payment-shock disclosure
//   - findDSCRBreakYear()      — year DSCR drops below threshold
//   - computeRefiTriggerRate() — SOFR breakeven vs current 30yr fixed
// ============================================================

// Five institutional stress scenarios — SOFR sustained levels (in %)
export const ARM_SCENARIO_INDEXES: Record<ARMScenarioName, number> = {
  BULLISH: 2.59,   // -100bps from current
  BASE: 3.59,      // current
  BEARISH: 4.59,   // +100bps from current
  STRESS: 5.00,    // existing stress test (sustained shock)
  CRISIS: 7.00,    // 2023-style repo crisis / inflation resurgence
};

const SCENARIO_ORDER: ARMScenarioName[] = ['BULLISH', 'BASE', 'BEARISH', 'STRESS', 'CRISIS'];

/**
 * Multi-scenario ARM reset analysis — runs all 5 scenarios, identifies
 * worst case, counts deal-break scenarios, and surfaces the current
 * 30yr fixed rate for refi comparison.
 *
 * Each scenario uses the SAME ARM terms but a DIFFERENT sustained SOFR
 * level. The reset ladder is walked independently for each scenario.
 */
export function computeMultiScenarioARMReset(
  armTerms: ARMTerms,
  loanBalanceAtReset: number,
  remainingTermMonths: number,
  qualifyingRent: number,
  monthlyFixedExpenses: number,
  marketSnapshot: MarketIndexSnapshot = CURRENT_MARKET_SNAPSHOT,
): MultiScenarioARMResult {
  // Compute deal-break rate once (independent of scenario)
  const dealBreakRate = solveDealBreakRate(
    qualifyingRent, loanBalanceAtReset, remainingTermMonths, monthlyFixedExpenses,
  );

  const scenarios: ARMScenarioResult[] = SCENARIO_ORDER.map((name) => {
    const sustainedSOFR = ARM_SCENARIO_INDEXES[name];
    const ladder = simulateARMResetLadder(armTerms, sustainedSOFR, 10);
    const stabilizedRate = ladder.stabilizedRate;
    const payment = calculatePI(loanBalanceAtReset, stabilizedRate, remainingTermMonths);
    const pitia = payment + monthlyFixedExpenses;
    const dscr = pitia > 0 ? qualifyingRent / pitia : 0;
    const cushionBps = Math.round((dealBreakRate - stabilizedRate) * 100);

    return {
      scenarioName: name,
      indexPct: sustainedSOFR,
      stabilizedRate: Math.round(stabilizedRate * 1000) / 1000,
      paymentAtStabilization: Math.round(payment),
      track1DSCRAtStabilization: Math.round(dscr * 1000) / 1000,
      dealBreaks: dscr < 1.0,
      cushionBps,
      trajectory: ladder.trajectory.map((p) => ({
        resetNumber: p.resetNumber,
        year: p.year,
        rate: p.rate,
        capBinding: p.capBinding,
      })),
    };
  });

  // Worst case = scenario with lowest DSCR
  const worstCase = scenarios.reduce((worst, s) =>
    s.track1DSCRAtStabilization < worst.track1DSCRAtStabilization ? s : worst,
  );

  const breaksCount = scenarios.filter((s) => s.dealBreaks).length;
  const fixedRateComparison = marketSnapshot.freddieMac30YrFixed;

  // Build summary
  const summaryLines: string[] = [];
  summaryLines.push(
    `5-scenario ARM stress (sustained SOFR ${ARM_SCENARIO_INDEXES.BULLISH}-${ARM_SCENARIO_INDEXES.CRISIS}%): ` +
    `${breaksCount}/5 scenarios break the deal (DSCR < 1.00).`,
  );
  summaryLines.push(
    `Worst case: ${worstCase.scenarioName} (SOFR ${worstCase.indexPct}%) → stabilized rate ${worstCase.stabilizedRate}%, ` +
    `Track 1 DSCR ${worstCase.track1DSCRAtStabilization.toFixed(3)}, cushion ${worstCase.cushionBps} bps.`,
  );
  if (worstCase.dealBreaks) {
    summaryLines.push(
      `⚠️ Deal fails in ${breaksCount} scenario(s) — file is fragile. ` +
      `Consider fixed product or rate buydown to lock in qualifying DSCR.`,
    );
  } else {
    summaryLines.push(
      `✅ Deal survives all 5 scenarios — ARM file is robust to realistic SOFR range.`,
    );
  }
  const summary = summaryLines.join(' ');

  return {
    scenarios,
    worstCase,
    breaksCount,
    fixedRateComparison,
    summary,
  };
}

/**
 * Reg Z Payment Shock Disclosure — computes the worst-case payment
 * increase at first ARM reset across all 5 scenarios.
 *
 * Per Reg Z §226.18(s) / §1026.18(s) and §1026.20(c), lenders must
 * disclose the "maximum possible" payment increase at first reset.
 * For DSCR ARMs with a 2% first-reset cap, the worst case is initial
 * rate + 2% (first-reset cap binds).
 *
 * Returns:
 *   - initialPayment (at origination rate)
 *   - worstCasePaymentAtFirstReset (max payment under any scenario)
 *   - paymentShockPct ((worst - initial) / initial × 100)
 *   - paymentShockYear (year of first reset)
 *   - regZDisclosure (Reg Z-compliant text)
 */
export function computePaymentShockPct(
  armTerms: ARMTerms,
  loanBalanceAtReset: number,
  remainingTermMonths: number,
  marketSnapshot: MarketIndexSnapshot = CURRENT_MARKET_SNAPSHOT,
): PaymentShockResult {
  // Initial payment at origination rate
  const initialPayment = calculatePI(
    loanBalanceAtReset, armTerms.initialRate, remainingTermMonths,
  );

  // First-reset worst case: initial rate + initialCapPct (first-reset cap binds)
  // This is scenario-independent — the cap is the cap regardless of index level.
  // But across the 5 scenarios, the CRISIS scenario is the one where the
  // first-reset cap actually binds (in BULLISH, rate may drop).
  const firstResetCeiling = armTerms.initialRate + armTerms.initialCapPct;
  const worstCasePaymentAtFirstReset = calculatePI(
    loanBalanceAtReset, firstResetCeiling, remainingTermMonths,
  );

  const paymentShockPct = initialPayment > 0
    ? ((worstCasePaymentAtFirstReset - initialPayment) / initialPayment) * 100
    : 0;
  const paymentShockYear = armTerms.fixedPeriodMonths / 12;

  // Find which scenario triggers the worst case (any scenario where index+margin
  // >= firstResetCeiling — typically CRISIS, sometimes STRESS)
  let worstCaseScenarioName: ARMScenarioName = 'CRISIS';
  for (const name of SCENARIO_ORDER) {
    const sustainedSOFR = ARM_SCENARIO_INDEXES[name];
    const fullyIndexed = Math.max(armTerms.floorRate, sustainedSOFR + armTerms.marginPct);
    if (fullyIndexed >= firstResetCeiling) {
      worstCaseScenarioName = name;
      break;
    }
  }

  const regZDisclosure =
    `REG Z §1026.18(s) DISCLOSURE — ` +
    `Worst-case payment at first reset (year ${paymentShockYear}): ` +
    `$${worstCasePaymentAtFirstReset.toFixed(0)}/mo (an increase of ${paymentShockPct.toFixed(1)}% ` +
    `from $${initialPayment.toFixed(0)}/mo at origination). ` +
    `Driven by ${worstCaseScenarioName} scenario binding the ${armTerms.initialCapPct}% first-reset cap. ` +
    `Subsequent resets capped at +${armTerms.periodicCapPct}% per period; lifetime cap = +${armTerms.lifetimeCapPct}% over initial.`;

  return {
    initialPayment: Math.round(initialPayment),
    worstCasePaymentAtFirstReset: Math.round(worstCasePaymentAtFirstReset),
    paymentShockPct: Math.round(paymentShockPct * 10) / 10,
    paymentShockYear,
    worstCaseScenarioName,
    regZDisclosure,
  };
}

/**
 * Walk the ARM reset ladder year-by-year under a chosen scenario and
 * find the first year where Track 1 DSCR drops below a threshold
 * (typically 1.0 = deal-break, or 1.25 = minimum DSCR lender qualifying).
 *
 * Returns null breakYear if DSCR never drops below threshold within the
 * 10-year horizon.
 *
 * Useful for: identifying WHEN a deal goes underwater, not just IF.
 * A deal that breaks in year 7 is very different from one that breaks
 * in year 3 (the latter has no time to refi or sell before default).
 */
export function findDSCRBreakYear(
  armTerms: ARMTerms,
  loanBalanceAtReset: number,
  remainingTermMonths: number,
  qualifyingRent: number,
  monthlyFixedExpenses: number,
  scenarioName: ARMScenarioName = 'STRESS',
  threshold: number = 1.0,
  marketSnapshot: MarketIndexSnapshot = CURRENT_MARKET_SNAPSHOT,
): DSCRBreakYearResult {
  const sustainedSOFR = ARM_SCENARIO_INDEXES[scenarioName];
  const ladder = simulateARMResetLadder(armTerms, sustainedSOFR, 10);
  const yearsToFirstReset = armTerms.fixedPeriodMonths / 12;

  // Build year-by-year trajectory: {year, rate, dscr}
  const trajectory = ladder.trajectory.map((p) => {
    const payment = calculatePI(loanBalanceAtReset, p.rate, remainingTermMonths);
    const pitia = payment + monthlyFixedExpenses;
    const dscr = pitia > 0 ? qualifyingRent / pitia : 0;
    return {
      year: p.year,
      rate: p.rate,
      dscr: Math.round(dscr * 1000) / 1000,
    };
  });

  // Find first year DSCR drops below threshold
  let breakYear: number | null = null;
  let dscrAtBreakYear = 0;
  for (const point of trajectory) {
    if (point.dscr < threshold) {
      breakYear = point.year;
      dscrAtBreakYear = point.dscr;
      break;
    }
  }

  let warning: string;
  if (breakYear === null) {
    warning =
      `Under ${scenarioName} scenario (SOFR sustained at ${sustainedSOFR}%), ` +
      `Track 1 DSCR never drops below ${threshold} over the 10-year reset horizon. ` +
      `Deal is robust under this scenario.`;
  } else {
    warning =
      `Under ${scenarioName} scenario (SOFR sustained at ${sustainedSOFR}%), ` +
      `Track 1 DSCR drops below ${threshold} in year ${breakYear} ` +
      `(DSCR = ${dscrAtBreakYear.toFixed(3)} at stabilized rate). ` +
      (breakYear <= 5
        ? `🚨 BREAK YEAR ≤ 5 — minimal time to refi/sell before default.`
        : breakYear <= 7
          ? `⚠️ BREAK YEAR 6-7 — limited refi window.`
          : `ℹ️ Break year > 7 — adequate time to refi/sell.`);
  }

  return {
    breakYear,
    threshold,
    scenarioName,
    dscrAtBreakYear: Math.round(dscrAtBreakYear * 1000) / 1000,
    yearsToFirstReset,
    trajectory,
    warning,
  };
}

/**
 * Solve for the SOFR level at which the ARM's stabilized rate equals
 * the current Freddie Mac 30yr fixed rate. Above this trigger, the
 * ARM is more expensive than the available fixed-rate alternative →
 * refi to fixed is recommended.
 *
 * Binary search over SOFR ∈ [0.0%, 12.0%] to find the level where
 * stabilized ARM rate = current 30yr fixed rate.
 *
 * If the ARM's CURRENT stabilized rate (at current SOFR) already exceeds
 * the fixed rate, refi is recommended NOW and we compute the monthly
 * savings + break-even months.
 *
 * Refi closing costs assumed = 2.5% of loan balance (industry standard).
 */
export function computeRefiTriggerRate(
  armTerms: ARMTerms,
  loanBalanceAtReset: number,
  remainingTermMonths: number,
  marketSnapshot: MarketIndexSnapshot = CURRENT_MARKET_SNAPSHOT,
): RefiTriggerResult {
  const currentFixedRate = marketSnapshot.freddieMac30YrFixed;

  // ARM stabilized rate at current SOFR
  const currentSOFR = marketSnapshot.sofr30Day;
  const currentLadder = simulateARMResetLadder(armTerms, currentSOFR, 10);
  const currentARMStabilizedRate = currentLadder.stabilizedRate;

  // Binary search for refi trigger SOFR
  // Solve: stabilized_rate(sofr) = currentFixedRate
  let low = 0.0;
  let high = 12.0;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const ladder = simulateARMResetLadder(armTerms, mid, 10);
    if (ladder.stabilizedRate < currentFixedRate) {
      low = mid;
    } else {
      high = mid;
    }
  }
  const refiTriggerSOFR = Math.round(((low + high) / 2) * 100) / 100;

  // Determine if refi is recommended NOW
  const refiRecommended = currentARMStabilizedRate > currentFixedRate;

  let refiSavingsMonthly = 0;
  let breakEvenMonths = 0;
  let recommendation: string;

  if (refiRecommended) {
    const armPayment = calculatePI(loanBalanceAtReset, currentARMStabilizedRate, remainingTermMonths);
    const fixedPayment = calculatePI(loanBalanceAtReset, currentFixedRate, remainingTermMonths);
    refiSavingsMonthly = Math.max(0, armPayment - fixedPayment);
    const refiClosingCosts = loanBalanceAtReset * 0.025;
    breakEvenMonths = refiSavingsMonthly > 0
      ? Math.ceil(refiClosingCosts / refiSavingsMonthly)
      : 999;
    recommendation =
      `REFI TO FIXED RECOMMENDED. ARM stabilized rate (${currentARMStabilizedRate.toFixed(3)}%) exceeds ` +
      `current 30yr fixed (${currentFixedRate.toFixed(3)}%). ` +
      `Refi saves $${refiSavingsMonthly.toFixed(0)}/mo; break-even in ${breakEvenMonths} months ` +
      `(on $${refiClosingCosts.toFixed(0)} closing costs at 2.5%).`;
  } else {
    recommendation =
      `Stay on ARM. Current ARM stabilized rate (${currentARMStabilizedRate.toFixed(3)}%) is below ` +
      `current 30yr fixed (${currentFixedRate.toFixed(3)}%). ` +
      `Refi trigger: SOFR rises to ${refiTriggerSOFR.toFixed(2)}% (currently ${currentSOFR.toFixed(2)}%, ` +
      `+${Math.round((refiTriggerSOFR - currentSOFR) * 100)} bps to trigger refi).`;
  }

  return {
    refiTriggerSOFR,
    currentFixedRate,
    currentARMStabilizedRate: Math.round(currentARMStabilizedRate * 1000) / 1000,
    refiRecommended,
    refiSavingsMonthly: Math.round(refiSavingsMonthly),
    breakEvenMonths,
    recommendation,
  };
}
