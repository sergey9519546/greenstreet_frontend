import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = (Math.random() * 1e9).toString(36);
  // Log full error server-side (includes stack, message) — never send internals to client
  logger.error({ err, requestId, path: req.path }, "Unhandled express error");

  const status = typeof err.status === "number" && err.status >= 400 && err.status < 600
    ? err.status
    : 500;

  // For 4xx errors caused by the client (bad input etc.), surface a safe message.
  // For 5xx, never reflect internal details — return a generic message + requestId for tracing.
  const message = status < 500
    ? (err.message || "Bad request")
    : "Internal server error";

  res.status(status).json({ error: message, requestId });
}
