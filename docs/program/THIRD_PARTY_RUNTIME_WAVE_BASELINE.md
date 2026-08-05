# Third-Party Runtime Wave Baseline

**Status:** documentation-only baseline. No runtime, metadata, deployment, workflow, or existing-document changes were made by this wave.

**Purpose:** create a verified starting point for reducing third-party runtime risk without breaking the accepted marketing experience, booking flow, SPA routing, calculator, lead capture, reliability holds, or deployed asset loading.

## Scope and evidence standard

This inventory is limited to the current deployable browser surface in the worktree:

- `index.html` and the current `dist/index.html` artifact;
- `src/marketing/MarketingHome.tsx` and raw `src/marketing/home-markup.html`;
- static JavaScript and the HyperFrame document under `public/`;
- `vite.config.ts`, `vercel.json`, `firebase.json`, `src/firebase.ts`, and current package/build output.

No third-party code was downloaded, run, or trusted during this inspection. Findings labelled **observed** come from local source or the current local `dist` artifact. Findings labelled **inferred** are a constrained conclusion from that code and require the listed browser test before use as a release fact.

The folders such as `hf-*` and `animations/` contain separate HTML experiments with their own script tags. They are not referenced by the current Vite entry or copied into the inspected `dist` artifact; `firebase.json` also ignores those folders for Functions deployment. They are intentionally excluded from the live-runtime table until a deployment route references them.

## Non-negotiable preservation contract

Until a browser baseline proves otherwise, preserve all of the following:

1. The classic-script dependency order: jQuery, Webflow exports, GSAP/plugins, then Swiper and the legacy marketing lifecycle.
2. The React marketing mount path: raw markup is sanitized before reaching the DOM, then its permitted embedded scripts run after mount.
3. The lifecycle boundary: `__gsStartMarketing` starts homepage effects only for the marketing view; `__gsStopMarketing` destroys ScrollTriggers, Swipers, tracked intervals, and selected jQuery handlers on exit.
4. HubSpot booking behavior, including the two booking containers, until a named marketing and privacy owner accepts a replacement path.
5. The self-hosted video, neutral-map, step-scroll, and HyperFrame interactions.
6. Existing reliability holds. This wave does not re-enable rate, program, or state-law conclusions.

No optimization, CSP tightening, consent change, CDN migration, script deletion, or vendor replacement is safe to merge without the corresponding browser gates below.

## Runtime topology

| Stage | Observed behavior | Preservation implication |
| --- | --- | --- |
| Document parse | `index.html` loads the root app module plus classic Webflow-era scripts. Current `dist/index.html` still contains the external classic scripts. | A direct SPA route receives the document-level scripts before React can decide whether to mount marketing content. Do not assume a non-home route avoids the downloads. |
| React mount | `App.tsx` renders `MarketingHome` only for the `marketing` route. `MarketingHome` ports the raw homepage into `#marketing-root`. | Route lifecycle tests must cover both direct-load and in-app navigation. |
| Markup preparation | `publicMarketingMarkup` applies claim/semantic repairs and replaces the unsupported rate widget and state-rule widget before DOM insertion. | Do not execute or move the original widget scripts; they are deliberately absent from the rendered homepage. |
| Embedded scripts | `runEmbeddedScripts` replaces each remaining raw-markup script element with a new script after mount, copying attributes and setting `async = false`. | The HubSpot loader is intentionally re-executed. Replacing this mechanism with a generic sanitizer or deleting all embedded scripts would break booking unless parity is demonstrated. |
| Marketing lifecycle | `startMarketingRuntime` calls Webflow readiness, initializes its `ix2` module if present, invokes `initAnimations`, then starts the guarded legacy lifecycle. Cleanup calls `__gsStopMarketing`. | Repeated mount/unmount, Back navigation, and mobile menu tests are mandatory before touching script ownership. |
| Static enhancements | `gs-rebuild-video.js`, `gs-state-map.js`, and `step-scroll.js` are document-level deferred scripts. They no-op when their target elements are absent. | They are fetched on every document load but should be tested on homepage and direct SPA routes before deferral or conditional-loading changes. |
| HyperFrame | `step-scroll.js` fetches a same-origin HTML template, sets it as iframe `srcdoc`, and reads the same-origin frame timeline. It falls back to `iframe.src` only if the fetch fails. | Do not add iframe sandboxing or remove same-origin access without an integration rewrite; the parent currently reads `contentWindow.document`. |

## Executable inventory

### Delivered document scripts

The current build artifact was inspected in addition to source. The release sanitizer removes the source-only CookieYes tag and stale opaque same-origin analytics path from the generated `dist/index.html`; both remain visible in `index.html` source and must stay covered by a build-output assertion.

