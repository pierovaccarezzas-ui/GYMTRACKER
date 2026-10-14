// Portable recovery formats. Never evaluate source text or mutate storage here.
const MAX_BYTES = 20 * 1024 * 1024;
const ROOT_KEYS = new Set(['week','done','custom','addedEx','deletedEx','runs','routine','setProgress','sessionExercises','warmupDone','customSessions','deletedSessions','sessionWarmups','todaySelection','routineOrder','sessionMeta','legacyArchive']);
const forbidden = new Set(['__proto__','constructor','prototype']);
function validateTree(value, depth = 0) {
  if (depth > 30) throw new Error('El respaldo tiene demasiados niveles.');
  if (value && typeof value === 'object') for (const [key,child] of Object.entries(value)) {
    if (forbidden.has(key)) throw new Error('El respaldo contiene campos no permitidos.');
    validateTree(child, depth + 1);
  }
}
function parseCSV(text) {
  const rows = []; let row = [], cell = '', quoted = false, afterQuote = false;
  for (let i=0;i<text.length;i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i+1] === '"') { cell += '"'; i++; }
      else if (char === '"') { quoted = false; afterQuote = true; }
      else cell += char;
    } else if (char === '"' && !cell && !afterQuote) quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; afterQuote = false; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i+1] === '\n') i++;
      row.push(cell); if (row.some(v=>v.trim())) rows.push(row); row=[];cell='';afterQuote=false;
    } else {
      if (afterQuote || char === '"') throw new Error('CSV inválido: comillas sin escapar.');
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV incompleto: falta cerrar una celda entre comillas.');
  row.push(cell); if (row.some(v=>v.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('El CSV no contiene datos.');
  const headers=rows.shift().map(v=>v.trim());
  if (new Set(headers).size!==headers.length || headers.some(h=>forbidden.has(h))) throw new Error('Cabeceras de CSV inválidas.');
  if (!headers.includes('payload')) throw new Error('Necesitamos el CSV de gymtrack_state que contiene la columna payload.');
  return rows.map(values=>{
    if (values.length!==headers.length) throw new Error('El CSV tiene filas con columnas incompletas.');
    return Object.fromEntries(headers.map((h,i)=>[h,values[i]]));
  });
}
function parsePayload(value) {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { throw new Error('La columna payload no contiene JSON válido.'); }
  }
  return value;
}
export function parseBackupFile(text) {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error('El respaldo supera los 20 MB.');
  const clean=text.replace(/^\uFEFF/,'').trim();
  if (!clean) throw new Error('El archivo está vacío.');
  let data;
  if (clean.startsWith('{') || clean.startsWith('[')) {
    try { data=JSON.parse(clean); } catch { throw new Error('El archivo JSON está incompleto o no es válido.'); }
  } else data=parseCSV(clean);
  validateTree(data);
  let payload, history, archive, source='Respaldo local', sourceUser=null;
  if (data?.format === 'gymtrack-supabase-export') {
    if (data.version!==1 || !data.tables || !Array.isArray(data.tables.gymtrack_state)) throw new Error('Formato de exportación Supabase no compatible.');
    archive=data.tables; data=data.tables.gymtrack_state;
  }
  if (Array.isArray(data)) {
    if (data.length!==1 || !data[0]?.payload) throw new Error('Elige una exportación con una sola fila de gymtrack_state. No se mezclarán cuentas automáticamente.');
    data=data[0];
  }
  if (data?.format) {
    if (data.format!=='gymtrack-backup' || data.version!==1) throw new Error('Versión o formato del respaldo no compatible.');
    payload=data.payload; history=data.history;
  } else if (data?.payload) {
    source='Exportación de Supabase';sourceUser=data.user_id || null;payload=parsePayload(data.payload);
  } else payload=data;
  if (!payload || typeof payload!=='object' || Array.isArray(payload) || !Object.keys(payload).some(k=>ROOT_KEYS.has(k))) throw new Error('El archivo no contiene datos de GymTrack reconocibles.');
  validateTree(payload); validateTree(history);
  // Retain unknown source fields in the archive rather than silently dropping them.
  const known=Object.fromEntries(Object.entries(payload).filter(([k])=>ROOT_KEYS.has(k)));
  const unknown=Object.fromEntries(Object.entries(payload).filter(([k])=>!ROOT_KEYS.has(k)));
  if (archive) {
    for (const rows of Object.values(archive)) {
      if (!Array.isArray(rows) || rows.some(row=>row.user_id && row.user_id!==sourceUser)) throw new Error('El respaldo incluye datos de otras cuentas. Exporta una cuenta por archivo.');
    }
  }
  if (archive || Object.keys(unknown).length) known.legacyArchive={...(known.legacyArchive || {}),...(archive?{supabase:archive}:{}),...(Object.keys(unknown).length?{unknown}: {})};
  if (archive?.exercise_history) {
    history=structuredClone(history || {});
    for (const row of archive.exercise_history) {
      if (typeof row.week_id!=='string' || !/^\d{4}-W\d{2}$/.test(row.week_id) || typeof row.exercise_id!=='string' || forbidden.has(row.exercise_id)) throw new Error('Historial con identificadores inválidos.');
      const week=history[row.week_id] ||= {setProgress:{}};
      week.setProgress ||= {};
      week.setProgress[row.exercise_id]=Number(row.completed_sets) || 0;
    }
  }
  const result={format:'gymtrack-backup',version:1,payload:known,...(history?{history}:{})};
  return {data:result,source,counts:{runs:Array.isArray(known.runs)?known.runs.length:0,sessions:known.sessionExercises?Object.keys(known.sessionExercises).length:0,history:archive?.exercise_history?.length || 0}};
}
export function describeBackup(candidate) {
  return `${candidate.source}: ${candidate.counts.sessions} sesiones personalizadas, ${candidate.counts.runs} carreras y ${candidate.counts.history} registros de historial archivados.`;
}
