# GreenStreet Wave Status and Execution Sequence

Status: program synthesis and local execution update, 2026-07-28. This file sequences the completed program-wave baselines and records additive local preservation work; it does not authorize a release, a public claim change, a deployment, a skill installation, or a relaxation of a hold.

## Execution update: preservation tranche 1

The five smallest preservation slices in section 4 have now been prepared in the isolated `codex/greenstreet-ultraplan` worktree. They are still uncommitted local work and must be serially validated together before review:

1. `src/governance/holdEvidenceSubjects.ts` and its test map all 14 existing holds to stable, default-off evidence subjects without any product import.
2. `src/serverApp.test.ts` locks current anonymous, held-tool, lead-admission, CORS, and API-header behavior without changing server code.
3. `src/seo/routeSurfaceContract.test.ts` locks held, published-alias, held-alias, and unknown-route resolver/metadata/sitemap behavior without changing route code.
4. `src/governance/thirdPartyReferenceManifest.test.ts` builds to an operating-system temporary directory and locks the current ordered external script/link manifest without changing HTML, Vite, or runtime code.
5. `scripts/report-build-artifacts.mjs` is an opt-in, reporting-only command that inventories a completed `dist/` directory; it does not set a budget, rewrite assets, or run in the served application.

An independent isolation review passed for these artifacts: no production consumer imports the new governance modules, protected calculator/lead/auth/Firebase/marketing paths have no diff, and the report command produced identical Windows JSON output twice. Node 22 validation has passed; browser-smoke remains a separate, non-release evidence gate. Existing holds remain authoritative throughout.

## Execution update: preservation tranche 2

The next additive tranche strengthens existing contracts without changing public behavior:

1. `src/marketing/MarketingHome.test.ts` preserves the current runtime suppression of documented pricing/provider, state-law, security, customer-performance, and legacy whitepaper claims, while retaining the current transparent notices.
2. `src/serverApp.test.ts` separately proves both held DSCR endpoints (`/api/dscr/optimize` and `/api/dscr/state`) return the established `503 TOOL_RELIABILITY_HOLD` response before validation; the public solver remains validation-reachable.
3. `src/governance/availabilityTopologyContract.test.ts` derives hold views from the existing registry and checks that App's missing-Firebase-config portal branch returns the existing workspace hold before the configured dashboard branch.
4. `src/governance/deploymentAdapterContract.test.ts` checks only the checked-in build, Vercel-wrapper/rewrite, Firebase-rewrite, and shared-server-app relationships; it makes no live-host or live-runtime claim.

Two independent reviews passed for the claim/API and topology/adapter slices. The latter noted only the separately scoped, opt-in `report:build-artifacts` package script; it changes no build, start, test, dependency, or deployment behavior. Host and ephemeral Node 22 validation both passed the then-current 22 test files / 203 tests, homepage fidelity, and the production build.

## Execution update: static security tranche

Two further test-only contracts preserve the checked-in security posture without a cloud or hosted-environment change:

1. `src/governance/vercelCspReferenceManifest.test.ts` builds the homepage into an operating-system temporary directory, ignores canonical and same-origin paths, and checks that the current external script/style/font references are covered by the relevant checked-in Vercel CSP directives. It does not assert that Vercel is active, that every route is safe, or that a live header is complete.
2. `src/governance/firestoreRulesContract.test.ts` locks the current source-level catch-all and leads denials, audit-log immutability, owner-scoped access patterns, and absence of unconditional broad allows. It is not Firebase emulator, deployed-rules, IAM, or privacy evidence.

An independent review passed both slices. The final combined host and ephemeral Node 22 floor passes 24 test files / 209 tests, homepage fidelity, and the production build. These contracts preserve current static policy only; all live platform, privacy, retention, and release gates remain human-owned.

## Execution update: accessibility and clean-CI tranche

This tranche made the smallest non-financial, behavior-preserving public accessibility improvements identified by the static audit:

