# GreenStreet Release and Test-Readiness Wave Baseline

Status: documentation-only baseline, 2026-07-28

Scope: the isolated `codex/greenstreet-ultraplan` worktree's current test seams, CI, built-output snapshot, critical routes, and a safe path to browser, accessibility, visual, and performance coverage.

Change authority: none. This document does not add a test runner, browser package, CI job, source change, deployment, or release authorization. It records the working baseline so later work cannot weaken it accidentally.

## 1. Non-negotiable preservation rule

The currently working product is the baseline. A release-oriented change must preserve:

- public marketing-home composition and the raw-markup fidelity contract;
- public DSCR calculator inputs, educational output labels, arithmetic, and golden results;
- lead-intake origin checks, bounded schema, consent requirement, honeypot behavior, persistence allowlist, and fail-closed errors;
- known-route resolution, legacy aliases, browser-history behavior, canonical metadata, sitemap exclusions, and unknown-route handling;
- every reliability hold, its unavailable public behavior, its `503` API behavior where applicable, and its `noindex,nofollow` protection;
- the missing-Firebase-config hold for `/investgo` rather than a partially working workspace; and
- the existing server, Firebase Functions, and Vercel deployment adapters.

Passing a new test never authorizes release of a held financial, legal, tax, pricing, state-rule, or recommendation feature. Those remain default-deny until their separate evidence and human-approval gates are complete.

## 2. Observed baseline

