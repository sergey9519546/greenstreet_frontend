import { describe, it, expect } from 'vitest';
import { computeConstructionBridge } from './constructionBridge';

describe('computeConstructionBridge', () => {
  const base = {
    totalProjectCost: 1_000_000,
    loanAmount: 750_000,
    bridgeRate: 10,
    constructionMonths: 12,
    stabilizedRentMonthly: 7_000,
    stabilizedEscrowsMonthly: 1_200,
    exitRate: 6.5,
    exitTermYears: 30,
  };

  it('computes LTC and peak IO carry', () => {
    const r = computeConstructionBridge(base);
    expect(r.ltcPct).toBe(75);
    // IO on full 750k @10% = 750000 × 0.10/12 = 6,250
    expect(r.monthlyIOPaymentFull).toBe(6_250);
  });

  it('sizes interest reserve on 50% average draw', () => {
    const r = computeConstructionBridge(base);
    // 375k avg × 0.10/12 × 12 = 37,500
    expect(r.interestReserveNeeded).toBe(37_500);
  });

  it('computes stabilized exit DSCR against takeout PITIA', () => {
    const r = computeConstructionBridge(base);
    // takeout 750k @6.5%/30y ≈ 4,740 P&I + 1,200 escrow ≈ 5,940 → 7000/5940 ≈ 1.18
    expect(r.exitDscr).toBeGreaterThan(1.15);
    expect(r.exitDscr).toBeLessThan(1.22);
    expect(r.takeoutRetiresBridge).toBe(true);
    expect(r.viability).toBe('VIABLE');
  });

  it('flags SHORTFALL when takeout cannot retire the bridge', () => {
    const r = computeConstructionBridge({ ...base, takeoutLoanAmount: 600_000 });
    expect(r.takeoutRetiresBridge).toBe(false);
    expect(r.viability).toBe('SHORTFALL');
  });

  it('flags SHORTFALL when stabilized DSCR is under the floor', () => {
    const r = computeConstructionBridge({
      ...base,
      stabilizedRentMonthly: 4_500, // too thin to cover takeout
    });
    expect(r.exitDscr).toBeLessThan(1.0);
    expect(r.viability).toBe('SHORTFALL');
  });
});
