/* Login, account and feedback screens. Loaded after app.js. Needs Cloud (cloud.js); Cloud.enabled is false until firebase-config.js is filled in. */
const AUTH={mode:'login',err:'',busy:false,u:'',p:'',q:'',lastFb:0};
const authOn=()=>!!(window.Cloud&&Cloud.enabled);
/* username: spaces become underscores, lower case, only a-z 0-9 _ . */
const normName=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_.]/g,'').replace(/_+/g,'_');
/* password: 6 to 64 characters, anything goes except repeats, the username or part of it. Returns '' when fine, else the reason. */
function pwErr(p,u){p=String(p||'');if(p.length<6)return'Password needs 6 or more characters.';if(p.length>64)return'Password is too long (64 at most).';
 if(/^(.)\1*$/.test(p))return'Password cannot be one repeated character.';
 for(let k=1;k<=3;k++)if(p.length%k===0&&p.length>k&&p.slice(0,k).repeat(p.length/k)===p)return'Password cannot be a repeated word like abab or 123123.';
 const l=p.toLowerCase(),n=normName(u);
 if(n&&(l===n||l.replace(/[_.\s]/g,'')===n.replace(/[_.]/g,'')))return'Password cannot be your username.';
 if(n&&n.length>=4&&l.includes(n))return'Password cannot contain your username.';
 if(n&&n.split(/[_.]/).some(t=>t.length>=4&&l.includes(t)))return'Password cannot contain your name.';
 return''}
const okPw=p=>!pwErr(p,'');
const okMail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)&&v.length<=120;
function checkAuth(u,p,q,m){u=normName(u);
 if(!/^[a-z0-9_.]{3,30}$/.test(u))return'Username must be 3 to 30 letters, numbers, dots or underscores.';
 if(m==='signup'&&pwErr(p||'',u))return pwErr(p||'',u);
 if(!p)return'Enter your password.';
 return /^\d{1,12}$/.test((q||'').trim())?'':'Your favourite number must be digits only (up to 12).'}
/* shows the cleaned-up username the person will get, and (from the database) whether it is free */
let nmT=0,nmSeq=0;
const NM={u:'',st:''};
function unameNote(){const u=normName(AUTH.u);if(!u)return'Spaces become _ . Letters, numbers, . and _ only.';
 if(u.length<3)return'Your username will be: <b>'+esc(u)+'</b> (needs 3 or more characters)';
 return'Your username will be: <b>'+esc(u)+'</b>'+(NM.u===u?NM.st:'')}
function nameCheck(){clearTimeout(nmT);const u=normName(AUTH.u),el=document.getElementById('au_n');if(el)el.innerHTML=unameNote();
 if(AUTH.mode!=='signup'||!/^[a-z0-9_.]{3,30}$/.test(u)||!window.Cloud||!Cloud.nameFree)return;
 nmT=setTimeout(async()=>{const my=++nmSeq,free=await Cloud.nameFree(u);if(my!==nmSeq)return;
  NM.u=u;NM.st=free===true?' <span style="color:var(--ok)">&#10003; available</span>':free===false?' <span style="color:var(--bad,#d33)">&#10007; already taken</span>':'';
  const e2=document.getElementById('au_n');if(e2&&normName(AUTH.u)===u)e2.innerHTML=unameNote()},450)}
