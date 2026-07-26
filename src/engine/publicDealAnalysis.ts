// ============================================================
// Shared public LTR deal analysis
//
// Keep lender qualification (gross rent / PITIA) separate from the investor
// survival view (Track 2 operating cash flow). Public calculators must use
// this rather than independently approximating NOI or cash flow.
// ============================================================

import { calculatePaymentFactor } from './engine';

export interface PublicLtrDealInput {
  purchasePrice: number;
  downPaymentPct: number;
  monthlyRent: number;
  annualRatePct: number;
  annualTaxes: number;
  annualInsurance: number;
  monthlyHoa: number;
  termMonths?: number;
}

export interface PublicLtrDealAnalysis {
  loanAmount: number;
  principalAndInterestMonthly: number;
  taxesMonthly: number;
  insuranceMonthly: number;
  hoaMonthly: number;
  pitiaMonthly: number;
  lenderDscr: number;
  vacancyMonthly: number;
  managementMonthly: number;
  maintenanceMonthly: number;
  track2OperatingIncomeMonthly: number;
  track2Dscr: number;
  investorCashFlowMonthly: number;
  annualNoi: number;
  capRatePct: number;
  debtYieldPct: number;
}

export const PUBLIC_LTR_DEAL_DEFAULTS: PublicLtrDealInput = {
  purchasePrice: 425_000,
  downPaymentPct: 25,
  monthlyRent: 3_000,
  annualRatePct: 7,
  annualTaxes: 5_000,
  annualInsurance: 2_000,
  monthlyHoa: 0,
  termMonths: 360,
};

// These are the same Track 2 operating assumptions used by the core DSCR
// engine for LTR analysis. They are deliberately explicit in the public view.
export const PUBLIC_TRACK2_ASSUMPTIONS = {
  vacancyPct: 8,
  managementPct: 8,
  maintenancePct: 5,
} as const;

function nonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

/**
 * Analyze public LTR debt service and investor operating cash flow.
 *
 * `lenderDscr` answers the lender qualification question using gross rent.
 * `track2Dscr` and `investorCashFlowMonthly` apply vacancy, management, and
 * maintenance before comparing operating income with the full PITIA payment.
 */
export function analyzePublicLtrDeal(input: PublicLtrDealInput): PublicLtrDealAnalysis {
  const purchasePrice = nonNegative(input.purchasePrice);
  const downPaymentPct = Math.min(nonNegative(input.downPaymentPct), 100);
  const monthlyRent = nonNegative(input.monthlyRent);
  const annualRatePct = nonNegative(input.annualRatePct);
  const annualTaxes = nonNegative(input.annualTaxes);
  const annualInsurance = nonNegative(input.annualInsurance);
  const hoaMonthly = nonNegative(input.monthlyHoa);
  const termMonths = Math.max(1, Math.floor(input.termMonths ?? 360));

  const loanAmount = purchasePrice * (1 - downPaymentPct / 100);
  const principalAndInterestMonthly = loanAmount * calculatePaymentFactor(annualRatePct, termMonths);
  const taxesMonthly = annualTaxes / 12;
  const insuranceMonthly = annualInsurance / 12;
  const pitiaMonthly = principalAndInterestMonthly + taxesMonthly + insuranceMonthly + hoaMonthly;

  const vacancyMonthly = monthlyRent * (PUBLIC_TRACK2_ASSUMPTIONS.vacancyPct / 100);
  const managementMonthly = monthlyRent * (PUBLIC_TRACK2_ASSUMPTIONS.managementPct / 100);
  const maintenanceMonthly = monthlyRent * (PUBLIC_TRACK2_ASSUMPTIONS.maintenancePct / 100);
  const track2OperatingIncomeMonthly = monthlyRent - vacancyMonthly - managementMonthly - maintenanceMonthly;

  const lenderDscr = pitiaMonthly > 0 ? monthlyRent / pitiaMonthly : 0;
  const track2Dscr = pitiaMonthly > 0 ? track2OperatingIncomeMonthly / pitiaMonthly : 0;
  const investorCashFlowMonthly = track2OperatingIncomeMonthly - pitiaMonthly;
  const annualNoi = track2OperatingIncomeMonthly * 12 - annualTaxes - annualInsurance - hoaMonthly * 12;

  return {
    loanAmount,
    principalAndInterestMonthly,
    taxesMonthly,
    insuranceMonthly,
    hoaMonthly,
    pitiaMonthly,
    lenderDscr,
    vacancyMonthly,
    managementMonthly,
    maintenanceMonthly,
    track2OperatingIncomeMonthly,
    track2Dscr,
    investorCashFlowMonthly,
    annualNoi,
    capRatePct: purchasePrice > 0 ? (annualNoi / purchasePrice) * 100 : 0,
    debtYieldPct: loanAmount > 0 ? (annualNoi / loanAmount) * 100 : 0,
  };
}

export interface PublicMaxPurchaseInput {
  monthlyRent: number;
  targetLenderDscr: number;
  downPaymentPct: number;
  annualRatePct: number;
  annualTaxes: number;
  annualInsurance: number;
  monthlyHoa?: number;
  termMonths?: number;
}

/** Solve the maximum purchase price from the same lender DSCR/PITIA definition. */
export function solvePublicMaxPurchasePrice(input: PublicMaxPurchaseInput) {
  const monthlyRent = nonNegative(input.monthlyRent);
  const targetLenderDscr = nonNegative(input.targetLenderDscr);
  const downPaymentPct = Math.min(nonNegative(input.downPaymentPct), 100);
  const annualRatePct = nonNegative(input.annualRatePct);
  const annualTaxes = nonNegative(input.annualTaxes);
  const annualInsurance = nonNegative(input.annualInsurance);
  const monthlyHoa = nonNegative(input.monthlyHoa ?? 0);
  const termMonths = Math.max(1, Math.floor(input.termMonths ?? 360));
  const maxPitiaMonthly = targetLenderDscr > 0 ? monthlyRent / targetLenderDscr : 0;
  const maxPrincipalAndInterestMonthly = Math.max(
    0,
    maxPitiaMonthly - annualTaxes / 12 - annualInsurance / 12 - monthlyHoa,
  );
  const paymentFactor = calculatePaymentFactor(annualRatePct, termMonths);
  const maxLoanAmount = paymentFactor > 0 ? maxPrincipalAndInterestMonthly / paymentFactor : 0;
  const loanShare = 1 - downPaymentPct / 100;
  const maxPurchasePrice = loanShare > 0 ? maxLoanAmount / loanShare : 0;

  return {
    maxPitiaMonthly,
    maxPrincipalAndInterestMonthly,
    maxLoanAmount,
    maxPurchasePrice,
    downPayment: Math.max(0, maxPurchasePrice - maxLoanAmount),
  };
}
