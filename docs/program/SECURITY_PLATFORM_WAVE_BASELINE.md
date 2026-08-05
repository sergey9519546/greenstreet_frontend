# Greenstreet Security and Platform Wave Baseline

Status: read-only baseline; no deployment or release authorization

Reviewed: 2026-07-28

Source boundary: `5de3b41b6e4731d1584ac056cba3441c677a4171` plus concurrent, out-of-scope working-tree changes. This document assesses only the named source and configuration artifacts; it does not prove the state of Vercel, Firebase, Google Cloud, DNS, secrets, logs, or production traffic.

Implementation authority: none granted by this document

## 1. Decision and preservation rule

Keep all existing reliability holds, public calculator behavior, lead-intake behavior, auth behavior, routing, and deployment wrappers intact. Do not solve a platform concern by silently opening a held tool, weakening `firestore.rules`, removing the server-side lead route, or turning on global API authentication before the frontend has a tested token path.

The current source has several meaningful fail-closed controls. The safest next work is additive: lock those controls down with integration and emulator tests, collect production-equivalent evidence, and then introduce narrowly scoped controls behind explicit release gates. Nothing in this baseline supports a broad rewrite or a production configuration change.

## 2. Evidence quality and limits

### Verified in the repository

| Area | Verified fact | Evidence |
| --- | --- | --- |
| Lead storage | Browser Firestore access to `/leads` is denied in every direction; the server uses the Admin SDK after validation. | `firestore.rules`, `src/routes/leads.ts` |
| Lead admission | `/api/leads` requires an exact allowed Origin, rejects `Sec-Fetch-Site: cross-site`, caps input at 8 KiB, accepts a strict bounded schema, uses a honeypot, and returns no document ID or calculation result. | `src/serverApp.ts`, `src/routes/leads.ts`, `src/routes/leads.test.ts` |
| Lead failure behavior | The browser does not save failed lead payloads to local storage and does not show success after a failed request. | `src/components/QualifyModal.tsx` |
| Paid narration | `/api/narrate` is mounted behind unconditional `requireAuth`; no frontend caller of `/api/narrate` was found in `src/`. | `src/serverApp.ts`, `src/middleware/auth.ts`, source search |
| Token verification | Invalid or unverifiable presented Bearer tokens are rejected. The mock identity path requires both `ALLOW_DEV_AUTH_BYPASS=true` and a non-production environment. | `src/middleware/auth.ts` |
| Public calculator boundary | Public DSCR endpoints use schema validation and the optimizer/state endpoints return `503 TOOL_RELIABILITY_HOLD`. | `src/routes/dscr.ts`, `src/routes/schemas.ts`, `src/routes/dscr.test.ts` |
| Firestore default | Unmatched Firestore paths fail closed. Per-user users, deals, audit logs, and artifacts have owner-scoped rules. | `firestore.rules` |
| Vercel headers | The declared Vercel configuration sets CSP, HSTS, frame denial, referrer policy, permissions policy, and `nosniff` headers. | `vercel.json` |
| CI baseline | CI runs Node 22, `npm ci`, TypeScript lint, Vitest, homepage-fidelity verification, and a production build. | `.github/workflows/ci.yml` |
| Relevant tests | `npx vitest run src/routes/leads.test.ts src/routes/dscr.test.ts` passed: 2 files, 12 tests. | 2026-07-28 local execution |
| Production dependency audit | `npm audit --omit=dev --json` reported 8 moderate and 0 high/critical findings, all through the Firebase Admin dependency tree. | 2026-07-28 local execution |
| Full dependency audit | `npm audit --json` reported 8 moderate, 1 high, and 0 critical findings. The high finding is transitive `postcss` through Vite and is marked fixable. | 2026-07-28 local execution |

### Unknown without owner or platform evidence

