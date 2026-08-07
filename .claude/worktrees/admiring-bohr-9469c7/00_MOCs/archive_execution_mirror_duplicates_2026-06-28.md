# Exact Mirror Archive Execution - 2026-06-28

Scope: first-batch `ARCHIVE_MIRROR` rows with byte-identical replacements.

## Result

- Archived 43 exact app-doc mirrors from `greenstreet_frontend/docs/dscr_loan_office/`.
- Archived 2 exact `RESEARCH/pdf_short/` mirrors.
- Skipped sprint shorthand files because prior cleanup notes treated sprint variants as separate access patterns.
- Skipped `greenstreet_frontend/docs/dscr_loan_office/DSCR Forumals.md` because it was already handled in the formula supersession batch.

## Archive Locations

- `greenstreet_frontend/docs/dscr_loan_office/_archive/duplicate_mirrors_2026-06-28/`
- `RESEARCH/_archive/pdf_short_duplicate_mirrors_2026-06-28/`

## Evidence

Execution CSV:

- `00_MOCs/archive_execution_mirror_duplicates_2026-06-28.csv`

Master archive manifest appended:

- `00_MOCs/archive_manifest_2026-06-28.csv`

Every moved file was rechecked immediately before move:

- source path existed
- replacement path existed
- source SHA-256 matched replacement SHA-256
- archived file SHA-256 matched source SHA-256 after move
