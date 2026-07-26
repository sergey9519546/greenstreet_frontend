import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { DealRequestSchema, StateRequestSchema } from "./schemas";
import {
  runSolveDSCR,
  runSensitivity,
  runOptimize,
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

// ── Loan Optimizer — offloaded to Worker ─────────────────────────────────────
dscrRouter.post("/optimize", validateBody(DealRequestSchema), async (req, res, next) => {
  try {
    const result = await runOptimize(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
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
