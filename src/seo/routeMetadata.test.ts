import { describe, expect, it } from "vitest";
import { getRouteMetadata, SITE_ORIGIN } from "./routeMetadata";

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
    const legacyApply = getRouteMetadata({ pathname: "/book-demo", view: "book-demo" });

    expect(privacy.canonical).toBe(`${SITE_ORIGIN}/legal/privacy-policy`);
    expect(privacy.title).toMatch(/Privacy Policy/);
    expect(support.canonical).toBe(`${SITE_ORIGIN}/faq`);
    expect(legacyApply.canonical).toBe(`${SITE_ORIGIN}/apply`);
    expect(legacyApply.title).toMatch(/Apply for a DSCR Loan/);
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
    ["/investgo/private", "portal"],
    ["/unpublished-path", "not-found"],
  ] as const)("keeps protected and unknown paths out of search: %s", (pathname, view) => {
    expect(getRouteMetadata({ pathname, view }).robots).toBe("noindex,nofollow");
  });

  it.each([
    ["/deal-analyzer", "deal-analyzer", "/deal-analyzer"],
    ["/tools/decision-support", "decision-support", "/tools/decision-support"],
    ["/tools/tax-engine", "tax-engine", "/tools/tax-engine"],
    ["/tools/returns", "returns", "/tools/returns"],
    ["/investgo", "deal-analyzer", "/deal-analyzer"],
  ] as const)("indexes a bounded public tool and canonicalizes aliases: %s", (pathname, view, canonicalPath) => {
      const metadata = getRouteMetadata({ pathname, view });
      expect(metadata.robots).toBe("index,follow");
      expect(metadata.canonical).toBe(`${SITE_ORIGIN}${canonicalPath}`);
      expect(metadata.jsonLdKind).toBe("WebPage");
  });
});
