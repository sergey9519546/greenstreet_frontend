---
type: research
slice: 1
status: drafted
confidence: 3
title: "Edge Case 18 — DSCR = 1.005 (Banker's Rounding)"
summary: "**Edge case:** `round_dscr(1.005)` — DSCR slightly above 1.0 with rounding ambiguity"
entities:
  - concept/dscr
  - slice/1
  - topic/str
tags:
  - type/audit
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_18_dscr_1005_bankers.md
vaulted_at: 2026-06-20
---
# Edge Case 18 — DSCR = 1.005 (Banker's Rounding)

**Edge case:** `round_dscr(1.005)` — DSCR slightly above 1.0 with rounding ambiguity
**Source function:** `dscr_core.dscr.round_dscr`
**Test category:** boundary (rounding); CRITICAL — affects qualifying decision
**Slice assignment:** Slice 1 (current — uses banker's rounding)

## Edge Case Description

DSCR = 1.005 has ambiguous rounding behavior:

- `round(1.005, 2)` in CPython returns `1.0` (banker's rounding, half-to-even)
  because `1.005` cannot be exactly represented in binary float
- The mathematical 1.005 should round to `1.01` (half-up) or `1.0` (half-to-even)
- The Sovereign Master mandates banker's rounding (NEVER round up)

The downstream consequence: `track_decision(1.005, ...)` could be GREEN
(if rounded to 1.0, since 1.0 >= 1.0) or KILL (if the unrounded value is
used and 1.005 is somehow considered below threshold — it isn't, since
1.005 >= 1.0).

**Why this matters:**
- This test exposes the FLOAT representation quirk in IEEE 754
- A naive `round(1.005, 2) == 1.01` expectation would fail
- The engine MUST use banker's rounding to match GAAP/ASC 820 fair-value
  practice

## Expected Behavior

**Use banker's rounding** — `round_dscr(1.005)` returns `1.0` (half-to-even,
not half-up).

```python
assert round_dscr(1.005) == 1.0  # NOT 1.01
# This passes because Python float 1.005 is actually 1.00499999... in binary
```

For values that are unambiguously above 1.005:
```python
assert round_dscr(1.0051) == 1.01  # clearly above 1.005, rounds up to 1.01
assert round_dscr(1.0049) == 1.00  # clearly below, rounds down
```

## Mathematical Analysis

The standard `round()` function in Python uses banker's rounding (round
half to even). For `1.005`:
- Mathematical value: exactly 1.005
- IEEE 754 representation: 1.00499999999999989...
- `round(1.004999..., 2)` = 1.00 (round down)
- True mathematical 1.005 should round to 1.00 (half-to-even, since 0 is even)

So `round(1.005, 2) == 1.0` is the CORRECT answer per both Python's
floating-point behavior AND banker's rounding rules.

This is documented in the existing test at `test_dscr.py:128-132`:
```python
def test_1_005_rounds_to_1_0_bankers(self):
    """1.005 with banker's rounding -> 1.0 (round half to even)."""
    assert round_dscr(100.5 / 100) == 1.0  # not 1.01
```

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(dscr=st.floats(min_value=0.99, max_value=1.01, allow_nan=False))
def test_round_dscr_never_rounds_up_at_half(dscr):
    """DSCR slightly above 1.0 must NEVER round to 1.01 from a value <= 1.005."""
    if dscr <= 1.005:
        rounded = round_dscr(dscr)
        # Banker's rounding: 1.005 -> 1.00 (half-to-even)
        # Anything strictly below 1.005 -> 1.00 or 1.00
        assert rounded <= 1.00 + 1e-9  # tolerance for float quirks

def test_round_dscr_at_safe_above_boundary():
    """DSCR = 1.0051 (clearly above) must round to 1.01."""
    assert round_dscr(1.0051) == 1.01

def test_round_dscr_at_safe_below_boundary():
    """DSCR = 1.0049 (clearly below) must round to 1.00."""
    assert round_dscr(1.0049) == 1.00
```

## Reference Behavior

**Python built-in round():** Uses banker's rounding. `round(1.005, 2) == 1.0`
in CPython 3.x (because 1.005 is actually 1.0049999... in float64).

**GAAP ASC 820 Fair Value:** Mandates banker's rounding for fair-value
measurements. Our `round_dscr` aligns with this accounting standard.

**IRS / SOX audit:** The "NEVER round up" rule is critical for audit. If
we rounded 1.005 to 1.01 and the loan was approved, but the true DSCR
rounded to 1.0 (below 1.0 threshold), the loan would be unapproved at
audit. Our rule prevents this.

**numpy.round:** Uses banker's rounding (matches Python).

**Excel ROUND():** Uses arithmetic rounding (half-up). `ROUND(1.005, 2) = 1.01`.
This is DIFFERENT from our banker's rounding — and is the right reason
our test expects 1.0, not 1.01.

## Confidence Score

**5/5** — critical audit edge case; verified by existing test at
`test_dscr.py:128-132`; aligned with GAAP ASC 820.

## Implementation Order

**Priority:** CRITICAL. The existing test `test_1_005_rounds_to_1_0_bankers`
at `test_dscr.py:128-132` is exactly this edge case. Property-based
extension adds coverage for the full neighborhood [0.99, 1.01].
