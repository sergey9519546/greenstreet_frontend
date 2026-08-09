import { describe, expect, it } from "vitest";
import {
  compareLoanStructures,
  STRUCTURE_COMPARISON_ASSUMPTIONS,
} from "./structureComparison";

describe("compareLoanStructures", () => {
  it("does not invent five-year IRR for structures the returns engine does not model", () => {
    const results = compareLoanStructures({
      purchasePrice: 500_000,
      downPaymentPct: 25,
      monthlyRent: 3_500,
      ficoScore: 740,
    });

    expect(results).toHaveLength(3);
    expect(results.find((result) => result.id === "fixed")?.afterTaxIrrPct).toEqual(
      expect.any(Number),
    );
    expect(results.find((result) => result.id === "interest-only")).toMatchObject({
      afterTaxIrrPct: null,
      deal: { monthlyPITIA: { isInterestOnly: true } },
    });
    expect(results.find((result) => result.id === "arm")?.afterTaxIrrPct).toBeNull();

    for (const result of results) {
      expect(Number.isFinite(result.cashOnCashPct)).toBe(true);
    }
  });

  it("derives cash-on-cash from expense-aware cash flow", () => {
    const results = compareLoanStructures({
      purchasePrice: 500_000,
      downPaymentPct: 25,
      monthlyRent: 3_500,
      ficoScore: 740,
    });

    for (const result of results) {
      const expenseAwareMonthlyCashFlow =
        result.deal.dualTrackDSCR.track2.monthlyCashFlow;
      const expected =
        (expenseAwareMonthlyCashFlow * 12 * 100) /
        result.deal.cashToClose.total;

      expect(result.cashOnCashPct).toBeCloseTo(expected, 10);
      expect(Math.sign(result.cashOnCashPct)).toBe(
        Math.sign(expenseAwareMonthlyCashFlow),
      );
    }

    expect(results.every((result) => result.cashOnCashPct < 0)).toBe(true);
  });

  it("publishes every material fixed scenario assumption", () => {
    expect(STRUCTURE_COMPARISON_ASSUMPTIONS).toEqual({
      state: "TX",
      propertyType: "SFR",
      annualPropertyTaxRatePct: 1.5,
      annualInsurance: 2_000,
      monthlyHoa: 0,
      exitCapRatePct: 6.5,
      holdYears: 5,
      taxProfile: "returns-engine-default",
    });
  });
});
