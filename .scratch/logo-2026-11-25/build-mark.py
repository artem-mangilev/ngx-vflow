# Builds the final mark (variant A3 of sheet-a.svg) as one outline on a 64 box without padding:
# final/mark.svg in currentColor, final/mark-light.svg and final/mark-dark.svg in the gradients of brief.md,
# final/favicon.svg in both, final/tile-light.svg and final/tile-dark.svg with a plate. The docs site has copies: assets/logo.svg, favicon.svg.
# A square, a circle and a triangle; a neck is what two "bite" circles leave between the flat side of a node
# and the circle.
import math, pathlib
SIDE, CORNER, R = 22, 5, 12          # the square, its corner radius, the radius of the circle
WAIST, BITE = 6, 3                    # the narrowest width of a neck, the radius of a bite
TRI_W, TRI_H, TRI_R = 22, 24, 3       # the outer box of the triangle, its corner radius
reach = WAIST / 2 + BITE              # from the axis of a neck to where a bite touches the flat side
assert reach <= SIDE / 2 - CORNER and reach <= TRI_H / 2 - TRI_R, 'a bite must touch a flat side, not a corner'
gap = math.sqrt((R + BITE) ** 2 - reach ** 2) - (R - BITE)   # a bite touches the flat side and the circle
size = SIDE + gap + 2 * R
assert abs(size - (2 * R + gap + TRI_W)) < 1e-9, 'the mark is square'
k = 64 / size
cx, cy = R, SIDE + gap + R            # the circle; the square sits above it, the triangle to its right
left, right, edge = cx - SIDE / 2, cx + SIDE / 2, 2 * R + gap   # the sides of the square, the flat side of the triangle
def touch(bx, by):                    # where the bite at (bx, by) touches the circle
    d = math.hypot(cx - bx, cy - by)
    return bx + BITE * (cx - bx) / d, by + BITE * (cy - by) / d
def p(x, y): return f'{x * k:.3f} {y * k:.3f}'
def arc(r, x, y, sweep=1, large=0): return f'A{r * k:.3f} {r * k:.3f} 0 {large} {sweep} {p(x, y)}'
top, bottom, apex = cy - TRI_H / 2 + TRI_R, cy + TRI_H / 2 - TRI_R, edge + TRI_W - TRI_R   # the corners of the triangle
dx, dy = apex - (edge + TRI_R), cy - top
nx, ny = TRI_R * dy / math.hypot(dx, dy), TRI_R * dx / math.hypot(dx, dy)   # the offset of a slanted side
d = ''.join([
    f'M{p(left + CORNER, 0)}H{right * k - CORNER * k:.3f}', arc(CORNER, right, CORNER), f'V{(SIDE - CORNER) * k:.3f}',
    arc(CORNER, right - CORNER, SIDE),
    arc(BITE, *touch(cx + reach, SIDE + BITE), sweep=0), arc(R, *touch(edge - BITE, cy - reach)),
    arc(BITE, edge, cy - reach, sweep=0), f'V{top * k:.3f}',
    arc(TRI_R, edge + TRI_R + nx, top - ny), f'L{p(apex + nx, cy - ny)}', arc(TRI_R, apex + nx, cy + ny),
    f'L{p(edge + TRI_R + nx, bottom + ny)}', arc(TRI_R, edge, bottom), f'V{(cy + reach) * k:.3f}',
    arc(BITE, *touch(edge - BITE, cy + reach), sweep=0), arc(R, *touch(cx - reach, SIDE + BITE), large=1),
    arc(BITE, left + CORNER, SIDE, sweep=0),
    arc(CORNER, left, SIDE - CORNER), f'V{CORNER * k:.3f}', arc(CORNER, left + CORNER, 0), 'Z'])
def svg(fill, defs=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{defs}<path fill="{fill}" d="{d}"/></svg>\n'
def gradient(low, high):   # bottom to top, the light end at the bottom
    return (f'<linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="{low}"/>'
            f'<stop offset="1" stop-color="{high}"/></linearGradient>')
out = pathlib.Path(__file__).parent / 'final'
out.mkdir(exist_ok=True)
(out / 'mark.svg').write_text(svg('currentColor'))
(out / 'mark-light.svg').write_text(svg('url(#g)', gradient('#3282b8', '#0f4c75')))
(out / 'mark-dark.svg').write_text(svg('url(#g)', gradient('#bbe1fa', '#3282b8')))
# The tab icon follows the colour scheme of the browser, not of the site.
(out / 'favicon.svg').write_text(svg('url(#g)', '<style>.a{stop-color:#3282b8}.b{stop-color:#0f4c75}'
    '@media(prefers-color-scheme:dark){.a{stop-color:#bbe1fa}.b{stop-color:#3282b8}}</style>'
    '<linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop class="a" offset="0"/><stop class="b" offset="1"/></linearGradient>'))
# A plate for surfaces the bare mark does not read on: the mark takes 60% of it, so it survives a round crop.
def tile(plate, low, high):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{gradient(low, high)}'
            f'<rect width="64" height="64" rx="9" fill="{plate}"/>'
            f'<path transform="translate(12.8 12.8) scale(.6)" fill="url(#g)" d="{d}"/></svg>\n')
(out / 'tile-light.svg').write_text(tile('#fff', '#3282b8', '#0f4c75'))
(out / 'tile-dark.svg').write_text(tile('#1b262c', '#bbe1fa', '#3282b8'))
print(f'gap {gap:.3f}, size {size:.3f}, waist in a 16 px mark {WAIST * k / 4:.2f} px')
