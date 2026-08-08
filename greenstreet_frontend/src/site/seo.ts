import type { PageView } from "../router/resolve";

export type PageSeo = {
  view: PageView;
  path: string;
  title: string;
  description: string;
  primaryKeyword: string;
  searchIntent: string;
  canonicalPath?: string;
};

export const SITE_DOMAIN = "https://www.greenstreet.finance";

export const PAGE_SEO: PageSeo[] = [
  {
    view: "marketing",
    path: "/",
    title: "DSCR Loans for Rental Property Investors | Greenstreet Finance",
    description: "Greenstreet prices, structures, and funds DSCR loans for rental property investors. Check rent coverage, program fit, and state rules before you apply.",
    primaryKeyword: "DSCR loans",
    searchIntent: "Can I qualify for a rental property loan based on rent instead of income?",
  },
  {
    view: "dscr-calculator",
    path: "/dscr-calculator",
    title: "DSCR Calculator: See if Rent Covers the Loan | Greenstreet Finance",
    description: "Calculate DSCR from price, rent, rate, taxes, insurance, and HOA. See whether rent covers the loan payment and what needs to change.",
    primaryKeyword: "DSCR calculator",
    searchIntent: "Does this property's rent cover the loan payment?",
  },
  {
    view: "non-us-investors",
    path: "/non-us-investors",
    title: "Can Foreign Investors Get a U.S. DSCR Loan? | Greenstreet Finance",
    description: "Learn how non-US investors can qualify for U.S. rental property loans using property rent instead of U.S. W-2 income.",
    primaryKeyword: "DSCR loan for foreign investors",
    searchIntent: "Can a foreign investor get a mortgage for U.S. rental property?",
  },
  {
    view: "str-hosts",
    path: "/str-airbnb",
    title: "Airbnb DSCR Loans: Qualify with Short-Term Rental Income | Greenstreet Finance",
    description: "See how Greenstreet underwrites Airbnb and short-term rental income across slow months, occupancy, ADR, and payment coverage.",
    primaryKeyword: "Airbnb DSCR loan",
    searchIntent: "Can I qualify for a DSCR loan using Airbnb income?",
  },
  {
    view: "state-laws",
    path: "/state-laws",
    title: "Prepayment Penalty Rules by State | Greenstreet Finance",
    description: "Check DSCR loan prepayment penalty rules, thresholds, high-risk states, and pricing impact before choosing your loan structure.",
    primaryKeyword: "prepayment penalty rules by state",
    searchIntent: "Does my state allow a prepayment penalty on a DSCR loan?",
  },
  {
    view: "refi-tracker",
    path: "/tools/refi-tracker",
    title: "Should I Refinance My DSCR Loan? | Greenstreet Finance",
    description: "Score whether your DSCR loan is ready to refinance based on seasoning, equity, DSCR headroom, monthly savings, and break-even month.",
    primaryKeyword: "DSCR refinance",
    searchIntent: "Should I refinance my DSCR loan now?",
  },
  {
    view: "arm-reset",
    path: "/tools/arm-reset",
    title: "What Happens When My ARM Resets? | Greenstreet Finance",
    description: "Model DSCR ARM reset risk, payment jumps, SOFR scenarios, caps, and whether the property still qualifies after the fixed period ends.",
    primaryKeyword: "DSCR ARM reset",
    searchIntent: "What happens to my payment and DSCR when my ARM resets?",
  },
  {
    view: "decision-support",
    path: "/tools/decision-support",
    title: "Buy, Negotiate, or Pass on a DSCR Deal | Greenstreet Finance",
    description: "Compare lender qualification, investor survival, risk factors, and next best moves before you commit to a rental property deal.",
    primaryKeyword: "DSCR decision support",
    searchIntent: "Should I buy this rental property with a DSCR loan?",
  },
  {
    view: "commercial-dscr",
    path: "/tools/commercial-dscr",
    title: "Commercial DSCR | Greenstreet Finance",
    description: "Calculate DSCR for 5+ unit commercial properties. Understand multifamily underwriting, gross rent multipliers, and vacancy factors.",
    primaryKeyword: "commercial DSCR",
    searchIntent: "How do I calculate DSCR for a 5+ unit commercial property?",
  },
  {
    view: "construction-bridge",
    path: "/tools/construction-bridge",
    title: "Construction & Bridge Carry | Greenstreet Finance",
    description: "Model the true cost of construction and bridge loans, carry costs, exit refinancing, and permanent DSCR takeout.",
    primaryKeyword: "bridge loan carry",
    searchIntent: "How much will a bridge loan carry cost me before refinancing?",
  },
  {
    view: "tco-threshold",
    path: "/tools/tco-threshold",
    title: "TCO Threshold Converter | Greenstreet Finance",
    description: "Convert standard DSCR targets to True Cost of Ownership (TCO) thresholds and see how reserve-loaded debt yields affect qualification.",
    primaryKeyword: "TCO threshold",
    searchIntent: "How do True Cost of Ownership rules change DSCR qualification?",
  },
];

export const CANONICAL_PUBLIC_PATHS = [
  "/",
  "/products",
  "/products/platform",
  "/solutions",
  "/investors",
  "/borrower-profiles",
  "/non-us-investors",
  "/str-airbnb",
  "/vacation-homes",
  "/case-studies",
  "/about",
  "/careers",
  "/support",
  "/legal",
  "/faq",
  "/blog",
  "/rate-quiz",
  "/book-demo",
  "/dscr-calculator",
  "/lender-intel",
  "/state-laws",
  "/deal-analyzer",
  "/tools/refi-tracker",
  "/tools/arm-reset",
  "/tools/monte-carlo",
  "/tools/returns",
  "/tools/tax-engine",
  "/tools/stress-matrix",
  "/tools/decision-support",
  "/tools/str-underwriting",
  "/tools/portfolio",
  "/tools/commercial-dscr",
  "/tools/construction-bridge",
  "/tools/tco-threshold",
] as const;

export function absoluteUrl(path: string): string {
  return `${SITE_DOMAIN}${path}`;
}
