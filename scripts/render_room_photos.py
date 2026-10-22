# -*- coding: utf-8 -*-
"""Gambar kamar kost untuk mockup hero.

Empat foto stok yang dipakai sebelumnya tidak konsisten: satu ruang tamu
mewah, satu kursi kuning yang clash dengan palet, dan satu foto dengan
dinding kosong yang besar di sisi kanan. Semuanya juga bukan kamar kost.

Gambar ini menggambar kamar kost sebagai ilustrasi datar memakai palet
Landing Page (dinding krem hangat, lantai kayu, aksen maroon/sage).
Gaya datar dipilih supaya serasi dengan UI mockup yang juga datar, dan
rasio gambarnya sudah pas untuk banner kartu tanpa perlu dipotong.

Jalankan::

    python scripts/render_room_photos.py
"""

from __future__ import annotations

import os

from PIL import Image, ImageDraw

#: Kanvas banner kartu kost (960x370 CSS px, diperbesar 2x).
W, H = 1920, 740
WALL_H = 556
FLOOR_Y = H - 76

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets"
)

#: Palet tiap kamar. Semua warna solid (tanpa gradien) sesuai brief desain.
ROOMS = [
    {
        "file": "kost-room-1.jpg",
        "name": "Kost Melati Indah Panam",
        "wall": (238, 226, 214),
        "wall_shade": (222, 207, 192),
        "floor": (200, 168, 134),
        "floor_shade": (178, 147, 115),
        "wood": (126, 92, 70),
        "mattress": (250, 247, 242),
        "duvet": (183, 106, 104),
        "duvet_dark": (154, 82, 81),
        "pillow": (255, 250, 244),
        "accent": (109, 8, 8),
        "plant": (94, 124, 88),
        "plant_dark": (72, 99, 68),
        "headboard": (150, 92, 90),
        "rug": (233, 214, 196),
        "window": (176, 202, 214),
    },
    {
        "file": "kost-room-2.jpg",
        "name": "Kost Sinar Jaya Marpoyan",
        "wall": (223, 228, 233),
        "wall_shade": (204, 211, 218),
        "floor": (192, 174, 152),
        "floor_shade": (170, 152, 131),
        "wood": (76, 88, 98),
        "mattress": (248, 249, 250),
        "duvet": (74, 96, 122),
        "duvet_dark": (56, 74, 96),
        "pillow": (250, 251, 252),
        "accent": (25, 60, 115),
        "plant": (86, 116, 92),
        "plant_dark": (65, 92, 70),
        "headboard": (88, 108, 132),
        "rug": (222, 226, 231),
        "window": (168, 196, 214),
    },
    {
        "file": "kost-room-3.jpg",
        "name": "Kost Anggrek Asri Riau",
        "wall": (226, 232, 222),
        "wall_shade": (208, 216, 204),
        "floor": (195, 165, 132),
        "floor_shade": (173, 144, 112),
        "wood": (106, 94, 78),
        "mattress": (251, 249, 244),
        "duvet": (120, 140, 116),
        "duvet_dark": (95, 113, 92),
        "pillow": (250, 250, 246),
        "accent": (18, 95, 60),
        "plant": (72, 116, 78),
        "plant_dark": (54, 90, 60),
        "headboard": (140, 158, 134),
        "rug": (236, 239, 231),
        "window": (186, 208, 196),
    },
    {
        "file": "kost-room-4.jpg",
        "name": "Kost Garuda Mandiri",
        "wall": (228, 226, 218),
        "wall_shade": (211, 208, 198),
        "floor": (188, 160, 128),
        "floor_shade": (166, 139, 109),
        "wood": (90, 86, 80),
        "mattress": (249, 248, 244),
        "duvet": (96, 116, 112),
        "duvet_dark": (74, 91, 88),
        "pillow": (250, 250, 247),
        "accent": (18, 78, 74),
        "plant": (82, 112, 86),
        "plant_dark": (62, 88, 66),
        "headboard": (116, 134, 130),
        "rug": (238, 237, 231),
        "window": (176, 200, 206),
    },
    {
        "file": "kost-room-5.jpg",
        "name": "Kost D'Gading Exclusive",
        "wall": (240, 232, 218),
        "wall_shade": (225, 215, 198),
        "floor": (206, 174, 134),
        "floor_shade": (184, 152, 114),
        "wood": (130, 96, 64),
        "mattress": (253, 250, 244),
        "duvet": (176, 132, 74),
        "duvet_dark": (146, 106, 58),
        "pillow": (255, 252, 246),
        "accent": (148, 106, 32),
        "plant": (96, 124, 84),
        "plant_dark": (74, 99, 65),
        "headboard": (196, 154, 96),
        "rug": (243, 233, 216),
        "window": (186, 204, 210),
    },
    {
        "file": "kost-room-6.jpg",
        "name": "Pavilion Sudirman Suite",
        "wall": (222, 216, 210),
        "wall_shade": (205, 198, 191),
        "floor": (152, 124, 102),
        "floor_shade": (132, 106, 86),
        "wood": (60, 48, 44),
        "mattress": (246, 243, 240),
        "duvet": (92, 56, 52),
        "duvet_dark": (70, 41, 38),
        "pillow": (248, 244, 240),
        "accent": (109, 8, 8),
        "plant": (80, 104, 82),
        "plant_dark": (60, 80, 64),
        "headboard": (116, 74, 68),
        "rug": (232, 227, 222),
        "window": (150, 176, 196),
    },
]


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_window(draw, spec, box):
    x0, y0, x1, y1 = box
    rounded(draw, box, 20, spec["window"], outline=(250, 248, 244), width=12)
    mid_x = (x0 + x1) // 2
    draw.line([(mid_x, y0), (mid_x, y1)], fill=(250, 248, 244), width=10)
    for i in range(1, 3):
        offset = (x1 - x0) * i // 3
        draw.line([(x0 + offset, y0), (x0 + offset, y1)], fill=(250, 248, 244), width=6)
    # Bayangan bingkai di sisi bawah
    draw.rectangle([x0, y1 - 14, x1, y1], fill=(236, 232, 226))


