import { describe, expect, it } from "vitest";
import { CLAIM_REPLACEMENTS } from "../src/marketing/claimReplacements";
import { BANNED_FABRICATED_CONTENT, EXPLICIT_BANNED, MIN_AUTO_BAN_LENGTH } from "./ftcBanned";

describe("FTC render-lock ban list", () => {
  it("is non-empty and deduplicated", () => {
    expect(BANNED_FABRICATED_CONTENT.length).toBeGreaterThan(40);
    expect(new Set(BANNED_FABRICATED_CONTENT).size).toBe(BANNED_FABRICATED_CONTENT.length);
  });

  it("auto-includes every long unsupported claim from the shared replacements", () => {
    for (const [unsupported] of CLAIM_REPLACEMENTS) {
      if (unsupported.length >= MIN_AUTO_BAN_LENGTH) {
        expect(
          BANNED_FABRICATED_CONTENT.includes(unsupported),
          `unsupported claim ≥${MIN_AUTO_BAN_LENGTH} chars must be banned: ${unsupported.slice(0, 80)}…`,
        ).toBe(true);
      }
    }
  });

  it("keeps every explicit short ban out of the auto-derived list (no redundant entries)", () => {
    for (const explicit of EXPLICIT_BANNED) {
      if (explicit.length >= MIN_AUTO_BAN_LENGTH) {
        expect(
          CLAIM_REPLACEMENTS.some(([unsupported]) => unsupported === explicit),
          `${explicit.slice(0, 60)} is already auto-banned; drop it from EXPLICIT_BANNED`,
        ).toBe(false);
      }
    }
  });

  it("safe replacements never contain a banned string (the lock cannot false-positive on replaced output)", () => {
    for (const [, replacement] of CLAIM_REPLACEMENTS) {
      for (const banned of BANNED_FABRICATED_CONTENT) {
        expect(
          replacement.includes(banned),
          `replacement "${replacement.slice(0, 60)}…" contains banned string "${banned.slice(0, 60)}…"`,
        ).toBe(false);
      }
    }
  });

  it("the placeholder phone is banned in both its bare and href forms", () => {
    expect(BANNED_FABRICATED_CONTENT).toContain("+1 (555) 010-0000");
    expect(BANNED_FABRICATED_CONTENT).toContain("tel:+15550100000");
  });

  it("the announcement claim is banned in the form the markup actually uses", () => {
    // The pair was fixed to match <strong>⎋</strong> (see claimReplacements.ts);
    // banning the fixed form is what makes the shell/twin leak fail CI.
    expect(
      BANNED_FABRICATED_CONTENT.some((banned) => banned.includes("Greenstreet Finance announces <strong>InvestGO</strong>")),
    ).toBe(true);
  });
});
