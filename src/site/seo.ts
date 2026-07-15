import {
  PUBLIC_BLOG_SLUGS,
  PUBLIC_CASE_STUDY_SLUGS,
  canonicalRedirectFor,
  normalizePath,
  resolveRoute,
  type PageView,
} from "../router/resolve";

export const SITE_ORIGIN = "https://www.greenstreet.finance";
export const SITE_NAME = "Greenstreet Finance";

export type SchemaPageType = "WebPage" | "CollectionPage" | "AboutPage" | "BlogPosting";

export type PageSeo = {
  view: PageView;
  path: string;
  canonicalPath: string | null;
  title: string;
  description: string;
  primaryKeyword: string;
  searchIntent: string;
  indexable: boolean;
  schemaType: SchemaPageType;
  breadcrumbName: string;
};

function titleToBreadcrumbName(title: string): string {
  const suffix = ` | ${SITE_NAME}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length).trim() : title.trim();
}

function page(
  view: PageView,
  path: string,
  title: string,
  description: string,
  primaryKeyword: string,
  searchIntent: string,
  schemaType: SchemaPageType = "WebPage",
  breadcrumbName: string = titleToBreadcrumbName(title),
): PageSeo {
  return {
    view,
    path,
    canonicalPath: path,
    title,
    description,
    primaryKeyword,
    searchIntent,
    indexable: true,
    schemaType,
    breadcrumbName,
  };
}

export const PAGE_SEO: PageSeo[] = [
  page("marketing", "/", "Greenstreet Finance | DSCR Loan Analysis for Investors", "Explore DSCR loan scenarios for rental properties. Estimate rent coverage, compare program fit, and review state-specific considerations before requesting a scenario review.", "DSCR loans", "Evaluate a rental-property DSCR loan scenario.", "WebPage", "Home"),
  page("products", "/products", "DSCR Loan Tools and Resources | Greenstreet Finance", "Explore Greenstreet Finance tools for DSCR calculations, scenario analysis, property risks, and rental-investment decisions.", "DSCR loan tools", "Find tools for evaluating a DSCR loan scenario.", "CollectionPage", "Products"),
  page("platform", "/products/platform", "DSCR Analysis Platform | Greenstreet Finance", "Review the Greenstreet Finance platform for evaluating rent coverage, loan assumptions, property risks, and DSCR scenarios.", "DSCR analysis platform", "Understand the Greenstreet Finance analysis platform."),
  page("solutions", "/solutions", "DSCR Loan Solutions by Investor Scenario | Greenstreet Finance", "Explore DSCR educational resources and analysis tools organized by rental-property investor scenario.", "DSCR loan solutions", "Find resources for a specific investor scenario.", "CollectionPage"),
  page("investors", "/investors", "DSCR Loan Analysis for Property Investors | Greenstreet Finance", "Evaluate rental-property financing assumptions, rent coverage, leverage, and risk with Greenstreet Finance DSCR tools.", "DSCR loans for investors", "Evaluate a rental-property financing scenario."),
  page("brokers", "/brokers", "DSCR Scenario Tools for Mortgage Brokers | Greenstreet Finance", "Explore DSCR scenario-analysis tools and educational resources for mortgage professionals working with rental-property investors.", "DSCR tools for brokers", "Find DSCR scenario tools for mortgage professionals."),
  page("brokers-partner", "/partnerships", "Partnerships | Greenstreet Finance", "Learn about the partnership experience and DSCR scenario resources presented by Greenstreet Finance.", "Greenstreet Finance partnerships", "Review partnership information."),
  page("borrower-profiles", "/borrower-profiles", "DSCR Loan Requirements by Borrower Profile | Greenstreet Finance", "Compare common DSCR scenario considerations for first-time investors, LLC borrowers, non-U.S. investors, and other borrower profiles.", "DSCR loan requirements", "Compare DSCR considerations by borrower profile."),
  page("non-us-investors", "/non-us-investors", "DSCR Loans for Non-U.S. Investors | Greenstreet Finance", "Review common documents, property assumptions, and program considerations for non-U.S. investors evaluating U.S. rental property.", "DSCR loans for non-US investors", "Understand DSCR considerations for a non-U.S. investor."),
  page("str-hosts", "/str-airbnb", "Airbnb and Short-Term Rental DSCR Loans | Greenstreet Finance", "Model short-term-rental income assumptions, seasonal performance, property costs, and DSCR coverage for an Airbnb investment scenario.", "Airbnb DSCR loans", "Evaluate an Airbnb or short-term-rental DSCR scenario."),
  page("vacation-homes", "/vacation-homes", "Vacation Rental DSCR Scenario Analysis | Greenstreet Finance", "Evaluate rent coverage and financing assumptions for a non-owner-occupied vacation rental scenario.", "vacation rental DSCR loan", "Evaluate a vacation-rental financing scenario."),
  page("case-studies", "/case-studies", "Illustrative DSCR Scenarios | Greenstreet Finance", "Review clearly labeled illustrative DSCR scenarios showing how different property and financing assumptions can affect an analysis.", "DSCR loan scenarios", "Review illustrative DSCR analyses.", "CollectionPage", "Case Studies"),
  page("about", "/about", "About | Greenstreet Finance", "Learn about the Greenstreet Finance website, its DSCR analysis resources, and the audience those resources are designed to support.", "about Greenstreet Finance", "Understand the purpose of the Greenstreet Finance website.", "AboutPage"),
  page("careers", "/careers", "Careers | Greenstreet Finance", "Learn about working with Greenstreet Finance and review any opportunities currently presented on the careers page.", "Greenstreet Finance careers", "Review Greenstreet Finance career information."),
  page("support", "/support", "Support | Greenstreet Finance", "Find Greenstreet Finance support information and guidance for using the website's DSCR analysis tools.", "Greenstreet Finance support", "Get help using Greenstreet Finance."),
  page("legal", "/legal", "Legal Information | Greenstreet Finance", "Review Greenstreet Finance legal information, website terms, privacy information, and educational-use limitations.", "Greenstreet Finance legal", "Review legal and policy information.", "CollectionPage", "Legal"),
  page("legal", "/legal/privacy-policy", "Privacy Policy | Greenstreet Finance", "Review how the Greenstreet Finance website describes its collection, use, and handling of information.", "Greenstreet Finance privacy policy", "Review the website privacy policy."),
  page("legal", "/legal/terms-of-service", "Terms of Service | Greenstreet Finance", "Review the terms and limitations that apply when using the Greenstreet Finance website and analysis tools.", "Greenstreet Finance terms", "Review the website terms of service."),
  page("faq", "/faq", "DSCR Loan Questions and Answers | Greenstreet Finance", "Review educational answers about DSCR calculations, rental income, documents, program considerations, and Greenstreet Finance tools.", "DSCR loan FAQ", "Find answers to common DSCR loan questions."),
  page("how-it-works", "/how-it-works", "How DSCR Scenario Analysis Works | Greenstreet Finance", "Follow the Greenstreet Finance process for entering a rental-property scenario, reviewing assumptions, and interpreting preliminary results.", "how DSCR analysis works", "Understand the Greenstreet Finance analysis workflow."),
  page("blog", "/blog", "DSCR Loan Guides and Analysis | Greenstreet Finance", "Read educational guides about DSCR calculations, rental-property financing assumptions, borrower profiles, and investment risks.", "DSCR loan guides", "Research DSCR loans and rental-property analysis.", "CollectionPage", "Blog"),
  page("rate-quiz", "/rate-quiz", "DSCR Scenario Quiz | Greenstreet Finance", "Enter property and borrower assumptions to receive a preliminary DSCR scenario result. Results are estimates, not approvals, commitments, or rate locks.", "DSCR scenario quiz", "Start a preliminary DSCR scenario review."),
  page("dscr-calculator", "/dscr-calculator", "DSCR Loan Calculator | Greenstreet Finance", "Estimate debt service coverage using rental income and property payment assumptions. Review the inputs and limitations before relying on a result.", "DSCR loan calculator", "Calculate a property's estimated DSCR."),
  page("lender-intel", "/lender-intel", "Compare DSCR Program Fit | Greenstreet Finance", "Compare scenario assumptions against the DSCR program information presented by Greenstreet Finance. Results are preliminary and program requirements may vary.", "compare DSCR programs", "Compare potential DSCR program fit."),
  page("state-laws", "/state-laws", "DSCR Prepayment Considerations by State | Greenstreet Finance", "Review educational state-specific prepayment considerations and verify current requirements with qualified counsel before acting.", "DSCR prepayment penalty by state", "Research state-specific prepayment considerations."),
  page("deal-analyzer", "/deal-analyzer", "Rental Property Deal Analyzer | Greenstreet Finance", "Run a preliminary rental-property scenario analysis using financing, income, expense, and risk assumptions.", "rental property deal analyzer", "Analyze a rental-property scenario."),
  page("refi-tracker", "/tools/refi-tracker", "DSCR Refinance Scenario Tracker | Greenstreet Finance", "Compare refinance assumptions such as equity, DSCR headroom, monthly savings, and estimated break-even timing.", "DSCR refinance calculator", "Evaluate a potential DSCR refinance scenario."),
  page("arm-reset", "/tools/arm-reset", "DSCR ARM Reset Calculator | Greenstreet Finance", "Model illustrative payment and DSCR changes for an adjustable-rate loan using the note assumptions you provide.", "DSCR ARM reset calculator", "Model an adjustable-rate reset scenario."),
  page("monte-carlo", "/tools/monte-carlo", "Rental Property Monte Carlo Analysis | Greenstreet Finance", "Explore a range of illustrative rental-property outcomes using adjustable model assumptions and simulated scenarios.", "rental property Monte Carlo", "Stress-test a rental-property scenario."),
  page("returns", "/tools/returns", "Rental Property Returns Calculator | Greenstreet Finance", "Estimate rental-property returns from the purchase, financing, income, expense, and exit assumptions you provide.", "rental property returns calculator", "Estimate rental-property returns."),
  page("tax-engine", "/tools/tax-engine", "Rental Property Tax Scenario Tool | Greenstreet Finance", "Model illustrative tax assumptions for a rental-property scenario and review results with a qualified tax professional before acting.", "rental property tax calculator", "Explore a rental-property tax scenario."),
  page("stress-matrix", "/tools/stress-matrix", "Rental Property Stress Test | Greenstreet Finance", "Compare illustrative changes in rent, occupancy, expenses, rates, and property value across a rental-property stress matrix.", "rental property stress test", "Stress-test rental-property assumptions."),
  page("decision-support", "/tools/decision-support", "Rental Property Decision Support | Greenstreet Finance", "Compare qualification, cash-flow, and risk assumptions before making a rental-property financing decision.", "DSCR decision support", "Compare a rental-property decision scenario."),
  page("str-underwriting", "/tools/str-underwriting", "Short-Term Rental Income Scenario Tool | Greenstreet Finance", "Evaluate short-term-rental income, seasonality, occupancy, expenses, and DSCR assumptions for an illustrative property scenario.", "short-term rental underwriting calculator", "Evaluate short-term-rental income assumptions."),
  page("portfolio", "/tools/portfolio", "Rental Property Portfolio Analysis | Greenstreet Finance", "Review leverage, concentration, debt coverage, and refinance assumptions across a rental-property portfolio scenario.", "rental property portfolio analysis", "Analyze a rental-property portfolio."),
];

const STATIC_SEO = new Map(PAGE_SEO.map((entry) => [entry.path, entry]));

const BLOG_TITLES: Record<(typeof PUBLIC_BLOG_SLUGS)[number], string> = {
  "greenstreet-go-launch": "Greenstreet Go Launch",
  "what-is-dscr-how-it-works": "What Is DSCR and How Does It Work?",
  "dscr-pitia-breakdown-qualifying-income": "DSCR, PITIA, and Qualifying Rental Income",
  "dscr-ltv-down-payment-fico": "DSCR LTV, Down Payment, and FICO",
  "dscr-refinance-rate-term-cashout-seasoning": "DSCR Refinance, Cash-Out, and Seasoning",
  "dscr-approval-issues-sub-10-fico-reserves": "DSCR Approval Issues, FICO, and Reserves",
  "dscr-non-us-investors-itin": "DSCR Loans for Non-U.S. Investors and ITIN Borrowers",
  "obbba-2025-real-estate-tax-changes": "OBBBA 2025 Real Estate Tax Changes",
  "mn-hf3437-business-purpose": "Minnesota HF 3437 and Business-Purpose Loans",
  "qoz-qrof-permanent-obbba": "Qualified Opportunity Zones and QROFs After OBBBA",
  "section-1071-final-rule-dscr": "Section 1071 and DSCR Lending",
  "june-2026-rate-sheet": "June 2026 DSCR Rate Sheet",
  "fema-rr2-coastal-dscr": "FEMA Risk Rating 2.0 and Coastal DSCR Loans",
  "why-no-llm-number-path": "Why Greenstreet Does Not Use an LLM for Loan Numbers",
  "dscr-str-airbnb-qualifying-income": "DSCR Loans for Airbnb and Short-Term Rentals",
  "dscr-loan-document-checklist": "DSCR Loan Document Checklist",
  "dscr-loan-process-after-prequalify": "The DSCR Loan Process After Prequalification",
  "how-to-improve-dscr-before-applying": "How to Improve DSCR Before Applying",
};

const CASE_STUDY_TITLES: Record<(typeof PUBLIC_CASE_STUDY_SLUGS)[number], string> = {
  "vela-capital": "Vela Capital",
  "northshore-non-qm": "Northshore Non-QM",
  "quintero-co": "Quintero & Co.",
  aurora: "Aurora",
};

function dynamicSeo(path: string): PageSeo | null {
  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch && PUBLIC_BLOG_SLUGS.includes(blogMatch[1] as (typeof PUBLIC_BLOG_SLUGS)[number])) {
    const slug = blogMatch[1] as (typeof PUBLIC_BLOG_SLUGS)[number];
    const topic = BLOG_TITLES[slug];
    const topicWithoutTerminalPunctuation = topic.replace(/[?.]$/, "");
    return page("blog-post", path, `${topic} | Greenstreet Finance`, `Read Greenstreet Finance's educational overview of ${topicWithoutTerminalPunctuation}. Information is general and scenario-specific requirements may vary.`, topic, `Research ${topicWithoutTerminalPunctuation.toLowerCase()}.`, "BlogPosting", topic);
  }

  const caseMatch = path.match(/^\/case-studies\/([^/]+)$/);
  if (caseMatch && PUBLIC_CASE_STUDY_SLUGS.includes(caseMatch[1] as (typeof PUBLIC_CASE_STUDY_SLUGS)[number])) {
    const slug = caseMatch[1] as (typeof PUBLIC_CASE_STUDY_SLUGS)[number];
    const name = CASE_STUDY_TITLES[slug];
    return page("case-studies", path, `Illustrative DSCR Scenario: ${name} | Greenstreet Finance`, `Review the ${name} illustrative scenario. Composite examples are educational and do not represent a customer testimonial or typical result.`, "illustrative DSCR scenario", "Review an illustrative DSCR scenario.", "WebPage", name);
  }

  return null;
}

