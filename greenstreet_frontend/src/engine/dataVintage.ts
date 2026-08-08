// ============================================================
// DATA VINTAGE REGISTRY — single source of truth for "how old is this number?"
// ============================================================
// Every dated dataset the engine ships is registered here with the date it was
// last verified AT SOURCE and how often it needs re-verification. Nothing in
// this file gates or changes any math: the registry documents, it does not
// enforce. It exists so that (a) the UI can honestly disclose data age and
// (b) dataVintage.test.ts fails the build when a dataset drifts past 2× its
// refresh cadence relative to REVIEWED_AS_OF.
//
// HOW TO USE THIS WHEN YOU RE-VERIFY DATA:
//   1. Update the underlying source file (engine.ts, lenders.ts, ...).
//   2. Update that dataset's `asOf` here to the new verification date.
//   3. Bump REVIEWED_AS_OF to the date you did the review pass.
// The staleness test compares (REVIEWED_AS_OF - asOf) against 2× cadence, so
// bumping REVIEWED_AS_OF without refreshing stale data makes the test fail
// louder, not quieter. That is intentional — it forces the conversation.
//
// DATE ACCURACY: every `asOf` below is copied from a date documented in the
// source file itself (header comment, `verifiedDate`, `asOfDate`, `lastVerified`,
// or an exported constant). Where a dataset carries no date in source, `asOf`
// is `null` and the entry is treated as permanently stale — see insuranceTable.
// ============================================================

/**
 * The date of the team's last data-review pass. Bump this when datasets are
 * re-verified. Every staleness computation is relative to this constant rather
 * than `Date.now()` so CI results are deterministic and reviewable in a diff.
 */
export const REVIEWED_AS_OF = '2026-08-08';

export type DataVintageKey =
  | 'rateAnchor'
  | 'sofrModel'
  | 'lenderDatabase'
  | 'statePppLaws'
  | 'dscrPrograms'
  | 'taxRules'
  | 'insuranceTable'
  | 'reassessmentRules'
  | 'indexedThresholds';

/**
 * How confident we are in the `asOf` date itself.
 *  - `documented`  — the date is written in the source file.
 *  - `undocumented` — the source file carries no date at all; `asOf` is null
 *                     and the entry always reports stale.
 */
export type AsOfConfidence = 'documented' | 'undocumented';

export interface DataVintageEntry {
  /** Stable machine key. */
  key: DataVintageKey;
  /** Short human label for UI / reports. */
  label: string;
  /**
   * ISO date (YYYY-MM-DD) the data was last verified at source, or `null` when
   * the source file documents no date. Where a source records only a month
   * (e.g. `'2026-06'`) the first of that month is used.
   */
  asOf: string | null;
  asOfConfidence: AsOfConfidence;
  /** How often this dataset needs re-verification, in days. */
  refreshCadenceDays: number;
  /** Repo-relative file(s) this entry describes. */
  sourceFile: string;
  /** Where the numbers came from, and what the date in source actually says. */
  source: string;
  /** Anything a reviewer needs to know before trusting or refreshing this. */
  notes: string;
}

// Cadence buckets, named so the intent survives edits.
const MONTHLY = 30;
const QUARTERLY = 90;
const SEMIANNUAL = 180;
const ANNUAL = 365;

