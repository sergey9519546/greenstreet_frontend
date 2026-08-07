# Correction Overlay - 2026-06-28

Apply this overlay before trusting older DSCR research files. It is generated from the outdated research ultraplan Phase 1.

## Authority Order

1. `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md`
2. `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md`
3. `docs/research/specs/DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md`
4. `docs/research/operational/UNIFIED_HUB.md`
5. `docs/research/sprints/Build_Phase1_Deterministic_Core_Plan.md`
6. `00_engine/research/DSCR-Research/BUILDABLE_MASTER_SPECIFICATION.md`

## Corrections

### PA Act 6 / LIPL threshold
- Old/bad claim: $319,777 used as 2026 threshold
- Corrected claim: $329,411 for 2026; $319,777 is a 2025 threshold unless lender-specific lag is explicitly labeled
- Canonical source: `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md:21-48`
- Risk: `high`; reverify: `annual_january`
- Rule: Flag any 2026 PA threshold claim using $319,777 unless clearly historical or lender-specific.

### Golden vector
- Old/bad claim: DSCR Forumals vector: P&I $1,999; PITIA $2,732.33; T1 DSCR 1.16
- Corrected claim: P&I $2,120.6517; PITIA $2,853.9850; T1 DSCR 1.0512
- Canonical source: `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md:52-80`
- Risk: `critical`; reverify: `no`
- Rule: Archive or banner files that promote old vector; preserve correction rationale.

### Model risk governance
- Old/bad claim: SR 11-7 governs all model-risk treatment
- Corrected claim: SR 26-02 effective April 17, 2026; simple arithmetic and deterministic rules excluded; stochastic/ML layers governed
- Canonical source: `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md:84-118`
- Risk: `high`; reverify: `regulatory_change`
- Rule: Flag SR 11-7-only docs as stale; keep SR 26-02 correction docs.

### Deephaven no-DSCR
- Old/bad claim: Deephaven minimum DSCR equals 0 / no DSCR as literal floor
- Corrected claim: Use 0.75 with reserves as effective floor and flag direct lender outreach required
- Canonical source: `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md:122-128`
- Risk: `high`; reverify: `direct_lender_outreach`
- Rule: Do not use literal zero floor in production lender matrix.

### Interest-only DSCR formula
- Old/bad claim: Missing IO DSCR formula or blends principal into IO denominator
- Corrected claim: DSCR_IO = Rent / ITIA; principal excluded during IO period
- Canonical source: `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md:132-143`
- Risk: `medium`; reverify: `no`
- Rule: Mark older specs incomplete if they omit or mishandle IO DSCR.

### FinCEN BOI
- Old/bad claim: LLC-vested DSCR purchases with non-bank financing trigger BOI reporting
- Corrected claim: Domestic LLCs exempt from CTA BOI under March 2025 interim final rule
- Canonical source: `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md:49-52`
- Risk: `critical`; reverify: `live_legal_recheck`
- Rule: Flag older BOI-trigger claims as wrong; preserve correction evidence.

### FinCEN RRE
- Old/bad claim: RRE rule effective in 2026 as stable production law
- Corrected claim: Needs live reverify; 2026-06-28 FinCEN page says rule was vacated by court order and reporting not required while order remains in force
- Canonical source: `00_MOCs/product_strategy_audit_2026-06-28/final_strategy_opinion.md:external-check-note`
- Risk: `critical`; reverify: `yes_live_primary_source`
- Rule: Do not delete; create correction overlay and reverify before production.

### RentCast API pricing
- Old/bad claim: RentCast API has $29/$99/$199/Custom named tiers
- Corrected claim: 50 free API calls/month and volume-based API pricing; no public named dollar API tiers
- Canonical source: `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md:28-32`
- Risk: `medium`; reverify: `vendor_pricing`
- Rule: Flag vendor-cost docs using consumer landlord pricing as API pricing.

### Rocket Pro TPO lender terms
- Old/bad claim: Rocket Pro TPO min FICO 680 or max loan $3M
- Corrected claim: 660 FICO and $3.5M max per product page cited in corpus
- Canonical source: `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md:34-43`
- Risk: `high`; reverify: `lender_terms`
- Rule: Flag old lender rows and marketing copy.

### Angel Oak lender terms
- Old/bad claim: Angel Oak standard FICO 680/700 or max LTV 85 only
- Corrected claim: 640 minimum; 90% LTV at 740+ FICO per Angel Oak programs page cited in corpus
- Canonical source: `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md:44-48`
- Risk: `high`; reverify: `lender_terms`
- Rule: Flag secondary-page claims as stale unless corrected.

### Griffin Funding lender terms
- Old/bad claim: Griffin Funding 46 states + DC or $4M max
- Corrected claim: All 50 states + DC; up to $20M on some products, varies by state
- Canonical source: `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md:65-74`
- Risk: `high`; reverify: `lender_terms`
- Rule: Flag older footprint and max-loan rows.

### Gaussian copula
- Old/bad claim: Gaussian copula accepted for production correlated real estate risk
- Corrected claim: Rejected for production tail-risk modeling; prefer t-copula/R-vine/challenger approach
- Canonical source: `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md:222`
- Risk: `medium`; reverify: `model_validation`
- Rule: Mark older ML docs research-only if Gaussian copula is presented as final production approach.

### Hardcoded tax / rates
- Old/bad claim: Static bonus depreciation, rates, thresholds, or tax values are acceptable
- Corrected claim: Use externalized, effective-date, jurisdiction-aware config with staleness guards
- Canonical source: `docs/research/specs/DSCR_Underwriting_Engine_Master_Consolidated_v16.md:1674-1675`
- Risk: `high`; reverify: `periodic`
- Rule: Flag hardcoded tax/rate docs as stale or incomplete.

## Phase 1 Output

- Candidate queue: `00_MOCs/outdated_research_candidates_2026-06-28.csv`
- Supersession registry: `00_MOCs/supersession_registry_2026-06-28.csv`
- Exact duplicate groups: `00_MOCs/exact_duplicate_groups_2026-06-28.csv`
- Normalized-name groups: `00_MOCs/normalized_name_groups_2026-06-28.csv`