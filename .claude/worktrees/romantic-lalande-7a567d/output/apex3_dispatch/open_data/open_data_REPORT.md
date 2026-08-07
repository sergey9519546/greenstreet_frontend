---
type: research
status: drafted
confidence: 3
title: "DSCR Sovereign OS — Open Data & Government/Industry API Inventory"
summary: "**Scope:** Free / open-access datasets and APIs usable for rent forecasting, mortgage default modeling, prepayment analysis, insurance volatility, tax reassessment risk, and macro conditioning."
entities:
  - concept/arm
  - concept/dscr
  - concept/io
  - concept/ltv
  - data/apartment-list
  - data/cotality
  - data/fannie-mae
  - data/fred
  - data/freddie-mac
  - data/zillow
  - data/zori
  - ml/shap
  - regulation/cfpb
  - regulation/hmda
  - state/ny
  - topic/multifamily
  - topic/sfr
  - topic/str
tags:
  - topic/apex
  - topic/default-rate
  - topic/flood-insurance
  - topic/foreclosure
  - topic/insurance
  - topic/llpa
  - topic/portfolio
  - topic/tax
  - topic/yield-curve
source: output/apex3_dispatch/open_data/open_data_REPORT.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Open Data & Government/Industry API Inventory

**Compiled:** June 19, 2026
**Scope:** Free / open-access datasets and APIs usable for rent forecasting, mortgage default modeling, prepayment analysis, insurance volatility, tax reassessment risk, and macro conditioning.
**Total entries:** 53 (datasets + APIs)

---

## Priority Legend

- **HIGH** — direct, loan-level or sub-county granularity; first-pass foundation for any DSCR underwriting/portfolio model
- **MEDIUM** — county/metro/zip level; useful for conditioning, calibration, or as features
- **LOW** — supplementary; supports validation, cross-checks, or narratives

---

## Section A — Loan-Level Mortgage Performance (Default / Prepayment / Servicing)

### A1. Fannie Mae Single-Family Loan Performance Data
- **Provider:** Fannie Mae Capital Markets
- **URL (landing):** https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-credit-risk-transfer/fannie-mae-single-family-loan-performance-data
- **URL (download):** https://datadynamics.fanniemae.com/data-dynamics/#/reportMenu;category=HP
- **Coverage:** Acquisitions Jan 2000–Q1 2012 (Primary); HARP refinances through Sep 2016; ~25M loans
- **Update:** Quarterly (acquisition + monthly performance); current release Q4 2025 (Apr 30, 2026)
- **Format:** CSV (one acquisition quarter per file + monthly performance); R loader scripts provided
- **Auth:** Free registration at Data Dynamics; commercial redistribution requires licensing
- **License:** Terms and Conditions; non-commercial/academic use OK
- **DSCR Sovereign OS relevance:** GOLD. Loan-level credit performance, LTV, FICO, delinquency, loss severity, modification flags, voluntary prepayments. Direct fit for default/prepayment models and DSCR stress calibration.
- **Priority:** **HIGH**

### A2. Fannie Mae Multifamily Loan Performance Data
- **Provider:** Fannie Mae
- **URL:** https://capitalmarkets.fanniemae.com/credit-risk-transfer/multifamily-credit-risk-transfer/multifamily-loan-performance-data
- **Coverage:** Multifamily loans; 62 attributes per loan
- **Format:** CSV
- **Auth:** Free registration
- **DSCR Sovereign OS relevance:** GOLD for small-multifamily / 5–50 unit DSCR loans — debt service coverage, NOI, DSCR at origination, delinquency transitions.
- **Priority:** **HIGH**

### A3. Freddie Mac Single-Family Loan-Level Dataset (SFLLD)
- **Provider:** Freddie Mac
- **URL (landing):** https://www.freddiemac.com/research/datasets/sf-loanlevel-dataset
- **URL (download):** https://claritydownload.fmapps.freddiemac.com/CRT/
- **Coverage:** ~55M mortgages originated Jan 1999–Sep 2025; monthly performance through Sep 30 2025
- **Update:** Quarterly
- **Format:** CSV; Standard + Non-Standard datasets, RPL mapping
- **Auth:** Free registration on Clarity Data Intelligence; commercial redistribution requires licensing agreement
- **License:** Free non-commercial / academic; commercial requires license
- **DSCR Sovereign OS relevance:** GOLD. Same analytical power as Fannie Mae SF LPP but covers conforming loans purchased by Freddie Mac; complements A1 for cross-validation.
- **Priority:** **HIGH**

### A4. Ginnie Mae MBS Disclosure Data Download
- **Provider:** Ginnie Mae
- **URL (landing):** https://www.ginniemae.gov/data_and_reports/disclosure_data/Pages/bulk_data_download.aspx
- **URL (direct):** http://bulk.ginniemae.gov/
- **Coverage:** Daily/monthly single-family and HMBS pool-level and loan-level disclosures; current portfolio; new issuance; liquidations; forbearance supplements
- **Update:** Daily (new issues), Monthly (portfolios)
- **Format:** ZIP (CSV/TXT inside)
- **Auth:** None
- **Notable direct files (Jun 2026):**
  - `llmon2_202605.zip` — Ginnie II SF portfolio loan-level (~346 MB)
  - `LoanPerfAnn_202512.zip` — annual loan performance (~2.3 GB)
  - `LoanPerf_202603.zip` — quarterly loan performance (~770 MB)
  - `CPRmon_202605.zip` — monthly conditional prepayment rate
  - `llpaymhist_202605.zip` — loan payment history
- **DSCR Sovereign OS relevance:** GOLD for FHA/VA/USDA DSCR products. Forbearance, delinquency, prepayment data — directly applicable to default/prepayment modeling on government-backed DSCR loans.
- **Priority:** **HIGH**

