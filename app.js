'use strict';
const VER='v16, 30 Oct 2026';
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
const LK='aimsarthi:v1',fresh=()=>({p:{hours:4,workHrs:0,off:'',done:[],weak:[],tdone:[],tweak:[],ord:{},ordOn:false,res:[],dayCap:{}},tasks:[],draft:null,sessions:[],timer:null,top:[],rem:{on:false},days:[],soc:{apps:{},use:{},rem:true,run:null},ai:{hist:[],use:null},tests:[],qp:{},sug:{},lib:[],fc:[],rt:[],rd:{}});
const cleanCap=m=>{const o={},t=addD(today(),-7);if(m&&typeof m==='object')for(const k in m){const v=+m[k];if(okD(k)&&k>=t&&v>=.1&&v<=2)o[k]=v}return o};
function hydrate(s){const o=Object.assign(fresh(),s||{});o.p=Object.assign(fresh().p,o.p);o.p.dayCap=cleanCap(o.p.dayCap);o.soc=Object.assign(fresh().soc,o.soc);o.ai=Object.assign(fresh().ai,o.ai);return o}
let S=null,ready=false,mode='local',ref=null,q=Promise.resolve(),sT,iv,tT,fromCloud=false,unW=null,loadedUid=null,socT=null,pomoT=null,pomoKey='';
let V={tab:'home',day:today(),wk:0,step:0,err:'',cal:today().slice(0,7),tt:'',st:'',lx:'',nav:[],ob:{},tf:'',lo:{},fx:true};
const CL=()=>window.Cloud||{enabled:false,user:null};
const lkey=()=>LK+(CL().user?':'+CL().user.uid:'');
const byId=id=>S.tasks.find(t=>t.id===id);
const doneMin=t=>t.status==='done'?t.mins:t.status==='partial'?Math.round(t.mins/2):0;
const okM=m=>Number.isInteger(m)&&m>=30&&m<=600&&m%15===0,r15=m=>Math.max(30,Math.round(m/15)*15),remain=t=>t.status==='partial'?r15(t.mins-Math.round(t.mins/2)):Math.max(30,t.mins);
const tasksOn=k=>S.tasks.filter(t=>t.date===k).sort((a,b)=>P[a.pri]-P[b.pri]||a.mins-b.mins);
const miss=()=>S.tasks.filter(t=>!t.resolved&&t.date<today()&&t.status!=='done');
const cap=k=>Math.min(1080,Math.round((+S.p.hours)*60*((S.p.dayCap&&S.p.dayCap[k||today()])||1)));
const load=(k,x)=>sum(S.tasks.filter(t=>t.date===k),t=>t.mins)+((x&&x[k])||0);
const repl=t=>t.gen&&t.status==='todo'&&!t.history&&t.date>=today();
const wkDays=o=>{const d=pd(today());d.setDate(d.getDate()-(d.getDay()+6)%7+o*7);const s=dk(d);return[...Array(7)].map((_,i)=>addD(s,i))};
const chip=(a,k,v,on,l)=>`<button type="button" class="chip" data-a="${a}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${!!on}">${esc(l||v)}</button>`;
const inp=(id,l,a)=>`<label for="${id}">${l}</label><input id="${id}" ${a}>`;

function setSt(t){V.st=t;const e=$('#st');if(e)e.textContent=t}
function ls(d){try{localStorage.setItem(lkey(),JSON.stringify(d));setSt('Saved on this device')}catch(e){setSt('Could not save: browser storage is unavailable.')}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let skipNow=()=>{};const skipP=new Promise(r=>{skipNow=r});
const wait=(p,ms,skip)=>Promise.race([p,sleep(ms).then(()=>'timeout')].concat(skip?[skipP.then(()=>'timeout')]:[]));
let pull=false;
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
async function pullCloud(){try{const s=await wait(Cloud.loadState(),7000,true);return s==='timeout'?null:(s||{})}catch(e){return null}}
async function loadState(){
 const u=CL().user;let s=null;pull=false;loadedUid=u?u.uid:null;const loc=readLocal(lkey());
 if(u){const c=await pullCloud();if(c===null)pull=true;
  s=[c,loc].filter(x=>x&&x.p).sort((x,y)=>(y.upd||0)-(x.upd||0))[0]||null;
  if(!s){const g=readLocal(LK);if(g&&g.p){s=g;try{localStorage.removeItem(LK)}catch(e){}}}}
 else s=loc;
 S=hydrate(s);
 if(u&&!S.p.name)S.p.name=u.username;
 S.seen=new Date().toISOString();S.days=S.days||[];if(!S.days.includes(today()))S.days=S.days.concat(today()).slice(-400);
 mode=u?'cloud':'local';
 if(u){Cloud.loadStrategies().then(r=>{r.forEach(e=>{if(!STRATEGIES.some(z=>z.id===e.id)){e.fixed=true;STRATEGIES.push(e)}});render()}).catch(()=>{});
  if(pull)setSt('Offline: your saved plan is loaded. It will sync when you are back online.');else{flush();pushStats()}startWatch()}}
async function retryPull(){if(!pull||!CL().user||!S)return;const c=await pullCloud();if(c===null)return;pull=false;
 if(c.p&&(c.upd||0)>(S.upd||0)){const k=S.timer;S=hydrate(c);if(k)S.timer=k;ls(S);render();toast('Updated from your account')}else flush()}
function startWatch(){try{if(unW){unW();unW=null}if(CL().user&&Cloud.watch)unW=Cloud.watch(c=>remote(c))}catch(e){}}
function remote(c,n){if(!S||!c||!c.p||(c.upd||0)<=(S.upd||0))return;if(sheetOpen()||V.build){if((n||0)<6)setTimeout(()=>remote(c,(n||0)+1),5e3);return}
 const k=S.timer,r=S.soc.run,mine=S.sessions.filter(x=>!(c.sessions||[]).some(y=>y.id===x.id));S=hydrate(c);S.timer=k;S.soc.run=r;
 if(mine.length){S.sessions=S.sessions.concat(mine).sort((a,b)=>a.start<b.start?-1:1);save()}else ls(S);render();toast('Updated from another device')}
async function afterAuth(){await loadState();if(!S.p.onboarded)V.step=1;V.tab='home';ready=true}
async function boot(){
 V.lm='Starting up';render();
 const slowT=setTimeout(()=>{if(!ready){V.slow=true;render()}},6000);
 V.lm='Connecting';render();try{await wait(window.cloudReady,6000,true)}catch(e){}
 V.lm='Loading your plan';render();
 await loadState();ready=true;clearTimeout(slowT);V.slow=false;
 if(S.timer){startTick();armAlarm();if(window.Float&&Float.arm)Float.arm()}
 try{const u=new URLSearchParams(location.search),q=u.get('t')||u.get('go');if(q){history.replaceState(null,'',location.pathname);setTimeout(()=>tAct(q),300)}}catch(e){}
 setInterval(chkRem,6e4);setInterval(retryPull,6e4);addEventListener('online',()=>{retryPull();if(typeof flushFb==='function')flushFb()});
 pushMeta();if(typeof flushFb==='function')flushFb();render();if(S.soc.run&&S.soc.run.left)socBack()}

function gen(p){return Engine.plan(p,EX[p.exam],STRATEGIES.concat(S.top),S.tasks)}

/* ================= SETUP WIZARD (v9) =================
   8 steps: Profile, Exam, Date, Time, Level, Syllabus (topic ticks), Resources, Review.
   Topic answers are stored in S.p.tdone / S.p.tweak as 'Subject|Topic' keys. S.p.done / S.p.weak (whole subjects) are derived from them. */
const WN=9,WS=['','Profile','Exam','Date','Time','Level','Syllabus','Order','Resources','Review'];
const WT=['','Create your profile','Choose your exam','Exam date and target','Daily time and commitments','Where you stand','Check your syllabus','Choose your study order','Study resources','Review and build'];
const $$=s=>[...document.querySelectorAll(s)];
const vib=n=>{try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}};
const tkey=(s,t)=>s+'|'+t;
const topicsOf=(x,s)=>{const d=((EX[x]||{}).t||{})[s],a=Array.isArray(d)?d:d&&d.topics?d.topics.map(t=>t[0]):[];return a.length?a:['Core concepts and MCQs']};
const allTopics=x=>sum(EX[x].sub,s=>topicsOf(x,s).length);
function subStat(s){const p=S.p,T=topicsOf(p.exam,s),td=p.tdone||[],tw=p.tweak||[];return{n:T.length,d:T.filter(t=>td.includes(tkey(s,t))).length,w:T.filter(t=>tw.includes(tkey(s,t))).length}}
function syncSub(s){const p=S.p,st=subStat(s);p.done=(p.done||[]).filter(x=>x!==s);p.weak=(p.weak||[]).filter(x=>x!==s);if(st.d===st.n)p.done.push(s);else if(st.w*2>=st.n)p.weak.push(s)}
function cleanTopics(){const p=S.p,ok=new Set();EX[p.exam].sub.forEach(s=>topicsOf(p.exam,s).forEach(t=>ok.add(tkey(s,t))));
 p.tdone=(p.tdone||[]).filter(k=>ok.has(k));p.tweak=(p.tweak||[]).filter(k=>ok.has(k)&&!p.tdone.includes(k));EX[p.exam].sub.forEach(syncSub);const o={};EX[p.exam].sub.forEach(x=>{if(+(p.ord||{})[x]>=1)o[x]=+p.ord[x]});p.ord=o;if(!Object.keys(o).length)p.ordOn=false}
function migrateTopics(){const p=S.p;if(p.tmig||!EX[p.exam])return;p.tmig=1;p.tdone=p.tdone||[];p.tweak=p.tweak||[];   // answers saved by older versions were whole subjects
 (p.done||[]).forEach(s=>topicsOf(p.exam,s).forEach(t=>{const k=tkey(s,t);if(!p.tdone.includes(k))p.tdone.push(k)}));
 (p.weak||[]).forEach(s=>topicsOf(p.exam,s).forEach(t=>{const k=tkey(s,t);if(!p.tdone.includes(k)&&!p.tweak.includes(k))p.tweak.push(k)}))}

function chk(s){const p=S.p;
 if(s===1){const n=(p.name||'').trim();return n&&n.length<=40?'':'Enter your name (up to 40 characters).'}
 if(s===2)return EX[p.exam]?'':'Choose an exam.';
 if(s===3){if(!okD(p.examDate))return'Enter a valid exam date.';const n=diff(today(),p.examDate);if(n<2)return'The exam date must be at least 2 days from today.';if(n>1100)return'The exam date must be within about 3 years.';const t=(p.target||'').trim();return t&&t.length<=80?'':'Enter a target score or rank (up to 80 characters).'}
 if(s===4){const h=+p.hours,w=+p.workHrs;if(!(h>=.5&&h<=16))return'Daily study hours must be between 0.5 and 16.';if(!(w>=0&&w<=16))return'Work hours must be between 0 and 16.';return h+w<=20?'':'Study plus work hours leave under 4 hours for sleep and meals. Please lower one.'}
 if(s===5)return p.level?'':'Choose your current level.';
 if(s===7)return p.ordOn&&!ordSubs().some(x=>+(p.ord||{})[x]>=1)?'Pick a round for at least one subject, or choose "Let AceLife decide".':'';
 if(s===8)return(p.resOther||'').length>120?'Keep other resources under 120 characters.':'';
 return''}

/* live hint under the fields: updated while typing, without re-rendering (keeps keyboard focus) */
function wizHint(){const p=S.p,s=V.step;
 if(s===3){if(!okD(p.examDate))return'Pick the date of your exam, or tap a shortcut above.';const n=diff(today(),p.examDate);if(n<2)return'<b class="er">The exam date must be at least 2 days from today.</b>';
  return`<b>${n} days to go</b> (about ${Math.max(1,Math.round(n/7))} weeks). AceLife will build a <b>${esc(Engine.modeName(Engine.modeFor(n),p.level))}</b>.`}
 if(s===4){const h=+p.hours||0,w=+p.workHrs||0,r=Math.max(0,24-h-w);
  return`<div class="day" aria-hidden="true"><i class="su" style="width:${h/24*100}%"></i><i class="wo" style="width:${w/24*100}%"></i></div><p class="sm" style="margin:8px 0 0"><span class="lg su"></span>Study <b>${hm(h*60)}</b> <span class="lg wo"></span>Work <b>${hm(w*60)}</b> <span class="lg"></span>Rest, meals, sleep <b>${hm(r*60)}</b></p>${h+w>20?'<p class="er sm" style="margin:6px 0 0">That leaves under 4 hours for sleep and meals. Please lower one.</p>':h>=10?'<p class="sm mu" style="margin:6px 0 0">Long days are hard to keep up. Steady hours beat marathon days.</p>':''}`}
 return''}
function wizLive(){if(!S||S.p.onboarded||!V.step)return;const e=$('#lv');if(e)e.innerHTML=wizHint();const a=$('#o_h'),b=$('#o_w');if(a)a.textContent=hm((+S.p.hours||0)*60);if(b)b.textContent=hm((+S.p.workHrs||0)*60)}

function subsHtml(){const p=S.p,x=p.exam,q=(V.tf||'').trim().toLowerCase();
 return EX[x].sub.map(s=>{const T=topicsOf(x,s),st=subStat(s),sh=!q||s.toLowerCase().includes(q),L=T.filter(t=>sh||t.toLowerCase().includes(q));if(!L.length)return'';
  const open=q?true:!!V.ob[s],full=st.d===st.n;
  return`<details class="sj${full?' dn':''}" data-s="${esc(s)}"${open?' open':''}><summary><span class="sjn">${full?'<span class="sjk" aria-hidden="true">&#10003;</span>':''}${esc(s)}</span><span class="sjc">${st.d}/${st.n}${st.w?' &middot; '+st.w+' weak':''}</span><span class="bar g sjb" aria-hidden="true"><i style="width:${st.d/st.n*100}%"></i></span></summary>`
   +`<div class="sja"><button type="button" class="btn o s" data-a="sall" data-s="${esc(s)}">${full?'Clear all':'Mark all done'}</button></div>`
   +L.map(t=>{const k=tkey(s,t),d=(p.tdone||[]).includes(k),w=(p.tweak||[]).includes(k),a=`data-a="tt" data-s="${esc(s)}" data-t="${esc(t)}"`;
    return`<div class="tp${d?' d':w?' w':''}"><span>${esc(t)}</span><button type="button" class="tb d" ${a} data-m="d" aria-pressed="${d}" aria-label="Completed: ${esc(t)}">&#10003;</button><button type="button" class="tb w" ${a} data-m="w" aria-pressed="${w}" aria-label="Needs improvement: ${esc(t)}">!</button></div>`}).join('')+'</details>'}).join('')||'<p class="mu">No subject or topic matches your search.</p>'}
function subsSum(){const p=S.p,n=allTopics(p.exam),d=(p.tdone||[]).length,w=(p.tweak||[]).length;
 return`<div class="stats" style="margin:0"><div><b>${d}</b><span>Completed</span></div><div><b>${w}</b><span>Need work</span></div><div><b>${Math.max(0,n-d)}</b><span>To study</span></div></div><div class="bar g" style="margin-top:8px" aria-hidden="true"><i style="width:${n?d/n*100:0}%"></i></div>`}
function wzSubs(){const y=scrollY,f=document.activeElement&&document.activeElement.dataset?{...document.activeElement.dataset}:null;
 const a=$('#subs'),b=$('#ssum');if(a)a.innerHTML=subsHtml();if(b)b.innerHTML=subsSum();scrollTo(0,y);
 if(f&&f.a==='tt'){const e=$$('#subs [data-a=tt]').find(z=>z.dataset.s===f.s&&z.dataset.t===f.t&&z.dataset.m===f.m);if(e)e.focus({preventScroll:true})}}

function examList(){const g={};Object.keys(EX).forEach(k=>{const n=EX[k].grp||'Other exams';(g[n]=g[n]||[]).push(k)});
 return Object.keys(g).map(n=>`<h3 class="gh">${esc(n)}</h3><div class="xcs" role="group" aria-label="${esc(n)}">${g[n].map(k=>XC('exam',k,S.p.exam===k,EX[k].n,EX[k].sub.length+' subjects &middot; '+allTopics(k)+' topics &middot; '+EX[k].mock+' min paper')).join('')}</div>`).join('')}