def draw_frame_art(draw, spec, x, y):
    rounded(draw, [x, y, x + 156, y + 196], 14, (250, 246, 240), outline=spec["wood"], width=10)
    rounded(draw, [x + 30, y + 30, x + 126, y + 166], 8, spec["duvet"])


def draw_shelf(draw, spec, x, plank_y):
    """Rak buku di dinding: papan rak + buku di atasnya."""
    colors = [spec["accent"], spec["duvet"], spec["plant"], spec["duvet_dark"]]
    for i, color in enumerate(colors):
        bx = x + 26 + i * 56
        draw.rectangle([bx, plank_y - 84, bx + 42, plank_y], fill=color)
    rounded(draw, [x, plank_y, x + 258, plank_y + 24], 10, spec["wood"])


def draw_plant(draw, spec, cx, base_y):
    """Pot tanaman dalam pot, daun di atasnya."""
    pot_w, pot_h = 120, 96
    rounded(draw, [cx - pot_w // 2, base_y - pot_h, cx + pot_w // 2, base_y], 12, spec["accent"])
    rounded(
        draw,
        [cx - pot_w // 2 - 8, base_y - pot_h - 18, cx + pot_w // 2 + 8, base_y - pot_h + 12],
        8,
        spec["accent"],
    )
    for dx, dy, w, h, color in (
        (-52, -196, 50, 118, spec["plant"]),
        (8, -228, 54, 130, spec["plant_dark"]),
        (56, -170, 46, 104, spec["plant"]),
        (-14, -168, 48, 110, spec["plant_dark"]),
    ):
        rounded(draw, [cx + dx, base_y + dy, cx + dx + w, base_y + dy + h], 24, color)


def draw_lamp(draw, spec, cx, base_y):
    """Lampu meja: alas + tiang + kap."""
    draw.rectangle([cx - 26, base_y - 14, cx + 26, base_y], fill=spec["wood"])
    draw.rectangle([cx - 6, base_y - 86, cx + 6, base_y - 10], fill=spec["wood"])
    draw.polygon(
        [(cx - 52, base_y - 86), (cx + 52, base_y - 86), (cx + 34, base_y - 158), (cx - 34, base_y - 158)],
        fill=spec["accent"],
    )


def draw_nightstand(draw, spec, x, base_y):
    rounded(draw, [x, base_y - 214, x + 208, base_y - 14], 16, spec["wood"])
    rounded(draw, [x + 32, base_y - 168, x + 176, base_y - 96], 10, spec["wall_shade"])
    draw_lamp(draw, spec, x + 104, base_y - 214)


def draw_bed(draw, spec, x):
    """Ranjang samping: sandaran kepala di kiri, kasur memanjang ke kanan."""
    length = 880
    mattress_top = FLOOR_Y - 200
    mattress_h = 78
    head_w = 232
    head_top = mattress_top - 186

    # Bayangan lantai
    rounded(draw, [x - 30, FLOOR_Y - 30, x + length + 30, FLOOR_Y + 26], 30, spec["floor_shade"])

    # Sandaran kepala (dulu lebih tinggi sehingga bantal menumpuk di atasnya)
    rounded(draw, [x, head_top, x + head_w, mattress_top + 30], 20, spec["wood"])
    rounded(
        draw,
        [x + 20, head_top + 20, x + head_w - 20, mattress_top + 8],
        14,
        spec["headboard"],
    )

    # Rangka kasur
    rounded(draw, [x, mattress_top, x + length, mattress_top + mattress_h + 38], 16, spec["wood"])
    # Matras + seprai putih
    rounded(draw, [x + 8, mattress_top + 4, x + length - 8, mattress_top + mattress_h], 12, spec["mattress"])
    # Selimut
    duvet_x = x + head_w + 40
    rounded(
        draw,
        [duvet_x, mattress_top + 2, x + length - 4, mattress_top + mattress_h + 16],
        12,
        spec["duvet"],
    )
    # Lipatan selimut di sisi kiri
    rounded(
        draw,
        [duvet_x, mattress_top + 2, duvet_x + 76, mattress_top + mattress_h + 16],
        12,
        spec["duvet_dark"],
    )
    # Lipatan selimut di kaki kasur
    rounded(
        draw,
        [x + length - 156, mattress_top + 2, x + length - 4, mattress_top + mattress_h + 16],
        12,
        spec["duvet_dark"],
    )
    # Bantal: diletakkan di atas kasur, di depan sandaran kepala
    rounded(draw, [x + 48, mattress_top - 62, x + 182, mattress_top + 16], 24, spec["pillow"])
    # Kaki kasur
    for lx in (x + 52, x + length - 96):
        draw.rectangle([lx, mattress_top + mattress_h + 24, lx + 44, FLOOR_Y - 4], fill=spec["wood"])


def render_room(spec) -> Image:
    image = Image.new("RGB", (W, H), spec["wall"])
    draw = ImageDraw.Draw(image)

    # Dinding + bayangan garis antara dinding dan lantai
    draw.rectangle([0, 0, W, WALL_H], fill=spec["wall"])
    draw.rectangle([0, WALL_H - 40, W, WALL_H], fill=spec["wall_shade"])
    # Lantai
    draw.rectangle([0, WALL_H, W, H], fill=spec["floor"])
    draw.rectangle([0, WALL_H, W, WALL_H + 12], fill=spec["floor_shade"])

    # Elemen dinding
    draw_window(draw, spec, (132, 84, 496, 402))
    draw_frame_art(draw, spec, 1178, 118)
    draw_shelf(draw, spec, 880, 322)

    # Karpet di bawah ranjang
    rounded(draw, [286, FLOOR_Y - 52, 1584, FLOOR_Y + 28], 60, spec["rug"])

    # Ranjang, meja, tanaman
    draw_bed(draw, spec, 430)
    draw_nightstand(draw, spec, 1424, FLOOR_Y)
    draw_plant(draw, spec, 1794, FLOOR_Y)

    return image


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    for spec in ROOMS:
        image = render_room(spec)
        path = os.path.join(OUT_DIR, spec["file"])
        image.save(path, "JPEG", quality=92, optimize=True, progressive=True)
        print("  {:26} {}  {} KB".format(
            spec["file"], image.size, round(os.path.getsize(path) / 1024, 1)))
    print("tulis ->", OUT_DIR)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
