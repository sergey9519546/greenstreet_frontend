"""
DSCR Sovereign OS — Evidence Vault Module
Immutable audit trail with SHA-256 hashing, provenance tracking, TTL-based staleness

Every number in every deal file links to:
1. Source document — PDF in S3 with Object Lock
2. API call record — full request/response + timestamp
3. Bounding box — pixel coordinates on source document
4. Cryptographic hash — SHA-256 of source data at ingestion
5. Confidence score — OCR/extraction confidence 0–1
6. Staleness timer — auto-decay: evidence older than TTL is flagged
"""

import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Any
from uuid import uuid4


class SourceType(Enum):
    API = "api"
    DOCUMENT = "document"
    USER_INPUT = "user_input"
    COMPUTED = "computed"


class ProvenanceTier(Enum):
    PRIMARY_SOURCE = "primary_source"      # Lender's own materials, statute, API
    VENDOR_MODEL = "vendor_model"           # AirDNA, HouseCanary model output
    DERIVED = "derived"                     # Computed from other evidence
    USER_INPUT = "user_input"              # Borrower-provided, agent-entered


@dataclass
class EvidenceRecord:
    """Single piece of evidence with full provenance"""
    id: str = field(default_factory=lambda: str(uuid4()))
    deal_id: str = ""
    field_name: str = ""           # e.g., "monthly_rent", "fico", "ltv"
    field_value: str = ""          # String representation of value
    source_type: SourceType = SourceType.USER_INPUT
    source_id: str = ""            # API endpoint, document hash, etc.
    confidence_score: float = 0.0  # 0.00 to 1.00
    provenance_tier: ProvenanceTier = ProvenanceTier.USER_INPUT
    sha256_hash: str = ""
    ttl_hours: Optional[int] = None
    effective_date: Optional[datetime] = None
    ingested_at: datetime = field(default_factory=datetime.utcnow)
    stale_after: Optional[datetime] = None
    is_stale: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        if not self.sha256_hash:
            self.sha256_hash = self._compute_hash()
        if self.ttl_hours and not self.stale_after:
            self.stale_after = self.ingested_at + timedelta(hours=self.ttl_hours)

    def _compute_hash(self) -> str:
        """Generate SHA-256 hash for evidence provenance"""
        payload = f"{self.field_name}|{self.field_value}|{self.source_id}"
        return hashlib.sha256(payload.encode()).hexdigest()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "deal_id": self.deal_id,
            "field_name": self.field_name,
            "field_value": self.field_value,
            "source_type": self.source_type.value,
            "source_id": self.source_id,
            "confidence_score": self.confidence_score,
            "provenance_tier": self.provenance_tier.value,
            "sha256_hash": self.sha256_hash,
            "ttl_hours": self.ttl_hours,
            "effective_date": self.effective_date.isoformat() if self.effective_date else None,
            "ingested_at": self.ingested_at.isoformat(),
            "stale_after": self.stale_after.isoformat() if self.stale_after else None,
            "is_stale": self.is_stale,
            "created_at": self.created_at.isoformat(),
        }


