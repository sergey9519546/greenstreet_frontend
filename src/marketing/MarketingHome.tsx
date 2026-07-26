import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import homepageMarkup from "./home-markup.html?raw";

const CLAIM_REPLACEMENTS = [
  [
    "DSCR financing for real estate investors — qualify on the property’s rental income, not personal income tax returns.",
    "DSCR scenario tools for real estate investors — compare a property’s rental income with its estimated monthly payment.",
  ],
  [
    "Direct DSCR lending for real estate investors, foreign nationals, and short-term-rental hosts — we underwrite and fund in-house.",
    "Educational DSCR modeling for real estate investors, foreign nationals, and short-term-rental hosts — with human review for submitted scenarios.",
  ],
  [
    "Verified pricing, instant program matching, and 50-state rules in one connected workflow.",
    "Transparent scenario math, labeled assumptions, and reliability holds in one connected workflow.",
  ],
  [
    "Run your entire DSCR loan from one unified system — powered by ",
    "Explore a DSCR scenario in one unified workspace — powered by ",
  ],
  [
    "Verified pricing across a full suite of wholesale DSCR programs. Trusted by brokers nationwide.",
    "An illustrative DSCR workflow for brokers and real estate investors.",
  ],
  [
    '<div class="u-text-style-h1">11 lenders</div>',
    '<div class="u-text-style-h1">No live rates</div>',
  ],
  [
    "Verified wholesale DSCR lenders in the engine — matched by FICO, LTV, DSCR, and property type",
    "Pricing and provider matching are disabled until governed source data is approved",
  ],
  [
    '<div class="u-text-style-h1">6.125%</div>',
    '<div class="u-text-style-h1">User-entered</div>',
  ],
  [
    "Best available rate tier for 740+ FICO, ≤75% LTV files — June 2026 rate sheet pull",
    "The calculator uses the visitor’s rate assumption and does not publish current pricing",
  ],
  [
    '<div class="u-text-style-h1">50 states</div>',
    '<div class="u-text-style-h1">Legal hold</div>',
  ],
  [
    "PPP and usury rules mapped and updated monthly — including TX, MN, OH, PA, NJ",
    "State conclusions are disabled pending counsel review and effective-date sourcing",
  ],
  [
    '<div class="u-text-style-h1">21–30 days</div>',
    '<div class="u-text-style-h1">No promise</div>',
  ],
  [
    "Typical close time on a clean DSCR file with verified lender match",
    "No unverified response-time or closing-time commitment is published",
  ],
  [
    "(Composite, based on real Greenstreet broker data)",
    "(Constructed example; not a customer endorsement)",
  ],
  ["Five questions to a real rate tier", "Five questions to organize a scenario"],
  [
    "Answer five questions about your file — FICO, LTV, property type, state, and rent — and get a preliminary rate tier from Greenstreet's matched programs. A preliminary estimate, not a commitment to lend.",
    "Answer five questions about the property and borrower context. Pricing and program conclusions remain unavailable until approved source data is connected.",
  ],
  [
    "Built on PPP rules, usury caps, and business-purpose requirements for all 50 states — including TX APR ban, MN HF 3437, OH/PA thresholds, and NJ LLC risk. Updated monthly.",
    "State-specific conclusions are withheld until primary sources, effective dates, counsel review, and an accountable update process are complete.",
  ],
  [
    "Bank-grade security and privacy that protect your critical transaction data — with smarter underwriting flows that replace invasive oversight and build trust instead of eroding it.",
    "Secure handling requires configured services, least-privilege access, monitoring, and documented retention. Do not submit SSNs, bank records, or identity documents.",
  ],
  [
    "Bank-grade data privacy and secure document storage",
    "Security controls require documented verification",
  ],
  ["Real results from teams using Greenstreet", "Constructed workflow examples"],
  [
    "Mortgage brokers, lenders, and real estate investors rely on Greenstreet to price loans, run underwriting scenarios, and lock rates across complex rental portfolios.",
    "These are illustrative teaching scenarios, not customer endorsements, verified transactions, pricing claims, or measured performance results.",
  ],
  ["Est. weekly time saved on manual underwriting", "Illustrative workflow-time input"],
  ["Greenstreet users", "Illustrative team-size input"],
  ["MoM headcount growth enabled", "Illustrative growth input"],
  ["Legacy Spreadsheets Replaced", "Illustrative systems input"],
  ["Est. Reduction in Loan Origination Cycle Time", "Illustrative cycle-time input"],
  ["Legacy Platforms Replaced", "Illustrative systems input"],
  ["Faster lender program matching ", "Illustrative workflow timing"],
  ["Trusted by DSCR brokers nationwide.", "How to evaluate a DSCR workflow."],
  [
    "June 2026 DSCR rate sheet: where the 6.125% specials actually are",
    "How to review a DSCR rate sheet without treating it as a quote",
  ],
  ["Book a Live Demo", "Request a Scenario Review"],
  ["Learn More Now<br/>+1 (555) 010-0000", "Request a<br/>Scenario Review"],
  ['href="tel:+15550100000"', 'href="/book-demo"'],
  [
    "Based on sampled user sessions over the past 12 months. Results may vary by content complexity, firm setup, and reviewer availability.",
    "Illustrative workflow example only; no verified customer performance sample is published.",
  ],
  [
    "Based on underwriting cycle times across a sample of customers. Results may vary by deal volume, loan complexity, and firm size.",
    "Illustrative workflow example only; no verified underwriting-cycle sample is published.",
  ],
  [
    "Based on sampled onboarding data of customers consolidating systems into Greenstreet. Results may vary.",
    "Illustrative workflow example only; no verified onboarding sample is published.",
  ],
  [
    "Based on annual customer retention across paid subscriptions. Customers are considered churned upon cancellation.",
    "Illustrative workflow example only; no verified retention metric is published.",
  ],
  [
    "The DSCR engine. Deterministic. 50-state clean. Underwriter-defensible.",
    "Educational DSCR scenarios with explicit assumptions and reliability holds.",
  ],
  [
    '<input class="hero_form_field_input form_main_field_input w-input" data-name="Email 2" id="email-2" maxlength="256" name="email-2" placeholder="Enter your work email address" required="" type="email"/>',
    '<div class="hero_form_field_input form_main_field_input w-input" role="note">Email is entered in the secure form</div>',
  ],
] as const;

