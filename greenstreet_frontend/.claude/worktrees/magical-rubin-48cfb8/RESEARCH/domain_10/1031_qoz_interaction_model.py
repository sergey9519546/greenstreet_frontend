"""
1031 × QOZ Interaction Model — DSCR Sovereign OS Slice 3
=========================================================
Models the after-tax interaction of IRC §1031 like-kind exchanges with
IRC §1400Z-2 Qualified Opportunity Zone investments, including the
post-OBBBA (P.L. 119-21, July 4 2025) permanent-QOZ rules.

Run examples:
    python 1031_qoz_interaction_model.py --example sell_only
    python 1031_qoz_interaction_model.py --example sell_then_1031
    python 1031_qoz_interaction_model.py --example sell_then_1031_into_qoz
    python 1031_qoz_interaction_model.py --example sell_then_1031_qoz_hold10
    python 1031_qoz_interaction_model.py --test

Author: DSCR Sovereign OS — Domain 10 research
Date: 2026-06-18
"""
from __future__ import annotations
import argparse
import json
from dataclasses import dataclass, field, asdict
from datetime import date
from typing import Optional


# =====================================================================
# Tax Constants (2026 — Rev. Proc. 2025-32; IRC as amended by OBBBA)
# =====================================================================
LTCG_RATE = 0.20
NIIT_RATE = 0.038
SEC_1250_MAX_RATE = 0.25
SEC_1245_ORDINARY_MAX = 0.37          # top federal ordinary bracket
ORDINARY_INCOME_RATE = 0.37
DEPRECIATION_RECAPTURE_FLOOR = 0.25   # unrecaptured §1250 floor
COMBINED_NIIT_STACK = LTCG_RATE + NIIT_RATE   # 23.8% on LTCG
COMBINED_1250_STACK = SEC_1250_MAX_RATE + NIIT_RATE  # 28.8% on unrecaptured §1250

# OBBBA §163(j) ATI = EBITDA
OBBBA_BONUS_DEP_PCT = 1.0             # 100% bonus for property acquired and placed in service on/after 1/19/2025
COST_SEG_FAST_CLASSES_YEARS = (5, 7, 15)   # years (5/7/15)
RESIDENTIAL_RENTAL_LIFE = 27.5        # years
NONRESIDENTIAL_LIFE = 39.0            # years

# QOZ — pre-2027 (TCJA original) rules
QOZ_TCJA_BASIS_STEPUP_5YR = 0.10      # 10% step-up at year 5
QOZ_TCJA_BASIS_STEPUP_7YR = 0.15      # 15% step-up at year 7
QOZ_TCJA_HOLD_FOR_EXCLUSION = 10      # 10 years for permanent exclusion

# QOZ — OBBBA (post-2026 investment) rules
QOZ_OBBBA_BASIS_STEPUP_5YR = 0.10
QOZ_OBBBA_HOLD_FOR_EXCLUSION = 10
QOZ_OBBBA_BASIS_FREEZE_YR = 30        # FMV freeze after 30 years

# QOZ — Qualified Rural Opportunity Fund (QROF)
QROF_RURAL_BASIS_STEPUP_5YR = 0.30    # 30% step-up at year 5 (vs 10%)


@dataclass
class Property:
    """DSCR rental property (relinquished in sale/exchange)."""
    name: str
    purchase_price: float               # original acquisition price
    land_value: float                   # non-depreciable
    closing_costs: float = 0.0
    accumulated_depreciation: float = 0.0  # total §168 depreciation taken to date
    accelerated_depreciation_taken: float = 0.0  # bonus / §179 over straight-line (drives §1245)
    purchase_date: str = "2020-01-01"
    cost_seg_done: bool = False
    cost_seg_5_7_15_basis: float = 0.0  # basis reclassified to 5/7/15-yr

    @property
    def depreciable_basis(self) -> float:
        return self.purchase_price - self.land_value + self.closing_costs

    @property
    def adjusted_basis(self) -> float:
        return self.depreciable_basis - self.accumulated_depreciation

    @property
    def current_market_value(self) -> float:
        # For modeling: caller supplies sale_price; this is just a placeholder
        return 0.0


