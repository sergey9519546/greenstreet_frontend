# Greenstreet DSCR Platform — Architecture & System-Integrity Audit (Lane 01)

Auditor lane: Principal Architect — systemic/big-picture only.
Repo: `/home/user/greenstreet_frontend` (React 19 + Vite SPA, Express API, deterministic engine, Firebase Functions).
Method: read entrypoints + wiring, traced imports/`fetch` with grep, cross-referenced `graphify-out/graph.json` + `GRAPH_REPORT.md`. Read-only; no repo files modified.

**Verdict up front:** This is **not one coherent runtime** — it is a single codebase wired for **three mutually inconsistent deploy targets**, and the marquee "server-authoritative deterministic engine offloaded to a Worker" is **largely theater**: the engine ships to the browser and runs client-side on ~10 of ~28 routed views, while the Worker pool backs exactly **one** view and is bypassable/broken depending on host. For a lending product, computed underwriting numbers are not authoritative and are not consistent across surfaces.

Total findings: **27** (3 Critical, 10 High, 10 Medium, 4 Low).

---

## TOP 5 SYSTEMIC ISSUES

1. **[CRITICAL] Financial computation is not server-authoritative.** Only `ComplianceDashboard` (the portal) calls `/api/dscr/*` (`src/components/ComplianceDashboard.tsx:390-413`). Every other tool page imports the engine and runs the identical math **in the browser** (`src/pages/DecisionSupportPage.tsx:5-7` imports `solveDSCR`, `computeVerdict`; 9 more pages likewise). The public DSCR calculator hand-rolls a *third* formula inline (`src/pages/DSCRCalculatorPage.tsx:48 dscr = rent/pitia`). Results that gate loan decisions are computed on the client, are user-manipulable, and the proprietary lender DB (`lenders.ts`, 1,922 LOC) + state-law rules (`statePppLaws.ts`, 2,573 LOC) are bundled into public JS.

2. **[CRITICAL] Three parallel deploy targets, no single source of truth.** `server.ts` (standalone Express+Vite for Node/Cloud Run), `src/function.ts` (Firebase Function `api`), and `api/index.ts` (Vercel serverless) all wrap the same `serverApp`, but `vercel.json`, `firebase.json`, `.firebaserc`, `.gcloudignore`, and `firebase-applet-config.json` describe **different** hosts, **two different Firebase projects**, and placeholder origins. Where this actually deploys is ambiguous and the configs conflict.

3. **[CRITICAL] Worker offload is fragile and can hang requests.** `new Worker(process.cwd()+"/dist/engineWorker.cjs")` (`src/engineService.ts:16-18,54`) resolves a path that is not guaranteed to exist on Vercel (its bundler never produces that file). On any worker `error`/`exit`, the in-flight task is **never rejected** (`src/engineService.ts:72-85`) → the awaiting HTTP request hangs to the platform timeout, and a missing/broken worker file triggers an **infinite respawn loop**.

4. **[HIGH] ~2,300 LOC of orphaned engine code.** Six engine modules are unreachable from any entrypoint (barrel, worker, or page): `irrWaterfall.ts` (473), `trueCostEngine.ts` (506), `v11Runner.ts` (450), `reserveEngine.ts` (368), `reassessmentEngine.ts` (272, only reached by the dead `v11Runner`), `monteCarlo.ts` (227). Corroborated by graph communities 2/10/12/17/25/27 (isolated high-cohesion clusters). Plus a dead legacy UI shell (`PageShell.tsx`/`HowItWorks.tsx`).

5. **[HIGH] No shared state/deal model; divergent DSCR math across surfaces.** There is no global store (only a `ThemeCtx`, `src/components/wf.tsx:12`). The portal's computed deal is never shared with the standalone tool pages, each of which re-derives inputs via `buildEngineInputs` and computes independently. The same "DSCR" is produced by ≥3 code paths (server `solveDSCR`, client `solveDSCR`, inline `rent/pitia`, plus `quickDscrEstimate`) that can disagree.

