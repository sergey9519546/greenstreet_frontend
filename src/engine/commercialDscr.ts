// ============================================================
// COMMERCIAL DSCR (5+ unit convention: NOI ÷ annual debt service)
// ============================================================
// Residential 1–4 unit DSCR everywhere else in this engine uses the
// Rent ÷ PITIA convention. For 5+ unit (commercial multifamily) the
// underwriting convention differs: DSCR = NOI ÷ annual P&I, where NOI
// nets vacancy AND operating expenses out of gross rent. This engine
// surfaces that method and flags an understated-expense NOI so a
// borrower can't inflate coverage by ignoring opex.
//
// Pure math, reuses calculatePI. No LLM calls.

import { calculatePI } from './engine';

export interface CommercialDscrInput {
  grossRentAnnual: number;      // gross potential rent, annual
  vacancyPct?: number;          // economic vacancy, default 5
  /** Operating expenses, annual. If omitted, derived from expenseRatioPct of EGI. */
  operatingExpensesAnnual?: number;
  /** Opex as % of effective gross income. Used only when operatingExpensesAnnual omitted. Default 40. */
  expenseRatioPct?: number;
  loanAmount: number;
  rate: number;                 // annual note rate (%)
  termYears?: number;           // amortization, default 30
  minDscr?: number;             // lender floor, default 1.25 (commercial norm)
}

export type CommercialDscrDisposition = 'PASS' | 'MARGINAL' | 'FAIL';
export type NoiSanity = 'PLAUSIBLE' | 'EXPENSES_LIKELY_UNDERSTATED';

export interface CommercialDscrResult {
  effectiveGrossIncome: number; // gross − vacancy
  operatingExpenses: number;    // resolved opex used
  noiAnnual: number;            // EGI − opex
  annualDebtService: number;    // 12 × P&I
  dscr: number;
  disposition: CommercialDscrDisposition;
  /** opex ÷ EGI, as a percentage. */
  expenseRatioPct: number;
  /** 5+ unit expense ratios below ~30% almost always mean opex was understated. */
  noiSanity: NoiSanity;
}

export function computeCommercialDscr(input: CommercialDscrInput): CommercialDscrResult {
  const vacancy = (input.vacancyPct ?? 5) / 100;
  const minDscr = input.minDscr ?? 1.25;
  const termMonths = (input.termYears ?? 30) * 12;

  const egi = Math.max(0, input.grossRentAnnual * (1 - vacancy));
  const opex =
    input.operatingExpensesAnnual != null
      ? Math.max(0, input.operatingExpensesAnnual)
      : egi * ((input.expenseRatioPct ?? 40) / 100);
  const noi = egi - opex;

  const annualDebtService = calculatePI(input.loanAmount, input.rate, termMonths) * 12;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

  const disposition: CommercialDscrDisposition =
    dscr >= minDscr ? 'PASS' : dscr >= minDscr - 0.1 ? 'MARGINAL' : 'FAIL';

  const expenseRatioPct = egi > 0 ? (opex / egi) * 100 : 0;
  const noiSanity: NoiSanity =
    egi > 0 && expenseRatioPct < 30 ? 'EXPENSES_LIKELY_UNDERSTATED' : 'PLAUSIBLE';

  return {
    effectiveGrossIncome: Math.round(egi),
    operatingExpenses: Math.round(opex),
    noiAnnual: Math.round(noi),
    annualDebtService: Math.round(annualDebtService),
    dscr: Math.round(dscr * 1000) / 1000,
    disposition,
    expenseRatioPct: Math.round(expenseRatioPct * 10) / 10,
    noiSanity,
  };
}
