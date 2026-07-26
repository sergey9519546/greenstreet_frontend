# DSCR Intelligence Platform — Complete Technical Architecture Specification

**Date:** March 2026  
**Classification:** Technical Architecture — Production Specification  
**Status:** Authoritative — Derived from verified lender parameters, underwriting formulas, and fintech best practices  
**Companion Documents:** `DSCR_LENDER_PARAMETERS_VERIFIED.md`, `DSCR_UNDERWRITING_FORMULA_DEEP_DIVE.md`, `INNOVATION_MASTER_BLUEPRINT.md`

---

## TABLE OF CONTENTS

1. [Technology Stack Selection](#1-technology-stack-selection)
2. [Database Schema Design](#2-database-schema-design)
3. [API Design](#3-api-design)
4. [DSCR Calculation Engine Architecture](#4-dscr-calculation-engine-architecture)
5. [Real-Time Data Pipeline](#5-real-time-data-pipeline)
6. [Security & Compliance](#6-security--compliance)
7. [Scalability Design](#7-scalability-design)
8. [Development Roadmap](#8-development-roadmap)
9. [Architecture Decision Records](#9-architecture-decision-records)

---

## 1. TECHNOLOGY STACK SELECTION

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Next.js 15 (App Router) + React 19 + Tailwind CSS 4            │
│  shadcn/ui + Recharts + Zustand + React Query                   │
│  Deployed: Vercel (Edge + SSR)                                  │
├─────────────────────────────────────────────────────────────────┤
│                        API GATEWAY                               │
│  Next.js API Routes (Edge Runtime) → rate limiting, auth        │
│  Or: Kong / AWS API Gateway for production scale                │
├─────────────────────────────────────────────────────────────────┤
│                     APPLICATION LAYER                            │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │  DSCR Engine  │  │  Lender Match │  │  Rate Estimation  │    │
│  │  (TypeScript) │  │  (TypeScript)  │  │  (TypeScript)     │    │
│  └──────────────┘  └───────────────┘  └───────────────────┘    │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │  Rules Engine │  │  Sensitivity  │  │  Monte Carlo      │    │
│  │  (TypeScript) │  │  (TypeScript)  │  │  (Python/Cython)  │    │
│  └──────────────┘  └───────────────┘  └───────────────────┘    │
│                                                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │  Fraud Detect │  │  Rent Aggreg  │  │  Behavioral Intel │    │
│  │  (Python)     │  │  (TypeScript)  │  │  (Python)         │    │
│  └──────────────┘  └───────────────┘  └───────────────────┘    │
│                                                                  │
│  Deployed: AWS ECS Fargate (Docker containers)                  │
├─────────────────────────────────────────────────────────────────┤
│                     DATA LAYER                                   │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  PostgreSQL  │  │    Redis     │  │     S3 + CDN       │    │
│  │  (Aurora)    │  │  (ElastiCache)│  │  (CloudFront)      │    │
│  │  Primary DB  │  │  Cache + RT  │  │  Static + Docs     │    │
│  └─────────────┘  └──────────────┘  └────────────────────┘    │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  TimescaleDB │  │   SNS/SQS    │  │   EventBridge      │    │
│  │  Time-series │  │   Queueing   │  │   Event Bus        │    │
│  └─────────────┘  └──────────────┘  └────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                     ML / AI LAYER                                │
│  Python microservices (ECS) + SageMaker endpoints               │
│  scikit-learn, XGBoost, TensorFlow for production models        │
│  MLflow for experiment tracking, model registry                  │
├─────────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE                                 │
│  AWS (us-east-1 primary) · Terraform IaC · GitHub Actions CI/CD│
│  Docker · ECS Fargate · Aurora Serverless · CloudWatch          │
│  WAF · Shield · Secrets Manager · KMS                           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Layer-by-Layer Technology Decisions

#### Frontend: Next.js 15 + React 19 + Tailwind CSS 4

| Decision | Choice | Justification for DSCR Platform |
|----------|--------|---------------------------------|
| **Framework** | Next.js 15 (App Router) | SSR/SSG for SEO (lender pages need indexing); API routes for BFF pattern; edge runtime for <100ms TTFB on rate/lender data |
| **UI Library** | React 19 | Server Components reduce client JS by 40-60%; critical for complex DSCR calculator with 20+ interactive inputs |
| **Styling** | Tailwind CSS 4 | Utility-first speeds development of data-dense financial UIs; design tokens for consistent lender branding |
| **Component Library** | shadcn/ui | Unstyled, accessible, composable — we need custom data tables (lender grids), sliders (LTV/DSCR), and charts; MUI/Ant Design would fight our design system |
| **State Management** | Zustand (client) + React Query (server) | Zustand for calculator form state (lightweight, <1KB); React Query for caching lender data, rent estimates, rate data with stale-while-revalidate |
| **Charts** | Recharts + lightweight D3 for custom | Recharts for standard line/bar/pie; D3 for Monte Carlo distribution plots and sensitivity tornado diagrams |
| **Forms** | React Hook Form + Zod | Complex DSCR input forms (15-25 fields) need performant validation; Zod schemas shared between client and server |
| **Deployment** | Vercel | Zero-config Next.js deployment; edge functions for API routes; ISR for lender pages; preview deploys per PR |

**Why NOT a separate SPA?** The DSCR platform has both public-facing pages (lender directories, educational content that needs SEO) and private app pages (calculator, portfolio). Next.js handles both in one codebase. A pure SPA (Vite/CRA) would require a separate SSR solution for public pages.

**Why NOT Remix?** Remix is excellent but has a smaller ecosystem. For a financial platform, the larger Next.js plugin/library ecosystem (especially around auth, data fetching, and deployment) matters more than theoretical framework elegance.

#### Backend: Dual-Language Architecture (TypeScript + Python)

| Decision | Choice | Justification |
|----------|--------|---------------|
| **Primary API** | TypeScript (Node.js 22) | Type safety shared with frontend; sub-10ms cold start for serverless; excellent JSON handling; the DSCR calculator is formula-heavy arithmetic, not data science — TypeScript handles it perfectly |
| **ML/AI Services** | Python 3.12 | Industry standard for ML; scikit-learn, XGBoost, TensorFlow ecosystem; Monte Carlo simulation with NumPy is 50-100x faster than TypeScript; fraud detection models require Python |
| **Inter-Service** | gRPC (internal) + REST (external) | gRPC for TypeScript↔Python communication (2-5x faster than REST for internal calls); REST for all external APIs |
| **Package Manager** | pnpm (TS) + uv (Python) | pnpm for disk-efficient monorepo; uv for 10-100x faster Python dependency resolution |
| **Runtime** | Node.js 22 (TS) / CPython 3.12 | No Bun in production — maturity concerns for fintech; Node.js 22 has native fetch, test runner, and stable features |

**Why TypeScript for the DSCR Engine (not Python)?**
The core DSCR calculation is: `DSCR = Rent / PITIA` where PITIA = P + I + T + I + A. This is **arithmetic, not data science**. TypeScript advantages:
1. **Sub-millisecond calculation** — no Python startup overhead (critical for <100ms API response)
2. **Shared types with frontend** — Zod schemas validate input on both sides
3. **JSON-native** — no serialization overhead for API request/response
4. **Serverless-friendly** — Node.js cold start ~200ms vs Python ~1-2s on Lambda
5. **Single codebase** — DSCR formulas can be tested identically on client and server

**Why Python for ML/AI services?**
1. **Monte Carlo simulation** — NumPy vectorized operations are 50-100x faster than JS loops for 10,000+ iterations
2. **Fraud detection** — XGBoost/isolation forest models are production-grade only in Python
3. **Lender behavioral modeling** — scikit-learn pipelines with feature engineering
4. **Rent prediction** — TensorFlow/PyTorch for time-series forecasting
5. **Ecosystem** — SHAP for model explainability, MLflow for model management

#### Database: PostgreSQL (Aurora) + Redis + TimescaleDB

| Decision | Choice | Justification |
|----------|--------|---------------|
| **Primary DB** | PostgreSQL 16 (Amazon Aurora Serverless v2) | Relational data (lenders, properties, loans) is inherently tabular; JSONB for flexible lender overlay data; row-level security for multi-tenant; Aurora Serverless auto-scales 0.5-128 ACU |
| **Cache** | Redis 7 (Amazon ElastiCache) | Sub-ms reads for: rate cache (updated every 15min), lender parameter cache, rent estimate cache, session store, real-time WebSocket state |
| **Time-Series** | TimescaleDB (Aurora extension) | Rate history, rent estimate history, DSCR calculation audit trails — all time-series data; continuous aggregates for rolling averages |
| **Search** | PostgreSQL pg_trgm + tsvector | Lender search, property address search — sufficient for MVP; migrate to OpenSearch if needed at scale |
| **Object Storage** | S3 | Lease documents, appraisal PDFs, lender rate sheets; presigned URLs for secure access |
| **Migrations** | Prisma (ORM) + drizzle-kit (migration) | Prisma for type-safe queries; drizzle-kit for production migrations (more reliable than Prisma migrate for production) |

**Why NOT MongoDB?**
DSCR data is highly relational: properties → loans → lenders → overlays. MongoDB would require application-level joins for every lender match query (join lender + overlays + pricing grids + reserve rules). PostgreSQL JOINs handle this in a single query. MongoDB's document model adds no value when the access pattern is "join lender with all their parameters and match against borrower criteria."

**Why Aurora Serverless v2 (not RDS)?**
- Scales to zero during off-hours (cost optimization for early-stage)
- Auto-scales to 128 ACU for peak calculation bursts
- Same PostgreSQL compatibility — no code changes
- Pay-per-use aligns with startup economics

**Why TimescaleDB (not InfluxDB)?**
TimescaleDB is a PostgreSQL extension — same database, same query language, same connection pool. No additional infrastructure. InfluxDB would require a separate cluster, separate query language (Flux/InfluxQL), and data synchronization.

#### Real-Time: WebSockets via Pusher + Server-Sent Events

| Decision | Choice | Justification |
|----------|--------|---------------|
| **Rate Updates** | Server-Sent Events (SSE) | One-way server→client push for rate ticks; simpler than WebSocket; auto-reconnects; works through corporate proxies |
| **Calculator Collaboration** | Pusher Channels | When multiple team members view the same DSCR scenario; presence channels for "who's online"; no custom WebSocket infrastructure |
| **Notifications** | Pusher Beams | Push notifications for: rate alert triggers, lender guideline changes, loan status updates |
| **Why NOT raw WebSockets?** | — | Building reliable WebSocket infrastructure (reconnection, presence, scaling) is 2-4 weeks of engineering; Pusher gives it in 10 lines of code. SSE for simple one-way streaming is native HTTP. |

#### ML/AI Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Fraud Detection** | XGBoost + Isolation Forest (scikit-learn) | Anomaly detection on rent data; ensemble of 4 modules (statistical, geospatial, temporal, document) |
| **Lender Behavioral** | XGBoost + Bayesian updating | Predict approval probability; overlay discovery; capacity cycle detection |
| **Rent Prediction** | LSTM (TensorFlow) + Prophet | Property-level rent forecasting; seasonal decomposition for STR |
| **Monte Carlo** | NumPy + SciPy + Numba | Vectorized simulation with JIT compilation; 10K-100K iterations in <2s |
| **Model Serving** | SageMaker Serverless Inference | Per-model endpoints; auto-scale to zero; pay-per-inference |
| **Experiment Tracking** | MLflow | Model versioning, A/B testing, feature stores, reproducibility |
| **Feature Store** | Feast | Share features between training (batch) and serving (online); point-in-time correctness |
| **Explainability** | SHAP + LIME | Regulatory requirement: explain every fraud score and approval prediction |

#### Infrastructure

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Cloud** | AWS (us-east-1 primary) | Most fintech compliance tooling; Aurora Serverless; SageMaker; WAF; FedRAMP authorized |
| **IaC** | Terraform + Terragrunt | Declarative, auditable infrastructure; Terragrunt for DRY multi-environment (dev/staging/prod) |
| **Containers** | Docker + ECS Fargate | No Kubernetes overhead for MVP; Fargate auto-scales; pay-per-task; simpler than EKS |
| **CI/CD** | GitHub Actions | Native integration with GitHub; reusable workflows; OIDC to AWS (no long-lived keys) |
| **Monitoring** | Datadog (APM + Logs + Metrics) | Single pane of glass; distributed tracing for TypeScript↔Python calls; custom DSCR calculation dashboards |
| **Error Tracking** | Sentry | Source maps for TypeScript; breadcrumbs for DSCR calculation errors |
| **CDN** | CloudFront | Static assets, S3-hosted documents; Lambda@Edge for geo-routing |
| **Secrets** | AWS Secrets Manager + Parameter Store | Auto-rotation for DB credentials; encrypted API keys for AirDNA/RentCast |
| **WAF** | AWS WAF + Shield Standard | DDoS protection; IP-based rate limiting; OWASP Top 10 rule set |

---

## 2. DATABASE SCHEMA DESIGN

### 2.1 Schema Overview

```sql
-- Core Schema: dscr_platform
-- Extension: TimescaleDB for time-series data
-- Extension: pg_trgm for fuzzy text search
-- Extension: uuid-ossp for UUID generation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

### 2.2 Core Tables

#### lenders

```sql
CREATE TABLE lenders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug                VARCHAR(100) UNIQUE NOT NULL,    -- URL-safe: "kiavi", "visio-lending"
    name                VARCHAR(200) NOT NULL,            -- Display name
    short_name          VARCHAR(50) NOT NULL,             -- "Kiavi", "Visio"
    status              VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, paused, exited
    lender_type         VARCHAR(30) NOT NULL,             -- dscr_specialist, non_qm, credit_union, bank
    
    -- === CORE DSCR PARAMETERS ===
    min_dscr            DECIMAL(5,2) NOT NULL,            -- Minimum DSCR (e.g., 0.75, 1.0, 1.25)
    dscr_calc_method    VARCHAR(20) NOT NULL DEFAULT 'rent_pitia',  -- rent_pitia, rent_pi, noi_ds
    dscr_rounding       VARCHAR(20) NOT NULL DEFAULT 'down_two',    -- down_two, nearest, up_two
    rent_mode           VARCHAR(20) NOT NULL DEFAULT 'lesser_of',   -- lesser_of, market_only, lease_only, kiavi_110
    
    -- === LTV PARAMETERS ===
    max_ltv_purchase    DECIMAL(5,2) NOT NULL,            -- Max LTV for purchase
    max_ltv_rate_term   DECIMAL(5,2),                      -- Max LTV for rate/term refi
    max_ltv_cashout     DECIMAL(5,2),                      -- Max LTV for cash-out refi
    max_ltv_no_ratio    DECIMAL(5,2),                      -- Max LTV for no-ratio program
    ltv_fico_adjustment JSONB DEFAULT '[]',                -- [{fico_min, fico_max, ltv_adjustment}]
    
    -- === FICO PARAMETERS ===
    min_fico            INTEGER NOT NULL,
    min_fico_no_ratio   INTEGER,                           -- FICO floor for no-ratio
    fico_for_max_ltv    INTEGER,                           -- FICO needed for maximum LTV
    
    -- === RESERVE PARAMETERS ===
    reserve_months      DECIMAL(4,1) NOT NULL DEFAULT 6,  -- Months of PITIA reserves
    reserve_per_property DECIMAL(4,1) DEFAULT 0,           -- Additional reserves per financed property
    reserve_source      VARCHAR(30) DEFAULT 'liquid',      -- liquid, retirement_ok, gift_ok
    no_reserve_option   BOOLEAN DEFAULT FALSE,             -- Some lenders (Kiavi) have no reserve req
    
    -- === STR PARAMETERS ===
    str_policy          VARCHAR(30) NOT NULL DEFAULT 'eligible',  -- eligible, ineligible, restricted
    str_dscr_discount   DECIMAL(3,2) DEFAULT 0.80,        -- STR rent haircut (MK Lending: 80%)
    str_min_history     INTEGER DEFAULT 12,                -- Months of STR history required
    str_platforms       TEXT[] DEFAULT '{}',               -- Accepted platforms: Airbnb, VRBO, etc.
    str_vacancy_factor  DECIMAL(3,2) DEFAULT 0.75,        -- Vacancy/occupancy factor for STR
    
    -- === LOAN STRUCTURE ===
    prepay_options      JSONB DEFAULT '[]',                -- [{type: "54321", penalty: [...], description: "..."}]
    max_loan_amount     DECIMAL(12,2),                     -- Maximum loan amount
    min_loan_amount     DECIMAL(10,2),                     -- Minimum loan amount
    term_options        INTEGER[] DEFAULT '{360}',         -- Available terms: [360, 480]
    arm_options         JSONB DEFAULT '[]',                -- [{fixed_years: 5, adjust_freq: 6, caps: "2/2/5"}]
    io_available        BOOLEAN DEFAULT FALSE,
    io_max_years        INTEGER,                           -- Max interest-only period
    io_dscr_surcharge   DECIMAL(4,2) DEFAULT 0.00,        -- DSCR surcharge for IO (e.g., +0.10)
    
    -- === ENTITY REQUIREMENTS ===
    entity_type_allowed TEXT[] DEFAULT '{"LLC","Corporation","Partnership"}',
    entity_states_required TEXT[] DEFAULT '{}',            -- States requiring entity (Visio: 8 states)
    entity_foreign_ok   BOOLEAN DEFAULT TRUE,              -- Foreign (out-of-state) LLC accepted
    entity_land_trust   BOOLEAN DEFAULT FALSE,             -- Land trust vesting allowed
    
    -- === PROPERTY REQUIREMENTS ===
    property_types_allowed TEXT[] DEFAULT '{"SFR","2-4_unit","condo","townhouse"}',
    max_units           INTEGER DEFAULT 4,
    min_property_value  DECIMAL(10,2),                     -- Minimum property value
    max_properties_borrower INTEGER,                       -- Max financed properties per borrower
    state_availability  TEXT[] DEFAULT '{}',               -- States where lender operates (empty = all)
    state_excluded      TEXT[] DEFAULT '{}',               -- States excluded
    zero_ppp_states     TEXT[] DEFAULT '{}',               -- States with no prepay penalty option
    
    -- === QUALIFYING RATE RULES (for ARMs) ===
    qualifying_rate_rule VARCHAR(30) DEFAULT 'note_rate',  -- note_rate, fully_indexed, greater_of_2, plus_200bp
    qualifying_rate_margin DECIMAL(4,2),                   -- e.g., +2.00% for qualifying rate
    
    -- === META ===
    website_url         VARCHAR(500),
    logo_url            VARCHAR(500),
    description         TEXT,
    last_verified_date  DATE,
    data_confidence     VARCHAR(20) DEFAULT 'unverified',  -- verified, partial, unverified
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lenders_status ON lenders(status);
CREATE INDEX idx_lenders_slug ON lenders(slug);
CREATE INDEX idx_lenders_min_dscr ON lenders(min_dscr);
CREATE INDEX idx_lenders_min_fico ON lenders(min_fico);
CREATE INDEX idx_lenders_state ON lenders USING gin(state_availability);
```

#### lender_pricing_grids (LLPA Grids)

```sql
-- Lender-Level Price Adjustments — the heart of rate estimation
-- Each lender has a matrix of adjustments based on FICO × LTV × DSCR × loan_amount
CREATE TABLE lender_pricing_grids (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lender_id           UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
    grid_type           VARCHAR(30) NOT NULL,              -- base_rate, fico_ltv_adjustment, dscr_adjustment, 
                                                            -- io_adjustment, cashout_adjustment, property_type_adj,
                                                            -- loan_amount_adjustment, reserve_adjustment, state_adjustment
    effective_date      DATE NOT NULL,
    expiry_date         DATE,
    
    -- Grid stored as JSONB for flexibility — different grid_types have different structures
    -- Example for fico_ltv_adjustment:
    -- {
    --   "dimensions": ["fico_range", "ltv_range"],
    --   "adjustments": [
    --     {"fico_min": 660, "fico_max": 699, "ltv_min": 0, "ltv_max": 60, "bps": 0},
    --     {"fico_min": 660, "fico_max": 699, "ltv_min": 60.01, "ltv_max": 70, "bps": 75},
    --     {"fico_min": 660, "fico_max": 699, "ltv_min": 70.01, "ltv_max": 80, "bps": 150},
    --     {"fico_min": 700, "fico_max": 739, "ltv_min": 0, "ltv_max": 60, "bps": -25},
    --     ...
    --   ]
    -- }
    grid_data           JSONB NOT NULL,
    
    -- For simple single-value adjustments
    flat_adjustment_bps DECIMAL(6,2),                      -- e.g., IO adds +50bps
    
    source              VARCHAR(50) DEFAULT 'rate_sheet',  -- rate_sheet, broker_matrix, observed, estimated
    confidence          DECIMAL(3,2) DEFAULT 0.50,         -- 0.0-1.0 confidence in data accuracy
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pricing_lender ON lender_pricing_grids(lender_id);
CREATE INDEX idx_pricing_type ON lender_pricing_grids(grid_type);
CREATE INDEX idx_pricing_date ON lender_pricing_grids(effective_date DESC);
```

#### lender_overlays (Behavioral Intelligence)

```sql
-- The DIFFERENTIATOR: Published guidelines vs. observed behavior
CREATE TABLE lender_overlays (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lender_id           UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
    
    overlay_type        VARCHAR(50) NOT NULL,  -- dscr_flexibility, reserve_flexibility, ltv_flexibility,
                                                -- fico_flexibility, str_flexibility, capacity_cycle,
                                                -- negotiation_margin, condition_patterns,
                                                -- entity_flexibility, geographic_concentration,
                                                -- appraisal_tolerance, closing_speed
    
    -- Published (stated) value vs. Observed (actual) value
    published_value     DECIMAL(10,4),          -- What the rate sheet says
    observed_value      DECIMAL(10,4),          -- What actually happens
    observed_min        DECIMAL(10,4),          -- Minimum observed value
    observed_max        DECIMAL(10,4),          -- Maximum observed value
    observed_median     DECIMAL(10,4),          -- Median observed value
    
    -- Confidence metrics
    confidence          DECIMAL(3,2) NOT NULL DEFAULT 0.0, -- 0.0-1.0
    sample_size         INTEGER NOT NULL DEFAULT 0,         -- Number of data points
    statistical_sig     BOOLEAN DEFAULT FALSE,              -- p < 0.05
    
    -- Contextual modifiers
    conditions          JSONB DEFAULT '[]',     -- When this overlay applies
    -- Example: [{"field": "fico", "operator": ">=", "value": 720}]
    
    data_sources        TEXT[] DEFAULT '{}',    -- Where this data came from
    notes               TEXT,
    
    last_observed       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_overlays_lender ON lender_overlays(lender_id);
CREATE INDEX idx_overlays_type ON lender_overlays(overlay_type);
CREATE INDEX idx_overlays_confidence ON lender_overlays(confidence DESC);
```

#### lender_capacity (Real-Time Pipeline Intelligence)

```sql
-- Track lender pipeline saturation — hungry vs. full cycling
CREATE TABLE lender_capacity (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lender_id           UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
    
    -- Capacity indicators
    appetite_level      VARCHAR(20) NOT NULL,   -- hungry, steady, full, paused
    estimated_capacity  DECIMAL(5,2),           -- % of warehouse line utilized
    approval_rate_7d    DECIMAL(5,2),           -- 7-day rolling approval rate
    approval_rate_30d   DECIMAL(5,2),           -- 30-day rolling approval rate
    avg_close_days      INTEGER,                -- Average days to close
    
    -- Pricing signals
    margin_tightness    VARCHAR(20),            -- tight, normal, loose
    promo_active        BOOLEAN DEFAULT FALSE,  -- Running any promotions?
    promo_details       JSONB,                  -- Promo details if active
    
    observed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capacity_lender ON lender_capacity(lender_id);
CREATE INDEX idx_capacity_date ON lender_capacity(observed_at DESC);
```

#### properties

```sql
CREATE TABLE properties (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Address (structured for search and validation)
    address_line1       VARCHAR(200) NOT NULL,
    address_line2       VARCHAR(100),
    city                VARCHAR(100) NOT NULL,
    state               CHAR(2) NOT NULL,              -- US state code
    zip                 VARCHAR(10) NOT NULL,           -- ZIP or ZIP+4
    county              VARCHAR(100),                   -- County (insurance rates vary by county)
    msa                 VARCHAR(100),                   -- Metropolitan Statistical Area
    latitude            DECIMAL(10,7),
    longitude           DECIMAL(10,7),
    
    -- Property characteristics
    property_type       VARCHAR(30) NOT NULL,           -- SFR, 2-unit, 3-unit, 4-unit, condo, townhouse, multi_5plus
    units               INTEGER NOT NULL DEFAULT 1,
    year_built          INTEGER,
    sqft                INTEGER,
    lot_sqft            INTEGER,
    bedrooms            INTEGER,
    bathrooms           DECIMAL(3,1),
    
    -- Financial
    purchase_price      DECIMAL(12,2),                  -- Contract price or recent sale price
    estimated_value     DECIMAL(12,2),                  -- AVM or appraised value
    value_source        VARCHAR(30),                    -- avm, appraisal, tax_assessment, user_input
    value_confidence    DECIMAL(3,2),                   -- 0.0-1.0
    
    -- Tax & Insurance estimates
    annual_tax          DECIMAL(10,2),                  -- Annual property tax
    tax_source          VARCHAR(30),                    -- assessor, estimated, user_input
    annual_insurance    DECIMAL(10,2),                  -- Annual homeowner's insurance
    insurance_source    VARCHAR(30),                    -- quoted, estimated, user_input
    annual_flood_ins    DECIMAL(10,2),                  -- Flood insurance (if required)
    annual_wind_ins     DECIMAL(10,2),                  -- Wind/hail insurance (coastal)
    hoa_monthly         DECIMAL(8,2) DEFAULT 0,         -- Monthly HOA dues
    
    -- Ownership
    owner_user_id       UUID,                           -- If claimed by a user
    
    -- External IDs
    zpid                VARCHAR(50),                    -- Zillow property ID
    mls_number          VARCHAR(50),                    -- MLS listing number
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_zip ON properties(zip);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_address_trgm ON properties USING gin(address_line1 gin_trgm_ops);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
```

#### borrowers

```sql
CREATE TABLE borrowers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID,                           -- Link to auth user if registered
    
    -- Borrower profile
    fico                INTEGER NOT NULL,               -- Mid-score from 3 bureaus
    fico_source         VARCHAR(20) DEFAULT 'user_input',  -- user_input, credit_pull, estimated
    experience_level    VARCHAR(20) DEFAULT 'intermediate', -- novice, intermediate, experienced, portfolio
    financed_properties_count INTEGER DEFAULT 0,        -- Currently financed investment properties
    total_portfolio_units INTEGER DEFAULT 0,            -- Total units in portfolio
    
    -- Entity information
    entity_type         VARCHAR(30),                    -- LLC, Corporation, Partnership, Individual
    entity_state        CHAR(2),                        -- State of entity formation
    entity_name         VARCHAR(200),                   -- Legal entity name
    entity_age_months   INTEGER,                        -- How old the entity is
    
    -- Financial reserves
    reserves_available  DECIMAL(12,2),                  -- Liquid reserves available
    reserves_source     VARCHAR(30) DEFAULT 'user_input',  -- user_input, bank_statements, estimated
    retirement_reserves DECIMAL(12,2) DEFAULT 0,        -- Retirement funds (60-70% counted by some lenders)
    
    -- DSCR-specific history
    prior_dscr_loans    INTEGER DEFAULT 0,              -- Number of prior DSCR loans closed
    dscr_loan_history   JSONB DEFAULT '[]',             -- [{lender_id, amount, date, outcome}]
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_borrowers_fico ON borrowers(fico);
CREATE INDEX idx_borrowers_user ON borrowers(user_id);
```

#### loan_scenarios (The Core Output)

```sql
CREATE TABLE loan_scenarios (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id         UUID NOT NULL REFERENCES properties(id),
    borrower_id         UUID NOT NULL REFERENCES borrowers(id),
    lender_id           UUID REFERENCES lenders(id),    -- NULL = comparison mode (all lenders)
    
    -- Loan structure inputs
    loan_purpose        VARCHAR(20) NOT NULL,           -- purchase, rate_term_refi, cashout_refi
    loan_amount         DECIMAL(12,2) NOT NULL,
    ltv                 DECIMAL(5,2) NOT NULL,          -- Calculated: loan_amount / value
    term_months         INTEGER NOT NULL DEFAULT 360,
    loan_product        VARCHAR(30) NOT NULL,           -- fixed_30, fixed_15, arm_5_6, arm_7_6, arm_10_6
    io_period_months    INTEGER DEFAULT 0,              -- 0 = no IO; 60 = 5yr IO
    
    -- Rate inputs
    rate                DECIMAL(5,3),                   -- Note rate (estimated or locked)
    rate_source         VARCHAR(30),                    -- estimated, quoted, locked
    rate_lock_date      DATE,
    rate_lock_expiration DATE,
    margin_over_index   DECIMAL(5,3),                   -- For ARMs: margin over SOFR
    index_value         DECIMAL(5,3),                   -- SOFR value at time of calculation
    
    -- Rent mode & income
    rent_mode           VARCHAR(20) NOT NULL,           -- ltr, str, blend, lesser_of
    gross_rent_monthly  DECIMAL(10,2) NOT NULL,         -- Qualifying monthly rent
    rent_source         VARCHAR(30),                    -- lease, market_1007, market_1025, airdna, rentcast, user_input
    lesser_of_applied   BOOLEAN DEFAULT FALSE,          -- Whether lesser-of rule reduced rent
    
    -- === CALCULATED RESULTS ===
    -- PITIA breakdown
    principal_monthly   DECIMAL(10,2),                  -- Monthly principal
    interest_monthly    DECIMAL(10,2),                  -- Monthly interest
    tax_monthly         DECIMAL(10,2),                  -- Monthly property tax
    insurance_monthly   DECIMAL(10,2),                  -- Monthly insurance (HOI + flood + wind)
    hoa_monthly         DECIMAL(8,2) DEFAULT 0,         -- Monthly HOA
    pitia_total         DECIMAL(10,2) NOT NULL,         -- Total PITIA
    
    -- DSCR results
    dscr                DECIMAL(6,3) NOT NULL,          -- Calculated DSCR
    dscr_meets_minimum  BOOLEAN,                        -- Passes lender's min DSCR?
    
    -- Max loan calculations
    max_loan_dscr_100   DECIMAL(12,2),                  -- Max loan at DSCR = 1.00
    max_loan_dscr_110   DECIMAL(12,2),                  -- Max loan at DSCR = 1.10
    max_loan_dscr_125   DECIMAL(12,2),                  -- Max loan at DSCR = 1.25
    max_ltv_at_dscr     DECIMAL(5,2),                   -- Max LTV achievable at target DSCR
    
    -- Cash-to-close
    down_payment        DECIMAL(12,2),                  -- Down payment
    closing_costs       DECIMAL(10,2),                  -- Estimated closing costs
    prepaid_escrow      DECIMAL(10,2),                  -- Prepaid escrow (tax + insurance)
    reserve_requirement DECIMAL(10,2),                  -- Required reserves
    cash_to_close       DECIMAL(12,2),                  -- Total cash needed to close
    
    -- Reserve calculation
    reserve_months_required DECIMAL(4,1),               -- Months of reserves required
    reserve_amount_required DECIMAL(10,2),              -- Dollar amount of reserves required
    reserve_met         BOOLEAN,                        -- Borrower has sufficient reserves?
    
    -- Sensitivity
    rent_needed_dscr_125 DECIMAL(10,2),                -- Rent needed for DSCR 1.25
    price_adjustment_dscr_125 DECIMAL(10,2),            -- Price cut needed for DSCR 1.25 at this rent
    ltv_adjustment_dscr_125 DECIMAL(5,2),               -- LTV reduction needed
    
    -- Scenario metadata
    scenario_name       VARCHAR(200),                   -- User-friendly name
    scenario_type       VARCHAR(20) DEFAULT 'manual',   -- manual, optimized, sensitivity, monte_carlo
    is_saved            BOOLEAN DEFAULT FALSE,
    parent_scenario_id  UUID REFERENCES loan_scenarios(id), -- For sensitivity/Monte Carlo sub-scenarios
    
    created_by          UUID,                           -- User who created
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenarios_property ON loan_scenarios(property_id);
CREATE INDEX idx_scenarios_borrower ON loan_scenarios(borrower_id);
CREATE INDEX idx_scenarios_lender ON loan_scenarios(lender_id);
CREATE INDEX idx_scenarios_dscr ON loan_scenarios(dscr);
CREATE INDEX idx_scenarios_created ON loan_scenarios(created_at DESC);
```

#### rent_estimates

```sql
CREATE TABLE rent_estimates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id         UUID NOT NULL REFERENCES properties(id),
    
    source              VARCHAR(30) NOT NULL,            -- airdna, rentcast, rentometer, 1007_appraisal, 
                                                          -- 1025_appraisal, lease, mls, user_input
    source_id           VARCHAR(100),                    -- External ID from source
    
    -- LTR estimates
    ltr_rent_monthly    DECIMAL(10,2),                   -- Long-term rental estimate
    ltr_rent_low        DECIMAL(10,2),                   -- Low end of estimate range
    ltr_rent_high       DECIMAL(10,2),                   -- High end of estimate range
    ltr_confidence      DECIMAL(3,2),                    -- 0.0-1.0 confidence
    ltr_methodology     VARCHAR(50),                     -- comparable_rentals, statistical_model, survey
    
    -- STR estimates
    str_revenue_monthly DECIMAL(10,2),                   -- Average monthly STR revenue
    str_revenue_low     DECIMAL(10,2),
    str_revenue_high    DECIMAL(10,2),
    str_occupancy_rate  DECIMAL(3,2),                    -- e.g., 0.72 = 72% occupancy
    str_adr             DECIMAL(8,2),                    -- Average daily rate
    str_confidence      DECIMAL(3,2),
    
    -- Blended estimates
    blend_rent_monthly  DECIMAL(10,2),                   -- Weighted blend of LTR + STR
    blend_weight_ltr    DECIMAL(3,2) DEFAULT 0.70,      -- Default 70% LTR, 30% STR
    
    -- Metadata
    estimate_date       DATE NOT NULL,
    expires_date        DATE,                            -- When estimate should be refreshed
    raw_response        JSONB,                           -- Full API response for audit
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rent_property ON rent_estimates(property_id);
CREATE INDEX idx_rent_source ON rent_estimates(source);
CREATE INDEX idx_rent_date ON rent_estimates(estimate_date DESC);
```

### 2.3 Supporting Tables

#### users

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255),                    -- NULL for OAuth-only users
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    phone               VARCHAR(20),
    company             VARCHAR(200),
    role                VARCHAR(20) NOT NULL DEFAULT 'borrower',  -- borrower, broker, lender, admin
    plan                VARCHAR(20) NOT NULL DEFAULT 'free',      -- free, pro, enterprise
    
    -- Auth
    auth_provider       VARCHAR(20) DEFAULT 'email',    -- email, google, microsoft
    auth_provider_id    VARCHAR(255),
    mfa_enabled         BOOLEAN DEFAULT FALSE,
    mfa_secret          VARCHAR(255),                    -- TOTP secret (encrypted)
    
    -- Email verification
    email_verified      BOOLEAN DEFAULT FALSE,
    email_verified_at   TIMESTAMPTZ,
    
    -- Subscription
    stripe_customer_id  VARCHAR(255),
    subscription_status VARCHAR(20) DEFAULT 'inactive',
    subscription_current_period_end TIMESTAMPTZ,
    
    -- Usage tracking
    calculations_this_month INTEGER DEFAULT 0,
    last_calculation_at TIMESTAMPTZ,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    last_login_at       TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);
```

#### rate_snapshots (Time-Series via TimescaleDB)

```sql
CREATE TABLE rate_snapshots (
    time                TIMESTAMPTZ NOT NULL,
    lender_id           UUID NOT NULL REFERENCES lenders(id),
    
    -- Rate components
    base_rate           DECIMAL(5,3) NOT NULL,          -- Base rate before adjustments
    sofr_30day          DECIMAL(5,3),                    -- 30-day average SOFR
    sofr_overnight      DECIMAL(5,3),                    -- Overnight SOFR
    treasury_10yr       DECIMAL(5,3),                    -- 10-year Treasury yield
    
    -- Product rates
    rate_30yr_fixed     DECIMAL(5,3),
    rate_15yr_fixed     DECIMAL(5,3),
    rate_5_6_arm        DECIMAL(5,3),
    rate_7_6_arm        DECIMAL(5,3),
    rate_10_6_arm       DECIMAL(5,3),
    
    -- Spread over benchmark
    spread_30yr_fixed   DECIMAL(5,3),                    -- Rate - 10yr Treasury
    spread_5_6_arm      DECIMAL(5,3),                    -- Rate - SOFR
    
    source              VARCHAR(30) DEFAULT 'rate_sheet',  -- rate_sheet, api, observed, estimated
    confidence          DECIMAL(3,2) DEFAULT 0.70,
    
    PRIMARY KEY (time, lender_id)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('rate_snapshots', 'time', chunk_interval => INTERVAL '1 day');
```

#### calculation_audit_log

```sql
-- Every DSCR calculation is auditable — critical for compliance and debugging
CREATE TABLE calculation_audit_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id         UUID REFERENCES loan_scenarios(id),
    user_id             UUID,
    
    -- Input snapshot (immutable)
    input_snapshot      JSONB NOT NULL,                 -- Complete input that produced this calculation
    
    -- Output snapshot
    output_snapshot     JSONB NOT NULL,                 -- Complete output including all DSCR variants
    
    -- Calculation metadata
    engine_version      VARCHAR(20) NOT NULL,           -- Git SHA or semver of calculation engine
    calculation_time_ms INTEGER NOT NULL,               -- Time to calculate
    cache_hit           BOOLEAN DEFAULT FALSE,          -- Was result served from cache?
    
    -- For debugging
    formula_trace       JSONB,                          -- Step-by-step formula execution trace
    
    ip_address          INET,
    user_agent          TEXT,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_scenario ON calculation_audit_log(scenario_id);
CREATE INDEX idx_audit_user ON calculation_audit_log(user_id);
CREATE INDEX idx_audit_date ON calculation_audit_log(created_at DESC);
```

#### fraud_analyses

```sql
CREATE TABLE fraud_analyses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id         UUID NOT NULL REFERENCES properties(id),
    scenario_id         UUID REFERENCES loan_scenarios(id),
    
    -- Input
    claimed_rent        DECIMAL(10,2) NOT NULL,
    claimed_source      VARCHAR(30),                    -- lease, user_input, airbnb_listing
    
    -- Module 1: Statistical Anomaly
    fraud_score_stat    DECIMAL(5,2),                   -- 0-100
    rent_vs_neighborhood DECIMAL(5,2),                  -- % above neighborhood median
    rent_vs_comps       DECIMAL(5,2),                   -- % above comparable properties
    stat_flags          JSONB DEFAULT '[]',
    
    -- Module 2: Geospatial Anomaly
    fraud_score_geo     DECIMAL(5,2),
    spatial_outlier     BOOLEAN,
    geo_flags           JSONB DEFAULT '[]',
    
    -- Module 3: Temporal Anomaly
    fraud_score_temporal DECIMAL(5,2),
    rent_growth_rate    DECIMAL(5,2),                   -- % change vs. 6mo ago
    seasonal_adjusted   DECIMAL(5,2),                   -- Seasonally adjusted rent
    temporal_flags      JSONB DEFAULT '[]',
    
    -- Module 4: Document Analysis (if lease provided)
    fraud_score_doc     DECIMAL(5,2),
    doc_flags           JSONB DEFAULT '[]',
    
    -- Composite
    fraud_score_composite DECIMAL(5,2) NOT NULL,       -- Weighted composite 0-100
    risk_level          VARCHAR(20) NOT NULL,           -- low, medium, high, critical
    confidence          DECIMAL(3,2) NOT NULL,
    
    -- Explanation
    explanation         JSONB NOT NULL,                 -- SHAP values, reasons, recommendations
    recommendations     TEXT[],
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_property ON fraud_analyses(property_id);
CREATE INDEX idx_fraud_score ON fraud_analyses(fraud_score_composite DESC);
```

#### monte_carlo_simulations

```sql
CREATE TABLE monte_carlo_simulations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id         UUID NOT NULL REFERENCES loan_scenarios(id),
    
    -- Simulation parameters
    iterations          INTEGER NOT NULL DEFAULT 10000,
    time_horizon_years  INTEGER NOT NULL DEFAULT 5,
    rent_volatility     DECIMAL(5,4) NOT NULL,          -- Annual rent σ
    rate_volatility     DECIMAL(5,4),                    -- Rate σ for ARM scenarios
    insurance_growth    DECIMAL(5,4) DEFAULT 0.05,      -- Annual insurance growth rate
    tax_growth          DECIMAL(5,4) DEFAULT 0.03,      -- Annual tax growth rate
    vacancy_rate        DECIMAL(5,4),                    -- Annual vacancy rate assumption
    
    -- Results
    dscr_probability    JSONB NOT NULL,                  -- {year: {dscr_threshold: probability}}
    -- Example: {"1": {"1.0": 0.95, "1.25": 0.72}, "5": {"1.0": 0.78, "1.25": 0.41}}
    
    var_5pct            DECIMAL(6,3),                    -- Value at Risk: 5th percentile DSCR
    var_1pct            DECIMAL(6,3),                    -- Value at Risk: 1st percentile DSCR
    cvar_5pct           DECIMAL(6,3),                    -- Conditional VaR (expected shortfall)
    probability_breach  DECIMAL(5,4),                    -- P(DSCR < 1.0) at any point
    probability_default DECIMAL(5,4),                    -- P(DSCR < 0.90) at any point
    
    stress_scenarios    JSONB NOT NULL,                  -- Named stress test results
    -- Example: {"rent_decline_10": {"dscr": 1.03, "breach_prob": 0.32}, "insurance_2x": {...}}
    
    -- Distribution data for visualization
    distribution_buckets JSONB NOT NULL,                 -- Histogram data for DSCR distribution
    
    calculation_time_ms INTEGER,
    engine_version      VARCHAR(20),
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mc_scenario ON monte_carlo_simulations(scenario_id);
```

#### lender_submissions (Tracking Real Behavior)

```sql
-- Track actual loan submissions to build behavioral intelligence
CREATE TABLE lender_submissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id         UUID REFERENCES loan_scenarios(id),
    lender_id           UUID NOT NULL REFERENCES lenders(id),
    property_id         UUID NOT NULL REFERENCES properties(id),
    borrower_id         UUID NOT NULL REFERENCES borrowers(id),
    user_id             UUID NOT NULL,
    
    -- Submission details
    submitted_rate      DECIMAL(5,3),                   -- Rate at submission
    submitted_dscr      DECIMAL(6,3),                   -- DSCR at submission
    submitted_ltv       DECIMAL(5,2),                   -- LTV at submission
    submitted_loan_amount DECIMAL(12,2),
    
    -- Outcome tracking
    status              VARCHAR(30) NOT NULL DEFAULT 'submitted',  
                        -- submitted, in_review, approved_with_conditions, approved, 
                        -- denied, withdrawn, counter_offered, funded
    
    outcome_rate        DECIMAL(5,3),                   -- Final rate if different from submitted
    outcome_loan_amount DECIMAL(12,2),                  -- Final loan amount
    denial_reason       VARCHAR(100),                   -- Primary denial reason
    denial_details      JSONB,                          -- Detailed denial breakdown
    
    -- Timeline
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_at         TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    days_to_close       INTEGER,
    
    -- Conditions
    conditions          JSONB DEFAULT '[]',             -- Lender conditions: [{type, description, resolved}]
    
    -- AE / Broker info
    account_executive   VARCHAR(200),
    broker_name         VARCHAR(200),
    
    notes               TEXT,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_lender ON lender_submissions(lender_id);
CREATE INDEX idx_submissions_status ON lender_submissions(status);
CREATE INDEX idx_submissions_date ON lender_submissions(submitted_at DESC);
CREATE INDEX idx_submissions_lender_status ON lender_submissions(lender_id, status);
```

#### notifications

```sql
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id),
    
    type                VARCHAR(50) NOT NULL,           -- rate_alert, lender_change, scenario_save, 
                                                          -- dscr_breach_warning, property_update
    title               VARCHAR(200) NOT NULL,
    body                TEXT,
    
    -- Reference data
    reference_type      VARCHAR(30),                    -- scenario, lender, property, rate
    reference_id        UUID,                           -- ID of referenced entity
    
    -- Delivery
    channel             VARCHAR(20) DEFAULT 'in_app',   -- in_app, email, sms, push
    read                BOOLEAN DEFAULT FALSE,
    delivered_at        TIMESTAMPTZ,
    read_at             TIMESTAMPTZ,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
```

### 2.4 Entity Relationship Summary

```
users ─────────────────┐
  │                     │
  │ 1:N                 │ 1:N
  ▼                     ▼
borrowers           loan_scenarios ──────────┐
  │                     │                    │
  │ N:1                 │ N:1               │ N:1
  ▼                     ▼                    ▼
properties           lenders           monte_carlo_simulations
  │                     │                    │
  │ 1:N                 │ 1:N               │ 1:N
  ├─ rent_estimates     ├─ lender_pricing_grids  fraud_analyses
  │                     ├─ lender_overlays
  │                     ├─ lender_capacity
  │                     ├─ lender_submissions
  │                     └─ rate_snapshots
  │
  └─ (referenced by fraud_analyses)

calculation_audit_log ─── references loan_scenarios
notifications ─── references users
```

---

## 3. API DESIGN

### 3.1 API Architecture

```
                    ┌─────────────────┐
                    │   Next.js BFF   │  ← Client talks ONLY to this
                    │   (API Routes)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ DSCR Calc   │  │ Lender     │  │ Rate       │
     │ Service     │  │ Match Svc  │  │ Estimate   │
     │ (TypeScript)│  │ (TypeScript)│  │ (TypeScript)│
     └────────────┘  └────────────┘  └────────────┘
              │              │              │
              └──────┬───────┘──────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐ ┌──────────┐ ┌──────────┐
   │PostgreSQL│ │  Redis   │ │ Python   │
   │ (Aurora) │ │(ElastiC) │ │ML Services│
   └─────────┘ └──────────┘ └──────────┘
```

### 3.2 Core API Endpoints

#### DSCR Calculation APIs

```yaml
POST /api/v1/dscr/calculate:
  description: Calculate DSCR for a specific scenario
  auth: required (JWT)
  rate_limit: 100 req/min (free), 1000 req/min (pro)
  performance: p99 < 100ms
  
  request:
    property:
      address_line1: string
      city: string
      state: string(2)
      zip: string
      property_type: enum[SFR, 2-unit, 3-unit, 4-unit, condo, townhouse]
      units: integer
      purchase_price: decimal (required for purchase)
      estimated_value: decimal (required for refi)
      year_built: integer
      annual_tax: decimal (optional — estimated if not provided)
      annual_insurance: decimal (optional — estimated if not provided)
      hoa_monthly: decimal (default: 0)
    
    borrower:
      fico: integer (300-850)
      entity_type: enum[LLC, Corporation, Partnership, Individual]
      entity_state: string(2)
      reserves_available: decimal
      financed_properties_count: integer
      experience_level: enum[novice, intermediate, experienced, portfolio]
    
    loan:
      purpose: enum[purchase, rate_term_refi, cashout_refi]
      loan_amount: decimal
      term_months: enum[180, 240, 360, 480]
      product: enum[fixed_30, fixed_15, arm_5_6, arm_7_6, arm_10_6]
      io_period_months: enum[0, 36, 60, 84, 120]
    
    rent:
      mode: enum[ltr, str, blend, lesser_of, kiavi_110]
      ltr_rent: decimal (monthly)
      str_revenue: decimal (monthly, required if mode=str or blend)
      source: enum[user_input, lease, market_1007, airdna, rentcast, rentometer]
    
    lender_id: uuid (optional — if provided, calculate for specific lender's rules)
  
  response:
    scenario_id: uuid
    pitia:
      principal: decimal
      interest: decimal
      tax: decimal
      insurance: decimal
      hoa: decimal
      total: decimal
    
    dscr:
      value: decimal
      meets_minimum: boolean
      lender_minimum: decimal (if lender_id provided)
    
    max_loan:
      at_dscr_100: decimal
      at_dscr_110: decimal
      at_dscr_125: decimal
      max_ltv_at_target: decimal
    
    cash_to_close:
      down_payment: decimal
      closing_costs: decimal
      prepaid_escrow: decimal
      reserves_required: decimal
      total: decimal
    
    qualifying_rate: decimal (for ARMs, the rate used for DSCR calc)
    effective_rate: decimal (note rate + LLPA adjustments)
    calculation_time_ms: integer
```

```yaml
POST /api/v1/dscr/calculate-batch:
  description: Calculate DSCR across ALL eligible lenders simultaneously
  auth: required
  rate_limit: 20 req/min
  performance: p99 < 2s (parallel lender calculations)
  
  request:
    # Same as /calculate, but without lender_id
  
  response:
    scenario_id: uuid
    base_calculation: # Same as /calculate response (no lender-specific rules)
    lender_results:
      - lender_id: uuid
        lender_name: string
        eligible: boolean
        ineligibility_reasons: string[]
        dscr: decimal
        dscr_meets_minimum: boolean
        rate_estimate: decimal
        max_loan_at_minimum_dscr: decimal
        cash_to_close: decimal
        prepay_options: object[]
        ranking_score: decimal  # Composite score for sorting
    total_eligible: integer
    calculation_time_ms: integer
```

```yaml
POST /api/v1/dscr/sensitivity:
  description: Sensitivity analysis — what changes are needed to hit DSCR targets
  auth: required
  rate_limit: 50 req/min
  performance: p99 < 200ms
  
  request:
    scenario_id: uuid  # Reference an existing scenario
    targets: [1.0, 1.10, 1.25, 1.30]  # DSCR targets to analyze
  
  response:
    scenario_id: uuid
    current_dscr: decimal
    analyses:
      - target_dscr: decimal
        rent_needed: decimal  # Rent needed to hit this DSCR
        rent_change_pct: decimal  # % change from current rent
        price_adjustment: decimal  # Price cut to hit this DSCR at current rent
        price_change_pct: decimal
        ltv_adjustment: decimal  # LTV reduction needed
        loan_amount_reduction: decimal  # Loan amount reduction
        io_savings: decimal  # Monthly savings from switching to IO
        io_dscr: decimal  # DSCR if IO is used
```

```yaml
POST /api/v1/dscr/monte-carlo:
  description: Monte Carlo simulation for DSCR probability analysis
  auth: required (pro+ plan)
  rate_limit: 10 req/min
  performance: async — returns simulation_id immediately, results via SSE/polling
  
  request:
    scenario_id: uuid
    iterations: integer (default: 10000, max: 100000)
    time_horizon_years: integer (default: 5, max: 10)
    assumptions:
      rent_volatility: decimal (annual σ, default: 0.05 for MF, 0.08 for SFR)
      rate_volatility: decimal (for ARM scenarios)
      insurance_growth_rate: decimal (default: 0.05)
      tax_growth_rate: decimal (default: 0.03)
      vacancy_rate: decimal (default: 0.05)
    stress_scenarios:
      - name: string
        type: enum[rent_decline, rate_increase, insurance_surge, tax_hike, vacancy_spike]
        severity: decimal  # e.g., -0.15 for 15% rent decline
  
  response (initial):
    simulation_id: uuid
    status: enum[queued, running]
    estimated_completion_seconds: integer
  
  response (completed, via GET /api/v1/dscr/monte-carlo/{simulation_id}):
    simulation_id: uuid
    status: completed
    iterations: integer
    time_horizon_years: integer
    
    probabilities:
      year_1: {dscr_above_1_0: decimal, dscr_above_1_25: decimal}
      year_3: {dscr_above_1_0: decimal, dscr_above_1_25: decimal}
      year_5: {dscr_above_1_0: decimal, dscr_above_1_25: decimal}
    
    var:
      var_5pct: decimal  # 5th percentile DSCR
      var_1pct: decimal  # 1st percentile DSCR
      cvar_5pct: decimal  # Expected shortfall
    
    breach_probability: decimal  # P(any DSCR < 1.0 within horizon)
    
    stress_results:
      - name: string
        dscr_impact: decimal
        breach_probability: decimal
    
    distribution:  # For chart rendering
      - bucket: decimal  # DSCR value
        count: integer   # Number of iterations in this bucket
    
    calculation_time_ms: integer
```

#### Lender Matching APIs

```yaml
POST /api/v1/lenders/match:
  description: Find eligible lenders for a property/borrower combo
  auth: required
  rate_limit: 50 req/min
  performance: p99 < 500ms
  
  request:
    property: object  # Same as /calculate
    borrower: object  # Same as /calculate
    rent: object      # Same as /calculate
    loan: object      # Same as /calculate
    preferences:
      sort_by: enum[lowest_rate, highest_dscr, lowest_cash_to_close, 
                    best_prepay, fastest_close, behavioral_score]
      must_have_io: boolean
      must_have_str: boolean
      max_prepay_years: integer
      preferred_lenders: uuid[]  # Prioritize these
      excluded_lenders: uuid[]   # Exclude these
    include_behavioral: boolean  # Include overlay intelligence (pro+ only)
  
  response:
    matches:
      - lender_id: uuid
        lender_name: string
        lender_slug: string
        eligible: boolean
        eligibility_flags: string[]  # Why eligible or not
        estimated_rate: decimal
        rate_range: {low: decimal, high: decimal}
        dscr: decimal
        dscr_vs_minimum: decimal  # Buffer above lender minimum
        max_ltv_available: decimal
        cash_to_close: decimal
        prepay_options: object[]
        io_available: boolean
        str_eligible: boolean
        reserve_months_required: decimal
        closing_speed_days: integer  # Estimated (from behavioral data)
        
        # Behavioral intelligence (if include_behavioral=true)
        behavioral:
          approval_probability: decimal  # 0-1
          appetite_level: string  # hungry/steady/full
          observed_dscr_flexibility: decimal
          negotiation_margin_bps: integer
          confidence: decimal
          recent_approval_rate: decimal
        
        rank: integer
        ranking_score: decimal
    total_eligible: integer
    total_evaluated: integer
```

```yaml
GET /api/v1/lenders:
  description: List all lenders with their parameters
  auth: required
  rate_limit: 100 req/min
  
  query_params:
    state: string(2)        # Filter by state availability
    min_dscr_max: decimal   # Lenders with min DSCR ≤ this value
    property_type: string   # Filter by supported property type
    str_eligible: boolean   # STR-eligible lenders only
    io_available: boolean   # IO available lenders
    search: string          # Full-text search on lender name
    
  response:
    lenders:
      - id: uuid
        name: string
        slug: string
        min_dscr: decimal
        max_ltv_purchase: decimal
        max_ltv_cashout: decimal
        min_fico: integer
        str_policy: string
        io_available: boolean
        term_options: integer[]
        logo_url: string
        last_verified: date
    total: integer
    page: integer
    per_page: integer
```

```yaml
GET /api/v1/lenders/{slug}:
  description: Get full lender details including pricing grids
  auth: required
  rate_limit: 100 req/min
  
  response:
    id: uuid
    name: string
    slug: string
    # ... all lender fields
    pricing_grids:
      - grid_type: string
        grid_data: object
        effective_date: date
        confidence: decimal
    overlays:
      - overlay_type: string
        published_value: decimal
        observed_value: decimal
        confidence: decimal
        sample_size: integer
    capacity:
      appetite_level: string
      approval_rate_7d: decimal
      estimated_capacity: decimal
```

#### Rate Estimation APIs

```yaml
GET /api/v1/rates/estimate:
  description: Estimate rate for a given loan scenario
  auth: required
  rate_limit: 100 req/min
  performance: p99 < 300ms (cached rate lookups)
  
  query_params:
    lender_id: uuid
    fico: integer
    ltv: decimal
    dscr: decimal
    loan_amount: decimal
    loan_purpose: string
    property_type: string
    state: string(2)
    io: boolean
    product: string
  
  response:
    estimated_rate: decimal
    rate_range: {low: decimal, high: decimal}
    rate_breakdown:
      base_rate: decimal
      fico_ltv_adjustment_bps: integer
      dscr_adjustment_bps: integer
      io_adjustment_bps: integer
      cashout_adjustment_bps: integer
      property_type_adjustment_bps: integer
      loan_amount_adjustment_bps: integer
      state_adjustment_bps: integer
      total_adjustment_bps: integer
    sofr_current: decimal
    treasury_10yr: decimal
    spread_over_benchmark: decimal
    confidence: decimal
    last_updated: timestamp
```

```yaml
GET /api/v1/rates/market:
  description: Current market rate snapshot
  auth: required
  rate_limit: 200 req/min
  cache: 15 minutes
  
  response:
    updated_at: timestamp
    sofr_overnight: decimal
    sofr_30day: decimal
    treasury_10yr: decimal
    treasury_5yr: decimal
    dscr_market_rates:
      30yr_fixed: {avg: decimal, low: decimal, high: decimal}
      5_6_arm: {avg: decimal, low: decimal, high: decimal}
      7_6_arm: {avg: decimal, low: decimal, high: decimal}
    rate_trend: enum[rising, stable, falling]
    week_over_week_change_bps: integer
```

#### Rent Data APIs

```yaml
POST /api/v1/rent/estimate:
  description: Get rent estimates from multiple sources for a property
  auth: required
  rate_limit: 30 req/min
  performance: p99 < 3s (external API calls)
  
  request:
    address: string
    city: string
    state: string
    zip: string
    property_type: string
    units: integer
    bedrooms: integer
    bathrooms: decimal
    sqft: integer
  
  response:
    property_id: uuid
    estimates:
      - source: string  # airdna, rentcast, rentometer
        ltr_rent: decimal
        ltr_rent_range: {low: decimal, high: decimal}
        ltr_confidence: decimal
        str_revenue: decimal
        str_revenue_range: {low: decimal, high: decimal}
        str_occupancy: decimal
        str_adr: decimal
        str_confidence: decimal
        estimate_date: date
    blended:
      ltr_rent: decimal
      str_revenue: decimal
      blend_rent: decimal
      blend_methodology: string
    lesser_of: decimal  # Min of all sources
    neighborhood_median: decimal
    recommendation: string  # Which rent figure to use for DSCR
```

```yaml
GET /api/v1/rent/history/{property_id}:
  description: Historical rent estimates for a property
  auth: required
  
  query_params:
    source: string
    from_date: date
    to_date: date
  
  response:
    property_id: uuid
    estimates:
      - date: date
        source: string
        ltr_rent: decimal
        str_revenue: decimal
```

#### Fraud Detection APIs

```yaml
POST /api/v1/fraud/analyze:
  description: Analyze rent claims for fraud indicators
  auth: required (pro+ plan)
  rate_limit: 10 req/min
  performance: p99 < 5s (ML inference)
  
  request:
    property_id: uuid
    claimed_rent: decimal
    claimed_source: string
    lease_document_url: string (optional, S3 presigned URL)
  
  response:
    analysis_id: uuid
    fraud_score: decimal (0-100, higher = more suspicious)
    risk_level: enum[low, medium, high, critical]
    confidence: decimal
    
    module_scores:
      statistical:
        score: decimal
        rent_vs_neighborhood_pct: decimal
        rent_vs_comps_pct: decimal
        flags: string[]
      geospatial:
        score: decimal
        spatial_outlier: boolean
        flags: string[]
      temporal:
        score: decimal
        rent_growth_rate: decimal
        seasonal_deviation: decimal
        flags: string[]
      document:  # Only if lease provided
        score: decimal
        flags: string[]
    
    explanation:
      - factor: string
        impact: decimal  # SHAP value
        direction: enum[increases_risk, decreases_risk]
        description: string
    
    recommendations: string[]
    comparable_rents:  # What the rent SHOULD be
      - source: string
        amount: decimal
    created_at: timestamp
```

#### User & Scenario Management APIs

```yaml
POST /api/v1/scenarios:
  description: Save a loan scenario
  auth: required

GET /api/v1/scenarios:
  description: List user's saved scenarios
  auth: required
  query_params:
    page: integer
    per_page: integer
    sort_by: enum[created_at, dscr, cash_to_close]
    lender_id: uuid

GET /api/v1/scenarios/{id}:
  description: Get a saved scenario with all details
  auth: required

PUT /api/v1/scenarios/{id}:
  description: Update a saved scenario
  auth: required

DELETE /api/v1/scenarios/{id}:
  description: Delete a saved scenario
  auth: required

POST /api/v1/scenarios/{id}/compare:
  description: Compare this scenario with alternatives
  auth: required
  request:
    compare_lenders: boolean
    compare_io: boolean
    compare_arm_vs_fixed: boolean

GET /api/v1/scenarios/{id}/share:
  description: Generate a shareable link for a scenario
  auth: required
  response:
    share_url: string
    expires_at: timestamp

POST /api/v1/properties:
  description: Create/save a property

GET /api/v1/properties:
  description: List user's properties

GET /api/v1/properties/{id}:
  description: Get property details

POST /api/v1/borrowers:
  description: Create/save a borrower profile

GET /api/v1/borrowers:
  description: List user's borrower profiles
```

#### Authentication APIs

```yaml
POST /api/v1/auth/register:
  request:
    email: string
    password: string
    first_name: string
    last_name: string
    role: enum[borrower, broker]

POST /api/v1/auth/login:
  request:
    email: string
    password: string
  response:
    access_token: string (JWT, 15min TTL)
    refresh_token: string (7d TTL)
    user: object

POST /api/v1/auth/refresh:
  request:
    refresh_token: string
  response:
    access_token: string
    refresh_token: string

POST /api/v1/auth/logout:
  request:
    refresh_token: string

POST /api/v1/auth/forgot-password:
  request:
    email: string

POST /api/v1/auth/reset-password:
  request:
    token: string
    new_password: string

POST /api/v1/auth/verify-email:
  request:
    token: string

# OAuth
GET /api/v1/auth/google:
GET /api/v1/auth/microsoft:
GET /api/v1/auth/callback/{provider}:
```

### 3.3 API Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Versioning** | URL-based: `/api/v1/...`. Breaking changes increment version |
| **Pagination** | Cursor-based for large collections, offset-based for small |
| **Error Format** | `{error: {code: "DSCR_BELOW_MINIMUM", message: "...", details: [...]}}` |
| **Rate Limiting** | Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| **Idempotency** | `Idempotency-Key` header for POST requests (prevents duplicate calculations) |
| **Compression** | gzip/br for responses > 1KB |
| **CORS** | Whitelist: platform domain + localhost (dev) |
| **Request Validation** | Zod schemas validated on both client and server |

### 3.4 Additional Endpoints (Future Phases)

| Endpoint | Phase | Description |
|----------|-------|-------------|
| `POST /api/v1/portfolio/analyze` | P2 | Portfolio-level DSCR analysis across all properties |
| `POST /api/v1/portfolio/stress-test` | P2 | Cascade default modeling |
| `POST /api/v1/nl/query` | P2 | Natural language DSCR queries ("cheapest way to finance this duplex") |
| `POST /api/v1/optimization/auto-structure` | P3 | RL-based auto deal structuring |
| `GET /api/v1/alerts/rate` | P1 | Rate alert triggers |
| `POST /api/v1/submissions/track` | P2 | Track actual loan submissions |
| `GET /api/v1/analytics/market` | P2 | Market-wide DSCR analytics |
| `POST /api/v1/documents/upload` | P2 | Lease/appraisal document upload |
| `POST /api/v1/documents/analyze` | P3 | OCR + fraud analysis on documents |

---

## 4. DSCR CALCULATION ENGINE ARCHITECTURE

### 4.1 Engine Design Philosophy

The DSCR calculation engine is the **heart of the platform**. It must be:
1. **Deterministic** — Same inputs always produce the same output (no floating-point ambiguity)
2. **Auditable** — Every calculation can be traced step-by-step
3. **Extensible** — New lenders, rules, and products can be added without code changes
4. **Fast** — <100ms for single lender, <2s for all-lender batch
5. **Accurate** — Matches lender underwriting calculations to the penny

### 4.2 Architecture: Library + Service Pattern

```
┌──────────────────────────────────────────────────┐
│                 API Route Handler                  │
│         (input validation, auth, rate limit)       │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│              DSCR Calculation Service              │
│  (orchestration: loads lender rules, calls engine) │
│                                                    │
│  1. Resolve lender rules (from cache/DB)           │
│  2. Resolve rent data (lesser-of logic)            │
│  3. Resolve rate (base + LLPA grid)               │
│  4. Call DscrEngine.calculate()                   │
│  5. Apply lender-specific overlays                 │
│  6. Calculate max loan at target DSCRs             │
│  7. Calculate cash-to-close                       │
│  8. Return result + audit trail                    │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│              DSCR Engine Core (Library)            │
│  Pure functions, no I/O, no side effects           │
│                                                    │
│  ┌─────────────┐  ┌──────────────┐               │
│  │ Amortization │  │ PITIA Builder│               │
│  │ Calculator   │  │              │               │
│  └─────────────┘  └──────────────┘               │
│  ┌─────────────┐  ┌──────────────┐               │
│  │ DSCR Calc    │  │ Max Loan     │               │
│  │              │  │ Solver       │               │
│  └─────────────┘  └──────────────┘               │
│  ┌─────────────┐  ┌──────────────┐               │
│  │ Qualifying   │  │ Reserve Calc │               │
│  │ Rate Resolver│  │              │               │
│  └─────────────┘  └──────────────┘               │
└──────────────────────────────────────────────────┘
```

**Decision: Library, NOT microservice.**
- The DSCR engine is pure computation — no I/O, no side effects
- Packaging as a library (npm package: `@dscr/engine`) allows:
  - Direct use in API routes (no network hop)
  - Direct use in frontend (WASM or JS) for instant client-side preview
  - Unit testing without infrastructure
  - Version pinning (engine v2.1.3 always produces same results)
- The service layer handles orchestration (loading data, caching, audit logging)
- The library handles pure math

### 4.3 Core Calculation Modules

```typescript
// Simplified TypeScript interface for the DSCR Engine

interface DscrEngine {
  // Module 1: Amortization Calculator
  calculateMonthlyPayment(input: {
    loanAmount: Decimal;
    annualRate: Decimal;      // Note rate as decimal (e.g., 0.0725 = 7.25%)
    termMonths: number;       // 360, 480, etc.
    ioPeriodMonths: number;   // 0 for no IO, 60 for 5yr IO
  }): {
    pAndI: Decimal;           // Monthly P&I (fully amortizing)
    ioPayment: Decimal;       // IO payment during IO period
    amortizingPayment: Decimal; // P&I after IO period ends
  };
  
  // Module 2: PITIA Builder
  buildPitia(input: {
    principal: Decimal;
    interest: Decimal;
    monthlyTax: Decimal;
    monthlyInsurance: Decimal;  // HOI + flood + wind
    monthlyHoa: Decimal;
  }): {
    pitia: Decimal;
    breakdown: PitiaBreakdown;
  };
  
  // Module 3: DSCR Calculator
  calculateDscr(input: {
    grossRent: Decimal;
    pitia: Decimal;
    rounding: 'down_two' | 'nearest' | 'up_two';  // Lender-specific
  }): {
    dscr: Decimal;
    raw: Decimal;             // Before rounding
    rounded: Decimal;         // After rounding
  };
  
  // Module 4: Max Loan Solver
  solveMaxLoan(input: {
    grossRent: Decimal;
    targetDscr: Decimal;       // 1.0, 1.10, 1.25, etc.
    annualRate: Decimal;
    termMonths: number;
    ioPeriodMonths: number;
    monthlyTax: Decimal;
    monthlyInsurance: Decimal;
    monthlyHoa: Decimal;
    maxLtv: Decimal;           // Lender's max LTV constraint
    propertyValue: Decimal;
  }): {
    maxLoanFromDscr: Decimal;  // Max loan where DSCR = target
    maxLoanFromLtv: Decimal;   // Max loan from LTV constraint
    maxLoan: Decimal;          // Min of the two (binding constraint)
    bindingConstraint: 'dscr' | 'ltv';
  };
  
  // Module 5: Qualifying Rate Resolver
  resolveQualifyingRate(input: {
    noteRate: Decimal;
    product: LoanProduct;       // fixed, arm_5_6, arm_7_6, etc.
    qualifyingRule: QualifyingRateRule;
    margin: Decimal;           // ARM margin
    indexValue: Decimal;       // Current SOFR
    lifetimeCap: Decimal;      // ARM lifetime cap
  }): Decimal;                 // Rate to use for DSCR calculation
  
  // Module 6: Rent Resolver
  resolveQualifyingRent(input: {
    marketRent: Decimal;       // From 1007/1025 or AVM
    leaseRent: Decimal;        // In-place lease
    rentMode: RentMode;        // lesser_of, market_only, kiavi_110, etc.
    strRevenue: Decimal;       // STR revenue (if applicable)
    strDiscount: Decimal;      // Lender's STR haircut (e.g., 0.80)
  }): {
    qualifyingRent: Decimal;
    source: string;            // Which figure was used
    lesserOfApplied: boolean;
  };
  
  // Module 7: Reserve Calculator
  calculateReserves(input: {
    pitia: Decimal;
    reserveMonths: Decimal;     // From lender parameters
    additionalPerProperty: Decimal;
    financedProperties: number;
    noReserveOption: boolean;
  }): {
    reserveAmount: Decimal;
    reserveMonths: Decimal;
    waived: boolean;
  };
  
  // Module 8: Cash-to-Close Calculator
  calculateCashToClose(input: {
    purchasePrice: Decimal;
    loanAmount: Decimal;
    closingCostsPct: Decimal;  // e.g., 0.03 = 3%
    prepaidEscrow: Decimal;
    reserveRequirement: Decimal;
    reservesAvailable: Decimal;
  }): {
    downPayment: Decimal;
    closingCosts: Decimal;
    prepaidEscrow: Decimal;
    reservesRequired: Decimal;
    cashToClose: Decimal;
    reserveShortfall: Decimal;
  };
}
```

### 4.4 Lender Rules Engine Architecture

```typescript
// Rules engine: configurable per lender, no code changes for new lenders
interface LenderRuleSet {
  lenderId: string;
  
  // Eligibility rules (pass/fail)
  eligibility: {
    minDscr: number;
    maxLtvByPurpose: Record<LoanPurpose, number>;
    minFico: number;
    propertyTypesAllowed: string[];
    statesAvailable: string[];
    statesExcluded: string[];
    entityTypesAllowed: string[];
    entityStatesRequired: string[];
    maxFinancedProperties: number;
    minLoanAmount: number;
    maxLoanAmount: number;
  };
  
  // Calculation rules (affect DSCR outcome)
  calculation: {
    dscrFormula: 'rent_pitia' | 'rent_pi' | 'noi_ds';
    dscrRounding: 'down_two' | 'nearest' | 'up_two';
    rentMode: RentMode;
    strDiscount: number;
    qualifyingRateRule: QualifyingRateRule;
    ioSurcharge: number;       // DSCR surcharge for IO
  };
  
  // Pricing rules (affect rate estimate)
  pricing: {
    pricingGridIds: string[];  // References to lender_pricing_grids
    baseRateSource: 'sofr_plus_margin' | 'treasury_plus_spread' | 'fixed_grid';
  };
  
  // Reserve rules
  reserves: {
    monthsRequired: number;
    additionalPerProperty: number;
    noReserveOption: boolean;
    retirementFundsAllowed: boolean;
    retirementFundsPct: number; // e.g., 0.60
  };
  
  // Overlay adjustments (behavioral intelligence)
  overlays?: {
    dscrFlexibility?: number;   // Observed DSCR can be X below minimum
    reserveFlexibility?: number; // Observed reserves can be X% below requirement
    approvalProbability?: number; // Model-derived approval probability
  };
}

// Rules are loaded from DB, cached in Redis (TTL: 15 min), and applied at runtime
// Adding a new lender = INSERT into lenders + lender_pricing_grids tables
// No code deployment needed
```

### 4.5 LLPA Grid Lookup Algorithm

```typescript
// Binary search in sorted pricing grid for O(log n) lookup
function lookupLLPA(grid: PricingGrid, params: {
  fico: number;
  ltv: number;
  dscr: number;
  loanAmount: number;
  purpose: string;
  propertyType: string;
  state: string;
}): { totalBps: number; breakdown: GridLookupResult[] } {
  
  const adjustments: GridLookupResult[] = [];
  
  // Each grid_type is a separate lookup
  for (const gridType of grid.types) {
    const match = gridType.adjustments.find(adj => {
      return params.fico >= adj.fico_min && params.fico <= adj.fico_max
          && params.ltv >= adj.ltv_min && params.ltv <= adj.ltv_max;
    });
    
    if (match) {
      adjustments.push({
        type: gridType.grid_type,
        bps: match.bps,
        description: `${gridType.grid_type}: ${match.fico_min}-${match.fico_max} FICO / ${match.ltv_min}-${match.ltv_max}% LTV`
      });
    }
  }
  
  const totalBps = adjustments.reduce((sum, adj) => sum + adj.bps, 0);
  return { totalBps, breakdown: adjustments };
}
```

### 4.6 Max Loan at Target DSCR — Solver Algorithm

```typescript
// Solve for max loan amount where DSCR = targetDscr
// PITIA = (P+I) + T + I + HOA
// DSCR = Rent / PITIA
// At target DSCR: targetDscr = Rent / PITIA
// Therefore: PITIA = Rent / targetDscr
// And: (P+I) = PITIA - T - I - HOA
// Then solve: loanAmount such that monthlyPayment(loanAmount, rate, term) = (P+I)

function solveMaxLoan(params: {
  rent: Decimal;
  targetDscr: Decimal;
  annualRate: Decimal;
  termMonths: number;
  ioPeriodMonths: number;
  monthlyTax: Decimal;
  monthlyInsurance: Decimal;
  monthlyHoa: Decimal;
  maxLtv: Decimal;
  propertyValue: Decimal;
}): MaxLoanResult {
  
  // Step 1: Calculate max PITIA at target DSCR
  const maxPitia = params.rent.div(params.targetDscr);
  
  // Step 2: Calculate max P&I (subtract fixed costs)
  const maxPAndI = maxPitia
    .minus(params.monthlyTax)
    .minus(params.monthlyInsurance)
    .minus(params.monthlyHoa);
  
  // Step 3: Reverse-solve loan amount from P&I
  // For amortizing: P&I = L * [r(1+r)^n] / [(1+r)^n - 1]
  // Therefore: L = P&I * [(1+r)^n - 1] / [r(1+r)^n]
  const monthlyRate = params.annualRate.div(12);
  let maxLoanFromDscr: Decimal;
  
  if (params.ioPeriodMonths > 0) {
    // During IO period: P&I = L * r (interest only)
    // L = P&I / r
    maxLoanFromDscr = maxPAndI.div(monthlyRate);
  } else {
    // Fully amortizing
    const r = monthlyRate;
    const n = params.termMonths;
    const rn = r.mul(Decimal.pow(r.plus(1), n));
    const factor = rn.div(Decimal.pow(r.plus(1), n).minus(1));
    maxLoanFromDscr = maxPAndI.div(factor);
  }
  
  // Step 4: Apply LTV constraint
  const maxLoanFromLtv = params.propertyValue.mul(params.maxLtv).div(100);
  
  // Step 5: Binding constraint
  const maxLoan = Decimal.min(maxLoanFromDscr, maxLoanFromLtv);
  const bindingConstraint = maxLoanFromDscr.lt(maxLoanFromLtv) ? 'dscr' : 'ltv';
  
  return { maxLoan, maxLoanFromDscr, maxLoanFromLtv, bindingConstraint };
}
```

### 4.7 Performance Optimization

| Technique | Implementation | Impact |
|-----------|---------------|--------|
| **Decimal.js for precision** | All financial calculations use `decimal.js` (128-bit) | Eliminates floating-point errors in DSCR |
| **Redis rule cache** | Lender rulesets cached with 15min TTL | Avoids DB query per calculation |
| **Precomputed amortization factors** | Monthly payment factor = [r(1+r)^n] / [(1+r)^n - 1] cached for common rate/term combos | Eliminates exponentiation per calc |
| **Batch parallelism** | `Promise.all()` for multi-lender calculations | 20 lenders in ~200ms instead of 2000ms |
| **WASM for Monte Carlo** | Python Monte Carlo compiled to WASM via Pyodide or Rust rewrite | 10x speedup for 100K iterations |
| **Connection pooling** | PgBouncer with 20 connections | Avoids connection setup overhead |
| **Gzip compression** | API responses > 1KB | 70-80% bandwidth reduction |

### 4.8 Engine Versioning & Audit

Every calculation produces a **formula trace** — a step-by-step record of how the result was derived:

```json
{
  "engine_version": "2.1.3",
  "steps": [
    {"step": "rent_resolution", "input": {"market": 2800, "lease": 2500, "mode": "lesser_of"}, "output": 2500},
    {"step": "rate_resolution", "input": {"base": 7.25, "fico_ltv_adj": 0.75, "dscr_adj": 0.25}, "output": 8.25},
    {"step": "monthly_payment", "input": {"loan": 320000, "rate": 8.25, "term": 360}, "output": 2405.63},
    {"step": "pitia", "input": {"pi": 2405.63, "tax": 350, "insurance": 175, "hoa": 0}, "output": 2930.63},
    {"step": "dscr", "input": {"rent": 2500, "pitia": 2930.63}, "output": 0.85},
    {"step": "max_loan_at_1.25", "input": {"rent": 2500, "pitia_target": 2000, ...}, "output": 218750, "binding": "dscr"}
  ]
}
```

---

## 5. REAL-TIME DATA PIPELINE

### 5.1 Pipeline Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  External     │     │   Ingestion  │     │  Processing  │     │   Storage    │
│  Sources      │     │   Layer      │     │    Layer     │     │    Layer     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                     │                     │                     │
       │  ┌──────────────┐  │  ┌──────────────┐  │  ┌──────────────┐  │
       ├──┤ SOFR/Treasury │──┤─→│ Lambda       │──┤─→│ TimescaleDB  │──┤ rate_snapshots
       │  │ Fed API       │  │  │ (validate,   │  │  │ (time-series)│  │
       │  └──────────────┘  │  │  normalize)   │  │  └──────────────┘  │
       │                     │  └──────────────┘  │                     │
       │  ┌──────────────┐  │  ┌──────────────┐  │  ┌──────────────┐  │
       ├──┤ AirDNA API    │──┤─→│ ECS Task     │──┤─→│ PostgreSQL   │──┤ rent_estimates
       │  │ RentCast API  │  │  │ (aggregate,  │  │  │ (relational) │  │
       │  │ Rentometer    │  │  │  blend,      │  │  └──────────────┘  │
       │  └──────────────┘  │  │  cache)       │  │                     │
       │                     │  └──────────────┘  │  ┌──────────────┐  │
       │  ┌──────────────┐  │  ┌──────────────┐  │  │ Redis        │──┤ rate cache
       ├──┤ Lender Rate   │──┤─→│ ECS Task     │──┤─→│ (cache)      │  │ rent cache
       │  │ Sheets (PDF)  │  │  │ (OCR, parse, │  │  └──────────────┘  │ lender cache
       │  └──────────────┘  │  │  grid update) │  │                     │
       │                     │  └──────────────┘  │                     │
       │  ┌──────────────┐  │  ┌──────────────┐  │                     │
       └──┤ User          │──┤─→│ EventBridge  │──┤─→ Behavioral ML     │
          │ Submissions   │  │  │ (event bus)  │  │   pipeline          │
          └──────────────┘  │  └──────────────┘  │                     │
                              │                     │                     │
                              │  ┌──────────────┐  │                     │
                              └──┤ SQS Queues   │──┘                     │
                                 │ (dead-letter,│                        │
                                 │  retry)      │                        │
                                 └──────────────┘                        │
```

### 5.2 Data Source Integrations

#### Treasury/SOFR Rate Feeds

```yaml
Source: Federal Reserve FRED API (free)
  URL: https://fred.stlouisfed.org/docs/api/fred/
  Series:
    - SOFR: SOFR
    - 30-Day SOFR Average: SOFR30DAYAVG  
    - 10-Year Treasury: DGS10
    - 5-Year Treasury: DGS5
  Frequency: Daily (updated ~4:00 PM ET)
  Pipeline:
    - EventBridge scheduled rule: cron(0 21 * * ? *)  # 9 PM UTC = 4 PM ET
    - Lambda: fetch → validate (range check) → upsert rate_snapshots → update Redis cache
    - Alert: if rate change > 25bps in 1 day → SNS notification
  Cache:
    - Redis: key "market:rates" → JSON with 15min TTL
    - Frontend: React Query with 15min staleTime
```

#### AirDNA/RentCast Rent Data

```yaml
Source: AirDNA API (paid, STR data)
  URL: https://api.airdna.co/v1/
  Endpoints:
    - /market/property: STR revenue, occupancy, ADR
    - /market/rental-rates: LTR comparable rents
  Rate Limit: 1000 requests/month (base plan)
  Pipeline:
    - On-demand: triggered by user address input (with 24hr cache)
    - Batch: weekly refresh of top 1000 ZIP codes (scheduled)
    - Result: upsert rent_estimates table
  Caching:
    - Redis: key "rent:{property_id}:{source}" → 24hr TTL
    - Skip re-fetch if estimate < 7 days old

Source: RentCast API (paid, LTR data)
  URL: https://api.rentcast.io/v1/
  Endpoints:
    - /avm/rent/long-term: LTR rent estimate with confidence
    - /avm/rent/short-term: STR rent estimate
  Rate Limit: 5000 requests/month
  Pipeline: Same as AirDNA (on-demand + weekly batch)

Source: Rentometer API (paid, LTR data)
  URL: https://www.rentometer.com/api
  Pipeline: Same pattern, used as 3rd validation source
```

#### Lender Rate Sheet Monitoring

```yaml
Source: Lender rate sheets (PDF/web)
  Frequency: Varies by lender (daily to monthly)
  Pipeline:
    - Phase 1 (MVP): Manual upload via admin dashboard
      - Upload PDF → AWS Textract OCR → parse grid → update lender_pricing_grids
    - Phase 2 (Post-MVP): Automated monitoring
      - Scheduled ECS task: scrape lender websites
      - PDF comparison: diff new vs. old rate sheet
      - Auto-update pricing grids if changes detected
      - Alert admin for review before publishing
    - Phase 3: Broker community submissions
      - Broker uploads rate sheet photo
      - OCR + AI extraction
      - Community verification (upvote/downvote)
  Validation:
    - Rate changes > 50bps flagged for manual review
    - Grid consistency checks (higher LTV should not have lower adjustment)
    - Cross-reference with observed submission rates
```

#### User Transaction Data → Behavioral Models

```yaml
Source: lender_submissions table (internal)
  Pipeline:
    - Event: INSERT on lender_submissions → EventBridge → SQS
    - Consumer: ECS task (Python)
      - Update lender_overlays (rolling approval rates)
      - Update lender_capacity (appetite_level, approval_rate_7d)
      - Retrain behavioral models (weekly batch)
    - ML Pipeline:
      - Feature extraction (submission features → Feast feature store)
      - Model training (XGBoost, weekly)
      - Model validation (holdout set, SHAP values)
      - Model deployment (SageMaker Serverless, canary rollout)
      - Model monitoring (drift detection, performance tracking)
  Data Quality:
    - Minimum 30 observations per lender before publishing overlays
    - Confidence intervals on all behavioral estimates
    - Stale data flag: overlay untouched for >90 days → confidence decays
```

### 5.3 Event Bus Architecture

```yaml
EventBridge Rules:
  rate.update:
    source: ["dscr.rates"]
    detail-type: ["rate.changed"]
    targets: [SQS rate-update-queue, SNS rate-alert-topic]
  
  submission.created:
    source: ["dscr.submissions"]
    detail-type: ["submission.created", "submission.updated"]
    targets: [SQS behavioral-queue, Lambda notification-dispatcher]
  
  calculation.completed:
    source: ["dscr.engine"]
    detail-type: ["calculation.completed"]
    targets: [SQS audit-queue, CloudWatch metrics]

SQS Queues:
  rate-update-queue:
    visibility_timeout: 300s
    redrive_policy: {deadLetterTargetArn: rate-dlq, maxReceiveCount: 3}
  behavioral-queue:
    visibility_timeout: 600s
    redrive_policy: {deadLetterTargetArn: behavioral-dlq, maxReceiveCount: 3}
  audit-queue:
    visibility_timeout: 60s
    batch_size: 10
    target: Lambda audit-writer (batch insert into calculation_audit_log)
```

---

## 6. SECURITY & COMPLIANCE

### 6.1 Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
├─────────────────────────────────────────────────────────────┤
│  AWS Shield Standard (DDoS protection)                       │
│  AWS WAF (OWASP Top 10 rules, IP rate limiting)             │
├─────────────────────────────────────────────────────────────┤
│  CloudFront CDN (HTTPS only, HSTS, TLS 1.3)                 │
├─────────────────────────────────────────────────────────────┤
│  ALB (HTTPS termination, SSL certificate via ACM)            │
├─────────────────────────────────────────────────────────────┤
│  ECS Fargate (private subnets, no public IPs)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Application Security                                 │  │
│  │  - JWT auth with RS256 (asymmetric keys)              │  │
│  │  - RBAC: borrower, broker, lender, admin              │  │
│  │  - Input validation (Zod schemas)                     │  │
│  │  - SQL injection prevention (parameterized queries)   │  │
│  │  - XSS prevention (CSP headers, sanitization)         │  │
│  │  - CSRF tokens for state-changing requests            │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Aurora PostgreSQL (encrypted at rest, TLS in-transit)       │
│  ElastiCache Redis (encryption at rest + in-transit)        │
│  S3 (SSE-S3 + bucket policies, no public access)            │
│  Secrets Manager (auto-rotating DB credentials)              │
│  KMS (customer-managed keys for encryption)                  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Authentication & Authorization

| Component | Technology | Details |
|-----------|-----------|---------|
| **Auth Provider** | NextAuth.js v5 (Auth.js) | Built into Next.js; supports email/password + OAuth |
| **OAuth Providers** | Google, Microsoft | For broker/lender enterprise SSO |
| **JWT** | RS256 (asymmetric) | Access token: 15min TTL; Refresh token: 7d TTL; Rotated on use |
| **MFA** | TOTP (authenticator app) | Optional for borrowers; required for admin/lender roles |
| **Password Policy** | bcrypt (12 rounds) | Min 12 chars; breach check via HaveIBeenPwned API (k-anonymity) |
| **Session Store** | Redis | Stateless JWT + Redis for revocation list |
| **RBAC** | Custom middleware | 4 roles: borrower, broker, lender, admin; resource-level permissions |

### 6.3 PII Handling & Data Classification

```yaml
Data Classification:
  Public:
    - Lender parameters, rate data, educational content
    - No access controls needed
  
  Internal:
    - Aggregate behavioral intelligence (no individual PII)
    - Market analytics, approval rate aggregates
    - Employee access only
  
  Confidential:
    - Borrower profiles (FICO, financial data)
    - Property ownership data
    - Loan scenarios (not yet submitted)
    - Encrypted at rest; access logged; minimum privilege
  
  Restricted:
    - SSN (if collected — avoid if possible)
    - Bank account information
    - Full credit reports
    - Encrypted at rest + in transit; field-level encryption; audit trail

PII Fields (Confidential+):
  borrowers.fico                → Encrypted at application level
  borrowers.reserves_available  → Encrypted at application level
  borrowers.entity_name         → Encrypted at application level
  users.email                   → Encrypted at DB level (Aurora)
  users.phone                   → Encrypted at application level
  users.password_hash           → bcrypt (never decrypt)

Encryption:
  At Rest:     AES-256 via AWS KMS (customer-managed CMK)
  In Transit:  TLS 1.3 (minimum); HSTS preload
  Application: Field-level encryption via libsodium (sealed boxes)
  Backups:     Encrypted snapshots with separate KMS key

Data Retention:
  Calculation audit logs: 7 years (regulatory)
  User PII: Until account deletion + 30 days
  Rate snapshots: 5 years (historical analysis)
  Rent estimates: 2 years
  Session data: 30 days
```

### 6.4 SOC2 Type II Compliance

```yaml
Trust Service Criteria:

1. Security (Common Criteria):
   - Multi-factor authentication for all admin access
   - Automated patch management (ECS latest AMI, Dependabot for libraries)
   - Network segmentation (public/private/data subnets)
   - Vulnerability scanning: AWS Inspector (continuous) + quarterly penetration test
   - Incident response plan with <1hr detection SLA
   - Security headers: CSP, X-Frame-Options, HSTS, X-Content-Type-Options

2. Availability:
   - Aurora: 99.95% SLA with multi-AZ deployment
   - ECS Fargate: auto-scaling, health checks, circuit breakers
   - CloudFront: 99.99% SLA for static content
   - RPO: 5 minutes (Aurora continuous backup)
   - RTO: 15 minutes (ECS auto-replace, Aurora failover)
   - Status page: independent monitoring (Statuspage.io)

3. Processing Integrity:
   - DSCR calculation engine: deterministic, versioned, audited
   - Input validation: Zod schemas on every API endpoint
   - Calculation audit trail: every result stored with input snapshot
   - Data reconciliation: daily check of rate data consistency

4. Confidentiality:
   - PII encryption (see above)
   - Data access logging (CloudTrail + application-level)
   - Least-privilege IAM policies
   - VPC endpoints for AWS service communication (no internet)

5. Privacy:
   - CCPA compliance: data export, deletion, opt-out
   - Privacy policy: clear, accessible
   - Data Processing Agreement (DPA) with all sub-processors
   - Cookie consent (OneTrust or similar)
   - Data minimization: collect only what's needed

Audit Evidence:
  - AWS CloudTrail: API call logging (90-day retention, S3 archival)
  - AWS Config: resource configuration tracking
  - CloudWatch: application metrics and logs (1-year retention)
  - Application audit logs: calculation_audit_log table
  - Access reviews: quarterly, documented
  - Change management: GitHub PR reviews + CI/CD pipeline logs
```

### 6.5 Rate Limiting & Abuse Prevention

```yaml
API Rate Limiting:
  Implementation: Redis-based sliding window counter
  Limits:
    - Free tier: 100 calculations/month, 10 req/min
    - Pro tier: 1000 calculations/month, 100 req/min
    - Enterprise: unlimited, 1000 req/min
    - Unauthenticated: 5 req/min (public endpoints only)
  
  Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  Response: 429 Too Many Requests with Retry-After header
  Abuse: >3x rate limit in 1 minute → temporary IP block (15 min)

WAF Rules:
  - AWS Managed Core Rule Set (OWASP Top 10)
  - Rate-based rule: >2000 requests/5min from single IP → block
  - Geo-restriction: US-only (if applicable)
  - Bot protection: Challenge for suspicious user agents
  - SQL injection detection
  - XSS detection

DDoS Protection:
  - AWS Shield Standard (automatic, no config)
  - CloudFront absorbs volumetric attacks
  - Aurora auto-scales for connection floods
  - ECS auto-scales for compute floods
```

### 6.6 State-Specific Data Privacy

```yaml
CCPA (California):
  - Right to know: data export API
  - Right to delete: account deletion + 30-day purge
  - Right to opt-out: no sale of personal data (we don't sell data)
  - Do Not Track: honor browser DNT header
  - Privacy policy: clear disclosure of data practices

Other State Laws:
  - Virginia VCDPA: similar to CCPA
  - Colorado CPA: similar to CCPA
  - Connecticut CTDPA: similar to CCPA
  - Implementation: unified privacy framework covering all state laws

GLBA (Financial Data):
  - Since we handle borrower financial data, GLBA applies
  - Safeguards Rule: comprehensive information security program
  - Financial Privacy Rule: privacy notices and opt-out
  - Pretexting provisions: no social engineering to obtain data
```

---

## 7. SCALABILITY DESIGN

### 7.1 Scalability Targets

| Metric | Year 1 | Year 3 | Year 5 |
|--------|--------|--------|--------|
| Concurrent Users | 500 | 5,000 | 50,000 |
| DSCR Calculations/Day | 5,000 | 100,000 | 1,000,000 |
| Peak QPS | 50 | 500 | 5,000 |
| Lenders in System | 20 | 50 | 100 |
| Properties in DB | 50K | 500K | 5M |
| Rent Estimates Cached | 100K | 1M | 10M |

### 7.2 Database Scaling Strategy

```
Phase 1 (0-12 months): Single Aurora Serverless v2
  - Auto-scales 0.5-128 ACU
  - Read replica (1) for reporting queries
  - Sufficient for 5,000 calculations/day
  
Phase 2 (12-24 months): Read Replicas + Connection Pooling
  - 2 read replicas (PgBouncer routing)
  - Write: primary
  - Read: round-robin replicas
  - Lender data, rent estimates: read-heavy (95% reads)
  - Loan scenarios: write on creation, read-heavy after
  
Phase 3 (24+ months): Horizontal Partitioning
  - Partition rate_snapshots by time (already TimescaleDB)
  - Partition calculation_audit_log by month
  - Partition lender_submissions by lender_id
  - Consider Citus for multi-tenant scaling if needed
```

### 7.3 Caching Strategy

```yaml
Layer 1 - CDN Cache (CloudFront):
  - Static assets: 1 year (immutable with content hash)
  - Lender logos, public pages: 1 hour
  - Rate widget embeds: 15 minutes

Layer 2 - Application Cache (Redis):
  - Market rates: key "market:rates" → 15 min TTL
  - Lender rulesets: key "lender:{id}:rules" → 15 min TTL
  - Rent estimates: key "rent:{property_id}:{source}" → 24hr TTL
  - Rate estimates: key "rate:{lender}:{fico}:{ltv}:{dscr}" → 1hr TTL
  - User scenarios: key "user:{id}:scenarios" → 5 min TTL
  - Cache invalidation: write-through on data update

Layer 3 - Client Cache (React Query):
  - Lender list: staleTime 30 min, gcTime 1 hour
  - Market rates: staleTime 15 min
  - User scenarios: staleTime 2 min
  - Rent estimates: staleTime 1 hour

Cache Warming:
  - On deployment: pre-populate top 20 lender rulesets
  - Scheduled: refresh market rates every 15 min (Lambda)
  - On-demand: warm rent estimate cache on property page view
```

### 7.4 Compute Scaling

```yaml
ECS Fargate Auto-Scaling:
  Application Service:
    - Min: 2 tasks (HA)
    - Max: 20 tasks
    - Scale-up: CPU > 70% for 2 min → add 2 tasks
    - Scale-down: CPU < 30% for 10 min → remove 1 task
    -Cooldown: 60 seconds
  
  ML Service (Python):
    - Min: 1 task
    - Max: 10 tasks
    - Scale-up: SQS queue depth > 10 → add 1 task
    - Scale-down: SQS queue depth = 0 for 15 min → remove 1 task

Lambda (Data Ingestion):
  - Reserved concurrency: 10 (rate fetching, rent API proxy)
  - Provisioned concurrency: 0 (cold start acceptable for scheduled tasks)
  - Burst: up to 100 concurrent (for batch rent estimation)

SageMaker (ML Endpoints):
  - Serverless inference: 0-200 concurrent invocations
  - Auto-scaling: target 50% utilization
  - Pay-per-inference: cost proportional to usage
```

### 7.5 Cost Optimization

| Resource | Optimization | Monthly Cost Estimate (Year 1) |
|----------|-------------|-------------------------------|
| **Aurora Serverless** | Auto-scales to near-zero off-hours | $150-300 |
| **ECS Fargate** | 2 tasks min, scale to 20 | $100-500 |
| **ElastiCache** | t4g.small (sufficient for MVP) | $30-50 |
| **S3** | Intelligent tiering, lifecycle rules | $10-30 |
| **CloudFront** | Price class 100 (US/EU only) | $20-50 |
| **Lambda** | 1M free invocations/month | $0-10 |
| **SageMaker** | Serverless inference (pay-per-use) | $50-200 |
| **Secrets Manager** | $0.40/secret/month | $5 |
| **WAF** | $5/rule + $0.60/million requests | $20-50 |
| **Datadog** | 5 hosts, APM, logs | $200-400 |
| **Total** | | **~$600-1,600/month** |

---

## 8. DEVELOPMENT ROADMAP

### 8.1 MVP (Weeks 1-12)

```
Week 1-2:   Foundation
  ✅ Project scaffolding (Next.js 15, TypeScript, Tailwind, shadcn/ui)
  ✅ Database schema v1 (lenders, properties, borrowers, loan_scenarios)
  ✅ Prisma setup + initial migration
  ✅ Auth (NextAuth.js v5: email/password + Google OAuth)
  ✅ CI/CD pipeline (GitHub Actions → ECS Fargate)
  ✅ Terraform: VPC, ECS, Aurora, Redis, S3

Week 3-5:   DSCR Engine Core
  ✅ Amortization calculator (fixed + IO + ARM)
  ✅ PITIA builder
  ✅ DSCR calculator with lender-specific rounding
  ✅ Max loan solver (at DSCR 1.0, 1.10, 1.25)
  ✅ Rent resolver (lesser-of, market, lease, Kiavi 110%)
  ✅ Qualifying rate resolver (for ARMs)
  ✅ Reserve calculator
  ✅ Cash-to-close calculator
  ✅ Unit tests: 100+ test cases with known DSCR outcomes
  ✅ Engine published as @dscr/engine npm package

Week 6-7:   Core API + Lender Data
  ✅ POST /api/v1/dscr/calculate
  ✅ POST /api/v1/dscr/calculate-batch
  ✅ POST /api/v1/dscr/sensitivity
  ✅ GET /api/v1/lenders, GET /api/v1/lenders/{slug}
  ✅ Seed 10 lenders with verified parameters
  ✅ Pricing grids for top 5 lenders
  ✅ Redis caching for lender data

Week 8-9:   Frontend — DSCR Calculator
  ✅ Property input form (address, type, units, financials)
  ✅ Borrower input form (FICO, entity, reserves)
  ✅ Loan structure form (purpose, amount, product, IO)
  ✅ Rent input with real-time estimate fetching
  ✅ DSCR results dashboard (PITIA breakdown, DSCR, max loans)
  ✅ Lender comparison table
  ✅ Sensitivity analysis view
  ✅ Scenario save/load

Week 10-11: Rate Estimation + Polish
  ✅ GET /api/v1/rates/estimate (base rate + LLPA grid lookup)
  ✅ Rate estimation in lender comparison
  ✅ Cash-to-close breakdown UI
  ✅ User dashboard (saved scenarios, properties, borrowers)
  ✅ Error handling, loading states, empty states
  ✅ Mobile responsive layout

Week 12:    Launch Prep
  ✅ Load testing (k6: 100 concurrent users)
  ✅ Security audit (OWASP ZAP scan)
  ✅ UAT with 5 beta testers
  ✅ Production deployment
  ✅ Monitoring dashboards (Datadog)
  ✅ Documentation (API docs, user guide)
```

### 8.2 Phase 2 (Weeks 13-24) — Intelligence Layer

```
Week 13-15: Rent Data Integration
  □ AirDNA API integration (STR data)
  □ RentCast API integration (LTR data)
  □ Rentometer API integration (validation)
  □ Blended rent calculation with confidence scoring
  □ Rent estimate caching and refresh pipeline
  □ Rent history tracking (TimescaleDB)

Week 16-18: Fraud Detection (Python ML Service)
  □ Module 1: Statistical anomaly detection (rent vs. neighborhood)
  □ Module 2: Geospatial anomaly detection (spatial outliers)
  □ Module 3: Temporal anomaly detection (rent growth patterns)
  □ Module 4: Document analysis (OCR + lease validation) — basic
  □ Composite fraud scoring with SHAP explanations
  □ POST /api/v1/fraud/analyze endpoint
  □ Fraud analysis UI (risk meter, flag details, recommendations)

Week 19-21: Monte Carlo Simulation (Python)
  □ Vectorized Monte Carlo engine (NumPy + Numba)
  □ Rent volatility modeling (SFR vs. multifamily)
  □ Insurance/tax growth modeling
  □ ARM rate shock scenarios
  □ DSCR probability distribution output
  □ VaR and CVaR calculation
  □ Named stress test scenarios
  □ POST /api/v1/dscr/monte-carlo endpoint
  □ Monte Carlo visualization UI (distribution chart, stress tests)

Week 22-24: Lender Behavioral Intelligence
  □ Lender overlay data model and API
  □ Admin dashboard for overlay data entry
  □ Approval probability model (XGBoost)
  □ Lender capacity tracking (appetite cycling)
  □ POST /api/v1/lenders/match with behavioral data
  □ Behavioral intelligence UI (approval probability, flexibility indicators)
```

### 8.3 Phase 3 (Weeks 25-40) — Scale & Advanced Features

```
Week 25-28: Portfolio Analytics
  □ Multi-property portfolio DSCR analysis
  □ Cross-property correlation modeling
  □ Cascade default simulation
  □ Portfolio-level Monte Carlo
  □ Portfolio dashboard with aggregated risk metrics

Week 29-32: Real-Time Market Intelligence
  □ SOFR/Treasury automated ingestion pipeline
  □ Rate alert system (user-defined triggers)
  □ Lender rate sheet monitoring (automated OCR)
  □ Rate trend visualization
  □ Market cycle indicators

Week 33-36: Advanced AI Features
  □ Natural language DSCR queries
  □ Predictive rent modeling (LSTM time-series)
  □ Auto-deal structuring optimization
  □ Computer vision property assessment (P2/experimental)

Week 37-40: Platform & Scale
  □ Lender submission tracking
  □ Broker CRM integration
  □ API marketplace (public API for partners)
  □ White-label / embedded calculator
  □ SOC2 Type II audit preparation
```

### 8.4 Parallel Workstreams

```
STREAM A (Frontend):         STREAM B (Backend):         STREAM C (ML/Data):
Week 1-2:  Scaffolding       Week 1-2:  DB + Auth         Week 1-8:  No ML work
Week 3-5:  Design system     Week 3-5:  DSCR Engine       (focus on data collection)
Week 6-7:  Calc forms        Week 6-7:  Core APIs          
Week 8-9:  Results UI        Week 8-9:  Rate estimation   Week 8-12: Fraud model dev
Week 10-11: Dashboard        Week 10-11: Polish + cache   Week 10-12: MC engine dev
Week 12:   Launch!           Week 12:   Launch!           Week 12:   Model deployment
```

### 8.5 Testing Strategy

```yaml
Unit Tests (DSCR Engine):
  Framework: Vitest
  Coverage target: 95%+
  Tests: 200+ specific test cases
  Examples:
    - "DSCR = 2500/2930.63 = 0.85 (rounded down to 2 decimals)"
    - "Max loan at DSCR 1.25 with rent 2500, rate 8.25%, 360mo = $218,750 (DSCR binding)"
    - "IO payment on $320K at 8.25% = $2,200/month"
    - "Kiavi 110% rent mode: market $2500 → qualifying rent $2,750"
    - "ARM qualifying rate: note 7.5%, rule greater_of_2, SOFR 5.25% → qualify at 7.5%"
    - "Lesser-of: market $2800, lease $2500 → qualifying rent $2500"
  
  Every lender-specific rule tested independently:
    - Kiavi: no reserves, 110% market rent
    - Visio: 6-month PITIA reserves, 8-state entity requirement
    - Lima One: 1.3 DSCR minimum, 700 FICO
    - Griffin: 0.75 DSCR floor, no-ratio option

Integration Tests (API):
  Framework: Supertest + Vitest
  Tests:
    - POST /dscr/calculate returns correct PITIA + DSCR
    - POST /dscr/calculate-batch returns all eligible lenders
    - GET /lenders returns filtered list
    - Auth flow: register → login → calculate → save scenario
  Database: Test database with seeded lender data
  External APIs: Mocked (AirDNA, RentCast)

E2E Tests (Frontend):
  Framework: Playwright
  Tests:
    - Full DSCR calculation flow
    - Lender comparison flow
    - Scenario save and reload
    - Auth flow (register, login, logout)
  
Load Tests:
  Framework: k6
  Scenarios:
    - 100 concurrent DSCR calculations (p99 < 100ms)
    - 20 concurrent batch calculations (p99 < 2s)
    - 500 concurrent page loads (p99 < 500ms)
    - Sustained 50 QPS for 1 hour (no memory leaks)

Security Tests:
  - OWASP ZAP: automated scan before every release
  - npm audit: in CI pipeline (block on high severity)
  - Snyk: continuous dependency monitoring
  - Quarterly penetration test (third-party)
```

### 8.6 CI/CD Pipeline

```yaml
GitHub Actions Workflows:

1. PR Checks (on pull_request):
   - TypeScript: type-check, lint (ESLint), format (Prettier)
   - Python: lint (Ruff), format (Black), type-check (mypy)
   - Unit tests: DSCR engine (Vitest) + Python ML tests (pytest)
   - Build: Next.js build + Docker build
   - Security: npm audit + Snyk test
   - Preview deploy: Vercel preview URL
   - Time: ~5-8 minutes

2. Main Branch (on push to main):
   - All PR checks
   - Integration tests (with test DB)
   - E2E tests (Playwright)
   - Docker push to ECR
   - Terraform plan (infrastructure changes)
   - Deploy to staging
   - Smoke tests on staging
   - Time: ~15-20 minutes

3. Production Release (on tag v*):
   - All above
   - Load test (k6, 5 min)
   - Security scan (OWASP ZAP)
   - Deploy to production (blue/green via ECS)
   - Health check + smoke test
   - Rollback on failure (automatic)
   - Time: ~20-30 minutes

4. Scheduled (daily):
   - Dependency update PRs (Dependabot)
   - Database backup verification
   - SSL certificate expiration check
   - Cost monitoring alert

5. Scheduled (weekly):
   - Full E2E test suite
   - Performance regression test
   - Lender data freshness check
```

---

## 9. ARCHITECTURE DECISION RECORDS

### ADR-001: TypeScript for DSCR Engine (not Python)

**Context:** The DSCR calculation engine needs to be fast, type-safe, and shareable between frontend and backend.

**Decision:** Implement in TypeScript as an npm package (`@dscr/engine`). Python ML services call it via gRPC for standard calculations.

**Rationale:**
- DSCR formulas are arithmetic, not data science — no Python advantage
- Shared Zod schemas between client and server
- Sub-millisecond calculation with no Python startup overhead
- Can run in browser for instant preview (no API call needed)
- Easier to hire TypeScript developers than bilingual TS+Python engineers

**Consequences:** Monte Carlo simulation must be in Python (NumPy vectorization required). Two codebases for calculation logic, but clear separation: deterministic arithmetic (TS) vs. probabilistic simulation (Python).

---

### ADR-002: PostgreSQL over MongoDB

**Context:** The platform stores lenders, properties, borrowers, and loans — all relational data with complex joins.

**Decision:** PostgreSQL (Aurora Serverless v2) as primary database.

**Rationale:**
- Lender matching requires joining lenders → pricing_grids → overlays → capacity in a single query
- ACID transactions for loan scenario creation (insert scenario + audit log atomically)
- JSONB for flexible data (pricing grids, overlay conditions) within a relational structure
- TimescaleDB extension for time-series (rates, rent history) without additional infrastructure
- Proven at scale: every major fintech uses PostgreSQL

**Consequences:** Schema migrations require discipline. JSONB queries are less performant than native columns for filtering — use only when schema flexibility is needed.

---

### ADR-003: Monorepo with Dual Runtimes

**Context:** Frontend (Next.js) and backend (TypeScript services + Python ML) need to be developed together.

**Decision:** Monorepo using Turborepo. Three packages: `apps/web` (Next.js), `apps/api` (TypeScript services), `services/ml` (Python).

**Rationale:**
- Shared types between frontend and API (Zod schemas)
- Single CI/CD pipeline, single PR for cross-cutting changes
- Turborepo caching speeds builds by 3-5x
- Python service has its own `pyproject.toml` and virtual environment

**Consequences:** CI pipeline is more complex (two runtimes). Docker builds must be optimized (layer caching for both Node.js and Python).

---

### ADR-004: ECS Fargate over Kubernetes (EKS)

**Context:** Need container orchestration for TypeScript API and Python ML services.

**Decision:** ECS Fargate for MVP/Phase 2. Revisit EKS if we exceed 50 microservices.

**Rationale:**
- EKS requires dedicated DevOps (Kubernetes expertise, cluster management)
- ECS Fargate: zero server management, auto-scaling, simpler IAM
- At <10 services, ECS overhead is minimal
- Migration to EKS is straightforward (Docker containers are portable)

**Consequences:** Less flexibility than Kubernetes (no custom operators, limited scheduling). Acceptable for current scale.

---

### ADR-005: Real Rent Data via On-Demand API Calls (not Pre-Fetched)

**Context:** AirDNA/RentCast charge per API call. Pre-fetching rent for every US property is cost-prohibitive.

**Decision:** On-demand fetching with aggressive caching. Pre-fetch only for top 1000 ZIP codes.

**Rationale:**
- 150M+ US properties × $0.01/call = $1.5M to pre-fetch all
- On-demand with 24hr cache: ~$200/month at 5K calculations/day
- Top 1000 ZIP pre-fetch: covers 70% of queries for ~$500/month
- Stale cache acceptable for rent (changes slowly)

**Consequences:** First calculation for a new address takes 2-3 seconds (external API calls). Mitigated by: parallel API calls, loading skeleton UI, prefetch on property page view.

---

### ADR-006: Lender Parameters as Database Configuration (not Code)

**Context:** Each lender has unique rules (DSCR minimum, FICO floor, reserve requirements, pricing grids). These change frequently.

**Decision:** All lender parameters stored in database tables (lenders, lender_pricing_grids, lender_overlays). Rules engine loads configuration at runtime. No code changes to add/modify lenders.

**Rationale:**
- Lender rules change monthly (rate sheets) to quarterly (guideline updates)
- Code deployment for every lender change is unsustainable
- Business users (not engineers) should be able to update lender data
- Enables the admin dashboard for lender data management

**Consequences:** Runtime rule loading adds ~5ms per calculation. Mitigated by Redis caching (lender rules cached for 15 minutes). Must validate rule consistency on write (prevent impossible rule combinations).

---

## APPENDIX A: DSCR Formula Reference

All formulas confirmed from `DSCR_UNDERWRITING_FORMULA_DEEP_DIVE.md`:

```
DSCR = Gross Rental Income ÷ PITIA

PITIA = Principal + Interest + Tax + Insurance + HOA

Monthly P&I (Amortizing) = L × [r(1+r)^n] / [(1+r)^n - 1]
  Where: L = loan amount, r = monthly rate, n = term months

Monthly P&I (IO Period) = L × r
  Where: L = loan amount, r = monthly rate

Max Loan at Target DSCR:
  1. maxPITIA = Rent / targetDSCR
  2. maxP&I = maxPITIA - Tax - Insurance - HOA
  3. maxLoanFromDSCR = reverse-solve from P&I formula
  4. maxLoanFromLTV = propertyValue × maxLTV%
  5. maxLoan = min(maxLoanFromDSCR, maxLoanFromLTV)

Qualifying Rate Rules (ARMs):
  - note_rate: Use the note/start rate
  - fully_indexed: Use SOFR + margin
  - greater_of_2: max(note_rate, fully_indexed)
  - plus_200bp: note_rate + 2.00%

Kiavi Special: qualifying_rent = market_rent × 1.10
MK Lending STR: qualifying_rent = str_revenue × 0.80
Lesser-of Rule: qualifying_rent = min(market_rent, lease_rent)
```

## APPENDIX B: Lender Parameter Quick Reference

Top 5 lenders from `DSCR_LENDER_PARAMETERS_VERIFIED.md`:

| Parameter | Kiavi | Visio | Lima One | Griffin | Angel Oak |
|-----------|-------|-------|----------|---------|-----------|
| Min DSCR | 0.80 | ~1.0 | 1.30 | 0.75 | 0.75 |
| Max LTV Purchase | 80% (85% w/ 700+) | 80% | 80% | 80% | 80-90% |
| Max LTV Cash-Out | 75% | 75% | 75% | 75% | 75% |
| Min FICO | 660 | 680 | 700 | 660 | 620 |
| Reserves | None | 6mo PITIA | TBD | 6mo | Varies |
| STR Policy | Eligible | Eligible | Eligible | Eligible | Eligible |
| No-Ratio | No | No | No | Yes (75% LTV) | Yes |
| Entity States | None | 8 states | LLC OK | Varies | Varies |
| Loan Range | $75K-$3M | Up to $2M+ | $85K-$2.5M | Varies | Varies |
| Prepay | 3yr step | 5/4/3/2/1 | 3/5/7yr | Varies | Varies |

## APPENDIX C: Technology Version Pinning

| Technology | Version | Rationale |
|-----------|---------|-----------|
| Next.js | 15.x | App Router stable, Server Components, Turbopack |
| React | 19.x | Server Components, use() hook, Actions |
| TypeScript | 5.5+ | Decorators, satisfies operator, const type params |
| Node.js | 22 LTS | Long-term support, native fetch, test runner |
| Python | 3.12 | Performance improvements, f-string enhancements |
| PostgreSQL | 16 | Performance improvements, JSON improvements |
| Redis | 7.x | Function API, ACLs, streams improvements |
| Tailwind CSS | 4.x | CSS-first config, zero-config content detection |
| Prisma | 5.x | TypedSQL, performance improvements |
| Zod | 3.x | Type inference, schema composition |

---

*End of Technical Architecture Specification*  
*Next Steps: Review with engineering team, finalize technology contracts, begin Week 1 sprint.*
