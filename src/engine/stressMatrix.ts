// ============================================================
// DSCR Deal Desk v11.12 — Combined Stress Matrix Engine
// 2D rate×rent heatmap with cell-level risk classification,
// Track 1 + Track 2 DSCR, monthly cash flow, and break-even curves.
// ============================================================
//
// PURPOSE
// ───────
// Existing computeCombinedStressMatrix() returns DSCR per cell but
// provides no risk-zone classification, no Track 2 DSCR, no cash flow,
// and no break-even curve. This engine produces a richer 2D matrix
// suitable for institutional stress-testing visualization.
//
// OUTPUTS
// ───────
// For each (rateOffset, rentOffset) cell:
//   - Track 1 DSCR (Lender Qualification): qualifyingRent / PITIA
//   - Track 2 DSCR (Investor Survival): NOI / PITIA (after vacancy+mgmt+maint)
//   - Monthly cash flow ($): NOI - PITIA
//   - Risk zone classification (5 zones)
//   - Human-readable interpretation
//
// Plus:
//   - Break-even curve: for each rent offset, the rate at which DSCR = 1.0
//   - Zone counts: how many cells fall into each risk zone
//   - Safe-zone % and fragile-zone % (deal health summary)
//   - Worst-case and best-case cells
// ============================================================

import type {
  PropertyInputs,
  LoanStructure,
  RentalStrategy,
  StressMatrixCell,
  StressMatrixResult,
  StressRiskZone,
  StressBreakEvenPoint,
} from './types';
import { calculatePI } from './engine';

// ============================================================
// AXIS CONFIGURATION
// ============================================================

// Rate offsets from base rate (in bps; 100 bps = 1.00%)
// Range: -150 to +200 bps — captures Fed cut cycle + stress cycle
const RATE_OFFSETS_BPS: number[] = [
  -150, -100, -75, -50, -25, 0, 25, 50, 75, 100, 150, 200,
];

// Rent offsets from base rent (in %)
// Range: -25% to +20% — captures recession vacancy + utility upside
const RENT_OFFSETS_PCT: number[] = [
  -25, -20, -15, -10, -5, 0, 5, 10, 15, 20,
];

// ============================================================
// RISK ZONE CLASSIFICATION
// ============================================================

export function classifyRiskZone(dscr: number): StressRiskZone {
  if (dscr >= 1.50) return 'SAFE';
  if (dscr >= 1.25) return 'COMFORTABLE';
  if (dscr >= 1.00) return 'MARGINAL';
  if (dscr >= 0.85) return 'FRAGILE';
  return 'DEAL_BREAK';
}

// ============================================================
// MAIN ENTRY POINT
// ============================================================

/**
 * Compute a 2D stress matrix showing DSCR outcomes under
 * simultaneous rate and rent shocks.
 *
 * @param property      Property inputs
 * @param loan          Loan structure
 * @param strategy      Rental strategy (drives vacancy assumption)
 * @param baseRate      Solved/base interest rate (%)
 * @param qualifyingRent  Track 1 qualifying rent (gross)
 * @returns             StressMatrixResult with 2D grid + summary
 */