1. Qualify modal pill controls now expose their visual selected state with `aria-pressed`.
2. FAQ question buttons and answer regions have stable IDs, expanded/collapsed relationships, and closed panels are both `aria-hidden` and `inert`, preserving the existing CSS transition without leaving a hidden CTA reachable.
3. Article-sharing controls are labelled native new-window links, and the not-found view no longer nests a second main landmark under `DcShell`.
4. `src/governance/publicAccessibilitySemanticsContract.test.ts` preserves these source-level affordances; it explicitly does not substitute for real assistive-technology or preview evidence.
5. Shared `DcShell` pages now use the existing skip-link treatment, the public calculator's two view controls expose their selected state with `aria-pressed`, and existing Qualify modal validation text is announced through its existing conditional messages. These additions do not change validation logic, calculations, copy, payloads, focus-trap logic, or holds.

An independent validator initially found the collapsed FAQ panel incomplete; the `aria-hidden` plus `inert` correction was then independently revalidated. A guarded loopback browser smoke confirmed the FAQ state transition, Qualify pill state, share-link semantics, and not-found landmark count while blocking outbound requests. The later source-only slice passed independent static validation, but its additional local browser attempt could not start because the required browser tooling was unavailable offline; those newer rendered checks remain unverified. The combined host and explicitly invoked Node 22 floor now passes 25 test files / 217 tests, homepage fidelity, artifact reporting, and the production build. These are still local, non-release evidence gates.

## Execution update: dev-only PostCSS remediation

The previously isolated PostCSS candidate has now been applied as a controlled lock-only resolution: `postcss` moved from `8.5.15` to `8.5.24`, and its required dev-only `nanoid` moved from `3.3.15` to `3.3.16`. `package.json`, Vite configuration, runtime source, production dependencies, and deployment settings did not change. The exact current lock SHA-256 is `F823AFD0A419CC054452FA12AE00D71C70448E717E9894DDE2F84F1449C7017C`.

A clean install under Node `v22.23.1` / npm `11.6.2`, resolved-tree check, full 25-file / 217-test suite, homepage fidelity, build, artifact report, and diff check passed. The high PostCSS advisory is absent from both full and production-only audits. The npm audit service currently alternates between eight and nine moderate Firebase-effect records for the unchanged production graph; neither output includes PostCSS or NanoID, and the variation must not be attributed to this dev-only patch. The major `firebase-admin@14.2.0` suggestion remains blocked on a separately authorized Firebase Functions `nodejs20` to `nodejs22` runtime migration.

## Execution update: route-boundary and accessibility semantics tranche

This source-only tranche continued the preservation posture without changing public copy, calculations, qualification validation, lead payloads, Firebase, deployment configuration, reliability holds, or homepage content:

1. Five existing native Qualify modal controls now conditionally expose `aria-invalid` and reference the already-rendered error text with stable `aria-describedby` IDs. Their predicates exactly match the existing error-render conditions; the visual error text and submit behavior are unchanged.
2. The SPA resolver and click interceptor now reject route-prefix lookalikes such as `/book-demo/unknown`, `/book-demofoo`, `/blogger`, and `/case-studies-fake` as unknown/noindex routes. Exact Book Demo and legitimate `/blog/<slug>` / `/case-studies/<slug>` child paths remain resolved on direct load/history navigation.
3. Footer fragment links no longer both claim `aria-current="page"` on their parent page. Their existing navigation handlers were not changed.
4. The shared button primitive exposes its screen-reader label once by hiding its duplicate visual label and decorative arrow; the global error fallback now supplies a labelled `main` landmark without changing its retry/back behavior or visual styles.
5. `src/seo/routeSurfaceContract.test.ts` and `src/governance/publicAccessibilitySemanticsContract.test.ts` preserve these boundaries. They are source contracts only, not screen-reader or preview certification.

The combined Node `v22.23.1` / npm `11.6.2` validation then passed 25 test files / 225 tests, lint, homepage fidelity with unchanged hash `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9`, production build, artifact report, and `git diff --check`. At that point browser/assistive-tech behavior for the newer semantics was still a preview gate because the local browser toolchain had been unavailable in the last bounded attempt.

