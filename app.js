
'use strict';
const VER='v6, 17 Oct 2026';
const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
const dk=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const pd=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const addD=(k,n)=>{const d=pd(k);d.setDate(d.getDate()+n);return dk(d)};
const today=()=>dk(new Date());
const diff=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const okD=k=>/^\d{4}-\d{2}-\d{2}$/.test(k||'')&&dk(pd(k))===k;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fD=k=>pd(k).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
const hm=m=>{m=Math.round(m);return m>=60?Math.floor(m/60)+'h'+(m%60?' '+m%60+'m':''):m+'m'};
const uid=()=>Math.random().toString(36).slice(2,10);
const sum=(a,f)=>a.reduce((x,t)=>x+f(t),0);
const P={High:0,Medium:1,Low:2},DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const RES=['Video lectures','Standard textbooks','Question bank (QBank)','Own notes','Previous-year papers','Mock test series','Flashcards'];
const LK='aimsarthi:v1',fresh=()=>({p:{hours:4,workHrs:0,off:'',done:[],weak:[],res:[]},tasks:[],draft:null,sessions:[],timer:null,top:[],rem:{on:false},days:[]});
let S=null,ready=false,mode='local',ref=null,q=Promise.resolve(),sT,iv,tT,fromCloud=false;
let V={tab:'home',day:today(),wk:0,step:0,err:'',cal:today().slice(0,7),tt:'',st:'',lx:''};
const CL=()=>window.Cloud||{enabled:false,user:null};
const lkey=()=>LK+(CL().user?':'+CL().user.uid:'');
const byId=id=>S.tasks.find(t=>t.id===id);
const doneMin=t=>t.status==='done'?t.mins:t.status==='partial'?Math.round(t.mins/2):0;
const okM=m=>Number.isInteger(m)&&m>=30&&m<=600&&m%15===0,r15=m=>Math.max(30,Math.round(m/15)*15),remain=t=>t.status==='partial'?r15(t.mins-Math.round(t.mins/2)):Math.max(30,t.mins);
const tasksOn=k=>S.tasks.filter(t=>t.date===k).sort((a,b)=>P[a.pri]-P[b.pri]||a.mins-b.mins);
const miss=()=>S.tasks.filter(t=>!t.resolved&&t.date<today()&&t.status!=='done');
const cap=()=>(+S.p.hours)*60;
const load=(k,x)=>sum(S.tasks.filter(t=>t.date===k),t=>t.mins)+((x&&x[k])||0);
const repl=t=>t.gen&&t.status==='todo'&&!t.history&&t.date>=today();
const wkDays=o=>{const d=pd(today());d.setDate(d.getDate()-(d.getDay()+6)%7+o*7);const s=dk(d);return[...Array(7)].map((_,i)=>addD(s,i))};
const chip=(a,k,v,on,l)=>`<button type="button" class="chip" data-a="${a}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${!!on}">${esc(l||v)}</button>`;
const inp=(id,l,a)=>`<label for="${id}">${l}</label><input id="${id}" ${a}>`;

