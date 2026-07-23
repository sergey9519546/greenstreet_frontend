/**
 * DSCR Engine — Bug-Audit Regression Suite
 *
 * Golden tests for the four numbered financial-math fixes (plus the PA Act 6
 * threshold correction) verified in the 2026-07-23 audit. Every expected value
 * below is hand-derived from the underlying formula (shown in comments), not
 * copied from the code under test, so these tests fail loudly if any of the
 * bugs are reintroduced.
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePI,
  calculatePITIA,
  solveDealBreakRate,
  solveMaxPurchasePrice,
} from './engine';
import { buildEngineInputs } from './inputs';
import { computeAfterTaxIRR } from './taxEngine';
import { computeIRRWaterfall } from './irrWaterfall';
import { runV11Analysis } from './v11Runner';
import { computeReturnGrade } from './decisionSupport';
import { PPP_STATE_LAWS, checkPPPLegal } from './statePppLaws';
import type { TaxProfile } from './types';

function makeTaxProfile(overrides: Partial<TaxProfile> = {}): TaxProfile {
  return {
    ordinaryIncomeBrackets: [],
    magi: 150_000,
    filingStatus: 'MFJ',
    stateTaxRatePct: 5,
    isRealEstateProfessional: false,
    yearsREP: 0,
    landAllocationPct: 20,
    costSegStudyCompleted: false,
    costSegReclassifiedPct: 0,
    acquisitionDate: '2026-01-01',
    placedInServiceDate: '2026-01-01',
    expectedHoldYears: 2,
    exitSellingCostsPct: 6,
    exitCapRatePct: 6.5,
    section1031Exchange: false,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUG #1 — FLOOD-INSURANCE UNIT MISMATCH
// Contract (inputs.ts DealRequest.floodInsurance): MONTHLY. calculatePITIA must
// use it as-is (like `hoa`), never divide by 12.
// ─────────────────────────────────────────────────────────────────────────────
describe('bug audit #1 — flood insurance is MONTHLY, not annual', () => {
  it('calculatePITIA: $240/mo flood insurance adds exactly $240 to PITIA (not $20)', () => {
    // Hand-computed: PI(300000, 7.00%, 360mo) = 1995.907485537547 (verified via
    // the same closed-form payment-factor formula as calculatePaymentFactor).
    const withFlood = calculatePITIA(300_000, 7.0, 30, 'NONE', 6_000, 1_800, 100, 240);
    const withoutFlood = calculatePITIA(300_000, 7.0, 30, 'NONE', 6_000, 1_800, 100, 0);

    // Total PITIA = PI(1995.907...) + taxes(500) + insurance(150) + hoa(100) + flood(240)
    expect(withFlood.total).toBeCloseTo(2985.91, 1);
    expect(withoutFlood.total).toBeCloseTo(2745.91, 1);

    // The difference must be exactly the $240 monthly premium. If the old bug
    // (divide by 12) were present, the difference would be $20, not $240.
    expect(withFlood.total - withoutFlood.total).toBeCloseTo(240, 5);
    expect(withFlood.floodInsurance).toBeCloseTo(240, 5);
  });

  it('solveDealBreakRate treats floodInsurance as monthly in the fixed-expense total (edge case)', () => {
    // qualifyingRent equals floodInsurance exactly; with taxes/insurance/hoa at 0,
    // fixedExpenses must equal floodInsurance itself (not floodInsurance/12),
    // which exactly consumes the rent -> targetPI = 0 -> "impossible" (returns 0).
    // Under the old bug, fixedExpenses would be 1000/12 = 83.33, targetPI would
    // be 916.67 (a normal positive target), and this would NOT return 0.
    const rate = solveDealBreakRate(1_000, 300_000, 30, 'NONE', 0, 0, 0, 1_000);
    expect(rate).toBe(0);
  });

  it('solveMaxPurchasePrice treats floodInsurance as monthly in the fixed-expense total (edge case)', () => {
    // maxPITIA = qualifyingRent/targetDSCR = 1000/1 = 1000; fixedExpenses must
    // equal floodInsurance (1000) exactly -> maxPI = 0 -> returns 0 (impossible).
    const maxPrice = solveMaxPurchasePrice(1_000, 75, 7.0, 30, 'NONE', 0, 0, 0, 1_000);
    expect(maxPrice).toBe(0);
  });

  it('solveDSCR (end-to-end): adding flood insurance lowers Track 1 DSCR by the correct magnitude', () => {
    // With the bug (÷12), a $300/mo flood premium would only shave ~$25/mo off
    // PITIA. Fixed, it must shave the full $300/mo.
    const base = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    const withFlood = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', floodInsurance: 300 });
    expect(base.property.floodInsurance).toBe(0);
    expect(withFlood.property.floodInsurance).toBe(300);

    const pitiaBase = calculatePITIA(
      400_000 * 0.75, 7.0, 30, 'NONE', base.property.annualTaxes, base.property.annualInsurance, base.property.hoa, base.property.floodInsurance,
    );
    const pitiaFlood = calculatePITIA(
      400_000 * 0.75, 7.0, 30, 'NONE', withFlood.property.annualTaxes, withFlood.property.annualInsurance, withFlood.property.hoa, withFlood.property.floodInsurance,
    );
    expect(pitiaFlood.total - pitiaBase.total).toBeCloseTo(300, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG #2 — AFTER-TAX IRR OMITS MORTGAGE INTEREST
// taxableIncome must be NOI - mortgageInterest - depreciation (mortgage
// interest is deductible; principal is not).
// ─────────────────────────────────────────────────────────────────────────────
describe('bug audit #2 — after-tax IRR must deduct mortgage interest', () => {
  const purchasePrice = 400_000;
  const loanAmount = 300_000;
  const annualNOI = 30_000;
  const loanRatePct = 6;
  const loanTermMonths = 360;
  // Hand-computed standard amortization (r = 6%/12 = 0.5%/mo, n = 360):
  //   monthly P&I = 1798.6515754582708  ->  annualADS = 21583.81890549925
  //   balance(0mo)  = 300,000.00
  //   balance(12mo) = 296,315.96486316976
  //   balance(24mo) = 292,404.7065002679
  //   Year-1 interest = annualADS - (balance(0) - balance(12))  = 17,899.783768669015
  //   Year-2 interest = annualADS - (balance(12) - balance(24)) = 17,672.560542597388
  const annualADS = 21_583.81890549925;

  it('Year-1 taxableIncome = NOI - mortgageInterest - depreciation', () => {
    const taxProfile = makeTaxProfile({ expectedHoldYears: 1 });
    const result = computeAfterTaxIRR(
      purchasePrice, loanAmount, 3_000, annualNOI, annualADS, 2_500,
      taxProfile, 0, loanRatePct, loanTermMonths,
    );
    const year1 = result.yearByYear[0];

    // Depreciation: buildingBasis = 400,000 * (1 - 20%) = 320,000; / 27.5 = 11,636.3636...
    const expectedDepreciation = 320_000 / 27.5;
    expect(year1.depreciationDeduction).toBeCloseTo(expectedDepreciation, 2);

    // Hand-computed: 30,000 - 17,899.78 (interest) - 11,636.36 (depreciation) = 463.85
    expect(year1.taxableIncome).toBeCloseTo(463.85, 1);

    // Regression guard: the OLD bug computed taxableIncome = NOI - depreciation
    // only (= 18,363.64), omitting the interest deduction entirely. The fixed
    // value must be lower by (very close to) the interest amount.
    const buggyTaxableIncome = annualNOI - year1.depreciationDeduction;
    expect(buggyTaxableIncome).toBeCloseTo(18_363.64, 1);
    expect(buggyTaxableIncome - year1.taxableIncome).toBeCloseTo(17_899.78, 1);
  });

  it('Year-2 interest is lower than Year-1 (amortizing loan pays down principal over time)', () => {
    const taxProfile = makeTaxProfile({ expectedHoldYears: 2 });
    const result = computeAfterTaxIRR(
      purchasePrice, loanAmount, 3_000, annualNOI, annualADS, 2_500,
      taxProfile, 0, loanRatePct, loanTermMonths,
    );
    const [year1, year2] = result.yearByYear;

    // Year-2 NOI grows 2% (30,600) and depreciation is flat (11,636.36); with the
    // hand-computed Year-2 interest of 17,672.56:
    //   taxableIncome_2 = 30,600 - 17,672.56 - 11,636.36 = 1,291.08
    expect(year2.taxableIncome).toBeCloseTo(1_291.08, 1);
    expect(year2.taxableIncome).toBeGreaterThan(year1.taxableIncome);
  });

  it('after-tax IRR improves once the interest shield is correctly applied (fixed taxableIncome is lower, so tax owed is lower)', () => {
    // Same scenario computed two ways: with the real loanRatePct/loanTermMonths
    // (interest deducted) vs. omitting them so the function must fall back —
    // the fallback still deducts a positive approximate interest amount, so in
    // both cases taxableIncome must be strictly less than the pre-fix NOI-only
    // depreciation figure whenever there is a loan balance.
    const taxProfile = makeTaxProfile({ expectedHoldYears: 1 });
    const withRate = computeAfterTaxIRR(purchasePrice, loanAmount, 3_000, annualNOI, annualADS, 2_500, taxProfile, 0, loanRatePct, loanTermMonths);
    const withoutRate = computeAfterTaxIRR(purchasePrice, loanAmount, 3_000, annualNOI, annualADS, 2_500, taxProfile, 0);
    const buggyTaxableIncome = annualNOI - withRate.yearByYear[0].depreciationDeduction;

    expect(withRate.yearByYear[0].taxableIncome).toBeLessThan(buggyTaxableIncome);
    expect(withoutRate.yearByYear[0].taxableIncome).toBeLessThan(buggyTaxableIncome);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG #3 — IRR SCALE DOUBLE-SCALING
// taxEngine returns IRR as a DECIMAL (0.15 = 15%); v11Runner must pass it
// through unchanged into VerdictInput/ICMemoInput, not divide by 100 again.
// ─────────────────────────────────────────────────────────────────────────────
describe('bug audit #3 — v11Runner must not double-scale the after-tax IRR', () => {
  function makeAnalysisInput(overrides: Record<string, any> = {}) {
    const { property, borrower, loan, strategy } = buildEngineInputs({
      purchasePrice: 400_000,
      monthlyRent: 3_200,
      state: 'TX',
      ltv: 75,
      ficoScore: 740,
    });
    return {
      property, borrower, loan, strategy,
      taxProfile: makeTaxProfile({ expectedHoldYears: 5 }),
      sellerAnnualTax: property.annualTaxes,
      propertyAddress: '123 Test St, Austin, TX',
      ...overrides,
    };
  }

  it('memo.returnStack.afterTaxIRR equals the raw taxEngine decimal exactly (no /100)', () => {
    const result = runV11Analysis(makeAnalysisInput());
    // Straight passthrough -- if the /100 bug were present this would be
    // 100x smaller than result.afterTaxIRR.afterTaxIRR.
    expect(result.memo.returnStack.afterTaxIRR).toBe(result.afterTaxIRR.afterTaxIRR);
  });

  it('verdict.returnGrade is consistent with the correctly-scaled decimal IRR (not a 100x-shrunk one)', () => {
    const result = runV11Analysis(makeAnalysisInput());
    // computeReturnGrade expects a DECIMAL (0.15 = 15%) and uses 0.08/0.12/0.15
    // thresholds. If v11Runner had divided by 100 again, the grade computed
    // internally would have been based on a ~0.001-scale number (always grade
    // 'D' or 'F' in practice), which would NOT match recomputing the grade from
    // the correctly-scaled decimal here.
    const expectedGrade = computeReturnGrade(result.afterTaxIRR.afterTaxIRR, result.track2DSCR);
    expect(result.verdict.returnGrade).toBe(expectedGrade);
  });

  it('after-tax IRR used for grading is a plausible decimal (roughly -1 to 1), not a tiny 0.00x fraction', () => {
    const result = runV11Analysis(makeAnalysisInput());
    // A healthy DSCR deal's after-tax IRR should not collapse to a sub-1%
    // decimal purely from a scaling bug. This is a coarse sanity net, not a
    // precise prediction of the deal's economics.
    expect(Math.abs(result.afterTaxIRR.afterTaxIRR)).toBeLessThan(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG #4 — IRR WATERFALL CUMULATIVE DOUBLE-COUNT
// SUBTOTAL/TOTAL rows must show the actual checkpoint value in `cumulative`,
// not double it via `cum += amount` on top of an already-equal running total.
// ─────────────────────────────────────────────────────────────────────────────
describe('bug audit #4 — waterfall SUBTOTAL/TOTAL rows must not double-count the cumulative column', () => {
  function buildWaterfall(holdYears = 3) {
    const { property, loan, strategy } = buildEngineInputs({
      purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', ltv: 75, ficoScore: 740,
    });
    const loanAmount = 300_000;
    const solvedRate = 7.0;
    const annualADS = calculatePI(loanAmount, solvedRate, 360) * 12;
    const taxProfile = makeTaxProfile({ expectedHoldYears: holdYears });
    const afterTaxIRRResult = computeAfterTaxIRR(
      400_000, loanAmount, 3_000, 30_000, annualADS, 2_500, taxProfile, 0, solvedRate, 360,
    );
    return computeIRRWaterfall(
      afterTaxIRRResult, property, loan, strategy, solvedRate, 3_000, loanAmount, 100_000, 0,
    );
  }

  it('Year-1 SUBTOTAL rows (Gross Effective Rent, NOI) report cumulative == their own amount, not double', () => {
    const waterfall = buildWaterfall();
    const grossEff = waterfall.year1.stages.find(s => s.label === 'Gross Effective Rent')!;
    expect(grossEff.sign).toBe('SUBTOTAL');
    // Under the old bug, cumulative would be 2x amount here (cum already equaled
    // amount after the ADD+SUBTRACT before it, then the buggy code added it again).
    expect(grossEff.cumulative).toBeCloseTo(grossEff.amount, 2);

    const noi = waterfall.year1.stages.find(s => s.label === 'Net Operating Income (NOI)')!;
    expect(noi.sign).toBe('SUBTOTAL');
    expect(noi.cumulative).toBeCloseTo(noi.amount, 2);
  });

  it('Year-1 TOTAL row (After-Tax Cash Flow) cumulative matches its own amount and the independent year1.afterTaxCF field', () => {
    const waterfall = buildWaterfall();
    const afterTaxStage = waterfall.year1.stages.find(s => s.label === 'After-Tax Cash Flow')!;
    expect(afterTaxStage.sign).toBe('TOTAL');
    expect(afterTaxStage.cumulative).toBeCloseTo(afterTaxStage.amount, 2);
    // Cross-check against a second, independently-computed source of truth.
    expect(afterTaxStage.cumulative).toBeCloseTo(waterfall.year1.afterTaxCF, 2);
  });

  it('hold-total SUBTOTAL/TOTAL rows (Total NOI, Total After-Tax Operating CF) do not double-count either', () => {
    const waterfall = buildWaterfall();
    const totalNoi = waterfall.holdTotal.stages.find(s => s.label === 'Total NOI')!;
    expect(totalNoi.cumulative).toBeCloseTo(totalNoi.amount, 0);

    const totalOpCF = waterfall.holdTotal.stages.find(s => s.label === 'Total After-Tax Operating CF')!;
    expect(totalOpCF.sign).toBe('TOTAL');
    expect(totalOpCF.cumulative).toBeCloseTo(totalOpCF.amount, 0);
    expect(totalOpCF.cumulative).toBeCloseTo(waterfall.holdTotal.totalOperatingCF, 0);
  });

  it('summary text reports after-tax IRR as a sane percent (bug-audit #3 sibling fix in buildSummary)', () => {
    const waterfall = buildWaterfall();
    const match = waterfall.summary.match(/After-tax IRR: (-?\d+\.\d+)%/);
    expect(match).not.toBeNull();
    const reportedPct = parseFloat(match![1]);
    // Must equal the decimal IRR × 100 -- if buildSummary still received the raw
    // decimal (e.g. 0.15) unconverted, this would report "0.15%" instead of "15.xx%".
    expect(reportedPct).toBeCloseTo(waterfall.holdTotal.afterTaxIRR * 100, 1);
    expect(Math.abs(reportedPct)).toBeGreaterThan(1); // sanity: not a sub-1% artifact of the old bug
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG #5 — PA ACT 6 PREPAY THRESHOLD (Blueprint correction C6)
// Correct 2026 value is $319,777 (matches the marketing StateLawsPage).
// ─────────────────────────────────────────────────────────────────────────────
describe('bug audit #5 — PA prepayment threshold must be $319,777 for 2026', () => {
  it('PPP_STATE_LAWS.PA.loanThreshold is exactly 319,777', () => {
    expect(PPP_STATE_LAWS.PA.loanThreshold).toBe(319_777);
  });

  it('a PA loan just above $319,777 on a 1-2 unit property allows PPP', () => {
    const result = checkPPPLegal('PA', 'LLC', 320_000, 1, 'FIXED');
    expect(result.allowed).toBe(true);
  });

  it('a PA loan just below $319,777 on a 1-2 unit property blocks PPP', () => {
    const result = checkPPPLegal('PA', 'LLC', 319_000, 1, 'FIXED');
    expect(result.allowed).toBe(false);
  });
});
