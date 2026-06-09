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

// ── TOKENS · BRUTALIST CREAM ────────────────────────────────────────────────
const BG  = "#EDE6D6";   // fondo crema
const C1  = "#F5F0E3";   // tarjeta clara
const C2  = "#E7DDC8";   // panel
const C3  = "#DDD0B6";   // relleno
const INK = "#16140F";   // tinta casi-negra (bordes + texto)
const BR  = INK;
const TX  = INK; const TX2 = "#5C5743"; const MU = "#8C8568";
const GN  = "#1C7C4A";   // verde plano (completado)
const SH    = `4px 4px 0 ${INK}`;
const SH_SM = `3px 3px 0 ${INK}`;
const FBB = "'Bebas Neue','Impact','Arial Black',Arial,sans-serif";
const FD  = "system-ui,-apple-system,'Segoe UI',sans-serif";

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
const T_CLR  = { strength:"#FF6B4A", cardio:"#1A78FF", plyo:"#B85CFF", warmup:"#E8913A" };
const T_LBL  = { strength:"Fuerza", cardio:"Cardio", plyo:"Plyo", warmup:"Calentamiento" };
const RUN_TYPES = [
  { id:"hiit", label:"HIIT", color:"#FF0080" },
  { id:"finisher", label:"Z2 Finisher", color:"#1A78FF" },
  { id:"z2", label:"Zona 2", color:GN },
];

// ── UTILS ─────────────────────────────────────────────────────────────────
function raceTime(paceStr, km) {
  const [m, s] = paceStr.split(":").map(Number);
  const min = (m + s / 60) * km, h = Math.floor(min / 60), mm = Math.floor(min % 60);
  return h > 0 ? `${h}h${String(mm).padStart(2,"0")}` : `${Math.floor(min)}:${String(Math.round((min%1)*60)).padStart(2,"0")}`;
}
// Total de series de un ejercicio: Fuerza/Calentamiento usan `sets`; Cardio/sin series = 1.
function exTotalSets(ex) {
  return (ex && ex.type !== "cardio" && ex.sets) ? Number(ex.sets) : 1;
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

// "done" derivado del progreso por series.
function isExDone(ex, setProgress) {
  return (setProgress[ex.id] || 0) >= exTotalSets(ex);
}
function sessProgress(sess, setProgress, sessionExercises) {
  const { items } = resolveSession(sess, sessionExercises[sess.id]);
  const tot = items.length, dn = items.filter(ex => isExDone(ex, setProgress)).length;
  if (sess.anyOne) return { dn: Math.min(dn, 1), tot: 1, pct: dn > 0 ? 100 : 0 };
  return { dn, tot, pct: tot ? Math.round((dn / tot) * 100) : 0 };
}

// ── RING ──────────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 52, thick = 4 }) {
  const r = (size - thick * 2) / 2, circ = 2 * Math.PI * r, d = Math.max(0, pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:"block", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(22,20,15,0.18)" strokeWidth={thick}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thick}
        strokeDasharray={`${d} ${circ}`} strokeLinecap="butt"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:"stroke-dasharray .5s ease" }}/>
    </svg>
  );
}