export function computeStressMatrix(
  property: PropertyInputs,
  loan: LoanStructure,
  strategy: RentalStrategy,
  baseRate: number,
  qualifyingRent: number,
): StressMatrixResult {
  const loanAmount = property.purchasePrice * (loan.ltv / 100);
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
  const termMonths = termYears * 12;

  // Monthly fixed expenses (T, I, HOA, flood — NOT P&I)
  const monthlyFixed =
    property.annualTaxes / 12 +
    property.annualInsurance / 12 +
    property.hoa +
    property.floodInsurance; // MONTHLY — do not divide by 12 (bug audit #1)

  // Track 2 haircut assumptions (per strategy)
  const vacancyPct = 8;
  const managementPct = 8;
  const maintenancePct = 5;

  // Build absolute rate axis
  const rateAxis: number[] = RATE_OFFSETS_BPS.map(bps => {
    const r = baseRate + bps / 100;
    // Floor at 0.5% (nominal rates shouldn't go to zero in stress scenarios)
    return Math.max(0.5, Math.round(r * 100) / 100);
  });

  const rentAxis: number[] = RENT_OFFSETS_PCT;

  // Build 2D cell grid
  const cells: StressMatrixCell[][] = [];
  const zoneCounts: Record<StressRiskZone, number> = {
    SAFE: 0,
    COMFORTABLE: 0,
    MARGINAL: 0,
    FRAGILE: 0,
    DEAL_BREAK: 0,
  };

  let worstCase: StressMatrixCell | null = null;
  let bestCase: StressMatrixCell | null = null;

  for (let i = 0; i < rateAxis.length; i++) {
    const ratePct = rateAxis[i];
    const rateOffsetBps = RATE_OFFSETS_BPS[i];

    const piMonthly = calculatePI(loanAmount, ratePct, termMonths);
    const pitiaMonthly = piMonthly + monthlyFixed;

    const row: StressMatrixCell[] = [];

    for (let j = 0; j < rentAxis.length; j++) {
      const rentOffsetPct = rentAxis[j];
      const adjustedRent = qualifyingRent * (1 + rentOffsetPct / 100);

      // Track 1: Lender Qualification DSCR (qualifyingRent / PITIA, no haircuts)
      const track1DSCR = pitiaMonthly > 0 ? adjustedRent / pitiaMonthly : 0;

      // Track 2: Investor Survival DSCR (after vacancy+mgmt+maint)
      const netRent = adjustedRent * (1 - vacancyPct / 100);
      const management = adjustedRent * managementPct / 100;
      const maintenance = adjustedRent * maintenancePct / 100;
      const noiMonthly = netRent - management - maintenance;
      const track2DSCR = pitiaMonthly > 0 ? noiMonthly / pitiaMonthly : 0;

      const monthlyCashFlow = noiMonthly - pitiaMonthly;
      const annualCashFlow = monthlyCashFlow * 12;

      const riskZone = classifyRiskZone(track1DSCR);
      zoneCounts[riskZone]++;

      const interpretation = buildInterpretation(
        track1DSCR, track2DSCR, monthlyCashFlow, riskZone, rateOffsetBps, rentOffsetPct,
      );

      const cell: StressMatrixCell = {
        ratePct: Math.round(ratePct * 100) / 100,
        rateOffsetBps,
        rentOffsetPct,
        adjustedRent: Math.round(adjustedRent * 100) / 100,
        piMonthly: Math.round(piMonthly * 100) / 100,
        pitiaMonthly: Math.round(pitiaMonthly * 100) / 100,
        track1DSCR: Math.round(track1DSCR * 1000) / 1000,
        track2DSCR: Math.round(track2DSCR * 1000) / 1000,
        monthlyCashFlow: Math.round(monthlyCashFlow * 100) / 100,
        annualCashFlow: Math.round(annualCashFlow),
        riskZone,
        interpretation,
      };

      row.push(cell);

      // Track worst/best by Track 1 DSCR
      if (!worstCase || cell.track1DSCR < worstCase.track1DSCR) {
        worstCase = cell;
      }
      if (!bestCase || cell.track1DSCR > bestCase.track1DSCR) {
        bestCase = cell;
      }
    }

    cells.push(row);
  }

  // Build break-even curve: for each rent offset, find the rate where DSCR = 1.0
  const breakEvenCurve: StressBreakEvenPoint[] = rentAxis.map(rentOffsetPct => {
    const adjustedRent = qualifyingRent * (1 + rentOffsetPct / 100);
    // DSCR = 1.0 when adjustedRent = PITIA = PI + monthlyFixed
    // → PI = adjustedRent - monthlyFixed
    // → solve for rate: PI(loanAmount, rate, termMonths) = adjustedRent - monthlyFixed
    const targetPI = adjustedRent - monthlyFixed;
    if (targetPI <= 0) {
      // Even at 0% rate, PI > 0 (interest-only on principal / termMonths)
      // → check if 0% rate gives PI < targetPI; if so, DSCR stays > 1.0 across all rates
      const piAtZero = loanAmount / termMonths;  // simple division at 0% rate
      if (piAtZero <= targetPI) {
        // Never breaks in any realistic stress
        return { rentOffsetPct, breakEvenRatePct: null, cushionBps: 99999 };
      }
      // Otherwise breaks below 0%
      return { rentOffsetPct, breakEvenRatePct: 0, cushionBps: Math.round(baseRate * 100) };
    }
    // Binary search for the rate
    const breakEvenRate = solveBreakEvenRate(loanAmount, termMonths, targetPI);
    if (breakEvenRate === null) {
      return { rentOffsetPct, breakEvenRatePct: null, cushionBps: 99999 };
    }
    const cushionBps = Math.round((baseRate - breakEvenRate) * 100);
    return {
      rentOffsetPct,
      breakEvenRatePct: Math.round(breakEvenRate * 100) / 100,
      cushionBps,
    };
  });

  // Aggregate stats
  const totalCells = cells.reduce((sum, row) => sum + row.length, 0);
  const safeZonePct = (zoneCounts.SAFE + zoneCounts.COMFORTABLE) / totalCells;
  const fragileZonePct = (zoneCounts.FRAGILE + zoneCounts.DEAL_BREAK) / totalCells;

  // Base case DSCR
  const basePI = calculatePI(loanAmount, baseRate, termMonths);
  const basePITIA = basePI + monthlyFixed;
  const baseTrack1DSCR = basePITIA > 0 ? qualifyingRent / basePITIA : 0;
  const baseNOI = qualifyingRent * (1 - vacancyPct / 100)
    - qualifyingRent * managementPct / 100
    - qualifyingRent * maintenancePct / 100;
  const baseTrack2DSCR = basePITIA > 0 ? baseNOI / basePITIA : 0;

  // Summary
  const summary = buildSummary(
    baseRate, qualifyingRent, baseTrack1DSCR, baseTrack2DSCR,
    zoneCounts, totalCells, safeZonePct, fragileZonePct,
    worstCase!, bestCase!,
  );

  return {
    baseRate: Math.round(baseRate * 100) / 100,
    baseRent: Math.round(qualifyingRent * 100) / 100,
    baseLTV: loan.ltv,
    baseTrack1DSCR: Math.round(baseTrack1DSCR * 1000) / 1000,
    baseTrack2DSCR: Math.round(baseTrack2DSCR * 1000) / 1000,
    rateAxis,
    rentAxis,
    cells,
    breakEvenCurve,
    zoneCounts,
    totalCells,
    safeZonePct: Math.round(safeZonePct * 1000) / 10,  // 0-100 with 1 decimal
    fragileZonePct: Math.round(fragileZonePct * 1000) / 10,
    worstCase: worstCase!,
    bestCase: bestCase!,
    summary,
  };
}

