import { describe, expect, it } from "vitest";
import { qualify, type QualifyInput } from "./qualify";

const BASE_INPUT: QualifyInput = {
  propertyType: "sfr",
  purpose: "purchase",
  state: "Texas",
  stateTier: 0,
  value: 425_000,
  loanAmount: 318_750,
  rent: 3_000,
  annualRatePct: 7,
  ficoBand: "720-759",
  borrowerType: "entity",
  investmentConfirmed: true,
};

describe("qualify entered financing terms", () => {
  it("uses the entered loan amount and rate for the displayed PITIA and DSCR", () => {
    const result = qualify(BASE_INPUT);

    expect(result.pitia).toBeGreaterThan(0);
    expect(result.dscr).toBeCloseTo(BASE_INPUT.rent / result.pitia, 10);
    expect(result.dscr).toBeCloseTo(1.10, 2);
  });

  it("improves DSCR when the requested loan amount decreases", () => {
    const baseline = qualify(BASE_INPUT);
    const lowerLoan = qualify({
      ...BASE_INPUT,
      loanAmount: 275_000,
    });

    expect(lowerLoan.piMonthly).toBeLessThan(baseline.piMonthly);
    expect(lowerLoan.dscr).toBeGreaterThan(baseline.dscr);
  });

  it("reduces DSCR when the entered note rate increases", () => {
    const baseline = qualify(BASE_INPUT);
    const higherRate = qualify({
      ...BASE_INPUT,
      annualRatePct: 8.5,
    });

    expect(higherRate.piMonthly).toBeGreaterThan(baseline.piMonthly);
    expect(higherRate.dscr).toBeLessThan(baseline.dscr);
  });
});
