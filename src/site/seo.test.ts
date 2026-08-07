import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CANONICAL_PUBLIC_PATHS, PAGE_SEO, absoluteUrl } from "./seo";
import { isKnownRoute } from "../router/resolve";
import { NAV_MENUS } from "../design/navModel";

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

  it("keeps every published blog article in the sitemap", () => {
    const blogSource = readFileSync(resolve(process.cwd(), "src/pages/BlogPage.tsx"), "utf8");
    const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
    const slugs = [...blogSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);

    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      expect(sitemap, `${slug} missing from sitemap`).toContain(`<loc>${absoluteUrl(`/blog/${slug}`)}</loc>`);
    }
  });

  it("exposes article links directly in the Resources menu", () => {
    const resources = NAV_MENUS.find((menu) => menu.label === "Resources");
    const articleItems = resources?.items.filter((item) => item.path.startsWith("/blog/")) ?? [];
    const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");

    expect(articleItems.length).toBeGreaterThanOrEqual(4);
    for (const item of articleItems) {
      expect(isKnownRoute(item.path), `${item.path} should be routable`).toBe(true);
      expect(sitemap, `${item.path} missing from sitemap`).toContain(`<loc>${absoluteUrl(item.path)}</loc>`);
    }
  });

  it("keeps homepage Resources cards linked to published articles", () => {
    const homepage = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const featuredPaths = [
      "/blog/interest-only-dscr-loan-payment-math",
      "/blog/dscr-loan-closing-costs-cash-to-close",
      "/blog/dscr-loan-points-break-even",
    ];

    for (const path of featuredPaths) expect(homepage).toContain(`href="${path}"`);
    expect(homepage).not.toContain("/blog/greenstreet-t3-survey-rating");
    expect(homepage).not.toContain("/blog/track-2-dscr");
  });

  it("blocks the current internal app route in robots", () => {
    const robots = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");
    expect(robots).toContain("Disallow: /investgo");
    expect(robots).not.toContain("Disallow: /investorgo");
  });
});