@dataclass
class Investor:
    """Investor profile (tax posture)."""
    filing_status: str = "MFJ"          # Single, MFJ, MFS, HoH
    ordinary_income_bracket: float = 0.37   # top marginal
    is_rep: bool = False                # Real Estate Professional (§469(c)(7))
    magi: float = 400_000.0             # Modified AGI (for NIIT + PAL phase-out)
    is_california_non_conform: bool = False  # if True, no state §168(k) conformity (state tax deferred)
    is_rural_qoz: bool = False          # QROF eligible

    @property
    def niit_applies(self) -> bool:
        thresholds = {"Single": 200_000, "MFJ": 250_000, "MFS": 125_000, "HoH": 200_000}
        return self.magi > thresholds[self.filing_status]

    @property
    def effective_ltcg_rate(self) -> float:
        return COMBINED_NIIT_STACK if self.niit_applies else LTCG_RATE

    @property
    def effective_1250_rate(self) -> float:
        return COMBINED_1250_STACK if self.niit_applies else SEC_1250_MAX_RATE


# =====================================================================
# 1031 Exchange Module
# =====================================================================
@dataclass
class Exchange1031:
    """
    Models a §1031 like-kind exchange.
    - 45-day identification window
    - 180-day closing window (or tax-return due date if later)
    - QI required (assumed present)
    - 3-property OR 200%/95% identification safe harbor
    """
    relinquished_sale_price: float
    relinquished_adjusted_basis: float
    accumulated_depreciation: float
    accelerated_depreciation_taken: float
    mortgage_on_relinquished: float
    replacement_property_fmv: float
    replacement_mortgage: float
    cash_buyout_to_exchanger: float = 0.0   # any non-like-kind consideration
    replacement_hold_years: int = 5
    sale_date: str = "2026-06-15"

    @property
    def realized_gain(self) -> float:
        return max(0.0, self.relinquished_sale_price - self.relinquished_adjusted_basis)

    @property
    def mortgage_relief(self) -> float:
        """Net mortgage reduction is boot."""
        return max(0.0, self.mortgage_on_relinquished - self.replacement_mortgage)

    @property
    def total_boot(self) -> float:
        return self.cash_buyout_to_exchanger + self.mortgage_relief

    @property
    def deferred_gain(self) -> float:
        return max(0.0, self.realized_gain - self.total_boot)

    @property
    def recognized_gain(self) -> float:
        """Gain recognized to the extent of boot (recapture is recognized first)."""
        # §1245/§1250 recapture is always recognized, regardless of §1031 (§1031 does not
        # defer depreciation recapture for §1245 property; for §1250 only the unrecaptured
        # §1250 gain is subject to current recognition if boot, plus §1245 always)
        return min(self.realized_gain, self.total_boot)

    @property
    def new_basis_in_replacement(self) -> float:
        return self.replacement_property_fmv - self.replacement_mortgage

    def recapture_breakdown(self, ordinary_rate: float = ORDINARY_INCOME_RATE,
                            sec1250_rate: float = SEC_1250_MAX_RATE) -> dict:
        """
        Slice the tax-recognized gain into §1245 ordinary / §1250 unrecaptured / §1231 LTCG.

        IMPORTANT — §1031(d) and §1250 mechanics:
        - §1245 recapture is ALWAYS recognized at sale (even in 1031); tax at ordinary rates.
        - §1250 unrecaptured gain (straight-line depreciation) is recognized to the extent
          of total boot (cash + net mortgage relief); taxed at max 25% (+NIIT).
        - §1231 LTCG is recognized to the extent of remaining boot; taxed at LTCG rates.
        - Excess over boot is DEFERRED into the replacement property basis.

        If no boot (cash=0, replacement mortgage >= relinquished mortgage), then §1245
        is still recognized (it's not boot-conditional), but §1250 and §1231 are deferred.
        """
        # §1245 always recognized
        rec1245 = min(self.accelerated_depreciation_taken, self.realized_gain)
        # §1250 recognized only to extent of remaining boot after §1245
        remaining_recognized = max(0.0, self.total_boot - rec1245)
        rec1250 = min(
            max(0.0, self.accumulated_depreciation - self.accelerated_depreciation_taken),
            remaining_recognized
        )
        # §1231 LTCG recognized to extent of remaining boot
        remaining_recognized -= rec1250
        rec1231 = min(
            max(0.0, self.realized_gain - rec1245 - rec1250),
            remaining_recognized
        )
        tax = (rec1245 * ordinary_rate + rec1250 * sec1250_rate + rec1231 * LTCG_RATE)
        return {
            "section_1245_ordinary": round(rec1245, 2),
            "section_1250_unrecaptured": round(rec1250, 2),
            "section_1231_ltcg": round(rec1231, 2),
            "tax_on_recognized_gain": round(tax, 2),
        }

    def summary(self, investor: Investor) -> dict:
        r = self.recapture_breakdown(
            ordinary_rate=investor.ordinary_income_bracket,
            sec1250_rate=investor.effective_1250_rate
        )
        return {
            "realized_gain": round(self.realized_gain, 2),
            "boot_cash": round(self.cash_buyout_to_exchanger, 2),
            "boot_mortgage_relief": round(self.mortgage_relief, 2),
            "total_boot": round(self.total_boot, 2),
            "deferred_gain": round(self.deferred_gain, 2),
            "recognized_gain": round(self.recognized_gain, 2),
            "new_basis_in_replacement": round(self.new_basis_in_replacement, 2),
            "tax_breakdown": r,
        }


