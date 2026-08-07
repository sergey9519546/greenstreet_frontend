"""
DSCR Sovereign OS – Lender Matrix Engine
=========================================
Versioned lender eligibility, ranking, and rate-lookup engine.
Each lender row carries a semantic version so the matrix can be
snapshot-ed, audited, and hot-reloaded without redeploy.
"""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field, asdict
from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

__all__ = [
    "STRSeasoning",
    "EntityType",
    "LenderProfile",
    "LenderMatrix",
    "DealProfile",
    "EligibilityResult",
    "check_eligibility",
    "rank_lenders_pareto",
    "lookup_rate_band",
    "apply_overlays",
    "get_matrix",
]

# ── Enums ────────────────────────────────────────────────────────────────

class STRSeasoning(str, Enum):
    """Short-Term Rental seasoning status."""
    YES = "yes"
    NO = "no"
    CONDITIONAL = "conditional"
    BROAD = "broadest"
    UNVERIFIED = "unverified"


class EntityType(str, Enum):
    INDIVIDUAL = "individual"
    LLC = "llc"
    CORP = "corp"
    TRUST = "trust"
    LP = "lp"


# ── Data classes ─────────────────────────────────────────────────────────

@dataclass
class RateBand:
    """Single cell in the FICO×LTV rate grid."""
    fico_min: int
    fico_max: int
    ltv_min: float
    ltv_max: float
    dscr_min: float
    rate: float          # note rate %
    ae_y: float          # annualised effective yield % (after adjustments)


@dataclass
class OverlayRule:
    """Lender-specific overlay that modifies eligibility or pricing."""
    name: str
    description: str
    min_loan_amount: Optional[float] = None
    max_loan_amount: Optional[float] = None
    str_seasoning_months: Optional[int] = None
    allowed_entity_types: Optional[List[EntityType]] = None
    rate_adjustment_bps: Optional[float] = None   # basis points
    ltv_adjustment: Optional[float] = None         # percentage points


@dataclass
class LenderProfile:
    """Single lender definition inside the matrix."""
    lender_id: str
    name: str
    dscr_min: float               # 0.0 means no-ratio / no minimum
    fico_min: int
    ltv_max: float                # e.g. 80.0 for 80 %
    str_seasoning: STRSeasoning
    active_states: List[str]      # empty list ⇒ all 50 states
    rate_bands: List[RateBand] = field(default_factory=list)
    overlays: List[OverlayRule] = field(default_factory=list)
    min_loan_amount: float = 75_000.0
    max_loan_amount: float = 5_000_000.0
    allowed_entity_types: List[EntityType] = field(
        default_factory=lambda: list(EntityType)
    )
    max_properties: Optional[int] = None
    version: str = "1.0.0"
    is_active: bool = True
    effective_date: Optional[date] = None

    # convenience
    @property
    def is_no_ratio(self) -> bool:
        return self.dscr_min == 0.0


# ── Deal profile (what the borrower brings) ──────────────────────────────

@dataclass
class DealProfile:
    fico: int
    ltv: float                  # e.g. 75.0
    dscr: float                 # e.g. 1.25
    loan_amount: float
    property_state: str
    entity_type: EntityType = EntityType.INDIVIDUAL
    is_str: bool = False
    str_seasoning_months: int = 0
    num_properties: int = 1


@dataclass
class EligibilityResult:
    lender: LenderProfile
    eligible: bool
    reasons: List[str] = field(default_factory=list)
    adjusted_ltv_max: Optional[float] = None
    rate: Optional[float] = None
    ae_y: Optional[float] = None


# ── PostgreSQL DDL ───────────────────────────────────────────────────────

