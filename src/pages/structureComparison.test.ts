import { describe, expect, it } from "vitest";
import { compareLoanStructures } from "./structureComparison";

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
});