### A5. Ginnie Mae MBS Loan Performance Files (Quarterly + Annual)
- **Provider:** Ginnie Mae
- **URL:** http://bulk.ginniemae.gov/ (file: `LoanPerf_YYYYQQ.zip` and `LoanPerfAnn_YYYYMM.zip`)
- **Coverage:** Multi-decade Ginnie I & II loan-level performance
- **Format:** ZIP/CSV
- **Auth:** None
- **DSCR Sovereign OS relevance:** Single best source for government-backed loan performance; pair with A4.
- **Priority:** **HIGH**

### A6. HMDA — Home Mortgage Disclosure Act (Modified LAR + FFIEC)
- **Provider:** CFPB / FFIEC
- **URL (CFPB):** https://www.cfpb.gov/data-research/hmda/
- **URL (FFIEC):** https://ffiec.cfpb.gov/data-publication/modified-lar
- **URL (HMDA Data Science Kit):** https://github.com/cfpb/HMDA_Data_Science_Kit
- **Coverage:** Annual origination-level; 2007–present (LAR); full historical back to 1990
- **Update:** Annual (data year + 1 year); TS files cover 1990+
- **Format:** Pipe-delimited LAR / TS files; CSV via tools
- **Auth:** None
- **License:** Public; minor suppression rules
- **DSCR Sovereign OS relevance:** Origination volume, loan purpose (purchase/refi), occupancy (investment/non-owner), loan amount, income, race/ethnicity, census tract — critical for DSCR market sizing, investor-portfolio segmentation, fair-lending overlays.
- **Priority:** **HIGH**

### A7. FHFA Enterprise Public Use Database (PUDB)
- **Provider:** FHFA
- **URL:** https://www.fhfa.gov/data/public-use-database
- **URL (data.gov):** https://catalog.data.gov/dataset/enterprise-public-use-database-pudb
- **Coverage:** Annual loan-level (census tract + income + race + LTV + affordability); 1999–present for SF; multifamily
- **Update:** Annual
- **Format:** Fixed-width TXT / CSV
- **Auth:** Email request; some files via FHFA directly
- **License:** Public; FHFA Terms
- **DSCR Sovereign OS relevance:** Loan-level census-tract linkage for conforming DSCR (≤conforming limit) loans; concentration/risk analysis.
- **Priority:** **HIGH**

### A8. FHFA National Mortgage Database (NMDB) Aggregate Statistics
- **Provider:** FHFA + CFPB
- **URL:** https://www.fhfa.gov/data/nmdb
- **URL (dashboard):** https://www.fhfa.gov/data/dashboard/nmdb-outstanding-residential-mortgage-statistics
- **Coverage:** Nationally representative 5% sample of closed-end first-lien 1–4 family mortgages
- **Update:** Quarterly
- **Format:** Web dashboards + CSV downloads
- **Auth:** None
- **DSCR Sovereign OS relevance:** Aggregate benchmarking of mortgage performance — 30/60/90+ DQ rates, forbearance, prepayment by state/metro for portfolio calibration.
- **Priority:** **HIGH**

### A9. NSMO Public Use File (National Survey of Mortgage Originations)
- **Provider:** FHFA + CFPB
- **URL:** https://www.fhfa.gov/data/nsmo
- **Coverage:** Quarterly survey of new mortgage borrowers (from NMDB); 2014–present
- **Format:** CSV / SAS / R
- **Auth:** None
- **DSCR Sovereign OS relevance:** Borrower-side behavior data (shop behavior, satisfaction, payment method) — useful for prepayment motivation models.
- **Priority:** MEDIUM

### A10. CFPB Mortgage Performance Trends
- **Provider:** CFPB
- **URL (landing):** https://www.consumerfinance.gov/data-research/mortgage-performance-trends/
- **URL (download):** https://www.consumerfinance.gov/data-research/mortgage-performance-trends/download-the-data/
- **Coverage:** National, state, metro, county; 5% NMDB sample; 30/60/90+ delinquency buckets
- **Update:** Quarterly
- **Format:** CSV
- **Auth:** None
- **DSCR Sovereign OS relevance:** Geographic delinquency benchmarks — essential input to localized default models.
- **Priority:** **HIGH**

### A11. MBA National Delinquency Survey (NDS)
- **Provider:** Mortgage Bankers Association
- **URL:** https://www.mba.org/news-and-research/research-and-economics/single-family-research/national-delinquency-survey
- **URL (latest):** https://www.mba.org/home/product/2025-q4-national-delinquency-survey-82275
- **URL (historical):** https://www.mba.org/home/product/2025-q1-national-delinquency-survey-all-data-points-80836
- **Coverage:** Quarterly 1979–present; ~39M loans sample; aggregate + state
- **Update:** Quarterly
- **Format:** PDF (paid) + historical XLS (paid)
- **Auth:** PAID for full dataset; press summary free
- **DSCR Sovereign OS relevance:** Industry-benchmark delinquency/foreclosure rates; key conditioning feature.
- **Priority:** MEDIUM (paid summary; quarterly headline free)

### A12. MBA Quarterly Commercial/Multifamily Mortgage Delinquency Rates
- **Provider:** MBA
- **URL:** https://www.mba.org/news-and-research/research-and-economics/commercial-multifamily-research/commercial-multifamily-mortgage-delinquency-rates
- **Coverage:** Top-5 investor groups (CMBS, life co., Fannie, Freddie, banks); quarterly
- **Update:** Quarterly
- **Format:** PDF + Excel
- **Auth:** Partial free; full paid
- **DSCR Sovereign OS relevance:** Direct small-multifamily DSCR delinquency benchmark.
- **Priority:** MEDIUM

