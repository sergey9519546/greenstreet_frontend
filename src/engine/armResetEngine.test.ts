import { describe, it, expect } from "vitest";
import {
  DEFAULT_ARM_PROGRAMS,
  simulateARMResetLadder,
  computeRemainingBalanceAtReset,
  computeARMReset,
  computeMultiScenarioARMReset,
  computePaymentShockPct,
  computeLenderStressRate,
  applyResetCaps,
  buildARMSchedule,
  computeScheduleDscr,
} from "./armResetEngine";
import { calculatePI } from "./engine";

const arm = DEFAULT_ARM_PROGRAMS["5_6_ARM"]; // initial 5.125, +2 first cap, +1/period, +5 lifetime

describe("simulateARMResetLadder", () => {
  it("does not invent a reset when the analysis horizon ends before the fixed period", () => {
    const r = simulateARMResetLadder(arm, 5.0, 1);

    expect(r.trajectory).toEqual([]);
    expect(r.stabilizedRate).toBe(arm.initialRate);
  });

  it("does not place a month-61 reset inside a 60-month fixed-period horizon", () => {
    const r = simulateARMResetLadder(arm, 5.0, 5);

    expect(r.trajectory).toEqual([]);
    expect(r.stabilizedRate).toBe(arm.initialRate);
  });

  it("fails closed when a note rate is not finite", () => {
    expect(() => simulateARMResetLadder({ ...arm, marginPct: Number.NaN }, 5.0, 10)).toThrow(/ARM terms/i);
  });

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
  it("rejects a non-finite rate instead of returning a non-finite balance", () => {
    expect(() => computeRemainingBalanceAtReset(300_000, Number.POSITIVE_INFINITY, 360, 60)).toThrow(/annualRate/i);
  });

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

// ============================================================
// applyResetCaps — the per-reset cap contract, in isolation.
//
// Every number below is hand-derived from the documented clamp order
// (periodic band -> lifetime ceiling -> floor, see the function's own
// doc comment), NOT read off a prior run of the function. `arm` is the
// 5/6 ARM: initial 5.125, margin 2.75, +2 first-reset cap, +1 periodic
// cap, +5 lifetime cap, floor = initial.
// ============================================================
describe("applyResetCaps — cap application, hand-derived per reset", () => {
  it("first reset: the INITIAL cap binds, not the periodic cap", () => {
    // fully-indexed = 5.0 + 2.75 = 7.75; first-reset ceiling = 5.125 + 2.0 = 7.125
    const r = applyResetCaps(arm, 5.125, 7.75, /* isFirstReset */ true);
    expect(r.rate).toBeCloseTo(7.125, 6);
    expect(r.capBinding).toBe("INITIAL_CAP");
    expect(r.direction).toBe("UP");
    expect(r.fullyIndexedRate).toBe(7.75);
  });

  it("a later reset: the PERIODIC cap binds on an upward move", () => {
    // prevRate 7.125 (post first reset), fully-indexed 7.0 + 2.75 = 9.75,
    // periodic ceiling = 7.125 + 1.0 = 8.125
    const r = applyResetCaps(arm, 7.125, 9.75, false);
    expect(r.rate).toBeCloseTo(8.125, 6);
    expect(r.capBinding).toBe("PERIODIC_CAP");
    expect(r.direction).toBe("UP");
  });

  it("the PERIODIC cap binds symmetrically on a DOWNWARD move too", () => {
    // The historical bug (documented in the source) only capped increases,
    // letting a falling index drop straight to fully-indexed in one reset.
    // prevRate 8.0, fully-indexed 6.5, periodic cap 1.0 -> floor of the band
    // is 8.0 - 1.0 = 7.0, which must bind before the rate reaches 6.5.
    const r = applyResetCaps(arm, 8.0, 6.5, false);
    expect(r.rate).toBeCloseTo(7.0, 6);
    expect(r.capBinding).toBe("PERIODIC_CAP");
    expect(r.direction).toBe("DOWN");
  });

  it("the LIFETIME cap wins the label once the rate reaches the ceiling, even via periodic clamping", () => {
    // prevRate 9.125, fully-indexed 9.0 + 2.75 = 11.75, periodic ceiling =
    // 9.125 + 1.0 = 10.125, which happens to equal initial(5.125)+lifetime(5.0).
    const r = applyResetCaps(arm, 9.125, 11.75, false);
    expect(r.rate).toBeCloseTo(10.125, 6);
    expect(r.capBinding).toBe("LIFETIME_CAP");
    expect(r.direction).toBe("UP");
  });

  it("the FLOOR applies last, overriding whatever the periodic band produced", () => {
    // fully-indexed = 0.0 + 2.75 = 2.75; periodic band on a first reset from
    // 5.125 floors the move at 5.125 - 2.0 = 3.125, but the contractual floor
    // (5.125, same as initial on this ARM) sits above that and wins.
    const r = applyResetCaps(arm, 5.125, 2.75, true);
    expect(r.rate).toBeCloseTo(5.125, 6);
    expect(r.capBinding).toBe("FLOOR");
    expect(r.direction).toBe("FLAT");
  });

  it("reports NONE and FLAT once the ladder has converged to fully-indexed", () => {
    const r = applyResetCaps(arm, 7.75, 7.75, false);
    expect(r.rate).toBeCloseTo(7.75, 6);
    expect(r.capBinding).toBe("NONE");
    expect(r.direction).toBe("FLAT");
  });
});

// ============================================================
// buildARMSchedule — the complete amortization + IO transition + reset
// ladder schedule. This is what the ARM Reset tool's release gate actually
// requires: index/margin/caps/dates driving REAL rate steps on the shared
// kernel, not a re-derived closed-form balance.
// ============================================================
describe("buildARMSchedule — reset boundaries walk the actual schedule", () => {
  const BASE_INPUT = {
    loanAmount: 300_000,
    armTerms: arm,
    termMonths: 360,
    ioMonths: 0,
    originationDate: "2024-01-01",
  };

  it("first reset lands at fixedPeriodMonths + 1 and is bounded by the initial cap", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, sustainedIndexPct: 5.0 });
    expect(s.firstResetMonth).toBe(61);
    expect(s.resets[0].month).toBe(61);
    expect(s.resets[0].ratePct).toBeCloseTo(7.125, 3);
    expect(s.resets[0].capBinding).toBe("INITIAL_CAP");
    expect(s.resets[0].direction).toBe("UP");
    // Dated off the origination date via the shared addMonthsToIsoDate helper.
    expect(s.resets[0].date).toBe("2029-01-01");
    expect(s.firstResetDate).toBe("2029-01-01");
  });

  it("the reset ladder converges within the schedule: second reset is NOT cap-bound under STRESS", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, sustainedIndexPct: 5.0 });
    expect(s.resets[1].month).toBe(67);
    expect(s.resets[1].ratePct).toBeCloseTo(7.75, 3); // 5.0 + 2.75, fully indexed
    expect(s.resets[1].capBinding).toBe("NONE");
    expect(s.resets[2].ratePct).toBeCloseTo(7.75, 3);
    expect(s.resets[2].direction).toBe("FLAT");
  });

  it("a harder shock (CRISIS, SOFR 7.0%) binds the PERIODIC cap at resets 2 and 3", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, sustainedIndexPct: 7.0 });
    expect(s.resets[0].ratePct).toBeCloseTo(7.125, 3);
    expect(s.resets[0].capBinding).toBe("INITIAL_CAP");
    expect(s.resets[1].ratePct).toBeCloseTo(8.125, 3);
    expect(s.resets[1].capBinding).toBe("PERIODIC_CAP");
    expect(s.resets[2].ratePct).toBeCloseTo(9.125, 3);
    expect(s.resets[2].capBinding).toBe("PERIODIC_CAP");
    // Stabilizes at fully-indexed (9.75) BELOW the 10.125 lifetime ceiling —
    // this margin never lets CRISIS reach the structural cap.
    expect(s.resets[3].ratePct).toBeCloseTo(9.75, 3);
    expect(s.resets[3].capBinding).toBe("NONE");
  });

  it("an extreme sustained index (9.0%) reaches the LIFETIME cap and the ladder stops", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, sustainedIndexPct: 9.0 });
    expect(s.resets).toHaveLength(4);
    const last = s.resets[s.resets.length - 1];
    expect(last.ratePct).toBeCloseTo(10.125, 3);
    expect(last.capBinding).toBe("LIFETIME_CAP");
    expect(s.lifetimeCapRate).toBeCloseTo(10.125, 3);
  });

  it("re-amortizes each reset on the schedule's OWN balance, matching an independent calculatePI call", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, sustainedIndexPct: 5.0 });
    const reset1 = s.resets[0];
    const remainingTerm = 360 - reset1.month + 1;
    const expectedPayment = calculatePI(reset1.balanceAtReset, reset1.ratePct, remainingTerm);
    expect(reset1.paymentAfter).toBeCloseTo(expectedPayment, 2);
    // The balance handed to the recast is the schedule's own closing balance
    // the month before the reset — not a separately re-derived number.
    expect(reset1.balanceAtReset).toBeCloseTo(s.schedule.rows[59].closingBalance, 6);
  });

  it("identifies the largest payment-change boundary correctly (the first reset, not a later smaller one)", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, sustainedIndexPct: 5.0 });
    const change61 = s.schedule.paymentChanges.find((c) => c.month === 61)!;
    const change67 = s.schedule.paymentChanges.find((c) => c.month === 67)!;
    expect(change61).toBeDefined();
    expect(change67).toBeDefined();
    expect(change61.changePct).toBeGreaterThan(change67.changePct);
    expect(s.worstPaymentChangeMonth).toBe(61);
    expect(s.worstPaymentChangePct).toBeCloseTo(change61.changePct, 6);
  });

  it("a FLOOR-bound reset (rate reverts to the initial rate) recasts WITHOUT a payment discontinuity", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, sustainedIndexPct: 0.0 });
    expect(s.resets[0].capBinding).toBe("FLOOR");
    expect(s.resets[0].ratePct).toBeCloseTo(5.125, 3);
    expect(s.resets[0].direction).toBe("FLAT");
    // The reset fires (the month is a rate step), but because the floor lands
    // exactly back on the rate the loan has amortized at since origination, the
    // balance is already exactly on-schedule for that rate/term pair — so
    // re-amortizing it over the remaining term reproduces the SAME payment.
    // A real jump only shows up when the recast rate actually differs (see the
    // INITIAL_CAP / PERIODIC_CAP / LIFETIME_CAP cases above).
    expect(s.resets[0].paymentAfter).toBeCloseTo(s.resets[0].paymentBefore, 6);
    const expectedPayment = calculatePI(s.resets[0].balanceAtReset, 5.125, 300);
    expect(s.resets[0].paymentAfter).toBeCloseTo(expectedPayment, 2);
  });

  it("IO expiry coinciding with the first reset produces the combined IO_EXPIRY_AND_RATE_RESET boundary", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, ioMonths: 60, sustainedIndexPct: 5.0 });
    expect(s.ioExpiryMonth).toBe(61);
    expect(s.firstResetMonth).toBe(61);
    expect(s.doubleShock).toBe(true);
    const row = s.schedule.rows[60];
    expect(row.changeReason).toBe("IO_EXPIRY_AND_RATE_RESET");
    expect(s.ioExpiryPaymentChangePct).not.toBeNull();
    expect(s.ioExpiryPaymentChangePct!).toBeGreaterThan(0);
  });

  it("an IO expiry far from any reset is its own boundary and does NOT flag a double shock", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, ioMonths: 24, sustainedIndexPct: 5.0 });
    expect(s.ioExpiryMonth).toBe(25);
    expect(s.schedule.rows[24].changeReason).toBe("IO_EXPIRY");
    // 25 vs first reset at 61 -> 36 months apart, well outside the 12-month window.
    expect(s.doubleShock).toBe(false);
  });

  it("an IO expiry within 12 months of a reset (but not the same month) flags doubleShock without merging the reasons", () => {
    const s = buildARMSchedule({ ...BASE_INPUT, ioMonths: 54, sustainedIndexPct: 5.0 });
    expect(s.ioExpiryMonth).toBe(55);
    expect(s.firstResetMonth).toBe(61); // 6 months apart, inside the 12-month window
    expect(s.doubleShock).toBe(true);
    expect(s.schedule.rows[54].changeReason).toBe("IO_EXPIRY");
    expect(s.schedule.rows[60].changeReason).toBe("RATE_RESET");
  });

  it("no reset occurs at all when the fixed period outlasts the term — the schedule stays on the initial rate", () => {
    const s = buildARMSchedule({
      loanAmount: 200_000,
      armTerms: DEFAULT_ARM_PROGRAMS["10_6_ARM"], // fixed 120 months
      termMonths: 60,
      ioMonths: 0,
      sustainedIndexPct: 9.0, // would blow through every cap if it ever reset
    });
    expect(s.resets).toHaveLength(0);
    expect(s.rateSteps).toHaveLength(0);
    expect(s.schedule.rows).toHaveLength(60);
    expect(s.schedule.rows[59].annualRatePct).toBe(DEFAULT_ARM_PROGRAMS["10_6_ARM"].initialRate);
  });

  it("fails closed on an unusable loan amount instead of building a schedule on a guess", () => {
    expect(() => buildARMSchedule({ ...BASE_INPUT, loanAmount: 0, sustainedIndexPct: 5.0 })).toThrow();
    expect(() => buildARMSchedule({ ...BASE_INPUT, loanAmount: NaN, sustainedIndexPct: 5.0 })).toThrow();
    expect(() => buildARMSchedule({ ...BASE_INPUT, loanAmount: -50_000, sustainedIndexPct: 5.0 })).toThrow();
  });

  it("fails closed when the sustained index is not a finite rate", () => {
    expect(() => buildARMSchedule({ ...BASE_INPUT, sustainedIndexPct: Number.NaN })).toThrow(/sustainedIndexPct/i);
  });
});

