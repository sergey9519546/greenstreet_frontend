"""Fix the canonical marketing-page.html:

1. Replace the Greenstreet SVG logo (viewBox 0 0 257 28, 11 paths) with a
   clean text-based 'DSCRGo' SVG using the brand Outfit font. There are 6
   occurrences of this logo on the page.

2. Replace the testimonial avatar URLs (5 headshots) with the locally
   generated avatar URLs from public/img/generated/avatars_urls.txt.

3. Sync the updated content to dist/index.html.

4. Move stale HTML files to dist-cleanup-backups/ (where backups already live)
   so only the canonical files (marketing-page.html + index.html + dist/index.html)
   remain.
"""
from __future__ import annotations
import os
import re
import shutil
import sys
from pathlib import Path

PROJECT = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend")
MARKETING_HTML = PROJECT / "marketing-page.html"
DIST_HTML = PROJECT / "dist" / "index.html"
AVATARS_URLS = PROJECT / "public" / "img" / "generated" / "avatars_urls.txt"
BACKUP_DIR = PROJECT / "dist-cleanup-backups"

# Stale HTML files to move out of the project root (keep only marketing-page.html
# + index.html for Vite)
STALE_HTML = [
    PROJECT / "greenboard.html",
    PROJECT / "marketing-page.html.bak",
    PROJECT / "marketing-page.html.bak2",
    PROJECT / "temp-greenboard.html",
    PROJECT / "temp.html",
    PROJECT / "marketing-page-body.html",
    PROJECT / "src" / "content" / "marketingBody.html",
]

# Generated avatar URLs in display order — mapped to existing testimonial
# positions (5 visible slides use av1..av5). We keep the existing testimonial
# text and firm names since those are real broker quotes; only the photo URLs
# are swapped to the diverse generated headshots.
AVATAR_URLS = [
    "https://d8j0ntlcm91z4.cloudfront.net/user_31TuKiO5xqAloW3PvanQ4fcgEXR/hf_20260622_225140_d0b0b44a-e63b-43c8-9c27-a822d2e8733f.png",
    "https://d8j0ntlcm91z4.cloudfront.net/user_31TuKiO5xqAloW3PvanQ4fcgEXR/hf_20260622_225412_adf3264c-437b-406b-b29b-6bdbd0cef038.png",
    "https://d8j0ntlcm91z4.cloudfront.net/user_31TuKiO5xqAloW3PvanQ4fcgEXR/hf_20260622_225648_3c896523-a378-43d0-8402-e14a4654e641.png",
    "https://d8j0ntlcm91z4.cloudfront.net/user_31TuKiO5xqAloW3PvanQ4fcgEXR/hf_20260622_225928_b7643d27-7073-4ae0-abdc-a0530dc0675b.png",
    "https://d8j0ntlcm91z4.cloudfront.net/user_31TuKiO5xqAloW3PvanQ4fcgEXR/hf_20260622_230300_42780334-b4cb-4ea5-bb74-f3a62ba91f26.png",
]

# Replacement SVG: text-based "DSCRGo" wordmark using the brand Outfit font.
# viewBox kept at 257x28 to match the original slot size so layout is stable.
NEW_LOGO_SVG = (
    '<svg width="100%" height="100%" viewBox="0 0 257 28" fill="none" '
    'xmlns="http://www.w3.org/2000/svg" aria-label="DSCRGo">'
    '<text x="0" y="22" font-family="\'Outfit Variable\',Outfit,Arial,sans-serif" '
    'font-size="24" font-weight="600" letter-spacing="-0.04em" '
    'fill="currentColor" dominant-baseline="alphabetic">DSCRGo</text>'
    '</svg>'
)

# The old logo SVG is bounded by <svg ... viewBox="0 0 257 28" ...>...</svg>
# Each instance can be very large (~13 KB of Bezier paths), so we use a
# non-greedy regex and replace_all=True semantics.
LOGO_SVG_PATTERN = re.compile(
    r'<svg\s+width="100%"\s+height="100%"\s+viewBox="0 0 257 28"[^>]*>.*?</svg>',
    re.DOTALL,
)


