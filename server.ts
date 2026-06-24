import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Anthropic from "@anthropic-ai/sdk";
import dns from "node:dns";
import fs from "node:fs";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z, ZodError } from "zod";

import { logger, logRequest } from "./src/logger";
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

// ── Env validation at startup ────────────────────────────────────────────────
const REQUIRED_ENV: Record<string, string> = {
  ANTHROPIC_AUTH_TOKEN: "AI narration (/api/narrate) will be disabled",
};
for (const [key, impact] of Object.entries(REQUIRED_ENV)) {
  if (!process.env[key] || process.env[key]?.startsWith("MY_")) {
    logger.warn({ key, impact }, `[startup] WARNING: env var not set`);
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ── Request Logging ──────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    // Log API routes, ignore static assets
    if (req.path.startsWith("/api/")) {
      logRequest(req.method, req.path, res.statusCode, duration, { ip: req.ip });
    }
  });
  next();
});

// ── Security headers (manual lightweight version — no helmet dep needed) ─────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ── Rate limiters ─────────────────────────────────────────────────────────────
const narrateLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 10,               // 10 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment before trying again." },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 120,              // 120 requests per minute per IP for deterministic endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
});

// ── Input validation schemas (Zod) ────────────────────────────────────────────
const STATE_REGEX = /^[A-Z]{2}$/;

const DealRequestSchema = z.object({
  // Core — always required
  purchasePrice: z.number({ message: "purchasePrice must be a number" })
    .positive("purchasePrice must be positive")
    .min(50_000, "purchasePrice must be at least $50,000")
    .max(50_000_000, "purchasePrice must not exceed $50,000,000"),
  monthlyRent: z.number({ message: "monthlyRent must be a number" })
    .min(0, "monthlyRent cannot be negative")
    .max(1_000_000, "monthlyRent seems unreasonably high"),
  state: z.string({ message: "state must be a string" })
    .transform((s) => s.trim().toUpperCase().slice(0, 2))
    .refine((s) => STATE_REGEX.test(s), "state must be a 2-letter US abbreviation"),

  // Optional — with range guards
  loanAmount:  z.number().positive().max(50_000_000).optional(),
  ltv:         z.number().min(50).max(90).optional(),
  ficoScore:   z.number().min(300).max(850).optional(),
  unitCount:   z.number().int().min(1).max(4).optional(),
  annualTaxes: z.number().min(0).max(1_000_000).optional(),
  annualInsurance: z.number().min(0).max(500_000).optional(),
  hoa:         z.number().min(0).optional(),
  floodInsurance: z.number().min(0).optional(),
  sqft:        z.number().min(100).max(50_000).optional(),
  yearBuilt:   z.number().int().min(1800).max(new Date().getFullYear() + 2).optional(),
  expectedHoldYears: z.number().min(1).max(50).optional(),
  availableReserves: z.number().min(0).optional(),
  existingFinancedProperties: z.number().int().min(0).max(200).optional(),
  points:       z.number().min(0).max(10).optional(),
  lenderFees:  z.number().min(0).optional(),
  brokerFees:  z.number().min(0).optional(),
  rateLockCost: z.number().min(0).optional(),
  marketRent:  z.number().min(0).optional(),
  strProjectedRent: z.number().min(0).optional(),
  strDocumentedRent: z.number().min(0).optional(),

  // Enums / booleans — permissive (engine applies defaults for unknown values)
  propertyType: z.string().optional(),
  entityType:   z.string().optional(),
  experience:   z.string().optional(),
  term:         z.string().optional(),
  ioPeriod:     z.string().optional(),
  armType:      z.string().optional(),
  prepayPreference: z.string().optional(),
  loanPurpose:  z.string().optional(),
  strategy:     z.string().optional(),
  hoaSTRPolicy: z.string().optional(),
  isCondotel:   z.boolean().optional(),
  isNonWarrantable: z.boolean().optional(),
  isRural:      z.boolean().optional(),
  isForeignNational: z.boolean().optional(),
  isUSCitizenOrPR:   z.boolean().optional(),
  isFirstResponder:  z.boolean().optional(),
});

const StateRequestSchema = z.object({
  state:       z.string().transform((s) => s.trim().toUpperCase().slice(0, 2))
               .refine((s) => STATE_REGEX.test(s), "state must be a 2-letter US abbreviation"),
  entityType:  z.string().optional().default("LLC"),
  loanAmount:  z.number().positive().max(50_000_000).optional().default(400_000),
  unitCount:   z.number().int().min(1).max(4).optional().default(1),
  productType: z.string().optional().default("FIXED"),
});

