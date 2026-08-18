#!/usr/bin/env python3
"""Encode demo slides to MP4 using imageio (bundled ffmpeg)."""
import glob
import os
import sys

import imageio.v2 as imageio

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOT_DIR = os.path.join(ROOT, "docs", "demo-video-slides")
OUT_MP4 = os.path.join(ROOT, "docs", "Expat_Concierge_V3_Demo.mp4")
SEC_PER_SLIDE = float(os.environ.get("SEC_PER_SLIDE", "4"))

slides = sorted(glob.glob(os.path.join(SHOT_DIR, "slide-*.png")))
if not slides:
    print("No slides in", SHOT_DIR)
    sys.exit(1)

print(f"Encoding {len(slides)} slides → {OUT_MP4}")
writer = imageio.get_writer(OUT_MP4, fps=1 / SEC_PER_SLIDE, codec="libx264", quality=8, pixelformat="yuv420p")
for path in slides:
    writer.append_data(imageio.imread(path))
writer.close()

size_mb = os.path.getsize(OUT_MP4) / (1024 * 1024)
print(f"✅ Done: {OUT_MP4} ({size_mb:.1f} MB)")
