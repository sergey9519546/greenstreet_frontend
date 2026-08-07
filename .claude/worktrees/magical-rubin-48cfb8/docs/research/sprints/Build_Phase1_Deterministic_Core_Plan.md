# DSCR Sovereign OS — Build Phase 1: Deterministic Core + Evidence Vault
## Weeks 1-8 Implementation Plan

**Date:** June 24, 2026  
**Phase:** 1 of 6  
**Duration:** 8 weeks  
**Gate to Phase 2:** 122 tests passing, 91% coverage, ruff clean, security scan clean

---

## 1. Objectives

1. **Deterministic DSCR Calculator** — Track 1 (Lender), Track 1 IO, Track 2 (Investor), Track 3 (Stabilized), Track 4 (Forward FADSCR)
2. **Golden Vector Regression Suite** — Python-verified canonical test case + 122 unit tests
3. **Evidence Vault** — Immutable audit trail with SHA-256 hashing, provenance tracking, TTL-based staleness
4. **Lender Matrix Engine** — Versioned PPP rules, FICO/LTV/DSCR lookup, multi-lender eligibility
5. **Tax Engine** — OBBBA-compliant (100% bonus dep, §179, QBI, QOZ permanence)

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Gateway                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ DSCR Engine  │  │ Lender Matrix│  │  Tax Engine  │  │
│  │ (QuantLib +  │  │  (PostgreSQL │  │  (OBBBA +    │  │
│  │  pyxirr)     │  │   versioned) │  │   §1250)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                │                  │           │
│         └────────────────┼──────────────────┘           │
│                          │                              │
│                  ┌───────▼───────┐                      │
│                  │ Evidence Vault │                      │
│                  │ (PostgreSQL +  │                      │
│                  │  S3 immutable) │                      │
│                  └───────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

---

## 3. DSCR Calculator Module

### 3.1 Track 1 — Lender Qualifying DSCR

```python
def calculate_dscr_track1(
    monthly_rent: float,
    monthly_principal_interest: float,
    annual_property_tax: float,
    annual_insurance: float,
    monthly_hoa: float
) -> float:
    """
    Track 1: Lender Qualifying DSCR
    DSCR_A = Gross_Rent / Monthly_PITIA
    
    Where PITIA = P&I + (Tax/12) + (Insurance/12) + HOA
    
    Golden Vector:
      $3,000 rent / ($2,120.6517 + $416.67 + $166.67 + $150) = 1.0512
    """
    monthly_tax = annual_property_tax / 12
    monthly_insurance = annual_insurance / 12
    pitia = monthly_principal_interest + monthly_tax + monthly_insurance + monthly_hoa
    return monthly_rent / pitia
```

### 3.2 Track 1 IO — Interest-Only Variant

```python
def calculate_dscr_track1_io(
    monthly_rent: float,
    loan_amount: float,
    annual_rate: float,
    annual_property_tax: float,
    annual_insurance: float,
    monthly_hoa: float
) -> float:
    """
    Track 1 IO: Interest-Only DSCR
    DSCR_IO = Rent / ITIA
    
    Where ITIA = (Loan * Rate / 12) + (Tax/12) + (Insurance/12) + HOA
    Note: Principal excluded during IO period
    """
    monthly_interest = loan_amount * annual_rate / 12
    monthly_tax = annual_property_tax / 12
    monthly_insurance = annual_insurance / 12
    itia = monthly_interest + monthly_tax + monthly_insurance + monthly_hoa
    return monthly_rent / itia
```

### 3.3 Track 2 — Investor Survival DSCR

```python
def calculate_dscr_track2(
    annual_gross_rent: float,
    vacancy_rate: float,
    annual_opex: float,
    annual_debt_service: float
) -> float:
    """
    Track 2: Investor Survival DSCR
    DSCR_B = Annual_NOI / Annual_Debt_Service
    
    Where NOI = Gross_Rent * (1 - Vacancy) - OpEx
    Note: This is the "does it actually cash flow?" metric
    """
    noi = annual_gross_rent * (1 - vacancy_rate) - annual_opex
    return noi / annual_debt_service
```

### 3.4 P&I Calculation (QuantLib)

```python
def calculate_pi(
    loan_amount: float,
    annual_rate: float,
    term_years: int = 30
) -> float:
    """
    Monthly P&I using standard amortization formula
    
    PI_factor = r/12 * (1+r/12)^n / ((1+r/12)^n - 1)
    
    Golden Vector: $318,750 @ 7.00% / 30yr = $2,120.6517
    """
    r = annual_rate / 12
    n = term_years * 12
    pi_factor = r * (1 + r)**n / ((1 + r)**n - 1)
    return loan_amount * pi_factor
```

---

## 4. Golden Vector Test Suite

### 4.1 Canonical Test Case

