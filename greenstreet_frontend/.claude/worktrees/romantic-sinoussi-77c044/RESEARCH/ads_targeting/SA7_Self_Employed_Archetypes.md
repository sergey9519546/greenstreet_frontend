---
type: research
status: drafted
title: "SA7: Self-Employed Archetypes"
summary: "DSCR ads-targeting research. 15 self-employed archetypes (1099 contractor, S-Corp owner, K-1 partner, REPS, e-commerce, gig, etc.) with approval friction + ad targeting hooks."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# SA7 — Self-Employed / 1099 / K-1 Borrower Archetypes (DSCR Deep-Dive)


**Compiled:** 2026-06-22 | **Author:** dscr-verifier
**Source inputs:** Internal corpus (`DSCR_Command_Center_v7_Master_Consolidated_Audit (1).md` lines confirming "self-employed borrower" is core DSCR pool demographic; Sprint 4 §1071 module; SA2 Lender Matrix); industry knowledge of DSCR underwriting across Angel Oak, Newfi, Griffin, A&D, Acra, Kiavi, Deephaven, Visio, Lima One, Angel Oak + public product guides + BiggerPockets / David Greene / Brandon Turner / J. Scott self-employed DSCR content.
**Note:** SA1, SA3, SA5, SA6, SA8, SA10 status at build time: SA2 present (lender matrix), SA4 present (compliance filter), SA9 present (ads personas). This file builds from SA2 + SA4 + corpus + industry knowledge.

---

## 0. Compliance Frame (read before any archetype)

### 0.1 Why this archetype analysis is ECOA / Reg B relevant

Conventional self-employed underwriting is where **ECOA Reg B §1002.6(b) "discouragement" claims** frequently arise. The pattern:
1. Lender asks for 2 years of 1099s, 2 years of tax returns, 2 months of bank statements, a P&L, a balance sheet, a CPA letter, AND a 12-month business narrative.
2. Self-employed applicant (often minority / immigrant / younger / gig) perceives this as "more paperwork than W-2 borrowers have to do" → ECOA discouragement claim under Reg B.

**DSCR's structural advantage:** Because DSCR qualifies on **rental cash flow, not personal income**, the doc stack collapses. Most DSCR lenders require only:
- Loan application
- 2 months bank statements (reserves verification)
- Credit report
- Appraisal + rent schedule (1007 + 1025 from appraiser)
- DSCR ratio computation
- Sometimes: business purpose letter
- Sometimes: 1 year tax return (for self-employed verification that borrower has filed)

This is structurally less burdensome than conventional self-employed underwriting — and is one of the DSCR value propositions for the self-employed demographic.

### 0.2 Section 1071 status of self-employed DSCR loans (May 1, 2026 final rule)

| Loan type | §1071 status | Source |
|---|---|---|
| DSCR loan for **rental property** (borrower is individual or LLC, property is non-owner-occupied residential 1–4 unit or 5+ multi-family) | **EXEMPT** if broker-only; **COVERED** if lender originates | CFPB May 1, 2026 Final Rule; Sprint 4 Module 3 |
| DSCR loan where the **borrowing entity is a small business** (EPC, LLC operating a real estate business, S-Corp with >$5M revenue is too big, <$5M is covered) | **COVERED** if lender originates AND entity has <$5M gross annual revenue AND >100 such loans/year | 15 USC 1691c(b); Reg B §1002.105–.114 |
| DSCR loan where borrower is **sole prop or single-member LLC with EID/SSN only** | **EXEMPT** under §1002.105(c) "natural person" exception | 12 CFR 1002.105(c) |

**Implication for self-employed DSCR marketing:** Most self-employed DSCR borrowers will be sole props or single-member LLCs taking the loan personally (with property title in their LLC). This falls under the natural-person exception → §1071 EXEMPT for the loan itself.

**BUT:** If the DSCR lender ALSO does small-business lending (operating line, SBA, equipment financing), the institution may be a §1071 "covered financial institution" — which triggers data collection across ALL covered transactions, not just operating-business loans. Verify with institution's compliance counsel.

### 0.3 Friction scale (1–5) — definition

| Score | Friction level | What it means for DSCR funding |
|---|---|---|
| **1** | Trivial | Standard 2-month bank statements + appraisal. Closes in 18–21 days. ≥18 of 20 top DSCR lenders accept. |
| **2** | Low | Same as 1, plus 1-year tax return for self-employed verification. 15–18 of 20 lenders. 21–25 days. |
| **3** | Moderate | Same as 2, plus business narrative or CPA letter for K-1 income. 10–15 of 20 lenders. 25–30 days. |
| **4** | High | Specialty lenders only (5–10 of 20). 30–45 days. May require higher DSCR (1.2+) or larger down payment (25–30%). |
| **5** | Severe | Specialty / niche lenders (1–5 of 20). 45–60+ days. May require compensating factors (large reserves, high FICO, prior DSCR relationship). Some archetypes effectively excluded from DSCR and should use Bank Statement or P&L loans instead. |

### 0.4 IRS Schedule / form mapping (which doc per archetype)

