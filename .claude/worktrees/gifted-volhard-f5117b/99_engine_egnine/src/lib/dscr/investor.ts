import type {
  DealInputs,
  EffectiveGrossIncome,
  InvestorSurvivalResult,
  InvestorVerdict,
  OperatingExpenses,
  InvestorDebtService,
} from './types';
import {
  monthlyPayment,
  interestOnlyPayment,
  round,
  ratio,
  INFINITE_RUNWAY,
} from './math';
import { buildRentHierarchy } from './lender';
import {
  isArmStructure,
  armFixedMonths,
  estimatedArmResetRate,
} from './lender';

// ============================================================================
// TRACK B — INVESTOR SURVIVAL ENGINE
// ============================================================================
// Answers: "Does this deal survive as an investment, not just as a loan file?"
//
// Rebuilds the property from actual economics. Uses NOI, not gross rent.
// Includes real expenses most DSCR calculators skip: management, capex,
// turnover, eviction reserve, etc.
// ============================================================================

// ---------------------------------------------------------------------------
// B1. EFFECTIVE GROSS INCOME — actual collected income after leakage
// ---------------------------------------------------------------------------

export function calculateEGI(i: DealInputs): EffectiveGrossIncome {
  const rent = buildRentHierarchy(i);
  // Investor uses stressed rent, not lender-eligible rent
  const grossScheduledRent = rent.investorStressedRent * 12;

  const vacancyLoss = (grossScheduledRent * (i.vacancyPct || 0)) / 100;
  const collectionLoss = (grossScheduledRent * (i.collectionLossPct || 0)) / 100;
  const concessions = (grossScheduledRent * (i.concessionsPct || 0)) / 100;
  const platformFees = (grossScheduledRent * (i.platformFeesPct || 0)) / 100;
  const seasonalityHaircut = (grossScheduledRent * (i.seasonalityHaircutPct || 0)) / 100;
  const otherIncome = (i.otherIncome || 0) * 12;

  const egi =
    grossScheduledRent -
    vacancyLoss -
    collectionLoss -
    concessions -
    platformFees -
    seasonalityHaircut +
    otherIncome;

  return {
    grossScheduledRent: round(grossScheduledRent),
    vacancyLoss: round(vacancyLoss),
    collectionLoss: round(collectionLoss),
    concessions: round(concessions),
    platformFees: round(platformFees),
    seasonalityHaircut: round(seasonalityHaircut),
    otherIncome: round(otherIncome),
    egi: round(egi),
  };
}

// ---------------------------------------------------------------------------
// B2. OPERATING EXPENSES — full real-world opex, not just PITIA
// ---------------------------------------------------------------------------

export function calculateOpex(i: DealInputs, egiAnnual: number): OperatingExpenses {
  const propertyTaxes = (i.propertyTaxes || 0) * 12;
  const insurance = (i.insurance || 0) * 12;
  const hoa = (i.hoa || 0) * 12;

  // %-of-EGI expenses
  const propertyManagement = (egiAnnual * (i.propertyMgmtPct || 0)) / 100;
  const repairsMaintenance = (egiAnnual * (i.repairsMaintenancePct || 0)) / 100;
  const capexReserve = (egiAnnual * (i.capexReservePct || 0)) / 100;
  const turnover = (egiAnnual * (i.turnoverPct || 0)) / 100;

  // Fixed monthly expenses
  const utilities = (i.utilities || 0) * 12;
  const landscaping = (i.landscaping || 0) * 12;
  const accounting = (i.accounting || 0) * 12;
  const licensing = (i.licensing || 0) * 12;
  const legalEviction = (i.legalEvictionReserve || 0) * 12;
  const emergencyReserve = (i.emergencyReserve || 0) * 12;
  const strFurnishingReserve = (i.strFurnishingReserve || 0) * 12;

  const total =
    propertyTaxes +
    insurance +
    hoa +
    propertyManagement +
    repairsMaintenance +
    capexReserve +
    turnover +
    utilities +
    landscaping +
    accounting +
    licensing +
    legalEviction +
    emergencyReserve +
    strFurnishingReserve;

  return {
    propertyTaxes: round(propertyTaxes),
    insurance: round(insurance),
    hoa: round(hoa),
    propertyManagement: round(propertyManagement),
    repairsMaintenance: round(repairsMaintenance),
    capexReserve: round(capexReserve),
    turnover: round(turnover),
    utilities: round(utilities),
    landscaping: round(landscaping),
    accounting: round(accounting),
    licensing: round(licensing),
    legalEviction: round(legalEviction),
    emergencyReserve: round(emergencyReserve),
    strFurnishingReserve: round(strFurnishingReserve),
    total: round(total),
  };
}

