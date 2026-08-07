---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 1: Dual-Track DSCR Math"
summary: "**Auditor:** MiniMax Mavis (10x deep-research corpus coherence audit)"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - data/fannie-mae
  - data/kbra
  - lender/verus
  - lender/visio-lending
  - sprint/5
  - topic/2-4-unit
  - topic/str
tags:
  - topic/apex
  - topic/cure-rate
  - topic/default-rate
  - topic/lgd
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_01_dual_track_dscr.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 1: Dual-Track DSCR Math

**Audit date:** 2026-06-18
**Auditor:** MiniMax Mavis (10x deep-research corpus coherence audit)
**TOPICAL_INDEX ref:** Lines 20–51
**Last update (per audit table):** Round 12

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Track 1 = Qualifying Gross Rent / PITIA | ✅ Consistent across TOPIC 1 + TOPIC 2 + Sprint 5 |
| Track 2 = (Gross × (1−Vac) − Mgmt − Maint) / PITIA | ✅ Consistent |
| Lower-of(lease, 1007) for LTR | ✅ Universal convention per T1 claim_03 |
| STR haircut 20% (or 0.70–0.80 multiplier) | ✅ Consistent |
| Fannie Form 1007 = 25% vacancy for 2-4 unit | ⚠️ **REVISION FLAG** — Round 16 T1 claim_05: 25% rule is **FNMA conforming DTI rule (Selling Guide B3-3.8-01), NOT DSCR rule**. DSCR lenders apply lender-specific 75–80% haircut as market practice. Corpus should reword. |
| LTR defaults (vac 5-10%, mgmt 8-10%, maint 5-7%, CapEx 5-10%) | ✅ Consistent with TOPIC 3 |
| STR OpEx 45-65% of gross | ✅ Consistent with TOPIC 9 |
| IO denominator = ITIA | ✅ Consistent |
| Rounding up DSCR NOT permitted | ✅ Industry-standard |

**Internal contradiction:** TOPIC 1 cites "1007 vacancy factor for 2-4 unit: 25% (Fannie Mae Form 1007)" as a DSCR rule. Round 16 T1 claim_05 (Tier 1 REVISION REQUIRED) explicitly says this is a **FNMA conforming DTI rule, not DSCR**. TOPIC 1 needs a one-line disambiguation.

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 2 (Math spine) | ✅ Payment factor, PITIA, deal-break rate all align |
| TOPIC 6 (Golden tests) | ✅ Acceptance criteria 1, 3, 5 cite Track 1 / Track 2 / lower-of / no rounding |
| TOPIC 9 (STR Income) | ✅ STR formula matches |
| TOPIC 14 (Verus 89.44% / 1.10x) | ✅ Consistent — Verus DSCR presale data is 2025 and stable |

## 3. Round 19 Verification

- Math G4-01..06 (Pre-Tax Returns) verified TOPIC 3 base math; no impact on TOPIC 1 directly.
- Math G8-04 (DSCR LGD 25-32%) — KBRA involuntary severity 26.5% on 475K loans; corpus 25% remains conservative baseline. **No change** to TOPIC 1.
- G8-05 cure rate (50-65% LTR, 36-60% STR) — feeds into Track 2 negative flag (Acceptance Criterion 19) but not TOPIC 1 itself.

**TOPIC 1 is mathematically stable; no Round 19 changes needed.**

## 4. Stale Items

- Round 12 last update — pre-Round 14 (acceptable, since T1 math is stable).
- **Form 1007 25% vacancy wording** is dated — pre-dates Round 16 REVISION.

## 5. Cross-References Validity

- TOPIC 2 link ✅ (verified, lines 53-142)
- TOPIC 6 link ✅
- TOPIC 9 link ✅
- TOPIC 14 (Verus) link ✅ — Verus 89.44% / 1.10x weighted avg, 63.04% no-lease confirmed in TOPIC 15 (lines 1128-1130) and T1 claim_09 KBRA methodology notes.

## 6. Verdict

**VERIFIED** with 1 minor revision needed.

**Confidence: 5/5** (mathematically rock-solid; only wording refinement required)

## 7. Recommended Actions

1. **Reword "1007 vacancy factor for 2-4 unit: 25%"** → clarify as "FNMA conforming DTI scope (Selling Guide B3-3.8-01); DSCR lenders apply lender-specific 75-80% haircut" (per Round 16 T1 claim_05).
2. **Update last-update date** to "Round 16" to reflect the Form 1007 revision.
3. Otherwise no action needed — TOPIC 1 is the non-negotiable core and is internally consistent.