import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The store factory is a fail-safe: a misconfigured Firestore option must never
 * take rate limiting offline, and it must never silently pretend the in-memory
 * store survives cold starts.
 */

const admin = vi.hoisted(() => ({
  initFails: false,
  firestore: undefined as any,
}));

vi.mock("../services/firebaseAdmin", () => ({
  getAdminApp: () => {
    if (admin.initFails) throw new Error("firebase-admin credentials unavailable");
    return {};
  },
  getAdminFirestore: () => {
    if (admin.initFails) throw new Error("firebase-admin credentials unavailable");
    return admin.firestore;
  },
}));

const log = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), fatal: vi.fn() }));
vi.mock("../logger", () => ({ logger: log, logRequest: vi.fn() }));

const ENV_KEYS = ["NODE_ENV", "RATE_LIMIT_FIRESTORE"] as const;
let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of ENV_KEYS) delete process.env[key];
  admin.initFails = false;
  admin.firestore = undefined;
  Object.values(log).forEach((fn) => fn.mockReset());
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

async function loadModule() {
  vi.resetModules();
  return import("./rateLimitStore");
}

describe("createRateLimitStore", () => {
  it("keeps the library's memory store when the Firestore opt-in is unset", async () => {
    const { createRateLimitStore } = await loadModule();
    expect(createRateLimitStore("api")).toBeUndefined();
  });

  it("warns exactly once in production that memory counters are per-instance", async () => {
    process.env.NODE_ENV = "production";
    const { createRateLimitStore } = await loadModule();

    createRateLimitStore("api");
    createRateLimitStore("leads");
    createRateLimitStore("narrate");

    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(String(log.warn.mock.calls[0][0])).toContain("cold start");
  });

  it("stays quiet outside production", async () => {
    process.env.NODE_ENV = "development";
    const { createRateLimitStore } = await loadModule();

    createRateLimitStore("api");

    expect(log.warn).not.toHaveBeenCalled();
  });

  it("falls back to memory (and logs) when RATE_LIMIT_FIRESTORE=true but admin is not initialized", async () => {
    process.env.RATE_LIMIT_FIRESTORE = "true";
    admin.initFails = true;
    const { createRateLimitStore } = await loadModule();

    expect(createRateLimitStore("api")).toBeUndefined();
    expect(log.error).toHaveBeenCalledTimes(1);
  });

  it("returns the Firestore store when opted in and admin is available", async () => {
    process.env.RATE_LIMIT_FIRESTORE = "true";
    const { createRateLimitStore, FirestoreRateLimitStore } = await loadModule();

    expect(createRateLimitStore("api")).toBeInstanceOf(FirestoreRateLimitStore);
  });
});

describe("FirestoreRateLimitStore", () => {
  /** Minimal Firestore double: one in-memory document map plus a transaction shim. */
  function fakeFirestore() {
    const docs = new Map<string, any>();
    const db = {
      collection: (_name: string) => ({
        doc: (id: string) => ({ id }),
      }),
      runTransaction: async (fn: (tx: any) => Promise<any>) =>
        fn({
          get: async (ref: { id: string }) => ({
            exists: docs.has(ref.id),
            data: () => docs.get(ref.id),
          }),
          set: (ref: { id: string }, data: any) => docs.set(ref.id, data),
        }),
    };
    return { db, docs };
  }

  it("increments within a window and starts a fresh window after expiry", async () => {
    process.env.RATE_LIMIT_FIRESTORE = "true";
    const { FirestoreRateLimitStore } = await loadModule();
    const { db, docs } = fakeFirestore();
    admin.firestore = db;

    const store = new FirestoreRateLimitStore("api");
    store.init({ windowMs: 60_000 } as any);

    const first = await store.increment("1.2.3.4");
    const second = await store.increment("1.2.3.4");

    expect(first.totalHits).toBe(1);
    expect(second.totalHits).toBe(2);
    expect(second.resetTime).toEqual(first.resetTime);

    // Separate clients get separate windows.
    expect((await store.increment("5.6.7.8")).totalHits).toBe(1);

    // Expire the window by hand; the next hit must restart the count even if
    // the Firestore TTL policy has not reaped the document yet.
    for (const [id, value] of docs) docs.set(id, { ...value, expiresAtMs: Date.now() - 1 });
    expect((await store.increment("1.2.3.4")).totalHits).toBe(1);
  });

  it("degrades to in-process counting instead of throwing when Firestore fails", async () => {
    process.env.RATE_LIMIT_FIRESTORE = "true";
    const { FirestoreRateLimitStore } = await loadModule();
    admin.firestore = {
      collection: () => {
        throw new Error("permission denied");
      },
    };

    const store = new FirestoreRateLimitStore("api");
    store.init({ windowMs: 60_000 } as any);

    await expect(store.increment("1.2.3.4")).resolves.toMatchObject({ totalHits: 1 });
    await expect(store.increment("1.2.3.4")).resolves.toMatchObject({ totalHits: 2 });
    // Logged once, not once per request.
    expect(log.error).toHaveBeenCalledTimes(1);

    store.shutdown();
  });
});
