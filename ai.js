/* AI helpers. Gemini is called by your own Cloud Function at /api/ai, so the API key never reaches the browser.
   Loaded after app.js and account.js (uses their wait, sheet, toast, esc, byId, S and so on). Every AI answer is checked here and shown with esc(). */
const AI={
 on:()=>!!(window.Cloud&&Cloud.enabled&&Cloud.user&&navigator.onLine),
 async ask(task,data){
  let tok;try{tok=await Cloud.token()}catch(e){throw new Error('Please log in again.')}
  const r=await wait(fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify({task,data})}).then(async x=>({ok:x.ok,j:await x.json().catch(()=>({}))})),75000);
  if(r==='timeout')throw new Error('The AI took too long. Try again.');
  if(!r.ok)throw new Error(r.j.error||'The AI is not available right now.');
  if(!r.j.data)throw new Error('The AI sent an empty answer. Try again.');
  return r.j.data},
 async split(t){const d=await AI.ask('split',{exam:EX[S.p.exam].n,subject:t.subject,topic:t.topic,mins:t.mins});
  const a=(d.subtopics||[]).filter(x=>x&&typeof x.topic==='string'&&x.topic.trim()).slice(0,12).map(x=>({topic:x.topic.trim().slice(0,100),mins:Math.min(60,Math.max(30,r15(+x.mins||45)))}));
  if(!a.length)throw new Error('The AI could not split this topic. Try again.');return a},
 async quiz(t){const d=await AI.ask('quiz',{exam:EX[S.p.exam].n,subject:t.subject,topic:t.topic});
  const q=(d.questions||[]).filter(x=>x&&typeof x.q==='string'&&Array.isArray(x.options)&&x.options.length===4&&x.options.every(o=>typeof o==='string')&&Number.isInteger(x.answer)&&x.answer>=0&&x.answer<4).slice(0,3)
   .map(x=>({q:x.q.slice(0,400),o:x.options.map(o=>o.slice(0,200)),a:x.answer,e:String(x.explain||'').slice(0,400)}));
  if(q.length<3)throw new Error('The AI could not make 3 good questions. Try again.');return q},
 async coach(note,L,lim){const d=await AI.ask('coach',{exam:EX[S.p.exam].n,examDate:S.p.examDate,today:today(),hours:+S.p.hours,off:S.p.off!==''&&S.p.off!=null?DOW[S.p.off]:'',weak:S.p.weak||[],note,tasks:L,limits:lim});
  const last=addD(S.p.examDate,-1),okDate=k=>okD(k)&&k>=today()&&k<=last,ids=new Set(L.map(x=>x.id));
  const mv=(d.moves||[]).filter(x=>x&&ids.has(x.id)&&okDate(x.date)).map(x=>({id:x.id,date:x.date,mins:okM(+x.mins)?+x.mins:0,why:String(x.reason||'').slice(0,160)}));
  const ad=(d.adds||[]).filter(x=>x&&typeof x.subject==='string'&&x.subject.trim()&&typeof x.topic==='string'&&x.topic.trim()&&okDate(x.date)&&okM(+x.mins)).map(x=>({subject:x.subject.trim().slice(0,60),topic:x.topic.trim().slice(0,100),date:x.date,mins:+x.mins,why:String(x.reason||'').slice(0,160)}));
  return{sum:String(d.summary||'').slice(0,300),mv:mv.slice(0,8),ad:ad.slice(0,Math.max(0,8-mv.length))}}};
const aiLog=e=>{S.ai.hist=S.ai.hist.concat(Object.assign({id:uid(),at:new Date().toISOString()},e)).slice(-60);save()};   // saved in your account document, so it syncs
const aiWait=(h,m)=>sheet(`<h2>${h}</h2><div class="load" style="padding:24px 0"><div class="spin" aria-hidden="true"></div><p class="sm mu" style="margin-top:12px">${m}</p></div><button class="btn o w" data-a="x">Cancel</button>`);
const aiErr=(id,e)=>{if(V.air===id){closeSheet();toast(e&&e.message?e.message:'The AI is not available right now.')}};
function coachCard(){if(S.draft||!AI.on())return'';return`<section class="card"><h2>AI Coach</h2><p class="sm mu">Tell the coach about your week: a night shift, a weak mock test, a busy day. It suggests changes and nothing moves until you accept.</p><button class="btn w" data-a="coach">Ask AI Coach to adjust my week</button></section>`}
function aiCard(){const H=S.ai.hist;if(!H.length)return'';const Q=H.filter(h=>h.k==='quiz'),avg=Q.length?Math.round(sum(Q,h=>h.score)/Q.length):null;
 return`<section class="card"><h2>AI history</h2><p class="sm mu">${avg!==null?'Quiz average '+avg+'% over '+Q.length+' check'+(Q.length>1?'s':'')+'. ':''}Saved to your account.</p>${H.slice(-6).reverse().map(h=>`<p class="sm" style="margin:0 0 6px"><b>${h.k==='quiz'?'Quiz '+esc(h.score)+'%':h.k==='split'?'Split into '+esc(h.n)+' tasks':'Coach: '+esc(h.n)+' changes'}</b> · ${esc(h.subject||h.note||'')}${h.topic?': '+esc(h.topic):''}<br><span class="mu">${esc(fD(dk(new Date(h.at))))}</span></p>`).join('')}</section>`}
