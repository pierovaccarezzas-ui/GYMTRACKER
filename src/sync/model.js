// Record boundaries deliberately follow independent edits. Ordered lists remain atomic.
export const KEYS = ['week','done','custom','addedEx','deletedEx','runs','routine','setProgress','sessionExercises','warmupDone','customSessions','deletedSessions','sessionWarmups','todaySelection','routineOrder','sessionMeta','legacyArchive'];
const UNSAFE = new Set(['__proto__','constructor','prototype']);
const ARRAY_KEYS = new Set(['runs','deletedEx']);
const PROGRESS_KEYS = new Set(['done','setProgress','warmupDone']);
export const clone = value => JSON.parse(JSON.stringify(value));
export const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export function currentWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const y = d.getUTCFullYear();
  return `${y}-W${String(Math.ceil((((d - new Date(Date.UTC(y,0,1))) / 86400000) + 1) / 7)).padStart(2,'0')}`;
}
export function validateJSON(value) {
  let nodes = 0;
  function walk(v, depth) {
    if (++nodes > 60000 || depth > 16) throw new Error('Respaldo demasiado grande o profundo.');
    if (v === null || typeof v === 'boolean') return;
    if (typeof v === 'number' && Number.isFinite(v)) return;
    if (typeof v === 'string' && v.length <= 100000) return;
    if (!v || typeof v !== 'object') throw new Error('El respaldo contiene un valor no válido.');
    if (!Array.isArray(v) && Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null) throw new Error('Objeto no válido.');
    for (const [k,item] of Object.entries(v)) {
      if (UNSAFE.has(k) || !k.length || k.length > 200) throw new Error('Clave no permitida en el respaldo.');
      walk(item, depth + 1);
    }
  }
  walk(value, 0);
  if (JSON.stringify(value).length > 4000000) throw new Error('El respaldo supera 4 MB.');
}
const isMap = v => v && typeof v === 'object' && !Array.isArray(v);
export function validatePayload(payload) {
  validateJSON(payload);
  if (!isMap(payload)) throw new Error('Se esperaba un objeto de datos.');
  if (!KEYS.some(k => Object.hasOwn(payload,k))) throw new Error('No se encontraron datos de GymTracker.');
  for (const key of KEYS) {
    const v = payload[key];
    if (v == null) continue;
    if (key === 'week') { if (typeof v !== 'string' || !/^\d{4}-W\d{2}$/.test(v)) throw new Error('Semana no válida.'); }
    else if (key === 'routine') { if (typeof v !== 'string') throw new Error('Rutina no válida.'); }
    else if (ARRAY_KEYS.has(key)) { if (!Array.isArray(v)) throw new Error(`${key} debe ser una lista.`); }
    else if (!isMap(v)) throw new Error(`${key} debe ser un objeto.`);
  }
  for (const run of payload.runs || []) if (!isMap(run) || (run.id != null && (typeof run.id !== 'string' || !run.id)) || (run.id == null && !Number.isFinite(run.ts))) throw new Error('Carrera sin identificador estable.');
  for (const sessions of Object.values(payload.customSessions || {})) {
    if (!Array.isArray(sessions) || sessions.some(s => !isMap(s) || (typeof s.id !== 'string' || !s.id))) throw new Error('Rutinas personalizadas no válidas.');
  }
  for (const ids of Object.values(payload.deletedSessions || {})) if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw new Error('Rutinas eliminadas no válidas.');
  for (const entry of Object.values(payload.sessionExercises || {})) {
    if (!isMap(entry)) throw new Error('Sesión no válida.');
    for (const field of ['order','deleted']) if (entry[field] != null && (!Array.isArray(entry[field]) || entry[field].some(id => typeof id !== 'string'))) throw new Error('Orden de ejercicios no válido.');
    for (const field of ['added','overrides']) if (entry[field] != null && !isMap(entry[field])) throw new Error('Ejercicios no válidos.');
  }
  for (const entry of Object.values(payload.sessionExercises || {})) {
    for (const field of ['added','overrides']) for (const item of Object.values(entry[field] || {})) if (!isMap(item)) throw new Error('Detalle de ejercicio no válido.');
  }
  for (const ids of Object.values(payload.routineOrder || {})) if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw new Error('Orden de rutinas no válido.');
  for (const item of Object.values(payload.sessionMeta || {})) if (!isMap(item)) throw new Error('Metadatos de rutina no válidos.');
  for (const n of Object.values(payload.setProgress || {})) if (!Number.isFinite(n) || n < 0) throw new Error('Progreso no válido.');
  return payload;
}
function membership(items) { return Object.fromEntries((items || []).map(id => [id,true])); }
function normalized(payload, week) {
  const n = {};
  const unknown = Object.fromEntries(Object.entries(payload).filter(([key]) => !KEYS.includes(key)));
  if (Object.keys(unknown).length) n.legacyArchive = {unknownPayloadFields:clone(unknown)};
  for (const key of KEYS) {
    if (key === 'week' || payload[key] == null) continue;
    const value = clone(payload[key]);
    if (PROGRESS_KEYS.has(key)) {
      n.weeks ||= {}; n.weeks[payload.week || week] ||= {}; n.weeks[payload.week || week][key] = value;
    } else if (key === 'runs') {
      n.runs = {};
      for (const run of value) {
        const id = String(run.id ?? run.ts);
        if (Object.hasOwn(n.runs,id)) throw new Error('Hay carreras con identificadores duplicados.');
        n.runs[id] = run;
      }
    } else if (key === 'customSessions') {
      n.customSessions = Object.fromEntries(Object.entries(value).map(([routine,list]) => {
        const entities = {};
        for (const item of list) { if (Object.hasOwn(entities,item.id)) throw new Error('Hay rutinas duplicadas.'); entities[item.id] = item; }
        return [routine,entities];
      }));
    } else if (key === 'deletedSessions') n.deletedSessions = Object.fromEntries(Object.entries(value).map(([k,ids]) => [k,membership(ids)]));
    else if (key === 'sessionExercises') n[key] = Object.fromEntries(Object.entries(value).map(([sid,entry]) => [sid,{ ...entry, ...(entry.deleted ? {deleted:membership(entry.deleted)} : {}) }]));
    else if (key === 'legacyArchive') n[key] = {...(n[key] || {}),...value};
    else n[key] = value;
  }
  return n;
}
export const recordId = path => encodeURIComponent(JSON.stringify(path));
function atomic(path) {
  return (path[0] === 'runs' && path.length === 2) || (path[0] === 'customSessions' && path.length === 3) || (path[0] === 'sessionExercises' && path[2] === 'added' && path.length === 4);
}
export function flattenNormalized(data) {
  const out = {};
  function visit(value,path) {
    if (isMap(value) && !atomic(path)) {
      // Empty containers need no records; the UI supplies their defaults.
      for (const [key,item] of Object.entries(value)) visit(item,[...path,key]);
    } else {
      const id = recordId(path);
      if (id.length > 1400) throw new Error('Identificador demasiado largo.');
      out[id] = {path,value,deleted:false};
    }
  }
  visit(data,[]); return out;
}
export function toRecords(payload, week = currentWeek()) { validatePayload(payload); return flattenNormalized(normalized(payload,week)); }
export function recordTree(records) {
  const out = {};
  for (const record of Object.values(records)) {
    if (record.deleted) continue;
    let target = out;
    for (const key of record.path.slice(0,-1)) { target[key] ||= {}; target = target[key]; }
    target[record.path.at(-1)] = clone(record.value);
  }
  return out;
}
export function toPayload(records, week = currentWeek()) {
  const n = recordTree(records), out = {week};
  for (const key of KEYS) {
    if (PROGRESS_KEYS.has(key)) out[key] = n.weeks?.[week]?.[key] || {};
    else if (key === 'runs') out.runs = Object.values(n.runs || {}).sort((a,b) => (a.ts || 0) - (b.ts || 0));
    else if (key === 'customSessions') out[key] = Object.fromEntries(Object.entries(n[key] || {}).map(([k,v]) => [k,Object.values(v)]));
    else if (key === 'deletedSessions') out[key] = Object.fromEntries(Object.entries(n[key] || {}).map(([k,v]) => [k,Object.keys(v).filter(id => v[id])]));
    else if (key === 'sessionExercises') out[key] = Object.fromEntries(Object.entries(n[key] || {}).map(([k,v]) => [k,{ ...v, deleted:Object.keys(v.deleted || {}).filter(id => v.deleted[id]) }]));
    else if (key !== 'week' && n[key] !== undefined) out[key] = n[key];
  }
  return out;
}
export function hasData(records) { return Object.values(records).some(r => !r.deleted && !['week','routine'].includes(r.path[0])); }
export function validateRecord(record) {
  validateJSON(record);
  if (!record || !Array.isArray(record.path) || !record.path.length || record.path.length > 12 || record.path.some(k => typeof k !== 'string' || !k || UNSAFE.has(k))) throw new Error('Registro remoto no válido.');
  if (!KEYS.includes(record.path[0]) && record.path[0] !== 'weeks') throw new Error('Tipo de registro no válido.');
  if (typeof record.deleted !== 'boolean' || (!record.deleted && !Object.hasOwn(record,'value'))) throw new Error('Registro incompleto.');
  return record;
}
export function parseBackup(input, week = currentWeek()) {
  validateJSON(input);
  if (input?.format && (input.format !== 'gymtrack-backup' || input.version !== 1)) throw new Error('Versión de respaldo no compatible.');
  const payload = input?.format ? input.payload : input;
  const records = toRecords(payload,week);
  if (input?.format && input.history) {
    validateJSON(input.history);
    for (const [w,data] of Object.entries(input.history)) {
      validatePayload({week:w,...data});
      Object.assign(records,toRecords({week:w,...data},week));
    }
  }
  return records;
}
