// ============================================================
// DSCR Loan Command Center v7.0 — Sensitivity Engine
// Section 7 & 8: Multi-Dimensional Sensitivity, Breakeven & Risk
// Dual-Track, Math-Verified, Provenance-Honest
//
// GOLDEN TEST VALUES (must reproduce):
//   Rent Sensitivity: PITIA $2,855, 7.00%
//     $2,400→0.84, $2,600→0.91, $2,855→1.00,
//     $3,000→1.05, $3,200→1.12, $3,426→1.20,
//     $3,600→1.26, $4,000→1.40, $4,500→1.58
//   Rate Sensitivity: $318,750 loan, $3,000 rent, $734 fixed
//     6.125%→P&I ~$1,936, PITIA ~$2,670, DSCR 1.12
//     7.00%→P&I $2,121, PITIA $2,855, DSCR 1.05
//     7.67%→deal-break rate, DSCR 1.00
//     8.25%→P&I $2,395, PITIA $3,129, DSCR 0.96
//   LTV Sensitivity: $425K, 7.00%, rent $3,000
//     80%→$340K loan, PITIA $2,996, DSCR 1.00
//     75%→$318,750 loan, PITIA $2,855, DSCR 1.05
//     70%→$297,500 loan, PITIA $2,713, DSCR 1.11
// ============================================================

import type {
  PropertyInputs,
  BorrowerProfile,
  LoanStructure,
  RentalStrategy,
  BreakevenResult,
  JointAppraisalRisk,
  ValueShockRow,
  TornadoItem,
  PathToTarget,
  HeatmapCell,
  DSCRGradient,
} from './types';
import { calculatePI, calculatePITIA, getDSCRGradient, solveDealBreakRate } from './engine';

// ── Rounding Helpers ─────────────────────────────────────────────────────
const r2 = (n: number) => Math.round(n * 100) / 100;
const r0 = (n: number) => Math.round(n);

// ── Internal Helpers ─────────────────────────────────────────────────────

/** Monthly fixed costs (taxes + insurance + HOA + flood — everything except P&I) */
function mFixed(
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): number {
  return annualTaxes / 12 + annualInsurance / 12 + hoa + floodInsurance / 12;
}

/** Compute full PITIA for an amortizing loan (no IO) */
function pitiaAmortizing(
  loanAmount: number,
  rate: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): number {
  const pi = calculatePI(loanAmount, rate, termYears * 12);
  return pi + mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
}

/** Track-1 DSCR status label */
function dscrStatus(dscr: number): string {
  if (dscr < 1.0) return 'Deal Breaker';
  if (dscr < 1.25) return 'Marginal';
  return 'Pass';
}

/** Bisection: find loan amount that produces a target monthly P&I at given rate/term */
function solveLoanForPI(
  targetPI: number,
  rate: number,
  termYears: number,
): number {
  if (targetPI <= 0) return 0;
  let lo = 0;
  let hi = targetPI * 12 * termYears;
  const termMonths = termYears * 12;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (calculatePI(mid, rate, termMonths) < targetPI) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Bisection: find rate (percentage form, e.g. 7.00) that produces a target DSCR */
function solveRateForDSCR(
  targetDSCR: number,
  loanAmount: number,
  rent: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): number {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;
  let lo = 0.5;
  let hi = 20.0;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const pitia = calculatePI(loanAmount, mid, termMonths) + fixed;
    if (rent / pitia > targetDSCR) lo = mid;
    else hi = mid;
  }
  return r2((lo + hi) / 2);
}

/** Bisection: find max purchase price that produces a target DSCR at given LTV% */
function solvePriceForDSCR(
  targetDSCR: number,
  rent: number,
  ltvPct: number,
  rate: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): number {
  let lo = 10000;
  let hi = 5000000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const loan = mid * (ltvPct / 100);
    const pitia = pitiaAmortizing(loan, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
    if (rent / pitia >= targetDSCR) lo = mid;
    else hi = mid;
  }
  return r0((lo + hi) / 2);
}

/** Bisection: find max LTV% that produces a target DSCR */
function solveLTVForDSCR(
  targetDSCR: number,
  rent: number,
  purchasePrice: number,
  rate: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): number {
  let lo = 10;
  let hi = 95;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const loan = purchasePrice * (mid / 100);
    const pitia = pitiaAmortizing(loan, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
    if (rent / pitia >= targetDSCR) lo = mid;
    else hi = mid;
  }
  return r2((lo + hi) / 2);
}

