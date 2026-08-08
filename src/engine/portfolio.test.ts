import { describe, it, expect } from 'vitest';
import { analyzePortfolio, computePortfolioHealthScore } from './portfolio';
import type { PortfolioPropertyInput } from './portfolio';
import type { BorrowerProfile } from './types';

// ── Independent amortization math (textbook closed-form, NOT imported from
// the engine) — used to derive expected numbers so the tests below check the
// engine's arithmetic against a second, independent source, not against
// itself. ──────────────────────────────────────────────────────────────────
function piIndependent(principal: number, ratePct: number, n: number): number {
  const r = ratePct / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
function balanceIndependent(principal: number, ratePct: number, n: number, m: number): number {
  const r = ratePct / 100 / 12;
  if (r === 0) return principal * (1 - m / n);
  const f = Math.pow(1 + r, n);
  const fm = Math.pow(1 + r, m);
  return (principal * (f - fm)) / (f - 1);
}
// BASE_TCO_RATES totals from tcoDscr.ts, reproduced independently:
const TCO_SFR = 0.08 + 0.08 + 0.05 + 0.07; // 0.28
const TCO_SMALL_MULTI = 0.07 + 0.07 + 0.05 + 0.08; // 0.27
const TCO_MED_MULTI = 0.06 + 0.06 + 0.04 + 0.09; // 0.25

function prop(over: Partial<PortfolioPropertyInput>): PortfolioPropertyInput {
  return {
    id: Math.random().toString(36).slice(2),
    name: 'P',
    address: '',
    monthlyRent: 3000,
    lender: 'Kiavi',
    isBlanket: false,
    originalLoanAmount: 300_000,
    annualRatePct: 7.5,
    termMonths: 360,
    monthsElapsed: 0,
    monthlyEscrows: 300,
    propertyValue: 400_000,
    ...over,
  };
}

// borrower is unused by analyzePortfolio's body; safe to stub.
const borrower = {} as BorrowerProfile;

const A_PI = piIndependent(300_000, 7.5, 360); // 2097.6435256583295
const A_PITIA = A_PI + 300; // 2397.6435256583295

describe('analyzePortfolio — loan-level schedules (gate 1)', () => {
  it('reads the balance off a real schedule, not a typed number — month 0 equals the original amount', () => {
    const r = analyzePortfolio([prop({ monthsElapsed: 0 })], null, borrower, 0);
    expect(r.properties[0].loanBalance).toBeCloseTo(300_000, 2);
  });

  it('reads the balance off the schedule at an elapsed month — matches independent closed-form amortization', () => {
    const expectedBalance = balanceIndependent(300_000, 7.5, 360, 12);
    const r = analyzePortfolio([prop({ monthsElapsed: 12 })], null, borrower, 0);
    expect(r.properties[0].loanBalance).toBeCloseTo(expectedBalance, 2);
    // Balance strictly decreased from the month-0 case — proof the number is
    // actually being read off a schedule and not just echoing an input.
    expect(r.properties[0].loanBalance).toBeLessThan(300_000);
  });

  it('computes monthlyPITIA as schedule P&I + escrows — one number sourced from one schedule', () => {
    const r = analyzePortfolio([prop({ monthsElapsed: 0, monthlyEscrows: 300 })], null, borrower, 0);
    expect(r.properties[0].monthlyPITIA).toBeCloseTo(A_PITIA, 2);
    expect(r.properties[0].dscr).toBeCloseTo(3000 / A_PITIA, 6);
  });

  it('fails closed: excludes a property with an invalid/missing loan term instead of defaulting it', () => {
    const r = analyzePortfolio(
      [prop({ id: 'bad-1', originalLoanAmount: Number.NaN }), prop({ id: 'good-1' })],
      null,
      borrower,
      0,
    );
    expect(r.properties).toHaveLength(1);
    expect(r.properties[0].id).toBe('good-1');
    expect(r.excludedProperties).toHaveLength(1);
    expect(r.excludedProperties[0].id).toBe('bad-1');
    expect(r.excludedProperties[0].reason).toMatch(/original loan amount/i);
  });

  it('fails closed: excludes a property whose months-owned exceeds its own term', () => {
    const r = analyzePortfolio(
      [prop({ id: 'over-term', termMonths: 60, monthsElapsed: 61 })],
      null,
      borrower,
      0,
    );
    expect(r.properties).toHaveLength(0);
    expect(r.excludedProperties[0].reason).toMatch(/exceeds the loan term/i);
  });

  it('does not let an excluded property leak into the totals as a zero', () => {
    const withBad = analyzePortfolio(
      [prop({ id: 'bad', propertyValue: -1 }), prop({ id: 'ok' })],
      null,
      borrower,
      0,
    );
    const onlyGood = analyzePortfolio([prop({ id: 'ok' })], null, borrower, 0);
    // Totals must match the one valid property exactly — the excluded one
    // contributes nothing, rather than $0 PITIA dragging an average down.
    expect(withBad.totalPITIA).toBeCloseTo(onlyGood.totalPITIA, 6);
    expect(withBad.globalDSCR).toBeCloseTo(onlyGood.globalDSCR, 6);
  });
});

describe('analyzePortfolio — consistent NOI across properties (gate 2)', () => {
  it('sums totals and uses ΣNOI/ΣDS (never averages)', () => {
    const r = analyzePortfolio([prop({}), prop({})], null, borrower, 1_000_000);
    expect(r.totalPITIA).toBeCloseTo(A_PITIA * 2, 6);
    expect(r.totalRent).toBe(6000);
    expect(r.globalDSCR).toBeGreaterThan(0);
    expect(r.blanketLoanWarning).toBeNull();
  });

  it('applies EACH property\'s own TCO rate — never one hardcoded type for the whole book', () => {
    // Three properties, three different types, three different TCO haircuts
    // (0.28 / 0.27 / 0.25 from tcoDscr.ts), same loan so PITIA is identical —
    // isolates the NOI definition from everything else.
    const props = [
      prop({ id: 'sfr', monthlyRent: 3000, propertyType: 'SFR' }),
      prop({ id: 'multi', monthlyRent: 4000, propertyType: 'SMALL_MULTI' }),
      prop({ id: 'med', monthlyRent: 5000, propertyType: 'MED_MULTI' }),
    ];
    const r = analyzePortfolio(props, null, borrower, 0);

    const expectedMonthlyNOI =
      3000 * (1 - TCO_SFR) + 4000 * (1 - TCO_SMALL_MULTI) + 5000 * (1 - TCO_MED_MULTI);
    const expectedTotalNOI = expectedMonthlyNOI * 12;

    // A hardcoded 'SFR'-for-everyone regression would give
    // (3000+4000+5000) * (1-0.28) * 12 = 103,680 instead — a different,
    // detectably wrong number.
    expect(r.totalNOI).toBeCloseTo(expectedTotalNOI, 4);
    expect(r.totalNOI).not.toBeCloseTo(103_680, 0);
  });

  it('negative-cash-flow bleed uses the SAME per-property NOI as totalNOI — no second, disagreeing haircut', () => {
    const props = [
      prop({ id: 'sfr', monthlyRent: 3000, propertyType: 'SFR' }),       // track2 ≈ 0.90 → bleeds
      prop({ id: 'multi', monthlyRent: 4000, propertyType: 'SMALL_MULTI' }), // track2 ≈ 1.22 → does not bleed
      prop({ id: 'med', monthlyRent: 5000, propertyType: 'MED_MULTI' }),     // track2 ≈ 1.56 → does not bleed
    ];
    const r = analyzePortfolio(props, null, borrower, 0);

    const sfrMonthlyNOI = 3000 * (1 - TCO_SFR); // 2160
    const expectedBleed = Math.max(0, A_PITIA - sfrMonthlyNOI); // 237.64...

    expect(r.negativeCashFlowProperties.count).toBe(1);
    expect(r.negativeCashFlowProperties.propertyIds).toEqual(['sfr']);
    expect(r.negativeCashFlowProperties.totalMonthlyBleed).toBeCloseTo(expectedBleed, 4);

    // The legacy hardcoded-21% bleed formula this replaces would have given
    // max(0, PITIA - 3000*(1-0.21)) = 27.64..., a materially different
    // (and wrong) number for the exact same inputs.
    expect(r.negativeCashFlowProperties.totalMonthlyBleed).not.toBeCloseTo(27.64, 1);
  });

  it('fires a CRITICAL blanket-loan warning when any property is blanket', () => {
    const r = analyzePortfolio([prop({ isBlanket: true })], null, borrower, 0);
    expect(r.blanketLoanWarning).toMatch(/CRITICAL/);
  });
});

describe('analyzePortfolio — concentration recommendations (gate 3)', () => {
  it('flags lender concentration above 50% across ≥3 properties', () => {
    const props = [prop({ lender: 'Kiavi' }), prop({ lender: 'Kiavi' }), prop({ lender: 'Defy' })];
    const r = analyzePortfolio(props, null, borrower, 0);
    expect(r.lenderConcentration.topLender).toBe('Kiavi');
    expect(r.lenderConcentration.topLenderCount).toBe(2);
    expect(r.lenderConcentration.warning).toMatch(/Counterparty risk/);
  });

  it('does not warn on a diversified 2-lender, 2-property book', () => {
    const r = analyzePortfolio([prop({ lender: 'Kiavi' }), prop({ lender: 'Defy' })], null, borrower, 0);
    expect(r.lenderConcentration.warning).toBeNull();
  });

  it('does NOT warn at exactly 50% lender concentration (boundary is strictly > 50%)', () => {
    const props = [
      prop({ lender: 'Kiavi' }), prop({ lender: 'Kiavi' }),
      prop({ lender: 'Defy' }), prop({ lender: 'Newrez' }),
    ];
    const r = analyzePortfolio(props, null, borrower, 0);
    expect(r.lenderConcentration.topLenderPct).toBeCloseTo(0.5, 6);
    expect(r.lenderConcentration.warning).toBeNull();
  });

  it('warns just above the 50% lender boundary (3 of 5)', () => {
    const props = [
      prop({ lender: 'Kiavi' }), prop({ lender: 'Kiavi' }), prop({ lender: 'Kiavi' }),
      prop({ lender: 'Defy' }), prop({ lender: 'Newrez' }),
    ];
    const r = analyzePortfolio(props, null, borrower, 0);
    expect(r.lenderConcentration.warning).not.toBeNull();
  });

  it('does NOT warn at exactly 40% geographic concentration (boundary is strictly > 40%)', () => {
    const props = [
      prop({ state: 'TX' }), prop({ state: 'TX' }),
      prop({ state: 'CA' }), prop({ state: 'NY' }), prop({ state: 'FL' }),
    ];
    const r = analyzePortfolio(props, null, borrower, 0);
    expect(r.geographicConcentration.topStatePct).toBeCloseTo(0.4, 6);
    expect(r.geographicConcentration.warning).toBeNull();
  });

  it('warns just above the 40% geographic boundary (3 of 5)', () => {
    const props = [
      prop({ state: 'TX' }), prop({ state: 'TX' }), prop({ state: 'TX' }),
      prop({ state: 'CA' }), prop({ state: 'NY' }),
    ];
    const r = analyzePortfolio(props, null, borrower, 0);
    expect(r.geographicConcentration.warning).not.toBeNull();
  });
});

describe('analyzePortfolio — refinance timing recommendations (gate 3)', () => {
  // Rate well above market, ample equity and rent — a clean, unambiguous
  // rate-and-term opportunity. Expected numbers are independently derived
  // via the textbook amortization formulas above, not by importing anything
  // from amortization.ts or refiTracker.ts.
  const HIGH_RATE = 9.0;
  const MARKET_RATE = 6.5;
  const ORIG = 200_000;
  const TERM = 360;
  const ELAPSED = 60;

  function seasonedHighRateProp(over: Partial<PortfolioPropertyInput> = {}) {
    return prop({
      id: 'refi-candidate',
      originalLoanAmount: ORIG,
      annualRatePct: HIGH_RATE,
      termMonths: TERM,
      monthsElapsed: ELAPSED,
      monthlyEscrows: 300,
      propertyValue: 300_000,
      monthlyRent: 3000,
      ...over,
    });
  }

  it('recommends a refi with the REAL current rate, market rate, and savings — not fabricated placeholders', () => {
    const r = analyzePortfolio([seasonedHighRateProp()], null, borrower, 0, MARKET_RATE);
    expect(r.refiOpportunities).toHaveLength(1);
    const opp = r.refiOpportunities[0];

    const currentPayment = piIndependent(ORIG, HIGH_RATE, TERM);
    const balanceAtElapsed = balanceIndependent(ORIG, HIGH_RATE, TERM, ELAPSED);
    const proposedPayment = piIndependent(balanceAtElapsed, MARKET_RATE, TERM);
    const expectedSavings = currentPayment - proposedPayment;

    expect(opp.currentRate).toBe(HIGH_RATE); // NOT the old hardcoded 0
    expect(opp.projectedRate).toBe(MARKET_RATE); // NOT currentMarketRate - 0.25
    expect(opp.monthlySavings).toBeCloseTo(expectedSavings, 1); // NOT PITIA * 0.05
    expect(opp.monthlySavings).toBeGreaterThan(300); // sanity floor — this is a real, material saving
  });

  it('seasoning timing: fully seasoned (60 months owned) reports 0 months remaining', () => {
    const r = analyzePortfolio([seasonedHighRateProp({ monthsElapsed: 60 })], null, borrower, 0, MARKET_RATE);
    expect(r.refiOpportunities[0].seasoningMonthsRemaining).toBe(0);
  });

  it('seasoning timing: 2 months owned reports exactly 4 months remaining (6-month requirement)', () => {
    const r = analyzePortfolio([seasonedHighRateProp({ monthsElapsed: 2 })], null, borrower, 0, MARKET_RATE);
    expect(r.refiOpportunities).toHaveLength(1); // still a real opportunity, just not seasoned yet
    expect(r.refiOpportunities[0].seasoningMonthsRemaining).toBe(4);
  });

  it('never recommends a refi for a property already at or below market rate', () => {
    const r = analyzePortfolio(
      [seasonedHighRateProp({ id: 'at-market', annualRatePct: MARKET_RATE })],
      null, borrower, 0, MARKET_RATE,
    );
    expect(r.refiOpportunities).toHaveLength(0);
  });

  it('fails closed: refuses to recommend a refi that cannot retire the existing lien (insufficient value)', () => {
    // Same loan as the clean opportunity above, but the property is worth far
    // less — LTV can't size a new loan big enough to pay off the old one.
    const r = analyzePortfolio(
      [seasonedHighRateProp({ id: 'underwater', propertyValue: 100_000 })],
      null, borrower, 0, MARKET_RATE,
    );
    expect(r.refiOpportunities).toHaveLength(0);
  });

  it('a mixed book only recommends the property that actually qualifies', () => {
    const r = analyzePortfolio(
      [
        seasonedHighRateProp({ id: 'qualifies' }),
        seasonedHighRateProp({ id: 'underwater', propertyValue: 90_000 }),
        seasonedHighRateProp({ id: 'at-market', annualRatePct: MARKET_RATE }),
      ],
      null, borrower, 0, MARKET_RATE,
    );
    expect(r.refiOpportunities.map(o => o.propertyId)).toEqual(['qualifies']);
  });
});

describe('computePortfolioHealthScore', () => {
  const base = {
    globalDSCR: 1.6,
    totalPITIA: 2000,
    reserveShortfall: 0,
    lenderConcentration: { warning: null },
    geographicConcentration: { warning: null },
    negativeCashFlowProperties: { count: 0 },
  } as unknown as ReturnType<typeof analyzePortfolio>;

  it('scores a clean book 100 / STRONG', () => {
    const h = computePortfolioHealthScore(base);
    expect(h.score).toBe(100);
    expect(h.label).toBe('STRONG');
  });

  it('scores a distressed book 0 / CRITICAL', () => {
    const bad = {
      ...base,
      globalDSCR: 0.9,
      reserveShortfall: 2000 * 10,
      lenderConcentration: { warning: 'x' },
      geographicConcentration: { warning: 'x' },
      negativeCashFlowProperties: { count: 3 },
    } as unknown as ReturnType<typeof analyzePortfolio>;
    const h = computePortfolioHealthScore(bad);
    expect(h.score).toBe(0);
    expect(h.label).toBe('CRITICAL');
  });

  it('partial-credit: strong DSCR, one concentration warning, one negative-CF', () => {
    const mid = {
      ...base,
      globalDSCR: 1.3, // 30
      lenderConcentration: { warning: 'x' }, // 0
      geographicConcentration: { warning: null }, // 10
      negativeCashFlowProperties: { count: 1 }, // 12
      reserveShortfall: 0, // 20
    } as unknown as ReturnType<typeof analyzePortfolio>;
    const h = computePortfolioHealthScore(mid);
    expect(h.breakdown).toEqual({ dscrPts: 30, concentrationPts: 10, cashFlowPts: 12, reservePts: 20 });
    expect(h.score).toBe(72);
    expect(h.label).toBe('HEALTHY');
  });
});
