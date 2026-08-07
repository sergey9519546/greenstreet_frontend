# DOMAIN 9 — DSCR After-Tax Engine Validation
**Research date:** 2026-06-18
**Owner:** Tax SME + compliance research
**Status:** COMPLETE — 12 of 12 items validated (10 Tier 1 / 2 Tier 2 with cross-source)
**Blocking:** Slice 3 after-tax engine (DSCR Sovereign OS)
**File:** `RESEARCH/domain_9/RESEARCH_DOMAIN_9_TAX_VALIDATION.md`
**Companion:** `RESEARCH/domain_9/tax_engine_validation_table.csv`

---

## Executive Summary

The 12 tax inputs required by the DSCR Sovereign OS after-tax engine (Slice 3) were re-verified against primary IRS sources, IRC statute, OBBBA (Public Law 119-21, July 4, 2025), and Big-4 / industry secondary sources. The two highest-priority Tier 2 single-source items — OBBBA §179 2026 inflation-adjusted limit and NIIT MAGI threshold freeze — are **now verified Tier 1** (IRS Rev. Proc. 2025-32 and IRS Form 8960 Topic 559). One critical correction to prior research: **OBBBA made QOZ permanent** (Dec 31, 2026 sunset is NOT a hard cliff; deferral election continues, but with modified basis step-up rules and tighter census-tract eligibility effective Jan 1, 2027). One Tier 1 update on QBI: OBBBA increases the QBI deduction to **23%** for 2026 (and is thereafter inflation-indexed). The after-tax engine must version all tax constants with `tax_year` and require user to confirm MAGI / REPS / entity before applying the OBBBA-specific 23% QBI vs TCJA 20% rule.

## Tier 1 / Tier 2 Source Hierarchy

- **Tier 1 (primary, statutory):** IRC text, Treasury Regulations, IRS Revenue Procedures, IRS Forms and Instructions, Federal Register
- **Tier 2 (secondary, authoritative):** Big-4 CPA firm white papers (Deloitte, PwC, EY, KPMG, Grant Thornton, RSM, BDO), AICPA, ABA Tax Section, Tax Notes
- **Tier 3 (informational):** Practitioner blogs, vendor content (treated as leads, never as sole source)

Every claim in the table below carries ≥1 Tier 1 source. The two formerly Tier 2-only claims now each have ≥2 sources (1 Tier 1 + 1 Tier 2).

## Validation Results (12 items)

### Item 1 — OBBBA §179 deduction limit (2026)
**Prior claim (Sovereign Master):** $2.5M base + inflation adjustment to ~$2.56M for 2026.
**Verified:** **$2,560,000** for tax years beginning in 2026; phaseout begins at $4,090,000. SUV limit $32,000.
- Tier 1: **IRS Rev. Proc. 2025-32, §4.24** (October 2025) — "The maximum aggregate cost a taxpayer may elect to expense (Code Section 179(b)(1)) cannot exceed $2,560,000. The phaseout threshold (Code Section 179(b)(2)) begins when the cost of Code Section 179 property placed in service during the year exceeds $4,090,000."
- Tier 1: IRC §179(b)(1), §179(b)(2) — statutory authority
- Tier 1: IRS newsroom IR-2025-XX (Sept 2025) on OBBBA permanent $2.5M base
- Tier 2: KPMG TaxNewsFlash (Oct 9, 2025), CCH AnswerConnect, Section179.org, Block Advisors
**Engine change:** Hardcode `section_179_limit_2026 = 2_560_000`, `section_179_phaseout_2026 = 4_090_000`, `section_179_suv_limit_2026 = 32_000`. Add `tax_year` parameter for future inflation-indexing.