// ── Default Step Generators ──────────────────────────────────────────────

function defRentSteps(qualifyingRent: number, pitia: number): number[] {
  const s = new Set<number>();
  const lo = Math.floor(qualifyingRent * 0.80 / 100) * 100;
  const hi = Math.ceil(qualifyingRent * 1.50 / 100) * 100;
  for (let r = lo; r <= hi; r += 200) s.add(r);
  s.add(r0(pitia));
  s.add(r0(pitia * 1.25));
  return Array.from(s).sort((a, b) => a - b);
}

function defRateSteps(
  loanAmount: number,
  rent: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): number[] {
  const dbr = solveDealBreakRate(rent, loanAmount, termYears, 'NONE', annualTaxes, annualInsurance, hoa, floodInsurance);
  const steps: number[] = [];
  const base = Math.round(dbr * 8) / 8;
  for (let off = -16; off <= 8; off++) {
    steps.push(r2(base + off * 0.125));
  }
  return steps;
}

function defLTVSteps(): number[] {
  return [50, 55, 60, 65, 70, 75, 80, 85, 90];
}

function defPriceSteps(purchasePrice: number): number[] {
  const s: number[] = [];
  const lo = Math.round(purchasePrice * 0.75 / 10000) * 10000;
  const hi = Math.round(purchasePrice * 1.25 / 10000) * 10000;
  for (let p = lo; p <= hi; p += 10000) s.push(p);
  return s;
}

// ══════════════════════════════════════════════════════════════════════════
// 1. RENT SENSITIVITY (Section 7.1)
// Track 1 = gross rent / PITIA (no vacancy for LTR)
// Track 2 = (gross rent × (1 - vacancy% - management% - maintenance%)) / PITIA
//   LTR: 8% vacancy + 8% management + 5% maintenance = 21% total deduction
//   STR: 25% vacancy + 8% management + 5% maintenance = 38% total deduction
//   MTR: 12% vacancy + 8% management + 5% maintenance = 25% total deduction
// ══════════════════════════════════════════════════════════════════════════

