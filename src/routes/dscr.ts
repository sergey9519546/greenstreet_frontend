import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { DealRequestSchema } from "./schemas";
import {
  runSolveDSCR,
  runSensitivity,
} from "../engineService";

export const dscrRouter = Router();

const TOOL_RELIABILITY_HOLD_CODE = "TOOL_RELIABILITY_HOLD";
const ANALYSIS_RESULT_INVALID_CODE = "DSCR_RESULT_INVALID";
const PRELIMINARY_ANALYSIS_NOTICE =
  "This is a preliminary analysis, not a loan approval or commitment.";

function isSafeAnalysisResult(value: unknown, depth = 0, seen = { count: 0 }): boolean {
  if (depth > 16 || seen.count++ > 10_000) return false;
  if (value === null) return true;

  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string" || typeof value === "boolean") return true;
  if (Array.isArray(value)) {
    return value.length <= 1_000 && value.every((entry) => isSafeAnalysisResult(entry, depth + 1, seen));
  }
  if (typeof value !== "object") return false;

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Object.values(value).every((entry) => isSafeAnalysisResult(entry, depth + 1, seen));
}

function sendPreliminaryAnalysis(
  res: import("express").Response,
  result: unknown,
) {
  res.set("Cache-Control", "no-store");
  if (!result || Array.isArray(result) || !isSafeAnalysisResult(result)) {
    return res.status(503).json({
      error: "Analysis result unavailable.",
      code: ANALYSIS_RESULT_INVALID_CODE,
    });
  }

  return res.json({
    ...result,
    analysisStatus: "preliminary",
    isLoanApproval: false,
    notice: PRELIMINARY_ANALYSIS_NOTICE,
  });
}

function sendToolReliabilityHold(res: import("express").Response, error: string) {
  return res.status(503).json({ error, code: TOOL_RELIABILITY_HOLD_CODE });
}

// ── DSCR Solve — deterministic math offloaded to Worker ──────────────────────
dscrRouter.post("/solve", validateBody(DealRequestSchema), async (req, res, next) => {
  try {
    const result = await runSolveDSCR(req.body);
    sendPreliminaryAnalysis(res, result);
  } catch (err) {
    next(err);
  }
});

// ── Sensitivity / Breakeven — offloaded to Worker ────────────────────────────
dscrRouter.post("/sensitivity", validateBody(DealRequestSchema), async (req, res, next) => {
  try {
    const result = await runSensitivity(req.body);
    sendPreliminaryAnalysis(res, result);
  } catch (err) {
    next(err);
  }
});

// ── Loan Optimizer — fail closed pending model validation ────────────────────
dscrRouter.post("/optimize", (_req, res) => {
  sendToolReliabilityHold(
    res,
    "Structure recommendations are temporarily unavailable while payment schedules, rate units, and ranking criteria are independently validated.",
  );
});

// ── State PPP / Prepay Rules — fail closed pending counsel review ────────────
dscrRouter.post("/state", (_req, res) => {
  sendToolReliabilityHold(
    res,
    "State-rule conclusions are temporarily unavailable while jurisdiction summaries, effective dates, and primary sources complete counsel review.",
  );
});
