import { describe, it, expect } from 'vitest';
import {
  computeReturnGrade,
  computeVerdict,
  computeVerdictDetail,
  type VerdictInput,
  type ProceedGate,
} from './decisionSupport';
import type {
  ARMResetResult,
  InsuranceGateResult,
  LenderRankingEntry,
} from './types';

/**
 * `computeVerdict` publishes the most consequential output in the product — the
 * IC verdict — and had NO tests, which is exactly how three defects shipped
 * green:
 *
 *   A. `(t2 >= 1.0 || t2 < 1.0)` — a tautological negative-carry gate that could
 *      not fail for ANY input, so a deal bleeding cash reached PROCEED.
 *   B. `lenderRanking.length === 0 || some(eligible)` — an empty ranking, i.e.
 *      "no lender was ever evaluated", scored as "an eligible lender exists".
 *   C. `returnGrade >= 'B'` — a string comparison, so 'A' >= 'B' is false and
 *      'D' >= 'B' is true; the best grade was rejected and weak grades passed.
 *
 * The rule this file enforces: there is a test per verdict path, and every gate
 * must be able to FAIL. A gate that cannot fail is not a gate.
 */

// ── fixtures ────────────────────────────────────────────────────────────────

function eligibleLender(overrides: Partial<LenderRankingEntry> = {}): LenderRankingEntry {
  return {
    rank: 1,
    lenderId: 'test-program',
    lenderName: 'Test Program',
    fitTier: 'STRONG_FIT',
    eligible: true,
    ineligibleReasons: [],
    estimatedRate: 7.0,
    aey: 7.0,
    totalCost60mo: 0,
    confidenceScore: 88,
    counterpartyRisk: {
      lenderId: 'test-program',
      continuityScore: 90,
      knownDisruption: null,
      lastReportedStatus: 'ACTIVE',
      flag: 'STABLE',
    },
    pppAllowed: true,
    pppStructure: '5/4/3/2/1',
    provenance: 'VERIFIED_PRIMARY',
    provenanceWarnings: [],
    sourceSnapshot: '2026-06-24',
    ...overrides,
  };
}

const CLEAR_INSURANCE: InsuranceGateResult = {
  zone: 'STANDARD',
  zoneLabel: 'Standard',
  quoteConfirmed: true,
  premiumAnnual: 2000,
  premiumStressY3: 2500,
  killCriterion: false,
  verdict: 'CLEAR',
  reason: 'Standard zone; quote confirmed.',
  provenance: 'VERIFIED_PRIMARY',
  source: 'test fixture',
};

/**
 * A deal that clears every PROCEED gate. Every negative case below is this
 * object with ONE field changed, so each test isolates exactly one gate.
 */
const CLEAN: VerdictInput = {
  track1DSCR: 1.45,
  track2DSCR: 1.15,
  lenderMinDSCR: 1.0,
  afterTaxIRR: 0.16,
  preTaxIRR: 0.18,
  year1CoC: 0.09,
  dealBreakRate: 8.5,
  solvedRate: 7.0,
  rateHeadroomBps: 150,
  appraisalBreakpointPercent: 1.2,
  insuranceGate: CLEAR_INSURANCE,
  brrrrGate: null,
  armReset: null,
  strLegalityStatus: 'NOT_APPLICABLE',
  pppAllowed: true,
  ficoScore: 760,
  ltv: 70,
  ltvCap: 80,
  loanAmount: 300_000,
  lenderMinLoan: 100_000,
  bestLenderConfidence: 88,
  lenderRanking: [eligibleLender()],
  isDecliningMarket: false,
};

const withInput = (overrides: Partial<VerdictInput>): VerdictInput => ({ ...CLEAN, ...overrides });
const verdictOf = (overrides: Partial<VerdictInput> = {}) => computeVerdict(withInput(overrides));
const detailOf = (overrides: Partial<VerdictInput> = {}) => computeVerdictDetail(withInput(overrides));
const gate = (gates: ProceedGate[], id: ProceedGate['id']) => gates.find(g => g.id === id)!;

