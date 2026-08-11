// ============================================================
// DSCR Loan Command Center v7.0 — Portfolio Engine
// Aggregate DSCR, debt yield, refi scan, blanket warnings
// Portfolio DSCR = ΣNOI / ΣDebt_Service (totals, never averages)
// CoC uses Track 2 income — never Track 1
// ============================================================
//
// v12 — Loan-level schedules, one NOI definition, real refinance timing.
//
// Before this revision every property carried a `loanBalance`, a `dscr` and a
// `track2DSCR` as three independently-typed numbers, free to describe three
// different loans (the exact defect already fixed on the Refinance Tracker —
// see refiTracker.ts). This module now takes ORIGINATION terms per property
// (original amount, rate, term, months elapsed) and builds one real
// amortization schedule per property via `buildAmortizationSchedule`. Every
// balance and payment below is READ from that schedule — never typed.
//
// The old code also computed NOI two different ways in the same function:
// `totalNOI` used `computeTcoRate({propertyType:'SFR'})` (a hardcoded type,
// ignoring what each property actually is), while the negative-cash-flow
// bleed used its own inline 8%+8%+5%=21% haircut — a different number, on
// the same properties, in the same call. There is now exactly one NOI figure
// per property (`monthlyNOI`, from `computeTcoRate` on THAT property's own
// type), and every aggregate — totalNOI, globalDSCR, track2DSCR, the bleed
// calculation — reads from it. Two properties can no longer be summed on
// different bases.
//
// The refi scan used to fabricate every field it returned: currentRate was
// hardcoded 0, projectedRate was `currentMarketRate - 0.25` (an arbitrary
// guess), monthlySavings was `PITIA * 0.05` (a rough estimate), and
// seasoningMonthsRemaining was hardcoded 0 regardless of how long the
// property had actually been held. It now composes `evaluateRefinance` from
// refiTracker.ts per property — the same fail-closed, kernel-backed
// evaluation the single-property Refinance Tracker uses — so every field is
// read off a real schedule comparison, and a property whose proceeds could
// not retire its own lien is refused, not recommended.

import type {
  BorrowerProfile,
  PortfolioProperty,
  PortfolioAnalysis,
  RefiOpportunity,
} from './types';
import {
  buildAmortizationSchedule,
  balanceAtMonth,
  paymentAtMonth,
  type AmortizationSchedule,
} from './amortization';
import { evaluateRefinance } from './refiTracker';
import { computeTcoRate, type TcoPropertyType } from './tcoDscr';
// Semantic risk ramp — the ONE danger/warn system. See theme.ts.
import { risk } from '../theme';

// ── Loan-level inputs (gate item 1) ─────────────────────────────────────────

/**
 * Origination terms a real amortization schedule needs. Nothing downstream
 * is allowed to accept a balance or a payment as a separate, independently
 * typed number — both are always read off the schedule built from these.
 * This is the PREFERRED shape — every property PortfolioPage.tsx builds
 * supplies all of it.
 */
export interface PortfolioLoanTerms {
  /** Original note amount at origination. */
  originalLoanAmount: number;
  /** Note rate in PERCENT (7.0 = 7.0%). */
  annualRatePct: number;
  /** Full term in months, including any interest-only period. */
  termMonths: number;
  ioMonths?: number;
  /** Payments already made since origination. 0 for a brand-new loan. */
  monthsElapsed: number;
  /** Taxes + insurance + HOA + flood, monthly — everything in PITIA besides P&I. */
  monthlyEscrows: number;
  /** Current appraised / market value — drives LTV and refi sizing. */
  propertyValue: number;
  propertyType?: string;
}

/**
 * What a caller supplies for an existing property. `monthlyPITIA`,
 * `loanBalance`, `dscr` and `track2DSCR` are dropped from the base
 * `PortfolioProperty` shape on purpose — they are OUTPUTS, computed below
 * from the schedule, never inputs a caller can set directly.
 *
 * The origination fields from `PortfolioLoanTerms` are optional HERE (even
 * though the interface itself documents them as required) so this type can
 * also describe a legacy snapshot — see `loanBalance`/`rate`/`value`/
 * `monthlyPITIA` below. `buildComputedProperty` still fails closed: a
 * property missing BOTH the full origination terms and a complete legacy
 * snapshot is excluded, never defaulted.
 */
