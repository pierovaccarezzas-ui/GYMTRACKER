// Run only against the demo emulator: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
// node --test tests/firebase-emulator.test.js. Never targets a real project.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, deleteDoc, serverTimestamp, terminate, disableNetwork, enableNetwork } from 'firebase/firestore';
import { createFirebaseTransport } from '../src/sync/firebase-transport.js';
import { createEngine } from '../src/sync/engine.js';
import { recordId } from '../src/sync/model.js';
const host = process.env.FIRESTORE_EMULATOR_HOST;
const waitFor = async predicate => { const end = Date.now() + 10000; while (!predicate()) {if (Date.now() > end) throw new Error('Timed out waiting for emulator synchronization.'); await new Promise(resolve => setTimeout(resolve,20));} };
function client(uid) {
  const app = initializeApp({projectId:'demo-gymtracker',apiKey:'demo-key'},`${uid || 'anon'}-${Math.random()}`);
  const db = getFirestore(app), [hostname,port] = host.split(':');
  connectFirestoreEmulator(db,hostname,Number(port),uid ? {mockUserToken:{sub:uid}} : undefined);
  return {db,async close() {await terminate(db); await deleteApp(app);}};
}
function engine(db,uid) {
  const data = new Map();
  const storage = {getItem:k => data.get(k) || null,setItem:(k,v) => data.set(k,v)};
  const value = createEngine({storage,transport:createFirebaseTransport(db),week:() => '2026-W42'});
  const statuses=[]; value.sync.start({uid},s => statuses.push(s));
  return {...value,statuses};
}
test('Firestore rules: owner only, constrained fields, no physical deletions', {skip:!host,timeout:20000},async () => {
  const uid=`alice-${Date.now()}`, alice=client(uid), bob=client('bob'), anon=client(null);
  try {
    const id=recordId(['weeks','2026-W42','setProgress','ua1']), path=['users',uid,'records',id];
    const record={schema:1,path:['weeks','2026-W42','setProgress','ua1'],value:2,deleted:false,revision:'r1',updatedAt:serverTimestamp()};
    await setDoc(doc(alice.db,...path),record);
    assert.equal((await getDoc(doc(alice.db,...path))).data().value,2);
    await assert.rejects(getDoc(doc(bob.db,...path)),e => e.code==='permission-denied');
    await assert.rejects(getDoc(doc(anon.db,...path)),e => e.code==='permission-denied');
    await assert.rejects(setDoc(doc(bob.db,...path),record),e => e.code==='permission-denied');
    await assert.rejects(setDoc(doc(alice.db,...path),{...record,admin:true}),e => e.code==='permission-denied');
    await assert.rejects(setDoc(doc(alice.db,...path),{...record,schema:99}),e => e.code==='permission-denied');
    await assert.rejects(deleteDoc(doc(alice.db,...path)),e => e.code==='permission-denied');
  } finally {await Promise.all([alice.close(),bob.close(),anon.close()]);}
});
test('real adapter: two clients merge independent edits and replay offline writes', {skip:!host,timeout:30000},async () => {
  const uid=`shared-${Date.now()}`, a=client(uid), b=client(uid), ea=engine(a.db,uid), eb=engine(b.db,uid);
  try {
    await waitFor(() => ea.statuses.at(-1)?.state==='synced' && eb.statuses.at(-1)?.state==='synced');
    await disableNetwork(a.db);
    await ea.store.set('setProgress',{ua1:2});
    await eb.store.set('setProgress',{ub1:3});
    await waitFor(() => eb.statuses.at(-1)?.state==='synced');
    assert.notEqual(ea.statuses.at(-1)?.state,'synced');
    await enableNetwork(a.db);
    await waitFor(() => ea.store.snapshot().setProgress.ua1===2 && ea.store.snapshot().setProgress.ub1===3 && eb.store.snapshot().setProgress.ua1===2);
    await waitFor(() => ea.statuses.at(-1)?.state==='synced');
    await ea.store.set('runs',[{ts:1,km:3}]);
    await waitFor(() => eb.store.snapshot().runs.length===1);
    await ea.store.set('runs',[]);
    await waitFor(() => eb.store.snapshot().runs.length===0);
  } finally {ea.sync.dispose(); eb.sync.dispose(); await Promise.all([a.close(),b.close()]);}
});
