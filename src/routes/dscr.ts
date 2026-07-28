import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { DealRequestSchema, StateRequestSchema, StructureCompareRequestSchema } from "./schemas";
import {
  runSolveDSCR,
  runSensitivity,
} from "../engineService";
import { calculatePI } from "../engine";

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

// ── Loan-structure comparison — deterministic, input-bound options ──────────
dscrRouter.post("/optimize", validateBody(StructureCompareRequestSchema), async (req, res, next) => {
  try {
    const { loanAmount, annualRatePct, monthlyRent, monthlyNonDebtCosts } = req.body;
    const options = [
      { id: "30-year", name: "30-year amortizing", months: 360 },
      { id: "40-year", name: "40-year amortizing", months: 480 },
      { id: "interest-only", name: "Interest-only period", months: 0 },
    ].map((option) => {
      const monthlyPrincipalAndInterest = option.months > 0
        ? calculatePI(loanAmount, annualRatePct, option.months)
        : loanAmount * (annualRatePct / 100 / 12);
      const fullMonthlyPayment = monthlyPrincipalAndInterest + monthlyNonDebtCosts;
      return {
        id: option.id,
        name: option.name,
        monthlyPrincipalAndInterest,
        fullMonthlyPayment,
        dscr: fullMonthlyPayment > 0 ? monthlyRent / fullMonthlyPayment : 0,
      };
    });
    res.json({
      options,
      disclaimer:
        "Modeled options use the supplied assumptions. They are not a recommendation, program match, quote, approval, rate lock, or commitment to lend.",
    });
  } catch (err) {
    next(err);
  }
});

// ── State PPP / Prepay reference — validated request, sourced engine output ──
dscrRouter.post("/state", validateBody(StateRequestSchema), async (req, res, next) => {
  try {
    const { state, entityType, loanAmount, unitCount, productType } = req.body;
    res.json({
      state,
      transactionFacts: { entityType, loanAmount, unitCount, productType },
      verificationQuestions: [
        `Which prepayment provisions are permitted for this ${productType} business-purpose transaction in ${state} on the proposed closing date?`,
        `Does the ${entityType} borrower structure or $${Math.round(loanAmount).toLocaleString("en-US")} loan amount change the rule or any threshold?`,
        `Do the ${unitCount} financed residential unit${unitCount === 1 ? "" : "s"} change which statute or exemption applies?`,
        "What does the responsible provider's current written policy allow, and which primary source supports it?",
      ],
      disclaimer:
        "Verification checklist only. It does not state the law or provider policy. Confirm the transaction date and facts with qualified counsel and the responsible provider.",
    });
  } catch (err) {
    next(err);
  }
});
