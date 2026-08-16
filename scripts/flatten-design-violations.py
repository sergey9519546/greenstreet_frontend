"""Remove the shadow/blur/glow violations and the banned red.

DESIGN_SOURCE_OF_TRUTH is flat by intent: no box-shadow, no backdrop-filter, no
blur, no glow. Every edit below deletes a decoration; none changes layout,
colour meaning, or copy. Zero-blur rings (`0 0 0 Npx`) are hard borders, not
glows, and are left alone.
"""
import pathlib, re, sys

ROOT = pathlib.Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")

# (relative path, exact substring to find, replacement, why)
EDITS = [
    # --- true glassmorphism -------------------------------------------------
    ("src/components/LiveDistressDealsFeed.tsx",
     '              backdropFilter: "blur(6px)",\n', "",
     "backdrop-filter blur(6px) — the only literal glassmorphism in src/"),
    ("src/components/LiveDistressDealsFeed.tsx",
     '                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",\n', "",
     "50px drop shadow on the deal card"),

    # --- soft drop shadows --------------------------------------------------
    ("src/components/DSCRInvestorMindsetSection.tsx",
     '            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",\n', "",
     "50px drop shadow"),
    ("src/components/ui/ControlTooltip.tsx",
     '            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.6)",\n', "",
     "tooltip already carries a 1px lemon border; the shadow is redundant"),
    ("src/marketing/stateMap.ts",
     "filter:drop-shadow(0 1.25rem 1.875rem rgba(0,55,56,.12));", "",
     "drop-shadow under the state map svg"),
    ("src/pages/CaseStudiesPage.tsx",
     ', textShadow: "0 2px 16px rgba(0,26,24,0.6)"', "",
     "16px text glow on the case-study numeral"),
    ("src/pages/DealAnalyzerPage.tsx",
     ', boxShadow: "0 12px 32px rgba(0,0,0,0.18)"', "",
     "the comment called it a floating verdict badge; it has a border already"),
    ("src/pages/DealAnalyzerPage.tsx",
     ', boxShadow: "0 4px 12px rgba(0,55,56,0.03)"', "",
     "print card already has a 1.5px border"),
    ("src/pages/InvestorsPage.tsx",
     ', boxShadow: "0 20px 40px rgba(0,0,0,0.3)"', "",
     "panel already has a 1px border"),

    # --- lemon glow on buttons ---------------------------------------------
    ("src/pages/InvestorsPage.tsx",
     ', boxShadow: "0 4px 14px rgba(216,217,88,0.3)"', "",
     "lemon glow under a lemon button"),
    ("src/pages/PerfectPropertyPage.tsx",
     '                  boxShadow: "0 4px 14px rgba(216,217,88,0.3)",\n', "",
     "lemon glow under a lemon button"),
]

# The blurred lemon glow orb, present in BOTH homepage copies.
ORB = ('.gs-rate-widget-card:after{content:"";position:absolute;top:-18%;'
       'right:-12%;width:42%;height:56%;background:#d8d958;border-radius:999px;'
       'opacity:.14;filter:blur(6px);pointer-events:none;}')

applied, missed = [], []
for rel, find, repl, why in EDITS:
    p = ROOT / rel
    text = p.read_text(encoding="utf-8")
    if find not in text:
        missed.append((rel, why))
        continue
    p.write_text(text.replace(find, repl, 1), encoding="utf-8", newline="")
    applied.append((rel, why))

# Homepage copies: orb + banned red + the third surface.
for rel in ["index.html", "src/marketing/home-markup.html"]:
    p = ROOT / rel
    if not p.exists():
        continue
    text = orig = p.read_text(encoding="utf-8")
    if ORB in text:
        text = text.replace(ORB, "")
        applied.append((rel, "blurred lemon glow orb"))
    # #ff6b6b is banned. The widget ground is #003738/#004041 (dark), and its
    # sibling states already use the on-dark ramp, so dangerOnDark is the pair.
    n = text.count("#ff6b6b")
    if n:
        text = text.replace("#ff6b6b", "#e88a8a")
        applied.append((rel, f"{n}x #ff6b6b -> #e88a8a (risk.dangerOnDark)"))
    # #004041 was collapsed into #003738 project-wide; this inline widget kept it.
    n = text.count("#004041")
    if n:
        text = text.replace("#004041", "#003738")
        applied.append((rel, f"{n}x #004041 -> #003738 (third surface)"))
    if text != orig:
        p.write_text(text, encoding="utf-8", newline="")

print(f"APPLIED {len(applied)}:")
for rel, why in applied:
    print(f"  {rel:<48} {why}")
if missed:
    print(f"\nNOT FOUND {len(missed)} (string drifted — fix by hand):")
    for rel, why in missed:
        print(f"  {rel:<48} {why}")
