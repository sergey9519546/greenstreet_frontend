"""v16.0.0 Master Consolidated Spec regression tests.

Each test corresponds to a specific BUG/FLAW/RISK/IMP from the v16 spec.
These lock the math against the v16 regression suite (TEST-01).

Source: C:\\Users\\serge\\OneDrive\\Documents\\DSCR_LOAN OFFICE\\
              DSCR_Underwriting_Engine_Master_Consolidated_v16.md
"""

from __future__ import annotations

import pytest

from dscr_core import (
    breakeven_occupancy,
    dscr_all_in,
    dscr_track3_stabilized,
    ltv,
    max_loan_io,
    noi_at_year,
    value_for_ltv,
)


class TestBUG01ValueForLTV:
    """BUG-01: LTV denominator must use `min()` for purchases, NOT `max()`."""

    def test_ltv_purchase_low_appraisal(self):
        """v16 regression: LTV(loan=400K, price=500K, appraisal=480K, PURCHASE)
        must use min(480K, 500K) = 480K, giving 400K/480K = 0.8333.

        BEFORE FIX (incorrect): 400K / max(480K, 500K) = 400K/500K = 0.80 (misprices)
        AFTER FIX (correct):     400K / min(480K, 500K) = 400K/480K = 0.8333
        """
        result = ltv(400000, "PURCHASE", 480000, 500000)
        assert result == pytest.approx(400000 / 480000, abs=0.0001)

    def test_ltv_purchase_low_contract_price(self):
        """v16 regression: LTV(loan=375K, price=500K, appraisal=525K, PURCHASE)
        must use min(525K, 500K) = 500K, giving 375K/500K = 0.75.

        BEFORE FIX (incorrect): 375K / max(525K, 500K) = 375K/525K = 0.7143 (under)
        AFTER FIX (correct):     375K / min(525K, 500K) = 375K/500K = 0.75
        """
        result = ltv(375000, "PURCHASE", 525000, 500000)
        assert result == pytest.approx(375000 / 500000, abs=0.0001)

    def test_ltv_refi_uses_appraisal(self):
        """RATE_TERM_REFI uses appraisal only (no min with purchase price)."""
        result = ltv(300000, "RATE_TERM_REFI", 500000)
        assert result == pytest.approx(0.60, abs=0.0001)

    def test_ltv_cash_out_low_seasoning_uses_min(self):
        """Cash-out refi with low seasoning uses min(appraisal, original_price)."""
        result = ltv(
            300000,
            "CASH_OUT_REFI",
            500000,
            original_purchase_price=400000,
            cash_out_and_low_seasoning=True,
        )
        assert result == pytest.approx(300000 / 400000, abs=0.0001)

    def test_value_for_ltv_unsupported_type_raises(self):
        with pytest.raises(ValueError, match="Unsupported transaction_type"):
            value_for_ltv("WHOLESALE", 500000)

    def test_value_for_ltv_purchase_requires_price(self):
        with pytest.raises(ValueError, match="purchase_price required"):
            value_for_ltv("PURCHASE", 500000, purchase_price=None)

    def test_value_for_ltv_delayed_financing_low_seasoning_no_orig_price(self):
        """DELAYED_FINANCING with seasoning < 6 months and no original_purchase_price raises."""
        with pytest.raises(ValueError, match="original_purchase_price required"):
            value_for_ltv(
                "DELAYED_FINANCING",
                appraised_value=500000,
                seasoning_months=3,
                original_purchase_price=None,
            )

    def test_value_for_ltv_delayed_financing_low_seasoning_uses_min(self):
        """DELAYED_FINANCING with seasoning < 6 months uses min(appraisal, original_price)."""
        # appraisal=550K, original=480K -> min = 480K
        result = value_for_ltv(
            "DELAYED_FINANCING",
            appraised_value=550000,
            seasoning_months=3,
            original_purchase_price=480000,
        )
        assert result == 480000
        # opposite case: appraisal=500K, original=550K -> min = 500K
        result2 = value_for_ltv(
            "DELAYED_FINANCING",
            appraised_value=500000,
            seasoning_months=3,
            original_purchase_price=550000,
        )
        assert result2 == 500000

    def test_value_for_ltv_delayed_financing_high_seasoning_uses_appraisal(self):
        """DELAYED_FINANCING with seasoning >= 6 months uses appraisal only (no min)."""
        result = value_for_ltv(
            "DELAYED_FINANCING",
            appraised_value=500000,
            seasoning_months=6,
            original_purchase_price=400000,  # ignored
        )
        assert result == 500000
        # Also test with 12 months seasoning
        result2 = value_for_ltv(
            "DELAYED_FINANCING",
            appraised_value=500000,
            seasoning_months=12,
            original_purchase_price=400000,  # ignored
        )
        assert result2 == 500000
        # seasoning_months=None falls through to the low-seasoning branch
        result3 = value_for_ltv(
            "DELAYED_FINANCING",
            appraised_value=500000,
            seasoning_months=None,
            original_purchase_price=450000,
        )
        assert result3 == 450000

    def test_ltv_delayed_financing_end_to_end(self):
        """End-to-end: ltv() wrapper with DELAYED_FINANCING + low seasoning."""
        # Loan=$300K, appraisal=$500K, original=$400K, seasoning=3mo
        # value = min(500K, 400K) = 400K
        # LTV = 300K / 400K = 0.75
        result = ltv(
            loan_amount=300000,
            transaction_type="DELAYED_FINANCING",
            appraised_value=500000,
            seasoning_months=3,
            original_purchase_price=400000,
        )
        assert result == pytest.approx(0.75, abs=0.0001)