/* ---------- storage: private per-user doc in the artifact db, else this browser ---------- */
function setSt(t){V.st=t;const e=$('#st');if(e)e.textContent=t}
function ls(d){try{localStorage.setItem(lkey(),JSON.stringify(d));setSt('Saved on this device')}catch(e){setSt('Could not save: browser storage is unavailable.')}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let skipNow=()=>{};const skipP=new Promise(r=>{skipNow=r});
const wait=(p,ms,skip)=>Promise.race([p,sleep(ms).then(()=>'timeout')].concat(skip?[skipP.then(()=>'timeout')]:[]));   // never wait forever on a slow connection
let pull=false;                                  // true while the cloud copy has not been read: we then avoid overwriting it
function save(){S.upd=Date.now();clearTimeout(sT);sT=setTimeout(()=>{flush();pushMeta()},300)}
function flush(){q=q.then(async()=>{
 S.sessions=S.sessions.slice(-500);const data=JSON.parse(JSON.stringify(S));ls(data);
 if(CL().user){if(pull){setSt('Saved on this phone. It will sync when you are back online.');return}
  try{const r=await wait(Cloud.saveState(data),12000);if(r==='timeout')throw 0;setSt('Saved to your account');pushStats()}catch(e){setSt('Saved on this phone. Could not reach your account; it will retry on the next change.')}}})}
const flushNow=()=>{clearTimeout(sT);flush();return q};
let lastStats=0;
function statsNow(){const a=act();let st=0,c=today();if(!a.has(c))c=addD(c,-1);while(a.has(c)){st++;c=addD(c,-1)}
 return{exam:S.p.exam||'',examDate:S.p.examDate||'',level:S.p.level||'',daysUsed:(S.days||[]).length,streak:st,tasksTotal:S.tasks.length,tasksDone:S.tasks.filter(t=>t.status==='done').length,minutesStudied:sum(S.sessions,x=>x.mins),app:VER}}
function pushStats(){if(!CL().user||Date.now()-lastStats<6e4)return;lastStats=Date.now();Cloud.saveProfile(statsNow()).catch(()=>{})}
const readLocal=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
async function pullCloud(){try{const s=await wait(Cloud.loadState(),7000,true);return s==='timeout'?null:(s||{})}catch(e){return null}}   // null = could not read
async function loadState(){
 const u=CL().user;let s=null;pull=false;const loc=readLocal(lkey());
 if(u){const c=await pullCloud();if(c===null)pull=true;
  s=[c,loc].filter(x=>x&&x.p).sort((x,y)=>(y.upd||0)-(x.upd||0))[0]||null;                 // the newer copy wins
  if(!s){const g=readLocal(LK);if(g&&g.p){s=g;try{localStorage.removeItem(LK)}catch(e){}}}}
 else s=loc;
 S=Object.assign(fresh(),s||{});S.p=Object.assign(fresh().p,S.p);
 if(u&&!S.p.name)S.p.name=u.username;
 S.seen=new Date().toISOString();S.days=S.days||[];if(!S.days.includes(today()))S.days=S.days.concat(today()).slice(-400);
 mode=u?'cloud':'local';
 if(u){Cloud.loadStrategies().then(r=>{r.forEach(e=>{if(!STRATEGIES.some(z=>z.id===e.id)){e.fixed=true;STRATEGIES.push(e)}});render()}).catch(()=>{});
  if(pull)setSt('Offline: your saved plan is loaded. It will sync when you are back online.');else{flush();pushStats()}}}
async function retryPull(){if(!pull||!CL().user||!S)return;const c=await pullCloud();if(c===null)return;pull=false;
 if(c.p&&(c.upd||0)>(S.upd||0)){const k=S.timer;S=Object.assign(fresh(),c);S.p=Object.assign(fresh().p,S.p);if(k)S.timer=k;ls(S);render();toast('Updated from your account')}else flush()}
async function afterAuth(){await loadState();if(!S.p.onboarded)V.step=1;V.tab='home';ready=true}
async function boot(){
 V.lm='Starting up';render();
 const slowT=setTimeout(()=>{if(!ready){V.slow=true;render()}},6000);
 V.lm='Connecting';render();try{await wait(window.cloudReady,6000,true)}catch(e){}
 V.lm='Loading your plan';render();
 await loadState();ready=true;clearTimeout(slowT);V.slow=false;
 if(S.timer){startTick();armAlarm()}
 setInterval(chkRem,6e4);setInterval(retryPull,6e4);addEventListener('online',()=>{retryPull();if(typeof flushFb==='function')flushFb()});
 pushMeta();if(typeof flushFb==='function')flushFb();render()}

/* ---------- plan generation (plain rules, no API) ---------- */
function gen(p){return Engine.plan(p,EX[p.exam],STRATEGIES.concat(S.top),S.tasks)}

/* ---------- onboarding ---------- */
function chk(s){const p=S.p;
 if(s===1){const n=(p.name||'').trim();return n&&n.length<=40?'':'Enter your name (up to 40 characters).'}
 if(s===2)return EX[p.exam]?'':'Choose an exam.';
 if(s===3){if(!okD(p.examDate))return'Enter a valid exam date.';const n=diff(today(),p.examDate);if(n<2)return'The exam date must be at least 2 days from today.';if(n>1100)return'The exam date must be within about 3 years.';const t=(p.target||'').trim();return t&&t.length<=80?'':'Enter a target score or rank (up to 80 characters).'}
 if(s===4){const h=+p.hours,w=+p.workHrs;if(!(h>=.5&&h<=16))return'Daily study hours must be between 0.5 and 16.';if(!(w>=0&&w<=16))return'Work hours must be between 0 and 16.';return h+w<=20?'':'Study plus work hours leave under 4 hours for sleep and meals. Please lower one.'}
 if(s===5)return p.level?'':'Choose your current level.';
 if(s===6)return(p.resOther||'').length>120?'Keep other resources under 120 characters.':'';
 return''}
function wiz(){const p=S.p,s=V.step;
 if(!s)return`<section class="welcome"><div class="road lg" aria-hidden="true"><i class="done"></i><i class="done"></i><i class="partial"></i><i class="done"></i><i></i><i></i><i></i></div><h1 class="logo">AimSarthi</h1><p class="lead">Your study guide from today to exam day. Build a realistic roadmap, track study time, keep a streak, and recover from missed days without piling everything onto tomorrow.</p><p class="note">Built first for NEET PG aspirants who are also doing an internship. Available exams: ${Object.values(EX).map(e=>e.n).join(', ')}. Plans are suggestions from your answers, not verified advice, and cannot promise any score or rank.</p><button class="btn w" style="margin-top:16px" data-a="next">Get started</button></section>`;
 const T=['','Create your profile','Choose your exam','Exam date and target','Daily time and commitments','Where you stand','Study resources'][s];let b='';
 if(s===1)b=`<p class="note">${mode==='cloud'?'You are signed in as <b>'+esc(CL().user.username)+'</b>. Your plan is saved to your account.':'Accounts are not set up in this copy, so your plan is saved on this device only. Clearing browser data erases it.'}</p>`+inp('w_n','Your name',`data-f="name" maxlength="40" autocomplete="given-name" value="${esc(p.name||'')}"`);
 if(s===2)b=`<div class="chips">${Object.keys(EX).map(k=>chip('pick','exam',k,p.exam===k,EX[k].n)).join('')}</div><p class="sm mu" style="margin-top:8px">NEET PG is the pilot focus. Other exams use the same planner with their own subject lists.</p>`;
 if(s===3)b=inp('w_d','Exam date',`type="date" data-f="examDate" min="${addD(today(),2)}" max="${addD(today(),1100)}" value="${esc(p.examDate||'')}"`)+inp('w_t','Target score or rank',`data-f="target" maxlength="80" placeholder="For example: rank under 2,000" value="${esc(p.target||'')}"`)+'<p class="sm mu" style="margin-top:8px">Your target is for motivation. It does not change what is possible.</p>';
 if(s===4)b=inp('w_h','Hours per day you can study (0.5 to 16)',`type="number" inputmode="decimal" step="0.5" min="0.5" max="16" data-f="hours" value="${esc(p.hours)}"`)+inp('w_w','Internship or work hours per day',`type="number" inputmode="decimal" step="0.5" min="0" max="16" data-f="workHrs" value="${esc(p.workHrs)}"`)+`<label for="w_o">Weekly day off</label><select id="w_o" data-f="off"><option value="">No fixed day off</option>${DOW.map((d,i)=>`<option value="${i}" ${p.off===String(i)?'selected':''}>${d}</option>`).join('')}</select>`+inp('w_c','Commitment notes (optional)',`data-f="workNote" maxlength="120" placeholder="For example: night duty on Fridays" value="${esc(p.workNote||'')}"`);
 if(s===5)b=`<h3>Current level</h3><div class="chips" style="margin:8px 0">${['Beginner','Intermediate','Advanced'].map(l=>chip('pick','level',l,p.level===l)).join('')}</div><h3>Subjects completed</h3><div class="chips" style="margin:8px 0">${EX[p.exam].sub.map(x=>chip('tg','done',x,(p.done||[]).includes(x))).join('')}</div><h3>Subjects needing improvement</h3><div class="chips" style="margin:8px 0">${EX[p.exam].sub.map(x=>chip('tg','weak',x,(p.weak||[]).includes(x))).join('')}</div>`;
 if(s===6)b=`<div class="chips">${RES.map(x=>chip('tg','res',x,(p.res||[]).includes(x))).join('')}</div>`+inp('w_r','Other resources (optional)',`data-f="resOther" maxlength="120" value="${esc(p.resOther||'')}"`);
 return`<div class="bar" role="progressbar" aria-label="Setup progress" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${s}"><i style="width:${s/6*100}%"></i></div><h1 style="margin-top:16px">${T}</h1>${b}<p class="er" role="alert" style="margin-top:8px">${esc(V.err)}</p><div class="row"><button class="btn o" data-a="back">Back</button><button class="btn" style="flex:1" data-a="next">${s<6?'Continue':'Build my roadmap'}</button></div>`}

/* ---------- views ---------- */
function cal(){const[y,m]=V.cal.split('-').map(Number),f=new Date(y,m-1,1),n=new Date(y,m,0).getDate(),off=(f.getDay()+6)%7;
 let c='MTWTFSS'.split('').map(x=>`<span class="wd" aria-hidden="true">${x}</span>`).join('')+'<span></span>'.repeat(off);
 for(let d=1;d<=n;d++){const k=y+'-'+pad(m)+'-'+pad(d),T=S.tasks.filter(t=>t.date===k),all=T.length&&T.every(t=>t.status==='done');
  c+=`<button class="cd${k===V.day?' sel':''}${k===today()?' now':''}" data-a="day" data-v="${k}" aria-label="${fD(k)}, ${T.length} tasks" aria-pressed="${k===V.day}">${d}<i class="${all?'ok':T.length?'has':''}"></i></button>`}
 return`<section class="card"><div class="row sp"><button class="btn o s" data-a="cm" data-v="-1" aria-label="Previous month">&lsaquo;</button><h2 style="margin:0">${f.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2><button class="btn o s" data-a="cm" data-v="1" aria-label="Next month">&rsaquo;</button></div><div class="grid7">${c}</div></section>`}
const logged=t=>sum(S.sessions.filter(x=>x.taskId===t.id),x=>x.mins);
const med=a=>{a=a.slice().sort((x,y)=>x-y);const n=a.length;return n?(n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2):0};
function agg(x){const E=STRATEGIES.concat(S.top).filter(e=>e.exam===x),mo=E.map(e=>e.mo||0).filter(v=>v>0),hr=E.map(e=>e.hr||0).filter(v=>v>0);
 return`<section class="card"><h2>Pattern from your entries</h2><p class="sm mu">Calculated only from entries you added with sources. Treat it as meaningful with 20 or more.</p><div class="bar" style="margin:6px 0"><i style="width:${Math.min(100,E.length*5)}%"></i></div><p class="sm" style="margin:0">${E.length} of 20 entries${mo.length?' · median '+med(mo)+' months reported':''}${hr.length?' · median '+med(hr)+' h/day reported':''}</p></section>`}
const SYM={done:'&#10003;',partial:'&frac12;',incomplete:'&#10005;',todo:''},LAB={done:'done',partial:'partly done',incomplete:'not done',todo:'not started'};
const trow=t=>`<div class="trow"><button class="chk ${t.status}" data-a="st" data-id="${t.id}" data-v="done" aria-pressed="${t.status==='done'}" aria-label="${esc(t.subject)}, ${LAB[t.status]}. Tap to mark done">${SYM[t.status]}</button><div class="m"><b>${esc(t.subject)}</b><span class="sm mu">${esc(t.topic)}</span><span class="sm">${hm(t.mins)}${logged(t)?' · studied '+hm(logged(t)):''} · <span class="pri ${t.pri}">${t.pri}</span>${t.type!=='study'?' · '+(t.type==='mock'?'mock test':'revision'):''}${t.history?' · moved':''}</span></div><button class="more" data-a="tm" data-id="${t.id}" aria-label="More options for ${esc(t.subject)}">&#8943;</button></div>`;
function ring(p){const c=251.3;return`<svg class="ring" viewBox="0 0 96 96" role="img" aria-label="${p}% of the plan done"><circle class="t" cx="48" cy="48" r="40"/><circle class="v" cx="48" cy="48" r="40" stroke-dasharray="${c}" stroke-dashoffset="${(c*(1-p/100)).toFixed(1)}" transform="rotate(-90 48 48)"/><text x="48" y="48">${p}%</text></svg>`}
function act(){const a=new Set(),m={};S.tasks.forEach(t=>{if(t.doneDate&&(t.status==='done'||t.status==='partial'))a.add(t.doneDate)});S.sessions.forEach(x=>m[x.day]=(m[x.day]||0)+x.mins);for(const k in m)if(m[k]>=20)a.add(k);return a}
function dayMins(k){return sum(S.sessions.filter(x=>x.day===k),x=>x.mins)+(S.timer&&dk(new Date(S.timer.start))===k?Math.floor((Date.now()-new Date(S.timer.start))/6e4):0)}
function home(){
 const k=V.day,T=tasksOn(k),est=sum(T,t=>t.mins),dm=sum(T,doneMin),pc=est?Math.round(dm/est*100):0,n=diff(today(),S.p.examDate),M=miss(),a=act(),nd=T.filter(t=>t.status==='done').length;
 let st=0,c=today();if(!a.has(c))c=addD(c,-1);while(a.has(c)){st++;c=addD(c,-1)}
 const next=T.find(t=>t.status==='todo')||T.find(t=>t.status==='partial'),up=S.tasks.filter(t=>t.date>today()&&t.status!=='done').sort((x,y)=>x.date<y.date?-1:x.date>y.date?1:P[x.pri]-P[y.pri]).slice(0,4);
 const wk=wkDays(0).map(d=>`<button class="${d===V.day?'sel':''}${d===today()?' now':''}" data-a="day" data-v="${d}" aria-pressed="${d===V.day}" aria-label="${fD(d)}"><span class="sm">${pd(d).toLocaleDateString(undefined,{weekday:'narrow'})}</span><b>${pd(d).getDate()}</b><i class="${S.tasks.some(t=>t.date===d)?'has':''}"></i></button>`).join('');
 return`<div class="hero"><div style="flex:1;min-width:0"><h1>Hi ${esc(S.p.name)}</h1><p>${n>0?n+' days to '+EX[S.p.exam].n:'Exam date has passed'}</p><p class="sm">${k===today()?'Today':fD(k)}: ${nd} of ${T.length} tasks done · ${hm(dm)} of ${hm(est)}</p><span class="pill">${st}-day streak</span></div>${ring(pc)}</div>`
 +(M.length?`<div class="note" style="margin-bottom:14px"><b>${M.length} missed task${M.length>1?'s':''}.</b> <button class="btn s" data-a="tab" data-v="recover" style="margin-left:6px">Fix my plan</button></div>`:'')
 +`<div class="wk">${wk}</div>`
 +(next&&k===today()&&!S.timer?`<section class="card next"><p class="sm mu" style="margin:0">Up next</p><h2 style="margin:2px 0">${esc(next.subject)}</h2><p style="margin:0">${esc(next.topic)} · ${hm(next.mins)}</p><button class="btn" data-a="go" data-id="${next.id}">Start studying</button></section>`:'')
 +`<section class="card"><div class="row sp"><h2 style="margin:0">${k===today()?"Today's tasks":fD(k)}</h2><button class="btn o s" data-a="add">Add task</button></div>${T.length?T.map(trow).join(''):'<p class="mu" style="margin:12px 0 0">No tasks on this day. Add one, or pick another day.</p>'}${k===today()&&!S.timer?'<button class="btn o w" style="margin-top:10px" data-a="go" data-id="">Start a timer without a task</button>':''}<p class="sm mu" style="margin:10px 0 0">Tap the circle when a task is done. Tap the three dots for partly done, not done, or delete. Times are guides: studying a little more or less is fine.</p></section>`
 +`<details class="card"><summary><b>Month calendar</b></summary>${cal()}</details>`
 +(up.length?`<section class="card"><h2>Coming up</h2>${up.map(t=>`<p class="row sp" style="margin:0 0 6px"><span>${esc(t.subject)}: ${esc(t.topic)}</span><span class="sm mu" style="white-space:nowrap">${fD(t.date)}</span></p>`).join('')}</section>`:'')
 +`<p class="sm mu">Streak: a day counts with 20+ minutes timed, or a task marked done or partly done.</p>`}
function planCard(d){const sm=d?d.summary:S.p.summary,m=d?d.mode:S.p.planMode;if(!sm)return'';
 const cur=Engine.modeFor(Math.max(1,diff(today(),S.p.examDate))),sk=sm.skipped||[],ch=!d&&m&&m!==cur;
 return(ch?`<div class="note" style="margin-bottom:12px"><b>Your exam is now closer.</b> Rebuild to switch to the ${esc(Engine.modeName(cur,S.p.level))}. Finished work is kept.<br><button class="btn s" style="margin-top:8px" data-a="regen">Build a new draft</button></div>`:'')
 +`<section class="card"><h2>${esc(Engine.modeName(m,S.p.level))}</h2><p class="sm">${Math.max(0,diff(today(),S.p.examDate))} days to the exam. Study time for new topics: <b>${hm(sm.supply)}</b>. Time the topics need: <b>${hm(sm.demand)}</b>.${sm.placeholder?' '+sm.placeholder+'% of topic times are placeholder estimates until real data is added.':''}</p>`
 +(sk.length?`<details><summary class="sm"><b>${sk.length} topic${sk.length>1?'s':''} skipped because time is short</b> (lowest priority first)</summary>${sk.map(x=>`<p class="sm" style="margin:4px 0">${esc(x.s)}: ${esc(x.n)} (${hm(x.min)})</p>`).join('')}</details>`:'<p class="sm mu" style="margin:0">Every topic fits in the time you have.</p>')
 +(sm.later?`<p class="sm mu" style="margin:8px 0 0">Showing the first ${sm.emit} days. Rebuild later to continue from where you are.</p>`:'')+'</section>'}
function roadmap(){
 const d=S.draft,L=d?d.tasks:S.tasks,st=d?d.start:(S.p.planStart||today());
 if(!L.length)return`<h1>Roadmap</h1><div class="card"><h2>No roadmap yet</h2><p class="mu">Build a suggested plan from your answers, review it, then accept it.</p><button class="btn w" data-a="regen">Build my roadmap</button></div>`;
 const W={};L.forEach(t=>{const w=Math.max(0,Math.floor(diff(st,t.date)/7));(W[w]=W[w]||[]).push(t)});
 const ms=L.filter(t=>t.type!=='study'&&t.date>=today()).sort((a,b)=>a.date<b.date?-1:1).slice(0,5),rp=S.tasks.filter(repl).length;
 const LR=Engine.learn(S.p.exam,STRATEGIES.concat(S.top));let h=`<h1>${d?'Review your roadmap':'Your roadmap'}</h1><p class="note"><b>Suggestions, not verified facts.</b> ${esc(LR.note)} About 85% of your ${S.p.hours} daily hours is planned and the rest stays free as catch-up buffer. Check topic names against your official syllabus. No plan can guarantee a score or rank.</p>`;
 h+=d?`<div class="card" style="margin-top:12px"><p>${hm(sum(d.tasks,t=>t.mins))} across ${d.tasks.length} tasks. ${rp?`Accepting replaces ${rp} untouched suggested task${rp>1?'s':''} from your earlier plan. Finished, partial, moved and manual tasks stay.`:''}</p><button class="btn w" data-a="accept">Accept roadmap</button><div class="row" style="margin-top:8px"><button class="btn o" style="flex:1" data-a="regen">Rebuild</button><button class="btn o" style="flex:1" data-a="redo">Edit answers</button></div></div>`
 :`<div class="row" style="margin:12px 0"><button class="btn o s" data-a="regen">Build a new draft</button><button class="btn o s" data-a="redo">Edit answers</button></div>`;
 h+=planCard(d);h+=`<section class="card"><h2>Revision and mock milestones</h2>${ms.length?ms.map(t=>`<p class="row sp" style="margin:0 0 6px"><span>${esc(t.type==='mock'?'Mock test':'Revision: '+t.subject)}</span><span class="sm mu">${fD(t.date)}</span></p>`).join(''):'<p class="mu">None scheduled.</p>'}</section>`;
 Object.keys(W).forEach(w=>{const X=W[w],ds=[...new Set(X.map(t=>t.date))].sort(),foc=[...new Set(X.filter(t=>t.type==='study').map(t=>t.subject))].slice(0,4).join(', ')||'revision';
  h+=`<details class="card" ${w==='0'?'open':''}><summary><b>Week ${+w+1}</b> <span class="sm mu">${fD(ds[0])} to ${fD(ds[ds.length-1])}</span><br><span class="sm">Goal: cover ${esc(foc)}; ${X.filter(t=>t.type==='revision').length} revision and ${X.filter(t=>t.type==='mock').length} mock sessions. ${hm(sum(X,t=>t.mins))} planned.</span></summary>`
  +ds.map(k=>`<h3>${fD(k)}</h3>`+X.filter(t=>t.date===k).map(t=>`<p class="rw ${t.status}"><b>${esc(t.subject)}</b>: ${esc(t.topic)}<br><span class="sm mu">${hm(t.mins)} · <span class="pri ${t.pri}">${t.pri}</span>${t.type!=='study'?' · '+t.type:''}${d?' · suggested':''}</span></p>`).join('')).join('')+'</details>'});
 return h}
function recover(){
 const M=miss().sort((a,b)=>P[a.pri]-P[b.pri]||(a.date<b.date?-1:1));
 if(!M.length)return`<h1>Recover</h1><div class="card"><h2>Nothing missed</h2><p class="mu">Unfinished tasks from past days appear here. Nothing is moved or deleted unless you accept it.</p></div>`;
 const tot=sum(M,t=>t.mins),c=cap(),free=sum([1,2,3,4,5,6,7].map(i=>addD(today(),i)),k=>Math.max(0,c-load(k)));
 return`<h1>Recover</h1><section class="card"><h2>Remaining workload</h2><div class="stats"><div><b>${hm(tot)}</b><span>Missed</span></div><div><b>${hm(free)}</b><span>Free, next 7 days</span></div><div><b>${hm(c)}</b><span>Daily limit</span></div></div><p class="sm">Putting all ${hm(tot)} on tomorrow would make it ${hm(load(addD(today(),1))+tot)}, above your ${hm(c)} limit. So we spread the work out instead. You approve every change.</p><button class="btn w" data-a="sug">Suggest a gentle plan</button></section>`
 +M.map(t=>`<article class="card tk ${t.status}"><b>${esc(t.subject)}</b>: ${esc(t.topic)}<p class="sm mu" style="margin:0 0 8px">Planned ${fD(t.date)} · ${hm(t.mins)} · ${t.status==='partial'?'partly done':'not done'}</p><div class="row"><button class="btn s" data-a="rs" data-id="${t.id}">Reschedule</button><button class="btn o s" data-a="skip" data-id="${t.id}">Dismiss</button></div></article>`).join('')}
function progress(){
 const D=wkDays(V.wk),T=S.tasks.filter(t=>D.includes(t.date)),pl=sum(T,t=>t.mins),cp=sum(T,doneMin),a=act(),el=D.filter(k=>k<=today()),ac=el.filter(k=>a.has(k)).length;
 const per=D.map(k=>{const x=T.filter(t=>t.date===k);return[sum(x,t=>t.mins),sum(x,doneMin)]}),mx=Math.max(60,...per.map(x=>x[0])),out=T.filter(t=>t.status!=='done'),SB={};
 S.tasks.forEach(t=>{const o=SB[t.subject]||(SB[t.subject]={p:0,c:0});o.p+=t.mins;o.c+=doneMin(t)});
 return`<h1>Weekly progress</h1><div class="row sp"><button class="btn o s" data-a="wk" data-v="-1">&lsaquo; Prev</button><b>${fD(D[0])} to ${fD(D[6])}</b><button class="btn o s" data-a="wk" data-v="1">Next &rsaquo;</button></div>`
 +`<section class="card" style="margin-top:12px"><div class="stats"><div><b>${hm(pl)}</b><span>Planned</span></div><div><b>${hm(cp)}</b><span>Completed</span></div><div><b>${hm(sum(S.sessions.filter(s=>D.includes(s.day)),s=>s.mins))}</b><span>Timed</span></div></div><div class="chart" role="img" aria-label="Planned versus completed study for each day, Monday to Sunday">${per.map((x,i)=>`<div class="col"><div class="bars"><i class="pl" style="height:${x[0]/mx*100}%"></i><i class="cp" style="height:${x[1]/mx*100}%"></i></div><span class="sm">${'MTWTFSS'[i]}</span></div>`).join('')}</div><p class="sm mu" style="margin:6px 0 0">Light bars: planned. Dark bars: completed (partial counts as half).</p></section>`
 +`<section class="card"><h2>Tasks and consistency</h2><p>${T.filter(t=>t.status==='done').length} of ${T.length} tasks completed. ${out.length} outstanding, ${out.filter(t=>t.date<today()).length} of them already past.</p><p>${el.length?ac+' of '+el.length+' days active this week.':'This week has not started yet.'}</p></section>`
 +`<section class="card"><h2>Subject-wise progress</h2>${Object.keys(SB).length?Object.entries(SB).sort((x,y)=>y[1].p-x[1].p).map(([s,o])=>{const p=Math.round(o.c/o.p*100);return`<p class="row sp" style="margin:0 0 2px"><span>${esc(s)}</span><span class="sm mu">${p}% · ${hm(o.c)} of ${hm(o.p)}</span></p><div class="bar g" style="margin-bottom:10px"><i style="width:${p}%"></i></div>`}).join(''):'<p class="mu">Subject progress appears once you have tasks.</p>'}</section>`
 +`<section class="card"><h2>Progress explanation</h2><p class="mu">Placeholder: a future AI summary will explain your week here. Everything above works without it.</p><button class="btn o w" disabled>Explain my week (coming soon)</button></section>`
 +remCard()+`<section class="card"><h2>Your data</h2><p class="sm mu">${mode==='cloud'?'Saved to your AimSarthi account and on this phone.':'Stored in this browser only.'}</p><button class="btn o s" data-a="reset">Start over</button></section>`}
function library(){
 const x=V.lx||S.p.exam,E=STRATEGIES.concat(S.top).filter(e=>e.exam===x);
 return accountCard()+`<h1>Strategy library</h1><div class="chips" style="margin:8px 0">${Object.keys(EX).map(k=>chip('lx','',k,x===k,EX[k].n)).join('')}</div>`
 +`<section><div class="row sp" style="margin-bottom:8px"><h2 style="margin:0">Source-based entries</h2><button class="btn s" data-a="te">Add entry</button></div><p class="sm mu">Entries appear only when you add them with a source. AimSarthi ships none and never invents interviews, quotes, ranks or preparation histories.</p>`
 +(E.length?E.map(e=>`<article class="card"><b>${esc(e.name)}</b> <span class="sm mu">exam year ${e.year}</span><br><span class="tag ${(e.fixed?e.verified:e.checked)?'ok':''}">${e.fixed?(e.verified?'Verified source':'Source supplied, not verified'):(e.checked?'Source checked by you':'Source not yet checked')}</span><dl class="sm"><dt>Reported preparation duration</dt><dd>${esc(e.dur||'Not stated')}</dd><dt>Reported resources</dt><dd>${esc(e.res||'Not stated')}</dd><dt>Revision approach</dt><dd>${esc(e.rev||'Not stated')}</dd><dt>Source</dt><dd>${/^https?:\/\//.test(e.src)?`<a href="${esc(e.src)}" target="_blank" rel="noopener noreferrer">${esc(e.src)}</a>`:esc(e.src)}</dd></dl>${e.fixed?'':`<div class="row"><button class="btn o s" data-a="tc" data-id="${e.id}">${e.checked?'Mark unchecked':'I checked the source'}</button><button class="btn o s" data-a="tr" data-id="${e.id}">Remove</button></div>`}</article>`).join(''):`<div class="card mu">No entries for ${EX[x].n} yet. Add one with a link or full citation.</div>`)+'</section>'
 +agg(x)+`<section class="card"><h2>General recommendations</h2><p><span class="tag">General advice, not from any topper</span></p><ul class="sm"><li>Plan backwards from the exam date and keep a weekly buffer for missed days.</li><li>Mix reading with active recall and practice questions instead of only re-reading.</li><li>Revise on a fixed rhythm so earlier subjects do not fade.</li><li>Take timed mocks regularly and spend real time analysing mistakes.</li><li>Protect sleep and breaks. Steady days beat occasional marathon days.</li></ul></section>`}
const ICO={home:'<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/>',roadmap:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',recover:'<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>',progress:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',library:'<path d="M4 5a2 2 0 012-2h5v17H6a2 2 0 00-2 2zM20 5a2 2 0 00-2-2h-5v17h5a2 2 0 012 2z"/>'};
function render(){try{
 const a=$('#app'),nv=$('#nv');
 if(!ready){a.innerHTML=loadView();nv.hidden=true;return}
 if(V.build){nv.hidden=true;document.body.classList.remove('lv');a.innerHTML=buildView();return}
 if(authOn()&&!CL().user){nv.hidden=true;document.body.classList.remove('lv');a.innerHTML=authView();return}
 if(!S.p.onboarded){nv.hidden=true;document.body.classList.remove('lv');a.innerHTML=wiz();return}
 const M=miss().length,run=S.timer,rt=run&&run.taskId?byId(run.taskId):null;nv.hidden=false;document.body.classList.toggle('lv',!!run);
 nv.innerHTML=[['home','Today'],['roadmap','Roadmap'],['recover','Recover'],['progress','Progress'],['library','Library']].map(([k,l])=>`<button data-a="tab" data-v="${k}" ${V.tab===k?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>${l}${k==='recover'&&M?` <span class="dot">${M}</span>`:''}</button>`).join('');
 a.innerHTML=({home,roadmap,recover,progress,library}[V.tab])()+`<p class="sm mu" style="text-align:center"><span id="st">${esc(V.st)}</span><br>AimSarthi ${VER}</p>`+(run?`<div class="live" role="group" aria-label="Study timer"><div><div class="t" id="tm">00:00:00</div><small>${rt?esc(rt.subject+': '+rt.topic):'General study'}${run.goal?' · '+hm(run.goal)+' goal':''}</small></div><button class="btn s" data-a="timer">Stop</button></div>`:'');tick()
}catch(e){console.error(e);$('#app').innerHTML='<div class="card"><h2>Something went wrong</h2><p class="mu">Your saved data is safe. Reload the page to try again.</p></div>'}}

/* ---------- sheet, toast, timer ---------- */
function sheet(h){$('#shb').innerHTML=h;$('#sh').classList.add('on');const i=$('#shb input,#shb button');if(i)i.focus()}
function closeSheet(){$('#sh').classList.remove('on')}
function toast(m){const e=$('#ts');e.textContent=m;e.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>e.classList.remove('on'),2600)}
function startTick(){clearInterval(iv);iv=setInterval(tick,1000)}
function tick(){if(S&&S.timer)checkAlarm();const e=$('#tm');if(!e||!S)return;
 let s=S.timer?Math.floor((Date.now()-new Date(S.timer.start))/1e3):0,pre='';
 if(S.timer&&S.timer.goal){s=S.timer.goal*60-s;if(s<0){s=-s;pre='+'}}   // counts down to the goal, then up with a plus sign
 e.textContent=pre+pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(s%60);const t=$('#tm2');if(t)t.textContent=hm(dayMins(V.day))}

