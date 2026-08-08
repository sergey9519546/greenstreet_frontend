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
import type { TcoPropertyType, TcoPropertyAge, TcoMarketType, TcoRateComponents, TcoRateOpts } from './tcoDscr';
import { buildAmortizationSchedule, paymentAtMonth } from './amortization';

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
 *  • Track 2 (investor)= NOI ÷ PITIA after vacancy + management + maintenance —
 *    what the investor actually nets. Matches computeStressMatrix's per-cell math.
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
  if (grossMonthlyRent <= 0 || monthlyPITIA <= 0) {
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
  const safeDscr = (rent: number, pitia: number) => (pitia > 0 ? rent / pitia : 0);
  const baseDSCR = safeDscr(baseRent, basePITIA);

  let rent = baseRent;
  let pitia = basePITIA;
  let prevDSCR = baseDSCR;
  const steps: WaterfallStep[] = [];

  for (const s of shocks) {
    if (s.rentMultiplier !== undefined) rent = rent * s.rentMultiplier;
    if (s.pitiaDelta !== undefined) pitia = pitia + s.pitiaDelta;
    const dscrAfter = safeDscr(rent, pitia);
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
// CANONICAL BASE SCENARIO
// ============================================================
//
// GATE ITEM 1 ("one canonical base scenario shared by every stress"):
// before this section existed, the base case was derived independently in
// THREE places that could silently disagree —
//   1. computeStressMatrix's grid loop (implicitly, at the rateOffsetBps=0 /
//      rentOffsetPct=0 cell),
//   2. computeStressMatrix's own "Base case DSCR" block, re-running
//      calculatePI + the monthlyFixed arithmetic a second time after the
//      loop, and
//   3. StressMatrixPage.tsx's local `calcDSCR` + `previewCells`, two MORE
//      independent re-implementations (different term-months handling, no
//      flood insurance, ad-hoc vacancy math) used for the live slider readout
//      and the hero preview heatmap.
// Nothing enforced that these agreed. buildStressBaseScenario() is now the
// ONLY place the unshocked deal is derived; computeStressCell() is the ONLY
// place a shock is applied to it. Every cell of the matrix, the page's live
// "stressed DSCR" slider readout, and the hero preview heatmap all call
// computeStressCell() against the SAME base object.

function ioMonthsFromPeriod(ioPeriod: LoanStructure['ioPeriod']): number {
  switch (ioPeriod) {
    case 'NONE': return 0;
    case '5_YR': return 60;
    case '7_YR': return 84;
    case '10_YR': return 120;
    default:
      // Fail closed: an unrecognized IO enum must not silently become NONE
      // (understating the payment) or any other guessed duration.
      throw new Error(`computeStressMatrix: unsupported interest-only period: ${String(ioPeriod)}`);
  }
}

function termMonthsFromTerm(term: LoanStructure['term']): number {
  switch (term) {
    case '30_YR': return 360;
    case '40_YR': return 480;
    case '15_YR': return 180;
    default:
      throw new Error(`computeStressMatrix: unsupported loan term: ${String(term)}`);
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

/**
 * The one unshocked deal every stress in this module is measured against.
 * Every field a shock could touch — loan amount, term, IO period, fixed
 * costs, the TCO opex rate — is resolved exactly once, here.
 */
export interface StressBaseScenario {
  loanAmount: number;
  /** LTV (%) the loan amount was sized from — carried through for display only. */
  ltvPct: number;
  termMonths: number;
  ioMonths: number;
  baseRatePct: number;
  qualifyingRent: number;
  /** Taxes + insurance only, monthly. Split out so an expense shock can hit exactly this. */
  monthlyTaxesInsurance: number;
  /** HOA + flood insurance, monthly. Not stressed by the expense shock (structural, not market-driven). */
  monthlyHoaFlood: number;
  /** monthlyTaxesInsurance + monthlyHoaFlood, unshocked. */
  monthlyFixed: number;
  /** The TCO opts used to build `tcoRate`, minus vacancy — so a vacancy override can rebuild consistently. */
  tcoOpts: TcoRateOpts;
  /** Canonical Track-2 opex rate at the base (no vacancy override). */
  tcoRate: TcoRateComponents;
  basePI: number;
  basePITIA: number;
  baseTrack1DSCR: number;
  baseTrack2DSCR: number;
}

/**
 * Build the ONE canonical base scenario. Fails closed: a missing or
 * non-finite deal input must throw here rather than silently propagate as
 * 0, Infinity, or NaN into every downstream cell.
 */
export function buildStressBaseScenario(
  property: PropertyInputs,
  loan: LoanStructure,
  strategy: RentalStrategy,
  baseRate: number,
  qualifyingRent: number,
): StressBaseScenario {
  if (!Number.isFinite(property.purchasePrice) || property.purchasePrice <= 0) {
    throw new Error('buildStressBaseScenario: purchasePrice must be a positive, finite number.');
  }
  if (!Number.isFinite(loan.ltv) || loan.ltv <= 0 || loan.ltv > 100) {
    throw new Error('buildStressBaseScenario: ltv must be a finite number in (0, 100].');
  }
  if (!Number.isFinite(baseRate) || baseRate < 0) {
    throw new Error('buildStressBaseScenario: baseRate must be a non-negative, finite number.');
  }
  if (!Number.isFinite(qualifyingRent) || qualifyingRent < 0) {
    throw new Error('buildStressBaseScenario: qualifyingRent must be a non-negative, finite number.');
  }

  const loanAmount = property.purchasePrice * (loan.ltv / 100);
  const termMonths = termMonthsFromTerm(loan.term);
  const ioMonths = ioMonthsFromPeriod(loan.ioPeriod);

  const monthlyTaxesInsurance = property.annualTaxes / 12 + property.annualInsurance / 12;
  // hoa and floodInsurance are both MONTHLY figures already (bug audit #1 — do not divide by 12).
  const monthlyHoaFlood = property.hoa + property.floodInsurance;
  const monthlyFixed = monthlyTaxesInsurance + monthlyHoaFlood;

  // Track 2 opex from the TCO single-source — property-type/age/market + CapEx.
  const tcoOpts: TcoRateOpts = { propertyType: mapToTcoType(property.unitCount, strategy === 'STR') };
  const tcoRate = computeTcoRate(tcoOpts);

  const schedule = buildAmortizationSchedule({
    principal: loanAmount,
    annualRatePct: baseRate,
    termMonths,
    ioMonths,
  });
  const basePI = paymentAtMonth(schedule, 1);
  const basePITIA = basePI + monthlyFixed;
  const baseTrack1DSCR = basePITIA > 0 ? qualifyingRent / basePITIA : 0;
  const baseNOI = qualifyingRent * Math.max(0, 1 - tcoRate.total);
  const baseTrack2DSCR = basePITIA > 0 ? baseNOI / basePITIA : 0;

  return {
    loanAmount,
    ltvPct: loan.ltv,
    termMonths,
    ioMonths,
    baseRatePct: baseRate,
    qualifyingRent,
    monthlyTaxesInsurance,
    monthlyHoaFlood,
    monthlyFixed,
    tcoOpts,
    tcoRate,
    basePI,
    basePITIA,
    baseTrack1DSCR: round3(baseTrack1DSCR),
    baseTrack2DSCR: round3(baseTrack2DSCR),
  };
}

/**
 * Documents every shock this module knows how to apply, all relative to the
 * ONE shared base (GATE ITEM 2 — "documented rent, vacancy, expense, and
 * rate shocks"):
 *
 *   • RATE   — rateOffsetBps: added to the base rate, in basis points. Modeled
 *     as an amortization `rateSteps` entry effective at month 1 (folded into
 *     origination per the kernel's own contract — see amortization.ts), so
 *     the shocked payment comes from the SAME kernel every other tool in this
 *     codebase uses, not a re-derived PI formula. Floored at 0.5% nominal.
 *   • RENT   — rentOffsetPct: multiplies the base qualifying rent. Negative =
 *     rent decline (vacancy-adjacent market softness); positive = rent growth.
 *   • VACANCY — vacancyOverridePct: overrides the TCO table's vacancy
 *     component (which otherwise defaults from property type + market),
 *     changing the Track 2 (investor-survival) haircut only. Track 1 (lender)
 *     is unaffected — the lender qualifies on gross rent, not net.
 *   • EXPENSE — expenseShockPct: a % increase applied ONLY to the
 *     taxes+insurance component of the fixed payment (a tax reassessment or
 *     insurance-market spike). HOA and flood insurance are structural
 *     obligations, not market-driven, so they are not stressed by this lever.
 */
export interface StressShockInput {
  /** Rate offset from the base rate, in basis points. Default 0. */
  rateOffsetBps?: number;
  /** Rent change from the base qualifying rent, in percent. Default 0. */
  rentOffsetPct?: number;
  /** Overrides the TCO vacancy component (0–100). Omit to use the base's own. */
  vacancyOverridePct?: number;
  /** % increase applied to taxes + insurance only. Default 0. */
  expenseShockPct?: number;
}

/**
 * Apply ONE shock to the ONE shared base and return the resulting cell. This
 * is the single function that computes a stressed outcome anywhere in the
 * product — the 12×10 matrix grid, the page's live slider readout, and the
 * hero preview heatmap all call this against the same StressBaseScenario, so
 * they cannot silently disagree about the unshocked deal (GATE ITEM 1).
 */
export function computeStressCell(
  base: StressBaseScenario,
  shock: StressShockInput = {},
): StressMatrixCell {
  const rateOffsetBps = shock.rateOffsetBps ?? 0;
  const rentOffsetPct = shock.rentOffsetPct ?? 0;
  const expenseShockPct = Math.max(0, shock.expenseShockPct ?? 0);

  const ratePct = Math.max(0.5, round2(base.baseRatePct + rateOffsetBps / 100));

  // RATE shock: a rateSteps entry at month 1, folded into origination by the
  // kernel — i.e. "what if this loan had originated at this rate" — rather
  // than a re-derived PI formula (see amortization.ts's own docs on why a
  // schedule, not a closed-form guess, is the shared primitive).
  const schedule = buildAmortizationSchedule({
    principal: base.loanAmount,
    annualRatePct: base.baseRatePct,
    termMonths: base.termMonths,
    ioMonths: base.ioMonths,
    rateSteps: [{ month: 1, annualRatePct: ratePct, label: 'Stress Matrix rate shock' }],
  });
  const piMonthly = paymentAtMonth(schedule, 1);

  // EXPENSE shock: taxes + insurance only; HOA/flood pass through unshocked.
  const stressedTaxesInsurance = base.monthlyTaxesInsurance * (1 + expenseShockPct / 100);
  const monthlyFixed = stressedTaxesInsurance + base.monthlyHoaFlood;
  const pitiaMonthly = piMonthly + monthlyFixed;

  // RENT shock: multiplies the base qualifying (gross) rent.
  const adjustedRent = base.qualifyingRent * (1 + rentOffsetPct / 100);

  // Track 1: Lender Qualification DSCR (gross rent / PITIA, no haircuts).
  const track1DSCR = pitiaMonthly > 0 ? adjustedRent / pitiaMonthly : 0;

  // VACANCY shock: overrides only the TCO vacancy component, and only
  // affects Track 2 — the lender's Track 1 basis is gross rent by definition.
  const tcoRate = shock.vacancyOverridePct !== undefined
    ? computeTcoRate({ ...base.tcoOpts, vacancyOverridePct: shock.vacancyOverridePct })
    : base.tcoRate;

  const noiMonthly = adjustedRent * Math.max(0, 1 - tcoRate.total);
  const track2DSCR = pitiaMonthly > 0 ? noiMonthly / pitiaMonthly : 0;

  const monthlyCashFlow = noiMonthly - pitiaMonthly;
  const annualCashFlow = monthlyCashFlow * 12;

  const riskZone = classifyRiskZone(track1DSCR);
  const interpretation = buildInterpretation(
    track1DSCR, track2DSCR, monthlyCashFlow, riskZone, rateOffsetBps, rentOffsetPct,
  );

  return {
    ratePct: round2(ratePct),
    rateOffsetBps,
    rentOffsetPct,
    adjustedRent: round2(adjustedRent),
    piMonthly: round2(piMonthly),
    pitiaMonthly: round2(pitiaMonthly),
    track1DSCR: round3(track1DSCR),
    track2DSCR: round3(track2DSCR),
    monthlyCashFlow: round2(monthlyCashFlow),
    annualCashFlow: Math.round(annualCashFlow),
    riskZone,
    interpretation,
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
  const base = buildStressBaseScenario(property, loan, strategy, baseRate, qualifyingRent);
  return computeStressMatrixFromBase(base);
}

/**
 * Same as computeStressMatrix(), but takes an already-built
 * StressBaseScenario directly. This is what lets a caller (the Stress
 * Matrix page) build ONE base object and use it for BOTH the full grid AND
 * a single live-slider cell (via computeStressCell) — the same object
 * reference, not two separately-constructed-but-hopefully-equal ones.
 */
export function computeStressMatrixFromBase(base: StressBaseScenario): StressMatrixResult {
  const rateAxis: number[] = RATE_OFFSETS_BPS.map(bps => Math.max(0.5, round2(base.baseRatePct + bps / 100)));
  const rentAxis: number[] = RENT_OFFSETS_PCT;

  // Build 2D cell grid — every cell comes from computeStressCell() against
  // the ONE shared `base` object above. No cell re-derives the base.
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

  for (let i = 0; i < RATE_OFFSETS_BPS.length; i++) {
    const rateOffsetBps = RATE_OFFSETS_BPS[i];
    const row: StressMatrixCell[] = [];

    for (let j = 0; j < RENT_OFFSETS_PCT.length; j++) {
      const rentOffsetPct = RENT_OFFSETS_PCT[j];
      const cell = computeStressCell(base, { rateOffsetBps, rentOffsetPct });

      zoneCounts[cell.riskZone]++;
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
    const adjustedRent = base.qualifyingRent * (1 + rentOffsetPct / 100);
    // DSCR = 1.0 when adjustedRent = PITIA = PI + monthlyFixed
    // → PI = adjustedRent - monthlyFixed
    // → solve for rate: PI(loanAmount, rate, termMonths) = adjustedRent - monthlyFixed
    const targetPI = adjustedRent - base.monthlyFixed;
    if (targetPI <= 0) {
      // Even at 0% rate, PI > 0 (interest-only on principal / termMonths)
      // → check if 0% rate gives PI < targetPI; if so, DSCR stays > 1.0 across all rates
      const piAtZero = base.loanAmount / base.termMonths;  // simple division at 0% rate
      if (piAtZero <= targetPI) {
        // Never breaks in any realistic stress
        return { rentOffsetPct, breakEvenRatePct: null, cushionBps: 99999 };
      }
      // Otherwise breaks below 0%
      return { rentOffsetPct, breakEvenRatePct: 0, cushionBps: Math.round(base.baseRatePct * 100) };
    }
    // Binary search for the rate
    const breakEvenRate = solveBreakEvenRate(base.loanAmount, base.termMonths, targetPI);
    if (breakEvenRate === null) {
      return { rentOffsetPct, breakEvenRatePct: null, cushionBps: 99999 };
    }
    const cushionBps = Math.round((base.baseRatePct - breakEvenRate) * 100);
    return {
      rentOffsetPct,
      breakEvenRatePct: round2(breakEvenRate),
      cushionBps,
    };
  });

  // Aggregate stats
  const totalCells = cells.reduce((sum, row) => sum + row.length, 0);
  const safeZonePct = (zoneCounts.SAFE + zoneCounts.COMFORTABLE) / totalCells;
  const fragileZonePct = (zoneCounts.FRAGILE + zoneCounts.DEAL_BREAK) / totalCells;

  // Summary — reads the base case from `base`, computed exactly once in
  // buildStressBaseScenario(). No second "base case DSCR" re-derivation here.
  const summary = buildSummary(
    base.baseRatePct, base.qualifyingRent, base.baseTrack1DSCR, base.baseTrack2DSCR,
    zoneCounts, totalCells, safeZonePct, fragileZonePct,
    worstCase!, bestCase!,
  );

  return {
    baseRate: round2(base.baseRatePct),
    baseRent: round2(base.qualifyingRent),
    baseLTV: base.ltvPct,
    baseTrack1DSCR: base.baseTrack1DSCR,
    baseTrack2DSCR: base.baseTrack2DSCR,
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
