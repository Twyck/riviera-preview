"""Gera as versões responsivas (WebP) das imagens de assets-src/ em public/img/.

Uso: python3 scripts/build-images.py
Fonte: fotos, cartuns e logo extraídos do cardápio oficial do Riviera Bar
(PDF público no Linktree oficial @rivierabarsp). PNGs mantêm transparência.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = ROOT / "public" / "img"
OUT.mkdir(parents=True, exist_ok=True)

WIDTHS = [480, 800, 1200, 1800]
manifest = {}

for f in sorted(list(SRC.glob("*.jpg")) + list(SRC.glob("*.png"))):
    im = ImageOps.exif_transpose(Image.open(f))
    alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    im = im.convert("RGBA" if alpha else "RGB")
    w, h = im.size
    sizes = sorted(set([x for x in WIDTHS if x < w] + [min(w, WIDTHS[-1])]))
    for tw in sizes:
        th = round(h * tw / w)
        im.resize((tw, th), Image.LANCZOS).save(
            OUT / f"{f.stem}-{tw}.webp", "WEBP", quality=80 if alpha else 74, method=6
        )
    manifest[f.stem] = {"w": w, "h": h, "sizes": sizes}
    print(f.stem, w, h, sizes, "alpha" if alpha else "")

# Open Graph 1200x630: vermelho da marca + foto + logo
og = Image.new("RGB", (1200, 630), (236, 29, 38))
photo = ImageOps.fit(Image.open(SRC / "espaguete.jpg").convert("RGB"), (520, 630), centering=(0.5, 0.35))
og.paste(photo, (680, 0))
logo = Image.open(SRC / "logo-white.png")
logo.thumbnail((560, 260))
og.paste(logo, (60, 185), logo)
og.save(ROOT / "public" / "og-riviera.jpg", "JPEG", quality=84, optimize=True)

(ROOT / "src" / "images.json").write_text(json.dumps(manifest, indent=2))
