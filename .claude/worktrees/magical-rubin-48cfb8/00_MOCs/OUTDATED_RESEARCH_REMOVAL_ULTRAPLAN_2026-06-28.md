# Outdated Research Removal Ultraplan - 2026-06-28

Scope: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`

Purpose: identify old, incorrect, duplicate, generated, or superseded research files and decide whether to keep, archive, quarantine, or remove them. This is not a blind deletion plan. The default action for research is archive with provenance, not delete.

## 0. Operating Rule

No research file gets deleted merely because a newer file exists. A file is removable only when one of these is true:

1. It is generated/rebuildable output and the source or build process is retained.
2. It is an exact duplicate and one canonical copy is retained.
3. It is an older research draft whose factual claims are explicitly superseded by a newer canonical document, and the older draft is moved to a dated archive with a manifest.
4. It is invalid/junk output, temporary scratch, stale logs, old raw JSON, `.md1`, failed exports, or build artifacts with no unique research value.

Raw datasets, primary-source PDFs, correction logs, audit logs, verification reports, and unique research are not deletion candidates. They may be archived, but not destroyed.

## 1. Authority Hierarchy

Use this source hierarchy when deciding whether a file is outdated:

1. Current live primary sources, when the topic is law, lender terms, rates, market data, or vendor pricing.
2. `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md`
3. `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md`
4. `docs/research/specs/DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md`
5. `docs/research/operational/UNIFIED_HUB.md`
6. `docs/research/sprints/Build_Phase1_Deterministic_Core_Plan.md`
7. `00_engine/research/DSCR-Research/BUILDABLE_MASTER_SPECIFICATION.md`
8. Older drafts, vault mirrors, generated graph exports, ad hoc extracts, and attachment copies.

If a lower-priority file conflicts with a higher-priority file, it is a supersession candidate. If a live primary source conflicts with the local corpus, the local corpus gets a correction issue before any deletion.

## 2. Known Correction Seeds

Seed the supersession registry with these known corrections:

| Topic | Old / bad claim | Canonical / corrected claim | Canonical source | Action |
|---|---|---|---|---|
| PA Act 6 / LIPL threshold | `$319,777` used as 2026 threshold | `$329,411` for 2026 | `DSCR_Sovereign_OS_Final_Canonical_Specification.md` lines 21-48 | Flag old files containing `$319,777` as stale unless they clearly label it as 2025 |
| Golden vector | `DSCR Forumals.md` P&I `$1,999`, PITIA `$2,732.33`, T1 DSCR `1.16` | P&I `$2,120.6517`, PITIA `$2,853.9850`, T1 DSCR `1.0512` | `DSCR_Sovereign_OS_Final_Canonical_Specification.md` lines 52-80 | Mark formula file rejected; archive any duplicate relying on old vector |
| Model risk | SR 11-7 as governing standard | SR 26-02 effective April 17, 2026; deterministic arithmetic excluded, stochastic/ML still model-governed | `DSCR_Sovereign_OS_Final_Canonical_Specification.md` lines 84-118 | Flag SR 11-7-only docs as stale |
| Deephaven no-DSCR | Deephaven minimum DSCR equals 0 | Effective floor `0.75 with reserves`; direct lender outreach still required | `DSCR_Sovereign_OS_Final_Canonical_Specification.md` lines 122-128 | Flag as unverified, not production canonical |
| IO DSCR | Missing interest-only formula | `DSCR_IO = Rent / ITIA`, with principal excluded during IO period | `DSCR_Sovereign_OS_Final_Canonical_Specification.md` lines 132-143 | Mark older specs incomplete |
| FinCEN BOI | LLC-vested DSCR purchases trigger BOI | Domestic LLCs exempt from CTA BOI under March 2025 interim final rule | corrections log and final spec | Flag older BOI claims as wrong |
| FinCEN RRE | RRE rule effective in 2026 as local corpus states | Needs live reverify before production because current FinCEN page says the rule was vacated by court order in March 2026 | live source check from 2026-06-28 final audit | Create correction issue; do not delete until updated overlay exists |
| RentCast API pricing | `$29/$99/$199/Custom` API tiers | 50 free API calls/month and volume-based API pricing; no public named dollar tiers | corrections log / blueprint v3 | Flag vendor-cost files using consumer tiers |
| Rocket Pro TPO | 680 FICO / $3M max | 660 FICO / $3.5M max per product page cited in corpus | corrections log / blueprint v3 | Flag old lender matrix rows |
| Angel Oak | 680/700 FICO standard from secondary pages | 640 minimum; 90% LTV at 740+ FICO per Angel Oak programs page cited in corpus | corrections log / blueprint v3 | Flag old matrix and marketing copy |
| Griffin Funding | 46 states + DC / $4M max | All 50 states + DC; up to $20M on some products, varies by state | corrections log / blueprint v3 | Flag old lender matrix rows |
| Gaussian copula | Production-acceptable correlated risk model | Rejected for correlated real estate tail risk; use t-copula/R-vine/challenger model approach | final spec / blueprint v3 | Mark older ML docs as superseded or research-only |
| Hardcoded tax / rates | Static bonus depreciation, rates, and thresholds | Date-driven, jurisdiction-aware, externalized config with staleness guards | v16 / final spec | Flag hardcoded docs as stale |

## 3. Required New Control Files

Create these before moving or deleting anything:

1. `00_MOCs/supersession_registry_2026-06-28.csv`
   - Columns: `topic`, `old_claim`, `corrected_claim`, `canonical_source`, `canonical_line`, `affected_terms`, `risk`, `reverify_required`, `decision_rule`.

2. `00_MOCs/outdated_research_candidates_2026-06-28.csv`
   - Columns: `candidate_file`, `reason`, `matched_topic`, `matched_old_claim`, `newer_source`, `confidence`, `recommended_action`, `notes`.

3. `00_MOCs/archive_manifest_2026-06-28.csv`
   - Columns: `source_path`, `destination_path`, `sha1_before`, `size_bytes`, `reason`, `superseded_by`, `moved_at`, `operator`.

4. `00_MOCs/delete_manifest_2026-06-28.csv`
   - Only generated/rebuildable junk goes here. No unique research.

5. `00_MOCs/correction_overlay_2026-06-28.md`
   - A human-readable list of corrections that future agents must apply before trusting older files.

## 4. Candidate Discovery Pass

Use the existing audit pack as the base inventory:

- `00_MOCs/product_strategy_audit_2026-06-28/file_inventory.csv`
- `00_MOCs/product_strategy_audit_2026-06-28/extracted_scored_items.csv`
- `00_MOCs/product_strategy_audit_2026-06-28/inventory_summary.md`

Then run four discovery passes.

### Pass A - Exact Duplicates

Group by hash. If files are byte-identical:

- Keep one canonical file in the highest-priority location.
- Mark mirrors with `mirror_of` in the candidate CSV.
- Delete only if the duplicate is generated output and no workflow relies on it.
- Otherwise move duplicate mirrors to `docs/research/_archive/duplicates_2026-06-28/`.

Priority locations:

1. `docs/research/specs/`
2. `docs/research/operational/`
3. `docs/research/deep-dives/`
4. `docs/research/analysis/`
5. `docs/research/sprints/`
6. `00_engine/research/DSCR-Research/`
7. `01_research_notes/`
8. `RESEARCH/`
9. `graphify-out/`
10. `output/`

### Pass B - Near Duplicates And Mirrors

Find same-title and normalized-name groups:

- `THE COMPLETE SOVEREIGN MASTER DOCUMENT`
- `dscr_sovereign_os_upgrade_intelligence_report`
- sprint reports
- `DSCR_Underwriting_Engine_Master_Consolidated_v16`
- `UNIFIED_HUB`
- `DSCR_Formulas` / `DSCR Forumals`
- PDF extraction copies in `pdf_short` vs `pdf_extractions`
- `graphify-out/converted/*`

Decision:

- If same content with metadata differences, keep both until metadata is merged.
- If one is a generated mirror, archive or remove the generated mirror after canonical pointer is recorded.
- If one is a previous version with corrected claims, archive as superseded.

### Pass C - Correction Conflict Scan

Search every candidate document for old/bad values from the registry:

- `$319,777`
- `DSCR Forumals`
- `$1,999`
- `$2,732.33`
- `1.16`
- `SR 11-7`
- `Deephaven` near `0` or `no DSCR`
- `FinCEN BOI`
- `RRE Rule`
- `RentCast` near `$29`, `$99`, `$199`
- `Rocket` near `680` or `$3M`
- `Angel Oak` near `680`, `700`, `85%`
- `Griffin` near `46 states`, `$4M`
- `Gaussian copula`
- `static tax`, `hardcoded`, `bonus depreciation phase-down`

Each hit gets one of four labels:

- `canonical_current`: file already contains the corrected claim.
- `historical_context`: old value is clearly labeled as old, rejected, or superseded.
- `superseded_archive`: file primarily promotes the old value and has a newer replacement.
- `needs_human_review`: context is ambiguous.

### Pass D - Generated/Rebuildable Output

Candidates:

- `graphify-out/converted/*`
- `graphify-out/wiki/*`
- `output/*` generated reports and dispatch dumps
- old `_raw_old_*.json`
- `.md1`
- stale build logs
- old coverage files
- temp package/scratch files

Decision:

- If source exists and generator is known, move to `99_attachments/generated_archive_2026-06-28/` or delete after manifest.
- If source/generator is not known, archive but do not delete.

## 5. Decision Matrix

| Classification | Meaning | Action |
|---|---|---|
| `KEEP_CANONICAL` | Current source of truth | Leave in place |
| `KEEP_PRIMARY_SOURCE` | Raw data, source PDF, legal/regulatory source, audit log | Leave in place |
| `KEEP_PROVENANCE` | Older file proves why a correction happened | Move only if archive improves organization |
| `ARCHIVE_SUPERSEDED` | Older draft corrected by newer canonical file | Move to dated archive with manifest |
| `ARCHIVE_MIRROR` | Duplicate/mirror still useful for traceability | Move or mark mirror |
| `REVERIFY` | Time-sensitive claim, lender term, law, rate, or vendor pricing | Do not delete; create reverify task |
| `DELETE_GENERATED` | Rebuildable generated junk | Delete only after dry run, hash, and manifest |
| `BLOCKED` | Ambiguous or potentially unique research | Leave untouched |

## 6. Archive Layout

Use these destinations:

- `docs/research/_archive/superseded_by_final_spec_2026-06-28/`
- `docs/research/_archive/duplicates_2026-06-28/`
- `docs/research/_archive/needs_reverify_2026-06-28/`
- `99_attachments/generated_archive_2026-06-28/`
- `99_attachments/delete_manifests/2026-06-28/`

Do not mix deleted/generated output with superseded research. Superseded research is still evidence.

## 7. First Batch To Review

Start with the highest-likelihood outdated groups:

1. `docs/research/_archive/superseded_root_docs_2026-06-26/*`
   - Already archived as older root versions. Confirm no active indexes still treat them as current.

2. `docs/research/deep-dives/DSCR_Formulas.md`
   - The final spec says the old `DSCR Forumals` vector is rejected. Confirm whether this moved file contains rejected values. If yes, mark `ARCHIVE_SUPERSEDED` or preserve as `KEEP_PROVENANCE` with a rejection banner.

3. Blueprint/version chain:
   - `docs/research/specs/DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md`
   - `docs/research/specs/DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md`
   - `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md`
   - Final spec is canonical. Older versions should be marked as superseded, not deleted.

4. Duplicate master docs:
   - `01_research_notes/THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`
   - `greenstreet_frontend/docs/dscr_loan_office/THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`
   - any `RESEARCH` or `graphify-out` mirrors
   - Choose one canonical or mark all non-canonical mirrors.

5. `graphify-out/`
   - Treat as generated output unless confirmed as the active knowledge graph.
   - Do not delete until source coverage and regeneration command are known.

6. `RESEARCH/extractions/*`
   - Likely extracted/generated copies of PDFs or reports.
   - Keep only if they are the only readable text form; otherwise archive mirrors.

7. `99_external_check/scripts/audit_final_*.md`
   - Keep as verification evidence unless superseded by a newer consolidated audit.

8. `01_research_notes/recheck_deep-research-report.md` and duplicate deep-research reports
   - Preserve if they contain correction reasoning. Archive if they only restate rejected claims.

## 8. Safe Execution Sequence

### Phase 1 - Build Registries

1. Generate `supersession_registry_2026-06-28.csv` from the known correction seeds.
2. Generate hash groups from `file_inventory.csv`.
3. Generate normalized-title groups.
4. Generate old-claim conflict hits.
5. Produce `outdated_research_candidates_2026-06-28.csv`.

Stop here and inspect the CSV before moving files.

### Phase 2 - Mark, Do Not Move

Add a small banner or frontmatter to files that are clearly superseded but still valuable:

```yaml
corpus_status: superseded
superseded_by: docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md
reason: "Contains rejected golden vector / older lender parameter / stale legal rule"
do_not_use_for: production calculations
```

For generated mirrors, prefer a one-line note:

```md
<!-- mirror_of: path/to/canonical-file.md; generated: true -->
```

### Phase 3 - Archive Superseded Research

Move only files classified `ARCHIVE_SUPERSEDED` or `ARCHIVE_MIRROR`.

Before each move:

- Record SHA-1.
- Record size.
- Record source and destination.
- Confirm destination is under the DSCR workspace.
- Preserve relative folder structure where possible.

Do not use recursive delete in this phase.

### Phase 4 - Delete Only Generated Junk

Only after manifests exist:

- Delete stale logs, old coverage, `.md1`, `_raw_old_*.json`, temporary package files, and generated graph/export duplicates that have known sources.
- Never delete raw data, source PDFs, correction/audit files, or unique Markdown research in this phase.

### Phase 5 - Rebuild Indexes

Update:

- `00_MOCs/*`
- `00_website/INDEX.md`
- `UNIFIED_HUB.md` references if any moved path is cited
- graph output only if `graphify-out` is still live

Then run a link check or `rg` path check for moved filenames.

### Phase 6 - Final Verification

Deliver:

- `archive_manifest_2026-06-28.csv`
- `delete_manifest_2026-06-28.csv`
- `cleanup_decision_log_2026-06-28.md`
- summary of kept/archived/deleted counts
- list of unresolved `REVERIFY` items

## 9. Deletion Gates

A file can be deleted only if all gates pass:

1. It is not in `data/raw/`, `docs/research/operational/`, or a correction/audit folder.
2. It is not the only file containing a citation, source URL, or correction rationale.
3. It is not referenced by `UNIFIED_HUB.md`, `00_website/INDEX.md`, `README.md`, `AGENTS.md`, or the app.
4. Its content hash matches another retained file, or it is generated and rebuildable.
5. The deletion manifest names the retained replacement or rebuild source.
6. The file has been archived first unless it is pure build/log junk.

If any gate fails, archive or leave it.

## 10. Recommended Next Action

Do not start by deleting. Start by creating:

`00_MOCs/outdated_research_candidates_2026-06-28.csv`

That file should be the ranked work queue. The first real cleanup batch should be:

1. Mark final canonical spec and correction logs as authority.
2. Tag old blueprint/version-chain docs as superseded.
3. Reconcile `DSCR_Formulas.md` against the rejected golden vector.
4. Classify `graphify-out/` as live output vs generated archive.
5. Archive, not delete, the first superseded batch.

The target outcome is not fewer files at any cost. The target is a corpus where no old file can accidentally masquerade as current truth.
