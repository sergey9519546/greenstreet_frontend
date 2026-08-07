import { describe, it, expect } from "vitest";
import { computeLossScenarios, computeExpenseBreakeven } from "./lossFraming";

describe("computeLossScenarios", () => {
  const input = { monthlyRent: 2800, monthlyPITIA: 2546, monthlyTax: 350, monthlyInsurance: 200 };

  it("frames a rent −10% shock as a concrete monthly + annual shortfall", () => {
    const s = computeLossScenarios(input).find((x) => x.label === "Rent −10%")!;
    // rent 2520 vs PITIA 2546 → −$26/mo → DSCR 0.99
    expect(s.newDSCR).toBeCloseTo(0.99, 2);
    expect(s.monthlyCashFlow).toBe(-26);
    expect(s.monthlyShortfall).toBe(26);
    expect(s.annualOutOfPocket).toBe(312);
  });

  it("a healthy rent −5% can still be cash-flow positive (no shortfall)", () => {
    const s = computeLossScenarios(input).find((x) => x.label === "Rent −5%")!;
    expect(s.monthlyCashFlow).toBeGreaterThan(0);
    expect(s.monthlyShortfall).toBe(0);
    expect(s.annualOutOfPocket).toBe(0);
  });

  it("insurance +30% only moves PITIA, not rent", () => {
    const s = computeLossScenarios(input).find((x) => x.label === "Insurance +30%")!;
    // PITIA 2546 + 60 = 2606 → DSCR 2800/2606
    expect(s.newDSCR).toBeCloseTo(2800 / 2606, 3);
  });

  it("returns nothing for degenerate inputs", () => {
    expect(computeLossScenarios({ monthlyRent: 0, monthlyPITIA: 2000, monthlyTax: 0, monthlyInsurance: 0 })).toEqual([]);
  });
});

describe("computeExpenseBreakeven", () => {
  it("insurance break-even = rent − P&I − tax − hoa (DSCR 1.0)", () => {
    // rent 2800, P&I 1996, tax 350, hoa 0 → max ins 454/mo
    const r = computeExpenseBreakeven(2800, 1996, 350, 200, 0);
    expect(r.maxMonthlyInsurance).toBeCloseTo(454, 0);
    expect(r.maxMonthlyTax).toBeCloseTo(604, 0); // 2800 − 1996 − 200
  });

  it("floors at 0 when already underwater", () => {
    const r = computeExpenseBreakeven(2000, 1996, 350, 200, 0);
    expect(r.maxMonthlyInsurance).toBe(0);
  });
});
