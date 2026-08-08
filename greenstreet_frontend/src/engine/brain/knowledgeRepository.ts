// Value exports live in their own modules; the shared shapes live in ../types,
// which is where lenders.ts and statePppLaws.ts import them from too.
import { LENDERS } from '../lenders';
import { PPP_STATE_LAWS } from '../statePppLaws';
import type { LenderProgram, PPPStateLaw } from '../types';
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
      totalLenders: LENDERS.length,
      totalPrograms: DSCR_PROGRAMS.length,
      supportedStates: Object.keys(PPP_STATE_LAWS).length,
      version: 'v2026.1.0-SOVEREIGN'
    };
  }

  public getLenders() {
    return LENDERS;
  }

  public getStatePppLaw(stateCode: string): PPPStateLaw | undefined {
    const normState = stateCode.trim().toUpperCase();
    return PPP_STATE_LAWS[normState];
  }

  public getMatchingLenders(dscr: number, ltv: number, FICO: number, loanAmount: number): LenderProgram[] {
    // LENDERS is already a flat LenderProgram[] — there is no nested `programs`
    // array. Each threshold is a LenderDataPoint<number>, so the comparison reads
    // `.value`; the sibling `.provenance` on each point is why callers must not
    // present these as fact without also surfacing it (see LenderIntelPage).
    return LENDERS.filter(
      (program) =>
        dscr >= (program.minDSCR?.value ?? 0) &&
        ltv <= (program.maxLTV?.value ?? 100) &&
        FICO >= (program.minFICO?.value ?? 0) &&
        loanAmount >= (program.loanAmountMin?.value ?? 0) &&
        loanAmount <= (program.loanAmountMax?.value ?? Infinity),
    );
  }
}
