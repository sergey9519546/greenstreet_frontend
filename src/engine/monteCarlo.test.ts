import { describe, it, expect, vi } from "vitest";
import { runMonteCarlo } from "./monteCarlo";
import { solveDSCR } from "./engine";
import { buildEngineInputs } from "./inputs";

function run(overrides: Record<string, unknown> = {}, sims = 600) {
  const { property, borrower, loan, strategy } = buildEngineInputs({
    purchasePrice: 400_000, monthlyRent: 3_000, state: "TX", ltv: 75, ficoScore: 740, ...overrides,
  });
  const dscr = solveDSCR(property, borrower, loan, strategy);
  return runMonteCarlo(property, loan, strategy, dscr, sims);
}

describe("runMonteCarlo — regime-switching recalibration", () => {
  it("rejects a fractional simulation count instead of dividing probabilities by it", () => {
    expect(() => run({}, 1.5)).toThrow(/simulations/i);
  });

  it("uses a supplied seed reproducibly", () => {
    const { property, borrower, loan, strategy } = buildEngineInputs({
      purchasePrice: 400_000, monthlyRent: 3_000, state: "TX", ltv: 75, ficoScore: 740,
    });
    const dscr = solveDSCR(property, borrower, loan, strategy);

    const a = runMonteCarlo(property, loan, strategy, dscr, 80, 17);
    const b = runMonteCarlo(property, loan, strategy, dscr, 80, 17);
    const c = runMonteCarlo(property, loan, strategy, dscr, 80, 18);

    expect(a).toEqual(b);
    expect(c).not.toEqual(a);
  });

  it("keeps a seeded calibration reproducible when the wall clock changes", () => {
    const { property, borrower, loan, strategy } = buildEngineInputs({
      purchasePrice: 400_000, monthlyRent: 3_000, state: "TX", ltv: 75, ficoScore: 740, yearBuilt: 2015,
    });
    const dscr = solveDSCR(property, borrower, loan, strategy);

    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-08-11T00:00:00Z"));
      const atCalibrationDate = runMonteCarlo(property, loan, strategy, dscr, 80);
      vi.setSystemTime(new Date("2034-08-11T00:00:00Z"));
      const replayed = runMonteCarlo(property, loan, strategy, dscr, 80);

      expect(replayed).toEqual(atCalibrationDate);
    } finally {
      vi.useRealTimers();
    }
  });

  it("is deterministic (seeded) — identical results across runs", () => {
    const a = run();
    const b = run();
    expect(a.probabilityDSCRAbove1_0).toBe(b.probabilityDSCRAbove1_0);
    expect(a.expectedAnnualCashFlow.p50).toBe(b.expectedAnnualCashFlow.p50);
    expect(a.avgTimeInStressPct).toBe(b.avgTimeInStressPct);
  });

  it("preserves the output contract", () => {
    const r = run();
    expect(r.probabilityDSCRAbove1_0).toBeGreaterThanOrEqual(0);
    expect(r.probabilityDSCRAbove1_0).toBeLessThanOrEqual(1);
    expect(r.expectedAnnualCashFlow.p10).toBeLessThanOrEqual(r.expectedAnnualCashFlow.p50);
    expect(r.expectedAnnualCashFlow.p50).toBeLessThanOrEqual(r.expectedAnnualCashFlow.p90);
    expect(r.reserveDepletionCurve).toHaveLength(12);
    expect(r.dscrDistribution).toHaveLength(20);
    const totalProb = r.dscrDistribution.reduce((s, d) => s + d.probability, 0);
    expect(totalProb).toBeGreaterThan(0.9); // ~all mass captured
  });

  it("Track 2 failure ⊇ Track 1 failure (investor stricter than lender)", () => {
    const r = run();
    expect(r.probabilityTrack2Below1!).toBeGreaterThanOrEqual(1 - r.probabilityDSCRAbove1_0 - 1e-9);
  });

  it("spends some—but not most—time in the stress regime (steady-state ~17%)", () => {
    const r = run();
    expect(r.avgTimeInStressPct!).toBeGreaterThan(0);
    expect(r.avgTimeInStressPct!).toBeLessThan(0.4);
  });

  it("a high-insurance state (FL) is riskier than a low-risk state (OH), same deal", () => {
    const fl = run({ state: "FL" }).probabilityNegativeCashFlow;
    const oh = run({ state: "OH" }).probabilityNegativeCashFlow;
    expect(fl).toBeGreaterThanOrEqual(oh);
  });
});
