#!/usr/bin/env python3
"""OG-картинки (1200×630) для раздела чек-листов: public/og/checklists.jpg и public/og/<slug>.jpg.

Запуск локально на macOS (нужны Pillow и системный шрифт SF):
    python3 scripts/gen-og.py
Картинки коммитятся в репозиторий — в CI скрипт не запускается.
Перезапускать после добавления чек-листа или изменения его h1.
"""
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'og'
FONT = '/System/Library/Fonts/SFNS.ttf'
W, H = 1200, 630
PAD = 72
BG = (10, 10, 10)
ACCENT = (239, 93, 43)
WHITE = (255, 255, 255)
GRAY = (156, 163, 175)
DIM = (107, 114, 128)
PREFIX = 'Чек-лист тестирования'


def font(size, weight='Bold'):
    f = ImageFont.truetype(FONT, size)
    f.set_variation_by_name(weight)
    return f


def plural(n, forms):
    a, b = n % 10, n % 100
    return forms[0 if a == 1 and b != 11 else 1 if 2 <= a <= 4 and not 10 <= b < 20 else 2]


def background():
    img = Image.new('RGB', (W, H), BG)
    glow = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(glow)
    d.ellipse((W - 520, -260, W + 260, 420), fill=(70, 30, 14))   # оранжевое свечение справа сверху
    d.ellipse((-300, H - 260, 300, H + 260), fill=(30, 18, 44))   # фиолетовое слева снизу
    return Image.blend(img, glow.filter(ImageFilter.GaussianBlur(120)), 1.0)


def wrap(draw, words, f, width):
    """Перенос по словам; words — список (слово, цвет)."""
    lines, line, w = [], [], 0
    space = draw.textlength(' ', font=f)
    for word, color in words:
        ww = draw.textlength(word, font=f)
        if line and w + space + ww > width:
            lines.append(line)
            line, w = [], 0
        line.append((word, color))
        w += (space if len(line) > 1 else 0) + ww
    if line:
        lines.append(line)
    return lines


def render(path, badge, title_white, title_accent, footer_right):
    img = background()
    d = ImageDraw.Draw(img)

    # Логотип и имя
    logo = Image.open(ROOT / 'public' / 'timoshin_logo.png').convert('RGBA').resize((56, 56), Image.LANCZOS)
    img.paste(logo, (PAD, PAD - 8), logo)
    f_name = font(30)
    d.text((PAD + 72, PAD + 20), 'Денис ', font=f_name, fill=WHITE, anchor='lm')
    d.text((PAD + 72 + d.textlength('Денис ', font=f_name), PAD + 20), 'Тимошин', font=f_name, fill=ACCENT, anchor='lm')

    # Плашка
    f_badge = font(24, 'Medium')
    bw = d.textlength(badge, font=f_badge) + 64
    by = PAD + 92
    d.rounded_rectangle((PAD, by, PAD + bw, by + 48), radius=24, outline=(55, 55, 55), width=2)
    d.ellipse((PAD + 22, by + 19, PAD + 32, by + 29), fill=ACCENT)
    d.text((PAD + 46, by + 24), badge, font=f_badge, fill=(209, 213, 219), anchor='lm')

    # Заголовок: самый крупный размер, при котором он помещается над нижней строкой
    words = [(w, WHITE) for w in title_white.split()] + [(w, ACCENT) for w in title_accent.split()]
    y = by + 92
    room = (H - PAD - 64) - y
    for size in (76, 70, 64, 58, 52, 46):
        f_title = font(size)
        lines = wrap(d, words, f_title, W - 2 * PAD)
        line_h = int(size * 1.12)
        if len(lines) * line_h <= room:
            break
    for line in lines:
        x = PAD
        for word, color in line:
            d.text((x, y), word, font=f_title, fill=color)
            x += d.textlength(word + ' ', font=f_title)
        y += line_h

    # Низ
    f_foot = font(26, 'Medium')
    d.text((PAD, H - PAD), 'denis-timoshin.ru/checklists', font=f_foot, fill=DIM, anchor='ls')
    if footer_right:
        d.text((W - PAD, H - PAD), footer_right, font=f_foot, fill=GRAY, anchor='rs')

    img.save(path, 'JPEG', quality=86, optimize=True, progressive=True)


def main():
    data = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e', '''
import { CONTENT, countChecks } from './src/checklists/content/index.js'
import { CHECKLISTS } from './src/checklists/data.js'
const cat = Object.fromEntries(CHECKLISTS.map(c => [c.slug, c.cat]))
console.log(JSON.stringify(Object.values(CONTENT).map(c => ({ slug: c.slug, h1: c.h1, n: countChecks(c), cat: cat[c.slug] }))))
'''], cwd=ROOT))
    OUT.mkdir(parents=True, exist_ok=True)

    total = sum(c['n'] for c in data)
    render(OUT / 'checklists.jpg',
           f'Бесплатно · {len(data)} {plural(len(data), ["чек-лист", "чек-листа", "чек-листов"])} · {total} проверок',
           'Чек-листы тестирования', 'для каждого компонента', 'от руководителя QA-отдела')

    for c in data:
        h1 = c['h1']
        white, accent = (PREFIX, h1[len(PREFIX):].strip()) if h1.startswith(PREFIX) else (h1, '')
        render(OUT / f"{c['slug']}.jpg",
               f"Чек-лист · {c['n']} {plural(c['n'], ['проверка', 'проверки', 'проверок'])}",
               white, accent, c['cat'])
    print(f'gen-og: {len(data) + 1} картинок в public/og/')


if __name__ == '__main__':
    main()
