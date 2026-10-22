# -*- coding: utf-8 -*-
"""Konversi aset gambar raster Landing Page ke WebP.

Pipeline aset gambar:

1. ``render_all_premium.py`` merender mockup dan langsung menulis WebP
   ke ``public/`` (tidak ada master PNG di repo).
2. Skrip ini mengonversi aset raster yang tidak dihasilkan generator,
   yaitu foto latar hero.

Aset mockup (render UI dengan teks kecil) dikompres lossy WebP. WebP
memberi ukuran jauh lebih kecil untuk kualitas visual yang nyaris sama
pada ukuran tampil di layar (mockup 990x1780 ditampilkan hanya
320x576 piksel CSS, jadi di-downscale ~3x).

Quality dipisah per jenis aset:

- render UI mockup : 90 (teks tetap tajam)
- foto latar hero : 82 (di atasnya ada overlay maroon 66%, jadi artefak
                     tidak terlihat; hemat ~65%)

Berkas PNG asli dihapus setelah versi WebP dibuat.

Pakai::

    python scripts/optimize_images.py            # konversi + hapus PNG
    python scripts/optimize_images.py --keep     # konversi, simpan PNG
"""

from __future__ import annotations

import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover - dependensi lingkungan
    print("Pillow belum terpasang. Jalankan: pip install Pillow")
    sys.exit(1)

PUBLIC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")

#: Aset raster yang masih perlu dikonversi (nilai = kualitas WebP).
#: Mockup sudah ditulis WebP langsung oleh ``render_all_premium.py``.
ASSETS: dict[str, int] = {
    "landmark-pekanbaru.png": 82,
}


def convert(name: str, quality: int, keep_original: bool) -> tuple[int, int]:
    """Konversi satu aset PNG -> WebP. Mengembalikan (ukuran png, webp)."""
    src = os.path.join(PUBLIC, name)
    dst = os.path.join(PUBLIC, os.path.splitext(name)[0] + ".webp")
    if not os.path.exists(src):
        raise FileNotFoundError(src)

    before = os.path.getsize(src)
    image = Image.open(src)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA")
    image.save(dst, "WEBP", quality=quality, method=6)
    after = os.path.getsize(dst)

    if not keep_original:
        os.remove(src)
    return before, after


def main() -> int:
    parser = argparse.ArgumentParser(description="Konversi aset gambar ke WebP.")
    parser.add_argument(
        "--keep",
        action="store_true",
        help="Simpan berkas PNG asli (default: hapus setelah konversi).",
    )
    args = parser.parse_args()

    if not os.path.isdir(PUBLIC):
        print("Folder public tidak ditemukan:", PUBLIC)
        return 1

    total_before = 0
    total_after = 0
    lines = ["{:<28} {:>9} {:>9} {:>8}".format("aset", "PNG", "WebP", "hemat")]

    for name, quality in ASSETS.items():
        if not os.path.exists(os.path.join(PUBLIC, name)):
            # Sudah terkonversi (PNG dihapus pada pemanggilan sebelumnya).
            continue
        before, after = convert(name, quality, args.keep)
        total_before += before
        total_after += after
        lines.append(
            "{:<28} {:>8}K {:>8}K {:>7}%".format(
                name, round(before / 1024), round(after / 1024),
                round((1 - after / before) * 100),
            )
        )

    if total_before:
        lines.append("")
        lines.append(
            "TOTAL: {}K -> {}K (hemat {}%)".format(
                round(total_before / 1024),
                round(total_after / 1024),
                round((1 - total_after / total_before) * 100),
            )
        )

    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
