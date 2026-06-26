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
    ],
  },
  {
    label: "Who We Serve",
    view: "solutions",
    path: "/solutions",
    items: [
      { label: "Real Estate Investors", view: "investors", path: "/investors" },
      { label: "Foreign Nationals", view: "foreign-nationals", path: "/foreign-nationals" },
      { label: "STR & Airbnb Hosts", view: "str-hosts", path: "/str-airbnb" },
      { label: "Vacation & Second Homes", view: "vacation-homes", path: "/vacation-homes" },
      { label: "Borrower Profiles", view: "borrower-profiles", path: "/borrower-profiles" },
      { label: "Customer Stories", view: "case-studies", path: "/case-studies" },
    ],
  },
  {
    label: "Resources",
    view: "blog",
    path: "/blog",
    items: [
      { label: "Refi Tracker", view: "refi-tracker", path: "/tools/refi-tracker" },
      { label: "50-State Rule Map", view: "state-laws", path: "/state-laws" },
      { label: "Rate Quiz", view: "rate-quiz", path: "/rate-quiz" },
      { label: "Greenstreet Guidance", view: "blog", path: "/blog" },
      { label: "FAQ", view: "faq", path: "/faq" },
      { label: "Customer Support", view: "support", path: "/support" },
      { label: "About", view: "about", path: "/about" },
      { label: "Security & Privacy", view: "legal", path: "/legal" },
    ],
  },
];

// "Partnerships" retired from primary nav. INVESTGO is the prominent button
// rendered directly in SiteNav (see SiteShell), so there are no standalone links.
export const NAV_STANDALONE_LINKS: NavItem[] = [];
