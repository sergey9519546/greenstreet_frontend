// ============================================================
// DSCR Deal Desk v11.11 — Lender Match Score Engine
// Ranks lenders 0-100 with weighted factor breakdown for
// transparent "best lender for THIS deal" recommendation.
// ============================================================
//
// DESIGN PHILOSOPHY
// ─────────────────
// Existing matchLenders() returns fitTier + reasons. This engine
// sits on top of that output and adds:
//   (a) A numeric 0-100 score per lender
//   (b) A 6-factor weighted breakdown showing WHERE the score came from
//   (c) A clear top-3 "best fit" recommendation
//   (d) Provenance-aware (lenders with VERIFIED_PRIMARY data score higher)
//
// FACTOR WEIGHTS (sum to 1.0)
// ──────────────────────────
//   RATE_COMPETITIVENESS  : 25%  — lower typical rate wins
//   DSCR_HEADROOM         : 20%  — cushion vs lender min DSCR
//   RESERVE_BURDEN        : 15%  — fewer months of reserves wins
//   PROVENANCE_CONFIDENCE : 15%  — VERIFIED_PRIMARY + confidence score
//   LTV_FIT               : 15%  — sweet-spot 65-70% LTV
//   FLEXIBILITY           : 10%  — no-ratio, foreign national, STR, prepay menu
//
// TIER CLASSIFICATION
// ───────────────────
//   TOP_PICK : score ≥ 80
//   STRONG   : score ≥ 65
//   VIABLE   : score ≥ 50
//   WEAK     : score < 50 (or ineligible)
// ============================================================

import type {
  LenderFitResult,
  LenderProgram,
  LenderMatchScore,
  LenderMatchScoreResult,
  LenderScoreFactor,
  LenderScoreFactorKey,
  LenderScoreTier,
  LoanStructure,
  BorrowerProfile,
  RentalStrategy,
  ProvenanceLabel,
} from './types';
import { LENDERS, getLenderById } from './lenders';

// ============================================================
// WEIGHTS — sum to 1.0
// ============================================================

const FACTOR_WEIGHTS: Record<LenderScoreFactorKey, number> = {
  RATE_COMPETITIVENESS: 0.25,
  DSCR_HEADROOM: 0.20,
  RESERVE_BURDEN: 0.15,
  PROVENANCE_CONFIDENCE: 0.15,
  LTV_FIT: 0.15,
  FLEXIBILITY: 0.10,
};

const FACTOR_LABELS: Record<LenderScoreFactorKey, string> = {
  RATE_COMPETITIVENESS: 'Rate Competitiveness',
  DSCR_HEADROOM: 'DSCR Headroom',
  RESERVE_BURDEN: 'Reserve Burden',
  PROVENANCE_CONFIDENCE: 'Provenance Confidence',
  LTV_FIT: 'LTV Fit',
  FLEXIBILITY: 'Flexibility',
};

// LTV sweet spot — gives best rate + maximum cushion
const LTV_SWEET_SPOT_CENTER = 67.5;  // midpoint of 65-70% band
const LTV_SWEET_SPOT_HALF_WIDTH = 2.5;  // ±2.5% gets full score

// ============================================================
// MAIN ENTRY POINT
// ============================================================

/**
 * Score every lender in fitResults with a 0-100 weighted match score.
 *
 * @param fitResults Output of matchLenders() — eligibility + DSCR + reserves per lender
 * @param loan       Loan structure (for LTV reference)
 * @param borrower   Borrower profile (unused for now, but reserved for future FICO-based scoring)
 * @param strategy   Rental strategy (for STR flexibility weighting)
 * @returns          LenderMatchScoreResult with all scores + top picks
 */
