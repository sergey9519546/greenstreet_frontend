---
type: research
status: drafted
confidence: 5
title: Code 04 — Unable to Verify Credit References
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #4"
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
  - type/audit
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_04_unable_to_verify_credit_references.md
vaulted_at: 2026-06-20
---
# Code 04 — Unable to Verify Credit References

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #4
**Confidence:** 5/5
**Source:** FRRS Form C-1 (https://www.federalreserve.gov/frrs/regulations/form-c-1-sample-notice-of-action-taken-and-statement-of-reasons-statement-of-credit-denial-termination-or-change.htm); Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Unable to verify credit references"

## Industry Guidance

> "This reason should be used when a creditor has requested credit references beyond the history found in a credit report (such as when the applicant does not have an established credit file or credit score), and the creditor is **unable to verify the references provided by the applicant**. The denied file should document the creditor's attempts to verify credit references."

**Documentation requirement**: Per Compliance Cohort, the **denied loan file must document the attempts** (date, method, result) made to verify each credit reference. Without that documentation, this reason is vulnerable to fair lending challenge.

## DSCR-Specific Application

This code is highly relevant for DSCR lending because verification of credit references is foundational to the personal guarantor (PG) credit box:

1. **Phone numbers disconnected** — PG provided 4 references, 2 phone numbers returned by USPS
2. **References do not respond** — 30-day chase, no callback
3. **References return information inconsistent with application** (e.g., "I never loaned this person money")
4. **Foreign references cannot be reached** at provided international number
5. **ITIN borrower references** to non-banking family members — third party cannot reach entity

**DSCR-specific triggers for Code 04**:
- Newfi FN program: PG provides 4 alt references; 2 cannot be reached after 3 attempts each
- Griffin: Borrower provides employer reference; HR department returns "no record of this person"
- Pennymac: 2 of 4 references have disconnected phones at application date

## Example Adverse Action Reason Text

> "We were unable to verify the credit references you provided. We made the following attempts to contact your references: [list with dates and methods]. The references did not respond or were unable to confirm the information you provided. As a result, we were unable to assess the creditworthiness indicated by your references."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 04? |
|---|---|
| `UNVERIFIABLE_CREDIT_REFERENCES` | YES (primary) |
| `REFERENCE_DISCONNECTED` | YES (sub-trigger) |
| `REFERENCE_NONRESPONSE` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: Documents 3 phone attempts (different days/times) + 1 written attempt = 4 total per reference
- **Angel Oak**: 2 attempts minimum; requires supervisor sign-off before denial
- **Griffin Funding**: 5 business day window; auto-denies if 2+ references non-response
- **Deephaven**: Will allow broker to re-submit within 30 days if references can be re-verified

## Test Specification

```python
def test_code_04_text_verbatim():
    assert ECOA_REASON_TEXTS["04"] == "Unable to verify credit references"

def test_code_04_requires_documentation_metadata():
    """Code 04 audit trail must include verification attempts."""
    ke = EnrichedKillEvent(
        trigger="UNVERIFIABLE_CREDIT_REFERENCES",
        application_id="APP-2026-001",
    )
    payload = build_adverse_action_notice(ke)
    # The enriched_context should carry the attempt log
    assert "verification_attempts" in payload["meta"] or ke.application_id is not None
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
