import express from "express";
import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
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

describe("DSCR tool endpoints", () => {
  it("runs a deterministic structure comparison for a validated deal", async () => {
    const response = await post("/api/dscr/optimize", {
      loanAmount: 300_000,
      annualRatePct: 7,
      monthlyRent: 3_200,
      monthlyNonDebtCosts: 650,
    });

    expect(response.status).toBe(200);
    const body = await response.json() as { options: unknown[]; disclaimer: string };
    expect(body.options).toHaveLength(3);
    expect(body.disclaimer).toContain("not a recommendation");
  });

  it("returns a sourced state-reference result for a validated state", async () => {
    const response = await post("/api/dscr/state", {
      state: "CA",
      entityType: "LLC",
      loanAmount: 400_000,
      unitCount: 1,
      productType: "FIXED",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      state: "CA",
      transactionFacts: {
        entityType: "LLC",
        loanAmount: 400_000,
      },
      verificationQuestions: expect.any(Array),
      disclaimer: expect.stringContaining("Verification checklist"),
    });
  });

  it.each(["/api/dscr/optimize", "/api/dscr/state"])("validates inputs for %s", async (path) => {
    const response = await post(path, { state: "not-a-state" });
    expect(response.status).toBe(400);
  });
});
