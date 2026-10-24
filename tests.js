/* TOPIC TESTS (v11): a short test of up to 20 questions for one topic, taken from a question bank in qbank/<exam>.js.
   Loaded after app.js (uses sheet, closeSheet, toast, esc, byId, save, render, hm, V, S, A, EX).
   Bank file format (one file per exam key listed in TEST_EXAMS, see exams2.js):
     (window.QB=window.QB||{}).neetpg={ 'Subject|Topic name exactly as in exams.js':[ {q:'Question?', o:['A','B','C','D'], a:2, e:'Why C is right', y:'NEET PG 2023'}, ... ] };
   a = index (0 to 3) of the correct option. e (explanation) and y (source/year) are optional. Build the files from a spreadsheet with tools/qbank-build.js. */
window.QB=window.QB||{};
const QN=20,qbOn=()=>!!(S&&S.p&&(window.TEST_EXAMS||[]).includes(S.p.exam));
const qkey=t=>t.tk||(t.subject+'|'+String(t.topic).replace(/^(Revise: |Practice questions: )/,'').replace(/ \(part \d+\)$/,''));
const goodQ=q=>q&&typeof q.q==='string'&&q.q&&Array.isArray(q.o)&&q.o.length===4&&q.o.every(o=>typeof o==='string'&&o)&&Number.isInteger(q.a)&&q.a>=0&&q.a<4;
const qbAll=()=>QB[S.p.exam]||{},qbQs=k=>(qbAll()[k]||[]).filter(goodQ),qbN=k=>qbQs(k).length;
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const qid=t=>{let h=5381;t=String(t);for(let i=0;i<t.length;i++)h=(h*33^t.charCodeAt(i))>>>0;return h.toString(36)};   // short id of a question, used to remember which ones you got right
const qbLoaded={};
function qbLoad(x){return qbLoaded[x]||(qbLoaded[x]=new Promise(r=>{if(QB[x]){r();return}const e=document.createElement('script');e.src='qbank/'+x+'.js';e.onload=()=>r();e.onerror=()=>{QB[x]=QB[x]||{};r()};document.head.appendChild(e)}))}
function qbPrime(){if(!qbOn()||!S.p.onboarded||qbLoaded[S.p.exam])return;qbLoad(S.p.exam).then(()=>{if(S&&S.p.onboarded&&!sheetOpen())render()})}   // loads the bank once, then redraws so the buttons appear
const testBtn=t=>{if(!qbOn())return'';const k=qkey(t),n=qbN(k);return n?`<button class="btn o" data-a="qts" data-key="${esc(k)}" data-id="${t.id}">Topic test (${Math.min(QN,n)} questions)</button>`:''};

function testCard(){if(!qbOn())return'';const x=S.p.exam,B=qbAll(),ks=Object.keys(B).filter(k=>qbN(k)>0),tot=sum(ks,k=>qbN(k)),H=(S.tests||[]).filter(h=>h&&h.exam===x);
 const body=ks.length?EX[x].sub.map(s=>{const L=ks.filter(k=>k.split('|')[0]===s);if(!L.length)return'';
   return`<h3 style="margin:12px 0 4px">${esc(s)}</h3>`+L.map(k=>{const last=H.filter(h=>h.key===k).pop(),n=qbN(k);
    return`<div class="row sp" style="margin:0 0 6px"><span class="sm">${esc(k.split('|').slice(1).join('|'))}<br><span class="mu">${n} question${n>1?'s':''}${last?' &middot; last score '+Math.round(last.c/last.n*100)+'%':''}</span></span><button type="button" class="btn o s" data-a="qts" data-key="${esc(k)}">Start</button></div>`}).join('')}).join('')
  :`<p class="sm mu">No questions have been added for ${esc(EX[x].n)} yet. Build <b>qbank/${x}.js</b> with tools/qbank-build.js (steps are in qbank/README-QBANK.txt) and redeploy.</p>`;
 return`<details class="card tops" data-k="tests"${V.lo.tests?' open':''}><summary><b>Topic tests</b><br><span class="sm mu">${!qbLoaded[x]||!QB[x]?'Loading...':ks.length?ks.length+' topics, '+tot+' questions. Tap to choose a topic.':'Not set up yet for '+esc(EX[x].n)}</span></summary>${body}</details>`}