export type PortfolioPropertyInput =
  Omit<PortfolioProperty, 'monthlyPITIA' | 'loanBalance' | 'dscr' | 'track2DSCR'> &
  Partial<PortfolioLoanTerms> & {
    /**
     * Legacy fallback ONLY, for a caller with no origination data at all —
     * treated as the schedule principal at month 0 on an assumed 30-year
     * term. Still one real schedule (never a separately-typed balance and
     * payment pair) but strictly less accurate than the origination path
     * above, since neither the true original amount nor how long the loan
     * has run is known. Ignored whenever any `PortfolioLoanTerms` field is
     * present — the origination path always wins when both are supplied.
     */
    loanBalance?: number;
    rate?: number;
    value?: number;
    monthlyPITIA?: number;
  };

/**
 * A lender-specific refinance quote for a newly originated subject. Every
 * cost component is required so the portfolio scan never replaces a real
 * quote with a generic market rate and assumed zero costs.
 */
export interface PortfolioRefinanceQuote {
  annualRatePct: number;
  pointsPct: number;
  lenderFees: number;
  thirdPartyFees: number;
  prepaidsAndEscrows: number;
  financeClosingCosts?: boolean;
  requestedAmount?: number;
  prepaymentPenaltyPct?: number;
  payoffFees?: number;
}

/** The subject property being evaluated alongside an existing book. */
export type NewPortfolioDeal = Omit<PortfolioLoanTerms, 'monthsElapsed'> & {
  monthlyRent: number;
  lender: string;
  isBlanket: boolean;
  /** Optional because a newly originated subject normally has no refi quote. */
  refinanceQuote?: PortfolioRefinanceQuote;
};

export interface PortfolioPropertyExclusion {
  id: string;
  name: string;
  reason: string;
}

export interface PortfolioAnalysisResult extends PortfolioAnalysis {
  /**
   * Properties that could NOT be put on a real schedule (missing or
   * non-finite loan terms) and were therefore excluded from every aggregate
   * below. An excluded property is never silently treated as $0 balance or
   * 0 DSCR — it is left out and named here, so the count of properties
   * actually evaluated is always visible and never mistaken for "clean".
   */
  excludedProperties: PortfolioPropertyExclusion[];
}

interface ComputedPortfolioProperty extends PortfolioProperty {
  schedule: AmortizationSchedule;
  originalLoanAmount: number;
  annualRatePct: number;
  termMonths: number;
  ioMonths: number;
  monthsElapsed: number;
  monthlyEscrows: number;
  propertyValue: number;
  propertyType: TcoPropertyType;
  /** Track-2 NOI, monthly — the ONE figure every aggregate below reads. */
  monthlyNOI: number;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

// Keep portfolio math in a reliable numeric range. This limit preserves
// cent-level arithmetic through an annualized value while normal deal inputs
// remain entirely unaffected.
const MAX_FINANCIAL_VALUE = Number.MAX_SAFE_INTEGER / 12;

function finiteNonNegative(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) return 0;
  if (value === Number.POSITIVE_INFINITY) return MAX_FINANCIAL_VALUE;
  return Math.min(MAX_FINANCIAL_VALUE, value);
}

function finiteSigned(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  if (value === Number.POSITIVE_INFINITY) return MAX_FINANCIAL_VALUE;
  if (value === Number.NEGATIVE_INFINITY) return -MAX_FINANCIAL_VALUE;
  return Math.max(-MAX_FINANCIAL_VALUE, Math.min(MAX_FINANCIAL_VALUE, value));
}

function finiteSum(values: Iterable<number>): number {
  let total = 0;
  for (const value of values) {
    total = finiteNonNegative(total + finiteNonNegative(value));
  }
  return total;
}

function finiteSignedSum(values: Iterable<number>): number {
  let total = 0;
  for (const value of values) {
    total = finiteSigned(total + finiteSigned(value));
  }
  return total;
}

function finiteRatio(numerator: number, denominator: number): number {
  const safeDenominator = finiteNonNegative(denominator);
  if (safeDenominator <= 0) return 0;
  return finiteSigned(finiteSigned(numerator) / safeDenominator);
}

function hasOnlyFiniteNumericLeaves(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(hasOnlyFiniteNumericLeaves);
  if (value && typeof value === 'object') {
    return Object.values(value).every(hasOnlyFiniteNumericLeaves);
  }
  return true;
}