// ── baseline ────────────────────────────────────────────────────────────────

describe('computeVerdict — the clean baseline', () => {
  it('PROCEEDs when every gate clears, and says so', () => {
    const { verdict, gates } = detailOf();
    expect(verdict.verdict).toBe('PROCEED');
    expect(gates.every(g => g.passed)).toBe(true);
    expect(verdict.bindingConstraint).toBe('None — every PROCEED gate clears.');
  });

  it('publishes all six PROCEED gates with the numbers behind each', () => {
    const { gates } = detailOf();
    expect(gates.map(g => g.id)).toEqual([
      'NO_BLOCKERS',
      'ELIGIBLE_LENDER',
      'TRACK1_CUSHION',
      'TRACK2_CARRY',
      'RETURN_GRADE',
      'RATE_HEADROOM',
    ]);
    expect(gate(gates, 'TRACK1_CUSHION').requirement).toContain('1.050');
    expect(gate(gates, 'TRACK1_CUSHION').observed).toContain('1.450');
    expect(gate(gates, 'RATE_HEADROOM').observed).toBe('150 bps');
  });
});

// ── DEFECT A — the tautological Track-2 gate ────────────────────────────────

describe('DEFECT A — Track 2 negative carry must be able to fail', () => {
  // The measured case: Track 2 at 0.763 is a real monthly bleed and reached
  // PROCEED because the gate expanded to `(t2 >= 1.0 || t2 < 1.0)`.
  it('a Track 2 of 0.763 does NOT reach PROCEED', () => {
    const v = verdictOf({ track2DSCR: 0.763, track2MonthlyCashFlow: -1554 });
    expect(v.verdict).not.toBe('PROCEED');
    expect(v.verdict).toBe('RESTRUCTURE');
  });

  it('the Track-2 gate fails, and it is the binding constraint', () => {
    const { verdict, gates } = detailOf({ track2DSCR: 0.763, track2MonthlyCashFlow: -1554 });
    expect(gate(gates, 'TRACK2_CARRY').passed).toBe(false);
    expect(verdict.bindingConstraint).toContain('Track 2');
  });

  it('an absent acknowledgment does not satisfy the gate', () => {
    const { gates } = detailOf({ track2DSCR: 0.9, track2Acknowledgment: null });
    expect(gate(gates, 'TRACK2_CARRY').passed).toBe(false);
    expect(gate(gates, 'TRACK2_CARRY').observed).toContain('no acknowledgment on file');
  });

  it.each([
    ['acknowledged: false', { acknowledged: false, thesisMonthlyDollars: 2000, thesisStatement: 'Appreciation.' }],
    ['no $/mo thesis', { acknowledged: true, thesisMonthlyDollars: 0, thesisStatement: 'Appreciation.' }],
    ['negative $/mo thesis', { acknowledged: true, thesisMonthlyDollars: -500, thesisStatement: 'Appreciation.' }],
    ['blank statement', { acknowledged: true, thesisMonthlyDollars: 2000, thesisStatement: '   ' }],
  ])('a malformed acknowledgment (%s) does not satisfy the gate', (_label, ack) => {
    const { gates } = detailOf({ track2DSCR: 0.763, track2Acknowledgment: ack });
    expect(gate(gates, 'TRACK2_CARRY').passed).toBe(false);
  });

  it('a thesis smaller than the bleed does not justify the bleed', () => {
    const { gates } = detailOf({
      track2DSCR: 0.763,
      track2MonthlyCashFlow: -1554,
      track2Acknowledgment: { acknowledged: true, thesisMonthlyDollars: 200, thesisStatement: 'Appreciation thesis.' },
    });
    expect(gate(gates, 'TRACK2_CARRY').passed).toBe(false);
  });

  it('a complete acknowledgment covering the bleed DOES satisfy its own gate', () => {
    const { gates } = detailOf({
      track2DSCR: 0.763,
      track2MonthlyCashFlow: -1554,
      track2Acknowledgment: { acknowledged: true, thesisMonthlyDollars: 1600, thesisStatement: 'Cost-seg + appreciation thesis.' },
    });
    expect(gate(gates, 'TRACK2_CARRY').passed).toBe(true);
  });

  /**
   * Pins the documented spec contradiction: Grade B itself requires T2 ≥ 1.00,
   * so the return-grade gate independently blocks every sub-1.0 Track 2. No
   * acknowledgment, however complete, can currently produce PROCEED. If this
   * test ever fails, someone changed the grade thresholds or the gate — that is
   * an owner decision, not a refactor.
   */
  it('no acknowledgment can flip a sub-1.0 Track 2 to PROCEED (return grade still binds)', () => {
    const { verdict, gates } = detailOf({
      track2DSCR: 0.99,
      track2MonthlyCashFlow: -50,
      track2Acknowledgment: { acknowledged: true, thesisMonthlyDollars: 5000, thesisStatement: 'Strong thesis.' },
    });
    expect(gate(gates, 'TRACK2_CARRY').passed).toBe(true);
    expect(gate(gates, 'RETURN_GRADE').passed).toBe(false);
    expect(verdict.verdict).toBe('RESTRUCTURE');
  });

  it('an unknown Track 2 still requires an acknowledgment and cannot PROCEED', () => {
    const v = verdictOf({ track2DSCR: Number.NaN });
    expect(v.track2AcknowledgmentRequired).toBe(true);
    expect(v.verdict).toBe('PASS');
  });
});

