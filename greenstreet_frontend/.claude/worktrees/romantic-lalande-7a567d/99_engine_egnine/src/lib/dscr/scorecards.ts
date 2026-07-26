// ============================================================================
// EXECUTION SCORECARD + ACQUISITION SCORE — v7.0 Section 20
// ============================================================================
// v7.0 Section 20.1: Execution Scorecard (rules-based, 0-100)
//   Points are directional guidance — NOT empirically calibrated.
// v7.0 Section 20.2: Acquisition Score Framework
//   Score the property and deal — not just the loan.
// ============================================================================

import type { DealInputs } from './types';
import { ltvPct, monthlyPayment } from './math';

// ---------------------------------------------------------------------------
// EXECUTION SCORECARD — v7.0 Section 20.1
// ---------------------------------------------------------------------------

export interface ExecutionScoreInput {
  dscr: number; // Track 1
  fico: number;
  ltv: number; // percent
  reservesMonths: number;
  propertyType: string;
  rentType: string;
  isStr: boolean;
  experienceProperties: number;
  loanAmount: number;
}

export interface ExecutionScoreResult {
  totalScore: number;
  band: string;
  bandDescription: string;
  breakdown: { factor: string; points: number; maxPoints: number; note: string }[];
  recommendation: string;
}

export function calculateExecutionScore(input: ExecutionScoreInput): ExecutionScoreResult {
  const breakdown: { factor: string; points: number; maxPoints: number; note: string }[] = [];

  // DSCR points (max 20)
  let dscrPoints = 0;
  let dscrNote = '';
  if (input.dscr >= 1.25) { dscrPoints = 20; dscrNote = `DSCR ${input.dscr.toFixed(2)}x ≥ 1.25`; }
  else if (input.dscr >= 1.10) { dscrPoints = 15; dscrNote = `DSCR ${input.dscr.toFixed(2)}x in 1.10-1.24 band`; }
  else if (input.dscr >= 1.00) { dscrPoints = 10; dscrNote = `DSCR ${input.dscr.toFixed(2)}x in 1.00-1.09 band`; }
  else if (input.dscr >= 0.75) { dscrPoints = 5; dscrNote = `DSCR ${input.dscr.toFixed(2)}x in 0.75-0.99 band (sub-1.0)`; }
  else { dscrPoints = 0; dscrNote = `DSCR ${input.dscr.toFixed(2)}x below 0.75`; }
  breakdown.push({ factor: 'DSCR', points: dscrPoints, maxPoints: 20, note: dscrNote });

  // FICO points (max 20)
  let ficoPoints = 0;
  let ficoNote = '';
  if (input.fico >= 760) { ficoPoints = 20; ficoNote = `FICO ${input.fico} ≥ 760`; }
  else if (input.fico >= 720) { ficoPoints = 17; ficoNote = `FICO ${input.fico} in 720-759`; }
  else if (input.fico >= 700) { ficoPoints = 13; ficoNote = `FICO ${input.fico} in 700-719`; }
  else if (input.fico >= 680) { ficoPoints = 10; ficoNote = `FICO ${input.fico} in 680-699`; }
  else if (input.fico >= 660) { ficoPoints = 6; ficoNote = `FICO ${input.fico} in 660-679`; }
  else { ficoPoints = 2; ficoNote = `FICO ${input.fico} below 660`; }
  breakdown.push({ factor: 'FICO', points: ficoPoints, maxPoints: 20, note: ficoNote });

  // LTV points (max 15)
  let ltvPoints = 0;
  let ltvNote = '';
  if (input.ltv <= 60) { ltvPoints = 15; ltvNote = `LTV ${input.ltv.toFixed(1)}% ≤ 60%`; }
  else if (input.ltv <= 65) { ltvPoints = 13; ltvNote = `LTV ${input.ltv.toFixed(1)}% at 65%`; }
  else if (input.ltv <= 70) { ltvPoints = 11; ltvNote = `LTV ${input.ltv.toFixed(1)}% at 70%`; }
  else if (input.ltv <= 75) { ltvPoints = 9; ltvNote = `LTV ${input.ltv.toFixed(1)}% at 75%`; }
  else if (input.ltv <= 80) { ltvPoints = 6; ltvNote = `LTV ${input.ltv.toFixed(1)}% at 80%`; }
  else { ltvPoints = 2; ltvNote = `LTV ${input.ltv.toFixed(1)}% > 80%`; }
  breakdown.push({ factor: 'LTV', points: ltvPoints, maxPoints: 15, note: ltvNote });

  // Reserves points (max 15)
  let resPoints = 0;
  let resNote = '';
  if (input.reservesMonths >= 6) { resPoints = 15; resNote = `Reserves ${input.reservesMonths}mo ≥ 6mo`; }
  else if (input.reservesMonths >= 3) { resPoints = 10; resNote = `Reserves ${input.reservesMonths}mo in 3-6mo`; }
  else if (input.reservesMonths >= 1) { resPoints = 5; resNote = `Reserves ${input.reservesMonths}mo marginal`; }
  else { resPoints = 0; resNote = `Reserves uncertain`; }
  breakdown.push({ factor: 'Reserves', points: resPoints, maxPoints: 15, note: resNote });

  // Property type points (max 10)
  let propPoints = 0;
  let propNote = '';
  if (input.propertyType === 'SFR' && !input.isStr) { propPoints = 10; propNote = 'LT SFR — best case'; }
  else if (['TWO_UNIT', 'THREE_UNIT', 'FOUR_UNIT'].includes(input.propertyType) && !input.isStr) { propPoints = 8; propNote = '2-4 unit LT'; }
  else if (input.propertyType === 'CONDO' && !input.isStr) { propPoints = 6; propNote = 'Warrantable condo'; }
  else if (input.isStr && input.rentType === 'LTR') { propPoints = 6; propNote = 'STR with LT rent qual'; }
  else if (input.isStr) { propPoints = 4; propNote = 'STR with AirDNA qual'; }
  else { propPoints = 2; propNote = 'Non-warrantable condo or other'; }
  breakdown.push({ factor: 'Property Type', points: propPoints, maxPoints: 10, note: propNote });

  // Experience points (max 5)
  let expPoints = 0;
  let expNote = '';
  if (input.experienceProperties >= 5) { expPoints = 5; expNote = `5+ properties — experienced`; }
  else if (input.experienceProperties >= 1) { expPoints = 3; expNote = `1-4 properties`; }
  else { expPoints = 0; expNote = 'First investment'; }
  breakdown.push({ factor: 'Experience', points: expPoints, maxPoints: 5, note: expNote });

  // Loan amount points (max 5)
  let loanPoints = 0;
  let loanNote = '';
  if (input.loanAmount >= 100_000 && input.loanAmount <= 2_000_000) { loanPoints = 5; loanNote = 'Standard loan amount'; }
  else { loanPoints = 3; loanNote = 'Jumbo or large amount'; }
  breakdown.push({ factor: 'Loan Amount', points: loanPoints, maxPoints: 5, note: loanNote });

  const totalScore = breakdown.reduce((sum, b) => sum + b.points, 0);

  // Band
  let band: string;
  let bandDescription: string;
  let recommendation: string;
  if (totalScore >= 85) {
    band = 'Very Likely to Close';
    bandDescription = '85-100: Very likely to close';
    recommendation = 'Strong execution profile — expect standard approval at competitive pricing.';
  } else if (totalScore >= 70) {
    band = 'Likely — Some Selectivity';
    bandDescription = '70-84: Likely — some lender selectivity needed';
    recommendation = 'Good profile — shop 2-3 lenders for best fit.';
  } else if (totalScore >= 55) {
    band = 'Moderate Risk';
    bandDescription = '55-69: Moderate risk — specific lender match required';
    recommendation = 'Moderate risk — target lenders specializing in your profile.';
  } else if (totalScore >= 40) {
    band = 'Difficult';
    bandDescription = '40-54: Difficult — significant shopping required';
    recommendation = 'Difficult — expect rejections. Consider restructuring before applying.';
  } else {
    band = 'Fragile';
    bandDescription = '< 40: Fragile — restructure before shopping';
    recommendation = 'Fragile profile — restructure deal (lower LTV, higher DSCR, better FICO) before applying.';
  }

  return { totalScore, band, bandDescription, breakdown, recommendation };
}

