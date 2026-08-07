import { describe, it, expect } from 'vitest';
import { computeReturnGrade } from './decisionSupport';

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
