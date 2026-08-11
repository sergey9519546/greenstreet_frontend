import { describe, it, expect } from 'vitest';
import {
  determineBonusDepCategory,
  getNIITThreshold,
  isNIITApplicable,
  computeXIRR,
  assessCostSegViability,
  computeDepreciationSchedule,
  computeRecaptureOnSale,
  computeAfterTaxIRR,
} from './taxEngine';
import type { TaxProfile } from './types';

const taxProfile = (overrides: Partial<TaxProfile> = {}): TaxProfile => ({
  ordinaryIncomeBrackets: [],
  magi: 150_000,
  filingStatus: 'MFJ',
  stateTaxRatePct: 0,
  isRealEstateProfessional: false,
  yearsREP: 0,
  landAllocationPct: 20,
  costSegStudyCompleted: false,
  costSegReclassifiedPct: 0,
  acquisitionDate: '2024-01-01',
  placedInServiceDate: '2024-01-01',
  expectedHoldYears: 5,
  exitSellingCostsPct: 6,
  exitCapRatePct: 6.5,
  section1031Exchange: false,
  ...overrides,
});

// ── OBBBA 100% bonus-dep LOCK (protected per BACKLOG) ──
describe('determineBonusDepCategory (OBBBA)', () => {
  it('gives 100% bonus for property acquired AFTER 2025-01-19', () => {
    const r = determineBonusDepCategory('2025-06-01', '2025-06-01');
    expect(r.category).toBe('POST_2025_01_19');
    expect(r.bonusPct).toBe(1.0);
  });

  it('gives 40% for Jan 1-19 2025 acquisition placed in service 2025', () => {
    const r = determineBonusDepCategory('2025-01-10', '2025-06-01');
    expect(r.category).toBe('PRE_2025_01_19_2025');
    expect(r.bonusPct).toBe(0.4);
  });

  it('gives 20% for Jan 1-19 2025 acquisition placed in service 2026', () => {
    const r = determineBonusDepCategory('2025-01-10', '2026-06-01');
    expect(r.category).toBe('PRE_2025_01_19_2026');
    expect(r.bonusPct).toBe(0.2);
  });

  it('gives 60% for pre-2025 acquisition placed in service 2024', () => {
    const r = determineBonusDepCategory('2024-06-01', '2024-12-01');
    expect(r.category).toBe('PRE_2025_2024');
    expect(r.bonusPct).toBe(0.6);
  });

  it('gives 40% for pre-2025 acquisition placed in service 2025', () => {
    const r = determineBonusDepCategory('2024-06-01', '2025-06-01');
    expect(r.category).toBe('PRE_2025_2025');
    expect(r.bonusPct).toBe(0.4);
  });
});

describe('NIIT thresholds (IRC §1411)', () => {
  it('returns correct thresholds by filing status', () => {
    expect(getNIITThreshold('SINGLE')).toBe(200_000);
    expect(getNIITThreshold('HOH')).toBe(200_000);
    expect(getNIITThreshold('MFJ')).toBe(250_000);
    expect(getNIITThreshold('MFS')).toBe(125_000);
  });

  it('applies only above threshold', () => {
    expect(isNIITApplicable(300_000, 'MFJ')).toBe(true);
    expect(isNIITApplicable(250_000, 'MFJ')).toBe(false);
    expect(isNIITApplicable(200_001, 'SINGLE')).toBe(true);
  });
});

describe('computeXIRR', () => {
  it('solves a simple 10% one-year return', () => {
    const irr = computeXIRR([
      { time: 0, amount: -1000 },
      { time: 1, amount: 1100 },
    ]);
    expect(irr).toBeCloseTo(0.10, 3);
  });

  it('returns 0 for degenerate single-flow input', () => {
    expect(computeXIRR([{ time: 0, amount: -1000 }])).toBe(0);
  });
});

describe('assessCostSegViability', () => {
  it('flags ≥$450K properties as economic with 30% reclass midpoint', () => {
    const r = assessCostSegViability(600_000, 20);
    expect(r.economic).toBe(true);
    expect(r.reclassifiedPct).toBe(30);
    // building 480K × 30% = 144K qualifying × 100% bonus × 32% rate = 46,080
    expect(r.estimatedYear1Savings).toBe(46_080);
  });

  it('flags sub-$450K properties as not economic', () => {
    const r = assessCostSegViability(400_000, 20);
    expect(r.economic).toBe(false);
  });
});

describe('depreciation schedule safeguards', () => {
  it('caps an excessive hold at the tax model horizon', () => {
    const schedule = computeDepreciationSchedule(100_000, 20, 10_000, taxProfile());

    expect(schedule).toHaveLength(50);
  });

  it('depreciates unbonused short-life basis after the first year', () => {
    const schedule = computeDepreciationSchedule(100_000, 0, 7, taxProfile({
      costSegStudyCompleted: true,
      costSegReclassifiedPct: 20,
      acquisitionDate: '2024-06-01',
      placedInServiceDate: '2025-06-01',
    }));

    expect(schedule[1].costSegDepreciation).toBeGreaterThan(0);
    expect(schedule.reduce((sum, row) => sum + row.costSegDepreciation, 0)).toBeCloseTo(20_000, 6);
  });

  it('never depreciates more than the building basis', () => {
    const schedule = computeDepreciationSchedule(100_000, 20, 50, taxProfile());

    expect(schedule.at(-1)?.cumulativeDepreciation).toBeLessThanOrEqual(80_000);
  });
});

