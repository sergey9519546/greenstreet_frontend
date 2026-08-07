---
type: synthesis
status: drafted
title: "Thread Q: Tier 4 v1 Product Spec 2026 Q2"
summary: "Tier 4 v1 product spec — awaiting user approval on feature list + tech stack + $200-400K eng budget."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread Q — Tier 4 v1 Product Specification

**Date:** 2026-06-21
**Author:** Mavis (research-mode, no code)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_Q_Tier4_v1_Product_Spec_2026Q2.md`

---

## 0. Why this thread exists

Per Thread N audit: "No Tier 4 v1 product — only design (Threads B, K, M)". This thread produces a concrete Tier 4 v1 product spec: features, personas, MVP scope, tech stack, user stories, success metrics. Synthesis of Threads B (architecture), E (AI/ML), F (licensing), G (LOS), I + L (pilots), K (Insula), M (pricing).

**Product name (working):** **DSCR Sovereign OS — Tier 4 Portfolio Analytics Module**
**Target launch:** Q4 2026 (after Dec 15, 2026 HOEPA 2027 + 90-day pilot completion)
**Pricing model:** Per Thread M (Starter $15K / Pro $30K / Enterprise $50K-$100K)

## 1. Product vision (one paragraph)

**The DSCR Sovereign OS — Tier 4 Portfolio Analytics Module** is a SaaS platform that gives non-QM/DSCR lenders and brokers a portfolio-native underwriting + risk analytics engine for investment property loans. Unlike Scienaptic AI or Zest AI (which treat each loan as a single underwriting decision), Tier 4 handles DSCR loans as **portfolio positions** with cross-collateral, cross-default, sponsor concentration, and Brinson-Fachler fixed-income decomposition. It ships with MRM documentation per OCC 2026-13 / SR 26-2 framework and adverse action reason codes per Reg B §1002.9(b)(2) — meaning customers can deploy in production with bank-channel audit readiness from day 1.

## 2. User personas

### Persona 1: Wholesale broker (50-300 DSCR loans/yr)

- **Name:** "Mid-size broker" (e.g., a 10-LO wholesale shop focused on DSCR)
- **Pain:** Manual underwriting of 10+ property portfolios takes 2-3 weeks; no cross-property concentration view; no MRM documentation for bank partners
- **Jobs-to-be-done:**
  - Underwrite 10-property portfolio in <1 day (vs 2-3 weeks)
  - Generate ECOA-compliant adverse action letters
  - Share portfolio summary with sponsor + bank partner
- **Wins:** Faster underwriting, bank-audit-ready docs, sponsor retention
- **Tier fit:** Starter ($15K/yr, 200 loans/yr cap) or Pro ($30K/yr, 1,000 loans/yr cap)

### Persona 2: Non-QM lender (500-5,000 DSCR loans/yr)

- **Name:** "Mid-market non-QM lender" (e.g., Angel Oak, Newfi, LoanStream)
- **Pain:** Per-loan underwriting doesn't scale; cross-collateral programs need custom analytics; bank channel demands MRM documentation
- **Jobs-to-be-done:**
  - Process 50-100 portfolio submissions per month
  - Track portfolio-level performance (concentration, delinquency, exception management)
  - Provide bank channel with MRM docs per SR 26-2
- **Wins:** Scale portfolio underwriting 5x, regulatory compliance, bank channel expansion
- **Tier fit:** Pro ($30K/yr, 1,000 loans/yr cap) or Enterprise ($50K-$100K, unlimited)

### Persona 3: Sponsor group / portfolio investor (50-500 properties)

- **Name:** "Real estate sponsor" managing 50-500 rental properties via multiple non-QM lenders
- **Pain:** No consolidated portfolio view; each lender sees only their loans; sponsor can't optimize refinance / sale timing across portfolio
- **Jobs-to-be-done:**
  - Consolidated portfolio view across all lenders
  - Refinance optimization (which property to refi first based on rate environment + DSCR trend)
  - Brinson-Fachler attribution (which properties are driving returns)
  - Sale timing optimization
- **Wins:** Optimized refinance sequencing, consolidated view, return attribution
- **Tier fit:** Enterprise ($50K-$100K/yr, white-glove)

### Persona 4: Bank / capital markets buyer (billion+ in CRE)

- **Name:** "Bank portfolio manager" or "CMBS investor" evaluating non-QM/DSCR loan pools
- **Pain:** Diligence on DSCR pools is manual; MRM documentation from originators is inconsistent
- **Jobs-to-be-done:**
  - Evaluate pool performance vs benchmark
  - Verify MRM documentation per SR 26-2
  - Stress test portfolio-level concentrations
- **Wins:** Faster due diligence, regulatory compliance, accurate risk assessment
- **Tier fit:** Enterprise + custom (data feed, not full platform)

## 3. Core features (v1 vs v1.1 vs v2)

### Tier 4 v1 (Q4 2026 launch) — MVP

**Required for launch (must-haves):**

| # | Feature | Description | Underlying tech |
|---|---|---|---|
| 1 | **Portfolio DSCR analytics** | Cross-property DSCR aggregation, stress test, concentration analysis | Modified Dietz + HHI + EPFL Contagion (per Thread B) |
| 2 | **Per-property decisioning** | XGBoost + SHAP with Reg B §1002.9(b)(2) reason code mapping | XGBoost + SHAP (per Thread E) |
| 3 | **Adverse action automation** | Generate Reg B compliant adverse action letters in <1 min | Reason code mapper (per Thread E) |
| 4 | **MRM documentation** | Auto-generated SR 26-2 / OCC 2026-13 docs for each model version | Template generator (per Thread E) |
| 5 | **LendingPad LOS integration** | One-way data flow from LendingPad into Tier 4 | REST API (per Thread G) |
| 6 | **Pricing engine integration** | Optimal Blue or Lender Price rate sheet ingestion | REST API (per Build-vs-Buy v2) |
| 7 | **Brinson-Fachler attribution** | Portfolio-level return decomposition (rate effect, selection effect, interaction) | 30-50 lines in portfolio_aggregation_model.py |
| 8 | **Portfolio dashboard** | Web UI for portfolio view (loans, concentrations, performance, alerts) | React + Recharts/Plotly |
| 9 | **User management** | Multi-tenant, role-based access (underwriter, manager, admin) | Keycloak (per Build-vs-Buy v2) |
| 10 | **Audit log** | All decisions logged, queryable, exportable | PostgreSQL + S3 |

**Nice-to-have for v1 (ship if time permits):**

| # | Feature | Description |
|---|---|---|
| 11 | **Bank channel exports** | Custom export formats for different bank partners (Wells Fargo, JP Morgan, etc.) |
| 12 | **SMS/email alerts** | Concentration breaches, delinquency spikes, rate changes |
| 13 | **Mobile app** | Read-only portfolio view (PWA, not native) |

### Tier 4 v1.1 (Q1-Q2 2027) — Polish + new personas

| # | Feature | Description |
|---|---|---|
| 14 | **Sponsor consolidated view** | Multi-lender portfolio aggregation for sponsor persona |
| 15 | **Refinance optimization** | Suggest optimal refinance sequencing across portfolio |
| 16 | **Sale timing model** | Recommend hold vs sell based on DSCR + market trends |
| 17 | **Custom integrations** | Salesforce, HubSpot, Monday.com for broker workflow |
| 18 | **Multi-language** | Spanish (CA/TX broker market) |
| 19 | **API for third parties** | Public REST API for partner integrations |

### Tier 4 v2 (Q3-Q4 2027) — Scale + new markets

| # | Feature | Description |
|---|---|---|
| 20 | **Multifamily / 5+ unit support** | Trepp T-ALLR integration for larger CRE |
| 21 | **Construction / construction-to-perm** | Construction draw + lease-up tracking |
| 22 | **Predictive default modeling** | XGBoost v2 with 12-month outcome data |
| 23 | **Investor reporting** | Brinson-Fachler-driven investor statements |
| 24 | **Marketplace** | Third-party add-ons (Title, Insurance, Tax) |
| 25 | **International expansion** | Canadian non-QM (similar product) |

## 4. User stories (v1 MVP)

### Story 1: Broker submits portfolio for underwriting

```
As a wholesale broker (Maria)
I want to submit a 10-property DSCR portfolio for Tier 4 underwriting
So that I can get an approve/decline decision + adverse action reason codes within 1 hour

