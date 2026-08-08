import React, { useState, useEffect, useRef, Component, lazy, Suspense } from "react";
import QualifyWidget from "./components/QualifyWidget";
import ToolReliabilityHoldPage from "./components/ToolReliabilityHoldPage";
import { TOOL_RELIABILITY_HOLDS } from "./components/toolReliabilityHolds";
import MarketingHome from "./marketing/MarketingHome";
import NotFoundPage from "./pages/NotFoundPage";
import { applyRouteMetadata, getRouteMetadata } from "./seo/routeMetadata";

// Route module importers — the SINGLE source for both React.lazy and the idle
// prefetch (warmAllRoutes) below. Each page is its own chunk (small initial
// bundle), but every chunk is warmed during idle right after first paint, so
// navigation NEVER suspends: the chunk is already cached, React.lazy resolves
// synchronously, and the page renders its FINAL layout immediately — no
// temporary Suspense "shell" flash and no typography/layout reset on route change.
const routeModules = {
  ComplianceDashboard: () => import("./components/ComplianceDashboard"),
  DSCRCalculatorPage: () => import("./pages/DSCRCalculatorPage"),
  LenderIntelPage: () => import("./pages/LenderIntelPage"),
  FAQPage: () => import("./pages/FAQPage"),
  BlogPage: () => import("./pages/BlogPage"),
  BlogPostPage: () => import("./pages/BlogPostPage"),
  BorrowerProfilesPage: () => import("./pages/BorrowerProfilesPage"),
  NonUsInvestorsPage: () => import("./pages/NonUsInvestorsPage"),
  STRHostsPage: () => import("./pages/STRHostsPage"),
  VacationHomesPage: () => import("./pages/VacationHomesPage"),
  BrokersPortalPage: () => import("./pages/BrokersPortalPage"),
  InvestorsPage: () => import("./pages/InvestorsPage"),
  AboutPage: () => import("./pages/AboutPage"),
  CareersPage: () => import("./pages/CareersPage"),
  CaseStudiesPage: () => import("./pages/CaseStudiesPage"),
  LegalPage: () => import("./pages/LegalPage"),
  ProductsPage: () => import("./pages/ProductsPage"),
  PlatformPage: () => import("./pages/PlatformPage"),
  SupportPage: () => import("./pages/SupportPage"),
  SolutionsPage: () => import("./pages/SolutionsPage"),
  BrokersPage: () => import("./pages/BrokersPage"),
  BookDemoPage: () => import("./pages/BookDemoPage"),
  // Tool pages that render live. Every tool named in TOOL_RELIABILITY_HOLDS is
  // served by ToolReliabilityHoldPage instead and so needs no chunk of its own —
  // deliberately absent here, because a chunk entry is the first step back to
  // rendering the held page. toolReliabilityHolds.test.ts fails the build if a
  // hold record stops being rendered.
  CommercialDSCRPage: () => import("./pages/CommercialDSCRPage"),
  ConstructionBridgePage: () => import("./pages/ConstructionBridgePage"),
  TCOThresholdPage: () => import("./pages/TCOThresholdPage"),
} as const;

let _warmed = false;
function warmAllRoutes() {
  if (_warmed || typeof window === "undefined") return;
  _warmed = true;
  Object.values(routeModules).forEach((load) => { (load() as Promise<unknown>).catch(() => {}); });
}

const ComplianceDashboard = lazy(routeModules.ComplianceDashboard);
const DSCRCalculatorPage = lazy(routeModules.DSCRCalculatorPage);
const LenderIntelPage = lazy(routeModules.LenderIntelPage);
const FAQPage = lazy(routeModules.FAQPage);
const BlogPage = lazy(routeModules.BlogPage);
const BlogPostPage = lazy(routeModules.BlogPostPage);
const BorrowerProfilesPage = lazy(routeModules.BorrowerProfilesPage);
const NonUsInvestorsPage = lazy(routeModules.NonUsInvestorsPage);
const STRHostsPage = lazy(routeModules.STRHostsPage);
const VacationHomesPage = lazy(routeModules.VacationHomesPage);
const BrokersPortalPage = lazy(routeModules.BrokersPortalPage);
const InvestorsPage = lazy(routeModules.InvestorsPage);
const AboutPage = lazy(routeModules.AboutPage);
const CareersPage = lazy(routeModules.CareersPage);
const CaseStudiesPage = lazy(routeModules.CaseStudiesPage);
const LegalPage = lazy(routeModules.LegalPage);
const ProductsPage = lazy(routeModules.ProductsPage);
const PlatformPage = lazy(routeModules.PlatformPage);
const SupportPage = lazy(routeModules.SupportPage);
const SolutionsPage = lazy(routeModules.SolutionsPage);
const BrokersPage = lazy(routeModules.BrokersPage);
const BookDemoPage = lazy(routeModules.BookDemoPage);
const CommercialDSCRPage = lazy(routeModules.CommercialDSCRPage);
const ConstructionBridgePage = lazy(routeModules.ConstructionBridgePage);
const TCOThresholdPage = lazy(routeModules.TCOThresholdPage);

