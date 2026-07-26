# DSCR Loan Office — DSCR Sovereign OS / 20X DSCR Deal Engine

> **Unified monorepo** for the DSCR (Debt Service Coverage Ratio) underwriting engine, compliance stack, and Greenstreet Finance frontend.

## 🏗️ Architecture

```
DSCR_LOAN_OFFICE/
├── apps/
│   └── web/                    # Greenstreet Frontend (React 19 + Vite 6 + TypeScript + Tailwind v4)
│       └── src/engine/         # TypeScript DSCR engine (110+ modules)
├── packages/
│   ├── dscr-core/              # Python core engine (calculator, lender_matrix, tax_engine, ppp_rules)
│   ├── evidence-vault/         # Python asyncpg evidence vault with staleness tracking
│   └── api/                    # FastAPI gateway (5 endpoints)
├── data/
│   ├── raw/                    # Canonical dataset lake (660 MB, immutable)
│   │   ├── hmda/               # HMDA 2023 (CA, FL, TX cashout refi)
│   │   ├── fhfa/               # FHFA NMDB + HPI
│   │   ├── zillow/             # ZHVI, ZORI, DOZ pending
│   │   ├── treasury_fio/       # Homeowners insurance (national + CA/FL filtered)
│   │   ├── inside_airbnb/      # Listings for major CA/FL cities
│   │   ├── fema/               # NFIP redacted claims (national + CA/FL)
│   │   ├── realtor/            # RDC inventory metrics (national + CA/FL)
│   │   ├── california/         # CA-specific: census, HUD SAFMR, state open data
│   │   ├── florida/            # FL-specific: census, HUD SAFMR, OIR landing
│   │   └── loan_performance/   # Fannie Mae, Freddie Mac, academic replication
│   └── processed/              # Derived engine data (rebuildable)
│       └── dscr_engine.db      # SQLite testbed database
├── docs/
│   ├── architecture/           # System design, ADRs
│   ├── api/                    # API reference
│   ├── knowledge-graph/        # Graphify wiki (261 communities, 4003 nodes)
│   ├── research/               # Consolidated research vault
│   │   ├── sprints/            # Sprint 0-6 research execution
│   │   ├── deep-dives/         # Topic-specific deep dives
│   │   ├── specs/              # Master specifications (AEGIS, Sovereign OS)
│   │   └── analysis/           # Algorithm findings (CA-DSCR, DPS)
│   ├── compliance/             # Regulatory compliance (Reg B/ECOA, TILA/Reg Z, HOEPA)
│   ├── guides/                 # Setup, development, deployment
│   └── MOCs/                   # Maps of Content (Obsidian knowledge maps)
├── scripts/                    # Build, analysis, validation, migration tooling
├── tools/                      # Internal tooling
└── .github/workflows/          # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20
- Python ≥ 3.11
- `uv` (Python package manager)
- `npm` ≥ 10

### Install Dependencies
```bash
# Node workspace
npm install

# Python workspace
uv sync --all-packages
```

### Development
```bash
# Start all dev servers (Turborepo)
npm run dev

# Or individually:
cd apps/web && npm run dev          # Frontend on :5173
cd packages/api && uvicorn main:app --reload  # API on :8000
```

### Build
```bash
npm run build
```

### Test
```bash
# All tests
npm run test

# Python packages
cd packages/dscr-core && pytest -v
cd packages/evidence-vault && pytest -v

# Frontend
cd apps/web && npm run test
```

### Knowledge Graph
```bash
# Rebuild graphify knowledge graph
npm run graphify:rebuild
```

## 📦 Package Details

### `apps/web` — Greenstreet Frontend
- **Stack**: React 19, Vite 6, TypeScript 5.5, Tailwind CSS v4
- **Engine**: 110+ TypeScript modules in `src/engine/`
- **Features**: Dual-track DSCR, Monte Carlo, ARM reset, tax engine, lender matching, sensitivity analysis
- **Deploy**: Vercel / Firebase

### `packages/dscr-core` — Python Core Engine
- **Modules**: `calculator.py`, `lender_matrix.py`, `tax_engine.py`, `ppp_rules.py`
- **Tests**: 96 tests (ts10: 21, Monte Carlo: 37, ARM: 5, bridges: 33)
- **Key calibrations**: GARCH ω=0.000015, insurance FL=4%, calibration slope=+0.03892

### `packages/evidence-vault` — Evidence Vault
- **Storage**: PostgreSQL (asyncpg)
- **Features**: CRUD, staleness tracking, TTL, hash verification
- **Migrations**: Alembic

### `packages/api` — FastAPI Gateway
- **Endpoints**: 5 endpoints for underwriting, scoring, lender matching
- **Integration**: Bridges TypeScript frontend ↔ Python core engine

## 📊 Data Pipeline

```
Raw Data (data/raw/) → Processing Scripts (scripts/) → Processed Data (data/processed/)
                                      ↓
                              dscr_engine.db (SQLite testbed)
                                      ↓
                              Python Engine (packages/dscr-core)
                                      ↓
                              TypeScript Engine (apps/web/src/engine/)
                                      ↓
                              Frontend UI (apps/web)
```

## 🧪 Test Coverage

| Package | Tests | Coverage |
|---------|-------|----------|
| dscr-core | 96 | Core math, Monte Carlo, ARM, compliance |
| evidence-vault | ~30 | CRUD, staleness, migrations |
| web (engine) | ~100 | Unit + integration |

## 📚 Documentation

- **Architecture**: `docs/architecture/`
- **API Reference**: `docs/api/`
- **Knowledge Graph**: `docs/knowledge-graph/` (run `npm run graphify:rebuild`)
- **Research**: `docs/research/` (Sprints 0-6, specs, deep-dives)
- **Compliance**: `docs/compliance/` (Reg B/ECOA, TILA/Reg Z, HOEPA, 50-state PPP)
- **Guides**: `docs/guides/`
- **MOCs**: `docs/MOCs/` (Obsidian knowledge maps)

## 🔐 Compliance

All regulatory claims **MUST** be cross-checked against primary sources before shipping:
- Reg B / ECOA (12 CFR 1002)
- TILA / Reg Z (12 CFR 1026)
- HOEPA / Dodd-Frank thresholds
- 50-state PPP matrix
- MN HF 3437 (effective Aug 1, 2026)

**Verifier-on-ship is non-negotiable** — see `AGENTS.md` for workflow.

## 🔑 Key Calibrations (Production)

| Parameter | Value | Source |
|-----------|-------|--------|
| GARCH ω | 0.000015 | Sprint 2 validation |
| FL Insurance Rate | 4% (NOT 12%) | Treasury FIO calibration |
| Calibration Slope | +0.03892 | v16 regression |
| 10Y Treasury (Jun 2026) | 4.43% | FRED |
| PA PPP Threshold (2026) | $329,411 | State statute |
| OH PPP Threshold (2025) | $112,957 | State statute |

## 📝 Project Conventions

- **Canonical root**: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\` (underscore!)
- **Research mode**: Deliverables = research findings, not code promotion
- **v0.5.x code**: Reference only, NOT to be promoted further
- **Agent memory**: `AGENTS.md`, `CLAUDE.md` at root

## 🤝 Contributing

1. Read `AGENTS.md` for operating principles
2. Follow `CLAUDE.md` for code standards
3. Run verifier on compliance changes
4. Update knowledge graph after significant changes: `npm run graphify:rebuild`

---

**Status**: Active development — Greenstreet Frontend is the product; Python packages are verified testbeds.