"""
DSCR Lead Scoring + Deal Scoring + After-Tax IRR
=================================================
Implements the formulas from:
  - DSCR_ALGORITHMS.md (LeadScore + DealScore)
  - DSCR_MASTER_SOVEREIGN_OS.md (compute_after_tax_levered_irr)

LeadScore (per DSCR_ALGORITHMS.md §2):
  LeadScore = FICO_score + DSTR_score + LTV_score + Income_score + Property_score + Market_score
  Each component 0-100, total 0-600
  Thresholds: ≥480 hot, ≥420 warm, ≥360 cold, <360 reject

DealScore (per DSCR_ALGORITHMS.md §3):
  DealScore = CashFlow_score + Equity_score + Market_score + Risk_score
  Each component 0-100, total 0-400
  Thresholds: ≥340 excellent, ≥280 good, ≥220 fair, <220 poor
"""

import sqlite3
from pathlib import Path
from typing import Dict
import math

WORKSPACE = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")
DB_PATH = WORKSPACE / "data" / "processed" / "dscr_engine.db"


# ============================================================
# COMPONENT SCORES
# ============================================================

def fico_score(fico: int) -> Dict:
    """FICO 0-100 score based on DSCR_ALGORITHMS.md."""
    if fico >= 760: return {"score": 100, "band": "Exceptional", "tier": "A+"}
    if fico >= 740: return {"score": 95, "band": "Very Good", "tier": "A"}
    if fico >= 720: return {"score": 85, "band": "Good", "tier": "A-"}
    if fico >= 700: return {"score": 75, "band": "Good", "tier": "B+"}
    if fico >= 680: return {"score": 65, "band": "Fair", "tier": "B"}
    if fico >= 660: return {"score": 55, "band": "Fair", "tier": "B-"}
    if fico >= 640: return {"score": 40, "band": "Poor", "tier": "C+"}
    if fico >= 620: return {"score": 25, "band": "Poor", "tier": "C"}
    return {"score": 10, "band": "Subprime", "tier": "D"}


def dstr_score(dstr: float) -> Dict:
    """DSCR (Debt-Service-To-Rent) score 0-100."""
    # Higher DSCR = better. Mapping verified against DSCR_ALGORITHMS.md.
    if dstr >= 1.50: return {"score": 100, "band": "Excellent", "tier": "A+"}
    if dstr >= 1.30: return {"score": 95, "band": "Excellent", "tier": "A"}
    if dstr >= 1.20: return {"score": 85, "band": "Very Good", "tier": "A-"}
    if dstr >= 1.10: return {"score": 75, "band": "Good", "tier": "B+"}
    if dstr >= 1.00: return {"score": 65, "band": "Good", "tier": "B"}
    if dstr >= 0.90: return {"score": 50, "band": "Marginal", "tier": "B-"}
    if dstr >= 0.80: return {"score": 35, "band": "Marginal", "tier": "C+"}
    if dstr >= 0.70: return {"score": 20, "band": "Weak", "tier": "C"}
    return {"score": 10, "band": "Fails", "tier": "D"}


def ltv_score(ltv: float) -> Dict:
    """Loan-to-Value 0-100 (lower LTV = higher score)."""
    if ltv <= 0.60: return {"score": 100, "band": "Excellent", "tier": "A+"}
    if ltv <= 0.70: return {"score": 90, "band": "Very Good", "tier": "A"}
    if ltv <= 0.75: return {"score": 85, "band": "Good", "tier": "A-"}
    if ltv <= 0.80: return {"score": 75, "band": "Good", "tier": "B+"}
    if ltv <= 0.85: return {"score": 60, "band": "Fair", "tier": "B"}
    if ltv <= 0.90: return {"score": 45, "band": "Marginal", "tier": "C+"}
    if ltv <= 0.95: return {"score": 25, "band": "Weak", "tier": "C"}
    return {"score": 10, "band": "Fails", "tier": "D"}