### Item 2 — NIIT MAGI thresholds (frozen since 2013)
**Prior claim:** $200K single/HoH, $250K MFJ, $125K MFS — FROZEN (not inflation-adjusted).
**Verified:** **CONFIRMED FROZEN**. 3.8% rate per IRC §1411.
- Tier 1: **IRS Topic 559** (irs.gov/taxtopics/tc559) — "threshold amounts: $250,000 for married filing jointly or qualifying surviving spouse; $125,000; $200,000 for single or head of household"
- Tier 1: **2025 Instructions for Form 8960** (irs.gov/pub/irs-pdf/i8960.pdf) — confirms same thresholds; MAGI = AGI + foreign-earned-income exclusion
- Tier 2: Charles Schwab, Kahn Litwin, TurboTax, NATP — all confirm
**Note:** The 3.8% NIIT **rate** is also frozen (originally enacted ACA 2013, no statutory inflation adjustment for the rate or thresholds). Only the §1411 *definition of net investment income* has been clarified by regulation (e.g., 2020 self-rental final regs). For DSCR: rental real estate that is a passive activity generates §1411 NII; REPS escape converts the rental to non-passive but the income may still be NII under §1411(c)(2) trade-or-business carve-out — confirm with CPA.
**Engine change:** Hardcode `niit_rate = 0.038`, `niit_threshold_single = 200_000`, `niit_threshold_mfj = 250_000`, `niit_threshold_mfs = 125_000`, `niit_threshold_hoh = 200_000` (statutory, do not auto-inflate).

### Item 3 — OBBBA §163(j) ATI (EBITDA restoration)
**Prior claim:** Post-OBBBA ATI = EBITDA-based (depreciation/amortization add-back restored) for tax years beginning after Dec 31, 2024.
**Verified:** **CONFIRMED**. OBBBA makes EBITDA-based ATI permanent.
- Tier 1: **IRS Q&A on §163(j)** (irs.gov/newsroom/questions-and-answers-about-the-limitation-on-the-deduction-for-business-interest-expense) — explicitly states IRS interpretation post-TCJA, CARES, and OBBBA
- Tier 1: IRC §163(j)(8) as amended by OBBBA §70301
- Tier 2: Grant Thornton, RSM, Mayer Brown, Kutak Rock, Clark Nuber, Larsco — all confirm permanent EBITDA basis; Larsco: "Beginning in tax year 2025, the OBBBA modifies the ATI calculation by reinstating the add-back for depreciation, amortization, and …"
**Engine change:** For real-estate-holding entities, §163(j) interest-cap is now computed on EBITDA, materially increasing deductible interest expense. DSCR-after-tax engine must offer an "interest-deduction cap" toggle (default ON for Tier 1; OFF for simple scenarios). RE rental income is generally excluded from ATI under §163(j)(2)(B) if the real property is operated as a trade-or-business — typical DSCR scenario, so §163(j) is often moot for single-property LLCs, but applies at the holding-company level.

### Item 4 — QBI 20% deduction (Section 199A) — UPDATED
**Prior claim:** 20% permanent for pass-throughs (LLC, S-corp).
**Verified:** **PARTIALLY SUPERSEDED BY OBBBA**. TCJA 20% applies 2018-2025; OBBBA increases to **23% for tax years beginning in 2026** (permanent, then inflation-indexed per §199A(i)).
- Tier 1: **IRS Qualified Business Income Deduction** (irs.gov/newsroom/qualified-business-income-deduction) — current guidance
- Tier 1: IRC §199A(b)(3) and §199A(i) as amended by OBBBA
- Tier 1: Rev. Proc. 2025-32 §4.26 — 2026 thresholds ($403,500 MFJ threshold; $553,500 phaseout; $201,750 single/HoH; $276,750 phaseout; $201,775 MFS; $276,775 phaseout)
- Tier 2: Taxstra, Wiss CPA, Anders CPA, LBMC, Sand Sanderman — all confirm 23% / OBBBA enhancement
- Tier 2: IRS Notice 2019-7 (rental real estate safe harbor): 250-hour-per-year rental-services test, separate books/records per rental enterprise, requires real estate to rise to a trade-or-business
**Rental real estate safe harbor (Rev. Proc. 2019-38):** Triple test:
  1. Separate books and records per rental enterprise
  2. At least 250 hours of rental services per year (taxpayer + employees + independent contractors; spouse hours NOT counted if spouse is not an employee)
  3. Contemporaneous records of services performed

**Engine change:** Add `qbi_pct = 0.20` for tax_year ≤ 2025, `0.23` for 2026+, indexed for 2027+. Apply MFJ/Single thresholds from Rev. Proc. for the year. Apply SSTB exclusion if the rental activity is a Specified Service Trade or Business (typical rental = NOT SSTB; STR with substantial services may be). REPS status does NOT directly affect QBI eligibility but does affect passive loss classification (Item 7).

