#!/usr/bin/env python3
"""
Greenstreet Finance — City Page Content
Top metros by DSCR investor activity. Original content.
"""
from page_builder import register, CITIES


def city_page(slug, name, state, state_slug, intro, market_facts, neighborhoods=None,
              rate_from="5.75%", max_ltv="85%", min_fico="620",
              notes_paragraphs=None):
    neighborhoods = neighborhoods or []
    notes_paragraphs = notes_paragraphs or []

    market_rows = [
        ["Median home price", market_facts.get("price", "varies")],
        ["Median rent (3-bed)", market_facts.get("rent", "varies")],
        ["Rent-to-price ratio", market_facts.get("ratio", "varies")],
        ["Vacancy rate", market_facts.get("vacancy", "varies")],
        ["Days on market", market_facts.get("dom", "varies")],
        ["Population growth (5-yr)", market_facts.get("pop_growth", "varies")],
        ["STR licensing", market_facts.get("str", "varies")],
        ["Property tax rate", market_facts.get("ptax", "varies")],
    ]

    nb_html = ""
    if neighborhoods:
        nb_html = "<p style='margin-top:1rem'><strong>Active neighborhoods:</strong></p><div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.5rem;margin-top:0.5rem'>"
        for nb in neighborhoods:
            nb_html += f'<a href="#" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">{nb}</div></a>'
        nb_html += "</div>"

    sections = [
        {"kind": "hero", "args": {
            "eyebrow": f"Greenstreet Cities · {name}",
            "title": f"DSCR loans in {name}, {state}",
            "intro": intro,
            "theme": "dark",
            "kicker": f"{name.upper()} · {state.upper()}",
        }},
        {"kind": "stats", "args": {
            "title": f"{name} DSCR rate sheet, 2026",
            "stats": [
                {"label": "Rates from", "value": rate_from, "color": "mint"},
                {"label": "Max LTV", "value": max_ltv, "color": "light-green"},
                {"label": "Min FICO", "value": min_fico, "color": "emerald"},
                {"label": "Loan max", "value": "$3M", "color": "mint"},
            ],
        }},
        {"kind": "section_table", "args": {
            "eyebrow": "Market snapshot",
            "title": f"{name} rental market at a glance",
            "intro": f"Key indicators for {name} DSCR investors in 2026.",
            "headers": ["Indicator", "Value"],
            "rows": market_rows,
        }},
        {"kind": "section_light", "args": {
            "eyebrow": "Active sub-markets",
            "title": f"Where {name} DSCR lending concentrates",
            "body_html": f"""
                <p>{name} DSCR volume concentrates in sub-markets with the strongest rent-to-price ratios and the most reliable tenancy. Newer investors should focus on these areas before expanding into softer neighborhoods.</p>
                {nb_html}
            """,
        }},
        {"kind": "section_white", "args": {
            "title": f"{name} DSCR — local considerations",
            "body_html": "\n".join(f"<p>{p}</p>" for p in notes_paragraphs),
            "eyebrow": "Local factors",
        }},
        {"kind": "related", "args": {
            "heading": "Continue with Greenstreet",
            "items": [
                (f"DSCR loans in {state}", f"/states/{state_slug}.html", "State guide"),
                ("DSCR for Airbnb &amp; STR", "/programs/dscr-airbnb-str.html", "Program guide"),
                ("Compare top lenders", "/compare/visio-lending.html", "Comparison"),
            ],
        }},
        {"kind": "cta", "args": {}},
    ]

    return {
        "slug": slug,
        "title": f"DSCR Loans in {name}, {state} — Rates, Lenders & Investor Guide",
        "meta_description": f"DSCR loans in {name}: rates from {rate_from}, up to {max_ltv} LTV. Active sub-markets, market fundamentals, and {name}-specific underwriting.",
        "sections": sections,
    }


