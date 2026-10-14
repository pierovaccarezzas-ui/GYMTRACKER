import { KEYS, clone, equal, currentWeek, toRecords, toPayload, recordTree, parseBackup, hasData, validateRecord } from './model.js';
const PREFIX = 'gymtrack:v2:';
const blank = () => ({version:2,records:{},pending:{},adopted:false});
const errorMessage = e => e?.message || 'No fue posible guardar o sincronizar los datos.';

// Storage and transport are injected, so adversarial offline/ack/account sequences
// exercise the same engine used by the browser without requiring production access.
export function createEngine({storage,transport = null,week = currentWeek,canWrite = () => Promise.resolve(true),online = () => true}) {
  let uid = null, epoch = 0, envelope = blank(), storageError = null, statusListener = () => {};
  let unsubscribe = null, serverSeen = false, remote = {}, inFlight = false, retryTimer = null, candidate = null;
  let failure = null, retryDelay = 1000, disposed = false, subscriptionFailed = false;
  const listeners = new Set();
  const key = () => PREFIX + (uid ? `user:${uid}` : 'guest');
  const revision = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const read = k => { try { const raw = storage.getItem(k); return raw ? JSON.parse(raw) : null; } catch(e) { storageError = errorMessage(e); return null; } };
  const persist = (next,k = key()) => {
    try { storage.setItem(k,JSON.stringify(next)); storageError = null; return true; }
    catch(e) { storageError = `No se guardó el cambio en este dispositivo: ${errorMessage(e)}`; return false; }
  };
  function load(k) {
    const saved = read(k);
    if (!saved) return blank();
    try {
      if (saved.version !== 2 || !saved.records || !saved.pending) throw new Error('Formato de almacenamiento desconocido.');
      for (const [id,r] of Object.entries(saved.records)) { validateRecord(r); if (id !== encodeURIComponent(JSON.stringify(r.path))) throw new Error('Identificador de registro inválido.'); }
      for (const [id,p] of Object.entries(saved.pending)) if (!saved.records[id] || typeof p.revision !== 'string') throw new Error('Cola local no válida.');
      return saved;
    } catch(e) { storageError = `Datos locales no válidos; se conservó la copia original. ${errorMessage(e)}`; return blank(); }
  }
  function preserve(reason,value) {
    return persist({reason,createdAt:new Date().toISOString(),data:value},`${PREFIX}recovery:${Date.now()}:${revision()}`);
  }
  function emit() { const payload = toPayload(envelope.records,week()); listeners.forEach(fn => fn(payload)); report(); }
  function report() {
    const pending = Object.keys(envelope.pending).length;
    let state = !uid || !transport ? 'local' : !online() ? 'offline' : !serverSeen ? 'connecting' : pending || inFlight ? 'pending' : 'synced';
    let message = state === 'local' ? 'Guardado en este dispositivo.' : state === 'synced' ? 'Cambios confirmados por Firebase.' : state === 'offline' ? 'Sin conexión. Los cambios quedan guardados aquí.' : state === 'pending' ? 'Cambios guardados aquí, pendientes de confirmación.' : 'Conectando; puedes seguir usando tus datos locales.';
    if (uid && candidate) { state = 'conflict'; message = 'Hay datos locales pendientes de adoptar. Elige qué copia usar antes de sincronizar.'; }
    if (failure || storageError) { state = 'error'; message = storageError || failure; }
    statusListener({state,pending,message,hasLocalCandidate:Boolean(candidate),canChoose:serverSeen});
  }
  // Preserve untouched legacy values before interpreting them. Never remove legacy keys.
  if (!read(`${PREFIX}guest`)) {
    const legacy = {};
    for (const k of KEYS) { const value = read(k); if (value !== null) legacy[k] = value; }
    if (Object.keys(legacy).length) {
      if (preserve('pre-firebase-legacy',legacy)) {
        try { envelope.records = toRecords(legacy,week()); persist(envelope,`${PREFIX}guest`); }
        catch(e) { storageError = `Los datos originales se conservaron; necesitan revisión: ${errorMessage(e)}`; }
      }
    }
  }
  envelope = load(key());
  async function writable(expectedEpoch) {
    const allowed = await canWrite();
    if (expectedEpoch !== epoch) return false;
    if (!allowed) { failure = 'Esta pestaña es de solo lectura. Cierra las otras ventanas de GymTracker y vuelve a abrirla para editar.'; emit(); return false; }
    return true;
  }
  function commitRecords(nextRecords,replace = false) {
    const next = clone(envelope);
    const ids = new Set([...Object.keys(nextRecords),...(replace ? Object.keys(next.records) : [])]);
    let changed = false;
    for (const id of ids) {
      const previous = next.records[id];
      const proposed = nextRecords[id] || {path:previous.path,deleted:true,value:null};
      if (previous && previous.deleted === proposed.deleted && equal(previous.value,proposed.value)) continue;
      const record = {...proposed,revision:revision()};
      next.records[id] = record; next.pending[id] = {revision:record.revision}; changed = true;
    }
    if (!changed) { emit(); return true; }
    if (!persist(next)) { emit(); return false; }
    envelope = next; failure = null; emit(); void flush(); return true;
  }
  async function flush() {
    const token = epoch;
    if (disposed || !uid || !transport || !serverSeen || !envelope.adopted || candidate || inFlight || !online()) { report(); return; }
    if (!await writable(token)) return;
    // Set the latch after the await and recheck; multiple local updates may arrive together.
    if (inFlight || token !== epoch) return;
    const ids = Object.keys(envelope.pending).slice(0,200);
    if (!ids.length) { report(); return; }
    const owner = uid, writes = Object.fromEntries(ids.map(id => [id,clone(envelope.records[id])]));
    inFlight = true; report();
    try {
      await transport.write(owner,writes);
      if (token !== epoch) return;
      const next = clone(envelope);
      for (const [id,record] of Object.entries(writes)) {
        if (next.pending[id]?.revision === record.revision) delete next.pending[id];
      }
      // Never claim acknowledgment if clearing the durable outbox failed.
      if (persist(next)) envelope = next;
      failure = null; retryDelay = 1000;
    } catch(e) {
      if (token !== epoch) return;
      failure = `Los cambios siguen guardados aquí. Firebase: ${errorMessage(e)}`;
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = setTimeout(() => { retryTimer = null; void flush(); },retryDelay);
      retryTimer?.unref?.(); retryDelay = Math.min(retryDelay * 2,60000);
    } finally {
      if (token === epoch) { inFlight = false; report(); }
    }
    if (token === epoch && !failure && !storageError && Object.keys(envelope.pending).length) void flush();
  }
  function stopInternal() {
    epoch++; unsubscribe?.(); unsubscribe = null;
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null; inFlight = false; serverSeen = false; subscriptionFailed = false; candidate = null; remote = {}; failure = null;
  }
  function receive(records,meta,token) {
    if (token !== epoch) return;
    try {
      for (const [id,r] of Object.entries(records)) { validateRecord(r); if (id !== encodeURIComponent(JSON.stringify(r.path))) throw new Error('Identificador remoto no válido.'); }
      // Local Firebase write echoes do not acknowledge our application queue.
      if (meta.hasPendingWrites || (meta.fromCache && serverSeen)) return;
      remote = clone(records);
      if (!meta.fromCache) serverSeen = true;
      if (!envelope.adopted && candidate) { report(); return; }
      const next = clone(envelope);
      if (!envelope.adopted && serverSeen) next.adopted = true;
      // Cached queries can be incomplete. Server queries are authoritative for
      // absent records; pending local paths always survive either kind.
      if (!meta.fromCache) for (const id of Object.keys(next.records)) if (!Object.hasOwn(records,id) && !next.pending[id]) delete next.records[id];
      for (const [id,r] of Object.entries(records)) if (!next.pending[id]) next.records[id] = r;
      if (!persist(next)) { report(); return; }
      envelope = next; failure = null; emit(); void flush();
    } catch(e) { failure = `No se aplicaron datos remotos: ${errorMessage(e)}`; report(); }
  }
  function attachSubscription(token) {
    unsubscribe?.();
    subscriptionFailed = false;
    const onError = e => {
      if (token !== epoch) return;
      subscriptionFailed = true; serverSeen = false;
      failure = `Firebase: ${errorMessage(e)}. Tus datos locales siguen disponibles.`; report();
    };
    try { unsubscribe = transport.subscribe(uid,(records,meta) => receive(records,meta,token),onError); }
    catch(e) { onError(e); }
  }
  const store = {
    async get(k) { return toPayload(envelope.records,week())[k] ?? null; },
    snapshot() { return toPayload(envelope.records,week()); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    getError() { return storageError || failure; },
    async set(k,value) {
      const token = epoch;
      // Capture the edit's base before yielding for the editor lock. A remote
      // callback during that await must not turn unrelated stale UI fields into edits.
      const previous = store.snapshot()[k];
      if (!KEYS.includes(k)) throw new Error(`Campo de almacenamiento no admitido: ${k}`);
      if (!await writable(token)) return false;
      if (k === 'week') return true; // Week is a projection; history is never reset.
      // Existing UI creates optional undefined properties. Match JSON semantics.
      const clean = clone(value);
      const before = previous == null ? {} : toRecords({week:week(),[k]:previous},week());
      const after = toRecords({week:week(),[k]:clean},week());
      const changes = {};
      for (const id of new Set([...Object.keys(before),...Object.keys(after)])) {
        if (!equal(before[id],after[id])) changes[id] = after[id] || {path:before[id].path,deleted:true,value:null};
      }
      return commitRecords(changes);
    },
  };
  const sync = {
    start(user,onStatus = () => {}) {
      stopInternal(); uid = user?.uid || null; statusListener = onStatus; envelope = load(key());
      if (uid && !envelope.adopted) {
        const guest = load(`${PREFIX}guest`);
        const claimed = read(`${PREFIX}guestClaimed`);
        candidate = hasData(envelope.records) ? clone(envelope.records) : !claimed && hasData(guest.records) ? clone(guest.records) : null;
        if (candidate && !hasData(envelope.records)) envelope.records = clone(candidate);
      }
      emit();
      const token = epoch;
      void writable(token);
      if (uid && transport) attachSubscription(token);
      return () => { if (epoch !== token) return; stopInternal(); uid = null; envelope = load(key()); statusListener = () => {}; emit(); };
    },
    async adoptLocal() {
      const token = epoch;
      if (!uid || !serverSeen || !candidate) throw new Error('Espera a recuperar la copia de Firebase antes de elegir.');
      if (!await writable(token)) return false;
      if (!preserve('before-adopt-local',{local:envelope,cloud:remote})) { report(); return false; }
      const local = clone(envelope.records);
      // Include every remote record in the comparison so explicit replacement
      // uses tombstones for remote-only fields rather than leaving stale values.
      const next = {...blank(),records:clone(remote),adopted:true};
      if (!persist(next)) { report(); return false; }
      envelope = next; candidate = null;
      persist(uid,`${PREFIX}guestClaimed`);
      return commitRecords(local,true);
    },
    async useCloud() {
      const token = epoch;
      if (!uid || !serverSeen) throw new Error('Espera a recuperar la copia de Firebase antes de elegir.');
      if (!await writable(token)) return false;
      if (!preserve('before-use-cloud',{local:envelope,cloud:remote})) { report(); return false; }
      const next = {...blank(),records:clone(remote),adopted:true};
      if (!persist(next)) { report(); return false; }
      envelope = next; candidate = null; persist(uid,`${PREFIX}guestClaimed`); emit(); return true;
    },
    exportBackup() {
      return {format:'gymtrack-backup',version:1,exportedAt:new Date().toISOString(),payload:store.snapshot(),history:recordTree(envelope.records).weeks || {}};
    },
    async importBackup(input) {
      const records = parseBackup(input,week()), token = epoch;
      if (!await writable(token)) return false;
      if (!preserve('before-import',{existing:sync.exportBackup(),source:input})) { report(); return false; }
      return commitRecords(records);
    },
    refresh() { emit(); },
    retry() { failure = null; if (uid && transport && subscriptionFailed) attachSubscription(epoch); report(); void flush(); },
    dispose() { disposed = true; stopInternal(); listeners.clear(); },
  };
  return {store,sync};
}
