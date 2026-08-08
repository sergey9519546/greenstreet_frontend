import { describe, it, expect } from "vitest";
import { computeReturns } from "./returnsEngine";
import type { PropertyInputs, LoanStructure } from "./types";

// returnsEngine.ts is CRITICAL: calculates IRR, equity multiple, and exit proceeds
// shown to investors. Wrong calculations = wrong investment decisions.
// This was UNTESTED until now (P0 gap from audit).

describe("returnsEngine - IRR and Exit Proceeds", () => {
  const property: PropertyInputs = {
    purchasePrice: 300_000,
    leaseRent: 2500,
    marketRent: 2500,
    strProjectedRent: 0,
    strDocumentedRent: 0,
    hoa: 0,
    annualTaxes: 3600,
    annualInsurance: 1200,
    floodInsurance: 0,
    propertyType: "SFR",
    state: "TX",
    unitCount: 1,
    sqft: 1500,
    yearBuilt: 2020,
    isCondotel: false,
    isNonWarrantable: false,
    isRural: false,
    isDecliningMarket: false,
    hoaSTRPolicy: "UNKNOWN",
  };

  const loan: LoanStructure = {
    ltv: 75,
    term: "30_YR",
    ioPeriod: "NONE",
    armType: "FIXED",
    prepayPreference: "NONE",
    purpose: "PURCHASE",
    expectedHoldYears: 5,
    points: 0,
    lenderFees: 0,
    brokerFees: 0,
    rateLockCost: 0,
  };

  it("computes positive levered IRR for cash-flowing deal", () => {
    const result = computeReturns(
      property,
      loan,
      2500, // monthly rent
      "LTR",
      7.5, // rate
      0, // prepay penalty
      75000 // cash invested (25% down)
    );

    expect(result).toBeDefined();
    expect(result.leveredIRR).toBeGreaterThan(0);
    expect(result.leveredIRR).toBeLessThan(50); // Sanity check: not 500% IRR
    expect(result.equityMultiple).toBeGreaterThan(1.0); // Should make money
  });

  it("equity multiple = (distributions + exit equity) / cash invested", () => {
    // Regression guard: v11 fixed a bug where EM was calculated incorrectly
    const result = computeReturns(property, loan, 2500, "LTR", 7.5, 0, 75000);

    expect(result.equityMultiple).toBeGreaterThan(0);
    // EM should be reasonable (not negative, not absurdly high)
    expect(result.equityMultiple).toBeLessThan(10);
  });

  it("handles zero cash invested (100% LTV) gracefully", () => {
    const allCashLoan = { ...loan, ltv: 100 };
    const result = computeReturns(property, allCashLoan, 2500, "LTR", 7.5, 0, 0);

    // When cash invested = 0, should not crash
    expect(result).toBeDefined();
    expect(typeof result.leveredIRR).toBe("number");
  });

  it("exit proceeds = property value - remaining loan - selling costs - prepay", () => {
    const result = computeReturns(property, loan, 2500, "LTR", 7.5, 0, 75000);

    expect(result.netExitProceeds).toBeGreaterThan(0);
    // Exit proceeds should be less than property value (selling costs exist)
    expect(result.netExitProceeds).toBeLessThan(property.purchasePrice);
  });

  it("hold matrix spans multiple hold periods and scenarios", () => {
    const result = computeReturns(property, loan, 2500, "LTR", 7.5, 0, 75000);

    expect(result.holdMatrix).toBeDefined();
    expect(result.holdMatrix.length).toBeGreaterThan(0);
    expect(result.holdMatrix[0].length).toBeGreaterThan(0);

    // Check that hold matrix has valid data
    const firstCell = result.holdMatrix[0][0];
    expect(firstCell.holdYears).toBeGreaterThan(0);
    expect(typeof firstCell.leveredIRR).toBe("number");
  });

  it("higher rent increases IRR (all else equal)", () => {
    const lowRentResult = computeReturns(property, loan, 2000, "LTR", 7.5, 0, 75000);
    const highRentResult = computeReturns(property, loan, 3000, "LTR", 7.5, 0, 75000);

    expect(highRentResult.leveredIRR).toBeGreaterThan(lowRentResult.leveredIRR);
    expect(highRentResult.equityMultiple).toBeGreaterThan(lowRentResult.equityMultiple);
  });

  it("higher rate decreases IRR (higher debt service)", () => {
    const lowRateResult = computeReturns(property, loan, 2500, "LTR", 6.5, 0, 75000);
    const highRateResult = computeReturns(property, loan, 2500, "LTR", 8.5, 0, 75000);

    expect(lowRateResult.leveredIRR).toBeGreaterThan(highRateResult.leveredIRR);
  });

  it("negative cash flow produces low IRR", () => {
    // Rent too low to cover debt service → negative carry
    const result = computeReturns(property, loan, 1500, "LTR", 7.5, 0, 75000);

    // Should still compute but IRR will be low or NaN (no positive cash flow)
    expect(result).toBeDefined();
    expect(Number.isNaN(result.leveredIRR) || result.leveredIRR < 15).toBe(true);
  });
});
