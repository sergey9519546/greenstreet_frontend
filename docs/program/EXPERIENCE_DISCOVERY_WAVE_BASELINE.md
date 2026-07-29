# Experience and discovery wave baseline

Status: Read-only baseline
Created: 2026-07-28
Scope: Public experience, accessibility, performance, discovery, metadata, and content-safety observations in the clean ultraplan worktree.
Change policy: This artifact does not authorize source, public-copy, metadata, tracker, workflow, deployment, or claim changes.

## Outcome and preservation rule

The next experience wave should make Greenstreet easier to use and discover **without changing what already works** or making a new financing, pricing, eligibility, provider, legal, security, performance, or customer-result claim.

The current visual identity is a dark green/lime editorial marketing surface with a focused arithmetic calculator, conservative reliability holds, and a secure scenario-review intake. Preserve that identity and the working paths below. This is not a redesign brief.

Every future ticket must first capture the affected current behavior with a screenshot, trace, crawl result, contract test, or signed manual record. It then makes the smallest repair, has an independent reviewer repeat the critical journey, and records a rollback smoke test.

## Review method and limits

This wave used the active `design-director` framework as a preservation-oriented frontend review, and the active `content-quality-auditor`, `on-page-seo-auditor`, and `meta-tags-optimizer` frameworks to identify evidence and discoverability risks. It deliberately did **not** issue a publish-readiness score: that would require approved claims, source evidence, real crawl data, and a complete content-specific review. The performance-reporting skill was not invoked because no traffic, Search Console, or field-Core-Web-Vitals dataset was supplied.

Reviewed artifacts:

- Public routing and runtime metadata: `src/App.tsx`, `src/router/resolve.ts`, `src/seo/routeMetadata.ts`, `public/robots.txt`, and `public/sitemap.xml`.
- Marketing behavior and its existing safety tests: `src/marketing/MarketingHome.tsx`, `src/marketing/home-markup.html`, `src/marketing/MarketingHome.test.ts`, `src/marketing/home-contract.json`, and `scripts/check-home-contract.mjs`.
- Primary public journeys: `src/pages/DSCRCalculatorPage.tsx`, `src/pages/BookDemoPage.tsx`, `src/components/QualifyWidget.tsx`, `src/components/QualifyModal.tsx`, `src/components/ToolReliabilityHoldPage.tsx`, and `src/routes/leads.ts`.
- Source and compiled head behavior: `index.html`, current `dist/index.html`, `vite.config.ts`, and `vercel.json`.
- Current asset and bundle inventory from the existing successful build output.

This is source/build evidence, not a production crawl, screen-reader study, Lighthouse run, or analytics report. Findings marked **Needs measurement** must not be described as measured user impact.

## Working journeys to preserve

| Journey | Current working path | Existing safety behavior that must survive | Evidence to capture before any change |
| --- | --- | --- | --- |
| Discovery to arithmetic | Marketing home → `/dscr-calculator` → DSCR or maximum-price view | The public calculator frames outputs as educational, input-based arithmetic rather than pricing, eligibility, approval, or a commitment. | Desktop/mobile screenshots, calculator input/output golden cases, keyboard traversal. |
| Scenario review | Any eligible public route → “Request a scenario review” → four guided steps → `/api/leads` | The modal requires context and contact consent, rejects incomplete inputs, does not show success when delivery fails, and sends only allowlisted intake fields. | Happy path, validation, abort, 4xx/5xx, duplicate-submit, and no-PII-in-browser-storage checks. |
| Booking/review page | `/book-demo` → secure scenario intake | The page honestly says self-scheduling is unavailable and does not call an intake a loan application, approval, rate lock, tax opinion, or commitment. | CTA, return path, loading/error, and contact-consent screenshots. |
| Held tools | Held route (for example `/rate-quiz`, `/state-laws`, `/tools/returns`) → reliability-hold page | Held tools withhold unsupported decision output and route visitors to the released calculator, product overview, or scenario review. | Direct-load, browser-back, robots/canonical, and keyboard checks. |
| Content discovery | Sitemap/blog/home resource card → known blog or case-study route | Known articles get route metadata; unknown article routes render a clear not-found experience and are intended to be noindex. | Full internal-link crawl, rendered metadata, and status/soft-404 evidence. |
| Workspace access | `/investgo` → workspace when Firebase client configuration exists, otherwise a reliability hold | A public visitor does not receive an unavailable workspace as though it were a working product. | Signed-out, unavailable-configuration, authorized, expired-session, and refresh checks. |

## Existing protections that should not be disturbed

