# MASTER SOVEREIGN ARCHITECTURE & DOCTRINE
*Consolidated Core Blueprint for DSCR Sovereign OS*

## 1. The Six-Function Doctrine (Godmode v7)
Every feature, code module, and operational decision must trace back to exactly one of these six functions. Any capability that serves none of them is rejected.

| # | Function | Elite Standard | Platform Module |
|---|---|---|---|
| 01 | **Scenario Accuracy** | GO/NO-GO verdict with confidence score in under 10 minutes | `engine.ts` + `preflightGate.ts` + `rentCompAggregator.ts` |
| 02 | **Guideline Intelligence** | 25+ verified lenders with auto-fit scoring and two-quote rule | `lenders.ts` + `lenderGuidelines.ts` + `fitScorer.ts` |
| 03 | **Borrower Trust** | Every quote regulator-ready, backed by full constraint disclosure | `quoteExplainer.ts` + `pdfQuotePack.ts` |
| 04 | **Capital Partner Trust** | Zero-defect file standard, first-pass clean rate above 90% | `fileCompletenessEngine.ts` + `defectScorer.ts` |
| 05 | **Distribution** | 60%+ of revenue from repeat referral channels | `referralPortal.ts` + `channelAttribution.ts` |
| 06 | **Risk Discipline** | Hard decline gates + adverse-action compliance, false-decline below 5% | `declineGate.ts` + `adverseActionEngine.ts` |

## 2. The Three-Plane Architecture (Graph-Native OS)
The Sovereign OS is a **Graph-Native Financial Operating System** built on three planes:
1. **Projection Plane**: Human-facing views (Scenario Builder, Lender Matchmaker, IC Memo Command).
2. **Graph Plane**: The causal central nervous system. Nodes (Borrower, Property, Lender, Law, Rate) with Typed Edges (Qualifies, Conflicts, Supersedes, Shocks).
3. **Ledger Plane**: Immutable append-only event log. Every mutation, approval, and export is captured with full provenance.

## 3. Platform Maturity Levels (L0 to L5)
- **L0 Basic Calculator**: Commodity Rent / PITIA ratio.
- **L1 Judgment Engine**: Dual-Track DSCR (Qualification vs Survival) + GO/NO-GO verdicts.
- **L2 True-Cost Deal Desk**: All-In Effective Yield (AEY) lender ranking + Two-Quote Rule + One-Page IC Memos *(Broker's Day-1 Edge)*.
- **L3 Probabilistic Risk Desk**: 10,000-path t-copula Monte Carlo simulations ($P_{10}, P_{50}, P_{90}$).
- **L4 Outcome-Calibrated Engine**: Machine learning trained on proprietary funded deal tapes.
- **L5 Closed-Loop System**: Sourcing $\rightarrow$ Screening $\rightarrow$ Brokering $\rightarrow$ Warehouse funding $\rightarrow$ Securitization feedback loop.

## 4. Bootstrapping Business Strategy ($< $25k Target)
- **Phase 1 (Tier 3 Multi-State Broker)**: Launch using LLC-only borrower vesting exemptions across 20+ no-license states. Use deterministic software as lead magnet.
- **Phase 2 (Correspondent Lender)**: Originate on own paper using accumulated deal flow to secure warehouse lines.
- **Phase 3 (Direct Lender / Securitization)**: Pool loans and securitize direct to capital markets.

## 5. Technology Stack & UI Tokens
- **Frontend Stack**: Next.js 15+, React 19, TypeScript 5.6, Tailwind CSS v4 (`@tailwindcss/postcss`).
- **Design Tokens (FaithFi OKLCH Palette)**:
  - Background: `oklch(100% 0 0)` (#FFFFFF) | Foreground: `oklch(14.5% 0 0)`
  - Primary Teal: `#22605C` | Primary Teal Light: `#40736B` | Accent Gold: `#F7ECD1`
  - Typography: `New Spirit Condensed` (Serif Headings) + `Inter` (Sans-Serif Body)
- **Backend Stack**: Python 3.11+, FastAPI, SciPy (deterministic math), Celery + Redis.
- **Database / Infrastructure**: PostgreSQL + JSONB + pgvector (Evidence Vault), S3 (PDFs, rate sheets).

## 6. Form Fraud & Lead Defense Playbook (6-Layer Gate)
1. **Content Entropy**: RFC email check, E.164 phone normalization, ZIP verification, parcel geocoding.
2. **Enrichment & Verification**: Twilio Lookup line-type checks + OTP SMS/Email challenge.
3. **Behavioral Dynamics**: Dwell time, paste vs type detection, sub-2s bot submission traps.
4. **Network Signals**: Honeypot hidden fields, Cloudflare Turnstile, VPN/Proxy detection.
5. **Cross-Applicant Fingerprinting**: Device entropy and cross-submission property matching.
6. **Foreign National Reframe**: Foreign IP/VoIP is NEVER rejected; automatically routed to Foreign National DSCR funnel.
