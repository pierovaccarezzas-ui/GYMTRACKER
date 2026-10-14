import test from 'node:test';
import assert from 'node:assert/strict';
import {parseBackupFile} from '../src/backup.js';
const payload={week:'2026-W40',sessionExercises:{upperA:{overrides:{ua1:{name:'Press, "lento"\ncon pausa',target:'35 kg'}}}},runs:[{ts:1,km:5}]};
test('Supabase CSV preserves escaped JSON, commas, quotes and multiline cells',()=>{
 const cell=JSON.stringify(payload).replaceAll('"','""');
 assert.deepEqual(parseBackupFile(`user_id,payload,updated_at\r\nu1,"${cell}",2026-10-14`).data.payload,payload);
});
test('full export preserves tables and historical week',()=>{
 const tables={gymtrack_state:[{user_id:'u1',payload}],exercise_history:[{user_id:'u1',week_id:'2026-W40',exercise_id:'ua1',completed_sets:3}]};
 const parsed=parseBackupFile(JSON.stringify({format:'gymtrack-supabase-export',version:1,tables}));
 assert.deepEqual(parsed.data.payload.legacyArchive.supabase,tables);
 assert.equal(parsed.data.history['2026-W40'].setProgress.ua1,3);
});
test('rejects multiple accounts, malformed files and prototype keys without mutating input',()=>{
 for(const input of ['[{"payload":{}},{"payload":{}}]','{"runs":[],"__proto__":{}}','user_id,payload\nu,"bad','{"format":"gymtrack-backup","version":99,"payload":{}}']) assert.throws(()=>parseBackupFile(input));
});
test('portable backup keeps history and rejects unrelated files',()=>{
 const backup={format:'gymtrack-backup',version:1,payload,history:{'2026-W39':{setProgress:{ua1:4}}}};
 assert.deepEqual(parseBackupFile(JSON.stringify(backup)).data,backup);
 assert.throws(()=>parseBackupFile('{"hello":"world"}'));
});
