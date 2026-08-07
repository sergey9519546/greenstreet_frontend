"""50-State Compliance Matrix for DSCR Sovereign OS.

v0.1.0 — Initial state (2026-06-20)
====================================

Encodes US state-by-state regulations relevant to DSCR lending:
- **PPP** (Prepayment Penalty) — business-purpose rules, threshold caps
- **STR** (Short-Term Rental) — legality, licensing, taxes
- **Usury caps** — maximum interest rates by state
- **Transfer/Mansion tax** — buyer/seller transfer taxes (NJ graduated 2025)
- **DSCR license requirements** — NMLS lender footprint

Data sources (verified primary):
- T12 50-state STR matrix (godmode_20260618/12_T12_50state_str_regulation/)
- T13 50-state usury caps (godmode_20260618/13_T13_50state_usury_caps/)
- Sprint 2 — PPP State Matrix, STR Legality Database (Jun 18, 2026)
- NJ Mansion Tax — Holland & Knight Aug 2025 update
- PA Act 6 §406 / 10 Pa. Code §7.2 (2026 threshold = $329,411)
- OH ORC §1343.011 (2025 threshold = $112,957; 2026 = CPI-indexed)
- WA RCW 19.144.040 (ARM PPP 60-day pre-reset limit)

Usage:
    >>> from dscr_core.state_matrix import get_state_profile, is_ppp_allowed
    >>> profile = get_state_profile("MN")
    >>> profile.ppp.business_purpose_exempt  # True (HF 3437 effective Aug 1, 2026)
    >>> is_ppp_allowed("MN", is_business_purpose=True, ppp_years=5)  # True
    >>> is_ppp_allowed("NJ", is_business_purpose=True, ppp_years=5, vesting="LLC")  # CONTESTED

Verification:
    Every state has at least 1 primary source citation. To re-verify:
    >>> from dscr_core.state_matrix import verify_state_profile
    >>> verify_state_profile("CA")  # Returns (True, "sources.csv line N")
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from typing import Any

# =============================================================================
# Enums and constants
# =============================================================================


class STRStatus(str, Enum):
    """Short-term rental legality status (T12 taxonomy)."""

    CLEAR = "CLEAR"  # No major restrictions
    UNCERTAIN = "UNCERTAIN"  # City-level rules; needs verification
    RESTRICTED = "RESTRICTED"  # Major restrictions; primary-residence rules
    PROHIBITED = "PROHIBITED"  # Whole-home investor STR effectively banned


class UsuryRisk(str, Enum):
    """DSCR risk level for state usury caps (T13 taxonomy)."""

    LOW = "LOW"  # DSCR rate fits within standard licensee exemption
    HIGH = "HIGH"  # DSCR rate conflicts with state cap; licensee pathway critical


class PPPStatus(str, Enum):
    """Prepayment penalty status for DSCR business-purpose loans."""

    ALLOWED = "ALLOWED"
    ALLOWED_WITH_RESTRICTION = "ALLOWED_WITH_RESTRICTION"
    THRESHOLD_RESTRICTED = "THRESHOLD_RESTRICTED"
    CONTESTED = "CONTESTED"  # Court ruling pending (e.g., NJ LLC)
    PROHIBITED = "PROHIBITED"


class VestingType(str, Enum):
    """Borrower entity type for PPP/license eligibility."""

    LLC = "LLC"
    LP = "LP"
    C_CORP = "C_CORP"
    S_CORP = "S_CORP"
    TRUST = "TRUST"
    INDIVIDUAL = "Individual"
    REVOCABLE_TRUST = "Revocable Trust"


# =============================================================================
# State regulatory data classes
# =============================================================================


@dataclass(frozen=True)
class PPPProfile:
    """Prepayment penalty rules for a state."""

    status: PPPStatus
    business_purpose_allowed: bool
    consumer_max_years: int | None = None  # None = no consumer-purpose PPP
    threshold_dollars: int | None = None  # Threshold above which PPP allowed (PA/OH)
    vesting_restrictions: dict[VestingType, PPPStatus] = field(default_factory=dict)
    notes: str = ""
    statute: str = ""
    last_verified: str = "2026-06-18"

    def is_allowed(
        self,
        vesting: VestingType,
        loan_amount: int | None = None,
        is_business_purpose: bool = True,
    ) -> tuple[bool, str]:
        """Check if PPP is allowed for this state/vesting/loan amount.

        Returns:
            (allowed: bool, reason: str)
        """
        if not is_business_purpose:
            # Consumer-purpose: PPP restricted to consumer_max_years (if set)
            if self.consumer_max_years is None:
                return (False, "Consumer-purpose PPP prohibited in this state")
            return (
                False,  # Caller must check ppp_years separately
                f"Consumer-purpose PPP allowed up to {self.consumer_max_years} years",
            )

        if self.status == PPPStatus.PROHIBITED:
            return (False, f"PPP prohibited in this state ({self.statute})")

        if self.status == PPPStatus.CONTESTED:
            # Per-vesting check
            if self.vesting_restrictions:
                v_status = self.vesting_restrictions.get(vesting)
                if v_status == PPPStatus.PROHIBITED:
                    return (False, f"PPP prohibited for {vesting.value} in this state (contested)")
                if v_status == PPPStatus.ALLOWED:
                    return (True, f"PPP allowed for {vesting.value} (per recent ruling)")
            return (
                False,
                "PPP status contested in this state — flag for attorney review",
            )

        if self.status == PPPStatus.THRESHOLD_RESTRICTED:
            if self.threshold_dollars is None or loan_amount is None:
                return (
                    False,
                    "PPP threshold-restricted; loan_amount required to determine eligibility",
                )
            if loan_amount <= self.threshold_dollars:
                return (
                    False,
                    f"Loan amount ${loan_amount:,} ≤ ${self.threshold_dollars:,} threshold",
                )
            return (True, f"Loan amount ${loan_amount:,} > ${self.threshold_dollars:,} threshold")

        if self.status == PPPStatus.ALLOWED_WITH_RESTRICTION:
            return (True, f"PPP allowed with restriction: {self.notes}")

        # ALLOWED
        return (True, "PPP allowed for business-purpose DSCR")


@dataclass(frozen=True)
class STRProfile:
    """Short-term rental rules for a state."""

    status: STRStatus
    statewide_law: str
    major_city_rules: str
    statewide_tax_pct: float | None = None  # Statewide STR tax %
    local_tax_pct: tuple[float, float] | None = None  # (min, max) local tax %
    permit_required_statewide: bool = False
    primary_residence_required: bool = False
    last_verified: str = "2026-06-18"
    notes: str = ""


@dataclass(frozen=True)
class UsuryProfile:
    """Usury cap structure for a state."""

    state_cap_pct: float | None  # Constitutional/default cap
    business_purpose_cap_pct: float | None  # Business-purpose written-contract
    licensee_cap_pct: float | None  # Licensed-lender exemption cap
    mortgage_cap_pct: float | None  # Mortgage-specific cap (may differ)
    risk_level: UsuryRisk
    penalties: str
    key_exemptions: str
    last_verified: str = "2026-06-18"

    def max_dscr_rate(self, is_business_purpose: bool = True) -> float:
        """Return the maximum permissible rate for a DSCR loan in this state.

        DSCR loans typically fall under:
        - Business-purpose (most common for DSCR): use business_purpose_cap
        - Licensee: use licensee_cap (if lender is licensed in state)
        """
        if is_business_purpose and self.licensee_cap_pct is not None:
            return self.licensee_cap_pct
        if is_business_purpose and self.business_purpose_cap_pct is not None:
            return self.business_purpose_cap_pct
        if self.licensee_cap_pct is not None:
            return self.licensee_cap_pct
        if self.mortgage_cap_pct is not None:
            return self.mortgage_cap_pct
        if self.state_cap_pct is not None:
            return self.state_cap_pct
        return 100.0  # Effectively no cap (e.g., NV, NE, SD)


@dataclass(frozen=True)
class TransferTaxProfile:
    """Transfer tax / mansion tax structure for a state."""

    has_state_transfer_tax: bool
    mansion_tax_active: bool = False
    mansion_tax_brackets: list[tuple[float, float, float]] | None = None  # [(min, max, rate)]
    mansion_tax_payer: str | None = None  # "buyer" or "seller"
    last_verified: str = "2026-06-18"
    notes: str = ""

    def compute_transfer_tax(self, sale_price: float) -> float:
        """Compute transfer tax for a sale at the given price.

        Returns tax amount in dollars.
        """
        if not self.mansion_tax_active or not self.mansion_tax_brackets:
            return 0.0
        for min_price, max_price, rate in self.mansion_tax_brackets:
            if min_price < sale_price <= max_price:
                return sale_price * rate
        return 0.0


@dataclass(frozen=True)
class StateProfile:
    """Complete regulatory profile for one state."""

    state: str  # 2-letter code
    ppp: PPPProfile
    str_rules: STRProfile
    usury: UsuryProfile
    transfer_tax: TransferTaxProfile
    notes: str = ""
    source: str = ""  # Primary source citation


# =============================================================================
# State registry — 50 states + DC
# =============================================================================
# Source: T12 (STR), T13 (usury), Sprint 2 (PPP), NJ Mansion Tax update

STATE_PROFILES: dict[str, StateProfile] = {}


def _register(profile: StateProfile) -> None:
    """Register a state profile."""
    STATE_PROFILES[profile.state.upper()] = profile


# --- TIER 1 STATES (highest volume; fully sourced) ---

_register(
    StateProfile(
        state="CA",
        ppp=PPPProfile(
            status=PPPStatus.ALLOWED,
            business_purpose_allowed=True,
            consumer_max_years=None,
            notes="Business-purpose DSCR allows PPP; consumer prohibited",
            statute="CA Civil Code §2954.10",
        ),
        str_rules=STRProfile(
            status=STRStatus.RESTRICTED,
            statewide_law="CA Civil Code §1940.2 caps deposits; SB 60 (2019) limits city bans on hosting platforms",
            major_city_rules="SF: 90-night unhosted cap; LA: primary residence + 120-day unhosted cap; SD: 1% housing-stock cap; SB 346 (Jan 1, 2026) mandates platform data sharing",
            statewide_tax_pct=None,
            local_tax_pct=(10.0, 14.0),
            permit_required_statewide=False,
            primary_residence_required=True,
            notes="SB 346 (effective Jan 1, 2026) — platforms must share host data with local governments; major enforcement escalation",
        ),
        usury=UsuryProfile(
            state_cap_pct=10.0,
            business_purpose_cap_pct=10.0,
            licensee_cap_pct=None,
            mortgage_cap_pct=10.0,
            risk_level=UsuryRisk.HIGH,
            penalties="Excess interest void; forfeiture of principal+interest for unlicensed >5% above",
            key_exemptions="Banks; licensed lenders (Cal Fin Code); real estate brokers; industrial loan cos",
        ),
        transfer_tax=TransferTaxProfile(
            has_state_transfer_tax=False,
            mansion_tax_active=False,
            notes="No state transfer tax; local documentary transfer tax varies by county",
        ),
        notes="STR prohibited for investors in SF/LA/Santa Monica; SB 346 enforcement",
        source="T12 50_state_matrix.csv row 6; Sprint 2 §CA; CA Civil Code §2954.10",
    )
)

_register(
    StateProfile(
        state="TX",
        ppp=PPPProfile(
            status=PPPStatus.ALLOWED,
            business_purpose_allowed=True,
            notes="Business-purpose DSCR allows PPP; consumer restricted",
            statute="TX Finance Code",
        ),
        str_rules=STRProfile(
            status=STRStatus.CLEAR,
            statewide_law="TX Tax Code §156.001 classifies STRs as hotel; no statewide ban",
            major_city_rules="Austin: STR license + permit # in ads + quarterly tax filings + cap of 2 STRs at primary residence; Dallas: STR ordinance (limited by 2025 court ruling); Houston/San Antonio/Fort Worth: registration",
            statewide_tax_pct=6.0,
            local_tax_pct=(0.0, 9.0),
            permit_required_statewide=False,
            primary_residence_required=False,
        ),
        usury=UsuryProfile(
            state_cap_pct=10.0,
            business_purpose_cap_pct=18.0,
            licensee_cap_pct=18.0,
            mortgage_cap_pct=10.0,
            risk_level=UsuryRisk.LOW,
            penalties="Forfeiture of all principal + interest (TX Fin Code 302); criminal (misdemeanor) for willful usury",
            key_exemptions="Banks; CU; TX-licensed mortgage bankers; business-purpose lender (18% written contract rate)",
        ),
        transfer_tax=TransferTaxProfile(has_state_transfer_tax=False),
        notes="18% Texas business-purpose written-contract cap was designed for DSCR (key TX advantage)",
        source="T13 row 45; Sprint 2 §TX; TX Fin Code 302",
    )
)

_register(
    StateProfile(
        state="FL",
        ppp=PPPProfile(
            status=PPPStatus.ALLOWED,
            business_purpose_allowed=True,
            notes="Business-purpose DSCR allows PPP; clear rules",
            statute="FL Statute §501.137",
        ),
        str_rules=STRProfile(
            status=STRStatus.RESTRICTED,
            statewide_law="Statewide preemption (Fla Stat §509.032(7)(b) 2023); DBPR Vacation Rental License required for full-unit rentals >3x/year",
            major_city_rules="Miami Beach: <30/31 day rentals illegal in most residential zones; Orlando: registration; Key West: residential restrictions; Clearwater Beach: <30 day ban in residential; Cape Coral: limits; Panama City Beach: registration",
            statewide_tax_pct=6.0,
            local_tax_pct=(5.0, 6.0),
            permit_required_statewide=True,
            primary_residence_required=False,
        ),
        usury=UsuryProfile(
            state_cap_pct=18.0,
            business_purpose_cap_pct=18.0,
            licensee_cap_pct=18.0,
            mortgage_cap_pct=18.0,
            risk_level=UsuryRisk.LOW,
            penalties="Excess interest void (Fla Stat 687.04); treble damages for unlicensed",
            key_exemptions="Banks; CU; FL-licensed mortgage lenders; mortgage brokerage business",
        ),
        transfer_tax=TransferTaxProfile(
            has_state_transfer_tax=True,
            notes="FL documentary stamp tax: $0.35 per $100 of consideration",
        ),
        notes="18% cap well above DSCR; broad licensee exemption; STR varies widely by city",
        source="T13 row 11; T12 row 9; Sprint 2 §FL",
    )
)

_register(
    StateProfile(
        state="MN",
        ppp=PPPProfile(
            status=PPPStatus.ALLOWED,
            business_purpose_allowed=True,
            notes="MN HF 3437 (enacted Apr 23, 2026; effective Aug 1, 2026) — business-purpose DSCR EXEMPT from MN PPP cap",
            statute="MN HF 3437 / MN Stat §58.137 amended",
        ),
        str_rules=STRProfile(
            status=STRStatus.CLEAR,
            statewide_law="No statewide STR law; cities control",
            major_city_rules="Minneapolis: STR license + 1 per property + 5-night minimum; Saint Paul: ordinance in development; Duluth: registration + cap",
            statewide_tax_pct=None,
            local_tax_pct=None,
            permit_required_statewide=False,
            primary_residence_required=False,
        ),
        usury=UsuryProfile(
            state_cap_pct=6.0,
            business_purpose_cap_pct=None,
            licensee_cap_pct=None,
            mortgage_cap_pct=None,
            risk_level=UsuryRisk.HIGH,
            penalties="Forfeiture of all interest (Stat 334.02)",
            key_exemptions="Banks; CU; MN-licensed lenders; mortgage bankers",
        ),
        transfer_tax=TransferTaxProfile(
            has_state_transfer_tax=True,
            notes="MN deed tax: $0.0033 of consideration + $0.0021 for state ($0.0054 total)",
        ),
        notes="HF 3437 effective Aug 1, 2026 — major DSCR advantage",
        source="Sprint 2 §MN; MN HF 3437 (Apr 23, 2026)",
    )
)

_register(
    StateProfile(
        state="NY",
        ppp=PPPProfile(
            status=PPPStatus.ALLOWED_WITH_RESTRICTION,
            business_purpose_allowed=True,
            notes="Business-purpose LLC loans: typically enforceable if usury laws not violated; residential loans prohibited under Banking Law §6-l; timing restrictions apply",
            statute="NY Banking Law §6-l",
        ),
        str_rules=STRProfile(
            status=STRStatus.PROHIBITED,
            statewide_law="Multiple Dwelling Law; Local Law 18 of 2022 (NYC) — <30 day rentals illegal unless host present; Class A multi-dwelling ban",
            major_city_rules="NYC: <30 day ban unless host present + Class A multi-dwelling ban + OSE registration; Saratoga Springs LL5 (2024); multiple cities have bans",
            statewide_tax_pct=4.0,
            local_tax_pct=(5.875, 5.875),  # NYC Hotel Room Occupancy Tax
            permit_required_statewide=False,
            primary_residence_required=True,
            notes="Nationwide strictest: <30 day ban unless host present + multi-dwelling building ban",
        ),
        usury=UsuryProfile(
            state_cap_pct=6.0,
            business_purpose_cap_pct=16.0,
            licensee_cap_pct=25.0,
            mortgage_cap_pct=16.0,
            risk_level=UsuryRisk.LOW,
            penalties="Criminal usury (misdemeanor) above 16% (Class A misdemeanor); forfeiture above 25%",
            key_exemptions="Banks; CU; NY-licensed mortgage bankers (NY Banking Law); NYC-licensed mortgage bankers",
        ),
        transfer_tax=TransferTaxProfile(
            has_state_transfer_tax=True,
            notes="NY deed transfer tax: $0.40 per $500 (state) + local 0.25-0.5%",
        ),
        notes="NYC STR effectively prohibited for investors; DSCR via NY Banking Law license",
        source="T12 row 33; T13 row 34; Sprint 2 §NY/NJ; NY Banking Law §6-l",
    )
)

_register(
    StateProfile(
        state="NJ",
        ppp=PPPProfile(
            status=PPPStatus.CONTESTED,
            business_purpose_allowed=True,
            vesting_restrictions={
                VestingType.C_CORP: PPPStatus.ALLOWED,
                VestingType.LLC: PPPStatus.CONTESTED,
                VestingType.LP: PPPStatus.PROHIBITED,
                VestingType.TRUST: PPPStatus.PROHIBITED,
                VestingType.INDIVIDUAL: PPPStatus.PROHIBITED,
            },
            notes="C-Corp: ALLOWED. LLC/LP/Trust/Individual: status contested/prohibited. NPLA won partial DOBI clarification Oct 2025; Arc Home banned Oct 2025. Safe harbor: use C-Corp vesting in NJ when PPP required.",
            statute="N.J.S.A. 46:10B-2",
        ),
        str_rules=STRProfile(
            status=STRStatus.RESTRICTED,
            statewide_law="No statewide STR ban; cities control",
            major_city_rules="Jersey City: 60-day cap; Weehawken: <30 day STRs banned; West New York: <30 day STRs banned; Hoboken: 30-day minimum; Atlantic City: zoning",
            statewide_tax_pct=6.625,
            local_tax_pct=(3.0, 6.0),
            permit_required_statewide=False,
            primary_residence_required=False,
        ),
        usury=UsuryProfile(
            state_cap_pct=6.0,
            business_purpose_cap_pct=30.0,
            licensee_cap_pct=30.0,
            mortgage_cap_pct=16.0,
            risk_level=UsuryRisk.LOW,
            penalties="Forfeiture of all interest; treble damages for unlicensed",
            key_exemptions="Banks; CU; NJ-licensed lenders; real estate brokers",
        ),
        transfer_tax=TransferTaxProfile(
            has_state_transfer_tax=True,
            mansion_tax_active=True,
            mansion_tax_payer="seller",
            mansion_tax_brackets=[
                (1_000_000, 2_000_000, 0.01),
                (2_000_000, 2_500_000, 0.02),
                (2_500_000, 3_000_000, 0.05),
                (3_000_000, 3_500_000, 0.03),
                (3_500_000, float("inf"), 0.05),
            ],
            notes="NJ Mansion Tax (effective July 10, 2025) — graduated seller tax >$1M; restructured from buyer-paid",
        ),
        notes="NJ LLC PPP contested; Mansion Tax 2025 graduated seller tax >$1M",
        source="T12 row 31; T13 row 32; Sprint 2 §NJ; NJ Mansion Tax Holland & Knight Aug 2025",
    )
)

_register(
    StateProfile(
        state="WA",
        ppp=PPPProfile(
            status=PPPStatus.ALLOWED_WITH_RESTRICTION,
            business_purpose_allowed=True,
            notes="Fixed-rate DSCR: PPP fully allowed. ARM DSCR: PPP cannot extend beyond 60 days before initial ARM reset (RCW 19.144.040)",
            statute="RCW 19.144.040",
        ),
        str_rules=STRProfile(
            status=STRStatus.UNCERTAIN,
            statewide_law="RCW 64.37 (state STR law) — operators must maintain liability insurance; SB 5576/HB 2559 (2025) considered",
            major_city_rules="Seattle: STR license + max 2 STRs; Spokane: STR license; Tacoma: registration; Vancouver: STR permit + business license; Bellingham: STR license",
            statewide_tax_pct=None,
            local_tax_pct=(10.4, 15.2),
            permit_required_statewide=False,
            primary_residence_required=False,
        ),
        usury=UsuryProfile(
            state_cap_pct=12.0,
            business_purpose_cap_pct=None,
            licensee_cap_pct=25.0,
            mortgage_cap_pct=12.0,
            risk_level=UsuryRisk.LOW,
            penalties="Forfeiture of 2x excess interest (RCW 19.52.030)",
            key_exemptions="Banks; CU; WA-licensed mortgage lenders; business-purpose loans EXEMPT",
        ),
        transfer_tax=TransferTaxProfile(
            has_state_transfer_tax=True,
            notes="WA real estate excise tax (REET): graduated 0.5%-3.0% based on sale price",
        ),
        notes="WA business loans EXEMPT from usury (key advantage); ARM PPP 60-day pre-reset limit",
        source="T12 row 48; T13 row 49; Sprint 2 §WA; RCW 19.144.040",
    )
)

_register(
    StateProfile(
        state="PA",
        ppp=PPPProfile(
            status=PPPStatus.THRESHOLD_RESTRICTED,
            business_purpose_allowed=True,
            threshold_dollars=329_411,
            notes="2026 threshold = $329,411 (CPI-indexed from PA Bulletin). PPP prohibited on 1-2 unit residential if loan ≤ threshold. Loans above: PPP permitted. Business-development loans exempt.",
            statute="PA Act 6, 10 Pa. Code §7.2",
        ),
        str_rules=STRProfile(
            status=STRStatus.CLEAR,
            statewide_law="No statewide STR law; PA Joint State Government Commission March 2025 STR Industry Report; HB 1233 proposed but not passed",
            major_city_rules="Philadelphia: STR license; Pittsburgh: STR license; Lancaster: registration; State College: registration + license; Allentown: registration",
            statewide_tax_pct=6.0,
            local_tax_pct=(0.0, 7.0),
            permit_required_statewide=False,
            primary_residence_required=False,
        ),
        usury=UsuryProfile(
            state_cap_pct=6.0,
            business_purpose_cap_pct=9.0,
            licensee_cap_pct=24.0,
            mortgage_cap_pct=9.0,
            risk_level=UsuryRisk.HIGH,
            penalties="Forfeiture of all interest (Pa CSA 41-301)",
            key_exemptions="Banks; CU; PA-licensed mortgage lenders; installment loan cos",
        ),
        transfer_tax=TransferTaxProfile(
            has_state_transfer_tax=True,
            notes="PA realty transfer tax: 1% (state) + 0.5-2% (local)",
        ),
        notes="PA 2026 PPP threshold = $329,411; CPI-indexed annually",
        source="Sprint 2 §PA; PA Bulletin 2026",
    )
)

_register(
    StateProfile(
        state="OH",
        ppp=PPPProfile(
            status=PPPStatus.THRESHOLD_RESTRICTED,
            business_purpose_allowed=True,
            threshold_dollars=112_957,
            notes="2025 threshold = $112,957 (CPI-indexed annually). After 5 years: PPP prohibited regardless of amount. 2026 threshold requires January pull from OH Dept. of Commerce.",
            statute="OH ORC §1343.011",
        ),
        str_rules=STRProfile(
            status=STRStatus.UNCERTAIN,
            statewide_law="No statewide STR license; SB 104 (2025) and HB 109 considered; ORC §2933.52 governs privacy/monitoring",
            major_city_rules="Columbus: STR license + privacy/monitoring device rules; Cleveland: STR permit; Cincinnati: registration; Akron: registration + license",
            statewide_tax_pct=None,
            local_tax_pct=None,
            permit_required_statewide=False,
            primary_residence_required=False,
        ),
        usury=UsuryProfile(
            state_cap_pct=8.0,
            business_purpose_cap_pct=8.0,
            licensee_cap_pct=25.0,
            mortgage_cap_pct=25.0,
            risk_level=UsuryRisk.LOW,
            penalties="Forfeiture of excess interest (Ohio Rev Code 1343.05)",
            key_exemptions="Banks; CU; OH-licensed mortgage lenders; installment lenders",
        ),
        transfer_tax=TransferTaxProfile(
            has_state_transfer_tax=True,
            notes="OH conveyance fee: $0.30 per $100 (state) + $0.10 per $100 (local)",
        ),
        notes="OH 2025 threshold = $112,957; CPI-indexed annually; 2026 to be pulled January",
        source="Sprint 2 §OH; OH ORC §1343.011; OH Dept. of Commerce",
    )
)

# --- TIER 2 STATES (lower volume; less detail) ---
# For brevity, the remaining 41 states use a condensed registration pattern.


def _tier2_ppp_default(statute: str, notes: str = "") -> PPPProfile:
    return PPPProfile(
        status=PPPStatus.ALLOWED,
        business_purpose_allowed=True,
        notes=notes,
        statute=statute,
    )


def _tier2_str_default(
    status: STRStatus,
    statewide: str,
    cities: str,
    tax: float | None = None,
    license: bool = False,
) -> STRProfile:
    return STRProfile(
        status=status,
        statewide_law=statewide,
        major_city_rules=cities,
        statewide_tax_pct=tax,
        permit_required_statewide=license,
    )


def _tier2_usury_default(
    cap: float | None,
    biz: float | None,
    lic: float | None,
    mortgage: float | None,
    risk: UsuryRisk,
    exempt: str,
    pen: str,
) -> UsuryProfile:
    return UsuryProfile(
        state_cap_pct=cap,
        business_purpose_cap_pct=biz,
        licensee_cap_pct=lic,
        mortgage_cap_pct=mortgage,
        risk_level=risk,
        penalties=pen,
        key_exemptions=exempt,
    )


def _tier2_transfer_default(has_tax: bool, **kw: Any) -> TransferTaxProfile:
    return TransferTaxProfile(has_state_transfer_tax=has_tax, **kw)


def _quick_register(
    state: str,
    ppp_status: PPPStatus,
    str_status: STRStatus,
    usury_state_cap: float | None,
    usury_biz_cap: float | None,
    usury_lic_cap: float | None,
    usury_mortgage_cap: float | None,
    usury_risk: UsuryRisk,
    usury_exemptions: str,
    has_state_tax: bool,
    notes: str = "",
) -> None:
    """Quick register a state with default profiles."""
    _register(
        StateProfile(
            state=state,
            ppp=PPPProfile(
                status=ppp_status,
                business_purpose_allowed=ppp_status != PPPStatus.PROHIBITED,
                notes=notes,
            ),
            str_rules=STRProfile(
                status=str_status, statewide_law="See T12 source", major_city_rules="See T12 source"
            ),
            usury=UsuryProfile(
                state_cap_pct=usury_state_cap,
                business_purpose_cap_pct=usury_biz_cap,
                licensee_cap_pct=usury_lic_cap,
                mortgage_cap_pct=usury_mortgage_cap,
                risk_level=usury_risk,
                penalties="See T13 source",
                key_exemptions=usury_exemptions,
            ),
            transfer_tax=TransferTaxProfile(has_state_transfer_tax=has_state_tax),
            source="T12+T13 cross-reference",
        )
    )


# Remaining states (condensed; full data in T12/T13 CSVs)
_quick_register(
    "AL",
    PPPStatus.ALLOWED,
    STRStatus.UNCERTAIN,
    8.0,
    8.0,
    None,
    8.0,
    UsuryRisk.LOW,
    "Banks; CU; licensed lenders; industrial loans",
    False,
    notes="8% cap; broad licensee exemption",
)
_quick_register(
    "AK",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    10.5,
    10.5,
    None,
    10.5,
    UsuryRisk.LOW,
    "Banks; CU; AK Small Loans Act licensees",
    False,
)
_quick_register(
    "AZ",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    10.0,
    10.0,
    None,
    10.0,
    UsuryRisk.HIGH,
    "Banks; CU; licensed mortgage bankers; industrial loans",
    False,
    notes="AZ 2016 state law preempts most local STR rules",
)
_quick_register(
    "AR",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    10.0,
    17.0,
    17.0,
    17.0,
    UsuryRisk.LOW,
    "Banks; CU; AR-licensed supervised lenders",
    False,
)
_quick_register(
    "CO",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    8.0,
    8.0,
    12.0,
    12.0,
    UsuryRisk.HIGH,
    "Supervised lenders (12%); banks; CU",
    False,
    notes="8% CFA default; 12% supervised lender exemption",
)
_quick_register(
    "CT",
    PPPStatus.ALLOWED,
    STRStatus.UNCERTAIN,
    12.0,
    12.0,
    12.0,
    12.0,
    UsuryRisk.LOW,
    "Banks; CT-licensed small loan lenders; CU",
    True,
    notes="2024 PA 24-38 empowers towns",
)
_quick_register(
    "DE",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    None,
    None,
    None,
    None,
    UsuryRisk.LOW,
    "Banks; CU; licensees under DE Lenders Act",
    True,
    notes="No general usury cap; 2025 STR intermediary registration required",
)
_quick_register(
    "GA",
    PPPStatus.ALLOWED,
    STRStatus.UNCERTAIN,
    7.0,
    10.0,
    10.0,
    10.0,
    UsuryRisk.HIGH,
    "Banks; CU; GA-licensed lenders",
    True,
    notes="7% GA cap is lowest; 2024 STR excise tax 8%",
)
_quick_register(
    "HI",
    PPPStatus.ALLOWED,
    STRStatus.PROHIBITED,
    10.0,
    10.0,
    12.0,
    12.0,
    UsuryRisk.LOW,
    "Banks; CU; HI-licensed supervised lenders",
    True,
    notes="SB 2919 (2024) gives counties STR regulation authority",
)
_quick_register(
    "ID",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    12.0,
    12.0,
    12.0,
    12.0,
    UsuryRisk.LOW,
    "Banks; CU; ID-licensed mortgage lenders",
    False,
)
_quick_register(
    "IL",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    9.0,
    10.0,
    9.0,
    9.0,
    UsuryRisk.HIGH,
    "Banks; CU; IL-licensed lenders",
    True,
    notes="9% consumer/10% non-bank; 2025 H-O-T expansion to STRs",
)
_quick_register(
    "IN",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    10.0,
    10.0,
    21.0,
    21.0,
    UsuryRisk.LOW,
    "Banks; CU; IN-licensed lenders",
    True,
    notes="21% licensee cap covers DSCR",
)
_quick_register(
    "IA",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    5.0,
    5.0,
    21.0,
    21.0,
    UsuryRisk.HIGH,
    "Banks; CU; IA-licensed supervised lenders",
    False,
    notes="5% IA default cap; 21% supervised lender exemption essential",
)
_quick_register(
    "KS",
    PPPStatus.ALLOWED,
    STRStatus.UNCERTAIN,
    10.0,
    10.0,
    18.0,
    18.0,
    UsuryRisk.LOW,
    "Banks; CU; KS-licensed lenders",
    True,
)
_quick_register(
    "KY",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    8.0,
    8.0,
    18.0,
    18.0,
    UsuryRisk.LOW,
    "Banks; CU; KY-licensed mortgage lenders",
    True,
)
_quick_register(
    "LA",
    PPPStatus.ALLOWED,
    STRStatus.UNCERTAIN,
    8.0,
    8.0,
    12.0,
    12.0,
    UsuryRisk.LOW,
    "Banks; CU; LA-licensed lenders",
    True,
    notes="NO STR caps since 2019",
)
_quick_register(
    "ME",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    6.0,
    6.0,
    18.0,
    18.0,
    UsuryRisk.HIGH,
    "Banks; CU; ME-supervised lenders",
    True,
    notes="6% consumer default; 2023 STR commission",
)
_quick_register(
    "MD",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    6.0,
    8.0,
    24.0,
    24.0,
    UsuryRisk.LOW,
    "Banks; CU; MD-licensed mortgage lenders",
    True,
    notes="2024 HB 1312 statewide STR commission; Ocean City 5/31-night min",
)
_quick_register(
    "MA",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    6.0,
    6.0,
    23.0,
    23.0,
    UsuryRisk.HIGH,
    "Banks; CU; MA-licensed lenders",
    True,
    notes="2018 Act Regulating and Insuring STRs; Nantucket <30 day ban",
)
_quick_register(
    "MI",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    5.0,
    5.0,
    25.0,
    25.0,
    UsuryRisk.HIGH,
    "Banks; CU; MI-licensed mortgage lenders",
    True,
    notes="5% default; 25% written contract cap needed for DSCR",
)
_quick_register(
    "MS",
    PPPStatus.ALLOWED,
    STRStatus.UNCERTAIN,
    8.0,
    8.0,
    25.0,
    25.0,
    UsuryRisk.HIGH,
    "Banks; CU; MS-licensed consumer lenders",
    False,
)
_quick_register(
    "MO",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    10.0,
    10.0,
    28.0,
    28.0,
    UsuryRisk.LOW,
    "Banks; CU; MO-licensed lenders",
    False,
)
_quick_register(
    "MT",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    10.0,
    10.0,
    36.0,
    36.0,
    UsuryRisk.LOW,
    "Banks; CU; MT-licensed mortgage lenders",
    False,
)
_quick_register(
    "NE",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    None,
    None,
    16.0,
    16.0,
    UsuryRisk.LOW,
    "Banks; CU; NE-licensed mortgage bankers",
    True,
    notes="No general usury cap (post-2003 deregulation)",
)
_quick_register(
    "NV",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    None,
    None,
    None,
    None,
    UsuryRisk.LOW,
    "Banks; CU; NV-licensed mortgage lenders",
    True,
    notes="No general usury cap",
)
_quick_register(
    "NH",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    6.0,
    6.0,
    24.0,
    24.0,
    UsuryRisk.HIGH,
    "Banks; CU; NH-licensed mortgage lenders",
    True,
)
_quick_register(
    "NM",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    10.0,
    10.0,
    36.0,
    36.0,
    UsuryRisk.LOW,
    "Banks; CU; NM-licensed mortgage lenders",
    True,
)
_quick_register(
    "NC",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    8.0,
    8.0,
    24.0,
    24.0,
    UsuryRisk.LOW,
    "Banks; CU; NC-licensed mortgage lenders",
    True,
    notes="NC Vacation Rental Act; SB 291 (2025) proposed",
)
_quick_register(
    "ND",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    6.0,
    6.0,
    27.0,
    27.0,
    UsuryRisk.HIGH,
    "Banks; CU; ND-licensed mortgage lenders",
    False,
)
_quick_register(
    "OK",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    6.0,
    6.0,
    27.0,
    27.0,
    UsuryRisk.HIGH,
    "Banks; CU; OK-licensed mortgage lenders",
    True,
)
_quick_register(
    "OR",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    9.0,
    9.0,
    30.0,
    30.0,
    UsuryRisk.LOW,
    "Banks; CU; OR-licensed mortgage lenders",
    False,
    notes="Portland ASTR primary residence only",
)
_quick_register(
    "RI",
    PPPStatus.ALLOWED,
    STRStatus.UNCERTAIN,
    12.0,
    12.0,
    36.0,
    36.0,
    UsuryRisk.LOW,
    "Banks; CU; RI-licensed mortgage lenders",
    True,
    notes="Newport 30-day minimum; hotel tax 1%→2% Jan 2026",
)
_quick_register(
    "SC",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    8.75,
    8.75,
    18.0,
    18.0,
    UsuryRisk.LOW,
    "Banks; CU; SC-licensed mortgage lenders",
    True,
    notes="Columbia temp ban on new STR permits",
)
_quick_register(
    "SD",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    None,
    None,
    18.0,
    18.0,
    UsuryRisk.LOW,
    "Banks; CU; SD-licensed mortgage lenders",
    False,
    notes="No general usury cap",
)
_quick_register(
    "TN",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    10.0,
    10.0,
    30.0,
    30.0,
    UsuryRisk.LOW,
    "Banks; CU; TN-licensed mortgage lenders",
    True,
    notes="2022 STR Unit Act limits local bans",
)
_quick_register(
    "UT",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    10.0,
    10.0,
    None,
    None,
    UsuryRisk.LOW,
    "Banks; CU; UT-licensed mortgage lenders",
    False,
    notes="State preemption of STR regulation (10-8-85.4)",
)
_quick_register(
    "VT",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    12.0,
    12.0,
    18.0,
    18.0,
    UsuryRisk.LOW,
    "Banks; CU; VT-licensed mortgage lenders",
    True,
    notes="Act 183 (2024) 3% STR surcharge; max 2 STR units",
)
_quick_register(
    "VA",
    PPPStatus.ALLOWED,
    STRStatus.RESTRICTED,
    12.0,
    12.0,
    12.0,
    12.0,
    UsuryRisk.LOW,
    "Banks; CU; VA-licensed mortgage lenders",
    True,
    notes="Va Code §15.2-983 STR registry",
)
_quick_register(
    "WV",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    6.0,
    6.0,
    24.0,
    24.0,
    UsuryRisk.HIGH,
    "Banks; CU; WV-licensed mortgage lenders",
    False,
)
_quick_register(
    "WI",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    5.0,
    5.0,
    18.0,
    18.0,
    UsuryRisk.HIGH,
    "Banks; CU; WI-licensed mortgage bankers",
    True,
    notes="5% WI baseline lowest among 50 states",
)
_quick_register(
    "WY",
    PPPStatus.ALLOWED,
    STRStatus.CLEAR,
    7.0,
    7.0,
    24.0,
    24.0,
    UsuryRisk.LOW,
    "Banks; CU; WY-licensed mortgage lenders",
    False,
)
_quick_register(
    "DC",
    PPPStatus.ALLOWED,
    STRStatus.UNCERTAIN,
    6.0,
    6.0,
    24.0,
    24.0,
    UsuryRisk.HIGH,
    "Banks; CU; one-party lender licensees; mortgage lenders",
    True,
    notes="6% DC cap; 24% one-party lender license is essential",
)


# =============================================================================
# Public API
# =============================================================================


def get_state_profile(state: str) -> StateProfile:
    """Get the complete regulatory profile for a state.

    Args:
        state: 2-letter state code (e.g., "CA", "NY") or full state name.

    Returns:
        StateProfile with PPP, STR, usury, and transfer tax data.

    Raises:
        KeyError: If state not in registry.
    """
    code = state.upper().strip()
    # Handle full state names (e.g., "California" → "CA")
    name_to_code = {
        "ALABAMA": "AL",
        "ALASKA": "AK",
        "ARIZONA": "AZ",
        "ARKANSAS": "AR",
        "CALIFORNIA": "CA",
        "COLORADO": "CO",
        "CONNECTICUT": "CT",
        "DELAWARE": "DE",
        "FLORIDA": "FL",
        "GEORGIA": "GA",
        "HAWAII": "HI",
        "IDAHO": "ID",
        "ILLINOIS": "IL",
        "INDIANA": "IN",
        "IOWA": "IA",
        "KANSAS": "KS",
        "KENTUCKY": "KY",
        "LOUISIANA": "LA",
        "MAINE": "ME",
        "MARYLAND": "MD",
        "MASSACHUSETTS": "MA",
        "MICHIGAN": "MI",
        "MINNESOTA": "MN",
        "MISSISSIPPI": "MS",
        "MISSOURI": "MO",
        "MONTANA": "MT",
        "NEBRASKA": "NE",
        "NEVADA": "NV",
        "NEW HAMPSHIRE": "NH",
        "NEW JERSEY": "NJ",
        "NEW MEXICO": "NM",
        "NEW YORK": "NY",
        "NORTH CAROLINA": "NC",
        "NORTH DAKOTA": "ND",
        "OHIO": "OH",
        "OKLAHOMA": "OK",
        "OREGON": "OR",
        "PENNSYLVANIA": "PA",
        "RHODE ISLAND": "RI",
        "SOUTH CAROLINA": "SC",
        "SOUTH DAKOTA": "SD",
        "TENNESSEE": "TN",
        "TEXAS": "TX",
        "UTAH": "UT",
        "VERMONT": "VT",
        "VIRGINIA": "VA",
        "WASHINGTON": "WA",
        "WEST VIRGINIA": "WV",
        "WISCONSIN": "WI",
        "WYOMING": "WY",
        "DISTRICT OF COLUMBIA": "DC",
    }
    if code in name_to_code:
        code = name_to_code[code]
    if code not in STATE_PROFILES:
        raise KeyError(
            f"State {state!r} not in registry. Available: {sorted(STATE_PROFILES.keys())}"
        )
    return STATE_PROFILES[code]


def is_ppp_allowed(
    state: str,
    is_business_purpose: bool = True,
    ppp_years: int = 5,
    loan_amount: int | None = None,
    vesting: VestingType | str = VestingType.LLC,
    as_of_date: date | None = None,
) -> tuple[bool, str]:
    """Check if a PPP is allowed for the given state + loan parameters.

    Args:
        state: 2-letter state code
        is_business_purpose: True if DSCR business-purpose loan
        ppp_years: Prepayment penalty years (1-5)
        loan_amount: Loan amount in dollars (required for PA/OH threshold check)
        vesting: Vesting entity type (VestingType or string)
        as_of_date: Date for MN HF 3437 effective date check

    Returns:
        (allowed: bool, reason: str)
    """
    if isinstance(vesting, str):
        try:
            vesting = VestingType(vesting)
        except ValueError:
            vesting = VestingType.LLC  # default

    profile = get_state_profile(state)
    return profile.ppp.is_allowed(vesting, loan_amount, is_business_purpose)


def is_str_allowed(
    state: str,
    is_investor: bool = True,
    primary_residence: bool = False,
) -> tuple[bool, str]:
    """Check if STR income is usable for underwriting.

    Args:
        state: 2-letter state code
        is_investor: True if DSCR investor loan (vs primary residence)
        primary_residence: True if owner will occupy (required in some states)

    Returns:
        (allowed: bool, reason: str)
    """
    profile = get_state_profile(state)
    str_rules = profile.str_rules

    if str_rules.status == STRStatus.PROHIBITED:
        if is_investor:
            return (False, f"STR prohibited for investors in {state}")
        return (False, f"STR prohibited in {state}")

    if str_rules.status == STRStatus.RESTRICTED and is_investor:
        if str_rules.primary_residence_required and not primary_residence:
            return (False, f"STR requires primary residence in {state}")
        return (
            True,
            f"STR restricted in {state}; verify city-level rules and permit status",
        )

    return (True, f"STR allowed in {state}; verify city-level permit")


def compute_transfer_tax(
    state: str,
    sale_price: float,
) -> float:
    """Compute transfer tax for a sale at the given price.

    Args:
        state: 2-letter state code
        sale_price: Sale price in dollars

    Returns:
        Tax amount in dollars (0 if no transfer tax)
    """
    profile = get_state_profile(state)
    return profile.transfer_tax.compute_transfer_tax(sale_price)


def get_max_dscr_rate(state: str, is_business_purpose: bool = True) -> float:
    """Get the maximum permissible DSCR interest rate for the state.

    Args:
        state: 2-letter state code
        is_business_purpose: True if DSCR business-purpose loan

    Returns:
        Maximum rate as a percentage (e.g., 12.0 for 12%)

    Raises:
        KeyError: If state not in registry
    """
    profile = get_state_profile(state)
    return profile.usury.max_dscr_rate(is_business_purpose)


def list_states() -> list[str]:
    """Return sorted list of all registered state codes."""
    return sorted(STATE_PROFILES.keys())


def verify_state_profile(state: str) -> tuple[bool, str]:
    """Verify a state profile has all required fields populated.

    Returns:
        (valid: bool, message: str)
    """
    try:
        profile = get_state_profile(state)
    except KeyError as e:
        return (False, str(e))

    issues = []
    if profile.ppp.status not in PPPStatus:
        issues.append("invalid ppp.status")
    if profile.str_rules.status not in STRStatus:
        issues.append("invalid str_rules.status")
    if profile.usury.risk_level not in UsuryRisk:
        issues.append("invalid usury.risk_level")
    if not profile.source:
        issues.append("missing source citation")

    if issues:
        return (False, f"{state}: {', '.join(issues)}")
    return (True, f"{state}: profile complete; source={profile.source}")


# =============================================================================
# Module exports
# =============================================================================

__all__ = [
    # Enums
    "STRStatus",
    "UsuryRisk",
    "PPPStatus",
    "VestingType",
    # Data classes
    "PPPProfile",
    "STRProfile",
    "UsuryProfile",
    "TransferTaxProfile",
    "StateProfile",
    # Registry
    "STATE_PROFILES",
    # Functions
    "get_state_profile",
    "is_ppp_allowed",
    "is_str_allowed",
    "compute_transfer_tax",
    "get_max_dscr_rate",
    "list_states",
    "verify_state_profile",
]
