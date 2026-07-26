#!/usr/bin/env python3
"""
Greenstreet Finance — Content Page Generator
Generates all /programs/, /states/, /cities/, /compare/, /resources/ pages
from structured data + a shared HTML template. Uses existing design system.
"""
from pathlib import Path
import json
import re
import html as html_lib

ROOT = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\dscr-website")
PUB = ROOT / "public"

# ============================================================
# SHARED TEMPLATE COMPONENTS
# ============================================================

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{title} | Greenstreet Finance</title>
<meta name="description" content="{meta_description}"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"/>
<link rel="stylesheet" href="/css/main.css"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
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
  <main class="page_main">"""

FOOTER = """  </main>
  <footer class="footer_wrap">
    <div class="footer_contain u-container">
      <a href="/" class="footer_logo_wrap">
        <div class="footer_logo">
          <svg width="220" height="28" viewBox="0 0 220 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <text x="0" y="22" font-family="Outfit, sans-serif" font-size="22" font-weight="700" letter-spacing="-0.6">Greenstreet<tspan font-weight="400" dx="5">Finance</tspan></text>
          </svg>
        </div>
      </a>
      <nav class="footer_layout u-grid-autofit">
        <section class="footer_group_wrap">
          <h3 class="footer_group_title u-text-style-h4 u-mb-2">Programs</h3>
          <div class="footer_group_list">
            {footer_program_links}
          </div>
        </section>
        <section class="footer_group_wrap">
          <h3 class="footer_group_title u-text-style-h4 u-mb-2">Top States</h3>
          <div class="footer_group_list">
            {footer_state_links}
          </div>
        </section>
        <section class="footer_group_wrap">
          <h3 class="footer_group_title u-text-style-h4 u-mb-2">Compare Lenders</h3>
          <div class="footer_group_list">
            {footer_compare_links}
          </div>
        </section>
        <section class="footer_group_wrap">
          <h3 class="footer_group_title u-text-style-h4 u-mb-2">Resources</h3>
          <div class="footer_group_list">
            <a href="/resources/glossary.html" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">DSCR Glossary</div></a>
            <a href="/resources/rate-sheet.html" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">Rate Sheet</div></a>
            <a href="/resources/calculator.html" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">DSCR Calculator</div></a>
            <a href="/resources/faq.html" class="footer_link_wrap"><div class="footer_link_text u-weight-bold">FAQ</div></a>
          </div>
        </section>
      </nav>
    </div>
    <div class="footer_bottom_wrap">
      <div class="footer-disclamer u-container">
        <div class="u-rich-text disclamer-rt">
          <p><strong>Greenstreet Finance</strong> is an AI-native DSCR &amp; non-QM wholesale intelligence platform. We are not a lender. All lender data, rates, and program terms shown are illustrative based on publicly disclosed program matrices and may not reflect current offerings. Verify directly with the lender before quoting. NMLS licensing varies by state; brokers and lenders should confirm their own licensing status.</p>
        </div>
      </div>
      <div class="footer_bottom_contain u-container">
        <div class="footer_bottom_text">© 2026 Greenstreet Finance. All rights reserved.</div>
        <div class="footer_bottom_list">
          <a href="/" class="footer_bottom_link_wrap"><div class="footer_bottom_link_text u-text-style-small">Privacy</div></a>
          <a href="/" class="footer_bottom_link_wrap"><div class="footer_bottom_link_text u-text-style-small">Terms</div></a>
          <a href="/" class="footer_bottom_link_wrap"><div class="footer_bottom_link_text u-text-style-small">SOC 2</div></a>
        </div>
      </div>
    </div>
  </footer>
