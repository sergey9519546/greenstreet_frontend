# Cleanup Decision Log - 2026-06-26

Scope: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`

## Executive Summary

The workspace is now split into a cleaner shape:

- Root is for project control files only.
- Active full-stack app remains `greenstreet_frontend/`.
- Research Markdown is consolidated under `docs/research/`.
- Superseded root research drafts are preserved in `docs/research/_archive/superseded_root_docs_2026-06-26/`.
- Processed SQLite testbed moved to `data/processed/dscr_engine.db`.
- Generated Python virtual environments, coverage files, app build output, and app logs were removed.

This pass did not delete raw datasets, compliance/regulatory source material, or unique research content.

## Root Files Kept

These stay at root because they are project controls or active navigation files:

- `AGENTS.md`
- `CLAUDE.md`
- `CLAUDE_MEMORY.md`
- `README.md`
- `00_MASTER_README.md`
- `TASKS.md`
- `ORGANIZATION_PLAN.md`
- `ROOT_MD_INVENTORY_CATEGORIZATION.md`

## Research Consolidation

Root-level research/spec Markdown was moved into:

- `docs/research/specs/` - canonical specs, blueprints, AEGIS packs, underwriting specs.
- `docs/research/deep-dives/` - formula notes, research reports, debt analysis, rigorous research.
- `docs/research/analysis/` - strategy, lender intelligence, Q&A, market and gap analysis.
- `docs/research/sprints/` - sprint plans, phase reports, research execution notes.
- `docs/research/ml-architecture/` - TimesFM/LoRA architecture.
- `docs/research/operational/` - command center, verification logs, next steps, unified hub.
- `docs/research/_archive/superseded_root_docs_2026-06-26/` - older root versions.

The typo `DSCR Forumals.md` was corrected during move to:

- `docs/research/deep-dives/DSCR_Formulas.md`

## Archived Root Drafts

These are not working-canonical, but are preserved:

- `DSCR SOVEREIGN OPERATING SYSTEM_ THE MASTER BLUEPRINT.md`
- `DSCR SOVEREIGN OS_ THE DEFINITIVE PRODUCT SPECIFICATION.md`
- `DSCR_Underwriting_Engine_v14_Complete_Master_Document.md`
- `dscr_sovereign_os_upgrade_intelligence_report.md`
- `dscr_sovereign_os_upgrade_intelligence_report (1).md`

Reason: newer or more complete versions exist, but research provenance should not be destroyed until indexes and citations are fully reconciled.

## Data Decisions

Keep:

- `data/raw/` as immutable source data.
- `data/processed/` as derived working data.
- `data/processed/dscr_engine.db` as the SQLite testbed.

Moved:

- `00_engine/data/dscr_engine.db` -> `data/processed/dscr_engine.db`

Updated local script references from the old DB path to the new path.

Verified:

- `data/processed/dscr_engine.db` exists.
- SQLite opens successfully.
- Database contains 16 tables.

Do not delete yet:

- Duplicate-looking raw/processed data files. Many are exact byte duplicates, but the safe rule is to keep raw data immutable and only prune processed copies after rebuild scripts are validated.

## Generated Clutter Removed

Removed generated/reproducible files:

- `DSCR_SOVEREIGN_OS/packages/dscr-core/.venv/`
- `DSCR_SOVEREIGN_OS/packages/dscr-stress/.venv/`
- `DSCR_SOVEREIGN_OS/packages/dscr-core/.coverage`
- `DSCR_SOVEREIGN_OS/packages/dscr-stress/.coverage`
- `DSCR_SOVEREIGN_OS/packages/dscr-stress/.coverage_mc`
- `greenstreet_frontend/dist/`
- `greenstreet_frontend/.dev-server.log`
- `greenstreet_frontend/build-output.log`
- `greenstreet_frontend/dataconnect-debug.log`
- `greenstreet_frontend/lint_output.txt`
- `greenstreet_frontend/tscheck.log`

Not removed:

- `greenstreet_frontend/node_modules/` because it is normal active app dependency state. It can be removed later if disk/file count reduction is more important than immediate app runnability.

## Important Findings

- `greenstreet_frontend/.git/` exists but is empty. Git does not recognize it as a repository. Do not assume the frontend has valid local Git history.
- `DSCR_SOVEREIGN_OS/` is now small after virtual environments were removed. Keep it as read-only reference code per project instructions.
- `graphify-out/` has many generated converted Markdown duplicates. Keep for now if it is the current knowledge graph output; otherwise it is a later archive/delete candidate.
- `RESEARCH/`, `ANALYSIS/`, and `01_research_notes/` still need a second-pass reconciliation. Do not delete `01_research_notes/` as duplicates because vault copies may include metadata.

## Next Recommended Cleanup Pass

1. Rebuild or update indexes that point to moved root research docs.
2. Reconcile `RESEARCH/`, `ANALYSIS/`, `01_research_notes/`, `agent_outputs/`, and `output/` into `docs/research/` or `docs/agent-outputs/`.
3. Decide whether to remove `greenstreet_frontend/node_modules/`.
4. Decide whether the empty `greenstreet_frontend/.git/` should be deleted or reinitialized.
5. Validate scripts that rebuild `data/processed/`; then prune exact duplicate processed data copies.
6. Decide whether `graphify-out/` is live output or can be archived.

