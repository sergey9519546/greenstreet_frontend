type AnalyticsEventName =
  | "page_view"
  | "cta_click"
  | "qualify_open"
  | "qualify_step_complete"
  | "dscr_calculation_complete"
  | "qualification_complete"
  | "qualify_abandon"
  | "lead_submitted"
  | "lead_submit_error"
  | "meeting_booked"
  | "web_vital";

type AnalyticsValue = string | number | boolean;
type AnalyticsPayload = Record<string, AnalyticsValue | null | undefined>;

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  vector?: {
    load?: (id: string) => void;
    q?: unknown[];
    loaded?: boolean;
  };
  __greenstreetConsentDefaults?: boolean;
  greenstreetAnalyticsConsent?: (granted: boolean) => void;
}

const EVENT_FIELDS: Record<AnalyticsEventName, ReadonlySet<string>> = {
  page_view: new Set(["route", "title", "page_category", "referrer_group"]),
  cta_click: new Set(["cta_id", "placement", "route"]),
  qualify_open: new Set(["source", "route"]),
  qualify_step_complete: new Set(["step_number", "source"]),
  dscr_calculation_complete: new Set(["dscr_band", "ltv_band"]),
  qualification_complete: new Set(["result_category"]),
  qualify_abandon: new Set(["step_number", "source"]),
  lead_submitted: new Set(["lead_id", "source", "route"]),
  lead_submit_error: new Set(["error_code", "step_number", "source"]),
  meeting_booked: new Set(["source", "route"]),
  web_vital: new Set(["metric_name", "metric_value", "rating", "route"]),
};

const FORBIDDEN_FIELD =
  /(^|_)(name|email|phone|address|rent|property|loan|amount|free_text|message|query|search_term|borrower)($|_)/i;
const EMAIL_LIKE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_LIKE = /(?:\D*\d){7,}/;
const CONSENT_KEY = "greenstreet_analytics_consent";
const ANALYTICS_EVENT = "greenstreet:analytics-consent";
const MEETING_EVENT = "greenstreet:meeting-booked";
const MAX_STRING_LENGTH = 160;

const config = {
  enabled: import.meta.env.VITE_ANALYTICS_ENABLED === "true",
  gaMeasurementId: String(import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim(),
  gtmContainerId: String(import.meta.env.VITE_GTM_CONTAINER_ID || "").trim(),
  googleAdsId: String(import.meta.env.VITE_GOOGLE_ADS_ID || "").trim(),
  vectorPixelId: String(import.meta.env.VITE_VECTOR_PIXEL_ID || "").trim(),
  cookieYesClientId: String(import.meta.env.VITE_COOKIEYES_CLIENT_ID || "").trim(),
};

let analyticsConsentGranted = false;
let tagsLoaded = false;
let analyticsInitialized = false;
let lastPageViewKey = "";

function analyticsWindow(): AnalyticsWindow {
  return window as AnalyticsWindow;
}

function ensureConsentDefaults(): void {
  const w = analyticsWindow();
  w.dataLayer = w.dataLayer || [];
  w.gtag =
    w.gtag ||
    ((...args: unknown[]) => {
      w.dataLayer?.push(args);
    });

  if (w.__greenstreetConsentDefaults) return;
  w.__greenstreetConsentDefaults = true;
  w.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500,
  });
}

function appendScript(id: string, src: string): Promise<void> {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("analytics_loader_failed")), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

function loadConsentProvider(): void {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(config.cookieYesClientId)) return;
  void appendScript(
    "cookieyes",
    "https://cdn-cookieyes.com/client_data/" +
      encodeURIComponent(config.cookieYesClientId) +
      "/script.js"
  ).catch(() => {
    // Consent remains denied when the provider cannot load.
  });
}

function loadVector(): void {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(config.vectorPixelId)) return;
  const w = analyticsWindow();
  w.vector = w.vector || { q: [] };
  w.vector.q = w.vector.q || [];
  w.vector.load =
    w.vector.load ||
    ((id: string) => {
      w.vector?.q?.push(["load", [id]]);
    });
  w.vector.load(config.vectorPixelId);
  void appendScript("greenstreet-vector", "https://cdn.vector.co/pixel.js").catch(() => {
    // A failed optional vendor must not affect the application.
  });
}

