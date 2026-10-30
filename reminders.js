/* Shared by the page and the service worker (sw.js): decides whether a study reminder is due.
   m = {on, hour, seen, studied, pending, next, lastNotif}. Returns {tag,title,body} or null. */
function reminderDue(m,now){
 if(!m||!m.on||!m.pending)return null;
 const ago=m.lastNotif?now-new Date(m.lastNotif):1e12;
 if(ago<20*36e5)return null;
 if(now-new Date(m.seen)>=48*36e5)return{tag:'away',title:'Your plan is waiting',body:'You have not opened Tasky for 2 days. Even 25 minutes keeps you on track.'};
 if(new Date(now).getHours()>=m.hour&&m.studied!==new Date(now).toDateString())return{tag:'daily',title:'Time to study',body:m.next||'Open today\'s plan.'};
 return null}
