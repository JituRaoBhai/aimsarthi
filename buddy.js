/* PIP, the little walking mascot (v31). Loaded after guide.js. Pip lives on the page itself: he walks along the top edge of the cards, hops between them, climbs up their sides, waves and sits. Different screens have different cards, so he does different things in every section. He never blocks a tap (pointer-events: none), hides while a window, test, timer screen or the setup is open, runs at a lower frame rate on slow phones, and stays away when the phone asks for less motion. Switch him off any time: Profile > Appearance > Mascot. */
(function(){
const K='tasky:pip',R=document.documentElement;
const isOff=()=>{try{return localStorage.getItem(K)==='off'}catch(e){return false}};
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const SVG='<svg viewBox="0 0 36 44" aria-hidden="true" focusable="false">'
+'<style>'
+'.pip .ru,.pip .rj,.pip .hk{opacity:0}'
+'.pip.climb .ru,.pip.climb .hk,.pip.jump .rj,.pip.jump .hk{opacity:1}'
+'.pip .rt{transform-origin:25px 32px}.pip.climb .rt{opacity:0}'
+'.pip.walk .rt,.pip.walk .mg{animation:pipRope .5s ease-in-out infinite alternate}'
+'.pip .mg{transform-origin:7.4px 32.8px}'
+'.pip .lean{transform-origin:18px 41px;transition:transform .2s}'
+'.pip.climb .lean{transform:rotate(8deg)}.pip.jump .lean{transform:rotate(6deg)}'
+'.pip .bm{transform-origin:19px 9px;transition:transform .25s;animation:pipBeam 2.6s ease-in-out infinite alternate}'
+'.pip.climb .bm{transform:rotate(-32deg)}'
+'.pip .sc{transform-origin:11px 27.5px;animation:pipFlap 1.5s ease-in-out infinite alternate}'
+'.pip.walk .sc,.pip.jump .sc,.pip.climb .sc{animation-duration:.4s}'
+'.pip .fg{transform-origin:5.6px 3px;animation:pipFlag .8s ease-in-out infinite alternate}'
+'.pip .lid{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);animation:pipBlink 4.6s infinite}'
+'.pip .bp{opacity:0;transform-box:fill-box;transform-origin:50% 50%}'
+'.pip.idle .bp,.pip.wave .bp{animation:pipPuff 2.6s ease-out infinite}'
+'.pip .sp{transform-box:fill-box;transform-origin:50% 50%;animation:pipTwk 2s ease-in-out infinite}'
+'.lite .pip .sc,.lite .pip .bm,.lite .pip .fg,.lite .pip .lid,.lite .pip .bp,.lite .pip .sp,.lite .pip .rt,.lite .pip .mg{animation:none}'
+'@keyframes pipRope{from{transform:rotate(-12deg)}to{transform:rotate(14deg)}}'
+'@keyframes pipBeam{from{opacity:.5}to{opacity:1}}'
+'@keyframes pipFlap{from{transform:rotate(-6deg)}to{transform:rotate(8deg)}}'
+'@keyframes pipFlag{from{transform:skewY(-7deg)}to{transform:skewY(8deg)}}'
+'@keyframes pipBlink{0%,92%,100%{transform:scaleY(0)}95%{transform:scaleY(1)}}'
+'@keyframes pipPuff{0%{opacity:0;transform:translate(0,0) scale(.5)}25%{opacity:.8}100%{opacity:0;transform:translate(5px,-4px) scale(1.5)}}'
+'@keyframes pipTwk{0%,100%{opacity:.2;transform:scale(.5)}50%{opacity:1;transform:scale(1.1)}}'
+'</style>'
+'<defs>'
+'<linearGradient id="pjk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7A4D"/><stop offset="1" stop-color="#D9482A"/></linearGradient>'
+'<linearGradient id="psk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8B088"/><stop offset="1" stop-color="#B97A52"/></linearGradient>'
+'<linearGradient id="phl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFDA70"/><stop offset="1" stop-color="#E6A82E"/></linearGradient>'
+'<linearGradient id="ppk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1B6272"/><stop offset="1" stop-color="#2E93A6"/></linearGradient>'
+'<linearGradient id="pbm" gradientUnits="userSpaceOnUse" x1="19" y1="0" x2="36" y2="0"><stop offset="0" stop-color="#FFF6B0" stop-opacity=".75"/><stop offset="1" stop-color="#FFF6B0" stop-opacity="0"/></linearGradient>'
+'<linearGradient id="plg" gradientUnits="userSpaceOnUse" x1="0" y1="31" x2="0" y2="39"><stop offset="0" stop-color="#33456B"/><stop offset=".68" stop-color="#33456B"/><stop offset=".69" stop-color="#4A2F20"/><stop offset="1" stop-color="#4A2F20"/></linearGradient>'
+'<linearGradient id="pal" gradientUnits="userSpaceOnUse" x1="8" y1="23" x2="4" y2="28"><stop offset="0" stop-color="#E8552F"/><stop offset=".6" stop-color="#D9482A"/><stop offset=".61" stop-color="#3B2A22"/><stop offset="1" stop-color="#3B2A22"/></linearGradient>'
+'<linearGradient id="par" gradientUnits="userSpaceOnUse" x1="28" y1="23" x2="32" y2="28"><stop offset="0" stop-color="#E8552F"/><stop offset=".6" stop-color="#D9482A"/><stop offset=".61" stop-color="#3B2A22"/><stop offset="1" stop-color="#3B2A22"/></linearGradient>'
+'</defs>'
+'<ellipse class="psh" cx="18" cy="42.5" rx="9" ry="1.8"/>'
+'<g class="pm">'
/* grappling rope + hook: taut while climbing, thrown while jumping */
+'<path class="ru" d="M31.7 28V5.4" fill="none" stroke="#D9B77A" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="1.6 .5"/>'
+'<path class="rj" d="M31 27Q35.6 16 31.7 5.4" fill="none" stroke="#D9B77A" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="1.6 .5"/>'
+'<path class="hk" d="M29.6 1.4Q31.7 6 33.8 1.4M31.7 3.6V6" fill="none" stroke="#AEB8C2" stroke-width="1.5" stroke-linecap="round"/>'
+'<g class="lean">'
/* summit pennant on a pole, with a twinkle */
+'<path d="M5.6 21.4V1.6" stroke="#6B4A32" stroke-width="1.1" stroke-linecap="round"/>'
+'<g class="fg"><path d="M5.8 1.8L13.8 4.2L5.8 6.6Z" fill="#FFD23F" stroke="#A8741E" stroke-width=".7" stroke-linejoin="round"/><path d="M7.4 5.4l1.4-2 1 1.3.8-.9 1 1.6z" fill="#fff" opacity=".92"/></g>'
+'<path class="sp" d="M16 1.4l.55 1.3 1.3.55-1.3.55L16 5.1l-.55-1.3-1.3-.55 1.3-.55z" fill="#fff"/>'
/* ice axe + backpack + rope coil + mug */
+'<path d="M4.4 34.5L3.4 17.5" fill="none" stroke="#6B4A32" stroke-width="1.3" stroke-linecap="round"/>'
+'<path d="M.9 18.2Q3.4 14.4 7.2 16.2" fill="none" stroke="#AEB8C2" stroke-width="1.5" stroke-linecap="round"/>'
+'<path d="M4 22.5Q4 20.5 6.5 20.5H10.5V32.5H6Q4 32.5 4 30.5Z" fill="url(#ppk)" stroke="#12515E" stroke-width="1" stroke-linejoin="round"/>'
+'<rect x="4.7" y="25.6" width="4.6" height="4.6" rx="1" fill="none" stroke="#12515E" stroke-width=".8"/><path d="M5.6 27.6h2.8" stroke="#E8B04A" stroke-width=".9" stroke-linecap="round"/>'
+'<circle cx="8.2" cy="21.7" r="2.3" fill="none" stroke="#E2C58C" stroke-width="1.5"/><circle cx="8.2" cy="21.7" r="1.2" fill="none" stroke="#8A6A36" stroke-width=".7"/>'
+'<g class="mg"><rect x="5.6" y="33.4" width="3.6" height="3.4" rx=".7" fill="#C9D2DA" stroke="#6E7B86" stroke-width=".7"/><path d="M9.2 34.2q1.7.2 1.2 1.6q-.3.9-1.2.8" fill="none" stroke="#6E7B86" stroke-width=".8"/><path d="M7.4 32.5v.9" stroke="#2B2420" stroke-width=".7"/></g>'
/* legs (trousers + boots) */
+'<g class="ln"><path class="lg lg1" d="M14 31v8" style="fill:none;stroke:url(#plg);stroke-width:4.4;stroke-linecap:butt"/><path class="lg lg2" d="M22 31v8" style="fill:none;stroke:url(#plg);stroke-width:4.4;stroke-linecap:butt"/>'
+'<ellipse class="ft ft1" cx="14.6" cy="40" rx="3.2" ry="2.1" style="fill:#2B1A12;stroke:none"/><ellipse class="ft ft2" cx="22.6" cy="40" rx="3.2" ry="2.1" style="fill:#2B1A12;stroke:none"/></g>'
/* rope tail swinging from the harness */
+'<path class="rt" d="M24.5 33.6q3 2.6 1 5.4q-2 2.6 1.6 4.4" fill="none" stroke="#D9B77A" stroke-width="1.3" stroke-linecap="round"/>'
/* jacket, reflective stripe, rope bandolier, belt, carabiner */
+'<path d="M8.5 25Q18 22.5 27.5 25L28.5 33.2Q18 35.2 7.5 33.2Z" fill="url(#pjk)" stroke="#9C3118" stroke-width="1" stroke-linejoin="round"/>'
+'<path d="M18 24.2V34" stroke="#9C3118" stroke-width=".8" fill="none"/>'
+'<path d="M8 29.6Q18 31.4 28 29.6" stroke="#FFE9B0" stroke-width="1.1" fill="none" opacity=".9"/>'
+'<path d="M10.5 24.3L25.5 33" stroke="#8A6A36" stroke-width="2.8" fill="none"/>'
+'<path d="M10.5 24.3L25.5 33" stroke="#E2C58C" stroke-width="2.2" fill="none" stroke-dasharray="1.3 .7"/>'
+'<path d="M7.8 32.2Q18 34.2 28.2 32.2" stroke="#2B2420" stroke-width="2" fill="none"/>'
+'<rect x="21.4" y="31.1" width="3" height="3.6" rx="1.4" fill="none" stroke="#C9D2DA" stroke-width=".9"/>'
/* knitted scarf: flapping tail + neck wrap */
+'<g class="sc"><path d="M11.6 27Q7 25.6 2.6 28.4L3.8 31.2Q7.6 29 11.4 30Z" fill="#E23D4B" stroke="#A82234" stroke-width=".9" stroke-linejoin="round"/><path d="M6.2 27.1v3M8.9 27.4v2.7" stroke="#FFF1D6" stroke-width="1" stroke-linecap="round"/></g>'
+'<path d="M10.2 24.8Q18 28.4 25.8 24.8L26 28Q18 31.6 10 28Z" fill="#E23D4B" stroke="#A82234" stroke-width=".9" stroke-linejoin="round"/>'
+'<path d="M13 26.3v2.4M17.8 27v2.6M22.4 26.3v2.4" stroke="#FFF1D6" stroke-width="1.1" stroke-linecap="round"/>'
/* arms (sleeves + gloves) */
+'<g class="ln"><path class="ar ar1" d="M8 23l-4 5" style="fill:none;stroke:url(#pal);stroke-width:4.2;stroke-linecap:round"/><path class="ar ar2" d="M28 23l4 5" style="fill:none;stroke:url(#par);stroke-width:4.2;stroke-linecap:round"/></g>'
/* headlamp beam (tilts up while climbing) */
+'<path class="bm" d="M19 9.2L36 -2V20Z" fill="url(#pbm)"/>'
/* head */
+'<circle cx="9.3" cy="18.6" r="1.8" fill="#D39467" stroke="#8A5434" stroke-width=".8"/><circle cx="26.9" cy="18.6" r="1.8" fill="#D39467" stroke="#8A5434" stroke-width=".8"/>'
+'<circle cx="18" cy="17" r="9.2" fill="url(#psk)" stroke="#8A5434" stroke-width="1.2"/>'
+'<path d="M9.2 15.5Q9 20 10.8 22.2L11.6 15Z" fill="#2B1A12"/><path d="M26.8 15.5Q27 20 25.2 22.2L24.4 15Z" fill="#2B1A12"/>'
/* helmet, goggles pushed up, headlamp */
+'<path d="M8.6 15.2Q8.2 4.2 18 3.6Q27.8 4.2 27.4 15.2Q18 11.8 8.6 15.2Z" fill="url(#phl)" stroke="#A8741E" stroke-width="1.1" stroke-linejoin="round"/>'
+'<path d="M18 3.8V7M13 5.4Q13.2 8 12.8 10.2M23 5.4Q22.8 8 23.2 10.2" stroke="#C98B1A" stroke-width=".9" fill="none" stroke-linecap="round"/>'
+'<path d="M11.2 7.6Q13.6 5.4 16.4 5.2" stroke="#FFF3C2" stroke-width="1" fill="none" stroke-linecap="round" opacity=".85"/>'
+'<path d="M8.9 11.8Q18 7.8 27.1 11.8" stroke="#2B2420" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
+'<ellipse cx="12.4" cy="10.6" rx="2.9" ry="2.5" fill="#8FE0F5" stroke="#2B2420" stroke-width="1"/><ellipse cx="23.6" cy="10.6" rx="2.9" ry="2.5" fill="#8FE0F5" stroke="#2B2420" stroke-width="1"/>'
+'<path d="M10.8 9.8q.8-.8 1.8-.8M22 9.8q.8-.8 1.8-.8" stroke="#fff" stroke-width=".8" fill="none" stroke-linecap="round"/>'
+'<circle cx="18" cy="9.2" r="2.1" fill="#F6F8FA" stroke="#6E7B86" stroke-width=".9"/><circle cx="18" cy="9.2" r="1" fill="#FFF6B0"/>'
+'<path d="M10.4 15.4Q10.8 22 14 24.6M25.6 15.4Q25.2 22 22 24.6" stroke="#2B2420" stroke-width=".7" fill="none" stroke-linecap="round"/>'
+'<path class="tu" d="M21 5.2q1.5-3.4 5-3.6" fill="none" stroke="#2B1A12" stroke-width="1.3" stroke-linecap="round"/>'
/* face */
+'<path d="M11.6 15.8q2.4-1.2 4.6-.2M20.4 15.4q2.2-1 4.6.4" stroke="#2B1A12" stroke-width=".9" fill="none" stroke-linecap="round"/>'
+'<ellipse class="pe" cx="14" cy="19.2" rx="2.3" ry="2.9" fill="#fff"/><ellipse class="pe" cx="22.5" cy="19.2" rx="2.3" ry="2.9" fill="#fff"/>'
+'<circle class="pp" cx="14.7" cy="19.8" r="1.35" fill="#2B1A12"/><circle class="pp" cx="23.2" cy="19.8" r="1.35" fill="#2B1A12"/>'
+'<circle cx="15.2" cy="19.2" r=".45" fill="#fff"/><circle cx="23.7" cy="19.2" r=".45" fill="#fff"/>'
+'<ellipse class="lid" cx="14" cy="19.2" rx="2.5" ry="3.1" fill="#D8A075"/><ellipse class="lid" cx="22.5" cy="19.2" rx="2.5" ry="3.1" fill="#D8A075"/>'
+'<path d="M18.4 20.8q.8 1.3-.2 1.9" stroke="#9A5E3C" stroke-width=".7" fill="none" stroke-linecap="round"/>'
+'<path class="pmo" d="M15.2 24q2.8 2.2 5.6 0" fill="none" stroke="#7A3A2A" stroke-width="1.2" stroke-linecap="round"/>'
+'<circle cx="11.6" cy="23" r="1.5" fill="#FF8FA3" opacity=".4"/><circle cx="24.6" cy="23" r="1.5" fill="#FF8FA3" opacity=".4"/>'
/* cold-air breath puff */
+'<g class="bp"><circle cx="28.4" cy="24.4" r="1.2" fill="#EAF6FF"/><circle cx="30.4" cy="23.2" r=".8" fill="#EAF6FF"/></g>'
+'</g></g></svg>';
const EMO={home:'☀️',study:'📚',roadmap:'🎯',progress:'📈',profile:'⚙️'};
let el=null,bub=null,raf=0,last=0,plats=[],platAt=0,seg=null,q=[],lastTab='',hideT=0,bad=0;
const p={x:60,y:0,f:1,pose:'idle',on:false};
const nav=()=>document.querySelector('nav');
const floor=()=>{const n=nav(),r=n&&!n.hidden?n.getBoundingClientRect():null;return scrollY+(r&&r.height?r.top:innerHeight)-1};
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a);
const hidden=()=>document.hidden||isOff()||typeof ready==='undefined'||!ready||!S||!S.p.onboarded||sheetOpen()||!!document.getElementById('qx')||!!document.querySelector('.wz,.load,#busy.on')||!!(S.timer&&V.fs)||document.body.classList.contains('lvm');
function refresh(){const f=floor();
plats=[...document.querySelectorAll('#app .card,#app .hero,#app .trw')].map(e=>{const r=e.getBoundingClientRect();return{l:r.left+scrollX,r:r.right+scrollX,t:r.top+scrollY}})
.filter(o=>o.r-o.l>90&&o.t>scrollY+56&&o.t<f-34).sort((a,b)=>a.t-b.t);
plats.push({l:0,r:innerWidth,t:f,fl:1})}
const ground=(x,y)=>{let b=null;for(const o of plats){if(x>=o.l-2&&x<=o.r+2&&Math.abs(o.t-y)<14&&(!b||Math.abs(o.t-y)<Math.abs(b.t-y)))b=o}return b};
const below=x=>{let b=null;for(const o of plats){if(o.t>p.y+4&&x>=o.l&&x<=o.r&&(!b||o.t<b.t))b=o}return b||plats[plats.length-1]};
const jumpTo=(x,y,h)=>({k:'jump',x1:x,y1:y,h:h==null?Math.min(60,24+Math.abs(x-p.x)*.25):h,dur:cl(.45+Math.abs(x-p.x)/420,.5,1)});
function say(t){if(!bub)return;bub.textContent=t;bub.classList.add('on');clearTimeout(hideT);hideT=setTimeout(()=>bub.classList.remove('on'),2400)}
function drop(){const f=floor(),vis=plats.filter(o=>o.t>scrollY+90&&o.t<f-40),t=vis.length&&Math.random()<.7?vis[Math.floor(Math.random()*vis.length)]:plats[plats.length-1];
p.x=cl(rnd(t.l+20,t.r-20),16,innerWidth-16);p.y=scrollY-30;seg=null;q=[jumpTo(p.x,t.t,0)]}
function plan(){const here=ground(p.x,p.y);
if(!here){q=[jumpTo(p.x,below(p.x).t,8)];return}
const r=Math.random(),w=here.r-here.l;
if(r<.3&&w>80){q=[{k:'walk',x:cl(rnd(here.l+16,here.r-16),12,innerWidth-12)}];return}
if(r<.45){q=[{k:'idle',dur:rnd(1.4,3),pose:Math.random()<.5?'wave':'idle'}];return}
const cs=plats.filter(o=>o!==here&&Math.abs(o.t-p.y)<320&&!o.fl);
if(!cs.length||r<.55){q=[{k:'walk',x:cl(rnd(12,innerWidth-12),here.l+10,here.r-10)}];return}
const c=cs[Math.floor(Math.random()*cs.length)];
if(c.t>=p.y-6){const tx=cl(rnd(c.l+16,c.r-16),12,innerWidth-12),sx=cl(tx,here.l+12,here.r-12);q=[{k:'walk',x:sx},jumpTo(tx,c.t)];return}
const side=Math.abs(p.x-c.l)<Math.abs(p.x-c.r)?-1:1,wx=side<0?Math.max(11,c.l-4):Math.min(innerWidth-11,c.r+4),sx=cl(wx,here.l+12,here.r-12);
q=[{k:'walk',x:sx}];if(Math.abs(wx-sx)>6)q.push(jumpTo(wx,p.y,14));
q.push({k:'climb',y1:c.t,wall:side},{k:'walk',x:side<0?c.l+20:c.r-20})}
function run(dt){
if(!seg){seg=q.shift()||(plan(),q.shift());if(!seg)return;seg.t=0;if(seg.k==='jump'){seg.x0=p.x;seg.y0=p.y}}
seg.t+=dt;
if(seg.k==='walk'){const d=seg.x-p.x,m=36*dt;p.pose='walk';if(Math.abs(d)<=m){p.x=seg.x;seg=null}else{p.x+=Math.sign(d)*m;p.f=Math.sign(d)||p.f}const g=ground(p.x,p.y);if(g)p.y=g.fl?floor():g.t}
else if(seg.k==='idle'){p.pose=seg.pose;const g=ground(p.x,p.y);if(g)p.y=g.fl?floor():g.t;if(seg.t>=seg.dur)seg=null}
else if(seg.k==='climb'){p.pose='climb';p.f=seg.wall<0?1:-1;p.y-=46*dt;if(p.y<=seg.y1){p.y=seg.y1;seg=null}}
else if(seg.k==='jump'){const t=Math.min(1,seg.t/seg.dur);p.pose='jump';p.f=seg.x1>=seg.x0?1:-1;if(Math.abs(seg.x1-seg.x0)<2)p.f=p.f;p.x=seg.x0+(seg.x1-seg.x0)*t;p.y=seg.y0+(seg.y1-seg.y0)*t-4*seg.h*t*(1-t);if(t>=1){p.x=seg.x1;p.y=seg.y1;seg=null;const g=ground(p.x,p.y);if(g&&g.fl)p.y=floor()}}}
function draw(){el.className='pip '+p.pose+(p.f<0?' fl':'');el.style.transform='translate3d('+(p.x-16).toFixed(1)+'px,'+(p.y-41).toFixed(1)+'px,0)'}
function step(now){raf=requestAnimationFrame(step);if(now-last<(R.classList.contains('lite')?66:32))return;const dt=Math.min(.1,(now-last)/1e3);last=now;
try{if(hidden()){el.style.opacity=0;return}
if(el.style.opacity!=='1')el.style.opacity=1;
if(now-platAt>450){refresh();platAt=now;
if(V.tab!==lastTab){const first=!lastTab;lastTab=V.tab;if(!first){say(EMO[V.tab]||'');drop()}}
if(p.y<scrollY+40||p.y>scrollY+innerHeight+10){drop()}}
run(dt);draw();bad=0}catch(e){if(++bad>20){cancelAnimationFrame(raf);el.remove()}}}
function start(){if(el)return;el=document.createElement('div');el.id='pip';el.className='pip idle';el.setAttribute('aria-hidden','true');el.innerHTML=SVG+'<b class="pb"></b>';document.body.appendChild(el);bub=el.querySelector('.pb');el.style.opacity=0;p.y=floor();raf=requestAnimationFrame(step)}
window.Buddy={on:()=>!isOff(),toggle(){try{localStorage.setItem(K,isOff()?'on':'off')}catch(e){}if(!isOff())drop();}};
Object.assign(A,{pip:()=>{Buddy.toggle();render();toast(Buddy.on()?'Pip is back':'Pip is resting')}});
setTimeout(start,2500);
})();
