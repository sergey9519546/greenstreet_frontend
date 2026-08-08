import { describe, it, expect } from 'vitest';
import {
  DATA_VINTAGE,
  DATA_VINTAGE_DISCLOSURE,
  REVIEWED_AS_OF,
  ageInDays,
  daysBetween,
  formatVintage,
  getDataVintage,
  marketDataAsOfLabel,
  oldestAsOf,
  staleDatasets,
} from './dataVintage';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Datasets the engine must never silently lose. Adding a dated dataset without
// registering it here is the failure mode this list guards against.
const REQUIRED_KEYS = [
  'rateAnchor',
  'sofrModel',
  'lenderDatabase',
  'statePppLaws',
  'dscrPrograms',
  'taxRules',
  'insuranceTable',
  'reassessmentRules',
  'indexedThresholds',
] as const;

describe('data vintage registry — shape', () => {
  it('covers every required dataset', () => {
    for (const key of REQUIRED_KEYS) {
      expect(DATA_VINTAGE.map((e) => e.key)).toContain(key);
    }
  });

  it('has no duplicate keys', () => {
    const keys = DATA_VINTAGE.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every entry is well-formed', () => {
    for (const e of DATA_VINTAGE) {
      expect(e.label.length, `${e.key} label`).toBeGreaterThan(0);
      expect(e.sourceFile.length, `${e.key} sourceFile`).toBeGreaterThan(0);
      expect(e.source.length, `${e.key} source`).toBeGreaterThan(0);
      expect(e.notes.length, `${e.key} notes`).toBeGreaterThan(0);
      expect(Number.isInteger(e.refreshCadenceDays), `${e.key} cadence is an integer`).toBe(true);
      expect(e.refreshCadenceDays, `${e.key} cadence`).toBeGreaterThan(0);
      expect(['documented', 'undocumented'], `${e.key} confidence`).toContain(e.asOfConfidence);
    }
  });

  it('every dated entry parses as a real ISO date not in the future', () => {
    for (const e of DATA_VINTAGE) {
      if (e.asOf === null) continue;
      expect(e.asOf, `${e.key} asOf format`).toMatch(ISO_DATE);
      const t = new Date(`${e.asOf}T00:00:00.000Z`).getTime();
      expect(Number.isNaN(t), `${e.key} asOf parses`).toBe(false);
      expect(daysBetween(e.asOf, REVIEWED_AS_OF), `${e.key} is not dated after the review`).toBeGreaterThanOrEqual(0);
    }
  });

  it('asOfConfidence agrees with whether asOf is set', () => {
    for (const e of DATA_VINTAGE) {
      expect(e.asOf === null, `${e.key}`).toBe(e.asOfConfidence === 'undocumented');
    }
  });

  it('REVIEWED_AS_OF is a valid ISO date', () => {
    expect(REVIEWED_AS_OF).toMatch(ISO_DATE);
    expect(Number.isNaN(new Date(`${REVIEWED_AS_OF}T00:00:00.000Z`).getTime())).toBe(false);
  });

  it('getDataVintage resolves known keys and throws on unknown ones', () => {
    expect(getDataVintage('rateAnchor').asOf).toBe('2026-06-17');
    // @ts-expect-error — deliberately invalid key
    expect(() => getDataVintage('nope')).toThrow(/Unknown data vintage key/);
  });
});

