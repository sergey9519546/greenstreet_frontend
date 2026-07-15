import { describe, expect, it } from "vitest";

import {
  PRELIMINARY_ANALYSIS_NOTICE,
  preliminaryAnalysis,
  prepareDscrDeal,
} from "./dscr";

describe("DSCR API safeguards", () => {
  it("uses the lower eligible rent and the higher supported expense total", () => {
    const prepared = prepareDscrDeal({
      rent: 3_000,
      leaseRent: 2_900,
      marketRent: 2_800,
      monthlyExpenses: 400,
      monthlyTaxes: 200,
      monthlyInsurance: 100,
      monthlyHoa: 150,
    });
    expect(prepared.rent).toBe(2_800);
    expect(prepared.monthlyExpenses).toBe(450);
  });

  it("rejects nonfinite and out-of-range values", () => {
    expect(() => prepareDscrDeal({ dscr: Number.POSITIVE_INFINITY })).toThrow();
    expect(() => prepareDscrDeal({ fico: 299 })).toThrow();
    expect(() => prepareDscrDeal({ ltv: 100.01 })).toThrow();
    expect(() => prepareDscrDeal({ dscr: 20, fico: 850, ltv: 100 })).not.toThrow();
  });

  it("always labels results as preliminary and not an approval", () => {
    expect(preliminaryAnalysis({ analysisStatus: "approved", isLoanApproval: true })).toEqual({
      analysisStatus: "preliminary",
      isLoanApproval: false,
      notice: PRELIMINARY_ANALYSIS_NOTICE,
    });
  });
});
