---
type: research
slice: 1
status: drafted
confidence: 4
title: Code 28 — DSCR Below Lender Minimum
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with DSCR-specific text. The most important DSCR-specific reason code. CFPB Circular 2022-03 requires specificity — generic \"income insufficient\" is insufficient; \"DSCR below our minimum\" is specific."
entities:
  - concept/dscr
  - concept/itia
  - concept/ltv
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
  - slice/2
  - tax/pal
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/default-rate
  - topic/insurance
  - topic/reserves
  - topic/short-rate
  - topic/tax
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_28_dscr_below_minimum.md
vaulted_at: 2026-06-20
---
# Code 28 — DSCR Below Lender Minimum

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with DSCR-specific text. The most important DSCR-specific reason code. CFPB Circular 2022-03 requires specificity — generic "income insufficient" is insufficient; "DSCR below our minimum" is specific.

**Confidence:** 4/5 (not a separate Reg B code; lender convention)
**Source:** CFPB Circular 2022-03; DSCR lender guidelines

**NOTE:** This is **distinct** from the Slice 1 `ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE = "28"` which uses different text ("The type of property you selected is not acceptable to us."). For DSCR, Code 28 is reserved for **DSCR-below-minimum** as the principal reason. The Slice 1 code 28 should be **renamed** to a new key (e.g., ECOA_CODE_29_PROPERTY_TYPE) to free up the number 28 for this DSCR-specific reason.

---

## Canonical Text (DSCR lender convention)

> "The Debt Service Coverage Ratio (DSCR) for the subject property is [N], which is below our minimum requirement of [M]."

## DSCR-Specific Application

**THE most critical DSCR reason code.** DSCR is the primary qualifying metric for DSCR loans.

**DSCR minimum by program**:

| Lender | DSCR-Investor (max leverage) | DSCR-Full Doc | DSCR-FN/ITIN | DSCR-Owner Occupied |
|---|---|---|---|---|
| **Newfi** | 1.00 (75% LTV) / 1.25 (80% LTV) | 1.00 | 1.10 | 1.00 |
| **Pennymac** | 0.75 (75% LTV) / 1.00 (80% LTV) | 1.00 | N/A | 1.00 |
| **Griffin** | 1.00 (80% LTV) / 1.25 (75% LTV) | 1.00 | 1.25 | 1.00 |
| **Angel Oak** | 0.75 (DSCR-Investor+) | 1.00 | 1.00 | 1.00 |
| **Deephaven** | 1.00 (75% LTV) / 1.25 (80% LTV) | 1.00 | 1.10 | 1.00 |

**DSCR calculation**:
- DSCR = Gross Rental Income / PITIA (monthly)
- Gross Rental Income = lower of (a) lease/rent, (b) Form 1007 (LTR), (c) 12-month average (STR), (d) AirDNA projection
- PITIA = Principal + Interest + Taxes + Insurance + Association Dues (HOA)
- Some lenders include vacancy factor: 75% LTR, 80-85% STR

**DSCR-specific triggers for Code 28**:
- Subject property rent $3,500/mo; PITIA $3,800/mo → DSCR 0.92; lender min 1.00 → code 28
- DSCR is 0.85; lender min 1.00 for DSCR-Investor → code 28
- DSCR is 0.65; lender min 0.75 for Pennymac STR → code 28

**Distinction from Code 24 (Other)**: Code 28 is the **specific DSCR** sub-reason. Use code 28 when DSCR is the principal reason; use code 24 when DSCR is **not** the principal reason (e.g., reserves, vesting).

## Example Adverse Action Reason Text

> "The Debt Service Coverage Ratio (DSCR) for the subject property is [N], which is below our minimum requirement of [M] for the [DSCR-Investor / DSCR-Full Doc / FN / ITIN] program. DSCR is calculated as the gross monthly rental income of $[X] divided by the proposed monthly PITIA of $[Y]. [If STR: The 12-month average rental income is based on [source].]"

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 28? |
|---|---|
| `DSCR_BELOW_MINIMUM` | YES (primary) |
| `DSCR_LOW_RENT` | YES (sub-trigger) |
| `DSCR_HIGH_DEBT` | NO (use Code 21 / 09) |
| `DSCR_GENERIC` | YES (default) |

## Lender-Specific Variants

- **Newfi**: 1.25 for 80% LTV; 1.00 for 75% LTV; 1.10 FN
- **Pennymac**: 1.00 for 80% LTV; 0.75 for 75% LTV
- **Griffin**: 1.25 for 75% LTV; 1.00 for 80% LTV; 1.25 FN
- **Angel Oak**: 0.75 for DSCR-Investor+; 1.00 standard
- **Deephaven**: 1.25 for 80% LTV; 1.00 for 75% LTV; 1.10 FN

## ⚠️ NAMING COLLISION RESOLUTION

The current Slice 1 `ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE = "28"` should be **renamed** to free up code 28 for the DSCR-specific reason. Suggested renames:

```python
# DEPRECATED (Slice 1)
ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE = "28"  # Actual text: "The type of property you selected is not acceptable to us."

# NEW (Slice 2)
ECOA_CODE_28_DSCR_BELOW_MINIMUM = "28"  # DSCR-specific: "The Debt Service Coverage Ratio (DSCR)... is below our minimum requirement of..."
ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE = "29"  # Renamed from 28
```

## Test Specification

```python
def test_code_28_text_dscr_specific():
    assert "DSCR" in ECOA_REASON_TEXTS["28"] or "debt service coverage" in ECOA_REASON_TEXTS["28"].lower()

def test_code_28_for_dscr_below_min():
    ke = EnrichedKillEvent(
        trigger="DSCR_BELOW_MINIMUM",
        actual_dscr=0.85,
        dscr_threshold=1.00,
    )
    assert "28" in select_ecoa_codes(ke.trigger)

def test_code_28_renamed_collision_resolution():
    """Slice 2 must use code 28 for DSCR, not for property type."""
    assert "28" in ECOA_REASON_TEXTS
    assert "29" in ECOA_REASON_TEXTS  # property type moves to 29
    assert "DSCR" in ECOA_REASON_TEXTS["28"] or "debt service" in ECOA_REASON_TEXTS["28"].lower()
    assert "property" in ECOA_REASON_TEXTS["29"].lower()
```

## Sources

1. CFPB Consumer Financial Protection Circular 2022-03
2. Newfi, Pennymac, Griffin, Angel Oak, Deephaven DSCR matrices (T1_T2 sweep)
3. Existing Slice 1 ECOA_CODE_28 (collision to be resolved)
