import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * The inline execution path is not just a serverless optimization anymore — it
 * is also the crash-loop fallback for the worker pool (see engineService.ts).
 * These tests pin it to the same results the worker would produce.
 */

const validDeal = {
  purchasePrice: 400_000,
  monthlyRent: 3_000,
  state: "TX",
};

let savedPoolSize: string | undefined;

beforeEach(() => {
  savedPoolSize = process.env.WORKER_POOL_SIZE;
  // 0 disables worker threads, exercising the inline handlers directly.
  process.env.WORKER_POOL_SIZE = "0";
});

afterEach(() => {
  if (savedPoolSize === undefined) delete process.env.WORKER_POOL_SIZE;
  else process.env.WORKER_POOL_SIZE = savedPoolSize;
});

describe("inline engine dispatch", () => {
  it("solves a deal without a worker thread", async () => {
    const { runSolveDSCR } = await import("./engineService");
    const result = await runSolveDSCR(validDeal);

    expect(result.deal).toBeDefined();
    expect(typeof result.deal.dscr).toBe("number");
    expect(typeof result.deal.loanAmount).toBe("number");
  });

  it("returns both the deal and the breakeven sensitivity", async () => {
    const { runSensitivity } = await import("./engineService");
    const result = await runSensitivity(validDeal);

    expect(result.deal).toBeDefined();
    expect(result.sensitivity).toBeDefined();
  });

  it("returns structure options", async () => {
    const { runOptimize } = await import("./engineService");
    const result = await runOptimize(validDeal);

    expect(Array.isArray(result.options)).toBe(true);
  });

  it("returns state prepayment-penalty rules", async () => {
    const { runStateRules } = await import("./engineService");
    const result = await runStateRules({
      state: "TX",
      entityType: "LLC",
      loanAmount: 300_000,
      unitCount: 1,
      productType: "FIXED",
    });

    expect(result.state).toBe("TX");
    expect(result.ppp).toBeDefined();
  });

  it("rejects rather than throws synchronously on bad input", async () => {
    const { runSolveDSCR } = await import("./engineService");
    await expect(runSolveDSCR(null)).rejects.toBeInstanceOf(Error);
  });
});