export const DATA_VINTAGE: readonly DataVintageEntry[] = [
  {
    key: 'rateAnchor',
    label: 'DSCR rate anchor & pricing grid',
    asOf: '2026-06-17',
    asOfConfidence: 'documented',
    refreshCadenceDays: MONTHLY,
    sourceFile: 'src/engine/engine.ts',
    source:
      'engine.ts §6 "RATE CALIBRATION — JUNE 2026 (verified 2026-06-17)"; ' +
      'BASE_RATE_ANCHOR = 6.125% par at 740 FICO / 70% LTV.',
    notes:
      'Also fixes TYPICAL_SPREAD (0.875) and FULL_MARKET_SPREAD (4.625, ~10.75%), the ' +
      'RATE_FLOOR_PCT 5.0 / RATE_CEILING_PCT 12.0 bounds, and the "June 2026" dateStamp ' +
      'returned on tripleRate. The lender FICO-overlay list in the same section is dated ' +
      'June 2026 as well. Rate data ages fastest of anything here — monthly cadence.',
  },
  {
    key: 'sofrModel',
    label: 'SOFR / Treasury market snapshot & Vasicek calibration',
    asOf: '2026-06-17',
    asOfConfidence: 'documented',
    refreshCadenceDays: MONTHLY,
    sourceFile: 'src/engine/armResetEngine.ts, src/engine/monteCarloRatePath.ts',
    source:
      'armResetEngine.ts CURRENT_MARKET_SNAPSHOT.asOfDate = "2026-06-17" (FRED DGS10 Jun 15-17; ' +
      'FRB H.15 Jun 16; Northmarq Jun 2026). monteCarloRatePath.ts DEFAULT_VASICEK_PARAMS: ' +
      'r0 = 3.59% (Jun 17 2026 SOFR), θ = 3.50% (Jun 2026 Fed SEP median long-run neutral).',
    notes:
      'σ = 1.20% and κ are calibrated to 2020-2025 SOFR realized vol — that calibration window ' +
      'is a modelling choice with a longer half-life than the r0/θ levels, but r0 and the ' +
      'index snapshot (5yr UST 4.26%, 30-day SOFR 3.59%, Fed funds eff 3.62%, Freddie 30yr ' +
      '6.53%) are point-in-time and stale within weeks.',
  },
  {
    key: 'lenderDatabase',
    label: 'Lender profile database',
    asOf: '2026-06-01',
    asOfConfidence: 'documented',
    refreshCadenceDays: QUARTERLY,
    sourceFile: 'src/engine/lenders.ts',
    source:
      'lenders.ts per-lender effectiveDate / verifiedDate = "2026-06-01"; per-field ' +
      'provenance datapoints stamped "2026-06"; sourceSnapshot cites May 2026 production data.',
    notes:
      'Mixed provenance by design — VERIFIED_PRIMARY (lender sites), VERIFIED_SECONDARY ' +
      '(3rd-party review) and explicit UNVERIFIED fields coexist and are labelled per-field. ' +
      'Refreshing the file means re-pulling rate sheets, not just bumping the date.',
  },
  {
    key: 'statePppLaws',
    label: 'State prepayment-penalty law matrix',
    asOf: '2026-01-01',
    asOfConfidence: 'documented',
    refreshCadenceDays: SEMIANNUAL,
    sourceFile: 'src/engine/statePppLaws.ts',
    source:
      'statePppLaws.ts per-state lastVerified fields. Two cohorts exist: 35 entries at ' +
      '"2026-06" and 13 entries at "2026-01". This registry records the OLDEST (2026-01) ' +
      'because the matrix is only as current as its least-recently-checked state.',
    notes:
      'The 2026-06 cohort covers the MN HF 3437 change (enacted Apr 23 2026, effective ' +
      'Aug 1 2026) which narrows Minn. Stat. §58.137 to consumer-purpose loans. States still ' +
      'at 2026-01 have not been re-read since January. WA ARM ban remains UNVERIFIED and is ' +
      'deliberately not encoded as a blanket rule.',
  },
  {
    key: 'dscrPrograms',
    label: 'Greenstreet / Cake DSCR program matrices',
    asOf: '2026-06-24',
    asOfConfidence: 'documented',
    refreshCadenceDays: QUARTERLY,
    sourceFile: 'src/data/dscrPrograms.ts',
    source:
      'dscrPrograms.ts header: "pulled 2026-06-24" from caketpo.com/products (DSCR tab); ' +
      'exported as DSCR_PROGRAMS_AS_OF = "Jun 24, 2026".',
    notes:
      'Full FICO × loan-amount LTV grids per program, used by Deal Analyzer, Lender Intel and ' +
      'Rate Quiz. Wholesale matrices move without notice — treat any grid cell older than a ' +
      'quarter as indicative only.',
  },
  {
    key: 'taxRules',
    label: 'Federal tax rules (OBBBA bonus depreciation, §1250 recapture)',
    asOf: '2026-06-01',
    asOfConfidence: 'documented',
    refreshCadenceDays: ANNUAL,
    sourceFile: 'src/engine/taxEngine.ts',
    source:
      'taxEngine.ts header: "SOURCES (verified June 2026)". OBBBA_EFFECTIVE_DATE = "2025-01-19" ' +
      'is the statutory acquisition cutoff (100% bonus depreciation, permanent), not a ' +
      'verification date; IRC §168(k).',
    notes:
      'Statute-driven, so it changes on a legislative clock rather than a market one — annual ' +
      'cadence, but re-check immediately on any federal tax bill. The phase-down ladder ' +
      '(60/40/20%) for pre-2025-01-19 acquisitions is TCJA legacy and stable.',
  },
  {
    key: 'insuranceTable',
    label: 'State property-insurance base-rate table',
    asOf: null,
    asOfConfidence: 'undocumented',
    refreshCadenceDays: ANNUAL,
    sourceFile: 'src/engine/insuranceEstimate.ts',
    source:
      'insuranceEstimate.ts INSURANCE_BASE_RATE_PER_1000 — described only as ' +
      '"NAIC/Bankrate-sourced". No pull date, vintage year, or citation date appears anywhere ' +
      'in the file, and repo history is squashed so commit dates prove nothing.',
    notes:
      'DELIBERATELY UNDATED: `asOf` is null rather than guessed, so this entry always reports ' +
      'stale until someone re-pulls the NAIC/Bankrate table and stamps a real date. Insurance ' +
      'has more DSCR impact per dollar than the interest rate, so an undated table is the ' +
      'highest-value fix in this registry.',
  },
  {
    key: 'reassessmentRules',
    label: 'State property-tax reassessment rules',
    asOf: '2026-06-01',
    asOfConfidence: 'documented',
    refreshCadenceDays: ANNUAL,
    sourceFile: 'src/engine/reassessmentEngine.ts',
    source:
      'reassessmentEngine.ts "VERIFIED STATE REASSESSMENT RULES (June 2026)"; every state rule ' +
      'carries asOfDate: "2026-06". Sources: CA BOE (Prop 13), TX Comptroller, FL DOR ' +
      '(§193.155 / §193.1554), NJ Treasury, NY ORPTS, IL DOR.',
    notes:
      'The national-median fallback row is VERIFIED_SECONDARY, not primary. NJ carries a ' +
      'flagged caveat about post-2024 AFFH-driven revaluation changes still pending.',
  },
  {
    key: 'indexedThresholds',
    label: 'PA / OH indexed PPP loan thresholds',
    asOf: '2026-01-01',
    asOfConfidence: 'documented',
    refreshCadenceDays: ANNUAL,
    sourceFile: 'src/engine/statePppLaws.ts',
    source:
      'statePppLaws.ts PA_PPP_THRESHOLD_2026 = $319,777 and OH_PPP_THRESHOLD_2026 = $116,356, ' +
      'THRESHOLD_YEAR = 2026; PA/OH entries carry lastVerified "2026-01".',
    notes:
      'Tracked separately from statePppLaws because these are ANNUALLY INDEXED dollar figures ' +
      'with a hard calendar trigger — the source file says "Annually re-confirmed each January ' +
      'per Part E.3". A January reconfirmation is required even if no statute changed.',
  },
] as const;

