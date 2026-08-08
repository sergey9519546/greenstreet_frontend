import { describe, it, expect } from 'vitest';
import {
  buildAmortizationSchedule,
  balanceAtMonth,
  paymentAtMonth,
  cumulativePayments,
  payoffQuote,
  summarizeByYear,
  computeRefiBreakEven,
  addMonthsToIsoDate,
  DEFAULT_HOLD_PERIODS_MONTHS,
  type AmortizationSchedule,
} from './amortization';
import { calculatePI } from './engine';

// ---------------------------------------------------------------------------
// WHY THESE TESTS ASSERT ON INTERMEDIATE ROWS
//
// The module advertises "sum(interest) + sum(principal) === sum(payments)" and
// "finalBalance is 0" as evidence of correctness. Neither is evidence:
//
//   - every row sets `principal = payment - interest`, so the sum identity is
//     per-row algebra that holds for ANY payment the loop happens to compute,
//     including a wrong one;
//   - the last month is explicitly forced (`principalPaid = balance;
//     payment = principalPaid + interest`), so a zero final balance is
//     assignment, not arithmetic. A loop that drifted every month would still
//     land on zero — the drift would just be absorbed into the last payment.
//
// So the schedule is checked against the closed-form remaining-balance formula
// at MIDDLE months, which is derived independently of the loop, and the final
// payment is checked to be an ordinary payment rather than a large correction.
// ---------------------------------------------------------------------------

/** Closed-form balance after k payments: B_k = P(1+r)^k − PMT·((1+r)^k − 1)/r. */
function closedFormBalance(principal: number, annualRatePct: number, termMonths: number, k: number): number {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal * (1 - k / termMonths);
  const pmt = calculatePI(principal, annualRatePct, termMonths);
  const g = Math.pow(1 + r, k);
  return principal * g - pmt * ((g - 1) / r);
}

const P = 400_000;
const RATE = 7.0;
const TERM = 360;

describe('buildAmortizationSchedule — fixed rate, fully amortizing', () => {
  const s = buildAmortizationSchedule({ principal: P, annualRatePct: RATE, termMonths: TERM });

  it('emits one row per month with sequential months and years', () => {
    expect(s.rows).toHaveLength(TERM);
    expect(s.rows[0].month).toBe(1);
    expect(s.rows[0].year).toBe(1);
    expect(s.rows[11].year).toBe(1);
    expect(s.rows[12].year).toBe(2);
    expect(s.rows[TERM - 1].month).toBe(TERM);
    expect(s.rows[TERM - 1].year).toBe(30);
  });

  it('pays the same P&I the DSCR engine computes, every month', () => {
    const pi = calculatePI(P, RATE, TERM);
    // Months 1..359. The last is excluded on purpose — it is forced, and the
    // next test is what holds it honest.
    for (let m = 1; m < TERM; m++) {
      expect(s.rows[m - 1].payment).toBeCloseTo(pi, 6);
    }
    expect(s.paymentChanges).toHaveLength(1);
    expect(s.paymentChanges[0].reason).toBe('ORIGINATION');
  });

  it('the forced final payment is an ordinary payment, not a swept-up error', () => {
    // This is the test that gives `finalBalance === 0` any meaning. If the loop
    // drifted by even a dollar a month, 359 months of drift would land here.
    const pi = calculatePI(P, RATE, TERM);
    expect(s.rows[TERM - 1].payment).toBeCloseTo(pi, 2);
    expect(s.finalBalance).toBe(0);
  });

  it('matches the closed-form balance at months 1, 12, 60, 120, 240 and 359', () => {
    for (const k of [1, 12, 60, 120, 240, 359]) {
      expect(balanceAtMonth(s, k)).toBeCloseTo(closedFormBalance(P, RATE, TERM, k), 4);
    }
  });

  it('the balance falls every month and never goes negative', () => {
    let prev = Number.POSITIVE_INFINITY;
    for (const row of s.rows) {
      expect(row.closingBalance).toBeLessThan(prev);
      expect(row.closingBalance).toBeGreaterThanOrEqual(0);
      prev = row.closingBalance;
    }
  });

  it('shifts from interest toward principal as the loan seasons', () => {
    expect(s.rows[0].interest).toBeGreaterThan(s.rows[0].principal);
    expect(s.rows[TERM - 1].principal).toBeGreaterThan(s.rows[TERM - 1].interest);
    for (let m = 2; m <= TERM - 1; m++) {
      expect(s.rows[m - 1].principal).toBeGreaterThan(s.rows[m - 2].principal);
    }
  });

  it('opening balance chains from the prior closing balance', () => {
    expect(s.rows[0].openingBalance).toBe(P);
    for (let m = 2; m <= TERM; m++) {
      expect(s.rows[m - 1].openingBalance).toBeCloseTo(s.rows[m - 2].closingBalance, 9);
    }
  });

  it('charges interest on the opening balance at the note rate', () => {
    for (const k of [1, 50, 200, 359]) {
      const row = s.rows[k - 1];
      expect(row.interest).toBeCloseTo(row.openingBalance * (RATE / 100 / 12), 9);
    }
  });

  it('repays exactly the principal borrowed', () => {
    expect(s.totalPrincipal).toBeCloseTo(P, 6);
    expect(s.totalPaid).toBeCloseTo(s.totalInterest + s.totalPrincipal, 6);
  });
});

