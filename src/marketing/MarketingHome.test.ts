import { describe, expect, it } from "vitest";
import { publicMarketingMarkup } from "./MarketingHome";

describe("public marketing reliability holds", () => {
  it("does not ship the unsupported rate-tier or state-rule widgets", () => {
    expect(publicMarketingMarkup).not.toContain("6.25% - 6.75%");
    expect(publicMarketingMarkup).not.toContain("Prepayment-penalty rules, mapped for every state");
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
    ]) {
      expect(publicMarketingMarkup).not.toContain(unsupported);
    }

    expect(publicMarketingMarkup).toContain("DSCR scenario tools for real estate investors");
    expect(publicMarketingMarkup).toContain("Constructed workflow examples");
    expect(publicMarketingMarkup).toContain("Request a Scenario Review");
  });

  it("keeps legacy pricing, state-law, security, endorsement, and performance claims suppressed", () => {
    for (const unsupported of [
      "Verified wholesale DSCR lenders in the engine — matched by FICO, LTV, DSCR, and property type",
      "Best available rate tier for 740+ FICO, ≤75% LTV files — June 2026 rate sheet pull",
      "PPP and usury rules mapped and updated monthly — including TX, MN, OH, PA, NJ",
      "Built on PPP rules, usury caps, and business-purpose requirements for all 50 states — including TX APR ban, MN HF 3437, OH/PA thresholds, and NJ LLC risk. Updated monthly.",
      "Bank-grade data privacy and secure document storage",
      "Mortgage brokers, lenders, and real estate investors rely on Greenstreet to price loans, run underwriting scenarios, and lock rates across complex rental portfolios.",
      "Est. weekly time saved on manual underwriting",
      "MoM headcount growth enabled",
      "Est. Reduction in Loan Origination Cycle Time",
      "Faster lender program matching ",
      "The DSCR engine. Deterministic. 50-state clean. Underwriter-defensible.",
      "The whitepaper will be sent to your email inbox shortly!",
    ]) {
      expect(publicMarketingMarkup).not.toContain(unsupported);
    }

    for (const requiredDisclosure of [
      "Pricing and provider matching are disabled until governed source data is approved",
      "The calculator uses the visitor’s rate assumption and does not publish current pricing",
      "State conclusions are disabled pending counsel review and effective-date sourcing",
      "State-specific conclusions are withheld until primary sources, effective dates, counsel review, and an accountable update process are complete.",
      "Security controls require documented verification",
      "These are illustrative teaching scenarios, not customer endorsements, verified transactions, pricing claims, or measured performance results.",
      "Illustrative workflow example only; no verified customer performance sample is published.",
      "(Constructed example; not a customer endorsement)",
      "This form is not connected. No information was sent.",
      "The download form is unavailable. Read the overview",
    ]) {
      expect(publicMarketingMarkup).toContain(requiredDisclosure);
    }
  });

  it("repairs the legacy export's core landmarks and unnamed controls", () => {
    expect(publicMarketingMarkup).toContain(
      '<a class="gs-skip-link" href="#main-content">Skip to main content</a>',
    );
    expect(publicMarketingMarkup).toMatch(
      /<main class="page_main" id="main-content" tabindex="-1"[^>]*>/,
    );
    expect(publicMarketingMarkup).toContain('aria-label="Dismiss announcement"');
    expect(publicMarketingMarkup).toContain('id="hs-booking-1"');
    expect(publicMarketingMarkup).toContain('id="hs-booking-2"');
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
