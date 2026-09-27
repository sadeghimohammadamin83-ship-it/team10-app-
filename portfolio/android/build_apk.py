"""Build the Android app (a full-screen WebView around the portfolio).

    python3 android/build_apk.py [out.apk]

No Android SDK is needed. The binary manifest (AXML) and resource table
(resources.arsc) are written directly here, following the formats in AOSP's
ResourceTypes.h; the Java is compiled with javac against android.jar and
dexed with Google's dx; the APK is signed (v1 + v2) with Google's apksig.
Those three jars are downloaded once from Maven Central into android/.cache.

Signing key: android/.cache is NOT the place to keep it. The key lives at
$APK_KEYSTORE (default ~/.amikat-android/release.p12) with its password in
the same folder. Keep that folder: installing an update over an existing app
requires the same key.
"""
import os, secrets, shutil, struct, subprocess, sys, urllib.request, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
CACHE = os.path.join(HERE, '.cache')
BUILD = os.path.join(CACHE, 'build')
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, 'dist', 'Amikat.apk')

APP_ID = 'com.amikat.app'
LABEL = 'Amikat'
VERSION_CODE, VERSION_NAME = 2, '1.1'
MIN_SDK, TARGET_SDK = 21, 34

MAVEN = 'https://repo1.maven.org/maven2/'
JARS = {
    'android.jar': 'com/google/android/android/4.1.1.4/android-4.1.1.4.jar',   # compile-time API stubs
    'dx.jar': 'com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar',
    'apksig.jar': 'com/android/tools/build/apksig/2.3.0/apksig-2.3.0.jar',
}
# Site files shipped in the app (tools, docs and this folder stay out).
SITE_ITEMS = ['index.html', 'site.webmanifest', 'css', 'js', 'img', 'fonts', 'models']

# ── android.R.attr / android.R.style public IDs (stable across releases) ──
A = dict(theme=0x01010000, label=0x01010001, icon=0x01010002, name=0x01010003, exported=0x01010010,
         configChanges=0x0101001f, drawable=0x01010199, minSdkVersion=0x0101020c, versionCode=0x0101021b,
         versionName=0x0101021c, windowSoftInputMode=0x0101022b, targetSdkVersion=0x01010270,
         allowBackup=0x01010280, hardwareAccelerated=0x010102d3, supportsRtl=0x010103af)
THEME_DEVICE_DEFAULT_NO_ACTION_BAR = 0x01030129
ANDROID_NS = 'http://schemas.android.com/apk/res/android'

# ═══════════════════════════════ binary XML ═══════════════════════════════
def string_pool(strings):
    """UTF-16 ResStringPool chunk."""
    offsets, data = [], b''
    for s in strings:
        offsets.append(len(data))
        enc = s.encode('utf-16-le')
        n = len(s)
        head = struct.pack('<H', n) if n < 0x8000 else struct.pack('<HH', 0x8000 | (n >> 16), n & 0xFFFF)
        data += head + enc + b'\0\0'
    data += b'\0' * (-len(data) % 4)
    header_size = 28
    strings_start = header_size + 4 * len(strings)
    body = b''.join(struct.pack('<I', o) for o in offsets) + data
    return struct.pack('<HHIIIIII', 0x0001, header_size, header_size + len(body), len(strings), 0, 0, strings_start, 0) + body

class El:
    def __init__(self, tag, attrs=(), children=()):
        self.tag, self.attrs, self.children = tag, list(attrs), list(children)

def ref(i): return ('ref', i)

