# Builds the lockups: the mark of final/mark.svg and the word "vflow" in Nunito Black as outlines.
# final/lockup.svg in currentColor, final/lockup-light.svg and final/lockup-dark.svg by brief.md.
# Needs fonttools and brotli (`pip install fonttools brotli`); the font is in fonts/. Run it after build-mark.py.
import re, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
root = pathlib.Path(__file__).parent
# Font size on the 64 box of the mark, tracking in em. The size is the one that gives Nunito the x-height of
# Geist Bold at 56, less 8%: the ascenders of Nunito are taller.
WORD, SIZE, TRACKING, GAP = 'vflow', 54.6, 0, 20
font = TTFont(root / 'fonts/nunito-latin-900-normal.woff2')
glyphs, names = font.getGlyphSet(), [font.getBestCmap()[ord(c)] for c in WORD]
def kern(a, b):   # the pair adjustment of the font: GPOS pair positioning, glyph pairs and class pairs
    for lookup in font['GPOS'].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            sub = getattr(sub, 'ExtSubTable', sub)
            if getattr(sub, 'LookupType', None) != 2 or a not in sub.Coverage.glyphs: continue
            if sub.Format == 1:
                for rec in sub.PairSet[sub.Coverage.glyphs.index(a)].PairValueRecord:
                    if rec.SecondGlyph == b: return rec.Value1.XAdvance or 0
            else:
                rec = sub.Class1Record[sub.ClassDef1.classDefs.get(a, 0)].Class2Record[sub.ClassDef2.classDefs.get(b, 0)]
                if rec.Value1 and rec.Value1.XAdvance: return rec.Value1.XAdvance
    return 0
# pen positions in font units, then the bounds of the word to place it
x, origins = 0, []
for i, name in enumerate(names):
    origins.append(x)
    x += font['hmtx'][name][0] + TRACKING * 1000 + (kern(name, names[i + 1]) if i + 1 < len(names) else 0)
bounds = BoundsPen(glyphs)
for name, at in zip(names, origins): glyphs[name].draw(TransformPen(bounds, (1, 0, 0, 1, at, 0)))
x0, y0, x1, y1 = bounds.bounds
s = SIZE / 1000
left, baseline = 64 + GAP - x0 * s, 32 + (y0 + y1) / 2 * s   # the word starts after the gap and is centred on the mark
pen = SVGPathPen(glyphs, ntos=lambda v: f'{v:.2f}'.rstrip('0').rstrip('.'))
for name, at in zip(names, origins): glyphs[name].draw(TransformPen(pen, (s, 0, 0, -s, left + at * s, baseline)))
word, width = pen.getCommands(), left + x1 * s
mark = re.search(r' d="([^"]+)"', (root / 'final/mark.svg').read_text()).group(1)
def svg(mark_fill, word_fill, defs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.2f} 64">{defs}'
            f'<path fill="{mark_fill}" d="{mark}"/><path fill="{word_fill}" d="{word}"/></svg>\n')
def gradient(low, high):   # bottom to top, the light end at the bottom
    return (f'<linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="{low}"/>'
            f'<stop offset="1" stop-color="{high}"/></linearGradient>')
(root / 'final/lockup.svg').write_text(svg('currentColor', 'currentColor'))
(root / 'final/lockup-light.svg').write_text(svg('url(#g)', '#1b262c', gradient('#3282b8', '#0f4c75')))
(root / 'final/lockup-dark.svg').write_text(svg('url(#g)', '#fff', gradient('#bbe1fa', '#3282b8')))
print(f'width {width:.2f}, baseline {baseline:.2f}, kerning', [kern(a, b) for a, b in zip(names, names[1:])])