Object.assign(A,{
 /* Feature 1: break one broad task into 30 to 60 minute sub-tasks */
 aisp:async d=>{const t=byId(d.id),id=V.air=uid();if(!t||t.status!=='todo')return;aiWait('Splitting the topic','Finding high-yield sub-topics...');
  try{const a=await AI.split(t);if(V.air!==id||!sheetOpen())return;V.sp={id:t.id,a};
   sheet(`<h2>Sub-topics</h2><p class="sm mu">${esc(t.subject)}: ${esc(t.topic)} (${hm(t.mins)})</p>${a.map(x=>`<p class="row sp" style="margin:0 0 8px"><span>${esc(x.topic)}</span><span class="sm mu" style="white-space:nowrap">${hm(x.mins)}</span></p>`).join('')}<p class="sm">${a.length} tasks, ${hm(sum(a,x=>x.mins))} in total. Suggested by AI: check them against your syllabus.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Keep original</button><button class="btn" style="flex:1" data-a="aispok">Replace task</button></div>`)}
  catch(e){aiErr(id,e)}},
 aispok:()=>{const o=V.sp,t=o&&byId(o.id);if(!t){closeSheet();return}
  const add={},base=t.date;S.tasks=S.tasks.filter(x=>x.id!==t.id);   // frees the original's minutes first
  o.a.forEach(x=>{const d=base>=today()&&load(base,add)+x.mins<=cap(base)?base:(bestDays(x.mins,add)[0]||(base>=today()?base:today()));add[d]=(add[d]||0)+x.mins;
   S.tasks.push(Object.assign({id:uid(),subject:t.subject,topic:x.topic,mins:x.mins,pri:t.pri,date:d,type:t.type,why:'Split by AI from: '+t.topic,status:'todo',gen:t.gen,ai:true},t.tk?{tk:t.tk}:{}))});
  aiLog({k:'split',subject:t.subject,topic:t.topic,n:o.a.length});V.sp=null;closeSheet();render();toast('Task split into '+o.a.length)},
 /* Feature 2: 3-question active recall check, scored into the study log */
 aiq0:async()=>{const t=byId(V.lg.id),id=V.air=uid();aiWait('Preparing your quiz','Writing 3 exam-level questions...');
  try{const q=await AI.quiz(t);if(V.air!==id||!sheetOpen())return;V.qz={id:t.id,q,a:[null,null,null]};qzSheet()}
  catch(e){if(V.air===id){toast(e&&e.message?e.message:'The AI is not available right now.');logSheet()}}},
 aiqa:d=>{V.qz.a[+d.k]=+d.v;document.querySelectorAll('[data-a=aiqa][data-k="'+d.k+'"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===d.v))},
 aiqs:()=>{const z=V.qz;if(z.a.some(x=>x===null)){toast('Answer all 3 questions first.');return}
  const t=byId(z.id),c=z.q.filter((x,i)=>z.a[i]===x.a).length,pc=Math.round(c/3*100);
  V.lg.s=String(pc);V.lg.n='3';if(!V.lg.k.includes('mcq'))V.lg.k.push('mcq');aiLog({k:'quiz',subject:t.subject,topic:t.topic,score:pc,n:3});
  sheet(`<h2>${c} of 3 correct</h2><p class="sm mu">Score ${pc}%. This goes into your study log.</p>${z.q.map((x,i)=>`<div class="qres ${z.a[i]===x.a?'ok':'no'}"><b>${i+1}. ${esc(x.q)}</b><br><span class="sm">${z.a[i]===x.a?'Correct':'Your answer: '+esc(x.o[z.a[i]])}. Answer: <b>${esc(x.o[x.a])}</b></span><br><span class="sm mu">${esc(x.e)}</span></div>`).join('')}<button class="btn w" data-a="aiqd">Save and get advice</button>`)},
 aiqd:()=>A.lgok(),
 /* Feature 3: AI Coach adjusts the next 7 days */
 coach:()=>sheet(`<h2>AI Coach</h2><label for="ai_n">What should the coach know? (up to 300 characters)</label><textarea id="ai_n" maxlength="300" rows="4" placeholder="For example: night duty on Wednesday and Thursday. My last mock was weak in Pharmacology."></textarea><p class="sm mu" style="margin-top:8px">Your note and your next 7 days of tasks are sent to the AI to make suggestions.</p><p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="coachgo">Get suggestions</button></div>`),
 coachgo:async()=>{const note=$('#ai_n').value.trim(),e=$('#se');if(note.length<3){e.textContent='Write a short note first.';return}
  const D=[...Array(7)].map((_,i)=>addD(today(),i)),L=S.tasks.filter(t=>D.includes(t.date)&&t.status!=='done').map(t=>({id:t.id,date:t.date,subject:t.subject,topic:t.topic,mins:t.mins,pri:t.pri,type:t.type,status:t.status}));
  if(!L.length){e.textContent='There are no open tasks in the next 7 days.';return}
  const lim={};D.forEach(k=>lim[k]=cap(k));const id=V.air=uid();aiWait('Asking the coach','Looking at your week...');
  try{const r=await AI.coach(note,L,lim);if(V.air!==id||!sheetOpen())return;V.co=Object.assign(r,{note:note.slice(0,120)});
   if(!r.mv.length&&!r.ad.length){sheet(`<h2>No changes suggested</h2><p>${esc(r.sum||'The coach thinks your week already fits.')}</p><button class="btn w" data-a="x">Close</button>`);return}
   sheet(`<h2>Coach suggestions</h2><p>${esc(r.sum)}</p>${r.mv.map(x=>{const t=byId(x.id);return`<p><b>${esc(t.subject)}</b>: ${esc(t.topic)}<br><span class="sm">${fD(t.date)} to <b>${fD(x.date)}</b>${x.mins?', '+hm(x.mins):''}</span>${x.why?'<br><span class="sm mu">'+esc(x.why)+'</span>':''}</p>`}).join('')}${r.ad.map(x=>`<p><b>Add: ${esc(x.subject)}</b>: ${esc(x.topic)}<br><span class="sm">${fD(x.date)}, ${hm(x.mins)}</span>${x.why?'<br><span class="sm mu">'+esc(x.why)+'</span>':''}</p>`).join('')}<p class="sm mu">Suggested by AI. Days that would go over your limit are skipped.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Reject</button><button class="btn" style="flex:1" data-a="coachok">Accept</button></div>`)}
  catch(x){aiErr(id,x)}},
 coachok:()=>{const c=V.co;if(!c)return;let ok=0,sk=0;
  c.mv.forEach(x=>{const t=byId(x.id);if(!t||t.status==='done'){sk++;return}const m=x.mins||t.mins;
   if(load(x.date)+m-(t.date===x.date?t.mins:0)>cap(x.date)){sk++;return}moveT(t,x.date,m);ok++});
  c.ad.forEach(x=>{if(load(x.date)+x.mins>cap(x.date)){sk++;return}S.tasks.push({id:uid(),subject:x.subject,topic:x.topic,mins:x.mins,pri:'Medium',date:x.date,type:'study',why:'Suggested by AI Coach',status:'todo',ai:true});ok++});
  aiLog({k:'coach',note:c.note,n:ok});V.co=null;closeSheet();render();toast(ok+' change'+(ok===1?'':'s')+' applied'+(sk?', '+sk+' skipped':''))}});
function qzSheet(){const z=V.qz,t=byId(z.id);
 sheet(`<h2>Quick check</h2><p class="mu">${esc(t.subject)}: ${esc(t.topic)}</p>${z.q.map((x,i)=>`<h3>${i+1}. ${esc(x.q)}</h3><div class="opts" role="group" aria-label="Question ${i+1}">${x.o.map((o,j)=>chip('aiqa',i,j,z.a[i]===j,String.fromCharCode(65+j)+'. '+o)).join('')}</div>`).join('')}<div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="aiqs">Check answers</button></div>`)}
