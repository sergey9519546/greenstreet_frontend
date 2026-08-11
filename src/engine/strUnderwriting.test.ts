import { describe, it, expect } from "vitest";
import {
  computeSTRMonthlySeasonality,
  checkSTRLegality,
  getSTRDocumentationChecklist,
  evaluateSTRUnderwriting,
  US_NATIONAL_STR_SEASONALITY,
} from "./strUnderwriting";
import { buildEngineInputs } from "./inputs";

describe("computeSTRMonthlySeasonality", () => {
  it("returns 12 months with July as the seasonal peak", () => {
    const s = computeSTRMonthlySeasonality(120_000, 3_000);
    expect(s.months).toHaveLength(12);
    expect(s.bestMonth).toBe("Jul"); // index 140 is the highest
    const jul = s.months.find((m) => m.month === "Jul")!;
    expect(jul.seasonalityIndex).toBe(140);
  });

  it("distributes annual revenue across months proportional to the index", () => {
    const s = computeSTRMonthlySeasonality(120_000, 3_000, 0); // no haircut
    const total = s.months.reduce((sum, m) => sum + m.projectedRevenue, 0);
    expect(total).toBeCloseTo(120_000, -2); // ~120k up to rounding
  });

  it("applies the haircut to net revenue", () => {
    const s = computeSTRMonthlySeasonality(120_000, 3_000, 20);
    expect(s.annualRevenueHaircut).toBeLessThan(s.annualRevenueProjected);
  });

  it("flags off-season months below 1.0 DSCR", () => {
    const s = computeSTRMonthlySeasonality(120_000, 12_000); // high PITIA → weak months
    expect(s.offSeasonMonths.length).toBeGreaterThan(0);
    expect(s.worstMonthDSCR).toBeLessThanOrEqual(s.bestMonthDSCR);
  });

  it("US national index has 12 months peaking in summer", () => {
    expect(US_NATIONAL_STR_SEASONALITY).toHaveLength(12);
    const peak = Math.max(...US_NATIONAL_STR_SEASONALITY.map((m) => m.index));
    expect(US_NATIONAL_STR_SEASONALITY.find((m) => m.index === peak)!.month).toBe("Jul");
  });

  it("falls back to the national baseline for empty or malformed seasonality", () => {
    const empty = computeSTRMonthlySeasonality(120_000, 3_000, 20, []);
    const malformed = computeSTRMonthlySeasonality(
      120_000,
      3_000,
      20,
      [{ month: "Jan", index: Number.NaN }] as any,
    );

    expect(empty.months).toHaveLength(12);
    expect(malformed.months).toHaveLength(12);
    expect(empty.warningMessage).toMatch(/national baseline/i);
    expect(malformed.warningMessage).toMatch(/national baseline/i);
  });

  it("reports incomplete seasonality with only finite metrics for invalid numeric inputs", () => {
    const result = computeSTRMonthlySeasonality(Number.POSITIVE_INFINITY, Number.NaN, 250);
    const numericValues: number[] = [];
    const collectNumbers = (value: unknown) => {
      if (typeof value === "number") numericValues.push(value);
      else if (Array.isArray(value)) value.forEach(collectNumbers);
      else if (value && typeof value === "object") Object.values(value).forEach(collectNumbers);
    };

    collectNumbers(result);
    expect(numericValues.every(Number.isFinite)).toBe(true);
    expect(result.warningMessage).toMatch(/0% to 100%/i);
    expect(result.warningMessage).toMatch(/incomplete|unknown/i);
  });
});

describe("checkSTRLegality", () => {
  it("HOA prohibition disables all STR income", () => {
    const g = checkSTRLegality("TX", "Austin", "PROHIBITS", true, true, 0, false, "LOW", false);
    expect(g.status).toBe("PROHIBITED");
    expect(g.incomeEnabled).toBe(false);
  });

  it("silent HOA governing docs trigger UNCERTAIN (attorney review)", () => {
    const g = checkSTRLegality("TX", "Austin", "SILENT", true, true, 0, false, "LOW", false);
    expect(g.status).toBe("UNCERTAIN");
    expect(g.incomeEnabled).toBe(false);
  });

  it("high enforcement without a permit is prohibited", () => {
    const g = checkSTRLegality("TX", "Austin", "ALLOWS", false, true, 0, false, "HIGH", false);
    expect(g.status).toBe("PROHIBITED");
  });

  it("clean profile is CLEAR with income enabled", () => {
    const g = checkSTRLegality("TX", "Austin", "ALLOWS", true, true, 0, false, "LOW", false);
    expect(g.status).toBe("CLEAR");
    expect(g.incomeEnabled).toBe(true);
  });
});

describe("getSTRDocumentationChecklist", () => {
  it("lists documents with required flags", () => {
    const list = getSTRDocumentationChecklist();
    expect(list.length).toBeGreaterThan(5);
    expect(list.some((d) => d.required && /1007/.test(d.item))).toBe(true);
  });
});

