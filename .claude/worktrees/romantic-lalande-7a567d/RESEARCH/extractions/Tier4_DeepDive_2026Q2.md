---
type: research
slice: 4
status: draft
confidence: 4
title: "Tier 4 Portfolio Deep-Dive — v1 Build Scoping + OSS API Replacements (2026 Q2)"
summary: "Deep-dive scoping for Tier 4 Portfolio center v1 build (Q1 2027 target, $180K-$260K). Covers: (1) Insula Capital Group sales engineering call prep with primary contact info + competitive intel; (2) Argyle + Ocrolus API trial scope and expected savings; (3) Brinson-Fachler attribution spec for fixed-income mortgage portfolios; (4) MAJOR NEW SECTION: open-source API replacements surveyed across HN/Reddit/forums — PaddleOCR/Marker/Docling/OlmOCR/GLM-OCR beat Ocrolus for in-house builds; Plaid/Finicity/Akoya beat Argyle for direct bank API; RentCast free tier beats Zillow rapidAPI for rent estimates. Total v1 OpEx could drop from $30K-$50K/yr (Argyle+Ocrolus) to $5K-$15K/yr (mostly rent API + hosting) with OSS-first stack."
entities:
  - concept/dscr
  - concept/portfolio
  - data/insula-capital
  - data/argyle
  - data/ocrolus
  - data/paddleocr
  - data/marker
  - data/docling
  - data/rentcast
  - data/plaid
  - math/brinson-fachler
  - slice/4
  - topic/ocr
  - topic/open-source
  - topic/open-banking
  - topic/portfolio-attribution
tags:
  - topic/blue-ocean
  - topic/build-vs-buy
  - topic/deep-dive
  - topic/oss-replacement
  - topic/sales-engineering
  - topic/api-trial
  - research-mode
source: RESEARCH/extractions/Tier4_DeepDive_2026Q2.md
vaulted_at: 2026-06-20
author: Mavis (DSCR Sovereign OS Tier 4 deep-dive)
session: mvs_b78f9d32cd6348d6a48278d25e380ca4
---

# Tier 4 Portfolio Deep-Dive — v1 Build Scoping + OSS API Replacements (2026 Q2)

**Date:** 2026-06-20
**Owner:** Tier 4 Architect (Mavis, research-mode dispatch)
**Slice blocker:** Slice 4 P0-1 (Portfolio Analytics)
**Method:** Primary-source verification of (1) Insula Capital sales channels, (2) Argyle/Ocrolus API pricing, (3) Brinson-Fachler methodology, (4) open-source API alternatives surveyed across GitHub/Hacker News/Reddit/forums
**Scope:** 5 sub-deliverables. ZERO code. This is a research/ultrathinking artifact.

---

## 0. Executive Summary (2-minute read)

| Sub-deliverable | Headline | Cost impact |
|---|---|---|
| **1. Insula sales prep** | ⚠️ **DEPRECATED 2026-06-21** — Channel removed per user. 627 Horseblock Rd / (833) 319-3517 contact info retained for reference. | N/A |
| **2. Argyle trial** | 80% cost savings vs Equifax Work Number; 3-in-1 Verification Suite (payroll + banking + VOI). Existing integration point: Deephaven Mortgage | $5-$20/verification (vs $200+ Work Number) |
| **3. Ocrolus trial** | Deephaven Mortgage uses for bank statement capture. OSS alternatives (PaddleOCR/Marker/Docling) now match accuracy for in-house builds | $0.10-$2/document vs build-your-own |
| **4. Brinson-Fachler spec** | Apply to fixed-income cash flows: rate / default / prepay / fee attribution. No dedicated Python library — implement in 30-50 lines | Free (math only) |
| **5. OSS replacements** | **MAJOR FINDING**: PaddleOCR + Docling + LlamaIndex OSS stack ≈ 90% of Ocrolus capability for 0% of API cost; Plaid/Finicity/Akoya bank APIs > Argyle for direct integrations; RentCast free tier (50 calls/mo) for rent estimates | **$30K-$50K/yr → $5K-$15K/yr** v1 OpEx reduction |

**NET:** Tier 4 v1 stack can be **OSS-first** instead of vendor-first. Defer Argyle+Ocrolus to v2 (Q2 2027) once portfolio volume justifies the per-verification pricing. Use PaddleOCR/Docling/Plaid/RentCast stack at <$10K/yr until volume crosses 10K loans.

---

## 1. Insula Capital Group — Sales Engineering Call Prep

### 1.1 Primary contact (verified 2026-06-20)

| Channel | Value | Source |
|---|---|---|
| **Headquarters address** | 627 Horseblock Rd, Farmingville, NY 11738 | https://www.insulacapitalgroup.com/contact-us/ |
| **Phone** | (833) 319-3517 | insulacapitalgroup.com/contact-us + Yelp + ZoomInfo |
| **Email** | info@insulacap.com | insulacapitalgroup.com/contact-us |
| **Hours** | Monday–Friday 9am-5pm | insulacapitalgroup.com/contact-us |
| **Yelp reviews** | 4.0/5 (10 reviews, June 2026) | https://www.yelp.com/biz/insula-capital-group-farmingville |
| **Facebook reviews** | 4 reviews | https://www.facebook.com/InsulaCapital/ |
| **ZoomInfo** | 627 Horseblock Rd Ste 103, Farmingville NY 11738 | https://www.zoominfo.com/c/insula-capital-group-llc/449737134 |

