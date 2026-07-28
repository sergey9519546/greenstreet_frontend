import React, { useEffect, useMemo, useState } from "react";

import type { LoanRequestDraft } from "../conversion/loanRequest";
import { DcShell, H1, H2, Lead, Mono, dc } from "../design/dc";

export type BoundedFinanceTool =
  | "deal-analyzer"
  | "refi-tracker"
  | "arm-reset"
  | "monte-carlo"
  | "returns"
  | "stress-matrix"
  | "portfolio";

export interface BoundedFinanceToolsPageProps {
  tool: BoundedFinanceTool;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
const nonNegative = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0);
const positiveMonths = (value: number) => Math.max(1, Math.round(nonNegative(value)));

export function monthlyAmortizedPayment(
  principalValue: number,
  annualRatePctValue: number,
  termMonthsValue: number,
): number {
  const principal = nonNegative(principalValue);
  const termMonths = positiveMonths(termMonthsValue);
  const monthlyRate = nonNegative(annualRatePctValue) / 100 / 12;
  if (principal === 0) return 0;
  if (monthlyRate === 0) return principal / termMonths;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function amortizedBalance(
  principalValue: number,
  annualRatePctValue: number,
  termMonthsValue: number,
  paidMonthsValue: number,
): number {
  const principal = nonNegative(principalValue);
  const termMonths = positiveMonths(termMonthsValue);
  const paidMonths = clamp(Math.round(nonNegative(paidMonthsValue)), 0, termMonths);
  if (paidMonths >= termMonths) return 0;
  const monthlyRate = nonNegative(annualRatePctValue) / 100 / 12;
  if (monthlyRate === 0) return principal * (1 - paidMonths / termMonths);
  const payment = monthlyAmortizedPayment(principal, annualRatePctValue, termMonths);
  const growth = Math.pow(1 + monthlyRate, paidMonths);
  return Math.max(0, principal * growth - payment * ((growth - 1) / monthlyRate));
}

export interface DealAssumptions {
  purchasePrice: number;
  downPaymentPct: number;
  monthlyRent: number;
  annualRatePct: number;
  annualTaxes: number;
  annualInsurance: number;
  monthlyHoa: number;
  monthlyOperatingCosts: number;
}

export interface DealMetrics {
  loanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyPitia: number;
  rentCoverage: number;
  monthlyPreTaxCashFlow: number;
  annualNoi: number;
  capRatePct: number;
  debtYieldPct: number;
}

export function calculateDealMetrics(input: DealAssumptions): DealMetrics {
  const purchasePrice = nonNegative(input.purchasePrice);
  const downPaymentPct = clamp(input.downPaymentPct, 0, 100);
  const monthlyRent = nonNegative(input.monthlyRent);
  const annualTaxes = nonNegative(input.annualTaxes);
  const annualInsurance = nonNegative(input.annualInsurance);
  const monthlyHoa = nonNegative(input.monthlyHoa);
  const monthlyOperatingCosts = nonNegative(input.monthlyOperatingCosts);
  const loanAmount = purchasePrice * (1 - downPaymentPct / 100);
  const monthlyPrincipalAndInterest = monthlyAmortizedPayment(
    loanAmount,
    input.annualRatePct,
    360,
  );
  const monthlyPitia =
    monthlyPrincipalAndInterest + annualTaxes / 12 + annualInsurance / 12 + monthlyHoa;
  const annualNoi =
    monthlyRent * 12 -
    annualTaxes -
    annualInsurance -
    monthlyHoa * 12 -
    monthlyOperatingCosts * 12;
  return {
    loanAmount,
    monthlyPrincipalAndInterest,
    monthlyPitia,
    rentCoverage: monthlyPitia > 0 ? monthlyRent / monthlyPitia : 0,
    monthlyPreTaxCashFlow: annualNoi / 12 - monthlyPrincipalAndInterest,
    annualNoi,
    capRatePct: purchasePrice > 0 ? (annualNoi / purchasePrice) * 100 : 0,
    debtYieldPct: loanAmount > 0 ? (annualNoi / loanAmount) * 100 : 0,
  };
}

export interface RefiAssumptions {
  currentBalance: number;
  currentRatePct: number;
  currentRemainingMonths: number;
  proposedBalance: number;
  proposedRatePct: number;
  proposedTermMonths: number;
  closingCosts: number;
  prepaymentCost: number;
}

export interface RefiComparison {
  currentMonthlyPayment: number;
  proposedMonthlyPayment: number;
  monthlySavings: number;
  totalTransactionCosts: number;
  breakEvenMonths: number | null;
}

export function calculateRefiComparison(input: RefiAssumptions): RefiComparison {
  const currentMonthlyPayment = monthlyAmortizedPayment(
    input.currentBalance,
    input.currentRatePct,
    input.currentRemainingMonths,
  );
  const proposedMonthlyPayment = monthlyAmortizedPayment(
    input.proposedBalance,
    input.proposedRatePct,
    input.proposedTermMonths,
  );
  const monthlySavings = currentMonthlyPayment - proposedMonthlyPayment;
  const totalTransactionCosts =
    nonNegative(input.closingCosts) + nonNegative(input.prepaymentCost);
  return {
    currentMonthlyPayment,
    proposedMonthlyPayment,
    monthlySavings,
    totalTransactionCosts,
    breakEvenMonths: monthlySavings > 0 ? totalTransactionCosts / monthlySavings : null,
  };
}

export interface ArmAssumptions {
  currentBalance: number;
  currentRatePct: number;
  indexRatePct: number;
  marginPct: number;
  floorRatePct: number;
  initialCapPct: number;
  periodicCapPct: number;
  lifetimeCapPct: number;
  remainingTermMonths: number;
  monthsUntilReset: number;
  monthlyRent: number;
  monthlyNonDebtCosts: number;
}

export interface ArmComparison {
  balanceAtReset: number;
  fullyIndexedRatePct: number;
  firstResetRatePct: number;
  nextResetRatePct: number;
  lifetimeCapRatePct: number;
  currentMonthlyPayment: number;
  firstResetMonthlyPayment: number;
  nextResetMonthlyPayment: number;
  lifetimeCapMonthlyPayment: number;
  currentRentCoverage: number;
  firstResetRentCoverage: number;
}

export function calculateArmComparison(input: ArmAssumptions): ArmComparison {
  const currentRatePct = nonNegative(input.currentRatePct);
  const remainingTermMonths = positiveMonths(input.remainingTermMonths);
  const monthsUntilReset = clamp(
    Math.round(nonNegative(input.monthsUntilReset)),
    0,
    remainingTermMonths - 1,
  );
  const balanceAtReset = amortizedBalance(
    input.currentBalance,
    currentRatePct,
    remainingTermMonths,
    monthsUntilReset,
  );
  const remainingAtReset = Math.max(1, remainingTermMonths - monthsUntilReset);
  const fullyIndexedRatePct = Math.max(
    nonNegative(input.floorRatePct),
    nonNegative(input.indexRatePct) + nonNegative(input.marginPct),
  );
  const lifetimeCapRatePct = currentRatePct + nonNegative(input.lifetimeCapPct);
  const firstResetRatePct = Math.min(
    fullyIndexedRatePct,
    currentRatePct + nonNegative(input.initialCapPct),
    lifetimeCapRatePct,
  );
  const nextResetRatePct = Math.min(
    fullyIndexedRatePct,
    firstResetRatePct + nonNegative(input.periodicCapPct),
    lifetimeCapRatePct,
  );
  const currentMonthlyPayment = monthlyAmortizedPayment(
    input.currentBalance,
    currentRatePct,
    remainingTermMonths,
  );
  const firstResetMonthlyPayment = monthlyAmortizedPayment(
    balanceAtReset,
    firstResetRatePct,
    remainingAtReset,
  );
  const nextResetMonthlyPayment = monthlyAmortizedPayment(
    balanceAtReset,
    nextResetRatePct,
    remainingAtReset,
  );
  const lifetimeCapMonthlyPayment = monthlyAmortizedPayment(
    balanceAtReset,
    lifetimeCapRatePct,
    remainingAtReset,
  );
  const monthlyRent = nonNegative(input.monthlyRent);
  const monthlyNonDebtCosts = nonNegative(input.monthlyNonDebtCosts);
  return {
    balanceAtReset,
    fullyIndexedRatePct,
    firstResetRatePct,
    nextResetRatePct,
    lifetimeCapRatePct,
    currentMonthlyPayment,
    firstResetMonthlyPayment,
    nextResetMonthlyPayment,
    lifetimeCapMonthlyPayment,
    currentRentCoverage:
      currentMonthlyPayment + monthlyNonDebtCosts > 0
        ? monthlyRent / (currentMonthlyPayment + monthlyNonDebtCosts)
        : 0,
    firstResetRentCoverage:
      firstResetMonthlyPayment + monthlyNonDebtCosts > 0
        ? monthlyRent / (firstResetMonthlyPayment + monthlyNonDebtCosts)
        : 0,
  };
}

export interface MonteCarloAssumptions {
  seed: number;
  baseRatePct: number;
  longRunMeanPct: number;
  meanReversion: number;
  annualVolatilityPct: number;
  horizonYears: number;
  simulations: number;
}

export interface MonteCarloDistribution {
  p10: number;
  median: number;
  p90: number;
  min: number;
  max: number;
  samplePath: number[];
  endRates: number[];
}

function seededRandom(seedValue: number) {
  let state = (Math.floor(seedValue) || 1) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function seededNormal(random: () => number): number {
  const first = Math.max(Number.EPSILON, random());
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function percentile(sorted: number[], position: number): number {
  if (sorted.length === 0) return 0;
  const index = clamp(position, 0, 1) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export function simulateSeededRatePaths(input: MonteCarloAssumptions): MonteCarloDistribution {
  const random = seededRandom(input.seed);
  const simulations = Math.round(clamp(input.simulations, 20, 2_000));
  const months = Math.round(clamp(input.horizonYears, 1, 15) * 12);
  const baseRatePct = nonNegative(input.baseRatePct);
  const longRunMeanPct = nonNegative(input.longRunMeanPct);
  const meanReversion = clamp(input.meanReversion, 0, 3);
  const annualVolatilityPct = clamp(input.annualVolatilityPct, 0, 10);
  const endRates: number[] = [];
  let samplePath: number[] = [];

  for (let pathIndex = 0; pathIndex < simulations; pathIndex += 1) {
    let rate = baseRatePct;
    const path = [rate];
    for (let month = 0; month < months; month += 1) {
      const pull = (meanReversion * (longRunMeanPct - rate)) / 12;
      const shock = (annualVolatilityPct / Math.sqrt(12)) * seededNormal(random);
      rate = Math.max(0, rate + pull + shock);
      path.push(rate);
    }
    if (pathIndex === 0) samplePath = path;
    endRates.push(rate);
  }

  const sorted = [...endRates].sort((a, b) => a - b);
  return {
    p10: percentile(sorted, 0.1),
    median: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    samplePath,
    endRates,
  };
}

export interface ReturnAssumptions extends DealAssumptions {
  holdYears: number;
  annualRentGrowthPct: number;
  annualAppreciationPct: number;
  closingCostsPct: number;
  sellingCostsPct: number;
}

export interface PretaxReturnSummary {
  initialCashInvested: number;
  yearOnePreTaxCashFlow: number;
  cumulativeOperatingCashFlow: number;
  projectedSalePrice: number;
  remainingLoanBalance: number;
  preTaxExitEquity: number;
  totalPreTaxDistributions: number;
  equityMultiple: number;
}

export function calculatePretaxReturns(input: ReturnAssumptions): PretaxReturnSummary {
  const purchasePrice = nonNegative(input.purchasePrice);
  const downPaymentPct = clamp(input.downPaymentPct, 0, 100);
  const loanAmount = purchasePrice * (1 - downPaymentPct / 100);
  const initialCashInvested =
    purchasePrice * (downPaymentPct / 100) +
    purchasePrice * (nonNegative(input.closingCostsPct) / 100);
  const monthlyPayment = monthlyAmortizedPayment(loanAmount, input.annualRatePct, 360);
  const holdYears = Math.round(clamp(input.holdYears, 1, 30));
  const growth = nonNegative(input.annualRentGrowthPct) / 100;
  const fixedAnnualCosts =
    nonNegative(input.annualTaxes) +
    nonNegative(input.annualInsurance) +
    nonNegative(input.monthlyHoa) * 12 +
    nonNegative(input.monthlyOperatingCosts) * 12;
  let cumulativeOperatingCashFlow = 0;
  let yearOnePreTaxCashFlow = 0;
  for (let year = 0; year < holdYears; year += 1) {
    const annualRent = nonNegative(input.monthlyRent) * 12 * Math.pow(1 + growth, year);
    const annualCashFlow = annualRent - fixedAnnualCosts - monthlyPayment * 12;
    if (year === 0) yearOnePreTaxCashFlow = annualCashFlow;
    cumulativeOperatingCashFlow += annualCashFlow;
  }
  const projectedSalePrice =
    purchasePrice *
    Math.pow(1 + nonNegative(input.annualAppreciationPct) / 100, holdYears);
  const remainingLoanBalance = amortizedBalance(
    loanAmount,
    input.annualRatePct,
    360,
    holdYears * 12,
  );
  const preTaxExitEquity =
    projectedSalePrice * (1 - nonNegative(input.sellingCostsPct) / 100) -
    remainingLoanBalance;
  const totalPreTaxDistributions = cumulativeOperatingCashFlow + preTaxExitEquity;
  return {
    initialCashInvested,
    yearOnePreTaxCashFlow,
    cumulativeOperatingCashFlow,
    projectedSalePrice,
    remainingLoanBalance,
    preTaxExitEquity,
    totalPreTaxDistributions,
    equityMultiple:
      initialCashInvested > 0 ? totalPreTaxDistributions / initialCashInvested : 0,
  };
}

export interface StressAssumptions extends DealAssumptions {
  rateShockStepPct: number;
  rentShockStepPct: number;
}

export interface StressCell {
  rateChangePct: number;
  rentChangePct: number;
  annualRatePct: number;
  monthlyRent: number;
  rentCoverage: number;
  monthlyPitia: number;
}

export interface StressMatrixResult {
  rateChanges: number[];
  rentChanges: number[];
  rows: StressCell[][];
}

export function calculateStressMatrix(input: StressAssumptions): StressMatrixResult {
  const rateStep = nonNegative(input.rateShockStepPct);
  const rentStep = nonNegative(input.rentShockStepPct);
  const rateChanges = [-rateStep, 0, rateStep, rateStep * 2];
  const rentChanges = [-rentStep * 2, -rentStep, 0, rentStep];
  const rows = rateChanges.map((rateChangePct) =>
    rentChanges.map((rentChangePct) => {
      const annualRatePct = Math.max(0, input.annualRatePct + rateChangePct);
      const monthlyRent = Math.max(0, input.monthlyRent * (1 + rentChangePct / 100));
      const metrics = calculateDealMetrics({ ...input, annualRatePct, monthlyRent });
      return {
        rateChangePct,
        rentChangePct,
        annualRatePct,
        monthlyRent,
        rentCoverage: metrics.rentCoverage,
        monthlyPitia: metrics.monthlyPitia,
      };
    }),
  );
  return { rateChanges, rentChanges, rows };
}

export interface PortfolioProperty {
  id: string;
  name: string;
  propertyValue: number;
  loanBalance: number;
  annualRatePct: number;
  monthlyRent: number;
  annualTaxes: number;
  annualInsurance: number;
  monthlyHoa: number;
}

export interface PortfolioPropertyResult extends PortfolioProperty {
  monthlyPitia: number;
  rentCoverage: number;
  equity: number;
  monthlyPreTaxCashFlow: number;
}

export interface PortfolioSummary {
  properties: PortfolioPropertyResult[];
  totalRent: number;
  totalPitia: number;
  aggregateRentCoverage: number;
  totalEquity: number;
  totalMonthlyPreTaxCashFlow: number;
  weightedRatePct: number;
}

export function calculatePortfolioSummary(input: PortfolioProperty[]): PortfolioSummary {
  let totalRent = 0;
  let totalPitia = 0;
  let totalEquity = 0;
  let totalMonthlyPreTaxCashFlow = 0;
  let totalBalance = 0;
  let weightedRateNumerator = 0;
  const properties = input.map((property) => {
    const propertyValue = nonNegative(property.propertyValue);
    const loanBalance = nonNegative(property.loanBalance);
    const monthlyRent = nonNegative(property.monthlyRent);
    const monthlyPitia =
      monthlyAmortizedPayment(loanBalance, property.annualRatePct, 360) +
      nonNegative(property.annualTaxes) / 12 +
      nonNegative(property.annualInsurance) / 12 +
      nonNegative(property.monthlyHoa);
    const result = {
      ...property,
      propertyValue,
      loanBalance,
      monthlyRent,
      monthlyPitia,
      rentCoverage: monthlyPitia > 0 ? monthlyRent / monthlyPitia : 0,
      equity: propertyValue - loanBalance,
      monthlyPreTaxCashFlow: monthlyRent - monthlyPitia,
    };
    totalRent += result.monthlyRent;
    totalPitia += result.monthlyPitia;
    totalEquity += result.equity;
    totalMonthlyPreTaxCashFlow += result.monthlyPreTaxCashFlow;
    totalBalance += loanBalance;
    weightedRateNumerator += loanBalance * nonNegative(property.annualRatePct);
    return result;
  });
  return {
    properties,
    totalRent,
    totalPitia,
    aggregateRentCoverage: totalPitia > 0 ? totalRent / totalPitia : 0,
    totalEquity,
    totalMonthlyPreTaxCashFlow,
    weightedRatePct: totalBalance > 0 ? weightedRateNumerator / totalBalance : 0,
  };
}

const TOOL_COPY: Record<BoundedFinanceTool, { title: string; lead: string; pageTitle: string }> = {
  "deal-analyzer": {
    title: "Model a rental deal from the numbers you enter.",
    lead:
      "Calculate payment coverage, pre-tax cash flow, cap rate, and debt yield without program matching or qualification claims.",
    pageTitle: "Deal Arithmetic",
  },
  "refi-tracker": {
    title: "Compare two amortized payments.",
    lead:
      "Use your current balance and terms, then enter a proposed loan and transaction costs to calculate payment difference and break-even.",
    pageTitle: "Refinance Comparison",
  },
  "arm-reset": {
    title: "Apply the caps written in your note.",
    lead:
      "Enter the current rate, index assumption, margin, caps, floor, and remaining term. The result follows those inputs only.",
    pageTitle: "ARM Reset Comparison",
  },
  "monte-carlo": {
    title: "Explore a repeatable rate-path simulation.",
    lead:
      "Set the starting rate, long-run mean, mean reversion, volatility, horizon, and seed. This is a custom simulation, not a forecast.",
    pageTitle: "Seeded Rate Simulation",
  },
  returns: {
    title: "Trace pre-tax cash flow and exit equity.",
    lead:
      "Use visible financing, rent-growth, appreciation, and cost assumptions to calculate pre-tax cash flow and equity multiple.",
    pageTitle: "Pre-Tax Return Model",
  },
  "stress-matrix": {
    title: "See payment coverage across rate and rent changes.",
    lead:
      "The matrix recalculates principal, interest, taxes, insurance, and HOA for every visible rate-and-rent combination.",
    pageTitle: "Rate and Rent Stress Matrix",
  },
  portfolio: {
    title: "Combine several property assumptions.",
    lead:
      "Edit each property to calculate aggregate payment coverage, equity, weighted rate, and monthly pre-tax cash flow.",
    pageTitle: "Portfolio Arithmetic",
  },
};

const TOOL_CSS = `
.bft-hero{background:${dc.dark};color:${dc.cream};padding:clamp(68px,9vw,124px) ${dc.pad};}
.bft-shell{max-width:1320px;margin:0 auto;}
.bft-work{background:${dc.cream};padding:clamp(48px,7vw,92px) ${dc.pad};}
.bft-grid{display:grid;grid-template-columns:minmax(280px,.78fr) minmax(0,1.22fr);gap:clamp(22px,4vw,56px);align-items:start;}
.bft-panel{min-width:0;border-radius:${dc.r.md};border:1px solid rgba(0,55,56,.16);padding:clamp(20px,2.6vw,32px);}
.bft-inputs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}
.bft-field{display:block;}
.bft-field>span{display:block;font-size:12px;font-weight:700;color:${dc.dark};margin-bottom:6px;line-height:1.35;}
.bft-field small{display:block;font-size:11px;line-height:1.4;color:rgba(0,55,56,.56);margin-top:5px;}
.bft-control{width:100%;box-sizing:border-box;border:1px solid rgba(0,55,56,.26);border-radius:${dc.r.sm};background:#fff;color:${dc.dark};font-family:${dc.mono};font-size:15px;font-variant-numeric:tabular-nums;padding:12px 13px;outline:none;}
.bft-control:focus{border-color:${dc.rain};box-shadow:0 0 0 3px rgba(0,101,101,.12);}
.bft-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
.bft-metric{background:rgba(238,239,211,.06);border:1px solid rgba(238,239,211,.13);border-radius:${dc.r.sm};padding:16px;}
.bft-metric-label{font-size:11px;line-height:1.35;color:rgba(238,239,211,.56);margin-bottom:7px;}
.bft-note{font-size:12px;line-height:1.55;color:rgba(0,55,56,.62);margin:18px 0 0;}
.bft-note-dark{color:rgba(238,239,211,.58);}
.bft-button{border:0;border-radius:${dc.r.sm};background:${dc.lemon};color:${dc.dark};font-family:${dc.sans};font-size:14px;font-weight:700;padding:13px 18px;cursor:pointer;min-height:44px;}
.bft-button:focus-visible{outline:2px solid ${dc.rain};outline-offset:3px;}
.bft-table-wrap{overflow-x:auto;border:1px solid rgba(0,55,56,.16);border-radius:${dc.r.sm};}
.bft-table{width:100%;min-width:760px;border-collapse:collapse;}
.bft-table th,.bft-table td{padding:10px;border-bottom:1px solid rgba(0,55,56,.12);text-align:left;vertical-align:middle;font-size:12px;}
.bft-table th{background:${dc.mintBg};color:${dc.dark};font-weight:700;}
.bft-table td .bft-control{padding:9px;font-size:12px;min-width:84px;}
.bft-table tr:last-child td{border-bottom:0;}
@media(max-width:900px){.bft-grid{grid-template-columns:minmax(0,1fr)}.bft-inputs{grid-template-columns:1fr 1fr}}
@media(max-width:580px){.bft-inputs,.bft-metrics{grid-template-columns:1fr}.bft-hero,.bft-work{padding-left:16px;padding-right:16px}}
`;

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <label className="bft-field">
      <span>{label}</span>
      <input
        className="bft-control"
        aria-label={label}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
      />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bft-metric">
      <div className="bft-metric-label">{label}</div>
      <Mono style={{ display: "block", color: dc.cream, fontSize: "clamp(20px,2.2vw,30px)", fontWeight: 700 }}>
        {value}
      </Mono>
    </div>
  );
}

function ResultsPanel({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note: string;
}) {
  return (
    <section className="bft-panel" style={{ background: dc.dark, color: dc.cream }}>
      <H2 style={{ fontSize: "clamp(25px,3vw,38px)", marginBottom: 20 }}>{title}</H2>
      {children}
      <p className="bft-note bft-note-dark">{note}</p>
    </section>
  );
}

function DraftButton({
  draft,
  onNavigate,
  label = "Continue to a preliminary loan request",
}: {
  draft?: LoanRequestDraft;
  onNavigate?: (view: string) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="bft-button"
      onClick={() => {
        if (window.openQualify) {
          window.openQualify(draft);
          return;
        }
        onNavigate?.("book-demo");
      }}
    >
      {label} →
    </button>
  );
}

function DealTool({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [purchasePrice, setPurchasePrice] = useState(425_000);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3_000);
  const [annualRatePct, setAnnualRatePct] = useState(7);
  const [annualTaxes, setAnnualTaxes] = useState(5_000);
  const [annualInsurance, setAnnualInsurance] = useState(2_000);
  const [monthlyHoa, setMonthlyHoa] = useState(0);
  const [monthlyOperatingCosts, setMonthlyOperatingCosts] = useState(350);
  const assumptions = {
    purchasePrice,
    downPaymentPct,
    monthlyRent,
    annualRatePct,
    annualTaxes,
    annualInsurance,
    monthlyHoa,
    monthlyOperatingCosts,
  };
  const result = useMemo(() => calculateDealMetrics(assumptions), [
    purchasePrice,
    downPaymentPct,
    monthlyRent,
    annualRatePct,
    annualTaxes,
    annualInsurance,
    monthlyHoa,
    monthlyOperatingCosts,
  ]);
  return (
    <div className="bft-grid">
      <section className="bft-panel" style={{ background: dc.mintBg }}>
        <H2 style={{ fontSize: 30, marginBottom: 8 }}>Visible assumptions</H2>
        <div className="bft-inputs">
          <NumberField label="Purchase price ($)" value={purchasePrice} onChange={setPurchasePrice} step={5_000} />
          <NumberField label="Down payment (%)" value={downPaymentPct} onChange={setDownPaymentPct} step={1} max={100} />
          <NumberField label="Monthly rent ($)" value={monthlyRent} onChange={setMonthlyRent} step={100} />
          <NumberField label="Entered interest rate (%)" value={annualRatePct} onChange={setAnnualRatePct} step={0.125} />
          <NumberField label="Annual property taxes ($)" value={annualTaxes} onChange={setAnnualTaxes} step={250} />
          <NumberField label="Annual insurance ($)" value={annualInsurance} onChange={setAnnualInsurance} step={100} />
          <NumberField label="Monthly HOA ($)" value={monthlyHoa} onChange={setMonthlyHoa} step={25} />
          <NumberField label="Other operating costs / month ($)" value={monthlyOperatingCosts} onChange={setMonthlyOperatingCosts} step={25} />
        </div>
        <p className="bft-note">
          Rent coverage is rent ÷ PITIA. Cap rate and debt yield use rent less the entered taxes,
          insurance, HOA, and other operating costs. No program rules are applied.
        </p>
      </section>
      <ResultsPanel
        title="Calculated result"
        note="Thirty-year amortization is used. These are arithmetic outputs from the assumptions shown, not eligibility, pricing, or underwriting."
      >
        <div className="bft-metrics">
          <Metric label="Loan amount" value={money(result.loanAmount)} />
          <Metric label="Monthly PITIA" value={money(result.monthlyPitia)} />
          <Metric label="DSCR · rent ÷ PITIA" value={ratio(result.rentCoverage)} />
          <Metric label="Monthly pre-tax cash flow" value={money(result.monthlyPreTaxCashFlow)} />
          <Metric label="Cap rate" value={percent(result.capRatePct)} />
          <Metric label="Debt yield" value={percent(result.debtYieldPct)} />
        </div>
        <div style={{ marginTop: 20 }}>
          <DraftButton
            onNavigate={onNavigate}
            draft={{
              propertyValue: purchasePrice,
              loanAmount: result.loanAmount,
              rent: monthlyRent,
              rate: annualRatePct,
              taxesAnnual: annualTaxes,
              insuranceAnnual: annualInsurance,
              hoaMonthly: monthlyHoa,
              purpose: "purchase",
            }}
          />
        </div>
      </ResultsPanel>
    </div>
  );
}

function RefiTool({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [propertyValue, setPropertyValue] = useState(425_000);
  const [monthlyRent, setMonthlyRent] = useState(3_000);
  const [currentBalance, setCurrentBalance] = useState(310_000);
  const [currentRatePct, setCurrentRatePct] = useState(7.5);
  const [currentRemainingYears, setCurrentRemainingYears] = useState(27);
  const [proposedBalance, setProposedBalance] = useState(305_000);
  const [proposedRatePct, setProposedRatePct] = useState(6.75);
  const [proposedTermYears, setProposedTermYears] = useState(30);
  const [closingCosts, setClosingCosts] = useState(8_000);
  const [prepaymentCost, setPrepaymentCost] = useState(0);
  const result = useMemo(
    () =>
      calculateRefiComparison({
        currentBalance,
        currentRatePct,
        currentRemainingMonths: currentRemainingYears * 12,
        proposedBalance,
        proposedRatePct,
        proposedTermMonths: proposedTermYears * 12,
        closingCosts,
        prepaymentCost,
      }),
    [
      currentBalance,
      currentRatePct,
      currentRemainingYears,
      proposedBalance,
      proposedRatePct,
      proposedTermYears,
      closingCosts,
      prepaymentCost,
    ],
  );
  return (
    <div className="bft-grid">
      <section className="bft-panel" style={{ background: dc.mintBg }}>
        <H2 style={{ fontSize: 30, marginBottom: 8 }}>Current and proposed terms</H2>
        <div className="bft-inputs">
          <NumberField label="Estimated property value ($)" value={propertyValue} onChange={setPropertyValue} step={5_000} hint="Used only for the loan-request handoff." />
          <NumberField label="Monthly rent ($)" value={monthlyRent} onChange={setMonthlyRent} step={100} hint="Used only for the loan-request handoff." />
          <NumberField label="Current loan balance ($)" value={currentBalance} onChange={setCurrentBalance} step={5_000} />
          <NumberField label="Current note rate (%)" value={currentRatePct} onChange={setCurrentRatePct} step={0.125} />
          <NumberField label="Current remaining term (years)" value={currentRemainingYears} onChange={setCurrentRemainingYears} step={1} min={1} max={40} />
          <NumberField label="Proposed loan balance ($)" value={proposedBalance} onChange={setProposedBalance} step={5_000} />
          <NumberField label="Proposed note rate (%)" value={proposedRatePct} onChange={setProposedRatePct} step={0.125} />
          <NumberField label="Proposed term (years)" value={proposedTermYears} onChange={setProposedTermYears} step={1} min={1} max={40} />
          <NumberField label="Closing costs ($)" value={closingCosts} onChange={setClosingCosts} step={500} />
          <NumberField label="Prepayment cost ($)" value={prepaymentCost} onChange={setPrepaymentCost} step={500} />
        </div>
        <p className="bft-note">
          Both payments are amortized principal and interest only. Escrow, HOA, future value, and
          provider rules are not inferred.
        </p>
      </section>
      <ResultsPanel
        title="Payment comparison"
        note="Break-even equals entered transaction costs ÷ positive monthly savings. A non-positive difference has no positive-savings break-even."
      >
        <div className="bft-metrics">
          <Metric label="Current monthly P&I" value={money(result.currentMonthlyPayment)} />
          <Metric label="Proposed monthly P&I" value={money(result.proposedMonthlyPayment)} />
          <Metric label="Monthly payment difference" value={signedMoney(result.monthlySavings)} />
          <Metric label="Entered transaction costs" value={money(result.totalTransactionCosts)} />
          <Metric
            label="Positive-savings break-even"
            value={result.breakEvenMonths === null ? "Not reached" : `${result.breakEvenMonths.toFixed(1)} mo`}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <DraftButton
            onNavigate={onNavigate}
            draft={{
              propertyValue,
              loanAmount: proposedBalance,
              rent: monthlyRent,
              rate: proposedRatePct,
              purpose: "rate-term",
            }}
          />
        </div>
      </ResultsPanel>
    </div>
  );
}

function ArmTool({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [propertyValue, setPropertyValue] = useState(425_000);
  const [currentBalance, setCurrentBalance] = useState(310_000);
  const [currentRatePct, setCurrentRatePct] = useState(6);
  const [indexRatePct, setIndexRatePct] = useState(4);
  const [marginPct, setMarginPct] = useState(2.75);
  const [floorRatePct, setFloorRatePct] = useState(5);
  const [initialCapPct, setInitialCapPct] = useState(2);
  const [periodicCapPct, setPeriodicCapPct] = useState(1);
  const [lifetimeCapPct, setLifetimeCapPct] = useState(5);
  const [remainingTermYears, setRemainingTermYears] = useState(25);
  const [monthsUntilReset, setMonthsUntilReset] = useState(12);
  const [monthlyRent, setMonthlyRent] = useState(3_000);
  const [monthlyNonDebtCosts, setMonthlyNonDebtCosts] = useState(650);
  const result = useMemo(
    () =>
      calculateArmComparison({
        currentBalance,
        currentRatePct,
        indexRatePct,
        marginPct,
        floorRatePct,
        initialCapPct,
        periodicCapPct,
        lifetimeCapPct,
        remainingTermMonths: remainingTermYears * 12,
        monthsUntilReset,
        monthlyRent,
        monthlyNonDebtCosts,
      }),
    [
      currentBalance,
      currentRatePct,
      indexRatePct,
      marginPct,
      floorRatePct,
      initialCapPct,
      periodicCapPct,
      lifetimeCapPct,
      remainingTermYears,
      monthsUntilReset,
      monthlyRent,
      monthlyNonDebtCosts,
    ],
  );
  return (
    <div className="bft-grid">
      <section className="bft-panel" style={{ background: dc.mintBg }}>
        <H2 style={{ fontSize: 30, marginBottom: 8 }}>Terms from your note</H2>
        <div className="bft-inputs">
          <NumberField label="Estimated property value ($)" value={propertyValue} onChange={setPropertyValue} step={5_000} />
          <NumberField label="Current loan balance ($)" value={currentBalance} onChange={setCurrentBalance} step={5_000} />
          <NumberField label="Current note rate (%)" value={currentRatePct} onChange={setCurrentRatePct} step={0.125} />
          <NumberField label="Index rate assumption (%)" value={indexRatePct} onChange={setIndexRatePct} step={0.125} hint="Enter a value; this tool does not fetch a live index." />
          <NumberField label="Margin (%)" value={marginPct} onChange={setMarginPct} step={0.125} />
          <NumberField label="Rate floor (%)" value={floorRatePct} onChange={setFloorRatePct} step={0.125} />
          <NumberField label="First adjustment cap (%)" value={initialCapPct} onChange={setInitialCapPct} step={0.25} />
          <NumberField label="Periodic adjustment cap (%)" value={periodicCapPct} onChange={setPeriodicCapPct} step={0.25} />
          <NumberField label="Lifetime cap over current rate (%)" value={lifetimeCapPct} onChange={setLifetimeCapPct} step={0.25} />
          <NumberField label="Remaining term (years)" value={remainingTermYears} onChange={setRemainingTermYears} step={1} min={1} max={40} />
          <NumberField label="Months until next reset" value={monthsUntilReset} onChange={setMonthsUntilReset} step={1} />
          <NumberField label="Monthly rent ($)" value={monthlyRent} onChange={setMonthlyRent} step={100} />
          <NumberField label="Taxes, insurance and HOA / month ($)" value={monthlyNonDebtCosts} onChange={setMonthlyNonDebtCosts} step={25} />
        </div>
      </section>
      <ResultsPanel
        title="Cap-limited payment path"
        note="The index is an entered assumption. Balance is amortized to the reset month; no market forecast, program availability, or qualification rule is applied."
      >
        <div className="bft-metrics">
          <Metric label="Balance at reset" value={money(result.balanceAtReset)} />
          <Metric label="Fully indexed target" value={percent(result.fullyIndexedRatePct)} />
          <Metric label="First capped reset rate" value={percent(result.firstResetRatePct)} />
          <Metric label="First reset P&I" value={money(result.firstResetMonthlyPayment)} />
          <Metric label="Next capped reset rate" value={percent(result.nextResetRatePct)} />
          <Metric label="Lifetime-cap P&I" value={money(result.lifetimeCapMonthlyPayment)} />
          <Metric label="Current rent coverage" value={ratio(result.currentRentCoverage)} />
          <Metric label="First-reset rent coverage" value={ratio(result.firstResetRentCoverage)} />
        </div>
        <div style={{ marginTop: 20 }}>
          <DraftButton
            onNavigate={onNavigate}
            draft={{
              propertyValue,
              loanAmount: currentBalance,
              rent: monthlyRent,
              rate: currentRatePct,
              purpose: "rate-term",
            }}
          />
        </div>
      </ResultsPanel>
    </div>
  );
}

function MonteCarloTool({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [seed, setSeed] = useState(42);
  const [baseRatePct, setBaseRatePct] = useState(4);
  const [longRunMeanPct, setLongRunMeanPct] = useState(4.25);
  const [meanReversion, setMeanReversion] = useState(0.35);
  const [annualVolatilityPct, setAnnualVolatilityPct] = useState(1);
  const [horizonYears, setHorizonYears] = useState(5);
  const [simulations, setSimulations] = useState(400);
  const result = useMemo(
    () =>
      simulateSeededRatePaths({
        seed,
        baseRatePct,
        longRunMeanPct,
        meanReversion,
        annualVolatilityPct,
        horizonYears,
        simulations,
      }),
    [
      seed,
      baseRatePct,
      longRunMeanPct,
      meanReversion,
      annualVolatilityPct,
      horizonYears,
      simulations,
    ],
  );
  const annualSample = result.samplePath.filter(
    (_, index) => index === 0 || index % 12 === 0 || index === result.samplePath.length - 1,
  );
  return (
    <div className="bft-grid">
      <section className="bft-panel" style={{ background: dc.mintBg }}>
        <H2 style={{ fontSize: 30, marginBottom: 8 }}>Simulation assumptions</H2>
        <div className="bft-inputs">
          <NumberField label="Seed" value={seed} onChange={setSeed} step={1} hint="The same seed and assumptions reproduce the same paths." />
          <NumberField label="Starting rate (%)" value={baseRatePct} onChange={setBaseRatePct} step={0.05} />
          <NumberField label="Long-run mean (%)" value={longRunMeanPct} onChange={setLongRunMeanPct} step={0.05} />
          <NumberField label="Mean-reversion speed" value={meanReversion} onChange={setMeanReversion} step={0.05} max={3} />
          <NumberField label="Annual volatility (%)" value={annualVolatilityPct} onChange={setAnnualVolatilityPct} step={0.05} max={10} />
          <NumberField label="Horizon (years)" value={horizonYears} onChange={setHorizonYears} step={1} min={1} max={15} />
          <NumberField label="Simulated paths" value={simulations} onChange={setSimulations} step={20} min={20} max={2_000} />
        </div>
        <p className="bft-note">
          Each monthly step applies a mean-reversion pull plus a seeded random shock. The parameters
          are entered assumptions and are not calibrated to live or historical market data.
        </p>
      </section>
      <ResultsPanel
        title="Ending-rate distribution"
        note="Percentiles describe this seeded mathematical simulation only. They are not probabilities of future rates and do not select a loan structure."
      >
        <div className="bft-metrics">
          <Metric label="10th percentile" value={percent(result.p10)} />
          <Metric label="Median" value={percent(result.median)} />
          <Metric label="90th percentile" value={percent(result.p90)} />
          <Metric label="Minimum simulated ending rate" value={percent(result.min)} />
          <Metric label="Maximum simulated ending rate" value={percent(result.max)} />
        </div>
        <div style={{ marginTop: 20 }}>
          <div className="bft-metric-label">First seeded path · annual checkpoints</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {annualSample.map((rate, index) => (
              <Mono
                key={`${index}-${rate}`}
                style={{ color: dc.cream, background: "rgba(238,239,211,.08)", borderRadius: 6, padding: "7px 9px", fontSize: 12 }}
              >
                Y{index}: {rate.toFixed(2)}%
              </Mono>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <DraftButton onNavigate={onNavigate} />
        </div>
      </ResultsPanel>
    </div>
  );
}

function ReturnsTool({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [purchasePrice, setPurchasePrice] = useState(425_000);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3_000);
  const [annualRatePct, setAnnualRatePct] = useState(7);
  const [annualTaxes, setAnnualTaxes] = useState(5_000);
  const [annualInsurance, setAnnualInsurance] = useState(2_000);
  const [monthlyHoa, setMonthlyHoa] = useState(0);
  const [monthlyOperatingCosts, setMonthlyOperatingCosts] = useState(350);
  const [holdYears, setHoldYears] = useState(5);
  const [annualRentGrowthPct, setAnnualRentGrowthPct] = useState(2);
  const [annualAppreciationPct, setAnnualAppreciationPct] = useState(2);
  const [closingCostsPct, setClosingCostsPct] = useState(2);
  const [sellingCostsPct, setSellingCostsPct] = useState(6);
  const assumptions = {
    purchasePrice,
    downPaymentPct,
    monthlyRent,
    annualRatePct,
    annualTaxes,
    annualInsurance,
    monthlyHoa,
    monthlyOperatingCosts,
    holdYears,
    annualRentGrowthPct,
    annualAppreciationPct,
    closingCostsPct,
    sellingCostsPct,
  };
  const result = useMemo(() => calculatePretaxReturns(assumptions), [
    purchasePrice,
    downPaymentPct,
    monthlyRent,
    annualRatePct,
    annualTaxes,
    annualInsurance,
    monthlyHoa,
    monthlyOperatingCosts,
    holdYears,
    annualRentGrowthPct,
    annualAppreciationPct,
    closingCostsPct,
    sellingCostsPct,
  ]);
  const deal = calculateDealMetrics(assumptions);
  return (
    <div className="bft-grid">
      <section className="bft-panel" style={{ background: dc.mintBg }}>
        <H2 style={{ fontSize: 30, marginBottom: 8 }}>Pre-tax assumptions</H2>
        <div className="bft-inputs">
          <NumberField label="Purchase price ($)" value={purchasePrice} onChange={setPurchasePrice} step={5_000} />
          <NumberField label="Down payment (%)" value={downPaymentPct} onChange={setDownPaymentPct} step={1} max={100} />
          <NumberField label="Monthly rent ($)" value={monthlyRent} onChange={setMonthlyRent} step={100} />
          <NumberField label="Interest rate (%)" value={annualRatePct} onChange={setAnnualRatePct} step={0.125} />
          <NumberField label="Annual taxes ($)" value={annualTaxes} onChange={setAnnualTaxes} step={250} />
          <NumberField label="Annual insurance ($)" value={annualInsurance} onChange={setAnnualInsurance} step={100} />
          <NumberField label="Monthly HOA ($)" value={monthlyHoa} onChange={setMonthlyHoa} step={25} />
          <NumberField label="Other operating costs / month ($)" value={monthlyOperatingCosts} onChange={setMonthlyOperatingCosts} step={25} />
          <NumberField label="Hold period (years)" value={holdYears} onChange={setHoldYears} step={1} min={1} max={30} />
          <NumberField label="Annual rent growth (%)" value={annualRentGrowthPct} onChange={setAnnualRentGrowthPct} step={0.25} />
          <NumberField label="Annual value appreciation (%)" value={annualAppreciationPct} onChange={setAnnualAppreciationPct} step={0.25} />
          <NumberField label="Acquisition closing costs (%)" value={closingCostsPct} onChange={setClosingCostsPct} step={0.25} />
          <NumberField label="Selling costs (%)" value={sellingCostsPct} onChange={setSellingCostsPct} step={0.25} />
        </div>
        <p className="bft-note">
          Taxes, insurance, HOA, and other operating costs stay flat; rent and value use the entered
          annual growth assumptions. Income taxes and tax benefits are not modeled.
        </p>
      </section>
      <ResultsPanel
        title="Pre-tax result"
        note="Equity multiple equals total modeled pre-tax distributions ÷ initial cash invested. It is an arithmetic scenario, not a return forecast or investment recommendation."
      >
        <div className="bft-metrics">
          <Metric label="Initial cash invested" value={money(result.initialCashInvested)} />
          <Metric label="Year-one pre-tax cash flow" value={money(result.yearOnePreTaxCashFlow)} />
          <Metric label="Cumulative operating cash flow" value={money(result.cumulativeOperatingCashFlow)} />
          <Metric label="Projected sale price" value={money(result.projectedSalePrice)} />
          <Metric label="Remaining loan balance" value={money(result.remainingLoanBalance)} />
          <Metric label="Pre-tax exit equity" value={money(result.preTaxExitEquity)} />
          <Metric label="Equity multiple" value={`${result.equityMultiple.toFixed(2)}x`} />
        </div>
        <div style={{ marginTop: 20 }}>
          <DraftButton
            onNavigate={onNavigate}
            draft={{
              propertyValue: purchasePrice,
              loanAmount: deal.loanAmount,
              rent: monthlyRent,
              rate: annualRatePct,
              taxesAnnual: annualTaxes,
              insuranceAnnual: annualInsurance,
              hoaMonthly: monthlyHoa,
              purpose: "purchase",
            }}
          />
        </div>
      </ResultsPanel>
    </div>
  );
}

function StressTool({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [purchasePrice, setPurchasePrice] = useState(425_000);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3_000);
  const [annualRatePct, setAnnualRatePct] = useState(7);
  const [annualTaxes, setAnnualTaxes] = useState(5_000);
  const [annualInsurance, setAnnualInsurance] = useState(2_000);
  const [monthlyHoa, setMonthlyHoa] = useState(250);
  const [rateShockStepPct, setRateShockStepPct] = useState(1);
  const [rentShockStepPct, setRentShockStepPct] = useState(10);
  const assumptions = {
    purchasePrice,
    downPaymentPct,
    monthlyRent,
    annualRatePct,
    annualTaxes,
    annualInsurance,
    monthlyHoa,
    monthlyOperatingCosts: 0,
    rateShockStepPct,
    rentShockStepPct,
  };
  const matrix = useMemo(() => calculateStressMatrix(assumptions), [
    purchasePrice,
    downPaymentPct,
    monthlyRent,
    annualRatePct,
    annualTaxes,
    annualInsurance,
    monthlyHoa,
    rateShockStepPct,
    rentShockStepPct,
  ]);
  const deal = calculateDealMetrics(assumptions);
  return (
    <div className="bft-grid">
      <section className="bft-panel" style={{ background: dc.mintBg }}>
        <H2 style={{ fontSize: 30, marginBottom: 8 }}>Base and shock assumptions</H2>
        <div className="bft-inputs">
          <NumberField label="Purchase price ($)" value={purchasePrice} onChange={setPurchasePrice} step={5_000} />
          <NumberField label="Down payment (%)" value={downPaymentPct} onChange={setDownPaymentPct} step={1} max={100} />
          <NumberField label="Monthly rent ($)" value={monthlyRent} onChange={setMonthlyRent} step={100} />
          <NumberField label="Base interest rate (%)" value={annualRatePct} onChange={setAnnualRatePct} step={0.125} />
          <NumberField label="Annual taxes ($)" value={annualTaxes} onChange={setAnnualTaxes} step={250} />
          <NumberField label="Annual insurance ($)" value={annualInsurance} onChange={setAnnualInsurance} step={100} />
          <NumberField label="Monthly HOA ($)" value={monthlyHoa} onChange={setMonthlyHoa} step={25} />
          <NumberField label="Rate shock step (%)" value={rateShockStepPct} onChange={setRateShockStepPct} step={0.25} />
          <NumberField label="Rent shock step (%)" value={rentShockStepPct} onChange={setRentShockStepPct} step={1} />
        </div>
        <p className="bft-note">
          Every cell recalculates thirty-year P&I plus the entered taxes, insurance, and HOA. The
          table reports only the resulting numeric rent coverage.
        </p>
      </section>
      <ResultsPanel
        title="DSCR sensitivity matrix"
        note="Rows change the entered interest rate; columns change the entered rent. No cell is labeled as approval, decline, program fit, or advice."
      >
        <div className="bft-table-wrap" style={{ borderColor: "rgba(238,239,211,.16)" }}>
          <table className="bft-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>Rate change</th>
                {matrix.rentChanges.map((change) => (
                  <th key={change}>{signedPercent(change)} rent</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row, rowIndex) => (
                <tr key={matrix.rateChanges[rowIndex]}>
                  <td>
                    <Mono>{signedPercent(matrix.rateChanges[rowIndex])}</Mono>
                  </td>
                  {row.map((cell) => (
                    <td
                      key={`${cell.rateChangePct}-${cell.rentChangePct}`}
                      style={
                        cell.rateChangePct === 0 && cell.rentChangePct === 0
                          ? { background: dc.lemon, color: dc.dark }
                          : { background: dc.cream, color: dc.dark }
                      }
                    >
                      <Mono style={{ fontWeight: 700 }}>{ratio(cell.rentCoverage)}</Mono>
                      <div style={{ fontSize: 10, opacity: 0.62, marginTop: 3 }}>
                        PITIA {money(cell.monthlyPitia)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 20 }}>
          <DraftButton
            onNavigate={onNavigate}
            draft={{
              propertyValue: purchasePrice,
              loanAmount: deal.loanAmount,
              rent: monthlyRent,
              rate: annualRatePct,
              taxesAnnual: annualTaxes,
              insuranceAnnual: annualInsurance,
              hoaMonthly: monthlyHoa,
              purpose: "purchase",
            }}
          />
        </div>
      </ResultsPanel>
    </div>
  );
}

const STARTING_PORTFOLIO: PortfolioProperty[] = [
  {
    id: "property-a",
    name: "Property A",
    propertyValue: 425_000,
    loanBalance: 300_000,
    annualRatePct: 7,
    monthlyRent: 3_000,
    annualTaxes: 5_000,
    annualInsurance: 2_000,
    monthlyHoa: 0,
  },
  {
    id: "property-b",
    name: "Property B",
    propertyValue: 360_000,
    loanBalance: 250_000,
    annualRatePct: 6.75,
    monthlyRent: 2_700,
    annualTaxes: 4_200,
    annualInsurance: 1_800,
    monthlyHoa: 125,
  },
  {
    id: "property-c",
    name: "Property C",
    propertyValue: 510_000,
    loanBalance: 355_000,
    annualRatePct: 7.25,
    monthlyRent: 3_900,
    annualTaxes: 6_400,
    annualInsurance: 2_400,
    monthlyHoa: 0,
  },
];

function PortfolioTool({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [properties, setProperties] = useState<PortfolioProperty[]>(() =>
    STARTING_PORTFOLIO.map((property) => ({ ...property })),
  );
  const summary = useMemo(() => calculatePortfolioSummary(properties), [properties]);
  const editProperty = (
    id: string,
    field: Exclude<keyof PortfolioProperty, "id">,
    rawValue: string,
  ) => {
    setProperties((current) =>
      current.map((property) =>
        property.id === id
          ? {
              ...property,
              [field]: field === "name" ? rawValue : nonNegative(Number(rawValue)),
            }
          : property,
      ),
    );
  };
  const first = summary.properties[0];
  return (
    <div>
      <section className="bft-panel" style={{ background: dc.mintBg, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <H2 style={{ fontSize: 30, marginBottom: 8 }}>Editable property assumptions</H2>
            <p className="bft-note" style={{ marginTop: 0 }}>
              These generic rows are examples, not live properties. Replace every value with your own assumptions.
            </p>
          </div>
          <button
            type="button"
            className="bft-button"
            onClick={() =>
              setProperties((current) => [
                ...current,
                {
                  id: `property-${current.length + 1}-${Date.now()}`,
                  name: `Property ${current.length + 1}`,
                  propertyValue: 400_000,
                  loanBalance: 300_000,
                  annualRatePct: 7,
                  monthlyRent: 2_800,
                  annualTaxes: 5_000,
                  annualInsurance: 2_000,
                  monthlyHoa: 0,
                },
              ])
            }
          >
            Add property
          </button>
        </div>
        <div className="bft-table-wrap" style={{ marginTop: 20 }}>
          <table className="bft-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
                <th>Balance</th>
                <th>Rate</th>
                <th>Rent / mo</th>
                <th>Taxes / yr</th>
                <th>Insurance / yr</th>
                <th>HOA / mo</th>
                <th>DSCR</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {summary.properties.map((property) => (
                <tr key={property.id}>
                  <td>
                    <input
                      className="bft-control"
                      aria-label={`${property.name} name`}
                      value={property.name}
                      onChange={(event) => editProperty(property.id, "name", event.target.value)}
                    />
                  </td>
                  {(
                    [
                      ["propertyValue", property.propertyValue, 5_000],
                      ["loanBalance", property.loanBalance, 5_000],
                      ["annualRatePct", property.annualRatePct, 0.125],
                      ["monthlyRent", property.monthlyRent, 100],
                      ["annualTaxes", property.annualTaxes, 250],
                      ["annualInsurance", property.annualInsurance, 100],
                      ["monthlyHoa", property.monthlyHoa, 25],
                    ] as const
                  ).map(([field, value, step]) => (
                    <td key={field}>
                      <input
                        className="bft-control"
                        aria-label={`${property.name} ${field}`}
                        type="number"
                        min={0}
                        step={step}
                        value={value}
                        onChange={(event) => editProperty(property.id, field, event.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    <Mono style={{ fontWeight: 700 }}>{ratio(property.rentCoverage)}</Mono>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        setProperties((current) =>
                          current.length > 1
                            ? current.filter((candidate) => candidate.id !== property.id)
                            : current,
                        )
                      }
                      style={{ border: 0, background: "transparent", color: dc.rain, fontWeight: 700, cursor: "pointer" }}
                      aria-label={`Remove ${property.name}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <ResultsPanel
        title="Portfolio totals"
        note="Aggregate DSCR is total entered rent ÷ total calculated PITIA. No refinance opportunity, reserve rule, lender concentration rule, or financing recommendation is inferred."
      >
        <div className="bft-metrics">
          <Metric label="Properties" value={String(summary.properties.length)} />
          <Metric label="Aggregate DSCR" value={ratio(summary.aggregateRentCoverage)} />
          <Metric label="Total equity" value={money(summary.totalEquity)} />
          <Metric label="Monthly pre-tax cash flow" value={money(summary.totalMonthlyPreTaxCashFlow)} />
          <Metric label="Balance-weighted entered rate" value={percent(summary.weightedRatePct)} />
        </div>
        {first ? (
          <div style={{ marginTop: 20 }}>
            <DraftButton
              onNavigate={onNavigate}
              label={`Continue with ${first.name}`}
              draft={{
                propertyValue: first.propertyValue,
                loanAmount: first.loanBalance,
                rent: first.monthlyRent,
                rate: first.annualRatePct,
                taxesAnnual: first.annualTaxes,
                insuranceAnnual: first.annualInsurance,
                hoaMonthly: first.monthlyHoa,
                purpose: "rate-term",
              }}
            />
          </div>
        ) : null}
      </ResultsPanel>
    </div>
  );
}

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function signedMoney(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe >= 0 ? "+" : "−"}${money(Math.abs(safe))}`;
}

function percent(value: number): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
}

function signedPercent(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe > 0 ? "+" : ""}${safe.toFixed(2)}%`;
}

function ratio(value: number): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(2)}x`;
}

function ToolBody({
  tool,
  onNavigate,
}: {
  tool: BoundedFinanceTool;
  onNavigate?: (view: string) => void;
}) {
  switch (tool) {
    case "deal-analyzer":
      return <DealTool onNavigate={onNavigate} />;
    case "refi-tracker":
      return <RefiTool onNavigate={onNavigate} />;
    case "arm-reset":
      return <ArmTool onNavigate={onNavigate} />;
    case "monte-carlo":
      return <MonteCarloTool onNavigate={onNavigate} />;
    case "returns":
      return <ReturnsTool onNavigate={onNavigate} />;
    case "stress-matrix":
      return <StressTool onNavigate={onNavigate} />;
    case "portfolio":
      return <PortfolioTool onNavigate={onNavigate} />;
  }
}

export default function BoundedFinanceToolsPage({
  tool,
  onNavigate,
}: BoundedFinanceToolsPageProps) {
  const copy = TOOL_COPY[tool];
  useEffect(() => {
    document.title = `${copy.pageTitle} | Greenstreet Finance`;
    window.scrollTo(0, 0);
  }, [copy.pageTitle]);

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{TOOL_CSS}</style>
      <section className="bft-hero">
        <div id="gs-hero-content" className="bft-shell">
          <H1 style={{ maxWidth: "17ch", marginBottom: 22 }}>{copy.title}</H1>
          <Lead style={{ color: "rgba(238,239,211,.72)", maxWidth: "62ch", margin: 0 }}>
            {copy.lead}
          </Lead>
        </div>
      </section>
      <section className="bft-work">
        <div className="bft-shell">
          <ToolBody tool={tool} onNavigate={onNavigate} />
        </div>
      </section>
    </DcShell>
  );
}
