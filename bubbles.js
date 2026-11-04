/* BUBBLES (v32). Loaded after buddy.js.
   Soft see-through bubbles drift up the screen from the bottom. Touch one (or swipe through it) and it bursts into droplets.
   The layer never blocks a tap: touches go through to the app, a bubble just pops as well.
   Fewer bubbles and a lower frame rate on slow phones; off when the phone asks for less motion; hidden during windows, tests and the timer screen.
   Switch off any time: Profile > Appearance > Bubbles. */
(function(){
 const K='tasky:bub',R=document.documentElement;
 const isOff=()=>{try{return localStorage.getItem(K)==='off'}catch(e){return false}};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let cv=null,cx=null,W=0,H=0,dpr=1,raf=0,last=0,hue='#4658D0',hueAt=0,B=[],P=[],Rg=[];
 const rnd=(a,b)=>a+Math.random()*(b-a),lite=()=>R.classList.contains('lite'),max=()=>lite()?6:13;
 const hide=()=>document.hidden||isOff()||typeof ready==='undefined'||!ready||!S||!S.p.onboarded||sheetOpen()||!!document.getElementById('qx')||!!document.querySelector('.wz,.load,#busy.on')||!!(S.timer&&V.fs);
 const rgb=h=>{h=String(h).trim();if(/^#[0-9a-f]{6}$/i.test(h))return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];return[70,88,208]};
 function size(){dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
 function spawn(first){const r=rnd(7,first?30:26);B.push({x:rnd(r,W-r),y:first?rnd(H*.2,H):H+r+rnd(0,60),r,vy:rnd(16,42)*(1-r/90),ph:rnd(0,6.28),sw:rnd(6,18),sp:rnd(.6,1.5)})}
 function pop(b){const i=B.indexOf(b);if(i<0)return;B.splice(i,1);
  const n=Math.round(6+b.r/4);for(let k=0;k<n;k++){const a=k/n*6.283+rnd(-.2,.2),v=rnd(40,110);P.push({x:b.x,y:b.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,r:rnd(1.2,2.6),life:0,max:rnd(.45,.8)})}
  Rg.push({x:b.x,y:b.y,r:b.r,life:0});try{navigator.vibrate&&navigator.vibrate(6)}catch(e){}}
 function draw(now){raf=requestAnimationFrame(draw);if(now-last<(lite()?50:16))return;const dt=Math.min(.08,(now-last)/1e3);last=now;
  if(hide()){if(cv.style.opacity!=='0')cv.style.opacity=0;return}
  if(cv.style.opacity!=='1')cv.style.opacity=1;
  if(now-hueAt>4000){hueAt=now;hue=getComputedStyle(R).getPropertyValue('--h2').trim()||hue}
  if(innerWidth!==W||innerHeight!==H)size();
  const[cr,cg,cb]=rgb(hue),dark=R.dataset.theme==='dark'||(!R.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);
  while(B.length<max()&&Math.random()<.5)spawn(false);
  cx.clearRect(0,0,W,H);
  for(let i=B.length-1;i>=0;i--){const b=B[i];b.y-=b.vy*dt;b.ph+=dt*b.sp;const x=b.x+Math.sin(b.ph)*b.sw*.5;b.dx=x;
   if(b.y<-b.r-10){B.splice(i,1);continue}
   const fade=Math.min(1,(b.y+b.r)/80),a=(dark?.5:.42)*fade,g=cx.createRadialGradient(x-b.r*.3,b.y-b.r*.35,b.r*.1,x,b.y,b.r);
   g.addColorStop(0,`rgba(255,255,255,${.0})`);g.addColorStop(.7,`rgba(${cr},${cg},${cb},${.05*fade})`);g.addColorStop(1,`rgba(${cr},${cg},${cb},${.22*fade})`);
   cx.beginPath();cx.arc(x,b.y,b.r,0,6.283);cx.fillStyle=g;cx.fill();cx.lineWidth=1.3;cx.strokeStyle=`rgba(${dark?200:cr},${dark?220:cg},${dark?255:cb},${a})`;cx.stroke();
   cx.beginPath();cx.arc(x,b.y,b.r*.72,3.6,4.5);cx.lineWidth=Math.max(1.2,b.r*.1);cx.lineCap='round';cx.strokeStyle=`rgba(255,255,255,${.85*fade})`;cx.stroke();
   b.cx=x}
  for(let i=P.length-1;i>=0;i--){const d=P[i];d.life+=dt;if(d.life>=d.max){P.splice(i,1);continue}d.vy+=260*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;
   cx.beginPath();cx.arc(d.x,d.y,d.r,0,6.283);cx.fillStyle=`rgba(${cr},${cg},${cb},${(1-d.life/d.max)*.7})`;cx.fill()}
  for(let i=Rg.length-1;i>=0;i--){const g=Rg[i];g.life+=dt*3;if(g.life>=1){Rg.splice(i,1);continue}
   cx.beginPath();cx.arc(g.x,g.y,g.r*(1+g.life*.7),0,6.283);cx.lineWidth=2*(1-g.life);cx.strokeStyle=`rgba(${cr},${cg},${cb},${.55*(1-g.life)})`;cx.stroke()}}
 /* a bubble's x on screen is b.cx (it sways); use it for hit-testing */
 const hit=(x,y)=>{if(hide())return;for(let i=B.length-1;i>=0;i--){const b=B[i],bx=b.cx==null?b.x:b.cx;if(Math.hypot(bx-x,b.y-y)<=b.r+8){pop(b);return}}};
 function start(){if(cv)return;cv=document.createElement('canvas');cv.id='bubs';cv.setAttribute('aria-hidden','true');cx=cv.getContext('2d');if(!cx)return;document.body.appendChild(cv);size();for(let i=0;i<Math.round(max()*.6);i++)spawn(true);
  addEventListener('pointerdown',e=>hit(e.clientX,e.clientY),{passive:true,capture:true});
  addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons)hit(e.clientX,e.clientY)},{passive:true,capture:true});
  addEventListener('touchmove',e=>{const t=e.touches[0];if(t)hit(t.clientX,t.clientY)},{passive:true,capture:true});
  cv.style.opacity=0;raf=requestAnimationFrame(draw)}
 window.Bubbles={on:()=>!isOff(),toggle(){try{localStorage.setItem(K,isOff()?'on':'off')}catch(e){}},count:()=>B.length,at:i=>B[i]?{x:B[i].cx==null?B[i].x:B[i].cx,y:B[i].y,r:B[i].r}:null};
 Object.assign(A,{bub:()=>{Bubbles.toggle();render();toast(Bubbles.on()?'Bubbles are back':'Bubbles are off')}});
 setTimeout(start,1800);
})();
