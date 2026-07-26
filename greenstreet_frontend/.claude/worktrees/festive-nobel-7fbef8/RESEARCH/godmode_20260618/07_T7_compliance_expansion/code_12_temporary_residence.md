---
type: research
status: drafted
confidence: 5
title: Code 12 — Temporary Residence
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #12"
entities:
  - concept/dscr
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - topic/sfr
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_12_temporary_residence.md
vaulted_at: 2026-06-20
---
# Code 12 — Temporary Residence

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #12
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Temporary residence"

## Industry Guidance

> "This reason should be used when a creditor knows that the current residence of the applicant is not a permanent residence."

**Fair lending caution**: Must be applied uniformly, with consistent policy. ECOA does not prohibit temporary residence per se, but if the creditor's policy disqualifies temporary residents, the policy must be written and consistently applied.

## DSCR-Specific Application

**Very low DSCR relevance.** Same as Code 11 — DSCR loans are non-owner-occupied by definition. Code 12 may apply in:

1. **Borrower has only a temporary residence** (e.g., staying with family, hotel, short-term rental) — for personal guarantor (PG) identity verification
2. **Subject property is the borrower's only residence** and the borrower declares intent to relocate within 12 months
3. **DSCR-Owner Occupied** hybrid program — borrower must have a permanent primary residence

**DSCR-specific triggers for Code 12**:
- Newfi DSCR-Primary: borrower lives in a hotel / extended-stay → code 12
- Pennymac DSCR-Owner Occupied: borrower is in a 6-month corporate housing lease → code 12

## Example Adverse Action Reason Text

> "Your current residence does not meet our standard for a permanent residence. Our standard requires a permanent residence of at least 12 months. Your current address [N months at current address] does not meet this standard. We may reconsider if you establish a permanent residence."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 12? |
|---|---|
| `TEMPORARY_RESIDENCE` | YES (primary, rare) |
| `PG_NO_PERMANENT_RESIDENCE` | YES (sub-trigger) |

## Lender-Specific Variants

- Most DSCR lenders do not use this code because the borrower is **not** occupying the subject property
- **Newfi DSCR-Primary Residence**: Rarely denies on this; broker can provide alternative documentation

## Test Specification

```python
def test_code_12_text_verbatim():
    assert ECOA_REASON_TEXTS["12"] == "Temporary residence"

def test_code_12_rare_dscr_use():
    """Code 12 is rare for DSCR; only applies to DSCR-Primary/Occupied programs."""
    ke = EnrichedKillEvent(
        trigger="TEMPORARY_RESIDENCE",
        property_type="SFR-OO",
    )
    assert "12" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
