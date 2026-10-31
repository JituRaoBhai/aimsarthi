/* GUIDE (v15): profile photo, quick actions on Today, and a short first-run tour. Loaded after app.js and study.js. */
function avHtml(){const p=S.p;return p.photo?`<img src="${esc(p.photo)}" alt="">`:esc((p.name||'?').trim().charAt(0).toUpperCase())}
function avBtn(){return`<button type="button" class="avb" data-a="tab" data-v="profile" aria-label="Open your profile">${avHtml()}</button>`}
Object.assign(A,{
 phot:()=>{const f=$('#phf');if(f)f.click()},
 phrm:()=>{delete S.p.photo;save();render();toast('Photo removed')}});
document.addEventListener('change',e=>{if(!e.target||e.target.id!=='phf')return;const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
 if(!/^image\//.test(f.type)){toast('Please choose an image.');return}
 const u=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{try{const c=document.createElement('canvas'),n=160;c.width=c.height=n;const m=Math.min(im.width,im.height);c.getContext('2d').drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,n,n);S.p.photo=c.toDataURL('image/jpeg',.8);save();render();toast('Photo updated')}catch(x){toast('Could not use that image.')}URL.revokeObjectURL(u)};
 im.onerror=()=>{URL.revokeObjectURL(u);toast('Could not read that image.')};im.src=u});

/* ---- quick actions ---- */
const QK=[['go','Start timer','Study with a stopwatch','<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',' data-id=""'],
 ['focusgo','Focus mode','Stay off your phone while you study','<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>',''],
 ['share','Share progress','Send a picture of today','<path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/>',''],
 ['add','Add task','Put your own task on a day','<path d="M12 5v14M5 12h14"/>',''],
 ['stt','Take a test','Custom or topic tests','<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9"/>',''],
 ['fcgo','Flashcards','Quick revision cards','<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 012 2v10"/>',''],
 ['tab','Your plan','Calendar and weekly plan','<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',' data-v="roadmap"'],
 ['tab','Progress','Charts and test scores','<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',' data-v="progress"']];
function quickCard(){
 return(S.p.toured?'':`<div class="note tourn"><b>New here?</b> Take a one-minute tour of the app.<div class="row" style="margin-top:8px"><button class="btn s" data-a="tour">Show me around</button><button class="btn o s" data-a="tourx">Skip</button></div></div>`)
 +`<div class="qrow" data-noswipe role="group" aria-label="Shortcuts">${QK.filter(q=>q[1]!=='Your plan'&&q[1]!=='Progress').map(([a,t,d,ic,x])=>`<button type="button" class="qch" data-a="${a}"${x}><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg>${t}</button>`).join('')}</div>`}

/* ---- tour ---- */
const Guide={};
const TOUR=[['Today','Your daily list. Tick a task when you finish it, then note how you studied. Use the stopwatch to time your sessions.','<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/>'],
 ['Plan','Your day-by-day schedule and a month calendar. Tap any date to see what is planned. Rebuild it any time if life changes.','<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>'],
 ['Progress','See your week, subjects and test scores. Everything you do is counted here.','<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'],
 ['Study','Make custom tests from any topics, revise with flashcards, and keep notes, videos, channels and course links together.','<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/>'],
 ['Profile','Tap your photo (top left of Today) to open it. Change answers, set timer and alarm sounds, back up your data and more.','<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>']];
Guide.tour=i=>{i=i||0;const n=TOUR.length,t=TOUR[i];
 sheet(`<p class="sm mu" style="margin:0">Step ${i+1} of ${n}</p><div class="tourh"><svg viewBox="0 0 24 24" aria-hidden="true">${t[2]}</svg><h2 style="margin:0">${t[0]}</h2></div><p>${t[1]}</p><div class="stp tdots" aria-hidden="true">${TOUR.map((_,k)=>`<i class="sg${k===i?' now':k<i?' ok':''}"></i>`).join('')}</div><div class="row" style="margin-top:12px"><button class="btn o" data-a="tourx">${i===n-1?'Close':'Skip'}</button>${i?`<button class="btn o" data-a="tourp" data-v="${i-1}">Back</button>`:''}<button class="btn" style="flex:1" data-a="tourn" data-v="${i+1}">${i===n-1?'Got it':'Next'}</button></div>`)};
