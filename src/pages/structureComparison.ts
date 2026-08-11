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

export const STRUCTURE_COMPARISON_ASSUMPTIONS = {
  state: "TX",
  propertyType: "SFR",
  annualPropertyTaxRatePct: 1.5,
  annualInsurance: 2_000,
  monthlyHoa: 0,
  exitCapRatePct: 6.5,
  holdYears: 5,
  taxProfile: "returns-engine-default",
} as const;

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
    state: STRUCTURE_COMPARISON_ASSUMPTIONS.state,
    ficoScore: input.ficoScore,
    propertyType: STRUCTURE_COMPARISON_ASSUMPTIONS.propertyType,
    annualTaxes:
      input.purchasePrice *
      (STRUCTURE_COMPARISON_ASSUMPTIONS.annualPropertyTaxRatePct / 100),
    annualInsurance: STRUCTURE_COMPARISON_ASSUMPTIONS.annualInsurance,
    hoa: STRUCTURE_COMPARISON_ASSUMPTIONS.monthlyHoa,
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
    exitCapRatePct: STRUCTURE_COMPARISON_ASSUMPTIONS.exitCapRatePct,
    holdYears: STRUCTURE_COMPARISON_ASSUMPTIONS.holdYears,
    tax: { ...DEFAULT_TAX_ASSUMPTIONS, enabled: true },
  });

  return [
    {
      id: "fixed" as const,
      name: "30-Year Fixed",
      deal: fixed,
      cashOnCashPct: annualCashOnCash(
        fixed.dualTrackDSCR.track2.monthlyCashFlow,
        fixed.cashToClose.total,
      ),
      afterTaxIrrPct: fixedSchedule.metrics.afterTaxIrrPct,
    },
    {
      id: "interest-only" as const,
      name: "10-Year Interest Only",
      deal: interestOnly,
      cashOnCashPct: annualCashOnCash(
        interestOnly.dualTrackDSCR.track2.monthlyCashFlow,
        interestOnly.cashToClose.total,
      ),
      afterTaxIrrPct: null,
    },
    {
      id: "arm" as const,
      name: "5/6 ARM",
      deal: arm,
      cashOnCashPct: annualCashOnCash(
        arm.dualTrackDSCR.track2.monthlyCashFlow,
        arm.cashToClose.total,
      ),
      afterTaxIrrPct: null,
    },
  ];
}
