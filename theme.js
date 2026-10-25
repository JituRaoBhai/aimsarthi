/* THEME (v12). Loaded in <head> so the colours are right before anything is drawn.
   Modes: system (default, follows the phone), light, dark, hours (colourful: the palette changes with the time of day).
   The choice is saved on this device only. The button in the top-right corner of every tab opens the picker. */
(function(){
 const K='acelife:theme',R=document.documentElement,MODES=['system','light','dark','hours'];
 const NAME={system:'System',light:'Light',dark:'Dark',hours:'Colourful'},SUB={system:'Matches your phone setting',light:'Always light',dark:'Always dark',hours:'Changes through the day'};
 /* palettes for "colourful": [from hour, name, dark?, colours] */
 const P=[
  [5,'Dawn',0,{'--bg':'#FFF4EC','--sf':'#FFFFFF','--tx':'#3A2118','--mu':'#7A5A4C','--ln':'#F0D5C4','--pr':'#B8512E','--pt':'#FFFFFF','--h1':'#B8512E','--h2':'#E07A4F','--soft':'#FFE6D6','--ac':'#E8A200'}],
  [8,'Morning',0,{'--bg':'#EEF7FF','--sf':'#FFFFFF','--tx':'#10263A','--mu':'#4B6479','--ln':'#CFE2F3','--pr':'#0F5E9C','--pt':'#FFFFFF','--h1':'#0F5E9C','--h2':'#2F8FD8','--soft':'#DCEEFF','--ac':'#E8A200'}],
  [12,'Afternoon',0,{'--bg':'#F1FAF3','--sf':'#FFFFFF','--tx':'#102A1D','--mu':'#4A6A58','--ln':'#CDE6D6','--pr':'#17794E','--pt':'#FFFFFF','--h1':'#17794E','--h2':'#2FAA73','--soft':'#DDF3E5','--ac':'#E8A200'}],
  [16,'Evening',0,{'--bg':'#FBF1FA','--sf':'#FFFFFF','--tx':'#2C1236','--mu':'#69507A','--ln':'#E6CFE4','--pr':'#7B2FA3','--pt':'#FFFFFF','--h1':'#7B2FA3','--h2':'#C0509A','--soft':'#F1DDF0','--ac':'#F2994A'}],
  [19,'Night',1,{'--bg':'#0B1020','--sf':'#141A33','--tx':'#E8ECFF','--mu':'#9AA5D1','--ln':'#2A3260','--pr':'#8FA2FF','--pt':'#0B1020','--h1':'#1B2A6B','--h2':'#3A4FB8','--soft':'#1E2650','--ac':'#F2B429'}]];
 const period=()=>{const h=new Date().getHours();return h>=19||h<5?P[4]:P.filter(p=>h>=p[0]).pop()};
 const T={mode:'system',get(){let m='system';try{m=localStorage.getItem(K)||'system'}catch(e){}return MODES.includes(m)?m:'system'},
  apply(){const m=T.mode=T.get(),VARS=['--bg','--sf','--tx','--mu','--ln','--pr','--pt','--h1','--h2','--soft','--ac'];
   VARS.forEach(v=>R.style.removeProperty(v));
   if(m==='system')R.removeAttribute('data-theme');
   else if(m==='light'||m==='dark')R.setAttribute('data-theme',m);
   else{const p=period();R.setAttribute('data-theme',p[2]?'dark':'light');VARS.forEach(v=>R.style.setProperty(v,p[3][v]));T.pn=p[1]}
   const c=getComputedStyle(R).getPropertyValue('--h1').trim()||'#27348B',mt=document.querySelector('meta[name=theme-color]');if(mt)mt.setAttribute('content',c)},
  set(m){try{localStorage.setItem(K,m)}catch(e){}T.apply()},
  label(){return NAME[T.get()]+(T.get()==='hours'&&T.pn?' ('+T.pn+')':'')}};
 window.Theme=T;T.apply();
 setInterval(()=>{if(T.get()==='hours')T.apply()},6e5);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&T.get()==='hours')T.apply()});
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
