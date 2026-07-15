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
import { computeTcoRate, mapToTcoType } from './tcoDscr';
import type { TcoPropertyType, TcoPropertyAge, TcoMarketType } from './tcoDscr';

function assertFiniteIntermediate(label: string, ...values: number[]): void {
  if (values.some(value => !Number.isFinite(value))) {
    throw new RangeError(`${label} exceeded the supported finite calculation range.`);
  }
}

function calculateFinitePI(loanAmount: number, annualRate: number, termMonths: number): number {
  const payment = calculatePI(loanAmount, annualRate, termMonths);
  if (!Number.isFinite(payment) || payment < 0 || (loanAmount > 0 && payment === 0)) {
    throw new RangeError('Principal-and-interest payment is unavailable for these inputs.');
  }
  return payment;
}

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
  if (!Number.isFinite(dscr)) return 'DEAL_BREAK';
  if (dscr >= 1.50) return 'SAFE';
  if (dscr >= 1.25) return 'COMFORTABLE';
  if (dscr >= 1.00) return 'MARGINAL';
  if (dscr >= 0.85) return 'FRAGILE';
  return 'DEAL_BREAK';
}

// ============================================================
// BREAK-EVEN VACANCY
// ============================================================

/**
 * Break-even vacancy: the occupancy loss the deal can absorb before its DSCR
 * falls to 1.00 — i.e. the vacancy rate at which rent no longer covers the full
 * payment. Computed on the same lender basis as the displayed DSCR
 * (effective rent ÷ PITIA), so the number is consistent with the gauge.
 *
 * Hardened per the DSCR improvement spec (Break-Even Vacancy, [High]) with a
 * structural-failure guard: if even full occupancy can't cover the payment, the
 * property is structurally cash-negative and break-even vacancy is 0. The naive
 * `1 - PITIA/rent` would otherwise return a negative/meaningless value here.
 *
 * @param grossMonthlyRent  Monthly rent at full occupancy (after any rent shock)
 * @param monthlyPITIA      Full monthly payment (P + I + taxes + insurance + HOA)
 * @returns vacancyPct (0–100, 1-dp) + structurallyNegative flag
 */
export function computeBreakEvenVacancy(
  grossMonthlyRent: number,
  monthlyPITIA: number,
): { vacancyPct: number; structurallyNegative: boolean } {
  // Underwater at full occupancy (or non-positive inputs) → impossible without
  // repairs/equity. Break-even vacancy is 0 and the deal is flagged.
  if (!Number.isFinite(grossMonthlyRent) || !Number.isFinite(monthlyPITIA)) {
    return { vacancyPct: 0, structurallyNegative: true };
  }
  if (grossMonthlyRent <= 0 || monthlyPITIA <= 0 || grossMonthlyRent <= monthlyPITIA) {
    return { vacancyPct: 0, structurallyNegative: grossMonthlyRent <= monthlyPITIA };
  }
  const vBE = 1 - monthlyPITIA / grossMonthlyRent; // 0..1
  return { vacancyPct: Math.round(vBE * 1000) / 10, structurallyNegative: false };
}

// ============================================================
// DUAL-TRACK DSCR + "QUALIFIES BUT DANGEROUS"
// ============================================================

/**
 * The product's core split, for a single scenario:
 *  • Track 1 (lender)  = gross rent ÷ PITIA — what the lender qualifies on.
 *  • Track 2 (investor)= modeled NOI ÷ PITIA after vacancy, management,
 *    maintenance, and CapEx reserves. This is the canonical Track-2 definition.
 *
 * The "Qualifies but Dangerous" flag (DSCR improvement spec, [High]): a deal the
 * lender approves (Track 1 ≥ 1.00) that loses money in reality (Track 2 < 1.00)
 * with a wide gap (Track1 − Track2 > 0.20). This is the trap Track 2 catches.
 *
 * @param grossMonthlyRent  Monthly rent after any rent shock, before vacancy
 * @param monthlyPITIA      Full monthly payment
 * @param opts              Operating haircuts (defaults: vacancy 8, mgmt 8, maint 5)
 */