// ── DEFECT B — the fail-open lender check ───────────────────────────────────

describe('DEFECT B — an unevaluated lender set must not read as approved', () => {
  it('an EMPTY lenderRanking is PASS, not PROCEED', () => {
    const v = verdictOf({ lenderRanking: [] });
    expect(v.verdict).toBe('PASS');
    expect(v.bindingConstraint).toContain('not evaluated');
  });

  it('an OMITTED lenderRanking is PASS', () => {
    const { lenderRanking: _drop, ...rest } = CLEAN;
    const v = computeVerdict(rest as unknown as VerdictInput);
    expect(v.verdict).toBe('PASS');
  });

  it('a ranking where every lender is ineligible is PASS and says how many were checked', () => {
    const v = verdictOf({
      lenderRanking: [eligibleLender({ eligible: false }), eligibleLender({ eligible: false, rank: 2 })],
    });
    expect(v.verdict).toBe('PASS');
    expect(v.bindingConstraint).toContain('0 of 2');
  });

  it('one eligible lender among ineligible ones clears the gate', () => {
    const { gates } = detailOf({
      lenderRanking: [eligibleLender({ eligible: false }), eligibleLender({ rank: 2 })],
    });
    expect(gate(gates, 'ELIGIBLE_LENDER').passed).toBe(true);
    expect(gate(gates, 'ELIGIBLE_LENDER').observed).toBe('1 eligible of 2 evaluated');
  });
});

// ── DEFECT C — grade ordering must not be a string comparison ───────────────

describe('DEFECT C — return-grade gate ordering', () => {
  it('lets a grade-A deal PROCEED', () => {
    const { verdict } = detailOf({ afterTaxIRR: 0.25 });
    expect(verdict.returnGrade).toBe('A');
    expect(verdict.verdict).toBe('PROCEED');
  });

  it('lets a grade-B deal PROCEED', () => {
    const { verdict } = detailOf({ afterTaxIRR: 0.13, track2DSCR: 1.05 });
    expect(verdict.returnGrade).toBe('B');
    expect(verdict.verdict).toBe('PROCEED');
  });

  it('does NOT let grade C or D PROCEED', () => {
    for (const irr of [0.09, 0.02]) {
      const v = verdictOf({ afterTaxIRR: irr });
      expect(['C', 'D']).toContain(v.returnGrade);
      expect(v.verdict).toBe('RESTRUCTURE');
    }
  });

  it('never ranks a worse grade above a better one', () => {
    expect(verdictOf({ afterTaxIRR: 0.25 }).verdict).toBe('PROCEED');
    expect(verdictOf({ afterTaxIRR: 0.02 }).verdict).not.toBe('PROCEED');
  });

  it('grade F is PASS, not RESTRUCTURE', () => {
    const v = verdictOf({ afterTaxIRR: -0.05 });
    expect(v.returnGrade).toBe('F');
    expect(v.verdict).toBe('PASS');
    expect(v.bindingConstraint).toContain('Return Grade F');
  });

  it('a negative Track 2 forces grade F and PASS even on a strong IRR', () => {
    const v = verdictOf({ afterTaxIRR: 0.30, track2DSCR: -0.2 });
    expect(v.returnGrade).toBe('F');
    expect(v.verdict).toBe('PASS');
  });
});

