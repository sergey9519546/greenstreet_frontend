/**
 * DSCR Sovereign OS Brain Engine
 * Unified orchestrator for underwriting, lender matching, legal compliance,
 * AEGIS decision support, stress testing, and credit memo generation.
 */

import { KnowledgeRepository, KnowledgeSummary } from './knowledgeRepository';
import { CertaintyGovernor, CqrMetrics, CqrInputs } from './certaintyGovernor';
import { AegisAdvisor, AegisAdvice, AegisInputs } from './aegisAdvisor';
import { PPPStateLaw } from '../types';
import { LenderProgram } from '../lenders';

export interface BrainDealInput {
  propertyValue: number;
  loanAmount: number;
  grossRent: number;
  monthlyPiti: number;
  fico: number;
  stateCode: string;
  propertyType: 'single_family' | 'multifamily_2_4' | 'condo' | 'townhouse' | 'commercial' | 'str';
  isArm?: boolean;
  reservesMonths?: number;
  pppMonths?: number;
  borrowerEntity?: string;
}

export interface BrainEvaluationResult {
  timestamp: string;
  dealSummary: {
    propertyValue: number;
    loanAmount: number;
    ltv: number;
    grossRent: number;
    monthlyPiti: number;
    dscr: number;
    stateCode: string;
  };
  cqrMetrics: CqrMetrics;
  aegisAdvice: AegisAdvice;
  stateLawCompliance: {
    stateCode: string;
    stateLaw?: PPPStateLaw;
    isPppAllowed: boolean;
    complianceWarning?: string;
  };
  matchingLenders: {
    count: number;
    programs: LenderProgram[];
  };
  institutionalMemo: string;
}

export class DSCRBrainEngine {
  private static instance: DSCRBrainEngine;
  private repository: KnowledgeRepository;

  private constructor() {
    this.repository = KnowledgeRepository.getInstance();
  }

  public static getInstance(): DSCRBrainEngine {
    if (!DSCRBrainEngine.instance) {
      DSCRBrainEngine.instance = new DSCRBrainEngine();
    }
    return DSCRBrainEngine.instance;
  }

  public getKnowledgeSummary(): KnowledgeSummary {
    return this.repository.getSummary();
  }

  public evaluateDeal(input: BrainDealInput): BrainEvaluationResult {
    const ltv = Math.round((input.loanAmount / input.propertyValue) * 10000) / 100;
    const netOperatingIncome = input.grossRent * 0.85; // 15% haircut for property expenses
    const dscr = input.monthlyPiti > 0 ? Math.round((netOperatingIncome / input.monthlyPiti) * 100) / 100 : 0;

    // 1. Calculate Certainty-Equivalent (CQR) Metrics
    const cqrInputs: CqrInputs = {
      dscr,
      ltv,
      fico: input.fico,
      isArm: !!input.isArm,
      isStr: input.propertyType === 'str',
      reservesMonths: input.reservesMonths ?? 6,
      pppMonths: input.pppMonths ?? 36
    };
    const cqrMetrics = CertaintyGovernor.calculateCqr(cqrInputs);

    // 2. Generate AEGIS Strategic Advice
    const aegisInputs: AegisInputs = {
      propertyValue: input.propertyValue,
      loanAmount: input.loanAmount,
      grossRent: input.grossRent,
      monthlyPiti: input.monthlyPiti,
      fico: input.fico,
      stateCode: input.stateCode,
      propertyType: input.propertyType,
      isArm: input.isArm,
      reservesMonths: input.reservesMonths
    };
    const aegisAdvice = AegisAdvisor.generateAdvice(aegisInputs, cqrMetrics);

    // 3. State PPP Law Legal Check
    const stateLaw = this.repository.getStatePppLaw(input.stateCode);
    const isPppAllowed = stateLaw
      ? stateLaw.status !== 'PROHIBITED' && stateLaw.status !== 'PRACTICALLY_PROHIBITED'
      : true;

    let complianceWarning: string | undefined = undefined;
    if (stateLaw && (stateLaw.status === 'PROHIBITED' || stateLaw.status === 'PRACTICALLY_PROHIBITED' || stateLaw.status === 'ENTITY_ONLY' || stateLaw.status === 'CONDITIONAL')) {
      complianceWarning = `Prepayment penalty status in ${input.stateCode.toUpperCase()}: ${stateLaw.status}. ${stateLaw.reason || ''}. Verify entity structure (LLC vs Individual).`;
    }

    // 4. Lender Matrix Matching
    const matchingPrograms = this.repository.getMatchingLenders(dscr, ltv, input.fico, input.loanAmount);

    // 5. Synthesize Institutional Credit Memo
    const memo = this.synthesizeCreditMemo(input, ltv, dscr, cqrMetrics, aegisAdvice, isPppAllowed, matchingPrograms.length);

    return {
      timestamp: new Date().toISOString(),
      dealSummary: {
        propertyValue: input.propertyValue,
        loanAmount: input.loanAmount,
        ltv,
        grossRent: input.grossRent,
        monthlyPiti: input.monthlyPiti,
        dscr,
        stateCode: input.stateCode.toUpperCase()
      },
      cqrMetrics,
      aegisAdvice,
      stateLawCompliance: {
        stateCode: input.stateCode.toUpperCase(),
        stateLaw,
        isPppAllowed,
        complianceWarning
      },
      matchingLenders: {
        count: matchingPrograms.length,
        programs: matchingPrograms
      },
      institutionalMemo: memo
    };
  }

