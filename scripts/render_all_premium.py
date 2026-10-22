"""
Generator mockup 3D CariKostKita.

Render UI aplikasi ke dalam bingkai HP (assets/mockup-frame.png) memakai
transformasi perspektif, lalu memotong hasilnya tightly ke bodi HP.

Kebutuhan:
    pip install pillow numpy

Jalankan dari root project Landing Page:
    python scripts/render_all_premium.py

Catatan perbaikan:
  - mask layar dihitung dari kuadrilateral perspektif, jadi berkas
    `screen_mask.png` terpisah tidak lagi diperlukan;
  - kapsul fasilitas diukur dari lebar teks sebenarnya (dulu lebarnya
    tebakan `len(tag) * 18` sehingga menyisakan kotak kosong);
  - harga dan "/bln" tidak lagi bertumpuk;
  - navigasi bawah diangkat agar tidak terpotong tepi layar;
  - nomor versi dan ukuran APK mengikuti rilis terkini.
"""

import os
import shutil

import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# Konstanta konten mockup (harus ikut rilis yang sedang Accuracy)
# ---------------------------------------------------------------------------
APP_VERSION = "1.1.1"
APK_SIZE = "3.3 MB"
APK_FILE = "CariKostKita-v1.1.1-release.apk"
CITY = "Pekanbaru"
CITY_SHORT = "Pekanbaru"

# Perspektif: kuadrilateral layar pada bingkai mockup.png (2048x2048).
SCREEN_QUAD = [
    (576, 173),    # TL
    (1267, 272),   # TR
    (1511, 1798),  # BR
    (845, 1905),   # BL
]
CROP_BOX = (550, 140, 1540, 1920)

CANVAS_W, CANVAS_H = 1080, 2400
NAV_TOP = 1990
HOME_INDICATOR_Y = 2255

BURGUNDY = (109, 8, 8, 255)
INK = (38, 27, 25, 255)
MUTED = (110, 98, 92, 255)
MUTED_SOFT = (130, 118, 112, 255)
SURFACE = (255, 255, 255, 255)
CARD_LINE = (225, 220, 212, 255)
TAG_FILL = (245, 240, 232, 255)
GREEN = (37, 211, 102, 255)
GREEN_DARK = (22, 101, 52, 255)
GREEN_SOFT = (220, 252, 231, 255)
PAGE_BG = (250, 248, 245, 255)


#: Kualitas WebP untuk mockup. 90 membuat teks kecil tetap tajam
#: pada ukuran tampil 320px (render 990px di-downscale ~3x).
WEBP_QUALITY = 90


def get_font(size, bold=False):
    names = ["segoeuib.ttf", "arialbd.ttf"] if bold else ["segoeui.ttf", "arial.ttf"]
    for font_name in names:
        font_path = os.path.join(r"C:\Windows\Fonts", font_name)
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def text_width(draw, text, font):
    """Lebar teks sebenarnya (dipakai untuk menentukan ukuran kapsul)."""
    try:
        return int(draw.textlength(text, font=font))
    except Exception:
        return int(len(text) * font.size * 0.55)


def find_coeffs(pa, pb):
    matrix = []
    for p_dst, p_src in zip(pa, pb):
        x, y = p_dst
        u, v = p_src
        matrix.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        matrix.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    a = np.array(matrix, dtype=float)
    b = np.array(pb).reshape(8)
    res = np.dot(np.linalg.inv(a), b)
    return np.array(res).reshape(8)


def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)


def load_and_cover_photo(photo_path, target_w, target_h, radius=28):
    if not os.path.exists(photo_path):
        return Image.new("RGBA", (target_w, target_h), (210, 190, 175, 255))
    im = Image.open(photo_path).convert("RGBA")
    src_ratio = im.width / im.height
    dst_ratio = target_w / target_h
    if src_ratio > dst_ratio:
        new_h = target_h
        new_w = int(target_h * src_ratio)
    else:
        new_w = target_w
        new_h = int(target_w / src_ratio)
    im = im.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    im = im.crop((left, top, left + target_w, top + target_h))

    mask = Image.new("L", (target_w, target_h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, target_w, target_h + radius], radius=radius, fill=255)
    im.putalpha(mask)
    return im