const XC=(k,v,on,t,d)=>`<button type="button" class="xc" data-a="pick" data-k="${k}" data-v="${esc(v)}" aria-pressed="${!!on}"><span class="xt"><b>${esc(t)}</b><span class="sm mu">${d}</span></span><span class="xk" aria-hidden="true">&#10003;</span></button>`;
const LVD={Beginner:'Starting the syllabus from scratch, or only just begun.',Intermediate:'Covered most subjects once and building speed.',Advanced:'Revising and practising to sharpen your score.'};
const DOWL=DOW;

/* ---- study order: the learner decides which subjects go first, and which are studied together ---- */
const RN=5,ordSubs=()=>EX[S.p.exam].sub.filter(s=>!(S.p.done||[]).includes(s));
function ordSummary(){const o=S.p.ord||{},L=ordSubs(),R=[];
 for(let r=1;r<=RN;r++){const x=L.filter(s=>+o[s]===r);if(x.length)R.push(`<p class="sm" style="margin:0 0 4px"><b>Round ${r}</b>${r===1?' (first)':''}: ${x.map(esc).join(', ')}</p>`)}
 const u=L.filter(s=>!(+o[s]>=1));if(u.length&&R.length)R.push(`<p class="sm mu" style="margin:0">Then, in AceLife's order: ${u.map(esc).join(', ')}</p>`);
 return R.join('')||'<p class="sm mu" style="margin:0">Pick a round for at least one subject.</p>'}
function ordStep(){const p=S.p,on=!!p.ordOn,o=p.ord||{};
 const M=(v,t,d)=>`<button type="button" class="xc" data-a="ordm" data-v="${v}" aria-pressed="${on===!!v}"><span class="xt"><b>${t}</b><span class="sm mu">${d}</span></span><span class="xk" aria-hidden="true">&#10003;</span></button>`;
 let h=`<div class="xcs" role="group" aria-label="Study order">${M(0,'Let AceLife decide','Foundation subjects first, then the rest. Recommended.')}${M(1,'I will choose the order','Pick what goes first and what is studied together.')}</div>`;
 if(!on)return h;
 return h+`<p class="sm mu" style="margin:14px 0 8px"><b>Round 1</b> is studied first. Subjects in the <b>same round</b> are studied together, mixed through the same weeks. A later round starts when the earlier one is finished. Subjects marked Auto follow afterwards.</p>`
  +`<div class="row" style="flex-wrap:wrap;margin:8px 0"><button type="button" class="btn o s" data-a="ordweak">Weak subjects first</button><button type="button" class="btn o s" data-a="ordclr">Clear all</button></div>`
  +ordSubs().map(s=>{const st=subStat(s);return`<div class="orw"><div class="row sp"><b>${esc(s)}</b><span class="sm mu">${st.n-st.d} topics left</span></div><div class="seg" role="group" aria-label="Round for ${esc(s)}">${[1,2,3,4,5].map(r=>`<button type="button" data-a="ordset" data-s="${esc(s)}" data-v="${r}" aria-pressed="${+o[s]===r}">${r}</button>`).join('')}<button type="button" data-a="ordset" data-s="${esc(s)}" data-v="0" aria-pressed="${!(+o[s]>=1)}">Auto</button></div></div>`}).join('')
  +`<div class="card" style="margin:12px 0 0"><h3 style="margin:0 0 6px">Your order</h3>${ordSummary()}</div>`}
function review(){const p=S.p,n=diff(today(),p.examDate),E=EX[p.exam],d=(p.tdone||[]).length,w=(p.tweak||[]).length,tot=allTopics(p.exam);
 const R=(st,l,v)=>`<div class="rv"><span class="mu">${l}</span><b>${v}</b><button type="button" class="lnk" data-a="goto" data-v="${st}" aria-label="Edit ${l}">Edit</button></div>`;
 return`<div class="card rvc">${R(1,'Name',esc(p.name))}${R(2,'Exam',esc(E.n))}${R(3,'Exam date',esc(fD(p.examDate))+' &middot; '+n+' days')}${R(3,'Target',esc(p.target))}${R(4,'Study per day',hm((+p.hours)*60))}${R(4,'Work per day',hm((+p.workHrs)*60))}${R(4,'Weekly day off',p.off===''||p.off==null?'None':DOWL[+p.off])}${R(5,'Level',esc(p.level))}${R(6,'Syllabus',d+' of '+tot+' topics done'+(w?', '+w+' need work':''))}${R(7,'Study order',p.ordOn?'Your own order':'AceLife decides')}${R(8,'Resources',(p.res&&p.res.length?p.res.length+' selected':'None selected'))}</div>`
 +`<p class="note"><b>What happens next.</b> AceLife schedules the ${Math.max(0,tot-d)} topics still to study, gives weak topics more time, and plans light revision for the ${d} you finished. You review the draft before anything is saved to your calendar.</p>`}

function wiz(){const p=S.p,s=V.step;
 if(!s)return`<section class="welcome"><div class="road lg" aria-hidden="true"><i class="done"></i><i class="done"></i><i class="partial"></i><i class="done"></i><i></i><i></i><i></i></div><h1 class="logo">AceLife</h1><p class="lead">Your study guide from today to exam day. Build a realistic plan, track study time, keep a streak, and recover from missed days without piling everything onto tomorrow.</p>`
  +`<ul class="feat"><li><b>Plan</b><span>Topic-by-topic schedule that fits your hours</span></li><li><b>Track</b><span>Study timer, streak and weekly progress</span></li><li><b>Recover</b><span>Missed days are spread out, never piled up</span></li></ul>`
  +`<p class="note">Built first for NEET PG aspirants who are also doing an internship. ${Object.keys(EX).length} exams across medical, nursing, teaching, law, management and government jobs. Plans are suggestions from your answers, not verified advice, and cannot promise any score or rank.</p><button class="btn w" style="margin-top:16px" data-a="next">Get started</button><p class="sm" style="margin:10px 0 0;text-align:center;opacity:.8">Takes about 3 minutes</p></section>`;
 const an=V.sa;V.sa=false;let b='';
 if(s===1)b=`<p class="note">${mode==='cloud'?'You are signed in as <b>'+esc(CL().user.username)+'</b>. Your plan is saved to your account.':'Your plan is saved on this phone.'}</p>`+inp('w_n','Your name',`data-f="name" maxlength="40" autocomplete="given-name" enterkeyhint="next" value="${esc(p.name||'')}"`);
 if(s===2)b=`${examList()}<p class="sm mu" style="margin-top:10px">Pick the exam you are preparing for. You can change it later from your plan.</p>`;
 if(s===3)b=`<label for="w_d">Exam date</label><input id="w_d" type="date" data-f="examDate" min="${addD(today(),2)}" max="${addD(today(),1100)}" value="${esc(p.examDate||'')}"><div class="chips" style="margin:10px 0" role="group" aria-label="Date shortcuts">${[['1 month',30],['2 months',60],['3 months',90],['6 months',180],['1 year',365]].map(([l,n])=>`<button type="button" class="chip" data-a="qd" data-v="${n}" aria-pressed="${p.examDate===addD(today(),n)}">${l}</button>`).join('')}</div><div id="lv" class="note" aria-live="polite">${wizHint()}</div>`+inp('w_t','Target score or rank',`data-f="target" maxlength="80" placeholder="For example: rank under 2,000" value="${esc(p.target||'')}"`)+'<p class="sm mu" style="margin-top:8px">Your target is for motivation. It does not change what is possible.</p>';
 if(s===4)b=`<div class="sl"><div class="row sp"><label for="w_h" style="margin:0">Study hours per day</label><output id="o_h" for="w_h">${hm((+p.hours||0)*60)}</output></div><input id="w_h" type="range" data-f="hours" min="0.5" max="16" step="0.5" value="${esc(p.hours)}"></div>`
  +`<div class="sl"><div class="row sp"><label for="w_w" style="margin:0">Internship or work hours per day</label><output id="o_w" for="w_w">${hm((+p.workHrs||0)*60)}</output></div><input id="w_w" type="range" data-f="workHrs" min="0" max="16" step="0.5" value="${esc(p.workHrs)}"></div><div id="lv" aria-live="polite">${wizHint()}</div>`
  +`<label for="w_o">Weekly day off</label><select id="w_o" data-f="off"><option value="">No fixed day off</option>${DOW.map((d,i)=>`<option value="${i}" ${p.off===String(i)?'selected':''}>${d}</option>`).join('')}</select>`+inp('w_c','Commitment notes (optional)',`data-f="workNote" maxlength="120" placeholder="For example: night duty on Fridays" value="${esc(p.workNote||'')}"`);
 if(s===5)b=`<div class="xcs" role="group" aria-label="Current level">${['Beginner','Intermediate','Advanced'].map(l=>XC('level',l,p.level===l,l,LVD[l])).join('')}</div><p class="sm mu" style="margin-top:10px">Your level sets how much time each new topic gets.</p>`;
 if(s===6)b=`<p class="sm mu" style="margin:0 0 10px">Open a subject and tick what you have finished. Use <b>!</b> for topics you find hard. Your plan skips finished topics and gives hard ones more time.</p><div class="legend sm"><span><i class="tb d on" aria-hidden="true">&#10003;</i> Completed</span><span><i class="tb w on" aria-hidden="true">!</i> Needs work</span></div><div id="ssum" class="card" style="margin:10px 0">${subsSum()}</div><label for="w_f" class="sr">Search subjects and topics</label><input id="w_f" type="search" data-g="tf" placeholder="Search a subject or topic" value="${esc(V.tf||'')}" autocomplete="off"><div id="subs" style="margin-top:10px">${subsHtml()}</div>`;
 if(s===8)b=`<div class="chips">${RES.map(x=>chip('tg','res',x,(p.res||[]).includes(x))).join('')}</div>`+inp('w_r','Other resources (optional)',`data-f="resOther" maxlength="120" value="${esc(p.resOther||'')}"`);
 if(s===7)b=ordStep();
 if(s===9)b=review();
 const dots=WS.slice(1).map((l,i)=>{const n=i+1;return n<s?`<button type="button" class="sg ok" data-a="goto" data-v="${n}" aria-label="Back to ${l}"></button>`:`<i class="sg${n===s?' now':''}" aria-hidden="true"></i>`}).join('');
 return`<div class="wz${an?' in':''}"><header class="wzh"><span class="wzb"><span class="wzl" aria-hidden="true">A</span>AceLife</span><span class="sm mu">Step ${s} of ${WN} &middot; ${WS[s]}</span></header><div class="stp" role="progressbar" aria-label="Setup progress" aria-valuemin="0" aria-valuemax="${WN}" aria-valuenow="${s}">${dots}</div><h1 class="wzt" tabindex="-1">${WT[s]}</h1><div class="wzc">${V.edit&&s<WN?'<p class="note">You are editing one answer. Change it, then tap <b>Build my plan</b>. The other steps are optional.</p>':''}${b}</div><p class="er" role="alert" style="margin-top:8px">${esc(V.err)}</p></div>`
  +(V.edit&&s<WN?`<div class="wzf wze"><button class="btn o" data-a="ecan">Cancel</button><button class="btn o" data-a="next">Next step</button><button class="btn" style="flex:1" data-a="ebuild">Build my plan</button></div>`:`<div class="wzf"><button class="btn o" data-a="back">${V.edit&&s===WN?'Previous':'Back'}</button><button class="btn" style="flex:1" data-a="next">${s<WN?'Continue':'Build my plan'}</button></div>`)}

function cal(act){act=act||'pday';const[y,m]=V.cal.split('-').map(Number),f=new Date(y,m-1,1),n=new Date(y,m,0).getDate(),off=(f.getDay()+6)%7;
 let c='MTWTFSS'.split('').map(x=>`<span class="wd" aria-hidden="true">${x}</span>`).join('')+'<span></span>'.repeat(off);
 for(let d=1;d<=n;d++){const k=y+'-'+pad(m)+'-'+pad(d),T=S.tasks.filter(t=>t.date===k),all=T.length&&T.every(t=>t.status==='done');
  c+=`<button class="cd${k===(V.pcd||V.day)?' sel':''}${k===today()?' now':''}" data-a="${act}" data-v="${k}" aria-label="${fD(k)}, ${T.length} tasks" aria-pressed="${k===(V.pcd||V.day)}">${d}<i class="${all?'ok':T.length?'has':''}"></i></button>`}
 return`<div class="calw"><div class="row sp"><button class="btn o s" data-a="cm" data-v="-1" aria-label="Previous month">&lsaquo;</button><b class="cmt">${f.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</b><button class="btn o s" data-a="cm" data-v="1" aria-label="Next month">&rsaquo;</button></div><div class="grid7">${c}</div></div>`}
const logged=t=>sum(S.sessions.filter(x=>x.taskId===t.id),x=>x.mins);
const med=a=>{a=a.slice().sort((x,y)=>x-y);const n=a.length;return n?(n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2):0};
const SYM={done:'&#10003;',partial:'&frac12;',incomplete:'&#10005;',todo:''},LAB={done:'done',partial:'partly done',incomplete:'not done',todo:'not started'};
let PI=null;
const tbase=t=>String(t.topic).replace(/ \(part \d+\)$/,'');
function partInfo(t){if(t.type!=='study')return null;   // part number and share of the topic, counted across every day the topic is spread over
 if(!PI){PI={};const G={};S.tasks.forEach((x,i)=>{if(x.type!=='study')return;const k=x.subject+'|'+tbase(x);(G[k]=G[k]||[]).push([x,i])});
  for(const k in G){const L=G[k].sort((a,b)=>a[0].date<b[0].date?-1:a[0].date>b[0].date?1:a[1]-b[1]),tot=sum(L,z=>z[0].mins)||1;let c=0;
   L.forEach(([x],j)=>{c+=x.mins;PI[x.id]={i:j+1,n:L.length,p:Math.round(x.mins/tot*100),end:j===L.length-1?100:Math.round(c/tot*100)}})}}
 return PI[t.id]||null}
const partTxt=t=>{const p=partInfo(t);return p?(p.n>1?'Part '+p.i+' of '+p.n+' · '+p.p+'% of this topic · '+p.end+'% done after this':'Whole topic · 100%'):''};
const partLine=t=>{const x=partTxt(t);return x?`<span class="sm part">${x}</span>`:''};
/* ---- 2. "how did you study this?" boxes under a finished task (replaces the pop-up) ---- */
const LGB=[['lec','Watched video'],['book','Read notes / book'],['mcq','Solved questions'],['test','Took a test'],['rev','Revised notes'],['grand','Grand test']];
const hasLog=t=>!!(t.log&&((t.log.k||[]).length||t.log.n||t.log.s!=null));
function lgBox(t){if(t.status!=='done'&&t.status!=='partial')return'';const open=V.lgi===t.id;
 if(!open&&hasLog(t))return`<div class="lgs"><span class="sm" style="color:var(--ok)">&#10003; ${esc(logText(t))}</span><button type="button" class="lgm" data-a="lgi" data-id="${t.id}">Edit</button></div>`;
 if(!open&&(t.doneDate!==today()))return'';
 const on=(t.log&&t.log.k)||[];
 return`<div class="lgb" role="group" aria-label="How did you study ${esc(t.subject)}?"><p class="sm mu" style="margin:0 0 6px">How did you study this? Tick all that apply.</p><div class="lgc">${LGB.map(([k,l])=>`<button type="button" class="lgk${on.includes(k)?' on':''}" data-a="lgq" data-id="${t.id}" data-v="${k}" aria-pressed="${on.includes(k)}"><i aria-hidden="true">${on.includes(k)?'&#10003;':''}</i>${l}</button>`).join('')}</div><div class="row" style="margin-top:8px"><button type="button" class="btn s" data-a="lgx" data-id="${t.id}">Done</button><button type="button" class="lgm" data-a="lg" data-id="${t.id}">Add score or question count</button></div></div>`}
