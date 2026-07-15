import { describe, expect, it } from 'vitest';
import {
  PPP_MODEL_LIMITATION,
  STATE_JURISDICTION_CODES,
  checkPPPLegal,
  getIndexedThreshold,
  normalizeStateCode,
} from './statePppLaws';

describe('canonical state normalization', () => {
  it('accepts exact postal codes and full names case-insensitively', () => {
    expect(normalizeStateCode(' tx ')).toBe('TX');
    expect(normalizeStateCode('new   jersey')).toBe('NJ');
    expect(normalizeStateCode('District of Columbia')).toBe('DC');
  });

  it('rejects partial, empty, and unknown names', () => {
    expect(normalizeStateCode('New')).toBeNull();
    expect(normalizeStateCode('')).toBeNull();
    expect(normalizeStateCode('Atlantis')).toBeNull();
  });

  it('defines all 50 states plus the District of Columbia', () => {
    expect(STATE_JURISDICTION_CODES).toHaveLength(51);
    expect(new Set(STATE_JURISDICTION_CODES).size).toBe(51);
  });

  it('uses full names consistently in PPP checks and indexed thresholds', () => {
    expect(checkPPPLegal('Texas', 'LLC', 400_000, 1, 'FIXED')).toEqual(
      checkPPPLegal('TX', 'LLC', 400_000, 1, 'FIXED'),
    );
    expect(getIndexedThreshold('Pennsylvania')).toEqual(getIndexedThreshold('PA'));
  });

  it('labels model output as dated information rather than legal advice', () => {
    expect(PPP_MODEL_LIMITATION).toContain('current as of');
    expect(PPP_MODEL_LIMITATION).toContain('not legal advice');
  });
});