Acceptance criteria:
- Maria uploads property data via Tier 4 UI (or via LendingPad push)
- Tier 4 ingests data, runs XGBoost per-property + Brinson-Fachler portfolio
- Returns: portfolio-level approve/refer/decline, per-property decisions + reason codes
- Maria downloads adverse action letter PDF per declined property
- All decisions logged for MRM documentation
```

### Story 2: Lender reviews portfolio risk

```
As a non-QM lender underwriter (James)
I want to see a portfolio's concentration, DSCR distribution, and stress test
So that I can approve the cross-collateral structure

Acceptance criteria:
- James views dashboard: 10-property portfolio
- HHI concentration score: 0.18 (mod concentration)
- DSCR distribution: median 1.45, p10 1.10, p25 1.25
- Stress test: rates +200bps → portfolio DSCR drops to 1.20 (still healthy)
- EPFL Contagion: low correlation across properties (good)
- James approves + exports MRM doc for bank channel
```

### Story 3: Bank partner receives MRM documentation

```
As a bank partner (Karen at Wells Fargo)
I want to receive SR 26-2 / OCC 2026-13 compliant MRM documentation
So that I can include this DSCR pool in my quarterly bank audit

Acceptance criteria:
- Karen receives auto-generated MRM PDF per deal
- Contains: model version, training data, validation metrics, fairness audit
- Per OCC 2026-13: includes vendor model governance section
- Karen can verify all claims against primary source citations
```

### Story 4: Sponsor reviews portfolio performance

```
As a sponsor (David) managing 50 properties across 3 lenders
I want a consolidated portfolio view + Brinson-Fachler attribution
So that I can decide which 5 properties to refinance first

