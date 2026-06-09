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
const BG  = "#F1E8D5"; const C1 = "#FFF9EC"; const C2 = "#E5D8BE"; const C3 = "#D4C4A5";
const BR  = "#181713"; const TX = "#181713"; const TX2 = "#514C42"; const MU = "#776F60";
const GN  = "#8ED081"; const PINK = "#F2A6B3"; const YELLOW = "#F2CD5D";
const FBB = "'Bebas Neue','Impact','Arial Black',Arial,sans-serif";
const FD  = "system-ui,-apple-system,'Segoe UI',sans-serif";
const PANEL = { background:C1, border:`2px solid ${BR}`, borderRadius:3, boxShadow:`4px 4px 0 ${BR}` };
const INPUT = { fontFamily:FD, fontSize:14, fontWeight:600, background:C1, border:`2px solid ${BR}`, borderRadius:2, padding:"12px 11px", color:TX, width:"100%", minHeight:48 };
const ACTION = { minHeight:48, border:`2px solid ${BR}`, borderRadius:2, boxShadow:`3px 3px 0 ${BR}`, color:TX, fontFamily:FD, fontWeight:800, fontSize:12, letterSpacing:.4, cursor:"pointer" };

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
const T_CLR  = { strength:"#EF8354", cardio:"#79B7D9", plyo:"#B99AD9", warmup:"#F2CD5D" };
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
function AddExForm({ sessionId, c1, onAdd, onCancel }) {
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
    <div style={{ ...PANEL, background:C2, padding:14, marginBottom:12 }}>
      <div style={{ fontFamily:FBB, fontSize:20, letterSpacing:2, marginBottom:10 }}>NUEVO EJERCICIO</div>
      <div style={{ fontSize:9, color:TX2, marginBottom:4 }}>Nombre</div>
      <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Leg Extension" style={{ ...inp, marginBottom:10 }}/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
        {["strength","cardio","plyo","warmup"].map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{ ...ACTION, flex:1, minWidth:80, background:type===t?T_CLR[t]:C1, boxShadow:type===t?`3px 3px 0 ${BR}`:"none", fontSize:9 }}>
            {T_LBL[t]}
          </button>
        ))}
      </div>
      {type !== "cardio" && (
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:9, color:TX2, marginBottom:4 }}>Series</div>
            <input type="number" value={sets} onChange={e=>setSets(e.target.value)} style={inp}/>
          </div>
          <div style={{ flex:2 }}>
            <div style={{ fontSize:9, color:TX2, marginBottom:4 }}>Reps</div>
            <input type="text" value={reps} onChange={e=>setReps(e.target.value)} style={inp}/>
          </div>
        </div>
      )}
      <div style={{ fontSize:9, color:TX2, marginBottom:4 }}>Objetivo / Peso</div>
      <input type="text" value={tgt} onChange={e=>setTgt(e.target.value)} placeholder="Ej: 20 kg" style={{ ...inp, marginBottom:12 }}/>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={save} style={{ ...ACTION, flex:2, background:c1 }}>Agregar</button>
        <button onClick={onCancel} style={{ ...ACTION, flex:1, background:C1, boxShadow:"none" }}>Cancelar</button>
      </div>
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────
function ExCard({ ex, progress, done, c1, onToggleSimple, onToggleSet, isEdited, onSaveOverride, onDelete, onMove, isFirst, isLast }) {
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
  const moveStyle = disabled => ({ width:42, height:42, background:disabled?C2:C1, border:`2px solid ${disabled?C3:BR}`, borderRadius:2, cursor:disabled?"default":"pointer", color:disabled?MU:TX, display:"flex", alignItems:"center", justifyContent:"center" });

  return (
    <>
    <div style={{ ...PANEL, background:done?"#DDEBCF":C1, marginBottom:12, overflow:"hidden", transition:"background .2s" }}>
      {delCfm && (
        <div style={{ background:"rgba(220,38,38,0.12)", padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid rgba(220,38,38,0.25)` }}>
          <span style={{ fontSize:11, color:"#FCA5A5" }}>¿Borrar este ejercicio?</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onDelete} style={{ background:"#DC2626", border:"none", borderRadius:5, color:TX, fontSize:10, fontWeight:700, padding:"4px 12px", cursor:"pointer" }}>Sí</button>
            <button onClick={() => setDelCfm(false)} style={{ background:C3, border:`1px solid ${BR}`, borderRadius:5, color:TX2, fontSize:10, padding:"4px 12px", cursor:"pointer" }}>No</button>
          </div>
        </div>
      )}
      <div style={{ display:"flex" }}>
        <div style={{ width:9, background:done?GN:tclr, borderRight:`2px solid ${BR}`, flexShrink:0, transition:"background .2s" }}/>
        <div style={{ flex:1, padding:"12px 12px 12px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div onClick={()=>hasSets && !editing && setShowSets(true)} style={{ flex:1, paddingRight:8, cursor:hasSets?"pointer":"default" }}>
              <div style={{ fontSize:15, fontWeight:900, color:TX, lineHeight:1.3 }}>{ex.name}</div>
              {!editing && <>
                <div style={{ display:"flex", gap:5, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontSize:9, fontWeight:700, color:tclr, letterSpacing:0.5 }}>{T_LBL[ex.type] || "Fuerza"}</span>
                  {ex.sets && <><span style={{ color:MU, fontSize:9 }}>·</span><span style={{ fontSize:10, fontWeight:800, color:TX2 }}>{progress}/{ex.sets} series</span></>}
                  {ex.reps && <><span style={{ color:MU, fontSize:9 }}>·</span><span style={{ fontSize:10, color:TX2 }}>{ex.reps}</span></>}
                  {ex.note && <span style={{ fontSize:8, color:c1, border:`1px solid ${c1}`, borderRadius:10, padding:"1px 6px" }}>{ex.note}</span>}
                  {isEdited && <span style={{ fontSize:8, color:c1, opacity:.7 }}>editado</span>}
                </div>
                <div style={{ fontSize:10, color:TX2, marginTop:6 }}>→ {ex.target}</div>
                {ex.sets && <div style={{ display:"flex", gap:3, marginTop:8 }}>
                  {Array.from({ length:Math.min(ex.sets, 8) }).map((_,i) => (
                    <div key={i} style={{ width:18, height:7, background:i<progress?GN:C2, border:`1px solid ${BR}`, transition:`all .3s ${i*0.04}s` }}/>
                  ))}
                </div>}
              </>}
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
              <button onClick={()=>hasSets?setShowSets(true):onToggleSimple()} style={{ width:48, height:48, borderRadius:2, background:done?GN:C1, border:`2px solid ${BR}`, boxShadow:`3px 3px 0 ${BR}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:TX, transition:"all .2s" }}>
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
      <div onClick={()=>setShowSets(false)} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(24,23,19,.72)", padding:18, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
        <div onClick={e=>e.stopPropagation()} style={{ ...PANEL, width:"100%", maxWidth:444, background:BG, padding:16, boxShadow:`7px 7px 0 ${BR}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:12, borderBottom:`2px solid ${BR}`, paddingBottom:12, marginBottom:12 }}>
            <div><div style={{ fontSize:10, fontWeight:900, letterSpacing:1.4 }}>{T_LBL[ex.type]}</div><div style={{ fontFamily:FBB, fontSize:30, letterSpacing:1.5, lineHeight:1, marginTop:4 }}>{ex.name}</div></div>
            <button aria-label="Cerrar series" onClick={()=>setShowSets(false)} style={{ ...ACTION, width:48, background:C1, boxShadow:"none" }}><X size={20}/></button>
          </div>
          <div style={{ fontFamily:FBB, fontSize:22, letterSpacing:1, marginBottom:10 }}>{progress} / {ex.sets} SERIES LISTAS</div>
          <div style={{ display:"grid", gap:8 }}>
            {Array.from({ length:ex.sets }).map((_, index) => {
              const checked = index < progress;
              return <button key={index} onClick={()=>onToggleSet(index)} style={{ ...ACTION, minHeight:58, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", background:checked?GN:C1, boxShadow:checked?`3px 3px 0 ${BR}`:"none" }}>
                <span>SERIE {index + 1}</span><span style={{ display:"flex", alignItems:"center", gap:8 }}>{ex.reps && `${ex.reps} reps`}{checked && <Check size={20} strokeWidth={3}/>}</span>
              </button>;
            })}
          </div>
          <button onClick={()=>setShowSets(false)} style={{ ...ACTION, width:"100%", background:PINK, marginTop:14 }}>LISTO</button>
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
      <div style={{ background:session.c1, borderBottom:`3px solid ${BR}`, padding:"28px 20px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-35, top:-45, width:150, height:150, border:`3px solid ${BR}`, background:session.c2, transform:"rotate(12deg)" }}/>
        <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:FBB, fontSize:52, letterSpacing:4, lineHeight:0.9 }}>{session.label}</div>
            <div style={{ fontSize:12, fontWeight:800, marginTop:10 }}>{session.sub}</div>
          </div>
          <div style={{ position:"relative", width:58, height:58, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ring pct={pct} c1={GN} size={58} thick={4}/>
            <div style={{ position:"absolute", textAlign:"center" }}>
              {pct===100 ? <Check size={17} strokeWidth={3}/> : <><div style={{ fontFamily:FBB, fontSize:17, lineHeight:1 }}>{pct}</div><div style={{ fontSize:7, opacity:.7 }}>%</div></>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", position:"relative", marginTop:20, background:C1, border:`2px solid ${BR}`, boxShadow:`4px 4px 0 ${BR}`, overflow:"hidden" }}>
          {[{v:`${dn}/${tot}`,l:"ejercicios"},{v:String(totalSets||"—"),l:"series"},{v:pct===100?"LISTO":`${tot-dn} left`,l:pct===100?"":"restantes"}].map((s,i)=>(
            <div key={i} style={{ flex:1, padding:"10px 0", textAlign:"center", borderRight:i<2?`2px solid ${BR}`:"none" }}>
              <div style={{ fontFamily:FBB, fontSize:20, letterSpacing:1, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:9, opacity:.6, marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"12px 14px" }}>
        {session.sessionNote && <div style={{ fontSize:10, color:TX2, background:C2, borderRadius:8, padding:"8px 12px", marginBottom:10, borderLeft:`3px solid ${session.c1}` }}>{session.sessionNote}</div>}
        {session.anyOne && <div style={{ fontSize:10, color:MU, background:C1, borderRadius:8, padding:"8px 12px", marginBottom:10 }}>Elige <strong style={{ color:TX2 }}>cualquiera</strong> de las opciones</div>}
        {items.map((ex, index) => <ExCard key={ex.id} ex={ex} progress={exProgress(ex,setProgress)} done={exDone(ex,setProgress)} c1={session.c1} onToggleSimple={()=>onToggleSimple(ex)} onToggleSet={setIndex=>onToggleSet(ex,setIndex)} isEdited={!!overrides[ex.id]} onSaveOverride={(id,fields)=>onSaveOverride(session.id,id,fields)} onDelete={()=>onDeleteEx(session.id,ex.id)} onMove={dir=>onMoveEx(session.id,ex.id,dir)} isFirst={index===0} isLast={index===items.length-1}/>)}
        {showAdd
          ? <AddExForm sessionId={session.id} c1={session.c1} c2={session.c2} onAdd={(sid,ex)=>{ onAddEx(sid,ex); setShowAdd(false); }} onCancel={()=>setShowAdd(false)}/>
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
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:FBB, fontSize:60, letterSpacing:5, color:C3, lineHeight:1 }}>DESCANSO</div>
          <div style={{ fontSize:12, color:MU, marginTop:8 }}>{DAY_F[today]}</div>
        </div>
        {next && <div style={{ ...PANEL, overflow:"hidden", marginBottom:16 }}>
          <div style={{ height:10, background:next.s.c1, borderBottom:`2px solid ${BR}` }}/>
          <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:9, color:MU, letterSpacing:1.5, marginBottom:5 }}>PRÓXIMA SESIÓN</div>
              <div style={{ fontFamily:FBB, fontSize:24, letterSpacing:2 }}>{next.s.label}</div>
              <div style={{ fontSize:11, color:TX2, marginTop:3 }}>{next.n} · {next.s.sub}</div>
            </div>
            <div style={{ fontSize:11, color:TX2 }}>{resolveSession(next.s, sessionExercises[next.s.id]).items.length} ej.</div>
          </div>
        </div>}
        <div style={{ ...PANEL, padding:"14px 16px" }}>
          <div style={{ fontSize:9, color:MU, letterSpacing:1.5, marginBottom:12 }}>RECUPERACIÓN</div>
          {["1.8–2g proteína / kg peso","7–9 horas de sueño","35 ml agua × kg peso","20 min caminata si aplica"].map((t,i) => (
            <div key={i} style={{ fontSize:12, color:TX2, padding:"7px 0", borderTop:i>0?`1px solid ${BR}`:"none", display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ color:GN, fontSize:9 }}>→</span>{t}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontSize:10, color:MU, padding:"10px 18px 0" }}>{DAY_F[today]}</div>
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
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px 0" }}>
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
      <div style={{ fontSize:10, color:MU, letterSpacing:1, marginBottom:12 }}>SEMANA COMPLETA</div>
      {sessions.map(s => {
        const { pct } = sessProgress(s, setProgress, sessionExercises);
        const { items } = resolveSession(s, sessionExercises[s.id]);
        return (
          <div key={s.id} onClick={()=>setSemId(s.id)} style={{ ...PANEL, marginBottom:12, overflow:"hidden", cursor:"pointer", display:"flex" }}>
            <div style={{ width:10, background:s.c1, borderRight:`2px solid ${BR}`, flexShrink:0 }}/>
            <div style={{ flex:1, padding:"14px 14px 14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{ fontFamily:FBB, fontSize:22, letterSpacing:2, lineHeight:1 }}>{s.label}</div>
                  {pct===100 && <div style={{ background:GN, color:TX, border:`1.5px solid ${BR}`, fontSize:8, fontWeight:900, padding:"3px 7px" }}>LISTO</div>}
                </div>
                <div style={{ fontSize:10, color:TX2 }}>{DAY_S[s.day]} · {s.sub}</div>
                <div style={{ display:"flex", gap:3, marginTop:8 }}>
                  {items.map(e => (
                    <div key={e.id} style={{ width:10, height:7, background:exDone(e,setProgress)?GN:T_CLR[e.type]||T_CLR.strength, border:`1px solid ${BR}`, opacity:exProgress(e,setProgress)>0?1:.45, transition:"all .2s" }}/>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ position:"relative", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ring pct={pct} c1={s.c1} c2={s.c2} size={44} thick={3}/>
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
    <div style={{ padding:14 }}>
      <div style={{ fontSize:10, color:MU, letterSpacing:1, marginBottom:12 }}>REGISTRO DE CARRERAS</div>
      {best && (
        <div style={{ ...PANEL, overflow:"hidden", marginBottom:16 }}>
          <div style={{ height:10, background:RUN_TYPES.find(t=>t.id===best.type)?.color||GN, borderBottom:`2px solid ${BR}` }}/>
          <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:9, color:MU, letterSpacing:1.5, marginBottom:5 }}>MEJOR PACE</div>
              <div style={{ fontFamily:FBB, fontSize:30, letterSpacing:2, color:GN, lineHeight:1 }}>{best.pace}<span style={{ fontSize:12, fontFamily:FD, color:TX2 }}> min/km</span></div>
              <div style={{ fontSize:10, color:TX2, marginTop:4 }}>{best.km} km · {best.date}</div>
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
        <div style={{ fontSize:10, color:MU, letterSpacing:1.5, marginBottom:14 }}>NUEVA CARRERA</div>
        <div style={{ fontSize:10, color:TX2, marginBottom:5 }}>Distancia (km)</div>
        <input type="number" value={rkm} onChange={e=>setRkm(e.target.value)} placeholder="5.0" step="0.1" style={inp}/>
        <div style={{ fontSize:10, color:TX2, margin:"10px 0 5px" }}>Tiempo total</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="number" value={rmin} onChange={e=>setRmin(e.target.value)} placeholder="min" style={{ ...inp, textAlign:"center" }}/>
          <span style={{ color:MU, fontSize:20 }}>:</span>
          <input type="number" value={rsec} onChange={e=>setRsec(e.target.value)} placeholder="seg" style={{ ...inp, textAlign:"center" }}/>
        </div>
        <button onClick={onCalc} style={{ ...ACTION, background:PINK, width:"100%", marginTop:12 }}>Calcular pace</button>
        {pace && (
          <div style={{ ...PANEL, marginTop:12, background:C2, padding:"14px 16px", boxShadow:"none" }}>
            <div style={{ fontFamily:FBB, fontSize:32, letterSpacing:2, color:GN, lineHeight:1 }}>{pace.pace}<span style={{ fontSize:13, fontFamily:FD, color:TX2 }}> min/km</span></div>
            <div style={{ fontSize:11, color:TX2, marginTop:5 }}>{pace.kmh} km/h · {pace.km} km</div>
            <div style={{ display:"flex", marginTop:10, border:`1px solid ${BR}`, borderRadius:8, overflow:"hidden" }}>
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
                <button key={t.id} onClick={()=>setRtype(t.id)} style={{ ...ACTION, flex:1, background:rtype===t.id?t.color:C1, boxShadow:rtype===t.id?`3px 3px 0 ${BR}`:"none", fontSize:10 }}>{t.label}</button>
              ))}
            </div>
            <button onClick={onSave} style={{ ...ACTION, background:GN, width:"100%", marginTop:12 }}>Guardar ✓</button>
          </div>
        )}
      </div>
      {runs.length > 0 ? (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:10, color:MU, letterSpacing:1 }}>HISTORIAL ({runs.length})</div>
            {!cfm
              ? <button onClick={()=>setCfm(true)} style={{ background:"none", border:"none", cursor:"pointer", color:MU, fontSize:10, display:"flex", alignItems:"center", gap:4 }}><Trash2 size={12}/>Borrar todo</button>
              : <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:TX2 }}>¿Seguro?</span>
                  <button onClick={()=>{onClear();setCfm(false);}} style={{ background:"#DC2626", border:"none", borderRadius:5, color:TX, fontSize:10, fontWeight:700, padding:"4px 10px", cursor:"pointer" }}>Sí</button>
                  <button onClick={()=>setCfm(false)} style={{ background:C3, border:"none", borderRadius:5, color:TX2, fontSize:10, padding:"4px 10px", cursor:"pointer" }}>No</button>
                </div>
            }
          </div>
          {[...runs].reverse().map((r, i) => {
            const tInfo = RUN_TYPES.find(t => t.id === r.type);
            return (
              <div key={i} style={{ ...PANEL, padding:"12px 14px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:`3px 3px 0 ${BR}` }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <div style={{ fontFamily:FBB, fontSize:20, letterSpacing:1, lineHeight:1 }}>{r.pace}<span style={{ fontSize:10, fontFamily:FD, fontWeight:400, color:TX2 }}> min/km</span></div>
                    {tInfo && <span style={{ fontSize:8, fontWeight:700, color:tInfo.color, border:`1px solid ${tInfo.color}`, borderRadius:10, padding:"2px 7px" }}>{tInfo.label}</span>}
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
    try { const l=document.createElement("link"); l.rel="stylesheet"; l.href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"; document.head.appendChild(l); } catch {}
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

  if (!loaded) return <div style={{background:BG,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FBB,fontSize:18,letterSpacing:6,color:MU}}>CARGANDO</div>;

  const sp = { setProgress, onToggleSimple:toggleSimple, onToggleSet:toggleSet, sessionExercises, onSaveOverride:saveOverride, onAddEx:addEx, onDeleteEx:deleteEx, onMoveEx:moveEx };

  return (
    <div style={{ background:BG, fontFamily:FD, color:TX, minHeight:"100vh", maxWidth:480, margin:"0 auto", borderLeft:`2px solid ${BR}`, borderRight:`2px solid ${BR}`, paddingBottom:"calc(80px + env(safe-area-inset-bottom))" }}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{display:none}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}input:focus,textarea:focus{outline:3px solid ${PINK};outline-offset:1px}button{min-height:48px}.tap:active,button:active{transform:translate(2px,2px);box-shadow:none!important}body{background:${C2}!important}`}</style>

      {/* HEADER */}
      <div style={{ padding:"16px 16px 12px", position:"sticky", top:0, zIndex:90, background:BG, borderBottom:`3px solid ${BR}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div style={{ fontFamily:FBB, fontSize:27, letterSpacing:2, lineHeight:1 }}>GYM<span style={{ background:PINK, border:`2px solid ${BR}`, padding:"0 4px", marginLeft:3 }}>TRACK</span></div>
            <div style={{ fontSize:10, fontWeight:800, color:TX2, marginTop:7 }}>{DAY_F[todayN]} · {isoWeek()}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:FBB, fontSize:22, letterSpacing:1, lineHeight:1 }}>{wPct}<span style={{ fontSize:11, color:MU, fontFamily:FD }}>%</span></div>
              <div style={{ fontSize:10, color:MU }}>{doneEx}/{totalEx}</div>
            </div>
            <div style={{ position:"relative", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ring pct={wPct} c1={PINK} size={40} thick={4}/>
              <div style={{ position:"absolute", fontFamily:FBB, fontSize:9, color:TX }}>{wPct}</div>
            </div>
          </div>
        </div>
        {/* ROUTINE SWITCHER */}
        <div style={{ display:"flex", gap:8 }}>
          {[{id:"principal",label:"Principal"},{id:"mantenimiento",label:"Mantenimiento"}].map(r => (
            <button key={r.id} className="tap" onClick={()=>switchRoutine(r.id)}
              style={{ ...ACTION, flex:1, background:routine===r.id?YELLOW:C1, boxShadow:routine===r.id?`3px 3px 0 ${BR}`:"none" }}>
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

      <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, minHeight:"calc(72px + env(safe-area-inset-bottom))", paddingBottom:"env(safe-area-inset-bottom)", background:C1, border:`2px solid ${BR}`, borderBottom:"none", display:"flex", zIndex:100 }}>
        {[{id:"hoy",lbl:"Hoy"},{id:"semana",lbl:"Semana"},{id:"carreras",lbl:"Correr"}].map(t => (
          <button key={t.id} className="tap" onClick={()=>{setTab(t.id);setSemId(null);}} style={{ flex:1, border:"none", borderRight:t.id!=="carreras"?`2px solid ${BR}`:"none", background:tab===t.id?PINK:C1, cursor:"pointer", padding:"14px 0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <div style={{ fontFamily:FBB, fontSize:20, color:TX, letterSpacing:1.2 }}>{t.lbl}</div>
          </button>
        ))}
      </nav>
    </div>
  );
}
