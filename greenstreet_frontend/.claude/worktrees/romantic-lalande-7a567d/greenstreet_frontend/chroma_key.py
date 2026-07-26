"""Remove green chroma key from generated logos, producing transparent PNGs."""
import sys
import os
import numpy as np
from PIL import Image


def chroma_remove(src_path: str, dst_path: str) -> dict:
    img = Image.open(src_path).convert('RGB')
    arr = np.array(img).astype(np.int16)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    # How 'green-like' is this pixel: high when G dominates over R+B average
    green_dom = g - (r + b) / 2
    green_dom = np.clip(green_dom, 0, 255)

    # Soft threshold: clearly green (>30 green_dom) becomes fully transparent,
    # near the edge partial alpha to keep anti-aliased logo edges smooth.
    threshold = 30
    softness = 50
    bg_alpha = np.clip((green_dom - threshold) / softness * 255, 0, 255).astype(np.uint8)
    fg_alpha = 255 - bg_alpha  # 0 = transparent (green), 255 = opaque (logo)

    rgba = np.dstack([arr.astype(np.uint8), fg_alpha])
    out = Image.fromarray(rgba, 'RGBA')
    out.save(dst_path, 'PNG')

    a = fg_alpha
    return {
        'size': img.size,
        'transparent_px': int((a == 0).sum()),
        'opaque_px': int((a == 255).sum()),
        'partial_px': int(((a > 0) & (a < 255)).sum()),
        'out_bytes': os.path.getsize(dst_path),
    }


if __name__ == '__main__':
    src = sys.argv[1]
    dst = sys.argv[2]
    info = chroma_remove(src, dst)
    print(info)