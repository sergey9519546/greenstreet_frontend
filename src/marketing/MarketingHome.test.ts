import { describe, expect, it } from "vitest";
import { publicMarketingMarkup } from "./MarketingHome";

describe("public marketing reliability holds", () => {
  it("does not ship the unsupported rate-tier or state-rule widgets", () => {
    expect(publicMarketingMarkup).not.toContain("6.25% - 6.75%");
    expect(publicMarketingMarkup).not.toContain("Prepayment-penalty rules, mapped for every state");
    expect(publicMarketingMarkup).toContain("Rate estimates are under review.");
    expect(publicMarketingMarkup).toContain("State-rule conclusions are under review.");
  });

  it("keeps the homepage tool islands on the shared editorial visual system", () => {
    for (const className of [
      "gs-rate-widget-section",
      "gs-rate-widget-copy",
      "gs-rate-widget-card",
      "gs-video-section",
      "gs-statemap-section",
    ]) {
      expect(publicMarketingMarkup).toContain(`class="${className}`);
    }
    expect(publicMarketingMarkup).toContain("Rate estimates are under review.");
    expect(publicMarketingMarkup).toContain("State-rule conclusions are under review.");
  });

  it("preserves the accepted composition without publishing unsupported claims", () => {
    for (const unsupported of [
      "we underwrite and fund in-house",
      "Verified pricing, instant program matching",
      "Verified wholesale DSCR lenders",
      "Best available rate tier",
      "Typical close time",
      "Bank-grade security",
      "Real results from teams using Greenstreet",
      "Trusted by DSCR brokers nationwide.",
      "+1 (555) 010-0000",
      "Underwriter-defensible",
      'name="email-2"',
      "actually fund this file",
      "Instant pricing & scenario run-throughs",
      "50-state rules, always current",
      "Submit clean. Close fast.",
      "Maya Reynolds",
      "Hadley Capital Partners",
      "unified DSCR loan platform",
      "All-in-one platform for non-QM and DSCR lending",
      "The whitepaper will be sent",
      'id="hs-booking"',
      "meetings-iframe-container",
      "static.hsappstatic.net",
      "meetings-na2.hubspot.com",
    ]) {
      expect(publicMarketingMarkup).not.toContain(unsupported);
    }

    expect(publicMarketingMarkup).toContain("DSCR scenario tools for real estate investors");
    expect(publicMarketingMarkup).toContain("Constructed workflow examples");
    expect(publicMarketingMarkup).toContain("Request a Scenario Review");
  });

  it("repairs the legacy export's core landmarks and unnamed controls", () => {
    expect(publicMarketingMarkup).toContain(
      '<a class="gs-skip-link" href="#main-content">Skip to main content</a>',
    );
    expect(publicMarketingMarkup).toMatch(
      /<main class="page_main" id="main-content"[^>]*>/,
    );
    expect(publicMarketingMarkup).toContain('aria-label="Dismiss announcement"');
    expect(publicMarketingMarkup.match(/class="booking-fallback-link" href="\/book-demo"/g)).toHaveLength(2);
    expect(publicMarketingMarkup).toContain(
      'aria-label="Whitepaper form unavailable"',
    );
    expect(publicMarketingMarkup).toContain(
      'aria-label="Open navigation menu"',
    );
    expect(publicMarketingMarkup).toContain(
      'aria-label="Close navigation menu"',
    );
    expect(publicMarketingMarkup).toContain(
      'id="mobile-navigation"',
    );
    expect(publicMarketingMarkup).not.toContain(
      '<form class="hero_form_layout"',
    );
    expect(publicMarketingMarkup).not.toContain(
      '<form class="form_main_list"',
    );
    expect(publicMarketingMarkup).not.toContain(
      '<a class="link-item w-inline-block"',
    );
    expect(publicMarketingMarkup).not.toContain(
      '<a class="cs-abs-link" href=',
    );
    for (const legacyId of [
      "w-node-_099235b4-dc1c-00f9-c99c-0ba16fa92a7f-6fa92a72",
      "w-node-e50e2dd1-20d6-e56c-6108-ddcf65641374-65641360",
      "w-node-d4de036a-7391-1e69-32dd-4db42159330d-21593305",
    ]) {
      expect(publicMarketingMarkup.match(new RegExp(`id="${legacyId}"`, "g"))).toHaveLength(1);
    }
  });
});
