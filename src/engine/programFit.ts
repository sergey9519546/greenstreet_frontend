// ============================================================
// PROGRAM FIT — one evaluation of the dated DSCR program matrix
// ============================================================
//
// WHY THIS MODULE EXISTS
//
// `computeVerdict` fails closed: an unknown lender floor, LTV cap or minimum
// loan is a BLOCKER, not a pass. That only works if callers hand it REAL
// values or an honest "unknown". Two callers did not:
//
//   - DecisionSupportPage.tsx evaluated every program inline and derived the
//     floor/cap/min correctly, but kept that logic to itself.
//   - v11Runner.ts had no matrix lookup at all and substituted constants —
//     `lenderMinDSCR: 1.0 // standard floor`, `ltvCap: 80 // standard cap`,
//     `lenderMinLoan: 75000`, `bestLenderConfidence: ... ?? 75`. None of those
//     came from any program. They are invented numbers wearing the costume of
//     verified underwriting data, and because they were always finite they
//     cleared the fail-closed gates that exist to catch exactly this.
//
// So the evaluation lives here once and both callers read it. A program's
// floor, cap and minimum are facts recorded in `dscrPrograms.ts` as of
// `DSCR_PROGRAMS_AS_OF`; when nothing fits, this module returns NaN and lets
// the verdict say "not established" rather than inventing a number that reads
// as underwritten.
//
// WHAT THIS MODULE DOES NOT DO
//
// It does not price. `dscrPrograms.ts` carries no rate data whatsoever, so
// `estimatedRate`/`aey` are the engine-solved rate for the scenario being
// analysed — a model output, labelled as such in `provenanceWarnings`, and
// never a lender quote. `confidenceScore` is 0 because no confidence model
// scores these programs; callers must pass `bestLenderConfidence: null` to the
// verdict rather than reading a 0 as "low confidence".

import {
  DSCR_PROGRAMS,
  DSCR_PROGRAMS_AS_OF,
  lookupMaxLTV,
  type DscrProgram,
} from '../data/dscrPrograms';
import type { LenderRankingEntry } from './types';

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function money(n: number): string {
  if (!Number.isFinite(n)) return 'not established';
  return n < 0 ? `-${USD.format(Math.abs(n))}` : USD.format(n);
}

export type ProgramTxType = 'purchase' | 'rateTerm' | 'cashOut';

export interface ProgramFitInput {
  fico: number;
  loanAmount: number;
  /**
   * Track 1 DSCR for the deal. Pass `null` to evaluate against the no-ratio
   * tier explicitly. A DSCR at or below 0 is meaningless as a ratio and is
   * treated as no-ratio.
   */
  dscr: number | null;
  /** The LTV this deal actually needs, in percent (e.g. 75 for 75%). */
  ltvNeeded: number;
  /** Transaction type driving which LTV column applies. Default 'purchase'. */
  txType?: ProgramTxType;
  /**
   * The engine-solved rate for this scenario, in percent. Published on each
   * ranking entry as `estimatedRate`/`aey` and explicitly labelled as a model
   * output, because the program matrix has no pricing.
   */
  solvedRate: number;
  /** Deal needs 5+ unit eligibility. */
  isMultiFamily?: boolean;
  /** Deal is short-term rental and needs an STR-eligible program. */
  isSTR?: boolean;
  /** Borrower is a foreign national. */
  isForeignNational?: boolean;
  /** Override the matrix. Defaults to the dated `DSCR_PROGRAMS`. */
  programs?: DscrProgram[];
}

export interface ProgramEvaluation {
  program: DscrProgram;
  /** Max LTV this program offers for this cell, or null when no cell matches. */
  offerLTV: number | null;
  eligible: boolean;
  /** Empty exactly when `eligible`. Every entry is a specific, checkable fact. */
  reasons: string[];
}

export interface ProgramFitResult {
  /** EVERY program, eligible or not. Never filtered — ineligibility is a result. */
  evaluated: ProgramEvaluation[];
  /** Most leverage available; null when nothing fits. */
  bestFit: ProgramEvaluation | null;
  lenderRanking: LenderRankingEntry[];
  /**
   * The best-fit program's real DSCR floor, or NaN when nothing fits.
   * NaN is deliberate: `computeVerdict` treats a non-finite floor as
   * "Lender DSCR Floor Unknown" (a BLOCKER) instead of assuming 1.0.
   */
  lenderMinDSCR: number;
  /** The best-fit program's headline max LTV, or NaN when nothing fits. */
  ltvCap: number;
  /** The best-fit program's minimum loan, or NaN when it declares none. */
  lenderMinLoan: number;
  /** The matrix vintage, for provenance on any surface that publishes this. */
  sourceSnapshot: string;
}

