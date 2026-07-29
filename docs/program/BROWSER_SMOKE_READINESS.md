# Browser Smoke Readiness

## Status

**Not ready for a non-production preview smoke suite.** A non-production deployment target, its access boundary, and its accountable owner are **missing** from the current program record.

This is a read-only/local-only readiness pass. It made no application, configuration, CI, dependency, credential, authentication, form-submission, or production/preview changes.

## Local automation availability

- Native `npx` was available (`11.7.0`) and the Playwright CLI opened an isolated, in-memory Chrome session through `npx --package @playwright/cli`; no global installation or Playwright test spec was created.
- The bundled CLI wrapper exists. Its direct WSL execution was not usable because its Windows line endings prevented its shebang from running, and that WSL environment did not have the required Chrome distribution. The native `npx` invocation was therefore used for the local-only check.
- No screenshots, video, trace, storage state, credentials, user-entered values, sign-in, or form submission were used.
- A later bounded run served the current production build only on `127.0.0.1:4596`. An `https://**` route mock was installed before local navigation, so no third-party HTTPS request was allowed to leave the isolated browser session.

## Verified local observation

The only completed guarded browser observation used `http://127.0.0.1:4583/` with all HTTPS traffic mocked before the local route loaded.

| Route | Verified observation | Result |
| --- | --- | --- |
| `/` | Loaded with title `Greenstreet Finance | DSCR loan tools for real estate investors`; fresh accessibility snapshot contained the primary DSCR scenario heading plus `Rate estimates are under review.` and `State-rule conclusions are under review.` | Content smoke passed |

The local Vite development surface emitted three error-level HMR WebSocket diagnostics. They are development-server diagnostics, not a production-bundle verdict. A future browser gate must use the built application or a deployed preview rather than treating this dev-server console state as a release result.

An earlier unguarded local home load passively attempted third-party booking requests that returned 404. No interaction, credentials, or user data were supplied. The guarded observation above mocked outbound HTTPS before navigation; this confirms why future smoke runs need an egress block or a reviewed test stub before loading the site.

## Current built-artifact observations

The following bounded checks used the current `dist/` bundle on loopback only. They are local rendered evidence, not preview certification or a substitute for visual, screen-reader, responsive, analytics, CSP, or hosted-route checks.

| Route / journey | Verified observation | Result |
| --- | --- | --- |
| `/` → keyboard skip link | `Tab` focused “Skip to main content”; `Enter` set `#main-content`, scrolled to it, and moved focus to `MAIN#main-content`. The landmark now has `tabindex="-1"`. | Passed after the minimal focus-target repair. |
| `/dscr-calculator` | The labelled `DSCR calculator view` group initially exposed DSCR Gauge as pressed and Price Solver as not pressed; a real Price Solver click reversed those states. | Passed with zero error-level console messages. |
| `/` → `/blog/greenstreet-go-launch` | The authored announcement-link click kept the exact child pathname, correct article title/H1, and an in-page sentinel; back, forward, and reload all retained the child route. | Passed with zero error-level console messages. |
| `/case-studies/vela-capital` direct load | The detail page rendered its scenario H1 without console errors. Its runtime metadata instead remains `noindex,nofollow`, not-found description, no canonical, and no JSON-LD. | Rendering passed; publication metadata is an unresolved owner gate. |

The home case-study cards are a **browser-click failure**, not merely an unverified result. A separate fresh built-preview run made a normal, non-forced pointer click on the visible Vela “Learn more” control. Its hidden full-card `.cs-abs-link` overlay (marked `aria-hidden` and removed from tab order) intercepted the pointer; no navigation occurred and the home route remained visible. The browser had no error-level console messages. This is an application layering/interaction defect. The dynamic-navigation source contract and passing blog journey prove the generic interceptor repair; they do not certify this separate legacy carousel interaction. No markup or pointer-behavior change has been made while the case-study publication and legacy-Northshore decisions remain owner-controlled.

## Unverified routes

The following routes/journeys remain **not pass results**:

- `/tools/decision-support` (a held route)
- `/browser-smoke-readiness-missing` (an unknown route)
- a real pointer-driven case-study card journey

## Required gate for a true preview smoke suite

1. Name a non-production deployment URL/environment and one accountable release owner. This is currently missing.
2. Confirm that the target uses non-production-only credentials and test-only data handling; do not permit real borrower, account, or lead data.
3. Add an explicit browser egress policy: allow the preview origin and required static assets only; stub or disable booking, analytics, payments, identity, and other external integrations unless a dedicated test sandbox is owned and approved.
4. Run against the built preview, not Vite development middleware, and record the browser/version, target revision, timestamp, and responsible operator.
5. Use no-PII route checks for homepage availability messaging; calculator rendering with approved synthetic inputs only; held-route refusal messaging with no decision output; unknown-route 404 rendering; and a real primary-click/back/refresh journey for a `/blog/<slug>` and `/case-studies/<slug>` child URL. The latter is necessary before changing the known dynamic-link interceptor behavior.
6. Define pass/fail rules for status, title, main landmark/heading, required reliability-hold text, console/network allowlist, and absence of unintended submissions or authentication redirects.
7. Keep artifacts ephemeral and redacted. Do not save storage state, screenshots, traces, or network bodies containing user or account data; retain only review-approved summaries.

## Local cleanup

The historical task-owned listener on port `4583` and its launcher were stopped and verified absent. The later task-owned built-preview listener on port `4596` and the `greenstreet-gate-main` browser session were also stopped and verified absent. Unrelated pre-existing browser sessions were left untouched.

## Supplementary local accessibility smoke

After the additive accessibility semantics slice, a second loopback-only browser smoke ran against `127.0.0.1:4583` with outbound requests aborted before navigation. It used no credentials, submissions, or real data and followed no external share link. It verified only the following local rendered behavior:

- Closed FAQ panels had `aria-hidden="true"` and `inert`; after a toggle, a previously closed answer CTA could not receive programmatic focus. The open panel exposed its labelled region.
- The Qualify modal's Short-term rental pill changed `aria-pressed` from `false` to `true`.
- The four blog-sharing controls rendered as labelled `<a>` elements with `href`, `target="_blank"`, and `rel="noopener noreferrer"`.
- The not-found route rendered one main landmark, one contentinfo landmark, and the expected primary/footer navigation landmarks.

This is local rendered evidence only. It does not replace preview, deployed-host, visual, screen-reader, contrast, responsive, analytics, CSP, or release certification.

## Superseded tooling limitation

A previous local browser attempt for the shared skip link, calculator selected-state, Qualify validation-alert/field-association additions, route-boundary behavior, and later button/error-fallback semantics did not produce browser evidence because its tooling was unavailable. The current built-artifact observations above supersede that limitation only for the homepage skip journey, calculator selected state, direct case rendering/metadata inspection, and the blog dynamic-link journey. The remaining validation scope still requires a named non-production preview and release owner.
