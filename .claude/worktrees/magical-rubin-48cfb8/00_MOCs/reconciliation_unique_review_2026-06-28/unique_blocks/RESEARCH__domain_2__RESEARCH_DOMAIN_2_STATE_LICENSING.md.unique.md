# Unique Content Review

- Source path: RESEARCH/domain_2/RESEARCH_DOMAIN_2_STATE_LICENSING.md
- Archived path: 99_attachments/research_archive_2026-06-28/p16_raw_domain_superseded_2026-06-28/RESEARCH/domain_2/RESEARCH_DOMAIN_2_STATE_LICENSING.md
- Replacement path: RESEARCH/domains/domain_2/RESEARCH_DOMAIN_2_STATE_LICENSING.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0.9259
- Unique words: 1082
- Preliminary classification: RESTORE_COPY_FOR_REVIEW_SUBSTANTIVE_UNIQUE
- Review copy: 00_MOCs\reconciliation_unique_review_2026-06-28\restored_for_review\RESEARCH\domain_2\RESEARCH_DOMAIN_2_STATE_LICENSING.md

## Unique Headings
- None found by heading comparison.

## First Unique Blocks

### Block 1
```text
# DOMAIN 2: 50-State DSCR Product Licensing + State-Specific Compliance
```

### Block 2
```text
All 50 states + DC require both **(a) entity-level mortgage banker/broker licensing** and **(b) individual Mortgage Loan Originator (MLO) licensing** under the **SAFE Act of 2008 (P.L. 110-289, Title V)** as implemented by the **Nationwide Multistate Licensing System (NMLS)**. Business-purpose DSCR loans, while exempt from many consumer-protections statutes (Reg Z, TILA §1461 of TILA; RESPA §7/§8), are still subject to licensing and usury laws in most states. The most material state-by-state risks for DSCR are: **(1) NY Banking Law §6-l and §6-m** (PPP and subprime restrictions, but business-purpose exemption for §6-l), **(2) MN HF 3437** (effective 8/1/26, business-purpose DSCR exempt from consumer §58.137), **(3) NJ §46:10B-2** (lender-split LLC state), **(4) OH ORC §1343.011** (PPP base = original principal, 2026 threshold $116,356), **(5) PA Act 6 §406 LIPL** (1-2 unit PPP banned below $319,777), and **(6) state usury caps** (CA 10%, NY 16%, AZ 10%, etc.) that can affect non-brokered entity lending.
```

### Block 3
```text
#### **Pennsylvania (PA) — Act 6 LIPL** - **PA Act 6 of 1974 §406 LIPL** (Loan Interest and Protection Law): 1-2 unit residential prepayment penalty restrictions - **Threshold 2026**: $319,777 (annually indexed) - **Below threshold**: PPP banned on 1-2 unit - **Above threshold OR 3-4 unit OR business-purpose**: Allowed - **PA usury**: 6% simple interest (consumer; can be waived by 2X signed writing for >$50K)
```

### Block 4
```text
| State | Critical Issue | License / Cap | Lender Restriction Note | |---|---|---|---| | AL | Standard | NMLS + AL Banking Dept; 8% usury | None | | AK | Market-excluded | NMLS + AK Commerce; 10% | Most DSCR lenders exclude (Visio, Kiavi) | | AZ | Standard | NMLS + AZ DIFI; 10% | None | | AR | PPP restricted (3yr declining) | NMLS + AR Securities; 10% | PPP allowed first 3yrs only | | **CA** | **CFL license REQUIRED for non-bank DSCR**; Prop 13/19 | DFPI CFL + DRE; 10% (CFL exempt) | Some lenders limit non-CFL; high DSCR market | | CO | No usury cap | NMLS + CO DRE (registration) | No ceiling | | CT | Declining-market LTV binds | NMLS + CT Banking; 12% civil | Decline-market restriction | | DE | Very low cap (5%+) | NMLS + DE State Banking; very low | Entity structuring required | | DC | Standard | DC DISB; 24% | Standard | | **FL** | **Insurance crisis; top DSCR market** | NMLS + FL OFR; 18% | High insurance scrutiny (Domain 1) | | GA | Standard | NMLS + GA DBF; 7%/mo consumer | Standard | | HI | Market-excluded | NMLS + HI DFI; 10% | Most DSCR lenders exclude | | ID | Standard | NMLS + ID Finance; 12% | Standard | | **IL** | **Declining-market LTV; >$25K business-purpose exempt** ... [truncated]
```

### Block 5
```text
> **CR-1: NMLS Verified.** Each lender in the top-20 DSCR matrix has an NMLS ID, current state licenses, and verified entity status. NMLS Consumer Access pull is the canonical verification. > > **CR-2: State-Specific License Verified.** For each state in the lender matrix, the lender has an active entity license. If a lender is not licensed in a state, the lender is excluded from that state's matching (display "lender not licensed in this state"). > > **CR-3: Business-Purpose Attestation Captured.** Each DSCR loan captures the business-purpose attestation (signed by borrower; per state requirement). Without this attestation, the loan defaults to consumer-purpose (and is subject to all consumer protections). > > **CR-4: NY §6-l/§6-m Logic.** For NY loans, if not business-purpose, apply §6-l/§6-m protections (no PPP on high-cost home loan, etc.). > > **CR-5: Usury Cap Check.** Engine pulls state usury cap and applies at pricing time. If pricing exceeds cap and no business-purpose exemption applies, BLOCK. > > **CR-6: NJ LLC Special Handling.** Per TOPIC 11, NJ LLC/entity vestings require per-lender matrix confirmation. Engine rule: NJ + LLC = HIGH-RISK flag; require explicit lender m ... [truncated]
```
