# Firebase and Emulator Readiness Baseline

**Wave:** Firebase readiness, documentation only
**Assessment date:** 2026-07-28
**Scope:** Source-controlled application evidence in this worktree. No Firebase, Vercel, Google Cloud, or production account was accessed; no emulator, deploy, credential, package, rule, or application code was changed.

## Decision summary

The released application already has useful fail-closed boundaries: the workspace is withheld when required client Firebase configuration is absent, browser access to `leads` is denied by Firestore rules, and the public lead endpoint validates a bounded payload before its server-only Admin SDK write. These are source-verified controls, not proof of a deployed Firebase configuration or operating process.

Firebase/emulator readiness is **blocked for release certification**, not because the current site should be changed now, but because there is no reproducible emulator setup, rule-test harness, verified project mapping, deployed-rules hash, or account-level access/retention evidence. The safe next move is an additive emulator test lane that defaults to denial and uses synthetic data only. It must not alter the existing public calculator, lead acknowledgement semantics, workspace gate, hosted production path, or reliability holds.

## Evidence status

| Area | Status | Source-verified evidence | What is not established here |
| --- | --- | --- | --- |
| Canonical production host | **Verified in repository documentation** | `DEPLOY.md` names Vercel, `https://www.greenstreet.finance`, and `api/index.js` / `dist/vercel.cjs` as the production path. | That Vercel project, its environment values, and its linked Firebase project are live, correctly scoped, and owned by the stated people. |
| Firebase alternative adapter | **Verified in source; not production-certified** | `firebase.json` configures Firestore rules/indexes, Hosting rewrites, and a Cloud Functions v2 `api` function; `src/function.ts` exports it. | Whether this adapter is still deployed, which project it targets, and whether its headers/runtime behavior has production parity with Vercel. |
| Client configuration gate | **Verified** | `src/App.tsx` requires API key, auth domain, project ID, and app ID before rendering `ComplianceDashboard`; otherwise it renders the existing workspace reliability hold. | Real values exist in the Vercel build environment and all client configuration values identify the approved project. |
| Browser Auth and Firestore client | **Verified in source** | `src/firebase.ts` initializes Auth and Firestore from `VITE_FIREBASE_*`; `ComplianceDashboard.tsx` uses Firebase Auth and owner-scoped `artifacts/default-app-id/users/{uid}/...` calls. | Enabled sign-in providers, authorized domains, email verification/recovery policy, project identity, and browser behavior against an emulator or preview. |
| Firestore client protection | **Verified in source** | `firestore.rules` denies all browser read/write access to `leads` and the catch-all; `users`, `deals`, `auditLogs`, and the `artifacts` subtree have explicit rules. | Rules have been deployed to the project used by the browser, and the intended allow/deny behavior has been exercised against an emulator and the deployed ruleset. |
| Server lead persistence | **Verified in source** | `src/routes/leads.ts` validates a strict intake shape, origin/content constraints, consent, and honeypot before `firebase-admin` writes the `leads` collection. `src/services/firebaseAdmin.ts` accepts ADC or a server-only JSON secret. | Admin service identity/IAM scope, project selection, live credential rotation, Firestore availability, retention, reviewer workflow, and any CRM/downstream delivery. |
| Current automated coverage | **Partially verified** | `src/routes/leads.test.ts` covers the route with an injected persistence seam. CI runs typecheck, Vitest, homepage fidelity, and build. | No tracked Firestore Rules unit test, Firebase Auth test, Firebase emulator configuration, emulator package, or CI emulator lane was found. |
| Emulator support | **Blocked / absent from tracked configuration** | `firebase.json` has no `emulators` block; `package.json` / `package-lock.json` contain no `firebase-tools` or `@firebase/rules-unit-testing`; no active `connectAuthEmulator`, `connectFirestoreEmulator`, `FIRESTORE_EMULATOR_HOST`, or `FIREBASE_AUTH_EMULATOR_HOST` wiring was found. | A vetted tool version, supported local JDK/Java prerequisites, deterministic ports, test project ID, start/stop lifecycle, and authenticated/anonymous fixtures. |
| PII and lifecycle controls | **Partially verified** | Lead schema bounds contact/scenario fields; lead errors do not echo payloads; `src/logger.ts` redacts common secrets/contact fields; the client does not report lead success on persistence failure. | Data inventory approval, retention/deletion policy, data subject request channel, Admin/IAM access review, backups, incident response, and all processor/CRM recipients. |

