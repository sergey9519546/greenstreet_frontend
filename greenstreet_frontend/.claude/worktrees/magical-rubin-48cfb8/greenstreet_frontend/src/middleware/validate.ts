import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { logger } from "../logger";

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        logger.warn({ issues, path: req.path }, "Validation failed");
        res.status(400).json({ error: "Validation failed", issues });
        return;
      }
      next(error);
    }
  };
}
