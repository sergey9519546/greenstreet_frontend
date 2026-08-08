# Greenstreet DSCR Platform — Security & Privacy Audit

**Scope:** Systemic security/privacy risk for a real-money DSCR lending product handling PII.
**Method:** Read-only review of tracked source. Secrets swept across all tracked files (excluding vendored `.agents/`, `.minimax/` skill trees and `node_modules`). No repository files were modified.
**Date:** 2026-07-23

---

## TOP 5 SECURITY RISKS

1. **`/api/narrate` is an OPEN, unauthenticated LLM endpoint** — auth is fail-open by design and the SPA sends no token, so anyone on the internet can drive paid LLM calls. The only guard is per-IP rate limiting that is memory-resident and unreliable behind Firebase Hosting. **Direct financial-cost-abuse vector.** (Critical)
2. **Borrower deal financials egress to a third-party proxy `https://api.z.ai/api/anthropic` BY DEFAULT** (`narrate.ts` baseURL default). Unless `ANTHROPIC_BASE_URL` is explicitly overridden in the live (gitignored) env, computed borrower financial data + a free-text `context` field are transmitted to a third-party endpoint with no DPA in evidence. **Privacy/compliance data-egress vector.** (Critical)
3. **Server auth (`verifyFirebaseToken`) is fail-open in two ways** — (a) it passes unauthenticated requests through whenever `REQUIRE_AUTH !== "true"` (which production is documented to require), and (b) if `firebase-admin` fails to initialize it assigns a static mock identity (`dev-user-id`) to *any* request carrying a Bearer header. The platform's only server-side auth degrades to "everyone passes." (High)
4. **Firestore `leads` collection accepts UNAUTHENTICATED writes with arbitrary extra fields and no App Check** — the PII intake path is world-writable, gated only by a single required `submittedAt` key. Spam / storage-cost / junk-write abuse. (High)
5. **No Content-Security-Policy anywhere, and the Firebase-Hosting SPA has no security-headers block at all**, while `index.html` loads multiple third-party scripts (Vector.co de-anonymization pixel, Google Tag Manager, CookieYes, Webflow CDN CSS) onto the same pages that capture borrower PII. XSS/supply-chain + privacy exposure. (High)

**Is any real secret committed?** No. The only credential-shaped value committed is a **Firebase Web API key** (`AIzaSyDbhJW82HLr2xxCsaMcWT7NicKW3RkXpYo`) plus public project identifiers in `firebase-applet-config.json` — these are public-by-design client identifiers, not secrets. No `ANTHROPIC_AUTH_TOKEN`, no service-account private key, no server secret, and no `-----BEGIN PRIVATE KEY-----` material is present in any tracked file. `.env` and `.env.production` are correctly gitignored.

**Does borrower financial data leave to a third-party endpoint?** Yes — two paths: (1) `src/routes/narrate.ts:14` defaults the LLM base URL to `https://api.z.ai/api/anthropic`, sending computed deal financials + user `context` to a third party; (2) the lead form (`QualifyModal.tsx`) submits borrower PII + financials on pages that also run Vector.co and Google trackers.

**Total findings: 15** (2 Critical, 4 High, 4 Medium, 5 Low/Informational).

---

## CRITICAL

### C1. `/api/narrate` LLM endpoint is open to the internet (cost-abuse)
**Severity:** Critical
**Evidence:**
- `src/serverApp.ts:30` — `app.use(verifyFirebaseToken)` is the only auth, applied globally.
- `src/middleware/auth.ts:38-45` — when there is no Bearer header, the request is rejected **only** if `process.env.REQUIRE_AUTH === "true"`; otherwise `next()` lets it through unauthenticated.
- `.env.production.example:16-33` — the developers explicitly document that `REQUIRE_AUTH` is left unset (API is OPEN), that the SPA never attaches a token, and that "`/api/narrate` calls a paid LLM ... and is open ... = an API-key-abuse vector." Setting `REQUIRE_AUTH=true` would 401 every request because it is global.
- `grep getIdToken|Authorization` over `src/` returns no client code that attaches a token — confirmed the SPA sends no `Authorization` header, so even signed-in users are anonymous to the API.
- `src/function.ts:1-13` — production wraps this exact same Express `app`, so the open posture ships to prod.

