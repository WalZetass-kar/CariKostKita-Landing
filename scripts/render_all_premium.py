import os
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont

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

def find_coeffs(pa, pb):
    matrix = []
    for p_dst, p_src in zip(pa, pb):
        x, y = p_dst
        u, v = p_src
        matrix.append([x, y, 1, 0, 0, 0, -u*x, -u*y])
        matrix.append([0, 0, 0, x, y, 1, -v*x, -v*y])
    A = np.matrix(matrix, dtype=float)
    B = np.array(pb).reshape(8)
    res = np.dot(np.linalg.inv(A), B)
    return np.array(res).reshape(8)

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def load_and_cover_photo(photo_path, target_w, target_h, radius=28):
    if not os.path.exists(photo_path):
        img = Image.new("RGBA", (target_w, target_h), (210, 190, 175, 255))
        return img
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
    # Status bar with generous margins to comfortably clear corners and notch
    draw.text((110, 92), "09:41", font=f_time, fill=(30, 22, 20, 255))
    draw.text((860, 94), "5G  100%", font=f_status, fill=(30, 22, 20, 255))

def draw_bottom_nav(draw, W, H, active_tab="Beranda"):
    nav_top = 2100
    # Shadow and background
    draw.rectangle([0, nav_top - 6, W, nav_top], fill=(0, 0, 0, 12))
    draw.rectangle([0, nav_top, W, H], fill=(255, 255, 255, 255))
    draw.line([0, nav_top, W, nav_top], fill=(230, 225, 218, 255), width=2)

    f_nav = get_font(26, bold=True)
    items = [
        ("Beranda", 135),
        ("Favorit", 405),
        ("Chat", 675),
        ("Profil", 945)
    ]
    for label, cx in items:
        is_act = (label == active_tab)
        color = (109, 8, 8, 255) if is_act else (145, 134, 128, 255)
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

        draw.text((cx - len(label)*6, nav_top + 76), label, font=f_nav, fill=color)

    # Home indicator pill comfortably placed
    draw_rounded_rect(draw, [390, 2300, 690, 2314], radius=7, fill=(160, 150, 145, 255))

