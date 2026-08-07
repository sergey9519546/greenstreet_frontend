---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 8: Lender Matrix (The Matching Engine)"
summary: "**TOPICAL_INDEX ref:** Lines 530–591 **Last update (per audit table):** Round 14/17 (FRESH)"
entities:
  - concept/dscr
  - concept/ltv
  - data/kbra
  - lender/american-heritage
  - lender/angel-oak
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/kiavi
  - lender/lima-one
  - lender/new-silver
  - lender/pennymac
  - lender/rocket-pro
  - lender/uwm
  - lender/visio-lending
  - topic/str
tags:
  - topic/portfolio
  - topic/ppp
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_08_lender_matrix.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 8: Lender Matrix (The Matching Engine)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 530–591
**Last update (per audit table):** Round 14/17 (FRESH)

---

## 1. Internal Consistency Check

11-lender matrix reviewed:

| Lender | Confidence | States | FICO | DSCR | LTV | Consistency |
|--------|------------|--------|------|------|-----|-------------|
| Griffin Funding | 85 | 50+DC | 620/640 | 0.75 | 80% | ✅ |
| Defy Mortgage | 80 | varies | 640 | 0.75 | 85% @ 740+ | ✅ |
| Easy Street Capital | 82 | varies | varies | NO min for STR | 80% | ✅ |
| Lima One Capital | 76 | ~41 | varies | varies | varies | ✅ |
| Kiavi | 70 | 49+DC | 660 | 1.10 | 90% | ✅ |
| New Silver | 72 | varies | 660 | 0.75 | 80% | ✅ |
| Deephaven | 65 (STALE) | National | 640 | 0.75 | varies | ⚠️ **Round 17 upgraded to Tier 1 PROBABLE** but corpus still shows 65 confidence |
| American Heritage | 65 | varies | 660 | 0.75 | 85% @ 760+ | ✅ |
| Visio Lending | 78 | 48 | 680 | Flex 0.75-0.99 | varies | ✅ |
| Rocket Pro TPO | n/a | 50 | 660 | 1.00 | 80% | ⚠️ **Round 17 Tier 1 PROBABLE** but corpus shows "n/a" confidence |
| Angel Oak | n/a | 47+DC | 700 | 1.00 | 85% | ⚠️ Same — "n/a" should be updated |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 5 (Pricing anchors) | ✅ Uses TOPIC 5 dated triplet |
| TOPIC 9 (STR — Easy Street, Visio, Lima One specialists) | ✅ Aligned |
| TOPIC 11 (PPP — affects lender match) | ✅ Aligned |
| TOPIC 14 (Cost stack — vendor costs) | ✅ Independent |

**CONFLICT candidate #4: Deephaven confidence**
- TOPIC 8 line 552: "Deephaven 65 (STALE)" + "HIGHEST REVERIFY PRIORITY"
- Round 17 T2 PROVISIONAL #7 verdict: "UPGRADED TO TIER 1 PROBABLE (S&P RMBS 2026-INV2 + NMP API + 300+ loans/month) — 5/5 activity / 2/5 pricing"
- **Conflict:** Corpus shows 65 confidence, but Round 17 says Tier 1 PROBABLE (which would be 70+).

**Resolution:** Update Deephaven to Tier 1 PROBABLE, confidence 70+. Note pricing is still gated (2/5).

**CONFLICT candidate #5: Rocket Pro TPO confidence**
- TOPIC 8 line 555: "Rocket Pro TPO n/a" confidence
- Round 17 T2 PROVISIONAL #8: "UPGRADED TO TIER 1 PROBABLE (LIVE per MND Dec 2025 + Rocket Pro site + 5 sources) — 5/5 existence / 2/5 pricing"
- **Conflict:** "n/a" should be Tier 1 PROBABLE for existence (5/5) with pricing gated.

**CONFLICT candidate #6: Angel Oak confidence**
- TOPIC 8 line 556: "Angel Oak n/a" confidence
- Tier 1 PROBABLE per Round 17 analogous treatment — needs update.

## 3. Round 19 Verification

- **Round 17 T2 upgrades not yet propagated** to TOPIC 8 — Deephaven/Rocket Pro/Angel Oak all show stale confidence values.
- **Round 19 T3 G6-01 (Loan tape KBRA)** + G6-02 (MSR) verified capital markets layer that feeds lender confidence ratings.
- **No new lender additions** in Round 19.

## 4. Stale Items

- **Deephaven, Rocket Pro, Angel Oak** confidence ratings pre-Round 17.
- **Capital Partner Concentration Rule** (3-5 active DSCR lenders; no single >40% submitted volume / 50% locks) — appears current; no Round 19 verification needed.

## 5. Cross-References Validity

- TOPIC 5 link ✅
- TOPIC 9 link ✅
- TOPIC 11 link ✅

## 6. Verdict

**CONFLICT DETECTED (3 confidence mismatches)**

**Confidence: 4/5** (matrix data is solid; confidence ratings lag Round 17 upgrades)

## 7. Recommended Actions

1. **Update Deephaven confidence** from 65 (STALE) to **Tier 1 PROBABLE / 70+** per Round 17 T2 #7.
2. **Update Rocket Pro TPO** confidence from "n/a" to **Tier 1 PROBABLE / 70+** per Round 17 T2 #8.
3. **Update Angel Oak** confidence from "n/a" to **Tier 1 PROBABLE / 70+** (analogous treatment, was Round 17 T2 #6 upgrade).
4. **Add Pennymac** to the matrix per Round 17 T2 #3 (UPGRADED Tier 1) — currently NOT in the 11-lender table.
5. **Add UWM** to the matrix per Round 17 T2 #6 (existence Tier 1) — pricing gated.