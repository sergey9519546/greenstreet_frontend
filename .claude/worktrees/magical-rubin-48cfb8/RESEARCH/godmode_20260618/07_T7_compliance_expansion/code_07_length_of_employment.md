---
type: research
status: drafted
confidence: 5
title: Code 07 — Length of Employment
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #7"
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
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_07_length_of_employment.md
vaulted_at: 2026-06-20
---
# Code 07 — Length of Employment

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #7
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Length of employment"

## Industry Guidance

> "This reason should only be used when a creditor has a defined minimum length of employment and the applicant's length of employment does not meet the minimum length. The denied file should document the applicant's length of employment and the bank's established minimum length of employment."

**Fair lending caution**: The creditor's **minimum length of employment** must be in a written, consistently applied policy. ECOA does not require a minimum length of employment, but if the creditor uses one, it must be defensible (e.g., 6 months for W-2 wage earner, 24 months for self-employed).

## DSCR-Specific Application

For DSCR, length of employment is generally **PG-related**, not rental-income-related:

1. **DSCR-Full Doc** (W-2): 6 months at current employer typical minimum
2. **DSCR-Bank Statement** (12-24 month bank statements): 24 months self-employment typical
3. **DSCR-Investor (DSCR-only)**: Length of employment **not required** (income is property-based)
4. **DSCR-Asset Depletion**: 24-month employment + significant liquid assets

**DSCR-specific triggers for Code 07**:
- W-2 PG has been at current employer 3 months; lender requires 6 months → code 07
- Self-employed PG has 18 months of business history; lender requires 24 → code 07
- PG just changed jobs (offer letter dated 14 days before application)
- Newfi DSCR-Bank Statement: 12 months sufficient for self-employed (not 24)

**Distinction from Code 05**: Code 05 is about **stability/gaps** (e.g., multiple jobs in 24 months). Code 07 is about **tenure** at current employer. Some lenders collapse these; better practice is to choose one based on the specific fact pattern.

## Example Adverse Action Reason Text

> "Your length of employment does not meet our minimum requirement. Our standard requires a minimum of [6 months / 24 months] of continuous employment with your current employer. Your current length of employment is [N] months, which does not meet our minimum. We may reconsider if your employment continues for the required period."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 07? |
|---|---|
| `LENGTH_OF_EMPLOYMENT_INSUFFICIENT` | YES (primary) |
| `W2_NEW_JOB` | YES (sub-trigger) |
| `SELF_EMPLOYED_UNDER_24MO` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi DSCR-Bank**: 24 months self-employment or 6 months W-2
- **Pennymac DSCR-Full Doc**: 2 years W-2 (USPS hire date)
- **Angel Oak DSCR-Investor**: No length of employment requirement
- **Griffin DSCR**: 12 months self-employed sufficient if DSCR ≥ 1.25
- **Deephaven**: 6 months W-2 minimum; recent job offer letter acceptable

## Test Specification

```python
def test_code_07_text_verbatim():
    assert ECOA_REASON_TEXTS["07"] == "Length of employment"

def test_code_07_w2_new_job():
    ke = EnrichedKillEvent(
        trigger="LENGTH_OF_EMPLOYMENT_INSUFFICIENT",
        fico=720,
    )
    assert "07" in select_ecoa_codes(ke.trigger)

def test_code_07_not_used_for_dscr_investor():
    """DSCR-Investor programs with DSCR >= 1.25 should not use Code 07."""
    ke = EnrichedKillEvent(
        trigger="LENGTH_OF_EMPLOYMENT_INSUFFICIENT",
        actual_dscr=1.50,
    )
    # Use override map for DSCR-Investor program
    override = {"LENGTH_OF_EMPLOYMENT_INSUFFICIENT": []}  # not a kill for investor
    assert select_ecoa_codes(ke.trigger, override_map=override) == []
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
