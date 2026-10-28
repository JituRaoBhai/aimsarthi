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
 ['add','Add task','Put your own task on a day','<path d="M12 5v14M5 12h14"/>',''],
 ['stt','Take a test','Custom or topic tests','<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9"/>',''],
 ['fcgo','Flashcards','Quick revision cards','<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 012 2v10"/>',''],
 ['tab','Your plan','Calendar and weekly plan','<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',' data-v="roadmap"'],
 ['tab','Progress','Charts and test scores','<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',' data-v="progress"']];
function quickCard(){
 return(S.p.toured?'':`<div class="note tourn"><b>New here?</b> Take a one-minute tour of the app.<div class="row" style="margin-top:8px"><button class="btn s" data-a="tour">Show me around</button><button class="btn o s" data-a="tourx">Skip</button></div></div>`)
 +`<section class="card qa"><h2>Quick actions</h2><div class="qag">${QK.map(([a,t,d,ic,x])=>`<button type="button" class="qab" data-a="${a}"${x}><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><b>${t}</b><span class="sm mu">${d}</span></button>`).join('')}</div></section>`}

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
