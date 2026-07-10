# -*- coding: utf-8 -*-
"""Generate the OG social-share image with the site's Vazirmatn font.
Run: python scripts/generate-og.py  ->  writes public/og-image.jpg (1200x630)
"""
import os
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "_ogfonts")
OUT = os.path.join(HERE, "..", "public", "og-image.jpg")

W, H = 1200, 630
# Brand palette (navy primary + gold accent)
TOP = (18, 28, 74)       # deep navy
BOTTOM = (30, 46, 120)   # lighter navy
GOLD = (214, 154, 60)    # accent gold
GOLD_BAR = (180, 83, 9)  # #B45309
WHITE = (255, 255, 255)
MUTED = (188, 198, 224)


def fa(text):
    return get_display(arabic_reshaper.reshape(text))


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


# --- background: vertical navy gradient ---
img = Image.new("RGB", (W, H), TOP)
px = img.load()
for y in range(H):
    t = y / (H - 1)
    r = int(TOP[0] + (BOTTOM[0] - TOP[0]) * t)
    g = int(TOP[1] + (BOTTOM[1] - TOP[1]) * t)
    b = int(TOP[2] + (BOTTOM[2] - TOP[2]) * t)
    for x in range(W):
        px[x, y] = (r, g, b)

draw = ImageDraw.Draw(img)

# --- gold bottom bar ---
draw.rectangle([0, H - 12, W, H], fill=GOLD_BAR)

f_title = font("Vazirmatn-Bold.ttf", 96)
f_sub = font("Vazirmatn-Medium.ttf", 44)
f_tag = font("Vazirmatn-Regular.ttf", 32)

title = fa("دادپروران")
sub = fa("مهر ایران")
tag = fa("مؤسسه حقوقی — مشاوره و خدمات حقوقی تخصصی")


def center_text(y, text, fnt, fill):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    w = bbox[2] - bbox[0]
    draw.text(((W - w) / 2, y), text, font=fnt, fill=fill)
    return bbox[3] - bbox[1]


# --- centered stack ---
center_text(196, title, f_title, WHITE)
center_text(320, sub, f_sub, GOLD)
# divider line
draw.rectangle([W / 2 - 110, 398, W / 2 + 110, 400], fill=(120, 135, 185))
center_text(430, tag, f_tag, MUTED)

img.save(OUT, "JPEG", quality=92, optimize=True)
print("wrote", os.path.normpath(OUT), img.size)
