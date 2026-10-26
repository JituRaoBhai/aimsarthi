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

/* ---- exam-style test runner (v12): full screen, question on top, options below, no answers until you submit, then result and review ---- */
let qxT=0;
const qxFmt=t=>{t=Math.max(0,t);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')},qxLeft=z=>z.limit-Math.floor((Date.now()-z.t0)/1e3),L4=j=>String.fromCharCode(65+j);
const qxTopic=z=>z.key.split('|').slice(1).join('|'),qxStat=(z,i)=>z.ans[i]==null?'skip':z.ans[i]===z.qs[i].a?'ok':'no';
function qxClose(){clearInterval(qxT);const e=document.getElementById('qx');if(e)e.remove();document.body.classList.remove('qxo');V.qt=null;render()}
function qxRender(keep){const z=V.qt;if(!z)return;let e=document.getElementById('qx');if(!e){e=document.createElement('div');e.id='qx';e.setAttribute('role','dialog');e.setAttribute('aria-modal','true');document.body.appendChild(e);document.body.classList.add('qxo')}
 const y=keep?e.scrollTop:0;e.innerHTML=z.ph==='intro'?qxIntro(z):z.ph==='run'?qxRun(z):z.ph==='result'?qxRes(z):qxRev(z);e.scrollTop=y}
const qxHead=(z,t,sub,right)=>`<div class="qxh"><button type="button" class="qxb" data-a="qxend" aria-label="${z.ph==='run'?'Leave test':'Close'}">&times;</button><div style="min-width:0;flex:1"><b>${t}</b><br><span class="sm mu">${sub}</span></div>${right||''}</div>`;
function qxPal(z){return z.qs.map((_,k)=>`<button type="button" class="${k===z.i?'c ':''}${z.ans[k]!=null?'a ':z.vis[k]?'v ':''}${z.mk[k]?'m':''}" data-a="qxgo" data-v="${k}" aria-label="Question ${k+1}${z.ans[k]!=null?', answered':z.vis[k]?', not answered':', not visited'}${z.mk[k]?', marked for review':''}"${k===z.i?' aria-current="true"':''}>${k+1}</button>`).join('')}
function qxIntro(z){const n=z.qs.length;
 return qxHead(z,'Instructions',esc(qxTopic(z)))
 +`<div class="qxm"><div class="qxq" style="font-size:16px"><b>${esc(z.key.split('|')[0])}</b><br>${esc(qxTopic(z))}</div>`
 +`<div class="stats"><div><b>${n}</b><span>Questions</span></div><div><b>${qxFmt(z.limit)}</b><span>Minutes</span></div><div><b>+1 / 0</b><span>Marking</span></div></div>`
 +`<ul class="qxi"><li>Each question has one best answer. Choose A, B, C or D.</li><li>You can move between questions any time using the numbers at the top.</li><li><b>Mark for review</b> flags a question to come back to. You can clear an answer too.</li><li>Correct answers and explanations are shown only after you submit.</li><li>The test submits itself when the time ends. There is no negative marking.</li></ul>`
 +`<div class="qxk" style="margin:8px 0 16px"><i class="a"></i>Answered <i class="v"></i>Not answered <i class="m"></i>Marked <i></i>Not visited</div>`
 +`<div class="stack"><button type="button" class="btn" data-a="qxstart">Begin test</button><button type="button" class="btn o" data-a="qxend">Cancel</button></div></div>`}
function qxRun(z){z.vis[z.i]=true;const q=z.qs[z.i],n=z.qs.length,a=z.ans.filter(x=>x!=null).length,m=z.mk.filter(Boolean).length,u=z.vis.filter((v,k)=>v&&z.ans[k]==null).length;
 return`<div class="qxtop"><div class="qxh" style="border:0"><button type="button" class="qxb" data-a="qxend" aria-label="Leave test">&times;</button><div style="min-width:0;flex:1"><b>${esc(qxTopic(z))}</b><br><span class="sm mu">Question ${z.i+1} of ${n}</span></div><span class="qxt${qxLeft(z)<=60?' low':''}" id="qxt" role="timer" aria-label="Time left">${qxFmt(qxLeft(z))}</span><button type="button" class="btn s" data-a="qxsub">Submit</button></div>`
 +`<div class="qxgr" role="group" aria-label="Question numbers">${qxPal(z)}</div><div class="qxk sm"><i class="a"></i>${a} <i class="v"></i>${u} <i class="m"></i>${m} <i></i>${n-z.vis.filter(Boolean).length}</div></div>`
 +`<div class="qxm"><div class="qxq"><span class="qxn">Q${z.i+1}</span>${esc(q.q)}${z.mk[z.i]?'<span class="bd" style="margin-left:8px">Marked</span>':''}</div><div class="qxos" role="radiogroup" aria-label="Options">`
 +q.o.map((o,j)=>`<button type="button" role="radio" aria-checked="${z.ans[z.i]===j}" class="qxop${z.ans[z.i]===j?' sel':''}" data-a="qxp" data-v="${j}"><span class="ltr">${L4(j)}</span><span>${esc(o)}</span></button>`).join('')+'</div>'
 +(z.ans[z.i]!=null?'<button type="button" class="qxl" data-a="qxclr">Clear my answer</button>':'')+`</div>`
 +`<div class="qxf"><button type="button" class="btn o" data-a="qxprev"${z.i?'':' disabled'}>Previous</button><button type="button" class="btn o${z.mk[z.i]?' mk':''}" data-a="qxmk" aria-pressed="${!!z.mk[z.i]}">${z.mk[z.i]?'Marked':'Mark'}</button><button type="button" class="btn" data-a="qxnext">${z.i+1<n?'Next':'Finish'}</button></div>`}
function qxRes(z){const n=z.qs.length,c=z.c,w=z.w,sk=z.sk,pc=z.pc,f=z.fl||'all',R=2*Math.PI*44,L=z.qs.map((q,i)=>[q,i]).filter(([q,i])=>f==='all'||(f==='wrong'&&qxStat(z,i)==='no')||(f==='skip'&&qxStat(z,i)==='skip')||(f==='mark'&&z.mk[i]));
 return qxHead(z,'Test result',esc(qxTopic(z)))
 +`<div class="qxm"><div class="qxs"><svg viewBox="0 0 100 100" class="qxrg" role="img" aria-label="${pc} percent"><circle cx="50" cy="50" r="44" class="t"/><circle cx="50" cy="50" r="44" class="v ${pc>=80?'ok':pc>=60?'wn':'no'}" stroke-dasharray="${R.toFixed(1)}" stroke-dashoffset="${(R*(1-pc/100)).toFixed(1)}" transform="rotate(-90 50 50)"/><text x="50" y="56">${pc}%</text></svg>`
 +`<div><h2 style="margin:0">${c} of ${n} correct</h2><p class="sm mu" style="margin:4px 0 0">${pc>=80?'Strong. Keep this topic on your revision rhythm.':pc>=60?'Fair. Review the questions you missed.':'This topic needs more work. Revise it and try again.'}</p></div></div>`
 +`<div class="stats"><div><b class="g">${c}</b><span>Correct</span></div><div><b class="r">${w}</b><span>Wrong</span></div><div><b>${sk}</b><span>Skipped</span></div></div>`
 +`<p class="sm mu">Time taken ${qxFmt(z.tt)} of ${qxFmt(z.limit)}. Each question is 1 mark; wrong and skipped answers score 0.</p>`
 +`<div class="stack"><button type="button" class="btn" data-a="qxrv" data-v="0">Review all answers</button>${z.tid&&byId(z.tid)&&!z.logged?'<button type="button" class="btn o" data-a="qtlog">Save score to my study log</button>':''}${w+sk?'<button type="button" class="btn o" data-a="qtw" data-key="'+esc(z.key)+'">Practise my '+(w+sk)+' missed</button>':''}<button type="button" class="btn o" data-a="qtagain">${z.mode==='wrong'?'Practise missed again':'Try a new set'}</button><button type="button" class="btn o" data-a="qxend">Close</button></div>`
 +`<h3 style="margin:18px 0 8px">Your answers</h3><div class="chips" role="group" aria-label="Filter answers">${[['all','All'],['wrong','Wrong'],['skip','Skipped'],['mark','Marked']].map(([v,l])=>`<button type="button" class="chip" data-a="qxf" data-v="${v}" aria-pressed="${f===v}">${l}</button>`).join('')}</div>`
 +(L.length?L.map(([q,i])=>{const s=qxStat(z,i);return`<button type="button" class="qxr ${s}" data-a="qxrv" data-v="${i}"><span class="qi">${i+1}</span><span class="qt">${esc(q.q)}</span><span class="bd ${s==='ok'?'ok':s==='no'?'no':'nt'}">${s==='ok'?'Correct':s==='no'?'Wrong':'Skipped'}</span></button>`}).join(''):'<p class="mu sm">Nothing here.</p>')+`</div>`}
function qxRev(z){const q=z.qs[z.ri],n=z.qs.length,s=qxStat(z,z.ri),a=z.ans[z.ri];
 return qxHead(z,'Review',esc(qxTopic(z))+' · Question '+(z.ri+1)+' of '+n)
 +`<div class="qxm"><div class="qxq"><span class="qxn">Q${z.ri+1}</span>${esc(q.q)}</div><p class="sm" style="margin:0 0 8px"><span class="bd ${s==='ok'?'ok':s==='no'?'no':'nt'}">${s==='ok'?'You got it right':s==='no'?'Your answer was wrong':'You skipped this'}</span>${z.mk[z.ri]?' <span class="bd">Marked</span>':''}</p><div class="qxos">`
 +q.o.map((o,j)=>`<div class="qxop rv${j===q.a?' ok':j===a?' no':''}"><span class="ltr">${L4(j)}</span><span>${esc(o)}${j===q.a?'<br><span class="sm"><b>Correct answer</b></span>':j===a?'<br><span class="sm"><b>Your answer</b></span>':''}</span></div>`).join('')+'</div>'
 +`<div class="qxe"><b>Explanation</b><p style="margin:6px 0 0">${q.e?esc(q.e):'No explanation was added for this question.'}</p>${q.y?`<p class="sm mu" style="margin:6px 0 0">${esc(q.y)}</p>`:''}</div></div>`
 +`<div class="qxf"><button type="button" class="btn o" data-a="qxrp"${z.ri?'':' disabled'}>Previous</button><button type="button" class="btn o" data-a="qxrb">Results</button><button type="button" class="btn" data-a="qxrn"${z.ri+1<n?'':' disabled'}>Next</button></div>`}
function qxSubmit(){const z=V.qt;if(!z||z.ph!=='run')return;clearInterval(qxT);const n=z.qs.length;
 z.tt=Math.min(z.limit,Math.floor((Date.now()-z.t0)/1e3));z.c=z.qs.filter((q,i)=>z.ans[i]===q.a).length;z.sk=z.ans.filter(a=>a==null).length;z.w=n-z.c-z.sk;z.pc=Math.round(z.c/n*100);z.ph='result';z.fl='all';
 S.tests=(S.tests||[]).concat({id:uid(),exam:S.p.exam,key:z.key,n,c:z.c,at:new Date().toISOString(),m:z.mode==='wrong'?1:0}).slice(-300);
 S.qp=S.qp||{};const qm=S.qp[z.key]=S.qp[z.key]||{};z.qs.forEach((q,i)=>{if(q.id)qm[q.id]=z.ans[i]===q.a?1:0});   // remembers, per question, whether your latest answer was right
 save();render();qxRender();vib([20,40,20])}
function qxTick(){const z=V.qt;if(!z||z.ph!=='run'){clearInterval(qxT);return}const l=qxLeft(z),e=document.getElementById('qxt');if(e){e.textContent=qxFmt(l);e.classList.toggle('low',l<=60)}if(l<=0){toast('Time is up. Your test was submitted.');closeSheet();qxSubmit()}}
const qxCounts=z=>({a:z.ans.filter(x=>x!=null).length,m:z.mk.filter(Boolean).length});
Object.assign(A,{
 qts:d=>{const k=d.key,qp=(S.qp||{})[k]||{},Q=d.mode==='wrong'?qbQs(k).filter(q=>qp[qid(q.q)]!==1&&(qp[qid(q.q)]===0)):qbQs(k);if(!Q.length){toast(d.mode==='wrong'?'No missed questions to practise.':'No questions have been added for this topic yet.');return}
  const qs=shuf(Q).slice(0,QN).map(q=>{const ix=shuf([0,1,2,3]);return{id:qid(q.q),q:q.q,o:ix.map(i=>q.o[i]),a:ix.indexOf(q.a),e:q.e||'',y:q.y||''}});
  closeSheet();clearInterval(qxT);V.qt={key:k,tid:d.id||'',qs,i:0,ans:qs.map(()=>null),mk:qs.map(()=>false),vis:qs.map(()=>false),ph:'intro',t0:0,limit:qs.length*60,mode:d.mode||'',fl:'all'};
  qxRender()},
 qxstart:()=>{const z=V.qt;if(!z||z.ph!=='intro')return;z.ph='run';z.t0=Date.now();clearInterval(qxT);qxT=setInterval(qxTick,1000);qxRender()},
 qxp:d=>{const z=V.qt;if(!z||z.ph!=='run')return;z.ans[z.i]=+d.v;vib(8);qxRender(1)},
 qxclr:()=>{const z=V.qt;if(!z||z.ph!=='run')return;z.ans[z.i]=null;qxRender(1)},
 qxmk:()=>{const z=V.qt;if(!z||z.ph!=='run')return;z.mk[z.i]=!z.mk[z.i];qxRender(1)},
 qxprev:()=>{const z=V.qt;if(z&&z.ph==='run'&&z.i>0){z.i--;qxRender()}},
 qxnext:()=>{const z=V.qt;if(!z||z.ph!=='run')return;if(z.i+1<z.qs.length){z.i++;qxRender()}else A.qxsub()},
 qxgo:d=>{const z=V.qt;if(z&&z.ph==='run'){z.i=+d.v;qxRender()}},
 qxsub:()=>{const z=V.qt;if(!z||z.ph!=='run')return;const c=qxCounts(z),n=z.qs.length;sheet(`<h2>Submit the test?</h2><p>${c.a} of ${n} answered${n-c.a?', <b>'+(n-c.a)+' not answered</b>':''}${c.m?', '+c.m+' marked for review':''}.</p><p class="sm mu">You cannot change answers after submitting. You can review every question with explanations afterwards.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Keep working</button><button class="btn" style="flex:1" data-a="qxsubok">Submit</button></div>`)},
 qxsubok:()=>{closeSheet();qxSubmit()},
 qxend:()=>{const z=V.qt;if(!z)return;if(z.ph==='run')sheet(`<h2>Leave this test?</h2><p>Your answers so far will not be saved.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Keep working</button><button class="btn" style="flex:1" data-a="qxquit">Leave</button></div>`);else qxClose()},
 qxquit:()=>{closeSheet();qxClose()},
 qxf:d=>{const z=V.qt;if(z){z.fl=d.v;qxRender(1)}},
 qxrv:d=>{const z=V.qt;if(z){z.ph='review';z.ri=+d.v;qxRender()}},
 qxrb:()=>{const z=V.qt;if(z){z.ph='result';qxRender()}},
 qxrp:()=>{const z=V.qt;if(z&&z.ri>0){z.ri--;qxRender()}},
 qxrn:()=>{const z=V.qt;if(z&&z.ri+1<z.qs.length){z.ri++;qxRender()}},
 qtagain:()=>{const z=V.qt;if(z)A.qts({key:z.key,id:z.tid,mode:z.mode})},
 qtw:d=>A.qts({key:d.key,mode:'wrong'}),
 pt:d=>{V.pt=d.v;if(V.tab!=='progress'){V.nav.push(V.tab);V.tab='progress'}V.fx=true;scrollTo(0,0);render()},
 tfl:d=>{V.tfl=d.v;render()},
 qtlog:()=>{const z=V.qt,t=z&&byId(z.tid);if(!t)return;t.log={k:['mcq','test'],n:z.qs.length,s:z.pc,at:new Date().toISOString()};z.logged=true;save();render();qxRender(1);toast('Score saved to your study log')}});

/* ---- PYQ test suggestion: only when a whole topic is finished, once per topic ---- */
function topicDone(t){if(t.type!=='study')return null;const k=qkey(t),L=S.tasks.filter(x=>x.type==='study'&&qkey(x)===k);return L.length&&L.every(x=>x.status==='done')?k:null}
function qsugShow(){const k=V.sug;V.sug=null;if(!k||sheetOpen()||V.qt)return;const n=Math.min(QN,qbN(k)),nm=k.split('|').slice(1).join('|'),sb=k.split('|')[0];
 sheet(`<h2>Topic complete: time to test it</h2><p><b>${esc(sb)}</b>: ${esc(nm)}</p><p class="sm mu">You finished every session of this topic. A ${n}-question test from previous-year-style questions now will show what stuck and what to revise.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Later</button><button class="btn" style="flex:1" data-a="qts" data-key="${esc(k)}">Start the test</button></div>`);vib([30,40,30])}
['st','lgok','x','lgx'].forEach(n=>{const f=A[n];if(typeof f!=='function')return;A[n]=function(d){const r=f.apply(this,arguments);
 if(n==='st'){const t=d&&byId(d.id);if(t&&t.status==='done'&&qbOn()){const k=topicDone(t);S.sug=S.sug||{};if(k&&qbN(k)>0&&!S.sug[k]&&!(S.tests||[]).some(h=>h.key===k)){S.sug[k]=today();save();V.sug=k}}}
 if(V.sug&&n==='st')setTimeout(qsugShow,1100);   // shown under the study-log boxes, no pop-up to wait for
 if(V.sug&&(n==='lgok'||n==='x'||n==='lgx'))setTimeout(qsugShow,350);
 return r}});

/* ---- Progress > Tests (v12) ---- */
const pcOf=h=>Math.round(h.c/h.n*100);
const tState=i=>!i.att?(i.sug?['Suggested','ok']:['Not taken','nt']):i.lp>=80?['Strong','ok']:i.lp>=60?['Fair','wn']:['Needs work','no'];
function tInfo(x){const B=qbAll(),H=(S.tests||[]).filter(h=>h&&h.exam===x&&!h.m),HA=(S.tests||[]).filter(h=>h&&h.exam===x);
 return Object.keys(B).filter(k=>qbN(k)>0).map(k=>{const h=H.filter(a=>a.key===k),qp=(S.qp||{})[k]||{},ids=qbQs(k).map(q=>qid(q.q)),last=h[h.length-1];
  return{k,sug:!!(S.sug||{})[k],n:ids.length,att:h.length,ok:ids.filter(i=>qp[i]===1).length,bad:ids.filter(i=>qp[i]===0).length,best:h.length?Math.max(...h.map(pcOf)):0,lp:last?pcOf(last):0,at:last?last.at:''}})}
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
