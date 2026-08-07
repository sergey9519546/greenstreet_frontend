import type { DealInputs, StressScenario } from './types';
import { monthlyPayment, interestOnlyPayment, round, INFINITE_RUNWAY } from './math';
import { buildRentHierarchy, isArmStructure, armFixedMonths, estimatedArmResetRate } from './lender';
import { getEstimatedTaxRate } from './state-overlays';
import { RUNWAY_INFINITE_SENTINEL } from './constants';

// ============================================================================
// STRESS TEST SUITE
// ============================================================================
// Rebuilds NOI under each shock, recomputes Investor DSCR + monthly cash flow
// + liquidity runway, assigns a verdict (Pass / Watch / Fail / Kill).
//
// IMPORTANT: All stress scenarios share a single rent-calculation pipeline so
// the "Base case" row reconciles with the InvestorTrackPanel. Capex events
// are modeled as one-year NOI hits (full cost in year of occurrence), and
// cash-flow impact is amortized over 12 months for the runway calc.
// ============================================================================

// ---------------------------------------------------------------------------
// Shared rent calculation — mirrors investor.ts buildRentHierarchy + 5% stress
// ---------------------------------------------------------------------------

function stressedRentAnnual(inputs: DealInputs): number {
  const rent = buildRentHierarchy(inputs);
  return rent.investorStressedRent * 12;
}

// ---------------------------------------------------------------------------
// Shared NOI calculation pipeline — keeps base case & stress scenarios in sync
// ---------------------------------------------------------------------------

function survivalUnder(modifiedInputs: DealInputs, opts: {
  // Optional one-time annual NOI hit (e.g., capex event in year of occurrence)
  noiHit?: number;
  // Optional additional monthly debt service (e.g., ARM reset)
  additionalMonthlyDebt?: number;
  // Optional override of annual debt service (used for rate shocks)
  annualDebtOverride?: number;
  // Optional additional one-time monthly expense (e.g., capex amortized)
  additionalMonthlyExpense?: number;
} = {}): {
  investorDscr: number;
  monthlyCashFlow: number;
  liquidityRunwayMonths: number;
} {
  const i = modifiedInputs;

  // EGI — same pipeline as investor.ts calculateEGI
  const rent = buildRentHierarchy(i);
  const grossScheduledRent = rent.investorStressedRent * 12;
  const egi =
    grossScheduledRent *
    (1 - (i.vacancyPct || 0) / 100 - (i.collectionLossPct || 0) / 100 -
      (i.concessionsPct || 0) / 100 - (i.platformFeesPct || 0) / 100 -
      (i.seasonalityHaircutPct || 0) / 100) +
    (i.otherIncome || 0) * 12;

  // Opex — same pipeline as investor.ts calculateOpex
  const opex =
    (i.propertyTaxes + i.insurance + i.hoa +
      i.utilities + i.landscaping + i.accounting +
      i.licensing + i.legalEvictionReserve +
      i.emergencyReserve + i.strFurnishingReserve) * 12 +
    egi * ((i.propertyMgmtPct + i.repairsMaintenancePct +
      i.capexReservePct + i.turnoverPct) / 100);

  let noi = egi - opex;
  if (opts.noiHit) noi -= opts.noiHit;

  // Debt service
  const annualDebtService = opts.annualDebtOverride ?? monthlyPayment(i.loanAmount, i.rate, i.amortMonths) * 12;
  const additionalAnnualDebt = (opts.additionalMonthlyDebt ?? 0) * 12;
  const totalAnnualDebt = annualDebtService + additionalAnnualDebt;

  const investorDscr = totalAnnualDebt > 0 ? noi / totalAnnualDebt : 0;
  let monthlyCashFlow = (noi - totalAnnualDebt) / 12;
  if (opts.additionalMonthlyExpense) monthlyCashFlow -= opts.additionalMonthlyExpense;

  // Liquidity runway
  const pitiaMonthly = annualDebtService / 12 + i.propertyTaxes + i.insurance + i.hoa;
  const totalReservesCash = i.reservesMonths * pitiaMonthly;
  const liquidityRunwayMonths = monthlyCashFlow < 0
    ? totalReservesCash / Math.abs(monthlyCashFlow)
    : INFINITE_RUNWAY;

  return {
    investorDscr: round(investorDscr, 3),
    monthlyCashFlow: round(monthlyCashFlow),
    liquidityRunwayMonths: Number.isFinite(liquidityRunwayMonths)
      ? round(liquidityRunwayMonths, 1)
      : INFINITE_RUNWAY,
  };
}

// ---------------------------------------------------------------------------
// Verdict thresholds — graduated, documented
// ---------------------------------------------------------------------------
// Kill   : DSCR < 0.75x OR cash flow < -1×monthly debt service OR runway < 3mo
// Fail   : DSCR < 1.0x OR cash flow < 0 OR runway < 6mo
// Watch  : DSCR < 1.1x OR cash flow < $200/mo OR runway < 9mo
// Pass   : otherwise

