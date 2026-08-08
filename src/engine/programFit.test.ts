import { describe, it, expect } from 'vitest';
import { evaluateProgramFit } from './programFit';
import { DSCR_PROGRAMS, DSCR_PROGRAMS_AS_OF, lookupMaxLTV } from '../data/dscrPrograms';

// A borrower who comfortably clears the matrix, used as the "everything fine"
// baseline so each test can break exactly one thing.
function cleanFit(overrides: Partial<Parameters<typeof evaluateProgramFit>[0]> = {}) {
  return evaluateProgramFit({
    fico: 760,
    loanAmount: 300_000,
    dscr: 1.25,
    ltvNeeded: 70,
    solvedRate: 7.0,
    ...overrides,
  });
}

describe('evaluateProgramFit — every program is evaluated, never filtered away', () => {
  it('returns one evaluation per program in the matrix', () => {
    const fit = cleanFit();
    expect(fit.evaluated).toHaveLength(DSCR_PROGRAMS.length);
    expect(fit.lenderRanking).toHaveLength(DSCR_PROGRAMS.length);
  });

  it('keeps ineligible programs in the ranking with their reasons', () => {
    // A 500 FICO is below every program's minimum, so nothing is eligible —
    // but the ranking must still list every program with a stated reason,
    // because "none qualified" and "never evaluated" are different answers and
    // an empty array cannot tell them apart.
    const fit = cleanFit({ fico: 500 });

    expect(fit.evaluated.every((e) => !e.eligible)).toBe(true);
    expect(fit.lenderRanking).toHaveLength(DSCR_PROGRAMS.length);
    expect(fit.lenderRanking.every((l) => l.ineligibleReasons.length > 0)).toBe(true);
    expect(fit.bestFit).toBeNull();
  });

  it('a program is eligible exactly when it has no reasons', () => {
    const fit = cleanFit();
    for (const e of fit.evaluated) {
      expect(e.eligible).toBe(e.reasons.length === 0);
    }
  });
});

describe('evaluateProgramFit — unknown is NaN, never a plausible default', () => {
  it('reports the best-fit program real floor, cap and minimum', () => {
    const fit = cleanFit();
    expect(fit.bestFit).not.toBeNull();
    expect(fit.lenderMinDSCR).toBe(fit.bestFit!.program.dscrFloor);
    expect(fit.ltvCap).toBe(fit.bestFit!.program.maxLTV);
    expect(Number.isFinite(fit.lenderMinDSCR)).toBe(true);
  });

  it('returns NaN — not 1.0, 80 or 75000 — when no program fits', () => {
    // These are precisely the three constants v11Runner.ts used to substitute:
    // `lenderMinDSCR: 1.0`, `ltvCap: 80`, `lenderMinLoan: 75000`. Each is
    // finite, so each cleared computeVerdict's fail-closed gates while
    // representing nothing that was ever looked up.
    const fit = cleanFit({ fico: 500 });

    expect(fit.bestFit).toBeNull();
    expect(Number.isNaN(fit.lenderMinDSCR)).toBe(true);
    expect(Number.isNaN(fit.ltvCap)).toBe(true);
    expect(Number.isNaN(fit.lenderMinLoan)).toBe(true);
  });

  it('scores no confidence, because no confidence model scores these programs', () => {
    // 0 here means "not scored". Callers must pass bestLenderConfidence: null
    // to the verdict rather than reading 0 as a low score or substituting 75.
    const fit = cleanFit();
    expect(fit.lenderRanking.every((l) => l.confidenceScore === 0)).toBe(true);
    expect(fit.lenderRanking.every((l) => l.counterpartyRisk.lastReportedStatus === 'NOT_ASSESSED')).toBe(true);
  });

  it('labels the rate as an engine solve, not a lender quote', () => {
    const fit = cleanFit({ solvedRate: 7.375 });
    expect(fit.lenderRanking.every((l) => l.estimatedRate === 7.375)).toBe(true);
    expect(fit.lenderRanking[0].provenanceWarnings[0]).toContain('not a lender quote');
    expect(fit.sourceSnapshot).toBe(DSCR_PROGRAMS_AS_OF);
  });
});

