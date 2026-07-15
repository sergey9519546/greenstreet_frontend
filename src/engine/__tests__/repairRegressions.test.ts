import { describe, expect, it } from 'vitest';
import { analyzePortfolio, computePortfolioHealthScore } from '../portfolio';
import { runMonteCarlo } from '../monteCarlo';
import { runMonteCarloRatePath, DEFAULT_VASICEK_PARAMS } from '../monteCarloRatePath';
import {
  computeARMReset,
  CURRENT_MARKET_SNAPSHOT,
  DEFAULT_ARM_PROGRAMS,
  simulateARMResetLadder,
} from '../armResetEngine';

const borrower = {} as any;

describe('portfolio repair regressions', () => {
  const property = {
    id: 'p1',
    name: 'One',
    address: '',
    monthlyPITIA: 1000,
    monthlyRent: 1200,
    lender: 'Lender',
    loanBalance: 100000,
    dscr: 1.3,
    track2DSCR: 0.9,
    isBlanket: false,
  } as any;

  it('uses the same TCO expense rate for NOI and monthly bleed', () => {
    const result = analyzePortfolio([property], null, borrower, 0);
    expect(result.totalNOI).toBe(1200 * 0.72 * 12);
    expect(result.negativeCashFlowProperties.totalMonthlyBleed).toBe(136);
  });

  it('keeps generated deal ids deterministic and omits invented refi economics', () => {
    const deal = {
      monthlyPITIA: 1000,
      monthlyRent: 2000,
      lender: 'Lender',
      loanBalance: 100000,
      dscr: 1.5,
      track2DSCR: 1.2,
      isBlanket: false,
    };
    const first = analyzePortfolio([], deal, borrower, 0, 5);
    const second = analyzePortfolio([], deal, borrower, 0, 5);
    expect(first.properties[0].id).toBe('new-deal');
    expect(second.properties[0].id).toBe(first.properties[0].id);
    expect(first.refiOpportunities).toEqual([]);
  });

  it('scores an empty portfolio as empty and keeps extreme outputs finite', () => {
    const empty = analyzePortfolio([], null, borrower, Number.NaN);
    expect(computePortfolioHealthScore(empty).score).toBe(0);

    const extreme = analyzePortfolio([
      { ...property, monthlyPITIA: Number.MAX_VALUE, monthlyRent: Number.POSITIVE_INFINITY, loanBalance: Number.MAX_VALUE },
    ], null, borrower, Number.NEGATIVE_INFINITY);
    expect([
      extreme.totalPITIA,
      extreme.totalRent,
      extreme.totalNOI,
      extreme.globalDSCR,
      extreme.totalDebtYield,
      extreme.totalReservesRequired,
      extreme.reserveShortfall,
    ].every(Number.isFinite)).toBe(true);
  });
});

describe('Monte Carlo repair regressions', () => {
  it('rejects zero and non-finite simulation counts before division', () => {
    expect(() => runMonteCarlo({} as any, {} as any, 'LTR' as any, {} as any, 0)).toThrow(RangeError);
    expect(() => runMonteCarlo({} as any, {} as any, 'LTR' as any, {} as any, Number.NaN)).toThrow(RangeError);
    expect(() => runMonteCarloRatePath(DEFAULT_ARM_PROGRAMS['5_6_ARM'], 100000, 300, 2000, 500, 0)).toThrow(RangeError);
  });

  it('uses the supplied market snapshot and reproduces a supplied seed', () => {
    const snapshot = { ...CURRENT_MARKET_SNAPSHOT, sofr30Day: 6.25 };
    const args = [
      DEFAULT_ARM_PROGRAMS['5_6_ARM'], 100000, 300, 2000, 500, 8, 12, 123,
      { ...DEFAULT_VASICEK_PARAMS, volatility: 0, meanReversionSpeed: 0, shockProbMonthly: 0 },
      snapshot,
    ] as const;
    const first = runMonteCarloRatePath(...args);
    const second = runMonteCarloRatePath(...args);
    expect(first).toEqual(second);
    expect(first.modelParameters.initialSOFR).toBe(6.25);
  });
});

describe('ARM reset repair regressions', () => {
  it('does not emit resets beyond the horizon and sanitizes reset frequency', () => {
    const terms = DEFAULT_ARM_PROGRAMS['5_6_ARM'];
    expect(simulateARMResetLadder(terms, 5, 4).trajectory).toEqual([]);
    expect(simulateARMResetLadder(terms, 5, 5).trajectory).toHaveLength(1);
    const invalidFrequency = simulateARMResetLadder({ ...terms, resetFrequencyMonths: 0 }, 5, 10);
    expect(invalidFrequency.trajectory.length).toBeGreaterThan(0);
    expect(invalidFrequency.trajectory.every(point => Number.isFinite(point.rate))).toBe(true);
  });

  it('stresses the selected non-SOFR index and bounds extreme inputs', () => {
    const treasuryTerms = {
      ...DEFAULT_ARM_PROGRAMS['5_6_ARM'],
      index: 'TREASURY_5YR',
      initialRate: 1,
      floorRate: 0,
      marginPct: 0,
      initialCapPct: 20,
      periodicCapPct: 20,
      lifetimeCapPct: 20,
    } as any;
    const snapshot = { ...CURRENT_MARKET_SNAPSHOT, treasury5Y: 8 };
    const stressed = computeARMReset(treasuryTerms, 100000, 300, 2000, 500, 0, snapshot);
    expect(stressed.resetRateAtStressIndex).toBeGreaterThan(8);

    const extreme = computeARMReset(
      { ...treasuryTerms, resetFrequencyMonths: Number.NaN, initialRate: Number.POSITIVE_INFINITY },
      Number.MAX_VALUE,
      0,
      Number.POSITIVE_INFINITY,
      Number.NaN,
    );
    expect(Object.values(extreme).filter(value => typeof value === 'number').every(Number.isFinite)).toBe(true);
  });
});