def axml(root):
    """Encode an element tree. attrs: (name, value); android: names get resource IDs.
    value: str, int, bool, ('ref', id) or ('hex', n)."""
    res_names, other = [], []
    def collect(e):
        for n, v in e.attrs:
            if n.startswith('android:'):
                if n[8:] not in res_names: res_names.append(n[8:])
            elif n not in other: other.append(n)
            if isinstance(v, str) and v not in other: other.append(v)
        if e.tag not in other: other.append(e.tag)
        for c in e.children: collect(c)
    collect(root)
    res_names.sort(key=lambda n: A[n])
    pool = res_names + [s for s in ['android', ANDROID_NS] + other if s not in res_names]
    pool = list(dict.fromkeys(pool))
    idx = {s: i for i, s in enumerate(pool)}
    NONE = 0xFFFFFFFF
    chunks = [string_pool(pool)]
    rmap = b''.join(struct.pack('<I', A[n]) for n in res_names)
    chunks.append(struct.pack('<HHI', 0x0180, 8, 8 + len(rmap)) + rmap)
    node = lambda t, ext: struct.pack('<HHIII', t, 16, 16 + len(ext), 1, NONE) + ext
    chunks.append(node(0x0100, struct.pack('<II', idx['android'], idx[ANDROID_NS])))

    def value(v):
        if isinstance(v, bool): return NONE, 0x12, 0xFFFFFFFF if v else 0
        if isinstance(v, int): return NONE, 0x10, v
        if isinstance(v, tuple) and v[0] == 'ref': return NONE, 0x01, v[1]
        if isinstance(v, tuple) and v[0] == 'hex': return NONE, 0x11, v[1]
        return idx[v], 0x03, idx[v]

    def emit(e):
        attrs = []
        for n, v in e.attrs:
            ns = idx[ANDROID_NS] if n.startswith('android:') else NONE
            key = n[8:] if n.startswith('android:') else n
            raw, typ, data = value(v)
            order = A.get(key, 0) if ns != NONE else 0
            attrs.append((order, struct.pack('<IIIHBBI', ns, idx[key], raw, 8, 0, typ, data)))
        attrs.sort(key=lambda a: a[0])          # framework reads attributes in resource-ID order
        ext = struct.pack('<IIHHHHHH', NONE, idx[e.tag], 20, 20, len(attrs), 0, 0, 0) + b''.join(a[1] for a in attrs)
        chunks.append(node(0x0102, ext))
        for c in e.children: emit(c)
        chunks.append(node(0x0103, struct.pack('<II', NONE, idx[e.tag])))
    emit(root)
    chunks.append(node(0x0101, struct.pack('<II', idx['android'], idx[ANDROID_NS])))
    body = b''.join(chunks)
    return struct.pack('<HHI', 0x0003, 8, 8 + len(body)) + body

# ═══════════════════════════════ resources.arsc ═══════════════════════════
CONFIG_DENSITY, CONFIG_VERSION = 0x0100, 0x0400
DENSITY_XXXHIGH, DENSITY_ANY = 640, 0xFFFE

def config(density=0, sdk=0):
    c = bytearray(64)
    struct.pack_into('<I', c, 0, 64)
    struct.pack_into('<H', c, 14, density)
    struct.pack_into('<H', c, 24, sdk)
    return bytes(c)

def arsc(types, values):
    """types: [(type_name, [entry_name...], [(config_bytes, {entry_name: value_string})...], spec_flags)]"""
    vpool = list(dict.fromkeys(values))
    vidx = {s: i for i, s in enumerate(vpool)}
    type_names = [t[0] for t in types]
    keys = list(dict.fromkeys(k for t in types for k in t[1]))
    kidx = {k: i for i, k in enumerate(keys)}
    type_pool, key_pool = string_pool(type_names), string_pool(keys)
    body = b''
    for tid, (tname, entries, configs, spec) in enumerate(types, 1):
        flags = b''.join(struct.pack('<I', spec) for _ in entries)
        body += struct.pack('<HHIBBHI', 0x0202, 16, 16 + len(flags), tid, 0, 0, len(entries)) + flags
        for cfg, vals in configs:
            header_size = 20 + len(cfg)
            offs, data = b'', b''
            for e in entries:
                if e in vals:
                    offs += struct.pack('<I', len(data))
                    data += struct.pack('<HHI', 8, 0, kidx[e]) + struct.pack('<HBBI', 8, 0, 0x03, vidx[vals[e]])
                else:
                    offs += struct.pack('<I', 0xFFFFFFFF)
            entries_start = header_size + len(offs)
            chunk = struct.pack('<HHIBBHII', 0x0201, header_size, entries_start + len(data), tid, 0, 0, len(entries), entries_start) + cfg + offs + data
            body += chunk
    name = APP_ID.encode('utf-16-le').ljust(256, b'\0')
    pkg_header = 288
    type_off = pkg_header
    key_off = type_off + len(type_pool)
    pkg = struct.pack('<HHII', 0x0200, pkg_header, pkg_header + len(type_pool) + len(key_pool) + len(body), 0x7F) + name + \
          struct.pack('<IIIII', type_off, len(type_names), key_off, len(keys), 0) + type_pool + key_pool + body
    gpool = string_pool(vpool)
    return struct.pack('<HHII', 0x0002, 12, 12 + len(gpool) + len(pkg), 1) + gpool + pkg

