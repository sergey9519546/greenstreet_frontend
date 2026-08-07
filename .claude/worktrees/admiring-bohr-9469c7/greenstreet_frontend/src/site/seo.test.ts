import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CANONICAL_PUBLIC_PATHS, PAGE_SEO, absoluteUrl } from "./seo";
import { isKnownRoute } from "../router/resolve";

describe("site route and SEO registry", () => {
  it("keeps canonical public paths routable", () => {
    for (const path of CANONICAL_PUBLIC_PATHS) {
      expect(isKnownRoute(path), `${path} should be routable`).toBe(true);
    }
  });

  it("keeps SEO entries complete", () => {
    for (const entry of PAGE_SEO) {
      expect(entry.title.length, `${entry.path} title`).toBeGreaterThan(20);
      expect(entry.description.length, `${entry.path} description`).toBeGreaterThan(80);
      expect(entry.primaryKeyword.length, `${entry.path} keyword`).toBeGreaterThan(3);
      expect(entry.searchIntent.length, `${entry.path} intent`).toBeGreaterThan(20);
      expect(CANONICAL_PUBLIC_PATHS).toContain(entry.path as typeof CANONICAL_PUBLIC_PATHS[number]);
    }
  });

  it("keeps sitemap aligned with canonical public routes", () => {
    const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
    for (const path of CANONICAL_PUBLIC_PATHS) {
      expect(sitemap, `${path} missing from sitemap`).toContain(`<loc>${absoluteUrl(path)}</loc>`);
    }
    expect(sitemap).not.toContain("<loc>https://greenstreet.com/partners</loc>");
  });

  it("blocks the current internal app route in robots", () => {
    const robots = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");
    expect(robots).toContain("Disallow: /investgo");
    expect(robots).not.toContain("Disallow: /investorgo");
  });
});