function qtSheet(){const z=V.qt,q=z.qs[z.i],done=z.pick!==null,n=z.qs.length;
 const subj=z.key.split('|')[0],top=z.key.split('|').slice(1).join('|');
 sheet(`<h2>Topic test</h2><p class="sm mu">${esc(subj)}: ${esc(top)}</p><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${z.i+1}" style="margin:8px 0"><i style="width:${(z.i+(done?1:0))/n*100}%"></i></div>`
  +`<p class="sm mu" style="margin:0">Question ${z.i+1} of ${n}</p><h3 style="margin-top:6px">${esc(q.q)}</h3><div class="opts" role="group" aria-label="Options">`
  +q.o.map((o,j)=>`<button type="button" class="chip qo${done?(j===q.a?' ok':j===z.pick?' no':''):''}" data-a="qtp" data-v="${j}"${done?' disabled':''}>${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join('')+'</div>'
  +(done?`<p class="sm"><b>${z.pick===q.a?'Correct.':'Not quite. Answer: '+String.fromCharCode(65+q.a)+'.'}</b> ${esc(q.e)}${q.y?`<br><span class="mu">${esc(q.y)}</span>`:''}</p>`:'')
  +`<div class="row"><button class="btn o" data-a="x">End test</button><button class="btn" style="flex:1" data-a="qtn"${done?'':' disabled'}>${z.i+1<n?'Next question':'See result'}</button></div>`)}
function qtResult(){const z=V.qt,n=z.qs.length,c=z.ans.filter((a,i)=>a===z.qs[i].a).length,pc=Math.round(c/n*100),bad=z.qs.map((q,i)=>[q,i]).filter(([q,i])=>z.ans[i]!==q.a);
 S.tests=(S.tests||[]).concat({id:uid(),exam:S.p.exam,key:z.key,n,c,at:new Date().toISOString(),m:z.mode==='wrong'?1:0}).slice(-300);
 S.qp=S.qp||{};const qm=S.qp[z.key]=S.qp[z.key]||{};z.qs.forEach((q,i)=>{if(q.id)qm[q.id]=z.ans[i]===q.a?1:0});save();render();   // remembers, per question, whether your latest answer was right; the Tests list behind the sheet updates
z.c=c;z.pc=pc;
 sheet(`<h2>${c} of ${n} correct</h2><p class="sm mu">Score ${pc}%.${pc>=80?' Strong. Keep this topic on your revision rhythm.':pc>=60?' Fair. Review the questions you missed.':' This topic needs more work. Revise it and try again.'}</p>`
  +(bad.length?`<details><summary class="sm"><b>${bad.length} to review</b></summary>${bad.map(([q,i])=>`<div class="qres no"><b>${esc(q.q)}</b><br><span class="sm">Your answer: ${esc(q.o[z.ans[i]])}. Answer: <b>${esc(q.o[q.a])}</b></span>${q.e?`<br><span class="sm mu">${esc(q.e)}</span>`:''}</div>`).join('')}</details>`:'<p class="sm">No mistakes. Well done.</p>')
  +`<div class="stack">${z.tid&&byId(z.tid)?'<button class="btn" data-a="qtlog">Save score to my study log</button>':''}<button class="btn o" data-a="qtagain">${z.mode==='wrong'?'Practise missed again':'Try a new set'}</button><button class="btn o" data-a="x">Close</button></div>`)}
Object.assign(A,{
 qts:d=>{const k=d.key,qp=(S.qp||{})[k]||{},Q=d.mode==='wrong'?qbQs(k).filter(q=>qp[qid(q.q)]===0):qbQs(k);if(!Q.length){toast(d.mode==='wrong'?'No missed questions to practise.':'No questions have been added for this topic yet.');return}
  const qs=shuf(Q).slice(0,QN).map(q=>{const ix=shuf([0,1,2,3]);return{id:qid(q.q),q:q.q,o:ix.map(i=>q.o[i]),a:ix.indexOf(q.a),e:q.e||'',y:q.y||''}});
  V.qt={key:k,tid:d.id||'',qs,i:0,ans:[],pick:null,mode:d.mode||''};qtSheet()},
 qtp:d=>{const z=V.qt;if(!z||z.pick!==null)return;z.pick=+d.v;z.ans[z.i]=z.pick;vib(10);qtSheet()},
 qtn:()=>{const z=V.qt;if(!z||z.pick===null)return;if(z.i+1<z.qs.length){z.i++;z.pick=null;qtSheet()}else qtResult()},
 qtagain:()=>{const z=V.qt;if(z)A.qts({key:z.key,id:z.tid,mode:z.mode})},
 qtw:d=>A.qts({key:d.key,mode:'wrong'}),
 pt:d=>{V.pt=d.v;if(V.tab!=='progress'){V.nav.push(V.tab);V.tab='progress'}V.fx=true;scrollTo(0,0);render()},
 tfl:d=>{V.tfl=d.v;render()},
 qtlog:()=>{const z=V.qt,t=z&&byId(z.tid);if(!t)return;t.log={k:['mcq','test'],n:z.qs.length,s:z.pc,at:new Date().toISOString()};save();closeSheet();render();toast('Score saved to your study log')}});

/* ---- Progress > Tests (v12) ---- */
const pcOf=h=>Math.round(h.c/h.n*100);
const tState=i=>!i.att?['Not taken','nt']:i.lp>=80?['Strong','ok']:i.lp>=60?['Fair','wn']:['Needs work','no'];
function tInfo(x){const B=qbAll(),H=(S.tests||[]).filter(h=>h&&h.exam===x&&!h.m),HA=(S.tests||[]).filter(h=>h&&h.exam===x);
 return Object.keys(B).filter(k=>qbN(k)>0).map(k=>{const h=H.filter(a=>a.key===k),qp=(S.qp||{})[k]||{},ids=qbQs(k).map(q=>qid(q.q)),last=h[h.length-1];
  return{k,n:ids.length,att:h.length,ok:ids.filter(i=>qp[i]===1).length,bad:ids.filter(i=>qp[i]===0).length,best:h.length?Math.max(...h.map(pcOf)):0,lp:last?pcOf(last):0,at:last?last.at:''}})}
function testsView(){const x=S.p.exam,E=EX[x];
 if(!qbOn())return`<section class="card"><h2>Topic tests</h2><p class="sm mu">Topic tests are available for ${(window.TEST_EXAMS||[]).map(k=>esc(EX[k]?EX[k].n:k)).join(', ')}. Your exam, ${esc(E.n)}, does not have them yet.</p></section>`;
 if(!qbLoaded[x]||!QB[x])return`<section class="card"><p class="mu">Loading questions...</p></section>`;
 const I=tInfo(x),T=I.filter(i=>i.att),HA=(S.tests||[]).filter(h=>h&&h.exam===x);
 if(!I.length)return`<section class="card"><h2>No questions yet</h2><p class="sm mu">No questions have been added for ${esc(E.n)}. Build <b>qbank/${x}.js</b> with tools/qbank-build.js (steps in qbank/README-QBANK.txt) and redeploy.</p></section>`;
 const f=V.tfl||'all',avg=T.length?Math.round(sum(T,i=>i.lp)/T.length):0,okQ=sum(I,i=>i.ok),totQ=sum(I,i=>i.n),badQ=sum(I,i=>i.bad);
 const keep=i=>f==='all'||(f==='new'&&!i.att)||(f==='weak'&&i.att&&i.lp<60)||(f==='strong'&&i.att&&i.lp>=80)||(f==='miss'&&i.bad>0);
 const chips=[['all','All'],['new','Not taken'],['weak','Needs work'],['strong','Strong'],['miss','Missed questions']].map(([v,l])=>`<button type="button" class="chip" data-a="tfl" data-v="${v}" aria-pressed="${f===v}">${l}</button>`).join('');
 const subs=E.sub.map(s=>{const L=I.filter(i=>i.k.split('|')[0]===s);if(!L.length)return'';const sh=L.filter(keep);if(!sh.length)return'';const dn=L.filter(i=>i.att).length,k='ts_'+s;
  return`<details class="card tops ts" data-k="${esc(k)}"${V.lo[k]||f!=='all'?' open':''}><summary><b>${esc(s)}</b><span class="sm mu"> ${dn} of ${L.length} topics tested</span><div class="bar g" style="margin-top:6px"><i style="width:${Math.round(dn/L.length*100)}%"></i></div></summary>`
  +sh.map(i=>{const st=tState(i),nm=i.k.split('|').slice(1).join('|');
   return`<div class="tpc"><div class="tph"><b>${esc(nm)}</b><span class="bd ${st[1]}">${st[0]}${i.att?' '+i.lp+'%':''}</span></div>`
   +`<p class="sm mu" style="margin:2px 0 6px">${i.n} questions${i.att?' · '+i.att+' attempt'+(i.att>1?'s':'')+' · best '+i.best+'% · last '+fD(i.at.slice(0,10)):' · you have not taken this test yet'}</p>`
   +(i.att||i.bad?`<div class="bar" style="height:7px" title="Questions answered correctly"><i style="width:${Math.round(i.ok/i.n*100)}%"></i></div><p class="sm mu" style="margin:4px 0 6px">${i.ok} of ${i.n} questions got right${i.bad?' · '+i.bad+' to revisit':''}</p>`:'')
   +`<div class="row"><button type="button" class="btn s" style="flex:1" data-a="qts" data-key="${esc(i.k)}">${i.att?'Retake test':'Start test'}</button>${i.bad?`<button type="button" class="btn o s" style="flex:1" data-a="qtw" data-key="${esc(i.k)}">Practise ${i.bad} missed</button>`:''}</div></div>`}).join('')+'</details>'}).join('');
 const rec=HA.slice(-5).reverse().map(h=>`<p class="row sp" style="margin:0 0 6px"><span class="sm">${esc(h.key.split('|').slice(1).join('|'))}${h.m?' <span class="mu">(missed set)</span>':''}<br><span class="mu">${fD(h.at.slice(0,10))}</span></span><span class="bd ${pcOf(h)>=80?'ok':pcOf(h)>=60?'wn':'no'}">${h.c}/${h.n}</span></p>`).join('');
 return`<section class="card"><div class="stats"><div><b>${T.length}/${I.length}</b><span>Topics tested</span></div><div><b>${T.length?avg+'%':'-'}</b><span>Average score</span></div><div><b>${okQ}</b><span>Questions right</span></div></div><div class="bar g"><i style="width:${totQ?Math.round(okQ/totQ*100):0}%"></i></div><p class="sm mu" style="margin:6px 0 0">${okQ} of ${totQ} questions answered correctly in your latest attempts${badQ?'. '+badQ+' to revisit':''}.</p></section>`
  +`<div class="chips" role="group" aria-label="Filter topics" style="margin:0 0 12px">${chips}</div>`
  +(subs||`<section class="card"><p class="mu">No topics match this filter.</p></section>`)
  +(rec?`<section class="card"><h2>Recent tests</h2>${rec}</section>`:'')}
