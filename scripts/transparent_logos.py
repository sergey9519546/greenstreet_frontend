"""Carefully remove white background from logos.

Method: border-connected flood fill.
- Build a "soft white" mask (near-white pixels).
- Connected-component label it (8-connectivity).
- Any white component that touches the image border = real background -> transparent.
- White *enclosed* inside the mark (negative space) is NOT border-connected -> kept.
- Feather alpha across the anti-aliased fringe so no white halo remains.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

LOGOS = Path(__file__).resolve().parent.parent / "public" / "img" / "logos"

# threshold for what counts as "near white" when tracing the background region
SOFT = 210   # pixels with min channel >= SOFT are flood candidates
HARD = 244   # pixels this white inside the bg region -> fully transparent

# map from current (white-bg) file -> output transparent png
JOBS = [
    "logo-01-apex-capital.jpg",
    "logo-02-ironclad-mortgage.jpg",
    "logo-03-meridian-dscr.jpg",
    "logo-04-keystone-rental.jpg",
    "logo-05-pinnacle-lending.png",
    "logo-06-harbor-bridge.jpg",
    "logo-07-clearwater-lending.png",
    "logo-08-redrock-property.png",
]


def process(path: Path) -> Path:
    img = Image.open(path).convert("RGB")
    arr = np.asarray(img).astype(np.int16)
    h, w = arr.shape[:2]

    min_ch = arr.min(axis=2)          # low for colored pixels, ~255 for white
    soft = min_ch >= SOFT             # background candidate mask

    # label connected soft-white regions, 8-connectivity
    structure = np.ones((3, 3), dtype=int)
    labels, n = ndimage.label(soft, structure=structure)

    # collect labels that touch any border
    border_labels = set()
    border_labels.update(labels[0, :].tolist())
    border_labels.update(labels[-1, :].tolist())
    border_labels.update(labels[:, 0].tolist())
    border_labels.update(labels[:, -1].tolist())
    border_labels.discard(0)

    bg = np.isin(labels, list(border_labels))   # true background region

    # alpha: start fully opaque
    alpha = np.full((h, w), 255, dtype=np.float32)

    # within bg region, feather by whiteness:
    #   min_ch >= HARD  -> alpha 0 (pure white bg)
    #   min_ch == SOFT  -> alpha ~full (edge of the mark)
    # linear ramp between SOFT and HARD
    ramp = (HARD - min_ch.astype(np.float32)) / float(HARD - SOFT)
    ramp = np.clip(ramp, 0.0, 1.0) * 255.0     # 0 at white, 255 at SOFT
    alpha[bg] = ramp[bg]

    out = np.dstack([arr.astype(np.uint8), alpha.astype(np.uint8)])
    result = Image.fromarray(out, mode="RGBA")

    out_path = path.with_suffix(".png")
    # if source was already .png we still overwrite with transparent version
    result.save(out_path)

    transparent_px = int((alpha == 0).sum())
    pct = 100.0 * transparent_px / (h * w)
    return out_path, pct, n


if __name__ == "__main__":
    for name in JOBS:
        p = LOGOS / name
        if not p.exists():
            print(f"MISSING {name}")
            continue
        out_path, pct, n = process(p)
        print(f"{name:34s} -> {out_path.name:34s} bg={pct:4.1f}% comps={n}")
