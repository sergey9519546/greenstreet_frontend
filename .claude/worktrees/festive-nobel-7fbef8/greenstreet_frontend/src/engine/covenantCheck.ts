// ============================================================
// DSCR COVENANT + DAY-ONE / STABILIZED CHECKS
// ============================================================
// covenant-analysis (maintenance test): many bridge / commercial DSCR loans
// carry a DSCR maintenance covenant tested periodically — if measured DSCR drops
// below the threshold the loan is in technical default even while payments are
// current. And lease-up / vacancy risk: a deal that pencils at stabilized market
// rent can have day-one coverage well under 1.0 if the unit is vacant or below
// market at closing. Both are pure, explainable checks.

export type CovenantStatus = 'OK' | 'TIGHT' | 'BREACH';

export interface DscrCovenantResult {
  actualDscr: number;
  covenantDscr: number;
  cushion: number;          // actual − covenant, in DSCR "x"
  status: CovenantStatus;
  breach: boolean;
  note: string;
}

/** Maintenance-covenant test: is measured DSCR safely above the required floor? */
export function assessDscrCovenant(actualDscr: number, covenantDscr: number): DscrCovenantResult {
  const cushion = Math.round((actualDscr - covenantDscr) * 1000) / 1000;
  const breach = actualDscr < covenantDscr;
  const status: CovenantStatus = breach ? 'BREACH' : cushion < 0.10 ? 'TIGHT' : 'OK';
  const note =
    status === 'BREACH'
      ? `Measured DSCR ${actualDscr.toFixed(2)}x is below the ${covenantDscr.toFixed(2)}x maintenance covenant — a technical default even if payments are current. Expect a cash-flow sweep, cure period, or paydown demand.`
      : status === 'TIGHT'
      ? `Only ${cushion.toFixed(2)}x of cushion above the ${covenantDscr.toFixed(2)}x covenant — a small rent dip or expense spike could trip the maintenance test.`
      : `${cushion.toFixed(2)}x of cushion above the ${covenantDscr.toFixed(2)}x covenant — comfortable.`;
  return { actualDscr, covenantDscr, cushion, status, breach, note };
}

export type LeaseUpStatus = 'OK' | 'LEASE_UP_RISK';

export interface DayOneStabilizedResult {
  dayOneDscr: number;
  stabilizedDscr: number;
  leaseUpRisk: boolean;     // day-one < 1.10
  status: LeaseUpStatus;
  note: string;
}

/** Lease-up / vacancy risk: does the deal cover on day-one in-place rent, or only
 *  once stabilized at market? Flags day-one DSCR under 1.10x. */
export function assessDayOneVsStabilized(dayOneDscr: number, stabilizedDscr: number): DayOneStabilizedResult {
  const leaseUpRisk = dayOneDscr < 1.10;
  const status: LeaseUpStatus = leaseUpRisk ? 'LEASE_UP_RISK' : 'OK';
  const note = leaseUpRisk
    ? `Day-one DSCR ${dayOneDscr.toFixed(2)}x (in-place rent) is under 1.10x even though stabilized pencils at ${stabilizedDscr.toFixed(2)}x — vacancy or below-market leases at closing mean the loan must carry the gap until stabilized. Budget reserves or expect a lease-up condition.`
    : `Day-one DSCR ${dayOneDscr.toFixed(2)}x already covers the payment; limited lease-up risk versus the ${stabilizedDscr.toFixed(2)}x stabilized figure.`;
  return { dayOneDscr, stabilizedDscr, leaseUpRisk, status, note };
}
