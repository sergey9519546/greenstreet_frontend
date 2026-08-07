"""
DSCR Sovereign OS — PPP Rules Engine
50-state prepayment penalty logic with annual re-indexing

Key thresholds (2026):
- Pennsylvania: $329,411 (PA Act 6/LIPL, annually indexed)
- Ohio: $116,356 (ORC §1343.011, annually indexed)
- Minnesota: HF 3437 (eff. 8/1/2026) — business-purpose exempt
- New Jersey: N.J.S.A. 46:10B-2 — LLC HIGH-RISK
- New York: Penal Law §190.40 — 25% criminal usury cap
"""

from dataclasses import dataclass
from enum import Enum


class PPPEligibility(Enum):
    ALLOWED = "allowed"
    PROHIBITED = "prohibited"
    HIGH_RISK = "high_risk"  # LLC in NJ, etc.
    DECLINING_ONLY = "declining_only"  # MS: max 5-4-3-2-1
    AMBIGUOUS = "ambiguous"


@dataclass
class StatePPPRule:
    state: str
    statute: str
    threshold: float | None
    max_ppp_pct: float | None
    ppp_term_years: int | None
    business_exempt: bool
    notes: str
    effective_date: str
    source: str
    verify_annually: bool = False


# 2026 PPP State Matrix
PPP_MATRIX = {
    "PA": StatePPPRule(
        state="PA",
        statute="PA Act 6/LIPL",
        threshold=329_411,  # 2026 indexed
        max_ppp_pct=None,  # Business-purpose: no statutory cap
        ppp_term_years=None,
        business_exempt=False,
        notes="Business-purpose loans above threshold: PPP allowed with disclosure. Below threshold: prohibited for 1-2 unit.",
        effective_date="2026-01-01",
        source="Arch Home Loans wholesale guidelines; Sprint 2 research",
        verify_annually=True,
    ),
    "OH": StatePPPRule(
        state="OH",
        statute="ORC §1343.011",
        threshold=116_356,  # 2026 indexed
        max_ppp_pct=0.01,  # 1% cap
        ppp_term_years=5,
        business_exempt=True,
        notes="1% cap for 5 years on 1-2 unit residential. Business-purpose exempt.",
        effective_date="2026-01-01",
        source="OH Dept. of Commerce",
        verify_annually=True,
    ),
    "MN": StatePPPRule(
        state="MN",
        statute="MN §58.137 + HF 3437",
        threshold=None,
        max_ppp_pct=None,
        ppp_term_years=None,
        business_exempt=True,
        notes="HF 3437 (eff. 8/1/2026) narrows PPP restrictions to personal/family/household loans. Business-purpose DSCR entirely outside scope.",
        effective_date="2026-08-01",
        source="Sprint 2 research; 4 sources verify",
    ),
    "NJ": StatePPPRule(
        state="NJ",
        statute="N.J.S.A. 46:10B-2",
        threshold=None,
        max_ppp_pct=None,
        ppp_term_years=None,
        business_exempt=False,
        notes="LLCs increasingly treated like individuals per July 2025 Arc Home update. Only C-Corps universally safe. HIGH-RISK for NJ LLCs.",
        effective_date="2025-07-01",
        source="Sprint 2 research; Arc Home update",
    ),
    "NY": StatePPPRule(
        state="NY",
        statute="Penal Law §190.40",
        threshold=None,
        max_ppp_pct=0.25,  # 25% criminal usury cap
        ppp_term_years=None,
        business_exempt=False,
        notes="25% criminal usury cap applies to ALL loans. Business-purpose PPP allowed with normal caps.",
        effective_date="permanent",
        source="NY Penal Law §190.40",
    ),
    "CA": StatePPPRule(
        state="CA",
        statute="CA Civ. Code §2954.10",
        threshold=None,
        max_ppp_pct=None,
        ppp_term_years=None,
        business_exempt=True,
        notes="Business-purpose loans exempt from PPP restrictions. Confirm property type.",
        effective_date="permanent",
        source="CA Civil Code",
    ),
    "FL": StatePPPRule(
        state="FL",
        statute="FL Stat. §687.04",
        threshold=100_000,
        max_ppp_pct=None,
        ppp_term_years=None,
        business_exempt=True,
        notes="Commercial/business loans above $100K exempt. PPP allowed with disclosure.",
        effective_date="permanent",
        source="FL Statute",
    ),
    "WA": StatePPPRule(
        state="WA",
        statute="RCW 19.144.040",
        threshold=None,
        max_ppp_pct=None,
        ppp_term_years=None,
        business_exempt=False,
        notes="PPP restricted to initial fixed period of ARM. No extended PPP on residential.",
        effective_date="permanent",
        source="WA Statute",
    ),
    "IL": StatePPPRule(
        state="IL",
        statute="815 ILCS 125/10",
        threshold=None,
        max_ppp_pct=None,
        ppp_term_years=None,
        business_exempt=True,
        notes="Business-purpose loans (LLC/commercial) may include PPP with disclosure.",
        effective_date="permanent",
        source="IL Loan Act",
    ),
    "MS": StatePPPRule(
        state="MS",
        statute="MS Code §75-17-31",
        threshold=None,
        max_ppp_pct=None,
        ppp_term_years=None,
        business_exempt=False,
        notes="Max declining structure: 5-4-3-2-1.",
        effective_date="permanent",
        source="MS Code",
    ),
    "AK": StatePPPRule(
        state="AK",
        statute="AK Stat.",
        threshold=None,
        max_ppp_pct=None,
        ppp_term_years=None,
        business_exempt=True,
        notes="Individual prohibited. LLC/Corp allowed.",
        effective_date="permanent",
        source="AK Statute",
    ),
}


