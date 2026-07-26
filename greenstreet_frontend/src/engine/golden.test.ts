/**
 * Golden-vector parity test for the DSCR engine.
 *
 * The engine ships a self-check, `verifyGoldenValues()`, that recomputes the
 * documented flagship vectors (payment factors, P&I, PITIA, dual-track DSCR,
 * rent breakpoint, deal-break rate) and compares each against its published
 * expected value. This test wires that self-check into CI so any drift in the
 * core math — or in the numbers we publish on the marketing site — fails the
 * build instead of silently shipping.
 *
 * Pure-function / deterministic — no network, no Firebase.
 */

import { describe, it, expect } from 'vitest';
import { verifyGoldenValues } from './engine';

describe('golden-vector parity (verifyGoldenValues)', () => {
  const report = verifyGoldenValues();

  it('every published golden vector reproduces', () => {
    // Surface the offending vectors in the failure message, not just `false`.
    const failures = Object.entries(report.results)
      .filter(([, r]) => !r.pass)
      .map(([k, r]) => `${k}: expected ${r.expected}, got ${r.actual}`);
    expect(failures).toEqual([]);
    expect(report.pass).toBe(true);
  });

  // Lock each vector individually so a regression report names the exact metric.
  for (const [key, r] of Object.entries(report.results)) {
    it(`vector "${key}" matches published value (${r.expected})`, () => {
      expect(r.pass).toBe(true);
      expect(r.actual).toBe(r.actual); // finite (NaN guard)
      expect(Number.isFinite(r.actual)).toBe(true);
    });
  }
});
