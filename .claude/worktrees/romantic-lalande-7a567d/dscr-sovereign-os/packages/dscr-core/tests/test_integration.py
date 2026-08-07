"""
DSCR Sovereign OS — Integration Tests
Combining Track 1 (lender qualifying) + Track 2 (investor survival) calculations
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from calculator import (
    calculate_pi,
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
from ppp_rules import check_ppp_eligibility, PPPEligibility


# ── Shared golden vector ────────────────────────────────────────────────────
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


def golden_deal():
    """Run full golden vector pipeline and return all intermediate values"""
    pi = calculate_pi(GOLDEN["loan_amount"], GOLDEN["annual_rate"], GOLDEN["term_years"])
    pitia = calculate_pitia(pi, GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"])
    t1 = calculate_dscr_track1(GOLDEN["monthly_rent"], pi, GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"])
    annual_debt = pitia * 12
    t2 = calculate_dscr_track2(GOLDEN["monthly_rent"] * 12, 0.05, 3_000, annual_debt)
    return {
        "pi": pi,
        "pitia": pitia,
        "t1_dscr": t1,
        "t2_dscr": t2,
        "annual_debt": annual_debt,
    }


# ═══════════════════════════════════════════════════════════════════════════
# 1. Full pipeline — Track 1 + Track 2 combined
# ═══════════════════════════════════════════════════════════════════════════
class TestFullPipeline:
    """End-to-end pipeline: inputs → P&I → PITIA → T1 DSCR → T2 DSCR"""

    def test_golden_pipeline_consistency(self):
        """All golden vector outputs are internally consistent"""
        deal = golden_deal()
        # P&I * 12 should be less than annual debt service
        assert deal["pi"] * 12 < deal["annual_debt"]
        # PITIA should include P&I
        assert deal["pitia"] > deal["pi"]
        # T1 DSCR = rent / PITIA
        assert abs(deal["t1_dscr"] - GOLDEN["monthly_rent"] / deal["pitia"]) < 0.0001

    def test_t1_and_t2_relationship(self):
        """Track 2 should be lower than Track 1 (vacancy + OpEx reduce NOI)"""
        deal = golden_deal()
        assert deal["t2_dscr"] < deal["t1_dscr"], (
            f"T2 ({deal['t2_dscr']:.4f}) should be < T1 ({deal['t1_dscr']:.4f})"
        )

    def test_t1_greater_than_one(self):
        """Golden vector T1 DSCR > 1.0 (cash-flowing)"""
        deal = golden_deal()
        assert deal["t1_dscr"] > 1.0

    def test_t2_with_zero_vacancy_and_opex(self):
        """T2 with 0% vacancy, 0 OpEx should equal T1"""
        pi = calculate_pi(GOLDEN["loan_amount"], GOLDEN["annual_rate"], GOLDEN["term_years"])
        pitia = calculate_pitia(pi, GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"])
        t1 = calculate_dscr_track1(GOLDEN["monthly_rent"], pi, GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"])
        t2 = calculate_dscr_track2(GOLDEN["monthly_rent"] * 12, 0.0, 0, pitia * 12)
        assert abs(t1 - t2) < 0.001


# ═══════════════════════════════════════════════════════════════════════════
# 2. IO vs Amortizing comparison
# ═══════════════════════════════════════════════════════════════════════════
class TestIOvsAmortizing:
    """Integration: IO should always produce higher DSCR than amortizing"""

    def test_io_beats_amortizing_golden(self):
        t1_amort = calculate_dscr_track1(
            GOLDEN["monthly_rent"], 
            calculate_pi(GOLDEN["loan_amount"], GOLDEN["annual_rate"], GOLDEN["term_years"]),
            GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"],
        )
        t1_io = calculate_dscr_track1_io(
            GOLDEN["monthly_rent"], GOLDEN["loan_amount"], GOLDEN["annual_rate"],
            GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"],
        )
        assert t1_io > t1_amort

    def test_io_beats_amortizing_high_rate(self):
        """IO advantage is larger at higher rates (more principal in amortizing)"""
        rate = 0.12
        loan = 400_000
        t1_amort = calculate_dscr_track1(4_000, calculate_pi(loan, rate, 30), 6_000, 2_400, 200)
        t1_io = calculate_dscr_track1_io(4_000, loan, rate, 6_000, 2_400, 200)
        assert t1_io > t1_amort

    def test_io_advantage_always_positive(self):
        """The IO DSCR advantage should be positive for any loan size"""
        rate = 0.07
        rent = 3_000
        tax, ins, hoa = 4_000, 1_800, 100

        for loan in [100_000, 250_000, 400_000, 600_000]:
            io = calculate_dscr_track1_io(rent, loan, rate, tax, ins, hoa)
            amort = calculate_dscr_track1(rent, calculate_pi(loan, rate, 30), tax, ins, hoa)
            assert io > amort, f"IO advantage lost at loan={loan}"


# ═══════════════════════════════════════════════════════════════════════════
# 3. Multiple deal scenarios (full pipeline)
# ═══════════════════════════════════════════════════════════════════════════
class TestMultipleDealScenarios:
    """Full T1 + T2 pipeline across different deal profiles"""

    def test_cash_flow_positive_deal(self):
        """Strong deal — both T1 and T2 > 1.0"""
        pi = calculate_pi(200_000, 0.065, 30)
        t1 = calculate_dscr_track1(2_500, pi, 3_000, 1_500, 100)
        pitia = calculate_pitia(pi, 3_000, 1_500, 100)
        t2 = calculate_dscr_track2(30_000, 0.05, 2_000, pitia * 12)
        assert t1 > 1.0
        assert t2 > 1.0

    def test_marginal_deal(self):
        """Marginal deal — T1 just above 1.0, T2 below"""
        pi = calculate_pi(350_000, 0.075, 30)
        t1 = calculate_dscr_track1(3_200, pi, 5_500, 2_200, 200)
        pitia = calculate_pitia(pi, 5_500, 2_200, 200)
        t2 = calculate_dscr_track2(38_400, 0.08, 5_000, pitia * 12)
        # T1 should be near or above 1.0
        assert t1 > 0.9
        # T2 may be below 1.0 for marginal deal
        assert t2 < t1

    def test_cash_flow_negative_deal(self):
        """Bad deal — T1 < 1.0"""
        pi = calculate_pi(500_000, 0.08, 30)
        t1 = calculate_dscr_track1(3_000, pi, 8_000, 3_000, 300)
        assert t1 < 1.0

    def test_high_rent_low_loan(self):
        """Favorable deal — high DSCR across all tracks"""
        pi = calculate_pi(150_000, 0.065, 30)
        t1 = calculate_dscr_track1(3_000, pi, 2_000, 1_000, 50)
        pitia = calculate_pitia(pi, 2_000, 1_000, 50)
        t2 = calculate_dscr_track2(36_000, 0.05, 2_000, pitia * 12)
        assert t1 > 2.0
        assert t2 > 1.5


# ═══════════════════════════════════════════════════════════════════════════
# 4. Deal-break rate + DSCR consistency
# ═══════════════════════════════════════════════════════════════════════════
class TestDealBreakConsistency:
    """Deal-break rate should produce DSCR ≈ 1.0 when used in Track 1"""

    def test_deal_break_produces_dscr_1(self):
        dbr = calculate_deal_break_rate(
            318_750, 30, 3_000, 5_000, 2_000, 150, target_dscr=1.0,
        )
        pi_at_dbr = calculate_pi(318_750, dbr, 30)
        dscr = calculate_dscr_track1(3_000, pi_at_dbr, 5_000, 2_000, 150)
        assert abs(dscr - 1.0) < 0.01

    def test_deal_break_produces_dscr_125(self):
        dbr = calculate_deal_break_rate(
            318_750, 30, 3_000, 5_000, 2_000, 150, target_dscr=1.25,
        )
        pi_at_dbr = calculate_pi(318_750, dbr, 30)
        dscr = calculate_dscr_track1(3_000, pi_at_dbr, 5_000, 2_000, 150)
        assert abs(dscr - 1.25) < 0.01

    def test_deal_break_with_different_loan(self):
        """Deal-break rate consistency for a different deal"""
        loan = 250_000
        rent = 2_800
        tax, ins, hoa = 4_000, 1_800, 100
        dbr = calculate_deal_break_rate(loan, 30, rent, tax, ins, hoa, 1.0)
        pi_at_dbr = calculate_pi(loan, dbr, 30)
        dscr = calculate_dscr_track1(rent, pi_at_dbr, tax, ins, hoa)
        assert abs(dscr - 1.0) < 0.01


# ═══════════════════════════════════════════════════════════════════════════
# 5. LTV + DSCR combined analysis
# ═══════════════════════════════════════════════════════════════════════════
class TestLTVAndDSCR:
    """Integration: LTV and DSCR together characterize deal quality"""

    def test_high_ltv_lower_dscr(self):
        """Higher LTV → larger loan → lower DSCR (same rent)"""
        prop_val = 500_000
        rent = 3_500
        rate = 0.07
        tax, ins, hoa = 5_000, 2_000, 150

        ltv_70 = calculate_ltv(350_000, prop_val)
        pi_70 = calculate_pi(350_000, rate, 30)
        dscr_70 = calculate_dscr_track1(rent, pi_70, tax, ins, hoa)

        ltv_85 = calculate_ltv(425_000, prop_val)
        pi_85 = calculate_pi(425_000, rate, 30)
        dscr_85 = calculate_dscr_track1(rent, pi_85, tax, ins, hoa)

        assert ltv_85 > ltv_70
        assert dscr_85 < dscr_70

    def test_ltv_75_golden_vector(self):
        """Golden vector: LTV 75% produces known DSCR"""
        ltv = calculate_ltv(GOLDEN["loan_amount"], GOLDEN["property_value"])
        pi = calculate_pi(GOLDEN["loan_amount"], GOLDEN["annual_rate"], GOLDEN["term_years"])
        dscr = calculate_dscr_track1(GOLDEN["monthly_rent"], pi, GOLDEN["annual_tax"], GOLDEN["annual_insurance"], GOLDEN["monthly_hoa"])
        assert abs(ltv - 0.75) < 0.001
        assert abs(dscr - 1.0512) < 0.001


# ═══════════════════════════════════════════════════════════════════════════
# 6. PPP + Calculator integration
# ═══════════════════════════════════════════════════════════════════════════
class TestPPPAndCalculatorIntegration:
    """Integration: PPP eligibility + DSCR calculations for real deal scenarios"""

    def test_pa_deal_above_threshold(self):
        """PA deal above $329K threshold — PPP allowed, DSCR computed"""
        ppp = check_ppp_eligibility("PA", "LLC", 400_000, 2, True)
        pi = calculate_pi(400_000, 0.07, 30)
        dscr = calculate_dscr_track1(3_500, pi, 5_000, 2_000, 150)
        assert ppp["eligibility"] == PPPEligibility.ALLOWED
        assert dscr > 0.8

    def test_pa_deal_below_threshold(self):
        """PA deal below $329K threshold — PPP prohibited"""
        ppp = check_ppp_eligibility("PA", "Individual", 200_000, 1, False)
        assert ppp["eligibility"] == PPPEligibility.PROHIBITED

    def test_nj_llc_with_dscr_analysis(self):
        """NJ LLC — PPP high-risk, but DSCR still calculable"""
        ppp = check_ppp_eligibility("NJ", "LLC", 350_000, 2, True)
        pi = calculate_pi(350_000, 0.075, 30)
        dscr = calculate_dscr_track1(3_200, pi, 4_500, 2_000, 200)
        assert ppp["eligibility"] == PPPEligibility.HIGH_RISK
        assert dscr > 0  # DSCR is still valid

    def test_ms_declining_with_dscr(self):
        """MS — declining-only PPP, DSCR computed"""
        ppp = check_ppp_eligibility("MS", "LLC", 300_000, 2, True)
        pi = calculate_pi(300_000, 0.07, 30)
        dscr = calculate_dscr_track1(2_800, pi, 4_000, 1_500, 100)
        assert ppp["eligibility"] == PPPEligibility.DECLINING_ONLY
        assert dscr > 0

    def test_ca_business_exempt_with_dscr(self):
        """CA — business exempt, positive DSCR"""
        ppp = check_ppp_eligibility("CA", "LLC", 500_000, 2, True)
        pi = calculate_pi(500_000, 0.065, 30)
        dscr = calculate_dscr_track1(4_500, pi, 6_000, 2_500, 200)
        assert ppp["eligibility"] == PPPEligibility.ALLOWED
        assert dscr > 0.9
