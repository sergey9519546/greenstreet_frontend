-- ============================================================================
-- DSCR Sovereign OS — Evidence Vault Schema Migration
-- Migration: 001_evidence_vault.sql
-- Description: Full schema for immutable audit trail with SHA-256 hashing,
--              provenance tracking, TTL-based staleness detection.
-- ============================================================================

BEGIN;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM types for source_type and provenance_tier
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_type_enum') THEN
        CREATE TYPE source_type_enum AS ENUM ('api', 'document', 'user_input', 'computed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provenance_tier_enum') THEN
        CREATE TYPE provenance_tier_enum AS ENUM ('primary_source', 'vendor_model', 'derived', 'user_input');
    END IF;
END$$;

-- ============================================================================
-- Main evidence_vault table
-- ============================================================================

CREATE TABLE IF NOT EXISTS evidence_vault (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id           UUID            NOT NULL,
    field_name        VARCHAR(100)    NOT NULL,
    field_value       TEXT            NOT NULL DEFAULT '',
    source_type       source_type_enum NOT NULL DEFAULT 'user_input',
    source_id         VARCHAR(200)    NOT NULL DEFAULT '',
    confidence_score  DECIMAL(3,2)    NOT NULL DEFAULT 0.00
                      CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    provenance_tier   provenance_tier_enum NOT NULL DEFAULT 'user_input',
    sha256_hash       VARCHAR(64)     NOT NULL DEFAULT '',
    ttl_hours         INTEGER         CHECK (ttl_hours IS NULL OR ttl_hours > 0),
    effective_date    TIMESTAMP,
    ingested_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    stale_after       TIMESTAMP,
    is_stale          BOOLEAN         NOT NULL DEFAULT FALSE,
    is_deleted        BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at        TIMESTAMP,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes for common query patterns
-- ============================================================================

-- Lookup by deal_id (most common: list all evidence for a deal)
CREATE INDEX IF NOT EXISTS idx_evidence_vault_deal_id
    ON evidence_vault (deal_id)
    WHERE is_deleted = FALSE;

-- Lookup by deal_id + field_name (get latest evidence for a field)
CREATE INDEX IF NOT EXISTS idx_evidence_vault_deal_field
    ON evidence_vault (deal_id, field_name, ingested_at DESC)
    WHERE is_deleted = FALSE;

-- Staleness scan (cron job finds all records past their stale_after time)
CREATE INDEX IF NOT EXISTS idx_evidence_vault_stale_scan
    ON evidence_vault (stale_after)
    WHERE is_stale = FALSE AND is_deleted = FALSE AND stale_after IS NOT NULL;

-- Hash integrity verification
CREATE INDEX IF NOT EXISTS idx_evidence_vault_hash
    ON evidence_vault (sha256_hash)
    WHERE is_deleted = FALSE;

-- Soft-delete cleanup (find old deleted records for permanent purge)
CREATE INDEX IF NOT EXISTS idx_evidence_vault_deleted
    ON evidence_vault (deleted_at)
    WHERE is_deleted = TRUE;

-- Source deduplication (avoid re-ingesting same data from same source)
CREATE UNIQUE INDEX IF NOT EXISTS idx_evidence_vault_dedup
    ON evidence_vault (deal_id, field_name, source_type, sha256_hash)
    WHERE is_deleted = FALSE;

-- ============================================================================
-- Trigger: auto-update updated_at on row modification
-- ============================================================================

CREATE OR REPLACE FUNCTION update_evidence_vault_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_evidence_vault_updated_at ON evidence_vault;
CREATE TRIGGER trg_evidence_vault_updated_at
    BEFORE UPDATE ON evidence_vault
    FOR EACH ROW
    EXECUTE FUNCTION update_evidence_vault_timestamp();

-- ============================================================================
-- View: active (non-deleted, non-stale) evidence for quick access
-- ============================================================================

CREATE OR REPLACE VIEW v_active_evidence AS
SELECT *
FROM evidence_vault
WHERE is_deleted = FALSE
  AND is_stale = FALSE;

-- ============================================================================
-- View: stale evidence requiring refresh
-- ============================================================================

CREATE OR REPLACE VIEW v_stale_evidence AS
SELECT *
FROM evidence_vault
WHERE is_deleted = FALSE
  AND is_stale = TRUE;

COMMIT;