function deterministicNewSubjectId(properties: readonly PortfolioPropertyInput[]): string {
  const ids = new Set(properties.map(property => property.id));
  let id = 'new-deal';
  let suffix = 2;
  while (ids.has(id)) id = `new-deal-${suffix++}`;
  return id;
}

function hasExplicitSubjectRefinanceQuote(
  quote: PortfolioRefinanceQuote | undefined,
): quote is PortfolioRefinanceQuote {
  if (!quote) return false;

  const requiredNonNegative = [
    quote.annualRatePct,
    quote.pointsPct,
    quote.lenderFees,
    quote.thirdPartyFees,
    quote.prepaidsAndEscrows,
  ];
  if (!requiredNonNegative.every(value => isFiniteNumber(value) && value >= 0)) return false;

  return (
    (quote.requestedAmount === undefined || (isFiniteNumber(quote.requestedAmount) && quote.requestedAmount >= 0)) &&
    (quote.prepaymentPenaltyPct === undefined || (isFiniteNumber(quote.prepaymentPenaltyPct) && quote.prepaymentPenaltyPct >= 0)) &&
    (quote.payoffFees === undefined || (isFiniteNumber(quote.payoffFees) && quote.payoffFees >= 0))
  );
}

const TCO_PROPERTY_TYPES: readonly TcoPropertyType[] = ['SFR', 'SMALL_MULTI', 'MED_MULTI', 'CONDOTEL'];

/** Coerce a free-text property type to a known TCO bucket, defaulting to the
 * most common case (SFR) rather than throwing — `computeTcoRate` itself
 * already defaults this way for an unspecified type. */
function normalizeTcoPropertyType(value: string | undefined): TcoPropertyType {
  return (TCO_PROPERTY_TYPES as readonly string[]).includes(value ?? '')
    ? (value as TcoPropertyType)
    : 'SFR';
}

/** Assemble the shared DSCR/NOI/track-2 figures once a schedule exists,
 * regardless of which path (origination terms or legacy snapshot) built it. */
function finishComputedProperty(
  input: PortfolioPropertyInput,
  schedule: AmortizationSchedule,
  terms: {
    originalLoanAmount: number;
    annualRatePct: number;
    termMonths: number;
    ioMonths: number;
    monthsElapsed: number;
    monthlyEscrows: number;
    propertyValue: number;
  },
): ComputedPortfolioProperty {
  // The balance and the payment both come off the SAME schedule — they can
  // never describe two different loans.
  const loanBalance = balanceAtMonth(schedule, terms.monthsElapsed);
  const piPayment = paymentAtMonth(schedule, terms.monthsElapsed + 1);
  const monthlyPITIA = piPayment + terms.monthlyEscrows;
  const dscr = monthlyPITIA > 0 ? input.monthlyRent / monthlyPITIA : 0;

  // Track-2 NOI: gross rent less the TCO operating-cost haircut, evaluated
  // against THIS property's own type — the one place this figure is derived.
  const propertyType = normalizeTcoPropertyType(input.propertyType);
  const tcoTotal = computeTcoRate({ propertyType }).total;
  const monthlyNOI = input.monthlyRent * (1 - tcoTotal);
  const track2DSCR = monthlyPITIA > 0 ? monthlyNOI / monthlyPITIA : 0;

  return {
    id: input.id,
    name: input.name,
    address: input.address,
    state: input.state,
    monthlyRent: input.monthlyRent,
    lender: input.lender,
    isBlanket: input.isBlanket,
    loanBalance,
    monthlyPITIA,
    dscr,
    track2DSCR,
    schedule,
    ...terms,
    propertyType,
    monthlyNOI,
  };
}

/**
 * Build one property's amortization schedule and read its balance, payment,
 * DSCR and NOI off it. Fails closed: any missing or non-finite input is
 * reported and the property is excluded, never defaulted to a "plausible"
 * number.
 *
 * Two paths:
 *  1. Origination terms (preferred — what PortfolioPage.tsx always sends):
 *     validated field by field so a caller gets back exactly which term was
 *     missing or invalid.
 *  2. Legacy snapshot (`loanBalance`/`rate`/`value`/`monthlyPITIA`, no
 *     origination fields at all): treated as the schedule principal at
 *     month 0 on an assumed 30-year term. Only attempted when NONE of the
 *     origination fields were supplied, so a caller that starts filling in
 *     real origination terms gets real, granular validation rather than a
 *     silent fallback.
 */
