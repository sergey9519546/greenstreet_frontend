#!/usr/bin/env python3
"""
Greenstreet Finance — Program Page Content
All content is original. Research data informs rate matrices and program structure.
"""
from page_builder import register, PROGRAMS


# ============================================================
# 1. DSCR Loans — Main Program Page
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-loans",
    "title": "DSCR Loans — The Broker's Guide to Debt-Service Coverage Ratio Lending",
    "meta_description": "How DSCR loans work for real estate investors. Qualification, rate tiers, LTV by scenario, lender matrix — everything brokers need to quote and close.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · Core",
            "title": "DSCR Loans — qualify the property, not the person",
            "intro": "Debt-Service Coverage Ratio lending is the dominant non-QM instrument for rental-property investors in 2026. This is the broker's operating manual: how the math works, how lenders tier it, and where the edge cases break.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · DSCR",
        }},
        {"kind": "stats", "args": {
            "title": "The 2026 DSCR rate sheet, at a glance",
            "stats": [
                {"label": "Rates from", "value": "5.75%", "color": "mint"},
                {"label": "Max LTV (purchase)", "value": "85%", "color": "light-green"},
                {"label": "Min FICO", "value": "620", "color": "emerald"},
                {"label": "Max loan amount", "value": "$15M", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "The underwriting doctrine",
            "title": "Track 1 vs Track 2 — the difference between qualifying and performing",
            "body_html": """
                <p>Every DSCR file in our engine runs through two parallel tracks, and we never let them blur.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Track 1 — Lender Qualification DSCR.</strong> Gross monthly rent from a 1007 or in-place lease, divided by PITIA (or ITIA if interest-only). No vacancy, no management fee, no friction. This is the ratio the lender's matrix uses to say yes or no.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Track 2 — Investor Survival DSCR.</strong> Effective rent after a realistic vacancy haircut (we default to 8%) minus a management fee (default 8%), divided by the same ITIA. This is whether the deal actually performs after closing.</p>
                <p style="margin-top:1rem">A file can pass Track 1 at 1.42 and fail Track 2 at 0.97. Most brokers only quote Track 1 and pray. We surface the gap before submission.</p>
            """,
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Lender matrix · 2026",
            "title": "How the major non-QM lenders tier DSCR",
            "intro": "Across the 24 active DSCR programs we track, this is the consolidated tier structure. Most lenders cluster within 0.25pp of each other on rate; the differentiation is on LTV, reserves, and entity requirements.",
            "headers": ["DSCR tier", "LTV max (purchase)", "Rate add vs base", "Notes"],
            "rows": [
                ["≥ 1.25", "80%", "0 (baseline)", "Standard pricing. Most lenders will compete hardest here."],
                ["1.10 – 1.24", "75%", "+0.10 to +0.25%", "Tight DSCR. Some lenders require 6+ months reserves."],
                ["1.00 – 1.09", "75%", "+0.25 to +0.50%", "Marginal. Re-cut the deal or accept the add."],
                ["0.75 – 0.99", "70%", "+0.75 to +1.00%", "Sub-1.0 program. Cash-out usually restricted to 65% LTV."],
                ["< 0.75", "65%", "+1.00 to +1.25%", "No-Ratio program. FICO floor jumps to 680+ at most shops."],
            ],
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Qualification",
            "title": "What you actually need to qualify",
            "body_html": """
                <p><strong>Property.</strong> 1-4 unit residential, condotel, or non-owner-occupied SFR. Some lenders accept 5+ unit small multifamily up to $3M. Rural and land-only are usually out.</p>
                <p style="margin-top:1rem"><strong>Rent.</strong> Form 1007 (market rent study), in-place lease, or AirDNA-derived STR revenue with a 20-30% haircut. Most lenders accept the lowest of the three. Some now allow a 1007 with no lease if the property is in a stable rental submarket.</p>
                <p style="margin-top:1rem"><strong>Borrower.</strong> US citizen, permanent resident, ITIN holder, or foreign national. No personal income documentation, no employment verification, no DTI calculation. Credit score drives pricing, not approval.</p>
                <p style="margin-top:1rem"><strong>Reserves.</strong> Typically 2-6 months PITIA depending on FICO and DSCR tier. Higher reserves unlock better LTV at most lenders.</p>
                <p style="margin-top:1rem"><strong>Entity.</strong> LLC or corp vesting is standard; some lenders accept individual vesting. Most require the entity to be in good standing in its formation state.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "Prepayment penalty structures — the cost of optionality",
            "body_html": """
                <p>The cheapest rate comes with a 5-year step-down prepay. The most expensive rate buys you the right to refi or sell anytime. Pick the structure that matches your hold period — not the headline rate.</p>
                <p style="margin-top:1rem"><strong>5-year step-down (5-4-3-2-1):</strong> Baseline rate. 5% in year 1, 4% in year 2, etc. Cheapest monthly payment.</p>
                <p style="margin-top:1rem"><strong>3-year step-down (3-2-1):</strong> +0.10 to +0.25% rate add. Common exit for BRRRR or short hold.</p>
                <p style="margin-top:1rem"><strong>2-year step-down (2-1):</strong> +0.25 to +0.50% rate add. Common for fix-and-flip exits.</p>
                <p style="margin-top:1rem"><strong>1-year only:</strong> +0.40 to +0.65% rate add. One prepayment allowed with penalty.</p>
                <p style="margin-top:1rem"><strong>No prepay:</strong> +0.50 to +1.00% rate add. Right to refi or sell anytime, no penalty.</p>
                <p style="margin-top:1rem">The 0.50-0.75% rate hit for no-prepay only makes sense if you'll refi or sell within 2-3 years. If the hold is longer, the 5-year prepay is almost always cheaper in dollar terms.</p>
            """,
            "eyebrow": "Pricing mechanics",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR for Airbnb &amp; Short-Term Rental", "/programs/dscr-airbnb-str.html", "Program guide"),
                ("Foreign National DSCR", "/programs/dscr-foreign-national.html", "Program guide"),
                ("ITIN DSCR loans", "/programs/dscr-itin.html", "Program guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 2. DSCR for Airbnb / Short-Term Rental
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-airbnb-str",
    "title": "DSCR Loans for Airbnb &amp; Short-Term Rentals — Broker Playbook",
    "meta_description": "STR underwriting, AirDATA revenue, legality gates, and the 20% haircut. How brokers price short-term rental DSCR in 2026.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · STR",
            "title": "DSCR for Airbnb &amp; Short-Term Rentals — the underwriting is different",
            "intro": "STR income is volatile, seasonally skewed, and legally gated. A vanilla DSCR calc will overstate revenue by 20-40% and ignore the ordinance risk. Here's how brokers who specialize in STR actually underwrite it.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · STR",
        }},
        {"kind": "stats", "args": {
            "title": "The 2026 STR DSCR rate sheet",
            "stats": [
                {"label": "Rates from", "value": "6.25%", "color": "mint"},
                {"label": "Max LTV", "value": "80%", "color": "light-green"},
                {"label": "AirDNA haircut", "value": "20-30%", "color": "emerald"},
                {"label": "Min FICO", "value": "660", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "The underwriting framework",
            "title": "Three pillars: revenue haircut, legality gate, seasonality reserve",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">Pillar 1 — Revenue haircut.</strong> The lender accepts the lower of: in-place rental income (if a long-term lease exists), a 1007 market rent study, or AirDATA-derived trailing 12-month revenue multiplied by a 20-30% haircut. That haircut is your buffer against vacancy, platform fees, cleaning costs, and management.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Pillar 2 — Legality gate.</strong> Before quoting, confirm the property is in a jurisdiction that allows short-term rentals. Some markets (NYC, many CA cities, parts of FL) restrict or ban STR outright. Some require active permits, registration, or primary-residence-only operation. A DSCR loan on a non-conforming STR is a default waiting to happen.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Pillar 3 — Seasonality reserve.</strong> Beach and ski markets can swing 5x between high and low season. Most STR programs require 6-9 months PITIA in reserves, vs 2-3 months for long-term rental. Some require the property to demonstrate 12 months of operating history.</p>
            """,
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Lender matrix · STR",
            "title": "How STR-active lenders stack up",
            "intro": "Only a subset of DSCR lenders actively do STR. This is who we route to, and what each one requires.",
            "headers": ["Lender", "Min FICO", "Max LTV", "STR documentation", "Haircut"],
            "rows": [
                ["Visio Lending", "660", "80%", "AirDNA 12-mo TTM", "20%"],
                ["Kiavi", "660", "80%", "AirDNA or 1007", "25%"],
                ["Newfi Wholesale", "680", "75%", "AirDNA + photos", "20%"],
                ["Angel Oak MS", "640", "80%", "Lease OR AirDNA", "25%"],
                ["Lima One Capital", "660", "80%", "AirDNA TTM + VRBO/Airbnb URL", "25%"],
                ["Roc Capital", "680", "75%", "12-mo operating history required", "20%"],
            ],
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Property types",
            "title": "What STR DSCR lenders will and won't finance",
            "body_html": """
                <p><strong>In:</strong> Single-family rentals (1-4 unit), townhomes, condos in STR-allowed buildings, dedicated STR cabins/cottages, beach and mountain properties with documented revenue.</p>
                <p style="margin-top:1rem"><strong>Out (or restricted):</strong> Primary-residence conversions, properties in jurisdictions with active STR moratoriums, hotels and B&amp;Bs, properties without 12 months operating history (some lenders), shared-room Airbnb listings.</p>
                <p style="margin-top:1rem"><strong>Condotels:</strong> A growing niche — condo-style hotel units with on-site rental management. Most DSCR lenders now accept these with a 5-10% LTV haircut and the building must be on the lender's approved condotel list.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "The 1007 vs AirDNA decision",
            "body_html": """
                <p>If a property has no operating history (new acquisition, just listed), the lender will default to a Form 1007 market rent study. The 1007 reflects long-term rental comparables — it does NOT reflect STR income. On a high-revenue STR, the 1007 will severely understate income and may push the file out of qualifying range.</p>
                <p style="margin-top:1rem">AirDNA TTM (trailing 12-month) is the lender's view of actual STR revenue. It includes vacancy, seasonality, and platform fees. The 20-30% haircut then strips out an additional margin for the lender.</p>
                <p style="margin-top:1rem">Best practice: run both. If the 1007 qualifies, great. If not, AirDNA with a documented 12-month operating history usually unlocks the next tier of LTV. For new acquisitions with no history, plan on a longer close or a rate concession.</p>
            """,
            "eyebrow": "Underwriting mechanics",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR for Condotels", "/programs/dscr-condotel.html", "Program guide"),
                ("Foreign National DSCR", "/programs/dscr-foreign-national.html", "Program guide"),
                ("DSCR loans in Florida", "/states/florida.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 3. Foreign National DSCR
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-foreign-national",
    "title": "Foreign National DSCR Loans — How Non-US Investors Finance US Rental Property",
    "meta_description": "Foreign national DSCR loans for non-US citizens buying US investment property. Qualification, documentation, and rate premium.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · Foreign National",
            "title": "Foreign National DSCR — no US credit, no US tax returns, US rental income",
            "intro": "Foreign national DSCR is the fastest-growing niche in non-QM. Canadian, Mexican, Indian, Chinese, Brazilian, and European buyers are scaling US rental portfolios without a US credit footprint. Here's what the lenders actually want.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · FN",
        }},
        {"kind": "stats", "args": {
            "title": "Foreign National DSCR terms, 2026",
            "stats": [
                {"label": "Rates from", "value": "7.25%", "color": "mint"},
                {"label": "Max LTV", "value": "75%", "color": "light-green"},
                {"label": "Rate premium vs US", "value": "0.50-1.00%", "color": "emerald"},
                {"label": "US credit required", "value": "No", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "Qualification framework",
            "title": "What FN lenders actually underwrite",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">Property &amp; DSCR.</strong> Same as standard DSCR — the property's monthly rent covers the monthly PITIA. FN lenders tier the same way: 1.25+ standard, 1.00-1.25 tighter, sub-1.0 harder to find.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Foreign credit.</strong> Two letters from non-US banking or financial institutions, translated and apostilled. Most lenders accept letters from the borrower's home country bank showing 12+ months of relationship, average balances, and good standing. No US FICO required, but a US credit pull may still happen (will be a thin file or no-hit).</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">US bank account.</strong> Required for servicing. Most lenders will help the borrower open an account as part of the closing process.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Down payment.</strong> 25-30% minimum. Higher down sometimes unlocks better rate. Source of funds must be documented and traceable — wire transfers from foreign accounts require a clear paper trail.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">ITIN holders.</strong> A separate, often-cheaper program. See the ITIN guide.</p>
            """,
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Country-specific notes",
            "title": "Top FN buyer countries and what each lender requires",
            "intro": "Lenders treat some countries more favorably than others based on political/economic risk, asset repatriation laws, and historical default rates.",
            "headers": ["Country", "Best lender fit", "Special requirements", "Typical rate premium"],
            "rows": [
                ["Canada", "Most FN programs", "Standard FN documentation; no special hurdles", "0.50%"],
                ["Mexico", "Most FN programs", "CURP required; some lenders want US-side entity", "0.50-0.75%"],
                ["India", "Larger specialist lenders", "Passport, OCI/PIO card, foreign credit letters", "0.75-1.00%"],
                ["China", "Specialty FN shops only", "FIRPTA-compliant structure; smaller loan amounts", "1.00-1.50%"],
                ["United Kingdom / EU", "Most FN programs", "Standard FN documentation", "0.50-0.75%"],
                ["Brazil / LATAM", "Specialty lenders", "CPF/CNPJ; currency hedging considerations", "0.75-1.00%"],
            ],
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Documentation checklist",
            "title": "What you need to gather before applying",
            "body_html": """
                <p><strong>Identity:</strong> Passport (color copy of photo page and signature page), visa or entry stamp (if applicable).</p>
                <p style="margin-top:1rem"><strong>Address:</strong> Proof of current foreign address (utility bill, bank statement, lease).</p>
                <p style="margin-top:1rem"><strong>Foreign credit:</strong> Two letters from non-US banks/institutions confirming 12+ month relationship, in English or translated.</p>
                <p style="margin-top:1rem"><strong>Source of funds:</strong> Bank statements (3-6 months), wire transfer records for down payment and reserves, gift letter if any portion is gifted.</p>
                <p style="margin-top:1rem"><strong>US-side:</strong> ITIN if available (helps), US bank account (will be set up during closing), entity formation docs if vesting in LLC.</p>
                <p style="margin-top:1rem"><strong>Property:</strong> Purchase contract, Form 1007 (rent study), insurance binder, HOA docs if applicable.</p>
            """,
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("ITIN DSCR loans", "/programs/dscr-itin.html", "Program guide"),
                ("DSCR for Canadian investors", "/resources/canadian-investors.html", "Specialty guide"),
                ("DSCR loans in Florida", "/states/florida.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 4. ITIN DSCR
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-itin",
    "title": "ITIN DSCR Loans — Buy US Rental Property with an ITIN",
    "meta_description": "How to get a DSCR loan with an ITIN. ITIN documentation, lender options, qualification requirements for non-US-credit borrowers.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · ITIN",
            "title": "ITIN DSCR — for borrowers who pay US taxes but can't get a US FICO",
            "intro": "An Individual Taxpayer Identification Number is not an SSN, but it lets a borrower file US tax returns and build a US tax payment history. ITIN DSCR programs exist for exactly this profile: tax-compliant, no SSN, real cash flow, no US credit file.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · ITIN",
        }},
        {"kind": "stats", "args": {
            "title": "ITIN DSCR terms, 2026",
            "stats": [
                {"label": "Rates from", "value": "7.50%", "color": "mint"},
                {"label": "Max LTV", "value": "75%", "color": "light-green"},
                {"label": "Min FICO", "value": "None (ITIN)", "color": "emerald"},
                {"label": "Tax returns required", "value": "2 yrs", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "ITIN vs Foreign National",
            "title": "Why ITIN is often the better program",
            "body_html": """
                <p>ITIN borrowers have an IRS-issued ID number and (usually) 2+ years of US tax returns. That's a much stronger credit story than Foreign National with no US presence. Most ITIN lenders price 0.50-1.00% below Foreign National.</p>
                <p style="margin-top:1rem">The tradeoff: ITIN requires a documented US tax filing history. If the borrower hasn't filed (or has filed with an SSN misuse issue), ITIN programs are off the table and you fall back to Foreign National.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Who fits ITIN DSCR:</strong> Spouses of US citizens or green-card holders, non-resident aliens with US business interests, expat investors rebuilding US presence, DACA recipients and certain visa holders.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Who doesn't:</strong> Pure Foreign National with no US tax filings — go to FN DSCR. Borrowers with valid SSN but thin credit — go to standard DSCR.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "Documentation checklist — ITIN DSCR",
            "body_html": """
                <p><strong>Identity:</strong> ITIN assignment letter from IRS, passport, visa or entry record.</p>
                <p style="margin-top:1rem"><strong>US tax filings:</strong> Last 2 years of federal returns (Form 1040), corresponding W-2s or 1099s if applicable, proof of filing (transcripts).</p>
                <p style="margin-top:1rem"><strong>US banking:</strong> 3-6 months bank statements, evidence of consistent deposits matching reported income.</p>
                <p style="margin-top:1rem"><strong>Source of funds:</strong> Documented down payment and reserves (typically 6+ months PITIA), gift letter if any portion is gifted.</p>
                <p style="margin-top:1rem"><strong>Property:</strong> Same as standard DSCR — purchase contract, 1007, insurance binder, HOA docs.</p>
            """,
            "eyebrow": "Documentation",
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Common edge cases",
            "title": "When ITIN DSCR breaks",
            "body_html": """
                <p><strong>ITIN expired.</strong> ITINs expire if not used on a US tax return for 3 consecutive years. If the borrower's ITIN has lapsed, they need to renew it before closing — adds 6-8 weeks.</p>
                <p style="margin-top:1rem"><strong>Married filing jointly with non-ITIN spouse.</strong> Most lenders want the ITIN borrower as the primary. Spouse can be on title but isn't on the loan.</p>
                <p style="margin-top:1rem"><strong>Self-employment income.</strong> ITIN borrowers with reported self-employment income are fine; lenders don't verify personal income but they do verify tax filing consistency.</p>
                <p style="margin-top:1rem"><strong>No tax filings at all.</strong> If the borrower has ITIN but never filed, route to Foreign National program instead — same rate premium, no IRS history required.</p>
            """,
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("Foreign National DSCR", "/programs/dscr-foreign-national.html", "Program guide"),
                ("DSCR for LLC entity", "/programs/dscr-llc.html", "Program guide"),
                ("DSCR loans in Texas", "/states/texas.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 5. LLC DSCR
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-llc",
    "title": "LLC DSCR Loans — Holding Rentals in an LLC the Right Way",
    "meta_description": "How to structure DSCR loans in an LLC. Entity requirements, multi-member LLCs, single-purpose vehicles, and lender treatment.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · Entity",
            "title": "LLC DSCR — why entity vesting is now the default, not the exception",
            "intro": "Holding rentals in an LLC is liability protection, estate planning, and accounting hygiene. Most DSCR lenders now require it. Here's how to do it without making the loan file impossible.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · ENTITY",
        }},
        {"kind": "stats", "args": {
            "title": "LLC DSCR terms, 2026",
            "stats": [
                {"label": "Single-member LLC", "value": "Standard pricing", "color": "mint"},
                {"label": "Multi-member LLC", "value": "+0.125-0.25%", "color": "light-green"},
                {"label": "Series LLC", "value": "Lender-specific", "color": "emerald"},
                {"label": "Min FICO (borrower)", "value": "620", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "Entity structure",
            "title": "What the lender actually needs",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">Single-member LLC.</strong> Treated identically to individual vesting for most lenders. No rate add, no extra documentation beyond the operating agreement and EIN. This is the cleanest structure.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Multi-member LLC.</strong> All members with 20%+ ownership must qualify (credit, not income). Expect a 0.125-0.25% rate add at most lenders. Operating agreement and capital account statements required.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Series LLC.</strong> Some lenders accept a Series LLC for portfolio DSCR loans where each property sits in its own Series. Others treat Series as separate borrowers requiring separate qualification. Confirm before structuring.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Land trust.</strong> Not accepted by most non-QM lenders. If your client uses a land trust, the underlying LLC must be the named borrower.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "Operating agreement checklist",
            "body_html": """
                <p>Most loans close faster when the operating agreement contains:</p>
                <p style="margin-top:1rem"><strong>1. Single-purpose language.</strong> "The Company is formed solely for the purpose of acquiring, owning, operating, and disposing of real property." This protects the lender from cross-collateralization risk.</p>
                <p style="margin-top:1rem"><strong>2. Authorized signer clause.</strong> Clearly identifies who can sign for the LLC and bind it to loan documents.</p>
                <p style="margin-top:1rem"><strong>3. Member ownership percentages.</strong> Must match the title commitment and the loan application.</p>
                <p style="margin-top:1rem"><strong>4. Good standing certificate.</strong> Issued by the LLC's home state within the last 60 days. Some states (CA, NY, DE) require additional certificates.</p>
                <p style="margin-top:1rem"><strong>5. EIN letter (IRS Form 147C).</strong> Confirms the LLC's tax ID. Lenders will not close without it.</p>
            """,
            "eyebrow": "Documentation",
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Common mistakes",
            "title": "Three LLC pitfalls that delay closing",
            "body_html": """
                <p><strong>1. Foreign-state LLC in a deal-state property.</strong> If the LLC is formed in Wyoming but the property is in Florida, the title company may require foreign qualification in Florida before closing. Adds 4-6 weeks and ~$500 in state filing fees.</p>
                <p style="margin-top:1rem"><strong>2. Adding a member mid-process.</strong> If the borrower adds a new member to the LLC between application and closing, most lenders will require re-underwriting. Lock the membership before you apply.</p>
                <p style="margin-top:1rem"><strong>3. EIN mismatch.</strong> If the EIN on the operating agreement doesn't match the EIN on the title commitment, the title company will reject the file. Verify all documents use the same EIN.</p>
            """,
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR Portfolio loans", "/programs/dscr-portfolio.html", "Program guide"),
                ("DSCR Cash-Out Refinance", "/programs/dscr-cash-out.html", "Program guide"),
                ("DSCR loans in Florida", "/states/florida.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 6. DSCR Cash-Out Refinance
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-cash-out",
    "title": "DSCR Cash-Out Refinance — Pull Equity Out of Your Rentals",
    "meta_description": "How DSCR cash-out refinance works. LTV limits, seasoning requirements, and when to use it vs a HELOC or rate-and-term refi.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · Cash-Out",
            "title": "DSCR Cash-Out Refinance — extract equity without income docs",
            "intro": "A DSCR cash-out refi lets you pull equity out of a rental without personal income verification. The LTV is lower than purchase or rate-and-term refi because the lender is taking more risk. Here's when it makes sense and when it doesn't.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · CASH-OUT",
        }},
        {"kind": "stats", "args": {
            "title": "DSCR cash-out terms, 2026",
            "stats": [
                {"label": "Max LTV (cash-out)", "value": "75%", "color": "mint"},
                {"label": "Seasoning required", "value": "6-12 mo", "color": "light-green"},
                {"label": "Rate add vs purchase", "value": "+0.25-0.50%", "color": "emerald"},
                {"label": "Min FICO", "value": "680", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "When it makes sense",
            "title": "Three scenarios where DSCR cash-out wins",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">1. Scaling the portfolio.</strong> You have 3 free-and-clear rentals. Use cash-out to fund 2 more purchases. The math works because the cash-out proceeds fund more DSCR-eligible properties, not consumption.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">2. BRRRR exit.</strong> You bought with hard money, rehabbed, rented it up. Now refinance into a 30-year DSCR and pull the rehab capital plus profit back out. The 6-month seasoning is the hard part.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">3. Renovation capital.</strong> Property needs significant work and the lender won't fund the rehab. Cash-out refi into a DSCR, use the proceeds for the work. Less common but legitimate.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "When it doesn't make sense",
            "body_html": """
                <p><strong>1. You need less than 30% equity.</strong> The transaction costs (origination, title, recording, prepaids) eat the benefit on small cash-outs.</p>
                <p style="margin-top:1rem"><strong>2. The property hasn't seasoned.</strong> Most lenders require 6-12 months of ownership with a documented lease history. A flip you bought 3 months ago won't qualify.</p>
                <p style="margin-top:1rem"><strong>3. Rates are dropping and you're paying a high rate.</strong> A rate-and-term refi (no cash-out) is cheaper per dollar borrowed. Do that first, then come back for cash-out later.</p>
                <p style="margin-top:1rem"><strong>4. The DSCR is sub-1.0.</strong> Most lenders won't do cash-out at sub-1.0 DSCR. If your property barely covers PITIA, the lender won't let you extract more debt against it.</p>
            """,
            "eyebrow": "When to skip",
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Cash-out mechanics",
            "title": "How lenders calculate the cash-out",
            "intro": "Cash-out proceeds are limited to a percentage of the lower of purchase price or appraised value — not your equity position. The math can surprise new investors.",
            "headers": ["Item", "Value"],
            "rows": [
                ["Property appraised value", "$500,000"],
                ["Original purchase price", "$375,000"],
                ["Lender's value (lower of appraised or purchase + improvements)", "$500,000"],
                ["Max LTV (75% cash-out)", "$375,000"],
                ["Current loan balance", "$300,000"],
                ["Maximum cash-out proceeds", "$75,000"],
                ["Less: closing costs (~3-5%)", "($2,500 - $4,000)"],
                ["Net to borrower", "~$71,000"],
            ],
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR for BRRRR", "/programs/dscr-brrrr.html", "Program guide"),
                ("DSCR Portfolio loans", "/programs/dscr-portfolio.html", "Program guide"),
                ("DSCR loans in Texas", "/states/texas.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 7. DSCR Portfolio Loans
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-portfolio",
    "title": "DSCR Portfolio Loans — Finance Multiple Rentals on One Loan",
    "meta_description": "Portfolio DSCR loans: cross-collateralize multiple rentals into a single loan. When it works, when it doesn't.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · Portfolio",
            "title": "DSCR Portfolio Loans — one application, one closing, multiple properties",
            "intro": "Portfolio DSCR cross-collateralizes 2-10 properties into a single loan. The math, documentation, and lender universe are different from a single-property deal. Here's when portfolio financing wins and when individual loans are still the better play.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · PORTFOLIO",
        }},
        {"kind": "stats", "args": {
            "title": "Portfolio DSCR terms, 2026",
            "stats": [
                {"label": "Properties per loan", "value": "2-10", "color": "mint"},
                {"label": "Aggregate loan", "value": "$1M-$15M", "color": "light-green"},
                {"label": "Min FICO", "value": "660", "color": "emerald"},
                {"label": "Aggregate DSCR target", "value": "1.10+", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "When portfolio wins",
            "title": "The three scenarios where portfolio DSCR beats individual loans",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">1. Small-balance rentals.</strong> Five $200K properties are tedious and expensive to close individually. One portfolio loan with one set of closing costs is meaningfully cheaper.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">2. Aggregate DSCR passes, individual doesn't.</strong> Three properties at 0.95, 0.98, 1.05 DSCR won't qualify individually (sub-1.0). The aggregate is 0.99. Most portfolio lenders accept aggregate DSCR.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">3. Diverse geography.</strong> One property in a struggling market plus three in strong markets. Portfolio smooths out the local-market volatility.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "When individual loans are still better",
            "body_html": """
                <p><strong>1. Each property is high-DSCR (1.25+).</strong> Individual loans get best pricing. Portfolio pricing usually includes a small premium for the cross-collateralization risk.</p>
                <p style="margin-top:1rem"><strong>2. You plan to sell or refi individual properties.</strong> With a portfolio loan, you can't sell or refi one property without paying off the entire loan or getting lender approval. If your exit strategy is per-property, keep them individual.</p>
                <p style="margin-top:1rem"><strong>3. Different borrowers / entities.</strong> Portfolio loans need a single borrower entity owning all properties. If they're in different LLCs with different partners, individual loans are the only option.</p>
                <p style="margin-top:1rem"><strong>4. Properties in different states.</strong> Some portfolio lenders restrict to a single state. Multi-state portfolios need a lender with multi-state licensing and title infrastructure.</p>
            """,
            "eyebrow": "When to skip",
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Top portfolio lenders",
            "title": "Lenders who actively do portfolio DSCR",
            "intro": "Most single-property DSCR lenders won't touch a portfolio. These are the shops we route to for 5+ property files.",
            "headers": ["Lender", "Min # of props", "Max aggregate", "Cross-state?"],
            "rows": [
                ["Visio Lending", "2", "$15M", "Yes, all 50 states"],
                ["CoreVest", "3", "$50M", "Yes"],
                ["Lima One Capital", "3", "$20M", "Yes"],
                ["Kiavi", "2", "$5M", "Yes"],
                ["Newfi Wholesale", "2", "$10M", "Yes"],
                ["Citadel Servicing", "5", "$25M", "Yes"],
            ],
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR Cash-Out Refinance", "/programs/dscr-cash-out.html", "Program guide"),
                ("DSCR for LLC entity", "/programs/dscr-llc.html", "Program guide"),
                ("DSCR loans in California", "/states/california.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 8. No-Ratio DSCR
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-no-ratio",
    "title": "No-Ratio DSCR Loans — Financing When Rent Doesn't Cover the Payment",
    "meta_description": "No-ratio and sub-1.0 DSCR loans for properties where rent is below PITIA. Rate premium, LTV, and qualification.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · Sub-1.0 DSCR",
            "title": "No-Ratio DSCR — when the deal works for the investor but not for the standard matrix",
            "intro": "Standard DSCR programs require 1.0+ DSCR. A property with rent that doesn't quite cover PITIA — a transitional asset, a property under lease-up, a vacation rental with shoulder-season revenue — needs a different program. No-Ratio DSCR exists for exactly this.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · NO-RATIO",
        }},
        {"kind": "stats", "args": {
            "title": "No-Ratio DSCR terms, 2026",
            "stats": [
                {"label": "Max LTV", "value": "65-70%", "color": "mint"},
                {"label": "Rate add vs standard", "value": "+1.00-1.25%", "color": "light-green"},
                {"label": "Min FICO", "value": "680+", "color": "emerald"},
                {"label": "Reserves required", "value": "9-12 mo", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "When No-Ratio is the right tool",
            "title": "Four scenarios where the deal qualifies on borrower strength, not property cash flow",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">1. Lease-up property.</strong> Brand-new acquisition. The first tenant is in place but the rent roll hasn't stabilized to market. The borrower's reserves and credit carry the file until the property stabilizes.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">2. Below-market rents with upside.</strong> Long-term tenant paying 30% below market. The borrower's plan is to bring rents to market over 12-18 months. The deal works in projection, just not today.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">3. STR with shoulder-season weakness.</strong> Beach property that crushes in summer, struggles in winter. Trailing-12-month revenue works but the lender's snapshot calc shows weak DSCR.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">4. Transition from personal residence.</strong> Owner-occupant moves out, converts to rental. Initial rents lag because the property was a primary, not a rental, and never optimized for tenant appeal.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "What lenders actually check",
            "body_html": """
                <p>No-Ratio DSCR shifts the underwriting weight from the property to the borrower. Lenders want:</p>
                <p style="margin-top:1rem"><strong>Liquidity.</strong> 9-12 months PITIA in reserves, post-closing. Plus additional liquid assets for any other properties owned.</p>
                <p style="margin-top:1rem"><strong>Credit.</strong> FICO 680+ is typical. Higher scores unlock better rate. Recent credit events (BK, foreclosure) usually disqualify.</p>
                <p style="margin-top:1rem"><strong>Experience.</strong> 2+ years of rental property ownership is preferred. First-time investors may need to go to a different program.</p>
                <p style="margin-top:1rem"><strong>Exit strategy.</strong> Most lenders want a written plan for how the borrower reaches 1.0+ DSCR within 18-24 months — lease-up, rent increase, refi into standard DSCR after stabilization.</p>
            """,
            "eyebrow": "Underwriting",
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "The math",
            "title": "Worked example: sub-1.0 to standard DSCR over 24 months",
            "intro": "Realistic numbers from a typical No-Ratio deal. The property is below-market at closing and the borrower has a written plan to reach market rent by month 24.",
            "headers": ["Period", "Monthly rent", "PITIA", "DSCR"],
            "rows": [
                ["Closing (month 0)", "$2,400", "$3,000", "0.80"],
                ["Month 6 (lease renewal)", "$2,600", "$3,000", "0.87"],
                ["Month 12 (turnover)", "$2,900", "$3,000", "0.97"],
                ["Month 18 (stabilized)", "$3,100", "$3,000", "1.03"],
                ["Month 24 (refi out)", "$3,100", "$3,000", "1.03"],
            ],
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR core loans", "/programs/dscr-loans.html", "Program guide"),
                ("DSCR for Airbnb", "/programs/dscr-airbnb-str.html", "Program guide"),
                ("DSCR loans in Texas", "/states/texas.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 9. DSCR for Multifamily (2-4 Unit)
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-multifamily",
    "title": "DSCR Multifamily Loans — 2-4 Unit and Small Apartment Financing",
    "meta_description": "DSCR loans for 2-4 unit properties and small multifamily (5+ units). Underwriting, LTV, and rent calculation differences.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · Multifamily",
            "title": "DSCR Multifamily — 2-4 units is a different product from 5+ units",
            "intro": "2-4 unit properties underwrite as residential DSCR with one set of rules. 5+ unit small apartment buildings underwrite as commercial with different DSCR calculations, different reserves, different lenders. Here's the split.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · MULTIFAMILY",
        }},
        {"kind": "stats", "args": {
            "title": "Multifamily DSCR terms, 2026",
            "stats": [
                {"label": "2-4 unit max LTV", "value": "80-85%", "color": "mint"},
                {"label": "5+ unit max LTV", "value": "70-75%", "color": "light-green"},
                {"label": "2-4 unit min DSCR", "value": "1.0", "color": "emerald"},
                {"label": "5+ unit min DSCR", "value": "1.20", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "2-4 unit residential",
            "title": "How residential DSCR treats 2-4 unit properties",
            "body_html": """
                <p>2-4 unit properties are treated like SFR from a DSCR perspective — same rate sheets, same FICO floors, same LTV. The key differences:</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Rent calculation.</strong> Sum of all unit rents, minus a vacancy haircut (typically 5-8%). Most lenders use the in-place leases plus market rent for vacant units.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">PITIA.</strong> Includes mortgage P&amp;I, property taxes, insurance, HOA if any. No utilities unless the owner pays them.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">DSCR = Total rent / PITIA.</strong> Standard 1.0+ requirement. Some lenders treat a duplex differently from a 4-unit but most accept the same matrix.</p>
            """,
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "5+ unit small commercial",
            "title": "When 5+ units crosses into commercial DSCR",
            "body_html": """
                <p>5+ unit properties typically underwrite as small-balance commercial. Different rules:</p>
                <p style="margin-top:1rem"><strong>DSCR threshold.</strong> 1.20+ is more typical (vs 1.0+ for residential). Some lenders go to 1.25+.</p>
                <p style="margin-top:1rem"><strong>LTV.</strong> Lower — 70-75% max, vs 80-85% for residential.</p>
                <p style="margin-top:1rem"><strong>Rent.</strong> Underwritten on actual leases plus market rent for vacant units. T-12 income and expense statement usually required for stabilized properties.</p>
                <p style="margin-top:1rem"><strong>Lender universe.</strong> Different lenders — small-balance commercial shops rather than DSCR residential lenders. Examples: CoreVest, Arbor, JLL.</p>
                <p style="margin-top:1rem"><strong>Loan size.</strong> Typically $500K-$5M. Larger apartment buildings (50+ units) are a different product entirely.</p>
            """,
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Quick reference",
            "title": "Residential DSCR vs small commercial multifamily",
            "intro": "Side-by-side comparison for quick reference when structuring a multifamily deal.",
            "headers": ["Feature", "2-4 unit (residential)", "5+ unit (small commercial)"],
            "rows": [
                ["Max LTV", "85%", "70-75%"],
                ["Min DSCR", "1.0", "1.20-1.25"],
                ["Min FICO", "620", "660-680"],
                ["Rate", "From 5.75%", "From 6.50%"],
                ["Term", "30-yr fixed, 40-yr fixed, IO", "5-10 yr fixed, IO common"],
                ["Prepay", "Step-down / no-prepay", "Defeasance or yield maintenance"],
                ["Lender universe", "Visio, Kiavi, Lima One, Newfi", "CoreVest, Arbor, JLL, Northmarq"],
                ["Rent documentation", "1007 or leases", "T-12 rent roll + operating statement"],
            ],
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR core loans", "/programs/dscr-loans.html", "Program guide"),
                ("DSCR Portfolio loans", "/programs/dscr-portfolio.html", "Program guide"),
                ("DSCR loans in Ohio", "/states/ohio.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 10. DSBR Condotels
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-condotel",
    "title": "DSCR Condotel Loans — Financing Hotel-Condo Rentals",
    "meta_description": "Condotel DSCR loans for condo-style hotel units. Approved buildings, on-site rental management, and rate considerations.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · Condotel",
            "title": "DSCR Condotels — the hotel-condo niche most lenders skip",
            "intro": "A condotel is a condo-style unit in a building with on-site rental management, daily rental allowed, and front-desk services. Most residential DSCR lenders won't touch them. The ones that do have approved-building lists and tighter underwriting.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · CONDOTEL",
        }},
        {"kind": "stats", "args": {
            "title": "Condotel DSCR terms, 2026",
            "stats": [
                {"label": "LTV haircut", "value": "5-10%", "color": "mint"},
                {"label": "Max loan", "value": "$1.5M", "color": "light-green"},
                {"label": "Approved buildings", "value": "Lender-specific", "color": "emerald"},
                {"label": "Min FICO", "value": "660", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "The condotel underwrite",
            "title": "What makes condotels different from regular condos",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">Approved buildings.</strong> Most DSCR lenders maintain an approved condotel list. If the building isn't on the list, the deal doesn't close — there's no exception process for unapproved buildings.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Rental management.</strong> The unit must be in the building's rental program. Off-platform Airbnb rentals usually aren't accepted. The building's management company provides the rental income statements.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">LTV haircut.</strong> Most lenders take 5-10% off standard condo LTV because condotel valuations are more volatile and the resale market is thinner.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Rent calculation.</strong> Typically the trailing 12-month rental income statement from the building's management company. Lenders apply a 20-30% haircut for the platform fees and management fees.</p>
            """,
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Lender matrix",
            "title": "Condotel-active DSCR lenders",
            "intro": "Most DSCR lenders don't do condotels. This is who does, and their approved-building coverage.",
            "headers": ["Lender", "Approved buildings", "LTV max", "Max loan"],
            "rows": [
                ["Visio Lending", "300+ nationwide", "75%", "$1.5M"],
                ["Newfi Wholesale", "200+ nationwide", "75%", "$1.5M"],
                ["Kiavi", "150+ nationwide", "75%", "$1M"],
                ["Angel Oak MS", "100+ (select markets)", "70%", "$1M"],
                ["Lima One Capital", "100+ (FL, NV, HI)", "75%", "$1.5M"],
            ],
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR for Airbnb &amp; STR", "/programs/dscr-airbnb-str.html", "Program guide"),
                ("DSCR loans in Florida", "/states/florida.html", "State guide"),
                ("DSCR loans in Nevada", "/states/nevada.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# 11. DSCR for BRRRR
# ============================================================
register(PROGRAMS, {
    "slug": "dscr-brrrr",
    "title": "DSCR Loans for the BRRRR Strategy — Refinance Out of Hard Money",
    "meta_description": "How to use DSCR loans to exit hard money in the BRRRR strategy. Timing, seasoning, and rate considerations.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Programs · BRRRR",
            "title": "DSCR for BRRRR — the standard exit instrument",
            "intro": "BRRRR (Buy, Rehab, Rent, Refi, Repeat) is the most common strategy for using DSCR as the long-term hold instrument after a short-term hard money purchase and rehab. The refinance step is where the strategy succeeds or fails.",
            "theme": "dark",
            "kicker": "GREENSTREET PROGRAMS · BRRRR",
        }},
        {"kind": "stats", "args": {
            "title": "BRRRR DSCR timing, 2026",
            "stats": [
                {"label": "Typical rehab period", "value": "3-6 mo", "color": "mint"},
                {"label": "Hard money rate", "value": "10-13%", "color": "light-green"},
                {"label": "DSCR rate (refi out)", "value": "From 5.75%", "color": "emerald"},
                {"label": "Cash recovered", "value": "75-100%", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "The refi step",
            "title": "What the DSCR lender wants at refinance",
            "body_html": """
                <p>Six months in, the property is rehabbed, leased, and producing. Now you refinance from hard money into a 30-year DSCR. The lender wants:</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Rent.</strong> In-place lease with at least 3-6 months of payment history. Most lenders will not close on projected rent alone.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Appraisal.</strong> As-is value reflecting the completed rehab. Some lenders accept the hard money lender's appraisal; most order their own.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">DSCR.</strong> 1.0+ minimum. Most BRRRR properties hit 1.0+ once stabilized.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Rehab documentation.</strong> Receipts, contractor invoices, before/after photos. The lender wants to verify the rehab cost matches the appraisal's adjusted value.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "The cash-recovery math",
            "body_html": """
                <p>The goal is to recover most or all of your initial capital — purchase + rehab + closing — through the refinance. The math:</p>
                <p style="margin-top:1rem"><strong>Example:</strong></p>
                <p style="margin-top:0.5rem">Purchase: $150,000</p>
                <p style="margin-top:0.5rem">Rehab: $40,000</p>
                <p style="margin-top:0.5rem">Closing costs: $5,000</p>
                <p style="margin-top:0.5rem"><strong>Total capital in: $195,000</strong></p>
                <p style="margin-top:1rem">After-rehab value: $250,000</p>
                <p style="margin-top:0.5rem">DSCR refi at 75% LTV: $187,500</p>
                <p style="margin-top:0.5rem">Less new closing costs: ($3,500)</p>
                <p style="margin-top:0.5rem">Net to borrower: $184,000</p>
                <p style="margin-top:1rem"><strong>Recovery: 94% of capital deployed.</strong> The remaining $11K stays in the deal as the down-payment equity. Re-deploy the $184K into the next BRRRR.</p>
            """,
            "eyebrow": "Worked example",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR Cash-Out Refinance", "/programs/dscr-cash-out.html", "Program guide"),
                ("DSCR loans in Tennessee", "/states/tennessee.html", "State guide"),
                ("DSCR loans in Texas", "/states/texas.html", "State guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


if __name__ == "__main__":
    print(f"Loaded {len(PROGRAMS)} program pages")
