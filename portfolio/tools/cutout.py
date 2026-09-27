"""Take the white paper out from behind drawings and renders, so they sit on the
site's own background (dark or light) instead of a white box.

    python3 tools/cutout.py            # processes the images listed below, in place
    python3 tools/build_images.py      # then refresh the 800 px variants and js/media.js

Three treatments:
  INK    line drawings (plans, sections, elevations, diagrams). White becomes
         transparent and every other colour keeps exactly its look over white
         ("colour to alpha"). The site draws them as light linework in the dark
         theme (see .ink in css/site.css) and as they are in the light theme.
  CUTOUT renders of white models. Only the background around the model is
         removed (a flood fill from the edges); the model keeps its own white
         faces, and soft ground shadows fade out instead of leaving a grey halo.
  TRIM   photos and renders inside a white frame: the frame is cropped off.

Images that already have transparency are skipped, so re-running is safe.
Left as they are: full-bleed renders whose white is part of the scene (v18), the
colour sheet tv-b3,
maps and presentation boards, and the proposal pages (documents, shown as paper).
Requires Pillow, numpy and scipy.
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), '..')
IMG = os.path.join(ROOT, 'img')

INK = ['tv-04', 'tv-05', 'tv-06', 'tv-b1', 'tv-b2', 'v10', 'v11', 'v12', 'v13', 'v19', 'v20', 'v21', 'v26', 'v34', 'v35',
       'v36', 'v37', 'v38', 'v39', 'v40', 'v44', 'v45', 'v50']
CUTOUT = ['tv-01', 'tv-02', 'tv-03', 'v01', 'v02', 'v03', 'v04', 'v05', 'v06', 'v07', 'v08', 'v09',
          'v16', 'v17', 'v22', 'v23', 'v24', 'v25', 'v28', 'v46', 'v47', 'v48']
TRIM = ['v29', 'v30', 'v31', 'v32', 'v33', 'v43']


def color_to_alpha(rgb, floor=.045):
    """Exact inverse of compositing over white: alpha = 1 - min(r, g, b), and the
    colour is the one that, laid over white at that alpha, gives the pixel back.
    `floor` absorbs the faint noise lossy compression leaves in the paper."""
    c = rgb / 255.0
    a = 1.0 - c.min(axis=2)
    a = np.clip((a - floor) / (1 - floor), 0, 1)
    safe = np.where(a > 1e-3, a, 1)
    col = np.clip(1.0 - (1.0 - c) / safe[..., None], 0, 1)
    return col, a


def ink(rgb):
    col, a = color_to_alpha(rgb)
    return np.dstack([col, a])


def cutout(rgb):
    """Background = light, near-neutral pixels connected to the image border.
    Inside it, colour-to-alpha (so edges stay anti-aliased and shadows fade);
    everywhere else the render stays fully opaque."""
    c = rgb / 255.0
    lum, sat = c.min(axis=2), c.max(axis=2) - c.min(axis=2)
    light = (lum > .80) & (sat < .10)
    lab, _ = ndimage.label(light)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0])
    # a 2 px band around the background carries the anti-aliased edge
    band = ndimage.binary_dilation(bg, iterations=2)
    col, a = color_to_alpha(rgb)
    out_a = np.where(band, a, 1.0)
    out_c = np.where(band[..., None], col, c)
    return np.dstack([out_c, out_a])


def trim(im, cap=.08):
    """Crop a white frame (often white, a thin grey rule, then white again): shave
    rows and columns off each side while they are flat and colourless. A photo's
    own edge has texture or colour, and at most `cap` of a side is ever removed."""
    a = np.asarray(im.convert('RGB')).astype(float)
    lum, sat = a.mean(axis=2), a.max(axis=2) - a.min(axis=2)
    # a frame line is mostly paper (crop marks may cross it), or a flat grey rule
    def frame(line_l, line_s):
        paper = ((line_l > 225) & (line_s < 14)).mean()
        return paper > .8 or (line_l.std() < 22 and line_s.mean() < 14 and line_l.mean() > 120)
    h, w = lum.shape
    t = 0
    while t < h * cap and frame(lum[t], sat[t]): t += 1
    b = h
    while h - b < h * cap and frame(lum[b - 1], sat[b - 1]): b -= 1
    l = 0
    while l < w * cap and frame(lum[:, l], sat[:, l]): l += 1
    r = w
    while w - r < w * cap and frame(lum[:, r - 1], sat[:, r - 1]): r -= 1
    if max(t, h - b, l, w - r) < 3: return im           # no real frame (keeps re-runs from shaving more)
    return im.crop((l + 1, t + 1, r - 1, b - 1))      # one more pixel: the rule's soft edge


def save(arr, path):
    # lossy alpha at 60 is indistinguishable from lossless on linework and half the size
    Image.fromarray((arr * 255 + .5).astype(np.uint8), 'RGBA').save(path, 'WEBP', quality=82, alpha_quality=60, method=6)


def main(names=None):
    done = 0
    for kind, names_ in (('ink', INK), ('cutout', CUTOUT), ('trim', TRIM)):
        for n in names_:
            if names and n not in names: continue
            p = os.path.join(IMG, n + '.webp')
            im = Image.open(p)
            if kind != 'trim' and im.mode == 'RGBA':
                continue                                  # already processed
            if kind == 'trim':
                t = trim(im)
                if t.size == im.size: continue
                t.save(p, 'WEBP', quality=90, method=6)
            else:
                rgb = np.asarray(im.convert('RGB')).astype(np.float64)
                save(ink(rgb) if kind == 'ink' else cutout(rgb), p)
            done += 1
            print(kind.ljust(6), n)
    print(done, 'images processed')


if __name__ == '__main__':
    main(sys.argv[1:] or None)
