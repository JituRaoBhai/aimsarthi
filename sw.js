importScripts('reminders.js');
const V='aimsarthi-v14',SHELL=['./','index.html','styles.css','app.js','tests.js','float.js','perms.js','focus.js','live.js','pwa.js','theme.js','privacy-policy.html','terms.html','delete-account.html','exams.js','exams2.js','plandata.js','strategies.js','reminders.js','engine.js','account.js','ai.js','cloud.js','firebase-config.js','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
// A new version installs quietly and waits. The app shows "Update"; tapping it sends SKIP_WAITING and the app reloads on the new version.
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'}))))));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('aimsarthi-v')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// Same-origin files: serve the saved copy instantly, refresh it in the background (works offline).
self.addEventListener('fetch',e=>{const r=e.request;const u=new URL(r.url);if(r.headers.get('x-probe')){e.respondWith(fetch(r,{cache:'no-store'}));return}   // connection check: always ask the network
 if(r.method!=='GET'||u.pathname.indexOf('/api/')>=0||!(u.origin===location.origin||(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/'))))return;
 e.respondWith((async()=>{const c=await caches.open(V),hit=await c.match(r,{ignoreSearch:true});
  const net=fetch(r).then(x=>{if(x.status===200)c.put(r,x.clone());return x}).catch(()=>null);
  if(hit){e.waitUntil(net);return hit}
  return (await net)||(r.mode==='navigate'?await c.match('index.html'):Response.error())})())});
// Background reminders (Chrome on Android, installed app). The page saves a small state snapshot to the 'aimsarthi-meta' cache.
self.addEventListener('periodicsync',e=>{if(e.tag==='study-reminder')e.waitUntil((async()=>{const c=await caches.open('aimsarthi-meta'),r=await c.match('meta');if(!r)return;
 const m=await r.json(),d=reminderDue(m,Date.now());if(!d)return;
 await self.registration.showNotification(d.title,{body:d.body,tag:d.tag,icon:'icon-192.png',badge:'icon-192.png'});
 m.lastNotif=new Date().toISOString();await c.put('meta',new Response(JSON.stringify(m)))})())});
// Buttons on the timer notification (Pause, Resume, Stop) are sent to the open app, or open it with the action. A plain tap opens the app.
self.addEventListener('notificationclick',e=>{e.notification.close();const act=e.action;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
  if(act==='pause'||act==='resume'||act==='stop'){if(l.length){l.forEach(c=>c.postMessage({type:'timer',act}));return}return clients.openWindow('./?t='+act)}
  return l.length?l[0].focus():clients.openWindow('./')}))});
