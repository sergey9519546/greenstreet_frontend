import { describe, it, expect } from "vitest";
import {
  normalizeDeal,
  dealToSearchParams,
  loadDealFromUrl,
  computeDealFixes,
  computeRescueAnalysis,
  computeAmortizationRescuePreview,
  DEFAULT_DEAL,
} from "./dealState";

describe("dealState", () => {
  it("normalizes and clamps wild inputs", () => {
    const d = normalizeDeal({
      price: -1,
      down: 99,
      rate: 50,
      stateCode: "texas",
      tab: "nope" as any,
    });
    expect(d.price).toBe(50_000);
    expect(d.down).toBe(60);
    expect(d.rate).toBe(15);
    expect(d.stateCode).toBe("TX");
    expect(d.tab).toBe("dscr");
  });

  it("round-trips via search params", () => {
    const deal = normalizeDeal({
      price: 510_000,
      down: 30,
      rent: 3_450,
      rate: 6.875,
      stateCode: "FL",
      taxAuto: false,
      tab: "maxprice",
      target: 1.25,
    });
    const qs = dealToSearchParams(deal).toString();
    const loaded = loadDealFromUrl("?" + qs);
    const again = normalizeDeal(loaded);
    expect(again.price).toBe(510_000);
    expect(again.down).toBe(30);
    expect(again.rent).toBe(3_450);
    expect(again.rate).toBe(6.875);
    expect(again.stateCode).toBe("FL");
    expect(again.taxAuto).toBe(false);
    expect(again.tab).toBe("maxprice");
    expect(again.target).toBe(1.25);
  });

  it("suggests fixes when DSCR is below 1.0", () => {
    const weak = normalizeDeal({
      price: 500_000,
      down: 20,
      rent: 2_200,
      rate: 7.5,
      tax: 8_000,
      ins: 3_000,
      hoa: 0,
    });
    const fixes = computeDealFixes(weak, { taxYr: 8_000, targetDscr: 1.0 });
    expect(fixes.length).toBeGreaterThan(0);
    expect(fixes.some((f) => f.id === "rent" || f.id === "price" || f.id === "down")).toBe(true);
  });

  it("returns no fixes when already strong", () => {
    const strong = normalizeDeal({
      ...DEFAULT_DEAL,
      price: 300_000,
      down: 30,
      rent: 4_000,
      rate: 6,
      tax: 3_000,
      ins: 1_200,
    });
    const fixes = computeDealFixes(strong, { taxYr: 3_000, targetDscr: 1.0 });
    expect(fixes).toEqual([]);
  });

  it("produces full rescue analysis for a failing deal", () => {
    const weak = normalizeDeal({
      price: 500_000,
      down: 20,
      rent: 2_200,
      rate: 7.5,
      tax: 8_000,
      ins: 3_000,
      hoa: 0,
    });
    const res = computeRescueAnalysis(weak, { taxYr: 8_000, targetDscr: 1.0 });
    expect(res).not.toBeNull();
    expect(res!.fixes.length).toBeGreaterThan(0);
    expect(res!.currentTrack1DSCR).toBeLessThan(1.0);
    expect(res!.best.cheapest).toBeTruthy();
  });

  it("returns null rescue when deal already clears target", () => {
    const strong = normalizeDeal({
      ...DEFAULT_DEAL,
      price: 300_000,
      down: 30,
      rent: 4_000,
      rate: 6,
      tax: 3_000,
      ins: 1_200,
    });
    expect(computeRescueAnalysis(strong, { taxYr: 3_000, targetDscr: 1.0 })).toBeNull();
  });

  it("derives 40-year and IO-recast payments from the current deal inputs", () => {
    const preview = computeAmortizationRescuePreview(
      normalizeDeal({ ...DEFAULT_DEAL, price: 100_000, down: 20, rent: 1_000, rate: 6, ins: 0, hoa: 0 }),
      { taxYr: 0 },
    );

    expect(preview).not.toBeNull();
    // Hand-checked fixed-rate payment vectors for an $80,000 balance at 6.00%.
    expect(preview!.currentMonthlyPI).toBeCloseTo(479.64, 2);
    expect(preview!.fortyYear.monthlyPI).toBeCloseTo(440.17, 2);
    expect(preview!.fortyYear.dscr).toBeCloseTo(2.27, 2);
    expect(preview!.interestOnly.monthlyPI).toBe(400);
    expect(preview!.interestOnly.recastMonthlyPI).toBeCloseTo(573.14, 2);
    expect(preview!.interestOnly.recastDscr).toBeCloseTo(1.74, 2);
  });

  it("withholds amortization structure comparisons when no rate is modeled", () => {
    const preview = computeAmortizationRescuePreview(
      { ...DEFAULT_DEAL, rate: 0 },
      { taxYr: 4_000 },
    );

    expect(preview).toBeNull();
  });
});