**Exploit/Impact:** An unauthenticated attacker POSTs to `https://<host>/api/narrate` in a loop. Each call consumes paid LLM tokens (`narrate.ts:51` `ai.messages.create`). The endpoint accepts a fully valid-schema body trivially. This is a direct, unbounded financial-loss vector against the operator's LLM budget, plus a channel to abuse the operator's LLM quota for arbitrary generation.

**Recommendation:** Enforce per-route authentication on `/api/narrate` (not the global flag). Attach `Authorization: Bearer <idToken>` in the SPA and verify it in the route. Add a hard server-side spend/quota cap and a durable (Redis/Firestore) rate limiter keyed to a verified identity, not IP.

---

### C2. Borrower financial data egresses to third-party `api.z.ai` by default
**Severity:** Critical (privacy/compliance)
**Evidence:**
- `src/routes/narrate.ts:12-15` — `new Anthropic({ apiKey: ..., baseURL: process.env.ANTHROPIC_BASE_URL || "https://api.z.ai/api/anthropic" })`. If `ANTHROPIC_BASE_URL` is unset in the live environment, all LLM traffic goes to `api.z.ai` (a third-party proxy), not Anthropic.
- `src/routes/narrate.ts:40-49` — the prompt embeds the borrower's DSCR, solved rate, deal-break rate, headroom, dual-track pass/fail, verdict summary, and a user-supplied `context` string (`slice(0,500)`), then `narrate.ts:51-56` transmits it to that endpoint.
- `src/routes/schemas.ts:80` — `context` is user-controlled up to 1000 chars; a borrower/broker can paste arbitrary free text (potentially names, addresses, or other PII) into it.
- `.env.production.example:37` sets `ANTHROPIC_BASE_URL=https://api.anthropic.com`, but that is only an *example* file; the deployed `.env` is gitignored and unverifiable. The **code default remains the third party**, so a missing/typoed env var silently routes financial data offshore.

**Exploit/Impact:** For a regulated lending product, transmitting borrower financial data to an undisclosed third-party processor with no evidenced DPA is a GLBA/CCPA/GDPR exposure. The insecure default means a config omission — not an attack — is sufficient to cause the leak.

**Recommendation:** Remove the third-party default; fail closed if `ANTHROPIC_BASE_URL`/token are unset. Route only to a contractually covered processor. Strip/deny free-text PII from `context`. Document the sub-processor in the privacy policy and DPA.

---

## HIGH

### H1. `verifyFirebaseToken` fails open to a static mock identity on admin-init failure
**Severity:** High
**Evidence:**
- `src/middleware/auth.ts:5-17` — `adminInitialized` is set false if `admin.initializeApp()` throws; the failure is only logged as a warning.
- `src/middleware/auth.ts:50-64` — when a Bearer header *is* present but `adminInitialized` is false, the code **skips verification entirely** and assigns `req.user = { uid: "dev-user-id", email: "dev-user@greenstreet.dev" }`, then `next()`. Any attacker-supplied garbage token reaches this branch.

**Exploit/Impact:** If firebase-admin ever fails to initialize in production (missing/rotated credentials, cold-start race, IAM change), every request bearing an arbitrary `Authorization: Bearer x` is authenticated as the same fixed user. Combined with the fail-open-when-no-header path (C1), the server has no robust authentication state. For a lending backend this is an authentication-bypass class defect.

**Recommendation:** Fail closed. If admin cannot initialize, return 503 for protected routes rather than minting a mock identity. Never assign a mock user outside an explicit, non-production guard (`NODE_ENV !== 'production'` AND an explicit dev flag).

### H2. Firestore `leads` allows unauthenticated writes with arbitrary fields (PII intake, spam/cost)
**Severity:** High
**Evidence:**
- `firestore.rules:54-64` — `allow create` on `/leads/{leadId}` has **no `isAuthenticated()` check**. It requires only `request.resource.data.keys().hasAll(['submittedAt'])` and caps `email/name/phone/message` lengths *if present*. The rule comment concedes "extra fields are permitted (Firestore doesn't strip them)."
- No App Check anywhere (`grep appcheck|recaptcha` over `src/`, `firebase.ts`, `firestore.rules` → none).
- The committed Firebase Web API key (`firebase-applet-config.json:5`) is all an attacker needs to call the Firestore REST/SDK create API directly.

**Exploit/Impact:** Anyone can write unlimited `leads` documents directly (bypassing the app). `submittedAt` is not even type-validated as a timestamp, and any non-`email/name/phone/message` field name is size-unbounded up to Firestore's 1 MB doc limit — enabling storage-cost inflation, junk/spam flooding of the sales intake, and pollution of the lead pipeline. There is no rate limiting at the rules layer.