def render_hero_ui(active_category="Semua"):
    W, H = 1080, 2400
    ui = Image.new("RGBA", (W, H), (250, 248, 245, 255))
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

    # Header Bar (shifted down for breathing room below notch)
    h_top = 185
    draw_rounded_rect(draw, [60, h_top, 135, h_top + 75], radius=18, fill=(109, 8, 8, 255))
    draw.rectangle([82, h_top + 22, 112, h_top + 62], fill=(255, 255, 255, 255))
    draw.rectangle([92, h_top + 42, 102, h_top + 62], fill=(109, 8, 8, 255))
    draw.polygon([(75, h_top + 22), (97, h_top + 5), (119, h_top + 22)], fill=(255, 255, 255, 255))

    draw.text((155, h_top + 4), "CariKostKita", font=f_brand, fill=(109, 8, 8, 255))
    draw.text((157, h_top + 60), "Pekanbaru, Riau • 500+ Kost Pilihan", font=f_sub, fill=(125, 112, 106, 255))

    # Notification bell
    draw_rounded_rect(draw, [940, h_top, 1020, h_top + 80], radius=40, fill=(255, 255, 255, 255), outline=(225, 218, 208, 255), width=2)
    draw.ellipse([968, h_top + 28, 992, h_top + 52], fill=(109, 8, 8, 255))
    draw.ellipse([990, h_top + 22, 1002, h_top + 34], fill=(220, 38, 38, 255))

    # Search Bar
    s_top = 295
    draw_rounded_rect(draw, [60, s_top, 1020, s_top + 98], radius=26, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)
    draw.ellipse([95, s_top + 33, 121, s_top + 59], outline=(140, 130, 125, 255), width=4)
    draw.line([117, s_top + 55, 130, s_top + 68], fill=(140, 130, 125, 255), width=5)
    draw.text((150, s_top + 30), "Cari kost dekat UNRI, UIR, Panam...", font=f_search, fill=(150, 140, 135, 255))

    draw_rounded_rect(draw, [925, s_top + 13, 1005, s_top + 85], radius=18, fill=(109, 8, 8, 255))
    draw.rectangle([948, s_top + 38, 982, s_top + 42], fill=(255, 255, 255, 255))
    draw.rectangle([953, s_top + 49, 977, s_top + 53], fill=(255, 255, 255, 255))

    # Categories
    cat_top = 415
    categories = ["Semua", "Putri", "Putra", "Campur"]
    cur_x = 60
    for cat in categories:
        is_act = (cat == active_category)
        btn_w = 220
        if is_act:
            draw_rounded_rect(draw, [cur_x, cat_top, cur_x + btn_w, cat_top + 82], radius=22, fill=(109, 8, 8, 255))
            draw.text((cur_x + 50, cat_top + 22), cat, font=f_pill, fill=(255, 255, 255, 255))
        else:
            draw_rounded_rect(draw, [cur_x, cat_top, cur_x + btn_w, cat_top + 82], radius=22, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)
            draw.text((cur_x + 50, cat_top + 22), cat, font=f_pill, fill=(70, 58, 55, 255))
        cur_x += btn_w + 20

    # Section Heading
    heading = f"Pilihan Kost {active_category}" if active_category != "Semua" else "Kost Populer di Pekanbaru"
    sec_top = 525
    draw.text((60, sec_top), heading, font=f_sec_title, fill=(38, 27, 25, 255))
    draw.text((850, sec_top + 8), "Lihat Semua >", font=f_sec_link, fill=(109, 8, 8, 255))

    # Real Photo Listings Data
    all_listings = {
        "Semua": [
            ("Kost Melati Indah Panam", "Rp 700.000", "KOST PUTRI", "4.9 (48)", "Panam, Dekat Kampus UNRI (300m)", ["WiFi Cepat", "K. Mandi Dalam", "AC / Kipas", "Parkir Luas"], "public/kost-room-1.jpg", (109, 8, 8)),
            ("Kost Sinar Jaya Marpoyan", "Rp 640.000", "KOST PUTRA", "4.8 (39)", "Marpoyan Damai, Dekat UIR (500m)", ["Kasur Busa", "Lemari", "Free Listrik", "Dapur"], "public/kost-room-2.jpg", (25, 60, 115))
        ],
        "Putri": [
            ("Kost Melati Indah Panam", "Rp 700.000", "KOST PUTRI", "4.9 (48)", "Panam, Dekat Kampus UNRI (300m)", ["WiFi Cepat", "K. Mandi Dalam", "AC / Kipas", "Parkir Luas"], "public/kost-room-1.jpg", (109, 8, 8)),
            ("Kost Anggrek Asri Riau", "Rp 800.000", "KOST PUTRI", "4.9 (27)", "Sukajadi, Dekat Pusat Kota (200m)", ["Security 24J", "WiFi 50M", "Dapur Bersih", "CCTV"], "public/kost-room-3.jpg", (109, 8, 8))
        ],
        "Putra": [
            ("Kost Sinar Jaya Marpoyan", "Rp 640.000", "KOST PUTRA", "4.8 (39)", "Marpoyan Damai, Dekat UIR (500m)", ["Kasur Busa", "Lemari", "Free Listrik", "Dapur"], "public/kost-room-2.jpg", (25, 60, 115)),
            ("Kost Garuda Mandiri", "Rp 550.000", "KOST PUTRA", "4.7 (31)", "Tuah Madani, Area UNRI Rimbo Panjang", ["Kasur", "Lemari", "Parkir Motor", "Air Bersih"], "public/kost-room-3.jpg", (25, 60, 115))
        ],
        "Campur": [
            ("Kost D'Gading Exclusive", "Rp 1.200.000", "KOST CAMPUR", "4.9 (53)", "Bukit Raya, Dekat Jl. Sudirman", ["AC Dingin", "Water Heater", "Kasur King", "Parkir Mobil"], "public/kost-room-4.jpg", (18, 95, 60)),
            ("Pavilion Sudirman Suite", "Rp 1.400.000", "KOST CAMPUR", "5.0 (18)", "Tengah Kota Pekanbaru, Akses Mall", ["Fully Furnished", "Smart Lock", "Balkon", "WiFi 100M"], "public/kost-room-1.jpg", (18, 95, 60))
        ]
    }
    cards = all_listings.get(active_category, all_listings["Semua"])

    # Draw Card 1
    c1_y = 590
    card_w = 960
    card_h = 675
    draw_rounded_rect(draw, [60, c1_y, 60 + card_w, c1_y + card_h], radius=34, fill=(255, 255, 255, 255), outline=(225, 220, 212, 255), width=2)
    photo1 = load_and_cover_photo(cards[0][6], card_w, 390, radius=34)
    ui.paste(photo1, (60, c1_y), photo1)

    draw_rounded_rect(draw, [90, c1_y + 25, 280, c1_y + 88], radius=16, fill=cards[0][7] + (240,))
    draw.text((115, c1_y + 38), cards[0][2], font=f_card_tag, fill=(255, 255, 255, 255))

    draw_rounded_rect(draw, [840, c1_y + 25, 990, c1_y + 88], radius=16, fill=(255, 255, 255, 245))
    draw.text((860, c1_y + 38), cards[0][3], font=f_card_tag, fill=(109, 8, 8, 255))

    t1_y = c1_y + 410
    draw.text((90, t1_y), cards[0][0], font=f_card_title, fill=(38, 27, 25, 255))
    draw.text((700, t1_y - 2), cards[0][1], font=f_card_price, fill=(109, 8, 8, 255))
    draw.text((915, t1_y + 10), "/bln", font=f_sub, fill=(130, 118, 112, 255))
    draw.text((90, t1_y + 55), cards[0][4], font=f_card_sub, fill=(110, 98, 92, 255))

    tag_x = 90
    for tag in cards[0][5]:
        tw = len(tag) * 18 + 32
        draw_rounded_rect(draw, [tag_x, t1_y + 110, tag_x + tw, t1_y + 168], radius=14, fill=(245, 240, 232, 255))
        draw.text((tag_x + 16, t1_y + 125), tag, font=f_card_tag, fill=(90, 78, 72, 255))
        tag_x += tw + 12

    # Draw Card 2
    c2_y = 1300
    draw_rounded_rect(draw, [60, c2_y, 60 + card_w, c2_y + card_h], radius=34, fill=(255, 255, 255, 255), outline=(225, 220, 212, 255), width=2)
    photo2 = load_and_cover_photo(cards[1][6], card_w, 390, radius=34)
    ui.paste(photo2, (60, c2_y), photo2)

    draw_rounded_rect(draw, [90, c2_y + 25, 280, c2_y + 88], radius=16, fill=cards[1][7] + (240,))
    draw.text((115, c2_y + 38), cards[1][2], font=f_card_tag, fill=(255, 255, 255, 255))

    draw_rounded_rect(draw, [840, c2_y + 25, 990, c2_y + 88], radius=16, fill=(255, 255, 255, 245))
    draw.text((860, c2_y + 38), cards[1][3], font=f_card_tag, fill=(109, 8, 8, 255))

    t2_y = c2_y + 410
    draw.text((90, t2_y), cards[1][0], font=f_card_title, fill=(38, 27, 25, 255))
    draw.text((700, t2_y - 2), cards[1][1], font=f_card_price, fill=(109, 8, 8, 255))
    draw.text((915, t2_y + 10), "/bln", font=f_sub, fill=(130, 118, 112, 255))
    draw.text((90, t2_y + 55), cards[1][4], font=f_card_sub, fill=(110, 98, 92, 255))

    tag_x2 = 90
    for tag in cards[1][5]:
        tw = len(tag) * 18 + 32
        draw_rounded_rect(draw, [tag_x2, t2_y + 110, tag_x2 + tw, t2_y + 168], radius=14, fill=(245, 240, 232, 255))
        draw.text((tag_x2 + 16, t2_y + 125), tag, font=f_card_tag, fill=(90, 78, 72, 255))
        tag_x2 += tw + 12

    draw_bottom_nav(draw, W, H, "Beranda")
    return ui