export function scoreLenderMatch(
  fitResults: LenderFitResult[],
  loan: LoanStructure,
  borrower: BorrowerProfile,
  strategy: RentalStrategy,
): LenderMatchScoreResult {
  // ── Step 1: Determine rate benchmark across ELIGIBLE lenders ──
  const eligibleResults = fitResults.filter(r => r.eligible);
  const eligibleRates = eligibleResults.map(r => r.estimatedRate.typical);
  const minRate = eligibleRates.length > 0 ? Math.min(...eligibleRates) : 0;
  const maxRate = eligibleRates.length > 0 ? Math.max(...eligibleRates) : 0;
  const rateSpread = maxRate - minRate;
  // Median = benchmark for "typical market rate"
  const sortedRates = [...eligibleRates].sort((a, b) => a - b);
  const marketRateBenchmark = sortedRates.length > 0
    ? (sortedRates.length % 2 === 1
        ? sortedRates[Math.floor(sortedRates.length / 2)]
        : (sortedRates[sortedRates.length / 2 - 1] + sortedRates[sortedRates.length / 2]) / 2)
    : 0;

  // ── Step 2: Score each lender ──
  const scores: LenderMatchScore[] = fitResults.map((fit, idx) => {
    const lender = getLenderById(fit.lenderId);
    if (!lender) {
      return buildMissingLenderScore(fit);
    }
    return scoreOneLender(fit, lender, loan, strategy, minRate, maxRate, rateSpread);
  });

  // ── Step 3: Sort — eligible first by score desc, ineligible at bottom ──
  scores.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return b.totalScore - a.totalScore;
  });

  // ── Step 4: Assign rankAmongEligible ──
  let rank = 0;
  for (const s of scores) {
    if (s.eligible) {
      rank++;
      s.rankAmongEligible = rank;
    } else {
      s.rankAmongEligible = null;
    }
  }

  // ── Step 5: Pick top 3 eligible ──
  const topPicks = scores.filter(s => s.eligible).slice(0, 3);

  // ── Step 6: Build overall summary ──
  const summary = buildOverallSummary(topPicks, eligibleResults.length, marketRateBenchmark);

  return {
    scores,
    topPicks,
    marketRateBenchmark: Math.round(marketRateBenchmark * 1000) / 1000,
    fieldCount: eligibleResults.length,
    summary,
  };
}

// ============================================================
// PER-LENDER SCORING
// ============================================================

function scoreOneLender(
  fit: LenderFitResult,
  lender: LenderProgram,
  loan: LoanStructure,
  strategy: RentalStrategy,
  minRate: number,
  maxRate: number,
  rateSpread: number,
): LenderMatchScore {
  // ── Compute each factor ──
  const rateFactor = computeRateCompetitiveness(fit, minRate, maxRate, rateSpread);
  const dscrFactor = computeDSCRHeadroom(fit, lender);
  const reserveFactor = computeReserveBurden(fit);
  const provenanceFactor = computeProvenanceConfidence(lender);
  const ltvFactor = computeLTVFit(fit, lender, loan);
  const flexibilityFactor = computeFlexibility(lender, strategy);

  const factors: LenderScoreFactor[] = [
    rateFactor,
    dscrFactor,
    reserveFactor,
    provenanceFactor,
    ltvFactor,
    flexibilityFactor,
  ];

  // ── Total score = sum of weighted scores (0 if ineligible) ──
  const totalScore = fit.eligible
    ? Math.round(factors.reduce((sum, f) => sum + f.weightedScore, 0) * 10) / 10
    : 0;

  // ── Tier classification ──
  const tier = fit.eligible ? classifyTier(totalScore) : 'WEAK';

  // ── Top reasons (top 3 factors with rawScore ≥ 70) ──
  const topReasons = buildTopReasons(factors, fit);

  // ── Top concerns (factors with rawScore < 50 + ineligibility reasons) ──
  const topConcerns = buildTopConcerns(factors, fit);

  // ── Recommendation text ──
  const recommendationText = buildRecommendationText(fit, tier, totalScore, topReasons, topConcerns);

  return {
    lenderId: fit.lenderId,
    lenderName: fit.lenderName,
    eligible: fit.eligible,
    totalScore,
    tier,
    factors,
    topReasons,
    topConcerns,
    rankAmongEligible: null,  // will be set by caller
    recommendationText,
  };
}

