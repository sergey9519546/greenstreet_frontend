"""Consolidate palette drift — mechanically safe subset only.

v2. v1 chained its own replacements: swapping `borderRadius: 99` for
`borderRadius: 999` re-matched the result, so 99 -> 999 -> 9999 -> 999. Every
numeric replacement here is anchored with a (?!\\d) so a value can never be
rewritten into something the next rule matches.

NOT touched, because they are design decisions rather than drift:
  - dc.card = "#fff" and dc.panel = MINT_BG (90 references across 33 files)
  - ComplianceDashboard's private 3-surface ramp
  - #b8901f amber: replacing it with risk.warning would REDUCE contrast on the
    white cards it sits on. It needs a warningOnLight token that does not exist.
"""
import pathlib, re, collections

SRC = pathlib.Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\src")

# Near-duplicate dark grounds -> the one canonical dark (max dE 11; several <7).
DARK = ["#00302e", "#00292a", "#002829", "#064a4c", "#00201f", "#002a2b", "#004041"]

# Parallel danger reds -> the ramp, chosen by the ground each paints on.
RED = {
    "#e57373": ("risk.dangerOnDark", "#e88a8a"),   # text on the dark ground
    "#e8927c": ("risk.dangerOnDark", "#e88a8a"),
    "#c25b4e": ("risk.dangerOnLight", "#a64949"),  # on pistachio / white cards
    "#c0554f": ("risk.dangerOnLight", "#a64949"),
}

# Four spellings of "pill"; only 999 matches radius.pill.
PILL = re.compile(r"borderRadius: (?:100|99|9999)(?!\d)")

counts = collections.Counter()
touched = set()

for path in list(SRC.rglob("*.tsx")) + list(SRC.rglob("*.ts")):
    if ".test." in path.name:
        continue
    text = original = path.read_text(encoding="utf-8")
    has_risk_import = re.search(r"import\s*\{[^}]*\brisk\b[^}]*\}\s*from\s*[\"'].*theme", text)

    for old in DARK:
        for v in (old, old.upper()):
            if v in text:
                counts[f"{old} -> #003738"] += text.count(v)
                text = text.replace(v, "#003738")

    for old, (token, hexval) in RED.items():
        for v in (old, old.upper()):
            if v not in text:
                continue
            n = text.count(v)
            if has_risk_import:
                # quoted colour -> the token; bare occurrences -> the hex
                text = text.replace(f'"{v}"', token).replace(f"'{v}'", token)
                counts[f"{old} -> {token}"] += n
            else:
                counts[f"{old} -> {hexval} (no risk import in file)"] += n
            text = text.replace(v, hexval)

    n_pill = len(PILL.findall(text))
    if n_pill:
        text = PILL.sub("borderRadius: 999", text)
        counts["pill 100/99/9999 -> 999"] += n_pill

    if text != original:
        path.write_text(text, encoding="utf-8", newline="")
        touched.add(str(path.relative_to(SRC)))

print(f"APPLIED across {len(touched)} files\n")
for k, n in sorted(counts.items(), key=lambda kv: -kv[1]):
    print(f"  {n:>3}x  {k}")

# Self-check: no chained radius corruption, no stray old values.
bad = []
for path in list(SRC.rglob("*.tsx")) + list(SRC.rglob("*.ts")):
    t = path.read_text(encoding="utf-8")
    for m in re.findall(r"borderRadius: (\d+)", t):
        if m in ("100", "99", "9999") or len(m) > 4:
            bad.append(f"{path.name}: borderRadius {m}")
print("\nSELF-CHECK chained/leftover radii:", bad if bad else "clean")
