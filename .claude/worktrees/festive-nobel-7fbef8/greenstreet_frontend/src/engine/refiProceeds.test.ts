import { describe, it, expect } from "vitest";
import { computeRefiProceedsGap } from "./refiProceeds";

describe("computeRefiProceedsGap", () => {
  it("LTV is the ceiling at 75% of value when rent is ample", () => {
    const r = computeRefiProceedsGap({ propertyValue: 200_000, currentBalance: 120_000, qualifyingRent: 5000, escrowsMonthly: 500, newRate: 7.5 });
    expect(r.maxLoanByLtv).toBe(150_000);
    expect(r.bindingConstraint).toBe("LTV");
    expect(r.maxNewLoan).toBe(150_000);
  });

  it("DSCR binds when rent is thin relative to value", () => {
    const r = computeRefiProceedsGap({ propertyValue: 500_000, currentBalance: 200_000, qualifyingRent: 2500, escrowsMonthly: 600, newRate: 7.5 });
    expect(r.bindingConstraint).toBe("DSCR");
    expect(r.maxNewLoan).toBeLessThan(r.maxLoanByLtv);
    expect(r.maxNewLoan).toBe(r.maxLoanByDscr);
  });

  it("flags a proceeds gap (cash to close) when the max new loan can't retire the balance", () => {
    const r = computeRefiProceedsGap({ propertyValue: 380_000, currentBalance: 300_000, qualifyingRent: 6000, escrowsMonthly: 700, newRate: 7.0 });
    expect(r.maxNewLoan).toBe(285_000); // LTV-bound at 75%
    expect(r.canRetireBalance).toBe(false);
    expect(r.proceedsGap).toBe(15_000); // 300k − 285k
    expect(r.cashOutAvailable).toBe(0);
  });

  it("reports cash-out capacity when the refi over-covers the balance", () => {
    const r = computeRefiProceedsGap({ propertyValue: 500_000, currentBalance: 250_000, qualifyingRent: 6000, escrowsMonthly: 700, newRate: 7.0 });
    expect(r.canRetireBalance).toBe(true);
    expect(r.proceedsGap).toBeLessThan(0);
    expect(r.cashOutAvailable).toBe(-r.proceedsGap);
    expect(r.cashOutAvailable).toBeGreaterThan(0);
  });

  it("respects a tighter cash-out LTV cap", () => {
    const r = computeRefiProceedsGap({ propertyValue: 400_000, currentBalance: 250_000, qualifyingRent: 9000, escrowsMonthly: 600, newRate: 7.0, maxLtvPct: 70 });
    expect(r.maxLoanByLtv).toBe(280_000);
  });
});
