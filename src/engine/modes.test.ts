import { describe, it, expect } from "vitest";
import { runSolveDSCR } from "../engineService";

describe("DSCR Execution Modes", () => {
  const samplePayload = {
    purchasePrice: 400000,
    monthlyRent: 3000,
    state: "TX",
    loanAmount: 300000,
    ltv: 75,
    ficoScore: 740,
    unitCount: 1,
    annualTaxes: 4800,
    annualInsurance: 1200,
    hoa: 0,
    strategy: "LTR",
  };

  it("calculates successfully in synchronous fallback mode (WORKER_POOL_SIZE = 0)", async () => {
    // Force synchronous main thread execution mode
    const originalPoolSize = process.env.WORKER_POOL_SIZE;
    process.env.WORKER_POOL_SIZE = "0";

    try {
      const result = await runSolveDSCR(samplePayload);
      expect(result).toBeDefined();
      expect(result.deal).toBeDefined();
      expect(result.deal.dscr).toBeGreaterThan(1.0);
      expect(result.deal.solvedRate).toBeCloseTo(6.125, 3); // Flagship computed solved rate is 6.125%
    } finally {
      // Restore pool size configuration
      if (originalPoolSize !== undefined) {
        process.env.WORKER_POOL_SIZE = originalPoolSize;
      } else {
        delete process.env.WORKER_POOL_SIZE;
      }
    }
  });
});
