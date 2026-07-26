---
type: research
status: drafted
confidence: 5
title: Code 15 — Limited Credit Experience
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #15"
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
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_15_limited_credit_experience.md
vaulted_at: 2026-06-20
---
# Code 15 — Limited Credit Experience

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #15
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Limited credit experience"

## Industry Guidance

> "This reason should be used when an applicant has a credit history/credit report but lacks a sufficient number of tradelines to satisfy the bank's standards. This reason can be used when reviewing either a credit report or credit references provided by the applicant."

## DSCR-Specific Application

**High DSCR relevance.** Many DSCR-eligible borrowers have a credit file but it's thin:

1. **Thin-file US borrower** (1-2 tradelines)
2. **ITIN borrower** with limited US credit history
3. **Young investor** (under 25) with limited credit history
4. **DSCR-Investor with DSCR ≥ 1.25** — most lenders allow 0-2 tradelines if DSCR is strong

**Lender policy on minimum tradelines**:
- **Newfi**: Minimum 3 tradelines for FN; 0 tradelines acceptable for DSCR-Investor with DSCR ≥ 1.25
- **Pennymac**: Minimum 4 tradelines (24-month history each) for DSCR-Full Doc
- **Griffin Funding**: Minimum 3 tradelines (12-month history)
- **Angel Oak**: Minimum 2 tradelines (24-month history)
- **Deephaven**: Minimum 1 tradeline (12-month history) for DSCR-Investor

**DSCR-specific triggers for Code 15**:
- Borrower has 2 tradelines, lender requires 4 → code 15
- ITIN borrower has 1 tradeline (secured credit card) → code 15
- Young investor (age 23) has 1 auto loan, no mortgage history → code 15

## Example Adverse Action Reason Text

> "Your credit experience does not meet our minimum requirements. Our standard requires a minimum of [N] open tradelines with [M]-month history each. Your credit report shows [K] tradelines, which does not meet our minimum. We may reconsider if additional tradelines are added to your credit history."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 15? |
|---|---|
| `LIMITED_CREDIT_EXPERIENCE` | YES (primary) |
| `INSUFFICIENT_TRADELINES` | YES (sub-trigger) |
| `THIN_FILE_2_TRADELINES` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi FN**: 3 tradelines minimum; 0 tradelines for DSCR-Investor ≥ 1.25
- **Pennymac DSCR-Full Doc**: 4 tradelines (24-month history)
- **Griffin Funding**: 3 tradelines (12-month history)
- **Angel Oak**: 2 tradelines (24-month history)
- **Deephaven**: 1 tradeline (12-month history) for DSCR-Investor

## Test Specification

```python
def test_code_15_text_verbatim():
    assert ECOA_REASON_TEXTS["15"] == "Limited credit experience"

def test_code_15_for_thin_file():
    ke = EnrichedKillEvent(
        trigger="LIMITED_CREDIT_EXPERIENCE",
        fico=640,  # file exists
    )
    assert "15" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Newfi, Pennymac, Griffin, Angel Oak, Deephaven product guidelines (T1_T2 sweep)