def check_ppp_eligibility(
    state: str,
    entity_type: str,
    loan_amount: float,
    unit_count: int,
    is_business_purpose: bool,
) -> dict:
    """
    Check PPP eligibility for a given deal

    Args:
        state: Two-letter state code
        entity_type: 'Individual', 'LLC', 'Corp', 'Trust'
        loan_amount: Loan amount in dollars
        unit_count: Number of units (1-4)
        is_business_purpose: True if business-purpose DSCR loan

    Returns:
        dict with 'eligibility' (PPPEligibility), 'notes', 'statute', 'threshold'
    """
    state_upper = state.upper()

    if state_upper not in PPP_MATRIX:
        return {
            "eligibility": PPPEligibility.AMBIGUOUS,
            "notes": f"No PPP rule defined for {state}. Consult counsel.",
            "statute": None,
            "threshold": None,
        }

    rule = PPP_MATRIX[state_upper]

    # Business-purpose exemption
    if is_business_purpose and rule.business_exempt:
        return {
            "eligibility": PPPEligibility.ALLOWED,
            "notes": f"Business-purpose exempt per {rule.statute}. {rule.notes}",
            "statute": rule.statute,
            "threshold": rule.threshold,
        }

    # Threshold check
    if rule.threshold is not None and loan_amount < rule.threshold:
        return {
            "eligibility": PPPEligibility.PROHIBITED,
            "notes": f"Loan ${loan_amount:,.0f} below {rule.statute} threshold ${rule.threshold:,.0f}. PPP prohibited.",
            "statute": rule.statute,
            "threshold": rule.threshold,
        }

    # State-specific logic
    if state_upper == "NJ" and entity_type == "LLC":
        return {
            "eligibility": PPPEligibility.HIGH_RISK,
            "notes": "NJ LLC treatment HIGH-RISK. C-Corp recommended. Consult counsel.",
            "statute": rule.statute,
            "threshold": rule.threshold,
        }

    if state_upper == "MS":
        return {
            "eligibility": PPPEligibility.DECLINING_ONLY,
            "notes": "MS max declining structure: 5-4-3-2-1.",
            "statute": rule.statute,
            "threshold": rule.threshold,
        }

    if state_upper == "AK" and entity_type == "Individual":
        return {
            "eligibility": PPPEligibility.PROHIBITED,
            "notes": "AK individual prohibited. LLC/Corp allowed.",
            "statute": rule.statute,
            "threshold": rule.threshold,
        }

    # Default: allowed for business-purpose
    if is_business_purpose:
        return {
            "eligibility": PPPEligibility.ALLOWED,
            "notes": f"Business-purpose PPP allowed per {rule.statute}. {rule.notes}",
            "statute": rule.statute,
            "threshold": rule.threshold,
        }

    # Consumer: check state-specific
    return {
        "eligibility": PPPEligibility.AMBIGUOUS,
        "notes": f"Consumer PPP status unclear for {state}. Consult counsel. {rule.notes}",
        "statute": rule.statute,
        "threshold": rule.threshold,
    }