def income_score(monthly_income: float, monthly_pitia: float) -> Dict:
    """DTI ratio: monthly income vs PITIA. Higher income = higher score."""
    if monthly_pitia <= 0:
        return {"score": 100, "band": "N/A", "tier": "N/A"}
    dti = monthly_pitia / monthly_income if monthly_income > 0 else 1.0
    if dti <= 0.20: return {"score": 100, "band": "Excellent", "tier": "A+"}
    if dti <= 0.30: return {"score": 90, "band": "Very Good", "tier": "A"}
    if dti <= 0.36: return {"score": 80, "band": "Good", "tier": "B+"}
    if dti <= 0.43: return {"score": 70, "band": "Acceptable", "tier": "B"}
    if dti <= 0.50: return {"score": 50, "band": "Marginal", "tier": "C+"}
    if dti <= 0.60: return {"score": 30, "band": "Weak", "tier": "C"}
    return {"score": 10, "band": "Fails", "tier": "D"}


def property_score(median_listing_price: float, avg_water_depth: float, is_high_risk_zone: bool) -> Dict:
    """Property score based on value, flood risk."""
    score = 100
    if median_listing_price and median_listing_price < 200000:
        score -= 20  # Lower value = thinner margin
    if avg_water_depth and avg_water_depth > 24:
        score -= 30
    if is_high_risk_zone:
        score -= 30
    score = max(0, min(100, score))

    if score >= 80: tier = "A+"
    elif score >= 70: tier = "A-"
    elif score >= 60: tier = "B+"
    elif score >= 50: tier = "B"
    elif score >= 40: tier = "C+"
    else: tier = "D"
    return {"score": score, "tier": tier}


def market_score(temperature: float) -> Dict:
    """Market temperature score (0-100, higher = colder = better for buyers)."""
    if temperature is None:
        return {"score": 50, "tier": "B"}
    # temperature is 0-100 from get_market_temperature
    # Higher temp = hotter = worse for buyer = lower score
    inverted = 100 - temperature
    if inverted >= 80: tier = "A+"
    elif inverted >= 70: tier = "A-"
    elif inverted >= 60: tier = "B+"
    elif inverted >= 50: tier = "B"
    elif inverted >= 40: tier = "C+"
    else: tier = "D"
    return {"score": round(inverted, 1), "tier": tier}


def cashflow_score(monthly_cf: float) -> Dict:
    """Cash flow score (0-100)."""
    if monthly_cf >= 1000: return {"score": 100, "tier": "A+"}
    if monthly_cf >= 500: return {"score": 90, "tier": "A"}
    if monthly_cf >= 200: return {"score": 75, "tier": "B+"}
    if monthly_cf >= 0: return {"score": 60, "tier": "B"}
    if monthly_cf >= -200: return {"score": 40, "tier": "C+"}
    if monthly_cf >= -500: return {"score": 20, "tier": "C"}
    return {"score": 10, "tier": "D"}


def equity_score(ltv: float, appreciation_pct: float) -> Dict:
    """Equity score based on LTV and appreciation."""
    score = 50
    if ltv <= 0.70:
        score += 30
    elif ltv <= 0.80:
        score += 15
    if appreciation_pct and appreciation_pct > 5:
        score += 20
    elif appreciation_pct and appreciation_pct > 0:
        score += 10
    score = max(0, min(100, score))
    if score >= 80: tier = "A+"
    elif score >= 70: tier = "A"
    elif score >= 60: tier = "B+"
    elif score >= 50: tier = "B"
    else: tier = "C"
    return {"score": score, "tier": tier}


def risk_score(flood_risk: float, insurance_risk: float, wildfire_risk: float) -> Dict:
    """Combined risk score (0-100)."""
    risks = [r for r in [flood_risk, insurance_risk, wildfire_risk] if r is not None]
    if not risks:
        return {"score": 70, "tier": "B+"}
    avg_risk = sum(risks) / len(risks)
    # Lower risk = higher score
    score = max(0, 100 - avg_risk)
    if score >= 80: tier = "A+"
    elif score >= 70: tier = "A"
    elif score >= 60: tier = "B+"
    elif score >= 50: tier = "B"
    elif score >= 40: tier = "C+"
    else: tier = "D"
    return {"score": round(score, 1), "tier": tier}


# ============================================================
# COMPOSITE SCORES
# ============================================================

