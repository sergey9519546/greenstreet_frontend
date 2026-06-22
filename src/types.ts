export interface PromissoryClaimViolation {
  textSegment: string;
  explanation: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  suggestedRewrite: string;
}

export interface OmissionOfRisk {
  explanation: string;
  suggestedDisclaimer: string;
}

export interface ProminentPraiseViolation {
  textSegment: string;
  explanation: string;
  suggestedFix: string;
}

export interface ComplianceReviewResponse {
  complianceScore: number;
  overallSummary: string;
  promissoryClaims: PromissoryClaimViolation[];
  omissionsOfRisk: OmissionOfRisk[];
  prominentPraise: ProminentPraiseViolation[];
  requiredDisclosures: string[];
}

export interface GroundingSource {
  title?: string;
  uri?: string;
  snippet?: string;
}

export interface RegulatorySearchResponse {
  answer: string;
  sources: GroundingSource[];
  metadata?: any;
}

export interface MapJurisdictionResponse {
  advice: string;
  sources: GroundingSource[];
  metadata?: any;
}

export interface ThinkingGuideResponse {
  thoughtfulResponse: string;
}

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  type: "review" | "search" | "jurisdiction" | "guide";
  title: string;
  timestamp: string;
  input: string;
  output: any; // Stored result JSON or rich string structure
}
