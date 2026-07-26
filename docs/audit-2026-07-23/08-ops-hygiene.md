# 08 — DevOps / Repository-Hygiene Audit

**Target:** `/home/user/greenstreet_frontend` (Greenstreet DSCR lending platform)
**Date:** 2026-07-23
**Scope:** Repo health, git bloat, build/release, deploy topology, secrets/config, dependencies, operational readiness.
**Method:** Read-only. `git ls-files`, `git rev-list`, `git count-objects`, `git cat-file`, config reads. No repository files modified; no `git rm/gc/filter-branch` run.

---

## TOP 5 OPS/HYGIENE ISSUES

| # | Severity | Issue | One-line evidence |
|---|----------|-------|-------------------|
| 1 | **HIGH** | `.git` is **233.8 MiB** — a source repo dominated by committed binary media; every clone/CI pull drags it | `git count-objects -vH` → `size-pack: 233.76 MiB`; 2,933 blobs / 298.8 MB uncompressed across history |
| 2 | **HIGH** | **~114 MB of tracked media is pure junk** (never app inputs): 364 `audit-frames*` screenshots (67 MB), 87 root `matrix-media-*.png` (23 MB), 5 root marketing `.mp4` (19 MB), voiceover mp3 (2.8 MB) | all tracked; `.gitignore` covers **none** of them |
| 3 | **HIGH** | **Deploy target is ambiguous** — 3+ conflicting configs: Firebase (`firebase.json`), Vercel (`vercel.json`), and an orphaned GCP path (`.gcloudignore` + `server.ts`) with **two different Firebase project IDs** | `.firebaserc`=`gen-lang-client-0809198072` vs `firebase-applet-config.json`=`project-34827ae3-...` |
| 4 | **HIGH** | **No CI whatsoever** — no `.github/`, no pipeline anywhere. Tests (vitest) and lint (`tsc --noEmit`) exist but never run automatically | `find .github` → absent; no CI config tracked |
| 5 | **MEDIUM** | **Committed machine-local / vendored junk**: `.firebase/hosting.*.cache` (CLI deploy cache), `.minimax/` (278 files, 9.8 MB vendored skill docs), `animations/` (808 files, vendored HeyGen "hyperframes" toolchain), `_regen_tmp/`, `.trash/`, `*.ps1`, `greenstreet_frontend/.gitignore` (nested self-dir) | all tracked; `firebase.json` "ignore" list proves they are *known* junk |

---

## Largest tracked files (working tree)

| Size | Path | Verdict |
|------|------|---------|
| 13 MB | `explainer-reel.mp4` (root) | JUNK — marketing render, not a web asset |
| 7.0 MB | `public/video/greenstreet-rebuild-v2.mp4` | app asset (oversized) |
| 6.1 MB | `public/img/people/maranda-leonard.png` | app asset (unoptimized — should be webp/≤300 KB) |
| 5.6 MB | `public/img/people/doug-thalhammer.png` | app asset (unoptimized) |
| 4.9 MB | `public/img/resources/thumbnail-01-laptop-dark.png` | app asset (unoptimized) |
| 4.7 MB | `public/img/generated/hero.png` | app asset (unoptimized) |
| 4.6 MB | `.minimax/skills/minimax-xlsx/docs/cases/.../superstore_orders_print.html` | JUNK — vendored skill doc |
| 4.0 MB | `review-logos-standalone.html` | JUNK — one-off review artifact |
| 3.1 MB | `public/video/hero.mp4` | app asset |
| 2.9 MB | `greenstreet-83s-master.mp4` (root) | JUNK — marketing render |
| 2.8 MB | `public/img/people/brook-powers.png` | app asset (unoptimized) |
| 2.3 MB | `public/video/state-laws-explainer.mp4` | app asset |
| 2.2 MB | `greenstreet-61s-landing.mp4` (root) | JUNK — marketing render |
| 1.4 MB | `voiceover/greenstreet-voiceover-full.mp3` | JUNK — source media |
| 1.2 MB | `greenstreet-34s-linkedin.mp4` (root) | JUNK — marketing render |
| ~0.7 MB ×87 | `matrix-media-*.png` (root, 23 MB total) | JUNK — AI-generation scratch output |

