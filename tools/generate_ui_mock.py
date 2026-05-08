from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "ui-mocks"
OUT_PATH = OUT_DIR / "unfold-marble-ui-mock.png"

W, H = 1600, 980
BG = (230, 228, 220)
INK = (27, 30, 35)
MUTED = (104, 109, 116)
BRASS = (151, 120, 58)
DARK = (25, 29, 35)
P1 = (31, 128, 118)
P2 = (171, 86, 61)
CARD = (249, 248, 243)
CARD_2 = (235, 233, 226)
LINE = (82, 88, 98)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = "C:/Windows/Fonts/YuGothB.ttc" if bold else "C:/Windows/Fonts/YuGothR.ttc"
    return ImageFont.truetype(path, size=size)


F_TITLE = font(82, True)
F_H1 = font(38, True)
F_H2 = font(25, True)
F_BODY = font(18)
F_BODY_B = font(18, True)
F_SMALL = font(14)
F_SMALL_B = font(14, True)


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def shadow(base: Image.Image, box, radius=28, blur=24, alpha=56, offset=(0, 14)) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    moved = (box[0] + offset[0], box[1] + offset[1], box[2] + offset[0], box[3] + offset[1])
    d.rounded_rectangle(moved, radius=radius, fill=(20, 23, 29, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)


def marble_bg() -> Image.Image:
    img = Image.new("RGBA", (W, H), BG + (255,))
    d = ImageDraw.Draw(img, "RGBA")
    for x in range(-240, W + 240, 56):
        d.line((x, 0, x + 360, H), fill=(255, 255, 255, 30), width=2)
    for x in range(-180, W + 180, 118):
        d.line((x, 0, x + 420, H), fill=(70, 78, 91, 18), width=1)
    d.ellipse((-240, -160, 620, 420), fill=(255, 255, 255, 70))
    d.ellipse((980, -180, 1740, 380), fill=(118, 130, 146, 34))
    return img


def gradient_card(size, top=CARD, bottom=CARD_2) -> Image.Image:
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    px = img.load()
    for y in range(size[1]):
        t = y / max(1, size[1] - 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(size[0]):
            px[x, y] = color + (246,)
    return img


def paste_card(base: Image.Image, box, radius=30) -> ImageDraw.ImageDraw:
    shadow(base, box, radius=radius)
    mask = Image.new("L", (box[2] - box[0], box[3] - box[1]), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, mask.size[0] - 1, mask.size[1] - 1), radius=radius, fill=255)
    card = gradient_card(mask.size)
    base.alpha_composite(Image.composite(card, Image.new("RGBA", mask.size, (0, 0, 0, 0)), mask), (box[0], box[1]))
    d = ImageDraw.Draw(base, "RGBA")
    d.rounded_rectangle(box, radius=radius, outline=LINE + (42,), width=2)
    d.rounded_rectangle((box[0] + 2, box[1] + 2, box[2] - 2, box[3] - 2), radius=radius - 2, outline=(255, 255, 255, 115), width=1)
    return d


def text_center(d: ImageDraw.ImageDraw, box, text: str, fnt, fill=INK) -> None:
    b = d.textbbox((0, 0), text, font=fnt)
    x = box[0] + (box[2] - box[0] - (b[2] - b[0])) / 2
    y = box[1] + (box[3] - box[1] - (b[3] - b[1])) / 2 - b[1]
    d.text((x, y), text, font=fnt, fill=fill)


def button(d: ImageDraw.ImageDraw, box, label, primary=False) -> None:
    fill = DARK if primary else (255, 255, 252)
    outline = (191, 164, 94) if primary else (70, 77, 88)
    rounded(d, box, 20, fill + (242,), outline + (45,), 1)
    text_center(d, box, label, F_BODY_B, (255, 253, 248) if primary else INK)


def draw_home(base: Image.Image) -> None:
    d = paste_card(base, (70, 80, 720, 900), 34)
    d.text((305, 250), "UNFOLD PROTOTYPE", font=F_SMALL, fill=BRASS)
    d.text((197, 292), "UNFOLD", font=F_TITLE, fill=INK)
    button(d, (200, 430, 590, 496), "オンライン対戦", True)
    button(d, (200, 530, 590, 596), "一人プレイ")
    button(d, (200, 630, 590, 696), "ルール")
    d.text((315, 745), "総 37　今日 1　昨日 0", font=F_SMALL, fill=(145, 132, 112))


def draw_piece_panel(d: ImageDraw.ImageDraw, box, title, chip, color) -> None:
    rounded(d, box, 26, (255, 255, 252, 236), LINE + (36,), 1)
    d.text((box[0] + 22, box[1] + 22), title, font=F_H2, fill=INK)
    rounded(d, (box[0] + 120, box[1] + 20, box[0] + 172, box[1] + 50), 15, color + (255,))
    text_center(d, (box[0] + 120, box[1] + 20, box[0] + 172, box[1] + 50), chip, F_SMALL_B, (255, 255, 255))
    d.text((box[0] + 22, box[1] + 80), "手札", font=F_SMALL, fill=MUTED)
    for i in range(3):
        x = box[0] + 22 + (i % 2) * 142
        y = box[1] + 112 + (i // 2) * 118
        rounded(d, (x, y, x + 124, y + 98), 18, (250, 249, 244, 242), LINE + (28,), 1)
        d.text((x + 14, y + 14), ["ティー", "ソー", "フック"][i], font=F_BODY_B, fill=INK)
        d.text((x + 14, y + 40), "対応駒", font=F_SMALL, fill=MUTED)
    d.text((box[0] + 22, box[3] - 170), "補助行動", font=F_SMALL, fill=MUTED)
    for i, label in enumerate(["手札入れ替え", "駒回収", "展開図回収", "待った"]):
        x = box[0] + 22 + (i % 2) * 142
        y = box[3] - 132 + (i // 2) * 54
        button(d, (x, y, x + 124, y + 42), label)


def draw_board_preview(d: ImageDraw.ImageDraw, box) -> None:
    rounded(d, box, 28, (87, 71, 49, 255), (143, 103, 45, 255), 3)
    side_pad = min(152, max(24, int((box[2] - box[0]) * 0.18)))
    inner = (box[0] + side_pad, box[1] + 38, box[2] - side_pad, box[3] - 38)
    rounded(d, inner, 4, (213, 189, 143, 255), (118, 94, 61, 180), 1)
    cols, rows = 11, 15
    cw = (inner[2] - inner[0]) / cols
    ch = (inner[3] - inner[1]) / rows
    for i in range(cols + 1):
        x = inner[0] + i * cw
        d.line((x, inner[1], x, inner[3]), fill=(105, 82, 52, 140), width=1)
    for i in range(rows + 1):
        y = inner[1] + i * ch
        d.line((inner[0], y, inner[2], y), fill=(105, 82, 52, 140), width=1)
    d.rectangle((inner[0] + 4 * cw, inner[1], inner[0] + 7 * cw, inner[1] + 3 * ch), fill=(73, 144, 130, 72))
    d.rectangle((inner[0] + 4 * cw, inner[3] - 3 * ch, inner[0] + 7 * cw, inner[3]), fill=(189, 104, 76, 86))
    for x, y, txt, color in [
        (5.5, 1.1, "展", P2),
        (4.4, 2.0, "護", P2),
        (6.6, 2.0, "界", P2),
        (5.5, 13.9, "展", P1),
        (4.4, 13.0, "界", P1),
        (6.6, 13.0, "護", P1),
    ]:
        cx = inner[0] + x * cw
        cy = inner[1] + y * ch
        r = 18
        d.regular_polygon((cx, cy, r), n_sides=6, rotation=0, fill=(246, 242, 231, 240), outline=color + (220,))
        text_center(d, (cx - r, cy - r, cx + r, cy + r), txt, F_SMALL_B, INK)


def draw_match(base: Image.Image) -> None:
    d = paste_card(base, (780, 80, 1530, 900), 34)
    d.text((814, 118), "MATCH", font=F_SMALL, fill=BRASS)
    d.text((814, 148), "対NPC戦", font=F_H1, fill=INK)
    for i, label in enumerate(["ロビーへ戻る", "新しく始める", "駒タイプ変更", "ルール"]):
        button(d, (814 + i * 170, 205, 964 + i * 170, 252), label, i == 1)
    rounded(d, (814, 280, 1496, 334), 18, (255, 255, 252, 218), LINE + (34,), 1)
    d.text((834, 298), "駒を動かすか、手札の展開図を選んでください。", font=F_BODY, fill=MUTED)
    draw_piece_panel(d, (814, 380, 1072, 858), "NPC", "後手", P2)
    draw_piece_panel(d, (1238, 380, 1496, 858), "あなた", "先手", P1)
    draw_board_preview(d, (1070, 375, 1240, 858))
    rounded(d, (1086, 392, 1198, 430), 14, (255, 255, 252, 224), (31, 128, 118, 80), 1)
    text_center(d, (1086, 392, 1198, 430), "手番 先手", F_SMALL_B, INK)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img = marble_bg()
    draw_home(img)
    draw_match(img)
    img.convert("RGB").save(OUT_PATH, quality=95)
    print(OUT_PATH)


if __name__ == "__main__":
    main()