describe('buildAmortizationSchedule — interest-only front end', () => {
  const IO = 120;
  const s = buildAmortizationSchedule({ principal: P, annualRatePct: RATE, termMonths: TERM, ioMonths: IO });

  it('holds the balance flat and pays pure interest through the IO period', () => {
    const ioPayment = P * (RATE / 100 / 12);
    for (let m = 1; m <= IO; m++) {
      const row = s.rows[m - 1];
      expect(row.phase).toBe('IO');
      expect(row.principal).toBe(0);
      expect(row.closingBalance).toBeCloseTo(P, 9);
      expect(row.payment).toBeCloseTo(ioPayment, 9);
    }
  });

  it('recasts at IO expiry over the REMAINING term, not the original one', () => {
    // This is the whole reason an IO loan needs a schedule: the post-IO payment
    // amortizes the untouched principal over 240 months, not 360.
    const recast = calculatePI(P, RATE, TERM - IO);
    expect(s.rows[IO].phase).toBe('AMORTIZING');
    expect(s.rows[IO].payment).toBeCloseTo(recast, 6);
    expect(s.rows[IO].changeReason).toBe('IO_EXPIRY');
  });

  it('the recast is a real payment shock, and it is reported', () => {
    const change = s.paymentChanges.find((c) => c.reason === 'IO_EXPIRY');
    expect(change).toBeDefined();
    expect(change!.month).toBe(IO + 1);
    expect(change!.toPayment).toBeGreaterThan(change!.fromPayment);
    // 7% over 20 years vs interest-only: roughly a 33% jump.
    expect(change!.changePct).toBeGreaterThan(25);
  });

  it('amortizes the post-IO half exactly like a 240-month loan', () => {
    for (const k of [12, 60, 120, 239]) {
      expect(balanceAtMonth(s, IO + k)).toBeCloseTo(closedFormBalance(P, RATE, TERM - IO, k), 4);
    }
    expect(s.finalBalance).toBe(0);
  });

  it('costs more interest than the same loan without an IO period', () => {
    const noIo = buildAmortizationSchedule({ principal: P, annualRatePct: RATE, termMonths: TERM });
    expect(s.totalInterest).toBeGreaterThan(noIo.totalInterest);
    expect(s.totalPrincipal).toBeCloseTo(P, 6);
  });

  it('clamps an IO period longer than the term instead of running past it', () => {
    const all = buildAmortizationSchedule({ principal: P, annualRatePct: RATE, termMonths: 12, ioMonths: 999 });
    expect(all.ioMonths).toBe(12);
    // The last month still has to retire the loan — a balloon, priced as one.
    expect(all.finalBalance).toBe(0);
    expect(all.rows[11].principal).toBeCloseTo(P, 6);
  });
});

