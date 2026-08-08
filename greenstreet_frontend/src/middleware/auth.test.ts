import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Fail-closed auth coverage.
 *
 * The regression these tests exist for: when firebase-admin fails to
 * initialize, the middleware used to attach a static "dev-user-id" identity to
 * ANY request carrying a bearer token. In a misconfigured production deploy
 * that authenticates the whole internet. The rules asserted below are:
 *   - production: never a mock user, no matter what env vars say;
 *   - non-production: mock user ONLY with the explicit ALLOW_DEV_AUTH_BYPASS
 *     opt-in, otherwise 401.
 */

const admin = vi.hoisted(() => ({
  initFails: true,
  verifyIdToken: vi.fn(),
}));

vi.mock("../services/firebaseAdmin", () => ({
  getAdminApp: () => {
    if (admin.initFails) throw new Error("firebase-admin credentials unavailable");
    return {};
  },
  getAdminAuth: () => ({ verifyIdToken: admin.verifyIdToken }),
}));

vi.mock("../logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), fatal: vi.fn() },
  logRequest: vi.fn(),
}));

/** auth.ts probes firebase-admin at module load, so each case needs a fresh module instance. */
async function loadAuth() {
  vi.resetModules();
  return import("./auth");
}

function mockReq(headers: Record<string, string> = {}) {
  return { headers } as any;
}

function mockRes() {
  const res: any = {};
  res.statusCode = undefined;
  res.body = undefined;
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((body: unknown) => {
    res.body = body;
    return res;
  });
  return res;
}

const ENV_KEYS = ["NODE_ENV", "ALLOW_DEV_AUTH_BYPASS", "REQUIRE_AUTH"] as const;
let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of ENV_KEYS) delete process.env[key];
  admin.initFails = true;
  admin.verifyIdToken.mockReset();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

describe("verifyFirebaseToken when firebase-admin failed to initialize", () => {
  it("rejects a bearer token in production instead of injecting a mock user", async () => {
    process.env.NODE_ENV = "production";
    const { verifyFirebaseToken } = await loadAuth();

    const req = mockReq({ authorization: "Bearer anything" });
    const res = mockRes();
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it("ignores ALLOW_DEV_AUTH_BYPASS in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.ALLOW_DEV_AUTH_BYPASS = "true";
    const { verifyFirebaseToken } = await loadAuth();

    const req = mockReq({ authorization: "Bearer anything" });
    const res = mockRes();
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it("fails closed in development when the opt-in is absent", async () => {
    process.env.NODE_ENV = "development";
    const { verifyFirebaseToken } = await loadAuth();

    const req = mockReq({ authorization: "Bearer anything" });
    const res = mockRes();
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it.each(["1", "TRUE", "yes", ""])(
    "fails closed in development when ALLOW_DEV_AUTH_BYPASS is %j rather than the exact string 'true'",
    async (value) => {
      process.env.NODE_ENV = "development";
      process.env.ALLOW_DEV_AUTH_BYPASS = value;
      const { verifyFirebaseToken } = await loadAuth();

      const req = mockReq({ authorization: "Bearer anything" });
      const res = mockRes();
      const next = vi.fn();

      await verifyFirebaseToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(req.user).toBeUndefined();
    },
  );

  it("attaches the mock dev user only with the explicit non-production opt-in", async () => {
    process.env.NODE_ENV = "development";
    process.env.ALLOW_DEV_AUTH_BYPASS = "true";
    const { verifyFirebaseToken } = await loadAuth();

    const req = mockReq({ authorization: "Bearer anything" });
    const res = mockRes();
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toEqual({ uid: "dev-user-id", email: "dev-user@greenstreet.dev" });
  });
});

describe("verifyFirebaseToken when firebase-admin is initialized", () => {
  beforeEach(() => {
    admin.initFails = false;
  });

  it("attaches the verified identity from the decoded token", async () => {
    process.env.NODE_ENV = "production";
    admin.verifyIdToken.mockResolvedValue({ uid: "real-uid", email: "investor@example.com" });
    const { verifyFirebaseToken } = await loadAuth();

    const req = mockReq({ authorization: "Bearer good-token" });
    const res = mockRes();
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(admin.verifyIdToken).toHaveBeenCalledWith("good-token");
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ uid: "real-uid", email: "investor@example.com" });
  });

  it("401s an unverifiable token, and never substitutes the dev identity", async () => {
    process.env.NODE_ENV = "development";
    process.env.ALLOW_DEV_AUTH_BYPASS = "true";
    admin.verifyIdToken.mockRejectedValue(new Error("token expired"));
    const { verifyFirebaseToken } = await loadAuth();

    const req = mockReq({ authorization: "Bearer expired-token" });
    const res = mockRes();
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(req.user).toBeUndefined();
  });
});

describe("requests without a bearer token", () => {
  it("proceeds unauthenticated by default so public /api/dscr keeps working", async () => {
    process.env.NODE_ENV = "production";
    const { verifyFirebaseToken } = await loadAuth();

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
  });

  it("is rejected when REQUIRE_AUTH=true", async () => {
    process.env.NODE_ENV = "production";
    process.env.REQUIRE_AUTH = "true";
    const { verifyFirebaseToken } = await loadAuth();

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await verifyFirebaseToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
});

describe("requireAuth", () => {
  it("401s when no user was attached", async () => {
    const { requireAuth } = await loadAuth();
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it("passes a request that carries a user", async () => {
    const { requireAuth } = await loadAuth();
    const req = mockReq();
    req.user = { uid: "real-uid" };
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
