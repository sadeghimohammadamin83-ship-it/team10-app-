/* ═══════════════════════════════════════════════════════════════════════
   Interactive data-center scene (home hero).
   An isometric hall drawn in SVG: utility yard → UPS / batteries → PDUs →
   two contained rack rows → cooling. Each system is a focusable button;
   selecting one zooms the view and opens a short technical note.
   Copy for every system lives in DC_SYSTEMS (js/data.js).
   ═══════════════════════════════════════════════════════════════════════ */
window.DCScene = (() => {
  const S=30, CO=Math.cos(Math.PI/6);
  const P=(x,y,z=0)=>[(x-y)*CO*S,(x+y)*.5*S-z*S];
  const f1=n=>n.toFixed(1);
  const pts=a=>a.map(p=>f1(p[0])+','+f1(p[1])).join(' ');
  const poly=(a,c,x='')=>`<polygon class="${c}" points="${pts(a)}"${x}/>`;
  const pl=(a,c,x='')=>`<polyline class="${c}" points="${pts(a.map(q=>P(...q)))}"${x}/>`;
  const ln=(a,b,c)=>`<line class="${c}" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"/>`;
  let seed=7; const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  // box: {x,y,z,w,d,h}; faces: L = front-left (y+d plane), R = right (x+w plane), T = top
  const B=(x,y,z,w,d,h)=>({x,y,z,w,d,h});
  const box=(b,m,cls='')=>{const {x,y,z,w,d,h}=b;
    return poly([P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],`fL ${m} ${cls}`)+
           poly([P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],`fR ${m} ${cls}`)+
           poly([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],`fT ${m} ${cls}`);};
  const FL=(b,u,v)=>P(b.x+u,b.y+b.d,b.z+v), FR=(b,u,v)=>P(b.x+b.w,b.y+u,b.z+v), FT=(b,u,v)=>P(b.x+u,b.y+v,b.z+b.h);
  const quad=(F,b,u0,v0,u1,v1,c)=>poly([F(b,u0,v0),F(b,u1,v0),F(b,u1,v1),F(b,u0,v1)],c);
  const dot=(p,r,c,st='')=>`<circle class="${c}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}"${st}/>`;
  const ell=(cx,cy,z,r,c)=>{const a=[];for(let i=0;i<24;i++){const t=i/24*Math.PI*2;a.push(P(cx+Math.cos(t)*r,cy+Math.sin(t)*r,z));}return `<polygon class="${c}" points="${pts(a)}"/>`;};
  const led=(p,k)=>dot(p,1.5,`led ${k}`,` style="--ld:${(rnd()*3).toFixed(2)}s;--lp:${(1.4+rnd()*2.2).toFixed(2)}s"`);

  /* ── components ── */
  function transformer(){ const b=B(-5.6,0.9,0,2.0,1.3,1.8); let s=box(b,'m-tr','shell');
    for(let u=.15;u<b.d;u+=.16) s+=ln(FR(b,u,.15),FR(b,u,b.h-.15),'fin');
    for(let u=.2;u<b.w;u+=.2) s+=ln(FL(b,u,.15),FL(b,u,b.h-.15),'fin');
    s+=box(B(-5.35,1.0,1.8,1.5,.35,.35),'m-tr','shell');                       // conservator
    [.35,.95,1.55].forEach(u=>s+=box(B(-5.6+u,1.75,1.8,.16,.16,.42),'m-ins','shell'));
    let i=box(B(-5.3,1.1,.1,1.4,.9,1.3),'m-core','inner');
    [.1,.55,1.0].forEach(u=>i+=box(B(-5.25+u,1.2,.2,.34,.7,1.05),'m-coil','inner'));
    return {s,i}; }
  function genset(){ const b=B(-5.8,3.7,0,3.2,1.3,1.6); let s=box(b,'m-gen','shell');
    for(let v=.25;v<b.h-.1;v+=.14) s+=ln(FR(b,.15,v),FR(b,b.d-.15,v),'grill');
    s+=quad(FL,b,.3,.2,1.3,1.35,'door')+quad(FL,b,1.5,.2,2.5,1.35,'door');
    s+=box(B(-5.2,4.1,1.6,.22,.22,.7),'m-dark','shell')+led(FL(b,2.9,1.2),'g');
    let i=box(B(-5.5,3.9,.15,1.4,.9,1.0),'m-eng','inner')+box(B(-4.0,4.0,.25,.8,.7,.75),'m-alt','inner')+box(B(-3.0,3.8,.1,.25,1.1,1.3),'m-rad','inner');
    return {s,i}; }
  function ups(){ const b=B(.6,.6,0,1.8,1.0,2.0); let s=box(b,'m-ups','shell');
    s+=quad(FL,b,.25,1.3,1.05,1.72,'scr')+quad(FL,b,.25,.2,1.55,1.1,'vent');
    for(let u=.35;u<1.5;u+=.12) s+=ln(FL(b,u,.28),FL(b,u,1.02),'vl');
    s+=led(FL(b,1.3,1.55),'a')+led(FL(b,1.45,1.55),'g');
    let i=''; [0,1,2].forEach(k=>i+=box(B(.75+k*.55,.7,.15,.45,.8,1.55),'m-mod','inner'));
    return {s,i}; }
  function battery(){ const b=B(.6,2.0,0,1.8,0.9,2.0); let s=box(b,'m-ups','shell');
    for(let v=.35;v<2;v+=.35) s+=ln(FL(b,.1,v),FL(b,b.w-.1,v),'vl');
    s+=led(FL(b,1.6,1.85),'g');
    let i=''; for(let t=0;t<5;t++) for(let k=0;k<4;k++){ const bb=B(.72+k*.42,2.1,.1+t*.37,.34,.7,.28); i+=box(bb,'m-bat','inner')+dot(FT(bb,.08,.1),1.1,'term r')+dot(FT(bb,.26,.1),1.1,'term k'); }
    return {s,i}; }
  function pdu(){ let s='',i='';
    [[1.6],[4.0]].forEach(([y])=>{ const b=B(3.0,y,0,.6,1.2,2.0); s+=box(b,'m-ups','shell')+quad(FL,b,.12,1.4,.48,1.75,'scr')+led(FL(b,.3,1.25),'a');
      for(let k=0;k<6;k++) i+=box(B(3.08,y+.1,.3+k*.25,.44,.12,.16),'m-brk','inner'); });
    return {s,i}; }
  function racks(){ let s='',i='';
    for(let k=0;k<8;k++){ const b=B(4+k*.6,1.6,0,.6,1.2,2.04); s+=box(b,'m-rack','shell');
      s+=quad(FL,b,.05,.05,.55,1.99,'door');
      for(let v=.25;v<1.95;v+=.22) s+=ln(FL(b,.1,v),FL(b,.46,v),'slot');
      for(let n=0;n<3;n++) s+=led(FL(b,.14+rnd()*.3,.3+Math.floor(rnd()*7)*.22+.08),rnd()>.3?'g':'a');
      for(let v=.15;v<1.9;v+=.19){ const bb=B(4.05+k*.6,1.7,v,.5,1.05,.12); i+=box(bb,'m-srv','inner')+dot(FL(bb,.08,.06),1,'led g in-led',` style="--ld:${(rnd()*2).toFixed(2)}s;--lp:${(.8+rnd()*1.4).toFixed(2)}s"`); } }
    return {s,i}; }
  function racksB(){ let s='';
    for(let k=0;k<8;k++){ const b=B(4+k*.6,4.0,0,.6,1.2,2.04); s+=box(b,'m-rack','shell');
      for(let u=.12;u<.5;u+=.09) s+=ln(FL(b,u,.12),FL(b,u,1.9),'cab');
      s+=led(FL(b,.48,1.8),rnd()>.5?'g':'a'); }
    return {s,i:''}; }
  function containment(){ let s='';
    s+=poly([P(4,2.8,2.06),P(8.8,2.8,2.06),P(8.8,4.0,2.06),P(4,4.0,2.06)],'gz roof');
    for(let x=4.6;x<8.8;x+=.6) s+=ln(P(x,2.8,2.06),P(x,4.0,2.06),'mull');
    s+=poly([P(8.8,2.8,0),P(8.8,4.0,0),P(8.8,4.0,2.06),P(8.8,2.8,2.06)],'gz door-g');
    s+=ln(P(8.8,3.4,0),P(8.8,3.4,2.06),'mull')+ln(P(8.8,3.3,.9),P(8.8,3.3,1.2),'handle')+ln(P(8.8,3.5,.9),P(8.8,3.5,1.2),'handle');
    return {s,i:''}; }
  function crah(){ let s='',i='';
    [1.2,4.0].forEach(y=>{ const b=B(10,y,0,1.5,1.3,2.1); s+=box(b,'m-crah','shell');
      for(let v=.2;v<1.5;v+=.12) s+=ln(FL(b,.15,v),FL(b,1.35,v),'grill');
      s+=quad(FL,b,.2,1.65,.8,1.95,'scr')+led(FL(b,1.2,1.85),'g');
      [.4,1.05].forEach(u=>{ s+=ell(10+u+.05,y+.65,2.101,.3,'fan-r'); s+=ell(10+u+.05,y+.65,2.102,.22,'fan'); });
      i+=box(B(10.15,y+.2,.2,.15,.9,1.6),'m-coil2','inner')+box(B(10.5,y+.2,.2,.8,.9,.5),'m-mod','inner'); });
    return {s,i}; }


  const BUILD = {tr:transformer, gen:genset, ups, bat:battery, pdu, rk:racks, ca:containment, cr:crah};

  function floor(){ let s=box(B(-.1,0,-.35,12.1,7,.35),'m-slab','');
    for(let x=0;x<=12;x+=.6) s+=ln(P(x,0,0),P(x,7,0),'tile');
    for(let y=0;y<=7;y+=.6) s+=ln(P(-.1,y,0),P(12,y,0),'tile');
    for(let x=4;x<8.8;x+=.6) for(let y=2.8;y<4;y+=.6) s+=poly([P(x+.04,y+.04,.005),P(x+.56,y+.04,.005),P(x+.56,y+.56,.005),P(x+.04,y+.56,.005)],'perf');
    const yard=box(B(-6.4,0,-.5,6.1,7,.25),'m-yard','');
    return yard+s; }
  function flows(){ let s='';
    s+=pl([[-3.6,1.55,.02],[-.6,1.55,.02],[-.6,1.1,.02],[.6,1.1,.02]],'flow pw');
    s+=pl([[-2.6,4.35,.02],[-1.2,4.35,.02],[-1.2,1.55,.02]],'flow sb');
    s+=pl([[1.5,1.1,2.0],[1.5,1.1,2.55],[1.5,2.2,2.55],[3.3,2.2,2.55],[3.3,2.2,2.0]],'flow pw');
    s+=pl([[3.3,2.2,2.55],[8.8,2.2,2.55]],'flow pw');
    s+=pl([[1.5,2.2,2.55],[1.5,4.6,2.55],[3.3,4.6,2.55],[3.3,4.6,2.0]],'flow pw');
    s+=pl([[3.3,4.6,2.55],[8.8,4.6,2.55]],'flow pw');
    for(let k=0;k<8;k++){ s+=pl([[4.3+k*.6,2.2,2.55],[4.3+k*.6,2.2,2.04]],'flow pw drop'); s+=pl([[4.3+k*.6,4.6,2.55],[4.3+k*.6,4.6,2.04]],'flow pw drop'); }
    s+=pl([[10,1.85,.03],[9.3,1.85,.03],[9.3,3.4,.03],[8.85,3.4,.03]],'flow cold');
    s+=pl([[10,4.65,.03],[9.3,4.65,.03],[9.3,3.4,.03]],'flow cold');
    s+=pl([[6.4,1.2,2.1],[6.4,1.2,3.0],[10.75,1.2,3.0],[10.75,1.85,2.2]],'flow hot');
    s+=pl([[6.4,5.6,2.1],[6.4,5.6,3.0],[10.75,5.6,3.0],[10.75,4.65,2.2]],'flow hot');
    for(let x=4.3;x<8.8;x+=.6) for(const y of [3.1,3.7]){ const a=P(x,y,.1); s+=`<line class="rise" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(a[0])}" y2="${f1(a[1]-14)}" style="--rd:${(rnd()*2.4).toFixed(2)}s"/>`; }
    return s; }
  function trays(){ let s='';
    [[1.2,2.05,7.8,.3],[1.2,4.45,7.8,.3]].forEach(([x,y,w,d])=>s+=box(B(x,y,2.5,w,d,.06),'m-tray',''));
    s+=box(B(1.35,1.05,2.5,.3,3.7,.06),'m-tray','');
    return s; }

  const HOT={tr:P(-4.6,1.55,2.8), gen:P(-4.2,4.35,2.5), ups:P(1.5,1.1,2.35), bat:P(1.5,2.45,2.3), pdu:P(3.3,4.6,2.35), rk:P(6.4,2.2,2.95), ca:P(8.8,3.4,1.1), cr:P(10.75,1.85,2.9)};
  const VB=(()=>{ const xs=[P(-6.4,7,0)[0],P(12,0,0)[0]], ys=[P(-6.4,0,3.2)[1],P(12,7,-.5)[1]]; const pad=18;
    return [xs[0]-pad,ys[0]-pad,xs[1]-xs[0]+pad*2,ys[1]-ys[0]+pad*2].map(n=>+n.toFixed(1)); })();

  /* Draw order matters in an isometric scene: back row of racks sits
     between containment and cooling. */
  const ORDER = ['tr','gen','ups','bat','pdu','rk','ca','ROW_B','cr','TRAYS'];

  function svg(){
    seed = 7;
    const sys = DC_SYSTEMS.map((c,i)=>({...c, i}));
    const byK = Object.fromEntries(sys.map(c=>[c.k,c]));
    const group = c => { const r = BUILD[c.k]();
      return `<g class="cmp" data-k="${c.k}" tabindex="0" role="button" aria-label="${U.esc(c.n)}" style="--i:${c.i}"><g class="lift">${r.s}${r.i?`<g class="in">${r.i}</g>`:''}</g></g>`; };
    const body = ORDER.map(k => k==='ROW_B' ? `<g class="rowB">${racksB().s}</g>`
                              : k==='TRAYS' ? `<g class="trays">${trays()}</g>` : group(byK[k])).join('');
    const vb = VB.join(' ');
    return `<svg class="dcs-svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Interactive data center: transformer, generator, UPS, batteries, power distribution, racks, containment and cooling">
      <g class="base" aria-hidden="true">${floor()}</g>${body}</svg>
      <svg class="dcs-svg dcs-fx" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g class="flows">${flows()}</g>
        <g class="hots">${sys.map(c=>{ const p = HOT[c.k];
          return `<g class="hs" data-k="${c.k}" transform="translate(${f1(p[0])} ${f1(p[1])})"><g class="hs-s"><circle class="hs-p" r="11"/><circle class="hs-c" r="8.5"/><text class="hs-t" y="3">${c.i+1}</text></g></g>`; }).join('')}</g>
      </svg>`;
  }

  function html(){
    const {I} = U;
    return `<div class="dcs iso" id="dcs">
      <div class="dcs-stage">
        ${svg()}
        <div class="dcs-legend" aria-hidden="true"><span><i class="lg-pw"></i>Power</span><span><i class="lg-cold"></i>Cold air</span><span><i class="lg-hot"></i>Hot air</span></div>
        <div class="dcs-tip" aria-hidden="true"></div>
        <button type="button" class="dcs-back" data-dc="x">${I.back}<span>Back to the whole hall</span></button>
      </div>
      <p class="dcs-hint"><span class="hint-dot" aria-hidden="true"></span><span>Click a component to look inside</span></p>
      <div class="dcs-panel" role="region" aria-label="Component details" aria-live="polite" hidden></div>
    </div>`;
  }

  /* Single-object thumbnails for the Object design page, drawn with the same
     geometry and materials as the hall. */
  function rack1(){ const b=B(0,0,0,.6,1.2,2.04); let s=box(b,'m-rack','shell')+quad(FL,b,.05,.05,.55,1.99,'door');
    for(let v=.25;v<1.95;v+=.22) s+=ln(FL(b,.1,v),FL(b,.46,v),'slot');
    for(let n=0;n<4;n++) s+=led(FL(b,.14+rnd()*.3,.3+Math.floor(rnd()*7)*.22+.08),rnd()>.3?'g':'a');
    return {s}; }
  function thumb(k){ seed=11; const r = k==='rack1' ? rack1() : BUILD[k]();
    return `<svg class="obj-svg" viewBox="${VB.join(' ')}" data-fit aria-hidden="true" focusable="false"><g>${r.s}</g></svg>`; }
  function fitThumbs(scope){
    scope.querySelectorAll('svg[data-fit]').forEach(s=>{ const bb=s.firstElementChild.getBBox(); if(!bb.width) return;
      const p=Math.max(bb.width,bb.height)*.14;
      s.setAttribute('viewBox',[bb.x-p,bb.y-p,bb.width+p*2,bb.height+p*2].map(n=>n.toFixed(1)).join(' ')); s.removeAttribute('data-fit'); }); }

  let api = {open(){}, close(){}};

  function bind(){
    const root = document.getElementById('dcs'); if(!root) return api;
    const {I, esc, pad, CALM, FINE} = U;
    const stage = root.querySelector('.dcs-stage'), sv = root.querySelector('.dcs-svg'), fx = root.querySelector('.dcs-fx');
    const tip = root.querySelector('.dcs-tip'), panel = root.querySelector('.dcs-panel');
    const N = DC_SYSTEMS.length;
    let vb = [...VB], anim = 0, cur = -1;

    // Letterbox a viewBox to the element's aspect so tweens start from what is on screen.
    const fitMeet = (v,r) => { const ar=r.width/r.height; let [x,y,w,h]=v; const cx=x+w/2, cy=y+h/2; if(w/h>ar) h=w/ar; else w=h*ar; return [cx-w/2,cy-h/2,w,h]; };
    const setVB = v => { vb = v; const a = v.map(n=>n.toFixed(1)).join(' ');
      sv.setAttribute('viewBox',a); fx.setAttribute('viewBox',a);
      const base = fitMeet([...VB], sv.getBoundingClientRect())[2];
      fx.style.setProperty('--hz', Math.max(.3,Math.min(1,v[2]/base)).toFixed(3)); };
    const tween = (to,ms=850) => { cancelAnimationFrame(anim); const from=[...vb], t0=performance.now();
      const e = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
      const step = now => { const k=Math.min(1,(now-t0)/ms), q=CALM?1:e(k); setVB(from.map((a,i)=>a+(to[i]-a)*q)); if(k<1) anim=requestAnimationFrame(step); };
      anim = requestAnimationFrame(step); };
    // Frame a component's bounding box, leaving room for the side panel on wide screens.
    const frame = bb => { const r=sv.getBoundingClientRect(), ar=r.width/r.height, pad=Math.max(bb.width,bb.height)*.35+26;
      let w=bb.width+pad*2, h=bb.height+pad*2;
      const side = r.width>=600 ? Math.min(360, r.width*.44) : 0, fw=(r.width-side)/r.width;
      w/=fw; if(w/h>ar) h=w/ar; else w=h*ar;
      const rtl = document.documentElement.dir==='rtl';
      const cx = bb.x+bb.width/2 + (rtl?1:-1)*(side/2)/r.width*w;
      return [cx-w/2, bb.y+bb.height/2-h/2, w, h]; };

    // Pause the flow animations whenever the scene is off screen.
    if('IntersectionObserver' in window)
      new IntersectionObserver(es=>es.forEach(e=>root.classList.toggle('paused',!e.isIntersecting)),{rootMargin:'80px'}).observe(root);

    const panelHTML = c => `
      <div class="dp-h"><span class="label">Component · <span class="num">${pad(cur+1)} / ${pad(N)}</span></span>
        <button type="button" class="icon-btn dp-x" aria-label="Close" data-dc="x">${I.close}</button></div>
      <h3 class="dp-t">${esc(c.n)}</h3><p class="dp-d">${esc(c.t)}</p>
      <dl class="dp-s">${c.sp.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
      <div class="dp-n">
        <button type="button" class="icon-btn dp-b" data-dc="p" aria-label="Previous">${I.arrowL}</button>
        <button type="button" class="icon-btn dp-b" data-dc="n" aria-label="Next">${I.arrow}</button>
        ${c.obj?`<button type="button" class="btn btn-accent btn-sm dp-3d" data-model="${esc(c.obj)}">Open the 3D model ${I.cube}</button>`:''}
      </div>
      <div class="dp-dots" role="group" aria-label="Components">${DC_SYSTEMS.map((x,k)=>`<button type="button" class="dp-dot${k===cur?' on':''}" data-go="${k}" aria-label="${esc(x.n)}"${k===cur?' aria-current="true"':''}></button>`).join('')}</div>`;

    const open = i => {
      cur = (i+N)%N; const c = DC_SYSTEMS[cur];
      root.classList.add('focus');
      root.querySelectorAll('.cmp').forEach(g=>{ const on=g.dataset.k===c.k; g.classList.toggle('on',on); g.setAttribute('aria-pressed',String(on)); });
      const g = root.querySelector(`.cmp[data-k="${c.k}"]`);
      requestAnimationFrame(()=>{ vb=fitMeet(vb,sv.getBoundingClientRect()); tween(frame(g.getBBox())); });
      panel.innerHTML = panelHTML(c); panel.hidden = false;
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
      requestAnimationFrame(()=>panel.classList.add('show'));
      tip.classList.remove('on');
    };
    const close = () => {
      const was = cur; cur = -1; root.classList.remove('focus');
      root.querySelectorAll('.cmp').forEach(g=>{ g.classList.remove('on'); g.removeAttribute('aria-pressed'); });
      panel.classList.remove('show'); setTimeout(()=>{ if(cur<0) panel.hidden=true; },300);
      requestAnimationFrame(()=>{ const r=sv.getBoundingClientRect(); vb=fitMeet(vb,r); tween(fitMeet([...VB],r)); });
      // Return keyboard focus to the component that was open.
      if(was>=0 && root.contains(document.activeElement)) { const g=root.querySelector(`.cmp[data-k="${DC_SYSTEMS[was].k}"]`); g&&g.focus({preventScroll:true}); }
    };

    // Drag to pan while zoomed in.
    let drag=null, dragged=false;
    stage.addEventListener('pointerdown',e=>{ if(cur<0||e.button!==0||e.target.closest('button')) return;
      drag={x:e.clientX,y:e.clientY,vb:[...vb],id:e.pointerId}; dragged=false; });
    stage.addEventListener('pointermove',e=>{
      if(drag && e.pointerId===drag.id){
        const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
        if(!dragged && Math.hypot(dx,dy)<6) return;
        if(!dragged){ dragged=true; cancelAnimationFrame(anim); root.classList.add('grabbing'); try{stage.setPointerCapture(drag.id);}catch(_){} }
        const r=sv.getBoundingClientRect(), k=Math.max(drag.vb[2]/r.width,drag.vb[3]/r.height);
        setVB([drag.vb[0]-dx*k, drag.vb[1]-dy*k, drag.vb[2], drag.vb[3]]); return;
      }
      const g = e.target.closest('.cmp,.hs');
      if(!g||cur>=0||!FINE){ tip.classList.remove('on'); return; }
      const c = DC_SYSTEMS.find(x=>x.k===g.dataset.k), r = stage.getBoundingClientRect();
      tip.textContent = U.t(c.n);
      tip.style.transform = `translate(${e.clientX-r.left+14}px,${e.clientY-r.top+14}px)`; tip.classList.add('on');
    });
    const endDrag = () => { if(!drag) return; drag=null; root.classList.remove('grabbing'); if(dragged) setTimeout(()=>dragged=false,0); };
    stage.addEventListener('pointerup',endDrag); stage.addEventListener('pointercancel',endDrag);
    stage.addEventListener('pointerleave',()=>tip.classList.remove('on'));

    root.addEventListener('click',e=>{
      if(dragged){ e.preventDefault(); dragged=false; return; }
      const b = e.target.closest('[data-dc]');
      if(b){ const a=b.dataset.dc; if(a==='x') close(); else open(cur+(a==='n'?1:-1)); return; }
      const dg = e.target.closest('[data-go]'); if(dg){ open(+dg.dataset.go); return; }
      const g = e.target.closest('.cmp,.hs');
      if(g){ const i=DC_SYSTEMS.findIndex(c=>c.k===g.dataset.k); i===cur ? close() : open(i); }
    });
    root.addEventListener('keydown',e=>{
      const g = e.target.closest('.cmp');
      if(g && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); open(DC_SYSTEMS.findIndex(c=>c.k===g.dataset.k)); return; }
      if(cur<0) return;
      if(e.key==='Escape'){ e.stopPropagation(); close(); }
      const rtl = document.documentElement.dir==='rtl';
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); open(cur + ((e.key==='ArrowRight')!==rtl ? 1 : -1)); }
    });

    // Assemble the hall once the intro (if any) is out of the way.
    const go = () => root.classList.add('live');
    const wait = () => document.getElementById('intro') ? setTimeout(wait,150) : setTimeout(go,80);
    wait();
    let rt=0; addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{ if(!document.body.contains(root)) return; cur>=0 ? open(cur) : setVB(fitMeet([...VB],sv.getBoundingClientRect())); },200); });

    api = {open:k=>{ const i=DC_SYSTEMS.findIndex(c=>c.k===k); if(i>=0) open(i); }, close};
    return api;
  }

  return {html, bind, thumb, fitThumbs, get api(){ return api; }};
})();