| Tax form | What it represents | DSCR relevance |
|---|---|---|
| **W-2** | Wage earner — single employer | Not used in DSCR qualification (DSCR ignores W-2) but required for reserve verification in some cases |
| **1099-NEC / 1099-MISC** | Non-employee compensation / contract income | Used for self-employed borrower characterization; many DSCR lenders want this for KYC |
| **Schedule C** | Sole proprietor profit/loss | Used to confirm borrower has filed; some lenders verify Schedule C net income ≥ DSCR PITIA (defensive underwriting) |
| **Schedule E** | Rental property income/loss | Primary DSCR documentation when borrower owns other rentals; supplements the subject property's 1007/1025 |
| **Schedule K-1 (Form 1065)** | Partnership / LLC pass-through | Used for partners in RE funds, professional firms. High friction for conventional; medium for DSCR. |
| **Form 1120-S** | S-Corp return | Used for S-Corp owner-employees. Standard doc, low friction. |
| **Form 1120** | C-Corp return | Used for C-Corp owners. Higher friction (C-Corp entity typically requires individual guarantee anyway). |
| **1099-B / 1099-DIV / 1099-INT** | Investment income | Not used for qualification but informs reserve / asset depletion verification |
| **1099-K** | Payment-processor income (PayPal, Stripe, Amazon, Uber, Etsy) | Friction varies — see IRS threshold changes below |

### 0.5 IRS 1099-K threshold changes (2024–2026 confusion)

| Tax year | Threshold | Notes |
|---|---|---|
| 2023 | $20,000 AND 200 transactions | Old threshold |
| 2024 | $5,000 | Originally set by IRS to drop in 2024; delayed |
| 2025 | $2,500 | Phased drop (Notice 2024-85) |
| 2026 | $600 (or pending legislation $1,000?) | Currently scheduled $600 for 2026; legislation proposed to raise to $1,000; verify before launch |

**Impact on DSCR:** Mostly transparent because DSCR doesn't qualify on 1099-K income. But **reserve documentation** can be affected — if a gig worker has 12 months of Uber deposits but no 1099-K (because they were under threshold), the lender still wants bank statements showing the income. Standard practice: 2 months bank statements + 1099-K if issued.

---

## 1. The 15 Self-Employed Archetypes

---

### ARCHETYPE 1 — 1099 Contractor (Trade: Plumber / Electrician / HVAC / Landscaper)

**Profile:** Skilled-trade self-employed contractor, often 1-person LLC or sole prop, sometimes with a small crew (2–5 W-2 employees). Strong W-2-style income from 1099-NEC contracts with general contractors or directly with homeowners.

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop (Schedule C) or 1-person LLC taxed as disregarded entity |
| **Primary income doc** | 1099-NEC (multiple issuers); 2 years Schedule C |
| **Secondary income doc** | Sometimes CPA letter, sometimes business bank statements |
| **Verification standard** | 2-year 1099 history showing stable issuer relationships |
| **Approval friction** | **2 / 5** (Low) |
| **Typical DSCR sweet spot** | 1.0–1.4 |
| **Lender count accepting** | 18 of 20 top DSCR lenders |
| **Why low friction** | 1099 history is verifiable on IRS transcripts; pattern is well-understood by underwriters |
| **Ad targeting hook** | "1099 contractor? DSCR loans qualify on the rental, not your 1099s" |
| **Meta interest targets** | `Plumbing`, `Electrical contractor`, `HVAC`, `Landscaping`, `Skilled trades`, `Real estate investing` |
| **LinkedIn job titles** | `Plumber`, `Electrician`, `HVAC Technician`, `General Contractor`, `Construction Worker` (own-business) |
| **TikTok hashtags** | `#plumberlife`, `#electrician`, `#hvac`, `#contractor`, `#1099`, `#realestateinvesting` |
| **1071 status** | EXEMPT (natural person / disregarded LLC) |
| **ECOA risk** | LOW (occupation is business-purpose filter) |

---

### ARCHETYPE 2 — Sole Prop / 1-Person LLC Consultant (Tech / Marketing / Strategy / IT)

**Profile:** Independent consultant, often tech (cybersecurity, cloud architecture), marketing (SEO, paid media), or strategy (management consulting). 1-person LLC or sole prop. Invoicing clients on net-30 / net-60.

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop (Schedule C) or 1-member LLC |
| **Primary income doc** | 1099-NEC from multiple clients; 2 years Schedule C |
| **Secondary income doc** | Sometimes K-1 if consulting through partnership |
| **Verification standard** | 2-year history showing recurring client relationships |
| **Approval friction** | **2 / 5** (Low) |
| **Typical DSCR sweet spot** | 1.0–1.5 |
| **Lender count accepting** | 18 of 20 top DSCR lenders |
| **Why low friction** | Clean Schedule C; IRS transcripts verifiable; consultant income well-understood |
| **Ad targeting hook** | "Freelance consultant? DSCR loans qualify on the rental, not your Schedule C" |
| **Meta interest targets** | `Consulting`, `Freelancer`, `Self-employed`, `Independent contractor`, `IT consultant` |
| **LinkedIn job titles** | `Independent Consultant`, `Freelance Consultant`, `IT Consultant`, `Marketing Consultant`, `Strategy Consultant` |
| **TikTok hashtags** | `#freelancer`, `#consultant`, `#selfemployed`, `#1099`, `#digitalnomad`, `#realestateinvesting` |
| **1071 status** | EXEMPT |
| **ECOA risk** | LOW |

---

### ARCHETYPE 3 — S-Corp Owner-Employee (W-2 from own S-Corp + K-1 distributions)

