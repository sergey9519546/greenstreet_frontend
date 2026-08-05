# Performance Wave Baseline

Date: 2026-07-28
Scope: local source and production-build evidence only. This is a baseline and a guarded measurement plan; it does not authorize a dependency, configuration, bundle, media, analytics, or production change.

## Decision summary

The application builds successfully, has route-level chunks and explicit vendor chunking, and already lazy-marks most media in the legacy marketing markup. It also contains several plausible performance opportunities, especially all-route idle prefetching, the Firebase chunk, large static media, and a large third-party runtime surface. None should be changed based on static evidence alone.

There are no measured field Core Web Vitals (CWV), no user-performance data, and no browser network trace in this baseline. Do not describe any bundle observation as a production-user impact or set pass/fail CWV claims from this document.

The active `performance-reporter` skill was inspected for governance. Its scope is period-over-period SEO/GEO reporting with traffic and ranking data, which is unavailable and is not a substitute for a build or CWV investigation. It was therefore not used to invent metrics.

## Reproducible local evidence

Command run from the clean implementation worktree:

```text
npm run build
```

Result: passed. Vite 6.4.3 transformed 2,161 modules and reported a 3.08-second client build on this machine. The full build command also bundled the server, engine worker, Vercel, and function entry points. This is a local build-time observation, not a deployment or user-timing measurement.

The ignored `dist/` output totaled 101,930,422 bytes after the build. That total includes all shipped static media and server artifacts; it is not the homepage transfer size.

| Build artifact role | Minified size | Gzip size | Evidence-backed observation |
| --- | ---: | ---: | --- |
| Firebase manual chunk | 523.88 kB | 122.06 kB | Largest JavaScript chunk; it triggers Vite's 500 kB warning. |
| Main application chunk | 386.50 kB | 77.26 kB | The marketing home is a synchronous `App` import and imports its legacy homepage markup as raw text. |
| Compliance dashboard route chunk | 318.61 kB | 80.95 kB | Lazy route module; its source imports Firebase Auth and Firestore, motion, icons, and several tool pages. |
| Catch-all vendor chunk | 258.06 kB | 80.98 kB | Produced by `vite.config.ts` manual-chunk fallback. Attribution needs a bundle graph before changes. |
| React chunk | 194.90 kB | 61.14 kB | Explicitly partitioned by the Vite manual-chunk rule. |
| GSAP chunk | 114.87 kB | 45.46 kB | Explicitly partitioned and also imported from `src/main.tsx`. |
| CSS chunk | 55.13 kB | 11.47 kB | Generated application stylesheet. |
| Blog route chunk | 67.72 kB | 22.05 kB | Largest independently named content-route chunk. |
| DSCR calculator route chunk | 36.19 kB | 7.61 kB | Lazy calculator route. |

Hashed names are build outputs, not stable budget identifiers. Future budgets should track role and measured transfer, not a particular hash.

## Route, loading, and runtime observations

### Route chunks

`src/App.tsx` defines 16 `React.lazy` route modules. `MarketingHome` is imported synchronously, while dashboard, calculator, blog, content, and account/CTA pages are route chunks.

Immediately after first paint, `warmAllRoutes()` schedules every route importer via `requestIdleCallback` with a 2,500 ms timeout, or a 1,500 ms `setTimeout` fallback. That source behavior is intended to make later navigation immediate. Because the dashboard route imports Firebase, the source graph indicates that a homepage session can request the dashboard and its Firebase dependency during idle time even when the Firebase workspace is not configured. A browser network trace must confirm the exact request sequence, priorities, caching, and impact before changing it.

`vite.config.ts` already separates React, GSAP, Firebase, motion, icons, markdown, charts, and a catch-all vendor group. No chunking rewrite is justified until a source-map or bundle-graph analysis identifies the real owners of the current `vendor` and main chunks.

### Document and third-party runtime surface

The generated `dist/index.html` includes the application module, React and GSAP module-preloads, external Google font/CSS references, and 10 external script URLs. The external scripts include jQuery, Website Files runtime bundles, externally hosted GSAP and plugins, Swiper, and Finsweet loaders. The document also retains local legacy helper scripts.

`src/main.tsx` loads bundled GSAP and `ScrollTrigger`, while generated HTML separately references externally hosted GSAP and plugins. This is an observation of two runtime paths, not proof of duplicate download or duplicate execution. Do not remove, defer, or reorder any of these scripts without a browser trace plus an interaction regression suite for the legacy homepage.

