import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { logger, logRequest } from "./logger";
import { errorHandler } from "./middleware/error";
import { dscrRouter } from "./routes/dscr";
import { narrateRouter } from "./routes/narrate";
import { verifyFirebaseToken, requireAuth } from "./middleware/auth";

export const app = express();

const isProd = process.env.NODE_ENV === "production";

// This app is only ever reached through a reverse-proxy hop (Firebase Hosting
// rewrite -> Cloud Functions v2, per firebase.json + src/function.ts), so
// Express's default req.ip (from the raw socket) does not reflect the real
// client address. Trust exactly one hop so req.ip resolves from
// X-Forwarded-For correctly — this is what narrateLimiter/apiLimiter key on.
app.set("trust proxy", 1);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Production MUST set ALLOWED_ORIGINS explicitly — there is no placeholder
// domain to silently fall back to. Only non-production gets a default, and
// that default is localhost-only.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : isProd
    ? []
    : ["http://localhost:3000", "http://localhost:5173"];

if (isProd && allowedOrigins.length === 0) {
  logger.error(
    "ALLOWED_ORIGINS is not set in production. No cross-origin browser request will be allowed until it is configured."
  );
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  })
);

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
app.use((_req: Request, res: Response, next: NextFunction) => {
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
  // Defense-in-depth: this app only ever returns JSON API responses (the SPA
  // itself is served separately by Firebase Hosting), so a strict default-src
  // is safe here and doesn't need to account for any script/style/font origins.
  res.setHeader("Content-Security-Policy", "default-src 'none'");
  next();
});

// ── Rate limiters ─────────────────────────────────────────────────────────────
// Note: In a true serverless environment, memory-based limiters reset on cold starts.
// For production scale, replace this with a Redis store or Firestore store.
const narrateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: process.env.npm_package_version || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/dscr", apiLimiter, dscrRouter);
// /api/narrate calls a paid third-party LLM. Beyond rate limiting, it must
// never be reachable anonymously: requireAuth (src/middleware/auth.ts) 401s
// any request that verifyFirebaseToken did not attach a user to (real, or the
// explicit non-production dev-bypass mock).
app.use("/api/narrate", narrateLimiter, requireAuth, narrateRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);
