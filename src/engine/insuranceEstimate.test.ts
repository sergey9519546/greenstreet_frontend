import { describe, it, expect } from "vitest";
import { estimateAnnualInsurance, insuranceRatePctOfValue } from "./insuranceEstimate";

describe("estimateAnnualInsurance", () => {
  it("FL $400k investor = (400×$10)×1.35 = $5,400", () => {
    expect(estimateAnnualInsurance("FL", 400_000, { isInvestor: true })).toBe(5400);
  });

  it("low-risk OH is far cheaper than FL, same coverage", () => {
    const fl = estimateAnnualInsurance("FL", 400_000);
    const oh = estimateAnnualInsurance("OH", 400_000);
    expect(fl).toBeGreaterThan(oh * 3);
  });

  it("flood zone VE and old age both raise the premium", () => {
    const base = estimateAnnualInsurance("TX", 400_000, { isInvestor: true });
    const flood = estimateAnnualInsurance("TX", 400_000, { isInvestor: true, floodZone: "VE" });
    const old = estimateAnnualInsurance("TX", 400_000, { isInvestor: true, yearBuilt: 1970 });
    expect(flood).toBeGreaterThan(base);
    expect(old).toBeGreaterThan(base);
  });

  it("unknown state falls back to national average (3.5)", () => {
    expect(estimateAnnualInsurance("ZZ", 100_000, { isInvestor: false })).toBe(350);
  });

  it("rate-as-%-of-value helper", () => {
    expect(insuranceRatePctOfValue("FL", { isInvestor: true })).toBeCloseTo(1.35, 1); // 10/1000×1.35 = 1.35%
    expect(insuranceRatePctOfValue("OH", { isInvestor: false })).toBeCloseTo(0.175, 1);
  });

  it("guards non-positive coverage", () => {
    expect(estimateAnnualInsurance("FL", 0)).toBe(0);
  });
});
