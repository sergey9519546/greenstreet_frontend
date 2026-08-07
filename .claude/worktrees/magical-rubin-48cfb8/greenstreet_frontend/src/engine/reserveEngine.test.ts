import { describe, it, expect } from 'vitest';
import { getGeographyOverlay, applyAssetHaircuts } from './reserveEngine';

describe('getGeographyOverlay', () => {
  it('returns the Griffin CA 9/12/15 schedule (case-insensitive)', () => {
    const ca = getGeographyOverlay('ca');
    expect(ca).not.toBeNull();
    expect(ca!.state).toBe('CA');
    expect(ca!.schedule).toBe('9/12/15');
  });

  it('returns null for states with no overlay', () => {
    expect(getGeographyOverlay('TX')).toBeNull();
    expect(getGeographyOverlay('FL')).toBeNull();
  });
});

describe('applyAssetHaircuts (liquidity hierarchy)', () => {
  it('Tier 1 cash takes no haircut', () => {
    const [a] = applyAssetHaircuts([{ type: 'CHECKING', value: 100 }]);
    expect(a.tier).toBe(1);
    expect(a.haircutPct).toBe(0);
    expect(a.eligibleAmount).toBe(100);
  });

  it('Tier 2 retirement takes a 30% haircut', () => {
    const [a] = applyAssetHaircuts([{ type: 'RETIREMENT_401K', value: 100 }]);
    expect(a.tier).toBe(2);
    expect(a.eligibleAmount).toBeCloseTo(70, 6);
  });

  it('Tier 3 gift funds are accepted with a 40% haircut (not excluded)', () => {
    const [a] = applyAssetHaircuts([{ type: 'GIFT_FUNDS', value: 100 }]);
    expect(a.tier).toBe(3);
    expect(a.eligibleAmount).toBeCloseTo(60, 6);
  });

  it('crypto is fully excluded (100% haircut)', () => {
    const [a] = applyAssetHaircuts([{ type: 'CRYPTO', value: 100 }]);
    expect(a.tier).toBe('EXCLUDED');
    expect(a.eligibleAmount).toBe(0);
  });
});
