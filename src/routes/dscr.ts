import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { DealRequestSchema } from "./schemas";
import {
  runSolveDSCR,
  runSensitivity,
} from "../engineService";

export const dscrRouter = Router();

const TOOL_RELIABILITY_HOLD_CODE = "TOOL_RELIABILITY_HOLD";

function sendToolReliabilityHold(res: import("express").Response, error: string) {
  return res.status(503).json({ error, code: TOOL_RELIABILITY_HOLD_CODE });
}

// ── DSCR Solve — deterministic math offloaded to Worker ──────────────────────
dscrRouter.post("/solve", validateBody(DealRequestSchema), async (req, res, next) => {
  try {
    const result = await runSolveDSCR(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── Sensitivity / Breakeven — offloaded to Worker ────────────────────────────
dscrRouter.post("/sensitivity", validateBody(DealRequestSchema), async (req, res, next) => {
  try {
    const result = await runSensitivity(req.body);
    res.json(result);
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
