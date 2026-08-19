/**
 * Prerender pipeline (P1): renders every sitemap URL against the built SPA in
 * dist/ and writes a static twin at dist/<path>/index.html, so non-JS
 * crawlers (GPTBot/ClaudeBot/PerplexityBot — all invited by robots.txt)
 * receive real content instead of the empty SPA shell.
 *
 * The capture runs a real headless Chromium against the production build via
 * the same express-static + SPA-fallback + puppeteer pattern as
 * scripts/interaction-qa.mjs. Requests to anything but the local server are
 * aborted: the render is hermetic (no analytics, fonts, CDN, or Firebase
 * round-trips) and captures the public logged-out state a crawler sees.
 *
 * Each twin is the fully rendered document. title/canonical/robots and the
 * route's JSON-LD (BreadcrumbList on tools and blog posts, WebSite on the
 * homepage, plus the static Organization/SoftwareApplication/FAQ schemas from
 * injectSchemaPlugin) are injected client-side by applyRouteMetadata, so they
 * are baked into the static file.
 *
 * Vercel serves the directory index for the clean URL (static files win over
 * the `/(.*)` → /index.html rewrite in vercel.json), so a crawler fetch of
 * `/tools/stress-matrix` returns the twin; unknown paths still fall back to
 * the shell exactly as today.
 *
 * Run: npm run prerender  (requires `vite build` first; `npm run build` does both)
 * Skip: PRERENDER_SKIP=1 npm run build  (constrained build hosts only — the
 *       CI gate will then fail, which is the point: shells must not ship
 *       silently).
 */
import express from "express";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Server } from "node:http";
import puppeteer from "puppeteer";
import type { Browser, Page } from "puppeteer";
import { readSitemapPaths, twinPathFor } from "./prerenderCore";
const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITEMAP = path.join(ROOT, "public", "sitemap.xml");
const SHELL = path.join(DIST, "index.html");

const CONCURRENCY = 4;
const NAVIGATION_TIMEOUT_MS = 30_000;
const CONTENT_TIMEOUT_MS = 15_000;
const SETTLE_MS = 400;

if (process.env.PRERENDER_SKIP === "1") {
  console.log("prerender: PRERENDER_SKIP=1 — skipping static twin generation");
  process.exit(0);
}
if (!existsSync(SHELL)) {
  console.error(`prerender: ${SHELL} not found — run \`vite build\` first (or \`npm run build\`).`);
  process.exit(1);
}

const paths = readSitemapPaths(SITEMAP);
if (paths.length === 0) {
  console.error(`prerender: no <loc> entries in ${SITEMAP}`);
  process.exit(1);
}
console.log(`prerender: ${paths.length} sitemap URLs, output ${path.relative(ROOT, DIST)}`);

// 1. Serve the built app exactly as production does: static first, SPA fallback.
const app = express();
app.use(express.static(DIST));
app.get("*", (_req, res) => res.sendFile(SHELL));
const server: Server = await new Promise((resolve) => {
  const s = app.listen(0, "127.0.0.1", () => resolve(s));
});
const address = server.address();
const port = typeof address === "object" && address ? address.port : 0;
const origin = `http://127.0.0.1:${port}`;

// 2. Headless Chromium — same launch args as scripts/interaction-qa.mjs.
// Preferred engine: puppeteer's bundled Chrome (deterministic on CI). On
// machines where that build can't run (e.g. a missing VC++ runtime on
// Windows), fall back to a system Chrome/Edge install. On serverless build
// hosts (Vercel/AWS-style containers with no system browser and no Chrome
// download), fall back to @sparticuz/chromium's Lambda-compiled binary.
const launchArgs = ["--no-sandbox", "--disable-setuid-sandbox"];
const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/microsoft-edge",
  "/usr/bin/microsoft-edge-stable",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];