export function computeDualTrackDSCR(
  grossMonthlyRent: number,
  monthlyPITIA: number,
  opts: { vacancyPct?: number; propertyType?: TcoPropertyType; propertyAge?: TcoPropertyAge; marketType?: TcoMarketType; isSelfManaged?: boolean } = {},
): { track1: number; track2: number; delta: number; qualifiesButDangerous: boolean } {
  if (!Number.isFinite(grossMonthlyRent) || !Number.isFinite(monthlyPITIA) || grossMonthlyRent <= 0 || monthlyPITIA <= 0) {
    return { track1: 0, track2: 0, delta: 0, qualifiesButDangerous: false };
  }
  // Track 2 opex from the TCO single-source (property-type/age/market + CapEx).
  // vacancyPct, when supplied (e.g. the Stress Matrix slider), overrides the
  // table vacancy; management/maintenance/capex come from the TCO table.
  const rate = computeTcoRate({
    propertyType: opts.propertyType,
    propertyAge: opts.propertyAge,
    marketType: opts.marketType,
    isSelfManaged: opts.isSelfManaged,
    vacancyOverridePct: opts.vacancyPct,
  });
  const track1 = grossMonthlyRent / monthlyPITIA;
  const noi = grossMonthlyRent * Math.max(0, 1 - rate.total);
  const track2 = noi / monthlyPITIA;
  const delta = track1 - track2;
  assertFiniteIntermediate('Dual-track DSCR', track1, noi, track2, delta, track1 * 1000, track2 * 1000, delta * 1000);
  return {
    track1: Math.round(track1 * 1000) / 1000,
    track2: Math.round(track2 * 1000) / 1000,
    delta: Math.round(delta * 1000) / 1000,
    qualifiesButDangerous: track1 >= 1.0 && track2 < 1.0 && delta > 0.2,
  };
}

// ============================================================
// MULTI-SHOCK WATERFALL
// ============================================================

export interface WaterfallShock {
  /** e.g. "ARM reset +1.5%", "Tax reassessment", "Insurance surge", "Rent −10%". */
  label: string;
  /** Added to PITIA ($/mo). Use for rate/tax/insurance shocks. */
  pitiaDelta?: number;
  /** Multiplies rent (e.g. 0.90 for −10%). Use for rent shocks. */
  rentMultiplier?: number;
}

export interface WaterfallStep {
  label: string;
  /** DSCR after this shock is applied (cumulative). */
  dscrAfter: number;
  /** Change in DSCR contributed by this shock alone. */
  marginalDelta: number;
}

export interface ShockWaterfallResult {
  baseDSCR: number;
  steps: WaterfallStep[];
  finalDSCR: number;
  /** baseDSCR − finalDSCR (total destruction). */
  totalDelta: number;
}

/**
 * Decompose a multi-shock scenario into the marginal DSCR hit of each shock,
 * applied in order (Edge §7 "cumulative impact waterfall"). Unlike the 2D
 * stress matrix (which crosses two axes), this isolates *each* shock's bite so
 * the investor sees which one breaks the deal.
 *
 * Shocks compound: each step starts from the running rent/PITIA of the prior.
 */
