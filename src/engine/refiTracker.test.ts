import { describe, it, expect } from "vitest";
import { analyzeRefi, getRefiAuxiliaryGuidanceState } from "./refiTracker";
import type { PropertyInputs, BorrowerProfile } from "./types";

const property: PropertyInputs = {
  purchasePrice: 300_000,
  leaseRent: 2600,
  marketRent: 2700,
  strProjectedRent: 0,
  strDocumentedRent: 0,
  hoa: 0,
  annualTaxes: 3600,
  annualInsurance: 1500,
  floodInsurance: 0,
  propertyType: "SFR",
  state: "TX",
  unitCount: 1,
  sqft: 1600,
  yearBuilt: 2005,
  isCondotel: false,
  isNonWarrantable: false,
  isRural: false,
  isDecliningMarket: false,
  hoaSTRPolicy: "SILENT",
};

const borrower: BorrowerProfile = {
  ficoScore: 760,
  experience: "EXPERIENCED",
  existingFinancedProperties: 3,
  entityType: "LLC",
  isUSCitizenOrPR: true,
  availableReserves: 60_000,
  reserveAssets: [],
  isFirstResponder: false,
  isNonUsInvestor: false,
};

// High-rate current loan → refi to a lower rate should save money.
const currentLoan = { balance: 210_000, rate: 8.5, monthlyPayment: 1900 };

describe("analyzeRefi", () => {
  it("suppresses auxiliary economics when blank inputs put the scenario in review", () => {
    const guidance = getRefiAuxiliaryGuidanceState(
      "REVIEW",
      "REVIEW",
      Number.NaN,
      Number.NaN,
      Number.NaN,
      Number.NaN,
    );

    expect(guidance.secondLienAvailable).toBe(false);
    expect(guidance.debtGuidanceAvailable).toBe(false);
    expect(guidance.currentRateLabel).toBeNull();
    expect(guidance.projectedRateLabel).toBeNull();
    expect(JSON.stringify(guidance)).not.toMatch(/NaN|Infinity/);
  });

  it("computes current and projected refi DSCR", () => {
    const r = analyzeRefi(property, borrower, currentLoan, 12, 5, 6.5);
    expect(r.currentDSCR).toBeGreaterThan(0);
    expect(r.projectedRefiDSCR).toBeGreaterThan(0);
  });

  it("seasoning is met at 12 months and scores full marks", () => {
    const r = analyzeRefi(property, borrower, currentLoan, 12, 5, 6.5);
    expect(r.seasoningMet).toBe(true);
    expect(r.seasoningMonthsRemaining).toBe(0);
    const seasoning = r.readinessFactors.find((f) => f.factor === "Seasoning");
    expect(seasoning?.status).toBe("PASS");
  });

  it("flags remaining seasoning before 6 months", () => {
    const r = analyzeRefi(property, borrower, currentLoan, 2, 5, 6.5);
    expect(r.seasoningMet).toBe(false);
    expect(r.seasoningMonthsRemaining).toBe(4);
  });

  it("readiness score is the sum of its four factors and within 0-100", () => {
    const r = analyzeRefi(property, borrower, currentLoan, 12, 5, 6.5);
    const sum = r.readinessFactors.reduce((s, f) => s + f.score, 0);
    expect(r.refiReadinessScore).toBe(sum);
    expect(r.refiReadinessScore).toBeGreaterThanOrEqual(0);
    expect(r.refiReadinessScore).toBeLessThanOrEqual(100);
    expect(r.readinessFactors).toHaveLength(4);
  });

  it("refinancing out of a high rate produces monthly savings", () => {
    const r = analyzeRefi(property, borrower, currentLoan, 12, 10, 6.0);
    expect(r.monthlySavings).toBeGreaterThan(0);
    expect(r.breakEvenMonths).toBeGreaterThan(0);
    expect(r.breakEvenMonths).toBeLessThan(999);
  });

  it("appreciation increases cash-out capacity at the 70% LTV cap", () => {
    const none = analyzeRefi(property, borrower, currentLoan, 12, 0, 6.5);
    const lots = analyzeRefi(property, borrower, currentLoan, 12, 30, 6.5);
    expect(lots.cashOutMaxAmount).toBeGreaterThan(none.cashOutMaxAmount);
  });

  it("computes the appreciation gap for underwater and high-LTV property", () => {
    const underwater = analyzeRefi(
      property,
      borrower,
      { balance: 350_000, rate: 8.5, monthlyPayment: 2800 },
      12,
      0,
      6.5,
    );
    expect(underwater.status).toBe("AVAILABLE");
    expect(underwater.appreciationNeeded).toBeCloseTo(0.5556, 3);
    expect(underwater.cashOutMaxAmount).toBe(0);
    expect(underwater.refiType).toBe("NO_REFI");
    expect(underwater.readinessFactors.find((factor) => factor.factor === "Equity")?.status).toBe("FAIL");
  });

  it("returns review rather than favorable zeros for a zero property value", () => {
    const invalid = analyzeRefi(
      { ...property, purchasePrice: 0 },
      borrower,
      currentLoan,
      12,
      0,
      6.5,
    );
    expect(invalid.status).toBe("REVIEW");
    expect(invalid.refiType).toBe("NO_REFI");
    expect(invalid.refiReadinessScore).toBe(0);
    expect(invalid.readinessFactors.every((factor) => factor.status === "FAIL")).toBe(true);
    expect(invalid.reviewReasons.join(" ")).toMatch(/property value/i);
  });

  it.each([-1, 100, Number.POSITIVE_INFINITY])(
    "returns review for an invalid projected rate of %s",
    (rate) => {
      const invalid = analyzeRefi(property, borrower, currentLoan, 12, 0, rate);
      expect(invalid.status).toBe("REVIEW");
      expect(invalid.refiReadinessScore).toBe(0);
      expect(invalid.projectedRefiRate).toBe(0);
    },
  );

  it("does not infer delayed-financing eligibility from incomplete inputs", () => {
    const result = analyzeRefi(property, borrower, currentLoan, 1, 0, 6.5);
    expect(result.delayedFinancingAvailable).toBe(false);
  });

  it("keeps every numeric output finite for valid boundary scenarios", () => {
    const result = analyzeRefi(property, borrower, currentLoan, 1200, 100, 25);
    const outputs = [
      result.currentDSCR,
      result.projectedRefiDSCR,
      result.projectedRefiRate,
      result.projectedRefiPayment,
      result.monthlySavings,
      result.breakEvenMonths,
      result.appreciationNeeded,
      result.cashOutMaxAmount,
      result.refiReadinessScore,
    ];
    expect(result.status).toBe("AVAILABLE");
    expect(outputs.every(Number.isFinite)).toBe(true);
    expect(result.cashOutMaxAmount).toBeLessThanOrEqual(property.purchasePrice * 2 * 0.7);
  });
});