class TestBUG02NOIAtYear:
    """BUG-02: NOI growth exponent off-by-one.
    Year N NOI = Year1 × (1+g)^(N-1), NOT (1+g)^N.
    """

    def test_year1_no_growth(self):
        """noi_at_year(100K, 0.03, 1) == 100K (year 1 = base, no growth applied)."""
        assert noi_at_year(100000, 0.03, 1) == pytest.approx(100000.0, abs=0.01)

    def test_year3_growth_v16_regression(self):
        """v16 regression: noi_at_year(100K, 0.03, 3) == 106090.00 (NOT 109,272.70).

        BEFORE FIX (incorrect): 100K × (1.03)^3 = 109,272.70 (off-by-one)
        AFTER FIX (correct):     100K × (1.03)^2 = 106,090.00 (matches v16 spec)
        """
        assert noi_at_year(100000, 0.03, 3) == pytest.approx(106090.00, abs=0.01)

    def test_year5_growth_v16_scenario_2(self):
        """v16 Scenario 2: noi_at_year(32K, 0.03, 5) == 32K × (1.03)^4 = 36,016.28.

        Note: v16 spec text says "$36,016.85" but the actual math (32,000 * 1.12550881)
        = $36,016.28. The v16 spec has a minor typo. Our function follows the math,
        not the typo. Documented as a known v16 spec errata.
        """
        assert noi_at_year(32000, 0.03, 5) == pytest.approx(36016.28, abs=0.05)

    def test_noi_at_year_rejects_zero_year(self):
        with pytest.raises(ValueError, match="year must be >= 1"):
            noi_at_year(100000, 0.03, 0)

    def test_noi_at_year_rejects_negative_year(self):
        with pytest.raises(ValueError, match="year must be >= 1"):
            noi_at_year(100000, 0.03, -1)


class TestBUG05BreakevenOccupancy:
    """BUG-05: Breakeven occupancy must include OpEx (not just ADS)."""

    def test_breakeven_includes_opex(self):
        """v16 Scenario 1: ADS=18420.60, OpEx=12600 (7200+1800+3600),
        PGI=2400*12=28800 → breakeven = 31020.60/28800 = 1.0771 (STRUCTURALLY_UNVIABLE).
        """
        result = breakeven_occupancy(18420.60, 12600, 28800)
        assert result["flag"] == "STRUCTURALLY_UNVIABLE"
        assert result["value"] == pytest.approx(31020.60 / 28800, abs=0.0001)

    def test_breakeven_viable(self):
        """Same ADS but more rent: ADS=18420.60, OpEx=3600 (just insurance),
        PGI=36000 → breakeven = 22020.60/36000 = 0.6117 (OK)."""
        result = breakeven_occupancy(18420.60, 3600, 36000)
        assert result["flag"] == "OK"
        assert result["value"] == pytest.approx(22020.60 / 36000, abs=0.0001)

    def test_breakeven_no_gross_rent_flagged(self):
        result = breakeven_occupancy(10000, 5000, 0)
        assert result["flag"] == "NO_GROSS_RENT"
        assert result["value"] != result["value"]  # NaN check

    def test_breakeven_at_exactly_100pct(self):
        """Boundary: value == 1.0 is NOT structurally unviable (use > not >=)."""
        result = breakeven_occupancy(20000, 0, 20000)
        assert result["value"] == pytest.approx(1.0, abs=0.001)
        assert result["flag"] == "OK"


class TestBUG06MaxLoanIO:
    """BUG-06: IO max loan must use DECIMAL rate (0.07), not percent (7.0).
    Passing 7.0 instead of 0.07 causes a 100x sizing error.
    """

    def test_max_loan_io_decimal_rate(self):
        """v16 regression: max_loan_io(2000, 0.07) = $342,857.14."""
        result = max_loan_io(2000, 0.07)
        assert result == pytest.approx(24000 / 0.07, abs=0.01)

    def test_max_loan_io_zero_rate_returns_inf(self):
        """Zero rate → infinite max loan (no interest to pay)."""
        result = max_loan_io(2000, 0.0)
        assert result == float("inf")

    def test_max_loan_io_micro_rate_returns_inf(self):
        """Rate below EPSILON (1e-8) also returns inf."""
        result = max_loan_io(2000, 1e-12)
        assert result == float("inf")

    def test_max_loan_io_passes_percent_under_sizes(self):
        """Sanity check: passing 7.0 (percent) instead of 0.07 returns $3,428.57,
        which is 100x smaller — the silent bug v16 warns about.
        """
        decimal = max_loan_io(2000, 0.07)  # $342,857.14
        percent = max_loan_io(2000, 7.0)  # $3,428.57 (silent 100x error)
        assert decimal / percent == pytest.approx(100.0, abs=0.01)


