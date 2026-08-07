---
type: research
status: drafted
confidence: 3
title: "Deep Research Report: Critical Areas for the 20X DSCR Deal Engine"
summary: "This report synthesizes deep research conducted across four critical domains: Technical Infrastructure, Market Intelligence, Compliance and Regulatory Gating, and Product Strategy & Unit Economics. The objective was to gather concrete data and insights necessary to transition the 20X DSCR Deal Engine from a theoretical framework into a live, institutional-grade execution platform. Key findings highlight the necessity of advanced AI-driven OCR for document processing, real-time market data API..."
entities:
  - concept/cap-rate
  - concept/cltv
  - concept/dscr
  - concept/ltv
  - data/cotality
  - data/fannie-mae
  - data/fred
  - data/freddie-mac
  - data/zillow
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/rocket-pro
  - lender/verus
  - lender/visio-lending
  - state/ak
  - state/al
  - state/il
  - state/ks
  - state/mn
  - state/oh
  - state/pa
  - tax/pal
  - topic/condo
  - topic/multifamily
  - topic/non-qm
  - topic/str
tags:
  - topic/compliance
  - topic/default-rate
  - topic/llpa
  - topic/monte-carlo
  - topic/portfolio
  - topic/ppp
  - topic/stress-test
  - topic/tax
source: Deep Research Report_ Critical Areas for the 20X DSCR Deal Engine.md
vaulted_at: 2026-06-20
---
# Deep Research Report: Critical Areas for the 20X DSCR Deal Engine

## Executive Summary

This report synthesizes deep research conducted across four critical domains: Technical Infrastructure, Market Intelligence, Compliance and Regulatory Gating, and Product Strategy & Unit Economics. The objective was to gather concrete data and insights necessary to transition the 20X DSCR Deal Engine from a theoretical framework into a live, institutional-grade execution platform. Key findings highlight the necessity of advanced AI-driven OCR for document processing, real-time market data API integrations, robust Monte Carlo simulation parameter calibration, dynamic lender matrix maintenance, state-aware regulatory compliance for prepayment penalties and Short-Term Rental (STR) ordinances, and a data-driven approach to unit economics and product lifecycle management.


## 1. Technical Infrastructure: AI OCR, APIs, and Monte Carlo Simulation

### 1.1 AI OCR & Financial Document Processing

The integration of Artificial Intelligence (AI) and Optical Character Recognition (OCR) is paramount for automating the extraction of critical financial data from diverse mortgage and lease documents. Modern solutions leverage **Agentic OCR** and **Layout-aware parsing** to overcome the limitations of traditional OCR, significantly enhancing accuracy and efficiency [1].

Leading platforms in this domain include:

*   **Ocrolus:** This platform is specifically designed for mortgage and lending workflows, combining AI-driven extraction with human-in-the-loop verification. It supports over 2,000 document types, offers GSE-approved income analysis (qualifying for Fannie Mae reps and warranties relief), and integrates directly with Loan Origination Systems (LOS) like Encompass. Ocrolus also boasts data accuracy insured by Lloyd’s of London [2].
*   **Docsumo:** An enterprise AI document workflow platform that manages the entire pipeline from data extraction to validation for high-volume lending operations [3].
*   **Blueprint (IncomeXpert):** Utilizes dual-scan mortgage OCR technology to extract complex income information from multi-page documents [4].
*   **Extend AI:** Employs Vision Language Model (VLM)-based correction systems to improve OCR accuracy on challenging documents [5].

For the 20X DSCR Deal Engine, integrating a solution like Ocrolus via API would establish a robust "Document Understanding" layer, enabling automated verification of lease contracts and Short-Term Rental (STR) platform screenshots.

### 1.2 Market Data APIs & Integration

Access to real-time market data is crucial for dynamic DSCR calculations and accurate risk assessment. Key API sources and data integration strategies include:

*   **FRED API (Federal Reserve Economic Data):** This serves as the authoritative source for historical and current interest rates (e.g., 10-Year Treasury, 30-Year Mortgage rates), which are essential inputs for the Monte Carlo Risk Engine and for conducting rate-shock stress tests [6].
*   **Fannie Mae & Freddie Mac APIs:** While primarily for conventional loans, these APIs offer valuable benchmarks for market-floor pricing and can inform the 20X Engine's pricing models [7].
*   **Zillow Group Data & APIs:** Provides access to public records (parcel, assessment, transactional data via the Bridge Public Records API) and Real Estate Metrics, including median rents and home values. These data points are available for download or through specific research portals [8].
*   **Commercial Data Providers:** Companies like Attom Data and CoreLogic offer more granular property-level data, including historical sales and rental comparables, which are vital for the Bisection Solver for Maximum Purchase Price [9].

The 20X Engine should implement a **Data Normalization Layer** to seamlessly ingest feeds from FRED and Zillow/Attom, allowing the Iterative Rate-DSCR Solver to utilize live market benchmarks rather than static inputs.

### 1.3 Monte Carlo Simulation Parameters & Correlations

The Monte Carlo Risk Engine (Module 7) relies on empirically validated parameters and correlations for accurate real estate debt risk assessment. Research provides the following benchmarks for simulation calibration:

#### Core Variable Distributions:

*   **Rental Income Volatility:** The standard deviation of rental returns typically ranges from **7% to 13%**, varying by property type and market. Multifamily assets generally exhibit lower volatility (e.g., 9.15% to 9.66%), while STRs may show higher fluctuations [10] [11].
*   **Cap Rate & Interest Rate Correlation:** Historical data consistently shows a **strong positive correlation** (0.5 to 0.7) between mortgage rates and capitalization rates [12] [13].
*   **Rent & Vacancy Correlation:** A **strong negative correlation** exists between rents and vacancy rates; as vacancies increase, rents typically decline [14].
*   **Rent & Interest Rate Correlation:** A moderate positive correlation (around 0.5) is often observed, as inflationary pressures tend to drive both higher interest rates and increased nominal rents [14].

#### Simulation Specifications:

*   **Iterations:** **10,000 iterations** is the industry standard for achieving stable probability distributions for outcomes such as default risk and Net Present Value (NPV)/Internal Rate of Return (IRR) [15] [16].
*   **Convergence:** For mortgage default risk, Bayesian state-space models often employ 10,000 iterations with a burn-in period to ensure the accuracy of estimated month-to-month default probabilities [17].

#### Risk Metrics for DSCR:

*   **P10 / P50 / P90 DSCR:** These distributions are crucial for identifying the "Value at Risk" (VaR) for a deal, quantifying the probability that the DSCR will fall below 1.00x under adverse conditions.
*   **Sharpe Ratio:** For DSCR portfolios, a Sharpe ratio exceeding 1.0 is a target benchmark, indicating superior risk-adjusted returns [18].

## 2. Market Intelligence: Lender Matrix and Second Liens

### 2.1 Updated Lender Matrix: Rocket Pro TPO

Rocket Pro TPO (Third Party Origination) significantly impacted the broker channel with the launch of its DSCR product in late 2025 [19].

#### Rocket Pro DSCR Program Details (June 2026):

*   **Minimum DSCR:** 1.00x, qualifying based on the property's cash flow meeting or exceeding monthly housing expenses [20].
*   **Property Types:** Available for 1–4 unit investment properties [21].
*   **Focus:** Emphasizes speed and pricing transparency for brokers, aiming to simplify complex "spec menus" [22].
*   **Incentives:** Offers loan-level price adjustment (LLPA) credits (e.g., 40 basis points) when combined with other Rocket services [23].
*   **Underwriting:** Features simplified qualification without personal income or Debt-to-Income (DTI) ratio requirements [20].

### 2.2 DSCR Second Lien Market Analysis

The DSCR second-lien market has evolved, with prominent lenders like Angel Oak and Deephaven offering standardized products for equity extraction without necessitating the refinancing of existing first mortgages [24] [25].

#### Angel Oak: DSCR Closed-End Second Lien

*   **Loan Amounts:** Ranges from $100,000 to $350,000 [24].
*   **Minimum FICO:** 700 for up to 70% Combined Loan-to-Value (CLTV); 720 for a maximum of 75% CLTV [24].
*   **Maximum CLTV:** 75% [24].
*   **Minimum DSCR:** 1.20x [24].
*   **Experience Requirement:** Borrowers must demonstrate at least two years of experience managing income-producing investment properties [24].
*   **Eligible Properties:** Exclusively for long-term rental investment properties; only warrantable condos qualify [24].
*   **Terms:** 20-year fixed term with a lump-sum payment [24].

