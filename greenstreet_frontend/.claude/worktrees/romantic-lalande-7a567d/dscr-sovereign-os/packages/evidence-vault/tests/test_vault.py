"""
DSCR Sovereign OS — Evidence Vault Test Suite
Tests for CRUD operations, staleness detection, and vault dataclass logic.

All tests use mocked asyncpg connections (no real PostgreSQL required).
"""

import asyncio
import hashlib
import sys
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

# Ensure src/ is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from vault import (
    EvidenceRecord,
    DealEvidenceBundle,
    SourceType,
    ProvenanceTier,
    CONFIDENCE_DEFAULTS,
    TTL_DEFAULTS,
    create_evidence,
)
from crud import EvidenceVaultCRUD, _row_to_record
from staleness import StalenessDetector, StalenessReport, ExpiringRecord


# ============================================================================
# Helpers
# ============================================================================

DEAL_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"


def _make_record(**kwargs) -> EvidenceRecord:
    """Create an EvidenceRecord with sensible defaults for testing."""
    defaults = dict(
        deal_id=DEAL_ID,
        field_name="monthly_rent",
        field_value="3500",
        source_type=SourceType.API,
        source_id="https://api.airdna.com/v1/rent",
        confidence_score=0.90,
        provenance_tier=ProvenanceTier.PRIMARY_SOURCE,
        ttl_hours=720,
    )
    defaults.update(kwargs)
    return EvidenceRecord(**defaults)


def _make_mock_record_dict(record: EvidenceRecord) -> dict:
    """Build a dict that mimics an asyncpg Record row."""
    return {
        "id": __import__("uuid").UUID(record.id),
        "deal_id": __import__("uuid").UUID(record.deal_id),
        "field_name": record.field_name,
        "field_value": record.field_value,
        "source_type": record.source_type.value,
        "source_id": record.source_id,
        "confidence_score": record.confidence_score,
        "provenance_tier": record.provenance_tier.value,
        "sha256_hash": record.sha256_hash,
        "ttl_hours": record.ttl_hours,
        "effective_date": record.effective_date,
        "ingested_at": record.ingested_at,
        "stale_after": record.stale_after,
        "is_stale": record.is_stale,
        "created_at": record.created_at,
    }


def _mock_pool(fetchrow_result=None, fetch_result=None):
    """Create a mocked asyncpg pool."""
    pool = MagicMock()
    conn = MagicMock()

    # fetchrow is async
    conn.fetchrow = AsyncMock(return_value=fetchrow_result)
    conn.fetch = AsyncMock(return_value=fetch_result or [])
    conn.execute = AsyncMock(return_value=None)

    # Transaction context manager
    transaction_cm = MagicMock()
    transaction_cm.__aenter__ = AsyncMock(return_value=None)
    transaction_cm.__aexit__ = AsyncMock(return_value=False)
    conn.transaction = MagicMock(return_value=transaction_cm)

    # acquire() returns an async context manager
    acquire_cm = MagicMock()
    acquire_cm.__aenter__ = AsyncMock(return_value=conn)
    acquire_cm.__aexit__ = AsyncMock(return_value=False)
    pool.acquire = MagicMock(return_value=acquire_cm)

    return pool, conn


def _run(coro):
    """Run an async coroutine synchronously."""
    return asyncio.get_event_loop().run_until_complete(coro)


# ============================================================================
# Test: EvidenceRecord Dataclass
# ============================================================================