// ─── Error Boundary ────────────────────────────────────────────────────────────
// Users get a plain-language recovery message; the raw error text lives behind a
// collapsed <details> for anyone who wants to paste it into a support thread. The
// full error + component stack always goes to the console and Sentry (if wired),
// so hiding it from the page costs nothing diagnostically.
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Greenstreet] Unhandled UI error:", error, info?.componentStack);
    captureException(error);
  }

  render() {
    const error = this.state.error;
    if (error) {
      const technical = [
        `${error.name || "Error"}: ${error.message || "(no message)"}`,
        error.stack ? error.stack.split("\n").slice(1, 6).join("\n") : "",
      ].filter(Boolean).join("\n");
      return (
        <div style={{ minHeight: "100vh", background: depth.browse.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family }}>
          <div style={{ maxWidth: "520px", padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }} aria-hidden="true">⚠</div>
            <h2 style={{ color: depth.browse.ink, fontSize: "24px", marginBottom: "12px" }}>This page didn't load</h2>
            <p style={{ color: swatch.rainforest, marginBottom: "24px", lineHeight: 1.55 }}>
              Something went wrong on our side — nothing you did caused it, and no information you entered was sent
              anywhere. Going back and retrying usually clears it.
            </p>
            <button onClick={() => { this.setState({ error: null }); window.history.back(); }}
              style={{ background: swatch.lemon, color: swatch.midnight, border: "none", borderRadius: radius.sm, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: "15px" }}>
              Go back
            </button>
            <details style={{ marginTop: "28px", textAlign: "left" }}>
              <summary style={{ cursor: "pointer", fontSize: "13px", color: swatch.rainforest, fontWeight: 600 }}>
                Technical details
              </summary>
              <pre style={{
                marginTop: "10px", padding: "12px", fontSize: "11px", lineHeight: 1.5,
                fontFamily: font.mono, color: swatch.rainforest, background: "rgba(0,55,56,0.06)",
                border: `1px solid ${swatch.midnightFaded}`, borderRadius: radius.sm,
                whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "auto", maxHeight: "220px",
              }}>
                {technical}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { resolveRoute, isKnownRoute, PageView } from "./router/resolve";
import { depth, swatch, radius, font } from "./theme";
import { captureException } from "./monitoring/sentry";

// ─── Route loading fallback ────────────────────────────────────────────────────
// warmAllRoutes() means navigation almost never suspends — but "almost never" is
// not never: a cold first paint on a slow link, or a route change that beats the
// idle warm, still hits Suspense. fallback={null} turned that into a blank white
// screen. This paints the SAME depth ground the incoming view will land on (cream
// for marketing, midnight for the app), so the wait reads as the page settling
// rather than as a broken tab, and there is no ground flash when content arrives.
const ROUTE_FALLBACK_CSS = `
  @keyframes gs-route-spin { to { transform: rotate(360deg); } }
  .gs-route-spinner { animation: gs-route-spin 900ms linear infinite; }
  @media (prefers-reduced-motion: reduce) {
    .gs-route-spinner { animation: none; }
  }
`;

/** The paired surface/ink stop for a view — marketing browses, everything else underwrites. */
function depthStopFor(view: PageView) {
  return view === "marketing" ? depth.browse : depth.underwrite;
}

function RouteFallback({ view }: { view: PageView }) {
  const stop = depthStopFor(view);
  const onDark = stop.bg === depth.underwrite.bg;
  return (
    <div
      role="status"
      aria-live="polite"
      // Fixed rather than in-flow: the fallback can never contribute layout, so
      // swapping it for the real page cannot shift anything or toggle a scrollbar.
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: stop.bg,
        color: stop.ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        fontFamily: font.family,
      }}
    >
      <style>{ROUTE_FALLBACK_CSS}</style>
      <span
        aria-hidden="true"
        style={{
          width: 44, height: 44, borderRadius: radius.md,
          display: "grid", placeItems: "center",
          background: onDark ? "rgba(216,217,88,0.12)" : "rgba(0,55,56,0.05)",
          border: `1px solid ${onDark ? "rgba(216,217,88,0.28)" : swatch.midnightFaded}`,
          color: onDark ? swatch.lemon : swatch.midnight,
          fontWeight: 800, fontSize: 20, letterSpacing: "-0.04em",
        }}
      >
        G
      </span>
      <span
        className="gs-route-spinner"
        aria-hidden="true"
        style={{
          width: 16, height: 16, borderRadius: "50%",
          border: `2px solid ${onDark ? "rgba(238,239,211,0.18)" : "rgba(0,55,56,0.14)"}`,
          borderTopColor: onDark ? swatch.lemon : swatch.rainforest,
        }}
      />
      {/* Visually hidden — the mark above is the visual; this is for screen readers. */}
      <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}>
        Loading…
      </span>
    </div>
  );
}

