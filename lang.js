/* LANGUAGE (v17): chosen with the name at set-up, changeable in Profile. Loaded last, after lang-hi.js.
   The screens are built in English; after every redraw this file swaps text it finds in the language tables.
   Text that is not in a table (your own notes, exam content, question text) stays as it is. */
const LANGS={en:'English',hi:'हिन्दी'},LTAB={hi:window.LANG_HI||{}};
const Lang={
 cur(){let l=S&&S.p&&S.p.lang;if(!l)try{l=localStorage.getItem('tasky:lang')}catch(e){}return LANGS[l]?l:'en'},
 loc(){return Lang.cur()==='hi'?'hi-IN':undefined},
 set(l){if(!LANGS[l])return;if(S&&S.p)S.p.lang=l;try{localStorage.setItem('tasky:lang',l)}catch(e){}document.documentElement.lang=l;if(S)save();render()}};
const GH={'Hi':'नमस्ते','Good morning':'सुप्रभात','Good afternoon':'शुभ दोपहर','Good evening':'शुभ संध्या','Good night':'शुभ रात्रि'};
const RULES=[
 [/^Week (\d+)$/,m=>'सप्ताह '+m[1]],
 [/^(\d+) of (\d+) tasks completed\. (\d+) outstanding, (\d+) of them already past\.$/,m=>m[2]+' में से '+m[1]+' कार्य पूरे। '+m[3]+' बाकी, जिनमें से '+m[4]+' की तारीख़ निकल चुकी।'],
 [/^Goal: cover (.+); (\d+) revision and (\d+) mock sessions\. (.+) planned\.$/,(m,t)=>'लक्ष्य: '+(m[1]==='revision'?'दोहराव':m[1])+' पूरा करना; '+m[2]+' दोहराव और '+m[3]+' मॉक सत्र। '+m[4]+' की योजना।'],
 [/^Revision: (.+)$/,m=>'दोहराव: '+m[1]],
 [/^(\d+) for (.+)\. Tap to view$/,m=>m[2]+' के लिए '+m[1]+'। देखने के लिए दबाएँ'],
 [/^Focus and break lengths for the Pomodoro rhythm \(now (.+)\) and the alarm sound\.$/,m=>'पोमोडोरो लय के फ़ोकस और ब्रेक की अवधि (अभी '+m[1]+') और अलार्म की आवाज़।'],
 [/^(\d+) of (\d+) questions answered correctly in your latest attempts\.(?: (\d+) to revisit\.)?$/,m=>'आपकी ताज़ा कोशिशों में '+m[2]+' में से '+m[1]+' प्रश्न सही।'+(m[3]?' '+m[3]+' दोबारा देखने हैं।':'')],
 [/^(\d+) of (\d+) correct$/,m=>m[2]+' में से '+m[1]+' सही'],
 [/^from (\d+) topics?, (.+) minutes\.(?: That is every question available for your choice\.)?$/,m=>m[1]+' टॉपिक से, '+m[2]+' मिनट।'],
 [/^(\d+) answered,?$/,m=>m[1]+' के उत्तर दिए,'],
 [/^(Hi|Good morning|Good afternoon|Good evening|Good night), (.+)$/,(m)=>GH[m[1]]+', '+m[2]],
 [/^(\d+) days to (.+)$/,m=>m[2]+' में '+m[1]+' दिन बाकी'],
 [/^(\d+) days to go$/,m=>m[1]+' दिन बाकी'],
 [/^(\d+) days to the exam\. Study time for new topics:$/,m=>'परीक्षा में '+m[1]+' दिन। नए टॉपिक के लिए पढ़ाई का समय:'],
 [/^(.+): (\d+) of (\d+) tasks done$/,(m,t)=>(m[1]==='Today'?'आज':m[1])+': '+m[3]+' में से '+m[2]+' कार्य पूरे'],
 [/^(\d+)-day streak$/,m=>m[1]+' दिन की स्ट्रीक'],
 [/^(.+) studied$/,(m,t)=>m[1]+' पढ़ाई'],
 [/^Step (\d+) of (\d+) · (.+)$/,(m,t)=>'चरण '+m[1]+' / '+m[2]+' · '+t(m[3])],
 [/^Step (\d+) of (\d+)$/,m=>'चरण '+m[1]+' / '+m[2]],
 [/^Question (\d+) of (\d+)$/,m=>'प्रश्न '+m[1]+' / '+m[2]],
 [/^Question (\d+), (.+)$/,(m,t)=>'प्रश्न '+m[1]+', '+({'not answered':'उत्तर नहीं दिया','not visited':'नहीं देखा','answered':'उत्तर दिया'}[m[2]]||m[2])],
 [/^Card (\d+) of (\d+)$/,m=>'कार्ड '+m[1]+' / '+m[2]],
 [/^(\d+) of (\d+) done$/,m=>m[2]+' में से '+m[1]+' पूरे'],
 [/^(\d+) of (\d+) topics done$/,m=>m[2]+' में से '+m[1]+' टॉपिक पूरे'],
 [/^(\d+) of (\d+) topics tested$/,m=>m[2]+' में से '+m[1]+' टॉपिक टेस्ट हुए'],
 [/^(\d+) of (\d+) done$/,m=>m[2]+' में से '+m[1]+' पूरे'],
 [/^(\d+) of (\d+) days active this week\.$/,m=>'इस सप्ताह '+m[2]+' में से '+m[1]+' दिन सक्रिय।'],
 [/^(\d+) topics done, (\d+) weak$/,m=>m[1]+' टॉपिक पूरे, '+m[2]+' कमज़ोर'],
 [/^Part (\d+) of (\d+) · (\d+)% of this topic · (\d+)% done after this$/,m=>'भाग '+m[1]+' / '+m[2]+' · इस टॉपिक का '+m[3]+'% · इसके बाद '+m[4]+'% पूरा'],
 [/^(\d+) questions?$/,m=>m[1]+' प्रश्न'],
 [/^(\d+) questions? · you have not taken this test yet$/,m=>m[1]+' प्रश्न · आपने यह टेस्ट अभी नहीं दिया'],
 [/^(\d+) subjects · (\d+) topics · (\d+) min paper$/,m=>m[1]+' विषय · '+m[2]+' टॉपिक · '+m[3]+' मिनट का पेपर'],
 [/^exam year (\d+)$/,m=>'परीक्षा वर्ष '+m[1]],
 [/^(\d+) months$/,m=>m[1]+' महीने'],
 [/^Version (.+)$/,m=>'संस्करण '+m[1]],
 [/^Session (\d+): (.+)$/,m=>'सत्र '+m[1]+': '+m[2]],
 [/^Started (.+)$/,m=>'शुरू हुआ '+m[1]],
 [/^(\d+) not answered$/,m=>m[1]+' उत्तर नहीं दिए'],
 [/^(\d+) selected$/,m=>m[1]+' चुने गए'],
 [/^Practise (\d+) missed$/,m=>'छूटे हुए '+m[1]+' प्रश्न दोबारा हल करें'],
 [/^(\d+) topics left$/,m=>m[1]+' टॉपिक बाकी'],
 [/^(\d+) topics? tested$/,m=>m[1]+' टॉपिक टेस्ट हुए'],
 [/^Back to (.+)$/,(m,t)=>t(m[1])+' पर वापस'],
 [/^Edit (.+)$/,(m,t)=>t(m[1])+' बदलें'],
 [/^(\d+) cards?( · (\d+) due)?$/,m=>m[1]+' कार्ड'+(m[3]?' · '+m[3]+' देय':'')],
 [/^(\d+) (links?|notes?) ?$/,m=>m[1]+(/link/.test(m[2])?' लिंक':' नोट')],
 [/^(\d+) taken$/,m=>m[1]+' दिए गए'],
 [/^(.+) · not started$/,(m,t)=>m[1]+' · शुरू नहीं हुआ'],
 [/^(.+) · done$/,(m,t)=>m[1]+' · पूरा'],
 [/^(.+) · every day$/,m=>m[1]+' · हर दिन'],
 [/^(\d+)% of the plan done$/,m=>'योजना का '+m[1]+'% पूरा']];