class TestEvidenceRecord(unittest.TestCase):
    """Tests for the EvidenceRecord dataclass from vault.py."""

    def test_hash_auto_computed(self):
        """SHA-256 hash is automatically computed on creation."""
        rec = _make_record()
        expected_payload = f"{rec.field_name}|{rec.field_value}|{rec.source_id}"
        expected_hash = hashlib.sha256(expected_payload.encode()).hexdigest()
        self.assertEqual(rec.sha256_hash, expected_hash)
        self.assertEqual(len(rec.sha256_hash), 64)

    def test_stale_after_computed_from_ttl(self):
        """stale_after is auto-set when ttl_hours is provided."""
        before = datetime.utcnow()
        rec = _make_record(ttl_hours=24)
        after = datetime.utcnow()

        self.assertIsNotNone(rec.stale_after)
        # stale_after should be roughly ingested_at + 24h
        self.assertGreaterEqual(rec.stale_after, before + timedelta(hours=23))
        self.assertLessEqual(rec.stale_after, after + timedelta(hours=25))

    def test_no_stale_after_without_ttl(self):
        """stale_after stays None when ttl_hours is None."""
        rec = _make_record(ttl_hours=None)
        self.assertIsNone(rec.stale_after)

    def test_to_dict_roundtrip(self):
        """to_dict() produces correct keys and value types."""
        rec = _make_record()
        d = rec.to_dict()
        self.assertEqual(d["id"], rec.id)
        self.assertEqual(d["deal_id"], rec.deal_id)
        self.assertEqual(d["source_type"], "api")
        self.assertEqual(d["provenance_tier"], "primary_source")
        self.assertIsInstance(d["confidence_score"], float)
        self.assertEqual(len(d["sha256_hash"]), 64)

    def test_id_is_unique_uuid(self):
        """Two records get different UUIDs."""
        r1 = _make_record()
        r2 = _make_record()
        self.assertNotEqual(r1.id, r2.id)


# ============================================================================
# Test: create_evidence Factory
# ============================================================================

class TestCreateEvidence(unittest.TestCase):
    """Tests for the create_evidence() factory function."""

    def test_default_confidence_for_api(self):
        """API source gets 0.90 confidence by default."""
        rec = create_evidence("monthly_rent", 3500, SourceType.API)
        self.assertEqual(rec.confidence_score, 0.90)

    def test_default_ttl_for_rent(self):
        """Field name containing 'rent' gets 720-hour TTL."""
        rec = create_evidence("monthly_rent", 3500, SourceType.API)
        self.assertEqual(rec.ttl_hours, 720)

    def test_default_ttl_for_rate(self):
        """Field name containing 'rate' gets 24-hour TTL."""
        rec = create_evidence("interest_rate", 6.5, SourceType.API)
        self.assertEqual(rec.ttl_hours, 24)

    def test_override_confidence(self):
        """Explicit confidence_score overrides default."""
        rec = create_evidence("fico", 740, SourceType.USER_INPUT, confidence_score=0.50)
        self.assertEqual(rec.confidence_score, 0.50)

    def test_field_value_stringified(self):
        """Non-string values are converted to string."""
        rec = create_evidence("ltv", 75.5, SourceType.COMPUTED)
        self.assertEqual(rec.field_value, "75.5")


# ============================================================================
# Test: DealEvidenceBundle
# ============================================================================