describe('buildAmortizationSchedule — rate steps (ARM resets)', () => {
  it('recasts on the current balance over the remaining term at the new rate', () => {
    const s = buildAmortizationSchedule({
      principal: P,
      annualRatePct: 6.0,
      termMonths: TERM,
      rateSteps: [{ month: 61, annualRatePct: 8.5, label: 'Reset 1' }],
    });

    const balanceAtReset = balanceAtMonth(s, 60);
    const expected = calculatePI(balanceAtReset, 8.5, TERM - 60);

    expect(s.rows[60].annualRatePct).toBe(8.5);
    expect(s.rows[60].payment).toBeCloseTo(expected, 6);
    expect(s.rows[60].changeReason).toBe('RATE_RESET');
    expect(s.rows[59].annualRatePct).toBe(6.0);
    expect(s.finalBalance).toBe(0);
  });

  it('handles a reset ladder, repricing off each step in turn', () => {
    const s = buildAmortizationSchedule({
      principal: P,
      annualRatePct: 6.0,
      termMonths: TERM,
      rateSteps: [
        { month: 61, annualRatePct: 8.0 },
        { month: 73, annualRatePct: 9.5 },
        { month: 85, annualRatePct: 7.25 },
      ],
    });

    expect(s.paymentChanges.map((c) => c.month)).toEqual([1, 61, 73, 85]);
    for (const m of [61, 73, 85]) {
      const rate = s.rows[m - 1].annualRatePct;
      const expected = calculatePI(balanceAtMonth(s, m - 1), rate, TERM - m + 1);
      expect(s.rows[m - 1].payment).toBeCloseTo(expected, 6);
    }
    expect(s.maxPayment).toBeGreaterThan(s.minPayment);
  });

  it('names the double shock when a reset lands on IO expiry', () => {
    // The compound case an ARM review exists to surface: the recast and the
    // reset hit the same month, so neither alone explains the jump.
    const s = buildAmortizationSchedule({
      principal: P,
      annualRatePct: 6.0,
      termMonths: TERM,
      ioMonths: 60,
      rateSteps: [{ month: 61, annualRatePct: 9.0 }],
    });
    expect(s.rows[60].changeReason).toBe('IO_EXPIRY_AND_RATE_RESET');
    expect(s.paymentChanges.find((c) => c.month === 61)!.reason).toBe('IO_EXPIRY_AND_RATE_RESET');
  });

  it('treats a step at month 1 as the origination rate, not a reset', () => {
    const s = buildAmortizationSchedule({
      principal: P,
      annualRatePct: 6.0,
      termMonths: TERM,
      rateSteps: [{ month: 1, annualRatePct: 7.5 }],
    });
    expect(s.initialRatePct).toBe(7.5);
    expect(s.rows[0].annualRatePct).toBe(7.5);
    expect(s.paymentChanges).toHaveLength(1);
    expect(s.paymentChanges[0].reason).toBe('ORIGINATION');
  });

  it('ignores steps outside the term and non-numeric steps', () => {
    const s = buildAmortizationSchedule({
      principal: P,
      annualRatePct: 6.0,
      termMonths: 120,
      rateSteps: [
        { month: 500, annualRatePct: 12 },
        { month: Number.NaN, annualRatePct: 12 },
        { month: 24, annualRatePct: Number.NaN },
        { month: 36, annualRatePct: -3 },
      ],
    });
    expect(s.paymentChanges).toHaveLength(1);
    expect(s.rows.every((r) => r.annualRatePct === 6.0)).toBe(true);
  });

  it('keeps the last step when two land on the same month', () => {
    const s = buildAmortizationSchedule({
      principal: P,
      annualRatePct: 6.0,
      termMonths: 120,
      rateSteps: [
        { month: 25, annualRatePct: 8.0 },
        { month: 25, annualRatePct: 9.0 },
      ],
    });
    expect(s.rows[24].annualRatePct).toBe(9.0);
  });
});

