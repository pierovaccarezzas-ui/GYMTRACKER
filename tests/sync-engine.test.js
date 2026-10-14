import {setImmediate} from 'node:timers';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createEngine} from '../src/sync/engine.js';
import {toRecords,toPayload,recordTree,parseBackup,recordId} from '../src/sync/model.js';
const WEEK = '2026-W42';
const storage = (initial = {}) => {
  const data = new Map(Object.entries(initial).map(([k,v]) => [k,JSON.stringify(v)]));
  return {data,getItem:k => data.get(k) ?? null,setItem:(k,v) => data.set(k,v)};
};
const wait = () => new Promise(resolve => setImmediate(resolve));
function transport() {
  const watchers = [], writes = [];
  return {watchers,writes,
    subscribe(uid,next,error) { const w = {uid,next,error,stopped:false}; watchers.push(w); return () => {w.stopped=true;}; },
    write(uid,records) { return new Promise((resolve,reject) => {writes.push({uid,records,resolve,reject});}); },
    send(records = {},meta = {fromCache:false,hasPendingWrites:false},index = watchers.length - 1) { watchers[index].next(records,meta); },
  };
}
function setup(initial = {}) { const db = storage(initial), cloud = transport(), statuses = []; const engine = createEngine({storage:db,transport:cloud,week:() => WEEK}); const stop = engine.sync.start({uid:'alice'},s => statuses.push(s)); return {...engine,db,cloud,statuses,stop}; }