# ============================================================
# ATLANTA, GA
# ============================================================
register(CITIES, city_page(
    slug="atlanta", name="Atlanta", state="Georgia", state_slug="georgia",
    intro="Atlanta is the dominant DSCR market in the Southeast. Population growth, a diversified economy (tech, film, logistics, finance), and landlord-friendly law make Atlanta a top-tier DSCR city.",
    market_facts={
        "price": "$350K-$450K",
        "rent": "$1,800-$2,200",
        "ratio": "0.50-0.55%",
        "vacancy": "6-9%",
        "dom": "20-30 days",
        "pop_growth": "+8.5%",
        "str": "Permit cap in intown neighborhoods",
        "ptax": "0.8-1.4%",
    },
    neighborhoods=["Buckhead", "Midtown", "West Midtown", "Inman Park", "Decatur", "Smyrna", "Marietta", "Sandy Springs", "Alpharetta", "Brookhaven"],
    notes_paragraphs=[
        "<strong>Sub-market variation matters.</strong> Atlanta has wide variation between sub-markets. Buckhead and intown ZIPs are strong; some south-side ZIPs are softer. Most DSCR lenders have approved-property lists or matrix-level guidance on Atlanta sub-markets.",
        "<strong>STR permit cap.</strong> Atlanta has implemented an STR permit cap in some intown neighborhoods. Confirm the property has a valid STR permit before quoting STR DSCR.",
        "<strong>Landlord-friendly law.</strong> Georgia is one of the most landlord-friendly states. Eviction timelines run 3-4 weeks. No rent control anywhere.",
        "<strong>Insurance.</strong> Standard for most Atlanta properties. Some north-side ZIPs have hail/wind exposure. Flood zones are limited.",
    ],
))


# ============================================================
# AUSTIN, TX
# ============================================================
register(CITIES, city_page(
    slug="austin", name="Austin", state="Texas", state_slug="texas",
    intro="Austin has cooled from its 2021-2022 peak but remains a strong DSCR market. Tech-driven employment, no state income tax, and a deep rental pool. Some softening in luxury and Class A new construction.",
    market_facts={
        "price": "$450K-$600K",
        "rent": "$2,000-$2,600",
        "ratio": "0.45-0.50%",
        "vacancy": "8-12%",
        "dom": "30-45 days",
        "pop_growth": "+12.5%",
        "str": "STR permit required; restricted in residential",
        "ptax": "1.5-2.5%",
    },
    neighborhoods=["East Austin", "South Congress", "Hyde Park", "Round Rock", "Pflugerville", "Cedar Park", "Georgetown", "Kyle"],
    notes_paragraphs=[
        "<strong>Market cooldown.</strong> Austin cooled sharply in 2023-2024 as supply caught up with demand. Days on market extended to 30-45 days; some luxury sub-markets saw price declines. The market is stabilizing in 2025-2026.",
        "<strong>STR restrictions.</strong> Austin has implemented STR restrictions in residential neighborhoods. Many single-family rentals can no longer operate as STR without a non-conforming use permit. Verify before quoting STR DSCR.",
        "<strong>Property tax.</strong> Texas property taxes are high (1.5-2.5%) and reassess annually. Plan for tax bill growth of 5-10% per year.",
        "<strong>Tech-driven employment.</strong> Austin's tech base (Tesla, Oracle, Google, Apple) supports strong demand. The market is sensitive to tech sector layoffs.",
    ],
))


# ============================================================
# DALLAS, TX
# ============================================================
register(CITIES, city_page(
    slug="dallas", name="Dallas", state="Texas", state_slug="texas",
    intro="Dallas-Fort Worth is the strongest Texas DSCR market by volume. Population growth from California migration, a diversified economy, and landlord-friendly law make DFW the workhorse of TX investor capital.",
    market_facts={
        "price": "$350K-$475K",
        "rent": "$1,800-$2,300",
        "ratio": "0.50-0.55%",
        "vacancy": "6-9%",
        "dom": "22-32 days",
        "pop_growth": "+10.5%",
        "str": "Generally allowed; some city-level restrictions",
        "ptax": "1.5-2.5%",
    },
    neighborhoods=["Uptown", "Deep Ellum", "Plano", "Frisco", "McKinney", "Irving", "Arlington", "Garland"],
    notes_paragraphs=[
        "<strong>Population growth.</strong> DFW has been one of the fastest-growing metros in the US since 2020. California and Northeast migration drives sustained demand.",
        "<strong>Landlord-friendly.</strong> Texas eviction timelines are 3-4 weeks. No rent control. Strong property management market.",
        "<strong>Property tax.</strong> Texas property taxes run 1.5-2.5%. Among the highest in the US. No cap on reassessment.",
        "<strong>Sub-market range.</strong> DFW spans wealthy Collin County suburbs to lower-rent southern Dallas. Investor focus typically lands on mid-tier suburbs (Plano, Frisco, McKinney) for balance of rent and appreciation.",
    ],
))


