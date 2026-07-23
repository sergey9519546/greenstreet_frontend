# Memory & Data-Architecture Audit — Greenstreet DSCR Platform

**Scope:** Every form of state, persistence, and "memory": Firestore (rules, indexes, client usage), client-side storage/state, the graphify cache, the knowledge corpus as a "memory layer," server-side in-memory state, and data integrity/lifecycle.
**Method:** Read of `firestore.rules`, `firestore.indexes.json`, `src/firebase.ts`, `src/function.ts`, `src/routes/narrate.ts`, `src/serverApp.ts`, `server.ts`, `firebase.json`, `src/engine/types.ts`; repo-wide grep of every Firestore/localStorage/context API; sampling of `graphify-out/cache`, `docs/`, `.agents`, `.minimax`.
**Read-only.** No repository files were modified.

---

## TOP 5 MEMORY/DATA ISSUES

1. **CRITICAL — Lead capture silently fails to persist: the write violates the platform's own security rule.** The `/leads` rule requires the field `submittedAt`; the QualifyModal payload never sets it (it uses `createdAt`). Every "See If You Qualify" submission is rejected with permission-denied and falls back to the *visitor's own* `localStorage['gs_leads']`, where the business can never see it. For a lead-gen lender, the primary conversion event is being lost 100% of the time under the repo's rules.

2. **CRITICAL — The entire ComplianceDashboard "deal history / audit log" persistence path is blocked by the catch-all deny rule.** The client reads/writes `artifacts/default-app-id/users/{uid}/audits` and `.../broker/settings`, but no rule matches that path — only the terminal `match /{document=**} { allow read, write: if false }` does. Saving an analysis, loading history, saving broker settings, and deleting a log all fail in production against the repo's rules.

3. **HIGH — Rules and code describe two completely different data models.** `firestore.rules` governs top-level `/users`, `/deals`, `/auditLogs`; the app touches *none* of them. `/deals` is pure vaporware (zero code references). `/auditLogs` and `/users` are orphans — the code uses `artifacts/default-app-id/...` sub-paths instead. The rules were hardened against an idealized schema the client never adopted.

4. **HIGH — The AI "narrate" feature is stateless with zero retrieval/memory.** `src/routes/narrate.ts` builds a bare prompt from ~6 deal numbers and calls the LLM. No RAG, no embeddings, no filesystem read of the 53-file / ~2.9M-word `docs/dscr_loan_office` corpus or the `graphify-out` knowledge graph. That "master knowledge" is dead research weight, not a memory layer. (It also routes "Claude"/Anthropic-SDK calls to `api.z.ai` by default.)

5. **MEDIUM-HIGH — All calculator/deal state is ephemeral, and server rate-limit "memory" doesn't survive scale.** No calculator or Deal Analyzer input is ever persisted (refresh = total loss). The two rate limiters use in-process `MemoryStore`; with `maxInstances: 10` each instance keeps its own counters, so the LLM cap (10/min) is really up to ~100/min globally and resets on every cold start.

---

## FINDINGS (detailed)

### F1 — CRITICAL — Lead writes are rejected by the `/leads` rule (missing `submittedAt`); leads silently disappear into browser localStorage
**Evidence:**
- `firestore.rules:54-62` — `/leads` create requires `request.resource.data.keys().hasAll(['submittedAt'])`.
- `src/components/QualifyModal.tsx:1891-1934` — payload keys are `name,email,phone,role,timeline,…,dscr,verdict,…,consent,page,createdAt`. There is **no `submittedAt`** (it uses `createdAt`, line 1932).
- Repo-wide grep for `submittedAt` across all `.ts/.tsx/.js/.cjs`: **zero matches.** The field the rule demands exists nowhere in the codebase.
- `src/components/QualifyModal.tsx:1944` — `await addDoc(collection(db, "leads"), payload)`; on failure, `:1946-1956` catches and writes to `localStorage['gs_leads']`, logging only a `console.warn`.
- No server-side writer exists to inject the field: grep for `onDocumentCreated / admin.firestore / FieldValue / serverTimestamp` → none. `:1933` even carries a `// TODO: production lead endpoint / CRM`.