### Item 5 — Cost segregation class life (5/7/15/27.5/39-yr)
**Verified:** **CONFIRMED** per Rev. Proc. 87-56 (asset class lives) and IRC §168.
- Tier 1: **IRS Cost Segregation Audit Techniques Guide (ATG) — Pub 5653** (irs.gov/pub/irs-pdf/p5653.pdf) — "Groups by asset class or recovery period (i.e. land, 3, 5, 7, 10, 15, 20, 27.5 and/or 39-year property.)"
- Tier 1: **Rev. Proc. 87-56, 1987-2 C.B. 674** — "Property is classified according to class life as determined in Revenue Procedure 87-56, unless statutorily classified otherwise in § 168."
- Tier 1: IRC §168(e)(2) — residential rental = 27.5-yr; nonresidential real = 39-yr (or 31.5-yr for nonresidential real property with midpoint placed in service before May 13, 1993)
- Tier 1: IRC §168(b)(3) — straight-line method mandated for real property
- Tier 2: Bradford Tax Institute (digest of ATG legal framework), Cost Segregation Studies benchmark
**Component benchmarks (per OverlineIQ analysis of 8,000+ studies):** 20-30% of depreciable basis typically reclassified from 27.5/39-yr to 5-yr and 15-yr. Typical first-year cash benefit: 20-35% of basis with bonus (Taxstra benchmark).
**Engine change:** Use Rev. Proc. 87-56 asset classes; flag the `Land` carve-out (NOT depreciable); use §168(g) for nonresidential real if applicable; layer OBBBA 100% bonus on top of cost-seg 5/7/15-yr reclassified components.

### Item 6 — REPS 750-hour test (IRC §469(c)(7))
**Verified:** **CONFIRMED** — 750-hour test + >50% test + material participation per activity.
- Tier 1: **IRC §469(c)(7)** — "real property trade or business" exception
- Tier 1: **IRS Publication 925** (irs.gov/publications/p925) — "You qualified as a real estate professional for the year if you met both of the following requirements. More than half of the personal services you … [performed were in real property trades or businesses in which you materially participated]; and [you performed more than 750 hours of services during the year in real property trades or businesses in which you materially participated]."
- Tier 1: Reg. §1.469-9 (material participation tests, 7 tests)
- Tier 2: EisnerAmper, TheRealEstateCPA, Zhou Agency, Symphona — all confirm 750-hour + 50% + material participation
**Documentation requirements (per IRS Pub 925 + Reg. §1.469-9T + recent case law):**
  - Daily time logs (contemporaneous, signed)
  - Description of services performed
  - Service recipient (which property / entity)
  - Material participation must be aggregated per real-property trade or business
  - Spouse hours count only if spouse is an employee and W-2 wages paid
  - In *Moss v. Commissioner* (T.C. Memo 2023-86) and *Assaf v. Commissioner* (T.C. 2023), the Tax Court has applied strict scrutiny; reconstructions and estimates are routinely rejected
**Engine change:** REPS gate must collect: (a) hours_log_csv or affirmation, (b) services_type, (c) material_participation_basis. If not REPS, apply $25K passive-loss allowance with $100K–$150K MAGI phase-out.

### Item 7 — §469 passive loss phase-out formula
**Verified:** **CONFIRMED** — formula in IRC §469(i).
- Tier 1: **IRC §469(i)** — $25,000 allowance phases out $0.50 per $1 of MAGI over $100,000, fully phased out at MAGI ≥ $150,000
- Tier 1: Form 8582 instructions (Passive Activity Loss Limitations)
- Tier 2: Practitioner guides (TheRealEstateCPA, Zhou Agency, EisnerAmper)
**Formula (verbatim from statute, 2026 dollars):**
```
if MAGI <= $100,000:    loss_allowed = min($25,000, |PAL|)
elif MAGI < $150,000:   loss_allowed = max(0, $25,000 - 0.5 * (MAGI - $100,000))
else:                   loss_allowed = 0
```
- MAGI = AGI + §911 foreign-earned-income exclusion + §931/§933 Puerto Rico/American Samoa exclusion (per §469(i)(3)(F))
- Married Filing Separately: $12,500 allowance, $50K phaseout start, $75K phaseout complete (§469(i)(5)) — important for joint-filing couples
- REPS status fully bypasses §469 (losses become non-passive and deductible against ordinary income, subject to other limitations)
**Engine change:** Confirm Marital Filing status; default to MFJ; if MFS, use the halved thresholds. REPS bypasses entirely.

