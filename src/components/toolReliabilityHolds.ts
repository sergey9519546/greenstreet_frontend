import type { PageView } from "../router/resolve";

export interface ToolReliabilityHoldContent {
  title: string;
  reason: string;
  whatIsNeeded: readonly string[];
}

export interface ToolReliabilityHoldDefinition extends ToolReliabilityHoldContent {
  view: PageView;
  path: string;
}

/**
 * Content and intended route substitutions for public tools whose decision
 * outputs are held until their release evidence is complete.
 *
 * App uses this map to fail closed on routes whose models are still awaiting
 * the listed release evidence.
 */
export const TOOL_RELIABILITY_HOLDS = {
  workspace: {
    view: "portal",
    path: "/investgo",
    title: "InvestGO Workspace",
    reason:
      "The secure workspace is unavailable because its authentication and data-delivery configuration is not active in this environment.",
    whatIsNeeded: [
      "A verified production authentication configuration",
      "Authorized data access rules and account recovery",
      "End-to-end sign-in, persistence, and audit-log checks",
    ],
  },
  decisionSupport: {
    view: "decision-support",
    path: "/tools/decision-support",
    title: "Decision Support",
    reason:
      "We are validating that every recommendation uses the same approved deal assumptions and verified program data.",
    whatIsNeeded: [
      "One approved scenario and debt schedule across every result",
      "Verified program terms with source and review dates",
      "Regression tests for every recommendation outcome",
    ],
  },
  rateQuiz: {
    view: "rate-quiz",
    path: "/rate-quiz",
    title: "Rate Estimate",
    reason:
      "The published rate bands and program labels are not connected to an approved, versioned rate sheet and cannot be presented as current pricing or eligibility.",
    whatIsNeeded: [
      "An accountable owner for pricing and program data",
      "Versioned rate sheets with source and review dates",
      "Boundary tests for every adjustment and eligibility label",
    ],
  },
  dealAnalyzer: {
    view: "deal-analyzer",
    path: "/deal-analyzer",
    title: "Deal Analyzer",
    reason:
      "The shared DSCR arithmetic is valid, but this page still combines it with unverified program, pricing, and state-law conclusions.",
    whatIsNeeded: [
      "Remove or govern every program and rate output",
      "Use only counsel-reviewed state rules with effective dates",
      "Regression tests that separate arithmetic from eligibility decisions",
    ],
  },
  stateRules: {
    view: "state-laws",
    path: "/state-laws",
    title: "State Rules Reference",
    reason:
      "The legal effective dates and jurisdiction summaries have not completed counsel review, so the site cannot safely present them as current.",
    whatIsNeeded: [
      "Counsel-reviewed primary sources for every jurisdiction",
      "Transaction-date-aware effective-date handling",
      "A named reviewer and expiration date for each summary",
    ],
  },
  strUnderwriting: {
    view: "str-underwriting",
    path: "/tools/str-underwriting",
    title: "STR Underwriting",
    reason:
      "The income-selection, seasonality, and jurisdiction assumptions have not been reconciled to an approved provider policy.",
    whatIsNeeded: [
      "A provider-approved qualifying-income hierarchy",
      "Dated, jurisdiction-specific source data",
      "Golden tests for selected income, expenses, and DSCR",
    ],
  },
  taxEngine: {
    view: "tax-engine",
    path: "/tools/tax-engine",
    title: "Tax Engine",
    reason:
      "We are validating depreciation, passive-loss, recapture, and investment-income tax treatment before presenting tax-dependent results.",
    whatIsNeeded: [
      "Independent tax-professional review",
      "Versioned assumptions and effective-date citations",
      "Golden scenarios covering acquisition, operations, and sale",
    ],
  },
  monteCarlo: {
    view: "monte-carlo",
    path: "/tools/monte-carlo",
    title: "Rate-Path Simulation",
    reason:
      "We are validating rate-path assumptions and reset timing against the actual loan structure before publishing risk probabilities.",
    whatIsNeeded: [
      "Loan-specific ARM index, margin, caps, and reset dates",
      "Documented and reviewed model calibration",
      "Reproducible scenario and probability checks",
    ],
  },
  returns: {
    view: "returns",
    path: "/tools/returns",
    title: "Investment Returns",
    reason:
      "We are reconciling operating costs, capital expenditures, financing, taxes, and sale proceeds before publishing return metrics.",
    whatIsNeeded: [
      "One approved cash-flow schedule from acquisition through sale",
      "Explicit capex, reserve, tax, and disposition assumptions",
      "Independent checks for IRR, equity multiple, and after-tax results",
    ],
  },
  structureOptimizer: {
    view: "structure-optimizer",
    path: "/tools/structure-optimizer",
    title: "Structure Optimizer",
    reason:
      "We are validating payment schedules, rate units, and ranking criteria before recommending one loan structure over another.",
    whatIsNeeded: [
      "Structure-specific amortization and interest-only schedules",
      "Verified pricing inputs expressed in one rate unit",
      "Ranking tests using both lender coverage and investor cash flow",
    ],
  },
} as const satisfies Record<string, ToolReliabilityHoldDefinition>;