**Impact:** The single most important business event — an inbound qualified lead with name/email/phone/consent — never reaches Firestore. It is written to the *visitor's* localStorage, which the business cannot retrieve. Because the failure is swallowed as a `warn`, dashboards look "fine" while conversion data is lost. This is a revenue-affecting data-loss bug, not a theoretical one.
**Recommendation:** Add `submittedAt: serverTimestamp()` (or an ISO string) to the leads payload, or relax the rule to accept `createdAt`. Add a monitored error path (not `console.warn`) so a denied lead write pages someone. Treat localStorage as a last resort that re-syncs, not a silent grave.

---

### F2 — CRITICAL — ComplianceDashboard audit/settings persistence is denied by rules (path has no allow rule)
**Evidence:**
- `src/components/ComplianceDashboard.tsx:333` (read audits), `:367-368` (save audit), `:361` (delete audit), `:345-346` (read broker settings), `:352-353` (save broker settings) all target `artifacts/default-app-id/users/{userUid}/...`.
- `firestore.rules` has matches only for `/users`, `/deals`, `/auditLogs`, `/leads`. The `artifacts/**` path is caught solely by `firestore.rules:67-68` → `allow read, write: if false`.
- `src/components/ComplianceDashboard.tsx:279` — `userUid = currentUser?.uid ?? "demo-user"`; demo mode attempts writes with an unauthenticated `"demo-user"` id (`:332,344,351,360,366`), which is denied even more surely.

**Impact:** The "audit trail / deal history" and broker-config features are non-functional under the repo's deployed rules. Saved analyses never persist; the compliance history that the UI (and the `AuditLog` type at `src/engine/types.ts:1498-1508`) implies exists is empty. If the product ever worked, it was against *different* (boilerplate) rules that permitted `artifacts/**`, and the repo has since diverged.
**Recommendation:** Decide on one canonical path. Either (a) add rules for `artifacts/{appId}/users/{uid}/{sub}` scoped to `isOwner(uid)`, or (b) migrate the client to the top-level `/users`, `/deals`, `/auditLogs` collections the rules already define. Do not ship rules and client against different schemas.

---

### F3 — HIGH — Rules ↔ code data-model divergence; `/deals` is vaporware, `/users` and `/auditLogs` are orphans
**Evidence:**
- `/deals` rule block `firestore.rules:29-36` (create requires `userId,createdAt,title`). Grep for `collection(db,"deals")` / `doc(db,"deals")` repo-wide: **no matches.** Nothing writes or reads deals.
- `/auditLogs` rule block `firestore.rules:41-48` (immutable; requires `userId,userEmail,type,timestamp`). The client instead writes to `artifacts/.../audits` (`ComplianceDashboard.tsx:367-368`). The top-level `/auditLogs` collection is never used.
- `/users` rule block `firestore.rules:20-25` (with soft-delete). No code writes top-level `/users/{uid}`; user/broker data goes to `artifacts/.../users/{uid}/broker/settings` (`ComplianceDashboard.tsx:345-353`).
- `default-app-id` is a hardcoded string literal (`ComplianceDashboard.tsx:333` etc.) — the tell-tale fallback constant of the Firebase/Gemini "canvas" boilerplate (`artifacts/{__app_id}/users/...`), pasted in without reconciliation.

**Impact:** The security posture is illusory: the carefully-validated rules protect empty collections while the collections the app actually uses are governed only by "deny all." "Deal history" as a persisted feature does not exist in code. Anyone reading the rules would badly misjudge what data the system holds.
**Recommendation:** Pick the real schema, delete the dead rule blocks or implement the collections they describe, and remove the `default-app-id` boilerplate namespace. Add a rules test suite (emulator) so rules can't drift from client paths again.

---

