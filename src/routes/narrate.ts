import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../logger";
import { validateBody } from "../middleware/validate";
import { NarrateRequestSchema } from "./schemas";

export const narrateRouter = Router();

let aiClient: Anthropic | null = null;
function getClaudeClient(): Anthropic {
  if (!aiClient) {
    aiClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_AUTH_TOKEN || "",
      baseURL: process.env.ANTHROPIC_BASE_URL || "https://api.z.ai/api/anthropic",
    });
  }
  return aiClient;
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

// ── Narrate — LLM endpoint: plain-English explanation of computed results ─────
narrateRouter.post("/", validateBody(NarrateRequestSchema), async (req, res, next) => {
  if (!process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_AUTH_TOKEN.startsWith("MY_")) {
    res.status(503).json({ error: "ANTHROPIC_AUTH_TOKEN not configured." });
    return;
  }
  try {
    const { deal, context } = req.body;
    const ai = getClaudeClient();
    const { dscr, solvedRate, dealBreakRate, rateHeadroomBps, dualTrackDSCR } = deal;

    const prompt = `DSCR underwriting result for a broker to explain to a borrower:
- DSCR: ${dscr.toFixed(2)}x
- Solved Rate: ${solvedRate.toFixed(3)}%
- Deal-Break Rate: ${typeof dealBreakRate === "number" ? dealBreakRate.toFixed(3) : "N/A"}% (${rateHeadroomBps ?? "N/A"} bps headroom)
- Track 1 (lender qual): ${dualTrackDSCR?.track1?.passes ? "PASSES" : "FAILS"}
- Track 2 (investor survival): ${dualTrackDSCR?.track2?.passes ? "PASSES" : "FAILS"}
- Summary: ${dualTrackDSCR?.verdict?.summary ?? ""}
${context ? `\nAdditional context: ${String(context).slice(0, 500)}` : ""}

Write 2-3 sentences in plain English for a real estate investor who is NOT a finance expert. Focus on what this means for their deal. Do NOT recite the numbers back verbatim — interpret them. Do NOT mention Claude or AI.`;

    const response = await ai.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: "You are a DSCR lending advisor. Write plain, honest, broker-to-client language. Never generate new numbers. 2-3 sentences max.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    res.json({ narrative: text });
  } catch (err) {
    next(err);
  }
});