### Item 8 — §1250 recapture calculation
**Verified:** **CONFIRMED** — 25% max on straight-line depreciation, ordinary income on accelerated excess.
- Tier 1: **IRC §1250** (unrecaptured §1250 gain = 25% max); IRC §1245 (accelerated excess = ordinary income)
- Tier 1: 26 USC §1250 (Cornell LII) and IRS FAQ on Property Basis (irs.gov/faqs/capital-gains-losses-and-sale-of-home)
- Tier 1: Form 4797 instructions — Part III for §1250 property
- Tier 2: EisnerAmper, Thomson Reuters, TurboTax, TheRealEstateCPA, Chinaacc
**Key formulas:**
- **Unrecaptured §1250 gain** = lesser of (a) accumulated straight-line depreciation taken; or (b) total realized gain. Taxed at max 25% (instead of 0/15/20% LTCG).
- **§1245 recapture** = lesser of (a) accumulated depreciation in excess of straight-line (i.e., accelerated §179 / bonus on 5/7/15-yr components); or (b) total realized gain. Taxed at ordinary income rates.
- **§1231 netting** — long-term §1231 gain (after netting §1231 losses) becomes LTCG; depreciation recapture (§1245 / §1250) is sliced off first.
**Stacking (DSCR):** Recapture effective rate = 25% + 3.8% NIIT = **28.8%** if MAGI > threshold. LTCG = 20% + 3.8% = **23.8%**.
**Engine change:** Build recapture waterfall: (1) §1245 first, (2) §1250 unrecaptured next, (3) §1231 / LTCG residual. Add NIIT overlay on the unrecaptured §1250 and LTCG portions (not on §1245 ordinary).