  private synthesizeCreditMemo(
    input: BrainDealInput,
    ltv: number,
    dscr: number,
    cqr: CqrMetrics,
    advice: AegisAdvice,
    isPppAllowed: boolean,
    matchingLendersCount: number
  ): string {
    return `
================================================================================
              INSTITUTIONAL DSCR LOAN UNDERWRITING CREDIT MEMO
================================================================================
Date: ${new Date().toLocaleDateString('en-US')}
Property Type: ${input.propertyType.toUpperCase()} | Location: ${input.stateCode.toUpperCase()}
Borrower Credit Score (FICO): ${input.fico} | Entity: ${input.borrowerEntity || 'LLC (Recommended)'}

--------------------------------------------------------------------------------
1. FINANCIAL & LEVERAGE SUMMARY
--------------------------------------------------------------------------------
Property Value:        $${input.propertyValue.toLocaleString()}
Requested Loan Amount: $${input.loanAmount.toLocaleString()} (${ltv.toFixed(1)}% LTV)
Gross Monthly Rent:    $${input.grossRent.toLocaleString()}
Monthly PITI Payment:  $${input.monthlyPiti.toLocaleString()}
Qualifying DSCR:       ${dscr.toFixed(2)}x (Net NOI Haircut: 15%)

--------------------------------------------------------------------------------
2. SOVEREIGN CQR CERTAINTY RATING & RISK GRADE
--------------------------------------------------------------------------------
CQR Certainty Score:   ${cqr.certaintyScore}/100
Risk Grade Rating:     ${cqr.riskGrade}
Resilience Factor:     ${cqr.resilienceFactor}
Confidence DSCR Range: [${cqr.confidenceIntervalLow}x - ${cqr.confidenceIntervalHigh}x]

--------------------------------------------------------------------------------
3. AEGIS UNDERWRITING VERDICT & ADVISORY
--------------------------------------------------------------------------------
Verdict: ${advice.verdict}
Estimated Interest Rate: ${advice.estimatedInterestRate}%
Max Qualifying LTV: ${advice.maxQualifyingLtv}%
Matching Wholesale Lenders: ${matchingLendersCount} Eligible Lenders

Executive Summary:
${advice.executiveSummary}

Key Strengths:
${advice.keyStrengths.map(s => '  + ' + s).join('\n')}

Risk Vulnerabilities:
${advice.vulnerabilities.map(v => '  - ' + v).join('\n')}

Recommended Structuring Modifications:
${advice.structuringHacks.map(h => '  * ' + h).join('\n')}

--------------------------------------------------------------------------------
4. COMPLIANCE & LEGAL GUARDRAILS
--------------------------------------------------------------------------------
Prepayment Penalty Status for ${input.stateCode.toUpperCase()}: ${isPppAllowed ? 'PERMITTED' : 'RESTRICTED/PROHIBITED'}
Entity Structuring Requirement: Non-QM DSCR loans should close in a single-purpose LLC entity to maintain business-purpose exemption.
================================================================================
`.trim();
  }
}
