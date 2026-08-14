import { describe, expect, it } from "vitest";
import {
  compareLoanStructures,
  STRUCTURE_COMPARISON_ASSUMPTIONS,
} from "./structureComparison";
import { DEFAULT_EXIT_CAP_SPREAD_PCT } from "../engine/returnsEngine";

describe("compareLoanStructures", () => {
  it("does not invent five-year IRR for structures the returns engine does not model", () => {
    const comparison = compareLoanStructures({
      purchasePrice: 500_000,
      downPaymentPct: 25,
      monthlyRent: 3_500,
      ficoScore: 740,
    });
    const { structures: results } = comparison;

    expect(results).toHaveLength(3);
    expect(results.find((result) => result.id === "fixed")?.afterTaxIrrPct).toEqual(
      expect.any(Number),
    );
    expect(results.find((result) => result.id === "interest-only")).toMatchObject({
      afterTaxIrrPct: null,
      deal: { monthlyPITIA: { isInterestOnly: true } },
    });
    expect(results.find((result) => result.id === "arm")?.afterTaxIrrPct).toBeNull();

    for (const result of results) {
      expect(Number.isFinite(result.cashOnCashPct)).toBe(true);
    }
  });

  it("derives cash-on-cash from expense-aware cash flow", () => {
    const comparison = compareLoanStructures({
      purchasePrice: 500_000,
      downPaymentPct: 25,
      monthlyRent: 3_500,
      ficoScore: 740,
    });
    const { structures: results } = comparison;

    for (const result of results) {
      const expenseAwareMonthlyCashFlow =
        result.deal.dualTrackDSCR.track2.monthlyCashFlow;
      const expected =
        (expenseAwareMonthlyCashFlow * 12 * 100) /
        result.deal.cashToClose.total;

      expect(result.cashOnCashPct).toBeCloseTo(expected, 10);
      expect(Math.sign(result.cashOnCashPct)).toBe(
        Math.sign(expenseAwareMonthlyCashFlow),
      );
    }

    expect(results.every((result) => result.cashOnCashPct < 0)).toBe(true);
  });

  it("publishes every material fixed scenario assumption", () => {
    // `exitCapRatePct` is deliberately NOT in this static object anymore — it
    // is derived per scenario (see the "derives the exit cap..." test below),
    // so unlike these fields it cannot be known until a deal has been run.
    expect(STRUCTURE_COMPARISON_ASSUMPTIONS).toEqual({
      state: "TX",
      propertyType: "SFR",
      annualPropertyTaxRatePct: 1.5,
      annualInsurance: 2_000,
      monthlyHoa: 0,
      holdYears: 5,
      taxProfile: "returns-engine-default",
    });
  });

  it("derives the exit cap from this scenario's own entry cap instead of a flat constant", () => {
    // Regression guard for the flat-6.5%-exit-cap bug: the exit cap must move
    // with the deal (entry cap + the documented spread), not sit at the same
    // value regardless of what the deal itself yields.
    const cheap = compareLoanStructures({
      purchasePrice: 150_000,
      downPaymentPct: 25,
      monthlyRent: 2_000,
      ficoScore: 740,
    });
    const expensive = compareLoanStructures({
      purchasePrice: 500_000,
      downPaymentPct: 25,
      monthlyRent: 3_500,
      ficoScore: 740,
    });

    for (const comparison of [cheap, expensive]) {
      const { entryCapRatePct, exitCapRatePct } = comparison.assumptions;
      expect(exitCapRatePct).toBeCloseTo(
        entryCapRatePct + DEFAULT_EXIT_CAP_SPREAD_PCT,
        10,
      );
    }

    // The two scenarios have very different entry caps (cheap price / fixed
    // rent-style inputs vs. an expensive one), so a correctly-derived exit
    // cap must differ between them too — a flat constant would not.
    expect(cheap.assumptions.exitCapRatePct).not.toBeCloseTo(
      expensive.assumptions.exitCapRatePct,
      1,
    );
  });

  it("exposes the actual Track 2 and fixed-rate schedule inputs for disclosure", () => {
    const comparison = compareLoanStructures({
      purchasePrice: 500_000,
      downPaymentPct: 25,
      monthlyRent: 3_500,
      ficoScore: 740,
    });

    const fixed = comparison.structures.find((result) => result.id === "fixed")!;

    expect(comparison.assumptions.cashOnCash).toEqual({
      vacancyPct: fixed.deal.dualTrackDSCR.track2.vacancyApplied,
      managementPct: fixed.deal.dualTrackDSCR.track2.managementApplied,
      maintenancePct: fixed.deal.dualTrackDSCR.track2.maintenanceApplied,
      capExReservePct: fixed.deal.dualTrackDSCR.track2.capexApplied,
    });
    expect(comparison.assumptions.fixedRateIrr).toMatchObject({
      rentGrowthPct: 2,
      vacancyPct: 8,
      managementPct: 8,
      maintenancePct: 5,
      turnoverPct: 2,
      capExReservePct: 5,
      expenseGrowthPct: 0,
      sellingCostsPct: 6,
      tax: {
        ordinaryRatePct: 32,
        stateRatePct: 5,
        filingStatus: "MFJ",
        magi: 250_000,
        landAllocationPct: 20,
        costSegStudyCompleted: false,
        section1031Exchange: false,
        isRealEstateProfessional: false,
      },
    });
  });
});