POSTGRES_DDL = """
-- Lender matrix versioned schema
CREATE TABLE IF NOT EXISTS lender_matrix (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version         TEXT NOT NULL,
    effective_date  DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    description     TEXT
);

CREATE TABLE IF NOT EXISTS lender_profile (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id           UUID NOT NULL REFERENCES lender_matrix(id),
    lender_id           TEXT NOT NULL,
    name                TEXT NOT NULL,
    dscr_min            NUMERIC(4,2) NOT NULL DEFAULT 0.75,
    fico_min            SMALLINT NOT NULL DEFAULT 620,
    ltv_max             NUMERIC(5,2) NOT NULL DEFAULT 80.00,
    str_seasoning       TEXT NOT NULL DEFAULT 'yes',
    active_states       TEXT[] NOT NULL DEFAULT '{}',
    min_loan_amount     NUMERIC(12,2) NOT NULL DEFAULT 75000,
    max_loan_amount     NUMERIC(12,2) NOT NULL DEFAULT 5000000,
    allowed_entity_types TEXT[] NOT NULL DEFAULT '{individual,llc,corp,trust,lp}',
    max_properties      SMALLINT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    version             TEXT NOT NULL DEFAULT '1.0.0',
    effective_date      DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(matrix_id, lender_id)
);

CREATE TABLE IF NOT EXISTS lender_rate_band (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id       UUID NOT NULL REFERENCES lender_profile(id),
    fico_min        SMALLINT NOT NULL,
    fico_max        SMALLINT NOT NULL,
    ltv_min         NUMERIC(5,2) NOT NULL,
    ltv_max         NUMERIC(5,2) NOT NULL,
    dscr_min        NUMERIC(4,2) NOT NULL,
    rate            NUMERIC(5,3) NOT NULL,
    ae_y            NUMERIC(5,3) NOT NULL
);

CREATE TABLE IF NOT EXISTS lender_overlay (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id               UUID NOT NULL REFERENCES lender_profile(id),
    name                    TEXT NOT NULL,
    description             TEXT,
    min_loan_amount         NUMERIC(12,2),
    max_loan_amount         NUMERIC(12,2),
    str_seasoning_months    SMALLINT,
    allowed_entity_types    TEXT[],
    rate_adjustment_bps     NUMERIC(8,2),
    ltv_adjustment          NUMERIC(5,2)
);
"""


# ── Built-in rate bands (simplified grid) ────────────────────────────────

def _default_rate_bands(lender_name: str) -> List[RateBand]:
    """Generate a representative rate-bank for a lender."""
    bands: List[RateBand] = []
    # FICO tiers: 580-639, 640-679, 680-719, 720-759, 760+
    fico_tiers = [(580, 639), (640, 679), (680, 719), (720, 759), (760, 900)]
    # LTV tiers
    ltv_tiers = [(0, 60), (60.01, 70), (70.01, 75), (75.01, 80), (80.01, 90)]
    # Base rate depends on lender
    base = {
        "Griffin Funding": 7.25,
        "Angel Oak": 7.50,
        "Rocket Pro TPO": 7.00,
        "Deephaven": 7.375,
        "Kiavi": 7.75,
        "New Silver": 8.00,
        "Visio Lending": 7.125,
        "Lima One": 7.50,
        "Easy Street": 7.25,
        "Defy Mortgage": 7.625,
    }.get(lender_name, 7.50)

    for fi_lo, fi_hi in fico_tiers:
        for ltv_lo, ltv_hi in ltv_tiers:
            # Higher FICO/lower LTV ⇒ lower rate
            fico_adj = max(0, (720 - fi_lo) * 0.01)
            ltv_adj = max(0, (ltv_lo - 70) * 0.02)
            rate = round(base + fico_adj + ltv_adj, 3)
            ae_y = round(rate + 0.25, 3)   # AEY slightly above note rate
            bands.append(RateBand(
                fico_min=fi_lo, fico_max=fi_hi,
                ltv_min=ltv_lo, ltv_max=ltv_hi,
                dscr_min=0.75, rate=rate, ae_y=ae_y,
            ))
    return bands


# ── 10 Verified Lenders (June 2026) ─────────────────────────────────────

