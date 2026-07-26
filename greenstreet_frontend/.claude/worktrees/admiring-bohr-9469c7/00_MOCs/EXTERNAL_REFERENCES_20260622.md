---
type: external-references
status: verified (with corrections — 2026-06-22 07:55 PT second-order hallucination fix)
title: "External References — DSCR Research 2026-06-22"
summary: "Six DSCR research outputs originally claimed to be at C:\\Users\\serge\\Videos\\ but ALL are actually elsewhere. Status as of 2026-06-22 07:55 PT audit: 3 .md files at workspace root, 2 CSV files at 99_attachments/, 1 file (v3 unexplored) genuinely missing. Line counts verified against actual file content."
added: 2026-06-22
corrected: 2026-06-22 07:55 PT (second-order hallucination: line counts AND CSV paths)
author: Mavis
---

# External References — DSCR Research 2026-06-22 (CORRECTED 2x)

## Hallucination correction log

### Pass 1 (2026-06-22 04:55 PT) — fixed paths
Original EXTERNAL_REFERENCES claimed all 6 files were at `C:\Users\serge\Videos\`. **WRONG.** Audit found 3 .md files were at workspace root, 2 CSVs were at `99_attachments/`, and 1 file (v3) was genuinely missing. Path claims updated.

### Pass 2 (2026-06-22 07:55 PT) — fixed line counts AND restored CSVs to FOUND status
Two issues found on second pass:

1. **CSV files were wrongly marked MISSING.** They are at `99_attachments/dscr_frontier_research.csv` (113 KB, 8 rows) and `99_attachments/dscr_wide_research.csv` (69 KB, 10 rows). Pass 1 audit missed these because it checked Videos/, workspace root, and shallow subdirs but not `99_attachments/`.
2. **Line counts were wrongly "corrected".** Pass 1 audit changed actual line counts (706/247/795) to hallucinated values (541/198/541). Bash `Get-Content` line-count check confirmed 706/247/795 are correct — the originals in the 04:55 PT version were right.

| File | Pass 1 claim | Pass 2 actual | Status |
|------|-------------|----------------|--------|
| `SOVEREIGN_RESEARCH_REPORT.md` | Workspace root, 541 lines | **Workspace root, 706 lines** | ✓ FOUND |
| `dscr_research_v2_rigorous_2026-06-22.md` | Workspace root, 198 lines | **Workspace root, 247 lines** | ✓ FOUND |
| `dscr_research_v3_unexplored_areas_2026-06-22.md` | NOT FOUND | NOT FOUND (searched workspace, 99_attachments, Videos/, Output, DSCR_SOVEREIGN_OS, AEGIS — zero matches) | ✗ MISSING |
| `dscr_wide_research.csv` | NOT FOUND | **`99_attachments/`** (69 KB, 10 rows) | ✓ FOUND (was missed in Pass 1) |
| `dscr_frontier_research.csv` | NOT FOUND | **`99_attachments/`** (113 KB, 8 rows) | ✓ FOUND (was missed in Pass 1) |
| `frontier_dscr_strategy_guide.md` | Workspace root, 541 lines | **Workspace root, 795 lines** | ✓ FOUND |
| `DSCR Loan Approval and Borrower Profile Analysis.md` | (NOT INVENTORIED) | **Workspace root, 85,368 bytes, 614 lines** — human-readable synthesis of wide research | ✓ FOUND (Pass 3 discovery) |

### Pass 3 (2026-06-22 08:15 PT) — discovered 7th source file
While inventorying all new files for the user, found `DSCR Loan Approval and Borrower Profile Analysis.md` (85 KB, 614 lines) at workspace root. Created 2026-06-22 1:05 AM — BEFORE `dscr_wide_research.csv` (1:06 AM). This is the structured/synthesis version of the wide research operation; the CSV appears to be a downstream machine-readable extraction. Both contain the same core content: 14+ BiggerPockets/Reddit lender URLs, 10 NASB/Rize/Newfi/etc. citations, 13 numbered research aspects. Use the .md for narrative citation; use the .csv for grep-able metrics.

## What's actually accessible (verified 2026-06-22 07:55 PT)

| # | File | Actual path | Size | Lines | Content |
|---|------|--------------|------|-------|---------|
| 1 | `SOVEREIGN_RESEARCH_REPORT.md` | Workspace root: `DSCR LOAN OFFICE/SOVEREIGN_RESEARCH_REPORT.md` | 39,979 bytes (~40 KB) | 706 | Master synthesis. Borrower composition (RE investors 30% SFR purchases), volume growth (DSCR +52% YoY 2024), 50-state STR matrix, lender matrix, Pennymac 6.12.26 product profile, HOEPA 2026 ($27,592 / $1,380), state PPP thresholds. |
| 2 | `dscr_research_v2_rigorous_2026-06-22.md` | Workspace root | 21,852 bytes (~22 KB) | 247 | Higher-rigor synthesis. Capital markets data: Toorak DSCR RMBS (722 FICO, 1.39 DSCR, 71.7 LTV), JPMorgan DSCR MBS (740 FICO, 1.41 DSCR), CoreVest 2026-1 (1.10 DSCR, 67.2 LTV), 763 FICO duplex case, Memphis 8.4% / Cleveland 8.1% gross yields (line 97). |
| 3 | `frontier_dscr_strategy_guide.md` | Workspace root | 126,553 bytes (~127 KB) | 795 | Frontier strategy. Creative financing (line 441-462: foreign-owned US LLC for estate tax mitigation, "up to 40% on assets exceeding $60,000" — line 443), institutional exit (REIT/PE, line 3 of dscr_frontier_research.csv), asset class expansion (PadSplit, co-living 60-115% revenue lift line 254, assisted living 6-20 beds line 210), stagflation stress (1.78x DSCR required, 1.20x → 1.0x with 1.90% rate increase — line 5 of dscr_frontier_research.csv), FinTech, legal arbitrage. |
| 4 | `dscr_frontier_research.csv` | `99_attachments/` | 113 KB | 8 rows | Topic-by-topic frontier analysis: creative financing, institutional exit, asset class expansion, macro resilience, FinTech, legal arbitrage, cross-border, mixed-use, secondary market, extreme risk personas. |
| 5 | `dscr_wide_research.csv` | `99_attachments/` | 69 KB | 10 rows | Topic-by-topic wide research: public case files, high-approval borrower characteristics, think-outside-the-box personas (gig/fgn/LLC), geographic targeting, credit profile patterns, income source patterns, self-employed 1099, BRRRR/house hack, demographic targeting, highest-yield profile types. |

## What's MISSING (1 file)

`dscr_research_v3_unexplored_areas_2026-06-22.md` — claimed to be at `C:\Users\serge\Videos\` (18 KB, 293 lines, appraisal/insurance/tax mechanics). Searched exhaustively:
- Workspace root (`*.md`, `*v3*`) — no match
- `99_attachments/` — no match
- `C:\Users\serge\Videos\` — only `DSCR_Website\` + `DSCR_Borrower_Intelligence_V2_GODMODE_Package.zip`, no dscr_* research files
- `output/`, `DSCR_SOVEREIGN_OS/` — no match
- Recursive `*v3*` filter — only AEGIS_DSCR_Complete_Usable_Master_Doc_v3.md, DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md, dscr-website/preview-v3.png — none are the missing file

**Implication for `TOP_20_PROFILES_20260622.md`:** Claims attributed to v3 (Cotality fraud 1-in-43, FL insurance Miami-Dade $5.3K-$7.5K) are now flagged UNVERIFIED in the synthesis doc's risk register. If these claims matter, the v3 file must be recreated via the original research prompts (deep-research-10x skill) — though in research-mode since 2026-06-20, this would not be a code/code-doc change.

## Cross-reference with SA outputs (corrected)

| SA output | Best source in workspace |
|---|---|
| SA1 (Public Approval Case Files, 33 source citations) | `dscr_research_v2_rigorous_2026-06-22.md` (public case files: 763 FICO duplex, NY 2-unit exception, sub-1.0 approvals) |
| SA2 (Lender Matrix, 15 source citations) | `SOVEREIGN_RESEARCH_REPORT.md` lines 132-186 (DIMENSION 3: LENDER LANDSCAPE) |
| SA3 (Unconventional Personas, 6 citations) | `SOVEREIGN_RESEARCH_REPORT.md` lines 132-160 (lender profiles section) |
| SA4 (Compliance Filter, 11 citations) | `SOVEREIGN_RESEARCH_REPORT.md` lines 400-474 (DIMENSION 7: COMPLIANCE FRAMEWORK) |
| SA5 (Credit Heat Map, 30 citations) | `dscr_research_v2_rigorous_2026-06-22.md` (securitization data: Toorak, JPMorgan, CoreVest) |
| SA7 (Self-Employed Archetypes, 2 citations) | Limited — content was thin |
| SA8 (REI Archetypes, 40 citations) | `SOVEREIGN_RESEARCH_REPORT.md` lines 132-280 (lender + product variations) |
| SA9 (Ads Personas, 20 citations) | Limited |
| SA10 Compliance-Verifier Slice (157 citations) | Internal cross-references |
| SA10 Marketing-Strategy Slice (45 citations) | Internal cross-references |

## Lessons (added to MEMORY.md)

1. **Verify line counts with `(Get-Content).Count`** before stamping — never trust a "corrected" count that differs from the original claim unless re-verified.
2. **Search attachments/ subdirs** when primary location fails — `99_attachments/` is a common dump location for binary/source artifacts.
3. **Pass 1 audit can hallucinate corrections** — when "correcting" a doc, verify against actual file content with bash, not just from memory.
4. **One missing file is one missing file** — don't infer "all 3 are missing" because 1 is missing.

---
*Updated 2026-06-22 07:55 PT after second-order hallucination audit (line counts + CSV paths). Original version had wrong paths (Pass 1 fixed); Pass 1's "fix" introduced wrong line counts and missed CSVs (Pass 2 fixed). This version reflects verified file locations and sizes as of audit time.*
