/* Paste your Firebase web config here (Firebase console > Project settings > Your apps > Web app).
   These values are public identifiers, not secrets: security comes from firestore.rules.
   Leave projectId empty to run without accounts (everything then stays on the phone). */
window.FIREBASE_CONFIG={apiKey:'',authDomain:'',projectId:'',storageBucket:'',messagingSenderId:'',appId:''};
window.EMAIL_DOMAIN='aimsarthi.invalid';   // a username becomes username@aimsarthi.invalid inside Firebase Authentication
window.cloudReady=new Promise(r=>{window._cloudResolve=r;setTimeout(()=>r(null),7000)});
