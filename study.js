/* STUDY tab (v15): tests (custom module tests), flashcards, notes, videos, public channels, courses.
   Your own shipped content goes in content.js. Users add their own links and notes here too.
   Loaded after app.js and tests.js. */
const SBX=[['ctest','Custom test','Choose topics, count and time','<path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/>'],
 ['tests','Topic tests','Ready-made, one topic at a time','<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9"/>'],
 ['fc','Flashcards','Quick recall practice','<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 012 2v10"/>'],
 ['note','Notes','Your own short notes','<path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 13h8M8 17h6"/>'],
 ['vid','Videos','YouTube and lecture links','<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>'],
 ['chan','Channels','Public Telegram channels','<path d="M21 4L3 11l6 2 2 6 3-4 5 3z"/>'],
 ['crs','Courses','Coaching and course links','<path d="M3 8l9-5 9 5-9 5z"/><path d="M7 11v5c0 1.5 2.2 3 5 3s5-1.500 5-3v-5"/>']];
const SBT=Object.fromEntries(SBX.map(x=>[x[0],x]));
const CT=()=>window.STUDY_CONTENT||{},SJ=()=>EX[S.p.exam]?EX[S.p.exam].sub:[];
function sItems(k){const own=(S.lib||[]).filter(z=>z.k===k).map(z=>({...z,own:1})),b=(CT()[k]||[]).filter(z=>!z.x||z.x===S.p.exam).map((z,i)=>({...z,id:z.id||'b'+k+i,own:0}));return b.concat(own)}
const ytId=u=>{const m=/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/.exec(u||'');return m?m[1]:''};
const tgPost=u=>{const m=/^https?:\/\/(?:t|telegram)\.me\/(?:s\/)?([A-Za-z0-9_]{4,})\/(\d+)/i.exec(u||'');return m?{ch:m[1],id:m[2]}:null};
const playOf=u=>{const y=ytId(u);if(y)return{t:'yt',id:y};const t=tgPost(u);return t?{t:'tg',...t}:null};
const hostOf=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return''}};
const okUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'||x.protocol==='http:'}catch(e){return false}};
const svBack=t=>`<div class="row" style="margin:0 0 10px"><button class="btn o s" data-a="sv" data-v="">&lsaquo; Study</button></div><h1>${t}</h1>`;
const pgd=t=>`<p class="pgd">${t}</p>`;

/* ---------- hub ---------- */
const lk=k=>{const n=sItems(k).length;return n?n+(n>1?' links':' link'):''};
function studyHub(){const tN=(S.tests||[]).filter(h=>h&&h.exam===S.p.exam).length,dueN=fcDue().length;
 const cu=(S.tests||[]).filter(h=>h&&h.exam===S.p.exam&&h.cu).length,cnt={ctest:cu?cu+' taken':'',tests:tN-cu>0?(tN-cu)+' taken':'',fc:fcAll().length?fcAll().length+(fcAll().length>1?' cards':' card')+(dueN?' · '+dueN+' due':''):'',note:(n=>n?n+(n>1?' notes':' note'):'')(sItems('note').length),vid:lk('vid'),chan:lk('chan'),crs:lk('crs')};
 return`<h1>Study</h1>${pgd('Everything you learn from, in one place. Pick a section to start.')}<div class="sbg">${SBX.map(([k,t,d,ic])=>`<button type="button" class="sbt" data-a="sv" data-v="${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><b>${t}</b><span class="sm mu">${d}</span>${cnt[k]?`<span class="bd">${cnt[k]}</span>`:''}</button>`).join('')}</div>`
 +(dueN?`<section class="card"><h2>Cards due today</h2><p class="sm mu">${dueN} flashcard${dueN>1?'s':''} ready for review.</p><button class="btn" data-a="fcgo">Review now</button></section>`:'')
 +`<p class="sm mu">Tip: add your favourite video, channel and course links so everything is one tap away while you study.</p>`}
