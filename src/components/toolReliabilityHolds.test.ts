import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { TOOL_RELIABILITY_HOLDS } from "./toolReliabilityHolds";
import { resolveRoute } from "../router/resolve";

// App.tsx is read from disk rather than mirrored in a literal here on purpose. A
// duplicated list is exactly what let seven holds go quietly unwired: the record
// stayed in TOOL_RELIABILITY_HOLDS, every test that read only this module kept
// passing, and the route rendered the defective tool anyway. The single source of
// truth for "is this hold actually enforced" is the router itself.
const APP_SOURCE = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

/**
 * Hold keys that App.tsx spreads into a rendered <ToolReliabilityHoldPage>.
 *
 * Deliberately narrower than "the key appears somewhere in App.tsx" — a mention
 * in a comment, a suppression list, or a dead import must not count as enforcing
 * a hold.
 */
function renderedHoldKeys(source: string): Set<string> {
  const keys = new Set<string>();
  for (const element of source.match(/<ToolReliabilityHoldPage\b[\s\S]*?\/>/g) ?? []) {
    for (const match of element.matchAll(
      /TOOL_RELIABILITY_HOLDS(?:\.([A-Za-z0-9_$]+)|\[\s*["']([^"']+)["']\s*\])/g,
    )) {
      const key = match[1] ?? match[2];
      if (key) keys.add(key);
    }
  }
  return keys;
}

describe("tool reliability hold definitions", () => {
  it("covers each intended unsafe public tool route exactly once", () => {
    const definitions = Object.values(TOOL_RELIABILITY_HOLDS);
    const paths = definitions.map((definition) => definition.path);

    expect(paths).toEqual([
      "/investgo",
      "/tools/decision-support",
      "/rate-quiz",
      "/deal-analyzer",
      "/state-laws",
      "/tools/str-underwriting",
      "/tools/tax-engine",
      "/tools/refi-tracker",
      "/tools/portfolio",
      "/tools/monte-carlo",
      "/tools/arm-reset",
      "/tools/returns",
      "/tools/stress-matrix",
      "/tools/structure-optimizer",
    ]);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("routes every held public tool to its hold view", () => {
    for (const definition of Object.values(TOOL_RELIABILITY_HOLDS)) {
      expect(resolveRoute(definition.path)).toBe(definition.view);
    }
    expect(resolveRoute("/investgo/optimize")).toBe("structure-optimizer");
    expect(resolveRoute("/investgo/state")).toBe("state-laws");
  });

  it("provides calm, actionable content for every hold page", () => {
    for (const definition of Object.values(TOOL_RELIABILITY_HOLDS)) {
      expect(definition.title.trim().length).toBeGreaterThan(0);
      expect(definition.reason.trim().length).toBeGreaterThan(20);
      expect(definition.whatIsNeeded.length).toBeGreaterThanOrEqual(3);
      expect(definition.whatIsNeeded.every((item) => item.trim().length > 0)).toBe(true);
    }
  });

  // ── The gate itself ────────────────────────────────────────────────────────
  // A hold record is a promise that a tool will not ship until its listed
  // evidence exists. That promise is worth nothing if the record can stay in
  // this file while the route quietly renders the defective tool. This is the
  // test that makes unwiring a hold a build failure rather than a silent release.
  it("renders a hold page for every hold record — no hold may be silently orphaned", () => {
    // Guard the guard: if the read or the scan ever breaks, fail loudly here
    // instead of vacuously passing and re-opening the exact hole this closes.
    expect(APP_SOURCE, "App.tsx could not be read").toContain("ToolReliabilityHoldPage");

    const rendered = renderedHoldKeys(APP_SOURCE);
    expect(rendered.size, "no <ToolReliabilityHoldPage> usages found in App.tsx").toBeGreaterThan(0);

    const orphaned = Object.keys(TOOL_RELIABILITY_HOLDS).filter((key) => !rendered.has(key));

    expect(
      orphaned,
      orphaned.length === 0
        ? ""
        : `${orphaned.length} reliability hold(s) are defined but nothing renders them in src/App.tsx: ` +
          `${orphaned.join(", ")}. Each of these tools is LIVE with its named defect intact. ` +
          `Either restore <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.<key>} /> for the ` +
          `matching case in renderPage, or — only once the record's whatIsNeeded evidence actually ` +
          `exists (a dated sign-off or a passing test that covers it) — delete the hold record.`,
    ).toEqual([]);
  });

  it("renders each hold page from the hold record, never a hand-copied duplicate", () => {
    // Every usage must spread a real key. A <ToolReliabilityHoldPage> built from
    // inline title/reason strings would drift from the record it is meant to
    // enforce, and would not show up as orphaned above.
    const rendered = renderedHoldKeys(APP_SOURCE);
    const known = new Set(Object.keys(TOOL_RELIABILITY_HOLDS));
    const unknown = [...rendered].filter((key) => !known.has(key));

    expect(unknown, `App.tsx spreads unknown hold key(s): ${unknown.join(", ")}`).toEqual([]);

    const usageCount = (APP_SOURCE.match(/<ToolReliabilityHoldPage\b/g) ?? []).length;
    expect(
      usageCount,
      "a <ToolReliabilityHoldPage> is rendered without spreading a TOOL_RELIABILITY_HOLDS record",
    ).toBe(rendered.size);
  });
});
