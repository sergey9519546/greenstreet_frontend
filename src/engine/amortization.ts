// ============================================================
// Greenstreet DSCR Engine — SHARED AMORTIZATION SCHEDULE
// ============================================================
//
// The one month-by-month debt schedule for the whole product.
//
// Before this module existed, every tool that needed a balance guessed at one:
// the Refi Tracker took a scalar `balance` it could not verify, and the ARM
// Reset Review had no schedule at all — it re-amortised a closed-form balance
// at each reset and never modelled the interest-only period, which is exactly
// where ARM payment shock lands.
//
// One schedule, used by both, and by anything built next:
//
//   • opening balance / interest / principal / payment / closing balance
//   • an interest-only front end and the IO -> amortizing recast
//   • rate steps (an ARM reset ladder is just a list of rate steps)
//   • an exact final month — the closing balance is 0, and
//     sum(interest) + sum(principal) === sum(payments), by construction
//
// Pure arithmetic. No lender data, no pricing, no policy. The one primitive it
// borrows is `calculatePI` from ./engine, so a payment computed here is the same
// payment the DSCR engine computes everywhere else.

import { calculatePI } from './engine';

// ── Types ────────────────────────────────────────────────────────────────────

/** Which half of the loan's life a month sits in. */
export type AmortPhase = 'IO' | 'AMORTIZING';

/** Why the scheduled payment changed at a given month. */
export type PaymentChangeReason =
  | 'ORIGINATION'
  | 'IO_EXPIRY'
  | 'RATE_RESET'
  | 'IO_EXPIRY_AND_RATE_RESET';

/** A note rate that becomes effective at the START of `month` (1-based). */
export interface RateStep {
  month: number;
  annualRatePct: number;
  /** Free-text provenance, e.g. "Reset 3 · periodic cap". */
  label?: string;
}

export interface AmortizationInput {
  principal: number;
  /** Note rate in PERCENT (6.5 = 6.5%), matching the rest of the engine. */
  annualRatePct: number;
  /** Total term in months, INCLUDING any interest-only months. */
  termMonths: number;
  /** Interest-only months at the front of the term. Default 0. */
  ioMonths?: number;
  /** Rate changes. Steps at month < 2 or > termMonths are ignored. */
  rateSteps?: RateStep[];
}

export interface AmortizationRow {
  /** 1-based month of the loan. */
  month: number;
  /** 1-based loan year, `ceil(month / 12)`. */
  year: number;
  phase: AmortPhase;
  /** Note rate in effect for this month, in percent. */
  annualRatePct: number;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  closingBalance: number;
  /** True when the scheduled payment differs from the prior month. */
  paymentChanged: boolean;
  changeReason: PaymentChangeReason | null;
}

export interface PaymentChange {
  month: number;
  year: number;
  fromPayment: number;
  toPayment: number;
  /** (to - from) / from, as a percent. 0 when `from` is 0. */
  changePct: number;
  annualRatePct: number;
  reason: PaymentChangeReason;
}

export interface AmortizationSchedule {
  rows: AmortizationRow[];
  principal: number;
  termMonths: number;
  ioMonths: number;
  initialRatePct: number;
  /** Sum of every scheduled payment over the full term. */
  totalPaid: number;
  totalInterest: number;
  totalPrincipal: number;
  /** Closing balance of the last row. 0 for any fully-amortizing schedule. */
  finalBalance: number;
  /** Every month the payment moved, origination included. */
  paymentChanges: PaymentChange[];
  maxPayment: number;
  minPayment: number;
}

/** One year of the schedule, rolled up for display. */
export interface AmortYearRow {
  year: number;
  months: number;
  payments: number;
  interest: number;
  principal: number;
  openingBalance: number;
  closingBalance: number;
  startRatePct: number;
  endRatePct: number;
  /** True when any month in the year was interest-only. */
  hasIo: boolean;
  /** True when the payment changed at any point during the year. */
  hasPaymentChange: boolean;
}

export interface PayoffQuoteInput {
  schedule: AmortizationSchedule;
  /** Payoff month, 1-based. 0 = payoff at origination (full principal). */
  month: number;
  /** Prepayment penalty as a percent of the principal balance. */
  prepaymentPenaltyPct?: number;
  /** Demand / recording / statement fees charged by the payoff lender. */
  payoffFees?: number;
}

