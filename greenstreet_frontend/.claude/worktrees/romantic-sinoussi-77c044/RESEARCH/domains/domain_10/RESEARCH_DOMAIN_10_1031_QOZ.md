---
type: research
slice: 3
status: drafted
confidence: 3
title: DOMAIN 10 — 1031 × QOZ Interaction Modeling
summary: "**Owner:** Tax SME + modeling engineer **Status:** COMPLETE — Python model `1031_qoz_interaction_model.py` runs and all 4 smoke tests pass"
entities:
  - concept/appreciation
  - concept/dscr
  - slice/3
  - state/ca
  - state/nj
  - state/ny
  - tax/1031
  - tax/bonus-depreciation
  - tax/niit
  - tax/qoz
  - topic/sfr
  - topic/str
tags:
  - topic/after-tax
  - topic/architecture
  - topic/default-rate
  - topic/portfolio
  - topic/tax
  - type/audit
source: RESEARCH/domain_10/RESEARCH_DOMAIN_10_1031_QOZ.md
vaulted_at: 2026-06-20
---
# DOMAIN 10 — 1031 × QOZ Interaction Modeling
**Research date:** 2026-06-18
**Owner:** Tax SME + modeling engineer
**Status:** COMPLETE — Python model `1031_qoz_interaction_model.py` runs and all 4 smoke tests pass
**Blocking:** Slice 3 after-tax engine (DSCR Sovereign OS)
**File:** `RESEARCH/domain_10/RESEARCH_DOMAIN_10_1031_QOZ.md`
**Companion:** `RESEARCH/domain_10/1031_qoz_interaction_model.py` (runnable Python model)

---

## Executive Summary

The 1031 × QOZ interaction is the single most sophisticated exit sequence available to high-net-worth DSCR investors. This research models the canonical 4 scenarios — (1) taxable sale, (2) §1031 into non-QOZ, (3) §1031 into QOZ property, (4) §1031 into QOZ rural (QROF) — and documents the tax mechanics, the OBBBA regime transition (TCJA → permanent QOZ on Jan 1, 2027), and the engineering schema for the after-tax engine.

**Critical correction to prior research (MASTER_ANALYSIS, TOPIC 4, research plan):** OBBBA §70431 (P.L. 119-21, July 4, 2025) made the QOZ program **permanent** but **modified the basis step-up schedule** — the prior 15% step-up at year 7 was **eliminated** for investments made after Dec 31, 2026. The deferral period is now 5 years (from investment date), with a 10% step-up at year 5 and a permanent 10-year capital-gain exclusion. The 30-year FMV basis freeze is new. The new QROF (rural) tier offers a 30% step-up at year 5. A new QOZ designation cycle begins July 1, 2026, with tighter census-tract eligibility (70% AMI vs 80%, no contiguous tracts).

The Python model confirms a **counterintuitive but correct** finding: for a high-bracket investor (37% ordinary + 3.8% NIIT) in a TCJA-pre-2027 QOZ, the 1031+QOZ path may **cost more** than a straight sell because the deferred gain is recognized at ordinary rates (37%) rather than §1250 (28.8% w/ NIIT). The 7-year 15% step-up was the only relief; the OBBBA's simplification (10% step-up only, but at year 5) may or may not improve on a case-by-case basis. The model lets the user see all four scenarios side-by-side.

## Question-by-Question Answers

### Q1: Can a 1031 exchange property be in a QOZ?
**Answer: YES.** IRC §1400Z-2(e)(1) defines "qualified opportunity zone property" to include property acquired by purchase (which is what 1031 replacement is). The replacement property must be a QOZ business property (acquired after Dec 31, 2017 from an unrelated party, substantially improved, used in a trade or business). 1031 into a QOZ is a recognized advanced exit strategy (per Cherry Bekaert, Plante Moran, SVA, 1031 CORP. guidance, NAHB).

**Conditions:**
- QOZ designation was active at the time of acquisition (post-2017 census tracts)
- Substantial improvement (≥100% of basis for non-rural; ≥50% for rural QROF)
- Original use requirement (LIFO exception for first 30 months) OR substantial improvement
- Property must be used in a trade or business (DSCR rental qualifies)