function sanitizeUnsupportedHomepageClaims(markup: string): string {
  return CLAIM_REPLACEMENTS.reduce(
    (result, [unsupported, replacement]) => result.replaceAll(unsupported, replacement),
    markup,
  );
}

const HELD_RATE_WIDGET = `<section class="gs-rate-widget-section" aria-label="DSCR rate tool availability"><div class="gs-rate-widget-contain"><div class="gs-rate-widget-copy"><div class="eyebrow">Tool availability</div><h2>Rate estimates are under review.</h2><p>We are not displaying rate bands, program tiers, or eligibility conclusions until the underlying pricing data is approved and versioned.</p><a class="gs-rate-widget-cta" href="/dscr-calculator">Open DSCR calculator -&gt;</a></div><div class="gs-rate-widget-card" id="gs-rate-widget-hold"><div class="gs-rate-widget-inner"><div class="gs-rate-widget-top"><div class="gs-rate-widget-kicker">Verification hold</div><div class="gs-rate-widget-progress">Source required</div></div><div><div class="gs-rate-widget-question">No rate or program output is published here.</div></div><div class="gs-rate-widget-options" role="list" aria-label="Requirements before this tool can return results"><div class="gs-rate-widget-option is-selected" role="listitem" aria-disabled="true"><b>Approved rate sheet</b><span>required</span></div><div class="gs-rate-widget-option" role="listitem" aria-disabled="true"><b>Versioned program matrix</b><span>required</span></div><div class="gs-rate-widget-option" role="listitem" aria-disabled="true"><b>Named data owner</b><span>required</span></div><div class="gs-rate-widget-option" role="listitem" aria-disabled="true"><b>Boundary validation</b><span>required</span></div></div><div class="gs-rate-widget-result"><div><small>Status</small><div class="gs-rate-widget-rate">Under review</div></div><div class="gs-rate-widget-pill">No pricing claim</div></div><div class="gs-rate-widget-note">The layout is preserved while unsupported pricing and eligibility output remains disabled.</div></div></div></div></section>`;
const HELD_STATE_MAP = `<section class="gs-statemap-section" aria-label="State rules tool availability"><div class="gs-statemap-contain u-container"><div class="gs-statemap-head"><div class="u-text-style-h5 u-mb-4">Tool availability</div><h2 class="u-text-style-h2">State-rule conclusions are under review.</h2><p class="u-text-style-large gs-statemap-sub">We are not publishing jurisdiction-specific prepayment-penalty conclusions until counsel review, primary sources, and effective dates are complete.</p></div><div class="gs-statemap-grid"><div class="gs-statemap-canvas" id="gs-state-map-root"><div class="gs-statemap-loading">Loading a neutral map…</div></div><div class="gs-statemap-side"><div class="gs-statemap-legend" id="gs-state-map-legend"></div><a class="gs-statemap-cta" href="/dscr-calculator">Open DSCR calculator →</a><div class="gs-statemap-note">No state is classified and no legal conclusion is shown while review is incomplete.</div></div></div></div></section>`;

