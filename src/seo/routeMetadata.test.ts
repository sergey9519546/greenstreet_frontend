import { describe, expect, it } from "vitest";
import { getRouteMetadata, SITE_ORIGIN, breadcrumbFor } from "./routeMetadata";
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";
import type { PageView } from "../router/resolve";

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

  it("indexes the /tools hub and breadcrumbs tool pages two levels deep", () => {
    const hub = getRouteMetadata({ pathname: "/tools", view: "tools" });
    expect(hub.robots).toBe("index,follow");
    expect(hub.canonical).toBe(`${SITE_ORIGIN}/tools`);
    expect(hub.title).toMatch(/All DSCR Tools/);
    expect(hub.jsonLdKind).toBe("CollectionPage");

    // The hub itself sits one level below Home; its children sit two.
    const hubCrumb = breadcrumbFor(hub);
    const hubItems = hubCrumb?.itemListElement as Array<{ name: string; item: string }>;
    expect(hubItems.map((item) => item.name)).toEqual(["Home", "All DSCR Tools"]);
    expect(hubItems[0].item).toBe(`${SITE_ORIGIN}/`);

    const tool = getRouteMetadata({ pathname: "/tools/str-underwriting", view: "str-underwriting" });
    const toolCrumb = breadcrumbFor(tool);
    const toolItems = toolCrumb?.itemListElement as Array<{ name: string; item: string }>;
    expect(toolItems.map((item) => item.name)).toEqual(["Home", "Tools", "STR Underwriting"]);
    expect(toolItems[1].item).toBe(`${SITE_ORIGIN}/tools`);
    expect(toolItems[2].item).toBe(`${SITE_ORIGIN}/tools/str-underwriting`);
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

  it("indexes released tools that a stale hand-maintained HELD_VIEWS list used to noindex", () => {
    // HELD_VIEWS used to be its own hardcoded copy of "which tools are on a
    // reliability hold" instead of being derived from TOOL_RELIABILITY_HOLDS
    // (the single source of truth, checked via the "keeps every held tool out
    // of search results" test below). Nobody updated the copy as each of
    // these nine tools shipped, so getRouteMetadata kept serving
    // noindex + "Tool unavailable for review" for a URL public/sitemap.xml
    // was simultaneously submitting to search engines as live. Deriving
    // HELD_VIEWS from TOOL_RELIABILITY_HOLDS means this can only regress if a
    // tool is genuinely put back on hold.
    const released: ReadonlyArray<readonly [string, PageView]> = [
      ["/tools/refi-tracker", "refi-tracker"],
      ["/tools/arm-reset", "arm-reset"],
      ["/tools/monte-carlo", "monte-carlo"],
      ["/tools/returns", "returns"],
      ["/tools/tax-engine", "tax-engine"],
      ["/tools/stress-matrix", "stress-matrix"],
      ["/tools/structure-optimizer", "structure-optimizer"],
      ["/tools/decision-support", "decision-support"],
      ["/tools/portfolio", "portfolio"],
    ];
    for (const [pathname, view] of released) {
      const metadata = getRouteMetadata({ pathname, view });
      expect(metadata.robots, pathname).toBe("index,follow");
      expect(metadata.title, pathname).not.toMatch(/unavailable/i);
      expect(metadata.title, pathname).not.toMatch(/not found/i);
      expect(metadata.canonical, pathname).toBe(`${SITE_ORIGIN}${pathname}`);
    }
  });

  it("still keeps the actually-held InvestGO workspace out of search after deriving HELD_VIEWS", () => {
    const metadata = getRouteMetadata({ pathname: "/investgo", view: "portal" });
    expect(metadata.robots).toBe("noindex,nofollow");
    expect(metadata.title).toMatch(/unavailable|InvestGO Workspace/i);
  });

  it("describes the private workspace, not a deleted partner page, for /partnerships and /partners", () => {
    // The `brokers-partner` view and its page component are gone outright —
    // not just unreachable. resolve.ts sends both paths to `portal`, so their
    // metadata must describe the private InvestGO workspace (noindexed,
    // canonicalized to /investgo) rather than the retired "Partner With
    // Greenstreet" copy.
    for (const pathname of ["/partnerships", "/partners"]) {
      const metadata = getRouteMetadata({ pathname, view: "portal" });
      expect(metadata.robots).toBe("noindex,nofollow");
      expect(metadata.title).not.toMatch(/Partner With Greenstreet/);
      expect(metadata.canonical).toBe(`${SITE_ORIGIN}/investgo`);
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
