import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";
import { getAdminApp, getAdminAuth } from "../services/firebaseAdmin";

let adminInitialized = false;
try {
  getAdminApp();
  adminInitialized = true;
} catch (error: any) {
  // NOTE: this used to say verification would "fall back to mock context in
  // development mode" — it no longer does. See verifyFirebaseToken below: when
  // admin fails to initialize, requests are rejected (fail-closed) unless the
  // explicit ALLOW_DEV_AUTH_BYPASS opt-in is set outside production.
  const message = "firebase-admin initialization failed. Token verification is unavailable; requests will be rejected fail-closed.";
  if (process.env.NODE_ENV === "production") {
    logger.error({ error: error.message }, message);
  } else {
    logger.warn({ error: error.message }, message);
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

// Dev-only escape hatch for local work without real Firebase credentials.
// BOTH conditions are required, and NODE_ENV !== "production" makes this
// impossible to trigger in production regardless of any other misconfiguration.
function isDevBypassEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_AUTH_BYPASS === "true";
}

function attachMockDevUser(req: AuthenticatedRequest, reason: string) {
  // NOTE: never log any portion of the token — even partial JWTs can leak header/payload info
  logger.warn(
    { reason },
    "AUTH BYPASS: attaching mock dev-user-id identity (ALLOW_DEV_AUTH_BYPASS=true, non-production only)"
  );
  req.user = {
    uid: "dev-user-id",
    email: "dev-user@greenstreet.dev",
  };
}

/**
 * Express middleware to verify Firebase ID tokens.
 *
 * Fail-closed by design:
 *  - A present, valid token always yields the real decoded uid/email.
 *  - A present token that CANNOT be verified — bad signature/expired, or the
 *    firebase-admin SDK itself failed to initialize — is REJECTED (401). It is
 *    never treated as an authenticated mock user in production, and outside
 *    production only when ALLOW_DEV_AUTH_BYPASS=true (see isDevBypassEnabled).
 *    Previously this fell back to a static "dev-user-id" identity for ANY
 *    bearer value whenever admin wasn't initialized — a fail-OPEN bug that, in
 *    a misconfigured production deployment, authenticated every request.
 *  - A request with NO token at all is rejected only if REQUIRE_AUTH=true;
 *    otherwise it proceeds unauthenticated (req.user stays undefined). This
 *    global toggle is intentionally independent of NODE_ENV: /api/dscr/* is
 *    public/demo-mode by product design (see .env.production.example) and
 *    never keys behavior off req.user, so it must keep working anonymously in
 *    production. Routes that must NEVER be reachable anonymously (e.g.
 *    /api/narrate, which calls a paid third-party LLM) use the separate,
 *    unconditional `requireAuth` guard below instead of relying on this flag.
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
      const decodedToken = await getAdminAuth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      next();
      return;
    }

    // firebase-admin never initialized, so we have no way to verify this
    // token's authenticity. Fail closed instead of trusting it.
    if (isDevBypassEnabled()) {
      attachMockDevUser(req, "firebase-admin not initialized");
      next();
      return;
    }

    logger.error(
      "Auth misconfigured: firebase-admin is not initialized, so the presented token cannot " +
        "be verified. Rejecting request (fail-closed; set ALLOW_DEV_AUTH_BYPASS=true to bypass in non-production)."
    );
    res.status(401).json({ error: "Unauthorized: Auth service unavailable" });
  } catch (error: any) {
    logger.warn({ error: error.message }, "Firebase ID token verification failed");
    res.status(401).json({ error: "Unauthorized: Invalid ID token" });
  }
}

/**
 * Guard for routes that must NEVER be reachable without a real authenticated
 * user — e.g. endpoints that call a paid third-party LLM. Mount this AFTER
 * verifyFirebaseToken, on the specific route(s) that need it (see
 * serverApp.ts's /api/narrate mount). Unlike verifyFirebaseToken's
 * REQUIRE_AUTH toggle, this guard is unconditional in every environment: no
 * req.user (neither a real verified user nor the explicit dev-bypass mock)
 * means 401, full stop.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized: authentication required" });
    return;
  }
  next();
}
