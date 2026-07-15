interface RouteDefinition {
  readonly path: string;
  readonly additionalPaths?: readonly string[];
  readonly dynamic?: boolean;
}

// This is the authoritative route contract. Components consume pathForView(),
// the server consumes resolveRoute(), and tests exercise this same table.
export const ROUTE_CONTRACT = {
  marketing: { path: "/" },
  portal: {
    path: "/investgo",
    additionalPaths: [
      "/investgo/analyze",
      "/investgo/sensitivity",
      "/investgo/optimize",
      "/investgo/state",
      "/investgo/history",
      "/investgo/settings",
    ],
  },
  "dscr-calculator": { path: "/dscr-calculator" },
  "lender-intel": { path: "/lender-intel" },
  "state-laws": { path: "/state-laws" },
  "deal-analyzer": { path: "/deal-analyzer" },
  "borrower-profiles": { path: "/borrower-profiles" },
  "non-us-investors": { path: "/non-us-investors" },
  "str-hosts": { path: "/str-airbnb" },
  "vacation-homes": { path: "/vacation-homes" },
  brokers: { path: "/brokers" },
  "brokers-partner": { path: "/partnerships" },
  investors: { path: "/investors" },
  faq: { path: "/faq" },
  "how-it-works": { path: "/how-it-works" },
  blog: { path: "/blog" },
  "blog-post": { path: "/blog", dynamic: true },
  "case-studies": { path: "/case-studies" },
  "rate-quiz": { path: "/rate-quiz" },
  "refi-tracker": { path: "/tools/refi-tracker" },
  "arm-reset": { path: "/tools/arm-reset" },
  "monte-carlo": { path: "/tools/monte-carlo" },
  returns: { path: "/tools/returns" },
  "tax-engine": { path: "/tools/tax-engine" },
  "stress-matrix": { path: "/tools/stress-matrix" },
  "decision-support": { path: "/tools/decision-support" },
  "str-underwriting": { path: "/tools/str-underwriting" },
  portfolio: { path: "/tools/portfolio" },
  about: { path: "/about" },
  careers: { path: "/careers" },
  legal: {
    path: "/legal",
    additionalPaths: ["/legal/privacy-policy", "/legal/terms-of-service"],
  },
  products: { path: "/products" },
  platform: { path: "/products/platform" },
  support: { path: "/support" },
  solutions: { path: "/solutions" },
} as const satisfies Record<string, RouteDefinition>;

export type RoutedPageView = keyof typeof ROUTE_CONTRACT;
export type PageView = RoutedPageView | "external" | "not-found";

type RouteEntry = readonly [RoutedPageView, RouteDefinition];

function isRoutedPageView(view: string): view is RoutedPageView {
  return Object.prototype.hasOwnProperty.call(ROUTE_CONTRACT, view);
}

// Preserve the contract's exact literal types while exposing optional route
// metadata only for code that iterates across its heterogeneous entries.
export function routeEntries(): readonly RouteEntry[] {
  const entries: ReadonlyArray<readonly [string, RouteDefinition]> =
    Object.entries(ROUTE_CONTRACT);
  return entries.filter((entry): entry is RouteEntry => isRoutedPageView(entry[0]));
}

export const PUBLIC_BLOG_SLUGS = [
  "greenstreet-go-launch",
  "what-is-dscr-how-it-works",
  "dscr-pitia-breakdown-qualifying-income",
  "dscr-ltv-down-payment-fico",
  "dscr-refinance-rate-term-cashout-seasoning",
  "dscr-approval-issues-sub-10-fico-reserves",
  "dscr-non-us-investors-itin",
  "obbba-2025-real-estate-tax-changes",
  "mn-hf3437-business-purpose",
  "qoz-qrof-permanent-obbba",
  "section-1071-final-rule-dscr",
  "june-2026-rate-sheet",
  "fema-rr2-coastal-dscr",
  "why-no-llm-number-path",
  "dscr-str-airbnb-qualifying-income",
  "dscr-loan-document-checklist",
  "dscr-loan-process-after-prequalify",
  "how-to-improve-dscr-before-applying",
] as const;