const trow=t=>`<div class="trw"><div class="trow"><button class="chk ${t.status}" data-a="st" data-id="${t.id}" data-v="done" aria-pressed="${t.status==='done'}" aria-label="${esc(t.subject)}, ${LAB[t.status]}. Tap to mark done">${SYM[t.status]}</button><div class="m"><b>${esc(t.subject)}</b><span class="sm mu">${esc(tbase(t))}</span>${partLine(t)} <span class="sm">${logged(t)?'Studied '+hm(logged(t))+' · ':''}<span class="pri${t.pri}">${t.pri}</span>${t.type!=='study'?' · '+(t.type==='mock'?'mock test':'revision'):''}${t.history?' · moved':''}</span></div><button class="more" data-a="tm" data-id="${t.id}" aria-label="More options for ${esc(t.subject)}">&#8943;</button></div>${lgBox(t)}</div>`;
function ring(p){const c=251.3,from=V.rp==null?0:V.rp;V.rp=p;return`<svg class="ring" viewBox="0 0 96 96" role="img" aria-label="${p}% of the plan done"><circle class="t" cx="48" cy="48" r="40"/><circle class="v" cx="48" cy="48" r="40" stroke-dasharray="${c}" stroke-dashoffset="${(c*(1-from/100)).toFixed(1)}" data-to="${(c*(1-p/100)).toFixed(1)}" transform="rotate(-90 48 48)"/><text x="48" y="48">${p}%</text></svg>`}
function act(){const a=new Set(),m={};S.tasks.forEach(t=>{if(t.doneDate&&(t.status==='done'||t.status==='partial'))a.add(t.doneDate)});S.sessions.forEach(x=>m[x.day]=(m[x.day]||0)+x.mins);for(const k in m)if(m[k]>=20)a.add(k);return a}
function dayMins(k){return sum(S.sessions.filter(x=>x.day===k),x=>x.mins)+(S.timer&&dk(new Date(S.timer.start))===k?Math.floor(stMs(S.timer)/6e4):0)}
const tmf=x=>new Date(x).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
const totalMins=()=>sum(S.sessions,x=>x.mins)+(S.timer?Math.floor(stMs(S.timer)/6e4):0);
function sessCard(k){const L=S.sessions.filter(x=>x.day===k).sort((a,b)=>a.start<b.start?-1:1),run=S.timer&&dk(new Date(S.timer.start))===k?S.timer:null,w=sum(wkDays(0),dayMins);
 return`<section class="card sess"><div class="row sp"><h2 style="margin:0">Study sessions</h2><span class="sm mu">${k===today()?'Today':fD(k)}</span></div>`
 +`<div class="stats" style="margin-top:10px"><div><b>${hm(dayMins(k))}</b><span>${k===today()?'Today':'This day'}</span></div><div><b>${hm(w)}</b><span>This week</span></div><div><b>${hm(totalMins())}</b><span>All time</span></div></div>`
 +(L.length||run?L.map((x,i)=>{const t=x.taskId?byId(x.taskId):null;return`<p class="row sp srow"><span><b>Session ${i+1}: ${hm(x.mins)}</b><br><span class="sm mu">${tmf(x.start)} to ${tmf(x.end)}${t?' · '+esc(t.subject):''}${x.aw?' · left the app '+x.aw+(x.aw>1?' times':' time')+(x.awm?' ('+x.awm+'m)':''):''}</span></span><button class="more" data-a="sdel" data-id="${x.id}" aria-label="Delete session ${i+1}">&times;</button></p>`}).join('')
  +(run?`<p class="row sp srow"><span><b>Session ${L.length+1}: ${hm(Math.floor(stMs(run)/6e4))}</b> <span class="tag ok">${run.pz?'paused':'running'}</span><br><span class="sm mu">Started ${tmf(run.start)}</span></span></p>`:''):'<p class="mu sm" style="margin:6px 0 0">No sessions yet. Start the timer and every session you finish is listed here. Pause it any time you need a rest.</p>')+`</section>`}
function home(){
 const k=V.day,T=tasksOn(k),est=sum(T,t=>t.mins),dm=sum(T,doneMin),pc=est?Math.round(dm/est*100):0,n=diff(today(),S.p.examDate),M=miss(),a=act(),nd=T.filter(t=>t.status==='done').length;
 let st=0,c=today();if(!a.has(c))c=addD(c,-1);while(a.has(c)){st++;c=addD(c,-1)}
 const next=T.find(t=>t.status==='todo')||T.find(t=>t.status==='partial'),up=S.tasks.filter(t=>t.date>today()&&t.status!=='done').sort((x,y)=>x.date<y.date?-1:x.date>y.date?1:P[x.pri]-P[y.pri]).slice(0,4);
 const wk=wkDays(0).map(d=>`<button class="${d===V.day?'sel':''}${d===today()?' now':''}" data-a="day" data-v="${d}" aria-pressed="${d===V.day}" aria-label="${fD(d)}"><span class="sm">${pd(d).toLocaleDateString(undefined,{weekday:'narrow'})}</span><b>${pd(d).getDate()}</b><i class="${S.tasks.some(t=>t.date===d)?'has':''}"></i></button>`).join('');
 return`<div class="hero"><div style="flex:1;min-width:0"><div class="gr">${typeof avBtn==='function'?avBtn():''}<h1>${greet()}, ${esc(S.p.name)}</h1>${typeof themeBtn==='function'?themeBtn():''}</div><p>${n>0?n+' days to '+EX[S.p.exam].n:'Exam date has passed'}</p><p class="sm">${k===today()?'Today':fD(k)}: ${nd} of ${T.length} tasks done </p><span class="pill">${st}-day streak</span></div>${ring(pc)}</div>`
 +(M.length?`<div class="note" style="margin-bottom:14px"><b>${M.length} missed task${M.length>1?'s':''}.</b> <button class="btn s" data-a="tab" data-v="roadmap" style="margin-left:6px">Fix my plan</button></div>`:'')
 +(typeof quickCard==='function'?quickCard():'')+`<div class="wk">${wk}</div>`
 +`<div class="row" style="margin:0 0 14px"><button class="btn o s" style="flex:1" data-a="rest">Rest</button><button class="btn o s" style="flex:1" data-a="share">Share today's progress</button></div>`
 +(next&&k===today()&&!S.timer?`<section class="card next"><p class="sm mu" style="margin:0">Up next</p><h2 style="margin:2px 0">${esc(next.subject)}</h2><p style="margin:0">${esc(next.topic)}</p><button class="btn" data-a="go" data-id="${next.id}">Start studying</button></section>`:'')
 +`<section class="card"><div class="row sp"><h2 style="margin:0">${k===today()?"Today's tasks":fD(k)}</h2><button class="btn o s" data-a="add">Add task</button></div>${capRow(k)}${T.length?T.map(trow).join(''):'<p class="mu" style="margin:12px 0 0">No tasks on this day. Add one, or pick another day.</p>'}${k===today()&&!S.timer?'<button class="btn o w" style="margin-top:10px" data-a="go" data-id="">Start a timer without a task</button>':''}<p class="sm mu" style="margin:10px 0 0">Tap the circle when a task is done, then note how you studied. The three dots have more options. Times are guides: a little more or less is fine.</p></section>`
 +(typeof routCard==='function'?routCard(k):'')+sessCard(k)
 +(up.length?`<section class="card"><h2>Coming up</h2>${up.map(t=>`<p class="row sp" style="margin:0 0 6px"><span>${esc(t.subject)}:${esc(t.topic)}</span><span class="sm mu" style="white-space:nowrap">${fD(t.date)}</span></p>`).join('')}</section>`:'')
 +`<p class="sm mu">Streak: a day counts with 20+ minutes timed, or a task marked done or partly done.</p>`}
function planCard(d){const sm=d?d.summary:S.p.summary,m=d?d.mode:S.p.planMode;if(!sm)return'';
 const cur=Engine.modeFor(Math.max(1,diff(today(),S.p.examDate))),sk=sm.skipped||[],ch=!d&&m&&m!==cur;
 return(ch?`<div class="note" style="margin-bottom:12px"><b>Your exam is now closer.</b> Rebuild to switch to the ${esc(Engine.modeName(cur,S.p.level))}. Finished work is kept.<br><button class="btn s" style="margin-top:8px" data-a="regen">Build a new draft</button></div>`:'')
 +`<section class="card"><h2>${esc(Engine.modeName(m,S.p.level))}</h2><p class="sm">${Math.max(0,diff(today(),S.p.examDate))} days to the exam. Study time for new topics: <b>${hm(sm.supply)}</b>. Time the topics need: <b>${hm(sm.demand)}</b>.</p>`
 +(sk.length?`<details><summary class="sm"><b>${sk.length} topic${sk.length>1?'s':''} skipped because time is short</b> (lowest priority first)</summary>${sk.map(x=>`<p class="sm" style="margin:4px 0">${esc(x.s)}: ${esc(x.n)} (${hm(x.min)})</p>`).join('')}</details>`:'<p class="sm mu" style="margin:0">Every topic fits in the time you have.</p>')
 +(sm.later?`<p class="sm mu" style="margin:8px 0 0">Showing the first ${sm.emit} days. Rebuild later to continue from where you are.</p>`:'')+'</section>'}
function planBody(){
 const d=S.draft,L=d?d.tasks:S.tasks,st=d?d.start:(S.p.planStart||today());
 if(!L.length)return`<h1>Plan</h1><div class="card"><h2>No plan yet</h2><p class="mu">Build a suggested plan from your answers, review it, then accept it.</p><button class="btn w" data-a="regen">Build my plan</button></div>`;
 const W={};L.forEach(t=>{const w=Math.max(0,Math.floor(diff(st,t.date)/7));(W[w]=W[w]||[]).push(t)});
 const ms=L.filter(t=>t.type!=='study'&&t.date>=today()).sort((a,b)=>a.date<b.date?-1:1).slice(0,5),rp=S.tasks.filter(repl).length;
 const LR=Engine.learn(S.p.exam,STRATEGIES.concat(S.top));let h=`<h1>${d?'Review your plan':'Your plan'}</h1><p class="note"><b>Suggestions, not verified facts.</b> ${LR.enough?`Tuned with ${LR.n} verified strategies and your answers.`:`Built from your answers and proven study habits: spaced revision, practice questions and weekly mocks.`} About 85% of your ${S.p.hours} daily hours is planned and the rest stays free for catching up. Check topics against your official syllabus. No plan can guarantee a score or rank.</p>`;
 h+=d?`<div class="card" style="margin-top:12px"><p>${hm(sum(d.tasks,t=>t.mins))} across ${d.tasks.length} tasks. ${rp?`Accepting replaces ${rp} untouched suggested task${rp>1?'s':''} from your earlier plan. Finished, partial, moved and manual tasks stay.`:''}</p>${d.agreed?'<button class="btn w" data-a="accept">Accept plan</button>':'<button class="btn w" data-a="disc">Read the terms to continue</button>'}<div class="row" style="margin-top:8px"><button class="btn o" style="flex:1" data-a="regen">Rebuild</button><button class="btn o" style="flex:1" data-a="redo">Edit answers</button></div></div>`
 :`<div class="row" style="margin:12px 0;flex-wrap:wrap"><button class="btn o s" data-a="regen">Build a new draft</button><button class="btn o s" data-a="redo">Edit answers</button></div>`;
 h+=planCard(d);if(!d)h+=planCal();h+=`<section class="card"><h2>Revision and mock milestones</h2>${ms.length?ms.map(t=>`<p class="row sp" style="margin:0 0 6px"><span>${esc(t.type==='mock'?'Mock test':'Revision: '+t.subject)}</span><span class="sm mu">${fD(t.date)}</span></p>`).join(''):'<p class="mu">None scheduled.</p>'}</section>`;
 Object.keys(W).forEach(w=>{const X=W[w],ds=[...new Set(X.map(t=>t.date))].sort(),foc=[...new Set(X.filter(t=>t.type==='study').map(t=>t.subject))].slice(0,4).join(', ')||'revision';
  h+=`<details class="card" ${w==='0'?'open':''}><summary><b>Week ${+w+1}</b> <span class="sm mu">${fD(ds[0])} to ${fD(ds[ds.length-1])}</span><br><span class="sm">Goal: cover ${esc(foc)}; ${X.filter(t=>t.type==='revision').length} revision and ${X.filter(t=>t.type==='mock').length} mock sessions. ${hm(sum(X,t=>t.mins))} planned.</span></summary>`
  +ds.map(k=>`<h3>${fD(k)}</h3>`+X.filter(t=>t.date===k).map(t=>`<p class="rw ${t.status}"><b>${esc(t.subject)}</b>: ${esc(tbase(t))}<br>${partLine(t)}<span class="sm mu">${hm(t.mins)} · <span class="pri ${t.pri}">${t.pri}</span>${t.type!=='study'?' · '+t.type:''}${d?' · suggested':''}</span></p>`).join('')).join('')+'</details>'});
 return h}
function planCal(){const k=V.pcd||today(),T=tasksOn(k);
 return`<section class="card"><h2>Calendar</h2><p class="sm mu" style="margin:0 0 8px">Tap a date to see what is planned. Dots: blue = tasks planned, green = all done.</p>${cal('pday')}<div class="pcd"><div class="row sp"><b>${k===today()?'Today':fD(k)}</b><button class="btn o s" data-a="opd" data-v="${k}">Open in Today</button></div>`
 +(T.length?T.map(t=>`<p class="rw ${t.status}"><b>${esc(t.subject)}</b>: ${esc(tbase(t))}<br>${partLine(t)}<span class="sm mu">${hm(t.mins)} · ${LAB[t.status]}${t.type!=='study'?' · '+t.type:''}</span></p>`).join(''):'<p class="sm mu" style="margin:6px 0 0">Nothing planned on this day.</p>')+`</div></section>`}
function roadmap(){const c=!S.draft&&miss().length?recover():'',k=coachCard(),b=planBody();return c||k?b.replace('</h1>',()=>'</h1>'+k+c):b}
const icsCard=()=>`<section class="card"><h2>Add to your calendar</h2><p class="sm mu">Put the next 7 days of study blocks into Google Calendar or Apple Calendar, with reminders.</p><button class="btn o" data-a="ics">Export week to Calendar (.ics)</button></section>`;
const dataCard=()=>`<section class="card"><h2>Your data</h2><p class="sm mu">${mode==='cloud'?'Saved to your account and on this phone.':'Saved on this phone.'} A backup file holds your plan, tasks, study sessions and settings.</p><div class="stack"><button class="btn o" data-a="bkx">Export backup (.json)</button><button class="btn o" data-a="bki">Import backup (.json)</button><button class="btn o" data-a="csvx">Download study sessions (.csv)</button><button class="btn o dng" data-a="reset">Erase everything</button></div><input type="file" id="bk" accept="application/json,.json" hidden></section>`;
function recover(){
 const M=miss().sort((a,b)=>P[a.pri]-P[b.pri]||(a.date<b.date?-1:1));
 if(!M.length)return`<h1>Recover</h1><div class="card"><h2>Nothing missed</h2><p class="mu">Unfinished tasks from past days appear here. Nothing is moved or deleted unless you accept it.</p></div>`;
 const tot=sum(M,t=>t.mins),c=cap(today()),free=sum([1,2,3,4,5,6,7].map(i=>addD(today(),i)),k=>Math.max(0,cap(k)-load(k)));
 return`<h2 style="margin:18px 0 8px">Catch up</h2><section class="card"><h2>Remaining workload</h2><div class="stats"><div><b>${hm(tot)}</b><span>Missed</span></div><div><b>${hm(free)}</b><span>Free, next 7 days</span></div><div><b>${hm(c)}</b><span>Daily limit</span></div></div><p class="sm">Putting all ${hm(tot)} on tomorrow would make it ${hm(load(addD(today(),1))+tot)}, above your ${hm(cap(addD(today(),1)))} limit. So we spread the work out instead. You approve every change.</p><button class="btn w" data-a="sug">Suggest a gentle plan</button></section>`
 +M.map(t=>`<article class="card tk ${t.status}"><b>${esc(t.subject)}</b>: ${esc(t.topic)}<p class="sm mu" style="margin:0 0 8px">Planned ${fD(t.date)} · ${hm(t.mins)} · ${t.status==='partial'?'partly done':'not done'}</p><div class="row"><button class="btn s" data-a="rs" data-id="${t.id}">Reschedule</button><button class="btn o s" data-a="skip" data-id="${t.id}">Dismiss</button></div></article>`).join('')}
function progress(){const t=V.pt==='tests'&&typeof testsView==='function';
 return`<div class="seg" role="tablist" aria-label="Progress sections"><button role="tab" aria-selected="${!t}" data-a="pt" data-v="overview">Overview</button><button role="tab" aria-selected="${t}" data-a="pt" data-v="tests">Tests</button></div>`+(t?`<h1>Topic tests</h1>`+testsView():progressMain())}
