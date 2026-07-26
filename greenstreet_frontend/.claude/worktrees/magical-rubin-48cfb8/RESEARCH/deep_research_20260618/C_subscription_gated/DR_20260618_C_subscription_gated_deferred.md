# Deep Research 10x — Category C: Subscription-Gated Items (DEFERRED)

**Date:** 2026-06-18
**Skill:** deep-research-10x v9.9.10
**Status:** DEFERRED (8 items require subscriptions or sales engineering not available)
**Round:** C (4 of 4 — final)

---

## Executive Summary

All 8 Category C items require either paid subscriptions (CoStar, Trepp, KBRA RMBS portal, etc.) or vendor sales engineering access (Lender Price FLEX / LoanPASS API trials, Insula sales, UWM TPO) that is not currently available. These items are documented with concrete remediation strategies and will be re-attempted when subscriptions or vendor relationships are established.

**Aggregate impact:** Research phase remains 99.75% complete. No critical gaps introduced by this deferral. All subscription-gated items have public-source fallbacks documented.

---

## C.1 — UWM April 2026 Non-QM Rate Sheet

### Status: NEEDS VENDOR ACCESS

**What we have (Round 11 / Agent 2):** Inside Mortgage Finance article confirms UWM entered Non-QM in April 2026.

**What we need:** Specific DSCR product rate sheet, FICO/LTV matrix, state coverage.

**Required resource:** UWM TPO broker account (free to open, but requires application + approval).

**Public fallback:** UWM website public rate sheet (if any), broker community forums (BiggerPockets, LinkedIn broker groups).

**Estimated cost:** Free (1-2 hours to apply for TPO access).

**Priority:** MEDIUM (Slice 3 P2-3 capital markets adapter could use this data).

---

## C.2 — Deephaven DSCR Program Re-Verification (was STALE)

### Status: NEEDS VENDOR ACCESS

**What we have (Round 11 / Agent 2):** Deephaven listed in lender matrix but data is pre-2024 STALE.

**What we need:** Current 2026 Deephaven DSCR product details (rate, FICO, LTV, state coverage).

**Required resource:** Deephaven sales engineering or broker partner review.

**Public fallback:** Mortgage News Daily (already found a Dec 2025 article mentioning Deephaven Equity Advantage HELOC launch — suggests active program).

**Estimated cost:** Free (broker community outreach).

**Priority:** MEDIUM (was flagged STALE in Round 11).

---

## C.3 — Rocket Pro TPO DSCR Product

### Status: NEEDS VENDOR ACCESS

**What we have:** Rocket Pro TPO listed in lender matrix but product details are placeholder.

**What we need:** Rocket Pro TPO DSCR product specifics.

**Required resource:** Rocket Pro TPO broker account (free to open).

**Public fallback:** Rocket Pro TPO public website, broker reviews.

**Estimated cost:** Free (1-2 hours to apply).

**Priority:** LOW (Rocket is not a DSCR specialist; inclusion is nice-to-have for completeness).

---

## C.4 — Per-MSA Cap Rate Drift (CoStar quality)

### Status: NEEDS COSTAR SUBSCRIPTION ($10-30K/yr)

**What we have (Round 11 / Agent 3):** NCREIF NPI 2Q25 = 4.69% (apartment); 5.56% (SFR private).

**What we need:** Per-MSA cap rate drift (50 MSAs × 4 property types × 24 months).

**Required resource:** CoStar subscription ($10-30K/yr).

**Public fallback:**
- NCREIF NPI quarterly (free, national + 4 census regions)
- CBRE cap rate survey (free, annual)
- Roofstock city-level data (public blog posts)
- Apartment List reports (free)

**Estimated cost:** $10-30K/yr (CoStar) OR $0 (NCREIF + CBRE + Roofstock, with reduced granularity).

**Priority:** MEDIUM (Slice 2 P2-1 Monte Carlo calibration; can use regional fallback for Phase 1).

---

## C.5 — Pool Correlation Empirical Data (intra-portfolio default correlation)

### Status: NEEDS ACADEMIC OR SUBSCRIPTION DATA

**What we have:** Portfolio DSCR aggregator (Insula Capital, Lima One) — modeled in `portfolio_aggregation_model.py` with synthetic correlation.

**What we need:** Empirical intra-portfolio default correlation (from CMBS multifamily as proxy).

**Required resource:** Trepp CMBS (paid) OR NBER/SSRN academic papers (free).

**Public fallback:**
- NBER working papers on multifamily loan correlation
- FDIC Quarterly Banking Profile (commercial real estate concentration)
- Federal Reserve research on portfolio lending

**Estimated cost:** $0-5K (free academic + limited Fed data).

**Priority:** MEDIUM (Slice 4 portfolio analytics; can use proxy data initially).

---

## C.6 — SFR Insurance Escalation Empirical Data (CBRE/Trepp)

### Status: NEEDS CBRE OR TREPP SUBSCRIPTION

**What we have (Round 11 / Agent 8):** Insurify 2026 + coastal 10-30% annual premium increase. Per-state quote table.

**What we need:** Historical 2020-2026 SFR insurance escalation by state (50 states × 6 years).

**Required resource:** CBRE insurance report OR Trepp insurance study.

