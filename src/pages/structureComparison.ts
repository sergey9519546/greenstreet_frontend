import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import {
  assumptionsFromV11,
  buildReturnsSchedule,
  deriveExitCapRatePct,
  DEFAULT_TAX_ASSUMPTIONS,
} from "../engine/returnsEngine";

export interface StructureComparisonInput {
  purchasePrice: number;
  downPaymentPct: number;
  monthlyRent: number;
  ficoScore: number;
}

// `exitCapRatePct` used to live here as a flat 6.5% — deliberately removed.
// It is now DERIVED per scenario (this deal's own entry cap +
// returnsEngine.DEFAULT_EXIT_CAP_SPREAD_PCT), so unlike the fields below it
// cannot be known until `compareLoanStructures` has run the schedule once.
// The actual applied value is still published, via the returned
// `assumptions.exitCapRatePct` below.
export const STRUCTURE_COMPARISON_ASSUMPTIONS = {
  state: "TX",
  propertyType: "SFR",
  annualPropertyTaxRatePct: 1.5,
  annualInsurance: 2_000,
  monthlyHoa: 0,
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
  const returnsBase = assumptionsFromV11(
    engineInputs.property,
    engineInputs.loan,
    grossRentMonthly,
    engineInputs.strategy,
    fixed.solvedRate,
    0,
    fixed.cashToClose.total,
  );
  // Two-pass derived exit cap: entry cap (year-1 NOI ÷ purchase price) does
  // not depend on the exit cap, so the first pass's entry cap is already
  // final by the time it returns — safe to rebuild with the derived value.
  // See returnsEngine.deriveExitCapRatePct for why this is safe and why 0.75.
  const entryCapPass = buildReturnsSchedule({
    ...returnsBase,
    holdYears: STRUCTURE_COMPARISON_ASSUMPTIONS.holdYears,
    tax: { ...DEFAULT_TAX_ASSUMPTIONS, enabled: true },
  });
  const derivedExitCapRatePct = deriveExitCapRatePct(
    entryCapPass.metrics.entryCapRatePct,
  );
  const fixedSchedule = buildReturnsSchedule({
    ...returnsBase,
    exitCapRatePct: derivedExitCapRatePct,
    holdYears: STRUCTURE_COMPARISON_ASSUMPTIONS.holdYears,
    tax: { ...DEFAULT_TAX_ASSUMPTIONS, enabled: true },
  });

  const returnAssumptions = fixedSchedule.assumptions;
  const track2 = fixed.dualTrackDSCR.track2;

  return {
    structures: [
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
    ],
    assumptions: {
      ...STRUCTURE_COMPARISON_ASSUMPTIONS,
      annualTaxes: returnAssumptions.annualTaxes,
      annualInsurance: returnAssumptions.annualInsurance,
      monthlyHoa: returnAssumptions.hoaMonthly,
      exitCapRatePct: fixedSchedule.exit.exitCapRatePct,
      holdYears: fixedSchedule.exit.year,
      // The exit cap is the single input that decides this IRR, and stating it
      // as a bare percentage hides what it assumes about the property. It is
      // no longer a flat constant (that priced every deal off the same 6.5%
      // regardless of what the deal itself yielded) — it is now this
      // scenario's own entry cap plus returnsEngine.DEFAULT_EXIT_CAP_SPREAD_PCT
      // (the midpoint of the "25-100 bps above your entry cap" band
      // returnsEngine documents). Surfacing the resulting price and the
      // spread so the assumption is legible, the way DecisionSupportPage
      // already shows its spread.
      entryCapRatePct: fixedSchedule.metrics.entryCapRatePct,
      impliedSalePrice: fixedSchedule.exit.grossSalePrice,
      purchasePrice: input.purchasePrice,
      cashOnCash: {
        vacancyPct: track2.vacancyApplied,
        managementPct: track2.managementApplied,
        maintenancePct: track2.maintenanceApplied,
        capExReservePct: track2.capexApplied ?? 0,
      },
      fixedRateIrr: {
        rentGrowthPct: returnAssumptions.rentGrowthPct,
        vacancyPct: returnAssumptions.vacancyPct,
        managementPct: returnAssumptions.managementPct,
        maintenancePct: returnAssumptions.maintenancePct,
        turnoverPct: returnAssumptions.turnoverPct,
        capExReservePct: returnAssumptions.capExReservePct,
        expenseGrowthPct: returnAssumptions.expenseGrowthPct,
        sellingCostsPct: returnAssumptions.sellingCostsPct,
        tax: {
          ordinaryRatePct: returnAssumptions.tax.ordinaryRatePct,
          stateRatePct: returnAssumptions.tax.stateRatePct,
          filingStatus: returnAssumptions.tax.filingStatus,
          magi: returnAssumptions.tax.magi,
          landAllocationPct: returnAssumptions.tax.landAllocationPct,
          costSegStudyCompleted: returnAssumptions.tax.costSegStudyCompleted,
          section1031Exchange: returnAssumptions.tax.section1031Exchange,
          isRealEstateProfessional:
            returnAssumptions.tax.isRealEstateProfessional,
        },
      },
    },
  };
}