The build emits this source-scanning warning:

```text
<script src="/wvxwa3jtwetcNjdkMGE4YTkxNTZiN2I3YmQ0NmZmZGZk/nq6SdY9yd98sJXX5znRjqfSpD1o">
in "/index.html" can't be bundled without type="module" attribute
```

The release HTML sanitizer removes that opaque script from the generated `dist/index.html`; a direct output scan found no matching path. Treat the warning as a build-noise and output-regression concern, not as a reason to change the sanitizer or reinstate the script. Add a build-output assertion before considering cleanup.

### Static media inventory

The legacy marketing markup contains 121 `<img>`, `<video>`, or `<source>` tag starts, 113 `loading="lazy"` occurrences, and eight `autoplay` occurrences. Markup counts do not show which resources load, decode, or become LCP on an actual device.

Largest inspected static files include:

| Asset | Bytes | Safe interpretation |
| --- | ---: | --- |
| `dist/video/greenstreet-rebuild-v2.mp4` | 7,302,386 | Large packaged video; not proven to be on the initial critical path. |
| `dist/img/people/maranda-leonard.png` | 6,328,849 | Large image; loading behavior needs browser confirmation. |
| `dist/img/people/doug-thalhammer.png` | 5,819,685 | Large image; loading behavior needs browser confirmation. |
| `dist/img/resources/thumbnail-01-laptop-dark.png` | 5,057,058 | Large image; loading behavior needs browser confirmation. |
| `dist/img/generated/hero.png` | 4,825,156 | Large image; whether it is the visible hero/LCP candidate is unverified. |
| `dist/video/hero.mp4` | 3,216,556 | Large video; poster, playback, and autoplay behavior need browser confirmation. |

## Known build warnings and operating constraints

1. Vite warns that the Firebase chunk exceeds its 500 kB minified warning threshold. The build still succeeds.
2. Vite reports the opaque source-only script warning described above. Generated output does not include the path because the release sanitizer removes it.
3. The current CI path runs Node 22, `npm ci`, lint, Vitest, homepage-fidelity verification, and build. It has no browser performance run, Lighthouse run, CWV collection, performance budget, or preview-environment trace.
4. There is no project Playwright, Lighthouse, `web-vitals`, or equivalent performance-test configuration in the repository. Do not add one until the release owner approves dependency, browser, CI-cost, privacy, and maintenance decisions.

## Baseline limitations

- No browser was exercised in this wave. The baseline cannot measure LCP, INP, CLS, TTFB, render delay, long tasks, video decode cost, cache behavior, priority hints, or actual request waterfalls.
- No production URL, CDN configuration, cache headers, compression negotiation, device profile, network profile, browser version, or geographic path was tested.
- No field/RUM data exists in the inspected source. Do not infer percentile CWV, traffic, conversion, route popularity, or user-impact severity.
- External script, font, and hosted-media sizes and timings are not present in the local build result.
- The raw legacy homepage markup is transformed by the release HTML sanitizer and further handled by React. Final browser behavior must be verified against generated preview output, not source text alone.
- `dist/` is ignored. The artifacts are appropriate for local inspection but do not establish what a hosting platform will serve or cache.

## Safe measurement plan

### Phase 1 — establish a reproducible lab baseline

Run only against a production build served in a preview-like environment. Record the commit, preview URL, date/time, browser version, viewport, network profile, CPU setting, cache state, and run count with every result.

Test this minimum route matrix in cold and warm cache states:

| Journey | Why it is in scope |
| --- | --- |
| `/` marketing home | Tests legacy markup, third-party runtime, media, animations, and primary CTA. |
| `/dscr-calculator` | Tests a user-facing interactive calculation route. |
| `/book-demo` and the home CTA path | Tests conversion navigation without claiming data capture success. |
| `/investgo` with no client Firebase workspace configured | Confirms the current reliability hold remains fast and intact. |
| A representative lazy content page such as `/blog` | Tests post-home route delivery and navigation behavior. |
| A held tool route and an unknown route | Confirms no performance work bypasses safety holds or routing fallback. |

For each run, retain a browser performance trace/waterfall, screenshot or filmstrip, console output, failed-request list, LCP element, CLS sources, long-task summary, total transfer, and JavaScript/CSS/media initiators. Compare at least three repeated cold and warm runs before drawing a conclusion.

