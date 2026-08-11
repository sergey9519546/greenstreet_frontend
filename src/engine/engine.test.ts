/**
 * DSCR Engine — Unit Test Suite
 *
 * Golden test values are extracted directly from the engine source comments
 * (engine.ts top-of-file block) and from verified manual calculations.
 *
 * All tests are pure-function / deterministic — no network, no Firebase.
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePaymentFactor,
  calculatePI,
  calculateIOPayment,
  calculatePITIA,
  calculateCashToClose,
  solveDealBreakRate,
  solveMaxPurchasePrice,
  solveRequiredRent,
  solveDSCR,
  quickDscrEstimate,
} from './engine';
import { buildEngineInputs } from './inputs';
import { checkPPPLegal } from './statePppLaws';

// ─────────────────────────────────────────────────────────────────────────────
// 1. PAYMENT FACTOR (amortization math)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculatePaymentFactor', () => {
  it('reproduces golden value: 8.25% / 30yr → ~0.0075127', () => {
    const factor = calculatePaymentFactor(8.25, 360);
    expect(factor).toBeCloseTo(0.0075127, 6);
  });

  it('reproduces golden value: 7.00% / 30yr → ~0.006653', () => {
    const factor = calculatePaymentFactor(7.0, 360);
    expect(factor).toBeCloseTo(0.006653, 5);
  });

  it('handles 0% rate (interest-free) → 1/n', () => {
    const factor = calculatePaymentFactor(0, 360);
    expect(factor).toBeCloseTo(1 / 360, 10);
  });

  it('15-year term has higher factor than 30-year at same rate', () => {
    const f15 = calculatePaymentFactor(7.0, 180);
    const f30 = calculatePaymentFactor(7.0, 360);
    expect(f15).toBeGreaterThan(f30);
  });

  it('40-year term has lower factor than 30-year at same rate', () => {
    const f40 = calculatePaymentFactor(7.0, 480);
    const f30 = calculatePaymentFactor(7.0, 360);
    expect(f40).toBeLessThan(f30);
  });

  it('rejects non-finite and negative payment inputs without emitting a payment', () => {
    expect(calculatePaymentFactor(Number.NaN, 360)).toBe(0);
    expect(calculatePaymentFactor(-1, 360)).toBe(0);
    expect(calculatePaymentFactor(7, 0)).toBe(0);
    expect(calculatePI(300_000, 7, Number.POSITIVE_INFINITY)).toBe(0);
    expect(calculateIOPayment(300_000, -7)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRINCIPAL + INTEREST PAYMENT
// ─────────────────────────────────────────────────────────────────────────────
describe('calculatePI', () => {
  it('$300k loan @ 8.25% / 30yr → ~$2,254', () => {
    const pi = calculatePI(300_000, 8.25, 360);
    expect(pi).toBeCloseTo(2254, 0);
  });

  it('$300k loan @ 7.00% / 30yr → ~$1,996', () => {
    const pi = calculatePI(300_000, 7.0, 360);
    expect(pi).toBeCloseTo(1996, 0);
  });

  it('is proportional to loan amount', () => {
    const pi1 = calculatePI(200_000, 7.0, 360);
    const pi2 = calculatePI(400_000, 7.0, 360);
    expect(pi2).toBeCloseTo(pi1 * 2, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. INTEREST-ONLY PAYMENT
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateIOPayment', () => {
  it('$300k @ 7.00% IO → $1,750/mo', () => {
    const io = calculateIOPayment(300_000, 7.0);
    expect(io).toBeCloseTo(1750, 1);
  });

  it('IO is always less than P+I at same rate/amount', () => {
    const io = calculateIOPayment(300_000, 7.0);
    const pi = calculatePI(300_000, 7.0, 360);
    expect(io).toBeLessThan(pi);
  });

  it('$500k @ 6.00% IO → $2,500/mo', () => {
    const io = calculateIOPayment(500_000, 6.0);
    expect(io).toBeCloseTo(2500, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3b. INTEREST-ONLY ENUM SAFETY
// ─────────────────────────────────────────────────────────────────────────────
describe('calculatePITIA — interest-only enum safety', () => {
  const pitia = (ioPeriod: 'NONE' | '5_YR' | '7_YR' | '10_YR') =>
    calculatePITIA(300_000, 7.0, 30, ioPeriod, 6_000, 1_800, 100);

  it('treats NONE as a fully amortizing loan', () => {
    expect(pitia('NONE').isInterestOnly).toBe(false);
  });

  it.each(['5_YR', '7_YR', '10_YR'] as const)('recognizes supported IO period %s', (ioPeriod) => {
    expect(pitia(ioPeriod).isInterestOnly).toBe(true);
  });

  it('rejects malformed IO values instead of treating them as 10-year IO', () => {
    expect(() => calculatePITIA(300_000, 7.0, 30, '0' as never, 6_000, 1_800, 100))
      .toThrow('Unsupported interest-only period');
  });

  it('returns only finite, non-negative costs for malformed expense inputs', () => {
    const pitia = calculatePITIA(
      300_000,
      7,
      30,
      'NONE',
      -1,
      Number.POSITIVE_INFINITY,
      Number.NaN,
      -4,
      Number.NaN,
    );

    expect(Object.values(pitia).filter((value): value is number => typeof value === 'number').every(
      (value) => Number.isFinite(value) && value >= 0,
    )).toBe(true);
    expect(pitia.taxes).toBe(0);
    expect(pitia.insurance).toBe(0);
    expect(pitia.hoa).toBe(0);
    expect(pitia.floodInsurance).toBe(0);
    expect(pitia.mortgageInsurance).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3c. REVERSE CALCULATOR DOMAIN SAFETY
// ─────────────────────────────────────────────────────────────────────────────
describe('reverse calculator domain safety', () => {
  it('returns zero for impossible or zero-denominator reverse calculations', () => {
    expect(solveMaxPurchasePrice(2_000, 0, 7, 30, 'NONE', 0, 0, 0)).toBe(0);
    expect(solveMaxPurchasePrice(2_000, 75, 7, 30, 'NONE', 0, 0, 0, 0, 0)).toBe(0);
    expect(solveDealBreakRate(2_000, 0, 30, 'NONE', 0, 0, 0)).toBe(0);
    expect(solveRequiredRent(1.1, 2_000, 0)).toBe(0);
  });

  it('returns zero when a deal-break rate cannot be bracketed instead of returning the search ceiling', () => {
    expect(solveDealBreakRate(1_000_000, 100_000, 30, 'NONE', 0, 0, 0)).toBe(0);
  });

  it('returns zero when even the 0% payment exceeds the deal-break target', () => {
    expect(solveDealBreakRate(2_000, 300_000, 30, 'NONE', 14_400, 0, 0)).toBe(0);
  });

  it('fails closed instead of emitting non-finite cash-to-close values', () => {
    const { loan } = buildEngineInputs({
      purchasePrice: 400_000,
      monthlyRent: 3_000,
      state: 'TX',
    });

    const result = calculateCashToClose(
      Number.NaN,
      300_000,
      loan,
      6,
      9,
      2_500,
    );

    expect(Object.values(result).every((value) => Number.isFinite(value) && value === 0)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. DSCR SOLVE — FLAGSHIP SCENARIO (from engine.ts golden values)
// ─────────────────────────────────────────────────────────────────────────────
describe('solveDSCR — flagship scenario', () => {
  // Flagship: $400k purchase, 75% LTV, $3,000/mo rent, TX, 740 FICO, SFR
  function makeFlagshipInputs(overrides: Record<string, any> = {}) {
    return buildEngineInputs({
      purchasePrice: 400_000,
      monthlyRent: 3_000,
      state: 'TX',
      ficoScore: 740,
      ltv: 75,
      ...overrides,
    });
  }

  it('solves without throwing for the flagship case', () => {
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    expect(() => solveDSCR(property, borrower, loan, strategy)).not.toThrow();
  });

  it('DSCR is a positive finite number', () => {
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    const result = solveDSCR(property, borrower, loan, strategy);
    expect(Number.isFinite(result.dscr)).toBe(true);
    expect(result.dscr).toBeGreaterThan(0);
  });

  it('solvedRate is within plausible market range (5%–11%)', () => {
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    const result = solveDSCR(property, borrower, loan, strategy);
    expect(result.solvedRate).toBeGreaterThanOrEqual(5);
    expect(result.solvedRate).toBeLessThanOrEqual(11);
  });

  it('loanAmount derives correctly from 75% LTV on $400k', () => {
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    const result = solveDSCR(property, borrower, loan, strategy);
    expect(result.loanAmount).toBeCloseTo(300_000, -2);
  });

  it('DSCR at 7.00% market rate passes Track 1 (≥ 1.05)', () => {
    // Engine comment: "Flagship Track 1: 1.05 @ 7.00%"
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    const result = solveDSCR(property, borrower, loan, strategy);
    // Solved rate should be near market; DSCR at solved rate should pass
    expect(result.dualTrackDSCR.track1.passes).toBe(true);
  });

  it('deal-break rate is above the solved rate', () => {
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    const result = solveDSCR(property, borrower, loan, strategy);
    expect(result.dealBreakRate).toBeGreaterThan(result.solvedRate);
  });

  it('has positive headroom in basis points', () => {
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    const result = solveDSCR(property, borrower, loan, strategy);
    expect(result.rateHeadroomBps).toBeGreaterThan(0);
  });

  it('PITIA total is a positive number', () => {
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    const result = solveDSCR(property, borrower, loan, strategy);
    expect(result.monthlyPITIA.total).toBeGreaterThan(0);
  });

  it('PITIA.principalAndInterest is the largest component', () => {
    const { property, borrower, loan, strategy } = makeFlagshipInputs();
    const result = solveDSCR(property, borrower, loan, strategy);
    const { principalAndInterest, taxes, insurance } = result.monthlyPITIA;
    expect(principalAndInterest).toBeGreaterThan(taxes);
    expect(principalAndInterest).toBeGreaterThan(insurance);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. DSCR SOLVE — BOUNDARY CONDITIONS
// ─────────────────────────────────────────────────────────────────────────────
describe('solveDSCR — boundary conditions', () => {
  it('higher rent → higher DSCR', () => {
    const base = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 2_500, state: 'TX' });
    const better = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_500, state: 'TX' });
    const r1 = solveDSCR(base.property, base.borrower, base.loan, base.strategy);
    const r2 = solveDSCR(better.property, better.borrower, better.loan, better.strategy);
    expect(r2.dscr).toBeGreaterThan(r1.dscr);
  });

  it('higher LTV (more leverage) → lower DSCR', () => {
    const low = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', ltv: 65 });
    const high = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', ltv: 80 });
    const r1 = solveDSCR(low.property, low.borrower, low.loan, low.strategy);
    const r2 = solveDSCR(high.property, high.borrower, high.loan, high.strategy);
    expect(r1.dscr).toBeGreaterThan(r2.dscr);
  });

  it('higher FICO → lower solved rate (better pricing)', () => {
    const lowFico = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', ficoScore: 660 });
    const highFico = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', ficoScore: 780 });
    const r1 = solveDSCR(lowFico.property, lowFico.borrower, lowFico.loan, lowFico.strategy);
    const r2 = solveDSCR(highFico.property, highFico.borrower, highFico.loan, highFico.strategy);
    expect(r2.solvedRate).toBeLessThan(r1.solvedRate);
  });

  it('very low rent → Track 1 fails', () => {
    const inputs = buildEngineInputs({ purchasePrice: 800_000, monthlyRent: 1_000, state: 'CA', ltv: 80 });
    const result = solveDSCR(inputs.property, inputs.borrower, inputs.loan, inputs.strategy);
    expect(result.dualTrackDSCR.track1.passes).toBe(false);
  });

  it('HOA reduces DSCR vs no-HOA scenario', () => {
    const noHoa = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', hoa: 0 });
    const withHoa = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', hoa: 400 });
    const r1 = solveDSCR(noHoa.property, noHoa.borrower, noHoa.loan, noHoa.strategy);
    const r2 = solveDSCR(withHoa.property, withHoa.borrower, withHoa.loan, withHoa.strategy);
    expect(r1.dscr).toBeGreaterThan(r2.dscr);
  });

  it('30-year term → lower P&I than 15-year (same loan/rate)', () => {
    const t30 = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', term: '30_YR' });
    const t15 = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', term: '15_YR' });
    const r30 = solveDSCR(t30.property, t30.borrower, t30.loan, t30.strategy);
    const r15 = solveDSCR(t15.property, t15.borrower, t15.loan, t15.strategy);
    expect(r30.monthlyPITIA.principalAndInterest).toBeLessThan(r15.monthlyPITIA.principalAndInterest);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. buildEngineInputs — defaults and derivations
// ─────────────────────────────────────────────────────────────────────────────
describe('buildEngineInputs', () => {
  it('defaults LTV to 75 when neither ltv nor loanAmount given', () => {
    const { loan } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    expect(loan.ltv).toBe(75);
  });

  it('derives LTV from loanAmount when provided', () => {
    const { loan } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', loanAmount: 280_000 });
    expect(loan.ltv).toBeCloseTo(70, 1);
  });

  it('prefers explicit ltv over derived loanAmount', () => {
    const { loan } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX', ltv: 65, loanAmount: 280_000 });
    expect(loan.ltv).toBe(65);
  });

  it('estimates annual taxes at ~1.2% of purchase price', () => {
    const { property } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    expect(property.annualTaxes).toBeCloseTo(400_000 * 0.012, -1);
  });

  it('estimates annual insurance at ~0.5% of purchase price', () => {
    const { property } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    expect(property.annualInsurance).toBeCloseTo(400_000 * 0.005, -1);
  });

  it('marks FL as a declining market', () => {
    const { property } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'FL' });
    expect(property.isDecliningMarket).toBe(true);
  });

  it('marks TX as NOT a declining market', () => {
    const { property } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    expect(property.isDecliningMarket).toBe(false);
  });

  it('normalizes state to uppercase 2-letter abbrev', () => {
    const { property } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'texas' });
    expect(property.state).toBe('TE'); // only first 2 chars
  });

  it('defaults FICO to 740', () => {
    const { borrower } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    expect(borrower.ficoScore).toBe(740);
  });

  it('defaults entityType to LLC', () => {
    const { borrower } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    expect(borrower.entityType).toBe('LLC');
  });

  it('defaults term to 30_YR', () => {
    const { loan } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    expect(loan.term).toBe('30_YR');
  });

  it('defaults strategy to LTR', () => {
    const { strategy } = buildEngineInputs({ purchasePrice: 400_000, monthlyRent: 3_000, state: 'TX' });
    expect(strategy).toBe('LTR');
  });

  it('sanitizes non-finite and out-of-domain numeric request fields at the input boundary', () => {
    const { property, borrower, loan } = buildEngineInputs({
      purchasePrice: 100_000_001,
      monthlyRent: Number.NaN,
      state: 'TX',
      ltv: Number.POSITIVE_INFINITY,
      loanAmount: Number.POSITIVE_INFINITY,
      marketRent: Number.NEGATIVE_INFINITY,
      strProjectedRent: Number.POSITIVE_INFINITY,
      strDocumentedRent: -1,
      annualTaxes: Number.NaN,
      annualInsurance: -1,
      hoa: Number.NaN,
      floodInsurance: Number.POSITIVE_INFINITY,
      unitCount: 0,
      ficoScore: Number.POSITIVE_INFINITY,
      points: Number.POSITIVE_INFINITY,
      lenderFees: -1,
      brokerFees: Number.NaN,
      rateLockCost: Number.POSITIVE_INFINITY,
    });

    const numericInputs = [
      property.purchasePrice, property.leaseRent, property.marketRent,
      property.strProjectedRent, property.strDocumentedRent, property.annualTaxes,
      property.annualInsurance, property.hoa, property.floodInsurance, property.unitCount,
      borrower.ficoScore, loan.ltv, loan.points, loan.lenderFees, loan.brokerFees, loan.rateLockCost,
    ];
    expect(numericInputs.every(Number.isFinite)).toBe(true);
    expect(property.purchasePrice).toBe(0);
    expect(property.leaseRent).toBe(0);
    expect(property.unitCount).toBe(1);
    expect(borrower.ficoScore).toBe(740);
    expect(loan.ltv).toBe(0);
  });

  it('marks explicitly invalid optional financial values instead of silently qualifying on defaults', () => {
    const cases = [
      { field: 'ltv', request: { ltv: 101 } },
      { field: 'loanAmount', request: { loanAmount: 100_000_001 } },
      { field: 'annualTaxes', request: { annualTaxes: 10_000_001 } },
      { field: 'loanAmount', request: { loanAmount: 0 } },
    ];

    for (const { field, request } of cases) {
      const inputs = buildEngineInputs({
        purchasePrice: 400_000,
        monthlyRent: 3_000,
        state: 'TX',
        ...request,
      });
      const issues = (inputs.property as typeof inputs.property & {
        inputValidationIssues?: readonly string[];
      }).inputValidationIssues;
      const result = solveDSCR(inputs.property, inputs.borrower, inputs.loan, inputs.strategy);

      expect(issues).toContain(field);
      expect(result.dscr).toBe(0);
      expect(result.dualTrackDSCR.track1.passes).toBe(false);
      expect(result.dualTrackDSCR.verdict.summary).toContain('NEEDS_REVIEW');
    }
  });

  it('fails closed before tiny property values or derived loans can qualify', () => {
    const cases = [
      { label: 'subnormal LTV', request: { purchasePrice: 400_000, ltv: Number.MIN_VALUE } },
      { label: 'tiny LTV', request: { purchasePrice: 400_000, ltv: 1e-12 } },
      { label: 'tiny purchase price', request: { purchasePrice: 1e-12 } },
      { label: 'subnormal purchase price', request: { purchasePrice: 1e-300 } },
    ];

    for (const { label, request } of cases) {
      const inputs = buildEngineInputs({ monthlyRent: 3_000, state: 'TX', ...request });
      const result = solveDSCR(inputs.property, inputs.borrower, inputs.loan, inputs.strategy);
      const serialized = JSON.stringify(result, (_key, value) =>
        typeof value === 'number' && !Number.isFinite(value) ? 'NON_FINITE' : value,
      );

      expect(result.dscr, label).toBe(0);
      expect(result.dualTrackDSCR.track1.passes, label).toBe(false);
      expect(result.dualTrackDSCR.verdict.summary, label).toContain('NEEDS_REVIEW');
      expect(serialized, label).not.toContain('NON_FINITE');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. STATE PPP LAWS — key legal guardrails
// ─────────────────────────────────────────────────────────────────────────────
describe('checkPPPLegal', () => {
  it('TX allows PPP on LLC FIXED loans', () => {
    const result = checkPPPLegal('TX', 'LLC', 400_000, 1, 'FIXED');
    // TX is a PPP-permissive state
    expect(result).toBeDefined();
    expect(result.allowed).toBe(true);
  });

  it('returns a result object with required fields', () => {
    const result = checkPPPLegal('CA', 'LLC', 400_000, 1, 'FIXED');
    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('adjustedOptions');
  });

  it('handles an unknown state gracefully (no throw)', () => {
    expect(() => checkPPPLegal('ZZ', 'LLC', 400_000, 1, 'FIXED')).not.toThrow();
  });

  it('returns a result for all 50 standard state codes', () => {
    const states = [
      'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
      'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
      'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
      'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
      'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
    ];
    for (const st of states) {
      const result = checkPPPLegal(st, 'LLC', 400_000, 1, 'FIXED');
      expect(result).toHaveProperty('allowed');
    }
  });

  it('ARM and FIXED may have different PPP rules (no crash on ARM)', () => {
    expect(() => checkPPPLegal('CA', 'LLC', 400_000, 1, 'ARM')).not.toThrow();
  });

  it('individual vs LLC may produce different results in restricted states', () => {
    // Some states restrict PPP for individual borrowers more strictly
    const llc = checkPPPLegal('TX', 'LLC', 400_000, 1, 'FIXED');
    const ind = checkPPPLegal('TX', 'INDIVIDUAL', 400_000, 1, 'FIXED');
    // Both should return valid result objects regardless
    expect(llc).toHaveProperty('allowed');
    expect(ind).toHaveProperty('allowed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 8. QUICK DSCR ESTIMATE — tier classification + validation guard
// ─────────────────────────────────────────────────────────────────────────────
describe('quickDscrEstimate', () => {
  it('returns LIKELY_QUALIFIES tier for strong deal', () => {
    // $400k, 75% LTV, $3,500/mo rent, 6.5% rate → should have comfortable buffer
    const result = quickDscrEstimate(400_000, 3_500, 6.5);
    expect(result.needsReview).toBe(false);
    expect(result.dscr).toBeGreaterThan(1.25);
    expect(result.tier).toBe('LIKELY_QUALIFIES');
  });

  it('returns BORDERLINE tier for marginal deal', () => {
    // $400k, 75% LTV, $2,600/mo rent, 6.5% rate → borderline ~1.0–1.24
    const result = quickDscrEstimate(400_000, 2_600, 6.5);
    expect(result.needsReview).toBe(false);
    expect(result.dscr).toBeGreaterThanOrEqual(1.0);
    expect(result.dscr).toBeLessThan(1.25);
    expect(result.tier).toBe('BORDERLINE');
  });

  it('returns UNLIKELY tier for very low rent', () => {
    const result = quickDscrEstimate(600_000, 1_000, 7.0);
    expect(result.tier).toBe('UNLIKELY');
    expect(result.dscr).toBeLessThan(0.85);
  });

  it('returns needsReview=true for zero purchase price', () => {
    const result = quickDscrEstimate(0, 3_000, 6.5);
    expect(result.needsReview).toBe(true);
  });

  it('returns needsReview=true for negative rent', () => {
    const result = quickDscrEstimate(400_000, -100, 6.5);
    expect(result.needsReview).toBe(true);
  });

  it('marks malformed optional calculator parameters for review without non-finite output', () => {
    const results = [
      quickDscrEstimate(400_000, 3_000, 6.5, Number.POSITIVE_INFINITY),
      quickDscrEstimate(400_000, 3_000, 6.5, 0.75, Number.NaN),
      quickDscrEstimate(400_000, 3_000, 6.5, 0.75, 0.012, -0.005),
      quickDscrEstimate(400_000, 3_000, 6.5, 0.75, 0.012, 0.005, 0),
    ];

    for (const result of results) {
      expect(result.needsReview).toBe(true);
      expect(result.dscr).toBe(0);
      expect(result.pitia).toBe(0);
    }
  });

  it('marks an extreme but finite rate for review instead of treating a failed payment factor as qualification', () => {
    const result = quickDscrEstimate(400_000, 3_000, Number.MAX_VALUE);

    expect(result.needsReview).toBe(true);
    expect(result.dscr).toBe(0);
    expect(result.pitia).toBe(0);
  });

  it('does not auto-qualify subnormal rates or values below the automatic-decision floor', () => {
    const results = [
      quickDscrEstimate(400_000, 3_000, Number.MIN_VALUE),
      quickDscrEstimate(2, 3_000, 7),
    ];

    for (const result of results) {
      expect(result.needsReview).toBe(true);
      expect(result.dscr).toBe(0);
      expect(result.pitia).toBe(0);
      expect(result.tier).toBe('UNLIKELY');
    }
  });

  it('marks finite but out-of-domain quick-calculator inputs for review', () => {
    const invalidResults = [
      quickDscrEstimate(400_000, Number.MAX_VALUE, 7),
      quickDscrEstimate(400_000, 3_000, 7, Number.MIN_VALUE),
      quickDscrEstimate(400_000, 3_000, 7, 0.75, 0.012, 0.005, Number.MAX_VALUE),
    ];

    for (const result of invalidResults) {
      expect(result.needsReview).toBe(true);
      expect(result.dscr).toBe(0);
      expect(result.pitia).toBe(0);
    }
  });

  it('always includes a disclaimer string', () => {
    const result = quickDscrEstimate(400_000, 3_000, 6.5);
    expect(result.disclaimer).toContain('PRELIMINARY ESTIMATE');
    expect(result.disclaimer).toContain('not a pre-approval');
  });

  it('PITIA is a positive number for valid inputs', () => {
    const result = quickDscrEstimate(400_000, 3_000, 6.5);
    expect(result.pitia).toBeGreaterThan(0);
  });

  it('higher rent → higher DSCR (monotonic)', () => {
    const r1 = quickDscrEstimate(400_000, 2_500, 6.5);
    const r2 = quickDscrEstimate(400_000, 3_500, 6.5);
    expect(r2.dscr).toBeGreaterThan(r1.dscr);
  });

  it('modal alignment: at 0.5%/yr insurance, DSCR is lower than at 0.35%/yr', () => {
    // Engine default (0.5%) is more conservative than the modal's 0.35%
    const engine = quickDscrEstimate(400_000, 3_000, 6.5, 0.75, 0.012, 0.005);
    const modal  = quickDscrEstimate(400_000, 3_000, 6.5, 0.75, 0.012, 0.0035);
    expect(engine.dscr).toBeLessThan(modal.dscr);
    // Delta must be meaningful (the 0.15% insurance difference matters)
    expect(modal.dscr - engine.dscr).toBeGreaterThan(0.01);
  });

  it('solveDSCR returns NEEDS_REVIEW verdict on zero purchasePrice', () => {
    const { property, borrower, loan, strategy } = buildEngineInputs({
      purchasePrice: 0,  // invalid
      monthlyRent: 3_000,
      state: 'TX',
    });
    // Override purchasePrice to 0 after buildEngineInputs (it floors to 0)
    property.purchasePrice = 0;
    const result = solveDSCR(property, borrower, loan, strategy);
    expect(result.dscr).toBe(0);
    expect(result.dualTrackDSCR.verdict.summary).toContain('NEEDS_REVIEW');
  });

  it('fails closed with finite values when direct engine inputs bypass request validation', () => {
    const { property, borrower, loan, strategy } = buildEngineInputs({
      purchasePrice: 400_000,
      monthlyRent: 3_000,
      state: 'TX',
    });
    property.marketRent = Number.NaN;
    borrower.ficoScore = Number.POSITIVE_INFINITY;
    loan.lenderFees = -1;

    const result = solveDSCR(property, borrower, loan, strategy);
    const numericResult = JSON.stringify(result, (_key, value) =>
      typeof value === 'number' && !Number.isFinite(value) ? 'NON_FINITE' : value,
    );

    expect(result.dscr).toBe(0);
    expect(result.dualTrackDSCR.verdict.summary).toContain('NEEDS_REVIEW');
    expect(numericResult).not.toContain('NON_FINITE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. REGRESSION — values must not change between builds
// ─────────────────────────────────────────────────────────────────────────────
describe('regression — golden output snapshots', () => {
  it('$300k loan @ 7.00%/30yr → PI = $1,995.91 (±$1)', () => {
    expect(calculatePI(300_000, 7.0, 360)).toBeCloseTo(1995.91, 0);
  });

  it('$300k loan @ 8.25%/30yr → PI = $2,253.81 (±$1)', () => {
    expect(calculatePI(300_000, 8.25, 360)).toBeCloseTo(2253.81, 0);
  });

  it('flagship deal-break rate is above the solved rate and below 12% usury red-line', () => {
    const { property, borrower, loan, strategy } = buildEngineInputs({
      purchasePrice: 400_000,
      monthlyRent: 3_000,
      state: 'TX',
      ltv: 75,
      ficoScore: 740,
    });
    const result = solveDSCR(property, borrower, loan, strategy);
    // Deal-break rate must be above the solved market rate
    expect(result.dealBreakRate).toBeGreaterThan(result.solvedRate);
    // Must be below the 12.00% usury red-line documented in the engine
    expect(result.dealBreakRate).toBeLessThan(12.0);
  });
});
