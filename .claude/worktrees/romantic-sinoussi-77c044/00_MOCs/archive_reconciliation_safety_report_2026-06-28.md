# Archive Reconciliation Safety Report - 2026-06-28

Purpose: verify archived research/document files against the rigorous review standard before any delete/save decision is treated as final.

## Current rule

No document is delete-safe unless one of these is true:

1. The archived file is byte-identical to a retained replacement.
2. The archived file is text-contained in a retained replacement and has no substantive unique blocks.
3. The unique content has been extracted into a canonical retained file and that extraction is logged.
4. The file is intentionally rejected or retired, but preserved in quarantine/archive with a reason.

Uncertainty means preserve and review, not delete.

## Coverage check results

- BORDERLINE_REVIEW: 25
- HIGH_RISK_RESTORE_OR_EXTRACT: 28
- LIKELY_SAFE_CONTAINED: 18
- NO_REPLACEMENT_PATH_REVIEW: 1
- SAFE_EXACT_HASH: 94

## Archive manifest safety status

- NO_TEXT_COVERAGE_ROW: 1
- NOT_PROVEN_SAFE_REVIEW_REQUIRED: 54
- PROVEN_SAFE_BY_TEXT_CHECK: 112

## Flagged review classifications

- EXPLICITLY_RETIRED_RETAIN_QUARANTINE: 1
- GENERATED_ARTIFACT_RETAIN_ARCHIVE: 16
- LIKELY_METADATA_OR_MINOR_DIFF_REVIEW: 14
- REJECTED_FORMULA_RETAIN_QUARANTINE: 3
- RESTORE_COPY_FOR_REVIEW_NO_REPLACEMENT: 1
- RESTORE_COPY_FOR_REVIEW_SUBSTANTIVE_UNIQUE: 4
- REVIEW_BEFORE_ANY_DELETE: 2
- ROOT_NOTE_UNIQUE_CONTENT_REVIEW: 13

## Artifacts created

- Structured rigorous log decisions: 00_MOCs/rigorous_review_decisions_structured_2026-06-28.csv
- Archive/log reconciliation: 00_MOCs/rigorous_vs_archive_reconciliation_2026-06-28.csv
- Flagged archive list: 00_MOCs/reconciliation_unique_review_2026-06-28/flagged_archives.csv
- Restore/quarantine plan: 00_MOCs/reconciliation_unique_review_2026-06-28/restore_plan.csv
- Per-file unique block reviews: 00_MOCs/reconciliation_unique_review_2026-06-28/unique_blocks/
- Review copies of uncertain files: 00_MOCs/reconciliation_unique_review_2026-06-28/restored_for_review/
- Verified row-keyed review pack: 00_MOCs/reconciliation_unique_review_verified_2026-06-28/
- Verified flagged archive list: 00_MOCs/reconciliation_unique_review_verified_2026-06-28/flagged_archives.csv
- Verified restore/quarantine plan: 00_MOCs/reconciliation_unique_review_verified_2026-06-28/restore_plan.csv
- Delete/save certainty protocol: 00_MOCs/DOCUMENT_DELETE_SAVE_CERTAINTY_PROTOCOL_2026-06-28.md

## Important correction to prior cleanup language

The previous pass exhausted the generated outdated-removal ledger, but it did not complete the rigorous review log. The rigorous log remains the stricter authority for research documents. Its reviewed research batches repeatedly say DELETE: none, and many files are KEEP, KEEP/MERGE, MERGE THEN ARCHIVE, or NEEDS HUMAN REVIEW rather than delete-safe.

## Next decision gate

Before moving any flagged file out of quarantine, read its unique review file and either merge the unique content into a canonical document or mark the quarantine/archive reason explicitly. Do not hard-delete these files.
