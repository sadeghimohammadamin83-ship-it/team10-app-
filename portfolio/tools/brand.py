"""Brand geometry: the A-hall mark and the ARCHFOLIO wordmark.

Everything is built from straight strokes of one constant width on a
100-unit cap height, mitred and cut flat at the cap/base lines, then
exported as exact filled outlines. Re-run after editing the constants:

    python3 tools/brand.py          # updates the sprite in index.html + img/logo-mark.svg
Requires shapely (pip install shapely).
"""
import math, os, re
from shapely.geometry import LineString, Point, box
from shapely.ops import unary_union
from shapely import affinity

ROOT = os.path.join(os.path.dirname(__file__), '..')
CAP = 100

def stroke(points, w, extend=(0, 0)):
    """Centre-line stroke with mitred joins and flat ends; ends can be pushed
    past the cap/base line so the later clip cuts them perfectly flat."""
    pts = list(points)
    for end, dist in ((0, extend[0]), (-1, extend[1])):
        if not dist: continue
        a, b = (pts[0], pts[1]) if end == 0 else (pts[-1], pts[-2])
        dx, dy = a[0] - b[0], a[1] - b[1]; L = math.hypot(dx, dy)
        new = (a[0] + dx / L * dist, a[1] + dy / L * dist)
        if end == 0: pts[0] = new
        else: pts[-1] = new
    return LineString(pts).buffer(w / 2, cap_style='flat', join_style='mitre', mitre_limit=8)

def to_path(geom):
    out = []
    for p in getattr(geom, 'geoms', [geom]):
        for ring in [p.exterior, *p.interiors]:
            out.append('M' + 'L'.join(f'{round(x, 1):g} {round(y, 1):g}' for x, y in list(ring.coords)[:-1]) + 'Z')
    return ''.join(out)

# ── Wordmark ──────────────────────────────────────────────────────────
S = 10.5          # stroke width
H = S / 2
TRACK = 30        # letter spacing
clip = lambda g, w: g.intersection(box(-1, 0, w + 1, CAP))

def g_I():
    return clip(stroke([(H, -40), (H, 140)], S), S)
def g_H(W=70):
    return clip(unary_union([stroke([(H, -40), (H, 140)], S), stroke([(W - H, -40), (W - H, 140)], S), stroke([(H, 50), (W - H, 50)], S)]), W)
def g_N(W=74):
    return clip(unary_union([stroke([(H, -40), (H, 140)], S), stroke([(W - H, -40), (W - H, 140)], S),
                             stroke([(H, 0), (W - H, CAP)], S, (30, 30))]), W)
def g_A(W=80):      # the house-roof A — no crossbar, as in the original identity
    e = H * math.hypot(W / 2, CAP) / CAP       # legs' outer edges land exactly on x = 0 and x = W
    return clip(stroke([(e, CAP), (W / 2, 0), (W - e, CAP)], S, (30, 30)), W)
def g_M(W=88):
    return clip(unary_union([stroke([(H, -40), (H, 140)], S), stroke([(W - H, -40), (W - H, 140)], S),
                             stroke([(H, 0), (W / 2, 62), (W - H, 0)], S, (30, 30))]), W)
def g_O():
    return Point(50, 50).buffer(50, 48).difference(Point(50, 50).buffer(50 - S, 48))
def g_D(W=82):
    cx = W - 50        # bowl: a half circle to the right of a straight stem
    half = lambda r: Point(cx, 50).buffer(r, 48).intersection(box(cx, -1, cx + 60, CAP + 1))
    outer = unary_union([box(0, 0, cx, CAP), half(50)])
    inner = unary_union([box(S, S, cx, CAP - S), half(50 - S)])
    return outer.difference(inner)

def g_C(open_deg=42):
    """The O ring with a wedge cut out on the right; the terminals are cut along radii."""
    t = math.tan(math.radians(open_deg))
    wedge = LineString([(50, 50), (160, 50 - 110 * t)]).union(LineString([(50, 50), (160, 50 + 110 * t)])).convex_hull
    return g_O().difference(wedge)
def g_F(W=60, mid=.84):
    return clip(unary_union([stroke([(H, -40), (H, 140)], S), stroke([(0, H), (W, H)], S), stroke([(0, 50), (W * mid, 50)], S)]), W)
def g_L(W=58):
    return clip(unary_union([stroke([(H, -40), (H, 140)], S), stroke([(0, CAP - H), (W, CAP - H)], S)]), W)
def g_R(W=70, BY=56):
    """Stem, a half-height bowl built like the D's, and a straight leg to the base."""
    r = BY / 2; cx = W - r - 6
    half = lambda rad: Point(cx, r).buffer(rad, 48).intersection(box(cx, -1, cx + 60, BY + 1))
    bowl = unary_union([box(0, 0, cx, BY), half(r)]).difference(unary_union([box(S, S, cx, BY - S), half(r - S)]))
    leg = stroke([(cx - 2, BY - H), (W - H, CAP)], S, (0, 30))
    return clip(unary_union([stroke([(H, -40), (H, 140)], S), bowl, leg]), W)

GLYPH = {'M': g_M, 'O': g_O, 'H': g_H, 'A': g_A, 'D': g_D, 'I': g_I, 'N': g_N, 'C': g_C, 'F': g_F, 'L': g_L, 'R': g_R}

def wordmark(text='ARCHFOLIO', accent_from=4):
    x, parts = 0.0, {'l': [], 'o': []}
    for i, ch in enumerate(text):
        g = GLYPH[ch]()
        minx, _, maxx, _ = g.bounds
        g = affinity.translate(g, x - minx, 0)
        parts['o' if i >= accent_from else 'l'].append(g)
        x += (maxx - minx) + TRACK
    width = x - TRACK
    return unary_union(parts['l']), unary_union(parts['o']), width