def _build_lenders() -> List[LenderProfile]:
    all_states = [  # 50 states + DC
        "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL",
        "GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
        "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
        "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI",
        "SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
    ]

    lender_defs = [
        {
            "lender_id": "griffin",
            "name": "Griffin Funding",
            "dscr_min": 0.75,
            "fico_min": 620,
            "ltv_max": 80.0,
            "str_seasoning": STRSeasoning.YES,
            "active_states": all_states,
            "min_loan_amount": 75_000,
            "max_loan_amount": 3_000_000,
        },
        {
            "lender_id": "angel_oak",
            "name": "Angel Oak",
            "dscr_min": 0.0,            # no-ratio
            "fico_min": 640,
            "ltv_max": 90.0,            # 740+ FICO tier
            "str_seasoning": STRSeasoning.YES,
            "active_states": all_states,
            "min_loan_amount": 75_000,
            "max_loan_amount": 5_000_000,
        },
        {
            "lender_id": "rocket_pro",
            "name": "Rocket Pro TPO",
            "dscr_min": 1.00,
            "fico_min": 660,
            "ltv_max": 80.0,
            "str_seasoning": STRSeasoning.YES,
            "active_states": all_states,
            "min_loan_amount": 100_000,
            "max_loan_amount": 3_000_000,
        },
        {
            "lender_id": "deephaven",
            "name": "Deephaven",
            "dscr_min": 0.75,
            "fico_min": 640,
            "ltv_max": 80.0,
            "str_seasoning": STRSeasoning.CONDITIONAL,
            "active_states": all_states,
            "min_loan_amount": 75_000,
            "max_loan_amount": 5_000_000,
            "overlays": [
                OverlayRule(
                    name="str_conditional",
                    description="STR requires 12-month reserves",
                    str_seasoning_months=12,
                )
            ],
        },
        {
            "lender_id": "kiavi",
            "name": "Kiavi",
            "dscr_min": 1.00,
            "fico_min": 660,
            "ltv_max": 80.0,
            "str_seasoning": STRSeasoning.UNVERIFIED,
            "active_states": all_states,
            "min_loan_amount": 75_000,
            "max_loan_amount": 3_000_000,
        },
        {
            "lender_id": "new_silver",
            "name": "New Silver",
            "dscr_min": 0.75,
            "fico_min": 580,
            "ltv_max": 80.0,
            "str_seasoning": STRSeasoning.YES,
            "active_states": all_states,
            "min_loan_amount": 100_000,
            "max_loan_amount": 3_000_000,
        },
        {
            "lender_id": "visio",
            "name": "Visio Lending",
            "dscr_min": 0.75,
            "fico_min": 680,
            "ltv_max": 80.0,
            "str_seasoning": STRSeasoning.BROAD,
            "active_states": all_states,
            "min_loan_amount": 75_000,
            "max_loan_amount": 5_000_000,
        },
        {
            "lender_id": "lima_one",
            "name": "Lima One",
            "dscr_min": 0.75,
            "fico_min": 660,
            "ltv_max": 80.0,
            "str_seasoning": STRSeasoning.YES,
            "active_states": all_states,
            "min_loan_amount": 75_000,
            "max_loan_amount": 5_000_000,
        },
        {
            "lender_id": "easy_street",
            "name": "Easy Street",
            "dscr_min": 1.00,
            "fico_min": 640,
            "ltv_max": 80.0,
            "str_seasoning": STRSeasoning.YES,
            "active_states": all_states,
            "min_loan_amount": 75_000,
            "max_loan_amount": 3_000_000,
            "overlays": [
                OverlayRule(
                    name="waive_str_seasoning",
                    description="Waives 12-month STR seasoning requirement",
                    str_seasoning_months=0,
                )
            ],
        },
        {
            "lender_id": "defy",
            "name": "Defy Mortgage",
            "dscr_min": 0.75,
            "fico_min": 640,
            "ltv_max": 85.0,            # 740 FICO tier
            "str_seasoning": STRSeasoning.YES,
            "active_states": all_states,
            "min_loan_amount": 75_000,
            "max_loan_amount": 5_000_000,
        },
    ]

    lenders: List[LenderProfile] = []
    for d in lender_defs:
        overlays = d.pop("overlays", [])
        lp = LenderProfile(**d)
        lp.rate_bands = _default_rate_bands(lp.name)
        lp.overlays = overlays
        lenders.append(lp)
    return lenders


# ── Lender Matrix (singleton) ───────────────────────────────────────────

