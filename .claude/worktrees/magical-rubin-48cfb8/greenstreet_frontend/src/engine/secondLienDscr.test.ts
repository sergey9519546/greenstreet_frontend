import { describe, it, expect } from "vitest";
import { computeSecondLienDscr } from "./secondLienDscr";

describe("computeSecondLienDscr — Angel Oak worked example", () => {
  // Rent $2,500; 1st PITIA $1,600; $40k 2nd at 10.5%/30yr ≈ $366/mo → 1.27x.
  const r = computeSecondLienDscr({
    monthlyRent: 2500, firstLienPITIA: 1600, firstLienBalance: 240_000,
    propertyValue: 400_000, secondLienAmount: 40_000, secondLienRate: 10.5,
  });

  it("combined DSCR = rent / (1st PITIA + 2nd P&I) ≈ 1.27x", () => {
    expect(r.secondLienPayment).toBeGreaterThan(350);
    expect(r.secondLienPayment).toBeLessThan(380);
    expect(r.combinedDSCR).toBeCloseTo(1.27, 1);
    expect(r.qualifies).toBe(true);
  });

  it("CLTV = (1st balance + 2nd) / value", () => {
    expect(r.cltv).toBeCloseTo(70, 0); // (240k+40k)/400k
  });

  it("max 2nd lien is CLTV-bound here (75% cap − 1st balance = $60k)", () => {
    expect(r.maxSecondLien).toBe(60_000);
    expect(r.bindingConstraint).toBe("CLTV");
  });

  it("a thin deal is DSCR-bound, not CLTV-bound", () => {
    const thin = computeSecondLienDscr({
      monthlyRent: 1800, firstLienPITIA: 1600, firstLienBalance: 150_000,
      propertyValue: 400_000, secondLienAmount: 50_000, secondLienRate: 10.5,
    });
    // rent barely covers 1st; little room for a 2nd payment → DSCR binds first
    expect(thin.bindingConstraint).toBe("DSCR");
  });

  it("over-CLTV or sub-1.0 fails to qualify", () => {
    const over = computeSecondLienDscr({
      monthlyRent: 2500, firstLienPITIA: 1600, firstLienBalance: 280_000,
      propertyValue: 400_000, secondLienAmount: 40_000, secondLienRate: 10.5,
    });
    expect(over.cltv).toBeGreaterThan(75); // (280k+40k)/400k = 80%
    expect(over.qualifies).toBe(false);
  });
});