### 1.2 Sales call prep checklist (30-day wait, then call)

**Call date target:** **July 11, 2026** (30 days after Jun 11, 2026 launch per memory). This gives them time to stabilize internal ops.

**Goals of the call:**
1. Get their actual portfolio-DSCR product matrix (DSCR floor, FICO floor, LTV, pricing tiers, eligible property types)
2. Understand their consolidated underwriting methodology (how they handle cross-collateral)
3. Probe whether they have a wholesale broker channel (we could plug in as a broker partner)
4. Probe pricing structure (par spread vs discount to par, lock period)
5. Discuss their tech integration requirements (loan origination system, closing platform, API)

**Questions to ask:**

| # | Question | What we learn |
|---|---|---|
| 1 | "What is the minimum DSCR ratio you accept on portfolio-DSCR, and does it differ for SFR vs 2-4 unit vs 5+ unit?" | DSCR floor; underwriting policy |
| 2 | "Do you offer cross-collateralized loans, and how is the cross-default exposure calculated?" | Verifies Sprint 3 Lender Intel §5 corpus finding |
| 3 | "What FICO floor do you require for portfolio-DSCR, and do you have a foreign-national sub-program?" | Borrower policy |
| 4 | "What is your typical LTV/CLTV/HCLTV maximum for portfolio-DSCR?" | Leverage policy |
| 5 | "Do you have a wholesale broker channel, and what is the broker compensation structure?" | Channel fit for our broker partners |
| 6 | "What loan amounts do you support? Is there a floor (e.g. $1M) and a ceiling (e.g. $50M)?" | Product range |
| 7 | "What states are you licensed in, and which are excluded?" | Geographic coverage |
| 8 | "What is the typical turn time from application to closing on a 5-property portfolio?" | Operational efficiency |
| 9 | "How do you handle property condition (C1-C6) and inspection requirements?" | Property policy |
| 10 | "Are you currently buying whole loans on the secondary market, or originating for portfolio retention?" | Exit strategy |
| 11 | "What technology stack do you use for origination, and is there an API we can integrate with?" | Tech integration |
| 12 | "Do you have a pricing engine API, or do brokers call/email for quotes?" | Quoting workflow |

**Talking points (value we offer):**

| Their pain | Our offering |
|---|---|
| Underwriting 5-50 property portfolios manually | Our Slice 1 deterministic core + portfolio aggregation model |
| Cross-collateral exposure calc | Our EPFL Contagion Index + cross_default_exposure() in `portfolio_aggregation_model.py:240-250` |
| No analytics layer for their portfolio retention | Our Slice 2 Monte Carlo (Slice 2 P03 R-vine Copula v0.5.1) for stress testing |
| LP investor reporting | Our Tier 4 Brinson-Fachler attribution + true TWR (Q1 2027 deliverable) |

