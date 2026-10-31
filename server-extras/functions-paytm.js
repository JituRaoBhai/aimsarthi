/* Paytm ad-free subscription: server side. NOT deployed by default.
   Copy this file into your functions/ folder, then in functions/index.js add:   Object.assign(exports, require('./functions-paytm'));
   Setup:  cd functions && npm i paytmchecksum
           firebase functions:secrets:set PAYTM_MID     (your merchant id)
           firebase functions:secrets:set PAYTM_KEY     (your merchant KEY: never put it in the app)
   Then add to firebase.json "rewrites":  /api/pro -> function "pro",  /api/pro-order -> "proOrder",  /api/pro-hook -> "proHook"
   and set the callback URL in your Paytm dashboard to  https://YOUR-DOMAIN/api/pro-hook
   Test on https://securegw-stage.paytm.in first (also change PRO_CFG.host in pro.js). */
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const https = require('https');
const PaytmChecksum = require('paytmchecksum');
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const MID = defineSecret('PAYTM_MID'), KEY = defineSecret('PAYTM_KEY');
const HOST = process.env.PAYTM_HOST || 'securegw.paytm.in';           // securegw-stage.paytm.in while testing
const PLANS = { m1: { amount: '49.00', days: 30 }, m6: { amount: '249.00', days: 183 }, y1: { amount: '449.00', days: 366 } };   // the SERVER decides prices. Keep in step with pro.js

const uidOf = async req => { const m = /^Bearer (.+)$/.exec(req.get('Authorization') || ''); if (!m) throw 0; return (await admin.auth().verifyIdToken(m[1])).uid; };
const post = (path, body) => new Promise((ok, no) => { const d = JSON.stringify(body), r = https.request({ hostname: HOST, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) } }, s => { let t = ''; s.on('data', c => t += c); s.on('end', () => { try { ok(JSON.parse(t)) } catch (e) { no(e) } }) }); r.on('error', no); r.write(d); r.end(); });

/* the app asks: is this person ad-free? */
exports.pro = onRequest({ cors: false }, async (req, res) => {
  try { const uid = await uidOf(req), s = await db.doc('entitlements/' + uid).get(), u = s.exists ? s.data().proUntil : null;
    res.json({ proUntil: u && u.toDate && u.toDate() > new Date() ? u.toDate().toISOString() : '' }); } catch (e) { res.status(401).json({ error: 'Please log in again.' }); } });

/* start a payment: the server picks the amount and gets a transaction token from Paytm */
exports.proOrder = onRequest({ secrets: [MID, KEY], cors: false }, async (req, res) => {
  try { const uid = await uidOf(req), p = PLANS[(req.body || {}).plan]; if (!p) return res.status(400).json({ error: 'Unknown plan.' });
    const orderId = 'TSK' + Date.now() + Math.floor(Math.random() * 1e4), mid = MID.value();
    const body = { requestType: 'Payment', mid, websiteName: 'DEFAULT', orderId, callbackUrl: 'https://' + HOST + '/theia/paytmCallback?ORDER_ID=' + orderId, txnAmount: { value: p.amount, currency: 'INR' }, userInfo: { custId: uid } };
    const sig = await PaytmChecksum.generateSignature(JSON.stringify(body), KEY.value());
    const r = await post('/theia/api/v1/initiateTransaction?mid=' + mid + '&orderId=' + orderId, { body, head: { signature: sig } });
    if (!r.body || !r.body.txnToken) return res.status(502).json({ error: 'Paytm did not accept the order.' });
    await db.doc('orders/' + orderId).set({ uid, plan: req.body.plan, amount: p.amount, status: 'created', at: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ orderId, txnToken: r.body.txnToken, amount: p.amount });
  } catch (e) { res.status(401).json({ error: 'Could not start the payment.' }); } });

/* Paytm calls this. We never trust it: check the signature, then ask Paytm for the real status of the order */
exports.proHook = onRequest({ secrets: [MID, KEY] }, async (req, res) => {
  try { const b = req.body || {}, orderId = String(b.ORDERID || b.orderId || ''); if (!/^TSK\d+$/.test(orderId)) return res.status(400).end();
    const sum = b.CHECKSUMHASH; const copy = { ...b }; delete copy.CHECKSUMHASH;
    if (sum && !PaytmChecksum.verifySignature(copy, KEY.value(), sum)) return res.status(400).end();
    const body = { mid: MID.value(), orderId }, sig = await PaytmChecksum.generateSignature(JSON.stringify(body), KEY.value());
    const r = await post('/v3/order/status', { body, head: { signature: sig } }), ok = r.body && r.body.resultInfo && r.body.resultInfo.resultStatus === 'TXN_SUCCESS';
    const ref = db.doc('orders/' + orderId);
    await db.runTransaction(async t => { const o = await t.get(ref); if (!o.exists || o.data().status === 'paid') return;
      const d = o.data(); if (!ok || String(r.body.txnAmount) !== d.amount) { t.update(ref, { status: 'failed' }); return; }
      const eRef = db.doc('entitlements/' + d.uid), e = await t.get(eRef), now = Date.now(), base = e.exists && e.data().proUntil && e.data().proUntil.toMillis() > now ? e.data().proUntil.toMillis() : now;
      t.set(eRef, { proUntil: admin.firestore.Timestamp.fromMillis(base + PLANS[d.plan].days * 864e5) }); t.update(ref, { status: 'paid' }); });
    res.status(200).send('OK'); } catch (e) { res.status(500).end(); } });
