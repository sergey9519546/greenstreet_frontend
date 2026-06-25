import React, { useState, useEffect, useRef, Component, lazy, Suspense } from "react";

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

// ─── Page loading fallback ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", background: "#eeefd3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit, sans-serif" }}>
      <div style={{ textAlign: "center", color: "#006565" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
        <p style={{ fontSize: "16px", fontWeight: 500 }}>Loading…</p>
      </div>
    </div>
  );
}

// ─── Lazy page imports (code-split — each page loads on demand) ───────────────
// MarketingSite is unified directly in index.html
const ComplianceDashboard = lazy(() => import("./components/ComplianceDashboard"));
const DSCRCalculatorPage  = lazy(() => import("./pages/DSCRCalculatorPage"));
const LenderIntelPage     = lazy(() => import("./pages/LenderIntelPage"));
const StateLawsPage       = lazy(() => import("./pages/StateLawsPage"));
const FAQPage             = lazy(() => import("./pages/FAQPage"));
const BlogPage            = lazy(() => import("./pages/BlogPage"));
const BlogPostPage        = lazy(() => import("./pages/BlogPostPage"));
const RateQuizPage        = lazy(() => import("./pages/RateQuizPage"));
const RefiTrackerPage     = lazy(() => import("./pages/RefiTrackerPage"));
const ARMPage             = lazy(() => import("./pages/ARMPage"));
const MonteCarloPage      = lazy(() => import("./pages/MonteCarloPage"));
const ReturnsPage         = lazy(() => import("./pages/ReturnsPage"));
const TaxEnginePage       = lazy(() => import("./pages/TaxEnginePage"));
const StressMatrixPage    = lazy(() => import("./pages/StressMatrixPage"));
const DecisionSupportPage = lazy(() => import("./pages/DecisionSupportPage"));
const STRUnderwritingPage = lazy(() => import("./pages/STRUnderwritingPage"));
const PortfolioPage       = lazy(() => import("./pages/PortfolioPage"));
const DealAnalyzerPage    = lazy(() => import("./pages/DealAnalyzerPage"));
const BorrowerProfilesPage = lazy(() => import("./pages/BorrowerProfilesPage"));
const BrokersPortalPage   = lazy(() => import("./pages/BrokersPortalPage"));
const InvestorsPage       = lazy(() => import("./pages/InvestorsPage"));
const AboutPage           = lazy(() => import("./pages/AboutPage"));
const CareersPage         = lazy(() => import("./pages/CareersPage"));
const CaseStudiesPage     = lazy(() => import("./pages/CaseStudiesPage"));
const LegalPage           = lazy(() => import("./pages/LegalPage"));
const ProductsPage        = lazy(() => import("./pages/ProductsPage"));
const SolutionsPage       = lazy(() => import("./pages/SolutionsPage"));
const BrokersPage         = lazy(() => import("./pages/BrokersPage"));

import { resolveRoute, isKnownRoute, PageView } from "./router/resolve";

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
    case "portal":            return "/investorgo";
    case "dscr-calculator":   return "/dscr-calculator";
    case "lender-intel":      return "/lender-intel";
    case "state-laws":        return "/state-laws";
    case "deal-analyzer":     return "/deal-analyzer";
    case "borrower-profiles": return "/borrower-profiles";
    case "brokers":           return "/brokers";
    case "brokers-partner":   return "/partners";
    case "investors":         return "/investors";
    case "faq":               return "/faq";
    case "blog":              return "/blog";
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
    document.body.style.backgroundColor = "#EEEFD3";
    if (view === "marketing") {
      document.body.style.color = "#003738";
    } else if (view === "portal") {
      document.body.style.color = "#002D2E";
    } else {
      document.body.style.color = "#003738";
    }

    const isMarketing = view === "marketing";
    const wfRoot = document.getElementById("webflow-root");
    const reactRoot = document.getElementById("root");
    if (wfRoot) {
      wfRoot.style.display = isMarketing ? "block" : "none";
      // Belt-and-suspenders: the hidden marketing root must not intercept
      // pointer events or be reachable on React routes.
      wfRoot.style.pointerEvents = isMarketing ? "" : "none";
      wfRoot.setAttribute("aria-hidden", isMarketing ? "false" : "true");
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
            onBackToMarketing={() => goTo("marketing")}
            initialEmail={passedEmail}
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
        return <RateQuizPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "refi-tracker":
        return <RefiTrackerPage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "arm-reset":
        return <ARMPage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "monte-carlo":
        return <MonteCarloPage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "returns":
        return <ReturnsPage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "tax-engine":
        return <TaxEnginePage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "stress-matrix":
        return <StressMatrixPage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "decision-support":
        return <DecisionSupportPage key={pathname} onBack={() => goTo("portal")} onNavigate={goTo} />;
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
      <Suspense fallback={<PageLoader />}>
        <div className="font-sans antialiased text-slate-800">
          <PageRenderer />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}