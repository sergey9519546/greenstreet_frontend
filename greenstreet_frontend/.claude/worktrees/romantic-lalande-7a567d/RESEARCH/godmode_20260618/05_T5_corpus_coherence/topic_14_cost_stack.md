---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 14: Cost Stack & Vendors (Operating Budget)"
summary: "**TOPICAL_INDEX ref:** Lines 1007–1093 **Last update (per audit table):** Round 14/15 (FLEX RECOMMENDED + Tier 1 PROBABLE)"
entities:
  - data/cotality
  - lender/verus
  - ml/timesfm
  - topic/str
tags:
  - topic/ic-memo
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_14_cost_stack.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 14: Cost Stack & Vendors (Operating Budget)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 1007–1093
**Last update (per audit table):** Round 14/15 (FLEX RECOMMENDED + Tier 1 PROBABLE)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Ocrolus $100K-$400K volume-based | ✅ Reasonable |
| AirDNA ~$50K+ Enterprise | ✅ |
| RentCast 50 free/mo, enterprise variable (V2.0 corrected) | ✅ Aligned with Round 15 correction |
| Optimal Blue $15K-$50K+ | ✅ |
| HouseCanary $25K-$100K+ Enterprise | ✅ |
| Legal/content $30K-$60K | ✅ |
| Cloud/API $50K-$150K | ✅ |
| AirDNA Enterprise API ~$500-$2,000/mo at scale | ✅ |
| ATTOM $95/mo starter; some sources $500/mo | ⚠️ Minor inconsistency in source citation |
| Optimal Blue / Polly / Lender Price FLEX / LoanPASS comparison | ✅ Per Round 14/15 Tier 1 PROBABLE |
| Docling + Mistral OCR + Reducto | ✅ |
| Build budget $750K-$1.4M | ✅ Reasonable for 6-month loaded |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 13 (AI/ML — TimesFM via BigQuery) | ✅ Aligned |
| TOPIC 19 (OCR Pipeline) | ✅ Aligned |
| TOPIC 18 (IC Memo) | ✅ Vendor costs feed IC memo production |
| TOPIC 9 (STR — AirDNA, no automation until commercial agreement) | ✅ Aligned |

**CONFLICT candidate #7: ATTOM pricing**
- TOPIC 14 line 1044: "$95/mo starter (some sources cite $500/mo for API)"
- This is documented as a minor inconsistency in TOPIC 14 itself; not really a conflict, just a sourcing note.

## 3. Round 19 Verification

- TOPIC 14 was NOT explicitly re-verified in Round 19 (math/algo sweep didn't include vendor costs).
- **Round 17 T2 #5 Lender Price FLEX** UPGRADED to Tier 1 PROBABLE (BankingBridge 2025 confirms #4 rank) — TOPIC 14 already reflects this (line 1069-1072).
- **LoanPASS** selected by Verus — referenced in TOPIC 14 line 1070.
- **Cotality (CoreLogic) LoanSafe** — $50-$200/deal, fraud consortium data.

**No new Round 19 verifications needed for vendor costs.**

## 4. Stale Items

- **Mistral OCR 2505 pricing** ($1/1000 pages, $0.50 batch) — verify still current.
- **Vendor cost ranges** are stable; annual updates would be prudent.

## 5. Cross-References Validity

- TOPIC 13 link ✅
- TOPIC 19 link ✅

## 6. Verdict

**VERIFIED**

**Confidence: 5/5** (vendor costs well-documented; FLEX + LoanPASS recommended; Round 17 T2 #5 reflected)

## 7. Recommended Actions

1. **No critical actions** — TOPIC 14 is current.
2. **Optional:** Re-verify Mistral OCR 2505 pricing and Ocrolus pricing against current vendor sites.
3. **Optional:** Add Tier 1 PROBABLE badge to LoanPASS and Lender Price FLEX per Round 17 T2 #5.