// ── every BLOCKER path ──────────────────────────────────────────────────────

describe('every BLOCKER produces PASS and names itself as the binding constraint', () => {
  const criticalArm = {
    initialRate: 6.5,
    currentIndex: 3.6,
    margin: 3.0,
    resetRateAtCurrentIndex: 6.6,
    resetRateAtStressIndex: 8.0,
    resetRateAtLifetimeCap: 11.5,
    yearsToFirstReset: 5,
    paymentAtCurrentReset: 2100,
    paymentAtStressReset: 2500,
    paymentAtLifetimeCap: 3000,
    track1DSCRAtCurrentReset: 1.1,
    track1DSCRAtStressReset: 0.92,
    track1DSCRAtLifetimeCap: 0.7,
    dealBreakRate: 8.5,
    cushionBpsAtStress: -50,
    ioArmDoubleShockYear: 5,
    doubleShockRisk: 'CRITICAL',
    warningMessage: 'IO recast and ARM reset land in the same year.',
  } as ARMResetResult;

  const cases: [string, Partial<VerdictInput>, string][] = [
    ['STR prohibited', { strLegalityStatus: 'PROHIBITED' }, 'STR Prohibited'],
    [
      'insurance unconfirmed in a high-risk zone',
      { insuranceGate: { ...CLEAR_INSURANCE, zone: 'FL_HIGH_RISK', killCriterion: true, verdict: 'KILL', quoteConfirmed: false, reason: 'No bindable quote in a high-risk zone.' } },
      'Insurance Unconfirmed in High-Risk Zone',
    ],
    ['FICO below every floor', { ficoScore: 601 }, 'FICO Below All Lender Floors'],
    ['Track 1 below 0.75', { track1DSCR: 0.60 }, 'Track 1 DSCR < 0.75'],
    ['solved rate above the deal-break rate', { solvedRate: 9.1, dealBreakRate: 8.5 }, 'Rate Above Deal-Break Rate'],
    ['declining-market LTV cap binds', { isDecliningMarket: true, ltv: 82, ltvCap: 75 }, 'Declining-Market LTV Cap Binds'],
    ['declining-market cap unknown', { isDecliningMarket: true, ltvCap: Number.NaN }, 'Declining-Market LTV Cap Unknown'],
    ['ARM double-shock critical', { armReset: criticalArm }, 'ARM Double-Shock Critical Risk'],
    ['Monte Carlo P(DSCR<1) above 15%', { monteCarloPDSCRLessThan1: 0.22 }, 'P(DSCR<1.00) > 15%'],
    ['Monte Carlo 5th-pct DSCR below 0.80', { monteCarlo5thPctDSCR: 0.71 }, '5th-Pct DSCR < 0.80'],
    ['Monte Carlo probability supplied as NaN', { monteCarloPDSCRLessThan1: Number.NaN }, 'Monte Carlo P(DSCR<1.00) Not Finite'],
    ['Monte Carlo 5th-pct supplied as NaN', { monteCarlo5thPctDSCR: Number.NaN }, 'Monte Carlo 5th-Pct DSCR Not Finite'],
    // The exact shape of defect C: a cash-on-cash percentage multiplied by 5 and
    // handed over as an "IRR". 22.95% CoC × 5 = 114.75, i.e. 11,475% — which the
    // old code graded A.
    ['a cumulative CoC figure passed as an IRR', { afterTaxIRR: 1.1475 * 100 }, 'After-Tax IRR Outside Plausible Range'],
    ['a percentage passed where a decimal belongs', { afterTaxIRR: 16 }, 'After-Tax IRR Outside Plausible Range'],
  ];

  it.each(cases)('%s → PASS', (_label, overrides, criterion) => {
    const v = verdictOf(overrides);
    expect(v.verdict).toBe('PASS');
    expect(v.killCriteriaTriggered.some(k => k.criterion === criterion && k.severity === 'BLOCKER')).toBe(true);
    expect(v.bindingConstraint).toContain(criterion);
  });
});

