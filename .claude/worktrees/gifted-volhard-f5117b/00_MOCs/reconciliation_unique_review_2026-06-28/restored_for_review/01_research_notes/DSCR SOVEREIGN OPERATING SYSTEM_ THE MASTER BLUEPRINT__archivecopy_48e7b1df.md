---
type: research
status: drafted
confidence: 3
title: "DSCR SOVEREIGN OPERATING SYSTEM: THE MASTER BLUEPRINT"
summary: "The DSCR Sovereign OS is not a tool; it is a **Graph-Native Financial Intelligence System**. It operates on a **Three-Plane Architecture** that enforces absolute context persistence across the entire investment lifecycle."
entities:
  - concept/arm
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - math/copula
  - math/t-copula
  - tax/bonus-depreciation
  - tax/niit
  - tax/pal
  - topic/str
tags:
  - topic/after-tax
  - topic/architecture
  - topic/default-rate
  - topic/ic-memo
  - topic/monte-carlo
  - topic/ppp
  - topic/reserves
  - topic/stress-test
  - topic/tax
  - type/audit
source: DSCR SOVEREIGN OPERATING SYSTEM_ THE MASTER BLUEPRINT.md
vaulted_at: 2026-06-20
---
# DSCR SOVEREIGN OPERATING SYSTEM: THE MASTER BLUEPRINT

## I. ARCHITECTURAL ONTOLOGY: THE GRAPH-NATIVE SOVEREIGNTY

The DSCR Sovereign OS is not a tool; it is a **Graph-Native Financial Intelligence System**. It operates on a **Three-Plane Architecture** that enforces absolute context persistence across the entire investment lifecycle.

### 1. The Three-Plane Model
| Plane | Definition | Functional Implementation |
|---|---|---|
| **Projection Plane** | The Human-Facing Interface | Context-aware views: Scenario Builder, Lender Matchmaker, After-Tax IRR Studio, IC Memo Command. |
| **Graph Plane** | The Causal Central Nervous System | Nodes (Borrower, Property, Lender, Law, Rate) connected by **Typed Edges** (Qualifies, Conflicts, Supersedes, Shocks). |
| **Ledger Plane** | The Immutable Append-Only Log | Captures every event, mutation, approval, and export. Replaces separate audit trails and version history. |

### 2. The Semantic Diff Engine
The system implements a multi-stage diff process to mitigate "reconciliation noise."
- **Facet-Sensitive Propagation**: Changes are classified into facets (Location, Timing, Budget, Legal).
- **Causal Invalidation**: A structural change (e.g., Vesting: Individual → LLC) triggers a downstream update of the **PPP Legal Branching Gate** without destroying unrelated data.

---

## II. THE DETERMINISTIC "GOLDEN SPINE" (V11.0)

The "Golden Spine" is the system's immutable conscience, enforcing the **Dual-Track Discipline**.

### 1. Dual-Track Math (The Godmode Rule)
- **Track 1: Lender Qualification**: `DSCR = Qualifying_Gross_Rent / PITIA`.
  - *Rule*: Lower of (Lease, 1007 Appraisal). No vacancy haircut for 1-4 unit LTR.
- **Track 2: Investor Survival**: `DSCR = (Gross(1-Vacancy) - Management - Maintenance) / PITIA`.
  - *Rule*: Must force user acknowledgment if Track 2 < 1.0, even if Track 1 passes.

### 2. The Prepayment Penalty (PPP) Branching Gate
Gate branches **BEFORE** any "prohibited" output.
1. **Business-Purpose + Entity-Vested?** → Consumer statutes (MN §58.137, etc.) DON'T apply.
2. **Bank/Depository Lender?** → Stricter rules may apply even to investors.
3. **Individual Vesting?** → Apply the **Consumer-Statute Matrix**.
4. **MN HF 3437 (ENACTED 4/23/2026)**: Explicitly exempts business-purpose DSCR from §58.137 as of August 1, 2026.

### 3. Tax & Reassessment Reality Engine
- **Post-Sale Reassessment**: PITIA must use `Purchase_Price × County_Mill_Rate`. Seller's legacy bill is a "Silent Killer."
- **OBBBA (One Big Beautiful Bill Act)**: Hardcoded **100% Bonus Depreciation** for assets acquired post-Jan 19, 2025.
- **NIIT (Net Investment Income Tax)**: 3.8% surtax on exit proceeds for high-MAGI filers (>$200k/$250k).

