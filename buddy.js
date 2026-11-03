/* PIP, the little walking mascot (v31). Loaded after guide.js. Pip lives on the page itself: he walks along the top edge of the cards, hops between them, climbs up their sides, waves and sits. Different screens have different cards, so he does different things in every section. He never blocks a tap (pointer-events: none), hides while a window, test, timer screen or the setup is open, runs at a lower frame rate on slow phones, and stays away when the phone asks for less motion. Switch him off any time: Profile > Appearance > Mascot. */
(function(){
  const K='tasky:pip',R=document.documentElement;
  const isOff=()=>{try{return localStorage.getItem(K)==='off'}catch(e){return false}};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const SVG = `<svg viewBox="0 0 36 44" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#6CF5D6"/>
        <stop offset="1" stop-color="#17A996"/>
      </linearGradient>
    </defs>
    <ellipse class="psh" cx="18" cy="42.5" rx="9" ry="1.8"/>
    <g class="pm">
      <g class="ln">
        <path class="lg lg1" d="M15 29l-1 8" fill="none" stroke="#264653" stroke-width="2.8" stroke-linecap="round"/>
        <path class="lg lg2" d="M21 29l1 8" fill="none" stroke="#264653" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M14 36.5l-2 2.5q0 1.5 2 1.5h3l.5-2" fill="#334E68" stroke="#17324D" stroke-width=".8" stroke-linejoin="round"/>
        <path d="M22 36.5l2 2.5q0 1.5-2 1.5h-3l-.5-2" fill="#334E68" stroke="#17324D" stroke-width=".8" stroke-linejoin="round"/>
        <circle class="ft ft1" cx="14" cy="40" r="1.2" fill="#F4B942"/>
        <circle class="ft ft2" cx="22" cy="40" r="1.2" fill="#F4B942"/>
      </g>

      <path d="M22.5 15.5q4-1 5 2l.5 9-4 1-3-7z" fill="#31556B" stroke="#17324D" stroke-width="1"/>
      <path d="M25 18c4 0 4 4 1 4s-3 3 0 3-1 4-3 2" fill="none" stroke="#F4B942" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M16 12h4v3h-4z" fill="#D99A70"/>
      <path d="M12.5 16q1-2 4-2h3q3 0 4 2l1.5 10q-3 3-7.5 3t-7.5-3z" fill="url(#pg)" stroke="#174E50" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M15 15.5l3 2 3-2 2 2-2 3v6h-6v-6l-2-3z" fill="#E8F4EE" opacity=".9"/>
      <path d="M16 22h4v4h-4z" fill="#F4B942" stroke="#8A5D18" stroke-width=".6"/>
      <path d="M18 22v4" stroke="#8A5D18" stroke-width=".6"/>

      <g class="ln">
        <path class="ar ar1" d="M12 17l-4 4.5-1 3" fill="none" stroke="#17A996" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="ar ar2" d="M24 17l4 3.5 1 3" fill="none" stroke="#17A996" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="7" cy="25" r="1.5" fill="#F4B942" stroke="#8A5D18" stroke-width=".6"/>
        <circle cx="29" cy="24" r="1.5" fill="#F4B942" stroke="#8A5D18" stroke-width=".6"/>
      </g>

      <path class="tu" d="M20 25q3 1 2 3t-3 0" fill="none" stroke="#F4B942" stroke-width="1" stroke-linecap="round"/>
      <circle cx="18" cy="9" r="5.2" fill="#D99A70" stroke="#744B3A" stroke-width=".7"/>
      <path d="M12.3 8.3q.7-5.2 5.8-5.2t5.6 5.2h-2l-.8-1.2q-2.7 1.5-6.7.7l-.5 1.1z" fill="#F4B942" stroke="#8A5D18" stroke-width=".8" stroke-linejoin="round"/>
      <path d="M12.4 8.5h11.2" fill="none" stroke="#8A5D18" stroke-width="1" stroke-linecap="round"/>
      <ellipse class="pe" cx="16" cy="10" rx="1.1" ry="1.3" fill="#fff"/>
      <ellipse class="pe" cx="20" cy="10" rx="1.1" ry="1.3" fill="#fff"/>
      <circle class="pp" cx="16.3" cy="10.3" r=".6" fill="#12324A"/>
      <circle class="pp" cx="20.3" cy="10.3" r=".6" fill="#12324A"/>
      <path class="pmo" d="M16.5 12.5q1.5 1 3 0" fill="none" stroke="#744B3A" stroke-width=".7" stroke-linecap="round"/>
    </g>
  </svg>`;
  const EMO={home:'☀️',study:'📚',roadmap:'🎯',progress:'📈',profile:'⚙️'};
  let el=null,bub=null,raf=0,last=0,plats=[],platAt=0,seg=null,q=[],lastTab='',hideT=0,bad=0;
  const p={x:60,y:0,f:1,pose:'idle',on:false};
  const nav=()=>document.querySelector('nav');
  const floor=()=>{const n=nav(),r=n&&!n.hidden?n.getBoundingClientRect():null;return scrollY+(r&&r.height?r.top:innerHeight)-1};
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a);
  const hidden=()=>document.hidden||isOff()||typeof ready==='undefined'||!ready||!S||!S.p.onboarded||sheetOpen()||!!document.getElementById('qx')||!!document.querySelector('.wz,.load,#busy.on')||!!(S.timer&&V.fs)||document.body.classList.contains('lvm');
  function refresh(){const f=floor(); plats=[...document.querySelectorAll('#app .card,#app .hero,#app .trw')].map(e=>{const r=e.getBoundingClientRect();return{l:r.left+scrollX,r:r.right+scrollX,t:r.top+scrollY}}) .filter(o=>o.r-o.l>90&&o.t>scrollY+56&&o.t<f-34).sort((a,b)=>a.t-b.t); plats.push({l:0,r:innerWidth,t:f,fl:1})}
  const ground=(x,y)=>{let b=null;for(const o of plats){if(x>=o.l-2&&x<=o.r+2&&Math.abs(o.t-y)<14&&(!b||Math.abs(o.t-y)<Math.abs(b.t-y)))b=o}return b};
  const below=x=>{let b=null;for(const o of plats){if(o.t>p.y+4&&x>=o.l&&x<=o.r&&(!b||o.t<b.t))b=o}return b||plats[plats.length-1]};
  const jumpTo=(x,y,h)=>({k:'jump',x1:x,y1:y,h:h==null?Math.min(60,24+Math.abs(x-p.x)*.25):h,dur:cl(.45+Math.abs(x-p.x)/420,.5,1)});
  function say(t){if(!bub)return;bub.textContent=t;bub.classList.add('on');clearTimeout(hideT);hideT=setTimeout(()=>bub.classList.remove('on'),2400)}
  function drop(){const f=floor(),vis=plats.filter(o=>o.t>scrollY+90&&o.t<f-40),t=vis.length&&Math.random()<.7?vis[Math.floor(Math.random()*vis.length)]:plats[plats.length-1]; p.x=cl(rnd(t.l+20,t.r-20),16,innerWidth-16);p.y=scrollY-30;seg=null;q=[jumpTo(p.x,t.t,0)]}
  function plan(){const here=ground(p.x,p.y); if(!here){q=[jumpTo(p.x,below(p.x).t,8)];return} const r=Math.random(),w=here.r-here.l; if(r<.3&&w>80){q=[{k:'walk',x:cl(rnd(here.l+16,here.r-16),12,innerWidth-12)}];return} if(r<.45){q=[{k:'idle',dur:rnd(1.4,3),pose:Math.random()<.5?'wave':'idle'}];return} const cs=plats.filter(o=>o!==here&&Math.abs(o.t-p.y)<320&&!o.fl); if(!cs.length||r<.55){q=[{k:'walk',x:cl(rnd(12,innerWidth-12),here.l+10,here.r-10)}];return} const c=cs[Math.floor(Math.random()*cs.length)]; if(c.t>=p.y-6){const tx=cl(rnd(c.l+16,c.r-16),12,innerWidth-12),sx=cl(tx,here.l+12,here.r-12);q=[{k:'walk',x:sx},jumpTo(tx,c.t)];return} const side=Math.abs(p.x-c.l)<Math.abs(p.x-c.r)?-1:1,wx=side<0?Math.max(11,c.l-4):Math.min(innerWidth-11,c.r+4),sx=cl(wx,here.l+12,here.r-12); q=[{k:'walk',x:sx}];if(Math.abs(wx-sx)>6)q.push(jumpTo(wx,p.y,14)); q.push({k:'climb',y1:c.t,wall:side},{k:'walk',x:side<0?c.l+20:c.r-20})}
  function run(dt){ if(!seg){seg=q.shift()||(plan(),q.shift());if(!seg)return;seg.t=0;if(seg.k==='jump'){seg.x0=p.x;seg.y0=p.y}} seg.t+=dt; if(seg.k==='walk'){const d=seg.x-p.x,m=36*dt;p.pose='walk';if(Math.abs(d)<=m){p.x=seg.x;seg=null}else{p.x+=Math.sign(d)*m;p.f=Math.sign(d)||p.f}const g=ground(p.x,p.y);if(g)p.y=g.fl?floor():g.t} else if(seg.k==='idle'){p.pose=seg.pose;const g=ground(p.x,p.y);if(g)p.y=g.fl?floor():g.t;if(seg.t>=seg.dur)seg=null} else if(seg.k==='climb'){p.pose='climb';p.f=seg.wall<0?1:-1;p.y-=46*dt;if(p.y<=seg.y1){p.y=seg.y1;seg=null}} else if(seg.k==='jump'){const t=Math.min(1,seg.t/seg.dur);p.pose='jump';p.f=seg.x1>=seg.x0?1:-1;if(Math.abs(seg.x1-seg.x0)<2)p.f=p.f;p.x=seg.x0+(seg.x1-seg.x0)*t;p.y=seg.y0+(seg.y1-seg.y0)*t-4*seg.h*t*(1-t);if(t>=1){p.x=seg.x1;p.y=seg.y1;seg=null;const g=ground(p.x,p.y);if(g&&g.fl)p.y=floor()}}}
  function draw(){el.className='pip '+p.pose+(p.f<0?' fl':'');el.style.transform='translate3d('+(p.x-16).toFixed(1)+'px,'+(p.y-41).toFixed(1)+'px,0)'}
  function step(now){raf=requestAnimationFrame(step);if(now-last<(R.classList.contains('lite')?66:32))return;const dt=Math.min(.1,(now-last)/1e3);last=now; try{if(hidden()){el.style.opacity=0;return} if(el.style.opacity!=='1')el.style.opacity=1; if(now-platAt>450){refresh();platAt=now; if(V.tab!==lastTab){const first=!lastTab;lastTab=V.tab;if(!first){say(EMO[V.tab]||'');drop()}} if(p.y<scrollY+40||p.y>scrollY+innerHeight+10){drop()}} run(dt);draw();bad=0}catch(e){if(++bad>20){cancelAnimationFrame(raf);el.remove()}}}
  function start(){if(el)return;el=document.createElement('div');el.id='pip';el.className='pip idle';el.setAttribute('aria-hidden','true');el.innerHTML=SVG+'<b class="pb"></b>';document.body.appendChild(el);bub=el.querySelector('.pb');el.style.opacity=0;p.y=floor();raf=requestAnimationFrame(step)}
  window.Buddy={on:()=>!isOff(),toggle(){try{localStorage.setItem(K,isOff()?'on':'off')}catch(e){}if(!isOff())drop();}};
  Object.assign(A,{pip:()=>{Buddy.toggle();render();toast(Buddy.on()?'Pip is back':'Pip is resting')}});
  setTimeout(start,2500);
})();
