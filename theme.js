/* THEME (v12). Loaded in <head> so the colours are right before anything is drawn.
   Modes: system (default, follows the phone), light, dark, hours (colourful: the palette changes with the time of day).
   The choice is saved on this device only. The button in the top-right corner of every tab opens the picker. */
(function(){
 const K='acelife:theme',R=document.documentElement,MODES=['system','light','dark','hours'];
 const NAME={system:'System',light:'Light',dark:'Dark',hours:'Colourful'},SUB={system:'Matches your phone setting',light:'Always light',dark:'Always dark',hours:'A new colour mood every 5 minutes'};
/* "Colourful": a new palette every 5 minutes, cycling through these. [name, dark?, colours] */
 const mk=(n,d,bg,sf,tx,mu,ln,pr,h1,h2,soft,ac,pt)=>[n,d,{'--bg':bg,'--sf':sf,'--tx':tx,'--mu':mu,'--ln':ln,'--pr':pr,'--pt':pt||(d?'#0B1020':'#FFFFFF'),'--h1':h1,'--h2':h2,'--soft':soft,'--ac':ac}];
 const P=[
  mk('Aurora',0,'#EFF9F6','#FFFFFF','#0F2A27','#4A6B66','#CBE7DF','#0E7C6B','#0E7C6B','#2BB39A','#D8F3EC','#E8A200'),
  mk('Sunrise',0,'#FFF3EA','#FFFFFF','#3A2118','#7A5A4C','#F2D6C4','#C2552B','#C2552B','#F08A5D','#FFE4D3','#E8A200'),
  mk('Ocean',0,'#EBF5FF','#FFFFFF','#0E2438','#4B6479','#CBE0F3','#0F5FA8','#0F5FA8','#38A0E8','#D9ECFF','#F2A900'),
  mk('Lavender',0,'#F5F0FF','#FFFFFF','#241639','#65558A','#DDD2F3','#6B3FC4','#6B3FC4','#A27BEA','#E9DEFF','#E8A200'),
  mk('Rose',0,'#FFF0F4','#FFFFFF','#3A1522','#7C5260','#F3CFDA','#C2185B','#C2185B','#F06292','#FFDCE7','#F2A900'),
  mk('Meadow',0,'#F3F9EC','#FFFFFF','#1B2A12','#556B45','#D8E8C6','#3F7D1F','#3F7D1F','#7BBF4A','#E3F2D2','#E8A200'),
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
 window.topBar=()=>`<div class="tbar"><span id="lvs">${typeof liveBox==='function'?liveBox():''}</span></div>`;
 window.themeBtn=()=>`<button type="button" class="thb m-${T.get()}" data-a="theme" aria-label="Theme: ${T.label()}. Tap to change.">${svg(T.get())}</button>`;   // shown beside the greeting on the Today tab only
 window.themeCard=()=>`<section class="card"><div class="row sp"><span><b>Appearance</b><br><span class="sm mu">${T.label()}</span></span><button type="button" class="btn o s" data-a="theme">Change</button></div></section>`;
 T.hook=()=>{Object.assign(A,{
  theme:()=>{const cur=T.get();sheet(`<h2>Choose a theme</h2><div class="thm">${MODES.map(m=>`<button type="button" class="tho m-${m}${m===cur?' on':''}" data-a="thset" data-v="${m}" aria-pressed="${m===cur}"><span class="sw">${svg(m)}</span><span><b>${NAME[m]}${m==='system'?' (default)':''}</b><br><span class="sm mu">${SUB[m]}</span></span></button>`).join('')}</div><button class="btn o w" data-a="x" style="margin-top:12px">Close</button>`)},
  thset:d=>{T.set(d.v);vib(8);closeSheet();render();toast('Theme: '+T.label())}})};
})();