function noIndexSeo(view: PageView, path: string): PageSeo {
  const notFound = view === "not-found";
  return {
    view,
    path,
    canonicalPath: null,
    title: notFound ? "Page Not Found | Greenstreet Finance" : "Greenstreet Finance",
    description: notFound ? "The requested Greenstreet Finance page could not be found." : "Private Greenstreet Finance application route.",
    primaryKeyword: "",
    searchIntent: "",
    indexable: false,
    schemaType: "WebPage",
    breadcrumbName: "",
  };
}

export function getPageSeo(pathname: string, suppliedView?: PageView): PageSeo {
  const requestedPath = normalizePath(pathname);
  const canonicalPath = canonicalRedirectFor(requestedPath) ?? requestedPath;
  const view = suppliedView ?? resolveRoute(requestedPath);
  const matched = STATIC_SEO.get(canonicalPath) ?? dynamicSeo(canonicalPath);
  if (matched) return matched;
  return noIndexSeo(view, requestedPath);
}

export const CANONICAL_PUBLIC_PATHS = [
  ...PAGE_SEO.map((entry) => entry.path),
  ...PUBLIC_BLOG_SLUGS.map((slug) => `/blog/${slug}`),
  ...PUBLIC_CASE_STUDY_SLUGS.map((slug) => `/case-studies/${slug}`),
] as const;

