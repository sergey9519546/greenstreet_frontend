---
type: research
status: drafted
confidence: 4
title: Code 27 — Reserves Insufficient
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with reserves-specific text. Some lenders use code 19 (Garnishment) or code 21 (Excessive obligations) but reserves is its own principal reason. CFPB Circular 2022-03 requires specificity."
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/cfpb
  - regulation/ecoa
  - regulation/reg-b
  - slice/1
  - tax/pal
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/insurance
  - topic/reserves
  - topic/short-rate
  - topic/tax
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_27_reserves_insufficient.md
vaulted_at: 2026-06-20
---
# Code 27 — Reserves Insufficient

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with reserves-specific text. Some lenders use code 19 (Garnishment) or code 21 (Excessive obligations) but reserves is its own principal reason. CFPB Circular 2022-03 requires specificity.

**Confidence:** 4/5 (not a separate Reg B code; lender convention)
**Source:** CFPB Circular 2022-03 specificity requirement

---

## Canonical Text (DSCR lender convention)

> "Reserves of [N] months PITIA are below our minimum requirement of [M] months PITIA."

## DSCR-Specific Application

**Critical for DSCR.** Reserves are a major DSCR credit overlay. Most DSCR lenders require:

| Lender | Min Reserves (DSCR ≥ 1.25) | Min Reserves (DSCR < 1.25) | Min Reserves (FN/ITIN) |
|---|---|---|---|
| **Newfi** | 3 months PITIA | 6 months PITIA | 6 months PITIA |
| **Pennymac** | 3 months PITIA | 6 months PITIA | 6 months PITIA |
| **Griffin** | 3 months PITIA | 6 months PITIA | 6 months PITIA |
| **Angel Oak** | 3 months PITIA (DSCR-Investor+) | 6 months PITIA | 6 months PITIA |
| **Deephaven** | 3 months PITIA | 6 months PITIA | 6 months PITIA |

**Reserves calculation**: Post-closing liquid assets, verified through:
- 2 most recent bank statements (all pages)
- 401k/IRA/SEP-IRA (60-70% of vested balance, depending on lender)
- Stocks/bonds (80% of liquidatable value)
- Gift funds (DSCR programs vary; some don't allow gifts)
- Cross-accounted reserves (for multi-property investors)

**DSCR-specific triggers for Code 27**:
- PG has $50K liquid; loan needs $60K (3 mo PITIA on $2K/mo PITIA) → code 27
- DSCR 1.45; lender requires 3 mo PITIA; PG has 2.5 mo → code 27
- DSCR 0.95; lender requires 6 mo PITIA; PG has 4 mo → code 27
- Reserves in 401k count at 60% but borrower expected 100% → code 27

**Distinction from Slice 1 ECOA_CODE_19_INCOME_INSUFFICIENT**: The current Slice 1 mapping `INSUFFICIENT_RESERVES -> [ECOA_CODE_19_INCOME_INSUFFICIENT]` is **inadequate** per CFPB Circular 2022-03. "Income insufficient" is about DTI, not reserves. Reserves should be a separate, specific reason.

## Example Adverse Action Reason Text

> "Your post-closing liquid reserves do not meet our minimum requirement. Our standard requires a minimum of [N] months of principal, interest, taxes, insurance, and association dues (PITIA) in verified liquid assets after closing. Your current reserves are [M] months PITIA, which is below our minimum."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 27? |
|---|---|
| `INSUFFICIENT_RESERVES` | YES (primary) |
| `RESERVES_UNDER_3MO` | YES (sub-trigger) |
| `RESERVES_UNDER_6MO_DSCR_LOW` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 3 mo for DSCR ≥ 1.25; 6 mo for DSCR < 1.25
- **Pennymac**: 3 mo for DSCR ≥ 1.25; 6 mo otherwise
- **Griffin**: 3 mo for DSCR ≥ 1.25; 6 mo otherwise
- **Angel Oak**: 3 mo for DSCR-Investor+; 6 mo otherwise
- **Deephaven**: 3 mo for DSCR ≥ 1.25; 6 mo otherwise

## Test Specification

```python
def test_code_27_text_reserves_specific():
    assert "reserve" in ECOA_REASON_TEXTS["27"].lower() or "PITIA" in ECOA_REASON_TEXTS["27"]

def test_code_27_for_insufficient_reserves():
    ke = EnrichedKillEvent(
        trigger="INSUFFICIENT_RESERVES",
        actual_reserves_months=2.0,
    )
    assert "27" in select_ecoa_codes(ke.trigger)

def test_code_27_with_dscr_conditional():
    """Code 27 should carry DSCR value in enriched context for the lender-policy check."""
    ke = EnrichedKillEvent(
        trigger="INSUFFICIENT_RESERVES",
        actual_dscr=0.95,
        actual_reserves_months=4.0,
    )
    payload = build_adverse_action_notice(ke)
    assert payload["regulatory_notices"]["ecoa_notice"]["enriched_context"]["actual_dscr"] == 0.95
```

## Sources

1. CFPB Consumer Financial Protection Circular 2022-03
2. Newfi, Pennymac, Griffin, Angel Oak, Deephaven product guidelines (T1_T2 sweep)
