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
  | "solutions";

const ROUTE_MAP: Record<string, PageView> = {
  "/": "marketing",
  "/dscrgo": "portal",
  "/products/platform": "portal",
  "/products/communications-archiving-supervision": "dscr-calculator",
  "/products/employee-compliance": "lender-intel",
  "/products/marketing-compliance": "state-laws",
  "/products/firm-compliance": "deal-analyzer",
  "/products/third-party-compliance": "borrower-profiles",
  "/solutions/financial-advisors": "brokers",
  "/solutions/private-funds": "investors",
  "/solutions/hedge-funds": "investors",
  "/solutions/broker-dealers": "brokers",
  "/solutions/ria-registration": "brokers",
  "/solutions/service-provider-platform": "borrower-profiles",
  "/solutions": "solutions",
  "/products": "products",
  "/faq": "faq",
  "/blog": "blog",
  "/case-studies": "case-studies",
  "/about": "about",
  "/careers": "careers",
  "/legal": "legal",
  "/privacy-policy": "legal",
  "/terms-of-service": "legal",
  "/support": "faq",
  "/rate-quiz": "rate-quiz",
  "/partners": "brokers-partner",
  // Clean semantic paths (DSCR-native URLs)
  "/brokers": "brokers",
  "/investors": "investors",
  "/borrower-profiles": "borrower-profiles",
  "/dscr-calculator": "dscr-calculator",
  "/lender-intel": "lender-intel",
  "/deal-analyzer": "deal-analyzer",
  "/state-laws": "state-laws",
  "/decision-support": "decision-support",
  // New feature routes
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
    const path = url.pathname;
    if (ROUTE_MAP[path]) return ROUTE_MAP[path];
    if (path.startsWith("/blog/")) return "blog";
    if (path.startsWith("/case-studies/")) return "case-studies";
    if (path.startsWith("/solutions/")) return "investors";
    if (path.startsWith("/products/")) return "dscr-calculator";
    if (path.startsWith("/tools/")) {
      const slug = path.replace("/tools/", "");
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
  const path = (() => {
    try {
      return new URL(href, "http://localhost").pathname;
    } catch {
      return "";
    }
  })();
  if (!path || !path.startsWith("/")) return false;
  if (path === "/") return true;
  if (ROUTE_MAP[path]) return true;
  if (path.startsWith("/blog")) return true;
  if (path.startsWith("/case-studies")) return true;
  if (path.startsWith("/solutions")) return true;
  if (path.startsWith("/products")) return true;
  if (["/brokers", "/investors", "/borrower-profiles", "/dscr-calculator", "/lender-intel", "/deal-analyzer", "/state-laws", "/decision-support"].includes(path)) return true;
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