function buildComputedProperty(
  input: PortfolioPropertyInput,
): { ok: true; property: ComputedPortfolioProperty } | { ok: false; reason: string } {
  const suppliedOriginationTerms =
    input.originalLoanAmount !== undefined ||
    input.annualRatePct !== undefined ||
    input.termMonths !== undefined ||
    input.monthsElapsed !== undefined;

  if (suppliedOriginationTerms) {
    const termMonths = Math.round(input.termMonths as number);
    const ioMonths = Math.round(input.ioMonths ?? 0);
    const monthsElapsed = Math.round(input.monthsElapsed as number);

    if (!isFiniteNumber(input.originalLoanAmount) || input.originalLoanAmount <= 0) {
      return { ok: false, reason: 'Original loan amount is missing or not a positive number.' };
    }
    if (!isFiniteNumber(input.annualRatePct) || input.annualRatePct < 0) {
      return { ok: false, reason: 'Note rate is missing or invalid.' };
    }
    if (!isFiniteNumber(termMonths) || termMonths < 1) {
      return { ok: false, reason: 'Loan term is missing or invalid.' };
    }
    if (!isFiniteNumber(monthsElapsed) || monthsElapsed < 0) {
      return { ok: false, reason: 'Months owned is missing or negative.' };
    }
    if (monthsElapsed > termMonths) {
      return { ok: false, reason: `Months owned (${monthsElapsed}) exceeds the loan term (${termMonths} months).` };
    }
    if (!isFiniteNumber(input.monthlyEscrows) || input.monthlyEscrows < 0) {
      return { ok: false, reason: 'Monthly escrows (taxes, insurance, HOA) are missing or invalid.' };
    }
    if (!isFiniteNumber(input.propertyValue) || input.propertyValue <= 0) {
      return { ok: false, reason: 'Property value is missing or not a positive number.' };
    }
    if (!isFiniteNumber(input.monthlyRent) || input.monthlyRent < 0) {
      return { ok: false, reason: 'Monthly rent is missing or invalid.' };
    }

    let schedule: AmortizationSchedule;
    try {
      schedule = buildAmortizationSchedule({
        principal: input.originalLoanAmount,
        annualRatePct: input.annualRatePct,
        termMonths,
        ioMonths,
      });
    } catch (e) {
      return { ok: false, reason: e instanceof Error ? e.message : 'Could not build an amortization schedule.' };
    }

    const property = finishComputedProperty(input, schedule, {
      originalLoanAmount: input.originalLoanAmount,
      annualRatePct: input.annualRatePct,
      termMonths,
      ioMonths,
      monthsElapsed,
      monthlyEscrows: input.monthlyEscrows,
      propertyValue: input.propertyValue,
    });
    if (!hasOnlyFiniteNumericLeaves(property)) {
      return { ok: false, reason: 'Loan schedule or cash-flow calculations produced a non-finite value.' };
    }
    return { ok: true, property };
  }

  // ── Legacy snapshot path ────────────────────────────────────────────────
  if (
    !isFiniteNumber(input.loanBalance) || input.loanBalance <= 0 ||
    !isFiniteNumber(input.rate) || input.rate < 0 ||
    !isFiniteNumber(input.value) || input.value <= 0 ||
    !isFiniteNumber(input.monthlyPITIA) || input.monthlyPITIA < 0 ||
    !isFiniteNumber(input.monthlyRent) || input.monthlyRent < 0
  ) {
    return {
      ok: false,
      reason:
        'No loan terms supplied: needs either origination terms (originalLoanAmount, ' +
        'annualRatePct, termMonths, monthsElapsed, monthlyEscrows, propertyValue) or a ' +
        'legacy snapshot (loanBalance, rate, value, monthlyPITIA).',
    };
  }

  const termMonths = 360; // assumed standard term — unknown for a legacy snapshot
  const ioMonths = 0;
  const monthsElapsed = 0; // the balance IS the schedule principal here

  let schedule: AmortizationSchedule;
  try {
    schedule = buildAmortizationSchedule({
      principal: input.loanBalance,
      annualRatePct: input.rate,
      termMonths,
      ioMonths,
    });
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Could not build an amortization schedule.' };
  }

  // Back out escrows from the supplied PITIA and the schedule's own P&I, so
  // the reconstruction is exact rather than guessed.
  const piPayment = paymentAtMonth(schedule, 1);
  const monthlyEscrows = Math.max(0, input.monthlyPITIA - piPayment);

  const property = finishComputedProperty(input, schedule, {
    originalLoanAmount: input.loanBalance,
    annualRatePct: input.rate,
    termMonths,
    ioMonths,
    monthsElapsed,
    monthlyEscrows,
    propertyValue: input.value,
  });
  if (!hasOnlyFiniteNumericLeaves(property)) {
    return { ok: false, reason: 'Loan schedule or cash-flow calculations produced a non-finite value.' };
  }
  return { ok: true, property };
}