## Execution update: built-browser route and keyboard gate

The later bounded built-browser pass used only the current production bundle on loopback with outbound HTTPS mocked before navigation. It made no deployment, credential, form-submission, Firebase, claim, or content-policy change.

1. `src/App.tsx` now preserves a clicked internal anchor's authored pathname when navigating (`goToRef.current(resolveRoute(href), href)`), instead of collapsing a valid dynamic child link back to its collection path. `src/governance/clientNavigationContract.test.ts` locks that behavior.
2. The homepage skip target remains the same `main#main-content` landmark but now includes `tabindex="-1"`. This is the smallest focused repair for the observed keyboard defect: before it, the hash/scroll changed but focus remained on `body`; after it, `Tab` then `Enter` focuses the main landmark. The protected raw homepage source and its hash remain unchanged.
3. A real home-announcement click reached `/blog/greenstreet-go-launch` with the correct child title and H1; a browser sentinel confirmed SPA navigation rather than a full reload, and back, forward, and reload retained the child route. The local browser recorded zero error-level console messages for that journey.
4. The calculator's named view group rendered the expected initial pressed state and switched it after a real Price Solver click, also with zero error-level console messages.
5. Direct `/case-studies/vela-capital` navigation renders its scenario with no console error, but the metadata remains contradictory (`noindex,nofollow`, not-found description, no canonical, and no JSON-LD). A separate normal pointer click on the visible Vela “Learn more” control failed: the legacy card's invisible, pointer-active overlay intercepted the click and left the user on the home route. This is a real layered-card interaction defect, so the case-card journey is explicitly **failed**, not merely unverified.

The final local Node `v22.23.1` / npm `11.6.2` floor now passes lint, **26 test files / 226 tests**, homepage fidelity with unchanged hash `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9`, production build, artifact report, and `git diff --check`. This is still local evidence only; a named non-production preview URL, egress policy, and accountable release operator remain required for certification.

The unresolved case-study publication gate is now documented in [CASE_STUDY_PUBLICATION_DECISION_PACKET.md](./CASE_STUDY_PUBLICATION_DECISION_PACKET.md). A content/SEO/legal owner must select a posture for all four child pages and decide the legacy Northshore spelling before sitemap, metadata, canonical, schema, or legacy-card behavior is changed.

## 1. Current safe posture

The working application is the product baseline. Preserve the public calculator's educational arithmetic and labels, lead-intake validation and server-only persistence, authentication and missing-Firebase-config behavior, routing and noindex behavior, homepage composition and contract hash, deployment adapters, and all 14 reliability holds.

The isolated `SourceEvidence` evaluator has passed its narrow implementation validation, but it has no product-surface attachment. That validation is not a pricing, eligibility, legal, tax, or release approval. The current hold registry remains authoritative and default-deny.

Treat local skill bundles as governed inputs: Firebase bundles remain provenance-review only, and all mismatched Hyperframes bundles remain quarantined. Do not use a skill, script, or plugin outside the approved registry/ledger trigger.

## 2. Dependency-aware execution order