// ============================================================
// FACTOR 1: RATE COMPETITIVENESS (25%)
// Lower typical rate wins. Normalized across eligible lenders.
// ============================================================

function computeRateCompetitiveness(
  fit: LenderFitResult,
  minRate: number,
  maxRate: number,
  rateSpread: number,
): LenderScoreFactor {
  const weight = FACTOR_WEIGHTS.RATE_COMPETITIVENESS;
  const thisRate = fit.estimatedRate.typical;

  let rawScore: number;
  let detail: string;

  if (!fit.eligible) {
    rawScore = 0;
    detail = `Ineligible — would have been scored at ${thisRate.toFixed(3)}% typical`;
  } else if (rateSpread < 0.001) {
    // No spread → rate doesn't differentiate
    rawScore = 100;
    detail = `Typical ${thisRate.toFixed(3)}% — tied with all eligible lenders (no spread)`;
  } else {
    // Linear normalization: minRate → 100, maxRate → 0
    rawScore = Math.round(100 * (maxRate - thisRate) / rateSpread);
    // Bonus clamp to [0, 100]
    rawScore = Math.max(0, Math.min(100, rawScore));
    const percentileRank = rawScore;  // 100 = best
    detail = `Typical ${thisRate.toFixed(3)}% — ${percentileRank >= 75 ? 'top quartile' : percentileRank >= 50 ? 'above median' : percentileRank >= 25 ? 'below median' : 'bottom quartile'} (range ${minRate.toFixed(3)}–${maxRate.toFixed(3)}%)`;
  }

  return {
    key: 'RATE_COMPETITIVENESS',
    label: FACTOR_LABELS.RATE_COMPETITIVENESS,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail,
  };
}

// ============================================================
// FACTOR 2: DSCR HEADROOM (20%)
// Cushion above lender min DSCR. No-ratio lenders get max score.
// ============================================================

function computeDSCRHeadroom(
  fit: LenderFitResult,
  lender: LenderProgram,
): LenderScoreFactor {
  const weight = FACTOR_WEIGHTS.DSCR_HEADROOM;
  const minDSCR = lender.minDSCR.value as number;
  const noRatio = lender.noRatioAvailable.value === true;
  const noRatioProvenance = lender.noRatioAvailable.provenance;

  let rawScore: number;
  let detail: string;

  if (!fit.eligible) {
    rawScore = 0;
    detail = `Ineligible — DSCR ${fit.track1DSCR.toFixed(3)} vs min ${minDSCR.toFixed(2)}`;
  } else if (noRatio) {
    if (noRatioProvenance === 'UNVERIFIED') {
      rawScore = 60;
      detail = `No-ratio option available (UNVERIFIED — assume conservative)`;
    } else {
      rawScore = 100;
      detail = `No-ratio option available (${noRatioProvenance}) — no DSCR constraint`;
    }
  } else {
    const headroom = fit.track1DSCR - minDSCR;
    // At headroom=0: 50; +0.50: 100; -0.50: 0
    rawScore = Math.round(50 + headroom * 100);
    rawScore = Math.max(0, Math.min(100, rawScore));
    detail = `DSCR ${fit.track1DSCR.toFixed(3)} vs min ${minDSCR.toFixed(2)} — cushion ${headroom >= 0 ? '+' : ''}${headroom.toFixed(3)}`;
  }

  return {
    key: 'DSCR_HEADROOM',
    label: FACTOR_LABELS.DSCR_HEADROOM,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail,
  };
}

// ============================================================
// FACTOR 3: RESERVE BURDEN (15%)
// Fewer months of required reserves wins (less capital tied up).
// ============================================================

