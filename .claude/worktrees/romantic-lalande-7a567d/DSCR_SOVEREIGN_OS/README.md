---
type: code
status: drafted
confidence: 3
title: DSCR Sovereign OS
summary: Monorepo for the DSCR Sovereign OS — the institutional-grade credit decision engine
entities:
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/fred
  - data/zillow
  - math/copula
  - math/vine-copula
  - ml/shap
  - ml/timesfm
  - ml/xgboost
  - slice/1
  - topic/non-qm
  - topic/str
tags:
  - ml/xgboost
  - topic/architecture
  - topic/ic-memo
  - topic/llpa
  - topic/monte-carlo
  - topic/ppp
  - type/audit
source: DSCR_SOVEREIGN_OS/README.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS

Monorepo for the DSCR Sovereign OS — the institutional-grade credit decision engine
for Non-QM DSCR (Debt Service Coverage Ratio) wholesale lending.

**Location:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\DSCR_SOVEREIGN_OS\`
(sibling of the research corpus, NOT on E:\ — that's reserved for creative projects
like the_dead_beat, half_evil, ART_PRINT, MUSIC PROD IMAGES, Christian_surrealism).

> **Mission:** Build the most accurate, defensible, and audit-ready DSCR credit
> decisioning system in the U.S. Non-QM market. By 2028, originate $5B+ annually
> via direct-to-broker wholesale channel.

## Architecture

```
DSCR_SOVEREIGN_OS/
├── packages/
│   └── dscr-core/         # Slice 1 — deterministic math core (Python, zero deps)
├── .github/
│   └── workflows/         # CI pipelines
└── README.md              # you are here
```

### Slice plan (from the master blueprint)

| Slice | Status | Description |
|---|---|---|
| **1 — dscr-core** | **DONE** | Deterministic math: payment_factor, pi, pitia, dual-track DSCR, deal_break_rate, max_purchase_price. Locked golden-vector tests. |
| 2 — evidence-vault | pending | PostgreSQL + JSONB. SHA-256 evidence hashing, provenance tiers, confidence decay. |
| 3 — vendor-normalization | pending | FRED/Zillow/Ocrolus/Optimal Blue/RentCast adapters with canonical schemas. |
| 4 — state-ppp-engine | pending | 50-state PPP branching gate (PA $329,411, OH §1343.011, NJ LLC HIGH-RISK, etc.). |
| 5 — timesfm-engine | pending | TimesFM 2.5 ICF mode + R-vine copula Monte Carlo + distributional DSCR JSON. |
| 6 — approval-predictor | pending | XGBoost with 9 canonical features + SHAP explanations + adverse-action reasons. |
| 7 — ic-memo-generator | pending | ReportLab IC memos with provenance + tier labels (never approval %). |
| 8 — broker-portal | pending | Next.js 16 + React 19 + TanStack Table + RHF/Zod. |

## Slice 1: dscr-core

The deterministic math spine. Every downstream system (TimesFM, MC stress, R-vine,
LLPA, IC memo) calls into this. If `pi()` is wrong by $1, the LLM-generated memo
will be wrong by $1, the SHAP explanation will lie, and the regulator-facing model
card will fail audit. These tests are the spine.

**69 tests passing. 89% coverage. Zero runtime dependencies. ~3ms per full deal.**

### Canonical golden vector (locked)

```python
from dscr_core import pi, pitia, dscr_track1, dscr_track2, dual_track

loan = 318750       # $425K property @ 75% LTV
rate = 7.00         # 7.00% 30yr fixed
pi_val = pi(loan, rate)                # → $2,120.6517
pitia_val = pitia(pi_val, 5000, 2000, 150)  # → $2,853.9850
t1 = dscr_track1(3000, pitia_val)      # → 1.0512 (passes at 1.0+ threshold)
t2 = dscr_track2(3000, 0.25, 0, 0, pitia_val)  # → 0.7884 (fails, the "TRAP")
result = dual_track(3000, 3000, 3000, 0.25, 0, 0, pitia_val)
# → decision = TrackDecision.TRAP
```

### Running

```bash
cd packages/dscr-core
uv sync --extra dev
uv run pytest -v           # 69 tests, ~0.3s
uv run pytest --cov=dscr_core   # 89% coverage
uv run ruff check src tests    # clean
```

## Source provenance

Every golden vector traces back to the research corpus in
`C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\`:
- Sovereign Master v11.0 (`THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`)
- Master DSCR Knowledge (`Master DSCR Knowledge Document.md`)
- Cross-validated Synthesis (`DSCR Intelligence System - Complete Master Knowledge Synthesis.md`)

The `$1,999 P&I / DSCR 1.16` vector in `DSCR Forumals.md` was rejected after
disambiguation: mathematically inconsistent at documented inputs.

## License

Proprietary. Internal use only.