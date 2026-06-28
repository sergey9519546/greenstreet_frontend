import { describe, it, expect } from "vitest";
import { computeBreakEvenVacancy, computeDualTrackDSCR, computeShockWaterfall } from "./stressMatrix";

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
    // rent 2400 / PITIA 2300 → Track1 1.043; Track2 = 2400*(1-0.28 TCO)/2300 = 0.751; delta 0.292 > 0.2
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

  it("Track 2 uses the TCO haircut (SFR 28% default, incl CapEx)", () => {
    const r = computeDualTrackDSCR(3000, 2000);
    expect(r.track1).toBeCloseTo(1.5, 3);          // 3000/2000
    expect(r.track2).toBeCloseTo(1.08, 3);         // 3000*(1-0.28)/2000
  });

  it("vacancy override (Stress Matrix slider) raises the TCO haircut", () => {
    // vacancy 15% + SFR mgmt8+maint8+capex5 (21%) = 36% → Track2 = 3000*0.64/2000
    const r = computeDualTrackDSCR(3000, 2000, { vacancyPct: 15 });
    expect(r.track2).toBeCloseTo(0.96, 2);
  });

  it("degenerate inputs guarded", () => {
    expect(computeDualTrackDSCR(0, 2000).qualifiesButDangerous).toBe(false);
    expect(computeDualTrackDSCR(3000, 0).track1).toBe(0);
  });
});

// Multi-shock waterfall (Edge §7) — each shock's marginal DSCR bite.
describe("computeShockWaterfall", () => {
  // Edge §7 canonical: base $2800 rent / $2546 PITIA → 1.100, then
  // ARM +$265, tax +$200, insurance +$300, rent −10%.
  const r = computeShockWaterfall(2800, 2546, [
    { label: "ARM reset +1.5%", pitiaDelta: 265 },
    { label: "Tax reassessment", pitiaDelta: 200 },
    { label: "Insurance surge", pitiaDelta: 300 },
    { label: "Rent −10%", rentMultiplier: 0.9 },
  ]);

  it("base and final DSCR match the worked example", () => {
    expect(r.baseDSCR).toBeCloseTo(1.1, 2);
    expect(r.finalDSCR).toBeCloseTo(0.761, 2); // 2520 / 3311
  });

  it("marginal deltas sum to total destruction", () => {
    const sum = r.steps.reduce((s, st) => s + st.marginalDelta, 0);
    expect(sum).toBeCloseTo(-(r.totalDelta), 2); // steps are negative; total is positive
    expect(r.totalDelta).toBeCloseTo(0.339, 2);
  });

  it("first ARM shock alone pushes below 1.0", () => {
    expect(r.steps[0].dscrAfter).toBeLessThan(1.0);
    expect(r.steps[0].marginalDelta).toBeLessThan(0);
  });

  it("guards divide-by-zero", () => {
    expect(computeShockWaterfall(2800, 0, []).baseDSCR).toBe(0);
  });
});
