import { describe, expect, it } from "vitest";
import sitemap from "../../public/sitemap.xml?raw";

describe("public sitemap", () => {
  it("publishes every bounded public tool route", () => {
    for (const path of [
      "/deal-analyzer",
      "/rate-quiz",
      "/state-laws",
      "/tools/decision-support",
      "/tools/structure-optimizer",
      "/tools/tax-engine",
      "/tools/refi-tracker",
      "/tools/portfolio",
      "/tools/monte-carlo",
      "/tools/arm-reset",
      "/tools/returns",
      "/tools/stress-matrix",
      "/tools/str-underwriting",
    ]) {
      expect(sitemap).toContain(`<loc>https://www.greenstreet.finance${path}</loc>`);
    }
  });

  it("publishes canonical legal routes and excludes noindex placeholders", () => {
    expect(sitemap).toContain("<loc>https://www.greenstreet.finance/apply</loc>");
    expect(sitemap).not.toContain("<loc>https://www.greenstreet.finance/book-demo</loc>");
    expect(sitemap).toContain("<loc>https://www.greenstreet.finance/legal/privacy-policy</loc>");
    expect(sitemap).toContain("<loc>https://www.greenstreet.finance/legal/terms-of-service</loc>");
    expect(sitemap).not.toContain("<loc>https://www.greenstreet.finance/privacy-policy</loc>");
    expect(sitemap).not.toContain("<loc>https://www.greenstreet.finance/terms-of-service</loc>");
    expect(sitemap).not.toContain("<loc>https://www.greenstreet.finance/careers</loc>");
    expect(sitemap).not.toContain("<loc>https://www.greenstreet.finance/case-studies/vela-capital</loc>");
  });
});
