import { describe, expect, it } from "vitest";
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";
import {
  HOLD_EVIDENCE_SUBJECTS,
  evidenceSubjectForHold,
} from "./holdEvidenceSubjects";
import type { ReliabilityHoldKey } from "./holdEvidenceSubjects";

const CURRENT_HOLD_KEYS_AND_PATHS = [
  ["workspace", "/investgo"],
  ["decisionSupport", "/tools/decision-support"],
  ["rateQuiz", "/rate-quiz"],
  ["dealAnalyzer", "/deal-analyzer"],
  ["stateRules", "/state-laws"],
  ["strUnderwriting", "/tools/str-underwriting"],
  ["taxEngine", "/tools/tax-engine"],
  ["refiTracker", "/tools/refi-tracker"],
  ["portfolioRefi", "/tools/portfolio"],
  ["monteCarlo", "/tools/monte-carlo"],
  ["armReset", "/tools/arm-reset"],
  ["returns", "/tools/returns"],
  ["stressMatrix", "/tools/stress-matrix"],
  ["structureOptimizer", "/tools/structure-optimizer"],
] as const;

describe("hold evidence subjects", () => {
  it("snapshots the current fourteen reliability-hold keys and public paths", () => {
    const currentHolds = Object.entries(TOOL_RELIABILITY_HOLDS).map(([key, definition]) => [
      key,
      definition.path,
    ]);

    expect(currentHolds).toEqual(CURRENT_HOLD_KEYS_AND_PATHS);
    expect(currentHolds).toHaveLength(14);
  });

  it("maps every current hold to one unique stable evidence subject", () => {
    const holdKeys = Object.keys(TOOL_RELIABILITY_HOLDS) as ReliabilityHoldKey[];
    const mappedKeys = Object.keys(HOLD_EVIDENCE_SUBJECTS);
    const mappedSubjects = Object.values(HOLD_EVIDENCE_SUBJECTS);

    expect(mappedKeys).toEqual(holdKeys);
    expect(mappedSubjects).toHaveLength(holdKeys.length);
    expect(new Set(mappedSubjects).size).toBe(mappedSubjects.length);
    expect(mappedSubjects.every((subject) => /^[a-z][a-z0-9-]*$/.test(subject))).toBe(true);
    expect(Object.isFrozen(HOLD_EVIDENCE_SUBJECTS)).toBe(true);

    for (const holdKey of holdKeys) {
      expect(evidenceSubjectForHold(holdKey)).toBe(HOLD_EVIDENCE_SUBJECTS[holdKey]);
    }
  });

  it("keeps the hold-to-subject contract explicit and stable", () => {
    expect(HOLD_EVIDENCE_SUBJECTS).toEqual({
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
    });
  });
});
