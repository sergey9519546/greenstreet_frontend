---
type: research
status: drafted
confidence: 5
title: Code 03 — Unacceptable Type of Credit References Provided
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #3"
entities:
  - concept/arm
  - concept/dscr
  - lender/angel-oak
  - lender/griffin-funding
  - lender/newfi
  - regulation/ecoa
  - regulation/reg-b
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_03_unacceptable_credit_references.md
vaulted_at: 2026-06-20
---
# Code 03 — Unacceptable Type of Credit References Provided

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #3
**Confidence:** 5/5
**Source:** FRRS Form C-1 (https://www.federalreserve.gov/frrs/regulations/form-c-1-sample-notice-of-action-taken-and-statement-of-reasons-statement-of-credit-denial-termination-or-change.htm); Compliance Cohort, Nov 12, 2024 (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Unacceptable type of credit references provided"

## Industry Guidance

> "This reason should be used when a creditor has requested credit references beyond the history found in a credit report (such as when the applicant does not have an established credit file or credit score), and the applicant provided credit references that were not acceptable according to the financial institutions defined standards."

## DSCR-Specific Application

For DSCR loans, "unacceptable type" most commonly arises with:

1. **Non-US bank references** (e.g., Canadian or UK bank statements) — most US DSCR lenders require **US-based, US-dollar, FDIC-insured** references
2. **Crypto exchange references** (Coinbase, Kraken) — not a "bank" in the US sense
3. **Family or self-references** (where the borrower is the source of credit)
4. **Foreign government lending entities** without US correspondent banking
5. **Prepaid card or fintech-only relationships** (Chime, Cash App, Revolut)

**DSCR-specific triggers for Code 03**:
- Foreign National provides 3 references, all from non-US banks → fails "US-based bank" policy
- Borrower provides references from 3 BNPL (buy-now-pay-later) platforms → fails "traditional installment credit" definition
- Borrower provides references to 2 family members and 1 employer → fails "arm's length" requirement

## Example Adverse Action Reason Text

> "The credit references you provided were of a type that is not acceptable to us. Specifically, our standard requires credit references from US-based, FDIC-insured financial institutions, traditional installment credit, or major US credit card issuers. You provided references from [list unacceptable types: e.g., 'a non-US bank', 'a cryptocurrency exchange', 'a buy-now-pay-later platform'], which are not acceptable under our underwriting guidelines."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 03? |
|---|---|
| `UNACCEPTABLE_CREDIT_REFERENCE_TYPE` | YES (primary) |
| `NON_US_BANK_REFERENCE` | YES (sub-trigger) |
| `FAMILY_REFERENCE` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: "US-based US-dollar bank account" requirement; 3 alt references must include ≥1 US bank
- **Angel Oak**: Accepts non-US references if 12-month history is documented with US correspondent
- **Griffin Funding**: Specifically excludes crypto exchanges; lists 12 acceptable institution types

## Test Specification

```python
def test_code_03_text_verbatim():
    assert ECOA_REASON_TEXTS["03"] == "Unacceptable type of credit references provided"

def test_code_03_for_crypto_reference():
    ke = EnrichedKillEvent(
        trigger="UNACCEPTABLE_CREDIT_REFERENCE_TYPE",
        rent_monthly=None,
    )
    assert "03" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
