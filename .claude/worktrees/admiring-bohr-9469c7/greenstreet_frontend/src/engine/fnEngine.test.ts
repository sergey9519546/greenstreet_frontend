import { describe, it, expect } from "vitest";
import {
  calculateForeignNationalRateAdjusters, totalRateAdjustmentBps,
  calculateForeignNationalMaxLTV, getForeignNationalDocumentChecklist,
  assessForeignNationalEligibility, getCountryRiskTier,
} from "./fnEngine";
import { calculateFIRPTAImpact, nraEstateTaxNote } from "./firpta";

const ITIN_MX = {
  idType: "ITIN" as const, countryCode: "MX", hasUsFico: false,
  hasUsResidency: true, entityType: "US_LLC" as const, // resident ITIN holder (no no-visa premium)
};
const PASSPORT_NOVISA_GB = {
  idType: "PASSPORT_ONLY" as const, countryCode: "GB", hasUsFico: false,
  hasUsResidency: false, entityType: "US_LLC" as const,
};

describe("FN rate adjusters (§10.2)", () => {
  it("ITIN + no-credit + preferred country = 75 + 50 + 0", () => {
    const a = calculateForeignNationalRateAdjusters(ITIN_MX);
    expect(a.find((x) => x.name === "FOREIGN_NATIONAL_PREMIUM")!.basisPoints).toBe(75);
    expect(a.find((x) => x.name === "NO_US_CREDIT")!.basisPoints).toBe(50);
    expect(totalRateAdjustmentBps(ITIN_MX)).toBe(125); // 75 + 50 + 0 (MX preferred)
  });

  it("passport-only no-visa = 125 + 50 (no credit) + 50 (no visa)", () => {
    expect(totalRateAdjustmentBps(PASSPORT_NOVISA_GB)).toBe(225);
  });

  it("foreign entity adds 100 bps", () => {
    expect(totalRateAdjustmentBps({ ...ITIN_MX, entityType: "FOREIGN_ENTITY" })).toBe(225);
  });
});

describe("FN max LTV (§10.3)", () => {
  it("ITIN caps at 75/75/70", () => {
    expect(calculateForeignNationalMaxLTV(ITIN_MX)).toEqual({ purchase: 75, rateAndTerm: 75, cashOut: 70 });
  });
  it("passport no-visa caps at 70/70/60", () => {
    expect(calculateForeignNationalMaxLTV(PASSPORT_NOVISA_GB)).toEqual({ purchase: 70, rateAndTerm: 70, cashOut: 60 });
  });
});

describe("OFAC / country tiers", () => {
  it("prohibited country cannot be lent to", () => {
    const e = assessForeignNationalEligibility({ ...ITIN_MX, countryCode: "IR" });
    expect(getCountryRiskTier("IR")).toBe("PROHIBITED");
    expect(e.canLend).toBe(false);
    expect(e.totalRateAddBps).toBe(Infinity);
  });
  it("elevated country (CN) drops LTV 5pts + adds 75 bps", () => {
    const e = assessForeignNationalEligibility({ ...ITIN_MX, countryCode: "CN" });
    expect(e.tier).toBe("ELEVATED");
    expect(e.maxLTV.purchase).toBe(70); // 75 − 5
  });
});

// AML/KYC validation (from the anti-money-laundering + know-your-customer skills).
describe("AML/KYC compliance flags", () => {
  it("SDN screening is ALWAYS required — even for a PREFERRED country (strict liability)", () => {
    const pref = assessForeignNationalEligibility(ITIN_MX); // MX preferred
    expect(pref.tier).toBe("PREFERRED");
    expect(pref.sdnScreeningRequired).toBe(true);
    expect(pref.note).toMatch(/SDN|sanctions/i);
  });

  it("ELEVATED/RESTRICTED jurisdictions require Enhanced Due Diligence; PREFERRED does not", () => {
    expect(assessForeignNationalEligibility({ ...ITIN_MX, countryCode: "CN" }).requiresEnhancedDueDiligence).toBe(true); // elevated
    expect(assessForeignNationalEligibility({ ...ITIN_MX, countryCode: "RU" }).requiresEnhancedDueDiligence).toBe(true); // restricted
    expect(assessForeignNationalEligibility(ITIN_MX).requiresEnhancedDueDiligence).toBe(false); // preferred
  });

  it("prohibited country can't lend AND still flags SDN screening", () => {
    const ir = assessForeignNationalEligibility({ ...ITIN_MX, countryCode: "IR" });
    expect(ir.canLend).toBe(false);
    expect(ir.sdnScreeningRequired).toBe(true);
  });

  it("checklist includes beneficial-ownership + control-person (CDD Rule)", () => {
    const ids = getForeignNationalDocumentChecklist(ITIN_MX).map((d) => d.id);
    expect(ids).toContain("beneficial_ownership");
    expect(ids).toContain("control_person_id");
  });
});

describe("doc checklist", () => {
  it("ITIN adds passport + ITIN letter + foreign credit", () => {
    const ids = getForeignNationalDocumentChecklist(ITIN_MX).map((d) => d.id);
    expect(ids).toContain("itin_letter");
    expect(ids).toContain("passport");
    expect(ids).toContain("foreign_credit_report");
  });
});

describe("FIRPTA (§6)", () => {
  it("$500k sale / $50k gain → $75k federal (15% gross), certificate recommended", () => {
    const r = calculateFIRPTAImpact({ salePrice: 500_000, adjustedBasis: 450_000, state: "TX", isUsResident: false });
    expect(r.federalWithholdingAmount).toBe(75_000);
    expect(r.estimatedTaxOnGain).toBe(10_000);
    expect(r.withholdingCertificateRecommended).toBe(true);
    expect(r.potentialRefund).toBe(65_000);
  });

  it("U.S. resident is exempt", () => {
    const r = calculateFIRPTAImpact({ salePrice: 500_000, adjustedBasis: 450_000, state: "NY", isUsResident: true });
    expect(r.totalWithholding).toBe(0);
  });

  it("NY adds 10.9% state withholding on the gain", () => {
    const r = calculateFIRPTAImpact({ salePrice: 500_000, adjustedBasis: 450_000, state: "NY", isUsResident: false });
    expect(r.stateWithholdingAmount).toBeCloseTo(50_000 * 0.109, 0);
  });

  it("NRA estate exposure above the $60k exemption", () => {
    const n = nraEstateTaxNote(560_000);
    expect(n.exposedValue).toBe(500_000);
    expect(n.estTaxAt40).toBe(200_000);
  });
});
