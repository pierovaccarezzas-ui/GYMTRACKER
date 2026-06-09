import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Pencil, X, Trash2, Plus } from "lucide-react";

// ── STORAGE ───────────────────────────────────────────────────────────────
const store = {
  async get(k) {
    try { if (window.storage?.get) { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } } catch {}
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  async set(k, v) {
    try { if (window.storage?.set) { await window.storage.set(k, JSON.stringify(v)); return; } } catch {}
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  },
};
function isoWeek() {
  const d = new Date(), t = new Date(d);
  t.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const y = t.getFullYear(), y1 = new Date(y, 0, 4);
  return `${y}-W${String(1 + Math.round(((t - y1) / 864e5 - 3 + ((y1.getDay() + 6) % 7)) / 7)).padStart(2,"0")}`;
}

// ── TOKENS ────────────────────────────────────────────────────────────────
const BG  = "#E9DFC8"; const C1 = "#F7F1E4"; const C2 = "#E1D5BD"; const C3 = "#C9BDA5";
const BR  = "#17150F"; const TX = "#17150F"; const TX2 = "#5B554A"; const MU = "#847B6A";
const GN  = "#6D9D73"; const PINK = "#E5482F"; const YELLOW = "#E5482F";
const FBB = "'Inter','Arial Black',Arial,sans-serif";
const FD  = "'Inter',system-ui,-apple-system,'Segoe UI',sans-serif";
const FM  = "'IBM Plex Mono','SFMono-Regular',Consolas,monospace";
const HAIR = "rgba(23,21,15,.18)";
const PANEL = { background:C1, border:`1px solid ${HAIR}`, borderRadius:0, boxShadow:"none" };
const INPUT = { fontFamily:FM, fontSize:12, fontWeight:500, background:C1, border:`1px solid ${BR}`, borderRadius:0, padding:"13px 12px", color:TX, width:"100%", minHeight:48 };
const ACTION = { minHeight:48, border:`1px solid ${BR}`, borderRadius:0, boxShadow:"none", color:TX, fontFamily:FM, fontWeight:500, fontSize:10, letterSpacing:1, textTransform:"uppercase", cursor:"pointer" };
const MONO = { fontFamily:FM, fontSize:10, fontWeight:500, letterSpacing:1.25, textTransform:"uppercase" };

// ── RUTINA PRINCIPAL ──────────────────────────────────────────────────────
const MAIN = [
  { id:"upperA", label:"UPPER A", sub:"Fuerza",        day:1, c1:"#FF512F", c2:"#DD2476", anyOne:false, exercises:[
    { id:"ua1", name:"Press Banca Mancuernas",    type:"strength", sets:4, reps:"6–8",   target:"35 kg/mano" },
    { id:"ua2", name:"Remo con Barra",            type:"strength", sets:4, reps:"6–8",   target:"20 kg/lado" },
    { id:"ua3", name:"Press Militar de Pie",      type:"strength", sets:3, reps:"6–8",   target:"20 kg" },
    { id:"ua4", name:"Dominadas / Jalón Pecho",   type:"strength", sets:3, reps:"6–8",   target:"BW / 77 kg" },
    { id:"ua5", name:"Curl Bíceps + Ext. Tríceps",type:"strength", sets:3, reps:"10",    target:"30 kg / Prog.", note:"Superserie" },
  ]},
  { id:"lower",  label:"LOWER",   sub:"Cuád + Gemelos", day:2, c1:"#1A78FF", c2:"#7928CA", anyOne:false, exercises:[
    { id:"lo1", name:"Sentadilla con Barra",       type:"strength", sets:4, reps:"6–8",   target:"100 kg" },
    { id:"lo2", name:"Prensa de Piernas",          type:"strength", sets:3, reps:"8–10",  target:"Pies juntos y abajo" },
    { id:"lo3", name:"Peso Muerto Rumano",         type:"strength", sets:3, reps:"8–10",  target:"Prog. desde 60 kg" },
    { id:"lo4", name:"Gemelos de Pie",             type:"strength", sets:4, reps:"12–15", target:"Prog." },
    { id:"lo5", name:"Gemelos Sentado (máquina)",  type:"strength", sets:3, reps:"15",    target:"Prog." },
    { id:"lo6", name:"Plancha",                    type:"strength", sets:3, reps:"45 s",  target:"45 seg" },
  ]},
  { id:"upperB", label:"UPPER B", sub:"Hipertrofia",    day:4, c1:"#FF8C00", c2:"#FF4500", anyOne:false, exercises:[
    { id:"ub1", name:"Press Inclinado Mancuernas", type:"strength", sets:4, reps:"8–10",  target:"25 kg/mano" },
    { id:"ub2", name:"Remo Mancuerna Unilateral",  type:"strength", sets:4, reps:"10",    target:"20 kg/lado" },
    { id:"ub3", name:"Vuelos Laterales",           type:"strength", sets:3, reps:"12–15", target:"7.5–10 kg" },
    { id:"ub4", name:"Jalón al Pecho",             type:"strength", sets:3, reps:"10",    target:"77 kg" },
    { id:"ub5", name:"Curl Bíceps + Fondos",       type:"strength", sets:3, reps:"10",    target:"30 kg / BW", note:"Superserie" },
  ]},
  { id:"hiit",   label:"HIIT",    sub:"Deporte",         day:5, c1:"#FF0080", c2:"#7928CA", anyOne:true, exercises:[
    { id:"hi1", name:"Fútbol / Básquet",           type:"cardio", target:"45–60 min · MAX intensidad" },
    { id:"hi2", name:"Ciclismo Estático",          type:"cardio", target:"8×(1 min máx + 1 min rec) · ~25 min" },
    { id:"hi3", name:"Trote Rápido",               type:"cardio", target:"20–30 min · 12+ km/h · < 5:00 min/km" },
  ]},
  { id:"z2",     label:"Z2",      sub:"Cardio Opcional", day:6, c1:"#4A90E2", c2:"#7B68EE", anyOne:false, exercises:[
    { id:"z1",  name:"Trote Suave Zona 2",         type:"cardio", target:"45–60 min · 8–8.5 km/h · 7:03–7:30 min/km · FC < 150" },
  ]},
];

// ── RUTINA MANTENIMIENTO ──────────────────────────────────────────────────
const MANT = [
  { id:"m-fba", label:"FULL BODY A", sub:"Mantenimiento", day:1, c1:"#E53E3E", c2:"#DD6B20", anyOne:false,
    sessionNote:"⏱  Descanso máx 90 seg · El peso NO baja",
    exercises:[
      { id:"mfa1", name:"Press Banca Mancuernas",  type:"strength", sets:3, reps:"6–8",  target:"Mismo peso de siempre" },
      { id:"mfa2", name:"Sentadilla o Prensa",     type:"strength", sets:3, reps:"6–8",  target:"Mismo peso de siempre" },
      { id:"mfa3", name:"Remo con Barra / Jalón",  type:"strength", sets:3, reps:"8–10", target:"Mismo peso de siempre" },
    ]},
  { id:"m-fbb", label:"FULL BODY B", sub:"Mantenimiento", day:3, c1:"#2B6CB0", c2:"#553C9A", anyOne:false,
    sessionNote:"⏱  Descanso máx 90 seg · El peso NO baja",
    exercises:[
      { id:"mfb1", name:"Press Militar de Pie",     type:"strength", sets:3, reps:"8",    target:"Mismo peso de siempre" },
      { id:"mfb2", name:"Peso Muerto Convencional", type:"strength", sets:3, reps:"5",    target:"Mismo peso de siempre" },
      { id:"mfb3", name:"Dominadas / Jalón",        type:"strength", sets:3, reps:"8–10", target:"BW / 77 kg" },
    ]},
  { id:"m-hiit",label:"HIIT",         sub:"Deporte",      day:5, c1:"#FF0080", c2:"#7928CA", anyOne:true, exercises:[
    { id:"mhi1", name:"Ciclismo Estático",          type:"cardio", target:"3 cal + 8×(40s MAX / 20s rec) · ~25 min" },
    { id:"mhi2", name:"Fútbol / Básquet",           type:"cardio", target:"MAX intensidad" },
    { id:"mhi3", name:"Trote Rápido",               type:"cardio", target:"20 min · 12+ km/h" },
  ]},
  { id:"m-z2",  label:"Z2 OPCIONAL",  sub:"Cardio",       day:6, c1:"#4A90E2", c2:"#7B68EE", anyOne:false, exercises:[
    { id:"mz1",  name:"Trote Suave Zona 2",         type:"cardio", target:"30 min · 8–8.5 km/h · FC < 150" },
  ]},
];

const ALL_FLAT = [...MAIN, ...MANT];
const DAY_S  = ["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];
const DAY_F  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const T_CLR  = { strength:"#E5482F", cardio:"#477E93", plyo:"#75628B", warmup:"#A06E2F" };
const T_LBL  = { strength:"Fuerza", cardio:"Cardio", plyo:"Plyo", warmup:"Calentamiento" };
const RUN_TYPES = [
  { id:"hiit", label:"HIIT", color:"#FF0080" },
  { id:"finisher", label:"Z2 Finisher", color:"#4A9EFF" },
  { id:"z2", label:"Zona 2", color:"#00D084" },
];

// ── UTILS ─────────────────────────────────────────────────────────────────
function raceTime(paceStr, km) {
  const [m, s] = paceStr.split(":").map(Number);
  const min = (m + s / 60) * km, h = Math.floor(min / 60), mm = Math.floor(min % 60);
  return h > 0 ? `${h}h${String(mm).padStart(2,"0")}` : `${Math.floor(min)}:${String(Math.round((min%1)*60)).padStart(2,"0")}`;
}
function migrateLegacy(custom = {}, addedEx = {}, deletedEx = [], allSessions = []) {
  const migrated = {};
  allSessions.forEach(session => {
    const addedList = addedEx[session.id] || [];
    const relevantIds = new Set([...session.exercises.map(ex => ex.id), ...addedList.map(ex => ex.id)]);
    migrated[session.id] = {
      order: [...session.exercises.map(ex => ex.id), ...addedList.map(ex => ex.id)],
      overrides: Object.fromEntries(Object.entries(custom).filter(([id]) => relevantIds.has(id))),
      added: Object.fromEntries(addedList.map(ex => [ex.id, ex])),
      deleted: deletedEx.filter(id => relevantIds.has(id)),
    };
  });
  return migrated;
}

function resolveSession(session, seForSession = {}) {
  const base = Object.fromEntries(session.exercises.map(ex => [ex.id, ex]));
  const added = seForSession.added || {};
  const overrides = seForSession.overrides || {};
  const deleted = new Set(seForSession.deleted || []);
  const baseIds = session.exercises.map(ex => ex.id);
  const addedIds = Object.keys(added);
  const seed = Array.isArray(seForSession.order) ? seForSession.order : [...baseIds, ...addedIds];
  const order = [...new Set(seed)].filter(id => base[id] || added[id]);

  baseIds.forEach(id => {
    if (!order.includes(id) && !deleted.has(id)) order.push(id);
  });
  addedIds.forEach(id => {
    if (!order.includes(id)) order.push(id);
  });

  const visibleOrder = order.filter(id => !deleted.has(id));
  return {
    order: visibleOrder,
    items: visibleOrder.map(id => ({ ...(base[id] || added[id]), ...(overrides[id] || {}) })),
  };
}

function exTotal(ex) {
  return Math.max(1, Number(ex.sets) || 1);
}

function exProgress(ex, setProgress) {
  return Math.min(exTotal(ex), Math.max(0, Number(setProgress[ex.id]) || 0));
}

function exDone(ex, setProgress) {
  return exProgress(ex, setProgress) >= exTotal(ex);
}

function sessProgress(sess, setProgress, sessionExercises) {
  const items = resolveSession(sess, sessionExercises[sess.id]).items;
  if (sess.anyOne) {
    const complete = items.some(ex => exDone(ex, setProgress));
    return { dn:complete ? 1 : 0, tot:1, pct:complete ? 100 : 0 };
  }
  const dn = items.filter(ex => exDone(ex, setProgress)).length;
  const ratio = items.reduce((sum, ex) => sum + exProgress(ex, setProgress) / exTotal(ex), 0);
  return { dn, tot:items.length, pct:items.length ? Math.round((ratio / items.length) * 100) : 0 };
}

// ── RING ──────────────────────────────────────────────────────────────────
function Ring({ pct, c1, size = 52, thick = 4 }) {
  const r = (size - thick * 2) / 2, circ = 2 * Math.PI * r, d = Math.max(0, pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:"block", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill={C1} stroke={BR} strokeWidth={thick}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c1} strokeWidth={thick}
        strokeDasharray={`${d} ${circ}`} strokeLinecap="butt"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:"stroke-dasharray .5s ease" }}/>
    </svg>
  );
}

