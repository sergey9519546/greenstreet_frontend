import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

function readSource(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

function expectPublicAsset(path: string): void {
  expect(existsSync(resolve(repositoryRoot, "public", path))).toBe(true);
}

describe("live static asset references", () => {
  it("ships every unique scene and video poster used by public pages", () => {
    for (const path of [
      "img/generated/scenes/office-window-team.png",
      "img/generated/scenes/underwriting-desk-velocity.png",
      "img/generated/scenes/residential-townhomes.png",
      "video/scenes/cs-vela-poster.jpg",
      "video/scenes/cs-northshore-poster.jpg",
      "video/scenes/cs-quintero-poster.jpg",
      "video/scenes/cs-aurora-poster.jpg",
    ]) {
      expectPublicAsset(path);
    }
  });

  it("uses canonical assets for historical scene aliases", () => {
    const borrowerProfiles = readSource("src/pages/BorrowerProfilesPage.tsx");
    const caseStudies = readSource("src/pages/CaseStudiesPage.tsx");
    const careers = readSource("src/pages/CareersPage.tsx");

    expect(borrowerProfiles).toContain("/img/resources/financial_dashboard.png");
    expect(caseStudies).toContain("/img/resources/dscr-rate-sheet.png");
    expect(caseStudies).toContain("/img/resources/residential_townhouse.png");
    expect(careers).toContain("/img/resources/commercial_building.png");
  });

  it("does not leave the unshipped Quintero logo in raw homepage markup", () => {
    const markup = readSource("src/marketing/home-markup.html");

    expect(markup).not.toContain("/img/logos/cs-quintero-co.png");
    expect(markup).toContain("/img/logos/case-03-hadley-capital-partners.png");
  });
});