# =====================================================================
# QOZ Module (post-OBBBA permanent)
# =====================================================================
@dataclass
class QOZInvestment:
    """
    Qualified Opportunity Zone investment under IRC §1400Z-2.

    Pre-2027 (TCJA) rules:
        - Defer original gain until earlier of 12/31/2026 or sale of QOF interest
        - 10% basis step-up at year 5 (if held)
        - 15% basis step-up at year 7 (if held; eliminated by OBBBA for post-2026)
        - Permanent exclusion of new capital gains if held ≥10 years

    Post-2026 (OBBBA §70431) rules:
        - Defer original gain for 5 years from investment date
        - 10% basis step-up at year 5
        - Permanent exclusion of new capital gains if held ≥10 years
        - FMV basis freeze at 30 years
    """
    deferred_gain: float
    investment_date: str = "2026-01-15"
    investment_year: int = 2026
    hold_years: int = 10
    qof_growth_rate: float = 0.05        # assumed appreciation of QOF investment
    is_rural: bool = False
    sale_after_10yr: bool = True

    @property
    def is_obbba(self) -> bool:
        return self.investment_year > 2026

    @property
    def basis_stepup_pct(self) -> float:
        if self.is_rural and self.is_obbba:
            return QROF_RURAL_BASIS_STEPUP_5YR
        return QOZ_OBBBA_BASIS_STEPUP_5YR  # same 10% under both regimes at year 5

    @property
    def held_to_year5(self) -> bool:
        return self.hold_years >= 5

    @property
    def held_to_year7(self) -> bool:
        return self.hold_years >= 7

    @property
    def held_to_year10(self) -> bool:
        return self.hold_years >= 10

    def deferred_gain_after_hold(self, investor: Investor) -> dict:
        """
        Returns the deferred-gain inclusion at the time the deferral ends.

        Pre-2027: inclusion = deferred_gain × (1 - stepup_pct) at the EARLIER
                  of 12/31/2026 or QOF sale. (If held to year 5, 10% step-up;
                  if to year 7, 15% step-up.)
        Post-2026 (OBBBA): inclusion = deferred_gain × (1 - 0.10) at year 5;
                  after year 5, deferral is over (no further step-up).
        """
        if self.is_obbba:
            if self.held_to_year5:
                remaining = self.deferred_gain * (1.0 - QOZ_OBBBA_BASIS_STEPUP_5YR)
            else:
                remaining = self.deferred_gain   # full inclusion if sold before year 5
        else:
            # Pre-2027 TCJA rules
            if self.held_to_year7:
                remaining = self.deferred_gain * (1.0 - QOZ_TCJA_BASIS_STEPUP_7YR)
            elif self.held_to_year5:
                remaining = self.deferred_gain * (1.0 - QOZ_TCJA_BASIS_STEPUP_5YR)
            else:
                remaining = self.deferred_gain

        tax = remaining * investor.ordinary_income_bracket  # deferred gain is ordinary
        return {
            "regime": "OBBBA" if self.is_obbba else "TCJA",
            "deferred_gain": round(self.deferred_gain, 2),
            "stepup_pct_applied": self.basis_stepup_pct,
            "remaining_gain_to_include": round(remaining, 2),
            "ordinary_income_tax": round(tax, 2),
            "tax_savings_vs_immediate_sale": round(
                self.deferred_gain * investor.ordinary_income_bracket - tax, 2
            ),
        }

    def new_gain_after_10yr(self, investor: Investor) -> dict:
        """QOF appreciation gain: PERMANENTLY EXCLUDED from gross income if held ≥10 years."""
        if not self.held_to_year10:
            appreciation = 0.0
            tax = 0.0
        else:
            new_basis = self.deferred_gain * (1.0 - self.basis_stepup_pct)
            final_value = new_basis * ((1.0 + self.qof_growth_rate) ** self.hold_years)
            appreciation = max(0.0, final_value - new_basis)
            tax = 0.0   # §1400Z-2(c) permanent exclusion
        return {
            "qof_appreciation": round(appreciation, 2),
            "tax_on_appreciation": round(tax, 2),
            "effective_tax_rate_on_new_gain": 0.0 if self.held_to_year10 else investor.effective_ltcg_rate,
            "permanent_exclusion_eligible": self.held_to_year10,
        }

    def summary(self, investor: Investor) -> dict:
        return {
            "deferred_gain_outcome": self.deferred_gain_after_hold(investor),
            "appreciation_outcome": self.new_gain_after_10yr(investor),
            "is_rural_qrof": self.is_rural and self.is_obbba,
        }