// ── ADD EXERCISE FORM ─────────────────────────────────────────────────────
function AddExForm({ sessionId, onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("strength");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [tgt,  setTgt ] = useState("");
  const inp = INPUT;
  const save = () => {
    if (!name.trim()) return;
    onAdd(sessionId, { id:`cx-${Date.now()}`, name:name.trim(), type, sets:type==="cardio"?undefined:parseInt(sets)||3, reps:type==="cardio"?undefined:reps, target:tgt });
  };
  return (
    <div style={{ ...PANEL, background:C1, padding:18, marginBottom:16, borderTop:`3px solid ${PINK}` }}>
      <div style={{ ...MONO, color:PINK, marginBottom:8 }}>FORM / NUEVO</div>
      <div style={{ fontFamily:FBB, fontSize:26, fontWeight:800, letterSpacing:-1, marginBottom:18 }}>Nuevo ejercicio</div>
      <div style={{ ...MONO, color:TX2, marginBottom:6 }}>Nombre</div>
      <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Leg Extension" style={{ ...inp, marginBottom:10 }}/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
        {["strength","cardio","plyo","warmup"].map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{ ...ACTION, flex:1, minWidth:80, background:type===t?BR:C1, color:type===t?C1:TX, borderColor:type===t?BR:HAIR }}>
            {T_LBL[t]}
          </button>
        ))}
      </div>
      {type !== "cardio" && (
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ ...MONO, color:TX2, marginBottom:6 }}>Series</div>
            <input type="number" value={sets} onChange={e=>setSets(e.target.value)} style={inp}/>
          </div>
          <div style={{ flex:2 }}>
            <div style={{ ...MONO, color:TX2, marginBottom:6 }}>Reps</div>
            <input type="text" value={reps} onChange={e=>setReps(e.target.value)} style={inp}/>
          </div>
        </div>
      )}
      <div style={{ ...MONO, color:TX2, marginBottom:6 }}>Objetivo / Peso</div>
      <input type="text" value={tgt} onChange={e=>setTgt(e.target.value)} placeholder="Ej: 20 kg" style={{ ...inp, marginBottom:12 }}/>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={save} style={{ ...ACTION, flex:2, background:PINK, color:C1, borderColor:PINK }}>Agregar</button>
        <button onClick={onCancel} style={{ ...ACTION, flex:1, background:C1, boxShadow:"none" }}>Cancelar</button>
      </div>
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────
function ExCard({ ex, index, progress, done, c1, onToggleSimple, onToggleSet, isEdited, onSaveOverride, onDelete, onMove, isFirst, isLast }) {
  const [editing, setEditing] = useState(false);
  const [delCfm,  setDelCfm ] = useState(false);
  const [showSets, setShowSets] = useState(false);
  const [fName,   setFName  ] = useState(ex.name);
  const [fType,   setFType  ] = useState(ex.type);
  const [fSets,   setFSets  ] = useState(String(ex.sets || ""));
  const [fReps,   setFReps  ] = useState(ex.reps || "");
  const [fTarget, setFTarget] = useState(ex.target || "");

  const startEditing = () => {
    setFName(ex.name); setFType(ex.type); setFSets(String(ex.sets||"")); setFReps(ex.reps||""); setFTarget(ex.target||"");
    setEditing(true); setDelCfm(false);
  };

  const save = () => {
    const f = { name:fName.trim() || ex.name, type:fType, target:fTarget };
    if (fType !== "cardio") { f.sets = parseInt(fSets) || ex.sets || 1; f.reps = fReps; }
    else { f.sets = null; f.reps = ""; }
    onSaveOverride(ex.id, f); setEditing(false);
  };
  const tclr = T_CLR[ex.type] || T_CLR.strength;
  const hasSets = ex.type !== "cardio" && !!ex.sets;
  const moveStyle = disabled => ({ width:42, height:42, background:"transparent", border:`1px solid ${disabled?HAIR:BR}`, borderRadius:0, cursor:disabled?"default":"pointer", color:disabled?MU:TX, display:"flex", alignItems:"center", justifyContent:"center" });

  return (
    <>
    <div style={{ ...PANEL, background:done?"#E0E8D9":C1, marginBottom:0, overflow:"hidden", borderLeft:"none", borderRight:"none", borderBottom:`1px solid ${HAIR}`, transition:"background .2s" }}>
      {delCfm && (
        <div style={{ background:"rgba(220,38,38,0.12)", padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid rgba(220,38,38,0.25)` }}>
          <span style={{ fontSize:11, color:"#FCA5A5" }}>¿Borrar este ejercicio?</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onDelete} style={{ ...ACTION, background:PINK, color:C1, borderColor:PINK, padding:"4px 12px" }}>Sí</button>
            <button onClick={() => setDelCfm(false)} style={{ ...ACTION, background:C1, padding:"4px 12px" }}>No</button>
          </div>
        </div>
      )}
      <div style={{ display:"flex" }}>
        <div style={{ width:48, padding:"17px 10px", fontFamily:FM, fontSize:11, color:done?GN:PINK, borderRight:`1px solid ${HAIR}`, flexShrink:0 }}>{String(index + 1).padStart(2,"0")}</div>
        <div style={{ flex:1, padding:"16px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div onClick={()=>hasSets && !editing && setShowSets(true)} style={{ flex:1, paddingRight:8, cursor:hasSets?"pointer":"default" }}>
              <div style={{ fontSize:18, fontWeight:750, letterSpacing:-.5, color:TX, lineHeight:1.16 }}>{ex.name}</div>
              {!editing && <>
                <div style={{ display:"flex", gap:5, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ ...MONO, fontSize:9, color:tclr }}>{T_LBL[ex.type] || "Fuerza"}</span>
                  {ex.sets && <span style={{ ...MONO, fontSize:9, color:TX2 }}>SET {String(progress).padStart(2,"0")} / {String(ex.sets).padStart(2,"0")}</span>}
                  {ex.reps && <span style={{ ...MONO, fontSize:9, color:TX2 }}>REP {ex.reps}</span>}
                  {ex.note && <span style={{ ...MONO, fontSize:8, color:PINK }}>{ex.note}</span>}
                  {isEdited && <span style={{ ...MONO, fontSize:8, color:PINK }}>Editado</span>}
                </div>
                <div style={{ ...MONO, fontSize:9, color:TX2, marginTop:8 }}>→ {ex.target || "Sin objetivo"}</div>
                {ex.sets && <div style={{ display:"flex", gap:3, marginTop:8 }}>
                  {Array.from({ length:Math.min(ex.sets, 8) }).map((_,i) => (
                    <div key={i} style={{ flex:1, maxWidth:36, height:3, background:i<progress?PINK:C3, transition:`all .3s ${i*0.04}s` }}/>
                  ))}
                </div>}
              </>}
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
              <button onClick={()=>hasSets?setShowSets(true):onToggleSimple()} style={{ width:48, height:48, borderRadius:0, background:done?BR:PINK, border:`1px solid ${done?BR:PINK}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C1, transition:"all .2s" }}>
                {done ? <Check size={19} strokeWidth={3}/> : <span style={{ fontFamily:FBB, fontSize:hasSets?18:24 }}>{hasSets?`${progress}/${ex.sets}`:"+"}</span>}
              </button>
            </div>
          </div>
          {!editing && <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:7, marginTop:12 }}>
            <button aria-label="Subir ejercicio" title="Subir ejercicio" disabled={isFirst} onClick={()=>onMove(-1)} style={moveStyle(isFirst)}><ChevronUp size={17}/></button>
            <button aria-label="Bajar ejercicio" title="Bajar ejercicio" disabled={isLast} onClick={()=>onMove(1)} style={moveStyle(isLast)}><ChevronDown size={17}/></button>
            <button aria-label="Editar ejercicio" onClick={startEditing} style={moveStyle(false)}><Pencil size={16}/></button>
            <button aria-label="Borrar ejercicio" onClick={() => setDelCfm(!delCfm)} style={{ ...moveStyle(false), background:delCfm?PINK:C1 }}><Trash2 size={16}/></button>
          </div>}
          {editing && (
            <div style={{ marginTop:12, borderTop:`2px solid ${BR}`, paddingTop:12 }}>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:9, color:MU, letterSpacing:1, marginBottom:4 }}>NOMBRE</div>
                <input type="text" value={fName} onChange={e=>setFName(e.target.value)} style={INPUT}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
                {["strength","cardio","plyo","warmup"].map(t => <button key={t} onClick={()=>setFType(t)} style={{ ...ACTION, background:fType===t?T_CLR[t]:C1, boxShadow:"none", fontSize:9 }}>{T_LBL[t]}</button>)}
              </div>
              {fType !== "cardio" && (
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:9, color:MU, letterSpacing:1, marginBottom:4 }}>SERIES</div>
                    <input type="number" value={fSets} onChange={e=>setFSets(e.target.value)} style={INPUT}/>
                  </div>
                  <div style={{ flex:2 }}>
                    <div style={{ fontSize:9, color:MU, letterSpacing:1, marginBottom:4 }}>REPS</div>
                    <input type="text" value={fReps} onChange={e=>setFReps(e.target.value)} style={INPUT}/>
                  </div>
                </div>
              )}
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:9, color:MU, letterSpacing:1, marginBottom:4 }}>OBJETIVO / PESO</div>
                <input type="text" value={fTarget} onChange={e=>setFTarget(e.target.value)} style={INPUT}/>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={save} style={{ ...ACTION, flex:2, background:c1 }}>Guardar</button>
                <button onClick={()=>setEditing(false)} style={{ ...ACTION, flex:1, background:C1, boxShadow:"none" }}><X size={17}/></button>
                {isEdited && <button onClick={() => { onSaveOverride(ex.id, null); setEditing(false); }} style={{ ...ACTION, flex:1, background:YELLOW, boxShadow:"none" }}>Reset</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    {showSets && hasSets && (
      <div onClick={()=>setShowSets(false)} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(23,21,15,.72)", padding:18, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
        <div onClick={e=>e.stopPropagation()} style={{ ...PANEL, width:"100%", maxWidth:444, background:BG, padding:20, borderTop:`4px solid ${PINK}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:12, borderBottom:`1px solid ${BR}`, paddingBottom:16, marginBottom:16 }}>
            <div><div style={{ ...MONO, color:PINK }}>{T_LBL[ex.type]} / SET TRACKER</div><div style={{ fontFamily:FBB, fontSize:30, fontWeight:800, letterSpacing:-1.2, lineHeight:1.05, marginTop:8 }}>{ex.name}</div></div>
            <button aria-label="Cerrar series" onClick={()=>setShowSets(false)} style={{ ...ACTION, width:48, background:C1, boxShadow:"none" }}><X size={20}/></button>
          </div>
          <div style={{ ...MONO, fontSize:11, marginBottom:12 }}>PROGRESO / {String(progress).padStart(2,"0")} DE {String(ex.sets).padStart(2,"0")}</div>
          <div style={{ display:"grid", gap:8 }}>
            {Array.from({ length:ex.sets }).map((_, index) => {
              const checked = index < progress;
              return <button key={index} onClick={()=>onToggleSet(index)} style={{ ...ACTION, minHeight:58, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", background:checked?BR:C1, color:checked?C1:TX, borderColor:checked?BR:HAIR }}>
                <span>SET {String(index + 1).padStart(2,"0")}</span><span style={{ display:"flex", alignItems:"center", gap:8 }}>{ex.reps && `${ex.reps} REP`}{checked && <Check size={18} strokeWidth={2}/>}</span>
              </button>;
            })}
          </div>
          <button onClick={()=>setShowSets(false)} style={{ ...ACTION, width:"100%", background:PINK, color:C1, borderColor:PINK, marginTop:14 }}>Cerrar / Listo</button>
        </div>
      </div>
    )}
    </>
  );
}

// ── SESSION VIEW ──────────────────────────────────────────────────────────
function SessionView({ session, setProgress, sessionExercises, onSaveOverride, onToggleSimple, onToggleSet, onAddEx, onDeleteEx, onMoveEx }) {
  const [showAdd, setShowAdd] = useState(false);
  const { items } = resolveSession(session, sessionExercises[session.id]);
  const { dn, tot, pct } = sessProgress(session, setProgress, sessionExercises);
  const totalSets = items.reduce((a,e)=>a+(e.sets||0),0);
  const overrides = sessionExercises[session.id]?.overrides || {};
  return (
    <div>
      <div style={{ background:C1, borderBottom:`1px solid ${BR}`, padding:"28px 20px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", left:0, top:0, width:"100%", height:7, background:session.c1 }}/>
        <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ ...MONO, color:PINK, marginBottom:10 }}>01 / SESIÓN ACTIVA</div>
            <div style={{ fontFamily:FBB, fontSize:"clamp(48px,15vw,68px)", fontWeight:850, letterSpacing:-3.5, lineHeight:.86, maxWidth:300 }}>{session.label}</div>
            <div style={{ ...MONO, color:TX2, marginTop:14 }}>{DAY_S[session.day]} / {session.sub}</div>
          </div>
          <div style={{ position:"relative", width:58, height:58, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ring pct={pct} c1={PINK} size={58} thick={3}/>
            <div style={{ position:"absolute", textAlign:"center" }}>
              {pct===100 ? <Check size={17} strokeWidth={2}/> : <div style={{ fontFamily:FM, fontSize:10 }}>{pct}%</div>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", position:"relative", marginTop:24, background:"transparent", borderTop:`1px solid ${BR}`, borderBottom:`1px solid ${BR}`, overflow:"hidden" }}>
          {[{v:`${dn}/${tot}`,l:"ejercicios"},{v:String(totalSets||"—"),l:"series"},{v:pct===100?"LISTO":`${tot-dn} left`,l:pct===100?"":"restantes"}].map((s,i)=>(
            <div key={i} style={{ flex:1, padding:"12px 4px", borderRight:i<2?`1px solid ${HAIR}`:"none" }}>
              <div style={{ fontFamily:FM, fontSize:15, fontWeight:500, lineHeight:1 }}>{s.v}</div>
              <div style={{ ...MONO, fontSize:7, color:MU, marginTop:5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"18px 14px 24px" }}>
        {session.sessionNote && <div style={{ ...MONO, fontSize:9, color:TX2, background:C2, padding:"10px 12px", marginBottom:12, borderLeft:`3px solid ${PINK}` }}>{session.sessionNote}</div>}
        {session.anyOne && <div style={{ ...MONO, fontSize:9, color:MU, background:C1, padding:"10px 12px", marginBottom:12, border:`1px solid ${HAIR}` }}>Elige <strong style={{ color:TX2 }}>cualquiera</strong> de las opciones</div>}
        <div style={{ ...MONO, display:"flex", justifyContent:"space-between", color:TX2, borderBottom:`1px solid ${BR}`, paddingBottom:9 }}><span>02 / EJERCICIOS</span><span>{String(items.length).padStart(2,"0")} ITEMS</span></div>
        {items.map((ex, index) => <ExCard key={ex.id} ex={ex} index={index} progress={exProgress(ex,setProgress)} done={exDone(ex,setProgress)} c1={session.c1} onToggleSimple={()=>onToggleSimple(ex)} onToggleSet={setIndex=>onToggleSet(ex,setIndex)} isEdited={!!overrides[ex.id]} onSaveOverride={(id,fields)=>onSaveOverride(session.id,id,fields)} onDelete={()=>onDeleteEx(session.id,ex.id)} onMove={dir=>onMoveEx(session.id,ex.id,dir)} isFirst={index===0} isLast={index===items.length-1}/>)}
        {showAdd
          ? <AddExForm sessionId={session.id} onAdd={(sid,ex)=>{ onAddEx(sid,ex); setShowAdd(false); }} onCancel={()=>setShowAdd(false)}/>
          : <button onClick={()=>setShowAdd(true)} style={{ ...ACTION, width:"100%", background:C2, borderStyle:"dashed", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Plus size={14}/> Agregar ejercicio
            </button>
        }
      </div>
    </div>
  );
}

// ── HOY ───────────────────────────────────────────────────────────────────
function HoyView({ today, sessions, setProgress, onToggleSimple, onToggleSet, sessionExercises, onSaveOverride, onAddEx, onDeleteEx, onMoveEx }) {
  const session = sessions.find(s => s.day === today);
  if (!session) {
    const next = (() => { for(let i=1;i<=7;i++){const d=(today+i)%7;const s=sessions.find(x=>x.day===d);if(s)return{s,n:DAY_F[d]};} return null; })();
    return (
      <div style={{ padding:"30px 18px" }}>
        <div style={{ marginBottom:32, borderBottom:`1px solid ${BR}`, paddingBottom:24 }}>
          <div style={{ ...MONO, color:PINK, marginBottom:12 }}>01 / ESTADO</div>
          <div style={{ fontFamily:FBB, fontSize:58, fontWeight:850, letterSpacing:-3, color:TX, lineHeight:.9 }}>DESCANSO</div>
          <div style={{ ...MONO, color:MU, marginTop:14 }}>{DAY_F[today]} / RECUPERACIÓN ACTIVA</div>
        </div>
        {next && <div style={{ ...PANEL, overflow:"hidden", marginBottom:16 }}>
          <div style={{ height:10, background:next.s.c1, borderBottom:`2px solid ${BR}` }}/>
          <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ ...MONO, color:PINK, marginBottom:7 }}>02 / PRÓXIMA SESIÓN</div>
              <div style={{ fontFamily:FBB, fontSize:26, fontWeight:800, letterSpacing:-1 }}>{next.s.label}</div>
              <div style={{ ...MONO, fontSize:9, color:TX2, marginTop:5 }}>{next.n} / {next.s.sub}</div>
            </div>
            <div style={{ fontSize:11, color:TX2 }}>{resolveSession(next.s, sessionExercises[next.s.id]).items.length} ej.</div>
          </div>
        </div>}
        <div style={{ ...PANEL, padding:"14px 16px" }}>
          <div style={{ ...MONO, color:PINK, marginBottom:12 }}>03 / RECUPERACIÓN</div>
          {["1.8–2g proteína / kg peso","7–9 horas de sueño","35 ml agua × kg peso","20 min caminata si aplica"].map((t,i) => (
            <div key={i} style={{ fontSize:12, color:TX2, padding:"10px 0", borderTop:i>0?`1px solid ${HAIR}`:"none", display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontFamily:FM, color:PINK, fontSize:9 }}>{String(i+1).padStart(2,"0")}</span>{t}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ ...MONO, color:MU, padding:"12px 18px 0" }}>{DAY_F[today]} / MONITOREO ACTIVO</div>
      <SessionView session={session} setProgress={setProgress} sessionExercises={sessionExercises} onSaveOverride={onSaveOverride} onToggleSimple={onToggleSimple} onToggleSet={onToggleSet} onAddEx={onAddEx} onDeleteEx={onDeleteEx} onMoveEx={onMoveEx}/>
    </div>
  );
}

// ── SEMANA ────────────────────────────────────────────────────────────────
function SemanaView({ sessions, setProgress, onToggleSimple, onToggleSet, sessionExercises, onSaveOverride, onAddEx, onDeleteEx, onMoveEx, semId, setSemId }) {
  const idx = semId ? sessions.findIndex(s => s.id === semId) : -1;
  const session = idx >= 0 ? sessions[idx] : null;
  if (session) {
    const prev = idx > 0 ? sessions[idx-1] : null, next = idx < sessions.length-1 ? sessions[idx+1] : null;
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderBottom:`1px solid ${HAIR}` }}>
          <button onClick={()=>setSemId(prev?prev.id:null)} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", color:TX2, cursor:"pointer", fontFamily:FD, fontSize:12, fontWeight:500, padding:0 }}>
            <ChevronLeft size={14}/>{prev ? prev.label : "Semana"}
          </button>
          {next && <button onClick={()=>setSemId(next.id)} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", color:TX2, cursor:"pointer", fontFamily:FD, fontSize:12, fontWeight:500, padding:0 }}>
            {next.label}<ChevronRight size={14}/>
          </button>}
        </div>
        <SessionView session={session} setProgress={setProgress} sessionExercises={sessionExercises} onSaveOverride={onSaveOverride} onToggleSimple={onToggleSimple} onToggleSet={onToggleSet} onAddEx={onAddEx} onDeleteEx={onDeleteEx} onMoveEx={onMoveEx}/>
      </div>
    );
  }
  return (
    <div style={{ padding:14 }}>
      <div style={{ ...MONO, color:PINK, marginBottom:10 }}>02 / SEMANA COMPLETA</div>
      <div style={{ fontFamily:FBB, fontSize:42, fontWeight:850, letterSpacing:-2.5, lineHeight:.95, marginBottom:24 }}>PLAN DE<br/>ENTRENAMIENTO</div>
      {sessions.map((s, sessionIndex) => {
        const { pct } = sessProgress(s, setProgress, sessionExercises);
        const { items } = resolveSession(s, sessionExercises[s.id]);
        return (
          <div key={s.id} onClick={()=>setSemId(s.id)} style={{ ...PANEL, marginBottom:0, overflow:"hidden", cursor:"pointer", display:"flex", borderLeft:"none", borderRight:"none", borderBottom:`1px solid ${HAIR}` }}>
            <div style={{ width:48, padding:"15px 10px", fontFamily:FM, fontSize:11, color:PINK, borderRight:`1px solid ${HAIR}`, flexShrink:0 }}>{String(sessionIndex+1).padStart(2,"0")}</div>
            <div style={{ flex:1, padding:"14px 14px 14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{ fontFamily:FBB, fontSize:22, fontWeight:800, letterSpacing:-.8, lineHeight:1 }}>{s.label}</div>
                  {pct===100 && <div style={{ background:GN, color:TX, border:`1.5px solid ${BR}`, fontSize:8, fontWeight:900, padding:"3px 7px" }}>LISTO</div>}
                </div>
                <div style={{ ...MONO, fontSize:9, color:TX2, marginTop:6 }}>{DAY_S[s.day]} / {s.sub}</div>
                <div style={{ display:"flex", gap:3, marginTop:8 }}>
                  {items.map(e => (
                    <div key={e.id} style={{ width:10, height:7, background:exDone(e,setProgress)?GN:T_CLR[e.type]||T_CLR.strength, border:`1px solid ${BR}`, opacity:exProgress(e,setProgress)>0?1:.45, transition:"all .2s" }}/>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ position:"relative", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ring pct={pct} c1={PINK} size={44} thick={3}/>
                  <div style={{ position:"absolute", textAlign:"center" }}>
                    {pct===100 ? <Check size={13} color={GN} strokeWidth={3}/> : <div style={{ fontFamily:FBB, fontSize:12, color:TX }}>{pct}<span style={{ fontSize:7 }}>%</span></div>}
                  </div>
                </div>
                <ChevronRight size={14} color={MU}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── CARRERAS ──────────────────────────────────────────────────────────────
function CarrerasView({ runs, rkm, setRkm, rmin, setRmin, rsec, setRsec, rtype, setRtype, pace, onCalc, onSave, onDelete, onClear }) {
  const [cfm, setCfm] = useState(false);
  const toS = s => { const [m,p]=s.split(":").map(Number); return m*60+p; };
  const best = runs.length ? runs.reduce((b,r) => toS(r.pace) < toS(b.pace) ? r : b) : null;
  const inp = INPUT;
  return (
    <div style={{ padding:"20px 14px" }}>
      <div style={{ ...MONO, color:PINK, marginBottom:10 }}>03 / REGISTRO DE CARRERAS</div>
      <div style={{ fontFamily:FBB, fontSize:42, fontWeight:850, letterSpacing:-2.5, lineHeight:.95, marginBottom:24 }}>VELOCIDAD<br/>Y DISTANCIA</div>
      {best && (
        <div style={{ ...PANEL, overflow:"hidden", marginBottom:16 }}>
          <div style={{ height:10, background:RUN_TYPES.find(t=>t.id===best.type)?.color||GN, borderBottom:`2px solid ${BR}` }}/>
          <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ ...MONO, color:MU, marginBottom:7 }}>MEJOR PACE / PB</div>
              <div style={{ fontFamily:FBB, fontSize:38, fontWeight:850, letterSpacing:-2, color:PINK, lineHeight:1 }}>{best.pace}<span style={{ fontSize:10, fontFamily:FM, color:TX2 }}> MIN/KM</span></div>
              <div style={{ ...MONO, fontSize:8, color:TX2, marginTop:6 }}>{best.km} KM / {best.date}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:FBB, fontSize:20, color:TX }}>{best.kmh}<span style={{ fontSize:11, fontFamily:FD, color:TX2 }}> km/h</span></div>
              <div style={{ display:"flex", gap:8, marginTop:8, justifyContent:"flex-end" }}>
                {[{d:5,l:"5K"},{d:10,l:"10K"},{d:21,l:"21K"}].map(r => (
                  <div key={r.d} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:FBB, fontSize:14, color:r.d===21?GN:TX }}>{raceTime(best.pace, r.d)}</div>
                    <div style={{ fontSize:8, color:MU }}>{r.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ ...PANEL, padding:16, marginBottom:16 }}>
        <div style={{ ...MONO, color:PINK, marginBottom:16 }}>FORM / NUEVA CARRERA</div>
        <div style={{ ...MONO, color:TX2, marginBottom:6 }}>Distancia / KM</div>
        <input type="number" value={rkm} onChange={e=>setRkm(e.target.value)} placeholder="5.0" step="0.1" style={inp}/>
        <div style={{ ...MONO, color:TX2, margin:"14px 0 6px" }}>Tiempo total</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="number" value={rmin} onChange={e=>setRmin(e.target.value)} placeholder="min" style={{ ...inp, textAlign:"center" }}/>
          <span style={{ color:MU, fontSize:20 }}>:</span>
          <input type="number" value={rsec} onChange={e=>setRsec(e.target.value)} placeholder="seg" style={{ ...inp, textAlign:"center" }}/>
        </div>
        <button onClick={onCalc} style={{ ...ACTION, background:PINK, color:C1, borderColor:PINK, width:"100%", marginTop:12 }}>Calcular pace</button>
        {pace && (
          <div style={{ ...PANEL, marginTop:12, background:C2, padding:"14px 16px", boxShadow:"none" }}>
            <div style={{ fontFamily:FBB, fontSize:40, fontWeight:850, letterSpacing:-2, color:PINK, lineHeight:1 }}>{pace.pace}<span style={{ fontSize:10, fontFamily:FM, color:TX2 }}> MIN/KM</span></div>
            <div style={{ ...MONO, fontSize:9, color:TX2, marginTop:7 }}>{pace.kmh} KM/H / {pace.km} KM</div>
            <div style={{ display:"flex", marginTop:10, border:`1px solid ${BR}`, overflow:"hidden" }}>
              {[{d:5,l:"5K"},{d:10,l:"10K"},{d:21,l:"21K 🎯"},{d:42,l:"42K"}].map((r,i) => (
                <div key={r.d} style={{ flex:1, padding:"8px 0", textAlign:"center", borderRight:i<3?`1px solid ${BR}`:"none", background:r.d===21?"rgba(0,208,132,0.07)":"transparent" }}>
                  <div style={{ fontFamily:FBB, fontSize:14, color:r.d===21?GN:TX }}>{raceTime(pace.pace, r.d)}</div>
                  <div style={{ fontSize:8, color:MU, marginTop:2 }}>{r.l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:10, color:MU, letterSpacing:1, margin:"12px 0 8px" }}>TIPO DE SESIÓN</div>
            <div style={{ display:"flex", gap:6 }}>
              {RUN_TYPES.map(t => (
                <button key={t.id} onClick={()=>setRtype(t.id)} style={{ ...ACTION, flex:1, background:rtype===t.id?BR:C1, color:rtype===t.id?C1:TX }}>{t.label}</button>
              ))}
            </div>
            <button onClick={onSave} style={{ ...ACTION, background:PINK, color:C1, borderColor:PINK, width:"100%", marginTop:12 }}>Guardar / Confirmar</button>
          </div>
        )}
      </div>
      {runs.length > 0 ? (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ ...MONO, color:MU }}>HISTORIAL / {String(runs.length).padStart(2,"0")}</div>
            {!cfm
              ? <button onClick={()=>setCfm(true)} style={{ background:"none", border:"none", cursor:"pointer", color:MU, fontSize:10, display:"flex", alignItems:"center", gap:4 }}><Trash2 size={12}/>Borrar todo</button>
              : <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:TX2 }}>¿Seguro?</span>
                  <button onClick={()=>{onClear();setCfm(false);}} style={{ ...ACTION, minHeight:40, background:PINK, color:C1, borderColor:PINK, padding:"4px 10px" }}>Sí</button>
                  <button onClick={()=>setCfm(false)} style={{ ...ACTION, minHeight:40, background:C1, padding:"4px 10px" }}>No</button>
                </div>
            }
          </div>
          {[...runs].reverse().map((r, i) => {
            const tInfo = RUN_TYPES.find(t => t.id === r.type);
            return (
              <div key={i} style={{ ...PANEL, padding:"12px 14px", marginBottom:0, display:"flex", justifyContent:"space-between", alignItems:"center", borderLeft:"none", borderRight:"none", borderBottom:`1px solid ${HAIR}` }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <div style={{ fontFamily:FBB, fontSize:24, fontWeight:800, letterSpacing:-1, lineHeight:1 }}>{r.pace}<span style={{ fontSize:9, fontFamily:FM, fontWeight:400, color:TX2 }}> MIN/KM</span></div>
                    {tInfo && <span style={{ ...MONO, fontSize:7, color:tInfo.color }}>{tInfo.label}</span>}
                  </div>
                  <div style={{ fontSize:10, color:TX2 }}>{r.date} · {r.km} km · {r.kmh} km/h</div>
                </div>
                <button onClick={()=>onDelete(runs.length-1-i)} style={{ background:"none", border:"none", cursor:"pointer", color:MU, padding:4, display:"flex" }}><Trash2 size={14}/></button>
              </div>
            );
          })}
          <div style={{ fontSize:9, color:MU, textAlign:"center", marginTop:8 }}>Guardado en este dispositivo</div>
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"32px 0", color:MU }}>
          <div style={{ fontSize:12, fontWeight:500 }}>Sin registros aún</div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function GymTracker() {
  const [tab,       setTab      ] = useState("hoy");
  const [routine,   setRoutine  ] = useState("principal");
  const [setProgress, setSetProgress] = useState({});
  const [sessionExercises, setSessionExercises] = useState({});
  const [runs,      setRuns     ] = useState([]);
  const [loaded,    setLoaded   ] = useState(false);
  const [semId,     setSemId    ] = useState(null);
  const [rkm,setRkm]=useState(""); const [rmin,setRmin]=useState(""); const [rsec,setRsec]=useState("");
  const [rtype,setRtype]=useState("z2"); const [pace,setPace]=useState(null);

  useEffect(() => {
    (async () => {
      try {
        const w = isoWeek();
        const [sw,sd,ssp,sse,sr,srt,sc,sa,sdel] = await Promise.all([
          store.get("week"), store.get("done"), store.get("setProgress"), store.get("sessionExercises"),
          store.get("runs"), store.get("routine"), store.get("custom"),
          store.get("addedEx"), store.get("deletedEx"),
        ]);
        const nextSessionExercises = sse ?? migrateLegacy(sc||{}, sa||{}, sdel||[], ALL_FLAT);
        setSessionExercises(nextSessionExercises);
        if (sse === null) await store.set("sessionExercises", nextSessionExercises);
        let nextProgress = ssp || {};
        if (sw !== w) {
          nextProgress = {};
          await store.set("week",w);
          await store.set("setProgress",nextProgress);
        } else if (ssp === null && sd) {
          nextProgress = {};
          ALL_FLAT.forEach(session => resolveSession(session,nextSessionExercises[session.id]).items.forEach(ex => {
            nextProgress[ex.id] = sd[ex.id] ? exTotal(ex) : 0;
          }));
          await store.set("setProgress",nextProgress);
        }
        setSetProgress(nextProgress);
        setRuns(sr||[]);
        if (srt) setRoutine(srt);
        setLoaded(true);
      } catch (err) {
        console.error("Error al cargar datos de almacenamiento local:", err);
        // Fallback: usar datos vacíos para que la app cargue de todas formas
        setSetProgress({});
        setSessionExercises({});
        setRuns([]);
        setLoaded(true);
      }
    })();
  }, []);

  const saveSetProgress = async n => { setSetProgress(n); await store.set("setProgress",n); };
  const toggleSimple = async ex => {
    const n = { ...setProgress, [ex.id]:exDone(ex,setProgress) ? 0 : 1 };
    await saveSetProgress(n);
  };
  const toggleSet = async (ex, index) => {
    const current = exProgress(ex,setProgress);
    const next = index < current ? index : index + 1;
    await saveSetProgress({ ...setProgress, [ex.id]:next });
  };
  const sessionEntry = sid => {
    const session = ALL_FLAT.find(s => s.id === sid);
    const current = sessionExercises[sid] || {};
    return {
      order: session ? resolveSession(session, current).order : [...(current.order || [])],
      overrides: { ...(current.overrides || {}) },
      added: { ...(current.added || {}) },
      deleted: [...(current.deleted || [])],
    };
  };
  const saveSessionExercises = async n => { setSessionExercises(n); await store.set("sessionExercises",n); };
  const saveOverride = async (sid, id, fields) => {
    const entry = sessionEntry(sid);
    if (fields === null) delete entry.overrides[id];
    else entry.overrides[id] = { ...(entry.overrides[id] || {}), ...fields };
    await saveSessionExercises({ ...sessionExercises, [sid]:entry });
  };
  const addEx = async (sid, ex) => {
    const entry = sessionEntry(sid);
    entry.added[ex.id] = ex;
    if (!entry.order.includes(ex.id)) entry.order.push(ex.id);
    entry.deleted = entry.deleted.filter(id => id !== ex.id);
    await saveSessionExercises({ ...sessionExercises, [sid]:entry });
    await saveSetProgress({ ...setProgress, [ex.id]:0 });
  };
  const deleteEx = async (sid, id) => {
    const session = ALL_FLAT.find(s => s.id === sid);
    const entry = sessionEntry(sid);
    entry.order = entry.order.filter(exId => exId !== id);
    if (session?.exercises.some(ex => ex.id === id)) {
      if (!entry.deleted.includes(id)) entry.deleted.push(id);
    } else {
      delete entry.added[id];
      delete entry.overrides[id];
    }
    await saveSessionExercises({ ...sessionExercises, [sid]:entry });
  };
  const moveEx = async (sid, id, dir) => {
    const entry = sessionEntry(sid);
    const from = entry.order.indexOf(id);
    const to = Math.max(0, Math.min(entry.order.length - 1, from + dir));
    if (from < 0 || from === to) return;
    [entry.order[from], entry.order[to]] = [entry.order[to], entry.order[from]];
    await saveSessionExercises({ ...sessionExercises, [sid]:entry });
  };
  const calcPace = () => { const k=parseFloat(rkm),m=parseInt(rmin)||0,s=parseInt(rsec)||0; if(!k||k<=0||m+s===0)return; const tot=m*60+s,ps=tot/k,pm=Math.floor(ps/60),pr=Math.round(ps%60); setPace({km:k,min:m,sec:s,pace:`${pm}:${String(pr).padStart(2,"0")}`,kmh:(k/(tot/3600)).toFixed(1)}); };
  const saveRun  = async () => { if(!pace)return; const n=[...runs,{...pace,type:rtype,date:new Date().toLocaleDateString("es-CL"),ts:Date.now()}]; setRuns(n); await store.set("runs",n); setPace(null); setRkm(""); setRmin(""); setRsec(""); };
  const deleteRun = async i => { const n=runs.filter((_,j)=>j!==i); setRuns(n); await store.set("runs",n); };
  const clearRuns = async () => { setRuns([]); await store.set("runs",[]); };
  const switchRoutine = async r => { setRoutine(r); setSemId(null); await store.set("routine",r); };

  const activeSessions = routine === "principal" ? MAIN : MANT;
  const todayN = new Date().getDay();
  const activeItems = activeSessions.flatMap(s => resolveSession(s, sessionExercises[s.id]).items);
  const totalEx = activeItems.length, doneEx = activeItems.filter(ex=>exDone(ex,setProgress)).length;
  const progressSum = activeItems.reduce((sum,ex)=>sum + exProgress(ex,setProgress)/exTotal(ex),0);
  const wPct = totalEx ? Math.round((progressSum/totalEx)*100) : 0;

  if (!loaded) return <div style={{background:BG,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FM,fontSize:10,letterSpacing:3,color:MU}}>CARGANDO / 00</div>;

  const sp = { setProgress, onToggleSimple:toggleSimple, onToggleSet:toggleSet, sessionExercises, onSaveOverride:saveOverride, onAddEx:addEx, onDeleteEx:deleteEx, onMoveEx:moveEx };

  return (
    <div style={{ background:BG, fontFamily:FD, color:TX, minHeight:"100vh", maxWidth:480, margin:"0 auto", borderLeft:`1px solid ${HAIR}`, borderRight:`1px solid ${HAIR}`, paddingBottom:"calc(80px + env(safe-area-inset-bottom))" }}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{display:none}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}input:focus,textarea:focus{outline:2px solid ${PINK};outline-offset:1px}button{min-height:48px}.tap:active,button:active{opacity:.68}body{background:${C2}!important}`}</style>

      {/* HEADER */}
      <div style={{ padding:"16px 16px 14px", position:"sticky", top:0, zIndex:90, background:"rgba(233,223,200,.96)", borderBottom:`1px solid ${BR}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:FBB, fontSize:29, fontWeight:900, letterSpacing:-1.7, lineHeight:1 }}>GYM<span style={{ color:PINK }}>TRACK</span></div>
            <div style={{ ...MONO, fontSize:8, color:TX2, marginTop:8 }}>EST. 2026 / {DAY_S[todayN]} / {isoWeek().replace("2026-","")}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:FBB, fontSize:30, fontWeight:850, letterSpacing:-1.5, lineHeight:.9 }}>{wPct}<span style={{ fontSize:10, color:PINK, fontFamily:FM }}>%</span></div>
              <div style={{ ...MONO, fontSize:7, color:MU, marginTop:5 }}>VIGOR / {doneEx}:{totalEx}</div>
            </div>
            <div style={{ position:"relative", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ring pct={wPct} c1={PINK} size={40} thick={3}/>
            </div>
          </div>
        </div>
        {/* ROUTINE SWITCHER */}
        <div style={{ display:"flex", border:`1px solid ${BR}` }}>
          {[{id:"principal",label:"A / Principal"},{id:"mantenimiento",label:"B / Mantenimiento"}].map((r,i) => (
            <button key={r.id} className="tap" onClick={()=>switchRoutine(r.id)}
              style={{ ...ACTION, flex:1, border:"none", borderRight:i===0?`1px solid ${BR}`:"none", background:routine===r.id?BR:"transparent", color:routine===r.id?C1:TX }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <main>
        {tab==="hoy"      && <HoyView today={todayN} sessions={activeSessions} {...sp}/>}
        {tab==="semana"   && <SemanaView sessions={activeSessions} {...sp} semId={semId} setSemId={setSemId}/>}
        {tab==="carreras" && <CarrerasView runs={runs} rkm={rkm} setRkm={setRkm} rmin={rmin} setRmin={setRmin} rsec={rsec} setRsec={setRsec} rtype={rtype} setRtype={setRtype} pace={pace} onCalc={calcPace} onSave={saveRun} onDelete={deleteRun} onClear={clearRuns}/>}
      </main>

      <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, minHeight:"calc(72px + env(safe-area-inset-bottom))", paddingBottom:"env(safe-area-inset-bottom)", background:C1, borderTop:`1px solid ${BR}`, display:"flex", zIndex:100 }}>
        {[{id:"hoy",num:"01",lbl:"Hoy"},{id:"semana",num:"02",lbl:"Semana"},{id:"carreras",num:"03",lbl:"Correr"}].map(t => (
          <button key={t.id} className="tap" onClick={()=>{setTab(t.id);setSemId(null);}} style={{ flex:1, border:"none", borderRight:t.id!=="carreras"?`1px solid ${HAIR}`:"none", borderTop:tab===t.id?`3px solid ${PINK}`:"3px solid transparent", background:tab===t.id?BR:C1, color:tab===t.id?C1:TX, cursor:"pointer", padding:"12px 0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, position:"relative" }}>
            <div style={{ fontFamily:FM, fontSize:8, color:tab===t.id?PINK:MU, letterSpacing:1 }}>{t.num}</div>
            <div style={{ fontFamily:FM, fontSize:10, fontWeight:500, textTransform:"uppercase", letterSpacing:1 }}>{t.lbl}</div>
          </button>
        ))}
      </nav>
    </div>
  );
}
