import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropertyInvestmentStrategySection from "../components/PropertyInvestmentStrategySection";
import { replaceUnverifiedBookingEmbeds } from "./bookingEmbed";
import { CLAIM_REPLACEMENTS } from "./claimReplacements";
import homepageMarkup from "./home-markup.html?raw";

// CLAIM_REPLACEMENTS moved to ./claimReplacements.ts — shared single source
// with the build-time sanitizer (vite.config.ts) and the FTC render-lock
// (scripts/check-ftc-contract.ts). See that file for the ban rationale.

function sanitizeUnsupportedHomepageClaims(markup: string): string {
  return CLAIM_REPLACEMENTS.reduce(
    (result, [unsupported, replacement]) => result.replaceAll(unsupported, replacement),
    markup,
  );
}

function repairHomepageSemantics(markup: string): string {
  let burgerControlIndex = 0;
  let featuredNavNodeIndex = 0;
  let burgerNodeIndex = 0;
  let stepContentNodeIndex = 0;

  return markup
    .replace(
      '<div class="announcement u-container u-theme-light">',
      '<a class="gs-skip-link" href="#main-content">Skip to main content</a><div class="announcement u-container u-theme-light">',
    )
    .replace(
      '<a class="link-block w-inline-block" href="/blog/greenstreet-go-launch"></a>',
      '<a aria-label="Read the InvestGO announcement" class="link-block w-inline-block" href="/blog/greenstreet-go-launch"></a>',
    )
    .replace(
      '<button class="announcement-close" id="">',
      '<button aria-label="Dismiss announcement" class="announcement-close">',
    )
    .replace(
      '<section class="menu-mobile-wrap">',
      '<section aria-hidden="true" aria-label="Mobile navigation" class="menu-mobile-wrap" id="mobile-navigation">',
    )
    .replace(/<div class="burger-wrap"([^>]*)>/g, (_match, attributes) => {
      burgerControlIndex += 1;
      const label =
        burgerControlIndex === 1
          ? "Open navigation menu"
          : "Close navigation menu";
      return `<div aria-controls="mobile-navigation" aria-expanded="false" aria-label="${label}" class="burger-wrap" role="button" tabindex="0"${attributes}>`;
    })
    .replace(
      'href="#"><div class="footer_bottom_link_text u-text-style-small">Cookies Settings</div>',
      'href="/legal/privacy"><div class="footer_bottom_link_text u-text-style-small">Privacy information</div>',
    )
    .replace(
      'name="firstname" placeholder="First name" required=""',
      'aria-label="First name — form unavailable" disabled="" name="firstname" placeholder="Form unavailable"',
    )
    .replace(
      'name="lastname" placeholder="Last name" required=""',
      'aria-label="Last name — form unavailable" disabled="" name="lastname" placeholder="Form unavailable"',
    )
    .replace(
      'name="Email" placeholder="Email" required=""',
      'aria-label="Email — form unavailable" disabled="" name="Email" placeholder="Form unavailable"',
    )
    .replace(
      '<button class="u-btn-group u-mt-7" id="">',
      '<button aria-label="Whitepaper form unavailable" class="u-btn-group u-mt-7" disabled="">',
    )
    .replace(
      /<form class="hero_form_layout"[^>]*>/,
      '<div class="hero_form_layout">',
    )
    .replace(
      '</form><div class="form_main_success_wrap is-hero',
      '</div><div class="form_main_success_wrap is-hero',
    )
    .replace(
      /<form class="form_main_list"[^>]*>/,
      '<div class="form_main_list">',
    )
    .replace(
      '</form><div class="form_main_success_wrap w-form-done',
      '</div><div class="form_main_success_wrap w-form-done',
    )
    .replace(
      /<a class="link-item w-inline-block" href="([^"]+)"><\/a>(<div class="solution_item"[\s\S]*?<div class="list-item-txt u-text-style-large">([^<]+)<\/div>)/g,
      '<a aria-label="$3" class="link-item w-inline-block" href="$1"></a>$2',
    )
    .replace(
      /<a class="cs-abs-link" href="([^"]+)"><\/a>/g,
      '<a aria-hidden="true" class="cs-abs-link" href="$1" tabindex="-1"></a>',
    )
    .replace(
      /<div class="page_main"([^>]*)>/,
      '<main class="page_main" id="main-content" tabindex="-1"$1>',
    )
    .replace(
      '</div><div class="footer_component">',
      '</main><div class="footer_component">',
    )
    .replace(
      / id="w-node-_099235b4-dc1c-00f9-c99c-0ba16fa92a7f-6fa92a72"/g,
      (attribute) => {
        featuredNavNodeIndex += 1;
        return featuredNavNodeIndex === 1
          ? attribute
          : ' style="grid-area:span 2 / span 1 / span 2 / span 1"';
      },
    )
    .replace(
      / id="w-node-e50e2dd1-20d6-e56c-6108-ddcf65641374-65641360"/g,
      (attribute) => {
        burgerNodeIndex += 1;
        return burgerNodeIndex === 1 ? attribute : "";
      },
    )
    .replace(
      / id="w-node-d4de036a-7391-1e69-32dd-4db42159330d-21593305"/g,
      (attribute) => {
        stepContentNodeIndex += 1;
        return stepContentNodeIndex === 1 ? attribute : "";
      },
    );
}

