/**
 * Route integrity tests.
 *
 * This project has repeatedly shipped one shape of bug: a value that should
 * have a single source of truth existed as multiple hand-maintained copies
 * that silently drifted apart. For routing specifically, that once showed up
 * as `brokers-partner` — a view declared in the PageView union, rendered by
 * App.tsx, and advertised by the SEO layer, but which NO path in resolve.ts
 * actually resolved to. It was dead code the SEO layer kept advertising,
 * findable only by reading source, not by clicking anything or running the
 * suite that existed at the time.
 *
 * This file pins four invariants meant to make that whole CLASS of bug fail
 * loudly in CI instead of waiting for a human to trip over it:
 *
 *   1. No orphaned views      — every PageView has a real path that resolves to it.
 *   2. Every view renders     — every PageView has a case in App.tsx's render switch.
 *   3. viewToPath round-trips — resolveRoute(viewToPath(view)) circles back to view.
 *   4. No dead internal links — every href="/…" in the shipped marketing markup
 *                                resolves to a real view.
 *
 * App.tsx and resolve.ts are read-only from this file (both are owned by
 * other work in flight, and resolve.ts's ROUTE_MAP is intentionally not
 * exported). Invariants 2 and 3 need App.tsx's internals, so they read its
 * source TEXT rather than importing behavior — viewToPath() isn't exported
 * and this file may not add an export to get one. That is source inspection,
 * not behavioral testing; each section says so at the point it does it.
 *
 * Every exemption below carries a written reason and what would make it
 * non-exempt. An exemption list without reasons is how the original bugs
 * survived undetected for as long as they did.
 */

import { describe, expect, it } from "vitest";
import { resolveRoute, type PageView } from "./resolve";
import appSource from "../App.tsx?raw";
import indexHtml from "../../index.html?raw";
import homeMarkupHtml from "../marketing/home-markup.html?raw";

// ─────────────────────────────────────────────────────────────────────────
// Shared ground truth: one path per PageView that resolveRoute() should map
// back to that view, or `null` for the views this project has deliberately
// decided are unreachable by design (each with its reason inline).
//
// The `Record<PageView, string | null>` annotation is load-bearing, not
// decorative: TypeScript requires an object literal assigned to a Record
// over a union of string literals to have EVERY member as a key — no more,
// no fewer. That means `npx tsc --noEmit` fails the moment PageView gains or
// loses a member and this map isn't updated to match, independent of
// whether `npx vitest run` ever gets invoked. The runtime checks below are
// what prove each witness path actually resolves to the view it claims to.
//
// Ordered to match the PageView union's declaration order in resolve.ts, so
// the two can be diffed by eye.
// ─────────────────────────────────────────────────────────────────────────
const WITNESS_PATH: Record<PageView, string | null> = {
  marketing: "/",
  portal: "/investgo",
  "dscr-calculator": "/dscr-calculator",
  "lender-intel": "/lender-intel",
  "state-laws": "/state-laws",
  "deal-analyzer": "/deal-analyzer",
  "borrower-profiles": "/borrower-profiles",
  "non-us-investors": "/non-us-investors",
  "str-hosts": "/str-airbnb",
  "vacation-homes": "/vacation-homes",
  brokers: "/brokers",
  investors: "/investors",
  faq: "/faq",
  blog: "/blog",
  // No static ROUTE_MAP entry maps to "blog-post" — it is ONLY reachable
  // through the `/blog/` dynamic prefix handler, which is exactly what this
  // witness needs to exercise (see the "cover both" section further down).
  "blog-post": "/blog/some-post",
  // "/case-studies" (no trailing slug) already resolves to "case-studies" via
  // the static ROUTE_MAP entry. This witness deliberately uses a slugged path
  // instead, so the assertion below exercises the `/case-studies/` dynamic
  // prefix handler rather than only ever hitting the static map.
  "case-studies": "/case-studies/some-study",
  "rate-quiz": "/rate-quiz",
  // resolveRoute() only ever PRODUCES "external" for a cross-origin href; it
  // is a classification of a request, never itself a routed path. No path
  // belongs here. See "resolveRoute — exempt view mechanisms" below, which
  // verifies the actual mechanism instead of just skipping this view.
  external: null,
  "refi-tracker": "/tools/refi-tracker",
  "arm-reset": "/tools/arm-reset",
  "monte-carlo": "/tools/monte-carlo",
  returns: "/tools/returns",
  "tax-engine": "/tools/tax-engine",
  "stress-matrix": "/tools/stress-matrix",
  "structure-optimizer": "/tools/structure-optimizer",
  "decision-support": "/tools/decision-support",
  "str-underwriting": "/tools/str-underwriting",
  portfolio: "/tools/portfolio",
  "commercial-dscr": "/tools/commercial-dscr",
  "construction-bridge": "/tools/construction-bridge",
  "tco-threshold": "/tools/tco-threshold",
  about: "/about",
  careers: "/careers",
  legal: "/legal",
  products: "/products",
  platform: "/products/platform",
  support: "/support",
  solutions: "/solutions",
  "book-demo": "/book-demo",
  "perfect-property": "/tools/perfect-property",
  // The fallback resolveRoute() returns when nothing else matches — by
  // construction, no path is "the" path that produces it (every unregistered
  // path does). See "resolveRoute — exempt view mechanisms" below.
  "not-found": null,
};