| Stage | Work mode | May run in parallel | Must wait for / serial exit | Accountable gate owners |
| --- | --- | --- | --- | --- |
| 0. Freeze and reconcile | Short, serial control step | Baseline-document indexing only. | Exact candidate commit, current diff, 14 holds, protected homepage hash, and current test floor are recorded. No concurrent code edit is accepted until its owner and scope are known. | Program Steward and Engineering owner. |
| 1. Evidence capture | Read-only / capture-only | Browser journey and accessibility capture; raw-versus-rendered URL and metadata crawl; third-party network/HAR/header capture; repeated cold/warm performance lab traces; Firebase/platform ownership evidence; privacy/analytics trace. | Each lane produces a dated artifact with method, environment, gaps, and owner. Findings remain observations until independently reproduced. No CWV budget is set before repeatable lab evidence exists. | QA/accessibility, SEO, frontend/performance, platform/Firebase, privacy/security owners. |
| 2. Preservation contracts | Additive test-only or default-off work in isolated branches | Route/hold/metadata contract; server-boundary contract; built-HTML third-party manifest contract; source-evidence hold-registry adapter snapshot. These can proceed only when they do not edit the same files. | A new contract must first describe current accepted behavior, pass with the existing floor, and prove it cannot expose a held route/API/output. | Engineering owner; independent validator; domain owner for the affected surface. |
| 3. Human fact and policy packets | Parallel human review, no behavior change | Identity/counterparty packet; pricing/program packet; state-law packet; privacy/data-lifecycle and analytics packet; Firebase project/IAM packet; hosting/rollback packet. | Each packet has an owner, immutable source/reference, effective and expiry dates, scope, written approval, and a named follow-up decision. Missing evidence means keep the existing estimate, disclosure, or hold. | Business and mortgage counsel; pricing/underwriting; state counsel; privacy/security; Firebase/platform; release owner. |
| 4. Small approved fixes | One subject family at a time | Independent fixes may be developed in separate worktrees only when they have no shared files, no shared runtime contract, and their own rollback. | Merge/integrate serially after focused regression, independent review, and the relevant human gate. Do not combine a claim change with an infrastructure, calculation, or visual refactor. | Surface owner plus independent validator; applicable human approver. |
| 5. Preview and release candidate | Deliberately serial | Evidence packets may be assembled in parallel, but the candidate itself is frozen. | One exact commit passes the final matrix in section 6, has a known host and rollback artifact, and receives explicit release authorization. | Release owner with engineering, QA, security/privacy, compliance/model, and product/design owners as applicable. |

### Parallel wave boundaries

The Stage 1 and Stage 2 lanes are safe to run simultaneously only as capture/test work. They must use separate worktrees or a preassigned file owner. They must not:

- update copy, metadata, formulas, Firestore rules, environment values, deployment headers, or production configuration;
- create a lead, use production Firebase data, or place borrower/contact data in screenshots, traces, logs, or fixtures;
- remove a vendor, tighten CSP, change the homepage export, or alter calculator/qualification semantics; or
- install, activate, or rewrite a quarantined skill lock.

The following are always serial after their prerequisites are met:

1. Static identity/counterparty metadata changes: counsel-approved identity packet, raw/rendered head evidence, and social-preview proof first.
2. Analytics, HubSpot, consent, or privacy-copy changes: network disposition and privacy approval first.
3. Firebase/Auth/Firestore/emulator or deployment-adapter changes: confirmed non-production project, IAM/data-lifecycle evidence, and rollback path first.
4. Any rate, program, eligibility, state-law, tax, recommendation, or held-tool change: governed evidence, responsible owner, independent model review where applicable, and default-off/rollback proof first.
5. Any CSP, third-party-script, or homepage-runtime change: browser network/lifecycle baseline, asset manifest, preview behavior and fallback tests first.

## 3. Parallel work lanes and gates