**Recommendation:** Require App Check on `leads` writes. Constrain the allowed key set (deny unknown fields), validate `submittedAt` is a `timestamp`, and gate volume with App Check + a Cloud Function intake instead of direct client writes.

### H3. No CSP, no Firebase-Hosting security headers, multiple third-party scripts on PII pages
**Severity:** High
**Evidence:**
- `src/serverApp.ts:49-62` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS, `Permissions-Policy` — but **no `Content-Security-Policy`**, and these headers apply only to Express `/api/*` responses.
- `firebase.json:62-79` — the `hosting` block has **no `headers` array at all**, so the actual SPA HTML/JS served to browsers ships with zero security headers (no CSP, no X-Frame-Options, no HSTS from hosting).
- `index.html` loads external scripts with no integrity/allowlist governance: Vector.co de-anon pixel (`index.html:156`, `cdn.vector.co/pixel.js`, workspace `244a8671-d620-4679-8cf9-a60540b05114`), CookieYes (`index.html:163`, `cdn-cookieyes.com`), Google Tag Manager (`index.html:163`, `GTM-WB2F5WH6`) + gtag (`index.html:100`, `G-JERVW0S7X4`) + a server-side-GTM proxy script (`index.html:100`, `/wvxwa3jtwetc.../...`), and Webflow CDN CSS (`index.html:47,51,100`).

**Exploit/Impact:** With no CSP and multiple third-party origins executing script on the same pages that host the QualifyModal lead form (borrower PII + financials), any XSS or a compromise/hijack of one of those third-party CDNs can exfiltrate DOM/form data. This is the standard supply-chain + XSS blast radius, unusually significant here because the pages carry financial PII.

**Recommendation:** Add a `headers` block in `firebase.json` hosting with a strict `Content-Security-Policy` (allowlist the specific script/style/connect origins actually used), plus `X-Frame-Options`, HSTS, and `Referrer-Policy` on the HTML responses. Prefer SRI or self-hosting for third-party scripts; minimize trackers on PII-capture pages.

### H4. Rate limiting is the sole cost control but is structurally unreliable
**Severity:** High
**Evidence:**
- `src/serverApp.ts:64-79` — `narrateLimiter` (10/min) and `apiLimiter` (120/min) are `express-rate-limit` with the default in-memory store. The code comment itself notes memory limiters "reset on cold starts."
- No `app.set('trust proxy', ...)` anywhere (`grep trust proxy` → none). Behind Firebase Hosting → Cloud Functions, `req.ip` is the Google front-end peer, so per-IP keying is either shared across all users or not the real client IP.
- `src/function.ts:10` — `maxInstances: 10`; each instance keeps its own in-memory counter, so the effective ceiling is up to ~10× the configured limit and resets on every cold start/scale event.

**Exploit/Impact:** The only barrier protecting the open LLM endpoint (C1) is trivially defeated by cold starts, horizontal scaling, and IP rotation, and may mis-key on the proxy IP. It cannot bound LLM spend.

**Recommendation:** Use a durable shared store (Redis/Firestore) keyed to a verified identity, set `trust proxy` correctly for the Firebase/GCP hop, and enforce a hard global spend cap independent of per-request limits.

---

## MEDIUM

### M1. `auditLogs` are client-forgeable per rules; audit control is also non-functional in the app
**Severity:** Medium
**Evidence:**
- `firestore.rules:41-48` — any authenticated client may `create` `/auditLogs/{logId}` as long as `request.resource.data.userId == request.auth.uid` and the doc has keys `['userId','userEmail','type','timestamp']`. The **values** of `userEmail`, `type`, and `timestamp` are client-supplied and unvalidated (no `request.time` enforcement, no cross-check that `userEmail` matches `request.auth.token.email`).
- `src/components/ComplianceDashboard.tsx:368` — the app actually writes audit entries to `collection(db,"artifacts","default-app-id","users",userUid,"audits")`, a path that matches **no** explicit rule and therefore hits the catch-all `firestore.rules:67-68` `allow read, write: if false` — i.e., these writes are denied.

**Exploit/Impact:** Two-sided integrity problem. (a) The `auditLogs` rules that *do* exist let a user forge audit records with arbitrary type/email/backdated timestamp — undermining any reliance on them as a tamper-evident compliance trail. (b) The code's real audit-logging path is blocked by rules, so the compliance-audit feature does not persist. Either way, there is no trustworthy audit record.

