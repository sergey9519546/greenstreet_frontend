---
type: research
status: drafted
confidence: 5
title: Code 13 — Unable to Verify Residence
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #13"
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - topic/sfr
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_13_unable_to_verify_residence.md
vaulted_at: 2026-06-20
---
# Code 13 — Unable to Verify Residence

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #13
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Unable to verify residence"

## Industry Guidance

> "This reason should be used when a creditor has attempted, but is unable to verify the residence of the applicant. The denied file should document the creditor's attempts to verify residency."

## DSCR-Specific Application

**Low-medium DSCR relevance.** Verification of residence is typically straightforward for DSCR (utility bills, driver's license, lease, bank statement address). However, this code may apply in:

1. **PG address cannot be verified** — driver's license address doesn't match bank statement address
2. **Subject property address** — new construction, address not yet in USPS database
3. **Foreign National PG** — no US address, foreign address cannot be verified
4. **ITIN PG** — no US credit history at address
5. **Subject property is in a rural area** — USPS delivery may not be standard

**DSCR-specific triggers for Code 13**:
- Pennymac: Subject property is a new build; appraisal shows address not yet in USPS database → code 13
- Newfi: Foreign National PG provides foreign address; US TWN returns no record → code 13
- Griffin: Borrower provides PO Box as only address (no physical residence) → code 13

## Example Adverse Action Reason Text

> "We were unable to verify your residence. Our standard practice includes verification through [utility bills, bank statements, driver's license, USPS database]. We requested verification of your current residence on [date] and made follow-up requests on [date] and [date]. The residence could not be verified."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 13? |
|---|---|
| `RESIDENCE_UNVERIFIABLE` | YES (primary) |
| `PO_BOX_ONLY` | YES (sub-trigger) |
| `NEW_CONSTRUCTION_NO_USPS` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: Allows foreign addresses for FN program if 12-month US bank statement present
- **Pennymac**: Requires USPS-verifiable address for new construction
- **Griffin Funding**: Accepts PO Box + physical address combination
- **Angel Oak**: Allows FN with no US address
- **Deephaven**: Requires physical US address (not PO Box) for non-ITIN

## Test Specification

```python
def test_code_13_text_verbatim():
    assert ECOA_REASON_TEXTS["13"] == "Unable to verify residence"

def test_code_13_for_foreign_national_no_us_address():
    ke = EnrichedKillEvent(
        trigger="RESIDENCE_UNVERIFIABLE",
        property_type="SFR",
    )
    assert "13" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
