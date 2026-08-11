import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const dcShell = readSource("src/design/dc.tsx");
const siteShell = readSource("src/design/SiteShell.tsx");
const dscrCalculatorPage = readSource("src/pages/DSCRCalculatorPage.tsx");
const notFoundPage = readSource("src/pages/NotFoundPage.tsx");

// These checks preserve source-level semantic affordances only. They do not
// replace browser, keyboard, screen-reader, contrast, or visual validation.
describe("scoped public accessibility semantics", () => {
  it("gives shared DcShell pages a skip link to a focusable main landmark", () => {
    expect(dcShell).toContain(
      '<a className="gs-skip-link" href="#main-content">Skip to main content</a>',
    );
    expect(dcShell).toContain(
      '<main id="main-content" tabIndex={-1} className="dc-main">',
    );
  });

  it("keeps each shared button label exposed only once", () => {
    expect(dcShell).toMatch(
      /<div className="btn_main_text"[^>]*aria-hidden="true"[^>]*>\{label\}<\/div>/,
    );
    expect(dcShell).toContain('<svg aria-hidden="true" focusable="false"');
  });

  it("does not mark every same-page footer fragment as the current page", () => {
    expect(siteShell).toContain(
      'const current = (href: string) => href.includes("#") ? undefined',
    );
  });

  it("keeps calculator tabs explicitly non-submitting", () => {
    expect(dscrCalculatorPage).toContain(
      'role="tablist" aria-label="Calculator mode"',
    );
    expect(dscrCalculatorPage).toContain(
      "<button type=\"button\" role=\"tab\" aria-selected={tab === 'dscr'}",
    );
    expect(dscrCalculatorPage).toContain(
      "<button type=\"button\" role=\"tab\" aria-selected={tab === 'maxprice'}",
    );
  });

  it("avoids a nested main landmark and labels the not-found section", () => {
    expect(notFoundPage).toContain(
      '<section aria-labelledby="not-found-heading"',
    );
    expect(notFoundPage).toContain('id="not-found-heading"');
    expect(notFoundPage).not.toMatch(/<main(?:\s|>)/);
  });
});