describe("evaluateSTRUnderwriting", () => {
  const { property } = buildEngineInputs({
    purchasePrice: 500_000,
    monthlyRent: 3_000,
    state: "TX",
    strategy: "STR",
    marketRent: 3_000,
    strProjectedRent: 6_000,
    strDocumentedRent: 5_000,
    hoaSTRPolicy: "ALLOWS",
  });

  it("computes three independent worlds with the documented haircut lower than projected", () => {
    const r = evaluateSTRUnderwriting(property, 350_000, 7, 30, "NONE", 6_000, 2_500, 0, 0);
    expect(r.world1_LTR.haircutPercent).toBe(0);
    expect(r.world2_Projected.haircutPercent).toBe(20);
    expect(r.world3_Documented.haircutPercent).toBe(10);
    // World 2 net = 6000 × 0.80, World 3 net = 5000 × 0.90
    expect(r.world2_Projected.netIncome).toBeCloseTo(4_800, 0);
    expect(r.world3_Documented.netIncome).toBeCloseTo(4_500, 0);
  });

  it("selects the most conservative (MIN) qualifying rent across worlds", () => {
    const r = evaluateSTRUnderwriting(property, 350_000, 7, 30, "NONE", 6_000, 2_500, 0, 0);
    const min = Math.min(
      r.world1_LTR.qualifyingRent,
      r.world2_Projected.qualifyingRent,
      r.world3_Documented.qualifyingRent,
    );
    expect(r.bestQualifyingRent).toBe(min);
  });

  it("uses the 1007 market rent for a vacant property when no STR income is available", () => {
    const r = evaluateSTRUnderwriting(
      {
        ...property,
        leaseRent: 0,
        marketRent: 3_000,
        strProjectedRent: 0,
        strDocumentedRent: 0,
      },
      350_000,
      7,
      30,
      "NONE",
      6_000,
      2_500,
      0,
      0,
    );

    expect(r.world1_LTR.qualifyingRent).toBe(3_000);
    expect(r.bestQualifyingRent).toBe(3_000);
    expect(r.bestWorld).toBe(r.world1_LTR.name);
  });

  it("includes the legality gate, checklist, and monthly seasonality", () => {
    const r = evaluateSTRUnderwriting(property, 350_000, 7, 30, "NONE", 6_000, 2_500, 0, 0);
    expect(r.legalityGate).toBeDefined();
    expect(r.documentationChecklist.length).toBeGreaterThan(0);
    expect(r.monthlySeasonality.months).toHaveLength(12);
  });

  it("excludes missing documented history instead of letting zero govern", () => {
    const r = evaluateSTRUnderwriting(
      { ...property, strDocumentedRent: 0 },
      350_000,
      7,
      30,
      "NONE",
      6_000,
      2_500,
      0,
      0,
    );

    expect(r.world3_Documented.qualifyingRent).toBe(0);
    expect(r.world3_Documented.method).toMatch(/excluded rather than treated as \$0/i);
    expect(r.bestQualifyingRent).toBeGreaterThan(0);
    expect(r.bestWorld).not.toBe(r.world3_Documented.name);
  });

  it("returns an incomplete, finite result for impossible payment inputs", () => {
    const r = evaluateSTRUnderwriting(
      property,
      Number.POSITIVE_INFINITY,
      Number.NaN,
      0,
      "NONE",
      Number.NaN,
      2_500,
      0,
      0,
    );
    const numericValues: number[] = [];
    const collectNumbers = (value: unknown) => {
      if (typeof value === "number") numericValues.push(value);
      else if (Array.isArray(value)) value.forEach(collectNumbers);
      else if (value && typeof value === "object") Object.values(value).forEach(collectNumbers);
    };

    collectNumbers(r);
    expect(numericValues.every(Number.isFinite)).toBe(true);
    expect(r.bestQualifyingRent).toBe(0);
    expect(r.bestWorld).toMatch(/^Incomplete/);
  });

  it("does not select qualifying STR income for sub-floor loans or rates", () => {
    const results = [
      evaluateSTRUnderwriting(property, 2, 7, 30, "NONE", 0, 0, 0, 0),
      evaluateSTRUnderwriting(property, 350_000, 0, 30, "NONE", 0, 0, 0, 0),
      evaluateSTRUnderwriting(property, 350_000, Number.MIN_VALUE, 30, "NONE", 0, 0, 0, 0),
    ];

    for (const result of results) {
      const numericValues: number[] = [];
      const collectNumbers = (value: unknown) => {
        if (typeof value === "number") numericValues.push(value);
        else if (Array.isArray(value)) value.forEach(collectNumbers);
        else if (value && typeof value === "object") Object.values(value).forEach(collectNumbers);
      };

      collectNumbers(result);
      expect(result.bestQualifyingRent).toBe(0);
      expect(result.bestWorld).toMatch(/^Incomplete/);
      expect(numericValues.every(Number.isFinite)).toBe(true);
    }
  });
});