const HELD_RATE_WIDGET = `<section class="gs-rate-widget-section" aria-label="DSCR rate tool availability"><div class="gs-rate-widget-contain"><div class="gs-rate-widget-copy"><div class="eyebrow">Tool availability</div><h2>Rate estimates are under review.</h2><p>We are not displaying rate bands, program tiers, or eligibility conclusions until the underlying pricing data is approved and versioned.</p><a class="gs-rate-widget-cta" href="/dscr-calculator">Open DSCR calculator -&gt;</a></div><div class="gs-rate-widget-card" id="gs-rate-widget-hold"><div class="gs-rate-widget-inner"><div class="gs-rate-widget-top"><div class="gs-rate-widget-kicker">Verification hold</div><div class="gs-rate-widget-progress">Source required</div></div><div><div class="gs-rate-widget-question">No rate or program output is published here.</div></div><div class="gs-rate-widget-options" role="list" aria-label="Requirements before this tool can return results"><div class="gs-rate-widget-option is-selected" role="listitem" aria-disabled="true"><b>Approved rate sheet</b><span>required</span></div><div class="gs-rate-widget-option" role="listitem" aria-disabled="true"><b>Versioned program matrix</b><span>required</span></div><div class="gs-rate-widget-option" role="listitem" aria-disabled="true"><b>Named data owner</b><span>required</span></div><div class="gs-rate-widget-option" role="listitem" aria-disabled="true"><b>Boundary validation</b><span>required</span></div></div><div class="gs-rate-widget-result"><div><small>Status</small><div class="gs-rate-widget-rate">Under review</div></div><div class="gs-rate-widget-pill">No pricing claim</div></div><div class="gs-rate-widget-note">The layout is preserved while unsupported pricing and eligibility output remains disabled.</div></div></div></div></section>`;
const HELD_STATE_MAP = `<section class="gs-statemap-section" aria-label="State rules tool availability"><div class="gs-statemap-contain u-container"><div class="gs-statemap-head"><div class="u-text-style-h5 u-mb-4">Tool availability</div><h2 class="u-text-style-h2">State-rule conclusions are under review.</h2><p class="u-text-style-large gs-statemap-sub">We are not publishing jurisdiction-specific prepayment-penalty conclusions until counsel review, primary sources, and effective dates are complete.</p></div><div class="gs-statemap-grid"><div class="gs-statemap-canvas" id="gs-state-map-root"><div class="gs-statemap-loading">Loading a neutral map…</div></div><div class="gs-statemap-side"><div class="gs-statemap-legend" id="gs-state-map-legend"></div><a class="gs-statemap-cta" href="/dscr-calculator">Open DSCR calculator →</a><div class="gs-statemap-note">No state is classified and no legal conclusion is shown while review is incomplete.</div></div></div></div></section>`;

/**
 * The legacy marketing export includes interactive rate and legal-rule widgets.
 * Preserve its visual shell while replacing those unsupported decision outputs
 * before the markup reaches the DOM (and before embedded scripts can run).
 */
export const publicMarketingMarkup = repairHomepageSemantics(
  replaceUnverifiedBookingEmbeds(sanitizeUnsupportedHomepageClaims(homepageMarkup)),
)
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

