"""Tests for OBBBA-compliant tax_engine module."""
import pytest
from datetime import date
from tax_engine import (
    calc_bonus_depreciation,
    calc_section_1250_recapture,
    calc_pal_allowance,
    check_rep_status,
    calc_after_tax_irr,
    build_cost_seg_study,
    calc_cost_seg_depreciation,
    FilingStatus,
    BONUS_CUTOFF,
)


# ── 1. Bonus Depreciation ────────────────────────────────────────────────────

class TestBonusDepreciation:
    def test_100_pct_bonus_after_cutoff(self):
        result = calc_bonus_depreciation(1_000_000, date(2025, 6, 1))
        assert result["bonus_depreciation"] == 1_000_000
        assert result["total_first_year_deduction"] == 1_000_000
        assert result["remaining_basis"] == 0.0

    def test_bonus_with_section_179(self):
        result = calc_bonus_depreciation(3_000_000, date(2025, 6, 1), use_section_179=2_500_000)
        assert result["section_179"] == 2_500_000
        assert result["bonus_depreciation"] == 500_000
        assert result["total_first_year_deduction"] == 3_000_000

    def test_bonus_before_cutoff_raises(self):
        with pytest.raises(ValueError, match="on or after"):
            calc_bonus_depreciation(500_000, date(2024, 12, 31))

    def test_section_179_capped_at_limit(self):
        result = calc_bonus_depreciation(5_000_000, date(2025, 1, 19), use_section_179=5_000_000)
        assert result["section_179"] == 2_500_000


# ── 2. §1250 Recapture ──────────────────────────────────────────────────────

class TestSection1250Recapture:
    def test_recapture_with_niit_single(self):
        result = calc_section_1250_recapture(
            sale_price=800_000,
            adjusted_basis=500_000,
            accumulated_depreciation=200_000,
            magi=250_000,
            filing_status=FilingStatus.SINGLE,
        )
        assert result["total_gain"] == 300_000
        assert result["section_1250_recapture"] == 200_000
        assert result["ltcg_gain"] == 100_000
        assert result["niit_applied"] is True
        # 200K * 0.288 + 100K * 0.238
        expected = 200_000 * 0.288 + 100_000 * 0.238
        assert abs(result["total_tax"] - expected) < 0.01

    def test_recapture_without_niit(self):
        result = calc_section_1250_recapture(
            sale_price=600_000,
            adjusted_basis=400_000,
            accumulated_depreciation=150_000,
            magi=150_000,
            filing_status=FilingStatus.SINGLE,
        )
        assert result["niit_applied"] is False
        expected = 150_000 * 0.25 + 50_000 * 0.20
        assert abs(result["total_tax"] - expected) < 0.01


# ── 3. PAL Allowance ────────────────────────────────────────────────────────

class TestPALAllowance:
    def test_full_allowance_low_agi(self):
        result = calc_pal_allowance(-30_000, 80_000)
        assert result["deductible"] == -25_000
        assert result["suspended"] == 5_000

    def test_phaseout_mid_agi(self):
        # AGI = 120K → reduction = 10K → allowance = 15K
        result = calc_pal_allowance(-30_000, 120_000)
        assert result["allowance"] == 15_000
        assert result["deductible"] == -15_000
        assert result["suspended"] == 15_000

    def test_full_phaseout(self):
        result = calc_pal_allowance(-20_000, 160_000)
        assert result["allowance"] == 0.0
        assert result["deductible"] == 0.0
        assert result["suspended"] == 20_000


# ── 4. REP Status ────────────────────────────────────────────────────────────

class TestREPStatus:
    def test_qualifies_rep(self):
        result = check_rep_status(800, 1500)
        assert result["is_rep"] is True

    def test_fails_hours(self):
        result = check_rep_status(700, 1000)
        assert result["is_rep"] is False

    def test_fails_pct(self):
        result = check_rep_status(750, 2000)
        assert result["is_rep"] is False  # 37.5% < 50%


# ── 5. After-Tax IRR ─────────────────────────────────────────────────────────

class TestAfterTaxIRR:
    def test_irr_with_pyxirr(self):
        flows = [-500_000, 50_000, 50_000, 50_000, 700_000]
        dates = [
            date(2025, 1, 1),
            date(2026, 1, 1),
            date(2027, 1, 1),
            date(2028, 1, 1),
            date(2029, 1, 1),
        ]
        result = calc_after_tax_irr(flows, dates, total_tax_on_exit=50_000)
        assert result["pretax_irr"] is not None
        assert result["after_tax_irr"] is not None
        assert result["tax_drag"] is not None
        assert result["after_tax_irr"] < result["pretax_irr"]


# ── 6. Cost Segregation ─────────────────────────────────────────────────────

class TestCostSegregation:
    def test_build_study(self):
        study = build_cost_seg_study(1_000_000, [
            ("Carpet", 50_000, "5_year"),
            ("Cabinets", 30_000, "7_year"),
            ("Parking", 80_000, "15_year"),
        ])
        assert study.property_cost == 1_000_000
        assert len(study.components) == 3
        assert study.land_value == 840_000

    def test_bonus_depreciation_on_components(self):
        study = build_cost_seg_study(1_000_000, [
            ("Carpet", 50_000, "5_year"),
            ("Cabinets", 30_000, "7_year"),
            ("Parking", 80_000, "15_year"),
        ])
        result = calc_cost_seg_depreciation(study, 2025, use_bonus=True)
        assert result["total_year1_depreciation"] == 160_000
        assert result["schedule"]["5_year"]["method"] == "100% Bonus (OBBBA)"

    def test_invalid_bucket_raises(self):
        with pytest.raises(ValueError, match="Invalid bucket"):
            build_cost_seg_study(500_000, [("Bad", 10_000, "3_year")])
