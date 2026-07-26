import { describe, it, expect } from 'vitest';
import { analyzePortfolio, computePortfolioHealthScore } from './portfolio';
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

describe('computePortfolioHealthScore', () => {
  const base = {
    globalDSCR: 1.6,
    totalPITIA: 2000,
    reserveShortfall: 0,
    lenderConcentration: { warning: null },
    geographicConcentration: { warning: null },
    negativeCashFlowProperties: { count: 0 },
  } as unknown as ReturnType<typeof analyzePortfolio>;

  it('scores a clean book 100 / STRONG', () => {
    const h = computePortfolioHealthScore(base);
    expect(h.score).toBe(100);
    expect(h.label).toBe('STRONG');
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
