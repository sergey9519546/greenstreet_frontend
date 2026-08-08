/**
 * Commercial (5+ Unit) DSCR Engine
 *
 * Underwrites 5+ unit multi-family properties using commercial real estate conventions:
 * - NOI = Effective Gross Income (Gross Scheduled Rent × (1 - Vacancy%)) - OpEx
 * - DSCR = NOI ÷ Annual Debt Service
 * - Sanity checks expense ratio (<30% flag) and NOI validity.
 */

import { calculatePI } from "./engine";

export interface CommercialDscrInput {
  unitCount: number;
  grossScheduledRentMonthly: number;
  vacancyRatePct?: number; // default 5%
  operatingExpensesMonthly: number;
  loanAmount: number;
  interestRate: number; // %
  amortizationYears?: number; // default 30
  minDscrFloor?: number; // default 1.25
}

export type CommercialDscrDisposition = "PASS" | "MARGINAL" | "FAIL";

export interface NoiSanity {
  expenseRatioPct: number; // OpEx ÷ EGI
  isUnderstatedOpEx: boolean; // true if expense ratio < 30%
  warningMessage: string | null;
}

export interface CommercialDscrResult {
  effectiveGrossIncomeMonthly: number;
  noiMonthly: number;
  noiAnnual: number;
  debtServiceMonthly: number;
  debtServiceAnnual: number;
  dscr: number;
  disposition: CommercialDscrDisposition;
  noiSanity: NoiSanity;
}

export function computeCommercialDscr(input: CommercialDscrInput): CommercialDscrResult {
  const vacancyRate = (input.vacancyRatePct ?? 5) / 100;
  const amortYears = input.amortizationYears ?? 30;
  const minFloor = input.minDscrFloor ?? 1.25;

  const grossMonthly = input.grossScheduledRentMonthly;
  const egiMonthly = grossMonthly * (1 - vacancyRate);
  const opexMonthly = input.operatingExpensesMonthly;
  const noiMonthly = egiMonthly - opexMonthly;
  const noiAnnual = noiMonthly * 12;

  const debtServiceMonthly = calculatePI(input.loanAmount, input.interestRate, amortYears * 12);
  const debtServiceAnnual = debtServiceMonthly * 12;

  const dscr = debtServiceAnnual > 0 ? noiAnnual / debtServiceAnnual : 0;

  let disposition: CommercialDscrDisposition;
  if (dscr >= minFloor) {
    disposition = "PASS";
  } else if (dscr >= 1.0) {
    disposition = "MARGINAL";
  } else {
    disposition = "FAIL";
  }

  const expenseRatioPct = egiMonthly > 0 ? (opexMonthly / egiMonthly) * 100 : 0;
  const isUnderstatedOpEx = expenseRatioPct < 30 && egiMonthly > 0;
  const warningMessage = isUnderstatedOpEx
    ? `WARNING: Reported operating expenses are only ${expenseRatioPct.toFixed(1)}% of Effective Gross Income. Commercial 5+ unit properties typically require 35–45% OpEx. Verify tax, insurance, management, and reserve line items.`
    : null;

  return {
    effectiveGrossIncomeMonthly: Math.round(egiMonthly),
    noiMonthly: Math.round(noiMonthly),
    noiAnnual: Math.round(noiAnnual),
    debtServiceMonthly: Math.round(debtServiceMonthly),
    debtServiceAnnual: Math.round(debtServiceAnnual),
    dscr: Math.round(dscr * 1000) / 1000,
    disposition,
    noiSanity: {
      expenseRatioPct: Math.round(expenseRatioPct * 10) / 10,
      isUnderstatedOpEx,
      warningMessage,
    },
  };
}