/* ---------- recovery helpers ---------- */
function bestDays(m,x,t){const e=addD(S.p.examDate,-1),r=[],rc=Math.max(60,cap()*.3);
 for(let i=0;i<14;i++){const k=addD(today(),i);if(k>e)break;if(String(pd(k).getDay())===S.p.off)continue;
  const D=S.tasks.filter(z=>z.date===k);if(D.some(z=>z.type==='mock'))continue;
  if(load(k,x)+m>cap()||(x&&(x[k]||0)+m>rc))continue;
  r.push([k,load(k,x)-(t&&D.some(z=>z.subject===t.subject)?30:0)-(t&&t.type==='revision'&&D.some(z=>z.type==='revision')?40:0)])}
 return r.sort((a,b)=>a[1]-b[1]||(a[0]<b[0]?-1:1)).map(z=>z[0])}
function moveT(t,k,m){const h={from:t.date,to:k,at:new Date().toISOString()};
 if(t.status==='partial'){t.resolved=true;const n={...t,id:uid(),date:k,mins:m,status:'todo',resolved:false,history:[h],gen:false};delete n.doneDate;S.tasks.push(n)}
 else{t.history=(t.history||[]).concat(h);t.date=k;t.mins=m;t.status='todo'}}
function rsp(){const m=+$('#r_m').value,k=$('#r_d').value,e=$('#rp');if(!e)return;
 if(!okD(k)||!okM(m)){e.textContent='Enter a valid date and duration to preview the workload.';return}
 const a=load(k),b=a+m,c=cap();let h=`<b>${fD(k)}</b>: ${hm(a)} planned now, <b>${hm(b)}</b> after this move (limit ${hm(c)}). `;
 if(b>c){const alt=bestDays(m).filter(x=>x!==k).slice(0,2);h+=`That is ${hm(b-c)} over your limit. Options: `+(alt.map(x=>`<button class="btn o s" data-a="pickd" data-v="${x}">${fD(x)} (${hm(c-load(x))} free)</button>`).join(' ')||'no day in the next 2 weeks has room. ')+(c-a>=30?` <button class="btn o s" data-a="fit" data-v="${Math.floor((c-a)/15)*15}">Shorten to ${hm(Math.floor((c-a)/15)*15)}</button>`:'')}
 else h+='This fits your daily limit.';e.innerHTML=h}