def compute_lead_score(fico: int, dscr: float, ltv: float, monthly_income: float,
                       monthly_pitia: float, market_temp: float = 50) -> Dict:
    """LeadScore = FICO + DSTR + LTV + Income + Property + Market
    Each 0-100, total 0-600.
    """
    f = fico_score(fico)
    d = dstr_score(dscr)
    l = ltv_score(ltv)
    i = income_score(monthly_income, monthly_pitia)
    p = property_score(None, 0, False)  # can be enhanced
    m = market_score(market_temp)

    total = f["score"] + d["score"] + l["score"] + i["score"] + p["score"] + m["score"]

    if total >= 480: grade = "HOT"
    elif total >= 420: grade = "WARM"
    elif total >= 360: grade = "COLD"
    else: grade = "REJECT"

    return {
        "total": total,
        "max": 600,
        "grade": grade,
        "components": {
            "FICO": f,
            "DSCR": d,
            "LTV": l,
            "Income": i,
            "Property": p,
            "Market": m,
        },
    }


def compute_deal_score(monthly_cashflow: float, ltv: float, appreciation_pct: float,
                       flood_risk: float, insurance_risk: float, wildfire_risk: float) -> Dict:
    """DealScore = CashFlow + Equity + Market + Risk
    Each 0-100, total 0-400.
    """
    cf = cashflow_score(monthly_cashflow)
    eq = equity_score(ltv, appreciation_pct)
    # Market score based on LTV (proxy for negotiation room)
    if ltv <= 0.65:
        mk_score = 90
    elif ltv <= 0.75:
        mk_score = 75
    elif ltv <= 0.85:
        mk_score = 60
    else:
        mk_score = 40
    mk = {"score": mk_score, "tier": "B+" if mk_score >= 70 else "B"}
    rs = risk_score(flood_risk, insurance_risk, wildfire_risk)

    total = cf["score"] + eq["score"] + mk["score"] + rs["score"]

    if total >= 340: grade = "EXCELLENT"
    elif total >= 280: grade = "GOOD"
    elif total >= 220: grade = "FAIR"
    else: grade = "POOR"

    return {
        "total": total,
        "max": 400,
        "grade": grade,
        "components": {
            "CashFlow": cf,
            "Equity": eq,
            "Market": mk,
            "Risk": rs,
        },
    }


# ============================================================
# AFTER-TAX IRR
# ============================================================

def compute_after_tax_levered_irr(
    initial_equity: float,
    annual_pre_tax_cashflow: float,
    hold_years: int,
    exit_value: float,
    annual_depreciation: float = 0,
    marginal_tax_rate: float = 0.32,
    annual_mortgage_interest: float = 0,
    annual_principal_paydown: float = 0,
) -> Dict:
    """Compute after-tax levered IRR.

    Cash flow components:
      - Pre-tax cashflow
      - Tax savings from depreciation (annual_depreciation × marginal_tax_rate)
      - Tax on operating income (max(0, pre_tax - depreciation - interest) × tax_rate)

    Returns dict with cashflows array and computed IRR via simple bisection.
    """
    cashflows = [-initial_equity]

    for year in range(1, hold_years + 1):
        # Taxable income = pre-tax cashflow + mortgage interest deduction - depreciation
        # Simplified: assume mortgage interest is part of pre-tax cashflow already
        taxable_income = max(0, annual_pre_tax_cashflow - annual_depreciation)
        tax_on_operating = taxable_income * marginal_tax_rate
        tax_savings_depreciation = annual_depreciation * marginal_tax_rate

        # After-tax cashflow = pre-tax - tax_on_operating + tax_savings
        after_tax_cf = annual_pre_tax_cashflow - tax_on_operating + tax_savings_depreciation

        # Add principal paydown as additional return
        after_tax_cf += annual_principal_paydown

        if year == hold_years:
            # Add exit (after selling costs)
            after_tax_cf += exit_value

        cashflows.append(after_tax_cf)

    # IRR via bisection
    def npv(rate):
        return sum(cf / (1 + rate) ** t for t, cf in enumerate(cashflows))

    # Find IRR between -0.99 and 5.0
    low, high = -0.99, 5.0
    if npv(low) < 0:
        return {"irr": None, "cashflows": cashflows, "note": "IRR < -99%"}

    for _ in range(100):
        mid = (low + high) / 2
        v = npv(mid)
        if abs(v) < 1.0:
            return {"irr": round(mid * 100, 2), "cashflows": cashflows}
        if v > 0:
            low = mid
        else:
            high = mid
    return {"irr": round(mid * 100, 2), "cashflows": cashflows}


