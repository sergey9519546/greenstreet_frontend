# Workspace File Disposition - 2026-06-25

Scope: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`

## Executive Decision

Keep `greenstreet_frontend/` as the active full-stack product repo. Treat everything else as research corpus, data lake, generated artifacts, legacy reference code, or scratch/import material.

Do not bulk-delete or bulk-move the research files yet. The workspace already has routing/index files, and several "duplicates" are not byte-identical because Obsidian vault copies add metadata. The safe cleanup path is index first, move second, delete last.

## Current State

- Workspace size after 2026-06-25 cleanup: about 6.49 GB across about 64,791 files.
- Active app repo: `greenstreet_frontend/`, git branch `design-merge`; `README.md` was intentionally rewritten during cleanup.
- Legacy/reference repo: `DSCR_SOVEREIGN_OS/`, git branch `master`, clean at inspection time.
- Root is not a git repository.
- Existing authoritative routing docs:
  - `00_website/INDEX.md`
  - `00_website/FRONTEND_HUB.md`
  - `UNIFIED_HUB.md`
  - `00_MOCs/FILE_INVENTORY_20260621.md`

## Cleanup Actions Completed 2026-06-25

- Rewrote `greenstreet_frontend/README.md` to describe the active Greenstreet DSCR app instead of the stale AI Studio boilerplate.
- Moved loose source archive bundles and `FEMA_NFIP_Redacted_Claims_All_States.csv` to `99_attachments/source_archives/2026-06-22/`.
- Moved verifier message `660` to `output/verifier_messages/660.json`.
- Moved generated `dashboard.html` to `output/dashboard_2026-06-23.html`.
- Moved generated `.coverage` to `output/coverage_2026-06-20.coverage`.
- Archived root `package.json` and `package-lock.json` to `99_attachments/root_node_scratch_2026-06-25/`.
- Removed root `node_modules/`, `_docs/`, and `.autoresearch/`.
- Left `00_compliance/` and `00_marketing/` as empty placeholders for the four-bucket plan.
- Left root research markdown in place pending index-safe reconciliation.
- Added a relocation note to `00_MASTER_README.md` because it is still referenced as the source-archive manifest.

## Disposition By Bucket

### 1. Active Product

Path: `greenstreet_frontend/`

Disposition: KEEP ACTIVE. This is the app/full-stack repo.

Rules:
- New product work goes here.
- Do not import old Python/monorepo code directly unless a verified algorithm is intentionally ported with tests.
- App README is stale AI Studio boilerplate and should be rewritten to describe the Greenstreet DSCR app.

### 2. Legacy Verified Code Reference

Path: `DSCR_SOVEREIGN_OS/`

Disposition: KEEP AS READ-ONLY REFERENCE.

Reason:
- It is a separate clean git repo.
- Project instructions say v0.5.x code remains reference and should not be promoted further.
- Use it for provenance, golden vectors, and historical verifier-shipped behavior only.

### 3. Data Lake And Derived Engine Testbed

Paths:
- `DSCR_Datasets/` - raw/acquired public datasets, about 2.4 GB.
- `00_engine/data/` - derived organized engine data plus `dscr_engine.db`, about 1.5 GB.
- `00_engine/research/` - research inputs for the engine work.
- `99_build_scripts/` - loaders, dashboards, audits, and build scripts.

Disposition: KEEP, BUT DOCUMENT LINEAGE.

Rules:
- `DSCR_Datasets/` should be treated as the canonical raw data lake.
- `00_engine/data/` should be treated as derived/reproducible working data.
- `dscr_engine.db` is a generated artifact; keep only if it saves time, but it should be rebuildable from scripts and raw data.

### 4. Research Corpus

Paths:
- Root `*.md` research documents.
- `RESEARCH/`
- `ANALYSIS/`
- `01_research_notes/`
- `00_MOCs/`
- `agent_outputs/`
- `output/`
- `memory/`

Disposition: KEEP AND RECONCILE THROUGH INDEXES.

Important finding:
- 34 root markdown files also exist in `01_research_notes/`.
- None of those 34 pairs were byte-identical at inspection time.
- The vault copies are generally larger because they include frontmatter/entity metadata.

Rules:
- Do not delete `01_research_notes/` as duplicate material.
- Do not move root master docs until references in `00_website/INDEX.md`, MOCs, and Obsidian links are updated.
- Use `00_website/INDEX.md` as the product/research routing authority.

### 5. Loose Root Archives And Large Raw Files

Files:
- `everything_session_complete.zip`
- `09_master_bundle_new.zip`
- `01_florida_datasets.zip`
- `02_california_datasets.zip`
- `03_dscr_loan_performance.zip`
- `04_national_raw_datasets.zip`
- `05_inside_airbnb_all_cities.zip`
- `DSCR-Research (1).zip`
- `DSCR egnine.tar`
- `dual engine.tar`
- `FEMA_NFIP_Redacted_Claims_All_States.csv`

Disposition: MOVE TO COLD ARCHIVE AFTER CONFIRMING COVERAGE.

Recommended target:
- `99_attachments/source_archives/2026-06-22/`

Reason:
- These are acquisition/import bundles and raw payloads, not working root files.
- Many are already represented in `DSCR_Datasets/` or `00_engine/data/`.

Do not delete immediately. First compare archive manifests against `DSCR_Datasets/_docs/00_INDEX.md` and `00_MASTER_README.md`.

### 6. Root Node Scratch

Files/directories:
- `package.json`
- `package-lock.json`
- `node_modules/`

Disposition: REMOVE OR ARCHIVE AS SCRATCH.

Finding:
- The root `package.json` only depends on `@google/adk`.
- Search found no non-`node_modules` references to `@google/adk` except root `package.json` and `package-lock.json`.
- This is separate from `greenstreet_frontend/node_modules`, which belongs to the app repo.

Recommended action:
- If no one is actively using a root ADK scratch script, delete root `node_modules/` and move/delete the root package files.
- This should save about 286 MB.

### 7. Small Root Strays

Files:
- `660` - delivered `dscr-verifier` message JSON.
- `dashboard.html` - generated dashboard output.
- `.coverage` - generated coverage artifact.
- `.obsidianignore`, `.obsidian/` - keep for Obsidian.
- `CLAUDE.md`, `CLAUDE_MEMORY.md`, `.agent/`, `.claude/`, `.codex/`, `.qodo/` - keep as agent/tooling config unless deliberately retiring tools.

Disposition:
- Move `660` to `output/verifier_messages/660.json`.
- Move `dashboard.html` to `output/dashboard_2026-06-23.html` or regenerate it from script.
- Remove `.coverage` if the corresponding old Python test run is no longer being audited.

### 8. Empty Placeholder Directories

Empty at inspection time:
- `_docs/`
- `.autoresearch/`
- `00_compliance/`
- `00_marketing/`

Disposition:
- Keep `00_compliance/` and `00_marketing/` if the four-bucket plan will be continued.
- Remove `_docs/` and `.autoresearch/` if no tool expects them.

### 9. External Imports And Old Extracts

Paths:
- `99_external_check/`
- `99_engine_egnine/`
- `dscr-demo_website/`
- `dscr-sovereign-os/`
- `graphify-out/`
- `.minimax/`
- `autoresearch/`

Disposition: KEEP AS QUARANTINED IMPORTS/OUTPUTS UNTIL REVIEWED.

Rules:
- Do not merge them into `greenstreet_frontend/` wholesale.
- Mine them for useful algorithms, tests, prompts, or assets only through explicit review.
- `99_external_check/` contains an `.env`; keep it out of any git repo.

## Safe Cleanup Order

1. Update `greenstreet_frontend/README.md` so the active app repo is self-describing.
2. Add/maintain this disposition memo as the root cleanup map.
3. Create `99_attachments/source_archives/2026-06-22/`.
4. Move loose root archive bundles and raw CSV into that archive folder.
5. Move `660`, `dashboard.html`, and `.coverage` into `output/` or delete only after confirming they are generated.
6. Remove root `node_modules/` and root package files if ADK scratch usage is not needed.
7. Reconcile root markdown versus `01_research_notes/` by updating indexes first, then moving superseded root docs into a dated research archive.
8. Only after the links are clean, remove or demote duplicate/superseded docs.

## Do Not Do

- Do not delete vault copies in `01_research_notes/` as duplicates; they carry metadata.
- Do not merge `DSCR_SOVEREIGN_OS/` into `greenstreet_frontend/` as a code promotion.
- Do not move compliance/regulatory documents without updating the indexes and preserving primary-source citations.
- Do not keep raw archive zips in root long term.
