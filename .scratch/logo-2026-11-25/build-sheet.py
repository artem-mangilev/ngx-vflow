# Builds sheet.svg (the current mark and the sketches) and sheet-a.svg (sketch A and its refinements),
# drawn by the decisions of brief.md —
# no tile, the Vflow Studio gradient, a light and a dark scheme, one colour, 32/16 px, the lockup with "vflow".
# `python3 build-sheet.py square` also writes square copies: Quick Look crops a non-square SVG.
import base64, re, pathlib, sys
root = pathlib.Path(__file__).parent
cur = re.search(r'<path[^>]* d="([^"]+)"', (root / '../../apps/docs/src/assets/logo.svg').read_text()).group(1)
# Sketches live on a 64-unit grid; nodes are fills, edges are strokes of one width. Each has a square, a circle
# and a triangle.
NOW = 'Сейчас'
sketches = {
  NOW: ('0 0 997 997', f'<path d="{cur}"/>'),
  'A · прямые рёбра': ('0 0 64 64', '''<rect x="8" y="5" width="22" height="22" rx="5.5"/><circle cx="19" cy="46" r="12"/>
    <path d="M19 25V36M29 46H44" fill="none" stroke-width="7"/><path d="M43 36.5L57 46L43 55.5Z" stroke-width="3" stroke-linejoin="round"/>'''),
  'B · ступенька': ('0 0 64 64', '''<rect x="6" y="6" width="23" height="23" rx="5.5"/><circle cx="46" cy="46" r="12.5"/>
    <path d="M17.5 27V33Q17.5 46 30.500 46H36M46 24V35" fill="none" stroke-width="7"/>
    <path d="M46 8L56 24.500H36Z" stroke-width="3" stroke-linejoin="round"/>'''),
  'C · развилка': ('0 0 64 64', '''<rect x="5" y="22" width="20" height="20" rx="5"/><circle cx="48" cy="15" r="10"/>
    <path d="M48 39.5L57.5 56H38.5Z" stroke-width="3" stroke-linejoin="round"/>
    <path d="M23 32C33 32 29 15 40 15M23 32C33 32 31 49 44 49" fill="none" stroke-width="4.5"/>'''),
  'D · кривая': ('0 0 64 64', '''<rect x="4" y="6" width="22" height="22" rx="5.5"/><circle cx="48" cy="46" r="12"/>
    <path d="M24 17C40 17 24 46 38 46M48 24V35" fill="none" stroke-width="5"/>
    <path d="M48 8L57.500 24.500H38.500Z" stroke-width="3" stroke-linejoin="round"/>'''),
}
# Sketch A brought to the grid: the mark fills 5..59 on both axes, the gaps between nodes are 8, the triangle is
# as large as the circle. A2 has a thicker edge and a softer triangle.
SQUARE, CIRCLE = '<rect x="6" y="5" width="22" height="22" rx="5.5" stroke-width="0"/>', '<circle cx="17" cy="47" r="12" stroke-width="0"/>'
refined = {
  NOW: sketches[NOW],
  'A · эскиз': sketches['A · прямые рёбра'],
  'A1 · по сетке': ('0 0 64 64', SQUARE + CIRCLE + '''<path d="M17 25V37M27 47H39" fill="none" stroke-width="7"/>
    <path d="M39 37L57 47L39 57Z" stroke-width="4" stroke-linejoin="round"/>'''),
  'A2 · толще ребро': ('0 0 64 64', SQUARE + CIRCLE + '''<path d="M17 25V37M27 47H40" fill="none" stroke-width="9"/>
    <path d="M40 38L56 47L40 56Z" stroke-width="6" stroke-linejoin="round"/>'''),
  # The joints of the current mark: a neck is what two circles of radius 3 leave, each touching the flat side of
  # one node and the circle. A waist of 6 and that radius give a gap of 4.75 (36 + (gap + 9)² = 15²), so the mark
  # is 50.75 wide and is scaled to the same 5..59. The waist comes to 1.6 px in a 16 px mark.
  'A3 · шейки': ('0 0 64 64', '''<g transform="translate(5 5) scale(1.064) translate(-5 -5)" stroke-width="0">
    <rect x="6" y="5" width="22" height="22" rx="5"/><circle cx="17" cy="43.75" r="12"/>
    <path d="M11 26H23V27A3 3 0 0 0 21.8 32.75H12.2A3 3 0 0 0 11 27Z"/>
    <path d="M34.75 37.75V49.75H33.75A3 3 0 0 0 28 48.55V38.95A3 3 0 0 0 33.75 37.75Z"/>
    <path d="M36.75 34.75L52.75 43.75L36.75 52.75Z" stroke-width="6" stroke-linejoin="round"/></g>'''),
}
INK, DEEP, BRAND, PALE, NIGHT = '#1b262c', '#0f4c75', '#3282b8', '#bbe1fa', '#0a0a0a'
# The gradients run in the coordinates of a mark, bottom to top, the light end at the bottom. The first pair is
# for the current mark (the y range of its path), the second for the 64 grid.
def gradient(id, y1, y2, low, high):
    return (f'<linearGradient id="{id}" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="{y1}" y2="{y2}">'
            f'<stop offset="0" stop-color="{low}"/><stop offset="1" stop-color="{high}"/></linearGradient>')
