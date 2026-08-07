#!/usr/bin/env python3
"""
Greenstreet Finance — State Page Content
Top 10 states by DSCR investor activity. Original content.
"""
from page_builder import register, STATES


def state_page(slug, name, full_name, summary, capital, top_cities, market_context,
               rate_from="5.75%", max_ltv="85%", min_fico="620", market_notes=None,
               notes_paragraphs=None):
    """Reusable state page factory."""
    market_notes = market_notes or []
    notes_paragraphs = notes_paragraphs or []
    cities_links = "".join(
        f'<a href="/cities/{c["slug"]}.html" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">{c["name"]}</div></a>'
        for c in top_cities
    )
    market_rows = [
        ["Lenders actively quoting", "24-30 non-QM shops"],
        ["Median rent (3-bed SFR, 2026)", f"${market_context.get('median_rent','varies')}"],
        ["Average days on market", f"{market_context.get('dom','varies')}"],
        ["STR licensing required", market_context.get("str_licensing", "Varies by city")],
        ["Property tax rate", market_context.get("ptax", "Varies by county")],
        ["Insurance landscape", market_context.get("insurance", "Standard")],
    ]

    sections = [
        {"kind": "hero", "args": {
            "eyebrow": f"Greenstreet States · {name}",
            "title": f"DSCR loans in {name} — the {full_name} investor playbook",
            "intro": summary,
            "theme": "dark",
            "kicker": f"GREENSTREET · {name.upper()}",
        }},
        {"kind": "stats", "args": {
            "title": f"{name} DSCR rate sheet, 2026",
            "stats": [
                {"label": "Rates from", "value": rate_from, "color": "mint"},
                {"label": "Max LTV (purchase)", "value": max_ltv, "color": "light-green"},
                {"label": "Min FICO", "value": min_fico, "color": "emerald"},
                {"label": "Lenders quoting", "value": "24-30", "color": "mint"},
            ],
        }},
        {"kind": "section_dark", "args": {
            "eyebrow": "Market context",
            "title": f"How {name} DSCR lending actually works in 2026",
            "body_html": f"""
                <p>{market_context.get('intro', '')}</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Lender universe.</strong> {market_context.get('lenders', '')}</p>
                <p style="margin-top:1rem"><strong style="color:var(--swatch--pistachio)">Common pitfalls.</strong> {market_context.get('pitfalls', '')}</p>
            """,
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Market snapshot",
            "title": f"{name} rental market at a glance",
            "intro": f"Key market indicators for {full_name} DSCR investors in 2026.",
            "headers": ["Indicator", "Value"],
            "rows": market_rows,
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Top markets",
            "title": f"Where {name} DSCR lending is concentrated",
            "body_html": f"""
                <p>DSCR volume in {name} concentrates in a handful of metros with strong rental fundamentals — employment diversity, population growth, and rent-to-price ratios that support the math.</p>
                <p style="margin-top:1rem"><strong>Capital:</strong> {capital}</p>
                <p style="margin-top:0.5rem"><strong>Active metros:</strong></p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.5rem;margin-top:0.5rem">
                    {cities_links}
                </div>
            """,
        }},
        {"kind": "section_white", "args": {
            "title": f"{name} DSCR — state-specific considerations",
            "body_html": "\n".join(f"<p>{p}</p>" for p in notes_paragraphs),
            "eyebrow": "Local factors",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                ("DSCR for Airbnb &amp; STR", "/programs/dscr-airbnb-str.html", "Program guide"),
                ("DSCR loans for Foreign Nationals", "/programs/dscr-foreign-national.html", "Program guide"),
                ("Compare top lenders", "/compare/visio-lending.html", "Comparison"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ]

    return {
        "slug": slug,
        "title": f"DSCR Loans in {name} — Rates, Lenders & 2026 Investor Guide",
        "meta_description": f"DSCR loans in {name}: rates from {rate_from}, up to {max_ltv} LTV, {min_fico}+ FICO. Lender universe, top markets, and {name}-specific underwriting considerations.",
        "sections": sections,
    }


# ============================================================
# CALIFORNIA — #1 by mention count (251 in competitor data)
# ============================================================
register(STATES, state_page(
    slug="california", name="California", full_name="State of California",
    summary="California is the deepest DSCR market in the country. Bay Area, LA, San Diego, Sacramento, and Inland Empire all produce strong rental fundamentals — high rents, stable tenancy, low vacancy. The catch: California-specific property tax rules (Prop 13), high insurance costs in fire zones, and tighter STR ordinances in many cities.",
    capital="Sacramento",
    top_cities=[
        {"slug": "los-angeles", "name": "Los Angeles"},
        {"slug": "san-diego", "name": "San Diego"},
        {"slug": "sacramento", "name": "Sacramento"},
        {"slug": "oakland", "name": "Oakland"},
        {"slug": "san-jose", "name": "San Jose"},
        {"slug": "riverside", "name": "Riverside"},
        {"slug": "fresno", "name": "Fresno"},
    ],
    market_context={
        "intro": "California DSCR lending operates in a unique environment. The state's median rent is among the highest in the country, which supports high loan amounts and tight DSCR. But the property tax structure (Prop 13) means acquisition cost basis varies wildly, and insurance costs in fire-prone regions can swing the PITIA calculation significantly.",
        "lenders": "Visio, Newfi, Angel Oak, Lima One, Kiavi, AHL, CoreVest, plus 15+ others actively quote CA. Some lenders restrict or surcharge high-fire-zone counties (parts of LA, Ventura, Riverside).",
        "pitfalls": "STR is restricted or banned in many CA cities — confirm local ordinance before quoting a STR DSCR. Property tax impound accounts can be large; some lenders require 6+ months of impounds pre-funded. Insurance quotes in fire zones can exceed PITIA.",
        "median_rent": "$2,800-3,500",
        "dom": "12-22 days",
        "str_licensing": "Varies by city; many ban or restrict",
        "ptax": "1.0-1.3% effective (Prop 13 protected)",
        "insurance": "High in fire/flood zones",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Prop 13 and acquisition basis.</strong> California properties carry forward their original property tax basis under Prop 13. A property bought in 1995 for $200K may have a tax basis 70% below current market. The lender will use the current tax bill for PITIA, but the borrower's actual cash outflow is much lower. This makes CA DSCR unusually favorable on a true-cash-flow basis.",
        "<strong>Fire-zone insurance.</strong> Wildfire exposure has made CA properties uninsurable or extremely expensive to insure in many high-risk ZIP codes. Some lenders restrict LTV or surcharge rate in fire-zone properties. Check the borrower's insurance binder before submitting — a $5K/year insurance bill changes the DSCR math.",
        "<strong>STR restrictions.</strong> Many CA cities have banned or heavily restricted short-term rentals. Los Angeles restricts STR to primary residence only. San Francisco, Santa Monica, Laguna Beach have outright bans or strict caps. Always check the local ordinance before quoting an STR DSCR.",
        "<strong>Rent control.</strong> Los Angeles, San Francisco, Oakland, Berkeley, Santa Monica, and several other CA cities have rent control or just-cause eviction rules that affect DSCR underwriting. Some lenders add a 5% LTV haircut or require a longer rent history in rent-controlled jurisdictions.",
    ],
))


# ============================================================
# FLORIDA — #2 (163 mentions)
# ============================================================
register(STATES, state_page(
    slug="florida", name="Florida", full_name="State of Florida",
    summary="Florida is the second-deepest DSCR market and the most STR-heavy state. Tampa, Orlando, Jacksonville, Miami, and Fort Lauderdale produce strong rental cash flow with no state income tax. Hurricane insurance has hardened significantly — expect higher PITIA and stricter insurance documentation.",
    capital="Tallahassee",
    top_cities=[
        {"slug": "miami", "name": "Miami"},
        {"slug": "orlando", "name": "Orlando"},
        {"slug": "tampa", "name": "Tampa"},
        {"slug": "jacksonville", "name": "Jacksonville"},
        {"slug": "fort-lauderdale", "name": "Fort Lauderdale"},
        {"slug": "naples", "name": "Naples"},
        {"slug": "pensacola", "name": "Pensacola"},
    ],
    market_context={
        "intro": "Florida DSCR lending is uniquely STR-friendly. The state's no-income-tax policy attracts investors, and tourist destinations (Destin, 30A, Key West, Orlando theme parks, Miami Beach) produce reliable STR revenue. Insurance is the dominant friction.",
        "lenders": "Visio, Newfi, Angel Oak, Kiavi, AHL, Lima One, plus 20+ others actively quote FL. Most lenders are comfortable with FL STR, especially in coastal markets.",
        "pitfalls": "Hurricane insurance has doubled or tripled in many FL counties. Wind-mitigation credits are essential to keep premiums manageable. Some coastal ZIPs are restricted or require wind-only policies.",
        "median_rent": "$1,900-2,400",
        "dom": "18-28 days",
        "str_licensing": "State license required + local",
        "ptax": "0.8-2.0% (varies by county)",
        "insurance": "High in coastal counties",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Hurricane insurance.</strong> Since 2022-2023 hurricane seasons, FL property insurance has hardened dramatically. Citizens Insurance (the state-backed insurer of last resort) has thinned its coverage. Many FL DSCR lenders require wind-mitigation credits (impact glass, reinforced roof, etc.) and will not lend on properties without wind coverage.",
        "<strong>STR licensing.</strong> Florida requires a state-level vacation rental license (DBPR) AND local registration. Many counties (Broward, Miami-Dade) have additional caps and registration requirements. Operating without proper licensing puts the property out of DSCR qualifying status.",
        "<strong>Property tax reassessment.</strong> Florida property taxes reassess on sale (not Prop 13-protected). A buyer should expect a 50-100% tax bill increase in year one of ownership. Most lenders will use the post-sale tax figure for PITIA but the borrower's pre-purchase due-diligence should account for this.",
        "<strong>Condo building safety.</strong> Post-Surfside, many FL condo buildings face stricter milestone inspections and reserve requirements. DSCR lenders have responded with tighter building approval lists and additional documentation for condo projects.",
    ],
))


# ============================================================
# TEXAS — #3 (144 mentions)
# =========================================================###
register(STATES, state_page(
    slug="texas", name="Texas", full_name="State of Texas",
    summary="Texas is the third-largest DSCR market and arguably the strongest single-family rental market in the country. Dallas-Fort Worth, Houston, Austin, San Antonio, and the Rio Grande Valley are magnets for investor capital. No state income tax, landlord-friendly laws, low property taxes.",
    capital="Austin",
    top_cities=[
        {"slug": "houston", "name": "Houston"},
        {"slug": "dallas", "name": "Dallas"},
        {"slug": "austin", "name": "Austin"},
        {"slug": "san-antonio", "name": "San Antonio"},
        {"slug": "fort-worth", "name": "Fort Worth"},
        {"slug": "el-paso", "name": "El Paso"},
    ],
    market_context={
        "intro": "Texas DSCR benefits from the most landlord-friendly legal environment in the country. Eviction timelines are 3-4 weeks, no rent control anywhere in the state, and no state income tax makes the cash-on-cash math favorable. Houston and DFW lead in DSCR volume.",
        "lenders": "Visio, Newfi, Kiavi, Angel Oak, AHL, CoreVest, plus 25+ others actively quote TX. Most lenders are unrestricted across the state.",
        "pitfalls": "Texas property taxes are high (1.5-2.5% effective) and reassess annually. Some rural areas have water rights or mineral rights complications. Houston has flood-zone restrictions.",
        "median_rent": "$1,600-2,200",
        "dom": "15-25 days",
        "str_licensing": "Generally allowed, varies by city",
        "ptax": "1.5-2.5% (high, no cap)",
        "insurance": "Standard; hail/wind in north",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Property taxes.</strong> Texas has no property tax cap like California's Prop 13. Effective rates run 1.5-2.5% — significantly higher than most states. Property taxes reassess annually, so a 5%+ tax increase year-over-year is normal. Most TX DSCR lenders use the current tax bill for PITIA qualification.",
        "<strong>Landlord-friendly law.</strong> Texas is one of the most landlord-friendly states. Eviction timelines are 3-4 weeks. No rent control anywhere. No state-mandated just-cause eviction. This makes TX DSCR unusually favorable from a property-management risk perspective.",
        "<strong>Houston flood zones.</strong> Significant portions of Houston are in flood zones. Properties in flood zones require flood insurance, which adds $1,500-$5,000/year to PITIA. Most DSCR lenders will finance flood-zone properties but require the insurance binder upfront.",
        "<strong>STR landscape.</strong> STR is generally allowed in Texas. Some cities (Austin, parts of Houston) restrict STR or require registration. Most DSCR lenders accept TX STR with standard STR documentation.",
    ],
))


# ============================================================
# TENNESSEE — #4 (108 mentions)
# ============================================================
register(STATES, state_page(
    slug="tennessee", name="Tennessee", full_name="State of Tennessee",
    summary="Tennessee is a quietly strong DSCR market, especially in Nashville, Knoxville, Memphis, and Chattanooga. No state income tax, low property taxes, landlord-friendly law. STR is heavily concentrated in the Smoky Mountains (Gatlinburg, Pigeon Forge, Sevierville).",
    capital="Nashville",
    top_cities=[
        {"slug": "nashville", "name": "Nashville"},
        {"slug": "memphis", "name": "Memphis"},
        {"slug": "knoxville", "name": "Knoxville"},
        {"slug": "chattanooga", "name": "Chattanooga"},
        {"slug": "gatlinburg", "name": "Gatlinburg"},
    ],
    market_context={
        "intro": "Tennessee DSCR lending benefits from no state income tax and low property taxes. Nashville is the strongest metro by volume. The Smoky Mountains sub-market (Gatlinburg/Pigeon Forge/Sevierville) is one of the largest STR concentrations in the US.",
        "lenders": "Visio, Newfi, Angel Oak, Kiavi, AHL, plus 20+ others actively quote TN.",
        "pitfalls": "Smoky Mountain STR is highly competitive — cap rates are tight. Some Memphis sub-markets have softer rental fundamentals.",
        "median_rent": "$1,400-1,900",
        "dom": "20-30 days",
        "str_licensing": "Generally allowed, varies by county",
        "ptax": "0.5-0.9%",
        "insurance": "Standard",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Nashville.</strong> Music City has been the strongest TN metro for DSCR over the past 3 years. Population growth and job growth drive consistent rent appreciation. Inventory has loosened slightly but fundamentals remain strong.",
        "<strong>Smoky Mountain STR.</strong> Gatlinburg, Pigeon Forge, Sevierville produce some of the highest STR revenue per property in the country. Most DSCR lenders actively pursue this sub-market. AirDNA TTM revenue typically supports 1.20+ DSCR after the standard 20-25% haircut.",
        "<strong>Memphis.</strong> Memphis offers the highest cash-on-cash returns in TN but with lower appreciation potential. Rent-to-price ratios are strong. DSCR lending is active but lender matrices tend to favor slightly stronger FICO.",
        "<strong>No state income tax.</strong> Tennessee has no state income tax, which makes it attractive to high-income investors relocating from high-tax states. This drives sustained demand for investment properties.",
    ],
))


# ============================================================
# NEW YORK — #5 (88 mentions)
# ============================================================
register(STATES, state_page(
    slug="new-york", name="New York", full_name="State of New York",
    summary="New York DSCR lending is concentrated in Brooklyn, Queens, Bronx, and upstate metros. Strong rents in NYC proper, but high property taxes and strict rent stabilization in older buildings. Upstate metros (Buffalo, Rochester, Syracuse) are emerging STR and SFR markets.",
    capital="Albany",
    top_cities=[
        {"slug": "brooklyn", "name": "Brooklyn"},
        {"slug": "buffalo", "name": "Buffalo"},
        {"slug": "rochester", "name": "Rochester"},
        {"slug": "albany", "name": "Albany"},
    ],
    market_context={
        "intro": "New York DSCR lending is bifurcated. NYC proper (Brooklyn, Queens, Bronx) produces strong rents but high taxes and rent stabilization complicate DSCR math. Upstate metros produce lower rent but lower acquisition cost and growing STR demand.",
        "lenders": "Visio, Newfi, Angel Oak, Kiavi, AHL, plus specialty NYC lenders. Some national lenders restrict NYC.",
        "pitfalls": "Rent stabilization (older buildings) kills DSCR math. NYC property taxes are high. Some upstate metros have weaker rent fundamentals.",
        "median_rent": "$2,000-3,500 (varies widely)",
        "dom": "25-45 days",
        "str_licensing": "NYC restricts STR (most under 30 days illegal)",
        "ptax": "0.5-2.5% (varies by class)",
        "insurance": "High in NYC; standard upstate",
    },
    rate_from="5.99%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>NYC rent stabilization.</strong> Pre-2019 buildings with stabilized tenants have rent caps that often make DSCR math infeasible. Most DSCR lenders will not finance rent-stabilized units. Verify the unit is free-market before quoting.",
        "<strong>NYC STR ban.</strong> Short-term rentals under 30 days are illegal in most of NYC unless the host is present (the 'one-host-one-unit' rule). Most NYC DSCR lenders will not accept STR documentation. Long-term rental only.",
        "<strong>NYC property taxes.</strong> NYC property taxes are high and complex (Class 1, 2, 3, 4 with different rates). Some buildings have abatements or 421a benefits that complicate PITIA calculation. Most DSCR lenders require the lender's tax cert at application.",
        "<strong>Upstate opportunity.</strong> Buffalo, Rochester, Syracuse, and the Catskills produce strong cash-on-cash returns and emerging STR demand. Most DSCR lenders are more comfortable with upstate NY than NYC proper.",
    ],
))


# ============================================================
# OHIO — #6 (87 mentions)
# ============================================================
register(STATES, state_page(
    slug="ohio", name="Ohio", full_name="State of Ohio",
    summary="Ohio is one of the most underrated DSCR markets in the country. Cleveland, Columbus, Cincinnati, and Dayton produce strong rent-to-price ratios, low property taxes, and stable tenancy. The market is dominated by long-term rental (not STR).",
    capital="Columbus",
    top_cities=[
        {"slug": "cleveland", "name": "Cleveland"},
        {"slug": "columbus", "name": "Columbus"},
        {"slug": "cincinnati", "name": "Cincinnati"},
        {"slug": "dayton", "name": "Dayton"},
        {"slug": "akron", "name": "Akron"},
    ],
    market_context={
        "intro": "Ohio DSCR benefits from low acquisition cost, low property taxes (1.5-2.5%), and stable tenancy. The market is dominated by long-term rental; STR is limited. Cleveland and Columbus produce the strongest fundamentals.",
        "lenders": "Visio, Newfi, Angel Oak, Kiavi, AHL, Lima One, plus 20+ others actively quote OH.",
        "pitfalls": "Some Cleveland and Dayton sub-markets have softer fundamentals. Property tax delinquencies are a check at closing.",
        "median_rent": "$1,100-1,500",
        "dom": "25-40 days",
        "str_licensing": "Varies by city; mostly allowed",
        "ptax": "1.5-2.5%",
        "insurance": "Standard",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Rent-to-price.</strong> Ohio produces some of the strongest rent-to-price ratios in the country. A $150K Cleveland duplex rents for $1,400-$1,800/month. This is the engine of OH DSCR.",
        "<strong>Cleveland vs Columbus.</strong> Cleveland offers higher cash-on-cash; Columbus offers stronger appreciation and population growth. Both work for DSCR; the choice depends on the investor's strategy.",
        "<strong>Property tax.</strong> Ohio property taxes run 1.5-2.5% — among the highest in the US. Some counties have tax delinquency issues; the lender will pull a tax certificate at closing.",
        "<strong>Limited STR.</strong> Most OH DSCR is long-term rental. STR demand is concentrated in college towns (Athens, Oxford) and a few lake-effect markets. Most DSCR lenders do not specialize in OH STR.",
    ],
))


# ============================================================
# ARIZONA — #7 (74 mentions)
# ============================================================
register(STATES, state_page(
    slug="arizona", name="Arizona", full_name="State of Arizona",
    summary="Arizona is a top-tier DSCR market driven by Phoenix metro population growth, Scottsdale luxury rentals, and Tucson affordability. No state income tax on retirement income, strong landlord law. Phoenix is the dominant metro.",
    capital="Phoenix",
    top_cities=[
        {"slug": "phoenix", "name": "Phoenix"},
        {"slug": "scottsdale", "name": "Scottsdale"},
        {"slug": "tucson", "name": "Tucson"},
        {"slug": "mesa", "name": "Mesa"},
        {"slug": "tempe", "name": "Tempe"},
    ],
    market_context={
        "intro": "Arizona DSCR lending centers on Phoenix metro. Population growth from California migration drives strong fundamentals. Scottsdale and Phoenix produce strong STR demand. Tucson is a more affordable entry point.",
        "lenders": "Visio, Newfi, Angel Oak, Kiavi, AHL, plus 20+ others actively quote AZ.",
        "pitfalls": "Phoenix summer vacancy is real — some lenders require 9+ months reserves. STR income can be volatile.",
        "median_rent": "$1,600-2,400",
        "dom": "15-25 days",
        "str_licensing": "State license required + local",
        "ptax": "0.6-0.9%",
        "insurance": "Standard; hail in north",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Phoenix growth.</strong> Phoenix metro has been one of the fastest-growing in the US since 2020. Population growth drives consistent rent appreciation and low vacancy. DSCR lending is active across all major Phoenix sub-markets.",
        "<strong>Scottsdale STR.</strong> Scottsdale is one of the top STR markets in the Southwest. Spring training, Old Town events, and desert tourism drive strong year-round occupancy. Most DSCR lenders actively pursue Scottsdale STR.",
        "<strong>Summer vacancy.</strong> Phoenix summers are brutally hot. Some sub-markets see 30-40% occupancy drop June-August. Most DSCR lenders require 6-9 months reserves on Phoenix STR; some require 12 months.",
        "<strong>Tucson affordability.</strong> Tucson offers 30-40% lower acquisition cost than Phoenix with similar rent-to-price ratios. Strong entry point for first-time investors. Less lender competition than Phoenix.",
    ],
))


# ============================================================
# COLORADO — #8 (74 mentions)
# ============================================================
register(STATES, state_page(
    slug="colorado", name="Colorado", full_name="State of Colorado",
    summary="Colorado DSCR lending is dominated by Denver metro and mountain STR markets (Breckenridge, Vail, Aspen, Telluride). High rents, strong STR revenue in mountain markets, but high acquisition cost and property tax.",
    capital="Denver",
    top_cities=[
        {"slug": "denver", "name": "Denver"},
        {"slug": "colorado-springs", "name": "Colorado Springs"},
        {"slug": "aurora", "name": "Aurora"},
        {"slug": "breckenridge", "name": "Breckenridge"},
    ],
    market_context={
        "intro": "Colorado DSCR is split between Denver metro (long-term rental) and mountain markets (STR). Both work for DSCR; the matrices differ.",
        "lenders": "Visio, Newfi, Angel Oak, Kiavi, plus 15+ others actively quote CO.",
        "pitfalls": "STR income in mountain markets is seasonal. Property taxes are high. Some mountain areas have HOA restrictions on STR.",
        "median_rent": "$1,800-3,500",
        "dom": "20-35 days",
        "str_licensing": "Varies by county; HOA often restricts",
        "ptax": "0.5-0.8%",
        "insurance": "Standard; high in wildfire zones",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Denver fundamentals.</strong> Denver metro is one of the strongest long-term rental markets in the Mountain West. Population growth, job growth, and a diversified economy support consistent rent appreciation.",
        "<strong>Mountain STR.</strong> Breckenridge, Vail, Aspen, Telluride produce some of the highest STR revenue per property in the country. Most DSCR lenders actively pursue mountain STR with standard 20-25% haircut. Seasonality is real — most mountain markets swing 5x between peak and shoulder.",
        "<strong>HOA restrictions.</strong> Many mountain HOAs restrict STR (minimum rental periods, owner-occupancy requirements, caps on rental permits). Always check the HOA before quoting mountain STR DSCR.",
        "<strong>Property tax.</strong> Colorado property taxes are relatively low (0.5-0.8% effective) but reassessments can be aggressive. Some mountain counties have high effective rates due to high valuations.",
    ],
))


# ============================================================
# VIRGINIA — #9 (73 mentions)
# ============================================================
register(STATES, state_page(
    slug="virginia", name="Virginia", full_name="Commonwealth of Virginia",
    summary="Virginia DSCR lending is concentrated in Northern Virginia (Arlington, Fairfax, Alexandria), Richmond, and Virginia Beach. Proximity to DC drives strong fundamentals. Landlord-friendly law with fast eviction timelines.",
    capital="Richmond",
    top_cities=[
        {"slug": "richmond", "name": "Richmond"},
        {"slug": "virginia-beach", "name": "Virginia Beach"},
        {"slug": "arlington", "name": "Arlington"},
        {"slug": "fairfax", "name": "Fairfax"},
    ],
    market_context={
        "intro": "Virginia DSCR lending benefits from DC-area employment stability, fast eviction timelines, and no rent control. Northern Virginia produces high rents; Richmond offers affordability with strong fundamentals.",
        "lenders": "Visio, Newfi, Angel Oak, Kiavi, plus 18+ others actively quote VA.",
        "pitfalls": "Northern Virginia prices are very high. Some jurisdictions have stricter rental registration.",
        "median_rent": "$1,600-2,800",
        "dom": "20-30 days",
        "str_licensing": "Varies by city",
        "ptax": "0.7-1.1%",
        "insurance": "Standard; flood zones in Tidewater",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Northern Virginia.</strong> Close-in NOVA (Arlington, Fairfax, Alexandria) produces some of the highest DSCR loan amounts in the country. Federal employment and contractor base supports consistent demand.",
        "<strong>Richmond.</strong> Richmond offers some of the best rent-to-price ratios in VA. Population growth from NOVA spillover and a diversified economy support consistent rent appreciation.",
        "<strong>Eviction timelines.</strong> Virginia evictions run 3-5 weeks — among the fastest in the country. This makes VA DSCR unusually favorable from a property-management risk perspective.",
        "<strong>STR landscape.</strong> STR is allowed in most VA jurisdictions. Virginia Beach and the Chesapeake Bay area produce strong STR revenue. Some NOVA jurisdictions restrict STR.",
    ],
))


# ============================================================
# GEORGIA — #10 (66 mentions)
# ============================================================
register(STATES, state_page(
    slug="georgia", name="Georgia", full_name="State of Georgia",
    summary="Georgia DSCR lending centers on Atlanta metro with secondary markets in Savannah and Augusta. Strong population growth, business-friendly environment, and a fast-growing tech and film industry drive consistent rental demand.",
    capital="Atlanta",
    top_cities=[
        {"slug": "atlanta", "name": "Atlanta"},
        {"slug": "savannah", "name": "Savannah"},
        {"slug": "augusta", "name": "Augusta"},
        {"slug": "macon", "name": "Macon"},
    ],
    market_context={
        "intro": "Georgia DSCR lending is dominated by Atlanta metro. Population growth from California and Northeast migration, a diversified economy (tech, film, logistics, finance), and landlord-friendly law make GA a strong DSCR state.",
        "lenders": "Visio, Newfi, Angel Oak, Kiavi, plus 20+ others actively quote GA.",
        "pitfalls": "Atlanta has wide sub-market variation — some ZIPs are strong, some are soft. Property taxes reassess annually.",
        "median_rent": "$1,500-2,200",
        "dom": "20-30 days",
        "str_licensing": "Generally allowed; Atlanta has STR permit cap",
        "ptax": "0.8-1.4%",
        "insurance": "Standard",
    },
    rate_from="5.75%", max_ltv="85%", min_fico="620",
    notes_paragraphs=[
        "<strong>Atlanta fundamentals.</strong> Atlanta metro has been one of the fastest-growing in the Southeast for a decade. Population growth, job growth, and a diversified economy support consistent rental demand. DSCR lending is active across all major Atlanta sub-markets.",
        "<strong>Sub-market variation.</strong> Atlanta has wide sub-market variation — Buckhead and intown sub-markets are strong, some south-side ZIPs are softer. Most DSCR lenders have approved-property lists or matrix-level guidance on Atlanta sub-markets.",
        "<strong>STR permit cap.</strong> Atlanta has implemented an STR permit cap in some intown neighborhoods. Verify the property has a valid STR permit before quoting STR DSCR.",
        "<strong>Landlord-friendly.</strong> Georgia is one of the most landlord-friendly states. Eviction timelines are 3-4 weeks. No rent control anywhere. This makes GA DSCR unusually favorable from a property-management risk perspective.",
    ],
))


if __name__ == "__main__":
    print(f"Loaded {len(STATES)} state pages")
