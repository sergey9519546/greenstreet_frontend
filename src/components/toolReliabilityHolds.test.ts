import { describe, expect, it } from "vitest";
import { TOOL_RELIABILITY_HOLDS } from "./toolReliabilityHolds";

describe("tool reliability hold definitions", () => {
  it("covers each intended unsafe public tool route exactly once", () => {
    const definitions = Object.values(TOOL_RELIABILITY_HOLDS);
    const paths = definitions.map((definition) => definition.path);

    expect(paths).toEqual([
      "/investgo",
      "/tools/decision-support",
      "/tools/tax-engine",
      "/tools/refi-tracker",
      "/tools/portfolio",
      "/tools/monte-carlo",
      "/tools/arm-reset",
      "/tools/returns",
      "/tools/stress-matrix",
      "/tools/structure-optimizer",
    ]);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("provides calm, actionable content for every hold page", () => {
    for (const definition of Object.values(TOOL_RELIABILITY_HOLDS)) {
      expect(definition.title.trim().length).toBeGreaterThan(0);
      expect(definition.reason.trim().length).toBeGreaterThan(20);
      expect(definition.whatIsNeeded.length).toBeGreaterThanOrEqual(3);
      expect(definition.whatIsNeeded.every((item) => item.trim().length > 0)).toBe(true);
    }
  });
});
