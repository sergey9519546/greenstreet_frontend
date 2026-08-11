import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // Body-parser runs before the lead router, so malformed or oversized JSON
  // would otherwise leak parser-specific messages through the generic 4xx
  // branch below. Keep every intake validation failure on one stable contract.
  if (
    req.path.startsWith("/api/leads") &&
    (err?.type === "entity.parse.failed" || err?.type === "entity.too.large")
  ) {
    // Parsing failed before the lead router could set its no-store policy.
    // Keep malformed/oversized intake attempts out of browser and proxy caches.
    res.set("Cache-Control", "no-store");
    res.status(400).json({ error: "Invalid lead submission" });
    return;
  }

  const requestId = (Math.random() * 1e9).toString(36);
  const status = typeof err?.status === "number" && err.status >= 400 && err.status < 600
    ? err.status
    : 500;
  const errorType = err?.type === "entity.parse.failed"
    ? "malformed_json"
    : err?.type === "entity.too.large"
      ? "payload_too_large"
      : status < 500
        ? "client_error"
        : "server_error";

  // Never pass the raw error or request into the logger. Body-parser attaches
  // the complete raw request body to `err.body`, and arbitrary error messages,
  // paths, or headers may contain credentials or personal information.
  logger.error({ errorType, requestId, status }, "Unhandled express error");

  // For 4xx errors caused by the client (bad input etc.), surface a safe message.
  // For 5xx, never reflect internal details — return a generic message + requestId for tracing.
  const message = status < 500
    ? (err.message || "Bad request")
    : "Internal server error";

  res.status(status).json({ error: message, requestId });
}
