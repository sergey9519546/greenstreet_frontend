---
type: research
status: drafted
confidence: 5
title: Code 05 — Temporary or Irregular Employment
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #5"
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
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_05_temporary_irregular_employment.md
vaulted_at: 2026-06-20
---
# Code 05 — Temporary or Irregular Employment

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #5
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Temporary or irregular employment"

## Industry Guidance

> "This reason should be used **only if the financial institution has a defined policy** regarding acceptable temporary or irregular employment, and the borrower's employment history does not meet the definition of acceptable temporary or irregular employment."

**Cautionary note**: This reason **must not be used as a proxy for age discrimination**. Reg B §1002.6(b)(1) prohibits discrimination based on age (provided the applicant has capacity to contract). "Temporary employment" must be applied uniformly, not as a function of age.

## DSCR-Specific Application

For DSCR loans, this reason is **rarely used** because the loan is qualified on **rental income** (DSCR), not borrower employment income. However, it can arise in:

1. **PG employment history review** — required for some DSCR-Bank Statement programs (12-24 months history)
2. **W-2 wage earner DSCR programs** (Pennymac, Newfi) — full income documentation
3. **DSCR-VoE** (Verification of Employment) — required by some lenders for the PG

**DSCR-specific triggers for Code 05**:
- PG is gig worker (Uber, DoorDash) with <24 months of stable income
- PG works in seasonal industry (e.g., fishing, agriculture) with documented off-season gaps
- PG is 1099 contractor with W-2 history of <12 months
- PG has multiple job changes in 24 months (DSCR-VoE reveals <2 years at current employer)

**Special exemption**: DSCR-Investor programs (Newfi, Griffin) that use DSCR ≥ 1.00 and **waive** PG employment verification typically do NOT use Code 05 because the income is property-based.

## Example Adverse Action Reason Text

> "The employment history you provided does not meet our standard for stable, continuing employment. Our standard requires a minimum of 24 months of continuous employment in the same or related field, or 24 months of self-employment with documented year-over-year revenue stability. Your employment history shows [describe gaps, changes, or irregularities] which does not meet this standard."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 05? |
|---|---|
| `EMPLOYMENT_HISTORY_INSUFFICIENT` | YES (primary) |
| `GIG_WORKER_DSCR_BANK` | YES (sub-trigger) |
| `SEASONAL_INCOME_DSCR` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi DSCR-Bank**: Requires 24-month PG employment history; code 05 if <24
- **Pennymac DSCR-Full Doc**: W-2 wage earner — 2 years at current employer; code 05 if <2
- **Angel Oak DSCR-Investor**: Waives employment verification if DSCR ≥ 1.25
- **Griffin DSCR-Bank Statement**: 12-month personal bank statements can substitute for VoE in some cases
- **Deephaven DSCR**: Has a "gig worker exception" if DSCR ≥ 1.50

## Test Specification

```python
def test_code_05_text_verbatim():
    assert ECOA_REASON_TEXTS["05"] == "Temporary or irregular employment"

def test_code_05_gig_worker_dscr():
    ke = EnrichedKillEvent(
        trigger="EMPLOYMENT_HISTORY_INSUFFICIENT",
        fico=680,
    )
    assert "05" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Reg B §1002.6(b)(1) age discrimination prohibition