| Question | Why it remains unknown | Required evidence |
| --- | --- | --- |
| Is Vercel the live production host? | `DEPLOY.md` declares it, but repository text is not a live deployment inspection. | Vercel project, production URL, deployment ID, branch-to-production mapping, and owner confirmation. |
| Which Firebase project stores leads? | The deployment guide says owner confirmation is still required, while `.firebaserc` describes a historical/alternative project. | Named project ID, deployed rules hash, environment mapping, and a controlled non-sensitive write/read verification. |
| Are Firebase Admin credentials present and least-privileged? | Secrets are intentionally absent from the repository. | Secret inventory metadata only: owner, rotation date, scope, hosting environment, and a redacted startup/health verification. |
| Are Vercel, Firebase, and Google Cloud human access controls adequate? | IAM, MFA, break-glass access, audit logs, and service-account bindings are platform state. | Access review signed by the platform/security owner. |
| What happens to lead PII after storage? | Source does not establish retention, deletion, export, incident, CRM handoff, or reviewer access processes. | Approved data map, retention/deletion schedule, vendor list, and operational runbook. |
| Are third-party marketing scripts and HubSpot processing approved? | Source shows execution, not contract, consent, or processor approval. | Script/vendor inventory, DPA/privacy approval, consent design, and preview-network evidence. |
| What is the intended Firebase auth session policy? | No explicit `setPersistence` policy is present. Firebase defaults and browser behavior are not a documented product decision. | Accountable owner decision and tested browser/session matrix. |
| Is the historical Firebase Functions wrapper still usable? | It remains in source but `DEPLOY.md` calls it historical/alternative. | Owner decision, environment parity evidence, or an approved decommission plan. |

### Scope exclusions

This is not a penetration test, a legal/privacy compliance opinion, a Firebase/Vercel console review, a secrets scan certification, or a lending-model validation. A narrow tracked-file name/pattern check did not find committed environment files, private-key files, service-account credential files, or obvious credential-shaped literals outside ignored/example material; that is useful hygiene evidence, not proof that no secret exists.

## 3. Current control posture

### 3.1 Authentication and session boundary

`verifyFirebaseToken` is global for `/api/*`, but anonymous requests remain possible for public endpoints when `REQUIRE_AUTH` is unset. That is intentional for the demo calculator. It is not the protection for paid narration: `requireAuth` is mounted specifically in front of `/api/narrate`.

This separation is materially safer than relying on the global switch. It must be preserved. Setting `REQUIRE_AUTH=true` now would break public calculator traffic and would not make the current frontend send Firebase ID tokens.

The application does offer Google and email/password Firebase sign-in for the workspace. The source does not show a frontend `getIdToken()` attachment for API calls, and it contains no caller of `/api/narrate`. Therefore, narration is protected but currently has no demonstrated production client path. Treat a future client integration as a separate authenticated feature with its own tests and privacy approval.

### 3.2 API and lead PII boundary

The lead payload contains contact data and sensitive financial-context data: name, email, optional phone, property value, loan amount, rent, rate, state, FICO band, borrower type, investment experience, timeline, and consent state. The route writes server-owned submission/consent metadata and hides provider errors from the caller.

This is a sound minimum data-admission boundary. It does not authenticate a submitter: Origin is a browser signal that a non-browser client can forge, and the current rate-limit store is memory-resident. The primary remaining technical risk is spam/storage/operations abuse, not direct browser read access to submitted leads.

No session cookie authentication path was observed. CORS is configured with `credentials: false`; the lead fetch uses same-origin credentials but does not attach a Firebase token or application cookie. This reduces traditional cookie-CSRF exposure in the reviewed code, but does not substitute for an abuse-control design.

### 3.3 Firestore access boundary

The important enforced controls are:

- `/leads/{leadId}` is client-denied; Admin SDK writes bypass rules only inside the server route.
- `/users`, `/deals`, and `/auditLogs` check the caller identity; deal ownership is pinned on update, and audit-log email/type fields are constrained.
- `/artifacts/{appId}/users/{userId}/{document=**}` is restricted to its owner.
- A final catch-all denies all remaining collections.

