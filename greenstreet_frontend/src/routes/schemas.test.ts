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

describe('DealRequestSchema property/borrower enum validation', () => {
  // Every literal below is copied from the unions in src/engine/types.ts. If the
  // engine gains a value and the schema does not, this test fails loudly rather
  // than the API silently 400-ing a legitimate deal.
  const supported: Record<string, readonly string[]> = {
    propertyType: [
      'SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE',
      'CONDOTEL', 'RURAL', '5+_UNIT', 'MIXED_USE',
    ],
    entityType: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'],
    experience: ['FIRST_TIME', 'EXPERIENCED', 'VETERAN'],
    strategy: ['LTR', 'STR', 'MTR'],
    hoaSTRPolicy: ['ALLOWS', 'SILENT', 'PROHIBITS', 'UNKNOWN'],
  };

  it.each(Object.entries(supported).flatMap(([field, values]) => values.map((value) => [field, value])))(
    'accepts %s=%s',
    (field, value) => {
      expect(DealRequestSchema.safeParse({ ...validDeal, [field]: value }).success).toBe(true);
    },
  );

  it.each([
    ['propertyType', 'MULTIFAMILY'],
    ['propertyType', 'sfr'],
    ['entityType', 'PARTNERSHIP'],
    ['entityType', 'llc'],
    ['experience', 'NOVICE'],
    ['strategy', 'FLIP'],
    ['hoaSTRPolicy', 'MAYBE'],
    ['propertyType', 42],
    ['entityType', { $ne: null }],
  ])('rejects unsupported %s value %j', (field, value) => {
    expect(DealRequestSchema.safeParse({ ...validDeal, [field]: value }).success).toBe(false);
  });

  it('omits absent enums entirely so the engine applies its own defaults', () => {
    const result = DealRequestSchema.safeParse(validDeal);

    expect(result.success).toBe(true);
    if (result.success) {
      // buildEngineInputs defaults propertyType→SFR, entityType→LLC, etc. The
      // schema must not pre-empt that with a value of its own.
      expect(result.data.propertyType).toBeUndefined();
      expect(result.data.entityType).toBeUndefined();
      expect(result.data.experience).toBeUndefined();
      expect(result.data.strategy).toBeUndefined();
      expect(result.data.loanPurpose).toBeUndefined();
    }
  });
});

describe('StateRequestSchema enum validation', () => {
  it.each(['FIXED', 'ARM'])('accepts productType %s', (productType) => {
    expect(StateRequestSchema.safeParse({ state: 'TX', productType }).success).toBe(true);
  });

  it.each([
    ['productType', 'BALLOON'],
    ['entityType', 'PARTNERSHIP'],
  ])('rejects unsupported %s value %j', (field, value) => {
    expect(StateRequestSchema.safeParse({ state: 'TX', [field]: value }).success).toBe(false);
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
