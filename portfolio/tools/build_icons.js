// Renders every raster icon from the mark in img/logo-mark.svg (run tools/brand.py first):
//   img/icon-32.png, icon-192.png, icon-512.png, apple-touch-icon.png  (site, and the Windows .exe icon)
//   android/icons/ic_fg.png, ic_bg.png, ic_legacy.png                   (Android adaptive + legacy icon)
// Usage, from the portfolio folder:  node tools/build_icons.js [preview.png]
// Needs Playwright with Chromium (NODE_PATH or a global install).
let chromium;
try { ({ chromium } = require('playwright')); } catch (_) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs');

(async () => {
  const b = await chromium.launch();
  const shot = async (svg, size, file, transparent = true) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await p.screenshot({ path: file, omitBackground: transparent }); await p.close();
  };

  const fav = fs.readFileSync('img/logo-mark.svg', 'utf8');
  for (const [s, f] of [[32, 'icon-32.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']])
    await shot(fav.replace('<svg ', `<svg width="${s}" height="${s}" `), s, 'img/' + f);

  // Android adaptive icon: the mark alone, inside the 264px safe circle of a 432px layer
  const html = fs.readFileSync('index.html', 'utf8');
  const [, vw, vh] = html.match(/<symbol id="amMark" viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
  const inner = fav.match(/<g transform="[^"]*">([\s\S]*)<\/g><\/svg>/)[1];
  const defs = fav.match(/<defs>[\s\S]*?<\/defs><style>[\s\S]*?<\/style>/)[0];
  const k = 206 / Math.max(vw, vh), w = vw * k, h = vh * k;
  const fg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">${defs}<g transform="translate(${(432 - w) / 2} ${(432 - h) / 2 + 4}) scale(${k})">${inner}</g></svg>`;
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432"><defs>
  <radialGradient id="a" cx=".15" cy=".05" r=".8"><stop offset="0" stop-color="#FF5A36" stop-opacity=".22"/><stop offset="1" stop-color="#FF5A36" stop-opacity="0"/></radialGradient>
  <radialGradient id="b" cx=".95" cy=".9" r=".75"><stop offset="0" stop-color="#9CCBEA" stop-opacity=".18"/><stop offset="1" stop-color="#9CCBEA" stop-opacity="0"/></radialGradient>
  <linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171B21"/><stop offset="1" stop-color="#08090B"/></linearGradient></defs>
  <rect width="432" height="432" fill="url(#c)"/><rect width="432" height="432" fill="url(#a)"/><rect width="432" height="432" fill="url(#b)"/></svg>`;
  await shot(fg, 432, 'android/icons/ic_fg.png');
  await shot(bg, 432, 'android/icons/ic_bg.png', false);
  await shot(fav.replace('<svg ', '<svg width="192" height="192" '), 192, 'android/icons/ic_legacy.png');

  if (process.argv[2]) {   // preview: launcher masks and favicon sizes
    const b64 = f => fs.readFileSync(f).toString('base64');
    const tile = r => `<div style="width:176px;height:176px;border-radius:${r};overflow:hidden;position:relative;background:url(data:image/png;base64,${b64('android/icons/ic_bg.png')}) center/216px"><img src="data:image/png;base64,${b64('android/icons/ic_fg.png')}" style="position:absolute;left:-20px;top:-20px;width:216px"></div>`;
    const p = await b.newPage({ viewport: { width: 900, height: 240 } });
    await p.setContent(`<body style="margin:0;background:#dde3ea;display:flex;gap:28px;padding:32px;align-items:center">${tile('50%')}${tile('38px')}
      <img src="data:image/png;base64,${b64('android/icons/ic_legacy.png')}" width="144">
      ${[64, 32, 16].map(s => `<img src="data:image/png;base64,${b64('img/icon-512.png')}" width="${s}">`).join('')}</body>`);
    await p.screenshot({ path: process.argv[2] });
  }
  await b.close();
})();
