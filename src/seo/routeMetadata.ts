import type { PageView } from "../router/resolve";

/** The one public origin used in canonical URLs and structured data. */
export const SITE_ORIGIN = "https://www.greenstreet.finance";

export type JsonLdKind = "WebSite" | "WebPage" | "CollectionPage" | "Article";
export type RobotsPolicy = "index,follow" | "noindex,nofollow";

export interface RouteMetadata {
  title: string;
  description: string;
  canonical: string | null;
  robots: RobotsPolicy;
  jsonLdKind?: JsonLdKind;
}

export interface RouteMetadataInput {
  pathname: string;
  view: PageView;
}

type PublicPageDefinition = Omit<RouteMetadata, "canonical" | "robots"> & {
  canonicalPath: string;
};

const SITE_NAME = "Greenstreet Finance";
const DEFAULT_DESCRIPTION =
  "Educational DSCR loan tools and investor guidance from Greenstreet Finance. Calculator results are estimates, not loan commitments or advice.";
const NOINDEX_ROBOTS: RobotsPolicy = "noindex,nofollow";
const INDEX_ROBOTS: RobotsPolicy = "index,follow";

const PUBLIC_PAGES: Partial<Record<PageView, PublicPageDefinition>> = {
  marketing: {
    title: "Greenstreet Finance | DSCR loan tools for real estate investors",
    description: DEFAULT_DESCRIPTION,
    canonicalPath: "/",
    jsonLdKind: "WebSite",
  },
  "dscr-calculator": {
    title: "DSCR Calculator | Greenstreet Finance",
    description: "Estimate a rental property's debt-service coverage ratio using property income, expenses, and loan assumptions.",
    canonicalPath: "/dscr-calculator",
    jsonLdKind: "WebPage",
  },
  "deal-analyzer": {
    title: "Deal Analyzer | Greenstreet Finance",
    description: "Review lender DSCR and investor cash-flow estimates for a long-term rental scenario.",
    canonicalPath: "/deal-analyzer",
    jsonLdKind: "WebPage",
  },
  "state-laws": {
    title: "State Rules Reference | Greenstreet Finance",
    description: "Review educational state-level prepayment-penalty reference information for business-purpose DSCR scenarios.",
    canonicalPath: "/state-laws",
    jsonLdKind: "WebPage",
  },
  "str-underwriting": {
    title: "STR Underwriting | Greenstreet Finance",
    description: "Explore an educational short-term-rental underwriting scenario with clearly stated assumptions.",
    canonicalPath: "/tools/str-underwriting",
    jsonLdKind: "WebPage",
  },
  "borrower-profiles": {
    title: "Borrower Profiles | Greenstreet Finance",
    description: "Explore common business-purpose DSCR borrower scenarios and the information needed for a preliminary review.",
    canonicalPath: "/borrower-profiles",
    jsonLdKind: "WebPage",
  },
  brokers: {
    title: "For Brokers | Greenstreet Finance",
    description: "Learn how Greenstreet Finance supports brokers evaluating business-purpose DSCR scenarios.",
    canonicalPath: "/brokers",
    jsonLdKind: "WebPage",
  },
  "brokers-partner": {
    title: "Partner With Greenstreet | Greenstreet Finance",
    description: "Learn about the Greenstreet Finance partner workflow for business-purpose DSCR scenarios.",
    canonicalPath: "/partners",
    jsonLdKind: "WebPage",
  },
  investors: {
    title: "For Investors | Greenstreet Finance",
    description: "Learn about Greenstreet Finance's educational tools for real estate investors evaluating DSCR scenarios.",
    canonicalPath: "/investors",
    jsonLdKind: "WebPage",
  },
  faq: {
    title: "FAQ | Greenstreet Finance",
    description: "Find answers about Greenstreet Finance's educational DSCR tools, estimates, and preliminary review process.",
    canonicalPath: "/faq",
    jsonLdKind: "WebPage",
  },
  blog: {
    title: "Investor Guidance | Greenstreet Finance",
    description: "Educational articles about DSCR lending concepts, rental-property underwriting, and investor decision making.",
    canonicalPath: "/blog",
    jsonLdKind: "CollectionPage",
  },
  "case-studies": {
    title: "Illustrative Scenarios | Greenstreet Finance",
    description: "Illustrative DSCR underwriting scenarios that show how assumptions can affect a preliminary review.",
    canonicalPath: "/case-studies",
    jsonLdKind: "CollectionPage",
  },
  "rate-quiz": {
    title: "DSCR Rate Estimate | Greenstreet Finance",
    description: "Answer a few questions to receive an educational DSCR rate estimate based on stated assumptions.",
    canonicalPath: "/rate-quiz",
    jsonLdKind: "WebPage",
  },
  about: {
    title: "About Greenstreet Finance",
    description: "Learn about Greenstreet Finance and its approach to educational DSCR tools and preliminary deal review.",
    canonicalPath: "/about",
    jsonLdKind: "WebPage",
  },
  careers: {
    title: "Careers | Greenstreet Finance",
    description: "Explore career opportunities at Greenstreet Finance.",
    canonicalPath: "/careers",
    jsonLdKind: "WebPage",
  },
  legal: {
    title: "Terms, Privacy & Disclosures | Greenstreet Finance",
    description: "Read Greenstreet Finance's disclosures, privacy policy, and terms of service.",
    canonicalPath: "/legal",
    jsonLdKind: "WebPage",
  },
  products: {
    title: "Products | Greenstreet Finance",
    description: "Explore Greenstreet Finance's educational DSCR tools and preliminary review workflow.",
    canonicalPath: "/products",
    jsonLdKind: "WebPage",
  },
  solutions: {
    title: "Solutions | Greenstreet Finance",
    description: "Explore Greenstreet Finance solutions for evaluating business-purpose rental-property financing scenarios.",
    canonicalPath: "/solutions",
    jsonLdKind: "WebPage",
  },
  "book-demo": {
    title: "Request a Review | Greenstreet Finance",
    description: "Request a preliminary Greenstreet Finance review for a business-purpose DSCR scenario.",
    canonicalPath: "/book-demo",
    jsonLdKind: "WebPage",
  },
};

