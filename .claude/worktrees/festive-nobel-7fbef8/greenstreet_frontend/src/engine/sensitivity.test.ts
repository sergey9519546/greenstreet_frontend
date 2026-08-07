import { describe, it, expect } from 'vitest';
import {
  computeRentSensitivity,
  computeRateSensitivity,
  computeLTVSensitivity,
} from './sensitivity';

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

  it('applies the LTR 21% haircut to Track 2', () => {
    const [row] = computeRentSensitivity(2855, 2855, [2855], 'LTR');
    expect(row.track2DSCR).toBe(0.79); // 2855 * 0.79 / 2855
    expect(row.status).toBe('Marginal'); // 1.0 ≥1.0 and <1.25
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
