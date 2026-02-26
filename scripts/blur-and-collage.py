#!/usr/bin/env python3
"""
Moja Ponudica portfolio collage: blur sensitive data and composite into one image.
Expects 5 PNGs in SOURCE_DIR: dashboard.png, lista-ponuda.png, profil.png, nova-ponuda.png, login.png.
Output: OUT_COLLAGE (single PNG).
Blur regions are defined as (left_pct, top_pct, width_pct, height_pct) of image dimensions.
"""
from pathlib import Path
from PIL import Image, ImageFilter

# Paths (relative to project root)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = PROJECT_ROOT / "NMSloux" / "assets" / "images" / "moja-ponudica"
OUT_COLLAGE = PROJECT_ROOT / "NMSloux" / "assets" / "images" / "moja-ponudica-portfolio-collage.png"

# Order and filenames for collage (actual files in folder)
IMAGE_ORDER = ["dashboard.png", "lista ponuda.png", "nova ponuda.png", "postavke.png", "login.png"]

# Blur regions per image: list of (left_pct, top_pct, width_pct, height_pct). 0-100.
# dashboard: no sensitive data
# lista ponuda: table body (client names, dates, amounts)
# postavke: company profile fields (address, OIB, IBAN, phone, email)
# nova ponuda: company info bar at top of form
# login: none
BLUR_REGIONS = {
    "dashboard.png": [],
    "lista ponuda.png": [
        (15, 38, 70, 45),   # table body: client, date, status, amount columns
    ],
    "nova ponuda.png": [
        (5, 18, 90, 8),     # company info bar (Tvrtka, OIB, Adresa, IBAN)
    ],
    "postavke.png": [
        (5, 28, 42, 38),    # left column: naziv, adresa, IBAN, telefon
        (52, 28, 43, 38),   # right column: OIB, email, logo area
    ],
    "login.png": [],
}

BLUR_RADIUS = 20
COLLAGE_ROW_HEIGHT = 380
COLLAGE_PADDING = 12
COLLAGE_BG = (18, 18, 24)


def px(img, left_pct, top_pct, width_pct, height_pct):
    w, h = img.size
    return (
        int(w * left_pct / 100),
        int(h * top_pct / 100),
        int(w * (left_pct + width_pct) / 100),
        int(h * (top_pct + height_pct) / 100),
    )


def blur_region(im, box):
    x1, y1, x2, y2 = box
    if x2 <= x1 or y2 <= y1:
        return
    crop = im.crop(box)
    blurred = crop.filter(ImageFilter.GaussianBlur(radius=BLUR_RADIUS))
    im.paste(blurred, box)


def process_image(path: Path, regions: list) -> Image.Image:
    im = path.open("rb")
    img = Image.open(im).convert("RGB")
    im.close()
    for left_pct, top_pct, width_pct, height_pct in regions:
        box = px(img, left_pct, top_pct, width_pct, height_pct)
        blur_region(img, box)
    return img


def build_collage(images: list[Image.Image]) -> Image.Image:
    # Layout: row1 = 3 images, row2 = 2 images (centered)
    n = len(images)
    row1_count = 3
    row2_count = 2
    assert n == 5
    # Scale to same height
    scaled = []
    for img in images:
        r = COLLAGE_ROW_HEIGHT / img.height
        new_w = int(img.width * r)
        scaled.append(img.resize((new_w, COLLAGE_ROW_HEIGHT), Image.Resampling.LANCZOS))
    # Row widths
    w1 = sum(s.width for s in scaled[:3]) + COLLAGE_PADDING * 2
    w2 = sum(s.width for s in scaled[3:5]) + COLLAGE_PADDING * 2
    total_w = max(w1, w2)
    total_h = COLLAGE_ROW_HEIGHT * 2 + COLLAGE_PADDING * 3
    out = Image.new("RGB", (total_w, total_h), COLLAGE_BG)
    # Row 1
    x = COLLAGE_PADDING
    for i in range(3):
        out.paste(scaled[i], (x, COLLAGE_PADDING))
        x += scaled[i].width + COLLAGE_PADDING
    # Row 2 (center the two images)
    row2_w = scaled[3].width + COLLAGE_PADDING + scaled[4].width
    x = (total_w - row2_w) // 2 + COLLAGE_PADDING
    y = COLLAGE_ROW_HEIGHT + COLLAGE_PADDING * 2
    out.paste(scaled[3], (x, y))
    x += scaled[3].width + COLLAGE_PADDING
    out.paste(scaled[4], (x, y))
    return out


def main():
    source = SOURCE_DIR
    if not source.is_dir():
        raise SystemExit(f"Source directory not found: {source}")
    missing = [f for f in IMAGE_ORDER if not (source / f).is_file()]
    if missing:
        raise SystemExit(f"Missing images in {source}: {missing}")

    processed = []
    for name in IMAGE_ORDER:
        path = source / name
        regions = BLUR_REGIONS.get(name, [])
        processed.append(process_image(path, regions))

    collage = build_collage(processed)
    OUT_COLLAGE.parent.mkdir(parents=True, exist_ok=True)
    collage.save(OUT_COLLAGE, "PNG", optimize=True)
    print(f"Saved: {OUT_COLLAGE}")


if __name__ == "__main__":
    main()
