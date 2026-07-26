# Document Delete/Save Certainty Protocol - 2026-06-28

This is the operating rule for DSCR research cleanup after the reconciliation pass.

## Hard Rule

Do not delete research or strategy documents. Archive only after proof. If proof is incomplete, copy the file into review/quarantine and preserve it.

## Required Proof Before A File Can Be Treated As Superseded

1. Full content read
   - Open the entire file, not only its filename, headings, or first lines.
   - Record size, hash, headings, and major content blocks.

2. Replacement identified
   - Name the exact retained replacement file.
   - If there is no replacement, the file cannot be called superseded.

3. Content comparison
   - Check byte identity first.
   - If not identical, compare normalized blocks and headings against the replacement.
   - Produce a unique-content review file for every non-identical archived document.

4. Decision
   - `KEEP`: active source remains useful.
   - `MERGE_THEN_ARCHIVE`: unique content must be moved into a canonical file before archiving.
   - `ARCHIVE_ONLY`: file is stale/generated/rejected but must remain traceable.
   - `QUARANTINE_REVIEW`: uncertainty remains; preserve a review copy.
   - `DELETE_SAFE`: only allowed for exact duplicates or disposable generated artifacts already preserved elsewhere. This should be rare.

5. Ledger
   - Every action needs source path, destination path, replacement path, hash, reason, and operator/date.

## Current Verified Reconciliation Pack

- Safety report: `00_MOCs/archive_reconciliation_safety_report_2026-06-28.md`
- Rigorous decisions: `00_MOCs/rigorous_review_decisions_structured_2026-06-28.csv`
- Archive reconciliation: `00_MOCs/rigorous_vs_archive_reconciliation_2026-06-28.csv`
- Verified unique review pack: `00_MOCs/reconciliation_unique_review_verified_2026-06-28/`
- Flagged archive rows: `00_MOCs/reconciliation_unique_review_verified_2026-06-28/flagged_archives.csv`
- Restore/quarantine plan: `00_MOCs/reconciliation_unique_review_verified_2026-06-28/restore_plan.csv`

## Practical Meaning Of "100% Knowing What's Inside"

For this workspace, "100%" means no save/delete/archive decision is made from the filename or apparent duplication. The file must either be exact-hash duplicated, text-contained in a retained replacement, or represented by a unique-content review file that shows what would be lost.

If any unique substantive content remains unresolved, the file is preserved in quarantine/review instead of deleted.
