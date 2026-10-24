/* FLOATING TIMER (v11). Loaded after app.js.
   1. Drag: grab the timer anywhere except a button and move it. Its place is remembered on this device.
   2. Small pill: the "-" button shrinks it to a time-only pill (drag that too). Tap the pill to open it again.
   3. Outside the app: "Float" pops the timer into a small always-on-top window (Picture-in-Picture). Browsers only allow that after a tap,
      so it cannot start by itself. When you leave the app with the timer running, a notification shows how long you have studied. */
(function(){
 const K='acelife:tpos',clamp=(v,a,b)=>Math.min(Math.max(v,a),Math.max(a,b)),mode=()=>V.mn?'m':'n';
 window.TPOS=(()=>{try{return JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){return{}}})();
 const keep=()=>{try{localStorage.setItem(K,JSON.stringify(TPOS))}catch(e){}},tr=o=>'translate('+o.x+'px,'+o.y+'px)';
 window.tpStyle=()=>{const o=TPOS[mode()];return o&&Number.isFinite(o.x)&&Number.isFinite(o.y)?'transform:'+tr(o)+';':''};
 window.fxPos=()=>{const p=document.getElementById('lvp'),o=TPOS[mode()];if(!p||!o||p.classList.contains('full'))return;
  const r=p.getBoundingClientRect(),bl=r.left-o.x,bt=r.top-o.y,n={x:clamp(o.x,4-bl,innerWidth-bl-r.width-4),y:clamp(o.y,4-bt,innerHeight-bt-r.height-4)};
  if(n.x!==o.x||n.y!==o.y){TPOS[mode()]=n;p.style.transform=tr(n)}};
 addEventListener('resize',fxPos);
 let d=null;
 document.addEventListener('pointerdown',e=>{const p=e.target.closest&&e.target.closest('.live');if(!p||p.classList.contains('full')||e.target.closest('button')||e.button>0)return;
  const o=TPOS[mode()]||{x:0,y:0},r=p.getBoundingClientRect();d={p,id:e.pointerId,sx:e.clientX,sy:e.clientY,o,bl:r.left-o.x,bt:r.top-o.y,w:r.width,h:r.height,m:false,n:o};try{p.setPointerCapture(e.pointerId)}catch(x){}});
 document.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(!d.m&&Math.hypot(dx,dy)<8)return;d.m=true;
  d.n={x:clamp(d.o.x+dx,4-d.bl,innerWidth-d.bl-d.w-4),y:clamp(d.o.y+dy,4-d.bt,innerHeight-d.bt-d.h-4)};d.p.style.transform=tr(d.n)});
 const end=e=>{if(!d||e.pointerId!==d.id)return;if(d.m){TPOS[mode()]=d.n;keep();V.dg=Date.now()}d=null};
 document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
 document.addEventListener('click',e=>{if(Date.now()-(V.dg||0)<350&&e.target.closest&&e.target.closest('.live')){e.stopImmediatePropagation();e.preventDefault()}},true);   // a drag must not count as a tap
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.id==='lvp'&&e.target.classList.contains('mini')){e.preventDefault();A.mini()}});

 /* ---- outside the app ---- */
 const NT='timer-live',stage=el=>TH[thIdx(el/60)];
 const Float={w:null,v:null,iv:0,nv:0,
  ok:()=>!!(window.documentPictureInPicture||(document.pictureInPictureEnabled&&window.HTMLVideoElement&&HTMLVideoElement.prototype.requestPictureInPicture)),
  async open(){if(!S||!S.timer)return;if(Float.w||Float.v){Float.close();return}
   if(window.Notification&&Notification.permission==='default')try{await Notification.requestPermission()}catch(e){}
   if(window.documentPictureInPicture){try{await Float.doc();return}catch(e){}}
   try{await Float.vid()}catch(e){toast('The floating timer is not available in this browser. A notification will show your time when you leave the app.')}},
  async doc(){const w=await documentPictureInPicture.requestWindow({width:280,height:170}),h=w.document;Float.w=w;
   h.head.insertAdjacentHTML('beforeend','<style>html,body{margin:0;height:100%}body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-family:system-ui,sans-serif;color:#fff;background:#0B3A5B;transition:background-color 1.5s}#t{font-size:44px;font-weight:800;font-variant-numeric:tabular-nums}#s{font-weight:700;font-size:14px}button{min-height:36px;padding:0 18px;border:0;border-radius:10px;background:#FF7A6B;font-weight:700;cursor:pointer}</style>');
   h.body.innerHTML='<div id="s"></div><div id="t">00:00:00</div><button id="x">Stop</button>';
   h.getElementById('x').onclick=()=>{w.close();A.timer()};
   const up=()=>{const T=S&&S.timer;if(!T){w.close();return}const el=Math.floor(stMs(T)/1e3),g=stage(el);h.body.style.backgroundColor=g[3];h.getElementById('t').textContent=clk(el);const s=h.getElementById('s');s.textContent=g[1];s.style.color=g[2]};
   up();Float.iv=setInterval(up,1000);w.addEventListener('pagehide',Float.clean)},
  async vid(){const c=document.createElement('canvas');c.width=480;c.height=270;const x=c.getContext('2d'),v=document.createElement('video');v.muted=true;v.playsInline=true;
   v.style.cssText='position:fixed;left:0;top:0;width:2px;height:2px;opacity:.01;pointer-events:none';document.body.appendChild(v);
   const draw=()=>{const T=S&&S.timer;if(!T){Float.close();return}const el=Math.floor(stMs(T)/1e3),g=stage(el),t=T.taskId&&byId(T.taskId);
    x.fillStyle=g[3];x.fillRect(0,0,480,270);x.textAlign='center';x.fillStyle=g[2];x.font='700 30px system-ui,sans-serif';x.fillText(g[1],240,70);
    x.fillStyle='#fff';x.font='800 104px system-ui,sans-serif';x.fillText(clk(el),240,175);x.font='400 24px system-ui,sans-serif';x.fillStyle='rgba(255,255,255,.8)';x.fillText((t?t.subject:'General study').slice(0,34),240,225)};
   draw();v.srcObject=c.captureStream(5);await v.play();await v.requestPictureInPicture();Float.v=v;Float.iv=setInterval(draw,1000);v.addEventListener('leavepictureinpicture',Float.clean)},
  clean(){clearInterval(Float.iv);if(Float.v)Float.v.remove();Float.w=Float.v=null},
  close(){const w=Float.w;Float.clean();try{if(w)w.close()}catch(e){}try{if(document.pictureInPictureElement)document.exitPictureInPicture().catch(()=>{})}catch(e){}},
  async note(){if(!S||!S.timer||!window.Notification||Notification.permission!=='granted'||!navigator.serviceWorker)return;
   try{const r=await navigator.serviceWorker.ready,T=S.timer,el=Math.floor(stMs(T)/1e3),t=T.taskId&&byId(T.taskId);
    await r.showNotification('Timer running: '+hm(el/60)+' studied',{body:(t?t.subject+': '+t.topic:'General study')+'\nStarted '+new Date(T.start).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+'. Tap to go back to AceLife.',tag:NT,renotify:false,silent:true,requireInteraction:true,icon:'icon-192.png',badge:'icon-192.png'})}catch(e){}},
  async clear(){try{const r=await navigator.serviceWorker.ready,L=await r.getNotifications({tag:NT});L.forEach(n=>n.close())}catch(e){}},
  stopped(){Float.close();clearInterval(Float.nv);Float.clear()}};
 window.Float=Float;
 document.addEventListener('visibilitychange',()=>{if(!S||!S.timer)return;
  if(document.visibilityState==='hidden'){Float.note();clearInterval(Float.nv);Float.nv=setInterval(Float.note,6e4)}
  else{clearInterval(Float.nv);Float.clear()}});
 try{navigator.mediaSession.setActionHandler('enterpictureinpicture',()=>{if(S&&S.timer)Float.open()})}catch(e){}   // lets supporting browsers float it automatically when you switch away
 Object.assign(A,{float:()=>Float.open()});
})();