/* ---------- actions ---------- */
const A={
 tab:d=>{V.tab=d.v;scrollTo(0,0);render()},
 next:()=>{const e=chk(V.step);if(e){V.err=e;render();return}V.err='';
  if(V.step<6){V.step++;save();render();scrollTo(0,0)}
  else{S.p.hours=+S.p.hours;S.p.workHrs=+S.p.workHrs;S.p.onboarded=true;buildRoadmap()}},
 back:()=>{V.err='';V.step=Math.max(0,V.step-1);render()},
 pick:d=>{if(d.k==='exam'&&S.p.exam!==d.v){S.p.done=[];S.p.weak=[]}S.p[d.k]=d.v;render()},
 tg:d=>{const a=S.p[d.k]=S.p[d.k]||[],i=a.indexOf(d.v);i<0?a.push(d.v):a.splice(i,1);
  if(i<0&&d.k==='done')S.p.weak=(S.p.weak||[]).filter(x=>x!==d.v);if(i<0&&d.k==='weak')S.p.done=(S.p.done||[]).filter(x=>x!==d.v);render()},
 redo:()=>{S.p.onboarded=false;V.step=2;save();render()},
 regen:()=>buildRoadmap(),
 accept:()=>{const d=S.draft;S.tasks=S.tasks.filter(t=>!repl(t)).concat(d.tasks);S.p.planStart=d.start;S.p.planMode=d.mode;S.p.summary=d.summary;S.draft=null;V.tab='home';V.day=today();save();render();toast('Roadmap accepted')},
 day:d=>{V.day=d.v;render()},
 cm:d=>{const[y,m]=V.cal.split('-').map(Number),x=new Date(y,m-1+(+d.v),1);V.cal=x.getFullYear()+'-'+pad(x.getMonth()+1);render()},
 st:d=>{const t=byId(d.id);t.status=t.status===d.v?'todo':d.v;if(t.status==='done'||t.status==='partial')t.doneDate=today();else delete t.doneDate;save();render()},
 x:closeSheet,
 remon:async()=>{if(!window.Notification||!navigator.serviceWorker){toast('This browser cannot show notifications.');return}
  if(await Notification.requestPermission()!=='granted'){toast('Notifications are blocked. Allow them in your browser settings.');return}
  let reg=null;try{reg=await Promise.race([navigator.serviceWorker.ready,new Promise((_,j)=>setTimeout(j,3000))])}catch(e){toast('Open the installed or hosted app to use reminders.');return}
  S.rem.on=true;try{await reg.periodicSync.register('study-reminder',{minInterval:12*36e5});S.rem.bg=true}catch(e){S.rem.bg=false}
  save();render();toast(S.rem.bg?'Reminders are on':'Reminders are on while the app is open')},
 remoff:()=>{S.rem.on=false;save();render()},
 remtest:async()=>{toast(await notify({title:'AimSarthi',body:'Reminders are working.',tag:'test'})?'Test sent':'Could not show a notification')},
 go:async d=>{if(S.timer)A.timer();const t=d.id?byId(d.id):null,g=t?Math.max(30,Math.round((t.mins-logged(t))/15)*15):0;
  unlockAudio();S.timer={start:new Date().toISOString(),taskId:d.id||'',goal:g};startTick();armAlarm();closeSheet();save();render();toast(g?'Timer started. You will be alerted after '+hm(g)+'.':'Timer started');
  if(g&&window.Notification&&Notification.permission==='default'&&!S.rem.askedTimer){S.rem.askedTimer=true;save();try{await Notification.requestPermission()}catch(e){}}},
 tm:d=>{const t=byId(d.id);sheet(`<h2>${esc(t.subject)}</h2><p class="mu">${esc(t.topic)}</p><div class="stack"><button class="btn" data-a="go" data-id="${t.id}">Start studying this</button><button class="btn o" data-a="st2" data-id="${t.id}" data-v="partial">Partly done</button><button class="btn o" data-a="st2" data-id="${t.id}" data-v="incomplete">Not done</button><button class="btn o" data-a="del" data-id="${t.id}">Delete task</button><button class="btn o" data-a="x">Close</button></div>`)},
 st2:d=>{const t=byId(d.id);t.status=t.status===d.v?'todo':d.v;if(t.status==='done'||t.status==='partial')t.doneDate=today();else delete t.doneDate;closeSheet();save();render()},
 add:()=>sheet(`<h2>Add task</h2>${inp('t_s','Subject',`list="sl" maxlength="60"`)}<datalist id="sl">${EX[S.p.exam].sub.map(s=>`<option value="${esc(s)}">`).join('')}</datalist>${inp('t_t','Topic','maxlength="100"')}${inp('t_m','Estimated minutes (30 to 600, steps of 15)','type="number" inputmode="numeric" min="30" max="600" step="15" value="60"')}<label for="t_p">Priority</label><select id="t_p"><option>High</option><option selected>Medium</option><option>Low</option></select>${inp('t_d','Scheduled date',`type="date" min="${today()}" max="${S.p.examDate}" value="${V.day<today()?today():V.day}"`)}<p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="addok">Save task</button></div>`),
 addok:()=>{const s=$('#t_s').value.trim(),t=$('#t_t').value.trim(),m=+$('#t_m').value,d=$('#t_d').value;
  const e=!s?'Enter a subject.':!t?'Enter a topic.':!okM(m)?'Duration must be 30 to 600 minutes, in steps of 15 (30, 45, 60, ...).':(!okD(d)||d<today()||d>S.p.examDate)?'Pick a date from today up to your exam date.':'';
  if(e){$('#se').textContent=e;return}
  S.tasks.push({id:uid(),subject:s,topic:t,mins:m,pri:$('#t_p').value,date:d,type:'study',status:'todo'});closeSheet();save();render();toast('Task added')},
 del:d=>sheet(`<h2>Delete this task?</h2><p>${esc(byId(d.id).subject)}: ${esc(byId(d.id).topic)}. This cannot be undone.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Keep it</button><button class="btn" style="flex:1" data-a="delok" data-id="${d.id}">Delete</button></div>`),
 delok:d=>{S.tasks=S.tasks.filter(t=>t.id!==d.id);closeSheet();save();render();toast('Task deleted')},
 timer:()=>{if(S.timer){const s=new Date(S.timer.start),m=Math.min(720,Math.round((Date.now()-s)/6e4));
   if(m<1)toast('Under a minute, so it was not logged.');else{S.sessions.push({id:uid(),start:s.toISOString(),end:new Date().toISOString(),day:dk(s),mins:m,taskId:S.timer.taskId});toast('Saved '+hm(m)+' of study')}
   S.timer=null;clearInterval(iv);clearTimeout(alarmT)}else{S.timer={start:new Date().toISOString(),taskId:V.tt};startTick()}save();render()},
 rs:d=>{const t=byId(d.id),r=remain(t),best=bestDays(r,0,t)[0]||addD(today(),1);V.rs=t.id;
  sheet(`<h2>Reschedule task</h2><p>${esc(t.subject)}: ${esc(t.topic)}</p>${t.status==='partial'?'<p class="sm mu">Part of this task is done. The unfinished part becomes a new task and your partial credit stays.</p>':''}${inp('r_m','Minutes to schedule (30 to 600, in steps of 15)',`type="number" inputmode="numeric" min="30" max="600" step="15" data-g="rs" value="${r}"`)}${inp('r_d','New date',`type="date" data-g="rs" min="${today()}" max="${addD(S.p.examDate,-1)}" value="${best}"`)}<div id="rp" class="note" style="margin-top:12px"></div><p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="rsok">Move task</button></div>`);rsp()},
 pickd:d=>{$('#r_d').value=d.v;rsp()},fit:d=>{$('#r_m').value=d.v;rsp()},
 rsok:()=>{const t=byId(V.rs),m=+$('#r_m').value,k=$('#r_d').value;
  if(!okM(m)||!okD(k)||k<today()||k>=S.p.examDate){$('#se').textContent='Choose a date from today to the day before your exam, and 30 to 600 minutes in steps of 15.';return}
  moveT(t,k,m);closeSheet();save();render();toast('Moved to '+fD(k))},
 skip:d=>{byId(d.id).resolved=true;save();render();toast('Dismissed. The task stays on its original day.')},
 sug:()=>{const M=miss().sort((a,b)=>P[a.pri]-P[b.pri]||(a.date<b.date?-1:1)),add={},pl=[],un=[],sk=[];
  M.forEach(t=>{const r=remain(t);let m=r,d=bestDays(m,add,t)[0];if(!d&&r>30){m=Math.max(30,Math.round(r/2/15)*15);d=bestDays(m,add,t)[0]}
   if(d){add[d]=(add[d]||0)+m;pl.push({id:t.id,d,m,r})}else if(t.pri==='Low'||t.type==='revision')sk.push(t);else un.push(t)});
  V.pl=pl;V.sk=sk.map(t=>t.id);
  sheet(`<h2>Suggested recovery plan</h2><p class="sm mu">A suggestion only. Nothing moves until you accept. It spreads work across days, keeps mock days clear, groups related subjects, and trims low-priority items last.</p>`+(pl.length?pl.map(x=>{const t=byId(x.id);return`<p><b>${esc(t.subject)}</b>: ${esc(t.topic)}<br><span class="sm">${fD(t.date)} to <b>${fD(x.d)}</b>, ${hm(x.m)}${x.m<x.r?' (shortened from '+hm(x.r)+')':''}</span></p>`}).join('')+`<p class="sm"><b>Workload after:</b> ${Object.keys(add).sort().map(k=>fD(k)+' '+hm(load(k)+add[k])+' of '+hm(cap())).join('; ')}</p>`:'<p>No task fits the next two weeks without going over your daily limit.</p>')+(sk.length?`<p class="sm"><b>Suggest dismissing (${sk.length}):</b> ${sk.map(t=>esc(t.subject)).join(', ')}. They stay in your history, and you can still reschedule them by hand.</p>`:'')+(un.length?`<p class="sm">${un.length} not placed. Reschedule them yourself.</p>`:'')+`<div class="row"><button class="btn o" style="flex:1" data-a="x">Reject</button>${pl.length||sk.length?'<button class="btn" style="flex:1" data-a="sugok">Accept plan</button>':''}</div>`)},
 sugok:()=>{const n=V.pl.length,s=V.sk.length;V.pl.forEach(x=>moveT(byId(x.id),x.d,x.m));V.sk.forEach(id=>{byId(id).resolved=true});V.pl=[];V.sk=[];closeSheet();save();render();toast(n+' moved, '+s+' dismissed')},
 wk:d=>{V.wk+=+d.v;render()},
 lx:d=>{V.lx=d.v;render()},
 te:()=>sheet(`<h2>Add a source-based entry</h2><p class="sm mu">Only record what the source states. Do not fill gaps from memory.</p>${inp('e_n','Candidate name','maxlength="60"')}${inp('e_y','Exam year',`type="number" inputmode="numeric" min="1990" max="${new Date().getFullYear()}"`)}${inp('e_d','Reported preparation duration','maxlength="60"')}${inp('e_r','Reported resources','maxlength="200"')}${inp('e_mo','Reported months of preparation (optional)','type="number" inputmode="numeric" min="0" max="60"')}${inp('e_hr','Reported study hours per day (optional)','type="number" inputmode="decimal" step="0.5" min="0" max="16"')}${inp('e_v','Revision approach','maxlength="200"')}${inp('e_s','Source (link or full citation)','maxlength="300"')}<p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="teok">Save entry</button></div>`),
 teok:()=>{const g=i=>$(i).value.trim(),n=g('#e_n'),y=+g('#e_y'),s=g('#e_s');
  const e=!n?'Enter the candidate name.':!(Number.isInteger(y)&&y>=1990&&y<=new Date().getFullYear())?'Enter a valid exam year.':s.length<8?'Add a source link or full citation so others can verify it.':'';
  if(e){$('#se').textContent=e;return}
  S.top.push({id:uid(),exam:V.lx||S.p.exam,name:n,year:y,dur:g('#e_d'),res:g('#e_r'),rev:g('#e_v'),mo:Math.min(60,Math.max(0,+g('#e_mo')||0)),hr:Math.min(16,Math.max(0,+g('#e_hr')||0)),src:s,checked:false});closeSheet();save();render()},
 tc:d=>{const e=S.top.find(x=>x.id===d.id);e.checked=!e.checked;save();render()},
 tr:d=>{S.top=S.top.filter(x=>x.id!==d.id);save();render()},
 reset:()=>sheet(`<h2>Start over?</h2><p>This erases your profile, roadmap, tasks and study sessions.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="resetok">Erase everything</button></div>`),
 resetok:()=>{S=fresh();V.step=0;V.tab='home';clearInterval(iv);closeSheet();save();render()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a])A[b.dataset.a](b.dataset);else if(e.target.id==='sh')closeSheet()});
