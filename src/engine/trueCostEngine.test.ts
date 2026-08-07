import { describe, it, expect } from "vitest";
import { computeAEY } from "./trueCostEngine";

// AEY (all-in effective yield) is the XIRR of the borrower's real cash flows:
// net proceeds in, P&I out, balloon + prepay at exit. It should exceed the
// note rate whenever points/fees/prepay are present, and equal it (roughly)
// when the loan is clean. These guard the numbers surfaced in TrueCostComparator.
describe("computeAEY", () => {
  const LOAN = 300_000;
  const TERM = 360;

  it("returns AEY ≈ note rate for a clean loan (no points/fees/prepay)", () => {
    const r = computeAEY(LOAN, 7.5, TERM, 36, 0, 0, 0, 0, 0);
    // Small XIRR discretization drift is expected; keep a tight band.
    expect(r.aey).toBeGreaterThan(7.0);
    expect(r.aey).toBeLessThan(8.0);
  });

  it("AEY rises above the note rate once points + fees are added", () => {
    const clean = computeAEY(LOAN, 7.5, TERM, 36, 0, 0, 0, 0, 0);
    const costly = computeAEY(LOAN, 7.5, TERM, 36, 2, 3000, 0, 0, 0);
    expect(costly.aey).toBeGreaterThan(clean.aey);
  });

  it("a lower rate with points can cost more (higher AEY) than a higher clean rate", () => {
    // Classic rate-myopia trap on a short 2yr hold.
    const lowRatePoints = computeAEY(LOAN, 7.25, TERM, 24, 2, 1500, 0, 0, 0);
    const highRateClean = computeAEY(LOAN, 7.875, TERM, 24, 0, 1500, 0, 0, 0);
    expect(lowRatePoints.aey).toBeGreaterThan(highRateClean.aey);
  });

  it("flags points that never recoup within the hold as RED", () => {
    // Bought down 0.25% (par 7.75 → 7.5) with 2 points on a 12-month hold:
    // savings can't repay the points in time.
    const r = computeAEY(LOAN, 7.5, TERM, 12, 2, 0, 0, 0, 0, 7.75);
    expect(r.pointsRecoupVerdict).toBe("RED");
  });

  it("computes 60-month total cost greater than 36-month", () => {
    const r = computeAEY(LOAN, 7.5, TERM, 60, 1, 1500, 0, 0, 0);
    expect(r.totalCost60mo).toBeGreaterThan(r.totalCost36mo);
    expect(r.totalCost36mo).toBeGreaterThan(r.totalCost12mo);
  });
});