**Recommendation:** Write audit logs only server-side (Admin SDK / Cloud Function) with server timestamps; make them client-read-only. Align the collection path between rules and app. Validate `userEmail == request.auth.token.email` and `timestamp == request.time` if any client create is retained.

### M2. `deals` update rule does not pin the owner field — owner can reassign/inject into another user's history
**Severity:** Medium
**Evidence:**
- `firestore.rules:29-36` — `create` correctly requires `request.resource.data.userId == request.auth.uid` (line 32), but `allow update` (line 34) checks only `resource.data.userId == request.auth.uid` (the *existing* doc's owner). It does **not** require `request.resource.data.userId == resource.data.userId`, so the mutable `userId` field can be changed on update.

**Exploit/Impact:** A user who owns a deal can update it and set `userId` to a victim's uid. The document then falls under the victim's read scope (`deals` read is `resource.data.userId == request.auth.uid`), letting an attacker **plant arbitrary deal records into another user's history** (data poisoning that could feed dashboards/underwriting), and orphan their own. It does not permit reading others' data, so blast radius is integrity/injection, not exfiltration.

**Recommendation:** On `update`, require `request.resource.data.userId == resource.data.userId` (immutable owner). Best practice: also freeze `createdAt`.

### M3. No size/field caps on `users` and `deals` documents
**Severity:** Medium
**Evidence:**
- `firestore.rules:20-25` (`users`) and `:29-36` (`deals`) impose no string-length caps and no allowed-key restriction. `deals` create requires only `['userId','createdAt','title']` to be present; all other fields (and their sizes) are unconstrained up to Firestore's 1 MB doc limit. Only `leads` has partial caps, and even those exclude arbitrary extra keys.

**Exploit/Impact:** An authenticated user can write oversized `deals`/`users` documents (title and any extra field unbounded), enabling storage-cost inflation and abuse of their own namespace at scale.

**Recommendation:** Add `.size()` caps on all stored strings and restrict the allowed key set with `hasOnly([...])` across `users`, `deals`, and `leads`.

### M4. Third-party analytics / visitor de-anonymization on borrower-PII pages (CCPA/GDPR posture)
**Severity:** Medium
**Evidence:**
- `index.html:156` — Vector.co pixel (`vector.load("244a8671-d620-4679-8cf9-a60540b05114")`), a B2B person/company de-anonymization tracker, loads globally.
- `index.html:100,163` — GTM (`GTM-WB2F5WH6`), gtag (`G-JERVW0S7X4`), and a server-side GTM proxy load globally.
- `src/components/QualifyModal.tsx:1891-1934` — the QualifyModal (which mounts globally on the home page per its own comment at `:1937-1939`) collects `name`, `email`, `phone`, `propertyValue`, `loanAmount`, `rent`, `ficoBand`, `borrowerType`, and TCPA/SMS `consent` records — i.e., financial PII on the same pages the trackers run.

**Exploit/Impact:** Running de-anonymization and behavioral trackers on pages that capture borrower financial PII raises CCPA "sale/share" and GDPR consent-before-load concerns. CookieYes (`index.html:163`) suggests consent management is intended, but there is no evidence the trackers are gated behind consent, and Vector.co specifically identifies visitors.

**Recommendation:** Gate all non-essential trackers behind explicit consent (verify CookieYes actually blocks pre-consent loading), and exclude PII-capture flows from analytics. Confirm data-processing agreements and privacy-policy disclosures cover Vector.co, Google, and the server-side GTM endpoint.

---

## LOW / INFORMATIONAL

### L1. Committed Firebase Web API key and project identifiers
**Severity:** Low
**Evidence:** `firebase-applet-config.json:3-9` commits `apiKey: "AIzaSyDbhJW82HLr2xxCsaMcWT7NicKW3RkXpYo"`, `projectId`, `appId`, `authDomain`, `storageBucket`, `messagingSenderId`, and a `firestoreDatabaseId`. `src/firebase.ts:8-15` reads the same class of values from env (not committed).
**Impact:** Firebase Web API keys are public-by-design (they ship in the client bundle), so this is **not** a secret leak — the real access gate is Firestore rules + Auth. However, the file exposes the storage bucket and a specific `firestoreDatabaseId`, and the identifiers here (`project-34827ae3-...`) don't match the deploy target in `.firebaserc` (`gen-lang-client-0809198072`), suggesting stale AI-Studio scaffolding committed by accident.
**Recommendation:** Remove the stray `firebase-applet-config.json` if unused; rely on env-injected config. Ensure Firebase API-key HTTP-referrer/app restrictions are enabled in the Google Cloud console. Confirm rules (not key secrecy) enforce all access.

### L2. CORS default includes a placeholder origin with credentials enabled
**Severity:** Low
**Evidence:** `src/serverApp.ts:14-24` — when `ALLOWED_ORIGINS` is unset, `allowedOrigins` defaults to include `https://your-firebase-app.web.app` alongside localhost, with `credentials: true`.
**Impact:** A dead placeholder domain in a credentialed allowlist is a latent misconfiguration; if that domain were ever registered by a third party it would be a trusted origin. Not currently exploitable (the API also uses no cookies for auth), but it signals config drift.
**Recommendation:** Remove placeholder origins; require `ALLOWED_ORIGINS` to be explicitly set in production and fail closed if absent.

### L3. Configured model `claude-sonnet-4-6` is not a valid Anthropic model id
**Severity:** Low (correctness/authenticity)
**Evidence:** `src/routes/narrate.ts:20`, `.env.example:21`, `.env.production.example:38` all default `ANTHROPIC_MODEL=claude-sonnet-4-6`. That is not a real Anthropic model identifier.
**Impact:** Against `api.anthropic.com` this call would 404/error; the value only "works" because the default base URL is the `api.z.ai` proxy (C2), which maps `claude-*` names to its own models. This corroborates that the pipeline is not talking to Anthropic and reinforces the third-party-egress finding.
**Recommendation:** Pin a real, supported model id and point the base URL at the genuine, contracted provider.

### L4. Lead PII silently persisted to browser localStorage on write failure; app payload mismatches rules
**Severity:** Low
**Evidence:** `src/components/QualifyModal.tsx:1944` writes to `leads`; on any failure `:1950-1953` pushes the full PII payload into `localStorage["gs_leads"]` in plaintext. Separately, the payload uses `createdAt` (`:1932`) and never sets `submittedAt`, which the current rule (`firestore.rules:57`) requires — so legitimate app writes are rejected and always fall through to localStorage.
**Impact:** Borrower PII (name, email, phone, FICO band, financials, consent records) accumulates unencrypted in the visitor's browser storage and legitimate leads are silently lost — a data-integrity and minor privacy issue. (Note: the field mismatch means the app's own path is broken even though the rule remains world-writable for a crafted `submittedAt` payload — see H2.)
**Recommendation:** Fix the field-name mismatch (`submittedAt`), route leads through an authenticated server intake, and never persist PII to localStorage.