export function computeShockWaterfall(
  baseRent: number,
  basePITIA: number,
  shocks: WaterfallShock[],
): ShockWaterfallResult {
  const safeDscr = (rent: number, pitia: number) => (
    Number.isFinite(rent) && Number.isFinite(pitia) && rent >= 0 && pitia > 0 ? rent / pitia : 0
  );
  const baseDSCR = safeDscr(baseRent, basePITIA);

  let rent = baseRent;
  let pitia = basePITIA;
  let prevDSCR = baseDSCR;
  const steps: WaterfallStep[] = [];

  for (const s of shocks) {
    if (s.rentMultiplier !== undefined && Number.isFinite(s.rentMultiplier) && s.rentMultiplier >= 0) {
      rent = rent * s.rentMultiplier;
      assertFiniteIntermediate('Waterfall rent', rent);
    }
    if (s.pitiaDelta !== undefined && Number.isFinite(s.pitiaDelta)) {
      pitia = Math.max(0, pitia + s.pitiaDelta);
      assertFiniteIntermediate('Waterfall PITIA', pitia);
    }
    const dscrAfter = safeDscr(rent, pitia);
    assertFiniteIntermediate('Waterfall DSCR', dscrAfter, dscrAfter * 1000, (dscrAfter - prevDSCR) * 1000);
    steps.push({
      label: s.label,
      dscrAfter: Math.round(dscrAfter * 1000) / 1000,
      marginalDelta: Math.round((dscrAfter - prevDSCR) * 1000) / 1000,
    });
    prevDSCR = dscrAfter;
  }

  const finalDSCR = prevDSCR;
  return {
    baseDSCR: Math.round(baseDSCR * 1000) / 1000,
    steps,
    finalDSCR: Math.round(finalDSCR * 1000) / 1000,
    totalDelta: Math.round((baseDSCR - finalDSCR) * 1000) / 1000,
  };
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
  const finiteInputs = [
    property.purchasePrice, property.annualTaxes, property.annualInsurance,
    property.hoa, property.floodInsurance, property.unitCount,
    loan.ltv, baseRate, qualifyingRent,
  ];
  if (finiteInputs.some(value => !Number.isFinite(value))) {
    throw new RangeError('Stress-matrix inputs must be finite numbers.');
  }
  if (property.purchasePrice <= 0 || loan.ltv <= 0 || loan.ltv > 100 || baseRate < 0 || qualifyingRent < 0) {
    throw new RangeError('Stress-matrix loan, rate, LTV, and rent inputs are outside valid ranges.');
  }
  if ([property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance].some(value => value < 0)) {
    throw new RangeError('Stress-matrix expenses must be non-negative.');
  }
  const loanAmount = property.purchasePrice * (loan.ltv / 100);
  assertFiniteIntermediate('Stress-matrix loan amount', loanAmount);
  if (loanAmount <= 0) throw new RangeError('Stress-matrix loan amount is too small to calculate.');
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
  const termMonths = termYears * 12;

  // Monthly fixed expenses (T, I, HOA, flood — NOT P&I)
  const monthlyFixed =
    property.annualTaxes / 12 +
    property.annualInsurance / 12 +
    property.hoa +
    property.floodInsurance / 12;
  assertFiniteIntermediate('Stress-matrix monthly fixed expenses', monthlyFixed);

  // Track 2 opex from the TCO single-source — property-type/age/market + CapEx.
  // Replaces the legacy flat 8% vac + 8% mgmt + 5% maint.
  const tcoRate = computeTcoRate({ propertyType: mapToTcoType(property.unitCount, strategy === 'STR') });

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

    const piMonthly = calculateFinitePI(loanAmount, ratePct, termMonths);
    const pitiaMonthly = piMonthly + monthlyFixed;
    assertFiniteIntermediate('Stress-matrix PITIA', pitiaMonthly);

    const row: StressMatrixCell[] = [];

    for (let j = 0; j < rentAxis.length; j++) {
      const rentOffsetPct = rentAxis[j];
      const adjustedRent = qualifyingRent * (1 + rentOffsetPct / 100);
      assertFiniteIntermediate('Stress-matrix adjusted rent', adjustedRent);

      // Track 1: Lender Qualification DSCR (qualifyingRent / PITIA, no haircuts)
      const track1DSCR = pitiaMonthly > 0 ? adjustedRent / pitiaMonthly : 0;

      // Track 2: Investor Survival DSCR (after the TCO opex haircut)
      const noiMonthly = adjustedRent * Math.max(0, 1 - tcoRate.total);
      const track2DSCR = pitiaMonthly > 0 ? noiMonthly / pitiaMonthly : 0;

      const monthlyCashFlow = noiMonthly - pitiaMonthly;
      const annualCashFlow = monthlyCashFlow * 12;
      assertFiniteIntermediate(
        'Stress-matrix cell', track1DSCR, track2DSCR, noiMonthly, monthlyCashFlow, annualCashFlow,
        adjustedRent * 100, piMonthly * 100, pitiaMonthly * 100,
        track1DSCR * 1000, track2DSCR * 1000, monthlyCashFlow * 100,
      );

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
    return computeBreakEvenRatePoint(
      loanAmount, termMonths, monthlyFixed, adjustedRent, baseRate, rentOffsetPct,
    );
  });

  // Aggregate stats
  const totalCells = cells.reduce((sum, row) => sum + row.length, 0);
  const safeZonePct = (zoneCounts.SAFE + zoneCounts.COMFORTABLE) / totalCells;
  const fragileZonePct = (zoneCounts.FRAGILE + zoneCounts.DEAL_BREAK) / totalCells;

  // Base case DSCR
  const basePI = calculateFinitePI(loanAmount, baseRate, termMonths);
  const basePITIA = basePI + monthlyFixed;
  const baseTrack1DSCR = basePITIA > 0 ? qualifyingRent / basePITIA : 0;
  const baseNOI = qualifyingRent * Math.max(0, 1 - tcoRate.total);
  const baseTrack2DSCR = basePITIA > 0 ? baseNOI / basePITIA : 0;
  assertFiniteIntermediate(
    'Stress-matrix base case', basePITIA, baseTrack1DSCR, baseNOI, baseTrack2DSCR,
    baseRate * 100, qualifyingRent * 100, baseTrack1DSCR * 1000, baseTrack2DSCR * 1000,
  );

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
    const pi = calculateFinitePI(loanAmount, mid, termMonths);
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

  return (lo + hi) / 2;
}