@dataclass
class DealEvidenceBundle:
    """Complete evidence bundle for a single deal"""
    deal_id: str
    records: list[EvidenceRecord] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)

    def add(self, record: EvidenceRecord):
        """Add evidence record to bundle"""
        record.deal_id = self.deal_id
        self.records.append(record)

    def get_by_field(self, field_name: str) -> Optional[EvidenceRecord]:
        """Get most recent evidence for a field"""
        matches = [r for r in self.records if r.field_name == field_name]
        if not matches:
            return None
        return max(matches, key=lambda r: r.ingested_at)

    def get_stale_records(self) -> list[EvidenceRecord]:
        """Get all stale evidence records"""
        now = datetime.utcnow()
        for record in self.records:
            if record.stale_after and now > record.stale_after:
                record.is_stale = True
        return [r for r in self.records if r.is_stale]

    def get_confidence_summary(self) -> dict:
        """Get confidence summary for all fields"""
        field_confidence = {}
        for record in self.records:
            if record.field_name not in field_confidence:
                field_confidence[record.field_name] = []
            field_confidence[record.field_name].append(record.confidence_score)
        
        return {
            field: {
                "count": len(scores),
                "min": min(scores),
                "max": max(scores),
                "avg": sum(scores) / len(scores),
            }
            for field, scores in field_confidence.items()
        }

    def verify_integrity(self) -> dict:
        """Verify hash integrity of all records"""
        results = {"verified": [], "mismatched": []}
        for record in self.records:
            expected_hash = record._compute_hash()
            if record.sha256_hash == expected_hash:
                results["verified"].append(record.id)
            else:
                results["mismatched"].append({
                    "id": record.id,
                    "expected": expected_hash,
                    "actual": record.sha256_hash,
                })
        return results

    def to_json(self) -> str:
        """Export bundle as JSON"""
        return json.dumps({
            "deal_id": self.deal_id,
            "records": [r.to_dict() for r in self.records],
            "created_at": self.created_at.isoformat(),
            "record_count": len(self.records),
        }, indent=2)


# Confidence score defaults by source type
CONFIDENCE_DEFAULTS = {
    SourceType.API: 0.90,           # API data generally reliable
    SourceType.DOCUMENT: 0.95,      # Document extraction high confidence
    SourceType.USER_INPUT: 0.70,    # User input needs verification
    SourceType.COMPUTED: 0.85,      # Computed values depend on inputs
}

# TTL defaults by data type (hours)
TTL_DEFAULTS = {
    "rent": 720,         # 30 days
    "rate": 24,          # 1 day
    "tax": 8760,         # 1 year
    "insurance": 8760,   # 1 year
    "fico": 720,         # 30 days
    "ltv": 720,          # 30 days
    "dscr": 24,          # 1 day
    "appraisal": 2160,   # 90 days
    "lease": 8760,       # 1 year
    "airdna": 720,       # 30 days
}


def create_evidence(
    field_name: str,
    field_value: Any,
    source_type: SourceType,
    source_id: str = "",
    confidence_score: Optional[float] = None,
    provenance_tier: Optional[ProvenanceTier] = None,
    ttl_hours: Optional[int] = None,
    effective_date: Optional[datetime] = None,
) -> EvidenceRecord:
    """
    Create an evidence record with appropriate defaults
    
    Args:
        field_name: Name of the field (e.g., "monthly_rent")
        field_value: Value of the field
        source_type: How the data was obtained
        source_id: Source identifier (API URL, document hash, etc.)
        confidence_score: Override default confidence
        provenance_tier: Override default provenance
        ttl_hours: Override default TTL
        effective_date: When the data describes
    
    Returns:
        EvidenceRecord with hash and staleness computed
    """
    # Apply defaults
    if confidence_score is None:
        confidence_score = CONFIDENCE_DEFAULTS.get(source_type, 0.70)
    
    if provenance_tier is None:
        tier_map = {
            SourceType.API: ProvenanceTier.PRIMARY_SOURCE,
            SourceType.DOCUMENT: ProvenanceTier.PRIMARY_SOURCE,
            SourceType.USER_INPUT: ProvenanceTier.USER_INPUT,
            SourceType.COMPUTED: ProvenanceTier.DERIVED,
        }
        provenance_tier = tier_map.get(source_type, ProvenanceTier.USER_INPUT)
    
    if ttl_hours is None:
        # Try to match field name to TTL default
        for key, ttl in TTL_DEFAULTS.items():
            if key in field_name.lower():
                ttl_hours = ttl
                break
    
    return EvidenceRecord(
        field_name=field_name,
        field_value=str(field_value),
        source_type=source_type,
        source_id=source_id,
        confidence_score=confidence_score,
        provenance_tier=provenance_tier,
        ttl_hours=ttl_hours,
        effective_date=effective_date,
    )
