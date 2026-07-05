// ============================================================
// TCO ↔ STANDARD DSCR THRESHOLD CONVERSION
// ============================================================
// A standard DSCR (Rent ÷ PITIA) ignores the reserve/capex carry a real owner
// pays. A "true cost of ownership" (TCO) DSCR loads those reserves into the
// denominator, so the same property scores LOWER on TCO than on standard.
//
// The anchor the desk quotes — "1.25 standard ≈ 0.90 TCO" — implies a reserve
// load of ~38.9% on top of PITIA:
//   tcoDscr = stdDscr / (1 + reserveLoad)   →   1.25 / 1.3889 = 0.900
// This module makes that conversion explicit and reproducible in both
// directions, plus a small explainer table. Pure math.

/** Reserve/capex load on top of PITIA that reproduces the 1.25→0.90 anchor. */
export const DEFAULT_RESERVE_LOAD = 0.3889;

/** Standard (Rent÷PITIA) DSCR → TCO DSCR. Higher reserveLoad ⇒ lower TCO. */
export function stdToTco(stdDscr: number, reserveLoad = DEFAULT_RESERVE_LOAD): number {
  const tco = stdDscr / (1 + reserveLoad);
  return Math.round(tco * 1000) / 1000;
}

/** TCO DSCR → equivalent standard DSCR. */
export function tcoToStd(tcoDscr: number, reserveLoad = DEFAULT_RESERVE_LOAD): number {
  const std = tcoDscr * (1 + reserveLoad);
  return Math.round(std * 1000) / 1000;
}

export interface TcoThresholdRow {
  standard: number;
  tco: number;
}

/** Common lender DSCR floors mapped to their TCO equivalents. */
export function tcoThresholdTable(
  standards: number[] = [1.0, 1.1, 1.15, 1.2, 1.25],
  reserveLoad = DEFAULT_RESERVE_LOAD,
): TcoThresholdRow[] {
  return standards.map((s) => ({ standard: s, tco: stdToTco(s, reserveLoad) }));
}