class LenderMatrix:
    """Versioned collection of lender profiles with query methods."""

    def __init__(self, version: str = "2026.06.01"):
        self.version = version
        self.created_at: datetime = datetime.utcnow()
        self.matrix_id: str = str(uuid.uuid4())
        self._lenders: Dict[str, LenderProfile] = {}
        self._load_default_lenders()

    # ── persistence helpers ──────────────────────────────────────────
    def _load_default_lenders(self) -> None:
        for lp in _build_lenders():
            self._lenders[lp.lender_id] = lp

    @property
    def lenders(self) -> List[LenderProfile]:
        return [lp for lp in self._lenders.values() if lp.is_active]

    def get(self, lender_id: str) -> Optional[LenderProfile]:
        return self._lenders.get(lender_id)

    def upsert(self, lp: LenderProfile) -> None:
        self._lenders[lp.lender_id] = lp

    def deactivate(self, lender_id: str) -> None:
        lp = self._lenders.get(lender_id)
        if lp:
            lp.is_active = False

    # ── serialisation ────────────────────────────────────────────────
    def to_json(self) -> str:
        return json.dumps({
            "version": self.version,
            "matrix_id": self.matrix_id,
            "created_at": self.created_at.isoformat(),
            "lenders": [asdict(lp) for lp in self.lenders],
        }, default=str)

    @classmethod
    def from_json(cls, raw: str) -> "LenderMatrix":
        data = json.loads(raw)
        m = cls(version=data["version"])
        m.matrix_id = data["matrix_id"]
        m._lenders = {}
        for ld in data.get("lenders", []):
            ld["str_seasoning"] = STRSeasoning(ld["str_seasoning"])
            bands = ld.pop("rate_bands", [])
            overlays_data = ld.pop("overlays", [])
            lp = LenderProfile(**{k: v for k, v in ld.items() if k != "created_at"})
            lp.rate_bands = [RateBand(**b) for b in bands]
            lp.overlays = [
                OverlayRule(
                    name=o["name"],
                    description=o.get("description", ""),
                    min_loan_amount=o.get("min_loan_amount"),
                    max_loan_amount=o.get("max_loan_amount"),
                    str_seasoning_months=o.get("str_seasoning_months"),
                    rate_adjustment_bps=o.get("rate_adjustment_bps"),
                    ltv_adjustment=o.get("ltv_adjustment"),
                ) for o in overlays_data
            ]
            m._lenders[lp.lender_id] = lp
        return m

    # ── DDL export ───────────────────────────────────────────────────
    @staticmethod
    def postgres_ddl() -> str:
        return POSTGRES_DDL

    # ── to_postgres_params (for async insert) ────────────────────────
    def to_insert_params(self) -> List[Tuple[str, Any]]:
        """Returns list of (table, row_dict) tuples ready for parameterised INSERT."""
        rows: List[Tuple[str, Any]] = []
        rows.append(("lender_matrix", {
            "id": self.matrix_id,
            "version": self.version,
            "effective_date": date.today().isoformat(),
            "is_active": True,
        }))
        for lp in self.lenders:
            lp_id = str(uuid.uuid4())
            rows.append(("lender_profile", {
                "id": lp_id,
                "matrix_id": self.matrix_id,
                "lender_id": lp.lender_id,
                "name": lp.name,
                "dscr_min": lp.dscr_min,
                "fico_min": lp.fico_min,
                "ltv_max": lp.ltv_max,
                "str_seasoning": lp.str_seasoning.value,
                "active_states": lp.active_states,
                "min_loan_amount": lp.min_loan_amount,
                "max_loan_amount": lp.max_loan_amount,
                "is_active": lp.is_active,
                "version": lp.version,
            }))
            for band in lp.rate_bands:
                rows.append(("lender_rate_band", {
                    "lender_id": lp_id,
                    "fico_min": band.fico_min,
                    "fico_max": band.fico_max,
                    "ltv_min": band.ltv_min,
                    "ltv_max": band.ltv_max,
                    "dscr_min": band.dscr_min,
                    "rate": band.rate,
                    "ae_y": band.ae_y,
                }))
            for ov in lp.overlays:
                rows.append(("lender_overlay", {
                    "lender_id": lp_id,
                    "name": ov.name,
                    "description": ov.description,
                    "min_loan_amount": ov.min_loan_amount,
                    "max_loan_amount": ov.max_loan_amount,
                    "str_seasoning_months": ov.str_seasoning_months,
                    "rate_adjustment_bps": ov.rate_adjustment_bps,
                    "ltv_adjustment": ov.ltv_adjustment,
                }))
        return rows


# ── Module-level singleton ───────────────────────────────────────────────

_matrix: Optional[LenderMatrix] = None

def get_matrix() -> LenderMatrix:
    global _matrix
    if _matrix is None:
        _matrix = LenderMatrix()
    return _matrix


# ── Eligibility engine ───────────────────────────────────────────────────

def _check_state(lp: LenderProfile, state: str) -> List[str]:
    errors: List[str] = []
    if lp.active_states and state not in lp.active_states:
        errors.append(f"State {state} not in active states for {lp.name}")
    return errors


def _check_str(lp: LenderProfile, deal: DealProfile) -> List[str]:
    errors: List[str] = []
    if not deal.is_str:
        return errors
    if lp.str_seasoning == STRSeasoning.NO:
        errors.append(f"{lp.name} does not accept STR properties")
    elif lp.str_seasoning == STRSeasoning.CONDITIONAL:
        # Deephaven-style: need 12-month seasoning / reserves
        required = 12
        for ov in lp.overlays:
            if ov.str_seasoning_months is not None:
                required = ov.str_seasoning_months
        if deal.str_seasoning_months < required:
            errors.append(
                f"{lp.name} requires {required}-mo STR seasoning, deal has {deal.str_seasoning_months}"
            )
    elif lp.str_seasoning == STRSeasoning.UNVERIFIED:
        # Kiavi-style: may accept but with adjustments (no error, just flag)
        pass
    return errors