```python
def test_golden_vector():
    """Primary regression test — Python-verified EXACT"""
    # Inputs
    property_value = 425_000
    ltv = 0.75
    loan_amount = property_value * ltv  # $318,750
    annual_rate = 0.07
    term_years = 30
    monthly_rent = 3_000
    annual_tax = 5_000
    annual_insurance = 2_000
    monthly_hoa = 150
    
    # Expected outputs
    expected_pi = 2_120.6517
    expected_pitia = expected_pi + (annual_tax/12) + (annual_insurance/12) + monthly_hoa
    expected_dscr_t1 = monthly_rent / expected_pitia  # 1.0512
    
    # Calculate
    actual_pi = calculate_pi(loan_amount, annual_rate, term_years)
    actual_dscr_t1 = calculate_dscr_track1(
        monthly_rent, actual_pi, annual_tax, annual_insurance, monthly_hoa
    )
    
    # Assert (within floating-point tolerance)
    assert abs(actual_pi - expected_pi) < 0.01
    assert abs(actual_dscr_t1 - expected_dscr_t1) < 0.001
```

### 4.2 Test Matrix (122 Tests Target)

| Category | Tests | Coverage |
|----------|-------|----------|
| Track 1 DSCR | 15 | Formula, edge cases, zero rent, negative rent |
| Track 1 IO | 10 | IO period, reset, rate changes |
| Track 2 DSCR | 15 | NOI calculation, vacancy, OpEx |
| P&I Calculator | 20 | Various rates, terms, loan amounts |
| PITIA Assembly | 15 | Tax, insurance, HOA combinations |
| Lender Matrix | 20 | FICO/LTV/DSCR lookup, eligibility |
| PPP Rules | 15 | State-specific thresholds, business exemption |
| Tax Engine | 12 | OBBBA, §1250 recapture, QBI |

---

## 5. Evidence Vault

### 5.1 Schema

```sql
CREATE TABLE evidence_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL,  -- 'api', 'document', 'user_input', 'computed'
    source_id VARCHAR(200),            -- API endpoint, document hash, etc.
    confidence_score DECIMAL(3,2),     -- 0.00 to 1.00
    provenance_tier VARCHAR(20),       -- 'primary_source', 'vendor_model', 'derived', 'user_input'
    sha256_hash VARCHAR(64) NOT NULL,  -- Hash of field_value at time of ingestion
    ttl_hours INTEGER,                 -- Time-to-live before staleness
    effective_date TIMESTAMP,          -- When the data describes
    ingested_at TIMESTAMP DEFAULT NOW(),
    stale_after TIMESTAMP,             -- ingested_at + ttl_hours
    is_stale BOOLEAN DEFAULT FALSE,    -- Auto-updated by cron
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_evidence_deal ON evidence_vault(deal_id);
CREATE INDEX idx_evidence_stale ON evidence_vault(is_stale, stale_after);
CREATE INDEX idx_evidence_hash ON evidence_vault(sha256_hash);
```

### 5.2 SHA-256 Hashing

```python
import hashlib

def hash_evidence(field_name: str, field_value: str, source_id: str) -> str:
    """
    Generate SHA-256 hash for evidence provenance
    Hash = SHA-256(field_name || field_value || source_id)
    """
    payload = f"{field_name}|{field_value}|{source_id}"
    return hashlib.sha256(payload.encode()).hexdigest()
```

### 5.3 Staleness Detection

```python
from datetime import datetime, timedelta

def check_staleness(evidence_record: dict) -> dict:
    """
    Auto-flag stale evidence based on TTL
    Stale evidence = ingested_at + ttl_hours < now
    """
    if evidence_record['ttl_hours'] is None:
        return evidence_record
    
    stale_after = evidence_record['ingested_at'] + timedelta(hours=evidence_record['ttl_hours'])
    is_stale = datetime.utcnow() > stale_after
    
    return {**evidence_record, 'stale_after': stale_after, 'is_stale': is_stale}
```

---

## 6. Lender Matrix Engine

### 6.1 Versioned Matrix Store

```sql
CREATE TABLE lender_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_name VARCHAR(100) NOT NULL,
    version INTEGER NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    
    -- Core parameters
    min_dscr DECIMAL(4,2),
    min_fico INTEGER,
    max_ltv DECIMAL(4,2),
    min_loan_amount DECIMAL(12,2),
    max_loan_amount DECIMAL(12,2),
    
    -- Property type flags
    allows_sfr BOOLEAN DEFAULT TRUE,
    allows_2to4_unit BOOLEAN DEFAULT TRUE,
    allows_condo BOOLEAN DEFAULT TRUE,
    allows_str BOOLEAN DEFAULT FALSE,
    
    -- Product options
    allows_io BOOLEAN DEFAULT FALSE,
    allows_arm BOOLEAN DEFAULT FALSE,
    
    -- PPP structure
    ppp_structure VARCHAR(50),  -- '5-4-3-2-1', '3-2-1', 'flat', 'none'
    
    -- Verification
    source_url TEXT,
    verified_date DATE,
    confidence_score DECIMAL(3,2),
    
    UNIQUE(lender_name, version)
);

CREATE INDEX idx_matrix_lender ON lender_matrix(lender_name, version DESC);
CREATE INDEX idx_matrix_effective ON lender_matrix(effective_date);
```

### 6.2 Eligibility Check