**Tracked totals:** 2,896 files. Media: **516 png/jpg = 163 MB**, **29 mp4/mp3/webm = 43 MB** → **206 MB of tracked binary media** in a source repo.

---

## FINDINGS

### F1 — `.git` is 233.8 MiB of mostly-binary history — HIGH
**Evidence:**
- `git count-objects -vH` → `in-pack: 3902`, `size-pack: 233.76 MiB` (single pack).
- History: 125 commits, **2,933 distinct blobs, 298.8 MB uncompressed**.
- Largest history blobs include files **no longer in the working tree** (deleted/superseded but still in the pack): `public/img/generated/hero.png` (two versions, 7.8 MB + 4.6 MB), `greenstreet-60s-landing.mp4` (5.2 MB), `logo_data_uris.json` (3.9 MB), `greenstreet-33s-linkedin.mp4`, `greenstreet-91s-master.mp4`, `public/video/{deal,dscr,lender,montecarlo,returns,stress}-explainer.mp4`, `tmp_download/`, `tmp_logo_analysis/`, `test_pollinations.jpg`, `.anim_ref/tools.mp4`.
- 451 distinct media paths have existed in history vs ~545 media files tracked now → **dozens of deleted binaries (~90+ MB) remain permanently in the pack.**

**Impact:** Every clone and every CI checkout transfers ~234 MB regardless of what the app needs (dist is ~a few MB). Slows onboarding, CI cold-start, and any Git-based deploy. Deleting files now will **not** reclaim it — the blobs live in history.

**Recommendation:** (1) Stop committing binaries (see F2). (2) Move genuine large app media to Firebase Storage/a CDN or Git LFS. (3) A one-time history rewrite (`git filter-repo`) to purge junk media would drop `.git` by well over half — schedule as a coordinated force-push since it rewrites SHAs. (Explicitly *not* performed here.)

---

### F2 — ~114 MB of tracked media should never be in the repo; `.gitignore` covers none of it — HIGH
**Evidence (all tracked, confirmed via `git ls-files`):**

| Junk group | Files | Size |
|---|---|---|
| `audit-frames/` + `-v3/` + `-v4/` + `-v5/` (versioned Puppeteer screenshot dumps) | 91 × 4 = 364 | 67 MB |
| `matrix-media-*.png` at repo **root** (AI-gen scratch) | 87 | 23 MB |
| Root marketing renders `explainer-reel.mp4`, `greenstreet-{16,34,61,83}s-*.mp4` | 5 | 19 MB |
| `voiceover/*.mp3` (source audio) | 13 | 2.8 MB |
| **Subtotal (media junk)** | | **~112 MB** |
| `review-logos-standalone.html` (4 MB) + `review-logos.html` | 2 | 4 MB |
| `.minimax/` (vendored skill docs) | 278 | 9.8 MB |
| `animations/how-it-works/.agents/skills/...` (vendored HeyGen "hyperframes" toolchain: 450 .md, 131 .html, 86 .mjs) | 808 | 11 MB |
| `graphify-out/` (graph build cache: `GRAPH_REPORT.md` + `cache/*.json`) | 78 | 0.7 MB |
| `_regen_tmp/batch_016.json`, `batch_024.json`; `.trash/DSCRCalculatorSection.tsx`; `.firebase/hosting.ZGlzdA.cache` | 4 | small |
| **Grand total non-app junk** | | **~137 MB** |

`.gitignore` (65 lines) ignores `node_modules/`, `dist/`, `*.log`, `.env*`, `*.zip`, `*.bak`, `hf-*/renders`, `hf-*/node_modules`, etc. — but **does not list** `matrix-media`, `audit-frames*`, root `*.mp4`, `*.mp3`, `voiceover/`, `animations/`, `.minimax/`, `graphify-out/`, `_regen_tmp/`, `.trash/`, `.firebase/`, `review-logos*.html`, or `*.ps1`. These were `git add`-ed and are actively tracked.

**Impact:** This is the bulk of the 206 MB media load and the F1 history bloat. `audit-frames-v3/v4/v5` are three redundant re-runs of the same screenshot suite. `animations/` and `.minimax/` vendor entire external agent-skill repos into a lending frontend.

