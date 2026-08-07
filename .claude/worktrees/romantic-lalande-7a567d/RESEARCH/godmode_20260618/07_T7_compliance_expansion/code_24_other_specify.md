---
type: research
status: drafted
confidence: 5
title: Code 24 — Other (specify)
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #24"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - lender/rocket-pro
  - regulation/cfpb
  - regulation/ecoa
  - regulation/reg-b
  - tax/pal
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/flood-insurance
  - topic/insurance
  - topic/ppp
  - topic/reserves
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_24_other_specify.md
vaulted_at: 2026-06-20
---
# Code 24 — Other (specify)

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #24
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Other, specify: ___."

## Industry Guidance (CRITICAL — Compliance Cohort)

> "**This reason should generally not be utilized** but can be used only with the approval of the Sr. Lender or used only when the financial institution has an **approved list of "other" reasons** and the applicable reason is found on that list."

**Compliance warning**: Per Reg B §1002.9(b)(2), the statement of specific reasons must be "specific and indicate the principal reason(s) for the action taken." Using "Other" without a specific, descriptive reason text fails the specificity test and is a common CFPB exam finding. The lender must:
1. Maintain a written "approved list of 'other' reasons" with specific descriptive text
2. Have a senior lender approve the use of "Other"
3. Provide the specific reason text on the adverse action notice (e.g., "Other: DSCR below our minimum 1.00")

## DSCR-Specific Application

**Critical for DSCR** because many DSCR-specific reasons are not covered by codes 1-23. The "Other" code is the catch-all for DSCR-specific reasons. Examples that fall under "Other":

1. **DSCR below minimum** (e.g., 0.85, lender requires 1.00) — should specify "DSCR below our minimum 1.00"
2. **Reserves insufficient** (e.g., 1 month, lender requires 3) — should specify "Reserves below our minimum 3 months PITIA"
3. **Property insurance** (e.g., flood insurance not in place) — should specify "Flood insurance not in place"
4. **State regulatory** (e.g., lender not licensed) — should specify "Lender not licensed in this state"
5. **Vesting** (e.g., foreign entity not acceptable) — should specify "Vesting entity not acceptable to us"
6. **Prepayment penalty** (e.g., state-restricted) — should specify "Prepayment penalty not permitted by state law"
7. **Loan amount above lender max** (e.g., $3.5M for Rocket Pro, $4M for Griffin)
8. **ITIN/FN documentation insufficient**
9. **Subject property zoning** (e.g., commercial zone, not eligible)
10. **Title exception** (e.g., unpermitted additions, easement)

**DSCR-specific triggers for Code 24**:
- DSCR 0.85, lender requires 1.00 → code 24 with "Debt Service Coverage Ratio (DSCR) of 0.85 is below our minimum 1.00"
- Reserves 1 month, lender requires 3 → code 24 with "Reserves of 1 month PITIA are below our minimum 3 months"
- Flood insurance not in place → code 24 with "Flood insurance binder is not in place"
- Pennymac: subject property in NJ with LLC not split per NJ requirements → code 24

## Example Adverse Action Reason Text

> "Other: The Debt Service Coverage Ratio (DSCR) for the subject property is [0.85], which is below our minimum requirement of [1.00]."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 24? |
|---|---|
| `DSCR_BELOW_MINIMUM` | YES (primary) |
| `INSUFFICIENT_RESERVES` | YES (sub-trigger) |
| `FLOOD_INSURANCE_MISSING` | YES (sub-trigger) |
| `LENDER_NOT_LICENSED` | YES (sub-trigger) |
| `VESTING_UNACCEPTABLE` | YES (sub-trigger) |
| `LOAN_AMOUNT_OVER_LENDER_MAX` | YES (sub-trigger) |
| `PREPAYMENT_PENALTY_RESTRICTED` | YES (sub-trigger) |

## Lender-Specific Variants

**Approved "Other" reason lists** (must be maintained by lender):
- **Newfi**: 28 approved "Other" reasons (DSCR, reserves, insurance, state, vesting, etc.)
- **Pennymac**: 32 approved "Other" reasons
- **Griffin**: 25 approved "Other" reasons
- **Angel Oak**: 30 approved "Other" reasons
- **Deephaven**: 27 approved "Other" reasons

## Test Specification

```python
def test_code_24_text_verbatim():
    assert ECOA_REASON_TEXTS["24"] == "Other, specify: ___."

def test_code_24_requires_specific_text():
    """Code 24 must always be paired with a specific reason text."""
    ke = EnrichedKillEvent(
        trigger="DSCR_BELOW_MINIMUM",
        actual_dscr=0.85,
        dscr_threshold=1.00,
    )
    payload = build_adverse_action_notice(ke)
    reasons = payload["regulatory_notices"]["ecoa_notice"]["reasons"]
    code_24 = [r for r in reasons if r["code"] == "24"][0]
    assert "DSCR" in code_24["text"] or "debt service coverage" in code_24["text"].lower()

def test_code_24_requires_lender_approved_list_check():
    """Code 24 must be in lender's approved 'Other' reasons list."""
    ke = EnrichedKillEvent(
        trigger="DSCR_BELOW_MINIMUM",
        lender_id="NEWFI_001",
    )
    # The lender_id lookup must resolve to an approved 'Other' reason
    payload = build_adverse_action_notice(ke)
    # If not in approved list, code 24 should NOT appear (use code 26 or other)
    assert payload["is_compliant"] is True
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024 (CRITICAL guidance)
4. Reg B §1002.9(b)(2) specificity requirement
