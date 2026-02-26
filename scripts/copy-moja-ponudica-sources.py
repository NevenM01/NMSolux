#!/usr/bin/env python3
"""Copy 5 Moja Ponudica screenshots from Cursor assets into project if possible."""
from pathlib import Path
import shutil

PROJECT_ROOT = Path(__file__).resolve().parent.parent
# Cursor stores uploaded images here (adjust if your project ID differs)
CURSOR_ASSETS = Path.home() / ".cursor" / "projects" / "c-Users-Neven-Desktop-test-NMSolux" / "assets"
WORKSPACE_ASSETS = PROJECT_ROOT / "assets"
DEST = PROJECT_ROOT / "NMSloux" / "assets" / "images" / "moja-ponudica"

# Substring in filename -> destination name
PATTERNS = [
    ("21_41_55", "dashboard.png"),       # dashboard
    ("ponude-21_41_43", "lista-ponuda.png"),
    ("profil-21_42_19", "profil.png"),
    ("nova-ponuda-21_36_24", "nova-ponuda.png"),
    ("login-21_42_42", "login.png"),
]


def find_assets_dir():
    for d in (CURSOR_ASSETS, WORKSPACE_ASSETS):
        if d.is_dir():
            return d
    return None


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    assets_dir = find_assets_dir()
    if not assets_dir:
        print("Cursor assets dir not found. Copy the 5 screenshots manually into:", DEST)
        return
    files = [f for f in assets_dir.rglob("*mojaponudica*") if f.is_file()] if assets_dir else []
    copied = 0
    for f in files:
        name = f.name
        for pattern, dest_name in PATTERNS:
            if pattern in name:
                dest_path = DEST / dest_name
                if not dest_path.exists() or f.stat().st_mtime > dest_path.stat().st_mtime:
                    shutil.copy2(f, dest_path)
                    print("Copied", dest_name)
                    copied += 1
                break
    if copied == 0 and len(files) < 5:
        print("No matching files in", assets_dir, "- copy the 5 screenshots manually into:", DEST)
    elif copied > 0:
        print("Ready. Run: python scripts/blur-and-collage.py")


if __name__ == "__main__":
    main()