const LEGAL_ALIAS_METADATA: Record<string, PublicPageDefinition> = {
  "/privacy-policy": {
    title: "Privacy Policy | Greenstreet Finance",
    description: "Read the Greenstreet Finance privacy policy.",
    canonicalPath: "/legal/privacy-policy",
    jsonLdKind: "WebPage",
  },
  "/legal/privacy-policy": {
    title: "Privacy Policy | Greenstreet Finance",
    description: "Read the Greenstreet Finance privacy policy.",
    canonicalPath: "/legal/privacy-policy",
    jsonLdKind: "WebPage",
  },
  "/terms-of-service": {
    title: "Terms of Service | Greenstreet Finance",
    description: "Read the Greenstreet Finance terms of service.",
    canonicalPath: "/legal/terms-of-service",
    jsonLdKind: "WebPage",
  },
  "/legal/terms-of-service": {
    title: "Terms of Service | Greenstreet Finance",
    description: "Read the Greenstreet Finance terms of service.",
    canonicalPath: "/legal/terms-of-service",
    jsonLdKind: "WebPage",
  },
};

const ARTICLE_TITLES: Record<string, string> = {
  "greenstreet-go-launch": "InvestGO: an educational DSCR workflow concept",
  "what-is-dscr-how-it-works": "What is DSCR? The complete guide to how the ratio works and why it matters",
  "dscr-pitia-breakdown-qualifying-income": "PITIA breakdown: five inputs to verify in a DSCR scenario",
  "dscr-ltv-down-payment-fico": "LTV, down payment, and credit profile: questions to verify",
  "dscr-refinance-rate-term-cashout-seasoning": "DSCR refinance scenarios: questions to verify",
  "dscr-approval-issues-sub-10-fico-reserves": "DSCR scenario constraints to discuss before applying",
  "dscr-foreign-nationals-itin": "Foreign-national and ITIN DSCR scenarios: questions to verify",
  "obbba-2025-real-estate-tax-changes": "Tax-law changes and real estate models: questions to verify",
  "mn-hf3437-business-purpose": "Minnesota DSCR loans: questions to verify before structuring",
  "qoz-qrof-permanent-obbba": "Opportunity Zone investing: questions to verify before modeling",
  "section-1071-final-rule-dscr": "Section 1071 and DSCR lending: questions to verify",
  "june-2026-rate-sheet": "How to read a DSCR rate quote",
  "fema-rr2-coastal-dscr": "Flood insurance and coastal DSCR scenarios: what to verify",
  "why-no-llm-number-path": "Why deterministic models matter for numerical estimates",
  "dscr-str-airbnb-qualifying-income": "Short-term rental (STR) income in a DSCR scenario",
  "dscr-loan-document-checklist": "DSCR documentation: a provider-confirmation checklist",
  "dscr-loan-process-after-prequalify": "After a preliminary DSCR estimate: process questions to ask",
  "how-to-improve-dscr-before-applying": "How scenario inputs change modeled DSCR",
};

