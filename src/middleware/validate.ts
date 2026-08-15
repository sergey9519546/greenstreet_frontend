import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { logger } from "../logger";

/** Long enough to name the offending field and the allowed values; short
 *  enough that a hostile payload cannot use the error path as an amplifier. */
const MAX_ISSUE_MESSAGE = 200;

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({
          field: i.path.join("."),
          // Zod's invalid_enum_value message embeds the received value in full,
          // so an oversized field is echoed verbatim into both the 400 body and
          // the retained log line below. /api/dscr/solve is anonymous and hands
          // the whole 100kb body straight to this middleware, which turned a
          // bad enum into a ~99kb response and a ~99kb log entry. Cap it.
          message:
            i.message.length > MAX_ISSUE_MESSAGE
              ? `${i.message.slice(0, MAX_ISSUE_MESSAGE)}… (truncated)`
              : i.message,
        }));
        logger.warn({ issues, path: req.path }, "Validation failed");
        res.status(400).json({ error: "Validation failed", issues });
        return;
      }
      next(error);
    }
  };
}
