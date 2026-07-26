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
    ]) {
      expect(publicMarketingMarkup).not.toContain(unsupported);
    }

    expect(publicMarketingMarkup).toContain("DSCR scenario tools for real estate investors");
    expect(publicMarketingMarkup).toContain("Constructed workflow examples");
    expect(publicMarketingMarkup).toContain("Request a Scenario Review");
  });
});