### A13. ICE / Black Knight McDash (Loan-Level Mortgage Performance)
- **Provider:** Intercontinental Exchange (ICE) — proprietary
- **URL (overview):** https://www.ice.com/fixed-income-data-services/mortgage-data-solutions/mcdash
- **URL (Mortgage Monitor reports):** https://mortgagetech.ice.com/resources/data-reports
- **Coverage:** ~175M+ unique loans; loan-level origination + performance
- **Access:** Commercial license only; referenced extensively in Fed research and AEI Housing Center indicators
- **Format:** Licensed loan-level feeds
- **DSCR Sovereign OS relevance:** Industry-standard loan-level dataset. Use via published Mortgage Monitor reports (free) for benchmark curves.
- **Priority:** MEDIUM (free report extracts; full data paid)

### A14. AEI Housing Center Indicators (uses McDash + Fannie + Freddie + FHA)
- **Provider:** American Enterprise Institute
- **URL:** https://www.aei.org/housing/aei-housing-center-indicators/
- **Coverage:** Aggregate indices derived from above loan-level sources + Zillow + FHA
- **Format:** CSV/XLSX (selected)
- **Auth:** None for downloads
- **License:** Free use with attribution
- **DSCR Sovereign OS relevance:** Clean, derived national/metro housing indicators — useful for cross-checks.
- **Priority:** MEDIUM

---

## Section B — Property Value / House Price / Rent Indices

### B1. FHFA House Price Index (HPI)
- **Provider:** FHFA
- **URL (landing):** https://www.fhfa.gov/data/hpi
- **URL (datasets):** https://www.fhfa.gov/data/hpi/datasets
- **URL (API):** https://www.fhfa.gov/about/fhfa-policies/api-terms-of-service
- **Coverage:** National, state, MSA, county, ZIP, census tract; monthly from 1975 (limited geographies); quarterly deeper history
- **Update:** Quarterly + Monthly
- **Format:** CSV; API (JSON/CSV)
- **Auth:** None for download; API key optional
- **License:** Public domain (US govt)
- **DSCR Sovereign OS relevance:** Primary house-price index for property-value trajectory modeling (collateral valuation, LTV forecasting, tax reassessment risk).
- **Priority:** **HIGH**

### B2. Zillow Home Value Index (ZHVI)
- **Provider:** Zillow Research
- **URL:** https://www.zillow.com/research/data/
- **Coverage:** National, state, metro, county, city, ZIP, neighborhood; 1996–present; smoothed typical home value (35th–65th percentile)
- **Update:** Monthly
- **Format:** CSV
- **Auth:** None
- **License:** Free with attribution; non-commercial
- **DSCR Sovereign OS relevance:** Most granular sub-county home value series; tax reassessment and DSCR refinance valuation modeling.
- **Priority:** **HIGH**

### B3. Zillow Observed Rent Index (ZORI)
- **Provider:** Zillow Research
- **URL:** https://www.zillow.com/research/data/
- **Coverage:** National, state, metro, county, city, ZIP; 2014–present; smoothed observed market rent
- **Update:** Monthly
- **Format:** CSV
- **Auth:** None
- **License:** Free with attribution
- **DSCR Sovereign OS relevance:** Direct rent forecast input for DSCR rental income projections.
- **Priority:** **HIGH**

### B4. Zillow ZHVI Rent Index (ZORI predecessor / single-family)
- **Provider:** Zillow Research
- **URL:** https://www.zillow.com/research/data/
- **Coverage:** 2010–2021, then ZORI took over
- **DSCR Sovereign OS relevance:** Historical rent series for backtesting.
- **Priority:** MEDIUM

### B5. Apartment List National Rent Data
- **Provider:** Apartment List
- **URL:** https://www.apartmentlist.com/research/national-rent-data
- **Coverage:** National, state, metro, county, city; Jan 2017–present
- **Update:** Monthly
- **Format:** CSV (free download)
- **Auth:** None
- **DSCR Sovereign OS relevance:** Rent index competitor to ZORI; useful cross-validation; vacancy data also available.
- **Priority:** **HIGH**

### B6. HUD Fair Market Rents (FMR)
- **Provider:** HUD User
- **URL:** https://www.huduser.gov/portal/datasets/fmr.html
- **URL (API):** https://www.huduser.gov/portal/dataset/fmr-api.html
- **URL (data.gov):** https://catalog.data.gov/dataset/fair-market-rents-geospatial
- **URL (ArcGIS):** https://hudgis-hud.opendata.arcgis.com/datasets/fair-market-rents
- **Coverage:** County + metro area, all 50 states + DC; FY annual
- **Update:** Annually (FY)
- **Format:** CSV / JSON API / shapefile
- **Auth:** None
- **License:** Public domain
- **DSCR Sovereign OS relevance:** 40th percentile rent benchmark for SFR rental market; SF rental comps.
- **Priority:** **HIGH**

### B7. HUD Small Area Fair Market Rents (SAFMR)
- **Provider:** HUD User
- **URL:** https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html
- **Coverage:** ZIP code level
- **Update:** Annually
- **Format:** CSV/XLSX
- **Auth:** None
- **DSCR Sovereign OS relevance:** ZIP-level rent benchmarks — directly useful for sub-market DSCR underwriting.
- **Priority:** **HIGH**

### B8. Census ACS 5-Year — Median Rent, Gross Rent by Bedrooms (B25058, B25061, B25063, B25064)
- **Provider:** U.S. Census Bureau
- **URL (developer):** https://www.census.gov/data/developers/data-sets/acs-5year.html
- **URL (API):** https://www.census.gov/programs-surveys/acs/data/data-via-api.html
- **Coverage:** All geographies down to block group; 2009–2024 5-year vintage
- **Update:** Annual
- **Format:** API JSON + bulk CSV
- **Auth:** API key recommended (free)
- **License:** Public domain
- **DSCR Sovereign OS relevance:** Tract-level median rent + rent-by-bedroom for DSCR rent comp and market sizing.
- **Priority:** **HIGH**

