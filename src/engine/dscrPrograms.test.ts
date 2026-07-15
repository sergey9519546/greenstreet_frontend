import { describe, expect, it } from "vitest";
import { explainNoProgramMatches, meetsInclusiveMaximum, meetsInclusiveMinimum, nudgeExactLowerBoundary, type ProgramGateCheck } from "./dscrPrograms";

describe("inclusive DSCR program boundaries", () => {
  it("accepts exact minimum and maximum values", () => {
    expect(meetsInclusiveMinimum(640, 640, 6)).toBe(true);
    expect(meetsInclusiveMaximum(80, 80, 2)).toBe(true);
    expect(meetsInclusiveMinimum(0.75, 0.75, 2)).toBe(true);
    expect(meetsInclusiveMinimum(75_000, 75_000, 2)).toBe(true);
  });

  it("nudges exact lower bounds only for strict downstream grid lookups", () => {
    expect(nudgeExactLowerBoundary(640, 640)).toBeGreaterThan(640);
    expect(nudgeExactLowerBoundary(639, 640)).toBe(639);
  });

  it("describes the gate that actually blocks every scenario", () => {
    const checks: ProgramGateCheck[] = [
      { key: "fico", ok: true, label: "FICO" },
      { key: "ltv", ok: false, label: "LTV" },
      { key: "dscr", ok: true, label: "DSCR" },
      { key: "loan", ok: true, label: "Loan" },
    ];
    const explanation = explainNoProgramMatches([{ checks }, { checks }], 75_000);
    expect(explanation).toContain("LTV");
    expect(explanation).not.toContain("FICO is below");
  });
});
