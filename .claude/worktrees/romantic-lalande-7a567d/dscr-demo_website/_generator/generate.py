#!/usr/bin/env python3
r"""
Greenstreet Finance — Master Page Generator
Imports all content modules and writes pages to public/.
Run from: dscr-website/_generator/
"""
import sys
from pathlib import Path

GEN_DIR = Path(__file__).parent
sys.path.insert(0, str(GEN_DIR))

from page_builder import (
    build_page, write_page, FOOTER, PROGRAMS, STATES, CITIES, COMPARE, RESOURCES,
    PUB, cta_block,
)
from content_programs import PROGRAMS as _P
from content_states import STATES as _S
from content_cities import CITIES as _C
from content_compare import COMPARE as _X
from content_resources import RESOURCES as _R

# Force-override the list references in page_builder (mutated via .register())
# The import-side-effect registration populates these.

# ============================================================
# INDEX PAGES (one per category — links to all pages)
# ============================================================
def category_index_page(category_label, description, items, base_url):
    """Items: list of (slug, title, description)"""
    cards = ""
    for slug, title, desc in items:
        cards += f"""
        <a href="{base_url}/{slug}.html" class="blog-card" style="text-decoration:none;color:inherit">
          <div class="blog-card-content" style="padding:2rem 1.5rem;min-height:200px">
            <div class="blog-card-title">{title}</div>
            <div class="blog-card-text" style="margin-top:0.5rem">{desc}</div>
            <div class="blog-card-link">Read →</div>
          </div>
        </a>"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{category_label} | Greenstreet Finance</title>
<meta name="description" content="{description}"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"/>
<link rel="stylesheet" href="/css/main.css"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
</head>
<body>
<div class="page_wrap">
  <div class="announcement">
    <div class="announcement_content">
      <span class="announcement_dot"></span>
      <span>Now live: Dual-Track DSCR with AirDNA STR integration · <a href="/#how">See what's new →</a></span>
    </div>
  </div>
  <nav class="nav_wrap is-desktop">
    <div class="nav_contain u-container">
      <div class="nav_layout">
        <a href="/" class="nav_logo w-inline-block">
          <div class="nav_logo_svg">
            <svg width="220" height="28" viewBox="0 0 220 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <text x="0" y="22" font-family="Outfit, sans-serif" font-size="22" font-weight="700" letter-spacing="-0.6">Greenstreet<tspan font-weight="400" dx="5">Finance</tspan></text>
            </svg>
          </div>
        </a>
        <div class="nav_links_wrap">
          <a href="/programs" class="nav-link"><div>Programs</div></a>
          <a href="/compare" class="nav-link"><div>Compare Lenders</div></a>
          <a href="/states" class="nav-link"><div>States</div></a>
          <a href="/resources/glossary.html" class="nav-link"><div>Glossary</div></a>
          <a href="/#book-demo" class="nav-link is-underline"><div>Book a demo</div></a>
        </div>
      </div>
    </div>
  </nav>
  <main class="page_main">
    <section class="hero_wrap">
      <div class="hero_contain u-container">
        <div class="hero_layout is-height-large u-theme-dark">
          <div class="hero_content is-home">
            <div class="u-text-style-h5 u-mb-2" style="color:var(--swatch--pistachio)">GREENSTREET · {category_label.upper()}</div>
            <h1 class="u-text-style-h1 u-mb-6">{category_label}</h1>
            <div class="hero-headline u-text-style-h3">{description}</div>
          </div>
        </div>
      </div>
    </section>
    <section class="feature_wrap">
      <div class="feature_contain u-container">
        <div class="card">
          <h2 class="u-text-style-h2 u-mb-7">All {category_label}</h2>
          <div class="blog_list u-grid-column-3">{cards}</div>
        </div>
      </div>
    </section>
  </main>
  <footer class="footer_wrap">
    <div class="footer_contain u-container">
      <a href="/" class="footer_logo_wrap">
        <div class="footer_logo">
          <svg width="220" height="28" viewBox="0 0 220 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <text x="0" y="22" font-family="Outfit, sans-serif" font-size="22" font-weight="700" letter-spacing="-0.6">Greenstreet<tspan font-weight="400" dx="5">Finance</tspan></text>
          </svg>
        </div>
      </a>
    </div>
    <div class="footer_bottom_wrap">
      <div class="footer_bottom_contain u-container">
        <div class="footer_bottom_text">© 2026 Greenstreet Finance. All rights reserved.</div>
        <div class="footer_bottom_list">
          <a href="/" class="footer_bottom_link_wrap"><div class="footer_bottom_link_text u-text-style-small">Home</div></a>
        </div>
      </div>
    </div>
  </footer>
</div>
</body>
</html>"""