### F4 — HIGH — AI narrate is a bare, stateless prompt: no RAG, no retrieval, no use of the "knowledge memory"
**Evidence:**
- `src/routes/narrate.ts:40-56` — the prompt is assembled purely from `deal.{dscr,solvedRate,dealBreakRate,rateHeadroomBps,dualTrackDSCR}` plus an optional 500-char `context`; a single `ai.messages.create` call; nothing else.
- No retrieval anywhere: grep of `src` for `dscr_loan_office | readFileSync | readFile | fs\. | embedding | vectorStore | retriev | pinecone | chroma | RAG | knowledge` → only unrelated false positives (`BROKERAGE`, `knowledge`-in-a-string). narrate reads no files and consults no store.
- The corpus that *looks* like a memory layer — `docs/dscr_loan_office` (53 files, GRAPH_REPORT reports ~2,929,511 words) and `graphify-out/graph.json` (367 nodes/478 edges) — is never imported or read at runtime. It is build-time research + a code-graph, not a live index.
- `src/routes/narrate.ts:13-14` — default `baseURL` is `https://api.z.ai/api/anthropic` and default model `claude-sonnet-4-6` (`:20`); despite the Anthropic SDK, calls default to z.ai/GLM.

**Impact:** The "AI" has no memory of prior deals, no grounding in the firm's own underwriting knowledge, and no per-user/session context. Answers are re-derived from ~6 numbers each call. The enormous knowledge corpus provides zero product value at runtime. Marketing/positioning that implies a knowledge-grounded advisor is unsupported by the implementation.
**Recommendation:** If grounding is a goal, build an actual retrieval step (embed the corpus, retrieve top-k into the prompt). If not, delete/relocate the corpus out of the app repo and stop implying a knowledge layer exists. Separately, confirm the intended LLM provider — the default routes off Anthropic.

---

### F5 — MEDIUM-HIGH — In-memory rate limiters defeated by serverless horizontal scaling and cold starts
**Evidence:**
- `src/serverApp.ts:67-79` — `narrateLimiter` (10/min) and `apiLimiter` (120/min) use `express-rate-limit` with the default in-process `MemoryStore`.
- `src/serverApp.ts:65-66` — inline comment already concedes: *"memory-based limiters reset on cold starts… replace with a Redis store or Firestore store."*
- `src/function.ts:5-12` — deployed as a Cloud Function with `maxInstances: 10`. Each instance has independent memory → limits are per-instance.