The lab result is a release-engineering signal, not field CWV. Set route-specific budget targets only after this first repeatable lab baseline and product-owner review.

### Phase 2 — consent-reviewed field CWV, if approved

Only after a privacy owner approves the data map, lawful purpose, consent behavior, retention, access, deletion path, and vendor review, collect aggregate CWV telemetry. It must not send raw email, phone, names, property data, loan values tied to an identity, free text, auth tokens, or session-replay/fingerprinting data.

Field reporting should segment only by approved non-identifying dimensions such as route family, device class, and connection class. It must label sample size, time window, version, and consent coverage; it must not be compared directly with a throttled lab run.

## Smallest candidate changes, ordered by evidence safety

| Candidate | Why it is plausible | Required test gate before merge | Immediate rollback boundary |
| --- | --- | --- | --- |
| Add a build-artifact inventory/report in CI without changing served code | Makes future bundle/media changes visible while preserving runtime behavior. | Existing lint, Vitest, homepage-fidelity, build, and a review of the report against approved role-based budgets. | Revert the reporting-only commit. |
| Replace all-route idle warming with an evidence-backed, narrowly scoped prefetch policy | `warmAllRoutes()` invokes all 16 lazy importers and can lead the home path to load dashboard/Firebase code during idle. | Cold/warm home traces; direct-route and back/forward navigation; no Suspense/visual flash; no-config portal hold; calculator, CTA, and legacy-home interaction checks. | Revert the isolated `App.tsx` prefetch change if navigation, animation, or conversion flow regresses. |
| Investigate one confirmed noncritical media request at a time | The static artifact has several multi-megabyte images/videos, while source counts alone cannot identify actual critical requests. | Before/after trace identifies the exact request; desktop/mobile visual comparison; image dimensions/alt/poster/playback; reduced-motion and keyboard checks where applicable. | Restore only that asset markup or delivery rule; do not batch media changes. |
| Audit one external runtime dependency at a time | Generated HTML contains 10 external scripts and bundled/external GSAP paths. | Network/coverage trace; legacy scroll, slider, form/CTA, popup, route, and console-error checks; validate consent behavior. | Restore the exact script and order; do not combine with bundle or media work. |
| Attribute the `vendor` and main chunks with a bundle graph | Existing manual chunk rules leave a large catch-all vendor chunk and raw-markup home import. | Build remains deterministic; all current tests; review confirms a change does not move required code into the marketing critical path. | Revert the single chunking rule/change. |

The first candidate is intentionally reporting-only. It is the only candidate that can proceed before a browser baseline exists; all served-code changes wait for the applicable gate.

## No-breakage release and rollback gates

Every performance change must be isolated to one hypothesis. Do not bundle prefetch, chunking, media, third-party, visual, accessibility, consent, or content changes into the same release.

Before approval, all of the following must be true:

1. The before/after lab evidence uses the same preview/deployment class and documented test conditions.
2. `npm run lint`, `npm test`, `npm run test:home-fidelity`, and `npm run build` pass.
3. Home, calculator, booking CTA, direct deep links, back/forward navigation, unknown-route fallback, the no-config workspace reliability hold, and held-tool safety pages work as before.
4. Desktop and mobile visual evidence shows no unintended layout, font, animation, poster, or hydration regression.
5. Console and network review finds no new failed request, unhandled error, CORS issue, render-blocking surprise, duplicate side effect, or third-party consent regression.
6. Any Firebase-related change proves both the configured-auth path and the unconfigured fail-closed path remain correct; no API or credential behavior may be weakened to improve timing.
7. Any media or motion change preserves meaningful alternative content, dimensions/aspect ratio, reduced-motion behavior, and a usable non-autoplay path.
8. Any script change preserves the exact validated load order until an interaction trace proves it can change safely.

Rollback must be a small, independently deployable revert of the owning change. Trigger it immediately if a critical journey fails, a reliability hold is bypassed, a new console/network error appears, visual fidelity regresses, or the agreed lab metric worsens beyond the approved tolerance. Preserve the before/after trace with the rollback record so the next attempt starts from evidence rather than assumption.

## Handoff

Owner for the next wave: Performance and Release Engineering, with product, accessibility, privacy, and Firebase/security owners approving their respective gates.

The next safe action is a browser-based lab baseline, not a production optimization. Attach its trace set and route matrix results to the release evidence before selecting exactly one candidate above.
