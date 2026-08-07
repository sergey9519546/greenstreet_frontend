/**
 * GreenStreet Finance — E2E Deal Flow & Pipeline Integration Test Suite
 *
 * Verifies end-to-end deal processing across:
 * - Deal Underwriting (DSCR, PITIA, NOI, Cap Rate, Debt Yield, Leverage Check)
 * - Rent Integrity & Market Rent Gap Analysis
 * - AI Underwriter Credit Memo Generation
 * - Portfolio Multi-Property Aggregations & Health Scoring
 */

import { describe, it, expect } from "vitest";
import { computeTcoRate } from "./tcoDscr";
import { assessLeverage } from "./leverageCheck";
import { assessRentIntegrity } from "./rentIntegrity";
import { generateCreditMemo } from "./creditMemo";
import { analyzePortfolio, computePortfolioHealthScore } from "./portfolio";

describe("E2E Deal Flow & Pipeline Integration Suite", () => {
  it("Scenario A: Processes high-tier Texas SFR purchase deal end-to-end", () => {
    const price = 425000;
    const down = 25;
    const rent = 3500; // $3,500/mo strong cash flow
    const marketRent = 3500;
    const rate = 7.0;
    const tax = 5100;
    const ins = 1800;
    const hoa = 0;
    const stateCode = "TX";

    // 1. Core financial calculations
    const loan = price * (1 - down / 100);
    const r = rate / 100 / 12;
    const piMo = (loan * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
    const pitia = piMo + tax / 12 + ins / 12 + hoa;
    const dscr = rent / pitia;

    const tcoTotal = computeTcoRate({ propertyType: "SFR" }).total;
    const noi = rent * 12 * (1 - tcoTotal) - tax - ins;
    const capRate = (noi / price) * 100;
    const debtYield = (noi / loan) * 100;

    expect(dscr).toBeGreaterThan(1.25);
    expect(capRate).toBeGreaterThan(5.0);
    expect(debtYield).toBeGreaterThan(7.0);

    // 2. Leverage & Rent integrity checks
    const lev = assessLeverage(piMo * 12, loan, noi, price);
    const rentCheck = assessRentIntegrity({ leaseRent: rent, marketRent });

    expect(lev.state).toBe("NEGATIVE"); // Cap rate (5.48%) < debt constant (7.98%)
    expect(rentCheck.disposition).toBe("CLEAR");

    // 3. AI Underwriter Credit Memo
    const memo = generateCreditMemo({
      price,
      loan,
      downPercent: down,
      rent,
      marketRent,
      rate,
      pitia,
      dscr,
      noi,
      capRate,
      debtYield,
      leverageState: "negative",
      stateCode,
    });

    expect(memo.verdict).toBe("STRONG_APPROVAL");
    expect(memo.keyStrengths.length).toBeGreaterThan(0);
  });

  it("Scenario B: Handles New Jersey refi with 1007 market rent gap and LLC overlay", () => {
    const price = 550000;
    const down = 20; // 80% LTV
    const rent = 4200;
    const marketRent = 3600; // $600/mo gap
    const rate = 7.5;
    const tax = 7800;
    const ins = 2200;
    const stateCode = "NJ";

    const loan = price * (1 - down / 100);
    const r = rate / 100 / 12;
    const piMo = (loan * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
    const pitia = piMo + tax / 12 + ins / 12;
    const dscr = rent / pitia;
    const noi = rent * 12 * (1 - computeTcoRate().total) - tax - ins;
    const capRate = (noi / price) * 100;
    const debtYield = (noi / loan) * 100;

    const lev = assessLeverage(piMo * 12, loan, noi, price);
    const rentCheck = assessRentIntegrity({ leaseRent: rent, marketRent });

    expect(rentCheck.disposition).toBe("REVIEW");
    expect(rentCheck.flags[0]).toContain("market rent");

    const memo = generateCreditMemo({
      price,
      loan,
      downPercent: down,
      rent,
      marketRent,
      rate,
      pitia,
      dscr,
      noi,
      capRate,
      debtYield,
      leverageState: lev.state === "NEGATIVE" ? "negative" : "neutral",
      stateCode,
      pppRule: "Individual: PROHIBITED. LLC: HIGH-RISK. C-Corp/S-Corp: ALLOWED.",
    });

    expect(memo.riskFactors.some((r) => r.includes("market rent"))).toBe(true);
    expect(memo.riskFactors.some((r) => r.includes("NJ"))).toBe(true);
    expect(memo.recommendedLTV).toBeLessThan(80);
  });

  it("Scenario C: Aggregates multi-property portfolio health and leverage compliance", () => {
    const rawProperties = [
      { id: "P1", name: "Austin SFR", propertyType: "SFR", state: "TX", value: 450000, balance: 315000, rate: 6.875, rent: 3800, pitiaExtra: 700, lender: "Greenstreet", yearAcquired: 2023 },
      { id: "P2", name: "Tampa Duplex", propertyType: "Duplex", state: "FL", value: 550000, balance: 412500, rate: 7.25, rent: 5200, pitiaExtra: 1100, lender: "Greenstreet", yearAcquired: 2022 },
      { id: "P3", name: "Atlanta 4Plex", propertyType: "4-plex", state: "GA", value: 680000, balance: 476000, rate: 7.125, rent: 7500, pitiaExtra: 1500, lender: "Prior", yearAcquired: 2021 },
    ];

    const portfolioProps = rawProperties.map((p) => {
      const r = p.rate / 100 / 12;
      const pi = (p.balance * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
      const pitia = pi + p.pitiaExtra;
      const dscr = p.rent / pitia;
      return {
        id: p.id,
        name: p.name,
        address: `${p.name}, ${p.state}`,
        monthlyPITIA: pitia,
        monthlyRent: p.rent,
        lender: p.lender,
        loanBalance: p.balance,
        dscr,
        track2DSCR: dscr * 0.9,
        isBlanket: false,
        propertyType: p.propertyType,
        state: p.state,
        value: p.value,
        rate: p.rate,
        yearAcquired: p.yearAcquired,
      };
    });

    const dummyBorrower = { ficoScore: 740, experience: "EXPERIENCED" as const, existingFinancedProperties: 3, entityType: "LLC" as const, isUSCitizenOrPR: true, availableReserves: 150000, reserveAssets: [], isFirstResponder: false, isNonUsInvestor: false };
    const agg = analyzePortfolio(portfolioProps, null, dummyBorrower, 150000);

    expect(agg.totalRent).toBe(16500);
    expect(agg.globalDSCR).toBeGreaterThan(1.0);

    const health = computePortfolioHealthScore(agg);
    expect(health.score).toBeGreaterThan(50);
    expect(health.label).toMatch(/HEALTHY|STRONG|WATCH/);
  });
});
