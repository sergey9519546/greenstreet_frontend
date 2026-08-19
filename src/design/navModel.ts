export type NavItem = {
  label: string;
  view?: string;
  path: string;
  feature?: boolean;
};

export type NavMenu = {
  label: string;
  view: string;
  path: string;
  items: NavItem[];
};

export const INVESTGO_TEXT = "INVESTGO";

export const NAV_MENUS: NavMenu[] = [
  {
    label: "Product",
    view: "products",
    path: "/products",
    items: [
      { label: INVESTGO_TEXT, view: "portal", path: "/investgo", feature: true },
      { label: "DSCR Calculator", view: "dscr-calculator", path: "/dscr-calculator" },
      { label: "Find Your Program", view: "lender-intel", path: "/lender-intel" },
      { label: "Buy-or-Pass Decision", view: "decision-support", path: "/tools/decision-support" },
      { label: "Tax Engine", view: "tax-engine", path: "/tools/tax-engine" },
      { label: "Returns & IRR", view: "returns", path: "/tools/returns" },
      { label: "Monte Carlo Simulator", view: "monte-carlo", path: "/tools/monte-carlo" },
      { label: "Stress Matrix", view: "stress-matrix", path: "/tools/stress-matrix" },
      { label: "ARM Reset Risk", view: "arm-reset", path: "/tools/arm-reset" },
      { label: "Portfolio Builder", view: "portfolio", path: "/tools/portfolio" },
      { label: "All Tools", view: "tools", path: "/tools" },
    ],
  },
  {
    label: "Who We Serve",
    view: "solutions",
    path: "/solutions",
    items: [
      { label: "Real Estate Investors", view: "investors", path: "/investors" },
      { label: "Non-US Investors", view: "non-us-investors", path: "/non-us-investors" },
      { label: "STR & Airbnb Hosts", view: "str-hosts", path: "/str-airbnb" },
      { label: "Vacation & Second Homes", view: "vacation-homes", path: "/vacation-homes" },
      { label: "Borrower Profiles", view: "borrower-profiles", path: "/borrower-profiles" },
      { label: "Illustrative Scenarios", view: "case-studies", path: "/case-studies" },
    ],
  },
  {
    label: "Resources",
    view: "blog",
    path: "/blog",
    // Cut from 19 items (a blog index pasted into a nav menu — 15 of the 19
    // were individual articles) down to the handful a first-time DSCR
    // investor actually scans: the one foundational explainer, the two
    // comparisons that help someone decide DSCR is the right tool, what
    // closing actually costs, self-serve help, and a catch-all into the full
    // archive. Nothing was deleted — every article trimmed from THIS list
    // still renders at its own URL, is still in the sitemap, and is still
    // one click away via "View all guides" -> /blog. The tools that lived
    // here (Refi Tracker, 50-State Rule Map, Rate Quiz) stay reachable via
    // the footer and /products; About and Security & Privacy stay reachable
    // via the footer's Company group. See src/site/seo.test.ts for the
    // routability pins and src/router/routeIntegrity.test.ts for the no-
    // dead-link guarantee neither of those registries depend on nav
    // membership.
    items: [
      { label: "What Is DSCR?", path: "/blog/what-is-dscr-how-it-works" },
      { label: "DSCR vs Conventional", path: "/blog/dscr-loan-vs-conventional-investment-property-loan" },
      { label: "DSCR vs Cash Flow", path: "/blog/dscr-vs-rental-property-cash-flow" },
      { label: "Closing Costs Guide", path: "/blog/dscr-loan-closing-costs-cash-to-close" },
      { label: "FAQ", view: "faq", path: "/faq" },
      { label: "Customer Support", view: "support", path: "/support" },
      { label: "View all guides", view: "blog", path: "/blog" },
    ],
  },
];

// "Partnerships" retired from primary nav. INVESTGO is the prominent button
// rendered directly in SiteNav (see SiteShell), so there are no standalone links.
export const NAV_STANDALONE_LINKS: NavItem[] = [];

// Shared mega-dropdown grid CSS — applied to BOTH the Webflow home nav (rebuilt
// by marketing/homeNavSync) and the React SiteNav (design/SiteShell). Keeping it
// here (one source) guarantees the inner-page dropdown is pixel-identical to the
// home's: same 4-col card grid, same span-2 INVESTGO feature card, same logo type.
// Everything else (card fill, padding, radius, hover, the panel surface) comes
// from the globally loaded greenboard CSS via the .nav_dropdown_* classes.
export const NAV_SYNC_CSS = `
.nav_dropdown_mega_layout.is-desktop.gs-nav-synced{
  display:grid !important;
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
  gap:.875rem !important;
  align-items:stretch !important;
}
.nav_dropdown_mega_layout.is-desktop.gs-nav-synced .nav_dropdown_link{
  min-height:7.1rem;
  border-radius:.875rem;
}
.nav_dropdown_mega_layout.is-desktop.gs-nav-synced .nav_dropdown_link.gs-nav-feature{
  grid-row:span 2;
  min-height:auto;
}
.nav_dropdown_mega_layout.is-desktop.gs-nav-synced .nav_dropdown_text_logo{
  font-family:"Outfit Variable",Outfit,Arial,sans-serif;
  font-size:1.625rem;
  font-weight:700;
  letter-spacing:-.02em;
  line-height:1;
}
`;
