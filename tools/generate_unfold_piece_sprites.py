from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "laravel-app" / "public" / "assets" / "sprites" / "unfold-pieces"
RAW_DIR = OUT_DIR / "raw"
PROCESSED_DIR = OUT_DIR / "processed"
MARBLE = ROOT / "laravel-app" / "public" / "assets" / "materials" / "marble_01_diff_1k.jpg"
MAGENTA = (255, 0, 255)
CELL = 192
COLS = 4
ROWS = 3


PIECES = [
    {"kind": "king", "label": "\u5c55\u754c\u8005", "short": "\u5c55", "color": "#23877f"},
    {"kind": "realmKnight", "label": "\u754c\u9a0e\u58eb", "short": "\u754c", "color": "#2d6fb5"},
    {"kind": "guard", "label": "\u8b77\u885b\u58eb", "short": "\u8b77", "color": "#6d7a82"},
    {"kind": "chaosBeast", "label": "\u6df7\u6c8c\u7363", "short": "\u6df7", "color": "#7a4fc4"},
    {"kind": "destroyer", "label": "\u6ec5\u754c\u8005", "short": "\u6ec5", "color": "#8e3131"},
    {"kind": "decoy", "label": "\u8a98\u5f15\u58eb", "short": "\u8a98", "color": "#b77c2b"},
    {"kind": "barrier", "label": "\u7d50\u754c\u58eb", "short": "\u7d50", "color": "#4466a6"},
    {"kind": "rider", "label": "\u9a0e\u4e57\u58eb", "short": "\u9a0e", "color": "#397e62"},
    {"kind": "charger", "label": "\u7a81\u6483\u58eb", "short": "\u7a81", "color": "#a65f24"},
    {"kind": "flanker", "label": "\u5074\u6483\u58eb", "short": "\u5074", "color": "#936c2f"},
    {"kind": "disruptor", "label": "\u652a\u4e71\u58eb", "short": "\u652a", "color": "#6b5aa8"},
    {"kind": "vanguard", "label": "\u524d\u885b\u58eb", "short": "\u524d", "color": "#8d7f42"},
]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


FONT_BOLD = font("C:/Windows/Fonts/YuGothB.ttc", 60)
FONT_LABEL = font("C:/Windows/Fonts/BIZ-UDGothicB.ttc", 18)
FONT_SMALL = font("C:/Windows/Fonts/BIZ-UDGothicR.ttc", 14)


def text_center(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fnt, fill, stroke_width=0, stroke_fill=None) -> None:
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    w = box[2] - box[0]
    h = box[3] - box[1]
    draw.text(
        (xy[0] - w / 2, xy[1] - h / 2 - box[1]),
        text,
        font=fnt,
        fill=fill,
        stroke_width=stroke_width,
        stroke_fill=stroke_fill,
    )


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def blend(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def piece_polygon(cx: int, cy: int) -> list[tuple[int, int]]:
    radius = 72
    half_height = int(round(math.sin(math.radians(60)) * radius))
    return [
        (cx + radius, cy),
        (cx + radius // 2, cy + half_height),
        (cx - radius // 2, cy + half_height),
        (cx - radius, cy),
        (cx - radius // 2, cy - half_height),
        (cx + radius // 2, cy - half_height),
    ]


def draw_piece(sheet: Image.Image, index: int, marble: Image.Image) -> None:
    piece = PIECES[index]
    col = index % COLS
    row = index // COLS
    x0 = col * CELL
    y0 = row * CELL
    cx = x0 + CELL // 2
    cy = y0 + CELL // 2
    accent = hex_to_rgb(piece["color"])
    dark = (24, 28, 33)
    brass = (155, 132, 76)

    cell_layer = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    draw = ImageDraw.Draw(cell_layer, "RGBA")
    local_poly = [(x - x0, y - y0) for x, y in piece_polygon(cx, cy)]
    shadow_poly = [(x + 4, y + 6) for x, y in local_poly]
    draw.polygon(shadow_poly, fill=(0, 0, 0, 54))

    mask = Image.new("L", (CELL, CELL), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.polygon(local_poly, fill=255)
    texture = marble.resize((CELL, CELL)).convert("RGBA")
    tint = Image.new("RGBA", (CELL, CELL), (*blend(accent, (255, 255, 255), 0.76), 90))
    face = Image.alpha_composite(texture, tint)
    cell_layer.alpha_composite(Image.composite(face, Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0)), mask))

    draw.polygon(local_poly, outline=(*dark, 255), width=5)
    inner_poly = []
    for x, y in local_poly:
        inner_poly.append((int((x - CELL / 2) * 0.9 + CELL / 2), int((y - CELL / 2) * 0.9 + CELL / 2)))
    draw.polygon(inner_poly, outline=(*brass, 230), width=3)
    text_center(draw, (CELL // 2, CELL // 2 - 8), piece["short"], FONT_BOLD, fill=(20, 23, 27, 255), stroke_width=2, stroke_fill=(248, 246, 238, 210))
    text_center(draw, (CELL // 2, CELL // 2 + 48), piece["label"], FONT_LABEL, fill=(20, 23, 27, 255), stroke_width=1, stroke_fill=(248, 246, 238, 180))
    sheet.alpha_composite(cell_layer, (x0, y0))


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    if MARBLE.exists():
        marble = Image.open(MARBLE).convert("RGB")
    else:
        marble = Image.new("RGB", (256, 256), (220, 216, 204))
    sheet = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (*MAGENTA, 255))
    for index in range(len(PIECES)):
        draw_piece(sheet, index, marble)
    raw_path = RAW_DIR / "unfold-original-pieces-raw-sheet.png"
    sheet.convert("RGB").save(raw_path)
    prompt = (
        "UNFOLD original board-game piece token sheet. "
        "3x4 cells, one token per cell, magenta background for chroma-key cleanup. "
        "Simple regular hexagonal marble and brass fantasy tokens with readable Japanese labels."
    )
    (RAW_DIR / "prompt-used.txt").write_text(prompt, encoding="utf-8")
    metadata = {
        "name": "unfold-original-pieces",
        "cellSize": CELL,
        "rows": ROWS,
        "cols": COLS,
        "background": "#FF00FF",
        "pieces": PIECES,
        "rawSheet": str(raw_path.relative_to(ROOT)).replace("\\", "/"),
    }
    (OUT_DIR / "piece-sprite-source.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print(raw_path)


if __name__ == "__main__":
    main()
