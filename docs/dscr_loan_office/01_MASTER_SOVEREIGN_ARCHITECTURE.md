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

## 3. Technology Stack Requirements
- **Frontend**: Next.js 16, React, TypeScript, Tailwind 4, shadcn/ui.
- **Backend**: Python 3.11+, FastAPI, SciPy (deterministic math), Celery+Redis (async processing).
- **Database / Infrastructure**: PostgreSQL + JSONB + pgvector (Evidence Vault), S3 (PDFs, rate sheets), Vercel + Neon.

## 4. The Three Audiences of Every Quote
A DSCR quote must satisfy:
1. **The Borrower**: Cares about rate, fees, closing certainty, and fair constraints.
2. **The Capital Partner**: Cares about file cleanliness, defensibility, and audit trail.
3. **The Operator (Loan Officer)**: Cares about speed-to-verdict without downstream liability.