**Recommendation:** `git rm -r --cached` all of the above, add matching `.gitignore` entries, and keep marketing/voiceover source media in a separate assets repo or bucket. Delete the redundant `audit-frames-v3/v4/v5` outright.

---

### F3 — `firebase.json` "ignore" list is the smoking gun: junk is *known* but still committed — MEDIUM
**Evidence:** `firebase.json` → `functions.ignore` explicitly lists `hf-deal…hf-tax`, `_regen_tmp`, `graphify-out`, `.trash`, `.minimax`, `.qodo`, `review-logos-standalone.html`, `review-logos.html`, `*.png`, `*.jpg`, `*.html`, `*.ps1`, `*.log`, `animations`, `scripts`, `docs`. The team enumerated ~30 junk paths to keep them **out of the Functions upload** — yet the same paths remain **committed to git**. The ignore list is a workaround for a hygiene problem instead of a fix.

**Impact:** Confirms these dirs are recognized as non-shippable; they bloat the repo purely as tech debt.

**Recommendation:** Untrack them (F2). The `firebase.json` ignore list can then shrink to essentials.

---

### F4 — `firebase.json` Functions `source: "."` ignore list is **incomplete** — it still uploads root `.mp4`/`.mp3`/`.md` — MEDIUM
**Evidence:** `functions.source: "."` with `predeploy: npm run build`. The `ignore` globs cover `*.png`, `*.jpg`, `*.html`, `*.ps1`, `*.log` — but there is **no `*.mp4`, `*.mp3`, `*.md`, or `*.json`(broad) entry**. So a `firebase deploy --only functions` bundles the whole repo minus the ignored set, which **still includes** the 5 root marketing `.mp4` (~19 MB), `voiceover/*.mp3` (2.8 MB), and every root `*.md` audit report (`FULL_STACK_AUDIT.md` 41 KB, `QA_REPORT_DEFINITIVE…md` 43 KB, etc.).

It will **not** balloon to 482 MB (png/jpg/html and the big dirs are excluded), but it needlessly ships ~20+ MB of media into the Cloud Functions artifact, slowing deploys and cold starts.

**Recommendation:** Deploying functions from repo root is fragile. Move functions to a dedicated `functions/` subdir with its own `package.json`, or at minimum add `*.mp4`, `*.mp3`, `*.md`, `*.mp3`, `voiceover`, `greenstreet-60-seconds-ad` to the ignore list. Fixing F2 removes most of this automatically.

---

### F5 — Deploy target ambiguity: three topologies, two Firebase projects — HIGH
**Evidence — three conflicting deploy definitions coexist:**
1. **Firebase** (`firebase.json`): Hosting `public: dist`; Functions `source: "."`, `runtime: nodejs20`, exports `api = onRequest(...)` (`src/function.ts` → `dist/function.cjs`); rewrites `/api/**` → function `api`; also Firestore rules+indexes. *Most complete.*
2. **Vercel** (`vercel.json`): rewrites `/api/(.*)` and `/health` → `/api/index.ts` (which is `export default app` from `src/serverApp`). No `buildCommand`/`outputDirectory` — relies on Vercel auto-detect. A *second, serverless* backend definition.
3. **GCP long-running** (implied): `.gcloudignore` (ignores `src/`, `public/`, keeps `dist/`) + `server.ts` (`app.listen` Express server) + `"start": "node dist/server.cjs"`. But there is **no `app.yaml`, `Dockerfile`, `cloudbuild.yaml`, `apphosting.yaml`, or `Procfile`** — so `.gcloudignore` is **orphaned**: it configures a `gcloud app deploy` / Cloud Run build that has no manifest.

**Project-ID mismatch even within Firebase:** `.firebaserc` default project = `gen-lang-client-0809198072`, but `firebase-applet-config.json` projectId = `project-34827ae3-34d1-4d2c-a7d` (an AI-Studio applet project). A deploy could target the wrong project.

**Same code, three runtime shapes:** `api` as a Firebase HTTPS function, `app` as a Vercel serverless handler, and `server.ts` as a persistent Node server — mutually exclusive scaling/cost/cold-start models.

