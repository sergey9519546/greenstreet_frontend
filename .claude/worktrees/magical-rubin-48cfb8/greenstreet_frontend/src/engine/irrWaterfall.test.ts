import { describe, it, expect } from "vitest";
import { computeIRRWaterfall, waterfallStageColor, waterfallSignSymbol } from "./irrWaterfall";
import { computeAfterTaxIRR } from "./taxEngine";
import { calculatePI } from "./engine";
import { buildEngineInputs } from "./inputs";
import type { TaxProfile } from "./types";

const { property, loan, strategy } = buildEngineInputs({
  purchasePrice: 500_000,
  ltv: 70,
  monthlyRent: 3_500,
  state: "TX",
  strategy: "LTR",
  annualTaxes: 8_500,
  annualInsurance: 2_500,
});

const loanAmount = 350_000;
const rate = 7.0;
const qualifyingRent = property.leaseRent;
const piMonthly = calculatePI(loanAmount, rate, 360);
const ads = piMonthly * 12;
const annualNOI = qualifyingRent * 12 * 0.85 - property.annualTaxes - property.annualInsurance;
const pitiaMonthly = piMonthly + property.annualTaxes / 12 + property.annualInsurance / 12;

const taxProfile: TaxProfile = {
  ordinaryIncomeBrackets: [],
  magi: 250_000,
  filingStatus: "MFJ",
  stateTaxRatePct: 0,
  isRealEstateProfessional: false,
  yearsREP: 0,
  landAllocationPct: 20,
  costSegStudyCompleted: false,
  costSegReclassifiedPct: 0,
  acquisitionDate: "2024-01-01",
  placedInServiceDate: "2024-01-01",
  expectedHoldYears: 5,
  exitSellingCostsPct: 6,
  exitCapRatePct: 6.5,
  section1031Exchange: false,
};

const cashInvested = property.purchasePrice - loanAmount;
const afterTaxIRR = computeAfterTaxIRR(
  property.purchasePrice,
  loanAmount,
  qualifyingRent,
  annualNOI,
  ads,
  pitiaMonthly,
  taxProfile,
  0,
  rate,
  360,
);
const wf = computeIRRWaterfall(
  afterTaxIRR,
  property,
  loan,
  strategy,
  rate,
  qualifyingRent,
  loanAmount,
  cashInvested,
  0,
);

describe("computeIRRWaterfall — Year 1", () => {
  it("has 16 stages from gross rent to after-tax cash flow", () => {
    expect(wf.year1.stages).toHaveLength(16);
    expect(wf.year1.stages[0].label).toMatch(/Gross Scheduled Rent/);
    expect(wf.year1.stages[0].sign).toBe("ADD");
    expect(wf.year1.stages[15].sign).toBe("TOTAL");
  });

  it("uses annual gross rent = 12 × qualifying rent", () => {
    expect(wf.year1.grossRent).toBe(qualifyingRent * 12);
  });

  it("final TOTAL stage amount equals the after-tax cash flow", () => {
    const last = wf.year1.stages[wf.year1.stages.length - 1];
    expect(last.label).toMatch(/After-Tax Cash Flow/);
    expect(last.amount).toBeCloseTo(wf.year1.afterTaxCF, 0);
  });

  it("NOI is below the gross effective rent subtotal", () => {
    const grossEff = wf.year1.stages.find((s) => s.label === "Gross Effective Rent")!;
    expect(wf.year1.noi).toBeLessThan(grossEff.amount);
  });
});

describe("computeIRRWaterfall — hold total & exit", () => {
  it("exposes the hold-total block tied to the after-tax IRR", () => {
    expect(wf.holdTotal.afterTaxIRR).toBe(afterTaxIRR.afterTaxIRR);
    expect(wf.holdTotal.preTaxIRR).toBe(afterTaxIRR.preTaxIRR);
    expect(wf.holdTotal.cashInvested).toBe(Math.round(cashInvested));
  });

  it("builds an exit block for the final hold year", () => {
    expect(wf.exit.exitYear).toBe(5);
    expect(wf.exit.salePrice).toBeGreaterThan(0);
    expect(wf.exit.netSaleProceeds).toBeLessThan(wf.exit.salePrice); // selling costs deducted
    expect(wf.exit.remainingLoanBalance).toBeGreaterThan(0);
    expect(wf.exit.remainingLoanBalance).toBeLessThan(loanAmount); // amortized down
  });

  it("produces a human-readable summary", () => {
    expect(wf.summary).toMatch(/gross rent/i);
    expect(wf.summary).toMatch(/After-tax IRR/i);
  });
});

describe("waterfall UI helpers", () => {
  it("maps each sign to a color and a symbol", () => {
    expect(waterfallStageColor("ADD")).toContain("emerald");
    expect(waterfallStageColor("SUBTRACT")).toContain("red");
    expect(waterfallSignSymbol("ADD")).toBe("+");
    expect(waterfallSignSymbol("SUBTRACT")).toBe("−");
    expect(waterfallSignSymbol("SUBTOTAL")).toBe("=");
  });
});
