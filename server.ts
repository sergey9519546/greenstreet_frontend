import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Anthropic from "@anthropic-ai/sdk";
import dns from "node:dns";
import fs from "node:fs";

import { buildEngineInputs } from './src/engine/inputs';
import {
  solveDSCR,
  matchLenders,
  scoreLenderMatch,
  checkPPPLegal,
  computeBreakevenResult,
  generateStructureOptions,
} from './src/engine/index';

dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// ── Static marketing page (rebranded Webflow dump) ─────────────────────
// Served at "/" so the original Webflow visual loads verbatim. Webflow CSS,
// jQuery, GSAP, Swiper, HubSpot all execute as designed.
const MARKETING_PATHS = new Set([
  "/", "/index.html",
]);
const marketingHtml = fs.existsSync(path.join(process.cwd(), "marketing-page.html"))
  ? fs.readFileSync(path.join(process.cwd(), "marketing-page.html"), "utf-8")
  : null;

function isMarketingRoute(reqPath: string): boolean {
  // Serve the static marketing page at "/" only. All other routes
  // (/dscrgo, /tools/*, /about, /blog, /case-studies, etc.) go to the
  // React app where React Router handles them.
  return MARKETING_PATHS.has(reqPath);
}

if (marketingHtml) {
  app.get("/", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(marketingHtml);
  });
  app.get("/index.html", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(marketingHtml);
  });
  console.log(`[marketing] serving rebranded Webflow dump at / (${marketingHtml.length} bytes)`);
}

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

const MODEL = "claude-sonnet-4-6";

// ---------------------------------------------------------------
// DSCR Solve — deterministic, no LLM
// ---------------------------------------------------------------
app.post("/api/dscr/solve", (req, res) => {
  try {
    const { property, borrower, loan, strategy } = buildEngineInputs(req.body);
    const deal = solveDSCR(property, borrower, loan, strategy);

    // Top 3 lenders — small provenance summary only
    const fitResults = matchLenders(property, borrower, loan, strategy, deal.solvedRate);
    const scoreResult = scoreLenderMatch(fitResults, loan, borrower, strategy);
    const topLenders = scoreResult.topPicks.map(p => ({
      name: p.lenderName,
      score: p.totalScore,
      tier: p.tier,
      rank: p.rankAmongEligible,
      topReasons: p.topReasons.slice(0, 2),
    }));

    return res.json({ deal, topLenders });
  } catch (err: any) {
    console.error("solve error:", err);
    return res.status(500).json({ error: err.message || "Engine solve failed." });
  }
});

// ---------------------------------------------------------------
// Sensitivity / Breakeven — deterministic, no LLM
// ---------------------------------------------------------------
app.post("/api/dscr/sensitivity", (req, res) => {
  try {
    const { property, borrower, loan, strategy } = buildEngineInputs(req.body);
    const deal = solveDSCR(property, borrower, loan, strategy);

    const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
    const sensitivity = computeBreakevenResult(
      deal.qualifyingRent,
      deal.monthlyPITIA.total,
      deal.loanAmount,
      deal.solvedRate,
      termYears,
      property.annualTaxes,
      property.annualInsurance,
      property.hoa,
      property.floodInsurance ?? 0,
      property.purchasePrice,
      loan.ltv,
    );

    return res.json({ deal, sensitivity });
  } catch (err: any) {
    console.error("sensitivity error:", err);
    return res.status(500).json({ error: err.message || "Sensitivity computation failed." });
  }
});

// ---------------------------------------------------------------
// Loan Optimizer — deterministic, no LLM
// ---------------------------------------------------------------
app.post("/api/dscr/optimize", (req, res) => {
  try {
    const { property, borrower, loan, strategy } = buildEngineInputs(req.body);
    const options = generateStructureOptions(property, borrower, loan, strategy);
    return res.json({ options });
  } catch (err: any) {
    console.error("optimize error:", err);
    return res.status(500).json({ error: err.message || "Optimizer failed." });
  }
});

// ---------------------------------------------------------------
// State PPP / Prepay Rules — deterministic, no LLM
// ---------------------------------------------------------------
app.post("/api/dscr/state", (req, res) => {
  try {
    const { state, entityType = "LLC", loanAmount = 400000, unitCount = 1, productType = "FIXED" } = req.body;
    if (!state) return res.status(400).json({ error: "state required" });

    const abbrev = (state || "").trim().toUpperCase().slice(0, 2);
    const ppp = checkPPPLegal(abbrev, entityType, loanAmount, unitCount, productType);
    return res.json({ state: abbrev, ppp });
  } catch (err: any) {
    console.error("state error:", err);
    return res.status(500).json({ error: err.message || "State lookup failed." });
  }
});

// ---------------------------------------------------------------
// Narrate — ONLY LLM endpoint: takes a computed result, returns
// a 2-3 sentence plain-English explanation. No numbers generated.
// ---------------------------------------------------------------
app.post("/api/narrate", async (req, res) => {
  if (!process.env.ANTHROPIC_AUTH_TOKEN) {
    return res.status(503).json({ error: "ANTHROPIC_AUTH_TOKEN not set." });
  }
  try {
    const { deal, context } = req.body;
    if (!deal) return res.status(400).json({ error: "deal result required" });

    const ai = getClaudeClient();
    const { dscr, solvedRate, dealBreakRate, rateHeadroomBps, dualTrackDSCR } = deal;

    const prompt = `DSCR underwriting result for a broker to explain to a borrower:
- DSCR: ${dscr.toFixed(2)}x
- Solved Rate: ${solvedRate.toFixed(3)}%
- Deal-Break Rate: ${dealBreakRate.toFixed(3)}% (${rateHeadroomBps} bps headroom)
- Track 1 (lender qual): ${dualTrackDSCR.track1.passes ? "PASSES" : "FAILS"}
- Track 2 (investor survival): ${dualTrackDSCR.track2.passes ? "PASSES" : "FAILS"}
- Summary: ${dualTrackDSCR.verdict.summary}
${context ? `\nAdditional context: ${context}` : ""}

Write 2-3 sentences in plain English for a real estate investor who is NOT a finance expert. Focus on what this means for their deal. Do NOT recite the numbers back verbatim — interpret them. Do NOT mention Claude or AI.`;

    const response = await ai.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: "You are a DSCR lending advisor. Write plain, honest, broker-to-client language. Never generate new numbers. 2-3 sentences max.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return res.json({ narrative: text });
  } catch (err: any) {
    console.error("narrate error:", err);
    return res.status(500).json({ error: err.message || "Narration failed." });
  }
});

// ---------------------------------------------------------------
// Vite dev middleware + production static
// ---------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Greenstreet DSCR Engine → http://0.0.0.0:${PORT}`);
  });
}

startServer();
