---
type: research
status: drafted
confidence: 5
title: Code 22 — Number of Recent Inquiries on Credit Bureau Report
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #22"
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
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_22_excessive_inquiries.md
vaulted_at: 2026-06-20
---
# Code 22 — Number of Recent Inquiries on Credit Bureau Report

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #22
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Number of recent inquiries on credit bureau report"

## Industry Guidance

> "This reason should only be used when the number of recent credit inquiries exceeds the financial institution's established maximum number of credit inquiries."

## DSCR-Specific Application

**High DSCR relevance.** Inquiry overlays are common for DSCR because investors shop multiple lenders. Most DSCR lenders have an inquiry policy:

- **Newfi**: 6 inquiries in last 6 months
- **Pennymac DSCR**: 5 inquiries in last 120 days (excluding mortgage and student loan inquiries)
- **Griffin Funding**: 4 inquiries in last 120 days
- **Angel Oak**: 6 inquiries in last 6 months
- **Deephaven**: 6 inquiries in last 6 months

**Excluded inquiries** (typically not counted):
- Mortgage inquiries (auto-LOX pulls)
- Student loan inquiries
- Promotional/pre-screened inquiries
- The DSCR lender's own inquiry (auto-soft pull)

**DSCR-specific triggers for Code 22**:
- Tri-merge shows 7 inquiries in last 6 months; lender allows 6 → code 22
- Tri-merge shows 4 mortgage inquiries (broker shopping) + 3 revolving → code 22 if lender counts all
- Tri-merge shows 5 mortgage inquiries + 1 revolving → most lenders exclude mortgage → may not trigger code 22

## Example Adverse Action Reason Text

> "Your credit report shows a number of recent credit inquiries that exceeds our standard. Specifically, your credit report reflects [N] inquiries in the last [6 months / 120 days]. Our standard allows a maximum of [M] inquiries in this period. Excessive recent credit inquiries may indicate over-extension or shopping for credit."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 22? |
|---|---|
| `EXCESSIVE_INQUIRIES` | YES (primary) |
| `INQUIRIES_OVER_6_IN_6MO` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 6 inquiries in last 6 months
- **Pennymac**: 5 inquiries in last 120 days
- **Griffin Funding**: 4 inquiries in last 120 days
- **Angel Oak**: 6 inquiries in last 6 months
- **Deephaven**: 6 inquiries in last 6 months

## Test Specification

```python
def test_code_22_text_verbatim():
    assert ECOA_REASON_TEXTS["22"] == "Number of recent inquiries on credit bureau report"

def test_code_22_for_excessive_inquiries():
    ke = EnrichedKillEvent(
        trigger="EXCESSIVE_INQUIRIES",
        fico=680,
    )
    assert "22" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Newfi, Pennymac, Griffin, Angel Oak, Deephaven product guidelines
