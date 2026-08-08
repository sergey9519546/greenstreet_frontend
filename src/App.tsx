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
  RefiTrackerPage: () => import("./pages/RefiTrackerPage"),
  ARMPage: () => import("./pages/ARMPage"),
  StressMatrixPage: () => import("./pages/StressMatrixPage"),
  PortfolioPage: () => import("./pages/PortfolioPage"),
  StateLawsPage: () => import("./pages/StateLawsPage"),
  STRUnderwritingPage: () => import("./pages/STRUnderwritingPage"),
  TaxEnginePage: () => import("./pages/TaxEnginePage"),
  ReturnsPage: () => import("./pages/ReturnsPage"),
  RateQuizPage: () => import("./pages/RateQuizPage"),
  DealAnalyzerPage: () => import("./pages/DealAnalyzerPage"),
  PerfectPropertyPage: () => import("./pages/PerfectPropertyPage"),
  StructureOptimizerPage: () => import("./pages/StructureOptimizerPage"),
  DecisionSupportPage: () => import("./pages/DecisionSupportPage"),
  MonteCarloPage: () => import("./pages/MonteCarloPage"),
} as const;

// ─── Chunk-load failure ───────────────────────────────────────────────────────
//
// The failure this guards against is ordinary and not rare: a deploy rotates the
// hashed chunk filenames while a tab is still open. Every chunk that tab has not
// already fetched now 404s.
//
// Three things then compounded into a dead tab:
//   1. `React.lazy` caches a REJECTION permanently. Once a lazy component's
//      importer rejects even once, every later render of that component rethrows
//      the same error for the lifetime of the page — the network recovering does
//      not help, because the importer is never called again.
//   2. `warmAllRoutes` swallowed every failure with `.catch(() => {})`, so all
//      25 chunks could fail with no console line and no Sentry event. The first
//      visible symptom was the error screen, with nothing upstream to explain it.
//   3. The error screen's only action was `window.history.back()` — SPA history,
//      which re-fetches nothing. It could not clear a chunk failure, so the
//      recovery button was guaranteed not to recover.
//
// Fix: retry a chunk-load failure once before surfacing it, and when it does
// surface, reload the document (a real fetch of the new manifest) exactly once
// per session so a stale tab heals itself instead of dead-ending.
const CHUNK_RELOAD_KEY = "gs:chunk-reloaded";

/** True for the several shapes browsers and bundlers use for "chunk didn't load". */
export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { name?: string; message?: string };
  const text = `${e.name ?? ""} ${e.message ?? ""}`;
  return /ChunkLoadError|Loading chunk \d+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|dynamically imported module/i.test(
    text,
  );
}

/**
 * Import with one retry on a chunk-load failure.
 *
 * A transient blip (flaky connection, a CDN edge mid-rotation) resolves on the
 * second attempt and costs the user nothing. Only a genuine miss — the chunk is
 * really gone — reaches React.lazy, and by then a reload is the correct answer.
 * Non-chunk errors are rethrown immediately; retrying a module that throws while
 * evaluating would just run its side effects twice.
 */
export function importWithRetry<T>(load: () => Promise<T>, attemptsLeft = 2, delayMs = 400): Promise<T> {
  return load().catch((err: unknown) => {
    if (attemptsLeft <= 1 || !isChunkLoadError(err)) throw err;
    return new Promise<T>((resolve, reject) => {
      setTimeout(() => importWithRetry(load, attemptsLeft - 1, delayMs * 2).then(resolve, reject), delayMs);
    });
  });
}

type RouteKey = keyof typeof routeModules;
/** The default export of one route module, resolved per key. */
type RouteComponent<K extends RouteKey> = Awaited<ReturnType<(typeof routeModules)[K]>>["default"];

/**
 * `lazy` for a route chunk, with the retry above applied to its importer.
 *
 * The indexed access `routeModules[key]` widens to a union of all 25 importer
 * signatures, and `lazy` then resolves that union to its first member — every
 * page would type-check against ComplianceDashboard's props. The cast pins the
 * importer back to the one key was called with; `RouteComponent<K>` keeps the
 * returned component's props exact at every call site.
 */
