import { describe, expect, it } from 'vitest';
import {
  computeExitProceeds,
  computeRemainingBalance,
  computeReturns,
} from './returnsEngine';
import type { LoanStructure, PropertyInputs } from './types';

const property = (overrides: Partial<PropertyInputs> = {}): PropertyInputs => ({
  purchasePrice: 100_000,
  leaseRent: 1_000,
  marketRent: 1_000,
  strProjectedRent: 0,
  strDocumentedRent: 0,
  hoa: 0,
  annualTaxes: 0,
  annualInsurance: 0,
  floodInsurance: 0,
  propertyType: 'SFR',
  state: 'TX',
  unitCount: 1,
  sqft: 1_000,
  yearBuilt: 2000,
  isCondotel: false,
  isNonWarrantable: false,
  isRural: false,
  isDecliningMarket: false,
  hoaSTRPolicy: 'UNKNOWN',
  ...overrides,
});

const loan = (overrides: Partial<LoanStructure> = {}): LoanStructure => ({
  ltv: 0,
  term: '30_YR',
  ioPeriod: 'NONE',
  armType: 'FIXED',
  prepayPreference: '321',
  purpose: 'PURCHASE',
  expectedHoldYears: 1,
  points: 0,
  lenderFees: 0,
  brokerFees: 0,
  rateLockCost: 0,
  ...overrides,
});

describe('computeReturns cash-flow mechanics', () => {
  it('subtracts the 5% EGI CapEx reserve from cash-on-cash and IRR cash flows', () => {
    const result = computeReturns(property(), loan(), 1_000, 'LTR', 0);
    const egi = 12_000 * 0.92;
    const noi = egi - 12_000 * 0.15;
    const capex = egi * 0.05;
    expect(result.year1CashOnCash).toBeCloseTo((noi - capex) / 100_000 * 100, 2);

    const exitNOI = noi * 1.02;
    const netExit = exitNOI / 0.065 * 0.94;
    const expectedIRR = (noi - capex + netExit) / 100_000 - 1;
    expect(result.leveredIRR).toBeCloseTo(expectedIRR * 100, 1);
  });

  it('includes points and lender, broker, and rate-lock costs in cash invested', () => {
    const result = computeReturns(property(), loan({
      ltv: 50,
      points: 1,
      lenderFees: 2_000,
      brokerFees: 1_000,
      rateLockCost: 500,
    }), 1_000, 'LTR', 0);
    const cashInvested = 50_000 + 500 + 2_000 + 1_000 + 500;
    const egi = 12_000 * 0.92;
    const cashFlow = egi - 12_000 * 0.15 - egi * 0.05 - 50_000 / 360 * 12;
    expect(result.year1CashOnCash).toBeCloseTo(cashFlow / cashInvested * 100, 2);
  });

  it('uses interest-only debt service and preserves principal through the IO period', () => {
    const result = computeReturns(property(), loan({
      ltv: 75,
      ioPeriod: '5_YR',
      expectedHoldYears: 5,
    }), 1_000, 'LTR', 6);
    expect(result.monthlyAdsBreakdown.total).toBe(375);
    expect(result.monthlyAdsBreakdown.principal).toBe(0);
    expect(result.remainingLoanBalance).toBe(75_000);
  });
});

describe('remaining balance and exit guards', () => {
  it('starts amortization after IO and uses only the remaining amortization term', () => {
    const balance = computeRemainingBalance(100_000, 6, 360, 72, 60);
    const monthlyRate = 0.06 / 12;
    const factor = Math.pow(1 + monthlyRate, 300);
    const elapsed = Math.pow(1 + monthlyRate, 12);
    const expected = 100_000 * (factor - elapsed) / (factor - 1);
    expect(balance).toBeCloseTo(expected, 6);
  });

  it('rejects zero and invalid exit caps instead of returning infinite proceeds', () => {
    expect(() => computeExitProceeds(10_000, 2, 5, 0, 6, 0, 0)).toThrow(RangeError);
    expect(() => computeExitProceeds(10_000, 2, 5, Number.NaN, 6, 0, 0)).toThrow(RangeError);
  });
});
