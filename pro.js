/* AD-FREE SUBSCRIPTION PAGE (v18). Loaded after ads.js.
   The page is ready; payments are OFF until you finish the setup in server-extras/functions-paytm.js (the steps are at the top of that file) and set PRO_CFG.live=true.
   Until then the app stays free and the page only lets people ask to be told when it starts.
   Money is never trusted to the app: the server (functions-paytm.js) creates the order, verifies Paytm's signed callback and stores
   who is ad-free. The app only asks the server "is this person ad-free?" and shows what it says. */
const PRO_CFG={
 live:false,                                   // flip to true only after the server side works
 mid:'',                                       // your Paytm merchant id (not secret). The merchant KEY stays on the server only.
 host:'https://securegw.paytm.in',            // use https://securegw-stage.paytm.in while testing
 plans:[{id:'m1',name:'1 month',price:'49',note:'Cancel any time'},{id:'m6',name:'6 months',price:'249',note:'Save about 15%'},{id:'y1',name:'1 year',price:'449',note:'Best value'}]};   // sample prices: set your own
const Pro={
 sel:'m6',
 active(){return Ads.free()},
 async check(){                                // asks the server and overwrites anything stored on the phone, so editing the saved data cannot switch ads off
  if(!PRO_CFG.live||!window.Cloud||!Cloud.user||!navigator.onLine)return;
  try{const tok=await Cloud.token(),r=await fetch('/api/pro',{headers:{Authorization:'Bearer '+tok}});if(!r.ok)return;const j=await r.json();
   const u=j&&typeof j.proUntil==='string'?j.proUntil:'';delete S.p.adfree;if((S.p.proUntil||'')!==u){S.p.proUntil=u;save();render()}}catch(e){}},
 view(){const on=Pro.active(),L=PRO_CFG.plans,w=S.p.proWait;
  const list=L.map(p=>`<button type="button" class="pln" data-a="prosel" data-v="${p.id}" aria-pressed="${Pro.sel===p.id}"><b>${esc(p.name)}</b><span class="pp">&#8377;${esc(p.price)}</span><span class="sm mu">${esc(p.note)}</span></button>`).join('');
  return`<h2 style="margin-top:0">Tasky without ads</h2>`
   +(on?`<p class="note">You are ad-free${S.p.proUntil?' until '+esc(new Date(S.p.proUntil).toLocaleDateString()):''}. Thank you for supporting Tasky.</p>`
   :`<p class="sm">Ads appear only after you finish something (a study timer, a plan or a test). Going ad-free removes them completely. All study features stay free for everyone.</p><div class="plns" role="group" aria-label="Choose a plan">${list}</div>`
   +(PRO_CFG.live?`<button type="button" class="btn w" data-a="propay">Pay with Paytm</button><p class="sm mu" style="margin:8px 0 0">Pay by UPI, card or wallet on Paytm's secure page. Tasky never sees your card or UPI details.</p>`
    :`<p class="note">Payments are not open yet. Tasky is free for now.</p>${w?'<p class="sm" style="color:var(--ok)">&#10003; We will tell you when it starts.</p>':'<button type="button" class="btn w" data-a="prowait">Tell me when it starts</button>'}`))
   +`<div class="row" style="margin-top:10px"><button type="button" class="btn o" style="flex:1" data-a="x">Close</button></div>`}};
Object.assign(A,{
 proopen:()=>{sheet(Pro.view());Pro.check()},
 prosel:d=>{Pro.sel=d.v;$$('[data-a=prosel]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===d.v));vib(6)},
 prowait:()=>{S.p.proWait=1;save();sheet(Pro.view());toast('Saved. We will let you know.')},
 propay:async()=>{
  if(!PRO_CFG.live||!PRO_CFG.mid){toast('Payments are not open yet.');return}
  if(!window.Cloud||!Cloud.user){toast('Please log in first.');return}
  if(window.PWA&&PWA.needNet())return;
  try{const tok=await Cloud.token(),r=await fetch('/api/pro-order',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify({plan:Pro.sel})}),j=await r.json();
   if(!r.ok||!j.txnToken||!j.orderId){toast(j&&j.error||'Could not start the payment. Try again.');return}
   await new Promise((ok,no)=>{const s=document.createElement('script');s.src=PRO_CFG.host+'/merchantpgpui/checkoutjs/merchants/'+encodeURIComponent(PRO_CFG.mid)+'.js';s.crossOrigin='anonymous';s.onload=ok;s.onerror=()=>no(new Error('load'));document.head.appendChild(s)});
   closeSheet();
   window.Paytm.CheckoutJS.init({root:'',flow:'DEFAULT',merchant:{mid:PRO_CFG.mid,name:'Tasky',redirect:false},
    data:{orderId:j.orderId,token:j.txnToken,tokenType:'TXN_TOKEN',amount:String(j.amount)},
    handler:{transactionStatus:()=>{try{window.Paytm.CheckoutJS.close()}catch(e){}toast('Checking your payment...');setTimeout(Pro.check,2500)},notifyMerchant:()=>{}}
   }).then(()=>window.Paytm.CheckoutJS.invoke()).catch(()=>toast('The payment page could not open.'))}
  catch(e){toast('Could not reach the payment page. Check your internet.')}}});
/* ask the server once after the app has loaded and the person is logged in */
setTimeout(()=>{try{Pro.check()}catch(e){}},6000);
/* Profile card */
window.proCard=()=>`<section class="card"><div class="row sp"><div><h2 style="margin:0 0 2px">Tasky without ads</h2><p class="sm mu" style="margin:0">${Pro.active()?'You are ad-free.':'Remove the short ads shown after a timer, plan or test.'}</p></div><button type="button" class="btn o s" data-a="proopen">${Pro.active()?'View':'See plans'}</button></div></section>`;
