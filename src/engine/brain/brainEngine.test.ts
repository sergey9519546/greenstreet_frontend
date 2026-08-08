import { describe, it, expect } from 'vitest';
import { DSCRBrainEngine, BrainDealInput } from './brainEngine';
import { KnowledgeRepository } from './knowledgeRepository';
import { CertaintyGovernor } from './certaintyGovernor';
import { AegisAdvisor } from './aegisAdvisor';

describe('DSCR Sovereign OS Brain Engine', () => {
  it('KnowledgeRepository indexes all lenders, programs, and state laws', () => {
    const repo = KnowledgeRepository.getInstance();
    const summary = repo.getSummary();

    expect(summary.totalLenders).toBeGreaterThan(0);
    expect(summary.totalPrograms).toBeGreaterThan(0);
    expect(summary.supportedStates).toBeGreaterThan(0);
    expect(summary.version).toContain('SOVEREIGN');
  });

  it('CertaintyGovernor (CQR Math) calculates certainty score and risk grade accurately', () => {
    const cqrPrime = CertaintyGovernor.calculateCqr({
      dscr: 1.4,
      ltv: 65,
      fico: 780,
      isArm: false,
      reservesMonths: 12
    });

    expect(cqrPrime.certaintyScore).toBeGreaterThanOrEqual(85);
    expect(['AAA', 'AA']).toContain(cqrPrime.riskGrade);
    expect(cqrPrime.resilienceFactor).toBeGreaterThanOrEqual(0.85);

    const cqrWeak = CertaintyGovernor.calculateCqr({
      dscr: 0.95,
      ltv: 82,
      fico: 640,
      isArm: true,
      isStr: true
    });

    expect(cqrWeak.certaintyScore).toBeLessThan(60);
    expect(['B', 'CCC', 'BB']).toContain(cqrWeak.riskGrade);
  });

  it('AEGIS Advisor delivers actionable verdicts and structuring recommendations', () => {
    const cqr = CertaintyGovernor.calculateCqr({ dscr: 1.25, ltv: 75, fico: 720, isArm: false });
    const advice = AegisAdvisor.generateAdvice({
      propertyValue: 500000,
      loanAmount: 375000,
      grossRent: 4500,
      monthlyPiti: 3000,
      fico: 720,
      stateCode: 'FL',
      propertyType: 'single_family'
    }, cqr);

    expect(['STRONG_APPROVE', 'APPROVE', 'CONDITIONAL_APPROVE']).toContain(advice.verdict);
    expect(advice.keyStrengths.length).toBeGreaterThan(0);
    expect(advice.estimatedInterestRate).toBeGreaterThan(5.0);
    expect(advice.estimatedInterestRate).toBeLessThan(12.0);
  });

  it('DSCRBrainEngine evaluates complete deal end-to-end and produces credit memo', () => {
    const engine = DSCRBrainEngine.getInstance();
    const dealInput: BrainDealInput = {
      propertyValue: 600000,
      loanAmount: 420000, // 70% LTV
      grossRent: 5500,
      monthlyPiti: 3200,
      fico: 750,
      stateCode: 'FL',
      propertyType: 'single_family',
      isArm: false,
      reservesMonths: 6,
      borrowerEntity: 'Sunshine Real Estate Holdings LLC'
    };

    const result = engine.evaluateDeal(dealInput);

    expect(result.dealSummary.ltv).toBe(70);
    expect(result.dealSummary.dscr).toBeGreaterThan(1.2);
    expect(result.cqrMetrics.certaintyScore).toBeGreaterThan(75);
    expect(result.stateLawCompliance.stateCode).toBe('FL');
    expect(result.stateLawCompliance.isPppAllowed).toBe(true);
    expect(result.institutionalMemo).toContain('INSTITUTIONAL DSCR LOAN UNDERWRITING CREDIT MEMO');
    expect(result.institutionalMemo).toContain('Sunshine Real Estate Holdings LLC');
  });

  it('DSCRBrainEngine detects restricted PPP states like PA / MI / IA', () => {
    const engine = DSCRBrainEngine.getInstance();
    const paDeal: BrainDealInput = {
      propertyValue: 400000,
      loanAmount: 300000,
      grossRent: 3500,
      monthlyPiti: 2200,
      fico: 710,
      stateCode: 'PA',
      propertyType: 'single_family'
    };

    const result = engine.evaluateDeal(paDeal);
    expect(result.stateLawCompliance.stateCode).toBe('PA');
    // PA has restrictions on individual vs entity PPP
    expect(result.stateLawCompliance.complianceWarning).toBeDefined();
  });
});