---

## III. INSTITUTIONAL ANALYTICS: THE RISK COMMAND CENTER

### 1. All-In Effective Yield (AEY)
Lenders are ranked by **AEY (XIRR)** over the expected hold period, not note rate.
- *Inputs*: Net proceeds, periodic payments, outstanding balance at exit, and the **Correct Penalty Base** (Original Principal vs. Remaining Balance per state law).

### 2. Probabilistic Stress Testing (Monte Carlo)
- **10,000 Trials** using a **t-copula** (captures fat-tail joint downsides; Gaussian copulas are forbidden).
- **Action Triggers**:
  - `P(DSCR < 1.00) > 10%` → **CONDITIONAL-GO**.
  - `P(DSCR < 1.00) > 15%` → **HARD NO-GO**.
  - `5th-Percentile DSCR < 0.80` → **AUTOMATIC FLAG**.

### 3. ARM/SOFR Double-Shock Model
Identifies the **"Kill-Switch Year"**:
- Models the month when IO expires AND the rate resets.
- Recalculates DSCR based on the **Forward SOFR Curve + Margin**.

---

## IV. THE EVIDENCE VAULT: ANTI-DECAY DATA ARCHITECTURE

Guidelines are not records; they are **Evidence Objects** in a PostgreSQL JSONB vault.

### 1. The Provenance Manifest
Every claim must carry:
- `claim`: "Accepts 100% of AirDNA projections."
- `source_url`: Verifiable primary link.
- `verified_date`: June 17, 2026 (or newer).
- `confidence_score`: 0-100 (Tiebreaker only).
- `supersedes_id`: Audit trail to previous versions.

### 2. The "Unspecified" Default
If a metric is missing (e.g., Anchor Loans' FICO floor), the UI renders **"Unspecified / Requires Broker Matrix."** Interpolation is a systemic failure.

---

## V. SOVEREIGN WORKFLOW & REMEDIATION

### 1. The Four-Score System
| Score | Weighting | Hard Caps |
|---|---|---|
| **Lender Qualification** | Eligibility 20, Cushion 25, LTV 20, FICO 15, Reserves 10, Docs 10 | Ineligibility = 0-39 |
| **Pricing Efficiency** | AEY Spread 35, Points 20, PPP 20, Structural Fit 15, Cash 10 | <2 Quotes = N/A |
| **Investor Survival** | NOI DSCR 30, Free Cash Flow 15, Liquidity 15, Stress 25, Reset 15 | DSCR <0.85 = 0-39 |
| **Data Confidence** | Rent 25, Valuation 20, Tax/Ins 15, Fraud 20, Freshness 10, Consistency 10 | Unresolved Conflict = 0-39 |

### 2. Remediation Levers (Ranked by Impact)
1. **Lower Purchase Price** (Strong Positive on both tracks).
2. **Increase Down Payment** (Fastest structural fix).
3. **Rate Buydown** (Effective for modest basis).
4. **Shift Lender Matrix** (Solves Track A, not bad economics).

---

## VI. BUILD SPECIFICATION (PHASED EXECUTION)

### Technology Stack
- **Frontend**: Next.js 16 / React / RHF+Zod / TanStack Table / Recharts.
- **Backend**: Python 3.11+ / FastAPI / SciPy / Celery+Redis.
- **Infrastructure**: Neon Postgres (Graph-Native) + pgvector.

### Implementation Roadmap
- **Phase 1 (Golden Spine)**: Dual-track math, B' (Tax/Reassessment), PPP Branching Gate, 9-Lender Matrix.
- **Phase 2 (Intelligence)**: STR Seasonality, Monte Carlo (t-copula), Fit Scoring, ARM Double-Shock.
- **Phase 3 (Sovereign)**: Live API (RentCast/AirDNA/SOFR), Guideline OCR, Confidence Auto-Decay.

---
**STATUS: MASTER BLUEPRINT V11.0 | DATE: JUNE 17, 2026 | CLASSIFICATION: SOVEREIGN**