describe("computeScheduleDscr — reads DSCR off the schedule's own payments", () => {
  it("matches rent / (scheduled payment + expenses) at specific months, independently recomputed", () => {
    const s = buildARMSchedule({
      loanAmount: 300_000,
      armTerms: arm,
      termMonths: 360,
      ioMonths: 0,
      sustainedIndexPct: 5.0,
    });
    const rent = 3_000;
    const expenses = 500;
    const points = computeScheduleDscr(s.schedule, rent, expenses, [1, 61, 67]);
    expect(points).toHaveLength(3);
    for (const p of points) {
      const row = s.schedule.rows[p.month - 1];
      const expectedDscr = rent / (row.payment + expenses);
      expect(p.dscr).toBeCloseTo(expectedDscr, 6);
      expect(p.payment).toBeCloseTo(row.payment, 6);
      expect(p.phase).toBe(row.phase);
    }
    // DSCR must fall as the payment jumps at the first reset.
    expect(points[1].dscr).toBeLessThan(points[0].dscr);
  });

  it("defaults to every month in the schedule when none are requested", () => {
    const s = buildARMSchedule({
      loanAmount: 300_000,
      armTerms: arm,
      termMonths: 360,
      ioMonths: 0,
      sustainedIndexPct: 5.0,
    });
    const points = computeScheduleDscr(s.schedule, 3_000, 500);
    expect(points).toHaveLength(s.schedule.rows.length);
  });
});