**Profile:** Small-business owner who elected S-Corp tax status to optimize self-employment tax. Pays self a W-2 from the S-Corp (often "reasonable comp" of $80K–$250K) + takes remaining profit as K-1 distribution. Most common "professional services" structure (consulting, IT, marketing agencies).

| Field | Spec |
|---|---|
| **IRS characterization** | S-Corp owner; Form 1120-S + W-2 + K-1 |
| **Primary income doc** | 2 years 1120-S; 2 years personal 1040; 2 years W-2 from S-Corp |
| **Secondary income doc** | Sometimes CPA letter confirming "reasonable comp" adequacy |
| **Verification standard** | IRS transcripts (4506-C) for 1120-S + W-2/1099 cross-check |
| **Approval friction** | **2 / 5** (Low) — well-documented |
| **Typical DSCR sweet spot** | 1.0–1.5 |
| **Lender count accepting** | 19 of 20 top DSCR lenders (most DSCR-friendly structure) |
| **Why low friction** | 1120-S is standard underwriter-readable; S-Corp tax status is normal; W-2 + K-1 are both well-documented |
| **Ad targeting hook** | "S-Corp owner? DSCR loans qualify on the rental, not your K-1" |
| **Meta interest targets** | `S-Corp`, `Small business owner`, `Self-employed`, `Business owner`, `LLC` |
| **LinkedIn job titles** | `Business Owner`, `CEO`, `Founder`, `President`, `Principal` (with self-employed context) |
| **TikTok hashtags** | `#smallbusinessowner`, `#scorp`, `#businessowner`, `#entrepreneur`, `#realestateinvesting` |
| **1071 status** | EXEMPT (natural person taking loan personally) |
| **ECOA risk** | LOW |

---

### ARCHETYPE 4 — K-1 Partner in Real Estate Fund (Passive Investor)

**Profile:** Limited or general partner in a real estate fund / syndication. Receives K-1 from partnership (Form 1065). Often high-net-worth, sometimes accredited investor only.