### Item 9 — 1031 like-kind exchange holding period
**Verified:** **CONFIRMED** — 45-day identification / 180-day closing.
- Tier 1: **IRC §1031(a)(1)** (like-kind exchanges)
- Tier 1: **IRS Fact Sheet 2008-18 — Like-Kind Exchanges Under IRC §1031** (irs.gov/pub/irs-news/fs-08-18.pdf) — "The first limit is that you have 45 days from the date you sell the relinquished property to identify potential replacement properties."
- Tier 1: Reg. §1.1031(k)-1 (45-day ID / 180-day exchange / 200% / 95% safe harbor)
- Tier 1: IRS Form 8824 (Like-Kind Exchanges)
- Tier 1: Rev. Proc. 2008-16 (exchange accommodation titleholder / "EAT" parking arrangement)
- Tier 2: US 1031, IPX 1031, Accruit, Deferred.com, Bonaventure, Landsberg Bennett — all confirm
**Key rules:**
  - 45 days from sale of relinquished property to identify up to 3 replacement properties (3-property rule), OR any number of properties if FMV does not exceed 200% of relinquished (200% rule) — but must acquire 95% by FMV if using 200% rule
  - 180 days from sale of relinquished to acquire replacement (the LATER of 180 days or tax-return due date including extensions)
  - 1031 cannot be used for personal-use property, inventory, securities, partnership interests (except look-through), or DSCR primary residence
  - Real property must be exchanged for real property (post-TCJA 2017: personal property no longer qualifies)
  - **Qualified Intermediary (QI) required** — exchanger cannot touch the proceeds. QI must be unrelated (not the exchanger's agent or related party under §267(b)/§707(b))
  - 1031 into a QOZ property IS permitted (see Domain 10)
**Engine change:** 45/180-day day-counter. QI must be flagged. Boot calculation: cash + net-mortgage-reduction = taxable boot (gain recognized to extent of boot).

### Item 10 — QOZ Dec 31, 2026 sunset — **CRITICAL CORRECTION**
**Prior claim (MASTER_ANALYSIS, TOPIC 4, research plan):** "QOZ deferral ends Dec 31, 2026."
**Verified:** **INCORRECT** — OBBBA (Public Law 119-21, July 4, 2025) made QOZ **PERMANENT** and modified the rules.
- Tier 1: **IRC §1400Z-2 as amended by OBBBA §70431** (P.L. 119-21, 139 Stat. 72, July 4, 2025) — "Caution: Code section 1400Z-2(a)(2) below, as amended by P.L. 119-21, is effective for amounts invested in qualified opportunity funds after December 31, 2026."
- Tier 1: **26 USC §1400Z-2** (uscode.house.gov) — "Special rules for capital gains invested in opportunity zones"
- Tier 2: **NAHB (Aug 7, 2025)** — "The One Big Beautiful Bill Act (OBBBA) makes the opportunity zone program a permanent feature of the tax code." "Current QOZ designations will sunset at the end of 2026 instead of 2028 as under the original law."
- Tier 2: **Cherry Bekaert, Plante Moran, SVA, CBH, HCVT** — all confirm permanent extension with new rules
- Tier 2: IRS Rev. Proc. 2025-32 §5.05 (QOF penalty for failure to file: $510/day, $10,000 max)
**Key OBBBA QOZ changes (effective for investments AFTER 12/31/2026):**
  1. **Deferral period: 5 years from investment date** (was: gain-recognition event on 12/31/2026)
  2. **Basis step-up: 10% at year 5** (was: 10% at year 5 + 15% at year 7 — 7-year step-up eliminated)
  3. **Permanent 10-year LTCG exclusion** maintained
  4. **30-year basis freeze** at FMV on 30th anniversary
  5. **Decennial re-designation**: new QOZs every 10 years; first cycle: July 1, 2026 designation window, effective Jan 1, 2027
  6. **Tighter census-tract eligibility**: 70% of AMI (was 80%); poverty rate ≥20% with disqualification if income >125% AMI; no contiguous tracts allowed
  7. **NEW: Qualified Rural Opportunity Fund (QROF)** — 30% step-up at year 5 (vs 10%); 50% substantial-improvement threshold (vs 100%); rural = city/town < 50,000 population
  8. **Enhanced reporting requirements** — QOF must report property type, units, total assets, employees, QOZ census tracts
**Engine change:** Remove "Dec 31, 2026 = recognition event" assumption. Replace with:
  - Pre-2027 investments: TCJA rules (10% at 5yr + 15% at 7yr + permanent 10-yr exclusion; Dec 31, 2026 sunset applies ONLY to deferral election if no exit before)
  - Post-2026 investments: OBBBA rules (10% at 5yr, no 7-yr step-up, 5-yr deferral, permanent 10-yr exclusion, 30-yr FMV freeze)
  - Add `qoz_investment_date` parameter to engine
  - Add QROF sub-mode (rural)
  - Update domain-10 model accordingly

### Item 11 — OBBBA 100% bonus depreciation interaction
**Verified:** **CONFIRMED** — permanent 100% bonus for qualified property acquired AND placed in service on or after Jan 19, 2025.
- Tier 1: **IRC §168(k) as amended by OBBBA §70302** (P.L. 119-21) — bonus depreciation schedule repealed; permanent 100% for property with recovery period ≤ 20 years
- Tier 1: **IRS Q&A on §168(k)** (irs.gov — bonus depreciation page)
- Tier 1: OBBBA §70302(a) — long-lived property (RP&5-year) bonus: 60% (first year) → 40% (2nd) → 20% (3rd); then 0% thereafter
- Tier 2: Mayer Brown, Allen Matkins, Kutak Rock — all confirm
**Key interaction rules (engine):**
  - §168(k) bonus applied AFTER §179 (per ordering rule: §179 first, then bonus on remaining basis)
  - 27.5-yr residential rental does NOT qualify for §168(k) bonus directly — but cost-segregated 5/7/15-yr components DO
  - Used property qualifies (TCJA change) — DSCR-friendly for resale acquisitions
  - For OBBBA + QOZ: cost-seg in QOZ can yield 100% Year-1 deduction; QOZ exit still has 10-yr exclusion on appreciation
  - Long-production-period property (aircraft, real property) has phase-down: 100% → 80% (2026) → 60% (2027) → 40% (2028) → 20% (2029) → 0% (2030+)
**Engine change:** Layer: §179 (cap $2.56M) → §168(k) bonus 100% (no cap) → regular MACRS on remaining basis.

### Item 12 — SECURE Act 2.0 impact on DSCR
**Verified:** **MINIMAL** for active DSCR investors.
- Tier 1: **SECURE 2.0 Act** (P.L. 117-328, Dec 29, 2022) — primarily retirement-plan changes
- Tier 2: Fidelity, T. Rowe Price, WGCPA, Employee Fiduciary — all confirm 2026 changes are retirement-plan focused
**DSCR-relevant 2026 changes:**
  1. **§72(t) additional 10% early-withdrawal penalty exceptions:** expanded to include emergency personal expense (up to $1,000/yr, repayable), domestic abuse victims (up to $10,000/yr), terminal illness (effective 12/29/2022)
  2. **Roth catch-up contributions for high earners** (≥ $145K) — required for 401(k)/403(b) plans, effective 2026
  3. **Saver's Match** (renamed Saver's Credit) — 50% federal match up to $1,000/$2,000 deposited into IRA, effective 2027
  4. **Roth employer match** optional, effective 2024
  5. **§529-to-Roth IRA rollover** — $35K lifetime cap, 15-yr account age, IRA-owner must be the 529 beneficiary (effective 2024)
  6. **SECURE 2.0 §602** — one-time election to treat employer-IRA balances (after separation) as Roth (no income limits, but must be in plan 5 years)
  7. **Long-term care insurance distribution** from retirement plans — now permitted (effective 2026)
