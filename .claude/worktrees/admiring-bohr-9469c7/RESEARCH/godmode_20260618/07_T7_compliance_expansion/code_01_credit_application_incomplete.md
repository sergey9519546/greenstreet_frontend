---
type: research
status: drafted
confidence: 5
title: Code 01 — Credit Application Incomplete
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #1"
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - ml/shap
  - regulation/cfpb
  - regulation/ecoa
  - regulation/fcra
  - regulation/reg-b
  - slice/2
  - tax/pal
  - topic/non-qm
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/flood-insurance
  - topic/insurance
  - topic/tax
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_01_credit_application_incomplete.md
vaulted_at: 2026-06-20
---
# Code 01 — Credit Application Incomplete

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #1
**Source:** https://www.consumerfinance.gov/rules-policy/regulations/1002/C and Federal Reserve FRRS Form C-1 (https://www.federalreserve.gov/frrs/regulations/form-c-1-sample-notice-of-action-taken-and-statement-of-reasons-statement-of-credit-denial-termination-or-change.htm)
**Industry guidance:** Compliance Cohort, "Adverse Action Reasons Chart," Nov 12, 2024 (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)
**Confidence:** 5/5 (verified against three independent sources)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Credit application incomplete"

## Reg B Commentary / Industry Guidance (Compliance Cohort)

> "This reason should be used when a creditor denies an application due to incompleteness. **This reason should not be used if a creditor provides a notice of incomplete application in accordance with Regulation B** (as this would not be a denial requiring an adverse action notice)."

If a creditor sends a §1002.9(c) **Notice of Incompleteness** (with the 4 required elements: written, list missing items, reasonable deadline, statement of consequence), the file is **not denied** — no adverse action notice required. Code 01 is reserved for cases where the creditor **denies** the application outright (e.g., a DSCR lender declines to underwrite the file after multiple chase attempts).

## DSCR-Specific Application (Non-QM / DSCR Lender Perspective)

For DSCR (Debt Service Coverage Ratio) loans, the application package is materially larger than for agency loans because of the rental income component:

1. **Standard 1003 (URLA) — 5+ pages**: borrower info, subject property, declarations, loan request
2. **Rent documentation** (LTR): lease, rent roll, or appraisal Form 1007
3. **STR documentation**: 12-month rental history, AirDNA Rentalizer, future bookings (Pennymac, Newfi, Griffin, Angel Oak programs)
4. **Entity docs** (LLC/Trust vesting): Articles of Organization, Operating Agreement, Certificate of Good Standing, EIN confirmation (IRS 147C or 4501-C)
5. **Personal Guarantor (PG) financials**: 2 months bank statements (DSCR-Bank program) OR 2 years tax returns (DSCR-Full Doc), OR CPA letter (DSCR-CPA)
6. **Insurance binder** (Habitational, Flood if SFHA)
7. **Title commitment** (Schedule B-I/II exception review)

**DSCR-specific triggers for Code 01**:
- Borrower withdrew chase after 15 days → 3 chase attempts per Reg B comment 9(c)-2
- Appraised value came back "subject to" with repairs that borrower refuses to complete → file dies
- 60-day lock expired and borrower cannot produce updated income docs
- Pennymac 12-month STR history not produced (3rd chase returned)
- ITIN borrower cannot produce ITIN assignment letter + ID

## Example Adverse Action Reason Text

> "We have not received the information needed to complete your credit application. Specifically, we requested the following items: 12-month short-term rental history for the subject property, an AirDNA Rentalizer report, a copy of the Operating Agreement for the borrowing entity, and the Certificate of Good Standing from the [State] Secretary of State. Although we made three written requests for these items on [date 1], [date 2], and [date 3], the information was not received. As a result, we are unable to complete the evaluation of your application."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 01? |
|---|---|
| `INCOMPLETE_APPLICATION_15D` | YES (primary) |
| `MISSING_RENT_DOCS` | YES (sub-trigger) |
| `MISSING_ENTITY_DOCS` | YES (sub-trigger) |
| `MISSING_INSURANCE_BINDER` | YES (sub-trigger) |

**Slice 2 P0-4 logic**: If `kill_event.trigger == "INCOMPLETE_APPLICATION_15D"`, return `["01"]` plus the top SHAP feature (often 60 "Credit file" or 28 "Insufficient collateral"). Code 01 typically appears with **other codes** because incompleteness often correlates with documentation gaps that the lender can also characterize as "insufficient cash" or "unverifiable information."

## Lender-Specific Variants

- **Pennymac DSCR**: Uses "Withdrawn by broker" after 3 chase attempts; code 01 maps to "Incomplete credit application."
- **Newfi**: Allows the broker to call in for status; if 30 days stale and PG unavailable, code 01 with "Income unable to verify."
- **Griffin Funding**: Tracks 14-day chase with auto-reminder; code 01 if day-30 chase unanswered.
- **Angel Oak Mortgage Solutions**: Will issue §1002.9(c) Notice of Incompleteness first; code 01 only if the borrower fails the 30-day window.
- **Deephaven Mortgage**: Has a "Doc Genie" team that pre-screens for completeness pre-LOE; very few code 01 denials.

## Test Specification (pytest)

```python
def test_code_01_incomplete_application_principal_reason():
    """Code 01 must use the verbatim Form C-1 text."""
    assert ECOA_REASON_TEXTS["01"] == "Credit application incomplete"

def test_select_ecoa_codes_incomplete_15d_returns_01():
    """v16 IMP-06 kill_event INCOMPLETE_APPLICATION_15D -> ['01']."""
    ke = EnrichedKillEvent(trigger="INCOMPLETE_APPLICATION_15D")
    assert select_ecoa_codes(ke.trigger) == ["01"]

def test_code_01_disallowed_when_incomplete_notice_sent():
    """If creditor sent a Reg B 1002.9(c) notice, code 01 should NOT appear
    in the adverse action payload (no adverse action occurred)."""
    payload = build_adverse_action_notice(
        EnrichedKillEvent(trigger="INCOMPLETE_NOTICE_SENT")
    )
    codes = [r["code"] for r in payload["regulatory_notices"]["ecoa_notice"]["reasons"]]
    assert "01" not in codes
```

## Sources (verified)

1. eCFR Appendix C to Part 1002, https://www.ecfr.gov/current/title-12/chapter-X/part-1002/appendix-Appendix%20C%20to%20Part%201002
2. FRRS Form C-1, https://www.federalreserve.gov/frrs/regulations/form-c-1-sample-notice-of-action-taken-and-statement-of-reasons-statement-of-credit-denial-termination-or-change.htm
3. Compliance Cohort, "Adverse Action Reasons Chart," Nov 12, 2024, https://www.compliancecohort.com/blog/adverse-action-reasons-chart
4. CFPB Consumer Compliance Outlook, "Adverse Action Notice Requirements Under the ECOA and the FCRA," Q2 2013, https://www.consumercomplianceoutlook.org/2013/second-quarter/adverse-action-notice-requirements-under-ecoa-fcra/
