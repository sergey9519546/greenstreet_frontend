import { describe, it, expect } from 'vitest';
import {
  computeReturnGrade,
  computeVerdict,
  computeWeightedCompositeScore,
  type VerdictInput,
} from './decisionSupport';

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

  it('rejects non-finite return evidence', () => {
    expect(computeReturnGrade(Number.NaN, 1.2)).toBe('F');
    expect(computeReturnGrade(0.16, Number.POSITIVE_INFINITY)).toBe('F');
  });
});

const eligibleLender = { eligible: true } as VerdictInput['lenderRanking'][number];

const baseVerdictInput: VerdictInput = {
  track1DSCR: 1.3,
  track2DSCR: 1.15,
  lenderMinDSCR: 1.0,
  afterTaxIRR: 0.16,
  preTaxIRR: 0.18,
  year1CoC: 0.08,
  dealBreakRate: 8.5,
  solvedRate: 7,
  rateHeadroomBps: 150,
  appraisalBreakpointPercent: 0,
  insuranceGate: null,
  brrrrGate: null,
  armReset: null,
  strLegalityStatus: 'CLEAR',
  pppAllowed: true,
  ficoScore: 740,
  ltv: 75,
  ltvCap: 80,
  loanAmount: 300000,
  lenderMinLoan: 75000,
  bestLenderConfidence: 85,
  lenderRanking: [eligibleLender],
  isDecliningMarket: false,
};

describe('computeVerdict safety gates', () => {
  it('allows explicit A and B grades to satisfy the minimum grade gate', () => {
    expect(computeVerdict(baseVerdictInput).verdict).toBe('PROCEED');
    expect(computeVerdict({ ...baseVerdictInput, afterTaxIRR: 0.13, track2DSCR: 1.05 }).verdict).toBe('PROCEED');
  });

  it('does not let C or F grades pass the return gate', () => {
    expect(computeVerdict({ ...baseVerdictInput, afterTaxIRR: 0.10 }).verdict).toBe('RESTRUCTURE');
    expect(computeVerdict({ ...baseVerdictInput, afterTaxIRR: -0.01 }).verdict).toBe('PASS');
  });

  it('returns review when lender ranking evidence is missing', () => {
    const result = computeVerdict({ ...baseVerdictInput, lenderRanking: [] });
    expect(result.verdict).toBe('RESTRUCTURE');
    expect(result.bindingConstraint).toContain('review required');
  });

  it('returns review rather than a favorable or final verdict for a zero deal', () => {
    const result = computeVerdict({
      ...baseVerdictInput,
      track1DSCR: 0,
      track2DSCR: 0,
      loanAmount: 0,
    });
    expect(result.verdict).toBe('RESTRUCTURE');
    expect(result.bindingConstraint).toContain('Invalid or incomplete inputs');
  });

  it('forces a hard blocker to the non-favorable PASS-on-the-deal verdict', () => {
    const result = computeVerdict({ ...baseVerdictInput, ficoScore: 619 });
    expect(result.verdict).toBe('PASS');
    expect(result.killCriteriaTriggered.some(item => item.severity === 'BLOCKER')).toBe(true);
  });

  it('keeps unacknowledged Track 2 negative carry out of PROCEED', () => {
    const result = computeVerdict({ ...baseVerdictInput, track2DSCR: 0.95 });
    expect(result.verdict).toBe('RESTRUCTURE');
    expect(result.track2AcknowledgmentRequired).toBe(true);
  });
});

describe('computeWeightedCompositeScore bounds', () => {
  it('normalizes weights and clamps every result to 0-100', () => {
    expect(computeWeightedCompositeScore([
      { score: 150, weight: 0.7 },
      { score: -20, weight: 0.3 },
    ])).toBe(70);
    expect(computeWeightedCompositeScore([{ score: 500, weight: 1 }])).toBe(100);
    expect(computeWeightedCompositeScore([{ score: -500, weight: 1 }])).toBe(0);
    expect(computeWeightedCompositeScore([])).toBe(0);
  });
});