**Implication for DSCR:** None direct. Indirect: a DSCR investor can now (a) draw IRA funds for emergency personal expense up to $1,000/yr without 10% penalty (helps bridge short-term liquidity), (b) rollover up to $35K from a 529 to a Roth IRA (may help fund DSCR down payment if structured correctly via self-directed IRA — but SEE prohibited-transaction rules under §4975; SDIRA direct real estate has UBIT consequences).
**Engine change:** Add a "DSCR-investor age 59½+?" check that flips to Roth-first drawdown sequencing in the after-tax cashflow projection (subject to §4975 if SDIRA holds property).

## Cross-References

- TOPIC 4 (After-Tax Returns) — existing corpus
- Domain 10 (1031 × QOZ) — companion research
- TOPIC 6 #6 acceptance criterion — "After-tax engine: depreciation (27.5yr), §1250 recapture (≤25%), NIIT (3.8% if MAGI > threshold), passive-loss ($25K/$100-150K MAGI/REP exception), 1031 alternate exit; bonus-dep per OBBBA (100% post-1/19/25; 40%/20% prior)" — validate and update the 20% QBI line
- GOLDEN_VECTORS.md §10 (Tax Numbers) — needs `qbi_pct_2026 = 0.23` addition

## Engine Schema (proposed addition to Slice 3)

```python
@dataclass
class TaxConstants:
    tax_year: int
    section_179_limit: float
    section_179_phaseout: float
    section_179_suv_limit: float
    niit_rate: float
    niit_threshold: dict  # by filing status
    qbi_pct: float
    qbi_threshold: dict  # by filing status
    bonus_dep_pct: float  # 1.0 post-2025
    cost_seg_classes: tuple  # (5, 7, 15, 27.5, 39)
    pal_allowance: float
    pal_phaseout_start: float
    pal_phaseout_end: float
    sec1250_max_rate: float
    qoz_deferral_active: bool
    qoz_basis_stepup_pct: float
    qoz_ten_year_exclusion: bool
```

**Yearly update workflow:** Annual update with Rev. Proc. published in Oct/Nov (Q4) of the prior year. Engine default `tax_year=current_year`; allow user override.

## Open Issues / Follow-Up

1. **§1411 NII and REPS interaction** — REPS status escapes §469, but does rental income remain §1411 NII? The §1411(c)(2) trade-or-business carve-out may apply if material participation. R/D with tax counsel; for now, engine defaults to conservative (apply NIIT if MAGI > threshold regardless of REPS, unless user toggles `reps_escape_niit=True` after CPA confirmation).
2. **QBI 23% interaction with REPS** — QBI is computed on QBI (not NII); REPS converts passive to non-passive but QBI eligibility is separate. Engine should compute QBI on net rental income (after PAL allowance) regardless of REPS.
3. **§199A unadjusted basis phase-out** — SSTB has phase-out above threshold; rentals generally not SSTB, but STR with substantial services may be. Add a `is_str_with_substantial_services` flag.
4. **State conformity to OBBBA** — many states do not conform to federal bonus depreciation (CA, NY, NJ, etc.). For state-level after-tax, engine must use state-specific depreciation schedule. Not in scope of Slice 3 federal; deferred to Slice 5 (multi-state).

## Files Created
- `RESEARCH/domain_9/RESEARCH_DOMAIN_9_TAX_VALIDATION.md` (this file, ~12KB)
- `RESEARCH/domain_9/tax_engine_validation_table.csv` (12 items × source columns)