</div>
<script src="/js/main.js" defer></script>
</body>
</html>"""


# ============================================================
# HERO BLOCK (page-specific title + intro)
# ============================================================
def hero_block(eyebrow, title, intro, theme="dark", kicker=None):
    theme_class = "u-theme-dark" if theme == "dark" else "u-theme-light"
    kicker_html = f'<div class="u-text-style-h5 u-mb-2" style="color:var(--swatch--pistachio)">{kicker}</div>' if kicker else ""
    return f"""
    <section class="hero_wrap">
      <div class="hero_contain u-container">
        <div class="hero_layout is-height-large {theme_class}">
          <div class="hero_content is-home">
            {kicker_html}
            <h1 class="u-text-style-h1 u-mb-6">{title}</h1>
            <div class="hero-headline u-text-style-h3">
              {intro}
            </div>
          </div>
        </div>
      </div>
    </section>"""


# ============================================================
# QUICK-FACT BOX (sidebar-style stat cards)
# ============================================================
def stats_block(title, stats):
    cards = "".join(
        f'<div class="home-stats-card {s.get("color","mint")}">'
        f'<div class="home-stats-txt"><p>{s["label"]}</p></div>'
        f'<div class="u-text-style-h1">{s["value"]}</div></div>'
        for s in stats
    )
    return f"""
    <section class="testimonial_wrap">
      <div class="testimonial_layout u-container">
        <div class="home-logos-top">
          <h2 class="u-text-style-h2 u-mb-2">{title}</h2>
        </div>
        <div class="swipers-grid">{cards}</div>
      </div>
    </section>"""


# ============================================================
# BODY CONTENT (long-form sections)
# ============================================================
def section_dark(eyebrow, title, body_html):
    return f"""
    <section class="step_height">
      <div class="step_wrap u-container">
        <div class="step_layout">
          <div class="step_content_top">
            <div class="u-text-style-h5 u-mb-2">{eyebrow}</div>
            <h2 class="u-text-style-h2 u-mb-6">{title}</h2>
            <div class="u-text-style-large" style="color:rgba(255,255,255,0.78);max-width:760px;line-height:1.55">
              {body_html}
            </div>
          </div>
        </div>
      </div>
    </section>"""


def section_light(eyebrow, title, body_html):
    return f"""
    <section class="solution_wrap">
      <div class="solution_contain u-container">
        <div class="solutions-layout">
          <div class="solution_content">
            <div class="u-text-style-h5 u-mb-2">{eyebrow}</div>
            <h2 class="u-text-style-h2 u-mb-6">{title}</h2>
            <div class="u-text-style-large" style="max-width:560px;line-height:1.55">{body_html}</div>
          </div>
        </div>
      </div>
    </section>"""


def section_white(title, body_html, eyebrow=None):
    eb = f'<div class="u-text-style-h5 u-mb-2" style="color:var(--swatch--emerald)">{eyebrow}</div>' if eyebrow else ""
    return f"""
    <section class="value_wrap">
      <div class="value_layout u-container">
        <div class="value_heading_wrap">
          {eb}
          <h2 class="u-text-style-h2 u-mb-6">{title}</h2>
        </div>
        <div class="u-text-style-large" style="line-height:1.55;max-width:760px">{body_html}</div>
      </div>
    </section>"""


def section_table(title, intro, headers, rows, eyebrow=None):
    eb = f'<div class="u-text-style-h5 u-mb-2" style="color:var(--swatch--emerald)">{eyebrow}</div>' if eyebrow else ""
    head_html = "".join(f'<th style="text-align:left;padding:0.75rem 1rem;font-weight:500;color:var(--swatch--emerald);border-bottom:1px solid rgba(0,59,56,0.15)">{h}</th>' for h in headers)
    body_rows = ""
    for r in rows:
        body_rows += "<tr>" + "".join(f'<td style="padding:0.85rem 1rem;border-bottom:1px solid rgba(0,59,56,0.08)">{c}</td>' for c in r) + "</tr>"
    return f"""
    <section class="feature_wrap">
      <div class="feature_contain u-container">
        <div class="card">
          {eb}
          <h2 class="u-text-style-h2 u-mb-2">{title}</h2>
          <p class="u-text-style-large" style="max-width:760px;margin-bottom:1.5rem">{intro}</p>
          <div style="overflow-x:auto;background:var(--swatch--white);border-radius:var(--radius-lg);border:1px solid rgba(0,0,0,0.05)">
            <table style="width:100%;border-collapse:collapse;font-size:0.95rem">
              <thead><tr>{head_html}</tr></thead>
              <tbody>{body_rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </section>"""


def section_callout(eyebrow, title, body_html):
    return f"""
    <section class="step_height">
      <div class="step_wrap u-container">
        <div class="step_layout">
          <div class="step-card" style="display:block">
            <div class="step-card-content">
              <div class="step-card-eyebrow">{eyebrow}</div>
              <h2 class="step-card-title">{title}</h2>
              <div class="step-card-desc">{body_html}</div>
            </div>
          </div>
        </div>
      </div>
    </section>"""


# ============================================================
# RELATED LINKS BLOCK (cross-linking)
# ============================================================
def related_block(heading, items):
    """items: list of (label, href, eyebrow)"""
    cards = ""
    for i, (label, href, eyebrow) in enumerate(items, 1):
        colors = ["mint", "light-green", "emerald"]
        c = colors[(i - 1) % 3]
        cards += f"""
        <a href="{href}" class="blog-card" style="text-decoration:none;color:inherit">
          <div class="blog-card-content" style="padding:2rem 1.5rem">
            <div class="blog-card-eyebrow">{eyebrow}</div>
            <div class="blog-card-title">{label}</div>
            <div class="blog-card-link">Read more →</div>
          </div>
        </a>"""
    return f"""
    <section class="feature_wrap">
      <div class="feature_contain u-container">
        <div class="card">
          <h2 class="u-text-style-h2 u-mb-7">{heading}</h2>
          <div class="blog_list u-grid-column-3">{cards}</div>
        </div>
      </div>
    </section>"""


# ============================================================
# CTA BLOCK (bottom)
# ============================================================
def cta_block():
    return """
    <section class="cta_wrap" id="book-demo">
      <div class="cta_contain u-container">
        <div class="cta_card_list u-grid-column-2">
          <a href="/#book-demo" class="cta_card u-vflex-stretch-between u-theme-brand">
            <div class="cta_content">
              <div class="cta_content_paragraph">
                <div class="cta_icon_wrap">
                  <svg width="32" height="32" viewBox="0 0 25 25" fill="none"><path d="M12.9 12.7c1.65 0 2.99-1.34 2.99-2.99S14.55 6.74 12.9 6.74 9.91 8.08 9.91 9.74s1.34 2.99 2.99 2.99Z" stroke="currentColor" stroke-width="2"/><path d="M7.65 16.9c.27-1.19.94-2.25 1.9-3.01.95-.76 2.13-1.18 3.35-1.18s2.4.42 3.36 1.18c.95.76 1.62 1.82 1.89 3.01" stroke="currentColor" stroke-width="2"/><rect x="3.17" y="3.5" width="19.46" height="13.61" stroke="currentColor" stroke-width="2"/><line x1="8.84" y1="20.76" x2="16.97" y2="20.76" stroke="currentColor" stroke-width="2"/></svg>
                </div>
                <div class="u-text-style-h4 is-lineheight-1">See the lender matrix, dual-track DSCR, and AirDNA STR gate in 15 minutes</div>
              </div>
              <div class="cta-btn-flex">
                <h2 class="u-text-style-h2">Book a Live Demo</h2>
                <div class="u-btn-group u-align-self-end">
                  <div class="btn_main_wrap btn_tertiary"><span class="btn_main_text">Book now</span><span class="btn_main_icon"><svg width="16" height="16" viewBox="0 0 24 25" fill="none"><path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"/></svg></span></div>
                </div>
              </div>
            </div>
          </a>
          <a href="/#contact" class="cta_card u-vflex-stretch-between u-theme-brand-secondary">
            <div class="cta_content u-grid-column-2">
              <div class="cta_content_paragraph">
                <div class="cta_icon_wrap">
                  <svg width="32" height="32" viewBox="0 0 25 25" fill="none"><path d="M9.21 12.19c.76 1.58 2.04 2.85 3.62 3.61.12.06.25.08.38.07.13-.01.25-.05.36-.12l2.32-1.55c.1-.07.22-.11.35-.13.12-.01.25.01.36.05l4.35 1.87c.15.06.27.17.35.31.08.14.09.3.07.46-.14 1.08-.66 2.06-1.48 2.78-.81.72-1.86 1.11-2.94 1.11-3.35 0-6.56-1.33-8.93-3.7C5.66 14.59 4.33 11.38 4.33 8.03c0-1.08.4-2.13 1.11-2.94.72-.81 1.71-1.34 2.78-1.48.16-.02.32.01.46.09.14.08.25.21.31.36l1.87 4.36c.05.11.07.23.06.36-.01.12-.06.24-.13.34l-1.55 2.36c-.07.11-.11.23-.12.36-.01.13.02.25.06.36Z" stroke="currentColor" stroke-width="2"/></svg>
                </div>
                <div class="u-text-style-h4 is-lineheight-1">Get a current rate quote for any deal — DSCR, STR, ITIN, FN, portfolio</div>
              </div>
              <div class="cta-btn-flex">
                <h2 class="u-text-style-h2">+1 (332) 455-1462</h2>
                <div class="u-btn-group u-align-self-end">
                  <div class="btn_main_wrap btn_tertiary"><span class="btn_main_text">Call</span><span class="btn_main_icon"><svg width="16" height="16" viewBox="0 0 24 25" fill="none"><path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"/></svg></span></div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>"""


# ============================================================
# PAGE BUILDER
# ============================================================
def build_page(page_data, footer_links):
    """Assemble a complete page from page_data dict."""
    sections_html = []
    for section in page_data.get("sections", []):
        kind = section["kind"]
        if kind == "hero":
            sections_html.append(hero_block(**section["args"]))
        elif kind == "stats":
            sections_html.append(stats_block(**section["args"]))
        elif kind == "section_dark":
            sections_html.append(section_dark(**section["args"]))
        elif kind == "section_light":
            sections_html.append(section_light(**section["args"]))
        elif kind == "section_white":
            sections_html.append(section_white(**section["args"]))
        elif kind == "section_table":
            sections_html.append(section_table(**section["args"]))
        elif kind == "section_callout":
            sections_html.append(section_callout(**section["args"]))
        elif kind == "related":
            sections_html.append(related_block(**section["args"]))
        elif kind == "cta":
            sections_html.append(cta_block())

    body = "\n".join(sections_html)

    head = HEAD.format(
        title=page_data["title"],
        meta_description=page_data["meta_description"],
    )
    footer = FOOTER.format(**footer_links)
    return head + body + footer


def write_page(path: Path, html: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")


# ============================================================
# DATA — programs, states, cities, compare, resources
# Each entry is a self-contained page definition.
# ============================================================
PROGRAMS = []
STATES = []
CITIES = []
COMPARE = []
RESOURCES = []

# Will populate in next file via imported module
def register(category, page_def):
    category.append(page_def)


if __name__ == "__main__":
    print("Generator module loaded.")