const hmHi=s=>s.replace(/(\d+)h\b/g,'$1 घं').replace(/(\d+)m\b/g,'$1 मि');
function trStr(s){const L=Lang.cur();if(L==='en')return s;const T=LTAB[L],lead=/^\s*/.exec(s)[0],tail=/\s*$/.exec(s)[0],c=s.trim();if(!c)return s;
 if(T[c])return lead+T[c]+tail;
 for(const [re,fn] of RULES){const m=re.exec(c);if(m)return lead+hmHi(fn(m,x=>T[x]||x))+tail}
 return /\d(h|m)\b/.test(c)&&/^[\d\shm·:%.,of–-]+$/.test(c)?lead+hmHi(c)+tail:s}
Lang.tr=trStr;
Lang.apply=root=>{if(Lang.cur()==='en'||!root)return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;return!p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.tagName)||p.closest('[data-noxl]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),L=[];let n;while(n=w.nextNode())L.push(n);
 L.forEach(n=>{const v=n.nodeValue;if(v.trim().length<2)return;const t=trStr(v);if(t!==v)n.nodeValue=t});
 (root.querySelectorAll?root.querySelectorAll('[aria-label],[placeholder],[title]'):[]).forEach(e=>['aria-label','placeholder','title'].forEach(a=>{const v=e.getAttribute(a);if(v){const t=trStr(v);if(t!==v)e.setAttribute(a,t)}}))};