# ============================================================
# HOUSTON, TX
# ============================================================
register(CITIES, city_page(
    slug="houston", name="Houston", state="Texas", state_slug="texas",
    intro="Houston is the largest Texas metro by population and produces strong DSCR fundamentals. Energy sector diversification, port logistics, and a deep rental market. Flood-zone underwriting is the key consideration.",
    market_facts={
        "price": "$300K-$425K",
        "rent": "$1,700-$2,200",
        "ratio": "0.55-0.60%",
        "vacancy": "7-10%",
        "dom": "25-35 days",
        "pop_growth": "+8.0%",
        "str": "Generally allowed; mostly long-term",
        "ptax": "1.7-2.5%",
    },
    neighborhoods=["The Heights", "Montrose", "Midtown", "Katy", "Sugar Land", "The Woodlands", "Pearland"],
    notes_paragraphs=[
        "<strong>Flood zones.</strong> Significant portions of Houston are in flood zones. Properties in flood zones require flood insurance ($1,500-$5,000/year). Most DSCR lenders will finance flood-zone properties but require insurance upfront.",
        "<strong>Strong rent-to-price.</strong> Houston produces some of the strongest rent-to-price ratios in TX. A $300K property rents for $1,800+.",
        "<strong>Property tax.</strong> Texas high property tax applies. Houston's Harris County effective rate is around 2.0%.",
        "<strong>Long-term rental focus.</strong> Houston is mostly long-term rental. STR demand exists in some sub-markets but is not the dominant strategy.",
    ],
))


# ============================================================
# TAMPA, FL
# ============================================================
register(CITIES, city_page(
    slug="tampa", name="Tampa", state="Florida", state_slug="florida",
    intro="Tampa is one of the strongest DSCR markets in the Southeast. Population growth from Northeast and Midwest migration, no state income tax, and reliable rental fundamentals.",
    market_facts={
        "price": "$375K-$500K",
        "rent": "$1,900-$2,400",
        "ratio": "0.50-0.55%",
        "vacancy": "5-8%",
        "dom": "20-30 days",
        "pop_growth": "+11.0%",
        "str": "State license + local registration",
        "ptax": "0.8-1.5%",
    },
    neighborhoods=["South Tampa", "Hyde Park", "Seminole Heights", "St. Petersburg", "Clearwater", "Brandon", "Riverview", "Wesley Chapel"],
    notes_paragraphs=[
        "<strong>Hurricane insurance.</strong> Tampa is in hurricane country. Insurance has hardened significantly. Most DSCR lenders require wind coverage and 4-point inspection on older properties.",
        "<strong>Population growth.</strong> Tampa has been one of the fastest-growing metros in the US. Migration from high-tax states drives sustained demand.",
        "<strong>STR is allowed.</strong> Tampa allows STR with state and local registration. Many DSCR lenders actively pursue Tampa STR.",
        "<strong>Property tax reassessment.</strong> FL reassesses property tax on sale. Expect a 50-100% tax bill increase in year one.",
    ],
))


# ============================================================
# ORLANDO, FL
# ============================================================
register(CITIES, city_page(
    slug="orlando", name="Orlando", state="Florida", state_slug="florida",
    intro="Orlando is the STR capital of the Southeast. Theme park tourism, no state income tax, and a deep rental pool. The most active STR DSCR market in FL.",
    market_facts={
        "price": "$350K-$475K",
        "rent": "$1,800-$2,300 (long-term) / $3,000+ (STR)",
        "ratio": "0.50-0.55% (long-term) / higher (STR)",
        "vacancy": "5-8%",
        "dom": "22-32 days",
        "pop_growth": "+14.5%",
        "str": "Active STR market; state + local license required",
        "ptax": "0.8-1.5%",
    },
    neighborhoods=["Lake Nona", "Dr. Phillips", "Winter Park", "Kissimmee", "Celebration", "Davenport", "Clermont"],
    notes_paragraphs=[
        "<strong>STR dominance.</strong> Orlando is heavily STR. Theme park proximity drives consistent year-round occupancy. Most DSCR lenders accept Orlando STR with AirDNA documentation.",
        "<strong>STR licensing.</strong> Florida DBPR license required + local registration. Some cities have STR caps.",
        "<strong>Hurricane insurance.</strong> Standard FL considerations. Wind coverage required.",
        "<strong>Property tax reassessment.</strong> FL reassesses on sale. Plan for 50-100% tax bill increase in year one.",
    ],
))


