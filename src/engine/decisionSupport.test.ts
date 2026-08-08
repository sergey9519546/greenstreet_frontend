import { describe, it, expect } from 'vitest';
import { computeReturnGrade, computeVerdict, gradeAtLeast, type VerdictInput } from './decisionSupport';

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

// ---------------------------------------------------------------------------
// Regression: the PROCEED gate is documented as "Return Grade ≥ B" (A or B).
// It was implemented as the lexicographic string comparison `returnGrade >= 'B'`,
// which is exactly inverted for the top grade: 'A' >= 'B' is FALSE while
// 'C'/'D'/'F' >= 'B' are TRUE. Best deals could not PROCEED; weak ones could.
// These tests pin the ordinal semantics on computeVerdict itself.
// ---------------------------------------------------------------------------

/** Minimal VerdictInput with every gate clean and zero kill criteria. */
function cleanVerdictInput(overrides: Partial<VerdictInput> = {}): VerdictInput {
  return {
    track1DSCR: 1.30,        // lenderMinDSCR (1.00) + 0.05 cushion, comfortably
    track2DSCR: 1.20,
    lenderMinDSCR: 1.00,
    afterTaxIRR: 0.16,       // decimal, not percent
    preTaxIRR: 0.18,
    year1CoC: 0.09,
    dealBreakRate: 8.5,
    solvedRate: 7.0,         // below deal-break rate
    rateHeadroomBps: 150,    // ≥ 50
    appraisalBreakpointPercent: 0,
    insuranceGate: null,
    brrrrGate: null,
    armReset: null,
    strLegalityStatus: 'CLEAR',
    pppAllowed: true,
    ficoScore: 760,
    ltv: 75,
    ltvCap: 80,
    loanAmount: 300000,
    lenderMinLoan: 150000,
    bestLenderConfidence: 85,
    lenderRanking: [],       // empty ⇒ treated as "no lender constraint"
    isDecliningMarket: false,
    ...overrides,
  };
}

describe('computeVerdict — Return Grade gate is ordinal, not lexicographic', () => {
  it('Grade A (strong IRR + T2 cushion) on otherwise clean gates ⇒ PROCEED', () => {
    // Pre-fix this returned RESTRUCTURE because 'A' >= 'B' is false.
    const input = cleanVerdictInput({ afterTaxIRR: 0.16, track2DSCR: 1.20 });
    const result = computeVerdict(input);

    expect(result.returnGrade).toBe('A');
    expect(result.verdict).toBe('PROCEED');
    expect(result.bindingConstraint).toBe('None — all gates clear.');
  });

  it('Grade B (12-15% IRR, T2 ≥ 1.00) on clean gates ⇒ PROCEED', () => {
    const result = computeVerdict(cleanVerdictInput({ afterTaxIRR: 0.13, track2DSCR: 1.05 }));

    expect(result.returnGrade).toBe('B');
    expect(result.verdict).toBe('PROCEED');
  });

  it('Grade C (~10% IRR) on clean gates ⇒ NOT PROCEED (RESTRUCTURE)', () => {
    // Pre-fix this returned PROCEED because 'C' >= 'B' is true.
    const result = computeVerdict(cleanVerdictInput({ afterTaxIRR: 0.10, track2DSCR: 1.05 }));

    expect(result.returnGrade).toBe('C');
    expect(result.verdict).not.toBe('PROCEED');
    expect(result.verdict).toBe('RESTRUCTURE');
  });

  it('Grade D (~5% IRR) on clean gates ⇒ NOT PROCEED (RESTRUCTURE)', () => {
    // Pre-fix this returned PROCEED because 'D' >= 'B' is true.
    const result = computeVerdict(cleanVerdictInput({ afterTaxIRR: 0.05, track2DSCR: 1.05 }));

    expect(result.returnGrade).toBe('D');
    expect(result.verdict).not.toBe('PROCEED');
    expect(result.verdict).toBe('RESTRUCTURE');
  });

  it('a BLOCKER still outranks a Grade A return ⇒ PASS', () => {
    const result = computeVerdict(cleanVerdictInput({ ficoScore: 600 }));

    expect(result.returnGrade).toBe('A');
    expect(result.verdict).toBe('PASS');
    expect(result.bindingConstraint).toBe('FICO Below All Lender Floors');
  });

  it('Grade F remains an unconditional PASS', () => {
    const result = computeVerdict(cleanVerdictInput({ afterTaxIRR: -0.02 }));

    expect(result.returnGrade).toBe('F');
    expect(result.verdict).toBe('PASS');
  });
});

describe('gradeAtLeast', () => {
  it('is true only at or above the floor', () => {
    expect(gradeAtLeast('A', 'B')).toBe(true);
    expect(gradeAtLeast('B', 'B')).toBe(true);
    expect(gradeAtLeast('C', 'B')).toBe(false);
    expect(gradeAtLeast('D', 'B')).toBe(false);
    expect(gradeAtLeast('F', 'B')).toBe(false);
  });

  it('ranks the full scale A > B > C > D > F', () => {
    const descending = ['A', 'B', 'C', 'D', 'F'] as const;
    for (let i = 0; i < descending.length; i++) {
      for (let j = 0; j < descending.length; j++) {
        // earlier index = better grade ⇒ atLeast holds when i <= j
        expect(gradeAtLeast(descending[i], descending[j])).toBe(i <= j);
      }
    }
  });

  it('every grade meets the lowest floor and only A meets an A floor', () => {
    expect(gradeAtLeast('F', 'F')).toBe(true);
    expect(gradeAtLeast('A', 'F')).toBe(true);
    expect(gradeAtLeast('A', 'A')).toBe(true);
    expect(gradeAtLeast('B', 'A')).toBe(false);
  });
});