// ── Monte-Carlo tail rules that are NOT blockers ────────────────────────────

describe('Monte-Carlo tail rules', () => {
  it('P(DSCR<1) between 10% and 15% is a WARNING and does not block PROCEED', () => {
    const v = verdictOf({ monteCarloPDSCRLessThan1: 0.12 });
    expect(v.killCriteriaTriggered.some(k => k.criterion === 'P(DSCR<1.00) > 10%' && k.severity === 'WARNING')).toBe(true);
    expect(v.verdict).toBe('PROCEED');
  });

  it('P(DSCR<1) at or below 10% raises nothing', () => {
    const v = verdictOf({ monteCarloPDSCRLessThan1: 0.05, monteCarlo5thPctDSCR: 1.02 });
    expect(v.killCriteriaTriggered.some(k => k.criterion.startsWith('P(DSCR<1.00)'))).toBe(false);
    expect(v.verdict).toBe('PROCEED');
  });

  it('exactly 0.15 does not trip the blocker (the threshold is strict)', () => {
    expect(verdictOf({ monteCarloPDSCRLessThan1: 0.15 }).verdict).toBe('PROCEED');
  });

  it('exactly 0.80 on the 5th percentile does not trip the blocker', () => {
    expect(verdictOf({ monteCarlo5thPctDSCR: 0.80 }).verdict).toBe('PROCEED');
  });
});

// ── every RESTRUCTURE binding constraint ────────────────────────────────────

describe('RESTRUCTURE — the binding constraint is the gate that actually bound', () => {
  const cases: [string, Partial<VerdictInput>, ProceedGate['id'], string][] = [
    ['Track 1 cushion too thin', { track1DSCR: 1.02 }, 'TRACK1_CUSHION', 'Track 1 cushion'],
    ['Track 2 negative carry', { track2DSCR: 0.85 }, 'TRACK2_CARRY', 'Track 2 carry'],
    ['return grade below B', { afterTaxIRR: 0.09 }, 'RETURN_GRADE', 'Return grade'],
    ['rate headroom below 50 bps', { rateHeadroomBps: 20 }, 'RATE_HEADROOM', 'Rate headroom'],
  ];

  it.each(cases)('%s', (_label, overrides, gateId, expectedText) => {
    const { verdict, gates } = detailOf(overrides);
    expect(verdict.verdict).toBe('RESTRUCTURE');
    expect(gate(gates, gateId).passed).toBe(false);
    expect(verdict.bindingConstraint).toContain(expectedText);
  });

  /**
   * The old fallback printed `Track 1 cushion: 0.696` on a RESTRUCTURE — the
   * deal's STRENGTH offered as the reason for its rejection. A binding
   * constraint must always correspond to a gate that FAILED.
   */
  it('never reports a passing gate as the reason for rejection', () => {
    for (const [, overrides] of cases) {
      const { verdict, gates } = detailOf(overrides);
      const named = gates.filter(g => verdict.bindingConstraint.startsWith(g.label));
      expect(named.length).toBe(1);
      expect(named[0].passed).toBe(false);
    }
  });

  it('rate headroom of exactly 50 bps clears the gate', () => {
    expect(verdictOf({ rateHeadroomBps: 50 }).verdict).toBe('PROCEED');
  });

  it('a Track 1 cushion of exactly 0.05 clears the gate', () => {
    expect(verdictOf({ track1DSCR: 1.05, lenderMinDSCR: 1.0 }).verdict).toBe('PROCEED');
  });
});

