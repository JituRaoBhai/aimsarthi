/* APP UPDATES, OFFLINE BAR, ABOUT CARD (v13). Loaded after live.js.
   - Registers the service worker and shows "A new version is ready. Update" when a new version has downloaded.
   - Thin bar at the top: red "No internet connection", then green "Internet connection restored".
   - Profile card: version, Check for updates, legal links, report a problem, delete account. */
(function(){
 const P={reg:null,waiting:null,updating:false,wasOff:false,online:true};window.PWA=P;
 const bar=id=>{let e=document.getElementById(id);if(!e){e=document.createElement('div');e.id=id;e.setAttribute('role','status');e.setAttribute('aria-live','polite');document.body.appendChild(e)}return e};
 /* ---------- internet connection ---------- */
 let nbT=0;
 function net(on){if(on===P.online&&!(on&&P.wasOff))return;const e=bar('nb');clearTimeout(nbT);P.online=on;
  if(!on){P.wasOff=true;e.className='nb off on';e.textContent='No internet connection';document.body.classList.add('nbo')}
  else if(P.wasOff){P.wasOff=false;e.className='nb ok on';e.textContent='Internet connection restored';document.body.classList.add('nbo');nbT=setTimeout(()=>{e.classList.remove('on');document.body.classList.remove('nbo')},3000)}}
 async function probe(){   // navigator.onLine says "connected" for Wi-Fi with no internet, so also ask our own server (the service worker sends this request straight to the network)
  if(!navigator.onLine)return net(false);
  try{const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);const r=await fetch('manifest.json?probe='+Date.now(),{cache:'no-store',headers:{'x-probe':'1'},signal:c.signal});clearTimeout(t);net(!!r&&r.status>0)}
  catch(e){net(false)}}
 addEventListener('offline',()=>net(false));addEventListener('online',probe);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')probe()});
 setInterval(()=>{if(document.visibilityState==='visible')probe()},20000);
 if(!navigator.onLine){P.wasOff=true;P.online=false;const e=bar('nb');e.className='nb off on';e.textContent='No internet connection';document.body.classList.add('nbo')}
 else setTimeout(probe,1500);

 /* ---------- updates ---------- */
 function showUpd(w){P.waiting=w;const e=bar('ub');e.className='ub on';e.setAttribute('role','alert');
  e.innerHTML='<span>A new version of AceLife is ready.</span><button type="button" data-a="updnow">Update</button><button type="button" class="x" data-a="updlater" aria-label="Dismiss">&times;</button>';try{if(V.tab==='profile'&&!sheetOpen())render()}catch(x){}}
 if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
  addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(reg=>{P.reg=reg;
   if(reg.waiting&&navigator.serviceWorker.controller)showUpd(reg.waiting);
   reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpd(w)})});
   setInterval(()=>reg.update().catch(()=>{}),30*6e4);
   document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})})}).catch(()=>{}));
  let rl=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(rl||!P.updating)return;rl=true;location.reload()});
 }
 const waitingSW=()=>P.waiting||(P.reg&&P.reg.waiting)||null;
 Object.assign(A,{
  updnow:()=>{const w=waitingSW();if(!w){location.reload();return}P.updating=true;try{save()}catch(e){}toast('Updating...');w.postMessage({type:'SKIP_WAITING'});setTimeout(()=>location.reload(),4000)},
  updlater:()=>{const e=document.getElementById('ub');if(e)e.classList.remove('on')},
  chk:async()=>{if(!P.reg){toast('Updates are checked when the app is installed or opened from its web address.');return}
   if(!P.online||!navigator.onLine){toast('No internet connection.');return}
   toast('Checking for updates...');try{await P.reg.update()}catch(e){toast('Could not check. Try again later.');return}
   for(let i=0;i<16;i++){const w=waitingSW();if(w){showUpd(w);toast('A new version is ready.');return}if(!P.reg.installing&&i>2)break;await new Promise(r=>setTimeout(r,500))}
   toast('You have the latest version ('+VER+')')}});

 /* ---------- Profile > About and updates ---------- */
 window.aboutCard=()=>{const w=!!waitingSW(),u=authOn()&&CL().user;
  return`<section class="card"><h2>About and updates</h2><div class="row sp" style="align-items:center"><span><b>AceLife</b><br><span class="sm mu">Version ${esc(VER)}</span></span>${w?'<button type="button" class="btn s" data-a="updnow">Update now</button>':'<button type="button" class="btn o s" data-a="chk">Check for updates</button>'}</div>`
  +(w?'<p class="sm" style="margin:8px 0 0">A new version is ready. Tap Update now.</p>':'')
  +`<p class="sm" style="margin:14px 0 6px"><a href="privacy-policy.html" target="_blank" rel="noopener">Privacy policy</a> &middot; <a href="terms.html" target="_blank" rel="noopener">Terms of use</a> &middot; <a href="delete-account.html" target="_blank" rel="noopener">Delete your data</a></p>`
  +`<div class="stack">${u?'<button type="button" class="btn o s" data-a="fb">Report a problem or AI answer</button>':''}${u?'<button type="button" class="btn o s dng" data-a="delacc">Delete my account</button>':''}</div>`
  +`<p class="sm mu" style="margin:10px 0 0">AceLife is a study planner. It does not give medical advice. AI answers can be wrong, so check them against your books.</p></section>`};
})();
