import { describe, expect, it } from "vitest";
import {
  publicMarketingMarkup,
  sanitizeHomepageStepScene,
} from "./MarketingHome";

describe("public marketing homepage cleanup", () => {
  it("replaces unsupported decision widgets with input-led educational tools", () => {
    expect(publicMarketingMarkup).not.toContain("6.25% - 6.75%");
    expect(publicMarketingMarkup).not.toContain("Prepayment-penalty rules, mapped for every state");
    expect(publicMarketingMarkup).toContain("Organize the deal before you apply.");
    expect(publicMarketingMarkup).toContain("Visible assumptions");
    expect(publicMarketingMarkup).toContain(
      "Start with the jurisdiction and verify the source.",
    );
  });

  it("preserves the composition without publishing unsupported proof or speed claims", () => {
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
      "meetings-na2.hubspot.com",
      "MeetingsEmbedCode.js",
      "booking-popup-wrap",
      "/img/logos/trust-",
      "/img/generated/av",
      "/img/logos/testimonial-",
      "/img/logos/case-",
      "Legal hold",
      "No promise",
      "No live rates",
      "No re-entry",
      "Constructed workflow examples",
      "Match lenders",
      "Lock the rate",
      "InvestGO",
      "Nina Patel",
      "Marcus Reed",
      "Daniel Cho",
      "Elena García",
      "Amara Okafor",
    ]) {
      expect(publicMarketingMarkup).not.toContain(unsupported);
    }

    expect(publicMarketingMarkup).toContain(
      "A clearer path to a DSCR loan — from property math to a preliminary request.",
    );
    expect(publicMarketingMarkup).toContain(
      "Borrower request paths Greenstreet is built to support",
    );
    expect(publicMarketingMarkup).toContain(
      "Representative borrower story — fictional example, not a real person or customer endorsement",
    );
    expect(publicMarketingMarkup).toContain("First-rental borrower");
    expect(publicMarketingMarkup).toContain("Portfolio borrower");
    expect(publicMarketingMarkup).toContain("Illustrative request path");
    expect(publicMarketingMarkup).toContain("Start a Loan Request");
    expect(publicMarketingMarkup).toContain("Open the deal workspace");
    expect(publicMarketingMarkup).toContain('href="/apply"');
  });

  it("neutralizes the animated demo without removing its visual stages", () => {
    const legacyScene = `
      const LABELS = ["Run the numbers", "Match lenders", "Rate quiz", "State rules", "Lock the rate"];
      <span class="hf-small">Track-1 DSCR</span>
      <span class="hf-chip">Qualifies</span>
      <span class="hf-rank">1</span><span class="hf-label">Greenstreet — Premier</span><span class="hf-chip">94%</span>
      <span class="hf-rank">2</span><span class="hf-label">Greenstreet — STR Plus</span><span class="hf-chip is-teal">82%</span>
      <span class="hf-rank">3</span><span class="hf-label">Greenstreet — No-Ratio</span><span class="hf-chip is-ghost">68%</span>
      <span>FICO 742</span><span>LTV 72%</span><b>A&minus;</b><span>SFR</span><span>Lease OK</span>
      <span>APR clear</span><span>Bill checked</span><span>LLC risk OK</span>
      <span class="hf-small">Scenario saved</span>
      <span class="hf-metric" data-count="6.875" data-suffix="%" data-dec="3">0.000%</span>
      <span class="hf-small">30-day lock &middot; clean file</span>
    `;
    const safeScene = sanitizeHomepageStepScene(legacyScene);

    for (const unsupported of [
      "Qualifies",
      "Match lenders",
      "Greenstreet — Premier",
      "Greenstreet — STR Plus",
      "Greenstreet — No-Ratio",
      "94%",
      "82%",
      "68%",
      "APR clear",
      "Bill checked",
      "LLC risk OK",
      "0.000%",
      "30-day lock",
    ]) {
      expect(safeScene).not.toContain(unsupported);
    }

    expect(safeScene).toContain("Arithmetic only");
    expect(safeScene).toContain("Request facts");
    expect(safeScene).toContain("Verify current bill");
    expect(safeScene).toContain("Draft saved");
    expect(safeScene).toContain("No rate shown");
    expect(safeScene).toContain("Provider review required");
  });

  it("repairs the legacy export's core landmarks and unnamed controls", () => {
    expect(publicMarketingMarkup).toContain(
      '<a class="gs-skip-link" href="#main-content">Skip to main content</a>',
    );
    expect(publicMarketingMarkup).toMatch(
      /<main class="page_main" id="main-content"[^>]*>/,
    );
    expect(publicMarketingMarkup).toContain('aria-label="Dismiss announcement"');
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

  it("repairs stale internal links from the legacy homepage export", () => {
    for (const stalePath of [
      "/blog/greenstreet-t3-survey-rating",
      "/blog/track-2-dscr",
      "/blog/system-of-action",
      "/case-studies/northshore-nonqm",
      "/legal/privacy",
    ]) {
      expect(publicMarketingMarkup).not.toContain(`href="${stalePath}"`);
    }

    expect(publicMarketingMarkup).toContain('href="/borrower-profiles"');
    expect(publicMarketingMarkup).toContain(
      'href="/legal/privacy-policy"',
    );
    expect(publicMarketingMarkup).toContain(
      'href="/blog/why-no-llm-number-path"',
    );
    expect(publicMarketingMarkup).toContain(
      "What PITIA includes — and why it changes DSCR",
    );
  });
});
