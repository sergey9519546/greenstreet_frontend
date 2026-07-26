# DSCR Workspace Audit & Consolidation — Design Spec

**Date:** 2026-06-22
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`
**Author:** Mavis (mavis) — brainstorming session mvs_acb8a2c723064312b6125b237c0aff1c

---

## 1. Purpose

Inventory the full DSCR workspace (53,485 files, ~6.1 GB, 1,912 markdown docs, 11,002 Python files, plus TypeScript / JavaScript / datasets / archives) and produce a navigable **authoritative-vs-archive Map of Content (MOC) tree** in `00_MOCs/`. No code is written; no files are moved or deleted by the audit itself. The deliverable is documentation that lets a human (you) find any doc in seconds and know which one is canonical for any topic.

## 2. Scope

- **In scope:** all 53,485 files in the workspace root, including:
  - 1,912 markdown docs (the bulk of the duplication problem)
  - 11,002 `.py` + 9,867 `.ts` + 6,395 `.js` source files (MOC'd at directory level)
  - Datasets (`.parquet`, `.csv`)
  - Archives (`.tar`, `.zip`)
  - Build artifacts (`.pyc`, `.map`, `.pyd`, `.metadata`)
  - Obsidian vault metadata (`.obsidian/`)
  - All top-level subdirs (00_engine, 00_compliance, 00_marketing, 00_website, DSCR_SOVEREIGN_OS, dscr-demo_website, greenstreet_frontend, DSCR_Datasets, agent_outputs, ANALYSIS, RESEARCH, autoresearch, graphify-out, 99_attachments, 99_build_scripts, 99_engine_egnine, 99_external_check, _docs, .agent, .autoresearch, .claude, .minimax, .obsidian, output, 01_research_notes)
- **Out of scope (this design):** reading content of every file; physically moving or deleting files; writing any code that modifies the workspace structure.
- **Out of scope (related, separate workstreams):** building the DSCR engine, compliance audit of regulatory claims, GTM / marketing plan, frontend polish, dataset cleanup.

## 3. Approach: C — Max accuracy with user review queue

Three candidate approaches were considered (A: heuristics only ~75% accuracy; B: heuristics + spot-read ~90% accuracy; C: heuristics + spot-read + user review queue ~99% accuracy). The user picked **C**. The user-blocking step (phase 4 review queue) is what makes C = max accuracy.

## 4. Architecture — 7 phases

The audit runs as 7 sequential phases. Phase 4 is the human-blocking checkpoint; the audit cannot proceed to MOC generation until the user resolves every queue item.

### Phase 1 — Scan
- Walk the full 53k file tree using Python `os.walk` (not PowerShell `Get-ChildItem`, which breaks on em-dash filenames per the workspace's known pattern).
- Capture per-file metadata: relative path, parent dir, size, last-modified, sha256 (only for files <10 MB to keep wall-clock reasonable), extension.
- **Output:** `00_MOCs/_audit_state/scan_results.jsonl` — one JSON record per line, ~53k lines.

### Phase 2 — Classify (heuristics)
- Bucket each file by parent dir + name pattern + sha256 dedup + last-modified date.
- Assign a tentative status (CANONICAL / SUPERSEDED / DUPLICATE / ARCHIVED / RAW_DATA / EXTERNAL / CODE / UNKNOWN) and a tentative topic.
- Apply these rules:
  - sha256 match → DUPLICATE (one canonical, others DUPLICATE).
  - Name-version-lineage match (v1/v2/v3, "Complete"→"Definitive" naming chain, dates within 30 days of each other on overlapping topic) → SUPERSEDED chain.
  - In `_archive/`, `_attachments/`, `_external_check/` → ARCHIVED / EXTERNAL.
  - Extension in {.pyc, .map, .pyd, .metadata, .parquet when in DSCR_Datasets} → RAW_DATA.
  - Parent dir matches one of the 14 documented topics → that topic.
  - Otherwise → UNKNOWN with topic "to_assign".
- **Output:** `00_MOCs/_audit_state/classifications.jsonl` — one JSON record per file with `{path, status, topic, sha256, parent_dir, size, last_modified, rule_fired, confidence}`.

### Phase 3 — Detect ambiguity → emit queue
- Walk classifications.jsonl. For any cluster where heuristics can't decide, emit one queue entry per cluster.
- "Can't decide" = at least one of:
  - 3+ files in same topic with status CANONICAL (competing canonicals).
  - Topic assignment is UNKNOWN.
  - Confidence score <0.6 (multiple conflicting rules fired).
- **Output:** `00_MOCs/_audit_state/REVIEW_QUEUE.md` — human-readable checklist, one item per cluster. See §6 for entry format.

### Phase 4 — User reviews queue (BLOCKING)
- User reads REVIEW_QUEUE.md, fills in the decision per item (KEEP_AS_CANONICAL / SUPERSEDED_BY_X / DUPLICATE_OF_X / ARCHIVE / NEW_TOPIC / UNKNOWN).
- The audit does not proceed to phase 5/6/7 until every item has a user decision recorded in the file (detected by a regex check on `**Decision:** ⬜` → `**Decision:** [non-empty]`).
- If the user marks an item "needs deeper look", that file is added to the phase 5 spot-read list.

### Phase 5 — Spot-read
- Read first 200 lines of every file in the phase 4 "needs deeper look" list + every UNKNOWN-status file with reasonable size (<500 KB).
- Confirm or revise the heuristic's topic + status assignment based on content.
- **Output:** refined classifications appended to `00_MOCs/_audit_state/classifications_refined.jsonl`.

### Phase 6 — Generate MOCs
- Group refined classifications by topic.
- Write one MOC file per topic per §5.
- Write `00_MOCs/MOC_INDEX.md` (entry point) with summary stats + links to all sub-MOCs.
- **Output:** 14 MOC files in `00_MOCs/` + `MOC_INDEX.md`.

### Phase 7 — Verify
- Spot-check 10 random files: heuristic status matches actual content role? (read first 200 lines each).
- Every MOC wikilink resolves to an existing file.
- sha256 dedup confirmed on at least one known-duplicate pair (e.g., `dscr_sovereign_os_upgrade_intelligence_report (1).md` vs the un-suffixed version — pre-confirmed to exist).
- File count input (53,485) = sum of all classifications.
- REVIEW_QUEUE fully resolved (no unchecked items remain).
- Fix any issues inline before declaring complete.

## 5. MOC tree structure

```
00_MOCs/
  MOC_INDEX.md                    ← entry point; links to all sub-MOCs + summary stats
  MOC_Sovereign_OS_Core.md        ← Definitive Blueprint v3, Upgrade Report v2, Feature Engineering, Product Spec
  MOC_Research_Sprints.md         ← Sprints 1-7 + sprint_short + _archive versions
  MOC_Compliance_Regulatory.md    ← HOEPA, Reg B, FCRA, state PPP matrix, federal register
  MOC_Lender_Intelligence.md      ← Kiavi, Lima One, Newfi, Angel Oak, etc. + non-QM gap analysis
  MOC_Tax_After_Tax.md            ← tax engine, after-tax IRR, 1031 exit
  MOC_Monte_Carlo_Risk.md         ← Monte Carlo simulations, stress testing
  MOC_ML_TimesFM_XGBoost.md       ← TimesFM LoRA, XGBoost ML layer
  MOC_Frontend_Website.md         ← dscr-demo_website, greenstreet_frontend, 00_website
  MOC_Code_Engine.md              ← 00_engine, 99_engine_egnine, DSCR_SOVEREIGN_OS code
  MOC_Marketing_GTM.md            ← 00_marketing, similarweb analytics
  MOC_Datasets.md                 ← DSCR_Datasets, FEMA_NFIP_Claims, 03_dscr_loan_performance
  MOC_External_Archives.md        ← .tar / .zip dumps, session archives
  MOC_Analytics_Research.md       ← ANALYSIS/, RESEARCH/, 01_research_notes, autoresearch
  _audit_state/                   ← internal audit working files (scan_results.jsonl, classifications.jsonl, classifications_refined.jsonl, REVIEW_QUEUE.md)
