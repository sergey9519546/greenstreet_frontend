import { describe, it, expect } from "vitest";
import { generateCreditMemo } from "./creditMemo";

describe("creditMemo engine", () => {
  it("generates STRONG_APPROVAL for DSCR >= 1.25", () => {
    const memo = generateCreditMemo({
      price: 400000,
      loan: 300000,
      downPercent: 25,
      rent: 3200,
      marketRent: 3200,
      rate: 7.0,
      pitia: 2400,
      dscr: 1.33,
      noi: 30000,
      capRate: 7.5,
      debtYield: 10.0,
      leverageState: "positive",
      stateCode: "TX",
    });

    expect(memo.verdict).toBe("STRONG_APPROVAL");
    expect(memo.keyStrengths.length).toBeGreaterThan(0);
    expect(memo.executiveSummary).toContain("300,000");
  });

  it("handles rent gap haircut risks", () => {
    const memo = generateCreditMemo({
      price: 500000,
      loan: 375000,
      downPercent: 25,
      rent: 4000,
      marketRent: 3500, // $500 haircut risk
      rate: 7.25,
      pitia: 3600,
      dscr: 1.11,
      noi: 36000,
      capRate: 7.2,
      debtYield: 9.6,
      leverageState: "neutral",
      stateCode: "NJ",
      pppRule: "PPP HIGH-RISK for LLC",
    });

    expect(memo.verdict).toBe("CONDITIONAL_APPROVAL");
    expect(memo.riskFactors.some((r) => r.includes("market rent"))).toBe(true);
    expect(memo.mitigationSteps.some((m) => m.includes("market rent"))).toBe(true);
  });

  it("recommends lower LTV when DSCR is below 1.25x", () => {
    const memo = generateCreditMemo({
      price: 450000,
      loan: 360000,
      downPercent: 20,
      rent: 2800,
      marketRent: 2800,
      rate: 7.5,
      pitia: 3100,
      dscr: 0.90,
      noi: 25000,
      capRate: 5.5,
      debtYield: 6.9,
      leverageState: "negative",
      stateCode: "FL",
    });

    expect(memo.verdict).toBe("SUB_1_0_EXCEPTION");
    expect(memo.recommendedLTV).toBeLessThan(80);
    expect(memo.riskFactors.some((r) => r.includes("Negative leverage"))).toBe(true);
  });
});
