import { describe, it, expect } from "vitest";
import { computeConstructionBridge } from "./constructionBridge";

describe("constructionBridge", () => {
  it("calculates bridge LTC, interest reserve, and exit DSCR", () => {
    const res = computeConstructionBridge({
      totalProjectCost: 500000,
      loanAmount: 400000, // 80% LTC
      bridgeRate: 9.5,
      constructionMonths: 12,
      stabilizedRentMonthly: 4500,
      stabilizedEscrowsMonthly: 800,
      exitRate: 7.0,
    });

    expect(res.ltcPct).toBe(80);
    expect(res.interestReserveNeeded).toBeGreaterThan(15000);
    expect(res.takeoutRetiresBridge).toBe(true);
    expect(res.viability).toBe("VIABLE");
  });
});