// ---------------------------------------------------------------------------
// THE STALENESS GATE
// ---------------------------------------------------------------------------
// This test does NOT use `Date.now()` — a wall-clock assertion would flake in CI
// and would fail on a branch that nobody touched. Instead every dataset is
// measured against REVIEWED_AS_OF, a constant at the top of dataVintage.ts that
// records the team's last data-review pass.
//
// The contract: when you bump REVIEWED_AS_OF you are asserting "we looked at the
// data on this date". If any dataset is then more than 2× its refresh cadence
// behind that review, this test fails and the bump cannot land until the data is
// either refreshed or its cadence is consciously renegotiated. The forcing
// function is the bump, not the calendar.
// ---------------------------------------------------------------------------
describe('data vintage — staleness gate vs REVIEWED_AS_OF', () => {
  it('no dated dataset is more than 2x its refresh cadence behind REVIEWED_AS_OF', () => {
    const overdue = DATA_VINTAGE.filter((e) => e.asOf !== null).filter(
      (e) => ageInDays(e) > e.refreshCadenceDays * 2,
    ).map((e) => `${e.key}: asOf ${e.asOf} is ${ageInDays(e)}d old, cadence ${e.refreshCadenceDays}d (limit ${e.refreshCadenceDays * 2}d)`);

    expect(
      overdue,
      `Stale data as of REVIEWED_AS_OF=${REVIEWED_AS_OF}. Re-verify the source files and update ` +
        `their asOf dates in src/engine/dataVintage.ts, or renegotiate the cadence deliberately.`,
    ).toEqual([]);
  });

  // Undated datasets can never be proven fresh, so they are excluded from the gate
  // above and pinned here instead. This fails if a new undated dataset appears —
  // which is exactly when someone should be asked "where did this number come from?".
  it('exactly one dataset is undated, and it is the insurance table', () => {
    const undated = DATA_VINTAGE.filter((e) => e.asOf === null).map((e) => e.key);
    expect(undated).toEqual(['insuranceTable']);
    expect(ageInDays(getDataVintage('insuranceTable'))).toBe(Infinity);
  });

  it('staleDatasets flags anything past cadence, undated entries always included', () => {
    // A year after the review pass, everything with a <= 365d cadence is stale.
    const wayLater = staleDatasets(new Date('2027-08-08T00:00:00.000Z'));
    expect(wayLater.map((e) => e.key)).toContain('rateAnchor');
    expect(wayLater.map((e) => e.key)).toContain('insuranceTable');

    // Undated entries are stale even at the moment the data was reviewed.
    const atReview = staleDatasets(new Date(`${REVIEWED_AS_OF}T00:00:00.000Z`));
    expect(atReview.map((e) => e.key)).toContain('insuranceTable');

    // Sorted oldest-first.
    const ages = wayLater.map((e) => ageInDays(e, '2027-08-08'));
    expect(ages).toEqual([...ages].sort((a, b) => b - a));
  });

  it('nothing dated is stale at its own asOf date', () => {
    for (const e of DATA_VINTAGE) {
      if (e.asOf === null) continue;
      const atOwnDate = staleDatasets(new Date(`${e.asOf}T00:00:00.000Z`));
      expect(atOwnDate.map((k) => k.key), `${e.key} at its own asOf`).not.toContain(e.key);
    }
  });
});

describe('data vintage — user-facing disclosure', () => {
  it('oldestAsOf returns the oldest dated entry', () => {
    const oldest = oldestAsOf();
    expect(oldest).toMatch(ISO_DATE);
    for (const e of DATA_VINTAGE) {
      if (e.asOf === null) continue;
      expect(e.asOf >= oldest!, `${e.key} not older than oldestAsOf`).toBe(true);
    }
    // Jan-verified state PPP law / indexed thresholds are the weakest link today.
    expect(oldest).toBe('2026-01-01');
  });

  it('formats a vintage as a readable month + year', () => {
    expect(formatVintage('2026-01-01')).toBe('January 2026');
    expect(formatVintage('2026-06-17')).toBe('June 2026');
  });

  it('the disclosure sentence names the oldest vintage, not the newest', () => {
    expect(marketDataAsOfLabel()).toBe('January 2026');
    expect(DATA_VINTAGE_DISCLOSURE).toContain('Market data as of January 2026.');
    expect(DATA_VINTAGE_DISCLOSURE).toContain('verify with current sources');
  });

  it('daysBetween is a plain whole-day difference', () => {
    expect(daysBetween('2026-06-01', '2026-06-17')).toBe(16);
    expect(daysBetween('2026-01-01', '2026-08-08')).toBe(219);
  });
});