| Lane | Deliverable | Dependency | Stop if | Gate owner |
| --- | --- | --- | --- | --- |
| Critical-browser and accessibility capture | Screenshots/traces for home, calculator, lead modal, hold, unknown route, and workspace-unavailable; keyboard, focus, reduced-motion notes. | Approved non-sensitive test inputs. | Framework error, broken CTA, focus trap, failed hold, or relevant console error. Preserve evidence and do not patch speculatively. | QA/accessibility owner. |
| Raw/rendered discovery capture | URL inventory covering status, title, canonical, robots, sitemap, internal links, and social head. | Preview or explicitly labeled local/static method. | Raw and rendered facts conflict, a held/unknown route indexes, or a stale home link is confirmed. | SEO/content owner. |
| Third-party/runtime capture | Built-HTML URL list, HAR, header capture, lifecycle and HyperFrame failure-path evidence. | Known preview/hosting target; no production credentials. | Unapproved third-party egress, booking/data exposure, CSP failure, asset-order drift, or route-lifecycle break. | Frontend plus privacy/platform owners. |
| Performance lab baseline | At least three cold and warm preview runs for home, calculator, booking CTA, workspace-unavailable, content, held, and unknown routes; trace/waterfall, LCP element, CLS sources, long tasks, transfer, and failed-request record. | Fixed browser, viewport, network/CPU, cache state, and preview commit; no field telemetry. | A result is not repeatable, a critical journey regresses, or a proposal relies on static bundle size as user-impact proof. | Performance/release engineering with product, accessibility, privacy, and Firebase/security owners. |
| Platform/Firebase evidence | Environment map, project identity, deployed rules hash, service-identity metadata, host/adapter scope, and non-production test posture. | Platform owner access; redacted metadata only. | Production project is unknown, test tooling can reach production, IAM/retention evidence is absent, or adapter scope is ambiguous. | Firebase/platform and security owners. |
| API and data-boundary contracts | Test-only cases for lead admission/failure, narration auth, public DSCR/held endpoints, headers/CORS, and no response PII. | Existing deterministic suite. | A current failure mode changes, a held endpoint stops returning its hold, or a test requires weakening runtime behavior. | Security/API owner and independent validator. |
| Source-evidence and hold contract | Snapshot of all 14 holds plus default-deny evidence-to-subject mapping; no public attachment. | Existing pure evaluator validation. | Any hold, API response, sitemap exclusion, or noindex result changes. | Release/product owner and independent validator. |

## 4. First five smallest implementation slices

Each slice is deliberately additive, independently reviewable, and reversible. Run only one slice per shared behavior surface at a time.

| Order | Slice | Minimal scope and preservation proof | Prerequisites / owner | Rollback |
| --- | --- | --- | --- | --- |
| 1 | Hold-registry evidence adapter | Add a default-off adapter that maps every existing hold to required evidence subjects and snapshots all 14 stays-held outcomes. Do not attach it to public UI/API behavior. | Existing evaluator validation; Product/release owner; independent validator. | Revert the adapter-only commit; holds retain their existing authority. |
| 2 | Server boundary contract suite | Add tests only for the established lead, narration, public DSCR, held-endpoint, header, CORS, and non-PII response contracts. Do not change middleware, schemas, or persistence. | Security/API owner; synthetic fixtures only. | Revert test-only commit if an expectation is proven incorrect; never weaken production behavior to satisfy a test. |
| 3 | Cross-surface route/hold contract | Add a route inventory assertion that connects resolver, rendered view, metadata/robots, sitemap, and held API status for the accepted routes. Start with an explicit known-route/held/unknown fixture set. | Architecture owner; browser/raw-rendered evidence informs later expansion. | Revert the contract-only commit; do not change routing to make a premature inventory pass. |
| 4 | Built-HTML third-party manifest contract | Parse generated `dist/index.html` and assert approved script/origin presence and order, plus removal of source-only CookieYes/stale-loader tags. No script, CSP, or vendor URL changes. | Current asset inventory and frontend owner review. | Revert the parser/test only; preserve the current runtime unchanged. |
| 5 | Build-artifact inventory report | Add a reporting-only build artifact inventory that records role-based bundle/media observations without changing served code or setting a premature performance budget. | Frontend/performance owner reviews the report; existing deterministic floor remains green. | Revert the reporting-only commit. Do not optimize chunks, media, prefetch, or scripts until the Stage 1 lab baseline exists. |

Slices 1-5 may be prepared in parallel in separate worktrees, but they integrate serially. The next test capability after these slices is preview critical-journey smoke, which waits for the release owner to choose the browser/CI path and the platform owner to supply a non-production target. Firestore emulator, durable lead-abuse protection, CSP hardening, metadata remediation, performance optimization, and any customer-visible financial/claim change are later gated work, not substitutes for these slices.

## 5. Mandatory safety stop conditions

Stop the affected wave, retain the evidence, and return the scoped candidate to the last known-green artifact when any condition below occurs:

