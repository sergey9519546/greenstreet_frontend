import { describe, it, expect } from "vitest";
import { analyzeRefi } from "./refiTracker";
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
});