### B9. Census ACS PUMS (Public Use Microdata Sample)
- **Provider:** U.S. Census Bureau / AWS Open Data
- **URL (AWS):** https://aws.amazon.com/public-datasets/us-census-acs/
- **Coverage:** Individual/household-level records; national
- **Format:** RDF on AWS; original CSV/SAS
- **Auth:** None
- **DSCR Sovereign OS relevance:** Custom tabulations of rent, income, tenure at PUMA level — for DSCR market depth analyses.
- **Priority:** MEDIUM

### B10. BLS Consumer Price Index — Rent Series (CPI Rent + OER)
- **Provider:** U.S. Bureau of Labor Statistics
- **URL (CPI rent page):** https://www.bls.gov/cpi/factsheets/owners-equivalent-rent-and-rent.htm
- **URL (developer / API):** https://www.bls.gov/developers/home.htm
- **Key series:** CUUR0000SEHA (Rent of Primary Residence); CUSR0000SEHC (OER); CUUR0000SAS2RS (Rent of Shelter)
- **URL (API v2):** https://www.bls.gov/bls/api_features.htm
- **URL (signature v2):** https://www.bls.gov/developers/api_signature_v2.htm
- **Coverage:** National + selected metros; monthly; 1913+ for some series
- **Update:** Monthly
- **Format:** REST/JSON API + bulk CSV download
- **Auth:** **Required** for v2 (free email registration); v1 no key (deprecated)
- **DSCR Sovereign OS relevance:** Headline rent inflation gauge for macro conditioning of DSCR rent forecasts.
- **Priority:** **HIGH**

### B11. BLS New Tenant Rent Index (NTRI)
- **Provider:** BLS
- **URL:** https://www.bls.gov/pir/new-tenant-rent.htm
- **Coverage:** National + 27 metros; quarterly
- **Format:** Research series, CSV
- **Auth:** None
- **DSCR Sovereign OS relevance:** Leading-indicator new-tenant rent — better lead on DSCR rent than CPI rent.
- **Priority:** **HIGH**

### B12. Realtor.com Research Data Library
- **Provider:** Realtor.com
- **URL:** https://www.realtor.com/research/data/
- **URL (housing data):** https://www.realtor.com/research/topics/data/
- **URL (rental):** https://www.realtor.com/research/topics/rentals/
- **Coverage:** Weekly Inventory, Monthly Market Hotness, Monthly Rental Report; national, state, metro, county
- **Update:** Weekly / monthly
- **Format:** CSV download
- **Auth:** None (registration optional)
- **DSCR Sovereign OS relevance:** Asking-rent benchmark + listing inventory by tier — for rent forecast and absorption modeling.
- **Priority:** **HIGH**

### B13. Redfin Data Center
- **Provider:** Redfin
- **URL:** https://www.redfin.com/news/data-center/
- **Coverage:** Median sale price, sale-to-list, months supply, rent index; ZIP / city / metro
- **Update:** Monthly
- **Format:** CSV download
- **Auth:** None
- **DSCR Sovereign OS relevance:** Sale-price + rent + DOM benchmark for DSCR market context.
- **Priority:** MEDIUM

### B14. Freddie Mac Primary Mortgage Market Survey (PMMS)
- **Provider:** Freddie Mac
- **URL:** https://www.freddiemac.com/pmms
- **Coverage:** Weekly; 30-yr, 15-yr, ARM rates since 1971
- **Update:** Weekly
- **Format:** CSV download
- **Auth:** None
- **DSCR Sovereign OS relevance:** Mortgage rate index for DSCR rate forecasting and refinance modeling.
- **Priority:** **HIGH**

### B15. Fannie Mae Home Price Index (FMHPI)
- **Provider:** Fannie Mae
- **URL:** https://www.fanniemae.com/data-and-insights/surveys-indices/fannie-mae-home-price-index
- **Coverage:** National + metro; monthly
- **Format:** CSV/XLS
- **Auth:** None
- **DSCR Sovereign OS relevance:** Alternative to FHFA HPI for cross-validation.
- **Priority:** MEDIUM

### B16. Fannie Mae Mortgage Lender Sentiment Survey
- **Provider:** Fannie Mae
- **URL:** https://www.fanniemae.com/data-and-insights/surveys/mortgage-lender-sentiment-survey
- **Coverage:** Quarterly credit standards survey
- **Format:** PDF / CSV
- **DSCR Sovereign OS relevance:** Forward-looking lender tightening — DSCR credit demand pulse.
- **Priority:** MEDIUM

---

## Section C — Macro / Economic Conditioning Series

### C1. FRED API (Federal Reserve Bank of St. Louis)
- **Provider:** FRED
- **URL:** https://fred.stlouisfed.org/
- **URL (API):** https://fred.stlouisfed.org/docs/api/fred/
- **Coverage:** 845,000+ series; full US macro history (GDP, CPI, unemployment, PCE, payrolls, mortgage rates, household debt, consumer sentiment)
- **Update:** Real-time as releases land
- **Format:** REST API (XML/JSON) + bulk CSV
- **Auth:** **Required** for v2 (free email registration); 32-series per request without key (limited)
- **License:** Public (US govt)
- **Key DSCR-relevant series:**
  - `MORTGAGE30US` — 30-yr FRM
  - `CPIENGSL` — CPI rent of shelter
  - `CSUSHPISA` — S&P/Case-Shiller
  - `GDPC1` — Real GDP
  - `UNRATE`, `PAYEMS` — labor
  - `TDSP` — Household debt service ratio
  - `BAMLH0A0HYM2` — HY credit spread
  - `DGS10` — 10-yr Treasury
