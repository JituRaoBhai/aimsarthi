/* Firebase wrapper (modular SDK from Google's CDN). Exposes window.Cloud. The rest of the app talks to Firebase only through this file. */
const C=window.FIREBASE_CONFIG||{},B='https://www.gstatic.com/firebasejs/10.14.1/';
const Cloud={enabled:false,user:null};window.Cloud=Cloud;
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))),unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const norm=a=>String(a).trim().toLowerCase().replace(/^0+(?=\d)/,'');
async function hashAnswer(a,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(norm(a)),'PBKDF2',false,['deriveBits']);
 return b64(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unb64(salt),iterations:150000,hash:'SHA-256'},k,256))}
const newSalt=()=>b64(crypto.getRandomValues(new Uint8Array(16)));
Cloud.hash=hashAnswer;Cloud.salt=newSalt;
const MSG={'auth/email-already-in-use':'That username is already taken.','auth/invalid-credential':'Username or password is incorrect.','auth/wrong-password':'Username or password is incorrect.','auth/user-not-found':'Username or password is incorrect.','auth/invalid-login-credentials':'Username or password is incorrect.','auth/too-many-requests':'Too many attempts. Wait a few minutes and try again.','auth/network-request-failed':'No connection. Check your internet and try again.','auth/weak-password':'Choose a stronger password.','auth/requires-recent-login':'Please log in again, then retry.','auth/invalid-email':'That username is not accepted. Use letters and numbers only.'};
Cloud.msg=e=>e&&e.message==='answer'?'Your favourite number does not match.':(MSG[e&&e.code]||'Something went wrong. Please try again.');
if(!C.projectId||!C.apiKey)window._cloudResolve(Cloud);
else(async()=>{try{
 const{initializeApp}=await import(B+'firebase-app.js'),A=await import(B+'firebase-auth.js'),F=await import(B+'firebase-firestore.js');
 const app=initializeApp(C),auth=A.getAuth(app),db=F.getFirestore(app),mail=u=>u+'@'+(window.EMAIL_DOMAIN||'aimsarthi.invalid');
 const uref=()=>F.doc(db,'users',auth.currentUser.uid),sref=()=>F.doc(db,'states',auth.currentUser.uid);
 Cloud.enabled=true;
 const profile=async u=>{let p={};try{const s=await F.getDoc(F.doc(db,'users',u.uid));if(s.exists())p=s.data()}catch(e){}return{uid:u.uid,username:p.username||u.email.split('@')[0],email:p.contactEmail||''}};
 await new Promise(r=>{let first=true;A.onAuthStateChanged(auth,async u=>{Cloud.user=u?await profile(u):null;if(first){first=false;r()}})});
 const mkDoc=async(uid,u,ans)=>{const salt=newSalt();await F.setDoc(F.doc(db,'users',uid),{username:u,qSalt:salt,qHash:await hashAnswer(ans,salt),createdAt:F.serverTimestamp(),lastActive:F.serverTimestamp()})};
 Cloud.signUp=async(u,p,ans)=>{const c=await A.createUserWithEmailAndPassword(auth,mail(u),p);await mkDoc(c.user.uid,u,ans);Cloud.user={uid:c.user.uid,username:u,email:''}};
 Cloud.logIn=async(u,p,ans)=>{const c=await A.signInWithEmailAndPassword(auth,mail(u),p),s=await F.getDoc(F.doc(db,'users',c.user.uid));
  if(s.exists()){const d=s.data();if(await hashAnswer(ans,d.qSalt)!==d.qHash){await A.signOut(auth);Cloud.user=null;throw new Error('answer')}Cloud.user={uid:c.user.uid,username:d.username||u,email:d.contactEmail||''}}
  else{await mkDoc(c.user.uid,u,ans);Cloud.user={uid:c.user.uid,username:u,email:''}}};
 Cloud.logOut=async()=>{await A.signOut(auth);Cloud.user=null};
 Cloud.changePassword=async(o,n)=>{const u=auth.currentUser;await A.reauthenticateWithCredential(u,A.EmailAuthProvider.credential(u.email,o));await A.updatePassword(u,n)};
 Cloud.saveProfile=async f=>{await F.setDoc(uref(),{...f,lastActive:F.serverTimestamp()},{merge:true})};
 Cloud.loadState=async()=>{const s=await F.getDoc(sref());return s.exists()?JSON.parse(s.data().json):null};
 Cloud.saveState=async S=>{await F.setDoc(sref(),{json:JSON.stringify(S),updatedAt:F.serverTimestamp()})};
 Cloud.sendFeedback=async f=>{await F.addDoc(F.collection(db,'feedback'),{...f,uid:auth.currentUser.uid,username:Cloud.user.username,status:'new',createdAt:F.serverTimestamp()})};
 Cloud.loadStrategies=async()=>{const s=await F.getDocs(F.collection(db,'strategies'));return s.docs.map(d=>({id:d.id,...d.data()}))};
}catch(e){console.error('Firebase could not start',e);Cloud.enabled=false}
window._cloudResolve(Cloud)})();
