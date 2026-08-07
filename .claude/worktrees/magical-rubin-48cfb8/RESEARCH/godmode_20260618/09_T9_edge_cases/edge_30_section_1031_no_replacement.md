---
type: research
slice: 3
status: drafted
confidence: 3
title: Edge Case 30 — §1031 with No Replacement Property
summary: "**Edge case:** After-Tax engine: `section_1031(relinquished_sale, replacement_property=None)`"
entities:
  - slice/3
  - tax/1031
  - tax/niit
  - tax/qoz
  - topic/str
tags:
  - topic/after-tax
  - topic/default-rate
  - topic/tax
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_30_section_1031_no_replacement.md
vaulted_at: 2026-06-20
---
# Edge Case 30 — §1031 with No Replacement Property

**Edge case:** After-Tax engine: `section_1031(relinquished_sale, replacement_property=None)`
**Source function:** Slice 3 after-tax engine (NOT YET IMPLEMENTED)
**Test category:** error-path; missing required input
**Slice assignment:** **Slice 3** (future)

## Edge Case Description

A §1031 like-kind exchange with NO replacement property is NOT a valid
§1031 — it's a taxable sale. The exchanger has 45 days to identify and
180 days to close (45/180-day rule per Reg. §1.1031(k)-1 and IRC §1031(a)(1)).

The engine must detect this and either:

1. Reject with ValueError (strict: §1031 requires replacement)
2. Convert to taxable sale scenario with full gain recognition

The default Slice 3 behavior should be option 2 (convert to taxable) with
a warning, because the user's INTENT may have been "I started a §1031
but it failed — what do I owe?". This is the more useful behavior for
an after-tax engine.

**§1031 mechanics (verified):**
- 45 days from sale of relinquished property to identify replacement
  (IRC §1031(a)(1); Reg. §1.1031(k)-1)
- 180 days from sale to acquire replacement (the LATER of 180 days or
  tax-return due date with extensions)
- QI (Qualified Intermediary) required (Reg. §1.1031(k)-1(g)(4))
- 3-property rule, 200% rule, 95% exception
- Source: <https://www.irs.gov/pub/irs-news/fs-08-18.pdf>

## Expected Behavior

**Convert to taxable sale** — recognize full gain, no §1031 deferral.

```python
# Future Slice 3 API
result = section_1031(
    relinquished_sale={
        'sale_price': 500_000,
        'original_basis': 200_000,
        'selling_costs': 30_000,
    },
    replacement_property=None,  # NO replacement = taxable sale
)
# Full gain recognized (no deferral)
assert result['deferred_gain'] == 0
assert result['recognized_gain'] == 270_000  # 500K - 200K - 30K
assert result['is_1031_exchange'] is False
assert result['warning'] is not None  # "No replacement property — taxable sale"
```

**Alternative strict mode** — raise ValueError:
```python
result = section_1031(
    relinquished_sale={...},
    replacement_property=None,
    strict_1031=True,
)
# raises ValueError("§1031 requires replacement property")
```

## Mathematical Analysis

**§1031 with replacement:**
```
Realized gain = sale_price - basis - selling_costs
Deferred gain = realized gain - boot (cash + net mortgage reduction)
Recognized gain = boot (capped at realized gain)
```

**No replacement (taxable sale):**
```
Realized gain = sale_price - basis - selling_costs
Recognized gain = realized gain (FULL)
Deferred gain = 0
```

For our example:
```
Realized gain = 500,000 - 200,000 - 30,000 = 270,000
Recognized gain = 270,000 (full)
Deferred gain = 0
```

**Tax calculation (assumes LTCG + 25% §1250 recapture):**
```
§1250 recapture = lesser of accumulated depreciation, gain
LTCG = 270,000 - §1250
Tax at 25% on §1250 + 20% on LTCG + 3.8% NIIT
```

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(sale_price=st.floats(min_value=100_000, max_value=10_000_000),
       basis=st.floats(min_value=0.0, max_value=sale_price - 1),
       costs=st.floats(min_value=0.0, max_value=sale_price * 0.1))
def test_section_1031_no_replacement_is_taxable(sale_price, basis, costs):
    """No replacement property → taxable sale, full gain recognized."""
    result = section_1031(
        relinquished_sale={
            'sale_price': sale_price,
            'original_basis': basis,
            'selling_costs': costs,
        },
        replacement_property=None,
    )
    realized = sale_price - basis - costs
    assert result['recognized_gain'] == pytest.approx(realized, abs=0.01)
    assert result['deferred_gain'] == 0.0
    assert result['is_1031_exchange'] is False

def test_section_1031_strict_mode_raises():
    """Strict §1031 mode raises when no replacement specified."""
    with pytest.raises(ValueError, match="§1031 requires replacement"):
        section_1031(
            relinquished_sale={'sale_price': 500_000, 'original_basis': 200_000},
            replacement_property=None,
            strict_1031=True,
        )

def test_section_1031_with_replacement_defers_gain():
    """Standard §1031 with replacement property defers gain (less boot)."""
    result = section_1031(
        relinquished_sale={
            'sale_price': 500_000,
            'original_basis': 200_000,
            'selling_costs': 30_000,
        },
        replacement_property={
            'purchase_price': 480_000,  # less cash to exchanger
            'mortgage_assumed': 200_000,
            'closing_costs': 20_000,
        },
        qi_used=True,
    )
    # Realized gain = 500K - 200K - 30K = 270K
    # Net mortgage reduction = 200K (relinquished) - 200K (replacement) = 0
    # Boot = 0 (no cash, no net mortgage reduction)
    # Deferred gain = 270K
    # Recognized gain = 0
    assert result['realized_gain'] == 270_000
    assert result['recognized_gain'] == 0
    assert result['deferred_gain'] == 270_000
```

## Reference Behavior

**IRC §1031(a)(1):** "No gain or loss shall be recognized on the exchange
of property held for productive use in a trade or business or for
investment, if such property is exchanged solely for property of like kind..."

**Key requirement:** "exchanged solely for property of like kind" — no
replacement property means NO EXCHANGE, just a sale.

**IRS Fact Sheet 2008-18:** "Like-Kind Exchanges Under IRC §1031"
Source: <https://www.irs.gov/pub/irs-news/fs-08-18.pdf>
"If you receive cash, relief from debt, or property that is not like-kind,
however, you may trigger some taxable gain in the year of the exchange."

**American Bar Association (Real Property, Trust and Estate Section):**
"An exchange is not tax-free as it is often described; rather it is
tax-deferred because the Taxpayer carries over its tax basis in the
Relinquished Property to..."
Source: <https://www.americanbar.org/groups/real_property_trust_estate/resources/real-estate/1031-exchange/>

**IPX 1031 (industry QI):** "The taxable portion, known as 'boot,' may
trigger taxes while the remaining exchange may still qualify for tax deferral."
Source: <https://www.ipx1031.com/partial-exchange/>

**1031 CORP., Federation of Exchange Accommodators:** All confirm that
without replacement, full gain is recognized.

**Domain 10 (companion research):** `/RESEARCH/domain_10/RESEARCH_DOMAIN_10_1031_QOZ.md`
- 45/180-day rules
- QI requirement
- Like-kind requirement

## Confidence Score

**5/5** — IRC §1031(a)(1) is unambiguous; multiple primary sources confirm.

## Implementation Order

**Priority:** Slice 3 implementation. Add to future
`tests/test_after_tax.py::TestSection1031`. The "convert to taxable" mode
is the most useful behavior for an after-tax engine. Add both strict
(raises) and lenient (converts) modes.