export interface PayoffQuote {
  month: number;
  /** Scheduled principal balance after `month` payments. */
  principalBalance: number;
  prepaymentPenalty: number;
  payoffFees: number;
  /** balance + penalty + fees — what it costs to retire the loan. */
  totalPayoff: number;
  interestPaidToDate: number;
  principalPaidToDate: number;
  paymentsMadeToDate: number;
  /** True when `month` exceeded the schedule and the quote was clamped. */
  clamped: boolean;
}

// ── Construction ─────────────────────────────────────────────────────────────

const EPS = 1e-9;
/** Payment moves below this (half a cent) are float noise, not a recast. */
const PAYMENT_CHANGE_EPS = 0.005;

function monthlyRate(annualRatePct: number): number {
  return annualRatePct / 100 / 12;
}

/**
 * Build the full month-by-month schedule.
 *
 * Recast points — the payment is recomputed to fully amortize the CURRENT
 * balance over the REMAINING term whenever:
 *   • the loan originates,
 *   • the interest-only period expires, or
 *   • a rate step becomes effective (an ARM reset).
 *
 * This is what a real note does, and it is why a schedule is not optional for
 * an ARM: the payment after a reset depends on the balance the IO period left
 * behind, which no closed-form balance formula knows.
 *
 * The final month is forced to retire the balance exactly, so `finalBalance`
 * is 0 and interest + principal reconciles to total payments to the cent.
 */
export function buildAmortizationSchedule(input: AmortizationInput): AmortizationSchedule {
  const principal = Number(input.principal);
  const termMonths = Math.round(Number(input.termMonths));
  const baseRate = Number(input.annualRatePct);

  if (!Number.isFinite(principal) || principal <= 0) {
    throw new Error('buildAmortizationSchedule: principal must be a positive, finite number.');
  }
  if (!Number.isFinite(termMonths) || termMonths < 1) {
    throw new Error('buildAmortizationSchedule: termMonths must be at least 1.');
  }
  if (!Number.isFinite(baseRate) || baseRate < 0) {
    throw new Error('buildAmortizationSchedule: annualRatePct must be a non-negative, finite number.');
  }

  const ioMonths = Math.min(Math.max(Math.round(Number(input.ioMonths ?? 0)) || 0, 0), termMonths);

  // Collapse rate steps to one per month, in ascending month order. A step at
  // month 1 is the origination rate, not a reset, so it is folded into the base.
  const stepByMonth = new Map<number, RateStep>();
  let originationRate = baseRate;
  for (const raw of input.rateSteps ?? []) {
    const month = Math.round(Number(raw?.month));
    const rate = Number(raw?.annualRatePct);
    if (!Number.isFinite(month) || !Number.isFinite(rate) || rate < 0) continue;
    if (month <= 1) { originationRate = rate; continue; }
    if (month > termMonths) continue;
    stepByMonth.set(month, { month, annualRatePct: rate, label: raw.label });
  }

  const rows: AmortizationRow[] = [];
  const paymentChanges: PaymentChange[] = [];

  let balance = principal;
  let rate = originationRate;
  let scheduledPayment = 0;
  let previousPayment = 0;

  for (let m = 1; m <= termMonths; m++) {
    const step = stepByMonth.get(m);
    const rateReset = step !== undefined;
    if (step) rate = step.annualRatePct;

    const phase: AmortPhase = m <= ioMonths ? 'IO' : 'AMORTIZING';
    const ioExpiry = ioMonths > 0 && m === ioMonths + 1;
    const r = monthlyRate(rate);
    const remainingMonths = termMonths - m + 1;

    const mustRecast = m === 1 || rateReset || ioExpiry;
    if (phase === 'IO') {
      // Interest-only: the payment IS the interest, so it tracks the rate.
      if (mustRecast || scheduledPayment === 0) scheduledPayment = balance * r;
    } else if (mustRecast) {
      scheduledPayment =
        r === 0 ? balance / remainingMonths : calculatePI(balance, rate, remainingMonths);
    }

    const interest = balance * r;
    let payment = scheduledPayment;
    let principalPaid = phase === 'IO' ? 0 : payment - interest;

    if (phase === 'IO') {
      payment = interest;
    }

    // Retire the loan exactly on the last month (and defend against a rounding
    // overshoot in the month before it).
    if (m === termMonths || principalPaid > balance - EPS) {
      principalPaid = balance;
      payment = principalPaid + interest;
    } else if (principalPaid < 0) {
      // Negative amortization is not a product we write; hold the balance flat.
      principalPaid = 0;
      payment = interest;
    }

    const closingBalance = balance - principalPaid;

    const changed = m === 1 || Math.abs(payment - previousPayment) > PAYMENT_CHANGE_EPS;
    let reason: PaymentChangeReason | null = null;
    if (changed) {
      reason =
        m === 1
          ? 'ORIGINATION'
          : ioExpiry && rateReset
            ? 'IO_EXPIRY_AND_RATE_RESET'
            : ioExpiry
              ? 'IO_EXPIRY'
              : rateReset
                ? 'RATE_RESET'
                : 'RATE_RESET';
      paymentChanges.push({
        month: m,
        year: Math.ceil(m / 12),
        fromPayment: previousPayment,
        toPayment: payment,
        changePct: previousPayment > 0 ? ((payment - previousPayment) / previousPayment) * 100 : 0,
        annualRatePct: rate,
        reason,
      });
    }

    rows.push({
      month: m,
      year: Math.ceil(m / 12),
      phase,
      annualRatePct: rate,
      openingBalance: balance,
      payment,
      interest,
      principal: principalPaid,
      closingBalance,
      paymentChanged: changed,
      changeReason: reason,
    });

    balance = closingBalance;
    previousPayment = payment;
  }

  let totalPaid = 0;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let maxPayment = 0;
  let minPayment = Number.POSITIVE_INFINITY;
  for (const row of rows) {
    totalPaid += row.payment;
    totalInterest += row.interest;
    totalPrincipal += row.principal;
    if (row.payment > maxPayment) maxPayment = row.payment;
    if (row.payment < minPayment) minPayment = row.payment;
  }

  return {
    rows,
    principal,
    termMonths,
    ioMonths,
    initialRatePct: originationRate,
    totalPaid,
    totalInterest,
    totalPrincipal,
    finalBalance: rows[rows.length - 1].closingBalance,
    paymentChanges,
    maxPayment,
    minPayment: Number.isFinite(minPayment) ? minPayment : 0,
  };
}

