import { describe, it, expect } from "vitest";
import { computeBreakEvenVacancy, computeDualTrackDSCR } from "./stressMatrix";

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

// "Qualifies but Dangerous" — the lender approves a deal that loses money.
describe("computeDualTrackDSCR", () => {
  it("trap: lender qualifies (Track1≥1.0) but investor loses money (Track2<1.0) → flagged", () => {
    // rent 2400 / PITIA 2300 → Track1 1.043; Track2 = 2400*0.79/2300 = 0.824; delta 0.219 > 0.2
    const r = computeDualTrackDSCR(2400, 2300);
    expect(r.track1).toBeGreaterThanOrEqual(1.0);
    expect(r.track2).toBeLessThan(1.0);
    expect(r.delta).toBeGreaterThan(0.2);
    expect(r.qualifiesButDangerous).toBe(true);
  });

  it("safe deal: both tracks clear → not dangerous", () => {
    const r = computeDualTrackDSCR(3500, 2000); // T1 1.75, T2 1.3825
    expect(r.track2).toBeGreaterThanOrEqual(1.0);
    expect(r.qualifiesButDangerous).toBe(false);
  });

  it("does not qualify at all (Track1<1.0) → not the trap (lender declines)", () => {
    const r = computeDualTrackDSCR(1800, 2000); // T1 0.9
    expect(r.track1).toBeLessThan(1.0);
    expect(r.qualifiesButDangerous).toBe(false);
  });

  it("Track 2 matches the engine haircut (gross × (1 - vac - mgmt - maint))", () => {
    const r = computeDualTrackDSCR(3000, 2000, { vacancyPct: 8, managementPct: 8, maintenancePct: 5 });
    expect(r.track1).toBeCloseTo(1.5, 3);          // 3000/2000
    expect(r.track2).toBeCloseTo(1.185, 3);        // 3000*0.79/2000
  });

  it("degenerate inputs guarded", () => {
    expect(computeDualTrackDSCR(0, 2000).qualifiesButDangerous).toBe(false);
    expect(computeDualTrackDSCR(3000, 0).track1).toBe(0);
  });
});
