# Remaining Queue After Pass 3 - 2026-06-28

Annotated queue:

- `00_MOCs/outdated_research_remaining_after_pass3_2026-06-28.csv`

No-move review:

- `00_MOCs/already_superseded_no_move_review_2026-06-28.csv`

## Additional Pass 3 Decision

Reviewed the 35 `ARCHIVE_ALREADY_SUPERSEDED` rows.

- 30 rows are already in archive boundaries such as `docs/research/_archive/` or `00_MOCs/_archive/`.
- 5 rows are source-archive/provenance false positives, mainly numeric matches inside archived raw/source data.

Decision: no physical move. These are not active research files to remove. The correction overlay remains the active-use guard.

## Remaining Rows

Rows still marked `REMAINING`: 578.

By recommended action:

- `ARCHIVE_SUPERSEDED_REVIEW`: 367
- `KEEP_PROVENANCE`: 116
- `REVERIFY`: 52
- `KEEP_CANONICAL`: 33
- `ARCHIVE_MIRROR`: 8
- `REVERIFY_OR_QUARANTINE_FORMAT`: 2

By priority:

- `P0`: 101
- `P1`: 269
- `P2`: 208

## Next Best Work

1. Handle `REVERIFY` rows with current primary-source checks.
2. Convert obvious index/inventory false positives from `ARCHIVE_SUPERSEDED_REVIEW` to `KEEP_PROVENANCE`.
3. Review remaining content-superseded research drafts one topic at a time before moving.
