/**
 * TCO ↔ Standard DSCR Threshold Conversion Engine
 *
 * Converts between standard DSCR (Gross Rent ÷ PITIA) and True Cost of Ownership (TCO) DSCR,
 * which incorporates reserve/capex loads.
 */

export const DEFAULT_RESERVE_LOAD = 0.3889; // 38.89% reserve load reproduces 1.25 std ≈ 0.90 TCO desk anchor

export function stdToTco(stdDscr: number, reserveLoad = DEFAULT_RESERVE_LOAD): number {
  const tco = stdDscr / (1 + reserveLoad);
  return Math.round(tco * 1000) / 1000;
}

export function tcoToStd(tcoDscr: number, reserveLoad = DEFAULT_RESERVE_LOAD): number {
  const std = tcoDscr * (1 + reserveLoad);
  return Math.round(std * 1000) / 1000;
}

export interface TcoThresholdRow {
  standard: number;
  tco: number;
}

export function tcoThresholdTable(
  standards: number[] = [1.0, 1.1, 1.15, 1.2, 1.25],
  reserveLoad = DEFAULT_RESERVE_LOAD,
): TcoThresholdRow[] {
  return standards.map((s) => ({ standard: s, tco: stdToTco(s, reserveLoad) }));
}
