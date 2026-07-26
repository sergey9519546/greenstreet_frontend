import { describe, expect, it } from 'vitest';
import { DealRequestSchema, StateRequestSchema } from './schemas';

const validDeal = {
  purchasePrice: 400_000,
  monthlyRent: 3_000,
  state: 'TX',
};

describe('DealRequestSchema loan enum validation', () => {
  it.each(['NONE', '5_YR', '7_YR', '10_YR'] as const)('accepts supported ioPeriod %s', (ioPeriod) => {
    const result = DealRequestSchema.safeParse({ ...validDeal, ioPeriod });
    expect(result.success).toBe(true);
  });

  it.each([
    ['ioPeriod', '0'],
    ['term', '20_YR'],
    ['armType', '3_1_ARM'],
    ['prepayPreference', '999'],
    ['loanPurpose', 'REFI'],
  ])('rejects unsupported %s value %s', (field, value) => {
    const result = DealRequestSchema.safeParse({ ...validDeal, [field]: value });
    expect(result.success).toBe(false);
  });

  it('accepts the supported loan enum combination', () => {
    const result = DealRequestSchema.safeParse({
      ...validDeal,
      term: '30_YR',
      ioPeriod: 'NONE',
      armType: 'FIXED',
      prepayPreference: '54321',
      loanPurpose: 'PURCHASE',
      strategy: 'LTR',
    });

    expect(result.success).toBe(true);
  });
});

describe('state-code validation', () => {
  it.each(['TX', 'ca', ' DC '])('accepts and normalizes %j', (state) => {
    const dealResult = DealRequestSchema.safeParse({ ...validDeal, state });
    const stateResult = StateRequestSchema.safeParse({ state });

    expect(dealResult.success).toBe(true);
    expect(stateResult.success).toBe(true);
    if (dealResult.success && stateResult.success) {
      expect(dealResult.data.state).toBe(state.trim().toUpperCase());
      expect(stateResult.data.state).toBe(state.trim().toUpperCase());
    }
  });

  it.each(['TEXAS', 'ZZ', '', 'T1'])('rejects unrecognized jurisdiction %j', (state) => {
    expect(DealRequestSchema.safeParse({ ...validDeal, state }).success).toBe(false);
    expect(StateRequestSchema.safeParse({ state }).success).toBe(false);
  });
});
