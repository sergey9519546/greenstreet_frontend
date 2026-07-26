import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { DealRequestSchema, StateRequestSchema } from "./schemas";
import {
  runSolveDSCR,
  runSensitivity,
  runStateRules,
} from "../engineService";

export const dscrRouter = Router();

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
dscrRouter.post("/optimize", validateBody(DealRequestSchema), (_req, res) => {
  res.status(503).json({
    error:
      "Structure recommendations are temporarily unavailable while payment schedules, rate units, and ranking criteria are independently validated.",
    code: "TOOL_RELIABILITY_HOLD",
  });
});

// ── State PPP / Prepay Rules — offloaded to Worker ───────────────────────────
dscrRouter.post("/state", validateBody(StateRequestSchema), async (req, res, next) => {
  try {
    const result = await runStateRules(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