function computeReserveBurden(fit: LenderFitResult): LenderScoreFactor {
  const weight = FACTOR_WEIGHTS.RESERVE_BURDEN;

  // Need to back out monthlyPITIA from requiredReserves & reserveMonths.
  // The matchLenders code uses reserveMonths × pitia = requiredReserves.
  // We can't reverse-engineer reserveMonths without the lender's reserve rule,
  // so we use a heuristic: estimate months from requiredReserves magnitude.
  // Better: directly use requiredReserves normalized across lenders.

  let rawScore: number;
  let detail: string;

  if (!fit.eligible) {
    rawScore = 0;
    detail = `Ineligible — required reserves $${fit.requiredReserves.toLocaleString()}`;
  } else {
    // Heuristic scoring: $0 reserves = 100, $50K = 50, $100K+ = 0
    // This is a proxy for "capital efficiency" — lower reserves = more capital available for next deal
    const reserves = fit.requiredReserves;
    rawScore = Math.round(100 - (reserves / 1000) * 1.0);  // $1K = -1 point
    rawScore = Math.max(0, Math.min(100, rawScore));
    detail = `Required reserves $${reserves.toLocaleString()} — ${reserves < 10000 ? 'minimal' : reserves < 25000 ? 'moderate' : reserves < 50000 ? 'elevated' : 'heavy'} capital lockup`;
  }

  return {
    key: 'RESERVE_BURDEN',
    label: FACTOR_LABELS.RESERVE_BURDEN,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail,
  };
}

// ============================================================
// FACTOR 4: PROVENANCE CONFIDENCE (15%)
// VERIFIED_PRIMARY data + confidence score.
// ============================================================

function computeProvenanceConfidence(lender: LenderProgram): LenderScoreFactor {
  const weight = FACTOR_WEIGHTS.PROVENANCE_CONFIDENCE;
  const baseScore = lender.confidenceScore;
  const provenance = lender.sourceType;

  let adjustment = 0;
  let provenanceNote = '';
  if (provenance === 'VERIFIED_PRIMARY') {
    adjustment = 5;
    provenanceNote = ' (+5 VERIFIED_PRIMARY)';
  } else if (provenance === 'VERIFIED_SECONDARY') {
    adjustment = 0;
    provenanceNote = ' (±0 VERIFIED_SECONDARY)';
  } else if (provenance === 'UNVERIFIED') {
    adjustment = -15;
    provenanceNote = ' (-15 UNVERIFIED)';
  }

  let rawScore = baseScore + adjustment;
  rawScore = Math.max(0, Math.min(100, rawScore));

  const detail = `Confidence ${baseScore}/100${provenanceNote} — ${lender.confidenceBand}`;

  return {
    key: 'PROVENANCE_CONFIDENCE',
    label: FACTOR_LABELS.PROVENANCE_CONFIDENCE,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail,
  };
}

// ============================================================
// FACTOR 5: LTV FIT (15%)
// Sweet-spot 65-70% LTV (best rate + max cushion).
// ============================================================

function computeLTVFit(
  fit: LenderFitResult,
  lender: LenderProgram,
  loan: LoanStructure,
): LenderScoreFactor {
  const weight = FACTOR_WEIGHTS.LTV_FIT;
  const dealLTV = loan.ltv;
  const maxLTV = lender.maxLTV.value as number;

  let rawScore: number;
  let detail: string;

  if (!fit.eligible) {
    rawScore = 0;
    detail = `Ineligible — LTV ${dealLTV}% vs max ${maxLTV}%`;
  } else {
    // Distance from sweet spot
    const delta = Math.abs(dealLTV - LTV_SWEET_SPOT_CENTER);
    if (delta <= LTV_SWEET_SPOT_HALF_WIDTH) {
      // Inside sweet spot 65-70%
      rawScore = 100;
      detail = `LTV ${dealLTV}% — inside 65-70% sweet spot (best rate tier)`;
    } else {
      // Linear decay: -4 points per 1% away from sweet spot edge
      const excess = delta - LTV_SWEET_SPOT_HALF_WIDTH;
      rawScore = Math.round(100 - excess * 4);
      rawScore = Math.max(0, Math.min(100, rawScore));
      const direction = dealLTV > LTV_SWEET_SPOT_CENTER ? 'above' : 'below';
      const cushion = maxLTV - dealLTV;
      detail = `LTV ${dealLTV}% — ${excess.toFixed(1)}% ${direction} sweet spot, ${cushion.toFixed(0)}% cushion to lender max ${maxLTV}%`;
    }
  }

  return {
    key: 'LTV_FIT',
    label: FACTOR_LABELS.LTV_FIT,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail,
  };
}

