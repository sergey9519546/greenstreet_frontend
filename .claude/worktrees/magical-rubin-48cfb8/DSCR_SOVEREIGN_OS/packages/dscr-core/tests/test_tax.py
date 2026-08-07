"""After-Tax Engine tests (Slice 3).

Source: dscr_core.tax module (v0.5.4)
"""

from __future__ import annotations

import pytest

from dscr_core.tax import (
    FilingStatus,
    PropertyType,
    after_tax_cash_flow,
    macrs_depreciation_schedule,
    niit,
    pal_phaseout,
    rep_status,
    section_1250_recapture,
)


class TestFilingStatus:
    def test_values(self):
        assert FilingStatus.SINGLE.value == "single"
        assert FilingStatus.MFJ.value == "mfj"
        assert FilingStatus.MFS.value == "mfs"
        assert FilingStatus.HOH.value == "hoh"


class TestPropertyType:
    def test_values(self):
        assert PropertyType.RESIDENTIAL_RENTAL.value == "residential_rental"
        assert PropertyType.COMMERCIAL.value == "commercial"


class TestMacrsDepreciationSchedule:
    """IRC §168 MACRS straight-line depreciation."""

    def test_residential_annual_depreciation(self):
        """Residential rental: cost_basis / 27.5yr SL."""
        result = macrs_depreciation_schedule(
            PropertyType.RESIDENTIAL_RENTAL, cost_basis=275_000.0, year=1
        )
        # 275,000 / 27.5 = 10,000
        assert result.annual_depreciation == pytest.approx(10_000.0, abs=0.01)
        assert result.cumulated_through_year == pytest.approx(10_000.0, abs=0.01)

    def test_commercial_annual_depreciation(self):
        """Commercial: cost_basis / 39yr SL."""
        result = macrs_depreciation_schedule(PropertyType.COMMERCIAL, cost_basis=390_000.0, year=1)
        assert result.annual_depreciation == pytest.approx(10_000.0, abs=0.01)

    def test_book_value_decreases(self):
        result = macrs_depreciation_schedule(
            PropertyType.RESIDENTIAL_RENTAL, cost_basis=275_000.0, year=10
        )
        assert result.cumulated_through_year == pytest.approx(100_000.0, abs=0.01)
        assert result.book_value_at_year == pytest.approx(175_000.0, abs=0.01)

    def test_book_value_floors_at_zero(self):
        """Very large year → book_value floored at 0."""
        result = macrs_depreciation_schedule(
            PropertyType.RESIDENTIAL_RENTAL, cost_basis=275_000.0, year=100
        )
        assert result.book_value_at_year == 0.0

    def test_invalid_cost_basis_raises(self):
        with pytest.raises(ValueError, match="cost_basis"):
            macrs_depreciation_schedule(PropertyType.RESIDENTIAL_RENTAL, cost_basis=-100.0, year=1)

    def test_invalid_property_type_raises(self):
        from dscr_core import tax as tax_mod

        with pytest.raises(ValueError, match="property_type must be"):
            tax_mod.macrs_depreciation_schedule("invalid", 1000.0, 1)