// ---------------------------------------------------------------------------
// ACQUISITION SCORE FRAMEWORK — v7.0 Section 20.2
// ---------------------------------------------------------------------------

export interface AcquisitionScoreInput {
  // Cash flow strength (30%)
  track2Dscr: number;
  monthlyCashFlow: number;
  cashOnCashReturn: number;
  // Financing feasibility (20%)
  executionScore: number; // from ExecutionScorecard above
  // STR viability (15%) — only if STR
  isStr: boolean;
  strLegalityStatus: string; // CLEAR / RESTRICTED / UNCERTAIN / PROHIBITED
  strRiskScore: number; // 0-100 from STR Risk module
  // Regulatory risk (10%)
  state: string;
  rentControlState: boolean;
  // Exit liquidity (10%)
  marketCapRate: number;
  // Appreciation potential (10%)
  noiGrowthRatePct: number;
  // Capex / condition risk (5%)
  propertyAgeYears: number;
  capexReservePct: number;
}

export interface AcquisitionScoreResult {
  totalScore: number;
  label: string;
  factors: { name: string; weight: number; score: number; weightedScore: number; note: string }[];
  recommendation: string;
}

export function calculateAcquisitionScore(input: AcquisitionScoreInput): AcquisitionScoreResult {
  const factors: AcquisitionScoreResult['factors'] = [];

  // 1. Cash flow strength (30%)
  let cfScore = 0;
  if (input.track2Dscr >= 1.25) cfScore = 100;
  else if (input.track2Dscr >= 1.10) cfScore = 80;
  else if (input.track2Dscr >= 1.00) cfScore = 60;
  else if (input.track2Dscr >= 0.85) cfScore = 40;
  else cfScore = 20;
  if (input.monthlyCashFlow <= 0) cfScore = Math.min(cfScore, 30);
  factors.push({
    name: 'Cash Flow Strength',
    weight: 30,
    score: cfScore,
    weightedScore: (cfScore * 30) / 100,
    note: `Track 2 DSCR ${input.track2Dscr.toFixed(2)}x, CF $${input.monthlyCashFlow.toFixed(0)}/mo, CoC ${input.cashOnCashReturn.toFixed(1)}%`,
  });

  // 2. Financing feasibility (20%)
  const finScore = input.executionScore;
  factors.push({
    name: 'Financing Feasibility',
    weight: 20,
    score: finScore,
    weightedScore: (finScore * 20) / 100,
    note: `Execution score ${finScore}/100`,
  });

  // 3. STR viability (15%) — only if STR
  if (input.isStr) {
    let strScore = input.strRiskScore;
    if (input.strLegalityStatus === 'PROHIBITED') strScore = 0;
    else if (input.strLegalityStatus === 'UNCERTAIN') strScore = Math.min(strScore, 30);
    else if (input.strLegalityStatus === 'RESTRICTED') strScore = Math.min(strScore, 60);
    factors.push({
      name: 'STR Viability',
      weight: 15,
      score: strScore,
      weightedScore: (strScore * 15) / 100,
      note: `STR legality: ${input.strLegalityStatus}, risk score ${input.strRiskScore}/100`,
    });
  } else {
    // Not STR — redistribute 15% to cash flow (effectively 45% cash flow)
    factors.push({
      name: 'STR Viability (N/A)',
      weight: 15,
      score: 0,
      weightedScore: 0,
      note: 'Not STR — weight redistributed',
    });
  }

  // 4. Regulatory risk (10%)
  let regScore = 80;
  if (input.rentControlState) regScore -= 30;
  factors.push({
    name: 'Regulatory Risk',
    weight: 10,
    score: regScore,
    weightedScore: (regScore * 10) / 100,
    note: `${input.state} ${input.rentControlState ? '(rent control state)' : ''}`,
  });

  // 5. Exit liquidity (10%)
  let exitScore = 50;
  if (input.marketCapRate >= 8) exitScore = 90;
  else if (input.marketCapRate >= 7) exitScore = 75;
  else if (input.marketCapRate >= 6) exitScore = 60;
  else if (input.marketCapRate >= 5) exitScore = 40;
  else exitScore = 25;
  factors.push({
    name: 'Exit Liquidity',
    weight: 10,
    score: exitScore,
    weightedScore: (exitScore * 10) / 100,
    note: `Cap rate ${input.marketCapRate}% — ${exitScore >= 75 ? 'liquid' : exitScore >= 50 ? 'moderate' : 'illiquid'}`,
  });

  // 6. Appreciation potential (10%)
  let apprScore = 50;
  if (input.noiGrowthRatePct >= 5) apprScore = 90;
  else if (input.noiGrowthRatePct >= 3) apprScore = 70;
  else if (input.noiGrowthRatePct >= 1) apprScore = 50;
  else if (input.noiGrowthRatePct >= 0) apprScore = 30;
  else apprScore = 15;
  factors.push({
    name: 'Appreciation Potential',
    weight: 10,
    score: apprScore,
    weightedScore: (apprScore * 10) / 100,
    note: `NOI growth ${input.noiGrowthRatePct}%`,
  });

  // 7. Capex / condition risk (5%)
  let capexScore = 70;
  if (input.propertyAgeYears > 50) capexScore -= 30;
  else if (input.propertyAgeYears > 30) capexScore -= 15;
  if (input.capexReservePct < 3) capexScore -= 20;
  factors.push({
    name: 'Capex / Condition',
    weight: 5,
    score: capexScore,
    weightedScore: (capexScore * 5) / 100,
    note: `Age ${input.propertyAgeYears}yrs, capex reserve ${input.capexReservePct}%`,
  });

  const totalScore = Math.round(factors.reduce((sum, f) => sum + f.weightedScore, 0));

  let label: string;
  let recommendation: string;
  if (totalScore >= 80) {
    label = 'Excellent Acquisition';
    recommendation = 'Strong acquisition — proceed with confidence.';
  } else if (totalScore >= 65) {
    label = 'Good Acquisition';
    recommendation = 'Good deal — minor concerns to monitor.';
  } else if (totalScore >= 50) {
    label = 'Marginal Acquisition';
    recommendation = 'Marginal — proceed only if specific concerns can be mitigated.';
  } else if (totalScore >= 35) {
    label = 'Weak Acquisition';
    recommendation = 'Weak deal — restructure or walk away.';
  } else {
    label = 'Avoid';
    recommendation = 'Avoid — multiple structural problems.';
  }

  return { totalScore, label, factors, recommendation };
}

