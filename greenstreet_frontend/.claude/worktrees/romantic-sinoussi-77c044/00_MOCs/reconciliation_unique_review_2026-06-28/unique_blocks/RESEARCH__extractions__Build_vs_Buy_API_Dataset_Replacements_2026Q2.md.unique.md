# Unique Content Review

- Source path: RESEARCH/extractions/Build_vs_Buy_API_Dataset_Replacements_2026Q2.md
- Archived path: 99_attachments/research_archive_2026-06-28/p19_superseded_extraction_aliases_2026-06-28/RESEARCH/extractions/Build_vs_Buy_API_Dataset_Replacements_2026Q2.md
- Replacement path: RESEARCH/extractions/Build_vs_Buy_API_Dataset_Replacements_v2_2026Q2.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0
- Unique words: 3917
- Preliminary classification: RESTORE_COPY_FOR_REVIEW_SUBSTANTIVE_UNIQUE
- Review copy: 00_MOCs\reconciliation_unique_review_2026-06-28\restored_for_review\RESEARCH\extractions\Build_vs_Buy_API_Dataset_Replacements_2026Q2.md

## Unique Headings
- # Build vs Buy: Paid API + Dataset Replacements for DSCR Sovereign OS (2026 Q2)
- ## 1. Paid APIs — Build-vs-Buy Analysis
- ### 1.1 Open Banking / Bank Data / Payroll (Argyle vs Plaid)
- ### 1.2 Document AI / OCR (Ocrolus vs OSS)
- ### 1.3 Credit Bureaus (Equifax, Experian, TransUnion)
- ### 1.4 Property Data / AVM (ATTOM, CoreLogic, Zillow, HouseCanary)
- ### 1.5 CRE / Portfolio Analytics (Trepp, Intex, Bloomberg, KBRA, CoStar)
- ### 1.6 KYC/AML (Persona, Alloy, Veriff)
- ### 1.7 Fraud Data (Cotality, Point Predictive, LexisNexis RiskView)
- ### 1.8 STR Data (AirDNA, Mashvisor, Key Data, AllTheRooms)
- ### 1.9 Bloomberg Terminal Alternative (OpenBB, FinceptTerminal, Yahoo Finance)
- ### 1.10 Adverse Action / Public Records (LexisNexis, Verisk)
- ### 1.11 NCREIF NPI (Commercial Real Estate Returns)
- ### 1.12 Prepayment Curves (eMBS, Bloomberg, YieldBook)
- ### 1.13 FRED (Federal Reserve Economic Data)
- ### 1.14 Background Checks (Checkr, Sterling)
- ## 2. Free / OSS Datasets — Comprehensive List
- ### 2.1 Mortgage Performance Data (FREE)
- ### 2.2 Property Data (FREE)
- ### 2.3 Public Records (FREE)
- ### 2.4 Sanctions / KYC / PEP (FREE)
- ### 2.5 Economic / Macro Data (FREE)
- ### 2.6 STR / Vacation Rental Data (FREE tier available)
- ### 2.7 Compliance / Regulatory (FREE)
- ### 2.8 REITs / Public Real Estate (FREE)
- ### 2.9 Geospatial / Mapping (FREE)
- ### 2.10 AI / ML Models (FREE for self-hosting)
- ### 2.11 LLM-as-a-Service APIs (Free tier available)
- ### 2.12 Open-Source Portfolio Analytics (FREE)
- ## 3. Cost Comparison: Vendor-first vs OSS-first (v1 OpEx)
- ### 3.1 Year 1 (v1, Q3-Q4 2026)
- ### 3.2 Year 2 (v2, Q1-Q2 2027)
- ### 3.3 Year 3 (v3, Q3-Q4 2027+)
- ### 3.4 Total savings (3-year horizon)
- ## 4. Recommendations for Plan Upgrade
- ### Immediate (next 30 days)
- ### Short-term (Q3 2026, blocks Tier 4 v1)
- ### Medium-term (Q4 2026 - Q1 2027, blocks Tier 4 v2)
- ### Long-term (Q3 2027+, blocks Tier 4 v3 + Slice 5)
- ### Strategic

## First Unique Blocks

