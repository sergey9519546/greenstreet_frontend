import { trackEvent } from "./analytics";

type VitalName = "LCP" | "CLS" | "INP";
type VitalRating = "good" | "needs-improvement" | "poor";
type LayoutShiftEntry = PerformanceEntry & { hadRecentInput?: boolean; value?: number };
type InteractionEntry = PerformanceEntry & { duration: number; interactionId?: number };

let initialized = false;

function rating(name: VitalName, value: number): VitalRating {
  if (name === "LCP") return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
  if (name === "CLS") return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
  return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
}

function report(name: VitalName, value: number): void {
  const rounded = name === "CLS" ? Math.round(value * 1000) / 1000 : Math.round(value);
  trackEvent("web_vital", {
    metric_name: name,
    metric_value: rounded,
    rating: rating(name, value),
    route: window.location.pathname,
  });
}

function observeLcp(): void {
  let latest = 0;
  let reported = false;
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const entry = entries[entries.length - 1];
    if (entry) latest = entry.startTime;
  });
  observer.observe({ type: "largest-contentful-paint", buffered: true });

  const flush = () => {
    if (reported || latest <= 0) return;
    reported = true;
    observer.disconnect();
    report("LCP", latest);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush, { once: true });
}

function observeCls(): void {
  let total = 0;
  let reported = false;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) total += entry.value || 0;
    }
  });
  observer.observe({ type: "layout-shift", buffered: true });

  const flush = () => {
    if (reported) return;
    reported = true;
    observer.disconnect();
    report("CLS", total);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush, { once: true });
}

function observeInp(): void {
  let longest = 0;
  let reported = false;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as InteractionEntry[]) {
      if ((entry.interactionId || 0) > 0) longest = Math.max(longest, entry.duration);
    }
  });
  observer.observe({
    type: "event",
    buffered: true,
    durationThreshold: 40,
  } as PerformanceObserverInit);

  const flush = () => {
    if (reported || longest <= 0) return;
    reported = true;
    observer.disconnect();
    report("INP", longest);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush, { once: true });
}

export function initializeWebVitals(): void {
  if (initialized || typeof window === "undefined" || !("PerformanceObserver" in window)) return;
  initialized = true;
  const supported = PerformanceObserver.supportedEntryTypes || [];
  if (supported.includes("largest-contentful-paint")) observeLcp();
  if (supported.includes("layout-shift")) observeCls();
  if (supported.includes("event")) observeInp();
}
