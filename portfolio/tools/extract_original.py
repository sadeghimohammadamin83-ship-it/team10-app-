"""One-off migration: split the original single-file portfolio (18 MB, everything
inlined as base64) into real, cacheable files. Kept for reference; not needed to
deploy. Usage: python3 tools/extract_original.py path/to/original/index.html"""
import base64, json, os, re, sys
from fontTools.ttLib import TTFont

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..')
s = open(SRC, encoding='utf-8').read()
lines = s.split('\n')

def line_starting(prefix):
    return next(l for l in lines if l.startswith(prefix))

# ── images ──
imgs = json.loads(line_starting('const IMG = ')[len('const IMG = '):].rstrip(';'))
for name, uri in imgs.items():
    data = base64.b64decode(uri.split(',', 1)[1])
    m = re.match(r'pp-(.+)-(\d\d)\.webp$', name)
    path = os.path.join(OUT, 'img', 'proposals', m.group(1), m.group(2) + '.webp') if m else os.path.join(OUT, 'img', name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'wb').write(data)

# ── 3D object pages: served as real pages instead of blob: URLs ──
objs = json.loads(line_starting('window.OBJ_HTML = ')[len('window.OBJ_HTML = '):].rstrip(';'))
os.makedirs(os.path.join(OUT, 'models'), exist_ok=True)
for key, html in objs.items():
    open(os.path.join(OUT, 'models', key.replace('obj-', '') + '.html'), 'w', encoding='utf-8').write(html)

# ── fonts → woff2 ──
os.makedirs(os.path.join(OUT, 'fonts'), exist_ok=True)
for m in re.finditer(r'font-family:"(\w+)";font-style:normal;font-weight:([\d ]+);font-display:swap;src:url\("data:font/(woff2?);base64,([^"]+)"\)', s):
    fam, w, fmt, b = m.groups()
    tmp = os.path.join(OUT, 'fonts', f'_tmp.{fmt}')
    open(tmp, 'wb').write(base64.b64decode(b))
    f = TTFont(tmp); f.flavor = 'woff2'
    f.save(os.path.join(OUT, 'fonts', f'{fam.lower()}-{w.split()[0] if fam=="Poppins" else "var"}.woff2'))
    os.remove(tmp)

# ── brand sprite: same paths, coordinates rounded to 1 decimal ──
sprite = re.search(r'<svg width="0" height="0"[^>]*>(<defs>.*?</defs>)</svg>', s).group(1)
sprite = re.sub(r'(\d+\.\d+)', lambda m: ('%.1f' % float(m.group(1))).rstrip('0').rstrip('.'), sprite)
sprite = re.sub(r',\s+', ',', sprite)
open(os.path.join(OUT, 'tools', 'brand-sprite.svg.txt'), 'w').write(sprite)
print(len(imgs), 'images,', len(objs), 'models, sprite', len(sprite), 'bytes')
