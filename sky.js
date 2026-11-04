/* LIVING SKY and STUDY GARDEN (v33). Loaded after guide.js.
   - Sky: the Today card has a real sky behind it. The sun or moon sits where it is in the sky at your local time, clouds drift,
     stars twinkle at night, a shooting star crosses now and then, and the glow turns warm at sunrise and sunset.
   - Garden: Progress shows a plant that grows with the tasks you finish: seed, sprout, young plant, sapling, tree, blossom tree.
     Every day of your streak adds a fruit. Nothing here can be tapped, nothing moves around, and nothing covers the screen. */
(function(){
 const h24=()=>{const d=new Date();return d.getHours()+d.getMinutes()/60};
 /* ---------- sky ---------- */
 window.skyHtml=()=>{const h=h24(),day=h>=6&&h<18,t=day?(h-6)/12:(((h<6?h+24:h)-18)/12),x=62+28*t,y=80-58*Math.sin(Math.PI*t);   // crosses the right-hand side only, so the greeting text stays clear
  const tint=h<5?'rgba(8,10,46,.38)':h<7.5?'rgba(255,150,90,.30)':h<16.5?'rgba(110,190,255,.20)':h<19?'rgba(255,100,130,.30)':'rgba(8,10,46,.38)';
  const ph=d=>'-'+((Date.now()/1e3)%d).toFixed(1)+'s';   // keeps the drift in the same place when the screen redraws
  let o=`<div class="sky" aria-hidden="true" style="--sx:${x.toFixed(1)}%;--sy:${y.toFixed(1)}%"><i class="sg" style="background:linear-gradient(180deg,${tint},transparent 80%)"></i>`;
  if(!day)for(let i=0;i<14;i++)o+=`<i class="st" style="left:${(i*37+11)%96}%;top:${(i*23+7)%62}%;animation-delay:${(i%5)*.6}s"></i>`;
  o+=day?'<i class="sun"></i>':'<i class="moon"></i>';
  o+=`<i class="cl c1" style="animation-delay:${ph(70)}"></i><i class="cl c2" style="animation-delay:${ph(95)}"></i><i class="cl c3" style="animation-delay:${ph(55)}"></i>`;
  if(!day)o+=`<i class="sh" style="animation-delay:${ph(14)}"></i>`;
  return o+'</div>'};
 /* ---------- garden ---------- */
 const STG=[['Seed',0],['Sprout',1],['Young plant',5],['Sapling',15],['Tree',35],['Blossom tree',70]];
 const FR=[[104,70],[138,64],[120,48],[92,84],[148,84],[112,86],[130,80],[120,66]];
 window.gardenCard=()=>{const done=S.tasks.filter(t=>t.status==='done').length;let s=0;STG.forEach((g,i)=>{if(done>=g[1])s=i});
  const a=typeof act==='function'?act():new Set();let st=0,c=today();if(!a.has(c))c=addD(c,-1);while(a.has(c)){st++;c=addD(c,-1)}
  const nx=STG[s+1],pc=nx?Math.round((done-STG[s][1])/(nx[1]-STG[s][1])*100):100,fruit=Math.min(st,8);
  let g='<ellipse class="gs" cx="120" cy="141" rx="104" ry="9"/>';
  if(s===0)g+='<ellipse cx="120" cy="134" rx="6" ry="4" fill="#8B5A2B"/><path class="gl" d="M114 130q6-6 12 0" stroke="#6BCB77" stroke-width="2" fill="none" stroke-linecap="round"/>';
  else if(s<3){const hh=s===1?26:50;g+=`<g class="gw"><path d="M120 138V${138-hh}" stroke="#3E9B52" stroke-width="4" stroke-linecap="round" fill="none"/>`;
   for(let i=0;i<(s===1?2:5);i++){const yy=136-hh*(.25+.7*i/(s===1?1:4)),sd=i%2?1:-1;g+=`<ellipse cx="${120+sd*10}" cy="${yy.toFixed(0)}" rx="10" ry="4.5" fill="#58C46E" transform="rotate(${sd*-28} ${120+sd*10} ${yy.toFixed(0)})"/>`}
   g+=`<circle cx="120" cy="${138-hh-3}" r="5" fill="#7EE08F"/></g>`}
  else{const big=s>=4,tw=big?10:7,ty=big?76:92,cir=big?[[120,60,28],[94,76,20],[146,76,20],[106,46,17],[136,44,17]]:[[120,76,22],[102,88,16],[138,88,16]];
   g+=`<g class="gw"><path d="M120 138V${ty}" stroke="#7A4B22" stroke-width="${tw}" stroke-linecap="round" fill="none"/>${big?'<path d="M120 112l-16-14M120 104l16-12" stroke="#7A4B22" stroke-width="4" stroke-linecap="round" fill="none"/>':''}`
    +cir.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="${q[2]}" fill="${i%2?'#4CB866':'#3FA95A'}"/>`).join('')
    +(s===5?[[100,64],[140,58],[120,40],[88,80],[152,80],[112,70],[128,86]].map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="3" fill="${i%2?'#FFB7D5':'#FFFFFF'}"/>`).join(''):'')
    +FR.slice(0,fruit).map((q,i)=>`<circle class="gf" style="animation-delay:${i*.35}s" cx="${q[0]}" cy="${q[1]}" r="4" fill="${i%2?'#FF6B6B':'#FFB03A'}"/>`).join('')+'</g>'}
  if(s<3)for(let i=0;i<Math.min(st,6);i++){const x=40+i*28+(i>2?44:0);g+=`<path d="M${x} 139v-9" stroke="#3E9B52" stroke-width="2"/><circle class="gf" style="animation-delay:${i*.3}s" cx="${x}" cy="128" r="4" fill="${['#FF8FA3','#FFD45A','#FFFFFF','#B39DFF','#FF9A6B','#6CF5D6'][i]}"/>`}
  return`<section class="card garden" style="margin-top:12px"><div class="row sp" style="align-items:flex-start"><div><h2 style="margin:0 0 2px">Your study garden</h2><p class="sm mu" style="margin:0">${STG[s][0]}${s?' &middot; '+done+' tasks done':''}</p></div>${st?`<span class="pill gp">${st}-day streak</span>`:''}</div>`
   +`<svg viewBox="0 0 240 150" class="gsvg" role="img" aria-label="${STG[s][0]}: a plant that grows as you finish tasks">${g}</svg>`
   +`<div class="gbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}"><i style="width:${pc}%"></i></div><p class="sm mu" style="margin:6px 0 0">${nx?(nx[1]-done)+' more finished task'+(nx[1]-done>1?'s':'')+' to grow into a '+nx[0].toLowerCase()+'.':'Fully grown. Keep your streak to fill it with fruit.'}${s>=3?' Each streak day adds a fruit.':st&&s<3?' Each streak day adds a flower.':''}</p></section>`};
})();
