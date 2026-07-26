// ============================================================
// RENT REASONABLENESS / DEAL INTEGRITY
// ============================================================
// Frontend-native adaptation of GAP_RENT_FRAUD_DETECTION_ALGORITHM.md
// (Module A — rent-comp anomaly; Module B — STR projection divergence) AND the
// behavioral "deviation alert" (INNOVATION_BEHAVIORAL_FINANCE §1.3): investors
// overestimate rent ~8–15%, silently inflating DSCR across the qualifying line.
//
// We have no external comp API on the client, so the 1007/1025 appraiser
// MARKET rent is the benchmark (the comp the lender actually underwrites to),
// and we cross-check STR projections against documented history. Pure math,
// explainable, no data feeds. Reasonableness signal — NOT an accusation.

export interface RentIntegrityInput {
  leaseRent: number;          // stated / in-place lease used to qualify
  marketRent: number;         // 1007/1025 appraiser market rent (benchmark)
  strProjectedRent?: number;  // AirDNA / projected STR gross
  strDocumentedRent?: number; // 12-mo actual STR history
}

export type IntegrityDisposition = 'CLEAR' | 'REVIEW' | 'ELEVATED';

export interface RentIntegrityResult {
  leaseVsMarketPct: number;   // +% the stated rent exceeds market (negative = below)
  strDivergencePct: number;   // +% projection exceeds documented (0 if n/a)
  score: number;              // 0–100 composite (higher = more anomalous)
  disposition: IntegrityDisposition;
  flags: string[];            // explainable reasons
}

function round1(n: number): number { return Math.round(n * 10) / 10; }

/** Map a % over market to anomaly points (calibrated from the fraud-algo
 * Z thresholds, expressed on deviation since we benchmark to a point estimate). */
function deviationPoints(pctOver: number): number {
  if (pctOver < 5) return 0;
  if (pctOver < 10) return ((pctOver - 5) / 5) * 8;      // 0–8
  if (pctOver < 20) return 8 + ((pctOver - 10) / 10) * 17; // 8–25
  return Math.min(40, 25 + (pctOver - 20) / 2);            // 25–40 (cap)
}

export function assessRentIntegrity(input: RentIntegrityInput): RentIntegrityResult {
  const flags: string[] = [];
  const { leaseRent, marketRent, strProjectedRent, strDocumentedRent } = input;

  // Module A — stated rent vs the appraiser's market rent.
  let leaseVsMarketPct = 0;
  let leasePoints = 0;
  if (marketRent > 0 && leaseRent > 0) {
    leaseVsMarketPct = round1(((leaseRent - marketRent) / marketRent) * 100);
    if (leaseVsMarketPct > 0) leasePoints = deviationPoints(leaseVsMarketPct);
    if (leaseVsMarketPct >= 10) {
      flags.push(`Stated rent is ${leaseVsMarketPct.toFixed(0)}% above the appraiser's market rent — most lenders underwrite to the lower 1007 figure, so the qualifying DSCR will likely use the market number.`);
    }
  }

  // Module B — STR projection vs documented history.
  let strDivergencePct = 0;
  let strPoints = 0;
  if (strProjectedRent && strDocumentedRent && strDocumentedRent > 0) {
    strDivergencePct = round1(((strProjectedRent - strDocumentedRent) / strDocumentedRent) * 100);
    if (strDivergencePct > 15) {
      strPoints = Math.min(35, ((strDivergencePct - 15) / 10) * 12);
      flags.push(`STR projection is ${strDivergencePct.toFixed(0)}% above documented history — lenders haircut unverified projections (~20%) and lean on the documented number.`);
    }
  }

  // Composite (0–100) + cross-signal boost when both fire.
  let score = leasePoints + strPoints;
  if (leasePoints >= 10 && strPoints >= 10) score += 8; // concurrent-signal boost
  score = Math.round(Math.min(100, score));

  const disposition: IntegrityDisposition = score >= 40 ? 'ELEVATED' : score >= 18 ? 'REVIEW' : 'CLEAR';
  return { leaseVsMarketPct, strDivergencePct, score, disposition, flags };
}
