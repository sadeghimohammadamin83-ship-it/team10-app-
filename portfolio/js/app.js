/* ═══════════════════════════════════════════════════════════════════════
   MohammadAmin Sadeghi — portfolio application
   Plain JS, no build step. Content comes from js/data.js; this file only
   renders it. Routes are hash-based (#/work/<slug>) so the site runs on any
   static host — and straight from the file system — without rewrite rules.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
'use strict';

/* ── Helpers ───────────────────────────────────────────────────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const miss = v => !v || v === NEEDS;
const mq = q => matchMedia(q).matches;
const FINE = mq('(hover:hover) and (pointer:fine)');
const CALM = mq('(prefers-reduced-motion: reduce)');
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(_){ return null; } },
  set(k, v){ try{ localStorage.setItem(k, v); }catch(_){} }
};

const svgI = (d, w = 1.6) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const I = {
  arrow:  svgI('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowL: svgI('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  arrowUR:svgI('<path d="M7 17 17 7M8 7h9v9"/>'),
  back:   svgI('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  up:     svgI('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  close:  svgI('<path d="M18 6 6 18M6 6l12 12"/>', 1.8),
  menu:   svgI('<path d="M4 7h16M4 12h16M4 17h10"/>', 1.8),
  sun:    svgI('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>', 1.8),
  moon:   svgI('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', 1.8),
  cursor: svgI('<path d="M5 3l6.5 17 2.3-6.9L21 11z"/>', 1.8),
  cube:   svgI('<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>'),
  plus:   svgI('<path d="M12 5v14M5 12h14"/>'),
  warn:   svgI('<circle cx="12" cy="12" r="9"/><path d="M12 8v4.5M12 16h.01"/>', 1.8),
  target: svgI('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
  layers: svgI('<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>'),
  shield: svgI('<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>'),
  eye:    svgI('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  phone:  svgI('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>', 1.7),
  send:   svgI('<path d="M21 3 3 10.5l7 2.5 2.5 7L21 3z"/><path d="m10 13 4.5-4.5"/>', 1.7),
  mail:   svgI('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', 1.7),
  form:   svgI('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M9 10h6M9 14h6M9 18h3"/>', 1.7),
  copy:   svgI('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>', 1.7),
  info:   svgI('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', 1.7),
  external: svgI('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>')
};
const PROC_IC = [
  '<path d="M4 20l5-9 4 6 3-4 4 7z"/><circle cx="16.5" cy="6.5" r="2.5"/>',
  '<path d="M3 17 17 3l4 4L7 21H3z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
  '<rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  '<circle cx="12" cy="12" r="8.5"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>',
  '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>'
];

/* Shared with js/dc-scene.js */
window.U = {esc, pad, I, FINE, CALM, t: s => (LANG === 'fa' && window.FA && FA[s]) || s};

/* ── Media ─────────────────────────────────────────────────────────── */
// Images keep their original names in data.js; proposal pages are stored per project.
const MEDIA = window.MEDIA || {};
const mediaRel = n => { const m = /^pp-(.+)-(\d\d)\.webp$/.exec(n); return m ? `proposals/${m[1]}/${m[2]}.webp` : n; };
const mediaSrc = (n, small) => { const r = mediaRel(n), i = r.lastIndexOf('/') + 1; return 'img/' + (small ? r.slice(0, i) + 'sm/' + r.slice(i) : r); };
function img(name, {alt = '', sizes = '100vw', eager = false, cls = '', pos = ''} = {}){
  const m = MEDIA[mediaRel(name)]; if(!m) return '';
  const [w, h, sm] = m;
  const set = sm ? ` srcset="${mediaSrc(name, true)} 800w, ${mediaSrc(name)} ${w}w" sizes="${sizes}"` : '';
  return `<img src="${mediaSrc(name)}"${set} width="${w}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-full="${mediaSrc(name)}"${cls ? ` class="${cls}"` : ''}${pos ? ` style="object-position:${pos}"` : ''}>`;
}
const modelHref = key => `models/${String(key).replace(/^obj-/, '')}.html`;

/* ── State ─────────────────────────────────────────────────────────── */
let PAGE = 'index', SLUG = null, LANG = store.get('lang') === 'fa' ? 'fa' : 'en';
const R = {};              // page renderers
const cleanups = [];       // per-page listeners removed on navigation
const onPage = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); };

/* ── Small UI builders ─────────────────────────────────────────────── */
const secHead = (n, label, title, {action = '', id = '', lead = ''} = {}) => `
  <header class="sec-head rv">
    <div class="sec-rule"><span class="sec-n num">${n}</span><span class="label">${esc(label)}</span>${action}</div>
    <h2 class="h2"${id ? ` id="${id}"` : ''}>${esc(title)}</h2>
    ${lead ? `<p class="lede muted">${esc(lead)}</p>` : ''}
  </header>`;
const pageHead = (label, title, lead = '', extra = '') => `
  <header class="page-head container">
    <p class="label rv">${esc(label)}</p>
    <h1 class="h1 rv" tabindex="-1">${esc(title)}</h1>
    ${extra}
    ${lead ? `<p class="lede muted rv">${lead}</p>` : ''}
  </header>`;
const linkArrow = (href, text) => `<a class="link-arrow" href="${href}"><span>${esc(text)}</span>${I.arrow}</a>`;

function workCard(p, {sizes = '(min-width: 900px) 50vw, 100vw'} = {}){
  const n = projects.indexOf(p) + 1;
  const meta = [p.year, p.kind || p.category, p.proposal ? (p.proposal.tag || 'Proposal') : ''].filter(Boolean);
  return `<a class="card rv" href="#/work/${p.slug}">
    <div class="card-media">${img(p.cover && p.cover.src, {sizes})}<span class="card-tag">${esc(p.category)}</span></div>
    <div class="card-body">
      <span class="card-idx num" aria-hidden="true">${pad(n)}</span>
      <div class="card-text"><h3 class="card-title">${esc(p.title)}</h3>
        <p class="card-meta">${meta.map(m => `<span>${esc(m)}</span>`).join('')}</p></div>
      <span class="card-go" aria-hidden="true">${I.arrow}</span>
    </div></a>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   CHROME — header, mobile menu, footer, floating controls
   ═══════════════════════════════════════════════════════════════════════ */
function renderChrome(){
  const langSwitch = cls => `<div class="lang ${cls}" role="group" aria-label="Language" data-noi18n>
      <button type="button" data-lang="en" aria-pressed="${LANG === 'en'}" lang="en">EN</button><button type="button" data-lang="fa" aria-pressed="${LANG === 'fa'}" lang="fa">FA</button></div>`;
  const links = NAV.map(n => n.children
    ? `<li class="dd"><a class="nav-a" href="#/${n.route}" data-route="${n.route}">${esc(n.label)}</a>
         <button type="button" class="dd-t" aria-expanded="false" aria-controls="dd-${n.route}"><span class="sr-only">${esc(n.label)} menu</span><svg viewBox="0 0 10 6" aria-hidden="true"><path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
         <ul class="dd-m" id="dd-${n.route}">${n.children.map((c, i) => `<li><a href="#/${c.route}" data-route="${c.route}"><span class="num">${pad(i + 1)}</span>${esc(c.label)}</a></li>`).join('')}</ul></li>`
    : `<li><a class="nav-a" href="#/${n.route}" data-route="${n.route}">${esc(n.label)}</a></li>`).join('');

  const menuLinks = NAV.map((n, i) => `<li><a class="menu-a" href="#/${n.route}" data-route="${n.route}"><span class="num">${pad(i + 1)}</span>${esc(n.label)}</a>
      ${n.children ? `<ul class="menu-sub">${n.children.map(c => `<li><a href="#/${c.route}" data-route="${c.route}">${esc(c.label)}</a></li>`).join('')}</ul>` : ''}</li>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
  <div id="sprog" aria-hidden="true"></div>
  <header class="nav" id="nav">
    <nav class="nav-in" aria-label="Primary">
      <a class="brand" href="#/" aria-label="${esc(profile.name)} — home">
        <svg class="brand-mark" viewBox="0 0 128 109" aria-hidden="true"><use href="#amMark"/></svg>
        <span class="brand-t" data-noi18n><svg class="brand-word" viewBox="0 0 1274 100" aria-hidden="true"><use href="#amWord"/></svg><small>Data center designer</small></span>
      </a>
      <ul class="nav-links">${links}</ul>
      <div class="nav-tools">
        ${langSwitch('lang-nav')}
        <button type="button" class="icon-btn" id="curBtn" aria-pressed="false" aria-label="Toggle custom cursor" title="Toggle custom cursor">${I.cursor}</button>
        <button type="button" class="icon-btn" id="thBtn" aria-label="Switch theme"></button>
        <a class="btn btn-primary btn-sm" id="navCta" href="#/contact">Start a project</a>
        <button type="button" class="icon-btn" id="burger" aria-expanded="false" aria-controls="menu" aria-label="Open menu">${I.menu}</button>
      </div>
    </nav>
  </header>
  <div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
    <div class="menu-in">
      <ul class="menu-list">${menuLinks}</ul>
      <div class="menu-foot">
        ${langSwitch('lang-menu')}
        <a class="btn btn-primary" href="#/contact">Start a project ${I.arrow}</a>
        <p class="small muted">${esc(profile.location)} · ${esc(profile.status)}</p>
      </div>
    </div>
  </div>`);

  const year = new Date().getFullYear();
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="footer">
    <div class="container"><div class="footer-panel">
      <div class="footer-top">
        <div class="footer-id">
          <p class="footer-name">${esc(profile.name)}</p>
          <p class="muted">${esc(profile.role)}</p>
          <p class="small muted footer-loc">${esc(profile.location)} · ${esc(profile.status)}</p>
          <a class="btn btn-ghost" href="#/contact">Start a project ${I.arrow}</a>
        </div>
        <nav class="footer-col" aria-label="Footer"><p class="label">Navigate</p>
          <ul>${[['Home', ''], ...NAV.map(n => [n.label, n.route]), ['Object design', 'objects']].map(([t, h]) => `<li><a class="ul" href="#/${h}">${esc(t)}</a></li>`).join('')}</ul></nav>
        <div class="footer-col"><p class="label">Elsewhere</p>
          <ul>
            <li><a class="ul" href="${CONTACT.phoneHref}" dir="ltr">${esc(CONTACT.phone.replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3'))}</a></li>
            <li><a class="ul" href="${CONTACT.tgHref}" target="_blank" rel="noopener">Telegram · <span dir="ltr">${esc(CONTACT.tg)}</span></a></li>
            <li><a class="ul" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></li>
            ${profile.socials.filter(s => !miss(s.url)).map(s => `<li><a class="ul" href="${esc(s.url)}" target="_blank" rel="noopener me">${esc(s.label)}${s.handle ? ' · ' + esc(s.handle) : ''}</a></li>`).join('')}
          </ul></div>
      </div>
      <div class="footer-bottom">
        <p class="small muted">© ${year} ${esc(profile.name)}. ${esc(profile.footNote)}</p>
        <button type="button" class="label to-top" data-top>Back to top</button>
      </div>
    </div></div>
  </footer>
  <div class="fabs">
    <a id="fab" class="fab" href="#/contact">Get in touch ${I.arrow}</a>
    <button type="button" id="totop" class="fab-top" aria-label="Back to top" data-top>${I.up}</button>
  </div>
  <div id="toast" role="status" aria-live="polite"></div>
  <p class="sr-only" id="announcer" aria-live="polite"></p>
  <div id="cur" aria-hidden="true"></div>`);

  bindTheme(); bindMenu(); bindDropdown(); bindCursor(); bindScroll();
}

