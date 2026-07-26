---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 19: Hybrid OCR Pipeline (Document Intelligence)"
summary: "**TOPICAL_INDEX ref:** Lines 1459–1516 **Last update (per audit table):** Round 11 (VENDOR SELECTED)"
entities:
  - data/fannie-mae
  - lender/visio-lending
  - topic/str
tags:
  - topic/ic-memo
  - topic/insurance
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_19_ocr_pipeline.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 19: Hybrid OCR Pipeline (Document Intelligence)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 1459–1516
**Last update (per audit table):** Round 11 (VENDOR SELECTED)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Vendor Comparison (Docling, Mistral OCR 2505, Reducto, LlamaParse, GPT-4o + Instructor, Ocrolus) | ✅ |
| Docling: open-source, digital PDFs | ✅ |
| Mistral OCR 2505: $1/1000 pages, $0.50 batch | ✅ Aligned with TOPIC 14 |
| Reducto: enterprise, complex multi-column | ✅ |
| LlamaParse: handwritten fallback | ✅ |
| GPT-4o + Instructor: vision extraction, Pydantic JSON | ✅ |
| Ocrolus: $0.50-$3.00/page; $50K-$200K+/yr; mortgage-specialized | ✅ Aligned with TOPIC 14 |
| Ocrolus GA Apr 1, 2026 | ✅ |
| GSE-approved analysis (Fannie Mae reps & warranties relief) | ✅ |
| Lloyd's of London data accuracy insurance | ✅ |
| Monthly volume ~750,000 credit applications | ✅ |
| 1,600+ document type classification | ✅ |
| Confidence Thresholds (≥0.95 auto-approve non-critical; <0.85 flag financial; ALWAYS human-review rent schedules, CAM, NOI) | ✅ Aligned with TOPIC 18 |
| Cross-Field Validation (Annual = Monthly × 12, NOI sanity, date consistency, tampering signals) | ✅ |
| Market Rent Guardrail ±30% from RentCast AVM | ✅ Aligned |
| Vendor Recommendations (Ocrolus, LoanPASS, Salesforce + Encompass, LoanVantage, MIAC/MCT, ACES, ICE Encompass, Wolters Kluwer) | ✅ Aligned with TOPIC 14 |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 18 (IC Memo) | ✅ Aligned |
| TOPIC 14 (Cost stack) | ✅ Aligned |

## 3. Round 19 Verification

- TOPIC 19 was NOT explicitly re-verified in Round 19.
- **Ocrolus selection** is consistent across TOPIC 14, TOPIC 18, TOPIC 19.
- **Round 17 T2 #5 Lender Price FLEX** UPGRADED to Tier 1 PROBABLE — TOPIC 19 already reflects this (line 1508).

**No content errors found.**

## 4. Stale Items

- **Ocrolus pricing** ($0.50-$3.00/page, $50K-$200K+/yr) — verify still current.
- **Mistral OCR pricing** — verify still current.

## 5. Cross-References Validity

- TOPIC 18 link ✅
- TOPIC 14 link ✅

## 6. Verdict

**VERIFIED — VENDOR SELECTED**

**Confidence: 4/5** (vendor selection solid; not formally re-verified in Round 19)

## 7. Recommended Actions

1. **No critical actions** — TOPIC 19 is current.
2. **Optional:** Re-verify Mistral OCR 2505 and Ocrolus pricing annually.
3. **Optional:** Cross-reference Reducto and LlamaParse Enterprise pricing details if available.