| Source / delivered location | Origin | Role | Status and confidence | Integrity and no-breakage note |
| --- | --- | --- | --- | --- |
| `/src/main.tsx` in source; hashed `/assets/index-*.js` in build | self | Vite/React application entry. Imports app code and bundled dependencies. | Observed in source and `dist`. | Build-name hashes help cache busting, not independent provenance. Preserve module placement while legacy globals are still required. |
| `/assets/react-*.js`, `/assets/gsap-*.js`, `/assets/firebase-*.js`, `/assets/motion-*.js`, `/assets/vendor-*.js` | self | Split application dependencies. The Firebase chunk contains endpoint construction for Google/Firebase services. | Observed in current `dist`. | Package-lock and build provenance should be verified in a separate supply-chain wave; do not treat self-hosting as a substitute for a lockfile review. |
| `https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=67d0a8a9156b7b7bd46ffdfd` | CloudFront / Webflow delivery | Provides `window.jQuery` used extensively by legacy menu, drawer, hover, booking redirect, and animation code. | Observed, classic non-async script. | No `integrity` attribute. It must remain before code that calls `$` unless the behavior is migrated and browser-proven. |
| `https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffdfd/js/greenboard-00.schunk.57706da51b32327c.js` | Webflow CDN | Webflow site chunk. | Observed, classic script. Exact runtime role beyond Webflow support is not independently verified. | No SRI. Preserve order and test Webflow interactions before pinning or self-hosting. |
| `https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffdfd/js/greenboard-00.0d162371.8614de198f9d7870.js` | Webflow CDN | Webflow runtime/site export used by `Webflow.ready()` and `Webflow.require("ix2")`. | Observed from tag plus application calls. | No SRI. The filename is not a reviewed integrity control. |
| `https://cdn.prod.website-files.com/gsap/3.15.0/gsap.min.js` | Webflow CDN | Global GSAP core used by inline marketing animation code. | Observed, classic script. | No SRI. Keep before plugin registration and homepage animation code. |
| `https://cdn.prod.website-files.com/gsap/3.15.0/ScrollTrigger.min.js` | Webflow CDN | Global scroll-trigger plugin. | Observed, classic script. | No SRI. Required by lifecycle start/stop and many homepage timelines. |
| `https://cdn.prod.website-files.com/gsap/3.15.0/Observer.min.js` | Webflow CDN | Global GSAP Observer plugin. | Observed, classic script. | No SRI. Registered with GSAP before lifecycle code. |
| `https://cdn.prod.website-files.com/gsap/3.15.0/Flip.min.js` | Webflow CDN | Global GSAP Flip plugin. | Observed, classic script. | No SRI. Preserve registration order even if current use is indirect. |
| `https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js` | jsDelivr | Global `Swiper` used for homepage carousels; instances are tracked for teardown. | Observed, classic script. | No SRI. Removing it can silently break carousel controls and cleanup. |
| `https://cdn.jsdelivr.net/npm/@finsweet/attributes-cmsfilter@1/cmsfilter.js` | jsDelivr | Finsweet CMS filter utility from the legacy export. | Observed, async script. Direct active use is not proven from local source. | No SRI. Treat as a candidate for removal only after a network/DOM baseline proves no current dependency. |
| `https://cdn.jsdelivr.net/npm/@finsweet/attributes-cmsload@1/cmsload.js` | jsDelivr | Finsweet CMS load utility from the legacy export. | Observed, async script. Direct active use is not proven from local source. | No SRI. Same containment rule as CMS filter. |
| Inline route marker, Webflow class marker, analytics queue, animation, lifecycle, message-listener, email-validation, and popup scripts in `index.html` | self | Route visibility, legacy interaction initialization, telemetry queueing, and homepage helpers. | Observed. | The Vercel CSP currently needs `unsafe-inline` for them. Do not remove `unsafe-inline` or convert a subset until all inline blocks have been cataloged and tested. |
| `/gs-rebuild-video.js` | self | Video mute/play/visibility controls for the homepage rebuild video. | Observed, deferred. | No SRI needed for same-origin delivery, but record a content hash in a future asset manifest. |
| `/gs-state-map.js` | self | Fetches `/us-map-paths.json` with same-origin credentials and renders a neutral state map. | Observed, deferred. | Does not make a third-party request. Preserve its failure-safe neutral message. |
| `/step-scroll.js` | self | Scroll-driven step interaction and HyperFrame mounting. | Observed, deferred. | Has a same-origin fetch and iframe fallback; see CSP finding below. |

