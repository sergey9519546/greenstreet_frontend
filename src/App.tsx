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
  FAQPage: () => import("./pages/FAQPage"),
  BlogPage: () => import("./pages/BlogPage"),
  BlogPostPage: () => import("./pages/BlogPostPage"),
  BorrowerProfilesPage: () => import("./pages/BorrowerProfilesPage"),
  BrokersPortalPage: () => import("./pages/BrokersPortalPage"),
  InvestorsPage: () => import("./pages/InvestorsPage"),
  AboutPage: () => import("./pages/AboutPage"),
  CareersPage: () => import("./pages/CareersPage"),
  CaseStudiesPage: () => import("./pages/CaseStudiesPage"),
  LegalPage: () => import("./pages/LegalPage"),
  ProductsPage: () => import("./pages/ProductsPage"),
  SolutionsPage: () => import("./pages/SolutionsPage"),
  BrokersPage: () => import("./pages/BrokersPage"),
  BookDemoPage: () => import("./pages/BookDemoPage"),
} as const;

let _warmed = false;
function warmAllRoutes() {
  if (_warmed || typeof window === "undefined") return;
  _warmed = true;
  Object.values(routeModules).forEach((load) => { (load() as Promise<unknown>).catch(() => {}); });
}

const ComplianceDashboard = lazy(routeModules.ComplianceDashboard);
const DSCRCalculatorPage = lazy(routeModules.DSCRCalculatorPage);
const FAQPage = lazy(routeModules.FAQPage);
const BlogPage = lazy(routeModules.BlogPage);
const BlogPostPage = lazy(routeModules.BlogPostPage);
const BorrowerProfilesPage = lazy(routeModules.BorrowerProfilesPage);
const BrokersPortalPage = lazy(routeModules.BrokersPortalPage);
const InvestorsPage = lazy(routeModules.InvestorsPage);
const AboutPage = lazy(routeModules.AboutPage);
const CareersPage = lazy(routeModules.CareersPage);
const CaseStudiesPage = lazy(routeModules.CaseStudiesPage);
const LegalPage = lazy(routeModules.LegalPage);
const ProductsPage = lazy(routeModules.ProductsPage);
const SolutionsPage = lazy(routeModules.SolutionsPage);
const BrokersPage = lazy(routeModules.BrokersPage);
const BookDemoPage = lazy(routeModules.BookDemoPage);

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <main aria-labelledby="application-error-heading" style={{ minHeight: "100vh", background: "#eeefd3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit, sans-serif" }}>
          <div style={{ maxWidth: "480px", padding: "40px", textAlign: "center" }}>
            <div aria-hidden="true" style={{ fontSize: "48px", marginBottom: "16px" }}>⚠</div>
            <h2 id="application-error-heading" style={{ color: "#003738", fontSize: "24px", marginBottom: "12px" }}>Something went wrong</h2>
            <p style={{ color: "#006565", marginBottom: "24px" }}>{(this.state.error as Error).message}</p>
            <button onClick={() => { this.setState({ error: null }); window.history.back(); }}
              style={{ background: "#d8d958", color: "#003738", border: "none", borderRadius: "8px", padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: "15px" }}>
              Go back
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

import { resolveRoute, isKnownRoute, PageView } from "./router/resolve";

const CLIENT_WORKSPACE_CONFIGURED = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

const RELIABILITY_HOLD_VIEWS = new Set<PageView>([
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

function navigateTo(view: PageView, path = viewToPath(view)) {
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
    case "state-laws":        return "/state-laws";
    case "deal-analyzer":     return "/deal-analyzer";
    case "borrower-profiles": return "/borrower-profiles";
    case "brokers":           return "/brokers";
    case "brokers-partner":   return "/partners";
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
    case "solutions":         return "/solutions";
    case "book-demo":         return "/book-demo";
    case "not-found":         return "/404";
    case "external":          return "/external";
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
  const goTo = (nextView: PageView, path?: string) => {
    navigateTo(nextView, path);
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
      goToRef.current(resolveRoute(href), href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = "#EEEFD3";
    if (view === "marketing") {
      document.body.style.color = "#003738";
    } else if (view === "portal") {
      document.body.style.color = "#002D2E";
    } else {
      document.body.style.color = "#003738";
    }

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
        <Suspense fallback={null}>
          <PageRenderer />
        </Suspense>
        {view === "marketing" ||
        view === "not-found" ||
        (view === "portal" && !CLIENT_WORKSPACE_CONFIGURED) ||
        RELIABILITY_HOLD_VIEWS.has(view) ? null : (
          <QualifyWidget
            showTrigger={view !== "book-demo"}
            autoOpen={view !== "book-demo"}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
