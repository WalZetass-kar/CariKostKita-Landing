#!/usr/bin/env python3
"""Composite screenshot into phone mockup WebP."""

import os
import sys
from PIL import Image, ImageDraw

UI_W, UI_H = 1080, 2400
BEZEL = 46
PAD_X, PAD_Y = 41, 34
BUTTON_PROTRUDE = 14

BODY_W = UI_W + BEZEL * 2
BODY_H = UI_H + BEZEL * 2
CANVAS_W = BODY_W + PAD_X * 2
CANVAS_H = BODY_H + PAD_Y * 2

OUTER_R = 152
INNER_R = 108

BODY = (23, 9, 9, 255)
BODY_EDGE = (255, 255, 255, 34)
SIDE_BUTTON = (44, 22, 21, 255)
CAMERA_RING = (58, 40, 38, 255)
CAMERA_LENS = (10, 4, 4, 255)
CAMERA_GLINT = (108, 94, 92, 255)

SUPERSAMPLE = 2
WEBP_QUALITY = 95


def rounded_mask(size, radius):
    w, h = size
    big = Image.new("L", (w * SUPERSAMPLE, h * SUPERSAMPLE), 0)
    ImageDraw.Draw(big).rounded_rectangle(
        [0, 0, w * SUPERSAMPLE - 1, h * SUPERSAMPLE - 1],
        radius=radius * SUPERSAMPLE,
        fill=255,
    )
    return big.resize((w, h), Image.LANCZOS)


def draw_camera(draw):
    cx = PAD_X + BEZEL + UI_W // 2
    cy = PAD_Y + BEZEL + 58
    draw.ellipse([cx - 27, cy - 27, cx + 27, cy + 27], fill=CAMERA_RING)
    draw.ellipse([cx - 21, cy - 21, cx + 21, cy + 21], fill=CAMERA_LENS)
    draw.ellipse([cx - 13, cy - 15, cx - 1, cy - 3], fill=CAMERA_GLINT)


def draw_side_buttons(draw):
    x0 = PAD_X + BODY_W - 4
    x1 = x0 + BUTTON_PROTRUDE
    draw.rounded_rectangle([x0, PAD_Y + 520, x1, PAD_Y + 700], radius=7, fill=SIDE_BUTTON)
    draw.rounded_rectangle([x0, PAD_Y + 748, x1, PAD_Y + 908], radius=7, fill=SIDE_BUTTON)


def compose_screenshot(screenshot_path, output_path):
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    body_box = [PAD_X, PAD_Y, PAD_X + BODY_W - 1, PAD_Y + BODY_H - 1]
    draw.rounded_rectangle(body_box, radius=OUTER_R, fill=BODY)
    draw_side_buttons(draw)

    # Load and scale screenshot to UI_W x UI_H
    raw_img = Image.open(screenshot_path).convert("RGBA")
    ui = raw_img.resize((UI_W, UI_H), Image.LANCZOS)

    screen_mask = rounded_mask((UI_W, UI_H), INNER_R)
    canvas.paste(ui, (PAD_X + BEZEL, PAD_Y + BEZEL), screen_mask)

    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(body_box, radius=OUTER_R, outline=BODY_EDGE, width=3)
    draw_camera(draw)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    canvas.save(output_path, "WEBP", quality=WEBP_QUALITY, method=6)
    print(f"Saved {output_path} ({canvas.size[0]}x{canvas.size[1]}, {os.path.getsize(output_path)//1024} KB)")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python apply_screenshot_to_mockup.py <input_screenshot> <output_webp>")
        sys.exit(1)
    compose_screenshot(sys.argv[1], sys.argv[2])
