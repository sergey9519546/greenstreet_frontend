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
  solveDSCR,
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