- `MarketingHome` replaces unsupported rate-tier and state-rule widgets with explicit review holds before legacy markup reaches the DOM. The existing marketing tests verify those substitutions.
- `scripts/check-home-contract.mjs` protects the accepted homepage source hash and key composition markers. CI now runs that contract alongside lint, tests, and build.
- The marketing surface has a skip link, visible focus styles, named dismissal/menu controls, and a custom mobile-menu keyboard/focus loop. `QualifyModal` has a dialog role, focus trap, Escape handling, a live result region, consent validation, and an error alert.
- `ToolReliabilityHoldPage` gives held routes a clear status instead of a fabricated decision result. `routeMetadata.ts` marks held, authenticated, unknown, and unpublished routes `noindex,nofollow` at runtime.
- The lead endpoint enforces a trusted origin, a strict bounded schema, consent, a honeypot, and fail-closed persistence. It does not return a lead identifier or a financial-result snapshot.

## Observed baseline risks and safe disposition

| Priority | Observation | Evidence | Why it matters | Safe next action; do not change it yet |
| --- | --- | --- | --- | --- |
| Release-blocking claim/identity gate | The compiled initial HTML describes Greenstreet as directly originating DSCR loans through a wholesale lending partner named Cake. Runtime metadata and released-page copy instead describe educational DSCR tools and preliminary review. | `dist/index.html` lines 29–42 retain the direct-origination/Cake language; `src/seo/routeMetadata.ts` uses the educational description; `MarketingHome.tsx` replaces unsupported in-page claims. | Social crawlers and non-rendering bots consume the initial head, not client-side corrections. It is also a material identity/counterparty claim that needs business and licensing approval. | Obtain written business/licensing/counterparty facts and approved wording. Then add a single server/prerendered metadata source with a metadata regression test and social-preview evidence. Do not guess or merely soften the claim. |
| Release-blocking privacy/disclosure gate | Public legal copy says optional analytics and de-anonymization tracking are not enabled, while the compiled document initializes `dataLayer` and calls `gtag('config', 'G-JERVW0S7X4')`; it also contains a HubSpot-meeting data-layer event. | `src/pages/LegalPage.tsx` privacy copy; `dist/index.html` around line 97 and lines 1080–1095. The Vite sanitizer removes CookieYes and one stale script but does not remove this Google tag configuration. | This is an observable configuration/disclosure mismatch. The review did not inspect network requests, so it is not proof of a completed analytics transmission—but it requires privacy-owner resolution before launch or new measurement work. | Have the privacy/security owner capture a production/preview network trace, document purpose/vendor/consent/retention, and either align the disclosure or disable the tag through an approved minimal change. Do not add more tracking, replay, pixels, or identifiers. |
| High | The Vercel rewrite sends all paths to `index.html`, while route-specific title, robots, canonical, and JSON-LD are applied only after React runs. | `vercel.json`; `src/seo/routeMetadata.ts`; initial `index.html`; current `dist/index.html`. | Deep links can be correct for JavaScript users but indistinguishable to non-rendering crawlers, social preview bots, and some audit tools. Runtime `noindex` is not sufficient evidence of crawl control. | Run a preview/production raw-versus-rendered URL matrix before changing architecture. If the result warrants it, use the smallest approved prerender/server-head solution; preserve SPA navigation and held-route protection. |
| High | Four resource links in the legacy home markup do not map to published content: three blog slugs (`greenstreet-t3-survey-rating`, `system-of-action`, `track-2-dscr`) and one case-study slug (`northshore-nonqm` versus the implemented `northshore-non-qm`). | Static link inventory from `src/marketing/home-markup.html`; `POSTS` in `src/pages/BlogPage.tsx`; case-study registry in `src/pages/CaseStudiesPage.tsx`. | These routes render an article not-found state or a generic case-study collection rather than the promised resource. In an SPA rewrite they can look like soft 404s rather than clear HTTP 404s. | First add a link-inventory contract test. The content owner then chooses the smallest approved outcome per link: publish a reviewed article, redirect to an equivalent approved page, or remove the card/link. |
| High | Marketing is a React portal that injects and executes a large transformed Webflow export. Existing string tests protect key substitutions, but browser-level keyboard, error, layout, console, and asset behavior is not yet covered. | `src/marketing/MarketingHome.tsx` uses `dangerouslySetInnerHTML` and re-executes embedded scripts; `MarketingHome.test.ts` is string/contract coverage only. | Legacy DOM semantics and third-party scripts can change at runtime in ways type checks and string tests cannot see. | Capture a Playwright/real-browser baseline before touching markup, scripts, CSS, or interaction code. Keep the current visual contract test as an additional—not replacement—guard. |
| High accessibility | Reduced-motion behavior is partial. Several React surfaces honor the setting, but the global marketing logo marquee remains a CSS infinite animation and the home markup includes autoplay/looping video. | `src/index.css` marquee animation; `src/marketing/home-markup.html` hero plus five step videos; partial support in `QualifyModal`, `QualifyWidget`, and several React pages. | A visitor who requests reduced motion may still receive nonessential persistent motion. The actual interaction of all legacy scripts still needs browser confirmation. | Test `prefers-reduced-motion: reduce` on all critical routes, video and carousel behavior, and content visibility. Implement one small global motion contract only after screenshots and keyboard/media checks establish the baseline. |
| Medium accessibility | SPA navigation scrolls to top, but a generalized route-change focus/announcement pattern is not evident. Calculator results also update visually without an `aria-live` result wrapper. | `src/App.tsx` navigation calls `window.scrollTo`; `DSCRCalculatorPage.tsx` has no `aria-live` result region; `QualifyModal` does provide a live region. | Screen-reader and keyboard users may remain on the old control after navigation or not learn that a calculated result changed. | Verify with NVDA/Chrome and a second screen-reader/browser pairing. If reproduced, focus the page landmark/heading after internal navigation and announce only the relevant calculator result—without adding noisy announcements per keystroke. |
| Medium accessibility | The legacy marketing menu still models its burger as a `div` with `role="button"`, and legacy visual patterns layer anchors/buttons. The app adds keyboard handling, but no end-to-end semantic or focus-order test currently proves the combined DOM. | `MarketingHome.tsx` semantic repair and keyboard handler; `home-markup.html` legacy controls. | A minor markup change could regress keyboard activation, focus order, or duplicate action behavior without a compile-time failure. | Test keyboard-only open/close/Escape/focus restore, touch operation, 200%/400% zoom, and mobile reflow first. Convert only the affected control in a separately tested ticket if a real defect is confirmed. |
| Medium performance | The home hero requests an eager 4.60 MiB PNG and an autoplay 3.07 MiB video; additional step videos are present. | `public/img/generated/hero.png` and `public/video/hero.mp4`; `home-markup.html`. Sizes are local-file sizes, not measured transfer or LCP. | These assets can compete for mobile bandwidth, memory, LCP, and battery. | Capture a mobile waterfall/Lighthouse trace, LCP element, preload behavior, decoded dimensions, and poster/fallback behavior before changing media. Retain the composition unless measured evidence supports a safe optimization. |
| Medium performance | Route chunks are declared lazy but all public route importers are warmed after first paint; the latest build also has a 511.6 KiB minified Firebase chunk and a 311.1 KiB dashboard chunk. | `src/App.tsx` `warmAllRoutes`; current `dist/assets` inventory. | The transition-smoothness strategy can become background transfer, parse, memory, and interaction work for a marketing visitor who never uses those routes. | Measure the current waterfall, long tasks, navigation latency, and memory. Compare intentional prefetch (hover/focus/likely next route) with the current all-route warmup in a preview experiment only; do not remove it on intuition. |
| Medium performance | The home depends on Webflow CSS/JS, jQuery, GSAP plugins, Swiper, and additional CMS scripts in addition to the React bundle. | `index.html` and `vite.config.ts`; CSP explicitly permits these sources. | Third-party script cost, order, and runtime errors need observation under normal, slow, and blocked-third-party conditions. | Produce a third-party request inventory and console/network disposition log. Any removal or deferment must preserve the accepted homepage visual contract and interaction paths. |
| Content governance | The in-page claim-replacement layer and disabled-form language are protective, but they are string replacements over an old export rather than an evidence-owned content source. Time-sensitive resources and testimonials require continued source/expiry review. | `MarketingHome.tsx`, `home-markup.html`, `BlogPage.tsx`, and `BookDemoPage.tsx`. | A future Webflow export or copy edit can reintroduce unsupported wording even if source code continues to compile. | Maintain a claim-evidence ledger and add focused prohibited-claim assertions for every approved marketing/content change. Keep constructed scenarios clearly labeled and preserve disabled-form honesty. |