### Block 1
```text
--- type: research slice: 4 status: draft confidence: 4 title: "Major Thread — Build vs Buy: Paid API + Dataset Replacements for DSCR Sovereign OS (2026 Q2)" summary: "MAJOR new thread: comprehensive survey of paid APIs + datasets in the DSCR Sovereign OS stack with verified OSS/free alternatives. Covers 14 paid API categories (open banking, document AI, credit bureaus, property data, CRE analytics, KYC/AML, fraud, STR, Bloomberg alternative, sanctions, background checks, free rent, free mortgage data, free economic data) + 12 free dataset sources (FRED, HMDA, Fannie/Freddie loan performance, Ginnie Mae, Overture Maps, OSM, OpenAddresses, OpenSanctions, SEC EDGAR, Wikidata, CFPB Consumer Complaint, HUD FMR). **Net financial impact: $50K-$200K/year potential savings by replacing paid APIs with OSS-first stack where accuracy is acceptable, while keeping credit bureau data ($) and regulatory data (free) as-is.**" entities: - concept/dscr - concept/build-vs-buy - data/airbnb - data/attom - data/corelogic - data/equifax - data/fred - data/freddie-mac - data/hmda - data/hud - data/overture-maps - data/zillow - lender/non-qm-aggregate - slice/4 - topic/credit-bureau - topic/dataset - topi ... [truncated]
```

### Block 2
```text
# Build vs Buy: Paid API + Dataset Replacements for DSCR Sovereign OS (2026 Q2)
```

### Block 3
```text
**Date:** 2026-06-20 **Owner:** Mavis (major new research thread per user directive) **Method:** HN/Reddit/forums + GitHub + vendor docs survey. Primary-source verified. **Scope:** 14 paid API categories + 12 free/OSS dataset sources. ZERO code. Research artifact. **Strategic question:** What is the **MINIMUM** the DSCR Sovereign OS must pay for, and what can be replaced with OSS / free public data?
```

### Block 4
```text
| # | What we currently pay for | Annual cost (rough) | OSS/free alternative | Quality delta | Save? | |---|---|---|---|---|---| | 1 | **Open banking (Argyle + Plaid)** | $5K-$50K/yr | **Plaid** (proprietary but cheaper), **TrueLayer** (UK), or **Plaid Identity Verification** | 80% of Argyle payroll coverage | **YES, partial** | | 2 | **Document AI (Ocrolus)** | $5K-$20K/yr | **PaddleOCR + Docling + LlamaIndex** + Llama 3.1 70B | 85-90% accuracy | **YES** | | 3 | **Credit bureaus (Equifax/Experian/TransUnion)** | $5K-$50K/yr per bureau | **NO real alternative** — bureaus are unavoidable | 100% (no substitute) | **NO** | | 4 | **Property data (ATTOM/CoreLogic)** | $10K-$100K/yr | **Overture Maps + OSM + OpenAddresses** (basic) + **RentCast** (rent) | 50% (basic only) | **PARTIAL** | | 5 | **CRE analytics (Trepp/Intex/Bloomberg)** | $25K-$100K/yr | **NCREIF (paid but cheaper)** + **PyPortfolioOpt + Riskfolio-Lib + pyvinecopulib** | 60% (sufficient for v1) | **YES** | | 6 | **KYC/AML (Persona/Alloy)** | $5K-$20K/yr | **OpenSanctions** (sanctions/PEP only) + DIY | 30% (sanctions only) | **PARTIAL** | | 7 | **Fraud (Cotality)** | $5K-$25K/yr | **NO real alternative** — proprietary data  ... [truncated]
```

### Block 5
```text
**NET FINANCIAL IMPACT (annual OpEx savings):**
```

### Block 6
```text
| Scenario | v1 (Q3 2026) | v2 (Q1 2027) | v3 (Q3 2027+) | |---|---|---|---| | **Vendor-first** (status quo) | $80K-$200K/yr | $120K-$300K/yr | $200K-$500K/yr | | **OSS-first** (recommended) | **$30K-$60K/yr** | **$50K-$120K/yr** | **$80K-$180K/yr** | | **Savings** | **$50K-$140K/yr** | **$70K-$180K/yr** | **$120K-$320K/yr** |
```