# ============================================================
# NASHVILLE, TN
# ============================================================
register(CITIES, city_page(
    slug="nashville", name="Nashville", state="Tennessee", state_slug="tennessee",
    intro="Nashville is the strongest Tennessee DSCR market. Music, healthcare, and tech drive population growth. No state income tax and landlord-friendly law make Nashville a top-tier investment city.",
    market_facts={
        "price": "$400K-$525K",
        "rent": "$1,900-$2,400",
        "ratio": "0.48-0.55%",
        "vacancy": "6-9%",
        "dom": "22-32 days",
        "pop_growth": "+9.5%",
        "str": "Allowed with STR permit",
        "ptax": "0.5-0.9%",
    },
    neighborhoods=["East Nashville", "Germantown", "The Gulch", "Berry Hill", "Antioch", "Hendersonville", "Murfreesboro", "Franklin"],
    notes_paragraphs=[
        "<strong>Population growth.</strong> Nashville's growth has slowed from its 2021-2022 peak but remains strong. Migration from California, New York, and Illinois drives demand.",
        "<strong>Property tax.</strong> Tennessee property taxes are low (0.5-0.9%). Among the most favorable in the US for landlords.",
        "<strong>STR permit.</strong> Nashville requires an STR permit. Verify before quoting STR DSCR.",
        "<strong>Music industry sensitivity.</strong> Nashville's rental demand is sensitive to the music and tourism economy. Healthcare and tech provide diversification.",
    ],
))


# ============================================================
# PHOENIX, AZ
# ============================================================
register(CITIES, city_page(
    slug="phoenix", name="Phoenix", state="Arizona", state_slug="arizona",
    intro="Phoenix is one of the strongest DSCR markets in the Southwest. Population growth from California migration, no state income tax, and a deep rental pool. Scottsdale luxury and Phoenix mid-tier both work.",
    market_facts={
        "price": "$375K-$525K",
        "rent": "$1,700-$2,300",
        "ratio": "0.45-0.55%",
        "vacancy": "6-10%",
        "dom": "20-30 days",
        "pop_growth": "+9.5%",
        "str": "Active STR; state license required",
        "ptax": "0.6-0.9%",
    },
    neighborhoods=["Scottsdale", "Arcadia", "Ahwatukee", "Tempe", "Mesa", "Gilbert", "Chandler", "Glendale"],
    notes_paragraphs=[
        "<strong>California migration.</strong> Phoenix has been one of the largest beneficiaries of California migration. Sustained population growth drives rental demand.",
        "<strong>Summer vacancy.</strong> Phoenix summers are brutally hot. Some sub-markets see 30-40% occupancy drop June-August. Most DSCR lenders require 6-9 months reserves.",
        "<strong>Scottsdale STR.</strong> Scottsdale is one of the top STR markets in the Southwest. Spring training, Old Town events, and desert tourism drive strong year-round occupancy.",
        "<strong>Property tax.</strong> Arizona property taxes are low (0.6-0.9%). Among the most favorable in the US.",
    ],
))


