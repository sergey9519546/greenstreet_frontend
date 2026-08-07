"""Orchestrate batch regeneration of all logos with green chroma key,
then post-process to remove green -> transparent PNG."""
import base64
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

BASE = Path(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend')
LOGOS_DIR = BASE / 'public' / 'img' / 'logos'
TMP_DIR = BASE / '_regen_tmp'
CHROMA_SCRIPT = BASE / 'chroma_key.py'
MAVIS_BIN = Path(r'C:\Users\serge\.mavis\bin\mavis.cmd')
MAVIS_TRASH = Path(r'C:\Users\serge\.mavis\bin\mavis-trash.cmd')

LOGOS_DIR.mkdir(parents=True, exist_ok=True)
TMP_DIR.mkdir(parents=True, exist_ok=True)

# (filename, brand_name, category, design_hint)
LOGOS = [
    # Testimonial
    ("testimonial-01-nexus-financial.png", "Nexus Financial", "testimonial", "modern minimalist wordmark, geometric icon"),
    ("testimonial-02-cedar-funding.png", "Cedar Funding", "testimonial", "classic serif wordmark with cedar tree motif"),
    ("testimonial-03-hadley-capital-partners.png", "Hadley Capital Partners", "testimonial", "modern monogram with abstract H mark"),
    ("testimonial-04-marlowe-asset-group.png", "Marlowe Asset Group", "testimonial", "elegant serif wordmark with diamond accent"),
    ("testimonial-05-sterling-bridge-partners.png", "Sterling Bridge Partners", "testimonial", "refined wordmark with bridge arch symbol"),
    # Case study
    ("case-01-sterling-bridge-partners.png", "Sterling Bridge Partners", "case", "refined wordmark with bridge arch symbol"),
    ("case-02-marlowe-asset-group.png", "Marlowe Asset Group", "case", "elegant serif wordmark with diamond accent"),
    ("case-03-hadley-capital-partners.png", "Hadley Capital Partners", "case", "modern monogram with abstract H mark"),
    # Trust band
    ("trust-01-apex-capital-group.png", "Apex Capital Group", "trust", "bold mountain peak symbol with wordmark"),
    ("trust-02-northshore-capital.png", "Northshore Capital", "trust", "minimal wave or compass mark"),
    ("trust-03-pacific-wealth-advisors.png", "Pacific Wealth Advisors", "trust", "circular emblem with horizon line"),
    ("trust-04-summit-bridge-partners.png", "Summit Bridge Partners", "trust", "geometric peak with bridge line"),
    ("trust-05-ironwood-asset-management.png", "Ironwood Asset Management", "trust", "tree or oak-leaf monogram"),
    ("trust-06-vertex-capital-partners.png", "Vertex Capital Partners", "trust", "sharp angular V mark"),
    ("trust-07-cypress-financial-group.png", "Cypress Financial Group", "trust", "cypress tree silhouette"),
    ("trust-08-atlas-wealth-management.png", "Atlas Wealth Management", "trust", "geometric globe or atlas mark"),
    ("trust-09-heritage-asset-management.png", "Heritage Asset Management", "trust", "heraldic shield with monogram"),
    ("trust-10-coastline-capital-markets.png", "Coastline Capital Markets", "trust", "wave or shoreline motif"),
    ("trust-11-cornerstone-advisors.png", "Cornerstone Advisors", "trust", "block or cornerstone geometric mark"),
    ("trust-12-pinnacle-wealth-partners.png", "Pinnacle Wealth Partners", "trust", "upward triangular peak mark"),
    ("trust-13-lone-star-capital-partners.png", "Lone Star Capital Partners", "trust", "single five-point star monogram"),
    ("trust-14-vanguard-asset-management.png", "Vanguard Asset Management", "trust", "forward arrow or chevron mark"),
    ("trust-15-beacon-hill-wealth.png", "Beacon Hill Wealth", "trust", "lighthouse or beacon silhouette"),
    ("trust-16-iron-range-financial.png", "Iron Range Financial", "trust", "mountain range horizontal mark"),
    ("trust-17-sandhills-wealth-partners.png", "Sandhills Wealth Partners", "trust", "rolling dune or hill curve mark"),
    ("trust-18-northern-lights-capital.png", "Northern Lights Capital", "trust", "aurora wave or arc mark"),
    ("trust-19-south-bay-wealth-advisors.png", "South Bay Wealth Advisors", "trust", "bay curve with sun mark"),
    ("trust-20-riverside-brokerage.png", "Riverside Brokerage", "trust", "river curve or flowing line mark"),
    ("trust-21-sequoia-capital-partners.png", "Sequoia Capital Partners", "trust", "sequoia tree silhouette"),
    ("trust-22-frontier-wealth-management.png", "Frontier Wealth Management", "trust", "horizon line with mountains"),
    ("trust-23-beacon-wealth-partners.png", "Beacon Wealth Partners", "trust", "geometric beacon or compass"),
    ("trust-24-liberty-capital-partners.png", "Liberty Capital Partners", "trust", "eagle or liberty motif"),
    ("trust-25-sandstone-asset-management.png", "Sandstone Asset Management", "trust", "geometric layered stone mark"),
    ("trust-26-mercator-wealth-partners.png", "Mercator Wealth Partners", "trust", "compass rose or globe meridian"),
    ("trust-27-capital-bridge-partners.png", "Capital Bridge Partners", "trust", "bridge arch or span mark"),
]


def build_prompt(brand: str, hint: str) -> str:
    return (
        f"Minimal professional financial services company logo for {brand}. "
        f"Design hint: {hint}. "
        "Flat 2D vector style, monochrome dark navy or charcoal on a PURE SOLID BRIGHT GREEN "
        "background (#00FF00 chroma key green) covering the entire image edge-to-edge with no "
        "gradient, no white margins, no shadow, no border, no frame, no mockup, no transparency. "
        "The green field must fill every pixel that is not part of the logo itself. "
        "The logo must be cleanly contained within the green field with reasonable margins."
    )


def call_matrix(req_file: Path) -> dict:
    """Call matrix_generate_image via mavis CLI with --file."""
    cmd = [
        str(MAVIS_BIN), 'mcp', 'call', 'matrix', 'matrix_generate_image',
        '--file', str(req_file),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if proc.returncode != 0:
        raise RuntimeError(f'mavis call failed (rc={proc.returncode}): {proc.stderr[:500]}')
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        raise RuntimeError(f'mavis returned non-JSON output (first 500 chars): {proc.stdout[:500]}')


def main():
    batch_size = 8
    total = len(LOGOS)
    print(f"Regenerating {total} logos in batches of {batch_size}...\n")

    results = []
    for i in range(0, total, batch_size):
        batch = LOGOS[i:i + batch_size]
        requests = [
            {
                'prompt': build_prompt(brand, hint),
                'aspect_ratio': '16:9',
                'resolution': '1K',
            }
            for (fname, brand, cat, hint) in batch
        ]
        req_file = TMP_DIR / f'batch_{i:03d}.json'
        req_file.write_text(json.dumps({'requests': requests}))

        print(f"Batch {i // batch_size + 1}/{(total + batch_size - 1) // batch_size}: "
              f"{len(batch)} prompts -> {req_file.name}")
        sys.stdout.flush()

        resp = call_matrix(req_file)
        if resp.get('code') != 0:
            print(f"  BATCH FAILED: {resp}")
            continue
        items = resp.get('success_items', [])
        if len(items) != len(batch):
            print(f"  MISMATCH: requested {len(batch)}, got {len(items)}")
            continue

        for idx, ((fname, brand, cat, hint), item) in enumerate(zip(batch, items)):
            if not item.get('is_success'):
                print(f"  FAILED: {fname} - {item.get('text_response', 'no reason')}")
                continue
            url_or_path = item['output_url']
            tmp_png = TMP_DIR / f'{fname}.raw.png'

            # output_url may be a local path or an https CDN URL
            if url_or_path.startswith('http'):
                # Download from CDN
                try:
                    req = urllib.request.Request(url_or_path, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=60) as resp:
                        tmp_png.write_bytes(resp.read())
                except Exception as e:
                    print(f"  DOWNLOAD FAIL {fname}: {e}")
                    continue
            else:
                src = Path(url_or_path)
                if not src.exists():
                    print(f"  MISSING LOCAL: {fname} -> {src}")
                    continue
                shutil.move(str(src), str(tmp_png))

            # Chroma key remove -> final
            final_png = LOGOS_DIR / fname
            info = subprocess.run(
                [sys.executable, str(CHROMA_SCRIPT), str(tmp_png), str(final_png)],
                capture_output=True, text=True,
            )
            if info.returncode != 0:
                print(f"  CHROMA FAIL {fname}: {info.stderr}")
                continue
            try:
                subprocess.run([str(MAVIS_TRASH), str(tmp_png)], check=False, capture_output=True)
            except Exception:
                pass
            size = final_png.stat().st_size
            print(f"  OK {fname}  ({size:,} bytes)")
            results.append({'file': fname, 'bytes': size})

        # cleanup batch file
        try:
            req_file.unlink()
        except Exception:
            pass

    print(f"\nDone. {len(results)}/{total} regenerated.")
    print(f"Final logos in: {LOGOS_DIR}")


if __name__ == '__main__':
    main()