- **DSCR Sovereign OS relevance:** Primary macro conditioning API. Fits DSCR rent growth, default rates, prepayment rates as functions of macro.
- **Priority:** **HIGH**

### C2. BEA API (Bureau of Economic Analysis)
- **Provider:** BEA
- **URL:** https://www.bea.gov/
- **URL (API docs):** https://www.bea.gov/open-data
- **Coverage:** NIPA (GDP, GDI, PCE), regional GDP, personal income by county, housing investment, fixed-residential investment
- **Update:** Quarterly + annual
- **Format:** REST/JSON API + iTable CSV
- **Auth:** **Required** (free registration)
- **License:** Public domain
- **DSCR Sovereign OS relevance:** Macro context — residential fixed investment, regional GDP per capita.
- **Priority:** **HIGH**

### C3. Census Bureau Data API
- **Provider:** U.S. Census Bureau
- **URL:** https://www.census.gov/data/developers.html
- **URL (key signup):** https://api.census.gov/data/key_signup.html
- **Coverage:** ACS 1-/5-year, decennial, population estimates, building permits, housing units, business patterns
- **Update:** Annual
- **Format:** REST/JSON API + bulk CSV
- **Auth:** **Recommended** API key (free)
- **License:** Public domain
- **DSCR Sovereign OS relevance:** Tract-level population, income, rent, vacancy, building permits — conditioning features.
- **Priority:** **HIGH**

### C4. Census Building Permits Survey
- **Provider:** U.S. Census Bureau
- **URL (developer):** https://www.census.gov/data/developers.html (under "Building Permits Survey" / "Housing Units Authorized")
- **Coverage:** County/monthly/annual permits (SF + 2–4 unit + multifamily)
- **Update:** Monthly
- **Format:** API + CSV
- **Auth:** API key optional
- **DSCR Sovereign OS relevance:** Supply pipeline by MSA/county — affects rent growth and inventory.
- **Priority:** **HIGH**

### C5. NY Fed Quarterly Report on Household Debt and Credit (HHDC)
- **Provider:** Federal Reserve Bank of New York
- **URL:** https://www.newyorkfed.org/microeconomics/hhdc
- **URL (data bank):** https://www.newyorkfed.org/microeconomics/databank.html
- **URL (latest PDF):** https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/pdf/HHDC_2025Q4
- **Coverage:** Quarterly; 5% sample of US credit panel; mortgage, HELOC, auto, credit card, student debt + delinquencies
- **Update:** Quarterly
- **Format:** CSV + PDF
- **Auth:** None
- **DSCR Sovereign OS relevance:** Macro conditioning — household leverage, serious delinquency rate.
- **Priority:** **HIGH**

### C6. Federal Reserve G.19 Consumer Credit
- **Provider:** Federal Reserve Board
- **URL:** https://www.federalreserve.gov/releases/g19/current/
- **Coverage:** Monthly total consumer credit by holder (depository, finance, credit union, federal gov)
- **Update:** Monthly
- **Format:** CSV / TXT
- **Auth:** None
- **DSCR Sovereign OS relevance:** Macro conditioning for credit availability.
- **Priority:** MEDIUM

### C7. Federal Reserve Household Debt Service Ratios (DSR / FOR)
- **Provider:** Federal Reserve Board
- **URL:** https://www.federalreserve.gov/releases/DSR/default.htm
- **Coverage:** Quarterly household DSR; mortgage vs consumer split
- **Update:** Quarterly
- **Format:** CSV download
- **Auth:** None
- **DSCR Sovereign OS relevance:** Macro stress indicator — feeds DSCR default probability under stress.
- **Priority:** **HIGH**

### C8. Treasury yield curve (Daily Treasury Par Yield Curve Rates)
- **Provider:** U.S. Department of the Treasury
- **URL:** https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026
- **Coverage:** Daily; 1mo–30yr par yields
- **Format:** XML / CSV
- **Auth:** None
- **DSCR Sovereign OS relevance:** Risk-free curve for DSCR rate path scenarios.
- **Priority:** MEDIUM

### C9. U.S. Energy Information Administration (EIA) APIs
- **Provider:** EIA
- **URL (open data):** https://www.eia.gov/opendata/
- **URL (API key):** https://www.eia.gov/opendata/register.php
- **Coverage:** Natural gas, electricity, heating oil, gasoline; state + national
- **Update:** Varies (daily/monthly)
- **Format:** REST/JSON API + bulk CSV
- **Auth:** **Required** (free registration)
- **DSCR Sovereign OS relevance:** Utility cost conditioning for DSCR net operating income forecasts.
- **Priority:** MEDIUM

### C10. IRS Statistics of Income (SOI) — Individual + Migration
- **Provider:** IRS
- **URL:** https://www.irs.gov/statistics
- **Coverage:** AGI by ZIP, county migration data (national flow, county-to-county)
- **Update:** Annual
- **Format:** CSV / XLS
- **Auth:** None
- **DSCR Sovereign OS relevance:** Income growth + net-migration — direct rent-growth demand driver.
- **Priority:** **HIGH**

---

## Section D — Hazard / Insurance / Climate

### D1. FEMA National Risk Index (NRI)
- **Provider:** FEMA
- **URL (landing):** https://www.fema.gov/flood-maps/products-tools/national-risk-index
- **URL (OpenFEMA):** https://www.fema.gov/about/openfema/api
- **URL (ArcGIS dashboard):** https://experience.arcgis.com/experience/376770c1113943b6b5f6b58ff1c2fb5c/page/FEMA-NRI
- **Coverage:** Census-tract-level Expected Annual Loss for 18 natural hazards; community + county aggregations
- **Update:** Annual (most recent release Aug 2025)
- **Format:** CSV download + REST/JSON API
- **Auth:** None
- **License:** Public domain
- **DSCR Sovereign OS relevance:** Insurance volatility score + tax reassessment risk overlay; environmental risk premium.
- **Priority:** **HIGH**

