/* Focus mode (in-app only).
   A web app / TWA cannot read which apps you use, block other apps or detect calls: Android only gives that to native apps
   (Usage Access + Accessibility/overlay permissions). So this does what a web app honestly can:
   - while the study timer runs, it notices when you leave the app and nudges you back after 15 s;
   - it counts how often you left, and in Strict mode the time spent away is not counted as study time;
   - it points you to Android's own Digital Wellbeing "Focus mode", which really blocks apps and still allows calls. */
const F={h:0,t:0};
const fm=()=>(S&&S.p&&(S.p.fm=S.p.fm||{on:false,strict:false,nudge:true}));
function fmActive(){const f=fm();return!!(f&&f.on&&S.timer&&!S.timer.pz)}
function fmNudge(){F.t=0;if(!fmActive()||!document.hidden)return;
 if(window.Float&&Float.w)return;                       // the floating timer is already on screen
 const f=fm();if(f.nudge===false)return;
 try{if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
  const o={body:'Your study timer is still running. Tap to continue.',tag:'focus',renotify:true,icon:'icon-192.png',badge:'icon-192.png'};
  navigator.serviceWorker&&navigator.serviceWorker.ready.then(r=>r.showNotification('Come back to study',o)).catch(()=>{})}catch(e){}}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(!fmActive())return;F.h=Date.now();clearTimeout(F.t);F.t=setTimeout(fmNudge,15000);return}
 clearTimeout(F.t);try{navigator.serviceWorker&&navigator.serviceWorker.ready.then(r=>r.getNotifications({tag:'focus'}).then(l=>l.forEach(n=>n.close()))).catch(()=>{})}catch(e){}
 if(!F.h)return;const away=Date.now()-F.h;F.h=0;const T=S&&S.timer;if(!T||!fm().on)return;
 if(away<15000)return;
 T.aw=(T.aw||0)+1;T.awt=(T.awt||0)+away;
 if(fm().strict&&!T.pz){T.pt=(T.pt||0)+away;if(T.pomo)T.pomo.ps=new Date(new Date(T.pomo.ps).getTime()+away).toISOString();
  toast('Welcome back. '+Math.round(away/6e4*10)/10+' min away was not counted.')}
 else toast('Welcome back. Stay with it.');
 save();render()});
A.fmt=d=>{const f=fm();f[d.k]=!f[d.k];if(d.k==='on'&&!f.on)f.strict=false;if(d.k==='strict'&&f.strict)f.on=true;
 if(f.on&&f.nudge!==false&&typeof Notification!=='undefined'&&Notification.permission==='default')try{Notification.requestPermission()}catch(e){}
 save();render()};
A.fmwb=()=>{sheet(`<h2>Block apps with Android Focus mode</h2><p>Android's own <b>Digital Wellbeing</b> can pause the apps you pick and still lets calls through.</p><ol class="sm" style="padding-left:20px;line-height:1.6"><li>Open <b>Settings &gt; Digital Wellbeing &amp; parental controls</b>.</li><li>Tap <b>Focus mode</b>.</li><li>Select distracting apps (leave Phone and Messages out).</li><li>Tap <b>Turn on now</b>, or set a schedule for your study hours.</li></ol><p class="sm mu">Some phones call it "Focus mode" under Settings &gt; Digital Wellbeing; menu names vary by brand.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Close</button><button class="btn" style="flex:1" data-a="fmgo">Open settings</button></div>`)};
A.fmgo=()=>{closeSheet();try{location.href='intent://#Intent;package=com.google.android.apps.wellbeing;end'}catch(e){}setTimeout(()=>{if(!document.hidden)toast('Could not open it. Use Settings > Digital Wellbeing.')},1200)};
function focusCard(){const f=fm();if(!f)return'';
 const row=(k,t,s)=>`<div class="fmr"><div><b>${t}</b><br><span class="sm mu">${s}</span></div><button type="button" class="sw2" role="switch" aria-checked="${!!f[k]}" aria-label="${t}" data-a="fmt" data-k="${k}"></button></div>`;
 return`<section class="card"><h2 style="margin:0 0 4px">Focus mode</h2><p class="sm mu" style="margin:0 0 6px">Helps you stay in the app while the study timer is running.</p>`
 +row('on','Focus mode','Counts every time you leave the app while studying.')
 +(f.on?row('nudge','Come-back reminder','Sends a notification if you stay away for 15 seconds.')+row('strict','Strict mode','Time spent away is not counted as study time.'):'')
 +`<div class="fmr" style="display:block"><button class="btn o" style="width:100%" data-a="fmwb">Block apps with Android Focus mode</button><p class="sm mu" style="margin:8px 0 0">Blocking other apps, reading app usage and detecting calls needs a native Android app. A web app cannot do this, so Tasky uses Android's Digital Wellbeing for the actual blocking. Calls are never blocked there.</p></div></section>`}

