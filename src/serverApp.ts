import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { logger, logRequest } from "./logger";
import { errorHandler } from "./middleware/error";
import { dscrRouter } from "./routes/dscr";
import { narrateRouter } from "./routes/narrate";
import { createLeadsRouter } from "./routes/leads";
import { verifyFirebaseToken, requireAuth } from "./middleware/auth";
import { createRateLimitStore } from "./middleware/rateLimitStore";

export const app = express();

const isProd = process.env.NODE_ENV === "production";

// This app is only ever reached through a reverse-proxy hop (Firebase Hosting
// rewrite -> Cloud Functions v2, per firebase.json + src/function.ts), so
// Express's default req.ip (from the raw socket) does not reflect the real
// client address. Trust exactly one hop so req.ip resolves from
// X-Forwarded-For correctly — this is what narrateLimiter/apiLimiter key on.
app.set("trust proxy", 1);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Keep the canonical first-party origin as the production fail-safe. Deployments
// can add exact HTTPS origins through ALLOWED_ORIGINS, while local development
// remains localhost-only.
function parseAllowedOrigins(value: string | undefined): string[] {
  const candidates = value
    ? value.split(",").map((origin) => origin.trim()).filter(Boolean)
    : isProd
      ? ["https://www.greenstreet.finance"]
      : ["http://localhost:3000", "http://localhost:5173"];

  return [...new Set(candidates.flatMap((candidate) => {
    try {
      const parsed = new URL(candidate);
      const isAllowedScheme = parsed.protocol === "https:" || (!isProd && parsed.protocol === "http:");
      return isAllowedScheme && parsed.origin === candidate ? [parsed.origin] : [];
    } catch {
      return [];
    }
  }))];
}

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

app.use(
  cors({
    // This merely controls browser response access. /api/leads additionally
    // enforces Origin server-side because CORS alone cannot stop a forged POST.
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
    credentials: false,
    methods: ["GET", "POST", "OPTIONS"],
  })
);

// Explicitly set trust proxy for Vercel/Firebase reverse proxies
app.set("trust proxy", 1);
// Hard cap on request body size — prevents memory/cost abuse from large payloads
app.use(express.json({ limit: "100kb" }));
// Explicitly remove the X-Powered-By header so the runtime stack is not disclosed
app.disable("x-powered-by");
// Scoped to /api/* only — health checks and static/SPA assets must stay
// reachable without a token (load balancer / uptime probes never send one).
app.use("/api", verifyFirebaseToken);

// ── Request Logging ──────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api/")) {
      // FLAG (human decision): req.ip is PII under GDPR/CCPA.
      // Options: (a) drop it entirely, (b) hash it, (c) only log in dev.
      // For now, only include IP in non-production to avoid logging raw IPs in prod.
      const extra = !isProd ? { ip: req.ip } : {};
      logRequest(req.method, req.path, res.statusCode, duration, extra);
    }
  });
  next();
});

// ── Security headers ─────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Prevent browsers from doing MIME-type sniffing for DNS prefetch
  res.setHeader("X-DNS-Prefetch-Control", "off");
  // Enforce HTTPS in production (1 year, include subdomains)
  if (isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  // Disable powerful features not used by this API
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Defense-in-depth for JSON responses. The standalone Node host also serves
  // the SPA from this same Express app; applying `default-src 'none'` to those
  // HTML responses blocks the Vite bundle, styles, and the marketing assets.
  // Keep the API policy narrow without breaking static delivery.
  if (req.path === "/health" || req.path === "/api" || req.path.startsWith("/api/")) {
    res.setHeader("Content-Security-Policy", "default-src 'none'");
  }
  next();
});

// ── Rate limiters ─────────────────────────────────────────────────────────────
// Persistence is pluggable (src/middleware/rateLimitStore.ts): Firestore-backed
// when RATE_LIMIT_FIRESTORE=true, otherwise the in-memory store — which resets
// on every serverless cold start and is NOT shared between concurrent
// instances. The store factory logs that caveat once in production so the real
// enforcement guarantee is never silently weaker than the configured numbers.
function createLimiter(bucket: string, windowMs: number, max: number) {
  const store = createRateLimitStore(bucket);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // Must be omitted (not passed as undefined) to keep the library default.
    ...(store ? { store } : {}),
  });
}

const narrateLimiter = createLimiter("narrate", 60 * 1000, 10);
const apiLimiter = createLimiter("api", 60 * 1000, 120);
const leadLimiter = createLimiter("leads", 15 * 60 * 1000, 5);

// ── API Routes ────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: process.env.npm_package_version || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/dscr", apiLimiter, dscrRouter);
app.use("/api/leads", leadLimiter, createLeadsRouter({ allowedOrigins }));
// /api/narrate calls a paid third-party LLM. Beyond rate limiting, it must
// never be reachable anonymously: requireAuth (src/middleware/auth.ts) 401s
// any request that verifyFirebaseToken did not attach a user to (real, or the
// explicit non-production dev-bypass mock).
app.use("/api/narrate", narrateLimiter, requireAuth, narrateRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);