document.addEventListener('input',e=>{const t=e.target,f=t.dataset.f,g=t.dataset.g;if(f&&S)S.p[f]=t.value;if(g==='rs')rsp();if(g==='tt')V.tt=t.value});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
/* ---------- timer alarm, loading screen and roadmap-building screen ---------- */
let alarmT=null,actx=null,errAt=0;
function unlockAudio(){try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){actx=actx||new AC();if(actx.state==='suspended')actx.resume()}}catch(e){}}
function beep(){try{if(!actx)return;[0,.4,.8].forEach(o=>{const s=actx.createOscillator(),g=actx.createGain();s.frequency.value=880;g.gain.value=.25;s.connect(g);g.connect(actx.destination);s.start(actx.currentTime+o);s.stop(actx.currentTime+o+.2)})}catch(e){}}
function armAlarm(){clearTimeout(alarmT);const T=S&&S.timer;if(!T||!T.goal||T.fired)return;alarmT=setTimeout(checkAlarm,Math.max(0,new Date(T.start).getTime()+T.goal*6e4-Date.now())+50)}
function alertNow(T){const t=T.taskId?byId(T.taskId):null,txt=t?t.subject+': '+t.topic:'Your study session';
 try{navigator.vibrate&&navigator.vibrate([300,150,300,150,500])}catch(e){}
 beep();
 if(window.Notification&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(r=>r.showNotification('Time is up',{body:txt+'. '+hm(T.goal)+' goal reached. Open the app to mark it done.',tag:'timer',renotify:true,requireInteraction:true,vibrate:[300,150,300,150,500],icon:'icon-192.png',badge:'icon-192.png'})).catch(()=>{})}
function timeUp(){const T=S.timer,t=T.taskId?byId(T.taskId):null;
 sheet(`<h2>Time is up</h2><p>${t?esc(t.subject)+': '+esc(t.topic):'Your study session'}<br><span class="sm mu">${hm(T.goal)} goal reached.</span></p><div class="stack"><button class="btn" data-a="tudone">${t?'Mark done and stop':'Stop the timer'}</button><button class="btn o" data-a="tumore">Study 15 more minutes</button><button class="btn o" data-a="timer">Stop timer only</button></div>`)}
function checkAlarm(){const T=S&&S.timer;if(!T||!T.goal)return;if((Date.now()-new Date(T.start))/6e4<T.goal)return;
 if(!T.fired){T.fired=true;save();alertNow(T)}
 if(!T.ack&&document.visibilityState==='visible'){T.ack=true;save();timeUp()}}
A.tudone=()=>{const id=S.timer&&S.timer.taskId;closeSheet();A.timer();const t=id?byId(id):null;if(t){t.status='done';t.doneDate=today();save();render()}};
A.tumore=()=>{if(!S.timer)return;S.timer.goal+=15;S.timer.fired=false;S.timer.ack=false;closeSheet();armAlarm();save();render()};
A.offline=()=>skipNow();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S&&S.timer){armAlarm();checkAlarm();render()}});
addEventListener('error',e=>{if(Date.now()-errAt>1e4){errAt=Date.now();try{toast('Something went wrong. Your data is safe.')}catch(x){}}console.error(e.error||e.message)});
addEventListener('unhandledrejection',e=>console.error(e.reason));
const BSTEPS=['Reading your answers','Ordering subjects, foundation first','Fitting topics into your hours','Balancing priorities and revision','Placing mock tests and checking every day fits'];
const loadView=()=>`<section class="load"><div class="spin" aria-hidden="true"></div><h2>AimSarthi</h2><p class="mu">${esc(V.lm||'Starting up')}...</p>${V.slow?'<p class="sm mu">This is taking longer than usual. Your connection may be slow.</p><button class="btn o" data-a="offline">Continue with saved data</button>':''}</section>`;
function buildView(){const b=V.build;
 if(b.err)return`<div class="card"><h2>Could not build the roadmap</h2><p class="mu">Your answers are saved. Please try again.</p><button class="btn w" data-a="regen">Try again</button></div>`;
 const n=BSTEPS.length;return`<section class="load"><div class="spin" aria-hidden="true"></div><h2>Building your roadmap</h2><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${b.i}" style="margin:12px 0"><i style="width:${b.i/n*100}%"></i></div><ul class="steps">${BSTEPS.map((s,i)=>`<li class="${i<b.i?'ok':i===b.i?'now':''}">${esc(s)}</li>`).join('')}</ul><p class="sm mu">This runs on your phone, so it keeps working on a slow connection.</p></section>`}
