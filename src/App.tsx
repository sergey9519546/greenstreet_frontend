import React, { useState, useEffect, Component, lazy, Suspense } from "react";

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
    case "portal":            return "/dscrgo";
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
      goTo(resolveRoute(href));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [goTo]);

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
    if (wfRoot) wfRoot.style.display = isMarketing ? "block" : "none";
    if (reactRoot) reactRoot.style.display = isMarketing ? "none" : "block";

    if (isMarketing && typeof (window as any).initAnimations === "function") {
      setTimeout(() => {
        try {
          (window as any).initAnimations();
        } catch (e) {
          console.error("Failed to re-initialize marketing animations:", e);
        }
      }, 50);
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
        return <DSCRCalculatorPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "lender-intel":
        return <LenderIntelPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "state-laws":
        return <StateLawsPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "faq":
        return <FAQPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "blog":
        return <BlogPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "case-studies":
        return <CaseStudiesPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "rate-quiz":
        return <RateQuizPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "deal-analyzer":
        return <DealAnalyzerPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "borrower-profiles":
        return <BorrowerProfilesPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "brokers":
        return <BrokersPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "brokers-partner":
        return <BrokersPortalPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "investors":
        return <InvestorsPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "about":
        return <AboutPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "careers":
        return <CareersPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "legal":
        return <LegalPage key={pathname} path={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "products":
        return <ProductsPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "solutions":
        return <SolutionsPage onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "refi-tracker":
        return <RefiTrackerPage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "arm-reset":
        return <ARMPage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "monte-carlo":
        return <MonteCarloPage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "returns":
        return <ReturnsPage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "tax-engine":
        return <TaxEnginePage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "stress-matrix":
        return <StressMatrixPage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "decision-support":
        return <DecisionSupportPage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "str-underwriting":
        return <STRUnderwritingPage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "portfolio":
        return <PortfolioPage onBack={() => goTo("portal")} onNavigate={goTo} />;
      case "external":
        if (typeof window !== "undefined") {
          window.location.href = "https://www.greenstreet.com";
        }
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <div className="font-sans antialiased text-slate-800">
          {renderPage()}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}