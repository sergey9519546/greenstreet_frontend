---
type: outreach-pack
status: drafted
title: "DSCR Sovereign OS — Category C Outreach Templates"
summary: "Ready-to-send outreach for 6 ACTIVE Category C items. C.1-C.3 (TPO applications), C.7 (API trial), C.5 (NBER search plan), C.8 (NMLS lookup checklist). Estimated 16-24 hours total work. All templates + checklist below."
vaulted_at: 2026-06-21
author: Mavis
session: mvs_b78f9d32cd6348d6a48278d25e380ca4
---

# DSCR Sovereign OS — Category C Outreach Pack

**Date prepared:** 2026-06-21 19:09 PT
**Status:** READY TO SEND
**Total estimated effort:** 16-24 hours (mostly waiting for vendor responses)

---

## C.1 — UWM TPO Application (DSCR rate sheet)

### Application URL
https://www.uwm.com/tpo (TPO broker registration page)

### Application steps
1. Click "Become a Broker Partner" or equivalent
2. Fill in: NMLS ID, company name, branch info, contact email
3. Submit: typically 1-3 business days for approval
4. Once approved: request access to "Non-QM" product suite (UWM launched Non-QM April 2026 per Inside Mortgage Finance)
5. Pull: current rate sheet + DSCR product matrix + state coverage

### Email follow-up template (if needed)
```
Subject: DSCR Rate Sheet Request — United Wholesale Mortgage TPO

Hi UWM TPO team,

I'm evaluating wholesale broker access for portfolio DSCR originations.
We're building analytics on top of the lender stack (no origination) — looking
for the most current Non-QM rate sheet and DSCR product matrix to model against.

Specifically interested in:
- Current Non-QM/DSCR rate sheet (April 2026 launch or latest)
- FICO/LTV matrix for DSCR product
- State coverage
- Reserve requirements
- IO + ARM + cash-out options

NMLS #[your ID], Brokerage [your company].
Can you send the latest matrix or point me to the TPO portal location?

Thanks,
[your name]
```

### Expected turnaround
- Application approval: 1-3 business days
- Rate sheet delivery: same day after approval
- Total elapsed: 1 week

---

## C.2 — Deephaven DSCR Re-Verification

### Outreach paths (ranked)
1. **Mortgage News Daily** — Dec 2025 article mentioned Deephaven Equity Advantage HELOC launch. Contact MND reporter for Deephaven source contact.
2. **Deephaven website** — https://deephavenmortgage.com (broker contact form)
3. **LinkedIn** — find Deephaven TPO account executives; direct message

### Email template
```
Subject: Deephaven DSCR Product Refresh Request — DSCR Sovereign OS

Hi Deephaven team,

I'm building portfolio-DSCR analytics (not origination) and your DSCR product
is on my lender short-list. Last data I have is pre-2024 — would appreciate a
refresh on:

- Current DSCR rate sheet (May/June 2026 or latest)
- FICO/LTV matrix (DSCR >= 1.0 vs DSCR >= 0.75 with reserves)
- State coverage
- Cash-out + IO + ARM options
- Reserve requirements
- Recent product changes (2025-2026)

We're not a lender ourselves — analytics layer that helps DSCR brokers choose
between lender options. Would value a 15-min call or a current rate sheet.

Thanks,
[your name]
```

### Expected turnaround
- 1-2 weeks for vendor response
- Public fallback: MND broker reviews (lower confidence)

---

## C.3 — Rocket Pro TPO Application

### Application URL
https://www.rocketprotpo.com (TPO broker registration)

### Steps (mirror C.1)
1. Register as broker partner
2. Request "Non-QM" or "DSCR" product access
3. Pull current rate sheet + DSCR matrix

### Email follow-up template
```
Subject: DSCR Rate Sheet — Rocket Pro TPO

Hi Rocket Pro TPO team,

Would appreciate access to current Non-QM/DSCR rate sheet for evaluation
purposes. Building portfolio-DSCR analytics, not origination — looking for
lender matrix coverage.

Specifically:
- DSCR product matrix (FICO/LTV tiers)
- Current rate sheet
- State coverage
- Reserve requirements
- Recent 2026 product updates

NMLS #[your ID]. Thank you.

[your name]
```

---

## C.5 — Pool Correlation Empirical Data (NBER/SSRN Search Plan)

### Search queries (do all in Google Scholar + NBER + SSRN)

1. `multifamily loan default correlation site:nber.org`
2. `commercial real estate portfolio correlation site:ssrn.com`
3. `intra-portfolio default correlation site:nber.org`
4. `DSCR loan correlation site:ssrn.com`
5. `non-QM loan pool correlation site:nber.org`
6. `CMBS pool correlation empirical`
7. `lender concentration risk multifamily`

### Expected top papers (search and download)
- NBER w15159 (2009 SFR cure rate) — already in corpus as source for B.3
- Adjacent: NBER papers on multifamily default correlation
- FDIC Quarterly Banking Profile — CRE concentration sections
- Federal Reserve research papers on CRE portfolio lending

### Save location
- Save PDFs to `_research/domains/domain_X/loan_correlation/` (create subdir)
- Update DR_C C.5 with: paper citations + key findings + correlation estimates