# ── Mark: an A drawn as a gabled hall, a server rack standing under the ridge ─
T = 15                              # mark stroke
PEAK = (80, 16)                     # ridge
SPAN = 60                           # half span of the legs' centre lines at the base
BASE = 104

def mark():
    area = box(-40, 0, 240, BASE)
    silver = stroke([(PEAK[0] - SPAN, BASE), PEAK, (PEAK[0] + SPAN, BASE)], T, (30, 30)).intersection(area)
    minx = silver.bounds[0]
    return affinity.translate(silver, -minx, 0), -minx

RACK = dict(w=30, h=46)

def mark_svg_parts():
    silver, dx = mark()
    cx = PEAK[0] + dx
    w, h = RACK['w'], RACK['h']
    x, y = cx - w / 2, BASE - h
    units = ''.join(f'<rect x="{x + 5:g}" y="{y + 6 + i * 5:g}" width="{w - 15}" height="2.6" rx=".5" fill="#262B33"/>' for i in range(8))
    leds = ''.join(f'<rect class="lm-o" x="{x + w - 8:g}" y="{y + 6 + i * 5:g}" width="3" height="2.6" rx=".6"/>' for i in (0, 1, 2, 4, 5, 7))
    rack = (f'<rect x="{x:g}" y="{y:g}" width="{w}" height="{h}" rx="1.4" fill="#0E1115" stroke="#3E444E" stroke-width="1.4"/>'
            f'<rect x="{x + 2.5:g}" y="{y + 2.5:g}" width="{w - 5}" height="{h - 3}" rx=".8" fill="none" stroke="#1F242B" stroke-width="1"/>'
            f'{units}{leds}')
    # the floor: the A's crossbar, drawn as a lit slab between the legs
    fl = cx - SPAN + T * .9; fr = cx + SPAN - T * .9
    floor = f'<rect class="lm-f" x="{fl:.1f}" y="{BASE + 1.5}" width="{fr - fl:.1f}" height="2.4" rx="1.2"/>'
    body = f'<path class="lm-l" d="{to_path(silver)}"/>{rack}{floor}'
    minx, miny, maxx, maxy = silver.bounds
    vb = f'0 0 {math.ceil(maxx)} {BASE + 5}'
    return body, vb

def build():
    mbody, mvb = mark_svg_parts()
    wl, wo, ww = wordmark()
    defs = ('<defs>'
            '<linearGradient id="amGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--lm1)"/><stop offset=".55" style="stop-color:var(--lm2)"/><stop offset="1" style="stop-color:var(--lm3)"/></linearGradient>'
            '<linearGradient id="amGradLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#DCE0E5"/><stop offset="1" stop-color="#9FA5AD"/></linearGradient>'
            '<linearGradient id="amFloor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF7A1A" stop-opacity="0"/><stop offset=".35" stop-color="#FF7A1A"/><stop offset="1" stop-color="#FF7A1A"/></linearGradient>'
            f'<symbol id="amMark" viewBox="{mvb}">{mbody}</symbol>'
            f'<symbol id="amWord" viewBox="0 0 {math.ceil(ww)} {CAP}"><path class="wm-l" d="{to_path(wl)}"/><path class="wm-o" d="{to_path(wo)}"/></symbol>'
            '</defs>')
    # sprite in index.html
    p = os.path.join(ROOT, 'index.html'); html = open(p, encoding='utf-8').read()
    html = re.sub(r'(<svg width="0" height="0" class="sprite"[^>]*>).*?(</svg>)', lambda m: m.group(1) + defs + m.group(2), html, count=1, flags=re.S)
    open(p, 'w', encoding='utf-8').write(html)
    # standalone favicon / app mark on a dark tile
    w, h = map(float, mvb.split()[2:])
    s = 0.72 * 512 / max(w, h)
    fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#0A0B0D"/>'
           '<defs><linearGradient id="amGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#DCE0E5"/><stop offset="1" stop-color="#9FA5AD"/></linearGradient>'
           '<linearGradient id="amFloor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF7A1A" stop-opacity="0"/><stop offset=".35" stop-color="#FF7A1A"/><stop offset="1" stop-color="#FF7A1A"/></linearGradient></defs>'
           '<style>.lm-l{fill:url(#amGrad)}.lm-p{fill:#2C3038}.lm-o{fill:#FF7A1A}.lm-f{fill:url(#amFloor)}</style>'
           f'<g transform="translate({(512 - w * s) / 2:.1f} {(512 - h * s) / 2 + 6:.1f}) scale({s:.4f})">{mbody}</g></svg>')
    open(os.path.join(ROOT, 'img', 'logo-mark.svg'), 'w').write(fav)
    # keep the outer <svg> viewBoxes that <use> these symbols in step
    wvb = f'0 0 {math.ceil(ww)} {CAP}'
    for f in ('js/app.js', 'index.html'):
        fp = os.path.join(ROOT, f); src = open(fp, encoding='utf-8').read()
        for sym, vb in (('amMark', mvb), ('amWord', wvb)):
            src = re.sub(r'(<svg[^>]*?)viewBox="[^"]*"([^>]*>\s*<use href="#' + sym + r'"/>)', lambda m: f'{m.group(1)}viewBox="{vb}"{m.group(2)}', src)
        open(fp, 'w', encoding='utf-8').write(src)
    print('mark viewBox', mvb, '| wordmark width', round(ww), '| sprite bytes', len(defs))

if __name__ == '__main__':
    build()
