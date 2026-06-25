import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { logger, logRequest } from "./logger";
import { errorHandler } from "./middleware/error";
import { dscrRouter } from "./routes/dscr";
import { narrateRouter } from "./routes/narrate";
import { verifyFirebaseToken } from "./middleware/auth";

export const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:5173", "https://your-firebase-app.web.app"];

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
app.use(verifyFirebaseToken);

// ── Request Logging ──────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api/")) {
      logRequest(req.method, req.path, res.statusCode, duration, { ip: req.ip });
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
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  // Disable powerful features not used by this API
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
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
app.use("/api/narrate", narrateLimiter, narrateRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);