// Exhaustive over PageView by construction (WITNESS_PATH's typing above
// guarantees Object.keys(WITNESS_PATH) is exactly the PageView union, or the
// file would not compile). Reused by invariants 2 and 3 below so there is
// only one list of "every view" in this file.
const ALL_VIEWS = Object.keys(WITNESS_PATH) as PageView[];

const EXEMPT_ORPHAN_VIEWS = new Set<PageView>(["external", "not-found"]);

describe("routeIntegrity — invariant 1: no orphaned PageView members", () => {
  it("has a witness path for every view except the two documented exemptions", () => {
    // Belt-and-suspenders over the Record<PageView, ...> typing: tsc enforces
    // that every KEY is present, but not which VALUES are null. If a witness
    // path were quietly changed to null (or a null were quietly given a
    // path) without updating EXEMPT_ORPHAN_VIEWS to match, this catches it.
    const nulledViews = ALL_VIEWS.filter((view) => WITNESS_PATH[view] === null);
    expect(new Set(nulledViews)).toEqual(EXEMPT_ORPHAN_VIEWS);
  });

  for (const view of ALL_VIEWS) {
    const witness = WITNESS_PATH[view];
    if (witness === null) continue; // exempt — covered by the dedicated tests below

    it(`"${view}" is reachable: resolveRoute(${JSON.stringify(witness)}) → "${view}"`, () => {
      expect(resolveRoute(witness)).toBe(view);
    });
  }

  describe("exempt view mechanisms, verified directly rather than skipped silently", () => {
    it('"external" is produced by resolveRoute() for cross-origin hrefs, not by any routed path', () => {
      expect(resolveRoute("https://not-greenstreet.example/anything")).toBe("external");
    });

    it('"not-found" is the fallback for any path with no ROUTE_MAP entry and no matching dynamic prefix', () => {
      expect(resolveRoute("/this-path-is-not-registered-anywhere")).toBe("not-found");
    });
  });

  describe("dynamic prefix handling is independently exercised, not just the static map", () => {
    // Every canonical "/tools/<slug>" witness above ALSO has a static
    // ROUTE_MAP entry (e.g. "/tools/arm-reset"), and resolveRoute() checks
    // `ROUTE_MAP[path]` before it ever reaches the `/tools/` prefix handler's
    // slug switch — so those witnesses never actually exercise the dynamic
    // branch. "arm" and "irr" are the only two `/tools/` slugs with NO static
    // ROUTE_MAP entry (only "/tools/arm-reset" and "/tools/returns" are
    // registered), so resolving them can ONLY go through the dynamic prefix
    // handler. A regression there is invisible to every other witness in
    // this file. (blog-post and case-studies above already exercise the
    // `/blog/` and `/case-studies/` dynamic prefixes directly, since neither
    // has a static ROUTE_MAP entry for a slugged path at all.)
    it('resolves the "/tools/arm" alias through the dynamic prefix handler', () => {
      expect(resolveRoute("/tools/arm")).toBe("arm-reset");
    });
    it('resolves the "/tools/irr" alias through the dynamic prefix handler', () => {
      expect(resolveRoute("/tools/irr")).toBe("returns");
    });

    // resolve.ts's ROUTE_MAP hardcodes "/legal/privacy-policy" and
    // "/legal/terms-of-service" as individual static entries. There is no
    // `path.startsWith("/legal/")` dynamic handler the way there is for
    // /tools/, /blog/, and /case-studies/ — despite /legal/ having multiple
    // sub-paths, it is not actually prefix-matched. Documented here (rather
    // than assumed) because it is easy to expect otherwise by analogy with
    // the other three prefixes.
    it('"/legal/*" sub-paths are static ROUTE_MAP entries, not a dynamic prefix', () => {
      expect(resolveRoute("/legal/privacy-policy")).toBe("legal");
      // A slug that isn't one of the two hardcoded ones has no dynamic
      // fallback to catch it — this is the behavior that documents the claim
      // above, not a suggestion that it should change.
      expect(resolveRoute("/legal/some-other-slug")).toBe("not-found");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Invariant 2: every PageView has a render case in App.tsx.
//
// App.tsx is not this file's to edit, and mounting all 41 routes' real
// components (several behind Firebase/env gating, Suspense, and lazy chunk
// loading) is a job for integration tests elsewhere, not this file. So this
// is deliberate source-text inspection: read App.tsx's text and confirm
// every PageView has a `case "<view>":` inside the renderPage() switch
// specifically. That is exactly the shape of bug this suite exists for — a
// view added to (or silently dropped from) the render switch without the
// PageView union following, or vice versa.
// ─────────────────────────────────────────────────────────────────────────
const RENDER_SWITCH_START_MARKER = "const renderPage = () => {";
const RENDER_SWITCH_END_MARKER = "function PageRenderer()";
const renderSwitchStartIdx = appSource.indexOf(RENDER_SWITCH_START_MARKER);
const renderSwitchEndIdx = appSource.indexOf(RENDER_SWITCH_END_MARKER, renderSwitchStartIdx);
// Sliced eagerly so an empty/garbage range (see the guard test below) still
// produces a defined, if wrong, string rather than throwing during collection.
const renderSwitchBody = appSource.slice(Math.max(renderSwitchStartIdx, 0), Math.max(renderSwitchEndIdx, 0));
const renderedViews = new Set(
  [...renderSwitchBody.matchAll(/case\s+"([^"]+)":/g)].map((match) => match[1]),
);

describe("routeIntegrity — invariant 2: every PageView renders in App.tsx", () => {
  it("finds the renderPage() switch at its expected markers in the current App.tsx", () => {
    // If App.tsx is restructured and either marker moves or disappears, the
    // slice above would silently scan the wrong region (or none of it) and
    // every case-presence check below would vacuously fail together —
    // useful, but this pins the actual cause instead of leaving it implicit.
    expect(renderSwitchStartIdx, `"${RENDER_SWITCH_START_MARKER}" not found in App.tsx`).toBeGreaterThan(-1);
    expect(renderSwitchEndIdx, `"${RENDER_SWITCH_END_MARKER}" not found after renderPage() in App.tsx`).toBeGreaterThan(renderSwitchStartIdx);
  });

  it("extracted a non-trivial number of render cases (extraction sanity check)", () => {
    // Guards against a silently-broken regex/marker producing an empty set,
    // which would make every per-view check below pass for the wrong reason.
    expect(renderedViews.size).toBeGreaterThan(10);
  });

  for (const view of ALL_VIEWS) {
    it(`renderPage() has a case for "${view}"`, () => {
      expect(renderedViews.has(view), `App.tsx renderPage() has no case "${view}":`).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Invariant 3: viewToPath(view) round-trips through resolveRoute().
//
// viewToPath() lives in App.tsx and is not exported, so — same as invariant
// 2 — its mapping is recovered by reading App.tsx's source text rather than
// importing it. This is deliberately NOT a hand-copied duplicate of the
// mapping typed into a second literal: doing that would test this file's
// assumption about viewToPath, not viewToPath itself, and would silently go
// stale exactly the way the bugs in this file's header did. Extracting from
// the real source means a future edit to viewToPath is what gets checked,
// not today's snapshot of it.
// ─────────────────────────────────────────────────────────────────────────
const VIEW_TO_PATH_START_MARKER = 'function viewToPath(view: PageView): string {';
const VIEW_TO_PATH_END_MARKER = "export default function App()";
const viewToPathStartIdx = appSource.indexOf(VIEW_TO_PATH_START_MARKER);
const viewToPathEndIdx = appSource.indexOf(VIEW_TO_PATH_END_MARKER, viewToPathStartIdx);
const viewToPathBody = appSource.slice(Math.max(viewToPathStartIdx, 0), Math.max(viewToPathEndIdx, 0));
const extractedViewToPath = new Map<string, string>(
  [...viewToPathBody.matchAll(/case\s+"([^"]+)":\s*return\s+"([^"]+)";/g)].map((match) => [match[1], match[2]]),
);

// Known, currently-inert round-trip breaks. Each has its own dedicated test
// below explaining exactly why it breaks and why that's acceptable today.
// Encoded as a Set — not a silent `view !== knownBreak` skip inline in a
// loop — so a future, UNDOCUMENTED break still fails this suite instead of
// quietly joining the exemption list.
const KNOWN_ROUND_TRIP_BREAKS = new Set<PageView>(["blog-post", "external"]);

describe("routeIntegrity — invariant 3: viewToPath(view) round-trips", () => {
  it("finds the viewToPath() function at its expected markers in the current App.tsx", () => {
    expect(viewToPathStartIdx, `"${VIEW_TO_PATH_START_MARKER}" not found in App.tsx`).toBeGreaterThan(-1);
    expect(viewToPathEndIdx, `"${VIEW_TO_PATH_END_MARKER}" not found after viewToPath() in App.tsx`).toBeGreaterThan(viewToPathStartIdx);
  });

  it("extracted a viewToPath() case for every PageView", () => {
    // App.tsx's own comment above the switch's `default:` arm claims it is
    // "Exhaustive over PageView (verified: every union member has a case
    // above)" but notes TypeScript cannot prove that reliably for a switch
    // without a discriminated default. This independently verifies the claim
    // against the same exhaustive ALL_VIEWS list invariants 1 and 2 use.
    for (const view of ALL_VIEWS) {
      expect(extractedViewToPath.has(view), `viewToPath() has no case "${view}":`).toBe(true);
    }
  });

  const roundTrippable = ALL_VIEWS.filter((view) => !KNOWN_ROUND_TRIP_BREAKS.has(view));

  for (const view of roundTrippable) {
    it(`viewToPath("${view}") round-trips back to "${view}"`, () => {
      const path = extractedViewToPath.get(view)!;
      expect(resolveRoute(path)).toBe(view);
    });
  }

  describe("known, documented round-trip breaks", () => {
    it("the exemption list is exactly the two documented breaks", () => {
      // If a third view's round trip broke, this fails until it is EITHER
      // fixed OR added here deliberately — which forces a matching
      // documenting test like the two below, rather than a silent skip.
      expect(KNOWN_ROUND_TRIP_BREAKS).toEqual(new Set(["blog-post", "external"]));
    });

    it("blog-post: viewToPath has no single canonical URL for \"some post\"", () => {
      // viewToPath("blog-post") returns "/blog" — the article LIST page, not
      // a post. There is no single canonical path for "a blog post" without
      // a slug, and viewToPath(view) is always called with no further
      // argument (see goTo/navigateTo in App.tsx), so it cannot synthesize
      // one. resolveRoute("/blog") correctly resolves to "blog", not
      // "blog-post". This is inert: the real path to a post is always a
      // literal `/blog/<slug>` href clicked from rendered markup (see
      // invariant 1's "blog-post" witness above), never a round trip through
      // this function.
      const path = extractedViewToPath.get("blog-post")!;
      expect(path).toBe("/blog");
      expect(resolveRoute(path)).toBe("blog");
      expect(resolveRoute(path)).not.toBe("blog-post");
    });

    it("external: viewToPath's literal \"/external\" is not itself a registered route", () => {
      // viewToPath("external") returns the literal string "/external", which
      // has no ROUTE_MAP entry and matches no dynamic prefix, so
      // resolveRoute sends it to "not-found" rather than back to "external".
      // "external" is only ever produced going the OTHER direction —
      // resolveRoute() classifying an already cross-origin href (see
      // invariant 1's exempt-mechanism test) — never by resolving a
      // same-origin path. Inert for the same reason as blog-post: nothing
      // round-trips through viewToPath("external") expecting to land back on
      // "external".
      const path = extractedViewToPath.get("external")!;
      expect(path).toBe("/external");
      expect(resolveRoute(path)).toBe("not-found");
      expect(resolveRoute(path)).not.toBe("external");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Invariant 4: no dead internal links in shipped markup.
//
// index.html and src/marketing/home-markup.html are near-duplicate copies of
// the same Webflow marketing shell — home-markup.html is the copy
// MarketingHome actually renders (imported `?raw`); index.html is the static
// document shell. Drift between the two has already shipped a live bug:
// home-markup.html kept three dead blog links long after index.html was
// cleaned up (see src/site/seo.test.ts's "links only to published articles
// from the rendered homepage markup", which guards blog-SLUG existence
// specifically against the BlogPage post registry). This invariant is
// broader and file-agnostic: every internal href in EITHER file must resolve
// to a real PageView via resolveRoute(), not just the /blog/ ones.
//
// Scoped to `<a href="/...">` anchor tags specifically, not every href
// attribute in the document. `<link rel="icon" href="/img/favicon-32.png">`
// carries an href too, but it's an asset reference a browser fetches, never
// something a person clicks through the SPA router — App.tsx's own click
// interceptor only ever inspects `target.closest("a")`. Static assets were
// never meant to resolve as routes, so treating that as a "dead link" would
// be a false positive, not a finding.
// ─────────────────────────────────────────────────────────────────────────
function extractAnchorHrefs(html: string): string[] {
  const anchorTagRe = /<a\b[^>]*?\bhref=["']([^"']*)["'][^>]*>/g;
  const hrefs = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = anchorTagRe.exec(html))) {
    const href = match[1];
    // Only "/..." hrefs are routes at all. "#" (page anchors), "mailto:",
    // "tel:", and external "http(s)://" hrefs don't start with "/" so they
    // never reach this filter. "//host/path" (protocol-relative) DOES start
    // with "/" but is cross-origin, not an internal route — excluded
    // explicitly rather than relying on it being absent today.
    if (href.startsWith("/") && !href.startsWith("//")) hrefs.add(href);
  }
  return [...hrefs];
}

const MARKUP_FILES: Array<{ label: string; html: string }> = [
  { label: "index.html", html: indexHtml },
  { label: "src/marketing/home-markup.html", html: homeMarkupHtml },
];

describe("routeIntegrity — invariant 4: no dead internal links in shipped markup", () => {
  for (const { label, html } of MARKUP_FILES) {
    const hrefs = extractAnchorHrefs(html);

    describe(label, () => {
      it("extracted a non-trivial number of internal <a href> links (extraction sanity check)", () => {
        expect(hrefs.length).toBeGreaterThan(0);
      });

      for (const href of hrefs) {
        it(`${href} resolves to a real view, not "not-found"`, () => {
          expect(resolveRoute(href)).not.toBe("not-found");
        });
      }
    });
  }
});