# ============================================================
# DENVER, CO
# ============================================================
register(CITIES, city_page(
    slug="denver", name="Denver", state="Colorado", state_slug="colorado",
    intro="Denver is the dominant Colorado DSCR market. Mountain lifestyle, tech employment, and population growth drive consistent rental fundamentals. Higher acquisition cost but strong rent support.",
    market_facts={
        "price": "$475K-$625K",
        "rent": "$2,000-$2,700",
        "ratio": "0.42-0.50%",
        "vacancy": "6-9%",
        "dom": "25-35 days",
        "pop_growth": "+7.5%",
        "str": "Generally allowed; varies by city",
        "ptax": "0.5-0.8%",
    },
    neighborhoods=["LoHi", "RiNo", "Cherry Creek", "Wash Park", "Aurora", "Lakewood", "Arvada", "Boulder"],
    notes_paragraphs=[
        "<strong>Acquisition cost.</strong> Denver prices are high (median $475K-$625K). DSCR loan amounts are correspondingly higher.",
        "<strong>Job market.</strong> Denver's tech and aerospace employment base supports consistent demand. Sensitive to remote-work trends.",
        "<strong>Mountain STR alternative.</strong> Some Denver investors pivot to mountain STR (Breckenridge, Vail) for higher revenue. Different matrix — see condotel and STR program guides.",
        "<strong>Property tax.</strong> Colorado property taxes are relatively low (0.5-0.8%). Reassessments can be aggressive.",
    ],
))


# ============================================================
# SACRAMENTO, CA
# ============================================================
register(CITIES, city_page(
    slug="sacramento", name="Sacramento", state="California", state_slug="california",
    intro="Sacramento is the entry point for CA DSCR investors. Lower acquisition cost than Bay Area or LA, with comparable rent-to-price ratios. State government employment provides stability.",
    market_facts={
        "price": "$475K-$600K",
        "rent": "$2,200-$2,800",
        "ratio": "0.50-0.55%",
        "vacancy": "5-7%",
        "dom": "15-22 days",
        "pop_growth": "+8.0%",
        "str": "Varies by city; many ban STR",
        "ptax": "0.8-1.2%",
    },
    neighborhoods=["Midtown", "East Sacramento", "Land Park", "Roseville", "Folsom", "Elk Grove", "Natomas"],
    notes_paragraphs=[
        "<strong>Bay Area spillover.</strong> Sacramento absorbs Bay Area spillover. Strong in-migration drives consistent demand.",
        "<strong>Affordability.</strong> Sacramento is among the more affordable CA metros for DSCR investors. Lower entry cost with similar rent-to-price to coastal markets.",
        "<strong>STR restrictions.</strong> Sacramento and many surrounding cities restrict or ban STR. Verify before quoting STR DSCR.",
        "<strong>State employment.</strong> Sacramento's state government employment base provides recession resilience.",
    ],
))


# ============================================================
# BROOKLYN, NY
# ============================================================
register(CITIES, city_page(
    slug="brooklyn", name="Brooklyn", state="New York", state_slug="new-york",
    intro="Brooklyn is the dominant NYC DSCR market. Strong rents, deep tenant pool, and diverse sub-markets from luxury (DUMBO, Williamsburg) to value (East New York, Canarsie). NYC-specific underwriting considerations apply.",
    market_facts={
        "price": "$700K-$1.2M",
        "rent": "$2,800-$4,500",
        "ratio": "0.40-0.50%",
        "vacancy": "4-6%",
        "dom": "30-60 days",
        "pop_growth": "+2.0%",
        "str": "STR under 30 days illegal in most of NYC",
        "ptax": "0.5-1.5% (varies by class)",
    },
    neighborhoods=["Williamsburg", "Bushwick", "Bed-Stuy", "Crown Heights", "East New York", "Flatbush", "Bay Ridge"],
    notes_paragraphs=[
        "<strong>Rent stabilization.</strong> Pre-2019 buildings with stabilized tenants have rent caps that often make DSCR infeasible. Verify the unit is free-market before quoting.",
        "<strong>NYC STR ban.</strong> Short-term rentals under 30 days are illegal in most of NYC. Long-term rental only for DSCR.",
        "<strong>NYC property taxes.</strong> High and complex (Class 1, 2, 3, 4 with different rates). Some buildings have abatements.",
        "<strong>Eviction timelines.</strong> NYC evictions run 6-12 months — much slower than TX or FL. Consider this in your property management plan.",
    ],
))