Acceptance criteria:
- David connects 3 lender accounts via Tier 4 sponsor view
- Consolidated dashboard: 50 properties, $12M total debt
- Brinson-Fachler: rate effect +2.3%, selection effect +1.1%, interaction -0.3% → portfolio alpha +3.1%
- Refinance optimizer: recommends top 5 properties based on DSCR trend + rate savings
- David clicks property → drill-down to per-loan detail
```

## 5. Tech stack (recommended)

### Application layer
- **Backend:** Python 3.12 + FastAPI (Type hints; fast; good async)
- **Frontend:** React 18 + TypeScript + Vite
- **UI library:** shadcn/ui + Tailwind (per OSS-first mandate)
- **Charts:** Recharts or Plotly (OSS)
- **API:** REST + OpenAPI spec; gRPC for internal service-to-service

### Data layer
- **OLTP:** PostgreSQL 16 (multi-tenant with row-level security)
- **OLAP:** ClickHouse or Apache Druid (for portfolio analytics at scale)
- **Cache:** Redis 7
- **Search:** OpenSearch (per Build-vs-Buy v2)
- **Object storage:** Cloudflare R2 (per Thread F replacement plan) or MinIO

### ML layer
- **Training:** XGBoost 2.x + LightGBM + scikit-learn (per Thread E)
- **Explainability:** SHAP 0.44+ (per Thread E)
- **Model serving:** BentoML or Ray Serve
- **Pipeline orchestration:** Apache Airflow (per Build-vs-Buy v2)

### Infrastructure layer
- **Cloud:** AWS (preferred) or GCP (both have free-tier options)
- **Containers:** Docker + Kubernetes (EKS or GKE)
- **CI/CD:** GitHub Actions + ArgoCD
- **IaC:** Terraform
- **Observability:** Grafana + Prometheus + Loki (per Build-vs-Buy v2)
- **Auth:** Keycloak (Apache 2.0, per Build-vs-Buy v2)

### Compliance / audit layer
- **MRM docs:** Auto-generated PDF from model metadata + validation results
- **Audit log:** PostgreSQL with append-only triggers; exportable to S3 (immutable)
- **Bias audit:** Aequitas (MIT, per Thread F) for demographic parity, equal opportunity
- **Explainability docs:** SHAP summary plots auto-generated

## 6. Data model (v1 MVP — core tables)

```sql
-- Tenants (multi-tenant SaaS)
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,  -- starter, pro, enterprise
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settings JSONB
);