class TestSection1250Recapture:
    """IRC §1250 depreciation recapture on sale."""

    def test_residential_recapture_zero(self):
        """Residential SL → §1250 recapture = 0 (Bucket 1)."""
        result = section_1250_recapture(
            depreciation_taken=100_000.0,
            sale_price=500_000.0,
            cost_basis=275_000.0,
            property_type=PropertyType.RESIDENTIAL_RENTAL,
        )
        assert result["recapture_amount"] == 0.0
        assert result["recapture_rate"] == 0.0
        assert result["recapture_tax"] == 0.0

    def test_commercial_recapture_capped_at_25pct(self):
        """Commercial SL → "unrecaptured §1250 gain" capped at 25% rate."""
        result = section_1250_recapture(
            depreciation_taken=100_000.0,
            sale_price=500_000.0,
            cost_basis=275_000.0,
            property_type=PropertyType.COMMERCIAL,
            ordinary_tax_rate=0.32,
        )
        # gain = 500k - (275k - 100k) = 325k
        # unrecaptured_1250 = min(100k, 325k) = 100k
        # recapture_rate = min(0.25, 0.32) = 0.25
        # recapture_tax = 100k * 0.25 = 25k
        assert result["recapture_amount"] == 100_000.0
        assert result["recapture_rate"] == 0.25
        assert result["recapture_tax"] == 25_000.0
        # capital gain = 325k - 100k = 225k, tax = 225k * 0.20 = 45k
        assert result["capital_gain"] == 225_000.0
        assert result["capital_gain_tax"] == 45_000.0
        # total tax = 25k + 45k = 70k
        assert result["total_tax"] == 70_000.0

    def test_ordinary_rate_below_25pct_uses_actual_rate(self):
        """If ordinary_rate < 25%, use actual rate (not the cap)."""
        result = section_1250_recapture(
            depreciation_taken=100_000.0,
            sale_price=500_000.0,
            cost_basis=275_000.0,
            property_type=PropertyType.COMMERCIAL,
            ordinary_tax_rate=0.15,  # below the 25% cap
        )
        assert result["recapture_rate"] == 0.15  # uses 15%, not capped at 25%
        assert result["recapture_tax"] == 15_000.0

    def test_no_gain_no_recapture(self):
        """Sale at adjusted basis → no recapture, no capital gain."""
        result = section_1250_recapture(
            depreciation_taken=100_000.0,
            sale_price=175_000.0,  # = cost_basis - depreciation_taken
            cost_basis=275_000.0,
            property_type=PropertyType.COMMERCIAL,
        )
        # At sale_price = adjusted_basis, gain = 0
        # unrecaptured_1250 = min(depreciation, gain) = min(100k, 0) = 0
        # recapture_amount = 0 (no gain to recapture)
        # capital_gain = 0
        assert result["recapture_amount"] == 0.0
        assert result["capital_gain"] == 0.0
        assert result["recapture_tax"] == 0.0
        assert result["capital_gain_tax"] == 0.0
        assert result["total_tax"] == 0.0

    def test_invalid_inputs_raise(self):
        with pytest.raises(ValueError, match="sale_price"):
            section_1250_recapture(
                depreciation_taken=0.0,
                sale_price=-100.0,
                cost_basis=1000.0,
                property_type=PropertyType.RESIDENTIAL_RENTAL,
            )
        with pytest.raises(ValueError, match="ordinary_tax_rate"):
            section_1250_recapture(
                depreciation_taken=0.0,
                sale_price=1000.0,
                cost_basis=1000.0,
                property_type=PropertyType.RESIDENTIAL_RENTAL,
                ordinary_tax_rate=1.5,
            )


class TestNIIT:
    """IRC §1411 Net Investment Income Tax."""

    def test_below_threshold_zero(self):
        """MAGI below filing threshold → NIIT = 0."""
        result = niit(
            magi=150_000.0, filing_status=FilingStatus.SINGLE, net_investment_income=20_000.0
        )
        assert result["niit_owed"] == 0.0
        assert result["magi_excess"] == 0.0

    def test_above_threshold_full(self):
        """MAGI above threshold → NIIT = 3.8% on lesser of NII or excess."""
        result = niit(
            magi=300_000.0,
            filing_status=FilingStatus.SINGLE,  # threshold 200k
            net_investment_income=50_000.0,
        )
        # excess = 300k - 200k = 100k
        # base = min(50k, 100k) = 50k
        # NIIT = 50k * 0.038 = 1,900
        assert result["magi_excess"] == 100_000.0
        assert result["niit_base"] == 50_000.0
        assert result["niit_owed"] == 1_900.0

    def test_nii_caps_when_excess_is_larger(self):
        """When MAGI excess > NII, NIIT is capped at NII."""
        result = niit(
            magi=300_000.0,
            filing_status=FilingStatus.SINGLE,
            net_investment_income=10_000.0,
        )
        # excess = 100k, NII = 10k, base = min(10k, 100k) = 10k
        assert result["niit_base"] == 10_000.0
        assert result["niit_owed"] == 380.0  # 10k * 0.038

    def test_mfj_threshold_higher(self):
        result = niit(
            magi=275_000.0,
            filing_status=FilingStatus.MFJ,  # threshold 250k
            net_investment_income=50_000.0,
        )
        # excess = 25k, NIIT = 25k * 0.038 = 950
        assert result["threshold"] == 250_000.0
        assert result["magi_excess"] == 25_000.0
        assert result["niit_owed"] == 950.0

    def test_mfs_threshold_lowest(self):
        result = niit(
            magi=130_000.0,
            filing_status=FilingStatus.MFS,  # threshold 125k
            net_investment_income=10_000.0,
        )
        assert result["threshold"] == 125_000.0
        assert result["magi_excess"] == 5_000.0

    def test_zero_nii_zero_tax(self):
        result = niit(
            magi=500_000.0,
            filing_status=FilingStatus.SINGLE,
            net_investment_income=0.0,
        )
        assert result["niit_owed"] == 0.0