def replace_logo(html: str) -> tuple[str, int]:
    new_html, n = LOGO_SVG_PATTERN.subn(NEW_LOGO_SVG, html)
    return new_html, n


# Existing testimonial headshot URLs (the old Webflow CDN photos) — we replace
# them in order with the 5 generated avatar URLs.
OLD_HEADSHOT_URLS = [
    "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffe28/67f6ff66fb477c3272fe4bb1_Brook%20Powers%20Headshot.webp",
    "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffe28/69fe3b65856008242303dc78_image%20(5).png",
    "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffe28/6a0108c1f7660f5dce24795a_69f8c3fd3419118d8d43b3a0_image%20copy.png",
    "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffe28/69c6bbf95aee6f51ee0e08d5_istockphoto-1399565382-612x612%205.webp",
    "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffe28/67fc5da5f52442df00abe04d_Marana%20Leonard%20Headshot.webp",
]


def replace_avatars(html: str) -> tuple[str, int]:
    """Replace each old headshot URL (the main src= attribute) with the
    generated avatar URL. We also strip srcset/sizes for these since the
    generated avatars are already 1024x1024 single-size PNGs.
    """
    n = 0
    new = html
    for old_url, new_url in zip(OLD_HEADSHOT_URLS, AVATAR_URLS):
        # Locate the <img ...> tag whose src starts with the old URL. The tag
        # may have srcset/sizes after src, so we match the whole tag and
        # rewrite it cleanly with just src/loading/alt/class.
        # Escape regex metachars in URL.
        esc_old = re.escape(old_url)
        img_pattern = re.compile(
            r'<img\s+src="' + esc_old + r'"[^>]*?class="testimonial_client_headshot_visual"\s*/>',
            re.DOTALL,
        )
        replacement = (
            f'<img src="{new_url}" loading="lazy" alt="" '
            f'class="testimonial_client_headshot_visual"/>'
        )
        new, k = img_pattern.subn(replacement, new, count=1)
        n += k
    return new, n


def main() -> int:
    if not MARKETING_HTML.exists():
        print(f"ERROR: missing {MARKETING_HTML}")
        return 1

    html = MARKETING_HTML.read_text(encoding="utf-8")
    original_len = len(html)
    print(f"Read {MARKETING_HTML.name}: {original_len:,} bytes")

    html, n_logo = replace_logo(html)
    print(f"  Logo SVGs replaced: {n_logo} (expected 6)")

    html, n_avatar = replace_avatars(html)
    print(f"  Avatar headshots replaced: {n_avatar} (expected 5)")

    if n_logo != 6 or n_avatar != 5:
        print("WARNING: replacement counts differ from expectations — review.")

    MARKETING_HTML.write_text(html, encoding="utf-8")
    new_len = len(html)
    print(f"Wrote {MARKETING_HTML.name}: {new_len:,} bytes (delta {new_len - original_len:+,})")

    # Sync to dist/index.html — server.ts serves dist/index.html in production
    # mode, so it MUST mirror marketing-page.html exactly.
    if DIST_HTML.exists():
        DIST_HTML.write_text(html, encoding="utf-8")
        print(f"Synced dist/index.html: {DIST_HTML.stat().st_size:,} bytes")

    # Move stale HTML files out of the project root into dist-cleanup-backups.
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    moved = 0
    for stale in STALE_HTML:
        if stale.exists() and stale.is_file():
            target = BACKUP_DIR / stale.name
            try:
                shutil.move(str(stale), str(target))
                moved += 1
                print(f"  Moved {stale.relative_to(PROJECT)} -> dist-cleanup-backups/{stale.name}")
            except Exception as exc:
                print(f"  ERROR moving {stale}: {exc}")
    print(f"Moved {moved} stale HTML files into {BACKUP_DIR}")

    return 0


if __name__ == "__main__":
    sys.exit(main())