## Current access and data boundary

| Path / component | Browser capability proven by rules or code | Data-risk notes and default-deny expectation |
| --- | --- | --- |
| `/leads/{leadId}` | No client read or write. Only the server route uses the Admin SDK, which bypasses Firestore rules. | Contains contact and scenario data. No browser test or UI may use real lead data. Test that all authenticated and anonymous browser attempts are denied. |
| `/users/{uid}` | Owner-only reads and writes; creation requires a verified email and a narrow field allowlist; deletes are denied. | Updates are owner-only and field-bounded, but should be rule-tested for cross-user access, field limits, and unverified-account behavior. |
| `/deals/{dealId}` | Owner reads/writes; ownership is pinned on update; owner delete is allowed. | Rule requires core fields but uses `hasAll`, not a complete field allowlist. Treat arbitrary extra data as possible until a data owner approves a schema and emulator tests prove intended behavior. |
| `/auditLogs/{logId}` | Owner reads/create; updates/deletes are denied; creation binds user ID, email, type, and timestamp. | Uses `hasAll`, not a complete field allowlist. Test immutability, cross-user denial, bad event types, and extra-field policy explicitly. |
| `/artifacts/{appId}/users/{uid}/{document=**}` | Owner read/write for any descendant document. | This is deliberately broad for dashboard artifacts/settings. It can carry financial/context data through `input` and `output` fields in `ComplianceDashboard.tsx`; it needs a documented data classification and field/retention decision before expansion. |
| `/api/leads` | Public POST is subject to origin check, JSON/content bounds, strict schema, consent, honeypot, and rate limit; a successful response is only `{ accepted: true }`. | It is intentionally unauthenticated. Origin is a browser signal, not an identity proof; the current memory rate limiter is not a durable cross-instance abuse control. Preserve current failure responses while introducing test-only persistence adapters. |

## Known blockers and evidence requests

1. **Name the Firebase project of record.** `.firebaserc` declares `gen-lang-client-0809198072`, while `DEPLOY.md` says historical/local Firebase identities should not be copied into production. The owner must attest to the project that owns `leads`, Auth, and Firestore rules. Do not infer this from a browser API key or an old audit document.
2. **Verify production-to-Firebase alignment.** Capture the Vercel production environment variable *names and target project metadata* without exposing values, plus the Firebase project ID, database location/edition, Auth authorized domains, and deployed rules release/version/hash.
3. **Resolve deployment-adapter scope.** Vercel is documented as canonical; Firebase Hosting/Functions remains an alternative path. `firebase.json` requests Node 20 while `package.json` and CI use Node 22. Retain both until a platform owner decides scope, then test every retained adapter deliberately.
4. **Approve the data lifecycle.** The repository does not establish lead/artifact retention, access roles, deletion mechanisms, backup policy, downstream recipients, incident response, or a privacy-request service level. A lead release is blocked until a privacy and lead-operations owner signs this record.
5. **Establish least-privilege administration.** The Admin SDK can bypass rules. The account owner must document the service identity, where its secret/ADC originates, who can read/update it, rotation/revocation practice, and minimal Firestore/Auth permissions. No service-account JSON belongs in `VITE_*`, a test fixture, a log, or a source-controlled file.
6. **Approve a non-production emulator posture.** There is no tracked emulator setup. The test environment must use a non-production test project identifier, fixed local ports, synthetic fixtures, and a cleanup routine. It must never point browser or Admin SDK tests at the confirmed production project.

## Emulator prerequisites before implementation

These are acceptance prerequisites, not commands to execute yet.

