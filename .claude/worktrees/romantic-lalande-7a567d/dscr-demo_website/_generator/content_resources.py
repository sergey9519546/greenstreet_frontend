#!/usr/bin/env python3
"""
Greenstreet Finance — Resource Page Content
Glossary, rate sheet, FAQ, calculator, specialty guides.
"""
from page_builder import register, RESOURCES


# ============================================================
# GLOSSARY
# ============================================================
register(RESOURCES, {
    "slug": "glossary",
    "title": "DSCR Glossary — Every Term Brokers and Investors Need",
    "meta_description": "Complete DSCR glossary: DSCR, PITIA, ITIA, LTV, FICO, reserve, step-down prepay, AirDNA, 1007, no-ratio, and 50+ more terms.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Resources · Glossary",
            "title": "DSCR glossary — every term brokers and investors need",
            "intro": "The full vocabulary of DSCR and non-QM lending. Bookmark this page — it's the first place to check when a term comes up in a lender matrix.",
            "theme": "dark",
            "kicker": "GLOSSARY",
        }},
        {"kind": "section_white", "args": {
            "title": "Underwriting terms",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">DSCR (Debt-Service Coverage Ratio).</strong> Monthly gross rental income divided by monthly PITIA (or ITIA). The lender's primary qualifying metric. 1.0+ is standard; some programs accept sub-1.0 with rate premium.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Track 1 DSCR (Lender Qualification).</strong> Gross rent / PITIA. No vacancy. The ratio the lender's matrix uses to say yes.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Track 2 DSCR (Investor Survival).</strong> (Effective rent minus management fee) / ITIA. Includes vacancy and mgmt fee. Whether the deal actually performs after closing.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">PITIA.</strong> Principal, Interest, Taxes, Insurance, Association dues (HOA). The full monthly housing payment for DSCR qualification.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">ITIA.</strong> Interest, Taxes, Insurance, Association dues. Used for interest-only loans where principal payment is deferred.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">LTV (Loan-to-Value).</strong> Loan amount divided by appraised value (or purchase price, whichever is lower). Higher LTV = more leverage = more rate.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">CLTV (Combined Loan-to-Value).</strong> All liens on the property combined, divided by value. Used when there's a subordinated HELOC or second mortgage.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">FICO.</strong> Credit score (300-850). Most DSCR programs require 620+. Higher FICO unlocks better rate and LTV.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Reserve.</strong> Months of PITIA the borrower must hold in liquid assets post-closing. Typically 2-6 months for standard DSCR, 6-12 for STR and sub-1.0.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">No-Ratio / Sub-1.0 DSCR.</strong> Programs that lend when DSCR is below 1.0. Higher rate (typically +1.00-1.25%) and tighter LTV (typically 65-70%).</p>
            """,
            "eyebrow": "Core terms",
        }},
        {"kind": "section_white", "args": {
            "title": "Loan structure terms",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">Step-down prepayment.</strong> Prepayment penalty that decreases each year (e.g., 5-4-3-2-1). 5% in year 1, 4% in year 2, etc. Cheapest monthly rate.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">No prepay.</strong> Right to sell or refinance anytime with no penalty. Higher rate (typically +0.50-1.00%).</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Yield maintenance.</strong> Prepayment structure that compensates the lender for lost interest over the remaining term. Common in commercial loans.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Defeasance.</strong> Commercial prepayment structure where the borrower substitutes Treasury securities for the collateral. Common in 5+ unit commercial.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Interest-only (IO).</strong> Monthly payment covers interest only; principal balance stays constant. Common in DSCR for cash flow optimization.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">30-year fixed.</strong> Standard DSCR product. Principal and interest, fully amortizing, fixed rate for 30 years. No balloon.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">40-year fixed.</strong> Extended amortization. Lower monthly payment, more interest over loan life. Some DSCR programs offer this.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">5/1 ARM.</strong> 5-year fixed, then annual adjustments. Cheapest initial rate; resets higher. Use when refi or sell is planned within 5 years.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">7/1 ARM, 10/1 ARM.</strong> 7-year and 10-year fixed initial periods, then annual adjustments. Common in commercial DSCR.</p>
            """,
            "eyebrow": "Prepay and term",
        }},
        {"kind": "section_white", "args": {
            "title": "Property and rent terms",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">Form 1007.</strong> Rent study prepared by an appraiser. The lender's view of market rent for the property.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">In-place lease.</strong> Existing rental agreement. Strongest form of rental income documentation.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">AirDNA.</strong> Short-term rental data provider. Trailing 12-month revenue is the STR DSCR standard.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Haircut.</strong> Reduction applied to gross rent to account for vacancy, management fees, and platform fees. Typical 8% vacancy + 8% mgmt for long-term; 20-30% for STR.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">SFR.</strong> Single-family rental. 1-unit detached residential property held as rental.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Multifamily.</strong> 2+ unit residential. 2-4 unit is residential DSCR; 5+ unit is small commercial.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Condotel.</strong> Condo-style hotel unit with on-site rental management. Limited lender universe.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">STR / Airbnb / Vacation Rental.</strong> Short-term rental — nightly or weekly stays through Airbnb, VRBO, or direct booking.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">LTR (Long-Term Rental).</strong> Traditional 12-month lease rental. The DSCR baseline.</p>
            """,
            "eyebrow": "Property and rent",
        }},
        {"kind": "section_white", "args": {
            "title": "Borrower and entity terms",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">US Citizen / Permanent Resident.</strong> Standard borrower. No additional documentation required.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Foreign National.</strong> Non-US citizen, non-permanent resident. Requires foreign credit letters and source-of-funds documentation. Rate premium typically 0.50-1.00%.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">ITIN.</strong> Individual Taxpayer Identification Number. Issued by IRS to non-SSN holders who file US taxes. Cheaper than Foreign National if available.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">LLC (Limited Liability Company).</strong> Standard entity for holding rentals. Single-member and multi-member both accepted by most lenders.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">LP / LLP.</strong> Limited Partnership. Some lenders accept; some require Corp or LLC.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Series LLC.</strong> Multiple properties in one LLC with separate Series. Lender-specific acceptance.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Land Trust.</strong> Not accepted by most non-QM lenders. The underlying LLC must be the borrower.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">EIN.</strong> Employer Identification Number. Required for entity vesting. IRS Form 147C (EIN confirmation letter) needed at closing.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">NMLS.</strong> Nationwide Multistate Licensing System. Lender licensing registry. Verify any lender at nmlsconsumeraccess.org.</p>
            """,
            "eyebrow": "Borrowers and entities",
        }},
        {"kind": "section_white", "args": {
            "title": "Strategy terms",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">BRRRR.</strong> Buy, Rehab, Rent, Refi, Repeat. The strategy of using short-term hard money to acquire and rehab, then refi into long-term DSCR.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Cash-out refinance.</strong> Refinancing for more than the current balance, with the difference paid to the borrower in cash. LTV cap typically 75% on DSCR.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Rate-and-term refinance.</strong> Refinancing for the same balance to change rate or term. No cash to borrower. Higher LTV than cash-out.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Portfolio loan.</strong> Single loan covering multiple properties (typically 2-10). Cross-collateralized. Useful for scaling.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Blanket loan.</strong> Another term for portfolio loan. Multiple properties under one loan.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Cross-collateralization.</strong> Multiple properties securing a single loan. Default on one property can trigger default on all.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Seasoning.</strong> Time the borrower has owned the property before refinancing. Most DSCR cash-out requires 6-12 months.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">ARV (After-Repair Value).</strong> The projected value of a property after rehab. Used in bridge financing for BRRRR.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Cap rate.</strong> Net operating income divided by property value. Different from DSCR; used for valuation.</p>
            """,
            "eyebrow": "Strategy",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR rate sheet", "/resources/rate-sheet.html", "Resource"),
                ("DSCR calculator", "/resources/calculator.html", "Tool"),
                ("FAQ", "/resources/faq.html", "Resource"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# RATE SHEET
# ============================================================
register(RESOURCES, {
    "slug": "rate-sheet",
    "title": "DSCR Rate Sheet — 2026 Pricing by FICO, LTV & Tier",
    "meta_description": "2026 DSCR rate sheet: pricing by FICO band, LTV, DSCR tier, and prepay structure. The most comprehensive rate snapshot in non-QM.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Resources · Rate Sheet",
            "title": "DSCR rate sheet — 2026 pricing by FICO, LTV, and tier",
            "intro": "The most comprehensive DSCR rate snapshot in non-QM. Rates vary by FICO band, LTV, DSCR tier, and prepay structure — this page breaks down each axis.",
            "theme": "dark",
            "kicker": "RATE SHEET",
        }},
        {"kind": "section_white", "args": {
            "title": "Standard DSCR rates by FICO and LTV (1.25+ DSCR, 5-year step-down prepay)",
            "body_html": """
                <p>This is the headline matrix used by most lenders for standard DSCR. Rates are illustrative across the major non-QM lenders and may vary by 0.125-0.25% lender-to-lender.</p>
            """,
            "eyebrow": "Standard DSCR",
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Standard matrix",
            "title": "Rates by FICO and LTV",
            "intro": "DSCR ≥ 1.25, 5-year step-down prepay. Property: SFR or 2-4 unit. Loan amount: $150K-$3M.",
            "headers": ["FICO", "LTV 75%", "LTV 80%", "LTV 85%"],
            "rows": [
                ["760+", "5.75%", "5.99%", "6.25%"],
                ["720-759", "5.99%", "6.25%", "6.50%"],
                ["700-719", "6.25%", "6.50%", "6.75%"],
                ["680-699", "6.50%", "6.75%", "7.00%"],
                ["660-679", "6.75%", "7.00%", "7.25%"],
                ["640-659", "7.00%", "7.25%", "7.50%"],
                ["620-639", "7.50%", "7.75%", "8.00%"],
            ],
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Tier adjustments",
            "title": "Rate add by DSCR tier",
            "intro": "Apply on top of the base rate from the FICO/LTV matrix above.",
            "headers": ["DSCR tier", "LTV max", "Rate add"],
            "rows": [
                ["≥ 1.25", "85%", "0 (baseline)"],
                ["1.10 – 1.24", "80%", "+0.10 to +0.25%"],
                ["1.00 – 1.09", "75%", "+0.25 to +0.50%"],
                ["0.75 – 0.99", "70%", "+0.75 to +1.00%"],
                ["< 0.75 (No-Ratio)", "65%", "+1.00 to +1.25%"],
            ],
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Prepay structures",
            "title": "Rate add by prepay structure",
            "intro": "Apply on top of base rate + tier adjustment. Cheapest monthly = 5-year step-down. Most flexibility = no prepay.",
            "headers": ["Prepay structure", "Rate add", "Notes"],
            "rows": [
                ["5-year step-down (5-4-3-2-1)", "0 (baseline)", "Cheapest rate; common for long-term holds"],
                ["3-year step-down (3-2-1)", "+0.10 to +0.25%", "Common for BRRRR exits"],
                ["2-year step-down (2-1)", "+0.25 to +0.50%", "Common for fix-and-flip exits"],
                ["1-year only", "+0.40 to +0.65%", "One prepayment allowed with penalty"],
                ["No prepay", "+0.50 to +1.00%", "Right to refi or sell anytime"],
            ],
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Program-specific rates",
            "title": "Rate premiums by program",
            "intro": "Specialty programs carry a rate premium over standard DSCR. The premium reflects the lender's additional risk.",
            "headers": ["Program", "Rate from", "Premium vs standard"],
            "rows": [
                ["Standard DSCR", "5.75%", "—"],
                ["DSCR for Airbnb / STR", "6.25%", "+0.50%"],
                ["Foreign National DSCR", "7.25%", "+1.50%"],
                ["ITIN DSCR", "7.50%", "+1.75%"],
                ["Condotel DSCR", "6.75%", "+1.00%"],
                ["No-Ratio (sub-1.0) DSCR", "6.75%", "+1.00%"],
                ["DSCR Cash-Out Refinance", "6.25%", "+0.50%"],
                ["DSCR Portfolio (5+ properties)", "6.50%", "+0.75%"],
                ["California Bridge Loan", "8.50%", "+2.75%"],
            ],
        }},
        {"kind": "section_white", "args": {
            "title": "Reading the matrix",
            "body_html": """
                <p><strong>1. FICO drives the base rate.</strong> The largest single factor in DSCR pricing. 620+ is the typical floor. A 720+ FICO borrower gets 1.50-2.00% better pricing than a 640 FICO borrower on the same file.</p>
                <p style="margin-top:1rem"><strong>2. LTV drives the rate tier.</strong> 75% LTV is the cleanest pricing. 80% LTV adds 0.25%. 85% LTV adds another 0.25%. Higher LTV = more lender risk = more rate.</p>
                <p style="margin-top:1rem"><strong>3. DSCR tier drives a rate add.</strong> 1.25+ DSCR is baseline. 1.00-1.24 adds 0.10-0.25%. Sub-1.0 adds 0.75-1.25%. The lender's matrix decides whether to use the lower bound or upper bound.</p>
                <p style="margin-top:1rem"><strong>4. Prepay structure drives a rate add.</strong> 5-year step-down is cheapest. No-prepay is most expensive. Match the prepay to your hold period.</p>
                <p style="margin-top:1rem"><strong>5. Program drives a premium.</strong> STR, FN, ITIN, and condotel all carry 0.50-1.50% premium over standard DSCR. The premium reflects the lender's specialty underwriting.</p>
            """,
            "eyebrow": "How to read",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR core loans", "/programs/dscr-loans.html", "Program guide"),
                ("DSCR calculator", "/resources/calculator.html", "Tool"),
                ("Compare top lenders", "/compare/visio-lending.html", "Comparison"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# FAQ
# ============================================================
register(RESOURCES, {
    "slug": "faq",
    "title": "DSCR FAQ — The Broker's Top 30 Questions, Answered",
    "meta_description": "Top 30 DSCR questions answered. Qualification, rates, LTV, FICO, DSCR math, FN, ITIN, LLC, STR, and more.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Resources · FAQ",
            "title": "DSCR FAQ — the broker's top 30 questions, answered",
            "intro": "The questions brokers ask on every DSCR file, with straight answers. Bookmark this page.",
            "theme": "dark",
            "kicker": "FAQ",
        }},
        {"kind": "section_white", "args": {
            "title": "Qualification",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">Q: What's the minimum FICO for DSCR?</strong><br/>A: 620 is the industry floor. Some lenders go to 580 with compensating factors (higher down payment, larger reserves, lower LTV). Below 620, you typically need to look at bank statement or asset depletion programs.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Do I need to provide tax returns for DSCR?</strong><br/>A: No. Standard DSCR is no-income-doc. The lender does not verify personal income. Tax returns are only required for ITIN, Foreign National, or specific cross-qualification scenarios.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: How many months of reserves do I need?</strong><br/>A: 2-6 months of PITIA for standard DSCR (depending on FICO and DSCR tier). 6-9 months for STR. 9-12 months for sub-1.0 DSCR and bridge.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Can I close in an LLC?</strong><br/>A: Yes. Most lenders prefer entity vesting. Single-member LLC is treated like individual. Multi-member LLC may carry a small rate add.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: How is DSCR calculated?</strong><br/>A: Gross monthly rent / monthly PITIA (or ITIA if interest-only). Example: $3,000 rent, $2,288 PITIA = 1.31 DSCR.</p>
            """,
            "eyebrow": "Basics",
        }},
        {"kind": "section_white", "args": {
            "title": "Rates and LTV",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">Q: What DSCR rate will I get?</strong><br/>A: Depends on FICO, LTV, DSCR tier, prepay structure, and program. Headline rates from 5.75% APR for well-qualified standard DSCR files. See the rate sheet for the full matrix.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: What's the maximum LTV?</strong><br/>A: 85% for standard DSCR purchase with 1.25+ DSCR and 720+ FICO. LTV decreases as FICO and DSCR tier decrease. Cash-out maxes at 75%.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Can I get a 30-year fixed?</strong><br/>A: Yes. 30-year fixed is the standard DSCR product. 40-year fixed is available at some lenders. IO is also available.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: What's the cheapest prepay structure?</strong><br/>A: 5-year step-down (5-4-3-2-1). The penalty decreases each year. Cheapest monthly rate. Match the prepay to your hold period.</p>
            """,
            "eyebrow": "Pricing",
        }},
        {"kind": "section_white", "args": {
            "title": "Property types",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">Q: Does DSCR work for Airbnb / short-term rentals?</strong><br/>A: Yes. Most DSCR lenders accept STR with AirDNA documentation. Expect a 0.50-1.00% rate premium and stricter reserve requirements. Confirm local STR legality before quoting.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Does DSCR work for 2-4 unit properties?</strong><br/>A: Yes. Same matrix as SFR. Rent is the sum of all unit rents.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: What about 5+ unit apartment buildings?</strong><br/>A: Different product — small commercial DSCR. Different lenders (CoreVest, Arbor, JLL). Different DSCR threshold (1.20+ typical).</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Does DSCR work for condotels?</strong><br/>A: Limited lender universe. Visio, Newfi, Kiavi, Lima One, Angel Oak all have condotel programs with approved-building lists. LTV is typically 5-10% lower than standard condo.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Does DSCR work for primary residence?</strong><br/>A: No. DSCR is for non-owner-occupied investment property. For primary residence, you need a different program.</p>
            """,
            "eyebrow": "Property",
        }},
        {"kind": "section_white", "args": {
            "title": "Borrowers",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">Q: Can non-US citizens get DSCR?</strong><br/>A: Yes. Foreign National DSCR is available with foreign credit letters and source-of-funds documentation. Expect a 0.50-1.50% rate premium.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: What's the difference between Foreign National and ITIN?</strong><br/>A: Foreign National has no US tax filings. ITIN has US tax filings (2+ years). ITIN programs are usually 0.50-1.00% cheaper than Foreign National.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Can I get DSCR with a 620 FICO?</strong><br/>A: Yes. 620 is the floor for most lenders. Rate will be at the high end of the matrix. Lower LTV or higher reserves can sometimes unlock better pricing at low FICO.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Does DSCR work for self-employed borrowers?</strong><br/>A: Yes. Personal income is not verified. Tax returns are not required. The property's rent covers the PITIA.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Can I have multiple DSCR loans at the same time?</strong><br/>A: Yes. Most lenders allow 5-10 financed properties. Some go higher. Each property is underwritten separately; aggregate exposure is reviewed at the lender portfolio level.</p>
            """,
            "eyebrow": "Borrowers",
        }},
        {"kind": "section_white", "args": {
            "title": "Process and timing",
            "body_html": """
                <p><strong style="color:var(--swatch--emerald)">Q: How long does DSCR take to close?</strong><br/>A: 18-32 days typical. Fastest: Kiavi (18-22 days). Slowest: portfolio or specialty programs (28-45 days).</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: What documents do I need?</strong><br/>A: ID, entity docs (if applicable), bank statements (2-3 months), credit authorization, purchase contract, Form 1007 or rent documentation, insurance binder, HOA docs (if applicable).</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: Can I close before renting the property?</strong><br/>A: Yes. Most DSCR loans close on the property's projected rent (Form 1007) without an in-place lease. Some lenders require a lease for cash-out or seasoning.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--emerald)">Q: What happens after closing?</strong><br/>A: Servicing begins. Make monthly payments via auto-pay. After 6-12 months of seasoning, you may be eligible for cash-out refinance. After 5 years (or step-down completion), prepayment penalty expires.</p>
            """,
            "eyebrow": "Process",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR core loans", "/programs/dscr-loans.html", "Program guide"),
                ("DSCR rate sheet", "/resources/rate-sheet.html", "Resource"),
                ("DSCR glossary", "/resources/glossary.html", "Resource"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# CALCULATOR (info page; calculator is the JS widget)
# ============================================================
register(RESOURCES, {
    "slug": "calculator",
    "title": "DSCR Calculator — Dual-Track Investor Survival Model",
    "meta_description": "Calculate Track 1 (Lender Qualification) and Track 2 (Investor Survival) DSCR in one tool. Built for brokers who refuse to confuse qualifying with performing.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Tools · DSCR Calculator",
            "title": "DSCR calculator — dual-track, by design",
            "intro": "Every deal runs through Track 1 (Lender Qualification DSCR) and Track 2 (Investor Survival DSCR). What qualifies you is not always what keeps you alive.",
            "theme": "dark",
            "kicker": "CALCULATOR",
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "How it works",
            "title": "Three inputs, two outputs, one decision",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">Inputs:</strong> Gross monthly rent, PITIA (or ITIA), vacancy %, management fee %.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Outputs:</strong> Track 1 DSCR (qualification), Track 2 DSCR (survival), decision recommendation.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Defaults:</strong> 8% vacancy, 8% management fee. These match industry standard assumptions for long-term rental. For STR, use 30-40% combined.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Decision rule:</strong></p>
                <p style="margin-top:0.5rem">• Both tracks ≥ 1.0: QUALIFIES &amp; SURVIVES — proceed.</p>
                <p style="margin-top:0.5rem">• Track 1 ≥ 1.0, Track 2 &lt; 1.0: QUALIFIES but Track 2 fails — reprice or walk.</p>
                <p style="margin-top:0.5rem">• Track 1 &lt; 1.0: Does not qualify at current rent — adjust price or rent.</p>
            """,
        }},
        {"kind": "section_callout", "args": {
            "eyebrow": "Calculator",
            "title": "Run the Dual-Track DSCR math",
            "body_html": """
                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:var(--radius-lg);padding:2rem;margin-top:1rem">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem">
                        <label style="display:flex;flex-direction:column;gap:0.5rem">
                            <span style="font-size:0.85rem;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em">Gross monthly rent ($)</span>
                            <input id="calc-rent" type="number" value="3250" style="padding:0.75rem 1rem;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:0.5rem;color:white;font-size:1.1rem"/>
                        </label>
                        <label style="display:flex;flex-direction:column;gap:0.5rem">
                            <span style="font-size:0.85rem;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em">PITIA ($/mo)</span>
                            <input id="calc-pitia" type="number" value="2288" style="padding:0.75rem 1rem;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:0.5rem;color:white;font-size:1.1rem"/>
                        </label>
                        <label style="display:flex;flex-direction:column;gap:0.5rem">
                            <span style="font-size:0.85rem;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em">Vacancy (%)</span>
                            <input id="calc-vacancy" type="number" value="8" style="padding:0.75rem 1rem;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:0.5rem;color:white;font-size:1.1rem"/>
                        </label>
                        <label style="display:flex;flex-direction:column;gap:0.5rem">
                            <span style="font-size:0.85rem;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em">Mgmt fee (%)</span>
                            <input id="calc-mgmt" type="number" value="8" style="padding:0.75rem 1rem;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:0.5rem;color:white;font-size:1.1rem"/>
                        </label>
                    </div>
                    <button id="calc-btn" style="padding:0.85rem 2rem;background:var(--swatch--pistachio);color:var(--swatch--midnight);border:none;border-radius:var(--radius-pill);font-weight:500;cursor:pointer;font-size:1rem">Calculate</button>
                    <div id="calc-output" style="margin-top:1.5rem;padding:1.5rem;background:rgba(255,255,255,0.04);border-radius:var(--radius-card);font-family:monospace;font-size:0.95rem;line-height:1.6;white-space:pre-wrap"></div>
                </div>
                <script>
                document.getElementById('calc-btn').addEventListener('click', function(){
                    const rent = parseFloat(document.getElementById('calc-rent').value) || 0;
                    const pitia = parseFloat(document.getElementById('calc-pitia').value) || 0;
                    const vac = parseFloat(document.getElementById('calc-vacancy').value) || 0;
                    const mgmt = parseFloat(document.getElementById('calc-mgmt').value) || 0;
                    const track1 = rent / pitia;
                    const effRent = rent * (1 - vac/100);
                    const mgmtFee = effRent * (mgmt/100);
                    const track2 = (effRent - mgmtFee) / pitia;
                    const qualifies = track1 >= 1.0;
                    const survives = track2 >= 1.0;
                    const decision = qualifies && survives ? 'QUALIFIES & SURVIVES' : qualifies ? 'QUALIFIES but Track 2 fails — reprice or walk' : 'Does not qualify at current rent';
                    document.getElementById('calc-output').textContent =
                        'Track 1 — Lender Qualification\\n' +
                        '  Gross Rent          : $' + rent.toLocaleString() + '\\n' +
                        '  PITIA               : $' + pitia.toLocaleString() + '\\n' +
                        '  DSCR (Track 1)      : ' + track1.toFixed(3) + '  ' + (qualifies ? '✅' : '❌') + '\\n\\n' +
                        'Track 2 — Investor Survival\\n' +
                        '  Effective Rent (-' + vac + '% vacancy): $' + effRent.toFixed(2) + '\\n' +
                        '  Mgmt Fee (-' + mgmt + '%)             : $' + mgmtFee.toFixed(2) + '\\n' +
                        '  DSCR (Track 2)      : ' + track2.toFixed(3) + '  ' + (survives ? '✅' : '❌') + '\\n\\n' +
                        'Decision: ' + decision;
                });
                </script>
            """,
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR rate sheet", "/resources/rate-sheet.html", "Resource"),
                ("DSCR glossary", "/resources/glossary.html", "Resource"),
                ("DSCR core loans", "/programs/dscr-loans.html", "Program guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


# ============================================================
# CANADIAN INVESTORS GUIDE
# ============================================================
register(RESOURCES, {
    "slug": "canadian-investors",
    "title": "DSCR Loans for Canadian Investors — Buy US Rental Property in 2026",
    "meta_description": "How Canadian investors buy US rental property with DSCR loans. Tax, currency, FIRPTA, and entity structure.",
    "sections": [
        {"kind": "hero", "args": {
            "eyebrow": "Greenstreet Resources · Canadian Investors",
            "title": "DSCR for Canadian investors — the most common cross-border deal",
            "intro": "Canadian investors are the largest single-source foreign national DSCR cohort. The CAD/USD dynamics, FIRPTA withholding, and entity structure questions all need answers before the first dollar moves.",
            "theme": "dark",
            "kicker": "CANADIAN INVESTORS",
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "Why DSCR is the right product",
            "title": "DSCR solves the cross-border problem",
            "body_html": """
                <p><strong style="color:var(--swatch--pistachio)">No US credit required.</strong> Canadians don't have FICO scores. DSCR uses the property's rent to qualify — no personal income verification, no US credit pull.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">No US tax returns required.</strong> Foreign National DSCR doesn't require US tax filings. Two foreign credit letters from a Canadian bank are the typical substitute.</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Standard Canadian documentation accepted.</strong> Passport, Canadian bank statements, Canadian credit letters, Canadian source-of-funds documentation. No US-side paperwork required upfront.</p>
            """,
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Currency and tax",
            "title": "The CAD/USD and FIRPTA considerations",
            "body_html": """
                <p><strong>Currency risk.</strong> The Canadian dollar fluctuates against the USD. A 10% CAD drop can wipe out a year of rental cash flow on a leveraged deal. Consider hedging or a smaller loan amount to reduce FX exposure.</p>
                <p style="margin-top:1rem"><strong>FIRPTA withholding.</strong> Foreign sellers of US property are subject to 15% FIRPTA withholding on the sale price. As a buyer of US rental, you don't owe FIRPTA — but if you sell, you (or the title company at closing) will withhold 15% of the sale price. The withholding is creditable against your actual US tax liability; you can reclaim the excess via a US tax return.</p>
                <p style="margin-top:1rem"><strong>US tax filing.</strong> Rental income is US-source income. You must file a US non-resident tax return (Form 1040-NR) annually. Most Canadian investors hire a US tax preparer specializing in cross-border.</p>
                <p style="margin-top:1rem"><strong>Canadian tax.</strong> Worldwide income is taxed in Canada. Rental income and any sale gains are reported on your Canadian return. Foreign tax credits (for US tax paid) reduce double taxation.</p>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": "Documentation checklist for Canadian DSCR",
            "body_html": """
                <p><strong>Identity:</strong> Canadian passport, Canadian driver's license, proof of Canadian address.</p>
                <p style="margin-top:1rem"><strong>Canadian banking:</strong> 2 letters from a Canadian bank confirming 12+ months of relationship, average balances, and good standing.</p>
                <p style="margin-top:1rem"><strong>Canadian credit:</strong> Equifax Canada report (some lenders require).</p>
                <p style="margin-top:1rem"><strong>Source of funds:</strong> Canadian bank statements (3-6 months), wire transfer records for down payment, gift letter if applicable.</p>
                <p style="margin-top:1rem"><strong>Property:</strong> Purchase contract, Form 1007, insurance binder, HOA docs.</p>
                <p style="margin-top:1rem"><strong>Entity (optional):</strong> If holding in a US LLC or Canadian corp, formation docs, EIN or Canadian Business Number, operating agreement.</p>
            """,
            "eyebrow": "Documentation",
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Top markets for Canadian DSCR",
            "title": "Where Canadian investors concentrate",
            "intro": "Proximity, climate, and lifestyle drive Canadian DSCR concentration in specific metros.",
            "headers": ["Market", "Why Canadians invest there"],
            "rows": [
                ["Phoenix, AZ", "Sun, no state income tax, lower acquisition cost than Vancouver/Toronto"],
                ["Las Vegas, NV", "Tourism STR, no state income tax, short flight from Western Canada"],
                ["Orlando, FL", "Theme park STR, no state income tax, retirement-friendly"],
                ["Tampa, FL", "Beach lifestyle, no state income tax, growth market"],
                ["Austin, TX", "Tech, no state income tax, growth market"],
                ["Scottsdale, AZ", "Luxury STR, retirement, lifestyle"],
                ["Nashville, TN", "Music/tech, no state income tax, growth market"],
            ],
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("Foreign National DSCR", "/programs/dscr-foreign-national.html", "Program guide"),
                ("ITIN DSCR loans", "/programs/dscr-itin.html", "Program guide"),
                ("DSCR for Airbnb &amp; STR", "/programs/dscr-airbnb-str.html", "Program guide"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ],
})


if __name__ == "__main__":
    print(f"Loaded {len(RESOURCES)} resource pages")