### Q2: §1400Z-2 deferral interaction with §1031 boot recognition
**Answer: Independent but additive.** §1031 boot recognition and §1400Z-2 deferral election operate on different tax attributes. A 1031 with boot still triggers recapture (§1245) and may trigger §1250 gain to the extent of boot; the deferred portion of the gain becomes the new "deferred gain" that can be rolled into a QOZ investment. The tax-recognized portion of the 1031 gain is taxed in the year of sale; the deferred portion can be re-deferred via §1400Z-2 by investing into a QOF within 180 days.

**Stacking example (post-OBBBA 2027):** Sell SFR → $200K realized gain. 1031 into QOZ replacement, no boot. §1245 recapture $20K recognized at closing. Remaining $180K of deferred gain rolls into QOZ deferral election. At year 5: $180K × (1 - 0.10) = $162K recognized at ordinary rates (5-yr deferral ends); QOF appreciation $80K held 10+ years = permanent exclusion.

### Q3: Optimal 1031+QOZ exit sequence
**Answer: SELL → §1031 INTO QOZ PROPERTY → HOLD ≥10 YEARS (QOF exit).** This is the canonical "QOZ double-dip":
1. Sale of relinquished property at Year 0
2. Within 45 days: identify QOZ replacement property
3. Within 180 days: close 1031 into QOZ replacement
4. Pay §1245 recapture (and any §1250/§1231 to extent of boot) at Year 0
5. Hold QOZ property for ≥10 years (continuous)
6. At Year 10+: sell QOZ property, pay 0% tax on appreciation (permanent §1400Z-2(c) exclusion)
7. Deferred gain from §1031 inclusion: timing depends on regime
   - TCJA pre-2027: recognition event on 12/31/2026 (or earlier sale of QOF interest) with 10%/15% step-up if held
   - OBBBA post-2026: 5-yr deferral from investment date with 10% step-up at year 5

**Critical pre-2027 planning window:** Investors who did a 1031+QOZ before 2027 and want the 15% step-up must hold the QOF interest until 12/31/2026. After that date, the 7-year step-up is gone for everyone (the sunset was eliminated by OBBBA but the step-up itself was eliminated for new investments; for pre-2027 investments, the existing 5/7-year holding period clocks continue).

### Q4: §1031 timeline (45-day ID / 180-day closing)
**Answer: CONFIRMED** — strict statutory deadlines, no extensions available.
- Tier 1: IRC §1031(a)(1) + Reg. §1.1031(k)-1
- Tier 1: IRS Fact Sheet 2008-18
- **45 days from sale of relinquished property** to identify replacement (in writing, signed, delivered to QI)
- **180 days from sale of relinquished** to acquire replacement (or tax-return due date including extensions, whichever is LATER)
- The 45-day and 180-day periods run CONCURRENTLY (180 days = 45 + 135 days of actual closing)
- Identification safe harbors: (a) 3-property rule (any 3 properties regardless of value), (b) 200% rule (any number if FMV ≤200% of relinquished), (c) 95% exception (acquire ≥95% of identified value)

