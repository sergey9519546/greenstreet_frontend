import { Router } from "express";
import type { RequestHandler } from "express";
import { validateBody } from "../middleware/validate";
import { DealRequestSchema, StateRequestSchema } from "./schemas";
import {
  runSolveDSCR,
  runSensitivity,
  runOptimize,
  runStateRules,
} from "../engineService";

export const dscrRouter = Router();

export const PRELIMINARY_ANALYSIS_NOTICE =
  "This is a preliminary scenario analysis, not a loan approval, commitment, or offer. Final eligibility and terms require lender review and verification.";

const MAX_TREE_NODES = 2_000;
const MAX_TREE_DEPTH = 20;
const MAX_ABSOLUTE_NUMBER = 1_000_000_000;
const NUMERIC_RANGES: Record<string, readonly [number, number]> = {
  fico: [300, 850],
  creditscore: [300, 850],
  dscr: [0, 20],
  ltv: [0, 100],
  rate: [0, 100],
  interestrate: [0, 100],
  loanamount: [0, 100_000_000],
  propertyvalue: [0, 100_000_000],
  rent: [0, 10_000_000],
  monthlyrent: [0, 10_000_000],
  marketrent: [0, 10_000_000],
  leaserent: [0, 10_000_000],
};

class UnsafeDscrInputError extends Error {
  constructor() {
    super("Invalid analysis input");
    this.name = "UnsafeDscrInputError";
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertSafeNumericTree(value: unknown): void {
  const seen = new Set<object>();
  let nodes = 0;

  const visit = (candidate: unknown, key: string, depth: number): void => {
    nodes += 1;
    if (nodes > MAX_TREE_NODES || depth > MAX_TREE_DEPTH) throw new UnsafeDscrInputError();
    if (typeof candidate === "number") {
      if (!Number.isFinite(candidate) || Math.abs(candidate) > MAX_ABSOLUTE_NUMBER) {
        throw new UnsafeDscrInputError();
      }
      const range = NUMERIC_RANGES[key.toLowerCase()];
      if (range && (candidate < range[0] || candidate > range[1])) {
        throw new UnsafeDscrInputError();
      }
      return;
    }
    if (candidate === null || typeof candidate !== "object") return;
    if (seen.has(candidate)) throw new UnsafeDscrInputError();
    if (!Array.isArray(candidate) && !isPlainRecord(candidate)) throw new UnsafeDscrInputError();

    seen.add(candidate);
    if (Array.isArray(candidate)) {
      candidate.forEach((item) => visit(item, key, depth + 1));
    } else {
      Object.entries(candidate).forEach(([childKey, item]) => visit(item, childKey, depth + 1));
    }
    seen.delete(candidate);
  };

  visit(value, "", 0);
}

function minimumFinite(record: Record<string, unknown>, keys: readonly string[]): number | undefined {
  const values = keys
    .map((key) => record[key])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return values.length > 0 ? Math.min(...values) : undefined;
}

function applyConservativeRent(record: Record<string, unknown>): void {
  const rentTargets: ReadonlyArray<readonly [string, readonly string[]]> = [
    ["rent", ["rent", "leaseRent", "marketRent"]],
    ["monthlyRent", ["monthlyRent", "leaseRent", "marketRent"]],
    ["eligibleRent", ["eligibleRent", "rent", "monthlyRent", "leaseRent", "marketRent"]],
  ];
  for (const [target, candidates] of rentTargets) {
    if (typeof record[target] !== "number") continue;
    const conservativeRent = minimumFinite(record, candidates);
    if (conservativeRent !== undefined) record[target] = conservativeRent;
  }
}

function applyConservativeExpenseTotal(
  record: Record<string, unknown>,
  target: string,
  components: readonly string[]
): void {
  if (typeof record[target] !== "number") return;
  const presentComponents = components
    .map((key) => record[key])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (presentComponents.length === 0) return;
  record[target] = Math.max(record[target], presentComponents.reduce((sum, value) => sum + value, 0));
}

export function prepareDscrDeal<T>(body: T): T {
  assertSafeNumericTree(body);
  if (!isPlainRecord(body)) throw new UnsafeDscrInputError();

  const prepared: Record<string, unknown> = { ...body };
  applyConservativeRent(prepared);
  applyConservativeExpenseTotal(prepared, "monthlyExpenses", [
    "monthlyTaxes",
    "monthlyInsurance",
    "monthlyHoa",
    "monthlyManagement",
    "monthlyMaintenance",
    "monthlyOtherExpenses",
  ]);
  applyConservativeExpenseTotal(prepared, "annualExpenses", [
    "annualTaxes",
    "annualInsurance",
    "annualHoa",
    "annualManagement",
    "annualMaintenance",
    "annualOtherExpenses",
  ]);
  assertSafeNumericTree(prepared);
  return prepared as T;
}

export function preliminaryAnalysis(result: unknown): Record<string, unknown> {
  const payload = isPlainRecord(result) ? result : { result };
  return {
    ...payload,
    analysisStatus: "preliminary",
    isLoanApproval: false,
    notice: PRELIMINARY_ANALYSIS_NOTICE,
  };
}

function identityValidated<T>(body: T): T {
  assertSafeNumericTree(body);
  return body;
}

function createAnalysisHandler<T>(
  run: (input: T) => Promise<unknown>,
  prepare: (input: T) => T
): RequestHandler {
  return async (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    let input: T;
    try {
      input = prepare(req.body as T);
    } catch (error) {
      if (!(error instanceof UnsafeDscrInputError)) {
        next(error);
        return;
      }
      res.status(422).json({
        ok: false,
        error: {
          code: "invalid_analysis_input",
          message: "Check the scenario values and try again.",
        },
        issues: [{ field: "scenario", message: "Use finite values within the documented ranges." }],
      });
      return;
    }

    try {
      const result = await run(input);
      try {
        assertSafeNumericTree(result);
      } catch {
        throw new Error("Analysis service returned an unsafe numeric result");
      }
      res.json(preliminaryAnalysis(result));
    } catch (error) {
      next(error);
    }
  };
}

dscrRouter.post(
  "/solve",
  validateBody(DealRequestSchema),
  createAnalysisHandler(runSolveDSCR, prepareDscrDeal)
);
dscrRouter.post(
  "/sensitivity",
  validateBody(DealRequestSchema),
  createAnalysisHandler(runSensitivity, prepareDscrDeal)
);
dscrRouter.post(
  "/optimize",
  validateBody(DealRequestSchema),
  createAnalysisHandler(runOptimize, prepareDscrDeal)
);
dscrRouter.post(
  "/state",
  validateBody(StateRequestSchema),
  createAnalysisHandler(runStateRules, identityValidated)
);
