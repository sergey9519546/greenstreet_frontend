export type PageView =
  | "marketing"
  | "portal"
  | "dscr-calculator"
  | "lender-intel"
  | "state-laws"
  | "deal-analyzer"
  | "borrower-profiles"
  | "non-us-investors"
  | "str-hosts"
  | "vacation-homes"
  | "brokers"
  | "investors"
  | "faq"
  | "blog"
  | "blog-post"
  | "case-studies"
  | "rate-quiz"
  | "external"
  | "refi-tracker"
  | "arm-reset"
  | "monte-carlo"
  | "returns"
  | "tax-engine"
  | "stress-matrix"
  | "structure-optimizer"
  | "decision-support"
  | "str-underwriting"
  | "portfolio"
  | "commercial-dscr"
  | "construction-bridge"
  | "tco-threshold"
  | "about"
  | "careers"
  | "legal"
  | "products"
  | "platform"
  | "support"
  | "solutions"
  | "book-demo"
  | "perfect-property"
  | "tools"
  | "not-found";

const ROUTE_MAP: Record<string, PageView> = {
  // Root
  "/": "marketing",

  // Portal
  "/investgo": "portal",
  "/investgo/analyze": "portal",
  "/investgo/sensitivity": "portal",
  "/investgo/optimize": "structure-optimizer",
  "/investgo/state": "state-laws",
  "/investgo/history": "portal",
  "/investgo/settings": "portal",

  // Audience pages
  "/brokers": "brokers",
  "/investors": "investors",
  "/borrower-profiles": "borrower-profiles",
  "/non-us-investors": "non-us-investors",      // canonical
  "/foreign-nationals": "non-us-investors",    // legacy alias — keep so old links/SEO don't 404
  "/str-airbnb": "str-hosts",
  "/vacation-homes": "vacation-homes",
  "/portfolio-builders": "portfolio", // page removed — old links land on the Portfolio tool
  "/partners": "portal",

  // Core tools (canonical paths)
  "/dscr-calculator": "dscr-calculator",
  // The standalone lender/programs page (LenderIntelPage) is live — keep the
  // canonical path resolving to it rather than redirecting to Products.
  "/lender-intel": "lender-intel",
  "/state-laws": "state-laws",
  "/deal-analyzer": "deal-analyzer", // full-underwrite tool (distinct from the lender-intel matcher)
  "/decision-support": "decision-support",

  // Content pages
  "/faq": "faq",
  "/support": "support",
  "/blog": "blog",
  "/case-studies": "case-studies",
  "/about": "about",
  "/careers": "careers",
  "/legal": "legal",
  "/privacy-policy": "legal",
  "/terms-of-service": "legal",
  "/legal/privacy-policy": "legal",
  "/legal/terms-of-service": "legal",
  "/rate-quiz": "rate-quiz",
  "/products": "products",
  "/products/platform": "platform",
  "/solutions": "solutions",
  "/book-demo": "book-demo",
  "/partnerships": "portal", // old Partnerships page now lands on the INVESTGO dashboard

  // Tools routes (canonical /tools/* paths)
  "/tools": "tools", // hub — every tool page is linked from here
  "/tools/refi-tracker": "refi-tracker",
  "/tools/arm-reset": "arm-reset",
  "/tools/monte-carlo": "monte-carlo",
  "/tools/returns": "returns",
  "/tools/tax-engine": "tax-engine",
  "/tools/stress-matrix": "stress-matrix",
  "/tools/structure-optimizer": "structure-optimizer",
  "/tools/decision-support": "decision-support",
  "/tools/str-underwriting": "str-underwriting",
  "/tools/portfolio": "portfolio",
  "/tools/commercial-dscr": "commercial-dscr",
  "/tools/construction-bridge": "construction-bridge",
  "/tools/tco-threshold": "tco-threshold",
  "/tools/perfect-property": "perfect-property",
  "/perfect-property": "perfect-property",
  "/tools/workspace": "portal",
  "/tools/deal-workspace": "portal",
  "/tools/sensitivity": "portal",
  "/tools/scenario-history": "portal",
};

function routeBaseUrl(): URL {
  if (typeof window !== "undefined" && window.location?.href) {
    return new URL(window.location.href);
  }
  return new URL("http://localhost/");
}

