import { describe, it, expect } from "vitest";
import { assessRentIntegrity } from "./rentIntegrity";

describe("assessRentIntegrity", () => {
  it("rent in line with market → CLEAR, no flags", () => {
    const r = assessRentIntegrity({ leaseRent: 2050, marketRent: 2000 });
    expect(r.disposition).toBe("CLEAR");
    expect(r.flags).toHaveLength(0);
  });

  it("stated rent 25% above market → flagged + ELEVATED-leaning", () => {
    const r = assessRentIntegrity({ leaseRent: 2500, marketRent: 2000 });
    expect(r.leaseVsMarketPct).toBeCloseTo(25, 0);
    expect(r.flags.length).toBeGreaterThan(0);
    expect(r.score).toBeGreaterThan(18);
  });

  it("below-market rent is never penalized", () => {
    const r = assessRentIntegrity({ leaseRent: 1800, marketRent: 2000 });
    expect(r.score).toBe(0);
    expect(r.disposition).toBe("CLEAR");
  });

  it("STR projection far above documented history → flagged", () => {
    const r = assessRentIntegrity({ leaseRent: 2000, marketRent: 2000, strProjectedRent: 4000, strDocumentedRent: 3000 });
    expect(r.strDivergencePct).toBeCloseTo(33.3, 0);
    expect(r.flags.some((f) => /STR projection/.test(f))).toBe(true);
  });

  it("both signals firing triggers the concurrent boost + ELEVATED", () => {
    const r = assessRentIntegrity({ leaseRent: 2600, marketRent: 2000, strProjectedRent: 5000, strDocumentedRent: 3000 });
    expect(r.score).toBeGreaterThanOrEqual(40);
    expect(r.disposition).toBe("ELEVATED");
  });

  it("degenerate inputs guarded", () => {
    expect(assessRentIntegrity({ leaseRent: 0, marketRent: 0 }).score).toBe(0);
  });
});
