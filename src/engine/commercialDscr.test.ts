import { describe, it, expect } from 'vitest';
import { computeCommercialDscr } from './commercialDscr';

describe('computeCommercialDscr', () => {
  it('computes NOI ÷ annual debt service with explicit opex', () => {
    const r = computeCommercialDscr({
      grossRentAnnual: 120_000,
      vacancyPct: 5,
      operatingExpensesAnnual: 40_000,
      loanAmount: 800_000,
      rate: 6.5,
      termYears: 30,
    });
    // EGI = 120k × 0.95 = 114,000; NOI = 114,000 − 40,000 = 74,000
    expect(r.effectiveGrossIncome).toBe(114_000);
    expect(r.noiAnnual).toBe(74_000);
    // annual P&I on 800k @6.5%/30y ≈ 60,676 → DSCR ≈ 1.22
    expect(r.dscr).toBeGreaterThan(1.19);
    expect(r.dscr).toBeLessThan(1.25);
    expect(r.disposition).toBe('MARGINAL');
  });

  it('derives opex from expense ratio when not given', () => {
    const r = computeCommercialDscr({
      grossRentAnnual: 100_000,
      vacancyPct: 0,
      expenseRatioPct: 40,
      loanAmount: 500_000,
      rate: 6,
    });
    expect(r.operatingExpenses).toBe(40_000);
    expect(r.noiAnnual).toBe(60_000);
    expect(r.expenseRatioPct).toBe(40);
    expect(r.noiSanity).toBe('PLAUSIBLE');
  });

  it('flags understated expenses below 30% ratio', () => {
    const r = computeCommercialDscr({
      grossRentAnnual: 100_000,
      vacancyPct: 0,
      operatingExpensesAnnual: 20_000, // 20% ratio — implausibly lean for 5+ unit
      loanAmount: 400_000,
      rate: 6,
    });
    expect(r.noiSanity).toBe('EXPENSES_LIKELY_UNDERSTATED');
  });

  it('passes a well-covered deal and fails a thin one', () => {
    const pass = computeCommercialDscr({
      grossRentAnnual: 200_000,
      operatingExpensesAnnual: 60_000,
      loanAmount: 900_000,
      rate: 6,
    });
    expect(pass.disposition).toBe('PASS');

    const fail = computeCommercialDscr({
      grossRentAnnual: 80_000,
      operatingExpensesAnnual: 40_000,
      loanAmount: 600_000,
      rate: 8,
    });
    expect(fail.disposition).toBe('FAIL');
  });

  it('handles zero debt service without dividing by zero', () => {
    const r = computeCommercialDscr({
      grossRentAnnual: 100_000,
      loanAmount: 0,
      rate: 6,
    });
    expect(r.dscr).toBe(0);
  });
});
