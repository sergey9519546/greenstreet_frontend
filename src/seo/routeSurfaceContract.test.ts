import { describe, expect, it } from "vitest";
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";
import { isKnownRoute, resolveRoute, type PageView } from "../router/resolve";
import { getRouteMetadata, SITE_ORIGIN } from "./routeMetadata";
import sitemap from "../../public/sitemap.xml?raw";

const sitemapLocation = (pathname: string) => `<loc>${SITE_ORIGIN}${pathname}</loc>`;

const INDEXED_ALIASES = [
  { pathname: "/support", view: "faq", canonicalPath: "/faq" },
  { pathname: "/lender-intel", view: "products", canonicalPath: "/products" },
  { pathname: "/products/platform", view: "products", canonicalPath: "/products" },
  { pathname: "/privacy-policy", view: "legal", canonicalPath: "/legal/privacy-policy" },
  { pathname: "/terms-of-service", view: "legal", canonicalPath: "/legal/terms-of-service" },
  { pathname: "/become-a-partner", view: "brokers-partner", canonicalPath: "/partners" },
  { pathname: "/partnerships", view: "brokers-partner", canonicalPath: "/partners" },
] as const satisfies readonly { pathname: string; view: PageView; canonicalPath: string }[];

const HELD_ALIASES = [
  { pathname: "/tools/arm", view: "arm-reset" },
  { pathname: "/tools/irr", view: "returns" },
  { pathname: "/investgo/optimize", view: "structure-optimizer" },
  { pathname: "/investgo/state", view: "state-laws" },
] as const satisfies readonly { pathname: string; view: PageView }[];

describe("route surface preservation contract", () => {
  it("keeps every held route reachable only as a known, noindex route outside the sitemap", () => {
    for (const hold of Object.values(TOOL_RELIABILITY_HOLDS)) {
      const resolvedView = resolveRoute(hold.path);
      const metadata = getRouteMetadata({ pathname: hold.path, view: resolvedView });

      expect(resolvedView).toBe(hold.view);
      expect(isKnownRoute(hold.path)).toBe(true);
      expect(metadata.robots).toBe("noindex,nofollow");
      expect(metadata.canonical).toBe(`${SITE_ORIGIN}${hold.path}`);
      expect(metadata.jsonLdKind).toBeUndefined();
      expect(sitemap).not.toContain(sitemapLocation(hold.path));
    }
  });

  it.each(INDEXED_ALIASES)(
    "keeps the published alias $pathname routable and canonicalizes it to $canonicalPath",
    ({ pathname, view, canonicalPath }) => {
      const resolvedView = resolveRoute(pathname);
      const metadata = getRouteMetadata({ pathname, view: resolvedView });

      expect(resolvedView).toBe(view);
      expect(isKnownRoute(pathname)).toBe(true);
      expect(metadata.robots).toBe("index,follow");
      expect(metadata.canonical).toBe(`${SITE_ORIGIN}${canonicalPath}`);
    },
  );

  it.each(HELD_ALIASES)("keeps the held alias $pathname noindex and outside the sitemap", ({ pathname, view }) => {
    const resolvedView = resolveRoute(pathname);
    const metadata = getRouteMetadata({ pathname, view: resolvedView });

    expect(resolvedView).toBe(view);
    expect(isKnownRoute(pathname)).toBe(true);
    expect(metadata.robots).toBe("noindex,nofollow");
    expect(metadata.jsonLdKind).toBeUndefined();
    expect(sitemap).not.toContain(sitemapLocation(pathname));
  });

  it.each(["/route-contract-never-published", "/tools/route-contract-never-published"])(
    "fails unknown path %s closed instead of treating it as a known or indexable route",
    (pathname) => {
      const resolvedView = resolveRoute(pathname);
      const metadata = getRouteMetadata({ pathname, view: resolvedView });

      expect(resolvedView).toBe("not-found");
      expect(isKnownRoute(pathname)).toBe(false);
      expect(metadata.robots).toBe("noindex,nofollow");
      expect(metadata.canonical).toBeNull();
      expect(sitemap).not.toContain(sitemapLocation(pathname));
    },
  );

  it.each(["/book-demo/unknown", "/book-demofoo", "/blogger", "/case-studies-fake"])(
    "fails route-prefix lookalike %s closed instead of indexing or intercepting it",
    (pathname) => {
      const resolvedView = resolveRoute(pathname);
      const metadata = getRouteMetadata({ pathname, view: resolvedView });

      expect(resolvedView).toBe("not-found");
      expect(isKnownRoute(pathname)).toBe(false);
      expect(metadata.robots).toBe("noindex,nofollow");
      expect(metadata.canonical).toBeNull();
    },
  );
});