class TestDealEvidenceBundle(unittest.TestCase):
    """Tests for DealEvidenceBundle from vault.py."""

    def test_add_and_get_by_field(self):
        """Add a record and retrieve it by field name."""
        bundle = DealEvidenceBundle(deal_id=DEAL_ID)
        rec = _make_record(field_name="monthly_rent", field_value="3500")
        bundle.add(rec)
        found = bundle.get_by_field("monthly_rent")
        self.assertIsNotNone(found)
        self.assertEqual(found.field_value, "3500")

    def test_get_by_field_returns_latest(self):
        """get_by_field returns the most recent record when multiple exist."""
        bundle = DealEvidenceBundle(deal_id=DEAL_ID)
        old = _make_record(field_name="monthly_rent", field_value="3000")
        old.ingested_at = datetime.utcnow() - timedelta(days=1)
        new = _make_record(field_name="monthly_rent", field_value="3500")
        bundle.add(old)
        bundle.add(new)
        found = bundle.get_by_field("monthly_rent")
        self.assertEqual(found.field_value, "3500")

    def test_get_stale_records(self):
        """Records past their stale_after are flagged stale."""
        bundle = DealEvidenceBundle(deal_id=DEAL_ID)
        rec = _make_record(ttl_hours=1)
        rec.ingested_at = datetime.utcnow() - timedelta(hours=2)
        rec.stale_after = rec.ingested_at + timedelta(hours=1)
        bundle.add(rec)
        stale = bundle.get_stale_records()
        self.assertEqual(len(stale), 1)
        self.assertTrue(stale[0].is_stale)

    def test_verify_integrity_pass(self):
        """All records with correct hashes pass verification."""
        bundle = DealEvidenceBundle(deal_id=DEAL_ID)
        bundle.add(_make_record())
        bundle.add(_make_record(field_name="fico", field_value="740"))
        result = bundle.verify_integrity()
        self.assertEqual(len(result["verified"]), 2)
        self.assertEqual(len(result["mismatched"]), 0)

    def test_verify_integrity_fails_on_tamper(self):
        """Tampered hash is detected by verification."""
        bundle = DealEvidenceBundle(deal_id=DEAL_ID)
        rec = _make_record()
        rec.sha256_hash = "tampered"
        bundle.add(rec)
        result = bundle.verify_integrity()
        self.assertEqual(len(result["mismatched"]), 1)


# ============================================================================
# Test: CRUD Operations (mocked asyncpg)
# ============================================================================

class TestCRUDCreate(unittest.TestCase):
    """Tests for EvidenceVaultCRUD.create() and bulk_create()."""

    def test_create_inserts_record(self):
        """create() calls fetchrow with SQL_INSERT and returns UUID."""
        rec = _make_record()
        mock_id = __import__("uuid").UUID(rec.id)
        pool, conn = _mock_pool(fetchrow_result={"id": mock_id})
        crud = EvidenceVaultCRUD(pool)

        result = _run(crud.create(rec))

        self.assertEqual(result, mock_id)
        conn.fetchrow.assert_called_once()
        call_args = conn.fetchrow.call_args
        # First positional arg is the SQL string
        self.assertIn("INSERT INTO evidence_vault", call_args[0][0])

    def test_create_computes_hash_if_empty(self):
        """create() auto-computes hash if record has empty hash."""
        rec = _make_record()
        rec.sha256_hash = ""
        mock_id = __import__("uuid").UUID(rec.id)
        pool, conn = _mock_pool(fetchrow_result={"id": mock_id})
        crud = EvidenceVaultCRUD(pool)

        _run(crud.create(rec))

        # After create, hash should have been computed
        self.assertEqual(len(rec.sha256_hash), 64)

    def test_bulk_create_in_transaction(self):
        """bulk_create() uses a transaction and inserts all records."""
        recs = [_make_record(field_name=f"field_{i}") for i in range(3)]
        mock_ids = [__import__("uuid").UUID(r.id) for r in recs]
        pool, conn = _mock_pool(fetchrow_result={"id": mock_ids[0]})
        crud = EvidenceVaultCRUD(pool)

        results = _run(crud.bulk_create(recs))

        self.assertEqual(len(results), 3)
        # Transaction context manager should have been entered
        conn.transaction.assert_called_once()


class TestCRUDRead(unittest.TestCase):
    """Tests for EvidenceVaultCRUD read operations."""

    def test_get_by_id_returns_record(self):
        """get_by_id() returns an EvidenceRecord when found."""
        rec = _make_record()
        pool, conn = _mock_pool(fetchrow_result=_make_mock_record_dict(rec))
        crud = EvidenceVaultCRUD(pool)

        result = _run(crud.get_by_id(rec.id))

        self.assertIsNotNone(result)
        self.assertEqual(result.field_name, "monthly_rent")
        self.assertEqual(result.field_value, "3500")

    def test_get_by_id_not_found(self):
        """get_by_id() returns None when record doesn't exist."""
        pool, conn = _mock_pool(fetchrow_result=None)
        crud = EvidenceVaultCRUD(pool)
        fake_id = str(__import__("uuid").uuid4())
        result = _run(crud.get_by_id(fake_id))

        self.assertIsNone(result)

    def test_list_by_deal_returns_records(self):
        """list_by_deal() returns list of EvidenceRecords."""
        rec = _make_record()
        pool, conn = _mock_pool(fetch_result=[_make_mock_record_dict(rec)])
        crud = EvidenceVaultCRUD(pool)

        results = _run(crud.list_by_deal(DEAL_ID))

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].deal_id, DEAL_ID)