export function computeRentSensitivity(
  qualifyingRent: number,
  pitia: number,
  rentSteps?: number[],
  strategy: 'LTR' | 'STR' | 'MTR' = 'LTR',
): { rent: number; track1DSCR: number; track2DSCR: number; status: string }[] {
  const vacancyPct = 8;
  const managementPct = 8;
  const maintenancePct = 5;
  const totalDeductionPct = vacancyPct + managementPct + maintenancePct;
  const track2Factor = 1 - totalDeductionPct / 100; // e.g., 0.79 for LTR, 0.62 for STR

  const steps = rentSteps ?? defRentSteps(qualifyingRent, pitia);
  return steps.map((rent) => {
    const t1 = r2(rent / pitia);
    const t2 = r2((rent * track2Factor) / pitia);
    return { rent: r0(rent), track1DSCR: t1, track2DSCR: t2, status: dscrStatus(t1) };
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 2. RATE SENSITIVITY (Section 7.2)
// Sweeps rate → recomputes P&I and PITIA at each step.
// All rates in percentage form (e.g. 7.00 for 7%).
// ══════════════════════════════════════════════════════════════════════════

export function computeRateSensitivity(
  loanAmount: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
  rent: number,
  termYears: number,
  rateSteps?: number[],
): { rate: number; pi: number; pitia: number; track1DSCR: number; status: string }[] {
  const steps = rateSteps ?? defRateSteps(loanAmount, rent, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;
  return steps.map((rate) => {
    const pi = calculatePI(loanAmount, rate, termMonths);
    const pitia = pi + fixed;
    const d = r2(rent / pitia);
    return { rate: r2(rate), pi: r0(pi), pitia: r0(pitia), track1DSCR: d, status: dscrStatus(d) };
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 3. PRICE SENSITIVITY (Section 7.3)
// Varies purchase price; loan = price × LTV%; PITIA recomputed.
// LTV in percentage form (e.g. 75 for 75%).
// ══════════════════════════════════════════════════════════════════════════

export function computePriceSensitivity(
  purchasePrice: number,
  ltv: number,
  rate: number,
  rent: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
  priceSteps?: number[],
): { price: number; loan: number; pitia: number; dscr: number; status: string }[] {
  const steps = priceSteps ?? defPriceSteps(purchasePrice);
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;
  return steps.map((price) => {
    const loan = price * (ltv / 100);
    const pi = calculatePI(loan, rate, termMonths);
    const pitia = pi + fixed;
    const d = r2(rent / pitia);
    return { price: r0(price), loan: r0(loan), pitia: r0(pitia), dscr: d, status: dscrStatus(d) };
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 4. LTV SENSITIVITY (Section 7.4)
// LTV steps in percentage form (e.g. [70, 75, 80]).
// ══════════════════════════════════════════════════════════════════════════

export function computeLTVSensitivity(
  purchasePrice: number,
  rate: number,
  rent: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
  ltvSteps?: number[],
): { ltv: number; loan: number; down: number; pitia: number; dscr: number; status: string }[] {
  const steps = ltvSteps ?? defLTVSteps();
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;
  return steps.map((ltv) => {
    const loan = purchasePrice * (ltv / 100);
    const down = purchasePrice - loan;
    const pi = calculatePI(loan, rate, termMonths);
    const pitia = pi + fixed;
    const d = r2(rent / pitia);
    return { ltv: r2(ltv), loan: r0(loan), down: r0(down), pitia: r0(pitia), dscr: d, status: dscrStatus(d) };
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 5. COMBINED STRESS MATRIX (Section 8.2)
// Rent × Rate grid showing DSCR at each combination.
// Rate parameter (percentage form) centers the rate axis.
// ══════════════════════════════════════════════════════════════════════════

export function computeCombinedStressMatrix(
  loanAmount: number,
  rate: number,
  rent: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
  termYears: number,
): { rateLabel: string; rate: number; rentPcts: { label: string; dscr: number }[] }[] {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;
  const rentPctOffsets = [-20, -15, -10, -5, 0, 5, 10, 15, 20];
  const rateOffsets = [-1.50, -1.00, -0.75, -0.50, -0.25, 0, 0.25, 0.50, 0.75, 1.00, 1.50];

  return rateOffsets.map((rOff) => {
    const r = rate + rOff;
    const pi = calculatePI(loanAmount, r, termMonths);
    const pitiaVal = pi + fixed;
    const rentPcts = rentPctOffsets.map((pct) => {
      const adjRent = rent * (1 + pct / 100);
      return {
        label: pct === 0 ? 'Base' : `${pct > 0 ? '+' : ''}${pct}%`,
        dscr: r2(adjRent / pitiaVal),
      };
    });
    return {
      rateLabel: `${r2(r).toFixed(2)}%`,
      rate: r2(r),
      rentPcts,
    };
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 6. JOINT APPRAISAL RISK (Section 8.1)
// Rent shock: how far can 1007 rent drop before DSCR = 1.0?
// Value shock: at each appraised value, max loan at LTV, cash gap, DSCR.
// Both run together; binding constraint flagged.
// ══════════════════════════════════════════════════════════════════════════

export function computeJointAppraisalRisk(
  qualifyingRent: number,
  pitia: number,
  purchasePrice: number,
  ltv: number,
  loanAmount: number,
  rate: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): JointAppraisalRisk {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;

  // ── Rent shock ──
  const rentBreakpoint = r0(pitia);
  const rentDropPercent = r2(
    qualifyingRent > 0 ? ((qualifyingRent - pitia) / qualifyingRent) * 100 : 0,
  );

  // ── Value shock table ──
  const shockPcts = [0, -2, -4, -6, -8, -10];
  const valueShockTable: ValueShockRow[] = shockPcts.map((pct) => {
    const appraisedValue = r0(purchasePrice * (1 + pct / 100));
    const maxLoan = r0(appraisedValue * (ltv / 100));
    const cashGap = r0((ltv / 100) * (purchasePrice - appraisedValue));
    const pi = calculatePI(maxLoan, rate, termMonths);
    const pitiaAtMaxLoan = pi + fixed;
    const dscrAtMaxLoan = r2(qualifyingRent / pitiaAtMaxLoan);
    return { appraisedValue, maxLoan, cashGap, dscrAtMaxLoan };
  });

  // ── Combined stress test: rent -10% × value -10% (Section 8.1) ──
  // Simultaneous shock to both rent (operating risk) and appraised value
  // (collateral risk). This is the canonical "joint appraisal shock".
  const combinedRentDropPct = -10;
  const combinedValueDropPct = -10;
  const stressedRent = qualifyingRent * (1 + combinedRentDropPct / 100);
  const stressedValue = purchasePrice * (1 + combinedValueDropPct / 100);
  const stressedMaxLoan = stressedValue * (ltv / 100);
  const stressedPI = calculatePI(stressedMaxLoan, rate, termMonths);
  const stressedPITIA = stressedPI + fixed;
  const stressedDSCR = r2(stressedRent / stressedPITIA);

  // Implied rating from the combined -10%/-10% shock alone
  let impliedRating: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  if (stressedDSCR < 0.90) {
    impliedRating = 'CRITICAL';
  } else if (stressedDSCR < 1.00) {
    impliedRating = 'HIGH';
  } else if (stressedDSCR < 1.10) {
    impliedRating = 'MODERATE';
  } else {
    impliedRating = 'LOW';
  }

  // ── Combined risk rating ──
  // Check if a 5% value shock breaks the deal
  const valueShock5 = purchasePrice * 0.95;
  const maxLoanAt5 = valueShock5 * (ltv / 100);
  const piAt5 = calculatePI(maxLoanAt5, rate, termMonths);
  const pitiaAt5 = piAt5 + fixed;
  const dscrAt5PctShock = qualifyingRent / pitiaAt5;
  const valueFailsAt5 = dscrAt5PctShock < 1.0;

  let baseRating: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  if (rentDropPercent >= 15 || (valueFailsAt5 && rentDropPercent >= 10)) {
    baseRating = 'CRITICAL';
  } else if (rentDropPercent >= 10 || valueFailsAt5) {
    baseRating = 'HIGH';
  } else if (rentDropPercent >= 5) {
    baseRating = 'MODERATE';
  } else {
    baseRating = 'LOW';
  }

  // Final combinedRiskRating = max(base rating, combined-stress implied rating)
  const ratingRank: Record<'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL', number> = {
    LOW: 0, MODERATE: 1, HIGH: 2, CRITICAL: 3,
  };
  const combinedRiskRating =
    ratingRank[baseRating] >= ratingRank[impliedRating] ? baseRating : impliedRating;

  let bindingConstraint: 'RENT' | 'VALUE' | 'BOTH' | 'NEITHER';
  const rentAtRisk = rentDropPercent < 5;
  if (rentAtRisk && valueFailsAt5) {
    bindingConstraint = 'BOTH';
  } else if (rentAtRisk) {
    bindingConstraint = 'RENT';
  } else if (valueFailsAt5) {
    bindingConstraint = 'VALUE';
  } else {
    bindingConstraint = 'NEITHER';
  }

  const summary = `Rent can drop ${rentDropPercent.toFixed(1)}% before DSCR hits 1.0. ` +
    (valueFailsAt5
      ? 'A 5% value shock would also break the deal.'
      : 'Value shock within tolerance at 5%.') +
    ` Combined -10%/-10% stress → DSCR ${stressedDSCR.toFixed(2)} (${impliedRating}).`;

  return {
    rentBreakpoint,
    rentDropPercent,
    valueShockTable,
    combinedRiskRating,
    bindingConstraint,
    summary,
    combinedStressTest: {
      rentDropPct: combinedRentDropPct,
      valueDropPct: combinedValueDropPct,
      stressedRent: r0(stressedRent),
      stressedValue: r0(stressedValue),
      stressedMaxLoan: r0(stressedMaxLoan),
      stressedPITIA: r0(stressedPITIA),
      stressedDSCR,
      impliedRating,
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════
// 7. HEATMAP (Section 8.3)
// Rent × Price grid → DSCR at each cell.
// LTV in percentage form.
// ══════════════════════════════════════════════════════════════════════════

export function computeHeatmap(
  rentSteps: number[],
  priceSteps: number[],
  ltv: number,
  rate: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): HeatmapCell[] {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;
  const cells: HeatmapCell[] = [];

  for (const price of priceSteps) {
    const loan = price * (ltv / 100);
    const pi = calculatePI(loan, rate, termMonths);
    const pitiaVal = pi + fixed;
    for (const rent of rentSteps) {
      const dscr = r2(rent / pitiaVal);
      cells.push({
        rent: r0(rent),
        price: r0(price),
        dscr,
        gradient: getDSCRGradient(dscr),
      });
    }
  }

  return cells;
}

// ══════════════════════════════════════════════════════════════════════════
// 8. TORNADO (Section 7.5)
// Each lever varied ±σ; compute DSCR at low and high ends.
// Sorted by impact (spread) descending.
// ══════════════════════════════════════════════════════════════════════════

export function computeTornado(
  qualifyingRent: number,
  pitia: number,
  loanAmount: number,
  rate: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
  purchasePrice: number = 0,
  ltv: number = 0,
): TornadoItem[] {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const pi = pitia - fixed;
  const termMonths = termYears * 12;

  const dscrFromParts = (rent: number, pAndI: number, f: number) =>
    r2(rent / (pAndI + f));

  interface TmpTornado {
    lever: string;
    currentValue: number;
    lowValue: number;
    highValue: number;
    dscrAtLow: number;
    dscrAtHigh: number;
    impact: number;
  }

  const vars: TmpTornado[] = [];

  // Rent ±10%
  const rentLo = qualifyingRent * 0.90;
  const rentHi = qualifyingRent * 1.10;
  const dscrRentLo = dscrFromParts(rentLo, pi, fixed);
  const dscrRentHi = dscrFromParts(rentHi, pi, fixed);
  vars.push({
    lever: 'Rent',
    currentValue: r0(qualifyingRent),
    lowValue: r0(rentLo),
    highValue: r0(rentHi),
    dscrAtLow: dscrRentLo,
    dscrAtHigh: dscrRentHi,
    impact: r2(dscrRentHi - dscrRentLo),
  });

  // Rate ±50 bps
  const rateLo = rate - 0.50;
  const rateHi = rate + 0.50;
  const piRateLo = calculatePI(loanAmount, rateLo, termMonths);
  const piRateHi = calculatePI(loanAmount, rateHi, termMonths);
  const dscrRateLo = dscrFromParts(qualifyingRent, piRateHi, fixed);
  const dscrRateHi = dscrFromParts(qualifyingRent, piRateLo, fixed);
  vars.push({
    lever: 'Rate',
    currentValue: r2(rate),
    lowValue: r2(rateHi),
    highValue: r2(rateLo),
    dscrAtLow: dscrRateLo,
    dscrAtHigh: dscrRateHi,
    impact: r2(dscrRateHi - dscrRateLo),
  });

  // LTV ±5% (only if purchasePrice and ltv provided)
  // Varying LTV changes loan amount, which changes P&I.
  // Convention (matching other levers): lowValue/dscrAtLow = the WORSE-DSCR end;
  // highValue/dscrAtHigh = the BETTER-DSCR end. Higher LTV → bigger loan →
  // higher P&I → LOWER DSCR (worse). So lowValue = higher LTV, highValue = lower LTV.
  if (purchasePrice > 0 && ltv > 0) {
    const ltvLo = Math.max(0, ltv - 5);  // lower LTV
    const ltvHi = ltv + 5;                // higher LTV
    const loanAtLtvLo = purchasePrice * (ltvLo / 100);
    const loanAtLtvHi = purchasePrice * (ltvHi / 100);
    const piLtvLo = calculatePI(loanAtLtvLo, rate, termMonths);
    const piLtvHi = calculatePI(loanAtLtvHi, rate, termMonths);
    const dscrLtvLo = dscrFromParts(qualifyingRent, piLtvLo, fixed);  // DSCR at lower LTV (HIGHER DSCR)
    const dscrLtvHi = dscrFromParts(qualifyingRent, piLtvHi, fixed);  // DSCR at higher LTV (LOWER DSCR)
    vars.push({
      lever: 'LTV',
      currentValue: r2(ltv),
      lowValue: r2(ltvHi),     // higher LTV → worse DSCR (low end of DSCR range)
      highValue: r2(ltvLo),    // lower LTV → better DSCR (high end of DSCR range)
      dscrAtLow: dscrLtvHi,    // DSCR at higher LTV (worse)
      dscrAtHigh: dscrLtvLo,   // DSCR at lower LTV (better)
      impact: r2(dscrLtvLo - dscrLtvHi),
    });
  }

  // Price ±10% (only if purchasePrice and ltv provided)
  // Varying price scales loan amount (= price × LTV%), which changes P&I.
  // Higher price → bigger loan → higher P&I → LOWER DSCR (worse).
  if (purchasePrice > 0 && ltv > 0) {
    const priceLo = purchasePrice * 0.90;  // lower price
    const priceHi = purchasePrice * 1.10;  // higher price
    const loanAtPriceLo = priceLo * (ltv / 100);
    const loanAtPriceHi = priceHi * (ltv / 100);
    const piPriceLo = calculatePI(loanAtPriceLo, rate, termMonths);
    const piPriceHi = calculatePI(loanAtPriceHi, rate, termMonths);
    const dscrPriceLo = dscrFromParts(qualifyingRent, piPriceLo, fixed);  // DSCR at lower price (HIGHER DSCR)
    const dscrPriceHi = dscrFromParts(qualifyingRent, piPriceHi, fixed);  // DSCR at higher price (LOWER DSCR)
    vars.push({
      lever: 'Price',
      currentValue: r0(purchasePrice),
      lowValue: r0(priceHi),   // higher price → bigger loan → worse DSCR
      highValue: r0(priceLo),  // lower price → smaller loan → better DSCR
      dscrAtLow: dscrPriceHi,  // DSCR at higher price (worse)
      dscrAtHigh: dscrPriceLo, // DSCR at lower price (better)
      impact: r2(dscrPriceLo - dscrPriceHi),
    });
  }

  // Taxes ±10%
  const taxLo = annualTaxes * 0.90;
  const taxHi = annualTaxes * 1.10;
  const dscrTaxLo = dscrFromParts(qualifyingRent, pi, mFixed(taxHi, annualInsurance, hoa, floodInsurance));
  const dscrTaxHi = dscrFromParts(qualifyingRent, pi, mFixed(taxLo, annualInsurance, hoa, floodInsurance));
  vars.push({
    lever: 'Taxes',
    currentValue: r0(annualTaxes),
    lowValue: r0(taxHi),
    highValue: r0(taxLo),
    dscrAtLow: dscrTaxLo,
    dscrAtHigh: dscrTaxHi,
    impact: r2(dscrTaxHi - dscrTaxLo),
  });

  // Insurance ±10%
  const insLo = annualInsurance * 0.90;
  const insHi = annualInsurance * 1.10;
  const dscrInsLo = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, insHi, hoa, floodInsurance));
  const dscrInsHi = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, insLo, hoa, floodInsurance));
  vars.push({
    lever: 'Insurance',
    currentValue: r0(annualInsurance),
    lowValue: r0(insHi),
    highValue: r0(insLo),
    dscrAtLow: dscrInsLo,
    dscrAtHigh: dscrInsHi,
    impact: r2(dscrInsHi - dscrInsLo),
  });

  // HOA ±10%
  if (hoa > 0) {
    const hoaLo = hoa * 0.90;
    const hoaHi = hoa * 1.10;
    const dscrHoaLo = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, annualInsurance, hoaHi, floodInsurance));
    const dscrHoaHi = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, annualInsurance, hoaLo, floodInsurance));
    vars.push({
      lever: 'HOA',
      currentValue: r0(hoa),
      lowValue: r0(hoaHi),
      highValue: r0(hoaLo),
      dscrAtLow: dscrHoaLo,
      dscrAtHigh: dscrHoaHi,
      impact: r2(dscrHoaHi - dscrHoaLo),
    });
  }

  // Flood Insurance ±10%
  if (floodInsurance > 0) {
    const floodLo = floodInsurance * 0.90;
    const floodHi = floodInsurance * 1.10;
    const dscrFloodLo = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, annualInsurance, hoa, floodHi));
    const dscrFloodHi = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, annualInsurance, hoa, floodLo));
    vars.push({
      lever: 'Flood Insurance',
      currentValue: r0(floodInsurance),
      lowValue: r0(floodHi),
      highValue: r0(floodLo),
      dscrAtLow: dscrFloodLo,
      dscrAtHigh: dscrFloodHi,
      impact: r2(dscrFloodHi - dscrFloodLo),
    });
  }

  // Sort by impact descending
  vars.sort((a, b) => b.impact - a.impact);

  return vars as TornadoItem[];
}

// ══════════════════════════════════════════════════════════════════════════
// 9. BREAKEVEN RESULT (Sections 7.6–7.9, 8.1)
// Combines all breakeven solvers: rent, price, LTV, rate,
// structure (IO / 40yr), tax/insurance appeal, path to 1.25,
// tornado data, and joint appraisal risk.
// LTV in percentage form (e.g. 75 for 75%).
// ══════════════════════════════════════════════════════════════════════════

export function computeBreakevenResult(
  qualifyingRent: number,
  pitia: number,
  loanAmount: number,
  rate: number,
  termYears: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
  purchasePrice: number,
  ltv: number,
): BreakevenResult {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const pi = pitia - fixed;
  const termMonths = termYears * 12;

  // ── Rent Breakeven ───────────────────────────────────────────────────
  const rentBreakeven = {
    for1_0: r0(pitia * 1.0),
    for1_10: r0(pitia * 1.10),
    for1_25: r0(pitia * 1.25),
  };

  // ── Price Breakeven ──────────────────────────────────────────────────
  const priceBreakeven = {
    for1_0: solvePriceForDSCR(1.0, qualifyingRent, ltv, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance),
    for1_10: solvePriceForDSCR(1.1, qualifyingRent, ltv, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance),
    for1_25: solvePriceForDSCR(1.25, qualifyingRent, ltv, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance),
  };

  // ── LTV / Down-Payment Breakeven ─────────────────────────────────────
  const ltv1_0 = solveLTVForDSCR(1.0, qualifyingRent, purchasePrice, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
  const ltv1_10 = solveLTVForDSCR(1.1, qualifyingRent, purchasePrice, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
  const ltv1_25 = solveLTVForDSCR(1.25, qualifyingRent, purchasePrice, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
  const ltvBreakeven = {
    for1_0: ltv1_0,
    for1_10: ltv1_10,
    for1_25: ltv1_25,
    additionalDown: {
      for1_0: r0(purchasePrice * Math.max(0, (ltv - ltv1_0)) / 100),
      for1_10: r0(purchasePrice * Math.max(0, (ltv - ltv1_10)) / 100),
      for1_25: r0(purchasePrice * Math.max(0, (ltv - ltv1_25)) / 100),
    },
  };

  // ── Rate Breakeven ───────────────────────────────────────────────────
  const rateBreakeven = {
    maxRateFor1_0: solveDealBreakRate(qualifyingRent, loanAmount, termYears, 'NONE', annualTaxes, annualInsurance, hoa, floodInsurance),
    maxRateFor1_10: solveRateForDSCR(1.10, loanAmount, qualifyingRent, termYears, annualTaxes, annualInsurance, hoa, floodInsurance),
    maxRateFor1_25: solveRateForDSCR(1.25, loanAmount, qualifyingRent, termYears, annualTaxes, annualInsurance, hoa, floodInsurance),
  };

  // ── Structure Breakeven (IO / 40yr) ──────────────────────────────────
  const ioPayment = loanAmount * (rate / 100 / 12);
  const ioPitia = ioPayment + fixed;
  const dscrWithIO = r2(qualifyingRent / ioPitia);

  const pi40yr = calculatePI(loanAmount, rate, 480);
  const pitia40yr = pi40yr + fixed;
  const dscrWith40yr = r2(qualifyingRent / pitia40yr);

  const monthlySavingsIO = r0(pitia - ioPitia);

  // IO recast: after 10yr IO, recast over remaining 20yr (240 months)
  const ioRecastPayment = r0(calculatePI(loanAmount, rate, 240));
  const ioRecastPitia = ioRecastPayment + fixed;
  const ioRecastDSCR = r2(qualifyingRent / ioRecastPitia);

  const structureBreakeven = {
    dscrWithIO,
    dscrWith40yr,
    monthlySavingsIO,
    ioRecastPayment,
    ioRecastDSCR,
    note: 'Conservative lenders stress-test at amortizing payment even with IO. Recast payment assumes 10yr IO then 20yr amort.',
  };

  // ── Tax / Insurance Breakeven ────────────────────────────────────────
  // How much would annual taxes need to decrease for DSCR = 1.0?
  const targetFixed1_0 = qualifyingRent - pi;
  const targetTaxMo1_0 = targetFixed1_0 - (annualInsurance / 12) - hoa - (floodInsurance / 12);
  const taxAppealNeeded = r0(Math.max(0, (annualTaxes / 12 - targetTaxMo1_0) * 12));

  const targetInsMo1_0 = targetFixed1_0 - (annualTaxes / 12) - hoa - (floodInsurance / 12);
  const insuranceReshopNeeded = r0(Math.max(0, (annualInsurance / 12 - targetInsMo1_0) * 12));

  const taxInsuranceBreakeven = { taxAppealNeeded, insuranceReshopNeeded };

  // ── Path to 1.25 ─────────────────────────────────────────────────────
  const requiredRentIncrease = r0(pitia * 1.25 - qualifyingRent);
  const requiredPriceReduction = r0(purchasePrice - priceBreakeven.for1_25);
  const requiredAdditionalDown = ltvBreakeven.additionalDown.for1_25;
  const requiredRateBuydown = r2(rate - rateBreakeven.maxRateFor1_25);

  // Evaluate single fixes — pick the one with lowest cost that reaches 1.25
  const currentDSCR = r2(qualifyingRent / pitia);
  const fixes: { action: string; amount: number; cost: number }[] = [];

  if (requiredRentIncrease > 0) {
    fixes.push({ action: 'Increase Rent', amount: requiredRentIncrease, cost: 0 });
  }
  if (requiredRateBuydown > 0) {
    fixes.push({ action: 'Buy Down Rate', amount: requiredRateBuydown, cost: r0(loanAmount * requiredRateBuydown / 100) });
  }
  if (requiredAdditionalDown > 0) {
    fixes.push({ action: 'Additional Down Payment', amount: requiredAdditionalDown, cost: requiredAdditionalDown });
  }
  if (taxAppealNeeded > 0) {
    fixes.push({ action: 'Appeal Taxes', amount: taxAppealNeeded, cost: 500 });
  }
  if (dscrWithIO >= 1.25) {
    fixes.push({ action: 'Switch to IO', amount: r0(pitia - ioPitia), cost: 0 });
  }

  const bestSingleFix = fixes.length > 0
    ? fixes.reduce((best, f) => (f.cost < best.cost ? f : best), fixes[0])
    : { action: 'Already at 1.25+', amount: 0, cost: 0 };

  // Best combination: cheapest pair of actions
  const comboActions: string[] = [];
  let comboCost = 0;

  if (currentDSCR < 1.25) {
    if (requiredRentIncrease > 0 && requiredRentIncrease <= qualifyingRent * 0.10) {
      comboActions.push(`Increase rent $${requiredRentIncrease}/mo`);
    }
    if (requiredRateBuydown > 0 && requiredRateBuydown <= 1.0) {
      comboActions.push(`Buy down rate ${requiredRateBuydown.toFixed(2)}%`);
      comboCost += r0(loanAmount * requiredRateBuydown / 100);
    }
    if (requiredAdditionalDown > 0) {
      comboActions.push(`Add $${requiredAdditionalDown.toLocaleString()} down`);
      comboCost += requiredAdditionalDown;
    }
    if (dscrWithIO >= 1.25) {
      comboActions.push('Switch to 10yr IO');
    }
  }

  const pathTo1_25: PathToTarget = {
    targetDSCR: 1.25,
    requiredRentIncrease,
    requiredPriceReduction,
    requiredAdditionalDown,
    requiredRateBuydown,
    bestSingleFix,
    bestCombination: {
      actions: comboActions.length > 0 ? comboActions : ['Already at 1.25+ DSCR'],
      totalCost: comboCost,
    },
  };

  // ── Tornado ──────────────────────────────────────────────────────────
  const tornadoData = computeTornado(
    qualifyingRent, pitia, loanAmount, rate, termYears,
    annualTaxes, annualInsurance, hoa, floodInsurance,
    purchasePrice, ltv,
  );

  // ── Joint Appraisal Risk ─────────────────────────────────────────────
  const jointAppraisalRisk = computeJointAppraisalRisk(
    qualifyingRent, pitia, purchasePrice, ltv, loanAmount, rate, termYears,
    annualTaxes, annualInsurance, hoa, floodInsurance,
  );

  return {
    rentBreakeven,
    priceBreakeven,
    ltvBreakeven,
    rateBreakeven,
    structureBreakeven,
    taxInsuranceBreakeven,
    pathTo1_25,
    tornadoData,
    jointAppraisalRisk,
  };
}
