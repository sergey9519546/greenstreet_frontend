import { describe, it, expect } from "vitest";
import {
  DEFAULT_ARM_PROGRAMS,
  simulateARMResetLadder,
  computeRemainingBalanceAtReset,
  computeARMReset,
  computeMultiScenarioARMReset,
  computePaymentShockPct,
  computeLenderStressRate,
} from "./armResetEngine";

const arm = DEFAULT_ARM_PROGRAMS["5_6_ARM"]; // initial 5.125, +2 first cap, +1/period, +5 lifetime

describe("simulateARMResetLadder", () => {
  it("first reset is bounded by the initial cap under sustained stress", () => {
    const r = simulateARMResetLadder(arm, 5.0, 10);
    expect(r.trajectory[0].rate).toBeCloseTo(arm.initialRate + arm.initialCapPct, 3); // 7.125
    expect(r.trajectory[0].capBinding).toBe("INITIAL_CAP");
  });

  it("rate never exceeds the lifetime cap", () => {
    const r = simulateARMResetLadder(arm, 9.0, 10);
    expect(r.lifetimeCapRate).toBeCloseTo(arm.initialRate + arm.lifetimeCapPct, 3); // 10.125
    for (const p of r.trajectory) {
      expect(p.rate).toBeLessThanOrEqual(r.lifetimeCapRate + 1e-6);
    }
    expect(r.stabilizedRate).toBeCloseTo(r.lifetimeCapRate, 3);
    expect(r.yearsToLifetimeCap).not.toBeNull();
  });

  it("a benign index keeps the rate at the floor", () => {
    const r = simulateARMResetLadder(arm, 0.0, 10);
    expect(r.stabilizedRate).toBeCloseTo(arm.floorRate, 3);
  });
});

describe("computeRemainingBalanceAtReset", () => {
  it("returns full principal at month 0 and amortizes down over time", () => {
    expect(computeRemainingBalanceAtReset(300_000, 6, 360, 0)).toBeCloseTo(300_000, 0);
    const b60 = computeRemainingBalanceAtReset(300_000, 6, 360, 60);
    expect(b60).toBeLessThan(300_000);
    expect(b60).toBeGreaterThan(270_000); // little principal paid in first 5 yrs
  });

  it("zero-rate balance is a straight line", () => {
    expect(computeRemainingBalanceAtReset(120_000, 0, 360, 180)).toBeCloseTo(60_000, 0);
  });
});

describe("computeARMReset", () => {
  const r = computeARMReset(arm, 280_000, 300, 2600, 500);

  it("current reset DSCR exceeds stress reset DSCR", () => {
    expect(r.track1DSCRAtCurrentReset).toBeGreaterThan(r.track1DSCRAtStressReset);
  });

  it("lifetime-cap reset rate is initial + lifetime cap", () => {
    expect(r.resetRateAtLifetimeCap).toBeCloseTo(arm.initialRate + arm.lifetimeCapPct, 3);
  });

  it("flags an IO+ARM double shock when IO expiry aligns with the reset", () => {
    // 5/6 ARM resets at year 5; 60-month IO expires at year 5 → critical overlap
    const withIo = computeARMReset(arm, 280_000, 300, 2600, 500, 60);
    expect(withIo.doubleShockRisk).toBe("CRITICAL");
    expect(withIo.ioArmDoubleShockYear).toBe(5);
  });
});

describe("computeMultiScenarioARMReset", () => {
  it("runs 5 scenarios ranked with CRISIS as the worst case", () => {
    const r = computeMultiScenarioARMReset(arm, 280_000, 300, 2600, 500);
    expect(r.scenarios).toHaveLength(5);
    expect(r.breaksCount).toBeGreaterThanOrEqual(0);
    // Worst case has the lowest DSCR of all scenarios
    const minDscr = Math.min(...r.scenarios.map((s) => s.track1DSCRAtStabilization));
    expect(r.worstCase.track1DSCRAtStabilization).toBeCloseTo(minDscr, 3);
  });
});

describe("computePaymentShockPct / computeLenderStressRate", () => {
  it("payment shock is positive and driven by the first-reset cap", () => {
    const r = computePaymentShockPct(arm, 280_000, 300);
    expect(r.paymentShockPct).toBeGreaterThan(0);
    expect(r.worstCasePaymentAtFirstReset).toBeGreaterThan(r.initialPayment);
    expect(r.paymentShockYear).toBe(5);
  });

  it("lender stress rate defaults to the lifetime cap", () => {
    const r = computeLenderStressRate(arm);
    expect(r.stressRate).toBeCloseTo(arm.initialRate + arm.lifetimeCapPct, 3);
    expect(r.lifetimeCapRate).toBeCloseTo(r.stressRate, 3);
  });
});