function parseRouteHref(href: string): { url: URL; sameOrigin: boolean } | null {
  // Browsers treat backslashes as URL path separators. A value such as
  // `/\\evil.example` therefore normalizes to a cross-origin URL even though it
  // appears to begin with a single slash. Internal links never need a
  // backslash, so reject the ambiguous spelling before route matching.
  if (!href || href.includes("\\")) return null;

  try {
    const base = routeBaseUrl();
    const url = new URL(href, base);
    return { url, sameOrigin: url.origin === base.origin };
  } catch {
    return null;
  }
}

/**
 * Return the exact same-origin path safe to pass to history.pushState.
 * Cross-origin, malformed, and backslash-normalized hrefs return null.
 */
export function normalizeInternalRouteHref(href: string): string | null {
  const parsed = parseRouteHref(href);
  if (!parsed?.sameOrigin) return null;
  return `${parsed.url.pathname}${parsed.url.search}${parsed.url.hash}`;
}

export function resolveRoute(href: string): PageView {
  const parsed = parseRouteHref(href);
  if (!parsed) {
    return href.includes("\\") ? "external" : "not-found";
  }
  if (!parsed.sameOrigin) return "external";

  try {
    const { url } = parsed;
    let path = url.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    if (ROUTE_MAP[path]) return ROUTE_MAP[path];
    if (path.startsWith("/blog/")) {
      const slug = path.replace("/blog/", "").replace(/\/$/, "");
      if (slug.length > 0) return "blog-post";
      return "blog";
    }
    if (path.startsWith("/case-studies/")) return "case-studies";
    if (path.startsWith("/tools/")) {
      const slug = path.replace("/tools/", "").replace(/\/$/, "");
      if (slug === "workspace" || slug === "deal-workspace") return "portal";
      if (slug === "sensitivity") return "portal";
      if (slug === "structure-optimizer") return "structure-optimizer";
      if (slug === "scenario-history") return "portal";
      if (slug === "refi-tracker") return "refi-tracker";
      if (slug === "arm-reset" || slug === "arm") return "arm-reset";
      if (slug === "monte-carlo") return "monte-carlo";
      if (slug === "returns" || slug === "irr") return "returns";
      if (slug === "tax-engine") return "tax-engine";
      if (slug === "stress-matrix") return "stress-matrix";
      if (slug === "decision-support") return "decision-support";
      if (slug === "str-underwriting") return "str-underwriting";
      if (slug === "portfolio") return "portfolio";
      if (slug === "commercial-dscr") return "commercial-dscr";
      if (slug === "construction-bridge") return "construction-bridge";
      if (slug === "tco-threshold") return "tco-threshold";
      if (slug === "dscr-calculator") return "dscr-calculator";
      if (slug === "lender-intel") return "lender-intel";
      if (slug === "state-laws") return "state-laws";
      if (slug === "deal-analyzer") return "deal-analyzer";
      if (slug === "borrower-profiles") return "borrower-profiles";
    }
    return "not-found";
  } catch {
    return "not-found";
  }
}

/**
 * True when the given href (path-only) maps to a known SPA route. Used by the
 * global click interceptor in App.tsx so unknown paths (HubSpot booking,
 * external subdomains, asset files) fall through to normal browser navigation.
 */
export function isKnownRoute(href: string): boolean {
  const normalizedHref = normalizeInternalRouteHref(href);
  if (!normalizedHref) return false;
  let path = new URL(normalizedHref, routeBaseUrl()).pathname;
  if (!path || !path.startsWith("/")) return false;
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path === "/") return true;
  if (ROUTE_MAP[path]) return true;
  if (path.startsWith("/investgo/")) {
    const slug = path.replace("/investgo/", "").replace(/\/$/, "");
    return ["analyze", "sensitivity", "optimize", "state", "history", "settings"].includes(slug);
  }
  if (path.startsWith("/blog/")) return true;
  if (path.startsWith("/case-studies/")) return true;
  if (path.startsWith("/tools/")) {
    const slug = path.replace("/tools/", "").replace(/\/$/, "");
    return [
      "refi-tracker",
      "arm-reset",
      "arm",
      "monte-carlo",
      "returns",
      "irr",
      "tax-engine",
      "stress-matrix",
      "decision-support",
      "str-underwriting",
      "portfolio",
      "commercial-dscr",
      "construction-bridge",
      "tco-threshold",
      "dscr-calculator",
      "lender-intel",
      "state-laws",
      "deal-analyzer",
      "borrower-profiles",
      "workspace",
      "deal-workspace",
      "sensitivity",
      "structure-optimizer",
      "scenario-history",
    ].includes(slug);
  }
  return false;
}
