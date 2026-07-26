---
type: research
status: drafted
confidence: 5
title: Code 17 — Delinquent Past or Present Credit Obligations With Others
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #17"
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
  - topic/foreclosure
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_17_delinquent_credit_obligations.md
vaulted_at: 2026-06-20
---
# Code 17 — Delinquent Past or Present Credit Obligations With Others

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #17
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Delinquent past or present credit obligations with others"

## Industry Guidance

> "This reason should be used when the credit report reflects late payments to creditors other than our financial institution and those delinquencies do not satisfy our credit standards."

**Distinction from Code 16**: Code 16 = late payments **with us** (the lender). Code 17 = late payments **with others** (third parties).

## DSCR-Specific Application

**High DSCR relevance.** This is one of the most common credit-related reasons for DSCR denial. DSCR lenders' typical delinquency standards:

- **0x30x12**: No 30-day late in last 12 months (Pennymac, Angel Oak)
- **1x30x12**: One 30-day late acceptable (Newfi, Griffin)
- **0x60x24**: No 60-day late in last 24 months (most lenders)
- **0x90x24 / 0x90x36**: No 90-day late in last 24-36 months (most lenders)
- **No charge-offs** in last 24-36 months (most lenders)

**DSCR-specific triggers for Code 17**:
- Tri-merge credit report shows 2x30 in last 12 months → code 17 (if lender requires 0x30x12)
- Tri-merge shows 1x60 in last 24 months → code 17 (if lender requires 0x60x24)
- Charge-off on credit card 18 months ago → code 17
- Auto loan repossession 24 months ago → code 17

**Distinction from Code 18 (Collection action or judgment)**: Code 17 is **delinquency** (late payments that were eventually cured or are still outstanding). Code 18 is **collection or judgment** (sent to collections, lawsuit, judgment).

**Distinction from Code 19 (Garnishment or attachment)**: Code 19 is **garnishment** (wage garnishment) or **attachment** (bank account lien).

**Distinction from Code 20 (Foreclosure or repossession)**: Code 20 is **foreclosure** (real estate) or **repossession** (auto, boat, etc.).

## Example Adverse Action Reason Text

> "Your credit report shows a pattern of delinquent past or present credit obligations. Specifically, your credit report reflects the following late payments: [2x30 in last 12 months on revolving accounts / 1x60 in last 24 months on installment loan]. Our standard requires [0x30x12 / 0x60x24] which your credit history does not meet."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 17? |
|---|---|
| `DELINQUENT_CREDIT_OBLIGATIONS` | YES (primary) |
| `2X30_LAST_12` | YES (sub-trigger) |
| `1X60_LAST_24` | YES (sub-trigger) |
| `CHARGE_OFF_REVOLVING` | YES (sub-trigger, less specific) |

## Lender-Specific Variants

- **Newfi DSCR**: 0x60x12, 1x30x12 acceptable
- **Pennymac DSCR**: 0x30x12 for LTR, 1x30x12 for STR
- **Griffin Funding**: 1x30x12 acceptable, no 60+ in 24 months
- **Angel Oak DSCR-Investor**: 0x60x24, 1x30x12 acceptable
- **Deephaven**: 0x60x24, 1x30x12 acceptable, charge-off seasoning 36 months

## Test Specification

```python
def test_code_17_text_verbatim():
    assert ECOA_REASON_TEXTS["17"] == "Delinquent past or present credit obligations with others"

def test_code_17_for_2x30_last_12():
    ke = EnrichedKillEvent(
        trigger="DELINQUENT_CREDIT_OBLIGATIONS",
        fico=640,
    )
    assert "17" in select_ecoa_codes(ke.trigger)

def test_code_17_vs_18_distinction():
    """Code 17 = delinquency; Code 18 = collection/judgment."""
    delinq = EnrichedKillEvent(trigger="DELINQUENT_CREDIT_OBLIGATIONS")
    coll = EnrichedKillEvent(trigger="COLLECTION_OR_JUDGMENT")
    assert "17" in select_ecoa_codes(delinq.trigger)
    assert "17" not in select_ecoa_codes(coll.trigger)
    assert "18" in select_ecoa_codes(coll.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Newfi, Pennymac, Griffin, Angel Oak, Deephaven product guidelines
