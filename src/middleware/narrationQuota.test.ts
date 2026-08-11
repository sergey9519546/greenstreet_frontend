import express from "express";
import { createServer } from "node:http";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createNarrationQuota } from "./narrationQuota";

const QUOTA_ENV_KEYS = [
  "NARRATION_QUOTA_MAX_REQUESTS",
  "NARRATION_QUOTA_WINDOW_SECONDS",
] as const;

let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = Object.fromEntries(QUOTA_ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of QUOTA_ENV_KEYS) delete process.env[key];
});

afterEach(() => {
  for (const key of QUOTA_ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

async function loadNarrationQuota() {
  const modulePath = "./narrationQuota";
  return import(modulePath);
}

describe("narration quota boundary", () => {
  it("exports a durable authenticated-user quota middleware factory", async () => {
    const quota = await loadNarrationQuota();

    expect(quota.createNarrationQuota).toEqual(expect.any(Function));
  });

  it("uses a transactional, hashed per-user Firestore window and rejects the twenty-first request", async () => {
    const docs = new Map<string, Record<string, unknown>>();
    const firestore = {
      collection: vi.fn((collectionName: string) => ({
        doc: (id: string) => ({ path: `${collectionName}/${id}`, id }),
      })),
      runTransaction: vi.fn(async (work: (transaction: any) => Promise<unknown>) =>
        work({
          get: async (reference: { path: string }) => ({
            exists: docs.has(reference.path),
            data: () => docs.get(reference.path),
          }),
          set: (reference: { path: string }, data: Record<string, unknown>) =>
            docs.set(reference.path, data),
        }),
      ),
    };
    const quota = createNarrationQuota({
      firestore: firestore as any,
      now: () => 1_000,
    });
    const app = express();
    app.use((req, _res, next) => {
      (req as any).user = { uid: "borrower-uid-123" };
      next();
    });
    app.post("/", quota, (_req, res) => res.status(204).end());

    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Could not start test server");

    try {
      const responses: Response[] = [];
      for (let requestNumber = 0; requestNumber < 21; requestNumber += 1) {
        responses.push(
          await fetch(`http://127.0.0.1:${address.port}/`, { method: "POST" }),
        );
      }

      expect(responses.slice(0, 20).every((response) => response.status === 204)).toBe(true);
      expect(responses[20].status).toBe(429);
      expect(responses[20].headers.get("cache-control")).toBe("no-store");
      expect(responses[20].headers.get("retry-after")).toBe("3600");
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }

    expect(firestore.runTransaction).toHaveBeenCalledTimes(21);
    expect(docs.size).toBe(1);
    const [documentPath, stored] = [...docs.entries()][0];
    expect(documentPath).not.toContain("borrower-uid-123");
    expect(documentPath).toMatch(/^narrationQuota\/[a-f0-9]{64}$/);
    expect(JSON.stringify(stored)).not.toContain("borrower-uid-123");
  });

  it("fails closed when durable quota storage is unavailable", async () => {
    const quota = createNarrationQuota({
      firestore: {
        runTransaction: async () => {
          throw new Error("synthetic permission denied");
        },
      } as any,
    });
    let downstreamReached = false;
    const app = express();
    app.use((req, _res, next) => {
      (req as any).user = { uid: "borrower-uid-123" };
      next();
    });
    app.post("/", quota, (_req, res) => {
      downstreamReached = true;
      res.status(204).end();
    });
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Could not start test server");

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/`, { method: "POST" });

      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      await expect(response.json()).resolves.toEqual({
        error: "Narration is temporarily unavailable.",
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }

    expect(downstreamReached).toBe(false);
  });

  it("fails closed rather than silently defaulting after invalid quota configuration", async () => {
    const previousMaximum = process.env.NARRATION_QUOTA_MAX_REQUESTS;
    process.env.NARRATION_QUOTA_MAX_REQUESTS = "not-a-number";
    const firestore = {
      collection: (collectionName: string) => ({
        doc: (id: string) => ({ path: `${collectionName}/${id}`, id }),
      }),
      runTransaction: vi.fn(async (work: (transaction: any) => Promise<unknown>) =>
        work({
          get: async () => ({ exists: false, data: () => undefined }),
          set: () => undefined,
        }),
      ),
    };
    const quota = createNarrationQuota({ firestore: firestore as any });
    const app = express();
    app.use((req, _res, next) => {
      (req as any).user = { uid: "borrower-uid-123" };
      next();
    });
    app.post("/", quota, (_req, res) => res.status(204).end());
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Could not start test server");

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/`, { method: "POST" });

      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      await expect(response.json()).resolves.toEqual({
        error: "Narration is temporarily unavailable.",
      });
    } finally {
      if (previousMaximum === undefined) delete process.env.NARRATION_QUOTA_MAX_REQUESTS;
      else process.env.NARRATION_QUOTA_MAX_REQUESTS = previousMaximum;
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }

    expect(firestore.runTransaction).not.toHaveBeenCalled();
  });
});
