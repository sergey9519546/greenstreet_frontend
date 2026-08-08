import { describe, it, expect } from 'vitest';
import {
  computeRentSensitivity,
  computeRateSensitivity,
  computeLTVSensitivity,
} from './sensitivity';
import { computeTcoRate, mapToTcoType } from './tcoDscr';

// Golden values documented in sensitivity.ts header.
describe('computeRentSensitivity', () => {
  it('reproduces golden Track 1 DSCRs at PITIA $2,855', () => {
    const rows = computeRentSensitivity(2855, 2855, [2400, 2855, 3426, 4500], 'LTR');
    const byRent = Object.fromEntries(rows.map(r => [r.rent, r.track1DSCR]));
    expect(byRent[2400]).toBe(0.84);
    expect(byRent[2855]).toBe(1.0);
    expect(byRent[3426]).toBe(1.2);
    expect(byRent[4500]).toBe(1.58);
  });

  /**
   * The Track-2 haircut must come from computeTcoRate, never from a number
   * written down here. This test previously asserted 0.79 — the flat
   * 8/8/5 = 21% formula that tcoDscr.ts explicitly says it REPLACED — so it
   * pinned the stale value in place and would have failed the correct one.
   * Deriving the expectation from the canonical source means the test tracks
   * the assumption instead of freezing a copy of it.
   */
  it('takes the Track 2 haircut from the canonical TCO rate, not a local constant', () => {
    const tco = computeTcoRate({ propertyType: mapToTcoType(1, false) }); // SFR
    const [row] = computeRentSensitivity(2855, 2855, [2855], 'LTR', 1);
    expect(row.track2DSCR).toBeCloseTo(1 - tco.total, 2);
    expect(tco.total).toBeGreaterThan(0.21); // the old flat rate carried no CapEx line
  });

  it('honours the strategy argument — STR is not priced as a long-term rental', () => {
    // `strategy` was declared and never read, so every strategy received the LTR
    // haircut. Short-term maps to CONDOTEL (63% vs SFR 28%), so the old code
    // overstated an STR deal's Track 2 DSCR by ~116%.
    const [ltr] = computeRentSensitivity(3000, 2500, [3000], 'LTR', 1);
    const [str] = computeRentSensitivity(3000, 2500, [3000], 'STR', 1);
    expect(str.track2DSCR).toBeLessThan(ltr.track2DSCR);

    const strTco = computeTcoRate({ propertyType: mapToTcoType(1, true) });
    expect(str.track2DSCR).toBeCloseTo((3000 * (1 - strTco.total)) / 2500, 2);
  });

  it('prices more doors on the multifamily rate, not the SFR rate', () => {
    const [sfr] = computeRentSensitivity(3000, 2500, [3000], 'LTR', 1);
    const [multi] = computeRentSensitivity(3000, 2500, [3000], 'LTR', 8);
    // MED_MULTI (25%) is a lighter haircut than SFR (28%), so Track 2 is higher.
    expect(multi.track2DSCR).toBeGreaterThan(sfr.track2DSCR);
  });
});

describe('computeRateSensitivity', () => {
  it('reproduces golden DSCR 1.05 at 7.00% (loan $318,750, fixed $734, rent $3,000)', () => {
    const [row] = computeRateSensitivity(318_750, 0, 0, 734, 0, 3000, 30, [7.0]);
    expect(row.pitia).toBe(2855);
    expect(row.track1DSCR).toBe(1.05);
    expect(row.status).toBe('Marginal');
  });
});

describe('computeLTVSensitivity', () => {
  it('reproduces golden loan amounts and DSCRs across LTV (price $425K, 7%)', () => {
    const rows = computeLTVSensitivity(425_000, 7, 3000, 30, 0, 0, 734, 0, [70, 75]);
    const byLtv = Object.fromEntries(rows.map(r => [r.ltv, r]));
    expect(byLtv[75].loan).toBe(318_750);
    expect(byLtv[75].dscr).toBe(1.05);
    expect(byLtv[70].loan).toBe(297_500);
    expect(byLtv[70].down).toBe(127_500);
  });
});
