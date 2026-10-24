importScripts('reminders.js');
const V='aimsarthi-v11',SHELL=['./','index.html','styles.css','app.js','tests.js','float.js','exams.js','exams2.js','plandata.js','strategies.js','reminders.js','engine.js','account.js','ai.js','cloud.js','firebase-config.js','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('aimsarthi-v')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// Same-origin files: serve the saved copy instantly, refresh it in the background (works offline).
self.addEventListener('fetch',e=>{const r=e.request;const u=new URL(r.url);if(r.method!=='GET'||!(u.origin===location.origin||(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/'))))return;
 e.respondWith((async()=>{const c=await caches.open(V),hit=await c.match(r,{ignoreSearch:true});
  const net=fetch(r).then(x=>{if(x.status===200)c.put(r,x.clone());return x}).catch(()=>null);
  if(hit){e.waitUntil(net);return hit}
  return (await net)||(r.mode==='navigate'?await c.match('index.html'):Response.error())})())});
// Background reminders (Chrome on Android, installed app). The page saves a small state snapshot to the 'aimsarthi-meta' cache.
self.addEventListener('periodicsync',e=>{if(e.tag==='study-reminder')e.waitUntil((async()=>{const c=await caches.open('aimsarthi-meta'),r=await c.match('meta');if(!r)return;
 const m=await r.json(),d=reminderDue(m,Date.now());if(!d)return;
 await self.registration.showNotification(d.title,{body:d.body,tag:d.tag,icon:'icon-192.png',badge:'icon-192.png'});
 m.lastNotif=new Date().toISOString();await c.put('meta',new Response(JSON.stringify(m)))})())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
