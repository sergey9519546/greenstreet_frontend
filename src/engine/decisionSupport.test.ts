import { describe, it, expect } from 'vitest';
import { computeReturnGrade, computeVerdict } from './decisionSupport';

/**
 * computeVerdict had NO test, which is how an inverted gate shipped: the PROCEED
 * condition read `returnGrade >= 'B'`, a string comparison. 'A' >= 'B' is false
 * and 'D' >= 'B' is true, so the best grade was rejected and weak grades passed.
 */
describe('computeVerdict — return-grade gate ordering', () => {
  const clean = {
    track1DSCR: 1.45,
    track2DSCR: 1.1,
    lenderMinDSCR: 1.0,
    rateHeadroomBps: 120,
    lenderRanking: [{ eligible: true }],
    monteCarloProbBelow1: 0.02,
    monteCarlo5thPctDSCR: 1.05,
  } as unknown as Parameters<typeof computeVerdict>[0];

  const verdictFor = (afterTaxIRR: number) =>
    computeVerdict({ ...clean, afterTaxIRR } as typeof clean);

  it('lets a grade-A deal PROCEED', () => {
    const r = verdictFor(0.25);
    expect(r.returnGrade).toBe('A');
    expect(r.verdict).toBe('PROCEED');
  });

  it('lets a grade-B deal PROCEED', () => {
    const r = verdictFor(0.13);
    expect(r.returnGrade).toBe('B');
    expect(r.verdict).toBe('PROCEED');
  });

  it('does NOT let grade C or D PROCEED on return grade alone', () => {
    for (const irr of [0.09, 0.02]) {
      const r = verdictFor(irr);
      expect(['C', 'D']).toContain(r.returnGrade);
      expect(r.verdict).not.toBe('PROCEED');
    }
  });

  it('never ranks a worse grade above a better one', () => {
    // Guards the class of bug directly: A must never be treated as worse than D.
    const a = verdictFor(0.25).verdict;
    const d = verdictFor(0.02).verdict;
    expect(a === 'PROCEED' && d === 'PROCEED').toBe(false);
    expect(a).toBe('PROCEED');
  });
});

// afterTaxIRR passed as decimal (0.15 = 15%)
describe('computeReturnGrade (Part J)', () => {
  it('A: IRR ≥15% AND Track 2 ≥1.10', () => {
    expect(computeReturnGrade(0.16, 1.2)).toBe('A');
  });

  it('B: IRR 12-15% AND Track 2 ≥1.00', () => {
    expect(computeReturnGrade(0.13, 1.05)).toBe('B');
  });

  it('C: IRR 8-12% regardless of Track 2 cushion', () => {
    expect(computeReturnGrade(0.10, 0.9)).toBe('C');
  });

  it('D: positive but sub-8% IRR', () => {
    expect(computeReturnGrade(0.05, 1.0)).toBe('D');
  });

  it('F: negative IRR', () => {
    expect(computeReturnGrade(-0.05, 1.0)).toBe('F');
  });

  it('F: negative Track 2 forces fail even with strong IRR', () => {
    expect(computeReturnGrade(0.20, -0.1)).toBe('F');
  });

  it('A requires the cushion — strong IRR but thin Track 2 drops to B', () => {
    expect(computeReturnGrade(0.16, 1.05)).toBe('B');
  });
});
