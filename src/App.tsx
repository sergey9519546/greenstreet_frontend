import React, { useState, useEffect, useRef, Component, lazy, Suspense } from "react";
import QualifyWidget from "./components/QualifyWidget";
import { canonicalRedirectFor, isKnownRoute, pathForView, resolveRoute, type PageView } from "./router/resolve";
import NotFoundPage from "./pages/NotFoundPage";
import SeoHead from "./site/SeoHead";
import { trackPageView } from "./analytics/analytics";
import { depth } from "./theme";

// Keep each route in its own chunk and cache the import promise so React.lazy and
// intent preloading always share one request. A failed preload is cleared so a
// later navigation can retry instead of being permanently poisoned.
function cachedRouteImport<T>(load: () => Promise<T>): () => Promise<T> {
  let request: Promise<T> | undefined;
  return () => {
    if (!request) {
      request = load().catch((error: unknown) => {
        request = undefined;
        throw error;
      });
    }
    return request;
  };
}

const routeModules = {
  ComplianceDashboard: cachedRouteImport(() => import("./components/ComplianceDashboard")),
  DSCRCalculatorPage: cachedRouteImport(() => import("./pages/DSCRCalculatorPage")),
  LenderIntelPage: cachedRouteImport(() => import("./pages/LenderIntelPage")),
  StateLawsPage: cachedRouteImport(() => import("./pages/StateLawsPage")),
  FAQPage: cachedRouteImport(() => import("./pages/FAQPage")),
  BlogPage: cachedRouteImport(() => import("./pages/BlogPage")),
  BlogPostPage: cachedRouteImport(() => import("./pages/BlogPostPage")),
  RateQuizPage: cachedRouteImport(() => import("./pages/RateQuizPage")),
  RefiTrackerPage: cachedRouteImport(() => import("./pages/RefiTrackerPage")),
  ARMPage: cachedRouteImport(() => import("./pages/ARMPage")),
  MonteCarloPage: cachedRouteImport(() => import("./pages/MonteCarloPage")),
  ReturnsPage: cachedRouteImport(() => import("./pages/ReturnsPage")),
  TaxEnginePage: cachedRouteImport(() => import("./pages/TaxEnginePage")),
  StressMatrixPage: cachedRouteImport(() => import("./pages/StressMatrixPage")),
  DecisionSupportPage: cachedRouteImport(() => import("./pages/DecisionSupportPage")),
  STRUnderwritingPage: cachedRouteImport(() => import("./pages/STRUnderwritingPage")),
  PortfolioPage: cachedRouteImport(() => import("./pages/PortfolioPage")),
  DealAnalyzerPage: cachedRouteImport(() => import("./pages/DealAnalyzerPage")),
  BorrowerProfilesPage: cachedRouteImport(() => import("./pages/BorrowerProfilesPage")),
  NonUsInvestorsPage: cachedRouteImport(() => import("./pages/NonUsInvestorsPage")),
  STRHostsPage: cachedRouteImport(() => import("./pages/STRHostsPage")),
  VacationHomesPage: cachedRouteImport(() => import("./pages/VacationHomesPage")),
  BrokersPortalPage: cachedRouteImport(() => import("./pages/BrokersPortalPage")),
  InvestorsPage: cachedRouteImport(() => import("./pages/InvestorsPage")),
  AboutPage: cachedRouteImport(() => import("./pages/AboutPage")),
  CareersPage: cachedRouteImport(() => import("./pages/CareersPage")),
  CaseStudiesPage: cachedRouteImport(() => import("./pages/CaseStudiesPage")),
  LegalPage: cachedRouteImport(() => import("./pages/LegalPage")),
  ProductsPage: cachedRouteImport(() => import("./pages/ProductsPage")),
  PlatformPage: cachedRouteImport(() => import("./pages/PlatformPage")),
  SupportPage: cachedRouteImport(() => import("./pages/SupportPage")),
  SolutionsPage: cachedRouteImport(() => import("./pages/SolutionsPage")),
  BrokersPage: cachedRouteImport(() => import("./pages/BrokersPage")),
  HowItWorks: cachedRouteImport(() => import("./pages/HowItWorks").then(({ HowItWorks }) => ({ default: HowItWorks }))),
} as const;

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
const HowItWorks = lazy(routeModules.HowItWorks);