# =====================================================================
# Combined 1031 + QOZ Engine
# =====================================================================
@dataclass
class ExitScenario:
    """
    One of four exit scenarios:
    1. SELL_ONLY: taxable sale, pay all gains
    2. SELL_THEN_1031: 1031 into non-QOZ replacement, defer to future sale
    3. SELL_THEN_1031_INTO_QOZ: 1031 into QOZ property, defer QOZ gain, hold 10yr
    4. SELL_THEN_QOZ_DIRECT: skip 1031, contribute cash + 12/31/2026 election
    """
    scenario_type: str
    property: Property
    investor: Investor
    sale_price: float
    sale_date: str
    sale_costs: float = 0.0
    exchange: Optional[Exchange1031] = None
    qoz: Optional[QOZInvestment] = None
    hold_years_post_exit: int = 5
    replacement_appreciation_pct: float = 0.04

    def total_tax_due(self) -> dict:
        gain = max(0.0, self.sale_price - self.property.adjusted_basis - self.sale_costs)

        # Depreciation recapture (§1245 + §1250) is ALWAYS recognized even in 1031
        rec1245 = min(self.property.accelerated_depreciation_taken, gain)
        rec1250 = min(
            max(0.0, self.property.accumulated_depreciation - self.property.accelerated_depreciation_taken),
            gain - rec1245
        )
        ltcg = max(0.0, gain - rec1245 - rec1250)

        tax_1245 = rec1245 * self.investor.ordinary_income_bracket
        tax_1250 = rec1250 * self.investor.effective_1250_rate
        tax_ltcg = ltcg * self.investor.effective_ltcg_rate
        total_tax = tax_1245 + tax_1250 + tax_ltcg
        net_proceeds = self.sale_price - self.sale_costs - total_tax

        return {
            "realized_gain": round(gain, 2),
            "section_1245_ordinary": round(rec1245, 2),
            "section_1250_unrecaptured": round(rec1250, 2),
            "long_term_capital_gain": round(ltcg, 2),
            "tax_total": round(total_tax, 2),
            "net_after_tax_proceeds": round(net_proceeds, 2),
            "niit_applies": self.investor.niit_applies,
        }

    def summary(self) -> dict:
        sell_only = self.total_tax_due()
        out = {
            "scenario": self.scenario_type,
            "sale_price": self.sale_price,
            "sell_only": sell_only,
        }
        if self.exchange:
            out["exchange_1031"] = self.exchange.summary(self.investor)
        if self.qoz:
            out["qoz"] = self.qoz.summary(self.investor)

        # Combined outcome: deferral balance after hold period
        if self.exchange and self.qoz:
            # 1031 deferred gain rolls into QOZ as the new deferred gain
            combined_deferred = self.exchange.deferred_gain
            self.qoz.deferred_gain = combined_deferred
            combined_qoz = self.qoz.summary(self.investor)
            # Total tax paid NOW (recapture + boot) + tax at QOZ exit
            tax_now = self.exchange.recapture_breakdown(
                ordinary_rate=self.investor.ordinary_income_bracket,
                sec1250_rate=self.investor.effective_1250_rate
            )["tax_on_recognized_gain"]
            tax_at_qoz_exit = combined_qoz["deferred_gain_outcome"]["ordinary_income_tax"]
            tax_appreciation = combined_qoz["appreciation_outcome"]["tax_on_appreciation"]
            total_tax = tax_now + tax_at_qoz_exit + tax_appreciation
            net = self.sale_price - self.sale_costs - total_tax
            out["combined_outcome"] = {
                "tax_at_sale_recapture_only": round(tax_now, 2),
                "tax_at_qoz_year5_inclusion": round(tax_at_qoz_exit, 2),
                "tax_on_qof_appreciation_10yr": round(tax_appreciation, 2),
                "total_tax_over_lifecycle": round(total_tax, 2),
                "net_after_tax_proceeds": round(net, 2),
                "vs_sell_only_tax_savings": round(sell_only["tax_total"] - total_tax, 2),
            }
        return out


