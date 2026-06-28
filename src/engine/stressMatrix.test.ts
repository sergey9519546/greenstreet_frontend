import { describe, it, expect } from "vitest";
import { computeBreakEvenVacancy } from "./stressMatrix";

// Validation cases from the DSCR improvement spec (Break-Even Vacancy, [High]).
describe("computeBreakEvenVacancy", () => {
  it("normal deal: rent 3000 / PITIA 2000 → 33.3% break-even vacancy", () => {
    const r = computeBreakEvenVacancy(3000, 2000);
    expect(r.structurallyNegative).toBe(false);
    expect(r.vacancyPct).toBeCloseTo(33.3, 1); // 1 - 2000/3000
  });

  it("strong deal: break-even vacancy is between 0 and 100", () => {
    const r = computeBreakEvenVacancy(4000, 2200);
    expect(r.structurallyNegative).toBe(false);
    expect(r.vacancyPct).toBeGreaterThan(0);
    expect(r.vacancyPct).toBeLessThan(100);
  });

  it("structural failure: rent below PITIA at full occupancy → 0% + flagged (guard clause)", () => {
    const r = computeBreakEvenVacancy(1800, 2000);
    expect(r.structurallyNegative).toBe(true);
    expect(r.vacancyPct).toBe(0); // never a negative/>1 break-even
  });

  it("boundary: rent exactly equals PITIA → 0% break-even, flagged", () => {
    const r = computeBreakEvenVacancy(2000, 2000);
    expect(r.vacancyPct).toBe(0);
    expect(r.structurallyNegative).toBe(true);
  });

  it("degenerate inputs are guarded (no NaN/negative)", () => {
    expect(computeBreakEvenVacancy(0, 2000)).toEqual({ vacancyPct: 0, structurallyNegative: true });
    expect(computeBreakEvenVacancy(3000, 0).vacancyPct).toBe(0);
  });
});
