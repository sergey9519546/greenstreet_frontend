"""Cut the paper background out of the property-type pencil illustrations.

The source JPGs in public/img/properties/ are pencil sketches on near-white
paper (measured ~rgb(247,243,230) averaged across all six, sampled from the
four corners of each image) with no alpha channel. Laid on the app's
#eeefd3 ground, that paper always read as a rectangle of a visibly different
color — no amount of card border or background styling could make it
disappear, because the pixels themselves were never transparent.

This reads each image's luminance and cuts anything above HIGH to fully
transparent, anything below LOW to fully opaque, and linearly ramps alpha
between the two so pencil linework keeps an anti-aliased edge instead of a
hard cutout ring. The thresholds were chosen from the luminance histogram of
sfr_bungalow.jpg, which has a sharp isolated spike above 240 (the paper) with
linework spread out below it — LOW=215/HIGH=246 sits in the gap.

Output: public/img/properties/cutout/<name>.png, referenced directly by
PropertyTypesGallery.tsx. Re-run this if the source JPGs change.

Usage: python scripts/cutout-property-images.py
"""

import glob
import os

from PIL import Image

SRC_DIR = os.path.join("public", "img", "properties")
OUT_DIR = os.path.join(SRC_DIR, "cutout")
LOW, HIGH = 215, 246


def cutout(path: str) -> None:
    name = os.path.basename(path).rsplit(".", 1)[0]
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    out = Image.new("RGBA", (w, h))
    opx = out.load()

    opaque = transparent = 0
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum <= LOW:
                a = 255
            elif lum >= HIGH:
                a = 0
            else:
                a = int(255 * (HIGH - lum) / (HIGH - LOW))
            if a == 255:
                opaque += 1
            elif a == 0:
                transparent += 1
            opx[x, y] = (r, g, b, a)

    out_path = os.path.join(OUT_DIR, f"{name}.png")
    out.save(out_path)
    total = w * h
    print(
        f"{out_path}  {w}x{h}  opaque {100 * opaque / total:.1f}%  "
        f"transparent {100 * transparent / total:.1f}%"
    )


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    sources = sorted(glob.glob(os.path.join(SRC_DIR, "*.jpg")))
    if not sources:
        raise SystemExit(f"No .jpg files found in {SRC_DIR}")
    for path in sources:
        cutout(path)


if __name__ == "__main__":
    main()
