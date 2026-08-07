"""
DSCR Sovereign OS — Evidence Vault Staleness Detection
TTL-based decay detection for time-sensitive evidence.

Cron-job friendly: designed to run on a schedule (e.g., every 15 minutes)
to flag expired evidence and trigger re-fetch workflows.

Staleness lifecycle:
  1. Record ingested with ttl_hours → stale_after computed
  2. StalenessDetector.check_staleness() finds records past stale_after
  3. Those records are flagged is_stale = TRUE
  4. Downstream consumers see stale flag and trigger re-fetch
  5. Old stale records can be purged after grace period
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

import asyncpg

logger = logging.getLogger(__name__)


# ============================================================================
# SQL Templates
# ============================================================================

SQL_MARK_STALE = """
UPDATE evidence_vault
SET is_stale = TRUE, updated_at = NOW()
WHERE stale_after IS NOT NULL
  AND stale_after <= $1
  AND is_stale = FALSE
  AND is_deleted = FALSE
RETURNING id, deal_id, field_name, stale_after
"""

SQL_GET_STALE = """
SELECT id, deal_id, field_name, field_value, source_type, source_id,
       confidence_score, provenance_tier, stale_after, is_stale
FROM evidence_vault
WHERE is_stale = TRUE AND is_deleted = FALSE
ORDER BY stale_after ASC
"""

SQL_GET_STALE_BY_DEAL = """
SELECT id, deal_id, field_name, field_value, source_type, source_id,
       confidence_score, provenance_tier, stale_after, is_stale
FROM evidence_vault
WHERE deal_id = $1 AND is_stale = TRUE AND is_deleted = FALSE
ORDER BY stale_after ASC
"""

SQL_GET_EXPIRING_SOON = """
SELECT id, deal_id, field_name, stale_after,
       EXTRACT(EPOCH FROM (stale_after - NOW())) / 3600.0 AS hours_until_stale
FROM evidence_vault
WHERE stale_after IS NOT NULL
  AND stale_after > NOW()
  AND stale_after <= $1
  AND is_stale = FALSE
  AND is_deleted = FALSE
ORDER BY stale_after ASC
"""

SQL_COUNT_STALE_BY_DEAL = """
SELECT deal_id, COUNT(*) AS stale_count
FROM evidence_vault
WHERE is_stale = TRUE AND is_deleted = FALSE
GROUP BY deal_id
ORDER BY stale_count DESC
"""

SQL_PURGE_OLD_STALE = """
DELETE FROM evidence_vault
WHERE is_stale = TRUE
  AND is_deleted = FALSE
  AND stale_after < $1
RETURNING id, deal_id, field_name
"""


# ============================================================================
# Result dataclasses
# ============================================================================

@dataclass
class StalenessReport:
    """Summary of a staleness check run."""
    checked_at: datetime = field(default_factory=datetime.utcnow)
    newly_marked_stale: int = 0
    total_stale: int = 0
    affected_deals: list[str] = field(default_factory=list)
    details: list[dict] = field(default_factory=list)


@dataclass
class ExpiringRecord:
    """A record that will become stale soon."""
    id: str
    deal_id: str
    field_name: str
    stale_after: datetime
    hours_until_stale: float


# ============================================================================
# Staleness Detector
# ============================================================================

class StalenessDetector:
    """
    TTL-based decay detection for evidence vault records.

    Usage:
        detector = StalenessDetector(pool)

        # Run as cron job every 15 minutes
        report = await detector.check_and_mark_stale()

        # Get stale records for a deal (dashboard query)
        stale = await detector.get_stale_by_deal(deal_id)

        # Warn about soon-to-expire evidence
        expiring = await detector.get_expiring_soon(within_hours=24)
    """

    def __init__(self, pool: asyncpg.Pool):
        self._pool = pool

    async def check_and_mark_stale(self) -> StalenessReport:
        """
        Mark all expired records as stale. Returns a report.

        This is the main cron-job entry point. Safe to call repeatedly —
        idempotent (only marks records not already marked).
        """
        now = datetime.utcnow()
        report = StalenessReport(checked_at=now)

        async with self._pool.acquire() as conn:
            # Mark stale
            rows = await conn.fetch(SQL_MARK_STALE, now)
            report.newly_marked_stale = len(rows)
            report.affected_deals = list(set(str(r["deal_id"]) for r in rows))
            report.details = [
                {
                    "id": str(r["id"]),
                    "deal_id": str(r["deal_id"]),
                    "field_name": r["field_name"],
                    "stale_after": r["stale_after"].isoformat() if r["stale_after"] else None,
                }
                for r in rows
            ]

            # Count total stale
            stale_rows = await conn.fetch(SQL_GET_STALE)
            report.total_stale = len(stale_rows)

        if report.newly_marked_stale > 0:
            logger.warning(
                "Evidence staleness: %d records marked stale across %d deals",
                report.newly_marked_stale,
                len(report.affected_deals),
            )

        return report

    async def get_stale_by_deal(self, deal_id: str) -> list[dict]:
        """Get all stale evidence records for a specific deal."""
        from uuid import UUID
        did = UUID(deal_id) if isinstance(deal_id, str) else deal_id
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(SQL_GET_STALE_BY_DEAL, did)
            return [
                {
                    "id": str(r["id"]),
                    "deal_id": str(r["deal_id"]),
                    "field_name": r["field_name"],
                    "field_value": r["field_value"],
                    "source_type": r["source_type"],
                    "stale_after": r["stale_after"].isoformat() if r["stale_after"] else None,
                }
                for r in rows
            ]

    async def get_expiring_soon(
        self, within_hours: int = 24
    ) -> list[ExpiringRecord]:
        """Get records that will become stale within N hours."""
        cutoff = datetime.utcnow() + timedelta(hours=within_hours)
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(SQL_GET_EXPIRING_SOON, cutoff)
            return [
                ExpiringRecord(
                    id=str(r["id"]),
                    deal_id=str(r["deal_id"]),
                    field_name=r["field_name"],
                    stale_after=r["stale_after"],
                    hours_until_stale=float(r["hours_until_stale"]),
                )
                for r in rows
            ]

    async def get_stale_summary(self) -> list[dict]:
        """Get count of stale records grouped by deal_id."""
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(SQL_COUNT_STALE_BY_DEAL)
            return [
                {"deal_id": str(r["deal_id"]), "stale_count": r["stale_count"]}
                for r in rows
            ]

    async def purge_old_stale(self, older_than_days: int = 30) -> int:
        """
        Permanently remove stale records older than N days.
        Use with caution — this destroys the audit trail for those records.
        Returns count of purged records.
        """
        cutoff = datetime.utcnow() - timedelta(days=older_than_days)
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(SQL_PURGE_OLD_STALE, cutoff)
            if rows:
                logger.warning(
                    "Purged %d old stale evidence records (older than %d days)",
                    len(rows),
                    older_than_days,
                )
            return len(rows)