| Surface | Observed implementation | Current evidence | Release meaning |
| --- | --- | --- | --- |
| Runtime | `package.json` requires Node `22.x`; npm is the project package manager. | CI uses `actions/setup-node@v5` with Node 22 and `npm ci`. | Local and CI validation must use Node 22; a different runtime is not an equivalent baseline. |
| Static/type gate | `npm run lint` runs `tsc --noEmit`. | Required in `.github/workflows/ci.yml`. | A type failure blocks promotion. |
| Unit/route/API gate | `npm test` runs `vitest run`. The source snapshot contains 16 test files, 33 suites, and 128 literal `it(...)` declarations; parameterized tests make the runner's executed total larger. | Earlier clean baseline completed 15 files / 156 tests; current concurrent changes require a fresh serial rerun before integration. | Existing tests are a floor, not a set that may be deleted to make a change pass. |
| Homepage contract | `npm run test:home-fidelity` hashes the protected raw home export. | CI now requires the contract; the prior accepted SHA-256 is `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9`. | Any hash change is a release block unless the product owner explicitly approves the marketing-export change and the browser checks below pass. |
| Production build | `npm run build` runs Vite plus three esbuild server/worker/function bundles. | The current `dist/` snapshot exists and prior clean baseline build completed. | A build must succeed after every source or dependency change. Build success alone is not user-journey evidence. |
| CI | One GitHub Actions job: Node 22, `npm ci`, lint, Vitest, homepage fidelity, and build. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` is set. | `.github/workflows/ci.yml`. | Current CI is the required deterministic minimum; it does not prove browser behavior. |

The built-output snapshot contains 2,135,492 bytes of JavaScript before compression. Its largest current chunks are Firebase (523,882 bytes / 122,059 gzip), main index (386,500 / 77,263), ComplianceDashboard (318,607 / 80,945), vendor (258,058 / 80,976), and React (194,903 / 61,138). These are observations, not performance budgets. No reproducible browser metric, device profile, or deployed-preview measurement has yet set a defensible threshold.

## 3. Existing layered coverage

| Layer | What is covered now | Principal tests or command | Important boundary |
| --- | --- | --- | --- |
| Type safety | TypeScript compilation of the project. | `npm run lint` | No lint-style, bundle, runtime, or browser check is implied. |
| Deterministic engine | Payment factors, PITIA, IO handling, DSCR solving, input defaults, PPP behavior, warnings, golden values, monotonicity, and selected historical bug regressions. | `src/engine/*.test.ts` | Tests prove implementation behavior, not current lender program, state-law, tax, or pricing authority. |
| Public calculator parity | Public LTR calculation uses shared defaults and accounts for HOA. | `publicDealAnalysis.test.ts`, `qualify.test.ts` | There is no rendered-browser calculator form journey yet. |
| Fail-closed behavior | Risk never improves improperly; unknown jurisdictions are held; sync engine fallback works. | `failClosed.test.ts`, `modes.test.ts`, `toolReliabilityHolds.test.ts`, `routes/dscr.test.ts` | Browser route, metadata, and deployment behavior are not exercised together. |
| Lead intake | Bounded payload, origin filtering, consent, honeypot, no result snapshots, stable errors, and allowlisted persistence. | `routes/leads.test.ts` | No Firestore-emulator, browser form, real auth, or production data test exists; production leads must never be used as test fixtures. |
| Routing and discovery | Canonical/legacy route resolution, blog handling, not-found behavior, held-tool noindex and sitemap exclusions. | `router/resolve.test.ts`, `seo/*.test.ts` | No direct-navigation/back-forward/crawl test in a rendered SPA or deploy target exists. |
| Marketing-home safety | Unsupported widgets and claims are suppressed; selected landmarks and controls are repaired. | `marketing/MarketingHome.test.ts`, homepage hash contract | Contract hashes raw input only; it is not a screenshot, interaction, mobile, console, or network test. |
| Evidence guard (work in progress) | The new governance evaluator has focused unit tests. | `src/governance/sourceEvidence.test.ts` | It must not be wired into public behavior until its independent validation gate is green. |
| Build/deployment artifacts | Client bundle and server/function adapters compile. | `npm run build` | No Firebase/Vercel preview smoke, static-header, or rewrite-parity test exists. |

## 4. Critical user and API journeys

| Priority | Journey and route family | Current deterministic seam | Required preservation before any rollout |
| --- | --- | --- | --- |
| P0 | Marketing home: `/` | `MarketingHome.test.ts`; homepage SHA-256 contract | First meaningful content, supported CTA behavior, repaired semantics, external handoffs, desktop/mobile layout, and absence of framework errors must remain stable. |
| P0 | Public calculator: `/dscr-calculator` | Engine, public-analysis, qualification, and schema tests | Valid inputs remain educational estimates; invalid/boundary input stays safe; arithmetic and user-visible assumptions do not drift silently. |
| P0 | Lead submission: `POST /api/leads` and its public modal/widget | Schema and Express-router tests | Invalid/cross-site/honeypot submissions never persist; valid bounded consented data retains its response contract; no financial output is sent or stored. |
| P0 | Held tools: `/state-laws`, `/deal-analyzer`, `/rate-quiz`, `/tools/*` held paths and held DSCR endpoints | Route, sitemap, metadata, API-hold, and hold-definition tests | A direct URL, in-app link, or API request must remain unavailable, noindexed, and default-deny. |
| P0 | Workspace: `/investgo` and supported subpaths | `App.tsx` environment guard and API tests | Missing/incomplete client Firebase configuration continues to show the workspace hold; no unauthenticated or half-configured workspace is exposed. |
| P1 | Public content/alias routes: `/faq`, `/blog`, `/case-studies`, `/about`, legal aliases, audience pages | Router and metadata tests | Direct navigation, history, aliases, canonical tags, and unknown-path not-found behavior remain correct. |
| P1 | Deployment adapters: local server, Firebase Function, Vercel Function | Shared `serverApp.ts` plus build | `/health`, `/api/*`, static assets, SPA fallback, and security/CORS behavior are equivalent on every adapter still in production scope. |

## 5. Present gaps

1. There is no configured project Playwright suite, Playwright dependency, browser download in CI, or preview URL test.
2. There is no rendered accessibility gate: no automated accessibility engine, keyboard-only suite, focus/dialog test, reduced-motion test, or screen-reader-oriented smoke evidence.
3. There is no approved visual-baseline system for desktop or mobile, including the legacy marketing runtime and dynamic assets.
4. There is no performance test, Core Web Vitals collection, Lighthouse run, CPU/network profile, threshold, or regression budget.
5. There is no coverage collection or threshold. Test count is useful context but is not a quality metric by itself.
6. There is no deployment integration test through Firebase/Vercel rewrites, no Firestore emulator/rules integration test, and no non-production auth/Firestore journey.
7. There is no CI security/dependency/secret scan in this workflow. That belongs to the security-platform workstream and must not be substituted by a passing frontend build.
8. The protected homepage hash prevents unreviewed raw-markup changes but cannot prove behavior after HTML rewriting, embedded-script lifecycle, font loading, animation, mobile menus, or external booking handoff.

## 6. Safe rollout order

Each stage is additive. Do not add packages, modify existing contract tests, or gate a release on a new measurement until the immediately preceding stage is green and its owner approves the artifact.

### Stage 0 — Preserve the deterministic floor (now)

Keep CI on Node 22 with `npm ci`, `npm run lint`, `npm test`, `npm run test:home-fidelity`, and `npm run build`. Require one serial execution after all concurrent worktrees stop editing shared code. Save only command summaries and non-sensitive logs; do not place secrets, leads, or borrower data in test artifacts.

### Stage 1 — Preview browser smoke (first new test capability)

Use the approved browser path for the project. If the in-app Browser capability is available, use it first; otherwise record the reason and use the repository-approved Playwright path. Do not install a browser library until the release owner approves the dependency and CI cost.

Start with a small preview-only smoke suite:

1. `/` loads meaningful content, has no framework error overlay or relevant console error, and its primary supported CTA responds.
2. `/dscr-calculator` accepts one non-sensitive happy-path input set, shows an estimate, and handles one invalid/boundary case safely.
3. A staging-only lead path proves the consent and honeypot behaviors against a stub or emulator; it must not create production leads.
4. `/investgo` without client Firebase configuration stays on its reliability hold.
5. One representative held route and one held API endpoint remain unavailable.
6. One known public alias and one unknown route prove direct navigation and not-found behavior.

Run this against a deployed preview, not a developer's production account. Keep screenshots, DOM summaries, console summaries, and test IDs free of personal or financial data.

### Stage 2 — Accessibility smoke

After Stage 1 is stable, add automated accessibility checks to the same representative routes plus manual keyboard checks. The minimum contract is landmark/name checks, visible focus, logical tab order, Escape/focus return for modals, accessible form errors, no keyboard trap, color/contrast review, and `prefers-reduced-motion` behavior. A critical blocker is any keyboard-inaccessible primary action, inaccessible form submission/error, focus loss in a modal, or error overlay.

### Stage 3 — Approved visual regression

Capture only stable, approved viewports and data states: at least desktop and mobile marketing home, public calculator before/after result, public lead modal, representative reliability hold, and workspace-config-missing hold. Freeze fonts, viewport, animation/motion preference, locale, clock, and stubbed data before comparison. Use a human-approved initial baseline; never auto-accept a changed screenshot from the same change being reviewed.

### Stage 4 — Performance baselining before budgeting

Measure production-like preview pages with a fixed device/network/CPU profile. Begin with `/`, `/dscr-calculator`, and a representative content route. Record LCP, INP, CLS, transfer size, long tasks, image/video contribution, and lazy-chunk behavior. Set thresholds only after several repeatable green runs; the observed chunk sizes in section 2 are diagnostic context, not a pass/fail budget. A regression budget must account for the deliberate idle route prefetch rather than removing it without user-journey evidence.

### Stage 5 — Deployment and data integration

Only in a non-production Firebase/Vercel environment, test rewrite parity, health, authenticated/unauthenticated API boundaries, Firestore rules, lead persistence allowlist, and rollback deployment selection. Test data must be synthetic and disposable. Promotion needs the evidence guard, compliance, privacy, and security owners where a change touches their domain.

## 7. CI and release ownership

| Gate | Accountable role | Evidence required | Stop condition |
| --- | --- | --- | --- |
| Deterministic CI | Engineering owner | Node 22 `npm ci`, lint, unit tests, homepage contract, build | Any non-zero exit, deleted/disabled baseline test, or unapproved homepage hash change. |
| Browser smoke | QA/release owner | Preview URL, interaction result, meaningful DOM, console summary, screenshots | Blank/error shell, broken primary path, relevant console error, failed hold, or failed direct route. |
| Accessibility | Accessibility owner with product QA | Automated report plus keyboard evidence for the scoped flows | Critical issue or regression in focus, form error, modal, or primary navigation. |
| Visual | Product/design owner | Approved baseline, fixed viewport/data/motion setup, diff review | Unapproved meaningful visual change, clipping, overlap, unreadable control, or layout break. |
| Performance | Frontend/performance owner | Reproducible profile and before/after metrics | Budget breach after a budget is approved, or material regression without an approved exception. |
| Deployment/data | Platform/Firebase owner | Non-production adapter, rule, auth, and rollback evidence | Rewrite mismatch, unintended data persistence, auth bypass, configuration leak, or no proven rollback. |
| Release authorization | Release owner plus applicable compliance/privacy/model owners | All applicable gates and evidence artifacts | Any unresolved P0 issue or missing domain approval. |

The repository does not name individuals for these roles. Assign a named accountable person before enabling a stage; an unowned check is informational, not a release control.

## 8. Exact preservation and rollback gates

### Pre-merge gate

1. Quiesce concurrent edits, review the scoped diff, and confirm it contains no unrelated workflow, package-lock, test-disablement, raw-home-export, or held-tool-release change.
2. From a clean Node 22 install, run in this order: `npm ci`, `npm run lint`, `npm test`, `npm run test:home-fidelity`, and `npm run build`.
3. Keep the homepage SHA-256 equal to `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9` unless a separately approved marketing change records its replacement hash and completes the browser/visual checks.
4. For a change touching a critical journey, run its already-approved layer(s) from section 6. Do not claim a browser, accessibility, visual, performance, adapter, or data gate has passed before the relevant capability exists.

### Immediate stop-and-rollback triggers

Do not promote, and revert the scoped release change or switch the deployment back to the last green artifact, if any of these occurs:

- lint, any existing unit test, homepage fidelity, build, or approved new gate fails;
- calculator golden output, fail-closed risk behavior, route status/schema, lead persistence protection, hold behavior, sitemap/noindex, or missing-config hold changes without explicit approval;
- a release candidate renders a framework error overlay, blank primary route, relevant console error, broken CTA/form path, or unsafe direct route;
- a visual baseline shows clipping, unreadable controls, overlap, or an unapproved marketing/claim change;
- an approved performance budget is breached without a written exception; or
- preview/staging evidence shows an auth/data/rule/configuration exposure or a lack of a recoverable deployment rollback.

Rollback is a release operation, not a test edit: retain the failing evidence, stop promotion, return only the scoped release/deployment pointer to the last known-green artifact, and open a narrowly scoped follow-up. Do not mute a test, update a snapshot/hash, remove a hold, or broaden the change merely to turn a red gate green.

## 9. Final serial release matrix

Parallel discovery waves are useful, but release proof is deliberately serial. Once all code/documentation waves finish and the final diff is stable, the release owner runs:

```text
Node 22 + npm ci
  -> npm run lint
  -> npm test
  -> npm run test:home-fidelity
  -> npm run build
  -> approved preview browser smoke (if present)
  -> applicable accessibility / visual / performance / deployment-data gates
  -> human release authorization
```

Any failure returns to the immediate stop-and-rollback rule in section 8. This prevents one parallel wave from masking a regression introduced by another.