function studyView(){const k=V.sv;if(!k||!SBT[k])return studyHub();
 if(k==='ctest')return testsHub();if(k==='tests')return topicView();if(k==='fc')return fcView();return listView(k)}
function topicView(){return svBack('Topic tests')+pgd('Take a ready-made test for one topic. Your scores and missed questions are tracked in Progress.')+testsView()+`<section class="card"><h2>Want to mix topics?</h2><p class="sm mu">Build your own test from any subjects or topics.</p><button class="btn o" data-a="sv" data-v="ctest">Make a custom test</button></section>`}

/* ---------- links and notes ---------- */
function listView(k){const T=SBT[k],L=sItems(k),sub=V.sf||'';
 const G={};L.filter(z=>!sub||(z.s||'General')===sub).forEach(z=>{(G[z.s||'General']=G[z.s||'General']||[]).push(z)});
 const ss=[...new Set(L.map(z=>z.s||'General'))];
 const help={vid:'Save lecture videos. YouTube links and Telegram post links play right here.',chan:'Save public Telegram channels (t.me/channelname) or single posts (t.me/channelname/123). Post links play right here.',crs:'Save the courses you follow on coaching apps and sites. They open in your browser or the app.',note:'Write short notes for quick revision.'}[k];
 return svBack(T[1])+pgd(help)+`<button class="btn w" data-a="sadd" data-k="${k}">${k==='note'?'Add a note':'Add a link'}</button>`
  +(ss.length>1?`<div class="chips" style="margin:12px 0" role="group" aria-label="Filter by subject"><button type="button" class="chip" data-a="sfl" data-v="" aria-pressed="${!sub}">All</button>${ss.map(s=>`<button type="button" class="chip" data-a="sfl" data-v="${esc(s)}" aria-pressed="${sub===s}">${esc(s)}</button>`).join('')}</div>`:'')
  +(L.length?Object.keys(G).sort().map(s=>`<h3 class="gh">${esc(s)}</h3>`+G[s].map(z=>itemCard(k,z)).join('')).join(''):`<section class="card"><p class="mu" style="margin:0">Nothing here yet. Tap the button above to add your first one.</p></section>`)}
function itemCard(k,z){const u=z.u||'',pl=k==='vid'||k==='chan'?playOf(u):null,y=pl&&pl.t==='yt',h=hostOf(u);
 return`<article class="card si"><div class="row sp"><b style="min-width:0;overflow-wrap:anywhere">${esc(z.t||'Untitled')}</b>${z.own?'':'<span class="bd">From Tasky</span>'}</div>`
  +(k!=='note'&&h?`<p class="sm mu" style="margin:2px 0 0">${esc(h)}</p>`:'')
  +((k==='note'?z.text:z.note)?`<p class="sm" style="margin:6px 0 0;white-space:pre-wrap;overflow-wrap:anywhere">${esc(z.text||z.note)}</p>`:'')
  +`<div class="row" style="margin-top:10px;flex-wrap:wrap">`
  +(pl?`<button class="btn s" data-a="syt" data-id="${esc(z.id)}">&#9654; Play</button>`:'')
  +(u&&okUrl(u)?`<a class="btn ${pl?'o ':''}s" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${y?'Open in YouTube':pl?'Open in Telegram':k==='chan'?'Open channel':k==='crs'?'Open course':'Open link'}</a>`:'')
  +(z.own?`<button class="btn o s" data-a="sadd" data-k="${k}" data-id="${esc(z.id)}">Edit</button><button class="btn o s dng" data-a="sdl" data-id="${esc(z.id)}">Delete</button>`:'')+`</div></article>`}
