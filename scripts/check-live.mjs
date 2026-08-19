#!/usr/bin/env node
/**
 * check-live.mjs — post-deploy smoke gate for the production origin.
 *
 * The 08-08 audit's meta-rule: "nothing may be marked complete on the basis
 * of a document — completion requires a test that fails when the claim is
 * false, or an observation of the real world." Every contract test in this
 * repo pins the *source*; this script pins the *deployment*. It is the outer
 * ring that would have caught the API outage (404/500 on every route) that
 * the 1,519-test suite never saw.
 *
 * Runs against the live origin and fails non-zero on any regression:
 *   1. /health returns 200 with a JSON body (function boots, not a 5xx)
 *   2. /api/dscr/solve rejects a bad payload with 400 + validation JSON
 *      (proves the function routes AND the Zod gate — not a 404 shell or a
 *      500 crash)
 *   3. /api/leads rejects a bad payload with 400/403 (not 404/500)
 *   4. A prerendered twin returns route-specific text with no JS executed
 *      (proves the AI-crawler layer actually shipped)
 *   5. A known image asset returns 200 with an image content-type (proves
 *      public/ media survived the deploy)
 *   6. og:image is present and under the social-scraper size budget
 *
 * Usage:
 *   node scripts/check-live.mjs                      # defaults to production
 *   LIVE_ORIGIN=https://staging.example.com node scripts/check-live.mjs
 *
 * Exit 0 = all green. Exit 1 = at least one live check failed (prints which).
 */

const ORIGIN = (process.env.LIVE_ORIGIN || "https://www.greenstreet.finance").replace(/\/+$/, "");

// A prerendered blog twin with distinctive, stable body text.
const TWIN_ROUTE = "/blog/dscr-loan-prepayment-penalty-exit-cost";
const TWIN_NEEDLE = "prepayment";
// A committed image asset in public/.
const IMAGE_ROUTE = "/img/logos/testimonial-01-nexus-financial.png";

const OG_IMAGE_BUDGET_BYTES = 1_000_000; // social scrapers cap ~1MB reliably

let failures = 0;

function pass(label, detail = "") {
  console.log(`  ok   ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failures += 1;
  console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
}

async function fetchWithTimeout(url, options = {}, ms = 20_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timer);
  }
}

async function checkHealth() {
  const res = await fetchWithTimeout(`${ORIGIN}/health`);
  if (res.status !== 200) {
    return fail("/health", `expected 200, got ${res.status} — the API function is down`);
  }
  const body = await res.json().catch(() => null);
  if (!body || body.status !== "ok") {
    return fail("/health", "200 but no {status:'ok'} JSON body — function returned a non-API response");
  }
  pass("/health", `200, status ok`);
}

async function checkDscrSolve() {
  const res = await fetchWithTimeout(`${ORIGIN}/api/dscr/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
    body: "{}",
  });
  // A bad payload must 400 with validation JSON. 404 = route missing. 500 = function crashed.
  if (res.status === 404) return fail("/api/dscr/solve", "404 — route never reached the function");
  if (res.status >= 500) return fail("/api/dscr/solve", `${res.status} — function crashed on boot or input`);
  if (res.status !== 400) return fail("/api/dscr/solve", `expected 400 on empty payload, got ${res.status}`);
  const body = await res.json().catch(() => null);
  if (!body || !body.error) return fail("/api/dscr/solve", "400 but no validation error body");
  pass("/api/dscr/solve", "400 validation gate works");
}

async function checkLeads() {
  const res = await fetchWithTimeout(`${ORIGIN}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
    body: "{}",
  });
  if (res.status === 404) return fail("/api/leads", "404 — the lead funnel is broken in production");
  if (res.status >= 500) return fail("/api/leads", `${res.status} — function crashed`);
  // 400 (validation) or 403 (origin guard) both prove the endpoint is alive and fail-closed.
  if (![400, 403].includes(res.status)) {
    return fail("/api/leads", `expected 400/403 on empty payload, got ${res.status}`);
  }
  pass("/api/leads", `${res.status} fail-closed on bad input`);
}

async function checkTwin() {
  const res = await fetchWithTimeout(`${ORIGIN}${TWIN_ROUTE}`, {
    headers: { "User-Agent": "check-live/1.0 (no-js crawler probe)" },
  });
  if (res.status !== 200) return fail("prerender twin", `${TWIN_ROUTE} returned ${res.status}`);
  const html = await res.text();
  // An empty SPA shell has no route-specific body text. A real twin does.
  if (!html.toLowerCase().includes(TWIN_NEEDLE)) {
    return fail("prerender twin", `${TWIN_ROUTE} served a shell with no route content — prerender did not ship`);
  }
  pass("prerender twin", `${TWIN_ROUTE} returns rendered content without JS`);
}

async function checkImage() {
  const res = await fetchWithTimeout(`${ORIGIN}${IMAGE_ROUTE}`);
  if (res.status !== 200) return fail("image asset", `${IMAGE_ROUTE} returned ${res.status} — public/ media missing`);
  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/")) return fail("image asset", `${IMAGE_ROUTE} returned content-type ${type}`);
  pass("image asset", `${IMAGE_ROUTE} 200, ${type}`);
}

async function checkOgImage() {
  // The og:image URL is referenced from index.html. Read the homepage and find it.
  const res = await fetchWithTimeout(`${ORIGIN}/`);
  if (res.status !== 200) return fail("og:image", `homepage returned ${res.status}`);
  const html = await res.text();
  const match = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
  if (!match) return fail("og:image", "no og:image tag found on homepage");
  let ogUrl = match[1];
  if (ogUrl.startsWith("/")) ogUrl = `${ORIGIN}${ogUrl}`;
  const img = await fetchWithTimeout(ogUrl, { method: "HEAD" }).catch(() => null);
  if (!img) return fail("og:image", `could not fetch ${ogUrl}`);
  if (img.status !== 200) return fail("og:image", `${ogUrl} returned ${img.status} — link previews are blank`);
  const size = Number(img.headers.get("content-length") || 0);
  if (size > OG_IMAGE_BUDGET_BYTES) {
    return fail("og:image", `${ogUrl} is ${(size / 1e6).toFixed(1)}MB — over the ${OG_IMAGE_BUDGET_BYTES / 1e6}MB scraper budget`);
  }
  pass("og:image", `${ogUrl} 200, ${(size / 1e3).toFixed(0)}KB`);
}

console.log(`check-live: smoking ${ORIGIN}\n`);

const checks = [checkHealth, checkDscrSolve, checkLeads, checkTwin, checkImage, checkOgImage];
for (const check of checks) {
  try {
    await check();
  } catch (err) {
    fail(check.name, err instanceof Error ? err.message : String(err));
  }
}

console.log();
if (failures > 0) {
  console.error(`check-live: ${failures} live check(s) FAILED against ${ORIGIN}`);
  process.exit(1);
}
console.log(`check-live: all ${checks.length} live checks passed against ${ORIGIN}`);
