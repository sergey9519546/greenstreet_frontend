import type { PageView } from "../router/resolve";
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";

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
  "perfect-property": {
    title: "Perfect Property Engine | Greenstreet Finance",
    description: "Regime-aware, loss-calibrated property prediction and underwriting copilot powered by Monte Carlo certainty scoring.",
    canonicalPath: "/tools/perfect-property",
    jsonLdKind: "WebPage",
  },
  "commercial-dscr": {
    title: "Commercial DSCR | Greenstreet Finance",
    description: "Calculate DSCR for 5+ unit commercial properties. Understand multifamily underwriting, gross rent multipliers, and vacancy factors.",
    canonicalPath: "/tools/commercial-dscr",
    jsonLdKind: "WebPage",
  },
  "construction-bridge": {
    title: "Construction & Bridge Carry | Greenstreet Finance",
    description: "Model the true cost of construction and bridge loans, carry costs, exit refinancing, and permanent DSCR takeout.",
    canonicalPath: "/tools/construction-bridge",
    jsonLdKind: "WebPage",
  },
  "tco-threshold": {
    title: "TCO Threshold Converter | Greenstreet Finance",
    description: "Convert standard DSCR targets to True Cost of Ownership (TCO) thresholds and see how reserve-loaded debt yields affect qualification.",
    canonicalPath: "/tools/tco-threshold",
    jsonLdKind: "WebPage",
  },
  // The nine entries below (refi-tracker through portfolio) were missing
  // outright — not merely blocked by HELD_VIEWS. Every one of these tools
  // ships live (see App.tsx's renderPage switch) and public/sitemap.xml
  // already submits its canonical URL, but with no PUBLIC_PAGES definition
  // getRouteMetadata fell through to the final noindex("Page not found")
  // branch regardless of HELD_VIEWS. Titles mirror each page's own
  // `document.title` exactly, since applyRouteMetadata's title write runs
  // after the page component mounts and would otherwise overwrite it.
  "refi-tracker": {
    title: "Should I Refinance My DSCR Loan? | Greenstreet Finance",
    description: "Model whether refinancing a DSCR loan clears its break-even cost, built from the current note's full amortization schedule rather than typed-in balances.",
    canonicalPath: "/tools/refi-tracker",
    jsonLdKind: "WebPage",
  },
  "arm-reset": {
    title: "What Happens When My ARM Resets? | Greenstreet Finance",
    description: "See how a DSCR loan's payment and coverage ratio change when an adjustable-rate mortgage resets, across bullish-to-crisis SOFR scenarios.",
    canonicalPath: "/tools/arm-reset",
    jsonLdKind: "WebPage",
  },
  "monte-carlo": {
    title: "Monte Carlo Simulator | Greenstreet Finance",
    description: "Run a Monte Carlo simulation of DSCR outcomes over a multi-year holding period using stated rate-path and volatility assumptions.",
    canonicalPath: "/tools/monte-carlo",
    jsonLdKind: "WebPage",
  },
  "returns": {
    title: "Returns & IRR | Greenstreet Finance",
    description: "Estimate cash-on-cash return and IRR for a rental-property scenario using purchase price, financing, rent growth, and exit assumptions.",
    canonicalPath: "/tools/returns",
    jsonLdKind: "WebPage",
  },
  "tax-engine": {
    title: "Tax Engine | Greenstreet Finance",
    description: "Estimate after-tax IRR for a rental-property scenario, including depreciation, interest deduction, and recapture assumptions.",
    canonicalPath: "/tools/tax-engine",
    jsonLdKind: "WebPage",
  },
  "stress-matrix": {
    title: "Stress Matrix | Greenstreet Finance",
    description: "Stress-test a DSCR scenario against rate, rent, vacancy, and tax shocks to see how coverage holds against a maintenance covenant threshold.",
    canonicalPath: "/tools/stress-matrix",
    jsonLdKind: "WebPage",
  },
  "structure-optimizer": {
    title: "Structure Optimizer | Greenstreet Finance",
    description: "Compare loan-structure options for a DSCR scenario to see how financing choices affect modeled coverage and proceeds.",
    canonicalPath: "/tools/structure-optimizer",
    jsonLdKind: "WebPage",
  },
  "decision-support": {
    title: "Decision Support | Greenstreet Finance",
    description: "Review a DSCR scenario's solved rate, program eligibility, and after-tax IRR together in one educational decision-support view.",
    canonicalPath: "/tools/decision-support",
    jsonLdKind: "WebPage",
  },
  "portfolio": {
    title: "Portfolio Builder | Greenstreet Finance",
    description: "Track DSCR and equity across a manually entered portfolio of rental properties for educational planning purposes.",
    canonicalPath: "/tools/portfolio",
    jsonLdKind: "WebPage",
  },
  "borrower-profiles": {
    title: "Borrower Profiles | Greenstreet Finance",
    description: "Explore common business-purpose DSCR borrower scenarios and the information needed for a preliminary review.",
    canonicalPath: "/borrower-profiles",
    jsonLdKind: "WebPage",
  },
  "non-us-investors": {
    title: "Foreign National & ITIN DSCR Loans | Greenstreet Finance",
    description: "Explore DSCR loan qualification guidelines for non-US citizens, foreign nationals, and ITIN borrowers.",
    canonicalPath: "/non-us-investors",
    jsonLdKind: "WebPage",
  },
  "str-hosts": {
    title: "Short-Term Rental & Airbnb DSCR Loans | Greenstreet Finance",
    description: "Underwrite short-term rental properties using AirDNA or 1007 fair market rent estimates for DSCR loans.",
    canonicalPath: "/str-airbnb",
    jsonLdKind: "WebPage",
  },
  "vacation-homes": {
    title: "Vacation Home & Second Home DSCR Loans | Greenstreet Finance",
    description: "Explore DSCR financing options for vacation rental properties and second home real estate investments.",
    canonicalPath: "/vacation-homes",
    jsonLdKind: "WebPage",
  },
  brokers: {
    title: "For Brokers | Greenstreet Finance",
    description: "Learn how Greenstreet Finance supports brokers evaluating business-purpose DSCR scenarios.",
    canonicalPath: "/brokers",
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
  // /support is its own live page (SupportPage), not an alias. It used to be
  // served the FAQ definition, so a visitor on /support got the tab title
  // "FAQ" and a canonical pointing at /faq — a different URL than the one
  // rendering — which invites search engines to fold the page into /faq even
  // though public/sitemap.xml submits /support separately. Title mirrors
  // SupportPage's own document.title.
  support: {
    title: "Help & Support | Greenstreet Finance",
    description: "Reach Greenstreet Finance with a question about a DSCR scenario, a tool, or a preliminary review request.",
    canonicalPath: "/support",
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
  "lender-intel": {
    title: "Lender Intelligence — DSCR Program Matching | Greenstreet Finance",
    description: "Compare business-purpose DSCR program archetypes and see which scenario details a provider reviews. Educational only — not a quote, eligibility determination, or loan commitment.",
    canonicalPath: "/lender-intel",
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

/**
 * Indexed article titles. Every entry must stay identical to the title the blog
 * actually renders for that slug (BlogPage `POSTS`, i.e. the authored title with
 * any `EDITORIAL_REVISIONS` overlay applied). `articleTitles.test.ts` pins the
 * two together — change a displayed title and this map has to move with it.
 */
export const ARTICLE_TITLES: Record<string, string> = {
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
  // The fifteen below were live, linked from the Resources nav and listed in
  // public/sitemap.xml, but had no entry here — so getRouteMetadata's /blog/
  // branch noindexed each one as "Article not found". articleTitles.test.ts only
  // asserted ARTICLE_TITLES is a subset of POSTS, never the reverse, which is
  // why a missing entry was invisible. That direction is now tested too.
  //
  // Each title is the post's RENDERED title verbatim — POSTS, i.e. RAW_POSTS
  // with the EDITORIAL_REVISIONS compliance overlay applied. That equality is
  // the contract articleTitles.test.ts enforces, and it is the right one: the
  // headline in a search result has to be the headline on the page. The
  // eighteen entries above look "rewritten" only because EDITORIAL_REVISIONS
  // softens those posts on the page too. If any headline below reads too
  // strongly, the fix is an EDITORIAL_REVISIONS entry, which moves the page and
  // the search result together — never a title here that diverges from what the
  // reader actually lands on.
  "dscr-appraisal-form-1007-market-rent": "DSCR appraisal and Form 1007: how market rent affects the loan",
  "dscr-loan-closing-costs-cash-to-close": "DSCR loan closing costs: build a complete cash-to-close budget",
  "dscr-loan-llc-entity-vesting-guide": "DSCR loans in an LLC: align the borrower, title, bank account, and lease",
  "dscr-loan-points-break-even": "DSCR loan points: calculate the break-even before buying down the rate",
  "dscr-loan-prepayment-penalty-exit-cost": "DSCR prepayment penalties: put a price on your exit before closing",
  "dscr-loan-reserves-liquidity": "DSCR loan reserves: calculate the liquidity you need after closing",
  "dscr-loan-vs-conventional-investment-property-loan": "DSCR loan vs conventional investment-property loan: how to choose",
  "dscr-loans-duplex-triplex-fourplex": "DSCR loans for duplexes, triplexes, and fourplexes: what changes",
  "dscr-property-insurance-pitia-coverage": "DSCR property insurance: the premium, coverage, and deductible test",
  "dscr-rate-lock-extension-closing-plan": "DSCR rate locks: protect the closing date, not just the interest rate",
  "dscr-sensitivity-analysis-rent-pitia": "The $100 DSCR stress test: see which assumption can break the deal",
  "dscr-vs-rental-property-cash-flow": "DSCR vs rental-property cash flow: calculate both before you buy",
  "first-dscr-loan-first-time-investor-guide": "Your first DSCR loan: a step-by-step guide for new investors",
  "interest-only-dscr-loan-payment-math": "Interest-only DSCR loans: lower payment now, higher reset risk later",
  "property-tax-reassessment-dscr-pitia": "Property-tax reassessment: the hidden PITIA reset in a DSCR purchase",
};

// Derived from TOOL_RELIABILITY_HOLDS rather than hand-maintained: this used
// to be its own hardcoded list of 13 views. As tools shipped, nobody updated
// it, so it kept noindexing (title "Tool unavailable for review") ten
// released, working tools whose URLs public/sitemap.xml was simultaneously
// submitting to search engines — index and noindex signals for the same URL
// at once. TOOL_RELIABILITY_HOLDS is the single source of truth for what is
// actually held (today: only the InvestGO workspace), so deriving from it
// makes that kind of drift structurally impossible going forward.
const HELD_VIEWS = new Set<PageView>(
  Object.values(TOOL_RELIABILITY_HOLDS).map((hold) => hold.view),
);

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

  // /lender-intel and /support are both their own live pages (LenderIntelPage,
  // SupportPage), so they resolve through their own PUBLIC_PAGES entries below
  // with their own titles and canonicals. Only /products/platform still aliases
  // to the Products page. (The /support alias outlived the comment that said
  // this and was still handing out the FAQ definition.)
  if (path === "/products/platform") return indexed(PUBLIC_PAGES.products!);
  // No partner alias here. The `brokers-partner` view and its page component
  // were deleted outright (not merely made unreachable) — the owner retired
  // the partner page and all its material. resolve.ts sends /partners and
  // /partnerships to `portal`, and /become-a-partner to `not-found`; each path
  // reaches the guard below that actually describes what renders. An alias
  // used to run BEFORE the portal guard and the not-found guard, overriding
  // both to publish the private InvestGO workspace and a 404 to search
  // engines as an indexable "Partner With Greenstreet" page. A future public
  // partner page would need new routing, content, and metadata — this file
  // no longer has anything to resurrect.

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
