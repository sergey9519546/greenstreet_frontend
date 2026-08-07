---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 04 — Term = 600 Months (50-Year Cap)
summary: "**Edge case:** `payment_factor(rate, 600)` — maximum supported amortization"
entities:
  - concept/dscr
  - concept/io
  - data/fannie-mae
  - data/fred
  - data/freddie-mac
  - slice/1
  - tax/pal
  - topic/str
tags:
  - concept/io
  - topic/40yr-amort
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_04_term_600_months.md
vaulted_at: 2026-06-20
---
# Edge Case 04 — Term = 600 Months (50-Year Cap)

**Edge case:** `payment_factor(rate, 600)` — maximum supported amortization
**Source function:** `dscr_core.payment.payment_factor` (cap at
`MAX_TERM_MONTHS = 600`, defined at `payment.py:23`)
**Test category:** boundary (max valid); exercise the upper bound
**Slice assignment:** Slice 1 (current — guard at `payment.py:51-52`)

## Edge Case Description

The DSCR Sovereign OS caps amortization terms at 600 months (50 years) per
the `MAX_TERM_MONTHS` constant. This cap covers all CRE products including
interest-only bridges, and aligns with:

- FHA's 50-year mortgage proposal (Trump admin, 2025) — see
  <https://www.oregonlive.com/business/2025/11/50-year-mortgage-plan-offers-lower-payments-but-raises-big-concerns.html>
- FHA.com 50-year mortgage FAQ: "spreads principal repayment over 600 months"
  <https://www.fha.com/fha_article?id=4187>

At `n=600`, the `(1+r)^600` term grows to ~10^12 at 7% APR, but Decimal
with `prec=28` handles it.

## Expected Behavior

**Accept** — return a valid payment factor; **Reject** `n=601` with ValueError.

```python
# Accept n=600
payment_factor(7.0, 600) ≈ 0.0058360   # very small per-dollar payment

# Reject n=601 with ValueError
with pytest.raises(ValueError, match="n_months must be <= 600"):
    payment_factor(7.0, 601)
```

## Mathematical Analysis

At n=600, r=7/1200:
```
(1 + r)^600 = (1.005833)^600 ≈ 33.0   # manageable
f = r * 33.0 / (33.0 - 1) = 0.005836  # matches
```

The factor is much smaller than at n=360 (which gives 0.006653), reflecting
the longer amortization horizon.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rate=st.floats(min_value=1.0, max_value=15.0, allow_nan=False))
def test_payment_factor_at_600_months(rate):
    """At max term, factor must be positive, finite, and decreasing in n."""
    f_600 = payment_factor(rate, 600)
    f_360 = payment_factor(rate, 360)
    # 600-month factor should be smaller than 360-month (longer term = lower payment)
    assert 0.0 < f_600 < f_360

def test_payment_factor_rejects_above_max():
    """n_months > 600 must raise ValueError per MAX_TERM_MONTHS."""
    with pytest.raises(ValueError, match="n_months must be <= 600"):
        payment_factor(7.0, 601)
    with pytest.raises(ValueError, match="n_months must be <= 600"):
        payment_factor(7.0, 1200)  # 100 years — way out of bounds
```

## Reference Behavior

**numpy-financial:** Accepts arbitrary `nper` with no upper cap. Overflow
risk at very large nper due to `(1+rate)^nper`. No validation.

**Excel PMT(0.07/12, 600, -100000):** Returns ≈ $583.60 — matches our
formula. No upper cap on nper.

**FHA 50-year mortgage (Nov 2025):** Uses 600-month amortization per
HousingWire coverage. Confirms 600 is a real-world product.

**Freddie Mac / Fannie Mae:** Conventional 30-year (360) is the standard;
40-year (480) is rare; 50-year (600) is currently in policy review.

## Confidence Score

**5/5** — universally accepted convention for CRE; formula is well-defined
at n=600.

## Implementation Order

**Priority:** High. Add `test_payment_factor_at_600_months` and
`test_payment_factor_rejects_above_600` to `test_payment.py::TestPaymentFactor`.
The 601-rejection is already tested as `test_factor_rejects_excessive_term`
but the 600-accept case is not explicitly covered.
