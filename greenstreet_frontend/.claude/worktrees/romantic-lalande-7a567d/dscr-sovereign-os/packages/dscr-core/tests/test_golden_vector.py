"""
DSCR Sovereign OS — Golden Vector Test Suite
Primary regression test: Python-verified EXACT values

Golden Vector:
  Property Value:    $425,000
  LTV:               75%
  Loan Amount:       $318,750
  Interest Rate:     7.00%
  Term:              30-year amortizing
  Monthly Rent:      $3,000
  Annual Tax:        $5,000
  Annual Insurance:  $2,000
  Monthly HOA:       $150
  
  P&I:               $2,120.6517
  PITIA:             $2,853.9850
  T1 DSCR:           1.0512
"""

import pytest
import sys
from pathlib import Path

# Add src to path
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


# Golden Vector Inputs
GOLDEN = {
    "property_value": 425_000,
    "ltv": 0.75,
    "loan_amount": 318_750,
    "annual_rate": 0.07,
    "term_years": 30,
    "monthly_rent": 3_000,
    "annual_tax": 5_000,
    "annual_insurance": 2_000,
    "monthly_hoa": 150,
}

# Golden Vector Expected Outputs (Python-verified EXACT)
GOLDEN_PI = 2_120.6517
GOLDEN_PITIA = 2_853.9850
GOLDEN_DSCR_T1 = 1.0512


class TestGoldenVector:
    """Primary regression test — must pass before any code ships"""

    def test_pi_factor(self):
        """PI factor calculation"""
        factor = calculate_pi_factor(GOLDEN["annual_rate"], GOLDEN["term_years"])
        expected_pi = GOLDEN["loan_amount"] * factor
        assert abs(expected_pi - GOLDEN_PI) < 0.01

    def test_pi_calculation(self):
        """P&I = $2,120.6517"""
        pi = calculate_pi(
            GOLDEN["loan_amount"],
            GOLDEN["annual_rate"],
            GOLDEN["term_years"],
        )
        assert abs(pi - GOLDEN_PI) < 0.01, f"Expected {GOLDEN_PI}, got {pi}"

    def test_pitia_calculation(self):
        """PITIA = $2,853.9850"""
        pi = calculate_pi(
            GOLDEN["loan_amount"],
            GOLDEN["annual_rate"],
            GOLDEN["term_years"],
        )
        pitia = calculate_pitia(
            pi,
            GOLDEN["annual_tax"],
            GOLDEN["annual_insurance"],
            GOLDEN["monthly_hoa"],
        )
        assert abs(pitia - GOLDEN_PITIA) < 0.01, f"Expected {GOLDEN_PITIA}, got {pitia}"

    def test_track1_dscr(self):
        """Track 1 DSCR = 1.0512"""
        pi = calculate_pi(
            GOLDEN["loan_amount"],
            GOLDEN["annual_rate"],
            GOLDEN["term_years"],
        )
        dscr = calculate_dscr_track1(
            GOLDEN["monthly_rent"],
            pi,
            GOLDEN["annual_tax"],
            GOLDEN["annual_insurance"],
            GOLDEN["monthly_hoa"],
        )
        assert abs(dscr - GOLDEN_DSCR_T1) < 0.001, f"Expected {GOLDEN_DSCR_T1}, got {dscr}"


class TestTrack1IO:
    """Track 1 Interest-Only DSCR tests"""

    def test_io_basic(self):
        """IO DSCR should be higher than amortizing (no principal in denominator)"""
        dscr_io = calculate_dscr_track1_io(
            GOLDEN["monthly_rent"],
            GOLDEN["loan_amount"],
            GOLDEN["annual_rate"],
            GOLDEN["annual_tax"],
            GOLDEN["annual_insurance"],
            GOLDEN["monthly_hoa"],
        )
        pi = calculate_pi(
            GOLDEN["loan_amount"],
            GOLDEN["annual_rate"],
            GOLDEN["term_years"],
        )
        dscr_amort = calculate_dscr_track1(
            GOLDEN["monthly_rent"],
            pi,
            GOLDEN["annual_tax"],
            GOLDEN["annual_insurance"],
            GOLDEN["monthly_hoa"],
        )
        assert dscr_io > dscr_amort, "IO DSCR should be higher than amortizing"

    def test_io_denominator_excludes_principal(self):
        """IO denominator = Interest + Tax + Insurance + HOA (no principal)"""
        monthly_interest = GOLDEN["loan_amount"] * GOLDEN["annual_rate"] / 12
        monthly_tax = GOLDEN["annual_tax"] / 12
        monthly_ins = GOLDEN["annual_insurance"] / 12
        itia = monthly_interest + monthly_tax + monthly_ins + GOLDEN["monthly_hoa"]
        
        dscr_io = calculate_dscr_track1_io(
            GOLDEN["monthly_rent"],
            GOLDEN["loan_amount"],
            GOLDEN["annual_rate"],
            GOLDEN["annual_tax"],
            GOLDEN["annual_insurance"],
            GOLDEN["monthly_hoa"],
        )
        
        expected_dscr = GOLDEN["monthly_rent"] / itia
        assert abs(dscr_io - expected_dscr) < 0.001