const systemEdge = EDGE_CANDIDATES.find((candidate) => existsSync(candidate));
const engines: Array<{ label: string; options: Parameters<typeof puppeteer.launch>[0] }> = [
  { label: "bundled Chrome", options: { headless: true, args: launchArgs } },
  { label: "system Chrome", options: { headless: true, args: launchArgs, channel: "chrome" } },
  ...(systemEdge
    ? [{ label: "system Edge", options: { headless: true, args: launchArgs, executablePath: systemEdge } }]
    : []),
];
let browser: Browser | undefined;
let engineLabel = "";
for (const engine of engines) {
  try {
    browser = await puppeteer.launch(engine.options);
    engineLabel = engine.label;
    break;
  } catch {
    // try the next engine
  }
}
// Serverless fallback: @sparticuz/chromium ships a Chromium build compiled
// for Amazon Linux / Vercel build containers, where bundled Chrome won't
// launch (missing shared libs) and no system browser exists.
if (!browser) {
  try {
    const { default: chromium } = await import("@sparticuz/chromium");
    const { default: puppeteerCore } = await import("puppeteer-core");
    chromium.setGraphicsMode = false;
    browser = (await puppeteerCore.launch({
      args: [...chromium.args, ...launchArgs],
      executablePath: await chromium.executablePath(),
      headless: true,
    })) as unknown as Browser;
    engineLabel = "@sparticuz/chromium (serverless)";
  } catch {
    // fall through to the error below
  }
}
if (!browser) {
  console.error(
    "prerender: no usable Chromium — bundled Chrome, system Chrome, system Edge, and @sparticuz/chromium all failed to launch.",
  );
  console.error(
    "prerender: install one with `npx puppeteer browsers install chrome`, or set PRERENDER_SKIP=1",
    "to ship without static twins (not recommended — the CI gate will fail).",
  );
  server.close();
  process.exit(1);
}
const browserRef: Browser = browser;
console.log(`prerender: engine — ${engineLabel}`);

const results = new Map<string, { ok: boolean; ms: number; error?: string }>();
let cursor = 0;

/** Renders one route and writes its twin. Never throws — failures are reported. */
async function capture(pathname: string, page: Page): Promise<{ ok: boolean; error?: string }> {
  const isHome = pathname === "/";
  try {
    await page.goto(`${origin}${pathname}`, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    // Wait until the app mounted and route metadata was applied — the same
    // signals the CI gate asserts on the captured file, so a capture can only
    // pass the gate if it waited for this. (The homepage portals into
    // #webflow-root and leaves #root empty by design, so only non-home routes
    // wait on #root children.)
    await page.waitForFunction(
      (home: boolean) => {
        if (!document.head.querySelector('script[data-greenstreet-route-metadata="true"]')) return false;
        if (document.title.trim().length === 0) return false;
        if (home) return true;
        const root = document.querySelector("#root");
        return !!root && root.children.length > 0;
      },
      { timeout: CONTENT_TIMEOUT_MS, polling: 200 },
      isHome,
    );
    // Let async panels (ZIP seeds, verdict subtrees) settle before capture.
    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
    const html = await page.evaluate(() => "<!DOCTYPE html>\n" + document.documentElement.outerHTML);
    const twin = twinPathFor(pathname, DIST);
    mkdirSync(path.dirname(twin), { recursive: true });
    writeFileSync(twin, html, "utf8");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err).split("\n")[0] };
  }
}

async function worker(): Promise<void> {
  const page = await browserRef.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") return request.continue();
    return request.abort();
  });
  while (true) {
    const index = cursor++;
    if (index >= paths.length) break;
    const pathname = paths[index];
    const start = Date.now();
    const outcome = await capture(pathname, page);
    results.set(pathname, { ok: outcome.ok, ms: Date.now() - start, error: outcome.error });
  }
  await page.close();
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
await browser.close();
server.close();

for (const [pathname, result] of results) {
  const mark = result.ok ? "ok  " : "FAIL";
  console.log(`${mark} ${pathname} (${result.ms}ms)${result.error ? ` — ${result.error}` : ""}`);
}

const failures = [...results.entries()].filter(([, result]) => !result.ok);
console.log(`prerender: ${paths.length - failures.length}/${paths.length} routes captured as static twins`);
if (failures.length > 0) {
  console.error(`prerender: ${failures.length} route(s) did not render content:`);
  for (const [pathname, result] of failures) console.error(`  - ${pathname}: ${result.error}`);
  process.exit(1);
}
