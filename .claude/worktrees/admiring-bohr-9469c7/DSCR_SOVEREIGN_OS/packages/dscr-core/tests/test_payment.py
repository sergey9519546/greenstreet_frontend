"""Tests for payment.py — payment_factor, pi, piti, pitia.

Locks the verified payment factors at 6.125% / 7.00% / 8.25% and the canonical
Sovereign Master v11.0 P&I / PITIA values to 4 decimal places.
"""

from __future__ import annotations

import pytest

from dscr_core.payment import payment_factor, pi, piti, pitia


class TestPaymentFactor:
    """Verify payment factor formula against Sovereign Master + Master DSCR Knowledge."""

    def test_factor_at_7pct_30yr(self):
        """payment_factor(7.00, 360) = 0.00665302 ± 0.0000001"""
        f = payment_factor(7.00, 360)
        assert f == pytest.approx(0.00665302, abs=1e-7)

    def test_factor_at_6_125pct_30yr(self):
        """payment_factor(6.125, 360) = 0.00607614 ± 0.0000001"""
        f = payment_factor(6.125, 360)
        assert f == pytest.approx(0.00607614, abs=1e-7)

    def test_factor_at_8_25pct_30yr(self):
        """payment_factor(8.25, 360) = 0.00751266 ± 0.0000001"""
        f = payment_factor(8.25, 360)
        assert f == pytest.approx(0.00751266, abs=1e-7)

    def test_factor_at_0pct(self):
        """payment_factor(0, n) = 1/n (level principal)"""
        assert payment_factor(0, 360) == pytest.approx(1 / 360, abs=1e-12)
        assert payment_factor(0, 180) == pytest.approx(1 / 180, abs=1e-12)

    def test_factor_increases_with_rate(self):
        """Higher rate -> higher payment factor (monotonic)"""
        f_5 = payment_factor(5.0, 360)
        f_7 = payment_factor(7.0, 360)
        f_10 = payment_factor(10.0, 360)
        assert f_5 < f_7 < f_10

    def test_factor_decreases_with_term(self):
        """Longer term -> lower payment factor (monotonic)"""
        f_15 = payment_factor(7.0, 180)
        f_30 = payment_factor(7.0, 360)
        f_50 = payment_factor(7.0, 600)
        assert f_15 > f_30 > f_50

    def test_factor_rejects_zero_term(self):
        with pytest.raises(ValueError, match="n_months must be > 0"):
            payment_factor(7.0, 0)

    def test_factor_rejects_negative_term(self):
        with pytest.raises(ValueError, match="n_months must be > 0"):
            payment_factor(7.0, -12)

    def test_factor_rejects_excessive_term(self):
        with pytest.raises(ValueError, match="n_months must be <= 600"):
            payment_factor(7.0, 601)

    def test_factor_rejects_float_term(self):
        with pytest.raises(TypeError, match="n_months must be int"):
            payment_factor(7.0, 360.0)


class TestPI:
    """Verify P&I on the canonical $318,750 loan at 7.00%/30yr."""

    def test_pi_golden_vector(self, v11_golden):
        """P&I on $318,750 @ 7.00% / 30yr = $2,120.6517"""
        result = pi(v11_golden["loan_amount"], v11_golden["annual_rate_pct"])
        assert result == pytest.approx(v11_golden["expected_pi"], abs=0.001)

    def test_pi_zero_loan(self):
        assert pi(0, 7.00) == 0.0

    def test_pi_rejects_negative_loan(self):
        with pytest.raises(ValueError, match="loan must be >= 0"):
            pi(-1000, 7.00)

    def test_pi_uses_default_360_months(self):
        """pi(loan, rate) with no term defaults to 360."""
        assert pi(100000, 7.00) == pi(100000, 7.00, 360)


class TestPITI:
    def test_piti_with_tax_and_insurance(self):
        """piti(2000, 5000, 1500) = 2000 + 416.67 + 125 = 2541.67"""
        result = piti(2000.0, 5000.0, 1500.0)
        assert result == pytest.approx(2541.6667, abs=0.01)

    def test_piti_rejects_negative_tax(self):
        with pytest.raises(ValueError, match="tax_annual must be >= 0"):
            piti(2000.0, -100, 1500.0)

    def test_piti_rejects_negative_insurance(self):
        with pytest.raises(ValueError, match="insurance_annual must be >= 0"):
            piti(2000.0, 5000.0, -100)


class TestPITIA:
    def test_pitia_golden_vector(self, v11_golden):
        """PITIA on golden vector = $2,853.9850"""
        result = pitia(
            v11_golden["expected_pi"],
            tax_annual=v11_golden["annual_tax"],
            insurance_annual=v11_golden["annual_insurance"],
            hoa_monthly=v11_golden["monthly_hoa"],
        )
        assert result == pytest.approx(v11_golden["expected_pitia"], abs=0.01)

    def test_pitia_with_flood_and_mi(self):
        """flood + MI add to PITIA but don't change PITI."""
        base = pitia(2000.0, 5000.0, 1500.0, 100.0)
        with_flood = pitia(2000.0, 5000.0, 1500.0, 100.0, flood_monthly=50.0)
        with_mi = pitia(2000.0, 5000.0, 1500.0, 100.0, flood_monthly=50.0, mi_monthly=75.0)
        assert with_flood - base == pytest.approx(50.0, abs=0.001)
        assert with_mi - with_flood == pytest.approx(75.0, abs=0.001)

    def test_pitia_full_golden_with_flood(self, v11_golden):
        """PITIA on golden vector + flood $50/mo."""
        result = pitia(
            v11_golden["expected_pi"],
            tax_annual=v11_golden["annual_tax"],
            insurance_annual=v11_golden["annual_insurance"],
            hoa_monthly=v11_golden["monthly_hoa"],
            flood_monthly=50.0,
        )
        assert result == pytest.approx(v11_golden["expected_pitia"] + 50.0, abs=0.01)


class TestCrossRate:
    """Cross-check P&I at multiple rates for $100K loan to ensure no off-by-one errors."""

    @pytest.mark.parametrize(
        "rate,expected_pi",
        [
            (5.00, 536.82),  # $100K @ 5% 30yr = $536.82
            (6.00, 599.55),  # $100K @ 6% 30yr = $599.55
            (7.00, 665.30),  # $100K @ 7% 30yr = $665.30
            (8.00, 733.76),  # $100K @ 8% 30yr = $733.76
        ],
    )
    def test_pi_100k_at_various_rates(self, rate, expected_pi):
        result = pi(100000, rate, 360)
        assert result == pytest.approx(expected_pi, abs=0.05)

    def test_textbook_amortization_10pct_100k(self):
        """Primary-source fact check: $100K / 10% / 30yr = $877.57/mo.
        Source: Brueggeman & Fisher, Real Estate Finance (textbook reference),
        also reproducible in any standard amortization calculator (Bankrate,
        mortgagecalculator.org, etc.).
        """
        # Must match to within $0.10 to account for rounding.
        result = pi(100000, 10.0, 360)
        assert result == pytest.approx(877.57, abs=0.10)

    def test_fred_dgs10_proxy_at_4_43pct(self):
        """Sanity check against current 10-year Treasury yield (4.43% June 2026).
        $100K @ 4.43% / 30yr should be ~$502.53/mo.
        """
        result = pi(100000, 4.43, 360)
        # Linear interp: $100K @ 4% = $477.42, @ 5% = $536.82
        # At 4.43%: ~ $502.53
        assert 500 < result < 505