/**
 * The legacy marketing export includes interactive rate and legal-rule widgets.
 * Preserve its visual shell while replacing those unsupported decision outputs
 * before the markup reaches the DOM (and before embedded scripts can run).
 */
export const publicMarketingMarkup = sanitizeUnsupportedHomepageClaims(homepageMarkup)
  .replace(/<section class="gs-rate-widget-section"[\s\S]*?<\/section><script>[\s\S]*?<\/script>/, HELD_RATE_WIDGET)
  .replace(/<section class="gs-statemap-section"[\s\S]*?<\/section>/, HELD_STATE_MAP);

type MarketingRuntime = Window & {
  Webflow?: {
    ready?: () => void;
    require?: (module: string) => { init?: () => void } | undefined;
  };
  initAnimations?: () => void;
  __gsStartMarketing?: () => void;
  __gsStopMarketing?: () => void;
};

function runEmbeddedScripts(root: HTMLElement) {
  root
    .querySelectorAll<HTMLScriptElement>("script:not([data-react-executed])")
    .forEach((script) => {
      const executable = document.createElement("script");

      for (const { name, value } of Array.from(script.attributes)) {
        executable.setAttribute(name, value);
      }
      executable.dataset.reactExecuted = "true";
      executable.async = false;
      executable.textContent = script.textContent;
      script.replaceWith(executable);
    });
}

function startMarketingRuntime(runtime: MarketingRuntime) {
  // The legacy runtime is parsed before React mounts. Reset its no-DOM startup,
  // then initialize it against the React-owned homepage.
  runtime.__gsStopMarketing?.();
  runtime.Webflow?.ready?.();
  runtime.Webflow?.require?.("ix2")?.init?.();
  runtime.initAnimations?.();
  runtime.__gsStartMarketing?.();
}

export default function MarketingHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const portalHost =
    typeof document === "undefined"
      ? null
      : document.getElementById("marketing-root");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const runtime = window as MarketingRuntime;
    runEmbeddedScripts(root);

    const frameId = window.requestAnimationFrame(() => {
      try {
        startMarketingRuntime(runtime);
      } catch (error) {
        console.error("Failed to initialize homepage interactions:", error);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      try {
        runtime.__gsStopMarketing?.();
      } catch (error) {
        console.error("Failed to tear down homepage interactions:", error);
      }
    };
  }, []);

  if (!portalHost) return null;

  return createPortal(
    <div
      id="webflow-root"
      ref={rootRef}
      dangerouslySetInnerHTML={{ __html: publicMarketingMarkup }}
    />,
    portalHost,
  );
}
