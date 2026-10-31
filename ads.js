/* ADS + AD-FREE PLAN (v18). Loaded after guide.js.
   - Ads appear only AFTER something finishes: stopping the study timer, building a plan, submitting a test.
     Never during a timer or a test. At most one ad every 4 minutes. The ad cannot be closed for 5 seconds.
   - Provider-neutral. In the Android app (WebView wrapper) it calls window.TaskyNative.showInterstitial() (AdMob, see android/).
     On the web it shows the house ad from ADS_CFG below. Replace the sample text with your own ad or sponsor.
   - Ad-free: S.p.adfree=true (or S.p.proUntil in the future) switches ads off. Set it from the server after a verified payment (see pro.js). */
const ADS_CFG={
 enabled:true,                    // set false to switch every ad off without touching anything else
 gapMs:4*6e4,                     // minimum time between two ads
 holdSec:5,                       // seconds before the Close button works
 house:{title:'Your ad could be here',body:'This is a sample ad. Replace this text, add a link, or use the Android app with AdMob.',url:'',cta:'Learn more'}};
const Ads={
 free(){const p=S&&S.p||{};return !!(p.adfree||(p.proUntil&&new Date(p.proUntil)>new Date()))},
 ok(){if(!ADS_CFG.enabled||Ads.free()||!navigator.onLine)return false;let t=0;try{t=+localStorage.getItem('tasky:adt')||0}catch(e){}return Date.now()-t>=ADS_CFG.gapMs},
 /* ask for an ad; it waits until no sheet is open and no test or timer is running, then shows */
 queue(where,delay){if(!Ads.ok())return;let n=0;const go=()=>{if(!Ads.ok())return;
   if(sheetOpen()||(V.qt&&V.qt.ph==='run')||S.timer){if(++n<25)setTimeout(go,1000);return}
   Ads.show(where)};setTimeout(go,delay||700)},
 show(where){try{localStorage.setItem('tasky:adt',String(Date.now()))}catch(e){}
  if(window.TaskyNative&&TaskyNative.showInterstitial){try{TaskyNative.showInterstitial(where);return}catch(e){}}
  const h=ADS_CFG.house;let s=ADS_CFG.holdSec;
  sheet(`<p class="sm mu" style="margin:0 0 6px">Advertisement</p><div class="adb"><h2 style="margin:0 0 6px">${esc(h.title)}</h2><p style="margin:0 0 10px">${esc(h.body)}</p>${h.url&&/^https:\/\//.test(h.url)?`<a class="btn o s" href="${esc(h.url)}" target="_blank" rel="noopener noreferrer sponsored">${esc(h.cta)}</a>`:''}</div>`
   +`<div class="row" style="margin-top:12px"><button type="button" class="btn o" data-a="proopen">Remove ads</button><button type="button" class="btn" id="adc" style="flex:1" data-a="adx" disabled>Close in ${s}</button></div>`);
  $('#sh').dataset.lock='1';
  const iv=setInterval(()=>{const b=document.getElementById('adc');if(!b){clearInterval(iv);return}s--;if(s>0){b.textContent='Close in '+s;return}
   clearInterval(iv);b.disabled=false;b.textContent='Close';delete $('#sh').dataset.lock},1000)}};
Object.assign(A,{adx:()=>closeSheet()});

/* ---- where ads appear ---- */
(function(){
 const wrapA=(n,fn)=>{const f=A[n];if(typeof f!=='function')return;A[n]=function(d){const r=fn(f,this,arguments);return r}};
 wrapA('timer',(f,t,a)=>{const was=!!S.timer,r=f.apply(t,a);if(was&&!S.timer)Ads.queue('timer',900);return r});
 const qs=window.qxSubmit;if(typeof qs==='function')window.qxSubmit=function(){const z=V.qt,was=z&&z.ph==='run',r=qs.apply(this,arguments);if(was)Ads.queue('test',1200);return r};
 const br=window.buildRoadmap;if(typeof br==='function')window.buildRoadmap=async function(){const r=await br.apply(this,arguments);if(S.draft&&S.draft.agreed)Ads.queue('plan',900);return r};
 wrapA('agree',(f,t,a)=>{const had=!!S.draft,r=f.apply(t,a);if(had)Ads.queue('plan',1500);return r});
})();
