import { describe, it, expect } from "vitest";
import {
  computeRemainingBalance,
  computePrepaySchedule,
  computePrepayExitCost,
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
