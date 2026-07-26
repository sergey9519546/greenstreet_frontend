# Format Quarantine Review - 2026-06-28

Review table:

- `00_MOCs/format_quarantine_no_move_review_2026-06-28.csv`

## Decision

Closed 2 `REVERIFY_OR_QUARANTINE_FORMAT` rows with no physical move.

Files reviewed:

- `data/processed/national/treasury_fio/FIO_Homeowners_Insurance_Report_2018-2022.pdf`
- `data/raw/DSCR_Datasets/treasury_fio/FIO_Homeowners_Insurance_Report_2018-2022.pdf`

Classification:

- `NO_MOVE_KEEP_RAW_PROCESSED_DATA_PROVENANCE`

Reason:

- The two PDFs are byte-identical raw/processed source-data copies.
- The issue was a parser/file-format flag, not evidence that the underlying research claim is obsolete.
- Raw and processed provenance should remain intact.
