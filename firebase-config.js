/* Paste your Firebase web config here (Firebase console > Project settings > Your apps > Web app).
   These values are public identifiers, not secrets: security comes from firestore.rules.
   Leave projectId empty to run without accounts (everything then stays on the phone). */
window.FIREBASE_CONFIG={apiKey:'AIzaSyCbVqAbyTtY0xax62Hc_D2Rp3w6CvCzLaA',authDomain:'taskymj.firebaseapp.com',projectId:'taskymj',storageBucket:'taskymj.firebasestorage.app',messagingSenderId:'496800945394',appId:'1:496800945394:web:5bcfda2df2aa051167ac6b',measurementId:'G-FPZ8BR3WZW'};
window.EMAIL_DOMAIN='aimsarthi.invalid';   // a username becomes username@aimsarthi.invalid inside Firebase Authentication
window.cloudReady=new Promise(r=>{window._cloudResolve=r;setTimeout(()=>r(null),7000)});
window.AI_ENDPOINT='https://tasky-ai.YOURNAME.workers.dev';