function progressMain(){
 const D=wkDays(V.wk),T=S.tasks.filter(t=>D.includes(t.date)),pl=sum(T,t=>t.mins),cp=sum(T,doneMin),a=act(),el=D.filter(k=>k<=today()),ac=el.filter(k=>a.has(k)).length;
 const per=D.map(k=>{const x=T.filter(t=>t.date===k);return[sum(x,t=>t.mins),sum(x,doneMin)]}),mx=Math.max(60,...per.map(x=>x[0])),out=T.filter(t=>t.status!=='done'),SB={};
 S.tasks.forEach(t=>{const o=SB[t.subject]||(SB[t.subject]={p:0,c:0});o.p+=t.mins;o.c+=doneMin(t)});
 return`<h1>Weekly progress</h1><div class="row sp"><button class="btn o s" data-a="wk" data-v="-1">&lsaquo; Prev</button><b>${fD(D[0])} to ${fD(D[6])}</b><button class="btn o s" data-a="wk" data-v="1">Next &rsaquo;</button></div>`
 +`<section class="card" style="margin-top:12px"><div class="stats"><div><b>${hm(pl)}</b><span>Planned</span></div><div><b>${hm(cp)}</b><span>Completed</span></div><div><b>${hm(sum(S.sessions.filter(s=>D.includes(s.day)),s=>s.mins))}</b><span>Timed</span></div></div><div class="chart" role="img" aria-label="Planned versus completed study for each day, Monday to Sunday">${per.map((x,i)=>`<div class="col"><div class="bars"><i class="pl" style="height:${x[0]/mx*100}%"></i><i class="cp" style="height:${x[1]/mx*100}%"></i></div><span class="sm">${'MTWTFSS'[i]}</span></div>`).join('')}</div><p class="sm mu" style="margin:6px 0 0">Light bars: planned. Dark bars: completed (partial counts as half).</p></section>`
 +`<section class="card"><h2>Tasks and consistency</h2><p>${T.filter(t=>t.status==='done').length} of ${T.length} tasks completed. ${out.length} outstanding, ${out.filter(t=>t.date<today()).length} of them already past.</p><p>${el.length?ac+' of '+el.length+' days active this week.':'This week has not started yet.'}</p><button class="btn o s" data-a="share">Share today's progress</button></section>`
 +(typeof testSum==='function'?testSum():'')+`<section class="card"><h2>Subject-wise progress</h2>${Object.keys(SB).length?Object.entries(SB).sort((x,y)=>y[1].p-x[1].p).map(([s,o])=>{const p=Math.round(o.c/o.p*100);return`<p class="row sp" style="margin:0 0 2px"><span>${esc(s)}</span><span class="sm mu">${p}% · ${hm(o.c)} of${hm(o.p)}</span></p><div class="bar g" style="margin-bottom:10px"><i style="width:${p}%"></i></div>`}).join(''):'<p class="mu">Subject progress appears once you have tasks.</p>'}</section>`}
const TABS=['home','study','roadmap','progress','profile'];
const planGate=()=>!!(S&&S.draft&&!S.tasks.length&&S.p.onboarded);   // first plan only: the other tabs open once you accept it (or choose to edit it)
function discSheet(){sheet(`<h2>Before you continue</h2><p>AceLife builds a <b>suggested</b> study plan from your answers. Please read this:</p><ul class="sm dsc"><li><b>No guarantee.</b> We do not promise success, a score, a rank or a selection in any exam. Your result depends on your effort and many things outside this app.</li><li><b>Check the syllabus.</b> Topics, order and timings are suggestions. Confirm them with your exam's official notification.</li><li><b>You stay in control.</b> You can edit your answers or any task at any time.</li><li>AI replies and toppers' strategies are guidance only and can contain mistakes. They are not professional advice.</li></ul><p class="sm mu">By continuing you accept our <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy-policy.html" target="_blank" rel="noopener">Privacy Policy</a>.</p><div class="stack"><button class="btn" data-a="agree">I agree and continue</button><button class="btn o" data-a="disced">No, let me edit my answers</button></div>`);$('#sh').dataset.lock='1'}
function profile(){const p=S.p,ex=EX[p.exam]||{n:''},a=act();let st=0,c=today();if(!a.has(c))c=addD(c,-1);while(a.has(c)){st++;c=addD(c,-1)}
 const nT=(p.tdone||[]).length,nW=(p.tweak||[]).length,rows=[[1,'Name',p.name||'-'],[2,'Exam',ex.n],[3,'Exam date and target',(p.examDate?fD(p.examDate):'-')+(p.target?' · '+p.target:'')],[4,'Daily study time',hm((+p.hours||0)*60)+(+p.workHrs?' · work '+hm(+p.workHrs*60):'')],[5,'Level',p.level||'-'],[6,'Syllabus',nT+' topics done, '+nW+' weak'],[7,'Study order',p.ordOn?'Your own order':'Automatic'],[8,'Resources',(p.res||[]).join(', ')||'-']];
 return`<h1>Profile</h1><section class="card pf"><button type="button" class="av avp" data-a="phot" aria-label="Change profile photo">${typeof avHtml==='function'?avHtml():esc((p.name||'?').trim().charAt(0).toUpperCase())}<i class="cam" aria-hidden="true">+</i></button><input type="file" id="phf" accept="image/*" hidden><div style="min-width:0"><h2 style="margin:0">${esc(p.name||'Student')}</h2><p class="sm mu" style="margin:2px 0 6px">${esc(ex.n)}</p><span class="pill">${st}-day streak</span> <span class="pill">${hm(totalMins())} studied</span>${p.photo?' <button type="button" class="lgm" data-a="phrm">Remove photo</button>':''}</div></section>`
 +accountCard()
 +`<section class="card"><h2>Your answers</h2><p class="sm mu">Change anything you told us at set-up. Your plan is rebuilt from the new answers and nothing is applied until you accept it. The back button cancels.</p>${rows.map(r=>`<div class="row sp ans"><span style="min-width:0"><b>${r[1]}</b><br><span class="sm mu">${esc(r[2])}</span></span><button class="btn o s" data-a="redo" data-v="${r[0]}" aria-label="Edit ${r[1]}">Edit</button></div>`).join('')}</section>`
 +`<section class="card"><h2>Help</h2><p class="sm mu">New to AceLife, or want a reminder of what each tab does?</p><button class="btn o" data-a="tour">Take the 1-minute tour</button></section>`+timerCard()+(typeof focusCard==='function'?focusCard():'')+(typeof themeCard==='function'?themeCard():'')+(typeof permCard==='function'?permCard():'')+remCard()+icsCard()+dataCard()+(typeof liveCard==='function'?liveCard():'')
 +library()+(typeof aboutCard==='function'?aboutCard():`<p class="sm mu" style="text-align:center">AceLife ${esc(VER)}</p>`)}
function library(){
 const x=V.lx||S.p.exam,E=STRATEGIES.concat(S.top).filter(e=>e.exam===x);
 return socCard()+aiCard()+`<h2 class="sec">Strategy library</h2>`
 +`<details class="card tops" data-k="tops"${V.lo.tops?' open':''}><summary><b>Toppers' strategies</b><br><span class="sm mu">${E.length?E.length+' for '+esc(EX[x].n)+'. Tap to view':'None yet for '+esc(EX[x].n)}</span></summary><label class="sr" for="lx_s">Exam</label><select id="lx_s" data-g="lx" style="margin:10px 0">${Object.keys(EX).map(k=>`<option value="${k}"${x===k?' selected':''}>${esc(EX[k].n)}</option>`).join('')}</select><p class="sm mu">Every entry shows where it comes from. Nothing here is made up.</p>`
 +(E.length?E.map(e=>`<details class="te" data-k="e_${esc(String(e.id))}"${V.lo['e_'+e.id]?' open':''}><summary><b>${esc(e.name)}</b> <span class="sm mu">exam year ${e.year}</span><br><span class="tag ${(e.fixed?e.verified:e.checked)?'ok':''}">${e.fixed?(e.verified?'Verified source':'Source supplied, not verified'):(e.checked?'Source checked by you':'Source not yet checked')}</span></summary><dl class="sm"><dt>Reported preparation duration</dt><dd>${esc(e.dur||'Not stated')}</dd><dt>Reported resources</dt><dd>${esc(e.res||'Not stated')}</dd><dt>Revision approach</dt><dd>${esc(e.rev||'Not stated')}</dd><dt>Source</dt><dd>${/^https?:\/\//.test(e.src)?`<a href="${esc(e.src)}" target="_blank" rel="noopener noreferrer">${esc(e.src)}</a>`:esc(e.src)}</dd></dl>${e.fixed?'':`<div class="row"><button class="btn o s" data-a="tc" data-id="${e.id}">${e.checked?'Mark unchecked':'I checked the source'}</button><button class="btn o s" data-a="tr" data-id="${e.id}">Remove</button></div>`}</details>`).join(''):`<p class="mu">Toppers' strategies for ${EX[x].n} will appear here soon.</p>`)+'</details>'
 +`<section class="card"><h2>General recommendations</h2><p><span class="tag">General advice, not from any topper</span></p><ul class="sm"><li>Plan backwards from the exam date and keep a weekly buffer for missed days.</li><li>Mix reading with active recall and practice questions instead of only re-reading.</li><li>Revise on a fixed rhythm so earlier subjects do not fade.</li><li>Take timed mocks regularly and spend real time analysing mistakes.</li><li>Protect sleep and breaks. Steady days beat occasional marathon days.</li></ul></section>`}
const ICO={home:'<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/>',roadmap:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',recover:'<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>',progress:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',library:'<path d="M4 5a2 2 0 012-2h5v17H6a2 2 0 00-2 2zM20 5a2 2 0 00-2-2h-5v17h5a2 2 0 012 2z"/>',study:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v6"/>'};
function render(){render0();try{syncGuard()}catch(e){}}
function render0(){try{
 const a=$('#app'),nv=$('#nv');
 if(!ready){a.innerHTML=loadView();nv.hidden=true;return}
 if(V.build){nv.hidden=true;document.body.classList.remove('lv');a.innerHTML=buildView();return}
 if(authOn()&&!CL().user){nv.hidden=true;document.body.classList.remove('lv');a.innerHTML=authView();return}
 if(!S.p.onboarded){nv.hidden=true;document.body.classList.remove('lv');const sa=V.sa;a.innerHTML=wiz();if(sa&&V.step){const h=$('.wzt');if(h)h.focus({preventScroll:true})}return}
 if(planGate())V.tab='roadmap';PI=null;const M=miss().length,run=S.timer,rt=run&&run.taskId?byId(run.taskId):null;nv.hidden=false;document.body.classList.toggle('lv',!!run);document.body.classList.toggle('lvm',!!(run&&V.mn&&!V.fs));
 const LK2=planGate();nv.innerHTML=[['home','Today'],['study','Study'],['roadmap','Plan'],['progress','Progress'],['profile','Profile']].map(([k,l])=>`<button data-a="tab" data-v="${k}" ${V.tab===k?'aria-current="page"':''}${LK2&&k!=='roadmap'?' disabled aria-disabled="true" title="Accept or edit your plan first"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>${l}${k==='roadmap'&&M?` <span class="dot">${M}</span>`:''}</button>`).join('');
 a.innerHTML=(typeof topBar==='function'?topBar():'')+({home,roadmap,recover,progress,study:()=>typeof studyView==='function'?studyView():'',profile}[V.tab]||home)()+`<p class="sm mu" style="text-align:center"><span id="st">${esc(V.st)}</span></p>`+(run?liveHtml(run,rt):'');tick();postRender()
}catch(e){console.error(e);$('#app').innerHTML='<div class="card"><h2>Something went wrong</h2><p class="mu">Your saved data is safe. Reload the page to try again.</p></div>'}}

function sheet(h){$('#shb').innerHTML=h;$('#sh').classList.add('on');syncGuard();const i=$('#shb input,#shb button');if(i)i.focus()}
function closeSheet(){const h=$('#sh');h.classList.remove('on');delete h.dataset.lock;syncGuard()}
function toast(m){const e=$('#ts');e.textContent=m;e.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>e.classList.remove('on'),2600)}
function startTick(){clearInterval(iv);iv=setInterval(tick,1000)}
/* ---- study timer: counts UP from 00:00:00 until the learner stops it; the colour theme changes with time studied ---- */
const TH=[[0,'Warm-up','#4CC9F0','#0B3A5B'],[15,'Settling in','#2EE6A8','#0B4F4A'],[30,'Deep focus','#A58BFF','#2B1F6B'],[60,'In the zone','#FFC94A','#4A3200'],[90,'Flow state','#FF8A4C','#5E2208'],[120,'Unstoppable','#FF5DA2','#561041']];   // [from minute, stage name, ring colour, background colour]
const thIdx=m=>{let i=0;TH.forEach((t,j)=>{if(m>=t[0])i=j});return i};
const clk=s=>pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(s%60),mmss=s=>pad(Math.floor(s/60))+':'+pad(s%60);
function liveHtml(run,rt){const el=Math.floor(stMs(run)/1e3),h=TH[thIdx(el/60)],po=run.pomo,pz=!!run.pz,br=po&&po.ph==='b'&&!pz,tp=typeof tpStyle==='function'?tpStyle():'';
 if(V.mn&&!V.fs)return`<div class="live mini${pz?' pz':''}" id="lvp" data-a="mini" role="button" tabindex="0" aria-label="Study timer ${pz?'paused':'running'}. Tap to open it." style="--tc:${h[2]};--tb:${h[3]};${tp}"><i class="md" aria-hidden="true"></i><span class="mt" id="tm">${clk(el)}</span>${pz?'<b class="pzt">Paused</b>':''}</div>`;
 return`<div class="live${V.fs?' full':''}${pz?' pz':''}" id="lvp" style="--tc:${h[2]};--tb:${h[3]};${V.fs?'':tp}" role="group" aria-label="Study timer">`
  +`<button type="button" class="lvx" data-a="fs" aria-expanded="${!!V.fs}" aria-label="${V.fs?'Minimise timer':'Open full-screen timer'}">${V.fs?'&#10005;':'&#10530;'}</button>`
  +(V.fs?'':`<button type="button" class="lvx lvm" data-a="mini" aria-label="Shrink the timer to a small pill">&#8211;</button>`)
  +`<svg class="clk" viewBox="0 0 200 200" data-a="fs" aria-hidden="true"><circle class="ct" cx="100" cy="100" r="88"/><circle class="cv${br?' brk':''}" id="cv" cx="100" cy="100" r="88" stroke-dasharray="552.9" stroke-dashoffset="552.9" transform="rotate(-90 100 100)"/><text class="t${br?' brk':''}" id="tm" x="100" y="110">${clk(el)}</text></svg>`
  +`<span class="stg" id="tl"></span><small>${rt?esc(rt.subject+': '+tbase(rt)):'General study'}${S.p.fm&&S.p.fm.on?' · Focus on':''}</small>`
  +`<div class="row"><button class="pmb" data-a="pomo" aria-pressed="${!!po}"${pz?' disabled':''} aria-label="Pomodoro rhythm, ${PF()} minutes focus and ${PB()} minutes break">${PF()}/${PB()}</button><button class="pmb" data-a="pset" aria-label="Timer and alarm settings">&#9881;</button>${window.Float&&Float.ok()?'<button class="pmb" data-a="float" aria-label="Float the timer outside the app">Float</button>':''}<button class="btn s pzb" data-a="pause">${pz?'Resume':'Pause'}</button><button class="btn s" data-a="timer">Stop</button></div></div>`}
function tick(){if(S&&S.timer){if(pomoStep())render();checkAlarm()}const e=$('#tm');if(!e||!S||!S.timer)return;
 const T=S.timer,el=Math.floor(stMs(T)/1e3),po=T.pomo,L=po?pdur(po)/1e3:0,left=po?Math.max(0,L-Math.floor((Date.now()-new Date(po.ps))/1e3)):0;
 e.textContent=clk(el);
 const f=po?1-left/L:T.goal?el/(T.goal*60):(el%3600)/3600,cv=$('#cv');if(cv)cv.setAttribute('stroke-dashoffset',(552.9*(1-Math.min(1,Math.max(0,f)))).toFixed(1));
 const i=thIdx(el/60),h=TH[i],p=$('#lvp');if(p){p.style.setProperty('--tc',h[2]);p.style.setProperty('--tb',h[3])}
 const tl=$('#tl');if(tl)tl.textContent=T.pz?'Paused. Tap Resume when you are ready':po?(po.ph==='b'?'Break · '+mmss(left)+' left':h[1]+' · break in '+mmss(left)):h[1]+' · '+(i<TH.length-1?'next stage at '+TH[i+1][0]+' min':'keep it up');
 if(V.thI===undefined)V.thI=i;else if(i>V.thI){V.thI=i;toast(h[1]+': '+h[0]+' minutes of focus');vib([80,60,80])}else V.thI=i}
