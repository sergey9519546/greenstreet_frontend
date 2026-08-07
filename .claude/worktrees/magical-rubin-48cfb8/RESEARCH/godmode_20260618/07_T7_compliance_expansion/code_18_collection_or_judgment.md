---
type: research
status: drafted
confidence: 5
title: Code 18 — Collection Action or Judgment
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #18"
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/tax
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_18_collection_or_judgment.md
vaulted_at: 2026-06-20
---
# Code 18 — Collection Action or Judgment

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #18
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Collection action or judgment"

## Industry Guidance

> "This reason should only be used when the credit report indicates a collection action or judgment that does not satisfy our credit standards."

**Distinction from Code 17 (Delinquency)**: Code 18 is **collection or judgment** (creditor has given up on collecting or sued). Code 17 is **delinquency** (late payments but not yet collected/sued).

## DSCR-Specific Application

**High DSCR relevance.** Open collections and judgments are significant DSCR credit overlays. Most lenders require:

- **No open collections** (regardless of balance)
- **No open judgments** (regardless of balance)
- **No unpaid tax liens**
- **Collection/judgment seasoning** of 12-24 months (varies)

**DSCR-specific triggers for Code 18**:
- Tri-merge shows $2,500 medical collection open → code 18
- Tri-merge shows $8,000 credit card judgment unpaid → code 18
- Tri-merge shows $500 medical collection 18 months old — may be acceptable (lender policy dependent)
- Some lenders (Pennymac, Newfi) require **paid or 0-balance** for medical collections ≤ $1,000

**Lender-specific exception**:
- **Pennymac DSCR**: Open collections ≥ $250 trigger denial
- **Newfi DSCR**: Open collections >$1,000 trigger denial
- **Griffin Funding**: Open collections >$2,000 trigger denial
- **Angel Oak**: Open collections >$5,000 trigger denial
- **Deephaven**: Open collections >$2,500 trigger denial

## Example Adverse Action Reason Text

> "Your credit report indicates an open collection account or judgment that does not meet our credit standards. Specifically, your credit report reflects [a collection account in the amount of $X with [Creditor] / a judgment in the amount of $X with [Plaintiff]]. Our standard requires no open collections or judgments at the time of application."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 18? |
|---|---|
| `COLLECTION_OR_JUDGMENT` | YES (primary) |
| `OPEN_COLLECTION_OVER_LIMIT` | YES (sub-trigger) |
| `UNPAID_JUDGMENT` | YES (sub-trigger) |
| `TAX_LIEN_UNPAID` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: $1,000 collection cap
- **Pennymac**: $250 collection cap
- **Griffin Funding**: $2,000 collection cap
- **Angel Oak**: $5,000 collection cap
- **Deephaven**: $2,500 collection cap

## Test Specification

```python
def test_code_18_text_verbatim():
    assert ECOA_REASON_TEXTS["18"] == "Collection action or judgment"

def test_code_18_for_open_collection():
    ke = EnrichedKillEvent(
        trigger="COLLECTION_OR_JUDGMENT",
        fico=680,
    )
    assert "18" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Newfi, Pennymac, Griffin, Angel Oak, Deephaven product guidelines