function verdictFor(
  dscr: number,
  cf: number,
  runway: number,
  monthlyDebtService: number
): StressScenario['verdict'] {
  // v12 (P2-batch-D): Use named constant instead of magic 9999 sentinel
  const runwayFinite = Number.isFinite(runway) ? runway : RUNWAY_INFINITE_SENTINEL;
  const killCfThreshold = -Math.max(1000, monthlyDebtService); // at least -1× debt service
  if (dscr < 0.75 || cf < killCfThreshold || runwayFinite < 3) return 'Kill';
  if (dscr < 1.0 || cf < 0 || runwayFinite < 6) return 'Fail';
  if (dscr < 1.1 || cf < 200 || runwayFinite < 9) return 'Watch';
  return 'Pass';
}

// ---------------------------------------------------------------------------
// BUILD ALL STRESS SCENARIOS
// ---------------------------------------------------------------------------

export function buildStressScenarios(i: DealInputs): StressScenario[] {
  const scenarios: StressScenario[] = [];
  // v12 (P2-batch-D): IO-aware base monthly debt — was always monthlyPayment()
  // even for IO loans (which pay loan × rate / 12, not the amortizing payment).
  // Understated debt service by ~30-40% on IO loans, overstated DSCR by same.
  const baseMonthlyDebt = i.interestOnlyMonths > 0
    ? interestOnlyPayment(i.loanAmount, i.rate)
    : monthlyPayment(i.loanAmount, i.rate, i.amortMonths);

  // BASE CASE — uses shared pipeline so it reconciles with InvestorTrackPanel
  const base = survivalUnder(i);
  scenarios.push({
    name: 'Base case',
    category: 'base',
    ...base,
    verdict: verdictFor(base.investorDscr, base.monthlyCashFlow, base.liquidityRunwayMonths, baseMonthlyDebt),
    note: 'Real-NOI baseline with full opex (mgmt, capex, turnover, etc.)',
  });

  // VACANCY SHOCKS — 1, 2, 3, 6 months vacant
  for (const monthsVacant of [1, 2, 3, 6]) {
    const vacancyPct = (monthsVacant / 12) * 100;
    const r = survivalUnder({ ...i, vacancyPct: Math.max(i.vacancyPct, vacancyPct) });
    scenarios.push({
      name: `${monthsVacant}-month vacancy`,
      category: 'vacancy',
      ...r,
      verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
      note: `Vacancy forced to ${vacancyPct.toFixed(1)}% (≈${monthsVacant}mo/yr)`,
    });
  }

  // RENT DECLINE — -5%, -10%, -15%
  for (const decline of [5, 10, 15]) {
    const adj = 1 - decline / 100;
    const r = survivalUnder({
      ...i,
      borrowerRentClaim: i.borrowerRentClaim * adj,
      appraiserRent: i.appraiserRent * adj,
      leaseRent: i.leaseRent * adj,
      strTrailingRevenue: (i.strTrailingRevenue ?? 0) * adj,
      strProjection: (i.strProjection ?? 0) * adj,
    });
    scenarios.push({
      name: `Rent −${decline}%`,
      category: 'rent',
      ...r,
      verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
      note: `All rent sources haircut by ${decline}%`,
    });
  }

  // EXPENSE INFLATION — +10%, +20%, +30%
  for (const infl of [10, 20, 30]) {
    const adj = 1 + infl / 100;
    const r = survivalUnder({
      ...i,
      propertyTaxes: i.propertyTaxes * adj,
      insurance: i.insurance * adj,
      hoa: i.hoa * adj,
      utilities: i.utilities * adj,
      landscaping: i.landscaping * adj,
      accounting: i.accounting * adj,
      licensing: i.licensing * adj,
      legalEvictionReserve: i.legalEvictionReserve * adj,
      emergencyReserve: i.emergencyReserve * adj,
      strFurnishingReserve: i.strFurnishingReserve * adj,
    });
    scenarios.push({
      name: `Expense inflation +${infl}%`,
      category: 'expense',
      ...r,
      verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
      note: `Fixed opex categories inflated by ${infl}%`,
    });
  }

  // INSURANCE SHOCK — +25%, +50%, +100%
  for (const shock of [25, 50, 100]) {
    const adj = 1 + shock / 100;
    const r = survivalUnder({ ...i, insurance: i.insurance * adj });
    scenarios.push({
      name: `Insurance +${shock}%`,
      category: 'insurance',
      ...r,
      verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
      note: `Insurance premium shocked +${shock}% (renewal volatility)`,
    });
  }

  // TAX REASSESSMENT — use state-specific tax rate (more accurate)
  const stateTaxRate = getEstimatedTaxRate(i.state); // % of value
  const estNewTax = (i.purchasePrice * (stateTaxRate / 100)) / 12;
  const r = survivalUnder({ ...i, propertyTaxes: Math.max(i.propertyTaxes, estNewTax) });
  scenarios.push({
    name: 'Tax reassessment',
    category: 'tax',
    ...r,
    verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
    note: `Taxes reset to ~${stateTaxRate.toFixed(2)}% of purchase price ($${estNewTax.toFixed(0)}/mo) — ${i.state} state avg`,
  });

  // CAPEX EVENT — $5k, $10k, $25k surprise
  // Modeled correctly: NOI takes the full hit in year of occurrence; cash flow
  // is amortized over 12 months for the runway calculation.
  for (const cost of [5000, 10000, 25000]) {
    const r = survivalUnder(i, { noiHit: cost });
    // For cash flow display, show monthly impact of amortizing over 12mo
    const amortizedMonthlyCf = base.monthlyCashFlow - cost / 12;
    // Recompute runway using the amortized CF (more realistic for cash planning)
    const pitiaMonthly = baseMonthlyDebt + i.propertyTaxes + i.insurance + i.hoa;
    const totalReservesCash = i.reservesMonths * pitiaMonthly;
    const runwayWithAmortizedCf = amortizedMonthlyCf < 0
      ? totalReservesCash / Math.abs(amortizedMonthlyCf)
      : INFINITE_RUNWAY;
    scenarios.push({
      name: `Capex event $${(cost / 1000).toFixed(0)}k`,
      category: 'capex',
      investorDscr: r.investorDscr,
      monthlyCashFlow: round(amortizedMonthlyCf),
      liquidityRunwayMonths: Number.isFinite(runwayWithAmortizedCf)
        ? round(runwayWithAmortizedCf, 1)
        : INFINITE_RUNWAY,
      verdict: verdictFor(r.investorDscr, amortizedMonthlyCf, runwayWithAmortizedCf, baseMonthlyDebt),
      note: `Surprise repair ${cost === 5000 ? '(HVAC minor)' : cost === 10000 ? '(roof repair)' : '(full roof + HVAC)'} — $${cost.toLocaleString()} NOI hit, 12mo amortization for cash flow`,
    });
  }

  // RATE SHOCK — +100bps, +200bps (note rate)
  for (const bump of [1, 2]) {
    const newRate = i.rate + bump;
    const newAnnualDebt = monthlyPayment(i.loanAmount, newRate, i.amortMonths) * 12;
    const r = survivalUnder(i, { annualDebtOverride: newAnnualDebt });
    scenarios.push({
      name: `Rate +${bump * 100} bps`,
      category: 'rate',
      ...r,
      verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
      note: `Note rate shocked +${bump * 100} bps (refi risk at maturity or ARM reset)`,
    });
  }

  // ARM RESET — only applies if structure is an ARM
  if (isArmStructure(i.structure)) {
    const fixedMonths = armFixedMonths(i.structure);
    const resetRate = estimatedArmResetRate(i.rate);
    const remainingMonths = Math.max(1, i.amortMonths - fixedMonths);
    const resetMonthlyPmt = monthlyPayment(i.loanAmount, resetRate, remainingMonths);
    const resetAnnualDebt = resetMonthlyPmt * 12;
    const r = survivalUnder(i, { annualDebtOverride: resetAnnualDebt });
    const increase = resetMonthlyPmt - baseMonthlyDebt;
    const increasePct = baseMonthlyDebt > 0 ? (increase / baseMonthlyDebt) * 100 : 0;
    scenarios.push({
      name: `ARM reset (year ${Math.floor(fixedMonths / 12) + 1} @ ~${resetRate}%)`,
      category: 'arm_reset',
      ...r,
      verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
      note: `First reset after ${fixedMonths}mo: rate → ${resetRate}%, payment $${resetMonthlyPmt.toFixed(0)}/mo (+$${increase.toFixed(0)}, +${increasePct.toFixed(0)}%)`,
    });
  }

  // IO RECAST — only applies if IO period > 0
  if (i.interestOnlyMonths > 0) {
    const remainingAmort = Math.max(1, i.amortMonths - i.interestOnlyMonths);
    const recastPmt = monthlyPayment(i.loanAmount, i.rate, remainingAmort);
    const recastAnnualDebt = recastPmt * 12;
    const r = survivalUnder(i, { annualDebtOverride: recastAnnualDebt });
    const ioPmt = (i.loanAmount * (i.rate / 100)) / 12;
    const increase = recastPmt - ioPmt;
    const increasePct = ioPmt > 0 ? (increase / ioPmt) * 100 : 0;
    scenarios.push({
      name: `IO recast (year ${Math.floor(i.interestOnlyMonths / 12) + 1})`,
      category: 'io_recast',
      ...r,
      verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
      note: `IO expires after ${i.interestOnlyMonths}mo: payment $${ioPmt.toFixed(0)}/mo → $${recastPmt.toFixed(0)}/mo (+$${increase.toFixed(0)}, +${increasePct.toFixed(0)}%)`,
    });
  }

  // EXIT CAP EXPANSION — value falls
  // Recompute base NOI from the shared pipeline for valuation
  const baseNoi = (() => {
    const rent = buildRentHierarchy(i);
    const grossScheduledRent = rent.investorStressedRent * 12;
    const egi =
      grossScheduledRent *
      (1 - (i.vacancyPct || 0) / 100 - (i.collectionLossPct || 0) / 100 -
        (i.concessionsPct || 0) / 100 - (i.platformFeesPct || 0) / 100 -
        (i.seasonalityHaircutPct || 0) / 100) +
      (i.otherIncome || 0) * 12;
    const opex =
      (i.propertyTaxes + i.insurance + i.hoa + i.utilities + i.landscaping +
        i.accounting + i.licensing + i.legalEvictionReserve + i.emergencyReserve +
        i.strFurnishingReserve) * 12 +
      egi * ((i.propertyMgmtPct + i.repairsMaintenancePct + i.capexReservePct + i.turnoverPct) / 100);
    return egi - opex;
  })();

  const marketValue = i.marketCapRate > 0 ? baseNoi / (i.marketCapRate / 100) : i.appraisedValue;
  const stressedValue = i.stressCapRate > 0 ? baseNoi / (i.stressCapRate / 100) : i.appraisedValue;
  const valueDrop = marketValue - stressedValue;
  const isUnderwater = stressedValue < i.loanAmount;
  const equityLoss = valueDrop;

  // For exit cap, DSCR/CF/runway are unchanged — verdict is based on valuation
  let exitVerdict: StressScenario['verdict'];
  if (isUnderwater) exitVerdict = 'Kill';
  else if (stressedValue < i.purchasePrice * 0.9) exitVerdict = 'Fail';
  else if (stressedValue < i.purchasePrice * 0.95) exitVerdict = 'Watch';
  else exitVerdict = 'Pass';

  scenarios.push({
    name: `Exit cap +${(i.stressCapRate - i.marketCapRate).toFixed(1)}%`,
    category: 'exit',
    investorDscr: base.investorDscr, // NOI & debt unchanged
    monthlyCashFlow: base.monthlyCashFlow,
    liquidityRunwayMonths: base.liquidityRunwayMonths,
    verdict: exitVerdict,
    note: isUnderwater
      ? `Value falls $${(valueDrop / 1000).toFixed(0)}k → $${(stressedValue / 1000).toFixed(0)}k. UNDERWATER — cannot refi without cash-in.`
      : `Value falls $${(valueDrop / 1000).toFixed(0)}k → $${(stressedValue / 1000).toFixed(0)}k. Equity loss $${(equityLoss / 1000).toFixed(0)}k.`,
  });

  // STR REGULATION SHOCK — STR converts to LTR
  if (i.rentType === 'STR' || i.propertyType === 'CONDOTEL') {
    const ltrRent = i.appraiserRent; // LTR fallback = appraiser's LTR market rent
    const r = survivalUnder({
      ...i,
      rentType: 'LTR',
      borrowerRentClaim: ltrRent,
      leaseRent: ltrRent,
      strTrailingRevenue: 0,
      strProjection: 0,
      platformFeesPct: 0,
      seasonalityHaircutPct: 0,
      vacancyPct: Math.max(i.vacancyPct, 6), // LTR vacancy standard
      strFurnishingReserve: 0,
      propertyMgmtPct: Math.max(i.propertyMgmtPct, 8),
    });
    scenarios.push({
      name: 'STR → LTR conversion',
      category: 'str',
      ...r,
      verdict: verdictFor(r.investorDscr, r.monthlyCashFlow, r.liquidityRunwayMonths, baseMonthlyDebt),
      note: `STR regulation forces conversion to LTR at $${ltrRent.toFixed(0)}/mo. Strips platform fees but loses revenue uplift.`,
    });
  }

  // LIQUIDITY SHOCK — borrower loses external income, reserves halved
  const r2 = survivalUnder({ ...i, reservesMonths: Math.floor(i.reservesMonths / 2) });
  scenarios.push({
    name: 'Liquidity shock (½ reserves)',
    category: 'liquidity',
    ...r2,
    verdict: verdictFor(r2.investorDscr, r2.monthlyCashFlow, r2.liquidityRunwayMonths, baseMonthlyDebt),
    note: `Borrower loses external income support — reserves cut from ${i.reservesMonths}mo to ${Math.floor(i.reservesMonths / 2)}mo`,
  });

  return scenarios;
}