/**
 * Rate where Track-1 DSCR reaches 1.00 for one rent scenario. Cushion is signed
 * headroom: positive means the break-even rate is above base; negative means the
 * deal is already broken at base. A null rate means it survives through the
 * modeled 30% ceiling; cushion then reports finite minimum modeled headroom.
 */
export function computeBreakEvenRatePoint(
  loanAmount: number,
  termMonths: number,
  monthlyFixed: number,
  adjustedRent: number,
  baseRate: number,
  rentOffsetPct: number = 0,
  maxRate: number = 30,
): StressBreakEvenPoint {
  const values = [loanAmount, termMonths, monthlyFixed, adjustedRent, baseRate, rentOffsetPct, maxRate];
  if (values.some(value => !Number.isFinite(value)) || loanAmount <= 0 || termMonths <= 0 || monthlyFixed < 0 || adjustedRent < 0 || baseRate < 0 || maxRate <= 0) {
    throw new RangeError('Break-even inputs must be finite and within valid ranges.');
  }
  assertFiniteIntermediate('Break-even rate cushion', baseRate * 100, (maxRate - baseRate) * 100);

  const targetPI = adjustedRent - monthlyFixed;
  const piAtZero = loanAmount / termMonths;
  if (targetPI <= piAtZero) {
    return {
      rentOffsetPct,
      breakEvenRatePct: 0,
      cushionBps: -Math.round(baseRate * 100),
    };
  }

  const piAtMax = calculateFinitePI(loanAmount, maxRate, termMonths);
  if (targetPI >= piAtMax) {
    return {
      rentOffsetPct,
      breakEvenRatePct: null,
      cushionBps: Math.max(0, Math.round((maxRate - baseRate) * 100)),
    };
  }

  const breakEvenRate = solveBreakEvenRate(loanAmount, termMonths, targetPI, 0, maxRate);
  if (breakEvenRate === null || !Number.isFinite(breakEvenRate)) {
    throw new RangeError('Unable to solve a finite break-even rate.');
  }
  return {
    rentOffsetPct,
    breakEvenRatePct: Math.round(breakEvenRate * 100) / 100,
    cushionBps: Math.round((breakEvenRate - baseRate) * 100),
  };
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
