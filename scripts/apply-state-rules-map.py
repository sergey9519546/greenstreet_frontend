"""Apply the generated 50-state map block to index.html.

Idempotent and assertion-guarded. Every edit asserts its match count BEFORE
writing, and nothing is written unless all of them hold — an earlier attempt at
this file used a loose regex to delete CSS, matched into a @keyframes body, left
a dangling brace and broke the Tailwind build. So: literal strings only, exact
counts, and a diff summary printed at the end.

Four edits:
  1  swap the .gss4 <style>+<svg> block for the regenerated one
  2  drop dead CSS for the seven decorative pins the map replaced
  3  insert the map key (the map had no legend at all)
  4  correct two copy claims that our own data contradicts
"""
import re, pathlib, sys

ROOT = pathlib.Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")
HTML = ROOT / "index.html"

html = HTML.read_text(encoding="utf-8")
orig_len = len(html)
edits = []


def sub_once(pattern, repl, label, *, regex=False, count=1, done=None):
    """Replace exactly `count` occurrences, or abort.

    Idempotent: `done` is a marker whose presence (with the pattern already gone)
    means this edit landed on an earlier run, so it is skipped rather than fatal.
    Re-running the script on a patched file must be a no-op, not an abort.
    """
    global html
    n = len(re.findall(pattern, html, re.S)) if regex else html.count(pattern)
    if n == 0 and done is not None and done in html:
        edits.append(f"  {label}: already applied")
        return
    if n != count:
        sys.exit(f"ABORT [{label}]: expected {count} match(es), found {n}")
    html = re.sub(pattern, lambda _: repl, html, count=count, flags=re.S) if regex \
        else html.replace(pattern, repl, count)
    edits.append(f"  {label}: {n} replaced")


# ── 1 · the map block ─────────────────────────────────────────────────────────
NEW_SVG = (ROOT / "scripts/_state-map.svg.txt").read_text(encoding="utf-8")
sub_once(r"<style>\.gss[0-9]? \.gsm-st\{.*?</svg>", NEW_SVG, "map block", regex=True)

# ── 2 · dead pin CSS ──────────────────────────────────────────────────────────
# The blob these drove (seven decorative pins + a scan bar + a badge) is gone;
# every selector below now matches zero elements. Verified: 0 uses in markup.
# They were also 3 of the file's 21 perpetual loops.
DEAD = [
    ".gss4 .g4pin{transform-box:fill-box;transform-origin:center;animation:g4pin 3s ease-in-out infinite}\n",
    "@keyframes g4pin{0%,100%{transform:translateY(0) scale(1)}45%{transform:translateY(-7px) scale(1.14)}}\n",
    ".gss4 .g4p2{animation-delay:.18s}.gss4 .g4p3{animation-delay:.36s}.gss4 .g4p4{animation-delay:.54s}.gss4 .g4p5{animation-delay:.72s}.gss4 .g4p6{animation-delay:.9s}.gss4 .g4p7{animation-delay:1.08s}\n",
    ".gss4 .g4scan{animation:g4scan 6s ease-in-out infinite}\n",
    "@keyframes g4scan{0%{transform:translateX(0);opacity:0}15%{opacity:.55}80%{transform:translateX(316px);opacity:.55}100%{transform:translateX(316px);opacity:0}}\n",
    ".gss4 .s4badge{animation:gss-pop 6s ease infinite;animation-delay:.8s}\n",
]
for i, d in enumerate(DEAD):
    sub_once(d, "", f"dead css {i+1}", done="gsm-key")

# ── 3 · the map key ───────────────────────────────────────────────────────────
LEGEND = (ROOT / "scripts/_state-map.legend.txt").read_text(encoding="utf-8")
PARA_END = ("where the rules change what you can close.</p></div>")
ANCHOR = '</p></div><div class="btn_main_wrap" data-wf--btn-main--style="primary">'
sub_once(ANCHOR, "</p></div>" + LEGEND + ANCHOR[len("</p></div>"):], "legend insert",
         done="gsm-key")

# ── 4 · copy that our own data contradicts ────────────────────────────────────
# "always current" / "updated every month": src/engine/statePppLaws.ts:31 records
# the matrix as asOf 2026-01-01 on an ANNUAL cadence with a January trigger, and
# dates itself to its OLDEST lastVerified. Monthly is not what the data says.
sub_once("50-state rules, always current",
         "50-state rules, encoded and cited", "headline",
         done="50-state rules, encoded and cited")

# "usury caps, and business-purpose requirements": there is no usury dataset and
# no business-purpose dataset in the repo — statePppLaws.ts is the only state
# matrix that exists. "all 50 states": 48 entries = 47 states + DC (AK, CT, MA
# have none). TX dropped from the example list: its status is ALLOWED, so prepay
# rules do not in fact change what you can close there.
OLD_P = ("Prepayment penalties, usury caps, and business-purpose requirements \u2014 encoded for "
         "all 50 states and updated every month. Includes TX, MN, OH, PA, and NJ, where the "
         "rules change what you can close.")
NEW_P = ("Prepayment-penalty rules encoded for 47 states and DC, each with its statutory "
         "reference \u2014 reviewed annually, last confirmed January 2026. Includes MN, OH, PA, "
         "and NJ, where entity structure changes what you can close.")
sub_once(OLD_P, NEW_P, "paragraph", done=NEW_P)

HTML.write_text(html, encoding="utf-8", newline="")
print("\n".join(edits))
print(f"\nindex.html {orig_len:,} -> {len(html):,} bytes")
