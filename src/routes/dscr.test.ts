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

describe("DSCR reliability holds", () => {
  it.each(["/api/dscr/optimize", "/api/dscr/state"])("returns a 503 hold for %s before validating inputs", async (path) => {
    const response = await post(path, { state: "not-a-state" });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "TOOL_RELIABILITY_HOLD",
    });
  });
});