/**
 * Evaluate every program in the dated matrix against one deal.
 *
 * Returns each program with its own ineligibility reasons rather than a
 * filtered shortlist, so a surface can show WHY a program was excluded instead
 * of silently omitting it — and so an empty eligible set is visibly "none
 * qualified" rather than indistinguishable from "never evaluated".
 */
export function evaluateProgramFit(input: ProgramFitInput): ProgramFitResult {
  const {
    fico,
    loanAmount,
    ltvNeeded,
    txType = 'purchase',
    solvedRate,
    isMultiFamily = false,
    isSTR = false,
    isForeignNational = false,
    programs = DSCR_PROGRAMS,
  } = input;

  // A DSCR at or below zero is not a ratio. Route it to the no-ratio tier the
  // way `lookupMaxLTV` documents, rather than comparing a nonsense number
  // against numeric tiers.
  const dscr =
    input.dscr !== null && Number.isFinite(input.dscr) && input.dscr >= 0.01
      ? input.dscr
      : null;

  const evaluated: ProgramEvaluation[] = programs.map((p) => {
    const offerLTV = lookupMaxLTV(p, fico, loanAmount, dscr, txType);
    const reasons: string[] = [];

    if (fico < p.minFICO) reasons.push(`FICO ${fico} below program minimum ${p.minFICO}`);
    if (offerLTV === null) reasons.push('No LTV grid cell matches this FICO / loan size / DSCR');
    else if (offerLTV < ltvNeeded) reasons.push(`Offers ${offerLTV}% LTV; this deal needs ${ltvNeeded}%`);
    if (loanAmount > p.maxLoan) reasons.push(`Loan ${money(loanAmount)} above program max ${money(p.maxLoan)}`);
    if (p.minLoan !== undefined && loanAmount < p.minLoan) {
      reasons.push(`Loan ${money(loanAmount)} below program min ${money(p.minLoan)}`);
    }
    if (isMultiFamily && !p.multiFamily) reasons.push('Program does not lend on 5+ unit properties');
    if (isSTR && !p.isSTR) reasons.push('Program does not accept short-term-rental income');
    if (isForeignNational && !p.foreignNational) reasons.push('Program does not lend to foreign nationals');

    return { program: p, offerLTV, eligible: reasons.length === 0, reasons };
  });

  // Best fit = most leverage available. Ties break toward the HIGHER DSCR floor
  // so a tie never quietly picks the loosest floor and flatters the cushion.
  const bestFit =
    evaluated
      .filter((e) => e.eligible)
      .sort((a, b) => (b.offerLTV ?? 0) - (a.offerLTV ?? 0) || b.program.dscrFloor - a.program.dscrFloor)[0] ?? null;

  const lenderRanking: LenderRankingEntry[] = evaluated.map((e, i) => ({
    rank: i + 1,
    lenderId: e.program.id,
    lenderName: e.program.name,
    fitTier: e.eligible ? ('STANDARD_FIT' as const) : ('DOES_NOT_MEET_GUIDELINES' as const),
    eligible: e.eligible,
    ineligibleReasons: e.reasons,
    // The engine-solved rate for THIS scenario. dscrPrograms.ts carries no
    // pricing at all, so this is not a lender quote and is labelled as such.
    estimatedRate: solvedRate,
    aey: solvedRate,
    totalCost60mo: 0,
    // No confidence model scores these programs. 0 is not "low confidence";
    // callers must tell the verdict the score is absent via
    // `bestLenderConfidence: null`, never by substituting a plausible number.
    confidenceScore: 0,
    counterpartyRisk: {
      lenderId: e.program.id,
      continuityScore: 0,
      knownDisruption: null,
      lastReportedStatus: 'NOT_ASSESSED',
      flag: 'WATCH' as const,
    },
    pppAllowed: false,
    pppStructure: 'not established',
    provenance: 'VERIFIED_PRIMARY' as const,
    provenanceWarnings: [
      `Eligibility grid pulled ${DSCR_PROGRAMS_AS_OF}. Rate shown is the engine-solved rate for this scenario, not a lender quote — the program data carries no pricing.`,
    ],
    sourceSnapshot: DSCR_PROGRAMS_AS_OF,
  }));

  return {
    evaluated,
    bestFit,
    lenderRanking,
    lenderMinDSCR: bestFit ? bestFit.program.dscrFloor : Number.NaN,
    ltvCap: bestFit ? bestFit.program.maxLTV : Number.NaN,
    lenderMinLoan: bestFit?.program.minLoan ?? Number.NaN,
    sourceSnapshot: DSCR_PROGRAMS_AS_OF,
  };
}
