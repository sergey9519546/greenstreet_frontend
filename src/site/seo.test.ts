import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CANONICAL_PUBLIC_PATHS,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
  buildStructuredData,
  getPageSeo,
} from "./seo";
import { isKnownRoute } from "../router/resolve";

type JsonLdNode = Record<string, unknown>;

function schemaGraph(path: string): JsonLdNode[] {
  const data = buildStructuredData(getPageSeo(path));
  expect(data, `${path} should emit structured data`).not.toBeNull();
  return data!["@graph"] as JsonLdNode[];
}

function expectCleanJsonLd(value: unknown): void {
  if (typeof value === "string") {
    expect(value.trim().length).toBeGreaterThan(0);
    return;
  }
  if (typeof value === "number") {
    expect(Number.isFinite(value)).toBe(true);
    return;
  }
  if (Array.isArray(value)) {
    expect(value.length).toBeGreaterThan(0);
    value.forEach(expectCleanJsonLd);
    return;
  }
  if (value && typeof value === "object") {
    expect(Object.keys(value)).not.toHaveLength(0);
    Object.values(value).forEach(expectCleanJsonLd);
  }
}

describe("site route and SEO registry", () => {
  it("resolves relative URLs against production and preserves safe absolute URLs", () => {
    expect(absoluteUrl("about")).toBe(`${SITE_ORIGIN}/about`);
    expect(absoluteUrl("/tools/portfolio")).toBe(`${SITE_ORIGIN}/tools/portfolio`);
    expect(absoluteUrl("https://example.com/reference?source=greenstreet")).toBe(
      "https://example.com/reference?source=greenstreet"
    );
  });

  it("keeps canonical public paths routable", () => {
    for (const path of CANONICAL_PUBLIC_PATHS) {
      expect(isKnownRoute(path), `${path} should be routable`).toBe(true);
    }
  });

  it("keeps canonical metadata complete, unique, and consistently branded", () => {
    const entries = CANONICAL_PUBLIC_PATHS.map((path) => getPageSeo(path));

    for (const entry of entries) {
      expect(entry.indexable, `${entry.path} indexable`).toBe(true);
      expect(entry.canonicalPath, `${entry.path} canonical`).toBe(entry.path);
      expect(entry.title, `${entry.path} brand`).toContain(SITE_NAME);
      expect(entry.title.length, `${entry.path} title`).toBeGreaterThan(20);
      expect(entry.description.length, `${entry.path} description`).toBeGreaterThan(80);
      expect(entry.primaryKeyword.length, `${entry.path} keyword`).toBeGreaterThan(3);
      expect(entry.searchIntent.length, `${entry.path} intent`).toBeGreaterThan(20);
    }

    expect(new Set(entries.map((entry) => entry.path)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.canonicalPath)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.title)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.description)).size).toBe(entries.length);
  });

  it("noindexes private, utility, API, and not-found states without canonicals", () => {
    for (const path of [
      "/investgo",
      "/dashboard",
      "/broker-portal",
      "/tools/workspace",
      "/tools/deal-workspace",
      "/tools/sensitivity",
      "/tools/structure-optimizer",
      "/tools/scenario-history",
      "/api/deal",
      "/not-a-public-page",
    ]) {
      const seo = getPageSeo(path);
      expect(seo.indexable, `${path} indexable`).toBe(false);
      expect(seo.canonicalPath, `${path} canonical`).toBeNull();
      expect(buildStructuredData(seo), `${path} schema`).toBeNull();
      expect(CANONICAL_PUBLIC_PATHS).not.toContain(path);
    }
  });

  it("keeps sitemap exactly aligned with canonical public routes", () => {
    const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    const expectedLocations = CANONICAL_PUBLIC_PATHS.map(absoluteUrl);

    expect(new Set(locations)).toEqual(new Set(expectedLocations));
    expect(locations).toHaveLength(expectedLocations.length);
    expect(new Set(locations).size).toBe(locations.length);
    for (const location of locations) {
      const url = new URL(location);
      expect(url.origin).toBe(SITE_ORIGIN);
      expect(url.search).toBe("");
      expect(url.hash).toBe("");
    }
    expect(sitemap).not.toMatch(/<(?:lastmod|changefreq|priority)>/);
  });

  it("blocks private routes without blocking rendering assets", () => {
    const robots = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");
    const disallowed = robots
      .split(/\r?\n/)
      .filter((line) => line.startsWith("Disallow: "))
      .map((line) => line.slice("Disallow: ".length));

    expect(disallowed).toEqual([
      "/api/",
      "/investgo",
      "/dashboard",
      "/broker-portal",
      "/tools/workspace",
      "/tools/deal-workspace",
      "/tools/sensitivity",
      "/tools/structure-optimizer",
      "/tools/scenario-history",
    ]);
    expect(robots).toContain("Allow: /");
    expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
    expect(robots).not.toMatch(/^Disallow:\s*\/(?:assets|static|src|_next)\/?/m);
  });

  it("emits stable entity, page, and correctly positioned breadcrumb schema", () => {
    const graph = schemaGraph("/blog/what-is-dscr-how-it-works");
    const organization = graph.find((node) => node["@type"] === "Organization")!;
    const website = graph.find((node) => node["@type"] === "WebSite")!;
    const breadcrumb = graph.find((node) => node["@type"] === "BreadcrumbList")!;
    const page = graph.find((node) => node["@type"] === "BlogPosting")!;
    const items = breadcrumb.itemListElement as JsonLdNode[];

    expect(organization).toMatchObject({
      "@id": `${SITE_ORIGIN}/#organization`,
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`,
    });
    expect(website).toMatchObject({
      "@id": `${SITE_ORIGIN}/#website`,
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    });
    expect(page).toMatchObject({
      "@id": `${SITE_ORIGIN}/blog/what-is-dscr-how-it-works#webpage`,
      url: `${SITE_ORIGIN}/blog/what-is-dscr-how-it-works`,
      headline: "What Is DSCR and How Does It Work?",
      breadcrumb: { "@id": `${SITE_ORIGIN}/blog/what-is-dscr-how-it-works#breadcrumb` },
    });
    expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(items.map((item) => item.name)).toEqual([
      "Home",
      "Blog",
      "What Is DSCR and How Does It Work?",
    ]);
    expect(items.map((item) => item.item)).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/blog`,
      `${SITE_ORIGIN}/blog/what-is-dscr-how-it-works`,
    ]);
    expect(buildStructuredData(getPageSeo("/blog/what-is-dscr-how-it-works")))
      .toEqual(buildStructuredData(getPageSeo("/blog/what-is-dscr-how-it-works")));
  });

  it("emits only clean, evidence-backed JSON-LD", () => {
    for (const path of CANONICAL_PUBLIC_PATHS) {
      expectCleanJsonLd(buildStructuredData(getPageSeo(path)));
    }

    const allSchema = JSON.stringify(CANONICAL_PUBLIC_PATHS.map((path) => schemaGraph(path)));
    expect(allSchema).not.toMatch(/"@type":"(?:FAQPage|Review|AggregateRating|Offer|Product|LocalBusiness)"/);
    expect(allSchema).not.toMatch(/"(?:price|priceRange|ratingValue|reviewCount|areaServed|award)":/);
  });

  it("refuses structured data with blank or invalid canonical values", () => {
    const about = getPageSeo("/about");
    expect(buildStructuredData({ ...about, title: " " })).toBeNull();
    expect(buildStructuredData({ ...about, description: "" })).toBeNull();
    expect(buildStructuredData({ ...about, breadcrumbName: "" })).toBeNull();
    expect(buildStructuredData({ ...about, canonicalPath: "https://example.com/about" })).toBeNull();
  });
});
