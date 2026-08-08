import { describe, it, expect } from "vitest";
import {
  computeRemainingBalance,
  computePrepaySchedule,
  computePrepayExitCost,
  resolvePrepayPenalty,
  getPrepayFormula,
} from "./loanOptimizer";

describe("computeRemainingBalance", () => {
  it("returns the full loan at month 0 and 0 at/after term end", () => {
    expect(computeRemainingBalance(300_000, 7, 360, 0)).toBe(300_000);
    expect(computeRemainingBalance(300_000, 7, 360, 360)).toBe(0);
    expect(computeRemainingBalance(300_000, 7, 360, 500)).toBe(0);
  });

  it("amortizes down monotonically", () => {
    const b12 = computeRemainingBalance(300_000, 7, 360, 12);
    const b60 = computeRemainingBalance(300_000, 7, 360, 60);
    expect(b12).toBeLessThan(300_000);
    expect(b60).toBeLessThan(b12);
  });

  it("zero-rate paydown is straight line", () => {
    expect(computeRemainingBalance(120_000, 0, 360, 180)).toBeCloseTo(60_000, 0);
  });
});

describe("computePrepaySchedule", () => {
  it("54321 penalties step down each year on the remaining balance", () => {
    const s = computePrepaySchedule(300_000, 7, 30, "54321", false, 20);
    expect(s.structure).toMatch(/5-4-3-2-1/);
    // Penalty = remaining balance × step rate; year1 (5%) > year2 (4%) > ... > 0
    expect(s.year1).toBeGreaterThan(s.year2);
    expect(s.year2).toBeGreaterThan(s.year3);
    expect(s.year3).toBeGreaterThan(s.year5);
    expect(s.year6Plus).toBe(0);
    // Year-1 penalty ≈ 5% of a ~$297k balance
    expect(s.year1).toBeGreaterThan(14_000);
    expect(s.year1).toBeLessThan(15_100);
  });

  it("NONE structure carries no penalty in any year", () => {
    const s = computePrepaySchedule(300_000, 7, 30, "NONE", false, 0);
    expect([s.year1, s.year2, s.year3, s.year4, s.year5, s.year6Plus].every((v) => v === 0)).toBe(true);
  });

  it("soft prepay leaves sale-exemption unconfirmed", () => {
    const s = computePrepaySchedule(300_000, 7, 30, "SOFT_PREPAY", true, 20);
    expect(s.softPrepay).toBe(true);
    expect(s.softPrepaySaleExempt).toBe("UNCONFIRMED");
  });
});