1. `lint`, existing tests, homepage fidelity, build, or a newly approved contract fails; the test count/floor is reduced; or the raw-home hash changes without a separately approved marketing release.
2. A route/API/sitemap/metadata change exposes a held tool, weakens noindex behavior, changes an unknown path into marketing content, or changes the missing-Firebase-config hold.
3. Calculator arithmetic/defaults/labels, lead validation/acknowledgement, lead persistence boundary, auth behavior, Firestore ownership boundary, or deployment adapter behavior drifts outside an approved slice.
4. A browser trace shows a blank/error route, relevant console error, broken booking/CTA, modal focus failure, inaccessible primary action, layout break, unexpected third-party request, or PII in a URL/log/artifact.
5. Required human facts are missing, expired, conflicting, or out of scope; an evidence evaluation denies; a policy/pricing/state/tax decision lacks its accountable owner; or a release packet relies on agent-generated assertions as authority.
6. A non-production Firebase/preview test could reach a production project, uses real leads/borrower data, or lacks a deletion and retention record.
7. A skill/plugin violates the registry: unpinned, unreviewed, quarantined, wrong-stack, secret-requiring, or broader than its approved trigger.
8. A planned change lacks a tested rollback artifact, named rollback owner, or independent validation result.

The response is to narrow or revert the scoped change, not to disable a test, update a snapshot/hash automatically, broaden the feature, or remove a hold.

## 6. Final serial validation matrix

Run this only after all parallel waves stop editing the candidate and the exact scope is frozen. A documentation-only change still requires the first row and `git diff --check`; a release candidate requires every applicable row.

| Order | Gate | Required evidence | Blocking result / owner |
| --- | --- | --- | --- |
| 1 | Scope and supply-chain review | Exact commit/diff, changed-file inventory, skill-registry status, no secret/PII artifacts, and prior known-green artifact. | Any unexplained change, quarantine violation, or unowned scope. Program Steward. |
| 2 | Clean deterministic baseline | Node 22: `npm ci` -> `npm run lint` -> `npm test` -> `npm run test:home-fidelity` -> `npm run build` -> `git diff --check`. | Any non-zero exit, test deletion, or unapproved homepage-hash change. Engineering owner. |
| 3 | Focused contracts | Run the affected route/hold, engine/golden, API/lead, homepage, evidence-guard, or Firestore-rule suites; validate the appropriate sync/worker/deployment adapter parity. | Behavior drift or default-deny failure. Surface owner and independent validator. |
| 4 | Preview critical journeys | Browser smoke for home, calculator, lead success/failure using synthetic data, direct/unknown/held routes, workspace configured/unconfigured state, and affected booking/runtime journeys. | Error shell, console error, broken CTA/form, unsafe route, PII exposure, or unavailable rollback. QA/release owner. |
| 5 | Domain evidence and human approval | Current owner, source/hash, effective/expiry/scope, approvals, privacy/data-lifecycle record, platform/Firebase attestation, and model/counsel approval where touched. | Missing, expired, conflicting, or out-of-scope evidence. Applicable human owner. |
| 6 | Accessibility, visual, performance, and discovery | Scoped keyboard/focus/reduced-motion review, approved visual diffs, reproducible performance profile/budget, raw/rendered metadata/canonical/robots/sitemap evidence, and hosting-header evidence. | Critical accessibility or visual regression, budget breach without exception, crawl/control mismatch, or header/adapter mismatch. Design/accessibility/SEO/platform owners. |
| 7 | Rollback rehearsal and authorization | Previous deployable artifact, rollback command/runbook, rehearsal result, post-rollback smoke, release record, and explicit go/no-go. | No proven recovery path or missing approver. Release owner. |
| 8 | Post-release observation | Health and critical-journey smoke, error/PII/third-party observation, monitoring window, open-risk owners and dates. | Material regression or unowned open risk. Release and operations owners. |

No parallel wave can substitute for this final serial sequence. A passing test proves only its scoped implementation contract; it never by itself releases a financial, legal, pricing, state-law, tax, recommendation, identity, privacy, or security claim.