// ── Reading a schedule ───────────────────────────────────────────────────────

/** Scheduled principal balance after `month` payments. Month 0 = full principal. */
export function balanceAtMonth(schedule: AmortizationSchedule, month: number): number {
  if (!Number.isFinite(month) || month <= 0) return schedule.principal;
  const idx = Math.min(Math.round(month), schedule.rows.length) - 1;
  return schedule.rows[idx].closingBalance;
}

/** The scheduled payment due in `month`. Months past the term return 0. */
export function paymentAtMonth(schedule: AmortizationSchedule, month: number): number {
  const m = Math.round(month);
  if (!Number.isFinite(m) || m < 1 || m > schedule.rows.length) return 0;
  return schedule.rows[m - 1].payment;
}

/** Sum of scheduled payments over months (from, to], clamped to the term. */
export function cumulativePayments(
  schedule: AmortizationSchedule,
  fromMonthExclusive: number,
  toMonthInclusive: number,
): number {
  const start = Math.max(0, Math.round(fromMonthExclusive));
  const end = Math.min(schedule.rows.length, Math.round(toMonthInclusive));
  let total = 0;
  for (let m = start + 1; m <= end; m++) total += schedule.rows[m - 1].payment;
  return total;
}

/**
 * What it costs to retire the loan at `month` — the scheduled balance plus any
 * prepayment penalty and payoff fees. This is the number a refinance has to
 * cover, and the reason a refinance decision needs a schedule rather than a
 * remembered balance.
 */