function authView(){const s=AUTH.mode==='signup';
 return`<section class="welcome"><div class="road lg" aria-hidden="true"><i class="done"></i><i class="done"></i><i class="partial"></i><i class="done"></i><i></i><i></i><i></i></div><h1 class="logo">Tasky</h1><p class="lead" style="margin:0">${s?'Create an account to keep your plan safe and use it on any phone.':'Welcome back. Log in to load your plan.'}</p></section>`
 +`<section class="card" style="margin-top:14px"><div class="seg" role="group" aria-label="Account mode"><button data-a="aumode" data-v="login" aria-pressed="${!s}">Log in</button><button data-a="aumode" data-v="signup" aria-pressed="${s}">Create account</button></div>`
 +inp('au_u','Username',`data-au="u" autocomplete="username" autocapitalize="none" maxlength="30" value="${esc(AUTH.u)}"`)
 +(s?`<p class="sm mu" id="au_n" style="margin:4px 0 0" aria-live="polite">${unameNote()}</p>`:'')
 +inp('au_p',s?'Password (6 or more characters)':'Password',`type="password" data-au="p" autocomplete="${s?'new-password':'current-password'}" maxlength="64" value="${esc(AUTH.p)}"`)
 +inp('au_q','Your favourite number?',`inputmode="numeric" data-au="q" maxlength="12" autocomplete="off" value="${esc(AUTH.q)}"`)
 +`<p class="sm mu" style="margin-top:8px">${s?'Remember this number. You are asked for it every time you log in.':'Enter the number you chose when you created the account.'}</p><p class="er" role="alert">${esc(AUTH.err)}</p><button class="btn w" data-a="auth" ${AUTH.busy?'disabled':''}>${AUTH.busy?'Please wait...':s?'Create account':'Log in'}</button></section>`}
function accountCard(){
 if(!authOn())return'';
 const u=CL().user;
 return`<section class="card"><h2>Account</h2><p style="margin:0 0 10px"><b>${esc(u.username)}</b><br><span class="sm mu">${esc(u.email||'No email added')}</span></p><div class="row" style="flex-wrap:wrap"><button class="btn o s" data-a="acc">Email and password</button><button class="btn o s" data-a="fb">Report a problem</button><button class="btn o s" data-a="logout">Log out</button></div></section>`}
Object.assign(A,{
 aumode:d=>{AUTH.mode=d.v;AUTH.err='';render();nameCheck()},
 auth:async()=>{const e=checkAuth(AUTH.u,AUTH.p,AUTH.q,AUTH.mode);if(e){AUTH.err=e;render();return}
  if(AUTH.mode==='signup'&&Cloud.nameFree&&await Cloud.nameFree(normName(AUTH.u))===false){AUTH.err='That username is already taken. Try another.';render();return}
  AUTH.busy=true;AUTH.err='';render();
  try{const u=normName(AUTH.u),q=AUTH.q.trim(),r=await wait(AUTH.mode==='signup'?Cloud.signUp(u,AUTH.p,q):Cloud.logIn(u,AUTH.p,q),25000);if(r==='timeout')throw{code:'auth/network-request-failed'};AUTH.p=AUTH.q='';await afterAuth()}
  catch(x){AUTH.err=Cloud.msg(x)}
  AUTH.busy=false;render()},
 logout:async()=>{try{await flushNow()}catch(e){}loadedUid=null;if(unW){unW();unW=null}try{localStorage.removeItem(lkey())}catch(e){}await Cloud.logOut();S=fresh();V.tab='home';V.step=0;AUTH.mode='login';render()},
 acc:()=>sheet(`<h2>Email and password</h2>${inp('ac_e','Email (optional, so the developer can contact you)',`type="email" maxlength="120" autocomplete="email" value="${esc(CL().user.email)}"`)}<button class="btn w" style="margin-top:10px" data-a="emailok">Save email</button><h3 style="margin-top:20px">Change password</h3>${inp('ac_o','Current password','type="password" autocomplete="current-password" maxlength="64"')}${inp('ac_n','New password (6 or more characters)','type="password" autocomplete="new-password" maxlength="64"')}${inp('ac_c','Repeat new password','type="password" autocomplete="new-password" maxlength="64"')}<p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Close</button><button class="btn" style="flex:1" data-a="pwok">Change password</button></div>`),
 emailok:async()=>{const v=$('#ac_e').value.trim(),s=$('#se');if(v&&!okMail(v)){s.textContent='Enter a valid email address.';return}
  try{await Cloud.saveProfile({contactEmail:v});CL().user.email=v;s.textContent='';toast('Email saved');render()}catch(e){s.textContent='Could not save. Check your connection.'}},
 pwok:async()=>{const o=$('#ac_o').value,n=$('#ac_n').value,c=$('#ac_c').value,s=$('#se');
  const e=!o?'Enter your current password.':pwErr(n,CL().user.username)?pwErr(n,CL().user.username):n!==c?'The new passwords do not match.':n===o?'Choose a different password.':'';
  if(e){s.textContent=e;return}
  try{await Cloud.changePassword(o,n);closeSheet();toast('Password changed')}catch(x){s.textContent=Cloud.msg(x)}},
 fb:()=>{if(!CL().user){toast('Log in to send feedback.');return}
  sheet(`<h2>Report a problem or suggestion</h2><label for="fb_t">Type</label><select id="fb_t"><option value="problem">Problem</option><option value="suggestion">Suggestion</option></select><label for="fb_m">What happened, or what would help? (10 to 500 characters)</label><textarea id="fb_m" maxlength="500" rows="5"></textarea>${inp('fb_c','Contact email (optional)',`type="email" maxlength="120" value="${esc(CL().user.email)}"`)}<p class="sm mu" style="margin-top:8px">Your username, exam and app version are sent too, so the problem can be found.</p><p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="fbok">Send</button></div>`)},
 fbok:async()=>{const m=$('#fb_m').value.trim(),c=$('#fb_c').value.trim(),s=$('#se');
  if(m.length<10){s.textContent='Please write at least 10 characters.';return}
  if(c&&!okMail(c)){s.textContent='Enter a valid contact email or leave it empty.';return}
  if(Date.now()-AUTH.lastFb<3e4){s.textContent='Please wait a moment before sending another.';return}
  const f={type:$('#fb_t').value,message:m,contact:c,exam:S.p.exam||'',app:VER};AUTH.lastFb=Date.now();
  try{const r=await wait(Cloud.sendFeedback(f),12000);if(r==='timeout')throw 0;closeSheet();toast('Thank you. Sent.')}
  catch(x){S.fbq=(S.fbq||[]).concat([f]).slice(-10);save();closeSheet();toast('Saved. It will be sent when you are online.')}}});