export const PUBLIC_CASE_STUDY_SLUGS = [
  "vela-capital",
  "northshore-non-qm",
  "quintero-co",
  "aurora",
] as const;

const BLOG_SLUGS = new Set<string>(PUBLIC_BLOG_SLUGS);
const CASE_STUDY_SLUGS = new Set<string>(PUBLIC_CASE_STUDY_SLUGS);

const ROUTE_MAP = Object.fromEntries(
  routeEntries().flatMap(([view, definition]) => {
    if (definition.dynamic) return [];
    return [definition.path, ...(definition.additionalPaths ?? [])].map((routePath) => [routePath, view]);
  }),
) as Record<string, RoutedPageView>;

export const CANONICAL_REDIRECTS: Readonly<Record<string, string>> = {
  "/index.html": "/",
  "/foreign-nationals": "/non-us-investors",
  "/portfolio-builders": "/tools/portfolio",
  "/partners": "/partnerships",
  "/privacy-policy": "/legal/privacy-policy",
  "/terms-of-service": "/legal/terms-of-service",
  "/book-demo": "/rate-quiz",
  "/decision-support": "/tools/decision-support",
  "/tools/arm": "/tools/arm-reset",
  "/tools/irr": "/tools/returns",
  "/tools/dscr-calculator": "/dscr-calculator",
  "/tools/lender-intel": "/lender-intel",
  "/tools/state-laws": "/state-laws",
  "/tools/deal-analyzer": "/deal-analyzer",
  "/tools/borrower-profiles": "/borrower-profiles",
  "/dashboard": "/investgo",
  "/broker-portal": "/investgo",
  "/tools/workspace": "/investgo/analyze",
  "/tools/deal-workspace": "/investgo/analyze",
  "/tools/sensitivity": "/investgo/sensitivity",
  "/tools/structure-optimizer": "/investgo/optimize",
  "/tools/scenario-history": "/investgo/history",
};

const FALLBACK_ORIGIN = "http://localhost";

interface ParsedHref {
  path: string;
  isExternal: boolean;
}

function currentOrigin(): string {
  return typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : FALLBACK_ORIGIN;
}

export function normalizePath(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0] || "/";
  if (path === "/") return path;
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

function parseHref(href: string): ParsedHref | null {
  try {
    const baseOrigin = currentOrigin();
    const url = new URL(href, baseOrigin);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    return {
      path: normalizePath(url.pathname),
      isExternal: !isHttp || url.origin !== baseOrigin,
    };
  } catch {
    return null;
  }
}

export function canonicalRedirectFor(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  const alias = CANONICAL_REDIRECTS[normalized];
  if (alias) return alias;
  if (pathname.length > 1 && /\/$/.test(pathname.split(/[?#]/, 1)[0])) return normalized;
  return null;
}

export function pathForView(view: PageView): string {
  if (view === "external") return "/external";
  if (view === "not-found") return "/404";
  return ROUTE_CONTRACT[view].path;
}

function matchRoute(pathname: string): PageView | null {
  const path = CANONICAL_REDIRECTS[pathname] ?? pathname;
  const exact = ROUTE_MAP[path];
  if (exact) return exact;

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) return BLOG_SLUGS.has(blogMatch[1]) ? "blog-post" : null;

  const caseStudyMatch = path.match(/^\/case-studies\/([^/]+)$/);
  if (caseStudyMatch) return CASE_STUDY_SLUGS.has(caseStudyMatch[1]) ? "case-studies" : null;

  return null;
}

export function resolveRoute(href: string): PageView {
  const parsed = parseHref(href);
  if (!parsed) return "not-found";
  if (parsed.isExternal) return "external";
  return matchRoute(parsed.path) ?? "not-found";
}

export function isKnownRoute(href: string): boolean {
  if (!href.startsWith("/") && !/^https?:\/\//i.test(href)) return false;
  const parsed = parseHref(href);
  return Boolean(parsed && !parsed.isExternal && matchRoute(parsed.path));
}