```

## 6. Review queue entry format

Each REVIEW_QUEUE.md entry follows this template:

```markdown
## Item N — <short description>

**Files in conflict (M):**
- `path/to/file_a.md` (size KB, last_modified)
- `path/to/file_b.md` (size KB, last_modified)
- ...

**Why ambiguous:** <which heuristic(s) conflicted or fired weakly>

**Tentative classification:** <what the heuristic suggested>

**Decision:** ⬜ KEEP_ALL  ⬜ ONE_CANONICAL (which? `________`)  ⬜ SUPERSEDED_CHAIN  ⬜ NEEDS_DEEPER_LOOK  ⬜ NEW_TOPIC

**Notes:** _________________________________________

---
```

User checks one box, optionally fills the path/name + notes. The audit's phase 4 completion check scans for non-empty `**Decision:**` lines.

## 7. Status taxonomy

Every file in the workspace gets exactly one of these tags in its MOC entry:

| Status         | Meaning                                                                                | Example                                                                                                |
|----------------|----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| CANONICAL      | Current source of truth. Read this.                                                    | `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md`                                                  |
| SUPERSEDED     | Was canonical, replaced by a newer version. Keep for history.                         | `DSCR_Underwriting_Engine_v14_Complete_Master_Document.md` → replaced by v16                           |
| DUPLICATE      | Same content as another file (sha256 match or near-match). Keep one as canonical.      | `dscr_sovereign_os_upgrade_intelligence_report (1).md`                                                  |
| ARCHIVED       | Old research/sprint output, no longer relevant but historically useful.                 | `RESEARCH/_archive/sprint_clean/Sprint_*.md`                                                           |
| RAW_DATA       | Datasets, vendored deps, build artifacts. Don't MOC-list individually; count only.     | `DSCR_Datasets/*.parquet`, `.pyc`, `.map`, `.metadata`, `node_modules/`                                 |
| EXTERNAL       | Third-party downloaded content. Don't MOC-list; reference only.                        | `99_attachments/`, `99_external_check/`                                                                |
| CODE           | Source code, not docs. MOC'd at directory level, not per-file.                         | `00_engine/**/*.py`, `dscr-demo_website/**/*.ts`                                                       |
| UNKNOWN        | Couldn't classify. Goes to REVIEW_QUEUE.                                               | ambiguous name patterns, no clear topic match                                                          |

## 8. MOC entry format

Each file listed in a MOC appears as:

```markdown
### [[filename.md]]  ←CANONICAL→  (v3, 62 KB, 2026-06-22)
- **Topic:** Sovereign OS core spec
- **Supersedes:** [[filename_v2.md]], [[filename_v1.md]]
- **Notes:** Newest + largest of the Master/Definitive lineage; cites Sprint 6+7 findings.
- **Verified by:** heuristics (date+size+name); user-confirmed in queue item #14
```

For CODE entries (directory-level), the format is:

```markdown
### 00_engine/  ←CODE→  (412 files, 8.3 MB, 2026-06-22)
- **Topic:** Sovereign OS engine code
- **Notes:** Primary canonical codebase. Sub-packages TBD via deeper look.
```

## 9. Edge cases handled

1. **Em-dash filenames** (workspace pattern: break PowerShell) → walk via Python `os.walk`, never `Get-ChildItem` on the full tree.
2. **Files >50 MB** (FEMA CSV at 146 MB, zips at 200–440 MB) → skip sha256, mark `RAW_DATA` or `EXTERNAL`, don't MOC-list individually.
3. **Build artifacts** (`.pyc`, `.map`, `.pyd`, `.metadata`) → auto-classify as `RAW_DATA`, don't count toward MOC.
4. **Code dirs** (`00_engine`, `dscr-demo_website`, etc.) → MOC at the directory level, not per-file. Per-file count = metric only.
5. **Vendored deps / `node_modules` patterns** → auto-classify as `RAW_DATA`.
6. **sha256 dup detection** → only for files <10 MB; near-duplicate content uses name-version-lineage matching.
7. **OneDrive junction points** → `os.path.realpath` + cycle detection, never recurse into a loop.
8. **Encoding** → UTF-8 with `errors='replace'`.
9. **Empty dirs** → counted, listed in MOC_INDEX summary, not MOC'd individually.
10. **Files outside workspace** → none expected; if encountered, log and skip.

## 10. Constraints (from user history)

- **No deletion.** Audit only marks status in MOC entries. If user wants to physically move files afterward, that's a separate follow-up step.
- **No code written by the audit.** Audit produces documentation + JSONL state files only.
- **Primary-source verification** (per broader user compliance standards) applies to any regulatory claim surfaced in a MOC entry — not a phase-7 audit responsibility, but flagged if encountered.
- **Workspace is preserved exactly as-is** until user explicitly authorizes reorg.

## 11. Verification (phase 7 checklist)

- [ ] Spot-check 10 random files: heuristic status matches actual content role
- [ ] Every MOC wikilink resolves to an existing file
- [ ] sha256 dedup confirmed on at least one known-duplicate pair
- [ ] File count input (53,485) = sum of all classifications
- [ ] REVIEW_QUEUE fully resolved (no unchecked items remain)
- [ ] MOC_INDEX.md summary stats reconcile with MOC body counts

## 12. Out of scope (explicit)

The audit does not:

- Build the DSCR engine or any code
- Verify regulatory claims against primary sources
- Reorganize files into new folder structures
- Delete duplicates (user history: keep everything)
- Replace any existing doc with a new "synthesized canonical"
- Touch `00_MOCs/_audit_state/` files after they're written (working files, not deliverables)

## 13. Open questions

None. All blocking decisions resolved in brainstorming Q&A (purpose, scope, format, approach).