// ============================================================
// FACTOR 6: FLEXIBILITY (10%)
// No-ratio, foreign national, STR support, prepay menu, entity support.
// ============================================================

function computeFlexibility(
  lender: LenderProgram,
  strategy: RentalStrategy,
): LenderScoreFactor {
  const weight = FACTOR_WEIGHTS.FLEXIBILITY;

  let score = 0;
  const components: string[] = [];

  // No-ratio option (most flexibility — DSCR not binding)
  if (lender.noRatioAvailable.value === true) {
    const provenance = lender.noRatioAvailable.provenance;
    if (provenance !== 'UNVERIFIED') {
      score += 30;
      components.push('+30 no-ratio (verified)');
    } else {
      score += 15;
      components.push('+15 no-ratio (UNVERIFIED)');
    }
  }

  // Foreign national support
  if (lender.foreignNationalAllowed.value === true) {
    score += 20;
    components.push('+20 foreign national');
  }

  // STR support (extra weight if strategy is STR)
  if (lender.strPolicy.allowed) {
    const strBonus = strategy === 'STR' ? 25 : 20;
    score += strBonus;
    components.push(`+${strBonus} STR${strategy === 'STR' ? ' (active strategy)' : ''}`);
  }

  // Rich prepay menu (5+ options = flexible)
  if (lender.prepayOptions.length >= 5) {
    score += 15;
    components.push(`+15 prepay menu (${lender.prepayOptions.length} options)`);
  } else if (lender.prepayOptions.length >= 3) {
    score += 8;
    components.push(`+8 prepay menu (${lender.prepayOptions.length} options)`);
  }

  // Broad entity support
  if (lender.entityAllowed.length >= 3) {
    score += 15;
    components.push(`+15 entities (${lender.entityAllowed.length} types)`);
  } else if (lender.entityAllowed.length >= 2) {
    score += 8;
    components.push(`+8 entities (${lender.entityAllowed.length} types)`);
  }

  let rawScore = Math.min(100, score);
  const detail = components.length > 0
    ? components.join(' · ')
    : 'No flexibility features (basic program)';

  return {
    key: 'FLEXIBILITY',
    label: FACTOR_LABELS.FLEXIBILITY,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail,
  };
}

// ============================================================
// HELPERS
// ============================================================

function classifyTier(score: number): LenderScoreTier {
  if (score >= 80) return 'TOP_PICK';
  if (score >= 65) return 'STRONG';
  if (score >= 50) return 'VIABLE';
  return 'WEAK';
}

function buildTopReasons(factors: LenderScoreFactor[], fit: LenderFitResult): string[] {
  const reasons: string[] = [];

  // Sort factors by rawScore desc, take top 3 with score ≥ 70
  const sorted = [...factors].sort((a, b) => b.rawScore - a.rawScore);
  for (const f of sorted) {
    if (f.rawScore >= 70 && reasons.length < 3) {
      reasons.push(`${f.label}: ${f.rawScore}/100 — ${f.detail}`);
    }
  }

  // If lender is eligible but no factors ≥ 70, add a generic "meets guidelines" reason
  if (reasons.length === 0 && fit.eligible) {
    reasons.push(`Meets all eligibility guidelines with average scores across factors`);
  }

  return reasons;
}

