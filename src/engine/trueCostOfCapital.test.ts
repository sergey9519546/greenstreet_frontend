import { describe, it, expect } from "vitest";
import { computeTrueCost, compareTrueCost, type LoanCostQuote } from "./trueCostOfCapital";

const LOAN = 300_000;
// Behavioral §6: Loan A lower rate but prepay + high fees; Loan B higher rate, open, low fees.
const loanA: LoanCostQuote = { label: "A — 7.5% / 2-1-1 prepay", rate: 7.5, points: 1, fees: 8000, prepayType: "321" };
const loanB: LoanCostQuote = { label: "B — 7.875% open", rate: 7.875, points: 0, fees: 5000, prepayType: "NONE" };

describe("computeTrueCost", () => {
  it("all-in cost = interest + upfront + prepay (reuses amortization)", () => {
    const r = computeTrueCost(LOAN, loanA, 3);
    expect(r.upfront).toBe(3000 + 8000); // 1 point + $8k
    expect(r.prepayPenalty).toBeGreaterThan(0); // 321 → year-3 penalty on balance
    expect(r.totalCost).toBe(r.interestPaid + r.upfront + r.prepayPenalty);
  });

  it("no-prepay loan has zero prepay penalty at any hold", () => {
    expect(computeTrueCost(LOAN, loanB, 3).prepayPenalty).toBe(0);
  });

  it("uses the first penalty year and exact payment months for a sub-year hold", () => {
    const sixMonths = computeTrueCost(LOAN, loanA, 0.5);
    expect(sixMonths.holdYears).toBe(0.5);
    expect(sixMonths.interestPaid).toBeGreaterThan(0);
    expect(sixMonths.prepayPenalty).toBeGreaterThan(0);
  });
});

describe("compareTrueCost — the rate-myopia trap", () => {
  it("over a 3yr hold, the lower-rate loan can cost MORE (prepay + fees)", () => {
    const c = compareTrueCost(LOAN, [loanA, loanB], 3);
    // Lowest rate is A (7.5%); but cheapest all-in should be B.
    expect(c.lowestRateLabel).toContain("A");
    expect(c.cheapest.label).toContain("B");
    expect(c.savingsVsLowestRate).toBeGreaterThan(0);
  });

  it("ranks cheapest-total-cost first (choice-architecture default sort)", () => {
    const c = compareTrueCost(LOAN, [loanA, loanB], 3);
    expect(c.ranked[0].totalCost).toBeLessThanOrEqual(c.ranked[1].totalCost);
  });

  it("rejects an empty quote list instead of dereferencing an absent winner", () => {
    expect(() => compareTrueCost(LOAN, [], 3)).toThrow(/at least one valid loan quote/i);
  });
});
