import { describe, expect, it } from "vitest";

import {
  amortizedBalance,
  calculateArmComparison,
  calculateDealMetrics,
  calculatePortfolioSummary,
  calculatePretaxReturns,
  calculateRefiComparison,
  calculateStressMatrix,
  monthlyAmortizedPayment,
  simulateSeededRatePaths,
} from "./BoundedFinanceToolsPage";

const DEAL = {
  purchasePrice: 400_000,
  downPaymentPct: 25,
  monthlyRent: 3_000,
  annualRatePct: 7,
  annualTaxes: 4_800,
  annualInsurance: 1_800,
  monthlyHoa: 200,
  monthlyOperatingCosts: 300,
};

describe("bounded finance arithmetic", () => {
  it("calculates deal metrics from the displayed PITIA and operating assumptions", () => {
    const result = calculateDealMetrics(DEAL);
    const expectedLoan = 300_000;
    const expectedPi = monthlyAmortizedPayment(expectedLoan, 7, 360);
    const expectedPitia = expectedPi + 4_800 / 12 + 1_800 / 12 + 200;

    expect(result.loanAmount).toBe(expectedLoan);
    expect(result.monthlyPrincipalAndInterest).toBeCloseTo(expectedPi, 8);
    expect(result.monthlyPitia).toBeCloseTo(expectedPitia, 8);
    expect(result.rentCoverage).toBeCloseTo(3_000 / expectedPitia, 8);
    expect(result.monthlyPreTaxCashFlow).toBeCloseTo(
      3_000 - 4_800 / 12 - 1_800 / 12 - 200 - 300 - expectedPi,
      8,
    );
  });

  it("compares exact current and proposed amortized payments and costs", () => {
    const result = calculateRefiComparison({
      currentBalance: 300_000,
      currentRatePct: 8,
      currentRemainingMonths: 300,
      proposedBalance: 300_000,
      proposedRatePct: 6,
      proposedTermMonths: 360,
      closingCosts: 6_000,
      prepaymentCost: 1_000,
    });
    expect(result.currentMonthlyPayment).toBeCloseTo(
      monthlyAmortizedPayment(300_000, 8, 300),
      8,
    );
    expect(result.proposedMonthlyPayment).toBeCloseTo(
      monthlyAmortizedPayment(300_000, 6, 360),
      8,
    );
    expect(result.breakEvenMonths).toBeCloseTo(
      7_000 / result.monthlySavings,
      8,
    );

    const noSavings = calculateRefiComparison({
      currentBalance: 300_000,
      currentRatePct: 5,
      currentRemainingMonths: 360,
      proposedBalance: 300_000,
      proposedRatePct: 8,
      proposedTermMonths: 360,
      closingCosts: 4_000,
      prepaymentCost: 0,
    });
    expect(noSavings.breakEvenMonths).toBeNull();
  });

  it("applies user-entered ARM floor and caps to an amortized reset balance", () => {
    const result = calculateArmComparison({
      currentBalance: 300_000,
      currentRatePct: 5,
      indexRatePct: 8,
      marginPct: 3,
      floorRatePct: 5,
      initialCapPct: 2,
      periodicCapPct: 1,
      lifetimeCapPct: 5,
      remainingTermMonths: 300,
      monthsUntilReset: 12,
      monthlyRent: 3_000,
      monthlyNonDebtCosts: 600,
    });
    expect(result.balanceAtReset).toBeCloseTo(
      amortizedBalance(300_000, 5, 300, 12),
      8,
    );
    expect(result.fullyIndexedRatePct).toBe(11);
    expect(result.firstResetRatePct).toBe(7);
    expect(result.nextResetRatePct).toBe(8);
    expect(result.lifetimeCapRatePct).toBe(10);
  });

  it("reproduces seeded simulations and returns ordered percentiles", () => {
    const assumptions = {
      seed: 77,
      baseRatePct: 4,
      longRunMeanPct: 4.5,
      meanReversion: 0.4,
      annualVolatilityPct: 1,
      horizonYears: 5,
      simulations: 200,
    };
    const first = simulateSeededRatePaths(assumptions);
    const second = simulateSeededRatePaths(assumptions);

    expect(first.endRates).toEqual(second.endRates);
    expect(first.samplePath).toEqual(second.samplePath);
    expect(first.min).toBeLessThanOrEqual(first.p10);
    expect(first.p10).toBeLessThanOrEqual(first.median);
    expect(first.median).toBeLessThanOrEqual(first.p90);
    expect(first.p90).toBeLessThanOrEqual(first.max);
    expect(first.samplePath).toHaveLength(61);
  });

  it("calculates pre-tax returns from visible growth, cost, and exit assumptions", () => {
    const result = calculatePretaxReturns({
      ...DEAL,
      holdYears: 5,
      annualRentGrowthPct: 2,
      annualAppreciationPct: 3,
      closingCostsPct: 2,
      sellingCostsPct: 6,
    });
    expect(result.initialCashInvested).toBe(108_000);
    expect(result.projectedSalePrice).toBeCloseTo(400_000 * Math.pow(1.03, 5), 8);
    expect(result.remainingLoanBalance).toBeCloseTo(
      amortizedBalance(300_000, 7, 360, 60),
      8,
    );
    expect(result.totalPreTaxDistributions).toBeCloseTo(
      result.cumulativeOperatingCashFlow + result.preTaxExitEquity,
      8,
    );
    expect(result.equityMultiple).toBeCloseTo(
      result.totalPreTaxDistributions / result.initialCashInvested,
      8,
    );
  });

  it("keeps the stress base cell in parity and includes HOA in every cell", () => {
    const result = calculateStressMatrix({
      ...DEAL,
      rateShockStepPct: 1,
      rentShockStepPct: 10,
    });
    const base = result.rows.flat().find(
      (cell) => cell.rateChangePct === 0 && cell.rentChangePct === 0,
    );
    expect(base).toBeDefined();
    expect(base?.rentCoverage).toBeCloseTo(calculateDealMetrics(DEAL).rentCoverage, 8);

    const withoutHoa = calculateStressMatrix({
      ...DEAL,
      monthlyHoa: 0,
      rateShockStepPct: 1,
      rentShockStepPct: 10,
    });
    expect(result.rows[1][2].monthlyPitia - withoutHoa.rows[1][2].monthlyPitia).toBeCloseTo(
      DEAL.monthlyHoa,
      8,
    );
    expect(result.rows[1][2].rentCoverage).toBeLessThan(
      withoutHoa.rows[1][2].rentCoverage,
    );
  });

  it("aggregates only entered portfolio property arithmetic", () => {
    const summary = calculatePortfolioSummary([
      {
        id: "a",
        name: "A",
        propertyValue: 400_000,
        loanBalance: 300_000,
        annualRatePct: 7,
        monthlyRent: 3_000,
        annualTaxes: 4_800,
        annualInsurance: 1_800,
        monthlyHoa: 0,
      },
      {
        id: "b",
        name: "B",
        propertyValue: 300_000,
        loanBalance: 200_000,
        annualRatePct: 6,
        monthlyRent: 2_400,
        annualTaxes: 3_600,
        annualInsurance: 1_200,
        monthlyHoa: 100,
      },
    ]);
    expect(summary.properties).toHaveLength(2);
    expect(summary.totalRent).toBe(5_400);
    expect(summary.totalEquity).toBe(200_000);
    expect(summary.aggregateRentCoverage).toBeCloseTo(
      summary.totalRent / summary.totalPitia,
      8,
    );
    expect(summary.totalMonthlyPreTaxCashFlow).toBeCloseTo(
      summary.properties[0].monthlyPreTaxCashFlow +
        summary.properties[1].monthlyPreTaxCashFlow,
      8,
    );
    expect(summary.weightedRatePct).toBeCloseTo((300_000 * 7 + 200_000 * 6) / 500_000, 8);
  });
});