const HELD_VIEWS = new Set<PageView>([
  "decision-support",
  "deal-analyzer",
  "rate-quiz",
  "state-laws",
  "str-underwriting",
  "structure-optimizer",
  "tax-engine",
  "refi-tracker",
  "portfolio",
  "monte-carlo",
  "arm-reset",
  "returns",
  "stress-matrix",
]);

function normalizePathname(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0] || "/";
  if (!path.startsWith("/")) return `/${path}`;
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function indexed(definition: PublicPageDefinition): RouteMetadata {
  return {
    ...definition,
    canonical: `${SITE_ORIGIN}${definition.canonicalPath}`,
    robots: INDEX_ROBOTS,
  };
}

function noindex(title: string, description: string, canonical: string | null = null): RouteMetadata {
  return { title, description, canonical, robots: NOINDEX_ROBOTS };
}

/**
 * Resolves metadata from the current URL and resolved React view. Dynamic and
 * alias routes are deliberately checked before the view-level fallback.
 */
export function getRouteMetadata({ pathname, view }: RouteMetadataInput): RouteMetadata {
  const path = normalizePathname(pathname);

  const legal = LEGAL_ALIAS_METADATA[path];
  if (legal) return indexed(legal);

  if (path === "/support") return indexed(PUBLIC_PAGES.faq!);
  if (path === "/lender-intel" || path === "/products/platform") return indexed(PUBLIC_PAGES.products!);
  if (["/become-a-partner", "/partnerships"].includes(path)) return indexed(PUBLIC_PAGES["brokers-partner"]!);

  if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length);
    const articleTitle = ARTICLE_TITLES[slug];
    if (articleTitle) {
      return indexed({
        title: `${articleTitle} | ${SITE_NAME}`,
        description: `Greenstreet Finance investor guidance: ${articleTitle}`,
        canonicalPath: `/blog/${slug}`,
        jsonLdKind: "Article",
      });
    }
    return noindex("Article not found | Greenstreet Finance", "The requested Greenstreet Finance article was not found.");
  }

  if (path.startsWith("/case-studies/") || (path.startsWith("/book-demo/") && path !== "/book-demo")) {
    return noindex("Page not found | Greenstreet Finance", "The requested Greenstreet Finance page was not found.");
  }

  if (path.startsWith("/investgo") || view === "portal") {
    return noindex(
      "InvestGO Workspace | Greenstreet Finance",
      "The Greenstreet Finance workspace requires an authorized account.",
      `${SITE_ORIGIN}/investgo`,
    );
  }

  if (HELD_VIEWS.has(view)) {
    return noindex(
      "Tool unavailable for review | Greenstreet Finance",
      "This Greenstreet Finance tool is temporarily unavailable while its decision model is under review.",
      `${SITE_ORIGIN}${path}`,
    );
  }

  if (view === "not-found" || view === "external") {
    return noindex("Page not found | Greenstreet Finance", "The requested Greenstreet Finance page was not found.");
  }

  const definition = PUBLIC_PAGES[view];
  return definition
    ? indexed(definition)
    : noindex("Page not found | Greenstreet Finance", "The requested Greenstreet Finance page was not found.");
}