### D2. OpenFEMA Disaster Declarations Summaries (v1)
- **Provider:** FEMA
- **URL (page):** https://www.fema.gov/openfema-data-page/fema-web-disaster-declarations-v1
- **URL (API):** https://www.fema.gov/about/openfema/api
- **API endpoint example:** `https://www.fema.gov/api/open/v1/FemaWebDisasterDeclarations`
- **Coverage:** 1953–present; all federally declared disasters by county
- **Update:** Daily sync
- **Format:** REST/JSON API + CSV
- **Auth:** None (OpenFEMA)
- **DSCR Sovereign OS relevance:** Historical disaster loss timeline at property location.
- **Priority:** **HIGH**

### D3. OpenFEMA FIMA NFIP Redacted Claims (v2)
- **Provider:** FEMA
- **URL (page):** https://www.fema.gov/openfema-data-page/fima-nfip-redacted-claims-v2
- **Coverage:** 1978–present; ~2.5M NFIP flood insurance claims, address-level
- **Update:** Every 40–60 days
- **Format:** CSV / JSON API
- **Auth:** None
- **DSCR Sovereign OS relevance:** Property-level flood insurance claims — direct insurance volatility input; tax reassessment risk.
- **Priority:** **HIGH**

### D4. OpenFEMA FIMA NFIP Redacted Policies (v2)
- **Provider:** FEMA
- **URL:** https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2
- **Coverage:** Policies in force, address-level
- **DSCR Sovereign OS relevance:** Flood-zone participation — affects insurance cost projections.
- **Priority:** **HIGH**

### D5. NOAA NCEI Storm Events Database
- **Provider:** NOAA / NCEI
- **URL (landing):** https://www.ncei.noaa.gov/stormevents/
- **URL (bulk FTP/HTTP):** https://www.ncei.noaa.gov/stormevents/ftp.jsp
- **URL (index):** https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/
- **Coverage:** 1950–present; tornado, hail, wind, hurricane, flood, wildfire, winter storm events with property damage estimates
- **Update:** ~75 days lag (post-event)
- **Format:** CSV (bulk by year)
- **Auth:** None
- **DSCR Sovereign OS relevance:** Property-level historical hazard events — insurance loss forecasting.
- **Priority:** **HIGH**

### D6. NOAA Severe Weather Data Inventory (SWDI)
- **Provider:** NOAA NCEI
- **URL:** https://www.ncei.noaa.gov/products/severe-weather-data-inventory
- **Coverage:** Hail, tornado, wind, lightning; shapefiles + CSV; 1996+
- **Format:** API + shapefile
- **Auth:** None
- **DSCR Sovereign OS relevance:** Property-level historical severe weather exposure.
- **Priority:** MEDIUM

### D7. USGS National Map / Natural Hazards
- **Provider:** USGS
- **URL:** https://www.usgs.gov/programs/national-geospatial-program
- **Coverage:** Elevation, slope, watershed, parcel boundaries, hydrography, soils
- **Format:** GeoTIFF, shapefile, KML
- **Auth:** None
- **DSCR Sovereign OS relevance:** Topographic/hydrologic features for site-level hazard overlay.
- **Priority:** MEDIUM

### D8. NFHL — National Flood Hazard Layer (FEMA)
- **Provider:** FEMA
- **URL:** https://www.fema.gov/glossary/national-flood-hazard-layer-nfhl
- **Coverage:** Current effective FIRM maps nationwide
- **Format:** ArcGIS REST + shapefile download
- **Auth:** None
- **DSCR Sovereign OS relevance:** Flood-zone determination at parcel level — direct insurance premium + tax reassessment input.
- **Priority:** **HIGH**

### D9. HUD USPS Address Vacancy Data
- **Provider:** HUD User
- **URL (info):** https://www.huduser.gov/portal/datasets/usps.html
- **URL (login):** https://www.huduser.gov/apps/public/usps/login
- **Coverage:** Quarterly; residential + business address-level vacancy from USPS no-stat counts; national
- **Format:** CSV
- **Auth:** Free registration (academic / government / non-profit)
- **License:** Free for non-commercial
- **DSCR Sovereign OS relevance:** Property-level vacancy — proxy for rental demand softness and abandonment.
- **Priority:** **HIGH**

---

## Section E — Property / Parcel / Tax Assessment

### E1. Regrid (Parcel Data)
- **Provider:** Regrid
- **URL:** https://regrid.com/
- **Coverage:** Nationwide parcel boundaries + attributes (~155M parcels); vacancy indicators; owner
- **Format:** API + bulk CSV/Parquet
- **Auth:** Commercial license (paid); some samples free
- **DSCR Sovereign OS relevance:** Parcel-level enrichment (land use, building area, year built, assessed value) — critical for property tax reassessment risk modeling.
- **Priority:** MEDIUM (paid; alternatives below are free)

### E2. ATTOM Property Data (Assessor + Deed + Mortgage + Tax)
- **Provider:** ATTOM
- **URL:** https://www.attomdata.com/
- **URL (assessor data):** https://www.attomdata.com/data/property-data/assessor-data/
- **URL (API docs):** https://api.developer.attomdata.com/docs
- **Coverage:** 158M+ US parcels; assessor + recorder + tax + deed + mortgage
- **Format:** REST/JSON API + bulk + cloud
- **Auth:** Commercial API key (paid)
- **DSCR Sovereign OS relevance:** Direct tax assessment history; sale transaction history; ownership — gold standard for property tax reassessment modeling.
- **Priority:** MEDIUM (paid)

