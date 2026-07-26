"""
DSCR Sovereign OS — Core Calculator Module
Track 1-4 DSCR calculations with Python-verified golden vector

Golden Vector (Python-verified EXACT):
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

from decimal import ROUND_HALF_UP, Decimal


def calculate_pi_factor(annual_rate: float, term_years: int = 30) -> float:
    """
    Calculate monthly P&I factor

    PI_factor = r/12 * (1+r/12)^n / ((1+r/12)^n - 1)

    Args:
        annual_rate: Annual interest rate (e.g., 0.07 for 7%)
        term_years: Loan term in years (default 30)

    Returns:
        Monthly P&I factor
    """
    r = annual_rate / 12
    n = term_years * 12
    return r * (1 + r) ** n / ((1 + r) ** n - 1)


def calculate_pi(loan_amount: float, annual_rate: float, term_years: int = 30) -> float:
    """
    Calculate monthly principal and interest payment

    Golden Vector: $318,750 @ 7.00% / 30yr = $2,120.6517

    Args:
        loan_amount: Loan amount in dollars
        annual_rate: Annual interest rate (e.g., 0.07 for 7%)
        term_years: Loan term in years (default 30)

    Returns:
        Monthly P&I payment
    """
    factor = calculate_pi_factor(annual_rate, term_years)
    return loan_amount * factor


def calculate_monthly_tax(annual_property_tax: float) -> float:
    """Convert annual property tax to monthly"""
    return annual_property_tax / 12


def calculate_monthly_insurance(annual_insurance: float) -> float:
    """Convert annual insurance to monthly"""
    return annual_insurance / 12


def calculate_pitia(
    monthly_pi: float, annual_property_tax: float, annual_insurance: float, monthly_hoa: float
) -> float:
    """
    Calculate monthly PITIA (Principal, Interest, Taxes, Insurance, Association)

    PITIA = P&I + (Tax/12) + (Insurance/12) + HOA

    Golden Vector: $2,120.6517 + $416.67 + $166.67 + $150 = $2,853.9850

    Args:
        monthly_pi: Monthly P&I payment
        annual_property_tax: Annual property tax
        annual_insurance: Annual insurance premium
        monthly_hoa: Monthly HOA dues

    Returns:
        Monthly PITIA
    """
    monthly_tax = calculate_monthly_tax(annual_property_tax)
    monthly_ins = calculate_monthly_insurance(annual_insurance)
    return monthly_pi + monthly_tax + monthly_ins + monthly_hoa


def calculate_dscr_track1(
    monthly_rent: float, monthly_pi: float, annual_property_tax: float, annual_insurance: float, monthly_hoa: float
) -> float:
    """
    Track 1: Lender Qualifying DSCR

    DSCR_A = Gross_Rent / Monthly_PITIA

    Golden Vector: $3,000 / $2,853.9850 = 1.0512

    Args:
        monthly_rent: Monthly gross rent
        monthly_pi: Monthly P&I payment
        annual_property_tax: Annual property tax
        annual_insurance: Annual insurance premium
        monthly_hoa: Monthly HOA dues

    Returns:
        Track 1 DSCR ratio
    """
    pitia = calculate_pitia(monthly_pi, annual_property_tax, annual_insurance, monthly_hoa)
    return monthly_rent / pitia


def calculate_dscr_track1_io(
    monthly_rent: float,
    loan_amount: float,
    annual_rate: float,
    annual_property_tax: float,
    annual_insurance: float,
    monthly_hoa: float,
) -> float:
    """
    Track 1 IO: Interest-Only DSCR

    DSCR_IO = Rent / ITIA
    Where ITIA = (Loan * Rate / 12) + (Tax/12) + (Insurance/12) + HOA
    Note: Principal excluded during IO period

    Args:
        monthly_rent: Monthly gross rent
        loan_amount: Loan amount
        annual_rate: Annual interest rate
        annual_property_tax: Annual property tax
        annual_insurance: Annual insurance premium
        monthly_hoa: Monthly HOA dues

    Returns:
        Track 1 IO DSCR ratio
    """
    monthly_interest = loan_amount * annual_rate / 12
    monthly_tax = calculate_monthly_tax(annual_property_tax)
    monthly_ins = calculate_monthly_insurance(annual_insurance)
    itia = monthly_interest + monthly_tax + monthly_ins + monthly_hoa
    return monthly_rent / itia


def calculate_dscr_track2(
    annual_gross_rent: float, vacancy_rate: float, annual_opex: float, annual_debt_service: float
) -> float:
    """
    Track 2: Investor Survival DSCR

    DSCR_B = Annual_NOI / Annual_Debt_Service
    Where NOI = Gross_Rent * (1 - Vacancy) - OpEx

    This is the "does it actually cash flow?" metric

    Args:
        annual_gross_rent: Annual gross rental income
        vacancy_rate: Vacancy rate (e.g., 0.05 for 5%)
        annual_opex: Annual operating expenses (excluding debt service)
        annual_debt_service: Annual debt service (PITIA * 12)

    Returns:
        Track 2 DSCR ratio
    """
    noi = annual_gross_rent * (1 - vacancy_rate) - annual_opex
    return noi / annual_debt_service


def calculate_dscr_track3(stabilized_noi: float, annual_debt_service: float) -> float:
    """
    Track 3: Stabilized DSCR

    DSCR_C = Stabilized_NOI / Annual_Debt_Service

    Used for portfolio underwriting with normalized vacancy

    Args:
        stabilized_noi: Stabilized Net Operating Income
        annual_debt_service: Annual debt service

    Returns:
        Track 3 DSCR ratio
    """
    return stabilized_noi / annual_debt_service


def calculate_dscr_track4(forward_12m_noi: float, forward_12m_debt_service: float) -> float:
    """
    Track 4: Forward 12-Month DSCR (FADSCR)

    FADSCR = Forward_12M_NOI / Forward_12M_Debt_Service

    Forward-looking metric for ARM resets and rate changes

    Args:
        forward_12m_noi: Projected 12-month NOI
        forward_12m_debt_service: Projected 12-month debt service

    Returns:
        Track 4 FADSCR ratio
    """
    return forward_12m_noi / forward_12m_debt_service


def calculate_debt_yield(annual_noi: float, loan_amount: float) -> float:
    """
    Debt Yield = Annual_NOI / Loan_Amount

    Institutional floor: 9-10%

    Args:
        annual_noi: Annual Net Operating Income
        loan_amount: Loan amount

    Returns:
        Debt yield as decimal (e.g., 0.09 for 9%)
    """
    return annual_noi / loan_amount


def calculate_ltv(loan_amount: float, property_value: float) -> float:
    """
    LTV = Loan_Amount / Property_Value

    Args:
        loan_amount: Loan amount
        property_value: Property value (lower of purchase or appraised)

    Returns:
        LTV as decimal (e.g., 0.75 for 75%)
    """
    return loan_amount / property_value


def calculate_deal_break_rate(
    loan_amount: float,
    term_years: int,
    monthly_rent: float,
    annual_property_tax: float,
    annual_insurance: float,
    monthly_hoa: float,
    target_dscr: float = 1.0,
) -> float:
    """
    Calculate the maximum interest rate at which DSCR remains >= target

    Uses bisection method to find the rate where:
    DSCR = Rent / PITIA(rate) = target_dscr

    Args:
        loan_amount: Loan amount
        term_years: Loan term
        monthly_rent: Monthly gross rent
        annual_property_tax: Annual property tax
        annual_insurance: Annual insurance
        monthly_hoa: Monthly HOA
        target_dscr: Target DSCR (default 1.0)

    Returns:
        Maximum interest rate (deal-break rate)
    """
    low, high = 0.001, 0.30  # 0.1% to 30%

    for _ in range(100):  # 100 iterations for precision
        mid = (low + high) / 2
        pi = calculate_pi(loan_amount, mid, term_years)
        dscr = calculate_dscr_track1(monthly_rent, pi, annual_property_tax, annual_insurance, monthly_hoa)

        if abs(dscr - target_dscr) < 0.0001:
            return mid
        elif dscr > target_dscr:
            low = mid
        else:
            high = mid

    return (low + high) / 2


def round_currency(amount: float) -> float:
    """Round to cents"""
    return float(Decimal(str(amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def round_dscr(dscr: float, places: int = 2) -> float:
    """Round DSCR to specified decimal places"""
    return float(Decimal(str(dscr)).quantize(Decimal(10) ** -places, rounding=ROUND_HALF_UP))