# ============================================================
# MAIN
# ============================================================
def main():
    PUB.mkdir(parents=True, exist_ok=True)
    print(f"Public dir: {PUB}")

    # Build footer links once
    program_links = "\n".join(
        f'<a href="/programs/{p["slug"]}.html" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">{p["title"].split(" — ")[0]}</div></a>'
        for p in PROGRAMS[:6]
    )
    state_links = "\n".join(
        f'<a href="/states/{s["slug"]}.html" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">{s["title"].split(" — ")[0].replace("DSCR Loans in ","")}</div></a>'
        for s in STATES[:6]
    )
    compare_links = "\n".join(
        f'<a href="/compare/{c["slug"]}.html" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">{c["title"].split(" vs ")[1].split(" — ")[0]}</div></a>'
        for c in COMPARE[:6]
    )
    footer_links = {
        "footer_program_links": program_links,
        "footer_state_links": state_links,
        "footer_compare_links": compare_links,
    }

    # Generate individual pages
    counts = {"programs": 0, "states": 0, "cities": 0, "compare": 0, "resources": 0, "indexes": 0}

    for p in PROGRAMS:
        html = build_page(p, footer_links)
        out = PUB / "programs" / f"{p['slug']}.html"
        write_page(out, html)
        counts["programs"] += 1
        print(f"  ✓ /programs/{p['slug']}.html")

    for s in STATES:
        html = build_page(s, footer_links)
        out = PUB / "states" / f"{s['slug']}.html"
        write_page(out, html)
        counts["states"] += 1
        print(f"  ✓ /states/{s['slug']}.html")

    for c in CITIES:
        html = build_page(c, footer_links)
        out = PUB / "cities" / f"{c['slug']}.html"
        write_page(out, html)
        counts["cities"] += 1
        print(f"  ✓ /cities/{c['slug']}.html")

    for c in COMPARE:
        html = build_page(c, footer_links)
        out = PUB / "compare" / f"{c['slug']}.html"
        write_page(out, html)
        counts["compare"] += 1
        print(f"  ✓ /compare/{c['slug']}.html")

    for r in RESOURCES:
        html = build_page(r, footer_links)
        out = PUB / "resources" / f"{r['slug']}.html"
        write_page(out, html)
        counts["resources"] += 1
        print(f"  ✓ /resources/{r['slug']}.html")

    # Generate category index pages
    prog_items = [(p["slug"], p["title"].split(" — ")[0], "") for p in PROGRAMS]
    write_page(PUB / "programs" / "index.html", category_index_page(
        "Programs", "Greenstreet's full library of DSCR program guides — every specialty, every borrower type, every property class.",
        prog_items, "/programs"
    ))
    counts["indexes"] += 1

    state_items = [(s["slug"], s["title"].split(" — ")[0].replace("DSCR Loans in ", ""), "") for s in STATES]
    write_page(PUB / "states" / "index.html", category_index_page(
        "States", "State-by-state DSCR investor guides. Market fundamentals, top metros, lender universe, and state-specific underwriting considerations.",
        state_items, "/states"
    ))
    counts["indexes"] += 1

    city_items = [(c["slug"], c["title"].split(" — ")[0].replace("DSCR Loans in ", ""), "") for c in CITIES]
    write_page(PUB / "cities" / "index.html", category_index_page(
        "Cities", "Top metros by DSCR investor activity. Market fundamentals, sub-markets, and city-specific underwriting.",
        city_items, "/cities"
    ))
    counts["indexes"] += 1

    cmp_items = [(c["slug"], c["title"].split(" vs ")[1].split(" — ")[0], "Head-to-head DSCR comparison") for c in COMPARE]
    write_page(PUB / "compare" / "index.html", category_index_page(
        "Compare Lenders", "Side-by-side DSCR lender comparisons. Rates, LTV, FICO, strengths, weaknesses, and when to route to each.",
        cmp_items, "/compare"
    ))
    counts["indexes"] += 1

    res_items = [(r["slug"], r["title"].split(" — ")[0], "") for r in RESOURCES]
    write_page(PUB / "resources" / "index.html", category_index_page(
        "Resources", "Greenstreet's DSCR resource library — glossary, rate sheet, FAQ, calculator, and specialty guides.",
        res_items, "/resources"
    ))
    counts["indexes"] += 1

    # Totals
    total = sum(counts.values())
    print(f"\n========== GENERATION COMPLETE ==========")
    print(f"Programs:   {counts['programs']:3d}")
    print(f"States:     {counts['states']:3d}")
    print(f"Cities:     {counts['cities']:3d}")
    print(f"Compare:    {counts['compare']:3d}")
    print(f"Resources:  {counts['resources']:3d}")
    print(f"Index pg:   {counts['indexes']:3d}")
    print(f"TOTAL:      {total:3d} pages")


if __name__ == "__main__":
    main()
