"""Tests for leverage.py — deal_break_rate (Brent) and max_purchase_price (bisection).

Locks:
  - Golden vector deal_break_rate at 1.0 DSCR = ~7.67%
  - Golden vector deal_break_rate at 1.05 DSCR = 7.00% (definition of green)
  - Golden vector max_purchase_price at 1.05 DSCR = ~$425K
"""

from __future__ import annotations

import pytest

from dscr_core.leverage import deal_break_rate, max_purchase_price


class TestDealBreakRate:
    """The interest rate ceiling at which DSCR equals the target."""

    def test_golden_vector_at_1_05_dscr(self, v11_golden):
        """deal_break_rate(target=1.05) on golden vector = 7.00% (definition of green)."""
        result = deal_break_rate(
            loan=v11_golden["loan_amount"],
            target_dscr=1.05,
            rent_monthly=v11_golden["monthly_rent_lease"],
            tax_annual=v11_golden["annual_tax"],
            insurance_annual=v11_golden["annual_insurance"],
            hoa_monthly=v11_golden["monthly_hoa"],
        )
        assert result == pytest.approx(7.00, abs=0.05)

    def test_golden_vector_at_1_0_dscr(self, v11_golden):
        """deal_break_rate(target=1.0) on golden vector = ~7.67%."""
        result = deal_break_rate(
            loan=v11_golden["loan_amount"],
            target_dscr=1.0,
            rent_monthly=v11_golden["monthly_rent_lease"],
            tax_annual=v11_golden["annual_tax"],
            insurance_annual=v11_golden["annual_insurance"],
            hoa_monthly=v11_golden["monthly_hoa"],
        )
        assert result == pytest.approx(7.67, abs=0.10)

    def test_deal_break_increases_with_rent(self):
        """More rent -> higher break rate (can absorb more rate shock)."""
        base = deal_break_rate(318750, 1.0, 3000, 5000, 2000, 150)
        with_more_rent = deal_break_rate(318750, 1.0, 4000, 5000, 2000, 150)
        assert with_more_rent > base

    def test_deal_break_decreases_with_loan(self):
        """Bigger loan -> lower break rate (less cushion)."""
        small = deal_break_rate(200000, 1.0, 3000, 5000, 2000, 150)
        big = deal_break_rate(400000, 1.0, 3000, 5000, 2000, 150)
        assert big < small

    def test_deal_break_decreases_with_target(self):
        """Higher DSCR target -> lower break rate."""
        at_1_0 = deal_break_rate(318750, 1.0, 3000, 5000, 2000, 150)
        at_1_2 = deal_break_rate(318750, 1.2, 3000, 5000, 2000, 150)
        assert at_1_2 < at_1_0

    def test_underwater_deal_raises(self):
        """If DSCR < target even at 0%, the deal is unworkable."""
        with pytest.raises(ValueError, match="does not qualify at minimum rate"):
            deal_break_rate(
                loan=1_000_000,  # huge loan
                target_dscr=2.0,  # unreachable target
                rent_monthly=100,  # tiny rent
                tax_annual=0,
                insurance_annual=0,
                hoa_monthly=0,
            )

    def test_extreme_value_raises(self):
        """If DSCR >= target even at 20%, increase max_rate_pct."""
        with pytest.raises(ValueError, match="qualifies even at maximum rate"):
            deal_break_rate(
                loan=100_000,
                target_dscr=1.0,
                rent_monthly=100_000,  # absurd rent
                tax_annual=0,
                insurance_annual=0,
                hoa_monthly=0,
            )