---

## Theme A — Deploy-target coherence

### A1. [CRITICAL] Three entrypoints for three hosts, none authoritative
**Evidence:**
- `server.ts:1-59` — standalone Express, adds Vite dev middleware / static `dist` serving + SPA fallback. Run by `npm run dev` (`tsx server.ts`) and `npm start` (`node dist/server.cjs`). Implies a long-running Node host (Cloud Run / VM).
- `src/function.ts:5-13` — wraps `serverApp` as Firebase Function v2 `api` (us-central1, 1GiB, 60s). `package.json:"main":"dist/function.cjs"`.
- `api/index.ts:1-2` — `export default app` for Vercel; `vercel.json:2-10` rewrites `/api/(.*)` and `/health` → `/api/index.ts`.
- `package.json` build bundles **all three** (`server.ts`, `engineWorker.ts`, `function.ts`) via esbuild.

**Impact:** Nobody can answer "where does this run?" from the repo. Each host serves the frontend differently (server.ts static+SPA fallback; Firebase `hosting` serves `dist` with `/api/**`→function; Vercel serves static + serverless). Divergent request/static/fallback handling means bugs reproduce on one target and not another. `dist/server.cjs` is dead weight in the Firebase/Vercel bundles (and would crash if loaded there — it imports `vite`, a devDependency).
**Recommendation:** Pick one primary target. Delete or clearly quarantine the other two entrypoints behind a documented `deploy/` folder. Document the chosen topology (static host + API host) in README.

### A2. [HIGH] Two different Firebase projects referenced
**Evidence:** `.firebaserc:3` → `"default":"gen-lang-client-0809198072"`. `firebase-applet-config.json:3` → `"projectId":"project-34827ae3-34d1-4d2c-a7d"` (with a committed web `apiKey` on line 5). `src/firebase.ts:8-15` reads a *third* source (env `VITE_FIREBASE_*`, all empty in `.env.example:25-30`).
**Impact:** The client SDK, the deployed Functions/Firestore, and the "applet config" can point at three different backends. Auth tokens minted against one project won't validate against another (see `middleware/auth`, used at `serverApp.ts:30`). High risk of "works locally, 401s in prod."
**Recommendation:** Consolidate to one project id sourced from env; delete `firebase-applet-config.json` or make it the single source; never commit keys.

### A3. [HIGH] Production CORS allowlist is a placeholder
**Evidence:** `src/serverApp.ts:14-16` default origins include the literal `"https://your-firebase-app.web.app"`; `.env.example:11` sets `ALLOWED_ORIGINS` to localhost only. No real deployed origin exists anywhere in the repo.
**Impact:** If `ALLOWED_ORIGINS` isn't set in prod, the real frontend origin is not whitelisted → browser `fetch("/api/dscr/*")` from the deployed site is blocked (credentials mode + array origin mismatch). The core product silently fails cross-origin.
**Recommendation:** Fail fast at startup if `ALLOWED_ORIGINS` is unset in production; remove the placeholder.

### A4. [MEDIUM] `firebase.json` functions ignore-list vs `.gcloudignore` diverge and both ship junk
**Evidence:** `firebase.json:12-60` ignores `*.png/*.html/*.jpg/*.ps1` but **not** `*.mp4` (repo has `explainer-reel.mp4` 12MB, `greenstreet-83s-master.mp4`, etc.) nor `*.md` (4 audit docs, ~120KB) nor `greenstreet-60-seconds-ad/`, `voiceover/`, `audit-frames*/`. `.gcloudignore:1-25` uses a *different* exclusion set (ignores `src/`, keeps `!dist/`). `firebase.json` functions `"source":"."` uploads the entire repo root minus ignores.
**Impact:** ~20MB+ of media/docs bundled into the function deploy → slower deploys and cold starts; two ignore mechanisms that can silently disagree about what's deployed.
**Recommendation:** Move server code to a dedicated `functions/` package with a minimal footprint, or align both ignore files and add `*.mp4`, `*.md`, media dirs.