defs = ['<defs>', gradient('L0', 870, 200, BRAND, DEEP), gradient('D0', 870, 200, PALE, BRAND),
       gradient('L1', 58, 5, BRAND, DEEP), gradient('D1', 58, 5, PALE, BRAND), '</defs>']
# Geist Sans is not installed system-wide; it is embedded from the Studio checkout next to this repo.
font = root / '../../../vflow-studio/public/fonts/geist-sans-latin-600-normal.woff2'
if font.exists():
    defs.append("<style>@font-face{font-family:'Geist Sans';font-weight:600;src:url(data:font/woff2;base64,"
               + base64.b64encode(font.read_bytes()).decode() + ")}</style>")
def build(marks, file):
    out, col = list(defs), 240
    for i, (name, (vb, body)) in enumerate(marks.items()):
        out.append(f'<symbol id="m{i}" viewBox="{vb}">{body}</symbol>')
        x, g = 20 + i * col, min(i, 1)
        light, dark = f'url(#L{g})', f'url(#D{g})'
        def use(px, ux, uy, paint, pad=0):
            ux, uy, px = ux + px * pad, uy + px * pad, px * (1 - 2 * pad)
            # sketches fill their box; the current mark carries its own padding, so it is cropped
            if not i: ux, uy, px = ux - px * .3, uy - px * .3, px * 1.6
            return f'<use href="#m{i}" x="{ux:.2f}" y="{uy:.2f}" width="{px:.2f}" height="{px:.2f}" fill="{paint}" stroke="{paint}"/>'
        def night(ny, h):
            return f'<rect x="{x}" y="{ny}" width="220" height="{h}" rx="8" fill="{NIGHT}"/>'
        def word(tx, ty, color):
            return (f'<text x="{tx}" y="{ty}" font-family="\'Geist Sans\', system-ui" font-size="30" font-weight="600" '
                    f'letter-spacing="-.6" fill="{color}">vflow</text>')
        out.append(f'<text x="{x}" y="30" font-family="system-ui" font-size="15" font-weight="600" fill="#222">{name}</text>')
        out.append(use(200, x + 10, 45, light))
        out.append(night(260, 220) + use(220, x, 260, dark, pad=.1))
        # small sizes: gradient, then one colour
        out.append(use(32, x, 500, light) + use(16, x + 44, 508, light) + use(32, x + 100, 500, INK) + use(16, x + 144, 508, INK))
        out.append(night(548, 56) + use(32, x + 12, 560, dark) + use(16, x + 56, 568, dark)
                   + use(32, x + 112, 560, '#fff') + use(16, x + 156, 568, '#fff'))
        out.append(use(40, x, 624, light) + word(x + 52, 655, INK))
        out.append(night(680, 64) + use(40, x + 12, 692, dark) + word(x + 64, 723, '#fff'))
    w, h = 20 + col * len(marks), 764
    def write(name, height):
        (root / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {height}" width="{w}" height="{height}">'
                                 f'<rect width="{w}" height="{height}" fill="#fff"/>{"".join(out)}</svg>')
    write(file + '.svg', h)
    if sys.argv[1:] == ['square']: write(file + '-square.svg', w)
build(sketches, 'sheet')
build(refined, 'sheet-a')