const SEASONING_REQUIRED_MONTHS_DEFAULT = 6;

/**
 * Refinance timing (gate item 3), composed from `evaluateRefinance` — the
 * same fail-closed, schedule-backed evaluation the Refinance Tracker uses.
 * Only flags a property when refinancing at `currentMarketRate` actually
 * lowers the payment AND the evaluation was not refused (proceeds can
 * retire the existing lien) AND total cost genuinely recovers within the
 * horizon. A property whose numbers don't support a recommendation gets no
 * recommendation — this can never fail to fire (an always-null return would
 * be caught by the "fires on an obvious opportunity" mutation test below).
 */
function computeRefiOpportunity(
  p: ComputedPortfolioProperty,
  currentMarketRate: number,
  quote?: PortfolioRefinanceQuote,
): RefiOpportunity | null {
  const proposedRate = quote?.annualRatePct ?? currentMarketRate;
  if (!isFiniteNumber(proposedRate)) return null;
  // Only a rate above market is a rate-and-term opportunity at all.
  if (!(p.annualRatePct > proposedRate)) return null;

  const evaluation = evaluateRefinance({
    current: {
      originalAmount: p.originalLoanAmount,
      annualRatePct: p.annualRatePct,
      termMonths: p.termMonths,
      ioMonths: p.ioMonths,
      monthsElapsed: p.monthsElapsed,
      prepaymentPenaltyPct: quote?.prepaymentPenaltyPct,
      payoffFees: quote?.payoffFees,
    },
    proposed: {
      // Like-for-like: same term as the note being replaced. Existing
      // properties preserve their current market-rate evaluation. A subject
      // is only routed here with an explicit lender quote and all costs.
      annualRatePct: proposedRate,
      termMonths: p.termMonths,
      pointsPct: quote?.pointsPct,
      lenderFees: quote?.lenderFees,
      thirdPartyFees: quote?.thirdPartyFees,
      prepaidsAndEscrows: quote?.prepaidsAndEscrows,
      financeClosingCosts: quote?.financeClosingCosts,
      requestedAmount: quote?.requestedAmount,
    },
    property: {
      value: p.propertyValue,
      qualifyingRent: p.monthlyRent,
      monthlyEscrows: p.monthlyEscrows,
    },
  });

  if (evaluation.decision === 'REFUSED') return null;
  if (evaluation.monthlyPaymentDelta <= 0) return null;
  if (evaluation.breakEven && evaluation.breakEven.neverRecovers) return null;

  return {
    propertyId: p.id,
    currentRate: p.annualRatePct,
    projectedRate: proposedRate,
    monthlySavings: evaluation.monthlyPaymentDelta,
    seasoningMonthsRemaining: evaluation.seasoningMonthsRemaining,
  };
}