# ============================================================
# CLEVELAND, OH
# ============================================================
register(CITIES, city_page(
    slug="cleveland", name="Cleveland", state="Ohio", state_slug="ohio",
    intro="Cleveland is one of the strongest cash-on-cash DSCR markets in the country. Low acquisition cost ($150K-$250K), strong rent-to-price ratios, and stable tenancy. The workhorse of Midwest DSCR.",
    market_facts={
        "price": "$150K-$250K",
        "rent": "$1,200-$1,600",
        "ratio": "0.65-0.80%",
        "vacancy": "6-9%",
        "dom": "30-45 days",
        "pop_growth": "-2.0%",
        "str": "Generally allowed; limited market",
        "ptax": "1.5-2.5%",
    },
    neighborhoods=["Ohio City", "Tremont", "Detroit-Shoreway", "Cleveland Heights", "Lakewood", "Parma"],
    notes_paragraphs=[
        "<strong>Cash-on-cash.</strong> Cleveland produces some of the strongest cash-on-cash returns in the US. A $200K duplex rents for $1,400-$1,800.",
        "<strong>Population decline.</strong> Cleveland's population has been declining for decades. Some sub-markets are softer than others; pick neighborhoods carefully.",
        "<strong>Property tax.</strong> Ohio property taxes run 1.5-2.5% — among the highest in the US. Verify tax status at closing (some properties have delinquent taxes).",
        "<strong>Limited STR.</strong> Cleveland is mostly long-term rental. STR demand is limited.",
    ],
))


# ============================================================
# MEMPHIS, TN
# ============================================================
register(CITIES, city_page(
    slug="memphis", name="Memphis", state="Tennessee", state_slug="tennessee",
    intro="Memphis offers the highest cash-on-cash returns in TN. Low acquisition cost, strong rent-to-price ratios, and landlord-friendly law. Less appreciation potential than Nashville.",
    market_facts={
        "price": "$175K-$275K",
        "rent": "$1,300-$1,700",
        "ratio": "0.65-0.75%",
        "vacancy": "7-10%",
        "dom": "30-45 days",
        "pop_growth": "-1.5%",
        "str": "Generally allowed; limited market",
        "ptax": "0.5-0.9%",
    },
    neighborhoods=["Midtown", "Cooper-Young", "Germantown", "Bartlett", "Collierville", "Cordova"],
    notes_paragraphs=[
        "<strong>Cash-on-cash.</strong> Memphis produces some of the strongest cash-on-cash returns in the US. A $200K SFR rents for $1,400-$1,700.",
        "<strong>Appreciation.</strong> Memphis appreciation lags Nashville. The trade-off is lower entry cost and higher yield.",
        "<strong>Landlord-friendly.</strong> Tennessee is one of the most landlord-friendly states. Eviction timelines are 3-4 weeks.",
        "<strong>Sub-market selection.</strong> Memphis has wide sub-market variation. Midtown and East Memphis are strong; some south Memphis ZIPs are softer.",
    ],
))


# ============================================================
# JACKSONVILLE, FL
# ============================================================
register(CITIES, city_page(
    slug="jacksonville", name="Jacksonville", state="Florida", state_slug="florida",
    intro="Jacksonville is the largest FL metro by area and a growing DSCR market. Lower acquisition cost than Miami or Tampa, with comparable rent-to-price. Military and port-driven economy.",
    market_facts={
        "price": "$325K-$450K",
        "rent": "$1,700-$2,200",
        "ratio": "0.50-0.55%",
        "vacancy": "7-10%",
        "dom": "25-35 days",
        "pop_growth": "+8.5%",
        "str": "Allowed; mostly long-term rental",
        "ptax": "0.8-1.4%",
    },
    neighborhoods=["Riverside", "San Marco", "Beaches", "Mandarin", "Orange Park", "Nocatee"],
    notes_paragraphs=[
        "<strong>Affordability.</strong> Jacksonville is among the more affordable FL metros for DSCR. Lower entry cost than Miami or Tampa.",
        "<strong>Military stability.</strong> Jacksonville's military presence (Naval Station Mayport, NAS Jacksonville) provides employment stability.",
        "<strong>Hurricane exposure.</strong> Standard FL hurricane considerations. Wind coverage required.",
        "<strong>Limited STR.</strong> Jacksonville is mostly long-term rental. STR demand is concentrated in the Beaches sub-market.",
    ],
))


