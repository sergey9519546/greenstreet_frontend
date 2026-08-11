import express from "express";
import { createServer } from "node:http";
import { describe, expect, it, vi } from "vitest";

const engineService = vi.hoisted(() => ({
  runSolveDSCR: vi.fn(),
  runSensitivity: vi.fn(),
}));

vi.mock("../engineService", () => engineService);

import { dscrRouter } from "./dscr";

async function post(path: string, body: unknown) {
  const app = express();
  app.use(express.json());
  app.use("/api/dscr", dscrRouter);
  const server = createServer(app);

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start test server");

  try {
    return await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

describe("DSCR reliability holds", () => {
  it.each(["/api/dscr/optimize", "/api/dscr/state"])("returns a 503 hold for %s before validating inputs", async (path) => {
    const response = await post(path, { state: "not-a-state" });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "TOOL_RELIABILITY_HOLD",
    });
  });
});

describe("DSCR request validation", () => {
  const validDeal = { purchasePrice: 400_000, monthlyRent: 3_000, state: "TX" };

  // Validation must reject before the engine is reached — an unknown enum that
  // slipped through would be silently re-interpreted as a different loan
  // structure (worst case: an interest-only loan the borrower never asked for).
  it.each([
    ["propertyType", "MULTIFAMILY"],
    ["entityType", "PARTNERSHIP"],
    ["experience", "NOVICE"],
    ["loanPurpose", "REFI"],
    ["ioPeriod", "3_YR"],
    ["strategy", "FLIP"],
  ])("rejects %s=%s with 400 before invoking the engine", async (field, value) => {
    const response = await post("/api/dscr/solve", { ...validDeal, [field]: value });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.issues.map((issue: { field: string }) => issue.field)).toContain(field);
  });

  it.each(["/api/dscr/solve", "/api/dscr/sensitivity"])(
    "rejects a payload missing required core fields on %s",
    async (path) => {
      const response = await post(path, { state: "TX" });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({ error: "Validation failed" });
    },
  );
});

describe("DSCR analysis responses", () => {
  const validDeal = { purchasePrice: 400_000, monthlyRent: 3_000, state: "TX" };

  it("labels a solved analysis as preliminary and non-approving", async () => {
    engineService.runSolveDSCR.mockResolvedValueOnce({
      solvedRate: 7.125,
      dualTrackDSCR: { track1: { dscr: 1.15 } },
    });

    const response = await post("/api/dscr/solve", validDeal);

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      solvedRate: 7.125,
      analysisStatus: "preliminary",
      isLoanApproval: false,
      notice: expect.stringMatching(/not a loan approval/i),
    });
  });

  it("fails closed instead of serializing a non-finite solver result", async () => {
    engineService.runSolveDSCR.mockResolvedValueOnce({
      solvedRate: Number.POSITIVE_INFINITY,
    });

    const response = await post("/api/dscr/solve", validDeal);

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Analysis result unavailable.",
      code: "DSCR_RESULT_INVALID",
    });
  });
});
