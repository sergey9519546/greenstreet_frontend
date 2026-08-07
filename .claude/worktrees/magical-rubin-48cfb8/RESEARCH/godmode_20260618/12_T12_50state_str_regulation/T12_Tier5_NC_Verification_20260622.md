---
type: verification
status: verified
tier: 5
title: "T12 Tier 5 Promotion — North Carolina (Primary-Statute Verified)"
summary: "North Carolina promoted to Tier 5 (primary-statute verified) on 2026-06-22. Confirmed N.C. Gen. Stat. Chapter 42A (Vacation Rental Act) Article 1 sections 42A-1 through 42A-4 read directly from ncleg.gov. Verified N.C. Gen. Stat. § 42A-4(3) defines 'vacation rental' as <90 days, § 42A-3 lists statutory exemptions, and cross-references to G.S. 160D-1117 (zoning) and G.S. 160D-1207(c) (local regulation preemption) confirmed via Minut 2026 secondary source."
source: "T12_summary.md (parent)"
vaulted_at: 2026-06-22
verified_at: 2026-06-22
verifier: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# T12 Tier 5 Promotion — North Carolina

**Date:** 2026-06-22
**Verdict:** North Carolina promoted from Tier 3 (3-source confident) to **Tier 5 (primary-statute verified)**.
**Verifier:** Mavis (root session, primary-source grep against ncleg.gov)

## Primary-Source Verification

### N.C. Gen. Stat. Chapter 42A — Vacation Rental Act
**Source:** https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_42A/Article_1.html
**Fetched:** 2026-06-22
**Status:** Live, primary source

### Key Sections Read Directly

| Section | Title | Confirmed Reading |
|---|---|---|
| § 42A-1 | Title | "This Chapter shall be known as the North Carolina Vacation Rental Act. (1999‑420, s. 1.)" |
| § 42A-2 | Purpose and scope | "growth of the tourism industry in North Carolina has led to a greatly expanded market of privately owned residences that are rented to tourists for vacation, leisure, and recreational purposes" |
| § 42A-3(a) | Application | "This Chapter applies to any person, partnership, corporation, limited liability company, association, or other business entity that acts as a landlord or real estate broker engaged in the rental or management of residential property for vacation rental as defined in this Chapter. G.S. 160D-1117 applies to properties covered under this Chapter." |
| § 42A-3(b) | Exemptions | (1) Hotels/motels Chapter 72; (2) Business-travel rentals; (3) Tenants with no other primary residence; (4) Nominal consideration |
| § 42A-4(3) | Vacation rental definition | "The rental of residential property for vacation, leisure, or recreation purposes for fewer than 90 days by a person who has a place of permanent residence to which he or she intends to return." |

### Cross-Reference Verification

| Citation | Topic | Source | Status |
|---|---|---|---|
| N.C. Gen. Stat. § 160D-1117 | Zoning for STR properties | ncleg.gov (cross-ref in §42A-3(a)) | Confirmed |
| N.C. Gen. Stat. § 160D-1207(c) | Local regulation preemption | Minut 2026 secondary | Confirmed (T12 secondary source) |
| 1999-420, s. 1 | Original enactment | S.L. 1999-420 | Confirmed in statute text |
| 2019-73, s. 1 | 2019 amendment | S.L. 2019-73 | Confirmed in § 42A-3(b) citation |
| 2022-62, s. 4 | 2022 amendment | S.L. 2022-62 | Confirmed in § 42A-3(b) citation |

## What This Tier 5 Promotion Confirms

1. **NC has a STATEWIDE STR statute** (Vacation Rental Act, Chapter 42A, enacted 1999) — not just local rule
2. **"Vacation rental" is statutorily defined** as <90 days with a permanent residence elsewhere
3. **Statutory exemptions exist** for hotels, business travel, and primary-residence tenants
4. **Local regulation IS allowed** but cross-referenced to zoning code (160D-1117) and subject to preemption analysis (160D-1207(c))
5. **Recent legislative activity** (SB 291 in 2025-26 session proposed statewide limits on local regulation) — T12 secondary source flagged this

## What Remains Tier 3 (not promoted)

- Local-level specifics: Raleigh permit numbers, Charlotte ordinance details, Asheville primary-residence rules, Chapel Hill cap mechanics — these are city ordinances, not the Chapter 42A statute itself
- 2025-2026 SB 291 outcome (still in session, not enacted as of verification date)
- Tax-rate specifics (6% state + 3-6% county occupancy)

## Verification Methodology

1. Identified NC as the largest "RESTRICTED" state lacking primary-statute verification (T12 entry cites "N.C. Gen. Stat. 42A" but only as a citation, not as read-and-verified)
2. Fetched the actual ncleg.gov HTML for Chapter 42A Article 1
3. Grep'd for: "Vacation Rental Act", "fewer than 90 days", "160D-1117", "160D-1207", "1999-420"
4. Cross-referenced amendments (2019-73, 2022-62) and confirmed they appear in the actual text
5. Read definition (4) and exemptions (b) directly — these are the operational keys for DSCR lenders
6. Confirmed via secondary (Minut 2026) that preemption analysis exists for 160D-1207(c)

## Net Effect on T12

- NC moves from "RESTRICTED with 3 sources (T12 internal)" to "RESTRICTED with primary statute (Tier 5)"
- DSCR lenders can now cite the actual Chapter 42A when underwriting NC STR deals
- For STR DSCR in NC: chapter 42A applies IF <90 days AND guest has a permanent residence elsewhere; local rules apply but must be analyzed under 160D framework

## Remaining 4 Mid-Restrictive States (still Tier 3-4)

- **NJ** — 3+ sources confirmed (Avalara, Minut, nj.com) but NO state-level STR statute exists; all rules are municipal ordinances
- **MD** — 3+ sources confirmed; 2024 HB 1312 established STR Commission; needs primary-source verification of HB 1312 text
- **IL** — 3+ sources confirmed; 2025 expansion of Hotel Occupation Tax; needs primary-source verification of 35 ILCS 145/ (Hotel Operators' Tax Act) amendment
- **TN** — 3+ sources confirmed; 2022 SB 1086 STR Unit Act cited; needs primary-source verification of TCA §13-7-101 et seq.

These 4 are queued for the next verification pass (estimated 1-2 hr each).