| Prerequisite | Required evidence / owner | Safety condition |
| --- | --- | --- |
| Tool provenance | Platform owner pins a reviewed Firebase CLI and Rules test toolkit version after the skill/provenance gate is completed. | Do not run the quarantined local Firebase skills or install a floating global CLI. |
| Test identity | Firebase owner allocates a clearly non-production project identifier for emulator tests. | Test assertions and scripts fail immediately if an approved production project ID is supplied. |
| Deterministic config | A reviewed `firebase.json` emulator block defines Auth, Firestore, UI, and Functions ports plus an export/import location excluded from Git. | Port collisions and persistent test state are detected; no production credentials are required. |
| Browser wiring | Test-only client initialization connects Auth and Firestore to local endpoints only under an explicit test flag. | The production build path stays unchanged; absent flag means no emulator connection. |
| Admin wiring | Test-only server bootstrap is shown to use the emulator hosts and a fake/test project, with no `FIREBASE_SERVICE_ACCOUNT_JSON`. | A missing emulator host fails the emulator suite rather than silently calling a remote project. |
| Fixture policy | QA owns synthetic, non-sensitive users, emails, names, and scenario values. | No real borrower, lead, account, access token, or production export enters the test environment. |
| Operational replay | Security owner captures rules file hash, test command/version, date, reviewer, and result. | The release record contains evidence only, never credentials or sample PII. |

## Additive default-deny test rollout

The sequence below is intentionally incremental. Every stage is a new test/configuration lane; none is authorization to loosen rules, enable a held tool, switch production credentials, or change existing user-visible behavior.

### Stage 0 - Lock today's behavior

- Keep the existing test suite, homepage fidelity contract, build, workspace configuration hold, public calculator, lead acknowledgement/error wording, and reliability holds unchanged.
- Add an evidence record that identifies the confirmed non-production test project and production project separately before any emulator command can run.
- Treat a missing emulator host, missing fixture identity, unknown project mapping, or failed rules setup as a test failure, never a reason to fall back to remote Firestore.

### Stage 1 - Firestore Rules attack suite

Add isolated Rules tests first, using no application server and only synthetic identities. Required deny-first cases:

1. Anonymous users cannot read or write any protected path, including the catch-all and `leads`.
2. User A cannot read, create, update, or delete User B's `/users`, `/deals`, `/auditLogs`, or `artifacts` subtree.
3. A lead document is denied to anonymous and authenticated browser clients in every direction.
4. User profile creation rejects unverified email, unexpected keys, oversize values, and delete; owner success is tested separately.
5. Deal ownership cannot be reassigned; invalid/missing core fields are denied; explicit tests document whether extra fields are intentionally accepted or must be prohibited.
6. Audit records cannot update/delete; wrong email/type/user ID is denied; extra-field policy is tested and decided.
7. The permitted artifact paths succeed only for their owner; write/read behavior for financial/context artifacts is captured as an approved data-policy decision.

Gate: a reviewer signs the rules hash and a clean emulator run before any rules deployment. A rules-file edit without this suite is release-blocking.

### Stage 2 - Auth and workspace journey suite

Use Auth emulator accounts only. Test:

- unconfigured workspace values keep the existing reliability hold and do not create an Auth or Firestore session;
- configured, signed-out workspace presents the existing sign-in/demo options without cross-user data;
- anonymous, email/password, and Google-provider behavior are tested only for providers the owner has actually enabled; unsupported provider tests remain explicit skips rather than assumed coverage;
- User A/User B transitions unsubscribe/clear observations and never display the prior user's artifacts;
- client calls to protected Firestore paths receive expected denial behavior;
- non-production `ALLOW_DEV_AUTH_BYPASS` is never accepted when `NODE_ENV=production`.

Gate: browser/network traces show local emulator endpoints only. No test uses a real access token or browser configuration from production.

### Stage 3 - Server/Admin lead intake suite

Keep the current injected `persistLead` route tests as fast unit coverage. Add a separate emulator integration lane that proves:

- valid synthetic lead payload reaches the emulator-only `leads` collection via the server path;
- browser SDK access to that same document remains denied;
- invalid origin, malformed/oversized body, invalid schema, honeypot, and persistence failure preserve current public response semantics;
- no response includes document ID, financial result snapshot, credentials, or lead PII;
- server logs for synthetic failures contain no raw payload/secret values;
- unavailable emulator/Admin initialization fails closed rather than writing remotely.

