// ============================================================
// DSCR Deal Desk v11.13 — IRR Waterfall Engine
// Decomposes the after-tax IRR pipeline into a transparent
// waterfall: Gross Rent → OpEx → NOI → Debt Service → Taxable →
// Tax → After-Tax CF → Exit → IRR.
// ============================================================
//
// PURPOSE
// ───────
// The existing AfterTaxIRRResult has year-by-year detail but
// doesn't expose the *gross rent → opex → NOI → debt service →
// tax → after-tax* decomposition. This engine reconstructs that
// pipeline for both Year-1 (most-watched) and hold-total views,
// making it visible WHERE every dollar of rent goes.
//
// WATERFALL STAGES
// ────────────────
//  1. Gross Scheduled Rent       (ADD)
//  2. - Vacancy Loss             (SUBTRACT)
//  3. = Gross Effective Rent     (SUBTOTAL)
//  4. - Property Taxes           (SUBTRACT)
//  5. - Insurance + HOA + Flood  (SUBTRACT)
//  6. - Property Management      (SUBTRACT)
//  7. - Maintenance               (SUBTRACT)
//  8. = NOI                       (SUBTOTAL)
//  9. - Interest                  (SUBTRACT)
// 10. - Principal                 (SUBTRACT)
// 11. = Pre-Tax CF                (SUBTOTAL)
// 12. - Depreciation Deduction    (SUBTRACT — but tax-only, not cash)
// 13. = Taxable Income            (SUBTOTAL)
// 14. - Federal Tax               (SUBTRACT)
// 15. - State Tax                 (SUBTRACT)
// 16. = After-Tax CF              (TOTAL)
// ============================================================

import type {
  PropertyInputs,
  LoanStructure,
  RentalStrategy,
  AfterTaxIRRResult,
  IRRWaterfallResult,
  IRRWaterfallStage,
  IRRWaterfallYear1,
  IRRWaterfallExit,
  WaterfallSign,
} from './types';
import { calculatePI } from './engine';
import { computeTcoRate, mapToTcoType } from './tcoDscr';
import { deriveExitCapRatePct } from './returnsEngine';

// ============================================================
// MAIN ENTRY POINT
// ============================================================

/**
 * Build an IRR waterfall from existing after-tax IRR result.
 *
 * @param afterTaxIRR  Output of computeAfterTaxIRR (year-by-year + totals)
 * @param property     Property inputs (for taxes, insurance, HOA, flood)
 * @param loan         Loan structure (for LTV reference)
 * @param strategy     Rental strategy (drives vacancy assumption)
 * @param solvedRate   Solved interest rate (%)
 * @param monthlyGrossRent  Raw monthly strategy rent before Track 1 or Track 2 haircuts
 * @param loanAmount   Loan principal
 * @param cashInvested Initial cash outflow (down payment + closing costs)
 * @param prepayPenaltyAtExit  Prepay penalty paid at exit
 * @returns             IRRWaterfallResult with year1 + holdTotal + exit
 */