class TestPALPhaseout:
    """IRC §469 Passive Activity Loss special allowance."""

    def test_mfs_zero_allowance(self):
        """MFS filers get no special allowance regardless of MAGI."""
        for magi in [0.0, 100_000.0, 300_000.0]:
            result = pal_phaseout(magi, FilingStatus.MFS)
            assert result["allowance"] == 0.0
            assert result["base_allowance"] == 0.0

    def test_below_phaseout_full_allowance(self):
        """MAGI <= 100k → full $25k allowance."""
        for magi in [0.0, 50_000.0, 100_000.0]:
            result = pal_phaseout(magi, FilingStatus.SINGLE)
            assert result["allowance"] == 25_000.0
            assert result["phaseout_complete"] is False

    def test_above_150k_zero_allowance(self):
        """MAGI >= 150k → allowance fully phased out."""
        for magi in [150_000.0, 200_000.0, 500_000.0]:
            result = pal_phaseout(magi, FilingStatus.SINGLE)
            assert result["allowance"] == 0.0
            assert result["phaseout_complete"] is True

    def test_mid_phaseout_linear(self):
        """MAGI = 125k → halfway between 100k and 150k → $12,500 (half)."""
        result = pal_phaseout(125_000.0, FilingStatus.SINGLE)
        # 25k base, phaseout = 25k * 0.50 * (25k/25k) = 12.5k
        # allowance = 25k - 12.5k = 12.5k
        assert result["allowance"] == pytest.approx(12_500.0, abs=0.01)
        assert result["phaseout_applied"] == pytest.approx(12_500.0, abs=0.01)


class TestREPStatus:
    """IRC §469(c)(7) Real Estate Professional status."""

    def test_hours_test_only(self):
        """Hours > 750 but <50% of total → NOT REP."""
        result = rep_status(hours_worked=800, total_work_hours=2000)
        assert result["hours_test_passed"] is True
        assert result["majority_test_passed"] is False
        assert result["is_rep"] is False

    def test_majority_test_only(self):
        """Majority real property but <750 hours → NOT REP."""
        result = rep_status(hours_worked=500, total_work_hours=900)  # 55% but <750
        assert result["hours_test_passed"] is False
        assert result["majority_test_passed"] is True
        assert result["is_rep"] is False

    def test_both_pass_is_rep(self):
        """>750 hours AND >50% real property → IS REP."""
        result = rep_status(hours_worked=1000, total_work_hours=1500)  # 66%
        assert result["is_rep"] is True
        assert result["material_participation_implied"] is True

    def test_exactly_750_not_rep(self):
        """Exactly 750 hours → NOT REP (strict >)."""
        result = rep_status(hours_worked=750, total_work_hours=1000)
        assert result["hours_test_passed"] is False
        assert result["is_rep"] is False

    def test_zero_total_hours_safe(self):
        """Avoid division by zero when total_work_hours=0."""
        result = rep_status(hours_worked=500, total_work_hours=0)
        assert result["hours_pct"] == 0.0
        assert result["is_rep"] is False

    def test_negative_inputs_raise(self):
        with pytest.raises(ValueError, match="hours_worked"):
            rep_status(hours_worked=-1, total_work_hours=100)
        with pytest.raises(ValueError, match="total_work_hours"):
            rep_status(hours_worked=100, total_work_hours=-1)