def _check_entity(lp: LenderProfile, deal: DealProfile) -> List[str]:
    errors: List[str] = []
    if deal.entity_type not in lp.allowed_entity_types:
        errors.append(f"{lp.name} does not allow entity type {deal.entity_type.value}")
    return errors


def _check_loan_amount(lp: LenderProfile, deal: DealProfile) -> List[str]:
    errors: List[str] = []
    if deal.loan_amount < lp.min_loan_amount:
        errors.append(
            f"Loan amount ${deal.loan_amount:,.0f} below {lp.name} floor ${lp.min_loan_amount:,.0f}"
        )
    if deal.loan_amount > lp.max_loan_amount:
        errors.append(
            f"Loan amount ${deal.loan_amount:,.0f} exceeds {lp.name} ceiling ${lp.max_loan_amount:,.0f}"
        )
    return errors


def check_eligibility(deal: DealProfile, lender: LenderProfile) -> EligibilityResult:
    """Test a single deal against a single lender. Returns EligibilityResult."""
    reasons: List[str] = []

    # FICO
    if deal.fico < lender.fico_min:
        reasons.append(f"FICO {deal.fico} < {lender.name} min {lender.fico_min}")

    # DSCR (skip for no-ratio lenders)
    if not lender.is_no_ratio and deal.dscr < lender.dscr_min:
        reasons.append(f"DSCR {deal.dscr:.2f} < {lender.name} min {lender.dscr_min:.2f}")

    # LTV
    ltv_max = lender.ltv_max
    if deal.ltv > ltv_max:
        reasons.append(f"LTV {deal.ltv:.1f}% > {ltv_max:.1f}% max for {lender.name}")

    # State
    reasons.extend(_check_state(lender, deal.property_state))
    # STR
    reasons.extend(_check_str(lender, deal))
    # Entity
    reasons.extend(_check_entity(lender, deal))
    # Loan amount
    reasons.extend(_check_loan_amount(lender, deal))

    return EligibilityResult(
        lender=lender,
        eligible=len(reasons) == 0,
        reasons=reasons,
        adjusted_ltv_max=ltv_max,
    )


def check_eligibility_all(
    deal: DealProfile,
    matrix: Optional[LenderMatrix] = None,
) -> List[EligibilityResult]:
    """Test a deal against every active lender in the matrix."""
    matrix = matrix or get_matrix()
    return [check_eligibility(deal, lp) for lp in matrix.lenders]


# ── Rate / band lookup ───────────────────────────────────────────────────

def _interpolate_band(bands: List[RateBand], fico: int, ltv: float, dscr: float) -> Optional[RateBand]:
    """
    Find the band that covers (fico, ltv) and satisfies dscr_min.
    Bands are expected to be sorted from best (lowest rate) to worst.
    """
    matches = [
        b for b in bands
        if b.fico_min <= fico <= b.fico_max
        and b.ltv_min <= ltv <= b.ltv_max
        and dscr >= b.dscr_min
    ]
    if not matches:
        # Try a relaxed match – drop dscr constraint and pick widest band
        matches = [
            b for b in bands
            if b.fico_min <= fico <= b.fico_max
            and b.ltv_min <= ltv <= b.ltv_max
        ]
    if matches:
        return min(matches, key=lambda b: b.rate)
    return None


def lookup_rate_band(
    lender: LenderProfile,
    fico: int,
    ltv: float,
    dscr: float,
) -> Tuple[Optional[float], Optional[float]]:
    """Return (note_rate, ae_y) for the best matching band, or (None, None)."""
    band = _interpolate_band(lender.rate_bands, fico, ltv, dscr)
    if band:
        return band.rate, band.ae_y
    return None, None


# ── Overlay engine ───────────────────────────────────────────────────────

@dataclass
class OverlayAdjustment:
    rate_delta_bps: float = 0.0
    ltv_delta: float = 0.0
    flags: List[str] = field(default_factory=list)


