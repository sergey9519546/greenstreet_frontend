/**
 * Certainty Governor (CQR Math)
 * Calculates Certainty-Equivalent Underwriting Score (0 - 100%)
 * Evaluates cash flow volatility, rate shock resilience, and lender execution probability.
 */

export interface CqrInputs {
  dscr: number;
  ltv: number;
  fico: number;
  isArm: boolean;
  occupancyRate?: number; // 0 to 1
  isStr?: boolean; // Short-term rental
  reservesMonths?: number;
  pppMonths?: number;
}

export interface CqrMetrics {
  certaintyScore: number; // 0 - 100
  riskGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  resilienceFactor: number; // 0 to 1
  recommendations: string[];
}

export class CertaintyGovernor {
  public static calculateCqr(inputs: CqrInputs): CqrMetrics {
    let baseScore = 75.0;

    // DSCR Adjustment
    if (inputs.dscr >= 1.5) baseScore += 15;
    else if (inputs.dscr >= 1.25) baseScore += 10;
    else if (inputs.dscr >= 1.15) baseScore += 5;
    else if (inputs.dscr < 1.0) baseScore -= 25;
    else baseScore -= 10;

    // LTV Adjustment
    if (inputs.ltv <= 65) baseScore += 10;
    else if (inputs.ltv <= 75) baseScore += 5;
    else if (inputs.ltv > 80) baseScore -= 15;

    // FICO Adjustment
    if (inputs.fico >= 760) baseScore += 10;
    else if (inputs.fico >= 720) baseScore += 5;
    else if (inputs.fico < 660) baseScore -= 20;

    // STR Volatility Penalty
    if (inputs.isStr) {
      baseScore -= 8;
    }

    // ARM Shock Penalty
    if (inputs.isArm) {
      baseScore -= 6;
    }

    // Reserves Boost
    if ((inputs.reservesMonths ?? 0) >= 12) {
      baseScore += 8;
    } else if ((inputs.reservesMonths ?? 0) >= 6) {
      baseScore += 4;
    }

    // Clamp score between 0 and 100
    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore * 10) / 10));

    // Determine Risk Grade
    let riskGrade: CqrMetrics['riskGrade'] = 'BBB';
    if (finalScore >= 92) riskGrade = 'AAA';
    else if (finalScore >= 85) riskGrade = 'AA';
    else if (finalScore >= 78) riskGrade = 'A';
    else if (finalScore >= 70) riskGrade = 'BBB';
    else if (finalScore >= 60) riskGrade = 'BB';
    else if (finalScore >= 50) riskGrade = 'B';
    else riskGrade = 'CCC';

    // Confidence Interval Bounds
    const margin = Math.round((100 - finalScore) * 0.15 * 10) / 10;
    const confidenceIntervalLow = Math.max(0, Math.round((inputs.dscr - margin * 0.02) * 100) / 100);
    const confidenceIntervalHigh = Math.round((inputs.dscr + margin * 0.02) * 100) / 100;

    // Resilience Factor
    const resilienceFactor = Math.round((finalScore / 100) * 100) / 100;

    // Strategic Recommendations
    const recommendations: string[] = [];
    if (inputs.ltv > 75) recommendations.push('Reduce LTV to 75% or lower to unlock tier-1 pricing.');
    if (inputs.dscr < 1.2) recommendations.push('Structure interest-only or increase down payment to elevate DSCR above 1.25.');
    if (inputs.isStr && (inputs.reservesMonths ?? 0) < 6) recommendations.push('Increase liquidity reserves to 6+ months for STR cash flow stability.');
    if (inputs.isArm) recommendations.push('Consider a 5-year PPP 30-year fixed rate to insulate against ARM reset shock.');

    return {
      certaintyScore: finalScore,
      riskGrade,
      confidenceIntervalLow,
      confidenceIntervalHigh,
      resilienceFactor,
      recommendations
    };
  }
}