export function payoffQuote(input: PayoffQuoteInput): PayoffQuote {
  const { schedule } = input;
  const requested = Math.round(Number(input.month));
  const safeMonth = Number.isFinite(requested) ? Math.max(0, requested) : 0;
  const month = Math.min(safeMonth, schedule.rows.length);
  const clamped = safeMonth > schedule.rows.length;

  const principalBalance = balanceAtMonth(schedule, month);
  const penaltyPct = Math.max(0, Number(input.prepaymentPenaltyPct ?? 0) || 0);
  const fees = Math.max(0, Number(input.payoffFees ?? 0) || 0);
  const prepaymentPenalty = principalBalance * (penaltyPct / 100);

  let interestPaidToDate = 0;
  let principalPaidToDate = 0;
  let paymentsMadeToDate = 0;
  for (let m = 1; m <= month; m++) {
    const row = schedule.rows[m - 1];
    interestPaidToDate += row.interest;
    principalPaidToDate += row.principal;
    paymentsMadeToDate += row.payment;
  }

  return {
    month,
    principalBalance,
    prepaymentPenalty,
    payoffFees: fees,
    totalPayoff: principalBalance + prepaymentPenalty + fees,
    interestPaidToDate,
    principalPaidToDate,
    paymentsMadeToDate,
    clamped,
  };
}

/** Roll the schedule up by loan year — the compact view a page can actually show. */
export function summarizeByYear(schedule: AmortizationSchedule): AmortYearRow[] {
  const years: AmortYearRow[] = [];
  let current: AmortYearRow | null = null;

  for (const row of schedule.rows) {
    if (!current || current.year !== row.year) {
      current = {
        year: row.year,
        months: 0,
        payments: 0,
        interest: 0,
        principal: 0,
        openingBalance: row.openingBalance,
        closingBalance: row.closingBalance,
        startRatePct: row.annualRatePct,
        endRatePct: row.annualRatePct,
        hasIo: false,
        hasPaymentChange: false,
      };
      years.push(current);
    }
    current.months += 1;
    current.payments += row.payment;
    current.interest += row.interest;
    current.principal += row.principal;
    current.closingBalance = row.closingBalance;
    current.endRatePct = row.annualRatePct;
    if (row.phase === 'IO') current.hasIo = true;
    if (row.paymentChanged && row.month > 1) current.hasPaymentChange = true;
  }

  return years;
}

// ── Refinance break-even, computed against both schedules ────────────────────

export interface RefiBreakEvenInput {
  /** The loan being retired. */
  currentSchedule: AmortizationSchedule;
  /** The loan replacing it. */
  proposedSchedule: AmortizationSchedule;
  /** Month of the CURRENT schedule at which the refinance closes. */
  refinanceAtMonth: number;
  /**
   * Cash the borrower nets at the closing table:
   *   newLoanAmount − payoff − closing costs.
   * Negative means the borrower brings cash.
   */
  netCashAtClose: number;
  /** Hold periods to report, in months. Defaults to 1–10 years. */
  holdPeriodsMonths?: number[];
}

export interface HoldPeriodOutcome {
  holdMonths: number;
  /** Payments made on the existing loan over the hold. */
  stayTotalPayments: number;
  /** Balance still owed on the existing loan at the end of the hold. */
  stayPayoffAtEnd: number;
  stayTotalCost: number;
  refiTotalPayments: number;
  refiPayoffAtEnd: number;
  /** Payments + ending balance − net cash taken at close. */
  refiTotalCost: number;
  /** stayTotalCost − refiTotalCost. Positive = refinancing wins over this hold. */
  netAdvantage: number;
  advantaged: boolean;
}

export interface RefiBreakEvenResult {
  holdPeriods: HoldPeriodOutcome[];
  /**
   * First month at which the refinance is cheaper than staying, measured on
   * total cost (payments + remaining balance), not on payment delta alone.
   * `null` when it never wins inside the horizon.
   */
  breakEvenMonth: number | null;
  horizonMonths: number;
  /** First-month payment difference, existing − proposed. */
  monthlyPaymentDelta: number;
  neverRecovers: boolean;
  /** Advantage at the longest horizon evaluated. */
  netAdvantageAtHorizon: number;
}

export const DEFAULT_HOLD_PERIODS_MONTHS: readonly number[] = [12, 24, 36, 48, 60, 84, 120];

