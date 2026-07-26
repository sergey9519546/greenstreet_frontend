---
type: research
status: drafted
confidence: 5
title: Code 10 — Unable to Verify Income
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #10"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
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
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_10_unable_to_verify_income.md
vaulted_at: 2026-06-20
---
# Code 10 — Unable to Verify Income

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #10
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Unable to verify income"

## Industry Guidance

> "This adverse action reason should only be used when a financial institution makes an attempt to verify the income of the applicant but is unable to do so. The denied file should document the attempts that were made to verify income."

## DSCR-Specific Application

**Highly relevant for DSCR** because income verification is the single most complex underwriting step. For DSCR, the income being verified is the **rental income on the subject property**, not the borrower's W-2 income. Forms of income:

1. **Long-Term Rental (LTR)**: Lease agreement + rent roll + Form 1007 (Single Family Comparable Rent Schedule) + 2 months rent receipt evidence
2. **Short-Term Rental (STR)**: 12-month rental history from AirDNA / Airbnb / Vrbo + AirDNA Rentalizer forward projection
3. **DSCR-Bank Statement**: 12 or 24 months of personal or business bank statements showing rental deposits
4. **DSCR-Asset Depletion**: 36 months of liquid asset statements to "deplete" against proposed PITIA

**DSCR-specific triggers for Code 10**:
- Pennymac: 12-month STR history not produced → code 10
- Newfi: Subject property is vacant (no lease) and broker cannot produce rent estimate within 10% of 1007 → code 10
- Griffin: AirDNA Rentalizer shows $2,800/mo but borrower has no platform statements → code 10
- Angel Oak: Foreign National W-2 income cannot be verified through US tax transcripts (no IRS filing) → code 10
- Deephaven: DSCR-Asset Depletion — borrower has 50% of required liquid assets → code 10 + code 19

**Documentation**: For DSCR specifically, the lender must show that the income (rental) was attempted to be verified through at least 2 channels (e.g., 1007 + rent receipts).

## Example Adverse Action Reason Text

> "We were unable to verify the rental income for the subject property. Our standard practice for DSCR loans includes verification of [long-term rental income via lease and rent receipts / short-term rental income via 12-month platform history and AirDNA Rentalizer]. We requested [list specific items] on [date] and made follow-up requests on [date] and [date]. The rental income could not be verified. As a result, we were unable to confirm the debt service coverage ratio used to qualify your application."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 10? |
|---|---|
| `RENT_INCOME_UNVERIFIABLE` | YES (primary) |
| `STR_HISTORY_INSUFFICIENT` | YES (sub-trigger) |
| `LTR_NO_LEASE` | YES (sub-trigger) |
| `AIRDNA_UNAVAILABLE` | YES (sub-trigger) |
| `FOREIGN_INCOME_UNVERIFIABLE` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: STR — requires 12-month platform history; FN — requires US tax transcripts or foreign tax returns translated
- **Pennymac DSCR**: STR — AirDNA Rentalizer required; 1007 only acceptable for LTR
- **Griffin DSCR-Investor**: Allows short-rate quotes if subject property is stabilized
- **Angel Oak**: Foreign National — accepts foreign tax returns with apostille
- **Deephaven**: Allows DSCR-Asset Depletion path for income if DSCR-Investor fails

## Test Specification

```python
def test_code_10_text_verbatim():
    assert ECOA_REASON_TEXTS["10"] == "Unable to verify income"

def test_code_10_for_str_no_history():
    ke = EnrichedKillEvent(
        trigger="RENT_INCOME_UNVERIFIABLE",
        property_type="STR",
    )
    assert "10" in select_ecoa_codes(ke.trigger)

def test_code_10_with_dscr_value_audit():
    """Code 10 should include the proposed DSCR in the enriched context for audit."""
    ke = EnrichedKillEvent(
        trigger="RENT_INCOME_UNVERIFIABLE",
        actual_dscr=0.95,
        dscr_threshold=1.00,
    )
    payload = build_adverse_action_notice(ke)
    assert payload["regulatory_notices"]["ecoa_notice"]["enriched_context"]["actual_dscr"] == 0.95
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Pennymac DSCR Product Profile (T1_T2 sweep)
5. Newfi DSCR Lender Overlay (T1_T2 sweep)