describe('evaluateProgramFit — best fit', () => {
  it('picks the most leverage available', () => {
    const fit = cleanFit();
    const eligible = fit.evaluated.filter((e) => e.eligible);
    const maxOffer = Math.max(...eligible.map((e) => e.offerLTV ?? 0));
    expect(fit.bestFit!.offerLTV).toBe(maxOffer);
  });

  it('breaks a leverage tie toward the HIGHER DSCR floor', () => {
    // A tie broken toward the loosest floor would flatter the qualification
    // cushion the verdict then measures against.
    const fit = cleanFit();
    const tied = fit.evaluated.filter((e) => e.eligible && e.offerLTV === fit.bestFit!.offerLTV);
    const maxFloorAmongTied = Math.max(...tied.map((e) => e.program.dscrFloor));
    expect(fit.bestFit!.program.dscrFloor).toBe(maxFloorAmongTied);
  });

  it('never names an ineligible program as best fit', () => {
    for (const fico of [500, 620, 680, 720, 780]) {
      const fit = cleanFit({ fico });
      if (fit.bestFit) expect(fit.bestFit.eligible).toBe(true);
    }
  });
});

describe('evaluateProgramFit — DSCR handling matches the matrix contract', () => {
  it('routes a zero or negative DSCR to the no-ratio tier, not to a numeric tier', () => {
    // lookupMaxLTV documents the no-ratio fallback. A DSCR of 0 is not a ratio;
    // comparing it against numeric tiers is meaningless.
    const zero = cleanFit({ dscr: 0 });
    const explicitNoRatio = cleanFit({ dscr: null });
    expect(zero.evaluated.map((e) => e.offerLTV)).toEqual(explicitNoRatio.evaluated.map((e) => e.offerLTV));
  });

  it('treats a non-finite DSCR as no-ratio rather than passing NaN into the grid', () => {
    const nan = cleanFit({ dscr: Number.NaN });
    const explicitNoRatio = cleanFit({ dscr: null });
    expect(nan.evaluated.map((e) => e.offerLTV)).toEqual(explicitNoRatio.evaluated.map((e) => e.offerLTV));
  });

  it('agrees with lookupMaxLTV for every program', () => {
    const fit = cleanFit({ fico: 740, loanAmount: 400_000, dscr: 1.15 });
    for (const e of fit.evaluated) {
      expect(e.offerLTV).toBe(lookupMaxLTV(e.program, 740, 400_000, 1.15, 'purchase'));
    }
  });
});

describe('evaluateProgramFit — deal-shape gates', () => {
  it('excludes programs that do not lend on 5+ units when the deal is multifamily', () => {
    const fit = cleanFit({ isMultiFamily: true });
    for (const e of fit.evaluated) {
      if (!e.program.multiFamily) {
        expect(e.eligible).toBe(false);
        expect(e.reasons).toContain('Program does not lend on 5+ unit properties');
      }
    }
  });

  it('excludes programs that do not accept STR income when the deal is STR', () => {
    const fit = cleanFit({ isSTR: true });
    for (const e of fit.evaluated) {
      if (!e.program.isSTR) {
        expect(e.eligible).toBe(false);
        expect(e.reasons).toContain('Program does not accept short-term-rental income');
      }
    }
  });

  it('excludes programs that do not lend to foreign nationals', () => {
    const fit = cleanFit({ isForeignNational: true });
    for (const e of fit.evaluated) {
      if (!e.program.foreignNational) {
        expect(e.eligible).toBe(false);
        expect(e.reasons).toContain('Program does not lend to foreign nationals');
      }
    }
  });

  it('leaves the deal-shape gates off by default, so an unflagged deal is unaffected', () => {
    const plain = cleanFit();
    const explicit = cleanFit({ isMultiFamily: false, isSTR: false, isForeignNational: false });
    expect(plain.evaluated.map((e) => e.eligible)).toEqual(explicit.evaluated.map((e) => e.eligible));
  });
});