/** Lookup by key. Throws on an unknown key so typos surface at the call site. */
export function getDataVintage(key: DataVintageKey): DataVintageEntry {
  const entry = DATA_VINTAGE.find((e) => e.key === key);
  if (!entry) throw new Error(`Unknown data vintage key: ${key}`);
  return entry;
}

/** Parse an ISO YYYY-MM-DD date at UTC midnight. Returns NaN-date on garbage. */
function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Whole days between two ISO dates (b - a). */
export function daysBetween(aIso: string, bIso: string): number {
  const a = parseIsoDate(aIso).getTime();
  const b = parseIsoDate(bIso).getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * Age in days of an entry relative to `asOfIso` (defaults to REVIEWED_AS_OF).
 * Undated entries return `Infinity` — they can never be shown as fresh.
 */
export function ageInDays(entry: DataVintageEntry, asOfIso: string = REVIEWED_AS_OF): number {
  if (entry.asOf === null) return Infinity;
  return daysBetween(entry.asOf, asOfIso);
}

/**
 * Entries whose age exceeds their refresh cadence as of `now`.
 * Undated entries always appear. Sorted oldest-first.
 */
export function staleDatasets(now: Date = new Date()): DataVintageEntry[] {
  const nowIso = now.toISOString().slice(0, 10);
  return DATA_VINTAGE
    .filter((e) => ageInDays(e, nowIso) > e.refreshCadenceDays)
    .slice()
    .sort((a, b) => ageInDays(b, nowIso) - ageInDays(a, nowIso));
}

/**
 * Oldest documented `asOf` across the registry, as an ISO date string.
 * Undated entries are skipped (they have no date to compare). Returns null only
 * if nothing in the registry is dated.
 */
export function oldestAsOf(): string | null {
  const dated = DATA_VINTAGE.map((e) => e.asOf).filter((d): d is string => d !== null);
  if (dated.length === 0) return null;
  return dated.reduce((oldest, d) => (d < oldest ? d : oldest));
}

/** Human month-year label, e.g. "2026-01-01" → "January 2026". */
export function formatVintage(iso: string): string {
  const d = parseIsoDate(iso);
  return `${d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;
}

/**
 * ISO `asOf` for one dataset. Throws for undated datasets, so a caller that
 * needs a real date can never silently stamp an output with a fabricated one.
 */
export function vintageAsOf(key: DataVintageKey): string {
  const { asOf } = getDataVintage(key);
  if (asOf === null) {
    throw new Error(`Data vintage "${key}" is undated — no asOf date exists to stamp.`);
  }
  return asOf;
}

/**
 * Month-year label for one dataset, e.g. `vintageLabel('rateAnchor')` → "June 2026".
 * Used by the engine to stamp outputs from the registry instead of a loose literal.
 */
export function vintageLabel(key: DataVintageKey): string {
  const { asOf } = getDataVintage(key);
  return asOf ? formatVintage(asOf) : 'undated';
}

/**
 * The single date the UI discloses. Deliberately the OLDEST dated entry rather
 * than the newest: the disclosure covers rates, lender terms AND state rules
 * together, so it must be honest about the weakest link in that set.
 */
export function marketDataAsOfLabel(): string {
  const oldest = oldestAsOf();
  return oldest ? formatVintage(oldest) : 'an undocumented date';
}

/** The one sentence shown to users. Kept here so every surface says the same thing. */
export const DATA_VINTAGE_DISCLOSURE =
  `Market data as of ${marketDataAsOfLabel()}. Rates, lender terms, and state rules are ` +
  `dated research — verify with current sources before relying on them.`;