### Block 7
```text
**Bottom line:** Switching from vendor-first to OSS-first stack saves **$50K-$320K/year** depending on portfolio volume. The only paid services that are truly unavoidable are **credit bureau data** (regulatory requirement) and **Cotality-style fraud data** (proprietary). Everything else has a viable OSS or free-tier alternative.
```

### Block 8
```text
## 1. Paid APIs — Build-vs-Buy Analysis
```

### Block 9
```text
### 1.1 Open Banking / Bank Data / Payroll (Argyle vs Plaid)
```

### Block 10
```text
| Vendor | Coverage | Pricing | Verdict | |---|---|---|---| | **Argyle** | 90% of US workforce payroll (direct) | $5-$20/verification | Best direct-source payroll coverage | | **Plaid Auth + Transactions** | 12,000+ US FIs | $0.30-$1/call | Best US bank API, no payroll | | **Finicity** (Mastercard) | Most US FIs | Comparable to Plaid | Plaid competitor | | **Akoya** | Strong credit-union coverage | Subscription | Best for credit unions | | **Mastercard Open Finance** | Bank partnerships | Via Argyle | Argyle consumes this | | **TrueLayer** (UK) | UK banks | Per-call | **US NOT supported** |
```

### Block 11
```text
**Recommended stack (v1):** - **Plaid Auth + Plaid Transactions** for US bank data (cheaper than Argyle at scale) - **Argyle** ONLY for direct-source payroll if needed (hybrid) - **Skip Plaid Identity Verification** until v2
```

### Block 12
```text
**Net savings:** ~$15K-$30K/yr (50% cost reduction)
```

### Block 13
```text
### 1.2 Document AI / OCR (Ocrolus vs OSS)
```

### Block 14
```text
| Vendor | Tool | Open source? | Accuracy | Verdict | |---|---|---|---|---| | **Ocrolus** | Document AI (bank statements, paystubs) | NO | Industry-leading | $0.50-$5/document | | **ABBYY FlexiCapture** | Enterprise OCR | NO | Top accuracy | Enterprise-grade, expensive | | **Rossum** | Cloud document AI | NO | Strong | EU-based | | **PaddleOCR** | OCR + layout | YES (Apache 2.0) | 85-90% | **Strong** — Reddit r/MachineLearning "way better than Tesseract" | | **Docling** (IBM) | Document parsing | YES (MIT) | 90% (bank statements) | **Strong** for bank statement layout | | **Marker** | PDF → Markdown | YES (GPL-3) | 90% | Strong for PDF-to-structured | | **OlmOCR** (Allen AI) | Specialized VLM | YES (Apache 2.0) | 85.74 OmniDocBench | New (2025) | | **GLM-OCR** (Zhipu AI) | 0.9B multimodal OCR | YES (open) | **94.6 OmniDocBench SOTA** | **2026 state-of-the-art** | | **DeepSeek-OCR** | Long-context OCR | YES (open) | Strong for academic | Less proven for bank statements | | **LayoutLMv3** (Microsoft) | Document AI | YES (MIT) | 80% | Older but solid | | **Tesseract** | Classic OCR | YES (Apache 2.0) | 60-70% | **WEAK** — avoid for financial docs | | **Marker + LlamaIndex + LLM extrac ... [truncated]
```

### Block 15
```text
**Recommended stack (v1):** - **GLM-OCR + Docling** for layout + OCR - **LlamaIndex + Llama 3.1 70B** for structured extraction (or **Qwen2.5 72B** for cheaper) - Local LLM hosting: $50-$200/month (single A100 or H100) - Defer Argyle/Ocrolus to v2 until volume justifies
```

### Block 16
```text
**Net savings:** ~$10K-$30K/yr (90% cost reduction)
```

### Block 17
```text
### 1.3 Credit Bureaus (Equifax, Experian, TransUnion)
```

### Block 18
```text
**No real OSS alternative.** Credit bureau data is sold by 3 nationwide CRAs (Equifax, Experian, TransUnion) plus Innovis (smaller). The CFPB maintains a list at https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/
```

### Block 19
```text
**Alternatives for SOFT inquiries only:** - **AnnualCreditReport.com** — free consumer reports (not useful for underwriting) - **Experian Boost** — free FICO score improvement (not useful) - **Self Inc.** — free credit building (not useful)
```

