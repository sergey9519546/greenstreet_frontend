import { describe, it, expect } from "vitest";
import { assessLeverage } from "./leverageCheck";

describe("assessLeverage (RIDGE debt-tool)", () => {
  it("negative leverage: loan constant 8% > cap 4.45% (today's typical DSCR deal)", () => {
    // $300k loan, $24k annual debt service (8% constant); NOI $18.9k on $425k (4.45% cap)
    const r = assessLeverage(24_000, 300_000, 18_912, 425_000);
    expect(r.loanConstantPct).toBeCloseTo(8.0, 1);
    expect(r.capRatePct).toBeCloseTo(4.45, 1);
    expect(r.state).toBe("NEGATIVE");
    expect(r.spreadBps).toBeLessThan(0);
    expect(r.note).toMatch(/negative leverage/i);
  });

  it("positive leverage: cap 7% > loan constant 5%", () => {
    const r = assessLeverage(15_000, 300_000, 28_000, 400_000); // 5% constant, 7% cap
    expect(r.state).toBe("POSITIVE");
    expect(r.spreadBps).toBeGreaterThan(0);
  });

  it("near-parity reads neutral", () => {
    const r = assessLeverage(20_000, 400_000, 20_000, 400_000); // 5% vs 5%
    expect(r.state).toBe("NEUTRAL");
  });

  it("guards zero loan / value", () => {
    expect(assessLeverage(0, 0, 0, 0).state).toBe("NEUTRAL");
  });
});
