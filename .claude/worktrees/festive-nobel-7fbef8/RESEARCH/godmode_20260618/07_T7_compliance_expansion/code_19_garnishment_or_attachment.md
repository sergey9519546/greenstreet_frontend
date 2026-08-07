---
type: research
status: drafted
confidence: 5
title: Code 19 — Garnishment or Attachment
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #19"
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
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_19_garnishment_or_attachment.md
vaulted_at: 2026-06-20
---
# Code 19 — Garnishment or Attachment

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #19
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Garnishment or attachment"

## Industry Guidance

> "This reason should only be used when the credit report indicates a garnishment or attachment that does not satisfy our credit standards."

**Distinction**:
- **Garnishment**: Court order to employer to withhold portion of wages for creditor payment
- **Attachment**: Court order to bank to seize funds from debtor's account

## DSCR-Specific Application

**Medium DSCR relevance.** Garnishments and attachments are severe credit events and are typically disqualifying until resolved.

**DSCR-specific triggers for Code 19**:
- Tri-merge shows active wage garnishment (any amount) → code 19
- Tri-merge shows bank account attachment → code 19
- Some lenders distinguish wage garnishment vs. bank attachment vs. tax levy

**Lender policy**:
- **Newfi**: 0 active garnishments (no seasoning)
- **Pennymac**: 0 active garnishments
- **Griffin Funding**: 0 active garnishments, 24-month seasoning post-resolution
- **Angel Oak**: 0 active garnishments, 12-month seasoning post-resolution
- **Deephaven**: 0 active garnishments, 24-month seasoning post-resolution

## Example Adverse Action Reason Text

> "Your credit report indicates an active garnishment or attachment that does not meet our credit standards. Specifically, your credit report reflects [a wage garnishment / a bank account attachment] in the amount of $X. Our standard requires no active garnishments or attachments at the time of application."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 19? |
|---|---|
| `ACTIVE_GARNISHMENT` | YES (primary) |
| `BANK_ATTACHMENT` | YES (sub-trigger) |
| `WAGE_GARNISHMENT` | YES (sub-trigger) |
| `TAX_LEVY` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 0 active garnishments
- **Pennymac**: 0 active garnishments
- **Griffin Funding**: 24-month seasoning post-resolution
- **Angel Oak**: 12-month seasoning post-resolution
- **Deephaven**: 24-month seasoning post-resolution

## Test Specification

```python
def test_code_19_text_verbatim():
    assert ECOA_REASON_TEXTS["19"] == "Garnishment or attachment"

def test_code_19_for_active_garnishment():
    ke = EnrichedKillEvent(
        trigger="ACTIVE_GARNISHMENT",
        fico=620,
    )
    assert "19" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