# ═══════════════════════════════ build steps ══════════════════════════════
def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for name, path in JARS.items():
        dst = os.path.join(CACHE, name)
        if not os.path.exists(dst):
            print('downloading', path.rsplit('/', 1)[1])
            urllib.request.urlretrieve(MAVEN + path, dst)

def run(*cmd, env=None):
    subprocess.run(cmd, check=True, env=env)

def compile_dex():
    classes = os.path.join(BUILD, 'classes')
    shutil.rmtree(classes, ignore_errors=True); os.makedirs(classes)
    srcs = [os.path.join(dp, f) for dp, _, fs in os.walk(os.path.join(HERE, 'src')) for f in fs if f.endswith('.java')]
    run('javac', '-nowarn', '-Xlint:-options', '--release', '8', '-cp', os.path.join(CACHE, 'android.jar'), '-d', classes, *srcs)
    dex = os.path.join(BUILD, 'classes.dex')
    run('java', '-cp', os.path.join(CACHE, 'dx.jar'), 'com.android.dx.command.Main', '--dex', f'--min-sdk-version={MIN_SDK}', f'--output={dex}', classes)
    return dex

def manifest():
    return axml(El('manifest', [('package', APP_ID), ('android:versionCode', VERSION_CODE), ('android:versionName', VERSION_NAME)], [
        El('uses-sdk', [('android:minSdkVersion', MIN_SDK), ('android:targetSdkVersion', TARGET_SDK)]),
        El('uses-permission', [('android:name', 'android.permission.INTERNET')]),
        El('application', [('android:label', LABEL), ('android:icon', ref(0x7F020000)), ('android:theme', ref(THEME_DEVICE_DEFAULT_NO_ACTION_BAR)),
                           ('android:allowBackup', True), ('android:hardwareAccelerated', True), ('android:supportsRtl', True)], [
            El('activity', [('android:name', APP_ID + '.MainActivity'), ('android:exported', True),
                            # orientation|keyboardHidden|screenSize|smallestScreenSize|screenLayout|uiMode: keep the page on rotate
                            ('android:configChanges', ('hex', 0x0FA0)), ('android:windowSoftInputMode', ('hex', 0x10))], [
                El('intent-filter', [], [El('action', [('android:name', 'android.intent.action.MAIN')]),
                                         El('category', [('android:name', 'android.intent.category.LAUNCHER')])])])])]))

ICON_FILES = {'res/drawable-xxxhdpi-v4/ic_bg.png': 'ic_bg.png', 'res/drawable-xxxhdpi-v4/ic_fg.png': 'ic_fg.png',
              'res/mipmap-xxxhdpi-v4/ic_launcher.png': 'ic_legacy.png'}
ADAPTIVE = 'res/mipmap-anydpi-v26/ic_launcher.xml'

def resources():
    # 0x7F01xxxx drawable (ic_bg, ic_fg) · 0x7F02xxxx mipmap (ic_launcher)
    table = arsc([
        ('drawable', ['ic_bg', 'ic_fg'], [(config(DENSITY_XXXHIGH), {'ic_bg': 'res/drawable-xxxhdpi-v4/ic_bg.png', 'ic_fg': 'res/drawable-xxxhdpi-v4/ic_fg.png'})], CONFIG_DENSITY),
        ('mipmap', ['ic_launcher'], [(config(DENSITY_XXXHIGH), {'ic_launcher': 'res/mipmap-xxxhdpi-v4/ic_launcher.png'}),
                                     (config(DENSITY_ANY, 26), {'ic_launcher': ADAPTIVE})], CONFIG_DENSITY | CONFIG_VERSION),
    ], ['res/drawable-xxxhdpi-v4/ic_bg.png', 'res/drawable-xxxhdpi-v4/ic_fg.png', 'res/mipmap-xxxhdpi-v4/ic_launcher.png', ADAPTIVE])
    adaptive = axml(El('adaptive-icon', [], [El('background', [('android:drawable', ref(0x7F010000))]),
                                             El('foreground', [('android:drawable', ref(0x7F010001))])]))
    return table, adaptive

