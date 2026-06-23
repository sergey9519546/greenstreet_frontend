export interface DSCRIssue {
  category: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  resolution: string;
}

export interface DSCRAnalysisResponse {
  dscrRatio: number;
  monthlyPayment: number;
  pitia: number;
  decision: "APPROVE" | "DECLINE" | "REFER";
  decisionSummary: string;
  recommendedLenders: string[];
  issues: DSCRIssue[];
  recommendations: string[];
}

export interface GroundingSource {
  title?: string;
  uri?: string;
  snippet?: string;
}

export interface LenderSearchResponse {
  answer: string;
  sources: GroundingSource[];
}

export interface StateRulesResponse {
  stateName: string;
  advice: string;
  keyRules: string[];
}

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  type: "analyze" | "lender-search" | "state-rules";
  title: string;
  timestamp: string;
  input: string;
  output: any;
}
