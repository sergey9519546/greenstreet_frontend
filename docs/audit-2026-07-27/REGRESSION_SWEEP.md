# Greenstreet full regression sweep — 2026-07-27

## Release outcome

This pass preserves the accepted Webflow homepage composition while repairing the React delivery layer, shared navigation, public claims, released calculator boundaries, editorial surfaces, privacy posture, and deployment headers.

## Confirmed defects fixed

| Severity | Area | Defect | Resolution |
| --- | --- | --- | --- |
| Critical | Mobile navigation | The Webflow animation initialized multiple times. One activation could play and reverse the menu at once, leaving only the close icon over the page. | Removed duplicate initialization, namespaced and cleaned up the single handler, then verified visible open/close states. |
| High | Navigation accessibility | Homepage hamburger controls were non-focusable `div` elements with no name, expanded state, Escape behavior, focus containment, or focus restoration. | Added button semantics, Enter/Space support, `aria-controls`, `aria-expanded`, Escape close, focus loop, and focus restoration without changing geometry. |
| High | Public claims | Homepage still claimed in-house underwriting/funding, instant pricing, current 50-state rules, fast closes, bank-grade security, program matching, and unverified customer outcomes. | Replaced those statements in the React sanitization layer so the accepted source export and layout remain intact. |
| High | Testimonials and metrics | Invented names, organizations, quotes, logos, user counts, time savings, and growth figures looked like verified customer evidence. | Reframed the section as constructed teaching content, removed named attribution, and replaced measured-looking figures with explicit illustrative labels. |
| High | Editorial guidance | Several public articles presented universal qualification, pricing, seasoning, documentation, timeline, and approval guidance. | Replaced the affected public articles with provider-confirmation guidance and aligned SEO titles. |
| High | Product semantics | Engine and dormant tools used labels such as “approved,” “likely qualifies,” “best pricing,” and “lenders only” for unvalidated modeled thresholds. | Renamed outputs to neutral payment-coverage language and strengthened the unvalidated-model disclaimer. |
| High | Privacy | Vector de-anonymization, Google Tag Manager, Claydar, HubSpot tracking, and CookieYes were loaded without a verified consent owner or retention policy. | Removed optional analytics/de-anonymization loaders. Kept only the explicit meeting embed required by the review flow. |
| High | Browser security | Production HTML had no site-wide CSP, HSTS, framing, MIME, referrer, or permissions policy. | Added Vercel security headers and a domain allowlist CSP. |
| High | Runtime security | `package.json` pinned Node 20 after its March 2026 end of life. | Moved the declared build/function runtime to supported Node 22.x. |
| High | CI runtime | GitHub Actions v4 and the workflow test matrix still ran on deprecated Node 20. | Upgraded checkout/setup actions to their Node 24-based v5 releases and the project test runtime to Node 22. |
| Medium | Dormant Webflow forms | The retained Webflow runtime tried to initialize two deliberately disconnected homepage forms and logged “improperly configured forms” in production. | Preserved the accepted visual wrappers and disabled controls while replacing the stale `<form>` elements with non-submitting layout containers. |
| Medium | Homepage semantics | No main landmark or skip link; unnamed overlay links and dismiss control; duplicate exported IDs. | Added a real `main`, keyboard-visible skip link, accessible names, and deterministic ID deduplication while preserving Webflow grid placement. |
| Medium | Embedded booking | Two meeting containers shared `id="hs-booking"` and scripts targeted the first match. | Assigned unique IDs and paired each setup script with its own container. |
| Medium | Calculator validation | Released monetary inputs accepted negative values and propagated them into results. | Added zero lower bounds and state-level non-negative clamping. |
| Medium | Case-study integrity | “Same-day rate lock,” “hard costs saved,” and proof/approval language remained in explicitly hypothetical scenarios. | Replaced them with modeled checkpoints, cost exposure, and source-verification language; renamed the surface “Illustrative Scenarios.” |
| Medium | Disconnected form | The whitepaper form collected personal data and displayed a success message without a delivery backend. | Disabled its controls and clearly states that no information is sent. |
| Medium | Tracking/runtime duplication | Third-party scripts injected duplicate DOM IDs and redundant network work. | Removed the optional loaders and repaired remaining first-party ID collisions. |
| Low | Motion copy | A public animation displayed “Rate locked.” | Changed it to “Scenario saved.” |
| Low | Metadata consistency | Component effects overwrote “Illustrative Scenarios” with “Case Studies,” and the shared announcement contradicted the sanitized homepage. | Unified titles and announcement copy across homepage and routed pages. |

## Validation completed

- TypeScript/lint passed.
- 156 unit tests passed.
- Production build passed.
- Accepted homepage source hash passed unchanged.
- Desktop homepage: 1440×900, no horizontal overflow, correct pistachio/midnight navbar, all links inside the viewport.
- Mobile homepage: 390×844, 96px navigation, 64px menu control, no overflow.
- Mobile menu: pointer and keyboard open, visible menu, Escape close, focus restoration.
- Released calculator: mobile rendering, accessible control names, negative-value clamp, no `NaN` or `Infinity`.
- Public route sample: one `main`, one `h1`, no broken images, no unnamed controls.
- Homepage output: no targeted unsupported claims, duplicate IDs, or optional tracking scripts.

## Owner-supplied blockers still required

These are not safe to invent in code:

1. Legal entity name, NMLS identifier, license/state coverage, and the exact relationship between Greenstreet and any responsible lender or broker.
2. A named privacy controller, monitored privacy-request channel, retention/deletion schedule, subprocessors, and signed data-processing terms.
3. An accountable owner and dated primary sources for rate sheets, lender matrices, state-law conclusions, tax logic, insurance rules, and update cadence.
4. A real CRM/reviewer owner, response policy, and service-level expectation for scenario-review requests.
5. Verified customer permissions and evidence before publishing names, logos, testimonials, performance statistics, or transaction outcomes.
6. Formal accessibility testing with screen-reader users and a published accessibility contact/process.
7. A complete React-owned replacement for the remaining Webflow runtime. The present CSP still permits inline script/style execution because the accepted export depends on it.
8. Performance work on the authenticated workspace and Firebase bundle. The Firebase client chunk is about 524 kB minified (about 122 kB gzip); it is separated for caching but remains a meaningful download when that code path loads.

No held rate, provider, legal, tax, stress, STR, portfolio, or decision-support tool should be released until its corresponding source-owner blocker is closed.
