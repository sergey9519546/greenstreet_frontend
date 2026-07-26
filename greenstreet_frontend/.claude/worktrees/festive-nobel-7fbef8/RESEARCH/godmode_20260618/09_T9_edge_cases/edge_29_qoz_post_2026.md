---
type: research
slice: 3
status: drafted
confidence: 3
title: Edge Case 29 — QOZ Deferral for Post-2026 Investment
summary: "**Edge case:** After-Tax engine: `qoz_deferral(investment_date='2027-06-15', ...)`"
entities:
  - concept/appreciation
  - slice/3
  - tax/1031
  - tax/qoz
  - topic/str
tags:
  - topic/after-tax
  - topic/tax
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_29_qoz_post_2026.md
vaulted_at: 2026-06-20
---
# Edge Case 29 — QOZ Deferral for Post-2026 Investment

**Edge case:** After-Tax engine: `qoz_deferral(investment_date='2027-06-15', ...)`
**Source function:** Slice 3 after-tax engine (NOT YET IMPLEMENTED)
**Test category:** boundary (date regime); CRITICAL regime transition
**Slice assignment:** **Slice 3** (future)

## Edge Case Description

This is the CRITICAL **OBBBA regime transition** edge case. Pre-2027
investments follow TCJA rules (10% step-up at year 5 + 15% step-up at
year 7 + Dec 31, 2026 sunset risk). Post-2026 investments follow OBBBA
rules (10% step-up at year 5, NO 7-year step-up, 5-year deferral from
investment date, 30-year FMV basis freeze).

The engine MUST branch correctly based on `qoz_investment_date` to apply
the right rule set. A wrong branch would yield:

- $50,000 miscalculation in step-up basis (15% of $333K gain)
- Wrong deferral period (TCJA: 12/31/2026 sunset vs OBBBA: 5-yr from
  investment date)
- Wrong basis freeze date (TCJA: none vs OBBBA: 30-yr FMV)

**OBBBA context (verified):**
- IRC §1400Z-2 as amended by OBBBA §70431 (P.L. 119-21, July 4, 2025)
- Permanent QOZ program (no more 12/31/2026 sunset)
- Modifications effective for amounts invested AFTER Dec 31, 2026
- Source: <https://research.domain_10/RESEARCH_DOMAIN_10_1031_QOZ.md>
- Cherry Bekaert, Plante Moran, NAHB (Aug 7, 2025): "OBBBA makes the
  opportunity zone program a permanent feature of the tax code"

## Expected Behavior

**Branch on `investment_date`**:
- Pre-2027-01-01: TCJA rules (15% step-up at year 7 available)
- Post-2026-12-31: OBBBA rules (no 7-year step-up, 5-yr deferral from
  investment, 30-year FMV freeze)

```python
# Future Slice 3 API
result_pre2027 = qoz_deferral(
    deferred_gain=200_000,
    investment_date='2025-06-15',  # TCJA regime
)
assert result_pre2027['stepup_at_5yr'] == 20_000   # 10% of 200K
assert result_pre2027['stepup_at_7yr'] == 30_000   # 15% of 200K (TCJA only)
assert result_pre2027['deferral_period_years'] == None  # until 12/31/2026
assert result_pre2027['recognition_date'] == '2026-12-31'  # TCJA sunset

result_post2026 = qoz_deferral(
    deferred_gain=200_000,
    investment_date='2027-06-15',  # OBBBA regime
)
assert result_post2026['stepup_at_5yr'] == 20_000    # 10% of 200K
assert result_post2026['stepup_at_7yr'] == 0         # NO 7-yr step-up post-2026
assert result_post2026['deferral_period_years'] == 5  # 5 years from investment
assert result_post2026['recognition_date'] == '2032-06-15'  # 5 years from investment
assert result_post2026['30yr_fmv_freeze'] is True
```

## Mathematical Analysis

**TCJA (pre-2027):**
```
Recognition date: 12/31/2026 (the sunset)
Step-up at year 5: 10% of deferred gain
Step-up at year 7: additional 5% (total 15%)
10-yr LTCG exclusion on QOF appreciation: yes
30-yr FMV freeze: NO
```

**OBBBA (post-2026):**
```
Recognition date: 5 years from investment date
Step-up at year 5: 10% of deferred gain
Step-up at year 7: NONE (eliminated)
10-yr LTCG exclusion on QOF appreciation: yes (maintained)
30-yr FMV freeze: YES (new in OBBBA)
```

**QROF (rural, post-2026):**
```
Step-up at year 5: 30% of deferred gain (vs 10% for standard QOZ)
Substantial improvement threshold: 50% (vs 100% standard)
Rural = city/town < 50,000 population
```

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(invest_date=st.dates(min_value=date(2018, 1, 1), max_value=date(2026, 12, 31)))
def test_qoz_deferral_tcja_regime(invest_date):
    """Pre-2027 investments follow TCJA rules."""
    result = qoz_deferral(deferred_gain=100_000, investment_date=invest_date)
    assert result['stepup_at_5yr'] == 10_000    # 10%
    assert result['stepup_at_7yr'] == 5_000     # TCJA: additional 5% at year 7
    assert result['regime'] == 'TCJA'

@given(invest_date=st.dates(min_value=date(2027, 1, 1), max_value=date(2030, 12, 31)))
def test_qoz_deferral_obbba_regime(invest_date):
    """Post-2026 investments follow OBBBA rules."""
    result = qoz_deferral(deferred_gain=100_000, investment_date=invest_date)
    assert result['stepup_at_5yr'] == 10_000    # 10%
    assert result['stepup_at_7yr'] == 0         # OBBBA: no 7-yr step-up
    assert result['deferral_period_years'] == 5  # 5 years from investment
    assert result['regime'] == 'OBBBA'
    assert result['30yr_fmv_freeze'] is True

def test_qoz_regime_boundary_dec_31_2026():
    """Dec 31 2026 = LAST day of TCJA regime."""
    result_last_tcja = qoz_deferral(deferred_gain=100_000, investment_date='2026-12-31')
    assert result_last_tcja['regime'] == 'TCJA'
    result_first_obbba = qoz_deferral(deferred_gain=100_000, investment_date='2027-01-01')
    assert result_first_obbba['regime'] == 'OBBBA'
```

## Reference Behavior

**IRC §1400Z-2 as amended by OBBBA §70431 (P.L. 119-21, 139 Stat. 72, July 4, 2025):**
"Caution: Code section 1400Z-2(a)(2) below, as amended by P.L. 119-21, is
effective for amounts invested in qualified opportunity funds after
December 31, 2026."

**26 USC §1400Z-2 (uscode.house.gov):**
"Special rules for capital gains invested in opportunity zones"

**NAHB (Aug 7, 2025):** "The One Big Beautiful Bill Act (OBBBA) makes
the opportunity zone program a permanent feature of the tax code."

**Cherry Bekaert, Plante Moran, SVA, CBH, HCVT:** All confirm permanent
extension with new rules.

**Domain 10 (companion research):** `/RESEARCH/domain_10/RESEARCH_DOMAIN_10_1031_QOZ.md`
- Pre-2027 investments: TCJA rules
- Post-2026 investments: OBBBA rules

## Confidence Score

**5/5** — IRC §1400Z-2 as amended is the primary source. Multiple Tier 2
confirmations (NAHB, Big 4).

## Implementation Order

**Priority:** Slice 3 implementation. This is a **HIGH-PRIORITY** edge case
because the regime transition is the single most error-prone part of the
after-tax engine. Add to future `tests/test_after_tax.py::TestQOZ` with
extensive date boundary tests.