### Scripts originating in React-owned raw homepage markup

`MarketingHome.tsx` imports `home-markup.html?raw`, changes it before insertion, and explicitly re-executes remaining script tags. These are materially different from inert HTML strings and need their own controls.

| Raw-markup script / target | Origin | Runtime disposition | Safety implication |
| --- | --- | --- | --- |
| Rate-widget inline script | self | **Not delivered to the React marketing DOM.** The replacement regex removes the widget section and its immediately following script before insertion. | Keep the release test asserting that the hold replaces this widget; do not accidentally broaden the replacement boundary so it removes adjacent valid markup. |
| First HubSpot container initializer | self | Delivered and re-executed after React mount. It derives a booking URL from pathname and appends the current query string. | Observed query propagation is a privacy decision, not an implementation detail. Baseline it before changing; later scope any allow-list with marketing/privacy approval. |
| `https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js` | HubSpot static CDN | Delivered through raw markup and re-executed by `runEmbeddedScripts`. | No SRI. It is the only observed third-party script loaded dynamically after React inserts the homepage. |
| Second HubSpot container initializer | self | Delivered and re-executed after React mount. `repairHomepageSemantics` gives the two containers unique IDs and adjusts their matching lookups. | Test both containers, not only the first booking CTA. |
| `https://meetings-na2.hubspot.com/mark-michael/greenstreet-book-a-demo-page?embed=true` | HubSpot meetings | A `data-src` target for the embedded meetings container; the vendor loader is expected to turn it into a frame. | Dynamic-frame behavior is **inferred** from the markup/loader contract and CSP. Verify its actual requests, frame origin, and error state in a browser. |

### HyperFrame executable surface

| Source / target | Origin | Role | Constraint |
| --- | --- | --- | --- |
| `/hyperframes/how-it-works/step-scene.html?step=1..5` | self | Same-origin template fetched by `step-scroll.js`, then assigned into an iframe `srcdoc`. | The parent reads the child timeline and document, so sandboxing is not a drop-in hardening change. |
| `/vendor/gsap.min.js` | self | Self-hosted GSAP 3.15.0 copy used within the HyperFrame template. | It is a distinct copy from both the Webflow CDN globals and Vite-bundled GSAP. Track it in the asset manifest before consolidation. |
| Inline HyperFrame script | self | Generates the scene, exposes the timeline, and supports parent control. | It is necessary for the iframe integration; do not block inline execution without redesigning the frame contract. |

### Non-script third-party and external destinations

| Origin / target | Observed purpose | Current handling |
| --- | --- | --- |
| `https://cdn.prod.website-files.com/.../greenboard-00.shared.57c976e80.css` | Webflow visual stylesheet. The source/build include it twice; only one duplicate link carries an SRI value. | Preserve visual parity before deduplicating. The duplicate, no-SRI load is not an integrity control. |
| `https://fonts.googleapis.com` and `https://fonts.gstatic.com` | Google Fonts CSS and font files. | Allowed by CSP style/font directives. Browser-test fallback typography and CLS before any host change. |
| `https://*.googleapis.com`, `https://*.firebaseio.com`, `wss://*.firebaseio.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com` | Firebase client auth and Firestore connectivity, based on `src/firebase.ts` and CSP. | Actual project hosts depend on `VITE_FIREBASE_*` configuration and were not present in the worktree. Test only against an approved non-production Firebase project. |
| Facebook, X/Twitter, and LinkedIn share URLs | Navigation targets generated by the social-share helper, not loaded scripts. | No current CSP `connect-src` expansion is required for a normal user-initiated navigation. |
| CookieYes source tag | `https://cdn-cookieyes.com/.../script.js` is present in `index.html` source. | **Not in the inspected `dist` artifact.** `release-html-sanitizer` removes the exact tag. Keep a build-output check; do not assume source absence equals release absence. |
| Opaque same-origin analytics loader path | An async `/<opaque-path>` tag is present in source and is called out by the current build warning. | **Not in the inspected `dist` artifact.** `release-html-sanitizer` removes the exact stale tag to prevent the SPA fallback being fetched as JavaScript. |
| Google analytics inline queue | The built document retains `google_tags_first_party`, `dataLayer`, and `gtag` initialization for ID `G-JERVW0S7X4`. | No `googletagmanager.com` or `google-analytics.com` loader was observed in the inspected build output. Outbound analytics behavior remains browser-unverified. |

## CSP, headers, and deployment constraints

### Observed Vercel policy

