import { describe, expect, it } from "vitest";
import {
  GOVERNED_TOOL_CONTENT,
  buildLoanProfile,
  buildStateVerificationChecklist,
  calculateDecisionFacts,
  calculateStrComparison,
  calculateTaxIllustration,
} from "./BoundedGovernedToolsPage";

describe("bounded governed tools", () => {
  it("organizes only the entered loan-profile facts", () => {
    const profile = buildLoanProfile({
      purpose: "purchase",
      propertyType: "Single-family",
      propertyValue: 500_000,
      loanAmount: 350_000,
      monthlyRent: 3_600,
      assumedRatePct: Number.NaN,
      occupancyEvidence: "Executed lease",
      borrowerFileStatus: "Some documents assembled",
    });

    expect(profile.facts).toContain("Loan purpose: purchase.");
    expect(profile.facts.join(" ")).toContain("requested loan $350,000");
    expect(profile.facts.join(" ")).not.toContain("rate assumption");
    expect(profile.missing).toEqual([]);
  });

  it("builds a verification checklist without stating a legal result", () => {
    const output = buildStateVerificationChecklist({
      state: "Nevada",
      entityOrVesting: "Example Property LLC",
      purpose: "Business-purpose purchase",
      prepaymentRequest: "Three-year step-down requested",
      targetDate: "2026-09-30",
    });

    expect(output.recordedFacts).toContain("Property state: Nevada.");
    expect(output.checklist.every((item) => /^Verify|^Confirm|^Have|^Date/.test(item))).toBe(
      true,
    );
    expect(output.officialSearchPrompts[0]).toContain("Nevada official");
    expect(JSON.stringify(output)).not.toMatch(
      /\b(is legal|is prohibited|rate is|license is not required)\b/i,
    );
  });

  it("calculates only entered deal arithmetic and attention facts", () => {
    const facts = calculateDecisionFacts({
      propertyValue: 400_000,
      loanAmount: 300_000,
      annualRatePct: 6,
      amortizationYears: 30,
      monthlyRent: 3_000,
      taxesAnnual: 4_800,
      insuranceAnnual: 1_200,
      hoaMonthly: 100,
      otherMonthlyCosts: 300,
      liquidReserves: 12_000,
      reserveTargetMonths: 6,
    });

    expect(facts.monthlyPrincipalAndInterest).toBeCloseTo(1798.65, 2);
    expect(facts.monthlyPitia).toBeCloseTo(2398.65, 2);
    expect(facts.paymentCoverage).toBeCloseTo(3000 / 2398.65, 4);
    expect(facts.ltv).toBeCloseTo(0.75, 8);
    expect(facts.reserveMonths).toBeCloseTo(12000 / 2398.65, 4);
    expect(facts.simpleMonthlyCashFlow).toBeCloseTo(301.35, 2);
    expect(facts.attention.join(" ")).toContain("your entered 6-month target");
    expect(facts.attention.join(" ")).not.toMatch(/\bGO\b|provider|approval/i);
  });

  it("compares all STR rent sources with user-entered adjustments", () => {
    const result = calculateStrComparison({
      loanAmount: 300_000,
      annualRatePct: 6,
      amortizationYears: 30,
      taxesAnnual: 4_800,
      insuranceAnnual: 1_200,
      hoaMonthly: 100,
      ltrRent: 2_500,
      projectedRent: 4_000,
      documentedRent: 3_500,
      ltrHaircutPct: 0,
      projectedHaircutPct: 25,
      documentedHaircutPct: 10,
      seasonalityHaircutPct: 10,
    });

    expect(result.scenarios.map((scenario) => scenario.adjustedRent)).toEqual([
      2250, 2700, 2835,
    ]);
    for (const scenario of result.scenarios) {
      expect(scenario.paymentCoverage).toBeCloseTo(
        scenario.adjustedRent / result.monthlyPitia,
        8,
      );
    }
  });

  it("uses only entered basis assumptions for the tax illustration", () => {
    const result = calculateTaxIllustration({
      totalBasis: 500_000,
      landAllocationPct: 20,
      recoveryYears: 27.5,
      marginalRatePct: 32,
    });

    expect(result.depreciableBasis).toBe(400_000);
    expect(result.annualStraightLineAmount).toBeCloseTo(14545.45, 2);
    expect(result.illustrativeAnnualTaxEffect).toBeCloseTo(4654.55, 2);
  });

  it("keeps the public tool descriptions inside their governed boundaries", () => {
    const copy = Object.values(GOVERNED_TOOL_CONTENT)
      .map((item) => `${item.title} ${item.lead} ${item.note}`)
      .join(" ");

    expect(copy).not.toMatch(
      /\b(best lender|best program|you qualify|approved rate|guaranteed approval|legal in)\b/i,
    );
    expect(GOVERNED_TOOL_CONTENT["rate-quiz"].lead).toContain(
      "does not generate a rate",
    );
    expect(GOVERNED_TOOL_CONTENT["str-underwriting"].lead).toContain(
      "does not decide which rent a provider will accept",
    );
  });
});