test('legacy snapshot preserved before migration and source week stays in history',() => {
  const db = storage({week:'2026-W40',setProgress:{ua1:3},sessionExercises:{upperA:{overrides:{ua1:{target:'40kg'}}}}});
  const {store,sync} = createEngine({storage:db,week:() => WEEK});
  assert.deepEqual(store.snapshot().setProgress,{});
  assert.equal(sync.exportBackup().history['2026-W40'].setProgress.ua1,3);
  assert.equal(store.snapshot().sessionExercises.upperA.overrides.ua1.target,'40kg');
  assert.equal(JSON.parse(db.getItem('week')),'2026-W40');
  assert.ok([...db.data.keys()].some(k => k.startsWith('gymtrack:v2:recovery:')));
});
test('codec separates run and custom session identities and individual override fields',() => {
  const payload = {week:WEEK,runs:[{ts:1,km:2},{ts:2,km:3}],customSessions:{principal:[{id:'s1',label:'A',exercises:[]},{id:'s2',label:'B'}]},sessionExercises:{a:{order:['x'],deleted:['z'],added:{x:{id:'x',name:'X'}},overrides:{x:{target:'30kg',reps:'8'}}}}};
  const records = toRecords(payload);
  assert.ok(records[recordId(['runs','1'])]);
  assert.ok(records[recordId(['customSessions','principal','s1'])]);
  assert.ok(records[recordId(['sessionExercises','a','overrides','x','target'])]);
  assert.deepEqual(toPayload(records,WEEK).runs,payload.runs);
  assert.deepEqual(toPayload(records,WEEK).sessionExercises,payload.sessionExercises);
});
test('local edit survives restart with durable queue and no provider',async () => {
  const db = storage(); const a = createEngine({storage:db,week:() => WEEK});
  await a.store.set('setProgress',{ua1:2});
  const b = createEngine({storage:db,week:() => WEEK});
  assert.equal(b.store.snapshot().setProgress.ua1,2);
  assert.equal(Object.keys(JSON.parse(db.getItem('gymtrack:v2:guest')).pending).length,1);
});
test('first login requires explicit adoption of legacy data; cache is insufficient',async () => {
  const x = setup({week:WEEK,setProgress:{ua1:2}});
  x.cloud.send({}, {fromCache:true,hasPendingWrites:false});
  await assert.rejects(x.sync.adoptLocal(),/Espera/);
  x.cloud.send({}); await wait();
  assert.equal(x.statuses.at(-1).state,'conflict'); assert.equal(x.cloud.writes.length,0);
  await x.sync.adoptLocal(); await wait();
  assert.equal(x.cloud.writes.length,1); assert.equal(x.statuses.at(-1).state,'pending');
  x.cloud.writes[0].resolve(); await wait();
  assert.equal(x.statuses.at(-1).state,'synced'); x.sync.dispose();
});
test('fresh device adopts cloud without writing it back',async () => {
  const x = setup(); x.cloud.send(toRecords({week:WEEK,setProgress:{ub1:3}})); await wait();
  assert.equal(x.store.snapshot().setProgress.ub1,3); assert.equal(x.cloud.writes.length,0);
  assert.equal(x.statuses.at(-1).state,'synced'); x.sync.dispose();
});
test('cloud application notifies without creating a local write echo',async () => {
  const x = setup(); const received=[]; x.store.subscribe(p => received.push(p));
  x.cloud.send(toRecords({week:WEEK,runs:[{ts:1,km:3}]})); await wait();
  assert.equal(received.at(-1).runs[0].km,3); assert.equal(x.cloud.writes.length,0); x.sync.dispose();
});
test('old acknowledgment cannot remove a newer edit; independent remote edit survives',async () => {
  const x = setup(); x.cloud.send({});
  await x.store.set('setProgress',{ua1:1}); await wait();
  const first = x.cloud.writes[0];
  await x.store.set('setProgress',{ua1:2});
  x.cloud.send(toRecords({week:WEEK,setProgress:{ua1:0,ub1:4}}));
  assert.deepEqual(x.store.snapshot().setProgress,{ua1:2,ub1:4});
  first.resolve(); await wait();
  assert.equal(x.cloud.writes.length,2);
  const second = x.cloud.writes[1];
  assert.equal(Object.values(second.records)[0].value,2);
  assert.equal(x.statuses.at(-1).state,'pending');
  second.resolve(); await wait(); assert.equal(x.statuses.at(-1).state,'synced'); x.sync.dispose();
});
test('cached/local-pending snapshots never claim synchronization',async () => {
  const x = setup(); x.cloud.send({}, {fromCache:true,hasPendingWrites:false});
  assert.equal(x.statuses.at(-1).state,'connecting');
  x.cloud.send({}); await x.store.set('setProgress',{ua1:2}); await wait();
  x.cloud.send(toRecords({week:WEEK,setProgress:{ua1:2}}),{fromCache:false,hasPendingWrites:true});
  assert.equal(x.statuses.at(-1).state,'pending'); x.sync.dispose();
});
test('account switches isolate pending data and ignore old callbacks/acknowledgments',async () => {
  const x = setup(); x.cloud.send({}); await x.store.set('setProgress',{ua1:2}); await wait();
  const oldWrite = x.cloud.writes[0]; x.sync.start({uid:'bob'});
  assert.deepEqual(x.store.snapshot().setProgress,{});
  x.cloud.send(toRecords({week:WEEK,setProgress:{ub1:4}}));
  x.cloud.send(toRecords({week:WEEK,setProgress:{ua1:99}}),undefined,0);
  oldWrite.resolve(); await wait();
  assert.deepEqual(x.store.snapshot().setProgress,{ub1:4});
  assert.ok(JSON.parse(x.db.getItem('gymtrack:v2:user:alice')).pending[recordId(['weeks',WEEK,'setProgress','ua1'])]);
  assert.equal(x.cloud.writes.length,1); x.sync.dispose();
});
test('deleting a run writes a tombstone for that run, preserving other runs',async () => {
  const x = setup(); x.cloud.send(toRecords({week:WEEK,runs:[{ts:1,km:2},{ts:2,km:3}]}));
  await x.store.set('runs',[{ts:2,km:3}]); await wait();
  const write = x.cloud.writes[0];
  assert.equal(Object.keys(write.records).length,1); assert.equal(write.records[recordId(['runs','1'])].deleted,true);
  x.cloud.send(toRecords({week:WEEK,runs:[{ts:1,km:2},{ts:2,km:3},{ts:3,km:4}]}));
  assert.deepEqual(x.store.snapshot().runs.map(r => r.ts),[2,3]); x.sync.dispose();
});
test('current-week edit never deletes old-week history',async () => {
  const x = setup(); x.cloud.send({...toRecords({week:'2026-W41',setProgress:{ua1:4}}),...toRecords({week:WEEK,setProgress:{ua1:1}})});
  await x.store.set('setProgress',{}); await wait();
  assert.equal(x.sync.exportBackup().history['2026-W41'].setProgress.ua1,4);
  assert.deepEqual(Object.values(x.cloud.writes[0].records).map(r => r.path[1]),[WEEK]); x.sync.dispose();
});
test('import is idempotent, preserves unrelated records, and backup history round-trips',async () => {
  const x = setup(); x.cloud.send(toRecords({week:WEEK,runs:[{ts:1,km:2}]}));
  const backup = {format:'gymtrack-backup',version:1,payload:{week:WEEK,runs:[{ts:2,km:3}],legacyArchive:{exercise_history:[{week_id:'2026-W41'}]}},history:{'2026-W41':{setProgress:{ua1:4}}}};
  await x.sync.importBackup(backup); await wait();
  assert.deepEqual(x.store.snapshot().runs.map(r => r.ts),[1,2]);
  const before = JSON.parse(x.db.getItem('gymtrack:v2:user:alice')).pending;
  await x.sync.importBackup(backup);
  assert.deepEqual(JSON.parse(x.db.getItem('gymtrack:v2:user:alice')).pending,before);
  const exported = x.sync.exportBackup();
  assert.deepEqual(recordTree(parseBackup(exported,WEEK)).weeks,exported.history);
  assert.deepEqual(exported.payload.legacyArchive,backup.payload.legacyArchive); x.sync.dispose();
});
test('malformed/prototype-pollution backup rejected before mutation',async () => {
  const x = setup(); x.cloud.send({}); const before = x.db.getItem('gymtrack:v2:user:alice');
  await assert.rejects(x.sync.importBackup(JSON.parse('{"setProgress":{"__proto__":{"polluted":true}}}')),/Clave/);
  await assert.rejects(x.sync.importBackup({runs:{oops:1}}),/lista/);
  await assert.rejects(x.sync.importBackup({runs:[{km:2}]}),/identificador/);
  await assert.rejects(x.sync.importBackup({sessionExercises:[]}));
  assert.equal(x.db.getItem('gymtrack:v2:user:alice'),before); assert.equal({}.polluted,undefined); x.sync.dispose();
});
test('storage quota error rolls back mutation and keeps honest error status',async () => {
  const x = setup(); x.cloud.send({}); x.db.setItem = () => {throw new Error('QuotaExceededError');};
  assert.equal(await x.store.set('setProgress',{ua1:3}),false);
  assert.deepEqual(x.store.snapshot().setProgress,{}); assert.equal(x.statuses.at(-1).state,'error');
  assert.equal(x.cloud.writes.length,0); x.sync.dispose();
});
test('permission failure retains queue and allows local edits',async () => {
  const x = setup(); x.cloud.send({}); await x.store.set('setProgress',{ua1:1}); await wait();
  x.cloud.writes[0].reject(new Error('permission-denied')); await wait();
  assert.equal(x.statuses.at(-1).state,'error'); assert.equal(Object.keys(JSON.parse(x.db.getItem('gymtrack:v2:user:alice')).pending).length,1);
  await x.store.set('setProgress',{ua1:2}); assert.equal(x.store.snapshot().setProgress.ua1,2); x.sync.dispose();
});
test('secondary tab read-only guard preserves durable data',async () => {
  const db = storage(), statuses=[]; const x = createEngine({storage:db,canWrite:async () => false}); x.sync.start(null,s => statuses.push(s));
  assert.equal(await x.store.set('setProgress',{ua1:2}),false); assert.deepEqual(x.store.snapshot().setProgress,{});
  assert.match(statuses.at(-1).message,/solo lectura/); x.sync.dispose();
});

