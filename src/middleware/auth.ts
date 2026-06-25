import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { logger } from "../logger";

let adminInitialized = false;
try {
  // Initialize firebase-admin if not already initialized
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  adminInitialized = true;
} catch (error: any) {
  logger.warn(
    { error: error.message },
    "firebase-admin initialization failed. Token verification will fall back to mock context in development mode."
  );
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

/**
 * Express middleware to verify Firebase ID tokens.
 * If REQUIRE_AUTH is true, it enforces a valid Authorization header.
 * Otherwise, it decodes the token if present but allows unauthenticated requests to pass.
 */
export async function verifyFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (process.env.REQUIRE_AUTH === "true") {
      res.status(401).json({ error: "Unauthorized: Missing ID token" });
      return;
    }
    next();
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    if (adminInitialized) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    } else {
      // In local development where admin SDK is not fully credentialed, fallback to mock user
      logger.info({ token: token.slice(0, 10) + "..." }, "Bypassing token verification in development fallback");
      req.user = {
        uid: "dev-user-id",
        email: "dev-user@greenstreet.dev",
      };
    }
    next();
  } catch (error: any) {
    logger.warn({ error: error.message }, "Firebase ID token verification failed");
    res.status(401).json({ error: "Unauthorized: Invalid ID token" });
  }
}