#### Deephaven: Wholesale DSCR Second

*   **Maximum Loan Amount:** Up to $500,000 [25].
*   **Qualification:** Based solely on the subject property's cash flow, eliminating the need for traditional income or employment verification [25].
*   **ITIN Eligibility:** Deephaven is notable for allowing Individual Taxpayer Identification Number (ITIN) borrowers for select products, with a minimum FICO of 680 and up to 80% LTV on certain Non-Prime programs. However, DSCR-specific ITIN second-lien limits are generally more conservative (around 70-75% LTV) [26] [27].

#### Competitive Landscape Summary:

| Feature | Angel Oak | Deephaven |
|:---|:---|:---|
| Max Loan Amount | $350,000 | $500,000 |
| Min FICO | 700 | 680 (ITIN) / 700 (Standard) |
| Max CLTV | 75% | 75% |
| Min DSCR | 1.20x | 1.00x - 1.15x (Product dependent) |
| Property Type | Long-term only | Long-term (STR varies by overlay) |
| Experience Req | 2 Years | Not strictly required for all tiers |

This research confirms that **CLTV (Combined Loan-to-Value)** is a primary risk determinant for second liens, with a strict cap at 75% across market leaders [24] [25].

## 3. Compliance and Regulatory Gating: Prepayment Penalties and STR Legality

### 3.1 State-Specific Prepayment Penalty (PPP) Restrictions

Research into state-level Prepayment Penalty (PPP) laws for 2026 reveals a complex and dynamic regulatory landscape that directly influences DSCR loan structuring. These regulations often vary based on loan amount, property type, and borrower entity.

#### Key State Prohibitions & Thresholds (2026):

*   **Pennsylvania (Act 6 LIPL):** Residential mortgages are subject to the Loan Interest and Protection Law (LIPL). For 2026, the threshold for PPP protection is approximately **$329,411**. Loans with a principal amount below this figure are generally prohibited from having prepayment penalties [28] [29].
*   **Ohio (ORC §1343.011):** Effective January 1, 2026, prepayment penalties are prohibited on residential mortgage loans with a principal amount less than **$116,356** [30].
*   **Minnesota (§58.137):** Minnesota statutes severely restrict or prohibit residential mortgage originators from charging excess fees or penalties. This often extends to PPPs on 1–4 unit investment properties, depending on whether the borrower is an individual or an LLC [31] [32].
*   **Kansas:** Legislative proposals in January 2026 indicate a potential shift towards *allowing* prepayment penalties for real estate investment loans, reversing previous restrictions. This underscores the necessity for continuous legislative monitoring [33].
*   **Dodd-Frank Act:** For "qualified mortgages," the Dodd-Frank Act caps PPPs at 2% in the first two years and 1% in the third year. While DSCR loans are often classified as "Non-QM," many lenders adopt these caps as a best practice to avoid triggering "high-cost loan" regulations [34].

#### General Prohibitions:

Eleven states generally prohibit or severely restrict PPPs on residential first mortgages, including **Alabama, Alaska, and Illinois** (the latter applies if the interest rate exceeds 8%) [35].

### 3.2 STR Regulatory Gating & Market Updates

Short-term rental (STR) legality is a critical gating factor for the 20X Engine, directly impacting income qualification and property eligibility.

#### Los Angeles (2026 Update):

