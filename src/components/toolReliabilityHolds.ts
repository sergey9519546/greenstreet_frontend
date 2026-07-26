export interface ToolReliabilityHoldContent {
  title: string;
  reason: string;
  whatIsNeeded: readonly string[];
}

export interface ToolReliabilityHoldDefinition extends ToolReliabilityHoldContent {
  view: string;
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
  refiTracker: {
    view: "refi-tracker",
    path: "/tools/refi-tracker",
    title: "Refinance Tracker",
    reason:
      "We are validating payoff balance, closing costs, remaining term, and rate assumptions before showing a refinance recommendation.",
    whatIsNeeded: [
      "A complete current-loan amortization schedule",
      "Verified new-loan costs and payoff requirements",
      "Break-even tests across realistic hold periods",
    ],
  },
  portfolioRefi: {
    view: "portfolio",
    path: "/tools/portfolio",
    title: "Portfolio Refinance Review",
    reason:
      "We are validating cross-property debt, seasoning, and refinance assumptions before showing portfolio-level recommendations.",
    whatIsNeeded: [
      "Loan-level balances, terms, and payment schedules",
      "Consistent portfolio cash-flow and reserve treatment",
      "Recommendation tests for concentration and refinance timing",
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
  armReset: {
    view: "arm-reset",
    path: "/tools/arm-reset",
    title: "ARM Reset Review",
    reason:
      "We are validating index, margin, caps, payment schedule, and reset timing before showing an adjustable-rate recommendation.",
    whatIsNeeded: [
      "Loan-specific index, margin, caps, and reset dates",
      "A complete amortization and interest-only transition schedule",
      "Regression tests across every reset and payment-change boundary",
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
  stressMatrix: {
    view: "stress-matrix",
    path: "/tools/stress-matrix",
    title: "Stress Matrix",
    reason:
      "We are aligning every stress scenario to the same approved payment and operating-income basis before showing a risk verdict.",
    whatIsNeeded: [
      "One canonical base scenario shared by every stress",
      "Documented rent, vacancy, expense, and rate shocks",
      "Monotonicity and boundary tests for every risk classification",
    ],
  },
  structureOptimizer: {
    view: "optimize",
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
