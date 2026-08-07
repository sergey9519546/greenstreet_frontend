---
type: research
status: drafted
title: "SA9: Ads Platform Personas"
summary: "DSCR ads-targeting research. 12 personas with Meta/Google/LinkedIn/TikTok targeting specs, headlines, primary text, visual direction, ECOA concerns."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# SA9 — Ads-Platform Persona Specs (DSCR Sovereign OS)


**Compiled:** 2026-06-22 | **Author:** dscr-verifier (compliance-first persona producer)
**Source inputs:** Sprint 3 (Lender Intelligence / pool center: WA FICO 752, DSCR 1.19, CLTV 72%) + Sprint 2 (PPP state matrix) + corpus on STR vs LTR + my own knowledge of DSCR borrower archetypes.
**SA1–SA8 inputs:** NOT PRESENT in `_obsidian_vault\_research\ads_targeting\` at time of build. Personas built fresh from corpus + my own knowledge. If SA1–SA8 land later, this file should be cross-checked against them and gaps filled.

---

## 0. Compliance Frame (Read Before ANY Persona)

Every persona below is built within this mandatory frame. Skipping it = ECOA violation + Meta ad rejection + CFPB enforcement risk.

### 0.1 Legal anchors

| Rule | Cite | What it requires for ad targeting |
|---|---|---|
| ECOA | 15 USC 1691 | No discrimination on race, color, religion, national origin, sex, marital status, age (18+/62+ only with actuarial justification), familial status, disability, public-assistance income, exercise of consumer credit rights |
| Regulation B | 12 CFR 1002 | Implements ECOA; 12 CFR 1002.6(b)(1) bans discouragement of applicants on a prohibited basis |
| Fair Housing Act §805 | 42 USC 3605 | Bans discriminatory advertising of residential property (mortgage = "residential" purpose) |
| 2013 HUD Disparate-Impact Rule | 24 CFR 100.500 | 3-part test: (1) disparate effect on protected class, (2) business necessity, (3) less discriminatory alternative? |
| Meta Special Ad Category | Meta Ads Policy | Any credit or housing ad → MUST enable "Housing" special-ad category → disables age, gender, zip-code lookalikes, detailed demographic targeting |
| Google Credit-Ads Policy | Google Ads Policy | Personalized ads for credit → MUST toggle off "Personalized advertising" (EU + CA-style restriction applies in US for credit verticals) [UNVERIFIED - exact 2026 UI label needs primary-source verification] |
| TikTok Housing Policy | TikTok Ads Policy | Mortgage + real-estate ads require pre-approval and prohibit discriminatory targeting [UNVERIFIED — exact 2026 pre-approval mechanism needs primary-source verification] |

### 0.2 Meta "Special Ad Category: Housing" — what it removes

When enabled (REQUIRED for all DSCR ads):
- ❌ Age targeting (no "25–35" range)
- ❌ Gender targeting
- ❌ Zip-code-level geographic targeting (only state/region/DMA)
- ❌ Lookalikes based on Protected-Class-skewed seeds
- ✅ Interest/behaviors targeting (allowed)
- ✅ Broad age window (18–65+ only, can't narrow)
- ✅ Custom audiences from YOUR OWN customer file (allowed if not filtered by protected class)

**This single constraint reshapes every persona below. Every Meta targeting spec is built around it.**

### 0.3 Universal exclusions (apply to EVERY persona)

- No race / ethnicity targeting (already disallowed on Meta for housing ads)
- No religion targeting (disallowed)
- No Spanish-language vs English-language targeting WITHOUT business justification (potential national-origin proxy — needs documented non-discriminatory reason, e.g., "Hispanic homeownership outreach program" with documented mission)
- No "first-time homebuyer" language (proxy for age discrimination under FHAct §805 advertising rules — use "investment-property buyer" instead)
- No zip-code exclusion of majority-minority areas WITHOUT business justification (this is the core redlining trap; document any exclusion with a non-discriminatory reason like "no DSCR lender footprint in this state")
- No "empty nester" or "retired" language that screens by age without actuarial justification

### 0.4 Geography is the #1 disparate-impact risk

CFPB + DOJ have pursued **redlining cases** against lenders using zip-code-based ad targeting. The pattern is:
1. Lender excludes majority-minority zip codes from ad campaigns.
2. Result: protected-class applicants disproportionately unaware of product.
3. Even if intent is neutral ("we just don't lend there yet"), the disparate effect triggers ECOA Reg B §1002.6 + FHAct §805 + 2013 HUD rule.

**Mitigation:** Every geographic restriction in the persona specs below is justified by a documented business reason (state PPP matrix, lender licensing footprint, no DSCR product in that market). Where business justification is weak → flag as 🟡 ECOA concern.

### 0.5 Inferred vs observed targeting

Most DSCR ad targeting is INFERRED (from platform behavior signals, not declared borrower status). Examples:
- "Visited BiggerPockets.com" → interest signal, allowed
- "Watched YouTube video about Airbnb investing" → behavior signal, allowed
- "Lives in zip 90210" → geography signal, allowed but flagged

What you CANNOT do:
- Target by inferred race (Meta doesn't allow; would violate fair housing anyway)
- Target by inferred familial status (e.g., "Parents" interest on housing ads — disallowed)
- Use a custom audience filtered by protected-class attribute

---

## 1. Persona Universe — 12 Specs

Priority order roughly by addressable market size in DSCR space (top of list = highest expected reach × conversion).

---

### PERSONA 1 — "Side-Hustle SFR Landlord" (largest persona)

**Archetype:** W-2 professional who owns 1–3 rental single-family residences (SFR) alongside primary residence. Most common DSCR borrower per industry data.

| Field | Spec |
|---|---|
| **Age band** | 35–55 (Meta Special Ad Category = Housing = no narrow targeting; just 18–65+) |
| **Gender** | Not targeted (Housing Special Ad Category removes this) |
| **Location** | Tier 1 metros with strong rental fundamentals: Phoenix, Dallas, Houston, Atlanta, Tampa, Charlotte, Nashville, Indianapolis, Columbus, Raleigh. Excludes NY/NJ/CA for PPP-restriction reasons (see Sprint 2 §PA, OH matrix + NJ contested LLC rule) |
| **Income** | $90K–$250K W-2 (declared income; not directly targetable, used only for creative framing) |
| **Education** | College-educated (used for creative framing, not targeting) |
| **Occupation** | W-2 professional: nurse, teacher, engineer, IT, accountant, small-business owner |
| **Net worth** | $300K–$2M |
| **FICO band** | 680–760 (matches DSCR sweet spot; not directly targetable on Meta, used for ad copy only) |
| **DSCR target** | 1.0–1.4 |

**Psychographics**
- Pain points: "I can't qualify for a 2nd mortgage because my DTI is too high"; "my primary residence is already a mortgage I want to keep"; "rates dropped but I'm locked at 7%"
- Aspirations: Build generational wealth, replace W-2 income within 10 years, become a "real estate investor"
- Media consumption: BiggerPockets Podcast, Dave Ramsey (Ramsey Show), YouTube (BiggerPockets channel, Graham Stephan, Meet Kevin, Roofstock), local real-estate meetups, Facebook groups ("Real Estate Investing for Beginners")
- News: MarketWatch, BiggerPockets blog, local market reports

**Meta targeting (Special Ad Category: Housing = ON)**
- Interests: `BiggerPockets`, `Real estate investing`, `Investment property`, `Rental property`, `Property management`, `REI club`, `Roofstock`, `Real estate crowdfunding`
- Behaviors: `Small business owners` (broad; not state-specific)
- Lookalike seed: Customer match list of closed DSCR loans (1% lookalike, US only, NOT filtered by geography)
- Custom audience seed: Uploaded list of past closed loans + ZIP-code-skipped Facebook group members

**Google targeting**
- In-market: `Real Estate > Investment Properties`, `Real Estate > Rental Properties`, `Mortgages > Refinancing`
- Affinity: `Real Estate Enthusiasts`, `Home & Garden > Real Estate`
- Customer match: Upload closed-loan list (hashed email)
- Keyword themes: "DSCR loan", "investment property mortgage", "rental property financing", "no income verification mortgage", "DSCR lender near me"

**LinkedIn targeting (limited use)**
- Job titles: `Real Estate Investor`, `Realtor`, `Property Manager`, `Real Estate Broker`
- Skills: `Real Estate Investing`, `Property Management`, `Rental Properties`
- Company size: Self-employed/Solopreneur (1–10) or SMB (11–50)
- Groups: `Real Estate Investing`, `BiggerPockets Network`, `Real Estate Investment Club`
- **ECOA caveat for LinkedIn:** LinkedIn allows job-title + skills targeting that may correlate with demographics. Mitigate by avoiding company-name targeting (which can proxy for class/industry → race proxy).

**TikTok targeting**
- Hashtags: `#realestateinvesting`, `#biggerpockets`, `#rentalproperty`, `#firstrental`, `#airbnbhost`, `#realestatemindset`, `#financialfreedom`
- Creator categories: Personal Finance, Real Estate
- Behaviors: "Has engaged with real-estate investing content in last 30 days"

**Headlines (5 per platform, all ECOA-compliant)**

*Meta (housing ad format)*
1. "Build a rental portfolio without using your W-2 income"
2. "Own your next rental property — DSCR loans from $75K"
3. "Investment property financing that qualifies on rental cash flow, not your paycheck"
4. "Already own a rental? Refi with a DSCR loan and pull equity for the next one"
5. "Closing DSCR loans in 21 days. Licensed in 48 states"

*Google (search ad)*
1. "DSCR Investment Property Loans | Qualify on Rental Income"
2. "No-Income-Verification Rental Loans | Close in 21 Days"
3. "Refinance Your Rental at Today's Rate | DSCR Lender"
4. "Buy Your Next Rental Without Using Personal Income"
5. "Investment Property Mortgage | LLC-Friendly DSCR Loans"

