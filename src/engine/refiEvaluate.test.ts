import { describe, it, expect } from 'vitest';
import {
  evaluateRefinance,
  buildCurrentLoanSchedule,
  type CurrentLoanTerms,
  type ProposedLoanTerms,
  type RefiPropertySnapshot,
  type RefiPolicy,
} from './refiTracker';
import { balanceAtMonth } from './amortization';

// ===========================================================================
// evaluateRefinance — the kernel-backed evaluation.
//
// This is the function that satisfies the Refinance Tracker's three release
// gates: a complete current-loan amortization schedule, a real payoff
// (balance + prepayment penalty + payoff fees), and break-even measured
// across hold periods on total cost.
//
// It had ZERO tests and ZERO callers. The page shipped `analyzeRefi`, which
// scores readiness from a remembered balance and cannot answer the question
// that decides the deal: does the new loan raise enough to retire the old one?
// ===========================================================================

const CURRENT: CurrentLoanTerms = {
  originalAmount: 300_000,
  annualRatePct: 8.5,
  termMonths: 360,
  monthsElapsed: 24,
};

const PROPERTY: RefiPropertySnapshot = {
  value: 460_000,
  qualifyingRent: 3_400,
  monthlyEscrows: 520,
};

const PROPOSED: ProposedLoanTerms = {
  annualRatePct: 6.5,
  termMonths: 360,
  lenderFees: 1_800,
  thirdPartyFees: 2_400,
  prepaidsAndEscrows: 1_500,
};

function evalRefi(
  over: {
    current?: Partial<CurrentLoanTerms>;
    proposed?: Partial<ProposedLoanTerms>;
    property?: Partial<RefiPropertySnapshot>;
    policy?: RefiPolicy;
  } = {},
) {
  return evaluateRefinance({
    current: { ...CURRENT, ...over.current },
    proposed: { ...PROPOSED, ...over.proposed },
    property: { ...PROPERTY, ...over.property },
    policy: over.policy,
  });
}

describe('evaluateRefinance — the payoff comes from the schedule, not a remembered number', () => {
  it("takes the payoff balance from the current loan's own amortization", () => {
    const r = evalRefi();
    const sched = buildCurrentLoanSchedule(CURRENT);
    expect(r.payoff.principalBalance).toBeCloseTo(balanceAtMonth(sched, 24), 6);
    expect(r.currentSchedule.rows).toHaveLength(360);
  });

  it('adds the prepayment penalty and payoff fees to the amount that must be retired', () => {
    const plain = evalRefi();
    const withCosts = evalRefi({ current: { prepaymentPenaltyPct: 3, payoffFees: 495 } });
    const balance = withCosts.payoff.principalBalance;

    expect(withCosts.payoff.prepaymentPenalty).toBeCloseTo(balance * 0.03, 4);
    expect(withCosts.payoff.payoffFees).toBe(495);
    expect(withCosts.payoff.totalPayoff).toBeCloseTo(balance * 1.03 + 495, 4);
    expect(withCosts.payoff.totalPayoff).toBeGreaterThan(plain.payoff.totalPayoff);
  });

  it('charges the penalty on the seasoned balance, not the original note', () => {
    const early = evalRefi({ current: { monthsElapsed: 12, prepaymentPenaltyPct: 5 } });
    const late = evalRefi({ current: { monthsElapsed: 120, prepaymentPenaltyPct: 5 } });
    expect(late.payoff.prepaymentPenalty).toBeLessThan(early.payoff.prepaymentPenalty);
  });
});

