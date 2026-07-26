"""DSCR Sovereign OS — Evidence Vault Package"""
from .vault import (
    EvidenceRecord,
    DealEvidenceBundle,
    SourceType,
    ProvenanceTier,
    CONFIDENCE_DEFAULTS,
    TTL_DEFAULTS,
    create_evidence,
)
from .crud import EvidenceVaultCRUD
from .staleness import StalenessDetector, StalenessReport, ExpiringRecord

__all__ = [
    "EvidenceRecord",
    "DealEvidenceBundle",
    "SourceType",
    "ProvenanceTier",
    "CONFIDENCE_DEFAULTS",
    "TTL_DEFAULTS",
    "create_evidence",
    "EvidenceVaultCRUD",
    "StalenessDetector",
    "StalenessReport",
    "ExpiringRecord",
]
