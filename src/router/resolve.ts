export type PageView =
  | "marketing"
  | "portal"
  | "dscr-calculator"
  | "lender-intel"
  | "state-laws"
  | "deal-analyzer"
  | "borrower-profiles"
  | "brokers"
  | "brokers-partner"
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
  | "decision-support"
  | "str-underwriting"
  | "portfolio"
  | "about"
  | "careers"
  | "legal"
  | "products"
  | "solutions"
  | "book-demo";

const ROUTE_MAP: Record<string, PageView> = {
  // Root
  "/": "marketing",

  // Portal
  "/investgo": "portal",

  // Audience pages
  "/brokers": "brokers",
  "/investors": "investors",
  "/borrower-profiles": "borrower-profiles",
  "/partners": "brokers-partner",

  // Core tools (canonical paths)
  "/dscr-calculator": "dscr-calculator",
  "/lender-intel": "lender-intel",
  "/state-laws": "state-laws",
  "/deal-analyzer": "deal-analyzer",
  "/decision-support": "decision-support",

  // Content pages
  "/faq": "faq",
  "/support": "faq",
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
  "/solutions": "solutions",
  "/book-demo": "book-demo",
  "/partnerships": "brokers-partner",

  // Tools routes (canonical /tools/* paths)
  "/tools/refi-tracker": "refi-tracker",
  "/tools/arm-reset": "arm-reset",
  "/tools/monte-carlo": "monte-carlo",
  "/tools/returns": "returns",
  "/tools/tax-engine": "tax-engine",
  "/tools/stress-matrix": "stress-matrix",
  "/tools/decision-support": "decision-support",
  "/tools/str-underwriting": "str-underwriting",
  "/tools/portfolio": "portfolio",
};

export function resolveRoute(href: string): PageView {
  try {
    const url = new URL(href, "http://localhost");
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
    if (path.startsWith("/book-demo")) return "book-demo";
    if (path.startsWith("/tools/")) {
      const slug = path.replace("/tools/", "").replace(/\/$/, "");
      if (slug === "refi-tracker") return "refi-tracker";
      if (slug === "arm-reset" || slug === "arm") return "arm-reset";
      if (slug === "monte-carlo") return "monte-carlo";
      if (slug === "returns" || slug === "irr") return "returns";
      if (slug === "tax-engine") return "tax-engine";
      if (slug === "stress-matrix") return "stress-matrix";
      if (slug === "decision-support") return "decision-support";
      if (slug === "str-underwriting") return "str-underwriting";
      if (slug === "portfolio") return "portfolio";
      if (slug === "dscr-calculator") return "dscr-calculator";
      if (slug === "lender-intel") return "lender-intel";
      if (slug === "state-laws") return "state-laws";
      if (slug === "deal-analyzer") return "deal-analyzer";
      if (slug === "borrower-profiles") return "borrower-profiles";
    }
    if (url.hostname && url.hostname !== "localhost" && url.hostname !== window.location.hostname) return "external";
    return "marketing";
  } catch {
    return "marketing";
  }
}

/**
 * True when the given href (path-only) maps to a known SPA route. Used by the
 * global click interceptor in App.tsx so unknown paths (HubSpot booking,
 * external subdomains, asset files) fall through to normal browser navigation.
 */
export function isKnownRoute(href: string): boolean {
  let path = (() => {
    try {
      return new URL(href, "http://localhost").pathname;
    } catch {
      return "";
    }
  })();
  if (!path || !path.startsWith("/")) return false;
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path === "/") return true;
  if (ROUTE_MAP[path]) return true;
  if (path.startsWith("/book-demo")) return true;
  if (path.startsWith("/blog")) return true;
  if (path.startsWith("/case-studies")) return true;
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
      "dscr-calculator",
      "lender-intel",
      "state-laws",
      "deal-analyzer",
      "borrower-profiles",
    ].includes(slug);
  }
  return false;
}