```python
def check_eligibility(
    deal: dict,
    lender_matrix_version: int = None
) -> list[dict]:
    """
    Check deal eligibility against all active lender matrices
    Returns list of eligible lenders with parameters
    """
    eligible_lenders = []
    
    for lender in get_active_lenders(lender_matrix_version):
        if (deal['dscr_t1'] >= lender['min_dscr'] and
            deal['fico'] >= lender['min_fico'] and
            deal['ltv'] <= lender['max_ltv'] and
            deal['loan_amount'] >= lender['min_loan_amount'] and
            deal['loan_amount'] <= lender['max_loan_amount']):
            
            eligible_lenders.append({
                'lender': lender,
                'aey': calculate_aey(deal, lender),
                'ppp_cost': estimate_ppp_cost(deal, lender)
            })
    
    return sorted(eligible_lenders, key=lambda x: x['aey'])
```

---

## 7. Tax Engine (OBBBA-Compliant)

### 7.1 Bonus Depreciation

```python
def calculate_bonus_depreciation(
    acquisition_date: str,
    qualifying_basis: float
) -> float:
    """
    OBBBA bonus depreciation calculation
    
    - After Jan 19, 2025: 100% permanent
    - 2025 (pre-OBBBA): 40%
    - 2026 (pre-OBBBA): 20%
    """
    from datetime import date
    
    acq = date.fromisoformat(acquisition_date)
    
    if acq >= date(2025, 1, 20):
        return qualifying_basis * 1.00  # 100% permanent
    elif acq >= date(2025, 1, 1):
        return qualifying_basis * 0.40  # 40% phase-down
    elif acq >= date(2026, 1, 1):
        return qualifying_basis * 0.20  # 20% phase-down
    else:
        return 0
```

### 7.2 §1250 Recapture

```python
def calculate_recapture(
    accumulated_depreciation: float,
    marginal_rate: float = 0.25
) -> float:
    """
    §1250 recapture at 25% (plus 3.8% NIIT if applicable)
    """
    niit = 0.038 if marginal_rate > 0.25 else 0
    return accumulated_depreciation * (marginal_rate + niit)
```

---

## 8. Project Structure

```
dscr-sovereign-os/
├── packages/
│   ├── dscr-core/
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── calculator.py      # Track 1-4 DSCR
│   │   │   ├── pi_engine.py       # P&I calculation
│   │   │   ├── pitia.py           # PITIA assembly
│   │   │   ├── lender_matrix.py   # Eligibility engine
│   │   │   ├── ppp_rules.py       # State PPP logic
│   │   │   └── tax_engine.py      # OBBBA tax calculations
│   │   ├── tests/
│   │   │   ├── test_golden_vector.py
│   │   │   ├── test_calculator.py
│   │   │   ├── test_lender_matrix.py
│   │   │   ├── test_ppp_rules.py
│   │   │   └── test_tax_engine.py
│   │   ├── pyproject.toml
│   │   └── README.md
│   ├── evidence-vault/
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── vault.py           # CRUD operations
│   │   │   ├── hashing.py         # SHA-256 provenance
│   │   │   └── staleness.py       # TTL-based decay
│   │   ├── migrations/
│   │   │   └── 001_evidence_vault.sql
│   │   └── tests/
│   │       ├── test_vault.py
│   │       └── test_staleness.py
│   └── api/
│       ├── src/
│       │   ├── __init__.py
│       │   ├── main.py            # FastAPI app
│       │   ├── routes/
│       │   │   ├── deal.py        # Deal analysis endpoints
│       │   │   ├── lender.py      # Lender matrix endpoints
│       │   │   └── evidence.py    # Evidence vault endpoints
│       │   └── middleware/
│       │       └── auth.py
│       └── tests/
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## 9. Week-by-Week Schedule

| Week | Deliverable | Tests |
|------|-------------|-------|
| **1** | P&I calculator + Track 1 DSCR + golden vector | 20 |
| **2** | Track 1 IO + Track 2 DSCR + PITIA assembly | 15 |
| **3** | Evidence Vault schema + SHA-256 hashing | 10 |
| **4** | Evidence Vault CRUD + staleness detection | 10 |
| **5** | Lender matrix schema + eligibility engine | 20 |
| **6** | PPP rules (PA, OH, MN, NJ, NY, CA, FL, WA) | 15 |
| **7** | Tax engine (OBBBA, §1250, QBI, QOZ) | 12 |
| **8** | FastAPI gateway + integration tests + docs | 20 |

**Total: 122 tests, 91% coverage target**

---

## 10. Gate Criteria (Phase 1 → Phase 2)

| Criterion | Target | Verification |
|-----------|--------|--------------|
| Tests passing | 122/122 | `pytest` |
| Coverage | ≥91% | `pytest --cov` |
| Lint | Clean | `ruff check` |
| Format | Clean | `ruff format --check` |
| Security | Clean | No eval/exec/secrets |
| Debug code | Clean | No print(DEBUG)/breakpoint |
| Documentation | Present | README.md |
| Golden vector | Exact | P&I $2,120.6517, PITIA $2,853.9850, T1 DSCR 1.0512 |

---

*Phase 1 builds the foundation. Nothing else works without this.*