### Expected effort
- 4 hours of searching + reading
- Free; no vendor contact needed

---

## C.7 — FLEX/LoanPASS/Optimal Blue/Polly API Trial

### Optimal Blue (largest US PPE)
- **Sales contact:** https://www2.optimalblue.com/contact-us
- **Developer docs:** https://developer.optimalblue.com
- **Email template:**
  ```
  Subject: API Trial Request — DSCR Sovereign OS Portfolio Analytics

  Hi Optimal Blue team,

  We're building portfolio-DSCR analytics on top of pricing engine data.
  Would appreciate a 30-day API trial to evaluate rate sheet ETL integration
  for our underwriting models.

  Use case: read-only access to PPE rate sheets + lock indications for DSCR
  + Non-QM products. No re-pricing required (just observation).

  We can sign NDA + MSA if needed. 30-day eval, then commercial decision.

  [your name]
  [your company]
  ```

### Polly
- **Sales contact:** https://polly.io/contact
- **Developer docs:** https://polly.io/developers
- Same email template (substitute Polly for Optimal Blue)

### Lender Price FLEX
- **Sales contact:** https://lenderprice.com/contact
- **Developer docs:** request from sales
- Same email template

### LoanPASS
- **Sales contact:** https://loanpass.io/contact
- Same email template

### Expected turnaround
- 1-3 weeks for vendor sales response
- NDA + API key issuance: another 1 week
- Total elapsed: 4-6 weeks for full trial

---

## C.8 — NMLS Consumer Access (Manual Lookup Checklist)

For each lender in the DSCR matrix, look up:

### Lookup URL
https://www.nmlsconsumeraccess.org

### Search by entity name
- Find entity → confirm NMLS ID
- Verify license status (Active)
- Check state coverage (which states they're licensed in)

### Top 20 DSCR lenders to verify
1. Pennymac Loan Services (NMLS #35953)
2. Angel Oak Mortgage Solutions
3. CrossCountry Mortgage
4. Newfi Wholesale
5. Lima One Capital
6. New American Funding
7. Kiavi (formerly LendingHome)
8. Visio Lending
9. A&D Mortgage
10. Acra Lending
11. Griffin Funding
12. Defy Mortgage
13. Rocket Pro TPO (Rocket Mortgage)
14. UWM (United Wholesale Mortgage)
15. Deephaven Mortgage
16. Easy Street Capital
17. OCMBC (Orange County's Mortgage Banking Co.)
18. Verus Mortgage Capital
19. New Silver
20. Ready Capital

### Save location
- Update each `lender_<name>_profile.md` in `_research/domains/domain_3/` with NMLS ID + license verification date
- Total effort: 30-60 min for 20 lenders

---

## Outreach timeline (Week 1 + Week 2)

| Day | Action | Estimated time |
|-----|--------|----------------|
| Day 1 Mon | Apply for UWM TPO + Rocket Pro TPO (parallel) | 2 hr |
| Day 1 Mon | Email Optimal Blue + Polly + Lender Price sales (parallel) | 1 hr |
| Day 1 Mon | Submit LinkedIn outreach to Deephaven TPO AE | 30 min |
| Day 2 Tue | NBER/SSRN search for pool correlation papers | 4 hr |
| Day 3 Wed | Apply for FLEX/LoanPASS trial (if email response) | 1 hr |
| Day 3 Wed | NMLS lookup for top 5 lenders | 30 min |
| Day 4 Thu | NMLS lookup for next 15 lenders | 1.5 hr |
| Day 5 Fri | Follow up on TPO applications + sales emails | 1 hr |
| Day 8 Mon | NMLS lookup completion + save to lender profiles | 1 hr |
| Day 9 Tue | Read NBER papers + update DR_C C.5 | 4 hr |
| Day 10 Wed | Vendor response review (which approvals came through) | 1 hr |
| Day 11-15 | Wait for rate sheets + DSCR matrix deliveries | (async) |

**Total active time:** ~16-24 hours over 2 weeks
**Total elapsed:** 2-4 weeks (with vendor delays)

---

## Tracking spreadsheet (suggested)

Create `_research/C_category_outreach_tracker.md`:

```markdown
| Item | Vendor | Status | Date sent | Response date | Materials received |
|------|--------|--------|-----------|---------------|-------------------|
| C.1 | UWM TPO | ☐ Applied | | | |
| C.2 | Deephaven | ☐ Drafted | | | |
| C.3 | Rocket Pro TPO | ☐ Applied | | | |
| C.5 | NBER/SSRN | ☐ In progress | n/a | n/a | |
| C.7a | Optimal Blue | ☐ Drafted | | | |
| C.7b | Polly | ☐ Drafted | | | |
| C.7c | Lender Price | ☐ Drafted | | | |
| C.7d | LoanPASS | ☐ Drafted | | | |
| C.8 | NMLS | ☐ 5/20 done | | | |
```

---

*Outreach templates prepared 2026-06-21 19:09 PT by Mavis. All 6 ACTIVE Category C items have ready-to-send templates. Estimated 16-24 hours of work over 2-4 weeks. DEFERRED items (C.4 CoStar, C.6 CBRE/Trepp, C.7 production tier) require budget approval before action.*