Object.assign(A,{
 sv:d=>{V.sv=d.v;V.fr=null;V.sf='';V.fx=true;scrollTo(0,0);render()},
 sfl:d=>{V.sf=d.v;render()},
 sadd:d=>{const k=d.k,z=d.id?(S.lib||[]).find(x=>x.id===d.id):null,T=SBT[k];
  sheet(`<h2>${z?'Edit':'Add'} ${k==='note'?'note':'link'}</h2>${inp('sf_t','Title',`maxlength="120" value="${esc(z?z.t:'')}" placeholder="${{vid:'Lecture name',chan:'Channel name',crs:'Course name',note:'Note title'}[k]}"`)}`
   +(k!=='note'?inp('sf_u','Link',`type="url" inputmode="url" maxlength="400" value="${esc(z?z.u:'')}" placeholder="${{vid:'https://youtube.com/...',chan:'https://t.me/...',crs:'https://...'}[k]}"`):'')
   +`<label for="sf_s">Subject (optional)</label><select id="sf_s"><option value="">General</option>${SJ().map(s=>`<option${z&&z.s===s?' selected':''}>${esc(s)}</option>`).join('')}</select>`
   +`<label for="sf_x">${k==='note'?'Note':'Your remark (optional)'}</label><textarea id="sf_x" rows="${k==='note'?6:2}" maxlength="${k==='note'?4000:300}" style="width:100%;padding:10px 12px;border:1.5px solid var(--ln);border-radius:10px;background:var(--sf);color:var(--tx);font:inherit">${esc(z?(z.text||z.note||''):'')}</textarea>`
   +`<p class="er" id="sf_e" role="alert"></p><div class="row" style="margin-top:8px"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="ssave" data-k="${k}" data-id="${z?esc(z.id):''}">Save</button></div>`)},
 ssave:d=>{const k=d.k,t=$('#sf_t').value.trim(),e=$('#sf_e');let u=k==='note'?'':$('#sf_u').value.trim();const tx=$('#sf_x').value.trim(),s=$('#sf_s').value;
  if(!t){e.textContent='Please enter a title.';return}
  if(k!=='note'){if(!u){e.textContent='Please paste a link.';return}if(!/^[a-z]+:/i.test(u))u='https://'+u;if(!okUrl(u)){e.textContent='That link does not look right. It must start with https://';return}}
  if(k==='note'&&!tx){e.textContent='Please write your note.';return}
  S.lib=S.lib||[];const o=d.id?S.lib.find(x=>x.id===d.id):null,r={id:o?o.id:uid(),k,t,s,at:o?o.at:new Date().toISOString()};if(u)r.u=u;if(k==='note')r.text=tx;else if(tx)r.note=tx;
  if(o)Object.keys(o).forEach(q=>delete o[q]),Object.assign(o,r);else S.lib.push(r);
  closeSheet();save();render();toast('Saved')},
 sdl:d=>{const z=(S.lib||[]).find(x=>x.id===d.id);if(!z)return;sheet(`<h2>Delete this?</h2><p>${esc(z.t)}</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Keep it</button><button class="btn" style="flex:1" data-a="sdlok" data-id="${esc(z.id)}">Delete</button></div>`)},
 sdlok:d=>{S.lib=(S.lib||[]).filter(x=>x.id!==d.id);closeSheet();save();render();toast('Deleted')},
 syt:d=>{const z=[...sItems('vid'),...sItems('chan')].find(x=>x.id===d.id),pl=z&&playOf(z.u);if(!pl)return;
  const tg=pl.t==='tg',open=`<a class="btn" style="flex:1;text-align:center" href="${esc(z.u)}" target="_blank" rel="noopener noreferrer">${tg?'Open in Telegram':'Open in YouTube'}</a>`,off=!navigator.onLine,
   src=pl.t==='yt'?`https://www.youtube-nocookie.com/embed/${pl.id}?rel=0&playsinline=1&autoplay=1`:`https://t.me/${pl.ch}/${pl.id}?embed=1&mode=tme&userpic=false`;
  sheet(`<h2 style="overflow-wrap:anywhere">${esc(z.t)}</h2><div class="yt${tg?' tg':''}">${off?`<div class="ytl"><b>No internet connection</b><span class="sm">Connect to the internet to play this video.</span></div>`:`<div class="ytl" id="ytl"><div class="spin" aria-hidden="true"></div><span id="ytm">Loading video...</span></div><iframe src="${src}" title="${esc(z.t)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`}</div>${off?'':`<div class="row" style="margin:8px 0 0" role="group" aria-label="Screen direction"><button type="button" class="btn o s" style="flex:1" data-a="ytpt">&#9647; Portrait</button><button type="button" class="btn o s" style="flex:1" data-a="ytls">&#9645; Landscape</button><button type="button" class="btn o s" style="flex:1" data-a="ytfs">&#10530; Full screen</button></div>`}<p class="sm mu" style="margin:8px 0 0">${tg?'If the post does not load here, it may be from a private channel. Use Open in Telegram.':'Does not play? Use Open in YouTube.'}</p><div class="row" style="margin-top:10px"><button class="btn o" style="flex:1" data-a="x">Close</button>${open}</div>`);
  const f=$('#shb iframe');if(!f)return;const t0=Date.now();let done=0;
  const fin=()=>{if(done)return;done=1;const l=$('#ytl');if(l){l.classList.add('out');setTimeout(()=>l.remove(),350)}};
  f.addEventListener('load',()=>setTimeout(fin,Math.max(0,900-(Date.now()-t0))));
  setTimeout(()=>{const m=$('#ytm');if(!done&&m)m.textContent='Still loading. Your connection may be slow...'},8000);
  setTimeout(()=>{const m=$('#ytm');if(!done&&m)m.textContent='This is taking long. Try Open in '+(tg?'Telegram':'YouTube')+'.'},20000)}});

/* ---------- flashcards (spaced repetition) ---------- */
const FCI=[0,1,3,7,14,30];
function fcAll(){const own=(S.fc||[]).map(z=>({...z,own:1})),b=(CT().fc||[]).filter(z=>(!z.x||z.x===S.p.exam)&&z.id&&z.f&&z.b).map(z=>({...z,own:0}));return b.concat(own)}
const fcSt=z=>(S.fcp||{})[z.id]||{lv:0,due:''};
const fcDue=()=>fcAll().filter(z=>{const p=fcSt(z);return!p.due||p.due<=today()});
function fcView(){const R=V.fr;if(R)return fcRun(R);
 const L=fcAll(),due=fcDue(),G={};L.forEach(z=>{(G[z.s||'General']=G[z.s||'General']||[]).push(z)});
 return svBack('Flashcards')+pgd('Flip a card, say the answer in your head, then tell us how it went. Cards you struggle with come back sooner.')
 +`<section class="card"><div class="stats"><div><b>${L.length}</b><span>Cards</span></div><div><b>${due.length}</b><span>Due now</span></div><div><b>${L.filter(z=>fcSt(z).lv>=4).length}</b><span>Well known</span></div></div><div class="stack"><button class="btn" data-a="fcgo"${due.length?'':' disabled'}>${due.length?'Review '+due.length+' card'+(due.length>1?'s':''):'Nothing due right now'}</button><button class="btn o" data-a="fcadd">Add a card</button></div></section>`
 +Object.keys(G).sort().map(s=>`<details class="card tops" data-k="fc_${esc(s)}"${V.lo['fc_'+s]?' open':''}><summary><b>${esc(s)}</b> <span class="sm mu">${G[s].length} card${G[s].length>1?'s':''}</span></summary>${G[s].map(z=>`<div class="fcr"><span class="sm" style="min-width:0;overflow-wrap:anywhere"><b>${esc(z.f)}</b><br><span class="mu">${esc(z.b)}</span></span>${z.own?`<span class="row" style="flex:none"><button class="more" data-a="fcadd" data-id="${esc(z.id)}" aria-label="Edit card">&#9998;</button><button class="more" data-a="fcdl" data-id="${esc(z.id)}" aria-label="Delete card">&times;</button></span>`:''}</div>`).join('')}</details>`).join('')}
function fcRun(R){const n=R.q.length;if(R.i>=n)return svBack('Review done')+`<section class="card"><h2>Nice work</h2><p>You reviewed ${R.n} card${R.n>1?'s':''}.</p><div class="stats"><div><b class="g">${R.g}</b><span>Knew it</span></div><div><b class="r">${R.a}</b><span>Again</span></div><div><b>${fcDue().length}</b><span>Still due</span></div></div><button class="btn w" data-a="fcx">Done</button></section>`;
 const z=R.q[R.i];
 return`<div class="row sp" style="margin:0 0 10px"><button class="btn o s" data-a="fcx">&lsaquo; Stop</button><span class="sm mu">Card ${R.i+1} of ${n}</span></div><div class="bar g" style="margin-bottom:12px"><i style="width:${Math.round(R.i/n*100)}%"></i></div>`
  +`<section class="card fcc" aria-live="polite"><p class="sm mu" style="margin:0 0 6px">${esc(z.s||'General')}</p><p class="fcq">${esc(z.f)}</p>${R.sh?`<hr><p class="fca">${esc(z.b)}</p>`:''}</section>`
  +(R.sh?`<div class="row"><button class="btn o" style="flex:1" data-a="fcr" data-v="0">Again</button><button class="btn" style="flex:1" data-a="fcr" data-v="1">Good</button><button class="btn o" style="flex:1" data-a="fcr" data-v="2">Easy</button></div>`:`<button class="btn w" data-a="fcsh">Show answer</button>`)}
Object.assign(A,{
 fcgo:()=>{const q=shuf(fcDue()).slice(0,30);if(!q.length){toast('No cards are due.');return}V.sv='fc';V.tab='study';V.fr={q,i:0,sh:false,n:q.length,g:0,a:0};V.fx=true;scrollTo(0,0);render()},
 fcsh:()=>{if(V.fr){V.fr.sh=true;render()}},
 fcr:d=>{const R=V.fr;if(!R)return;const z=R.q[R.i],p=fcSt(z),v=+d.v;S.fcp=S.fcp||{};
  if(v===0){S.fcp[z.id]={lv:0,due:today()};R.a++;R.q.push(z);R.n=Math.max(R.n,R.q.length)}else{const lv=Math.min(FCI.length-1,p.lv+v);S.fcp[z.id]={lv,due:addD(today(),FCI[lv])};R.g++}
  R.i++;R.sh=false;vib(8);save();render();scrollTo(0,0)},
 fcx:()=>{V.fr=null;render()},
 fcadd:d=>{const z=d.id?(S.fc||[]).find(x=>x.id===d.id):null;
  sheet(`<h2>${z?'Edit':'Add'} card</h2><label for="fc_s">Subject</label><select id="fc_s"><option value="">General</option>${SJ().map(s=>`<option${z&&z.s===s?' selected':''}>${esc(s)}</option>`).join('')}</select><label for="fc_f">Front (question)</label><textarea id="fc_f" rows="3" maxlength="400" style="width:100%;padding:10px 12px;border:1.5px solid var(--ln);border-radius:10px;background:var(--sf);color:var(--tx);font:inherit">${esc(z?z.f:'')}</textarea><label for="fc_b">Back (answer)</label><textarea id="fc_b" rows="3" maxlength="600" style="width:100%;padding:10px 12px;border:1.5px solid var(--ln);border-radius:10px;background:var(--sf);color:var(--tx);font:inherit">${esc(z?z.b:'')}</textarea><p class="er" id="fc_e" role="alert"></p><div class="row" style="margin-top:8px"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="fcsave" data-id="${z?esc(z.id):''}">Save</button></div>`)},
 fcsave:d=>{const f=$('#fc_f').value.trim(),b=$('#fc_b').value.trim(),s=$('#fc_s').value;if(!f||!b){$('#fc_e').textContent='Please fill both sides of the card.';return}
  S.fc=S.fc||[];const o=d.id?S.fc.find(x=>x.id===d.id):null;if(o){o.f=f;o.b=b;o.s=s}else S.fc.push({id:uid(),s,f,b});closeSheet();save();render();toast('Card saved')},
 fcdl:d=>{S.fc=(S.fc||[]).filter(x=>x.id!==d.id);if(S.fcp)delete S.fcp[d.id];save();render();toast('Card deleted')}});

/* ---------- tests: custom module tests ---------- */
const cbd=()=>V.cb=V.cb||{keys:[],n:20,spq:60};
function qbKeys(){const B=qbAll();return Object.keys(B).filter(k=>qbN(k)>0)}
function testsHub(){const x=S.p.exam,E=EX[x];
 let h=svBack('Custom test')+pgd('Build your own test from any subjects or topics. Every result shows up in Progress.');
 if(!qbOn())return h+`<section class="card"><h2>Not available yet</h2><p class="sm mu">Question banks are ready for ${(window.TEST_EXAMS||[]).map(k=>esc(EX[k]?EX[k].n:k)).join(', ')}. ${esc(E.n)} will get tests in a future update.</p></section>`+recentTests();
 if(!qbLoaded[x]||!QB[x])return h+`<section class="card"><p class="mu">Loading questions...</p></section>`;
 const ks=qbKeys();if(!ks.length)return h+`<section class="card"><h2>No questions yet</h2><p class="sm mu">No questions have been added for ${esc(E.n)} yet.</p></section>`;
 const c=cbd();c.keys=c.keys.filter(k=>ks.includes(k));const pool=sum(c.keys,qbN),n=Math.min(c.n,pool),I=tInfo(x);
 const subs=E.sub.filter(s=>ks.some(k=>k.split('|')[0]===s)),on=s=>ks.filter(k=>k.split('|')[0]===s).every(k=>c.keys.includes(k));
 h+=`<section class="card"><h2>Custom test</h2><p class="sm mu" style="margin:0 0 8px">1. Choose subjects. Open a subject to pick single topics.</p><div class="chips" role="group" aria-label="Subjects">${subs.map(s=>`<button type="button" class="chip" data-a="cbs" data-s="${esc(s)}" aria-pressed="${on(s)}">${esc(s)}</button>`).join('')}</div>`
  +`<div class="chips" style="margin:10px 0" role="group" aria-label="Shortcuts"><button type="button" class="chip" data-a="cbq" data-v="weak">My weak topics</button><button type="button" class="chip" data-a="cbq" data-v="new">Not taken yet</button><button type="button" class="chip" data-a="cbq" data-v="all">Everything</button><button type="button" class="chip" data-a="cbq" data-v="none">Clear</button></div>`
  +subs.filter(s=>ks.filter(k=>k.split('|')[0]===s).some(k=>c.keys.includes(k))).map(s=>`<details class="cbd" data-k="cb_${esc(s)}"${V.lo['cb_'+s]?' open':''}><summary class="sm"><b>${esc(s)}</b> topics</summary>${ks.filter(k=>k.split('|')[0]===s).map(k=>`<button type="button" class="cbt${c.keys.includes(k)?' on':''}" data-a="cbk" data-key="${esc(k)}" aria-pressed="${c.keys.includes(k)}"><i aria-hidden="true">&#10003;</i><span>${esc(k.split('|').slice(1).join('|'))}</span><span class="sm mu">${qbN(k)}</span></button>`).join('')}</details>`).join('')
  +`<p class="sm mu" style="margin:12px 0 6px">2. How many questions?</p><div class="chips" role="group" aria-label="Number of questions">${[10,20,30,50,100].map(v=>`<button type="button" class="chip" data-a="cbn" data-v="${v}" aria-pressed="${c.n===v}">${v}</button>`).join('')}</div>`
  +`<p class="sm mu" style="margin:12px 0 6px">3. Time per question</p><div class="chips" role="group" aria-label="Time per question">${[[45,'45 sec'],[60,'1 min'],[90,'1.5 min'],[120,'2 min']].map(([v,l])=>`<button type="button" class="chip" data-a="cbt" data-v="${v}" aria-pressed="${c.spq===v}">${l}</button>`).join('')}</div>`
  +`<p class="note" style="margin:14px 0 10px" aria-live="polite">${pool?`<b>${n} questions</b> from ${c.keys.length} topic${c.keys.length>1?'s':''}, ${qxFmt(n*c.spq)} minutes.${pool<c.n?' That is every question available for your choice.':''}`:'Choose at least one subject or topic to begin.'}</p><button class="btn w" data-a="cbrun"${pool?'':' disabled'}>Start custom test</button></section>`
  +`<section class="card"><h2>Topic tests</h2><p class="sm mu">One topic at a time, with your best score and missed questions for each.</p><button class="btn o" data-a="sv" data-v="tests">Open topic tests</button></section>`+recentTests();
 return h}
function recentTests(){const H=(S.tests||[]).filter(h=>h&&h.exam===S.p.exam).slice(-5).reverse();if(!H.length)return'';
 return`<section class="card"><h2>Recent tests</h2>${H.map(h=>`<p class="row sp" style="margin:0 0 6px"><span class="sm">${esc(h.cu?h.lb:h.key.split('|').slice(1).join('|'))}<br><span class="mu">${fD(h.at.slice(0,10))}${h.cu?' · custom':''}</span></span><span class="bd ${pcOf(h)>=80?'ok':pcOf(h)>=60?'wn':'no'}">${h.c}/${h.n}</span></p>`).join('')}<button class="btn o s" data-a="pt" data-v="tests">See all in Progress</button></section>`}
Object.assign(A,{
 cbs:d=>{const c=cbd(),ks=qbKeys().filter(k=>k.split('|')[0]===d.s),all=ks.every(k=>c.keys.includes(k));c.keys=all?c.keys.filter(k=>!ks.includes(k)):[...new Set(c.keys.concat(ks))];if(!all)V.lo['cb_'+d.s]=true;vib(6);const y=scrollY;render();scrollTo(0,y)},
 cbk:d=>{const c=cbd(),i=c.keys.indexOf(d.key);i<0?c.keys.push(d.key):c.keys.splice(i,1);vib(6);const y=scrollY;render();scrollTo(0,y)},
 cbq:d=>{const c=cbd(),ks=qbKeys(),I=tInfo(S.p.exam);c.keys=d.v==='all'?ks.slice():d.v==='none'?[]:d.v==='weak'?I.filter(i=>i.bad>0||(i.att&&i.lp<60)).map(i=>i.k):I.filter(i=>!i.att).map(i=>i.k);
  if(d.v==='weak'&&!c.keys.length)toast('No weak topics yet. Take a few tests first.');if(d.v==='new'&&!c.keys.length)toast('You have taken every topic test.');const y=scrollY;render();scrollTo(0,y)},
 cbn:d=>{cbd().n=+d.v;const y=scrollY;render();scrollTo(0,y)},
 cbt:d=>{cbd().spq=+d.v;const y=scrollY;render();scrollTo(0,y)},
 cbrun:()=>{const c=cbd(),pool=[];c.keys.forEach(k=>qbQs(k).forEach(q=>pool.push({...q,k})));if(!pool.length){toast('Choose at least one subject or topic.');return}
  const qs=shuf(pool).slice(0,c.n).map(q=>{const ix=shuf([0,1,2,3]);return{id:qid(q.q),k:q.k,q:q.q,o:ix.map(i=>q.o[i]),a:ix.indexOf(q.a),e:q.e||'',y:q.y||''}});
  const sj=[...new Set(c.keys.map(k=>k.split('|')[0]))],lb=sj.length===1?sj[0]+(c.keys.length>1?' ('+c.keys.length+' topics)':': '+c.keys[0].split('|').slice(1).join('|')):sj[0]+' + '+(sj.length-1)+' more subject'+(sj.length>2?'s':'');
  closeSheet();clearInterval(qxT);V.qt={key:'Custom|'+lb,cu:1,lb,cfg:{keys:c.keys.slice(),n:c.n,spq:c.spq},tid:'',qs,i:0,ans:qs.map(()=>null),mk:qs.map(()=>false),vis:qs.map(()=>false),ph:'intro',t0:0,limit:qs.length*c.spq,mode:'',fl:'all'};qxRender()}});
/* the topic-test buttons shared with the old key-based flow: the time-per-question chip above uses data-a="cbt" with data-v, topic rows use data-a="cbk" */

/* ---------- Progress > Tests: custom tests and overall numbers ---------- */
function custCard(){const H=(S.tests||[]).filter(h=>h&&h.exam===S.p.exam&&h.cu);if(!H.length)return'';
 const avg=Math.round(sum(H,pcOf)/H.length),best=Math.max(...H.map(pcOf));
 return`<section class="card"><h2>Custom tests</h2><div class="stats"><div><b>${H.length}</b><span>Taken</span></div><div><b>${avg}%</b><span>Average</span></div><div><b>${best}%</b><span>Best</span></div></div>`
  +H.slice(-6).reverse().map(h=>`<p class="row sp" style="margin:0 0 8px"><span class="sm" style="min-width:0">${esc(h.lb||'Custom test')}<br><span class="mu">${fD(h.at.slice(0,10))} · ${h.n} questions</span></span><span class="bd ${pcOf(h)>=80?'ok':pcOf(h)>=60?'wn':'no'}">${pcOf(h)}%</span></p>`).join('')
  +`<button class="btn o s" data-a="stt">Make another custom test</button></section>`}
function testSum(){const H=(S.tests||[]).filter(h=>h&&h.exam===S.p.exam);
 return`<section class="card"><h2>Tests</h2>`+(H.length?`<div class="stats"><div><b>${H.length}</b><span>Taken</span></div><div><b>${Math.round(sum(H,pcOf)/H.length)}%</b><span>Average</span></div><div><b>${H.filter(h=>h.cu).length}</b><span>Custom</span></div></div><button class="btn o s" data-a="pt" data-v="tests">See test details</button>`:`<p class="sm mu">No tests taken yet. Try a custom test from any topics you choose.</p><button class="btn s" data-a="stt">Take a test</button>`)+`</section>`}
A.stt=()=>{V.sv='ctest';if(V.tab!=='study')A.tab({v:'study'});else{V.fx=true;render()}};

/* ---- player direction: portrait, landscape (locks the screen where Android allows it, otherwise turns the video sideways) and full screen ---- */
const ytBox=()=>document.querySelector('#shb .yt');
function ytExit(){const b=ytBox();if(b)b.classList.remove('ls');const x=document.getElementById('ytx');if(x)x.remove();
 try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){}}
Object.assign(A,{
 ytpt:()=>{ytExit();vib(6)},
 ytfs:async()=>{const b=ytBox();if(!b)return;try{await b.requestFullscreen()}catch(e){toast('Full screen is not available here. Use the button inside the video.')}},
 ytls:async()=>{const b=ytBox();if(!b)return;vib(6);
  try{await b.requestFullscreen();await screen.orientation.lock('landscape');return}catch(e){}
  try{if(document.fullscreenElement)await document.exitFullscreen()}catch(e){}
  b.classList.add('ls');if(!document.getElementById('ytx')){const x=document.createElement('button');x.id='ytx';x.type='button';x.setAttribute('aria-label','Exit landscape');x.textContent='\u2715';x.addEventListener('click',ytExit);document.body.appendChild(x)}}});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){}}});
(function(){const c=window.closeSheet;if(typeof c==='function')window.closeSheet=function(){ytExit();return c.apply(this,arguments)}})();