## Discovery and technical-SEO posture

The sitemap and route-metadata unit tests are useful protections, especially for excluding held tools. They do not yet prove that every sitemap URL has a rendered canonical, correct HTTP outcome, correct public content, and correct social preview.

The next URL inventory must classify every route as one of: canonical public page, public alias/redirect, held/noindex page, authenticated page, external handoff, unknown/404, or asset/API. For each URL record raw HTML title/description/robots/canonical, rendered equivalents, HTTP status, sitemap inclusion, internal inbound links, and destination behavior after a refresh.

The highest-priority reconciliation set is:

1. `/`, `/dscr-calculator`, `/book-demo`, `/blog`, and all sitemap article URLs.
2. The four legacy-home resource destinations listed above.
3. `/privacy-policy`, `/terms-of-service`, their canonical legal URLs, and the public privacy disclosure.
4. Held routes, `/investgo`, the workspace aliases, and an intentionally unknown path.
5. Open Graph/Twitter previews for the homepage and one public article after the identity gate is approved.

## Conservative test and measurement backlog

These work packages can run in parallel once each writes a separate artifact and does not edit the same application surface.

| Wave | Safe parallel work | Required evidence | Owner/gate |
| --- | --- | --- | --- |
| A — capture only | Visual baselines at 360×800, 390×844, 768×1024, 1280×800, and 1440×900 for home, calculator, booking, hold, blog, article, legal, and workspace-unavailable states. | Screenshots plus console/network log; no source changes. | UX/design reviewer. |
| A — capture only | Critical-journey browser checks: skip link, desktop/mobile menu, direct deep links/refresh/back-forward, calculator controls/results, modal focus trap/Escape, validation/failure state, held-tool exits, and unknown routes. | Trace/screenshots and pass/fail matrix. | Independent E2E/accessibility reviewer. |
| A — capture only | Accessibility manual audit: keyboard, screen readers, text spacing, reflow/zoom, touch target, contrast, forced colors, reduced motion, video/carousel pause behavior, and error announcements. | WCAG criterion matrix; NVDA/Chrome plus a second pairing. | Accessibility owner. |
| A — capture only | URL/rendering crawl of raw and rendered preview/production HTML; validate sitemap/robots/canonical/JSON-LD/social cards and enumerate internal links. | URL inventory with raw versus rendered evidence and soft-404 classification. | Technical SEO reviewer. |
| A — capture only | Performance baseline under a mobile network/CPU profile and desktop: LCP element, CLS, INP/TBT, transferred/decoded bytes, critical chain, long tasks, third-party work, route-prefetch work, video behavior. | Repeatable Lighthouse/trace report; metrics labeled measured. | Performance owner. |
| A — capture only | Privacy/measurement verification for Google tag, data-layer events, HubSpot, cookies/storage, and lead capture. | Network trace, data map, vendor/purpose/consent/retention disposition. | Privacy/security owner. |
| B — minimal fixes | Add deterministic link-inventory, rendered-head, held-route/noindex, and critical-browser regression tests based on Wave A failures. | Failing-first evidence, minimal patch, independent rerun, rollback command. | Builder plus independent validator. |
| B — gated fixes | Repair confirmed accessibility, performance, and route defects one at a time while retaining home fidelity, calculator arithmetic, lead fail-closed behavior, and existing reliability holds. | Before/after trace or screenshot and full affected regression matrix. | Product/design owner; privacy/counsel as applicable. |
| C — controlled release | Preview certification, rollback rehearsal, production smoke, and post-release observation. | Release dossier and explicit go/no-go decision. | Release owner and human approvers. |