### Block 20
```text
**For DSCR underwriting:** Must pay Equifax/Experian/TransUnion. Typical pricing: - Soft pull: $0.50-$2 per inquiry - Hard pull: $3-$10 per inquiry - Tri-merge (3-bureau): $10-$30 per inquiry - Full file: $20-$50 per inquiry
```

### Block 21
```text
**Recommended approach:** - Use **single-bureau FICO** (cheapest) for DSCR since business-purpose loans don't require FCRA-compliant adverse action - Use **tri-merge only** for consumer-purpose exception cases - Negotiate volume pricing at >5K pulls/month
```

### Block 22
```text
**Net savings:** Minimal — credit bureau is unavoidable.
```

### Block 23
```text
### 1.4 Property Data / AVM (ATTOM, CoreLogic, Zillow, HouseCanary)
```

### Block 24
```text
| Vendor | Coverage | Pricing | Open source? | Verdict | |---|---|---|---|---| | **ATTOM Data Solutions** | 155M US properties | $50-$500/month | NO | Industry standard for ownership/tax | | **CoreLogic** | 5.5B records | Enterprise pricing ($$$) | NO | Mortgage/risk data leader | | **CoStar** | Commercial real estate | $5K-$30K/year | NO | Best for commercial, expensive | | **Zillow API** (RapidAPI) | US residential | $0.10-$1/call | NO | Common but expensive | | **HouseCanary** | AVM | $0.50-$5/call | NO | Strong AVM | | **RentCast** | US residential + rent | **50 free calls/month** | NO | **Best for v1** — free tier sufficient | | **Rentometer** | Rent estimates | $20-$100/month | NO | Cheaper for rent-only | | **Overture Maps** | 64M+ POIs + boundaries | Free tier | YES (CDLA-2.0) | **Strong for boundaries + POIs** | | **OpenStreetMap** | Global map data | Free | YES (ODbL) | **Strong for base map** | | **OpenAddresses** | 800M+ US addresses | Free | YES (various) | **Strong for geocoding** |
```

### Block 25
```text
**Recommended stack (v1):** - **Overture Maps** (CDLA-2.0) for boundaries + POIs (free) - **OSM** for base map data (free) - **OpenAddresses** for US address geocoding (free) - **RentCast free tier** for rent estimates (50 calls/month) - **Defer ATTOM/CoreLogic** to v2 unless specific ownership/tax data needed
```

### Block 26
```text
**Net savings:** ~$10K-$50K/yr (70-90% cost reduction for property data)
```

### Block 27
```text
### 1.5 CRE / Portfolio Analytics (Trepp, Intex, Bloomberg, KBRA, CoStar)
```

### Block 28
```text
| Vendor | What it does | Pricing | Open source alternative? | Verdict | |---|---|---|---|---| | **Trepp** | CRE/CMBS surveillance | $25K-$50K/year | **PyPortfolioOpt + Riskfolio-Lib** | Strong for v1; corpus already has benchmarks | | **Intex Solutions** | Structured-finance cash flow | $30K-$75K/year | **QuantLib + QuantLib-SWIG** | Strong for RMBS modeling | | **Bloomberg Terminal** | Market data | $24K-$32K/seat | **OpenBB + FinceptTerminal** | Strong for financial data; weak for IB chat | | **KBRA KFI / DIFA** | CRE surveillance | Subscription | None direct | Industry standard | | **CoStar** | Commercial real estate | $5K-$30K/year | **OSM + Overture Maps + state SOS data** | Sufficient for v1 | | **NCREIF NPI** | Quarterly CRE returns | $5K-$10K/year | **REIT.com (free)** + FTSE Nareit (free summary) | 40% (public REIT only) | | **LSTA** | Trade association | Membership | Public standards | Free for standards |
```

### Block 29
```text
**Recommended stack (v1):** - **PyPortfolioOpt + Riskfolio-Lib + pyvinecopulib** (already in Slice 2) for portfolio analytics - **NCREIF NPI** (paid but cheap) or **FTSE Nareit (free)** for benchmark - **OSM + Overture + state SOS** for property data - **Defer Trepp/Intex/Bloomberg** to v3 (Q3 2027+) unless corpus benchmarks prove insufficient
```

### Block 30
```text
**Net savings:** ~$50K-$100K/yr (defer Trepp/Intex/Bloomberg)
```
