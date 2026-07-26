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