// Helper: validate request body and return 400 on failure
function validateBody<T>(schema: z.ZodSchema<T>, body: unknown, res: Response): T | null {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    res.status(400).json({ error: "Validation failed", issues });
    return null;
  }
  return result.data;
}

// Vite/SPA static serving handles / and index.html automatically.

// ── Anthropic client (lazy init) ──────────────────────────────────────────────
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

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: process.env.npm_package_version || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// ── DSCR Solve — deterministic, no LLM ───────────────────────────────────────
app.post("/api/dscr/solve", apiLimiter, (req, res) => {
  const data = validateBody(DealRequestSchema, req.body, res);
  if (!data) return;
  try {
    const { property, borrower, loan, strategy } = buildEngineInputs(data as any);
    const deal = solveDSCR(property, borrower, loan, strategy);

    const fitResults = matchLenders(property, borrower, loan, strategy, deal.solvedRate);
    const scoreResult = scoreLenderMatch(fitResults, loan, borrower, strategy);
    const topLenders = scoreResult.topPicks.map((p) => ({
      name: p.lenderName,
      score: p.totalScore,
      tier: p.tier,
      rank: p.rankAmongEligible,
      topReasons: p.topReasons.slice(0, 2),
    }));

    return res.json({ deal, topLenders });
  } catch (err: any) {
    logger.error({ err }, "solve error");
    return res.status(500).json({ error: err.message || "Engine solve failed." });
  }
});

// ── Sensitivity / Breakeven — deterministic, no LLM ─────────────────────────
app.post("/api/dscr/sensitivity", apiLimiter, (req, res) => {
  const data = validateBody(DealRequestSchema, req.body, res);
  if (!data) return;
  try {
    const { property, borrower, loan, strategy } = buildEngineInputs(data as any);
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
    logger.error({ err }, "sensitivity error");
    return res.status(500).json({ error: err.message || "Sensitivity computation failed." });
  }
});

// ── Loan Optimizer — deterministic, no LLM ───────────────────────────────────
app.post("/api/dscr/optimize", apiLimiter, (req, res) => {
  const data = validateBody(DealRequestSchema, req.body, res);
  if (!data) return;
  try {
    const { property, borrower, loan, strategy } = buildEngineInputs(data as any);
    const options = generateStructureOptions(property, borrower, loan, strategy);
    return res.json({ options });
  } catch (err: any) {
    logger.error({ err }, "optimize error");
    return res.status(500).json({ error: err.message || "Optimizer failed." });
  }
});

// ── State PPP / Prepay Rules — deterministic, no LLM ─────────────────────────
app.post("/api/dscr/state", apiLimiter, (req, res) => {
  const data = validateBody(StateRequestSchema, req.body, res);
  if (!data) return;
  try {
    const ppp = checkPPPLegal(data.state, data.entityType as any, data.loanAmount, data.unitCount, data.productType as any);
    return res.json({ state: data.state, ppp });
  } catch (err: any) {
    logger.error({ err, state: data?.state }, "state error");
    return res.status(500).json({ error: err.message || "State lookup failed." });
  }
});

// ── Narrate — LLM endpoint: plain-English explanation of computed results ─────
app.post("/api/narrate", narrateLimiter, async (req, res) => {
  if (!process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_AUTH_TOKEN.startsWith("MY_")) {
    return res.status(503).json({ error: "ANTHROPIC_AUTH_TOKEN not configured." });
  }
  try {
    const { deal, context } = req.body;
    if (!deal || typeof deal !== "object") {
      return res.status(400).json({ error: "deal result object is required" });
    }

    const ai = getClaudeClient();
    const { dscr, solvedRate, dealBreakRate, rateHeadroomBps, dualTrackDSCR } = deal;

    // Guard against missing fields that would produce NaN in the prompt
    if (typeof dscr !== "number" || typeof solvedRate !== "number") {
      return res.status(400).json({ error: "deal must contain numeric dscr and solvedRate" });
    }

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
    return res.json({ narrative: text });
  } catch (err: any) {
    logger.error({ err }, "narrate error");
    return res.status(500).json({ error: err.message || "Narration failed." });
  }
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const requestId = (Math.random() * 1e9).toString(36);
  logger.error({ err, requestId, path: req.path }, "Unhandled express error");
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    requestId,
  });
});

// ── Vite dev middleware + production static ────────────────────────────────────
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, "Greenstreet DSCR Engine started");
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    logger.info({ signal }, "Shutdown signal received. Closing server gracefully...");
    server.close(() => {
      logger.info("All connections closed. Exiting.");
      process.exit(0);
    });
    // Force-kill if shutdown takes too long
    setTimeout(() => {
      logger.error("Forced exit after timeout.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}

startServer();
