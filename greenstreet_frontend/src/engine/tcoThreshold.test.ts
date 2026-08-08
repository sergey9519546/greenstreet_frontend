import { describe, it, expect } from "vitest";
import { stdToTco, tcoToStd, tcoThresholdTable, DEFAULT_RESERVE_LOAD } from "./tcoThreshold";

describe("tcoThreshold", () => {
  it("reproduces the 1.25 standard ≈ 0.90 TCO anchor", () => {
    expect(stdToTco(1.25)).toBe(0.9);
  });

  it("inverts cleanly (round-trip)", () => {
    expect(tcoToStd(0.9)).toBe(1.25);
    expect(tcoToStd(stdToTco(1.2))).toBeCloseTo(1.2, 2);
  });

  it("higher reserve load lowers the TCO score", () => {
    expect(stdToTco(1.25, 0.5)).toBeLessThan(stdToTco(1.25, 0.3));
  });

  it("builds a threshold table with the anchor row present", () => {
    const rows = tcoThresholdTable();
    expect(rows).toHaveLength(5);
    const anchor = rows.find((r) => r.standard === 1.25);
    expect(anchor?.tco).toBe(0.9);
  });

  it("exposes the documented default reserve load", () => {
    expect(DEFAULT_RESERVE_LOAD).toBeCloseTo(0.3889, 4);
  });
});
