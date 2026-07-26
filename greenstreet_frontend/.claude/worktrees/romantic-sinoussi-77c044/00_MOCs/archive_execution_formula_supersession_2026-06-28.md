# Formula Supersession Archive Execution - 2026-06-28

Scope: direct formula documents containing the rejected golden vector.

## Result

- Archived/moved stale root note: `01_research_notes/DSCR Forumals.md`
- Preserved stale old deep-dive content from exact app mirror: `docs/research/_archive/superseded_formula_docs_2026-06-28/docs_research_deep-dives__DSCR_Formulas.md`
- Archived/moved stale app mirror: `greenstreet_frontend/docs/dscr_loan_office/DSCR Forumals.md`
- Wrote corrected canonical replacement: `docs/research/deep-dives/DSCR_Formulas.md`
- Wrote corrected app-doc mirror: `greenstreet_frontend/docs/dscr_loan_office/DSCR_Formulas.md`

## Supersession Reason

The archived documents used the rejected golden vector:

- P&I: `$1,999`
- PITIA: about `$2,580`
- Track 1 DSCR: `1.16`

The canonical replacement from `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md` is:

- P&I: `$2,120.6517`
- PITIA: `$2,853.9850`
- Track 1 DSCR: `1.0512`

## Evidence

Execution CSV:

- `00_MOCs/archive_execution_formula_supersession_2026-06-28.csv`

Master archive manifest appended:

- `00_MOCs/archive_manifest_2026-06-28.csv`

Note: the old `docs/research/deep-dives/DSCR_Formulas.md` content was replaced before its direct archive move. The stale app mirror had the same observed SHA-256 as that old deep-dive copy, so that exact mirror was copied into the research archive and labeled `ARCHIVE_SUPERSEDED_FORMULA_DOC_RECONSTRUCTED_EXACT_MIRROR`.