/**
 * Break-even measured against both schedules, across a range of hold periods.
 *
 * The naive version of this number — closing costs ÷ monthly payment saving —
 * is wrong in two directions at once. It ignores that a fresh 30-year term
 * restarts amortization (the new loan's cheaper payment buys less principal),
 * and it ignores any cash taken at close. Comparing total cost over a hold —
 * payments made PLUS the balance still owed at the end — prices both.
 */
export function computeRefiBreakEven(input: RefiBreakEvenInput): RefiBreakEvenResult {
  const { currentSchedule, proposedSchedule, netCashAtClose } = input;
  const refiAt = Math.max(0, Math.round(input.refinanceAtMonth) || 0);

  const horizonMonths = Math.max(
    0,
    Math.min(currentSchedule.termMonths - refiAt, proposedSchedule.termMonths),
  );

  const outcomeAt = (holdMonths: number): HoldPeriodOutcome => {
    const h = Math.max(0, Math.min(Math.round(holdMonths), horizonMonths));
    const stayTotalPayments = cumulativePayments(currentSchedule, refiAt, refiAt + h);
    const stayPayoffAtEnd = balanceAtMonth(currentSchedule, refiAt + h);
    const stayTotalCost = stayTotalPayments + stayPayoffAtEnd;

    const refiTotalPayments = cumulativePayments(proposedSchedule, 0, h);
    const refiPayoffAtEnd = balanceAtMonth(proposedSchedule, h);
    const refiTotalCost = refiTotalPayments + refiPayoffAtEnd - netCashAtClose;

    const netAdvantage = stayTotalCost - refiTotalCost;
    return {
      holdMonths: h,
      stayTotalPayments,
      stayPayoffAtEnd,
      stayTotalCost,
      refiTotalPayments,
      refiPayoffAtEnd,
      refiTotalCost,
      netAdvantage,
      advantaged: netAdvantage > 0,
    };
  };

  // Scan every month so the break-even is exact, not the nearest sampled hold.
  let breakEvenMonth: number | null = null;
  for (let m = 1; m <= horizonMonths; m++) {
    if (outcomeAt(m).netAdvantage > 0) {
      breakEvenMonth = m;
      break;
    }
  }

  const requested = input.holdPeriodsMonths ?? DEFAULT_HOLD_PERIODS_MONTHS;
  const seen = new Set<number>();
  const holdPeriods: HoldPeriodOutcome[] = [];
  for (const h of requested) {
    const clamped = Math.max(1, Math.min(Math.round(h), horizonMonths));
    if (seen.has(clamped)) continue;
    seen.add(clamped);
    holdPeriods.push(outcomeAt(clamped));
  }

  const monthlyPaymentDelta =
    paymentAtMonth(currentSchedule, refiAt + 1) - paymentAtMonth(proposedSchedule, 1);

  return {
    holdPeriods,
    breakEvenMonth,
    horizonMonths,
    monthlyPaymentDelta,
    neverRecovers: breakEvenMonth === null,
    netAdvantageAtHorizon: horizonMonths > 0 ? outcomeAt(horizonMonths).netAdvantage : 0,
  };
}

// ── Small date helper (reset dates, IO expiry dates) ─────────────────────────

/**
 * Add `months` to an ISO date. Returns `YYYY-MM-DD`, clamping the day so
 * "Jan 31 + 1 month" is Feb 28/29 rather than rolling into March.
 * Returns null for an unparseable input so callers can degrade to month numbers.
 */
export function addMonthsToIsoDate(isoDate: string | undefined | null, months: number): string | null {
  if (!isoDate) return null;
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(isoDate.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] ? Number(match[3]) : 1;
  if (!Number.isFinite(year) || month < 1 || month > 12) return null;

  const zeroBased = (year * 12 + (month - 1)) + Math.round(months);
  const newYear = Math.floor(zeroBased / 12);
  const newMonth = (zeroBased % 12 + 12) % 12;
  const daysInMonth = new Date(Date.UTC(newYear, newMonth + 1, 0)).getUTCDate();
  const newDay = Math.min(day, daysInMonth);

  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(newYear, 4)}-${pad(newMonth + 1)}-${pad(newDay)}`;
}
