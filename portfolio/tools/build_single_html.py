"""Bundle the whole site into ONE self-contained HTML file (CSS, JS, fonts,
images and 3D model pages embedded) — handy for emailing or opening offline.
The multi-file site stays the version to deploy: it loads far faster.

Usage:  python3 tools/build_single_html.py [output.html]
"""
import base64, json, os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'Amikat.html')
rd = lambda p: open(os.path.join(ROOT, p), encoding='utf-8').read()
b64 = lambda p: base64.b64encode(open(os.path.join(ROOT, p), 'rb').read()).decode()
MIME = {'.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'}
data_uri = lambda p: f"data:{MIME[os.path.splitext(p)[1]]};base64,{b64(p)}"

# CSS with fonts inlined
css = re.sub(r'url\("\.\./(fonts/[^"]+)"\)', lambda m: f'url("{data_uri(m.group(1))}")', rd('css/site.css'))

# Images, with their 800 px variants so phones decode the small ones (srcset works as on the
# live site). Stored as base64 and turned into blob: URLs only when first shown, so pages
# never carry megabyte-long data: strings in their markup.
media = json.loads(re.search(r'window\.MEDIA=(\{.*\});', rd('js/media.js')).group(1))
imgs = {}
for rel, v in media.items():
    imgs[rel] = [MIME[os.path.splitext(rel)[1]], b64('img/' + rel)]
    if len(v) > 2 and v[2]:
        d, f = os.path.split(rel); small = os.path.join(d, 'sm', f).replace(os.sep, '/')
        imgs[small] = [MIME[os.path.splitext(rel)[1]], b64('img/' + small)]

# 3D model pages, opened from blob: URLs at runtime
models = {f[:-5]: rd('models/' + f) for f in sorted(os.listdir(os.path.join(ROOT, 'models'))) if f.endswith('.html')}

app = rd('js/app.js')
patches = [
    ("  const r = mediaRel(n), i = r.lastIndexOf('/') + 1; return 'img/' + (small ? r.slice(0, i) + 'sm/' + r.slice(i) : r); };",
     "  const r = mediaRel(n), i = r.lastIndexOf('/') + 1; return window.IMG_URL(small ? r.slice(0, i) + 'sm/' + r.slice(i) : r); };"),
    ("const modelHref = key => `models/${String(key).replace(/^obj-/, '')}.html`;",
     "const modelHref = key => window.MODEL_URL(String(key).replace(/^obj-/, ''));"),
]
for a, b in patches:
    assert a in app, 'app.js changed; update the bundle patch: ' + a[:40]
    app = app.replace(a, b)

models_js = json.dumps(models).replace('</', '<\\/')  # keep "</script>" inside model pages from closing the tag
# image data lives in inert <script type="application/octet-stream"> blocks before the app
# scripts
# page: the HTML parser skips through them quickly and no script ever parses them as code
img_blocks = ''.join(f'<script type="application/octet-stream" data-img="{k}" data-mime="{v[0]}">{v[1]}</script>\n' for k, v in imgs.items())
runtime = f"""(function(){{var cache={{}},el=null;
window.IMG_URL=function(k){{if(cache[k]) return cache[k];
if(!el){{el={{}}; document.querySelectorAll('script[data-img]').forEach(function(s){{el[s.getAttribute('data-img')]=s;}});}}
var n=el[k]; if(!n) return ''; var s=atob(n.textContent),a=new Uint8Array(s.length); for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i);
return cache[k]=URL.createObjectURL(new Blob([a],{{type:n.getAttribute('data-mime')}}));}};}})();
window.MEDIA={json.dumps(media, separators=(',', ':'))};
(function(){{var src={models_js},cache={{}};
window.MODEL_URL=function(k){{return cache[k]||(cache[k]=URL.createObjectURL(new Blob([src[k]||''],{{type:'text/html'}})));}};}})();"""

html = rd('index.html')
html = html.replace('<link rel="stylesheet" href="css/site.css">', f'<style>\n{css}\n</style>')
html = re.sub(r'<script defer src="js/[^"]+"></script>\n?', '', html)
html = re.sub(r'<link rel="(?:preload|manifest)"[^>]*>\n?', '', html)
html = re.sub(r'<link rel="(icon|apple-touch-icon)" href="(img/[^"]+)"', lambda m: f'<link rel="{m.group(1)}" href="{data_uri(m.group(2))}"', html)
# Same order as index.html; the Firebase SDK and Persian strings, normally loaded on demand, are inlined.
parts = [runtime] + [rd('js/' + f) for f in ('firebase-config.js', 'data.js', 'i18n-fa.js', 'dc-scene.js', 'vendor/firebase.js', 'cloud.js', 'account.js')] + [app]
safe = lambda js: js.replace('</script', '<\\/script')   # a literal "</script" inside JS would end the tag
scripts = ''.join('<script>\n' + safe(js) + '\n</script>\n' for js in parts)
html = html.replace('</body>', img_blocks + scripts + '</body>')   # data first: the app starts as soon as its script is parsed
open(OUT, 'w', encoding='utf-8').write(html)
print(f'{OUT}: {os.path.getsize(OUT) / 1e6:.1f} MB')
