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

// ---------------------------------------------------------------------------
// The runner fed computeVerdict five constants that came from no program:
//   lenderMinDSCR: 1.0, ltvCap: 80, lenderMinLoan: 75000,
//   bestLenderConfidence: ... ?? 75, strLegalityStatus: 'CLEAR'
// computeVerdict fails closed on unknown floors, but every substitute was
// finite so each satisfied the gate meant to trip on it, and the ?? 75 sat
// above the "<60 confidence" kill and disarmed it. These pin the replacement.
// ---------------------------------------------------------------------------
describe("v11Runner — the verdict is fed real matrix data, never house constants", () => {
  const prop: PropertyInputs = {
    purchasePrice: 400_000, leaseRent: 3000, marketRent: 3000, strProjectedRent: 0,
    strDocumentedRent: 0, hoa: 0, annualTaxes: 4800, annualInsurance: 1500,
    floodInsurance: 0, propertyType: "SFR", state: "CA", unitCount: 1, sqft: 2000,
    yearBuilt: 2018, isCondotel: false, isNonWarrantable: false, isRural: false,
    isDecliningMarket: false, hoaSTRPolicy: "UNKNOWN",
  };
  const ln: LoanStructure = {
    ltv: 75, term: "30_YR", ioPeriod: "NONE", armType: "FIXED",
    prepayPreference: "NONE", purpose: "PURCHASE", expectedHoldYears: 5,
    points: 0, lenderFees: 0, brokerFees: 0, rateLockCost: 0,
  };
  const bor: BorrowerProfile = {
    ficoScore: 740, experience: "EXPERIENCED", existingFinancedProperties: 3,
    entityType: "LLC", isUSCitizenOrPR: true, availableReserves: 100_000,
    reserveAssets: [], isFirstResponder: false, isNonUsInvestor: false,
  };
  const base = { property: prop, borrower: bor, loan: ln, strategy: "LTR" as const };

  it("evaluates the program matrix instead of passing an empty lender ranking", () => {
    // An empty ranking means "never evaluated" to the verdict, which is a PASS.
    // The runner used to send `input.lenderRanking ?? []` and get exactly that.
    const result = runV11Analysis(base);
    expect(result.memo.lenderRanking.length).toBeGreaterThan(0);
    expect(result.memo.lenderRanking.some((l) => l.eligible)).toBe(true);
  });

  it("does not blame 'no eligible lender' when the matrix produced one", () => {
    const result = runV11Analysis(base);
    const criteria = result.verdict.killCriteriaTriggered.map((k) => k.criterion);
    expect(criteria).not.toContain("Lender DSCR Floor Unknown");
    expect(result.verdict.bindingConstraint).not.toContain("No eligible lender");
  });

  it("reports the best-fit lender as unscored rather than inventing a confidence of 75", () => {
    const result = runV11Analysis(base);
    const criteria = result.verdict.killCriteriaTriggered.map((k) => k.criterion);
    // Honest: no confidence model scores dscrPrograms.ts entries.
    expect(criteria).toContain("Best-Fit Lender Not Confidence-Scored");
    // Dishonest, and what the old `?? 75` produced: silence.
    expect(criteria).not.toContain("Low Confidence on Best-Fit Lender");
  });

  it("does not assert an STR legality clearance on a long-term rental", () => {
    // 'CLEAR' is a recognised status, so hardcoding it silenced the verdict's
    // own "STR Legality Not Evaluated" warning while checking no jurisdiction.
    const result = runV11Analysis(base);
    const criteria = result.verdict.killCriteriaTriggered.map((k) => k.criterion);
    expect(criteria).not.toContain("STR Legality Not Evaluated");
  });

  it("flags an STR deal's legality as unestablished until a jurisdiction check exists", () => {
    const result = runV11Analysis({ ...base, strategy: "STR" });
    const criteria = result.verdict.killCriteriaTriggered.map((k) => k.criterion);
    expect(criteria).toContain("STR Legality Not Evaluated");
  });

  it("lets a caller's real ranking win over the matrix evaluation", () => {
    const supplied = runV11Analysis(base).memo.lenderRanking.slice(0, 1).map((l) => ({
      ...l,
      lenderName: "Externally Sourced Lender",
      confidenceScore: 88,
    }));
    const result = runV11Analysis({ ...base, lenderRanking: supplied });

    expect(result.memo.lenderRanking).toHaveLength(1);
    expect(result.memo.lenderRanking[0].lenderName).toBe("Externally Sourced Lender");
    const criteria = result.verdict.killCriteriaTriggered.map((k) => k.criterion);
    expect(criteria).not.toContain("Best-Fit Lender Not Confidence-Scored");
  });

  it("never manufactures a Track 2 acknowledgment on the investor's behalf", () => {
    const result = runV11Analysis(base);
    if (result.track2DSCR < 1.0) {
      expect(result.verdict.track2AcknowledgmentRequired).toBe(true);
      expect(result.verdict.verdict).not.toBe("PROCEED");
    }
  });
});
