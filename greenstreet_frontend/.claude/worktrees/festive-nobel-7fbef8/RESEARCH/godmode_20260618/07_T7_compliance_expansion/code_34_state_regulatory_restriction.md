---
type: research
status: drafted
confidence: 4
title: Code 34 — State Regulatory Restriction
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with state-specific text. State-specific restrictions (usury caps, PPP, NJ LLC, NY §6-l) are major DSCR denial reasons."
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - state/mn
  - state/nj
  - state/ny
  - state/tx
  - topic/sfr
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/ppp
  - topic/usury
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_34_state_regulatory_restriction.md
vaulted_at: 2026-06-20
---
# Code 34 — State Regulatory Restriction

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with state-specific text. State-specific restrictions (usury caps, PPP, NJ LLC, NY §6-l) are major DSCR denial reasons.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** State regulations; T12 (50-state STR regulation) and T13 (50-state usury caps) research

---

## Canonical Text (DSCR lender convention)

> "The loan does not meet [state] regulatory requirements."

Or more specifically:
> "The proposed loan does not meet [state] regulatory requirements, specifically: [usury cap / prepayment penalty restriction / LLC requirement / DSCR disclosure / state-specific DSCR minimum]."

## DSCR-Specific Application

**Critical for DSCR.** State regulatory restrictions are a major denial reason. Common restrictions:

1. **NJ LLC lender-split** (NJSB 4171 / NJAC 3:27) — Lender and borrower must be separate LLCs, no common ownership
2. **NY §6-l** — DSCR minimum 1.20 for all NY DSCR loans (some lenders)
3. **MN §58.137** (pre-8/1/26) — Prepayment penalty restrictions
4. **TX usury cap** — 10% interest cap (some DSCR lenders)
5. **CA usury cap** — 10% for personal loans; corporate exemption for DSCR
6. **NV DSCR** — no major restrictions
7. **FL DSCR** — no major restrictions
8. **MD usury cap** — 24% for personal loans
9. **GA usury cap** — 16% (some DSCR lenders above)
10. **AR usury cap** — 17% (some DSCR lenders above)

**DSCR-specific triggers for Code 34**:
- Property in NJ; lender and borrower LLC have common ownership → code 34
- Property in NY; DSCR 1.10; NY requires 1.20 → code 34
- Property in MN (pre-8/1/26); prepayment penalty > allowed → code 34
- Property in TX; interest rate 11%; TX cap 10% → code 34

**Lender policy**:
- **Newfi**: NJ LLC split enforced; NY 1.20; MN PPP pre-8/1/26; TX 10% cap
- **Pennymac**: NJ LLC split enforced; NY 1.20; TX 10% cap
- **Griffin Funding**: NJ LLC split enforced; NY 1.20; TX 10% cap
- **Angel Oak**: NJ LLC split enforced; NY 1.20; TX 10% cap
- **Deephaven**: NJ LLC split enforced; NY 1.20; TX 10% cap

## Example Adverse Action Reason Text

> "The proposed loan does not meet [state] regulatory requirements. Specifically, [the lender and borrower LLCs have common ownership, which is not permitted under New Jersey Banking and Small Loan Act / the DSCR of [N] is below the New York minimum of 1.20 / the interest rate exceeds the Texas usury cap of 10% / the prepayment penalty exceeds the Minnesota statutory limit pre-August 1, 2026]."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 34? |
|---|---|
| `NJ_LLC_SPLIT_VIOLATION` | YES (primary) |
| `NY_DSCR_BELOW_120` | YES (sub-trigger) |
| `MN_PPP_RESTRICTED` | YES (sub-trigger) |
| `TX_USURY_CAP_EXCEEDED` | YES (sub-trigger) |
| `STATE_NOT_LICENSED` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: NJ LLC; NY 1.20; MN PPP; TX 10%
- **Pennymac**: NJ LLC; NY 1.20; TX 10%
- **Griffin Funding**: NJ LLC; NY 1.20; TX 10%
- **Angel Oak**: NJ LLC; NY 1.20; TX 10%
- **Deephaven**: NJ LLC; NY 1.20; TX 10%

## Test Specification

```python
def test_code_34_text_state():
    assert "state" in ECOA_REASON_TEXTS["34"].lower() or "regulatory" in ECOA_REASON_TEXTS["34"].lower()

def test_code_34_for_nj_llc_violation():
    ke = EnrichedKillEvent(
        trigger="NJ_LLC_SPLIT_VIOLATION",
        property_type="SFR",
    )
    assert "34" in select_ecoa_codes(ke.trigger)

def test_code_34_for_ny_dscr_below_120():
    ke = EnrichedKillEvent(
        trigger="NY_DSCR_BELOW_120",
        actual_dscr=1.10,
    )
    assert "34" in select_ecoa_codes(ke.trigger)
```

## Sources

1. T12 (50-state STR regulation) and T13 (50-state usury caps) research
2. NJSA 17:11B-1 et seq. (NJ Banking and Small Loan Act)
3. NY GBL §6-l (New York DSCR disclosure)
4. MN Stat. §58.137 (Minnesota prepayment penalty restriction)
5. TX Fin. Code §302.001 (Texas usury cap)
6. Form C-1 code 24 (Other) for fallback