def draw_status_bar(draw, W):
    f_time = get_font(36, bold=True)
    f_status = get_font(30, bold=True)
    draw.text((110, 92), "09:41", font=f_time, fill=(30, 22, 20, 255))
    draw.text((860, 94), "5G  100%", font=f_status, fill=(30, 22, 20, 255))


def draw_bottom_nav(draw, W, H, active_tab="Beranda"):
    """Navigasi bawah.

    Dulu digambar mulai y=2100 sehingga terlalu dekat tepi bawah layar dan terpotong
    mask. Sekarang digambar lebih ke atas supaya ikon dan labelnya utuh.
    """
    nav_top = NAV_TOP
    draw.rectangle([0, nav_top - 6, W, nav_top], fill=(0, 0, 0, 12))
    draw.rectangle([0, nav_top, W, H], fill=(255, 255, 255, 255))
    draw.line([0, nav_top, W, nav_top], fill=(230, 225, 218, 255), width=2)

    f_nav = get_font(26, bold=True)
    items = [
        ("Beranda", 135),
        ("Favorit", 405),
        ("Chat", 675),
        ("Profil", 945),
    ]
    for label, cx in items:
        is_act = label == active_tab
        color = BURGUNDY if is_act else (145, 134, 128, 255)
        if label == "Beranda":
            draw.polygon([(cx, nav_top + 26), (cx - 24, nav_top + 46), (cx + 24, nav_top + 46)], fill=color)
            draw.rectangle([cx - 16, nav_top + 44, cx + 16, nav_top + 66], fill=color)
            draw.rectangle([cx - 6, nav_top + 52, cx + 6, nav_top + 66], fill=(255, 255, 255, 255))
        elif label == "Favorit":
            draw.ellipse([cx - 18, nav_top + 32, cx - 2, nav_top + 48], fill=color)
            draw.ellipse([cx + 2, nav_top + 32, cx + 18, nav_top + 48], fill=color)
            draw.polygon([(cx - 18, nav_top + 40), (cx + 18, nav_top + 40), (cx, nav_top + 62)], fill=color)
        elif label == "Chat":
            draw_rounded_rect(draw, [cx - 20, nav_top + 32, cx + 20, nav_top + 56], radius=8, fill=color)
            draw.polygon([(cx - 8, nav_top + 56), (cx - 16, nav_top + 64), (cx + 2, nav_top + 56)], fill=color)
        else:
            draw.ellipse([cx - 12, nav_top + 30, cx + 12, nav_top + 50], fill=color)
            draw.ellipse([cx - 20, nav_top + 52, cx + 20, nav_top + 76], fill=color)

        w = text_width(draw, label, f_nav)
        draw.text((cx - w // 2, nav_top + 84), label, font=f_nav, fill=color)

    draw_rounded_rect(draw, [390, HOME_INDICATOR_Y, 690, HOME_INDICATOR_Y + 14], radius=7, fill=(160, 150, 145, 255))


def draw_price(draw, x_right, y, price, unit="/bln"):
    """Harga + satuan tanpa tumpang tindih.

    Lebar harga diukur dari font, lalu satuan diletakkan tepat setelahnya.
    """
    f_price = get_font(44, bold=True)
    f_unit = get_font(30, bold=False)
    w_price = text_width(draw, price, f_price)
    w_unit = text_width(draw, unit, f_unit)
    price_x = x_right - w_price - w_unit - 8
    draw.text((price_x, y), price, font=f_price, fill=BURGUNDY)
    draw.text((price_x + w_price + 8, y + 12), unit, font=f_unit, fill=MUTED_SOFT)


def draw_facility_tags(draw, x, y, tags, font):
    """Kapsul fasilitas dengan lebar mengikuti teksnya."""
    tag_x = x
    for tag in tags:
        tw = text_width(draw, tag, font) + 32
        draw_rounded_rect(draw, [tag_x, y, tag_x + tw, y + 58], radius=14, fill=TAG_FILL)
        draw.text((tag_x + 16, y + 15), tag, font=font, fill=(90, 78, 72, 255))
        tag_x += tw + 12
    return tag_x


def render_hero_ui(active_category="Semua"):
    W, H = CANVAS_W, CANVAS_H
    ui = Image.new("RGBA", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(ui)

    draw_status_bar(draw, W)

    f_brand = get_font(52, bold=True)
    f_sub = get_font(30, bold=False)
    f_search = get_font(36, bold=False)
    f_pill = get_font(34, bold=True)
    f_sec_title = get_font(44, bold=True)
    f_sec_link = get_font(32, bold=True)
    f_card_title = get_font(42, bold=True)
    f_card_price = get_font(44, bold=True)
    f_card_sub = get_font(30, bold=False)
    f_card_tag = get_font(26, bold=True)

    # Header
    h_top = 185
    draw_rounded_rect(draw, [60, h_top, 135, h_top + 75], radius=18, fill=BURGUNDY)
    draw.rectangle([82, h_top + 22, 112, h_top + 62], fill=(255, 255, 255, 255))
    draw.rectangle([92, h_top + 42, 102, h_top + 62], fill=BURGUNDY)
    draw.polygon([(75, h_top + 22), (97, h_top + 5), (119, h_top + 22)], fill=(255, 255, 255, 255))

    draw.text((155, h_top + 4), "CariKostKita", font=f_brand, fill=BURGUNDY)
    draw.text(
        (157, h_top + 60),
        f"{CITY_SHORT}, Riau • 500+ Kost Pilihan",
        font=f_sub,
        fill=(125, 112, 106, 255),
    )

    # Notifikasi
    draw_rounded_rect(draw, [940, h_top, 1020, h_top + 80], radius=40, fill=(255, 255, 255, 255), outline=(225, 218, 208, 255), width=2)
    draw.ellipse([968, h_top + 28, 992, h_top + 52], fill=BURGUNDY)
    draw.ellipse([990, h_top + 22, 1002, h_top + 34], fill=(220, 38, 38, 255))

    # Pencarian
    s_top = 295
    draw_rounded_rect(draw, [60, s_top, 1020, s_top + 98], radius=26, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)
    draw.ellipse([95, s_top + 33, 121, s_top + 59], outline=(140, 130, 125, 255), width=4)
    draw.line([117, s_top + 55, 130, s_top + 68], fill=(140, 130, 125, 255), width=5)
    draw.text((150, s_top + 30), "Cari kost dekat UNRI, UIR, Panam...", font=f_search, fill=(150, 140, 135, 255))
    draw_rounded_rect(draw, [925, s_top + 13, 1005, s_top + 85], radius=18, fill=BURGUNDY)
    draw.rectangle([948, s_top + 38, 982, s_top + 42], fill=(255, 255, 255, 255))
    draw.rectangle([953, s_top + 49, 977, s_top + 53], fill=(255, 255, 255, 255))

    # Kategori
    cat_top = 415
    cur_x = 60
    for cat in ["Semua", "Putri", "Putra", "Campur"]:
        is_act = cat == active_category
        btn_w = 220
        if is_act:
            draw_rounded_rect(draw, [cur_x, cat_top, cur_x + btn_w, cat_top + 82], radius=22, fill=BURGUNDY)
            draw.text((cur_x + 50, cat_top + 22), cat, font=f_pill, fill=(255, 255, 255, 255))
        else:
            draw_rounded_rect(draw, [cur_x, cat_top, cur_x + btn_w, cat_top + 82], radius=22, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)
            draw.text((cur_x + 50, cat_top + 22), cat, font=f_pill, fill=(70, 58, 55, 255))
        cur_x += btn_w + 20

    # Judul section
    heading = f"Pilihan Kost {active_category}" if active_category != "Semua" else f"Kost Populer di {CITY}"
    sec_top = 520
    draw.text((60, sec_top), heading, font=f_sec_title, fill=INK)
    draw.text((850, sec_top + 8), "Lihat Semua >", font=f_sec_link, fill=BURGUNDY)

    all_listings = {
        "Semua": [
            ("Kost Melati Indah Panam", "Rp 700.000", "KOST PUTRI", "4.9 (48)", "Panam, Dekat Kampus UNRI (300m)", ["WiFi Cepat", "K. Mandi Dalam", "AC / Kipas", "Parkir Luas"], "assets/kost-room-1.jpg", (109, 8, 8)),
            ("Kost Sinar Jaya Marpoyan", "Rp 640.000", "KOST PUTRA", "4.8 (39)", "Marpoyan Damai, Dekat UIR (500m)", ["Kasur Busa", "Lemari", "Free Listrik", "Dapur"], "assets/kost-room-2.jpg", (25, 60, 115)),
        ],
        "Putri": [
            ("Kost Melati Indah Panam", "Rp 700.000", "KOST PUTRI", "4.9 (48)", "Panam, Dekat Kampus UNRI (300m)", ["WiFi Cepat", "K. Mandi Dalam", "AC / Kipas", "Parkir Luas"], "assets/kost-room-1.jpg", (109, 8, 8)),
            ("Kost Anggrek Asri Riau", "Rp 800.000", "KOST PUTRI", "4.9 (27)", "Sukajadi, Dekat Pusat Kota (200m)", ["Security 24J", "WiFi 50M", "Dapur Bersih", "CCTV"], "assets/kost-room-3.jpg", (109, 8, 8)),
        ],
        "Putra": [
            ("Kost Sinar Jaya Marpoyan", "Rp 640.000", "KOST PUTRA", "4.8 (39)", "Marpoyan Damai, Dekat UIR (500m)", ["Kasur Busa", "Lemari", "Free Listrik", "Dapur"], "assets/kost-room-2.jpg", (25, 60, 115)),
            ("Kost Garuda Mandiri", "Rp 550.000", "KOST PUTRA", "4.7 (31)", "Tuah Madani, Area UNRI Rimbo Panjang", ["Kasur", "Lemari", "Parkir Motor", "Air Bersih"], "assets/kost-room-3.jpg", (25, 60, 115)),
        ],
        "Campur": [
            ("Kost D'Gading Exclusive", "Rp 1.200.000", "KOST CAMPUR", "4.9 (53)", "Bukit Raya, Dekat Jl. Sudirman", ["AC Dingin", "Water Heater", "Kasur King", "Parkir Mobil"], "assets/kost-room-4.jpg", (18, 95, 60)),
            ("Pavilion Sudirman Suite", "Rp 1.400.000", "KOST CAMPUR", "5.0 (18)", "Tengah Kota Pekanbaru, Akses Mall", ["Fully Furnished", "Smart Lock", "Balkon", "WiFi 100M"], "assets/kost-room-1.jpg", (18, 95, 60)),
        ],
    }
    cards = all_listings.get(active_category, all_listings["Semua"])

    card_w = 960
    card_h = 655
    photo_h = 370

    # Kartu dimulai di bawah judul section. Dulu foto dimulai di 560 sehingga
    # menutupi judul "Kost Populer di Pekanbaru" dan link "Lihat Semua".
    for index, card_y in enumerate((620, 1300)):
        entry = cards[index]
        name, price, tag, rating, location, facilities, photo, tag_color = entry

        draw_rounded_rect(draw, [60, card_y, 60 + card_w, card_y + card_h], radius=34, fill=SURFACE, outline=CARD_LINE, width=2)
        photo_img = load_and_cover_photo(photo, card_w, photo_h, radius=34)
        ui.paste(photo_img, (60, card_y), photo_img)

        # Pill kategori diukur dari lebar teksnya supaya tidak ada teks yang
        # menyentuh tepi pill.
        tag_w = text_width(draw, tag, f_card_tag) + 50
        draw_rounded_rect(draw, [90, card_y + 25, 90 + tag_w, card_y + 88], radius=16, fill=tag_color + (240,))
        draw.text((115, card_y + 38), tag, font=f_card_tag, fill=(255, 255, 255, 255))

        rating_w = text_width(draw, rating, f_card_tag) + 44
        draw_rounded_rect(draw, [990 - rating_w, card_y + 25, 990, card_y + 88], radius=16, fill=(255, 255, 255, 245))
        draw.text((990 - rating_w + 22, card_y + 38), rating, font=f_card_tag, fill=BURGUNDY)

        t_y = card_y + 390
        draw.text((90, t_y), name, font=f_card_title, fill=INK)
        draw_price(draw, 990, t_y - 2, price)
        draw.text((90, t_y + 55), location, font=f_card_sub, fill=MUTED)
        draw_facility_tags(draw, 90, t_y + 110, facilities, f_card_tag)

    draw_bottom_nav(draw, W, H, "Beranda")
    return ui


def render_install_step1():
    W, H = CANVAS_W, CANVAS_H
    ui = Image.new("RGBA", (W, H), (248, 245, 240, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, W)

    f_title = get_font(52, bold=True)
    f_sub = get_font(34, bold=False)
    f_btn = get_font(38, bold=True)

    # Address bar digeser ke kanan agar tepi kirinya tidak terpotong mask layar.
    draw_rounded_rect(draw, [95, 180, 1020, 270], radius=24, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)
    draw.text((135, 205), "carikostkita.id/download", font=get_font(36, bold=False), fill=(100, 90, 85, 255))

    card_top = 460
    draw_rounded_rect(draw, [60, card_top, 1020, card_top + 1050], radius=40, fill=(255, 255, 255, 255), outline=(220, 212, 200, 255), width=2)

    draw.ellipse([420, card_top + 80, 660, card_top + 320], fill=(248, 236, 236, 255), outline=BURGUNDY, width=4)
    draw.rectangle([520, card_top + 140, 560, card_top + 230], fill=BURGUNDY)
    draw.polygon([(480, card_top + 220), (540, card_top + 280), (600, card_top + 220)], fill=BURGUNDY)

    title = "CariKostKita.apk"
    w = text_width(draw, title, f_title)
    draw.text(((W - w) // 2, card_top + 370), title, font=f_title, fill=INK)

    sub = f"Versi {APP_VERSION} • {APK_SIZE}"
    w = text_width(draw, sub, f_sub)
    draw.text(((W - w) // 2, card_top + 450), sub, font=f_sub, fill=(120, 110, 105, 255))

    draw_rounded_rect(draw, [140, card_top + 540, 940, card_top + 575], radius=16, fill=GREEN)

    draw_rounded_rect(draw, [360, card_top + 620, 720, card_top + 690], radius=18, fill=GREEN_SOFT)
    label = "Unduhan Selesai 100%"
    w = text_width(draw, label, get_font(30, bold=True))
    draw.text(((W - w) // 2, card_top + 638), label, font=get_font(30, bold=True), fill=GREEN_DARK)

    draw_rounded_rect(draw, [140, card_top + 770, 940, card_top + 890], radius=28, fill=BURGUNDY)
    label = "Buka Berkas APK"
    w = text_width(draw, label, f_btn)
    draw.text(((W - w) // 2, card_top + 810), label, font=f_btn, fill=(255, 255, 255, 255))

    hint = "Klik berkas di atas untuk memulai instalasi"
    w = text_width(draw, hint, f_sub)
    draw.text(((W - w) // 2, card_top + 940), hint, font=f_sub, fill=(140, 130, 125, 255))

    draw_step_badge(draw, "LANGKAH 1 DARI 4", green=False)

    draw_bottom_nav(draw, W, H)
    return ui


def render_install_step2():
    W, H = CANVAS_W, CANVAS_H
    ui = Image.new("RGBA", (W, H), (248, 245, 240, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, W)
    draw.rectangle([0, 0, W, H], fill=(0, 0, 0, 85))

    f_title = get_font(48, bold=True)
    f_body = get_font(34, bold=False)
    f_btn = get_font(36, bold=True)

    d_top = 680
    draw_rounded_rect(draw, [70, d_top, 1010, d_top + 890], radius=44, fill=(255, 255, 255, 255))

    draw.polygon([(540, d_top + 70), (450, d_top + 230), (630, d_top + 230)], fill=(217, 119, 6, 255))
    draw.rectangle([532, d_top + 130, 548, d_top + 185], fill=(255, 255, 255, 255))
    draw.ellipse([532, d_top + 195, 548, d_top + 211], fill=(255, 255, 255, 255))

    title = "File mungkin berbahaya?"
    w = text_width(draw, title, f_title)
    draw.text(((W - w) // 2, d_top + 270), title, font=f_title, fill=INK)

    lines = [
        ("File ini berasal dari luar Play Store.", f_body, (100, 90, 85, 255)),
        ("Apakah Anda tetap ingin mendownload", f_body, (100, 90, 85, 255)),
        (f"{APK_FILE}?", get_font(34, bold=True), BURGUNDY),
    ]
    for i, (text, font, color) in enumerate(lines):
        w = text_width(draw, text, font)
        draw.text(((W - w) // 2, d_top + 360 + i * 50), text, font=font, fill=color)

    note = "Ini dialog standar Android. File resmi aman."
    w = text_width(draw, note, get_font(30, bold=False))
    draw.text(((W - w) // 2, d_top + 540), note, font=get_font(30, bold=False), fill=(130, 120, 115, 255))

    draw_rounded_rect(draw, [120, d_top + 640, 500, d_top + 760], radius=24, fill=(245, 240, 235, 255))
    label = "Batal"
    w = text_width(draw, label, f_btn)
    draw.text((310 - w // 2, d_top + 682), label, font=f_btn, fill=(120, 110, 105, 255))

    draw_rounded_rect(draw, [540, d_top + 640, 960, d_top + 760], radius=24, fill=BURGUNDY)
    label = "Tetap Download"
    w = text_width(draw, label, f_btn)
    draw.text((750 - w // 2, d_top + 682), label, font=f_btn, fill=(255, 255, 255, 255))

    draw_step_badge(draw, "LANGKAH 2 DARI 4", green=False)

    draw_bottom_nav(draw, W, H)
    return ui


def render_install_step3():
    W, H = CANVAS_W, CANVAS_H
    ui = Image.new("RGBA", (W, H), (250, 248, 244, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, W)

    f_title = get_font(48, bold=True)
    f_sub = get_font(32, bold=False)

    title = "Pengaturan Sistem Android"
    w = text_width(draw, title, f_title)
    draw.text(((W - w) // 2, 200), title, font=f_title, fill=INK)
    sub = "Izin instalasi aplikasi pihak ketiga"
    w = text_width(draw, sub, f_sub)
    draw.text(((W - w) // 2, 265), sub, font=f_sub, fill=(120, 110, 105, 255))

    s_top = 400
    draw_rounded_rect(draw, [60, s_top, 1020, s_top + 1050], radius=38, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)

    draw_rounded_rect(draw, [440, s_top + 80, 640, s_top + 280], radius=45, fill=BURGUNDY)
    draw.rectangle([510, s_top + 140, 570, s_top + 220], fill=(255, 255, 255, 255))
    draw.polygon([(490, s_top + 140), (540, s_top + 100), (590, s_top + 140)], fill=(255, 255, 255, 255))

    label = "CariKostKita"
    w = text_width(draw, label, f_title)
    draw.text(((W - w) // 2, s_top + 320), label, font=f_title, fill=INK)
    sub = f"Versi {APP_VERSION} • Verified Publisher"
    w = text_width(draw, sub, f_sub)
    draw.text(((W - w) // 2, s_top + 390), sub, font=f_sub, fill=(120, 110, 105, 255))

    t_row_y = s_top + 500
    draw_rounded_rect(draw, [100, t_row_y, 980, t_row_y + 200], radius=28, fill=(245, 249, 245, 255), outline=(187, 247, 208, 255), width=2)
    draw.text((140, t_row_y + 50), "Izinkan dari sumber ini", font=get_font(40, bold=True), fill=GREEN_DARK)
    draw.text((140, t_row_y + 110), "Aktifkan untuk melanjutkan instalasi", font=f_sub, fill=(60, 130, 80, 255))

    draw_rounded_rect(draw, [760, t_row_y + 60, 930, t_row_y + 140], radius=40, fill=GREEN)
    draw.ellipse([855, t_row_y + 65, 925, t_row_y + 135], fill=(255, 255, 255, 255))

    bold = get_font(34, bold=True)
    label = "Ponsel dan data pribadi Anda aman."
    w = text_width(draw, label, bold)
    draw.text(((W - w) // 2, s_top + 760), label, font=bold, fill=INK)
    label = "Aplikasi CariKostKita tidak mengakses data sensitif Anda."
    w = text_width(draw, label, f_sub)
    draw.text(((W - w) // 2, s_top + 820), label, font=f_sub, fill=(120, 110, 105, 255))

    draw_step_badge(draw, "LANGKAH 3 DARI 4", green=False)

    draw_bottom_nav(draw, W, H)
    return ui


def render_install_step4():
    W, H = CANVAS_W, CANVAS_H
    ui = Image.new("RGBA", (W, H), (248, 245, 240, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, W)

    f_title = get_font(52, bold=True)
    f_sub = get_font(34, bold=False)
    f_btn = get_font(38, bold=True)

    card_top = 420
    draw_rounded_rect(draw, [60, card_top, 1020, card_top + 1180], radius=44, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)

    draw.ellipse([400, card_top + 80, 680, card_top + 360], fill=GREEN_SOFT)
    draw.ellipse([430, card_top + 110, 650, card_top + 330], fill=GREEN)
    draw.line([490, card_top + 220, 530, card_top + 260], fill=(255, 255, 255, 255), width=18)
    draw.line([530, card_top + 260, 600, card_top + 170], fill=(255, 255, 255, 255), width=18)

    for text, font, color, dy in (
        ("Aplikasi Terpasang!", f_title, GREEN_DARK, 410),
        ("Selamat! CariKostKita kini siap digunakan.", f_sub, (100, 90, 85, 255), 490),
        ("Mulai jelajahi ratusan kost di Pekanbaru.", f_sub, (120, 110, 105, 255), 550),
    ):
        w = text_width(draw, text, font)
        draw.text(((W - w) // 2, card_top + dy), text, font=font, fill=color)

    capsules = [
        "100% Gratis Tanpa Biaya Admin",
        "Kontak Langsung dengan Pemilik Kost",
        "Mapa Lokasi Dekat UNRI, UIR & UIN Suska",
    ]
    cap_y = card_top + 650
    for cap in capsules:
        draw_rounded_rect(draw, [140, cap_y, 940, cap_y + 75], radius=18, fill=(247, 244, 238, 255))
        draw.ellipse([175, cap_y + 24, 195, cap_y + 44], fill=BURGUNDY)
        draw.text((220, cap_y + 18), cap, font=get_font(28, bold=True), fill=(50, 40, 36, 255))
        cap_y += 95

    draw_rounded_rect(draw, [140, card_top + 980, 940, card_top + 1100], radius=28, fill=BURGUNDY)
    label = "Buka CariKostKita"
    w = text_width(draw, label, f_btn)
    draw.text(((W - w) // 2, card_top + 1020), label, font=f_btn, fill=(255, 255, 255, 255))

    draw_step_badge(draw, "LANGKAH 4 DARI 4", green=True)

    draw_bottom_nav(draw, W, H)
    return ui


def draw_step_badge(draw, text, green=False):
    fill = GREEN if green else BURGUNDY
    draw_rounded_rect(draw, [380, 1880, 700, 1950], radius=24, fill=fill)
    font = get_font(30, bold=True)
    w = text_width(draw, text, font)
    draw.text((540 - w // 2, 1900), text, font=font, fill=(255, 255, 255, 255))


def build_screen_mask(size):
    """Mask area layar dihitung dari kuadrilateral perspektif.

    VERSI LAMA: memuat berkas `screen_mask.png` terpisah yang tidak pernah
    ikut di-commit, sehingga script tidak bisa dijalankan ulang.
    """
    w, h = size
    mask = Image.new("L", (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.polygon(SCREEN_QUAD, fill=255)
    return np.array(mask) > 0


def composite_and_crop(ui_image, output_path):
    mockup = Image.open("assets/mockup-frame.png").convert("RGBA")
    W_MOCK, H_MOCK = mockup.size

    dst_pts = SCREEN_QUAD
    src_pts = [(0, 0), (ui_image.width, 0), (ui_image.width, ui_image.height), (0, ui_image.height)]
    coeffs = find_coeffs(dst_pts, src_pts)

    warped_ui = ui_image.transform((W_MOCK, H_MOCK), Image.PERSPECTIVE, coeffs, Image.BICUBIC)

    mockup_orig = Image.open("assets/mockup-frame.jpg").convert("RGB")
    orig_arr = np.array(mockup_orig)

    screen_mask = build_screen_mask((W_MOCK, H_MOCK))

    y_coords, x_coords = np.indices((H_MOCK, W_MOCK))
    left_x_boundary = 576 + (269.0 / 1732.0) * (y_coords - 173) + 12
    screen_mask = screen_mask & (x_coords >= left_x_boundary)

    bottom_y_boundary = 1905 - (107.0 / 666.0) * (x_coords - 845) - 15
    screen_mask = screen_mask & (y_coords <= bottom_y_boundary)

    right_x_boundary = 1267 + (244.0 / 1526.0) * (y_coords - 272) - 10
    screen_mask = screen_mask & (x_coords <= right_x_boundary)

    is_notch = (
        (x_coords >= 825)
        & (x_coords <= 1125)
        & (y_coords >= 200)
        & (y_coords <= 320)
        & (np.mean(orig_arr, axis=2) < 200)
    )
    screen_mask = screen_mask & (~is_notch)

    res = np.array(mockup).copy()
    warped_arr = np.array(warped_ui)
    res[screen_mask] = warped_arr[screen_mask]

    # Kilau kaca
    screen_gray = np.mean(orig_arr, axis=2)
    sheen = np.clip((screen_gray - 210) * 1.4, 0, 40).astype(np.uint8)
    for c in range(3):
        res[screen_mask, c] = np.clip(
            res[screen_mask, c].astype(int) + sheen[screen_mask], 0, 255
        ).astype(np.uint8)

    full_img = Image.fromarray(res)
    cropped_img = full_img.crop(CROP_BOX)
    cropped_img.save(output_path, "WEBP", quality=WEBP_QUALITY, method=6)
    print(
        "  %s  %s  %d KB"
        % (
            os.path.basename(output_path),
            cropped_img.size,
            os.path.getsize(output_path) // 1024,
        )
    )


if __name__ == "__main__":
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    print("Merender mockup hero (versi %s, %s)..." % (APP_VERSION, APK_SIZE))
    for cat in ["Semua", "Putri", "Putra", "Campur"]:
        composite_and_crop(render_hero_ui(cat), f"public/mockup-hero-{cat.lower()}.webp")

    print("Merender mockup langkah instalasi...")
    composite_and_crop(render_install_step1(), "public/mockup-install-1.webp")
    composite_and_crop(render_install_step2(), "public/mockup-install-2.webp")
    composite_and_crop(render_install_step3(), "public/mockup-install-3.webp")
    composite_and_crop(render_install_step4(), "public/mockup-install-4.webp")

    print("Selesai.")
