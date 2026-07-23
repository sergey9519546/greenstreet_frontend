import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../logger";
import { validateBody } from "../middleware/validate";
import { NarrateRequestSchema } from "./schemas";

// NOTE: authentication is enforced upstream, not in this file — serverApp.ts
// mounts the `requireAuth` guard (src/middleware/auth.ts) in front of this
// router so it can never be reached by an anonymous caller. Do not remount
// this router elsewhere without that guard; it calls a paid, rate-limited LLM.
export const narrateRouter = Router();

const isProd = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────────────────────────────────
// PRIVACY / DATA RESIDENCY (human decision required): every request handled
// below sends real borrower financial data (DSCR, solved rate, deal-break
// rate, and free-text deal context) to whatever host ANTHROPIC_BASE_URL
// resolves to. There is intentionally NO hardcoded fallback endpoint here
// anymore — this used to silently default to a third-party proxy
// (https://api.z.ai/api/anthropic), meaning borrower data could egress to an
// unreviewed vendor with no one having explicitly opted into that. Whether
// z.ai (or any other Anthropic-compatible proxy) is an acceptable destination
// for this data is a BUSINESS decision that requires a signed DPA / privacy
// review with that vendor — it must be made explicitly by setting
// ANTHROPIC_BASE_URL in the environment, never fallen into by omission.
// ─────────────────────────────────────────────────────────────────────────
const CONFIGURED_BASE_URL = process.env.ANTHROPIC_BASE_URL;

let aiClient: Anthropic | null = null;
function getClaudeClient(): Anthropic {
  if (!aiClient) {
    aiClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_AUTH_TOKEN || "",
      // Deliberately no hardcoded third-party fallback. If CONFIGURED_BASE_URL
      // is undefined, the Anthropic SDK itself re-reads ANTHROPIC_BASE_URL and
      // then falls back to the real https://api.anthropic.com — never a
      // hardcoded proxy. In production we don't even get this far without an
      // explicit value (see the 503 guard in the route handler below).
      baseURL: CONFIGURED_BASE_URL,
    });
  }
  return aiClient;
}

// "claude-sonnet-4-6" is NOT a valid Anthropic model id (Anthropic's models
// are named like "claude-sonnet-4-5-20250929", "claude-opus-4-1-...", etc. —
// see https://docs.claude.com/en/docs/about-claude/models). This string only
// makes sense if ANTHROPIC_BASE_URL points at a compatible proxy that
// recognizes it as an alias (e.g. the z.ai routing referenced above). Set
// ANTHROPIC_MODEL explicitly to a valid id for whichever provider
// ANTHROPIC_BASE_URL points at — do not rely on this fallback in production.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

// ── Narrate — LLM endpoint: plain-English explanation of computed results ─────
narrateRouter.post("/", validateBody(NarrateRequestSchema), async (req, res, next) => {
  if (!process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_AUTH_TOKEN.startsWith("MY_")) {
    res.status(503).json({ error: "ANTHROPIC_AUTH_TOKEN not configured." });
    return;
  }
  if (isProd && !CONFIGURED_BASE_URL) {
    // Refuse to guess a destination for borrower financial data in
    // production. See the privacy/data-residency note above — the endpoint
    // must be configured deliberately, never defaulted silently.
    logger.error(
      "ANTHROPIC_BASE_URL is not set in production. Refusing to send borrower financial data " +
        "to an undeclared LLM endpoint; disabling /api/narrate until it is configured."
    );
    res.status(503).json({ error: "Narration is temporarily unavailable." });
    return;
  }
  try {
    const { deal, context } = req.body;
    const ai = getClaudeClient();
    const { dscr, solvedRate, dealBreakRate, rateHeadroomBps, dualTrackDSCR } = deal;

    // Guard against NaN/Infinity from upstream computation — never let malformed
    // numbers reach the prompt string or the AI call.
    const safeNum = (v: unknown, decimals: number): string => {
      const n = Number(v);
      return Number.isFinite(n) ? n.toFixed(decimals) : "N/A";
    };

    const prompt = `DSCR underwriting result for a real estate investor evaluating this deal:
- DSCR: ${safeNum(dscr, 2)}x
- Solved Rate: ${safeNum(solvedRate, 3)}%
- Deal-Break Rate: ${typeof dealBreakRate === "number" && Number.isFinite(dealBreakRate) ? dealBreakRate.toFixed(3) : "N/A"}% (${typeof rateHeadroomBps === "number" && Number.isFinite(rateHeadroomBps) ? rateHeadroomBps : "N/A"} bps headroom)
- Track 1 (Lender Qualification): ${dualTrackDSCR?.track1?.passes ? "PASSES" : "FAILS"}
- Track 2 (Investor Survival): ${dualTrackDSCR?.track2?.passes ? "PASSES" : "FAILS"}
- Summary: ${dualTrackDSCR?.verdict?.summary ?? ""}
${context ? `\nAdditional context: ${String(context).slice(0, 500)}` : ""}

Write 2-3 sentences in plain English directly to the real estate investor who owns this deal. They are NOT a finance expert. Focus on what this means for their deal. Do NOT recite the numbers back verbatim — interpret them. Do NOT mention Claude or AI.`;

    const response = await ai.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: "You are a DSCR lending advisor speaking directly to the real estate investor who will own and fund this deal. Write plain, honest, advisor-to-investor language. Never generate new numbers. 2-3 sentences max.",
      messages: [{ role: "user", content: prompt }],
    });

    // Only return the text content — never echo back the request body or any env vars
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    res.json({ narrative: text });
  } catch (err) {
    // Errors are forwarded to the global handler which strips internal details
    next(err);
  }
});
