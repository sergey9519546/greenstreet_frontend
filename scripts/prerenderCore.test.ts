import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkTwinHtml, parseSitemapPaths, twinPathFor } from "./prerenderCore";

const OUT = join("tmp", "out");

/** The empty SPA shell every route serves today without prerendering. */
const SHELL = `<!DOCTYPE html>
<html><head><title>DSCR Loans for Rental Property Investors | Greenstreet Finance</title></head>
<body><div id="root"></div></body></html>`;

/** A captured twin for a non-home route. */
const RENDERED_TOOL = `<!DOCTYPE html>
<html><head><title>Stress Matrix | Greenstreet Finance</title>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList"}</script></head>
<body><div id="root"><div class="tool-page"><h1>Stress Matrix</h1></div></div></body></html>`;

/** A captured twin for the homepage (portals into #webflow-root; #root stays empty). */
const RENDERED_HOME = `<!DOCTYPE html>
<html><head><title>Greenstreet Finance | DSCR loan tools for real estate investors</title>
<script type="application/ld+json">{"@type":"WebSite"}</script></head>
<body><div id="webflow-root"><div class="hero">marketing content</div></div><div id="root"></div></body></html>`;

describe("parseSitemapPaths", () => {
  it("extracts deduplicated pathnames from <loc> entries", () => {
    const xml = [
      "<urlset>",
      "<url><loc>https://www.greenstreet.finance/</loc></url>",
      "<url><loc>https://www.greenstreet.finance/tools/stress-matrix</loc></url>",
      "<url><loc>https://www.greenstreet.finance/tools/stress-matrix</loc></url>",
      "<url><loc>https://www.greenstreet.finance/blog/what-is-dscr-how-it-works</loc></url>",
      "</urlset>",
    ].join("");
    expect(parseSitemapPaths(xml)).toEqual(["/", "/tools/stress-matrix", "/blog/what-is-dscr-how-it-works"]);
  });

  it("skips unparseable <loc> values", () => {
    expect(parseSitemapPaths("<urlset><url><loc>not a url</loc></url><url><loc>https://x.test/a</loc></url></urlset>")).toEqual([
      "/a",
    ]);
  });
});

describe("twinPathFor", () => {
  it("maps the root route to <outDir>/index.html", () => {
    expect(twinPathFor("/", OUT)).toBe(join(OUT, "index.html"));
  });

  it("maps nested routes to directory index files", () => {
    expect(twinPathFor("/tools/stress-matrix", OUT)).toBe(join(OUT, "tools", "stress-matrix", "index.html"));
  });

  it("maps trailing slashes and query strings", () => {
    expect(twinPathFor("/tools/", OUT)).toBe(join(OUT, "tools", "index.html"));
    expect(twinPathFor("/tools/x?utm=1", OUT)).toBe(join(OUT, "tools", "x", "index.html"));
  });

  it("rejects traversal and encoded segments", () => {
    expect(() => twinPathFor("/../secret", OUT)).toThrow();
    expect(() => twinPathFor("/a/./b", OUT)).toThrow();
    expect(() => twinPathFor("/a%2Fb", OUT)).toThrow();
  });
});

describe("checkTwinHtml", () => {
  it("fails the empty shell", () => {
    const report = checkTwinHtml("/tools/stress-matrix", SHELL);
    expect(report.ok).toBe(false);
    expect(report.reasons).toContain("#root is empty (SPA never mounted)");
    expect(report.reasons).toContain("twin lacks BreadcrumbList schema (route metadata never applied)");
  });

  it("passes a rendered tool page with a breadcrumb", () => {
    const report = checkTwinHtml("/tools/stress-matrix", RENDERED_TOOL);
    expect(report.ok).toBe(true);
  });

  it("passes a rendered blog post", () => {
    const report = checkTwinHtml("/blog/what-is-dscr-how-it-works", RENDERED_TOOL);
    expect(report.ok).toBe(true);
  });

  it("passes the homepage without requiring a breadcrumb", () => {
    const report = checkTwinHtml("/", RENDERED_HOME);
    expect(report.ok).toBe(true);
  });

  it("requires the WebSite route schema on the homepage", () => {
    const report = checkTwinHtml("/", SHELL.replace("DSCR Loans for Rental Property Investors | Greenstreet Finance", "anything"));
    expect(report.ok).toBe(false);
    expect(report.reasons).toContain("home twin lacks the WebSite route schema (metadata never applied)");
  });

  it("requires the BreadcrumbList schema on non-home routes", () => {
    const withoutBreadcrumb = RENDERED_TOOL.replace('"@type":"BreadcrumbList"', '"@type":"Article"');
    const report = checkTwinHtml("/tools/stress-matrix", withoutBreadcrumb);
    expect(report.ok).toBe(false);
    expect(report.reasons).toContain("twin lacks BreadcrumbList schema (route metadata never applied)");
  });

  it("fails when the title is empty", () => {
    const report = checkTwinHtml("/tools/stress-matrix", RENDERED_TOOL.replace("Stress Matrix | Greenstreet Finance", ""));
    expect(report.ok).toBe(false);
    expect(report.reasons).toContain("twin has no <title> text");
  });

  it("does not false-negative on child attributes containing slashes", () => {
    const tailwind = RENDERED_TOOL.replace('<div class="tool-page">', '<div class="h-1/2 w-2/3">');
    expect(checkTwinHtml("/tools/stress-matrix", tailwind).ok).toBe(true);
  });
});