Object.assign(A,{
 tour:()=>Guide.tour(0),
 tourn:d=>{if(+d.v>=TOUR.length){A.tourx();return}Guide.tour(+d.v)},
 tourp:d=>Guide.tour(+d.v),
 tourx:()=>{closeSheet();if(!S.p.toured){S.p.toured=1;save();render();if(window.Perms)setTimeout(Perms.first,500)}}});

/* ---- routine tasks: repeat by themselves, never counted as missed, never rescheduled ---- */
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],DO=[1,2,3,4,5,6,0];
const rtOn=(r,k)=>k>=r.from&&(r.d==='all'||r.d.includes(pd(k).getDay()))&&!(r.off&&S.p.off!==''&&S.p.off!=null&&String(pd(k).getDay())===String(S.p.off));
const rtLab=r=>(r.m?hm(r.m)+' · ':'')+(r.d==='all'?'every day':DO.filter(i=>r.d.includes(i)).map(i=>DN[i]).join(', '));
function routCard(k){const L=(S.rt||[]).filter(r=>rtOn(r,k)),dn=(S.rd||{})[k]||[];if(!L.length)return'';
 return`<section class="card"><div class="row sp"><h2 style="margin:0">Daily routine</h2><span class="sm mu">${L.filter(r=>dn.includes(r.id)).length} of ${L.length} done</span></div>`
 +L.map(r=>{const c=dn.includes(r.id);return`<div class="rtr${c?' done':''}"><button type="button" class="chk${c?' done':''}" data-a="rtt" data-id="${r.id}" data-k="${k}" aria-pressed="${c}" aria-label="${esc(r.t)}, ${c?'done':'not done'}">${c?'&#10003;':''}</button><div class="m"><b>${esc(r.t)}</b><span class="sm mu">${esc(rtLab(r))}</span></div><button type="button" class="more" data-a="rtm" data-id="${r.id}" aria-label="Options for ${esc(r.t)}">&#8943;</button></div>`}).join('')
 +`<button type="button" class="btn o w" style="margin-top:10px" data-a="radd">Add routine task</button><p class="sm mu" style="margin:8px 0 0">Routine tasks repeat on their own and are never rescheduled.</p></section>`}
