# Remaining Queue After Pass 5 - 2026-06-28

Annotated queue:

- `00_MOCs/outdated_research_remaining_after_pass5_2026-06-28.csv`

P0 review decisions:

- `00_MOCs/p0_review_decisions_2026-06-28.csv`

Generated Graphify archive evidence:

- `00_MOCs/archive_execution_stale_graphify_p0_2026-06-28.csv`
- `00_MOCs/archive_execution_stale_graphify_p0_2026-06-28.md`

## Additional Pass 5 Decision

Reviewed all 54 remaining P0 rows.

Result:

- 6 P0 rows closed by archiving 5 unique stale generated Graphify artifacts.
- 8 P0 rows kept as canonical authority.
- 17 P0 rows kept as provenance or correction context.
- 14 P0 rows kept as audit indexes or inventory files.
- 7 P0 rows kept as analysis/package provenance.
- 2 P0 rows kept as reviewed provenance/raw-data false positives.

No active P0 rows remain.

## Remaining Rows

Rows still marked `REMAINING`: 472.

By recommended action:

- `ARCHIVE_SUPERSEDED_REVIEW`: 339
- `KEEP_PROVENANCE`: 98
- `KEEP_CANONICAL`: 25
- `ARCHIVE_MIRROR`: 8
- `REVERIFY_OR_QUARANTINE_FORMAT`: 2

By priority:

- `P1`: 264
- `P2`: 208

## Next Best Work

Continue with P1 rows. The safest next bucket is likely `ARCHIVE_SUPERSEDED_REVIEW` after filtering out:

- indexes and inventories
- raw/source data
- correction logs
- canonical specs
- package READMEs and audit trails
