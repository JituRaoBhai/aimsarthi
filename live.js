/* LIVE STUDENTS (v13). Loaded after perms.js. ... */
(function(){
  const L={n:null,at:0,beat:0,on:false,busy:false,dn:20000+Math.floor(Math.random()*19)-9},DK='acelife:livedemo';
  const demo=()=>{try{return localStorage.getItem(DK)==='1'}catch(e){return false}};
  window.Live=L;
  const cl=()=>window.Cloud&&Cloud.enabled&&Cloud.user&&Cloud.beat?Cloud:null;
  const msg=()=>{const n=demo()?L.dn:L.n;return demo()?`<b>${n.toLocaleString('en-US')}</b> students are studying right now <span class="tag">Demo</span>`:n>0?`<b>${n.toLocaleString('en-US')}</b> ${n===1?'student is':'students are'} studying right now`:'Nobody is studying right now. Start a session!'};
  window.liveBox=()=>`<div class="lvn" id="lvn" role="status" aria-live="polite"><i aria-hidden="true"></i><span>${msg()}</span></div>`;

  // CHANGED: real box shows ONLY if we're online AND we've had a successful
  // pull this session (L.at > 0). Fresh launch / refresh → L.at === 0 → hidden.
  // Demo box shows when online (it doesn't touch the server).
  const show=()=>{
    if(navigator.onLine===false)return false;
    if(demo())return true;
    return L.at>0;
  };

  const paint=()=>{
    const e=document.getElementById('lvs');
    if(!e)return;
    if(!show()){e.innerHTML='';return}
    e.innerHTML=liveBox();
  };

  // the pill sits in the top bar (theme.js)
  async function pull(){
    if(L.busy||demo()||navigator.onLine===false)return;
    L.busy=true;
    try{
      const r=await fetch('/api/live',{cache:'no-store'});
      if(!r.ok)throw 0;
      const j=await r.json();
      if(!j||j.ok!==true||!Number.isFinite(j.n))throw 0;
      L.n=Math.max(0,Math.floor(j.n));
      L.at=Date.now();
      paint();
    }catch(e){
      // CHANGED: any fetch failure clears the box immediately
      const el=document.getElementById('lvs');
      if(el)el.innerHTML='';
    }finally{L.busy=false}
  }
  async function sync(){const c=cl(),T=S&&S.timer,run=!!(T&&!T.pz); if(c&&run){if(!L.on||Date.now()-L.beat>110e3){L.beat=Date.now();const first=!L.on;L.on=true;try{await c.beat()}catch(e){L.on=false}if(first)setTimeout(pull,2500)}} else if(L.on){L.on=false;L.beat=0;try{if(c)await c.unbeat()}catch(e){}setTimeout(pull,1500)}}
  ['go','timer','pause'].forEach(k=>{const f=A[k];if(typeof f!=='function')return;A[k]=function(){const r=f.apply(this,arguments);Promise.resolve(r).then(()=>setTimeout(sync,80));return r}});
  setInterval(()=>{sync();if(document.visibilityState==='visible'&&Date.now()-L.at>9e3)pull()},5e3);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(Date.now()-L.at>9e3)pull();sync()}});

  // network events
  window.addEventListener('offline',()=>{const e=document.getElementById('lvs');if(e)e.innerHTML=''});
  window.addEventListener('online',()=>{if(demo())paint();else pull()});

  setTimeout(pull,2500);

  // CHANGED: no immediate paint of the real box on load — it appears only
  // after the first successful pull. Demo may paint right away.
  if(demo())paint();
  document.addEventListener('DOMContentLoaded',()=>{if(demo())paint()});
  setTimeout(()=>{if(demo())paint()},1000);
})();

/* ---- DEMO PREVIEW (only network handling; demo shows when online) ---- */
(function(){const L=window.Live,DK='acelife:livedemo',on=()=>{try{return localStorage.getItem(DK)==='1'}catch(e){return false}};
  const step=()=>{if(!on())return;
    if(navigator.onLine===false){const e=document.getElementById('lvs');if(e)e.innerHTML='';return}
    const d=(1+Math.floor(Math.random()*9))*(Math.random()<.5?-1:1);L.dn=Math.min(20150,Math.max(19850,L.dn+d));
    const e=document.getElementById('lvs');if(e)e.innerHTML=liveBox()};
  setInterval(step,1e4);
  window.addEventListener('online',()=>{const e=document.getElementById('lvs');if(e&&on())e.innerHTML=liveBox()});
  window.addEventListener('offline',()=>{const e=document.getElementById('lvs');if(e)e.innerHTML=''});
  window.liveCard=()=>`<section class="card"><div class="row sp"><span style="min-width:0"><b>Preview the live box</b><br><span class="sm mu">Shows a labelled "Demo" number (about 20,000, a little different each time you open the app, moving by under 10 every 10 seconds) so you can check the look. Only on this phone. Turn it off to see the real count.</span></span><button type="button" class="btn ${on()?'':'o '}s" data-a="ldemo" aria-pressed="${on()}">${on()?'On':'Off'}</button></div></section>`;
  A.ldemo=()=>{try{localStorage.setItem(DK,on()?'0':'1')}catch(e){}const e=document.getElementById('lvs');if(e)e.innerHTML=on()?liveBox():'';render();toast(on()?'Demo preview on (labelled Demo)':'Demo preview off')};
})();
