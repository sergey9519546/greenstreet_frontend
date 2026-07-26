# Outdated Research Removal Final Report - 2026-06-28

## Result

The active outdated-removal review queue is exhausted.

- Final annotated ledger: `00_MOCs/outdated_research_remaining_after_pass19_2026-06-28.csv`
- Final active `REMAINING` rows: 0
- Archive manifest: `00_MOCs/archive_manifest_2026-06-28.csv`
- Archive manifest rows: 167
- Delete manifest: `00_MOCs/delete_manifest_2026-06-28.csv`
- Delete manifest rows: 0
- Decision log: `CLEANUP_DECISION_LOG_2026-06-28.md`

## Physical Archive Actions

Files were archived, not hard-deleted.

Major archive groups:

- Generated exact duplicates and Graphify stale outputs
- Superseded formula documents
- Stale generated/download/output artifacts
- Raw PDF extraction layer with enriched extraction counterparts
- Raw `RESEARCH/domain_*` originals with enriched `RESEARCH/domains/*` counterparts
- App-side research mirrors with root `docs/research` counterparts
- Root `01_research_notes` files with curated `docs/research` counterparts
- Explicitly retired/superseded extraction artifacts

Primary archive roots:

- `99_attachments/generated_archive_2026-06-28/`
- `99_attachments/research_archive_2026-06-28/`
- `01_research_notes/_archive/superseded_by_docs_research_2026-06-28/`
- `greenstreet_frontend/docs/dscr_loan_office/_archive/`

## Reviewed Keeps / No-Move Decisions

Kept or deferred:

- Canonical specs and correction-bearing docs
- Curated `docs/research` analysis, specs, deep dives, sprint docs, and operational/audit docs
- Enriched extraction notes retained after raw extraction duplicates were archived
- Sprint access paths and historical sprint provenance
- Raw/source data and source PDFs
- Audit inventories, manifests, keep/delete/archive ledgers, and cleanup provenance
- `00_engine/research/DSCR-Research` package rows pending package/master-spec comparison
- Demo website public HTML pending site/runtime review
- App QA/spec docs that are product provenance rather than research mirrors

## User Action Noted

The user manually deleted:

- `99_engine_egnine/download/ULTRAPLAN.md`

That deletion is recorded in the cleanup decision log as a user action and was not added to the archive manifest.

## Verification

Archive verification was run after pass 19:

- Archive execution logs checked: 11
- Archive execution rows checked: 117
- Problems found: 0

Checks performed:

- Archived source paths are absent.
- Archive destinations exist.
- SHA-256 or SHA-1 hashes match execution logs where recorded.

## Remaining Caution

The cleanup work intentionally preserved provenance. A file being kept does not mean every claim inside it is current; it means it is retained as canonical, audit, source, historical, or package provenance, with corrected/current claims governed by:

- `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md`
- `docs/research/specs/DSCR_Underwriting_Engine_Master_Consolidated_v16.md`
- `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md`
- `00_MOCs/correction_overlay_2026-06-28.md`