-- Users (per tenant)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,  -- underwriter, manager, admin
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolios (per sponsor; aggregated view of loans)
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  sponsor_id UUID,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loans (DSCR loans; the atomic unit)
CREATE TABLE loans (
  id UUID PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id),
  originated_date DATE NOT NULL,
  loan_amount NUMERIC NOT NULL,
  ltv NUMERIC NOT NULL,
  dscr NUMERIC NOT NULL,  -- Debt Service Coverage Ratio at origination
  fico INT,
  property_type TEXT,
  msa TEXT,
  rate NUMERIC NOT NULL,
  amort_term_months INT,
  loan_term_months INT,
  lender_id UUID,
  performance_status TEXT,  -- current, 30_dpd, 60_dpd, foreclosure, paid_off
  performance_updated_at TIMESTAMPTZ
);

-- Properties (1-4 unit details)
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  loan_id UUID REFERENCES loans(id),
  address_hash TEXT,  -- hashed for privacy
  msa TEXT,
  zip TEXT,
  year_built INT,
  square_feet INT,
  estimated_rent NUMERIC
);

-- Decisions (audit trail)
CREATE TABLE decisions (
  id UUID PRIMARY KEY,
  loan_id UUID REFERENCES loans(id),
  decision TEXT NOT NULL,  -- approve, refer, decline
  probability_of_default NUMERIC,
  shap_values JSONB,
  reason_codes TEXT[],  -- Reg B §1002.9(b)(2) categories
  model_version TEXT NOT NULL,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_by UUID REFERENCES users(id)
);

-- Audit log (append-only)
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 7. Success metrics (v1 launch)

| Metric | Target | Measurement |
|---|---|---|
| **Pilot broker conversion** | 30% of 5 pilots convert to paid (1.5) | Pilot broker reporting (per Thread L) |
| **Year 1 ARR** | $250K-$400K realistic, $455K stretch | Per Thread M |
| **Decision latency** | <5 min for 10-property portfolio (vs 2-3 weeks manual) | Platform telemetry |
| **Adverse action accuracy** | 90%+ vs manual underwriter review | Quarterly audit |
| **MRM documentation** | 100% of decisions have MRM docs auto-generated | Platform telemetry |
| **Bank partner acceptance** | 3+ bank partners accept MRM docs without rework | Partner reporting |
| **NPS** | 40+ | Quarterly survey |
| **Renewal intent** | 70%+ | Quarterly QBR |
| **Uptime** | 99.5%+ | Platform telemetry |
| **MRM regulatory compliance** | 100% of decisions per SR 26-2 / OCC 2026-13 | Dscr-verifier quarterly audit |

## 8. Open questions for user

