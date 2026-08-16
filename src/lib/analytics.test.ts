// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { isAnalyticsEnabled, initAnalytics, track } from "./analytics";

/**
 * The contract that matters here is the OFF state. An unconfigured build must
 * emit no third-party request and must not throw at any call site, because the
 * build-time sanitizer strips every tracker from index.html on the grounds that
 * analytics stay disabled until a consent owner exists. These lock that in.
 */
describe("analytics is inert until configured", () => {
  afterEach(() => {
    document.head.querySelectorAll("script").forEach((s) => s.remove());
    delete (window as { plausible?: unknown }).plausible;
    vi.unstubAllEnvs();
  });

  it("reports itself disabled when no domain is set", () => {
    // VITE_PLAUSIBLE_DOMAIN is unset in the test env.
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("injects no script when disabled", () => {
    initAnalytics();

    const injected = [...document.head.querySelectorAll("script")].filter((s) =>
      s.src.includes("plausible"),
    );
    expect(injected).toHaveLength(0);
    expect(window.plausible).toBeUndefined();
  });

  it("track() is a silent no-op when disabled rather than throwing", () => {
    expect(() => track("Tool Result", { tool: "dscr-calculator" })).not.toThrow();
    expect(window.plausible).toBeUndefined();
  });

  it("track() swallows an error from a blocked or broken plausible global", () => {
    // An ad blocker can leave a stub that throws. Analytics must never be able
    // to break a page it is only observing.
    (window as unknown as { plausible: () => void }).plausible = () => {
      throw new Error("blocked");
    };

    expect(() => track("Lead Submitted")).not.toThrow();
  });
});
