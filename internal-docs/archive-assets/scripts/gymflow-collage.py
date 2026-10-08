#!/usr/bin/env python3
"""
GymFlow portfolio collage: composite 3 screenshots into one image (no blur).
Softify style: one collage per project.
"""
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = PROJECT_ROOT / "NMSloux" / "assets" / "images" / "gymflow"
OUT_COLLAGE = PROJECT_ROOT / "NMSloux" / "assets" / "images" / "gymflow-portfolio-collage.png"

IMAGE_ORDER = ["landing.png", "vlasnik.png", "clan.png"]
COLLAGE_ROW_HEIGHT = 380
COLLAGE_PADDING = 12
COLLAGE_BG = (18, 18, 24)


def main():
    if not SOURCE_DIR.is_dir():
        raise SystemExit(f"Source directory not found: {SOURCE_DIR}")
    missing = [f for f in IMAGE_ORDER if not (SOURCE_DIR / f).is_file()]
    if missing:
        raise SystemExit(f"Missing images in {SOURCE_DIR}: {missing}")

    images = []
    for name in IMAGE_ORDER:
        path = SOURCE_DIR / name
        img = Image.open(path).convert("RGB")
        r = COLLAGE_ROW_HEIGHT / img.height
        new_w = int(img.width * r)
        images.append(img.resize((new_w, COLLAGE_ROW_HEIGHT), Image.Resampling.LANCZOS))

    total_w = sum(im.width for im in images) + COLLAGE_PADDING * (len(images) + 1)
    total_h = COLLAGE_ROW_HEIGHT + COLLAGE_PADDING * 2
    out = Image.new("RGB", (total_w, total_h), COLLAGE_BG)
    x = COLLAGE_PADDING
    for im in images:
        out.paste(im, (x, COLLAGE_PADDING))
        x += im.width + COLLAGE_PADDING

    OUT_COLLAGE.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT_COLLAGE, "PNG", optimize=True)
    print(f"Saved: {OUT_COLLAGE}")


if __name__ == "__main__":
    main()