*   **Home-Sharing Ordinance:** The City of Los Angeles continues to enforce stringent registration requirements for STRs. The existing ordinance primarily permits "Home-Sharing" (renting out a portion of one's primary residence) [36].
*   **2028 Olympics Policy Shift:** In anticipation of the 2028 Olympic Games, the city is actively reviewing its STR policies. This review aims to balance housing availability for residents with the anticipated influx of visitors. "Vacation Rental" (renting out a non-primary residence) remains highly restricted or prohibited in most residential zones [36].
*   **Enforcement:** The city employs an automated monitoring system to identify and flag unregistered STR listings. Consequently, lenders are increasingly requiring proof of a valid STR registration number before considering STR income for loan qualification [36].

#### Implementation for 20X Engine:

The 20X Engine must incorporate a **State-Level PPP Validator** that cross-references the loan amount and property state against current PPP thresholds and prohibitions. For STRs, a **Registration Gating Workflow** is essential to confirm that the subject property possesses (or can obtain) a valid municipal permit before any STR-specific income is factored into the underwriting process.

## 4. Product Strategy & Unit Economics

### 4.1 Unit Economics of DSCR Lending (2026)

Analysis of the 2026 mortgage market provides key benchmarks for DSCR loan origination and unit economics, crucial for optimizing the business model of the 20X DSCR Deal Engine.

#### Acquisition & Conversion Metrics:

*   **Cost Per Lead (CPL):** DSCR leads typically range from **$15 to $60**. Higher-intent leads (e.g., from Google Ads) are at the upper end ($40–$60), while aged or social media leads are generally less expensive [37].
*   **Cost Per Funded Loan (CPFL):** The average cost to acquire a funded DSCR loan varies significantly by lead source:
    *   **Fresh Shared Leads:** $400 – $1,200 [38].
    *   **Exclusive Leads:** $500 – $3,000 [38].
*   **Conversion Rate:** The industry average from lead to funded loan is approximately **3% to 5%**, influenced by the efficiency of broker pre-vetting processes [37].

#### Revenue & Profitability:

*   **Broker Compensation:** Typically ranges from **1.00% to 2.00%** of the loan amount, encompassing origination fees and Yield Spread Premium (YSP)/Service Release Premium (SRP) [39].
*   **Average Loan Size:** Based on Griffin Funding data from May 2026, the average DSCR loan amount is approximately **$335,000** [40].
*   **Gross Revenue per Loan:** This translates to an estimated gross revenue of ~$3,350 to $6,700 per funded deal.
*   **Operational Efficiency:** The Non-QM market, including DSCR loans, is becoming more complex, requiring brokers to spend more time pre-vetting scenarios. Platforms like the 20X Engine, which automate lender matching and qualification, can significantly reduce the operational cost per loan, improving overall profitability [41].

### 4.2 Market Demand & Product Lifecycle

#### Refi & Seasoning Tracker:

*   **Bridge-to-DSCR Demand:** A significant market exists for "Bridge-to-DSCR" refinancing in 2026. Investors are actively converting high-interest hard money loans (8%–14% rates) into more favorable DSCR products (6%–8% rates) after typical seasoning periods of 6–24 months [42].
*   **Seasoning Requirements:** Standard seasoning periods for cash-out refinances are generally **6 to 12 months**. A "Seasoning Tracker" directly addresses a critical need for investors managing multiple bridge loans and investment properties [42].
*   **Investor Sentiment:** While investor confidence experienced a downturn in 2025, Q1 2026 indicates a market "reset" with stabilizing interest rates. Non-QM originations are projected to reach **10% of total mortgage originations** by the end of 2026, highlighting a growing market segment [43] [44].

#### Strategic Implementation for 20X Engine:

The **Refi & Seasoning Tracker** should be prioritized as a "retention engine." By proactively monitoring seasoning clocks and market rate fluctuations, the platform can generate automated refinance alerts. This strategy aims to secure repeat business and enhance the Customer Lifetime Value (CLTV) by providing timely and valuable services to borrowers [42].

## References

[1] Extend AI. (2026, January 4). *Real Estate Document Processing Tools*. Retrieved from [https://www.extend.ai/resources/real-estate-document-processing-platforms](https://www.extend.ai/resources/real-estate-document-processing-platforms)

[2] Ocrolus. (n.d.). *Ocrolus Mortgage | AI Workflow Automation for Mortgage Lenders*. Retrieved from [https://www.ocrolus.com/mortgage/](https://www.ocrolus.com/mortgage/)

[3] Docsumo. (2026, March 15). *What is the Best Mortgage Document Automation Software*. Retrieved from [https://www.docsumo.com/blog/best-mortgage-document-automation-software](https://www.docsumo.com/blog/best-mortgage-document-automation-software)

[4] Blueprint. (n.d.). *Income Document Automation for Mortgage - Blueprint - IncomeXpert*. Retrieved from [https://getblueprint.io/mortgage-document-automation/](https://getblueprint.io/mortgage-document-automation/)

[5] Extend AI. (2026, January 4). *Real Estate Document Processing Tools*. Retrieved from [https://www.extend.ai/resources/real-estate-document-processing-platforms](https://www.extend.ai/resources/real-estate-document-processing-platforms)

[6] Fannie Mae. (n.d.). *Mortgage Loan Pricing and Committing APIs*. Retrieved from [https://singlefamily.fanniemae.com/applications-technology/application-programming-interfaces-apis/loan-pricing-committing-api](https://singlefamily.fanniemae.com/applications-technology/application-programming-interfaces-apis/loan-pricing-committing-api)

[7] Freddie Mac. (n.d.). *Pricing and Committing Loans through APIs*. Retrieved from [https://sf.freddiemac.com/working-with-us/secondary-market-advisors/api-integration](https://sf.freddiemac.com/working-with-us/secondary-market-advisors/api-integration)

[8] Zillow Group. (n.d.). *Public Data Archives - Data & APIs*. Retrieved from [https://www.zillowgroup.com/developers/public-data/](https://www.zillowgroup.com/developers/public-data/)

[9] CoreCast. (2026, March 6). *Monte Carlo Simulation for CRE Investments*. Retrieved from [https://www.corecastre.com/corecast-blog/monte-carlo-simulation-for-cre-investments](https://www.corecastre.com/corecast-blog/monte-carlo-simulation-for-cre-investments)

[10] Nareit. (n.d.). *This paper examines public and private real estate returns ...*. Retrieved from [https://www.reit.com/sites/default/files/media/PDFs/Returns%20Volatility%20and%20Information%20Transmission%20Dynamics_001.pdf](https://www.reit.com/sites/default/files/media/PDFs/Returns%20Volatility%20and%20Information%20Transmission%20Dynamics_001.pdf)

[11] Origin Investments. (2022, June 23). *How Multifamily Real Estate Hedges Your Portfolio Against Market ...*. Retrieved from [https://origininvestments.com/multifamily-real-estate-hedges-portfolio-against-market-volatility/](https://origininvestments.com/multifamily-real-estate-hedges-portfolio-against-market-volatility/)

[12] WallStreetPrep. (n.d.). *Cap Rates and Interest Rates | Relationship in Real Estate*. Retrieved from [https://www.wallstreetprep.com/knowledge/cap-rates-and-interest-rates/](https://www.wallstreetprep.com/knowledge/cap-rates-and-interest-rates/)

[13] Hoesli, M., Jani, E., & Bender, A. (2006). Monte Carlo simulations for real estate valuation. *Journal of Property Investment & Finance*, *24*(2), 102-121. Retrieved from [https://www.emerald.com/jpif/article/24/2/102/234423](https://www.emerald.com/jpif/article/24/2/102/234423)

[14] Gimpelevich, D. (2011). Simulation‐based excess return model for real estate development: A practical Monte Carlo simulation‐based method for quantitative risk management and project valuation for real estate development proj. *Journal of Property Investment & Finance*, *29*(2), 115-135. Retrieved from [https://www.emerald.com/jpif/article/29/2/115/233441](https://www.emerald.com/jpif/article/29/2/115/233441)

[15] Investopedia. (n.d.). *Monte Carlo Simulation: What It Is, How It Works, History, 4 Key Steps*. Retrieved from [https://www.investopedia.com/terms/m/montecarlosimulation.asp](https://www.investopedia.com/terms/m/montecarlosimulation.asp)

[16] K-REx. (n.d.). *pricing of collateralized debt obligations and credit default*. Retrieved from [https://krex.k-state.edu/server/api/core/bitstreams/a123f5bc-afcc-489a-ad16-722bfc013529/content](https://krex.k-state.edu/server/api/core/bitstreams/a123f5bc-afcc-489a-ad16-722bfc013529/content)

[17] J. Peter. (2012). *Modelling Uncertainty and Flexibility in the Financial Analysis of a Real Estate Development Project in Switzerland*. Retrieved from [https://ethz.ch/content/dam/ethz/special-interest/mtec/chair-of-entrepreneurial-risks-dam/documents/dissertation/master%20thesis/Thesis_jpeter_public_final.pdf](https://ethz.ch/content/dam/ethz/special-interest/mtec/chair-of-entrepreneurial-risks-dam/documents/dissertation/master%20thesis/Thesis_jpeter_public_final.pdf)

[18] ICFS. (n.d.). *Standard Deviation, Beta, Alpha, and Sharpe Ratio Explained for ...*. Retrieved from [https://icfs.com/specialists-desk/risk-metrics-explained](https://icfs.com/specialists-desk/risk-metrics-explained)

[19] National Mortgage Professional. (2025, November 18). *Rocket Pro Launches DSCR Product As Investor Demand Surges*. Retrieved from [https://nationalmortgageprofessional.com/news/rocket-pro-launches-dscr-product-investor-demand-surges](https://nationalmortgageprofessional.com/news/rocket-pro-launches-dscr-product-investor-demand-surges)

[20] Rocket Pro. (n.d.). *DSCR*. Retrieved from [https://www.rocketpro.com/non-agency-products/dscr](https://www.rocketpro.com/non-agency-products/dscr)

[21] The Truth About Mortgage. (2025, November 19). *Rocket Mortgage Rolls Out DSCR Loans for Real Estate Investors*. Retrieved from [https://www.thetruthaboutmortgage.com/rocket-mortgage-rolls-out-dscr-loans-for-real-estate-investors/](https://www.thetruthaboutmortgage.com/rocket-mortgage-rolls-out-dscr-loans-for-real-estate-investors/)

[22] Mortgage News Daily. (2025, December 1). *DSCR, Non-QM, FHA Products; AI, Broker, Borrower-Focused ...*. Retrieved from [https://www.mortgagenewsdaily.com/opinion/pipelinepress-12012025](https://www.mortgagenewsdaily.com/opinion/pipelinepress-12012025)

[23] Rocket Pro. (n.d.). *Win more purchase today. Build what's next for your business.*. Retrieved from [https://www.rocketpro.com/power-play](https://www.rocketpro.com/power-play)

[24] Angel Oak Mortgage Solutions. (n.d.). *DSCR Second Lien - Access cash from rental properties*. Retrieved from [https://angeloakms.com/programs/dscr-closed-end-second-lien/](https://angeloakms.com/programs/dscr-closed-end-second-lien/)

[25] Deephaven Mortgage. (n.d.). *Wholesale DSCR Second*. Retrieved from [https://deephavenmortgage.com/wholesale-dscr-second/](https://deephavenmortgage.com/wholesale-dscr-second/)

[26] Deephaven Mortgage. (n.d.). *Wholesale ITIN Mortgage*. Retrieved from [https://deephavenmortgage.com/wholesale-itin-mortgage/](https://deephavenmortgage.com/wholesale-itin-mortgage/)

[27] Deephaven Mortgage. (n.d.). *[PDF] LOAN PURCHASE ELIGIBILITY GUIDELINES*. Retrieved from [https://deephavenmortgage.com/wp-content/uploads/WHLS-Guidelines.pdf](https://deephavenmortgage.com/wp-content/uploads/WHLS-Guidelines.pdf)

[28] Commonwealth of Pennsylvania. (n.d.). *Act 6 Residential Lending Rates*. Retrieved from [https://www.pa.gov/agencies/dobs/media-resources/act-6-information](https://www.pa.gov/agencies/dobs/media-resources/act-6-information)

[29] Tenaco. (2017, December 28). *Pennsylvania Increases Principal Amount Threshold under Loan ...*. Retrieved from [https://www.tenaco.com/pennsylvania-increases-principal-amount-threshold-loan-interest-protection-law/](https://www.tenaco.com/pennsylvania-increases-principal-amount-threshold-loan-interest-protection-law/)

[30] Ohio Department of Commerce. (2021, April 21). *Loan Prepayment Penalty & Adjustment*. Retrieved from [https://com.ohio.gov/divisions-and-programs/financial-institutions/consumer-finance/guides-and-resources/loan-prepayment-penalty-and-adjustment](https://com.ohio.gov/divisions-and-programs/financial-institutions/consumer-finance/guides-and-resources/loan-prepayment-penalty-and-adjustment)

[31] Revisor. (n.d.). *Sec. 58.137 MN Statutes*. Retrieved from [https://www.revisor.mn.gov/statutes/cite/58.137](https://www.revisor.mn.gov/statutes/cite/58.137)

[32] FindLaw. (n.d.). *Minnesota Statutes Banking (Ch. 46-59) § 58.137 - Codes - FindLaw*. Retrieved from [https://codes.findlaw.com/mn/banking-ch-46-59/mn-st-sect-58-137/](https://codes.findlaw.com/mn/banking-ch-46-59/mn-st-sect-58-137/)

[33] Kansas Reflector. (2026, January 26). *Bill would allow early payoff penalties for Kansas real estate ...*. Retrieved from [https://kansasreflector.com/briefs/bill-would-allow-early-payoff-penalties-for-kansas-real-estate-investment-loans/](https://kansasreflector.com/briefs/bill-would-allow-early-payoff-penalties-for-kansas-real-estate-investment-loans/)

[34] Amerisave. (n.d.). *Prepayment Penalties in 2026: What They Are and How to Avoid Them*. Retrieved from [https://www.amerisave.com/glossary/prepayment-penalties-in-what-they-are-and-how-to-avoid-them](https://www.amerisave.com/glossary/prepayment-penalties-in-what-they-are-and-how-to-avoid-them)

[35] CGA. (n.d.). *State Mortgage Prepayment Penalty Laws*. Retrieved from [https://www.cga.ct.gov/PS96/rpt/olr/htm/96-R-1211.htm](https://www.cga.ct.gov/PS96/rpt/olr/htm/96-R-1211.htm)

[36] Los Angeles City Planning. (n.d.). *Home | Los Angeles City Planning*. Retrieved from [https://planning.lacity.gov/plans-policies/short-term-rental-ordinance-updates-2026/](https://planning.lacity.gov/plans-policies/short-term-rental-ordinance-updates-2026/)

[37] Relip. (n.d.). *How to Turn DSCR Leads Into Funded Investor Loans*. Retrieved from [https://www.relip.co/guides/dscr-leads](https://www.relip.co/guides/dscr-leads)

[38] Aged Lead Store. (2026, March 13). *Mortgage Leads Cost: Aged vs Fresh vs Exclusive Pricing Guide ...*. Retrieved from [https://agedleadstore.com/mortgage-leads-cost-guide/](https://agedleadstore.com/mortgage-leads-cost-guide/)

[39] Host Financial. (2026, March 17). *DSCR Loan Rates 2026: Guide for Real Estate Investors*. Retrieved from [https://www.hostfinancial.com/blog/dscr-loan-rates](https://www.hostfinancial.com/blog/dscr-loan-rates)

[40] Griffin Funding. (n.d.). *DSCR Loans 2026: Buy & Refinance Rental Properties*. Retrieved from [https://griffinfunding.com/non-qm-mortgages/dscr-loans/](https://griffinfunding.com/non-qm-mortgages/dscr-loans/)

[41] Foundation Mortgage. (2026, January 1). *Mortgage Market Reset: What 2026 Really Looks Like*. Retrieved from [https://foundationmortgage.com/mortgage-market-reset-2026/](https://foundationmortgage.com/mortgage-market-reset-2026/)

[42] Gelt Financial. (2026, January 10). *Bridge-to-DSCR in 2026: Refinance Your Hard Money Loan*. Retrieved from [https://geltfinancial.com/hard-money-loans/bridge-dscr-2026-refinance-hard-money-loan-checklist-timeline/](https://geltfinancial.com/hard-money-loans/bridge-dscr-2026-refinance-hard-money-loan-checklist-timeline/)

[43] Verus Mortgage Capital. (2026, March 17). *2026 Outlook for Non-QM Lending and Securitization*. Retrieved from [https://verusmc.com/looking-ahead-the-2026-outlook-for-non-qm-lending-and-securitization/](https://verusmc.com/looking-ahead-the-2026-outlook-for-non-qm-lending-and-securitization/)

[44] NQMF. (n.d.). *Non-QM Lending Trends to Watch in 2026: What Brokers Need to ...*. Retrieved from [https://www.nqmf.com/non-qm-lending-trends-to-watch-in-2026-what-brokers-need-to-prepare-for/](https://www.nqmf.com/non-qm-lending-trends-to-watch-in-2026-what-brokers-need-to-prepare-for/)