// ---------------------------------------------------------------------------
// B3. DEBT SERVICE STRESS — model IO recast, ARM reset, etc.
// ---------------------------------------------------------------------------

export function calculateDebtService(i: DealInputs): InvestorDebtService {
  const baseMonthlyPayment = monthlyPayment(i.loanAmount, i.rate, i.amortMonths);
  const baseAnnualDebtService = baseMonthlyPayment * 12;

  const ioMonthlyPayment = interestOnlyPayment(i.loanAmount, i.rate);
  const postRecastMonthlyPayment = i.interestOnlyMonths > 0
    ? monthlyPayment(i.loanAmount, i.rate, Math.max(1, i.amortMonths - i.interestOnlyMonths))
    : baseMonthlyPayment;

  const paymentCliffIncrease = Math.max(
    0,
    postRecastMonthlyPayment - ioMonthlyPayment
  );
  const paymentCliffPct =
    ioMonthlyPayment > 0 ? (paymentCliffIncrease / ioMonthlyPayment) * 100 : 0;

  // ARM reset — if structure is ARM, compute payment after first reset
  let armResetMonthlyPayment: number | undefined;
  let armResetRate: number | undefined;
  if (isArmStructure(i.structure)) {
    armResetRate = estimatedArmResetRate(i.rate);
    const remainingMonths = Math.max(1, i.amortMonths - armFixedMonths(i.structure));
    armResetMonthlyPayment = monthlyPayment(i.loanAmount, armResetRate, remainingMonths);
  }

  return {
    baseAnnualDebtService: round(baseAnnualDebtService),
    baseMonthlyPayment: round(baseMonthlyPayment),
    ioMonthlyPayment: round(ioMonthlyPayment),
    postRecastMonthlyPayment: round(postRecastMonthlyPayment),
    paymentCliffIncrease: round(paymentCliffIncrease),
    paymentCliffPct: round(paymentCliffPct, 1),
    armResetMonthlyPayment: armResetMonthlyPayment !== undefined ? round(armResetMonthlyPayment) : undefined,
    armResetRate,
  };
}

// ---------------------------------------------------------------------------
// B4. SURVIVAL CALCULATION — the heart of Track B
// ---------------------------------------------------------------------------

export function calculateSurvival(i: DealInputs): InvestorSurvivalResult {
  const egi = calculateEGI(i);
  const opex = calculateOpex(i, egi.egi);
  const debtService = calculateDebtService(i);

  const noi = egi.egi - opex.total;
  const annualDebtService = debtService.baseAnnualDebtService;
  // v15 fix: when annualDebtService = 0 (all-cash purchase), DSCR = Infinity
  // (NOI / 0). Returning 0 was wrong — it flagged all-cash deals as failing
  // the DSCR test when in reality they have infinite coverage. Display helpers
  // render Infinity as "—" in the UI.
  const investorDscr = annualDebtService > 0 ? noi / annualDebtService : Infinity;

  const monthlyCashFlow = (noi - annualDebtService) / 12;

  // Cash-on-cash return — assume cash invested = down payment + points + closing
  const downPayment = i.purchasePrice - i.loanAmount;
  const pointsCost = (i.points / 100) * i.loanAmount;
  const closingCosts = i.purchasePrice * 0.015; // ~1.5% closing
  const cashInvested = downPayment + pointsCost + closingCosts;
  const cashOnCashReturn = cashInvested > 0 ? ((noi - annualDebtService) / cashInvested) * 100 : 0;

  // Cap rate on purchase price
  const capRate = i.purchasePrice > 0 ? (noi / i.purchasePrice) * 100 : 0;

  // Break-even rent (monthly) — rent required to cover opex + debt service, before any vacancy
  const monthlyDebtService = annualDebtService / 12;
  const monthlyOpex = opex.total / 12;
  const breakevenRent = monthlyDebtService + monthlyOpex;

  // Break-even occupancy — what fraction of gross scheduled rent covers opex + debt
  const monthlyGrossScheduled = egi.grossScheduledRent / 12;
  const breakevenOccupancyPctRaw =
    monthlyGrossScheduled > 0
      ? (breakevenRent / monthlyGrossScheduled) * 100
      : 0;
  // Cap at 200% so display can flag ">100%" without going to absurd numbers
  const breakevenOccupancyPct = Math.min(200, breakevenOccupancyPctRaw);

  // Liquidity runway — how many months can the borrower cover negative cash
  // flow using reserves (months of PITIA in reserves × PITIA / |monthly cash flow|)
  const pitiaMonthly =
    debtService.baseMonthlyPayment +
    i.propertyTaxes +
    i.insurance +
    i.hoa;
  const totalReservesCash = i.reservesMonths * pitiaMonthly;
  const liquidityRunwayMonths =
    monthlyCashFlow < 0
      ? totalReservesCash / Math.abs(monthlyCashFlow)
      : INFINITE_RUNWAY;

  return {
    egi,
    opex,
    noi: round(noi),
    annualDebtService: round(annualDebtService),
    investorDscr: round(investorDscr, 3),
    monthlyCashFlow: round(monthlyCashFlow),
    cashOnCashReturn: round(cashOnCashReturn, 2),
    capRate: round(capRate, 2),
    breakevenRent: round(breakevenRent),
    breakevenOccupancyPct: round(breakevenOccupancyPct, 1),
    liquidityRunwayMonths: Number.isFinite(liquidityRunwayMonths)
      ? round(liquidityRunwayMonths, 1)
      : INFINITE_RUNWAY,
    debtService,
  };
}