function installMobileMenuAccessibility(root: HTMLElement): () => void {
  const controls = Array.from(
    root.querySelectorAll<HTMLElement>(".burger-wrap"),
  );
  const menu = root.querySelector<HTMLElement>("#mobile-navigation");
  const primaryControl = controls[0];
  if (!menu || !primaryControl || controls.length < 2) return () => {};

  let isOpen = false;
  let focusTimer = 0;

  const focusableMenuItems = () =>
    Array.from(
      menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);

  const syncState = (open: boolean) => {
    isOpen = open;
    menu.setAttribute("aria-hidden", String(!open));
    controls.forEach((control) =>
      control.setAttribute("aria-expanded", String(open)),
    );

    window.clearTimeout(focusTimer);
    if (open) {
      focusTimer = window.setTimeout(() => {
        focusableMenuItems()[0]?.focus();
      }, 450);
    }
  };

  const handleControlClick = () => {
    syncState(!isOpen);
  };

  const handleControlKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  };

  const handleDocumentKeydown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      primaryControl.click();
      primaryControl.focus();
      return;
    }

    if (event.key !== "Tab") return;
    const items = focusableMenuItems();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  controls.forEach((control) => {
    control.addEventListener("click", handleControlClick);
    control.addEventListener("keydown", handleControlKeydown);
  });
  document.addEventListener("keydown", handleDocumentKeydown);

  return () => {
    window.clearTimeout(focusTimer);
    controls.forEach((control) => {
      control.removeEventListener("click", handleControlClick);
      control.removeEventListener("keydown", handleControlKeydown);
    });
    document.removeEventListener("keydown", handleDocumentKeydown);
  };
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

function ensureHomepagePropertySlot(root: HTMLElement): HTMLElement | null {
  const existing = root.querySelector<HTMLElement>("#gs-property-types-slot");
  if (existing) return existing;

  const slot = document.createElement("div");
  slot.id = "gs-property-types-slot";
  slot.dataset.homeIntegration = "property-guide";

  // Placed directly after the rate widget and before "Watch the Greenstreet
  // rebuild". The property guide answers "which kind of building is this?",
  // which is the question a reader has immediately after seeing a rate tier and
  // before being asked to watch anything — so it belongs between them rather
  // than buried down beside Resources.
  const videoSection = root.querySelector<HTMLElement>(".gs-video-section");
  if (videoSection?.parentElement) {
    videoSection.before(slot);
    return slot;
  }

  // Fall back to the previous position rather than dropping the section
  // entirely if that section is ever renamed or removed.
  const resourcesHeading = Array.from(root.querySelectorAll("h2")).find(
    (heading) => heading.textContent?.trim() === "Resources",
  );
  const resourcesSection = resourcesHeading?.closest<HTMLElement>(
    ".feature_contain.u-container",
  );
  if (!resourcesSection?.parentElement) return null;

  resourcesSection.before(slot);
  return slot;
}

export default function MarketingHome({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [propertySlot, setPropertySlot] = useState<HTMLElement | null>(null);

  const portalHost =
    typeof document === "undefined"
      ? null
      : document.getElementById("marketing-root");

  useEffect(() => {
    const dynamicRoot = rootRef.current;
    const root = dynamicRoot ?? document.getElementById("webflow-root");
    if (!root) return;

    // The production homepage is restored directly in index.html. Add a stable
    // React island immediately before Resources when the legacy export does not
    // already include the property-guide slot.
    const pSlot = ensureHomepagePropertySlot(root);
    if (pSlot) setPropertySlot(pSlot);

    const runtime = window as MarketingRuntime;
    // The static homepage already parsed its embedded scripts; a React-owned
    // copy has not. In both cases, restart the shared interaction lifecycle
    // after React has mounted so GSAP binds to the final homepage DOM.
    if (dynamicRoot) runEmbeddedScripts(root);
    const removeMobileMenuAccessibility =
      installMobileMenuAccessibility(root);

    const frameId = window.requestAnimationFrame(() => {
      try {
        startMarketingRuntime(runtime);
      } catch (error) {
        console.error("Failed to initialize homepage interactions:", error);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      removeMobileMenuAccessibility();
      try {
        runtime.__gsStopMarketing?.();
      } catch (error) {
        console.error("Failed to tear down homepage interactions:", error);
      }
    };
  }, []);

  return (
    <>
      {portalHost &&
        createPortal(
          <div
            id="webflow-root"
            ref={rootRef}
            dangerouslySetInnerHTML={{ __html: publicMarketingMarkup }}
          />,
          portalHost,
        )}
      {propertySlot &&
        createPortal(
          <PropertyInvestmentStrategySection
            onNavigate={onNavigate}
            variant="homepage"
          />,
          propertySlot,
        )}
    </>
  );
}
