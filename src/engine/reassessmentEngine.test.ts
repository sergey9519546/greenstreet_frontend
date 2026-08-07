import { describe, it, expect } from "vitest";
import {
  getReassessmentRule,
  computeReassessedTax,
  computeReassessmentDSCRImpact,
  listVerifiedStates,
  STATE_REASSESSMENT_RULES,
} from "./reassessmentEngine";

describe("getReassessmentRule", () => {
  it("returns the CA Prop 13 rule for CA", () => {
    expect(getReassessmentRule("CA").rule).toBe("CA_PROP_13");
  });

  it("is case-insensitive", () => {
    expect(getReassessmentRule("ca").rule).toBe("CA_PROP_13");
    expect(getReassessmentRule("tx").rule).toBe("TX_MARKET_RATE");
  });

  it("falls back to DEFAULT for unknown states", () => {
    const rule = getReassessmentRule("ZZ");
    expect(rule.rule).toBe("GENERAL_REASSESS");
    expect(rule).toBe(STATE_REASSESSMENT_RULES.DEFAULT);
  });
});

describe("computeReassessedTax", () => {
  it("uses purchase price × effective mill rate (CA 1.25%)", () => {
    const r = computeReassessedTax(500_000, "CA", 2_000);
    expect(r.reassessedAnnualTax).toBe(6_250); // 500k × 1.25%
    expect(r.deltaAnnual).toBe(6_250 - 2_000);
    expect(r.deltaMonthly).toBe(Math.round((6_250 - 2_000) / 12));
  });

  it("emits a supplemental-bill estimate only when the rule expects one", () => {
    const ca = computeReassessedTax(500_000, "CA", 2_000);
    const tx = computeReassessedTax(500_000, "TX", 2_000);
    expect(ca.supplementalBillEstimate).toBeGreaterThan(0); // CA expects supplemental
    expect(tx.supplementalBillEstimate).toBe(0); // TX does not
  });

  it("honors a county-specific mill-rate override", () => {
    const r = computeReassessedTax(400_000, "TX", 3_000, 2.0);
    expect(r.reassessedAnnualTax).toBe(8_000); // 400k × 2.0% override
  });

  it("produces a state-specific note", () => {
    expect(computeReassessedTax(300_000, "CA", 1_000).note).toMatch(/Prop 13/);
    expect(computeReassessedTax(300_000, "FL", 1_000).note).toMatch(/Save Our Homes/);
  });
});

describe("computeReassessmentDSCRImpact", () => {
  it("reassessment above the seller bill lowers DSCR", () => {
    const res = computeReassessmentDSCRImpact(
      500_000,
      "CA",
      3_000, // qualifying rent
      2_400, // pitia before
      2_000, // seller annual tax
      6_250, // reassessed annual tax
    );
    expect(res.taxDeltaAnnual).toBe(4_250);
    expect(res.pitiaAfter).toBeGreaterThan(res.pitiaBefore);
    expect(res.dscrAfter).toBeLessThan(res.dscrBefore);
    expect(res.dscrImpact).toBeLessThan(0);
  });

  it("equal taxes leave DSCR unchanged", () => {
    const res = computeReassessmentDSCRImpact(500_000, "CA", 3_000, 2_400, 2_000, 2_000);
    expect(res.taxDeltaAnnual).toBe(0);
    expect(res.dscrImpact).toBe(0);
  });
});

describe("listVerifiedStates", () => {
  it("lists verified states and excludes DEFAULT", () => {
    const states = listVerifiedStates();
    expect(states).toContain("CA");
    expect(states).toContain("TX");
    expect(states).not.toContain("DEFAULT");
  });
});
