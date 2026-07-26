"""
DSCR Sovereign OS — Edge Case Tests for calculator.py
Covers: extreme rates, extreme LTV, zero components, boundary conditions
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from calculator import (
    calculate_pi,
    calculate_pi_factor,
    calculate_pitia,
    calculate_dscr_track1,
    calculate_dscr_track1_io,
    calculate_dscr_track2,
    calculate_dscr_track3,
    calculate_dscr_track4,
    calculate_debt_yield,
    calculate_ltv,
    calculate_deal_break_rate,
    round_currency,
    round_dscr,
)


# ═══════════════════════════════════════════════════════════════════════════
# 1. Extreme rate scenarios
# ═══════════════════════════════════════════════════════════════════════════
class TestExtremeRates:
    """Edge cases for interest rate inputs"""

    def test_very_low_rate_1pct(self):
        """1% rate — P&I should be close to principal/360"""
        pi = calculate_pi(318_750, 0.01, 30)
        # At 1%, monthly payment ~ $1,026
        assert 900 < pi < 1200

    def test_very_high_rate_15pct(self):
        """15% rate — P&I should be very high"""
        pi = calculate_pi(318_750, 0.15, 30)
        # At 15%, monthly payment ~ $4,047
        assert pi > 3500

    def test_rate_near_zero_gives_near_principal_only(self):
        """Rate approaching 0 — payment approaches loan / months"""
        pi = calculate_pi(360_000, 0.0001, 30)
        principal_only = 360_000 / 360
        assert abs(pi - principal_only) < 5.0

    def test_zero_rate_raises(self):
        """Zero rate causes division by zero in PI factor"""
        with pytest.raises(ZeroDivisionError):
            calculate_pi(318_750, 0.0, 30)


# ═══════════════════════════════════════════════════════════════════════════
# 2. Extreme LTV scenarios
# ═══════════════════════════════════════════════════════════════════════════
class TestExtremeLTV:
    """Edge cases for LTV calculations"""

    def test_ltv_95_percent(self):
        """95% LTV — high-leverage"""
        ltv = calculate_ltv(475_000, 500_000)
        assert abs(ltv - 0.95) < 0.0001

    def test_ltv_50_percent(self):
        """50% LTV — conservative"""
        ltv = calculate_ltv(250_000, 500_000)
        assert abs(ltv - 0.50) < 0.0001

    def test_ltv_100_percent(self):
        """100% LTV — full financing"""
        ltv = calculate_ltv(500_000, 500_000)
        assert abs(ltv - 1.0) < 0.0001

    def test_ltv_over_100(self):
        """LTV > 100% — underwater scenario"""
        ltv = calculate_ltv(600_000, 500_000)
        assert ltv == 1.2

    def test_ltv_very_small_loan(self):
        """Very small loan relative to value"""
        ltv = calculate_ltv(10_000, 1_000_000)
        assert abs(ltv - 0.01) < 0.0001


# ═══════════════════════════════════════════════════════════════════════════
# 3. Zero HOA / zero tax / zero insurance
# ═══════════════════════════════════════════════════════════════════════════
class TestZeroComponents:
    """Edge cases where one or more PITIA components are zero"""

    def test_zero_hoa(self):
        """Zero HOA — PITIA = P&I + Tax/12 + Insurance/12"""
        pi = 2_120.6517
        pitia = calculate_pitia(pi, 5_000, 2_000, 0)
        expected = pi + 5_000 / 12 + 2_000 / 12
        assert abs(pitia - expected) < 0.01

    def test_zero_tax(self):
        """Zero property tax — PITIA = P&I + Insurance/12 + HOA"""
        pi = 2_120.6517
        pitia = calculate_pitia(pi, 0, 2_000, 150)
        expected = pi + 0 + 2_000 / 12 + 150
        assert abs(pitia - expected) < 0.01

    def test_zero_insurance(self):
        """Zero insurance — PITIA = P&I + Tax/12 + HOA"""
        pi = 2_120.6517
        pitia = calculate_pitia(pi, 5_000, 0, 150)
        expected = pi + 5_000 / 12 + 0 + 150
        assert abs(pitia - expected) < 0.01

    def test_all_zero_except_pi(self):
        """Only P&I — no taxes, insurance, HOA"""
        pitia = calculate_pitia(2_000, 0, 0, 0)
        assert pitia == 2_000

    def test_zero_hoa_dscr_higher(self):
        """DSCR should be higher with zero HOA (smaller denominator)"""
        pi = 2_120.6517
        dscr_with_hoa = calculate_dscr_track1(3_000, pi, 5_000, 2_000, 150)
        dscr_no_hoa = calculate_dscr_track1(3_000, pi, 5_000, 2_000, 0)
        assert dscr_no_hoa > dscr_with_hoa


# ═══════════════════════════════════════════════════════════════════════════
# 4. Term length edge cases
# ═══════════════════════════════════════════════════════════════════════════
class TestTermLength:
    """Edge cases for loan term"""

    def test_15_year_term(self):
        """15-year term — higher P&I than 30-year"""
        pi_30 = calculate_pi(318_750, 0.07, 30)
        pi_15 = calculate_pi(318_750, 0.07, 15)
        assert pi_15 > pi_30

    def test_40_year_term(self):
        """40-year term — lower P&I than 30-year"""
        pi_30 = calculate_pi(318_750, 0.07, 30)
        pi_40 = calculate_pi(318_750, 0.07, 40)
        assert pi_40 < pi_30

    def test_1_year_term(self):
        """1-year term — payment ≈ principal/12 + interest"""
        pi = calculate_pi(120_000, 0.06, 1)
        # Should be roughly $10,300/mo (120K/12 + interest)
        assert pi > 10_000

    def test_pi_factor_decreases_with_longer_term(self):
        """Longer term = lower monthly factor"""
        factor_15 = calculate_pi_factor(0.07, 15)
        factor_30 = calculate_pi_factor(0.07, 30)
        factor_40 = calculate_pi_factor(0.07, 40)
        assert factor_15 > factor_30 > factor_40


# ═══════════════════════════════════════════════════════════════════════════
# 5. Extreme rent scenarios
# ═══════════════════════════════════════════════════════════════════════════
class TestExtremeRent:
    """Edge cases for rent inputs"""

    def test_zero_rent_gives_zero_dscr(self):
        pi = calculate_pi(318_750, 0.07, 30)
        dscr = calculate_dscr_track1(0, pi, 5_000, 2_000, 150)
        assert dscr == 0.0

    def test_rent_equals_pitia_gives_dscr_1(self):
        """When rent = PITIA exactly, DSCR = 1.0"""
        pi = 2_120.6517
        pitia = calculate_pitia(pi, 5_000, 2_000, 150)
        dscr = calculate_dscr_track1(pitia, pi, 5_000, 2_000, 150)
        assert abs(dscr - 1.0) < 0.001

    def test_very_high_rent(self):
        """$20K/mo rent on $318K loan — very high DSCR"""
        pi = calculate_pi(318_750, 0.07, 30)
        dscr = calculate_dscr_track1(20_000, pi, 5_000, 2_000, 150)
        assert dscr > 5.0


# ═══════════════════════════════════════════════════════════════════════════
# 6. Debt yield edge cases
# ═══════════════════════════════════════════════════════════════════════════
class TestDebtYieldEdge:
    """Edge cases for debt yield"""

    def test_debt_yield_institutional_floor(self):
        """Institutional floor ~9-10%"""
        dy = calculate_debt_yield(30_000, 318_750)
        # ~9.4% — near institutional floor
        assert 0.09 < dy < 0.10

    def test_debt_yield_low_noi(self):
        """Low NOI gives low debt yield"""
        dy = calculate_debt_yield(10_000, 500_000)
        assert abs(dy - 0.02) < 0.001

    def test_debt_yield_high_noi(self):
        """High NOI gives high debt yield"""
        dy = calculate_debt_yield(100_000, 500_000)
        assert abs(dy - 0.20) < 0.001


# ═══════════════════════════════════════════════════════════════════════════
# 7. Track 3 & 4 edge cases
# ═══════════════════════════════════════════════════════════════════════════
class TestTrack3Edge:
    """Edge cases for Track 3 Stabilized DSCR"""

    def test_track3_equals_track2_at_zero_vacancy(self):
        """Track 3 with full NOI = Track 2 at 0% vacancy, 0 OpEx"""
        annual_gross = 36_000
        annual_debt = 34_247.82  # PITIA * 12
        track2 = calculate_dscr_track2(annual_gross, 0.0, 0, annual_debt)
        track3 = calculate_dscr_track3(annual_gross, annual_debt)
        assert abs(track2 - track3) < 0.001

    def test_track3_normalized_noi(self):
        """Track 3 with normalized NOI"""
        noi = 28_000
        debt = 34_247.82
        dscr = calculate_dscr_track3(noi, debt)
        expected = noi / debt
        assert abs(dscr - expected) < 0.001


class TestTrack4Edge:
    """Edge cases for Track 4 Forward DSCR"""

    def test_track4_rate_increase_scenario(self):
        """Forward DSCR with rate increase — lower DSCR"""
        forward_noi = 32_000
        forward_debt = 38_000  # Higher due to rate increase
        dscr = calculate_dscr_track4(forward_noi, forward_debt)
        assert dscr < 1.0

    def test_track4_improving_scenario(self):
        """Forward DSCR with improving NOI"""
        forward_noi = 40_000
        forward_debt = 34_000
        dscr = calculate_dscr_track4(forward_noi, forward_debt)
        assert dscr > 1.1


# ═══════════════════════════════════════════════════════════════════════════
# 8. Rounding edge cases
# ═══════════════════════════════════════════════════════════════════════════
class TestRoundingEdge:
    """Edge cases for rounding utilities"""

    def test_round_currency_exact_cents(self):
        """Already at cents — no change"""
        assert round_currency(100.50) == 100.50

    def test_round_currency_half_up(self):
        """Banker's rounding: .005 rounds up"""
        assert round_currency(100.005) == 100.01

    def test_round_currency_very_small(self):
        """Very small amount"""
        assert round_currency(0.001) == 0.0

    def test_round_dscr_4_places(self):
        """Round to 4 decimal places"""
        result = round_dscr(1.05123, 4)
        assert abs(result - 1.0512) < 0.0001

    def test_round_dscr_6_places(self):
        """Round to 6 decimal places"""
        result = round_dscr(1.0512345, 6)
        assert abs(result - 1.051235) < 0.000001

    def test_round_currency_negative(self):
        """Negative amount rounding"""
        assert round_currency(-123.456) == -123.46