### E3. Data.gov Parcel + Property Tax Catalog
- **Provider:** GSA
- **URL:** https://catalog.data.gov/dataset/?tags=parcel
- **URL (sdat tag):** https://catalog.data.gov/dataset/?tags=sdat
- **Coverage:** County-by-county parcel datasets uploaded by state/local governments
- **Format:** Mixed (CSV, shapefile, GeoJSON)
- **Auth:** None
- **DSCR Sovereign OS relevance:** Free alternative to ATTOM/Regrid — many counties publish parcel polygons + assessed values.
- **Priority:** **HIGH**

### E4. Miami-Dade County Property Appraiser Bulk File Library
- **Provider:** Miami-Dade County (FL)
- **URL:** http://bbs.miamidade.gov/
- **Coverage:** All Miami-Dade parcels; ownership + assessments + sales
- **Format:** CSV (paid $50/file)
- **DSCR Sovereign OS relevance:** Example of best-in-class county assessor bulk; model can replicate for other counties.
- **Priority:** MEDIUM

### E5. Montgomery County PA Property Data Portal
- **Provider:** Montgomery County PA
- **URL:** https://www.montgomerycountypa.gov/departments/board-assessment-appeals/property-data-data-requests
- **Coverage:** 300K parcels; tax maps
- **Format:** Shapefile + CSV
- **Auth:** Free (Open Data Portal)
- **DSCR Sovereign OS relevance:** Reference county parcel open data layout.
- **Priority:** MEDIUM

### E6. St. Louis County (MN) Property Details Search
- **Provider:** St. Louis County MN
- **URL:** https://www.stlouiscountymn.gov/departments-a-z/assessor/property-information/property-details-search
- **Coverage:** Daily-updated parcel data
- **Format:** Web + bulk
- **Auth:** Open
- **Priority:** LOW (illustrative county portal)

### E7. CoreLogic Public Records / LLMA
- **Provider:** CoreLogic / ICE (now)
- **URL:** https://www.ice.com/fixed-income-data-services
- **URL (research data catalog):** https://researchdatacatalog.iu.edu/concern/data_sets/7dc5cf82-26df-4e89-83b4-4c5e1c2e04de
- **Access:** Commercial; IU Research Data catalog has restricted-access copy
- **DSCR Sovereign OS relevance:** De-identified loan-level dataset combining property records and mortgage origination/performance.
- **Priority:** LOW (commercial + restricted)

### E8. FHFA UAD (Uniform Appraisal Dataset) Aggregate Statistics
- **Provider:** FHFA
- **URL:** https://www.fhfa.gov/data/uad
- **Coverage:** Aggregate appraisal stats by geography
- **Format:** CSV
- **Auth:** None
- **DSCR Sovereign OS relevance:** Appraisal-level distribution data — calibration for valuation models.
- **Priority:** MEDIUM

### E9. FHFA UAD Appraisal-Level Public Use File
- **Provider:** FHFA
- **URL:** https://www.fhfa.gov/data/uad/puf
- **Coverage:** Appraised value, GLA, condition rating — national
- **Format:** CSV / TXT
- **Auth:** None
- **DSCR Sovereign OS relevance:** Direct appraisal-level calibration data — value modeling.
- **Priority:** **HIGH**

---

## Section F — Disaster / Government Programs

### F1. OpenFEMA Data Sets (catalog)
- **Provider:** FEMA
- **URL (landing):** https://www.fema.gov/about/reports-and-data/openfema
- **URL (datasets list):** https://www.fema.gov/openfema-data-page/openfema-data-sets-v1
- **Notable datasets (beyond D2/D3/D4):**
  - **Hazard Mitigation Grants** — property-level risk reduction projects
  - **Public Assistance Funded Project Details** — disaster recovery project location + dollar
  - **Individual Assistance Housing Registrants** — disaster damage by address
  - **NFIP Policies** (D4) and **Claims** (D3)
- **API:** https://www.fema.gov/about/openfema/api
- **Auth:** None
- **DSCR Sovereign OS relevance:** Property-level disaster impact → insurance volatility + tax reassessment triggers.
- **Priority:** **HIGH**

### F2. HUD PD&R Datasets (income limits, CHAS, AHS)
- **Provider:** HUD User
- **URL (catalog):** https://www.huduser.gov/portal/pdrdatas_landing.html
- **Notable datasets:**
  - **CHAS (Comprehensive Housing Affordability Strategy)** — tract-level housing problems by tenure
  - **AHS (American Housing Survey)** — biennial national + metro microdata
  - **Median Family Incomes** — county-level for HUD program eligibility
  - **Fair Market Rents** (B6)
- **Format:** CSV / API
- **Auth:** None
- **Priority:** **HIGH**

### F3. HUD Low-Income Housing Tax Credit (LIHTC) Database
- **Provider:** HUD User
- **URL:** https://www.huduser.gov/portal/datasets/lihtc.html
- **Coverage:** All LIHTC projects placed-in-service 1987–present
- **Format:** CSV + shapefile
- **DSCR Sovereign OS relevance:** Affordable housing supply context (5–50 unit DSCR market).
- **Priority:** MEDIUM

### F4. HUD Multifamily Assistance & Section 8 Contracts
- **Provider:** HUD
- **URL:** https://www.huduser.gov/portal/datasets/mfh.html
- **Coverage:** Project-level subsidy + rent
- **Format:** CSV
- **DSCR Sovereign OS relevance:** Affordable rental comp benchmarks.
- **Priority:** MEDIUM

---

## Section G — Supplementary / Cross-Validation

### G1. OpenStreetMap (OSM) Building Footprints + Land Use
- **Provider:** OpenStreetMap Foundation
- **URL:** https://www.openstreetmap.org/
- **URL (data extracts):** https://download.geofabrik.de/
- **Coverage:** Global; building footprints, land use, addresses, POIs
- **Format:** PBF (Protocolbuffer Binary Format)
- **Auth:** None
- **DSCR Sovereign OS relevance:** Open building footprints + land use + addresses — property boundary enrichment.
- **Priority:** MEDIUM