export function computeIRRWaterfall(
  afterTaxIRR: AfterTaxIRRResult,
  property: PropertyInputs,
  loan: LoanStructure,
  strategy: RentalStrategy,
  solvedRate: number,
  monthlyGrossRent: number,
  loanAmount: number,
  cashInvested: number,
  prepayPenaltyAtExit: number,
): IRRWaterfallResult {
  // ── Track 2 expense assumptions (TCO single source of truth) ──
  // This waterfall is an investor cash-flow view, so it must start with the
  // raw strategy rent. `solveDSCR().track1.qualifyingRent` is already reduced
  // for STR/MTR lender qualification and would apply a second vacancy haircut
  // here. Management and maintenance also follow Track 2 and are calculated
  // from gross scheduled rent, not rent remaining after vacancy.
  //
  // Rates come from tcoDscr.computeTcoRate — the same call engine.buildTrack2
  // makes — so the waterfall and the Track 2 DSCR can never drift apart. The
  // legacy flat TRACK2_* constants (8% vac / 8% mgmt / 5% maint) were removed
  // in the TCO reconciliation.
  //
  // CapEx (rate.capex) is deliberately NOT a waterfall stage: this waterfall
  // decomposes NOI → debt service → tax → after-tax CF, and under standard
  // real-estate convention NOI excludes capital expenditure. Adding it here
  // would also break the tie-out to `afterTaxIRR.yearByYear`, which is computed
  // by taxEngine from an NOI that carries no CapEx line. Track 2 DSCR keeps
  // CapEx because it is a deliberately conservative survival metric.
  const tcoRate = computeTcoRate({
    propertyType: mapToTcoType(property.unitCount, strategy === 'STR'),
  });
  const vacancyPct = tcoRate.vacancy * 100;
  const managementPct = tcoRate.management * 100;
  const maintenancePct = tcoRate.maintenance * 100;

  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
  const termMonths = termYears * 12;

  // ── Year 1 base figures ──
  const annualGrossRent = monthlyGrossRent * 12;
  const annualVacancy = annualGrossRent * (vacancyPct / 100);
  const grossEffectiveRent = annualGrossRent - annualVacancy;
  const annualTaxes = property.annualTaxes;
  // Bug audit #1 (unit convention): property.floodInsurance and property.hoa are
  // both already MONTHLY (see calculatePITIA in engine.ts) — ×12 annualizes them
  // here so they combine correctly with the already-annual property.annualInsurance.
  const annualInsurance = property.annualInsurance + property.floodInsurance * 12 + property.hoa * 12;
  const annualMgmt = annualGrossRent * (managementPct / 100);
  const annualMaint = annualGrossRent * (maintenancePct / 100);
  const noi = grossEffectiveRent - annualTaxes - annualInsurance - annualMgmt - annualMaint;

  // ── Debt service breakdown (Year 1) ──
  const monthlyPI = calculatePI(loanAmount, solvedRate, termMonths);
  const monthlyInterest = (loanAmount * solvedRate / 100) / 12;
  const annualInterest = monthlyInterest * 12;
  const annualPrincipal = (monthlyPI - monthlyInterest) * 12;
  const annualADS = monthlyPI * 12 + (property.annualTaxes + property.annualInsurance + property.hoa + property.floodInsurance) * 1; // P&I + escrows
  // Note: ADS for IRR purposes typically = P&I only (escrows are operating expenses)
  // But for the existing taxEngine, preTaxNCF = NOI - ADS where ADS = P&I only
  const annualADSPiOnly = monthlyPI * 12;

  // ── Year 1 waterfall stages ──
  const year1Row = afterTaxIRR.yearByYear[0];
  const year1Depreciation = year1Row.depreciationDeduction;
  const year1TaxableIncome = year1Row.taxableIncome;
  const year1FederalTax = year1Row.federalTax;
  const year1StateTax = year1Row.stateTax;
  const year1AfterTaxCF = year1Row.afterTaxNCF;
  const year1PreTaxCF = year1Row.preTaxNCF;

  const year1: IRRWaterfallYear1 = {
    grossRent: annualGrossRent,
    noi: Math.round(noi * 100) / 100,
    preTaxCF: year1PreTaxCF,
    afterTaxCF: year1AfterTaxCF,
    effectiveTaxRate: year1PreTaxCF > 0
      ? Math.round(((year1FederalTax + year1StateTax) / year1PreTaxCF) * 1000) / 10
      : 0,
    depreciationShieldPct: noi > 0
      ? Math.round((year1Depreciation / noi) * 1000) / 10
      : 0,
    stages: buildYear1Stages(
      annualGrossRent, annualVacancy, grossEffectiveRent,
      annualTaxes, annualInsurance, annualMgmt, annualMaint,
      noi, annualInterest, annualPrincipal, annualADSPiOnly,
      year1PreTaxCF, year1Depreciation, year1TaxableIncome,
      year1FederalTax, year1StateTax, year1AfterTaxCF,
    ),
  };

  // ── Hold-total waterfall ──
  const totalOperatingCF = afterTaxIRR.yearByYear.reduce((sum, r) => sum + r.afterTaxNCF, 0);
  const totalDepreciation = afterTaxIRR.yearByYear.reduce((sum, r) => sum + r.depreciationDeduction, 0);
  const totalFederalTax = afterTaxIRR.yearByYear.reduce((sum, r) => sum + r.federalTax, 0);
  const totalStateTax = afterTaxIRR.yearByYear.reduce((sum, r) => sum + r.stateTax, 0);
  const totalPreTaxCF = afterTaxIRR.yearByYear.reduce((sum, r) => sum + r.preTaxNCF, 0);

  // Exit waterfall
  const exitYear = afterTaxIRR.yearByYear.length;
  const holdYears = exitYear;

  // v11 FIX (bug audit #3 family, dead-code cleanup): a prior "reverse-engineer
  // exit proceeds from the XIRR" attempt lived here. It divided the already-decimal
  // afterTaxIRR.afterTaxIRR/preTaxIRR by 100 again (the same double-scaling bug
  // fixed in v11Runner.ts), and its result (exitAfterTax / exitAfterTaxImplied) was
  // never actually used — the real netAfterTaxExit below is computed directly from
  // the sale-price waterfall (NOI_exit / capRate → sale proceeds → less loan
  // payoff/prepay penalty/exit tax), not from an IRR-implied reverse solve. Removed
  // rather than fixed in place, since it was dead code either way.

  // Exit waterfall components (best-effort decomposition)
  // We know:
  //   exitAfterTax = salePrice - sellingCosts - remainingLoanBalance - prepayPenalty - totalTaxOnExit
  //   salePrice = NOI_exit / capRate (with rent growth)
  // We can estimate from afterTaxIRR data + reverse-engineer
  const rentGrowthPct = 0.02;
  const noiExit = noi * Math.pow(1 + rentGrowthPct, holdYears);
  // Exit cap is DERIVED from this waterfall's own entry cap (year-1 NOI ÷
  // purchase price) via the shared returnsEngine formula — not a flat
  // constant. A flat 6.5% here used to silently disagree with the entry cap
  // on every deal where the two weren't already close, the exact bug fixed in
  // returnsEngine.ts (see DEFAULT_EXIT_CAP_SPREAD_PCT there for the 25-100bps
  // band this spread comes from). `deriveExitCapRatePct` works in percent
  // (matching `ReturnsMetrics.entryCapRatePct`); this waterfall works in
  // decimal fractions, hence the /100.
  const entryCapRatePct = property.purchasePrice > 0 ? (noi / property.purchasePrice) * 100 : 0;
  const exitCapRate = deriveExitCapRatePct(entryCapRatePct) / 100;
  const salePrice = exitCapRate > 0 ? noiExit / exitCapRate : 0;
  const sellingCostsPct = 0.06;
  const sellingCosts = salePrice * sellingCostsPct;
  const netSaleProceeds = salePrice - sellingCosts;
  const remainingLoanBalance = computeRemainingBalanceApprox(loanAmount, solvedRate, termMonths, holdYears * 12);
  const totalTaxOnExit = afterTaxIRR.totalTaxOnExit;
  const netAfterTaxExit = netSaleProceeds - remainingLoanBalance - prepayPenaltyAtExit - totalTaxOnExit;

  const exit: IRRWaterfallExit = {
    exitYear: holdYears,
    salePrice: Math.round(salePrice),
    sellingCosts: Math.round(sellingCosts),
    netSaleProceeds: Math.round(netSaleProceeds),
    remainingLoanBalance: Math.round(remainingLoanBalance),
    prepayPenalty: prepayPenaltyAtExit,
    depreciationRecapture: Math.round(totalTaxOnExit * 0.6),  // approximate split
    capitalGainsTax: Math.round(totalTaxOnExit * 0.4),
    netAfterTaxExit: Math.round(netAfterTaxExit),
    exitMultiple: cashInvested > 0 ? Math.round((netAfterTaxExit / cashInvested) * 100) / 100 : 0,
  };

  // ── Hold-total waterfall ──
  const totalGrossRent = annualGrossRent * holdYears * (1 + rentGrowthPct * (holdYears - 1) / 2);  // approximate average
  const totalVacancy = totalGrossRent * (vacancyPct / 100);
  const totalGrossEff = totalGrossRent - totalVacancy;
  const totalTaxes = annualTaxes * holdYears;
  const totalIns = annualInsurance * holdYears;
  const totalMgmt = totalGrossRent * (managementPct / 100);
  const totalMaint = totalGrossRent * (maintenancePct / 100);
  const totalNOI = totalGrossEff - totalTaxes - totalIns - totalMgmt - totalMaint;
  const totalInterest = annualInterest * holdYears * 0.85;  // interest declines over time
  const totalPrincipal = annualADSPiOnly * holdYears - totalInterest;
  const totalADS = annualADSPiOnly * holdYears;
  // v11 FIX (bug audit #2): derive from the real per-year taxable-income values
  // (which now correctly subtract mortgage interest — see taxEngine.computeAfterTaxIRR)
  // instead of re-deriving via totalNOI - totalDepreciation, which silently omitted
  // interest and was inconsistent with totalOperatingCF/totalDepreciation/
  // totalFederalTax/totalStateTax/totalPreTaxCF just above (all summed directly
  // from afterTaxIRR.yearByYear).
  const totalTaxableIncome = afterTaxIRR.yearByYear.reduce((sum, r) => sum + r.taxableIncome, 0);
  const totalReturn = totalOperatingCF + netAfterTaxExit;
  const totalProfit = totalReturn - cashInvested;

  const holdTotalStages = buildHoldTotalStages(
    totalGrossRent, totalVacancy, totalGrossEff,
    totalTaxes, totalIns, totalMgmt, totalMaint,
    totalNOI, totalInterest, totalPrincipal, totalADS,
    totalPreTaxCF, totalDepreciation, totalTaxableIncome,
    totalFederalTax, totalStateTax, totalOperatingCF,
    netAfterTaxExit, cashInvested, totalReturn,
  );

  // ── Summary ──
  // buildSummary's afterTaxIRR/preTaxIRR params are formatted as "X.XX%" (percent),
  // but taxEngine's AfterTaxIRRResult.afterTaxIRR/preTaxIRR are DECIMAL fractions
  // (0.15 = 15%; same convention fixed in v11Runner.ts — bug audit #3) — convert
  // here, at the one place a percent-formatted string is produced, rather than
  // changing the decimal convention used everywhere else in this file.
  const summary = buildSummary(
    holdYears, annualGrossRent, noi, year1AfterTaxCF,
    netAfterTaxExit, cashInvested, totalReturn, totalProfit,
    afterTaxIRR.afterTaxIRR * 100, afterTaxIRR.preTaxIRR * 100,
    year1.effectiveTaxRate, year1.depreciationShieldPct,
    exit.exitMultiple,
  );

  return {
    year1,
    holdTotal: {
      stages: holdTotalStages,
      cashInvested: Math.round(cashInvested),
      totalOperatingCF: Math.round(totalOperatingCF),
      exitAfterTax: Math.round(netAfterTaxExit),
      totalReturn: Math.round(totalReturn),
      totalProfit: Math.round(totalProfit),
      returnMultiple: cashInvested > 0 ? Math.round((totalReturn / cashInvested) * 100) / 100 : 0,
      preTaxIRR: afterTaxIRR.preTaxIRR,
      afterTaxIRR: afterTaxIRR.afterTaxIRR,
      irrImpactOfTaxes: afterTaxIRR.irrImpactOfTaxes,
    },
    exit,
    summary,
  };
}

