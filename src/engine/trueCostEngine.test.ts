import { describe, it, expect } from "vitest";
import { computeAEY, rankLendersByAEY } from "./trueCostEngine";

const rankingQuote = (overrides: Record<string, unknown> = {}) => ({
  lender: {
    id: "test-lender",
    name: "Test Lender",
    sourceType: "LENDER_PUBLISHED",
    confidenceScore: 80,
    sourceSnapshot: "test snapshot",
  },
  estimatedRate: 7.5,
  eligible: true,
  ineligibleReasons: [],
  fitTier: "STANDARD_FIT",
  pppAllowed: true,
  pppStructure: "3-2-1",
  loanAmount: 300_000,
  termMonths: 360,
  holdMonths: 36,
  parRate: 7.5,
  prepayPenaltyAtExit: 12_000,
  provenanceWarnings: [],
  ...overrides,
}) as any;

// AEY (all-in effective yield) is the XIRR of the borrower's real cash flows:
// net proceeds in, P&I out, balloon + prepay at exit. It should exceed the
// note rate whenever points/fees/prepay are present, and equal it (roughly)
// when the loan is clean. These guard the numbers surfaced in TrueCostComparator.
describe("computeAEY", () => {
  const LOAN = 300_000;
  const TERM = 360;

  it("keeps every payment and the balloon on the exact sixth month", () => {
    const result = computeAEY(LOAN, 7.5, TERM, 6, 0, 0, 0, 0, 0);

    expect(result.cashFlows.map((flow) => flow.month)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.cashFlows.slice(1, -1).every((flow) => flow.amount < 0)).toBe(true);
    expect(result.cashFlows.at(-1)?.amount).toBeLessThan(result.cashFlows[1].amount);
  });

  it("uses a monthly payment schedule for an eighteen-month hold", () => {
    const result = computeAEY(LOAN, 7.5, TERM, 18, 0, 0, 0, 0, 0);

    expect(result.cashFlows.map((flow) => flow.month)).toEqual(
      Array.from({ length: 19 }, (_, month) => month),
    );
    expect(result.cashFlows[12].amount).toBeCloseTo(result.cashFlows[1].amount, 8);
    expect(result.cashFlows.at(-1)?.amount).toBeLessThan(result.cashFlows[17].amount);
  });

  it("returns AEY ≈ note rate for a clean loan (no points/fees/prepay)", () => {
    const r = computeAEY(LOAN, 7.5, TERM, 36, 0, 0, 0, 0, 0);
    // Small XIRR discretization drift is expected; keep a tight band.
    expect(r.aey).toBeGreaterThan(7.0);
    expect(r.aey).toBeLessThan(8.0);
  });

  it("AEY rises above the note rate once points + fees are added", () => {
    const clean = computeAEY(LOAN, 7.5, TERM, 36, 0, 0, 0, 0, 0);
    const costly = computeAEY(LOAN, 7.5, TERM, 36, 2, 3000, 0, 0, 0);
    expect(costly.aey).toBeGreaterThan(clean.aey);
  });

  it("a lower rate with points can cost more (higher AEY) than a higher clean rate", () => {
    // Classic rate-myopia trap on a short 2yr hold.
    const lowRatePoints = computeAEY(LOAN, 7.25, TERM, 24, 2, 1500, 0, 0, 0);
    const highRateClean = computeAEY(LOAN, 7.875, TERM, 24, 0, 1500, 0, 0, 0);
    expect(lowRatePoints.aey).toBeGreaterThan(highRateClean.aey);
  });

  it("flags points that never recoup within the hold as RED", () => {
    // Bought down 0.25% (par 7.75 → 7.5) with 2 points on a 12-month hold:
    // savings can't repay the points in time.
    const r = computeAEY(LOAN, 7.5, TERM, 12, 2, 0, 0, 0, 0, 7.75);
    expect(r.pointsRecoupVerdict).toBe("RED");
  });

  it("computes 60-month total cost greater than 36-month", () => {
    const r = computeAEY(LOAN, 7.5, TERM, 60, 1, 1500, 0, 0, 0);
    expect(r.totalCost60mo).toBeGreaterThan(r.totalCost36mo);
    expect(r.totalCost36mo).toBeGreaterThan(r.totalCost12mo);
  });
});

describe("true-cost quote guardrails", () => {
  it("applies a quoted exit penalty only when PPP is allowed", () => {
    const ranking = rankLendersByAEY([
      rankingQuote({ lender: { id: "allowed", name: "Allowed PPP", sourceType: "LENDER_PUBLISHED", confidenceScore: 80, sourceSnapshot: "test" }, pppAllowed: true }),
      rankingQuote({ lender: { id: "prohibited", name: "No PPP", sourceType: "LENDER_PUBLISHED", confidenceScore: 80, sourceSnapshot: "test" }, pppAllowed: false }),
    ]);

    const allowed = ranking.find((entry) => entry.lenderId === "allowed");
    const prohibited = ranking.find((entry) => entry.lenderId === "prohibited");
    expect(allowed?.aey).toBeGreaterThan(prohibited?.aey ?? Infinity);
  });

  it("rejects non-finite and out-of-domain AEY inputs", () => {
    expect(() => computeAEY(Number.NaN, 7.5, 360, 36, 0, 0, 0, 0, 0)).toThrow(RangeError);
    expect(() => computeAEY(300_000, -0.1, 360, 36, 0, 0, 0, 0, 0)).toThrow(RangeError);
    expect(() => computeAEY(300_000, 7.5, 360, 0, 0, 0, 0, 0, 0)).toThrow(RangeError);
    expect(() => computeAEY(300_000, 7.5, 360, 36, 100, 0, 0, 0, 0)).toThrow(RangeError);
  });

  it("keeps an invalid quote unavailable without breaking valid quote ranking", () => {
    const ranking = rankLendersByAEY([
      rankingQuote({ lender: { id: "valid", name: "Valid Quote", sourceType: "LENDER_PUBLISHED", confidenceScore: 80, sourceSnapshot: "test" } }),
      rankingQuote({ lender: { id: "invalid", name: "Invalid Quote", sourceType: "LENDER_PUBLISHED", confidenceScore: 80, sourceSnapshot: "test" }, holdMonths: 0 }),
    ]);

    const valid = ranking.find((entry) => entry.lenderId === "valid");
    const invalid = ranking.find((entry) => entry.lenderId === "invalid");
    expect(valid?.eligible).toBe(true);
    expect(invalid?.eligible).toBe(false);
    expect(invalid?.aey).toBe(Infinity);
    expect(invalid?.ineligibleReasons.join(" ")).toContain("True-cost unavailable");
  });

  it("does not present an ineligible quote as zero-cost financing", () => {
    const [ineligible] = rankLendersByAEY([
      rankingQuote({
        lender: { id: "ineligible", name: "Ineligible", sourceType: "LENDER_PUBLISHED", confidenceScore: 80, sourceSnapshot: "test" },
        eligible: false,
        ineligibleReasons: ["Program mismatch"],
      }),
    ]);

    expect(ineligible.aey).toBe(Infinity);
  });
});