/* redraws: run the swap after the app has drawn */
(function(){const wrap=(name,after)=>{const f=window[name];if(typeof f!=='function')return;window[name]=function(){const r=f.apply(this,arguments);try{after.apply(this,arguments)}catch(e){}return r}};
 wrap('render',()=>{Lang.apply(document.getElementById('app'));Lang.apply(document.getElementById('nv'))});
 wrap('sheet',()=>Lang.apply(document.getElementById('shb')));
 wrap('qxRender',()=>Lang.apply(document.getElementById('qx')));
 wrap('wzSubs',()=>Lang.apply(document.getElementById('subs')));
 wrap('tick',()=>Lang.apply(document.getElementById('tl')));
 const t=window.toast;if(typeof t==='function')window.toast=function(m){return t.call(this,Lang.cur()==='en'?m:trStr(String(m)))}})();
/* dates in Hindi when Hindi is chosen */
(function(){const o=Date.prototype.toLocaleDateString;Date.prototype.toLocaleDateString=function(l,x){return o.call(this,l===undefined?Lang.loc():l,x)}})();
/* picker used at set-up (step 1) and in Profile */
const langChips=()=>`<p class="sm mu" style="margin:0 0 6px" data-noxl>Language / भाषा</p><div class="chips" role="group" aria-label="Language" data-noxl>${Object.entries(LANGS).map(([k,v])=>`<button type="button" class="chip" data-a="lang" data-v="${k}" aria-pressed="${Lang.cur()===k}">${v}</button>`).join('')}</div>`;
const langCard=()=>`<section class="card"><h2 data-noxl>Language / भाषा</h2><p class="sm mu" data-noxl>${Lang.cur()==='hi'?'ऐप की भाषा चुनें। परीक्षा की सामग्री और प्रश्न अंग्रेज़ी में ही रहते हैं।':'Choose the app language. Exam content and questions stay in English.'}</p><div class="chips" role="group" aria-label="Language">${Object.entries(LANGS).map(([k,v])=>`<button type="button" class="chip" data-a="lang" data-v="${k}" aria-pressed="${Lang.cur()===k}" data-noxl>${v}</button>`).join('')}</div></section>`;
A.lang=d=>{vib(8);Lang.set(d.v)};
document.documentElement.lang=Lang.cur();