class TestMaxPurchasePrice:
    """The most expensive property the borrower can buy and still qualify.

    Note: max_purchase_price is only meaningful when fixed costs (HOA, flood, MI)
    are included — otherwise DSCR is constant regardless of price (asymptotic to
    rent_yield / debt_yield) and max price is unbounded.
    """

    def test_golden_vector_max_price(self, v11_golden):
        """At 7.00%, 1.05 DSCR target, golden-vector HOA $150, max price ≈ $420K-$450K."""
        result = max_purchase_price(
            target_dscr=1.05,
            rate_pct=7.00,
            rent_per_value_yr=0.0847,  # 2026 median US rental yield
            tax_factor=0.012,
            insurance_factor=0.006,
            hoa_monthly=150.0,  # golden vector HOA — critical to make max_price finite
            ltv=0.75,
        )
        # Asymptotic DSCR at 7% / 8.47% yield = 1.0876
        # V = target * c / (a - target*b) = 1.05*150 / 0.000243 ≈ $648K
        assert 600_000 < result < 700_000

    def test_max_price_increases_with_rate(self):
        """COUNTERINTUITIVE: with fixed HOA, higher rate -> HIGHER max price.
        Why? With rent_per_value_yr held constant, higher-rate debt service scales
        linearly with value, while HOA stays fixed. The HOA gets diluted by the
        larger PITIA base, so you need a more expensive property to maintain DSCR.
        NOTE: This function enforces DSCR only, not absolute affordability. A
        separate max_payment or max_loan check is needed in real underwriting.
        At 8.47% rent yield and 1.05 DSCR target with $150 HOA:
        - 7.0% rate: V ≈ $648K
        - 7.25% rate: V ≈ $1.46M (higher!)
        - 7.5% rate: asymptotic DSCR 1.0462 < 1.05 — raises
        """
        cheap_rate = max_purchase_price(1.05, rate_pct=7.0, hoa_monthly=150.0)
        pricey_rate = max_purchase_price(1.05, rate_pct=7.25, hoa_monthly=150.0)
        assert pricey_rate > cheap_rate

    def test_max_price_decreases_with_rent_yield(self):
        """Higher rent_per_value_yr (better yield market) -> LOWER max price.
        More rent per dollar means you don't need as expensive a property.
        At 7% rate, 1.05 DSCR target, $150 HOA:
        - 9% yield: V ≈ $230K
        - 10% yield: V ≈ $104K
        - 6% yield: asymptotic DSCR < 1.05 — raises
        """
        mid_yield = max_purchase_price(
            1.05, rate_pct=7.0, rent_per_value_yr=0.09, hoa_monthly=150.0
        )
        high_yield = max_purchase_price(
            1.05, rate_pct=7.0, rent_per_value_yr=0.10, hoa_monthly=150.0
        )
        assert high_yield < mid_yield

    def test_max_price_increases_with_target_dscr(self):
        """COUNTERINTUITIVE: stricter DSCR target -> HIGHER max price (with fixed HOA).
        Same reason as rate: higher target means we need MORE rent cushion,
        which means MORE property value to spread the fixed HOA.
        NOTE: This function enforces DSCR only, not absolute affordability.
        At 7% rate, 8.47% yield, $150 HOA:
        - 1.05 target: V ≈ $648K
        - 1.07 target: V ≈ $1.41M
        - 1.08 target: asymptotic 1.0876 < 1.08 — raises
        """
        easy_target = max_purchase_price(target_dscr=1.05, rate_pct=7.0, hoa_monthly=150.0)
        strict_target = max_purchase_price(target_dscr=1.07, rate_pct=7.0, hoa_monthly=150.0)
        assert strict_target > easy_target

    def test_max_price_without_fixed_costs_raises(self):
        """Without fixed costs, DSCR is asymptotically > target, so max_price is unbounded.
        This is correct behavior — the function explicitly requires fixed costs to bound
        the answer. Real CRE deals always have HOA/flood/MI/taxes.
        """
        with pytest.raises(ValueError, match="qualifies even at min_value"):
            max_purchase_price(
                target_dscr=1.0,
                rate_pct=7.0,
                hoa_monthly=0,  # no fixed costs
            )

    def test_rejects_invalid_ltv(self):
        with pytest.raises(ValueError, match="ltv must be in"):
            max_purchase_price(1.0, 7.0, ltv=0)
        with pytest.raises(ValueError, match="ltv must be in"):
            max_purchase_price(1.0, 7.0, ltv=1.0)
        with pytest.raises(ValueError, match="ltv must be in"):
            max_purchase_price(1.0, 7.0, ltv=1.5)

    def test_rejects_invalid_rent_yield(self):
        with pytest.raises(ValueError, match="rent_per_value_yr must be in"):
            max_purchase_price(1.0, 7.0, rent_per_value_yr=0)
        with pytest.raises(ValueError, match="rent_per_value_yr must be in"):
            max_purchase_price(1.0, 7.0, rent_per_value_yr=1.5)


class TestBrentConvergence:
    """Sanity checks on the solver itself (not via the wrappers)."""

    def test_solver_finds_simple_root(self):
        from dscr_core.leverage import _brentq

        # f(x) = x^2 - 4, root at x=2
        root, iters = _brentq(lambda x: x * x - 4, 0, 5)
        assert root == pytest.approx(2.0, abs=1e-7)
        assert iters < 50

    def test_solver_finds_root_in_reversed_bracket(self):
        from dscr_core.leverage import _brentq

        # f(x) = -x + 5, root at x=5, but fa < 0 so fb > 0 -> swap
        root, _ = _brentq(lambda x: -x + 5, 0, 10)
        assert root == pytest.approx(5.0, abs=1e-7)

    def test_solver_returns_exact_root(self):
        from dscr_core.leverage import _brentq

        # f(x) = x - 3, root at x=3
        root, iters = _brentq(lambda x: x - 3, 0, 10)
        assert root == pytest.approx(3.0, abs=1e-9)
        assert iters < 10  # secant converges fast on linear

    def test_solver_raises_on_no_bracket(self):
        from dscr_core.leverage import _brentq

        # f(x) = x^2 + 1, always positive, no root
        with pytest.raises(ValueError, match="must bracket a root"):
            _brentq(lambda x: x * x + 1, -2, 2)

    def test_solver_returns_a_when_fa_is_zero(self):
        """Brent's method short-circuits when f(a) is exactly 0 (line 55-56)."""
        from dscr_core.leverage import _brentq

        # f(x) = x - 5, root at x=5, but a=5 makes f(a)=0
        root, iters = _brentq(lambda x: x - 5, 5, 10)
        assert root == 5.0
        assert iters == 0

    def test_solver_returns_b_when_fb_is_zero(self):
        """Brent's method short-circuits when f(b) is exactly 0 (line 57-58)."""
        from dscr_core.leverage import _brentq

        # f(x) = x - 5, root at x=5, but b=5 makes f(b)=0
        root, iters = _brentq(lambda x: x - 5, 0, 5)
        assert root == 5.0
        assert iters == 0

    def test_max_price_raises_when_deal_never_qualifies(self):
        """max_purchase_price raises if DSCR < target even at max_value (line 323-327)."""
        # With huge rent_yield + low fixed costs, even max_value is insufficient
        # 0% rent yield → no rent → DSCR always 0
        with pytest.raises(ValueError, match="does not qualify even at max_value"):
            max_purchase_price(
                target_dscr=1.0,
                rate_pct=7.0,
                rent_per_value_yr=0.001,  # extremely low yield
                hoa_monthly=150.0,
                max_value=500_000.0,  # small cap
            )
