---
type: code
slice: 1
status: drafted
confidence: 3
title: dscr-core
summary: Deterministic math core for the DSCR Sovereign OS.
entities:
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/fannie-mae
  - lender/newfi
  - lender/pennymac
  - math/copula
  - math/vine-copula
  - ml/shap
  - ml/timesfm
  - slice/1
  - topic/2-4-unit
  - topic/multifamily
  - topic/str
tags:
  - topic/ic-memo
  - topic/insurance
  - topic/llpa
  - topic/monte-carlo
  - topic/tax
  - type/audit
source: DSCR_SOVEREIGN_OS/packages/dscr-core/README.md
vaulted_at: 2026-06-20
---
# dscr-core

Deterministic math core for the DSCR Sovereign OS.

Slice 1 of the build. **No ML, no DB, no API — just auditable math with locked golden-vector tests.**

## What's inside

```
src/dscr_core/
├── payment.py     — payment_factor, pi, pitia, piti (P&I + T + I)
├── dscr.py        — dscr_track1, dscr_track2, dual_track, qualifying_rent
├── leverage.py    — deal_break_rate (brentq), max_purchase_price (bisection)
└── __init__.py    — public API re-exports

tests/
├── golden_vectors.json  — pinned canonical test inputs/outputs
├── test_payment.py      — payment math (3 verified rate points)
├── test_dscr.py         — Track 1, Track 2, dual-track with golden vectors
└── test_leverage.py     — deal_break_rate, max_purchase_price
```

## Canonical golden vector (locked)

Per Sovereign Master v11.0 — internally consistent, mathematically verified:

| Input | Value |
|---|---|
| Property value | $425,000 |
| Loan (75% LTV) | $318,750 |
| Rate | 7.00% |
| Term | 360 months |
| Monthly rent | $3,000 |
| Annual property tax | $5,000 |
| Annual insurance | $2,000 |
| Monthly HOA | $150 |

**Outputs:**
- P&I: $2,120.6517 (rounds to $2,121)
- PITIA: $2,853.9850 (rounds to $2,854)
- Track 1 DSCR: 1.0512x (rounds to 1.05)
- Track 2 DSCR (75% occ, no mgmt/maint): 0.7884x

## Why this slice exists

Every downstream system — TimesFM, Monte Carlo stress, R-vine copula, LLPA pricing, approval predictor, IC memo generator — calls into this math. If `pi()` is wrong by $1, the LLM-generated memo will be wrong by $1, the SHAP explanation will lie, and the regulator-facing model card will fail audit.

These tests are the spine.

## Primary-source fact-check (verified 2026-06-18)

The golden vector and core formulas were verified against external authoritative sources, not just internal Sovereign Master consistency:

| Formula | Sources confirming | Result |
|---|---|---|
| `DSCR = rent / PITIA` | Pennymac, Newfi, theLender, Coldesina, Lendmire | 5/5 confirmed |
| `PITIA = P&I + 1/12 tax + 1/12 ins + HOA` | Pennymac, Newfi | confirmed |
| `Qualifying rent = min(lease, 1007/1025)` | Pennymac DSCR Product Profile 6.12.26 | confirmed |
| `payment_factor(7.00, 360) = 0.0066530` | Textbook $100K/10%/30yr = $877.57 ✓ | confirmed |
| `Fannie Form 1007 25% vacancy rule` | Fannie Mae SG §B3-3.8-01 (10/08/2025) | confirmed — applies to DTI qualification, NOT DSCR ratio |

**Critical finding**: Track 1 (rent/PITIA, no vacancy) **is** the lender's actual DSCR formula per all 5 sources. Track 2 (with vacancy) is a **stress overlay beyond lender requirement**, useful for IC memo risk analysis but not the actual qualification threshold. Fannie Mae's 25% vacancy rule applies to DTI income qualification, not to the DSCR ratio itself.

The `DSCR Forumals.md` claim of $1,999 P&I / DSCR 1.16 was **rejected** as mathematically inconsistent (true DSCR = 1.098, not 1.16).

## Running the tests

```bash
cd packages/dscr-core
uv sync --extra dev
uv run pytest -v
```

## Design rules (from Sovereign Master)

1. **Round DSCR to 2 decimal places. NEVER round up.**
2. **Track 1 and Track 2 are NEVER blended** — both surface, user decides.
3. **Qualifying rent = `min(lease_rent, appraisal_rent)`** — no vacancy adjustment on Track 1.
4. **Track 2 = `(gross × (1 - vacancy) - mgmt - maint) / PITIA`**
5. **Multifamily (2-4 unit): apply 25% vacancy factor per Fannie Mae Form 1007.**
6. **For 5+ unit: use commercial/multifamily DSCR rules, separate track.**

## Source provenance

All golden vectors trace back to:
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` (v11.0)
- `Master DSCR Knowledge Document.md`
- `Master DSCR Knowledge Synthesis.md` (cross-validated)

The `$1,999 P&I / DSCR 1.16` vector in `DSCR Forumals.md` was rejected after disambiguation: it is mathematically inconsistent at the documented inputs (true DSCR at $300K loan is 1.098, not 1.16).