async function buildRoadmap(){if(V.build&&!V.build.err)return;V.build={i:0};save();render();scrollTo(0,0);await sleep(120);
 let d=null;try{d=gen(S.p)}catch(e){console.error(e)}
 if(!d){V.build={err:true};render();return}
 for(let i=1;i<=BSTEPS.length;i++){V.build.i=i;render();await sleep(450)}
 S.draft=d;V.build=null;V.tab='roadmap';save();render();scrollTo(0,0)}

/* ---------- reminders: usual study hour comes from timed-session history ---------- */
const usualHour=()=>{const hs=S.sessions.map(x=>new Date(x.start).getHours());return hs.length>=3?Math.min(22,Math.max(5,Math.round(med(hs)))):19};
const h12=h=>(h%12||12)+(h<12?' am':' pm');
async function pushMeta(){if(!S||!window.caches)return null;
 const R=S.rem||{},nx=tasksOn(today()).find(t=>t.status!=='done'),dn=S.tasks.filter(t=>t.doneDate&&(t.status==='done'||t.status==='partial')).map(t=>t.doneDate).concat(S.sessions.map(x=>x.day)).sort().pop();
 const m={on:!!R.on,hour:usualHour(),seen:S.seen||new Date().toISOString(),studied:dn?pd(dn).toDateString():'',pending:S.tasks.filter(t=>t.date<=today()&&t.status!=='done'&&!t.resolved).length,next:nx?nx.subject+': '+nx.topic:'',lastNotif:R.lastNotif||''};
 try{const c=await caches.open('aimsarthi-meta'),o=await c.match('meta'),old=o?await o.json():{};if(old.lastNotif&&old.lastNotif>m.lastNotif)m.lastNotif=old.lastNotif;await c.put('meta',new Response(JSON.stringify(m)))}catch(e){}
 return m}
