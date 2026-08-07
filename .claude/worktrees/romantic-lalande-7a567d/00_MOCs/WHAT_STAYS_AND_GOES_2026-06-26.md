# What Stays and What Goes - 2026-06-26

Scope: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`

This decision file is based on the full file-by-file manifest:

- `00_MOCs/FILE_BY_FILE_DISPOSITION_2026-06-26.csv`
- `00_MOCs/MARKDOWN_MERGE_GROUPS_2026-06-26.csv`

## What Was Actually Read

- 32,790 files were opened.
- 5.67 GB were streamed and SHA-256 hashed.
- Text/source/Markdown/JSON files were decoded and inspected for headings or code signatures.
- CSV files were inspected for headers and row counts.
- SQLite, XLSX, ZIP, DOCX, and PDF files were inspected for available metadata.
- 2,715 exact duplicate hash groups were found.
- 11,340 files participate in exact duplicate groups.

## Keep at Root

These stay at root:

- `AGENTS.md`
- `CLAUDE.md`
- `CLAUDE_MEMORY.md`
- `README.md`
- `00_MASTER_README.md`
- `TASKS.md`
- `ORGANIZATION_PLAN.md`
- `ROOT_MD_INVENTORY_CATEGORIZATION.md`
- `package.json`
- `pyproject.toml`
- `turbo.json`
- `.obsidianignore`

Reason: project controls, workspace config, agent/tool config, or current organization records.

## Keep Active

### `greenstreet_frontend/`

Keep as the active product app.

Keep:

- `src/`
- `api/`
- `public/`
- `assets/`
- `scripts/`
- Firebase/Vercel/Vite/TS/package config
- `.env.example`
- `.env.production.example`
- app README

Move out later:

- `FULL_STACK_AUDIT.md`
- `QA_FIXPLAN.md`
- `QA_REPORT_DEFINITIVE_2026-06-24.md`
- `ULTRA_REVIEW_2026-06-24.md`
- `COPY_DSCR_LANDING.md`
- `COPY_RECOMMENDATIONS.md`
- `GREENSTREET_NORTH_STAR.md`
- `GREENSTREET_TEASER_CUTSHEET.md`
- `GREENSTREET_TRAILER_PLAN.md`
- `ad-script-60-seconds.md`
- `voiceover-script-60-seconds.md`
- `non_qm_dscr_master_blueprint_2026_06_26.md`

Target:

- QA reports -> `docs/qa/greenstreet_frontend/`
- Copy/marketing docs -> `docs/marketing/greenstreet/`
- DSCR research blueprint -> `docs/research/analysis/` or archive if duplicate.

Delete when disk/file count matters:

- `greenstreet_frontend/node_modules/`

Reason: generated dependency folder, 28,827 files. Reinstall with `npm install` inside `greenstreet_frontend`.

Do not delete without checking app references:

- Duplicate images under `public/img/generated/scenes/` and `public/img/resources/`. They are byte-identical pairs, but app references decide which path survives.

## Keep as Reference

### `DSCR_SOVEREIGN_OS/`

Keep as read-only reference code.

Reason: project instruction says old v0.5.x-style code remains reference and should not be promoted into the active app.

Already removed:

- `.venv/`
- coverage artifacts

Delete later if present:

- `__pycache__/`
- `.pytest_cache/`
- `.coverage*`

## Keep Data

### `data/raw/`

Keep all.

Reason: immutable source data lake.

### `data/processed/`

Keep for now.

Reason: derived/testbed data is useful, but many files duplicate `data/raw/`. Prune only after loaders/rebuild scripts are validated.

Keep definitely:

- `data/processed/dscr_engine.db`

Reason: verified SQLite testbed with 16 tables.

Delete candidates after rebuild validation:

- Processed copies that are exact duplicates of `data/raw`, especially Realtor, Zillow, Inside Airbnb, CAL FIRE, Treasury FIO, NMDB, SAFMR, and state population files.

High-value duplicate examples:

- `data/raw/DSCR_Datasets/_realtor_raw/RDC_Inventory_Core_Metrics_Zip_History.csv`
- `data/processed/national/_realtor_raw/RDC_Inventory_Core_Metrics_Zip_History.csv`
- `data/raw/DSCR_Datasets/california/state_open_data/CALFIRE_DINS_Damage_Inspections.csv`
- `data/processed/california/california/state_open_data/CALFIRE_DINS_Damage_Inspections.csv`
- `data/raw/DSCR_Datasets/zillow_zori/Zip_zori_uc_sfrcondomfr_sm_month.csv`
- `data/processed/rent_estimates/zillow_zori/Zip_zori_uc_sfrcondomfr_sm_month.csv`
- `data/processed/national/zillow_zori/Zip_zori_uc_sfrcondomfr_sm_month.csv`

## Keep Cold Archive

### `99_attachments/`

Keep as cold archive/reference.

Reason: source bundles, PDFs, XLSX, ZIPs, and attachment copies. Do not keep in root, but do not delete until extraction coverage is proven.

Possible later deletes:

- Archive files whose extracted contents are already present in `data/raw/`.
- Duplicate `agent_outputs` copies after the active `agent_outputs/` folder is merged.

## Merge or Archive

### `docs/research/`

Keep as the organized research corpus.

Current structure:

- `specs/`
- `deep-dives/`
- `analysis/`
- `sprints/`
- `ml-architecture/`
- `operational/`
- `_archive/`

This is now the preferred home for root-level DSCR research.

### `RESEARCH/`

Merge or archive.

Reason: it contains a lot of useful domain/sprint/lender work, but there are many exact and near-exact overlaps with `docs/research`, `01_research_notes`, and `greenstreet_frontend/docs/dscr_loan_office`.

Keep until merged:

- domain research
- lender profiles
- sprint source notes
- competitor intelligence

Archive/delete after merge:

- `RESEARCH/sprint_short/*` where identical full sprint docs exist.
- `_archive/sprint_clean/*` where identical docs exist in `docs/research/sprints/`.

### `ANALYSIS/`

Merge into `docs/research/analysis/`.

Reason: content is research/analysis, not active app or data.

### `01_research_notes/`

Merge or archive carefully.

Reason: many files are duplicate or near-duplicate of canonical docs, but Obsidian/vault metadata may matter. Do not bulk-delete without preserving metadata if needed.

### `agent_outputs/`

Merge into `docs/agent-outputs/`.

Exact duplicate found:

- `agent_outputs/AC09_V2_ad_copy.md`
- `99_attachments/DSCR_Borrower_Intelligence_V2/agent_outputs/AC09_V2_ad_copy.md`

Rule: keep the active `agent_outputs/` copy until moved into `docs/agent-outputs/`, then archive duplicate attachment copy.

### `output/`

Merge generated reports into `docs/research/analysis/` or archive under `docs/archive/output_YYYY-MM-DD/`.

Delete only generated logs/temp files after confirming report copies are preserved.

## Archive or Delete Generated Outputs

### `graphify-out/`

Keep only if actively used as the current knowledge graph output.

Reason: it has many exact duplicate converted Markdown files and generated wiki/module files.

Recommended:

1. Keep `GRAPH_REPORT.md`, `index.html`, and any current wiki output only if the graph is live.
2. Archive the whole folder as a generated artifact if graphify can rebuild it.
3. Delete duplicate `converted/*_<hash>.md` copies after confirming source files remain.

Examples of exact duplicate graphify conversions:

- `graphify-out/converted/Supporting_Underlying_Metrics_FIO_Homeowners_Insurance_2018-2022_*.md`
- `graphify-out/converted/CA_DOF_E5_2026_*.md`
- `graphify-out/converted/CDI_Residential_Insurance_New_Renew_NonRenew_by_ZIP_*.md`
- `graphify-out/converted/FL_BEBR_*.md`
- `graphify-out/converted/FY2026_SAFMRs_revised_*.md`

### `dscr-demo_website/`

Archive or delete after confirming no unique app assets.

Reason: generated/static demo website, not active product.

### `dscr-sovereign-os/`

Archive or delete after confirming no unique code versus `DSCR_SOVEREIGN_OS/`.

Reason: old lightweight duplicate/reference project. Keep only if it contains a unique historical artifact.

### `.minimax/`

Archive or delete if not using MiniMax tooling.

Reason: plugin/tooling cache and examples, not DSCR project source.

### `99_external_check/`

Archive under `tools/external-check/` if still needed.

Reason: quarantined tool/import, includes environment-sensitive files. Do not publish.

### `99_engine_egnine/`

Rename/archive as `tools/engine-audit/`.

Reason: typo directory plus audit/extraction tools, not active app.

### `99_build_scripts/`

Keep for now.

Reason: scripts are data lineage and rebuild logic for the SQLite/data testbed.

Later target:

- `scripts/build/`
- `scripts/analysis/`
- `scripts/validation/`

## Exact Markdown Duplicate/Merge Rules

Use `00_MOCs/MARKDOWN_MERGE_GROUPS_2026-06-26.csv` as the merge queue.

Immediate archive candidates:

- `greenstreet_frontend/docs/dscr_loan_office/*` when identical copy exists in `docs/research/*`.
- `RESEARCH/sprint_short/*` when identical full sprint document exists in `RESEARCH/sprints/` or `docs/research/sprints/`.
- `01_research_notes/*` when identical canonical copy exists in `docs/research/*`, after preserving any Obsidian metadata.
- Duplicate `graphify-out/converted/*_<hash>.md` files.

Merge-review candidates:

- High-similarity research specs that are not exact duplicates.
- Older “master” documents that overlap but may contain unique sections.
- Sprints with shortened names versus long canonical names.

## Final Recommended Cleanup Order

1. Delete `greenstreet_frontend/node_modules/` only when ready to reinstall dependencies.
2. Move frontend QA/copy docs into `docs/qa/greenstreet_frontend/` and `docs/marketing/greenstreet/`.
3. Move `agent_outputs/` into `docs/agent-outputs/`.
4. Reconcile `RESEARCH/`, `ANALYSIS/`, and `01_research_notes/` using `MARKDOWN_MERGE_GROUPS_2026-06-26.csv`.
5. Decide whether `graphify-out/` is live; archive/delete generated duplicates if rebuildable.
6. Validate data rebuild scripts in `99_build_scripts/`.
7. Delete exact processed data duplicates only after step 6.
8. Archive or remove old tool/import folders: `.minimax/`, `dscr-demo_website/`, `dscr-sovereign-os/`, `99_external_check/`, `99_engine_egnine/`.