# =====================================================================
# Example Scenarios
# =====================================================================
def make_default_investor() -> Investor:
    return Investor(
        filing_status="MFJ",
        ordinary_income_bracket=0.37,
        is_rep=True,
        magi=400_000.0,
        is_rural_qoz=False,
    )


def example_sell_only():
    prop = Property(
        name="SFR Dallas TX",
        purchase_price=400_000,
        land_value=80_000,
        closing_costs=8_000,
        accumulated_depreciation=80_000,
        accelerated_depreciation_taken=20_000,  # §1245 portion
        purchase_date="2020-01-01",
        cost_seg_done=True,
        cost_seg_5_7_15_basis=40_000,
    )
    return ExitScenario(
        scenario_type="SELL_ONLY",
        property=prop,
        investor=make_default_investor(),
        sale_price=560_000,
        sale_date="2026-06-15",
        sale_costs=33_600,
    )


def example_sell_then_1031():
    prop = Property(
        name="SFR Dallas TX",
        purchase_price=400_000,
        land_value=80_000,
        closing_costs=8_000,
        accumulated_depreciation=80_000,
        accelerated_depreciation_taken=20_000,
        purchase_date="2020-01-01",
    )
    ex = Exchange1031(
        relinquished_sale_price=560_000,
        relinquished_adjusted_basis=prop.adjusted_basis,
        accumulated_depreciation=prop.accumulated_depreciation,
        accelerated_depreciation_taken=prop.accelerated_depreciation_taken,
        mortgage_on_relinquished=240_000,
        replacement_property_fmv=620_000,
        replacement_mortgage=310_000,
        cash_buyout_to_exchanger=0.0,
        sale_date="2026-06-15",
    )
    return ExitScenario(
        scenario_type="SELL_THEN_1031",
        property=prop,
        investor=make_default_investor(),
        sale_price=560_000,
        sale_date="2026-06-15",
        sale_costs=33_600,
        exchange=ex,
    )


