// ============================================================
// REFINANCE PROCEEDS GAP (maturity / ARM-reset risk)
// ============================================================
// CRE capital-markets maturity diagnostic, adapted for residential DSCR: at a
// balloon maturity or ARM reset, can the property refinance enough to RETIRE the
// existing balance? The new loan is capped by BOTH the cash-out/rate-term LTV
// AND the DSCR floor — whichever binds first. If the max new loan falls short of
// the current balance, the borrower must bring cash to close (the "proceeds gap")
// — the residential analogue of a CRE refinancing shortfall.
//
// Pure math, reuses calculatePI (same max-loan logic as the 2nd-lien engine).

import { calculatePI } from './engine';

export interface RefiProceedsInput {
  propertyValue: number;     // current / appraised value at refi
  currentBalance: number;    // existing balance that must be retired
  qualifyingRent: number;    // monthly qualifying rent (lesser of lease/market)
  escrowsMonthly: number;    // taxes + insurance + HOA, monthly (for PITIA → DSCR)
  newRate: number;           // projected new note rate (%)
  maxLtvPct?: number;        // default 75 (rate-term); pass 70 for cash-out
  minDscr?: number;          // default 1.0
  termYears?: number;        // default 30
}

export interface RefiProceedsResult {
  maxLoanByLtv: number;      // value × maxLTV
  maxLoanByDscr: number;     // largest loan whose PITIA still clears the DSCR floor
  maxNewLoan: number;        // min(LTV, DSCR) — the real ceiling
  bindingConstraint: 'LTV' | 'DSCR' | 'NONE';
  newPayment: number;        // P&I at maxNewLoan
  canRetireBalance: boolean; // maxNewLoan ≥ currentBalance
  /** currentBalance − maxNewLoan. Positive = cash the borrower must bring to close. */
  proceedsGap: number;
  /** max(0, maxNewLoan − currentBalance) — tappable equity if the refi over-covers. */
  cashOutAvailable: number;
}

export function computeRefiProceedsGap(input: RefiProceedsInput): RefiProceedsResult {
  const maxLtv = (input.maxLtvPct ?? 75) / 100;
  const minDscr = input.minDscr ?? 1.0;
  const termMonths = (input.termYears ?? 30) * 12;

  // LTV-constrained ceiling.
  const maxLoanByLtv = Math.max(0, input.propertyValue * maxLtv);

  // DSCR-constrained ceiling: max total PITIA = rent / minDscr ⇒ max P&I ⇒ max loan.
  const maxPitia = minDscr > 0 ? input.qualifyingRent / minDscr : 0;
  const maxPI = Math.max(0, maxPitia - input.escrowsMonthly);
  const pf = calculatePI(1, input.newRate, termMonths); // payment per $1 borrowed
  const maxLoanByDscr = pf > 0 ? maxPI / pf : 0;

  const maxNewLoan = Math.max(0, Math.round(Math.min(maxLoanByLtv, maxLoanByDscr)));
  const bindingConstraint: 'LTV' | 'DSCR' | 'NONE' =
    maxNewLoan <= 0 ? 'NONE' : maxLoanByLtv < maxLoanByDscr ? 'LTV' : 'DSCR';

  const newPayment = Math.round(calculatePI(maxNewLoan, input.newRate, termMonths));
  const proceedsGap = Math.round(input.currentBalance - maxNewLoan);

  return {
    maxLoanByLtv: Math.round(maxLoanByLtv),
    maxLoanByDscr: Math.round(maxLoanByDscr),
    maxNewLoan,
    bindingConstraint,
    newPayment,
    canRetireBalance: maxNewLoan >= input.currentBalance,
    proceedsGap,
    cashOutAvailable: Math.max(0, -proceedsGap),
  };
}

/**
 * BRRRR Seasoning & Cash-Out Refinance Cap Engine
 *
 * Seasoning Rules (Fannie/Freddie & DSCR Guidelines):
 * - Seasoning < 6 months: Delayed Financing rule (max basis = purchase price + documented rehab).
 * - Seasoning 6-12 months: Cash-out LTV capped at 70% (5% haircut vs 75% standard).
 * - Seasoning > 12 months: Full 75% LTV on new appraised value.
 */
export interface BRRRRSeasoningInput {
  seasoningMonths: number;
  purchasePrice: number;
  documentedRehabCost: number;
  newAppraisedValue: number;
  purpose: 'CASH_OUT' | 'RATE_TERM';
}

export interface BRRRRSeasoningResult {
  allowedMaxLtvPct: number;
  eligibleMaxBasis: number;
  maxLoanAmount: number;
  seasoningTier: '<6_MONTHS_DELAYED_FINANCING' | '6_TO_12_MONTHS' | 'FULL_SEASONED_12_PLUS';
  restrictionNote: string;
}

export function computeBRRRRSeasoningCap(input: BRRRRSeasoningInput): BRRRRSeasoningResult {
  const { seasoningMonths, purchasePrice, documentedRehabCost, newAppraisedValue, purpose } = input;

  if (seasoningMonths < 6) {
    const basisCap = purchasePrice + documentedRehabCost;
    const eligibleMaxBasis = Math.min(newAppraisedValue, basisCap);
    const allowedMaxLtvPct = 75;
    const maxLoanAmount = Math.round(eligibleMaxBasis * (allowedMaxLtvPct / 100));

    return {
      allowedMaxLtvPct,
      eligibleMaxBasis,
      maxLoanAmount,
      seasoningTier: '<6_MONTHS_DELAYED_FINANCING',
      restrictionNote: `Delayed Financing Rule (<6mo seasoning): basis capped at purchase price ($${purchasePrice.toLocaleString()}) + rehab ($${documentedRehabCost.toLocaleString()}) = $${basisCap.toLocaleString()}.`,
    };
  }

  if (seasoningMonths < 12) {
    const allowedMaxLtvPct = purpose === 'CASH_OUT' ? 70 : 75;
    const eligibleMaxBasis = newAppraisedValue;
    const maxLoanAmount = Math.round(eligibleMaxBasis * (allowedMaxLtvPct / 100));

    return {
      allowedMaxLtvPct,
      eligibleMaxBasis,
      maxLoanAmount,
      seasoningTier: '6_TO_12_MONTHS',
      restrictionNote: purpose === 'CASH_OUT'
        ? `6-12 Month Seasoning: cash-out LTV capped at 70% (5% haircut vs 12+ month 75%).`
        : `6-12 Month Seasoning: rate-term refi allowed at 75% LTV on new appraised value.`,
    };
  }

  const allowedMaxLtvPct = 75;
  const eligibleMaxBasis = newAppraisedValue;
  const maxLoanAmount = Math.round(eligibleMaxBasis * (allowedMaxLtvPct / 100));

  return {
    allowedMaxLtvPct,
    eligibleMaxBasis,
    maxLoanAmount,
    seasoningTier: 'FULL_SEASONED_12_PLUS',
    restrictionNote: `Full 12+ Month Seasoning: 75% LTV on new appraised value ($${newAppraisedValue.toLocaleString()}).`,
  };
}
