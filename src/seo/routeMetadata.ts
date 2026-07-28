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
  "Model a rental property, understand the DSCR, and continue into a preliminary DSCR loan request without starting over.";
const NOINDEX_ROBOTS: RobotsPolicy = "noindex,nofollow";
const INDEX_ROBOTS: RobotsPolicy = "index,follow";

const PUBLIC_PAGES: Partial<Record<PageView, PublicPageDefinition>> = {
  marketing: {
    title: "Greenstreet Finance | A clearer path to a DSCR loan",
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
    description: "Model DSCR, PITIA, cash flow, cap rate, and debt yield from visible long-term-rental assumptions.",
    canonicalPath: "/deal-analyzer",
    jsonLdKind: "WebPage",
  },
  "state-laws": {
    title: "State Verification Checklist | Greenstreet Finance",
    description: "Organize state, entity, timing, and prepayment questions to verify for a business-purpose rental-loan request.",
    canonicalPath: "/state-laws",
    jsonLdKind: "WebPage",
  },
  "str-underwriting": {
    title: "STR Income Comparison | Greenstreet Finance",
    description: "Compare user-entered long-term, projected, and documented short-term-rental income assumptions against modeled payment coverage.",
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
    description: "Model a borrower deal and start a preliminary business-purpose DSCR loan request with Greenstreet Finance.",
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
    description: "Use connected DSCR tools to evaluate a rental property and start a preliminary loan request.",
    canonicalPath: "/investors",
    jsonLdKind: "WebPage",
  },
  faq: {
    title: "FAQ | Greenstreet Finance",
    description: "Find answers about Greenstreet Finance's DSCR tools, estimates, and preliminary loan-request process.",
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
    title: "Borrower Stories | Greenstreet Finance",
    description: "Representative DSCR borrower journeys showing how property facts can carry into a preliminary loan request.",
    canonicalPath: "/case-studies",
    jsonLdKind: "CollectionPage",
  },
  "rate-quiz": {
    title: "DSCR Loan Profile | Greenstreet Finance",
    description: "Organize five borrower and property facts before starting a preliminary DSCR loan request.",
    canonicalPath: "/rate-quiz",
    jsonLdKind: "WebPage",
  },
  "decision-support": {
    title: "Deal Decision Worksheet | Greenstreet Finance",
    description: "Compare payment coverage, leverage, liquidity, and cash-flow facts from visible assumptions without a provider recommendation.",
    canonicalPath: "/tools/decision-support",
    jsonLdKind: "WebPage",
  },
  "structure-optimizer": {
    title: "Loan Structure Comparison | Greenstreet Finance",
    description: "Compare amortizing and interest-only payments using the same user-entered loan, rate, rent, and property-cost assumptions.",
    canonicalPath: "/tools/structure-optimizer",
    jsonLdKind: "WebPage",
  },
  "tax-engine": {
    title: "Depreciable Basis Illustration | Greenstreet Finance",
    description: "Illustrate straight-line depreciable basis from user-entered allocation, recovery-period, and marginal-rate assumptions.",
    canonicalPath: "/tools/tax-engine",
    jsonLdKind: "WebPage",
  },
  "refi-tracker": {
    title: "Refinance Break-Even Calculator | Greenstreet Finance",
    description: "Compare an entered current payment with a proposed amortized payment and calculate closing-cost break-even.",
    canonicalPath: "/tools/refi-tracker",
    jsonLdKind: "WebPage",
  },
  "portfolio": {
    title: "Rental Portfolio Model | Greenstreet Finance",
    description: "Model blended DSCR, equity, debt, and cash flow across user-entered rental properties.",
    canonicalPath: "/tools/portfolio",
    jsonLdKind: "WebPage",
  },
  "monte-carlo": {
    title: "Rate-Path Simulation | Greenstreet Finance",
    description: "Explore a deterministic seeded distribution of modeled rate paths from visible statistical assumptions.",
    canonicalPath: "/tools/monte-carlo",
    jsonLdKind: "WebPage",
  },
  "arm-reset": {
    title: "ARM Reset Calculator | Greenstreet Finance",
    description: "Model an adjustable-rate payment reset from user-entered balance, term, index, margin, and cap assumptions.",
    canonicalPath: "/tools/arm-reset",
    jsonLdKind: "WebPage",
  },
  returns: {
    title: "Rental Return Model | Greenstreet Finance",
    description: "Model pre-tax rental cash flow and equity outcomes from visible acquisition, financing, operating, hold, and sale assumptions.",
    canonicalPath: "/tools/returns",
    jsonLdKind: "WebPage",
  },
  "stress-matrix": {
    title: "DSCR Stress Matrix | Greenstreet Finance",
    description: "Compare how entered rate, rent, vacancy, tax, insurance, and HOA shocks change modeled DSCR.",
    canonicalPath: "/tools/stress-matrix",
    jsonLdKind: "WebPage",
  },
  about: {
    title: "About Greenstreet Finance",
    description: "Learn how Greenstreet Finance connects DSCR tools with a preliminary loan-request path.",
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
    description: "Explore Greenstreet Finance's DSCR tools and connected preliminary loan-request workflow.",
    canonicalPath: "/products",
    jsonLdKind: "WebPage",
  },
  solutions: {
    title: "Solutions | Greenstreet Finance",
    description: "Move from rental-property analysis to a preliminary business-purpose DSCR loan request.",
    canonicalPath: "/solutions",
    jsonLdKind: "WebPage",
  },
  "book-demo": {
    title: "Apply for a DSCR Loan | Greenstreet Finance",
    description: "Start a preliminary business-purpose DSCR loan request with the property and requested loan details.",
    canonicalPath: "/apply",
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
  "greenstreet-go-launch": "Greenstreet deal workspace: from calculator to loan request",
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

  if (
    path.startsWith("/case-studies/") ||
    (path.startsWith("/book-demo/") && path !== "/book-demo") ||
    (path.startsWith("/apply/") && path !== "/apply")
  ) {
    return noindex("Page not found | Greenstreet Finance", "The requested Greenstreet Finance page was not found.");
  }

  if (view === "portal") {
    return noindex(
      "Deal Workspace | Greenstreet Finance",
      "The Greenstreet Finance workspace requires an authorized account.",
      `${SITE_ORIGIN}/investgo`,
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

type SocialMetaDefinition = {
  attribute: "name" | "property";
  key: string;
  content: string;
};

function upsertSocialMeta(documentRef: Document, definition: SocialMetaDefinition): HTMLMetaElement {
  const selector = `meta[${definition.attribute}="${definition.key}"]`;
  const existing = documentRef.head.querySelector<HTMLMetaElement>(selector);
  const element = existing ?? documentRef.createElement("meta");
  if (!existing) {
    element.setAttribute(definition.attribute, definition.key);
    element.dataset.greenstreetRouteMetadata = "true";
    documentRef.head.append(element);
  }
  element.content = definition.content;
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
  const socialDefinitions: SocialMetaDefinition[] = [
    { attribute: "property", key: "og:title", content: metadata.title },
    { attribute: "property", key: "og:description", content: metadata.description },
    { attribute: "property", key: "og:url", content: metadata.canonical ?? SITE_ORIGIN },
    { attribute: "property", key: "og:type", content: metadata.jsonLdKind === "Article" ? "article" : "website" },
    { attribute: "name", key: "twitter:title", content: metadata.title },
    { attribute: "name", key: "twitter:description", content: metadata.description },
  ];
  const priorSocial = socialDefinitions.map((definition) => {
    const selector = `meta[${definition.attribute}="${definition.key}"]`;
    const element = documentRef.head.querySelector<HTMLMetaElement>(selector);
    return { definition, element, content: element?.content };
  });

  documentRef.title = metadata.title;
  upsertMeta(documentRef, "description", metadata.description);
  upsertMeta(documentRef, "robots", metadata.robots);
  upsertCanonical(documentRef, metadata.canonical);
  socialDefinitions.forEach((definition) => upsertSocialMeta(documentRef, definition));

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
    priorSocial.forEach(({ definition, element, content }) => {
      if (element) {
        element.content = content ?? "";
        return;
      }
      const selector = `meta[${definition.attribute}="${definition.key}"][data-greenstreet-route-metadata="true"]`;
      documentRef.head.querySelector<HTMLMetaElement>(selector)?.remove();
    });
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