*LinkedIn (single-image sponsored content)*
1. "Realtors: Give your investor clients a DSCR financing option"
2. "Property managers: a faster financing partner for your owners"
3. "Real estate investors — qualify on the property, not your tax return"
4. "Built for DSCR. Built for landlords with 1–100 doors"
5. "DSCR loans for the LLC you already have"

*TikTok (spark ads / in-feed)*
1. "How I bought a rental without using my W-2 income"
2. "DSCR loans explained in 60 seconds"
3. "The fastest way to qualify for an investment property loan"
4. "I qualified on the rent, not my paycheck"
5. "Side-hustle landlords: this loan is built for you"

**Primary text (3 per platform)**

*Meta:*
- "Most landlords we work with have a W-2 job and one to three rentals they're scaling. DSCR loans qualify on the property's rental cash flow — not your tax return. LLC-friendly. 21-day closes. 48-state licensed."
- "Your tax return doesn't show what your rental property earns. We underwrite the property. If the rent covers the mortgage (DSCR ≥ 1.0), you qualify. No W-2, no tax returns, no DTI ratio."
- "Already own a rental and want to buy another? Refi the first one with a DSCR loan, pull cash out, use it as down payment on the next. Most clients use this strategy to scale from 1 door to 5 doors in 24 months."

*Google (responsive search ad descriptions):*
- "DSCR loans qualify on rental income, not your W-2. LLC-friendly. 21-day closes. Licensed in 48 states."
- "Investment property financing that looks at the property, not your tax return. DSCR ≥ 1.0 qualifies. No income docs required."
- "Refinance your rental property and pull equity for the next one. DSCR cash-out loans for 1–4 unit residential rentals."

*LinkedIn (B2B angle):*
- "We work with realtors and property managers to close DSCR loans for their investor clients. Co-marketing available. 21-day closes, LLC-friendly, 48-state licensed."
- "Your investor client lost their W-2 job? DSCR loans don't care. We qualify on the rental cash flow. Send the deal — we'll quote it in 24 hours."
- "Real estate investors: DSCR loans let you scale without showing personal income. Up to 20 financed properties. Portfolio loans available."

*TikTok:*
- "POV: You bought a rental property without showing your tax returns. The rent covers the mortgage. DSCR ≥ 1.0. Done."
- "How landlords with 1–3 rentals scale: DSCR cash-out refi on property 1, use as down payment on property 2. Repeat. Don't touch your W-2."
- "BiggerPockets made you want to be a landlord. DSCR makes you qualify. We're the lender behind 1,000+ investor closes."