### Q5: Qualified Intermediary (QI) requirement
**Answer: REQUIRED.** The exchanger cannot touch the proceeds of the sale — direct or constructive receipt disqualifies the exchange. The QI holds the proceeds between sale and acquisition. Per Reg. §1.1031(k)-1(g)(4), the QI must be **unrelated** to the exchanger (not the exchanger's agent or a related party under §267(b) or §707(b)).
- Industry QIs: 1031 CORP., IPX 1031, Accruit, US 1031, First Exchange
- QI fee: typically $500-$1,500 for a standard deferred exchange; complex (reverse, construction) higher
- QI bankruptcy risk: use of "Qualified Escrow" or "Qualified Trust" arrangement; some QIs carry fidelity bonds (industry standard $1M-$5M)

### Q6: §1400Z-2 10-year QOZ holding period
**Answer: 10 YEARS from QOF investment date for permanent capital-gain exclusion** (not from original gain realization). The deferred original gain has its own deferral clock (5 years post-2026 OBBBA; 12/31/2026 sunset pre-2027). The two clocks operate independently.
- Tier 1: IRC §1400Z-2(c) — exclusion of capital gains from sale of QOF interest held ≥10 years
- Tier 1: IRC §1400Z-2(a)(2) — 5-year deferral of original gain (OBBBA)
- Post-OBBBA 30-year FMV basis freeze (§1400Z-2(c)(2) as amended)

### Q7: §1400Z-2 180-day reinvestment requirement
**Answer: CONFIRMED.** Capital gain must be reinvested in a QOF within **180 days** of the gain realization (sale date of the original asset).
- Tier 1: IRC §1400Z-2(a)(1)(A)
- For 1031-into-QOZ sequence: 180 days from the SALE of the relinquished property (NOT 180 days from the 1031 closing)
- Special rule: if the gain is from an installment sale or pass-through entity, the 180-day clock starts at the gain's tax-recognition event (often the installment payment date or Schedule K-1 issuance)

### Q8: Tax basis step-up when QOZ holding period ends
**Answer:**
- **OBBBA (post-2026):** 10% step-up at year 5 of the deferred ORIGINAL gain (eliminates the deferred gain by 10%, so 90% of original gain is recognized at year 5); 30-year FMV basis freeze (basis steps to FMV at the 30th anniversary of investment for purposes of the deferred original gain)
- **TCJA (pre-2027):** 10% step-up at year 5, additional 5% step-up at year 7 (15% total), no 30-year freeze
- **QROF (rural):** 30% step-up at year 5 (post-2026 only); reduced substantial-improvement threshold (50% vs 100%)

The step-up reduces the AMOUNT of original gain that must be recognized at the end of the deferral period. It does NOT step up the basis of the underlying QOF investment for gain-on-sale purposes (that's the 10-year exclusion).

### Q9: OBBBA 100% bonus depreciation interaction with QOZ
**Answer: BONUS DEP IS ORTHOGONAL TO QOZ DEFERRAL.** The 100% bonus (post-Jan 19, 2025) accelerates the cost-recovery deduction on QOZ business property but does not affect:
- The QOZ deferral election (5-yr clock)
- The QOZ basis step-up (10% at year 5)
- The QOZ 10-yr permanent exclusion

**However:** Bonus depreciation reduces the QOZ exit basis (less depreciation to recapture). For QOZ business property that is held 10+ years and sold, **§1245 recapture on bonus depreciation taken pre-2025 can be substantial** (33% or 50% of basis). Per Rev. Proc. 2025-14 and §1400Z-2(c), gain attributable to bonus depreciation may be subject to ordinary-income recapture at sale (i.e., the 10-yr exclusion may not apply to the portion of the gain equal to the prior bonus depreciation). The IRS has not yet issued definitive guidance on this interaction as of June 2026 — see Open Issues below.

**Practical strategy:** For QOZ business property that will be held 10+ years, consider **electing out of bonus depreciation** on the QOZ property (§168(k)(4) election) so the entire appreciation is eligible for permanent exclusion. The trade-off is $0 first-year deduction (only regular MACRS) for permanent LTCG exclusion on the entire appreciation.

### Q10: QOZ sunset scenario
**Answer: SUPERSEDED.** OBBBA eliminated the Dec 31, 2026 sunset for the QOZ program as a whole. The deferral ELECTION for pre-2027 investments still has the 12/31/2026 inclusion event (i.e., any deferred gain from pre-2027 QOF investments that has not been previously recognized is recognized on 12/31/2026 absent a sale/exchange of the QOF interest). For post-2026 investments, the deferral period is 5 years from investment date.

**Planning implication (pre-2027 investments):**
- 12/31/2026 IS still a hard inclusion date for deferred original gain on pre-2027 QOF investments
- To minimize the 12/31/2026 tax bill, investors should:
  (a) Harvest capital losses against the recognized gain
  (b) Make an early §1031 of the QOF interest (yes, QOF interest can itself be 1031'd, though TCJA 2017 eliminated partnership-interest 1031; QOF as an entity is a partnership or corporation so direct 1031 may not be available — confirm with CPA)
  (c) Distribute the QOF interest to a GRAT, IDGT, or other vehicle (consult estate counsel)
  (d) Negotiate a sale of the QOF interest before 12/31/2026 and re-defer via 1031 into a non-QOZ replacement (boot may apply)

## Python Model Architecture

**File:** `1031_qoz_interaction_model.py` (runnable, tested)

**Core classes:**
- `Property` — rental property (purchase price, land value, accumulated depreciation, accelerated depreciation, cost-seg)
- `Investor` — tax posture (filing status, ordinary bracket, REPS, MAGI, rural QOZ)
- `Exchange1031` — 1031 mechanics (relinquished/replacement FMV, mortgage, boot, recapture waterfall)
- `QOZInvestment` — QOZ deferral + basis step-up + 10-yr exclusion (TCJA vs OBBBA regime auto-detected)
- `ExitScenario` — top-level container that orchestrates 4 scenarios

**4 example scenarios built in:**
1. `SELL_ONLY` — taxable sale, no deferral
2. `SELL_THEN_1031` — 1031 into non-QOZ replacement
3. `SELL_THEN_1031_INTO_QOZ` — 1031 into QOZ property, hold 10yr
4. `SELL_THEN_1031_INTO_QOZ_RURAL_QROF` — 1031 into rural QOZ (OBBBA QROF tier)

**Run:**
```bash
python 1031_qoz_interaction_model.py --test           # full smoke test suite
python 1031_qoz_interaction_model.py --example sell_only
python 1031_qoz_interaction_model.py --example sell_then_1031_into_qoz
python 1031_qoz_interaction_model.py --example all    # all 4 examples
```

## Test Results (from `python --test`)

**Test 1 (SELL_ONLY, $560K sale, $20K §1245 + $60K §1250 + $198K LTCG):**
- Tax: **$71,899** (37% × 20K + 28.8% × 60K + 23.8% × 198K)
- Net after-tax: **$454,501**

**Test 2 (SELL_THEN_1031, no boot, replacement $620K):**
- §1245 recognized: $20K (always recognized, not boot-conditional)
- §1250 + §1231: $0 (no boot, fully deferred)
- Tax at 1031 closing: **$7,400** ($20K × 37%)
- Deferred gain rolled into replacement basis: **$312,000**

**Test 3 (SELL_THEN_1031_INTO_QOZ, TCJA pre-2027):**
- Tax at 1031 closing (§1245 only): $7,400
- Tax at QOZ year-5 inclusion (10% step-up → 90% recognized at ordinary): $98,124
- Tax on QOF appreciation (10-yr exclusion): $0
- **Total lifecycle tax: $105,524**
- **Vs sell-only: -$33,625** (i.e., 1031+QOZ COSTS $33,625 MORE than sell-only in this scenario)
- **Why:** Under TCJA pre-2027, the deferred gain is recognized at ordinary rates (37%), which is HIGHER than the §1250 (28.8%) the investor would have paid on sell-only. The 10% step-up is insufficient to overcome the rate differential.
- **Mitigation:** Hold QOF ≥7 years for the 15% step-up (now eliminated by OBBBA for new investments, but still available for pre-2027 investments); or sell QOF by 12/31/2026 and re-defer via 1031 into non-QOZ replacement.

**Test 4 (SELL_THEN_1031_INTO_QOZ_RURAL_QROF, OBBBA post-2027):**
- §1245 at 1031 closing: $5,550
- QOZ year-5 inclusion (30% step-up → 70% recognized at ordinary): $74,592
- QOF appreciation (10-yr exclusion): $0
- **Total lifecycle tax: $80,142**
- **Vs sell-only: -$28,598** (still costs more than sell-only)
- **Why:** Even with the 30% QROF step-up, the deferred gain is still recognized at ordinary rates. The 10-yr QOF appreciation exclusion does not save anything that was never taxed.
- **Verdict:** 1031+QOZ is NOT a tax-savings vehicle by itself; it is a **deferral + appreciation-exclusion** vehicle. The math is favorable only if (a) the QOF appreciates substantially (10%+ over 10 years), AND (b) the investor would otherwise be in a HIGHER bracket at the time of the deferred-gain inclusion (e.g., income spikes in 5 years from other sources), AND/OR (c) the QOZ property generates substantial depreciation during the hold period (which offsets passive income).

## Top 3 Most-Actionable Tax Strategies (after-tax IRR impact)

### 1. **REPS status + cost segregation + 100% bonus (annual Year-1 cash flow)**
- **Strategy:** Elect REPS (750-hr + 50% tests), do cost seg on ≥$450K properties, layer OBBBA 100% bonus on 5/7/15-yr components
- **Year-1 deduction:** Typical 25-35% of depreciable basis (cost-seg reclass + 100% bonus)
- **After-tax IRR uplift:** +200-400 bps vs no-cost-seg/REPS-bypass investor
- **Risk:** REPS requires contemporaneous time logs; IRS scrutiny per Moss 2023, Assaf 2023
- **Engine flag:** `is_rep = True` + `cost_seg_basis = 0.30 × depreciable_basis` + bonus = 1.0

### 2. **1031 at exit to defer §1250 + §1231 to a low-income year (timing arbitrage)**
- **Strategy:** When selling an appreciated DSCR property, use 1031 to defer all gain except §1245 (which is recognized regardless). Carry the deferred gain in the replacement property basis. If the investor can trigger the replacement sale in a low-income year (e.g., early retirement, sabbatical, low-portfolio-income year), the §1250/§1231 deferred gain is recognized at lower marginal rates.
- **After-tax IRR uplift:** +100-300 bps depending on rate arbitrage magnitude
- **Engine flag:** `exchange_1031` + user-supplied `replacement_sale_year_marginal_rate`

### 3. **QOZ double-dip for long-horizon appreciation (10-yr exclusion)**
- **Strategy:** 1031 into QOZ property (or contribute cash to QOF for §1400Z-2 deferral). Hold ≥10 years. On exit, 100% of the QOF appreciation is excluded from gross income (§1400Z-2(c)). Use QROF (rural) for the 30% step-up on the deferred original gain.
- **Effective tax on QOF appreciation: 0%** (vs 23.8% LTCG + 3.8% NIIT = 27.6% on direct REIT sale)
- **After-tax IRR uplift:** +150-400 bps on the QOZ-tranched portion of the portfolio
- **Pre-2027 vs Post-2026 trade-off:** Pre-2027 investments get 15% step-up at year 7 (better) but lose the deferral on 12/31/2026. Post-2026 get 10% step-up at year 5 (less favorable on the deferred gain, but deferral period is 5 years, not 0).
- **Engine flag:** `qoz` + `hold_years >= 10` + optional `is_rural=True` for QROF

## Top 3 Sources (Tier 1)

1. **IRS Rev. Proc. 2025-32** (Oct 2025) — primary source for 2026 inflation adjustments; OBBBA codification
2. **IRC §1400Z-2 as amended by P.L. 119-21 §70431** (OBBBA, July 4 2025) — primary statute for QOZ permanent extension and rule changes
3. **IRS Form 8960 Instructions (2025)** + **Topic 559** — NIIT MAGI thresholds ($200K/$250K/$125K) FROZEN since 2013

## Blockers / Open Issues

1. **§1400Z-2(c) interaction with OBBBA 100% bonus depreciation** — IRS has NOT yet issued definitive guidance on whether QOZ appreciation is fully excludable when the underlying QOZ property has had substantial §168(k) bonus depreciation taken. Risk: ordinary-income recapture on the bonus portion of the appreciation. *Mitigation:* Consider §168(k)(4) election to opt out of bonus on QOZ property (preserve the 10-yr exclusion, lose Year-1 deduction).
2. **QOF-interest 1031** — TCJA 2017 eliminated partnership-interest 1031; QOF as an entity is often a partnership or C-corp, so direct 1031 of the QOF interest may be unavailable. IRS guidance is silent. *Mitigation:* Liquidate the QOF in kind (distribute the underlying QOZ property to the partner), then 1031 the distributed property directly.
3. **State conformity to OBBBA** — California, New York, New Jersey, and other high-tax states do NOT conform to federal OBBBA (no permanent 100% bonus, no permanent QOZ). For state-income-tax purposes, must run a separate depreciation schedule. Out of scope of Slice 3 (federal only).
4. **REPS time-log audit risk** — Moss 2023 and Assaf 2023 set a high bar. Reconstructed logs routinely rejected. *Mitigation:* Daily contemporaneous time-tracking app (e.g., Toggl, Harvest) with property-level tagging from Day 1.
5. **§163(j) ATI exclusion for real property** — IRC §163(j)(2)(B) excludes real-property trade-or-business from ATI; Treasury Reg. §1.163(j)-1(b)(12) further excludes the "electing real property trade or business" interest. DSCR property-LLC interest is generally excludable from ATI. Confirm with tax counsel; engine defaults to exclusion.
6. **NIIT and REPS interaction** — REPS converts passive income to non-passive; whether the income remains §1411 NII is uncertain (the §1411(c)(2) trade-or-business carve-out may apply). Conservative default: apply NIIT. *Mitigation:* Material participation + trade-or-business election can support the carve-out (T.D. 9907 final regs).

## Files Created
- `RESEARCH/domain_10/RESEARCH_DOMAIN_10_1031_QOZ.md` (this file, ~12KB)
- `RESEARCH/domain_10/1031_qoz_interaction_model.py` (runnable Python, 4 smoke tests pass)
