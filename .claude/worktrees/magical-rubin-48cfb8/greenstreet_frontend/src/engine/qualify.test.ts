import { describe, it, expect } from "vitest";
import { qualify, amortize, loanForPayment, type QualifyInput } from "./qualify";

// Strong, clean deal: SFR purchase, ample rent, high FICO, moderate LTV.
const base: QualifyInput = {
  propertyType: "sfr",
  purpose: "purchase",
  value: 300_000,
  loanAmount: 210_000, // 70% LTV
  rent: 2600,
  taxesAnnual: 3000,
  insuranceAnnual: 1200,
  ficoBand: "760-plus",
  investmentConfirmed: true,
};

describe("amortize / loanForPayment", () => {
  it("amortize matches the standard mortgage formula", () => {
    // $200k @ 6% / 30yr ≈ $1199.10
    expect(amortize(200_000, 0.06)).toBeCloseTo(1199.1, 0);
  });

  it("zero-rate amortization is straight-line", () => {
    expect(amortize(360_000, 0)).toBeCloseTo(1000, 6);
  });

  it("loanForPayment is the inverse of amortize", () => {
    const pmt = amortize(250_000, 0.07);
    expect(loanForPayment(pmt, 0.07)).toBeCloseTo(250_000, 0);
  });

  it("non-positive inputs return zero", () => {
    expect(amortize(0, 0.07)).toBe(0);
    expect(loanForPayment(0, 0.07)).toBe(0);
  });
});

describe("qualify — outcomes", () => {
  it("a strong deal likely qualifies with DSCR ≥ 1.10", () => {
    const r = qualify(base);
    expect(r.ltv).toBeCloseTo(0.7, 6);
    expect(r.dscr).toBeGreaterThanOrEqual(1.1);
    expect(r.outcome).toBe("likely-qualifies");
    expect(r.rentGap).toBe(0);
  });

  it("owner-occupied intent is ineligible", () => {
    const r = qualify({ ...base, investmentConfirmed: false });
    expect(r.outcome).toBe("ineligible");
  });

  it("FICO below 660 is not-currently", () => {
    const r = qualify({ ...base, ficoBand: "under-660" });
    expect(r.outcome).toBe("not-currently");
    expect(r.reasons.join(" ")).toMatch(/660/);
  });

  it("thin rent drops DSCR and flags a rent gap with a lever", () => {
    const r = qualify({ ...base, rent: 1400 });
    expect(r.dscr).toBeLessThan(1.1);
    expect(r.rentGap).toBeGreaterThan(0);
    expect(r.levers.some((l) => l.id === "rent")).toBe(true);
  });

  it("5-8 unit routes to human review", () => {
    const r = qualify({ ...base, propertyType: "5-8-unit" });
    expect(r.outcome).toBe("requires-review");
    expect(r.needsHumanReview).toBe(true);
  });

  it("cash-out uses the tighter 75% LTV cap", () => {
    // 78% LTV cash-out is over the 75 cap (within slack → review, not hard fail)
    const r = qualify({ ...base, purpose: "cash-out", loanAmount: 234_000 });
    expect(r.outcome).toBe("requires-review");
    expect(r.reasons.join(" ")).toMatch(/cap/i);
  });

  it("min-rent floor is below the standard target", () => {
    const r = qualify(base);
    expect(r.minRentFloor).toBeLessThan(r.minRentStandard);
    expect(r.minRentStandard).toBeCloseTo(r.pitia * 1.1, 6);
  });
});