let wl=null;async function wake(on){try{if(on&&navigator.wakeLock&&!wl){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}else if(!on&&wl){const w=wl;wl=null;await w.release()}}catch(e){}}

function bestDays(m,x,t){const e=addD(S.p.examDate,-1),r=[];
 for(let i=0;i<14;i++){const k=addD(today(),i);if(k>e)break;if(String(pd(k).getDay())===S.p.off)continue;
  const D=S.tasks.filter(z=>z.date===k);if(D.some(z=>z.type==='mock'))continue;
  const cp=cap(k),rc=Math.max(60,cp*.3);if(load(k,x)+m>cp||(x&&(x[k]||0)+m>rc))continue;
  r.push([k,load(k,x)-(t&&D.some(z=>z.subject===t.subject)?30:0)-(t&&t.type==='revision'&&D.some(z=>z.type==='revision')?40:0)])}
 return r.sort((a,b)=>a[1]-b[1]||(a[0]<b[0]?-1:1)).map(z=>z[0])}
function moveT(t,k,m){const h={from:t.date,to:k,at:new Date().toISOString()};
 if(t.status==='partial'){t.resolved=true;const n={...t,id:uid(),date:k,mins:m,status:'todo',resolved:false,history:[h],gen:false};delete n.doneDate;S.tasks.push(n)}
 else{t.history=(t.history||[]).concat(h);t.date=k;t.mins=m;t.status='todo'}}
function rsp(){const m=+$('#r_m').value,k=$('#r_d').value,e=$('#rp');if(!e)return;
 if(!okD(k)||!okM(m)){e.textContent='Enter a valid date and duration to preview the workload.';return}
 const a=load(k),b=a+m,c=cap(k);let h=`<b>${fD(k)}</b>: ${hm(a)} planned now, <b>${hm(b)}</b> after this move (limit ${hm(c)}). `;
 if(b>c){const alt=bestDays(m).filter(x=>x!==k).slice(0,2);h+=`That is ${hm(b-c)} over your limit. Options: `+(alt.map(x=>`<button class="btn o s" data-a="pickd" data-v="${x}">${fD(x)} (${hm(cap(x)-load(x))} free)</button>`).join(' ')||'no day in the next 2 weeks has room. ')+(c-a>=30?` <button class="btn o s" data-a="fit" data-v="${Math.floor((c-a)/15)*15}">Shorten to ${hm(Math.floor((c-a)/15)*15)}</button>`:'')}
 else h+='This fits your daily limit.';e.innerHTML=h}

const A={
 tab:d=>{if(planGate()&&d.v!=='roadmap'){toast('Accept your plan, or edit your answers, to open the other tabs.');return}if(d.v!==V.tab){if(d.v==='home')V.nav=[];else V.nav.push(V.tab);V.tab=d.v;V.fx=true;V.rp=0}vib(6);scrollTo(0,0);render()},
 next:()=>{const e=chk(V.step);if(e){V.err=e;vib(40);render();return}V.err='';
  if(V.step<WN){V.step++;V.sa=true;if(V.step===6){migrateTopics();V.tf=''}save();render();scrollTo(0,0)}
  else{for(let i=1;i<WN;i++){const m=chk(i);if(m){V.step=i;V.err=m;V.sa=true;render();scrollTo(0,0);return}}
   S.p.hours=+S.p.hours;S.p.workHrs=+S.p.workHrs;cleanTopics();S.p.onboarded=true;buildRoadmap()}},
 back:()=>{V.err='';V.step=Math.max(0,V.step-1);V.sa=true;render();scrollTo(0,0)},
 ecan:()=>{try{if(V.snap)S.p=JSON.parse(V.snap)}catch(e){}S.p.onboarded=true;V.edit=false;V.snap='';V.step=0;V.err='';save();render();scrollTo(0,0)},
 ebuild:()=>{const e=chk(V.step);if(e){V.err=e;vib(40);render();return}V.err='';V.step=WN;A.next()},
 goto:d=>{if(V.step===WN&&S.p.planStart||V.step===WN&&S.draft)V.edit=true;V.err='';V.step=+d.v;V.sa=true;if(V.step===6){migrateTopics();V.tf=''}render();scrollTo(0,0)},
 ordm:d=>{S.p.ordOn=d.v==='1';S.p.ord=S.p.ord||{};V.err='';vib(8);const y=scrollY;render();scrollTo(0,y)},
 ordset:d=>{const o=S.p.ord=S.p.ord||{},r=+d.v;if(!r||+o[d.s]===r)delete o[d.s];else o[d.s]=r;V.err='';vib(8);const y=scrollY;render();scrollTo(0,y)},
 ordweak:()=>{const p=S.p,L=ordSubs(),wk=L.filter(s=>(p.weak||[]).includes(s)||subStat(s).w>0);if(!wk.length){toast('Mark some topics with ! first, then try again.');return}
  p.ord={};L.forEach(s=>{p.ord[s]=wk.includes(s)?1:2});V.err='';const y=scrollY;render();scrollTo(0,y)},
 ordclr:()=>{S.p.ord={};const y=scrollY;render();scrollTo(0,y)},
 qd:d=>{S.p.examDate=addD(today(),+d.v);vib(8);render()},
 pick:d=>{if(d.k==='exam'&&S.p.exam!==d.v){S.p.done=[];S.p.weak=[];S.p.tdone=[];S.p.tweak=[];S.p.ord={};S.p.ordOn=false}S.p[d.k]=d.v;vib(8);render()},
 tt:d=>{const p=S.p,k=tkey(d.s,d.t),a=d.m==='d'?'tdone':'tweak',o=d.m==='d'?'tweak':'tdone';p[a]=p[a]||[];p[o]=(p[o]||[]).filter(z=>z!==k);const i=p[a].indexOf(k);i<0?p[a].push(k):p[a].splice(i,1);syncSub(d.s);vib(8);wzSubs();save()},
 sall:d=>{const p=S.p,T=topicsOf(p.exam,d.s),full=subStat(d.s).d===T.length,has=k=>T.some(t=>tkey(d.s,t)===k);p.tdone=(p.tdone||[]).filter(k=>!has(k));p.tweak=(p.tweak||[]).filter(k=>!has(k));if(!full)T.forEach(t=>p.tdone.push(tkey(d.s,t)));syncSub(d.s);vib(12);wzSubs();save()},
 tg:d=>{const a=S.p[d.k]=S.p[d.k]||[],i=a.indexOf(d.v);i<0?a.push(d.v):a.splice(i,1);
  if(i<0&&d.k==='done')S.p.weak=(S.p.weak||[]).filter(x=>x!==d.v);if(i<0&&d.k==='weak')S.p.done=(S.p.done||[]).filter(x=>x!==d.v);render()},
 redo:d=>{if(S.p.onboarded){V.snap=JSON.stringify(S.p);V.edit=true}S.p.onboarded=false;V.step=Math.min(WN,Math.max(1,+(d&&d.v)||2));save();render()},
 regen:()=>buildRoadmap(),
 agree:()=>{const d=S.draft;S.p.agreeV=1;S.p.agreedAt=new Date().toISOString();if(d)d.agreed=1;closeSheet();save();render();toast('Thanks. Review your plan, then accept it.')},
 disced:()=>{closeSheet();A.redo({v:9})},
 disc:()=>discSheet(),
 accept:()=>{const d=S.draft;if(!d.agreed){discSheet();return}S.tasks=S.tasks.filter(t=>!repl(t)).concat(d.tasks);S.p.planStart=d.start;S.p.planMode=d.mode;S.p.summary=d.summary;S.draft=null;V.tab='home';V.nav=[];V.day=today();save();render();toast('Plan accepted');setTimeout(()=>{if(typeof Guide!=='undefined'&&!S.p.toured)Guide.tour(0);else if(window.Perms)Perms.first()},900)},
 day:d=>{V.day=d.v;render()},
 pday:d=>{V.pcd=d.v;vib(6);render()},
 opd:d=>{V.day=d.v;V.nav=[];V.tab='home';V.fx=true;scrollTo(0,0);render()},
 cm:d=>{const[y,m]=V.cal.split('-').map(Number),x=new Date(y,m-1+(+d.v),1);V.cal=x.getFullYear()+'-'+pad(x.getMonth()+1);render()},
 st:d=>{const t=byId(d.id);t.status=t.status===d.v?'todo':d.v;if(t.status==='done'||t.status==='partial')t.doneDate=today();else delete t.doneDate;save();render();vib(12);
  if(t.status==='done'){const b=$(`.chk[data-id="${t.id}"]`);if(b){b.classList.add('pop');burst(b)}const T=tasksOn(today());if(t.date===today()&&T.every(z=>z.status==='done'))toast('All of today\'s tasks are done. Great work!');V.lgi=t.id;setTimeout(()=>{if(V.lgi===t.id)render()},450)}},
 x:closeSheet,
 remon:async()=>{if(!window.Notification||!navigator.serviceWorker){toast('This browser cannot show notifications.');return}
  if(await Notification.requestPermission()!=='granted'){toast('Notifications are blocked. Allow them in your browser settings.');return}
  let reg=null;try{reg=await Promise.race([navigator.serviceWorker.ready,new Promise((_,j)=>setTimeout(j,3000))])}catch(e){toast('Open the installed or hosted app to use reminders.');return}
  S.rem.on=true;try{await reg.periodicSync.register('study-reminder',{minInterval:12*36e5});S.rem.bg=true}catch(e){S.rem.bg=false}
  save();render();toast(S.rem.bg?'Reminders are on':'Reminders are on while the app is open')},
 remoff:()=>{S.rem.on=false;save();render()},
 remtest:async()=>{toast(await notify({title:'AceLife',body:'Reminders are working.',tag:'test'})?'Test sent':'Could not show a notification')},
 go:async d=>{
  if(S.timer)A.timer();
  const t=d.id?byId(d.id):null,g=t?Math.max(30,Math.round((t.mins-logged(t))/15)*15):0;
  unlockAudio();const n0=new Date().toISOString();
  S.timer={start:n0,taskId:d.id||'',goal:0,brk:0,pt:0,pz:null,pomo:S.p.pomo?mkPomo(n0):null};V.thI=undefined;
  startTick();closeSheet();save();render();
  if(window.Float&&Float.arm)Float.arm();   // needs this tap, so it is armed here
  toast('Timer started. It runs until you stop it.');
  if(window.Notification&&Notification.permission==='default'&&!S.rem.askedTimer){
   S.rem.askedTimer=true;save();try{await Notification.requestPermission()}catch(e){}
  }
 },
 tm:d=>{const t=byId(d.id);sheet(`<h2>${esc(t.subject)}</h2><p class="mu">${esc(t.topic)}</p><div class="stack"><button class="btn" data-a="go" data-id="${t.id}">Start studying this</button>${typeof testBtn==='function'?testBtn(t):''}${t.status==='todo'&&aiOn()?`<button class="btn o" data-a="aisp" data-id="${t.id}">Break into sub-topics (AI, '+AI.left()+' left today)</button>`:''}<button class="btn o" data-a="lg" data-id="${t.id}">Log what I did</button><button class="btn o" data-a="st2" data-id="${t.id}" data-v="partial">Partly done</button><button class="btn o" data-a="st2" data-id="${t.id}" data-v="incomplete">Not done</button><button class="btn o" data-a="del" data-id="${t.id}">Delete task</button><button class="btn o" data-a="x">Close</button></div>`)},
 st2:d=>{const t=byId(d.id);t.status=t.status===d.v?'todo':d.v;if(t.status==='done'||t.status==='partial')t.doneDate=today();else delete t.doneDate;closeSheet();save();render()},
 add:()=>sheet(`<h2>Add task</h2>${inp('t_s','Subject',`list="sl" maxlength="60"`)}<datalist id="sl">${EX[S.p.exam].sub.map(s=>`<option value="${esc(s)}">`).join('')}</datalist>${inp('t_t','Topic','maxlength="100"')}${inp('t_m','Estimated minutes (30 to 600, steps of 15)','type="number" inputmode="numeric" min="30" max="600" step="15" value="60"')}<label for="t_p">Priority</label><select id="t_p"><option>High</option><option selected>Medium</option><option>Low</option></select>${inp('t_d','Scheduled date',`type="date" min="${today()}" max="${S.p.examDate}" value="${V.day<today()?today():V.day}"`)}<p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="addok">Save task</button></div>`),
 addok:()=>{const s=$('#t_s').value.trim(),t=$('#t_t').value.trim(),m=+$('#t_m').value,d=$('#t_d').value;
  const e=!s?'Enter a subject.':!t?'Enter a topic.':!okM(m)?'Duration must be 30 to 600 minutes, in steps of 15 (30, 45, 60, ...).':(!okD(d)||d<today()||d>S.p.examDate)?'Pick a date from today up to your exam date.':'';
  if(e){$('#se').textContent=e;return}
  S.tasks.push({id:uid(),subject:s,topic:t,mins:m,pri:$('#t_p').value,date:d,type:'study',status:'todo'});closeSheet();save();render();toast('Task added')},
 del:d=>sheet(`<h2>Delete this task?</h2><p>${esc(byId(d.id).subject)}: ${esc(byId(d.id).topic)}. This cannot be undone.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Keep it</button><button class="btn" style="flex:1" data-a="delok" data-id="${d.id}">Delete</button></div>`),
 delok:d=>{S.tasks=S.tasks.filter(t=>t.id!==d.id);closeSheet();save();render();toast('Task deleted')},
 timer:()=>{if(S.timer){pomoStep(1);const s=new Date(S.timer.start),m=Math.min(1440,Math.round(stMs(S.timer)/6e4));
   if(m<1)toast('Under a minute, so it was not logged.');else{S.sessions.push({id:uid(),start:s.toISOString(),end:new Date().toISOString(),day:dk(s),mins:m,taskId:S.timer.taskId,aw:S.timer.aw||0,awm:Math.round((S.timer.awt||0)/6e4)});toast('Saved '+hm(m)+' of study')}
   S.timer=null;V.thI=undefined;V.fs=false;wake(false);if(window.Float)Float.stopped();clearInterval(iv);clearTimeout(alarmT);clearTimeout(pomoT);pomoKey=''}else{S.timer={start:new Date().toISOString(),taskId:V.tt,goal:0,pt:0,pz:null};startTick()}save();render()},
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
  sheet(`<h2>Suggested recovery plan</h2><p class="sm mu">A suggestion only. Nothing moves until you accept. It spreads work across days, keeps mock days clear, groups related subjects, and trims low-priority items last.</p>`+(pl.length?pl.map(x=>{const t=byId(x.id);return`<p><b>${esc(t.subject)}</b>: ${esc(t.topic)}<br><span class="sm">${fD(t.date)} to <b>${fD(x.d)}</b>, ${hm(x.m)}${x.m<x.r?' (shortened from '+hm(x.r)+')':''}</span></p>`}).join('')+`<p class="sm"><b>Workload after:</b> ${Object.keys(add).sort().map(k=>fD(k)+' '+hm(load(k)+add[k])+' of '+hm(cap(k))).join('; ')}</p>`:'<p>No task fits the next two weeks without going over your daily limit.</p>')+(sk.length?`<p class="sm"><b>Suggest dismissing (${sk.length}):</b> ${sk.map(t=>esc(t.subject)).join(', ')}. They stay in your history, and you can still reschedule them by hand.</p>`:'')+(un.length?`<p class="sm">${un.length} not placed. Reschedule them yourself.</p>`:'')+`<div class="row"><button class="btn o" style="flex:1" data-a="x">Reject</button>${pl.length||sk.length?'<button class="btn" style="flex:1" data-a="sugok">Accept plan</button>':''}</div>`)},
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
 resetok:()=>{S=fresh();V.step=0;V.tab='home';clearInterval(iv);closeSheet();save();render()}
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a])A[b.dataset.a](b.dataset);else if(e.target.id==='sh'&&!e.target.dataset.lock)closeSheet()});
document.addEventListener('input',e=>{const t=e.target,f=t.dataset.f,g=t.dataset.g;if(f&&S){S.p[f]=t.value;wizLive()}if(g==='rs')rsp();if(g==='tt')V.tt=t.value;if(g==='tf'){V.tf=t.value;wzSubs()}if(g==='lx'){V.lx=t.value;render()}});
document.addEventListener('toggle',e=>{const d=e.target;if(d.classList&&d.classList.contains('sj')){if(!V.tf)V.ob[d.dataset.s]=d.open}else if(d.dataset&&d.dataset.k)V.lo[d.dataset.k]=d.open},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(V.fs&&!sheetOpen()){V.fs=false;wake(false);render();return}closeSheet()}if(e.key==='Enter'&&S&&ready&&!S.p.onboarded&&V.step>0&&e.target.tagName==='INPUT'&&!e.target.dataset.g&&e.target.type!=='range'){e.preventDefault();A.next()}});