`vercel.json` supplies a site-wide Content-Security-Policy with `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, HTTPS upgrade, HSTS, `nosniff`, a restrictive Permissions-Policy, and a strict referrer policy. It explicitly allows the Webflow, jsDelivr, CloudFront, HubSpot-static, fonts, Firebase, and HubSpot-meetings origins listed above.

This is a meaningful baseline, but it is not yet a strict script-trust policy:

- `script-src` contains both `unsafe-inline` and `unsafe-eval`.
- Remote JavaScript sources have no SRI attributes.
- The policy has no reporting endpoint or report-only rollout path in the repository.
- `connect-src` allows wildcard Google/Firebase hosts, which is appropriate only while a concrete Firebase project and feature contract are verified.
- The HubSpot message listener accepts messages from any HTTPS `*.hubspot.com` subdomain rather than pinning the observed meetings origin and source window. That is an observed boundary to test and narrow only with conversion-flow proof.

### Deployment-target ambiguity

`vercel.json` defines the headers. `firebase.json` defines Hosting rewrites but contains no corresponding Hosting `headers` section. Therefore, the repository alone does not prove that a Firebase Hosting deployment receives the same CSP or security headers. Every release must state the actual hosting target and include a live-header assertion; do not rely on a local configuration file that the target does not consume.

### HyperFrame fallback compatibility finding

The Vercel CSP permits `frame-src https://meetings-na2.hubspot.com` but does not include `'self'`. `step-scroll.js` first fetches the same-origin HyperFrame template and assigns it as `srcdoc`; on fetch failure it falls back to `iframe.src = "/hyperframes/how-it-works/step-scene.html?step=..."`.

It is **inferred**, not browser-proven, that the fallback navigation may be blocked by the current `frame-src` directive because it is same-origin but `'self'` is omitted. This is a no-breakage finding, not authorization to relax CSP. First prove the primary and fallback paths under the real deployment header. If a policy change is justified, make it in a report-only/staging phase with an explicit regression test.

## Integrity, privacy, and rollback assessment

| Area | Observed state | Risk if changed casually | Safe containment rule |
| --- | --- | --- | --- |
| Remote script provenance | All observed remote JavaScript lacks SRI. Webflow filenames and versioned URLs are not a replacement for an approved digest. | A vendor change or an accidental URL rewrite can alter active code. | Freeze an allow-list and capture reviewed hashes before self-hosting, pinning, or removing any source. |
| Raw HTML script execution | React deliberately re-executes remaining scripts from a raw HTML import. | A future raw-markup edit can add executable behavior without a TypeScript import review. | Add an explicit script manifest/test first; migrate one approved script at a time only after parity tests. |
| Booking data | Raw scripts append pathname and any current query string to the HubSpot meeting URL. The legacy redirect intentionally avoids forwarding hero-form email. | Query values can become third-party booking parameters; deleting the embed breaks booking. | Record current requests; obtain privacy approval before parameter minimization or consent gating. |
| Conversion telemetry | A HubSpot-origin message pushes `hubspot_meeting_booked` into `dataLayer`; a Google queue remains in the build without an observed Google loader. | Removing listeners can break conversion reporting; adding loaders can create new tracking. | Treat telemetry as opt-in product behavior with owner, retention, and consent evidence. |
| Marketing lifecycle | Start/stop code kills ScrollTriggers, destroys tracked Swipers, clears tracked intervals, and removes selected handlers. | Moving scripts can reintroduce duplicate handlers, scroll hijacks, memory leaks, or route regressions. | Test root -> SPA -> root and repeated navigation before every runtime change. |
| Self-hosted helpers | Helpers depend on exact markup IDs/classes and use same-origin fetches/iframe access. | CSP tightening, lazy loading, sandboxing, or markup cleanup can break silently. | Preserve their fallback/error states and test blocked-network paths. |
| Rollback | No runtime rollback artifact or vendor asset manifest was found in this wave. | A CDN or CSP release could require a source revert while the remote artifact has changed. | Before mutation, save a deployable known-good artifact plus approved external asset hashes and a one-command rollback procedure. |

## No-breakage containment sequence

The sequencing below deliberately separates evidence collection from behavior change. A later wave may stop at any gate without modifying the working homepage.

