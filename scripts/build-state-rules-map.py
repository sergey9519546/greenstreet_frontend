"""Generate the "50-state rules" step visual from real geometry and real rules.

Replaces a hand-drawn blob — a rounded rectangle with seven decorative pins that
had nothing to do with any state — with the actual US map, coloured by each
state's actual prepayment-penalty status.

Two existing sources, no new data invented:
  src/data/usMapPaths.ts   51 state paths, viewBox "174 100 959 593"
  src/engine/statePppLaws.ts  48 states with a `status` field

Colour is the project risk ramp, on-dark variants because this card sits on
#003738:
  ALLOWED                -> positive   #4dbd97   (5.64:1 on dark)
  CONDITIONAL and kin    -> warning    #e6b84d   (7.06:1)
  PRACTICALLY_PROHIBITED -> dangerOnDark #e88a8a (5.26:1)
  no entry               -> muted mint, i.e. "not in the matrix", not "fine"

Motion is a single west-to-east wash keyed off each state's own x position, so
the sweep reads as "checking every state" rather than a bar sliding over a
shape. One pass, no loop: DESIGN_SOURCE_OF_TRUTH forbids perpetual motion.
Pure CSS so it cannot fight the existing GSAP step timeline, and it is disabled
under prefers-reduced-motion.
"""
import re, pathlib, json

ROOT = pathlib.Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")

# ── read real geometry ────────────────────────────────────────────────────────
paths_src = (ROOT / "src/data/usMapPaths.ts").read_text(encoding="utf-8")
VIEWBOX = re.search(r'US_VIEWBOX = "([^"]+)"', paths_src).group(1)
PATHS = dict(re.findall(r'^\s{2}([A-Z]{2}):\s*"([^"]+)"', paths_src, re.M))

# ── read real rules ───────────────────────────────────────────────────────────
laws_src = (ROOT / "src/engine/statePppLaws.ts").read_text(encoding="utf-8")
STATUS = dict(re.findall(r"^\s+([A-Z]{2}):\s*\{\s*\n\s*state:\s*'[A-Z]{2}',\s*\n\s*status:\s*'([A-Z_]+)'",
                         laws_src, re.M))

RAMP = {                      # status -> (fill, legend bucket)
    "ALLOWED": ("#4dbd97", "allowed"),
    "CONDITIONAL": ("#e6b84d", "conditional"),
    "ARM_RESTRICTED": ("#e6b84d", "conditional"),
    "AMBIGUOUS": ("#e6b84d", "conditional"),
    "ENTITY_ONLY": ("#e6b84d", "conditional"),
    "UNKNOWN": ("#e6b84d", "conditional"),
    "PRACTICALLY_PROHIBITED": ("#e88a8a", "restricted"),
}
NO_DATA = "#a9b8a0"           # muted — "not in the matrix", deliberately not green

def centroid_x(d: str) -> float:
    xs = [float(n) for n in re.findall(r"[-+]?\d*\.?\d+", d)[::2][:400]]
    return sum(xs) / len(xs) if xs else 0.0

vb = [float(n) for n in VIEWBOX.split()]
x0, w = vb[0], vb[2]

rows, counts = [], {"allowed": 0, "conditional": 0, "restricted": 0, "no data": 0}
for code, d in sorted(PATHS.items()):
    st = STATUS.get(code)
    fill, bucket = RAMP.get(st, (NO_DATA, "no data"))
    counts[bucket] += 1
    # 0..1 across the map, west first — drives the wash delay
    t = max(0.0, min(1.0, (centroid_x(d) - x0) / w))
    rows.append(
        f'<path class="gsm-st" d="{d}" fill="{fill}" '
        f'style="--gsm-d:{t * 0.9:.2f}s" data-s="{code}"/>'
    )

# No in-SVG legend, and the native viewBox height.
#
# The slot this renders into measures 266x186 CSS px. Against a 959-unit-wide
# viewBox that is a scale of ~0.28, so a legend at font-size 21 would paint at
# roughly 6px — unreadable, and worse than no legend. Extending the viewBox to
# 680 to make room for it also squashed the map inside its own box. At thumbnail
# size the shape and the colour coding are the whole message; the legend belongs
# in the HTML beside the visual, where it scales with the page, not inside the
# artwork.
#
# Stroke is 3 units for the same reason: 1.1 would render at 0.3px and let
# neighbouring states bleed into one another.
svg = (
    f'<svg viewBox="{VIEWBOX}" preserveAspectRatio="xMidYMid meet" role="img" '
    f'aria-label="Map of the United States, shaded by prepayment-penalty status: '
    f'{counts["allowed"]} states allowed, {counts["conditional"]} conditional, '
    f'{counts["restricted"]} practically prohibited, {counts["no data"]} not in the matrix.">'
    f'<title>Prepayment-penalty rules by state</title>'
    f'<g class="gsm-map">{"".join(rows)}</g>'
    f'</svg>'
)

CSS = (
    "<style>"
    ".gss .gsm-st{stroke:#003738;stroke-width:3;stroke-linejoin:round;"
    "opacity:0;transform-origin:center;animation:gsmWash .5s ease-out forwards;"
    "animation-delay:var(--gsm-d,0s)}"
    "@keyframes gsmWash{from{opacity:0}to{opacity:1}}"
    "@media(prefers-reduced-motion:reduce){.gss .gsm-st{animation:none;opacity:1}}"
    "</style>"
)

print(f"viewBox      : {VIEWBOX}")
print(f"states drawn : {len(rows)}")
print(f"buckets      : {json.dumps(counts)}")
(ROOT / "scripts/_state-map.svg.txt").write_text(CSS + svg, encoding="utf-8", newline="")
print(f"written      : scripts/_state-map.svg.txt ({len(CSS + svg):,} bytes)")
