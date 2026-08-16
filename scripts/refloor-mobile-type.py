"""Re-floor every fontSize clamp() to a real mobile size.

The floors in this codebase were chosen as desktop minimums. But at 375px the vw
term of `clamp(min, N vw, max)` is always far below the floor — 3.5vw is 13px —
so the floor IS the mobile size, and 95 of 208 declarations render at 28px or
larger on a phone. One renders at 72px.

Lowering a floor cannot change desktop: above the crossover width the vw term
governs, and the max is untouched. It only changes what phones and small
tablets get, which is the entire bug.

The scale below is anchored on a 16px body: display 32 / h1 28 / h2 22 / h3 19 /
lead 17 / body 16 / small 14 / caption 13. Adjacent source floors map to
adjacent scale steps so existing relative hierarchy survives compression rather
than collapsing into one size.
"""
import re, sys, pathlib, collections

SRC = pathlib.Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\src")

# old floor -> mobile floor. Anything <= 17 is already mobile-appropriate.
SCALE = {
    72: 32, 56: 32, 52: 30, 48: 30, 46: 28, 44: 28, 42: 28,
    40: 26, 36: 25, 34: 24, 32: 24, 30: 23, 28: 22, 26: 21,
    25: 20, 24: 20, 22: 19, 21: 19, 20: 18, 19: 18, 18: 17,
}

# fontSize: "clamp( <floor>px , ... )"  — single or double quoted.
PATTERN = re.compile(
    r'(fontSize:\s*["\']clamp\(\s*)([0-9.]+)(px\s*,)'
)

dry = "--apply" not in sys.argv
changes = collections.Counter()
files_touched = 0

for path in sorted(SRC.rglob("*.tsx")):
    text = path.read_text(encoding="utf-8")

    def sub(m):
        floor = float(m.group(2))
        key = int(floor) if floor == int(floor) else None
        new = SCALE.get(key)
        if new is None or new >= floor:
            return m.group(0)
        changes[f"{key}px -> {new}px"] += 1
        return f"{m.group(1)}{new}{m.group(3)}"

    updated = PATTERN.sub(sub, text)
    if updated != text:
        files_touched += 1
        if not dry:
            path.write_text(updated, encoding="utf-8", newline="")

total = sum(changes.values())
print(("DRY RUN — " if dry else "APPLIED — ") + f"{total} font sizes in {files_touched} files\n")
for k, n in sorted(changes.items(), key=lambda kv: -int(kv[0].split("px")[0])):
    print(f"  {n:>3}x  {k}")

if dry:
    print("\nre-run with --apply to write")