// ── fail-closed on missing / non-finite inputs ──────────────────────────────

describe('fail closed — a missing input never produces a favourable verdict', () => {
  const missing: [string, Partial<VerdictInput>, string][] = [
    ['Track 1 DSCR', { track1DSCR: Number.NaN }, 'Track 1 DSCR Not Established'],
    ['Track 2 DSCR', { track2DSCR: Number.NaN }, 'Track 2 DSCR Not Established'],
    ['lender DSCR floor', { lenderMinDSCR: Number.NaN }, 'Lender DSCR Floor Unknown'],
    ['after-tax IRR', { afterTaxIRR: null }, 'Return Not Established'],
    ['deal-break rate', { dealBreakRate: Number.NaN }, 'Rate Break Point Not Established'],
    ['solved rate', { solvedRate: Number.POSITIVE_INFINITY }, 'Rate Break Point Not Established'],
    ['FICO', { ficoScore: Number.NaN }, 'FICO Not Supplied'],
  ];

  it.each(missing)('a missing %s is a BLOCKER, not a pass', (_label, overrides, criterion) => {
    const v = verdictOf(overrides);
    expect(v.verdict).toBe('PASS');
    expect(v.killCriteriaTriggered.some(k => k.criterion === criterion && k.severity === 'BLOCKER')).toBe(true);
  });

  it('a missing after-tax IRR grades F rather than 0%', () => {
    const v = verdictOf({ afterTaxIRR: null });
    expect(v.returnGrade).toBe('F');
    expect(v.returnGradeReason).toContain('not established');
    // The old code did `input.afterTaxIRR ?? 0` and then printed "0.0%" as if
    // the deal had been measured and found to return nothing.
    expect(v.note).not.toContain('0.0%');
  });

  it('a plausible high IRR is NOT blocked — the scale guard must not clip real returns', () => {
    // 45% after-tax IRR is exceptional but real. The guard sits at ±200%.
    expect(verdictOf({ afterTaxIRR: 0.45 }).verdict).toBe('PROCEED');
    expect(verdictOf({ afterTaxIRR: 1.99 }).verdict).toBe('PROCEED');
  });

  it('an unscored best-fit lender reports as unscored instead of passing the <60 check', () => {
    const v = verdictOf({ bestLenderConfidence: null });
    expect(v.killCriteriaTriggered.some(k => k.criterion === 'Best-Fit Lender Not Confidence-Scored')).toBe(true);
  });

  it('an unevaluated insurance gate is surfaced as a WARNING', () => {
    const v = verdictOf({ insuranceGate: null });
    expect(v.killCriteriaTriggered.some(k => k.criterion === 'Insurance Gate Not Evaluated' && k.severity === 'WARNING')).toBe(true);
  });

  it('an unevaluated STR legality status is surfaced as a WARNING', () => {
    const v = verdictOf({ strLegalityStatus: '' });
    expect(v.killCriteriaTriggered.some(k => k.criterion === 'STR Legality Not Evaluated')).toBe(true);
  });

  it('an all-empty input object is PASS, never PROCEED', () => {
    const v = computeVerdict({} as unknown as VerdictInput);
    expect(v.verdict).toBe('PASS');
    expect(v.returnGrade).toBe('F');
    expect(v.killSwitchConditions.length).toBeGreaterThan(0);
  });

  it('every numeric input set to NaN is PASS, never PROCEED', () => {
    const allNaN = Object.fromEntries(
      Object.entries(CLEAN).map(([k, v]) => [k, typeof v === 'number' ? Number.NaN : v]),
    ) as VerdictInput;
    expect(computeVerdict(allNaN).verdict).toBe('PASS');
  });
});

// ── return grade in isolation ───────────────────────────────────────────────

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

  it('F: a non-finite IRR or Track 2 grades F, not D', () => {
    expect(computeReturnGrade(Number.NaN, 1.2)).toBe('F');
    expect(computeReturnGrade(0.16, Number.NaN)).toBe('F');
    expect(computeReturnGrade(Number.POSITIVE_INFINITY, 1.2)).toBe('F');
  });
});