async function loadConfiguredTags(): Promise<void> {
  if (tagsLoaded || !config.enabled || !analyticsConsentGranted) return;
  tagsLoaded = true;
  const w = analyticsWindow();

  if (/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId)) {
    w.dataLayer?.push({ "gtm.start": Date.now(), event: "gtm.js" });
    await appendScript(
      "greenstreet-gtm",
      "https://www.googletagmanager.com/gtm.js?id=" +
        encodeURIComponent(config.gtmContainerId)
    ).catch(() => undefined);
  } else if (/^G-[A-Z0-9]+$/.test(config.gaMeasurementId)) {
    await appendScript(
      "greenstreet-gtag",
      "https://www.googletagmanager.com/gtag/js?id=" +
        encodeURIComponent(config.gaMeasurementId)
    ).catch(() => undefined);
    w.gtag?.("js", new Date());
    w.gtag?.("config", config.gaMeasurementId, {
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    if (/^AW-\d+$/.test(config.googleAdsId)) {
      w.gtag?.("config", config.googleAdsId, {
        send_page_view: false,
        allow_ad_personalization_signals: false,
      });
    }
  }

  loadVector();
}

function normalizedPayload(
  eventName: AnalyticsEventName,
  payload: AnalyticsPayload
): Record<string, AnalyticsValue> | null {
  const allowedFields = EVENT_FIELDS[eventName];
  const result: Record<string, AnalyticsValue> = {};

  for (const [key, rawValue] of Object.entries(payload)) {
    if (!allowedFields.has(key) || FORBIDDEN_FIELD.test(key)) return null;
    if (rawValue === null || rawValue === undefined) continue;
    if (
      typeof rawValue !== "string" &&
      typeof rawValue !== "number" &&
      typeof rawValue !== "boolean"
    ) {
      return null;
    }
    if (typeof rawValue === "number" && !Number.isFinite(rawValue)) return null;
    if (typeof rawValue === "string") {
      const value = rawValue.trim().slice(0, MAX_STRING_LENGTH);
      if (!value || EMAIL_LIKE.test(value) || PHONE_LIKE.test(value)) return null;
      result[key] = value;
    } else {
      result[key] = rawValue;
    }
  }

  return result;
}

function referrerGroup(): string {
  if (!document.referrer) return "direct";
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) return "internal";
    if (
      /(^|\.)google\.|(^|\.)bing\.|(^|\.)duckduckgo\.|(^|\.)yahoo\./i.test(
        referrer.hostname
      )
    ) {
      return "search";
    }
    if (
      /(^|\.)linkedin\.|(^|\.)facebook\.|(^|\.)instagram\.|(^|\.)x\.com$/i.test(
        referrer.hostname
      )
    ) {
      return "social";
    }
  } catch {
    return "unknown";
  }
  return "referral";
}

export function trackEvent(
  eventName: AnalyticsEventName,
  payload: AnalyticsPayload = {}
): boolean {
  if (!config.enabled || !analyticsConsentGranted) return false;
  const safePayload = normalizedPayload(eventName, payload);
  if (!safePayload) return false;

  const w = analyticsWindow();
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: eventName, ...safePayload });
  return true;
}

export function trackPageView(
  route: string,
  title: string,
  pageCategory = "public"
): void {
  const safeRoute = route.split("?")[0].split("#")[0] || "/";
  if (!/^\/[A-Za-z0-9/_-]*$/.test(safeRoute)) return;
  const key = safeRoute + "|" + pageCategory;
  if (lastPageViewKey === key) return;

  const sent = trackEvent("page_view", {
    route: safeRoute,
    title,
    page_category: pageCategory,
    referrer_group: referrerGroup(),
  });
  if (sent) lastPageViewKey = key;
}

export function setAnalyticsConsent(granted: boolean): void {
  ensureConsentDefaults();
  analyticsConsentGranted = granted === true;
  try {
    window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    // Storage can be unavailable; the in-memory decision still applies.
  }

  analyticsWindow().gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (granted) {
    void loadConfiguredTags().then(() => {
      trackPageView(window.location.pathname, document.title);
    });
  }
}

function installCtaTracking(): void {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const element = target?.closest<HTMLElement>("[data-analytics-cta],a[href]");
      if (!element) return;

      let ctaId = element.dataset.analyticsCta || "";
      if (!ctaId && element instanceof HTMLAnchorElement) {
        try {
          const url = new URL(element.href, window.location.origin);
          if (url.origin !== window.location.origin) return;
          if (!["/rate-quiz", "/dscr-calculator", "/book-demo"].includes(url.pathname)) {
            return;
          }
          ctaId = "route_" + url.pathname.slice(1).replace(/[^a-z0-9]+/gi, "_");
        } catch {
          return;
        }
      }

      if (!/^[A-Za-z0-9_-]{2,80}$/.test(ctaId)) return;
      trackEvent("cta_click", {
        cta_id: ctaId,
        placement: window.location.pathname,
        route: window.location.pathname,
      });
    },
    { passive: true }
  );
}

export function initializeAnalytics(): void {
  if (analyticsInitialized || typeof window === "undefined") return;
  analyticsInitialized = true;
  ensureConsentDefaults();
  loadConsentProvider();
  installCtaTracking();

  window.addEventListener(ANALYTICS_EVENT, (event) => {
    const detail = (event as CustomEvent<{ granted?: unknown }>).detail;
    setAnalyticsConsent(detail?.granted === true);
  });
  window.addEventListener(MEETING_EVENT, () => {
    trackEvent("meeting_booked", {
      source: "hubspot",
      route: window.location.pathname,
    });
  });

  analyticsWindow().greenstreetAnalyticsConsent = setAnalyticsConsent;
  let storedConsent = "";
  try {
    storedConsent = window.localStorage.getItem(CONSENT_KEY) || "";
  } catch {
    storedConsent = "";
  }
  if (storedConsent === "granted") setAnalyticsConsent(true);
}
