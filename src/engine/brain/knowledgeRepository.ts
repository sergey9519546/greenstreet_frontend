import { LENDERS, LenderProgram } from '../lenders';
import { PPP_STATE_LAWS } from '../statePppLaws';
import { PPPStateLaw } from '../types';
import { DSCR_PROGRAMS } from '../../data/dscrPrograms';

export interface KnowledgeSummary {
  totalLenders: number;
  totalPrograms: number;
  supportedStates: number;
  version: string;
}

export class KnowledgeRepository {
  private static instance: KnowledgeRepository;

  private constructor() {}

  public static getInstance(): KnowledgeRepository {
    if (!KnowledgeRepository.instance) {
      KnowledgeRepository.instance = new KnowledgeRepository();
    }
    return KnowledgeRepository.instance;
  }

  public getSummary(): KnowledgeSummary {
    return {
      totalLenders: LENDERS ? LENDERS.length : 0,
      totalPrograms: DSCR_PROGRAMS ? DSCR_PROGRAMS.length : 0,
      supportedStates: PPP_STATE_LAWS ? Object.keys(PPP_STATE_LAWS).length : 0,
      version: 'v2026.1.0-SOVEREIGN'
    };
  }

  public getLenders() {
    return LENDERS || [];
  }

  public getStatePppLaw(stateCode: string): PPPStateLaw | undefined {
    const normState = stateCode.trim().toUpperCase();
    return (PPP_STATE_LAWS as Record<string, PPPStateLaw>)[normState];
  }

  public getMatchingLenders(dscr: number, ltv: number, FICO: number, loanAmount: number): LenderProgram[] {
    const matches: LenderProgram[] = [];
    if (!LENDERS) return matches;
    for (const program of LENDERS) {
      if (
        dscr >= (program.minDscr ?? 0) &&
        ltv <= (program.maxLtv ?? 100) &&
        FICO >= (program.minFico ?? 0) &&
        loanAmount >= (program.minLoanAmount ?? 0) &&
        loanAmount <= (program.maxLoanAmount ?? Infinity)
      ) {
        matches.push(program);
      }
    }
    return matches;
  }
}