## Sequencing and explicit non-actions

1. Freeze public identity, licensing, provider, pricing, state-law, security, testimonial, and performance claims until their source owners approve the evidence package.
2. Run the Wave A measurements in parallel. They are read-only and produce the evidence needed to choose a smallest safe fix.
3. Treat the compiled-head identity conflict and analytics/privacy mismatch as gates before metadata optimization, social promotion, or measurement expansion.
4. Add low-risk regression contracts next: link inventory, raw/rendered metadata behavior, keyboard/modal behavior, reduced motion, and critical screenshots. These must protect the current working paths before any visual or performance optimization.
5. Apply only confirmed minimal fixes in isolated tickets. Do not replace the marketing export, remove all route warming, remove video, or alter the calculator/lead flow as a blanket refactor.
6. Re-run the existing lint, unit tests, homepage fidelity contract, production build, and the affected browser evidence after every change. Stop and roll back if an established behavior changes unexpectedly.

## Human decisions required before public changes

- Business and mortgage/licensing owner: legal entity, licensing, direct-origination, counterparty, and permitted public wording for the Cake reference.
- Privacy/security owner: whether the observed Google tag/data-layer configuration is authorized, its consent model, retention, and required legal disclosure.
- Content owner: disposition of the three stale blog links, the mismatched case-study link, time-sensitive articles, and any testimonial/case-study evidence.
- Product/design owner: acceptable measured tradeoffs among homepage visual fidelity, route-transition speed, media cost, and reduced-motion behavior.

Until those decisions are recorded, the safe action is evidence capture and regression coverage—not a broad UX, SEO, analytics, or content rewrite.