// ---------------------------------------------------------------------------
// INVESTOR VERDICT — survives if real NOI DSCR >= 1.0 AND monthly cash flow
// >= 0 AND liquidity runway >= 12 months (or positive cash flow)
// ---------------------------------------------------------------------------

export function buildInvestorVerdict(i: DealInputs): InvestorVerdict {
  const result = calculateSurvival(i);
  const reasons: string[] = [];

  const dscrOk = result.investorDscr >= 1.0;
  const cashFlowOk = result.monthlyCashFlow >= 0;
  const runwayOk = Number.isFinite(result.liquidityRunwayMonths)
    ? result.liquidityRunwayMonths >= 12
    : true; // infinite runway = positive CF, OK

  if (!dscrOk) {
    reasons.push(
      `Investor DSCR ${ratio(result.investorDscr)} is below 1.00x — NOI does not cover debt service.`
    );
  } else {
    reasons.push(
      `Investor DSCR ${ratio(result.investorDscr)} covers debt service.`
    );
  }

  if (!cashFlowOk) {
    reasons.push(
      `Monthly cash flow is negative ($${Math.abs(result.monthlyCashFlow).toFixed(0)}/mo).`
    );
  } else {
    reasons.push(
      `Monthly cash flow is positive ($${result.monthlyCashFlow.toFixed(0)}/mo).`
    );
  }

  if (!runwayOk) {
    reasons.push(
      `Liquidity runway only ${result.liquidityRunwayMonths.toFixed(1)} months — under 12-month survival threshold.`
    );
  } else if (result.monthlyCashFlow < 0) {
    reasons.push(
      `Liquidity runway ${result.liquidityRunwayMonths.toFixed(1)} months at current burn.`
    );
  } else {
    reasons.push('Positive cash flow — no liquidity burn expected.');
  }

  // Additional warnings
  if (result.breakevenOccupancyPct > 100) {
    reasons.push(
      `Break-even occupancy ${result.breakevenOccupancyPct.toFixed(1)}% — deal cannot cover costs even at 100% occupancy.`
    );
  } else if (result.breakevenOccupancyPct > 85) {
    reasons.push(
      `Break-even occupancy ${result.breakevenOccupancyPct.toFixed(1)}% is dangerously high — limited margin for vacancy.`
    );
  }
  if (result.debtService.paymentCliffPct > 30) {
    reasons.push(
      `IO recast creates ${result.debtService.paymentCliffPct.toFixed(0)}% payment cliff — major liquidity risk.`
    );
  }
  if (result.debtService.armResetMonthlyPayment !== undefined) {
    const armIncrease = result.debtService.armResetMonthlyPayment - result.debtService.baseMonthlyPayment;
    const armPct = result.debtService.baseMonthlyPayment > 0
      ? (armIncrease / result.debtService.baseMonthlyPayment) * 100
      : 0;
    if (armPct > 15) {
      reasons.push(
        `ARM reset to ~${result.debtService.armResetRate}% raises payment $${armIncrease.toFixed(0)}/mo (+${armPct.toFixed(0)}%) — refi or exit risk.`
      );
    }
  }
  if (result.capRate < 5) {
    reasons.push(
      `Cap rate ${result.capRate.toFixed(2)}% is thin — exit flexibility limited.`
    );
  }

  const survives = dscrOk && cashFlowOk && runwayOk;

  const summary = survives
    ? `Survives — Investor DSCR ${ratio(result.investorDscr)}, $${result.monthlyCashFlow.toFixed(0)}/mo cash flow, ${Number.isFinite(result.liquidityRunwayMonths) ? result.liquidityRunwayMonths.toFixed(1) + 'mo' : '∞'} runway.`
    : `Fails — Investor DSCR ${ratio(result.investorDscr)}, $${result.monthlyCashFlow.toFixed(0)}/mo cash flow, ${Number.isFinite(result.liquidityRunwayMonths) ? result.liquidityRunwayMonths.toFixed(1) + 'mo' : '∞'} runway.`;

  return {
    survives,
    summary,
    reasons,
    result,
  };
}
