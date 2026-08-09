import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

const app = readSource("src/App.tsx");
const blogPost = readSource("src/pages/BlogPostPage.tsx");
const dcShell = readSource("src/design/dc.tsx");
const faq = readSource("src/pages/FAQPage.tsx");
const indexCss = readSource("src/index.css");
const legal = readSource("src/pages/LegalPage.tsx");
const marketingHome = readSource("src/marketing/MarketingHome.tsx");
const solutions = readSource("src/pages/SolutionsPage.tsx");
const stepScroll = readSource("public/step-scroll.js");

describe("reconciliation accessibility and responsive contracts", () => {
  it("stacks the homepage step rail for small screens and reduced motion", () => {
    expect(indexCss).toContain(
      "@media screen and (max-width: 767px), (prefers-reduced-motion: reduce)",
    );
    expect(indexCss).toMatch(
      /\.step-cards-list\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*!important;[\s\S]*?transform:\s*none\s*!important;/,
    );
    expect(stepScroll).toContain(
      'window.matchMedia("(prefers-reduced-motion: reduce)")',
    );
    expect(stepScroll).toContain('window.matchMedia("(max-width: 767px)")');
    expect(stepScroll).toMatch(
      /if \(useStaticLayout\(\)\) \{[\s\S]*?list\.style\.transform = "none";[\s\S]*?layout\.style\.transition = "none";/,
    );
  });

  it("collapses the legal and solutions content grids on phones", () => {
    expect(legal).toContain(
      ".lg-content-grid { grid-template-columns: 1fr !important; }",
    );
    expect(legal).toContain('className="lg-content-grid"');
    expect(solutions).toContain(
      ".so-close-grid { grid-template-columns: 1fr !important; }",
    );
    expect(solutions).toContain('className="so-close-grid"');
  });

  it("connects every FAQ question to its controlled answer region", () => {
    expect(faq).toContain("const questionId = `faq-question-${i}`;");
    expect(faq).toContain("const panelId = `faq-answer-${i}`;");
    expect(faq).toContain("aria-expanded={open === i}");
    expect(faq).toContain("aria-controls={panelId}");
    expect(faq).toContain('role="region"');
    expect(faq).toContain("aria-labelledby={questionId}");
    expect(faq).toContain("inert={open !== i}");
  });

  it("uses native labelled links for article sharing", () => {
    expect(blogPost).toContain('target="_blank"');
    expect(blogPost).toContain('rel="noopener noreferrer"');
    expect(blogPost).toContain("Share on LinkedIn");
    expect(blogPost).toContain("Share on X");
    expect(blogPost).not.toContain('role="button"');
    expect(blogPost).not.toContain("window.open(href");
  });

  it("labels the top-level application error landmark", () => {
    expect(app).toContain('<main aria-labelledby="application-error-heading"');
    expect(app).toContain('<h2 id="application-error-heading"');
  });

  it("makes the marketing skip-link target programmatically focusable", () => {
    expect(marketingHome).toContain(
      '<main class="page_main" id="main-content" tabindex="-1"$1>',
    );
  });

  it("does not nest a second main landmark when DcShell is embedded", () => {
    expect(dcShell).toContain(
      '<div className="dc-embedded-content">{children}</div>',
    );
    expect(dcShell).toContain(".dc-embedded .dc-embedded-content > section");
    expect(dcShell).not.toMatch(
      /if \(embedded\)[\s\S]*?<main>\{children\}<\/main>[\s\S]*?return \(/,
    );
  });
});
