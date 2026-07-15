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

const CANONICAL_VIEW_PATHS: Record<string, string> = {
  marketing: "/",
  products: "/products",
  platform: "/products/platform",
  portal: "/investgo",
  "dscr-calculator": "/dscr-calculator",
  "lender-intel": "/lender-intel",
  "decision-support": "/tools/decision-support",
  "tax-engine": "/tools/tax-engine",
  returns: "/tools/returns",
  "monte-carlo": "/tools/monte-carlo",
  "stress-matrix": "/tools/stress-matrix",
  "arm-reset": "/tools/arm-reset",
  portfolio: "/tools/portfolio",
  solutions: "/solutions",
  investors: "/investors",
  brokers: "/brokers",
  "non-us-investors": "/non-us-investors",
  "str-hosts": "/str-airbnb",
  "vacation-homes": "/vacation-homes",
  "borrower-profiles": "/borrower-profiles",
  "case-studies": "/case-studies",
  blog: "/blog",
  "refi-tracker": "/tools/refi-tracker",
  "state-laws": "/state-laws",
  "rate-quiz": "/rate-quiz",
  faq: "/faq",
  support: "/support",
  about: "/about",
  careers: "/careers",
  legal: "/legal",
  "how-it-works": "/how-it-works",
  "brokers-partner": "/partnerships",
};

const VIEW_ALIASES: Record<string, string> = {
  "book-demo": "rate-quiz",
  investgo: "portal",
  "str-airbnb": "str-hosts",
  partnerships: "brokers-partner",
};

const normalizePath = (path: string) => {
  const clean = path.split(/[?#]/, 1)[0].trim();
  if (!clean || clean === "/") return "/";
  return `/${clean.replace(/^\/+|\/+$/g, "")}`;
};

const PATH_TO_VIEW = Object.entries(CANONICAL_VIEW_PATHS).reduce<Record<string, string>>((paths, [view, path]) => {
  paths[normalizePath(path)] = view;
  return paths;
}, {});

export const canonicalView = (view: string) => {
  const raw = String(view || "marketing").trim();
  if (raw.startsWith("/")) {
    const path = normalizePath(raw);
    return PATH_TO_VIEW[path] || VIEW_ALIASES[path.slice(1)] || (path === "/" ? "marketing" : path.slice(1));
  }
  const key = raw.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "") || "marketing";
  return VIEW_ALIASES[key] || key;
};

export const pathForView = (view: string) => {
  const canonical = canonicalView(view);
  const knownPath = CANONICAL_VIEW_PATHS[canonical];
  if (knownPath) return knownPath;
  const safeSegments = canonical.split("/").filter(Boolean).map(encodeURIComponent);
  return safeSegments.length ? `/${safeSegments.join("/")}` : "/";
};

export const labelForView = (label: string, view: string) =>
  view === "book-demo" ? "Start the rate quiz" : label;

export const viewMatchesRoute = (view: string, routeOrView: string) =>
  canonicalView(view) === canonicalView(routeOrView);

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
      { label: "Non-US Investors", view: "non-us-investors", path: "/non-us-investors" },
      { label: "STR & Airbnb Hosts", view: "str-hosts", path: "/str-airbnb" },
      { label: "Vacation & Second Homes", view: "vacation-homes", path: "/vacation-homes" },
      { label: "Borrower Profiles", view: "borrower-profiles", path: "/borrower-profiles" },
      { label: "Mortgage Brokers", view: "brokers", path: "/brokers" },
      { label: "Illustrative Scenarios", view: "case-studies", path: "/case-studies" },
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
      { label: "How It Works", view: "how-it-works", path: "/how-it-works" },
      { label: "Greenstreet Guidance", view: "blog", path: "/blog" },
      { label: "FAQ", view: "faq", path: "/faq" },
      { label: "Customer Support", view: "support", path: "/support" },
      { label: "About", view: "about", path: "/about" },
      { label: "Security & Privacy", view: "legal", path: "/legal" },
    ],
  },
];

export const NAV_STANDALONE_LINKS: NavItem[] = [
  { label: "Partnerships", view: "brokers-partner", path: "/partnerships" },
];

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