describe('evaluateRefinance — sizing under BOTH caps', () => {
  it('sizes the loan to cover the payoff plus its own closing costs when none is requested', () => {
    const r = evalRefi();
    expect(r.sizing.requestedAmount).toBeNull();
    expect(r.sizing.requiredProceeds).toBeCloseTo(r.payoff.totalPayoff + r.closingCosts.total, 2);
  });

  it('solves the points fixed point rather than under-sizing the loan', () => {
    // Points are a percent of the NEW loan, so a loan that funds its own points
    // is L = (payoff + fixed) / (1 - pts), not payoff + fixed + pts*(payoff).
    const r = evalRefi({ proposed: { pointsPct: 2, requestedAmount: undefined } });
    const fixed = 1_800 + 2_400 + 1_500;
    expect(r.sizing.requiredProceeds).toBeCloseTo((r.payoff.totalPayoff + fixed) / 0.98, 2);
  });

  it('takes the LOWER of the LTV and DSCR ceilings and names which one binds', () => {
    const r = evalRefi();
    expect(r.sizing.maxNewLoan).toBeCloseTo(
      Math.min(r.sizing.maxLoanByLtv, r.sizing.maxLoanByDscr), 4,
    );
    expect(['LTV', 'DSCR', 'NONE']).toContain(r.sizing.bindingConstraint);
  });

  it('thin rent makes DSCR the binding constraint', () => {
    const r = evalRefi({ property: { qualifyingRent: 2_200 } });
    expect(r.sizing.maxLoanByDscr).toBeLessThan(r.sizing.maxLoanByLtv);
    expect(r.sizing.bindingConstraint).toBe('DSCR');
  });

  it('never funds above the ceiling, however much is requested', () => {
    const r = evalRefi({ proposed: { requestedAmount: 10_000_000 } });
    expect(r.sizing.fundedAmount).toBeCloseTo(r.sizing.maxNewLoan, 4);
    expect(r.sizing.ltvAtFunded).toBeLessThanOrEqual(75 + 1e-9);
  });
});

describe('evaluateRefinance — fails closed', () => {
  it('REFUSES when the proceeds cannot retire the existing lien', () => {
    const r = evalRefi({ property: { value: 200_000 } });
    expect(r.decision).toBe('REFUSED');
    expect(r.refusals.map((x) => x.code)).toContain('PROCEEDS_BELOW_PAYOFF');
    expect(r.refusals[0].shortfall).toBeGreaterThan(0);
    // A refused evaluation publishes NO recommendation at all.
    expect(r.proposedSchedule).toBeNull();
    expect(r.breakEven).toBeNull();
    expect(r.summary).toContain('not recommended');
  });

  it('REFUSES when the proceeds cover the payoff but not the closing costs', () => {
    const base = evalRefi();
    const r = evalRefi({ proposed: { requestedAmount: base.payoff.totalPayoff } });
    expect(r.decision).toBe('REFUSED');
    expect(r.refusals.map((x) => x.code)).toContain('PROCEEDS_BELOW_PAYOFF_PLUS_COSTS');
    expect(r.breakEven).toBeNull();
  });

  it('refuses a DSCR floor the rent cannot support, via the proceeds gate', () => {
    // Measured: raising the floor to 1.60 shrinks maxLoanByDscr BELOW the
    // payoff, so the deal is refused for not retiring the lien rather than for
    // coverage. Both are correct refusals; this pins which one actually fires.
    const r = evalRefi({ policy: { minDscr: 1.6 } });
    expect(r.decision).toBe('REFUSED');
    expect(r.refusals.map((x) => x.code)).toContain('PROCEEDS_BELOW_PAYOFF');
    expect(r.breakEven).toBeNull();
  });

  it('sizing keeps DSCR at or above the floor, so DSCR_BELOW_FLOOR is a backstop', () => {
    // The loan is capped by maxLoanByDscr, so a funded deal cannot normally
    // breach the floor — verified across floors and terms, including terms that
    // are not a whole number of years (the sizing model rounds the term to
    // years; the schedule does not). DSCR_BELOW_FLOOR guards the case where
    // those two disagree. It should stay: an unreachable fail-closed check
    // costs nothing, and removing it would make the mismatch silent.
    for (const minDscr of [1.0, 1.15, 1.25]) {
      for (const termMonths of [360, 354, 342, 240]) {
        const r = evalRefi({ proposed: { termMonths, requestedAmount: 320_000 }, policy: { minDscr } });
        if (r.refusals.length === 0) {
          expect(r.proposedDscr).toBeGreaterThanOrEqual(minDscr - 1e-9);
        }
      }
    }
  });

  it('REFUSES on unusable inputs instead of publishing NaN metrics', () => {
    const r = evalRefi({ property: { value: 0 } });
    expect(r.refusals.map((x) => x.code)).toContain('INVALID_INPUTS');
    expect(r.decision).toBe('REFUSED');
  });

  it('names the binding limit in the refusal, so the reason is actionable', () => {
    const r = evalRefi({ property: { value: 200_000 } });
    expect(r.refusals[0].message).toMatch(/Value \(LTV\)|Rent \(DSCR\)/);
  });
});

