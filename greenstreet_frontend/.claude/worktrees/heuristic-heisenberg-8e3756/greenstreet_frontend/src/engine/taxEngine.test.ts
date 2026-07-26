import { describe, it, expect } from 'vitest';
import {
  determineBonusDepCategory,
  getNIITThreshold,
  isNIITApplicable,
  computeXIRR,
  assessCostSegViability,
} from './taxEngine';

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
