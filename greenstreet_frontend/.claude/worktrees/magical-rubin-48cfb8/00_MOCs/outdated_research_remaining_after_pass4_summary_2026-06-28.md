# Remaining Queue After Pass 4 - 2026-06-28

Annotated queue:

- `00_MOCs/outdated_research_remaining_after_pass4_2026-06-28.csv`

Reverify evidence:

- `00_MOCs/reverify_batch_fincen_deephaven_2026-06-28.csv`
- `00_MOCs/reverify_batch_fincen_deephaven_2026-06-28.md`
- `00_MOCs/fincen_reverification_2026-06-28.md`

## Additional Pass 4 Decision

Closed the `REVERIFY` action for 52 rows:

- 25 FinCEN BOI rows: domestic U.S. companies exempt under current FinCEN BOI guidance.
- 22 FinCEN RRE rows: RRE Rule vacated by court order; not active while order remains in force.
- 5 Deephaven rows: do not encode Deephaven as `DSCR = 0`; use current-source correction and require live matrix/direct confirmation before production.

No files were moved by this pass.

## Remaining Rows

Rows still marked `REMAINING`: 526.

By recommended action:

- `ARCHIVE_SUPERSEDED_REVIEW`: 367
- `KEEP_PROVENANCE`: 116
- `KEEP_CANONICAL`: 33
- `ARCHIVE_MIRROR`: 8
- `REVERIFY_OR_QUARANTINE_FORMAT`: 2

By priority:

- `P0`: 54
- `P1`: 264
- `P2`: 208

## Next Best Work

1. Triage the 54 remaining P0 rows into active stale docs versus indexes/provenance logs.
2. Leave `KEEP_CANONICAL` and `KEEP_PROVENANCE` rows in place unless they are misclassified.
3. Only move `ARCHIVE_SUPERSEDED_REVIEW` rows after confirming each file is not a canonical source, correction log, raw source, or active app dependency.
