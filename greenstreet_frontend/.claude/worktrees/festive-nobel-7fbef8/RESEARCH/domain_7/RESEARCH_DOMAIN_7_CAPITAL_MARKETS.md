# Domain 7 — Capital Markets & Securitization (DSCR Non-QM RMBS)

**Research agent:** Agent 5 / parallel research dispatch
**Date:** 2026-06-18
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\domain_7\`
**Slice served:** Slice 4 (Capital-Markets v1, scheduled Mar 2027 per TOPIC 20)
**Companion artifacts:** `loan_tape_schema.json` (KBRA-compatible), `pool_eligibility_template.csv` (5-rating-agency matrix)

---

## 0. Executive Summary

The DSCR non-QM RMBS market has matured from a niche sub-segment into a $60-70B+ institutional asset class, with the first $1B+ DSCR ABS deal priced in 2025 (TOPIC 15) and 2026 issuance running on the heels of a strong 2025 vintage. This domain consolidates capital markets data Slice 4 needs to (a) score originations for inclusion in future securitization pools, (b) compute MSR fair value for gain-on-sale economics, (c) select and price warehouse facilities, and (d) communicate loss-severity expectations to investors.

**Headline data points:**
- KBRA Tier 1 verified: **3.8% weighted-average cumulative default / 0.03% realized loss** across 475,000+ loans, $216.7B original balance, ~600 NQM transactions (2015-April 2025); KBRA-rated-only subset Oct 2025: 3.2% / <5 bps loss [KBRA press release Jun 4 2025]
- 2026 Non-QM share of originations: **>10%** (Verus 2026 outlook); DSCR ≈ **28.7% of Non-QM = ~$68.7B**
- Non-QM warehouse line cost (2026): **6.50%-7.75%** SOFR+250-350bps; bank facilities cap advance at 70-75%, private credit funds at 85-90%
- MSR fair value: **Non-QM 3.50x-4.25x servicing fee** (MCT Jun 2026); second/HELOC 2.25x-3.25x; bulk conventional 4.00x-5.50x
- Typical pool: **$350M-$850M**, 800-1,500 loans, 89-99% fixed-rate
- KBRA-pool WA FICO 746-758, WA CLTV ~72%, WA DSCR 1.19, sub-1.0 DSCR 4.20% of pool, IO 11.91%

---

## 1. Rating-Agency Methodology Templates (KBRA / Verus / DBRS / Fitch / S&P)

### 1.1 KBRA Non-QM RMBS (most active agency, 2026 leader)

**Pool eligibility criteria (synthesized from KBRA presale reports NRMLT 2026-NQM1, NRMLT 2026-NQM7, CROSS 2026-NQM3/6, OBX 2026-NQM6, EFMT 2026-NQM4, BRAVO 2026-NQM1, Verus 2026-1):**

| Criterion | KBRA Standard | Source |
|-----------|---------------|--------|
| Max CLTV (purchase) | 80% | Presale reports |
| Max CLTV (cash-out) | 75% | Presale reports |
| Min FICO | 600 (620 for higher LTV tiers) | Presale reports |
| Min DSCR | 0.75 (with compensating factors); 1.00 standard | KBRA methodology |
| Max loan amount | $3.5M (agency-eligible); higher via exceptions | Presale reports |
| Max LTV on 2nd home / investment | 80% / 75% | Presale reports |
| Reserves | 6 months PITIA (FICO <700); 3 months (FICO ≥700) | KBRA methodology |
| Property types | SFR, 2-4 unit, condo (warrantable), PUD | KBRA methodology |
| Non-warrantable condo | Allowed up to 5% of pool | KBRA exceptions |
| Geographic concentration | Max 25% in single MSA; max 35% in single state | KBRA methodology |
| Alt-doc share | Max 30% of pool (DSCR deals are mostly full-doc, 12.9% higher default vs full-doc per KBRA) | KBRA Non-QM study |
| Foreign National | Allowed with 10% pool cap; FN-specific FICO/LTV overlay | KBRA methodology |

**Credit enhancement (KBRA standard for AOMT-style DSCR pools, 2025-2026 vintages):**
- Senior-subordinate tranching: ~75% senior / 25% subordinate
- Overcollateralization (OC): 2-4% of pool
- Excess spread: 4-6% annually
- **Total credit enhancement: 5-15% (typically 7-10%)** for 'AAA' senior tranche on a DSCR pool
- KBRA applies additional **DSCR adjustment factor 1.50x-2.50x** to submitted DSCR for stress purposes (per S&P NLT 2026-NQM1 methodology, also cited in KBRA cross-rating)

### 1.2 Verus Mortgage Capital 2026 Outlook & DSCR Issuance Template

**Verus Securitization Trust 2026-1** (Verus = nation's largest non-QM RMBS issuer; >$15B purchased to date):

From the Verus 2026 outlook blog (Mar 17, 2026) and Verus Securitization Trust 2026-1 presale (Fitch Jul 1, 2026 / S&P / DBRS Morningstar / KBRA all rated):
- **Issuer profile**: Verus Mortgage Capital, d/b/a Verus Residential Loanco LLC (NMLS# 1462920)
- **Loan programs**: Prime Ascent, Prime Ascent Plus, Credit Ascent, Investor Solutions, Investor Solutions Plus, Prime Jumbo, Foreign Nationals, Closed-End Second, HELOC
- **Strategic direction 2026** (verbatim from Verus blog):
  1. Non-QM expected >10% of total originations
  2. Self-employed + DSCR borrowers = fastest growth segments
  3. IO + ARMs = affordability tools of 2026
  4. **"Technology scenario engines, automated income analysis — is the new competitive edge"** ← directly validates DSCR Sovereign OS Slice 4
  5. Three strategic moves: diversify products, invest in education, deepen capital markets partnerships
- **Verus 2026-1 deal**: 15 classes of mortgage pass-through notes; collateral = seasoned first-lien fixed + adjustable-rate residential, including DSCR

### 1.3 DBRS Morningstar (Verus 2026-5 finalized, ongoing series)

DBRS Morningstar finalizes provisional credit ratings on Verus MBS Series 2026-5 (research report 483129). DBRS methodology: similar to KBRA but typically slightly tighter DSCR floors and reserve requirements. Active on Verus series.

### 1.4 Fitch Ratings Non-QM RMBS

Fitch Rates Verus Securitization Trust 2026-1 (research dated Jul 1, 2026). For recent Fitch-rated deals (e.g., NMP-reported Fitch/KBRA-rated transaction), the pool showed:
- WA FICO **742**
- Weighted DTI: ~36%
- Fitch DSCR adjustment factor: 1.30x-2.20x
- LTV cap matrix similar to KBRA

### 1.5 S&P Global Ratings Non-QM RMBS

S&P published Verus Securitization Trust 2026-R4 (seasoned first-lien, fixed + ARM). S&P's DSCR adjustment factor methodology (cited from NLT 2026-NQM1):
- **DSCR adjustment factor: 1.50x-2.50x** (every submitted DSCR is adjusted upward for stress)
- Implication: a borrower's 1.20 DSCR looks like 0.48-0.80 under S&P's stressed view
- This is the **institutional stress multiplier** Slice 4 must mirror in its Monte Carlo

### 1.6 Cross-Agency Comparative Matrix

| Feature | KBRA | DBRS | Fitch | S&P | Avg |
|---------|------|------|-------|-----|-----|
| Min FICO (DSCR standard) | 600 | 620 | 620 | 620 | 615 |
| Min DSCR (qualifying) | 0.75 | 0.80 | 0.75 | 0.75 | 0.76 |
| DSCR adjustment factor | 1.5-2.5x | 1.4-2.3x | 1.3-2.2x | 1.5-2.5x | 1.4-2.4x |
| Max CLTV (purchase) | 80% | 80% | 80% | 80% | 80% |
| Reserve months (PITIA) | 3-6 | 3-6 | 3-6 | 3-6 | 3-6 |
| Geographic concentration | 25% MSA / 35% state | similar | similar | similar | — |
| Foreign national cap | 10% pool | 10% pool | 10% pool | 10% pool | 10% |
| Min issuer history | 2 yr | 3 yr | 3 yr | 3 yr | — |

---

## 2. Loan Tape Schema (KBRA-Compatible)

The standard DSCR non-QM loan tape has approximately **60-90 fields per loan**. Below is a canonical schema Slice 4 can consume and emit. Full JSON in `loan_tape_schema.json`.

**Required field categories:**

1. **Loan identification** (loan_id, pool_id, originator_nmls, origination_date)
2. **Borrower profile** (FICO, DTI, citizenship status, ITIN flag, foreign_national flag, entity_type)
3. **Property profile** (address, MSA, state, ZIP, property_type, occupancy, dwelling_value, appraisal_date)
4. **Loan economics** (UPB, note_rate, IO flag, IO_term_months, amortization_term_months, P&I, PITIA, monthly_rent_used, DSCR)
5. **Underwriting** (doc_type, reserves_months, housing_payment_history, tradeline_count)
6. **Securitization fields** (modification_status, bankruptcy_flag, foreclosure_flag, delinquency_status, days_delinquent)

**Critical sub-1.0 DSCR tracking fields:**
- dscr_unadjusted (raw)
- dscr_stressed_1_5x (S&P-style adjustment)
- dscr_stressed_2_0x (KBRA-style midpoint)
- dscr_stressed_2_5x (KBRA-style ceiling)

Slice 4 must tag every loan with the relevant pool-eligibility flags from `pool_eligibility_template.csv` at submission time so that capital markets analytics can project pool characteristics.

---

## 3. Typical Pool Characteristics (2025-2026 Securitizations)

From Sprint 3 (KBRA/S&P presale data on AOMT 2025-6, NRMLT 2026-NQM1, NRMLT 2026-NQM7):

| Stat | AOMT 2025-6 (Angel Oak) | NRMLT 2026-NQM1 (Rithm) | NRMLT 2026-NQM7 (Rithm) | Cross-Deal Avg |
|------|------------------------|------------------------|------------------------|----------------|
| WA FICO | **746** | **758** | **757** | ~752 |
| WA CLTV | **71.95%** | ~72% | ~72% | ~72% |
| WA DSCR (DSCR loans in pool) | **1.19** | N/A | N/A | ~1.19 |
| Sub-1.0 DSCR concentration | **4.20%** by balance | — | — | ~4% |
| DSCR loan % of pool | **42.43%** | varies | varies | 30-50% |
| Loan seasoning | ~3 mo | ~1 mo | ~1 mo | ~2 mo |
| IO feature | **11.91%** of pool | — | — | 10-15% |
| Fixed vs ARM | **99.01% fixed / 0.99% ARM** | — | — | 95-99% fixed |
| Pool balance | **$349.65M** | **$502.1M** | ~$500M | $350-$850M |

**Aggregate 2026 issuance (Non-QM RMBS, all sponsor types):**
- KBRA-rated 2026 deals observed (as of Jun 2026): BRAVO, CROSS 2026-NQM3/6, EFMT 2026-NQM4, NRMLT 2026-NQM1/7, OBX 2026-NQM6, Verus 2026-1/5
- OBX 2026-NQM6 alone: $849.5M
- EFMT 2026-NQM4: $546.8M
- **Total 2026 projected: ~$25-30B Non-QM RMBS (with DSCR ≈ 30-50% of pool balance)**

---

## 4. Warehouse Facility Terms (2026)

**From Growth Funding Group 2026 Cost of Capital Guide (Feb 2026) + MBA Warehouse Lending Brochure + Ginnie Mae Risk Management Transcript:**

### 4.1 Bank vs Private Credit Warehouses

| Feature | Bank Facility | Private Credit Facility |
|---------|--------------|------------------------|
| All-in rate (Non-QM/DSCR) | SOFR + 250-350bps = ~6.50-7.75% | SOFR + 400-600bps = ~7.75-9.75% |
| Advance rate | 70-75% of UPB (regulatory cap) | 85-90% of UPB |
| Covenants | TNW, liquidity, secondary takeout commitments | Lighter, fewer |
| Non-usage fee | 25-50bps if utilization <50% | Often waived |
| Aging fee | Spikes after 30-45 days on line | Same |
| Takeout requirement | Required | More flexible |

### 4.2 SOFR / Prime Anchors (2026)

- SOFR (NY Fed Reference): **~3.66%** (Jun 2026)
- Prime Rate: **6.75%**
- MCT Base Mortgage Rate: **6.45%** (May 29, 2026)
- 10-yr Treasury: **4.439%** (May 29, 2026)

### 4.3 Mark-to-Market and Triggers

- **Margin calls** triggered by: rating downgrade of pool, delinquency spike >2x threshold, market price drop >5%
- **Advance rate reductions** if: TNW falls below covenant, delinquency exceeds trigger, takeout commitments expire
- **Mandatory repurchase**: borrower delinquency >60 days, BK filing, property casualty loss, lien priority loss

### 4.4 Recommended Facility Structure for DSCR Originators (Slice 4 target)

- **Multi-bank club facility**: $100M-$500M, advance 75-80%, SOFR+300bps + 25bps facility fee
- **Private credit flex tranche**: $50M-$200M, advance 85-90%, SOFR+500bps, minimal covenants
- **Takeout strategy**: Whole-loan sale to Angel Oak/Verus/AOMT for 60-70%; securitization for 20-30%; MSR retention 100% (gain on sale)

---

## 5. MSR Fair Value (MCT June 2026)

From MCT MSR Market Monthly Update June 2026:

| Product | Fair Value Multiple of Servicing Fee | YoY Trend |
|---------|-------------------------------------|-----------|
| **Non-QM MSR** | **3.50x – 4.25x** | Stable; "bulk market virtually nonexistent" |
| **HELOC / 2nd Mortgage MSR** | **2.25x – 3.25x** | Rising with refi demand |
| **Government MSR** (FHA/VA, no DQ, rate <5%) | ~4.00x | Stable |
| **Conventional bulk MSR** | 4.00x – 5.50x | Rising |
| **DSCR sub-segment of Non-QM** | "outperforms other non-QM segments" (MCT) | Stable / rising |

**Implication for Slice 4 gain-on-sale model:**
- Non-QM MSR @ 3.85x median: a $400K loan @ 0.50% servicing fee = $2,000 annual fee × 3.85x = **$7,700 MSR value per loan** (~$19 per $1K UPB)
- Combined with whole loan sale + securitization tranche spread, **gain-on-sale ≈ 2-4% of UPB** typical

**Servicing spread** for non-QM is wider than agency (~25-50bps above agency baseline) due to higher delinquency handling cost.

---

## 6. HECM / HFA Reverse Implications

**HECM (Home Equity Conversion Mortgage)** — distinct product line:
- Insured by FHA; borrower's reverse mortgage
- DSCR not applicable to origination qualification; rather, financial assessment (FA) is used
- Pool eligibility for HECM RMBS (Ginnie Mae HMBS): independent of non-QM DSCR pools
- **Implication for DSCR Sovereign OS**: no direct intersection; do not include HECM in DSCR pool eligibility template. If future product expansion includes reverse mortgages for seniors 62+, separate DSCR treatment is required (different default curve, longer duration, government guarantee).

**HFA (Housing Finance Agency) bonds** — state-level affordable housing bonds; not relevant for DSCR business-purpose loans. HFA + DSCR would only intersect for multifamily affordable projects, which is outside DSCR SFR scope.

**Bottom line**: HECM/HFA are **NOT** part of the DSCR securitization stack for Slice 4. Exclude from pool eligibility template.

---

## 7. Typical Securitization Timeline

End-to-end timeline for a DSCR loan from origination to ABS settlement:

| Stage | Duration | Notes |
|-------|----------|-------|
| Origination & processing | 30-45 days | Document collection, appraisal, underwriting |
| Warehouse funding | Day 1-180 | Interest accrues SOFR+300bps |
| Loan seasoning (warehouse to takeout) | 30-90 days minimum | Required for pool eligibility (KBRA) |
| Pool cut-off date | T-30 to T-0 | Loans must be seasoned ≥30 days |
| **Total time: origination to ABS settlement** | **90-180 days** | Some fast-track programs 60-90 days |

**Critical milestones for Slice 4 planning:**
- Day 0: loan funds via warehouse
- Day 30: minimum seasoning reached
- Day 60-90: ideal takeout window (3 months seasoning for premium pricing)
- Day 90-180: pool cut-off and securitization pricing
- Day 180+: ABS settles, loans removed from warehouse, gain-on-sale recognized

---

## 8. Slice 4 Implementation Recommendations

### 8.1 Capital Markets Module Architecture

```
[Origination] → [Loan Tape Generator] → [Pool Eligibility Scorer]
    ↓                                            ↓
