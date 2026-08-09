import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import {
  assumptionsFromV11,
  buildReturnsSchedule,
  DEFAULT_TAX_ASSUMPTIONS,
} from "../engine/returnsEngine";

export interface StructureComparisonInput {
  purchasePrice: number;
  downPaymentPct: number;
  monthlyRent: number;
  ficoScore: number;
}

function annualCashOnCash(
  monthlyCashFlow: number,
  cashToClose: number,
): number {
  return cashToClose > 0 ? (monthlyCashFlow * 12 * 100) / cashToClose : 0;
}

export function compareLoanStructures(input: StructureComparisonInput) {
  const engineInputs = buildEngineInputs({
    purchasePrice: input.purchasePrice,
    loanAmount: input.purchasePrice * (1 - input.downPaymentPct / 100),
    monthlyRent: input.monthlyRent,
    state: "TX",
    ficoScore: input.ficoScore,
    propertyType: "SFR" as const,
    annualTaxes: input.purchasePrice * 0.015,
    annualInsurance: 2_000,
    hoa: 0,
  });

  const fixed = solveDSCR(
    engineInputs.property,
    engineInputs.borrower,
    engineInputs.loan,
    engineInputs.strategy,
  );
  const interestOnly = solveDSCR(
    engineInputs.property,
    engineInputs.borrower,
    { ...engineInputs.loan, ioPeriod: "10_YR" },
    engineInputs.strategy,
  );
  const arm = solveDSCR(
    engineInputs.property,
    engineInputs.borrower,
    { ...engineInputs.loan, armType: "5_6_ARM" },
    engineInputs.strategy,
  );

  const grossRentMonthly = Math.min(
    engineInputs.property.leaseRent,
    engineInputs.property.marketRent,
  );
  const fixedSchedule = buildReturnsSchedule({
    ...assumptionsFromV11(
      engineInputs.property,
      engineInputs.loan,
      grossRentMonthly,
      engineInputs.strategy,
      fixed.solvedRate,
      0,
      fixed.cashToClose.total,
    ),
    exitCapRatePct: 6.5,
    holdYears: 5,
    tax: { ...DEFAULT_TAX_ASSUMPTIONS, enabled: true },
  });

  return [
    {
      id: "fixed" as const,
      name: "30-Year Fixed",
      deal: fixed,
      cashOnCashPct: annualCashOnCash(
        fixed.dualTrackDSCR.track1.monthlyCashFlow,
        fixed.cashToClose.total,
      ),
      afterTaxIrrPct: fixedSchedule.metrics.afterTaxIrrPct,
    },
    {
      id: "interest-only" as const,
      name: "10-Year Interest Only",
      deal: interestOnly,
      cashOnCashPct: annualCashOnCash(
        interestOnly.dualTrackDSCR.track1.monthlyCashFlow,
        interestOnly.cashToClose.total,
      ),
      afterTaxIrrPct: null,
    },
    {
      id: "arm" as const,
      name: "5/6 ARM",
      deal: arm,
      cashOnCashPct: annualCashOnCash(
        arm.dualTrackDSCR.track1.monthlyCashFlow,
        arm.cashToClose.total,
      ),
      afterTaxIrrPct: null,
    },
  ];
}