The `artifacts` wildcard intentionally permits arbitrary owner-scoped data. The compliance dashboard writes broker settings and audit inputs/outputs there. That is not an observed cross-user access failure, but it means this area has no field schema, retention rule, data classification, or emulator attack-suite evidence. Financial scenario inputs should not accumulate there indefinitely merely because the owner rule is correct.

### 3.4 Hosting, headers, and third-party code

The declared production route is Vercel. Its CSP is a meaningful improvement over no CSP, and it prevents framing, plugin/object loading, and broad permissions. However, it currently permits `'unsafe-inline'` and `'unsafe-eval'` for scripts and permits several third-party origins.

That broadness is connected to a real compatibility constraint: `MarketingHome` intentionally injects raw legacy markup with `dangerouslySetInnerHTML` and then re-executes every embedded script. The reviewed markup and built HTML reference Webflow, jQuery, GSAP, Swiper/Finsweet, HubSpot meetings, Google tag setup, and external fonts/styles. Some historic CookieYes and opaque script tags are stripped during the Vite build, but executable third-party marketing code remains. A script executing in the page can inspect any same-document UI, including a lead form.

Do not abruptly tighten CSP or remove scripts on production. First inventory actual preview requests and dependencies, then use report-only telemetry and a visual/functional test before enforcing a narrower policy. Script removal must be approved by the marketing and privacy owners, not inferred from a static scan.

### 3.5 Environment and deployment boundary

`.env*` is ignored except documented examples. Browser Firebase configuration is intentionally `VITE_`-prefixed and therefore public; service-account JSON and the Anthropic token are server-only by convention and source placement. The source validates service-account JSON without echoing its contents and fails lead persistence safely when Admin SDK initialization cannot complete.

This establishes the desired code boundary, but not live secret hygiene. The Vercel project must prove environment separation, secret scope, rotation, and access controls. Do not put a service account into a `VITE_` value, source file, browser payload, log, or diagnostic endpoint.

`firebase.json` remains as a historical/alternative wrapper. It specifies Functions Node 20 while `package.json` and CI use Node 22, and it has no equivalent hosting-header block. Since the active deployment is declared to be Vercel, this is a divergence risk rather than proof of an active vulnerability. Do not remove it until an owner confirms it is unused; if retained, it needs an explicit parity test and runtime-support decision.

### 3.6 CI and dependency controls

The CI build is a strong regression baseline but is not yet a release-security gate. It does not run a Vercel production-equivalent build, endpoint/auth/header integration tests, Firestore emulator rules tests, dependency-policy enforcement, code scanning, secret scanning, or a preview deployment smoke test. The workflow uses mutable major action tags (`actions/checkout@v5`, `actions/setup-node@v5`) and does not declare explicit job permissions; the effective GitHub token permissions are therefore platform/repository configuration, not source-proven.

The production dependency audit has no high or critical finding today. Its eight moderates are transitive through `firebase-admin`. The full audit’s single high is `postcss <=8.5.17` through `vite@6.4.3`; it is a build-tool dependency, not evidence of browser compromise. Upgrade it in an isolated dependency PR with the full regression matrix, never with an unreviewed force update.

## 4. Reconciled findings and priority order

Historical audit documents are research inputs, not current facts. The current source has remediated several earlier high-impact patterns: direct client lead writes are denied, lead fallback storage is removed, narration has route-level authentication, the development auth escape hatch is non-production-only, and an undeclared proxy is no longer hardcoded as the narration default. Keep the historical record, but do not report those prior states as live defects without reproducing them against the deployed revision.

