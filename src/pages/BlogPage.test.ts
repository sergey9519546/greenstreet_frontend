import { describe, expect, it } from "vitest";
import { POSTS } from "./BlogPage";

describe("public editorial reliability", () => {
  it("holds provider-specific guidance behind current qualified review", () => {
    const revisedSlugs = [
      "dscr-pitia-breakdown-qualifying-income",
      "dscr-ltv-down-payment-fico",
      "dscr-refinance-rate-term-cashout-seasoning",
      "dscr-approval-issues-sub-10-fico-reserves",
      "dscr-foreign-nationals-itin",
      "dscr-loan-document-checklist",
      "dscr-loan-process-after-prequalify",
      "how-to-improve-dscr-before-applying",
    ];

    const renderedBodies = new Set<string>();
    for (const slug of revisedSlugs) {
      const post = POSTS.find((candidate) => candidate.slug === slug);
      expect(post, slug).toBeDefined();
      expect(post?.summary, slug).toMatch(/provider|approval|eligibility|advice/i);
      const body = JSON.stringify(post?.body);
      expect(body, slug).toContain(
        "current, dated eligibility and pricing materials",
      );
      renderedBodies.add(body);
    }
    expect(renderedBodies.size).toBe(revisedSlugs.length);
  });
});