function lazyRoute<K extends RouteKey>(key: K): React.LazyExoticComponent<RouteComponent<K>> {
  const load = routeModules[key] as () => Promise<{ default: RouteComponent<K> }>;
  return lazy(() => importWithRetry(load)) as React.LazyExoticComponent<RouteComponent<K>>;
}

let _warmed = false;
function warmAllRoutes() {
  if (_warmed || typeof window === "undefined") return;
  _warmed = true;

  const entries = Object.entries(routeModules);
  const failures: string[] = [];
  Promise.all(
    entries.map(([name, load]) =>
      (load() as Promise<unknown>).catch((err: unknown) => {
        failures.push(name);
        return err;
      }),
    ),
  ).then(() => {
    if (failures.length === 0) {
      // Everything the deploy serves is reachable from this tab, so a past
      // self-heal is spent. Clearing it lets a LATER deploy heal itself too —
      // without this, one reload per session would be all a tab ever gets.
      try { window.sessionStorage.removeItem(CHUNK_RELOAD_KEY); } catch { /* storage may be blocked */ }
      return;
    }
    // Warming failing is the earliest possible signal that this tab is running
    // against a rotated deploy. It used to be discarded entirely.
    const summary = `[Greenstreet] ${failures.length}/${entries.length} route chunks failed to prefetch: ${failures.join(", ")}`;
    console.warn(summary);
    captureException(new Error(summary));
  });
}

const ComplianceDashboard = lazyRoute("ComplianceDashboard");
const DSCRCalculatorPage = lazyRoute("DSCRCalculatorPage");
const LenderIntelPage = lazyRoute("LenderIntelPage");
const FAQPage = lazyRoute("FAQPage");
const BlogPage = lazyRoute("BlogPage");
const BlogPostPage = lazyRoute("BlogPostPage");
const BorrowerProfilesPage = lazyRoute("BorrowerProfilesPage");
const NonUsInvestorsPage = lazyRoute("NonUsInvestorsPage");
const STRHostsPage = lazyRoute("STRHostsPage");
const VacationHomesPage = lazyRoute("VacationHomesPage");
const BrokersPortalPage = lazyRoute("BrokersPortalPage");
const InvestorsPage = lazyRoute("InvestorsPage");
const AboutPage = lazyRoute("AboutPage");
const CareersPage = lazyRoute("CareersPage");
const CaseStudiesPage = lazyRoute("CaseStudiesPage");
const LegalPage = lazyRoute("LegalPage");
const ProductsPage = lazyRoute("ProductsPage");
const PlatformPage = lazyRoute("PlatformPage");
const SupportPage = lazyRoute("SupportPage");
const SolutionsPage = lazyRoute("SolutionsPage");
const BrokersPage = lazyRoute("BrokersPage");
const BookDemoPage = lazyRoute("BookDemoPage");
const CommercialDSCRPage = lazyRoute("CommercialDSCRPage");
const ConstructionBridgePage = lazyRoute("ConstructionBridgePage");
const TCOThresholdPage = lazyRoute("TCOThresholdPage");
const RefiTrackerPage = lazyRoute("RefiTrackerPage");
const ARMPage = lazyRoute("ARMPage");
const StressMatrixPage = lazyRoute("StressMatrixPage");
const PortfolioPage = lazyRoute("PortfolioPage");
const StateLawsPage = lazyRoute("StateLawsPage");
const STRUnderwritingPage = lazyRoute("STRUnderwritingPage");
const TaxEnginePage = lazyRoute("TaxEnginePage");
const ReturnsPage = lazyRoute("ReturnsPage");
const RateQuizPage = lazyRoute("RateQuizPage");
const DealAnalyzerPage = lazyRoute("DealAnalyzerPage");
const PerfectPropertyPage = lazyRoute("PerfectPropertyPage");
const StructureOptimizerPage = lazyRoute("StructureOptimizerPage");
const DecisionSupportPage = lazyRoute("DecisionSupportPage");
const MonteCarloPage = lazyRoute("MonteCarloPage");

