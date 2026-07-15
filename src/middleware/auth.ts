import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { logger } from "../logger";

try {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
} catch (error: unknown) {
  logger.warn(
    { errorType: error instanceof Error ? error.name : "UnknownError" },
    "firebase-admin initialization failed; protected routes will fail closed"
  );
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

function developmentBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_DEV_AUTH_BYPASS === "true"
  );
}

function firebaseErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return error instanceof Error ? error.name : "UnknownError";
}

function bearerToken(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token ? token : null;
}

async function applyFirebaseAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  required: boolean
): Promise<void> {
  if (req.user?.uid) {
    next();
    return;
  }

  if (developmentBypassEnabled()) {
    req.user = { uid: "development-auth-bypass" };
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  const token = bearerToken(authHeader);

  if (!authHeader) {
    if (required) {
      res.status(401).json({ error: "Unauthorized: Missing ID token" });
      return;
    }
    next();
    return;
  }

  if (!token) {
    res.status(401).json({ error: "Unauthorized: Invalid authorization header" });
    return;
  }

  if (admin.apps.length === 0) {
    logger.error("Firebase authentication is unavailable");
    res.status(503).json({ error: "Authentication service unavailable" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error: unknown) {
    logger.warn(
      { errorCode: firebaseErrorCode(error) },
      "Firebase ID token verification failed"
    );
    res.status(401).json({ error: "Unauthorized: Invalid ID token" });
  }
}

/**
 * Decodes a Firebase token when present. REQUIRE_AUTH=true preserves the
 * historical global-auth behavior, while route-specific paid APIs should use
 * requireFirebaseToken directly.
 */
export async function verifyFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await applyFirebaseAuthentication(
    req,
    res,
    next,
    process.env.REQUIRE_AUTH === "true"
  );
}

/** Fail-closed Firebase authentication for protected routes. */
export async function requireFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await applyFirebaseAuthentication(req, res, next, true);
}
