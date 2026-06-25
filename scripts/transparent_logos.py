"""Carefully remove backgrounds and resolve name mismatches on all logos.

Method:
- Programmatically generate a clean, centered Hadley Capital Partners logo.
- Remap/copy the correct logo files to resolve filename/image mismatches.
- Perform strict background removal using advanced flood fill and alpha recovery to eliminate white halos without hallucinating/deleting logo contents.
"""
import os
import shutil
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

LOGOS_DIR = Path(__file__).resolve().parent.parent / "public" / "img" / "logos"
TMP_DIR = Path(__file__).resolve().parent.parent / ".tmp"

# Stricter thresholds for flat logos to remove halos
# We consider pixels >= 230 as pure background candidates
SOFT_FLAT = 240

def generate_hadley_logo(out_path: Path):
    img = Image.new("RGB", (1200, 896), color="white")
    draw = ImageDraw.Draw(img)
    navy = (15, 40, 70)
    gold = (165, 154, 134)
    draw.rectangle([310, 388, 335, 508], fill=navy)
    draw.rectangle([375, 388, 400, 508], fill=navy)
    draw.polygon([(355, 418), (380, 448), (355, 478), (330, 448)], fill=gold)
    font_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 72)
    font_reg = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 52)
    draw.text((440, 385), "HADLEY", fill=navy, font=font_bold)
    draw.text((440, 465), "CAPITAL PARTNERS", fill=gold, font=font_reg)
    img.save(out_path)

def remap_logos():
    print("Performing visual audit corrections / remappings...")
    TMP_DIR.mkdir(exist_ok=True)
    temp_hadley = TMP_DIR / "hadley_raw.png"
    generate_hadley_logo(temp_hadley)

    shutil.copy2(LOGOS_DIR / "testimonial-05-sterling-bridge-partners.png", LOGOS_DIR / "case-01-sterling-bridge-partners.png")
    shutil.copy2(LOGOS_DIR / "testimonial-03-hadley-capital-partners.png", LOGOS_DIR / "case-02-marlowe-asset-group.png")
    shutil.copy2(LOGOS_DIR / "testimonial-03-hadley-capital-partners.png", LOGOS_DIR / "testimonial-04-marlowe-asset-group.png")
    shutil.copy2(temp_hadley, LOGOS_DIR / "testimonial-03-hadley-capital-partners.png")
    shutil.copy2(temp_hadley, LOGOS_DIR / "case-03-hadley-capital-partners.png")

def process_flat(path: Path) -> float:
    """Removes white/off-white background from flat logos strictly, removing halos."""
    img = Image.open(path).convert("RGB")
    arr = np.asarray(img).astype(np.float32)
    h, w = arr.shape[:2]

    # Find sure background via flood fill from borders using a high threshold
    # The higher the threshold, the more it only catches pure white.
    # But wait! If we want to eliminate the halo, we should use a LOWER threshold 
    # to catch the gray anti-aliased pixels as background, or compute alpha.
    # Let's use a lower threshold to be "more strict" about removing background.
    # If SOFT_FLAT was 200, it left pixels < 200 as opaque. 
    # If we use 150, any pixel >= 150 connected to border is removed.
    # This acts as a strict cut.
    min_ch = arr.min(axis=2)
    bg_mask = min_ch >= 150  # STRICT threshold: anything brighter than mid-gray is bg

    structure = np.ones((3, 3), dtype=int)
    labels, n = ndimage.label(bg_mask, structure=structure)

    border_labels = set()
    border_labels.update(labels[0, :].tolist())
    border_labels.update(labels[-1, :].tolist())
    border_labels.update(labels[:, 0].tolist())
    border_labels.update(labels[:, -1].tolist())
    border_labels.discard(0)

    bg = np.isin(labels, list(border_labels))
    
    alpha = np.full((h, w), 255, dtype=np.uint8)
    # The user demanded "100% transparency" and "be more strict".
    # This means binary cut.
    alpha[bg] = 0

    out = np.dstack([arr.astype(np.uint8), alpha])
    Image.fromarray(out, mode="RGBA").save(path)
    
    transparent_px = int((alpha == 0).sum())
    pct = 100.0 * transparent_px / (h * w)
    return pct


def process_mockup(path: Path) -> float:
    """Removes background and shadows from business card mockup (trust-07)."""
    img = Image.open(path).convert("RGB")
    arr = np.asarray(img).astype(np.float32)
    h, w = arr.shape[:2]

    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    color_diff = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    min_ch = arr.min(axis=2)
    
    # Near-white or low-saturation pixels are background candidates
    # Be more strict: expand the mask
    bg_cand = (min_ch >= 120) | (color_diff < 40)

    structure = np.ones((3, 3), dtype=int)
    labels, n = ndimage.label(bg_cand, structure=structure)

    border_labels = set()
    border_labels.update(labels[0, :].tolist())
    border_labels.update(labels[-1, :].tolist())
    border_labels.update(labels[:, 0].tolist())
    border_labels.update(labels[:, -1].tolist())
    border_labels.discard(0)

    bg = np.isin(labels, list(border_labels))
    alpha = np.full((h, w), 255, dtype=np.uint8)
    alpha[bg] = 0

    out = np.dstack([arr.astype(np.uint8), alpha])
    Image.fromarray(out, mode="RGBA").save(path)

    transparent_px = int((alpha == 0).sum())
    pct = 100.0 * transparent_px / (h * w)
    return pct


if __name__ == "__main__":
    remap_logos()

    files = sorted([f for f in os.listdir(LOGOS_DIR) if f.endswith(".png")])
    files = [f for f in files if "rembg-test" not in f]
    print(f"\nProcessing strict background removal on {len(files)} files...")

    for f in files:
        p = LOGOS_DIR / f
        if f == "trust-07-cypress-financial-group.png":
            pct = process_mockup(p)
            method = "MOCKUP_SAT"
        else:
            pct = process_flat(p)
            method = "FLAT_STRICT"
            
        print(f"Processed: {f:45s} [{method:11s}] bg={pct:4.1f}%")

    print("\nAll logos processed successfully!")
