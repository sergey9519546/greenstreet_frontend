import { describe, it, expect } from "vitest";
import { assessDscrCovenant, assessDayOneVsStabilized } from "./covenantCheck";

describe("assessDscrCovenant", () => {
  it("flags a breach when measured DSCR is below the covenant", () => {
    const r = assessDscrCovenant(1.10, 1.20);
    expect(r.breach).toBe(true);
    expect(r.status).toBe("BREACH");
    expect(r.cushion).toBeCloseTo(-0.10, 5);
  });

  it("flags TIGHT within 0.10x above the covenant", () => {
    expect(assessDscrCovenant(1.25, 1.20).status).toBe("TIGHT");
  });

  it("is OK with comfortable cushion", () => {
    const r = assessDscrCovenant(1.45, 1.20);
    expect(r.status).toBe("OK");
    expect(r.breach).toBe(false);
  });
});

describe("assessDayOneVsStabilized", () => {
  it("flags lease-up risk when day-one DSCR < 1.10x", () => {
    const r = assessDayOneVsStabilized(0.80, 1.30);
    expect(r.leaseUpRisk).toBe(true);
    expect(r.status).toBe("LEASE_UP_RISK");
  });

  it("clears when day-one already covers", () => {
    expect(assessDayOneVsStabilized(1.15, 1.30).leaseUpRisk).toBe(false);
  });
});