1. **Approve v1 feature list (10 must-haves + 3 nice-to-haves)?** (per §3)
2. **Approve tech stack?** (per §5)
3. **Approve data model?** (per §6)
4. **Approve pilot pilot first → v1.0 release sequence?** (3-month pilot + iterate → v1.0 in Q4 2026)
5. **Approve $200-400K eng budget for v1 build?** (per Thread E POC estimate; full v1 may be higher)
6. **Approve hiring plan?** (1 backend eng, 1 frontend eng, 1 ML eng, 0.25 FTE PM for v1 build, ~3-4 FTE for 6 months)

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| POC data limitations limit model accuracy (per Thread E) | HIGH | MEDIUM | Position v1 as research artifact, not production; bank data accumulation closes gap |
| Pilot brokers don't convert (per Thread L) | MEDIUM | HIGH | Aggressive outreach (5 → 10 → 15 brokers); fall back to Insula Enterprise deal |
| LOS integration complexity (LendingPad + others) | HIGH | MEDIUM | Build per-LOS adapters; start with LendingPad only in v1 |
| MRM documentation gaps (per Thread E §6) | MEDIUM | HIGH | Dscr-verifier quarterly audit; iterate per regulator feedback |
| Multi-tenant security breach | LOW | CATASTROPHIC | Keycloak + row-level security; quarterly pen test |
| Tech stack mismatch (e.g., ClickHouse vs Druid) | MEDIUM | LOW | Defer OLAP choice to Q3 2026; PostgreSQL-only for v1 |
| Hire delays (3-4 FTE) | MEDIUM | MEDIUM | Use existing team; contract for ML; defer some nice-to-haves |

## 10. Sources cited

**Architecture + design (prior research):**
- Thread B — Tier 4 Portfolio Architecture (Modified Dietz, Brinson-Fachler, EPFL Contagion)
- Thread E — AI/ML Production Reality Audit (XGBoost + SHAP, MRM, adverse action)
- Thread F — AGPL-3.0 Tier 4 SaaS Exposure (clean licensing strategy)
- Thread G — LendingPad vs Encompass DSCR Deep-Dive (LOS integration)
- Thread I — Pilot Broker Profile + Wholesale Channel (Persona 1 + 2)
- Thread K — Insula Sales Call Prep (Persona 2 + 3 anchor; Tier 4 design space)
- Thread M — Tier 4 v1 SaaS Pricing Model (3-tier, per-loan use fees)
- Thread P — DSCR Data Acquisition (Channels 1-6, Year 1 acquisition cost)
- Thread N — Work Audit + 20-Step Plan (Tier 4 v1 product gap)
- Build_vs_Buy_API_Dataset_Replacements_v2_2026Q2.md (Tier 1+2+3+cross-cutting, OSS alternatives)
- Tier 4 Deep-Dive (Insula, Argyle, Brinson-Fachler 5 sub-deliverables)

**Industry context (this thread's research):**
- Insula Capital Group Jun 11, 2026 portfolio-DSCR launch: https://www.prweb.com/releases/insula-capital-group-introduces-portfolio-level-dscr-financing-for-scalable-rental-investors-in-2026-302796381.html
- Timvero on AI lending transformation: https://timvero.com/blog/how-ai-and-automation-are-transforming-lending
- C-REITs smart rating system (3-model consensus): https://stock.stockstar.com/JC2026041400038311.shtml
- Federal Reserve 2026 Stress Test Credit Risk Models: https://www.federalreserve.gov/supervisionreg/files/credit-risk-models.pdf
- RiskSpan Non-QM credit model: https://riskspan.com/category/blog/
- InvestmentPropertyLoanExchange DSCR rates May 2026: https://investmentpropertyloanexchange.com/everything-investors-are-asking-about-dscr-loan-rates-requirements-how-they-work-may-2026
- Mortgage News Daily 2026 non-QM growth: https://www.mortgagenewsdaily.com/opinion/pipelinepress-12012025

**v0.5.5 + corpus:**
- v0.5.5 §1071 ship (508/508 tests pass)
- Sprint 6 XGBoost ML Layer (per corpus)
- Sprint 3 Lender Intelligence (reserves overlays, broker comp)
- compliance.py v0.5.5 + portfolio_aggregation_model.py

---

**End of Thread Q. Linked threads: All Threads A-P; Master Plan v11.1; v0.5.5 ship; Build-vs-Buy v1+v2; Tier 4 Deep-Dive.**