function upsertMeta(documentRef: Document, name: "description" | "robots", content: string): HTMLMetaElement {
  const selector = `meta[name="${name}"]`;
  const existing = documentRef.head.querySelector<HTMLMetaElement>(selector);
  const element = existing ?? documentRef.createElement("meta");
  if (!existing) {
    element.name = name;
    documentRef.head.append(element);
    element.dataset.greenstreetRouteMetadata = "true";
  }
  element.content = content;
  return element;
}

function upsertCanonical(documentRef: Document, canonical: string | null): HTMLLinkElement | undefined {
  const existing = documentRef.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    existing?.remove();
    return undefined;
  }
  const element = existing ?? documentRef.createElement("link");
  if (!existing) {
    element.rel = "canonical";
    documentRef.head.append(element);
    element.dataset.greenstreetRouteMetadata = "true";
  }
  element.href = canonical;
  return element;
}

function jsonLdFor(metadata: RouteMetadata): Record<string, string> | undefined {
  if (!metadata.jsonLdKind || !metadata.canonical) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": metadata.jsonLdKind,
    name: metadata.title.replace(` | ${SITE_NAME}`, ""),
    description: metadata.description,
    url: metadata.canonical,
  };
}

/**
 * Applies one route's head metadata and returns a cleanup callback for a React
 * effect. The cleanup only removes elements this module owns, so application
 * scripts and third-party tags are left alone.
 */
export function applyRouteMetadata(metadata: RouteMetadata, documentRef: Document = document): () => void {
  const priorTitle = documentRef.title;
  const priorDescription = documentRef.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  const priorDescriptionContent = priorDescription?.content;
  const priorRobots = documentRef.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  const priorRobotsContent = priorRobots?.content;
  const priorCanonical = documentRef.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const priorCanonicalHref = priorCanonical?.href;

  documentRef.title = metadata.title;
  upsertMeta(documentRef, "description", metadata.description);
  upsertMeta(documentRef, "robots", metadata.robots);
  upsertCanonical(documentRef, metadata.canonical);

  documentRef.head.querySelectorAll('script[data-greenstreet-route-metadata="true"]').forEach((node) => node.remove());
  const jsonLd = jsonLdFor(metadata);
  if (jsonLd) {
    const script = documentRef.createElement("script");
    script.type = "application/ld+json";
    script.dataset.greenstreetRouteMetadata = "true";
    script.textContent = JSON.stringify(jsonLd);
    documentRef.head.append(script);
  }

  return () => {
    documentRef.title = priorTitle;
    restoreMeta(documentRef, "description", priorDescription, priorDescriptionContent);
    restoreMeta(documentRef, "robots", priorRobots, priorRobotsContent);
    restoreCanonical(documentRef, priorCanonical, priorCanonicalHref);
    cleanupRouteMetadata(documentRef);
  };
}

function restoreMeta(
  documentRef: Document,
  name: "description" | "robots",
  previous: HTMLMetaElement | null,
  previousContent: string | undefined,
): void {
  if (previous) {
    previous.content = previousContent ?? "";
    return;
  }
  documentRef.head.querySelector<HTMLMetaElement>(`meta[name="${name}"][data-greenstreet-route-metadata="true"]`)?.remove();
}

function restoreCanonical(
  documentRef: Document,
  previous: HTMLLinkElement | null,
  previousHref: string | undefined,
): void {
  if (previous) {
    previous.href = previousHref ?? "";
    if (!previous.isConnected) documentRef.head.append(previous);
    return;
  }
  documentRef.head.querySelector<HTMLLinkElement>('link[rel="canonical"][data-greenstreet-route-metadata="true"]')?.remove();
}

/** Removes only metadata elements created by this module. */
export function cleanupRouteMetadata(documentRef: Document = document): void {
  documentRef.head
    .querySelectorAll('[data-greenstreet-route-metadata="true"]')
    .forEach((node) => node.remove());
}
