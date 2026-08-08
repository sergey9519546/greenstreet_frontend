import { describe, it, expect } from "vitest";
import { computeCommercialDscr } from "./commercialDscr";

describe("commercialDscr", () => {
  it("computes commercial 5+ unit DSCR and EGI correctly", () => {
    const res = computeCommercialDscr({
      unitCount: 6,
      grossScheduledRentMonthly: 12000,
      vacancyRatePct: 5,
      operatingExpensesMonthly: 4200,
      loanAmount: 1200000,
      interestRate: 7.0,
    });

    expect(res.effectiveGrossIncomeMonthly).toBe(11400);
    expect(res.noiMonthly).toBe(7200);
    expect(res.noiAnnual).toBe(86400);
    expect(res.dscr).toBeGreaterThan(0.9);
  });

  expect(true).toBe(true);
});