### G2. FRED ALFRED (vintages of FRED data)
- **Provider:** FRED
- **URL:** https://alfred.stlouisfed.org/
- **Coverage:** Point-in-time historical vintage of every FRED series
- **Format:** REST API + CSV
- **Auth:** None (same FRED key)
- **DSCR Sovereign OS relevance:** Backtesting without look-ahead bias — essential for honest DSCR model validation.
- **Priority:** **HIGH**

### G3. FRASER (Federal Reserve Archive)
- **Provider:** St. Louis Fed
- **URL:** https://fraser.stlouisfed.org/
- **Coverage:** Historical Federal Reserve publications
- **DSCR Sovereign OS relevance:** Historical policy context (rate cycles).
- **Priority:** LOW

### G4. Bureau of Economic Analysis — Regional Data (GDP by Metro + State)
- **Provider:** BEA
- **URL:** https://www.bea.gov/data/gdp/gross-domestic-product
- **URL (interactive):** https://www.bea.gov/itable
- **Coverage:** State + MSA GDP + personal income
- **Format:** CSV / API
- **DSCR Sovereign OS relevance:** MSA-level economic health — DSCR demand conditioning.
- **Priority:** MEDIUM

### G5. Census Quarterly Financial Report (QFR)
- **Provider:** U.S. Census Bureau
- **URL (developer):** https://www.census.gov/data/developers.html
- **Coverage:** Corporate financials by industry — also via FRED series `QFR*`
- **DSCR Sovereign OS relevance:** Macro stress overlay for CRE markets.
- **Priority:** LOW

### G6. FDIC Quarterly Banking Profile
- **Provider:** FDIC
- **URL:** https://www.fdic.gov/quarterly-banking-profile
- **Coverage:** Bank balance sheets, real-estate loans
- **Format:** CSV + PDF
- **Auth:** None
- **DSCR Sovereign OS relevance:** Bank lending capacity / supply of DSCR credit.
- **Priority:** LOW

### G7. Survey of Consumer Finances (SCF)
- **Provider:** Federal Reserve Board
- **URL:** https://www.federalreserve.gov/econres/scf_2007.htm
- **Coverage:** Triennial household balance sheet + income + housing
- **Format:** SAS + CSV + R extract
- **Auth:** None
- **DSCR Sovereign OS relevance:** Investor-borrower balance sheet conditioning (rare in free data).
- **Priority:** **HIGH**

### G8. Freddie Mac Cost of Funds Index (COFI)
- **Provider:** Freddie Mac
- **URL:** https://www.freddiemac.com/research/datasets/cofi
- **Coverage:** Monthly; 11th district FHLB cost of funds
- **Format:** XLS
- **Auth:** None
- **DSCR Sovereign OS relevance:** ARM index for DSCR ARM products.
- **Priority:** MEDIUM

### G9. Fannie Mae Refinance Application-Level Index
- **Provider:** Fannie Mae
- **URL:** https://www.fanniemae.com/data-and-insights/surveys-indices/refinance-application-level-index
- **Coverage:** Monthly refinance applications
- **Format:** CSV
- **DSCR Sovereign OS relevance:** Real-time refi demand signal for DSCR prepay modeling.
- **Priority:** MEDIUM

### G10. Home Price Expectations Survey (HPES)
- **Provider:** Fannie Mae
- **URL:** https://www.fanniemae.com/data-and-insights/surveys-indices/home-price-expectations-survey-hpes
- **Coverage:** Quarterly panel of 100+ forecasters; 3/6/12/24-month home price expectations
- **Format:** CSV
- **DSCR Sovereign OS relevance:** Forward house price forecasts for DSCR value-at-risk scenarios.
- **Priority:** MEDIUM

---

## Quick-Reference: 5 "Must-Have" Foundational Datasets

| # | Dataset | URL | DSCR Use |
|---|---------|-----|----------|
| 1 | Fannie Mae SF Loan Performance | https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-credit-risk-transfer/fannie-mae-single-family-loan-performance-data | Default + prepayment modeling (GOLD) |
| 2 | Freddie Mac SFLLD | https://www.freddiemac.com/research/datasets/sf-loanlevel-dataset | Default + prepayment modeling (cross-validation) |
| 3 | Ginnie Mae Loan Performance | http://bulk.ginniemae.gov/ | FHA/VA/USDA DSCR performance (GOLD) |
| 4 | FHFA House Price Index | https://www.fhfa.gov/data/hpi/datasets | Collateral value trajectory |
| 5 | Zillow ZORI + ZHVI | https://www.zillow.com/research/data/ | Rent + value forecasting (sub-county) |

---

## Auth Quick-Reference

| Auth | Datasets |
|------|----------|
| **None (open)** | FRED, BLS v1 (limited), FHFA, Census, BEA, FEMA/OpenFEMA, NOAA, HUD User, Zillow, Realtor.com, Redfin, NY Fed, Ginnie Mae, Federal Reserve Board, IRS SOI, Treasury, ATTOM/Regrid/Black Knight/ICE are commercial |
| **Free registration** | Fannie Mae Data Dynamics, Freddie Mac Clarity, Census API key, BEA API key, BLS v2 API key, EIA API key, NMDB, NSMO, ATTOM (paid), Regrid (paid) |
| **Commercial license** | MBA NDS (full), ICE McDash, ATTOM, Regrid, Black Knight, CoreLogic LLMA |

---

## Coverage Notes

- All `.gov` datasets above are public domain.
- Commercial datasets included for reference (paid); use free report extracts when available.
- Coverage periods are accurate as of June 2026 per the source pages accessed.