**Visual direction**
- Lifestyle: Couple or solo professional (mid-30s to 50s) standing in front of a tidy SFR with a "For Rent" sign in yard; no visible race/skin-tone cues (use neutral lighting, business-casual attire)
- Color palette: Trust-blue (#1E40AF), clean white, accent green (#16A34A) for "approved" badge
- Models: Mixed but unbranded; must NOT have any text overlay suggesting demographics ("young couple", "Hispanic family", "single mom" all prohibited)
- No text on image claiming race/age/family status

**Compliance + audience concern**
- 🟡 **ECOA risk:** Targeting "Homeowners" or "Property owners" interest on Meta Housing ads = allowed, BUT if combined with geography that excludes majority-minority zip codes → redlining risk. Mitigation: geography must be matched to actual lender licensing footprint with documented business reason, not demographic composition.
- 🟢 Reg B compliant: no discouragement language; ad copy invites all qualified applicants.

**CTA + CPL**
- CTA: Lead form (auto-quote tool) preferred — captures DSCR self-quote quickly
- CPL estimate: Meta $45–$80, Google $90–$180, TikTok $35–$60, LinkedIn $130–$220

---

### PERSONA 2 — "STR / Airbnb Operator"

**Archetype:** Hands-on short-term-rental operator running 1–5 STRs in leisure markets. Active host with calendar discipline, dynamic pricing, multi-platform distribution.

| Field | Spec |
|---|---|
| **Age band** | 30–50 (broad Meta window 18–65+ per Housing Special Ad Category) |
| **Gender** | Not targeted |
| **Location** | STR-strong markets: FL (Panama City, Destin, Tampa, Orlando, Key West), TN (Smoky Mountains, Nashville, Gatlinburg), TX (Hill Country, South Padre), NC (Outer Banks, Asheville), SC (Hilton Head, Myrtle), CO (Telluride, Summit County), AZ (Sedona, Flagstaff), CA (desert + Sierra — but state-level PPP issues make this risky) |
| **Income** | $80K–$300K (often dual-income or self-employed STR income) |
| **Education** | College-educated, hospitality or marketing background common |
| **Occupation** | Full-time STR host or hybrid (W-2 + STR side) |
| **Net worth** | $250K–$3M |
| **FICO band** | 660–740 (STR cash flow underwriting is more forgiving) |

**Psychographics**
- Pain points: "My STR income isn't on my W-2 — I can't qualify for a 5th property"; "AirDNA underwrites differently than my lender does"; "rate buy-down window closing"
- Aspirations: Replace W-2 with STR portfolio income, build a "boutique hotel" brand, exit into a management company
- Media consumption: Airbnb Community, STR Prosperity, BiggerPockets (STR channel), Vacation Rental Management Association, AirDNA blog, YouTube (STR Insider, Behind The Host, Coach Carson), Reddit r/AirBnB

**Meta targeting (Housing Special Ad Category: ON)**
- Interests: `Airbnb`, `VRBO`, `Vacation rental`, `Short-term rental`, `AirDNA`, `Evolve`, `Vacasa`, `Vacation rental management`
- Behaviors: `Frequent travelers`, `Small business page admins`
- Lookalike seed: Closed DSCR STR loans (1% lookalike, US-only)
- Custom audience: Website visitors to STR-investor landing pages (last 90 days)

**Google targeting**
- In-market: `Travel > Vacation Rentals`, `Real Estate > Investment Properties`
- Affinity: `Travel > Vacation Rental Hosts`
- Customer match: Past STR-loan customers + AirDNA-co-registered email list (third-party list allowed if explicitly opted in)

**LinkedIn**
- Job titles: `Short-Term Rental Manager`, `Vacation Rental Manager`, `Airbnb Superhost` (when self-reported), `Hospitality Manager`
- Skills: `Property Management`, `Hospitality`, `Revenue Management`

**TikTok**
- Hashtags: `#airbnbhost`, `#airbnb`, `#vrbo`, `#shorttermrental`, `#str`, `#airbnbinvestment`, `#airbnbsuccess`, `#passiveincome`
- Creator categories: Travel, Real Estate, Personal Finance
- Behaviors: Engaged with #airbnbhost content in last 30 days

**Headlines (5 per platform)**

*Meta:*
1. "STR financing that uses AirDNA, not your W-2"
2. "Buy your next short-term rental — DSCR STR loans from $100K"
3. "Airbnb host? Qualify for your next property on rental cash flow"
4. "STR portfolio loans — up to 10 financed properties"
5. "Refinance your STR at today's rate — cash out for the next one"

*Google:*
1. "DSCR STR Loans | Underwrite on AirDNA + Rental Income"
2. "Airbnb Financing | No W-2 Required"
3. "Short-Term Rental Mortgage | 21-Day Close"
4. "Refinance Your STR | DSCR Cash-Out Loans"
5. "STR Portfolio Loans | Up to 10 Financed Doors"

*LinkedIn:*
1. "STR managers: financing partner for your owner clients"
2. "Airbnb superhosts — qualify for your next property without W-2"
3. "Vacation rental investors: DSCR STR loans built for your market"
4. "AirDNA-qualified DSCR loans. 48-state licensed."
5. "STR portfolio builder? We finance 1–10 doors on rental cash flow"

*TikTok:*
1. "How I financed my 4th Airbnb without showing my W-2"
2. "DSCR STR loans explained"
3. "AirDNA says my STR will do $80K/year. My lender agreed."
4. "The fastest way to scale an Airbnb portfolio"
5. "Buying a short-term rental? DSCR is the loan for you"

**Primary text (3 per platform)**

*Meta:*
- "STR operators: we underwrite on AirDNA + rental cash flow. No W-2. No tax returns. We know the difference between seasonal STR markets and urban LTR — and we price accordingly."
- "Already running 1–3 Airbnbs? DSCR STR loans use AirDNA revenue projections (not your W-2) to qualify you for the next one. Most clients scale to 5+ doors in 18 months."
- "STR cash-out refi: pull equity from your existing short-term rental to fund the next one. LLC-friendly. 21-day closes."

*Google:*
- "DSCR STR loans underwrite on AirDNA, not your W-2. Seasonal markets handled correctly. 21-day closes."
- "Airbnb host? Qualify for your next rental property on rental income alone. DSCR STR loans from $100K."
- "Refinance your short-term rental at today's rate. DSCR cash-out for STR investors."

*LinkedIn:*
- "AirDNA underwriter on staff. We price STR DSCR loans on the same revenue data you use to set your pricing. Co-marketing available for property managers."
- "STR superhosts with 3+ doors: portfolio loan options up to 10 financed properties on rental cash flow."
- "If you're an STR manager with investor clients, let's talk. We close DSCR STR loans in 21 days, LLC-friendly, 48-state licensed."

*TikTok:*
- "How STR operators qualify without W-2: DSCR loans underwrite on rental income. AirDNA does the underwriting, basically. We just say yes."
- "I went from 1 Airbnb to 5 in 18 months using DSCR cash-out refis. Here's how."
- "STR loan rule: if DSCR ≥ 1.0 on AirDNA projection, you qualify. 21-day close."

**Visual direction**
- Lifestyle: Hands-on host at a beautiful STR property (mountain cabin / coastal cottage / desert villa), laptop open with Airbnb calendar visible. Could be 1–2 people, no family composition cues
- Color palette: Warm hospitality palette — terracotta (#C2410C), teal (#0F766E), cream (#FEF3C7)
- Models: Neutral lifestyle — should not skew toward any specific demographic; family with kids OK as long as no "family with children" exclusivity messaging

**Compliance + audience concern**
- 🟡 **ECOA risk:** STR-heavy states (TN, FL, TX, NC) have **higher minority populations in some metros** (e.g., Memphis, Atlanta, Houston, Charlotte). Targeting by metro-level STR demand is OK; targeting by metro-level racial composition is NOT. Mitigation: use AirDNA market data + state licensing footprint as the documented business reason.
- 🟢 NJ + NY STR owners are persona-relevant but excluded due to state-level PPP/regulatory complexity — business-justified, not demographic.

**CTA + CPL**
- CTA: Click-to-call (STR operators prefer voice) + lead form backup
- CPL estimate: Meta $50–$90, Google $110–$200, TikTok $40–$70, LinkedIn $140–$240

---

### PERSONA 3 — "Portfolio Builder / Scaling Landlord"

**Archetype:** Experienced investor with 5–20 doors, full-time in real estate, scaling toward 50+. Sophisticated, knows DSCR jargon, compares lenders aggressively.

| Field | Spec |
|---|---|
| **Age band** | 35–55 (Meta window 18–65+) |
| **Gender** | Not targeted |
| **Location** | National — but stronger in TX, FL, GA, NC, TN, OH (Visio/Kiavi footprint). Note OH PPP threshold $112,957 may require deal structuring. |
| **Income** | $150K–$500K+ (real estate income dominates; W-2 declining) |
| **Education** | College+ |
| **Occupation** | Full-time real estate investor / landlord / property manager |
| **Net worth** | $1M–$10M |
| **FICO band** | 700–780 (portfolio pricing tier; lower FICO allowed if strong DSCR) |

**Psychographics**
- Pain points: "Lender #3 said no on the 6-property portfolio — too many mortgages"; "I need a portfolio loan, not 5 separate loans"; "I want a relationship lender, not transactional"
- Aspirations: Hit 50 doors, hire a property manager, syndicate a deal, build a property-management brand
- Media consumption: BiggerPockets Pro, J. Scott (book "The Book on Rental Property Investing"), Facebook groups ("Landlords Only", "BiggerPockets Pro"), local REI meetups, REI clubs

**Meta targeting**
- Interests: `Real estate investing`, `BiggerPockets`, `Rental property`, `REI club`, `Real estate portfolio`, `Landlording`
- Behaviors: `Small business page admins`, `Engaged shoppers` (broad)
- Lookalike seed: Closed portfolio-builder loans (1% lookalike)
- Custom audience: Past closed loans + email list

**Google**
- In-market: `Real Estate > Investment Properties`, `Mortgages > Refinancing`
- Affinity: `Real Estate Enthusiasts`, `Business Professionals > Small Business Owners`
- Customer match: Closed-loan file + email subscribers

**LinkedIn**
- Job titles: `Real Estate Investor`, `Real Estate Broker`, `Property Manager`, `Real Estate Portfolio Manager`
- Company size: Self-employed (1–10) or SMB (11–50)
- Groups: `Real Estate Investing Network`, `BiggerPockets Network`, `National REIA`

**TikTok**
- Hashtags: `#realestateportfolio`, `#landlord`, `#rentalportfolio`, `#biggerpockets`, `#multifamilyrealestate`, `#cashflow`, `#financialindependence`
- Creator categories: Personal Finance, Real Estate, Entrepreneurship

**Headlines (5 per platform)**

*Meta:*
1. "DSCR portfolio loans — up to 20 financed doors on one application"
2. "Scaling landlords: one lender, one close, one set of docs"
3. "10+ rental properties? Portfolio DSCR loans from $500K to $5M"
4. "Refinance your portfolio as one loan — not 10"
5. "Relationship lending for serious landlords"

*Google:*
1. "Portfolio DSCR Loans | 5–20 Doors, One Application"
2. "DSCR Portfolio Refinance | Up to 20 Financed Properties"
3. "Scaling Landlords: One Lender for the Whole Portfolio"
4. "Multi-Property DSCR Loans | $500K–$5M"
5. "Portfolio Cash-Out Refi | Pull Equity From Multiple Doors"

*LinkedIn:*
1. "Real estate investors with 5+ doors — one DSCR portfolio loan"
2. "BiggerPockets Pro members: portfolio DSCR loans for 10–20 doors"
3. "Scaling landlords: refinance your portfolio at today's rate"
4. "Portfolio DSCR for the 5–20 door operator"
5. "The lender behind 100+ portfolio closes — let's talk"

*TikTok:*
1. "I financed 12 doors with one DSCR portfolio loan"
2. "How landlords scale from 5 doors to 20 — portfolio DSCR"
3. "The math on portfolio refi when rates drop"
4. "Stop doing 10 separate loan applications — do one"
5. "Portfolio DSCR loans explained in 60 seconds"

**Primary text (3 per platform)**

*Meta:*
- "5+ doors? Stop applying door-by-door. Our portfolio DSCR product puts 5–20 financed properties on one application, one close, one payment. Most clients scale to 20 doors in 24 months."
- "Scaling landlords: when your bank says 'too many mortgages' — that's when you call a DSCR portfolio lender. We use the rental cash flow, not your personal DTI."
- "Portfolio cash-out refi: pull equity from your 5–10 doors to fund the next acquisition. One loan, one close."

*Google:*
- "DSCR portfolio loans for 5–20 doors. One application, one close, one payment. Most clients qualify with 1.0+ DSCR across the portfolio."
- "Scaling landlords — refinance your rental portfolio at today's rate and pull equity for the next acquisition."
- "Portfolio DSCR loans from $500K to $5M. Up to 20 financed properties per loan. 21-day closes."

*LinkedIn:*
- "Real estate investors with 5+ doors: portfolio DSCR loans let you refinance your entire portfolio as one loan. Most clients save 30–60 minutes per door vs. door-by-door underwriting."
- "BiggerPockets Pro: we're the lender that handles 10–20 doors on a single DSCR portfolio loan. Co-marketing available."
- "Scaling landlords with $1M+ portfolios: relationship lending for the 5–20 door operator."

*TikTok:*
- "How I went from 5 doors to 12 using a portfolio DSCR refi. One loan. One close. One payment."
- "Portfolio DSCR for the 5–20 door operator. If you have 10 rentals, you don't need 10 loans."
- "When your bank says 'too many mortgages' — DSCR portfolio lender is the answer."

**Visual direction**
- Lifestyle: Multi-property owner standing in front of a duplex or quadplex; clipboard or laptop in hand; "landlord at scale" energy
- Color palette: Confident dark blue (#1E3A8A), gold accent (#CA8A04), white
- Models: Mature (40s–50s) but no specific demographic cues; professional attire
- Avoid: any imagery suggesting "retirement" or "passive income + travel" framing — that's a different persona

**Compliance + audience concern**
- 🟢 **ECOA risk:** LOW. Portfolio builders self-select by expertise; targeting by interest/behavior rather than geography is robust.
- 🟡 **CFPB UDAAP risk:** Avoid implying "guaranteed approval" or "no-doc" without disclosing DSCR thresholds. Creative must mention DSCR ≥ 1.0 explicitly to avoid bait-and-switch.

**CTA + CPL**
- CTA: Click-to-call + dedicated portfolio team lead form
- CPL estimate: Meta $70–$120, Google $130–$240, TikTok $60–$90, LinkedIn $150–$260

---

### PERSONA 4 — "DSCR Second (HELOC-equivalent) Cash-Out Refi"

**Archetype:** DSCR borrower with a low first mortgage (2021–2022 vintage at 3–4%) who wants to pull equity without disturbing the first. Deephaven-style "DSCR Second" product.

| Field | Spec |
|---|---|
| **Age band** | 40–60 (Meta window 18–65+) |
| **Gender** | Not targeted |
| **Location** | High-appreciation markets: CA, WA, OR, CO, AZ, NV, FL, NY (NYC metro), MA, TX (Austin) |
| **Income** | $120K–$500K W-2 |
| **Education** | College+ |
| **Occupation** | W-2 professional, often tech (CA/WA), finance (NY), professional services |
| **Net worth** | $500K–$3M (substantial equity from appreciation) |
| **FICO band** | 720–800 |
| **DSCR target** | 1.0+ on combined (first + second) |

**Psychographics**
- Pain points: "My first mortgage is at 3.25% — I don't want to refi and lose that rate"; "I need $100K for renovation but rates are 7%+"; "HELOC requires income docs I don't want to share"
- Aspirations: Tap home equity without disturbing low first mortgage, finance renovation, fund next acquisition
- Media consumption: BiggerPockets, financial independence blogs (Root of Good, Go Curry Cracker), WSJ, MarketWatch, YouTube (BiggerPockets, Financial Education)

**Meta targeting**
- Interests: `Real estate investing`, `HELOC`, `Home equity`, `Cash-out refinance`, `Renovation`, `1031 exchange`
- Behaviors: `Homeowners`, `Engaged shoppers`
- Custom audience: Lookalike of closed DSCR Second loans

**Google**
- In-market: `Mortgages > Refinancing`, `Home & Garden > Home Improvement`
- Affinity: `Home & Garden > Home Improvement`, `Real Estate Enthusiasts`
- Customer match: Closed-loan list

**LinkedIn**
- Job titles: `Real Estate Investor`, `Software Engineer` (CA/WA), `Finance Manager`, `Tech Worker`
- Skills: `Real Estate Investing`, `Personal Finance`, `Financial Planning`

**TikTok**
- Hashtags: `#heloc`, `#homeequity`, `#cashoutrefi`, `#dscrsecond`, `#rentalproperty`, `#renovation`, `#realestate`
- Creator categories: Personal Finance, Real Estate

**Headlines**

*Meta:*
1. "Keep your 3% first mortgage — pull cash with a DSCR Second"
2. "Renovate your rental without disturbing your first mortgage"
3. "DSCR Second: the HELOC alternative for landlords"
4. "Tap rental equity at second-lien rates"
5. "Pull $50K–$500K from your rental — keep your first mortgage untouched"

*Google:*
1. "DSCR Second | Keep Your First Mortgage, Pull Cash"
2. "HELOC Alternative for Landlords | DSCR Second"
3. "Renovation Financing | Tap Rental Equity at Second-Lien Rates"
4. "Cash-Out Without Refinancing Your First Mortgage"
5. "DSCR Second Lien Loans | $50K–$500K"

*LinkedIn:*
1. "Real estate investors: keep your 3% first mortgage, pull cash with a DSCR Second"
2. "Renovation financing for landlords — second-lien rate, first-mortgage untouched"
3. "Tech workers with rentals: DSCR Second without touching your W-2"

*TikTok:*
1. "I pulled $150K from my rental without refi'ing my 3% mortgage"
2. "DSCR Second explained — keep your low first mortgage"
3. "The HELOC alternative that doesn't require income docs"

**Primary text**

*Meta:*
- "If your rental's first mortgage is at 3.25% and current rates are 7%+, you don't want to refi. DSCR Second: second-lien loan, first-mortgage untouched. Pull $50K–$500K at second-lien rates."
- "Renovate your rental, fund your next acquisition, or just unlock equity — without disturbing your low first mortgage. Combined DSCR (first + second) must stay ≥ 1.0."
- "LLC-friendly DSCR Second loans. We close in 21 days. Most clients use this to scale from 1–2 doors to 3–5 doors in 18 months."

*Google:*
- "DSCR Second loans let landlords tap rental equity without refi'ing a low first mortgage. Second-lien rate, 21-day close, LLC-friendly."
- "HELOC alternative for landlords: DSCR Second doesn't require income docs. Qualify on rental cash flow + remaining equity."
- "Renovation financing for rental property owners — pull $50K–$500K at second-lien rates."

*LinkedIn:*
- "Real estate investors: DSCR Second is the second-lien product that lets you tap rental equity without disturbing a low first mortgage. Most useful for 2021–2022 vintage holders still at 3–4%."
- "Tech workers with rentals: keep your first-mortgage rate, pull cash with a DSCR Second. We underwrite on rental cash flow, not your W-2."
- "Renovation + acquisition financing for landlords — second-lien rate, first-mortgage untouched."

*TikTok:*
- "Why I'd never refi a 3% mortgage in a 7% world. DSCR Second is the move."
- "DSCR Second = second mortgage on a rental. First untouched. Pull $50K–$500K."
- "Landlords who locked 3% rates: this is your equity unlock."

**Visual direction**
- Lifestyle: Property owner with laptop on a porch / kitchen showing rental cash flow on screen
- Color palette: Trust-blue (#1E40AF), gold accent, white
- Models: Mature (40s–50s), professional but not "old-money" cues

**Compliance + audience concern**
- 🟢 **ECOA risk:** LOW. Cash-out refi targeting is intent-based.
- 🟡 **TILA-RESPA integration risk:** Ads must NOT use "free", "no-cost", or "low payment" without proper APR disclosure language. Avoid cost-comparison headlines.

**CTA + CPL**
- CTA: Click-to-call + lead form
- CPL estimate: Meta $60–$110, Google $100–$200, TikTok $45–$80, LinkedIn $140–$230

---

### PERSONA 5 — "First-Time DSCR / Transitioning Investor"

**Archetype:** Existing primary-residence owner looking to buy their FIRST investment property without using personal income. Transitioning from "homeowner" to "investor."

| Field | Spec |
|---|---|
| **Age band** | 30–50 (broad Meta window) |
| **Gender** | Not targeted |
| **Location** | Tier 1 metros: PHX, DAL, HOU, ATL, TPA, CLT, BNA, IND, CMH, RDU |
| **Income** | $80K–$200K W-2 |
| **Education** | College+ |
| **Occupation** | Professional: nurse, teacher, engineer, IT, accountant, government employee |
| **Net worth** | $100K–$500K (primary residence equity) |
| **FICO band** | 680–760 |

**Psychographics**
- Pain points: "I want to be an investor but my DTI is too high for a 2nd mortgage"; "I can't qualify on tax returns because I'm W-2 and bonus-heavy"; "I don't want to refinance my primary"
- Aspirations: Buy first rental, build passive income, start the "BiggerPockets journey"
- Media consumption: BiggerPockets (YouTube, podcast), "How to Buy Your First Rental" courses, personal finance (Ramsey, White Coat Investor, r/realestateinvesting)

**Meta targeting**
- Interests: `BiggerPockets`, `Real estate investing`, `Rental property`, `First-time investor`, `REI club`, `Roofstock`
- Behaviors: `Homeowners`, `Engaged shoppers`
- Custom audience: Lookalike of "first rental" closed loans

**Google**
- In-market: `Real Estate > Investment Properties`, `Real Estate > First-Time Buyer`
- Affinity: `Home & Garden > Real Estate`
- Customer match: Closed first-rental loans

**LinkedIn**
- Job titles: `Real Estate Investor` (new), `Nurse`, `Teacher`, `Engineer`, `Software Developer`
- Skills: `Real Estate Investing`

**TikTok**
- Hashtags: `#firstrental`, `#realestateinvesting`, `#biggerpockets`, `#rentalproperty`, `#passiveincome`, `#firstinvestmentproperty`
- Creator categories: Personal Finance, Real Estate

**Headlines**

*Meta:*
1. "Buy your first rental — qualify on the property, not your W-2"
2. "DSCR loans for first-time investors"
3. "Don't refi your primary — buy a rental with a DSCR loan"
4. "How first-time investors qualify for rental property"
5. "First rental? DSCR makes it possible"

*Google:*
1. "First Investment Property Loan | DSCR for New Investors"
2. "Buy a Rental Without Using Personal Income | DSCR Loans"
3. "First-Time Investor Mortgage | Qualify on Rental Cash Flow"
4. "DSCR Loans Explained | For First-Time Investors"
5. "No W-2 Required | Investment Property Loan for New Investors"

*LinkedIn:*
1. "First-time investors: DSCR loans let you qualify on the rental, not your W-2"
2. "Nurses, teachers, engineers — buy your first rental without using personal income"

*TikTok:*
1. "How I bought my first rental without showing my W-2"
2. "DSCR loans for first-time investors — explained"
3. "BiggerPockets made me want a rental. DSCR made me qualify."

**Primary text**

*Meta:*
- "First rental? Most new investors get stuck on DTI: their primary mortgage already counts against them. DSCR loans qualify on the rental's cash flow, not your W-2. We close in 21 days, LLC-friendly, 48-state licensed."
- "You don't need to refi your primary to buy your first investment property. DSCR looks at the rental's DSCR (rent ÷ PITIA), not your tax return. Most first-time investors qualify with DSCR ≥ 1.0 and FICO 680+."
- "BiggerPockets made you want to be a landlord. DSCR makes you qualify. We work with first-time investors every week."

*Google:*
- "DSCR loans let first-time investors qualify on the rental property's cash flow, not their personal W-2. Most qualify with DSCR ≥ 1.0, FICO 680+, 20–25% down."
- "Buy your first rental without using personal income. DSCR loans from $75K, LLC-friendly, 21-day close."

*LinkedIn:*
- "First-time investors: DSCR loans qualify on the rental's cash flow, not your personal tax return. Common path for W-2 professionals with low DTI headroom."
- "We work with first-time investors every week. Most close on their first rental in 30–45 days from first contact."

*TikTok:*
- "BiggerPockets made you want to be a landlord. DSCR makes you qualify."
- "First rental, no W-2. Here's how DSCR works."

**Visual direction**
- Lifestyle: Younger (30s) professional couple or solo professional with primary residence in background; laptop or phone with BiggerPockets app
- Color palette: Energetic but trust-blue (#2563EB), white, accent green
- Models: Diverse but unbranded; no family-composition cues
- **NEVER use "first-time homebuyer" language — that triggers FHAct §805 advertising rules for protected-class implication**

**Compliance + audience concern**
- 🟡 **ECOA risk:** "First-time investor" language is fine; **NEVER use "first-time homebuyer"** in any ad copy — that's FHAct §805 protected-class territory (proxy for age discrimination in housing context). Mitigation: always say "first-time investor" or "first rental property buyer."
- 🟡 **"Millennial" or "Gen Z" targeting** disallowed on housing ads.

**CTA + CPL**
- CTA: Lead form (self-quote tool, lowest friction)
- CPL estimate: Meta $40–$75, Google $95–$175, TikTok $35–$60, LinkedIn $130–$220

---

### PERSONA 6 — "Self-Employed Real-Estate Pro (Realtor / Contractor)"

**Archetype:** Realtor, contractor, property manager using DSCR to qualify for their OWN investment property because their tax returns show low W-2 income.

| Field | Spec |
|---|---|
| **Age band** | 35–55 |
| **Gender** | Not targeted |
| **Location** | National — strong in TX, FL, CA (Bay Area / LA / SD / Sacramento), AZ, NV, CO |
| **Income** | $150K–$500K (self-employed; tax returns understate) |
| **Education** | College+ |
| **Occupation** | Realtor, real estate broker, contractor, property manager, real estate attorney |
| **Net worth** | $300K–$2M |
| **FICO band** | 680–760 |

**Psychographics**
- Pain points: "My tax returns show $80K but I actually make $250K"; "Conventional lenders won't count commission income"; "I want to invest in my own market"
- Aspirations: Build rental portfolio in primary market, become a "real estate investor" on the side
- Media consumption: BiggerPockets, Inman, local Realtor associations, real estate podcasts (Real Estate Rockstars, Listing Agent Lifestyle)

**Meta targeting**
- Interests: `Real estate investing`, `Realtor`, `Real estate broker`, `Property management`, `BiggerPockets`
- Behaviors: `Small business page admins`, `Engaged shoppers`
- Custom audience: Lookalike of self-employed closed loans

**Google**
- In-market: `Real Estate > Investment Properties`, `Real Estate > Real Estate Services`
- Affinity: `Real Estate Enthusiasts`, `Business Professionals > Real Estate`
- Customer match: Closed self-employed loans

**LinkedIn**
- Job titles: `Realtor`, `Real Estate Broker`, `Real Estate Agent`, `Property Manager`, `Contractor`, `Real Estate Attorney`
- Company size: Self-employed/Solopreneur (1–10)
- Groups: `Realtors Network`, `Real Estate Investing`, `National Association of Realtors`
- **ECOA caveat:** Job-title targeting is LinkedIn's strongest filter. By definition, you're targeting specific occupations. This is allowed but must be justified as business-purpose (real estate investor = business-borrower) not as demographic proxy.

**TikTok**
- Hashtags: `#realtor`, `#realestateagent`, `#realestateinvesting`, `#selfemployed`, `#commissionincome`
- Creator categories: Real Estate, Personal Finance

**Headlines**

*Meta:*
1. "Realtors: buy your own rental without using your tax returns"
2. "Self-employed? DSCR loans qualify on the property, not your 1099 income"
3. "Property managers + contractors — invest in your own market with a DSCR loan"
4. "Commission income doesn't show up on tax returns. We don't need tax returns."
5. "Real estate pros — qualify on rental cash flow, not your Schedule C"

*Google:*
1. "DSCR Loans for Self-Employed | No Tax Returns Required"
2. "Realtor Investment Property Loan | DSCR Lender"
3. "Self-Employed Investor Mortgage | Commission-Income Friendly"
4. "DSCR for Real Estate Professionals"
5. "Investment Property Loan for 1099 Workers"

*LinkedIn:*
1. "Realtors: buy your own rental without using your tax returns"
2. "Self-employed real estate pros — DSCR loans qualify on the rental, not your 1099"
3. "Commission-income friendly DSCR lender"

*TikTok:*
1. "How realtors buy rentals without using tax returns"
2. "Self-employed? DSCR is your loan"
3. "Commission income + DSCR loans = match"

**Primary text**

*Meta:*
- "Realtors, contractors, property managers: your tax returns don't show what you actually make. DSCR loans qualify on the rental property's cash flow, not your Schedule C. Most self-employed investors close in 21 days."
- "Self-employed real estate pros: you can afford the property, but conventional lenders won't count your commission income. DSCR loans underwrite on the rental, not your W-2 or 1099."
- "Buy a rental in your own market without disturbing your self-employed income. DSCR loans for real estate professionals."

*Google:*
- "DSCR loans for self-employed real estate professionals. Qualify on the rental's cash flow, not your tax returns. 21-day close."
- "Realtors + contractors + property managers: investment property loans that don't require tax returns or commission-history verification."

*LinkedIn:*
- "Self-employed real estate pros: DSCR loans qualify on the rental property's cash flow, not your tax returns. Built for the commission-income borrower."
- "Realtors: your brokerage already trusts your commission income. So do we — through the property's DSCR."

*TikTok:*
- "How realtors buy their own rentals — DSCR loans underwrite on the property, not your W-2."
- "Self-employed + DSCR = the loan that doesn't care about your tax returns."

**Visual direction**
- Lifestyle: Real-estate pro at an open house or showing a property; laptop open with MLS or rental data
- Color palette: Professional navy (#1E3A8A), white, accent gold
- Models: 30s–50s, professional attire, no specific demographic cues

**Compliance + audience concern**
- 🟢 **ECOA risk:** LOW. Occupation is a business-purpose filter, not a protected class.
- 🟡 **Risk:** LinkedIn job-title targeting on housing ads may inadvertently create disparate impact. Document the business reason as "self-employed borrowers have higher tax-return complexity" — a legitimate underwriting concern, not a demographic filter.

**CTA + CPL**
- CTA: Lead form + click-to-call
- CPL estimate: Meta $50–$90, Google $100–$190, TikTok $40–$70, LinkedIn $130–$220

---

### PERSONA 7 — "Multi-Family / Small Commercial (5–50 units)"

**Archetype:** Small multi-family or mixed-use investor. Wants DSCR-style underwriting on a 5-plex, 10-plex, 20-plex, or small mixed-use building. Often LLC-owned.

| Field | Spec |
|---|---|
| **Age band** | 40–60 |
| **Gender** | Not targeted |
| **Location** | Midwest + South: OH, IN, MI, IL, MO, KS, TX, GA, NC, TN, FL |
| **Income** | $150K–$500K |
| **Education** | College+ |
| **Occupation** | Full-time investor or hybrid (W-2 + real estate) |
| **Net worth** | $1M–$5M |
| **FICO band** | 660–740 |

**Psychographics**
- Pain points: "5-unit deals don't qualify for agency financing but are too small for CMBS"; "Small commercial lenders price like residential but want commercial docs"
- Aspirations: Scale to 50+ units, eventually syndicate
- Media consumption: BiggerPockets (Multi-Family channel), Multifamily Real Estate Investing (podcast), Crexi, LoopNet

**Meta targeting**
- Interests: `Multi-family real estate`, `Apartment investing`, `Commercial real estate`, `Mixed-use property`, `Syndication`
- Behaviors: `Small business page admins`
- Custom audience: Closed small multi-family loans

**Google**
- In-market: `Real Estate > Multi-Family`, `Real Estate > Commercial`, `Real Estate > Investment Properties`
- Affinity: `Real Estate Enthusiasts`
- Customer match: Closed loans

**LinkedIn**
- Job titles: `Multi-Family Investor`, `Apartment Owner`, `Real Estate Syndicator`, `Real Estate Investor`
- Skills: `Multi-Family`, `Commercial Real Estate`, `Apartment Investing`

**TikTok**
- Hashtags: `#multifamily`, `#apartmentinvesting`, `#commercialrealestate`, `#syndication`, `#cashflow`
- Creator categories: Real Estate

**Headlines**

*Meta:*
1. "DSCR loans for 5–50 unit multi-family"
2. "Small apartment building financing — DSCR-style"
3. "Multi-family DSCR loans from $500K to $5M"
4. "5-unit deals? 20-unit deals? We finance them on DSCR"
5. "Refinance your small apartment building at today's rate"

*Google:*
1. "DSCR Loans for Multi-Family | 5–50 Units"
2. "Small Apartment Building Financing | DSCR Lender"
3. "Multi-Family Refinance | Cash-Out at Today's Rate"
4. "5-Unit to 50-Unit DSCR Loans"
5. "Mixed-Use Property DSCR Financing"

*LinkedIn:*
1. "Multi-family investors: DSCR-style financing for 5–50 units"
2. "Small apartment buildings — DSCR loans from $500K to $5M"

*TikTok:*
1. "How I financed a 12-unit with DSCR"
2. "Multi-family DSCR loans explained"
3. "The loan that makes 5–50 unit deals make sense"

**Primary text**

*Meta:*
- "5-unit to 50-unit multi-family? We finance on DSCR. Most clients refinance existing 5–10 unit buildings to pull equity for the next acquisition."
- "Small apartment buildings don't fit agency financing but are too small for CMBS. DSCR loans fill the gap: underwrite on rental cash flow, close in 21–30 days."
- "LLC-friendly, 48-state licensed, $500K–$5M loan sizes."

*Google:*
- "DSCR loans for 5–50 unit multi-family and mixed-use. Underwrite on rental cash flow. 21–30 day close."
- "Small apartment building financing that doesn't require commercial income docs."

*LinkedIn:*
- "Multi-family investors: DSCR loans for 5–50 units. LLC-friendly, 48-state licensed."
- "5-unit to 50-unit DSCR financing for experienced multi-family operators."

*TikTok:*
- "How I financed a 12-unit apartment building with DSCR — underwritten on rental cash flow."
- "Multi-family DSCR for the 5–50 unit operator."

**Visual direction**
- Lifestyle: Multi-family building exterior; investor reviewing rent roll on laptop
- Color palette: Industrial navy (#0F172A), steel gray, accent orange
- Models: Mature (40s–50s), professional

**Compliance + audience concern**
- 🟢 **ECOA risk:** LOW. Multi-family is commercial-purpose; some FHAct advertising rules apply (less restrictively than 1–4 unit).
- 🟡 **Multi-family > 5 units is generally NOT subject to ECOA dwelling-secured rules** but IS subject to Fair Housing advertising rules if advertised for residential rental.

**CTA + CPL**
- CTA: Click-to-call + lead form
- CPL estimate: Meta $70–$130, Google $130–$240, LinkedIn $150–$260, TikTok $60–$100

---

### PERSONA 8 — "Foreign National Investor"

**Archetype:** Non-U.S. citizen (no U.S. residency) buying U.S. rental property as portfolio diversifier or LTR/STR operator. FN-specific DSCR products (Newfi, Angel Oak, others).

| Field | Spec |
|---|---|
| **Age band** | 35–60 |
| **Gender** | Not targeted |
| **Location** | CA, NY, FL, TX, AZ, NV (high foreign-buyer concentration) |
| **Income** | $200K–$2M (foreign-source income, hard to verify with U.S. tax returns) |
| **Education** | International degree |
| **Occupation** | Business owner (foreign), professional, investor |
| **Net worth** | $1M–$20M |
| **FICO band** | N/A (foreign nationals often don't have U.S. FICO); use international credit or asset-based |

**Psychographics**
- Pain points: "I can't get a conventional mortgage without U.S. credit history"; "I want to invest in U.S. real estate without becoming a tax resident"
- Aspirations: U.S. real estate exposure, currency diversification, eventually relocate or gift to U.S.-based children
- Media consumption: International real estate portals, Asian Wealth Media, Financial Times, local-market Chinese-language real estate publications

**Meta targeting**
- Interests: `U.S. real estate`, `International real estate investing`, `U.S. property investment`
- Behaviors: `Frequent international travelers`
- **ECOA caveat:** Foreign-language ad targeting requires business justification (FN is a credit-eligibility category, not a protected class).

**Google**
- In-market: `Real Estate > Investment Properties`, `Real Estate > International`
- Customer match: Past FN closed loans + opt-in international email list

**LinkedIn**
- Job titles: `Business Owner`, `Investor` (international self-reported)
- Geography: Country-level (allowed; not zip-level)

**TikTok**
- Hashtags: `#usrealestate`, `#foreignnational`, `#internationalinvestor`, `#usproperty`, `#realestateusa`
- **ECOA caveat:** TikTok language targeting must be justified by business purpose.

**Headlines**

*Meta:*
1. "Foreign national? Buy U.S. rental property with a DSCR loan"
2. "U.S. investment property loans for non-residents"
3. "No U.S. credit history? No problem. FN DSCR loans from $100K"
4. "Invest in U.S. real estate from anywhere"
5. "Foreign national DSCR lender — 48-state licensed"

*Google:*
1. "Foreign National DSCR Loans | U.S. Real Estate for Non-Residents"
2. "U.S. Investment Property Loans | No U.S. Credit Required"
3. "FN Mortgage Lender | Foreign National DSCR Loans"
4. "Buy U.S. Rental Property from Outside the U.S."
5. "Foreign National Investment Property Mortgage"

*LinkedIn:*
1. "Foreign national investors: U.S. DSCR loans for non-residents"
2. "U.S. real estate for international investors — FN DSCR lender"

*TikTok:*
1. "How foreign nationals buy U.S. rentals"
2. "FN DSCR loans explained"
3. "U.S. real estate for international investors"

**Primary text**

*Meta:*
- "Foreign national DSCR loans: no U.S. credit history required, no U.S. tax returns required. Qualify on the rental property's cash flow + international assets. 30–45 day closes."
- "Invest in U.S. real estate from abroad. FN DSCR loans for non-residents, foreign nationals, and ITIN holders."

*Google:*
- "Foreign national DSCR loans for U.S. investment property. No U.S. credit history required. 30–45 day closes."
- "U.S. real estate for foreign nationals — DSCR loans from $100K to $2M, 48-state licensed."

*LinkedIn:*
- "FN DSCR loans for foreign national investors buying U.S. rental property. No U.S. credit history required."
- "International investors: U.S. real estate exposure without becoming a U.S. tax resident."

*TikTok:*
- "How foreign nationals buy U.S. rentals — FN DSCR loans."
- "U.S. real estate for non-residents — explained."

**Visual direction**
- Lifestyle: International professional (could be any nationality — keep neutral) reviewing U.S. property online; city skyline (NYC, LA, Miami) in background
- Color palette: Global-citizen blue (#1E40AF), warm white, accent gold
- Models: International / neutral; avoid stereotypical "international" cues

**Compliance + audience concern**
- 🟡 **ECOA risk:** National origin is a protected class. Targeting FOREIGN NATIONALS specifically is allowed ONLY because FN is a credit-eligibility category (lender can't verify U.S. tax returns / credit for non-residents) — that's a business necessity, not a demographic filter. Document this carefully.
- 🟢 **No issue** with geography targeting (CA, NY, FL, TX, AZ, NV are FN-friendly markets).

**CTA + CPL**
- CTA: Click-to-call + lead form (FN deals often need specialist LO)
- CPL estimate: Meta $80–$150, Google $150–$280, LinkedIn $180–$300, TikTok $70–$120

---

### PERSONA 9 — "1031 Exchange Upgrader"

**Archetype:** Just sold a property via 1031 exchange, needs to identify replacement property within 45 days, close within 180. Time-sensitive DSCR financing.

| Field | Spec |
|---|---|
| **Age band** | 50–70 (1031 sellers often older, but Housing Special Ad Category requires broad window) |
| **Gender** | Not targeted |
| **Location** | National — strong in CA (high equity), NY, NJ, FL, WA, OR |
| **Income** | $200K–$1M+ |
| **Education** | College+ |
| **Occupation** | Often retired or semi-retired; sometimes still W-2 with significant holdings |
| **Net worth** | $1M–$10M+ |
| **FICO band** | 700–800 |

**Psychographics**
- Pain points: "I have 45 days to identify, 180 to close — I need a lender who moves fast"; "Conventional lenders can't close in 21 days"; "1031 funds sit in escrow and I can't qualify on W-2 income anymore"
- Aspirations: Defer capital gains, upgrade to higher-quality asset, consolidate holdings
- Media consumption: 1031 Exchange Magazine, IPX1031, Real Estate Investors Association, tax/legal advisors

**Meta targeting**
- Interests: `1031 exchange`, `Real estate investing`, `Capital gains`, `Deferred exchange`, `Investment property`
- Behaviors: `Homeowners`, `Small business page admins`
- Custom audience: Closed 1031 exchange loans

**Google**
- In-market: `Real Estate > Investment Properties`, `Tax Services > Tax Planning`
- Affinity: `Real Estate Enthusiasts`
- Customer match: Closed loans + 1031 intermediary referral lists

**LinkedIn**
- Job titles: `Real Estate Investor`, `Real Estate Broker`, `Wealth Manager`, `Tax Attorney`
- Groups: `Real Estate Investing`, `Tax Planning for Investors`

**TikTok**
- Hashtags: `#1031exchange`, `#realestateinvesting`, `#capitalgains`, `#deferredexchange`, `#taxstrategy`
- **Note:** 1031 audience is older; TikTok reach will be lower; lean on LinkedIn + Google

**Headlines**

*Meta:*
1. "1031 exchange? DSCR loans close in 21 days"
2. "Need to close your 1031 in 21 days? DSCR lender"
3. "1031 deadline approaching? DSCR loans for fast closes"
4. "Real estate investors: 1031 financing on rental property"
5. "Upgrade your 1031 into a higher-quality rental"

*Google:*
1. "1031 Exchange DSCR Loans | 21-Day Close"
2. "Fast DSCR Financing for 1031 Exchanges"
3. "Replacement Property Financing | DSCR Lender"
4. "1031 Deadline? DSCR Loans Close Fast"
5. "1031 Exchange Investment Property Loans"

*LinkedIn:*
1. "1031 exchange borrowers — DSCR loans that close in 21 days"
2. "Wealth managers + tax attorneys: DSCR financing partner for 1031 exchanges"

*TikTok:*
1. "1031 exchange in 21 days with DSCR"
2. "1031 deadline? Here's how to close fast"
3. "DSCR loans for 1031 exchanges — explained"

**Primary text**

*Meta:*
- "1031 exchange deadline: 45 days to identify, 180 to close. Conventional lenders can't move that fast. DSCR loans close in 21 days, LLC-friendly, 48-state licensed. Most 1031 clients close on their replacement property with 30+ days to spare."
- "Upgrading your 1031 into a higher-quality rental asset? DSCR loans qualify on rental cash flow, not your tax returns (which may now show retirement income or capital gains)."

*Google:*
- "DSCR loans for 1031 exchanges. 21-day close, 48-state licensed, LLC-friendly."
- "1031 deadline approaching? We close in 21 days on rental replacement properties."

*LinkedIn:*
- "1031 exchange borrowers: DSCR loans close in 21 days. Most clients identify + close with weeks to spare."
- "Wealth managers + tax attorneys: DSCR financing partner for 1031 exchange replacement properties."

*TikTok:*
- "1031 deadline? DSCR loans close in 21 days. Here's how."
- "1031 exchange financing — explained."

**Visual direction**
- Lifestyle: Investor reviewing multiple property options on screen; calm, professional energy
- Color palette: Wealth-deep blue (#1E3A8A), cream, accent gold
- Models: 50s–60s, mature professional

**Compliance + audience concern**
- 🟢 **ECOA risk:** LOW. 1031 is a transaction structure, not a demographic.
- 🟡 **TILA risk:** Time-pressure messaging ("deadline approaching") is allowed but cannot create deception. Always disclose DSCR ≥ 1.0 requirement.

**CTA + CPL**
- CTA: Click-to-call (time-sensitive, voice preferred) + lead form
- CPL estimate: Meta $80–$140, Google $140–$250, LinkedIn $160–$280, TikTok $60–$110

---

### PERSONA 10 — "Vacation Cabin / Second-Home Hybrid STR Owner"

**Archetype:** Owner of a vacation-property STR they also use personally. Hybrid personal-use + rental. Often $400K–$1.5M property in mountain / coastal / lake region.

| Field | Spec |
|---|---|
| **Age band** | 40–65 |
| **Gender** | Not targeted |
| **Location** | STR-friendly leisure markets: Smoky Mountains (TN/NC), FL Panhandle, Colorado ski country, Lake of the Ozarks (MO), Lake Tahoe (CA/NV), Outer Banks (NC), Hilton Head (SC), Cape Cod (MA) |
| **Income** | $150K–$500K W-2 |
| **Education** | College+ |
| **Occupation** | Professional with high discretionary income |
| **Net worth** | $1M–$5M |
| **FICO band** | 700–800 |

**Psychographics**
- Pain points: "I want to use the property 4 weeks a year but finance it as a rental"; "Conventional lenders won't count STR income from a property I use personally"
- Aspirations: Personal enjoyment + rental income, eventual retirement property
- Media consumption: STR + travel content, Airbnb magazine, Travel + Leisure

**Meta targeting**
- Interests: `Airbnb`, `VRBO`, `Vacation rental`, `Second home`, `Mountain cabin`, `Lake house`, `Beach house`
- Behaviors: `Frequent travelers`
- Custom audience: Closed hybrid-use loans

**Google**
- In-market: `Travel > Vacation Rentals`, `Real Estate > Investment Properties`
- Affinity: `Travel > Vacation Rental Hosts`, `Home & Garden > Real Estate`

**LinkedIn**
- Job titles: Various professional titles; targeting by profession is secondary
- Groups: Travel + real estate investing

**TikTok**
- Hashtags: `#airbnb`, `#vacationrental`, `#cabinlife`, `#lakelife`, `#beachlife`, `#secondhome`
- Creator categories: Travel, Real Estate

**Headlines**

*Meta:*
1. "Own a vacation cabin that pays for itself — DSCR STR loans"
2. "Use your STR 4 weeks a year, rent it 48 — DSCR hybrid financing"
3. "Mountain cabin? Beach house? Lake property? DSCR STR loans"
4. "Second home + rental income — DSCR makes it work"
5. "Personal-use + rental? DSCR loans for hybrid STR properties"

*Google:*
1. "DSCR STR Loans | Vacation Property Financing"
2. "Hybrid Personal-Use + Rental | DSCR STR Lender"
3. "Cabin, Beach House, Lake Property | DSCR STR Loans"
4. "Vacation Rental Mortgage | DSCR for Second Homes"
5. "Second Home Rental Financing | DSCR Loans"

*LinkedIn:*
1. "Hybrid personal-use + rental properties — DSCR STR loans"
2. "Vacation property owners: DSCR loans that allow personal use"

*TikTok:*
1. "How I financed my mountain cabin as an Airbnb"
2. "Hybrid STR loans explained — use it 4 weeks, rent it 48"
3. "Vacation property + rental income = DSCR"

**Primary text**

*Meta:*
- "Own a vacation cabin you also use personally? DSCR STR loans allow hybrid personal-use + rental structures. Most clients use the property 2–6 weeks/year, rent it the rest. Qualify on AirDNA + rental cash flow."
- "Mountain, beach, or lake property — DSCR STR loans for vacation homes that pay for themselves through rental income."

*Google:*
- "DSCR STR loans for vacation properties with personal-use allowance. Most lenders restrict to pure rental; we allow hybrid structures."
- "Cabin, beach house, lake property — DSCR loans underwritten on AirDNA + rental cash flow."

*LinkedIn:*
- "Hybrid personal-use + rental DSCR STR loans for vacation properties."
- "We finance vacation properties that owners also use personally — most lenders won't."

*TikTok:*
- "How I financed my Smoky Mountains cabin as a hybrid STR + personal-use property."
- "Vacation property + rental income — DSCR STR loans explained."

**Visual direction**
- Lifestyle: Cabin / lake / beach scene with property; laptop showing Airbnb calendar
- Color palette: Warm escape (#C2410C), forest green (#166534), sky blue
- Models: Active 40s–60s, casual attire, no specific demographic

**Compliance + audience concern**
- 🟢 **ECOA risk:** LOW. STR + vacation property is intent-based.
- 🟡 **Note:** Mountain / lake / beach leisure markets have varying racial compositions. Don't target by these markets AND by demographic proxies (e.g., "ski resort = affluent white" is a classic redlining trap — just target by the market itself).

**CTA + CPL**
- CTA: Lead form + click-to-call
- CPL estimate: Meta $50–$95, Google $110–$210, LinkedIn $140–$240, TikTok $40–$80

---

### PERSONA 11 — "Builder / Developer (Construction-to-DSCR)"

**Archetype:** Small builder or developer building a property to rent (or build-and-hold). Needs construction financing + take-out to DSCR permanent.

| Field | Spec |
|---|---|
| **Age band** | 35–55 |
| **Gender** | Not targeted |
| **Location** | Growth markets: TX, FL, NC, SC, GA, TN, AZ, NV |
| **Income** | $200K–$1M |
| **Education** | College+ |
| **Occupation** | Builder, developer, general contractor |
| **Net worth** | $500K–$5M |
| **FICO band** | 680–760 |

**Psychographics**
- Pain points: "I need construction financing now and permanent DSCR when the property is done"; "Local banks take 90 days to close on construction"
- Aspirations: Build-and-hold rental portfolio, eventually syndicate
- Media consumption: Construction industry publications, Builder Magazine, local NAHB chapters

**Meta targeting**
- Interests: `Real estate development`, `Construction`, `General contractor`, `Builder`, `New construction`
- Behaviors: `Small business page admins`, `Frequent travelers` (often site visits)

**Google**
- In-market: `Real Estate > New Construction`, `Business > Construction`
- Affinity: `Business Professionals > Construction`

**LinkedIn**
- Job titles: `General Contractor`, `Builder`, `Real Estate Developer`, `Construction Manager`
- Company size: SMB (11–50, 51–200)
- Groups: `NAHB`, `Real Estate Development`

**TikTok**
- Hashtags: `#realestatedevelopment`, `#newconstruction`, `#buildandhold`, `#rentaldevelopment`, `#construction`
- Creator categories: Construction, Real Estate

**Headlines**

*Meta:*
1. "Build-and-hold rental? Construction + DSCR take-out financing"
2. "Construction loans that convert to DSCR at completion"
3. "Builder financing for rental property construction"
4. "Developers: DSCR permanent financing at certificate of occupancy"
5. "Construction + DSCR take-out for small builders"

*Google:*
1. "Construction to DSCR Permanent Financing"
2. "Build-and-Hold Rental Financing | Construction + DSCR"
3. "Builder Loan for Rental Property Construction"
4. "Construction Take-Out to DSCR Loan"
5. "Developer Rental Property Construction Loans"

*LinkedIn:*
1. "Builders + developers: construction financing that converts to DSCR at CO"
2. "Build-and-hold rental property financing — construction + take-out"

*TikTok:*
1. "How I built a rental with construction + DSCR take-out"
2. "Construction to DSCR explained"
3. "Build-and-hold financing for small developers"

**Primary text**

*Meta:*
- "Build-and-hold rental property? We provide construction financing that converts to a DSCR permanent loan at certificate of occupancy. One lender, one close, one relationship."
- "Small developers + builders: construction + DSCR take-out. Most close construction in 30 days, DSCR take-out at CO."

*Google:*
- "Construction to DSCR permanent financing for build-and-hold rental property."
- "Builder loans that convert to DSCR at completion — single relationship."

*LinkedIn:*
- "Builders + developers: construction financing that converts to DSCR at CO. One lender, one relationship."
- "Build-and-hold rental property construction + DSCR take-out — single lender."

*TikTok:*
- "How I financed a build-and-hold rental — construction + DSCR take-out."
- "Construction to DSCR permanent — explained."

**Visual direction**
- Lifestyle: Active construction site with builder; property framing or finishing
- Color palette: Hard hat yellow (#CA8A04), industrial gray, navy
- Models: 30s–50s, work attire

**Compliance + audience concern**
- 🟢 **ECOA risk:** LOW. Builder / developer is a business-purpose filter.

**CTA + CPL**
- CTA: Click-to-call + lead form (construction deals are relationship-driven)
- CPL estimate: Meta $80–$140, Google $140–$260, LinkedIn $170–$300, TikTok $70–$120

---

### PERSONA 12 — "Fix-and-Flip Pivot to Rental"

**Archetype:** Existing fix-and-flip operator who decides to hold one of their flips as a long-term rental. Transitioning from transactional to hold strategy.

| Field | Spec |
|---|---|
| **Age band** | 35–55 |
| **Gender** | Not targeted |
| **Location** | Strong flip markets: TX, FL, GA, NC, AZ, NV, OH, IN, MI |
| **Income** | $150K–$500K (variable, deal-by-deal) |
| **Education** | College+ |
| **Occupation** | Full-time flipper or hybrid (W-2 + flip side) |
| **Net worth** | $300K–$3M |
| **FICO band** | 660–740 |

**Psychographics**
- Pain points: "I just finished a flip and want to hold it as a rental — flip lender won't refi"; "Bridge loan is rolling off in 60 days"
- Aspirations: Transition to passive rental income, stabilize income from fewer transactions
- Media consumption: BiggerPockets (Flipping channel), FlipNerd, REI podcasts, local REI clubs

**Meta targeting**
- Interests: `Fix and flip`, `House flipping`, `Real estate investing`, `BiggerPockets`, `Rehab`
- Behaviors: `Small business page admins`

**Google**
- In-market: `Real Estate > Investment Properties`, `Real Estate > Fix and Flip`
- Affinity: `Real Estate Enthusiasts`

**LinkedIn**
- Job titles: `Real Estate Investor`, `House Flipper`, `Rehabber`
- Groups: `BiggerPockets Network`, `Real Estate Investing`

**TikTok**
- Hashtags: `#fixandflip`, `#houseflip`, `#rehab`, `#rentalproperty`, `#biggerpockets`
- Creator categories: Real Estate

**Headlines**

*Meta:*
1. "Just finished a flip? Hold it as a rental with a DSCR loan"
2. "Bridge loan rolling off? DSCR take-out for flip-to-rent"
3. "Flip-to-rent transition — DSCR permanent financing"
4. "Convert your flip into a long-term rental"
5. "Refinance your flip at completion — DSCR take-out"

*Google:*
1. "Flip to Rental Refinance | DSCR Take-Out Loan"
2. "Hold Your Flip as a Rental | DSCR Permanent Financing"
3. "Bridge to DSCR Take-Out | Flip-to-Rent Transition"
4. "DSCR Loan After Flip Completion"
5. "Flip-to-Rent Conversion Financing"

*LinkedIn:*
1. "House flippers: convert your flip into a long-term rental with a DSCR take-out loan"
2. "Bridge-to-DSCR take-out for flip-to-rent transitions"

*TikTok:*
1. "How I kept my flip as a rental instead of selling"
2. "Bridge to DSCR take-out — explained"
3. "Flip-to-rent transition: how it works"

**Primary text**

*Meta:*
- "Just finished a flip and want to hold it as a rental? DSCR take-out loan: refi the bridge at completion, hold as long-term rental. Most flip-to-rent transitions close in 21 days."
- "Bridge loan rolling off in 60 days? DSCR permanent take-out converts your flip into a held rental asset."

*Google:*
- "DSCR take-out loans for fix-and-flip operators transitioning to long-term rental. Close in 21 days."
- "Flip-to-rent conversion: bridge to DSCR permanent financing."

*LinkedIn:*
- "House flippers: DSCR take-out loans for flip-to-rent transitions. Most close in 21 days."
- "Bridge-to-DSCR conversion — one lender for both phases."

*TikTok:*
- "How I kept my flip as a rental — DSCR take-out loan at completion."
- "Bridge to DSCR — explained for house flippers."

**Visual direction**
- Lifestyle: Renovated property exterior; laptop showing rent roll
- Color palette: Renovation green (#16A34A), navy, white
- Models: 30s–50s, work-casual

**Compliance + audience concern**
- 🟢 **ECOA risk:** LOW.

**CTA + CPL**
- CTA: Click-to-call + lead form
- CPL estimate: Meta $60–$110, Google $120–$220, LinkedIn $150–$250, TikTok $50–$90

---

## 2. Top 5 Personas by Ad-Platform Reach

Ranked by estimated reachable audience × conversion fit:

| Rank | Persona | Why Top Reach | Primary Platform | Secondary |
|------|---------|---------------|------------------|-----------|
| **1** | Persona 1 — Side-Hustle SFR Landlord | Largest addressable market; W-2 professionals are 60%+ of DSCR closings industry-wide | Meta (interest targeting via BiggerPockets, REI interests) | Google (high-intent search) |
| **2** | Persona 5 — First-Time DSCR | Reaches the full "aspiring investor" funnel; bigger TAM than active investors | Meta (interest + behavior) | TikTok (cost-efficient younger audience) |
| **3** | Persona 2 — STR / Airbnb Operator | STR is fastest-growing DSCR segment; well-defined interest targeting | Meta (Airbnb/VRBO interests) | TikTok (#airbnbhost reach) |
| **4** | Persona 6 — Self-Employed Real-Estate Pro | Large Realtor/contractor population; LinkedIn job-title targeting is precise | LinkedIn (job titles + groups) | Meta (REI interests) |
| **5** | Persona 3 — Portfolio Builder | High LTV (large loans); well-defined interests | Meta (REI interests) + Google (search) | LinkedIn (job titles for portfolio managers) |

**Notes on reach:**
- Meta Special Ad Category: Housing cuts Meta reach by ~50% vs. non-housing ads in same vertical (lose zip-code + age + gender filters). This is the largest platform-level constraint and is why reach rankings favor interest-rich personas (1, 2, 5).
- LinkedIn job-title targeting is the cleanest B2B filter but volume is lower than Meta/Google.
- TikTok is cost-efficient for Persona 5 (First-Time DSCR) but may not drive LO-quality leads without pixel + landing-page optimization.
- Google Search has highest intent but highest CPL ($90–$280).

---

## 3. Universal ECOA Audit Findings (Cross-Persona)

| # | Concern | Affected Personas | Mitigation |
|---|---------|-------------------|------------|
| 1 | **"First-time homebuyer" language** | 5 | Replace with "first-time investor" or "first rental property buyer." "First-time homebuyer" is FHAct §805 protected-class advertising trigger (proxy for age/family status discrimination). |
| 2 | **Geographic exclusion of majority-minority metros** | 1, 2, 3, 7 | Every geography exclusion must be justified by documented business reason (state PPP matrix, lender licensing footprint, no DSCR product in market). NEVER exclude based on demographic composition. |
| 3 | **Income targeting proxies** | All | "Income" is not directly targetable; ensure interest/behaviors filters don't skew toward "high-income lifestyle" (proxy for race/class). Use business-purpose interests only. |
| 4 | **Lookalike seed sources** | All | Use closed-loan customers as lookalike seed. NEVER use a lookalike built from a base filtered by protected-class attribute. Meta Housing Special Ad Category blocks this automatically; document the seed source for audit. |
| 5 | **Language targeting** | 8 (FN), 5 (Spanish-language) | Spanish-language ad targeting requires documented business justification (e.g., Hispanic homeownership outreach with mission language). FN language targeting is allowed because FN is a credit-eligibility category, not a demographic — document this distinction carefully. |
| 6 | **"Millennial / Gen Z / Boomer" age framing** | All | NEVER target by age generation. Use intent + interest + behavior. |
| 7 | **"Empty nester / Retiree / Senior" age framing** | 9 (1031), 10 (vacation), 12 (flip) | Actuarial justification required for 62+ targeting. Most DSCR ads should avoid age-implied language entirely; rely on interest targeting. |
| 8 | **"Family with children" or "parent" framing** | 5, 10 | Familial status is protected. Avoid imagery implying families with children OR singles — use neutral adult imagery. |
| 9 | **Zip-code-level exclusions** | All | Meta Housing Special Ad Category blocks this; on Google, ensure any geo-exclusion is state-or-larger; document business justification. |
| 10 | **Ad creative with demographic cues** | All | Review all creative (images, copy, models, settings) for protected-class implication. Use neutral imagery. Run creative past compliance review before launch. |
| 11 | **"Single mom" or "divorced" framing** | None should appear | Marital status + familial status are protected. |
| 12 | **Disability or "accessibility" framing** | None should appear | Disability is protected. Don't claim "accessible" unless the property genuinely is. |
| 13 | **"Faith-based" or religion references** | None | Religion is protected. |
| 14 | **"Veterans only" or military-specific targeting** | Allowed only if program is VA-loan-only | If using veteran-targeted ads, ensure loan product is actually available to veterans (e.g., VA loan) — otherwise it's discrimination by military status if done in a way that excludes non-veterans from equally available products. |
| 15 | **Public-assistance income references** | None | ECOA prohibits discrimination based on public-assistance income. Don't target or exclude based on this. |

---

## 4. Per-Persona ECOA Concern (1 per — for parent report)

| Persona | ECOA Concern | Severity |
|---------|--------------|----------|
| 1. Side-Hustle SFR Landlord | Geography restriction must be tied to lender licensing, not demographic composition | 🟡 MEDIUM |
| 2. STR / Airbnb Operator | STR-heavy metros have varying demographics — don't filter by composition; use market demand data | 🟡 MEDIUM |
| 3. Portfolio Builder | "Relationship lender" language must not exclude classes of borrowers | 🟢 LOW |
| 4. DSCR Second | Avoid "low payment" / "free" / cost-comparison without proper APR disclosure (TILA-RESPA, not ECOA but adjacent) | 🟢 LOW |
| 5. First-Time DSCR | NEVER use "first-time homebuyer" — replace with "first-time investor" (FHAct §805 advertising trap) | 🔴 HIGH |
| 6. Self-Employed RE Pro | LinkedIn job-title targeting must be business-purpose justification (underwriting complexity), not demographic | 🟢 LOW |
| 7. Multi-Family | Multi-family > 5 units is generally NOT ECOA dwelling-secured, but FHAct advertising rules still apply if marketed as residential | 🟢 LOW |
| 8. Foreign National | National origin is protected — FN targeting must be justified as credit-eligibility category (no U.S. tax/credit), not demographic filter | 🟡 MEDIUM |
| 9. 1031 Exchange Upgrader | Time-pressure messaging cannot be deceptive; always disclose DSCR ≥ 1.0 | 🟢 LOW |
| 10. Vacation Cabin / Hybrid STR | Mountain / lake / beach markets can be demographic-skewed; target by market, not demographic | 🟢 LOW |
| 11. Builder / Developer | Builder occupation is business-purpose, not demographic — robust | 🟢 LOW |
| 12. Fix-and-Flip Pivot | Flip-to-rent transition is intent-based; no demographic concern | 🟢 LOW |

---

## 5. Open Questions / UNVERIFIED Items

- **CPL estimates** are rough industry ranges; actual CPL depends on funnel quality, lead-form completion rate, and creative quality. UNVERIFIED against current platform benchmarks.
- **LinkedIn job-title targeting for housing ads** — LinkedIn's policy on job-title targeting combined with credit/housing ads is **less restrictive than Meta's** but UNVERIFIED for 2026-specific guidance. Recommend re-checking LinkedIn Ads Policy before launching.
- **TikTok housing-specific ad restrictions** — TikTok has tightened housing-related ad policies in 2024–2025, but specific 2026 implementation details UNVERIFIED. Pre-approval required.
- **State-specific advertising restrictions** — some states (CA, NY, MA) have additional fair-lending advertising rules. UNVERIFIED for state-by-state DSCR ad compliance; recommend legal review before launch.
- **MN HF 3437 (effective Aug 1, 2026)** — new state PPP rules may affect MN-targeted ad copy. UNVERIFIED specific advertising impact.

---

## 6. Recommended Next Steps

1. **Cross-check against SA1–SA8** once they land — fill any persona gaps.
2. **Creative review** — every ad creative should go through fair-lending compliance review before launch (race-neutral imagery, neutral language, no demographic cues).
3. **A/B test framework** — set up Meta + Google experiments with 2–3 creative variants per persona; measure CPM and CPL against the ranges above.
4. **Lead-form vs click-to-call test** — STR operators and 1031 borrowers prefer voice; portfolio builders and self-employed prefer lead form. Run split tests.
5. **Compliance documentation** — document business justification for every geography exclusion; archive lookalike seed sources; save creative review logs.
6. **State-by-state legal review** — before launching in CA, NY, MA, or any state with enhanced fair-lending advertising rules, run legal review.

---

**End of SA9 deliverable.**

*Generated by dscr-verifier on 2026-06-22. This file is compliance-first: every persona and targeting spec is built around ECOA / Reg B / FHAct / Meta Housing Special Ad Category / Google Credit-Ads / TikTok Housing policies. Where compliance is uncertain → flagged as 🟡 or 🔴. Where estimates (CPL, reach) are based on industry knowledge rather than platform-specific 2026 data → flagged as UNVERIFIED.*
