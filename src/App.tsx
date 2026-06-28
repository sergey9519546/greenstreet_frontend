import React, { useState, useEffect, useRef, Component, lazy, Suspense } from "react";
import QualifyWidget from "./components/QualifyWidget";

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
  StateLawsPage: () => import("./pages/StateLawsPage"),
  FAQPage: () => import("./pages/FAQPage"),
  BlogPage: () => import("./pages/BlogPage"),
  BlogPostPage: () => import("./pages/BlogPostPage"),
  RateQuizPage: () => import("./pages/RateQuizPage"),
  RefiTrackerPage: () => import("./pages/RefiTrackerPage"),
  ARMPage: () => import("./pages/ARMPage"),
  MonteCarloPage: () => import("./pages/MonteCarloPage"),
  ReturnsPage: () => import("./pages/ReturnsPage"),
  TaxEnginePage: () => import("./pages/TaxEnginePage"),
  StressMatrixPage: () => import("./pages/StressMatrixPage"),
  DecisionSupportPage: () => import("./pages/DecisionSupportPage"),
  STRUnderwritingPage: () => import("./pages/STRUnderwritingPage"),
  PortfolioPage: () => import("./pages/PortfolioPage"),
  DealAnalyzerPage: () => import("./pages/DealAnalyzerPage"),
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
const StateLawsPage = lazy(routeModules.StateLawsPage);
const FAQPage = lazy(routeModules.FAQPage);
const BlogPage = lazy(routeModules.BlogPage);
const BlogPostPage = lazy(routeModules.BlogPostPage);
const RateQuizPage = lazy(routeModules.RateQuizPage);
const RefiTrackerPage = lazy(routeModules.RefiTrackerPage);
const ARMPage = lazy(routeModules.ARMPage);
const MonteCarloPage = lazy(routeModules.MonteCarloPage);
const ReturnsPage = lazy(routeModules.ReturnsPage);
const TaxEnginePage = lazy(routeModules.TaxEnginePage);
const StressMatrixPage = lazy(routeModules.StressMatrixPage);
const DecisionSupportPage = lazy(routeModules.DecisionSupportPage);
const STRUnderwritingPage = lazy(routeModules.STRUnderwritingPage);
const PortfolioPage = lazy(routeModules.PortfolioPage);
const DealAnalyzerPage = lazy(routeModules.DealAnalyzerPage);
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

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#eeefd3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit, sans-serif" }}>
          <div style={{ maxWidth: "480px", padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠</div>
            <h2 style={{ color: "#003738", fontSize: "24px", marginBottom: "12px" }}>Something went wrong</h2>
            <p style={{ color: "#006565", marginBottom: "24px" }}>{(this.state.error as Error).message}</p>
            <button onClick={() => { this.setState({ error: null }); window.history.back(); }}
              style={{ background: "#d8d958", color: "#003738", border: "none", borderRadius: "8px", padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: "15px" }}>
              Go back
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { resolveRoute, isKnownRoute, PageView } from "./router/resolve";
import { depth } from "./theme";

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

  // Hold the latest goTo + view in refs so the global click listener can be
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
      // On React (non-marketing) routes, ignore any anchor that lives inside the
      // hidden Webflow marketing root. Those nav/footer links must never drive
      // SPA navigation — they can't be user-clicked while hidden, and blocking
      // them here stops the embedded marketing markup/scripts from hijacking
      // routing on React pages (the V8 route-drift bug).
      if (viewRef.current !== "marketing" && anchor.closest("#webflow-root")) return;
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
    const stop = view === "marketing" ? depth.browse : depth.underwrite;
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

    const isMarketing = view === "marketing";
    if (isMarketing) {
      document.documentElement.classList.remove("is-spa-route");
    } else {
      document.documentElement.classList.add("is-spa-route");
    }
    const wfRoot = document.getElementById("webflow-root");
    const reactRoot = document.getElementById("root");
    if (wfRoot) {
      wfRoot.style.display = isMarketing ? "block" : "none";
      // Belt-and-suspenders: the hidden marketing root must not intercept
      // pointer events or be reachable on React routes.
      wfRoot.style.pointerEvents = isMarketing ? "" : "none";
      wfRoot.setAttribute("aria-hidden", isMarketing ? "false" : "true");
      wfRoot.hidden = !isMarketing;
      (wfRoot as any).inert = !isMarketing;
    }
    if (reactRoot) reactRoot.style.display = isMarketing ? "none" : "block";

    const w = window as any;
    if (isMarketing) {
      // Marketing DOM is now visible — (re)initialize its GSAP/Swiper layer.
      setTimeout(() => {
        try {
          if (typeof w.initAnimations === "function") w.initAnimations();
          if (typeof w.__gsStartMarketing === "function") w.__gsStartMarketing();
        } catch (e) {
          console.error("Failed to re-initialize marketing animations:", e);
        }
      }, 50);
    } else {
      // Leaving (or never entering) marketing: tear down ScrollTrigger /
      // Swiper / intervals / handlers so the embedded Webflow scripts can't
      // hijack scroll or history on React pages.
      try {
        if (typeof w.__gsStopMarketing === "function") w.__gsStopMarketing();
      } catch (e) {
        console.error("Failed to tear down marketing animations:", e);
      }
    }
  }, [view]);

  const handleLoginClick = () => goTo("portal");
  const handleGetStarted = (email: string) => {
    setPassedEmail(email);
    goTo("portal");
  };

  const renderPage = () => {
    switch (view) {
      case "marketing":
        return null;
      case "portal":
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
        return <StateLawsPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "faq":
        return <FAQPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "blog":
        return <BlogPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "blog-post":
        return <BlogPostPage key={pathname} path={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "case-studies":
        return <CaseStudiesPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "rate-quiz":
        return <RateQuizPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "deal-analyzer":
        return <DealAnalyzerPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
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
        return <RateQuizPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "refi-tracker":
        return <RefiTrackerPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "arm-reset":
        return <ARMPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "monte-carlo":
        return <MonteCarloPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "returns":
        return <ReturnsPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "tax-engine":
        return <TaxEnginePage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "stress-matrix":
        return <StressMatrixPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "decision-support":
        return <DecisionSupportPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "str-underwriting":
        return <STRUnderwritingPage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "portfolio":
        return <PortfolioPage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "external":
        if (typeof window !== "undefined") {
          window.location.href = "https://www.greenstreet.com";
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
        {/* QualifyWidget overlays marketing + tool views — never the logged-in portal */}
        {view !== "portal" && <QualifyWidget />}
      </div>
    </ErrorBoundary>
  );
}
