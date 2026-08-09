import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DSCR_PROGRAMS } from "../data/dscrPrograms";
import { POSTS } from "./BlogPage";

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("public content integrity", () => {
  it("keeps public program language aligned with the canonical registry", () => {
    expect(DSCR_PROGRAMS.map((program) => program.name)).toEqual([
      "Greenstreet Maple",
      "Greenstreet Oak",
      "Greenstreet Birch",
      "Greenstreet Cedar",
      "Greenstreet Aspen",
      "Greenstreet Willow",
      "Greenstreet Magnolia",
    ]);

    expect(source("index.html")).not.toMatch(/\bDSCR Flex\b/);
    expect(source("src/pages/FAQPage.tsx")).not.toMatch(
      /\b(?:Core|Flex|Premier|Global) (?:program|tier)\b/,
    );
    expect(source("src/pages/RateQuizPage.tsx")).not.toMatch(
      /\b(?:DSCR Global|global program)\b/i,
    );
    expect(source("src/pages/DealAnalyzerPage.tsx")).not.toContain(
      "Greenstreet DSCR — Global",
    );
    expect(source("src/pages/SolutionsPage.tsx")).not.toMatch(
      /\b(?:global programs?|Global[^\n]{0,40}non-US investor program)\b/,
    );
    for (const path of [
      "src/pages/BlogPage.tsx",
      "src/pages/CaseStudiesPage.tsx",
      "src/pages/BorrowerProfilesPage.tsx",
    ]) {
      expect(source(path), path).not.toMatch(
        /\b(?:Greenstreet(?: DSCR)?\s+|DSCR\s+)(?:Core|Flex|Premier|Global)\b/,
      );
    }
    expect(source("src/components/PropertyInvestmentStrategySection.tsx"))
      .not.toContain("Core DSCR Asset");
  });

  it("publishes articles under the research organization, not invented people", () => {
    expect(new Set(POSTS.map((post) => post.author))).toEqual(
      new Set(["Greenstreet Research"]),
    );

    expect(source("src/pages/BlogPage.tsx")).not.toMatch(
      /Priya Rao|Sara López|Marcus Chen/,
    );
    const postPage = source("src/pages/BlogPostPage.tsx");
    expect(postPage).not.toMatch(/Priya Rao|Sara López|Marcus Chen/);
    expect(postPage).not.toContain('"@type": "Person"');
  });

  it("labels coarse screening as illustrative instead of a match or quote", () => {
    const quiz = source("src/pages/RateQuizPage.tsx");
    expect(quiz).toContain("Illustrative scenario");
    expect(quiz).not.toContain("Best-match program");

    const analyzer = source("src/pages/DealAnalyzerPage.tsx");
    expect(analyzer).toContain("Illustrative scenarios");
    expect(analyzer).not.toContain("Matched programs");
    expect(analyzer).not.toContain("formal quote");
  });

  it("uses the canonical program count in the products catalog", () => {
    const products = source("src/pages/ProductsPage.tsx");
    expect(products).toContain(
      `Filter all ${DSCR_PROGRAMS.length} published Greenstreet DSCR program profiles`,
    );
    expect(products).not.toMatch(/\b19 published Greenstreet DSCR program profiles\b/);
  });
});