# ═══════════════════════════════════════════════════════════════════════════
# 9. Deal-break rate edge cases
# ═══════════════════════════════════════════════════════════════════════════
class TestDealBreakRateEdge:
    """Edge cases for deal-break rate calculation"""

    def test_high_rent_gives_higher_deal_break_rate(self):
        """Higher rent → higher deal-break rate (can tolerate higher interest)"""
        dbr_low = calculate_deal_break_rate(318_750, 30, 2_000, 5_000, 2_000, 150)
        dbr_high = calculate_deal_break_rate(318_750, 30, 5_000, 5_000, 2_000, 150)
        assert dbr_high > dbr_low

    def test_deal_break_rate_target_125(self):
        """Target DSCR 1.25 → lower deal-break rate than target 1.0"""
        dbr_100 = calculate_deal_break_rate(318_750, 30, 3_000, 5_000, 2_000, 150, 1.0)
        dbr_125 = calculate_deal_break_rate(318_750, 30, 3_000, 5_000, 2_000, 150, 1.25)
        assert dbr_100 > dbr_125

    def test_deal_break_rate_always_positive(self):
        """Deal-break rate should always be positive"""
        dbr = calculate_deal_break_rate(200_000, 30, 1_500, 3_000, 1_000, 50)
        assert dbr > 0