STORED = ('.png', '.webp', '.jpg', '.woff2', '.arsc')

def package(unsigned, dex, man, table, adaptive):
    with zipfile.ZipFile(unsigned, 'w') as z:
        def add(name, data=None, path=None):
            info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_STORED if name.endswith(STORED) else zipfile.ZIP_DEFLATED
            if path: data = open(path, 'rb').read()
            if info.compress_type == zipfile.ZIP_STORED:     # 4-byte align stored data (apksig re-checks)
                off = z.fp.tell() + 30 + len(name.encode())
                info.extra = b'\0' * (-off % 4)
            z.writestr(info, data)
        add('AndroidManifest.xml', man)
        add('resources.arsc', table)
        add('classes.dex', path=dex)
        for dst, src in ICON_FILES.items(): add(dst, path=os.path.join(HERE, 'icons', src))
        add(ADAPTIVE, adaptive)
        n = 0
        for item in SITE_ITEMS:
            p = os.path.join(SITE, item)
            files = [p] if os.path.isfile(p) else sorted(os.path.join(dp, f) for dp, _, fs in os.walk(p) for f in fs)
            for f in files:
                add('assets/site/' + os.path.relpath(f, SITE).replace(os.sep, '/'), path=f); n += 1
    print(f'packaged {n} site files')

VERIFIER = r"""
import com.android.apksig.*; import java.io.File;
public class Verify { public static void main(String[] a) throws Exception {
  ApkVerifier.Result r = new ApkVerifier.Builder(new File(a[0])).build().verify();
  System.out.println("apksig verify: verified=" + r.isVerified() + " v1=" + r.isVerifiedUsingV1Scheme() + " v2=" + r.isVerifiedUsingV2Scheme());
  for (Object e : r.getErrors()) System.out.println("ERROR " + e);
  for (Object w : r.getWarnings()) System.out.println("warning " + w);
  for (ApkVerifier.Result.V1SchemeSignerInfo i : r.getV1SchemeSigners()) for (Object e : i.getErrors()) System.out.println("v1 ERROR " + e);
  for (ApkVerifier.Result.V2SchemeSignerInfo i : r.getV2SchemeSigners()) for (Object e : i.getErrors()) System.out.println("v2 ERROR " + e);
  if (!r.isVerified()) System.exit(1);
}}"""

def realign(src, dst):
    """Rewrite a zip keeping every entry's bytes, with stored data 4-byte aligned.
    (jarsigner rewrites the archive; the v1 signature covers contents, not layout.)"""
    with zipfile.ZipFile(src) as zin, zipfile.ZipFile(dst, 'w') as zout:
        for info in zin.infolist():
            out = zipfile.ZipInfo(info.filename, date_time=info.date_time)
            out.compress_type = info.compress_type
            if out.compress_type == zipfile.ZIP_STORED:
                off = zout.fp.tell() + 30 + len(info.filename.encode())
                out.extra = b'\0' * (-off % 4)
            zout.writestr(out, zin.read(info))

