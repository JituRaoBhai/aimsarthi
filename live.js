/* LIVE STUDENTS (v12). Loaded after perms.js.
   The number is real: while your timer is running (not paused) and you are logged in, the app sends a small "I am studying" signal every 2 minutes.
   The /api/live function counts the signals from the last 5 minutes and returns only that number. No names, no details. */
(function(){
 const L={n:null,at:0,beat:0,on:false,busy:false,dn:20000},DK='acelife:livedemo';
 const demo=()=>{try{return localStorage.getItem(DK)==='1'}catch(e){return false}};window.Live=L;
 const cl=()=>window.Cloud&&Cloud.enabled&&Cloud.user&&Cloud.beat?Cloud:null;
 const msg=()=>{const n=demo()?L.dn:L.n;return demo()?`<b>${n.toLocaleString('en-US')}</b> students are studying right now <span class="tag">Demo</span>`:n>0?`<b>${n.toLocaleString('en-US')}</b> ${n===1?'student is':'students are'} studying right now`:'Nobody is studying right now. Start a session!'};
 window.liveBox=()=>L.n==null&&!demo()?'':`<div class="lvn" id="lvn" role="status" aria-live="polite"><i aria-hidden="true"></i><span>${msg()}</span></div>`;
 const show=()=>!!(typeof ready!=='undefined'&&ready&&S&&S.p.onboarded&&!V.build&&!(authOn()&&!CL().user));
 const paint=()=>{if(!show())return;const e=document.getElementById('lvs');if(e)e.innerHTML=liveBox()};   // the pill sits in the top bar (theme.js)
 async function pull(){if(L.busy||demo())return;L.busy=true;
  try{const r=await fetch('/api/live',{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();if(!j||j.ok!==true||!Number.isFinite(j.n))throw 0;L.n=Math.max(0,Math.floor(j.n));L.at=Date.now();paint()}
  catch(e){}finally{L.busy=false}}
 async function sync(){const c=cl(),T=S&&S.timer,run=!!(T&&!T.pz);
  if(c&&run){if(!L.on||Date.now()-L.beat>110e3){L.beat=Date.now();const first=!L.on;L.on=true;try{await c.beat()}catch(e){L.on=false}if(first)setTimeout(pull,2500)}}
  else if(L.on){L.on=false;L.beat=0;try{if(c)await c.unbeat()}catch(e){}setTimeout(pull,1500)}}
 ['go','timer','pause'].forEach(k=>{const f=A[k];if(typeof f!=='function')return;A[k]=function(){const r=f.apply(this,arguments);Promise.resolve(r).then(()=>setTimeout(sync,80));return r}});
 setInterval(()=>{sync();if(document.visibilityState==='visible'&&Date.now()-L.at>55e3)pull()},15e3);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(Date.now()-L.at>30e3)pull();sync()}});
 setTimeout(pull,2500);
})();

/* ---- DEMO PREVIEW (for testing the look only) ----
   Turned on by you in Profile, stored only on this phone, and always labelled "Demo" in the box. It is never shown to other students.
   Real students always see the real number. */
(function(){const L=window.Live,DK='acelife:livedemo',on=()=>{try{return localStorage.getItem(DK)==='1'}catch(e){return false}};
 const step=()=>{if(!on())return;L.dn=Math.min(20420,Math.max(19580,L.dn+Math.round((Math.random()-.48)*46)));const e=document.getElementById('lvs');if(e)e.innerHTML=liveBox()};
 setInterval(step,3500);
 window.liveCard=()=>`<section class="card"><div class="row sp"><span style="min-width:0"><b>Preview the live box</b><br><span class="sm mu">Shows a labelled "Demo" number (about 20,000, moving) so you can check the look. Only on this phone. Turn it off to see the real count.</span></span><button type="button" class="btn ${on()?'':'o '}s" data-a="ldemo" aria-pressed="${on()}">${on()?'On':'Off'}</button></div></section>`;
 A.ldemo=()=>{try{localStorage.setItem(DK,on()?'0':'1')}catch(e){}const e=document.getElementById('lvs');if(e)e.innerHTML=liveBox();render();toast(on()?'Demo preview on (labelled Demo)':'Demo preview off')};
})();
