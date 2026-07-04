import { describe, it, expect } from "vitest";
import { scoreLenderMatch, FACTOR_WEIGHTS } from "./lenderMatchScore";
import { matchLenders } from "./lenders";
import { solveDSCR } from "./engine";
import { buildEngineInputs } from "./inputs";

// A clean, financeable SFR purchase — should produce several eligible lenders.
const { property, borrower, loan, strategy } = buildEngineInputs({
  purchasePrice: 400_000,
  ltv: 70,
  monthlyRent: 3_200,
  state: "TX",
  ficoScore: 760,
  strategy: "LTR",
});

const deal = solveDSCR(property, borrower, loan, strategy);
const fitResults = matchLenders(property, borrower, loan, strategy, deal.solvedRate);
const result = scoreLenderMatch(fitResults, loan, borrower, strategy);

describe("lenderMatchScore — structure", () => {
  it("factor weights sum to 1.0", () => {
    const sum = Object.values(FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("scores every lender in the fit results", () => {
    expect(result.scores).toHaveLength(fitResults.length);
  });

  it("returns at most 3 top picks, all eligible", () => {
    expect(result.topPicks.length).toBeLessThanOrEqual(3);
    expect(result.topPicks.every((p) => p.eligible)).toBe(true);
  });
});

describe("lenderMatchScore — ranking", () => {
  it("sorts eligible lenders first, by descending score", () => {
    const eligible = result.scores.filter((s) => s.eligible);
    const firstIneligibleIdx = result.scores.findIndex((s) => !s.eligible);
    if (firstIneligibleIdx >= 0) {
      // no eligible lender appears after an ineligible one
      expect(result.scores.slice(firstIneligibleIdx).every((s) => !s.eligible)).toBe(true);
    }
    for (let i = 1; i < eligible.length; i++) {
      expect(eligible[i - 1].totalScore).toBeGreaterThanOrEqual(eligible[i].totalScore);
    }
  });

  it("assigns sequential rankAmongEligible and null for ineligible", () => {
    const eligible = result.scores.filter((s) => s.eligible);
    eligible.forEach((s, i) => expect(s.rankAmongEligible).toBe(i + 1));
    expect(result.scores.filter((s) => !s.eligible).every((s) => s.rankAmongEligible === null)).toBe(true);
  });

  it("scores each eligible lender 0-100 with a matching tier", () => {
    for (const s of result.scores.filter((x) => x.eligible)) {
      expect(s.totalScore).toBeGreaterThanOrEqual(0);
      expect(s.totalScore).toBeLessThanOrEqual(100);
      if (s.totalScore >= 80) expect(s.tier).toBe("TOP_PICK");
      else if (s.totalScore >= 65) expect(s.tier).toBe("STRONG");
      else if (s.totalScore >= 50) expect(s.tier).toBe("VIABLE");
      else expect(s.tier).toBe("WEAK");
    }
  });

  it("ineligible lenders score 0 and are WEAK", () => {
    for (const s of result.scores.filter((x) => !x.eligible)) {
      expect(s.totalScore).toBe(0);
      expect(s.tier).toBe("WEAK");
    }
  });
});

describe("lenderMatchScore — summary", () => {
  it("reports the eligible count and a benchmark rate", () => {
    expect(result.fieldCount).toBe(fitResults.filter((f) => f.eligible).length);
    expect(result.marketRateBenchmark).toBeGreaterThan(0);
    expect(result.summary).toMatch(/eligible/i);
  });
});