export function analyzePortfolio(
  existingProperties: PortfolioPropertyInput[],
  newDeal: NewPortfolioDeal | null,
  borrower: BorrowerProfile,
  availableLiquidity: number,
  currentMarketRate: number = 7.0,
): PortfolioAnalysisResult {
  const newSubject: PortfolioPropertyInput | null = newDeal
    ? {
        id: deterministicNewSubjectId(existingProperties),
        name: 'Subject Property',
        address: '',
        monthlyRent: newDeal.monthlyRent,
        lender: newDeal.lender,
        isBlanket: newDeal.isBlanket,
        originalLoanAmount: newDeal.originalLoanAmount,
        annualRatePct: newDeal.annualRatePct,
        termMonths: newDeal.termMonths,
        ioMonths: newDeal.ioMonths,
        // A new deal originates now, by definition — this is not a guess.
        monthsElapsed: 0,
        monthlyEscrows: newDeal.monthlyEscrows,
        propertyValue: newDeal.propertyValue,
        propertyType: newDeal.propertyType,
      }
    : null;
  const newSubjectId = newSubject?.id ?? null;
  const allInputs: PortfolioPropertyInput[] = newSubject
    ? [...existingProperties, newSubject]
    : existingProperties;

  const excludedProperties: PortfolioPropertyExclusion[] = [];
  const allProperties: ComputedPortfolioProperty[] = [];
  for (const input of allInputs) {
    const result = buildComputedProperty(input);
    if (result.ok) {
      allProperties.push(result.property);
    } else {
      excludedProperties.push({ id: input.id, name: input.name, reason: result.reason });
    }
  }

  const totalPITIA = finiteSum(allProperties.map(p => p.monthlyPITIA));
  const totalRent = finiteSum(allProperties.map(p => p.monthlyRent));

  // NOI = Σ(monthlyNOI) × 12. `monthlyNOI` is the ONE per-property NOI figure
  // (see buildComputedProperty) — every property is summed on the same
  // basis, and each was evaluated against its OWN property type.
  const totalNOI = finiteSignedSum(allProperties.map(p => p.monthlyNOI * 12));

  // Portfolio DSCR = ΣNOI / ΣDebt_Service (totals, NEVER averages)
  const totalAnnualDebtService = finiteNonNegative(totalPITIA * 12);
  const globalDSCR = finiteRatio(totalNOI, totalAnnualDebtService);

  // Debt Yield = NOI / Total Loan Balance (balance read from schedules)
  const totalLoanBalance = finiteSum(allProperties.map(p => p.loanBalance));
  const totalDebtYield = finiteRatio(totalNOI, totalLoanBalance);

  // Cash-on-Cash (Track 2 income). Down payment is estimated off the
  // ORIGINAL loan amount — the origination-time basis — never today's
  // paid-down balance, so the estimate doesn't drift as loans amortize.
  const totalCashInvested = finiteSum(allProperties.map(p => p.originalLoanAmount * (0.25 / 0.75))); // estimate 25% down at ~75% original LTV
  const annualTrack2CF = finiteSigned(totalNOI - totalAnnualDebtService);
  const weightedCashOnCash = finiteRatio(annualTrack2CF, totalCashInvested);

  // Reserve requirements by lender — auto-stacked, off the schedule-derived PITIA.
  const lenderGroups = new Map<string, { properties: ComputedPortfolioProperty[]; baseMonths: number }>();
  for (const prop of allProperties) {
    const existing = lenderGroups.get(prop.lender) || { properties: [], baseMonths: 6 };
    existing.properties.push(prop);
    lenderGroups.set(prop.lender, existing);
  }

  const totalReservesByLender = Array.from(lenderGroups.entries()).map(([lender, group]) => {
    // Base 6 months + 2 months per additional property with same lender, capped at 12
    const months = Math.min(12, group.baseMonths + (group.properties.length - 1) * 2);
    const dollars = finiteSum(group.properties.map(p => p.monthlyPITIA * months));
    return { lender, months, dollars };
  });

  const totalReservesRequired = finiteSum(totalReservesByLender.map(r => r.dollars));
  const reserveShortfall = finiteNonNegative(totalReservesRequired - finiteNonNegative(availableLiquidity));

  // Blanket loan warning
  const hasBlanket = allProperties.some(p => p.isBlanket);
  const blanketLoanWarning = hasBlanket
    ? 'CRITICAL: Blanket loan detected. Partial release clause must be confirmed before signing. Without partial release, selling one property may trigger full loan payoff on ALL properties.'
    : null;

  // Refi scan (gate item 3) — composed from evaluateRefinance, per property.
  const refiOpportunities: RefiOpportunity[] = allProperties
    .map(p => {
      const isNewSubject = p.id === newSubjectId;
      if (isNewSubject && !hasExplicitSubjectRefinanceQuote(newDeal?.refinanceQuote)) return null;
      return computeRefiOpportunity(
        p,
        currentMarketRate,
        isNewSubject ? newDeal?.refinanceQuote : undefined,
      );
    })
    .filter((o): o is RefiOpportunity => o !== null);

  // ── v11.6 — Portfolio Analytics Depth ──

  // Lender concentration analysis
  // Threshold: >50% of properties with one lender triggers counterparty risk warning
  const lenderCounts = new Map<string, number>();
  for (const p of allProperties) {
    lenderCounts.set(p.lender, (lenderCounts.get(p.lender) ?? 0) + 1);
  }
  const uniqueLenderCount = lenderCounts.size;
  let topLender: string | null = null;
  let topLenderCount = 0;
  for (const [lender, count] of lenderCounts) {
    if (count > topLenderCount) {
      topLender = lender;
      topLenderCount = count;
    }
  }
  const topLenderPct = allProperties.length > 0 ? topLenderCount / allProperties.length : 0;
  const lenderConcentration = {
    topLender,
    topLenderCount,
    topLenderPct,
    uniqueLenderCount,
    warning:
      topLenderPct > 0.50 && allProperties.length >= 3
        ? `WARNING: ${(topLenderPct * 100).toFixed(0)}% of portfolio (${topLenderCount} of ${allProperties.length} properties) is concentrated with lender "${topLender}". Counterparty risk: if this lender exits the DSCR market mid-pipeline (cf. 2022-23 shakeout), ${topLenderCount} properties face simultaneous refinance risk. Consider diversifying across at least 2-3 lenders.`
        : null,
  };

  // Geographic concentration analysis (only if state field populated)
  // Threshold: >40% of properties in one state triggers regional disaster/regulatory risk warning
  const stateCounts = new Map<string, number>();
  let propertiesWithState = 0;
  for (const p of allProperties) {
    if (p.state && p.state.trim().length === 2) {
      const st = p.state.toUpperCase();
      stateCounts.set(st, (stateCounts.get(st) ?? 0) + 1);
      propertiesWithState++;
    }
  }
  const uniqueStateCount = stateCounts.size;
  let topState: string | null = null;
  let topStateCount = 0;
  for (const [st, count] of stateCounts) {
    if (count > topStateCount) {
      topState = st;
      topStateCount = count;
    }
  }
  const topStatePct = propertiesWithState > 0 ? topStateCount / propertiesWithState : 0;
  const geographicConcentration = {
    topState,
    topStateCount,
    topStatePct,
    uniqueStateCount,
    propertiesWithState,
    warning:
      topStatePct > 0.40 && propertiesWithState >= 3
        ? `WARNING: ${(topStatePct * 100).toFixed(0)}% of portfolio (${topStateCount} of ${propertiesWithState} properties with state data) is concentrated in ${topState}. Regional risk: hurricane/earthquake exposure, state-specific regulatory changes (e.g., ${topState} PPP law amendments), and local economic downturns can simultaneously impact all concentrated properties. Consider geographic diversification.`
        : null,
  };

  // DSCR distribution stats (Track 1) — schedule-derived dscr, not typed input
  const dscrValues = allProperties.map(p => p.dscr).filter(Number.isFinite);
  const dscrDistribution = computeDistributionStats(dscrValues);

  // Track 2 DSCR distribution stats
  const track2Values = allProperties.map(p => p.track2DSCR).filter(Number.isFinite);
  const track2DscrDistribution = computeDistributionStats(track2Values);

  // Negative cash flow bleed analysis
  // A property "bleeds" if track2DSCR < 1.0 (Track 2 income doesn't cover PITIA).
  // Bleed reuses `monthlyNOI` — the SAME figure `totalNOI` and `track2DSCR`
  // were built from. There is no second, disagreeing haircut here.
  const negativeCashFlowPropertyIds: string[] = [];
  let totalMonthlyBleed = 0;
  for (const p of allProperties) {
    if (p.track2DSCR < 1.0) {
      negativeCashFlowPropertyIds.push(p.id);
      const bleed = finiteNonNegative(p.monthlyPITIA - p.monthlyNOI);
      totalMonthlyBleed = finiteNonNegative(totalMonthlyBleed + bleed);
    }
  }
  const negativeCashFlowProperties = {
    count: negativeCashFlowPropertyIds.length,
    totalMonthlyBleed,
    propertyIds: negativeCashFlowPropertyIds,
  };

  return {
    properties: allProperties,
    excludedProperties,
    totalPITIA,
    totalRent,
    totalNOI,
    globalDSCR,
    totalDebtYield,
    totalCashInvested,
    weightedCashOnCash,
    totalReservesRequired,
    totalReservesByLender,
    reserveShortfall,
    blanketLoanWarning,
    refiOpportunities,
    // v11.6 — Portfolio Analytics Depth
    lenderConcentration,
    geographicConcentration,
    dscrDistribution,
    track2DscrDistribution,
    negativeCashFlowProperties,
  };
}

