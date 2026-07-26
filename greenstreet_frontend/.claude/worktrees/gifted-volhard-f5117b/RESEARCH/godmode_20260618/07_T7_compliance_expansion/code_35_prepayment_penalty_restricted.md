---
type: research
status: drafted
confidence: 4
title: Code 35 — Prepayment Penalty Not Permitted by State Law
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with PPP-specific text. State-level PPP restrictions are a major DSCR denial reason for NJ, NY, MN (pre-8/1/26), and others."
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - topic/sfr
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/ppp
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_35_prepayment_penalty_restricted.md
vaulted_at: 2026-06-20
---
# Code 35 — Prepayment Penalty Not Permitted by State Law

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with PPP-specific text. State-level PPP restrictions are a major DSCR denial reason for NJ, NY, MN (pre-8/1/26), and others.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** State regulations; T12 (50-state STR regulation) research

---

## Canonical Text (DSCR lender convention)

> "The prepayment penalty structure proposed for the loan is not permitted by [state] law."

Or more specifically:
> "The proposed prepayment penalty of [N] months / [N]% of [prepayment amount] exceeds the maximum permitted by [state] law for a [DSCR] loan."

## DSCR-Specific Application

**High DSCR relevance.** DSCR lenders often use prepayment penalties (PPPs) to offset the higher rate. State restrictions:

1. **NJ** — PPP allowed; borrower right to cancel within 3-5 years varies
2. **NY** — 3-year maximum PPP for residential mortgages
3. **MN** — pre-8/1/26, 3-year maximum PPP (HB 17 / §58.137); 8/1/26+ aligns with 5-year
4. **PA** — 5-year maximum PPP for non-conventional
5. **OH** — no PPP on residential mortgages
6. **ME** — 5-year maximum PPP
7. **MA** — 5-year maximum PPP
8. **NH** — 5-year maximum PPP
9. **RI** — 5-year maximum PPP
10. **VT** — no PPP
11. **NM** — no PPP
12. **OK** — no PPP

**DSCR-specific triggers for Code 35**:
- Property in NY; PPP 5 years proposed; NY max 3 years → code 35
- Property in MN (pre-8/1/26); PPP 5 years; MN max 3 years → code 35
- Property in OH; any PPP proposed; OH doesn't allow → code 35

**Lender policy**:
- **Newfi**: 3-year PPP for NY, MN; 5-year for others
- **Pennymac**: 3-year PPP for NY; 5-year for others
- **Griffin Funding**: 3-year PPP for NY, MN; 5-year for others
- **Angel Oak**: 3-year PPP for NY, MN; 5-year for others
- **Deephaven**: 3-year PPP for NY, MN; 5-year for others

## Example Adverse Action Reason Text

> "The proposed prepayment penalty of [N] years exceeds the maximum of [M] years permitted by [state] law for a residential mortgage. We may be able to offer a different program without a prepayment penalty, or with a penalty structured within state law."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 35? |
|---|---|
| `PREPAYMENT_PENALTY_RESTRICTED` | YES (primary) |
| `NY_PPP_OVER_3YR` | YES (sub-trigger) |
| `MN_PPP_OVER_3YR` | YES (sub-trigger, pre-8/1/26) |

## Lender-Specific Variants

- **Newfi**: 3-year NY/MN; 5-year others
- **Pennymac**: 3-year NY; 5-year others
- **Griffin Funding**: 3-year NY/MN; 5-year others
- **Angel Oak**: 3-year NY/MN; 5-year others
- **Deephaven**: 3-year NY/MN; 5-year others

## Test Specification

```python
def test_code_35_text_ppp():
    assert "prepayment" in ECOA_REASON_TEXTS["35"].lower() or "penalty" in ECOA_REASON_TEXTS["35"].lower()

def test_code_35_for_ny_ppp_over_3yr():
    ke = EnrichedKillEvent(
        trigger="PREPAYMENT_PENALTY_RESTRICTED",
        property_type="SFR",
    )
    assert "35" in select_ecoa_codes(ke.trigger)
```

## Sources

1. T12 (50-state STR regulation) research
2. NY GBL §6-l; MN Stat. §58.137; OH Rev. Code §1343.011
3. Form C-1 code 24 (Other) for fallback
