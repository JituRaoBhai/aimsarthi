/* THEME (v12). Loaded in <head> so the colours are right before anything is drawn.
   Modes: system (default, follows the phone), light, dark, hours (colourful: the palette changes with the time of day).
   The choice is saved on this device only. The button in the top-right corner of every tab opens the picker. */
(function(){
 const K='acelife:theme',R=document.documentElement,MODES=['system','light','dark','hours'];
 const NAME={system:'System',light:'Light',dark:'Dark',hours:'Colourful'},SUB={system:'Matches your phone setting',light:'Always light',dark:'Always dark',hours:'A new colour mood every 5 minutes'};
/* "Colourful": a new palette every 5 minutes, cycling through these. [name, dark?, colours] */
 const mk=(n,d,bg,sf,tx,mu,ln,pr,h1,h2,soft,ac,pt)=>[n,d,{'--bg':bg,'--sf':sf,'--tx':tx,'--mu':mu,'--ln':ln,'--pr':pr,'--pt':pt||(d?'#0B1020':'#FFFFFF'),'--h1':h1,'--h2':h2,'--soft':soft,'--ac':ac}];
 const P=[
  mk('Aurora',0,'#EFF9F6','#F7F6F3','#0F2A27','#4A6B66','#CBE7DF','#0E7C6B','#0E7C6B','#2BB39A','#D8F3EC','#E8A200'),
  mk('Sunrise',0,'#FFF3EA','#F7F6F3','#3A2118','#7A5A4C','#F2D6C4','#C2552B','#C2552B','#F08A5D','#FFE4D3','#E8A200'),
  mk('Ocean',0,'#EBF5FF','#F7F6F3','#0E2438','#4B6479','#CBE0F3','#0F5FA8','#0F5FA8','#38A0E8','#D9ECFF','#F2A900'),
  mk('Lavender',0,'#F5F0FF','#F7F6F3','#241639','#65558A','#DDD2F3','#6B3FC4','#6B3FC4','#A27BEA','#E9DEFF','#E8A200'),
  mk('Rose',0,'#FFF0F4','#F7F6F3','#3A1522','#7C5260','#F3CFDA','#C2185B','#C2185B','#F06292','#FFDCE7','#F2A900'),
  mk('Meadow',0,'#F3F9EC','#F7F6F3','#1B2A12','#556B45','#D8E8C6','#3F7D1F','#3F7D1F','#7BBF4A','#E3F2D2','#E8A200'),
  mk('Twilight',1,'#120F26','#1B1740','#EDE9FF','#A9A2D6','#322C63','#B39DFF','#3B2C8F','#7357E0','#2A2458','#FFC857'),
  mk('Midnight',1,'#0A1222','#111C36','#E6EEFF','#97A9D1','#233256','#7CB8FF','#14357A','#2F6FDB','#1A2A4E','#F2B429'),
  mk('Ember',1,'#1C1210','#2A1A16','#FFEDE6','#D2A99B','#4A2C25','#FF9A6B','#8A2F17','#E0592A','#3A211B','#FFC857'),
  mk('Teal Night',1,'#09191B','#10272A','#E3F8F5','#93BFBA','#1D3F43','#4DD6C0','#0B5A55','#1A9E92','#163538','#F2B429')];
 const slot=()=>Math.floor(Date.now()/3e5)%P.length,period=()=>P[slot()];
 const T={mode:'system',get(){let m='system';try{m=localStorage.getItem(K)||'system'}catch(e){}return MODES.includes(m)?m:'system'},
  apply(){const m=T.mode=T.get(),VARS=['--bg','--sf','--tx','--mu','--ln','--pr','--pt','--h1','--h2','--soft','--ac'];
   VARS.forEach(v=>R.style.removeProperty(v));if(m!=='hours')R.classList.remove('thfade');
   if(m==='system')R.removeAttribute('data-theme');
   else if(m==='light'||m==='dark')R.setAttribute('data-theme',m);
   else{const p=period();R.classList.add('thfade');R.setAttribute('data-theme',p[1]?'dark':'light');VARS.forEach(v=>R.style.setProperty(v,p[2][v]));T.pn=p[0]}
   const c=getComputedStyle(R).getPropertyValue('--h1').trim()||'#27348B',mt=document.querySelector('meta[name=theme-color]');if(mt)mt.setAttribute('content',c)},
  set(m){try{localStorage.setItem(K,m)}catch(e){}T.apply()},
  label(){return NAME[T.get()]+(T.get()==='hours'&&T.pn?' ('+T.pn+')':'')}};
 window.Theme=T;T.apply();
 setInterval(()=>{if(T.get()==='hours'&&T.sl!==slot()){T.sl=slot();T.apply()}},15e3);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&T.get()==='hours')T.apply()});
 matchMedia('(prefers-color-scheme: dark)').addEventListener&&matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(T.get()==='system')T.apply()});

 const IC={
  system:'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 010 16z" fill="currentColor"/>',
  light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  dark:'<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',
  hours:'<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'};
 const svg=m=>`<svg viewBox="0 0 24 24" aria-hidden="true">${IC[m]}</svg>`;
 /* the slim bar at the top of every tab: live-students pill (live.js) on the left, theme button on the right */
 const ZAP='<span class="zap" data-a="zap" role="img" aria-label="Zap, the Tasky mascot. Tap me."><svg viewBox="0 0 40 44" aria-hidden="true" focusable="false"><defs><radialGradient id="zg" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFF3A8"/><stop offset=".55" stop-color="#FFC94A"/><stop offset="1" stop-color="#FF9A3C"/></radialGradient></defs><ellipse class="zsh" cx="20" cy="42" rx="11" ry="2"/><g class="zb"><path class="zt" d="M23 0 14 12h5.5l-2 7L27 8h-5.5z"/><circle cx="20" cy="27" r="15" fill="url(#zg)"/><circle cx="9.5" cy="31" r="2.3" fill="#FF6B6B" opacity=".45"/><circle cx="30.5" cy="31" r="2.3" fill="#FF6B6B" opacity=".45"/><g class="ze"><ellipse cx="14.5" cy="25" rx="3.6" ry="4.2" fill="#fff"/><ellipse cx="25.5" cy="25" rx="3.6" ry="4.2" fill="#fff"/><circle class="zp" cx="14.5" cy="25.5" r="2.1" fill="#1B2040"/><circle class="zp" cx="25.5" cy="25.5" r="2.1" fill="#1B2040"/></g><path class="zm" d="M15.5 32q4.5 3.8 9 0" fill="none" stroke="#7A3B00" stroke-width="1.6" stroke-linecap="round"/><text class="zz" x="31" y="14" font-size="9" font-weight="800" fill="#fff">z</text></g><circle class="zs s1" cx="4" cy="12" r="1.5"/><circle class="zs s2" cx="36" cy="16" r="1.3"/><circle class="zs s3" cx="35" cy="38" r="1.5"/></svg></span>';
 /* the slim bar at the top of every tab: Zap the mascot + name on the left, live-students pill (live.js) on the right */
 window.topBar=()=>`<div class="tbar"><div class="brand">${ZAP}<b>Tasky</b></div><span id="lvs">${typeof liveBox==='function'?liveBox():''}</span></div>`;
 /* ---- Zap comes alive: eyes follow your finger, blinks, sleeps at night, cheers when a task is ticked, talks when tapped ---- */
 const Z={n:null,bub:null,hide:0,px:0,py:0,raf:0,ex:0,ey:0};
 const LINES={cheer:['Nice one! ⚡','Boom! Task done','Keep it up!','You are on fire!','One more down!'],tap:['Hi! Ready to study?','Small steps, big marks.','Take a sip of water.','Focus for 25 minutes?','Zzzap! Let’s go.','Revision beats worry.'],night:['Sleep is part of studying.','Rest well. See you tomorrow.']};
 const pick=a=>a[Math.floor(Math.random()*a.length)],hrs=()=>new Date().getHours(),isNight=()=>hrs()>=23||hrs()<5;
 const say=(t,ms)=>{const b=Z.bub;if(!b)return;b.textContent=t;b.classList.add('on');clearTimeout(Z.hide);Z.hide=setTimeout(()=>b.classList.remove('on'),ms||2600)};
 const cheer=t=>{const z=document.querySelector('.zap');if(z){z.classList.remove('cheer');void z.offsetWidth;z.classList.add('cheer');setTimeout(()=>z.classList.remove('cheer'),1000)}if(t!==false)say(t||pick(LINES.cheer))};
 const look=()=>{Z.raf=0;const z=document.querySelector('.zap');if(z){z.style.setProperty('--ex',Z.ex.toFixed(2)+'px');z.style.setProperty('--ey',Z.ey.toFixed(2)+'px')}
  if(Z.n){Z.n.style.setProperty('--px',Z.px.toFixed(3));Z.n.style.setProperty('--py',Z.py.toFixed(3))}
  const h=document.querySelector('.hero');if(h&&!R.classList.contains('lite'))h.style.transform='perspective(760px) rotateX('+(-Z.py*3).toFixed(2)+'deg) rotateY('+(Z.px*4).toFixed(2)+'deg)'};
 const aim=(x,y)=>{const w=innerWidth||360,h=innerHeight||640;Z.px=Math.max(-1,Math.min(1,(x/w-.5)*2));Z.py=Math.max(-1,Math.min(1,(y/h-.5)*2));
  const z=document.querySelector('.zap');if(z){const r=z.getBoundingClientRect(),dx=x-(r.left+r.width/2),dy=y-(r.top+r.height/2),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/90)*1.7;Z.ex=dx/d*k;Z.ey=dy/d*k}
  if(!Z.raf)Z.raf=requestAnimationFrame(look)};
 let wired=0,lastDone=-1;
 window.zapTick=()=>{try{
  if(!Z.n){Z.n=document.createElement('div');Z.n.id='fx3';Z.n.setAttribute('aria-hidden','true');Z.n.innerHTML='<div class="o o1"><i></i></div><div class="o o2"><i></i></div><div class="o o3"><i></i></div>';document.body.insertBefore(Z.n,document.body.firstChild);
   Z.bub=document.createElement('div');Z.bub.className='zsay';Z.bub.setAttribute('role','status');document.body.appendChild(Z.bub)}
  if(!wired){wired=1;
   addEventListener('pointermove',e=>aim(e.clientX,e.clientY),{passive:true});addEventListener('touchstart',e=>{const t=e.touches[0];if(t)aim(t.clientX,t.clientY)},{passive:true});
   addEventListener('deviceorientation',e=>{if(e.gamma==null)return;Z.px=Math.max(-1,Math.min(1,e.gamma/30));Z.py=Math.max(-1,Math.min(1,((e.beta||0)-45)/30));if(!Z.raf)Z.raf=requestAnimationFrame(look)},{passive:true});
   setInterval(()=>{if(document.hidden)return;Z.ex=(Math.random()-.5)*3.2;Z.ey=(Math.random()-.3)*2;if(!Z.raf)Z.raf=requestAnimationFrame(look)},5200)}
  const z=document.querySelector('.zap');if(z)z.dataset.m=isNight()?'sleep':'';
  const d=(window.S&&S.tasks?S.tasks.filter(t=>t.status==='done').length:0);
  if(lastDone>=0&&d>lastDone)cheer();else if(lastDone<0&&z){const g=hrs()<12?'Good morning!':hrs()<17?'Good afternoon!':hrs()<22?'Good evening!':'Still up? Rest soon.';setTimeout(()=>say(g+' ⚡',2400),900)}
  lastDone=d}catch(e){}};
 window.themeBtn=()=>`<button type="button" class="thb m-${T.get()}" data-a="theme" aria-label="Theme: ${T.label()}. Tap to change.">${svg(T.get())}</button>`;   // shown beside the greeting on the Today tab only
 window.themeCard=()=>`<section class="card"><div class="row sp"><span><b>Appearance</b><br><span class="sm mu">${T.label()}</span></span><button type="button" class="btn o s" data-a="theme">Change</button></div>${window.Bubbles?`<div class="row sp" style="margin-top:12px"><span><b>Bubbles</b><br><span class="sm mu">${Bubbles.on()?'Float up. Touch to pop':'Off'}</span></span><button type="button" class="btn o s" data-a="bub">${Bubbles.on()?'Turn off':'Turn on'}</button></div>`:''}${window.Buddy?`<div class="row sp" style="margin-top:12px"><span><b>Mascot Pip</b><br><span class="sm mu">${Buddy.on()?'Walks around the screen':'Resting'}</span></span><button type="button" class="btn o s" data-a="pip">${Buddy.on()?'Turn off':'Turn on'}</button></div>`:''}</section>`;
 T.hook=()=>{Object.assign(A,{
  zap:()=>{vib&&vib(10);cheer(isNight()?pick(LINES.night):pick(LINES.tap))},
  theme:()=>{const cur=T.get();sheet(`<h2>Choose a theme</h2><div class="thm">${MODES.map(m=>`<button type="button" class="tho m-${m}${m===cur?' on':''}" data-a="thset" data-v="${m}" aria-pressed="${m===cur}"><span class="sw">${svg(m)}</span><span><b>${NAME[m]}${m==='system'?' (default)':''}</b><br><span class="sm mu">${SUB[m]}</span></span></button>`).join('')}</div><button class="btn o w" data-a="x" style="margin-top:12px">Close</button>`)},
  thset:d=>{T.set(d.v);vib(8);closeSheet();render();toast('Theme: '+T.label())}})};
})();