function buildTopConcerns(factors: LenderScoreFactor[], fit: LenderFitResult): string[] {
  const concerns: string[] = [];

  // Ineligibility reasons come first
  if (!fit.eligible) {
    // Top 2 ineligibility reasons (most relevant)
    const topIneligibility = fit.ineligibleReasons.slice(0, 2);
    for (const r of topIneligibility) {
      concerns.push(`Ineligible: ${r}`);
    }
  }

  // Factors with rawScore < 50 (weak factors)
  const weakFactors = factors
    .filter(f => f.rawScore < 50)
    .sort((a, b) => a.rawScore - b.rawScore);
  for (const f of weakFactors) {
    if (concerns.length < 4) {  // up to 2 ineligibility + 2 weak factors
      concerns.push(`${f.label}: ${f.rawScore}/100 — ${f.detail}`);
    }
  }

  // Provenance warnings from fit result
  if (fit.provenanceWarnings.length > 0 && concerns.length < 4) {
    concerns.push(`Provenance: ${fit.provenanceWarnings[0]}`);
  }

  return concerns;
}

function buildRecommendationText(
  fit: LenderFitResult,
  tier: LenderScoreTier,
  score: number,
  topReasons: string[],
  topConcerns: string[],
): string {
  if (!fit.eligible) {
    return `INELIGIBLE — ${fit.ineligibleReasons[0] ?? 'does not meet guidelines'}. Score not computed; factors shown for reference only.`;
  }

  const tierText: Record<LenderScoreTier, string> = {
    TOP_PICK: 'TOP PICK',
    STRONG: 'STRONG FIT',
    VIABLE: 'VIABLE',
    WEAK: 'WEAK',
  };

  const parts: string[] = [];
  parts.push(`${tierText[tier]} — ${score}/100.`);
  if (topReasons.length > 0) {
    parts.push(`Strengths: ${topReasons[0].split(' — ')[0]}.`);
  }
  if (topConcerns.length > 0) {
    parts.push(`Watch: ${topConcerns[0].split(' — ')[0]}.`);
  }
  return parts.join(' ');
}

function buildMissingLenderScore(fit: LenderFitResult): LenderMatchScore {
  return {
    lenderId: fit.lenderId,
    lenderName: fit.lenderName,
    eligible: false,
    totalScore: 0,
    tier: 'WEAK',
    factors: [],
    topReasons: [],
    topConcerns: ['Lender profile not found in registry'],
    rankAmongEligible: null,
    recommendationText: `Lender profile not found — cannot score.`,
  };
}

function buildOverallSummary(
  topPicks: LenderMatchScore[],
  eligibleCount: number,
  marketRateBenchmark: number,
): string {
  if (eligibleCount === 0) {
    return `No eligible lenders for this deal — restructure loan parameters (lower LTV, raise FICO, increase DSCR) and re-run.`;
  }

  const parts: string[] = [];
  parts.push(`${eligibleCount} eligible lender${eligibleCount === 1 ? '' : 's'} scored.`);

  if (topPicks.length > 0) {
    const top = topPicks[0];
    parts.push(`Top recommendation: ${top.lenderName} (${top.totalScore}/100, ${top.tier}).`);
    if (topPicks.length >= 2) {
      parts.push(`Alternatives: ${topPicks.slice(1).map(p => `${p.lenderName} (${p.totalScore})`).join(', ')}.`);
    }
  }

  if (marketRateBenchmark > 0) {
    parts.push(`Median market rate (eligible): ${marketRateBenchmark.toFixed(3)}%.`);
  }

  return parts.join(' ');
}

// ============================================================
// CONVENIENCE EXPORTS
// ============================================================

export { FACTOR_WEIGHTS, FACTOR_LABELS };
