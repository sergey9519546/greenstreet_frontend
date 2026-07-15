import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";

import { logger } from "./logger";
import { leadRateLimit } from "./middleware/leadRateLimit";
import { dscrRouter } from "./routes/dscr";
import { leadsRouter } from "./routes/leads";
import { narrateRouter } from "./routes/narrate";
import { requireFirebaseToken } from "./middleware/auth";

export const app = express();

// Trust no forwarding proxy by default. Deployments behind a known proxy chain
// must set the exact number of hops so client-controlled X-Forwarded-For values
// cannot be used to evade IP-based abuse controls.
const trustProxyHopsRaw = process.env.TRUST_PROXY_HOPS ?? "0";
if (!/^\d+$/.test(trustProxyHopsRaw) || Number(trustProxyHopsRaw) > 10) {
  throw new Error("TRUST_PROXY_HOPS must be an integer between 0 and 10");
}
app.set("trust proxy", Number(trustProxyHopsRaw));

// Explicitly remove the X-Powered-By header so the runtime stack is not disclosed.
app.disable("x-powered-by");

// Request logging and security headers must precede authentication and rate
// limiting so their early error responses receive the same protections.
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  res.on("finish", () => {
    if (req.path.startsWith("/api/")) {
      const statusCode = res.statusCode;
      logger.info(
        {
          requestId,
          method: req.method,
          path: req.path,
          statusCode,
          durationMs: Date.now() - start,
          outcome:
            statusCode >= 500 ? "server_error" : statusCode >= 400 ? "client_error" : "success",
        },
        "API request completed"
      );
    }
  });
  next();
});

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

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

if (process.env.REQUIRE_AUTH === "true") {
  app.use("/api/dscr", apiLimiter, requireFirebaseToken, dscrRouter);
} else {
  app.use("/api/dscr", apiLimiter, dscrRouter);
}
app.use("/api/leads", apiLimiter, leadRateLimit, leadsRouter);
app.use("/api/narrate", narrateLimiter, narrateRouter);

type ErrorLike = {
  status?: unknown;
  statusCode?: unknown;
  code?: unknown;
  type?: unknown;
  message?: unknown;
  expose?: unknown;
};

function errorLike(error: unknown): ErrorLike {
  return error !== null && (typeof error === "object" || typeof error === "function")
    ? (error as ErrorLike)
    : {};
}

function errorStatus(error: unknown): number {
  const candidate = errorLike(error);
  if (candidate.type === "entity.too.large") return 413;
  if (candidate.type === "entity.parse.failed") return 400;

  for (const value of [candidate.status, candidate.statusCode]) {
    if (Number.isInteger(value) && Number(value) >= 400 && Number(value) <= 599) {
      return Number(value);
    }
  }
  return 500;
}

function defaultError(status: number): { code: string; message: string } {
  switch (status) {
    case 400:
      return { code: "BAD_REQUEST", message: "The request is malformed." };
    case 401:
      return { code: "UNAUTHORIZED", message: "Authentication is required." };
    case 403:
      return { code: "FORBIDDEN", message: "The request is not permitted." };
    case 404:
      return { code: "NOT_FOUND", message: "The requested API route was not found." };
    case 409:
      return { code: "CONFLICT", message: "The request conflicts with current state." };
    case 413:
      return { code: "PAYLOAD_TOO_LARGE", message: "The request body is too large." };
    case 422:
      return { code: "VALIDATION_ERROR", message: "Request validation failed." };
    case 429:
      return { code: "RATE_LIMITED", message: "Too many requests." };
    case 502:
      return { code: "BAD_GATEWAY", message: "The engine returned an invalid response." };
    case 503:
      return { code: "SERVICE_UNAVAILABLE", message: "The service is temporarily unavailable." };
    case 504:
      return { code: "GATEWAY_TIMEOUT", message: "The engine request timed out." };
    default:
      return { code: "INTERNAL_ERROR", message: "An internal error occurred." };
  }
}

function requestIdFromResponse(res: Response): string | undefined {
  if (typeof res.locals?.requestId === "string") return res.locals.requestId;
  const header = res.getHeader("X-Request-ID");
  return typeof header === "string" ? header : undefined;
}

export function sendStructuredError(res: Response, error: unknown): void {
  const status = errorStatus(error);
  const fallback = defaultError(status);
  const candidate = errorLike(error);
  const exposedCode =
    status < 500 &&
    typeof candidate.code === "string" &&
    /^[A-Z][A-Z0-9_]{1,63}$/.test(candidate.code)
      ? candidate.code
      : fallback.code;
  const exposedMessage =
    status < 500 &&
    candidate.expose === true &&
    typeof candidate.message === "string" &&
    candidate.message.length > 0 &&
    candidate.message.length <= 256
      ? candidate.message.replace(/[\r\n\t]+/g, " ")
      : fallback.message;
  const requestId = requestIdFromResponse(res);

  res.status(status).json({
    error: {
      code: exposedCode,
      message: exposedMessage,
      ...(requestId ? { requestId } : {}),
    },
  });
}

// Keep API misses and all propagated failures JSON-shaped; never fall through to
// Express's HTML error response or expose an engine/worker exception.
app.use("/api", (_req: Request, res: Response) => {
  sendStructuredError(res, { status: 404 });
});

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  sendStructuredError(res, error);
});