const CLIENT_WORKSPACE_CONFIGURED = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

// Views where the floating "See if you qualify" pill is suppressed.
//
// This list used to be named RELIABILITY_HOLD_VIEWS because it ALSO selected
// which tools rendered ToolReliabilityHoldPage. It no longer does — that
// decision now lives in one place, TOOL_RELIABILITY_HOLDS, and is applied in
// renderPage below. Renaming the set was correct; what was not correct was the
// period in which seven of those tools were dropped from the hold wiring while
// their hold records still stood unsatisfied. Membership here is deliberately
// unchanged and is NOT the release gate: it only means these deep analysis
// surfaces carry their own prominent qualify CTAs, so the floating overlay is
// redundant clutter. Do not infer a tool's hold status from this set.
//
// Deliberately NOT suppressed (conversion surfaces where the pill IS the primary
// path): portal, legal, book-demo, dscr-calculator, lender-intel, external. A
// since-deleted local constant suppressed the widget on those too; that behavior
// was not adopted — flagged for a product decision.
const QUALIFY_WIDGET_SUPPRESSED_VIEWS = new Set<PageView>([
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

function portalTabFromPath(pathname: string): string | undefined {
  const clean = pathname.replace(/\/$/, "");
  if (clean === "/investgo/analyze" || clean === "/tools/deal-workspace" || clean === "/tools/workspace") return "analyze";
  if (clean === "/investgo/sensitivity" || clean === "/tools/sensitivity") return "sensitivity";
  if (clean === "/investgo/optimize" || clean === "/tools/structure-optimizer") return "optimize";
  if (clean === "/investgo/state") return "state";
  if (clean === "/investgo/history" || clean === "/tools/scenario-history") return "history";
  if (clean === "/investgo/settings") return "settings";
  return undefined;
}

function navigateTo(view: PageView) {
  const path = viewToPath(view);
  if (typeof window !== "undefined") {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

function viewToPath(view: PageView): string {
  switch (view) {
    case "marketing":         return "/";
    case "portal":            return "/investgo";
    case "dscr-calculator":   return "/dscr-calculator";
    case "lender-intel":      return "/lender-intel";
    case "state-laws":        return "/state-laws";
    case "deal-analyzer":     return "/deal-analyzer";
    case "borrower-profiles": return "/borrower-profiles";
    case "non-us-investors": return "/non-us-investors";
    case "str-hosts":         return "/str-airbnb";
    case "vacation-homes":    return "/vacation-homes";
    case "brokers":           return "/brokers";
    case "brokers-partner":   return "/partnerships";
    case "investors":         return "/investors";
    case "faq":               return "/faq";
    case "blog":              return "/blog";
    case "blog-post":         return "/blog";
    case "case-studies":      return "/case-studies";
    case "rate-quiz":         return "/rate-quiz";
    case "refi-tracker":      return "/tools/refi-tracker";
    case "arm-reset":         return "/tools/arm-reset";
    case "monte-carlo":       return "/tools/monte-carlo";
    case "returns":           return "/tools/returns";
    case "tax-engine":        return "/tools/tax-engine";
    case "stress-matrix":     return "/tools/stress-matrix";
    case "structure-optimizer": return "/tools/structure-optimizer";
    case "decision-support":  return "/tools/decision-support";
    case "str-underwriting":  return "/tools/str-underwriting";
    case "portfolio":         return "/tools/portfolio";
    case "about":             return "/about";
    case "careers":           return "/careers";
    case "legal":             return "/legal";
    case "products":          return "/products";
    case "platform":          return "/products/platform";
    case "support":           return "/support";
    case "solutions":         return "/solutions";
    case "book-demo":         return "/book-demo";
    case "not-found":         return "/404";
    case "external":          return "/external";
    case "commercial-dscr":     return "/tools/commercial-dscr";
    case "construction-bridge": return "/tools/construction-bridge";
    case "tco-threshold":       return "/tools/tco-threshold";
  }
}

export default function App() {
  const [view, setView] = useState<PageView>(() => {
    if (typeof window !== "undefined") {
      return resolveRoute(window.location.pathname);
    }
    return "marketing";
  });
  const [passedEmail, setPassedEmail] = useState("");
  const [pathname, setPathname] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const onPopState = () => {
      if (typeof window !== "undefined") {
        setView(resolveRoute(window.location.pathname));
        setPathname(window.location.pathname);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(
    () => applyRouteMetadata(getRouteMetadata({ pathname, view })),
    [pathname, view],
  );

  // Warm every route chunk during idle, right after first paint. After this runs,
  // navigation never hits a Suspense fallback — the chunk is already cached, so
  // React.lazy resolves synchronously and the page renders its FINAL layout
  // immediately (no temporary shell flash / typography-layout reset).
  useEffect(() => {
    const w = window as any;
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(warmAllRoutes, { timeout: 2500 })
      : window.setTimeout(warmAllRoutes, 1500);
    return () => { if (w.cancelIdleCallback) w.cancelIdleCallback(id); else clearTimeout(id); };
  }, []);

  // Global link interceptor: any <a href="/internal"> click navigates via
  // React Router instead of doing a full page reload. Unknown paths fall
  // through so external links (HubSpot booking, asset files, etc.) keep working.
  const goTo = (nextView: PageView) => {
    navigateTo(nextView);
    setView(nextView);
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
      window.scrollTo({ top: 0 });
    }
  };

  // Hold the latest goTo in a ref so the global click listener can be
  // registered exactly once (below) instead of being torn down and re-added on
  // every render. Listener churn is a subtle source of double-handling.
  const goToRef = useRef(goTo);
  goToRef.current = goTo;
  const viewRef = useRef(view);
  viewRef.current = view;
  // First body paint sets the depth ground instantly; later route changes fade.
  const depthFirstPaint = useRef(true);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("data-external")) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("rel")?.includes("external")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      // Skip non-internal links (mailto:, tel:, hash-only, external https, etc.)
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (!href.startsWith("/")) return;
      if (href.startsWith("//")) return;
      if (!isKnownRoute(href)) return;

      e.preventDefault();
      goToRef.current(resolveRoute(href));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    // Deal-depth ground: the marketing home rides the cream "browse" surface and
    // every React app route rides the midnight "underwrite" surface. Painting
    // BOTH grounds (html catches overscroll, body the page) with the paired ink
    // means the marketing→app crossing fades through one tonal descent instead of
    // cutting between two color worlds — and the cream ground stops flashing
    // behind the dark app. Surface+ink come from the same stop so contrast can
    // never invert mid-ramp.
    const stop = depthStopFor(view);
    const root = document.documentElement;
    if (!depthFirstPaint.current) {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const ease = reduce ? "none" : "background-color 600ms ease, color 600ms ease";
      root.style.transition = ease;
      document.body.style.transition = ease;
    }
    root.style.backgroundColor = stop.bg;
    document.body.style.backgroundColor = stop.bg;
    document.body.style.color = stop.ink;
    depthFirstPaint.current = false;

    if (view === "marketing") {
      document.documentElement.classList.remove("is-spa-route");
    } else {
      document.documentElement.classList.add("is-spa-route");
    }
  }, [view]);

  const handleLoginClick = () => goTo("portal");
  const handleGetStarted = (email: string) => {
    setPassedEmail(email);
    goTo("portal");
  };
  const navigateFromReliabilityHold = (nextView: string) =>
    goTo(nextView as PageView);

  const renderPage = () => {
    switch (view) {
      case "marketing":
        return <MarketingHome />;
      case "portal":
        if (!CLIENT_WORKSPACE_CONFIGURED) {
          return (
            <ToolReliabilityHoldPage
              {...TOOL_RELIABILITY_HOLDS.workspace}
              onNavigate={navigateFromReliabilityHold}
            />
          );
        }
        return (
          <ComplianceDashboard
            key={pathname}
            onBackToMarketing={() => goTo("marketing")}
            initialEmail={passedEmail}
            initialTab={portalTabFromPath(pathname) as any}
          />
        );
      case "dscr-calculator":
        return <DSCRCalculatorPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "lender-intel":
        return <LenderIntelPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "state-laws":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.stateRules} onNavigate={navigateFromReliabilityHold} />;
      case "faq":
        return <FAQPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "blog":
        return <BlogPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "blog-post":
        return <BlogPostPage key={pathname} path={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "case-studies":
        return <CaseStudiesPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "rate-quiz":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.rateQuiz} onNavigate={navigateFromReliabilityHold} />;
      case "deal-analyzer":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.dealAnalyzer} onNavigate={navigateFromReliabilityHold} />;
      case "borrower-profiles":
        return <BorrowerProfilesPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "non-us-investors":
        return <NonUsInvestorsPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "str-hosts":
        return <STRHostsPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "vacation-homes":
        return <VacationHomesPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "brokers":
        return <BrokersPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "brokers-partner":
        return <BrokersPortalPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "investors":
        return <InvestorsPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "about":
        return <AboutPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "careers":
        return <CareersPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "legal":
        return <LegalPage key={pathname} path={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "products":
        return <ProductsPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "platform":
        return <PlatformPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "support":
        return <SupportPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "solutions":
        return <SolutionsPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "book-demo":
        return <BookDemoPage key={pathname} onNavigate={goTo} />;
      case "not-found":
        return <NotFoundPage key={pathname} onNavigate={goTo} />;
      case "refi-tracker":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.refiTracker} onNavigate={navigateFromReliabilityHold} />;
      case "arm-reset":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.armReset} onNavigate={navigateFromReliabilityHold} />;
      case "monte-carlo":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.monteCarlo} onNavigate={navigateFromReliabilityHold} />;
      case "returns":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.returns} onNavigate={navigateFromReliabilityHold} />;
      case "tax-engine":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.taxEngine} onNavigate={navigateFromReliabilityHold} />;
      case "stress-matrix":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.stressMatrix} onNavigate={navigateFromReliabilityHold} />;
      case "decision-support":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.decisionSupport} onNavigate={navigateFromReliabilityHold} />;
      case "commercial-dscr":
        return <CommercialDSCRPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "construction-bridge":
        return <ConstructionBridgePage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "tco-threshold":
        return <TCOThresholdPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "str-underwriting":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.strUnderwriting} onNavigate={navigateFromReliabilityHold} />;
      case "structure-optimizer":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.structureOptimizer} onNavigate={navigateFromReliabilityHold} />;
      case "portfolio":
        return <ToolReliabilityHoldPage {...TOOL_RELIABILITY_HOLDS.portfolioRefi} onNavigate={navigateFromReliabilityHold} />;
      case "external":
        if (typeof window !== "undefined") {
          window.location.href = "https://www.greenstreet.finance";
        }
        return null;
    }
  };

  function PageRenderer() {
    return <>{renderPage()}</>;
  }

  return (
    <ErrorBoundary>
      <div className="font-sans antialiased text-slate-800">
        <Suspense fallback={<RouteFallback view={view} />}>
          <PageRenderer />
        </Suspense>
        {view === "marketing" ||
        view === "not-found" ||
        (view === "portal" && !CLIENT_WORKSPACE_CONFIGURED) ||
        QUALIFY_WIDGET_SUPPRESSED_VIEWS.has(view) ? null : (
          <QualifyWidget
            showTrigger={view !== "book-demo"}
            autoOpen={view !== "book-demo"}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