def example_sell_then_1031_into_qoz():
    """The sophisticated sequence: 1031 into QOZ property."""
    prop = Property(
        name="SFR Dallas TX",
        purchase_price=400_000,
        land_value=80_000,
        closing_costs=8_000,
        accumulated_depreciation=80_000,
        accelerated_depreciation_taken=20_000,
        purchase_date="2020-01-01",
    )
    ex = Exchange1031(
        relinquished_sale_price=560_000,
        relinquished_adjusted_basis=prop.adjusted_basis,
        accumulated_depreciation=prop.accumulated_depreciation,
        accelerated_depreciation_taken=prop.accelerated_depreciation_taken,
        mortgage_on_relinquished=240_000,
        replacement_property_fmv=620_000,  # replacement is the QOZ property
        replacement_mortgage=310_000,
        cash_buyout_to_exchanger=0.0,
        sale_date="2026-06-15",
    )
    # The deferred 1031 gain rolls into QOZ investment
    deferred = ex.deferred_gain
    qoz = QOZInvestment(
        deferred_gain=deferred,
        investment_date="2026-08-01",
        investment_year=2026,
        hold_years=10,
        qof_growth_rate=0.05,
        is_rural=False,
    )
    return ExitScenario(
        scenario_type="SELL_THEN_1031_INTO_QOZ",
        property=prop,
        investor=make_default_investor(),
        sale_price=560_000,
        sale_date="2026-06-15",
        sale_costs=33_600,
        exchange=ex,
        qoz=qoz,
        hold_years_post_exit=10,
    )


def example_sell_then_1031_qoz_rural():
    """OBBBA QROF: rural QOZ with 30% step-up."""
    prop = Property(
        name="SFR Rural TX",
        purchase_price=300_000,
        land_value=50_000,
        closing_costs=6_000,
        accumulated_depreciation=60_000,
        accelerated_depreciation_taken=15_000,
    )
    ex = Exchange1031(
        relinquished_sale_price=420_000,
        relinquished_adjusted_basis=prop.adjusted_basis,
        accumulated_depreciation=prop.accumulated_depreciation,
        accelerated_depreciation_taken=prop.accelerated_depreciation_taken,
        mortgage_on_relinquished=180_000,
        replacement_property_fmv=480_000,
        replacement_mortgage=240_000,
        sale_date="2027-03-01",
    )
    qoz = QOZInvestment(
        deferred_gain=ex.deferred_gain,
        investment_date="2027-04-15",
        investment_year=2027,    # OBBBA rules
        hold_years=10,
        qof_growth_rate=0.06,
        is_rural=True,           # QROF
    )
    return ExitScenario(
        scenario_type="SELL_THEN_1031_INTO_QOZ_RURAL_QROF",
        property=prop,
        investor=make_default_investor(),
        sale_price=420_000,
        sale_date="2027-03-01",
        sale_costs=25_200,
        exchange=ex,
        qoz=qoz,
        hold_years_post_exit=10,
    )


