/* ═══════════════════════════════════════════════════════════════════════
   Accounts, project requests and published content (Firebase).
   Nothing here runs until FIREBASE_CONFIG (js/firebase-config.js) is set.
   The Firebase SDK (js/vendor/firebase.js) is loaded on first use — the
   public site never pays for it unless someone signs in or sends a request.
   Published content is read with one plain REST call, no SDK.
   ═══════════════════════════════════════════════════════════════════════ */
window.Cloud = (() => {
  const cfg = window.FIREBASE_CONFIG || null;
  const enabled = !!(cfg && cfg.apiKey && cfg.projectId);
  const ADMIN = String(window.ADMIN_EMAIL || '').toLowerCase();
  const EMU = enabled && cfg.emulator;              // local test mode only
  let FBP = null, auth = null, db = null, user = null, authReady = null;
  const listeners = new Set();

  function loadSdk(){
    if(!enabled) return Promise.reject(err('not-configured'));
    return FBP = FBP || new Promise((res, rej) => {
      const init = () => {
        const F = window.FB;
        const app = F.initializeApp(cfg);
        auth = F.initializeAuth(app, {persistence: [F.indexedDBLocalPersistence, F.browserLocalPersistence]});
        db = F.getFirestore(app);
        if(EMU){ F.connectAuthEmulator(auth, 'http://127.0.0.1:9099', {disableWarnings: true}); F.connectFirestoreEmulator(db, '127.0.0.1', 8080); }
        authReady = new Promise(r => { let first = true;
          F.onAuthStateChanged(auth, u => { user = u; if(first){ first = false; r(u); } listeners.forEach(fn => fn(u)); }); });
        res(F);
      };
      if(window.FB) return init();                  // already inlined (single-file build)
      const s = document.createElement('script');
      s.src = 'js/vendor/firebase.js';
      s.onload = init;
      s.onerror = () => { FBP = null; rej(err('network')); };
      document.head.appendChild(s);
    });
  }
  function err(code){ const e = new Error(code); e.code = code; return e; }

  /* Human messages for Firebase error codes (Persian through the FA dictionary). */
  const MESSAGES = {
    'auth/email-already-in-use': 'An account with this Gmail already exists — sign in instead.',
    'auth/invalid-credential': 'Gmail or password is incorrect.',
    'auth/invalid-login-credentials': 'Gmail or password is incorrect.',
    'auth/wrong-password': 'Gmail or password is incorrect.',
    'auth/user-not-found': 'Gmail or password is incorrect.',
    'auth/invalid-email': 'That Gmail address does not look right.',
    'auth/weak-password': 'Choose a password of at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/network-request-failed': 'No connection to the account service. Check your internet (or VPN) and try again.',
    'network': 'No connection to the account service. Check your internet (or VPN) and try again.',
    'unavailable': 'No connection to the account service. Check your internet (or VPN) and try again.',
    'permission-denied': 'You do not have permission to do that.',
    'not-configured': 'Accounts are not switched on yet.',
    'too-large': 'This image is too large, even after compression. Try a smaller one.'
  };
  const message = e => MESSAGES[e && e.code] || MESSAGES[(e && e.code || '').replace(/^firestore\//, '')] || 'Something went wrong. Please try again.';

  const isAdmin = u => !!(u && u.email && u.email.toLowerCase() === ADMIN);
  // The signed-in user now (after the persisted session, if any, has been restored).
  async function currentUser(){ if(!enabled) return null; await loadSdk(); await authReady; return auth.currentUser; }
  function onChange(fn){ listeners.add(fn); return () => listeners.delete(fn); }

  async function signUp(name, email, password){
    const F = await loadSdk();
    const cred = await F.createUserWithEmailAndPassword(auth, email, password);
    await F.updateProfile(cred.user, {displayName: name});
    await F.setDoc(F.doc(db, 'users', cred.user.uid), {name, email: cred.user.email, createdAt: F.serverTimestamp()});
    user = cred.user; listeners.forEach(fn => fn(user));
    return cred.user;
  }
  async function signIn(email, password){ const F = await loadSdk(); return (await F.signInWithEmailAndPassword(auth, email, password)).user; }
  async function signOut(){ const F = await loadSdk(); await F.signOut(auth); }
  async function updateName(name){
    const F = await loadSdk(); await F.updateProfile(auth.currentUser, {displayName: name});
    await F.setDoc(F.doc(db, 'users', auth.currentUser.uid), {name, email: auth.currentUser.email, updatedAt: F.serverTimestamp()}, {merge: true});
  }

  const rows = snap => snap.docs.map(d => ({id: d.id, ...d.data()}));
  const toDate = t => t && t.toDate ? t.toDate() : (t ? new Date(t) : null);

  async function submitRequest(data){
    const F = await loadSdk(); const u = await currentUser();
    const ref = await F.addDoc(F.collection(db, 'requests'), {...data, uid: u ? u.uid : null, status: 'new', createdAt: F.serverTimestamp()});
    return ref.id;
  }
  async function myRequests(){
    const F = await loadSdk(); const u = await currentUser(); if(!u) return [];
    const list = rows(await F.getDocs(F.query(F.collection(db, 'requests'), F.where('uid', '==', u.uid))));
    return list.sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0));
  }
  async function allRequests(){ const F = await loadSdk(); return rows(await F.getDocs(F.query(F.collection(db, 'requests'), F.orderBy('createdAt', 'desc')))); }
  async function setRequestStatus(id, status){ const F = await loadSdk(); await F.updateDoc(F.doc(db, 'requests', id), {status}); }
  async function deleteRequest(id){ const F = await loadSdk(); await F.deleteDoc(F.doc(db, 'requests', id)); }
  async function listUsers(){ const F = await loadSdk(); return rows(await F.getDocs(F.collection(db, 'users')))
    .sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0)); }

  /* ── Published content ── */
  const restBase = () => (EMU ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com') + `/v1/projects/${cfg.projectId}/databases/(default)/documents`;
  // batchGet answers 200 with "missing" for absent documents, so a site with
  // nothing published yet does not log a 404 on every visit.
  async function restGet(path){
    const r = await fetch(`${restBase()}:batchGet?key=${encodeURIComponent(cfg.apiKey)}`, {method: 'POST', cache: 'no-store',
      headers: {'Content-Type': 'application/json'}, body: JSON.stringify({documents: [`projects/${cfg.projectId}/databases/(default)/documents/${path}`]})});
    if(!r.ok) throw err('unavailable');
    const [res] = await r.json();
    return res && res.found ? res.found.fields || {} : null;
  }
  /** {content, updatedAt} of the published site, or null if nothing is published. */
  async function fetchContent(){
    if(!enabled) return null;
    const f = await restGet('site/content'); if(!f || !f.json) return null;
    return {content: JSON.parse(f.json.stringValue), updatedAt: f.updatedAt ? f.updatedAt.timestampValue : ''};
  }
  async function fetchMedia(id){
    const f = await restGet('media/' + encodeURIComponent(id)); if(!f || !f.data) return null;
    return {src: f.data.stringValue, w: +(f.w && f.w.integerValue || 0), h: +(f.h && f.h.integerValue || 0)};
  }
  async function publish(content){
    const F = await loadSdk(); const u = await currentUser(); if(!isAdmin(u)) throw err('permission-denied');
    const prev = await F.getDoc(F.doc(db, 'site', 'content'));
    if(prev.exists()) await F.setDoc(F.doc(db, 'site', 'content_prev'), prev.data());
    await F.setDoc(F.doc(db, 'site', 'content'), {json: JSON.stringify(content), updatedAt: F.serverTimestamp(), by: u.email});
  }
  async function previousContent(){
    const F = await loadSdk(); const d = await F.getDoc(F.doc(db, 'site', 'content_prev'));
    return d.exists() ? JSON.parse(d.data().json) : null;
  }
  async function unpublish(){ const F = await loadSdk(); await F.deleteDoc(F.doc(db, 'site', 'content')); }

  /* Images the admin uploads are resized to WebP in the browser and stored in
     Firestore (each document stays under its 1 MB limit). Referenced as media:<id>. */
  async function uploadImage(file){
    const F = await loadSdk();
    const bmp = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(err('bad-image')); i.src = URL.createObjectURL(file); });
    let max = 1800, q = .84, data = '', w = 0, h = 0;
    for(let tries = 0; tries < 8; tries++){
      const k = Math.min(1, max / Math.max(bmp.naturalWidth, bmp.naturalHeight));
      w = Math.round(bmp.naturalWidth * k); h = Math.round(bmp.naturalHeight * k);
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(bmp, 0, 0, w, h);
      data = c.toDataURL('image/webp', q);
      if(!data.startsWith('data:image/webp')) data = c.toDataURL('image/jpeg', q);
      if(data.length < 900000) break;
      q -= .08; max = Math.round(max * .85);
    }
    URL.revokeObjectURL(bmp.src);
    if(data.length >= 900000) throw err('too-large');
    const ref = await F.addDoc(F.collection(db, 'media'), {data, w, h, name: String(file.name || '').slice(0, 120), createdAt: F.serverTimestamp()});
    return {id: ref.id, src: data, w, h};
  }

  return {enabled, isAdmin, currentUser, onChange, signUp, signIn, signOut, updateName, message, toDate,
    submitRequest, myRequests, allRequests, setRequestStatus, deleteRequest, listUsers,
    fetchContent, fetchMedia, publish, previousContent, unpublish, uploadImage, adminEmail: ADMIN};
})();
