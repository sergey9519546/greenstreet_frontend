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
} as const satisfies Record<string, ToolReliabilityHoldDefinition>;