# ============================================================
# RALEIGH, NC
# ============================================================
register(CITIES, city_page(
    slug="raleigh", name="Raleigh", state="North Carolina", state_slug="north-carolina",
    intro="Raleigh is one of the strongest DSCR markets in the Southeast. Research Triangle (Raleigh-Durham-Chapel Hill) drives consistent population and job growth. Tech and biotech employment.",
    market_facts={
        "price": "$400K-$550K",
        "rent": "$1,800-$2,400",
        "ratio": "0.45-0.52%",
        "vacancy": "5-8%",
        "dom": "20-30 days",
        "pop_growth": "+12.5%",
        "str": "Generally allowed; varies by city",
        "ptax": "0.7-1.0%",
    },
    neighborhoods=["Downtown Raleigh", "Cameron Village", "North Hills", "Cary", "Apex", "Durham", "Chapel Hill"],
    notes_paragraphs=[
        "<strong>Research Triangle.</strong> The Raleigh-Durham-Chapel Hill metro is anchored by Research Triangle Park. Tech, biotech, and pharma drive consistent job growth.",
        "<strong>Population growth.</strong> One of the fastest-growing metros in the Southeast. In-migration from Northeast and California.",
        "<strong>Property tax.</strong> North Carolina property taxes are moderate (0.7-1.0%). Reassessments are infrequent.",
        "<strong>Landlord-friendly.</strong> NC eviction timelines are 4-6 weeks. No rent control.",
    ],
))


# ============================================================
# SALT LAKE CITY, UT
# =========================================================###
register(CITIES, city_page(
    slug="salt-lake-city", name="Salt Lake City", state="Utah", state_slug="utah",
    intro="Salt Lake City is one of the strongest DSCR markets in the Mountain West. Tech employment (Silicon Slopes), outdoor lifestyle, and consistent population growth.",
    market_facts={
        "price": "$450K-$600K",
        "rent": "$1,800-$2,500",
        "ratio": "0.42-0.50%",
        "vacancy": "5-7%",
        "dom": "22-32 days",
        "pop_growth": "+10.5%",
        "str": "Generally allowed; STR permit in some areas",
        "ptax": "0.5-0.7%",
    },
    neighborhoods=["Sugar House", "The Avenues", "Millcreek", "Murray", "Sandy", "Draper", "Lehi", "Provo"],
    notes_paragraphs=[
        "<strong>Silicon Slopes.</strong> The Salt Lake City-Provo corridor is anchored by tech (Adobe, Qualtrics, etc.). Strong job market drives consistent rental demand.",
        "<strong>Population growth.</strong> One of the fastest-growing metros in the Mountain West. In-migration from California.",
        "<strong>Property tax.</strong> Utah property taxes are low (0.5-0.7%). Among the most favorable in the US.",
        "<strong>Landlord-friendly.</strong> Utah is landlord-friendly. Eviction timelines are 3-5 weeks.",
    ],
))


# ============================================================
# LAS VEGAS, NV
# =========================================================###
register(CITIES, city_page(
    slug="las-vegas", name="Las Vegas", state="Nevada", state_slug="nevada",
    intro="Las Vegas is the dominant STR market in the desert Southwest. Tourism drives year-round occupancy, no state income tax, and a deep rental pool. Both long-term and STR work.",
    market_facts={
        "price": "$375K-$525K",
        "rent": "$1,800-$2,400",
        "ratio": "0.45-0.55%",
        "vacancy": "6-9%",
        "dom": "20-30 days",
        "pop_growth": "+9.5%",
        "str": "Active STR market; STR permit required",
        "ptax": "0.6-0.9%",
    },
    neighborhoods=["Summerlin", "Henderson", "Spring Valley", "North Las Vegas", "Paradise", "The Strip corridor"],
    notes_paragraphs=[
        "<strong>STR dominance.</strong> Las Vegas is one of the top STR markets in the US. Tourism drives year-round occupancy. Most DSCR lenders actively pursue Vegas STR.",
        "<strong>No state income tax.</strong> Nevada has no state income tax. Strong attraction for high-income investors.",
        "<strong>STR licensing.</strong> Las Vegas requires an STR permit. Verify before quoting STR DSCR.",
        "<strong>Property tax.</strong> Nevada property taxes are low (0.6-0.9%). Caps limit year-over-year increases.",
    ],
))


if __name__ == "__main__":
    print(f"Loaded {len(CITIES)} city pages")