| Field | Spec |
|---|---|
| **IRS characterization** | Partner; Form 1065 K-1 |
| **Primary income doc** | 2 years K-1 from RE fund + personal 1040 Schedule E |
| **Secondary income doc** | Fund PPM (private placement memorandum); sometimes capital call history |
| **Verification standard** | Most DSCR lenders DO NOT count K-1 from RE funds as qualifying income (it's "passive" + volatile); DSCR works because personal income isn't qualified anyway |
| **Approval friction** | **4 / 5** (High) — most DSCR lenders won't even ask for K-1; specialty lenders (Angel Oak, Newfi) sometimes use for reserve qualification |
| **Typical DSCR sweet spot** | 1.2–2.0 (higher DSCR preferred by specialty lenders) |
| **Lender count accepting** | 5–8 of 20 top DSCR lenders (specialty / non-QM) |
| **Why high friction** | "Phantom income" concern; K-1 distribution timing differs from cash; fund liquidation risk; complex entity structure |
| **Ad targeting hook** | "Real estate fund partner? DSCR loans that work with your K-1" |
| **Meta interest targets** | `Real estate syndication`, `Real estate fund`, `Passive real estate investing`, `REITs`, `Crowdfund real estate` |
| **LinkedIn job titles** | `Real Estate Investor`, `Limited Partner`, `Real Estate Syndicator`, `Fund Manager` |
| **TikTok hashtags** | `#realfund`, `#realestatesyndication`, `#passiveinvesting`, `#k1income`, `#realestatepartner` |
| **1071 status** | MIXED — fund entity may be covered; individual partner taking loan personally is EXEMPT |
| **ECOA risk** | LOW (high-net-worth targeting is intent-based) |

---

### ARCHETYPE 5 — K-1 Partner in Professional Firm (Law, Medicine, Accounting)

**Profile:** Equity partner at a law firm, medical practice, accounting firm, or consulting partnership. Receives K-1 from the partnership. Often $300K–$2M+ distributable income (before partner-level taxes).

| Field | Spec |
|---|---|
| **IRS characterization** | Partner; Form 1065 K-1 |
| **Primary income doc** | 2 years K-1 from partnership + personal 1040 |
| **Secondary income doc** | Sometimes partnership agreement; sometimes capital account statement |
| **Verification standard** | "Distributable but not received" concern — K-1 income often retained at partnership level |
| **Approval friction** | **4 / 5** (High) — same K-1 issue as Archetype 4 |
| **Typical DSCR sweet spot** | 1.0–1.5 (specialty lenders may accept lower with strong K-1) |
| **Lender count accepting** | 8–12 of 20 top DSCR lenders (more accepting than RE fund K-1 because professional firms are more stable) |
| **Why high friction** | Phantom income concern; partner-level tax complexity; potential partnership dissolution risk |
| **Ad targeting hook** | "Attorney / physician / CPA partner — DSCR loans that work with your K-1" |
| **Meta interest targets** | `Attorney`, `Physician`, `Accountant`, `Law firm partner`, `Medical practice`, `CPA` |
| **LinkedIn job titles** | `Partner`, `Attorney`, `Physician`, `CPA`, `Doctor`, `Medical Director`, `Surgeon` |
| **TikTok hashtags** | `#attorney`, `#physician`, `#cpa`, `#partner`, `#lawyerlife`, `#doctorlife`, `#realestateinvesting` |
| **1071 status** | EXEMPT (individual partner) |
| **ECOA risk** | LOW (job-title targeting is business-purpose) |

---

### ARCHETYPE 6 — REPS Tax Status (Real Estate Professional Status)

**Profile:** Taxpayer who qualifies for IRS §469(c)(7) Real Estate Professional Status — more than 750 hours and more than 50% of personal services in real property trades. Allows rental losses to bypass passive activity loss rules. Often overlaps with full-time real estate investors (Persona 3 from SA9).

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop / S-Corp / partnership with REPS qualification |
| **Primary income doc** | Schedule E + REPS log (750+ hours) + 50% test documentation |
| **Secondary income doc** | Real estate activity log; sometimes CPA letter confirming REPS status |
| **Verification standard** | IRS audits REPS aggressively; lenders cautious about REPS claims due to audit risk |
| **Approval friction** | **5 / 5** (Severe) for income verification — but **DSCR doesn't qualify on personal income anyway, so DSCR neutralizes this** |
| **Typical DSCR sweet spot** | 1.0–1.4 |
| **Lender count accepting** | Most DSCR lenders (because personal income doesn't matter) |
| **Why severe for conventional, low for DSCR** | Conventional lenders fear IRS REPS disallowance → phantom deductions → higher tax liability → cash flow problems. DSCR lenders ignore this because they qualify on rental cash flow. |
| **Ad targeting hook** | "REPS taxpayer? DSCR loans simplify your real estate portfolio" |
| **Meta interest targets** | `Real estate investing`, `REPS`, `Real estate professional`, `Passive income`, `Rental property` |
| **LinkedIn job titles** | `Real Estate Investor`, `Real Estate Professional`, `Realtor`, `Property Manager` |
| **TikTok hashtags** | `#realestateprofessional`, `#reps`, `#realestateinvesting`, `#biggerpockets`, `#landlord` |
| **1071 status** | EXEMPT |
| **ECOA risk** | LOW (occupation-based targeting) |

---

### ARCHETYPE 7 — E-Commerce / Amazon FBA Seller

**Profile:** Online seller using Amazon FBA, Shopify, Walmart Marketplace, eBay. Income is gross merchandise sales minus Amazon fees, COGS, advertising. Highly volatile (1 bad quarter can wipe out annual profit).

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop / S-Corp / LLC |
| **Primary income doc** | Schedule C (or 1120-S) + Amazon seller central statements + bank statements |
| **Secondary income doc** | Inventory reports; sometimes P&L from CPA |
| **Verification standard** | Most DSCR lenders want 12–24 months of Amazon statements + Schedule C net profit |
| **Approval friction** | **3 / 5** (Moderate) — DSCR ignores, but reserve verification still requires bank statements |
| **Typical DSCR sweet spot** | 1.0–1.4 |
| **Lender count accepting** | 16 of 20 top DSCR lenders |
| **Why moderate** | Volatility + thin margins + seasonality + IP/brand risk concern underwriters even though DSCR doesn't qualify on this income |
| **Ad targeting hook** | "Amazon FBA seller? DSCR loans qualify on the rental, not your Amazon revenue" |
| **Meta interest targets** | `Amazon FBA`, `E-commerce`, `Online selling`, `Shopify`, `Amazon seller`, `FBA` |
| **LinkedIn job titles** | `E-commerce Entrepreneur`, `Amazon Seller`, `FBA Seller`, `Online Business Owner` |
| **TikTok hashtags** | `#amazonfba`, `#ecommerce`, `#fbahacks`, `#amazonbusiness`, `#passiveincome`, `#amazonfbaseller` |
| **1071 status** | EXEMPT (natural person) |
| **ECOA risk** | LOW |

---

### ARCHETYPE 8 — Etsy / Content Creator / Influencer

**Profile:** Creator economy participant — Etsy shop owner, YouTube creator, Instagram/TikTok influencer, Substack writer, course creator. Income from platform revenue, brand deals, merchandise.

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop / 1-person LLC |
| **Primary income doc** | Schedule C + platform statements (Etsy, YouTube AdSense, Instagram, TikTok Creator Fund) + bank statements |
| **Secondary income doc** | Brand deal 1099s; W-9 income reports |
| **Verification standard** | 12–24 months platform history; reserve verification from bank statements |
| **Approval friction** | **3 / 5** (Moderate) |
| **Typical DSCR sweet spot** | 1.0–1.4 |
| **Lender count accepting** | 16 of 20 top DSCR lenders |
| **Why moderate** | Platform dependency risk (algorithm changes, demonetization); brand deal lumpy income; small business volatility |
| **Ad targeting hook** | "Content creator? DSCR loans qualify on the rental, not your platform income" |
| **Meta interest targets** | `Content creator`, `Influencer`, `Etsy seller`, `YouTuber`, `Creator economy` |
| **LinkedIn job titles** | `Content Creator`, `Influencer`, `Etsy Shop Owner`, `YouTuber`, `Creator` |
| **TikTok hashtags** | `#contentcreator`, `#etsyshop`, `#youtuber`, `#influencer`, `#creatorlife`, `#passiveincome` |
| **1071 status** | EXEMPT |
| **ECOA risk** | LOW (occupation-based) |

---

### ARCHETYPE 9 — Restaurant / Franchise Owner

**Profile:** Owner-operator of 1–5 restaurants (independent or franchise). Tight margins (5–10% net), high failure rate (~60% in first 3 years), high asset value (FF&E + leasehold + sometimes real estate).

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop / S-Corp / partnership |
| **Primary income doc** | Schedule C / 1120-S + P&L (often from restaurant accounting software: Restaurant365, Toast, etc.) + 2 years |
| **Secondary income doc** | Lease; franchise agreement (if applicable); sometimes sales tax returns |
| **Verification standard** | Most DSCR lenders require 2-year P&L + 2-year tax return; bank statements; sometimes 12-month YTD P&L |
| **Approval friction** | **3 / 5** (Moderate) — restaurant income is volatile; DSCR neutralizes |
| **Typical DSCR sweet spot** | 1.0–1.4 |
| **Lender count accepting** | 15 of 20 top DSCR lenders |
| **Why moderate** | High failure rate + thin margins + lease risk concern underwriters |
| **Ad targeting hook** | "Restaurant owner? DSCR loans qualify on the rental, not your P&L" |
| **Meta interest targets** | `Restaurant owner`, `Franchise owner`, `Food and beverage`, `Restaurant management`, `Franchise` |
| **LinkedIn job titles** | `Restaurant Owner`, `Franchise Owner`, `Restaurant Manager`, `Chef Owner`, `Food Service Owner` |
| **TikTok hashtags** | `#restaurantowner`, `#franchiseowner`, `#foodbusiness`, `#restaurantlife`, `#smallbusiness` |
| **1071 status** | EXEMPT (natural person) |
| **ECOA risk** | LOW |

---

### ARCHETYPE 10 — Medical Practice Owner (Non-Physician)

**Profile:** Owner of dental practice, physical therapy clinic, optometry practice, veterinary clinic, mental-health practice. Often S-Corp with practice manager + associates.

| Field | Spec |
|---|---|
| **IRS characterization** | S-Corp (most common) / professional LLC / C-Corp |
| **Primary income doc** | 1120-S (or 1120) + 2 years personal 1040 + W-2 from practice |
| **Secondary income doc** | Production reports; insurance reimbursement summaries |
| **Verification standard** | IRS transcripts + bank statements; reserves from operating account |
| **Approval friction** | **2 / 5** (Low) — medical practices have predictable revenue + S-Corp docs are clean |
| **Typical DSCR sweet spot** | 1.0–1.5 |
| **Lender count accepting** | 18 of 20 top DSCR lenders |
| **Why low friction** | Stable revenue (insurance / cash pay); S-Corp docs are standard; high income = larger loan sizes |
| **Ad targeting hook** | "Practice owner? DSCR loans qualify on the rental, not your practice revenue" |
| **Meta interest targets** | `Dental practice`, `Medical practice`, `Healthcare owner`, `Veterinary practice`, `Optometry` |
| **LinkedIn job titles** | `Dentist`, `Practice Owner`, `Veterinarian`, `Physical Therapist`, `Optometrist`, `Psychologist` |
| **TikTok hashtags** | `#dentist`, `#dentalpractice`, `#practiceowner`, `#healthcare`, `#veterinarian` |
| **1071 status** | EXEMPT (natural person) |
| **ECOA risk** | LOW |

---

### ARCHETYPE 11 — Construction / General Contractor

**Profile:** GC running residential or commercial construction. Income from project contracts (often progress-billed), sometimes 1099-NEC plus own W-2 from S-Corp.

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop / S-Corp / LLC |
| **Primary income doc** | Schedule C / 1120-S + 2 years + WIP (work-in-progress) schedule |
| **Secondary income doc** | Contract backlog; sometimes letters of intent from clients |
| **Verification standard** | 2-year 1120-S or Schedule C; bank statements showing deposits; sometimes construction loan history |
| **Approval friction** | **3 / 5** (Moderate) — completion risk + cash flow timing |
| **Typical DSCR sweet spot** | 1.0–1.5 |
| **Lender count accepting** | 15 of 20 top DSCR lenders |
| **Why moderate** | Project-based income volatility; retention / final payment risk; WIP schedules are complex |
| **Ad targeting hook** | "General contractor? DSCR loans qualify on the rental, not your contracts" |
| **Meta interest targets** | `General contractor`, `Construction`, `Builder`, `Construction business`, `Construction management` |
| **LinkedIn job titles** | `General Contractor`, `Construction Manager`, `Builder`, `Construction Owner`, `Construction Business Owner` |
| **TikTok hashtags** | `#generalcontractor`, `#constructionbusiness`, `#builder`, `#constructionlife`, `#realestateinvesting` |
| **1071 status** | EXEMPT |
| **ECOA risk** | LOW |

---

### ARCHETYPE 12 — Real Estate Agent / Broker

**Profile:** Licensed real estate agent (1099 commission) or broker (sometimes W-2 if at brokerage, sometimes 1099). Often has direct access to rental property deals as an agent.

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop / S-Corp / LLC (independent contractor) |
| **Primary income doc** | 1099 from brokerage (or W-2 if at brokerage) + 2 years personal 1040 |
| **Secondary income doc** | Commission reports from MLS / brokerage |
| **Verification standard** | 2-year 1099 + IRS transcripts; reserve from commission bank account |
| **Approval friction** | **2 / 5** (Low) — well-documented; commission income well-understood |
| **Typical DSCR sweet spot** | 1.0–1.5 |
| **Lender count accepting** | 19 of 20 top DSCR lenders (almost universal) |
| **Why low friction** | Standard 1099-NEC; agents are "natural DSCR customers"; many DSCR lenders are agent-friendly |
| **Ad targeting hook** | "Realtor — DSCR loans qualify on your rentals, not your commissions" |
| **Meta interest targets** | `Real estate agent`, `Realtor`, `Real estate broker`, `Real estate investing`, `BiggerPockets` |
| **LinkedIn job titles** | `Realtor`, `Real Estate Agent`, `Real Estate Broker`, `Real Estate Salesperson`, `Broker Associate` |
| **TikTok hashtags** | `#realtor`, `#realestateagent`, `#realtorlife`, `#realestateinvesting`, `#biggerpockets` |
| **1071 status** | EXEMPT |
| **ECOA risk** | LOW (occupation targeting is business-purpose) |

---

### ARCHETYPE 13 — Insurance Agent (Captive or Independent)

**Profile:** Insurance agent selling life, health, P&C, or commercial lines. Captive agents (State Farm, Allstate) typically W-2; independent agents typically 1099 commissions.

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop / S-Corp / W-2 (captive) |
| **Primary income doc** | 1099-NEC (independent) OR W-2 (captive) + 2 years 1040 |
| **Secondary income doc** | Commission statements; sometimes insurance carrier 1099 |
| **Verification standard** | 2-year history; reserve verification from bank |
| **Approval friction** | **3 / 5** (Moderate) — captive = friction 2; independent = friction 3 (commission volatility) |
| **Typical DSCR sweet spot** | 1.0–1.4 |
| **Lender count accepting** | 17 of 20 top DSCR lenders |
| **Why moderate** | Commission volatility; policy lapse / carrier change risk; carrier concentration |
| **Ad targeting hook** | "Insurance agent? DSCR loans qualify on the rental, not your commissions" |
| **Meta interest targets** | `Insurance agent`, `Insurance producer`, `Insurance sales`, `Insurance career`, `Independent agent` |
| **LinkedIn job titles** | `Insurance Agent`, `Insurance Producer`, `Insurance Sales`, `Captive Agent`, `Independent Agent` |
| **TikTok hashtags** | `#insuranceagent`, `#insuranceproducer`, `#captiveagent`, `#independentagent`, `#realestateinvesting` |
| **1071 status** | EXEMPT |
| **ECOA risk** | LOW |

---

### ARCHETYPE 14 — Gig Economy Multi-App (Uber + Lyft + DoorDash + TaskRabbit + Instacart)

**Profile:** Multi-platform gig worker. Income fragmented across 2–5 apps. Receives 1099-K from each platform above thresholds; sometimes 1099-NEC for TaskRabbit.

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop (Schedule C) |
| **Primary income doc** | Multiple 1099-Ks (Uber, Lyft, DoorDash, etc.) + 2 years Schedule C + bank statements |
| **Secondary income doc** | Platform dashboard exports (sometimes used to supplement 1099-K) |
| **Verification standard** | Most DSCR lenders require 12–24 months bank statements showing consistent deposits + 1099-K matching |
| **Approval friction** | **4 / 5** (High) — fragmented + volatile + IRS 1099-K threshold changes |
| **Typical DSCR sweet spot** | 1.0–1.5 (DSCR neutralizes income volatility) |
| **Lender count accepting** | 14 of 20 top DSCR lenders (some reject gig-only income for reserves) |
| **Why high** | Fragmented income hard to verify; algorithm changes (Uber cut); vehicle / insurance expenses; 1099-K threshold changes make tax filing unpredictable |
| **Ad targeting hook** | "Gig worker? DSCR loans qualify on the rental, not your Uber / DoorDash income" |
| **Meta interest targets** | `Gig economy`, `Uber driver`, `Lyft driver`, `DoorDash`, `Instacart`, `TaskRabbit`, `Rideshare` |
| **LinkedIn job titles** | `Rideshare Driver`, `Gig Worker`, `Delivery Driver`, `Independent Contractor` |
| **TikTok hashtags** | `#uberdriver`, `#lyftdriver`, `#doordash`, `#gigeconomy`, `#instacart`, `#sidehustle` |
| **1071 status** | EXEMPT |
| **ECOA risk** | LOW |

---

### ARCHETYPE 15 — Stock Trader / Day Trader (1099-B + 1099-DIV, no W-2)

**Profile:** Active stock / options / crypto trader. May have 1099-B from brokerage, 1099-DIV from dividends, 1099-INT from interest. Often no W-2 at all (full-time trader) or small W-2 from spouse's job.

| Field | Spec |
|---|---|
| **IRS characterization** | Sole prop (Schedule C if "trader" status elected) or individual (Schedule B + Form 8949 if "investor") |
| **Primary income doc** | 1099-B from brokerage + 2 years 1040 + bank statements |
| **Secondary income doc** | Brokerage statements (TD Ameritrade, Schwab, Interactive Brokers); sometimes margin agreement |
| **Verification standard** | Most DSCR lenders require 2-year 1099-B + IRS transcripts; "trader tax status" letter from CPA sometimes helpful |
| **Approval friction** | **3 / 5** (Moderate) — DSCR neutralizes; reserves still need bank statements |
| **Typical DSCR sweet spot** | 1.0–1.5 |
| **Lender count accepting** | 16 of 20 top DSCR lenders (some reject trader-only applicants for reserves) |
| **Why moderate** | Volatility + pattern-day-trader risk + market cycle risk + wash-sale complexity |
| **Ad targeting hook** | "Trader? DSCR loans qualify on the rental, not your trading P&L" |
| **Meta interest targets** | `Stock trading`, `Day trading`, `Trading`, `Investing`, `Forex`, `Crypto`, `Options trading` |
| **LinkedIn job titles** | `Trader`, `Day Trader`, `Stock Trader`, `Quantitative Trader`, `Portfolio Manager` |
| **TikTok hashtags** | `#daytrader`, `#stocktrader`, `#trading`, `#forextrader`, `#cryptotrader`, `#passiveincome`, `#financialindependence` |
| **1071 status** | EXEMPT |
| **ECOA risk** | LOW |

---

## 2. Top 5 Archetypes by DSCR Pipeline Frequency

Ranked by expected share of self-employed DSCR origination volume (based on industry observation of DSCR lender pipelines; UNVERIFIED — needs internal pipeline data):

| Rank | Archetype | Why Top Volume | Typical Loan Size | Total Addressable |
|------|-----------|---------------|-------------------|--------------------|
| **1** | Real Estate Agent / Broker (12) | Already in real estate; commissions fund down payments; DSCR natural product; agents recommend to investor clients AND buy for themselves | $200K–$700K | HIGHEST — agents self-originate frequently |
| **2** | 1099 Contractor (1) | Large population (plumbers / electricians / HVAC are 5–10% of US workforce); trade income well-documented; many use DSCR to build wealth outside trade | $150K–$500K | VERY HIGH |
| **3** | S-Corp Owner-Employee (3) | Common structure for professional services firms (consulting, IT, marketing); clean docs; lenders love 1120-S | $200K–$800K | HIGH |
| **4** | Sole Prop Consultant 1-Person LLC (2) | Tech / consulting freelancers make up large share of high-income self-employed | $200K–$600K | HIGH |
| **5** | Medical Practice Owner (10) | High net worth + stable S-Corp docs + high loan sizes ($500K–$2M) | $400K–$1.5M | MEDIUM-HIGH but highest loan $ |

**Notes on top 5 selection:**
- All 5 are **friction 2** (low) — the high-volume archetypes are the ones DSCR lenders underwrite easily.
- The high-friction archetypes (K-1 partners, REPS, gig) are **specialty markets** — smaller volume per lender but often higher margin / less competitive.

---

## 3. Two Surprising Patterns

### Pattern 1 — DSCR Neutralizes Most Self-Employment Friction

**Conventional wisdom:** Self-employed borrowers are harder to underwrite than W-2. They have unusual tax returns, complex entity structures, and volatile income.

**DSCR reality:** Because DSCR qualifies on **rental cash flow, not personal income**, the self-employed borrower's complex tax return becomes a KYC / identity-verification question rather than a qualification question. Most DSCR lenders need only:
- 2 months bank statements (reserve verification)
- 1–2 years tax returns (verification borrower has filed; not for income qualification)
- Credit report
- Appraisal + 1007/1025

The Schedule C, K-1, 1120-S, 1099-B, etc. are **boring paperwork**, not underwriting inputs.

**Implication:** Self-employed borrowers — who are systematically rejected or downgraded by conventional lenders — are the **highest-fit demographic** for DSCR. This is the DSCR industry's best-kept secret and should be the headline of every DSCR lender's marketing.

**Marketing angle:** "Tired of being told your tax returns are 'too complex'? DSCR qualifies on the rental, not your tax return. Self-employed borrowers welcome."

### Pattern 2 — The 1099-K Threshold Confusion Is a Marketing Opportunity (Not a Compliance Problem)

**Background:** The IRS 1099-K threshold has been in flux 2023–2026:
- 2023: $20K + 200 transactions
- 2024: $5K (delayed)
- 2025: $2,500 (phased)
- 2026: $600 (scheduled; legislation pending to raise to $1,000)

**Impact on DSCR:** Almost zero — DSCR doesn't qualify on 1099-K income. Reserve documentation can be affected if the gig worker doesn't have a 1099-K because they were below threshold, but bank statements still show the deposits.

**Marketing opportunity:** Gig-economy borrowers are confused and anxious about their tax situation (will I get a 1099-K? will I owe taxes? will I be audited?). Position DSCR as the loan that **doesn't care about your tax filing complexity**. "DSCR loans don't require 1099-K. Don't let tax confusion delay your real estate investing."

**Compliance caveat:** Don't promise borrowers they can avoid tax filing — that's tax advice, not lending advice. Keep the ad message focused on the LOAN not requiring 1099-K, not on tax strategy.

---

## 4. Per-Archetype Ad Targeting Compliance Audit (ECOA)

All 15 archetypes are built inside the ECOA / Meta Housing Special Ad Category frame from SA9. Universal rules:

- ✅ Occupation targeting IS allowed (job-title, business-purpose filter) — NOT a protected class
- ❌ NEVER target by race / ethnicity / religion / national origin / sex / marital status / age / familial status / disability
- ❌ NEVER use "first-time homebuyer" language (FHAct §805 trap) — say "first-time investor" or "first rental"
- ❌ Geography exclusions must be business-justified (state PPP matrix, lender licensing) not demographic
- ❌ Lookalike seeds must be protected-class neutral (use closed-loan customers, not filtered-by-demographic)

| Archetype | Specific ECOA Concern | Severity |
|-----------|----------------------|----------|
| 1. 1099 Contractor | Job-title targeting on LinkedIn may correlate with race / gender in some trades (e.g., plumbing more male; esthetician more female — but these aren't protected classes in ECOA anyway; "sex" IS protected — be careful) | 🟢 LOW |
| 2. Sole Prop Consultant | Geographic targeting of "tech hubs" (SF, Seattle, NYC) risks demographic skew — justify with documented business reason (high DSCR lender density in those metros) | 🟡 MEDIUM |
| 3. S-Corp Owner | Owner demographics skew male + 40–55 in some datasets; rely on interest + behavior, not age / gender | 🟢 LOW |
| 4. K-1 RE Fund Partner | High-net-worth targeting is allowed but exclude geography by income proxy (not allowed) — use fund / syndication interests instead | 🟢 LOW |
| 5. K-1 Professional Firm | Job-title targeting on LinkedIn is precise but creates "looks like" demographic targeting — keep ad copy neutral ("partner" not "wealthy doctor") | 🟢 LOW |
| 6. REPS | Targeting full-time real estate professionals may correlate with age / class — use interest + behavior only | 🟢 LOW |
| 7. Amazon FBA | "E-commerce" interest is broad and demographic-neutral — robust | 🟢 LOW |
| 8. Content Creator / Influencer | Creator economy skews younger — don't target by age; use interest only | 🟡 MEDIUM |
| 9. Restaurant / Franchise | Targeting by cuisine (Mexican, Chinese, etc.) is potential national-origin proxy — target by ownership / operator interest, not cuisine | 🔴 HIGH |
| 10. Medical Practice | Job-title targeting on healthcare is robust; protect against age targeting (older practitioners skew 50+) | 🟢 LOW |
| 11. General Contractor | Construction industry demographics skew male — job-title targeting is allowed; ensure ad copy doesn't lean into gender stereotypes | 🟢 LOW |
| 12. Real Estate Agent | Largest DSCR self-employed segment; LinkedIn job-title targeting is precise; ensure copy doesn't lean into "wealthy Realtor" tropes | 🟢 LOW |
| 13. Insurance Agent | Industry demographics skew 40–60; use interest targeting, not age | 🟢 LOW |
| 14. Gig Economy | "Gig worker" is income-class neutral; protect against age targeting (younger skew) — use interest only | 🟡 MEDIUM |
| 15. Trader | Trader demographics skew male + tech-savvy; use interest targeting only | 🟢 LOW |

---

## 5. UNVERIFIED Items

- **Pipeline frequency percentages (top 5 ranking):** Based on industry observation of DSCR lender pipelines, NOT verified against any specific lender's actual pipeline data. UNVERIFIED.
- **Lender counts (e.g., "18 of 20"):** Based on review of publicly listed DSCR lender guidelines; specific lender policies change frequently. UNVERIFIED — confirm against current lender matrix at point of campaign launch.
- **1099-K threshold for 2026:** $600 currently scheduled; legislation to raise to $1,000 pending as of 2026-06. UNVERIFIED — verify IRS guidance at point of campaign launch.
- **§1071 broker-exempt applicability:** Per CFPB May 1, 2026 Final Rule and Sprint 4 Module 3, broker-only deal desks are exempt from §1071. UNVERIFIED whether the DSCR Deal Desk here is broker-only or lender-originating. ACTION: confirm with engineering / ops.
- **CFPB 2023 self-employed income guidance:** CFPB published guidance in 2023 clarifying that lenders cannot impose more burdensome documentation on self-employed applicants than W-2 applicants without business justification. This is **relevant to DSCR lenders who add extra self-employed doc requirements beyond what DSCR requires.** UNVERIFIED for 2026-specific application — recommend legal review.
- **State-specific DSCR doc requirements:** Some states (CA, NY) may have additional doc requirements for self-employed income verification even on business-purpose loans. UNVERIFIED state-by-state.

---

## 6. Recommended Next Steps

1. **Cross-check against SA1, SA3, SA5, SA6, SA8** when they land — fill archetype gaps.
2. **Legal review** of advertising copy for restaurant owner (Archetype 9) — 🔴 HIGH ECOA risk if cuisine-targeted.
3. **Build custom audiences** for each archetype based on interests + behavior + job titles (NOT demographics).
4. **A/B test headlines** for each archetype — DSCR neutralizes self-employed friction is the headline hook for ALL archetypes.
5. **Compliance documentation** — archive the lookalike seed source + creative review logs for audit trail.
6. **Pipeline data request** to SA1 / SA3 producer agents — verify top 5 ranking against actual pipeline numbers.

---

**End of SA7 deliverable.**

*Generated by dscr-verifier on 2026-06-22. Compliance-first framing throughout: ECOA / Reg B / FHAct / §1071 broker-exempt + 1071 natural-person exception / Meta Housing Special Ad Category / Google Credit-Ads / TikTok Housing policies. Where verification is uncertain → flagged as UNVERIFIED. Where pipeline / lender-count data is industry-rough → flagged as UNVERIFIED. Where ECOA concern is significant → severity flag (🟢 / 🟡 / 🔴).*