| Priority | Finding | Verified impact | Safe decision |
| --- | --- | --- | --- |
| Gate 0 | Production configuration is not source-verifiable. | A missing/wrong Admin credential fails lead delivery closed, but release readiness and least privilege cannot be established from this repository. | Require a redacted owner attestation and controlled preview verification before promoting lead intake. |
| P1 | Public lead abuse control is instance-local and Origin is forgeable outside browsers. | Attackers can attempt spam and storage/operational abuse; the reviewed code does not expose submitted lead data. | Add a shared durable limit and a server-verified abuse proof only after a staged, tested rollout plan. |
| P1 | Legacy marketing code executes third-party scripts in the same document as the lead form. | A compromised or unapproved script can observe DOM data; current CSP remains compatibility-broad. | Inventory and approve all scripts, add CSP report-only, then narrow policies in preview with functional evidence. |
| P1 | PII lifecycle and reviewer access are not established in source. | Retention, deletion, CRM transfer, access review, and incident handling are unknown. | Keep fields at their current minimum; do not scale promotion until a privacy/operations owner publishes the lifecycle evidence. |
| P2 | Firestore artifacts are owner-scoped but schema-free. | A signed-in user can retain arbitrary data in their own subtree; scenario and broker data can persist without a source-level retention control. | Add emulator tests and a versioned field/retention contract before expanding dashboard persistence. |
| P2 | Vercel and Firebase hosting configurations diverge. | An accidental alternative deployment could have a different Node runtime and header posture. | Confirm active host; preserve the alternative wrapper until an approved parity or retirement decision. |
| P2 | CI does not prove deployed behavior or supply-chain policy. | Existing unit/build checks can pass while headers, environments, rules, or preview routing fail. | Add non-production contract, emulator, and preview verification gates before changing release policy. |
| P2 | Dependency findings need controlled remediation. | Eight production moderates and one development high remain. | Use a pinned upgrade branch and full regression evidence; do not run broad audit fixes against the working product. |
| P3 | Error/log redaction is path-based, not an audited data-loss-prevention system. | Expected lead errors are deliberately minimal, but arbitrary upstream errors could contain sensitive context. | Add synthetic-PII log tests and platform log-retention review before enabling new PII-bearing integrations. |

## 5. Additive next slices

Every slice below is independently testable and reversible. None authorizes changes to calculator formulas, hold behavior, public route availability, or business/lending claims.

### Slice A — Server boundary contract tests

Purpose: convert the current good API behavior into a regression contract without changing runtime behavior.

Deliverables:

- Integration tests for `/api/leads`: no Origin, forged/cross-site Origin, oversized body, invalid schema, honeypot, valid accepted request, persistence failure, and no response PII/document ID.
- Integration tests for `/api/narrate`: missing token is `401`; an invalid token is `401`; an authenticated fake is allowed only in an explicitly isolated test seam; a missing LLM configuration returns `503` before egress.
- Header tests for API CSP, HSTS behavior in production mode, frame denial, `nosniff`, and CORS allowlist behavior.
- A test that the public DSCR solve/sensitivity routes remain anonymous while held routes remain `503 TOOL_RELIABILITY_HOLD`.

Acceptance evidence: Node 22, targeted integration suite, full `npm run lint`, `npm test`, `npm run test:home-fidelity`, and `npm run build` all pass.

Rollback: test-only change; revert the isolated test commit if it proves an incorrect expectation. Do not weaken production behavior to satisfy a test.

### Slice B — Firestore emulator policy suite

Purpose: independently prove the rule boundaries currently described by source.

Deliverables:

- Emulator scenarios for anonymous access, user A/user B cross-access, owner updates, owner reassignment, audit-log immutability, client denial of `leads`, and catch-all denial.
- Explicit tests for the permitted `artifacts` paths and a documented decision on which fields are allowed to contain financial/context data.
- A rules deployment manifest containing project ID, rules file hash, emulator result, reviewer, and execution date; never include credentials.

Acceptance evidence: each allow/deny test is deterministic and passes against the emulator; a deliberately changed unsafe rule must fail the attack test.

Rollback: this first slice adds test evidence only. Any later rules change must be deployed first to a non-production project with a saved prior rules version and a signed rollback owner.

