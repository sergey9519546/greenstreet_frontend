---
type: research
status: drafted
confidence: 3
title: "Deep Research 10x — Category A: Stale Propagations"
summary: "**Skill:** deep-research-10x v9.9.10 **Status:** COMPLETE"
entities:
  - concept/dscr
  - concept/itia
  - slice/3
  - tax/1031
  - tax/niit
  - tax/qoz
  - topic/str
tags:
  - topic/after-tax
  - topic/tax
source: RESEARCH/deep_research_20260618/A_stale_propagations/DR_20260618_A_TOPICAL_INDEX_propagation.md
vaulted_at: 2026-06-20
---
# Deep Research 10x — Category A: Stale Propagations

**Date:** 2026-06-18
**Skill:** deep-research-10x v9.9.10
**Status:** COMPLETE
**Round:** A (1 of 4)

---

## Executive Summary

All 3 Round 14 corrections successfully propagated from `research_report_20260618_dscr_sovereign_os.md` and `MASTER_ANALYSIS.md` (Round 14) into `TOPICAL_INDEX.md` (TOPIC 4 — After-Tax Returns). The downstream `TOPICAL_INDEX` was the last public-facing corpus file that had not been updated, so this closes the propagation loop. Confidence: **Tier 5 (Highly Confident)** — all items already verified in MASTER_ANALYSIS Round 14 with multiple primary sources.

---

## A.1 — QOZ / QROF (Qualified Opportunity Zone / Rural Opportunity Fund)

### Status: NEW SECTION ADDED

**Prior TOPICAL_INDEX state:** QOZ not mentioned at all in TOPIC 4.
**After:** New "QOZ / QROF" subsection added with full QOZ permanence + post-2026 rules + QROF tier.

### Key Findings (preserved from Round 14 verification)
- **OBBBA §70431 made QOZ PERMANENT** (P.L. 119-21, July 4, 2025)
- Pre-2027 investments: deferral still ends on earlier of (a) inclusion event or (b) Dec 31, 2026
- Post-2026 investments: 5-year deferral from investment + 10% step-up at year 5
- 30-year FMV basis freeze is new
- QROF (rural) tier offers 30% step-up
- Decennial designation cycle begins July 1, 2026 (70% AMI vs 80%, no contiguous tracts)
- **Counterintuitive finding:** 1031+QOZ may *cost more* than sell for high-bracket investors (deferred gain at 37% vs §1250 28.8% w/NIIT)

### Sources
- IRC §1400Z-2 (QOZ statute)
- IRS Notice 2018-48 (QOZ initial guidance)
- Rev. Proc. 2020-12 (QOZ working capital safe harbor)
- OBBBA Public Law 119-21 §70431 (signed July 4, 2025)
- Big-4 CPA white papers (Deloitte, PwC, EY, KPMG)
- Agent 4 Round 14 research (`RESEARCH_DOMAIN_10_1031_QOZ.md`)

### Confidence
**Tier 5** (Highly Confident) — Multiple primary sources (IRC, IRS, OBBBA Public Law text) cross-confirmed.

### Impact
- Slice 3 after-tax engine must implement the new 5-year deferral + 10% step-up for post-2026 investments
- Slice 3 must also implement QROF 30% step-up for rural investments
- Existing 12/31/2026 cliff logic still applies to pre-2027 investments

---

## A.2 — QBI Deduction (Section 199A) — 23% for 2026

### Status: LINE UPDATED

**Prior TOPICAL_INDEX state:** "20% permanent" (WRONG)
**After:** "23% for 2026, inflation-indexed thereafter" (CORRECT)

### Key Findings (preserved from Round 14 verification)
- **OBBBA §70411 changed QBI from 20% to 23%** for tax years beginning after Dec 31, 2025
- **§199A(i) inflation-indexed** the new 23% rate going forward
- Pre-OBBBA: was set to expire 2025 per TCJA sunset schedule
- OBBBA made QBI permanent AND bumped to 23%