export function absoluteUrl(pathOrUrl: string): string {
  const value = pathOrUrl.trim() || "/";

  try {
    const absolute = new URL(value);
    if (
      (absolute.protocol === "https:" || absolute.protocol === "http:") &&
      !absolute.username &&
      !absolute.password
    ) {
      return absolute.toString();
    }
  } catch {
    // Relative values are normalized against the production site below.
  }

  const path = value.startsWith("/") ? value : `/${value}`;
  return new URL(`${SITE_ORIGIN}${path}`).toString();
}

const SCHEMA_PAGE_TYPES: ReadonlySet<SchemaPageType> = new Set([
  "WebPage",
  "CollectionPage",
  "AboutPage",
  "BlogPosting",
]);

function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isCanonicalPath(value: string): boolean {
  return value === "/" || /^\/[a-z0-9][a-z0-9/-]*$/.test(value);
}

function breadcrumbParentPath(path: string): string | null {
  if (path === "/products/platform" || path.startsWith("/tools/")) return "/products";
  if (path.startsWith("/blog/")) return "/blog";
  if (path.startsWith("/case-studies/")) return "/case-studies";
  if (path.startsWith("/legal/")) return "/legal";
  return null;
}

function buildBreadcrumbList(seo: PageSeo, pageUrl: string): Record<string, unknown> {
  const trail: Array<{ name: string; path: string }> = [{ name: "Home", path: "/" }];
  const parentPath = breadcrumbParentPath(seo.canonicalPath!);
  const parent = parentPath ? STATIC_SEO.get(parentPath) : null;

  if (parent && parent.path !== seo.canonicalPath) {
    trail.push({ name: parent.breadcrumbName, path: parent.path });
  }
  if (seo.canonicalPath !== "/") {
    trail.push({ name: seo.breadcrumbName, path: seo.canonicalPath! });
  }

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function sanitizeJsonLd(value: unknown): unknown {
  if (typeof value === "string") return value.trim() ? value : undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    const items = value.map(sanitizeJsonLd).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, sanitizeJsonLd(item)] as const)
      .filter(([, item]) => item !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return undefined;
}

export function buildStructuredData(seo: PageSeo): Record<string, unknown> | null {
  if (
    !seo.indexable ||
    !seo.canonicalPath ||
    !isCanonicalPath(seo.canonicalPath) ||
    !isNonBlankString(seo.title) ||
    !isNonBlankString(seo.description) ||
    !isNonBlankString(seo.breadcrumbName) ||
    !SCHEMA_PAGE_TYPES.has(seo.schemaType)
  ) return null;

  const pageUrl = absoluteUrl(seo.canonicalPath);
  const organizationId = `${SITE_ORIGIN}/#organization`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const breadcrumb = buildBreadcrumbList(seo, pageUrl);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        publisher: { "@id": organizationId },
        inLanguage: "en-US",
      },
      breadcrumb,
      {
        "@type": seo.schemaType,
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: seo.title,
        description: seo.description,
        isPartOf: { "@id": websiteId },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        ...(seo.schemaType === "BlogPosting" ? {
          headline: seo.breadcrumbName,
          publisher: { "@id": organizationId },
        } : {}),
        inLanguage: "en-US",
      },
    ],
  };

  return sanitizeJsonLd(structuredData) as Record<string, unknown>;
}