const routeLoaderByView: Partial<Record<PageView, () => Promise<unknown>>> = {
  portal: routeModules.ComplianceDashboard,
  "dscr-calculator": routeModules.DSCRCalculatorPage,
  "lender-intel": routeModules.LenderIntelPage,
  "state-laws": routeModules.StateLawsPage,
  faq: routeModules.FAQPage,
  blog: routeModules.BlogPage,
  "blog-post": routeModules.BlogPostPage,
  "rate-quiz": routeModules.RateQuizPage,
  "refi-tracker": routeModules.RefiTrackerPage,
  "arm-reset": routeModules.ARMPage,
  "monte-carlo": routeModules.MonteCarloPage,
  returns: routeModules.ReturnsPage,
  "tax-engine": routeModules.TaxEnginePage,
  "stress-matrix": routeModules.StressMatrixPage,
  "decision-support": routeModules.DecisionSupportPage,
  "str-underwriting": routeModules.STRUnderwritingPage,
  portfolio: routeModules.PortfolioPage,
  "deal-analyzer": routeModules.DealAnalyzerPage,
  "borrower-profiles": routeModules.BorrowerProfilesPage,
  "non-us-investors": routeModules.NonUsInvestorsPage,
  "str-hosts": routeModules.STRHostsPage,
  "vacation-homes": routeModules.VacationHomesPage,
  "brokers-partner": routeModules.BrokersPortalPage,
  investors: routeModules.InvestorsPage,
  about: routeModules.AboutPage,
  careers: routeModules.CareersPage,
  "case-studies": routeModules.CaseStudiesPage,
  legal: routeModules.LegalPage,
  products: routeModules.ProductsPage,
  platform: routeModules.PlatformPage,
  support: routeModules.SupportPage,
  solutions: routeModules.SolutionsPage,
  brokers: routeModules.BrokersPage,
  "how-it-works": routeModules.HowItWorks,
};

function preloadView(view: PageView): void {
  routeLoaderByView[view]?.().catch(() => {
    // Navigation remains the retry path; speculative loading should stay silent.
  });
}

function anchorFromEventTarget(target: EventTarget | null): HTMLAnchorElement | null {
  return target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
}

function internalRouteFromAnchor(anchor: HTMLAnchorElement): PageView | null {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("data-external") || anchor.hasAttribute("download")) return null;
  if (anchor.getAttribute("rel")?.split(/\s+/).includes("external")) return null;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || !href.startsWith("/") || href.startsWith("//")) return null;
  return isKnownRoute(href) ? resolveRoute(href) : null;
}

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