**Impact:** No single source of truth for "where does this run." High risk of deploying to the wrong platform/project, drift between the serverless and long-running code paths, and confusion for any new operator.

**Recommendation:** Pick one primary target (Firebase Hosting+Functions is the most fleshed-out) and delete or clearly quarantine the others. Reconcile to a single Firebase project ID. If Vercel/GCP are dead, remove `vercel.json` and `.gcloudignore`.

---

### F6 — No CI/CD pipeline — HIGH
**Evidence:** `find .github` → **absent**. No `.gitlab-ci`, `.circleci`, `cloudbuild.yaml`, `Jenkinsfile`, etc. tracked. Yet the repo has a vitest suite (`vite.config.ts` → `include: ['src/**/*.test.ts']`; latest commit "Add comprehensive test coverage") and a lint script.

**Impact:** Tests and typecheck exist but are never enforced. Nothing gates merges to `main`; regressions ship silently. `firebase deploy` predeploy runs `npm run build` locally only — build success depends on each developer's machine.

**Recommendation:** Add a minimal GitHub Actions workflow: `npm ci` → `npm run lint` (`tsc --noEmit`) → `npm test` → `npm run build`, on PR and push. This is the single highest-leverage ops fix.

---

### F7 — Lint passes; build is multi-stage but reproducible-ish — LOW (positive)
**Evidence:** `lint_output.txt` contains only the npm banner and **no diagnostics** → `tsc --noEmit` **passes clean**. `package-lock.json` (332 KB) is present → deterministic installs. Build chains `vite build` + 3 × `esbuild` bundles (`server.cjs`, `engineWorker.cjs`, `function.cjs`), all with `--packages=external --sourcemap`.

**Caveat:** `lint` is *only* `tsc --noEmit` — there is **no ESLint** (no lint rules, no style/a11y/security linting). "Lint" here means typecheck only.

**Impact:** Type safety is enforced when run manually; broader code-quality linting is absent. Build has several moving parts but is scripted and lockfile-backed.

**Recommendation:** Add ESLint; wire both into CI (F6). Committing `lint_output.txt` is itself minor junk — untrack it.

---