// ============================================================
// YEAR 1 STAGES BUILDER
// ============================================================

function buildYear1Stages(
  grossRent: number, vacancy: number, grossEff: number,
  taxes: number, insurance: number, mgmt: number, maint: number,
  noi: number, interest: number, principal: number, ads: number,
  preTaxCF: number, depreciation: number, taxableIncome: number,
  federalTax: number, stateTax: number, afterTaxCF: number,
): IRRWaterfallStage[] {
  const stages: IRRWaterfallStage[] = [];
  let cum = 0;
  let step = 0;
  const pct = (v: number) => grossRent > 0 ? Math.round((v / grossRent) * 1000) / 10 : 0;
  const r = (v: number) => Math.round(v * 100) / 100;

  const push = (label: string, amount: number, sign: WaterfallSign, detail: string) => {
    step++;
    // v11 FIX (bug audit #4): SUBTOTAL/TOTAL rows carry the ACTUAL running total
    // as `amount` (a precomputed checkpoint value, e.g. NOI, taxableIncome,
    // afterTaxCF) — NOT a new delta to add on top of `cum`, which already
    // reflects the preceding ADD/SUBTRACT stages. The old code did `cum += amount`
    // here too, silently doubling the cumulative column at every subtotal/total.
    if (sign === 'ADD') cum += amount;
    else if (sign === 'SUBTRACT') cum -= amount;
    else cum = amount; // SUBTOTAL / TOTAL: reset to the known-correct checkpoint value
    stages.push({
      step,
      label,
      // For ADD/SUBTRACT stages show absolute value (the sign is conveyed by `sign` field).
      // For SUBTOTAL/TOTAL stages, show the actual signed value (could be negative for losses).
      amount: sign === 'ADD' || sign === 'SUBTRACT' ? r(Math.abs(amount)) : r(amount),
      sign,
      cumulative: r(cum),
      pctOfGrossRent: pct(sign === 'ADD' || sign === 'SUBTRACT' ? Math.abs(amount) : amount),
      detail,
    });
  };

  push('Gross Scheduled Rent', grossRent, 'ADD', `12 × $${(grossRent / 12).toFixed(0)}/mo raw strategy rent`);
  push('Vacancy Loss', vacancy, 'SUBTRACT', `${vacancy > grossRent * 0.15 ? '25%' : vacancy > grossRent * 0.08 ? '12%' : '8%'} vacancy assumption (Track 2 haircut)`);
  push('Gross Effective Rent', grossEff, 'SUBTOTAL', 'Rent actually collected after vacancy');
  push('Property Taxes', taxes, 'SUBTRACT', `Annual property tax bill`);
  push('Insurance + HOA + Flood', insurance, 'SUBTRACT', `Property insurance + HOA dues + flood insurance`);
  push('Property Management', mgmt, 'SUBTRACT', `8% of gross scheduled rent`);
  push('Maintenance & Repairs', maint, 'SUBTRACT', `5% of gross scheduled rent`);
  push('Net Operating Income (NOI)', noi, 'SUBTOTAL', 'Gross effective rent minus all operating expenses');
  push('Interest', interest, 'SUBTRACT', `Year-1 mortgage interest at solved rate`);
  push('Principal', principal, 'SUBTRACT', `Year-1 principal paydown (builds equity, but cash outflow)`);
  push('Pre-Tax Cash Flow', preTaxCF, 'SUBTOTAL', `NOI minus annual debt service (P&I only)`);
  push('Depreciation Deduction', depreciation, 'SUBTRACT', `Non-cash deduction (27.5yr S/L on structure basis)`);
  push('Taxable Income', taxableIncome, 'SUBTOTAL', `NOI minus mortgage interest minus depreciation (cash flow is NOT taxed directly)`);
  push('Federal Tax', federalTax, 'SUBTRACT', `Ordinary income tax at marginal bracket (with PAL rules)`);
  push('State Tax', stateTax, 'SUBTRACT', `State income tax at investor's state rate`);
  push('After-Tax Cash Flow', afterTaxCF, 'TOTAL', `What investor pockets in Year 1`);

  return stages;
}

