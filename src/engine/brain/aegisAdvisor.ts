/**
 * AEGIS Advisor Engine
 * Provides advisor-grade deal structuring, risk mitigation, and optimization insights.
 */

import { CqrMetrics } from './certaintyGovernor';

export interface AegisInputs {
  propertyValue: number;
  loanAmount: number;
  grossRent: number;
  monthlyPiti: number;
  fico: number;
  stateCode: string;
  propertyType: 'single_family' | 'multifamily_2_4' | 'condo' | 'townhouse' | 'commercial' | 'str';
  isArm?: boolean;
  reservesMonths?: number;
}

export interface AegisAdvice {
  verdict: 'STRONG_APPROVE' | 'APPROVE' | 'CONDITIONAL_APPROVE' | 'RESTRUCTURE_REQUIRED';
  executiveSummary: string;
  keyStrengths: string[];
  vulnerabilities: string[];
  structuringHacks: string[];
  maxQualifyingLtv: number;
  estimatedInterestRate: number;
}

export class AegisAdvisor {
  public static generateAdvice(inputs: AegisInputs, cqr: CqrMetrics): AegisAdvice {
    const ltv = (inputs.loanAmount / inputs.propertyValue) * 100;
    const dscr = inputs.monthlyPiti > 0 ? (inputs.grossRent * 0.85) / inputs.monthlyPiti : 0; // standard 15% haircut for taxes/ins/mgmt

    const strengths: string[] = [];
    const vulnerabilities: string[] = [];
    const structuringHacks: string[] = [];

    // Verdict Logic
    let verdict: AegisAdvice['verdict'] = 'APPROVE';
    if (cqr.certaintyScore >= 85 && dscr >= 1.25 && ltv <= 75) {
      verdict = 'STRONG_APPROVE';
    } else if (cqr.certaintyScore >= 70 && dscr >= 1.1) {
      verdict = 'APPROVE';
    } else if (dscr >= 1.0) {
      verdict = 'CONDITIONAL_APPROVE';
    } else {
      verdict = 'RESTRUCTURE_REQUIRED';
    }

    // Strengths Analysis
    if (dscr >= 1.15) strengths.push(`Solid DSCR coverage of ${dscr.toFixed(2)}x meets core Non-QM underwriting standards.`);
    if (ltv <= 75) strengths.push(`Acceptable LTV of ${ltv.toFixed(1)}% aligns with wholesale guidelines.`);
    if (inputs.fico >= 720) strengths.push(`Strong credit score (${inputs.fico}) qualifies for tier-1 non-QM pricing.`);
    if ((inputs.reservesMonths ?? 0) >= 6) strengths.push(`Healthy liquidity reserves of ${inputs.reservesMonths} months.`);

    // Vulnerabilities
    if (dscr < 1.15) vulnerabilities.push(`Tight DSCR coverage (${dscr.toFixed(2)}x) leaves deal exposed to property tax or insurance increases.`);
    if (ltv > 75) vulnerabilities.push(`LTV above 75% triggers pricing add-ons (LLPAs).`);
    if (inputs.propertyType === 'str') vulnerabilities.push(`Short-term rental income is subject to seasonal fluctuations.`);
    if (inputs.isArm) vulnerabilities.push(`ARM rate reset exposes debt service to future interest rate spikes.`);

    // Structuring Hacks & Optimizations
    if (dscr < 1.25) {
      structuringHacks.push('Structure as Interest-Only (I/O) to lower monthly PITI debt service and boost DSCR by ~0.18x.');
    }
    if (ltv > 70) {
      structuringHacks.push('Buy down rate by 1.0 point to lower PITI payment and lift qualifying DSCR.');
    }
    if (inputs.propertyType === 'str') {
      structuringHacks.push('Obtain AirDNA / Rabbu 100th percentile market report to support gross rent projections.');
    }
    structuringHacks.push(`Verify 50-state prepayment penalty laws for ${inputs.stateCode.toUpperCase()} to optimize 3-year vs 5-year stepdown structure.`);

    // Estimate Base Interest Rate
    let estRate = 6.875;
    if (inputs.fico >= 760) estRate -= 0.375;
    else if (inputs.fico < 680) estRate += 0.625;
    if (ltv > 75) estRate += 0.25;
    if (dscr < 1.15) estRate += 0.375;

    const maxQualifyingLtv = dscr >= 1.25 ? 80 : dscr >= 1.0 ? 75 : 70;

    const summaryText = `AEGIS Deal Verdict: ${verdict}. Certainty-Equivalent Rating is ${cqr.riskGrade} (${cqr.certaintyScore}/100). Qualifying DSCR estimated at ${dscr.toFixed(2)}x at ${ltv.toFixed(1)}% LTV.`;

    return {
      verdict,
      executiveSummary: summaryText,
      keyStrengths: strengths,
      vulnerabilities,
      structuringHacks,
      maxQualifyingLtv,
      estimatedInterestRate: Math.round(estRate * 1000) / 1000
    };
  }
}
