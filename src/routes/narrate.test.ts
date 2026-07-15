import { describe, expect, it } from "vitest";

import {
  NARRATION_FALLBACK,
  assertSafeNarrationPayload,
  safeProviderNarrative,
} from "./narrate";

const validPayload = () => ({
  deal: {
    dscr: 1.2,
    solvedRate: 7.25,
    dealBreakRate: 8,
    rateHeadroomBps: 75,
    ltv: 75,
  },
  context: "Explain the preliminary calculation.",
});

describe("narration safeguards", () => {
  it("accepts inclusive ranges and rejects nonfinite or excessive values", () => {
    expect(() => assertSafeNarrationPayload(validPayload())).not.toThrow();
    expect(() => assertSafeNarrationPayload({ ...validPayload(), deal: { dscr: 20, ltv: 100 } })).not.toThrow();
    expect(() => assertSafeNarrationPayload({ ...validPayload(), deal: { dscr: Number.NaN } })).toThrow();
    expect(() => assertSafeNarrationPayload({ ...validPayload(), deal: { dscr: 20.01 } })).toThrow();
    expect(() => assertSafeNarrationPayload({ ...validPayload(), context: "x".repeat(501) })).toThrow();
  });

  it("caps unsafe output with one deterministic non-underwriting fallback", () => {
    expect(safeProviderNarrative("")).toBe(NARRATION_FALLBACK);
    expect(safeProviderNarrative("You are approved for this deal.")).toBe(NARRATION_FALLBACK);
    expect(safeProviderNarrative("The provider model returned error 500.")).toBe(NARRATION_FALLBACK);
    expect(safeProviderNarrative("x".repeat(701))).toBe(NARRATION_FALLBACK);
  });

  it("keeps bounded, non-conclusive plain language", () => {
    const narrative = "Cash flow appears to cover the modeled debt payment. Review the assumptions before relying on the preliminary calculation.";
    expect(safeProviderNarrative(narrative)).toBe(narrative);
  });
});
