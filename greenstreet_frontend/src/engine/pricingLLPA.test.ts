import { describe, it, expect } from "vitest";
import { solveDSCR } from "./engine";
import { buildEngineInputs } from "./inputs";

function rate(overrides: Record<string, unknown>) {
  const { property, borrower, loan, strategy } = buildEngineInputs({
    purchasePrice: 400_000, monthlyRent: 3_000, state: "TX", ltv: 75, ficoScore: 740, ...overrides,
  });
  return solveDSCR(property, borrower, loan, strategy).solvedRate;
}

// LLPA grid additions (DSCR_PRICING_ENGINE_RESEARCH_REPORT §4.3).
describe("pricing LLPA — new adjusters", () => {
  it("first-time investor prices higher than experienced (same deal)", () => {
    const experienced = rate({ experience: "EXPERIENCED" });
    const firstTime = rate({ experience: "FIRST_TIME" });
    expect(firstTime).toBeGreaterThan(experienced);
    // ≥ the +37.5 bps adjuster (first-time also nudges other factors; total
    // lands within the doc's +25–50 bps first-time band).
    expect(firstTime - experienced).toBeGreaterThanOrEqual(0.375 - 1e-9);
    expect(firstTime - experienced).toBeLessThanOrEqual(0.5 + 1e-9);
  });

  it("longer prepay step-down lowers the rate (exit flexibility traded for rate)", () => {
    const open = rate({ prepayPreference: "NONE" });
    const fiveYr = rate({ prepayPreference: "54321" });
    expect(fiveYr).toBeLessThan(open);
  });

  it("the flagship profile (experienced + open prepay) is unchanged — new adjusters net to 0", () => {
    // Same defaults modes.test locks at 6.125; the additions must not move it.
    const flagship = rate({ experience: "EXPERIENCED", prepayPreference: "NONE" });
    const base = rate({});
    expect(flagship).toBe(base);
  });
});