def apply_overlays(
    lender: LenderProfile,
    deal: DealProfile,
    base_rate: float,
    base_ltv_max: float,
) -> Tuple[float, float, OverlayAdjustment]:
    """
    Apply lender-specific overlays to base pricing.
    Returns (adjusted_rate, adjusted_ltv_max, adjustment_details).
    """
    adj = OverlayAdjustment()
    rate = base_rate
    ltv = base_ltv_max

    for ov in lender.overlays:
        # STR seasoning overlay
        if ov.str_seasoning_months is not None and deal.is_str:
            if deal.str_seasoning_months < ov.str_seasoning_months:
                adj.flags.append(f"str_seasoning_penalty:{ov.name}")

        # Rate adjustment
        if ov.rate_adjustment_bps:
            rate += ov.rate_adjustment_bps / 100.0
            adj.rate_delta_bps += ov.rate_adjustment_bps

        # LTV adjustment
        if ov.ltv_adjustment:
            ltv += ov.ltv_adjustment
            adj.ltv_delta += ov.ltv_adjustment

        # Loan amount floor from overlay
        if ov.min_loan_amount is not None and deal.loan_amount < ov.min_loan_amount:
            adj.flags.append(f"below_overlay_floor:{ov.name}")

    return round(rate, 4), round(ltv, 2), adj


# ── Pareto-optimal ranking ──────────────────────────────────────────────

@dataclass
class RankedLender:
    lender: LenderProfile
    eligible: bool
    ae_y: Optional[float]
    rate: Optional[float]
    ltv_max: float
    reasons: List[str] = field(default_factory=list)
    is_pareto: bool = False


def _dominates(a: RankedLender, b: RankedLender) -> bool:
    """a Pareto-dominates b if a is better or equal on all criteria and strictly better on one.
    Criteria: lower AEY is better, higher LTV max is better."""
    if a.ae_y is None or b.ae_y is None:
        return False
    better_or_equal = (a.ae_y <= b.ae_y) and (a.ltv_max >= b.ltv_max)
    strictly_better = (a.ae_y < b.ae_y) or (a.ltv_max > b.ltv_max)
    return better_or_equal and strictly_better


def rank_lenders_pareto(
    deal: DealProfile,
    matrix: Optional[LenderMatrix] = None,
) -> List[RankedLender]:
    """
    1. Run eligibility on every lender.
    2. Price each eligible lender.
    3. Rank by AEY (ascending).
    4. Mark Pareto-optimal lenders.
    """
    matrix = matrix or get_matrix()
    results: List[RankedLender] = []

    for lp in matrix.lenders:
        elig = check_eligibility(deal, lp)
        if not elig.eligible:
            results.append(RankedLender(
                lender=lp, eligible=False, ae_y=None, rate=None,
                ltv_max=lp.ltv_max, reasons=elig.reasons,
            ))
            continue

        # Base pricing
        rate, ae_y = lookup_rate_band(lp, deal.fico, deal.ltv, deal.dscr)
        ltv_max = lp.ltv_max

        if rate is not None and ae_y is not None:
            rate, ltv_max, _ = apply_overlays(lp, deal, rate, ltv_max)
            # Recalculate AEY with adjusted rate
            ae_y = round(rate + 0.25, 3)

        results.append(RankedLender(
            lender=lp, eligible=True, ae_y=ae_y, rate=rate,
            ltv_max=ltv_max, reasons=[],
        ))

    # Separate eligible and non-eligible
    eligible = [r for r in results if r.eligible and r.ae_y is not None]
    ineligible = [r for r in results if not r.eligible]

    # Sort by AEY ascending
    eligible.sort(key=lambda r: r.ae_y)  # type: ignore

    # Mark Pareto-optimal
    for i, cand in enumerate(eligible):
        dominated = False
        for j, other in enumerate(eligible):
            if i != j and _dominates(other, cand):
                dominated = True
                break
        cand.is_pareto = not dominated

    return eligible + ineligible


# ── Convenience: full pipeline ──────────────────────────────────────────

def price_deal(
    deal: DealProfile,
    matrix: Optional[LenderMatrix] = None,
) -> Dict[str, Any]:
    """Run the full pipeline: eligibility → pricing → overlays → ranking."""
    matrix = matrix or get_matrix()
    ranked = rank_lenders_pareto(deal, matrix)
    return {
        "matrix_version": matrix.version,
        "deal": asdict(deal),
        "ranked_lenders": [asdict(r) for r in ranked],
        "pareto_front": [asdict(r) for r in ranked if r.is_pareto],
        "best_aey": ranked[0].ae_y if ranked and ranked[0].eligible else None,
        "best_lender": ranked[0].lender.name if ranked and ranked[0].eligible else None,
    }
