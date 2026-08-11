import { describe, it, expect } from "vitest";
import {
  simulateSOFRPath,
  runMonteCarloRatePath,
  DEFAULT_VASICEK_PARAMS,
} from "./monteCarloRatePath";
import { DEFAULT_ARM_PROGRAMS } from "./armResetEngine";

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const arm = DEFAULT_ARM_PROGRAMS["5_6_ARM"];

describe("simulateSOFRPath", () => {
  it("rejects invalid model domains before emitting an impossible path", () => {
    expect(() => simulateSOFRPath(
      { ...DEFAULT_VASICEK_PARAMS, volatility: -0.01 },
      12,
      mulberry32(7),
    )).toThrow(/volatility/i);
  });

  it("path length is horizon + 1 and starts at the initial SOFR", () => {
    const path = simulateSOFRPath(DEFAULT_VASICEK_PARAMS, 120, mulberry32(42));
    expect(path).toHaveLength(121);
    expect(path[0]).toBe(DEFAULT_VASICEK_PARAMS.initialSOFR);
  });

  it("respects the rate floor", () => {
    const path = simulateSOFRPath(DEFAULT_VASICEK_PARAMS, 120, mulberry32(7), 0);
    expect(Math.min(...path)).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic for a given seed", () => {
    const a = simulateSOFRPath(DEFAULT_VASICEK_PARAMS, 60, mulberry32(99));
    const b = simulateSOFRPath(DEFAULT_VASICEK_PARAMS, 60, mulberry32(99));
    expect(a).toEqual(b);
  });
});

describe("runMonteCarloRatePath", () => {
  it("returns an explicit invalid-assumptions status instead of NaN analysis", () => {
    const r = runMonteCarloRatePath(
      arm,
      280_000,
      300,
      2600,
      500,
      20,
      12,
      42,
      { ...DEFAULT_VASICEK_PARAMS, volatility: Number.NaN },
    );

    expect(r).toMatchObject({
      analysisStatus: "INVALID_ASSUMPTIONS",
      simulations: 0,
      horizonMonths: 0,
      paths: [],
    });
    expect(r.probabilityDSCRBelow1_0).toBe(0);
  });

  it("marks valid simulations ready with finite, bounded outcomes", () => {
    const r = runMonteCarloRatePath(arm, 280_000, 300, 2600, 500, 20, 12, 42);

    expect(r).toMatchObject({ analysisStatus: "READY", analysisIssues: [] });
    expect(r.paths).toHaveLength(20);
    for (const path of r.paths) {
      expect(Number.isFinite(path.finalSOFR)).toBe(true);
      expect(Number.isFinite(path.stabilizedRate)).toBe(true);
      expect(Number.isFinite(path.finalDSCR)).toBe(true);
      expect(path.finalSOFR).toBeGreaterThanOrEqual(0);
      expect(path.finalSOFR).toBeLessThanOrEqual(25);
    }
  });

  it("fails safe for a non-integer path count", () => {
    const r = runMonteCarloRatePath(arm, 280_000, 300, 2600, 500, 1.5, 12, 42);

    expect(r).toMatchObject({ analysisStatus: "INVALID_ASSUMPTIONS", paths: [] });
  });

  it("is reproducible bit-for-bit with the same seed", () => {
    const a = runMonteCarloRatePath(arm, 280_000, 300, 2600, 500, 200, 120, 42);
    const b = runMonteCarloRatePath(arm, 280_000, 300, 2600, 500, 200, 120, 42);
    expect(a.dscrStats).toEqual(b.dscrStats);
    expect(a.finalRateStats).toEqual(b.finalRateStats);
    expect(a.probabilityDSCRBelow1_0).toBe(b.probabilityDSCRBelow1_0);
  });

  it("produces coherent probability and percentile ordering", () => {
    const r = runMonteCarloRatePath(arm, 280_000, 300, 2600, 500, 300, 120, 42);
    expect(r.paths).toHaveLength(300);
    // Probabilities are nested: P(<1.0) ≤ P(<1.25) ≤ P(<1.50)
    expect(r.probabilityDSCRBelow1_0).toBeLessThanOrEqual(r.probabilityDSCRBelow1_25);
    expect(r.probabilityDSCRBelow1_25).toBeLessThanOrEqual(r.probabilityDSCRBelow1_50);
    // Percentiles ordered
    expect(r.finalRateStats.p10).toBeLessThanOrEqual(r.finalRateStats.median);
    expect(r.finalRateStats.median).toBeLessThanOrEqual(r.finalRateStats.p90);
    expect(r.dscrStats.min).toBeLessThanOrEqual(r.dscrStats.max);
    expect(r.modelParameters.process).toBe("VASICEK");
  });

  it("all probabilities are within [0,1]", () => {
    const r = runMonteCarloRatePath(arm, 280_000, 300, 2600, 500, 200, 120, 1);
    for (const p of [
      r.probabilityDSCRBelow1_0,
      r.probabilityDSCRBelow1_25,
      r.probabilityDSCRBelow1_50,
      r.probabilityRateAboveLifetimeCap,
    ]) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});
