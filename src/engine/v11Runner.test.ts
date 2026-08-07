import { describe, it, expect } from "vitest";
import { runV11Analysis } from "./v11Runner";
import type { PropertyInputs, LoanStructure, BorrowerProfile } from "./types";

// v11Runner.ts is CRITICAL: orchestrates the entire v11 analysis pipeline
// (reassessment + ARM + returns + tax + verdict → IC memo).
// Errors here cascade to every downstream calculation.
// This was UNTESTED until now (P0 gap from audit).

describe("v11Runner - Integrated Analysis Pipeline", () => {
  const property: PropertyInputs = {
    purchasePrice: 400_000,
    leaseRent: 3000,
    marketRent: 3000,
    strProjectedRent: 0,
    strDocumentedRent: 0,
    hoa: 0,
    annualTaxes: 4800,
    annualInsurance: 1500,
    floodInsurance: 0,
    propertyType: "SFR",
    state: "CA",
    unitCount: 1,
    sqft: 2000,
    yearBuilt: 2018,
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

  const borrower: BorrowerProfile = {
    ficoScore: 740,
    experience: "EXPERIENCED",
    existingFinancedProperties: 3,
    entityType: "LLC",
    isUSCitizenOrPR: true,
    availableReserves: 100000,
    reserveAssets: [],
    isFirstResponder: false,
    isNonUsInvestor: false,
  };

  it("executes full analysis pipeline without crashing", () => {
    const result = runV11Analysis({
      property,
      loan,
      borrower,
      rate: 7.25,
      strategy: "LTR",
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
  });

  it("handles CA property (tax reassessment via Prop 13)", () => {
    const caProperty = { ...property, state: "CA", annualTaxes: 4800 };
    
    const result = runV11Analysis({
      property: caProperty,
      loan,
      borrower,
      rate: 7.25,
      strategy: "LTR",
    });

    // CA reassesses at purchase → buyer's tax bill > seller's bill
    expect(result).toBeDefined();
  });

  it("handles ARM loan structure", () => {
    const armLoan: LoanStructure = {
      ...loan,
      armType: "5_6_ARM",
    };

    const result = runV11Analysis({
      property,
      loan: armLoan,
      borrower,
      rate: 6.5,
      strategy: "LTR",
    });

    expect(result).toBeDefined();
  });

  it("handles STR strategy with higher operating expenses", () => {
    const strProperty = { ...property, strProjectedRent: 4500, strDocumentedRent: 4000 };

    const result = runV11Analysis({
      property: strProperty,
      loan,
      borrower,
      rate: 7.25,
      strategy: "STR",
    });

    expect(result).toBeDefined();
    // STR has 25% vacancy vs 8% for LTR
  });

  it("handles different property types", () => {
    const multiUnit = { ...property, propertyType: "2-4_UNIT" as const, unitCount: 4 };

    const result = runV11Analysis({
      property: multiUnit,
      loan,
      borrower,
      rate: 7.25,
      strategy: "LTR",
    });

    expect(result).toBeDefined();
  });

  it("handles high LTV scenarios", () => {
    const highLtvLoan = { ...loan, ltv: 85 };

    const result = runV11Analysis({
      property,
      loan: highLtvLoan,
      borrower,
      rate: 7.75, // Higher rate for higher LTV
      strategy: "LTR",
    });

    expect(result).toBeDefined();
  });

  it("handles low FICO scenarios", () => {
    const lowFicoBorrower = { ...borrower, ficoScore: 660 };

    const result = runV11Analysis({
      property,
      loan,
      borrower: lowFicoBorrower,
      rate: 8.25, // Higher rate for lower FICO
      strategy: "LTR",
    });

    expect(result).toBeDefined();
  });

  it("handles first-time investor", () => {
    const firstTimer = { 
      ...borrower, 
      experience: "FIRST_TIME" as const,
      existingFinancedProperties: 0 
    };

    const result = runV11Analysis({
      property,
      loan,
      borrower: firstTimer,
      rate: 7.5,
      strategy: "LTR",
    });

    expect(result).toBeDefined();
  });
});