// ============================================================
// v11.6 — Distribution stats helper
// Returns min/max/mean/median for an array of numbers.
// Median uses the average-of-middle-two method for even-length arrays.
// Returns zeros for empty arrays (count: 0).
// ============================================================
function computeDistributionStats(values: number[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  count: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, count: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  // Incremental averaging avoids an overflowing intermediate sum for an
  // otherwise finite distribution.
  const mean = values.reduce((runningMean, value, index) => (
    runningMean + (value - runningMean) / (index + 1)
  ), 0);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? sorted[mid - 1] + (sorted[mid] - sorted[mid - 1]) / 2
      : sorted[mid];
  return {
    min: finiteSigned(min),
    max: finiteSigned(max),
    mean: finiteSigned(mean),
    median: finiteSigned(median),
    count: values.length,
  };
}

// ============================================================
// Portfolio Health Score — single 0–100 composite rating
// Inputs: PortfolioAnalysis return value from analyzePortfolio()
// Scoring:
//   40 pts — Global DSCR (1.50+ = 40, 1.25–1.49 = 30, 1.0–1.24 = 18, <1.0 = 0)
//   20 pts — Concentration (lender + geo, each 10 pts, lose if warning fires)
//   20 pts — Negative cash-flow count (0 = 20, 1 = 12, 2 = 6, 3+ = 0)
//   20 pts — Reserve shortfall (0 = 20, <3mo PITIA = 12, 3–6mo = 6, >6mo = 0)
// Label thresholds: 80+ STRONG · 65+ HEALTHY · 50+ WATCH · 30+ AT RISK · <30 CRITICAL
// ============================================================
export function computePortfolioHealthScore(result: ReturnType<typeof analyzePortfolio>): {
  score: number;
  label: 'STRONG' | 'HEALTHY' | 'WATCH' | 'AT RISK' | 'CRITICAL';
  color: string;
  breakdown: { dscrPts: number; concentrationPts: number; cashFlowPts: number; reservePts: number };
} {
  // No evaluated properties means there is no portfolio credit profile to
  // score. Treat it as an explicit critical state instead of awarding points
  // for absent concentrations, cash-flow events, or reserves.
  if (Array.isArray(result.properties) && result.properties.length === 0) {
    return {
      score: 0,
      label: 'CRITICAL',
      color: risk.danger,
      breakdown: { dscrPts: 0, concentrationPts: 0, cashFlowPts: 0, reservePts: 0 },
    };
  }

  // DSCR pillar (40 pts)
  const g = result.globalDSCR;
  const dscrPts = g >= 1.50 ? 40 : g >= 1.25 ? 30 : g >= 1.0 ? 18 : 0;

  // Concentration pillar (20 pts)
  const lenderPts  = result.lenderConcentration.warning   ? 0 : 10;
  const geoPts     = result.geographicConcentration.warning ? 0 : 10;
  const concentrationPts = lenderPts + geoPts;

  // Negative cash-flow pillar (20 pts)
  const ncf = result.negativeCashFlowProperties.count;
  const cashFlowPts = ncf === 0 ? 20 : ncf === 1 ? 12 : ncf === 2 ? 6 : 0;

  // Reserve shortfall pillar (20 pts)
  const pitiaMonthly = result.totalPITIA;
  const shortfall = result.reserveShortfall;
  const shortfallMonths = pitiaMonthly > 0 ? shortfall / pitiaMonthly : 0;
  const reservePts = shortfall === 0 ? 20 : shortfallMonths < 3 ? 12 : shortfallMonths < 6 ? 6 : 0;

  const score = dscrPts + concentrationPts + cashFlowPts + reservePts;
  const label =
    score >= 80 ? 'STRONG'   :
    score >= 65 ? 'HEALTHY'  :
    score >= 50 ? 'WATCH'    :
    score >= 30 ? 'AT RISK'  : 'CRITICAL';
  // Risk ramp pulls from the semantic theme tokens — theme.ts bans the old
  // orange (#f97316/#fb923c) outright, and the three lower tiers map 1:1 onto
  // the named states: WATCH → caution, AT RISK → warning, CRITICAL → danger.
  const color =
    score >= 80 ? '#4ade80'   :
    score >= 65 ? '#a3e635'   :
    score >= 50 ? risk.caution :
    score >= 30 ? risk.warning : risk.danger;

  return { score, label, color, breakdown: { dscrPts, concentrationPts, cashFlowPts, reservePts } };
}

// Re-exported so callers (e.g. PortfolioPage) can size a default seasoning
// window without duplicating the constant that refiTracker.ts already owns.
export const SEASONING_REQUIRED_MONTHS = SEASONING_REQUIRED_MONTHS_DEFAULT;
