import { createFirebaseTransport } from './firebase-transport.js';
import { db } from '../firebase.js';
import { createEngine } from './engine.js';
import { currentWeek } from './model.js';

// Firestore supports several cached readers. Our localStorage outbox allows one
// editor per origin. Fail closed in a second tab instead of losing concurrent
// local read/modify/write operations. Separate devices remain fully supported.
let releaseEditor = () => {};
const editorReady = new Promise(resolve => {
  // Safari may not provide Web Locks. Keep the tracker usable there; Firestore's
  // persistent multi-tab cache still coordinates the remote client. Browsers with
  // locks get the stronger one-editor guard below.
  if (!globalThis.navigator?.locks) { resolve(true); return; }
  globalThis.navigator.locks.request('gymtrack-editor-v2',{ifAvailable:true},lock => {
    resolve(Boolean(lock));
    if (lock) return new Promise(resolveRelease => {releaseEditor = resolveRelease;}); // Browser releases the lease on close.
    return undefined;
  }).catch(() => resolve(false));
});
const storage = {
  getItem:k => globalThis.localStorage.getItem(k),
  setItem:(k,v) => globalThis.localStorage.setItem(k,v),
};
const transport = db ? createFirebaseTransport(db) : null;
export const {store,sync} = createEngine({storage,transport,canWrite:() => editorReady,online:() => globalThis.navigator?.onLine !== false});

if (typeof window !== 'undefined') {
  window.addEventListener('online',() => sync.retry());
  window.addEventListener('offline',() => sync.refresh());
  let lastWeek = currentWeek();
  const refreshWeek = () => { const next = currentWeek(); if (next !== lastWeek) {lastWeek = next; sync.refresh();} };
  window.addEventListener('focus',refreshWeek);
  document.addEventListener('visibilitychange',refreshWeek);
  setInterval(refreshWeek,30000);
}

if (import.meta.hot) import.meta.hot.dispose(() => {releaseEditor(); sync.dispose();});
