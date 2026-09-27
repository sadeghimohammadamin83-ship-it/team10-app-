"""Brand geometry: the AMIKAT mark (a burgundy M over a beige A) and wordmark.

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
S = 20            # stroke width (a bold wordmark)
H = S / 2
TRACK = 22        # letter spacing
clip = lambda g, w: g.intersection(box(-1, 0, w + 1, CAP))

def g_I():
    return clip(stroke([(H, -40), (H, 140)], S), S)
def g_H(W=70):
    return clip(unary_union([stroke([(H, -40), (H, 140)], S), stroke([(W - H, -40), (W - H, 140)], S), stroke([(H, 50), (W - H, 50)], S)]), W)
def g_N(W=74):
    return clip(unary_union([stroke([(H, -40), (H, 140)], S), stroke([(W - H, -40), (W - H, 140)], S),
                             stroke([(H, 0), (W - H, CAP)], S, (30, 30))]), W)
def g_A(W=86):
    e = H * math.hypot(W / 2, CAP) / CAP       # legs' outer edges land exactly on x = 0 and x = W
    legs = clip(stroke([(e, CAP), (W / 2, 0), (W - e, CAP)], S, (30, 30)), W)
    bar = stroke([(0, 70), (W, 70)], S * .85).intersection(legs.convex_hull)
    return unary_union([legs, bar])
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

def g_T(W=66):
    return clip(unary_union([stroke([(W / 2, -40), (W / 2, 140)], S), stroke([(0, H), (W, H)], S)]), W)
def g_K(W=66):
    """Stem, and two arms meeting it at mid height."""
    j = (S, 52)
    return clip(unary_union([stroke([(H, -40), (H, 140)], S),
                             stroke([j, (W - H, 0)], S, (0, 30)), stroke([(S + 14, 40), (W - H, CAP)], S, (0, 30))]), W)

GLYPH = {'T': g_T, 'K': g_K, 'M': g_M, 'O': g_O, 'H': g_H, 'A': g_A, 'D': g_D, 'I': g_I, 'N': g_N, 'C': g_C, 'F': g_F, 'L': g_L, 'R': g_R}

def wordmark(text='AMIKAT', accent_from=99):
    x, parts = 0.0, {'l': [], 'o': []}
    for i, ch in enumerate(text):
        g = GLYPH[ch]()
        minx, _, maxx, _ = g.bounds
        g = affinity.translate(g, x - minx, 0)
        parts['o' if i >= accent_from else 'l'].append(g)
        x += (maxx - minx) + TRACK
    width = x - TRACK
    return unary_union(parts['l']), unary_union(parts['o']), width

# ── Mark: a burgundy M standing over a beige A (from the AMIKAT identity) ─
# drawn on the original artwork's grid, then scaled to ~150 x 115 units
def _pt(x, y): return ((x - 40) / 3, (y - 40) / 3)

def mark():
    from shapely.geometry import Polygon
    A, P, B, t = (40, 380), (245, 55), (385, 380), 62
    def inward(p, q, sign):
        dx, dy = q[0] - p[0], q[1] - p[1]; n = math.hypot(dx, dy)
        return (-dy / n * t * sign, dx / n * t * sign)
    def at_y(p, q, y): return p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1])
    oL, oR = inward(A, P, 1), inward(P, B, 1)
    L1 = [(A[0] + oL[0], A[1] + oL[1]), (P[0] + oL[0], P[1] + oL[1])]
    R1 = [(P[0] + oR[0], P[1] + oR[1]), (B[0] + oR[0], B[1] + oR[1])]
    # apex of the inner triangle: where the two offset edges meet
    (x1, y1), (x2, y2) = L1; (x3, y3), (x4, y4) = R1
    d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    ix = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / d
    iy = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / d
    inner = Polygon([(at_y(*L1, 400), 400), (ix, iy), (at_y(*R1, 400), 400)])
    beige = Polygon([A, P, B]).difference(inner)
    maroon = Polygon([(210, 380), (210, 232), (240, 172), (270, 225), (480, 40), (480, 380),
                      (410, 380), (410, 177), (270, 300), (270, 380)])
    sc = lambda g: affinity.scale(affinity.translate(g, -40, -40), 1 / 3, 1 / 3, origin=(0, 0))
    return sc(beige), sc(maroon)

def mark_svg_parts():
    beige, maroon = mark()
    body = f'<path class="lm-b" d="{to_path(beige)}"/><path class="lm-m" d="{to_path(maroon)}"/>'
    minx, miny, maxx, maxy = unary_union([beige, maroon]).bounds
    vb = f'0 0 {math.ceil(maxx)} {math.ceil(maxy)}'
    return body, vb

def build():
    mbody, mvb = mark_svg_parts()
    wl, wo, ww = wordmark()
    defs = ('<defs>'
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
    fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#FBF6F2"/>'
           '<style>.lm-b{fill:#E3CAB6}.lm-m{fill:#6E101C}</style>'
           f'<g transform="translate({(512 - w * s) / 2:.1f} {(512 - h * s) / 2:.1f}) scale({s:.4f})">{mbody}</g></svg>')
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