class TestAfterTaxCashFlow:
    """End-to-end after-tax cash flow."""

    def test_basic_landlord_no_pal(self):
        """Standard landlord: 30k rent, 5k opex, 8k interest, 2k principal,
        5k depreciation, 24% bracket, MFJ, MAGI 100k."""
        result = after_tax_cash_flow(
            gross_rent=30_000.0,
            opex=5_000.0,
            interest_paid=8_000.0,
            principal_paid=2_000.0,
            depreciation=5_000.0,
            ordinary_tax_rate=0.24,
            filing_status=FilingStatus.MFJ,
            magi=100_000.0,  # exactly at threshold = NIIT = 0
            rep_hours_worked=0,
            rep_total_work_hours=0,
        )
        # net_rental = 25k
        # taxable = 25k - 8k - 5k = 12k
        # PAL = 25k (full, MAGI=100k at boundary)
        # taxable_after_pal = max(0, 12k - 25k) = 0
        # ordinary_tax = 0
        # NIIT = 0 (MAGI at threshold)
        # after_tax_cf = 25k - 8k - 0 - 0 - 2k = 15k
        assert result["net_rental_income"] == 30_000.0 - 5_000.0
        assert result["taxable_rental_income"] == 30_000.0 - 5_000.0 - 8_000.0 - 5_000.0
        assert result["ordinary_tax"] == 0.0
        assert result["niit_owed"] == 0.0
        assert result["after_tax_cash_flow"] == 15_000.0
        assert result["is_rep"] is False

    def test_rep_eliminates_niit(self):
        """REP status → NIIT = 0 even if MAGI > threshold."""
        result = after_tax_cash_flow(
            gross_rent=30_000.0,
            opex=5_000.0,
            interest_paid=8_000.0,
            principal_paid=2_000.0,
            depreciation=5_000.0,
            ordinary_tax_rate=0.24,
            filing_status=FilingStatus.SINGLE,
            magi=500_000.0,  # way above threshold
            rep_hours_worked=1500,  # REP
            rep_total_work_hours=2000,
        )
        assert result["is_rep"] is True
        assert result["niit_owed"] == 0.0

    def test_pal_phases_out_at_high_magi(self):
        """MAGI > 150k → PAL = 0 → full taxable income is taxed."""
        result = after_tax_cash_flow(
            gross_rent=30_000.0,
            opex=5_000.0,
            interest_paid=8_000.0,
            principal_paid=2_000.0,
            depreciation=5_000.0,
            ordinary_tax_rate=0.24,
            filing_status=FilingStatus.SINGLE,
            magi=200_000.0,  # PAL fully phased out
        )
        # PAL = 0
        # taxable_after_pal = 12k
        # ordinary_tax = 12k * 0.24 = 2,880
        assert result["pal_allowance_applied"] == 0.0
        assert result["ordinary_tax"] == pytest.approx(2_880.0, abs=0.01)

    def test_apply_niit_false_skips_niit(self):
        """apply_niit=False → NIIT = 0 even for non-REP high-MAGI."""
        result = after_tax_cash_flow(
            gross_rent=30_000.0,
            opex=5_000.0,
            interest_paid=8_000.0,
            principal_paid=2_000.0,
            depreciation=5_000.0,
            ordinary_tax_rate=0.24,
            filing_status=FilingStatus.SINGLE,
            magi=300_000.0,  # high MAGI
            apply_niit=False,
        )
        assert result["niit_owed"] == 0.0

    def test_negative_taxable_floors_at_zero(self):
        """High depreciation → negative taxable → tax floors at 0."""
        result = after_tax_cash_flow(
            gross_rent=20_000.0,
            opex=5_000.0,
            interest_paid=10_000.0,
            principal_paid=1_000.0,
            depreciation=20_000.0,  # large depreciation wipes out income
            ordinary_tax_rate=0.32,
            filing_status=FilingStatus.MFJ,
            magi=200_000.0,
        )
        # taxable = 20k - 5k - 10k - 20k = -15k
        # ordinary_tax = max(0, -15k) * 0.32 = 0
        assert result["ordinary_tax"] == 0.0


class TestAfterTaxIntegration:
    """Integration tests combining all tax functions."""

    def test_full_year_re_landlord_mfj(self):
        """RE landlord with significant rental income, MFJ."""
        result = after_tax_cash_flow(
            gross_rent=80_000.0,
            opex=20_000.0,
            interest_paid=18_000.0,
            principal_paid=4_000.0,
            depreciation=10_000.0,
            ordinary_tax_rate=0.24,
            filing_status=FilingStatus.MFJ,
            magi=180_000.0,  # below MFJ NIIT threshold (250k), above PAL phaseout
        )
        # net_rental = 60k
        # taxable = 60k - 18k - 10k = 32k
        # PAL: magi 180k > 150k → 0
        # ordinary_tax = 32k * 0.24 = 7,680
        # NIIT: MAGI 180k < 250k threshold → 0
        # after_tax_cf = 60k - 18k - 7,680 - 0 - 4k = 30,320
        assert result["pal_allowance_applied"] == 0.0
        assert result["ordinary_tax"] == pytest.approx(7_680.0, abs=0.01)
        assert result["niit_owed"] == 0.0
        assert result["after_tax_cash_flow"] == pytest.approx(30_320.0, abs=0.01)