### F8 — Dependency & version coherence: unpinned Node, duplicate anim libs, heavy Puppeteer — MEDIUM
**Evidence:**
- **No `engines` field** in `package.json` → Node version unpinned. Firebase Functions runtime is `nodejs20`, but `@types/node` is `^22.20.0` → **type surface models Node 22 APIs while the deploy runtime is Node 20** (risk of using APIs that typecheck but don't exist at runtime).
- **Two animation libraries:** `motion@^12.23` *and* `gsap@^3.15` + `@gsap/react` are both dependencies. `vite.config.ts` even carves separate `manualChunks` for `gsap` and `motion`. Redundant runtime weight and two mental models for the same job.
- **Puppeteer `^25.2.0`** as a devDependency — downloads a full Chromium (~150 MB+) on `npm install`, used only for the `audit-frames` screenshot scripts. Heavy install/CI cost for a non-shipping tool.
- `firebase@^12` (client) + `firebase-admin@^13` (server): expected for full-stack; fine.
- **Stack majors are current and mutually compatible:** React 19 + Vite 6 + Tailwind 4 (`@tailwindcss/vite`) + Motion 12 + TypeScript 5.8 + esbuild 0.25 + vitest 4 — no known incompatibilities.

**Impact:** Node type/runtime skew can produce runtime failures that pass typecheck. Dual anim libs bloat the client bundle. Puppeteer inflates install/CI time and node_modules.

**Recommendation:** Add `"engines": { "node": "20.x" }` and set `@types/node` to `^20`. Consolidate on one animation library. Move Puppeteer to an optional/separate tooling package or drop it once `audit-frames` scripts are retired.

---

### F9 — Secrets/config hygiene: no leaked secrets in env examples, but real Firebase config + CLI cache committed — MEDIUM
**Evidence:**
- `.env.example` and `.env.production.example`: all sensitive values are **blank** (`ANTHROPIC_AUTH_TOKEN=`, `VITE_FIREBASE_*=`). **No secrets leaked.** Good.
- `.gitignore` correctly ignores `.env*` while allowlisting the two `*.example` files; `git ls-files | grep .env` returns **only** the two examples. Good.
- `firebase-applet-config.json` is **tracked** and contains a **real Firebase web config**: `apiKey: AIzaSyDbhJW82HLr2xxCsaMcWT7NicKW3RkXpYo`, `appId`, `projectId: project-34827ae3-...`, `messagingSenderId`, `storageBucket`. (Firebase web API keys are designed to be public/client-exposed and are *not* a credential by themselves — but committing an AI-Studio applet config leaks the applet's project identity and is poor hygiene, especially given the open-API posture below.)
- `.firebase/hosting.ZGlzdA.cache` is **tracked** — a machine-local Firebase CLI deploy cache (base64 `dist`). Should never be committed.
- `.env.production.example` documents a **real operational risk in prose**: `REQUIRE_AUTH` is left unset → the `/api/*` surface is **OPEN**; `/api/narrate` calls a paid Anthropic LLM guarded only by IP rate-limiting (10/min, resets on serverless cold start) = an API-key-abuse vector. (Auth/security depth is another workstream's remit; flagged here as an ops-readiness caveat.)

**Impact:** No credential leak, but committed CLI cache and applet config are noise/identity leakage; the documented open-API + paid-LLM path is a cost/abuse risk in production.

**Recommendation:** Untrack `.firebase/` and `firebase-applet-config.json` (add to `.gitignore`); rotate/verify the Firebase project is App-Check protected. Treat the `REQUIRE_AUTH` open-API note as a release blocker for `/api/narrate` (per-route auth + frontend token attachment).

---

### F10 — Application runtime IS production-grade (not a prototype) — LOW (positive)
**Evidence (all in `src/`):**
- **Structured logging:** `pino` with a `redact` config censoring `authorization`, `x-api-key`, `body.apiKey/token`, and PII (`email`, `name`, `phone`, `firstName`, `lastName`) → `[REDACTED]`. Dev pretty-prints; prod emits JSON lines.
- **Health check:** `app.get("/health", ...)` in `src/serverApp.ts`.
- **Graceful shutdown:** `server.ts` handles `SIGTERM`/`SIGINT`, `server.close()`, 10 s forced-exit fallback.
- **Error handling:** central `errorHandler` middleware (`src/middleware/error.ts`), wired last; routes `next(err)` consistently.
- **Rate limiting:** `apiLimiter` on `/api/dscr`, `narrateLimiter` on `/api/narrate` (`express-rate-limit`).
- **Auth middleware:** global `verifyFirebaseToken`; input hardening via `express.json({ limit: "100kb" })` and `zod` validation middleware.
- **Startup env validation** in `server.ts` warns on missing `ANTHROPIC_AUTH_TOKEN`.
- **Firestore rules:** owner-scoped (`isOwner`, `isValidEmail`, `email_verified`), hard-delete denied.

**Impact:** The *code* is operationally mature. The gap is entirely in **repo hygiene, deploy clarity, and CI** — the shell around a solid app, not the app itself.

**Recommendation:** Preserve these patterns; the ops investment should go to F1–F6.

---

## Quantified bloat summary
- **`.git` pack:** 233.8 MiB (2,933 blobs, 298.8 MB uncompressed history).
- **Tracked binary media in working tree:** 206 MB (163 MB images + 43 MB video/audio).
- **Tracked media that shouldn't be there (junk, not app inputs):** **~112–114 MB** (67 MB audit-frames×4, 23 MB matrix-media, 19 MB root marketing mp4, 2.8 MB voiceover).
- **All non-app junk incl. vendored tooling + review HTML:** **~137 MB**.
- **`public/` legitimate-but-oversized assets:** 95 MB (73 MB `img` with 4–6 MB unoptimized PNGs, 19 MB `video`) — optimization opportunity, not junk.
- **Deploy configs:** 3 (Firebase / Vercel / orphaned GCP), 2 Firebase project IDs.
- **CI:** none.
- **Total findings:** 10 (4 HIGH, 4 MEDIUM, 2 LOW/positive).
