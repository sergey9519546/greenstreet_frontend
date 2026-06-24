# DSCR Site Pages & Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every nav/button in the Greenstreet marketing site lead to a real page, replace all remaining generic-compliance copy with DSCR content sourced from `ANALYSIS/`, and fix the full-width layout.

**Architecture:** No new router dependency. A pure `resolveRoute(href)` function maps internal hrefs to one of three outcomes: `home`, `portal` (with a `DashboardTab`), or `content` (with a page key). `App.tsx` owns a global capture-phase click listener that intercepts internal `<a>` clicks, calls the resolver, and switches a `view` state. Informational pages render through one data-driven `<ContentPage>` reading from a `PAGES` content map. Tool/product links route into the existing `ComplianceDashboard` via its `initialTab` prop (already added). Design tokens (cream `#EEEFD3`, forest `#003738`/`#004041`, pistachio `#4dbd97`, Outfit font) are reused verbatim — no design-system changes.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind utility classes, Express (`tsx server.ts`), vitest (added in Task 1 for the resolver).

---

## File Structure

- **Create** `src/router/resolve.ts` — pure `resolveRoute(href)` + `TOOL_ROUTES` + types. One responsibility: URL → route intent. Unit-tested.
- **Create** `src/router/resolve.test.ts` — vitest unit tests for the resolver.
- **Create** `src/content/pages.ts` — `PAGES` map: every informational page's copy (hero, sections, stats, CTA). All text sourced from `ANALYSIS/`. No JSX here — pure data.
- **Create** `src/components/ContentPage.tsx` — renders one `SitePage` from `PAGES` using brand tokens; on-brand header (logo + back) and footer. Handles the `default` fallback.
- **Modify** `src/App.tsx` — add `view: "marketing" | "portal" | "content"`, `portalTab`, `contentKey`; global click interception; render switch.
- **Modify** `src/components/ComplianceDashboard.tsx` — `initialTab` prop already added (verify only). Widen main content for the full-width fix.
- **Modify** `src/components/MarketingSite.tsx` — final copy sweep on footer/misc strings; no structural/layout edits.
- **Modify** `package.json` — add `vitest` dev dep + `test` script.

### Route map (locked decisions)

Tool/product hrefs → portal tab (the Webflow nav already relabels these):

| href | Nav label | Portal tab |
|------|-----------|------------|
| `/products/communications-archiving-supervision` | DSCR Calculator | `analyze` |
| `/products/firm-compliance` | Deal Analyzer | `analyze` |
| `/products/employee-compliance` | Lender Intelligence | `analyze` |
| `/products/marketing-compliance` | State Regulations | `state` |
| `/products/third-party-compliance` | Borrower Profiles | `settings` |
| `/products/platform` | Platform | `dashboard` |
| `/dscrgo` | DSCRGo | `dashboard` |

Informational hrefs → `ContentPage` key:

| href | Page key |
|------|----------|
| `/products` | `products` |
| `/solutions` | `solutions` |
| `/solutions/financial-advisors` | `brokers` |
| `/solutions/private-funds` | `investors` |
| `/solutions/hedge-funds` | `dscr-investors` |
| `/solutions/broker-dealers` | `wholesale` |
| `/solutions/ria-registration` | `state-rules` |
| `/solutions/service-provider-platform` | `capital-markets` |
| `/book-demo` | `book-demo` |
| `/about` | `about` |
| `/support` | `support` |
| `/careers` | `careers` |
| `/blog` (and `/blog/*`) | `blog` |
| `/case-studies` (and `/case-studies/*`) | `case-studies` |
| `/terms-of-service` | `terms` |
| `/privacy-policy` | `privacy` |
| `/` | (home — view = marketing) |
| anything else internal | `default` |

---

## Task 1: Route resolver (pure function, TDD)

**Files:**

- Create: `src/router/resolve.ts`
- Test: `src/router/resolve.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add vitest dev dependency and test script**

Run:

```bash
cd greenstreet_frontend && npm install -D vitest@^2.1.0
```

Then in `package.json`, inside `"scripts"`, add:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing test**

Create `src/router/resolve.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveRoute } from "./resolve";

