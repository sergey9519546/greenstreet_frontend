"""
DSCR Sovereign OS — Evidence Vault CRUD Operations
Async CRUD using asyncpg with soft-delete, deduplication, and integrity checks.

Every operation maintains the immutable audit trail:
- Creates always insert new rows (never overwrite)
- Deletes are soft-deletes (is_deleted flag + deleted_at timestamp)
- Updates mark old record as deleted + insert new record
- Reads filter out deleted records by default
"""

import hashlib
from datetime import datetime, timedelta
from typing import Optional, Sequence
from uuid import UUID, uuid4

import asyncpg

try:
    from .vault import (
        EvidenceRecord,
        SourceType,
        ProvenanceTier,
        CONFIDENCE_DEFAULTS,
        TTL_DEFAULTS,
    )
except ImportError:
    from vault import (
        EvidenceRecord,
        SourceType,
        ProvenanceTier,
        CONFIDENCE_DEFAULTS,
        TTL_DEFAULTS,
    )


# ============================================================================
# SQL Templates
# ============================================================================

SQL_INSERT = """
INSERT INTO evidence_vault (
    id, deal_id, field_name, field_value, source_type, source_id,
    confidence_score, provenance_tier, sha256_hash, ttl_hours,
    effective_date, ingested_at, stale_after, is_stale, is_deleted,
    created_at, updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
    $11, $12, $13, $14, FALSE,
    $15, $15
)
RETURNING id
"""

SQL_GET_BY_ID = """
SELECT * FROM evidence_vault
WHERE id = $1 AND is_deleted = FALSE
"""

SQL_LIST_BY_DEAL = """
SELECT * FROM evidence_vault
WHERE deal_id = $1 AND is_deleted = FALSE
ORDER BY ingested_at DESC
"""

SQL_LIST_BY_FIELD = """
SELECT * FROM evidence_vault
WHERE deal_id = $1 AND field_name = $2 AND is_deleted = FALSE
ORDER BY ingested_at DESC
"""

SQL_GET_LATEST_BY_FIELD = """
SELECT * FROM evidence_vault
WHERE deal_id = $1 AND field_name = $2 AND is_deleted = FALSE
ORDER BY ingested_at DESC
LIMIT 1
"""

SQL_SOFT_DELETE = """
UPDATE evidence_vault
SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
WHERE id = $1 AND is_deleted = FALSE
RETURNING id
"""

SQL_MARK_STALE = """
UPDATE evidence_vault
SET is_stale = TRUE, updated_at = NOW()
WHERE stale_after IS NOT NULL
  AND stale_after < $1
  AND is_stale = FALSE
  AND is_deleted = FALSE
RETURNING id
"""

SQL_GET_STALE = """
SELECT * FROM evidence_vault
WHERE is_stale = TRUE AND is_deleted = FALSE
ORDER BY stale_after ASC
"""

SQL_GET_EXPIRING_SOON = """
SELECT * FROM evidence_vault
WHERE stale_after IS NOT NULL
  AND stale_after BETWEEN $1 AND $2
  AND is_stale = FALSE
  AND is_deleted = FALSE
ORDER BY stale_after ASC
"""

SQL_VERIFY_HASH = """
SELECT id, sha256_hash, field_name, field_value, source_id
FROM evidence_vault
WHERE deal_id = $1 AND is_deleted = FALSE
"""

SQL_PURGE_DELETED = """
DELETE FROM evidence_vault
WHERE is_deleted = TRUE AND deleted_at < $1
RETURNING id
"""

SQL_COUNT_BY_DEAL = """
SELECT COUNT(*) FROM evidence_vault
WHERE deal_id = $1 AND is_deleted = FALSE
"""


# ============================================================================
# Row → EvidenceRecord converter
# ============================================================================