1. **Freeze and characterize.** Record the exact release commit, generated `dist/index.html`, external URL list, local helper hashes, desktop/mobile screenshots, and a browser network HAR for `/` and one direct SPA route. Make the output a release artifact, not an informal console observation.
2. **Turn the inventory into an enforceable contract.** Add a test that parses the built HTML and fails on an unapproved script/origin, missing approved script, unexpected CookieYes/stale-loader revival, or loss of the required Webflow/GSAP/Swiper order. This is additive and should run before any runtime refactor.
3. **Prove current behavior under failure.** In a staging browser, block one external origin at a time and capture the user-visible degradation. Exercise the HyperFrame fetch-success and forced-fallback paths under the actual CSP. Do not remove a vendor merely because a static search finds no direct call.
4. **Separate static ownership from execution.** After contract tests exist, create a reviewed manifest with owner, version, URL, SHA-384/SHA-256, license, reason, CSP directive, rollback artifact, and acceptance test for every retained external asset. Keep current URLs/order unchanged in this phase.
5. **Migrate one dependency at a time, only where justified.** Candidate order: unused Finsweet utilities; duplicate Webflow stylesheet; explicit vendor pin/cache or self-hosted copy; then a narrow raw-markup script allow-list. Each candidate needs a separate feature flag or isolated release and immediate rollback.
6. **Treat HubSpot as a product integration.** Before defer-on-consent, query minimization, or source-window tightening, obtain an owner decision for booking, attribution, retention, and regional privacy rules. Test both booking containers, cancellation, completion message, and conversion event end-to-end.
7. **Harden CSP last, in report-only first.** Convert inline blocks to nonce/hash/module ownership only after the manifest and browser tests prove parity. Add `frame-src 'self'` only if the verified HyperFrame fallback requires it. Narrow remote hosts only after real requests prove the reduced policy is sufficient.
8. **Release with observation and rollback.** Ship to staging, compare console errors, failed requests, layout snapshots, Core Web Vitals, and booking completion to baseline. Promote only after the production-hosting header check passes. Preserve the previous artifact and manifest for rollback.

## Required browser regression matrix

| Gate | Required assertions | Blocks |
| --- | --- | --- |
| Build contract | `npm run build`, unit suite, homepage-fidelity hash, and a parser check of generated `dist/index.html`. | Script removal, source-only tags leaking into release, order drift. |
| Homepage desktop | Hero, Webflow styles, mobile/desktop navigation, drawers, Swipers, scroll animation, video controls, state-map neutral hold, and step animation all work without new console errors. | CDN, lifecycle, CSS, and helper changes. |
| Homepage mobile and reduced motion | Mobile menu focus/escape behavior, layout, interactive controls, and motion preference behavior remain usable. | GSAP/Swiper/Webflow changes. |
| Route lifecycle | Direct-load a non-home route; navigate `/` -> calculator/legal -> `/`; repeat Back/Forward. Verify no stale animation, duplicate handler, scroll hijack, or marketing DOM visibility leak. | Any index-level or lifecycle change. |
| HubSpot booking | Open each booking route/container; inspect created frame origin; submit/cancel a non-production test booking; assert conversion message handling and no form email appears in URL/history/referrer. | HubSpot, privacy, CSP, telemetry changes. |
| HyperFrame resilience | Confirm same-origin template fetch and timeline control; force fetch failure; observe whether `iframe.src` fallback works under the deployed CSP; retain a visible fallback if either path fails. | CSP, iframe, helper, or asset-hosting changes. |
| Network allow-list | Capture third-party requests for homepage and direct SPA route; compare against the manifest. Confirm source-only CookieYes/stale opaque-loader URLs are absent from generated release and live release. | Vendor additions/removals and release sanitizer changes. |
| Hosting headers | Assert actual Vercel or Firebase response headers on `/`, a direct SPA route, static JS, and HyperFrame template. | CSP/header changes or hosting-target changes. |
| Firebase boundary | With an approved non-production config, verify auth, Firestore, WebSocket/long-poll fallback as applicable, and configured failure behavior. | CSP/connect-src changes. |

## Decision owners required before a change

- **Marketing/product owner:** which visual interactions, booking flows, attribution events, and vendor functionality are required.
- **Privacy/legal owner:** consent basis, permitted HubSpot query parameters, recording/retention terms, and analytics scope.
- **Platform/security owner:** approved remote asset provenance, hosting target, CSP report endpoint, SRI/hash process, and rollback artifact location.
- **Frontend owner:** acceptance screenshots, accessibility behavior, lifecycle and failure-path tests.
- **Firebase owner:** approved project configuration and exact browser network endpoints to retain.

## Exit criteria for this wave

- Every observed current browser script/origin has a stated role, delivery disposition, and preservation note.
- Source-only versus built-output behavior is explicit for CookieYes and the stale opaque script path.
- The dynamic raw-markup execution path and HubSpot integration are not mistaken for ordinary static HTML.
- The HyperFrame/CSP compatibility question is recorded as a test-gated inference rather than changed speculatively.
- Future runtime work has an additive, one-dependency-at-a-time sequence and browser gates designed to protect what already works.