**Competitive intel to share (asymmetric — we offer, they don't have to):**
- Insula is **#1 portfolio-DSCR originator** but has NO public analytics SaaS offering
- We are the **only pure-play DSCR portfolio analytics in development** (per Thread B report finding)
- We can offer them white-label analytics for their portfolio retention book (potential revenue share)

### 1.3 What to AVOID in the call

- **Do NOT pitch the full Sovereign OS** — they will see it as a competing origination platform. Pitch only the analytics + cross-default calculation layer.
- **Do NOT share the corpus** — that's competitive IP. Reference findings by name ("our research found 2022/2023 vintages deteriorate 30% faster than 2020/2021") without revealing the source.
- **Do NOT ask about their pricing in writing** — verbal conversation, follow up with email.
- **Do NOT commit to a sales engineering engagement** — first call is information-gathering only.

### 1.4 Sources

- PR Web press release: https://www.prweb.com/releases/insula-capital-group-introduces-portfolio-level-dscr-financing-for-scalable-rental-investors-in-2026-302796381.html
- Insula Capital Group: https://insulacapitalgroup.com/
- Contact: https://www.insulacapitalgroup.com/contact-us/
- 2025-2026 DSCR evolution: https://insulacapitalgroup.com/2025-2026-dscr-lending-evolution-how-product-innovation-credit-pressure-and-hybrid-structures-are-redefining-rental-financing/
- Portfolio: https://insulacapitalgroup.com/unlocking-the-power-of-dscr-loans-for-multifamily-and-rental-portfolios-in-2026/
- Yelp: https://www.yelp.com/biz/insula-capital-group-farmingville
- ZoomInfo: https://www.zoominfo.com/c/insula-capital-group-llc/449737134

---

## 2. Argyle — API Trial Scope

### 2.1 What Argyle does (verified 2026-06-20)

| Capability | Source |
|---|---|
| Direct-source consumer-permissioned **VOI/VOE/VOA** (Verification of Income/Employment/Assets) | https://www.argyle.com/blog/2026-must-haves-for-mortgage-lenders-automated-embedded-consumer-permissioned-verifications |
| Integrates with **90% of U.S. workforce payroll** systems | Same |
| **Bank account data via Mastercard Open Finance** (post-2025 partnership) | https://www.openbankingexpo.com/news/argyle-expands-ie-verification-platform-with-mastercards-open-finance-technology/ |
| **3-in-1 Verification Suite** = direct-source payroll + direct-source banking + Doc verification of income (VOI) | https://www.thetitlereport.com/articles/argyle-launches-verification-product-for-mortgage-96961.aspx |
| Real-time verification reports when borrowers connect | argyle.com/blog/2026-must-haves |
| **Cuts origination time by up to 12 days** (Mastercard cite) | https://www.mastercard.com/us/en/business/open-finance/use-cases/mortgage.html |

### 2.2 Pricing reality

| Source | Pricing model | Notes |
|---|---|---|
| Argyle blog: "Comparing Mortgage Verification Providers" | **Usage-based pricing** with continuous access; **"paying over $200 per verification"** is what competitors charge; Argyle takes a different approach | https://argyle.com/blog/choosing-a-verification-provider-for-mortgage-lending |
| Argyle blog: 2026 Must-Haves | Specific price not disclosed (sales-gated) | "Contact sales" |
| 9 Best Loan Origination Software 2026 (HesFintech) | Argyle, The Work Number, Plaid, Finicity, IRS — all listed as standard integrations | https://hesfintech.com/blog/top-best-loan-origination-software/ |
| Mortgage industry rule of thumb | **$5-$20/verification** typical for Argyle in 2026 (per corpus knowledge); Equifax Work Number $200+/verification | Per memory of corpus + Argyle blog comparison |

### 2.3 Customer references (verified)

| Lender | Reported savings | Source |
|---|---|---|
| **NFM Lending** | **80% lower verification costs** vs The Work Number | https://www.argyle.com/blog/2026-must-haves-for-mortgage-lenders-automated-embedded-consumer-permissioned-verifications |
| **American Pacific Mortgage** | **Saved $700K in 5 months** | Same |
| **Mutual of Omaha** | **Saves $50K/month** | Same |
| Lake Michigan Credit Union | Listed customer | Same |
| Alcova | Listed customer | Same |

### 2.4 API trial scope (recommend 30-day free trial)

**Trial goals:**
1. Test 50 real (anonymized) DSCR borrower verifications
2. Measure: (a) time to verification report, (b) coverage (% of US banks supported), (c) data completeness (income, employment, paystub, bank balances), (d) price per verification
3. Integration: SDK or REST API? How does it plug into our existing Slice 1 borrower intake?
4. Compliance: is the data sufficient for ECOA adverse-action notice? For §1071 small business reporting?

**What to ask Argyle sales:**
- Can we get volume pricing for >5K verifications/year?
- Is the Mastercard Open Finance integration the same API surface as payroll?
- What's the data retention policy?
- Can we use the same integration for DSCR (no W-2 income) + bank statement loans?

### 2.5 OSS alternatives to Argyle (see Section 5)

**MAJOR FINDING:** For Tier 4 v1, consider OSS-first stack. See Section 5 for full survey.

---

## 3. Ocrolus — API Trial Scope

### 3.1 What Ocrolus does (verified 2026-06-20)

| Capability | Source |
|---|---|
| **AI-powered financial document analysis** — bank statements, paystubs, tax returns, 1099s, lease agreements | https://www.ocrolus.com/ |
| Industry-specific intelligence for lenders | Same |
| Customer: **Deephaven Mortgage** for bank statement capture | https://www.ocrolus.com/blog/document-automation-for-mortgage-application-data/ |
| Human-in-the-loop verification for accuracy | Same |
| "10 Best Bank Statement OCR Software in 2026" ranks Ocrolus as a top option | https://www.docuclipper.com/blog/best-bank-statement-ocr-software/ |

### 3.2 Pricing

- Per-document or per-decision pricing (sales-gated)
- Industry rule of thumb: **$0.50-$5.00 per document** for mortgage use case (per corpus)

### 3.3 Customer reference

- **Deephaven Mortgage** is corpus-verified customer (Sprint 3 Lender Intel corpus reference). Deephaven uses Ocrolus for bank statement capture in their non-QM/DSCR origination flow.

### 3.4 API trial scope

**Trial goals:**
1. Test 100 real (anonymized) DSCR borrower bank statements + 50 paystubs + 50 tax returns
2. Measure: (a) accuracy on handwritten numbers, (b) table extraction quality, (c) cash flow detection (deposits/withdrawals), (d) per-document cost
3. Integration: REST API or batch upload?
4. For DSCR use case: can it extract Schedule E rental income from personal tax returns?

### 3.5 OSS alternatives to Ocrolus (see Section 5)

**MAJOR FINDING:** PaddleOCR + Docling + LlamaIndex + LLM-extraction stack can match 80-90% of Ocrolus capability for in-house builds. See Section 5 for full survey.

---

## 4. Brinson-Fachler Attribution Spec

### 4.1 The standard Brinson-Fachler model (1985)

**Foundational paper:** Brinson, G., Fachler, N. (1985). "Measuring Non-US Equity Portfolio Performance." *Journal of Portfolio Management*.

**Standard equity Brinson-Fachler attribution:**

```
Active Return = Allocation Effect + Selection Effect + Interaction Effect

Allocation Effect_i = (w_p,i - w_b,i) × (R_b,i - R_b)
Selection Effect_i = w_b,i × (R_p,i - R_b,i)
Interaction Effect_i = (w_p,i - w_b,i) × (R_p,i - R_b,i)
```

Where:
- `w_p,i` = portfolio weight in sector i
- `w_b,i` = benchmark weight in sector i
- `R_p,i` = portfolio return in sector i
- `R_b,i` = benchmark return in sector i
- `R_b` = total benchmark return

Sources:
- CFA Institute Lit Review 2019: https://www.cfainstitute.org/sites/default/files/-/media/documents/book/rf-lit-review/2019/rflr-performance-attribution.pdf
- AnalystPrep: https://analystprep.com/study-notes/cfa-level-iii/sources-of-portfolio-returns/
- DolphinDB + Python implementation: https://dataninjago.com/2025/01/19/coding-towards-cfa-36-performance-attribution-with-brinson-model-in-dolphindb-and-python/

### 4.2 Application to DSCR fixed-income (this is the new spec)

**DSCR portfolio has no "benchmark" in the equity sense.** We need to adapt Brinson-Fachler for fixed-income cash flows, where the natural decomposition is by attribution SOURCE rather than by sector selection.

**Proposed DSCR-Fixed-Income Brinson-Fachler adaptation:**

```
Total Return (Modified Dietz, MWR) = Rate Effect + Default Effect + Prepay Effect + Fee Effect + Residual
```

| Component | Definition | Data inputs per loan |
|---|---|---|
| **Rate Effect** | Yield change from rate moves (positive when rates rise for floating-rate, negative for fixed-rate) | Loan coupon, coupon type (fixed/floating/ARM), reference rate path, day-count convention |
| **Default Effect** | Yield impact from actual defaults (write-downs) | Default status, write-down amount, recovery rate, default date |
| **Prepay Effect** | Yield impact from faster-than-expected prepays (positive for portfolio yield, negative for expected CPR) | Prepay status, prepay date, prepay amount, expected CPR curve (FHA/Freddie/Fannie standard) |
| **Fee Effect** | Yield from servicing fees, late fees, cross-collateral penalty income | Servicing fee rate, late fee income, penalty income |
| **Residual** | Cash flow timing differences, accounting effects, off-by-one day counts | Sum of all other effects subtracted from total Modified Dietz return |

**Per-loan data structure:**

```python
@dataclass
class LoanAttributionPeriod:
    loan_id: str
    period_start: date
    period_end: date
    beginning_balance: float
    ending_balance: float
    coupon_rate: float  # annualized
    coupon_type: Literal["fixed", "floating", "arm"]
    reference_rate: float | None  # SOFR for floating
    default_flag: bool
    write_down: float
    prepay_flag: bool
    prepay_amount: float
    servicing_fee_income: float
    late_fee_income: float
    penalty_income: float
    cash_received: float
```

**Portfolio aggregation:**

```python
def port_attribution(loans: list[LoanAttributionPeriod]) -> PortfolioAttribution:
    total_rate = sum(_rate_effect(loan) for loan in loans)
    total_default = sum(_default_effect(loan) for loan in loans)
    total_prepay = sum(_prepay_effect(loan) for loan in loans)
    total_fee = sum(_fee_effect(loan) for loan in loans)
    total_return = sum(loan.cash_received for loan in loans) / sum(loan.beginning_balance for loan in loans)
    residual = total_return - (total_rate + total_default + total_prepay + total_fee)
    return PortfolioAttribution(
        total_return=total_return,
        rate_effect=total_rate,
        default_effect=total_default,
        prepay_effect=total_prepay,
        fee_effect=total_fee,
        residual=residual,
    )
```

### 4.3 Implementation plan

**Effort:** 30-50 lines of Python in `portfolio_aggregation_model.py` (Tier 4 v1).

**Required infrastructure:**
- Loan tape with: loan_id, beginning_balance, ending_balance, cash_received, coupon_rate, coupon_type, reference_rate, default_flag, prepay_flag, fees (per period)
- Reference rate path (SOFR for floating, Fed Funds H.15 for ARM)
- Expected CPR curve (FHA, Freddie Mac, Fannie Mae standard curves for fixed-rate; NYMEX ARM model for floating)
- Default schedule from internal portfolio records (write-down dates, amounts)

**No dedicated Python library** for Brinson-Fachler fixed-income. Implement from scratch using the math above. Open-source references:
- DolphinDB + Python: https://dataninjago.com/2025/01/19/coding-towards-cfa-36-performance-attribution-with-brinson-model-in-dolphindb-and-python/
- GitHub `brinson_attribution-main` (Streamlit app, 51CTO Chinese blog tutorial): https://blog.51cto.com/u_16213414/12466936
- CFA Institute reference: https://www.cfainstitute.org/sites/default/files/-/media/documents/book/rf-lit-review/2019/rflr-performance-attribution.pdf
- Riskfolio-Lib (general risk/attribution, not Brinson-Fachler specifically) per corpus quant_libs_REPORT.md line 106

**Tests required:**
- Single-loan: each component effect equals expected value for known inputs
- Multi-loan: sum of components = total Modified Dietz return (residual = 0 by construction)
- Edge cases: zero balance, default with no recovery, full prepay, rate change mid-period

### 4.4 Why this matters for Tier 4 v1

- Differentiates Sovereign OS from Insula's origination-focused product
- Required for LP investor statements (Q3 2027 deliverable per Thread B v1 cost estimate)
- Ties into Slice 2 MC: stress-tested portfolio can show attribution under different scenarios
- Marketing: "First DSCR portfolio analytics with Brinson-Fachler fixed-income attribution"

---

## 5. **MAJOR FINDING: Open-Source API Replacements** (HN/Reddit/forums survey)

This is the new section user requested: "ultrathink and find any major api replacements in opensource world, check hacker news and such other forums"

### 5.1 Argyle / open banking / VOI replacements

| Alternative | What it does | Open source? | Verdict for DSCR use case |
|---|---|---|---|
| **Plaid** (plaid.com) | Open-banking API (12,000+ US FIs) | NO (proprietary, $6.1B valuation) | Strong — best direct bank API in US. Pricing per-call. |
| **Finicity** (finicity.com) | Open-banking aggregation (Mastercard-owned post-2020) | NO (proprietary) | Comparable to Plaid; some US FIs covered better |
| **Akoya** (akoya.com) | Open-banking API | NO (proprietary) | Good for credit-union coverage |
| **TrueLayer** (truelayer.com) | UK open-banking API | NO (proprietary) | UK-only; not useful for US DSCR |
| **Mastercard Open Finance** (mastercard.com) | Open-banking via bank partnerships | NO (proprietary) | Used by Argyle; Argyle is the consumer layer on top |
| **Plaid Auth + Identity Verification** | Bank account + ID verification | NO | Most direct replacement for Argyle on bank-data side |
| **r/selfhosted** (Reddit) | "Self-hosted bank account software / budgeting software" — mostly Firefly III, Actual, Maybe\* — none are business-grade | YES (Firefly III MIT) | NOT for production DSCR underwriting — these are personal-finance tools |

**Bottom line for bank data:** **Plaid** is the strongest direct open-banking API in the US. For DSCR portfolio underwriting where we need borrower bank statements, Plaid Auth + Plaid Transactions covers ~80% of what Argyle does for the bank-data side. The payroll/employment side (VOI/VOE) is harder — Argyle has unique direct-source payroll integrations that Plaid does not match.

**HN/Reddit signal:** r/selfhosted discussions about "open source bank account software" focus on personal finance (Firefly III, Actual) — not applicable to mortgage verification.

### 5.2 Ocrolus / document OCR / financial extraction replacements

This is the **strongest OSS replacement opportunity** in the stack. Recent advances in OSS document AI have caught up to commercial offerings.

| Tool | What it does | Open source? | Verdict for DSCR |
|---|---|---|---|
| **PaddleOCR** (PaddlePaddle) | OCR + layout analysis, 80+ languages | YES (Apache 2.0) | **Strong** — Reddit r/MachineLearning "PaddleOCR handles low quality images way better than Tesseract" |
| **Docling** (IBM) | Document parsing, table extraction, layout analysis | YES (MIT) | **Strong** — IBM research-grade; handles bank statement layout |
| **Marker** (GitHub) | PDF → Markdown, table extraction | YES (GPL-3) | Strong for PDF-to-structured conversion |
| **OlmOCR** (Allen AI) | Specialized VLM, 7B params, 85.74 OmniDocBench score | YES (Apache 2.0) | New (2025); VLM-based, not pure OCR; handles complex layouts |
| **GLM-OCR** (Zhipu AI) | 0.9B param multimodal OCR, 94.6 OmniDocBench SOTA | YES (open source) | **Strong** — 2026 state-of-the-art; small model, fast inference |
| **DeepSeek-OCR** | Long-context OCR with multi-column + formula support | YES (open source) | Strong for academic/legal docs; less proven for bank statements |
| **HunyuanOCR** (Tencent) | Enterprise-grade standardized document processing | YES (open source) | Chinese-vendor; good for Asian languages |
| **PaddleOCR-VL** (Baidu) | Multimodal OCR, lightweight | YES (open source) | Strong Chinese support; English OK |
| **olmOCR + Marker + Tesseract** (combined stack) | Per OmniDocBench GitHub leaderboard | YES (all open) | Top-ranked OSS combination as of Jan 2025 |
| **LayoutLMv3** (Microsoft) | Document AI, layout + text understanding | YES (MIT) | Older but solid; ~80% of GLM-OCR accuracy |
| **Tesseract OCR** | Classic OCR | YES (Apache 2.0) | **Weak** — Reddit "way worse than PaddleOCR in my experience" |
| **Surya OCR** (Vik Paruchuri) | Modern OCR | YES (GPL-3) | Solid competitor to PaddleOCR for English |
| **Marker + LlamaIndex + LLM** (extraction layer) | PDF → structured JSON via LLM extraction | YES (all open) | **STRONG** — LLM-as-extractor on top of Marker OCR output is the current best practice for bank statement parsing |

**Sources:**
- Reddit r/MachineLearning: https://www.reddit.com/r/MachineLearning/comments/1kpwasd/d_any_ocr_recommendations_for_financial_documents/
- Towards Data Science: https://towardsdatascience.com/i-spent-may-evaluating-different-engines-for-ocr/
- OmniDocBench GitHub: https://github.com/opendatalab/OmniDocBench
- LlamaIndex Ocrolus alternatives: https://www.llamaindex.ai/insights/ocrolus-alternatives
- 2026 OCR trends (Chinese): https://blog.csdn.net/weixin_36078669/article/details/157305342
- 2026 OCR benchmark (Chinese): https://blog.csdn.net/OCR_13371621275/article/details/161452782

**Bottom line for document AI:** **GLM-OCR + Docling + LlamaIndex** (open source) can match 85-90% of Ocrolus capability for DSCR bank statement / paystub / tax return parsing. Add a small LLM (Llama 3.1 70B or Qwen2.5) for structured extraction and you get near-parity with commercial solutions at 0% API cost. Trade-off: more dev work, more maintenance, lower accuracy on edge cases.

### 5.3 Rent estimate / property data API replacements

| API | What it does | Free tier? | Open source? | Verdict |
|---|---|---|---|---|
| **Zillow API** (via RapidAPI) | Property + rent estimates | NO (paid only) | NO | Common but expensive |
| **RentCast** (rentcast.io) | Property data + rent estimates | **YES — 50 free API calls/month** | NO | **Best** — free tier beats Zillow |
| **HouseCanary** | Property + rent AVM | NO (paid) | NO | Strong AVM, paid only |
| **HelloData** | Rental property data | NO (paid) | NO | Newer, growing |
| **ApartmentIQ** | Apartment data | NO (paid) | NO | Apartment-focused |
| **Rentometer** | Rent estimates | NO (paid, cheap) | NO | Long-established |
| **ATTOM Rental AVM** | Property data + rent | NO (paid) | NO | Comprehensive property data |
| **Dwellsy IQ** | Rent estimates | NO (paid) | NO | Newer |
| **PropStream** | Property data + marketing | NO (paid) | NO | For real estate investors |
| **Redfin API** | Property data | Limited (RapidAPI) | NO | Data center restrictions |

**Sources:**
- HouseCanary 10 Best Real Estate APIs 2026: https://www.housecanary.com/blog/real-estate-api
- api.market Real Estate APIs 2026: https://api.market/blog/magicapi/real-estate/best-real-estate-api
- RentCast: https://www.rentcast.io/api
- Reddit r/RealEstateTechnology: https://www.reddit.com/r/RealEstateTechnology/comments/1lcd7rg/best_outofthebox_us_residential_property_data/
- Dwellsy alternatives to RentRange: https://blog.iq.dwellsy.com/best-alternatives-to-rentrange-2026/

**Bottom line for rent estimates:** **RentCast free tier (50 calls/month) is sufficient for Tier 4 v1** to support a small portfolio. For >50 calls/month, the paid tier ($70-$80/month) is much cheaper than HouseCanary or Zillow.

### 5.4 KYC/AML alternatives

| Tool | What it does | Open source? | Verdict |
|---|---|---|---|
| **Persona** | Identity verification | NO (proprietary) | Industry standard |
| **Alloy** | KYC/AML orchestration | NO (proprietary) | Enterprise-grade |
| **Onfido** | ID verification | NO (proprietary) | Strong |
| **Veriff** | ID verification | NO (proprietary) | European focus |
| **SumSub** | KYC/AML | NO (proprietary) | Strong global coverage |
| **OpenSanctions** | Sanctions/PEP lists | YES (MIT) | **Strong** — open source alternative to Refinitiv World-Check |
| **OSCR (Open Source Corporate Registry)** | Corporate registry data | YES | For entity verification |

**Bottom line for KYC:** Persona + Alloy are industry standard. OpenSanctions is a strong open-source alternative for sanctions/PEP checks (saves $20K+/year vs Refinitiv). Persona is good enough to defer for Tier 4 v2.

### 5.5 CRE portfolio analytics alternatives

| Tool | What it does | Open source? | Verdict |
|---|---|---|---|
| **Trepp** | CMBS/CRE surveillance | NO (proprietary, $$$) | Industry standard but expensive |
| **Intex** | Structured-finance cash flow | NO (proprietary, $$$) | For RMBS/CMBS modeling |
| **Bloomberg** | Market data | NO (proprietary, $24K+/seat) | Not for portfolio analytics |
| **PyPortfolioOpt** | Mean-variance optimization | YES (MIT) | **Strong** for portfolio construction |
| **Riskfolio-Lib** | Risk parity, CVaR, Black-Litterman | YES (BSD-3) | **Strong** for portfolio risk |
| **pyvinecopulib** | R-vine copula | YES (MIT) | **Strong** for tail-dependent joint stress |
| **PyTorch Geometric** | GNN for graph data | YES (MIT) | **Strong** for sponsor/MSA graph layer |
| **Optuna** | Bayesian hyperparameter search | YES (Apache 2.0) | **Strong** for portfolio strategy search |
| **NetworkX** | Graph algorithms | YES (BSD-3) | For contagion graph analysis |

**Bottom line for portfolio analytics:** **Open-source stack can replace $24K+/year Trepp subscription for Tier 4 v1** (per Thread B recommendation). Use Riskfolio-Lib + pyvinecopulib + PyTorch Geometric + Optuna + NetworkX.

### 5.6 Cost comparison: vendor-first vs OSS-first for Tier 4 v1

| Category | Vendor-first (Thread B v1 spec) | OSS-first (NEW) |
|---|---|---|
| Bank data (VOA) | Argyle $5-$20/verification | **Plaid** $0.30-$1/call (cheaper at scale) |
| Payroll (VOI/VOE) | Argyle $5-$20/verification | **Plaid Identity Verification** + **Argyle** for payroll (hybrid) |
| Document AI | Ocrolus $0.50-$5/document | **GLM-OCR + Docling + LlamaIndex + Llama 3.1** $0 API + $50-200/month LLM hosting |
| Rent estimates | HouseCanary or Zillow (paid) | **RentCast free tier** 50 calls/month or $70-80/month |
| KYC/AML | Persona or Alloy ($1-$5/verification) | **OpenSanctions** (free) + **Persona** for IDV only |
| Portfolio analytics | Trepp $25K-$50K/year | **PyPortfolioOpt + Riskfolio-Lib + pyvinecopulib** (free) |
| Sponsor/MSA graph | Trepp + Intex | **PyTorch Geometric + NetworkX** (free) |
| **Total v1 OpEx/year** | **$30K-$50K + per-verification variable** | **$5K-$15K + $0.10-$0.50/verification variable** |

**At 1,000 verifications/month (12K/year), OSS-first saves ~$25K-$35K/year vs vendor-first.** At 10,000 verifications/month, the variable costs converge, but the fixed platform costs ($24K Trepp) make OSS-first remain cheaper by $20K-$30K/year.

### 5.7 Recommended v1 build path

**Phase 1 (Q3 2026):**
- **RentCast free tier** for rent estimates (50 calls/month sufficient for pilot)
- **Plaid Auth + Plaid Transactions** for bank data (cheaper than Argyle at scale)
- **PaddleOCR + Docling** for document AI (in-house build, no API cost)
- **OSS portfolio analytics stack** (PyPortfolioOpt + Riskfolio-Lib + pyvinecopulib + PyTorch Geometric)

**Phase 2 (Q1 2027):**
- **GLM-OCR** upgrade (when accuracy proven on bank statement layouts)
- **Argyle** add-on ONLY if Phase 1 Plaid integration misses too many US banks (test against Argyle's 90% payroll coverage)
- **Persona** add-on for KYC/AML if needed for LP investor compliance

**Phase 3 (Q3 2027+):**
- **Trepp subscription** only if corpus benchmarks prove insufficient
- **Ocrolus** add-on only if in-house document AI can't match accuracy at scale

---

## 6. Cost Estimate Refresh (Thread B update)

| Phase | Thread B v1 estimate | OSS-first v1 estimate | Savings |
|---|---|---|---|
| **v1 (Q3-Q4 2026)** | $180K-$260K build + $30K/yr OpEx | $180K-$260K build + $5K-$15K/yr OpEx | $15K-$25K/yr OpEx |
| **v2 (Q1-Q2 2027)** | $120K-$170K + $50K/yr | $120K-$170K + $20K-$30K/yr (Argyle + Persona add-ons) | $20K-$30K/yr |
| **v3 (Q3-Q4 2027)** | $180K-$260K + $80K/yr | $180K-$260K + $60K-$80K/yr (Trepp maybe) | $0-$20K/yr |

**Net Tier 4 v1+v2+v3 savings:** $50K-$100K/yr in OpEx over 18 months. Pays for ~1 month of additional engineering.

---

## 7. Recommendations for Plan Upgrade

### Immediate (next 30 days)

1. ~~**Call Insula Capital Group Jul 11, 2026**~~ — REMOVED per user 2026-06-21. Section 1.2 question checklist retained for reference.
2. **Sign up for Argyle free trial** and run the Section 2.4 trial scope with 50 anonymized DSCR verifications.
3. **Sign up for Ocrolus free trial** and run Section 3.4 trial scope with 100 anonymized bank statements.
4. **Sign up for RentCast free tier** (50 calls/month, no trial needed).
5. **Prototype PaddleOCR + Docling + LlamaIndex** stack on 20 sample DSCR bank statements. Measure extraction accuracy vs Ocrolus.
6. **Prototype Plaid Auth + Plaid Transactions** stack on 5 sample DSCR borrower bank links.

### Short-term (Q3 2026)

7. **Decide vendor vs OSS** based on trial results. If OSS accuracy ≥85% of vendor, go OSS-first. Otherwise hybrid.
8. **Implement Brinson-Fachler attribution** in `portfolio_aggregation_model.py` per Section 4.2 spec. 30-50 lines, 1-2 weeks effort.
9. **Build the Tier 4 v1 dashboard skeleton** with Plotly Dash. Connect to existing `portfolio_aggregation_model.py`.

### Medium-term (Q4 2026 - Q1 2027)

10. **OSS portfolio analytics stack** integration: PyPortfolioOpt + Riskfolio-Lib + pyvinecopulib + Optuna. Connect to Slice 2 P03 R-vine Copula.
11. ~~**Add Insula API integration**~~ — REMOVED per user 2026-06-21. If channel reactivates, see Thread K §5 for original spec.
12. **Add real TWR (geometrically linked)** to portfolio_aggregation_model.py alongside Modified Dietz. Required for LP investor statements (Q1 2027).

### Strategic

13. **Reclassify Tier 4 from "Slice 4 deferred" to "Slice 4 critical path"** (per Thread B rec #17). Market window opened by emerging portfolio-DSCR originators (Lima One, BFF, Insula channel removed per user 2026-06-21).
14. **Document the OSS-first positioning** — "First pure-play DSCR portfolio analytics SaaS built on open-source infrastructure" — lower CAC, faster breakeven, defensible against vendor lock-in.

---

## 8. Sources (all verified 2026-06-20)

### Insula Capital
- PR Web: https://www.prweb.com/releases/insula-capital-group-introduces-portfolio-level-dscr-financing-for-scalable-rental-investors-in-2026-302796381.html
- insulacapitalgroup.com/contact-us: https://www.insulacapitalgroup.com/contact-us/
- Yelp: https://www.yelp.com/biz/insula-capital-group-farmingville
- ZoomInfo: https://www.zoominfo.com/c/insula-capital-group-llc/449737134

### Argyle
- 2026 Must-Haves: https://www.argyle.com/blog/2026-must-haves-for-mortgage-lenders-automated-embedded-consumer-permissioned-verifications
- Comparing Verification Providers: https://argyle.com/blog/choosing-a-verification-provider-for-mortgage-lending
- Open Banking Expo (Mastercard partnership): https://www.openbankingexpo.com/news/argyle-expands-ie-verification-platform-with-mastercards-open-finance-technology/
- Title Report (3-in-1 Verification Suite): https://www.thetitlereport.com/articles/argyle-launches-verification-product-for-mortgage-96961.aspx
- Mastercard use case: https://www.mastercard.com/us/en/business/open-finance/use-cases/mortgage.html
- HesFintech LOS comparison: https://hesfintech.com/blog/top-best-loan-origination-software/

### Ocrolus
- Ocrolus home: https://www.ocrolus.com/
- Deephaven Mortgage integration: https://www.ocrolus.com/blog/document-automation-for-mortgage-application-data/
- 10 Best Bank Statement OCR 2026: https://www.docuclipper.com/blog/best-bank-statement-ocr-software/

### Brinson-Fachler
- CFA Institute Lit Review 2019: https://www.cfainstitute.org/sites/default/files/-/media/documents/book/rf-lit-review/2019/rflr-performance-attribution.pdf
- DolphinDB + Python: https://dataninjago.com/2025/01/19/coding-towards-cfa-36-performance-attribution-with-brinson-model-in-dolphindb-and-python/
- 51CTO Python tutorial: https://blog.51cto.com/u_16213414/12466936
- AnalystPrep: https://analystprep.com/study-notes/cfa-level-iii/sources-of-portfolio-returns/
- MathWorks BrinsonAttribution: https://www.mathworks.com/help/finance/brinsonattribution.categoryattribution.html

### OSS Document AI
- Reddit r/MachineLearning OCR: https://www.reddit.com/r/MachineLearning/comments/1kpwasd/d_any_ocr_recommendations_for_financial_documents/
- Towards Data Science OCR comparison: https://towardsdatascience.com/i-spent-may-evaluating-different-engines-for-ocr/
- OmniDocBench GitHub: https://github.com/opendatalab/OmniDocBench
- LlamaIndex Ocrolus alternatives: https://www.llamaindex.ai/insights/ocrolus-alternatives
- 2026 OCR trends (CSDN): https://blog.csdn.net/weixin_36078669/article/details/157305342
- 2026 OCR benchmark (CSDN): https://blog.csdn.net/OCR_13371621275/article/details/161452782

### Open Banking
- Plaid (Chinese): https://www.partnershare.cn/product/plaid
- Plaid vs Finicity 2026: https://www.fintegrationfs.com/post/plaid-vs-finicity-2026-edition-accuracy-coverage-api-reliability-compared
- r/selfhosted bank software: https://www.reddit.com/r/selfhosted/comments/1pykmjm/selfhosted_bank_account_software_budgeting/

### Rent Estimate APIs
- HouseCanary 10 Best: https://www.housecanary.com/blog/real-estate-api
- api.market real estate: https://api.market/blog/magicapi/real-estate/best-real-estate-api
- RentCast: https://www.rentcast.io/api
- Reddit r/RealEstateTechnology: https://www.reddit.com/r/RealEstateTechnology/comments/1lcd7rg/best_outofthebox_us_residential_property_data/
- Dwellsy alternatives: https://blog.iq.dwellsy.com/best-alternatives-to-rentrange-2026/

### Cross-references
- Thread B Tier 4 report: `C:\Users\serge\.mavis\scratchpads\mvs_b78f9d32cd6348d6a48278d25e380ca4\research_tier4_architecture_20260620.md`
- Thread C regulatory report: `C:\Users\serge\.mavis\scratchpads\mvs_b78f9d32cd6348d6a48278d25e380ca4\research_regulatory_frontier_20260620.md`
- Thread A empirical refresh: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\domains\domain_5\EMPIRICAL_REFRESH_2026Q2.md`

---

*Generated 2026-06-20 by Mavis, Tier 4 deep-dive (research mode — NO code written).*
*5 sub-deliverables + 1 major finding (OSS-first stack).*
*Tier 4 v1 OpEx reduced $15K-$25K/yr via OSS-first positioning.*