test('remote independent change during async local save is not overwritten by stale UI fields',async () => {
  const x = setup(); x.cloud.send(toRecords({week:WEEK,setProgress:{ua1:0,ub1:0}}));
  const saving = x.store.set('setProgress',{ua1:1,ub1:0});
  x.cloud.send(toRecords({week:WEEK,setProgress:{ua1:0,ub1:4}}));
  await saving; await wait();
  assert.deepEqual(x.store.snapshot().setProgress,{ua1:1,ub1:4});
  assert.equal(Object.keys(x.cloud.writes[0].records).length,1); x.sync.dispose();
});
test('cached data after authoritative data cannot regress a confirmed record',() => {
  const x = setup(); x.cloud.send(toRecords({week:WEEK,setProgress:{ua1:4}}));
  x.cloud.send(toRecords({week:WEEK,setProgress:{ua1:1}}),{fromCache:true,hasPendingWrites:false});
  assert.equal(x.store.snapshot().setProgress.ua1,4); x.sync.dispose();
});
test('unknown imported source fields remain exportable in the legacy archive',async () => {
  const x = setup(); x.cloud.send({});
  await x.sync.importBackup({week:WEEK,runs:[],futureField:{notes:'keep'}});
  assert.equal(x.sync.exportBackup().payload.legacyArchive.unknownPayloadFields.futureField.notes,'keep'); x.sync.dispose();
});

test('retry restores a listener terminated by permission failure',async () => {
  const x=setup(); x.cloud.watchers[0].error(new Error('permission-denied'));
  assert.equal(x.statuses.at(-1).state,'error');
  await x.store.set('setProgress',{ua1:3});
  assert.equal(x.cloud.writes.length,0);
  x.sync.retry(); assert.equal(x.cloud.watchers.length,2);
  x.cloud.send({}); await wait(); assert.equal(x.cloud.writes.length,1); x.sync.dispose();
});
test('UID-scoped pending delta survives restart and resumes after server read',async () => {
  const x=setup(); x.cloud.send({}); await x.store.set('setProgress',{ua1:2}); await wait(); x.sync.dispose();
  const cloud=transport(), statuses=[];
  const restarted=createEngine({storage:x.db,transport:cloud,week:() => WEEK});
  restarted.sync.start({uid:'alice'},s => statuses.push(s));
  assert.equal(restarted.store.snapshot().setProgress.ua1,2); assert.equal(cloud.writes.length,0);
  cloud.send(toRecords({week:WEEK,setProgress:{ub1:4}})); await wait();
  assert.deepEqual(restarted.store.snapshot().setProgress,{ua1:2,ub1:4});
  assert.equal(cloud.writes.length,1); cloud.writes[0].resolve(); await wait();
  assert.equal(statuses.at(-1).state,'synced'); restarted.sync.dispose();
});
