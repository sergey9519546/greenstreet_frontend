---
type: research
status: drafted
confidence: 5
title: Code 16 — Poor Credit Performance With Us
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #16"
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
  - topic/portfolio
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_16_poor_credit_with_us.md
vaulted_at: 2026-06-20
---
# Code 16 — Poor Credit Performance With Us

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #16
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Poor credit performance with us"

## Industry Guidance

> "This reason should be used when the applicant has a history of poor credit performance with our financial institution. The denied file should provide evidence of late payments with us and other evidence of poor credit performance with us (such as charge offs)."

**Key scope**: This reason is **institution-specific** — it applies when the applicant has prior loans/accounts with **the same lender** (not a third party). It typically does not apply to first-time applicants.

## DSCR-Specific Application

**Medium DSCR relevance.** Most DSCR loans are with new lenders, so this reason is uncommon. However, it applies when:

1. **Borrower has prior loan with same DSCR lender** (e.g., refinance or second loan) — and prior loan has 30+ day late
2. **Borrower is repeat customer** with charge-off on prior loan
3. **Bank portfolio lender** that has prior mortgage with the same bank

**DSCR-specific triggers for Code 16**:
- Newfi portfolio: borrower has prior Newfi DSCR loan with 60-day late in last 12 months → code 16
- Griffin Funding: repeat customer with prior loan charge-off → code 16
- Bank portfolio (e.g., private bank DSCR program): borrower has prior mortgage with same bank with 90-day late → code 16

**Distinction from Code 17 (Delinquent past or present credit obligations with others)**: Code 16 = **with us** (the lender). Code 17 = **with others** (third parties).

## Example Adverse Action Reason Text

> "Our records show that you have a history of poor credit performance with [Lender Name]. Specifically, on [date] you had a 60-day past due balance on a prior loan with us, and on [date] you had a 30-day past due on the same loan. This history does not meet our standard for new credit."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 16? |
|---|---|
| `PRIOR_LOAN_LATE_WITH_US` | YES (primary) |
| `PRIOR_LOAN_CHARGEOFF_US` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: Tracks repeat customer performance
- **Pennymac**: Tracks prior loan performance
- **Griffin Funding**: Tracks repeat customer
- **Angel Oak**: Portfolio lender — uses Code 16 for repeat performance
- **Deephaven**: Tracks repeat customer

## Test Specification

```python
def test_code_16_text_verbatim():
    assert ECOA_REASON_TEXTS["16"] == "Poor credit performance with us"

def test_code_16_for_repeat_customer_late():
    ke = EnrichedKillEvent(
        trigger="PRIOR_LOAN_LATE_WITH_US",
        fico=720,  # otherwise good
    )
    assert "16" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