# =====================================================================
# Built-in Test Suite (smoke test)
# =====================================================================
def run_tests():
    print("=" * 72)
    print("DSCR Sovereign OS — 1031 × QOZ Interaction Model — Test Suite")
    print("=" * 72)

    # Test 1: SELL_ONLY baseline
    print("\n--- TEST 1: SELL_ONLY ---")
    s = example_sell_only()
    r = s.summary()
    print(json.dumps(r, indent=2))
    assert r["sell_only"]["realized_gain"] > 0
    # Recognized gain should include recapture + LTCG
    assert r["sell_only"]["section_1245_ordinary"] == 20_000
    assert r["sell_only"]["section_1250_unrecaptured"] == 60_000  # 80K - 20K accelerated

    # Test 2: SELL_THEN_1031 — only §1245 recognized (no boot), §1250 + §1231 deferred
    print("\n--- TEST 2: SELL_THEN_1031 ---")
    s = example_sell_then_1031()
    r = s.summary()
    print(json.dumps(r, indent=2))
    ex_out = r["exchange_1031"]
    assert ex_out["realized_gain"] > 0
    # Boot = max(0, 240K - 310K) = 0 (replacement mortgage is larger, so no relief)
    assert ex_out["boot_mortgage_relief"] == 0
    # No cash boot
    assert ex_out["boot_cash"] == 0
    # All non-recapture gain should be deferred
    assert ex_out["deferred_gain"] > 0
    # §1245 is ALWAYS recognized even in 1031 (not boot-conditional)
    assert ex_out["tax_breakdown"]["section_1245_ordinary"] == 20_000
    # §1250 NOT recognized because no boot (despite §1250 being pre-existing in the asset)
    assert ex_out["tax_breakdown"]["section_1250_unrecaptured"] == 0
    assert ex_out["tax_breakdown"]["section_1231_ltcg"] == 0
    # Tax at closing = §1245 ordinary only
    assert ex_out["tax_breakdown"]["tax_on_recognized_gain"] == 20_000 * ORDINARY_INCOME_RATE
    print(f"  Tax paid at 1031 closing (§1245 only): ${ex_out['tax_breakdown']['tax_on_recognized_gain']:,.0f}")
    print(f"  Deferred gain (rolls into replacement basis): ${ex_out['deferred_gain']:,.0f}")

    # Test 3: 1031 INTO QOZ (the crown jewel) — TCJA pre-2027 example
    print("\n--- TEST 3: SELL_THEN_1031_INTO_QOZ (TCJA pre-2027 rules) ---")
    s = example_sell_then_1031_into_qoz()
    r = s.summary()
    print(json.dumps(r, indent=2))
    c = r["combined_outcome"]
    sell_only_tax = r["sell_only"]["tax_total"]
    print(f"\n  SELL_ONLY tax:                            ${sell_only_tax:>12,.0f}")
    print(f"  1031+QOZ tax (recapture + QOZ exit):     ${c['total_tax_over_lifecycle']:>12,.0f}")
    print(f"  Tax savings vs sell-only:                ${c['vs_sell_only_tax_savings']:>12,.0f}")
    # Note: under TCJA pre-2027 rules, the 10% step-up is at year 5 only.
    # If the deferred gain is recognized at ordinary rates (37%) vs sell-only §1250
    # (28.8% w/ NIIT), the 1031+QOZ path may NOT save taxes for high-bracket investors
    # unless the QOF is held >= 7 years (15% step-up, eliminated by OBBBA for new
    # investments). This is precisely why OBBBA restructured the rules — see Test 4.
    # Verify the TCJA regime was applied:
    assert r["qoz"]["deferred_gain_outcome"]["regime"] == "TCJA"
    assert r["qoz"]["deferred_gain_outcome"]["stepup_pct_applied"] == 0.10

    # Test 4: Rural QROF (OBBBA)
    print("\n--- TEST 4: 1031 INTO RURAL QROF (OBBBA 30% step-up) ---")
    s = example_sell_then_1031_qoz_rural()
    r = s.summary()
    print(json.dumps(r, indent=2))
    # Rural QROF gets 30% step-up at year 5
    qoz_out = r["qoz"]["deferred_gain_outcome"]
    assert qoz_out["stepup_pct_applied"] == 0.30
    assert qoz_out["regime"] == "OBBBA"

    print("\n" + "=" * 72)
    print("ALL TESTS PASSED")
    print("=" * 72)


# =====================================================================
# CLI
# =====================================================================
def main():
    parser = argparse.ArgumentParser(description="1031 × QOZ Interaction Model")
    parser.add_argument("--example", choices=[
        "sell_only", "sell_then_1031", "sell_then_1031_into_qoz",
        "sell_then_1031_qoz_rural", "all"
    ], default="all")
    parser.add_argument("--test", action="store_true", help="Run smoke test suite")
    args = parser.parse_args()

    if args.test:
        run_tests()
        return

    examples = {
        "sell_only": example_sell_only,
        "sell_then_1031": example_sell_then_1031,
        "sell_then_1031_into_qoz": example_sell_then_1031_into_qoz,
        "sell_then_1031_qoz_rural": example_sell_then_1031_qoz_rural,
    }
    if args.example == "all":
        for name, fn in examples.items():
            print("\n" + "=" * 72)
            print(f"EXAMPLE: {name}")
            print("=" * 72)
            r = fn().summary()
            print(json.dumps(r, indent=2))
    else:
        r = examples[args.example]().summary()
        print(json.dumps(r, indent=2))


if __name__ == "__main__":
    main()