function navigateTo(view: PageView, href = pathForView(view)): boolean {
  if (typeof window !== "undefined") {
    // Inner routes deliberately discard the static homepage DOM. Returning home
    // therefore reloads the pristine document instead of showing an empty shell.
    if (view === "marketing" && !document.getElementById("webflow-root")) {
      window.location.assign(href);
      return false;
    }
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  return true;
}

export function detachStaticHomepage(): void {
  if (typeof document === "undefined") return;
  const reactRoot = document.getElementById("root");
  const staleBodyChildren = Array.from(document.body.children).filter((child) => child !== reactRoot);

  if (staleBodyChildren.length > 0) {
    const marketingWindow = window as typeof window & { __gsStopMarketing?: () => void };
    try {
      marketingWindow.__gsStopMarketing?.();
    } catch (error) {
      console.error("Failed to stop marketing animations:", error);
    }

    for (const staleRoot of staleBodyChildren) {
      staleRoot.querySelectorAll<HTMLMediaElement>("video,audio").forEach((media) => {
        media.pause();
        media.removeAttribute("autoplay");
        media.removeAttribute("src");
        media.querySelectorAll("source").forEach((source) => source.removeAttribute("src"));
        media.load();
      });
      staleRoot.querySelectorAll("img,source").forEach((resource) => {
        resource.removeAttribute("src");
        resource.removeAttribute("srcset");
      });
      staleRoot.querySelectorAll("iframe").forEach((frame) => frame.removeAttribute("src"));
      staleRoot.remove();
    }
  }

  document.documentElement.classList.add("is-spa-route");
  if (reactRoot) reactRoot.style.display = "block";
}

// Views where the floating "See if you qualify" pill is suppressed: the logged-in
// portal, and every tool/calculator page (those carry their own prominent qualify
// CTAs, so the overlay just clutters them). It still shows on marketing/persona
// pages, where it's the primary conversion path.
const QUALIFY_WIDGET_EXCLUDED_VIEWS: ReadonlySet<PageView> = new Set([
  "portal", "external", "not-found", "legal", "rate-quiz",
  "dscr-calculator", "lender-intel", "state-laws", "deal-analyzer",
  "refi-tracker", "arm-reset", "monte-carlo", "returns", "tax-engine",
  "stress-matrix", "decision-support", "str-underwriting", "portfolio",
]);

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
        const nextView = resolveRoute(window.location.pathname);
        if (nextView === "marketing" && !document.getElementById("webflow-root")) {
          window.location.reload();
          return;
        }
        setView(nextView);
        setPathname(window.location.pathname);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (view === "external" || view === "not-found") return;
    const timer = window.setTimeout(() => {
      trackPageView(pathname, document.title, view);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, view]);

  // Global link interceptor: any <a href="/internal"> click navigates via
  // React Router instead of doing a full page reload. Unknown paths fall
  // through so external links (HubSpot booking, asset files, etc.) keep working.
  const goTo = (nextView: PageView, href?: string) => {
    if (!navigateTo(nextView, href)) return;
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

  // Preload only when a mouse/pen user hovers a route or a keyboard user focuses
  // it. Delegation also covers links rendered later without adding per-link
  // handlers; touch navigation remains unaffected and simply loads on demand.
  useEffect(() => {
    const onRouteIntent = (event: PointerEvent | FocusEvent) => {
      const anchor = anchorFromEventTarget(event.target);
      if (!anchor) return;
      if (viewRef.current !== "marketing" && anchor.closest("#webflow-root")) return;
      const nextView = internalRouteFromAnchor(anchor);
      if (nextView) preloadView(nextView);
    };

    document.addEventListener("pointerover", onRouteIntent, { passive: true });
    document.addEventListener("focusin", onRouteIntent);
    return () => {
      document.removeEventListener("pointerover", onRouteIntent);
      document.removeEventListener("focusin", onRouteIntent);
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = anchorFromEventTarget(e.target);
      if (!anchor) return;
      // On React (non-marketing) routes, ignore any anchor that lives inside the
      // hidden Webflow marketing root. Those nav/footer links must never drive
      // SPA navigation — they can't be user-clicked while hidden, and blocking
      // them here stops the embedded marketing markup/scripts from hijacking
      // routing on React pages (the V8 route-drift bug).
      if (viewRef.current !== "marketing" && anchor.closest("#webflow-root")) return;
      const nextView = internalRouteFromAnchor(anchor);
      if (!nextView) return;
      const href = anchor.getAttribute("href")!;

      e.preventDefault();
      goToRef.current(nextView, canonicalRedirectFor(href) ?? href);
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
    const reactRoot = document.getElementById("root");

    const w = window as any;
    if (isMarketing) {
      if (reactRoot) reactRoot.style.display = "none";
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
      detachStaticHomepage();
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
      case "how-it-works":
        return <HowItWorks key={pathname} onCTA={() => goTo("rate-quiz")} />;
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
        return null;
      case "not-found":
        return <NotFoundPage />;
    }
  };

  return (
    <ErrorBoundary>
      <SeoHead pathname={pathname} view={view} />
      <div className="font-sans antialiased text-slate-800">
        <Suspense fallback={null}>
          {renderPage()}
        </Suspense>
        {/* QualifyWidget overlays marketing/persona views — not the portal or the
            tool pages (they have their own qualify CTAs). */}
        {!QUALIFY_WIDGET_EXCLUDED_VIEWS.has(view) && <QualifyWidget showTrigger={view !== "borrower-profiles"} />}
      </div>
    </ErrorBoundary>
  );
}