describe("computePrepayExitCost", () => {
  it("NONE exits are free", () => {
    expect(computePrepayExitCost(300_000, 7, 30, "NONE", 2)).toBe(0);
  });

  it("exiting a 54321 in year 2 costs ~4% of the remaining balance", () => {
    const cost = computePrepayExitCost(300_000, 7, 30, "54321", 2);
    const bal = computeRemainingBalance(300_000, 7, 360, 24);
    expect(cost).toBeCloseTo(bal * 0.04, 0);
  });

  it("exiting after the penalty window (year 6) is free for a 54321", () => {
    expect(computePrepayExitCost(300_000, 7, 30, "54321", 6)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Prepayment penalties come in two genuinely different shapes, and this file
// used to conflate them. getPrepayStepRates returned 0.50 / 0.40 for the
// six-months-interest structures — sentinels meaning "6 months" and "4.8
// months", not percentages. computePrepayExitCost special-cased them;
// computePrepaySchedule, in this same file, read them literally as 50% and 40%
// of the balance and published a year-1 penalty of $148,476 on a $300K/7% loan
// where the real figure is $10,393. A 14.3x overstatement, on the number a
// borrower is shown before signing.
// ---------------------------------------------------------------------------
describe("prepay penalty — one formula, one implementation", () => {
  const LOAN = 300_000, RATE = 7, TERM_YRS = 30;

  it("prices six months' interest as interest, not as 50% of the balance", () => {
    const s = computePrepaySchedule(LOAN, RATE, TERM_YRS, "SIX_MONTHS_INTEREST", false, 0);
    const balanceY1 = computeRemainingBalance(LOAN, RATE, TERM_YRS * 12, 12);
    const expected = balanceY1 * (RATE / 100 / 12) * 6;

    expect(s.year1).toBeCloseTo(expected, 2);
    expect(s.year1).toBeGreaterThan(9_000);
    expect(s.year1).toBeLessThan(12_000);
    // The old value. Anywhere near it means the sentinel is back.
    expect(s.year1).toBeLessThan(20_000);
  });

  it("prices the 80% variant at 4.8 months of interest", () => {
    const s = computePrepaySchedule(LOAN, RATE, TERM_YRS, "SIX_MONTHS_80_PCT", false, 0);
    const full = computePrepaySchedule(LOAN, RATE, TERM_YRS, "SIX_MONTHS_INTEREST", false, 0);
    expect(s.year1).toBeCloseTo(full.year1 * 0.8, 1);
  });

  it("the schedule and the exit-cost wrapper agree, which they did not before", () => {
    for (const type of ["54321", "4321", "321", "54333", "FLAT_5", "SIX_MONTHS_INTEREST", "SIX_MONTHS_80_PCT", "SOFT_PREPAY", "NONE"] as const) {
      const s = computePrepaySchedule(LOAN, RATE, TERM_YRS, type, false, 0);
      for (const [year, fromSchedule] of [[1, s.year1], [2, s.year2], [3, s.year3], [4, s.year4], [5, s.year5]] as const) {
        expect(computePrepayExitCost(LOAN, RATE, TERM_YRS, type, year)).toBeCloseTo(fromSchedule, 2);
      }
    }
  });

  it("a months-of-interest penalty scales with the RATE, which no percentage can", () => {
    // This is why the structure needed its own shape rather than a step rate.
    const at7 = computePrepaySchedule(LOAN, 7, TERM_YRS, "SIX_MONTHS_INTEREST", false, 0).year1;
    const at10 = computePrepaySchedule(LOAN, 10, TERM_YRS, "SIX_MONTHS_INTEREST", false, 0).year1;
    expect(at10).toBeGreaterThan(at7 * 1.3);
  });

  it("a stepdown declines by year and expires; six-months-interest does not", () => {
    const step = computePrepaySchedule(LOAN, RATE, TERM_YRS, "54321", false, 0);
    expect(step.year1).toBeGreaterThan(step.year2);
    expect(step.year2).toBeGreaterThan(step.year3);
    expect(step.year6Plus).toBe(0);

    const six = computePrepaySchedule(LOAN, RATE, TERM_YRS, "SIX_MONTHS_INTEREST", false, 0);
    expect(six.year6Plus).toBeGreaterThan(0);
  });

  it("charges every structure on the REMAINING balance, never the original note", () => {
    const s = computePrepaySchedule(LOAN, RATE, TERM_YRS, "FLAT_5", false, 0);
    expect(s.year1).toBeLessThan(LOAN * 0.05);
    expect(s.year5).toBeLessThan(s.year1);
  });

  it("resolvePrepayPenalty refuses to invent a penalty from an unusable balance", () => {
    for (const bal of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(resolvePrepayPenalty({ prepayType: "54321", remainingBalance: bal, annualRatePct: 7, loanYear: 1 })).toBe(0);
    }
    expect(resolvePrepayPenalty({ prepayType: "NONE", remainingBalance: LOAN, annualRatePct: 7, loanYear: 1 })).toBe(0);
  });

  it("getPrepayFormula keeps the two shapes distinguishable at the type level", () => {
    expect(getPrepayFormula("SIX_MONTHS_INTEREST")).toEqual({ kind: "MONTHS_INTEREST", months: 6 });
    expect(getPrepayFormula("SIX_MONTHS_80_PCT")).toEqual({ kind: "MONTHS_INTEREST", months: 4.8 });
    expect(getPrepayFormula("54321").kind).toBe("BALANCE_PCT");
    // The six-months types must not appear in the stepdown table at all — a
    // percentage there is what caused the 14.3x error.
    const flat = getPrepayFormula("FLAT_5");
    expect(flat.kind === "BALANCE_PCT" && flat.steps.year1).toBe(0.05);
  });
});
