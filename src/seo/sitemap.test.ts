import { describe, expect, it } from "vitest";
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";
import { CANONICAL_PUBLIC_PATHS, EXTRA_PUBLISHED_PATHS, absoluteUrl } from "../site/seo";
import sitemap from "../../public/sitemap.xml?raw";

describe("public sitemap", () => {
  it("does not publish routes for tools on a reliability hold", () => {
    for (const definition of Object.values(TOOL_RELIABILITY_HOLDS)) {
      expect(sitemap).not.toContain(`<loc>https://www.greenstreet.finance${definition.path}</loc>`);
    }
  });

  // scripts/generate-sitemap.ts derives the file from CANONICAL_PUBLIC_PATHS,
  // and its header says the sitemap "can never drift from the routes again" —
  // but nothing checked that, and it had. /tools/structure-optimizer and
  // /tools/perfect-property were sitting in the committed XML while absent from
  // the registry, so re-running the generator would have deleted two live tools
  // rather than reproducing the file. This pins both directions, which is what
  // makes the generator's claim true.
  it("publishes exactly the canonical paths that are not on hold", () => {
    // Widened deliberately: TOOL_RELIABILITY_HOLDS is `as const` with a single
    // entry today, so an inferred Set is typed Set<"/investgo"> and rejects
    // every other canonical path at the .has() call.
    const held = new Set<string>(Object.values(TOOL_RELIABILITY_HOLDS).map((definition) => definition.path));

    for (const path of CANONICAL_PUBLIC_PATHS) {
      if (held.has(path)) continue;
      expect(sitemap, `${path} missing from sitemap`).toContain(`<loc>${absoluteUrl(path)}</loc>`);
    }
  });

  it("publishes no non-article URL outside the registries", () => {
    const allowed = new Set<string>([...CANONICAL_PUBLIC_PATHS, ...EXTRA_PUBLISHED_PATHS]);
    const published = [...sitemap.matchAll(/<loc>https:\/\/www\.greenstreet\.finance([^<]*)<\/loc>/g)]
      .map((match) => match[1] || "/")
      .filter((path) => !path.startsWith("/blog/"));

    expect(published.length).toBeGreaterThan(0);
    expect(published.filter((path) => !allowed.has(path))).toEqual([]);
  });
});
