import { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight, Pencil, X, Trash2, Plus } from "lucide-react";

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
const BG  = "#000"; const C1 = "#0F0F0F"; const C2 = "#171717"; const C3 = "#222";
const BR  = "#2A2A2A"; const TX = "#FFF"; const TX2 = "#AAA"; const MU = "#555";
const GN  = "#00D084";
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
const T_CLR  = { strength:"#FF6B4A", cardio:"#4A9EFF", plyo:"#BF7AFF" };
const T_LBL  = { strength:"Fuerza", cardio:"Cardio", plyo:"Plyo" };
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
function sessProgress(sess, done, addedEx, deletedEx) {
  const ids = [
    ...sess.exercises.filter(e => !deletedEx.includes(e.id)).map(e => e.id),
    ...(addedEx[sess.id] || []).filter(e => !deletedEx.includes(e.id)).map(e => e.id),
  ];
  const tot = ids.length, dn = ids.filter(id => done[id]).length;
  if (sess.anyOne) return { dn: Math.min(dn, 1), tot: 1, pct: dn > 0 ? 100 : 0 };
  return { dn, tot, pct: tot ? Math.round((dn / tot) * 100) : 0 };
}

// ── RING ──────────────────────────────────────────────────────────────────
function Ring({ pct, c1, c2, size = 52, thick = 3 }) {
  const r = (size - thick * 2) / 2, circ = 2 * Math.PI * r, d = Math.max(0, pct / 100) * circ;
  const gid = `g${(c1 + c2).replace(/#/g,"")}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:"block", flexShrink:0 }}>
      <defs><linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
      </linearGradient></defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C3} strokeWidth={thick}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={thick}
        strokeDasharray={`${d} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:"stroke-dasharray .5s ease" }}/>
    </svg>
  );
}