// ============================================================
// BREAK-EVENT RATE SOLVER
// Find the rate at which PI(loanAmount, rate, termMonths) = targetPI
// ============================================================

function solveBreakEvenRate(
  loanAmount: number,
  termMonths: number,
  targetPI: number,
  minRate: number = 0,
  maxRate: number = 30,
  iterations: number = 60,
): number | null {
  let lo = minRate;
  let hi = maxRate;

  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const pi = calculatePI(loanAmount, mid, termMonths);
    if (Math.abs(pi - targetPI) < 0.01) {
      return mid;
    }
    // PI increases with rate — if PI(mid) > target, rate too high
    if (pi > targetPI) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  const finalRate = (lo + hi) / 2;
  if (finalRate >= 30 || finalRate <= 0) return null;
  return finalRate;
}

// ============================================================
// INTERPRETATION BUILDER
// ============================================================

function buildInterpretation(
  track1DSCR: number,
  track2DSCR: number,
  monthlyCashFlow: number,
  riskZone: StressRiskZone,
  rateOffsetBps: number,
  rentOffsetPct: number,
): string {
  const rateDir = rateOffsetBps === 0 ? 'base rate' : `${rateOffsetBps > 0 ? '+' : ''}${rateOffsetBps}bps`;
  const rentDir = rentOffsetPct === 0 ? 'base rent' : `${rentOffsetPct > 0 ? '+' : ''}${rentOffsetPct}% rent`;
  const cfSign = monthlyCashFlow >= 0 ? '+' : '-';

  const zoneText: Record<StressRiskZone, string> = {
    SAFE: 'Comfortable buffer — qualifies for best-rate tier',
    COMFORTABLE: 'Lender comfort threshold (≥1.25) — standard qualification',
    MARGINAL: 'Qualifies but no cushion — any adverse event breaks deal',
    FRAGILE: 'Deal-break zone — lender will not qualify at this stress',
    DEAL_BREAK: 'Severe negative cash flow — immediate refinancing required',
  };

  return `${rateDir} × ${rentDir}: T1 ${track1DSCR.toFixed(3)}×, T2 ${track2DSCR.toFixed(3)}×, CF ${cfSign}$${Math.abs(monthlyCashFlow).toFixed(0)}/mo. ${zoneText[riskZone]}.`;
}

// ============================================================
// SUMMARY BUILDER
// ============================================================