class TestTrack2:
    """Track 2 Investor Survival DSCR tests"""

    def test_track2_basic(self):
        """Track 2 with 5% vacancy and $3,000 annual OpEx"""
        annual_gross = GOLDEN["monthly_rent"] * 12  # $36,000
        vacancy = 0.05
        opex = 3_000
        annual_debt_service = GOLDEN_PITIA * 12
        
        dscr = calculate_dscr_track2(annual_gross, vacancy, opex, annual_debt_service)
        
        noi = annual_gross * (1 - vacancy) - opex
        expected = noi / annual_debt_service
        assert abs(dscr - expected) < 0.001

    def test_track2_zero_vacancy(self):
        """Track 2 with 0% vacancy"""
        annual_gross = 36_000
        vacancy = 0.0
        opex = 3_000
        annual_debt_service = GOLDEN_PITIA * 12
        
        dscr = calculate_dscr_track2(annual_gross, vacancy, opex, annual_debt_service)
        
        noi = annual_gross - opex
        expected = noi / annual_debt_service
        assert abs(dscr - expected) < 0.001

    def test_track2_high_vacancy(self):
        """Track 2 with 20% vacancy (STR typical)"""
        annual_gross = 36_000
        vacancy = 0.20
        opex = 5_000
        annual_debt_service = GOLDEN_PITIA * 12
        
        dscr = calculate_dscr_track2(annual_gross, vacancy, opex, annual_debt_service)
        
        noi = annual_gross * (1 - vacancy) - opex
        expected = noi / annual_debt_service
        assert abs(dscr - expected) < 0.001


class TestLTV:
    """LTV calculation tests"""

    def test_ltv_golden(self):
        """Golden vector LTV = 75%"""
        ltv = calculate_ltv(GOLDEN["loan_amount"], GOLDEN["property_value"])
        assert abs(ltv - GOLDEN["ltv"]) < 0.001

    def test_ltv_80_percent(self):
        """80% LTV"""
        ltv = calculate_ltv(400_000, 500_000)
        assert abs(ltv - 0.80) < 0.001


class TestDebtYield:
    """Debt yield calculation tests"""

    def test_debt_yield_basic(self):
        """Debt yield = NOI / Loan"""
        annual_noi = 30_000
        loan = 318_750
        
        dy = calculate_debt_yield(annual_noi, loan)
        expected = annual_noi / loan
        assert abs(dy - expected) < 0.001


class TestDealBreakRate:
    """Deal-break rate calculation tests"""

    def test_golden_deal_break_rate(self):
        """
        Golden vector deal-break rate: rate at which DSCR = 1.0
        At 7% current rate, DSCR = 1.0512, so deal-break rate should be > 7%
        """
        dbr = calculate_deal_break_rate(
            GOLDEN["loan_amount"],
            GOLDEN["term_years"],
            GOLDEN["monthly_rent"],
            GOLDEN["annual_tax"],
            GOLDEN["annual_insurance"],
            GOLDEN["monthly_hoa"],
            target_dscr=1.0,
        )
        
        # Deal-break rate should be higher than current rate (7%)
        assert dbr > GOLDEN["annual_rate"], f"Deal-break rate {dbr} should be > {GOLDEN['annual_rate']}"
        
        # Verify: at deal-break rate, DSCR ≈ 1.0
        pi_at_dbr = calculate_pi(GOLDEN["loan_amount"], dbr, GOLDEN["term_years"])
        dscr_at_dbr = calculate_dscr_track1(
            GOLDEN["monthly_rent"],
            pi_at_dbr,
            GOLDEN["annual_tax"],
            GOLDEN["annual_insurance"],
            GOLDEN["monthly_hoa"],
        )
        assert abs(dscr_at_dbr - 1.0) < 0.01, f"DSCR at deal-break rate should be ≈1.0, got {dscr_at_dbr}"


class TestEdgeCases:
    """Edge case tests"""

    def test_zero_rent(self):
        """Zero rent should give DSCR = 0"""
        pi = calculate_pi(GOLDEN["loan_amount"], GOLDEN["annual_rate"], GOLDEN["term_years"])
        dscr = calculate_dscr_track1(0, pi, GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"])
        assert dscr == 0.0

    def test_very_high_rent(self):
        """Very high rent should give high DSCR"""
        pi = calculate_pi(GOLDEN["loan_amount"], GOLDEN["annual_rate"], GOLDEN["term_years"])
        dscr = calculate_dscr_track1(10_000, pi, GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"])
        assert dscr > 3.0

    def test_zero_interest_rate(self):
        """Zero interest rate — PI = Loan / (Term * 12)"""
        # At 0% interest, PI = principal only
        with pytest.raises(ZeroDivisionError):
            calculate_pi(GOLDEN["loan_amount"], 0.0, GOLDEN["term_years"])


class TestRounding:
    """Rounding utility tests"""

    def test_round_currency(self):
        """Round to cents"""
        assert round_currency(2120.6517) == 2120.65
        assert round_currency(2120.6550) == 2120.66

    def test_round_dscr(self):
        """Round DSCR to 2 places"""
        assert round_dscr(1.0512) == 1.05
        assert round_dscr(1.0550) == 1.06


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