// ── ADD EXERCISE FORM ─────────────────────────────────────────────────────
function AddExForm({ sessionId, c1, c2, onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("strength");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [tgt,  setTgt ] = useState("");
  const inp = { fontFamily:FD, fontSize:13, background:C3, border:`1px solid ${BR}`, borderRadius:6, padding:"8px 10px", color:TX, width:"100%" };
  const save = () => {
    if (!name.trim()) return;
    onAdd(sessionId, { id:`cx-${Date.now()}`, name:name.trim(), type, sets:parseInt(sets)||3, reps, target:tgt });
  };
  return (
    <div style={{ background:C2, borderRadius:10, padding:14, marginBottom:8, border:`1px solid ${BR}` }}>
      <div style={{ fontSize:9, color:MU, letterSpacing:1.5, marginBottom:10 }}>NUEVO EJERCICIO</div>
      <div style={{ fontSize:9, color:TX2, marginBottom:4 }}>Nombre</div>
      <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Leg Extension" style={{ ...inp, marginBottom:10 }}/>
      <div style={{ display:"flex", gap:6, marginBottom:10 }}>
        {["strength","cardio","plyo"].map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{ flex:1, background:type===t?T_CLR[t]:"transparent", border:`1.5px solid ${type===t?T_CLR[t]:BR}`, borderRadius:20, color:type===t?"#000":TX2, fontFamily:FD, fontSize:9, fontWeight:600, padding:"6px 4px", cursor:"pointer" }}>
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
        <button onClick={save} style={{ flex:2, background:`linear-gradient(135deg,${c1},${c2})`, border:"none", borderRadius:7, color:TX, fontFamily:FD, fontWeight:700, fontSize:12, padding:9, cursor:"pointer" }}>Agregar</button>
        <button onClick={onCancel} style={{ flex:1, background:C3, border:`1px solid ${BR}`, borderRadius:7, color:TX2, fontFamily:FD, fontSize:11, padding:9, cursor:"pointer" }}>Cancelar</button>
      </div>
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────
function ExCard({ ex, done, c1, c2, onToggle, custom, onSaveCustom, onDelete }) {
  const eff = { ...ex, ...(custom[ex.id] || {}) };
  const [editing, setEditing] = useState(false);
  const [delCfm,  setDelCfm ] = useState(false);
  const [fSets,   setFSets  ] = useState(String(eff.sets || ""));
  const [fReps,   setFReps  ] = useState(eff.reps || "");
  const [fTarget, setFTarget] = useState(eff.target || "");

  useEffect(() => {
    if (!editing) { setFSets(String(eff.sets||"")); setFReps(eff.reps||""); setFTarget(eff.target||""); }
  }, [custom, editing]);

  const save = () => {
    const f = { target: fTarget };
    if (eff.type !== "cardio") { f.sets = parseInt(fSets) || eff.sets; f.reps = fReps; }
    onSaveCustom(ex.id, f); setEditing(false);
  };
  const tclr = T_CLR[ex.type] || T_CLR.strength;

  return (
    <div style={{ background:done?"rgba(0,208,132,0.05)":C1, borderRadius:10, marginBottom:8, overflow:"hidden", transition:"background .2s" }}>
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
        <div style={{ width:3, background:done?GN:tclr, flexShrink:0, transition:"background .2s" }}/>
        <div style={{ flex:1, padding:"12px 12px 12px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1, paddingRight:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:done?TX2:TX, textDecoration:done?"line-through":"none", lineHeight:1.3, transition:"color .2s" }}>{eff.name || ex.name}</div>
              {!editing && <>
                <div style={{ display:"flex", gap:5, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontSize:9, fontWeight:700, color:tclr, letterSpacing:0.5 }}>{T_LBL[ex.type] || "Fuerza"}</span>
                  {eff.sets && <><span style={{ color:MU, fontSize:9 }}>·</span><span style={{ fontSize:10, color:TX2 }}>{eff.sets}×</span></>}
                  {eff.reps && <><span style={{ color:MU, fontSize:9 }}>·</span><span style={{ fontSize:10, color:TX2 }}>{eff.reps}</span></>}
                  {ex.note && <span style={{ fontSize:8, color:c1, border:`1px solid ${c1}`, borderRadius:10, padding:"1px 6px" }}>{ex.note}</span>}
                  {custom[ex.id] && <span style={{ fontSize:8, color:c1, opacity:.7 }}>editado</span>}
                </div>
                <div style={{ fontSize:10, color:TX2, marginTop:6 }}>→ {eff.target}</div>
                {eff.sets && <div style={{ display:"flex", gap:3, marginTop:8 }}>
                  {Array.from({ length:Math.min(eff.sets, 8) }).map((_,i) => (
                    <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:done?GN:tclr, opacity:done?.7:.35, transition:`all .3s ${i*0.04}s` }}/>
                  ))}
                </div>}
              </>}
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
              {!editing && <button onClick={() => { setDelCfm(!delCfm); }} style={{ background:"none", border:"none", cursor:"pointer", color:delCfm?"#FCA5A5":MU, padding:4, display:"flex" }}><Trash2 size={13}/></button>}
              <button onClick={() => { setEditing(!editing); setDelCfm(false); }} style={{ background:"none", border:"none", cursor:"pointer", color:editing?c1:MU, padding:4, display:"flex" }}>
                {editing ? <X size={15}/> : <Pencil size={13}/>}
              </button>
              <button onClick={onToggle} style={{ width:32, height:32, borderRadius:"50%", background:done?GN:"transparent", border:`2px solid ${done?GN:BR}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:done?"#000":MU, transition:"all .2s" }}>
                {done ? <Check size={14} strokeWidth={3}/> : <div style={{ width:8, height:8, borderRadius:"50%", background:BR }}/>}
              </button>
            </div>
          </div>
          {editing && (
            <div style={{ marginTop:12, borderTop:`1px solid ${BR}`, paddingTop:12 }}>
              {ex.type !== "cardio" && (
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:9, color:MU, letterSpacing:1, marginBottom:4 }}>SERIES</div>
                    <input type="number" value={fSets} onChange={e=>setFSets(e.target.value)} style={{ fontFamily:FD, fontSize:14, fontWeight:600, background:C2, border:`1px solid ${BR}`, borderRadius:6, padding:"8px 10px", color:TX, width:"100%" }}/>
                  </div>
                  <div style={{ flex:2 }}>
                    <div style={{ fontSize:9, color:MU, letterSpacing:1, marginBottom:4 }}>REPS</div>
                    <input type="text" value={fReps} onChange={e=>setFReps(e.target.value)} style={{ fontFamily:FD, fontSize:14, fontWeight:600, background:C2, border:`1px solid ${BR}`, borderRadius:6, padding:"8px 10px", color:TX, width:"100%" }}/>
                  </div>
                </div>
              )}
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:9, color:MU, letterSpacing:1, marginBottom:4 }}>OBJETIVO / PESO</div>
                <input type="text" value={fTarget} onChange={e=>setFTarget(e.target.value)} style={{ fontFamily:FD, fontSize:13, background:C2, border:`1px solid ${BR}`, borderRadius:6, padding:"8px 10px", color:TX, width:"100%" }}/>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={save} style={{ flex:2, background:`linear-gradient(135deg,${c1},${c2})`, border:"none", borderRadius:7, color:TX, fontFamily:FD, fontWeight:700, fontSize:12, padding:9, cursor:"pointer" }}>Guardar</button>
                {custom[ex.id] && <button onClick={() => { onSaveCustom(ex.id, null); setEditing(false); }} style={{ flex:1, background:C2, border:`1px solid ${BR}`, borderRadius:7, color:TX2, fontFamily:FD, fontSize:11, padding:9, cursor:"pointer" }}>Reset</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SESSION VIEW ──────────────────────────────────────────────────────────
function SessionView({ session, done, custom, onSaveCustom, onToggle, addedEx, deletedEx, onAddEx, onDeleteEx }) {
  const [showAdd, setShowAdd] = useState(false);
  const { dn, tot, pct } = sessProgress(session, done, addedEx, deletedEx);
  const totalSets = [...session.exercises, ...(addedEx[session.id]||[])].filter(e=>!deletedEx.includes(e.id)).reduce((a,e)=>a+(e.sets||0),0);
  const visDefault = session.exercises.filter(e => !deletedEx.includes(e.id));
  const visAdded   = (addedEx[session.id] || []).filter(e => !deletedEx.includes(e.id));
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${session.c1},${session.c2})`, padding:"28px 20px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.15)" }}/>
        <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:FBB, fontSize:52, letterSpacing:4, lineHeight:0.9, textShadow:"0 2px 12px rgba(0,0,0,0.3)" }}>{session.label}</div>
            <div style={{ fontSize:12, marginTop:10, opacity:.8 }}>{session.sub}</div>
          </div>
          <div style={{ position:"relative", width:58, height:58, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ring pct={pct} c1="#FFF" c2="#FFF" size={58} thick={3}/>
            <div style={{ position:"absolute", textAlign:"center" }}>
              {pct===100 ? <Check size={17} strokeWidth={3}/> : <><div style={{ fontFamily:FBB, fontSize:17, lineHeight:1 }}>{pct}</div><div style={{ fontSize:7, opacity:.7 }}>%</div></>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", marginTop:20, background:"rgba(0,0,0,0.2)", borderRadius:8, overflow:"hidden" }}>
          {[{v:`${dn}/${tot}`,l:"ejercicios"},{v:String(totalSets||"—"),l:"series"},{v:pct===100?"LISTO":`${tot-dn} left`,l:pct===100?"":"restantes"}].map((s,i)=>(
            <div key={i} style={{ flex:1, padding:"10px 0", textAlign:"center", borderRight:i<2?`1px solid rgba(255,255,255,0.15)`:"none" }}>
              <div style={{ fontFamily:FBB, fontSize:20, letterSpacing:1, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:9, opacity:.6, marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"12px 14px" }}>
        {session.sessionNote && <div style={{ fontSize:10, color:TX2, background:C2, borderRadius:8, padding:"8px 12px", marginBottom:10, borderLeft:`3px solid ${session.c1}` }}>{session.sessionNote}</div>}
        {session.anyOne && <div style={{ fontSize:10, color:MU, background:C1, borderRadius:8, padding:"8px 12px", marginBottom:10 }}>Elige <strong style={{ color:TX2 }}>cualquiera</strong> de las opciones</div>}
        {visDefault.map(ex => <ExCard key={ex.id} ex={ex} done={!!done[ex.id]} c1={session.c1} c2={session.c2} onToggle={()=>onToggle(ex.id)} custom={custom} onSaveCustom={onSaveCustom} onDelete={()=>onDeleteEx(ex.id)}/>)}
        {visAdded.map(ex   => <ExCard key={ex.id} ex={ex} done={!!done[ex.id]} c1={session.c1} c2={session.c2} onToggle={()=>onToggle(ex.id)} custom={custom} onSaveCustom={onSaveCustom} onDelete={()=>onDeleteEx(ex.id)}/>)}
        {showAdd
          ? <AddExForm sessionId={session.id} c1={session.c1} c2={session.c2} onAdd={(sid,ex)=>{ onAddEx(sid,ex); setShowAdd(false); }} onCancel={()=>setShowAdd(false)}/>
          : <button onClick={()=>setShowAdd(true)} style={{ width:"100%", background:"transparent", border:`1.5px dashed ${BR}`, borderRadius:10, color:MU, fontFamily:FD, fontSize:12, fontWeight:600, padding:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Plus size={14}/> Agregar ejercicio
            </button>
        }
      </div>
    </div>
  );
}

// ── HOY ───────────────────────────────────────────────────────────────────
function HoyView({ today, sessions, done, onToggle, custom, onSaveCustom, addedEx, deletedEx, onAddEx, onDeleteEx }) {
  const session = sessions.find(s => s.day === today);
  if (!session) {
    const next = (() => { for(let i=1;i<=7;i++){const d=(today+i)%7;const s=sessions.find(x=>x.day===d);if(s)return{s,n:DAY_F[d]};} return null; })();
    return (
      <div style={{ padding:"30px 18px" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:FBB, fontSize:60, letterSpacing:5, color:C3, lineHeight:1 }}>DESCANSO</div>
          <div style={{ fontSize:12, color:MU, marginTop:8 }}>{DAY_F[today]}</div>
        </div>
        {next && <div style={{ background:C1, borderRadius:12, overflow:"hidden", marginBottom:12 }}>
          <div style={{ height:2, background:`linear-gradient(90deg,${next.s.c1},${next.s.c2})` }}/>
          <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:9, color:MU, letterSpacing:1.5, marginBottom:5 }}>PRÓXIMA SESIÓN</div>
              <div style={{ fontFamily:FBB, fontSize:24, letterSpacing:2 }}>{next.s.label}</div>
              <div style={{ fontSize:11, color:TX2, marginTop:3 }}>{next.n} · {next.s.sub}</div>
            </div>
            <div style={{ fontSize:11, color:TX2 }}>{next.s.exercises.length} ej.</div>
          </div>
        </div>}
        <div style={{ background:C1, borderRadius:12, padding:"14px 16px" }}>
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
      <SessionView session={session} done={done} custom={custom} onSaveCustom={onSaveCustom} onToggle={onToggle} addedEx={addedEx} deletedEx={deletedEx} onAddEx={onAddEx} onDeleteEx={onDeleteEx}/>
    </div>
  );
}

// ── SEMANA ────────────────────────────────────────────────────────────────
function SemanaView({ sessions, done, onToggle, custom, onSaveCustom, addedEx, deletedEx, onAddEx, onDeleteEx, semId, setSemId }) {
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
        <SessionView session={session} done={done} custom={custom} onSaveCustom={onSaveCustom} onToggle={onToggle} addedEx={addedEx} deletedEx={deletedEx} onAddEx={onAddEx} onDeleteEx={onDeleteEx}/>
      </div>
    );
  }
  return (
    <div style={{ padding:14 }}>
      <div style={{ fontSize:10, color:MU, letterSpacing:1, marginBottom:12 }}>SEMANA COMPLETA</div>
      {sessions.map(s => {
        const { dn, tot, pct } = sessProgress(s, done, addedEx, deletedEx);
        return (
          <div key={s.id} onClick={()=>setSemId(s.id)} style={{ background:C1, borderRadius:12, marginBottom:8, overflow:"hidden", cursor:"pointer", display:"flex" }}>
            <div style={{ width:5, background:`linear-gradient(180deg,${s.c1},${s.c2})`, flexShrink:0 }}/>
            <div style={{ flex:1, padding:"14px 14px 14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{ fontFamily:FBB, fontSize:22, letterSpacing:2, lineHeight:1 }}>{s.label}</div>
                  {pct===100 && <div style={{ background:GN, color:"#000", fontSize:8, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>LISTO</div>}
                </div>
                <div style={{ fontSize:10, color:TX2 }}>{DAY_S[s.day]} · {s.sub}</div>
                <div style={{ display:"flex", gap:3, marginTop:8 }}>
                  {s.exercises.filter(e=>!deletedEx.includes(e.id)).map(e => (
                    <div key={e.id} style={{ width:6, height:6, borderRadius:"50%", background:done[e.id]?GN:T_CLR[e.type]||T_CLR.strength, opacity:done[e.id]?1:.3, transition:"all .2s" }}/>
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
  const inp = { fontFamily:FD, fontWeight:500, fontSize:16, border:`1px solid ${BR}`, borderRadius:8, padding:"11px 13px", background:C2, color:TX, width:"100%" };
  return (
    <div style={{ padding:14 }}>
      <div style={{ fontSize:10, color:MU, letterSpacing:1, marginBottom:12 }}>REGISTRO DE CARRERAS</div>
      {best && (
        <div style={{ background:C1, borderRadius:12, overflow:"hidden", marginBottom:12 }}>
          <div style={{ height:2, background:`linear-gradient(90deg,${RUN_TYPES.find(t=>t.id===best.type)?.color||GN},${GN})` }}/>
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
      <div style={{ background:C1, borderRadius:12, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:10, color:MU, letterSpacing:1.5, marginBottom:14 }}>NUEVA CARRERA</div>
        <div style={{ fontSize:10, color:TX2, marginBottom:5 }}>Distancia (km)</div>
        <input type="number" value={rkm} onChange={e=>setRkm(e.target.value)} placeholder="5.0" step="0.1" style={inp}/>
        <div style={{ fontSize:10, color:TX2, margin:"10px 0 5px" }}>Tiempo total</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="number" value={rmin} onChange={e=>setRmin(e.target.value)} placeholder="min" style={{ ...inp, textAlign:"center" }}/>
          <span style={{ color:MU, fontSize:20 }}>:</span>
          <input type="number" value={rsec} onChange={e=>setRsec(e.target.value)} placeholder="seg" style={{ ...inp, textAlign:"center" }}/>
        </div>
        <button onClick={onCalc} style={{ background:"linear-gradient(135deg,#FF512F,#DD2476)", color:TX, border:"none", borderRadius:8, fontFamily:FD, fontWeight:700, fontSize:13, padding:13, cursor:"pointer", width:"100%", marginTop:10 }}>Calcular pace</button>
        {pace && (
          <div style={{ marginTop:10, background:C2, borderRadius:8, padding:"14px 16px" }}>
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
                <button key={t.id} onClick={()=>setRtype(t.id)} style={{ flex:1, background:rtype===t.id?t.color:"transparent", border:`1.5px solid ${rtype===t.id?t.color:BR}`, borderRadius:20, color:rtype===t.id?"#000":TX2, fontFamily:FD, fontSize:10, fontWeight:600, padding:"7px 4px", cursor:"pointer", transition:"all .15s" }}>{t.label}</button>
              ))}
            </div>
            <button onClick={onSave} style={{ background:"transparent", color:GN, border:`1.5px solid ${GN}`, borderRadius:8, fontFamily:FD, fontWeight:600, fontSize:12, padding:11, cursor:"pointer", width:"100%", marginTop:10 }}>Guardar ✓</button>
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
              <div key={i} style={{ background:C1, borderRadius:8, padding:"12px 14px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
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
  const [done,      setDone     ] = useState({});
  const [custom,    setCustom   ] = useState({});
  const [addedEx,   setAddedEx  ] = useState({});
  const [deletedEx, setDeletedEx] = useState([]);
  const [runs,      setRuns     ] = useState([]);
  const [loaded,    setLoaded   ] = useState(false);
  const [semId,     setSemId    ] = useState(null);
  const [rkm,setRkm]=useState(""); const [rmin,setRmin]=useState(""); const [rsec,setRsec]=useState("");
  const [rtype,setRtype]=useState("z2"); const [pace,setPace]=useState(null);

  const blank = () => { const d={}; ALL_FLAT.forEach(s=>s.exercises.forEach(e=>{d[e.id]=false;})); return d; };

  useEffect(() => {
    try { const l=document.createElement("link"); l.rel="stylesheet"; l.href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"; document.head.appendChild(l); } catch {}
    (async () => {
      try {
        const w = isoWeek();
        const [sw,sd,sc,sa,sdel,sr,srt] = await Promise.all([
          store.get("week"), store.get("done"), store.get("custom"),
          store.get("addedEx"), store.get("deletedEx"), store.get("runs"), store.get("routine"),
        ]);
        if (sw !== w) { const f=blank(); setDone(f); await store.set("week",w); await store.set("done",f); }
        else setDone(sd || blank());
        setCustom(sc||{}); setAddedEx(sa||{}); setDeletedEx(sdel||[]); setRuns(sr||[]);
        if (srt) setRoutine(srt);
        setLoaded(true);
      } catch (err) {
        console.error("Error al cargar datos de almacenamiento local:", err);
        // Fallback: usar datos vacíos para que la app cargue de todas formas
        setDone(blank());
        setCustom({});
        setAddedEx({});
        setDeletedEx([]);
        setRuns([]);
        setLoaded(true);
      }
    })();
  }, []);

  const toggle     = async id => { const n={...done,[id]:!done[id]}; setDone(n); await store.set("done",n); };
  const saveCustom = async (id, fields) => {
    let n; if (fields===null){const c={...custom};delete c[id];n=c;} else n={...custom,[id]:{...(custom[id]||{}),...fields}};
    setCustom(n); await store.set("custom",n);
  };
  const addEx    = async (sid, ex) => { const n={...addedEx,[sid]:[...(addedEx[sid]||[]),ex]}; setAddedEx(n); await store.set("addedEx",n); const nd={...done,[ex.id]:false}; setDone(nd); await store.set("done",nd); };
  const deleteEx = async id => { const n=[...deletedEx,id]; setDeletedEx(n); await store.set("deletedEx",n); };
  const calcPace = () => { const k=parseFloat(rkm),m=parseInt(rmin)||0,s=parseInt(rsec)||0; if(!k||k<=0||m+s===0)return; const tot=m*60+s,ps=tot/k,pm=Math.floor(ps/60),pr=Math.round(ps%60); setPace({km:k,min:m,sec:s,pace:`${pm}:${String(pr).padStart(2,"0")}`,kmh:(k/(tot/3600)).toFixed(1)}); };
  const saveRun  = async () => { if(!pace)return; const n=[...runs,{...pace,type:rtype,date:new Date().toLocaleDateString("es-CL"),ts:Date.now()}]; setRuns(n); await store.set("runs",n); setPace(null); setRkm(""); setRmin(""); setRsec(""); };
  const deleteRun = async i => { const n=runs.filter((_,j)=>j!==i); setRuns(n); await store.set("runs",n); };
  const clearRuns = async () => { setRuns([]); await store.set("runs",[]); };
  const switchRoutine = async r => { setRoutine(r); setSemId(null); await store.set("routine",r); };

  const activeSessions = routine === "principal" ? MAIN : MANT;
  const todayN = new Date().getDay();
  const activeIds = activeSessions.flatMap(s => [
    ...s.exercises.filter(e=>!deletedEx.includes(e.id)).map(e=>e.id),
    ...(addedEx[s.id]||[]).filter(e=>!deletedEx.includes(e.id)).map(e=>e.id),
  ]);
  const totalEx = activeIds.length, doneEx = activeIds.filter(id=>done[id]).length;
  const wPct = totalEx ? Math.round((doneEx/totalEx)*100) : 0;

  if (!loaded) return <div style={{background:BG,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FBB,fontSize:18,letterSpacing:6,color:MU}}>CARGANDO</div>;

  const sp = { done, onToggle:toggle, custom, onSaveCustom:saveCustom, addedEx, deletedEx, onAddEx:addEx, onDeleteEx:deleteEx };

  return (
    <div style={{ background:BG, fontFamily:FD, color:TX, minHeight:"100vh", maxWidth:480, margin:"0 auto", paddingBottom:70 }}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{display:none}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}input:focus,textarea:focus{outline:none}.tap:active{opacity:.65}`}</style>

      {/* HEADER */}
      <div style={{ padding:"16px 18px 12px", position:"sticky", top:0, zIndex:90, background:BG, borderBottom:`1px solid ${BR}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div style={{ fontFamily:FBB, fontSize:20, letterSpacing:2, lineHeight:1 }}>GYM<span style={{ background:"linear-gradient(90deg,#FF512F,#DD2476)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>TRACK</span></div>
            <div style={{ fontSize:10, color:MU, marginTop:4 }}>{DAY_F[todayN]} · {isoWeek()}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:FBB, fontSize:22, letterSpacing:1, lineHeight:1 }}>{wPct}<span style={{ fontSize:11, color:MU, fontFamily:FD }}>%</span></div>
              <div style={{ fontSize:10, color:MU }}>{doneEx}/{totalEx}</div>
            </div>
            <div style={{ position:"relative", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ring pct={wPct} c1="#FF512F" c2="#DD2476" size={36} thick={3}/>
              <div style={{ position:"absolute", fontFamily:FBB, fontSize:9, color:TX }}>{wPct}</div>
            </div>
          </div>
        </div>
        {/* ROUTINE SWITCHER */}
        <div style={{ display:"flex", gap:6 }}>
          {[{id:"principal",label:"Principal"},{id:"mantenimiento",label:"Mantenimiento"}].map(r => (
            <button key={r.id} className="tap" onClick={()=>switchRoutine(r.id)}
              style={{ flex:1, background:routine===r.id?C3:"transparent", border:`1px solid ${routine===r.id?BR:C2}`, borderRadius:8, color:routine===r.id?TX:MU, fontFamily:FD, fontSize:11, fontWeight:600, padding:"7px 0", cursor:"pointer", transition:"all .15s" }}>
              {routine===r.id && <span style={{ color:"#FF512F", marginRight:4 }}>●</span>}{r.label}
            </button>
          ))}
        </div>
      </div>

      <main>
        {tab==="hoy"      && <HoyView today={todayN} sessions={activeSessions} {...sp}/>}
        {tab==="semana"   && <SemanaView sessions={activeSessions} {...sp} semId={semId} setSemId={setSemId}/>}
        {tab==="carreras" && <CarrerasView runs={runs} rkm={rkm} setRkm={setRkm} rmin={rmin} setRmin={setRmin} rsec={rsec} setRsec={setRsec} rtype={rtype} setRtype={setRtype} pace={pace} onCalc={calcPace} onSave={saveRun} onDelete={deleteRun} onClear={clearRuns}/>}
      </main>

      <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C1, borderTop:`1px solid ${BR}`, display:"flex", zIndex:100 }}>
        {[{id:"hoy",lbl:"Hoy"},{id:"semana",lbl:"Semana"},{id:"carreras",lbl:"Correr"}].map(t => (
          <button key={t.id} className="tap" onClick={()=>{setTab(t.id);setSemId(null);}} style={{ flex:1, border:"none", background:"none", cursor:"pointer", padding:"13px 0 11px", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative" }}>
            <div style={{ fontSize:11, fontWeight:600, color:tab===t.id?TX:MU, letterSpacing:.4 }}>{t.lbl}</div>
            {tab===t.id && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:24, height:2, background:"linear-gradient(90deg,#FF512F,#DD2476)", borderRadius:"0 0 2px 2px" }}/>}
          </button>
        ))}
      </nav>
    </div>
  );
}