def _row_to_record(row: asyncpg.Record) -> EvidenceRecord:
    """Convert an asyncpg Record to an EvidenceRecord dataclass."""
    return EvidenceRecord(
        id=str(row["id"]),
        deal_id=str(row["deal_id"]),
        field_name=row["field_name"],
        field_value=row["field_value"],
        source_type=SourceType(row["source_type"]),
        source_id=row["source_id"],
        confidence_score=float(row["confidence_score"]),
        provenance_tier=ProvenanceTier(row["provenance_tier"]),
        sha256_hash=row["sha256_hash"],
        ttl_hours=row["ttl_hours"],
        effective_date=row["effective_date"],
        ingested_at=row["ingested_at"],
        stale_after=row["stale_after"],
        is_stale=row["is_stale"],
        created_at=row["created_at"],
    )


# ============================================================================
# CRUD Operations
# ============================================================================

class EvidenceVaultCRUD:
    """Async CRUD operations for the evidence_vault table."""

    def __init__(self, pool: asyncpg.Pool):
        self._pool = pool

    # ------------------------------------------------------------------
    # CREATE
    # ------------------------------------------------------------------

    async def create(self, record: EvidenceRecord) -> UUID:
        """
        Insert a new evidence record. Returns the record UUID.

        Auto-computes sha256_hash if empty and stale_after if ttl_hours set.
        """
        now = datetime.utcnow()

        # Ensure hash is computed
        if not record.sha256_hash:
            record.sha256_hash = record._compute_hash()

        # Ensure stale_after is computed
        if record.ttl_hours and not record.stale_after:
            record.stale_after = (record.ingested_at or now) + timedelta(hours=record.ttl_hours)

        record_id = UUID(record.id) if isinstance(record.id, str) else record.id
        deal_id = UUID(record.deal_id) if isinstance(record.deal_id, str) else record.deal_id

        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                SQL_INSERT,
                record_id,
                deal_id,
                record.field_name,
                record.field_value,
                record.source_type.value,
                record.source_id,
                record.confidence_score,
                record.provenance_tier.value,
                record.sha256_hash,
                record.ttl_hours,
                record.effective_date,
                record.ingested_at or now,
                record.stale_after,
                record.is_stale,
                record.created_at or now,
            )
            return row["id"]

    async def bulk_create(self, records: Sequence[EvidenceRecord]) -> list[UUID]:
        """Insert multiple evidence records in a single transaction."""
        ids = []
        async with self._pool.acquire() as conn:
            async with conn.transaction():
                for record in records:
                    now = datetime.utcnow()
                    if not record.sha256_hash:
                        record.sha256_hash = record._compute_hash()
                    if record.ttl_hours and not record.stale_after:
                        record.stale_after = (record.ingested_at or now) + timedelta(
                            hours=record.ttl_hours
                        )

                    record_id = UUID(record.id) if isinstance(record.id, str) else record.id
                    deal_id = UUID(record.deal_id) if isinstance(record.deal_id, str) else record.deal_id

                    row = await conn.fetchrow(
                        SQL_INSERT,
                        record_id,
                        deal_id,
                        record.field_name,
                        record.field_value,
                        record.source_type.value,
                        record.source_id,
                        record.confidence_score,
                        record.provenance_tier.value,
                        record.sha256_hash,
                        record.ttl_hours,
                        record.effective_date,
                        record.ingested_at or now,
                        record.stale_after,
                        record.is_stale,
                        record.created_at or now,
                    )
                    ids.append(row["id"])
        return ids

    # ------------------------------------------------------------------
    # READ
    # ------------------------------------------------------------------

    async def get_by_id(self, record_id: UUID | str) -> Optional[EvidenceRecord]:
        """Fetch a single evidence record by ID (non-deleted only)."""
        rid = UUID(record_id) if isinstance(record_id, str) else record_id
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(SQL_GET_BY_ID, rid)
            return _row_to_record(row) if row else None

    async def list_by_deal(self, deal_id: UUID | str) -> list[EvidenceRecord]:
        """List all active evidence records for a deal."""
        did = UUID(deal_id) if isinstance(deal_id, str) else deal_id
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(SQL_LIST_BY_DEAL, did)
            return [_row_to_record(r) for r in rows]

    async def list_by_field(
        self, deal_id: UUID | str, field_name: str
    ) -> list[EvidenceRecord]:
        """List all active evidence records for a specific deal field."""
        did = UUID(deal_id) if isinstance(deal_id, str) else deal_id
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(SQL_LIST_BY_FIELD, did, field_name)
            return [_row_to_record(r) for r in rows]

    async def get_latest_by_field(
        self, deal_id: UUID | str, field_name: str
    ) -> Optional[EvidenceRecord]:
        """Get the most recent evidence for a deal field."""
        did = UUID(deal_id) if isinstance(deal_id, str) else deal_id
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(SQL_GET_LATEST_BY_FIELD, did, field_name)
            return _row_to_record(row) if row else None

    async def count_by_deal(self, deal_id: UUID | str) -> int:
        """Count active evidence records for a deal."""
        did = UUID(deal_id) if isinstance(deal_id, str) else deal_id
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(SQL_COUNT_BY_DEAL, did)
            return row["count"]

    # ------------------------------------------------------------------
    # UPDATE (immutable append — old record soft-deleted, new one inserted)
    # ------------------------------------------------------------------

    async def update(self, record: EvidenceRecord) -> UUID:
        """
        Immutable update: soft-deletes the existing record and inserts a new one.
        Returns the new record's UUID.
        """
        # Soft-delete old record
        old_id = UUID(record.id) if isinstance(record.id, str) else record.id
        async with self._pool.acquire() as conn:
            await conn.fetchrow(SQL_SOFT_DELETE, old_id)

        # Create new record with fresh ID
        new_record = EvidenceRecord(
            deal_id=record.deal_id,
            field_name=record.field_name,
            field_value=record.field_value,
            source_type=record.source_type,
            source_id=record.source_id,
            confidence_score=record.confidence_score,
            provenance_tier=record.provenance_tier,
            ttl_hours=record.ttl_hours,
            effective_date=record.effective_date,
        )
        return await self.create(new_record)

    # ------------------------------------------------------------------
    # DELETE (soft)
    # ------------------------------------------------------------------

    async def soft_delete(self, record_id: UUID | str) -> bool:
        """Soft-delete a record. Returns True if a row was affected."""
        rid = UUID(record_id) if isinstance(record_id, str) else record_id
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(SQL_SOFT_DELETE, rid)
            return row is not None

    # ------------------------------------------------------------------
    # INTEGRITY
    # ------------------------------------------------------------------

    async def verify_deal_hashes(self, deal_id: UUID | str) -> dict:
        """
        Verify SHA-256 hash integrity for all records in a deal.
        Returns {"verified": [...], "mismatched": [...]}.
        """
        did = UUID(deal_id) if isinstance(deal_id, str) else deal_id
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(SQL_VERIFY_HASH, did)

        verified = []
        mismatched = []
        for row in rows:
            payload = f"{row['field_name']}|{row['field_value']}|{row['source_id']}"
            expected_hash = hashlib.sha256(payload.encode()).hexdigest()
            if row["sha256_hash"] == expected_hash:
                verified.append(str(row["id"]))
            else:
                mismatched.append({
                    "id": str(row["id"]),
                    "expected": expected_hash,
                    "actual": row["sha256_hash"],
                })

        return {"verified": verified, "mismatched": mismatched}

    # ------------------------------------------------------------------
    # PURGE (hard delete of old soft-deleted records)
    # ------------------------------------------------------------------

    async def purge_deleted(self, older_than_days: int = 90) -> int:
        """
        Permanently remove soft-deleted records older than N days.
        Returns count of purged records.
        """
        cutoff = datetime.utcnow() - timedelta(days=older_than_days)
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(SQL_PURGE_DELETED, cutoff)
            return len(rows)