def v2_sign(src, dst, key, cert_der):
    """APK Signature Scheme v2 (source.android.com/docs/security/features/apksigning/v2),
    RSASSA-PKCS1-v1_5 with SHA-256 over 1 MiB chunks of the three zip sections."""
    import hashlib
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding
    data = open(src, 'rb').read()
    eocd = data.rfind(b'PK\x05\x06')
    cd_size, cd_off = struct.unpack_from('<II', data, eocd + 12)
    sections = [data[:cd_off], data[cd_off:eocd], data[eocd:]]
    chunks = [hashlib.sha256(b'\xa5' + struct.pack('<I', len(c)) + c).digest()
              for sec in sections for c in (sec[i:i + (1 << 20)] for i in range(0, len(sec), 1 << 20))]
    top = hashlib.sha256(b'\x5a' + struct.pack('<I', len(chunks)) + b''.join(chunks)).digest()
    lp = lambda b: struct.pack('<I', len(b)) + b
    ALG = 0x0103
    signed = lp(lp(struct.pack('<I', ALG) + lp(top))) + lp(lp(cert_der)) + lp(b'')
    sig = key.sign(signed, padding.PKCS1v15(), hashes.SHA256())
    pub = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    signer = lp(signed) + lp(lp(struct.pack('<I', ALG) + lp(sig))) + lp(pub)
    value = lp(lp(signer))
    pair = struct.pack('<Q', 4 + len(value)) + struct.pack('<I', 0x7109871A) + value
    size = len(pair) + 8 + 16
    block = struct.pack('<Q', size) + pair + struct.pack('<Q', size) + b'APK Sig Block 42'
    new_eocd = bytearray(sections[2]); struct.pack_into('<I', new_eocd, 16, cd_off + len(block))
    open(dst, 'wb').write(sections[0] + block + sections[1] + bytes(new_eocd))

def sign(unsigned, out):
    from cryptography.hazmat.primitives.serialization import pkcs12, Encoding
    ks = os.environ.get('APK_KEYSTORE', os.path.expanduser('~/.amikat-android/release.p12'))
    kdir = os.path.dirname(ks)
    pw_file = os.path.join(kdir, 'password.txt')
    os.makedirs(kdir, exist_ok=True)
    if not os.path.exists(ks):
        pw = secrets.token_urlsafe(18)
        open(pw_file, 'w').write(pw)
        run('keytool', '-genkeypair', '-keystore', ks, '-storetype', 'PKCS12', '-storepass', pw, '-keypass', pw, '-alias', 'amikat',
            '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-dname', 'CN=Amikat, L=Tehran, C=IR')
        print('created signing key', ks)
    pw = open(pw_file).read().strip()
    env = {**os.environ, 'APK_KEY_PASS': pw}
    # v1 (JAR) signature — Android 5–6 read only this one
    v1 = os.path.join(BUILD, 'v1.apk')
    run('jarsigner', '-J-Duser.language=en', '-keystore', ks, '-storetype', 'PKCS12', '-storepass:env', 'APK_KEY_PASS',
        '-sigalg', 'SHA256withRSA', '-digestalg', 'SHA-256', '-sigfile', 'CERT', '-signedjar', v1, unsigned, 'amikat', env=env)
    aligned = os.path.join(BUILD, 'aligned.apk')
    realign(v1, aligned)
    # v2 signature block — required by Android 11+ for apps targeting API 30+
    key, cert, _ = pkcs12.load_key_and_certificates(open(ks, 'rb').read(), pw.encode())
    os.makedirs(os.path.dirname(out), exist_ok=True)
    v2_sign(aligned, out, key, cert.public_bytes(Encoding.DER))
    # independent check with Google's apksig verifier
    vdir = os.path.join(BUILD, 'verifier'); os.makedirs(vdir, exist_ok=True)
    open(os.path.join(vdir, 'Verify.java'), 'w').write(VERIFIER)
    cp = os.path.join(CACHE, 'apksig.jar')
    run('javac', '-nowarn', '-cp', cp, '-d', vdir, os.path.join(vdir, 'Verify.java'))
    opens = [f'--add-exports=java.base/sun.security.{m}=ALL-UNNAMED' for m in ('x509', 'pkcs', 'util')]
    run('java', *opens, '-cp', cp + os.pathsep + vdir, 'Verify', out)

def main():
    fetch()
    os.makedirs(BUILD, exist_ok=True)
    dex = compile_dex()
    table, adaptive = resources()
    unsigned = os.path.join(BUILD, 'unsigned.apk')
    package(unsigned, dex, manifest(), table, adaptive)
    sign(unsigned, OUT)
    print(f'{OUT}: {os.path.getsize(OUT) / 1e6:.1f} MB')

if __name__ == '__main__':
    main()