let guardOn=false,skipPop=false;
const sheetOpen=()=>$('#sh').classList.contains('on');
const needGuard=()=>!!(S&&ready&&(sheetOpen()||document.getElementById('qx')||(V.build&&!V.build.err)||(authOn()&&!CL().user&&AUTH.mode==='signup')||(S.p.onboarded?V.tab!=='home':V.step>0)));
function syncGuard(){const n=needGuard();
 if(n&&!guardOn){try{history.pushState({g:1},'');guardOn=true}catch(e){}}
 else if(!n&&guardOn){guardOn=false;skipPop=true;setTimeout(()=>{skipPop=false},500);try{history.back()}catch(e){}}}
function handleBack(){
 if(sheetOpen()){if($('#sh').dataset.lock)return true;closeSheet();return true}
 if(document.getElementById('qx')){A.qxend();return true}
 if(V.build&&!V.build.err)return true;
 if(authOn()&&!CL().user){if(AUTH.mode==='signup'){AUTH.mode='login';AUTH.err='';return true}return false}
 if(!S.p.onboarded){if(S.p.planStart||S.draft){A.ecan();return true}if(V.step>0){V.err='';V.step--;return true}return false}
 if(V.tab==='study'&&(V.sv||V.fr)){V.sv='';V.fr=null;return true}
 if(planGate())return false;
 if(V.tab!=='home'){V.tab=V.nav.pop()||'home';return true}
 return false}
addEventListener('popstate',()=>{if(skipPop){skipPop=false;return}guardOn=false;try{handleBack()}catch(e){}render()});

const LOGS=[['lec','Watched lectures'],['book','Read textbook'],['mcq','Solved practice questions'],['test','Took a topic test'],['grand','Took a grand test'],['rev','Revised notes']];
const LOGSHORT={lec:'Lectures',book:'Textbook',mcq:'Questions',test:'Topic test',grand:'Grand test',rev:'Notes'};
const logText=t=>[...t.log.k.map(k=>LOGSHORT[k]),...(t.log.n?[t.log.n+' questions']:[]),...(t.log.s!=null?[t.log.s+'%']:[])].join(' · ');
function logSheet(){const t=byId(V.lg.id),on=V.lg.k;
 sheet(`<h2>How did you study this?</h2><p class="mu">${esc(t.subject)}: ${esc(t.topic)}</p><div class="chips" role="group" aria-label="What you did">${LOGS.map(([k,l])=>chip('lgt','',k,on.includes(k),l)).join('')}</div>${inp('lg_n','Questions solved (optional)',`type="number" inputmode="numeric" min="0" max="500" data-g="lg" data-key="n" value="${esc(V.lg.n)}"`)}${inp('lg_s','Score in percent (optional)',`type="number" inputmode="numeric" min="0" max="100" data-g="lg" data-key="s" value="${esc(V.lg.s)}"`)}${aiOn()?'<button class="btn o w" style="margin-top:10px" data-a="aiq0">Quick 3-MCQ Check (AI, '+AI.left()+' left today)</button>':''}<p class="sm mu" style="margin-top:8px">This helps adjust your next practice and revision.</p><p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Skip</button><button class="btn" style="flex:1" data-a="lgok">Save</button></div>`)}
function advise(t){const L=t.log,out=[],name=t.tk?t.tk.split('|')[1]:t.topic,practice=L.k.includes('mcq')||L.k.includes('test')||L.n>0;
 const addT=(m,topic,txt)=>{const d=bestDays(m,0,t).filter(k=>diff(today(),k)<=3).sort()[0];if(d)out.push({kind:'add',d,m,topic,txt})};
 if(L.s!=null&&L.s<60)addT(45,'Practice questions: '+name,'Your score was low. Add a 45-minute practice session on this topic.');
 else if(!practice&&(L.k.includes('lec')||L.k.includes('book')))addT(30,'Practice questions: '+name,'You have studied this but not practised yet. Add a 30-minute question session.');
 if(L.k.includes('grand'))addT(45,'Grand test review: '+t.subject,'Add a 45-minute review of the mistakes from your grand test.');
 if(L.s!=null&&L.s>=80&&practice){const r=S.tasks.filter(x=>x.type==='revision'&&x.status==='todo'&&x.date>=today()&&x.subject===t.subject&&x.topic==='Revise: '+name).sort((x,y)=>x.date<y.date?-1:1)[0];
  if(r){const d=bestDays(r.mins,0,r).filter(k=>diff(r.date,k)>=5)[0];if(d)out.push({kind:'move',id:r.id,d,txt:'Strong score. Move the next revision of this topic to '+fD(d)+'.'})}}
 return out.slice(0,2)}
A.lg=d=>{const t=byId(d.id),L=t.log||{k:[]};V.lg={id:t.id,k:L.k.slice(),n:L.n?String(L.n):'',s:L.s!=null?String(L.s):''};logSheet()};
A.lgt=d=>{const k=V.lg.k,i=k.indexOf(d.v);i<0?k.push(d.v):k.splice(i,1);logSheet()};
A.lgok=()=>{const t=byId(V.lg.id),n=V.lg.n===''?null:+V.lg.n,s=V.lg.s===''?null:+V.lg.s,e=$('#se');
 if(n!==null&&!(Number.isInteger(n)&&n>=0&&n<=500)){e.textContent='Questions solved must be a whole number from 0 to 500.';return}
 if(s!==null&&!(s>=0&&s<=100)){e.textContent='Score must be between 0 and 100.';return}
 if(!V.lg.k.length&&n===null&&s===null){closeSheet();return}
 t.log={k:V.lg.k.slice(),n:n||0,s,at:new Date().toISOString()};save();
 const adv=V.adj=advise(t);
 if(!adv.length){closeSheet();render();toast('Saved. Thanks.');return}
 sheet(`<h2>Adjust your next sessions?</h2>${adv.map(o=>`<p>${esc(o.txt)}${o.kind==='add'?'<br><span class="sm mu">'+fD(o.d)+', '+hm(o.m)+'</span>':''}</p>`).join('')}<p class="sm mu">Nothing changes unless you apply it.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">No thanks</button><button class="btn" style="flex:1" data-a="adjok">Apply</button></div>`);render()};
A.lgq=d=>{const t=byId(d.id);if(!t)return;t.log=t.log||{k:[],n:0,s:null};t.log.k=t.log.k||[];const i=t.log.k.indexOf(d.v);i<0?t.log.k.push(d.v):t.log.k.splice(i,1);t.log.at=new Date().toISOString();V.lgi=t.id;vib(8);save();render()};   // saved the moment you tick
A.lgi=d=>{V.lgi=V.lgi===d.id?null:d.id;render()};
A.lgx=d=>{const t=byId(d.id);V.lgi=null;if(!t)return;if(!hasLog(t)){render();return}
 V.lg={id:t.id,k:t.log.k.slice(),n:t.log.n?String(t.log.n):'',s:t.log.s!=null?String(t.log.s):''};const adv=V.adj=advise(t);
 if(!adv.length){render();toast('Saved. Thanks.');return}
 sheet(`<h2>Adjust your next sessions?</h2>${adv.map(o=>`<p>${esc(o.txt)}${o.kind==='add'?'<br><span class="sm mu">'+fD(o.d)+', '+hm(o.m)+'</span>':''}</p>`).join('')}<p class="sm mu">Nothing changes unless you apply it.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">No thanks</button><button class="btn" style="flex:1" data-a="adjok">Apply</button></div>`);render()};
A.adjok=()=>{const t=byId(V.lg.id);(V.adj||[]).forEach(o=>{if(o.kind==='add')S.tasks.push({id:uid(),subject:t.subject,topic:o.topic,mins:o.m,pri:'High',date:o.d,type:'study',why:'Added after your study log',status:'todo'});else{const r=byId(o.id);if(r)moveT(r,o.d,r.mins)}});V.adj=[];closeSheet();save();render();toast('Plan adjusted')};
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.g==='lg'&&V.lg)V.lg[t.dataset.key]=t.value});

let alarmT=null,actx=null,errAt=0;
const PF=()=>Math.min(180,Math.max(1,Math.round(+S.p.pf)||25)),PB=()=>Math.min(60,Math.max(1,Math.round(+S.p.pb)||5));
const pdur=P=>(P.ph==='f'?(P.f||25):(P.b||5))*6e4,mkPomo=ps=>({ph:'f',ps,f:PF(),b:PB()});
const SNDS={bell:'Soft bell',chime:'Glass chime',harp:'Harp',calm:'Calm tone',off:'No sound'};
function chime(kind,sd,vl){try{sd=sd||(S&&S.p&&S.p.snd)||'bell';if(sd==='off')return;unlockAudio();if(!actx)return;
 const vol={low:.12,mid:.22,high:.4}[vl||(S&&S.p&&S.p.pvol)||'mid']||.22,N={C6:1046.5,E6:1318.5,G6:1568,G5:784,C5:523.25};
 const seq={stop:['G6','E6','C6'],go:['C6','E6','G6'],done:['C6','E6','G6','C6']}[kind||'done']||['C6'];
 const st=sd==='chime'?{ty:'sine',dec:1.2,h:[1,3,4.2],ha:[1,.4,.2],gap:.32}:sd==='harp'?{ty:'triangle',dec:1.1,h:[1,2],ha:[1,.25],gap:.22}:sd==='calm'?{ty:'sine',dec:2.2,h:[1],ha:[1],gap:.7}:{ty:'sine',dec:1.8,h:[1,2.76,5.4],ha:[1,.35,.12],gap:.5};
 const t0=actx.currentTime+.03;
 seq.forEach((n,i)=>st.h.forEach((m,j)=>{const o=actx.createOscillator(),g=actx.createGain(),t=t0+i*st.gap;o.type=st.ty;o.frequency.value=N[n]*m*(sd==='calm'?.5:1);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol*st.ha[j],t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+st.dec);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+st.dec+.05)}))}catch(e){}}
function unlockAudio(){try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){actx=actx||new AC();if(actx.state==='suspended')actx.resume()}}catch(e){}}
function beep(k){chime(k)}
function armAlarm(){clearTimeout(alarmT);const T=S&&S.timer;if(!T||!T.goal||T.fired)return;alarmT=setTimeout(checkAlarm,Math.max(0,T.goal*6e4-stMs(T))+50)}
function alertNow(T){const t=T.taskId?byId(T.taskId):null,txt=t?t.subject+': '+t.topic:'Your study session';
 try{navigator.vibrate&&navigator.vibrate([300,150,300,150,500])}catch(e){}
 beep();
 if(window.Notification&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(r=>r.showNotification('Time is up',{body:txt+'. '+hm(T.goal)+' goal reached. Open the app to mark it done.',tag:'timer',renotify:true,requireInteraction:true,vibrate:[300,150,300,150,500],icon:'icon-192.png',badge:'icon-192.png'})).catch(()=>{})}
function checkAlarm(){const T=S&&S.timer;if(!T||!T.goal)return;if(stMs(T)/6e4<T.goal)return;
 if(!T.fired){T.fired=true;save();alertNow(T)}
 if(!T.ack&&document.visibilityState==='visible'){T.ack=true;save();toast('Goal reached: '+hm(T.goal)+'. Keep going or stop when you like.');render()}}
A.tudone=()=>{const id=S.timer&&S.timer.taskId;closeSheet();A.timer();const t=id?byId(id):null;if(t){t.status='done';t.doneDate=today();V.lgi=t.id;save();render()}};
A.tumore=()=>{if(!S.timer)return;S.timer.goal+=15;S.timer.fired=false;S.timer.ack=false;closeSheet();armAlarm();save();render()};
A.offline=()=>skipNow();
function tAct(x){if(!S)return;
 if(x==='start'){if(!S.timer&&S.p.onboarded){const n=tasksOn(today()).find(t=>t.status==='todo');A.go({id:n?n.id:''})}return}
 if(x==='tests'){V.tab='progress';V.pt='tests';V.fx=true;render();return}
 if(!S.timer)return;if(x==='stop')A.timer();else if(x==='pause'&&!S.timer.pz)A.pause();else if(x==='resume'&&S.timer.pz)A.pause()}
if('serviceWorker' in navigator){navigator.serviceWorker.addEventListener('message',e=>{const m=e.data;if(m&&m.type==='timer')tAct(m.act)})}
A.pause=()=>{const T=S&&S.timer;if(!T)return;
 if(T.pz){const w=Math.max(0,Date.now()-new Date(T.pz).getTime());T.pt=(T.pt||0)+w;if(T.pomo)T.pomo.ps=new Date(new Date(T.pomo.ps).getTime()+w).toISOString();T.pz=null;pomoKey='';toast('Resumed')}
 else{pomoStep(1);T.pz=new Date().toISOString();toast('Paused. Rest well, then tap Resume.')}
 vib(10);save();render();if(window.Float&&Float.sync)Float.sync()};
A.resume=()=>{if(S&&S.timer&&S.timer.pz)A.pause()};
A.sdel=d=>{const x=S.sessions.find(y=>y.id===d.id);if(!x)return;sheet(`<h2>Delete this session?</h2><p>${hm(x.mins)} on ${fD(x.day)}. This changes your totals and streak.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Keep it</button><button class="btn" style="flex:1" data-a="sdelok" data-id="${x.id}">Delete</button></div>`)};
A.sdelok=d=>{S.sessions=S.sessions.filter(y=>y.id!==d.id);closeSheet();save();render();toast('Session deleted')};
A.csvx=()=>{const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"',r=[['date','start','end','minutes','subject','topic']];
 S.sessions.slice().sort((a,b)=>a.start<b.start?-1:1).forEach(x=>{const t=x.taskId?byId(x.taskId):null;r.push([x.day,x.start,x.end,x.mins,t?t.subject:'',t?t.topic:''])});
 dl('acelife-sessions-'+today()+'.csv','\ufeff'+r.map(a=>a.map(q).join(',')).join('\r\n'),'text/csv');toast('Sessions downloaded')};
A.fs=()=>{if(!S.timer||Date.now()-(V.dg||0)<350)return;V.fs=!V.fs;wake(V.fs);vib(10);render()};
A.mini=()=>{if(!S.timer||Date.now()-(V.dg||0)<350)return;V.mn=!V.mn;V.fs=false;vib(8);render()};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S&&S.timer){armAlarm();checkAlarm();if(V.fs)wake(true);render()}});
addEventListener('error',e=>{if(Date.now()-errAt>1e4){errAt=Date.now();try{toast('Something went wrong. Your data is safe.')}catch(x){}}console.error(e.error||e.message)});
addEventListener('unhandledrejection',e=>console.error(e.reason));
const BSTEPS=['Reading your answers','Ordering subjects, foundation first','Fitting topics into your hours','Balancing priorities and revision','Placing mock tests and checking every day fits'];
const loadView=()=>`<section class="load"><div class="spin" aria-hidden="true"></div><h2>AceLife</h2><p class="mu">${esc(V.lm||'Starting up')}...</p>${V.slow?'<p class="sm mu">This is taking longer than usual. Your connection may be slow.</p><button class="btn o" data-a="offline">Continue with saved data</button>':''}</section>`;
function buildView(){const b=V.build;
 if(b.err)return`<div class="card"><h2>Could not build the plan</h2><p class="mu">Your answers are saved. Please try again.</p><button class="btn w" data-a="regen">Try again</button></div>`;
 const n=BSTEPS.length;return`<section class="load"><div class="spin" aria-hidden="true"></div><h2>Building your plan</h2><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${b.i}" style="margin:12px 0"><i style="width:${b.i/n*100}%"></i></div><ul class="steps">${BSTEPS.map((s,i)=>`<li class="${i<b.i?'ok':i===b.i?'now':''}">${esc(s)}</li>`).join('')}</ul><p class="sm mu">This runs on your phone, so it keeps working on a slow connection.</p></section>`}