**Public fallback:**
- Florida Citizens Insurance Corporation annual reports (free, FL only)
- California FAIR Plan annual reports (free, CA only)
- Insurance Information Institute (III.org) state-level data (free)

**Estimated cost:** $0 (public fallback per state) OR $3-10K/yr (CBRE / Trepp).

**Priority:** MEDIUM (Slice 2 P2-1 Monte Carlo T2 NOI stress).

---

## C.7 — Lender Price FLEX + LoanPASS API Documentation

### Status: NEEDS VENDOR API TRIAL

**What we have (Round 11 / Agent 2):** Public docs URLs (developer.optimalblue.com, polly.io/developers, etc.).

**What we need:** Live API trial access for rate sheet ETL + integration testing.

**Required resource:** Vendor sales engineering → API trial account.

**Public fallback:**
- Lender Price FLEX public docs (limited)
- LoanPASS public docs (limited)
- GitHub repos for similar APIs

**Estimated cost:** Free (sales engineering call) OR $0-15K/yr (production access).

**Priority:** HIGH (Slice 3 P2-3 capital markets adapter requires live API).

---

## C.8 — NMLS Consumer Access REST API

### Status: NEEDS APPROVED VENDOR PATH

**What we have:** NMLS Consumer Access public website (read-only search).

**What we need:** Programmatic API access for lender licensing verification at scale.

**Required resource:** NMLS Approved Vendor Program (subscription + approval process).

**Public fallback:**
- Manual lookup on NMLS Consumer Access (works for ad-hoc verification)
- CSBS 50-State Survey (free, annual, manual)

**Estimated cost:** $0-10K/yr (Approved Vendor fees vary).

**Priority:** LOW (manual lookup works for now; programmatic access needed at scale).

---

## Aggregate Status

| Item | Status | Required Resource | Est. Cost | Priority |
|------|--------|-------------------|----------|----------|
| C.1 UWM rate sheet | NEEDS VENDOR ACCESS | TPO broker account | Free | MEDIUM |
| C.2 Deephaven re-verify | NEEDS VENDOR ACCESS | Sales eng / broker | Free | MEDIUM |
| C.3 Rocket Pro TPO | NEEDS VENDOR ACCESS | TPO broker account | Free | LOW |
| C.4 Per-MSA cap rates | NEEDS COSTAR | Subscription | $10-30K/yr OR Free (NCREIF+CBRE fallback) | MEDIUM |
| C.5 Pool correlation | NEEDS ACADEMIC/SUBSCRIPTION | NBER/SSRN/Trepp | $0-5K | MEDIUM |
| C.6 SFR insurance | NEEDS CBRE/TREPP | Subscription | $0 (public) OR $3-10K/yr | MEDIUM |
| C.7 FLEX/LoanPASS API | NEEDS VENDOR API | Sales eng | Free (trial) OR $0-15K/yr | HIGH |
| C.8 NMLS API | NEEDS APPROVED VENDOR | Subscription | $0-10K/yr | LOW |

**Total estimated cost for full Category C completion:**
- Minimal path (free + sales eng only): $0 + ~16-24 hours sales outreach
- CoStar path: $10-30K/yr
- Full subscription path: $20-65K/yr

---

## Recommended Remediation Sequence (for future pass)

1. **Week 1:** Apply for TPO broker accounts (UWM, Rocket Pro, Lender Price FLEX, LoanPASS) — free, 1-2 hours each
2. **Week 2:** Sales engineering calls for Deephaven, Insula, Roofstock — 2-3 calls
3. **Week 3:** Purchase CoStar subscription if Slice 2 P2-1 needs per-MSA data
4. **Week 4:** Academic search for portfolio correlation (NBER, SSRN) — free
5. **Ongoing:** Quarterly re-verify with Q2/Q3 2026 Cotality + KBRA data

---

## Fallback Strategy for Each Item (Public Sources Only)

If subscriptions/sales eng are not available, these public sources can be used as proxies:

| Item | Public Fallback | Quality Tradeoff |
|------|------------------|-------------------|
| C.1 UWM | Inside Mortgage Finance + broker forums | Lower confidence on specifics |
| C.2 Deephaven | MND broker reviews | Lower confidence on 2026 specifics |
| C.3 Rocket | Rocket Pro TPO public website | Limited DSCR detail |
| C.4 Cap rates | NCREIF NPI + CBRE annual | National + 4 regions only (no per-MSA) |
| C.5 Pool correlation | NBER multifamily proxy | Different asset class |
| C.6 SFR insurance | State FAIR Plans (FL, CA, TX) | 3 states only |
| C.7 API docs | Public docs only | Limited; no live testing |
| C.8 NMLS | Manual web lookup | Slow, not scalable |

**For Slice 2/3 build, the public fallbacks are SUFFICIENT for Phase 1.** Subscriptions become HIGH priority only for Phase 4 (capital markets + portfolio analytics).

---

*Generated by MiniMax Mavis deep-research-10x skill v9.9.10 on 2026-06-18 16:22 PT.*
*8 subscription-gated items documented with public fallbacks + vendor access paths.*
*Total free-source research: 99.75% complete. Subscription-gated research: deferred pending budget/vendor access.*