**Impact:** Effective global limit is up to `10 × configured` (the LLM endpoint's 10/min becomes ~100/min across instances) and resets whenever an instance cold-starts. For a paid LLM endpoint (and z.ai spend), this is a real cost/abuse exposure, and the limiter gives false assurance.
**Recommendation:** Move to a shared store (Firestore/Redis) keyed by IP/user, or gate `/api/narrate` behind authenticated quota. At minimum, set `maxInstances: 1` only if throughput allows (not recommended) — the correct fix is a shared-store limiter.

---

### F6 — MEDIUM — Computed analyses are never persisted anywhere durable
**Evidence:**
- The dashboard computes via `fetch("/api/dscr/solve|sensitivity|optimize|state")` (`ComplianceDashboard.tsx:390-392,413`). The only persistence of a result is `saveLog(...)` → the `artifacts/.../audits` path that F2 shows is denied.
- No other collection stores analyses; `/deals` (the natural home) is unused (F3).

**Impact:** There is no durable record of any underwriting run tied to a user. Combined with F1/F2, the platform currently persists *nothing* server-side except (attempted) leads. "Come back and see your saved deals" is not achievable.
**Recommendation:** Implement `/deals` (it already has rules) as the canonical store for saved analyses, written through an authenticated path; wire the dashboard's `saveLog`/history to it.

---

### F7 — MEDIUM — PII lifecycle & lead-spam exposure
**Evidence:**
- Lead payload contains `name,email,phone` plus a TCPA/ECOA `consent` record with `policyVersion` (`QualifyModal.tsx:1892-1930`). On the (currently guaranteed, per F1) write failure it is stored unencrypted in `localStorage['gs_leads']` (`:1951-1953`) — persistent on shared/public/kiosk browsers, never cleared, readable by any script on the origin.
- `/leads` create is unauthenticated by design (`firestore.rules:54-62`) with only field-presence + length caps — no rate limiting, dedup, or CAPTCHA at the rules layer.
- `src/serverApp.ts:38-41` — request-IP logging is explicitly flagged as PII and gated to non-prod, which is good; but the lead PII path above is the larger exposure.

**Impact:** (a) Consent/PII persisted client-side on potentially shared devices is a privacy/compliance problem for a regulated lending funnel. (b) The open leads endpoint invites spam/junk documents (caps limit size, not volume).
**Recommendation:** Never persist consent/PII to localStorage; drop the fallback or make it a transient, encrypted, self-clearing retry buffer. Add write throttling/App Check to `/leads`. Define a retention/erasure policy (CCPA/GDPR delete path) for leads.

---

### F8 — MEDIUM — "Immutability" and "soft-delete" guarantees are theatrical (they protect unused collections; the real audit path is mutable)
**Evidence:**
- `firestore.rules:24` — `/users` `delete: if false` "Soft-delete only." But nothing writes `/users`, and no soft-delete flag/flow exists in code (grep for a `deleted`/`isDeleted` field on users: none). The guarantee guards an empty collection.
- `firestore.rules:46-47` — `/auditLogs` `update:false, delete:false` (immutable). But the real audit records live at `artifacts/.../audits`, where the client freely calls `deleteDoc` (`ComplianceDashboard.tsx:361`). The actual "audit trail" is user-deletable — the opposite of immutable.

**Impact:** Compliance claims (immutable audit log, soft-delete of users) are not enforced on the data the app actually uses. An auditor relying on these rules would be misled.
**Recommendation:** Enforce immutability/soft-delete on the paths that hold the data. If audit logs must be tamper-evident, write them server-side (Admin SDK) to an append-only collection with `update/delete:false`, not via a client that can delete them.

---

### F9 — LOW-MEDIUM — `graphify-out/cache` (78 tracked files) is a dev-tool cache committed to the repo, and it is stale
**Evidence:**
- `graphify-out/cache/` holds 76 content-addressed JSON blobs (sha256 filenames); each is a per-source-file node/edge extraction (e.g., `…fc1.json` = `{"nodes":[{"id":"test_urls_ps1",…}],"edges":[]}`).
- `git ls-files graphify-out/` → 78 tracked files. It is committed, not ignored (`.gitignore` does not list it).
- `graphify-out/GRAPH_REPORT.md:1` dated `2026-06-24` — ~1 month stale vs. today (2026-07-23); it is a snapshot, not live.

**Impact:** This is *not* application memory — it is a code-knowledge-graph tool's cache. It bloats the repo and can mislead an auditor into thinking it is a runtime index. It does not reach production: `firebase.json:36-37` excludes `graphify-out` from the functions bundle and hosting ships only `dist/`. So impact is repo hygiene, not runtime.
**Recommendation:** Gitignore `graphify-out/cache/` (and regenerate on demand) or move the whole `graphify-out/` under a `tools/` path clearly marked as non-runtime. Don't commit content-addressed caches.

---

### F10 — LOW — `firestore.indexes.json` is empty, but nothing currently needs an index — because the query layer is trivial/vaporware
**Evidence:**
- `firestore.indexes.json:1-4` — `{"indexes": [], "fieldOverrides": []}`.
- The only live queries are: `addDoc` to `leads` (no query); `onSnapshot` on the `audits` collection ref with **no `orderBy`** — sorting is done in JS (`ComplianceDashboard.tsx:334-338`); and single-doc `getDoc` for broker settings. None requires a composite index. Single-field ordering, if added, is auto-indexed by Firestore.
- The ordered/filtered "history" queries the `/deals` and `/auditLogs` rules imply (e.g., `where(userId) + orderBy(createdAt)`) *would* need composite indexes — but those features don't exist (F3/F6), so the empty file breaks nothing today.

**Impact:** No current query is broken. The empty indexes file is a symptom of the missing real query layer, not an active defect. The risk is latent: the first time someone writes `where('userId','==',uid).orderBy('createdAt')` against `deals`, it throws `FAILED_PRECONDITION: The query requires an index` at runtime.
**Recommendation:** Leave as-is for now, but add the composite index(es) at the same time the `/deals` history query is implemented. Keep index definitions in the same PR as the query that needs them.

---

### F11 — LOW — `src/firebase.ts` imports Firestore query APIs it never uses (abandoned data-layer scaffolding)
**Evidence:**
- `src/firebase.ts:3` imports `collection, addDoc, query, orderBy, onSnapshot, where, DocumentData, getDocs` — none are used in the file (it only exports `auth`, `db`, providers). Actual Firestore calls are made via inline dynamic imports elsewhere (`QualifyModal.tsx:1940-1942`).

**Impact:** Cosmetic/dead code; a minor smell reinforcing that the central data module was scaffolded and then bypassed. No runtime effect (tree-shaken in build).
**Recommendation:** Remove the unused imports; if a shared data-access module is desired, centralize reads/writes there instead of ad-hoc dynamic imports in components.

---

### F12 — LOW — No cross-session client state at all beyond two localStorage flags; theme context is ephemeral
**Evidence:**
- Only three localStorage usages exist repo-wide: `QualifyWidget.tsx:29,76,99` (`gs_qualify_seen` one-time auto-open gate) and `QualifyModal.tsx:1951-1953` (`gs_leads` fallback, see F1/F7). No `sessionStorage`/`indexedDB` anywhere.
- The only React context is a theme context (`src/components/wf.tsx:12-13`, `ThemeCtx`), which is in-memory and resets on reload. No `useReducer`/store persists calculator inputs.
- `DealAnalyzerPage.tsx` uses 9 `useState` hooks and zero persistence; grep for `localStorage|sessionStorage|persist` there → none matched (only `useState`).

**Impact:** For a multi-step DSCR analyzer, losing all inputs on refresh/navigation is a real UX/product gap and depresses completion of long forms. It also means no autosave/resume for the qualify funnel.
**Recommendation:** Persist calculator/funnel inputs to `sessionStorage` (or `localStorage` with a TTL) keyed per tool, and offer resume. For signed-in users, autosave drafts to `/deals` once F2/F6 are fixed.

---

## Direct answers to the audit's key questions

**"Is deal/user data actually persisted anywhere, or is it ephemeral?"**
Effectively ephemeral / not persisted. Under the repo's own rules: (a) leads fail validation (missing `submittedAt`) and fall back to the visitor's localStorage — lost to the business (F1); (b) the ComplianceDashboard's audit history and broker settings write to `artifacts/**`, which the catch-all rule denies (F2); (c) `/deals` is never referenced by any code — "deal history" is vaporware (F3/F6). The only durable, correctly-pathed collection is `/leads`, and even that write is rejected today. Net: no user, deal, or audit data reliably persists server-side.

**"Does the AI feature have any memory/retrieval?"**
No. `src/routes/narrate.ts` is a stateless, single-shot prompt built from ~6 numbers with no RAG, no vector store, no filesystem/corpus read, and no session memory (F4). The 53-file / ~2.9M-word `docs/dscr_loan_office` corpus and the `graphify-out` knowledge graph are never touched at runtime — they are not a memory layer. (It also defaults to the z.ai endpoint rather than Anthropic.)

---

## Severity roll-up
| # | Sev | Finding |
|---|-----|---------|
| F1 | CRITICAL | Lead writes rejected (missing `submittedAt`) → leads lost to localStorage |
| F2 | CRITICAL | ComplianceDashboard `artifacts/**` path denied by catch-all rule |
| F3 | HIGH | Rules vs code schema divergence; `/deals` vaporware, `/users` & `/auditLogs` orphans |
| F4 | HIGH | narrate is stateless; zero RAG/retrieval; corpus unused; routes to z.ai |
| F5 | MEDIUM-HIGH | In-memory rate limiters × maxInstances:10 + cold starts defeat the cap |
| F6 | MEDIUM | Computed analyses never durably persisted |
| F7 | MEDIUM | PII/consent persisted to localStorage; open unthrottled leads endpoint |
| F8 | MEDIUM | Immutability/soft-delete guarantees protect unused collections; real audits are client-deletable |
| F9 | LOW-MEDIUM | `graphify-out/cache` (78 files) committed + stale; dev cache, not app memory |
| F10 | LOW | Empty `firestore.indexes.json` — not breaking yet only because queries are trivial |
| F11 | LOW | `src/firebase.ts` dead Firestore imports |
| F12 | LOW | No calculator/funnel state persistence; refresh loses all inputs |

**Total findings: 12** (2 CRITICAL, 2 HIGH, 1 MEDIUM-HIGH, 3 MEDIUM, 1 LOW-MEDIUM, 3 LOW).