class TestCRUDDelete(unittest.TestCase):
    """Tests for EvidenceVaultCRUD.soft_delete()."""

    def test_soft_delete_returns_true_on_success(self):
        """soft_delete() returns True when a row is affected."""
        rec_id = __import__("uuid").uuid4()
        pool, conn = _mock_pool(fetchrow_result={"id": rec_id})
        crud = EvidenceVaultCRUD(pool)

        result = _run(crud.soft_delete(rec_id))

        self.assertTrue(result)
        conn.fetchrow.assert_called_once()

    def test_soft_delete_returns_false_when_not_found(self):
        """soft_delete() returns False when no row matches."""
        pool, conn = _mock_pool(fetchrow_result=None)
        crud = EvidenceVaultCRUD(pool)
        fake_id = str(__import__("uuid").uuid4())
        result = _run(crud.soft_delete(fake_id))

        self.assertFalse(result)


class TestCRUDHashVerification(unittest.TestCase):
    """Tests for EvidenceVaultCRUD.verify_deal_hashes()."""

    def test_verify_passes_for_correct_hashes(self):
        """verify_deal_hashes returns all verified when hashes match."""
        rec = _make_record()
        pool, conn = _mock_pool(fetch_result=[
            {
                "id": __import__("uuid").UUID(rec.id),
                "sha256_hash": rec.sha256_hash,
                "field_name": rec.field_name,
                "field_value": rec.field_value,
                "source_id": rec.source_id,
            }
        ])
        crud = EvidenceVaultCRUD(pool)

        result = _run(crud.verify_deal_hashes(DEAL_ID))

        self.assertEqual(len(result["verified"]), 1)
        self.assertEqual(len(result["mismatched"]), 0)

    def test_verify_detects_tampered_hash(self):
        """verify_deal_hashes detects mismatched hashes."""
        rec = _make_record()
        pool, conn = _mock_pool(fetch_result=[
            {
                "id": __import__("uuid").UUID(rec.id),
                "sha256_hash": "0000000000000000000000000000000000000000000000000000000000000000",
                "field_name": rec.field_name,
                "field_value": rec.field_value,
                "source_id": rec.source_id,
            }
        ])
        crud = EvidenceVaultCRUD(pool)

        result = _run(crud.verify_deal_hashes(DEAL_ID))

        self.assertEqual(len(result["verified"]), 0)
        self.assertEqual(len(result["mismatched"]), 1)


# ============================================================================
# Test: Staleness Detector
# ============================================================================

