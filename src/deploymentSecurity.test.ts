// @vitest-environment node

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import viteConfig from "../vite.config";

const OPTIONAL_TRACKER_HOSTS = [
  "cdn-cookieyes.com",
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "cdn.vector.co",
  "static.claydar.com",
  "js.hs-scripts.com",
  "js-na2.hs-scripts.com",
  "hubspotv2.use1-marketplace-1p-apps-prod-red.if.webflow.services",
] as const;

const UNVERIFIED_BOOKING_HOSTS = [
  "static.hsappstatic.net",
  "meetings-na2.hubspot.com",
] as const;

function releaseHtml(): string {
  const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const configFactory = viteConfig as unknown as (environment: Record<string, unknown>) => {
    plugins?: unknown[];
  };
  const config = configFactory({
    command: "build",
    mode: "production",
    isSsrBuild: false,
    isPreview: false,
  });
  const plugins = (config.plugins ?? []).flat(Infinity) as Array<{
    name?: string;
    transformIndexHtml?: (html: string) => string;
  }>;
  const sanitizer = plugins.find((plugin) => plugin?.name === "release-html-sanitizer");

  expect(sanitizer?.transformIndexHtml).toBeTypeOf("function");
  return sanitizer!.transformIndexHtml!(source);
}

function deploymentCsp(path: "../vercel.json" | "../firebase.json") {
  const config = JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as {
    headers: Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    hosting?: {
      headers: Array<{
        source: string;
        headers: Array<{ key: string; value: string }>;
      }>;
    };
  };
  const groups = path === "../firebase.json" ? config.hosting!.headers : config.headers;
  const header = groups
    .flatMap((group) => group.headers)
    .find((candidate) => candidate.key.toLowerCase().startsWith("content-security-policy"));

  expect(header).toBeDefined();
  return header!;
}

describe("release HTML privacy boundary", () => {
  it("keeps raw homepage sources free of the unverified booking integration", () => {
    for (const path of ["../index.html", "./marketing/home-markup.html"] as const) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      for (const host of UNVERIFIED_BOOKING_HOSTS) {
        expect(source, `${path} still references dead booking host ${host}`).not.toContain(host);
      }
      expect(source, `${path} still ships the legacy booking iframe`).not.toContain(
        "meetings-iframe-container",
      );
      expect(source, `${path} still contains the legacy booking script`).not.toContain(
        "getElementById('hs-booking')",
      );
    }

    const entry = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(entry).not.toContain("hubspot_meeting_booked");
  });

  it("removes optional analytics and de-anonymization scripts", () => {
    const html = releaseHtml();

    for (const host of OPTIONAL_TRACKER_HOSTS) {
      expect(html, `release HTML still references ${host}`).not.toContain(host);
    }
    expect(html).not.toContain("google_tags_first_party");
    expect(html).not.toContain("GTM-WB2F5WH6");
    expect(html).not.toContain("hubspot_meeting_booked");
    for (const host of UNVERIFIED_BOOKING_HOSTS) {
      expect(html, `release HTML still references dead booking host ${host}`).not.toContain(host);
    }
    expect(html).not.toContain("meetings-iframe-container");
    expect(html).toContain('class="booking-fallback-link" href="/book-demo"');

    for (const requiredHost of [
      "cdn.prod.website-files.com",
      "cdn.jsdelivr.net",
      "d3e54v103j8qbb.cloudfront.net",
    ]) {
      expect(html, `release HTML removed required host ${requiredHost}`).toContain(requiredHost);
    }
  });

  it("removes the disabled whitepaper form's native submission contract", () => {
    const html = releaseHtml();
    const form = html.match(
      /<form\b[^>]*\bid="wf-form-System-Action-Form"[^>]*>/,
    )?.[0];
    const inertPanel = html.match(
      /<div\b(?=[^>]*\brole="form")(?=[^>]*\bid="wf-form-System-Action-Form")[^>]*>/,
    )?.[0];

    expect(form).toBeUndefined();
    expect(inertPanel).toBeDefined();
    expect(inertPanel).not.toContain("method=");
    expect(inertPanel).not.toContain("action=");
  });
});

describe("hosting content security policy", () => {
  it("keeps Firebase report-only until its target is verified and hardens Vercel", () => {
    const vercel = deploymentCsp("../vercel.json");
    const firebase = deploymentCsp("../firebase.json");

    expect(vercel.key).toBe("Content-Security-Policy");
    expect(firebase.key).toBe("Content-Security-Policy-Report-Only");
    expect(vercel.value).not.toContain("'unsafe-eval'");
    expect(vercel.value).toContain(
      "img-src 'self' data: blob: https://cdn.prod.website-files.com https://d3e54v103j8qbb.cloudfront.net",
    );
    for (const host of OPTIONAL_TRACKER_HOSTS) {
      expect(vercel.value, `CSP still permits ${host}`).not.toContain(host);
    }
    for (const host of UNVERIFIED_BOOKING_HOSTS) {
      expect(vercel.value, `Vercel CSP still permits dead booking host ${host}`).not.toContain(host);
      expect(firebase.value, `Firebase CSP still permits dead booking host ${host}`).not.toContain(host);
    }
  });
});

describe("server bundles do not publish their source maps", () => {
  // dist/ IS the published web root (dist/robots.txt is served as /robots.txt),
  // and Vercel resolves real files before the SPA rewrite — so a .map emitted
  // beside dist/server.cjs is downloadable at /server.cjs.map, and esbuild
  // source maps embed full sourcesContent. server.ts also serves dist/ via
  // express.static, so the standalone host exposes the same files.
  //
  // .vercelignore lists dist/**/*.map and does NOT prevent this: it filters the
  // upload, and the build regenerates the maps into the output afterwards.
  // Asserting on the build script rather than on dist/ keeps this test honest
  // when no build has run.
  it("emits no --sourcemap for bundles written into the published output", () => {
    const pkg = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { scripts: Record<string, string> };

    const distBundles = pkg.scripts.build
      .split("&&")
      .filter((step) => step.includes("esbuild") && step.includes("--outfile=dist/"));

    expect(distBundles.length, "expected the three dist/ esbuild steps").toBe(3);
    for (const step of distBundles) {
      const outfile = /--outfile=(\S+)/.exec(step)?.[1];
      expect(step, `${outfile} still emits a publicly reachable source map`).not.toContain(
        "--sourcemap",
      );
    }
  });
});