### Slice C — Durable lead abuse protection

Purpose: preserve the current public lead path while making spam/cost control durable across serverless instances.

Design gate before coding: the product, privacy, and platform owners choose the provider, data minimization, retention period, budget limit, alert threshold, and failure policy. Do not add a tracker or challenge provider without those approvals.

Implementation sequence:

1. Add a server-side limiter abstraction and test double while retaining the current limiter as the initial implementation.
2. Verify a shared production-equivalent store in preview with a non-sensitive synthetic payload and a bounded load test.
3. Add a server-verified browser abuse proof only once the provider and privacy review are approved. When the gate is enabled, missing, expired, or invalid proof must fail closed before persistence and must return a stable non-sensitive response.
4. Add anonymous volume, replay, forged-Origin, unavailable-provider, and success-path tests. Alert on rejects and persistence failures without logging payload content.

Acceptance evidence: a single synthetic identity is rejected at the policy threshold across separate instances; bad/absent proof never writes; valid proof produces exactly one synthetic record; no secrets or payload content appear in logs.

Rollback: retain the existing strict schema, server-only write, and Origin checks throughout. Roll back a new provider integration through a pre-approved feature configuration only after confirming that it does not turn the route into a silent success or write unverified data.

### Slice D — Marketing script and CSP containment

Purpose: reduce script supply-chain and PII exposure without breaking the legacy marketing experience.

Implementation sequence:

1. Produce an owner-reviewed inventory of every inline/external script, style, frame, worker, network origin, purpose, page, PII adjacency, owner, contract/consent status, integrity/version pin status, and removal candidate.
2. Capture preview-network and browser-console evidence for the homepage, direct routes, mobile navigation, booking embed, and the public lead flow.
3. Add Content-Security-Policy-Report-Only in preview first. Use a report endpoint approved by the privacy owner and do not send form fields or identifiers in reports.
4. Replace broad runtime allowances only after the inventory proves they are unnecessary: prefer self-hosted/versioned assets or nonces/hashes over broad inline/eval allowances. Preserve only approved HubSpot/frame and Webflow behavior.
5. Enforce the new policy in preview, run visual/function/a11y regression checks, then promote with a documented rollback header value.

Acceptance evidence: no unexpected CSP violations in the agreed test paths; no lead field is observed leaving to an unapproved origin; homepage contract, visual checks, booking CTA, and valid/invalid lead submissions pass.

Rollback: restore the prior CSP header from a versioned configuration and preserve logs/violation evidence. Do not remove the current Vercel headers before a tested replacement exists.

### Slice E — Environment and deployment attestation

Purpose: turn source assumptions into release evidence without exposing secrets.

Deliverables:

- Per-environment inventory: host, commit, Node runtime, Firebase project ID, rules hash, service identity name/scope, secret owner/rotation date, ALLOWED_ORIGINS, and non-secret feature configuration.
- Vercel preview verification of `/health`, public DSCR solve, held endpoints, lead failure behavior when credentials are intentionally absent, and a controlled synthetic lead only in an approved non-production project.
- A check that Vercel build output uses the expected function entry (`api/index.js` and `dist/vercel.cjs`) and does not expose server-only variables in browser assets.
- An explicit owner decision for the Firebase Functions alternative: parity-test it or mark it retired; do not simply delete it.

Acceptance evidence: no secret values are printed, synthetic PII is deleted according to the non-production runbook, and the attestation identifies the exact deployable commit.

Rollback: no customer-facing behavior changes in the attestation phase. Revert only the check/documentation change if it is defective; never bypass a failed attestation for a lead-intake release.

### Slice F — CI supply-chain and dependency gate

Purpose: strengthen the existing fast regression baseline without making speculative upgrades.

Deliverables:

- Pin GitHub Actions to reviewed immutable commits and declare minimal workflow permissions after confirming repository needs.
- Add a non-blocking audit report first, with a reviewed baseline/expiry policy rather than a surprise all-vulnerability hard fail.
- Add a tracked dependency-remediation issue for `postcss`/Vite and the Firebase Admin transitive findings, including the target version, advisory recheck, full test results, and rollback commit.
- Add repository-level secret/code scanning only after the security owner approves its data-handling and alert-routing configuration.

Acceptance evidence: immutable action references, explicit permissions, audit output without credentials, and a clean Node 22 full regression run.

Rollback: revert the isolated workflow or dependency update; retain the previous passing CI workflow until its replacement has succeeded in a pull request and preview.

## 6. Regression and release matrix

| Gate | Required behavior to preserve | Evidence |
| --- | --- | --- |
| Public tools | DSCR calculator and demo paths stay available; optimizer/state stay held. | API contract tests plus existing reliability-hold tests. |
| Lead intake | Valid approved-origin synthetic lead is accepted once; invalid/missing/cross-site inputs do not persist or claim success. | Route integration tests and non-production persistence verification. |
| PII handling | No browser fallback storage on lead failure; no payload/error reflection; no unapproved third-party egress in approved test paths. | Browser/network capture, synthetic-PII log review, CSP report-only results. |
| Auth | Narration remains unreachable without a verified identity; dev bypass remains impossible in production. | Auth boundary tests in isolated environment. |
| Firestore | Client cannot access leads or other users' data; catch-all stays denied. | Emulator attack suite and deployed rules hash. |
| Marketing | Homepage fidelity, responsive navigation, booking CTA, and approved third-party embeds continue to work. | Existing home contract, visual/browser smoke, CSP preview evidence. |
| Build/deploy | Node version, Vercel function entry, static routing, headers, and environment separation remain correct. | CI, `vercel build`, preview smoke, release attestation. |

No release that changes PII handling, authentication, hosting headers, Firestore rules, public rate/program/state behavior, or the lead path is complete until every applicable row has recorded evidence and a rollback owner.

## 7. Required owner decisions

1. Confirm the canonical Vercel project, production domain, production branch, and release owner.
2. Name the Firebase project that owns `leads`, the rule-deployment owner, the Admin service identity, and the access-review cadence.
3. Approve a privacy/data-lifecycle record for lead fields, dashboard artifacts, logging, CRM transfer, deletion, and incident response.
4. Decide whether HubSpot, Webflow/CDN scripts, Finsweet/Swiper, and analytics-related code are approved on lead-adjacent pages; provide the consent and vendor-contract evidence.
5. Choose the durable abuse-control provider and failure/budget policy for anonymous lead intake.
6. Decide whether narration is a future product feature. If yes, approve the authenticated frontend token flow, LLM destination, prompt data minimization, and budget/abuse controls before enabling a client caller.
7. Confirm whether the Firebase Functions wrapper is retained for a supported deployment or retired through a planned, tested change.

## 8. Evidence retained from this wave

- Source reviewed: `src/serverApp.ts`, `src/middleware/auth.ts`, `src/middleware/error.ts`, `src/routes/leads.ts`, `src/routes/narrate.ts`, `src/routes/dscr.ts`, `src/routes/schemas.ts`, `src/services/firebaseAdmin.ts`, `src/firebase.ts`, `src/logger.ts`, `src/components/QualifyModal.tsx`, `src/components/ComplianceDashboard.tsx`, `src/marketing/MarketingHome.tsx`, `firestore.rules`, `firebase.json`, `vercel.json`, `.env.example`, `.env.production.example`, `DEPLOY.md`, `package.json`, and `.github/workflows/ci.yml`.
- Verification performed: targeted lead/hold tests; production and full dependency-audit summaries; tracked-file credential-pattern/name checks; source searches for auth-token attachment, persistence configuration, App Check, secret usage, and deployment/security configuration.
- No application source, deployment configuration, workflow, rule, package, or existing documentation file was modified by this wave.
