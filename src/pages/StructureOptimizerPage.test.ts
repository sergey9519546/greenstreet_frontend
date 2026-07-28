import { describe, expect, it } from "vitest";
import { compareLoanStructures } from "./StructureOptimizerPage";

describe("compareLoanStructures", () => {
  it("uses one entered rate and returns internally consistent payment coverage", () => {
    const results = compareLoanStructures({
      loanAmount: 300_000,
      annualRatePct: 7,
      monthlyRent: 3_000,
      monthlyNonDebtCosts: 500,
    });

    expect(results).toHaveLength(3);
    for (const result of results) {
      expect(result.dscr).toBeCloseTo(3_000 / result.fullMonthlyPayment, 8);
    }
    expect(results[2].principalPaidAfterFiveYears).toBe(0);
    expect(results[1].monthlyPrincipalAndInterest).toBeLessThan(results[0].monthlyPrincipalAndInterest);
  });
});
