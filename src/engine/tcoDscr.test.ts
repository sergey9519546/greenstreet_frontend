import { describe, it, expect } from "vitest";
import { computeTcoRate, computeTcoDscr, mapToTcoType, tcoEquivalent } from "./tcoDscr";

describe("computeTcoRate", () => {
  it("SFR / average / normal / managed = 28% with CapEx broken out", () => {
    const r = computeTcoRate({ propertyType: "SFR" });
    expect(r.total).toBeCloseTo(0.28, 4);
    expect(r.capex).toBeCloseTo(0.05, 4);
    expect(r.vacancy).toBeCloseTo(0.07, 4);
  });

  it("self-managed caps management at the 5% implicit floor", () => {
    expect(computeTcoRate({ propertyType: "SFR", isSelfManaged: true }).management).toBeCloseTo(0.05, 4);
  });

  it("age + market adjustments stack (old + stress > base)", () => {
    const base = computeTcoRate({ propertyType: "SFR" }).total;
    const stressed = computeTcoRate({ propertyType: "SFR", propertyAge: "OLD", marketType: "STRESS" }).total;
    expect(stressed).toBeGreaterThan(base);
  });

  it("vacancy override (slider) replaces the table vacancy", () => {
    const r = computeTcoRate({ propertyType: "SFR", vacancyOverridePct: 15 });
    expect(r.vacancy).toBeCloseTo(0.15, 4);
  });

  it("STR/condotel is the heavy 63% bucket", () => {
    expect(computeTcoRate({ propertyType: "CONDOTEL" }).total).toBeCloseTo(0.63, 4);
  });
});

describe("mapToTcoType", () => {
  it("maps unit count + STR flag", () => {
    expect(mapToTcoType(1, false)).toBe("SFR");
    expect(mapToTcoType(3, false)).toBe("SMALL_MULTI");
    expect(mapToTcoType(6, false)).toBe("MED_MULTI");
    expect(mapToTcoType(1, true)).toBe("CONDOTEL");
  });
});

describe("computeTcoDscr — reproduces TCO doc §9 worked example", () => {
  // $350K, $2500 rent, P&I $1862.62, tax $350, ins $200, SFR 28%, $280K basis, 24%
  const r = computeTcoDscr({
    grossRent: 2500, principalAndInterest: 1862.62, propertyTax: 350, insurance: 200, hoa: 0,
    rateOpts: { propertyType: "SFR" }, depreciableBasis: 280000, marginalTaxRate: 0.24,
  });

  it("standard DSCR 1.036, Track-2 NOI/PITIA 0.746", () => {
    expect(r.standardDSCR).toBeCloseTo(1.036, 2);
    expect(r.tcoDSCR).toBeCloseTo(0.746, 2);
  });

  it("break-even rent $3,351 (PITIA / (1 − 0.28))", () => {
    expect(r.breakEvenRent).toBe(3351);
  });

  it("after-tax TCO-DSCR uses full PITIA and the depreciation shield", () => {
    expect(r.afterTaxTcoDSCR).toBeCloseTo(0.891, 2);
    expect(r.afterTaxTcoDSCR).toBeGreaterThan(r.tcoDSCR);
  });

  it("monthly deficit ≈ −$613 and CapEx is its own line", () => {
    expect(r.monthlyDeficit).toBe(-613);
    expect(r.components.capex).toBe(125); // 2500 × 0.05
  });
});

describe("tcoEquivalent", () => {
  it("1.25 standard ≈ 0.90 TCO at 28% (TCO §10.2)", () => {
    expect(tcoEquivalent(1.25, 0.28)).toBeCloseTo(0.9, 2);
  });
});

describe("extreme-input validation", () => {
  it("rejects finite PITIA components whose sum overflows", () => {
    expect(() => computeTcoDscr({
      grossRent: 3000,
      principalAndInterest: Number.MAX_VALUE,
      propertyTax: Number.MAX_VALUE,
      insurance: 0,
      hoa: 0,
    })).toThrow(RangeError);
  });
});
