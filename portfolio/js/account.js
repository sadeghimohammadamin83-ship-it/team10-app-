/* ═══════════════════════════════════════════════════════════════════════
   Account page (#/account) and admin panel.
   · Visitors: create an account with a Gmail address and a password they
     choose (no codes), sign in, see their project requests.
   · Admin (ADMIN_EMAIL): registered users, incoming requests, and an editor
     for every piece of site content, published to all visitors.
   Rendered by app.js through AccountUI.render(ctx); ctx carries app helpers.
   ═══════════════════════════════════════════════════════════════════════ */
window.AccountUI = (() => {
  let C;                         // app context (helpers), set on render
  let tab = 'profile';           // admin tab
  const t = s => C.t(s);

  function render(ctx){
    C = ctx;
    const main = C.$('#main');
    main.innerHTML = `
    <section class="container acct">
      <header class="acct-head">
        <p class="label rv">Account</p>
        <h1 class="h1 rv" tabindex="-1" id="acctTitle">Your account</h1>
      </header>
      <div id="acctBody" class="acct-body" aria-live="polite"><div class="acct-loading"><span class="spinner" aria-hidden="true"></span><span>Loading…</span></div></div>
    </section>`;
    if(!Cloud.enabled){ notConfigured(); return; }
    Cloud.currentUser().then(u => u ? signedIn(u) : signedOut('in')).catch(e => showError(e));
    const off = Cloud.onChange(u => { if(!C.$('#acctBody')) { off(); return; } u ? signedIn(u) : signedOut('in'); });
    C.onCleanup(off);
  }

  const body = () => C.$('#acctBody');
  function setTitle(s){ const h = C.$('#acctTitle'); if(h) h.textContent = t(s); }

  function notConfigured(){
    setTitle('Accounts are coming soon');
    body().innerHTML = `<div class="acct-card rv in"><p class="lede muted">Accounts are not switched on yet. Until then, you can send a project request from the contact page — no account needed.</p>
      <div class="acct-actions"><a class="btn btn-primary" href="#/contact">Send a project request ${C.I.arrow}</a></div></div>`;
  }
  function showError(e){
    body().innerHTML = `<div class="acct-card"><p class="form-err" role="alert">${C.esc(t(Cloud.message(e)))}</p>
      <div class="acct-actions"><button type="button" class="btn btn-ghost" data-retry>Try again</button></div></div>`;
    body().querySelector('[data-retry]').onclick = () => C.rerender();
  }

  /* ── Signed out: sign in / create account ─────────────────────────── */
  const GMAIL = /^[a-z0-9._%+-]+@(gmail|googlemail)\.com$/i;
  function signedOut(mode){
    setTitle(mode === 'up' ? 'Create your account' : 'Sign in');
    body().innerHTML = `
      <div class="acct-card auth">
        <div class="seg" role="tablist" aria-label="Account">
          <button type="button" role="tab" aria-selected="${mode === 'in'}" data-mode="in">Sign in</button>
          <button type="button" role="tab" aria-selected="${mode === 'up'}" data-mode="up">Create account</button>
        </div>
        <form id="authForm" novalidate>
          ${mode === 'up' ? field('a-name', 'Full name', 'text', 'name') : ''}
          ${field('a-email', 'Gmail address', 'email', 'email', 'you@gmail.com')}
          ${field('a-pass', 'Password', 'password', mode === 'up' ? 'new-password' : 'current-password')}
          ${mode === 'up' ? field('a-pass2', 'Repeat password', 'password', 'new-password') : ''}
          <p class="form-err" id="authErr" role="alert" hidden></p>
          <button class="btn btn-accent auth-go" type="submit">${mode === 'up' ? 'Create account' : 'Sign in'} ${C.I.arrow}</button>
          ${mode === 'in' ? `<button type="button" class="link-btn" data-forgot>Forgot your password?</button>`
            : `<p class="small muted">Use your Gmail address and a password you choose — at least 8 characters. No code is sent.</p>`}
        </form>
      </div>`;
    const b = body();
    b.querySelectorAll('[data-mode]').forEach(x => x.onclick = () => signedOut(x.dataset.mode));
    b.querySelectorAll('.pw-toggle').forEach(x => x.onclick = () => { const i = C.$('#' + x.dataset.for);
      const show = i.type === 'password'; i.type = show ? 'text' : 'password'; x.setAttribute('aria-pressed', String(show)); x.setAttribute('aria-label', t(show ? 'Hide password' : 'Show password')); });
    const err = m => { const p = C.$('#authErr'); p.textContent = t(m); p.hidden = !m; };
    const forgot = b.querySelector('[data-forgot]');
    if(forgot) forgot.onclick = async () => {
      const email = C.$('#a-email').value.trim();
      if(!GMAIL.test(email)){ err('Enter your Gmail address first, then press “Forgot your password?” again.'); C.$('#a-email').focus(); return; }
      try{ await Cloud.resetPassword(email); err(''); C.toast('Password reset email sent — check your Gmail inbox.'); }
      catch(e){ err(Cloud.message(e)); }
    };
    C.$('#authForm').onsubmit = async e => {
      e.preventDefault(); err('');
      const v = id => (C.$('#' + id) || {}).value || '';
      const name = v('a-name').trim(), email = v('a-email').trim().toLowerCase(), pw = v('a-pass'), pw2 = v('a-pass2');
      let bad = null;
      if(mode === 'up' && name.length < 2) bad = ['a-name', 'Please enter your name.'];
      else if(!GMAIL.test(email)) bad = ['a-email', 'Please use a Gmail address (name@gmail.com).'];
      else if(pw.length < 8) bad = ['a-pass', 'Choose a password of at least 8 characters.'];
      else if(mode === 'up' && pw !== pw2) bad = ['a-pass2', 'The two passwords do not match.'];
      if(bad){ err(bad[1]); C.$('#' + bad[0]).focus(); return; }
      const go = b.querySelector('.auth-go'); go.disabled = true; go.classList.add('busy');
      try{ mode === 'up' ? await Cloud.signUp(name, email, pw) : await Cloud.signIn(email, pw); }
      catch(ex){ err(Cloud.message(ex)); go.disabled = false; go.classList.remove('busy'); }
    };
  }
  function field(id, label, type, auto, ph = ''){
    const pw = type === 'password';
    return `<div class="field"><label for="${id}">${label}</label>
      <div class="inp-wrap"><input class="inp" id="${id}" type="${type}" autocomplete="${auto}"${ph ? ` placeholder="${ph}"` : ''}${type === 'email' ? ' dir="ltr" inputmode="email" autocapitalize="off" spellcheck="false"' : ''}${pw ? ' dir="ltr"' : ''} required>
      ${pw ? `<button type="button" class="pw-toggle" data-for="${id}" aria-label="Show password" aria-pressed="false">${C.I.eye}</button>` : ''}</div></div>`;
  }

  /* ── Signed in ────────────────────────────────────────────────────── */
  const fmtDate = d => d ? d.toLocaleDateString(C.lang() === 'fa' ? 'fa-IR' : 'en-GB', {year: 'numeric', month: 'short', day: 'numeric'}) : '—';
  const STATUS = {new: 'New', progress: 'In progress', done: 'Done'};

  function signedIn(u){
    const admin = Cloud.isAdmin(u);
    setTitle(admin ? 'Admin' : 'Your account');
    const tabs = admin ? [['profile', 'Profile'], ['users', 'Users'], ['requests', 'Requests'], ['editor', 'Edit site']] : [];
    if(!admin) tab = 'profile';
    body().innerHTML = `
      ${admin ? `<div class="seg seg-wide" role="tablist" aria-label="Admin">${tabs.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${tab === k}">${l}</button>`).join('')}</div>` : ''}
      <div id="acctPane"></div>`;
    body().querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab;
      body().querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b))); pane(u); });
    pane(u);
  }
  function pane(u){
    const p = C.$('#acctPane');
    ({profile, users, requests, editor})[tab](p, u);
  }

  function profile(p, u){
    const name = u.displayName || u.email.split('@')[0];
    p.innerHTML = `
      <div class="acct-grid">
        <div class="acct-card">
          <div class="me"><span class="avatar" aria-hidden="true">${C.esc(name.trim().charAt(0).toUpperCase())}</span>
            <div><p class="me-name">${C.esc(name)}</p><p class="small muted" dir="ltr">${C.esc(u.email)}</p>
            ${Cloud.isAdmin(u) ? `<span class="badge">Admin</span>` : ''}</div></div>
          <dl class="spec">
            <div><dt>Member since</dt><dd>${fmtDate(u.metadata && u.metadata.creationTime ? new Date(u.metadata.creationTime) : null)}</dd></div>
          </dl>
          <form id="nameForm" class="inline-form" novalidate>
            <div class="field"><label for="p-name">Display name</label><input class="inp" id="p-name" value="${C.esc(name)}" autocomplete="name"></div>
            <button class="btn btn-ghost btn-sm" type="submit">Save name</button>
          </form>
          <div class="acct-actions"><button type="button" class="btn btn-ghost" data-signout>Sign out</button></div>
        </div>
        <div class="acct-card">
          <div class="card-h"><h2 class="h3">My project requests</h2><a class="btn btn-accent btn-sm" href="#/contact">New request ${C.I.arrow}</a></div>
          <div id="myReq"><div class="acct-loading"><span class="spinner" aria-hidden="true"></span></div></div>
        </div>
      </div>`;
    p.querySelector('[data-signout]').onclick = async () => { await Cloud.signOut(); C.toast('Signed out.'); };
    C.$('#nameForm').onsubmit = async e => { e.preventDefault(); const n = C.$('#p-name').value.trim(); if(n.length < 2) return;
      try{ await Cloud.updateName(n); C.toast('Saved.'); }catch(ex){ C.toast(Cloud.message(ex)); } };
    Cloud.myRequests().then(list => {
      const box = C.$('#myReq'); if(!box) return;
      box.innerHTML = list.length ? `<ul class="req-list">${list.map(r => `<li><div><p class="req-t">${C.esc(t(r.type || ''))}</p>
          <p class="small muted">${fmtDate(Cloud.toDate(r.createdAt))} · ${C.esc(t(r.time || ''))}</p></div>
          <span class="status s-${C.esc(r.status || 'new')}">${t(STATUS[r.status] || 'New')}</span></li>`).join('')}</ul>`
        : `<p class="muted small">No requests yet.</p>`;
    }).catch(e => { const box = C.$('#myReq'); if(box) box.innerHTML = `<p class="form-err">${C.esc(t(Cloud.message(e)))}</p>`; });
  }

  async function users(p){
    p.innerHTML = `<div class="acct-card"><div class="acct-loading"><span class="spinner" aria-hidden="true"></span></div></div>`;
    try{
      const [list, reqs] = await Promise.all([Cloud.listUsers(), Cloud.allRequests().catch(() => [])]);
      const count = {}; reqs.forEach(r => { if(r.uid) count[r.uid] = (count[r.uid] || 0) + 1; });
      p.innerHTML = `<div class="acct-card"><div class="card-h"><h2 class="h3">Registered users</h2><span class="badge">${list.length}</span></div>
        ${list.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Gmail</th><th>Joined</th><th>Requests</th></tr></thead><tbody>
        ${list.map(x => `<tr><td>${C.esc(x.name || '—')}</td><td dir="ltr">${C.esc(x.email || '')}</td><td>${fmtDate(Cloud.toDate(x.createdAt))}</td><td class="num">${count[x.id] || 0}</td></tr>`).join('')}
        </tbody></table></div>` : `<p class="muted small">No one has created an account yet.</p>`}</div>`;
    }catch(e){ p.innerHTML = `<div class="acct-card"><p class="form-err">${C.esc(t(Cloud.message(e)))}</p></div>`; }
  }

  async function requests(p){
    p.innerHTML = `<div class="acct-card"><div class="acct-loading"><span class="spinner" aria-hidden="true"></span></div></div>`;
    let list = [], filter = 'all';
    try{ list = await Cloud.allRequests(); }catch(e){ p.innerHTML = `<div class="acct-card"><p class="form-err">${C.esc(t(Cloud.message(e)))}</p></div>`; return; }
    const draw = () => {
      const L = list.filter(r => filter === 'all' || (r.status || 'new') === filter);
      p.innerHTML = `<div class="acct-card"><div class="card-h"><h2 class="h3">Project requests</h2>
        <div class="chips" role="group" aria-label="Filter">${[['all', 'All'], ['new', 'New'], ['progress', 'In progress'], ['done', 'Done']].map(([k, l]) =>
          `<button type="button" class="chip" data-f="${k}" aria-pressed="${filter === k}">${l} <span class="num">${k === 'all' ? list.length : list.filter(r => (r.status || 'new') === k).length}</span></button>`).join('')}</div></div>
        ${L.length ? `<ul class="rq-admin">${L.map(r => `
          <li class="rq-item" data-id="${C.esc(r.id)}">
            <div class="rq-top"><div><p class="req-t">${C.esc(r.name || '—')}</p><p class="small muted">${fmtDate(Cloud.toDate(r.createdAt))} · ${C.esc(r.type || '')} · ${C.esc(r.time || '')}</p></div>
              <select class="inp inp-sm" data-status aria-label="Status">${Object.entries(STATUS).map(([k, l]) => `<option value="${k}"${(r.status || 'new') === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
            <p class="rq-msg">${C.esc(r.msg || '')}</p>
            <dl class="rq-meta">
              ${r.phone ? `<div><dt>Phone</dt><dd dir="ltr"><a class="ul" href="tel:${C.esc(r.phone)}">${C.esc(r.phone)}</a></dd></div>` : ''}
              ${r.email ? `<div><dt>Gmail</dt><dd dir="ltr"><a class="ul" href="mailto:${C.esc(r.email)}">${C.esc(r.email)}</a></dd></div>` : ''}
              ${r.via ? `<div><dt>Reply by</dt><dd>${C.esc(r.via)}</dd></div>` : ''}
              ${r.link ? `<div><dt>Link</dt><dd dir="ltr"><a class="ul" href="${C.esc(r.link)}" target="_blank" rel="noopener noreferrer">${C.esc(r.link)}</a></dd></div>` : ''}
            </dl>
            <div class="acct-actions"><button type="button" class="btn btn-ghost btn-sm danger" data-del>Delete</button></div>
          </li>`).join('')}</ul>` : `<p class="muted small">Nothing here.</p>`}</div>`;
      p.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; draw(); });
      p.querySelectorAll('.rq-item').forEach(li => {
        const id = li.dataset.id, r = list.find(x => x.id === id);
        li.querySelector('[data-status]').onchange = async e => { const s = e.target.value;
          try{ await Cloud.setRequestStatus(id, s); r.status = s; C.toast('Saved.'); draw(); }catch(ex){ C.toast(Cloud.message(ex)); } };
        li.querySelector('[data-del]').onclick = async () => { if(!confirm(t('Delete this request? This cannot be undone.'))) return;
          try{ await Cloud.deleteRequest(id); list = list.filter(x => x.id !== id); draw(); }catch(ex){ C.toast(Cloud.message(ex)); } };
      });
    };
    draw();
  }

  /* ═══════════════════════════ Site editor ═══════════════════════════
     A structured editor over the whole content registry (js/data.js).
     Draft is kept in localStorage until published. */
  const SECTIONS = [
    ['profile', 'Profile & about'], ['SITE', 'Site title & search'], ['SPECIALTIES', 'Hero specialties'], ['home', 'Home page sections'],
    ['projects', 'Projects'], ['FEATURED', 'Featured projects (home)'], ['HOME_PICKS', 'Selected projects (home)'],
    ['objects', '3D objects'], ['OBJECT_TYPES', 'Object types'], ['DC_SYSTEMS', 'Data center systems'],
    ['services', 'Services'], ['processPhases', 'Process'], ['skillGroups', 'Skills'], ['experience', 'Experience'],
    ['freelanceNote', 'Freelance note'], ['CONTACT', 'Contact details'], ['REQ_TYPES', 'Request form: project types'],
    ['REQ_TIMES', 'Request form: timelines'], ['CATEGORIES', 'Categories'], ['NAV', 'Navigation'], ['fa', 'Persian translations']
  ];
  const SCENE_KEYS = ['tr', 'gen', 'ups', 'bat', 'pdu', 'rk', 'ca', 'cr'];
  const IMAGE_KEYS = new Set(['src', 'img', 'thumb', 'image']);
  const DRAFT_KEY = 'editor-draft';
  let draft = null, section = 'profile', faSearch = '';

  const clone = o => JSON.parse(JSON.stringify(o));
  const live = () => ({...C.getContent(), fa: clone(C.faOverrides())});
  function saveDraft(){ try{ localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }catch(_){} status(); }
  const dirty = () => JSON.stringify(draft) !== JSON.stringify(live());

  function editor(p){
    if(!draft){ try{ draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); }catch(_){ draft = null; } }
    if(!draft) draft = live();
    p.innerHTML = `
      <div class="ed">
        <div class="ed-bar acct-card">
          <p class="ed-status small" id="edStatus"></p>
          <div class="ed-btns">
            <button type="button" class="btn btn-ghost btn-sm" data-ed="preview">Preview on site</button>
            <button type="button" class="btn btn-accent btn-sm" data-ed="publish">Publish ${C.I.arrow}</button>
            <details class="ed-more"><summary class="btn btn-ghost btn-sm">More</summary>
              <div class="ed-menu">
                <button type="button" data-ed="discard">Discard unpublished changes</button>
                <button type="button" data-ed="previous">Load the previously published version</button>
                <button type="button" data-ed="reset">Start from the original content</button>
              </div></details>
          </div>
        </div>
        <div class="ed-errors" id="edErrors" role="alert" hidden></div>
        <div class="ed-layout">
          <nav class="ed-nav" aria-label="Sections">
            <label class="sr-only" for="edSel">Section</label>
            <select class="inp ed-sel" id="edSel">${SECTIONS.map(([k, l]) => `<option value="${k}"${k === section ? ' selected' : ''}>${l}</option>`).join('')}</select>
            <ul>${SECTIONS.map(([k, l]) => `<li><button type="button" data-sec="${k}" aria-current="${k === section}">${l}</button></li>`).join('')}</ul>
          </nav>
          <div class="ed-main acct-card" id="edMain"></div>
        </div>
      </div>`;
    p.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => go(b.dataset.sec));
    C.$('#edSel').onchange = e => go(e.target.value);
    p.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => action(b.dataset.ed, b));
    drawSection(); status();
  }
  function go(k){
    section = k; C.$$('[data-sec]').forEach(b => b.setAttribute('aria-current', String(b.dataset.sec === k)));
    const sel = C.$('#edSel'); if(sel) sel.value = k; drawSection();
    const m = C.$('#edMain'); if(m && m.getBoundingClientRect().top < 0) m.scrollIntoView({block: 'start'});
  }
  function status(){ const s = C.$('#edStatus'); if(!s) return;
    const d = dirty(); s.textContent = t(d ? 'Unpublished changes — visitors still see the published version.' : 'Everything is published.');
    s.classList.toggle('is-dirty', d); }

  async function action(a, btn){
    if(a === 'preview'){
      const errs = validate(); if(errs.length) return showErrors(errs);
      C.preview(draft); return;
    }
    if(a === 'publish'){
      const errs = validate(); if(errs.length) return showErrors(errs);
      btn.disabled = true; btn.classList.add('busy');
      try{ await Cloud.publish(stripFa(draft)); C.applyPublished(draft); try{ localStorage.removeItem(DRAFT_KEY); }catch(_){}
        C.toast('Published — every visitor now sees these changes.'); showErrors([]); }
      catch(e){ C.toast(Cloud.message(e)); }
      finally{ btn.disabled = false; btn.classList.remove('busy'); status(); }
      return;
    }
    btn.closest('details') && btn.closest('details').removeAttribute('open');
    if(a === 'discard'){ if(!confirm(t('Discard all unpublished changes?'))) return; draft = live(); }
    if(a === 'reset'){ if(!confirm(t('Replace the draft with the original built-in content? Nothing changes for visitors until you publish.'))) return; draft = {...clone(C.defaults()), fa: {}}; }
    if(a === 'previous'){
      try{ const prev = await Cloud.previousContent(); if(!prev){ C.toast('There is no earlier published version.'); return; } draft = {...clone(C.defaults()), fa: {}, ...prev}; }
      catch(e){ C.toast(Cloud.message(e)); return; }
    }
    saveDraft(); drawSection();
  }
  const stripFa = d => { const o = clone(d); if(o.fa && !Object.keys(o.fa).length) delete o.fa; return o; };

  function validate(){
    const e = [], P = draft.projects || [];
    const slugs = new Set();
    P.forEach((p, i) => {
      const n = `${t('Projects')} ${i + 1}`;
      if(!p || typeof p !== 'object') { e.push([`${n}: ${t('is empty.')}`, 'projects']); return; }
      if(!String(p.title || '').trim()) e.push([`${n}: ${t('needs a title.')}`, 'projects']);
      if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || '')) e.push([`${n}: ${t('address (slug) may use only lowercase letters, numbers and dashes.')}`, 'projects']);
      else if(slugs.has(p.slug)) e.push([`${n}: ${t('address (slug) is used twice.')}`, 'projects']);
      slugs.add(p.slug);
      if(p.proposal && !(+p.proposal.pages >= 0)) e.push([`${n}: ${t('proposal page count must be a number.')}`, 'projects']);
    });
    (draft.FEATURED || []).forEach((f, i) => { if(!slugs.has(f.slug)) e.push([`${t('Featured projects (home)')} ${i + 1}: ${t('points to a project that does not exist.')}`, 'FEATURED']); });
    (draft.HOME_PICKS || []).forEach((s, i) => { if(!slugs.has(s)) e.push([`${t('Selected projects (home)')} ${i + 1}: ${t('points to a project that does not exist.')}`, 'HOME_PICKS']); });
    const ks = new Set();
    (draft.DC_SYSTEMS || []).forEach((s, i) => {
      if(!SCENE_KEYS.includes(s.k)) e.push([`${t('Data center systems')} ${i + 1}: ${t('key must be one of')} ${SCENE_KEYS.join(', ')}.`, 'DC_SYSTEMS']);
      else if(ks.has(s.k)) e.push([`${t('Data center systems')} ${i + 1}: ${t('key is used twice.')}`, 'DC_SYSTEMS']);
      ks.add(s.k);
      if(!Array.isArray(s.sp) || !s.sp.length) e.push([`${t('Data center systems')} ${i + 1}: ${t('needs at least one specification row.')}`, 'DC_SYSTEMS']);
    });
    if(!String((draft.profile || {}).name || '').trim()) e.push([t('Profile needs a name.'), 'profile']);
    if(!Array.isArray((draft.profile || {}).about)) e.push([t('Profile “about” must be a list of paragraphs.'), 'profile']);
    return e;
  }
  function showErrors(errs){
    const box = C.$('#edErrors'); if(!box) return;
    box.hidden = !errs.length;
    box.innerHTML = errs.length ? `<p><b>${t('Fix these before publishing:')}</b></p><ul>${errs.map(([m, s]) => `<li><button type="button" class="link-btn" data-go="${s}">${C.esc(m)}</button></li>`).join('')}</ul>` : '';
    box.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
    if(errs.length) box.scrollIntoView({block: 'nearest'});
  }

  /* ── generic value editor ── */
  const LABELS = {slug: 'Address (slug)', kicker: 'Subtitle', r: 'Aspect ratio (width ÷ height)', aspect: 'Shape: wide · plan · board · portrait',
    deliver: 'Deliverables', groups: 'Gallery sections', facts: 'Key facts', sp: 'Specifications', t: 'Description', n: 'Name', k: 'Scene key',
    obj: '3D model', file: '3D model', pal: 'Palette colours', rows: 'Sheet rows', heroSub: 'Hero introduction', heroLine: 'Hero line', about: 'About paragraphs',
    aboutLead: 'About headline', src: 'Image', img: 'Image', thumb: 'Small image', pos: 'Image focus (x% y%)', tab: 'Tab label', ruler: 'Ruler text',
    palName: 'Palette note', sheet: 'Sheet title', tgHref: 'Telegram link', phoneHref: 'Phone link', tg: 'Telegram', ogImage: 'Social image', url: 'Website address'};
  const human = k => /^\d+$/.test(k) ? `#${+k + 1}` : t(LABELS[k] || String(k).replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase()));
  const isImageField = (key, v) => typeof v === 'string' && (IMAGE_KEYS.has(key) || /\.(webp|png|jpe?g)$/i.test(v) || v.startsWith('media:'));
  const blankLike = v => Array.isArray(v) ? [] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)])) : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : '';
  const itemTitle = (v, i) => { if(v && typeof v === 'object' && !Array.isArray(v)) { const s = v.title || v.name || v.n || v.label || v.slug || v.tab || v.org || Object.values(v).find(x => typeof x === 'string'); return `${i + 1}. ${s || ''}`; }
    return `${i + 1}. ${Array.isArray(v) ? v.filter(x => typeof x === 'string').join(' · ') : String(v)}`; };
  const getAt = path => path.reduce((o, k) => o == null ? o : o[k], draft);
  function setAt(path, val){ const parent = getAt(path.slice(0, -1)); parent[path[path.length - 1]] = val; saveDraft(); }

  function drawSection(){
    const m = C.$('#edMain'); if(!m) return;
    const label = (SECTIONS.find(s => s[0] === section) || [, section])[1];
    if(section === 'fa') { drawFa(m, label); return; }
    const v = draft[section];
    m.innerHTML = `<h2 class="h3 ed-h">${label}</h2>${hint(section)}<div class="ed-tree">${node([section], v, section, null)}</div>`;
    bindTree(m);
  }
  function hint(k){
    const H = {
      projects: 'Each project becomes a case study at #/work/<slug>. Images can be chosen from the library or uploaded. Empty fields are simply not shown.',
      DC_SYSTEMS: 'The key (k) links each entry to its drawing in the hall: tr, gen, ups, bat, pdu, rk, ca, cr.',
      FEATURED: 'Each entry must use the slug of an existing project.', HOME_PICKS: 'Project slugs shown as cards on the home page.',
      NAV: 'Routes: work, objects, about, services, process, contact, account.'
    };
    return H[k] ? `<p class="small muted ed-hint">${t(H[k])}</p>` : '';
  }
  function node(path, v, key, siblings){
    const P = C.esc(JSON.stringify(path));
    if(Array.isArray(v)){
      const tuple = v.length && v.every(x => Array.isArray(x) && x.every(y => typeof y !== 'object'));
      const prim = v.every(x => x === null || typeof x !== 'object');
      const items = v.map((x, i) => {
        const ip = path.concat(i), ctrls = `<span class="ed-ctrl">
          <button type="button" class="ed-ic" data-act="up" data-path="${C.esc(JSON.stringify(ip))}" aria-label="${t('Move up')}" title="${t('Move up')}"${i === 0 ? ' disabled' : ''}>↑</button>
          <button type="button" class="ed-ic" data-act="down" data-path="${C.esc(JSON.stringify(ip))}" aria-label="${t('Move down')}" title="${t('Move down')}"${i === v.length - 1 ? ' disabled' : ''}>↓</button>
          <button type="button" class="ed-ic" data-act="dup" data-path="${C.esc(JSON.stringify(ip))}" aria-label="${t('Duplicate')}" title="${t('Duplicate')}">⧉</button>
          <button type="button" class="ed-ic danger" data-act="del" data-path="${C.esc(JSON.stringify(ip))}" aria-label="${t('Delete')}" title="${t('Delete')}">×</button></span>`;
        if(prim) return `<div class="ed-row">${leaf(ip, x, key)}${ctrls}</div>`;
        if(tuple) return `<div class="ed-row ed-tuple">${x.map((y, j) => leaf(ip.concat(j), y, '')).join('')}${ctrls}</div>`;
        return `<details class="ed-item"${v.length <= 2 ? ' open' : ''}><summary><span class="ed-sum">${C.esc(itemTitle(x, i))}</span>${ctrls}</summary>${node(ip, x, String(i), v)}</details>`;
      }).join('');
      return `<div class="ed-list">${items || `<p class="small muted">${t('Empty list.')}</p>`}
        <button type="button" class="btn btn-ghost btn-sm ed-add" data-act="add" data-path="${P}">+ ${t('Add')}</button></div>`;
    }
    if(v && typeof v === 'object'){
      const keys = Object.keys(v);
      const union = siblings ? [...new Set(siblings.flatMap(s => s && typeof s === 'object' && !Array.isArray(s) ? Object.keys(s) : []))].filter(k => !keys.includes(k)) : [];
      return `<div class="ed-obj">${keys.map(k => {
          const cp = path.concat(k), cv = v[k], complex = cv && typeof cv === 'object';
          return `<div class="ed-field${complex ? ' ed-complex' : ''}"><div class="ed-lab"><span>${C.esc(human(k))}</span>
            <button type="button" class="ed-ic danger" data-act="rmkey" data-path="${C.esc(JSON.stringify(cp))}" aria-label="${t('Remove field')} ${C.esc(human(k))}" title="${t('Remove field')}">×</button></div>
            ${complex ? node(cp, cv, k, null) : leaf(cp, cv, k)}</div>`;
        }).join('')}
        ${union.length ? `<div class="ed-addkeys"><span class="small muted">${t('Add field:')}</span>${union.map(k => `<button type="button" class="chip" data-act="addkey" data-key="${C.esc(k)}" data-path="${P}">+ ${C.esc(human(k))}</button>`).join('')}</div>` : ''}
      </div>`;
    }
    return leaf(path, v, key);
  }
  function leaf(path, v, key){
    const P = C.esc(JSON.stringify(path)), id = 'f' + Math.random().toString(36).slice(2, 9);
    if(typeof v === 'boolean') return `<label class="ed-check"><input type="checkbox" data-path="${P}" data-type="bool"${v ? ' checked' : ''}> ${t('Yes')}</label>`;
    if(typeof v === 'number') return `<input class="inp" type="number" step="any" data-path="${P}" data-type="num" value="${v}" aria-label="${C.esc(human(key))}">`;
    const s = v == null ? '' : String(v);
    if(isImageField(key, s)) return `<div class="ed-img"><span class="ed-thumb">${C.img(s, {sizes: '96px'}) || '<i>—</i>'}</span>
      <input class="inp" data-path="${P}" data-type="str" value="${C.esc(s)}" dir="ltr" aria-label="${C.esc(human(key))}">
      <button type="button" class="btn btn-ghost btn-sm" data-act="pick" data-path="${P}">${t('Choose image')}</button></div>`;
    if(s.length > 70 || s.includes('\n')) return `<textarea class="inp" rows="${Math.min(10, Math.ceil(s.length / 70) + 1)}" data-path="${P}" data-type="str" id="${id}" aria-label="${C.esc(human(key))}" dir="auto">${C.esc(s)}</textarea>`;
    return `<input class="inp" data-path="${P}" data-type="str" value="${C.esc(s)}" id="${id}" aria-label="${C.esc(human(key))}" dir="auto">`;
  }
  function bindTree(root){
    if(root._edBound) return;      // #edMain persists across sections: listen once
    root._edBound = true;
    root.addEventListener('input', e => {
      const el = e.target, path = el.dataset && el.dataset.path; if(!path) return;
      const pth = JSON.parse(path), type = el.dataset.type;
      if(type === 'num'){ const n = parseFloat(el.value); if(!isNaN(n)) setAt(pth, n); }
      else if(type === 'bool') setAt(pth, el.checked);
      else { setAt(pth, el.value); if(el.closest('.ed-img')){ const th = el.closest('.ed-img').querySelector('.ed-thumb'); th.innerHTML = C.img(el.value, {sizes: '96px'}) || '<i>—</i>'; } }
      const sum = el.closest('details') && el.closest('details').querySelector(':scope > summary .ed-sum');
      if(sum){ const d = el.closest('details'), ip = JSON.parse(d.querySelector(':scope > summary [data-act="del"]').dataset.path);
        sum.textContent = itemTitle(getAt(ip), ip[ip.length - 1]); }
    });
    root.addEventListener('change', e => { if(e.target.dataset && e.target.dataset.type === 'bool') setAt(JSON.parse(e.target.dataset.path), e.target.checked); });
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if(!b) return;
      e.preventDefault();
      const path = JSON.parse(b.dataset.path), a = b.dataset.act;
      if(a === 'pick'){ picker(v => { setAt(path, v); redraw(root); }); return; }
      if(a === 'add'){ const arr = getAt(path); arr.push(arr.length ? blankLike(arr[arr.length - 1]) : ''); }
      else if(a === 'addkey'){ const obj = getAt(path), k = b.dataset.key, parentArr = getAt(path.slice(0, -1));
        const sample = Array.isArray(parentArr) ? parentArr.find(x => x && typeof x === 'object' && k in x) : null; obj[k] = sample ? blankLike(sample[k]) : ''; }
      else if(a === 'rmkey'){ if(!confirm(t('Remove this field?'))) return; const obj = getAt(path.slice(0, -1)); delete obj[path[path.length - 1]]; }
      else {
        const arr = getAt(path.slice(0, -1)), i = path[path.length - 1];
        if(a === 'del'){ if(!confirm(t('Delete this item?'))) return; arr.splice(i, 1); }
        if(a === 'dup') arr.splice(i + 1, 0, clone(arr[i]));
        if(a === 'up' && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        if(a === 'down' && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      }
      saveDraft(); redraw(root);
    });
  }
  // Re-render the section but keep the cards that were open, open.
  function redraw(root){
    const open = [...root.querySelectorAll('details[open] > summary [data-act="del"]')].map(x => x.dataset.path);
    drawSection();
    open.forEach(pth => { const s = C.$(`#edMain [data-act="del"][data-path='${pth.replace(/'/g, "\\'")}']`); s && s.closest('details') && s.closest('details').setAttribute('open', ''); });
  }

  /* Persian translations: English text → Persian text, on top of the built-in dictionary. */
  async function drawFa(m, label){
    m.innerHTML = `<h2 class="h3 ed-h">${label}</h2><div class="acct-loading"><span class="spinner" aria-hidden="true"></span></div>`;
    try{ await C.loadFA(); }catch(_){}
    const base = window.FA_BASE || {};
    draft.fa = draft.fa || {};
    const all = {...base, ...draft.fa};
    const q = faSearch.trim().toLowerCase();
    const keys = Object.keys(all).filter(k => !q || k.toLowerCase().includes(q) || String(all[k]).includes(faSearch.trim())).slice(0, 60);
    m.innerHTML = `<h2 class="h3 ed-h">${label}</h2>
      <p class="small muted ed-hint">${t('The site is written in English; this list gives the Persian shown in FA mode. When you change an English text elsewhere, add its Persian here.')}</p>
      <div class="ed-fa-tools"><input class="inp" id="faQ" placeholder="${t('Search English or Persian…')}" value="${C.esc(faSearch)}" dir="auto">
        <button type="button" class="btn btn-ghost btn-sm" id="faAdd">+ ${t('Add translation')}</button></div>
      <div class="ed-fa">${keys.map(k => `<div class="ed-fa-row"><p class="ed-fa-en" dir="ltr">${C.esc(k)}</p>
        <textarea class="inp" rows="${Math.min(6, Math.ceil(String(all[k]).length / 60) + 1)}" dir="rtl" data-fa="${C.esc(k)}">${C.esc(all[k])}</textarea></div>`).join('')}</div>
      <p class="small muted">${t('Showing')} ${keys.length} / ${Object.keys(all).length}</p>`;
    const qEl = C.$('#faQ'); qEl.oninput = () => { faSearch = qEl.value; clearTimeout(drawFa.t); drawFa.t = setTimeout(() => { drawFa(m, label).then(() => { const x = C.$('#faQ'); x.focus(); x.setSelectionRange(x.value.length, x.value.length); }); }, 250); };
    m.querySelectorAll('[data-fa]').forEach(a => a.oninput = () => { const k = a.dataset.fa;
      if(base[k] === a.value) delete draft.fa[k]; else draft.fa[k] = a.value; saveDraft(); });
    C.$('#faAdd').onclick = () => { const en = prompt(t('English text exactly as it appears on the site:')); if(!en) return;
      const fa = prompt(t('Persian text:')); if(fa == null) return; draft.fa[en.trim()] = fa; faSearch = en.trim(); saveDraft(); drawFa(m, label); };
  }

  /* Image library picker: built-in images + uploads. */
  function picker(done){
    const lib = C.libraryImages();
    const box = document.createElement('div'); box.className = 'picker'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', t('Choose image'));
    box.innerHTML = `<div class="picker-in acct-card">
      <div class="card-h"><h2 class="h3">${t('Choose image')}</h2><button type="button" class="icon-btn" data-x aria-label="${t('Close')}">${C.I.close}</button></div>
      <div class="picker-tools"><input class="inp" placeholder="${t('Filter by file name…')}" data-q dir="ltr">
        <label class="btn btn-accent btn-sm picker-up">${t('Upload new image')}<input type="file" accept="image/*" hidden></label></div>
      <p class="form-err" data-err hidden></p>
      <div class="picker-grid">${lib.map(n => `<button type="button" class="picker-i" data-n="${C.esc(n)}" title="${C.esc(n)}">${C.img(n, {sizes: '140px'})}<span>${C.esc(n)}</span></button>`).join('')}</div></div>`;
    document.body.appendChild(box); document.documentElement.classList.add('locked');
    const close = () => { box.remove(); document.documentElement.classList.remove('locked'); };
    box.querySelector('[data-x]').onclick = close;
    box.addEventListener('click', e => { if(e.target === box) close(); const i = e.target.closest('.picker-i'); if(i){ close(); done(i.dataset.n); } });
    box.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
    box.querySelector('[data-q]').oninput = e => { const q = e.target.value.toLowerCase(); box.querySelectorAll('.picker-i').forEach(b => b.hidden = !b.dataset.n.toLowerCase().includes(q)); };
    box.querySelector('input[type=file]').onchange = async e => {
      const f = e.target.files[0]; if(!f) return; const err = box.querySelector('[data-err]'); err.hidden = true;
      const lab = box.querySelector('.picker-up'); lab.classList.add('busy');
      try{ const r = await Cloud.uploadImage(f); C.registerMedia(r.id, r); close(); done('media:' + r.id); }
      catch(ex){ err.textContent = t(Cloud.message(ex)); err.hidden = false; }
      finally{ lab.classList.remove('busy'); }
    };
    box.querySelector('[data-q]').focus();
  }

  return {render};
})();
