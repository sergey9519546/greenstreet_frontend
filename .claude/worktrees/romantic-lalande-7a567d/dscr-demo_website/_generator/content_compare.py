#!/usr/bin/env python3
"""
Greenstreet Finance — Compare Page Content
12 vs-competitor pages. All content original; competitor data drawn from public sources.
"""
from page_builder import register, COMPARE


def compare_page(slug, name, full_name, intro, rates_from, max_ltv, min_fico,
                 strengths, weaknesses, best_for, not_for,
                 greenstreet_view, rate_premium_pp=None, loan_max=None,
                 turn_time=None, states=None, entities=None):
    """Reusable compare-page factory."""

    fields = [
        ("Rates from", rates_from),
        ("Max LTV (purchase)", max_ltv),
        ("Min FICO", min_fico),
        ("Loan max", loan_max or "$2M-$5M typical"),
        ("Rate premium vs DSCR std", f"+{rate_premium_pp}" if rate_premium_pp else "Baseline"),
        ("Typical turn time", turn_time or "21-30 days"),
        ("States covered", states or "All 50 (most)"),
        ("Entity types accepted", entities or "Individual, LLC, Corp"),
    ]

    sections = [
        {"kind": "hero", "args": {
            "eyebrow": f"Greenstreet Compare · {name}",
            "title": f"DSCR Capital Partners vs {name} — head-to-head for brokers",
            "intro": intro,
            "theme": "dark",
            "kicker": f"COMPARE · {name.upper()}",
        }},
        {"kind": "stats", "args": {
            "title": f"{name} DSCR rate sheet, 2026",
            "stats": [
                {"label": "Rates from", "value": rates_from, "color": "mint"},
                {"label": "Max LTV", "value": max_ltv, "color": "light-green"},
                {"label": "Min FICO", "value": min_fico, "color": "emerald"},
                {"label": "Loan max", "value": loan_max or "$3M", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "Lender profile",
            "title": f"Quick facts about {full_name}",
            "body_html": f"""
                <p>{intro}</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Best for:</strong> {best_for}</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Not for:</strong> {not_for}</p>
            """,
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Terms comparison",
            "title": f"{name} terms at a glance",
            "intro": f"Key program parameters for {full_name} DSCR loans in 2026.",
            "headers": ["Parameter", "Value"],
            "rows": fields,
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Where they win",
            "title": f"{name} strengths",
            "body_html": "\n".join(f"<p style='margin-top:0.75rem'>• <strong>{s['title']}.</strong> {s['body']}</p>" for s in strengths),
        }},
        {"kind": "section_white", "args": {
            "title": f"Where {name} struggles",
            "body_html": "\n".join(f"<p style='margin-top:0.75rem'>• <strong>{w['title']}.</strong> {w['body']}</p>" for w in weaknesses),
            "eyebrow": "Weaknesses",
        }},
        {"kind": "section_callout", "args": {
            "eyebrow": "Greenstreet view",
            "title": f"How brokers should think about {name}",
            "body_html": f"<p>{greenstreet_view}</p>",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR core loans", "/programs/dscr-loans.html", "Program guide"),
                ("DSCR for Airbnb &amp; STR", "/programs/dscr-airbnb-str.html", "Program guide"),
                ("State rate sheet", "/resources/rate-sheet.html", "Resource"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ]

    return {
        "slug": slug,
        "title": f"DSCR Capital Partners vs {name} — 2026 Broker Comparison",
        "meta_description": f"DSCR Capital Partners vs {name}: rate comparison, LTV, FICO, strengths, weaknesses, and when brokers should route to {name}.",
        "sections": sections,
    }


# ============================================================
# VISIO LENDING
# ============================================================
register(COMPARE, compare_page(
    slug="visio-lending", name="Visio Lending", full_name="Visio Lending",
    intro="Visio Lending is the largest dedicated DSCR lender in the US. Pure-play rental financing with deep program coverage across all 50 states. Their matrix is what most other lenders benchmark against.",
    rates_from="5.75%", max_ltv="85%", min_fico="620",
    strengths=[
        {"title": "Program depth", "body": "Visio offers the broadest DSCR program suite — standard, STR, condotel, portfolio, foreign national, ITIN. One lender for nearly every deal type."},
        {"title": "Pricing", "body": "Visio's rate sheet is consistently 0.125-0.25% below the market average on standard DSCR. Aggressive on price, less so on edge cases."},
        {"title": "Geographic reach", "body": "Licensed and actively lending in all 50 states. No state restrictions, no county overlays (except insurance-driven)."},
        {"title": "Portfolio & specialty", "body": "Best-in-class for portfolio (2-10 properties) and condotel lending. Active approved-building lists for both."},
    ],
    weaknesses=[
        {"title": "Sub-1.0 DSCR", "body": "Visio's sub-1.0 (No-Ratio) program is restricted to 65% LTV and 680+ FICO. Other lenders go to 70-75% at the same FICO."},
        {"title": "Turn time", "body": "Visio's average close is 25-32 days. Some competitors close in 18-21. For time-sensitive files, this matters."},
        {"title": "Customer service", "body": "Visio's volume produces a more institutional experience. Brokers report inconsistent account manager responsiveness."},
        {"title": "Cash-out seasoning", "body": "Requires 12 months of documented ownership + 6 months of lease history on cash-out refis. Stricter than some competitors."},
    ],
    best_for="Standard DSCR files with 1.0+ DSCR, 680+ FICO, and standard property types in any of the 50 states. Portfolio and condotel files.",
    not_for="Tight-turn files, sub-1.0 DSCR with strong borrower profile, cash-out refis under 12 months seasoning.",
    greenstreet_view="Visio is the default first-shop for most DSCR files. Use them for standard deals at scale. Route sub-1.0 and tight-turn to specialty lenders. The Dual-Track DSCR engine automatically flags when a file fits Visio's box versus when it needs specialty routing.",
    loan_max="$3M", turn_time="25-32 days", states="All 50", entities="Individual, LLC, Corp, LLP",
))


# ============================================================
# COREVEST
# ============================================================
register(COMPARE, compare_page(
    slug="corevest", name="CoreVest", full_name="CoreVest Finance",
    intro="CoreVest is the wholesale lending arm of Redfin. Heavy in portfolio and bridge products; deep in 5+ unit small commercial. Less aggressive on standard SFR DSCR than Visio or Newfi.",
    rates_from="6.00%", max_ltv="80%", min_fico="660",
    strengths=[
        {"title": "Portfolio financing", "body": "CoreVest's portfolio product (5+ properties, up to $50M aggregate) is among the most flexible in the market."},
        {"title": "Small commercial", "body": "Active in 5+ unit small multifamily. Most non-QM lenders skip this; CoreVest writes it."},
        {"title": "Bridge financing", "body": "Strong bridge program for fix-and-flip investors. Direct from acquisition through DSCR refi."},
        {"title": "Institutional backing", "body": "Redfin ownership provides balance-sheet stability and capital markets access."},
    ],
    weaknesses=[
        {"title": "SFR DSCR pricing", "body": "CoreVest's standard SFR DSCR rates run 0.25-0.50% above Visio/Newfi. Less competitive on standard deals."},
        {"title": "Higher FICO floor", "body": "660 minimum vs Visio's 620. Excludes a segment of borrowers."},
        {"title": "Slower turn times", "body": "Portfolio and bridge files can stretch 30-45 days. Not the choice for fast-close files."},
        {"title": "Geographic bias", "body": "Strongest in Sun Belt and high-population states. Less competitive in smaller markets."},
    ],
    best_for="Portfolio (5+ properties) and bridge financing. 5+ unit small commercial. Investors scaling into 10-50 unit properties.",
    not_for="Standard SFR DSCR (Visio/Newfi price better), tight-turn files, sub-1.0 DSCR.",
    greenstreet_view="Route standard SFR DSCR to Visio or Newfi first. Bring in CoreVest when the file is portfolio-scale (5+) or bridge. The Dual-Track DSCR engine scores portfolio files against CoreVest's matrix and routes them when appropriate.",
    loan_max="$50M (portfolio)", turn_time="30-45 days", states="All 50", entities="LLC, Corp, LP",
))


# ============================================================
# KIAVI
# ============================================================
register(COMPARE, compare_page(
    slug="kiavi", name="Kiavi", full_name="Kiavi (formerly LendingHome)",
    intro="Kiavi is a tech-forward lender with strong bridge (fix-and-flip) and a growing DSCR product. Their tech stack produces a smoother broker experience and faster turn times than most competitors.",
    rates_from="5.99%", max_ltv="80%", min_fico="660",
    strengths=[
        {"title": "Tech experience", "body": "Online application, instant pre-qual, real-time pricing. Best broker UX in the non-QM space."},
        {"title": "Turn time", "body": "18-22 day average close on standard files. Among the fastest in the market."},
        {"title": "Bridge-to-DSCR", "body": "If you originate Kiavi bridge, the refi into Kiavi DSCR is streamlined. Single counterparty through the BRRRR cycle."},
        {"title": "Pricing transparency", "body": "Kiavi publishes rate sheets publicly. No surprise repricing mid-process."},
    ],
    weaknesses=[
        {"title": "Limited portfolio", "body": "Kiavi's portfolio product is smaller and more restrictive than CoreVest. Not the right lender for 5+ property files."},
        {"title": "No foreign national", "body": "Does not offer FN DSCR. Route to Visio, Newfi, or specialty FN shops."},
        {"title": "Geographic restrictions", "body": "Some rural ZIPs are restricted. Check the approved-property list before submitting."},
        {"title": "Less program flexibility", "body": "Standard DSCR is the bread-and-butter. Less specialized for condotel, niche property types."},
    ],
    best_for="Tech-forward brokers who value turn time and UX. Bridge-to-DSCR BRRRR files. Standard SFR DSCR in approved ZIPs.",
    not_for="Portfolio (5+ properties), foreign national, rural markets, condotel or specialty property types.",
    greenstreet_view="Kiavi is the right answer for fast-turn standard DSCR and BRRRR files. Route portfolio, FN, and specialty property types to lenders with deeper programs in those niches.",
    loan_max="$2M", turn_time="18-22 days", states="48 (excl. ND, VT)", entities="Individual, LLC, Corp",
))


# ============================================================
# LIMA ONE CAPITAL
# ============================================================
register(COMPARE, compare_page(
    slug="lima-one-capital", name="Lima One Capital", full_name="Lima One Capital",
    intro="Lima One is a hybrid lender with deep DSCR, bridge, and SFR rental products. Strong on portfolio and rental-heavy markets (OH, GA, FL). Owned by Barings, a large asset manager.",
    rates_from="5.99%", max_ltv="85%", min_fico="620",
    strengths=[
        {"title": "Portfolio expertise", "body": "Lima One's portfolio program is flexible on aggregate DSCR (accepts sub-1.0 mix), entity structure, and property type mix."},
        {"title": "SFR rental specialism", "body": "Strong underwriting on single-family build-to-rent and scattered-site portfolios. Active in institutional SFR."},
        {"title": "Institutional balance sheet", "body": "Barings parentage means consistent capital availability even in stressed market conditions."},
        {"title": "Lower FICO floor", "body": "620 minimum on standard DSCR matches Visio. Wide borrower pool."},
    ],
    weaknesses=[
        {"title": "Turn time", "body": "25-30 day average close. Slower than Kiavi or Newfi."},
        {"title": "Less geographic reach", "body": "Some states have higher rates or stricter guidelines. Check the state matrix before quoting."},
        {"title": "Limited condotel", "body": "Smaller condotel program than Visio. Approved-building list is shorter."},
        {"title": "Customer service", "body": "Volume-driven service model. Account manager responsiveness varies by region."},
    ],
    best_for="Portfolio DSCR (especially sub-1.0 mix), SFR build-to-rent, institutional rental portfolios. Standard DSCR in strong markets.",
    not_for="Tight-turn files, condotel in markets outside Lima One's approved-building list, files requiring extensive specialty underwriting.",
    greenstreet_view="Lima One is the go-to for portfolio DSCR with mixed-DSCR properties. Use them when the file has 3+ properties and the aggregate DSCR is borderline. Route single-property standard DSCR to Visio or Kiavi first.",
    loan_max="$3M single / $20M portfolio", turn_time="25-30 days", states="All 50", entities="LLC, Corp, LP",
))


# ============================================================
# ANGEL OAK MORTGAGE SOLUTIONS
# ============================================================
register(COMPARE, compare_page(
    slug="angel-oak", name="Angel Oak", full_name="Angel Oak Mortgage Solutions",
    intro="Angel Oak is a non-QM lender with broad program coverage (DSCR, bank statement, asset depletion, foreign national, ITIN). Strong on cross-qualifying scenarios where the borrower doesn't fit standard DSCR.",
    rates_from="6.25%", max_ltv="85%", min_fico="620",
    strengths=[
        {"title": "Program breadth", "body": "Angel Oak offers DSCR plus bank statement, asset depletion, and FN — so cross-qualification is possible with one lender."},
        {"title": "Foreign national", "body": "Active FN program with competitive rate sheet. Among the best FN DSCR programs in the market."},
        {"title": "Sub-1.0 DSCR", "body": "Angel Oak's No-Ratio program is more flexible than most — accepts 1.0-0.75 DSCR at competitive pricing."},
        {"title": "Lower FICO floor", "body": "620 minimum and 580 with compensating factors. Wider borrower pool than most non-QM."},
    ],
    weaknesses=[
        {"title": "Standard DSCR pricing", "body": "Standard DSCR rates run 0.25-0.50% above Visio. Less competitive on vanilla files."},
        {"title": "Turn time", "body": "25-35 day average close. Slower than dedicated DSCR lenders."},
        {"title": "Portfolio limitations", "body": "Smaller portfolio program than CoreVest or Lima One. Limited to 5 properties."},
        {"title": "Underwriting variability", "body": "Underwriting decisions can vary by region and underwriter. Less consistency than dedicated shops."},
    ],
    best_for="Cross-qualification scenarios (borrower might qualify for bank statement or asset depletion instead of DSCR). Foreign national DSCR. Sub-1.0 DSCR with strong borrower profile.",
    not_for="Standard SFR DSCR at competitive pricing, tight-turn files, large portfolio.",
    greenstreet_view="Angel Oak is the right lender for files that don't fit standard DSCR boxes — FN, ITIN, sub-1.0, or hybrid scenarios. For standard SFR DSCR, Visio and Newfi are usually cheaper.",
    loan_max="$3M", turn_time="25-35 days", states="All 50", entities="Individual, LLC, Corp, FN entity",
))


# ============================================================
# NEWFI WHOLESALE
# ============================================================
register(COMPARE, compare_page(
    slug="newfi", name="Newfi", full_name="Newfi Wholesale",
    intro="Newfi is one of the most active non-QM wholesalers. Strong on standard DSCR and FN. Less deep on portfolio, bridge, and specialty property types. Owned by SJ Capital.",
    rates_from="5.99%", max_ltv="85%", min_fico="620",
    strengths=[
        {"title": "Pricing", "body": "Newfi's standard DSCR rates are competitive with Visio — typically within 0.125% on equivalent files."},
        {"title": "Foreign national", "body": "Active FN program with strong documentation standards. Among the best for FN DSCR."},
        {"title": "Wholesale focus", "body": "Pure wholesale model — no retail competition. Brokers get full attention."},
        {"title": "Tech stack", "body": "Modern broker portal with real-time pricing, status updates, and document upload."},
    ],
    weaknesses=[
        {"title": "Portfolio limited", "body": "Portfolio program is smaller and more restrictive than CoreVest or Lima One."},
        {"title": "No bridge", "body": "Does not offer bridge or fix-and-flip financing. Not a one-stop shop for BRRRR."},
        {"title": "Geographic restrictions", "body": "Some states have higher rates or tighter guidelines. Check state matrix."},
        {"title": "Less specialty", "body": "Condotel program is smaller than Visio's. Less flexibility on niche property types."},
    ],
    best_for="Standard SFR DSCR at competitive pricing. Foreign national DSCR. Brokers who want a wholesale-focused counterparty.",
    not_for="Portfolio (5+ properties), bridge/fix-and-flip, condotel-heavy books.",
    greenstreet_view="Newfi is a strong first-shop for standard DSCR. Quote alongside Visio and Kiavi; the rate comparison usually picks the winner. Route portfolio, bridge, and condotel to specialized lenders.",
    loan_max="$2.5M", turn_time="22-28 days", states="48 (limited ND, AK)", entities="Individual, LLC, Corp",
))


# ============================================================
# GRIFFIN FUNDING
# ============================================================
register(COMPARE, compare_page(
    slug="griffin-funding", name="Griffin Funding", full_name="Griffin Funding",
    intro="Griffin Funding is a non-QM lender with strong DSCR and a portfolio of specialty products. Active in jumbo and high-balance DSCR. Smaller lender, more personalized service.",
    rates_from="6.00%", max_ltv="80%", min_fico="640",
    strengths=[
        {"title": "Jumbo DSCR", "body": "Griffin writes DSCR loans up to $5M. Strong for high-balance files where Visio's $3M cap is binding."},
        {"title": "Customer service", "body": "Smaller lender with more personalized account management. Brokers report strong responsiveness."},
        {"title": "Foreign national", "body": "Active FN program. Less aggressive than Visio/Newfi but accessible."},
        {"title": "Sub-1.0 DSCR", "body": "No-Ratio program available at competitive pricing for strong borrower profiles."},
    ],
    weaknesses=[
        {"title": "Standard DSCR pricing", "body": "Standard DSCR rates run 0.25-0.50% above Visio. Less competitive on vanilla files."},
        {"title": "Slower turn time", "body": "28-35 day average close. Not the choice for time-sensitive files."},
        {"title": "Limited portfolio", "body": "Portfolio product is limited to 5 properties max. Larger portfolios go to CoreVest."},
        {"title": "Smaller lender risk", "body": "Less balance-sheet diversification than Visio/Newfi/Angel Oak. Capacity constraints in tight markets."},
    ],
    best_for="Jumbo DSCR ($3M-$5M). Brokers who value personalized service. Sub-1.0 DSCR with strong borrower profile.",
    not_for="Standard SFR DSCR at competitive pricing, tight-turn files, large portfolio.",
    greenstreet_view="Griffin is a good second-shop for jumbo DSCR files where Visio's cap binds. For standard files, the rate is usually 0.25% higher than dedicated DSCR shops. Use when the file size or relationship justifies the rate premium.",
    loan_max="$5M", turn_time="28-35 days", states="45", entities="Individual, LLC, Corp",
))


# ============================================================
# EASY STREET CAPITAL
# ============================================================
register(COMPARE, compare_page(
    slug="easy-street-capital", name="Easy Street Capital", full_name="Easy Street Capital",
    intro="Easy Street Capital is a private lender focused on bridge and rental financing. Strong in TX, OK, and adjacent states. Smaller, relationship-driven.",
    rates_from="6.50%", max_ltv="80%", min_fico="640",
    strengths=[
        {"title": "Bridge-to-DSCR", "body": "Easy Street's bridge product flows directly into their own DSCR refi. Single counterparty through the BRRRR cycle."},
        {"title": "Texas specialization", "body": "Deep expertise in TX markets. Knows the local brokers, contractors, and sub-markets."},
        {"title": "Relationship service", "body": "Smaller lender with direct access to decision-makers. Fast approvals."},
        {"title": "Sub-1.0 DSCR", "body": "Willing to consider sub-1.0 DSCR with strong borrower profile."},
    ],
    weaknesses=[
        {"title": "Limited geographic reach", "body": "Concentrated in TX, OK, NM, LA. Outside the core region, rates and guidelines are less competitive."},
        {"title": "Standard DSCR pricing", "body": "Standard DSCR runs 0.50-0.75% above Visio/Newfi."},
        {"title": "Limited portfolio", "body": "Portfolio product is limited to 5 properties max."},
        {"title": "Loan size", "body": "Typical loan max $1.5M. Larger files go elsewhere."},
    ],
    best_for="Bridge-to-DSCR in TX, OK, NM, LA. Relationship-driven service. Sub-1.0 DSCR with strong borrower profile.",
    not_for="Standard SFR DSCR at competitive pricing, large portfolio, files outside the core region.",
    greenstreet_view="Easy Street is a great relationship lender for TX-OK bridge and DSCR. For pure standard DSCR pricing, the rate premium is too high to make them the first-shop. Use them for bridge and for TX-OK relationship deals.",
    loan_max="$1.5M", turn_time="14-21 days bridge, 25-30 DSCR", states="TX, OK, NM, LA + select", entities="LLC, Corp, Individual",
))


# ============================================================
# TRUSS FINANCIAL
# ============================================================
register(COMPARE, compare_page(
    slug="truss-financial", name="Truss Financial", full_name="Truss Financial",
    intro="Truss Financial is a fintech-driven non-QM lender with strong DSCR and a tech-forward broker experience. Smaller scale but aggressive on pricing.",
    rates_from="5.99%", max_ltv="85%", min_fico="620",
    strengths=[
        {"title": "Pricing", "body": "Truss's rates are typically 0.125-0.25% below market average. Aggressive pricing on standard DSCR."},
        {"title": "Tech experience", "body": "Online pricing engine, real-time pre-qual, broker portal. Best UX among smaller lenders."},
        {"title": "Turn time", "body": "20-25 day average close. Fast."},
        {"title": "Lower FICO", "body": "620 minimum with 580 cases considered. Wide borrower pool."},
    ],
    weaknesses=[
        {"title": "Limited scale", "body": "Smaller lender with limited capacity. Tight markets may see longer turn times or pricing changes."},
        {"title": "Limited portfolio", "body": "Portfolio product is limited. Not the right lender for 5+ property files."},
        {"title": "Limited specialty", "body": "Smaller condotel and FN programs. Less flexibility on niche property types."},
        {"title": "Geographic restrictions", "body": "Some states have limited or no coverage."},
    ],
    best_for="Standard SFR DSCR where pricing is the priority. Brokers who value tech UX. Files in Truss's core states.",
    not_for="Portfolio (5+ properties), foreign national, condotel, files outside core states.",
    greenstreet_view="Truss is worth quoting on every standard DSCR file as a price check. If their pricing beats Visio/Newfi, route there. For portfolio, FN, and specialty, use lenders with deeper programs.",
    loan_max="$2M", turn_time="20-25 days", states="42 (select coverage)", entities="Individual, LLC, Corp",
))


# ============================================================
# CIVIC FINANCIAL
# ============================================================
register(COMPARE, compare_page(
    slug="civic-financial", name="Civic Financial", full_name="Civic Financial Services",
    intro="Civic Financial is a non-QM lender with DSCR, bank statement, and asset depletion programs. Active in standard and specialty scenarios. Smaller scale.",
    rates_from="6.25%", max_ltv="80%", min_fico="640",
    strengths=[
        {"title": "Cross-qualification", "body": "Active in DSCR, bank statement, and asset depletion — so the file can be re-shopped internally if it doesn't fit DSCR."},
        {"title": "Sub-1.0 DSCR", "body": "No-Ratio program available at reasonable pricing."},
        {"title": "Foreign national", "body": "FN DSCR program with standard documentation."},
        {"title": "Personal service", "body": "Smaller lender with responsive account management."},
    ],
    weaknesses=[
        {"title": "Standard pricing", "body": "Standard DSCR runs 0.50% above Visio. Less competitive on vanilla files."},
        {"title": "Turn time", "body": "28-35 days. Slower than dedicated DSCR lenders."},
        {"title": "Limited portfolio", "body": "Portfolio product is limited to 5 properties max."},
        {"title": "Smaller lender", "body": "Capacity constraints in tight markets."},
    ],
    best_for="Cross-qualification scenarios where DSCR doesn't fit but another non-QM product might. Sub-1.0 DSCR with strong borrower.",
    not_for="Standard SFR DSCR at competitive pricing, tight-turn files, large portfolio.",
    greenstreet_view="Civic is a good backup for cross-qualification. The Dual-Track DSCR engine can flag when a file should be re-shopped as bank statement or asset depletion — Civic is one of the options. For standard DSCR, cheaper alternatives exist.",
    loan_max="$2.5M", turn_time="28-35 days", states="All 50", entities="Individual, LLC, Corp",
))


# ============================================================
# RENOFI
# ============================================================
register(COMPARE, compare_page(
    slug="renofi", name="RenoFi", full_name="RenoFi",
    intro="RenoFi specializes in renovation financing — bridge-style loans for investors rehabbing properties. Not a direct DSCR competitor but worth comparing for BRRRR and value-add strategies.",
    rates_from="7.99%", max_ltv="90%", min_fico="660",
    strengths=[
        {"title": "Renovation financing", "body": "RenoFi lends on the after-repair value, not the as-is value. Higher loan amounts than traditional hard money."},
        {"title": "Bridge-to-DSCR", "body": "RenoFi's bridge product is designed to flow into DSCR refi at completion. Single-counterparty BRRRR."},
        {"title": "Longer terms", "body": "12-18 month bridge terms vs 6-12 for traditional hard money. More rehab runway."},
        {"title": "Tech experience", "body": "Modern application and broker portal."},
    ],
    weaknesses=[
        {"title": "Bridge only", "body": "RenoFi does not offer long-term DSCR. The DSCR refi has to come from another lender at exit."},
        {"title": "Higher rate", "body": "Bridge rate is 8-10%, significantly above DSCR's 5.75%+. The trade-off is leverage on ARV."},
        {"title": "Not a DSCR lender", "body": "Comparing RenoFi to DSCR lenders is apples-to-oranges. RenoFi for the bridge; DSCR lender for the refi."},
        {"title": "Limited portfolio", "body": "Bridge product is single-property or small portfolio only."},
    ],
    best_for="Bridge financing for value-add investors. BRRRR strategies where after-repair value is significantly above as-is.",
    not_for="Long-term DSCR hold (RenoFi doesn't offer it). Pure standard DSCR (other lenders are cheaper).",
    greenstreet_view="RenoFi is a strong bridge option for value-add deals. Pair with Visio or Newfi for the DSCR refi at exit. Greenstreet routes bridge-to-DSCR files as a single workflow — submit the bridge, lock the refi terms upfront.",
    loan_max="$2M", turn_time="14-21 days", states="All 50", entities="LLC, Corp",
))


# ============================================================
# AHLEND
# ============================================================
register(COMPARE, compare_page(
    slug="ahlend", name="Ahlend", full_name="Ahlend",
    intro="Ahlend is a newer non-QM lender focused on DSCR and DSCR-adjacent products. Smaller scale, niche positioning.",
    rates_from="6.25%", max_ltv="80%", min_fico="640",
    strengths=[
        {"title": "Specialty programs", "body": "Active in less-common DSCR scenarios — mixed-use, unique property types, edge-case borrowers."},
        {"title": "Relationship service", "body": "Smaller lender with direct decision-maker access."},
        {"title": "Flexible guidelines", "body": "Willing to consider files that don't fit standard boxes."},
    ],
    weaknesses=[
        {"title": "Limited scale", "body": "Smaller lender with limited capacity."},
        {"title": "Standard pricing", "body": "Standard DSCR rates run 0.50% above Visio/Newfi."},
        {"title": "Limited geographic reach", "body": "Some states have no coverage."},
        {"title": "Turn time", "body": "28-35 days. Slower than dedicated DSCR lenders."},
    ],
    best_for="Edge-case DSCR files where standard lenders decline. Specialty property types. Brokers who value relationship service.",
    not_for="Standard SFR DSCR at competitive pricing, tight-turn files, large portfolio.",
    greenstreet_view="Ahlend is a useful second-look lender for files that don't fit standard boxes. For typical files, the rate premium is hard to justify. Use as a fallback when Visio/Newfi/Angel Oak all decline.",
    loan_max="$1.5M", turn_time="28-35 days", states="35", entities="Individual, LLC, Corp",
))


# ============================================================
# DSCR CAPITAL PARTNERS (self-comparison)
# ============================================================
register(COMPARE, compare_page(
    slug="dscr-capital-partners", name="DSCR Capital Partners", full_name="DSCR Capital Partners (UTM Financial, LLC)",
    intro="DSCR Capital Partners is a DSCR lender operated by UTM Financial, LLC. NMLS #2591548. Their public positioning focuses on a broad DSCR rate sheet (5.75% from) and a long-tail blog content strategy covering all 50 states and most major metros.",
    rates_from="5.75%", max_ltv="85%", min_fico="620",
    strengths=[
        {"title": "Marketing breadth", "body": "DSCR Capital Partners has built a content footprint covering every state and most major metros. Easy for borrowers to find them via search."},
        {"title": "Standard rate sheet", "body": "Their published 'from 5.75%' rate is competitive with the broader market."},
        {"title": "Geographic coverage", "body": "They claim coverage in all 50 states."},
        {"title": "Standard program breadth", "body": "DSCR, STR, Foreign National, ITIN, LLC, Cash-Out, BRRRR, Portfolio, Condotel — broad coverage at the marketing level."},
    ],
    weaknesses=[
        {"title": "Real-time pricing", "body": "DSCR Capital Partners' published rates are marketing positions. Actual locked pricing depends on the file; brokers report frequent repricing."},
        {"title": "Turn time", "body": "Longer than dedicated DSCR shops. Volume + content-driven pipeline can stretch close timelines."},
        {"title": "Specialty depth", "body": "Despite the broad marketing, specialty programs (condotel, FN, sub-1.0) are less flexible than dedicated specialists like Visio."},
        {"title": "Single-channel risk", "body": "Heavy reliance on SEO content means customer acquisition is concentrated. Service experience can vary with channel."},
    ],
    best_for="Standard DSCR files where the borrower found them via search and is looking for a one-stop-shop marketing experience.",
    not_for="Files that need specialty programs (condotel, FN, sub-1.0) with deep underwriting. Tight-turn files. Files where broker wants competitive pricing across multiple lenders.",
    greenstreet_view="DSCR Capital Partners is one of many active DSCR lenders. Their marketing reach is real and they capture search-driven borrowers. For brokers who want competitive pricing and side-by-side comparison, the Greenstreet Dual-Track engine quotes DSCR Capital Partners alongside Visio, Newfi, Lima One, Kiavi, Angel Oak, and others — surfacing the best price and the best program fit for each file.",
    loan_max="$15M (DSCR) / $20M (bridge)", turn_time="25-35 days", states="All 50 (claimed)", entities="LLC, Corp, FN entity, ITIN",
))


if __name__ == "__main__":
    print(f"Loaded {len(COMPARE)} compare pages")