### Sources
- OBBBA Public Law 119-21 §70411
- IRC §199A + §199A(i) (inflation indexing)
- IRS Form 8995 (QBI Simplified Computation) — to be updated for 23%
- Agent 4 Round 14 verification (`RESEARCH_DOMAIN_9_TAX_VALIDATION.md`)

### Confidence
**Tier 5** (Highly Confident) — Primary source (OBBBA Public Law text) cross-confirmed with Big-4 CPA firm white papers.

### Impact
- Slice 3 after-tax engine must use 23% for 2026 (not 20%)
- Future years: apply inflation indexing (estimated ~0.5-1% annually)

---

## A.3 — OBBBA §179 = $2,560,000 (2026)

### Status: LINE UPDATED

**Prior TOPICAL_INDEX state:** "$2.5M-$2.56M (inflation-indexed)" (range approximation)
**After:** "$2,560,000 (2026, IRS Rev. Proc. 2025-32 §4.24, Tier 1 verified across 5 sources)" (exact, with phaseout $4,090,000 + SUV cap $32,000)

### Key Findings (preserved from Round 14 verification)
- **IRS Rev. Proc. 2025-32 §4.24** sets §179 limit at $2,560,000 for 2026
- Phaseout begins at $4,090,000
- SUV cap: $32,000
- Cross-confirmed by KPMG, CCH, Section179.org, Block Advisors

### Sources
- IRS Rev. Proc. 2025-32 §4.24 (primary)
- KPMG 2026 §179 analysis
- CCH 2026 §179 commentary
- Section179.org (industry tracker)
- Block Advisors 2026 §179 brief
- Agent 4 Round 14 verification (`RESEARCH_DOMAIN_9_TAX_VALIDATION.md`)

### Confidence
**Tier 5** (Highly Confident) — 5+ sources confirm exact $2,560,000 figure.

### Impact
- Slice 3 after-tax engine hardcodes $2,560,000 for 2026 (not "$2.5M-$2.56M" range)
- Annual update needed (Celery cron Jan 1) for inflation indexing

---

## Verification Log

| Check | Before | After | Source |
|-------|--------|-------|--------|
| QOZ permanence (OBBBA §70431) | NOT in TOPICAL_INDEX | PRESENT | IRC + OBBBA P.L. 119-21 |
| QBI 23% for 2026 | "20% permanent" (WRONG) | "23% for 2026, inflation-indexed" (CORRECT) | OBBBA §70411 + IRC §199A(i) |
| §179 = $2,560,000 | "$2.5M-$2.56M" (range) | "$2,560,000" (exact, Rev. Proc. 2025-32) | IRS Rev. Proc. 2025-32 §4.24 |

**Propagation matrix (post-Category A):**

| Round 14 Correction | MASTER_ANALYSIS.md | research_report.md | TOPICAL_INDEX.md |
|---------------------|:------------------:|:------------------:|:----------------:|
| QOZ permanence | ✅ | ✅ | ✅ (this pass) |
| QBI 23% (2026) | ✅ | ✅ | ✅ (this pass) |
| OBBBA §179 $2,560,000 | ✅ | ✅ | ✅ (this pass) |

**All 3 corrections now propagated to all 3 public-facing files.**

---

## Recommended Next Steps

1. ✅ Update TOPICAL_INDEX.md (DONE)
2. ⏳ Update Slice 3 after-tax engine parameters to use 23% QBI + $2,560,000 §179 (build phase, not research)
3. ⏳ Update Slice 3 to model new QOZ 5-year/10% step-up for post-2026 investments (build phase)
4. ⏳ Add QOZ Dec 31, 2026 cliff logic for pre-2027 investments (build phase)

---

*Generated by MiniMax Mavis deep-research-10x skill v9.9.10 on 2026-06-18 16:15 PT.*
*All changes verified via PowerShell Select-String checks against TOPICAL_INDEX.md.*
