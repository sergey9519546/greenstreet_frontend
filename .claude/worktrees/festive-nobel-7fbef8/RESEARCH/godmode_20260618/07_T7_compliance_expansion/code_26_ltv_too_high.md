---
type: research
slice: 1
status: drafted
confidence: 4
title: Code 26 — Loan-to-Value (LTV) Ratio Too High
summary: "**Reg B Reference:** Maps to Form C-1 code 23 (Value or type of collateral not sufficient) when used as the LTV-related principal reason. For DSCR, this is a **DSCR-specific sub-reason** of Code 23, expressed as a more specific \"LTV too high\" text per CFPB Circular 2022-03 specificity requirement."
entities:
  - concept/dscr
  - concept/ltv
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/cfpb
  - regulation/ecoa
  - regulation/fcra
  - regulation/reg-b
  - slice/1
  - tax/pal
  - topic/2-4-unit
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/short-rate
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_26_ltv_too_high.md
vaulted_at: 2026-06-20
---
# Code 26 — Loan-to-Value (LTV) Ratio Too High

**Reg B Reference:** Maps to Form C-1 code 23 (Value or type of collateral not sufficient) when used as the LTV-related principal reason. For DSCR, this is a **DSCR-specific sub-reason** of Code 23, expressed as a more specific "LTV too high" text per CFPB Circular 2022-03 specificity requirement.

**Confidence:** 4/5 (not a separate Reg B code; lender convention)
**Source:** CFPB Circular 2022-03 specificity requirement; Slice 1 `ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX`

**NOTE:** The Slice 1 `ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX = "26"` uses a different verbatim text ("You requested an amount that exceeds the maximum loan amount permitted by our regulations.") which is the legacy FCRA Appendix C form. For DSCR LTV-specific denial, the more specific text "Loan-to-value (LTV) ratio is too high" is preferred per CFPB Circular 2022-03.

---

## Canonical Text (DSCR lender convention)

> "Loan-to-value (LTV) ratio of [N]% exceeds our maximum of [M]% for this property type and program."

## Industry Guidance

CFPB Circular 2022-03 (issued May 26, 2022; published 87 FR 37831, June 14, 2022) clarified that **specific, accurate, and comprehensible reasons** are required for AI/ML credit decisions. Generic "collateral insufficient" is **insufficient** — the lender must specify the **specific** principal reason (LTV breach, property type, etc.).

## DSCR-Specific Application

**Critical for DSCR.** LTV is the most common collateral-related denial. DSCR lender LTV caps:

| Lender | LTR LTV Max | STR LTV Max | 2-4 Unit LTV | High-LTV Markets |
|---|---|---|---|---|
| **Newfi** | 80% | 75% | 75% | 70% (CT, FL, IL, NJ, NY) |
| **Pennymac** | 80% | 75% | 75% | 75% |
| **Griffin** | 80% | 75% | 75% | 70% |
| **Angel Oak** | 80% | 75% | 75% | 70% |
| **Deephaven** | 80% | 75% | 75% | 75% |

**DSCR-specific triggers for Code 26**:
- Appraised value $500K; loan amount $425K → LTV 85%; lender max 80% → code 26
- Appraised value $400K; loan amount $320K → LTV 80% on borderline; lender rounds down → code 26
- Property in declining market (Bridgeport CT); lender cap reduced to 70% → code 26
- Subject is STR (AirDNA); STR cap 75% but loan hits 78% → code 26

**Distinction from Code 23 (Value or type of collateral not sufficient)**: Code 26 is the **specific LTV** sub-reason. Use code 26 when LTV is the principal reason; use code 23 when both LTV and property type are issues.

**Distinction from Slice 1 ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX**: The legacy text "You requested an amount that exceeds the maximum loan amount permitted by our regulations" is a different concept — it's about the **loan amount** cap (e.g., $4M lender max), not the **LTV ratio**. Both can be retained as separate codes; see Code 30 for "Loan amount exceeds lender maximum."

## Example Adverse Action Reason Text

> "The loan-to-value (LTV) ratio of [N]% for the subject property exceeds our maximum of [M]% for this property type and program. The LTV is calculated as the proposed loan amount of $[X] divided by the appraised value of $[Y]. [If declining market: The subject property is located in a declining market area, which has a reduced LTV cap of [M]%.]"

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 26? |
|---|---|
| `LTV_OVER_MAX` | YES (primary) |
| `LTV_80_TO_90` | YES (sub-trigger) |
| `LTV_OVER_90` | YES (sub-trigger) |
| `DECLINING_MARKET_LTV` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 80% LTR / 75% STR / 75% 2-4 / 70% declining
- **Pennymac**: 80% LTR / 75% STR / 75% 2-4
- **Griffin**: 80% LTR / 75% STR / 75% 2-4
- **Angel Oak**: 80% LTR / 75% STR / 75% 2-4
- **Deephaven**: 80% LTR / 75% STR / 75% 2-4

## Test Specification

```python
def test_code_26_text_ltv_specific():
    assert "LTV" in ECOA_REASON_TEXTS["26"] or "loan-to-value" in ECOA_REASON_TEXTS["26"].lower()

def test_code_26_for_ltv_breach():
    ke = EnrichedKillEvent(
        trigger="LTV_OVER_MAX",
        actual_ltv=0.85,
        ltv_threshold=0.80,
    )
    assert "26" in select_ecoa_codes(ke.trigger)

def test_code_26_ltv_over_90_vs_80_to_90():
    """CFPB Circular 2022-03 requires specificity; LTV > 90% may warrant a different code."""
    ltv_85 = EnrichedKillEvent(trigger="LTV_OVER_MAX", actual_ltv=0.85, ltv_threshold=0.80)
    ltv_95 = EnrichedKillEvent(trigger="LTV_OVER_MAX", actual_ltv=0.95, ltv_threshold=0.80)
    # Both should trigger code 26, but enriched context should differ
    payload_85 = build_adverse_action_notice(ltv_85)
    payload_95 = build_adverse_action_notice(ltv_95)
    assert payload_85["regulatory_notices"]["ecoa_notice"]["enriched_context"]["actual_ltv"] == 0.85
    assert payload_95["regulatory_notices"]["ecoa_notice"]["enriched_context"]["actual_ltv"] == 0.95
```

## Sources

1. CFPB Consumer Financial Protection Circular 2022-03, https://www.consumerfinance.gov/compliance/circulars/circulars-archive/
2. Slice 1 ECOA_CODE_26 (legacy FCRA text, to be deprecated for LTV-specific use)
3. Newfi, Pennymac, Griffin, Angel Oak, Deephaven LTV matrices (T1_T2 sweep)