// ---------------------------------------------------------------------------
// COMBINED TWO-VARIABLE STRESS MATRIX — v7.0 Section 9.6
// ---------------------------------------------------------------------------

export interface TwoVariableStressInput {
  baseRent: number;
  baseRate: number;
  loanAmount: number;
  amortMonths: number;
  taxes: number;
  insurance: number;
  hoa: number;
  // Shock axes
  rentShocks: number[]; // e.g., [0, -5, -10, -15, -20] (percent)
  rateShocks: number[]; // e.g., [0, 0.25, 0.50, 0.75, 1.00] (percentage points)
}

export interface TwoVariableStressResult {
  matrix: { rentShock: number; rateShock: number; dscr: number; status: 'pass' | 'marginal' | 'fail' | 'critical' }[][];
  rentShocks: number[];
  rateShocks: number[];
}

export function calculateTwoVariableStress(input: TwoVariableStressInput): TwoVariableStressResult {
  const matrix: TwoVariableStressResult['matrix'] = [];

  for (let i = 0; i < input.rentShocks.length; i++) {
    const row: TwoVariableStressResult['matrix'][0] = [];
    for (let j = 0; j < input.rateShocks.length; j++) {
      const rentMult = 1 + input.rentShocks[i] / 100;
      const stressedRent = input.baseRent * rentMult;
      const stressedRate = input.baseRate + input.rateShocks[j];
      const pmt = monthlyPayment(input.loanAmount, stressedRate, input.amortMonths);
      const pitia = pmt + input.taxes + input.insurance + input.hoa;
      const dscr = pitia > 0 ? stressedRent / pitia : 0;

      let status: 'pass' | 'marginal' | 'fail' | 'critical';
      if (dscr >= 1.10) status = 'pass';
      else if (dscr >= 1.00) status = 'marginal';
      else if (dscr >= 0.85) status = 'fail';
      else status = 'critical';

      row.push({ rentShock: input.rentShocks[i], rateShock: input.rateShocks[j], dscr: Math.round(dscr * 1000) / 1000, status });
    }
    matrix.push(row);
  }

  return { matrix, rentShocks: input.rentShocks, rateShocks: input.rateShocks };
}