// ── SET SHEET (marcado serie por serie) ─────────────────────────────────────
function SetSheet({ ex, total, count, accent, onSetCount, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(22,20,15,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:480, background:BG, borderTop:`3px solid ${INK}`, boxShadow:`0 -6px 0 ${INK}`, padding:"18px 16px calc(20px + env(safe-area-inset-bottom))" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ paddingRight:10 }}>
            <div style={{ fontFamily:FBB, fontSize:26, letterSpacing:1.5, lineHeight:1, color:TX, textTransform:"uppercase" }}>{ex.name}</div>
            <div style={{ fontSize:12, color:TX2, marginTop:6, fontWeight:600 }}>{count}/{total} series · → {ex.target}</div>
          </div>
          <button aria-label="Cerrar" onClick={onClose} style={{ width:44, height:44, flexShrink:0, background:C1, border:`2px solid ${INK}`, boxShadow:SH_SM, color:TX, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={20} strokeWidth={3}/>
          </button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
          {Array.from({ length: total }).map((_, i) => {
            const checked = count > i;
            return (
              <button key={i} className="tap" onClick={() => onSetCount(ex.id, count > i ? i : i + 1)}
                style={{ display:"flex", alignItems:"center", gap:14, width:"100%", minHeight:56, padding:"0 14px", textAlign:"left", cursor:"pointer",
                  background: checked ? GN : C1, border:`2px solid ${INK}`, boxShadow: checked ? "none" : SH_SM, color: checked ? "#FFF" : TX }}>
                <span style={{ width:30, height:30, flexShrink:0, border:`2px solid ${checked ? "#FFF" : INK}`, background: checked ? "#FFF" : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {checked && <Check size={18} strokeWidth={3} color={GN}/>}
                </span>
                <span style={{ fontFamily:FBB, fontSize:22, letterSpacing:1 }}>SERIE {i + 1}</span>
                <span style={{ marginLeft:"auto", fontSize:12, fontWeight:700, opacity:.8 }}>{ex.reps || ""}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => onSetCount(ex.id, count >= total ? 0 : total)} style={{ flex:1, minHeight:50, background: count >= total ? C1 : GN, border:`2px solid ${INK}`, boxShadow:SH_SM, color: count >= total ? TX : "#FFF", fontFamily:FD, fontWeight:800, fontSize:14, cursor:"pointer", textTransform:"uppercase", letterSpacing:.5 }}>
            {count >= total ? "Reiniciar" : "Marcar todas"}
          </button>
          <button onClick={onClose} style={{ flex:1, minHeight:50, background:INK, border:`2px solid ${INK}`, color:"#FFF", fontFamily:FD, fontWeight:800, fontSize:14, cursor:"pointer", textTransform:"uppercase", letterSpacing:.5 }}>Listo</button>
        </div>
      </div>
    </div>
  );
}

// ── ADD EXERCISE FORM ─────────────────────────────────────────────────────
function AddExForm({ sessionId, accent, onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("strength");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [tgt,  setTgt ] = useState("");
  const inp = { fontFamily:FD, fontSize:14, background:C1, border:`2px solid ${INK}`, borderRadius:0, padding:"11px 12px", color:TX, width:"100%" };
  const lbl = { fontSize:10, color:TX2, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:5 };
  const save = () => {
    if (!name.trim()) return;
    onAdd(sessionId, { id:`cx-${Date.now()}`, name:name.trim(), type, sets:parseInt(sets)||3, reps, target:tgt });
  };
  return (
    <div style={{ background:C2, border:`2px solid ${INK}`, boxShadow:SH, padding:16, marginBottom:10 }}>
      <div style={{ fontSize:11, color:TX, fontWeight:800, letterSpacing:1.5, marginBottom:12, textTransform:"uppercase" }}>Nuevo ejercicio</div>
      <div style={lbl}>Nombre</div>
      <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Leg Extension" style={{ ...inp, marginBottom:12 }}/>
      <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
        {["strength","warmup","cardio","plyo"].map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{ flex:"1 1 40%", minHeight:42, background:type===t?T_CLR[t]:C1, border:`2px solid ${INK}`, boxShadow:type===t?"none":SH_SM, color:type===t?"#FFF":TX, fontFamily:FD, fontSize:12, fontWeight:700, padding:"8px 4px", cursor:"pointer" }}>
            {T_LBL[t]}
          </button>
        ))}
      </div>
      {type !== "cardio" && (
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={lbl}>Series</div>
            <input type="number" value={sets} onChange={e=>setSets(e.target.value)} style={inp}/>
          </div>
          <div style={{ flex:2 }}>
            <div style={lbl}>Reps</div>
            <input type="text" value={reps} onChange={e=>setReps(e.target.value)} style={inp}/>
          </div>
        </div>
      )}
      <div style={lbl}>Objetivo / Peso</div>
      <input type="text" value={tgt} onChange={e=>setTgt(e.target.value)} placeholder="Ej: 20 kg" style={{ ...inp, marginBottom:14 }}/>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={save} style={{ flex:2, minHeight:48, background:accent, border:`2px solid ${INK}`, boxShadow:SH_SM, color:"#FFF", fontFamily:FD, fontWeight:800, fontSize:14, cursor:"pointer", textTransform:"uppercase", letterSpacing:.5 }}>Agregar</button>
        <button onClick={onCancel} style={{ flex:1, minHeight:48, background:C1, border:`2px solid ${INK}`, color:TX, fontFamily:FD, fontSize:13, fontWeight:700, cursor:"pointer" }}>Cancelar</button>
      </div>
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────
function ExCard({ ex, setDone, c1, onSetCount, isEdited, onSaveOverride, onDelete, onMove, isFirst, isLast }) {
  const [editing, setEditing] = useState(false);
  const [delCfm,  setDelCfm ] = useState(false);
  const [sheet,   setSheet  ] = useState(false);
  const [fName,   setFName  ] = useState(ex.name || "");
  const [fSets,   setFSets  ] = useState(String(ex.sets || ""));
  const [fReps,   setFReps  ] = useState(ex.reps || "");
  const [fTarget, setFTarget] = useState(ex.target || "");

  const total = exTotalSets(ex);
  const done  = setDone >= total;
  const hasSets = total > 1;

  useEffect(() => {
    if (!editing) { setFName(ex.name||""); setFSets(String(ex.sets||"")); setFReps(ex.reps||""); setFTarget(ex.target||""); }
  }, [ex.name, ex.reps, ex.sets, ex.target, editing]);

  const save = () => {
    const f = { target: fTarget };
    if (fName.trim()) f.name = fName.trim();
    if (ex.type !== "cardio") { f.sets = parseInt(fSets) || ex.sets; f.reps = fReps; }
    onSaveOverride(ex.id, f); setEditing(false);
  };
  const tclr = T_CLR[ex.type] || T_CLR.strength;
  const moveStyle = disabled => ({ background:"none", border:"none", cursor:disabled?"default":"pointer", color:disabled?C3:TX2, padding:5, display:"flex" });
  const inp = { fontFamily:FD, fontSize:14, fontWeight:600, background:C1, border:`2px solid ${INK}`, borderRadius:0, padding:"10px 12px", color:TX, width:"100%" };
  const lbl = { fontSize:10, color:TX2, fontWeight:700, letterSpacing:1, marginBottom:5, textTransform:"uppercase" };

  const openMain = () => { if (editing || delCfm) return; if (hasSets) setSheet(true); else onSetCount(ex.id, done ? 0 : 1); };

  return (
    <div style={{ background:done?"#E3EFE3":C1, border:`2px solid ${INK}`, boxShadow:done?"none":SH, marginBottom:10, overflow:"hidden" }}>
      {delCfm && (
        <div style={{ background:"#F2C8C2", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`2px solid ${INK}` }}>
          <span style={{ fontSize:12, color:INK, fontWeight:700 }}>¿Borrar este ejercicio?</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onDelete} style={{ background:"#C0392B", border:`2px solid ${INK}`, color:"#FFF", fontSize:12, fontWeight:800, padding:"6px 14px", cursor:"pointer" }}>Sí</button>
            <button onClick={() => setDelCfm(false)} style={{ background:C1, border:`2px solid ${INK}`, color:TX, fontSize:12, fontWeight:700, padding:"6px 14px", cursor:"pointer" }}>No</button>
          </div>
        </div>
      )}
      <div style={{ display:"flex" }}>
        <div style={{ width:8, background:done?GN:tclr, flexShrink:0, borderRight:`2px solid ${INK}` }}/>
        <div style={{ flex:1, padding:"14px 12px 14px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div onClick={openMain} style={{ flex:1, paddingRight:8, cursor: editing ? "default" : "pointer" }}>
              <div style={{ fontSize:15, fontWeight:800, color:done?TX2:TX, textDecoration:done?"line-through":"none", lineHeight:1.25 }}>{ex.name}</div>
              {!editing && <>
                <div style={{ display:"flex", gap:6, marginTop:7, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontSize:10, fontWeight:800, color:"#FFF", background:tclr, border:`2px solid ${INK}`, padding:"1px 7px", letterSpacing:.5, textTransform:"uppercase" }}>{T_LBL[ex.type] || "Fuerza"}</span>
                  {ex.sets && <span style={{ fontSize:11, color:TX, fontWeight:700 }}>{ex.sets}×</span>}
                  {ex.reps && <span style={{ fontSize:11, color:TX2, fontWeight:600 }}>{ex.reps}</span>}
                  {ex.note && <span style={{ fontSize:9, fontWeight:700, color:TX, border:`2px solid ${INK}`, padding:"1px 6px" }}>{ex.note}</span>}
                  {isEdited && <span style={{ fontSize:9, fontWeight:700, color:c1 }}>editado</span>}
                </div>
                <div style={{ fontSize:11, color:TX2, marginTop:7, fontWeight:600 }}>→ {ex.target}</div>
                {hasSets && <div style={{ display:"flex", gap:4, marginTop:9 }}>
                  {Array.from({ length:Math.min(total, 10) }).map((_,i) => (
                    <div key={i} style={{ width:14, height:9, border:`2px solid ${INK}`, background: setDone > i ? (done?GN:tclr) : "transparent" }}/>
                  ))}
                  <span style={{ fontSize:10, fontWeight:800, color:TX, marginLeft:4 }}>{setDone}/{total}</span>
                </div>}
              </>}
            </div>
            <div style={{ display:"flex", gap:4, alignItems:"center", flexShrink:0 }}>
              {!editing && <>
                <button aria-label="Subir ejercicio" title="Subir ejercicio" disabled={isFirst} onClick={()=>onMove(-1)} style={moveStyle(isFirst)}><ChevronUp size={16}/></button>
                <button aria-label="Bajar ejercicio" title="Bajar ejercicio" disabled={isLast} onClick={()=>onMove(1)} style={moveStyle(isLast)}><ChevronDown size={16}/></button>
              </>}
              {!editing && <button aria-label="Borrar" onClick={() => { setDelCfm(!delCfm); }} style={{ background:"none", border:"none", cursor:"pointer", color:delCfm?"#C0392B":TX2, padding:6, display:"flex" }}><Trash2 size={16}/></button>}
              <button aria-label={editing?"Cancelar edición":"Editar"} onClick={() => { setEditing(!editing); setDelCfm(false); }} style={{ background:"none", border:"none", cursor:"pointer", color:editing?c1:TX2, padding:6, display:"flex" }}>
                {editing ? <X size={18}/> : <Pencil size={16}/>}
              </button>
              <button aria-label={done?"Marcar como pendiente":"Completar"} onClick={openMain} style={{ width:48, height:48, flexShrink:0, background:done?GN:C1, border:`2px solid ${INK}`, boxShadow:done?"none":SH_SM, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:done?"#FFF":TX }}>
                {done ? <Check size={22} strokeWidth={3}/> : (hasSets ? <span style={{ fontFamily:FBB, fontSize:18, letterSpacing:.5 }}>{setDone}/{total}</span> : <div style={{ width:12, height:12, border:`2px solid ${INK}` }}/>)}
              </button>
            </div>
          </div>
          {editing && (
            <div style={{ marginTop:12, borderTop:`2px solid ${INK}`, paddingTop:12 }}>
              <div style={{ marginBottom:10 }}>
                <div style={lbl}>Nombre</div>
                <input type="text" value={fName} onChange={e=>setFName(e.target.value)} style={inp}/>
              </div>
              {ex.type !== "cardio" && (
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={lbl}>Series</div>
                    <input type="number" value={fSets} onChange={e=>setFSets(e.target.value)} style={inp}/>
                  </div>
                  <div style={{ flex:2 }}>
                    <div style={lbl}>Reps</div>
                    <input type="text" value={fReps} onChange={e=>setFReps(e.target.value)} style={inp}/>
                  </div>
                </div>
              )}
              <div style={{ marginBottom:12 }}>
                <div style={lbl}>Objetivo / Peso</div>
                <input type="text" value={fTarget} onChange={e=>setFTarget(e.target.value)} style={inp}/>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={save} style={{ flex:2, minHeight:46, background:c1, border:`2px solid ${INK}`, boxShadow:SH_SM, color:"#FFF", fontFamily:FD, fontWeight:800, fontSize:14, cursor:"pointer", textTransform:"uppercase", letterSpacing:.5 }}>Guardar</button>
                {isEdited && <button onClick={() => { onSaveOverride(ex.id, null); setEditing(false); }} style={{ flex:1, minHeight:46, background:C1, border:`2px solid ${INK}`, color:TX, fontFamily:FD, fontSize:13, fontWeight:700, cursor:"pointer" }}>Reset</button>}
              </div>
            </div>
          )}
        </div>
      </div>
      {sheet && <SetSheet ex={ex} total={total} count={setDone} accent={c1} onSetCount={onSetCount} onClose={()=>setSheet(false)}/>}
    </div>
  );
}

// ── SESSION VIEW ──────────────────────────────────────────────────────────
function SessionView({ session, done, setProgress, sessionExercises, onSaveOverride, onSetCount, onAddEx, onDeleteEx, onMoveEx }) {
  const [showAdd, setShowAdd] = useState(false);
  const { items } = resolveSession(session, sessionExercises[session.id]);
  const { dn, tot, pct } = sessProgress(session, setProgress, sessionExercises);
  const totalSets = items.reduce((a,e)=>a+(e.sets||0),0);
  const overrides = sessionExercises[session.id]?.overrides || {};
  return (
    <div>
      <div style={{ background:session.c1, padding:"24px 18px", margin:"14px 14px 0", border:`3px solid ${INK}`, boxShadow:SH, color:"#FFF" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:FBB, fontSize:52, letterSpacing:3, lineHeight:0.9 }}>{session.label}</div>
            <div style={{ fontSize:13, marginTop:8, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{session.sub}</div>
          </div>
          <div style={{ position:"relative", width:60, height:60, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ring pct={pct} color="#FFF" size={60} thick={5}/>
            <div style={{ position:"absolute", textAlign:"center" }}>
              {pct===100 ? <Check size={20} strokeWidth={3}/> : <div style={{ fontFamily:FBB, fontSize:20, lineHeight:1 }}>{pct}<span style={{ fontSize:9 }}>%</span></div>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", marginTop:18, border:`2px solid ${INK}` }}>
          {[{v:`${dn}/${tot}`,l:"ejercicios"},{v:String(totalSets||"—"),l:"series"},{v:pct===100?"LISTO":`${tot-dn}`,l:pct===100?"":"restantes"}].map((s,i)=>(
            <div key={i} style={{ flex:1, padding:"10px 0", textAlign:"center", borderRight:i<2?`2px solid ${INK}`:"none", background:"rgba(22,20,15,0.18)" }}>
              <div style={{ fontFamily:FBB, fontSize:22, letterSpacing:1, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:9, fontWeight:700, opacity:.85, marginTop:3, textTransform:"uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"14px" }}>
        {session.sessionNote && <div style={{ fontSize:11, color:TX, fontWeight:600, background:C2, border:`2px solid ${INK}`, padding:"9px 12px", marginBottom:10, borderLeft:`8px solid ${session.c1}` }}>{session.sessionNote}</div>}
        {session.anyOne && <div style={{ fontSize:11, color:TX, background:C2, border:`2px solid ${INK}`, padding:"9px 12px", marginBottom:10 }}>Elige <strong>cualquiera</strong> de las opciones</div>}
        {items.map((ex, index) => <ExCard key={ex.id} ex={ex} setDone={setProgress[ex.id]||0} c1={session.c1} onSetCount={onSetCount} isEdited={!!overrides[ex.id]} onSaveOverride={(id,fields)=>onSaveOverride(session.id,id,fields)} onDelete={()=>onDeleteEx(session.id,ex.id)} onMove={dir=>onMoveEx(session.id,ex.id,dir)} isFirst={index===0} isLast={index===items.length-1}/>)}
        {showAdd
          ? <AddExForm sessionId={session.id} accent={session.c1} onAdd={(sid,ex)=>{ onAddEx(sid,ex); setShowAdd(false); }} onCancel={()=>setShowAdd(false)}/>
          : <button onClick={()=>setShowAdd(true)} style={{ width:"100%", minHeight:52, background:C1, border:`2px dashed ${INK}`, color:TX, fontFamily:FD, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Plus size={18}/> Agregar ejercicio
            </button>
        }
      </div>
    </div>
  );
}

// ── HOY ───────────────────────────────────────────────────────────────────
function HoyView({ today, sessions, sessionExercises, ...sp }) {
  const session = sessions.find(s => s.day === today);
  if (!session) {
    const next = (() => { for(let i=1;i<=7;i++){const d=(today+i)%7;const s=sessions.find(x=>x.day===d);if(s)return{s,n:DAY_F[d]};} return null; })();
    return (
      <div style={{ padding:"24px 16px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontFamily:FBB, fontSize:64, letterSpacing:5, color:TX, lineHeight:1 }}>DESCANSO</div>
          <div style={{ fontSize:13, color:TX2, marginTop:6, fontWeight:700, textTransform:"uppercase" }}>{DAY_F[today]}</div>
        </div>
        {next && <div style={{ background:C1, border:`2px solid ${INK}`, boxShadow:SH, marginBottom:12 }}>
          <div style={{ height:8, background:next.s.c1, borderBottom:`2px solid ${INK}` }}/>
          <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:10, color:TX2, fontWeight:700, letterSpacing:1.5, marginBottom:5, textTransform:"uppercase" }}>Próxima sesión</div>
              <div style={{ fontFamily:FBB, fontSize:26, letterSpacing:2 }}>{next.s.label}</div>
              <div style={{ fontSize:12, color:TX2, marginTop:3, fontWeight:600 }}>{next.n} · {next.s.sub}</div>
            </div>
            <div style={{ fontSize:12, color:TX, fontWeight:700 }}>{resolveSession(next.s, sessionExercises[next.s.id]).items.length} ej.</div>
          </div>
        </div>}
        <div style={{ background:C1, border:`2px solid ${INK}`, boxShadow:SH, padding:"14px 16px" }}>
          <div style={{ fontSize:10, color:TX2, fontWeight:700, letterSpacing:1.5, marginBottom:12, textTransform:"uppercase" }}>Recuperación</div>
          {["1.8–2g proteína / kg peso","7–9 horas de sueño","35 ml agua × kg peso","20 min caminata si aplica"].map((t,i) => (
            <div key={i} style={{ fontSize:13, color:TX, fontWeight:600, padding:"8px 0", borderTop:i>0?`2px solid ${INK}`:"none", display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ color:GN, fontWeight:800 }}>→</span>{t}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontSize:11, color:TX2, fontWeight:700, padding:"12px 18px 0", textTransform:"uppercase", letterSpacing:1 }}>{DAY_F[today]}</div>
      <SessionView session={session} sessionExercises={sessionExercises} {...sp}/>
    </div>
  );
}

// ── SEMANA ────────────────────────────────────────────────────────────────
function SemanaView({ sessions, done, setProgress, sessionExercises, semId, setSemId, ...sp }) {
  const idx = semId ? sessions.findIndex(s => s.id === semId) : -1;
  const session = idx >= 0 ? sessions[idx] : null;
  if (session) {
    const prev = idx > 0 ? sessions[idx-1] : null, next = idx < sessions.length-1 ? sessions[idx+1] : null;
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px 0" }}>
          <button onClick={()=>setSemId(prev?prev.id:null)} style={{ display:"flex", alignItems:"center", gap:4, background:C1, border:`2px solid ${INK}`, boxShadow:SH_SM, color:TX, cursor:"pointer", fontFamily:FD, fontSize:13, fontWeight:700, padding:"8px 12px", minHeight:42 }}>
            <ChevronLeft size={16}/>{prev ? prev.label : "Semana"}
          </button>
          {next && <button onClick={()=>setSemId(next.id)} style={{ display:"flex", alignItems:"center", gap:4, background:C1, border:`2px solid ${INK}`, boxShadow:SH_SM, color:TX, cursor:"pointer", fontFamily:FD, fontSize:13, fontWeight:700, padding:"8px 12px", minHeight:42 }}>
            {next.label}<ChevronRight size={16}/>
          </button>}
        </div>
        <SessionView session={session} done={done} setProgress={setProgress} sessionExercises={sessionExercises} {...sp}/>
      </div>
    );
  }
  return (
    <div style={{ padding:14 }}>
      <div style={{ fontSize:11, color:TX2, fontWeight:700, letterSpacing:1, marginBottom:12, textTransform:"uppercase" }}>Semana completa</div>
      {sessions.map(s => {
        const { pct } = sessProgress(s, setProgress, sessionExercises);
        const { items } = resolveSession(s, sessionExercises[s.id]);
        return (
          <div key={s.id} onClick={()=>setSemId(s.id)} style={{ background:C1, border:`2px solid ${INK}`, boxShadow:SH, marginBottom:10, overflow:"hidden", cursor:"pointer", display:"flex" }}>
            <div style={{ width:10, background:s.c1, flexShrink:0, borderRight:`2px solid ${INK}` }}/>
            <div style={{ flex:1, padding:"14px 14px 14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{ fontFamily:FBB, fontSize:24, letterSpacing:2, lineHeight:1 }}>{s.label}</div>
                  {pct===100 && <div style={{ background:GN, color:"#FFF", fontSize:9, fontWeight:800, padding:"2px 8px", border:`2px solid ${INK}` }}>LISTO</div>}
                </div>
                <div style={{ fontSize:11, color:TX2, fontWeight:600 }}>{DAY_S[s.day]} · {s.sub}</div>
                <div style={{ display:"flex", gap:4, marginTop:9, flexWrap:"wrap" }}>
                  {items.map(e => (
                    <div key={e.id} style={{ width:12, height:8, border:`2px solid ${INK}`, background:isExDone(e, setProgress)?GN:"transparent" }}/>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ position:"relative", width:46, height:46, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ring pct={pct} color={s.c1} size={46} thick={4}/>
                  <div style={{ position:"absolute", textAlign:"center" }}>
                    {pct===100 ? <Check size={14} color={GN} strokeWidth={3}/> : <div style={{ fontFamily:FBB, fontSize:13, color:TX }}>{pct}<span style={{ fontSize:8 }}>%</span></div>}
                  </div>
                </div>
                <ChevronRight size={18} color={TX}/>
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
  const inp = { fontFamily:FD, fontWeight:600, fontSize:16, border:`2px solid ${INK}`, borderRadius:0, padding:"12px 13px", background:C1, color:TX, width:"100%" };
  const lbl = { fontSize:11, color:TX2, fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:.5 };
  return (
    <div style={{ padding:14 }}>
      <div style={{ fontSize:11, color:TX2, fontWeight:700, letterSpacing:1, marginBottom:12, textTransform:"uppercase" }}>Registro de carreras</div>
      {best && (
        <div style={{ background:C1, border:`2px solid ${INK}`, boxShadow:SH, marginBottom:12 }}>
          <div style={{ height:8, background:GN, borderBottom:`2px solid ${INK}` }}/>
          <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:10, color:TX2, fontWeight:700, letterSpacing:1.5, marginBottom:5, textTransform:"uppercase" }}>Mejor pace</div>
              <div style={{ fontFamily:FBB, fontSize:32, letterSpacing:2, color:GN, lineHeight:1 }}>{best.pace}<span style={{ fontSize:13, fontFamily:FD, color:TX2 }}> min/km</span></div>
              <div style={{ fontSize:11, color:TX2, marginTop:4, fontWeight:600 }}>{best.km} km · {best.date}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:FBB, fontSize:22, color:TX }}>{best.kmh}<span style={{ fontSize:11, fontFamily:FD, color:TX2 }}> km/h</span></div>
              <div style={{ display:"flex", gap:8, marginTop:8, justifyContent:"flex-end" }}>
                {[{d:5,l:"5K"},{d:10,l:"10K"},{d:21,l:"21K"}].map(r => (
                  <div key={r.d} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:FBB, fontSize:15, color:r.d===21?GN:TX }}>{raceTime(best.pace, r.d)}</div>
                    <div style={{ fontSize:9, color:TX2, fontWeight:600 }}>{r.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ background:C1, border:`2px solid ${INK}`, boxShadow:SH, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:10, color:TX2, fontWeight:700, letterSpacing:1.5, marginBottom:14, textTransform:"uppercase" }}>Nueva carrera</div>
        <div style={lbl}>Distancia (km)</div>
        <input type="number" value={rkm} onChange={e=>setRkm(e.target.value)} placeholder="5.0" step="0.1" style={inp}/>
        <div style={{ ...lbl, margin:"12px 0 6px" }}>Tiempo total</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="number" value={rmin} onChange={e=>setRmin(e.target.value)} placeholder="min" style={{ ...inp, textAlign:"center" }}/>
          <span style={{ color:TX, fontSize:22, fontWeight:800 }}>:</span>
          <input type="number" value={rsec} onChange={e=>setRsec(e.target.value)} placeholder="seg" style={{ ...inp, textAlign:"center" }}/>
        </div>
        <button onClick={onCalc} style={{ background:"#FF512F", color:"#FFF", border:`2px solid ${INK}`, boxShadow:SH_SM, fontFamily:FD, fontWeight:800, fontSize:14, padding:14, cursor:"pointer", width:"100%", marginTop:12, textTransform:"uppercase", letterSpacing:.5 }}>Calcular pace</button>
        {pace && (
          <div style={{ marginTop:12, background:C2, border:`2px solid ${INK}`, padding:"14px 16px" }}>
            <div style={{ fontFamily:FBB, fontSize:32, letterSpacing:2, color:GN, lineHeight:1 }}>{pace.pace}<span style={{ fontSize:13, fontFamily:FD, color:TX2 }}> min/km</span></div>
            <div style={{ fontSize:11, color:TX2, marginTop:5, fontWeight:600 }}>{pace.kmh} km/h · {pace.km} km</div>
            <div style={{ display:"flex", marginTop:10, border:`2px solid ${INK}` }}>
              {[{d:5,l:"5K"},{d:10,l:"10K"},{d:21,l:"21K 🎯"},{d:42,l:"42K"}].map((r,i) => (
                <div key={r.d} style={{ flex:1, padding:"8px 0", textAlign:"center", borderRight:i<3?`2px solid ${INK}`:"none", background:r.d===21?"#E3EFE3":"transparent" }}>
                  <div style={{ fontFamily:FBB, fontSize:15, color:r.d===21?GN:TX }}>{raceTime(pace.pace, r.d)}</div>
                  <div style={{ fontSize:9, color:TX2, fontWeight:600, marginTop:2 }}>{r.l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:10, color:TX2, fontWeight:700, letterSpacing:1, margin:"12px 0 8px", textTransform:"uppercase" }}>Tipo de sesión</div>
            <div style={{ display:"flex", gap:6 }}>
              {RUN_TYPES.map(t => (
                <button key={t.id} onClick={()=>setRtype(t.id)} style={{ flex:1, minHeight:42, background:rtype===t.id?t.color:C1, border:`2px solid ${INK}`, boxShadow:rtype===t.id?"none":SH_SM, color:rtype===t.id?"#FFF":TX, fontFamily:FD, fontSize:11, fontWeight:700, padding:"8px 4px", cursor:"pointer" }}>{t.label}</button>
              ))}
            </div>
            <button onClick={onSave} style={{ background:GN, color:"#FFF", border:`2px solid ${INK}`, boxShadow:SH_SM, fontFamily:FD, fontWeight:800, fontSize:14, padding:13, cursor:"pointer", width:"100%", marginTop:12, textTransform:"uppercase", letterSpacing:.5 }}>Guardar ✓</button>
          </div>
        )}
      </div>
      {runs.length > 0 ? (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:11, color:TX2, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>Historial ({runs.length})</div>
            {!cfm
              ? <button onClick={()=>setCfm(true)} style={{ background:"none", border:"none", cursor:"pointer", color:TX2, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", gap:4 }}><Trash2 size={14}/>Borrar todo</button>
              : <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:TX, fontWeight:700 }}>¿Seguro?</span>
                  <button onClick={()=>{onClear();setCfm(false);}} style={{ background:"#C0392B", border:`2px solid ${INK}`, color:"#FFF", fontSize:11, fontWeight:800, padding:"5px 11px", cursor:"pointer" }}>Sí</button>
                  <button onClick={()=>setCfm(false)} style={{ background:C1, border:`2px solid ${INK}`, color:TX, fontSize:11, fontWeight:700, padding:"5px 11px", cursor:"pointer" }}>No</button>
                </div>
            }
          </div>
          {[...runs].reverse().map((r, i) => {
            const tInfo = RUN_TYPES.find(t => t.id === r.type);
            return (
              <div key={i} style={{ background:C1, border:`2px solid ${INK}`, boxShadow:SH_SM, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <div style={{ fontFamily:FBB, fontSize:22, letterSpacing:1, lineHeight:1 }}>{r.pace}<span style={{ fontSize:10, fontFamily:FD, fontWeight:600, color:TX2 }}> min/km</span></div>
                    {tInfo && <span style={{ fontSize:9, fontWeight:800, color:"#FFF", background:tInfo.color, border:`2px solid ${INK}`, padding:"2px 7px" }}>{tInfo.label}</span>}
                  </div>
                  <div style={{ fontSize:11, color:TX2, fontWeight:600 }}>{r.date} · {r.km} km · {r.kmh} km/h</div>
                </div>
                <button aria-label="Borrar carrera" onClick={()=>onDelete(runs.length-1-i)} style={{ background:"none", border:"none", cursor:"pointer", color:TX2, padding:6, display:"flex" }}><Trash2 size={16}/></button>
              </div>
            );
          })}
          <div style={{ fontSize:10, color:TX2, textAlign:"center", marginTop:8, fontWeight:600 }}>Guardado en este dispositivo</div>
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"32px 0", color:TX2 }}>
          <div style={{ fontSize:13, fontWeight:700 }}>Sin registros aún</div>
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

  const blankDone = () => { const d={}; ALL_FLAT.forEach(s=>s.exercises.forEach(e=>{d[e.id]=false;})); return d; };

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

        // Totales de series por ejercicio (definición efectiva).
        const totals = {};
        ALL_FLAT.forEach(s => resolveSession(s, nextSessionExercises[s.id]).items.forEach(ex => { totals[ex.id] = exTotalSets(ex); }));

        let sp;
        if (sw !== w) {
          // Reset semanal: progreso por series a cero.
          sp = {};
          await store.set("week", w);
          await store.set("setProgress", sp);
          await store.set("done", blankDone());
        } else if (ssp) {
          sp = ssp;
        } else {
          // Migración retrocompat desde `done` legacy: true → todas las series, false → 0.
          sp = {};
          const dmap = sd || {};
          Object.keys(totals).forEach(id => { sp[id] = dmap[id] ? totals[id] : 0; });
          await store.set("setProgress", sp);
        }
        setSetProgress(sp);
        setRuns(sr||[]);
        if (srt) setRoutine(srt);
        setLoaded(true);
      } catch (err) {
        console.error("Error al cargar datos de almacenamiento local:", err);
        setSetProgress({});
        setSessionExercises({});
        setRuns([]);
        setLoaded(true);
      }
    })();
  }, []);

  const saveSetProgress = async n => { setSetProgress(n); await store.set("setProgress", n); };
  const onSetCount = async (exId, n) => {
    const v = Math.max(0, Math.round(n));
    await saveSetProgress({ ...setProgress, [exId]: v });
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
    await saveSetProgress({ ...setProgress, [ex.id]: 0 });
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

  // Mapa `done` derivado del progreso por series (para conteos y rings).
  const doneMap = {};
  ALL_FLAT.forEach(s => resolveSession(s, sessionExercises[s.id]).items.forEach(ex => { doneMap[ex.id] = isExDone(ex, setProgress); }));

  const activeIds = activeSessions.flatMap(s => resolveSession(s, sessionExercises[s.id]).order);
  const totalEx = activeIds.length, doneEx = activeIds.filter(id=>doneMap[id]).length;
  const wPct = totalEx ? Math.round((doneEx/totalEx)*100) : 0;

  if (!loaded) return <div style={{background:BG,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FBB,fontSize:20,letterSpacing:6,color:INK}}>CARGANDO</div>;

  const sp = { done:doneMap, setProgress, onSetCount, sessionExercises, onSaveOverride:saveOverride, onAddEx:addEx, onDeleteEx:deleteEx, onMoveEx:moveEx };

  return (
    <div style={{ background:BG, fontFamily:FD, color:TX, minHeight:"100vh", maxWidth:480, margin:"0 auto", paddingBottom:"calc(78px + env(safe-area-inset-bottom))" }}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{display:none}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}input:focus,textarea:focus{outline:none}.tap:active{transform:translate(2px,2px)}`}</style>

      {/* HEADER */}
      <div style={{ padding:"16px 16px 14px", position:"sticky", top:0, zIndex:90, background:BG, borderBottom:`3px solid ${INK}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div style={{ fontFamily:FBB, fontSize:30, letterSpacing:2, lineHeight:1, color:TX }}>GYM<span style={{ background:"#FF512F", color:"#FFF", padding:"0 6px", border:`2px solid ${INK}` }}>TRACK</span></div>
            <div style={{ fontSize:11, color:TX2, marginTop:6, fontWeight:600 }}>{DAY_F[todayN]} · {isoWeek()}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:FBB, fontSize:26, letterSpacing:1, lineHeight:1, color:TX }}>{wPct}<span style={{ fontSize:13, color:TX2, fontFamily:FD }}>%</span></div>
              <div style={{ fontSize:11, color:TX2, fontWeight:600 }}>{doneEx}/{totalEx}</div>
            </div>
            <div style={{ position:"relative", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ring pct={wPct} color="#FF512F" size={44} thick={4}/>
              <div style={{ position:"absolute", fontFamily:FBB, fontSize:12, color:TX }}>{wPct}</div>
            </div>
          </div>
        </div>
        {/* ROUTINE SWITCHER */}
        <div style={{ display:"flex", gap:8 }}>
          {[{id:"principal",label:"Principal"},{id:"mantenimiento",label:"Mantenimiento"}].map(r => (
            <button key={r.id} className="tap" onClick={()=>switchRoutine(r.id)}
              style={{ flex:1, minHeight:46, background:routine===r.id?INK:C1, border:`2px solid ${INK}`, boxShadow:routine===r.id?"none":SH_SM, color:routine===r.id?"#FFF":TX, fontFamily:FD, fontSize:13, fontWeight:800, padding:"10px 0", cursor:"pointer", textTransform:"uppercase", letterSpacing:.5 }}>
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

      <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C1, borderTop:`3px solid ${INK}`, display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom)" }}>
        {[{id:"hoy",lbl:"Hoy"},{id:"semana",lbl:"Semana"},{id:"carreras",lbl:"Correr"}].map(t => (
          <button key={t.id} className="tap" onClick={()=>{setTab(t.id);setSemId(null);}} style={{ flex:1, minHeight:64, border:"none", borderRight:t.id!=="carreras"?`2px solid ${INK}`:"none", background:tab===t.id?INK:"transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
            <div style={{ fontFamily:FBB, fontSize:20, letterSpacing:1, color:tab===t.id?"#FFF":TX }}>{t.lbl}</div>
          </button>
        ))}
      </nav>
    </div>
  );
}