def render_install_step1():
    # Step 1: Download Complete
    W, H = 1080, 2400
    ui = Image.new("RGBA", (W, H), (248, 245, 240, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, W)

    f_title = get_font(52, bold=True)
    f_sub = get_font(34, bold=False)
    f_btn = get_font(38, bold=True)

    # Top address bar
    draw_rounded_rect(draw, [60, 180, 1020, 270], radius=24, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)
    draw.text((100, 205), "carikostkita.id/download", font=get_font(36, bold=False), fill=(100, 90, 85, 255))

    # Center download card
    card_top = 460
    draw_rounded_rect(draw, [60, card_top, 1020, card_top + 1050], radius=40, fill=(255, 255, 255, 255), outline=(220, 212, 200, 255), width=2)

    # Big download icon
    draw.ellipse([420, card_top + 80, 660, card_top + 320], fill=(248, 236, 236, 255), outline=(109, 8, 8, 255), width=4)
    draw.rectangle([520, card_top + 140, 560, card_top + 230], fill=(109, 8, 8, 255))
    draw.polygon([(480, card_top + 220), (540, card_top + 280), (600, card_top + 220)], fill=(109, 8, 8, 255))

    draw.text((270, card_top + 370), "CariKostKita.apk", font=f_title, fill=(38, 27, 25, 255))
    draw.text((370, card_top + 450), "Versi 1.0.0-beta • 6.9 MB", font=f_sub, fill=(120, 110, 105, 255))

    # Green progress bar 100%
    draw_rounded_rect(draw, [140, card_top + 540, 940, card_top + 575], radius=16, fill=(37, 211, 102, 255))

    draw_rounded_rect(draw, [360, card_top + 620, 720, card_top + 690], radius=18, fill=(220, 252, 231, 255))
    draw.text((395, card_top + 638), "Unduhan Selesai 100%", font=get_font(30, bold=True), fill=(22, 101, 52, 255))

    # Big CTA Button
    draw_rounded_rect(draw, [140, card_top + 770, 940, card_top + 890], radius=28, fill=(109, 8, 8, 255))
    draw.text((380, card_top + 810), "Buka Berkas APK", font=f_btn, fill=(255, 255, 255, 255))

    draw.text((240, card_top + 940), "Klik berkas di atas untuk memulai instalasi", font=f_sub, fill=(140, 130, 125, 255))

    # Step badge bottom
    draw_rounded_rect(draw, [380, 1880, 700, 1950], radius=24, fill=(109, 8, 8, 255))
    draw.text((420, 1900), "LANGKAH 1 DARI 4", font=get_font(30, bold=True), fill=(255, 255, 255, 255))

    draw_bottom_nav(draw, W, H)
    return ui

def render_install_step2():
    # Step 2: Warning Dialog
    W, H = 1080, 2400
    ui = Image.new("RGBA", (W, H), (248, 245, 240, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, W)

    # Dimmed background
    draw.rectangle([0, 0, W, H], fill=(0, 0, 0, 85))

    f_title = get_font(48, bold=True)
    f_body = get_font(34, bold=False)
    f_btn = get_font(36, bold=True)

    d_top = 680
    draw_rounded_rect(draw, [70, d_top, 1010, d_top + 890], radius=44, fill=(255, 255, 255, 255))

    # Warning triangle
    draw.polygon([(540, d_top + 70), (450, d_top + 230), (630, d_top + 230)], fill=(217, 119, 6, 255))
    draw.rectangle([532, d_top + 130, 548, d_top + 185], fill=(255, 255, 255, 255))
    draw.ellipse([532, d_top + 195, 548, d_top + 211], fill=(255, 255, 255, 255))

    draw.text((230, d_top + 270), "File mungkin berbahaya?", font=f_title, fill=(38, 27, 25, 255))

    text1 = "File ini berasal dari luar Play Store."
    text2 = "Apakah Anda tetap ingin mendownload"
    text3 = "CariKostKita-v1.0.0-beta.apk?"
    draw.text((230, d_top + 360), text1, font=f_body, fill=(100, 90, 85, 255))
    draw.text((180, d_top + 410), text2, font=f_body, fill=(100, 90, 85, 255))
    draw.text((210, d_top + 460), text3, font=get_font(34, bold=True), fill=(109, 8, 8, 255))

    draw.text((170, d_top + 540), "Ini dialog standar Android. File resmi aman.", font=get_font(30, bold=False), fill=(130, 120, 115, 255))

    # Buttons
    draw_rounded_rect(draw, [120, d_top + 640, 500, d_top + 760], radius=24, fill=(245, 240, 235, 255))
    draw.text((260, d_top + 682), "Batal", font=f_btn, fill=(120, 110, 105, 255))

    draw_rounded_rect(draw, [540, d_top + 640, 960, d_top + 760], radius=24, fill=(109, 8, 8, 255))
    draw.text((615, d_top + 682), "Tetap Download", font=f_btn, fill=(255, 255, 255, 255))

    # Step badge bottom
    draw_rounded_rect(draw, [380, 1880, 700, 1950], radius=24, fill=(109, 8, 8, 255))
    draw.text((420, 1900), "LANGKAH 2 DARI 4", font=get_font(30, bold=True), fill=(255, 255, 255, 255))

    draw_bottom_nav(draw, W, H)
    return ui

def render_install_step3():
    # Step 3: Allow Unknown Sources
    W, H = 1080, 2400
    ui = Image.new("RGBA", (W, H), (250, 248, 244, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, W)

    f_title = get_font(48, bold=True)
    f_sub = get_font(32, bold=False)

    draw.text((120, 200), "Pengaturan Sistem Android", font=f_title, fill=(38, 27, 25, 255))
    draw.text((120, 265), "Izin instalasi aplikasi pihak ketiga", font=f_sub, fill=(120, 110, 105, 255))

    s_top = 400
    draw_rounded_rect(draw, [60, s_top, 1020, s_top + 1050], radius=38, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)

    # App icon
    draw_rounded_rect(draw, [440, s_top + 80, 640, s_top + 280], radius=45, fill=(109, 8, 8, 255))
    draw.rectangle([510, s_top + 140, 570, s_top + 220], fill=(255, 255, 255, 255))
    draw.polygon([(490, s_top + 140), (540, s_top + 100), (590, s_top + 140)], fill=(255, 255, 255, 255))

    draw.text((360, s_top + 320), "CariKostKita", font=f_title, fill=(38, 27, 25, 255))
    draw.text((350, s_top + 390), "Versi 1.0.0 • Verified Publisher", font=f_sub, fill=(120, 110, 105, 255))

    # Toggle Row
    t_row_y = s_top + 500
    draw_rounded_rect(draw, [100, t_row_y, 980, t_row_y + 200], radius=28, fill=(245, 249, 245, 255), outline=(187, 247, 208, 255), width=2)

    draw.text((140, t_row_y + 50), "Izinkan dari sumber ini", font=get_font(40, bold=True), fill=(22, 101, 52, 255))
    draw.text((140, t_row_y + 110), "Aktifkan untuk melanjutkan instalasi", font=f_sub, fill=(60, 130, 80, 255))

    # Toggle Active Switch
    draw_rounded_rect(draw, [760, t_row_y + 60, 930, t_row_y + 140], radius=40, fill=(37, 211, 102, 255))
    draw.ellipse([855, t_row_y + 65, 925, t_row_y + 135], fill=(255, 255, 255, 255))

    draw.text((120, s_top + 760), "Ponsel dan data pribadi Anda aman.", font=get_font(34, bold=True), fill=(38, 27, 25, 255))
    draw.text((120, s_top + 820), "Aplikasi CariKostKita tidak mengakses data sensitif Anda.", font=f_sub, fill=(120, 110, 105, 255))

    # Step badge bottom
    draw_rounded_rect(draw, [380, 1880, 700, 1950], radius=24, fill=(109, 8, 8, 255))
    draw.text((420, 1900), "LANGKAH 3 DARI 4", font=get_font(30, bold=True), fill=(255, 255, 255, 255))

    draw_bottom_nav(draw, W, H)
    return ui

def render_install_step4():
    # Step 4: Installation Complete
    W, H = 1080, 2400
    ui = Image.new("RGBA", (W, H), (248, 245, 240, 255))
    draw = ImageDraw.Draw(ui)
    draw_status_bar(draw, W)

    f_title = get_font(52, bold=True)
    f_sub = get_font(34, bold=False)
    f_btn = get_font(38, bold=True)

    card_top = 420
    draw_rounded_rect(draw, [60, card_top, 1020, card_top + 1180], radius=44, fill=(255, 255, 255, 255), outline=(225, 218, 206, 255), width=2)

    # Green check circle
    draw.ellipse([400, card_top + 80, 680, card_top + 360], fill=(220, 252, 231, 255))
    draw.ellipse([430, card_top + 110, 650, card_top + 330], fill=(37, 211, 102, 255))
    draw.line([490, card_top + 220, 530, card_top + 260], fill=(255, 255, 255, 255), width=18)
    draw.line([530, card_top + 260, 600, card_top + 170], fill=(255, 255, 255, 255), width=18)

    draw.text((290, card_top + 410), "Aplikasi Terpasang!", font=f_title, fill=(22, 101, 52, 255))
    draw.text((220, card_top + 490), "Selamat! CariKostKita kini siap digunakan.", font=f_sub, fill=(100, 90, 85, 255))
    draw.text((270, card_top + 550), "Mulai jelajahi ratusan kost di Pekanbaru.", font=f_sub, fill=(120, 110, 105, 255))

    capsules = [
        "100% Gratis Tanpa Biaya Admin",
        "Kontak Langsung dengan Pemilik Kost",
        "Peta Lokasi Dekat UNRI, UIR & UIN Suska"
    ]
    cap_y = card_top + 650
    for cap in capsules:
        draw_rounded_rect(draw, [140, cap_y, 940, cap_y + 75], radius=18, fill=(247, 244, 238, 255))
        draw.ellipse([175, cap_y + 24, 195, cap_y + 44], fill=(109, 8, 8, 255))
        draw.text((220, cap_y + 18), cap, font=get_font(28, bold=True), fill=(50, 40, 36, 255))
        cap_y += 95

    # Button
    draw_rounded_rect(draw, [140, card_top + 980, 940, card_top + 1100], radius=28, fill=(109, 8, 8, 255))
    draw.text((370, card_top + 1020), "Buka CariKostKita", font=f_btn, fill=(255, 255, 255, 255))

    # Step badge bottom
    draw_rounded_rect(draw, [380, 1880, 700, 1950], radius=24, fill=(37, 211, 102, 255))
    draw.text((420, 1900), "LANGKAH 4 DARI 4", font=get_font(30, bold=True), fill=(255, 255, 255, 255))

    draw_bottom_nav(draw, W, H)
    return ui

def composite_and_crop(ui_image, output_path):
    mockup = Image.open("public/mockup.png").convert("RGBA")
    W_MOCK, H_MOCK = mockup.size

    dst_pts = [
        (576, 173),   # TL
        (1267, 272),  # TR
        (1511, 1798), # BR
        (845, 1905)   # BL
    ]
    src_pts = [(0, 0), (ui_image.width, 0), (ui_image.width, ui_image.height), (0, ui_image.height)]
    coeffs = find_coeffs(dst_pts, src_pts)

    warped_ui = ui_image.transform((W_MOCK, H_MOCK), Image.PERSPECTIVE, coeffs, Image.BICUBIC)

    mockup_orig = Image.open("mockup.jpg").convert("RGB")
    orig_arr = np.array(mockup_orig)

    screen_mask = np.array(Image.open("screen_mask.png")) > 0

    y_coords, x_coords = np.indices((H_MOCK, W_MOCK))
    left_x_boundary = 576 + (269.0 / 1732.0) * (y_coords - 173) + 12
    screen_mask = screen_mask & (x_coords >= left_x_boundary)

    bottom_y_boundary = 1905 - (107.0 / 666.0) * (x_coords - 845) - 15
    screen_mask = screen_mask & (y_coords <= bottom_y_boundary)

    right_x_boundary = 1267 + (244.0 / 1526.0) * (y_coords - 272) - 10
    screen_mask = screen_mask & (x_coords <= right_x_boundary)

    is_notch = (x_coords >= 825) & (x_coords <= 1125) & (y_coords >= 200) & (y_coords <= 320) & (np.mean(orig_arr, axis=2) < 200)
    screen_mask = screen_mask & (~is_notch)

    res = np.array(mockup).copy()
    warped_arr = np.array(warped_ui)
    res[screen_mask] = warped_arr[screen_mask]

    # Glass reflection sheen
    screen_gray = np.mean(orig_arr, axis=2)
    sheen = np.clip((screen_gray - 210) * 1.4, 0, 40).astype(np.uint8)
    for c in range(3):
        res[screen_mask, c] = np.clip(res[screen_mask, c].astype(int) + sheen[screen_mask], 0, 255).astype(np.uint8)

    full_img = Image.fromarray(res)

    # CROP TIGHTLY TO THE PHONE with clean margins
    crop_box = (550, 140, 1540, 1920)
    cropped_img = full_img.crop(crop_box)
    cropped_img.save(output_path, "PNG")
    print(f"Generated & Cropped: {output_path} (size: {cropped_img.size})")

if __name__ == "__main__":
    # Hero categories
    for cat in ["Semua", "Putri", "Putra", "Campur"]:
        ui = render_hero_ui(cat)
        slug = cat.lower()
        composite_and_crop(ui, f"public/mockup-hero-{slug}.png")

    shutil.copyfile("public/mockup-hero-semua.png", "public/mockup-hero.png")
    print("Hero mockups done!")

    # Install steps
    s1 = render_install_step1()
    composite_and_crop(s1, "public/mockup-install-1.png")

    s2 = render_install_step2()
    composite_and_crop(s2, "public/mockup-install-2.png")

    s3 = render_install_step3()
    composite_and_crop(s3, "public/mockup-install-3.png")

    s4 = render_install_step4()
    composite_and_crop(s4, "public/mockup-install-4.png")

    print("ALL PREMIUM MOCKUPS RENDERED SUCCESSFULLY!")
