import { describe, expect, it } from "vitest";
import { getRouteMetadata, SITE_ORIGIN } from "./routeMetadata";
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";

describe("public route metadata", () => {
  it("indexes canonical public pages", () => {
    const metadata = getRouteMetadata({ pathname: "/dscr-calculator/", view: "dscr-calculator" });

    expect(metadata.robots).toBe("index,follow");
    expect(metadata.canonical).toBe(`${SITE_ORIGIN}/dscr-calculator`);
    expect(metadata.title).toMatch(/DSCR Calculator/);
    expect(metadata.jsonLdKind).toBe("WebPage");
  });

  it("canonicalizes legacy legal and support aliases to their public pages", () => {
    const privacy = getRouteMetadata({ pathname: "/privacy-policy", view: "legal" });
    const support = getRouteMetadata({ pathname: "/support", view: "faq" });

    expect(privacy.canonical).toBe(`${SITE_ORIGIN}/legal/privacy-policy`);
    expect(privacy.title).toMatch(/Privacy Policy/);
    expect(support.canonical).toBe(`${SITE_ORIGIN}/faq`);
  });

  it("only indexes published article slugs", () => {
    const published = getRouteMetadata({
      pathname: "/blog/what-is-dscr-how-it-works",
      view: "blog-post",
    });
    const missing = getRouteMetadata({ pathname: "/blog/not-a-real-article", view: "blog-post" });

    expect(published.robots).toBe("index,follow");
    expect(published.jsonLdKind).toBe("Article");
    expect(published.canonical).toBe(`${SITE_ORIGIN}/blog/what-is-dscr-how-it-works`);
    expect(missing.robots).toBe("noindex,nofollow");
    expect(missing.canonical).toBeNull();
  });

  it.each([
    ["/investgo", "portal"],
    ["/tools/decision-support", "decision-support"],
    ["/tools/tax-engine", "tax-engine"],
    ["/tools/returns", "returns"],
    ["/unpublished-path", "not-found"],
    // Retired partner aliases, paired with the view resolve.ts actually returns
    // for them today — not the view they used to carry. A metadata alias used
    // to run ahead of both the portal and not-found guards and force each to
    // index,follow, publishing the private workspace and a 404 to search
    // engines as "Partner With Greenstreet".
    ["/partnerships", "portal"],
    ["/partners", "portal"],
    ["/become-a-partner", "not-found"],
  ] as const)("keeps protected, held, and unknown paths out of search: %s", (pathname, view) => {
    expect(getRouteMetadata({ pathname, view }).robots).toBe("noindex,nofollow");
  });

  it("does not advertise a retired partner alias as a page that still renders", () => {
    // `brokers-partner` is unreachable: nothing in resolve.ts resolves to it,
    // so no metadata may point at it as a live destination.
    for (const pathname of ["/partnerships", "/partners"]) {
      const metadata = getRouteMetadata({ pathname, view: "portal" });
      expect(metadata.title).not.toMatch(/Partner With Greenstreet/);
      expect(metadata.canonical).not.toBe(`${SITE_ORIGIN}/partners`);
    }
  });

  it("keeps every held tool out of search results", () => {
    for (const definition of Object.values(TOOL_RELIABILITY_HOLDS)) {
      const metadata = getRouteMetadata({
        pathname: definition.path,
        view: definition.view,
      });
      expect(metadata.robots).toBe("noindex,nofollow");
      expect(metadata.jsonLdKind).toBeUndefined();
    }
  });
});
