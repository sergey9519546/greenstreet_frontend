/**
 * Product analytics — off by default, cookieless when on.
 *
 * Nothing ships until VITE_PLAUSIBLE_DOMAIN is set. That is deliberate: the
 * build-time sanitizer in vite.config.ts strips GTM, GA, Vector.co and
 * CookieYes from index.html on the grounds that analytics stay disabled "until
 * a consent owner, retention policy, and verified production domain are
 * configured". This module does not reopen that door — it is a different kind
 * of tool. Plausible sets no cookies, stores no personal data, and builds no
 * cross-site profile, so it needs no consent banner and reinstates none of what
 * the sanitizer removed.
 *
 * The script is injected here rather than added to index.html so the sanitizer
 * keeps working on a document that genuinely contains no trackers, and so an
 * unconfigured build emits no third-party request at all.
 *
 * NEVER pass personal data to track(). Plausible custom-event properties are
 * for low-cardinality facts about behaviour — which tool ran, which verdict
 * band came back. Not an address, not an email, not a loan amount.
 */

type PlausibleFn = ((event: string, options?: { props?: Record<string, string | number | boolean> }) => void) & {
  q?: unknown[];
};

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
/** Override only when self-hosting. A custom host also needs a CSP edit in vercel.json. */
const HOST = (import.meta.env.VITE_PLAUSIBLE_HOST as string | undefined) ?? "https://plausible.io";

export function isAnalyticsEnabled(): boolean {
  return Boolean(DOMAIN && DOMAIN.trim());
}

let initialized = false;

/**
 * Injects the Plausible script once. Safe to call repeatedly; a no-op when
 * unconfigured, already initialized, or running without a DOM (SSR/tests).
 */
export function initAnalytics(): void {
  if (initialized || !isAnalyticsEnabled() || typeof document === "undefined") return;
  initialized = true;

  // Queue stub, so track() called before the script loads is not lost.
  const stub: PlausibleFn = function plausibleStub(...args: unknown[]) {
    (stub.q = stub.q || []).push(args);
  } as unknown as PlausibleFn;
  window.plausible = window.plausible || stub;

  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = DOMAIN!.trim();
  // script.js follows History API navigation on its own, which is what an SPA
  // with client routing needs — no manual pageview call per route change.
  script.src = `${HOST.replace(/\/$/, "")}/js/script.js`;
  document.head.appendChild(script);
}

/**
 * Records a custom event. No-ops entirely when analytics is not configured, so
 * call sites need no feature check of their own.
 */
export function track(
  event: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (!isAnalyticsEnabled() || typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Analytics must never break a page. A blocked script, an ad blocker, or a
    // failed inject are all normal and none of them are worth an error.
  }
}

/** The events this product actually cares about. Keeps names consistent. */
export const AnalyticsEvent = {
  /** A tool produced a verdict — the engagement signal. */
  ToolResult: "Tool Result",
  /** A lead was accepted by the intake route — the conversion signal. */
  LeadSubmitted: "Lead Submitted",
} as const;