### A5. [LOW] `vercel.json` final rewrite is a no-op and there's no build/output config
**Evidence:** `vercel.json:11-14` `source:"/(.*)" → "/$1"` is an identity passthrough. No `buildCommand`/`outputDirectory`; relies on Vite auto-detection, which runs `vite build` (not the repo's `npm run build`) and therefore never produces `dist/engineWorker.cjs` (feeds A/C3).
**Recommendation:** Remove the no-op rewrite; if Vercel is a real target, set explicit build/output and reconcile the worker path (see C3).

---

## Theme B — Client/server boundary (server-authoritative computation)

### B1. [CRITICAL] Engine runs client-side on ~10 of ~28 routed views; API backs only 1
**Evidence:** Only `/api/dscr/*` consumer is `src/components/ComplianceDashboard.tsx:390-392,413`. Pages importing the engine directly (bundled into browser chunks): `TaxEnginePage.tsx:3-4`, `DecisionSupportPage.tsx:5-7`, `ARMPage.tsx:9-10`, `ReturnsPage.tsx:3`, `MonteCarloPage.tsx:3-4`, `STRUnderwritingPage.tsx:4`, `StressMatrixPage.tsx:3`, `PortfolioPage.tsx:4-5`, `RefiTrackerPage.tsx:4`, plus `QualifyModal.tsx:18,25`. No page issues any `/api` fetch (grep of `src/pages` for `fetch(`/`/api/` → 0 matches).
**Impact:** For a lending product this is the headline integrity problem: underwriting numbers (DSCR solve, verdict, IRR, stress, returns, tax) are computed in the user's browser, fully editable via devtools, and not reproducible/loggable server-side. The entire server engine + Worker pool exists to serve a single screen.
**Recommendation:** Route all financial computation through the API; make the engine a server-only package the client cannot import (enforce with a lint boundary / separate tsconfig project references).

### B2. [HIGH] Proprietary lender pricing + rule data leak to the browser
**Evidence:** Because pages import `../engine/*`, Vite bundles `engine/lenders.ts` (barrel comment "real 19-lender provenance DB", 1,922 LOC), `engine/statePppLaws.ts` (2,573 LOC of state usury/PPP facts), and pricing logic in `engine/engine.ts` (`estimateRate`, 1,057 LOC) into downloadable client chunks (`src/engine/index.ts:48-54,57-65`).
**Impact:** Competitive IP (lender matrix, pricing curves, legal rule set) is publicly retrievable from the JS bundle. Also means rule changes require a frontend redeploy rather than a server config change.
**Recommendation:** Server-only engine (see B1); expose only computed results + display metadata to the client.

### B3. [HIGH] At least three divergent DSCR implementations
**Evidence:** (a) server `solveDSCR` via Worker (`engineWorker.ts:22`); (b) client `solveDSCR` imported directly (`DecisionSupportPage.tsx:6`); (c) inline `dscr = pitia>0 ? rent/pitia : 0` (`DSCRCalculatorPage.tsx:48`) with its own tax/insurance inputs; (d) `quickDscrEstimate` in `QualifyModal.tsx:18` (documented at `engine/index.ts:18-22` to use different defaults: 0.5% ins / 1.2% tax / 75% LTV / 360-mo).
**Impact:** The public calculator, the qualify modal, and the underwriting engine can display **different DSCR values for the same deal** — a compliance and trust hazard for a lender. `estimateRate()` is a 12-edge god node (`GRAPH_REPORT.md:95`), so rate assumptions differ per surface too.
**Recommendation:** One canonical DSCR/PITIA implementation behind the API; the public calculator should call it (or a documented "quick estimate" endpoint) rather than re-implement.

### B4. [MEDIUM] Same-origin `fetch("/api/...")` with no API base URL abstraction
**Evidence:** `ComplianceDashboard.tsx:390-413` uses relative paths; there is no `VITE_API_BASE_URL`. Works only when frontend and API share an origin.
**Impact:** The moment the SPA is served from a static/CDN host separate from the function host (a normal split), all API calls 404. Couples the deployment topology to a hidden assumption.
**Recommendation:** Introduce a configurable API base; default to same-origin.

---

## Theme C — Engine Worker offload (real boundary or theater?)

### C1. [HIGH] In-flight tasks are never rejected on worker death → hung requests
**Evidence:** `src/engineService.ts:58-70` deletes/settles a task only on a `message`. The `worker.on("error")` (72-77) and `worker.on("exit")` (79-85) handlers respawn the worker but do **not** reject the `activeTasks` that were assigned to the dead worker. `runTask` (107-113) returns a promise that therefore never settles.
**Impact:** A single worker crash (OOM, exception, bad input) hangs the corresponding `/api/dscr/*` request until the 60s function timeout, consuming an instance slot. No circuit breaker, no per-task timeout.
**Recommendation:** On `error`/`exit`, reject every `activeTask` owned by that worker; add a per-task timeout in `runTask`.

### C2. [HIGH] Infinite respawn loop when the worker file is missing/broken
**Evidence:** `engineService.ts:72-77` and `79-85` both call `createWorker()` unconditionally on failure. `createWorker()` (50-88) re-points at the same `workerPath`. If that path can't load (see C3), every spawn fails → immediate `error` → respawn, unbounded.
**Impact:** CPU spin, log flooding, and (with C1) permanently hung DSCR requests. Hard failure mode with no backoff or max-retry.
**Recommendation:** Bounded ret/backoff; on repeated failure, mark the pool degraded and fall back to the inline path.

### C3. [CRITICAL] Worker file path is not portable across deploy targets
**Evidence:** `engineService.ts:15-18` → prod path `path.join(process.cwd(),"dist","engineWorker.cjs")`. Vercel builds `api/index.ts` with its own tracer and never runs the repo's esbuild step, so `dist/engineWorker.cjs` is absent and `process.cwd()` is the function sandbox, not repo root. On Firebase it *may* resolve (the file is uploaded — `firebase.json` ignores only `dist/engineWorker.cjs.map`, not the `.cjs`), but relies on `process.cwd()===/workspace`.
**Impact:** On Vercel the default config (`WORKER_POOL_SIZE=4`) makes `/api/dscr/*` non-functional (feeds C1/C2). Environment-dependent breakage of the core endpoint.
**Recommendation:** Resolve the worker via `new URL('./engineWorker.cjs', __dirname)`/module resolution, bundle it as an asset of the function, or drop worker_threads for serverless and run inline.

### C4. [HIGH] Duplicated engine-orchestration logic (worker vs inline fallback)
**Evidence:** The SOLVE/SENSITIVITY/OPTIMIZE/STATE bodies are copy-pasted in two files: `engineWorker.ts:20-74` and the `WORKER_POOL_SIZE==="0"` inline branches in `engineService.ts:118-196`. Both call the same engine fns with identical argument order (e.g. the 12-arg `computeBreakevenResult` call at `engineWorker.ts:40-52` vs `engineService.ts:146-158`).
**Impact:** Two authoritative code paths that must be kept byte-identical by hand; any edit to one silently diverges results between "worker on" and "worker off" (and neither matches the client-side pages of B1). Classic correctness drift for a financial core.
**Recommendation:** Extract a single `runEngineTask(type,payload)` module imported by both the worker and the inline path.

### C5. [MEDIUM] Offload provides little benefit and is trivially bypassed → "theater"
**Evidence:** `WORKER_POOL_SIZE==="0"` (`engineService.ts:119,141,168,181`) runs everything inline on the main thread. The engine is pure deterministic arithmetic (no I/O); serialization across the worker boundary (structured clone of `deal`/`sensitivity`/`options`) plus thread hand-off can cost more than the compute for typical inputs. In serverless, per-instance concurrency is low, so 4 threads per instance mostly idle. And the pool backs only one screen (B1).
**Impact:** Complexity, failure modes (C1-C3), and deploy weight for negligible throughput gain. It reads as architecture signaling rather than a load-bearing boundary.
**Recommendation:** Either commit to it (long-running Node host, real load) or delete the pool and call the engine inline; keep the async API shape.

### C6. [LOW] Serialization boundary drops non-clonable fields silently
**Evidence:** Worker returns plain objects via `postMessage` (`engineWorker.ts:80`). If the engine ever returns a class instance, `Map`/`Set`, or function-bearing object, structured clone silently strips methods/typing (no error).
**Impact:** Latent correctness risk if engine return shapes evolve; today the returns look like POJOs so impact is low.
**Recommendation:** Add a contract test asserting worker output deep-equals the inline output for a fixture set.

---

## Theme D — Dead code / orphaned modules (graph-driven)

### D1. [HIGH] Six orphaned engine modules (~2,296 LOC), ~26% of the engine
**Evidence (no importers anywhere; grep of `src` for each basename):**
`engine/irrWaterfall.ts` (473), `engine/trueCostEngine.ts` (506), `engine/v11Runner.ts` (450), `engine/reserveEngine.ts` (368), `engine/monteCarlo.ts` (227), and `engine/reassessmentEngine.ts` (272 — imported only by the orphan `v11Runner.ts:34`, so transitively dead). None are re-exported by `engine/index.ts:1-108`. Corroborated by `GRAPH_REPORT.md` isolated communities: 2 (trueCostEngine cluster), 10 (reserveEngine), 12 (irrWaterfall), 17 (reassessmentEngine), 25 (monteCarlo), 27 (v11Runner) — all zero cross-module edges.
**Impact:** A third of the "27-module engine" is unreachable. It inflates the apparent scope of the financial core, invites accidental use of stale logic, and dilutes test/audit focus. `v11Runner` in particular looks like a former top-level orchestrator that was orphaned.
**Recommendation:** Delete or move to an explicit `engine/experimental/` with a README; if any is intended to ship, wire it and test it.

### D2. [MEDIUM] Dead legacy UI shell (`PageShell` / `HowItWorks`)
**Evidence:** 27 pages import `design/SiteShell` (`DcShell`); only `HowItWorks.tsx:2` imports `pages/PageShell`, and `PageShell.tsx:2` imports `HowItWorks` — they reference only each other. `SiteShell.tsx:6` comment: "Extracted from PageShell so DcShell … can reuse them." Graph flags both as thin isolated communities (`GRAPH_REPORT.md:425-428`, Communities 55/56).
**Impact:** Two parallel shell systems; the old one is effectively dead but still built and maintained.
**Recommendation:** Remove `PageShell.tsx`/`HowItWorks.tsx` (or fold the one section still wanted into `SiteShell`).

### D3. [MEDIUM] `god` modules concentrate risk
**Evidence:** `engine/statePppLaws.ts` 2,573 LOC, `components/QualifyModal.tsx` 2,043, `engine/lenders.ts` 1,922, `components/ComplianceDashboard.tsx` 1,729, `engine/types.ts` 1,508. God *nodes* per graph: `solveDSCR()` 15 edges, `estimateRate()` 12, `scoreOneLender()` 11, `mFixed()` 11 (`GRAPH_REPORT.md:90-99`).
**Impact:** Change-amplification and review difficulty around the exact modules that decide loan outcomes; `QualifyModal` and `ComplianceDashboard` are 1.7-2k-LOC components mixing UI, state, and (for the modal) financial math.
**Recommendation:** Split data (lender/PPP tables) from logic; extract math out of `QualifyModal`; decompose `ComplianceDashboard`.

---

## Theme E — Build / config integrity

### E1. [HIGH] Single `package.json` bundles three runtimes with conflicting expectations
**Evidence:** `package.json` `build` = `vite build` + esbuild ×3 (`server.cjs`, `engineWorker.cjs`, `function.cjs`); `main:"dist/function.cjs"` (Firebase); `start:"node dist/server.cjs"` (Node host); Vercel uses `api/index.ts` (neither). esbuild `--packages=external` means all deps resolve from `node_modules` at runtime, so server-only deps (`express`, `firebase-functions`, `@anthropic-ai/sdk`) must be in `dependencies` (they are) while `vite` (imported by `server.ts:4`) is a devDependency — fine for Node host, but `dist/server.cjs` would crash if ever loaded on Firebase/Vercel.
**Impact:** One artifact set serving three contracts; `main` is correct only for Firebase; the tri-target build is the root of the "which runtime?" ambiguity (Theme A).
**Recommendation:** Split into workspaces (`web/`, `functions/`) or at least separate build scripts per target with documented outputs.

### E2. [MEDIUM] `tsconfig.json` has no client/server project separation and `noEmit`
**Evidence:** `tsconfig.json:1-26` is a single bundler-mode config (`"noEmit":true`, `allowImportingTsExtensions`), `paths:{"@/*":["./*"]}`. `lint` = `tsc --noEmit` over everything. There is no boundary preventing a client page from importing server/worker code, which is exactly what enables B1.
**Impact:** Nothing structurally stops the client/server boundary leak; type-checking treats browser and Node code as one program.
**Recommendation:** Project references: `tsconfig.client.json` (DOM lib, cannot import `engine`/`serverApp`) vs `tsconfig.server.json` (Node lib). Enforce the engine boundary in CI.

### E3. [MEDIUM] Vite alias `@ → repo root` can bundle server/root files into the client
**Evidence:** `vite.config.ts:11` aliases `@` to `path.resolve(__dirname,'.')` (repo root), and `tsconfig.json:18-21` mirrors it. Any `@/server`, `@/src/serverApp`, `@/api/...` import would pull Node/Express code into the browser bundle.
**Impact:** Footgun that widens the boundary-leak surface; a stray `@/`-import of server code would break the build in confusing ways or ship server code to clients.
**Recommendation:** Alias `@` to `src/` only.

### E4. [LOW] `.env.example` documents client secrets and a non-obvious LLM egress default
**Evidence:** `narrate.ts:14` defaults `baseURL` to `https://api.z.ai/api/anthropic` and `narrate.ts:20` model `claude-sonnet-4-6`; `.env.example:18,21` leave these blank. Deal data (DSCR, rate, verdict summary) is sent to whatever `ANTHROPIC_BASE_URL` resolves to.
**Impact:** By default, borrower/deal context egresses to a third-party proxy (`z.ai`), not Anthropic — a data-governance surprise for a lending product. (Deep-dive belongs to the security lane; noted here as an integrity/coherence concern.)
**Recommendation:** Default to the official endpoint; make the proxy opt-in and documented.

---

## Theme F — State / data-flow architecture

### F1. [HIGH] No shared state model; portal deal not shared with tool pages
**Evidence:** Only React context in the codebase is `ThemeCtx` (`src/components/wf.tsx:12-13`). `App.tsx` prop-drills `onBack`/`onNavigate` into every page (`App.tsx:308-383`) and holds routing in local `useState` (`App.tsx:159-168`). Each tool page rebuilds inputs independently via `buildEngineInputs` (e.g. `DecisionSupportPage.tsx:7`, `PortfolioPage.tsx:5`); `ComplianceDashboard` holds the portal deal in **27 `useState`** hooks with no export.
**Impact:** A deal entered in the portal cannot flow into the Returns/Tax/Stress/Decision tools — the user re-enters everything, and each tool may assume different defaults (feeds B3). No single source of truth for "the current deal."
**Recommendation:** Introduce one deal/session store (Context+reducer or a small store lib) that the portal and all tool pages read/write; make the API the persistence layer.

### F2. [MEDIUM] Hand-rolled router with misleading "React Router" comments and duplicated route tables
**Evidence:** No `react-router` dependency (grep `package.json` → 0). `App.tsx:193-195` comment claims "navigates via React Router"; routing is actually `history.pushState` + `popstate` (`App.tsx:114-120,170-179`). The route set is encoded **twice**: `ROUTE_MAP` + `resolveRoute` + `isKnownRoute` (`src/router/resolve.ts:34-191`) and again as `viewToPath` + `portalTabFromPath` (`App.tsx:103-156`), which must be kept in sync by hand.
**Impact:** Add-a-route requires editing 4 tables across 2 files; drift produces links that navigate but don't render (or vice-versa). Comments actively mislead maintainers.
**Recommendation:** Single route registry (path ↔ view ↔ loader) consumed by both resolve and render; fix the comments or adopt a router.

### F3. [MEDIUM] SPA + hidden Webflow marketing DOM coexist and fight over routing
**Evidence:** `App.tsx:213-248,260-299` manually toggles `#webflow-root`/`#root` visibility, sets `inert`/`aria-hidden`, and starts/stops marketing GSAP; comments reference a "V8 route-drift bug" where embedded marketing scripts hijacked history (`App.tsx:225-228`). `index.html` is 221KB of embedded marketing markup.
**Impact:** Two runtimes (Webflow export + React SPA) share one document and can race on scroll/history; the mitigations are defensive band-aids around a structural overlap.
**Recommendation:** Serve marketing and app as separate documents/routes, or fully port marketing into React; stop cross-managing another framework's DOM/handlers.

---

## Theme G — Repo hygiene / structural drift

### G1. [MEDIUM] Nested `greenstreet_frontend/greenstreet_frontend/` leftover
**Evidence:** `greenstreet_frontend/greenstreet_frontend/` contains only a `.gitignore` referencing unrelated projects (`airdna-project/`, `perfectproperty/`, `99_attachments/`). Root also holds `_regen_tmp/`, `hf-*` (13 dirs), `audit-frames-v3..v5/`, dozens of `matrix-media-*.png`, five `*.mp4`, and four large audit `*.md` at the repo root.
**Impact:** Signals accreted history / copy-paste project setup; pollutes deploy payloads (Theme A4), graph analysis (graph nodes for `*.ps1`, `generate_flux.py`), and developer navigation.
**Recommendation:** Remove the nested dir and non-source artifacts, or move them under a clearly ignored `assets/`/`marketing/` tree.

### G2. [LOW] Prior audit docs already flag issues but aren't reconciled
**Evidence:** Root contains `FULL_STACK_AUDIT.md` (41KB), `ULTRA_REVIEW_2026-06-24.md`, `QA_REPORT_DEFINITIVE_2026-06-24.md`, `QA_FIXPLAN.md` — multiple overlapping audits committed alongside the code.
**Impact:** No single tracked issue list; findings risk being re-discovered (as here) rather than resolved. Suggests audits are produced but not driven to closure.
**Recommendation:** Convert to tracked issues; keep one living architecture doc.

---

## Cross-reference to `graphify-out`
- Orphan modules (D1) map to the graph's isolated high-cohesion communities: 2 (trueCostEngine), 10 (reserveEngine), 12 (irrWaterfall), 17 (reassessmentEngine), 25 (monteCarlo), 27 (v11Runner) — `GRAPH_REPORT.md:114-227`. The graph's "Surprising Connections: None … all connections are within the same source files" (`:101-102`) is itself the tell: modules don't call across files because the live ones are wired through the barrel/pages and the dead ones aren't wired at all.
- God nodes `solveDSCR` (15), `estimateRate` (12) (`:90-99`) are the exact functions duplicated across server/worker/client (B1/B3/C4).
- Thin/isolated UI communities 55/56 (`HowItWorks`, `PageShell`) confirm the dead shell (D2).
