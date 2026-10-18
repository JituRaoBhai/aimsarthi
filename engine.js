/* ROADMAP ENGINE
   Part 1, learn(): turns MANY verified strategy entries into plan settings (medians, outliers trimmed, duplicates ignored).
            Nothing is learned until MIN_N verified entries exist for the exam, and one entry can never steer the plan.
   Part 2, plan(): builds a plan in which no day is ever over the learner's hours (15% is kept as buffer),
            new topics are spread by subject weight (weak subjects more often), revisions are spaced (+2, +7, +21 days),
            and mock tests shrink to sectional tests when a day is too short for a full paper.
   Uses these helpers from app.js at call time: today, addD, diff, pd, uid, P.
   To teach the engine something new: add a field to FIELDS (accepted range) and read it in plan(). */
const Engine=(()=>{
 const MIN_N=20;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),srt=a=>a.slice().sort((x,y)=>x-y);
 const median=a=>{const s=srt(a),n=s.length;return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):0};
 const trim=a=>{const s=srt(a),k=Math.floor(s.length*.1);return s.slice(k,s.length-k)};
 const inR=(v,r)=>typeof v==='number'&&isFinite(v)&&v>=r[0]&&v<=r[1];
 const FIELDS={hr:[1,16],mockWk:[0,3],revCycles:[0,6],practice:[0,80]};   // hours/day, mocks/week, revision cycles, % time on question practice
 function learn(exam,entries){
  const seen=new Set(),V=entries.filter(e=>{if(e.exam!==exam||!(e.verified||e.checked))return false;const k=(e.src||'').trim().toLowerCase()+'|'+(e.name||'').trim().toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
  const out={n:V.length,need:MIN_N,enough:V.length>=MIN_N,params:{},weights:{},note:''};
  if(!out.enough){out.note='Roadmap uses general study principles. '+V.length+' of '+MIN_N+' verified strategy entries collected for this exam, so nothing is learned from toppers yet.';return out}
  for(const f in FIELDS){const v=V.map(e=>e[f]).filter(x=>inR(x,FIELDS[f]));if(v.length>=MIN_N)out.params[f]=median(trim(v))}
  const W={};V.forEach(e=>{for(const s in e.weights||{})if(inR(e.weights[s],[.25,4]))(W[s]=W[s]||[]).push(e.weights[s])});
  for(const s in W)if(W[s].length>=MIN_N)out.weights[s]=median(trim(W[s]));
  out.note='Calibrated from '+V.length+' verified entries (medians, outliers trimmed). Your own hours and answers still decide what fits each day.';
  return out}
 const LV={Beginner:'b',Intermediate:'i',Advanced:'a'};
 const DEF={t:{b:240,i:180,a:120},m1:75,m2:120};                       // PLACEHOLDER minutes per topic, used when plandata.js has no value
 const cfg=()=>Object.assign({m1Days:30,m2Days:60,emit:120},window.PLAN_CONFIG||{});
 const modeFor=H=>{const c=cfg();return H<=c.m1Days?'m1':H<=c.m2Days?'m2':'std'};
 const modeName=(m,lv)=>m==='m1'?'1-month plan (same for every level)':m==='m2'?'2-month plan':'Standard plan for '+String(lv||'your level').toLowerCase();
 const pct=(v,d)=>typeof v==='number'&&isFinite(v)?clamp(v,0,100):d;
 function meta(exam,ex,s){   // merges exams.js topics with plandata.js order, priority and times
  const X=(window.PLAN&&window.PLAN[exam])||{},d=Object.assign({},DEF,X.def||{}),tp=(X.topics||{})[s]||{};
  const names=((ex.t||{})[s]||[]).length?ex.t[s]:['Core concepts and MCQs'];
  return{s,p:pct((X.pri||{})[s],50),order:(X.order||{})[s]||1,topics:names.map((n,i)=>{const o=tp[n]||{};
   return{n,i,p:pct(o.p,50),t:Object.assign({},d.t,o.t),m1:o.m1!=null?o.m1:d.m1,m2:o.m2!=null?o.m2:d.m2,own:{std:!!o.t,m1:o.m1!=null,m2:o.m2!=null}}})}}
 const mins=(t,mode,lv)=>{const v=mode==='m1'?t.m1:mode==='m2'?(t.m2&&typeof t.m2==='object'?t.m2[lv]:t.m2):t.t[lv];return Math.max(30,Math.round((+v||DEF.m1)/15)*15)};
 /* plan(): 1) pick the mode from days left: 1-month and 2-month plans use fixed times (1-month ignores level); otherwise times follow the level.
            2) count the study minutes the calendar offers and the minutes the topics need, minus what is already done (existing tasks).
            3) if the topics need more than the calendar offers, keep topics in priority order (subject % x topic % x weak boost x learned weight) and skip the rest.
            4) schedule by foundation phase, mixing subjects in the phase by priority; revise at +2, +7, +21 days; mocks; revision-only last 2 days. */
 function plan(p,ex,entries,existing){
  const L=learn(p.exam,entries),prm=Object.assign({mockWk:1,revCycles:2,practice:25},L.params),c=cfg();
  const t0=today(),end=addD(p.examDate,-1),H=Math.max(1,diff(t0,end)+1),E=Math.min(H,c.emit),mode=modeFor(H),lv=LV[p.level]||'i';
  const cap=Math.round(+p.hours*60),pl=Math.min(cap,Math.max(30,Math.floor(cap*.85/15)*15)),nb=Math.max(1,Math.round(pl/75)),bl=clamp(Math.round(pl/nb/15)*15,30,90);   // every block is 30 minutes or more, in steps of 15
  const weak=p.weak||[],done=p.done||[],steps=[2,7,21].slice(0,clamp(Math.round(prm.revCycles)+1,1,3));
  const revB=Math.round(pl*clamp(.1+.05*prm.revCycles,.15,.4)/15)*15,rb=clamp(Math.round(bl*.5/15)*15,30,45);
  const mockDays=[[],[6],[3,6],[1,3,5]][clamp(Math.round(prm.mockWk),0,3)],mlen=Math.floor(pl*.7/15)*15,fm=Math.ceil(ex.mock/15)*15;
  const cal=[];let supply=0;                                            // 1. which days can take new topics
  for(let i=0;i<H;i++){const d=addD(t0,i);let k='study';
   if(p.off!==''&&String(pd(d).getDay())===p.off)k='off';else if(mockDays.includes(i%7)&&mlen>=30&&H-i>1)k='mock';else if(H>=14&&i>=H-2)k='final';
   cal.push({i,d,k});if(k==='study')supply+=Math.max(0,pl-revB)}
  const done0={};(existing||[]).forEach(t=>{if(t.tk&&(t.status==='done'||t.status==='partial'))done0[t.tk]=(done0[t.tk]||0)+doneMin(t)});
  const M={};ex.sub.forEach(s=>M[s]=meta(p.exam,ex,s));
  const w=s=>Math.max(.1,M[s].p/100)*(weak.includes(s)?1.5:1)*(L.weights[s]||1);
  const subs=ex.sub.filter(s=>!done.includes(s)),items=[];let demand=0;   // 2. demand
  subs.forEach(s=>M[s].topics.forEach(t=>{const tk=s+'|'+t.n,tot=mins(t,mode,lv),rem=Math.max(0,Math.round((tot-(done0[tk]||0))/15)*15);if(rem<30)return;
   items.push({s,t,tk,tot,rem,sc:(M[s].p/100)*(t.p/100)*(weak.includes(s)?1.5:1)*(L.weights[s]||1),o:M[s].order,own:mode==='std'?t.own.std:t.own[mode]});demand+=rem}));
  const kept=new Set(),skipped=[];let left=supply;                       // 3. keep by priority
  items.slice().sort((a,b)=>b.sc-a.sc||a.o-b.o||a.t.i-b.t.i).forEach(it=>{if(it.rem<=left){left-=it.rem;kept.add(it)}else skipped.push({s:it.s,n:it.t.n,min:it.rem})});
  const bySub={};items.filter(it=>kept.has(it)).sort((a,b)=>a.t.i-b.t.i).forEach(it=>(bySub[it.s]=bySub[it.s]||[]).push(it));
  const cr={},live=()=>Object.keys(bySub).filter(s=>bySub[s].length);
  const pick=()=>{const lv2=live();if(!lv2.length)return null;const ph=Math.min(...lv2.map(s=>M[s].order)),el=lv2.filter(s=>M[s].order===ph),tw=el.reduce((a,s)=>a+w(s),0);   // foundation phase gate + weighted round-robin
   let b=el[0];el.forEach(s=>cr[s]=(cr[s]||0)+w(s));el.forEach(s=>{if(cr[s]>cr[b])b=s});cr[b]-=tw;return b};
  const prac=subs.length?subs:ex.sub,pcr={},ptw=prac.reduce((a,s)=>a+w(s),0),ppick=()=>{let b=prac[0];prac.forEach(s=>pcr[s]=(pcr[s]||0)+w(s));prac.forEach(s=>{if(pcr[s]>pcr[b])b=s});pcr[b]-=ptw;return b};
  const maint=[];done.forEach(s=>M[s]&&M[s].topics.forEach(t=>maint.push({s,tp:t.n})));let mi=0;
  const lab=(s,t)=>weak.includes(s)||M[s].p>=70||t.p>=70?'High':Math.max(M[s].p,t.p)<30?'Low':'Medium';
  const rv=[],out=[],mk=(date,subject,topic,mins,pri,type,why,tk)=>{const t={id:uid(),subject,topic,mins,pri,date,type,why,status:'todo',gen:true};if(tk)t.tk=tk;out.push(t);return t};
  for(const D of cal){if(D.i>=E)break;if(D.k==='off')continue;const d=D.d;let free=pl;   // 4. schedule
   if(D.k==='mock'){const m=Math.min(fm,mlen),an=Math.floor(Math.min(60,pl-m)/15)*15,sec=m<fm;
    mk(d,'Mock test',sec?'Sectional test, about '+Math.round(m/fm*100)+'% of a full '+ex.n+' paper':'Full-length '+ex.n+' mock',m,'High','mock',sec?'Your day is too short for a full paper':'Mock test');
    if(an>=30)mk(d,'Mock test','Analyse mistakes and note weak topics',an,'High','mock','Mock analysis');continue}
   let rbud=(D.k==='final'||!live().length)?free:revB;
   rv.filter(r=>r.due<=d&&!r.done).sort((a,b)=>a.due<b.due?-1:a.due>b.due?1:0).forEach(r=>{if(rbud>=rb&&free>=rb){mk(d,r.s,'Revise: '+r.tp,rb,'Medium','revision','Spaced revision, day +'+steps[r.j]);r.done=true;rbud-=rb;free-=rb}});
   if(D.k==='study'){const ds=[];let s;
    while(free>=30&&(s=pick())){const it=bySub[s][0];let m=Math.min(bl,free,it.rem);if(it.rem-m<30&&it.rem<=free)m=it.rem;
     it.k=(it.k||0)+1;
     ds.push(mk(d,s,it.t.n+(Math.ceil(it.tot/bl)>1?' (part '+it.k+')':''),m,lab(s,it.t),'study',it.own?'New topic':'New topic (placeholder time)',it.tk));
     it.rem-=m;free-=m;
     if(it.rem<30){bySub[s].shift();steps.forEach((g,j)=>{const due=addD(d,g);if(due<=end)rv.push({s,tp:it.t.n,due,j})})}}
    const np=prm.practice>=40?2:prm.practice>=15?1:0;
    if(np&&ds.length>np)ds.slice(-np).forEach(t=>{t.topic='Practice questions: '+t.topic;t.why='Question practice'})}
   while(free>=30){const m=Math.min(bl,free);                          // spare time: keep finished subjects fresh, then question practice
    if(maint.length){const x=maint[mi++%maint.length];mk(d,x.s,'Revise: '+x.tp,m,'Low','revision','Keeps completed subjects fresh')}
    else{const s=ppick();mk(d,s,'Practice questions and error review: '+s,m,'Medium','study','Question practice')}
    free-=m}}
  const rest=[];Object.keys(bySub).forEach(s=>bySub[s].forEach(it=>{if(it.rem>=30)rest.push(it)}));
  let later=0;if(H>E)later=rest.length;else rest.forEach(it=>skipped.push({s:it.s,n:it.t.n,min:it.rem}));
  enforce(out,cap);
  const ks=[...kept],summary={mode,H,emit:E,demand,supply,keptN:ks.length,skipped,later,placeholder:ks.length?Math.round(100*ks.filter(i=>!i.own).length/ks.length):0};
  return{start:t0,tasks:out,at:new Date().toISOString(),basis:L.note,learned:L,mode,summary}}
 function check(tasks,cap){const by={};tasks.forEach(t=>by[t.date]=(by[t.date]||0)+t.mins);return Object.keys(by).filter(d=>by[d]>cap).map(d=>({date:d,mins:by[d]}))}
 function enforce(tasks,cap){check(tasks,cap).forEach(b=>{let over=b.mins-cap;tasks.filter(t=>t.date===b.date).sort((a,c)=>P[c.pri]-P[a.pri]).forEach(t=>{if(over>0){const cut=Math.min(over,Math.floor(Math.max(0,t.mins-30)/15)*15);t.mins-=cut;over-=cut}})});return tasks}
 return{MIN_N,learn,plan,check,enforce,median,modeFor,modeName}})();
