'use strict';
/* Account + Firestore layer.
   Requires the Firebase compat SDK (loaded in index.html) and firebase-config.js.
   If either is missing or the config still has PASTE_ placeholders, all methods fail softly
   so the app keeps working in on-device-only mode. */
(function(){
  const A = {};
  window.Auth = A;

  let app = null, auth = null, db = null, ready = false;
  A.user = null;               // { uid, username, email }
  A.configured = function(){
    return typeof firebase !== 'undefined'
        && typeof FIREBASE_CONFIG !== 'undefined'
        && FIREBASE_CONFIG.apiKey
        && !/^PASTE_/.test(FIREBASE_CONFIG.apiKey);
  };

  const slug      = u => String(u||'').trim().toLowerCase();
  const emailFor  = u => slug(u).replace(/[^a-z0-9._-]/g,'') + '@aimsarthi.app';
  const validMail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  async function sha256(s){
    try{
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
    }catch(e){
      // very old browser: fall back to a weak but deterministic transform
      let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0;
      return 'w'+h.toString(16);
    }
  }
  const favHash = (u,n) => sha256(slug(u) + '::fav::' + String(n).trim());

  A.init = function(){
    if(!A.configured()) return false;
    try{
      app  = (firebase.apps && firebase.apps.length) ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
      auth = firebase.auth();
      db   = firebase.firestore();
      try{ auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }catch(e){}
      ready = true;
      return true;
    }catch(e){ console.warn('Firebase init failed:', e); ready=false; return false; }
  };

  A.restore = function(){
    if(!ready) return Promise.resolve(null);
    return new Promise(res=>{
      const off = auth.onAuthStateChanged(async u=>{
        off();
        if(!u) return res(null);
        try{
          const d = await db.collection('users').doc(u.uid).get();
          const data = d.data() || {};
          A.user = { uid:u.uid, username: data.username || String(u.email||'').split('@')[0], email: data.email || '' };
          res(A.user);
        }catch(e){ res(null); }
      });
    });
  };

  A.signup = async function({ username, password, favNumber, email }){
    if(!ready) throw new Error('Sign-in is not available right now.');
    const u = slug(username);
    if(!/^[a-z0-9._-]{3,20}$/.test(u))
      throw new Error('Username must be 3–20 characters: letters, numbers, dot, underscore or hyphen.');
    if(String(password||'').length < 6) throw new Error('Password must be at least 6 characters.');
    if(!String(favNumber||'').trim()) throw new Error('Please enter your favourite number.');
    const em = String(email||'').trim();
    if(em && !validMail(em)) throw new Error('That recovery email does not look right.');

    const unameRef = db.collection('usernames').doc(u);
    const taken = await unameRef.get();
    if(taken.exists) throw new Error('That username is already taken.');

    const cred = await auth.createUserWithEmailAndPassword(emailFor(u), password);
    const uid  = cred.user.uid;
    const fh   = await favHash(u, favNumber);
    const now  = firebase.firestore.FieldValue.serverTimestamp();

    await db.collection('users').doc(uid).set({
      username: u, favHash: fh, email: em, createdAt: now, lastLogin: now, version: 1
    });
    await unameRef.set({ uid, recoveryEmail: em, createdAt: now });

    A.user = { uid, username:u, email:em };
    return A.user;
  };

  A.login = async function({ username, password, favNumber }){
    if(!ready) throw new Error('Sign-in is not available right now.');
    const u = slug(username);
    const uSnap = await db.collection('usernames').doc(u).get();
    if(!uSnap.exists) throw new Error('No account with that username.');

    const cred = await auth.signInWithEmailAndPassword(emailFor(u), password);
    const uid  = cred.user.uid;
    const uDoc = await db.collection('users').doc(uid).get();
    const data = uDoc.data() || {};

    const fh = await favHash(u, favNumber);
    if(fh !== data.favHash){
      await auth.signOut();
      throw new Error('That favourite number does not match our records.');
    }
    await db.collection('users').doc(uid).update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
    A.user = { uid, username:u, email: data.email || '' };
    return A.user;
  };

  A.logout = async function(){
    try{ if(ready && auth) await auth.signOut(); }catch(e){}
    A.user = null;
  };

  A.loadState = async function(){
    if(!ready || !auth.currentUser) return null;
    const d = await db.collection('users').doc(auth.currentUser.uid).collection('app').doc('state').get();
    return d.exists ? d.data() : null;
  };
  A.saveState = async function(state){
    if(!ready || !auth.currentUser) return false;
    await db.collection('users').doc(auth.currentUser.uid).collection('app').doc('state').set(state);
    return true;
  };
  A.saveMeta = async function(meta){
    if(!ready || !auth.currentUser) return false;
    await db.collection('users').doc(auth.currentUser.uid).collection('meta').doc('summary')
      .set(meta, { merge:true });
    return true;
  };

  A.setRecoveryEmail = async function(email){
    if(!ready || !auth.currentUser) throw new Error('Not signed in.');
    const em = String(email||'').trim();
    if(em && !validMail(em)) throw new Error('Enter a valid email address.');
    await db.collection('users').doc(auth.currentUser.uid).update({ email: em });
    if(A.user) await db.collection('usernames').doc(A.user.username).update({ recoveryEmail: em });
    A.user.email = em;
  };

  A.changePassword = async function(oldPw, newPw){
    if(!ready || !auth.currentUser) throw new Error('Not signed in.');
    if(String(newPw||'').length < 6) throw new Error('New password must be at least 6 characters.');
    const u = auth.currentUser;
    const cred = firebase.auth.EmailAuthProvider.credential(u.email, String(oldPw||''));
    await u.reauthenticateWithCredential(cred);
    await u.updatePassword(newPw);
  };

  A.changeFav = async function(password, newFav){
    if(!ready || !auth.currentUser) throw new Error('Not signed in.');
    if(!String(newFav||'').trim()) throw new Error('Enter a new favourite number.');
    const u = auth.currentUser;
    const cred = firebase.auth.EmailAuthProvider.credential(u.email, String(password||''));
    await u.reauthenticateWithCredential(cred);
    const fh = await favHash(A.user.username, newFav);
    await db.collection('users').doc(u.uid).update({ favHash: fh });
  };

  A.forgot = async function(username){
    if(!ready) throw new Error('Sign-in is not available right now.');
    const u = slug(username);
    const s = await db.collection('usernames').doc(u).get();
    if(!s.exists) throw new Error('No account with that username.');
    const em = (s.data()||{}).recoveryEmail;
    if(!em) throw new Error('This account has no recovery email. Ask the developer to reset it for you.');
    await auth.sendPasswordResetEmail(em);
    return em;
  };

  A.report = async function(payload){
    if(!ready) throw new Error('Reporting is not available right now.');
    await db.collection('reports').add({
      kind: payload.kind || 'Other',
      message: String(payload.message || '').slice(0, 2000),
      version: payload.version || '',
      uid: auth.currentUser ? auth.currentUser.uid : '',
      username: A.user ? A.user.username : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      ua: navigator.userAgent,
      lang: navigator.language,
      path: location.hash || ''
    });
  };
})();