/* ---------- Focus mode inside Study (v18) ----------
   In the Android app (a WebView wrapper, see android/), window.TaskyNative exists and can ask Android for the permissions that
   really block distractions. In a browser or a Trusted Web Activity it does not exist, so the page shows what the Android app adds
   and the in-app focus features above keep working. Every permission is asked only when the person taps its button. */
const NP=[['notif','Notifications','Shows the running timer and your come-back reminder.'],
 ['dnd','Do Not Disturb access','Silences notifications while you focus. Calls from your starred contacts can still ring.'],
 ['usage','Usage access','Lets Tasky see which app is open so it can bring you back when you open a distracting one.'],
 ['overlay','Display over other apps','Shows a gentle "back to study" screen on top of a blocked app.']];
const nat=()=>window.TaskyNative&&typeof TaskyNative.getPermissions==='function'?TaskyNative:null;
function nPerms(){const n=nat();if(!n)return null;try{return JSON.parse(n.getPermissions())||{}}catch(e){return{}}}
function focusView(){const f=fm(),p=nPerms(),d=V.fd||45,run=!!S.timer;
 const rows=NP.map(([k,t,s])=>{const on=p&&p[k];return`<div class="pm"><div style="min-width:0"><b>${t}</b> <span class="tag ${on?'ok':''}">${p?(on?'On':'Off'):'Android app'}</span><br><span class="sm mu">${s}</span></div>${p&&!on?`<button type="button" class="btn s" data-a="fnp" data-k="${k}">Allow</button>`:''}</div>`}).join('');
 return svBack('Focus mode')+pgd('Start a timed session. Tasky counts every time you leave the app and reminds you to come back.')
  +`<section class="card"><h2 style="margin:0 0 8px">Start a focus session</h2><div class="chips" role="group" aria-label="Length">${[25,45,60,90].map(m=>`<button type="button" class="chip" data-a="fdur" data-v="${m}" aria-pressed="${d===m}">${m} min</button>`).join('')}</div>`
  +`<button type="button" class="btn w" style="margin-top:12px" data-a="fgo"${run?' disabled':''}>${run?'A timer is already running':'Start focusing'}</button>`
  +`<p class="sm mu" style="margin:8px 0 0">The timer rings when the time is up. Calls and alarms are never blocked.</p></section>`
  +focusCard()
  +`<section class="card" id="fperm"><h2 style="margin:0 0 4px">Permissions</h2><p class="sm mu" style="margin:0 0 6px">${p?'Allow only what you want. You can switch each one off later in Android Settings.':'These need the Tasky Android app. A web page cannot get them, so nothing is asked here.'}</p>${rows}</section>`}
Object.assign(A,{
 fdur:d=>{V.fd=+d.v;render()},
 fnp:d=>{const n=nat();if(!n)return;try{n.requestPermission(d.k)}catch(e){toast('Could not open Android settings.')}},
 fgo:async()=>{if(S.timer)return;const f=fm();f.on=true;
  const m=V.fd||45;await A.go({id:''});if(f.nudge!==false&&typeof Notification!=='undefined'&&Notification.permission==='default')try{Notification.requestPermission()}catch(e){}if(S.timer){S.timer.goal=m;S.timer.fc=1;armAlarm();save();render();const n=nat();if(n&&n.startFocus)try{n.startFocus(m)}catch(e){}}}});
(function(){const t=A.timer;A.timer=function(){const was=!!S.timer,r=t.apply(this,arguments);if(was&&!S.timer){const n=nat();if(n&&n.stopFocus)try{n.stopFocus()}catch(e){}}return r}})();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&V.tab==='study'&&V.sv==='focus'&&!sheetOpen())try{render()}catch(e){}});