function bindTheme(){
  const btn = $('#thBtn'), root = document.documentElement;
  const paint = () => { const dark = root.dataset.theme !== 'light';
    btn.innerHTML = dark ? I.sun : I.moon;
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    $$('meta[name="theme-color"]').forEach(m => m.setAttribute('content', dark ? '#0A0B0D' : '#EEF3F8')); };
  paint();
  btn.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light'; store.set('theme', root.dataset.theme); paint(); });
}

/* Mobile menu: a modal sheet. Background is made inert and scroll-locked;
   focus moves in on open and returns to the burger on close. */
function bindMenu(){
  const menu = $('#menu'), btn = $('#burger'), outside = () => [$('#main'), $('.footer'), $('.fabs')];
  let open = false;
  const set = o => {
    if(o === open) return; open = o;
    btn.setAttribute('aria-expanded', String(o));
    btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    btn.innerHTML = o ? I.close : I.menu;
    document.documentElement.classList.toggle('locked', o);
    outside().forEach(el => el && (el.inert = o));
    if(o){ menu.hidden = false; requestAnimationFrame(() => menu.classList.add('open')); setTimeout(() => { const a = $('.menu-a', menu); a && a.focus(); }, CALM ? 0 : 60); }
    else { menu.classList.remove('open'); setTimeout(() => { if(!open) menu.hidden = true; }, CALM ? 0 : 320); }
  };
  btn.addEventListener('click', () => { set(!open); if(!open) btn.focus(); });
  menu.addEventListener('click', e => { if(e.target.closest('a[href^="#/"]')) set(false); });
  document.addEventListener('keydown', e => {
    if(!open) return;
    if(e.key === 'Escape'){ set(false); btn.focus(); return; }
    if(e.key === 'Tab'){ // keep focus inside the header + sheet
      const f = [...$$('a,button', menu), btn].filter(el => el.offsetParent !== null);
      const i = f.indexOf(document.activeElement);
      if(e.shiftKey && (i <= 0)){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && i === f.length - 1){ e.preventDefault(); f[0].focus(); }
    }
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', e => e.matches && set(false));
  bindMenu.close = () => set(false);
}

/* Work dropdown: opens on hover (fine pointers) or with its toggle button. */
function bindDropdown(){
  const dd = $('.dd'); if(!dd) return;
  const t = $('.dd-t', dd);
  const set = o => { dd.classList.toggle('open', o); t.setAttribute('aria-expanded', String(o)); };
  t.addEventListener('click', () => set(!dd.classList.contains('open')));
  dd.addEventListener('mouseenter', () => FINE && set(true));
  dd.addEventListener('mouseleave', () => set(false));
  dd.addEventListener('focusout', e => { if(!dd.contains(e.relatedTarget)) set(false); });
  dd.addEventListener('keydown', e => { if(e.key === 'Escape' && dd.classList.contains('open')){ set(false); t.focus(); } });
  dd.addEventListener('click', e => { if(e.target.closest('.dd-m a')) set(false); });
}

/* Optional custom cursor — off unless the visitor switches it on. */
function bindCursor(){
  const cur = $('#cur'), btn = $('#curBtn');
  if(!FINE || CALM){ btn.hidden = true; return; }
  let on = store.get('cursor') === 'on', raf = 0, x = 0, y = 0;
  const apply = () => { document.body.dataset.cursor = on ? 'on' : 'off'; btn.setAttribute('aria-pressed', String(on)); };
  apply();
  btn.addEventListener('click', () => { on = !on; store.set('cursor', on ? 'on' : 'off'); apply(); });
  addEventListener('pointermove', e => {
    if(!on) return; x = e.clientX; y = e.clientY;
    cur.classList.toggle('hot', !!(e.target.closest && e.target.closest('a,button,[role="button"],input,textarea,select,label')));
    if(!raf) raf = requestAnimationFrame(() => { raf = 0; cur.style.transform = `translate(${x}px,${y}px)`; });
  }, {passive: true});
}

function bindScroll(){
  const nav = $('#nav'), bar = $('#sprog'), top = $('#totop'), fab = $('#fab');
  let raf = 0;
  const upd = () => { raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight, y = scrollY;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('stuck', y > 12);
    top.classList.toggle('on', y > 900);
    fab.classList.toggle('on', y > innerHeight * .8 && PAGE !== 'contact'); };
  addEventListener('scroll', () => { if(!raf) raf = requestAnimationFrame(upd); }, {passive: true});
  bindScroll.update = upd; upd();
  document.addEventListener('click', e => { if(e.target.closest('[data-top]')) scrollTo({top: 0, behavior: CALM ? 'auto' : 'smooth'}); });
}

let toastT = 0;
function toast(msg){ const t = $('#toast'); t.textContent = U.t(msg); t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200); }

function copyText(text, btn){
  const done = () => { toast(btn && btn.dataset.copied || 'Copied');
    if(!btn) return; const l = $('.cp-l', btn); if(!l) return;
    const o = l.textContent; l.textContent = U.t('Copied'); btn.classList.add('ok');
    setTimeout(() => { l.textContent = o; btn.classList.remove('ok'); }, 1600); };
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(done).catch(() => {
    const a = document.createElement('textarea'); a.value = text; a.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(a); a.select(); try{ document.execCommand('copy'); }catch(_){} a.remove(); done(); });
}

/* ═══════════════════════════════════════════════════════════════════════
   HOME
   ═══════════════════════════════════════════════════════════════════════ */
const DISCIPLINE_WORDS = [['DATA CENTER', ''], ['ARCHITECTURE', ''], ['OBJECT', '3D DESIGN']];

R.index = function(){
  const counts = {
    projects: projects.length,
    pages: projects.reduce((a, p) => a + ((p.proposal && p.proposal.pages) || 0), 0),
    objects: objects.filter(o => o.type === '3D / BIM').length
  };
  const dcProjects = projects.filter(p => p.category === 'Data Center Design');
  const H = home;

  $('#main').innerHTML = `
  <section class="hero" aria-labelledby="hero-name">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="hero-kicker label rv"><span class="status-dot" aria-hidden="true"></span>${esc(profile.location)} · ${esc(profile.status)}</p>
        <h1 class="hero-name rv" id="hero-name" tabindex="-1"><span>MohammadAmin</span> <span>Sadeghi</span></h1>
        <p class="hero-role rv">${esc(profile.role)}</p>
        <p class="hero-sub rv">${esc(profile.heroSub)}</p>
        <ul class="hero-spec rv" aria-label="Specialties">${SPECIALTIES.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <div class="hero-cta rv">
          <a class="btn btn-primary" href="#/work">See the work ${I.arrow}</a>
          <a class="btn btn-ghost" href="#/contact">Get in touch</a>
        </div>
      </div>
      <div class="hero-visual rv">
        <div class="fig-label" aria-hidden="true"><span class="num">FIG. 01</span><span>Data hall — isometric</span></div>
        ${DCScene.html()}
      </div>
    </div>
    <div class="container">
      <ol class="hero-disc" aria-label="Disciplines">${DISCIPLINE_WORDS.map(([a, b], i) => `<li class="rv"><span class="num">${pad(i + 1)}</span><span>${b ? `${a} <i>&amp;</i> ${b}` : a}</span></li>`).join('')}</ol>
    </div>
  </section>

  <section class="container stats-wrap" aria-label="In numbers">
    <dl class="stats">${H.stats.map(x => { const v = x.n ? counts[x.n] : x.v;
      return `<div class="stat rv"><dt class="stat-l">${esc(x.label)}</dt><dd><span class="stat-v num" data-to="${v}">${v}</span>${x.plus ? '<span class="stat-p">+</span>' : ''}</dd></div>`; }).join('')}</dl>
  </section>

  <section class="section container" aria-labelledby="sys-h">
    ${secHead('01', 'Data center design', 'The systems a data hall is planned around.', {id: 'sys-h',
      lead: 'The architectural and spatial side of a data center — and the documentation that makes it buildable.'})}
    <div class="sys-grid">
      <ol class="sys-list">${DC_SYSTEMS.map((c, i) => `
        <li class="sys rv">
          <span class="sys-n num">${pad(i + 1)}</span>
          <div class="sys-main"><h3 class="sys-t">${esc(c.n)}</h3><p class="sys-d">${esc(c.t)}</p></div>
          <p class="sys-spec"><span class="label">${esc(c.sp[0][0])}</span><span>${esc(c.sp[0][1])}</span></p>
          <div class="sys-act">
            <button type="button" class="btn btn-ghost btn-sm" data-show-sys="${c.k}">Show in the hall</button>
            ${c.obj ? `<button type="button" class="icon-btn" data-model="${esc(c.obj)}" aria-label="Open the 3D model — ${esc(c.n)}" title="Open the 3D model">${I.cube}</button>` : ''}
          </div>
        </li>`).join('')}</ol>
      <aside class="sys-aside rv">
        <p class="label">In the portfolio</p>
        <p class="sys-big"><span class="num">${pad(dcProjects.length)}</span> data center projects</p>
        <ul class="sys-projects">${dcProjects.map(p => `<li><a class="ul" href="#/work/${p.slug}">${esc(p.title)}</a></li>`).join('')}</ul>
        ${linkArrow('#/services', 'What I take on')}
      </aside>
    </div>
  </section>

  ${homeWork()}

  <section class="section section--band" aria-labelledby="plat-h">
    <div class="container">
      ${secHead('03', H.platforms.eyebrow, H.platforms.title, {id: 'plat-h'})}
      <div class="plats">${H.platforms.items.map((x, k) => `
        <a class="plat rv" href="${esc(x.url)}" target="_blank" rel="noopener">
          <div class="plat-top"><span class="label">${pad(k + 1)} — ${esc(x.kind)}</span><span class="plat-go">${I.arrowUR}</span></div>
          <h3 class="plat-n">${esc(x.name)}</h3>
          <p class="muted">${esc(x.body)}</p>
          <ul class="plat-f">${x.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
          <div class="plat-b"><ul class="pills">${x.tags.map(t => `<li class="pill">${esc(t)}</li>`).join('')}</ul>
            ${x.note ? `<span class="note-chip">${I.warn}${esc(x.note)}</span>` : ''}</div>
          <span class="plat-open">Open site <span class="sr-only">(opens in a new tab)</span>${I.arrowUR}</span>
        </a>`).join('')}</div>
    </div>
  </section>

  <section class="section container" aria-labelledby="appr-h">
    ${secHead('04', H.approach.eyebrow, H.approach.title, {id: 'appr-h', lead: H.approach.lead})}
    <div class="feat4">${H.approach.items.map((f, i) => `<div class="feat-i rv"><span class="ico">${I[f.icon] || ''}</span>
      <h3 class="feat-t"><span class="num">${pad(i + 1)}</span> ${esc(f.title)}</h3><p class="small muted">${esc(f.body)}</p></div>`).join('')}</div>
  </section>

  <section class="section container" aria-labelledby="disc-h">
    <div class="split-2">
      <div>
        ${secHead('05', H.disciplines.eyebrow, H.disciplines.title, {id: 'disc-h'})}
        <ul class="tiles">${H.disciplines.items.map(x => `<li><a class="tile rv" href="#/services">${esc(x)}</a></li>`).join('')}</ul>
      </div>
      <div>
        ${secHead('06', H.software.eyebrow, H.software.title)}
        <ul class="pills pills-lg rv">${H.software.items.map(x => `<li class="pill">${esc(x)}</li>`).join('')}</ul>
        <div class="aud rv">
          <p class="label">${esc(H.audience.eyebrow)}</p>
          <p class="aud-t">${esc(H.audience.title)}</p>
          <ul class="pills">${H.audience.items.map(x => `<li class="pill">${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>

  ${ctaBand()}`;

  DCScene.bind();
  bindStage();
  counters();
  onPage($('#main'), 'click', e => {
    const b = e.target.closest('[data-show-sys]'); if(!b) return;
    const scene = $('#dcs');
    scene.scrollIntoView({behavior: CALM ? 'auto' : 'smooth', block: 'center'});
    setTimeout(() => { DCScene.api.open(b.dataset.showSys); const g = $(`.cmp[data-k="${b.dataset.showSys}"]`); g && g.focus({preventScroll: true}); }, CALM ? 0 : 450);
  });
};

const ctaBand = () => `
  <section class="section cta-band" aria-labelledby="cta-h">
    <div class="container"><div class="cta-panel cta-in rv">
      <p class="label">Start a project</p>
      <h2 class="h2" id="cta-h">Tell me what is already built, and what has to fit inside it.</h2>
      <div><a class="btn btn-accent" href="#/contact">Start a project ${I.arrow}</a></div>
    </div></div>
  </section>`;

/* Featured stage: a sheet with drawing annotations layered in depth. */
function stageHTML(k){
  const f = FEATURED[k], p = projects.find(x => x.slug === f.slug); if(!p) return '';
  return `
    <div class="feat-copy">
      <p class="label">Featured · <span class="num">${pad(k + 1)} / ${pad(FEATURED.length)}</span></p>
      <h3 class="h2 feat-title">${esc(p.title)}</h3>
      ${p.kicker ? `<p class="feat-kicker">${esc(p.kicker)}</p>` : ''}
      <p class="muted feat-sum">${esc(p.summary)}</p>
      <div class="feat-act">
        <a class="btn btn-primary" href="#/work/${p.slug}">View project ${I.arrow}</a>
        ${p.model ? `<button type="button" class="btn btn-ghost" data-model="${esc(p.model)}">Open the 3D model ${I.cube}</button>` : ''}
      </div>
    </div>
    <div class="stage" id="stage" data-noi18n>
      <div class="layer dim" data-depth="4" aria-hidden="true"><span>0.00</span><i></i><span>${esc(f.ruler)}</span></div>
      <a class="layer sheet-frame" data-depth="6" href="#/work/${p.slug}" tabindex="-1" aria-hidden="true">${img(f.img, {sizes: '(min-width: 900px) 50vw, 100vw', pos: f.pos || ''})}</a>
      <div class="layer chip-card palette-card" data-depth="16" aria-hidden="true"><b>PALETTE</b>${esc(f.palName)}<div class="sw">${f.pal.map(c => `<span style="background:${c}"></span>`).join('')}</div></div>
      <div class="layer ui-card" data-depth="22" aria-hidden="true"><div class="bar"><span></span><span></span><span></span></div>${img(f.thumb, {sizes: '160px', cls: 'blk-h'})}<div class="blk"></div><div class="blk" style="width:60%"></div></div>
      <div class="layer chip-card sheet-tag" data-depth="12" aria-hidden="true"><b>${esc(f.sheet)}</b>${f.rows.map(([a, b]) => `<div class="row"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}</div>
      <div class="layer stage-mark" data-depth="9" aria-hidden="true"><svg viewBox="0 0 128 109"><use href="#amMark"/></svg></div>
    </div>`;
}
function homeWork(){
  const picks = HOME_PICKS.map(s => projects.find(p => p.slug === s)).filter(Boolean);
  return `
  <section class="section container" id="home-work" aria-labelledby="work-h">
    ${secHead('02', 'Selected work', 'Projects, from the first drawing to the finished sheet.', {id: 'work-h', action: linkArrow('#/work', 'All projects')})}
    <div class="feat-tabs" role="tablist" aria-label="Featured projects">${FEATURED.map((x, i) =>
      `<button role="tab" type="button" id="ft-${i}" data-feat="${i}" aria-selected="${i === 0}" aria-controls="feat" tabindex="${i === 0 ? 0 : -1}"><span class="num">${pad(i + 1)}</span><span class="ft-t">${esc(x.tab)}</span></button>`).join('')}</div>
    <div class="feat rv" id="feat" role="tabpanel" aria-labelledby="ft-0">${stageHTML(0)}</div>
    <div class="works">${picks.map(p => workCard(p)).join('')}</div>
  </section>`;
}
function bindStage(){
  const feat = $('#feat'), tabs = $$('[data-feat]'); if(!feat) return;
  let k = 0;
  const show = (i, focus) => {
    if(i === k) return; k = i;
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === k)); t.tabIndex = j === k ? 0 : -1; });
    feat.setAttribute('aria-labelledby', 'ft-' + k);
    if(focus) tabs[k].focus();
    feat.classList.add('swap');
    setTimeout(() => { feat.innerHTML = stageHTML(k); feat.classList.remove('swap'); }, CALM ? 0 : 220);
  };
  tabs.forEach(t => t.addEventListener('click', () => show(+t.dataset.feat)));
  $('.feat-tabs').addEventListener('keydown', e => {
    if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const d = (e.key === 'ArrowRight') !== (document.documentElement.dir === 'rtl') ? 1 : -1;
    show((k + d + FEATURED.length) % FEATURED.length, true);
  });
  if(!FINE || CALM) return;
  let raf = 0;
  feat.addEventListener('pointermove', e => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
    const r = feat.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    $$('#stage [data-depth]').forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate3d(${(-x * d).toFixed(1)}px,${(-y * d).toFixed(1)}px,0)`; });
  }); });
  feat.addEventListener('pointerleave', () => $$('#stage [data-depth]').forEach(l => l.style.transform = ''));
}
function counters(){
  const els = $$('.stat-v[data-to]'); if(!els.length || CALM) return;
  // The real value stays in the markup; it only counts up once it is on screen.
  const run = el => { const to = +el.dataset.to, t0 = performance.now();
    const f = t => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if(k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f); };
  const io = new IntersectionObserver(es => es.forEach(x => { if(x.isIntersecting){ run(x.target); io.unobserve(x.target); } }), {threshold: .6});
  els.forEach(el => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ═══════════════════════════════════════════════════════════════════════
   WORK INDEX + OBJECTS
   ═══════════════════════════════════════════════════════════════════════ */
function workTabs(active){
  return `<nav class="wtabs rv" aria-label="Work sections">
    <a class="wtab" href="#/work"${active === 'projects' ? ' aria-current="page"' : ''}><span class="num">01</span> My projects <span class="wc">${projects.length}</span></a>
    <a class="wtab" href="#/objects"${active === 'objects' ? ' aria-current="page"' : ''}><span class="num">02</span> Object design <span class="wc">${objects.length}</span></a>
  </nav>`;
}
function chipRow(label, group, values){
  return `<div class="fl-row"><span class="fl-l label" id="fl-${group}">${esc(label)}</span>
    <div class="chips" role="group" aria-labelledby="fl-${group}">${values.map((c, i) =>
      `<button type="button" class="chip" data-g="${group}" data-f="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join('')}</div></div>`;
}
R.work = function(){
  $('#main').innerHTML = `
  ${pageHead('Work', 'Projects & object design',
    `${projects.length} projects: data halls resolved inside existing buildings, technical documentation, a museum and a sports complex of my own, and an urban baseline study. Client and project names are withheld throughout.`,
    workTabs('projects'))}
  <section class="container section-tight">
    <div class="fl rv">
      ${chipRow('Type', 'kind', ['All', ...new Set(projects.map(p => p.kind).filter(Boolean))])}
      ${chipRow('Includes', 'deliver', ['All', 'Proposal', 'Drawings', 'Renders'])}
    </div>
    <p class="fl-count small muted" id="flCount" aria-live="polite"></p>
    <div class="works works-all" id="grid"></div>
    <div class="empty" id="none" hidden><p class="h3">No projects in this category.</p><button type="button" class="btn btn-ghost btn-sm" id="flReset">Show all projects</button></div>
  </section>`;

  const F = {kind: 'All', deliver: 'All'};
  const draw = () => {
    const list = projects.filter(p => (F.kind === 'All' || p.kind === F.kind) && (F.deliver === 'All' || (p.deliver || []).includes(F.deliver)));
    $('#grid').innerHTML = list.map(p => workCard(p)).join('');
    $('#none').hidden = !!list.length;
    $('#flCount').textContent = `${list.length} / ${projects.length}`;
    reveals();
  };
  const setChip = (g, v) => { F[g] = v; $$(`.chip[data-g="${g}"]`).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.f === v))); };
  $$('.chip[data-g]').forEach(c => c.addEventListener('click', () => { setChip(c.dataset.g, c.dataset.f); draw(); }));
  $('#flReset').addEventListener('click', () => { setChip('kind', 'All'); setChip('deliver', 'All'); draw(); });
  draw();
};

const OBJ_SCENE = {'obj-server-rack-800x1200x2040': 'rack1', 'obj-open-genset': 'gen', 'obj-power-transformer-2000kva': 'tr', 'obj-ups-battery-cabinet': 'bat'};
const OBJ_IMAGE = {'obj-tennis-volleyball-complex': 'tv-03.webp'};
R.objects = function(){
  $('#main').innerHTML = `
  ${pageHead('Work', 'Projects & object design',
    'Objects I design and build to reuse — 3D and BIM objects for technical spaces, and web components made in HTML. Each one opens on its own page.',
    workTabs('objects'))}
  <section class="container section-tight">
    <div class="fl rv">${chipRow('Type', 'otype', ['All', ...OBJECT_TYPES])}</div>
    <div class="objs" id="olist"></div>
    <div class="empty" id="none" hidden><p class="h3">No objects of this type yet.</p></div>
  </section>`;
  const draw = f => {
    const L = objects.map((o, n) => ({o, n})).filter(({o}) => f === 'All' || o.type === f);
    $('#olist').innerHTML = L.map(({o, n}) => `
      <article class="obj rv">
        <div class="obj-vis" aria-hidden="true">${OBJ_SCENE[o.file] ? DCScene.thumb(OBJ_SCENE[o.file]) : OBJ_IMAGE[o.file] ? img(OBJ_IMAGE[o.file], {sizes: '400px'}) : ''}
          <span class="obj-idx num">OBJECT / ${pad(n + 1)}</span></div>
        <div class="obj-body">
          <p class="label">${esc(o.type || '')}</p>
          <h2 class="obj-t">${esc(o.title)}</h2>
          ${o.description ? `<p class="small muted">${esc(o.description)}</p>` : ''}
          <div class="obj-act">
            ${o.file ? `<button type="button" class="btn btn-primary btn-sm" data-model="${esc(o.file)}">Open 3D viewer ${I.cube}</button>
            <a class="btn btn-ghost btn-sm" href="${modelHref(o.file)}" target="_blank" rel="noopener">New tab <span class="sr-only">(opens in a new tab)</span>${I.external}</a>` : ''}
            ${o.url ? `<a class="btn btn-ghost btn-sm" href="${esc(o.url)}" target="_blank" rel="noopener">Open ${I.arrowUR}</a>` : ''}
          </div>
        </div>
      </article>`).join('');
    $('#none').hidden = !!L.length;
    DCScene.fitThumbs($('#olist'));
    reveals();
  };
  $$('.chip[data-g]').forEach(c => c.addEventListener('click', () => {
    $$('.chip[data-g]').forEach(x => x.setAttribute('aria-pressed', String(x === c))); draw(c.dataset.f); }));
  draw('All');
};

/* ═══════════════════════════════════════════════════════════════════════
   CASE STUDY
   ═══════════════════════════════════════════════════════════════════════ */
const firstSentence = t => { if(miss(t)) return ''; const m = String(t).match(/^.*?[.!?](\s|$)/); return (m ? m[0] : t).trim(); };
function outputOf(p){
  const o = []; if(p.proposal) o.push(`${p.proposal.pages}-page ${(p.proposal.label || 'design proposal').toLowerCase()}`);
  (p.deliver || []).filter(x => x !== 'Proposal').forEach(x => o.push(x.toLowerCase()));
  return o.length ? o.join(' · ').replace(/^./, c => c.toUpperCase()) : '';
}
// Split "14.63 × 14.38 m — active design development" into a value and a note.
const splitFact = v => { const [a, ...b] = String(v).split('—'); return [a.trim(), b.join('—').trim()]; };

function galleryHTML(figs){
  const isDraw = f => f.aspect === 'plan' || f.aspect === 'board';
  const fig = (f, cls) => `<figure class="gl ${cls}"><div class="gl-f">${img(f.src, {alt: f.caption || f.label, sizes: cls.includes('gl-full') ? '(min-width: 1100px) 900px, 100vw' : '(min-width: 1100px) 450px, (min-width: 768px) 50vw, 100vw'})}</div>
    <figcaption><span class="gl-l">${esc(f.label || '')}</span>${f.caption ? `<span class="muted">${esc(f.caption)}</span>` : ''}</figcaption></figure>`;
  const photos = figs.filter(f => !isDraw(f)), draws = figs.filter(isDraw);
  let h = '';
  if(photos.length){ const lead = photos.length % 2 ? photos[0] : null, rest = lead ? photos.slice(1) : photos;
    h += `<div class="gl-grid">${lead ? fig(lead, 'gl-photo gl-full') : ''}${rest.map(f => fig(f, 'gl-photo')).join('')}</div>`; }
  if(draws.length){ const wide = draws.filter(f => (f.r || 1.4) >= 1.25), tall = draws.filter(f => (f.r || 1.4) < 1.25);
    h += `<div class="gl-grid">${tall.map(f => fig(f, 'gl-draw' + (tall.length === 1 ? ' gl-full' : ''))).join('')}${wide.map(f => fig(f, 'gl-draw gl-full')).join('')}</div>`; }
  return h;
}

const PROPOSAL_PREVIEW = 6;
function proposalHTML(p){
  const pr = p.proposal, portrait = (pr.ratio || 1.4) < 1;
  const pages = Array.from({length: pr.pages}, (_, i) => i + 1);
  return `<div class="pv${portrait ? ' pv-portrait' : ''}" data-open="${pr.pages <= PROPOSAL_PREVIEW + 2}">
    <div class="pv-grid">${pages.map(n => `<figure class="pv-page"${n > PROPOSAL_PREVIEW && pr.pages > PROPOSAL_PREVIEW + 2 ? ' data-more' : ''}>
      ${img(`pp-${p.slug}-${pad(n)}.webp`, {alt: `${p.title} — proposal page ${n}`, sizes: portrait ? '(min-width: 1100px) 300px, (min-width: 600px) 33vw, 100vw' : '(min-width: 1100px) 450px, (min-width: 768px) 50vw, 100vw'})}
      <figcaption class="num">${pad(n)} / ${pad(pr.pages)}</figcaption></figure>`).join('')}</div>
    ${pr.pages > PROPOSAL_PREVIEW + 2 ? `<button type="button" class="btn btn-ghost pv-more" aria-expanded="false">${I.plus}<span>Show all ${pr.pages} pages</span></button>` : ''}
  </div>`;
}

R.project = function(){
  const p = projects.find(x => x.slug === SLUG);
  if(!p){ PAGE = 'notfound'; R.notfound(); return; }
  const i = projects.indexOf(p), next = projects[(i + 1) % projects.length];
  const byName = {};
  [p.cover, ...(p.gallery || []), ...((p.boards && p.boards.items) || [])].forEach(f => { if(f && f.src) byName[f.src] = f; });

  // Title block: the same metadata a drawing sheet carries.
  const tb = [
    ['Type', p.type], ['Discipline', p.discipline || p.category], ['Year', p.year], ['Status', p.status],
    ['Timeline', p.timeline], ['My role', p.role], ['Tools', (p.tools || []).join(' · ')], ['Credit', p.credit]
  ].filter(([, v]) => !miss(v));

  const S = [];
  if(p.overview) S.push(['Concept', `<p class="prose">${esc(p.overview)}</p>`]);
  if(!miss(p.challenge)) S.push(['The problem', `<p class="prose">${esc(p.challenge)}</p>`]);
  if(p.approach) S.push(['Approach', `<p class="prose">${esc(p.approach)}</p>`]);
  if(p.facts && p.facts.length) S.push(['Documented', `
    <dl class="metrics">${p.facts.map(([k, v], n) => { const [a, b] = splitFact(v);
      return `<div class="metric"><dt><span class="num">${pad(n + 1)}</span>${esc(k)}</dt><dd><span class="mv${a.length > 28 ? ' mv-long' : ''}">${esc(a)}</span>${b ? `<span class="ml">${esc(b)}</span>` : ''}</dd></div>`; }).join('')}</dl>
    <p class="small muted note">Every figure is read off the project drawings or counted on them. Where the documentation carries no value the field is left blank rather than estimated.</p>`]);
  (p.groups || []).forEach(([title, names]) => { const figs = names.map(n => byName[n]).filter(Boolean); if(figs.length) S.push([title, galleryHTML(figs)]); });
  // Anything in the gallery not placed in a group still gets shown.
  const grouped = new Set((p.groups || []).flatMap(g => g[1]));
  const loose = (p.gallery || []).filter(f => f.src && !grouped.has(f.src));
  if(loose.length) S.push(['Gallery', galleryHTML(loose)]);
  if(p.boards && p.boards.items.length && !(p.groups || []).some(g => g[1].includes(p.boards.items[0].src))) S.push([p.boards.title, galleryHTML(p.boards.items)]);
  if(!miss(p.solution)) S.push(['Final solution', `<p class="prose">${esc(p.solution)}</p>`]);
  if(p.learned) S.push(['What I learned', `<p class="prose">${esc(p.learned)}</p>`]);
  if(p.results) S.push(['Results', `<p class="prose">${esc(p.results)}</p>`]);
  if(p.proposal) S.push([`${p.proposal.label || 'Design proposal'} · ${p.proposal.pages} pages`, proposalHTML(p), 'proposal']);

  // Role is already in the title block; the brief keeps the problem and the deliverables side by side.
  const brief = [['The problem', firstSentence(p.challenge)], ['Output', outputOf(p)]].filter(r => r[1]);
  const related = projects.filter(x => x.slug !== p.slug && x.category === p.category).concat(projects.filter(x => x.slug !== p.slug && x.category !== p.category)).slice(0, 3);

  $('#main').innerHTML = `
  <article class="case">
    <header class="case-head container">
      <a class="back-link" href="#/work">${I.back}<span>All work</span></a>
      <p class="label rv">Project ${pad(i + 1)} / ${pad(projects.length)} — ${esc(p.discipline || p.category)}</p>
      <h1 class="h1 case-title rv" tabindex="-1">${esc(p.title)}</h1>
      ${p.kicker ? `<p class="case-kicker rv">${esc(p.kicker)}</p>` : ''}
      <div class="case-intro rv">
        <p class="lede">${esc(p.summary)}</p>
        <div class="case-actions">
          ${p.model ? `<button type="button" class="btn btn-primary" data-model="${esc(p.model)}">Open the interactive 3D model ${I.cube}</button>` : ''}
          ${p.proposal ? `<a class="btn btn-ghost" href="#/work/${p.slug}" data-jump="sec-proposal">View the ${esc((p.proposal.label || 'design proposal').toLowerCase())} · ${p.proposal.pages} pages ${I.arrow}</a>` : ''}
        </div>
      </div>
    </header>

    <figure class="case-cover container rv">
      <div class="case-cover-f${p.cover && p.cover.aspect === 'plan' ? ' is-plan' : ''}">${img(p.cover && p.cover.src, {alt: (p.cover && p.cover.label) || p.title, eager: true, sizes: '(min-width: 1440px) 1340px, 100vw'})}</div>
      ${p.cover && p.cover.label ? `<figcaption class="small muted"><span class="num">FIG. 01</span> ${esc(p.cover.label)}</figcaption>` : ''}
    </figure>

    <section class="container" aria-label="Project information">
      <dl class="titleblock rv">${tb.map(([k, v]) => `<div class="tb-cell${k === 'My role' || k === 'Type' ? ' tb-wide' : ''}"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      ${brief.length ? `<dl class="brief rv">${brief.map(([k, v]) => `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    </section>

    <div class="container case-body">
      ${S.map(([t, html, id], n) => `
      <section class="cs-sec rv" id="sec-${id || n}" aria-labelledby="cs-h-${n}">
        <div class="cs-side"><span class="cs-n num">${pad(n + 1)}</span><h2 class="cs-h" id="cs-h-${n}">${esc(t)}</h2></div>
        <div class="cs-main">${html}</div>
      </section>`).join('')}
    </div>

    <section class="container related" aria-labelledby="rel-h">
      <div class="sec-rule"><span class="sec-n num">↗</span><span class="label" id="rel-h">Related work</span></div>
      <div class="works works-3">${related.map(r => workCard(r, {sizes: '(min-width: 900px) 33vw, 100vw'})).join('')}</div>
    </section>

    <nav class="next-proj" aria-label="Next project">
      <div class="container"><a class="next-card" href="#/work/${next.slug}">
        <span class="label">Next project</span>
        <span class="next-t h2">${esc(next.title)}</span>
        <span class="small muted">${esc(next.discipline || next.category)} · ${esc(next.year)}</span>
        <span class="next-go" aria-hidden="true">${I.arrow}</span>
      </a></div>
    </nav>
  </article>`;

  onPage($('#main'), 'click', e => {
    const j = e.target.closest('[data-jump]');
    if(j){ e.preventDefault(); const t = document.getElementById(j.dataset.jump); t && t.scrollIntoView({behavior: CALM ? 'auto' : 'smooth', block: 'start'}); return; }
    const m = e.target.closest('.pv-more');
    if(m){ const pv = m.closest('.pv'), open = pv.dataset.open !== 'true';
      pv.dataset.open = String(open); m.setAttribute('aria-expanded', String(open));
      $('span', m).textContent = open ? U.t('Show fewer pages') : `${U.t('Show all')} ${p.proposal.pages} ${U.t('pages')}`;
      if(!open) pv.scrollIntoView({behavior: CALM ? 'auto' : 'smooth', block: 'start'});
      reveals(); }
  });
};

/* Lightbox for case-study imagery and proposal pages. */
const LB = (() => {
  let box, list = [], cur = 0, opener = null;
  const build = () => {
    box = document.createElement('div'); box.className = 'lb'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = `<div class="lb-bar"><span class="lb-count num" aria-live="polite"></span><button type="button" class="icon-btn lb-x" aria-label="Close">${I.close}</button></div>
      <figure class="lb-f"><div class="lb-img"><img alt=""><span class="spinner" aria-hidden="true"></span></div><figcaption></figcaption></figure>
      <button type="button" class="icon-btn lb-p" aria-label="Previous">${I.arrowL}</button><button type="button" class="icon-btn lb-n" aria-label="Next">${I.arrow}</button>`;
    document.body.appendChild(box);
    $('.lb-x', box).onclick = close; $('.lb-p', box).onclick = () => show(cur - 1); $('.lb-n', box).onclick = () => show(cur + 1);
    box.addEventListener('click', e => { if(e.target === box || e.target.classList.contains('lb-f') || e.target.classList.contains('lb-img')) close(); });
    const im = $('img', box); im.addEventListener('load', () => box.classList.remove('loading'));
    let sx = null;
    box.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive: true});
    box.addEventListener('touchend', e => { if(sx === null) return; const dx = e.changedTouches[0].clientX - sx; if(Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
    box.addEventListener('keydown', e => {
      if(e.key === 'Escape') close();
      else if(e.key === 'ArrowRight') show(cur + 1);
      else if(e.key === 'ArrowLeft') show(cur - 1);
      else if(e.key === 'Tab'){ const f = $$('button', box), i = f.indexOf(document.activeElement);
        if(e.shiftKey && i <= 0){ e.preventDefault(); f[f.length - 1].focus(); } else if(!e.shiftKey && i === f.length - 1){ e.preventDefault(); f[0].focus(); } }
    });
  };
  const show = k => {
    cur = (k + list.length) % list.length; const i = list[cur], im = $('img', box);
    box.classList.add('loading'); im.src = i.dataset.full || i.currentSrc || i.src; im.alt = i.alt;
    if(im.complete) box.classList.remove('loading');
    const cap = i.closest('figure') && $('figcaption', i.closest('figure'));
    $('figcaption', box).textContent = cap ? [...cap.children].map(c => c.textContent.trim()).filter(Boolean).join(' — ') || cap.textContent.trim() : i.alt;
    $('.lb-count', box).textContent = `${cur + 1} / ${list.length}`;
    box.classList.toggle('lb-draw', !!i.closest('.gl-draw,.pv-page,.is-plan'));
    const multi = list.length > 1; $('.lb-p', box).hidden = !multi; $('.lb-n', box).hidden = !multi;
  };
  const open = i => {
    if(!box) build(); opener = document.activeElement;
    const scope = i.closest('.pv') || $('#main');
    list = $$('.gl-f img, .pv-page img, .case-cover-f img', scope).filter(x => x.offsetParent !== null);
    box.hidden = false; document.documentElement.classList.add('locked');
    show(list.indexOf(i)); requestAnimationFrame(() => box.classList.add('on')); $('.lb-x', box).focus();
  };
  function close(){ box.classList.remove('on'); document.documentElement.classList.remove('locked');
    setTimeout(() => { box.hidden = true; $('img', box).removeAttribute('src'); }, CALM ? 0 : 200); opener && opener.focus && opener.focus({preventScroll: true}); }
  document.addEventListener('click', e => {
    const i = e.target.closest && e.target.closest('.gl-f img, .pv-page img, .case-cover-f img'); if(!i) return;
    e.preventDefault(); open(i);
  });
  // Images become keyboard-operable too.
  document.addEventListener('keydown', e => {
    if((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.gl-f img, .pv-page img, .case-cover-f img')){ e.preventDefault(); open(e.target); }
  });
  return {prepare(){ $$('.gl-f img, .pv-page img, .case-cover-f img').forEach(i => { i.tabIndex = 0; i.setAttribute('role', 'button'); i.setAttribute('aria-label', `${U.t('Enlarge')}: ${i.alt}`); }); }};
})();

/* 3D model viewer: models are standalone pages, shown in a dialog. */
const Viewer = (() => {
  let box, opener = null;
  const build = () => {
    box = document.createElement('div'); box.className = 'viewer'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'viewer-t');
    box.innerHTML = `<div class="viewer-in">
      <div class="viewer-bar"><div><p class="label" id="viewer-k">3D / BIM · Interactive model</p><h2 class="viewer-t" id="viewer-t"></h2></div>
        <div class="viewer-tools"><a class="btn btn-ghost btn-sm" id="viewer-new" target="_blank" rel="noopener">New tab <span class="sr-only">(opens in a new tab)</span>${I.external}</a>
        <button type="button" class="icon-btn" id="viewer-x" aria-label="Close">${I.close}</button></div></div>
      <div class="viewer-body"><iframe title="" allow="fullscreen" allowfullscreen></iframe>
        <div class="viewer-load" role="status"><span class="spinner" aria-hidden="true"></span><span>Loading the 3D model…</span></div></div>
      <p class="viewer-hint small muted">Drag to orbit · scroll or pinch to zoom. The 3D engine loads from the internet, so an offline copy shows the page without the model.</p>
    </div>`;
    document.body.appendChild(box);
    const fr = $('iframe', box);
    fr.addEventListener('load', () => { if(fr.getAttribute('src')) box.classList.remove('loading'); });
    $('#viewer-x', box).onclick = close;
    box.addEventListener('click', e => { if(e.target === box) close(); });
    box.addEventListener('keydown', e => {
      if(e.key === 'Escape') close();
      if(e.key === 'Tab'){ const f = $$('a,button,iframe', box), i = f.indexOf(document.activeElement);
        if(e.shiftKey && i <= 0){ e.preventDefault(); f[f.length - 1].focus(); } else if(!e.shiftKey && i === f.length - 1){ e.preventDefault(); f[0].focus(); } }
    });
  };
  const open = key => {
    if(!box) build(); opener = document.activeElement;
    const o = objects.find(x => x.file === key), title = o ? o.title : key;
    $('#viewer-t', box).textContent = U.t(title);
    const fr = $('iframe', box); fr.title = `${U.t('3D model')} — ${U.t(title)}`;
    box.classList.add('loading'); fr.src = modelHref(key); $('#viewer-new', box).href = modelHref(key);
    box.hidden = false; document.documentElement.classList.add('locked');
    requestAnimationFrame(() => box.classList.add('on')); $('#viewer-x', box).focus();
  };
  function close(){ box.classList.remove('on'); document.documentElement.classList.remove('locked');
    setTimeout(() => { box.hidden = true; $('iframe', box).removeAttribute('src'); }, CALM ? 0 : 200);
    opener && opener.focus && opener.focus({preventScroll: true}); }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-model]'); if(!b) return; e.preventDefault(); open(b.dataset.model); });
  return {open};
})();

/* ═══════════════════════════════════════════════════════════════════════
   ABOUT · SERVICES · PROCESS
   ═══════════════════════════════════════════════════════════════════════ */
R.about = function(){
  $('#main').innerHTML = `
  ${pageHead('About', profile.aboutLead)}
  <section class="container section-tight">
    <div class="about-grid">
      <div class="about-side rv">
        <figure class="portrait">${img('v00.webp', {alt: profile.name, eager: true, sizes: '(min-width: 900px) 400px, 100vw'})}<figcaption class="small muted">${esc(profile.name)}</figcaption></figure>
        <dl class="spec">
          <div><dt>Based in</dt><dd>${esc(profile.location)}</dd></div>
          <div><dt>Focus</dt><dd>Data center & architecture</dd></div>
          <div><dt>Availability</dt><dd>${esc(profile.status)}</dd></div>
        </dl>
      </div>
      <div class="about-copy">${profile.about.map(p => `<p class="lede rv">${esc(p)}</p>`).join('')}
        <a class="btn btn-ghost rv" href="#/contact">Get in touch ${I.arrow}</a></div>
    </div>
  </section>

  <section class="section container" aria-labelledby="sk-h">
    ${secHead('01', 'Capabilities', 'Skills', {id: 'sk-h'})}
    <div class="skills">${skillGroups.map((g, i) => `<div class="skill rv"><h3 class="label"><span class="num">${pad(i + 1)}</span> ${esc(g.title)}</h3>
      <ul>${g.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>
  </section>

  <section class="section container" aria-labelledby="ex-h">
    ${secHead('02', 'Career', 'Experience', {id: 'ex-h'})}
    <ol class="exp">${experience.map((r, i) => `<li class="exp-i rv">
      <div class="exp-h"><span class="num muted">${pad(i + 1)}</span><div><h3 class="h3">${esc(r.org)}</h3><p class="muted">${esc(r.role)}</p>
        ${miss(r.period) ? '' : `<p class="label">${esc(r.period)}</p>`}</div></div>
      <ul class="exp-d">${r.duties.map(d => `<li>${esc(d)}</li>`).join('')}</ul></li>`).join('')}
      <li class="exp-i rv"><div class="exp-h"><span class="num muted">${pad(experience.length + 1)}</span><div><h3 class="h3">Freelance</h3></div></div>
        <p class="exp-d lede muted">${esc(freelanceNote)}</p></li>
    </ol>
  </section>
  ${ctaBand()}`;
};

R.services = function(){
  $('#main').innerHTML = `
  ${pageHead('Services', 'What I take on', 'The architectural and spatial side of a data center — and the documentation that makes it buildable. Specialist discipline engineering sits outside this scope, and I say so in writing on every project.')}
  <section class="container section-tight">
    <ol class="svc">${services.map(s => `<li class="svc-i rv"><span class="svc-n num">${s.n}</span>
      <h2 class="h3">${esc(s.title)}</h2><p class="muted">${esc(s.body)}</p></li>`).join('')}</ol>
  </section>
  ${ctaBand()}`;
};

R.process = function(){
  $('#main').innerHTML = `
  ${pageHead('Process', 'How a project runs', 'Six phases, run in sequence. The first two are control points: no layout work begins until the existing geometry and the technical requirements are both established.',
    `<nav class="pr-rail rv" aria-label="Phases">${processPhases.map(([n, t], i) => `<button type="button" data-ph="${i}"><span class="num">${n}</span><span>${esc(t)}</span></button>`).join('')}</nav>`)}
  <section class="container pr-wrap">
    <div class="pr-line" aria-hidden="true"><i></i></div>
    <ol class="pr-list">${processPhases.map(([n, t, d], i) => `
      ${i === 2 ? `<li class="pr-gate rv" aria-hidden="true"><span>${I.arrow}<b>Gate</b><span>Geometry and requirements confirmed</span></span></li>` : ''}
      <li class="pr-step rv" id="ph-${n}">
        <span class="pr-node" aria-hidden="true"><span class="num">${n}</span></span>
        <article class="pr-card">
          <div class="pr-top"><span class="pr-ic">${svgI(PROC_IC[i] || '')}</span>
            <span class="label">Phase ${n} / ${pad(processPhases.length)}</span>${i < 2 ? `<span class="pr-tag">Control point</span>` : ''}</div>
          <h2 class="h3">${esc(t)}</h2>
          <p class="muted">${esc(d)}</p>
        </article>
      </li>`).join('')}
    </ol>
  </section>
  ${ctaBand()}`;

  const list = $('.pr-list'), line = $('.pr-line i'), steps = $$('.pr-step'), rail = $$('.pr-rail button');
  rail.forEach(b => b.addEventListener('click', () => { const t = steps[+b.dataset.ph];
    scrollTo({top: t.getBoundingClientRect().top + scrollY - innerHeight * .3, behavior: CALM ? 'auto' : 'smooth'}); }));
  let raf = 0;
  const upd = () => { raf = 0;
    const r = list.getBoundingClientRect(), mid = innerHeight * .55;
    line.style.transform = `scaleY(${Math.min(1, Math.max(0, (mid - r.top) / r.height))})`;
    let act = 0; steps.forEach((s, i) => { if(s.getBoundingClientRect().top < mid) act = i; });
    steps.forEach((s, i) => { s.classList.toggle('on', i === act); s.classList.toggle('done', i < act); });
    rail.forEach((a, i) => a.toggleAttribute('aria-current', i === act)); };
  onPage(window, 'scroll', () => { if(!raf) raf = requestAnimationFrame(upd); }, {passive: true});
  upd();
};

/* ═══════════════════════════════════════════════════════════════════════
   CONTACT — a request form that prepares a message; nothing is sent
   automatically. The visitor chooses Telegram, email or copy.
   ═══════════════════════════════════════════════════════════════════════ */
let REQ_DRAFT = {};
R.contact = function(){
  const cp = v => `<button type="button" class="icon-b" data-copy="${esc(v)}">${I.copy}<span class="cp-l">Copy</span></button>`;
  const act = (ic, small, val, btns, cls = '') => `<div class="act ${cls}"><span class="act-ic">${ic}</span>
    <div class="act-t"><small>${small}</small><span class="val" dir="ltr">${val}</span></div><div class="act-b">${btns}</div></div>`;
  $('#main').innerHTML = `
  <section class="container ct">
    <div class="ct-grid">
      <div class="ct-side">
        <p class="label rv">Contact</p>
        <h1 class="h1 rv" tabindex="-1">Have a project in mind?</h1>
        <p class="lede muted rv">Send the project, the deadline and what you need at the end. I will review it and come back to agree the scope, timeline and cost with you.</p>
        <div class="acts rv">
          ${act(I.phone, 'Call directly', CONTACT.phone, `<a class="icon-b" href="${CONTACT.phoneHref}">${I.phone}<span>Call</span></a>${cp(CONTACT.phone)}`)}
          ${act(I.send, 'Message on Telegram', CONTACT.tg, `<a class="icon-b" href="${CONTACT.tgHref}" target="_blank" rel="noopener">${I.send}<span>Open</span></a>${cp(CONTACT.tg)}`)}
          ${act(I.mail, 'Email', esc(profile.email), `<a class="icon-b" href="mailto:${esc(profile.email)}">${I.mail}<span>Write</span></a>${cp(profile.email)}`, 'act-mail')}
        </div>
        <p class="small muted rv ct-note">${I.info}<span>If the call button does not work in your browser, copy the number instead.</span></p>
        <dl class="spec rv">
          <div><dt>Location</dt><dd>${esc(profile.location)}</dd></div>
          <div><dt>Availability</dt><dd>${esc(profile.status)}</dd></div>
          ${profile.socials.filter(s => !miss(s.url)).map(s => `<div><dt>${esc(s.label)}</dt><dd><a class="ul" href="${esc(s.url)}" target="_blank" rel="noopener me">${esc(s.handle || 'Open')}</a></dd></div>`).join('')}
        </dl>
      </div>
      <div class="req rv" id="req" tabindex="-1"><div id="reqWrap">${reqForm()}</div></div>
    </div>
  </section>`;
  wireReq();
};
function reqForm(){
  const d = REQ_DRAFT;
  const sel = (id, opts, v) => `<select class="inp" id="${id}" required aria-required="true"><option value="">Select…</option>${opts.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  const err = id => `<p class="err" id="${id}-e" hidden></p>`;
  const lab = (id, t, req = true) => `<label for="${id}">${t}</label>${req ? ' <span class="req-s" aria-hidden="true">*</span>' : ' <span class="muted small">(optional)</span>'}`;
  return `<form id="rq" novalidate aria-labelledby="rq-h">
    <h2 class="req-h" id="rq-h">Project request form</h2><p class="small muted">Fields marked * are required.</p>
    <div class="rq-grid">
      <div class="field">${lab('r-name', 'Full name')}<input class="inp" id="r-name" type="text" autocomplete="name" required aria-required="true" value="${esc(d.name || '')}">${err('r-name')}</div>
      <div class="field">${lab('r-phone', 'Phone number')}<input class="inp" id="r-phone" type="tel" dir="ltr" inputmode="tel" autocomplete="tel" placeholder="09xxxxxxxxx" required aria-required="true" value="${esc(d.phone || '')}">${err('r-phone')}</div>
      <div class="field">${lab('r-type', 'Project type')}${sel('r-type', REQ_TYPES, d.type)}${err('r-type')}</div>
      <div class="field">${lab('r-time', 'Timeline')}${sel('r-time', REQ_TIMES, d.time)}${err('r-time')}</div>
      <div class="field full">${lab('r-msg', 'Short project description')}<textarea class="inp" id="r-msg" rows="4" required aria-required="true" placeholder="e.g. a data hall inside an existing floor, 24 racks, sheets needed by the end of the month.">${esc(d.msg || '')}</textarea>${err('r-msg')}</div>
      <div class="field full">${lab('r-link', 'Link to files or references', false)}<input class="inp" id="r-link" type="url" dir="ltr" placeholder="https://" value="${esc(d.link || '')}">${err('r-link')}</div>
      <fieldset class="field full" aria-describedby="r-via-e"><legend>Preferred way to reply <span class="req-s" aria-hidden="true">*</span></legend>
        <div class="radios">${[['phone', 'Phone call'], ['telegram', 'Telegram'], ['email', 'Email']].map(([v, l]) => `<label class="radio"><input type="radio" name="r-via" value="${v}"${d.via === v ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>${err('r-via')}</fieldset>
    </div>
    <button class="btn btn-accent" type="submit">Send request ${I.arrow}</button>
  </form>`;
}
function reqText(d){
  const fa = LANG === 'fa', tr = s => fa && window.FA && FA[s] ? FA[s] : s;
  const L = fa ? ['درخواست پروژه', 'نام', 'تلفن', 'نوع پروژه', 'زمان تحویل', 'توضیح', 'لینک', 'روش پاسخ'] : ['Project request', 'Name', 'Phone', 'Project type', 'Timeline', 'Description', 'Link', 'Reply by'];
  const via = {phone: 'Phone call', telegram: 'Telegram', email: 'Email'}[d.via];
  return `${L[0]}\n${L[1]}: ${d.name}\n${L[2]}: ${d.phone}\n${L[3]}: ${tr(d.type)}\n${L[4]}: ${tr(d.time)}\n${L[6]}: ${d.link || '—'}\n${L[7]}: ${tr(via)}\n\n${L[5]}:\n${d.msg}`;
}
function wireReq(){
  $$('[data-copy]').forEach(b => b.onclick = () => copyText(b.dataset.copy, b));
  const form = $('#rq'); if(!form) return;
  const ids = ['r-name', 'r-phone', 'r-type', 'r-time', 'r-msg', 'r-link'];
  const save = () => { REQ_DRAFT = {name: $('#r-name').value, phone: $('#r-phone').value, type: $('#r-type').value, time: $('#r-time').value,
    msg: $('#r-msg').value, link: $('#r-link').value, via: (form.querySelector('input[name=r-via]:checked') || {}).value}; };
  const bad = (id, msg) => { const el = $('#' + id), p = $('#' + id + '-e');
    if(el){ el.classList.add('bad'); el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', id + '-e'); }
    p.textContent = U.t(msg); p.hidden = false; };
  const clr = id => { const el = $('#' + id), p = $('#' + id + '-e');
    if(el){ el.classList.remove('bad'); el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); } if(p) p.hidden = true; };
  ids.forEach(id => $('#' + id).addEventListener('input', () => { clr(id); save(); }));
  $$('input[name=r-via]', form).forEach(r => r.addEventListener('change', () => { clr('r-via'); save(); }));
  form.addEventListener('submit', e => {
    e.preventDefault(); save(); [...ids, 'r-via'].forEach(clr);
    const d = {...REQ_DRAFT};
    const digits = String(d.phone || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[\s\-()]/g, '');
    let first = null; const f = (id, msg) => { bad(id, msg); first = first || id; };
    if(!d.name.trim()) f('r-name', 'Please enter your name.');
    if(!/^(\+98|0098|0)?9\d{9}$/.test(digits)) f('r-phone', 'Please enter a mobile number, e.g. 09123456789.');
    if(!d.type) f('r-type', 'Please choose a project type.');
    if(!d.time) f('r-time', 'Please choose a timeline.');
    if(d.msg.trim().length < 10) f('r-msg', 'Please describe the project in a sentence or two.');
    if(d.link.trim() && !/^https?:\/\/\S+\.\S+/.test(d.link.trim())) f('r-link', 'That link does not look right — it should start with https://');
    if(!d.via) f('r-via', 'Please choose how I should reply.');
    if(first){ const el = first === 'r-via' ? form.querySelector('input[name=r-via]') : $('#' + first); el && el.focus(); return; }
    d.phone = digits; const text = reqText(d); copyText(text);
    $('#reqWrap').innerHTML = `<div class="req-ok" role="status">
      <span class="ok-ic">${I.form}</span>
      <h2 class="req-h">Your request is ready</h2>
      <p class="small muted">Nothing is sent automatically — choose how to send it. The text is copied for you.</p>
      <pre class="req-pre" dir="auto">${esc(text)}</pre>
      <div class="req-btns">
        <a class="btn btn-accent" href="${CONTACT.tgHref}" target="_blank" rel="noopener">${I.send}<span>Send on Telegram</span></a>
        <a class="btn btn-ghost" href="mailto:${esc(profile.email)}?subject=${encodeURIComponent((LANG === 'fa' ? 'درخواست پروژه — ' : 'Project request — ') + U.t(d.type))}&body=${encodeURIComponent(text)}">${I.mail}<span>Send by email</span></a>
        <button type="button" class="btn btn-ghost" data-copy-req>${I.copy}<span class="cp-l">Copy request</span></button>
        <button type="button" class="btn btn-ghost" data-new-req>New request</button>
      </div></div>`;
    const cb = $('[data-copy-req]'); cb.onclick = () => copyText(text, cb);
    $('[data-new-req]').onclick = () => { REQ_DRAFT = {}; $('#reqWrap').innerHTML = reqForm(); wireReq(); $('#r-name').focus(); };
    $('#req').focus({preventScroll: true});
  });
}

R.notfound = function(){
  $('#main').innerHTML = `
  <section class="container nf">
    <p class="nf-code num" aria-hidden="true">404</p>
    <h1 class="h1" tabindex="-1">This page does not exist.</h1>
    <p class="lede muted">The link may be out of date, or the page may have moved. Everything else is where it should be.</p>
    <div class="nf-act"><a class="btn btn-primary" href="#/">Back to home</a><a class="btn btn-ghost" href="#/work">See the work</a></div>
  </section>`;
};

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL REVEALS
   ═══════════════════════════════════════════════════════════════════════ */
let revealIO = null;
/* Section labels decode like a status readout (English only — Persian text
   is swapped in by node, so it is left untouched). */
function scramble(el){
  if(!el || CALM || LANG === 'fa') return;
  const node = [...el.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim()); if(!node) return;
  const final = node.nodeValue, glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+-', t0 = performance.now(), dur = 750;
  const step = now => { if(!node.isConnected) return;
    const k = Math.min(1, (now - t0) / dur), n = Math.floor(final.length * k);
    node.nodeValue = k < 1 ? final.slice(0, n) + final.slice(n).replace(/\S/g, () => glyphs[Math.random() * glyphs.length | 0]) : final;
    if(k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function reveals(){
  const els = $$('.rv:not(.in)');
  if(CALM || !('IntersectionObserver' in window)){ els.forEach(e => e.classList.add('in')); return; }
  revealIO = revealIO || new IntersectionObserver(es => {
    let n = 0;
    es.forEach(e => { if(!e.isIntersecting) return; const el = e.target;
      el.style.transitionDelay = `${Math.min(n++, 5) * 60}ms`; el.classList.add('in'); revealIO.unobserve(el);
      if(el.classList.contains('sec-head')) scramble($('.sec-rule .label', el)); });
  }, {rootMargin: '0px 0px -8% 0px'});
  els.forEach(e => revealIO.observe(e));
}

/* ═══════════════════════════════════════════════════════════════════════
   LANGUAGE — English source, Persian applied by swapping text nodes.
   Project case studies stay in English (their technical content is not
   translated), so their main column is marked LTR.
   ═══════════════════════════════════════════════════════════════════════ */
const FA_SPLIT = /(\s+[·—|]\s+|\s+\/\s+)/;
const I18N_ATTR = ['aria-label', 'placeholder', 'title'];
let faLoading = null, I18N_MO = null;
function loadFA(){
  if(window.FA) return Promise.resolve();
  return faLoading = faLoading || new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'js/i18n-fa.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
function faT(s){
  const FA = window.FA; if(!FA) return null;
  if(FA[s] !== undefined) return FA[s];
  for(const [rx, fn] of window.FA_RX){ const m = s.match(rx); if(m) return fn(m, x => faT(x) || x); }
  if(FA_SPLIT.test(s)){
    const parts = s.split(FA_SPLIT); let hit = false;
    const out = parts.map((p, i) => { if(i % 2) return p; if(FA[p] !== undefined){ hit = true; return FA[p]; }
      return /^[\s\d.,:%+×−–\-()]*$/.test(p) || /^[A-Z0-9 /&.+-]{1,12}$/.test(p) ? p : null; });
    if(hit && out.every(x => x !== null)) return out.join('');
  }
  return null;
}
const skipI18n = el => !el || el.closest('script,style,[data-noi18n],#cur');
function i18nNode(root){
  if(LANG !== 'fa' || !root) return;
  if(root.nodeType === 3){ const p = root.parentElement; if(skipI18n(p)) return;
    const raw = root.nodeValue, key = raw.replace(/\s+/g, ' ').trim(); if(!key || root.__fa === raw) return;
    const t = faT(key); if(t === null) return;
    root.__en = raw; root.nodeValue = raw.match(/^\s*/)[0] + t + raw.match(/\s*$/)[0]; root.__fa = root.nodeValue; return; }
  if(root.nodeType !== 1 || skipI18n(root)) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = []; let n;
  while((n = w.nextNode())) list.push(n);
  list.forEach(i18nNode);
  [root, ...root.querySelectorAll(I18N_ATTR.map(a => `[${a}]`).join(','))].forEach(el => { if(skipI18n(el)) return;
    I18N_ATTR.forEach(a => { const v = el.getAttribute && el.getAttribute(a); if(!v) return;
      const t = faT(v.trim()); if(t === null || t === v) return; (el.__enA = el.__enA || {})[a] = v; el.setAttribute(a, t); }); });
}
function i18nRestore(){
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while((n = w.nextNode())){ if(n.__en !== undefined && n.nodeValue === n.__fa) n.nodeValue = n.__en; delete n.__en; delete n.__fa; }
  $$('*').forEach(el => { if(el.__enA){ for(const a in el.__enA) el.setAttribute(a, el.__enA[a]); delete el.__enA; } });
}
function applyLangAttrs(){
  const h = document.documentElement;
  h.lang = LANG === 'fa' ? 'fa' : 'en'; h.dir = LANG === 'fa' ? 'rtl' : 'ltr';
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
}
function i18nObserve(){
  if(I18N_MO) return;
  I18N_MO = new MutationObserver(ms => { if(LANG !== 'fa') return;
    for(const m of ms){
      if(m.type === 'childList') m.addedNodes.forEach(i18nNode);
      else if(m.type === 'attributes'){ const el = m.target, v = el.getAttribute(m.attributeName);
        if(v && !skipI18n(el)){ const t = faT(v.trim()); if(t !== null && t !== v){ (el.__enA = el.__enA || {})[m.attributeName] = v; el.setAttribute(m.attributeName, t); } } }
      else if(m.type === 'characterData'){ const n = m.target; if(n.nodeValue !== n.__fa) i18nNode(n); }
    } });
  I18N_MO.observe(document.body, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTR});
}
function projectDir(){
  const m = $('#main'), eng = LANG === 'fa' && PAGE === 'project';
  if(eng){ m.setAttribute('dir', 'ltr'); m.setAttribute('lang', 'en'); m.setAttribute('data-noi18n', ''); }
  else { m.removeAttribute('dir'); m.removeAttribute('lang'); m.removeAttribute('data-noi18n'); }
}
async function setLang(l){
  if(l === LANG) return;
  if(l === 'fa'){ try{ await loadFA(); }catch(_){ toast('Could not load Persian text.'); return; } }
  LANG = l; store.set('lang', l); projectDir(); applyLangAttrs();
  if(l === 'fa'){ i18nObserve(); i18nNode(document.body); } else i18nRestore();
  setMeta();
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.lang button[data-lang]'); if(b) setLang(b.dataset.lang); });

/* ═══════════════════════════════════════════════════════════════════════
   ROUTER + META
   ═══════════════════════════════════════════════════════════════════════ */
const PAGE_META = {
  index:   [SITE.title, SITE.description],
  work:    ['Work', `${projects.length} projects: data halls resolved inside existing buildings, technical documentation, a museum, a sports complex and an urban baseline study.`],
  objects: ['Object design', 'Interactive 3D / BIM objects for technical spaces — server rack, diesel genset, 2000 kVA transformer, UPS battery cabinet and a sports-complex site model.'],
  about:   ['About', profile.about[0]],
  services:['Services', 'The architectural and spatial side of a data center — and the documentation that makes it buildable.'],
  process: ['Process', 'Six phases, run in sequence: discover, define, explore, design, test, deliver.'],
  contact: ['Contact', 'Send the project, the deadline and what you need at the end.'],
  notfound:['Page not found', SITE.description]
};
function setMeta(){
  let title, desc, image = SITE.ogImage;
  if(PAGE === 'project'){ const p = projects.find(x => x.slug === SLUG);
    title = `${p.title} — ${p.discipline || p.category} | ${profile.name}`; desc = p.summary; if(p.cover && p.cover.src) image = mediaSrc(p.cover.src); }
  else { const [t, d] = PAGE_META[PAGE] || PAGE_META.notfound; title = PAGE === 'index' ? t : `${U.t(t)} — ${profile.name}`; desc = d; }
  document.title = title;
  // location.origin is "null" on file:// — use the full href so the site also works opened from disk.
  const base = SITE.url || location.href.split('#')[0], url = base + (location.hash.startsWith('#/') && location.hash !== '#/' ? location.hash : '');
  const abs = u => { try{ return new URL(u, base).href; }catch(_){ return u; } };
  const set = (sel, attr, v) => { const el = $(sel); if(el) el.setAttribute(attr, v); };
  set('meta[name="description"]', 'content', desc);
  set('meta[property="og:title"]', 'content', title); set('meta[name="twitter:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', desc); set('meta[name="twitter:description"]', 'content', desc);
  set('meta[property="og:url"]', 'content', url);
  set('meta[property="og:image"]', 'content', abs(image)); set('meta[name="twitter:image"]', 'content', abs(image));
  set('link[rel="canonical"]', 'href', url);
}

function parseHash(){
  const h = (location.hash || '#/').replace(/^#\/?/, '');
  if(h.startsWith('work/')) return ['project', decodeURIComponent(h.slice(5))];
  return [h === '' ? 'index' : h, null];
}
let firstRoute = true;
function route(){
  [PAGE, SLUG] = parseHash();
  if(!R[PAGE]) PAGE = 'notfound';
  cleanups.splice(0).forEach(f => f());
  projectDir();
  R[PAGE]();
  $$('[data-route]').forEach(a => {
    const on = a.dataset.route === PAGE || (PAGE === 'project' && a.dataset.route === 'work');
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  setMeta();
  LB.prepare(); reveals();
  if(bindMenu.close) bindMenu.close();
  if(!firstRoute){
    scrollTo({top: 0});
    const h = $('#main h1'); if(h) h.focus({preventScroll: true});
    $('#announcer').textContent = document.title;
    const m = $('#main'); m.classList.remove('pg-in'); void m.offsetWidth; m.classList.add('pg-in');
  }
  firstRoute = false;
  bindScroll.update && bindScroll.update();
}
function navigate(){
  const m = $('#main');
  if(CALM || firstRoute){ route(); return; }
  m.classList.add('pg-out');
  setTimeout(() => { m.classList.remove('pg-out'); route(); }, 160);
}
addEventListener('hashchange', () => { if(location.hash === '' || location.hash.startsWith('#/')) navigate(); });

// Skip link: move focus without touching the hash (the hash is the router).
document.addEventListener('click', e => {
  const s = e.target.closest && e.target.closest('.skip'); if(!s) return;
  e.preventDefault(); const m = $('#main'); m.focus(); m.scrollIntoView();
});

/* ═══════════════════════════════════════════════════════════════════════
   INTRO — a short "bringing the hall online" sequence, shown once per
   session when a visitor lands on the home page. Skipped entirely for
   reduced motion and for deep links.
   ═══════════════════════════════════════════════════════════════════════ */
function rackDoor(side){
  let g = '';
  for(let r = 0; r < 4; r++){
    const x = side === 'l' ? 60 + r * 200 : 40 + r * 200, d = ((side === 'l' ? 3 - r : r) * .09 + .1).toFixed(2);
    g += `<g class="i-rk" style="--rd:${d}s"><rect class="i-rk-b" x="${x}" y="120" width="150" height="785" rx="6"/>`;
    for(let u = 0; u < 14; u++){ const y = 150 + u * 52;
      g += `<rect class="i-u" x="${x + 14}" y="${y}" width="122" height="40" rx="3"/><line class="i-vent" x1="${x + 26}" y1="${y + 20}" x2="${x + 86}" y2="${y + 20}"/>`;
      if((u + r) % 3 !== 1) g += `<circle class="i-led ${(u * 7 + r) % 5 ? 'g' : 'a'}" cx="${x + 118}" cy="${y + 20}" r="4" style="--d:${(0.4 + (u * 4 + r * 3) % 17 * .06).toFixed(2)}s;--p:${(1.4 + (u + r) % 4 * .5).toFixed(1)}s"/>`; }
    g += '</g>';
  }
  return `<svg class="i-racks" viewBox="0 0 900 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><line class="i-floor" x1="0" y1="905" x2="900" y2="905"/>${g}</svg>`;
}
function intro(){
  let seen = null; try{ seen = sessionStorage.getItem('intro'); sessionStorage.setItem('intro', '1'); }catch(_){}
  if(seen || CALM || PAGE !== 'index') return;
  document.body.insertAdjacentHTML('beforeend', `
  <div id="intro" class="intro" data-noi18n lang="en" dir="ltr">
    <div class="i-door i-l" aria-hidden="true">${rackDoor('l')}</div><div class="i-door i-r" aria-hidden="true">${rackDoor('r')}</div>
    <div class="i-core" aria-hidden="true">
      <svg class="i-logo" viewBox="0 0 128 109"><use href="#amMark"/></svg>
      <svg class="i-word" viewBox="0 0 1274 100"><use href="#amWord"/></svg>
      <p class="i-tag">Data center designer</p>
      <ul class="i-log">${[['POWER', 'UTILITY + UPS', 'OK'], ['COOLING', 'CRAH N+1', 'OK'], ['CONTAINMENT', 'COLD AISLE', 'SEALED'], ['RACKS', '16 / 16', 'ONLINE']].map(([k, v, b], i) =>
        `<li style="--i:${i}"><span class="k">${k}</span><span class="dots"></span><span class="v">${v}</span><b>${b}</b></li>`).join('')}</ul>
      <div class="i-prog"><span>Bringing the hall online</span><span class="i-pc num"><span id="iPct">0</span>%</span><i><b></b></i></div>
    </div>
    <button class="i-skip" type="button">Enter ${I.arrow}</button>
  </div>`);
  const w = $('#intro'), pct = $('#iPct'), t0 = performance.now() + 700, dur = 1500;
  document.documentElement.classList.add('locked');
  (function tick(now){ if(!w.isConnected) return; const k = Math.max(0, Math.min(1, (now - t0) / dur));
    pct.textContent = Math.round((k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) * 100); if(k < 1) requestAnimationFrame(tick); })(performance.now());
  let gone = false;
  const bye = () => { if(gone) return; gone = true; pct.textContent = '100'; w.classList.add('done');
    removeEventListener('keydown', key);
    setTimeout(() => { w.classList.add('open'); document.documentElement.classList.remove('locked'); document.body.classList.add('intro-in'); }, 180);
    setTimeout(() => { w.remove(); setTimeout(() => document.body.classList.remove('intro-in'), 1200); }, 1150); };
  const key = e => { if(e.key === 'Escape' || e.key === 'Enter') bye(); };
  addEventListener('keydown', key);
  $('.i-skip', w).addEventListener('click', bye);
  setTimeout(bye, 2700);
}

/* ═══════════════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════════════ */
async function boot(){
  renderChrome();
  if(LANG === 'fa'){ try{ await loadFA(); }catch(_){ LANG = 'en'; } }
  applyLangAttrs();
  if(LANG === 'fa'){ i18nObserve(); i18nNode(document.body); }
  [PAGE] = parseHash();
  intro();
  route();
  if(FINE && !CALM) pointerEffects();
}

/* Fine pointers only: specular spot on glass, a gentle 3D tilt on cards,
   magnetic primary buttons and the lit grid in the hero. */
function pointerEffects(){
  let tilt = null, magnet = null, raf = 0, ev = null;
  const reset = (el, props) => el && props.forEach(p => el.style.removeProperty(p));
  const frame = () => { raf = 0; const e = ev, t = e.target; if(!t.closest) return;
    const glass = t.closest('.card,.plat,.tile,.obj,.feat-i,.sys-aside,.pr-card,.act,.req,.stats,.cta-panel,.next-card,.dcs-panel,.btn-ghost,.icon-btn,.pill');
    if(glass){ const r = glass.getBoundingClientRect(); glass.style.setProperty('--mx', (e.clientX - r.left) + 'px'); glass.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    const c = t.closest('.card,.plat,.obj,.feat-i');
    if(c !== tilt){ reset(tilt, ['--rx', '--ry']); tilt = c; }
    if(c){ const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      c.style.setProperty('--rx', (-py * 5).toFixed(2) + 'deg'); c.style.setProperty('--ry', (px * 6).toFixed(2) + 'deg'); }
    const m = t.closest('.btn-primary,.btn-accent');
    if(m !== magnet){ reset(magnet, ['--tx', '--ty']); magnet = m; }
    if(m){ const r = m.getBoundingClientRect();
      m.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px'); m.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px'); }
    const hero = t.closest('.hero');
    $$('.hero').forEach(h => { if(h !== hero) h.classList.remove('lit'); });
    if(hero){ const r = hero.getBoundingClientRect(); hero.style.setProperty('--hx', (e.clientX - r.left) + 'px'); hero.style.setProperty('--hy', (e.clientY - r.top) + 'px'); hero.classList.add('lit'); }
  };
  document.addEventListener('pointermove', e => { ev = e; if(!raf) raf = requestAnimationFrame(frame); }, {passive: true});
  document.addEventListener('pointerleave', () => { reset(tilt, ['--rx', '--ry']); reset(magnet, ['--tx', '--ty']); tilt = magnet = null; $$('.hero').forEach(h => h.classList.remove('lit')); });
}
boot();
})();
