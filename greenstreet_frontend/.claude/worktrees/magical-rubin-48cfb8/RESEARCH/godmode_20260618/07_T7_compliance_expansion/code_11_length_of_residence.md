---
type: research
status: drafted
confidence: 5
title: Code 11 — Length of Residence
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #11"
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - topic/2-4-unit
  - topic/sfr
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_11_length_of_residence.md
vaulted_at: 2026-06-20
---
# Code 11 — Length of Residence

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #11
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Length of residence"

## Industry Guidance

> "This reason should be used when the applicant's length of residence does not comply with the financial institution's established minimum length of residence. (Note: this reason should only be used if a bank has a consistently applied minimum length of residence and the borrower does not meet the minimum requirements.)"

**Fair lending caution**: Per Compliance Cohort, "this reason should only be used if a bank has a consistently applied minimum length of residence and the borrower does not meet the minimum requirements." Using this reason without a defined, written minimum length-of-residence policy creates fair lending risk.

## DSCR-Specific Application

**Low DSCR relevance.** Most DSCR lenders do **not** require a minimum length of residence because the borrower typically is **not** occupying the property (it's a rental). However, this code may apply for:

1. **Owner-occupied DSCR** (rare — usually a 2-4 unit property where borrower lives in one unit) — lender may require 6-12 months at current residence
2. **DSCR-Primary residence** (hybrid program) — Pennymac, Newfi have "DSCR-Owner Occupied" pilot programs
3. **Subject property primary residence** — for borrower with multiple properties, length of residence at current address affects landlord profile (e.g., if subject is SFR and borrower has been at current address 2 years, the prior 3 years of rental history are needed)

**DSCR-specific triggers for Code 11**:
- Pennymac DSCR-Owner Occupied requires 12 months at current residence; borrower just moved → code 11
- Newfi requires 24 months at current residence for DSCR-Primary Residence program

## Example Adverse Action Reason Text

> "Your length of residence does not meet our minimum requirement. Our standard requires a minimum of [N] months at your current residence for [program type] loans. Your current length of residence is [M] months, which does not meet our minimum."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 11? |
|---|---|
| `LENGTH_OF_RESIDENCE_INSUFFICIENT` | YES (primary, rare) |

## Lender-Specific Variants

- **Newfi DSCR-Primary Residence**: 24 months minimum
- **Pennymac DSCR-Owner Occupied**: 12 months minimum
- **Griffin Funding**: No length of residence check for non-owner-occupied
- **Angel Oak**: No length of residence check

## Test Specification

```python
def test_code_11_text_verbatim():
    assert ECOA_REASON_TEXTS["11"] == "Length of residence"

def test_code_11_only_when_policy_exists():
    """Code 11 should only be used when lender has a defined minimum length of residence policy."""
    ke = EnrichedKillEvent(
        trigger="LENGTH_OF_RESIDENCE_INSUFFICIENT",
        property_type="SFR-OO",  # owner-occupied
    )
    assert "11" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
