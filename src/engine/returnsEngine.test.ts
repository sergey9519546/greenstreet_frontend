import { describe, it, expect } from "vitest";
import {
  computeReturns,
  buildReturnsSchedule,
  deriveExitCapRatePct,
  DEFAULT_EXIT_CAP_SPREAD_PCT,
} from "./returnsEngine";
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

  // Rent is $3,000 here, not the $2,500 this test used to run. At $2,500 the
  // scenario does not cash-flow: NOI lands near $18,300 against roughly $18,876
  // of annual debt service, year-1 cash-on-cash is -2.61%, and the 6.10% entry
  // cap sits below the ~8.39% loan constant — the negative-leverage case
  // leverageCheck.ts describes as resting on appreciation rather than yield. So
  // this asserted that a negatively levered, negative-cash-flow deal "should
  // make money", and only passed because a flat 6.5% exit cap happened to hand
  // that particular entry cap a lenient 40 bp haircut. Deriving the exit cap
  // from the deal's own entry cap surfaced the false premise. The premise is
  // now asserted rather than assumed, and the negative-leverage case this was
  // accidentally covering gets its own test below.
  it("computes positive levered IRR for cash-flowing deal", () => {
    const result = computeReturns(
      property,
      loan,
      3000, // monthly rent — genuinely cash-flowing at this price
      "LTR",
      7.5, // rate
      0, // prepay penalty
      75000 // cash invested (25% down)
    );

    expect(result).toBeDefined();
    // Pin the premise. Without this, "positive IRR" is not the property under
    // test — it is whatever the exit assumption happens to hand back.
    expect(result.year1CashOnCash).toBeGreaterThan(0);
    expect(result.leveredIRR).toBeGreaterThan(0);
    expect(result.leveredIRR).toBeLessThan(50); // Sanity check: not 500% IRR
    expect(result.equityMultiple).toBeGreaterThan(1.0); // Should make money
  });

  it("does not manufacture a positive return for a negatively levered deal", () => {
    // Exactly the scenario the test above used to run: ~6.10% entry cap under a
    // ~8.39% loan constant, year-1 cash-on-cash below zero. With no appreciation
    // assumed, five years of negative carry must not come back as a gain. That
    // is the failure mode a flat exit cap concealed.
    const result = computeReturns(property, loan, 2500, "LTR", 7.5, 0, 75000);

    expect(result.year1CashOnCash).toBeLessThan(0);
    expect(result.leveredIRR).toBeLessThan(0);
    expect(result.equityMultiple).toBeLessThan(1.0);
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

// The single source of truth for "what exit cap applies when the caller
// hasn't chosen one". Every default-exit-cap call site across the app
// (irrWaterfall, structureComparison, TaxEnginePage, ReturnsPage's and
// DecisionSupportPage's slider seeds) imports this instead of hardcoding its
// own flat percentage — this is the regression guard for that bug.
describe("deriveExitCapRatePct / DEFAULT_EXIT_CAP_SPREAD_PCT", () => {
  it("is the documented 75 bps midpoint of the 25-100 bps band", () => {
    // Pinned: ASSUMPTION_BASIS.exitCapRatePct documents "25-100 bps above
    // your entry cap"; 0.75 is that band's midpoint. If this ever needs to
    // change, the ASSUMPTION_BASIS/UI hint copy needs to change with it.
    expect(DEFAULT_EXIT_CAP_SPREAD_PCT).toBe(0.75);
  });

  it("adds the spread on top of the entry cap it is given", () => {
    expect(deriveExitCapRatePct(4.57)).toBeCloseTo(5.32, 10);
    expect(deriveExitCapRatePct(9.49)).toBeCloseTo(10.24, 10);
    expect(deriveExitCapRatePct(0)).toBe(DEFAULT_EXIT_CAP_SPREAD_PCT);
  });

  it("two-pass derivation keeps the implied sale price close to purchase price across a wide price range", () => {
    // Regression guard for the actual verified defect: a flat 6.5% exit cap
    // swung a TX SFR (25% down, 5yr hold) from -19.4% implied sale at
    // $500,000 (4.57% entry cap) to +65.7% at $150,000 (9.49% entry cap) —
    // opposite investment conclusions caused only by the constant being
    // unrelated to either deal's own yield. Deriving the exit cap from each
    // deal's own entry cap should hold the implied sale within a tight band
    // of purchase price across the same range instead.
    const scenarios = [
      { purchasePrice: 500_000, grossRentMonthly: 3_500, annualTaxes: 7_500 },
      { purchasePrice: 150_000, grossRentMonthly: 2_000, annualTaxes: 2_250 },
    ];

    for (const s of scenarios) {
      const base = {
        purchasePrice: s.purchasePrice,
        grossRentMonthly: s.grossRentMonthly,
        annualTaxes: s.annualTaxes,
        annualInsurance: 2_000,
        hoaMonthly: 0,
        ltvPct: 75,
        holdYears: 5,
      };
      const firstPass = buildReturnsSchedule(base);
      const exitCapRatePct = deriveExitCapRatePct(firstPass.metrics.entryCapRatePct);
      const schedule = buildReturnsSchedule({ ...base, exitCapRatePct });

      // Rebuilding with the derived exit cap must not change the entry cap
      // that produced it (no feedback loop).
      expect(schedule.metrics.entryCapRatePct).toBeCloseTo(
        firstPass.metrics.entryCapRatePct,
        10,
      );

      const saleVsPurchasePct =
        (schedule.exit.grossSalePrice / s.purchasePrice - 1) * 100;
      expect(Math.abs(saleVsPurchasePct)).toBeLessThan(10);
    }
  });
});