async function buildRoadmap(){if(V.build&&!V.build.err)return;V.edit=false;V.snap='';V.build={i:0};save();render();scrollTo(0,0);await sleep(120);
 let d=null;try{d=gen(S.p)}catch(e){console.error(e)}
 if(!d){V.build={err:true};render();return}
 for(let i=1;i<=BSTEPS.length;i++){V.build.i=i;render();await sleep(450)}
 d.agreed=S.p.agreeV?1:0;S.draft=d;V.build=null;V.tab='roadmap';V.nav=['home'];save();render();scrollTo(0,0);if(!d.agreed)setTimeout(discSheet,350)}

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
 return`<section class="card"><h2>Study reminders</h2><p class="sm mu">${on?'On. You get a nudge around '+h12(usualHour())+' on days you have not studied. The time is learned from your timed sessions (7 pm until you have a few). After 2 days without opening the app, you get a "your plan is waiting" nudge.':'Get a nudge at your usual study time, and another if you have not opened the app for 2 days.'}</p><div class="row"><button class="btn ${on?'o ':''}s" data-a="${on?'remoff':'remon'}">${on?'Turn off':'Turn on reminders'}</button>${on?'<button class="btn o s" data-a="remtest">Send a test</button>':''}</div><p class="sm mu" style="margin:8px 0 0">Reminders can arrive a little late on some phones. ${on&&R.bg===false?'On this phone they only arrive while the app is open in the background.':''}</p></section>`}

const aiOn=()=>typeof AI!=='undefined'&&AI.on();
const DCAP=()=>(window.PLAN_CONFIG&&PLAN_CONFIG.dayCap)||[['Heavy Duty',.3],['Normal',1],['Full Day',1.4]];
const capRow=k=>{if(k<today())return'';const m=(S.p.dayCap||{})[k]||1,c=cap(k),l=load(k);
 return`<div class="chips cap" role="group" aria-label="Capacity for ${fD(k)}">${DCAP().map(([n,v])=>chip('dcap','',v,m===v,n)).join('')}</div>`+(m!==1||l>c?`<p class="sm ${l>c?'er':'mu'}" style="margin:6px 0 0">${hm(l)} planned of ${hm(c)} limit.${l>c?' Over the limit: tap the three dots on a task, then Reschedule.':''}</p>`:'')};
A.dcap=d=>{const m=+d.v,k=V.day;S.p.dayCap=S.p.dayCap||{};if(m===1)delete S.p.dayCap[k];else S.p.dayCap[k]=m;save();render()};
function dl(name,data,type){const b=data instanceof Blob?data:new Blob([data],{type:type||'text/plain'}),a=document.createElement('a');
 a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
const stMs=T=>{const n=T.pz?new Date(T.pz).getTime():Date.now();return n-new Date(T.start)-(T.pt||0)-(T.brk||0)-(T.pomo&&T.pomo.ph==='b'?Math.min(n-new Date(T.pomo.ps),(T.pomo.b||5)*6e4):0)};   // T.pz = when it was paused (if paused now), T.pt = total paused time so far
function pomoAlert(ph){const b=ph==='b',PO=(S.timer&&S.timer.pomo)||{},tt=b?'Break time: '+(PO.b||5)+' minutes':'Back to focus: '+(PO.f||25)+' minutes',bd=b?'Stand up, drink water, rest your eyes.':'Break is over. Start the next focus block.';
 try{navigator.vibrate&&navigator.vibrate(b?[300,150,300]:[500])}catch(e){}chime(b?'stop':'go');toast(tt);
 if(window.Notification&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(r=>r.showNotification(tt,{body:bd,tag:'pomo',renotify:true,vibrate:[300,150,300],icon:'icon-192.png',badge:'icon-192.png'})).catch(()=>{})}
function pomoStep(q){const T=S&&S.timer,P=T&&T.pomo;if(!P||T.pz)return false;let ch=false,i=0;const n=Date.now();
 while(i++<200){const d=pdur(P),e=new Date(P.ps).getTime()+d;if(isNaN(e)){P.ps=new Date().toISOString();break}if(e>n)break;
  if(P.ph==='b')T.brk=(T.brk||0)+d;P.ph=P.ph==='f'?'b':'f';P.ps=new Date(e).toISOString();ch=true}
 if(ch){save();armAlarm();if(!q)pomoAlert(P.ph)}
 if(pomoKey!==P.ps){pomoKey=P.ps;clearTimeout(pomoT);pomoT=setTimeout(tick,Math.max(500,new Date(P.ps).getTime()+pdur(P)-n)+60)}
 return ch}
const PRE=[[25,5],[30,5],[45,10],[50,10],[60,10],[90,15]];
A.pset=()=>{const f=PF(),b=PB(),sd=S.p.snd||'bell',vl=S.p.pvol||'mid';
 sheet(`<h2>Timer and alarm</h2><p class="sm mu">Choose how long you focus and rest. A soft sound tells you when to stop for a break and when to continue.</p><div class="chips" role="group" aria-label="Presets">${PRE.map(([x,y])=>`<button type="button" class="chip" data-a="ppre" data-f="${x}" data-b="${y}">${x} / ${y}</button>`).join('')}</div><div class="row" style="margin:12px 0"><div style="flex:1"><label for="pf_f">Focus (minutes)</label><input id="pf_f" type="number" inputmode="numeric" min="1" max="180" value="${f}"></div><div style="flex:1"><label for="pf_b">Break (minutes)</label><input id="pf_b" type="number" inputmode="numeric" min="1" max="60" value="${b}"></div></div><label for="pf_s">Alarm sound</label><select id="pf_s">${Object.entries(SNDS).map(([k,v])=>`<option value="${k}"${k===sd?' selected':''}>${v}</option>`).join('')}</select><label for="pf_v" style="margin-top:10px">Volume</label><select id="pf_v">${[['low','Low'],['mid','Medium'],['high','High']].map(([k,v])=>`<option value="${k}"${k===vl?' selected':''}>${v}</option>`).join('')}</select><div class="row" style="margin:12px 0"><button type="button" class="btn o s" style="flex:1" data-a="pprev" data-k="stop">Hear: take a break</button><button type="button" class="btn o s" style="flex:1" data-a="pprev" data-k="go">Hear: continue</button></div><div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="psave">Save</button></div>`)};
A.ppre=d=>{$('#pf_f').value=d.f;$('#pf_b').value=d.b};
A.pprev=d=>{unlockAudio();chime(d.k,$('#pf_s').value,$('#pf_v').value)};
A.psave=()=>{const f=Math.round(+$('#pf_f').value),b=Math.round(+$('#pf_b').value);if(!(f>=1&&f<=180)||!(b>=1&&b<=60)){toast('Focus can be 1 to 180 minutes and break 1 to 60.');return}
 S.p.pf=f;S.p.pb=b;S.p.snd=$('#pf_s').value;S.p.pvol=$('#pf_v').value;const T=S.timer;if(T&&T.pomo){T.pomo.f=f;T.pomo.b=b;pomoKey=''}
 closeSheet();save();render();toast('Saved: '+f+' min focus, '+b+' min break')};
const timerCard=()=>`<section class="card"><h2>Timer and alarm</h2><p class="sm mu">Focus and break lengths for the Pomodoro rhythm (now ${PF()}/${PB()}) and the alarm sound.</p><button class="btn o" data-a="pset">Change timer and alarm</button></section>`;
A.pomo=async()=>{const T=S.timer;if(!T||T.pz)return;unlockAudio();pomoStep(1);
 if(T.pomo){if(T.pomo.ph==='b')T.brk=(T.brk||0)+Math.min(Date.now()-new Date(T.pomo.ps),(T.pomo.b||5)*6e4);T.pomo=null;S.p.pomo=false;pomoKey='';clearTimeout(pomoT)}
 else{T.pomo=mkPomo(new Date().toISOString());S.p.pomo=true}
 armAlarm();save();render();toast(T.pomo?'Pomodoro on: '+PF()+' min focus, '+PB()+' min break':'Pomodoro off');
 if(T.pomo&&window.Notification&&Notification.permission==='default')try{await Notification.requestPermission()}catch(e){}};

A.bkx=()=>{dl('acelife-backup-'+today()+'.json',JSON.stringify(S,null,1),'application/json');toast('Backup downloaded')};
A.bki=()=>{const f=$('#bk');if(f){f.value='';f.click()}};
function okBk(o){if(!o||typeof o!=='object'||Array.isArray(o)||!o.p||typeof o.p!=='object'||!Array.isArray(o.tasks)||!Array.isArray(o.sessions))return'This is not an AceLife backup. It needs a profile, tasks and sessions.';
 if(o.p.exam&&!EX[o.p.exam])return'This backup is for an exam this version does not have.';
 const s=v=>typeof v==='string',tasks=o.tasks.filter(t=>t&&s(t.id)&&s(t.subject)&&s(t.topic)&&okD(t.date)&&t.mins>0&&t.mins<=600&&['todo','done','partial','incomplete'].includes(t.status)&&['High','Medium','Low'].includes(t.pri)&&['study','revision','mock'].includes(t.type));
 const ses=o.sessions.filter(x=>x&&s(x.id)&&s(x.start)&&!isNaN(new Date(x.start))&&okD(x.day)&&x.mins>0&&x.mins<=1440);
 if(o.tasks.length&&!tasks.length)return'No valid tasks were found in this file.';
 const h=hydrate(Object.assign({},o,{tasks,sessions:ses,top:Array.isArray(o.top)?o.top.filter(x=>x&&s(x.id)):[],tests:Array.isArray(o.tests)?o.tests.filter(x=>x&&s(x.key)&&x.n>0&&x.c>=0&&x.c<=x.n&&s(x.at)).slice(-300):[],qp:o.qp&&typeof o.qp==='object'&&!Array.isArray(o.qp)?o.qp:{},days:Array.isArray(o.days)?o.days.filter(okD):[],draft:o.draft&&Array.isArray(o.draft.tasks)?o.draft:null,
  ai:{hist:o.ai&&Array.isArray(o.ai.hist)?o.ai.hist.filter(x=>x&&s(x.id)&&['quiz','split','coach'].includes(x.k)&&(x.k!=='quiz'||Number.isFinite(x.score))).slice(-60):[]}}));
 if(!(+h.p.hours>=.5&&+h.p.hours<=16))h.p.hours=4;h.timer=null;h.soc.run=null;return h}
document.addEventListener('change',async e=>{if(e.target.id!=='bk')return;const f=e.target.files[0];if(!f)return;
 if(f.size>2e6){toast('That file is too big to be an AceLife backup.');return}
 try{const r=okBk(JSON.parse(await f.text()));if(typeof r==='string'){toast(r);return}V.imp=r;
  sheet(`<h2>Import backup?</h2><p class="sm">${r.tasks.length} tasks and ${r.sessions.length} study sessions${r.p.exam&&EX[r.p.exam]?' for '+esc(EX[r.p.exam].n):''}.</p><div class="stack"><button class="btn" data-a="bkm">Merge with my data</button><button class="btn o" data-a="bkr">Replace my data</button><button class="btn o" data-a="x">Cancel</button></div>`)}
 catch(x){toast('That file could not be read as an AceLife backup.')}});
A.bkr=()=>{if(!V.imp)return;clearInterval(iv);S=V.imp;S.upd=Date.now();V.imp=null;V.step=S.p.onboarded?0:1;V.tab='home';closeSheet();save();render();toast('Backup restored')};
A.bkm=()=>{const o=V.imp;if(!o)return;const ids=new Set(S.tasks.map(t=>t.id)),sid=new Set(S.sessions.map(x=>x.id)),tid=new Set(S.top.map(x=>x.id)),hid=new Set(S.ai.hist.map(x=>x.id));
 if(!S.p.onboarded&&o.p.onboarded)S.p=o.p;else S.p.dayCap=Object.assign({},o.p.dayCap,S.p.dayCap);
 S.tasks=S.tasks.concat(o.tasks.filter(t=>!ids.has(t.id)));S.sessions=S.sessions.concat(o.sessions.filter(x=>!sid.has(x.id))).sort((a,b)=>a.start<b.start?-1:1);
 S.top=S.top.concat(o.top.filter(x=>!tid.has(x.id)));S.days=[...new Set(S.days.concat(o.days))].sort().slice(-400);S.ai.hist=S.ai.hist.concat(o.ai.hist.filter(x=>!hid.has(x.id))).slice(-60);
 V.imp=null;closeSheet();save();render();toast('Backup merged')};

const icsT=s=>String(s).replace(/\\/g,'\\\\').replace(/[,;]/g,m=>'\\'+m).replace(/\r?\n/g,'\\n');
const icsF=l=>{const o=[],E=new TextEncoder();let c='',b=0;for(const ch of l){const n=E.encode(ch).length;if(b+n>(o.length?74:75)){o.push(c);c='';b=0}c+=ch;b+=n}o.push(c);return o.join('\r\n ')};
const icsD=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(d.getHours())+pad(d.getMinutes())+'00';
A.ics=()=>sheet(`<h2>Export week to Calendar</h2><p class="sm mu">Your study blocks for the next 7 days become calendar events, placed one after another from the time you choose. Open the file to add them to Google Calendar or Apple Calendar.</p>${inp('ic_t','First block starts at',`type="time" value="${esc(S.p.icsT||pad(usualHour())+':00')}"`)}<div class="row" style="margin-top:12px"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="icsok">Download .ics</button></div>`);
A.icsok=()=>{const v=$('#ic_t').value;if(!/^\d{2}:\d{2}$/.test(v)){toast('Pick a start time.');return}S.p.icsT=v;
 const[hh,mm]=v.split(':').map(Number),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,''),L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AceLife//Study Plan//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:AceLife study plan'];let n=0;
 for(let i=0;i<7;i++){const k=addD(today(),i);let s=pd(k);s.setHours(hh,mm,0,0);
  tasksOn(k).forEach(t=>{const e=new Date(s.getTime()+t.mins*6e4);n++;
   L.push('BEGIN:VEVENT','UID:'+t.id+'@acelife','DTSTAMP:'+stamp,'DTSTART:'+icsD(s),'DTEND:'+icsD(e),icsF('SUMMARY:'+icsT(t.subject+': '+t.topic)),icsF('DESCRIPTION:'+icsT('Priority: '+t.pri+(t.type!=='study'?'. '+t.type:'')+(t.why?'. '+t.why:'')+'. Planned with AceLife')),'BEGIN:VALARM','TRIGGER:-PT10M','ACTION:DISPLAY','DESCRIPTION:Study block starts soon','END:VALARM','END:VEVENT');s=e})}
 if(!n){toast('No tasks in the next 7 days.');return}
 L.push('END:VCALENDAR');closeSheet();save();dl('acelife-week-'+today()+'.ics',L.join('\r\n')+'\r\n','text/calendar');toast(n+' study blocks exported')};

const stk=()=>{const a=act();let st=0,c=today();if(!a.has(c))c=addD(c,-1);while(a.has(c)){st++;c=addD(c,-1)}return st};
async function shareImg(){
 const k=today(),T=tasksOn(k),est=sum(T,t=>t.mins),pc=est?Math.round(sum(T,doneMin)/est*100):0,n=diff(k,S.p.examDate),st=stk(),dn=T.filter(t=>t.status==='done'),ex=EX[S.p.exam]?EX[S.p.exam].n:'AceLife';
 const cs=getComputedStyle(document.documentElement),col=(v,d)=>cs.getPropertyValue(v).trim()||d,H1=col('--h1','#27348B'),H2=col('--h2','#4658D0'),AC=col('--ac','#E8A200');
 try{await document.fonts.load('800 40px Mukta')}catch(e){}
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d'),F=(w,s)=>w+' '+s+'px Mukta,system-ui,sans-serif';
 const fit=(t,w)=>{if(x.measureText(t).width<=w)return t;while(t.length>1&&x.measureText(t+'...').width>w)t=t.slice(0,-1);return t+'...'};
 const g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,H1);g.addColorStop(1,H2);x.fillStyle=g;x.fillRect(0,0,1080,1350);
 x.textBaseline='alphabetic';x.textAlign='left';x.fillStyle=AC;x.font=F(800,44);x.fillText('AceLife',80,120);
 x.fillStyle='#fff';x.font=F(800,84);x.fillText(fit(ex,920),80,250);
 x.fillStyle='rgba(255,255,255,.88)';x.font=F(600,52);x.fillText(n>0?n+' days to go':n===0?'Exam day':'Exam date has passed',80,330);
 x.fillStyle=AC;x.font=F(800,170);x.fillText(String(st),80,640);x.fillStyle='#fff';x.font=F(600,44);x.fillText('-day streak',80,710);
 x.lineWidth=36;x.lineCap='round';x.strokeStyle='rgba(255,255,255,.22)';x.beginPath();x.arc(800,590,150,0,Math.PI*2);x.stroke();
 if(pc>0){x.strokeStyle=AC;x.beginPath();x.arc(800,590,150,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,pc/100));x.stroke()}
 x.fillStyle='#fff';x.font=F(800,96);x.textAlign='center';x.fillText(pc+'%',800,624);x.font=F(600,34);x.fillText('of today',800,672);x.textAlign='left';
 x.fillStyle='#fff';x.font=F(800,46);x.fillText('Done today'+(dn.length?' ('+dn.length+')':''),80,850);
 if(!dn.length){x.fillStyle='rgba(255,255,255,.8)';x.font=F(600,40);x.fillText('Nothing finished yet. Today is still open.',80,930)}
 dn.slice(0,5).forEach((t,i)=>{const y=930+i*62;x.fillStyle=AC;x.beginPath();x.arc(104,y-13,22,0,Math.PI*2);x.fill();
  x.strokeStyle=H1;x.lineWidth=6;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(94,y-13);x.lineTo(101,y-5);x.lineTo(115,y-22);x.stroke();
  x.fillStyle='#fff';x.font=F(600,40);x.fillText(fit(t.subject+': '+t.topic,860),148,y)});
 x.fillStyle=AC;x.font=F(800,48);x.fillText('Timed today: '+hm(dayMins(k)),80,1240);
 x.fillStyle='rgba(255,255,255,.65)';x.font=F(400,32);x.textAlign='center';x.fillText('Planned with AceLife',540,1306);
 const b=await new Promise(r=>c.toBlob(r,'image/png'));if(!b){toast('Could not make the picture.');return}
 if(V.shu)URL.revokeObjectURL(V.shu);V.shb=b;V.shu=URL.createObjectURL(b);
 sheet(`<h2>Your progress</h2><img src="${V.shu}" alt="Progress picture: ${pc}% of today done, ${st}-day streak" style="width:100%;border-radius:14px;margin-top:8px"><div class="stack"><button class="btn" data-a="shimg">Share image</button><button class="btn o" data-a="shdl">Download PNG</button><button class="btn o" data-a="x">Close</button></div>`)}