describe('sale tax safeguards', () => {
  it('does not create negative gain, recapture, or state tax on a loss sale', () => {
    const result = computeRecaptureOnSale(
      100_000,
      20,
      20_000,
      70_000,
      0,
      taxProfile({ stateTaxRatePct: 8 }),
    );

    expect(result.totalGainOnSale).toBe(0);
    expect(result.unrecapturedSection1250Gain).toBe(0);
    expect(result.section1245Recapture).toBe(0);
    expect(result.stateTax).toBe(0);
  });

  it('applies NIIT to the lesser of modeled investment income or MAGI excess', () => {
    const result = computeRecaptureOnSale(
      100_000,
      20,
      0,
      500_000,
      0,
      taxProfile({ filingStatus: 'SINGLE', magi: 200_100 }),
    );

    expect(result.niitTax).toBeCloseTo(3.8, 6);
  });
});

describe('after-tax IRR input safeguards', () => {
  it('rejects a hold outside the bounded tax model horizon', () => {
    expect(() => computeAfterTaxIRR(
      100_000, 0, 0, 8_000, 0, 0,
      taxProfile({ expectedHoldYears: 0 }), 0,
    )).toThrow(RangeError);
  });

  it('rejects a non-finite hold before allocating cash flows', () => {
    expect(() => computeAfterTaxIRR(
      100_000, 0, 0, 8_000, 0, 0,
      taxProfile({ expectedHoldYears: Number.POSITIVE_INFINITY }), 0,
    )).toThrow(RangeError);
  });

  it('rejects a zero exit cap rather than generating an infinite exit value', () => {
    expect(() => computeAfterTaxIRR(
      100_000, 0, 0, 8_000, 0, 0,
      taxProfile({ exitCapRatePct: 0 }), 0,
    )).toThrow(RangeError);
  });

  it('rejects non-finite model inputs before calculating cash flows', () => {
    expect(() => computeAfterTaxIRR(
      Number.NaN, 0, 0, 8_000, 0, 0,
      taxProfile(), 0,
    )).toThrow(RangeError);
  });

  it('rejects an incomplete or non-finite loan schedule', () => {
    expect(() => computeAfterTaxIRR(
      100_000, 50_000, 0, 8_000, 0, 0,
      taxProfile(), 0, Number.NaN, 360,
    )).toThrow(RangeError);
  });

  it('requires positive initial cash invested', () => {
    expect(() => computeAfterTaxIRR(
      100_000, 100_000, 0, 8_000, 0, 0,
      taxProfile(), 0,
    )).toThrow(RangeError);
  });
});

describe('after-tax IRR cash-flow mechanics', () => {
  it('includes closing costs in the initial cash invested', () => {
    const profile = taxProfile({ expectedHoldYears: 5 });
    const withoutCosts = computeAfterTaxIRR(100_000, 0, 0, 8_000, 0, 0, profile, 0, 0, 360, 0);
    const withCosts = computeAfterTaxIRR(100_000, 0, 0, 8_000, 0, 0, profile, 0, 0, 360, 10_000);

    expect(withCosts.afterTaxIRR).toBeLessThan(withoutCosts.afterTaxIRR);
  });

  it('subtracts the CapEx reserve from cash flow without deducting it from taxable income', () => {
    const result = computeAfterTaxIRR(
      100_000, 0, 0, 10_000, 0, 0,
      taxProfile({ expectedHoldYears: 1 }),
      0, 0, 360, 0, 0, 500,
    );

    expect(result.yearByYear[0].preTaxNCF).toBe(9_500);
    expect(result.yearByYear[0].taxableIncome).toBeCloseTo(10_000 - 80_000 / 27.5, 2);
  });

  it('uses the supplied rent growth rate for annual NOI', () => {
    const result = computeAfterTaxIRR(
      100_000, 0, 0, 10_000, 0, 0,
      taxProfile({ expectedHoldYears: 2 }),
      0, 0, 360, 0, 5,
    );

    expect(result.yearByYear[1].preTaxNCF).toBe(10_500);
  });

  it('honors interest-only periods in debt service and mortgage interest', () => {
    const result = computeAfterTaxIRR(
      200_000, 100_000, 0, 10_000, 8_000, 0,
      taxProfile({ expectedHoldYears: 1 }),
      0, 6, 360, 0, 0, 0, 60,
    );

    expect(result.yearByYear[0].preTaxNCF).toBe(4_000);
    expect(result.yearByYear[0].taxableIncome).toBeCloseTo(10_000 - 6_000 - 160_000 / 27.5, 2);
  });

  it('stops debt service after the supplied loan term matures', () => {
    const result = computeAfterTaxIRR(
      100_000, 12_000, 0, 12_000, 12_000, 0,
      taxProfile({ expectedHoldYears: 2 }),
      0, 0, 12, 0, 0,
    );

    expect(result.yearByYear[1].preTaxNCF).toBe(12_000);
  });
});