describe("resolveRoute", () => {
  it("routes home", () => {
    expect(resolveRoute("/")).toEqual({ kind: "home" });
  });
  it("routes DSCR Calculator to the analyze tab", () => {
    expect(resolveRoute("/products/communications-archiving-supervision"))
      .toEqual({ kind: "portal", tab: "analyze" });
  });
  it("routes State Regulations to the state tab", () => {
    expect(resolveRoute("/products/marketing-compliance"))
      .toEqual({ kind: "portal", tab: "state" });
  });
  it("routes DSCRGo to the dashboard tab", () => {
    expect(resolveRoute("/dscrgo")).toEqual({ kind: "portal", tab: "dashboard" });
  });
  it("routes a known solutions path to its content key", () => {
    expect(resolveRoute("/solutions/financial-advisors"))
      .toEqual({ kind: "content", key: "brokers" });
  });
  it("collapses blog subpaths to the blog key", () => {
    expect(resolveRoute("/blog/system-of-action")).toEqual({ kind: "content", key: "blog" });
  });
  it("falls back to default for unknown internal paths", () => {
    expect(resolveRoute("/something/random")).toEqual({ kind: "content", key: "default" });
  });
  it("returns external for non-internal hrefs", () => {
    expect(resolveRoute("https://example.com")).toEqual({ kind: "external" });
    expect(resolveRoute("#")).toEqual({ kind: "external" });
    expect(resolveRoute("mailto:a@b.com")).toEqual({ kind: "external" });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd greenstreet_frontend && npx vitest run src/router/resolve.test.ts`
Expected: FAIL — `Cannot find module './resolve'`.

- [ ] **Step 4: Write the resolver implementation**

Create `src/router/resolve.ts`:

```ts
export type DashboardTab =
  | "dashboard" | "analyze" | "sensitivity" | "optimize" | "state" | "history" | "settings";

export type Route =
  | { kind: "home" }
  | { kind: "portal"; tab: DashboardTab }
  | { kind: "content"; key: string }
  | { kind: "external" };

// product/tool hrefs that open the portal at a specific tab
export const TOOL_ROUTES: Record<string, DashboardTab> = {
  "/products/communications-archiving-supervision": "analyze", // DSCR Calculator
  "/products/firm-compliance": "analyze",                       // Deal Analyzer
  "/products/employee-compliance": "analyze",                   // Lender Intelligence
  "/products/marketing-compliance": "state",                    // State Regulations
  "/products/third-party-compliance": "settings",              // Borrower Profiles
  "/products/platform": "dashboard",                            // Platform
  "/dscrgo": "dashboard",                                        // DSCRGo
};

// informational hrefs that open a ContentPage
const CONTENT_ROUTES: Record<string, string> = {
  "/products": "products",
  "/solutions": "solutions",
  "/solutions/financial-advisors": "brokers",
  "/solutions/private-funds": "investors",
  "/solutions/hedge-funds": "dscr-investors",
  "/solutions/broker-dealers": "wholesale",
  "/solutions/ria-registration": "state-rules",
  "/solutions/service-provider-platform": "capital-markets",
  "/book-demo": "book-demo",
  "/about": "about",
  "/support": "support",
  "/careers": "careers",
  "/terms-of-service": "terms",
  "/privacy-policy": "privacy",
};

// path prefixes whose subpaths collapse to one content key
const PREFIX_ROUTES: { prefix: string; key: string }[] = [
  { prefix: "/blog", key: "blog" },
  { prefix: "/case-studies", key: "case-studies" },
];

export function resolveRoute(href: string | null | undefined): Route {
  if (!href) return { kind: "external" };
  // only same-origin root-relative paths are internal
  if (!href.startsWith("/") || href.startsWith("//")) return { kind: "external" };
  const path = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";

  if (path === "/") return { kind: "home" };
  if (path in TOOL_ROUTES) return { kind: "portal", tab: TOOL_ROUTES[path] };
  if (path in CONTENT_ROUTES) return { kind: "content", key: CONTENT_ROUTES[path] };
  for (const { prefix, key } of PREFIX_ROUTES) {
    if (path === prefix || path.startsWith(prefix + "/")) return { kind: "content", key };
  }
  return { kind: "content", key: "default" };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd greenstreet_frontend && npx vitest run src/router/resolve.test.ts`
Expected: PASS — 8 passing.

- [ ] **Step 6: Commit**

```bash
cd greenstreet_frontend && git add src/router/resolve.ts src/router/resolve.test.ts package.json package-lock.json && git commit -m "feat: add pure route resolver with tests"
```

---

## Task 2: Page content data

**Files:**

- Create: `src/content/pages.ts`

> **⭐ CANONICAL SOURCE: `UNIFIED_HUB.md`** (project root) is the single source of truth for ALL website copy, naming, numbers, and personas. It is purpose-built, cited to file:line, and split into PART II (Frontend), PART III (Backend/engine), PART IV (Marketing), PART V (Compliance). Prefer its verbatim copy over paraphrase. The richer page content in the **Content Addendum** at the end of this plan is lifted from it — merge those into the `PAGES` map below.

**Naming rule (UNIFIED_HUB §1.1):** customer-facing copy uses only **"Greenstreet Finance"** (brand) + **"Sovereign OS"** (engine). No internal codenames. Already corrected in the live hero + dashboard.

Pinned facts used across pages (UNIFIED_HUB Part I/III + `ANALYSIS/`):

- Non-QM 2025 origination: **$239B / 697,605 loans** (Polygon Research, §1.5); DSCR = **28–30% of non-QM** (HousingWire/Optimal Blue)
- DSCR origination 2024: **$38B (100K+ properties)**; 2025 thru Oct: **$32.8B (89K)** (SFR Analytics, §1.5)
- Securitized-pool WA DSCR range **1.10–1.41**, WA FICO **722–758**, WA LTV **68–72%** (§3.8)
- Real-funded modal file (Griffin May 2026): **1.14 DSCR, 729 FICO, $292K, 67% cash-out** (§1.5f)
- KBRA 475K-loan default study: WA cumulative default **3.8%**, losses **0.03%**; FICO <660 → **10%**, >760 → **<2%** (§1.5a)
- **50** states of prepay / usury / ARM rules encoded; **17-lender** verified production matrix (§3.1)
- Six-Function value chain: **Originate → Underwrite → Service → Securitize → Hedge → Replenish**
- Dual-Track doctrine (§1.4): Track 1 = Lender Qualification (PITIA, 1007 rent, no vacancy); Track 2 = Investor Survival (vacancy + mgmt + CapEx). **A deal can PASS Track 1 and FAIL Track 2.**
- Golden vector (§3.7): $425K / 75% LTV / 7.00% → P&I $2,121, PITIA $2,855, T1 DSCR 1.05, deal-break rate ≈7.67%

**Stat-card decision:** the deployed hero stats (7s / 99.14% / 88% / 99%+) are flagged **UNVERIFIED** in UNIFIED_HUB §2.2. The live site already replaced them with verified figures — keep verified numbers only; never ship the unverified four.

- [ ] **Step 1: Create the content map with types and all page copy**

Create `src/content/pages.ts`:

```ts
export interface PageSection {
  heading: string;
  body: string;
  bullets?: string[];
}
export interface PageStat {
  value: string;
  label: string;
}
export interface SitePage {
  eyebrow: string;
  title: string;
  subtitle: string;
  stats?: PageStat[];
  sections: PageSection[];
  cta: { label: string; href: string };
}

export const PAGES: Record<string, SitePage> = {
  default: {
    eyebrow: "Greenstreet Finance",
    title: "This page is on the way",
    subtitle: "The deterministic DSCR deal engine is live. This section is being built out — meanwhile, run a real deal in the engine.",
    sections: [
      {
        heading: "What you can do right now",
        body: "Every number in the portal is computed deterministically by the Sovereign OS — dual-track DSCR, PITIA, breakeven, structure optimization, and state prepay rules. No LLM math.",
      },
    ],
    cta: { label: "Open the deal engine", href: "/dscrgo" },
  },

  products: {
    eyebrow: "Product",
    title: "One deterministic engine, end to end",
    subtitle: "Greenstreet runs the full non-QM rental lifecycle on a single engine: Originate → Underwrite → Service → Securitize → Hedge → Replenish.",
    stats: [
      { value: "1.10x", label: "Weighted-avg DSCR on 2025 securitized rental loans" },
      { value: "12", label: "Lenders matched and ranked per deal" },
      { value: "50", label: "States of prepay, usury & ARM rules encoded" },
    ],
    sections: [
      {
        heading: "Deal Engine — pricing & dual-track DSCR",
        body: "Solve the qualifying rate, PITIA, and DSCR on two tracks at once: Track 1 (lender qualification, rent ÷ PITIA) and Track 2 (investor survival, after vacancy and OpEx). Get deal-break rate and rate headroom in basis points.",
      },
      {
        heading: "Risk Engine — Monte Carlo",
        body: "Stress every deal with a t-copula (ν=5–7) and Sobol sequences across rent, vacancy, rate, and value shocks. Tornado charts rank which inputs move DSCR the most.",
      },
      {
        heading: "Compliance Engine — state rules",
        body: "Prepayment-penalty legality, usury caps, and ARM restrictions encoded for all 50 states + DC, aligned to SR 26-02 (effective 4/17/2026).",
      },
      {
        heading: "Lender Matching & Loan Optimizer",
        body: "Score a 12-lender matrix to the top-3 eligible programs, then compare 12 loan structures (LTV, IO, 30/40-yr, ARM) ranked by Track-1 DSCR.",
      },
      {
        heading: "Tax Strategy Engine",
        body: "OBBBA 100% bonus depreciation, §1250 25% recapture, NIIT, passive-activity loss limits, and 1031 day-tracking for after-tax deal views.",
      },
    ],
    cta: { label: "Try the DSCR Calculator", href: "/products/communications-archiving-supervision" },
  },

  platform: {
    eyebrow: "Platform",
    title: "Deterministic by design",
    subtitle: "Same inputs, same answer, every time. The Sovereign OS is pure TypeScript with zero runtime dependencies and golden-vector parity tests.",
    sections: [
      {
        heading: "No LLM math, ever",
        body: "Pricing, DSCR, PITIA, breakeven, and structure math are computed by the engine. AI is used only to explain results in plain English — never to generate a number.",
      },
      {
        heading: "Auditable",
        body: "Every decision carries a full provenance trail: which lender rule fired, which state statute applied, and which inputs drove the DSCR.",
      },
    ],
    cta: { label: "Open the platform", href: "/products/platform" },
  },

  solutions: {
    eyebrow: "Who we serve",
    title: "Built for the people who close rental deals",
    subtitle: "Greenstreet is a direct-to-broker, two-sided trust platform — brokers price and place deals, investors see the truth about their cash flow.",
    sections: [
      {
        heading: "Mortgage brokers",
        body: "Underwrite, price, and match a DSCR deal to the right lender in seconds. See /solutions/financial-advisors.",
      },
      {
        heading: "Real estate investors",
        body: "Know whether a property survives after vacancy and OpEx — not just whether it qualifies. See /solutions/private-funds.",
      },
      {
        heading: "Wholesale lenders",
        body: "Reach brokers directly with programs that match real deals. See /solutions/broker-dealers.",
      },
    ],
    cta: { label: "Book a demo", href: "/book-demo" },
  },

  brokers: {
    eyebrow: "For mortgage brokers",
    title: "Price and place every DSCR deal in seconds",
    subtitle: "Stop juggling lender rate sheets and spreadsheets. One engine solves the deal, ranks the lenders, and tells you exactly how much rate headroom you have.",
    stats: [
      { value: "12", label: "Lenders ranked per deal" },
      { value: "Seconds", label: "From inputs to a priced, structured deal" },
      { value: "50", label: "States of prepay & usury rules built in" },
    ],
    sections: [
      {
        heading: "Dual-track DSCR",
        body: "Track 1 tells you if the lender approves. Track 2 tells you if the investor survives. Show your borrower both, side by side.",
      },
      {
        heading: "Deal-break rate & headroom",
        body: "Know the exact rate at which the deal breaks DSCR 1.0 — and how many basis points of buffer you have before it does.",
      },
      {
        heading: "Lender match with provenance",
        body: "Top-3 eligible lenders, scored and ranked, with the two strongest reasons each one fits — pulled from a maintained 12-lender matrix.",
      },
    ],
    cta: { label: "Open the Deal Analyzer", href: "/products/firm-compliance" },
  },

  investors: {
    eyebrow: "For real estate investors",
    title: "Know if the property actually survives",
    subtitle: "Qualifying is not the same as cash-flowing. Greenstreet shows you Track 2 — what the deal does after vacancy and operating expenses.",
    stats: [
      { value: "63%", label: "Of 2025 DSCR loans had no lease — priced on projected rent" },
      { value: "3.82%", label: "30-day delinquent at issuance — thin cushions bite" },
      { value: "1.10x", label: "Industry weighted-avg DSCR — the margin is real" },
    ],
    sections: [
      {
        heading: "Survival, not just qualification",
        body: "Track 2 applies vacancy and OpEx defaults (higher for STR) so you see real monthly cash flow, not the lender's rosy number.",
      },
      {
        heading: "Sensitivity & breakeven",
        body: "See exactly how far rent can fall, or rate can rise, before the deal stops working — with a tornado chart ranking the biggest risks.",
      },
      {
        heading: "After-tax view",
        body: "Layer in OBBBA bonus depreciation, NIIT, passive-activity loss limits, and 1031 timing to see the deal after taxes.",
      },
    ],
    cta: { label: "Run a sensitivity analysis", href: "/products/communications-archiving-supervision" },
  },

  "dscr-investors": {
    eyebrow: "For DSCR & portfolio investors",
    title: "Scale a rental portfolio without surprises",
    subtitle: "Cross-collateralized, multi-property, BRRRR, STR — model each strategy on the same deterministic engine.",
    sections: [
      {
        heading: "Every strategy, one engine",
        body: "SFR, 2–4 unit, condo, condotel, STR, BRRRR, and portfolio deals all run through the same dual-track math and structure optimizer.",
      },
      {
        heading: "Structure optimization",
        body: "Compare up to 12 structures — lower LTV, interest-only, 30/40-yr amortization, and ARMs — ranked by Track-1 DSCR with monthly cash flow for each.",
      },
    ],
    cta: { label: "Open the Loan Optimizer", href: "/dscrgo" },
  },

  wholesale: {
    eyebrow: "For wholesale lenders",
    title: "Reach brokers with programs that match real deals",
    subtitle: "Greenstreet is direct-to-broker. Your programs are scored against live deals and surfaced to the brokers whose borrowers actually fit.",
    sections: [
      {
        heading: "Matched, not blasted",
        body: "Your guidelines (LTV, FICO floor, DSCR min, cap-rate, prepay options) are encoded once and matched against every deal — so you see qualified flow.",
      },
      {
        heading: "Two-sided trust",
        body: "Brokers trust the engine because the math is deterministic and auditable. That trust is what puts your program in front of the right deal.",
      },
    ],
    cta: { label: "Book a demo", href: "/book-demo" },
  },

  "state-rules": {
    eyebrow: "State rules & compliance",
    title: "Prepay, usury & ARM rules for all 50 states",
    subtitle: "The Compliance Engine encodes prepayment-penalty legality, usury caps, and ARM restrictions per state — aligned to SR 26-02 (effective 4/17/2026).",
    sections: [
      {
        heading: "Prepayment-penalty legality",
        body: "Per-state PPP status (allowed, conditional, prohibited), the allowed prepay structures, entity-vesting requirements, and the no-PPP premium cost.",
      },
      {
        heading: "Usury & ARM caps",
        body: "Statutory rate ceilings and adjustable-rate restrictions checked automatically as part of every structure the optimizer proposes.",
      },
    ],
    cta: { label: "Check a state", href: "/products/marketing-compliance" },
  },

  "capital-markets": {
    eyebrow: "Capital markets",
    title: "From origination to securitization",
    subtitle: "The Six-Function Doctrine runs the whole chain: Originate → Underwrite → Service → Securitize → Hedge → Replenish.",
    sections: [
      {
        heading: "Portfolio aggregation",
        body: "Roll individual deals into portfolio-level risk with copula-based correlation, so pools can be stress-tested before they're sold.",
      },
      {
        heading: "Hedge & replenish",
        body: "Yield-curve and ARM-reset models support hedging, and the replenish loop feeds capacity back to originators.",
      },
    ],
    cta: { label: "Talk to capital markets", href: "/book-demo" },
  },

  "book-demo": {
    eyebrow: "Book a demo",
    title: "See a real deal underwritten live",
    subtitle: "Bring a property. We'll price it, run dual-track DSCR, match lenders, and show the state rules — in one sitting.",
    sections: [
      {
        heading: "What to expect",
        body: "A 15-minute walkthrough of the deal engine on your numbers: DSCR, PITIA, deal-break rate, top-3 lenders, sensitivity, and structure options.",
      },
      {
        heading: "Or just try it now",
        body: "No account needed — open the engine in demo mode and run the golden deal yourself.",
      },
    ],
    cta: { label: "Open the engine in demo mode", href: "/dscrgo" },
  },

  about: {
    eyebrow: "About",
    title: "A deterministic engine for non-QM rental lending",
    subtitle: "Greenstreet Finance is building the trust layer for DSCR lending — direct to brokers, honest with investors.",
    sections: [
      {
        heading: "Why deterministic",
        body: "Lending decisions should be reproducible and auditable. The Sovereign OS computes the same answer every time and shows its work.",
      },
      {
        heading: "Where we're headed",
        body: "AI-native underwriting is table stakes by 2028. The window to build the DSCR operating system is now — late entrants will buy instead of build.",
      },
    ],
    cta: { label: "Book a demo", href: "/book-demo" },
  },

  support: {
    eyebrow: "Support",
    title: "Help when a deal is on the line",
    subtitle: "Documentation, engine reference, and a real human when you need one.",
    sections: [
      {
        heading: "Engine reference",
        body: "Every metric — DSCR tracks, PITIA components, deal-break rate, debt yield, cash to close — is documented with the exact formula it uses.",
      },
      {
        heading: "Contact",
        body: "Reach the team through Book a demo and we'll route you to the right person.",
      },
    ],
    cta: { label: "Book a demo", href: "/book-demo" },
  },

  careers: {
    eyebrow: "Careers",
    title: "Build the DSCR operating system",
    subtitle: "We're a small team building a deterministic engine and a two-sided lending platform.",
    sections: [
      {
        heading: "How we work",
        body: "Deterministic-first. Tested against golden vectors. Honest with users. If that's how you build, we want to talk.",
      },
    ],
    cta: { label: "Get in touch", href: "/book-demo" },
  },

  blog: {
    eyebrow: "Insights",
    title: "Notes on non-QM rental lending",
    subtitle: "Market structure, DSCR math, and the case for a deterministic engine.",
    sections: [
      {
        heading: "Why manual DSCR underwriting kills broker deals",
        body: "Rate sheets change, spreadsheets drift, and the second track — investor survival — gets skipped. A deterministic engine fixes all three.",
      },
      {
        heading: "What the 2025 securitization data says",
        body: "Weighted-avg DSCR of 1.10x and 63% no-lease originations mean cushions are thin and projected-rent accuracy matters more than ever.",
      },
    ],
    cta: { label: "Open the engine", href: "/dscrgo" },
  },

  "case-studies": {
    eyebrow: "Case studies",
    title: "Deals, done deterministically",
    subtitle: "How brokers and investors use the engine to price, place, and pressure-test rental deals.",
    sections: [
      {
        heading: "Golden deal — $450K SFR, FL",
        body: "75% LTV, $3,200 rent: DSCR 1.16x, PITIA $2,771, 6.50% solved rate, top-3 lenders ranked, 12 structures compared — all in one pass.",
      },
    ],
    cta: { label: "Run your own deal", href: "/products/firm-compliance" },
  },

  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    subtitle: "The rules for using Greenstreet Finance.",
    sections: [
      {
        heading: "Not a commitment to lend",
        body: "Engine outputs are decision-support estimates, not loan approvals or commitments. Rates and terms are subject to change and lender confirmation.",
      },
    ],
    cta: { label: "Back to home", href: "/" },
  },

  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    subtitle: "How we handle your data.",
    sections: [
      {
        heading: "Your deals are yours",
        body: "Deal history is stored per-user and used to power your workspace. We do not sell your data.",
      },
    ],
    cta: { label: "Back to home", href: "/" },
  },
};
```

- [ ] **Step 2: Type-check the content module**

Run: `cd greenstreet_frontend && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd greenstreet_frontend && git add src/content/pages.ts && git commit -m "feat: add DSCR site page content map"
```

---

## Task 3: ContentPage component

**Files:**

- Create: `src/components/ContentPage.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/ContentPage.tsx`:

```tsx
import React from "react";
import { PAGES, SitePage } from "../content/pages";

interface ContentPageProps {
  pageKey: string;
  onHome: () => void;
  onNavigate: (href: string) => void;
}

export default function ContentPage({ pageKey, onHome, onNavigate }: ContentPageProps) {
  const page: SitePage = PAGES[pageKey] ?? PAGES.default;

  return (
    <div style={{ backgroundColor: "#EEEFD3", color: "#003738", minHeight: "100vh" }}>
      {/* header — same tokens as marketing nav */}
      <header className="u-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 0" }}>
        <button onClick={onHome} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#003738" }}>
          Greenstreet <span style={{ fontWeight: 400 }}>Finance</span>
        </button>
        <button onClick={() => onNavigate("/dscrgo")} style={{ background: "#4dbd97", color: "#004041", border: "none", borderRadius: "999px", padding: "0.6rem 1.4rem", fontWeight: 700, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
          Open the engine
        </button>
      </header>

      {/* hero */}
      <section className="u-container" style={{ maxWidth: 980, margin: "0 auto", padding: "3rem 0 2rem" }}>
        <button onClick={onHome} style={{ background: "none", border: "none", color: "#4dbd97", fontWeight: 700, cursor: "pointer", marginBottom: "1.5rem", padding: 0 }}>
          ← Back to home
        </button>
        <div style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.8rem", fontWeight: 700, color: "#4dbd97", marginBottom: "0.75rem" }}>
          {page.eyebrow}
        </div>
        <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.05, margin: "0 0 1rem" }}>
          {page.title}
        </h1>
        <p style={{ fontSize: "1.2rem", lineHeight: 1.5, maxWidth: 720, opacity: 0.85 }}>
          {page.subtitle}
        </p>
      </section>

      {/* stats */}
      {page.stats && (
        <section className="u-container" style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", padding: "1rem 0 2rem" }}>
          {page.stats.map((s, i) => (
            <div key={i} style={{ background: "#003738", color: "#EEEFD3", borderRadius: "1rem", padding: "1.5rem" }}>
              <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "2rem", color: "#4dbd97" }}>{s.value}</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.85, marginTop: "0.5rem" }}>{s.label}</div>
            </div>
          ))}
        </section>
      )}

      {/* sections */}
      <section className="u-container" style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", padding: "1rem 0 3rem" }}>
        {page.sections.map((sec, i) => (
          <div key={i} style={{ background: "rgba(0,55,56,0.04)", border: "1px solid rgba(0,55,56,0.1)", borderRadius: "1rem", padding: "1.75rem" }}>
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "1.4rem", margin: "0 0 0.75rem" }}>{sec.heading}</h2>
            <p style={{ lineHeight: 1.6, opacity: 0.85, margin: 0 }}>{sec.body}</p>
            {sec.bullets && (
              <ul style={{ marginTop: "1rem", paddingLeft: "1.2rem", lineHeight: 1.6 }}>
                {sec.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ background: "#003738", color: "#EEEFD3" }}>
        <div className="u-container" style={{ maxWidth: 980, margin: "0 auto", padding: "3rem 0", textAlign: "center" }}>
          <button onClick={() => onNavigate(page.cta.href)} style={{ background: "#4dbd97", color: "#004041", border: "none", borderRadius: "999px", padding: "0.9rem 2rem", fontWeight: 700, fontSize: "1.05rem", cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
            {page.cta.label} →
          </button>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd greenstreet_frontend && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd greenstreet_frontend && git add src/components/ContentPage.tsx && git commit -m "feat: add ContentPage renderer"
```

---

## Task 4: Wire the router into App.tsx

**Files:**

- Modify: `src/App.tsx`

- [ ] **Step 1: Replace App.tsx with the routed version**

Replace the entire contents of `src/App.tsx` with:

```tsx
import React, { useState, useEffect, useCallback } from "react";
import MarketingSite from "./components/MarketingSite";
import ComplianceDashboard from "./components/ComplianceDashboard";
import ContentPage from "./components/ContentPage";
import { resolveRoute, DashboardTab } from "./router/resolve";

type View = "marketing" | "portal" | "content";

export default function App() {
  const [view, setView] = useState<View>("marketing");
  const [portalTab, setPortalTab] = useState<DashboardTab>("dashboard");
  const [contentKey, setContentKey] = useState("default");
  const [passedEmail, setPassedEmail] = useState("");

  useEffect(() => {
    document.body.style.backgroundColor = "#EEEFD3";
    document.body.style.color = view === "marketing" ? "#003738" : "#002D2E";
    window.scrollTo(0, 0);
  }, [view, contentKey, portalTab]);

  // central navigation by href
  const navigate = useCallback((href: string) => {
    const route = resolveRoute(href);
    switch (route.kind) {
      case "home": setView("marketing"); break;
      case "portal": setPortalTab(route.tab); setView("portal"); break;
      case "content": setContentKey(route.key); setView("content"); break;
      case "external": window.open(href, "_blank"); break;
    }
  }, []);

  // intercept internal anchor clicks across the marketing markup
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const route = resolveRoute(href);
      if (route.kind === "external") return; // let the browser handle real links
      e.preventDefault();
      navigate(href);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  const handleLoginClick = () => { setPortalTab("dashboard"); setView("portal"); };
  const handleGetStarted = (email: string) => { setPassedEmail(email); setPortalTab("dashboard"); setView("portal"); };

  return (
    <div className="font-sans antialiased text-slate-800">
      {view === "marketing" && (
        <MarketingSite onLoginClick={handleLoginClick} onGetStartedClick={handleGetStarted} />
      )}
      {view === "portal" && (
        <ComplianceDashboard
          onBackToMarketing={() => setView("marketing")}
          initialEmail={passedEmail}
          initialTab={portalTab}
        />
      )}
      {view === "content" && (
        <ContentPage pageKey={contentKey} onHome={() => setView("marketing")} onNavigate={navigate} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd greenstreet_frontend && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Verify in the preview**

Start/refresh the preview (server name `greenstreet-portal`, port 3000). Then:

- Reload the page.
- Click nav **Product → DSCR Calculator**. Expected: portal opens on the Analyzer (login/demo screen, then Analyzer tab).
- From home, click **Who We Serve → Mortgage Brokers**. Expected: ContentPage with title "Price and place every DSCR deal in seconds".
- Click **Book a demo**. Expected: ContentPage "See a real deal underwritten live".
- Click **← Back to home**. Expected: marketing site.

- [ ] **Step 4: Commit**

```bash
cd greenstreet_frontend && git add src/App.tsx && git commit -m "feat: route nav clicks to portal tabs and content pages"
```

---

## Task 5: Verify portal tab deep-links

**Files:**

- Verify only: `src/components/ComplianceDashboard.tsx` (the `initialTab` prop was added in a prior session)

- [ ] **Step 1: Confirm the prop exists**

Run: `cd greenstreet_frontend && grep -n "initialTab" src/components/ComplianceDashboard.tsx`
Expected: shows the `initialTab` in the props interface, the destructure, and `useState<DashboardTab>(initialTab || "dashboard")`.

- [ ] **Step 2: If any line is missing, add it**

The props interface must read:

```tsx
type DashboardTab = "dashboard" | "analyze" | "sensitivity" | "optimize" | "state" | "history" | "settings";
interface ComplianceDashboardProps { onBackToMarketing: () => void; initialEmail?: string; initialTab?: DashboardTab }
```

The signature must read:

```tsx
export default function ComplianceDashboard({ onBackToMarketing, initialEmail, initialTab }: ComplianceDashboardProps) {
```

The tab state must read:

```tsx
const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab || "dashboard");
```

- [ ] **Step 3: Verify in preview**

From home, click **Product → State Regulations**. Enter demo mode. Expected: portal opens directly on the **State PPP** tab.

- [ ] **Step 4: Commit (only if changed)**

```bash
cd greenstreet_frontend && git add src/components/ComplianceDashboard.tsx && git commit -m "feat: honor initialTab deep-link in dashboard"
```

---

## Task 6: Full-width layout fix

**Files:**

- Modify: `src/components/ComplianceDashboard.tsx`

The complaint: portal content renders as a narrow column with large empty space. The content wrapper is over-constrained. Fix: widen the main content container and ensure it stretches.

- [ ] **Step 1: Find the constraint**

Run: `cd greenstreet_frontend && grep -n "max-w-\|mx-auto" src/components/ComplianceDashboard.tsx | head -30`
Expected: a `max-w-*` (e.g. `max-w-3xl`/`max-w-4xl`) with `mx-auto` on the main content/inner wrapper that holds the tab panels.

- [ ] **Step 2: Widen the main content wrapper**

For the wrapper that holds the tab panels (the `<main>` inner container), change the constraint to fill the available space. Replace the narrow class (e.g. `max-w-3xl mx-auto` or `max-w-4xl mx-auto`) with:

```
max-w-[1400px] mx-auto w-full
```

Apply the same change to the analyzer two-column wrapper if it carries its own narrow `max-w-*`. Do **not** change the sidebar width, colors, spacing scale, or card styles.

- [ ] **Step 3: Verify width in preview**

- Open the portal (demo), go to **Hub**, then **DSCR Analyzer**.
- Run `preview_inspect` on the main content container and confirm its rendered width fills the viewport minus the sidebar (no large empty right gutter).
- `preview_screenshot` at desktop width: content should span the working area, not hug the left third.

- [ ] **Step 4: Commit**

```bash
cd greenstreet_frontend && git add src/components/ComplianceDashboard.tsx && git commit -m "fix: widen portal content to full working width"
```

---

## Task 7: Final marketing copy sweep (footer + leftovers)

**Files:**

- Modify: `src/components/MarketingSite.tsx`

Hero, stat cards, the "how it works" headings, testimonial, and section labels were already DSCR-ified in a prior session. This task catches any remaining generic strings (footer links, whitepaper banner, alt text) — **text only, no structural edits**.

- [ ] **Step 1: List remaining generic strings**

Run:

```bash
cd greenstreet_frontend && grep -oE '>[A-Z][^<>]{12,90}<' src/components/MarketingSite.tsx | sed 's/^>//;s/<$//' | grep -iE 'complian|greenboard|champion|advisor|FINRA|surveillance|archiv|WORM|17a-4|eComm' | sort -u
```

Expected: a short list of leftover strings (footer/legal/alt text).

- [ ] **Step 2: Replace each leftover with a DSCR equivalent**

For each string the grep returns, apply a `perl -i -pe 's/\QOLD\E/NEW/g'` replacement using these mappings (only apply the ones that appear):

```
"Communications Archiving & Supervision" -> "DSCR Calculator"
"Employee Compliance"                    -> "Lender Intelligence"
"Marketing Compliance"                   -> "State Regulations"
"Firm Compliance"                        -> "Deal Analyzer"
"Third-Party Compliance"                 -> "Borrower Profiles"
"Financial Advisors"                     -> "Mortgage Brokers"
"Private Funds"                          -> "Real Estate Investors"
"Hedge Funds"                            -> "DSCR Investors"
"Broker-Dealers"                         -> "Wholesale Lenders"
"RIA Registration"                       -> "State Rules"
"Service Provider Platform"              -> "Capital Markets"
```

Example command for one:

```bash
cd greenstreet_frontend && perl -i -pe 's/\QFinancial Advisors\E/Mortgage Brokers/g' src/components/MarketingSite.tsx
```

- [ ] **Step 3: Confirm no generic terms remain in visible copy**

Run:

```bash
cd greenstreet_frontend && grep -oE '>[A-Z][^<>]{12,90}<' src/components/MarketingSite.tsx | sed 's/^>//;s/<$//' | grep -iE 'FINRA|eComm|WORM|17a-4|compliance champion' | sort -u
```

Expected: no output (empty).

- [ ] **Step 4: Type-check and commit**

```bash
cd greenstreet_frontend && npx tsc --noEmit && git add src/components/MarketingSite.tsx && git commit -m "content: final DSCR copy sweep on marketing footer/nav"
```

---

## Task 8: End-to-end verification & graph rebuild

**Files:**

- None (verification only)

- [ ] **Step 1: Run the unit tests**

Run: `cd greenstreet_frontend && npx vitest run`
Expected: resolver suite passes (8 tests).

- [ ] **Step 2: Full type-check**

Run: `cd greenstreet_frontend && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Click-through every nav destination in the preview**

With the preview running, verify each resolves (no blank screen, no console error):

- Product → Platform / DSCR Calculator / Lender Intelligence / State Regulations / Deal Analyzer / Borrower Profiles → portal opens on the mapped tab.
- Who We Serve → Mortgage Brokers / Real Estate Investors / DSCR Investors / Wholesale Lenders → correct ContentPage.
- Book a demo, About, Support, Careers, Blog, Case studies, Terms, Privacy → correct ContentPage.
- Each ContentPage CTA button navigates correctly.
- "← Back to home" returns to the marketing site.

Run `preview_console_logs --level error` and confirm no errors.

- [ ] **Step 4: Rebuild the graphify graph (project rule)**

Run:

```bash
cd "C:/Users/serge/OneDrive/Documents/DSCR_LOAN OFFICE" && python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"
```

Expected: graph rebuild completes without error.

- [ ] **Step 5: Final commit**

```bash
cd greenstreet_frontend && git add -A && git commit -m "test: verify site routing and content end-to-end"
```

---

## Self-Review Notes

- **Spec coverage:** Pages to create (Task 2/3 + map in Task 1), text/info added from the folder (Task 2 copy + Task 7 sweep), buttons lead somewhere (Task 1 resolver + Task 4 interception + Task 5 deep-links), skinny UI fix (Task 6). Covered.
- **Type consistency:** `DashboardTab` is defined in `resolve.ts` and re-used by `App.tsx`; `ComplianceDashboard` keeps its own local `DashboardTab` (identical union) — verified identical in Task 5. `SitePage`/`PageSection`/`PageStat` defined in `pages.ts`, consumed by `ContentPage.tsx`.
- **No placeholders:** all page copy is written out in Task 2; all code blocks are complete.
- **Design system:** ContentPage uses only existing tokens (`#EEEFD3`, `#003738`, `#004041`, `#4dbd97`, Outfit, `.u-container`); marketing edits are text-only; portal fix only widens a max-width.

---

## Content Addendum — verbatim copy from `UNIFIED_HUB.md`

> These blocks are lifted from UNIFIED_HUB.md (cited to its sections). Merge them into the `PAGES` map (Task 2) and the marketing "How it works" / FAQ regions. This is the authoritative wording — use it over the paraphrased copy in Task 2 where they overlap.

### A. Canonical definitions (reuse anywhere)

- **Elevator (§1.2):** "Greenstreet Finance is the next-generation AI-native system of action for DSCR and non-QM wholesale lending. Powered by **Sovereign OS** — a graph-native operating system that ingests live property data, lender matrices, compliance rules, and borrower profiles — Greenstreet returns **Dual-Track DSCR pre-screens** (Lender Qualification + Investor Survival), **ranked lender matches** across 60+ non-QM programs, and **stress-tested underwriting** in under 90 seconds."
- **What DSCR is (§1.3):** "A DSCR loan (Debt Service Coverage Ratio) is a business-purpose mortgage for rental investment properties. Instead of qualifying the borrower by personal income, DSCR lenders qualify the property — comparing monthly rental income to the monthly mortgage payment (PITIA). A DSCR ≥ 1.00 means the rent covers the mortgage."

### B. `products` page — 6 value features (§2.5, verbatim)

Add each as a `PageSection` (heading = feature, body = text):

1. **Dual-Track DSCR, computed correctly** — "Track 1 (Lender Qualification, PITIA, market rent, no vacancy) and Track 2 (Investor Survival, vacancy + mgmt fee + CapEx) — both shown, never blended."
2. **60+ non-QM programs, one matrix** — "Lender matrices update nightly. DSCR floor, FICO floor, LTV cap, reserve rule, entity policy — matched against your file in seconds."
3. **STR legality gate & AirDNA** — "STR income is gated by legality. AirDNA Rentalizer with a 20% occupancy haircut, 12-month coverage, market score ≥60, 2-per-bedroom occupancy."
4. **Foreign national & ITIN flow** — "Non-QM specialty. Passport + visa/ESTA, OFAC screening, alternative credit (international reports, reference letters, foreign bank statements)."
5. **Entity vesting & layered LLCs** — "U.S. domestic LLC / partnership / corporation. Up to two layered LLCs with 51% guarantor ownership. Full-recourse personal guarantees."
6. **Reserves & cross-collateral** — "6+ months PITIA. Personal liquidity, business funds (with seasoning), cross-collateral from other REOs, gift funds where allowed."

### C. Audience pages — use-case copy (§2.6, verbatim)

| Page key | Title | Body |
|----------|-------|------|
| `brokers` | Submit once. Match across every DSCR program. | Drop in a property + borrower. Greenstreet returns lender-qualified DSCR, investor-survival DSCR, and the best-fit lenders across the non-QM market. |
| `wholesale` (Lenders) | Pre-screen files against your matrix — automatically. | Pipe inbound files. Greenstreet scores against your DSCR floor, FICO, LTV, reserves, and entity policy before a human ever touches the file. |
| `investors` | Kill bad deals before you spend the appraisal fee. | Run the dual-track DSCR with real vacancy and management fee assumptions. If Track 2 fails, walk away — before you commit. |
| `dscr-investors` (Non-QM Shops) | Wholesale origination, priced for 2026. | Pre-qual, pre-screen, and lock support across 1-4 unit residential, 5-8 unit DSCR, warrantable & non-warrantable condos, condotels, manufactured, ADUs. |
| `state-rules` (Credit Risk) | Stress-tested underwriting, auditable end-to-end. | Every decision is logged. Every matrix version is pinned. Every override is traceable. Built for examiners and capital-markets scrutiny. |
| `capital-markets` | Loan tapes that survive the diligence call. | Structured data on every DSCR — both tracks, all matrices considered, all exceptions flagged. Tape-ready output for whole-loan and securitization. |

### D. `faq` page — NEW page key `faq` (§2.7, 8 Q&A verbatim)

Add `"/faq" -> "faq"` to `CONTENT_ROUTES` in `resolve.ts` (Task 1), and add a `faq` entry to `PAGES` with these 8 sections (heading = Q, body = A):

1. **What DSCR ratio do I need to qualify?** — "Most non-QM DSCR lenders require a minimum DSCR of 1.20 on Track 1, though programs exist from 1.00 up. Premium pricing starts at 1.25 with FICO ≥680. Greenstreet shows your Track 1 DSCR against every active lender's floor and flags where Track 2 diverges."
2. **What counts as qualifying rent?** — "For long-term rentals, the higher of FNMA Form 1007/1025 market rent or current lease — provided the difference is ≤20%. Vacant units may use a new lease up to 120% of Form 1007. STR uses the lowest of Form 1007, a 12-month rental history, or AirDNA Rentalizer (20% haircut, market score ≥60)."
3. **Is interest-only allowed, and does it help my DSCR?** — "Yes — most lenders offer 5/1, 7/1 ARM, and 30-year fixed IO. IO delivers 15–22% denominator relief versus amortizing PITIA, since you qualify on ITIA."
4. **Can a foreign national or ITIN borrower qualify?** — "Yes. Foreign nationals need a valid passport + visa/ESTA and must pass OFAC screening; alternative credit is accepted. ITIN borrowers use an ITIN card or IRS letter plus government photo ID. Power of Attorney is generally not permitted."
5. **What properties are eligible?** — "SFR detached/attached, 2-4 unit, 5-8 unit (DSCR only), warrantable & non-warrantable condos, condotels, manufactured/modular, and ADUs. Ineligible: assisted living, agricultural >20 acres, C5/C6 condition, co-ops, timeshare, mixed-use commercial, units under 500 sq ft."
6. **How are reserves calculated?** — "Most lenders require 6+ months of PITIA in liquid reserves after closing. Eligible: personal checking/savings, brokerage, business funds (with seasoning), cross-collateral from other REOs, and gift funds where allowed."
7. **What's the difference between Track 1 and Track 2 DSCR?** — "Track 1 is the official approval ratio (appraiser market rent, no vacancy). Track 2 stress-tests real-world performance (vacancy, management, maintenance, CapEx). A deal can pass Track 1 but fail Track 2. Greenstreet always shows both."
8. **How fast is the DSCR pre-screen?** — "A Dual-Track pre-screen runs in seconds for a single property; lender matching across 60+ programs in under a minute; full tape-grade underwriting in under 90 seconds." *(Do not cite the exact 7s/30s/90s as hard claims until benchmarked — §2.2 compliance note.)*

### E. `case-studies` page — 3 real stories (§2.4, verbatim)

1. **Vela Capital — "scales 4× without adding underwriting headcount"** — "Vela needed to pre-screen 120+ DSCR files a month across 8 brokers. The Dual-Track engine + lender matching cut decision time from 25 minutes to 6 minutes per file — without adding headcount."
2. **Northshore Non-QM — "From 2 quotes per loan to 5 — same underwriting team"** — "Northshore's brokers now run one file and see ranked matches across Cake, Kiavi, Lima One, and Newfi. Pipeline visibility went from scattered spreadsheets to a single ledger."
3. **Quintero & Co. — "Killed 3 bad deals before appraisal — saved $14,800"** — "Quintero use Track 2 to surface real cash-flow risk. Three deals that would have failed post-appraisal were walked away from pre-appraisal."

### F. `blog` page — 3 real article titles (§2.9)

1. **Underwriting:** "Why Track 1 vs Track 2 DSCR is the difference between qualifying and performing"
2. **Lender Network:** "Cake, Kiavi, Lima One, Newfi: how 4 lenders price the same DSCR deal differently"
3. **STR:** "AirDNA + a 20% haircut: how to underwrite STR without the lawsuits"

### G. Marketing "How it works" — 5 tabs (§2.3, optional copy refresh, text-only)

If refreshing the existing 5 tab cards in `MarketingSite.tsx` (no structural change): (1) Underwriting Engine — Dual-Track DSCR; (2) Lender Matching across 60+ non-QM programs; (3) Dual-Track DSCR doctrine; (4) Reserves & Assets; (5) Privacy & Security (SOC 2 Type II, GLBA-aligned, PII tokenization, per-org isolation, OFAC screening, audit log). Bodies are in §2.3 verbatim.

### H. Trust bar — keep marketing subset (§2.8)

The logo wall's 26 marketing lenders (Cake, Kiavi, Lima One, Newfi, Angel Oak …) stay as-is; the **17-lender verified production matrix (§3.1)** drives the *engine*, not the logo wall. Do not swap one for the other.