document.addEventListener('input',e=>{const k=e.target.dataset.au;if(!k)return;
 if(k==='u'){const t=e.target,v=t.value.replace(/\s+/g,'_').toLowerCase().replace(/[^a-z0-9_.]/g,'').replace(/_+/g,'_');if(v!==t.value)t.value=v;AUTH.u=v;nameCheck();return}
 AUTH[k]=e.target.value});
async function flushFb(){if(!CL().user||!S||!S.fbq||!S.fbq.length)return;const left=[];   // feedback written offline is sent later
 for(const f of S.fbq){try{const r=await wait(Cloud.sendFeedback(f),12000);if(r==='timeout')throw 0}catch(e){left.push(f)}}
 S.fbq=left;save()}

/* Delete account (required by Google Play): removes the online data and the login after the password is confirmed. */
Object.assign(A,{
 delacc:()=>{if(!authOn()||!CL().user){toast('You are not logged in.');return}
  sheet(`<h2>Delete your account?</h2><p>This permanently deletes your login and the plan, tasks, study sessions and settings saved online. It cannot be undone. Tip: export a backup first from the Your data card.</p>${inp('da_p','Enter your password to confirm','type="password" autocomplete="current-password" maxlength="64"')}<p id="se" class="er" role="alert"></p><div class="row"><button class="btn o" style="flex:1" data-a="x">Cancel</button><button class="btn" style="flex:1" data-a="delaccok">Delete account</button></div>`)},
 delaccok:async()=>{const pw=$('#da_p').value,s=$('#se');if(!pw){s.textContent='Enter your password.';return}
  s.textContent='Deleting...';
  try{const r=await wait(Cloud.deleteAccount(pw),25000);if(r==='timeout')throw{code:'auth/network-request-failed'};
   loadedUid=null;if(unW){unW();unW=null}try{localStorage.removeItem(lkey())}catch(e){}S=fresh();V.tab='home';V.step=0;AUTH.mode='signup';AUTH.err='';closeSheet();render();toast('Your account was deleted')}
  catch(x){s.textContent=Cloud.msg(x)}}});