describe('evaluateRefinance — cash at close is ONE number', () => {
  it('nets cash the same way whether or not the costs are rolled in', () => {
    // Financing the closing costs makes the LOAN bigger; it does not make the
    // costs disappear. Either way the borrower nets
    // funded - payoff - costs, which is what `netCashToBorrower` documents
    // itself as. Reporting a larger figure when the borrower writes a cheque at
    // the table overstates the cash they walk away with by exactly that cheque.
    const financed = evalRefi({ proposed: { requestedAmount: 320_000, financeClosingCosts: true } });
    const atTable = evalRefi({ proposed: { requestedAmount: 320_000, financeClosingCosts: false } });

    expect(financed.sizing.netCashToBorrower).toBeCloseTo(
      financed.sizing.fundedAmount - financed.payoff.totalPayoff - financed.closingCosts.total, 4,
    );
    expect(atTable.sizing.netCashToBorrower).toBeCloseTo(
      atTable.sizing.fundedAmount - atTable.payoff.totalPayoff - atTable.closingCosts.total, 4,
    );
    expect(atTable.sizing.netCashToBorrower).toBeCloseTo(financed.sizing.netCashToBorrower, 4);
  });

  it('the break-even uses the same cash figure the sizing reports', () => {
    // Two different answers to "how much cash changed hands at close" would put
    // the headline number and the break-even month on different deals.
    for (const financeClosingCosts of [true, false]) {
      const r = evalRefi({ proposed: { requestedAmount: 320_000, financeClosingCosts } });
      const hold = r.breakEven!.holdPeriods[0];
      expect(hold.refiTotalCost).toBeCloseTo(
        hold.refiTotalPayments + hold.refiPayoffAtEnd - r.sizing.netCashToBorrower, 3,
      );
    }
  });
});

describe('evaluateRefinance — break-even and decision', () => {
  it('measures break-even on total cost across hold periods', () => {
    const r = evalRefi({ proposed: { requestedAmount: 320_000 } });
    expect(r.breakEven).not.toBeNull();
    expect(r.breakEven!.holdPeriods.length).toBeGreaterThan(0);
    for (const h of r.breakEven!.holdPeriods) {
      expect(h.stayTotalCost).toBeCloseTo(h.stayTotalPayments + h.stayPayoffAtEnd, 3);
    }
  });

  it('a 200bp drop lowers the payment and lifts coverage', () => {
    const r = evalRefi({ proposed: { requestedAmount: 320_000 } });
    expect(r.proposedPayment).toBeLessThan(r.currentPayment);
    expect(r.monthlyPaymentDelta).toBeCloseTo(r.currentPayment - r.proposedPayment, 6);
    expect(r.proposedDscr).toBeGreaterThan(r.currentDscr);
  });

  it('is CONDITIONAL, not PROCEED, before seasoning is met', () => {
    const r = evalRefi({ current: { monthsElapsed: 3 }, proposed: { requestedAmount: 320_000 } });
    expect(r.seasoningMet).toBe(false);
    expect(r.seasoningMonthsRemaining).toBeGreaterThan(0);
    expect(r.decision).toBe('CONDITIONAL');
    expect(r.summary).toContain('Seasoning');
  });

  it('is CONDITIONAL when the refinance never recovers its cost', () => {
    // Same rate as the existing note, plus $5,700 of costs and a fresh 30-year
    // term that restarts amortization. Nothing to recover, and the tool says so
    // instead of recommending it on a lower payment.
    const r = evalRefi({ proposed: { annualRatePct: 8.5, requestedAmount: 305_000 } });
    expect(r.refusals).toHaveLength(0);
    expect(r.breakEven!.neverRecovers).toBe(true);
    expect(r.breakEven!.breakEvenMonth).toBeNull();
    expect(r.decision).toBe('CONDITIONAL');
    expect(r.summary).toContain('never favours the refinance');
  });

  it('PROCEEDs only when seasoned, funded and recovering', () => {
    const r = evalRefi({ proposed: { requestedAmount: 320_000 } });
    expect(r.refusals).toHaveLength(0);
    expect(r.seasoningMet).toBe(true);
    expect(r.breakEven!.neverRecovers).toBe(false);
    expect(r.decision).toBe('PROCEED');
  });

  it('the summary states payoff, funding, cash and break-even', () => {
    const r = evalRefi({ proposed: { requestedAmount: 320_000 } });
    expect(r.summary).toContain('Payoff at month 24');
    expect(r.summary).toMatch(/Net cash to the borrower|Cash to close/);
    expect(r.summary).toMatch(/cheaper on total cost from month \d+|never favours/);
  });
});
