// ============================================================================
// STR RISK SCORING MODEL — v5.0 Spec Module 5
// ============================================================================
// 4-factor weighted composite score:
//   Platform diversification (Airbnb + VRBO)    30%
//   Review count / Superhost status              25%
//   Occupancy rate (last 12 months)              25%
//   Seasonality variance                         20%
//
// Composite score 0-100 mapped to reserve adjustment (0-4 months)
// ============================================================================

export interface StrRiskInputs {
  // Platform diversification (0-100)
  platformsUsed: number; // 1 = single platform, 2 = Airbnb+VRBO, 3+ = diversified
  isSuperhost: boolean;
  reviewCount: number; // total reviews across platforms
  avgRating: number; // 0-5
  // Occupancy (last 12 months)
  occupancyRatePct: number; // 0-100
  // Seasonality (last 12 months)
  monthlyRevenue: number[]; // 12 months of revenue
  // History
  monthsOperating: number;
}

export interface StrRiskFactor {
  name: string;
  weight: number; // percentage
  score: number; // 0-100
  note: string;
}

export interface StrRiskResult {
  compositeScore: number; // 0-100
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  reserveAdjustmentMonths: number; // 0-4 months added to base reserves
  factors: StrRiskFactor[];
  recommendation: string;
}

export function scoreStrRisk(input: StrRiskInputs): StrRiskResult {
  const factors: StrRiskFactor[] = [];

  // 1. Platform diversification (30%)
  let platformScore = 0;
  if (input.platformsUsed >= 3) platformScore = 100;
  else if (input.platformsUsed === 2) platformScore = 80;
  else if (input.platformsUsed === 1) platformScore = 50;
  factors.push({
    name: 'Platform Diversification',
    weight: 30,
    score: platformScore,
    note: `${input.platformsUsed} platform(s) used — ${input.platformsUsed >= 2 ? 'diversified' : 'single-platform risk'}`,
  });

  // 2. Reviews & Superhost (25%)
  let reviewScore = 0;
  if (input.isSuperhost) reviewScore += 50;
  if (input.reviewCount >= 100) reviewScore += 50;
  else if (input.reviewCount >= 50) reviewScore += 35;
  else if (input.reviewCount >= 20) reviewScore += 20;
  else if (input.reviewCount >= 5) reviewScore += 10;
  // Rating adjustment
  if (input.avgRating >= 4.8) reviewScore = Math.min(100, reviewScore + 10);
  else if (input.avgRating < 4.5) reviewScore = Math.max(0, reviewScore - 15);
  factors.push({
    name: 'Reviews & Superhost',
    weight: 25,
    score: reviewScore,
    note: `${input.reviewCount} reviews${input.isSuperhost ? ', Superhost' : ''}, ${input.avgRating}★ avg`,
  });

  // 3. Occupancy rate (25%)
  let occupancyScore = 0;
  if (input.occupancyRatePct >= 80) occupancyScore = 100;
  else if (input.occupancyRatePct >= 70) occupancyScore = 80;
  else if (input.occupancyRatePct >= 60) occupancyScore = 60;
  else if (input.occupancyRatePct >= 50) occupancyScore = 40;
  else if (input.occupancyRatePct >= 30) occupancyScore = 20;
  factors.push({
    name: 'Occupancy Rate (12mo)',
    weight: 25,
    score: occupancyScore,
    note: `${input.occupancyRatePct}% occupancy — ${input.occupancyRatePct >= 70 ? 'healthy' : input.occupancyRatePct >= 50 ? 'marginal' : 'weak'}`,
  });

  // 4. Seasonality variance (20%)
  // Calculate coefficient of variation across 12 months
  // v12 (P2-batch-J): Use sample variance (n-1) instead of population variance (n).
  // With 12 data points, n-1 vs n understates variance by ~8%, which understates
  // seasonality risk and can flip a marginal-STR score from yellow to green.
  const n = input.monthlyRevenue.length;
  const meanRev = input.monthlyRevenue.reduce((s, x) => s + x, 0) / Math.max(1, n);
  const variance = n > 1
    ? input.monthlyRevenue.reduce((s, x) => s + (x - meanRev) ** 2, 0) / (n - 1)
    : 0;
  const stdDev = Math.sqrt(variance);
  const cv = meanRev > 0 ? stdDev / meanRev : 1; // coefficient of variation
  let seasonalityScore = 0;
  if (cv < 0.15) seasonalityScore = 100; // very stable
  else if (cv < 0.25) seasonalityScore = 85;
  else if (cv < 0.40) seasonalityScore = 65;
  else if (cv < 0.60) seasonalityScore = 40;
  else seasonalityScore = 20; // highly seasonal
  factors.push({
    name: 'Seasonality Variance',
    weight: 20,
    score: seasonalityScore,
    note: `Revenue CV ${(cv * 100).toFixed(0)}% — ${cv < 0.25 ? 'stable' : cv < 0.5 ? 'moderate seasonality' : 'highly seasonal'}`,
  });

  // Composite score
  const compositeScore = factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0);

  // Risk level
  let riskLevel: StrRiskResult['riskLevel'];
  if (compositeScore >= 80) riskLevel = 'low';
  else if (compositeScore >= 60) riskLevel = 'moderate';
  else if (compositeScore >= 40) riskLevel = 'high';
  else riskLevel = 'critical';

  // Reserve adjustment: 0-4 months
  // Higher risk = more reserves
  let reserveAdjustmentMonths = 0;
  if (compositeScore < 80) reserveAdjustmentMonths = 1;
  if (compositeScore < 60) reserveAdjustmentMonths = 2;
  if (compositeScore < 40) reserveAdjustmentMonths = 3;
  if (compositeScore < 25) reserveAdjustmentMonths = 4;

  // Recommendation
  let recommendation = '';
  if (riskLevel === 'low') {
    recommendation = 'STR profile is healthy — standard reserves apply. Continue diversifying platforms.';
  } else if (riskLevel === 'moderate') {
    recommendation = `Add ${reserveAdjustmentMonths} month${reserveAdjustmentMonths === 1 ? '' : 's'} to base reserves. Consider adding a second platform if currently single-platform.`;
  } else if (riskLevel === 'high') {
    recommendation = `Add ${reserveAdjustmentMonths} months to reserves. Improve occupancy or reviews before relying on STR income for DSCR qualification.`;
  } else {
    recommendation = `Add ${reserveAdjustmentMonths} months to reserves. STR income should NOT be relied upon for DSCR qualification — convert to LTR or improve operations first.`;
  }

  return {
    compositeScore: Math.round(compositeScore),
    riskLevel,
    reserveAdjustmentMonths,
    factors,
    recommendation,
  };
}