describe('buildAmortizationSchedule — degenerate and invalid inputs', () => {
  it('handles a 0% loan as straight-line principal with no interest', () => {
    const s = buildAmortizationSchedule({ principal: 120_000, annualRatePct: 0, termMonths: 120 });
    expect(s.totalInterest).toBe(0);
    expect(s.rows.every((r) => r.payment === 1000)).toBe(true);
    expect(s.finalBalance).toBe(0);
  });

  it('handles a one-month term', () => {
    const s = buildAmortizationSchedule({ principal: 10_000, annualRatePct: 12, termMonths: 1 });
    expect(s.rows).toHaveLength(1);
    expect(s.rows[0].interest).toBeCloseTo(100, 9);
    expect(s.rows[0].principal).toBe(10_000);
    expect(s.rows[0].payment).toBeCloseTo(10_100, 9);
    expect(s.finalBalance).toBe(0);
  });

  it('refuses to build a schedule from an unusable input rather than returning NaN rows', () => {
    // A NaN schedule is worse than a thrown error: it propagates silently into
    // every downstream balance, payoff and break-even.
    expect(() => buildAmortizationSchedule({ principal: 0, annualRatePct: 7, termMonths: 360 })).toThrow(/principal/);
    expect(() => buildAmortizationSchedule({ principal: -1, annualRatePct: 7, termMonths: 360 })).toThrow(/principal/);
    expect(() => buildAmortizationSchedule({ principal: Number.NaN, annualRatePct: 7, termMonths: 360 })).toThrow(/principal/);
    expect(() => buildAmortizationSchedule({ principal: P, annualRatePct: 7, termMonths: 0 })).toThrow(/termMonths/);
    expect(() => buildAmortizationSchedule({ principal: P, annualRatePct: -1, termMonths: 360 })).toThrow(/annualRatePct/);
    expect(() => buildAmortizationSchedule({ principal: P, annualRatePct: Number.NaN, termMonths: 360 })).toThrow(/annualRatePct/);
  });

  it('produces no NaN anywhere in a valid schedule', () => {
    const s = buildAmortizationSchedule({
      principal: P, annualRatePct: RATE, termMonths: TERM, ioMonths: 24,
      rateSteps: [{ month: 25, annualRatePct: 9 }],
    });
    for (const row of s.rows) {
      for (const v of [row.openingBalance, row.payment, row.interest, row.principal, row.closingBalance]) {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });
});

describe('reading a schedule', () => {
  const s = buildAmortizationSchedule({ principal: P, annualRatePct: RATE, termMonths: TERM });

  it('balanceAtMonth returns full principal at or before month 0', () => {
    expect(balanceAtMonth(s, 0)).toBe(P);
    expect(balanceAtMonth(s, -5)).toBe(P);
    expect(balanceAtMonth(s, Number.NaN)).toBe(P);
  });

  it('balanceAtMonth clamps past the term instead of reading off the end', () => {
    expect(balanceAtMonth(s, 5000)).toBe(0);
    expect(balanceAtMonth(s, TERM)).toBe(0);
  });

  it('paymentAtMonth returns 0 outside the term rather than undefined', () => {
    expect(paymentAtMonth(s, 0)).toBe(0);
    expect(paymentAtMonth(s, TERM + 1)).toBe(0);
    expect(paymentAtMonth(s, 1)).toBeCloseTo(calculatePI(P, RATE, TERM), 6);
  });

  it('cumulativePayments sums a half-open range and clamps both ends', () => {
    const pi = calculatePI(P, RATE, TERM);
    expect(cumulativePayments(s, 0, 12)).toBeCloseTo(pi * 12, 4);
    expect(cumulativePayments(s, 12, 24)).toBeCloseTo(pi * 12, 4);
    // Half-open: (0,12] and (12,24] partition (0,24] with no double count.
    expect(cumulativePayments(s, 0, 12) + cumulativePayments(s, 12, 24)).toBeCloseTo(cumulativePayments(s, 0, 24), 4);
    expect(cumulativePayments(s, 0, 9999)).toBeCloseTo(s.totalPaid, 4);
    expect(cumulativePayments(s, -50, 12)).toBeCloseTo(pi * 12, 4);
    expect(cumulativePayments(s, 24, 12)).toBe(0);
  });
});

describe('payoffQuote', () => {
  const s = buildAmortizationSchedule({ principal: P, annualRatePct: RATE, termMonths: TERM });

  it('quotes the scheduled balance plus penalty plus fees', () => {
    const q = payoffQuote({ schedule: s, month: 36, prepaymentPenaltyPct: 3, payoffFees: 450 });
    const balance = balanceAtMonth(s, 36);

    expect(q.principalBalance).toBeCloseTo(balance, 6);
    expect(q.prepaymentPenalty).toBeCloseTo(balance * 0.03, 6);
    expect(q.payoffFees).toBe(450);
    expect(q.totalPayoff).toBeCloseTo(balance * 1.03 + 450, 6);
    expect(q.clamped).toBe(false);
  });

  it('reconciles payments to date against interest and principal to date', () => {
    const q = payoffQuote({ schedule: s, month: 36 });
    expect(q.paymentsMadeToDate).toBeCloseTo(q.interestPaidToDate + q.principalPaidToDate, 6);
    expect(q.principalPaidToDate).toBeCloseTo(P - q.principalBalance, 6);
  });

  it('quotes full principal and no payments at month 0', () => {
    const q = payoffQuote({ schedule: s, month: 0 });
    expect(q.principalBalance).toBe(P);
    expect(q.paymentsMadeToDate).toBe(0);
    expect(q.interestPaidToDate).toBe(0);
  });

  it('clamps past the term and says so', () => {
    const q = payoffQuote({ schedule: s, month: 9999 });
    expect(q.clamped).toBe(true);
    expect(q.month).toBe(TERM);
    expect(q.principalBalance).toBe(0);
    expect(q.totalPayoff).toBe(0);
  });

  it('treats a negative penalty or fee as zero, never as a credit', () => {
    const q = payoffQuote({ schedule: s, month: 12, prepaymentPenaltyPct: -5, payoffFees: -1000 });
    expect(q.prepaymentPenalty).toBe(0);
    expect(q.payoffFees).toBe(0);
    expect(q.totalPayoff).toBeCloseTo(q.principalBalance, 6);
  });

  it('charges the penalty on the REMAINING balance, not the original principal', () => {
    // A declining 5-4-3-2-1 quoted off the original note would overcharge every
    // year of seasoning.
    const early = payoffQuote({ schedule: s, month: 12, prepaymentPenaltyPct: 5 });
    const late = payoffQuote({ schedule: s, month: 240, prepaymentPenaltyPct: 5 });
    expect(late.prepaymentPenalty).toBeLessThan(early.prepaymentPenalty);
    expect(early.prepaymentPenalty).toBeLessThan(P * 0.05);
  });
});

describe('summarizeByYear', () => {
  const s = buildAmortizationSchedule({
    principal: P, annualRatePct: RATE, termMonths: TERM, ioMonths: 24,
    rateSteps: [{ month: 61, annualRatePct: 9 }],
  });
  const years = summarizeByYear(s);

  it('rolls the full term into whole loan years', () => {
    expect(years).toHaveLength(30);
    expect(years.every((y) => y.months === 12)).toBe(true);
  });

  it('reconciles to the schedule it summarizes', () => {
    const sum = (pick: (y: (typeof years)[number]) => number) => years.reduce((a, y) => a + pick(y), 0);
    expect(sum((y) => y.payments)).toBeCloseTo(s.totalPaid, 4);
    expect(sum((y) => y.interest)).toBeCloseTo(s.totalInterest, 4);
    expect(sum((y) => y.principal)).toBeCloseTo(s.totalPrincipal, 4);
    expect(years[0].openingBalance).toBe(P);
    expect(years[29].closingBalance).toBe(0);
  });

  it('chains year boundaries without a gap', () => {
    for (let i = 1; i < years.length; i++) {
      expect(years[i].openingBalance).toBeCloseTo(years[i - 1].closingBalance, 6);
    }
  });

  it('flags the IO years and the years the payment moved', () => {
    expect(years[0].hasIo).toBe(true);
    expect(years[1].hasIo).toBe(true);
    expect(years[2].hasIo).toBe(false);
    // Year 3 holds the IO recast (month 25), year 6 holds the reset (month 61).
    expect(years[2].hasPaymentChange).toBe(true);
    expect(years[5].hasPaymentChange).toBe(true);
    expect(years[10].hasPaymentChange).toBe(false);
    // Origination is not a "change" a year should advertise.
    expect(years[0].hasPaymentChange).toBe(false);
  });

  it('carries the rate in force at each end of the year', () => {
    expect(years[5].startRatePct).toBe(9);
    expect(years[4].endRatePct).toBe(RATE);
  });

  it('reports a short final year when the term is not a whole number of years', () => {
    const odd = buildAmortizationSchedule({ principal: 100_000, annualRatePct: 6, termMonths: 30 });
    const y = summarizeByYear(odd);
    expect(y).toHaveLength(3);
    expect(y.map((r) => r.months)).toEqual([12, 12, 6]);
  });
});

describe('computeRefiBreakEven', () => {
  const current = buildAmortizationSchedule({ principal: P, annualRatePct: 8.5, termMonths: TERM });
  const proposed = buildAmortizationSchedule({ principal: P, annualRatePct: 6.0, termMonths: TERM });

  it('prices total cost as payments made PLUS the balance still owed', () => {
    // The naive "closing costs / payment saving" ignores that a fresh 30-year
    // term restarts amortization, so the cheaper payment buys less principal.
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 0, netCashAtClose: -8_000,
    });
    const five = r.holdPeriods.find((h) => h.holdMonths === 60)!;
    expect(five.stayTotalCost).toBeCloseTo(five.stayTotalPayments + five.stayPayoffAtEnd, 4);
    expect(five.refiTotalCost).toBeCloseTo(five.refiTotalPayments + five.refiPayoffAtEnd + 8_000, 4);
    expect(five.netAdvantage).toBeCloseTo(five.stayTotalCost - five.refiTotalCost, 6);
  });

  it('finds a break-even month for a 250bp drop and reports the payment delta', () => {
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 0, netCashAtClose: -8_000,
    });
    expect(r.neverRecovers).toBe(false);
    expect(r.breakEvenMonth).not.toBeNull();
    expect(r.breakEvenMonth!).toBeGreaterThan(0);
    expect(r.monthlyPaymentDelta).toBeCloseTo(
      calculatePI(P, 8.5, TERM) - calculatePI(P, 6.0, TERM), 6,
    );
    expect(r.netAdvantageAtHorizon).toBeGreaterThan(0);
  });

  it('says so when the refinance never recovers', () => {
    // Refinancing INTO a higher rate, paying costs to do it.
    const worse = buildAmortizationSchedule({ principal: P, annualRatePct: 10.5, termMonths: TERM });
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: worse,
      refinanceAtMonth: 0, netCashAtClose: -12_000,
    });
    expect(r.breakEvenMonth).toBeNull();
    expect(r.neverRecovers).toBe(true);
    expect(r.netAdvantageAtHorizon).toBeLessThan(0);
    expect(r.holdPeriods.every((h) => !h.advantaged)).toBe(true);
  });

  it('the break-even month is the FIRST advantaged month, not a sampled one', () => {
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 0, netCashAtClose: -8_000,
    });
    const b = r.breakEvenMonth!;
    const at = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 0, netCashAtClose: -8_000, holdPeriodsMonths: [b - 1, b],
    });
    expect(at.holdPeriods.find((h) => h.holdMonths === b)!.advantaged).toBe(true);
    expect(at.holdPeriods.find((h) => h.holdMonths === b - 1)!.advantaged).toBe(false);
  });

  it('shortens the horizon when the refinance happens mid-term', () => {
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 120, netCashAtClose: 0,
    });
    expect(r.horizonMonths).toBe(TERM - 120);
    expect(r.holdPeriods.every((h) => h.holdMonths <= r.horizonMonths)).toBe(true);
  });

  it('measures the payment delta from the refinance month, not from origination', () => {
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 120, netCashAtClose: 0,
    });
    expect(r.monthlyPaymentDelta).toBeCloseTo(paymentAtMonth(current, 121) - paymentAtMonth(proposed, 1), 6);
  });

  it('counts cash taken at close as a benefit of refinancing', () => {
    const costsOnly = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 0, netCashAtClose: -8_000,
    });
    const cashOut = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 0, netCashAtClose: 25_000,
    });
    expect(cashOut.netAdvantageAtHorizon).toBeCloseTo(costsOnly.netAdvantageAtHorizon + 33_000, 4);
  });

  it('de-duplicates hold periods that clamp onto the same month', () => {
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 0, netCashAtClose: 0, holdPeriodsMonths: [12, 12, 9999, 9999],
    });
    expect(r.holdPeriods.map((h) => h.holdMonths)).toEqual([12, TERM]);
  });

  it('defaults to 1-10 year holds', () => {
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 0, netCashAtClose: 0,
    });
    expect(r.holdPeriods.map((h) => h.holdMonths)).toEqual([...DEFAULT_HOLD_PERIODS_MONTHS]);
  });

  it('returns a zero horizon rather than negative months past the term', () => {
    const r = computeRefiBreakEven({
      currentSchedule: current, proposedSchedule: proposed,
      refinanceAtMonth: 9999, netCashAtClose: 0,
    });
    expect(r.horizonMonths).toBe(0);
    expect(r.netAdvantageAtHorizon).toBe(0);
    expect(r.breakEvenMonth).toBeNull();
  });
});