// ============================================================
// HOLD-TOTAL STAGES BUILDER
// ============================================================

function buildHoldTotalStages(
  grossRent: number, vacancy: number, grossEff: number,
  taxes: number, insurance: number, mgmt: number, maint: number,
  noi: number, interest: number, principal: number, ads: number,
  preTaxCF: number, depreciation: number, taxableIncome: number,
  federalTax: number, stateTax: number, operatingCF: number,
  exitAfterTax: number, cashInvested: number, totalReturn: number,
): IRRWaterfallStage[] {
  const stages: IRRWaterfallStage[] = [];
  let cum = 0;
  let step = 0;
  const pct = (v: number) => grossRent > 0 ? Math.round((v / grossRent) * 1000) / 10 : 0;
  const r = (v: number) => Math.round(v);

  const push = (label: string, amount: number, sign: WaterfallSign, detail: string) => {
    step++;
    // v11 FIX (bug audit #4): SUBTOTAL/TOTAL rows carry the ACTUAL running total
    // as `amount` (a precomputed checkpoint value, e.g. NOI, taxableIncome,
    // afterTaxCF) — NOT a new delta to add on top of `cum`, which already
    // reflects the preceding ADD/SUBTRACT stages. The old code did `cum += amount`
    // here too, silently doubling the cumulative column at every subtotal/total.
    if (sign === 'ADD') cum += amount;
    else if (sign === 'SUBTRACT') cum -= amount;
    else cum = amount; // SUBTOTAL / TOTAL: reset to the known-correct checkpoint value
    stages.push({
      step,
      label,
      // For ADD/SUBTRACT stages show absolute value (the sign is conveyed by `sign` field).
      // For SUBTOTAL/TOTAL stages, show the actual signed value (could be negative for losses).
      amount: sign === 'ADD' || sign === 'SUBTRACT' ? r(Math.abs(amount)) : r(amount),
      sign,
      cumulative: r(cum),
      pctOfGrossRent: pct(sign === 'ADD' || sign === 'SUBTRACT' ? Math.abs(amount) : amount),
      detail,
    });
  };

  push('Total Gross Rent', grossRent, 'ADD', `Cumulative rent over hold period (with 2% annual growth)`);
  push('Total Vacancy Loss', vacancy, 'SUBTRACT', `Cumulative vacancy haircut`);
  push('Total Gross Effective Rent', grossEff, 'SUBTOTAL', 'Cumulative rent collected');
  push('Total Property Taxes', taxes, 'SUBTRACT', `Cumulative property tax over hold`);
  push('Total Insurance + HOA + Flood', insurance, 'SUBTRACT', `Cumulative insurance + HOA + flood`);
  push('Total Property Management', mgmt, 'SUBTRACT', `Cumulative management fees (8%)`);
  push('Total Maintenance & Repairs', maint, 'SUBTRACT', `Cumulative maintenance (5%)`);
  push('Total NOI', noi, 'SUBTOTAL', 'Cumulative net operating income');
  push('Total Interest', interest, 'SUBTRACT', `Cumulative interest paid (declining balance)`);
  push('Total Principal', principal, 'SUBTRACT', `Cumulative principal paydown (equity build)`);
  push('Total Pre-Tax Cash Flow', preTaxCF, 'SUBTOTAL', `NOI minus total debt service`);
  push('Total Depreciation Deduction', depreciation, 'SUBTRACT', `Cumulative depreciation shield (non-cash)`);
  push('Total Taxable Income', taxableIncome, 'SUBTOTAL', `Cumulative taxable income after mortgage interest and depreciation`);
  push('Total Federal Tax', federalTax, 'SUBTRACT', `Cumulative federal income tax`);
  push('Total State Tax', stateTax, 'SUBTRACT', `Cumulative state income tax`);
  push('Total After-Tax Operating CF', operatingCF, 'TOTAL', `Sum of year-by-year after-tax NCF`);
  push('After-Tax Exit Proceeds', exitAfterTax, 'ADD', `Sale proceeds - loan payoff - prepay penalty - sale tax`);
  push('Cash Invested', cashInvested, 'SUBTRACT', `Initial cash outflow (down payment + closing)`);
  push('Total Net Profit', totalReturn - cashInvested, 'TOTAL', `Total return minus cash invested`);

  return stages;
}

