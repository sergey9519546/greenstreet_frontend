import { describe, it, expect } from 'vitest';
import { analyzePortfolio, computePortfolioAggregates, computePortfolioHealthScore } from './portfolio';
import type { PortfolioProperty, BorrowerProfile } from './types';

function prop(over: Partial<PortfolioProperty>): PortfolioProperty {
  return {
    id: Math.random().toString(36).slice(2),
    name: 'P',
    address: '',
    monthlyPITIA: 2000,
    monthlyRent: 3000,
    lender: 'Kiavi',
    loanBalance: 300_000,
    dscr: 1.3,
    track2DSCR: 1.1,
    isBlanket: false,
    ...over,
  };
}

// borrower is unused by analyzePortfolio's body; safe to stub.
const borrower = {} as BorrowerProfile;

describe('analyzePortfolio', () => {
  it('sums totals and uses ΣNOI/ΣDS (never averages)', () => {
    const r = analyzePortfolio([prop({}), prop({})], null, borrower, 1_000_000);
    expect(r.totalPITIA).toBe(4000);
    expect(r.totalRent).toBe(6000);
    expect(r.globalDSCR).toBeGreaterThan(0);
    expect(r.blanketLoanWarning).toBeNull();
  });

  it('fires a CRITICAL blanket-loan warning when any property is blanket', () => {
    const r = analyzePortfolio([prop({ isBlanket: true })], null, borrower, 0);
    expect(r.blanketLoanWarning).toMatch(/CRITICAL/);
  });

  it('flags lender concentration above 50% across ≥3 properties', () => {
    const props = [prop({ lender: 'Kiavi' }), prop({ lender: 'Kiavi' }), prop({ lender: 'Defy' })];
    const r = analyzePortfolio(props, null, borrower, 0);
    expect(r.lenderConcentration.topLender).toBe('Kiavi');
    expect(r.lenderConcentration.topLenderCount).toBe(2);
    expect(r.lenderConcentration.warning).toMatch(/Counterparty risk/);
  });

  it('does not warn on a diversified 2-lender, 2-property book', () => {
    const r = analyzePortfolio([prop({ lender: 'Kiavi' }), prop({ lender: 'Defy' })], null, borrower, 0);
    expect(r.lenderConcentration.warning).toBeNull();
  });
});

describe('computePortfolioAggregates', () => {
  it('makes every aggregate unavailable and zero after the final property is removed', () => {
    expect(computePortfolioAggregates([])).toEqual({
      hasProperties: false,
      blend: 0,
      equity: 0,
      totCash: 0,
      wRate: 0,
      totBal: 0,
    });
  });

  it('preserves the established blended portfolio calculations', () => {
    const result = computePortfolioAggregates([
      { value: 200_000, balance: 100_000, rate: 6, rent: 2_000, pitia: 1_000, cf: 1_000 },
      { value: 300_000, balance: 200_000, rate: 9, rent: 3_000, pitia: 2_000, cf: 1_000 },
    ]);

    expect(result).toEqual({
      hasProperties: true,
      blend: 5 / 3,
      equity: 200_000,
      totCash: 2_000,
      wRate: 8,
      totBal: 300_000,
    });
  });
});

describe('computePortfolioHealthScore', () => {
  const base = {
    globalDSCR: 1.6,
    totalPITIA: 2000,
    reserveShortfall: 0,
    lenderConcentration: { warning: null },
    geographicConcentration: { warning: null },
    negativeCashFlowProperties: { count: 0 },
  } as unknown as ReturnType<typeof analyzePortfolio>;

  it('remains compatible with a clean legacy fixture that lacks properties', () => {
    const h = computePortfolioHealthScore(base);
    expect(h.score).toBe(100);
    expect(h.label).toBe('STRONG');
  });

  it('gives an explicitly empty analyzed portfolio an honest zero score', () => {
    const empty = analyzePortfolio([], null, borrower, 0);

    expect(computePortfolioHealthScore(empty)).toEqual({
      score: 0,
      label: 'CRITICAL',
      color: '#e06363',
      breakdown: { dscrPts: 0, concentrationPts: 0, cashFlowPts: 0, reservePts: 0 },
    });
  });

  it('scores a distressed book 0 / CRITICAL', () => {
    const bad = {
      ...base,
      globalDSCR: 0.9,
      reserveShortfall: 2000 * 10,
      lenderConcentration: { warning: 'x' },
      geographicConcentration: { warning: 'x' },
      negativeCashFlowProperties: { count: 3 },
    } as unknown as ReturnType<typeof analyzePortfolio>;
    const h = computePortfolioHealthScore(bad);
    expect(h.score).toBe(0);
    expect(h.label).toBe('CRITICAL');
  });

  it('partial-credit: strong DSCR, one concentration warning, one negative-CF', () => {
    const mid = {
      ...base,
      globalDSCR: 1.3, // 30
      lenderConcentration: { warning: 'x' }, // 0
      geographicConcentration: { warning: null }, // 10
      negativeCashFlowProperties: { count: 1 }, // 12
      reserveShortfall: 0, // 20
    } as unknown as ReturnType<typeof analyzePortfolio>;
    const h = computePortfolioHealthScore(mid);
    expect(h.breakdown).toEqual({ dscrPts: 30, concentrationPts: 10, cashFlowPts: 12, reservePts: 20 });
    expect(h.score).toBe(72);
    expect(h.label).toBe('HEALTHY');
  });
});
