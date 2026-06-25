import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = (Math.random() * 1e9).toString(36);
  logger.error({ err, requestId, path: req.path }, "Unhandled express error");
  
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    requestId,
  });
}