// ============================================================
// REMAINING BALANCE APPROXIMATION
// Standard amortization formula: B_t = L × (r^n - r^t) / (r^n - 1)
// where r = monthly rate, n = total months, t = elapsed months
// ============================================================

function computeRemainingBalanceApprox(
  loanAmount: number,
  annualRatePct: number,
  termMonths: number,
  elapsedMonths: number,
): number {
  const r = annualRatePct / 100 / 12;
  if (Math.abs(r) < 1e-9) {
    // Zero interest — linear paydown
    return loanAmount * Math.max(0, 1 - elapsedMonths / termMonths);
  }
  const rn = Math.pow(1 + r, termMonths);
  const rt = Math.pow(1 + r, elapsedMonths);
  return loanAmount * (rn - rt) / (rn - 1);
}

// ============================================================
// SUMMARY BUILDER
// ============================================================

function buildSummary(
  holdYears: number,
  annualGrossRent: number,
  noi: number,
  year1AfterTaxCF: number,
  exitAfterTax: number,
  cashInvested: number,
  totalReturn: number,
  totalProfit: number,
  afterTaxIRR: number,
  preTaxIRR: number,
  effectiveTaxRate: number,
  depreciationShieldPct: number,
  exitMultiple: number,
): string {
  const parts: string[] = [];

  parts.push(
    `Year 1: $${annualGrossRent.toLocaleString()} gross rent → $${noi.toLocaleString()} NOI ` +
    `(${((noi / annualGrossRent) * 100).toFixed(1)}% margin) → $${year1AfterTaxCF.toLocaleString()} after-tax CF.`,
  );

  parts.push(
    `Tax efficiency: ${effectiveTaxRate.toFixed(1)}% effective tax rate, ` +
    `depreciation shields ${depreciationShieldPct.toFixed(1)}% of NOI from taxation.`,
  );

  parts.push(
    `Hold period: ${holdYears} years. Exit proceeds: $${exitAfterTax.toLocaleString()} ` +
    `(${exitMultiple.toFixed(2)}× cash invested).`,
  );

  parts.push(
    `Total return: $${totalReturn.toLocaleString()} on $${cashInvested.toLocaleString()} invested ` +
    `= $${totalProfit.toLocaleString()} profit (${(totalProfit / cashInvested * 100).toFixed(1)}% total return).`,
  );

  parts.push(
    `After-tax IRR: ${afterTaxIRR.toFixed(2)}% (vs pre-tax ${preTaxIRR.toFixed(2)}% — ` +
    `taxes reduce IRR by ${(preTaxIRR - afterTaxIRR).toFixed(2)} percentage points).`,
  );

  return parts.join(' ');
}

// ============================================================
// COLOR HELPER for UI
// ============================================================

export function waterfallStageColor(sign: WaterfallSign): string {
  switch (sign) {
    case 'ADD':        return 'bg-emerald-700/50 text-emerald-200 border-emerald-600/50';
    case 'SUBTRACT':   return 'bg-red-900/40 text-red-200 border-red-700/40';
    case 'SUBTOTAL':   return 'bg-cyan-900/40 text-cyan-200 border-cyan-700/50';
    case 'TOTAL':      return 'bg-violet-900/50 text-violet-200 border-violet-600/60';
  }
}

export function waterfallSignSymbol(sign: WaterfallSign): string {
  switch (sign) {
    case 'ADD':        return '+';
    case 'SUBTRACT':   return '−';
    case 'SUBTOTAL':   return '=';
    case 'TOTAL':      return '=';
  }
}
