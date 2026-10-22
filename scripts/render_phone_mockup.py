"""Mockup hero CariKostKita — versi baru, bodi HP digambar sendiri.

Versi lama (`render_all_premium.composite_and_crop`) memasang UI aplikasi ke
dalam sebuah **foto bingkai HP** lewat transformasi perspektif:

    UI 1080x2400  ->  warp perspektif ke kuadrilateral di foto 2048x2048
                  ->  dipotong ke 990x1780  ->  dinaikkan lagi saat ditampilkan

Proses itu menurunkan ketajaman dua kali (downscale lalu upscale) dan
menambahkan haze "kilau kaca" yang memutihkan layar. Hasilnya mockup terlihat
buram, dan bingkai fotonya membawa pantulan serta garis tepi yang lembut.

Versi ini menggambar bodi HP secara prosedural mengikuti palet merek, lalu
menempelkan UI pada resolusi aslinya tanpa warp apa pun:

    UI 1080x2400  ->  bezel 46px  ->  badan 1172x2492  ->  WebP

Karena skripnya murni bentuk datar, hasilnya tajam pada ukuran berapa pun dan
ukuran berkasnya justru lebih kecil (warna datar termampatkan sangat baik).

Jalankan dari root project Landing Page:
    python scripts/render_phone_mockup.py
"""

import os
import sys

from PIL import Image, ImageDraw

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPTS_DIR)
os.chdir(os.path.join(SCRIPTS_DIR, ".."))

from render_all_premium import (  # noqa: E402  (setelah sys.path)
    render_hero_ui,
    render_install_step1,
    render_install_step2,
    render_install_step3,
    render_install_step4,
)

# --- Geometri -------------------------------------------------------------
UI_W, UI_H = 1080, 2400
BEZEL = 46          # tepi hitam di sekeliling layar
PAD_X, PAD_Y = 41, 34
BUTTON_PROTRUDE = 14

BODY_W = UI_W + BEZEL * 2
BODY_H = UI_H + BEZEL * 2
CANVAS_W = BODY_W + PAD_X * 2
CANVAS_H = BODY_H + PAD_Y * 2

OUTER_R = 152
INNER_R = 108

# --- Palet (mengikuti design system: warna datar, tanpa gradien) ----------
BODY = (23, 9, 9, 255)
BODY_EDGE = (255, 255, 255, 34)
SIDE_BUTTON = (44, 22, 21, 255)
CAMERA_RING = (58, 40, 38, 255)
CAMERA_LENS = (10, 4, 4, 255)
CAMERA_GLINT = (108, 94, 92, 255)

SUPERSAMPLE = 2
WEBP_QUALITY = 92


def rounded_mask(size, radius):
    """Mask rounded-rect dengan sudut di-supersample agar mulus."""
    w, h = size
    big = Image.new("L", (w * SUPERSAMPLE, h * SUPERSAMPLE), 0)
    ImageDraw.Draw(big).rounded_rectangle(
        [0, 0, w * SUPERSAMPLE - 1, h * SUPERSAMPLE - 1],
        radius=radius * SUPERSAMPLE,
        fill=255,
    )
    return big.resize((w, h), Image.LANCZOS)


def draw_camera(draw):
    """Lubang kamera di tengah atas layar (posisi tengah bebas dari teks bar)."""
    cx = PAD_X + BEZEL + UI_W // 2
    cy = PAD_Y + BEZEL + 58
    draw.ellipse([cx - 27, cy - 27, cx + 27, cy + 27], fill=CAMERA_RING)
    draw.ellipse([cx - 21, cy - 21, cx + 21, cy + 21], fill=CAMERA_LENS)
    draw.ellipse([cx - 13, cy - 15, cx - 1, cy - 3], fill=CAMERA_GLINT)


def draw_side_buttons(draw):
    """Tombol sisi di tepi kanan, sekadar tonjolan tipis agar siluet berbunyi."""
    x0 = PAD_X + BODY_W - 4
    x1 = x0 + BUTTON_PROTRUDE
    draw.rounded_rectangle([x0, PAD_Y + 520, x1, PAD_Y + 700], radius=7, fill=SIDE_BUTTON)
    draw.rounded_rectangle([x0, PAD_Y + 748, x1, PAD_Y + 908], radius=7, fill=SIDE_BUTTON)


def compose_phone(ui):
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    body_box = [PAD_X, PAD_Y, PAD_X + BODY_W - 1, PAD_Y + BODY_H - 1]
    draw.rounded_rectangle(body_box, radius=OUTER_R, fill=BODY)
    draw_side_buttons(draw)

    # Layar ditempel memakai mask bersudut halus, bukan warp perspektif.
    screen_mask = rounded_mask((UI_W, UI_H), INNER_R)
    canvas.paste(ui, (PAD_X + BEZEL, PAD_Y + BEZEL), screen_mask)

    # Garis rambut tipis: satu-satunya pemisah dari latar hero yang gelap.
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(body_box, radius=OUTER_R, outline=BODY_EDGE, width=3)
    draw_camera(draw)
    return canvas


def hero_ui(category):
    """Kanvas UI hero; proses pemasangan bodi dilakukan pemanggil."""
    ui = render_hero_ui(category)
    if ui.size != (UI_W, UI_H):
        raise RuntimeError(
            "Ukuran UI berubah: %s (diharapkan %sx%s)"
            % (ui.size, UI_W, UI_H)
        )
    return ui


def main():
    print("Merender mockup versi baru (%sx%s)..." % (CANVAS_W, CANVAS_H), flush=True)
    targets = [
        ("public/mockup-hero-semua.webp", lambda: hero_ui("Semua")),
        ("public/mockup-hero-putri.webp", lambda: hero_ui("Putri")),
        ("public/mockup-hero-putra.webp", lambda: hero_ui("Putra")),
        ("public/mockup-hero-campur.webp", lambda: hero_ui("Campur")),
        # Langkah instalasi adalah layar browser/sistem, jadi isinya memang
        # berbeda dari aplikasi -- hanya bingkai HP-nya yang diseragamkan.
        ("public/mockup-install-1.webp", render_install_step1),
        ("public/mockup-install-2.webp", render_install_step2),
        ("public/mockup-install-3.webp", render_install_step3),
        ("public/mockup-install-4.webp", render_install_step4),
    ]

    for path, builder in targets:
        image = compose_phone(builder())
        image.save(path, "WEBP", quality=WEBP_QUALITY, method=6)
        print(
            "  %-26s %sx%s  %d KB"
            % (
                os.path.basename(path),
                image.size[0],
                image.size[1],
                os.path.getsize(path) // 1024,
            )
        )
    print("Selesai.")


if __name__ == "__main__":
    main()