A.addstudy=A.add;
A.add=()=>sheet(`<h2>Add a task</h2><div class="stack" style="margin-top:4px"><button class="btn" data-a="radd">Routine task<br><span class="sm" style="font-weight:400">Repeats daily or on days you choose</span></button><button class="btn o" data-a="addstudy">Study task<br><span class="sm" style="font-weight:400">One task on a single date</span></button><button class="btn o" data-a="x">Cancel</button></div>`);
Object.assign(A,{
 radd:d=>{const r=d&&d.id?(S.rt||[]).find(x=>x.id===d.id):null,all=!r||r.d==='all',ds=r&&r.d!=='all'?r.d:[];
  sheet(`<h2>${r?'Edit':'New'} routine task</h2>${inp('rt_t','Task',`maxlength="60" placeholder="Morning walk, revise notes, sleep by 11" value="${esc(r?r.t:'')}"`)}${inp('rt_m','Minutes (optional)',`type="number" inputmode="numeric" min="5" max="600" step="5" value="${r&&r.m?r.m:''}"`)}`
   +`<p class="sm mu" style="margin:12px 0 6px">Repeats</p><div class="chips" role="group" aria-label="Repeats"><button type="button" class="chip" data-a="rtmode" data-v="all" aria-pressed="${all}">Every day</button><button type="button" class="chip" data-a="rtmode" data-v="sel" aria-pressed="${!all}">Chosen days</button></div>`
   +`<div class="chips" id="rt_d" style="margin-top:8px"${all?' hidden':''} role="group" aria-label="Days">${DO.map(i=>`<button type="button" class="chip" data-a="rtday" data-v="${i}" aria-pressed="${ds.includes(i)}">${DN[i]}</button>`).join('')}</div>`
   +(S.p.off!==''&&S.p.off!=null?`<label class="rtk"><input type="checkbox" id="rt_o"${!r||r.off?' checked':''}> Skip my weekly day off (${DN[+S.p.off]})</label>`:'')
   +`<p class="er" id="rt_e" role="alert"></p><div class="row" style="margin-top:8px"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="rtsave" data-id="${r?r.id:''}">Save</button></div>`)},
 rtmode:d=>{$$('[data-a=rtmode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===d.v));$('#rt_d').hidden=d.v==='all'},
 rtday:d=>{const b=$('[data-a=rtday][data-v="'+d.v+'"]');b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true')},
 rtsave:d=>{const t=$('#rt_t').value.trim(),mv=$('#rt_m').value.trim(),m=mv?Math.round(+mv):0,e=$('#rt_e'),all=$('[data-a=rtmode][data-v=all]').getAttribute('aria-pressed')==='true',ds=$$('[data-a=rtday]').filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>+b.dataset.v);
  if(!t){e.textContent='Please enter the task.';return}if(mv&&!(m>=5&&m<=600)){e.textContent='Minutes can be 5 to 600, or leave it empty.';return}if(!all&&!ds.length){e.textContent='Pick at least one day.';return}
  S.rt=S.rt||[];const o=d.id?S.rt.find(x=>x.id===d.id):null,r={id:o?o.id:uid(),t,m,d:all?'all':ds,off:!!($('#rt_o')&&$('#rt_o').checked),from:o?o.from:today()};
  if(o)Object.assign(o,r);else S.rt.push(r);closeSheet();save();render();toast('Routine saved')},
 rtt:d=>{if(d.k>today()){toast('You can tick this on the day.');return}const rd=S.rd=S.rd||{},a=rd[d.k]=rd[d.k]||[],i=a.indexOf(d.id);i<0?a.push(d.id):a.splice(i,1);if(!a.length)delete rd[d.k];vib(8);save();render()},
 rtm:d=>{const r=(S.rt||[]).find(x=>x.id===d.id);if(!r)return;sheet(`<h2 style="overflow-wrap:anywhere">${esc(r.t)}</h2><p class="sm mu">${esc(rtLab(r))}</p><div class="stack"><button class="btn o" data-a="radd" data-id="${r.id}">Edit</button><button class="btn o dng" data-a="rtdl" data-id="${r.id}">Delete this routine</button><button class="btn o" data-a="x">Close</button></div>`)},
 rtdl:d=>{S.rt=(S.rt||[]).filter(x=>x.id!==d.id);Object.keys(S.rd||{}).forEach(k=>{S.rd[k]=S.rd[k].filter(i=>i!==d.id);if(!S.rd[k].length)delete S.rd[k]});closeSheet();save();render();toast('Routine deleted')}});

/* ---- slow phones and slow servers: busy bar, retry, error safety net ---- */
A.reload=()=>location.reload();
const Busy={n:0,t:0,e:null,
 on(){Busy.n++;if(Busy.n===1){clearTimeout(Busy.t);Busy.t=setTimeout(Busy.show,1200)}},
 off(){Busy.n=Math.max(0,Busy.n-1);if(!Busy.n){clearTimeout(Busy.t);Busy.hide()}},
 show(){let e=Busy.e;if(!e){e=Busy.e=document.createElement('div');e.id='bz';e.setAttribute('role','status');e.innerHTML='<i></i><span>Working... the connection looks slow</span>';document.body.appendChild(e)}e.classList.add('on')},
 hide(){if(Busy.e)Busy.e.classList.remove('on')}};
(function(){const f=window.fetch;if(!f)return;window.fetch=function(u){const url=String(u&&u.url||u||''),track=/\/api\/ai\b/.test(url);if(!track)return f.apply(this,arguments);Busy.on();return f.apply(this,arguments).finally(Busy.off)}})();
(function(){const p=window.pullCloud;if(typeof p==='function')window.pullCloud=async function(){Busy.on();try{return await p.apply(this,arguments)}finally{Busy.off()}};
 const q=window.qbLoad;if(typeof q==='function')window.qbLoad=function(){const r=q.apply(this,arguments);Busy.on();Promise.resolve(r).finally(Busy.off);return r}})();
(function(){let E=[],shown=false;const bump=()=>{const n=Date.now();E=E.filter(t=>n-t<10000);E.push(n);if(E.length>=3&&!shown&&typeof sheet==='function'){shown=true;try{sheet(`<h2>Something is not working</h2><p>The app ran into a problem, maybe because the phone or connection is slow. Your saved data is safe.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Keep using</button><button class="btn" style="flex:1" data-a="reload">Reload</button></div>`)}catch(e){}}};
 addEventListener('error',e=>{if(e&&e.target===window)bump()});addEventListener('unhandledrejection',bump)})();

A.focusgo=()=>{if(S.p&&!S.p.onboarded)return;V.tab='study';V.sv='focus';V.fx=false;V.nav=[];scrollTo(0,0);render()};