Gate: an integration test must fail if the test process lacks its explicit emulator variables or resolves the confirmed production project ID.

### Stage 4 - CI and preview promotion

Add the emulator lane after local reproducibility is proven. Run it in a separate CI job with fixed dependencies, a bounded startup/teardown timeout, and artifact collection limited to sanitized logs and rules hashes. Then add preview-only smoke checks for:

- `/health`, public calculator, a direct SPA route, and existing held routes;
- configured/unconfigured workspace UX;
- valid and failed lead submission response behavior using non-sensitive fixtures;
- Vercel function bundle/rewrites and headers.

The standard CI job remains the baseline. A flaky emulator job is fixed or quarantined as a failing release gate; it is not bypassed by turning off rules or pointing at production.

## Least-privilege and PII release gates

All gates below need evidence from the responsible owner, not an implementation assertion.

| Gate | Required proof before promotion | Preserve while validating |
| --- | --- | --- |
| Firebase ownership | Confirmed project ID, billing/operational owner, environment map, database region/edition, and account recovery contacts. | The unconfigured workspace hold and no-client-lead-access rule. |
| Rules release | Exact `firestore.rules` hash, deployed rules release/version, emulator attack-suite result, reviewer, and timestamp. | Default deny for `leads` and the catch-all. |
| Admin identity | Least-privilege service identity record, secret/ADC source, rotation/revocation, access-review cadence, and proof no browser-exposed secret exists. | Server-only lead persistence; never move it to client Firestore writes. |
| Data minimization | Field inventory for leads and artifacts, purpose/legal basis, access roles, retention/TTL or deletion process, backups, and downstream transfer list. | Strict lead request schema, consent flag/version, no result snapshot in lead payload, and no browser fallback storage on failure. |
| Privacy operations | Monitored privacy/contact channel, DSR handling process, incident owner, processor agreements, and approved public wording. | Current transparent disclosures; do not replace a hold or caveat with an unverified assurance. |
| Abuse and observability | Cross-instance abuse-control decision for public lead intake, sanitized logging policy, alert owner, and response playbook. | Existing origin/content/schema/honeypot checks and stable public error responses. |
| Deployment parity | Vercel preview result and, if Firebase Hosting/Functions remains in scope, equivalent function/hosting header, rewrite, runtime, and smoke evidence. | Current Vercel canonical route and existing no-regression test matrix. |

## Non-regression acceptance record for a future Firebase change

Before merging any emulator, Auth, Firestore, rules, lead-flow, or environment change, require all of the following in addition to the new focused tests:

- clean Node 22 install, typecheck, the full existing Vitest suite, homepage fidelity contract, and production build;
- public calculator behavior and estimate wording unchanged;
- lead validation, trusted/cross-site origin rejection, honeypot acknowledgement, persistence failure wording, and no-success-on-failure behavior unchanged;
- configured and unconfigured workspace journeys validated in a browser;
- held routes still return their existing hold behavior rather than a new decision result;
- no change to production environment values, Firestore rules, package lock, deployment configuration, or credentials unless the responsible owner approved the corresponding release gate;
- a rollback instruction that restores the prior reviewed config/rules release without deleting lead data or weakening access controls.

## Evidence inspected in this wave

- `DEPLOY.md`, `vercel.json`, `.gcloudignore`, `.firebaserc`, `firebase.json`, `firestore.rules`, and `firestore.indexes.json`.
- `.env.example`, `.env.production.example`, `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, and `.gitignore`.
- `src/firebase.ts`, `src/services/firebaseAdmin.ts`, `src/middleware/auth.ts`, `src/serverApp.ts`, `src/function.ts`, `api/index.js`, `src/routes/leads.ts`, `src/routes/leads.test.ts`, `src/components/ComplianceDashboard.tsx`, `src/components/QualifyModal.tsx`, `src/App.tsx`, and `src/logger.ts`.
- Targeted tracked-file searches for emulator configuration, emulator wiring, Firebase CLI/Rules test dependencies, Firebase/Admin host environment variables, and Firestore/Auth tests.

No source, deployment config, workflow, rule, package, secret, existing documentation file, emulator process, or cloud account was changed or accessed by this wave.