class TestStalenessDetector(unittest.TestCase):
    """Tests for StalenessDetector from staleness.py."""

    def test_check_and_mark_stale_report(self):
        """check_and_mark_stale() returns a correct StalenessReport."""
        deal_uuid = __import__("uuid").UUID(DEAL_ID)
        record_uuid = __import__("uuid").uuid4()
        now = datetime.utcnow()

        marked_rows = [
            {
                "id": record_uuid,
                "deal_id": deal_uuid,
                "field_name": "monthly_rent",
                "stale_after": now - timedelta(hours=1),
            }
        ]

        pool, conn = _mock_pool()
        # First fetch (MARK_STALE) returns marked rows
        # Second fetch (GET_STALE) returns the same + any pre-existing
        conn.fetch = AsyncMock(side_effect=[marked_rows, marked_rows])

        detector = StalenessDetector(pool)
        report = _run(detector.check_and_mark_stale())

        self.assertEqual(report.newly_marked_stale, 1)
        self.assertEqual(report.total_stale, 1)
        self.assertIn(DEAL_ID, report.affected_deals)

    def test_staleness_report_dataclass(self):
        """StalenessReport has correct defaults."""
        report = StalenessReport()
        self.assertEqual(report.newly_marked_stale, 0)
        self.assertEqual(report.total_stale, 0)
        self.assertIsInstance(report.affected_deals, list)
        self.assertIsInstance(report.details, list)

    def test_expiring_record_dataclass(self):
        """ExpiringRecord stores hours_until_stale correctly."""
        now = datetime.utcnow()
        rec = ExpiringRecord(
            id=str(__import__("uuid").uuid4()),
            deal_id=DEAL_ID,
            field_name="fico",
            stale_after=now + timedelta(hours=6),
            hours_until_stale=6.0,
        )
        self.assertAlmostEqual(rec.hours_until_stale, 6.0)
        self.assertEqual(rec.field_name, "fico")


class TestStalenessRowConverter(unittest.TestCase):
    """Tests for the _row_to_record helper in crud.py."""

    def test_row_to_record_converts_all_fields(self):
        """_row_to_record maps all DB columns to EvidenceRecord fields."""
        rec = _make_record()
        mock_row = _make_mock_record_dict(rec)
        # Make it behave like an asyncpg Record (support dict-style access)
        mock_record = MagicMock()
        mock_record.__getitem__ = lambda self, key: mock_row[key]

        result = _row_to_record(mock_record)

        self.assertEqual(result.field_name, "monthly_rent")
        self.assertEqual(result.field_value, "3500")
        self.assertEqual(result.source_type, SourceType.API)
        self.assertEqual(result.provenance_tier, ProvenanceTier.PRIMARY_SOURCE)
        self.assertEqual(result.confidence_score, 0.90)


# ============================================================================
# Test: Schema SQL
# ============================================================================

class TestSchemaSQL(unittest.TestCase):
    """Verify the migration SQL file exists and contains key elements."""

    def test_migration_file_exists(self):
        """Migration file exists at expected path."""
        migration_path = Path(__file__).resolve().parent.parent / "migrations" / "001_evidence_vault.sql"
        self.assertTrue(migration_path.exists(), f"Migration not found at {migration_path}")

    def test_migration_contains_table(self):
        """Migration creates the evidence_vault table."""
        migration_path = Path(__file__).resolve().parent.parent / "migrations" / "001_evidence_vault.sql"
        content = migration_path.read_text()
        self.assertIn("CREATE TABLE", content)
        self.assertIn("evidence_vault", content)

    def test_migration_contains_indexes(self):
        """Migration creates performance indexes."""
        migration_path = Path(__file__).resolve().parent.parent / "migrations" / "001_evidence_vault.sql"
        content = migration_path.read_text()
        self.assertIn("CREATE INDEX", content)
        self.assertIn("idx_evidence_vault_deal_id", content)
        self.assertIn("idx_evidence_vault_stale_scan", content)

    def test_migration_contains_trigger(self):
        """Migration creates the updated_at trigger."""
        migration_path = Path(__file__).resolve().parent.parent / "migrations" / "001_evidence_vault.sql"
        content = migration_path.read_text()
        self.assertIn("TRIGGER", content)
        self.assertIn("updated_at", content)

    def test_migration_has_views(self):
        """Migration creates active and stale views."""
        migration_path = Path(__file__).resolve().parent.parent / "migrations" / "001_evidence_vault.sql"
        content = migration_path.read_text()
        self.assertIn("v_active_evidence", content)
        self.assertIn("v_stale_evidence", content)


# ============================================================================
# Run
# ============================================================================

if __name__ == "__main__":
    unittest.main()