// ─── Error Boundary ────────────────────────────────────────────────────────────
// Users get a plain-language recovery message; the raw error text lives behind a
// collapsed <details> for anyone who wants to paste it into a support thread. The
// full error + component stack always goes to the console and Sentry (if wired),
// so hiding it from the page costs nothing diagnostically.
/** Reads through a try/catch — sessionStorage throws outright in some privacy modes. */
function hasAlreadyReloadedForChunk(): boolean {
  try { return window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1"; } catch { return false; }
}
function markReloadedForChunk(): void {
  try { window.sessionStorage.setItem(CHUNK_RELOAD_KEY, "1"); } catch { /* storage may be blocked */ }
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Greenstreet] Unhandled UI error:", error, info?.componentStack);
    captureException(error);

    // A chunk that is really gone cannot be recovered inside this document:
    // React.lazy has cached the rejection and will rethrow it forever. Reloading
    // fetches the current manifest and fixes it. Guarded by sessionStorage so a
    // chunk that is broken rather than merely stale cannot spin the tab in a
    // reload loop — the second failure falls through to the message below.
    if (isChunkLoadError(error) && !hasAlreadyReloadedForChunk()) {
      markReloadedForChunk();
      window.location.reload();
    }
  }

  render() {
    const error = this.state.error;
    if (error) {
      const technical = [
        `${error.name || "Error"}: ${error.message || "(no message)"}`,
        error.stack ? error.stack.split("\n").slice(1, 6).join("\n") : "",
      ].filter(Boolean).join("\n");
      // A stale chunk needs a document reload, not SPA history. "Go back" only
      // moves within this document, which has already cached the failure, so
      // offering it here would be offering an action that cannot work.
      const stale = isChunkLoadError(error);
      return (
        <div style={{ minHeight: "100vh", background: depth.browse.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.family }}>
          <div style={{ maxWidth: "520px", padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }} aria-hidden="true">⚠</div>
            <h2 style={{ color: depth.browse.ink, fontSize: "24px", marginBottom: "12px" }}>
              {stale ? "This tab is running an older version" : "This page didn't load"}
            </h2>
            <p style={{ color: swatch.rainforest, marginBottom: "24px", lineHeight: 1.55 }}>
              {stale
                ? "We shipped an update while this tab was open, so part of the page it was reaching for is no longer there. Reloading picks up the current version. Nothing you entered was sent anywhere."
                : "Something went wrong on our side — nothing you did caused it, and no information you entered was sent anywhere. Going back and retrying usually clears it."}
            </p>
            <button
              onClick={() => {
                if (stale) { markReloadedForChunk(); window.location.reload(); return; }
                this.setState({ error: null });
                window.history.back();
              }}
              style={{ background: swatch.lemon, color: swatch.midnight, border: "none", borderRadius: radius.sm, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: "15px" }}>
              {stale ? "Reload the page" : "Go back"}
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
    case "perfect-property":  return "/tools/perfect-property";
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
    // Exhaustive over PageView (verified: every union member has a case
    // above), but a 42-arm switch without a default isn't something TS proves
    // exhaustive reliably. Fail closed to the marketing route rather than
    // let a future desync between PageView and this switch return undefined
    // into a pushState call.
    default: return "/";
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
        return <BookDemoPage key={pathname} onNavigate={goTo} />;
      case "not-found":
        return <NotFoundPage key={pathname} onNavigate={goTo} />;
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
      case "commercial-dscr":
        return <CommercialDSCRPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "construction-bridge":
        return <ConstructionBridgePage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "tco-threshold":
        return <TCOThresholdPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "perfect-property":
        return <PerfectPropertyPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "str-underwriting":
        return <STRUnderwritingPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "structure-optimizer":
        return <StructureOptimizerPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
      case "portfolio":
        return <PortfolioPage key={pathname} onBack={() => goTo("marketing")} onNavigate={goTo} />;
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