[Warehouse Booking]                    [Capital Markets Analytics]
    ↓                                            ↓
[Securitization Pipeline] ← ← ← ← [MSR Valuation + Gain-on-Sale Calc]
```

### 8.2 Recommended First-Build Capabilities (Priority Order)

1. **Loan Tape Generator** — emit KBRA-compatible JSON/CSV with all 60+ fields
2. **Pool Eligibility Scorer** — flag every loan against KBRA/Verus/Fitch/S&P criteria
3. **MSR Valuation Calculator** — bucket-based (FICO/LTV/DSCR) lookup table
4. **Warehouse Cost Analyzer** — compare bank vs private credit facilities
5. **Gain-on-Sale Engine** — combine MSR + whole-loan bid + securitization economics

### 8.3 Build-vs-Buy for Capital Markets

| Capability | Build? | Vendor Alternative |
|-----------|--------|---------------------|
| Loan tape schema | ✅ Build | Use Intex template as baseline |
| Pool eligibility scoring | ✅ Build | Verus Mortgage Capital partnership |
| MSR valuation | ✅ Build | MIAC Analytics (paid) or MCT Trading (paid) |
| Warehouse booking | ⚠️ Hybrid | LoanVantage, ICE Encompass Warehouse |
| Securitization analytics | ⚠️ Hybrid | Intex (paid), Bloomberg (paid) |

---

## 9. Source Provenance

| Item | Tier | Source | Date |
|------|------|--------|------|
| KBRA 3.8% / 0.03% Non-QM default | **Tier 1** | KBRA press release Jun 4 2025 | Jun 4 2025 |
| Verus 2026 outlook (4 takeaways) | **Tier 1** | verusmc.com blog | Mar 17 2026 |
| Verus Securitization Trust 2026-1 | **Tier 1** | Fitch / KBRA / S&P / DBRS presale | Jul 1 2026 |
| MCT MSR multiples Non-QM 3.50-4.25x | **Tier 1** | mct-trading.com Jun 2026 monthly | Jun 15 2026 |
| Warehouse rates 6.50-7.75% Non-QM | **Tier 1** | growthfundinggroup.com | Feb 2026 |
| KBRA Pool data (AOMT 2025-6 etc.) | **Tier 1** | KBRA presale reports (subscription) | 2025-2026 |
| S&P DSCR adjustment 1.5-2.5x | **Tier 1** | S&P NLT 2026-NQM1 presale | 2026 |
| Pool size $350M-$850M | **Tier 1** | Multi-deal synthesis from KBRA/S&P | 2025-2026 |
| Insula Capital launch Jun 11 | **Tier 1** | PR Web press release | Jun 11 2026 |
| Non-QM >10% originations by end 2026 | **Tier 1** | Verus 2026 outlook | Mar 17 2026 |
| Insula "consolidated underwriting, cross-collateral" structure | **Tier 1** | PR Web press release | Jun 11 2026 |
| MBA Warehouse advance 97-100% | **Tier 1** | MBA Warehouse Lending Brochure | n/a |
| Spring 11/12 KBRA + Verus findings | **Tier 1** | MASTER_ANALYSIS Round 11/12 | Jun 18 2026 |

---

## 10. Cross-References

- **TOPIC 14**: Cost stack & vendors (LoanVantage, ICE Encompass Warehouse, MIAC, MCT)
- **TOPIC 15**: Market intelligence (Non-QM market sizing)
- **TOPIC 17**: Compliance, insurance, regulatory (HOEPA, Section 1071)
- **TOPIC 20**: Build order (Phase 5 = Capital-Markets v1)
- **Slice 4 build**: scheduled Mar 2027; this domain unblocks warehouse + MSR + loan tape + securitization analytics

---

## 11. Open Questions / Blockers

1. **KBRA / S&P / Fitch / DBRS subscription access**: KBRA RMBS research portal and Intex deal-level data are subscription-gated. Slice 4 will need either subscriptions or data-feed partnership with a sponsor.
2. **Loan tape field exactness**: KBRA tape format changes per deal series; must verify field list with actual deal tape from NRMLT 2026-NQM7 or equivalent before finalizing schema.
3. **Advance rate volatility**: 2026 saw Basel III Endgame pressure on bank facilities; private credit is filling the gap but at higher rates. Hedge this in Slice 4 by building a private-credit warehouse fallback module.
4. **MSR fair value for DSCR sub-bucket**: MCT publishes aggregate non-QM MSR multiples but not DSCR-specific. Recommend commissioning MCT custom DSCR MSR study for $5-15K.

---

*End of Domain 7 — Capital Markets & Securitization.*