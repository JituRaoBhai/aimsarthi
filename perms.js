/* PERMISSIONS (v12). Loaded after account.js. Shows what Tasky can use on this phone and asks for each one only when you tap.
   A web app can only ask for: notifications, background reminders, persistent storage and installing to the home screen.
   Android's "display over other apps" and battery settings cannot be requested by a web page, so the card explains where to set them. */
(function(){
 let inst=null,last=0;const P={s:{},refresh:null};window.Perms=P;
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();inst=e;try{if(V.tab==='profile'&&!sheetOpen())render()}catch(x){}});
 addEventListener('appinstalled',()=>{inst=null;try{render()}catch(x){}});
 const standalone=()=>!!(matchMedia('(display-mode: standalone)').matches||navigator.standalone);
 P.refresh=async()=>{last=Date.now();const o={};
  o.notif=window.Notification?Notification.permission:'unsupported';
  try{o.persist=navigator.storage&&navigator.storage.persisted?await navigator.storage.persisted():null}catch(e){o.persist=null}
  try{o.bg=navigator.permissions?(await navigator.permissions.query({name:'periodic-background-sync'})).state:'unsupported'}catch(e){o.bg='unsupported'}
  o.inst=standalone();const ch=JSON.stringify(o)!==JSON.stringify(P.s);P.s=o;if(ch&&V.tab==='profile'&&!sheetOpen())try{render()}catch(e){}};
 const row=(t,st,body,btn)=>`<div class="pm"><div style="min-width:0"><b>${t}</b> <span class="tag ${st==='ok'?'ok':''}">${st==='ok'?'On':st==='bad'?'Blocked':st==='na'?'Not available':'Off'}</span><br><span class="sm mu">${body}</span></div>${btn||''}</div>`;
 window.permCard=()=>{if(Date.now()-last>4000)P.refresh();const s=P.s,rem=S.rem||{};
  const n=s.notif==='granted'?row('Notifications','ok','Timer alerts, Pomodoro breaks and study reminders.')
   :s.notif==='denied'?row('Notifications','bad','Open Android Settings, Apps, then your browser or Tasky, Notifications, and switch them on.')
   :s.notif==='unsupported'?row('Notifications','na','This browser cannot show them.')
   :row('Notifications','off','Needed for the timer notification (with Pause and Stop) and reminders.','<button class="btn s" data-a="pnotif">Allow</button>');
  const b=rem.on?row('Daily reminders','ok',rem.bg?'Works in the background.':'Works while the app is open. Install the app to get them in the background.','<button class="btn o s" data-a="remoff">Turn off</button>')
   :row('Daily reminders','off','A nudge on days you have not studied yet.','<button class="btn s" data-a="remon">Turn on</button>');
  const k=s.persist?row('Keep my data on this phone','ok','Android will not clear your saved plan to free space.')
   :s.persist===null?'':row('Keep my data on this phone','off','Stops the browser clearing your plan when the phone is low on space.','<button class="btn s" data-a="ppers">Allow</button>');
  const i=s.inst?row('Installed on home screen','ok','Opens like an app and works offline.')
   :inst?row('Install the app','off','Add Tasky to your home screen.','<button class="btn s" data-a="pinst">Install</button>')
   :row('Install the app','off','Chrome menu (three dots), then Install app or Add to Home screen.');
  return`<section class="card" id="perm"><h2>Permissions</h2><p class="sm mu">Tasky asks only for what these features need. Nothing is switched on without your tap.</p>${n}${b}${k}${i}`
   +`<details class="sm" style="margin-top:8px"><summary><b>Floating timer and battery (set once in Android)</b></summary><p class="sm mu">The timer floats over other apps using Picture-in-Picture. Allow it in Android Settings, Apps, Special app access, Picture-in-picture, then switch on your browser or Tasky.</p><p class="sm mu">To keep the timer notification and reminders alive, open Settings, Apps, your browser or Tasky, Battery, and choose Unrestricted. A web app cannot switch these on for you.</p></details>`
   +`<button class="btn w" style="margin-top:10px" data-a="pall">Allow everything above</button></section>`};
 const ask=async()=>{if(window.Notification&&Notification.permission==='default')try{await Notification.requestPermission()}catch(e){}};
 const pers=async()=>{try{if(navigator.storage&&navigator.storage.persist)return await navigator.storage.persist()}catch(e){}return false};
 Object.assign(A,{
  pnotif:async()=>{await ask();await P.refresh();toast(Notification.permission==='granted'?'Notifications are on':'Notifications are not allowed. Change it in Android Settings.');render()},
  ppers:async()=>{const ok=await pers();await P.refresh();toast(ok?'Your data is protected':'Your browser did not allow it. Installing the app usually helps.');render()},
  pinst:async()=>{if(!inst)return;inst.prompt();try{await inst.userChoice}catch(e){}inst=null;P.refresh();render()},
  pall:async()=>{await ask();await pers();if(window.Notification&&Notification.permission==='granted'&&!(S.rem||{}).on)await A.remon();else{await P.refresh();render()}
   if(inst)toast('Almost done: tap Install to add Tasky to your home screen.')},
  pfirst:async()=>{closeSheet();await A.pall()}});
 /* once, right after the first plan is accepted */
 P.first=()=>{if(!S||!S.rem||S.rem.permAsk||sheetOpen()||S.timer)return;S.rem.permAsk=true;save();
  sheet(`<h2>Allow what Tasky needs?</h2><p>For the timer to keep working when you leave the app, and for study reminders, Tasky can ask Android for:</p><ul class="sm"><li><b>Notifications</b>: timer with Pause and Stop buttons, Pomodoro breaks, daily reminder.</li><li><b>Keep my data</b>: stops the phone clearing your plan.</li><li><b>Install</b>: opens like an app and works offline.</li></ul><p class="sm mu">You can change all of this later in Profile.</p><div class="row"><button class="btn o" style="flex:1" data-a="x">Later</button><button class="btn" style="flex:1" data-a="pfirst">Allow</button></div>`)};
 P.refresh();
})();