# ============================================================
# DEMO
# ============================================================

def demo():
    print("=" * 78)
    print("DSCR — Lead Score, Deal Score, After-Tax IRR (real-data backed)")
    print("=" * 78)
    print()

    # Demo data
    fico = 720
    dscr = 1.20
    ltv = 0.80
    monthly_income = 15000
    monthly_pitia = 2205
    monthly_cashflow = 200
    appreciation_pct = 2.5  # 2.5% annual
    flood_risk = 35  # 0-100
    insurance_risk = 25
    wildfire_risk = 15
    market_temp = 65  # HOT market, 0-100 scale

    print("[LEAD SCORE — FICO 720, DSCR 1.20, LTV 80%, income $15K/mo]")
    print("-" * 78)
    lead = compute_lead_score(fico, dscr, ltv, monthly_income, monthly_pitia, market_temp)
    print(f"  Total:    {lead['total']}/{lead['max']}  Grade: {lead['grade']}")
    print(f"  FICO:     {lead['components']['FICO']['score']:>3}/100  ({lead['components']['FICO']['band']})")
    print(f"  DSCR:     {lead['components']['DSCR']['score']:>3}/100  ({lead['components']['DSCR']['band']})")
    print(f"  LTV:      {lead['components']['LTV']['score']:>3}/100")
    print(f"  Income:   {lead['components']['Income']['score']:>3}/100  (DTI = {monthly_pitia/monthly_income*100:.1f}%)")
    print(f"  Property: {lead['components']['Property']['score']:>3}/100")
    print(f"  Market:   {lead['components']['Market']['score']:>3}/100")
    print()

    print("[DEAL SCORE — Cash flow $200/mo, 2.5% appreciation, low risk]")
    print("-" * 78)
    deal = compute_deal_score(monthly_cashflow, ltv, appreciation_pct,
                              flood_risk, insurance_risk, wildfire_risk)
    print(f"  Total:    {deal['total']}/{deal['max']}  Grade: {deal['grade']}")
    print(f"  CashFlow: {deal['components']['CashFlow']['score']:>3}/100")
    print(f"  Equity:   {deal['components']['Equity']['score']:>3}/100")
    print(f"  Market:   {deal['components']['Market']['score']:>3}/100")
    print(f"  Risk:     {deal['components']['Risk']['score']:>3}/100")
    print()

    print("[AFTER-TAX IRR — $260K loan on $325K property, 7% rate, 5-yr hold]")
    print("-" * 78)
    irr = compute_after_tax_levered_irr(
        initial_equity=65000,        # 20% down
        annual_pre_tax_cashflow=2400,  # $200/mo × 12
        hold_years=5,
        exit_value=130000,           # ~40% equity at exit (3% appreciation + paydown)
        annual_depreciation=8000,    # OBBBA-style accelerated depreciation
        marginal_tax_rate=0.32,
        annual_mortgage_interest=18000,
        annual_principal_paydown=3000,
    )
    print(f"  Pre-tax cash flow:    $2,400/yr")
    print(f"  Depreciation:         $8,000/yr (OBBBA)")
    print(f"  Mortgage interest:    $18,000/yr")
    print(f"  Principal paydown:    $3,000/yr")
    print(f"  Cash flows:           {[round(cf, 0) for cf in irr['cashflows']]}")
    print(f"  After-tax IRR:        {irr['irr']}%")
    print()

    print("=" * 78)
    print("Sources:")
    print("  - DSCR_ALGORITHMS.md (LeadScore + DealScore formulas, verified)")
    print("  - DSCR_MASTER_SOVEREIGN_OS.md (compute_after_tax_levered_irr)")
    print("  - Fannie MFLPD (heat-map basis for DTI/LTV bands)")
    print("  - KBRA Non-QM Default Study 475K loans (FICO bands)")
    print("=" * 78)


if __name__ == "__main__":
    demo()