async function notify(d){try{const r=await navigator.serviceWorker.ready;await r.showNotification(d.title,{body:d.body,tag:d.tag,icon:'icon-192.png',badge:'icon-192.png'});if(d.tag!=='test'){S.rem.lastNotif=new Date().toISOString();save()}return true}catch(e){return false}}
async function chkRem(){if(!S||!S.rem||!S.rem.on||!window.Notification||Notification.permission!=='granted'||document.visibilityState==='visible')return;const d=reminderDue(await pushMeta(),Date.now());if(d)notify(d)}
function remCard(){const R=S.rem||{},on=R.on&&window.Notification&&Notification.permission==='granted';
 return`<section class="card"><h2>Study reminders</h2><p class="sm mu">${on?'On. You get a nudge around '+h12(usualHour())+' on days you have not studied. The time is learned from your timed sessions (7 pm until you have a few). After 2 days without opening the app, you get a "your plan is waiting" nudge.':'Get a nudge at your usual study time, and another if you have not opened the app for 2 days.'}</p><div class="row"><button class="btn ${on?'o ':''}s" data-a="${on?'remoff':'remon'}">${on?'Turn off':'Turn on reminders'}</button>${on?'<button class="btn o s" data-a="remtest">Send a test</button>':''}</div><p class="sm mu" style="margin:8px 0 0">Background reminders work on Chrome for Android with the app installed, and the browser picks the exact time, so they can arrive late. ${on&&R.bg===false?'Background reminders are unavailable here, so you are only reminded while the app is open in the background.':''}</p></section>`}
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));