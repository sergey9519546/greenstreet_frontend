# Cleanup Decision Log - 2026-06-28

Scope: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`

## Pass Executed

Started the outdated-research removal ultraplan and executed only the first low-risk archive batch.

No source research, raw data, correction logs, legal/regulatory source files, or active app files were deleted.

## Phase 1 Control Files Created

- `00_MOCs/supersession_registry_2026-06-28.csv`
- `00_MOCs/correction_overlay_2026-06-28.md`
- `00_MOCs/outdated_research_candidates_2026-06-28.csv`
- `00_MOCs/outdated_research_first_batch_2026-06-28.csv`
- `00_MOCs/exact_duplicate_groups_2026-06-28.csv`
- `00_MOCs/normalized_name_groups_2026-06-28.csv`
- `00_MOCs/archive_manifest_2026-06-28.csv`
- `00_MOCs/delete_manifest_2026-06-28.csv`

## Low-Risk Archive Batch

Archived 50 generated duplicate files to:

`99_attachments/generated_archive_2026-06-28/`

The batch consisted of:

- 11 loose `agent_outputs/*.md` files that were exact duplicates of retained files in `99_attachments/DSCR_Borrower_Intelligence_V2/agent_outputs/`.
- 39 `graphify-out/converted/*.md` generated duplicate files that were exact duplicates of retained generated graph/export files.

Execution evidence:

- `00_MOCs/archive_execution_low_risk_generated_2026-06-28.csv`
- `00_MOCs/archive_execution_low_risk_generated_2026-06-28.md`
- `00_MOCs/archive_manifest_2026-06-28.csv`

Verification result:

- Selected: 50
- Moved: 50
- Skipped: 0
- SHA-1 verification: passed
- Old-location absence check: passed
- Retained replacement check: passed

## Deliberately Not Moved

- `greenstreet_frontend/docs/dscr_loan_office/*` exact mirrors were not moved in this pass because `greenstreet_frontend` is the active product boundary.
- `RESEARCH/sprint_short/*` and `RESEARCH/_archive/sprint_clean/*` mirrors were not moved because prior audit notes said the sprint variants may serve different access patterns.
- Any FinCEN/legal/time-sensitive rows were left as `REVERIFY`.
- Any content-superseded research rows were left as `ARCHIVE_SUPERSEDED_REVIEW` pending human review.

## Next Recommended Batch

1. Reverify FinCEN RRE/BOI rows against current primary sources.
2. Review `DSCR_Formulas.md` and formula-vector rows against the final canonical spec.
3. Decide whether active app doc mirrors should stay, be replaced with pointers, or be archived outside the app.
4. Only after review, archive superseded research drafts with manifest entries.

## Formula Supersession Batch

Executed the formula-vector review against `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md`.

Archived or preserved the superseded formula docs that contained the rejected `$1,999` P&I / about `$2,580` PITIA / `1.16` DSCR golden vector:

- `01_research_notes/DSCR Forumals.md` -> `docs/research/_archive/superseded_formula_docs_2026-06-28/01_research_notes__DSCR Forumals.md`
- old `docs/research/deep-dives/DSCR_Formulas.md` content -> `docs/research/_archive/superseded_formula_docs_2026-06-28/docs_research_deep-dives__DSCR_Formulas.md`
- `greenstreet_frontend/docs/dscr_loan_office/DSCR Forumals.md` -> `greenstreet_frontend/docs/dscr_loan_office/_archive/superseded_formula_docs_2026-06-28/DSCR Forumals.md`

Replacements written:

- `docs/research/deep-dives/DSCR_Formulas.md`
- `greenstreet_frontend/docs/dscr_loan_office/DSCR_Formulas.md`

Current canonical vector in replacements:

- P&I: `$2,120.6517`
- PITIA: `$2,853.9850`
- Track 1 DSCR: `1.0512`

Execution evidence:

- `00_MOCs/archive_execution_formula_supersession_2026-06-28.csv`
- `00_MOCs/archive_execution_formula_supersession_2026-06-28.md`
- `00_MOCs/archive_manifest_2026-06-28.csv`

The old deep-dive content was reconstructed from the exact app mirror because the replacement was written before the archive move completed; this is explicitly labeled in the execution CSV.

## Exact Mirror Archive Batch

Executed a byte-identical mirror archive batch from the first-batch `ARCHIVE_MIRROR` queue.

Archived:

- 43 exact app-doc mirrors from `greenstreet_frontend/docs/dscr_loan_office/` to `greenstreet_frontend/docs/dscr_loan_office/_archive/duplicate_mirrors_2026-06-28/`
- 2 exact `RESEARCH/pdf_short/` mirrors to `RESEARCH/_archive/pdf_short_duplicate_mirrors_2026-06-28/`

Skipped:

- `greenstreet_frontend/docs/dscr_loan_office/DSCR Forumals.md` because it was already handled in the formula supersession batch.
- `RESEARCH/sprint_short/*` and `RESEARCH/_archive/sprint_clean/*` because prior audit notes said sprint variants may serve different access patterns.

Execution evidence:

- `00_MOCs/archive_execution_mirror_duplicates_2026-06-28.csv`
- `00_MOCs/archive_execution_mirror_duplicates_2026-06-28.md`
- `00_MOCs/archive_manifest_2026-06-28.csv`

Verification rule: each moved mirror had to match the listed replacement by SHA-256 immediately before the move, and the archived file had to match the original hash after the move.

## Already-Superseded No-Move Review

Reviewed 35 remaining `ARCHIVE_ALREADY_SUPERSEDED` rows.

Decision:

- 30 rows were already in archive boundaries (`docs/research/_archive/` or `00_MOCs/_archive/`).
- 5 rows were source-archive/provenance false positives, mainly numeric matches inside archived source data.

No physical move was performed for this group.

Evidence:

- `00_MOCs/already_superseded_no_move_review_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass3_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass3_summary_2026-06-28.md`

Remaining active review queue after pass 3: 578 rows.

## Reverify Batch: FinCEN + Deephaven

Closed 52 `REVERIFY` rows without moving files.

Decisions:

- 25 FinCEN BOI rows: domestic U.S. companies and their beneficial owners are exempt from BOI reporting under current FinCEN BOI guidance.
- 22 FinCEN RRE rows: the Residential Real Estate Rule was vacated by court order on 2026-03-19 and should not be treated as an active reporting obligation while the order remains in force.
- 5 Deephaven rows: do not encode Deephaven as `DSCR = 0`; use the current-source correction and require live matrix/direct confirmation before production.

Evidence:

- `00_MOCs/reverify_batch_fincen_deephaven_2026-06-28.csv`
- `00_MOCs/reverify_batch_fincen_deephaven_2026-06-28.md`
- `00_MOCs/fincen_reverification_2026-06-28.md`
- `00_MOCs/outdated_research_remaining_after_pass4_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass4_summary_2026-06-28.md`

Remaining active review queue after pass 4: 526 rows.

## P0 Review Batch

User confirmed `99_engine_egnine/download/ULTRAPLAN.md` was manually deleted because it was old and superseded. It is not part of the archive manifest.

Reviewed all 54 remaining P0 rows.

Physical archive:

- Archived 5 unique stale generated Graphify files to `99_attachments/generated_archive_2026-06-28/graphify-out/stale_p0_2026-06-28/`.
- This closed 6 P0 rows because one generated file appeared in two P0 rows.

No-move decisions:

- Kept canonical authority files.
- Kept correction/provenance files.
- Kept audit indexes and inventory files.
- Kept raw/source data false positives.
- Kept analysis/package files that document correction context.

Evidence:

- `00_MOCs/p0_review_decisions_2026-06-28.csv`
- `00_MOCs/archive_execution_stale_graphify_p0_2026-06-28.csv`
- `00_MOCs/archive_execution_stale_graphify_p0_2026-06-28.md`
- `00_MOCs/outdated_research_remaining_after_pass5_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass5_summary_2026-06-28.md`

Remaining active review queue after pass 5: 472 rows. No active P0 rows remain.

## P1 Generated/Download Artifact Batch

Archived 10 unique P1 generated/download/output artifacts to:

`99_attachments/generated_archive_2026-06-28/p1_generated_stale_2026-06-28/`

Rows closed:

- 15 rows physically archived.
- 4 rows already handled by the P0 Graphify archive.
- 2 worklog rows kept as provenance.

Evidence:

- `00_MOCs/archive_execution_p1_generated_stale_2026-06-28.csv`
- `00_MOCs/archive_execution_p1_generated_stale_2026-06-28.md`
- `00_MOCs/p1_generated_review_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass6_2026-06-28.csv`

Remaining active review queue after pass 6: 451 rows.

## P1 No-Move Review

Closed 113 P1 rows by no-move classification:

- package rows pending package/master-spec comparison
- provenance and correction-context rows
- canonical authority rows
- analysis provenance rows
- audit/index/inventory rows
- attachment provenance rows
- audit/script provenance rows

Evidence:

- `00_MOCs/p1_no_move_review_decisions_2026-06-28.csv`
- `00_MOCs/p1_no_move_review_decisions_2026-06-28.md`
- `00_MOCs/outdated_research_remaining_after_pass7_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass7_summary_2026-06-28.md`

Remaining active review queue after pass 7: 338 rows.

## Pass 8 Mirror No-Move Review

Closed 8 remaining mirror rows with no physical move.

Decision:

- Kept sprint shorthand and sprint clean variants as access paths.
- Did not archive by filename similarity.

Evidence:

- `00_MOCs/remaining_mirror_no_move_review_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass8_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass8_summary_2026-06-28.md`

Remaining active review queue after pass 8: 330 rows.

## Pass 9 Format Quarantine Review

Closed 2 format-quarantine rows with no physical move.

Decision:

- Kept byte-identical raw/processed Treasury FIO source PDFs.
- Treated the flag as parser/file-format review context, not obsolete research.
- Preserved raw and processed data provenance.

Evidence:

- `00_MOCs/format_quarantine_no_move_review_2026-06-28.csv`
- `00_MOCs/format_quarantine_no_move_review_2026-06-28.md`
- `00_MOCs/outdated_research_remaining_after_pass9_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass9_summary_2026-06-28.md`

Remaining active review queue after pass 9: 328 rows.

## Pass 10 Canonical/Provenance No-Move Review

Closed 75 active `KEEP_CANONICAL` and `KEEP_PROVENANCE` rows with no physical move.

Decision:

- Kept canonical authority docs.
- Kept raw and processed data provenance.
- Kept audit manifests, keep lists, and external-check scripts.
- Kept research-note, curated research, app-doc, and output provenance rows that are not safe archive candidates by row-level topic flags alone.

Evidence:

- `00_MOCs/p2_keep_no_move_review_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass10_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass10_summary_2026-06-28.md`

Remaining active review queue after pass 10: 253 rows. All remaining active rows are `ARCHIVE_SUPERSEDED_REVIEW`.

## Pass 11 Already-Archived Stale Row Review

Closed 6 active rows whose source paths were already absent and whose archive evidence exists in prior archive manifests/execution logs.

Decision:

- Marked these rows as `ALREADY_ARCHIVED_PREVIOUS_PASS`.
- No additional files were moved.

Evidence:

- `00_MOCs/already_archived_active_rows_pass11_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass11_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass11_summary_2026-06-28.md`

Remaining active review queue after pass 11: 247 rows.

## Pass 12 Provenance/Package No-Move Review

Closed 25 audit/package/attachment/provenance rows with no physical move.

Decision:

- Kept cleanup inventories and disposition ledgers as audit provenance.
- Kept `00_engine/research/DSCR-Research` package rows pending package/master-spec comparison.
- Kept source PDFs under `99_attachments` as attachment provenance for extracted research.
- Kept analysis extracts and autoresearch process files as provenance.

Evidence:

- `00_MOCs/pass12_provenance_package_no_move_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass12_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass12_summary_2026-06-28.md`

Remaining active review queue after pass 12: 222 rows.

## Pass 13 Generated Straggler Review

Closed 4 generated/output straggler rows.

Physical archive:

- Archived 2 unique stale generated artifacts to `99_attachments/generated_archive_2026-06-28/p13_generated_stale_2026-06-28/`.

No-move decision:

- Kept `output/DSCR_Slice2_P03_RVine_Copula_Ship_Memo_20260620.md` as correction/proof provenance because it documents the R-Vine replacement for the Gaussian copula.

Evidence:

- `00_MOCs/archive_execution_p13_generated_stale_2026-06-28.csv`
- `00_MOCs/pass13_generated_straggler_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass13_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass13_summary_2026-06-28.md`

Remaining active review queue after pass 13: 218 rows.

## Pass 14 Sprint No-Move Review

Closed 26 sprint-family rows with no physical move.

Decision:

- Kept `RESEARCH/sprints`, `RESEARCH/sprint_short`, and `RESEARCH/_archive/sprint_clean` rows as historical sprint/access-path provenance.
- Did not archive sprint access paths piecemeal just because they mention corrected topics.
- Current claims remain governed by canonical specs and correction logs.

Evidence:

- `00_MOCs/pass14_sprint_no_move_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass14_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass14_summary_2026-06-28.md`

Remaining active review queue after pass 14: 192 rows.

## Pass 15 Extraction Archive Review

Closed 14 extraction rows.

Physical archive:

- Archived 11 raw `RESEARCH/pdf_extractions` files because enriched `RESEARCH/extractions` counterparts exist.
- Archived `RESEARCH/extractions/Thread_D_Master_Plan_v11_Outline.md` because it is explicitly retired/superseded and `RESEARCH/extractions/Master_Plan_v11_2026Q2.md` exists.

Evidence:

- `00_MOCs/archive_execution_p15_extraction_stale_2026-06-28.csv`
- `00_MOCs/pass15_extraction_stale_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass15_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass15_summary_2026-06-28.md`

Remaining active review queue after pass 15: 178 rows.

## Pass 16 Domain Review

Closed 16 domain rows.

Physical archive:

- Archived 8 raw `RESEARCH/domain_*` originals because enriched `RESEARCH/domains/domain_*` counterparts exist.

No-move decision:

- Kept enriched `RESEARCH/domains/*` files as retained domain research/provenance.

Evidence:

- `00_MOCs/archive_execution_p16_raw_domain_superseded_2026-06-28.csv`
- `00_MOCs/pass16_domain_review_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass16_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass16_summary_2026-06-28.md`

Remaining active review queue after pass 16: 162 rows.

## Pass 17 App/Demo Review

Closed 20 app/demo rows.

Physical archive:

- Archived 5 app-side `greenstreet_frontend/docs/dscr_loan_office` research mirrors because root `docs/research` counterparts exist.

No-move/defer decision:

- Kept app QA/spec docs as product provenance.
- Deferred `dscr-demo_website/public` HTML because it may be runtime/public content and needs site review before movement.

Evidence:

- `00_MOCs/archive_execution_p17_app_doc_mirrors_2026-06-28.csv`
- `00_MOCs/pass17_app_demo_review_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass17_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass17_summary_2026-06-28.md`

Remaining active review queue after pass 17: 142 rows.

## Pass 18 Root Notes Review

Closed 56 `01_research_notes` rows.

Physical archive:

- Archived 25 root research-note files because curated `docs/research` counterparts exist.

No-move decision:

- Kept root sprint notes without curated counterparts as historical sprint provenance.

Evidence:

- `00_MOCs/archive_execution_p18_root_notes_superseded_2026-06-28.csv`
- `00_MOCs/pass18_root_notes_review_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass18_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass18_summary_2026-06-28.md`

Remaining active review queue after pass 18: 86 rows.

## Pass 19 Final Curated Review

Closed the final 86 curated/research rows.

Physical archive:

- Archived `RESEARCH/extractions/Build_vs_Buy_API_Dataset_Replacements_2026Q2.md` because v2 exists.
- Archived `RESEARCH/extractions/Beyond_Rulebook_1.txt` because the full-title extraction remains.

No-move decision:

- Kept curated specs, analysis docs, deep dives, sprint docs, enriched extractions, godmode validation fragments, ads-targeting research, ML architecture notes, deep-research branch docs, and operational/audit docs as retained provenance/current research.

Evidence:

- `00_MOCs/archive_execution_p19_superseded_extraction_aliases_2026-06-28.csv`
- `00_MOCs/pass19_final_curated_review_decisions_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass19_2026-06-28.csv`
- `00_MOCs/outdated_research_remaining_after_pass19_summary_2026-06-28.md`

Remaining active review queue after pass 19: 0 rows. The active outdated-removal review queue is exhausted.