A.share=()=>shareImg().catch(e=>{console.error(e);toast('Could not make the picture.')});
A.shimg=async()=>{const b=V.shb;if(!b)return;const f=new File([b],'acelife-progress-'+today()+'.png',{type:'image/png'});
 try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'AceLife',text:'Planned with AceLife'});return}}catch(e){if(e&&e.name==='AbortError')return}
 toast('Sharing is not available here. Downloading instead.');A.shdl()};
A.shdl=()=>{if(V.shb)dl('acelife-progress-'+today()+'.png',V.shb)};

const SOC=[['ig','Instagram','#C13584','instagram://app','https://instagram.com'],['yt','YouTube','#E62117','vnd.youtube://','https://youtube.com'],['wa','WhatsApp','#1FA855','whatsapp://','http://whatsapp.com'],['x','X','#14171A','twitter://','https://x.com/'],['fb','Facebook','#1877F2','fb://','https://facebook.com/'],['sc','Snapchat','#C9A800','snapchat://','https://snapchat.com'],['tg','Telegram','#229ED9','tg://','https://telegram.org'],['rd','Reddit','#FF4500','reddit://','https://reddit.com'],['li','LinkedIn','#0A66C2','linkedin://','https://linkedin.com']];
const socUse=(id,k)=>((S.soc.use[k||today()]||{})[id])||0,socLeft=id=>Math.max(0,S.soc.apps[id].lim-socUse(id)),socList=()=>SOC.filter(a=>S.soc.apps[a[0]]);
const tile=a=>`<span class="stl" style="background:${a[2]}" aria-hidden="true">${esc(a[1][0])}</span>`,socEx=()=>EX[S.p.exam]?EX[S.p.exam].n:'your exam';
function socAdd(id,m){const k=today(),u=S.soc.use;u[k]=u[k]||{};u[k][id]=(u[k][id]||0)+m;Object.keys(u).sort().slice(0,-14).forEach(z=>delete u[z])}
function socCard(){const L=socList(),tot=sum(L,a=>socUse(a[0]));
 return`<section class="card"><h2>Social media time</h2><p class="sm mu">${L.length?'Today: '+hm(tot)+' across '+L.length+' app'+(L.length>1?'s':'')+'. Time counts from opening an app with the Rest button until you return to AceLife, or when you add it yourself.':'Choose the apps you use and how long you want to spend on each. Browsers cannot see what you do in other apps, so AceLife counts the time between opening an app from Rest and coming back.'}</p>`
 +L.map(a=>{const u=socUse(a[0]),l=S.soc.apps[a[0]].lim;return`<p class="row sp" style="margin:8px 0 2px"><span class="row" style="gap:8px">${tile(a)}${esc(a[1])}</span><span class="sm ${u>=l?'er':'mu'}">${hm(u)} of ${hm(l)}</span></p><div class="bar ${u>=l?'ov':'g'}"><i style="width:${Math.min(100,Math.round(u/l*100))}%"></i></div>`}).join('')
 +`<div class="row" style="flex-wrap:wrap;margin-top:12px"><button class="btn s" data-a="soclim">Choose apps and limits</button>${L.length?'<button class="btn o s" data-a="socadd">Add time I spent</button>':''}<button class="btn o s" data-a="socrem">Reminder: ${S.soc.rem?'on':'off'}</button></div></section>`}
A.rest=()=>{const L=socList();
 sheet(`<h2>Rest</h2>`+(L.length?`<p class="sm mu">Tap an app to open it. The time you spend there counts against today's limit when you come back.</p><div class="soc">${L.map(a=>{const l=socLeft(a[0]);return`<button class="sb" data-a="socgo" data-id="${a[0]}" aria-label="Open ${esc(a[1])}, ${l?hm(l)+' left':'no time left'}">${tile(a)}<b>${esc(a[1])}</b><span class="sm ${l?'mu':'er'}">${l?hm(l)+' left':'Limit reached'}</span></button>`}).join('')}</div>`:'<p class="mu">Choose the apps you use and set a daily limit for each.</p>')+`<div class="row" style="margin-top:12px"><button class="btn o" data-a="x">Close</button><button class="btn o" style="flex:1" data-a="soclim">Choose apps and limits</button></div>`)};
A.socgo=d=>{const a=SOC.find(z=>z[0]===d.id);if(!a||!S.soc.apps[a[0]])return;if(S.timer)A.timer();unlockAudio();
 S.soc.run={id:a[0],start:new Date().toISOString(),left:false};save();closeSheet();clearTimeout(socT);const l=socLeft(a[0]);if(l>0&&S.soc.rem)socT=setTimeout(()=>socCheck(a[0]),l*6e4+500);
 location.href=a[3];
 setTimeout(()=>{const R=S.soc.run;if(R&&!R.left&&document.visibilityState==='visible'){S.soc.run=null;clearTimeout(socT);save();
  sheet(`<h2>${esc(a[1])} did not open</h2><p class="mu">It may not be installed on this device.</p><div class="stack"><button class="btn" data-a="socweb" data-id="${a[0]}">Open in browser</button><button class="btn o" data-a="x">Close</button></div>`)}},1500)};
A.socweb=d=>{const a=SOC.find(z=>z[0]===d.id);if(!a)return;S.soc.run={id:a[0],start:new Date().toISOString(),left:false};save();closeSheet();const l=socLeft(a[0]);clearTimeout(socT);if(l>0&&S.soc.rem)socT=setTimeout(()=>socCheck(a[0]),l*6e4+500);window.open(a[4],'_blank','noopener')};
function socBack(){const R=S.soc.run;if(!R)return;S.soc.run=null;clearTimeout(socT);const a=SOC.find(z=>z[0]===R.id),m=Math.max(0,Math.min(480,Math.round((Date.now()-new Date(R.start))/6e4)));
 if(a&&S.soc.apps[R.id]){socAdd(R.id,m);save();render();if(m>0)toast('Logged '+hm(m)+' on '+a[1]);
  const z=S.soc.snz;if(S.soc.rem&&socUse(R.id)>=S.soc.apps[R.id].lim&&!(z&&z.at>Date.now()))socUp(R.id)}}
function socCheck(id){if(!S||!S.soc.rem||!S.soc.apps[id])return;const R=S.soc.run,m=R&&R.id===id?Math.round((Date.now()-new Date(R.start))/6e4):0;if(socUse(id)+m>=S.soc.apps[id].lim)socUp(id)}
function socSnz(){const z=S&&S.soc&&S.soc.snz;if(!z||Date.now()<z.at-1000)return;S.soc.snz=null;save();if(S.soc.rem&&S.soc.apps[z.id])socUp(z.id)}
function socUp(id){const a=SOC.find(z=>z[0]===id);if(!a||(V.socAt&&Date.now()-V.socAt<3e4))return;V.socAt=Date.now();V.soid=id;
 try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}beep();
 if(window.Notification&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(r=>r.showNotification("Let's Create Our Future",{body:a[1]+' time is up. Back to '+socEx()+'.',tag:'soc',renotify:true,requireInteraction:true,vibrate:[300,150,300],icon:'icon-192.png',badge:'icon-192.png'})).catch(()=>{});
 if(document.visibilityState==='visible')sheet(`<h2>Let's Create Our Future</h2><p>Your ${hm(S.soc.apps[id].lim)} on ${esc(a[1])} is used up for today.<br><span class="sm mu">Back to ${esc(socEx())}: every focused hour counts.</span></p><div class="stack"><button class="btn" data-a="x">Back to study</button><button class="btn o" data-a="socsnz">Remind me in 5 minutes</button><button class="btn o" data-a="socoff">Turn off reminders</button></div>`)}
A.socsnz=()=>{const id=V.soid;closeSheet();if(!id)return;S.soc.snz={id,at:Date.now()+3e5};save();clearTimeout(socT);socT=setTimeout(socSnz,3e5);toast('I will remind you in 5 minutes')};
A.socoff=()=>{S.soc.rem=false;S.soc.snz=null;closeSheet();save();render();toast('Reminders are off. Turn them back on in Library.')};
A.socrem=async()=>{S.soc.rem=!S.soc.rem;save();render();if(S.soc.rem&&window.Notification&&Notification.permission==='default')try{await Notification.requestPermission()}catch(e){}};
A.soclim=()=>{const y=$('#shb').scrollTop;
 sheet(`<h2>Social media limits</h2><p class="sm mu">Turn on the apps you use and set the hours you allow yourself per day.</p>`+SOC.map(a=>{const o=S.soc.apps[a[0]];return`<div class="row sp" style="margin-top:10px"><button type="button" class="chip" data-a="soct" data-id="${a[0]}" aria-pressed="${!!o}">${esc(a[1])}</button>${o?`<input type="number" inputmode="decimal" step="0.25" min="0.25" max="12" data-g="soc" data-id="${a[0]}" value="${+(o.lim/60).toFixed(2)}" aria-label="Hours per day for ${esc(a[1])}" style="width:110px">`:''}</div>`}).join('')+`<p class="sm mu" style="margin-top:10px">Hours per day, for example 0.5 or 1.5.</p><button class="btn w" style="margin-top:8px" data-a="socdone">Done</button>`);$('#shb').scrollTop=y};
A.soct=d=>{if(S.soc.apps[d.id])delete S.soc.apps[d.id];else S.soc.apps[d.id]={lim:60};save();A.soclim();render()};
A.socdone=()=>{closeSheet();save();render()};
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.g==='soc'&&S){const o=S.soc.apps[t.dataset.id],v=+t.value;if(o&&v>=.25&&v<=12){o.lim=Math.round(v*12)*5;save()}}});
A.socadd=()=>sheet(`<h2>Add time I spent</h2><label for="sa_a">App</label><select id="sa_a">${socList().map(a=>`<option value="${a[0]}">${esc(a[1])}</option>`).join('')}</select>${inp('sa_m','Minutes (5 to 480)','type="number" inputmode="numeric" min="5" max="480" step="5" value="15"')}<p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="socaddok">Add</button></div>`);
A.socaddok=()=>{const id=$('#sa_a').value,m=+$('#sa_m').value;if(!S.soc.apps[id]||!(Number.isInteger(m)&&m>=5&&m<=480)){$('#se').textContent='Enter 5 to 480 whole minutes.';return}
 socAdd(id,m);closeSheet();save();render();toast('Added '+hm(m));socCheck(id)};
document.addEventListener('visibilitychange',()=>{if(!S||!S.soc)return;const R=S.soc.run;
 if(document.visibilityState==='hidden'){if(R){R.left=true;save()}return}
 if(R&&R.left)socBack();socSnz()});
window.onCloudUser=u=>{if(!ready||(typeof AUTH!=='undefined'&&AUTH.busy))return;const id=u?u.uid:null;if(id===loadedUid)return;
 if(!id){loadedUid=null;if(unW){unW();unW=null}S=fresh();V.tab='home';render();return}
 afterAuth().then(render)};

/* ---- v9 interactivity: greeting, confetti, entrance animation, ring sweep, swipe between days ---- */
const greet=()=>{const h=new Date().getHours();return h<5?'Hi':h<12?'Good morning':h<17?'Good afternoon':h<22?'Good evening':'Good night'};
function postRender(){const a=$('#app');if(typeof fxPos==='function')fxPos();if(typeof qbPrime==='function')qbPrime();if(!V.fx)a.classList.remove('fx','swl','swr');if(V.fx){V.fx=false;a.classList.remove('fx','swl','swr');if(V.sw){a.classList.add(V.sw==='l'?'swl':'swr');V.sw=''}void a.offsetWidth;a.classList.add('fx')}
 requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.ring .v').forEach(e=>{e.style.strokeDashoffset=e.dataset.to})))}
function burst(el){if(!el||!el.animate||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,C=['#FFC94A','#5BE3B5','#93A0FF','#FF7A6B','#4CC9F0'];
 for(let i=0;i<18;i++){const e=document.createElement('i');e.className='cf';e.style.cssText='left:'+cx+'px;top:'+cy+'px;background:'+C[i%5];document.body.appendChild(e);
  const a=Math.PI*2*i/18+Math.random()*.4,d=44+Math.random()*56;
  e.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate('+(Math.cos(a)*d)+'px,'+(Math.sin(a)*d+34)+'px) rotate('+Math.round(Math.random()*540)+'deg) scale(.4)',opacity:0}],{duration:600+Math.random()*350,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>e.remove()}}
let tx=0,ty=0,t0=0,tOK=false;
document.addEventListener('touchstart',e=>{const t=e.touches[0];tx=t.clientX;ty=t.clientY;t0=Date.now();
 tOK=e.touches.length===1&&tx>24&&tx<innerWidth-24&&!(e.target.closest&&e.target.closest('input,textarea,select,.live,[data-noswipe]'))},{passive:true});
document.addEventListener('touchend',e=>{if(!tOK)return;tOK=false;if(!S||!ready||!S.p.onboarded||V.build||sheetOpen()||document.getElementById('qx')||(authOn()&&!CL().user))return;
 const t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;if(Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*.6||Date.now()-t0>800)return;
 if(V.tab==='home'&&e.target.closest&&e.target.closest('.wk')){V.day=addD(V.day,dx<0?1:-1);vib(8);render();return}   // the week strip still moves the day
 const i=TABS.indexOf(V.tab==='recover'?'roadmap':V.tab),j=i+(dx<0?1:-1);if(i<0||j<0||j>=TABS.length)return;
 V.sw=dx<0?'l':'r';A.tab({v:TABS[j]})},{passive:true});
/* the service worker is registered in pwa.js, which also handles update prompts */
