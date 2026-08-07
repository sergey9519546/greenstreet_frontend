# Full Folder Review and Cleanup Recommendation - 2026-06-26

Scope: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`

## Evidence Produced

- `00_MOCs\COMPLETE_FOLDER_INVENTORY_REVIEWED_2026-06-26.csv`
- `00_MOCs\KEEP_LIST_2026-06-26.csv`
- `00_MOCs\MERGE_LIST_2026-06-26.csv`
- `00_MOCs\ARCHIVE_LIST_2026-06-26.csv`
- `00_MOCs\DELETE_LIST_2026-06-26.csv`
- `00_MOCs\NEEDS_HUMAN_REVIEW_LIST_2026-06-26.csv`
- `00_MOCs\REDUNDANCY_MAP_2026-06-26.csv`
- `00_MOCs\MARKDOWN_MERGE_GROUPS_2026-06-26.csv`

## Complete Folder Inventory

The complete file-by-file inventory is in `00_MOCs/COMPLETE_FOLDER_INVENTORY_REVIEWED_2026-06-26.csv`. It contains every file path, file type, topic estimate, review status, uniqueness/overlap notes, value status, final action, and reason.

- Total files represented: 32,790
- Exact duplicate groups: 2,715
- Markdown near-duplicate/merge pairs: 17,090

## Action Counts

- `DELETE`: 28,855
- `ARCHIVE`: 2,049
- `KEEP`: 1,847
- `MERGE`: 39

## Top-Level Folder Decision Matrix

| Folder | KEEP | MERGE | ARCHIVE | DELETE | NEEDS HUMAN REVIEW |
|---|---:|---:|---:|---:|---:|
| `.agent` | 6 | 0 | 0 | 0 | 0 |
| `.claude` | 24 | 0 | 0 | 0 | 0 |
| `.codex` | 1 | 0 | 0 | 0 | 0 |
| `.minimax` | 0 | 0 | 344 | 0 | 0 |
| `.obsidian` | 10 | 0 | 0 | 0 | 0 |
| `.obsidianignore` | 1 | 0 | 0 | 0 | 0 |
| `00_MASTER_README.md` | 1 | 0 | 0 | 0 | 0 |
| `00_MOCs` | 35 | 0 | 0 | 0 | 0 |
| `00_engine` | 88 | 0 | 0 | 0 | 0 |
| `00_website` | 0 | 2 | 0 | 0 | 0 |
| `01_research_notes` | 0 | 0 | 39 | 0 | 0 |
| `99_attachments` | 0 | 0 | 57 | 0 | 0 |
| `99_build_scripts` | 15 | 0 | 0 | 0 | 0 |
| `99_engine_egnine` | 0 | 0 | 52 | 0 | 0 |
| `99_external_check` | 0 | 0 | 153 | 0 | 0 |
| `AGENTS.md` | 1 | 0 | 0 | 0 | 0 |
| `ANALYSIS` | 11 | 5 | 11 | 0 | 0 |
| `CLAUDE.md` | 1 | 0 | 0 | 0 | 0 |
| `CLAUDE_MEMORY.md` | 1 | 0 | 0 | 0 | 0 |
| `DSCR_SOVEREIGN_OS` | 44 | 0 | 0 | 0 | 0 |
| `ORGANIZATION_PLAN.md` | 1 | 0 | 0 | 0 | 0 |
| `README.md` | 1 | 0 | 0 | 0 | 0 |
| `RESEARCH` | 424 | 20 | 139 | 0 | 0 |
| `ROOT_MD_INVENTORY_CATEGORIZATION.md` | 1 | 0 | 0 | 0 | 0 |
| `TASKS.md` | 1 | 0 | 0 | 0 | 0 |
| `agent_outputs` | 0 | 0 | 11 | 0 | 0 |
| `autoresearch` | 0 | 0 | 4 | 0 | 0 |
| `data` | 786 | 0 | 80 | 0 | 0 |
| `docs` | 52 | 0 | 5 | 0 | 0 |
| `dscr-demo_website` | 0 | 0 | 81 | 2 | 0 |
| `dscr-sovereign-os` | 0 | 0 | 21 | 25 | 0 |
| `graphify-out` | 0 | 0 | 1052 | 0 | 0 |
| `greenstreet_frontend` | 287 | 12 | 0 | 28828 | 0 |
| `memory` | 2 | 0 | 0 | 0 | 0 |
| `output` | 50 | 0 | 0 | 0 | 0 |
| `package.json` | 1 | 0 | 0 | 0 | 0 |
| `pyproject.toml` | 1 | 0 | 0 | 0 | 0 |
| `turbo.json` | 1 | 0 | 0 | 0 | 0 |

## Keep List Summary

Keep files that are current controls, active app source, raw datasets, verified processed testbeds, organized research docs, or legacy reference code. The full keep list is `KEEP_LIST_2026-06-26.csv`.

Most important keeps:

- Root project controls: `AGENTS.md`, `README.md`, `TASKS.md`, `ORGANIZATION_PLAN.md`, `ROOT_MD_INVENTORY_CATEGORIZATION.md`, `package.json`, `pyproject.toml`, `turbo.json`.
- Active app source: `greenstreet_frontend/src/`, `greenstreet_frontend/api/`, app config, and runtime assets.
- Research source of truth area: `docs/research/`.
- Raw data lake: `data/raw/`.
- Verified SQLite testbed: `data/processed/dscr_engine.db`.
- Read-only code reference: `DSCR_SOVEREIGN_OS/`.

## Merge List Summary

Merge files contain useful information but are in the wrong place or overlap a stronger document. The full merge list is `MERGE_LIST_2026-06-26.csv`. Extract headings, formulas, evidence links, unique examples, and implementation details before archiving originals.

Priority merge buckets:

- `greenstreet_frontend/*.md` QA/copy/research docs -> `docs/qa/greenstreet_frontend/`, `docs/marketing/greenstreet/`, or `docs/research/analysis/`.
- `00_website/INDEX.md` and `00_website/FRONTEND_HUB.md` -> root README/docs navigation after link updates.
- `RESEARCH/`, `ANALYSIS/`, `01_research_notes/`, `output/`, `agent_outputs/`, and `00_engine/research/` -> canonical `docs/research/` or `docs/agent-outputs/` based on topic.

## Archive List Summary

Archive files are historical, generated, cold attachments, older source copies, or duplicates that should not be used as current truth. The full archive list is `ARCHIVE_LIST_2026-06-26.csv`.

Priority archive buckets:

- `graphify-out/` if rebuildable.
- `99_attachments/` as cold source/archive material.
- `docs/research/_archive/` superseded drafts.
- Duplicate processed data copies after rebuild validation.
- Old/demo/import tool folders: `.minimax/`, `dscr-demo_website/`, `dscr-sovereign-os/`, `99_external_check/`, `99_engine_egnine/`, `autoresearch/`.

## Delete List Summary

Delete candidates are only files classified as generated/reproducible. The full delete list is `DELETE_LIST_2026-06-26.csv`.

- `greenstreet_frontend/node_modules/`: 28,827 files. Safe because dependencies can be restored from `greenstreet_frontend/package-lock.json` and `greenstreet_frontend/package.json`.
- Future delete candidates: logs, caches, build outputs, `.venv`, `__pycache__`, `.pytest_cache`, and exact duplicates after canonical copies are confirmed.

## Redundancy Map

Use `REDUNDANCY_MAP_2026-06-26.csv` for exact hash clusters and Markdown near-duplicate clusters. Strongest version preference is: `docs/research/` for research docs, `data/raw/` for source data, active app paths for runtime assets, and non-generated root configs for controls.

Common redundant clusters found:

- `greenstreet_frontend/docs/dscr_loan_office/*` duplicates many `docs/research/*` files.
- `RESEARCH/sprint_short/*`, `RESEARCH/sprints/*`, and `01_research_notes/*` duplicate several sprint docs.
- `graphify-out/converted/*_<hash>.md` contains many repeated generated conversions.
- `data/processed/*` contains many exact raw-data copies from `data/raw/*`.
- `agent_outputs/*` overlaps `99_attachments/DSCR_Borrower_Intelligence_V2/agent_outputs/*`.

## Master Source-of-Truth Recommendation

No single current file is good enough to be the whole source of truth. Create a new master knowledge base with this structure:

- `docs/research/MASTER_SOURCE_OF_TRUTH.md` - executive canonical index and decision map.
- `docs/research/specs/DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` - primary architecture/spec base.
- `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md` - canonical resolved spec supplement.
- `docs/research/specs/DSCR_Underwriting_Engine_Master_Consolidated_v16.md` - underwriting logic source.
- `docs/research/analysis/100_DSCR_BUSINESS_QUESTIONS_ANSWERED.md` - business/Q&A source.
- `docs/research/operational/UNIFIED_HUB.md` - product/content hub source.

## Final Cleanup Plan

1. Freeze deletes until the CSVs above are accepted.
2. Remove `greenstreet_frontend/node_modules/` when ready to trade immediate runnability for cleanup.
3. Move frontend QA/copy docs into `docs/qa/greenstreet_frontend/` and `docs/marketing/greenstreet/`.
4. Create `docs/research/MASTER_SOURCE_OF_TRUTH.md` from the strongest canonical docs listed above.
5. Reconcile `RESEARCH/`, `ANALYSIS/`, `01_research_notes/`, `output/`, and `agent_outputs/` using `MARKDOWN_MERGE_GROUPS_2026-06-26.csv`.
6. Archive `graphify-out/` unless it is the live graph output; if rebuildable, delete duplicate converted files.
7. Validate `99_build_scripts/` loaders against `data/raw/` and `data/processed/dscr_engine.db`.
8. Delete exact processed data duplicates only after step 7.
9. Archive or retire `.minimax/`, `dscr-demo_website/`, `dscr-sovereign-os/`, `99_external_check/`, `99_engine_egnine/`, and `autoresearch/` after checking unique assets/code.
10. Re-run the inventory and confirm no unreviewed or orphaned files remain.