class TestDSCRTrack3Stabilized:
    """Track 3 — Stabilized DSCR (annual NOI / annual debt service)."""

    def test_track3_v16_scenario_2(self):
        """v16 Scenario 2: stabilized NOI = $33,948.80 (Year 3),
        ADS = $18,420.60 → Track 3 DSCR ≈ 1.843.
        """
        result = dscr_track3_stabilized(33948.80, 18420.60)
        assert result == pytest.approx(1.843, abs=0.005)

    def test_track3_rejects_zero_ads(self):
        with pytest.raises(ValueError, match="annual_debt_service must be > 0"):
            dscr_track3_stabilized(30000, 0)

    def test_track3_rejects_negative_noi(self):
        with pytest.raises(ValueError, match="stabilized_noi_annual must be >= 0"):
            dscr_track3_stabilized(-1000, 18000)


class TestDSCRAllIn:
    """All-In DSCR — conservative variant (NOI / all-in housing cost)."""

    def test_all_in_v16_scenario_1(self):
        """v16 Scenario 1: NOI=$14,640, PI=$18,420.60, Tax=$3,600, Insurance=$1,800
        All-in DSCR = 14640 / (18420.60 + 3600 + 1800 + 0) ≈ 0.6146.
        """
        result = dscr_all_in(
            noi_annual=14640,
            pi_annual=18420.60,
            tax_annual=3600,
            insurance_annual=1800,
            hoa_annual=0,
        )
        assert result == pytest.approx(0.6146, abs=0.001)

    def test_all_in_stricter_than_track2(self):
        """All-In DSCR (conservative) should be <= Track 2 DSCR (NOI/ADS only)."""
        # Same NOI of $14,640; Track 2 denominator = $18,420.60; All-In = $23,820.60
        track2 = 14640 / 18420.60
        all_in = dscr_all_in(14640, 18420.60, 3600, 1800, 0)
        assert all_in < track2
        assert all_in == pytest.approx(track2 * 18420.60 / 23820.60, abs=0.001)

    def test_all_in_rejects_zero_denominator(self):
        with pytest.raises(ValueError, match="All-in denominator must be > 0"):
            dscr_all_in(10000, 0, 0, 0, 0)

    def test_all_in_rejects_negative_noi(self):
        with pytest.raises(ValueError, match="noi_annual must be >= 0"):
            dscr_all_in(-1000, 18000, 3600, 1800, 0)


class TestCrossV16Scenarios:
    """Cross-validate the v16 hand-verified scenarios using multiple functions."""

    def test_scenario_1_vanilla_sfr_track1(self):
        """v16 Scenario 1: $300K property, $225K loan (75% LTV per v16),
        7.25% / 30yr, $2400 rent, $3600 tax, $1800 ins, $0 HOA.
        PI ≈ $1535.05, PITIA = $1985.05, Track 1 DSCR = 2400/1985.05 = 1.209.
        """
        # Loan is 75% of lesser of appraisal/purchase = $225K (= 75% × $300K)
        # Per BUG-01, with appraisal=$310K, price=$300K: value_for_ltv = min = $300K
        v = value_for_ltv("PURCHASE", 310000, 300000)
        assert v == 300000
        loan = 225000
        assert ltv(loan, "PURCHASE", 310000, 300000) == pytest.approx(0.75, abs=0.0001)

    def test_scenario_2_noi_year5_matches_breakeven_inputs(self):
        """v16 Scenario 2: $32K Year-1 NOI, 3% growth, Year 5 = $36,016.28.
        (See comment in test_year5_growth_v16_scenario_2 about v16 spec typo.)
        """
        y5_noi = noi_at_year(32000, 0.03, 5)
        assert y5_noi == pytest.approx(36016.28, abs=0.05)
        # Exit value at 6.5% cap = 36016.28 / 0.065 = 554,096
        assert (y5_noi / 0.065) == pytest.approx(554096.0, abs=5.0)

    def test_scenario_3_1031_recapture_first(self):
        """v16 Scenario 3: $1M sale, $400K basis, $150K depreciation,
        $850K replacement, $150K cash boot.
        Recognized gain = min($150K boot, $600K gain) = $150K.
        Recapture portion = min($150K recognized, $150K depreciation) = $150K.
        Federal recapture tax = $150K × 25% = $37,500.
        """
        realized_gain = 600000
        boot = 150000
        depreciation = 150000
        recognized = min(boot, realized_gain)
        recapture = min(recognized, depreciation)
        recapture_tax = recapture * 0.25
        assert recognized == 150000
        assert recapture == 150000
        assert recapture_tax == 37500
