import type { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";

/**
 * Stable evidence subjects for the release dossiers behind existing holds.
 *
 * This is intentionally a default-off, internal adapter. Product surfaces do
 * not import it, and it does not evaluate evidence or alter hold behavior.
 */
export type ReliabilityHoldKey = keyof typeof TOOL_RELIABILITY_HOLDS;

export type EvidenceSubjectId =
  | "workspace-authentication-and-data-access"
  | "decision-support-approved-scenario-and-program-data"
  | "rate-quiz-pricing-and-program-matrix"
  | "deal-analyzer-program-pricing-and-state-conclusions"
  | "state-rules-primary-authority-and-effective-dates"
  | "str-underwriting-income-and-jurisdiction-policy"
  | "tax-engine-treatment-and-effective-date-rules"
  | "refinance-tracker-loan-and-cost-schedule"
  | "portfolio-refinance-loan-and-reserve-data"
  | "rate-path-simulation-calibration"
  | "arm-reset-note-terms-and-payment-schedule"
  | "investment-returns-cash-flow-and-tax-schedule"
  | "stress-matrix-canonical-scenario-and-risk-thresholds"
  | "structure-optimizer-schedules-pricing-and-ranking";

const holdEvidenceSubjects = {
  workspace: "workspace-authentication-and-data-access",
  decisionSupport: "decision-support-approved-scenario-and-program-data",
  rateQuiz: "rate-quiz-pricing-and-program-matrix",
  dealAnalyzer: "deal-analyzer-program-pricing-and-state-conclusions",
  stateRules: "state-rules-primary-authority-and-effective-dates",
  strUnderwriting: "str-underwriting-income-and-jurisdiction-policy",
  taxEngine: "tax-engine-treatment-and-effective-date-rules",
  refiTracker: "refinance-tracker-loan-and-cost-schedule",
  portfolioRefi: "portfolio-refinance-loan-and-reserve-data",
  monteCarlo: "rate-path-simulation-calibration",
  armReset: "arm-reset-note-terms-and-payment-schedule",
  returns: "investment-returns-cash-flow-and-tax-schedule",
  stressMatrix: "stress-matrix-canonical-scenario-and-risk-thresholds",
  structureOptimizer: "structure-optimizer-schedules-pricing-and-ranking",
} as const satisfies Record<ReliabilityHoldKey, EvidenceSubjectId>;

export const HOLD_EVIDENCE_SUBJECTS = Object.freeze(holdEvidenceSubjects);

export function evidenceSubjectForHold(holdKey: ReliabilityHoldKey): EvidenceSubjectId {
  return HOLD_EVIDENCE_SUBJECTS[holdKey];
}