describe('addMonthsToIsoDate', () => {
  it('adds whole months', () => {
    expect(addMonthsToIsoDate('2026-01-15', 1)).toBe('2026-02-15');
    expect(addMonthsToIsoDate('2026-01-15', 12)).toBe('2027-01-15');
    expect(addMonthsToIsoDate('2026-11-01', 2)).toBe('2027-01-01');
  });

  it('clamps the day instead of rolling into the next month', () => {
    // Jan 31 + 1 month is Feb 28, not Mar 3 — a reset date that slid a month
    // would misdate every downstream payment change.
    expect(addMonthsToIsoDate('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsToIsoDate('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonthsToIsoDate('2026-03-31', 1)).toBe('2026-04-30');
  });

  it('goes backwards across a year boundary', () => {
    expect(addMonthsToIsoDate('2026-01-15', -1)).toBe('2025-12-15');
    expect(addMonthsToIsoDate('2026-01-15', -13)).toBe('2024-12-15');
  });

  it('accepts a bare year-month and defaults to the first', () => {
    expect(addMonthsToIsoDate('2026-06', 1)).toBe('2026-07-01');
  });

  it('returns null for anything it cannot parse, so callers can degrade', () => {
    expect(addMonthsToIsoDate(null, 1)).toBeNull();
    expect(addMonthsToIsoDate(undefined, 1)).toBeNull();
    expect(addMonthsToIsoDate('', 1)).toBeNull();
    expect(addMonthsToIsoDate('not a date', 1)).toBeNull();
    expect(addMonthsToIsoDate('2026-13-01', 1)).toBeNull();
  });

  it('reaches the same date whichever way it is added', () => {
    const once = addMonthsToIsoDate('2026-01-15', 24);
    const twice = addMonthsToIsoDate(addMonthsToIsoDate('2026-01-15', 12)!, 12);
    expect(once).toBe(twice);
  });
});

describe('the schedule is one primitive, shared', () => {
  it('a schedule read at a month equals the same schedule read through payoffQuote', () => {
    const s: AmortizationSchedule = buildAmortizationSchedule({
      principal: 325_000, annualRatePct: 7.25, termMonths: TERM, ioMonths: 36,
    });
    for (const m of [1, 36, 37, 120, 359]) {
      expect(payoffQuote({ schedule: s, month: m }).principalBalance).toBe(balanceAtMonth(s, m));
    }
  });

  it('cumulativePayments over the whole term equals totalPaid', () => {
    const s = buildAmortizationSchedule({ principal: 325_000, annualRatePct: 7.25, termMonths: 240 });
    expect(cumulativePayments(s, 0, 240)).toBeCloseTo(s.totalPaid, 4);
  });
});

// ---------------------------------------------------------------------------
// payoffQuote could only express a penalty as a percent of the balance, so the
// structures the product actually sells — SIX_MONTHS_INTEREST and
// SIX_MONTHS_80_PCT — had no representation. Those are months of INTEREST, so
// they scale with the rate and no single percentage covers them: $10.4K on a
// $300K balance at 7%, $14.9K at 10%.
//
// The amount is passed in rather than the PrepayType, because prepay structures
// are loan-product policy and this module is deliberately pure arithmetic.
// resolvePrepayPenalty in loanOptimizer.ts turns a structure into the number.
// ---------------------------------------------------------------------------
describe('payoffQuote — structures a percentage cannot express', () => {
  const s = buildAmortizationSchedule({ principal: P, annualRatePct: RATE, termMonths: TERM });

  it('takes an explicit penalty amount', () => {
    const balance = balanceAtMonth(s, 24);
    const sixMonthsInterest = balance * (RATE / 100 / 12) * 6;
    const q = payoffQuote({ schedule: s, month: 24, prepaymentPenaltyAmount: sixMonthsInterest, payoffFees: 350 });

    expect(q.prepaymentPenalty).toBeCloseTo(sixMonthsInterest, 6);
    expect(q.totalPayoff).toBeCloseTo(balance + sixMonthsInterest + 350, 6);
  });

  it('the amount wins over a percentage when both are given', () => {
    const q = payoffQuote({ schedule: s, month: 24, prepaymentPenaltyPct: 5, prepaymentPenaltyAmount: 1234.56 });
    expect(q.prepaymentPenalty).toBe(1234.56);
  });

  it('an explicit ZERO is honoured, not treated as absent', () => {
    // `?? ` on a numeric field would have let a real zero fall through to the
    // percentage — a waived penalty silently becoming a charged one.
    const q = payoffQuote({ schedule: s, month: 24, prepaymentPenaltyPct: 5, prepaymentPenaltyAmount: 0 });
    expect(q.prepaymentPenalty).toBe(0);
    expect(q.totalPayoff).toBeCloseTo(balanceAtMonth(s, 24), 6);
  });

  it('still uses the percentage when no amount is supplied', () => {
    const q = payoffQuote({ schedule: s, month: 24, prepaymentPenaltyPct: 3 });
    expect(q.prepaymentPenalty).toBeCloseTo(balanceAtMonth(s, 24) * 0.03, 6);
  });

  it('never credits a negative amount', () => {
    const q = payoffQuote({ schedule: s, month: 24, prepaymentPenaltyAmount: -50_000 });
    expect(q.prepaymentPenalty).toBe(0);
  });

  it('a months-of-interest penalty tracks the rate — the reason a percentage failed', () => {
    const cheap = buildAmortizationSchedule({ principal: P, annualRatePct: 7, termMonths: TERM });
    const dear = buildAmortizationSchedule({ principal: P, annualRatePct: 10, termMonths: TERM });
    const six = (sch: typeof cheap, rate: number) =>
      balanceAtMonth(sch, 24) * (rate / 100 / 12) * 6;

    const a = payoffQuote({ schedule: cheap, month: 24, prepaymentPenaltyAmount: six(cheap, 7) });
    const b = payoffQuote({ schedule: dear, month: 24, prepaymentPenaltyAmount: six(dear, 10) });
    expect(b.prepaymentPenalty).toBeGreaterThan(a.prepaymentPenalty * 1.3);
  });
});