function buildSummary(
  baseRate: number,
  baseRent: number,
  baseTrack1DSCR: number,
  baseTrack2DSCR: number,
  zoneCounts: Record<StressRiskZone, number>,
  totalCells: number,
  safeZonePct: number,
  fragileZonePct: number,
  worstCase: StressMatrixCell,
  bestCase: StressMatrixCell,
): string {
  const parts: string[] = [];

  parts.push(
    `Base case: ${baseRate.toFixed(3)}% rate × $${baseRent.toFixed(0)}/mo rent → ` +
    `T1 DSCR ${baseTrack1DSCR.toFixed(3)}×, T2 DSCR ${baseTrack2DSCR.toFixed(3)}×.`,
  );

  parts.push(
    `Stress matrix: ${totalCells} cells across ` +
    `${RATE_OFFSETS_BPS.length} rate offsets × ${RENT_OFFSETS_PCT.length} rent offsets. ` +
    `SAFE/COMFORTABLE: ${zoneCounts.SAFE + zoneCounts.COMFORTABLE} (${safeZonePct.toFixed(1)}%), ` +
    `MARGINAL: ${zoneCounts.MARGINAL}, ` +
    `FRAGILE/DEAL_BREAK: ${zoneCounts.FRAGILE + zoneCounts.DEAL_BREAK} (${fragileZonePct.toFixed(1)}%).`,
  );

  parts.push(
    `Worst case: ${worstCase.ratePct.toFixed(3)}% × ${worstCase.rentOffsetPct > 0 ? '+' : ''}${worstCase.rentOffsetPct}% rent → ` +
    `T1 ${worstCase.track1DSCR.toFixed(3)}× (CF $${worstCase.monthlyCashFlow.toFixed(0)}/mo, ${worstCase.riskZone}).`,
  );

  parts.push(
    `Best case: ${bestCase.ratePct.toFixed(3)}% × ${bestCase.rentOffsetPct > 0 ? '+' : ''}${bestCase.rentOffsetPct}% rent → ` +
    `T1 ${bestCase.track1DSCR.toFixed(3)}× (CF $${bestCase.monthlyCashFlow.toFixed(0)}/mo, ${bestCase.riskZone}).`,
  );

  if (fragileZonePct > 30) {
    parts.push(
      `🚨 >30% of stress cells are FRAGILE/DEAL_BREAK — deal is structurally fragile to combined rate+rent shocks. ` +
      `Recommend lower LTV, larger down payment, or fixed-rate product.`,
    );
  } else if (fragileZonePct > 15) {
    parts.push(
      `⚠️ 15-30% of cells are FRAGILE/DEAL_BREAK — deal has tail risk. ` +
      `Monitor rent trajectory; consider rate-lock hedge or refi trigger.`,
    );
  } else {
    parts.push(
      `✅ <15% of cells are FRAGILE/DEAL_BREAK — deal is structurally robust to combined stress.`,
    );
  }

  return parts.join(' ');
}

// ============================================================
// COLOR HELPER for UI
// Returns Tailwind class for a given risk zone
// ============================================================

export function riskZoneColor(zone: StressRiskZone): string {
  switch (zone) {
    case 'SAFE':          return 'bg-emerald-600 text-white';
    case 'COMFORTABLE':   return 'bg-emerald-700/70 text-white';
    case 'MARGINAL':      return 'bg-yellow-600 text-black';
    case 'FRAGILE':       return 'bg-orange-600 text-white';
    case 'DEAL_BREAK':    return 'bg-red-700 text-white';
  }
}

export function riskZoneTextColor(zone: StressRiskZone): string {
  switch (zone) {
    case 'SAFE':          return 'text-emerald-400';
    case 'COMFORTABLE':   return 'text-emerald-400';
    case 'MARGINAL':      return 'text-yellow-400';
    case 'FRAGILE':       return 'text-orange-400';
    case 'DEAL_BREAK':    return 'text-red-400';
  }
}

export function riskZoneLabel(zone: StressRiskZone): string {
  switch (zone) {
    case 'SAFE':          return 'SAFE ≥1.50';
    case 'COMFORTABLE':   return 'COMF 1.25-1.50';
    case 'MARGINAL':      return 'MARG 1.00-1.25';
    case 'FRAGILE':       return 'FRAG 0.85-1.00';
    case 'DEAL_BREAK':    return 'BREAK <0.85';
  }
}