### L5. Positive controls observed (for balance)
- `src/logger.ts:21-40` — pino `redact` covers `authorization`, `x-api-key`, `body.apiKey/token`, and PII fields (`email`, `name`, `phone`, `firstName`, `lastName`) — good hygiene.
- `src/serverApp.ts:41` — `req.ip` is only logged when `NODE_ENV !== "production"`, addressing the flagged IP-PII concern.
- `src/middleware/error.ts:9-19` — 5xx responses return a generic message + requestId and never reflect internals; input validation via zod (`src/routes/schemas.ts`) is enforced on all `/api/dscr` and `/api/narrate` bodies (`validateBody`).
- `src/serverApp.ts:27` — request body capped at 100 kb; `:29` disables `x-powered-by`.
- `firestore.rules:67-68` — a catch-all denies all unmatched collections (fail-closed default), and `narrate.ts:24-27` refuses to run if the LLM token is unset/placeholder.

---

## Notes on method / coverage
- Secrets sweep ran over all tracked files except vendored skill trees (`.agents/`, `.minimax/`, `animations/**/skills`) and `node_modules`; also scanned `hf-*`, `animations`, and ad-build directories for embedded `AIza…`, `sk-…`, and `apiKey`/token literals — none found beyond the public Firebase Web key.
- `dangerouslySetInnerHTML`, `eval(`, `new Function(`, `innerHTML =`, `document.write`, `insertAdjacentHTML` — **no occurrences** anywhere under `src/`. The committed 221 KB `index.html` is a static Webflow marketing export; its injection surface is the third-party scripts (H3), not app-authored DOM sinks.
