import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
// ── SUPABASE DIRECT API (no SDK — pure fetch) ────────────────────────────────
const SB_URL = "https://shvbedzlxkqfvrsvarzl.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodmJlZHpseGtxZnZyc3ZhcnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NTUzOTQsImV4cCI6MjEwMDMzMTM5NH0.-Q6aOXkYaGgb3z939Dq0KMZFpJ-e8mo7zmsWLOzpeoM";
let _token = null;

const _h = (extra={}) => ({
  "apikey": SB_KEY,
  "Content-Type": "application/json",
  "Authorization": `Bearer ${_token||SB_KEY}`,
  ...extra
});

const sbGet = async (table, order="") => {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?select=*${order}`, {headers:_h()});
    if(!r.ok) return [];
    return await r.json();
  } catch(e) { console.error("sbGet",e); return []; }
};
const sbGetOne = async (table, col, val) => {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}&select=*&limit=1`, {headers:_h()});
    if(!r.ok) return null;
    const arr = await r.json();
    return arr[0]||null;
  } catch(e) { return null; }
};
const sbInsert = async (table, data) => {
  try {
    await fetch(`${SB_URL}/rest/v1/${table}`, {
      method:"POST", headers:_h({"Prefer":"return=minimal"}),
      body:JSON.stringify(Array.isArray(data)?data:[data])
    });
  } catch(e) { console.error("sbInsert",e); }
};
const sbUpdate = async (table, col, val, data) => {
  try {
    await fetch(`${SB_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}`, {
      method:"PATCH", headers:_h({"Prefer":"return=minimal"}), body:JSON.stringify(data)
    });
  } catch(e) { console.error("sbUpdate",e); }
};
const sbDelete = async (table, col, val) => {
  try {
    await fetch(`${SB_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}`, {
      method:"DELETE", headers:_h()
    });
  } catch(e) { console.error("sbDelete",e); }
};
const sbUpsert = async (table, data, onConflict) => {
  try {
    await fetch(`${SB_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method:"POST",
      headers:_h({"Prefer":"resolution=merge-duplicates,return=minimal"}),
      body:JSON.stringify(Array.isArray(data)?data:[data])
    });
  } catch(e) { console.error("sbUpsert",e); }
};
const sbSignIn = async (email, password) => {
  try {
    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method:"POST", headers:{"apikey":SB_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    });
    const d = await r.json();
    if(!r.ok) return {error:d};
    _token = d.access_token;
    localStorage.setItem("sb_auth", JSON.stringify({
      token:d.access_token,
      refresh_token:d.refresh_token,
      user:d.user,
      expires_at: Date.now() + (d.expires_in||3600)*1000
    }));
    return {user:d.user, error:null};
  } catch(e) { return {error:{message:e.message}}; }
};
const sbSignOut = () => {
  _token=null; localStorage.removeItem("sb_auth");
};
const sbRefreshToken = async () => {
  try {
    const s = localStorage.getItem("sb_auth");
    if(!s) return false;
    const {refresh_token} = JSON.parse(s);
    if(!refresh_token) return false;
    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
      method:"POST", headers:{"apikey":SB_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({refresh_token})
    });
    if(!r.ok) return false;
    const d = await r.json();
    _token = d.access_token;
    localStorage.setItem("sb_auth", JSON.stringify({
      token:d.access_token,
      refresh_token:d.refresh_token||refresh_token,
      user:d.user,
      expires_at: Date.now() + (d.expires_in||3600)*1000
    }));
    return true;
  } catch(e) { return false; }
};
const sbGetSession = async () => {
  try {
    const s = localStorage.getItem("sb_auth");
    if(!s) return null;
    const {token, user, expires_at} = JSON.parse(s);
    // If token expires within 5 minutes, refresh it
    if(expires_at && Date.now() > expires_at - 300000) {
      const refreshed = await sbRefreshToken();
      if(!refreshed) return null;
      // Re-read after refresh
      const s2 = localStorage.getItem("sb_auth");
      if(!s2) return null;
      const {token:t2, user:u2} = JSON.parse(s2);
      _token = t2;
      return {user:u2};
    }
    _token = token;
    return {user};
  } catch(e) { return null; }
};
const sbSignUp = async (email, password) => {
  try {
    const r = await fetch(`${SB_URL}/auth/v1/signup`, {
      method:"POST", headers:{"apikey":SB_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    });
    const d = await r.json();
    if(!r.ok) return {error:d};
    return {user:d, error:null};
  } catch(e) { return {error:{message:e.message}}; }
};

// ── TAXONOMY ───────────────────────────────────────────────────────────────────
const HOOKS      = ["Impacto","Curiosidad","Historia","Transformacion","POV","Deseo","Antes/Despues","Pregunta","Estadistica","Problema","Error","Controversia","Comparacion","Autoridad","Miedo","Reto"];
const FORMATS    = ["Demostracion de Producto","Hablando a Camara","Tutorial","Tendencia","UGC","Voz en Off","Fundador","Podcast","Entrevista en la Calle","Estilo de Vida","Meme","Educativo","Detras de Camaras","Caso de Estudio"];
const CTAS       = ["Seguir","Guardar","Comentar","Compartir","Visitar Perfil","Comprar","Mensaje Directo","Link en Bio","Sin CTA"];
const PLATFORMS  = ["TikTok","Instagram Reels","YouTube Shorts","Facebook","LinkedIn"];
const TRIGGERS   = ["Sorprendente","Inspirador","Identificable","Gracioso","Educativo","Curiosidad","Satisfaccion","Miedo","Urgencia","Enojo","Asombro","Asco"];
const PILLARS    = ["Entretenimiento","Educacion","Conversion","Comunidad","Reconocimiento de Marca","Retencion"];
const INDUSTRIES = ["Retail","Moda","Fitness","Fintech","Automotriz","Conglomerado","Bebidas","Restaurante","Salud","Tecnología","Bienes Raíces","Entretenimiento","Otro"];
const EMP_ROLES  = ["Editor","Community Manager","Productor","Guionista","Otro"];
const DATE_RANGES = [
  { value:"all",    label:"Todo el tiempo" },
  { value:"year",   label:"Este año" },
  { value:"90days", label:"Últimos 90 días" },
  { value:"30days", label:"Últimos 30 días" },
  { value:"month",  label:"Este mes" },
  { value:"week",   label:"Esta semana" },
];
const STAGES = [
  { id:"brief",      label:"📋 Brief",      color:"#3B82F6", communityCanMove:true  },
  { id:"produccion", label:"🎬 Producción",  color:"#8B5CF6", communityCanMove:true  },
  { id:"edicion",    label:"✂️ Edición",    color:"#F59E0B", communityCanMove:true  },
  { id:"revision",   label:"🔄 Revisiones", color:"#EC4899", communityCanMove:true  },
  { id:"aprobacion", label:"👁 Aprobación", color:"#EF4444", communityCanMove:false },
  { id:"publicado",  label:"📱 Publicado",  color:"#6B7280", communityCanMove:false },
  { id:"metricas",   label:"📊 Métricas",   color:"#059669", communityCanMove:true  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
const NOW          = new Date();
const curMonth     = () => `${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;
const monthLabel   = m  => { const [y,mo]=m.split("-"); return new Date(+y,+mo-1,1).toLocaleString("es-MX",{month:"long",year:"numeric"}); };
const addMonths    = (m,n) => { const [y,mo]=m.split("-"); const d=new Date(+y,+mo-1+n,1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };
const daysSince    = d  => d ? Math.floor((NOW - new Date(d)) / 864e5) : 0;
const metricsOK    = c  => c.stage==="metricas" && daysSince(c.publishDate)>=7;
const daysLeft     = c  => Math.max(0, 7-daysSince(c.publishDate));
const fmt          = n  => n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(0)+"K":String(n||0);
const pct          = n  => n!=null?n+"%":"—";
const eng          = v  => v.views>0?(((v.likes+v.comments+v.shares+v.saves)/v.views)*100).toFixed(1)+"%":"—";
const roiStr       = v  => v.pauta>0&&v.views>0?"$"+(v.pauta/v.views*1000).toFixed(2)+"/1K":v.pauta===0?"🌱 Orgánico":"—";
const cVids        = (vs,id) => vs.filter(v=>v.clientId===id);
const totV         = vs => vs.reduce((s,v)=>s+v.views,0);
const avgE         = vs => vs.length?(vs.reduce((s,v)=>s+(v.views>0?(v.likes+v.comments+v.shares+v.saves)/v.views:0),0)/vs.length*100).toFixed(1)+"%":"—";
const avgParaTi    = vs => { const w=vs.filter(v=>v.paraTi!=null); return w.length?Math.round(w.reduce((s,v)=>s+v.paraTi,0)/w.length)+"%":"—"; };
const uid          = () => Math.random().toString(36).slice(2,10);

const groupBy = (vs,key) => {
  const m={};
  vs.forEach(v=>{if(!v[key])return;if(!m[v[key]])m[v[key]]={n:0,s:0};m[v[key]].n++;m[v[key]].s+=v.views;});
  return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n),n:d.n})).sort((a,b)=>b.avg-a.avg);
};

const filterByDate = (videos,range) => {
  if(range==="all")return videos;
  const now=NOW; let start;
  if(range==="year")  start=new Date(`${now.getFullYear()}-01-01`);
  if(range==="90days")start=new Date(+now-90*864e5);
  if(range==="30days")start=new Date(+now-30*864e5);
  if(range==="month") start=new Date(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`);
  if(range==="week")  start=new Date(+now-7*864e5);
  return videos.filter(v=>v.publishDate&&new Date(v.publishDate)>=start);
};

const teamStats = videos => {
  const roles={creator:{},editor:{},cm:{},producer:{}};
  videos.forEach(v=>{
    [["creator",v.creator],["editor",v.editor],["cm",v.cm],["producer",v.producer]].forEach(([role,name])=>{
      if(!name)return;
      if(!roles[role][name])roles[role][name]={videos:[],name};
      roles[role][name].videos.push(v);
    });
  });
  const rank=obj=>Object.values(obj).map(p=>({
    ...p,count:p.videos.length,
    avgViews:Math.round(totV(p.videos)/p.videos.length),
    topVideo:[...p.videos].sort((a,b)=>b.views-a.views)[0],
  })).sort((a,b)=>b.topVideo.views-a.topVideo.views);
  return{creators:rank(roles.creator),editors:rank(roles.editor),cms:rank(roles.cm),producers:rank(roles.producer)};
};

// ── DB TRANSFORMS ─────────────────────────────────────────────────────────────
const dbToVideo = r => ({
  id:r.id, clientId:r.client_id, title:r.title, platform:r.platform,
  publishDate:r.publish_date, url:r.url||"", creator:r.creator||"", editor:r.editor||"",
  cm:r.cm||"", producer:r.producer||"", hook:r.hook||"", format:r.format||"",
  cta:r.cta||"", trigger:r.trigger||"", pillar:r.pillar||"",
  pauta:r.pauta||0, views:r.views||0, likes:r.likes||0, comments:r.comments||0,
  shares:r.shares||0, saves:r.saves||0, duration:r.duration||0,
  watchTimeAvg:r.watch_time_avg||0, followers:r.followers||0,
  paraTi:r.para_ti, siguiendo:r.siguiendo, busqueda:r.busqueda,
});
const videoToDB = v => ({
  id:v.id, client_id:v.clientId, title:v.title, platform:v.platform||"TikTok",
  publish_date:v.publishDate, url:v.url||"", creator:v.creator||"", editor:v.editor||"",
  cm:v.cm||"", producer:v.producer||"", hook:v.hook||"", format:v.format||"",
  cta:v.cta||"", trigger:v.trigger||"", pillar:v.pillar||"",
  pauta:v.pauta||0, views:v.views||0, likes:v.likes||0, comments:v.comments||0,
  shares:v.shares||0, saves:v.saves||0, duration:v.duration||0,
  watch_time_avg:v.watchTimeAvg||0, followers:v.followers||0,
  para_ti:v.paraTi||null, siguiendo:v.siguiendo||null, busqueda:v.busqueda||null,
});
const dbToCard = r => ({
  id:r.id, clientId:r.client_id, title:r.title, editor:r.editor||"",
  dueDate:r.due_date, platform:r.platform||"TikTok", stage:r.stage,
  month:r.month, createdAt:r.created_at, publishDate:r.publish_date,
  revisionCount:r.revision_count||0,
});
const cardToDB = c => ({
  id:c.id, client_id:c.clientId, title:c.title, editor:c.editor||"",
  due_date:c.dueDate||null, platform:c.platform||"TikTok", stage:c.stage,
  month:c.month, created_at:c.createdAt||NOW.toISOString().slice(0,10),
  publish_date:c.publishDate||null, revision_count:c.revisionCount||0,
});
const dbToTargets = rows => {
  const obj={};
  rows.forEach(r=>{if(!obj[r.month])obj[r.month]={};obj[r.month][r.client_id]=r.target;});
  return obj;
};

// ── COLORS ─────────────────────────────────────────────────────────────────────
const C={
  bg:"#F8FAFC",surface:"#FFFFFF",border:"#E2E8F0",
  text:"#0F172A",muted:"#64748B",light:"#F1F5F9",
  accent:"#2563EB",gold:"#D97706",green:"#059669",
  red:"#DC2626",amber:"#F59E0B",
  sidebar:"#0F172A",sideGold:"#F59E0B",sideText:"#CBD5E1",sideMuted:"#475569",
};
const shadow  ="0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04)";
const shadowMd="0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04)";

// ── SHARED UI ─────────────────────────────────────────────────────────────────
const Tag=({children,color=C.gold})=>(
  <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:color+"18",color,border:`1px solid ${color}30`,marginRight:4,marginBottom:2}}>{children}</span>
);
const Kpi=({emoji,v,l,color=C.gold})=>(
  <div style={{background:C.surface,borderRadius:12,padding:"20px 18px",border:`1px solid ${C.border}`,boxShadow:shadow}}>
    <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{emoji} {l}</div>
    <div style={{fontSize:30,fontWeight:800,color,lineHeight:1}}>{v}</div>
  </div>
);
const Card=({children,pad=20,style={}})=>(
  <div style={{background:C.surface,borderRadius:12,padding:pad,border:`1px solid ${C.border}`,boxShadow:shadow,...style}}>{children}</div>
);
const SecTitle=({children})=>(
  <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase"}}>{children}</div>
);
const Btn=({children,primary,danger,onClick,small,disabled,style={}})=>(
  <button onClick={onClick} disabled={disabled} style={{
    padding:small?"6px 12px":"9px 18px",
    background:primary?C.text:danger?"#FEE2E2":C.surface,
    color:primary?"#FFF":danger?C.red:C.text,
    border:`1px solid ${primary?C.text:danger?"#FECACA":C.border}`,
    borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontSize:small?12:13,fontWeight:600,
    opacity:disabled?.5:1,boxShadow:shadow,...style
  }}>{children}</button>
);
const inp={width:"100%",background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"};
const DateRangePicker=({value,onChange})=>(
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{padding:"8px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.text,cursor:"pointer",boxShadow:shadow,outline:"none"}}>
    {DATE_RANGES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
  </select>
);

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function Login({onLogin}){
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);

  const go=async()=>{
    if(!email||!pass)return;
    setLoading(true);setErr("");
    const{user,error}=await sbSignIn(email,pass);
    if(error||!user){setErr("Credenciales incorrectas ❌");setLoading(false);return;}
    const prof=await sbGetOne("profiles","id",user.id);
    onLogin(user, prof||{role:"community",client_id:null,name:user.email});
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:360,padding:40,background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shadowMd}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:-1}}>TheContentHub</div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:2,marginTop:4}}>🚀 REVO LABS</div>
        </div>
        {[["📧 Email","email",email,setEmail],["🔒 Contraseña","password",pass,setPass]].map(([l,t,v,sv])=>(
          <div key={l} style={{marginBottom:16}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:6,fontWeight:500}}>{l}</div>
            <input type={t} value={v} onChange={x=>sv(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={inp}/>
          </div>
        ))}
        {err&&<div style={{color:C.red,fontSize:12,marginBottom:12}}>{err}</div>}
        <button onClick={go} disabled={loading} style={{width:"100%",padding:13,background:C.text,color:"#FFF",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1,marginTop:4}}>
          {loading?"Entrando...":"Entrar →"}
        </button>
      </div>
    </div>
  );
}

// ── SET TARGETS MODAL ─────────────────────────────────────────────────────────
function SetTargetsModal({clients,targets,month,onSave,onClose}){
  const active=clients.filter(c=>c.status!=="archived");
  const[vals,setVals]=useState(()=>active.reduce((o,c)=>({...o,[c.id]:targets[month]?.[c.id]||""}),{}));
  const save=async()=>{
    const rows=Object.entries(vals).map(([clientId,target])=>({month,client_id:clientId,target:+target||0}));
    await sbUpsert("targets",rows,"month,client_id");
    onSave();onClose();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(480px,95vw)",padding:28,fontFamily:"system-ui,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>🎯 Meta de videos — {month}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{fontSize:12,color:C.muted,marginBottom:16}}>¿Cuántos videos se deben entregar por cliente este mes?</div>
        {active.map(c=>(
          <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div>
            <input type="number" min="0" value={vals[c.id]} onChange={x=>setVals(p=>({...p,[c.id]:x.target.value}))}
              style={{...inp,width:80,textAlign:"center"}} placeholder="0"/>
          </div>
        ))}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn onClick={save} primary>Guardar metas ✓</Btn>
        </div>
      </div>
    </div>
  );
}

// ── ADD CARD MODAL ────────────────────────────────────────────────────────────
function AddCardModal({clients,employees,defaultClientId,role,activeMonth,onSave,onClose}){
  const activeClients=clients.filter(c=>c.status!=="archived");
  const activeEmps=employees.filter(e=>e.status==="active");
  const[f,sf]=useState({clientId:defaultClientId||"",title:"",editor:"",dueDate:"",platform:"TikTok",month:activeMonth||curMonth()});
  const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=async()=>{
    if(!f.clientId||!f.title.trim())return;
    const card={...f,id:"c"+Date.now(),stage:"brief",month:f.month||curMonth(),createdAt:NOW.toISOString().slice(0,10),publishDate:null,revisionCount:0};
    await sbInsert("cards",cardToDB(card));
    onSave();onClose();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(480px,95vw)",padding:28,fontFamily:"system-ui,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>📋 Nuevo video al pipeline</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        {[["Cliente","clientId","sel"],["Título del video","title","text"],["Editor","editor","empsel"],["Fecha límite","dueDate","date"]].map(([l,k,t])=>(
          <div key={k} style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
            {t==="sel"
              ?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Seleccionar...</option>{activeClients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
              :t==="empsel"
              ?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Sin asignar</option>{activeEmps.map(e=><option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}</select>
              :<input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}/>
            }
          </div>
        ))}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn onClick={save} primary>Agregar al pipeline ✓</Btn>
        </div>
      </div>
    </div>
  );
}

// ── METRICS MODAL ─────────────────────────────────────────────────────────────
function MetricsModal({card,onSave,onClose}){
  const[f,sf]=useState({url:"",creator:"",hook:"",format:"",cta:"",trigger:"",pillar:"",duration:"",views:"",likes:"",comments:"",shares:"",saves:"",followers:"",watchTimeAvg:"",pauta:"0",paraTi:"",siguiendo:"",busqueda:""});
  const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=async()=>{
    const nums=["views","likes","comments","shares","saves","followers","watchTimeAvg","pauta","paraTi","siguiendo","busqueda","duration"];
    const metrics={...f,...nums.reduce((o,k)=>({...o,[k]:f[k]!==""?+f[k]:null}),{})};
    // Create video
    const vid={
      id:"v"+Date.now(), clientId:card.clientId, title:card.title,
      platform:card.platform||"TikTok", publishDate:card.publishDate,
      url:metrics.url||"", editor:card.editor||"", cm:"", producer:"",
      creator:metrics.creator||"", hook:metrics.hook||"", format:metrics.format||"",
      cta:metrics.cta||"", trigger:metrics.trigger||"", pillar:metrics.pillar||"",
      pauta:metrics.pauta||0, views:metrics.views||0, likes:metrics.likes||0,
      comments:metrics.comments||0, shares:metrics.shares||0, saves:metrics.saves||0,
      duration:metrics.duration||0, watchTimeAvg:metrics.watchTimeAvg||0,
      followers:metrics.followers||0, paraTi:metrics.paraTi||null,
      siguiendo:metrics.siguiendo||null, busqueda:metrics.busqueda||null,
    };
    await sbInsert("videos",videoToDB(vid));
    await sbDelete("cards","id",card.id);
    onSave();onClose();
  };
  const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:12};
  const fld=(l,k,t="text",opts)=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
      {opts?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Seleccionar...</option>{opts.map(o=><option key={o}>{o}</option>)}</select>
           :<input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}/>}
    </div>
  );
  const sec=(e,l)=><div style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:1,margin:"14px 0 10px"}}>{e} {l}</div>;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:999,paddingTop:24,paddingBottom:24,overflowY:"auto"}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(640px,95vw)",fontFamily:"system-ui,sans-serif"}}>
        <div style={{padding:"22px 26px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:17,fontWeight:800,color:C.text}}>📊 Agregar métricas</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{card.title}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"14px 26px 26px"}}>
          {sec("🎨","ATRIBUTOS CREATIVOS")}
          {fld("🔗 URL del video en TikTok","url")}
          <div style={g2}><div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>🎭 Creador / Talent</div><input value={f.creator} onChange={x=>set("creator",x.target.value)} style={inp} placeholder="Nombre del talent"/></div>{fld("Duración (seg)","duration","number")}</div>
          <div style={g2}>{fld("🪝 Hook","hook","text",HOOKS)}{fld("🎬 Formato","format","text",FORMATS)}</div>
          <div style={g2}>{fld("CTA","cta","text",CTAS)}{fld("Disparador emocional","trigger","text",TRIGGERS)}</div>
          {fld("Pilar de contenido","pillar","text",PILLARS)}
          {sec("📊","MÉTRICAS")}
          <div style={g2}>{fld("👁 Vistas","views","number")}{fld("❤️ Me gusta","likes","number")}</div>
          <div style={g2}>{fld("💬 Comentarios","comments","number")}{fld("🔁 Compartidos","shares","number")}</div>
          <div style={g2}>{fld("🔖 Guardados","saves","number")}{fld("👤 Seguidores ganados","followers","number")}</div>
          <div style={g2}>{fld("⏱ Tiempo viz. prom. (seg)","watchTimeAvg","number")}{fld("💰 Pauta ($)","pauta","number")}</div>
          {sec("📡","FUENTES DE TRÁFICO")}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>{fld("📱 % Para Ti","paraTi","number")}{fld("👥 % Siguiendo","siguiendo","number")}{fld("🔍 % Búsqueda","busqueda","number")}</div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}><Btn onClick={onClose}>Cancelar</Btn><Btn onClick={save} primary>Guardar y completar ✓</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ── KANBAN CARD ───────────────────────────────────────────────────────────────
function KanbanCard({card,clients,role,onMove,onMetrics,onEarlyMetrics,onDelete,isDragging,onDragStart,onDragEnd}){
  const[confirmDel,setConfirmDel]=useState(false);
  const client=clients.find(c=>c.id===card.clientId);
  const stageIdx=STAGES.findIndex(s=>s.id===card.stage);
  const nextStage=STAGES[stageIdx+1];
  const prevStage=STAGES[stageIdx-1];
  const isMetricas=card.stage==="metricas";
  const unlocked=metricsOK(card);
  const days=daysLeft(card);
  const isOverdue=card.dueDate&&new Date(card.dueDate)<NOW&&card.stage!=="metricas";
  const stageInfo=STAGES.find(s=>s.id===card.stage);
  const canDelete=role==="admin"||(role==="community"&&card.stage==="brief");

  return(
    <div draggable onDragStart={e=>{e.dataTransfer.setData("cardId",card.id);onDragStart&&onDragStart(card.id);}} onDragEnd={()=>onDragEnd&&onDragEnd()}
      style={{background:C.surface,borderRadius:10,padding:14,border:`1px solid ${isOverdue?"#FECACA":isMetricas&&unlocked?"#BBF7D0":C.border}`,boxShadow:isDragging?"0 8px 24px rgba(0,0,0,.2)":shadow,marginBottom:10,cursor:"grab",opacity:isDragging?.3:1,borderLeft:`3px solid ${stageInfo?.color||C.border}`,transform:isDragging?"rotate(2deg)":"none",transition:"transform .1s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontSize:10,fontWeight:700,background:C.accent+"18",color:C.accent,padding:"2px 7px",borderRadius:20}}>{client?.name||"—"}</span>
        {isOverdue&&<span style={{fontSize:10,fontWeight:700,color:C.red}}>⚠️ Vencido</span>}
        {isMetricas&&!unlocked&&<span style={{fontSize:10,color:C.muted}}>🔒 {days}d</span>}
        {isMetricas&&unlocked&&<span style={{fontSize:10,fontWeight:700,color:C.green}}>🔓 Listo</span>}
        {isMetricas&&!unlocked&&<span onClick={()=>onEarlyMetrics(card)} style={{fontSize:9,color:C.accent,cursor:"pointer",textDecoration:"underline",marginLeft:4}}>agregar ahora</span>}
      </div>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6,lineHeight:1.3}}>{card.title}</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:8}}>
        {card.editor&&<div>✂️ {card.editor}</div>}
        {card.dueDate&&<div>📅 {card.dueDate}</div>}
        {(card.revisionCount||0)>0&&<div style={{color:"#EC4899",fontWeight:700}}>🔄 {card.revisionCount} revisión{card.revisionCount>1?"es":""}</div>}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {nextStage&&!(nextStage.id==="publicado"&&role==="community")&&card.stage!=="metricas"&&(
          <button onClick={()=>onMove(card.id,nextStage.id)} style={{fontSize:11,padding:"4px 10px",background:C.light,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",color:C.text,fontWeight:600}}>→ {nextStage.label.split(" ")[1]}</button>
        )}
        {card.stage==="aprobacion"&&role==="admin"&&(
          <button onClick={()=>onMove(card.id,"metricas",true)} style={{fontSize:11,padding:"4px 10px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:6,cursor:"pointer",color:C.green,fontWeight:700}}>✅ Publicar</button>
        )}
        {prevStage&&role==="admin"&&(
          <button onClick={()=>onMove(card.id,prevStage.id)} style={{fontSize:11,padding:"4px 10px",background:C.light,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",color:C.muted}}>← Back</button>
        )}
        {isMetricas&&unlocked&&(
          <button onClick={()=>onMetrics(card)} style={{fontSize:11,padding:"4px 10px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:6,cursor:"pointer",color:C.green,fontWeight:700}}>📊 Métricas</button>
        )}
        {isMetricas&&!unlocked&&(
          <button onClick={()=>onEarlyMetrics(card)} style={{fontSize:11,padding:"4px 10px",background:C.light,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",color:C.muted}}>📊 Agregar ahora</button>
        )}
        {canDelete&&!confirmDel&&(
          <button onClick={()=>setConfirmDel(true)} style={{fontSize:11,padding:"4px 10px",background:"#FEE2E2",border:"1px solid #FECACA",borderRadius:6,cursor:"pointer",color:C.red}}>🗑</button>
        )}
        {canDelete&&confirmDel&&(
          <div style={{display:"flex",gap:4,alignItems:"center",marginTop:4}}>
            <span style={{fontSize:10,color:C.red,fontWeight:700}}>¿Eliminar?</span>
            <button onClick={()=>onDelete(card.id)} style={{fontSize:10,padding:"3px 8px",background:C.red,border:"none",borderRadius:5,cursor:"pointer",color:"#fff",fontWeight:700}}>Sí</button>
            <button onClick={()=>setConfirmDel(false)} style={{fontSize:10,padding:"3px 8px",background:C.light,border:`1px solid ${C.border}`,borderRadius:5,cursor:"pointer",color:C.text}}>No</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MONTH NAV ─────────────────────────────────────────────────────────────────
function MonthNav({value,onChange}){
  const isCurrentMonth = value===curMonth();
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <button onClick={()=>onChange(addMonths(value,-1))}
        style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:14,color:C.text,boxShadow:shadow}}>←</button>
      <div style={{fontSize:14,fontWeight:700,color:C.text,minWidth:160,textAlign:"center",textTransform:"capitalize"}}>
        {monthLabel(value)}
      </div>
      <button onClick={()=>onChange(addMonths(value,1))}
        style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:14,color:C.text,boxShadow:shadow}}>→</button>
      {!isCurrentMonth&&(
        <button onClick={()=>onChange(curMonth())}
          style={{background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:11,color:C.muted,boxShadow:shadow}}>
          Hoy
        </button>
      )}
    </div>
  );
}

// ── PIPELINE OVERVIEW ─────────────────────────────────────────────────────────
function PipelineOverview({clients,cards,videos,targets,role,onSelect,onSetTargets,activeMonth,onMonthChange}){
  const month=activeMonth||curMonth();
  const[showSetTargets,setShowSetTargets]=useState(false);
  const activeClients=clients.filter(c=>c.status!=="archived");
  const publishedThisMonth=id=>videos.filter(v=>v.clientId===id&&v.publishDate?.startsWith(month)).length;
  const clientCards=id=>cards.filter(c=>c.clientId===id&&c.month===month);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div><div style={{fontSize:22,fontWeight:800,color:C.text}}>🗂 Pipeline</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Selecciona un cliente para ver su tablero</div></div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <MonthNav value={month} onChange={onMonthChange}/>
          {role==="admin"&&<Btn onClick={()=>setShowSetTargets(true)}>🎯 Metas del mes</Btn>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {activeClients.map(c=>{
          const target=targets[month]?.[c.id]||0;
          const published=publishedThisMonth(c.id);
          const cCards=clientCards(c.id);
          const pct=target>0?Math.min(100,Math.round(published/target*100)):null;
          const behind=target>0&&published<Math.floor(target*0.5);
          const stageCount=sid=>cCards.filter(x=>x.stage===sid).length;
          const stuck=cCards.filter(x=>x.stage==="revision").length;
          const statusColor=pct===100?C.green:C.accent;
          return(
            <div key={c.id} onClick={()=>onSelect(c.id)}
              style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:shadow,cursor:"pointer",overflow:"hidden"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=shadowMd;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=shadow;e.currentTarget.style.transform="none";}}>
              <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.text}}>{c.name}</div>
                  {stuck>0&&<span style={{fontSize:10,fontWeight:700,background:"#FCE7F3",color:"#BE185D",padding:"2px 8px",borderRadius:20}}>🔄 {stuck} en revisión</span>}
                </div>
                <div style={{fontSize:11,color:C.muted}}>{c.industry}</div>
              </div>
              <div style={{padding:"12px 18px"}}>
                {target>0&&<><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span style={{color:C.muted}}>Videos publicados</span><span style={{fontWeight:700,color:statusColor}}>{published}/{target}</span></div><div style={{background:C.light,borderRadius:20,height:8,overflow:"hidden",marginBottom:12}}><div style={{width:`${pct||0}%`,height:"100%",background:statusColor,borderRadius:20}}/></div></>}
                {!target&&<div style={{fontSize:12,color:C.muted,marginBottom:12}}>Sin meta definida</div>}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {STAGES.filter(s=>stageCount(s.id)>0).map(s=>(
                    <span key={s.id} style={{fontSize:10,fontWeight:700,background:s.color+"18",color:s.color,padding:"2px 8px",borderRadius:20,border:`1px solid ${s.color}30`}}>{s.label.split(" ")[0]} {stageCount(s.id)}</span>
                  ))}
                  {cCards.length===0&&published===0&&<span style={{fontSize:11,color:C.muted}}>Sin actividad</span>}
                </div>
              </div>
              <div style={{padding:"10px 18px",background:C.light,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:C.muted}}>{cCards.length} en pipeline · {published} publicados</span>
                <span style={{fontSize:12,color:C.accent,fontWeight:600}}>Ver tablero →</span>
              </div>
            </div>
          );
        })}
      </div>
      {showSetTargets&&<SetTargetsModal clients={clients} targets={targets} month={month} onSave={onSetTargets} onClose={()=>setShowSetTargets(false)}/>}
    </div>
  );
}

// ── PIPELINE BOARD ────────────────────────────────────────────────────────────
function PipelineBoard({clientId,clients,employees,cards,videos,targets,role,onAddCard,onMoveCard,onMetrics,onDeleteCard,onBack,activeMonth,onMonthChange}){
  const month=activeMonth||curMonth();
  const[draggingId,setDraggingId]=useState(null);
  const[showAddCard,setShowAddCard]=useState(false);
  const[metricsCard,setMetricsCard]=useState(null);
  const[earlyCard,setEarlyCard]=useState(null);
  const selClient=clients.find(c=>c.id===clientId);
  const monthCards=cards.filter(c=>c.clientId===clientId&&c.month===month);
  const published=videos.filter(v=>v.clientId===clientId&&v.publishDate?.startsWith(month)).length;
  const target=targets[month]?.[clientId]||0;
  const pct=target>0?Math.min(100,Math.round(published/target*100)):null;
  const behind=target>0&&published<Math.floor(target*0.5);
  const cardsInStage=sid=>monthCards.filter(c=>c.stage===sid);
  const handleDrop=(e,stageId)=>{
    e.preventDefault();
    const cardId=e.dataTransfer.getData("cardId");
    if(!cardId)return;
    if(stageId==="publicado"&&role==="community")return;
    onMoveCard(cardId,stageId);
    setDraggingId(null);
  };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {role==="admin"&&onBack&&(<button onClick={onBack} style={{background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:600,color:C.text}}>← Clientes</button>)}
          <div>
            <div style={{fontSize:20,fontWeight:800,color:C.text}}>🗂 {selClient?.name} — {month}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{monthCards.length} en pipeline · {published} publicados{target>0?` · Meta: ${target}`:""}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <MonthNav value={month} onChange={onMonthChange}/>
          <Btn primary onClick={()=>setShowAddCard(true)}>+ Nuevo video</Btn>
        </div>
      </div>
      {target>0&&(
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span style={{color:C.muted}}>Progreso mensual</span><span style={{fontWeight:700,color:pct===100?C.green:C.accent}}>{published}/{target} publicados</span></div>
            <div style={{background:C.light,borderRadius:20,height:8,overflow:"hidden"}}><div style={{width:`${pct||0}%`,height:"100%",background:pct===100?C.green:C.accent,borderRadius:20,transition:"width .3s"}}/></div>
          </div>
          <div style={{fontSize:12,fontWeight:700,color:pct===100?C.green:C.accent,flexShrink:0}}>{pct===100?"✅ ¡Meta cumplida!":Math.max(0,target-published)+" restantes"}</div>
        </div>
      )}
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {STAGES.map(s=>{const n=cardsInStage(s.id).length;return(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,background:n>=5?"#FEE2E2":n>=3?"#FEF9C3":C.light,border:`1px solid ${n>=5?"#FECACA":n>=3?"#FDE68A":C.border}`,flexShrink:0}}>
            <span style={{fontSize:13}}>{s.label.split(" ")[0]}</span>
            <span style={{fontSize:12,fontWeight:700,color:n>=5?C.red:n>=3?C.amber:C.muted}}>{n}</span>
            <span style={{fontSize:11,color:C.muted}}>{s.label.split(" ").slice(1).join(" ")}</span>
            {n>=5&&<span style={{fontSize:10,color:C.red,fontWeight:700}}>⚠️ cuello</span>}
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:12}}>
        {STAGES.map(stage=>(
          <div key={stage.id}
            onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e,stage.id)}
            onDragEnter={e=>e.currentTarget.style.background="#EFF6FF"}
            onDragLeave={e=>e.currentTarget.style.background=""}
            style={{flex:"0 0 220px",background:C.light,borderRadius:12,padding:12,border:`1px solid ${C.border}`,opacity:(stage.id==="publicado"&&role==="community")?0.6:1}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{stage.label}</div>
              <span style={{fontSize:11,fontWeight:700,background:stage.color+"22",color:stage.color,padding:"2px 8px",borderRadius:20}}>{cardsInStage(stage.id).length}</span>
            </div>
            {stage.id==="publicado"&&role==="community"&&(<div style={{fontSize:10,color:C.muted,marginBottom:8,padding:"6px 8px",background:"#F1F5F9",borderRadius:6}}>🔒 Solo admins</div>)}
            {cardsInStage(stage.id).map(card=>(
              <KanbanCard key={card.id} card={card} clients={clients} role={role}
                isDragging={draggingId===card.id} onDragStart={setDraggingId} onDragEnd={()=>setDraggingId(null)}
                onMove={onMoveCard} onMetrics={c=>setMetricsCard(c)} onEarlyMetrics={c=>setEarlyCard(c)} onDelete={onDeleteCard}/>
            ))}
            {cardsInStage(stage.id).length===0&&(<div style={{textAlign:"center",padding:"24px 10px",color:C.muted,fontSize:12,border:`2px dashed ${C.border}`,borderRadius:8,background:C.bg}}>Arrastra aquí</div>)}
          </div>
        ))}
      </div>
      {showAddCard&&<AddCardModal clients={clients} employees={employees} defaultClientId={clientId} role={role} activeMonth={month} onSave={()=>setShowAddCard(false)} onClose={()=>setShowAddCard(false)}/>}
      {metricsCard&&<MetricsModal card={metricsCard} onSave={()=>{setMetricsCard(null);}} onClose={()=>setMetricsCard(null)}/>}
      {earlyCard&&<EarlyMetricsModal card={earlyCard} onConfirm={()=>{setMetricsCard(earlyCard);setEarlyCard(null);}} onClose={()=>setEarlyCard(null)}/>}
    </div>
  );
}

// ── PIPELINE PAGE ─────────────────────────────────────────────────────────────
function PipelinePage({clients,employees,cards,videos,targets,role,onSetTargets,onMoveCard,onDeleteCard,communityClientId,initialClient,onClearInitialClient,activeMonth,onMonthChange}){
  const[selectedClient,setSelectedClient]=useState(communityClientId||initialClient||null);
  useEffect(()=>{if(initialClient){setSelectedClient(initialClient);onClearInitialClient&&onClearInitialClient();}},[ initialClient]);
  if(!selectedClient)return <PipelineOverview clients={clients} cards={cards} videos={videos} targets={targets} role={role} onSelect={setSelectedClient} onSetTargets={onSetTargets} activeMonth={activeMonth} onMonthChange={setActiveMonth}/>;
  return <PipelineBoard clientId={selectedClient} clients={clients} employees={employees} cards={cards} videos={videos} targets={targets} role={role} onAddCard={()=>{}} onMoveCard={onMoveCard} onMetrics={()=>{}} onDeleteCard={onDeleteCard} onBack={communityClientId?null:()=>setSelectedClient(null)} activeMonth={activeMonth} onMonthChange={setActiveMonth}/>;
}

// ── SETTINGS PAGE ─────────────────────────────────────────────────────────────
function SettingsPage({clients,employees,setClients,setEmployees,userRole}){
  const[tab,setTab]=useState("clients");
  const[confirmDelete,setConfirmDelete]=useState(null);
  const[editItem,setEditItem]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[newUser,setNewUser]=useState({name:"",email:"",password:"",role:"community",clientId:""});
  const[userMsg,setUserMsg]=useState("");

  const blankC={name:"",industry:"Retail",status:"active",am:"",goal:"",emoji:""};
  const[cf,setCf]=useState(blankC);const setC=(k,v)=>setCf(p=>({...p,[k]:v}));

  const saveClient=async()=>{
    if(!cf.name.trim())return;
    if(editItem?.type==="client"){
      await sbUpdate("clients","id",editItem.data.id,cf);
    }else{
      const id=uid();
      await sbInsert("clients",{...cf,id});
    }
    // no change needed - emoji is part of cf
    setCf(blankC);setEditItem(null);setShowAdd(false);
  };
  const startEditC=c=>{setCf({name:c.name,industry:c.industry,status:c.status,am:c.am,goal:c.goal});setEditItem({type:"client",data:c});setShowAdd(true);};
  const archiveClient=async id=>await sbUpdate("clients","id",id,{status:"archived"});
  const deleteClient=async id=>{await sbDelete("clients","id",id);setConfirmDelete(null);};

  const blankE={name:"",role:"Editor",status:"active"};
  const[ef,setEf]=useState(blankE);const setE=(k,v)=>setEf(p=>({...p,[k]:v}));

  const saveEmp=async()=>{
    if(!ef.name.trim())return;
    if(editItem?.type==="emp"){
      await sbUpdate("employees","id",editItem.data.id,ef);
    }else{
      await sbInsert("employees",{...ef,id:uid()});
    }
    setEf(blankE);setEditItem(null);setShowAdd(false);
  };
  const startEditE=e=>{setEf({name:e.name,role:e.role,status:e.status});setEditItem({type:"emp",data:e});setShowAdd(true);};
  const archiveEmp=async id=>await sbUpdate("employees","id",id,{status:"archived"});
  const deleteEmp=async id=>{await sbDelete("employees","id",id);setConfirmDelete(null);};

  const cancel=()=>{setCf(blankC);setEf(blankE);setEditItem(null);setShowAdd(false);};

  const createUser=async()=>{
    if(!newUser.email||!newUser.password||!newUser.name){setUserMsg("⚠️ Completa todos los campos");return;}
    setUserMsg("Creando cuenta...");
    const{user:nu,error}=await sbSignUp(newUser.email,newUser.password);
    if(error||!nu){setUserMsg("❌ "+(error?.message||error?.msg_key||"Error al crear cuenta"));return;}
    if(nu.id){
      // Use upsert so it overwrites the auto-trigger's placeholder row
      await sbUpsert("profiles",{id:nu.id,name:newUser.name,role:newUser.role,client_id:newUser.clientId||null},"id");
    }
    setUserMsg("✅ Cuenta creada para "+newUser.email);
    setNewUser({name:"",email:"",password:"",role:"community",clientId:""});
  };

  const sBadge=s=>({active:{bg:"#DCFCE7",color:"#15803D",label:"Activo"},pending:{bg:"#FEF9C3",color:"#92400E",label:"Pendiente"},archived:{bg:C.light,color:C.muted,label:"Archivado"}}[s]||{bg:C.light,color:C.muted,label:s});
  const tabS=active=>({padding:"8px 20px",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:active?C.surface:"transparent",color:active?C.text:C.muted,borderBottom:active?`2px solid ${C.text}`:"2px solid transparent"});

  const tabs=[{id:"clients",label:"🏢 Clientes"},{id:"team",label:"👥 Equipo"}];
  if(userRole==="admin")tabs.push({id:"users",label:"🔑 Usuarios"});

  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>⚙️ Configuración</div></div>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:24}}>{tabs.map(t=><button key={t.id} style={tabS(tab===t.id)} onClick={()=>{setTab(t.id);cancel();}}>{t.label}</button>)}</div>

      {/* CLIENTS */}
      {tab==="clients"&&(
        <div>
          {!showAdd&&<div style={{marginBottom:16}}><Btn primary onClick={()=>setShowAdd(true)}>+ Agregar cliente</Btn></div>}
          {showAdd&&(
            <Card style={{marginBottom:20,borderLeft:`4px solid ${C.accent}`}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>{editItem?"✏️ Editar":"➕ Nuevo cliente"}</div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:6}}>Emoji del cliente</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {["🏪","👗","💪","💳","🚗","🏢","🍺","🍽️","❤️","💻","🏠","🎬","⭐","🔥","💡","🎯","🚀","💎","🌟","🎪"].map(e=>(
                    <button key={e} type="button" onClick={()=>setC("emoji",e)}
                      style={{fontSize:20,padding:"4px 6px",border:`2px solid ${cf.emoji===e?C.accent:C.border}`,borderRadius:8,cursor:"pointer",background:cf.emoji===e?C.accent+"18":C.surface}}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["Nombre","name"],["Account Manager","am"]].map(([l,k])=>(
                  <div key={k}><div style={{fontSize:11,color:C.muted,marginBottom:4}}>{l}</div><input value={cf[k]} onChange={x=>setC(k,x.target.value)} style={inp}/></div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Industria</div><select value={cf.industry} onChange={x=>setC("industry",x.target.value)} style={inp}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></div>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Estado</div><select value={cf.status} onChange={x=>setC("status",x.target.value)} style={inp}><option value="active">Activo</option><option value="pending">Pendiente</option></select></div>
              </div>
              <div style={{marginTop:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Objetivo</div><input value={cf.goal} onChange={x=>setC("goal",x.target.value)} style={inp}/></div>
              <div style={{display:"flex",gap:10,marginTop:16}}><Btn primary onClick={saveClient}>Guardar ✓</Btn><Btn onClick={cancel}>Cancelar</Btn></div>
            </Card>
          )}
          <Card pad={0}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Cliente","Industria","AM","Estado","Acciones"].map(h=><th key={h} style={{textAlign:"left",padding:"12px 16px",fontSize:10,color:C.muted,letterSpacing:1,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
              <tbody>{clients.map(c=>{const s=sBadge(c.status);const isCf=confirmDelete===c.id;return(
                <tr key={c.id}>
                  <td style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.goal}</div></td>
                  <td style={{padding:"13px 16px",fontSize:12,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{c.industry}</td>
                  <td style={{padding:"13px 16px",fontSize:12,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{c.am||"—"}</td>
                  <td style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}><span style={{background:s.bg,color:s.color,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20}}>{s.label}</span></td>
                  <td style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
                    {isCf?<div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:C.red,fontWeight:600}}>⚠️ ¿Eliminar?</span><Btn danger small onClick={()=>deleteClient(c.id)}>Sí</Btn><Btn small onClick={()=>setConfirmDelete(null)}>No</Btn></div>
                    :<div style={{display:"flex",gap:6}}>{c.status!=="archived"&&<Btn small onClick={()=>startEditC(c)}>✏️</Btn>}{c.status==="active"&&<Btn small onClick={()=>archiveClient(c.id)}>📦</Btn>}<Btn small danger onClick={()=>setConfirmDelete(c.id)}>🗑️</Btn></div>}
                  </td>
                </tr>
              );})}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TEAM */}
      {tab==="team"&&(
        <div>
          {!showAdd&&<div style={{marginBottom:16}}><Btn primary onClick={()=>setShowAdd(true)}>+ Agregar miembro</Btn></div>}
          {showAdd&&(
            <Card style={{marginBottom:20,borderLeft:`4px solid ${C.accent}`}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>{editItem?"✏️ Editar":"➕ Nuevo miembro"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Nombre</div><input value={ef.name} onChange={x=>setE("name",x.target.value)} style={inp}/></div>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Rol</div><select value={ef.role} onChange={x=>setE("role",x.target.value)} style={inp}>{EMP_ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:16}}><Btn primary onClick={saveEmp}>Guardar ✓</Btn><Btn onClick={cancel}>Cancelar</Btn></div>
            </Card>
          )}
          {EMP_ROLES.filter(r=>employees.some(e=>e.role===r)).map(role=>(
            <div key={role} style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:10,textTransform:"uppercase"}}>{role==="Editor"?"✂️":role==="Community Manager"?"📱":role==="Productor"?"🎥":"👤"} {role}</div>
              <Card pad={0}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Nombre","Estado","Acciones"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 16px",fontSize:10,color:C.muted,letterSpacing:1,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
                  <tbody>{employees.filter(e=>e.role===role).map(e=>{const isCf=confirmDelete===e.id;return(
                    <tr key={e.id}>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:600,color:e.status==="archived"?C.muted:C.text}}>{e.name}</td>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`}}><span style={{background:e.status==="active"?"#DCFCE7":C.light,color:e.status==="active"?"#15803D":C.muted,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20}}>{e.status==="active"?"Activo":"Archivado"}</span></td>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`}}>
                        {isCf?<div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:C.red,fontWeight:600}}>⚠️ ¿Eliminar?</span><Btn danger small onClick={()=>deleteEmp(e.id)}>Sí</Btn><Btn small onClick={()=>setConfirmDelete(null)}>No</Btn></div>
                        :<div style={{display:"flex",gap:6}}><Btn small onClick={()=>startEditE(e)}>✏️</Btn>{e.status==="active"&&<Btn small onClick={()=>archiveEmp(e.id)}>📦</Btn>}<Btn small danger onClick={()=>setConfirmDelete(e.id)}>🗑️</Btn></div>}
                      </td>
                    </tr>
                  );})}
                  </tbody>
                </table>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* USERS */}
      {tab==="users"&&userRole==="admin"&&(
        <div>
          <Card style={{marginBottom:24,borderLeft:`4px solid ${C.accent}`}}>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>➕ Crear cuenta de equipo</div>
            <div style={{padding:12,background:"#FFF7ED",borderRadius:8,border:"1px solid #FED7AA",marginBottom:16,fontSize:12,color:"#92400E"}}>
              ⚠️ Antes de crear cuentas, ve a Supabase → Authentication → Settings y desactiva "Enable email confirmations". Si no, el usuario recibirá un email de confirmación antes de poder entrar.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["Nombre completo","name","text"],["Email","email","email"],["Contraseña temporal","password","password"]].map(([l,k,t])=>(
                <div key={k} style={{gridColumn:k==="name"?"1/-1":"auto"}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
                  <input type={t} value={newUser[k]} onChange={x=>setNewUser(p=>({...p,[k]:x.target.value}))} style={inp}/>
                </div>
              ))}
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Rol</div>
                <select value={newUser.role} onChange={x=>setNewUser(p=>({...p,role:x.target.value}))} style={inp}>
                  <option value="admin">Admin</option>
                  <option value="community">Community</option>
                </select>
              </div>
              {newUser.role==="community"&&(
                <div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Cliente asignado</div>
                  <select value={newUser.clientId} onChange={x=>setNewUser(p=>({...p,clientId:x.target.value}))} style={inp}>
                    <option value="">Sin asignar</option>
                    {clients.filter(c=>c.status!=="archived").map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",marginTop:16}}>
              <Btn primary onClick={createUser}>Crear cuenta ✓</Btn>
              {userMsg&&<span style={{fontSize:12,color:userMsg.startsWith("✅")?C.green:userMsg.startsWith("❌")?C.red:C.muted}}>{userMsg}</span>}
            </div>
          </Card>
          <div style={{fontSize:12,color:C.muted}}>
            💡 Las cuentas creadas aquí permiten a cada miembro del equipo entrar con su propio email y contraseña desde cualquier dispositivo. Los admins ven todo. Los community managers solo ven su cliente asignado.
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({clients,videos,onClient}){
  const top=[...videos].sort((a,b)=>b.views-a.views)[0];
  const hd=groupBy(videos,"hook");
  const clName=id=>clients.find(c=>c.id===id)?.name||"";
  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>📊 Agency Dashboard</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>{videos.length} videos en el período seleccionado</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        <Kpi emoji="👁" v={fmt(totV(videos))} l="Vistas totales"/>
        <Kpi emoji="🎬" v={videos.length} l="Videos publicados"/>
        <Kpi emoji="💹" v={avgE(videos)} l="Engagement promedio" color={C.accent}/>
        <Kpi emoji="📡" v={avgParaTi(videos)} l="% Para Ti promedio" color={C.green}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16}}>
        <Card>
          <SecTitle>🏢 Clientes</SecTitle>
          {clients.filter(c=>c.status!=="archived").map(c=>{
            const vs=cVids(videos,c.id);const has=vs.length>0;
            return(<div key={c.id} onClick={()=>onClient(c.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>{has?"🟢":"⚪"}</span>
                <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.industry}</div></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:15,fontWeight:800,color:has?C.gold:C.muted}}>{has?fmt(totV(vs)):"Sin datos"}</div>
                <div style={{fontSize:11,color:C.muted}}>{vs.length} videos</div>
              </div>
            </div>);
          })}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {top&&(<Card>
            <SecTitle>🏆 Video del período</SecTitle>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:4,lineHeight:1.3}}>{top.title}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{clName(top.clientId)} · {top.publishDate}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[[fmt(top.views),"👁 Vistas"],[eng(top),"💹 Eng."],[`${top.paraTi??'—'}%`,"📡 Para Ti"]].map(([v,l])=>(
                <div key={l} style={{background:C.light,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.text}}>{v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{l}</div></div>
              ))}
            </div>
            <Tag>{top.hook}</Tag><Tag color={C.accent}>{top.format}</Tag>
          </Card>)}
          <Card style={{flex:1}}>
            <SecTitle>🪝 Top Hooks</SecTitle>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={hd.slice(0,5)} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}>
                <XAxis type="number" hide/><YAxis type="category" dataKey="name" width={88} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg"]}/>
                <Bar dataKey="avg" radius={4}>{hd.slice(0,5).map((_,i)=><Cell key={i} fill={i===0?C.gold:i===1?C.amber:"#CBD5E1"}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── MONTHLY DASHBOARD (new home) ─────────────────────────────────────────────
function MonthlyDashboard({clients,cards,videos,targets,onGoToPipeline,activeMonth,onMonthChange}){
  const month=activeMonth||curMonth();
  const setMonth=onMonthChange;
  const activeClients=clients.filter(c=>c.status!=="archived");

  const publishedCount = clientId =>
    videos.filter(v=>v.clientId===clientId&&v.publishDate?.startsWith(month)).length;
  const pipelineCount = clientId =>
    cards.filter(c=>c.clientId===clientId&&c.month===month).length;
  const targetCount = clientId => targets[month]?.[clientId]||0;

  const totalTarget    = activeClients.reduce((s,c)=>s+targetCount(c.id),0);
  const totalPublished = activeClients.reduce((s,c)=>s+publishedCount(c.id),0);
  const totalPipeline  = activeClients.reduce((s,c)=>s+pipelineCount(c.id),0);
  const healthPct      = totalTarget>0?Math.min(100,Math.round(totalPublished/totalTarget*100)):null;
  // health display is always blue (progress) or green (complete) — never red

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:C.text}}>📊 Dashboard</div>
          <div style={{fontSize:13,color:C.muted,marginTop:4,textTransform:"capitalize"}}>{monthLabel(month)}</div>
        </div>
        <MonthNav value={month} onChange={setMonth}/>
      </div>

      {/* Agency health bar */}
      <div style={{background:C.surface,borderRadius:14,padding:24,border:`1px solid ${C.border}`,boxShadow:shadow,marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
          <div>
            <div style={{fontSize:12,color:C.muted,letterSpacing:1,fontWeight:600,marginBottom:4}}>MONTHLY PROGRESS</div>
            <div style={{fontSize:28,fontWeight:900,color:healthPct===100?C.green:C.accent}}>
              {healthPct===100?"✅ ¡Meta cumplida!":healthPct===null?"Define las metas del mes":`${healthPct||0}% completado`}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:36,fontWeight:900,color:C.text}}>{totalPublished}<span style={{fontSize:18,color:C.muted}}>/{totalTarget||"—"}</span></div>
            <div style={{fontSize:12,color:C.muted}}>videos publicados este mes</div>
          </div>
        </div>
        <div style={{background:C.light,borderRadius:20,height:14,overflow:"hidden",marginBottom:10}}>
          <div style={{width:`${healthPct||0}%`,height:"100%",background:healthPct===100?C.green:C.accent,borderRadius:20,transition:"width .6s ease"}}>
          </div>
        </div>
        <div style={{display:"flex",gap:20,fontSize:12,color:C.muted}}>
          <span style={{color:C.accent,fontWeight:600}}>✅ {totalPublished} publicados</span>
          <span>🎬 {totalPipeline} en pipeline</span>
          {totalTarget>0&&totalPublished<totalTarget&&<span>🎯 {totalTarget-totalPublished} restantes</span>}
        </div>
      </div>

      {/* Client cards grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
        {activeClients.map(c=>{
          const pub=publishedCount(c.id);
          const pip=pipelineCount(c.id);
          const tgt=targetCount(c.id);
          const pct=tgt>0?Math.min(100,Math.round(pub/tgt*100)):null;
          const color=pct===100?C.green:C.accent;
          const stageCount=sid=>cards.filter(x=>x.clientId===c.id&&x.month===month&&x.stage===sid).length;

          return(
            <div key={c.id}
              onClick={()=>onGoToPipeline(c.id)}
              style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:shadow,cursor:"pointer",overflow:"hidden"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=shadowMd;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=shadow;e.currentTarget.style.transform="none";}}>

              {/* Card header */}
              <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  {c.emoji&&<span style={{fontSize:24}}>{c.emoji}</span>}
                  <div style={{fontSize:16,fontWeight:800,color:C.text}}>{c.name}</div>
                </div>
                <div style={{fontSize:11,color:C.muted}}>{c.industry}</div>
              </div>

              {/* Progress */}
              <div style={{padding:"12px 18px"}}>
                {tgt>0?<>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                    <span style={{color:C.muted}}>Progreso del mes</span>
                    <span style={{fontWeight:800,color}}>{pub}/{tgt}</span>
                  </div>
                  <div style={{background:C.light,borderRadius:20,height:8,overflow:"hidden",marginBottom:10}}>
                    <div style={{width:`${pct||0}%`,height:"100%",background:color,borderRadius:20,transition:"width .3s"}}/>
                  </div>
                </>:<div style={{fontSize:12,color:C.muted,marginBottom:10}}>Sin meta definida</div>}

                {/* Stage mini badges */}
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {STAGES.filter(s=>stageCount(s.id)>0).map(s=>(
                    <span key={s.id} style={{fontSize:10,fontWeight:700,background:s.color+"18",color:s.color,padding:"2px 7px",borderRadius:20}}>
                      {s.label.split(" ")[0]} {stageCount(s.id)}
                    </span>
                  ))}
                  {pip===0&&pub===0&&<span style={{fontSize:11,color:C.muted}}>Sin actividad</span>}
                </div>
              </div>

              {/* Footer */}
              <div style={{padding:"8px 18px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:C.muted}}>{pip} en pipeline · {pub} publicados</span>
                <span style={{fontSize:11,color:C.accent,fontWeight:600}}>Ver pipeline →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INTELIGENCIA CREATIVA ─────────────────────────────────────────────────────
function AnalyticsPage({videos,clients}){
  const hd=groupBy(videos,"hook");const fd=groupBy(videos,"format");const cd=groupBy(videos,"cta");
  const w=videos.filter(v=>v.paraTi!=null);
  const avgP=w.length?Math.round(w.reduce((s,v)=>s+v.paraTi,0)/w.length):0;
  const avgS=w.length?Math.round(w.reduce((s,v)=>s+(v.siguiendo||0),0)/w.length):0;
  const avgB=w.length?Math.round(w.reduce((s,v)=>s+(v.busqueda||0),0)/w.length):0;
  const organic=videos.filter(v=>v.pauta===0);const pautado=videos.filter(v=>v.pauta>0);
  const avgOrg=organic.length?Math.round(totV(organic)/organic.length):0;
  const avgPau=pautado.length?Math.round(totV(pautado)/pautado.length):0;
  const topAlgo=[...w].sort((a,b)=>b.paraTi-a.paraTi).slice(0,5);
  const chart=(data,title,color)=>(
    <Card><SecTitle>{title}</SecTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.slice(0,7)} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}>
          <XAxis type="number" hide/><YAxis type="category" dataKey="name" width={100} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg vistas"]}/>
          <Bar dataKey="avg" radius={4}>{data.slice(0,7).map((_,i)=><Cell key={i} fill={i===0?color:i===1?color+"BB":"#CBD5E1"}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>🧠 Analytics</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>{videos.length} videos analizados en el período</div></div>
      {(()=>{
        const totalViews=videos.reduce((s,v)=>s+v.views,0);
        const avgEng=videos.length?(videos.reduce((s,v)=>s+(v.views>0?(v.likes+v.comments+v.shares+v.saves)/v.views:0),0)/videos.length*100).toFixed(1)+"%":"—";
        const wPara=videos.filter(v=>v.paraTi!=null);
        const avgPara=wPara.length?Math.round(wPara.reduce((s,v)=>s+v.paraTi,0)/wPara.length)+"%":"—";
        return(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
            <Kpi emoji="👁" v={fmt(totalViews)} l="Vistas totales"/>
            <Kpi emoji="🎬" v={videos.length} l="Videos publicados"/>
            <Kpi emoji="💹" v={avgEng} l="Engagement promedio" color={C.accent}/>
            <Kpi emoji="📡" v={avgPara} l="% Para Ti promedio" color={C.green}/>
          </div>
        );
      })()}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        <Card style={{borderLeft:`4px solid ${C.gold}`}}><div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>🪝 MEJOR HOOK</div><div style={{fontSize:20,fontWeight:800,color:C.text}}>{hd[0]?.name||"—"}</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{hd[0]?.n} videos · avg {fmt(hd[0]?.avg||0)} vistas</div></Card>
        <Card style={{borderLeft:`4px solid ${C.accent}`}}><div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>🎬 MEJOR FORMATO</div><div style={{fontSize:20,fontWeight:800,color:C.text}}>{fd[0]?.name||"—"}</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{fd[0]?.n} videos · avg {fmt(fd[0]?.avg||0)} vistas</div></Card>
        <Card style={{borderLeft:`4px solid ${C.green}`}}><div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>📡 PARA TI PROMEDIO</div><div style={{fontSize:20,fontWeight:800,color:C.green}}>{avgP}%</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{avgP>=70?"🔥 El algoritmo te impulsa":"Mejorable — fortalecer el hook"}</div></Card>
      </div>
      {/* Client performance chart */}
      {(()=>{
        const clientData=clients
          .map(c=>({name:c.name,views:videos.filter(v=>v.clientId===c.id).reduce((s,v)=>s+v.views,0),emoji:c.emoji||""}))
          .filter(c=>c.views>0)
          .sort((a,b)=>b.views-a.views);
        if(clientData.length===0)return null;
        return(
          <Card style={{marginBottom:16}}>
            <SecTitle>🏢 Rendimiento por cliente</SecTitle>
            <ResponsiveContainer width="100%" height={Math.max(120,clientData.length*44)}>
              <BarChart data={clientData} layout="vertical" margin={{left:0,right:30,top:0,bottom:0}}>
                <XAxis type="number" hide/>
                <YAxis type="category" dataKey="name" width={110} tick={{fill:C.muted,fontSize:12}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}} formatter={v=>[fmt(v),"Vistas"]}/>
                <Bar dataKey="views" radius={4}>
                  {clientData.map((_,i)=><Cell key={i} fill={i===0?C.gold:i===1?C.accent:i===2?"#8B5CF6":"#CBD5E1"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        );
      })()}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {chart(hd,"🪝 Vistas promedio por Hook",C.gold)}
        {chart(fd,"🎬 Vistas promedio por Formato",C.accent)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <SecTitle>📡 Fuentes de tráfico (promedio)</SecTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[["📱 Para Ti",avgP,C.green],["👥 Siguiendo",avgS,C.accent],["🔍 Búsqueda",avgB,C.gold]].map(([l,v,color])=>(
              <div key={l} style={{textAlign:"center",background:C.light,borderRadius:10,padding:14}}><div style={{fontSize:26,fontWeight:800,color}}>{v}%</div><div style={{fontSize:10,color:C.muted,marginTop:4}}>{l}</div></div>
            ))}
          </div>
          <SecTitle>🔥 Videos más algorítmicos</SecTitle>
          {topAlgo.map(v=>(
            <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:12,color:C.text,maxWidth:200}}>{v.title}</div>
              <div style={{display:"flex",gap:8}}><span style={{fontSize:11,color:C.muted}}>{fmt(v.views)} vistas</span><span style={{background:C.green+"18",color:C.green,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{v.paraTi}%</span></div>
            </div>
          ))}
        </Card>
        <Card>
          <SecTitle>💰 ¿La pauta decide el éxito?</SecTitle>
          <div style={{padding:14,background:C.light,borderRadius:10,marginBottom:16}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Vistas promedio: orgánico vs pautado</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["🌱 Sin pauta",avgOrg,organic.length],["💸 Con pauta",avgPau,pautado.length]].map(([l,v,n])=>(
                <div key={l} style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>{fmt(v)}</div><div style={{fontSize:10,color:C.muted}}>{l} ({n} videos)</div></div>
              ))}
            </div>
          </div>
          <div style={{padding:12,background:"#FFF7ED",borderRadius:8,border:"1px solid #FED7AA",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#9A3412",marginBottom:4}}>💡 El hallazgo clave</div>
            <div style={{fontSize:12,color:"#7C2D12",lineHeight:1.5}}>La pauta amplifica, no crea. El hook decide el techo. Optimiza el contenido primero, amplifica después.</div>
          </div>
          <SecTitle>🎯 CTAs por avg vistas</SecTitle>
          {cd.slice(0,5).map(c=>(<div key={c.name} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:12,color:C.text}}>{c.name}</span><span style={{fontSize:12,fontWeight:700,color:C.gold}}>{fmt(c.avg)} avg</span></div>))}
        </Card>
      </div>
    </div>
  );
}

// ── EQUIPO ─────────────────────────────────────────────────────────────────────
function TeamPage({videos}){
  const{creators,editors,cms,producers}=useMemo(()=>teamStats(videos),[videos]);
  const HeroCard=({emoji,role,person})=>person?(
    <Card style={{borderTop:`4px solid ${C.gold}`}}>
      <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>{emoji} MEJOR {role.toUpperCase()}</div>
      <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:4}}>{person.name}</div>
      <div style={{fontSize:13,color:C.gold,fontWeight:600,marginBottom:10}}>🏆 {person.topVideo.title}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[[fmt(person.topVideo.views),"Top vistas"],[person.count+" videos","Participaciones"],[fmt(person.avgViews),"Avg vistas"],[eng(person.topVideo),"Eng. top"]].map(([v,l])=>(
          <div key={l} style={{background:C.light,borderRadius:8,padding:10}}><div style={{fontSize:16,fontWeight:800,color:C.text}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>
        ))}
      </div>
    </Card>
  ):(<Card><div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Sin datos</div></Card>);

  const RankTable=({title,emoji,people})=>(
    <Card>
      <SecTitle>{emoji} {title}</SecTitle>
      {people.length===0?<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:20}}>Sin datos</div>
      :<table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["#","Nombre","Videos","Avg Vistas","Mejor Video","Top Vistas"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:C.muted,letterSpacing:1,fontWeight:600,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{people.map((p,i)=>(
          <tr key={p.name}>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.muted}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:600,color:C.text}}>{p.name}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.muted}}>{p.count}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.gold}}>{fmt(p.avgViews)}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:12,color:C.muted,maxWidth:180}}>{p.topVideo.title}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.accent}}>{fmt(p.topVideo.views)}</td>
          </tr>
        ))}</tbody>
      </table>}
    </Card>
  );

  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>👥 Equipo</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Rendimiento basado en el mejor video — calidad sobre cantidad</div></div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${[editors[0],cms[0],producers[0],creators[0]].filter(Boolean).length},1fr)`,gap:16,marginBottom:24}}>
        {editors[0]&&<HeroCard emoji="✂️" role="Editor" person={editors[0]}/>}
        {cms[0]&&<HeroCard emoji="📱" role="Community Manager" person={cms[0]}/>}
        {producers[0]&&<HeroCard emoji="🎥" role="Productor" person={producers[0]}/>}
        {creators[0]&&<HeroCard emoji="🎭" role="Creador" person={creators[0]}/>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {editors.length>0&&<RankTable title="Editores" emoji="✂️" people={editors}/>}
        {cms.length>0&&<RankTable title="Community Managers" emoji="📱" people={cms}/>}
        {producers.length>0&&<RankTable title="Productores" emoji="🎥" people={producers}/>}
        {creators.length>0&&<RankTable title="Talent (externo)" emoji="🎭" people={creators}/>}
      </div>
    </div>
  );
}

// ── CLIENT PAGE ───────────────────────────────────────────────────────────────
function ClientPage({client,videos,onAdd}){
  const vs=cVids(videos,client.id);const top=[...vs].sort((a,b)=>b.views-a.views)[0];const bot=[...vs].sort((a,b)=>a.views-b.views)[0];
  const[q,sq]=useState("");
  const filtered=vs.filter(v=>[v.title,v.creator,v.hook,v.format].some(x=>x?.toLowerCase().includes(q.toLowerCase())));
  const hd=groupBy(vs,"hook");
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div><div style={{fontSize:22,fontWeight:800,color:C.text}}>{client.name}</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{client.industry} · AM: {client.am} · {client.goal}</div></div>
        <Btn onClick={onAdd} primary>+ Agregar video</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <Kpi emoji="🎬" v={vs.length} l="Videos"/>
        <Kpi emoji="👁" v={fmt(totV(vs))} l="Vistas"/>
        <Kpi emoji="💹" v={avgE(vs)} l="Engagement" color={C.accent}/>
        <Kpi emoji="📡" v={avgParaTi(vs)} l="% Para Ti" color={C.green}/>
      </div>
      {vs.length===0?<Card style={{textAlign:"center",padding:48}}><div style={{fontSize:40,marginBottom:12}}>📹</div><div style={{fontSize:15,fontWeight:700,color:C.text}}>Sin videos aún</div></Card>
      :<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          {hd.length>0&&(<Card><SecTitle>🪝 Hook Performance</SecTitle>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hd} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}>
                <XAxis type="number" hide/><YAxis type="category" dataKey="name" width={95} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg vistas"]}/>
                <Bar dataKey="avg" radius={4}>{hd.map((_,i)=><Cell key={i} fill={i===0?C.gold:i===1?C.amber:"#CBD5E1"}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>)}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {top&&(<Card style={{borderLeft:`4px solid ${C.green}`}}><SecTitle>🏆 Mejor video</SecTitle><div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:8,lineHeight:1.3}}>{top.title}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>{[[fmt(top.views),"Vistas"],[eng(top),"Engagement"],[`${top.paraTi??'—'}%`,"Para Ti"],[roiStr(top),"ROI"]].map(([v,l])=>(<div key={l} style={{background:C.light,borderRadius:8,padding:8,textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:C.text}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>))}</div><Tag>{top.hook}</Tag><Tag color={C.accent}>{top.format}</Tag></Card>)}
            {bot&&bot.id!==top?.id&&(<Card style={{borderLeft:`4px solid ${C.red}`}}><SecTitle>⚠️ Peor video</SecTitle><div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>{bot.title}</div><div style={{fontSize:13,color:C.gold,fontWeight:700}}>{fmt(bot.views)} vistas</div><div style={{marginTop:6}}><Tag color={C.red}>{bot.hook}</Tag></div></Card>)}
          </div>
        </div>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <SecTitle>🎬 Videos ({vs.length})</SecTitle>
            <input value={q} onChange={x=>sq(x.target.value)} placeholder="🔍 Buscar..." style={{...inp,width:220,fontSize:12,padding:"7px 10px"}}/>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
              <thead><tr>{["Título","Fecha","Hook","Vistas","Eng.","Para Ti","Pauta","ROI"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:C.muted,letterSpacing:1,fontWeight:600,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
              <tbody>{filtered.sort((a,b)=>b.views-a.views).map(v=>(
                <tr key={v.id} onMouseEnter={e=>e.currentTarget.style.background=C.light} onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`}}><div style={{fontSize:13,fontWeight:600,color:C.text,maxWidth:220}}>{v.title}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{v.creator}</div></td>
                  <td style={{padding:"11px 10px",fontSize:11,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{v.publishDate}</td>
                  <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`}}><Tag>{v.hook}</Tag></td>
                  <td style={{padding:"11px 10px",fontSize:14,fontWeight:800,color:C.gold,borderBottom:`1px solid ${C.border}`}}>{fmt(v.views)}</td>
                  <td style={{padding:"11px 10px",fontSize:12,borderBottom:`1px solid ${C.border}`}}>{eng(v)}</td>
                  <td style={{padding:"11px 10px",fontSize:12,fontWeight:700,color:v.paraTi>=70?C.green:C.muted,borderBottom:`1px solid ${C.border}`}}>{pct(v.paraTi)}</td>
                  <td style={{padding:"11px 10px",fontSize:12,color:C.muted,borderBottom:`1px solid ${C.border}`}}>${v.pauta}</td>
                  <td style={{padding:"11px 10px",fontSize:11,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{roiStr(v)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      </>}
    </div>
  );
}

// ── ADD VIDEO MODAL ───────────────────────────────────────────────────────────
function AddModal({clients,employees,defaultClientId,onSave,onClose}){
  const activeClients=clients.filter(c=>c.status!=="archived");
  const activeEmps=employees.filter(e=>e.status==="active");
  const blank={clientId:defaultClientId||"",title:"",platform:"TikTok",publishDate:new Date().toISOString().slice(0,10),url:"",creator:"",editor:"",cm:"",producer:"",hook:"",format:"",cta:"",trigger:"",pillar:"",pauta:"0",views:"0",likes:"0",comments:"0",shares:"0",saves:"0",duration:"0",watchTimeAvg:"0",followers:"0",paraTi:"",siguiendo:"",busqueda:""};
  const[f,sf]=useState(blank);const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=async()=>{
    if(!f.clientId||!f.title)return;
    const nums=["pauta","views","likes","comments","shares","saves","duration","watchTimeAvg","followers","paraTi","siguiendo","busqueda"];
    const vid={...f,id:"v"+Date.now(),...nums.reduce((o,k)=>({...o,[k]:f[k]!==""?+f[k]:null}),{})};
    await sbInsert("videos",videoToDB(vid));
    onSave();onClose();
  };
  const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:12};
  const fld=(l,k,t="text",opts)=>(
    <div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
      {opts?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Seleccionar...</option>{opts.map(o=><option key={o}>{o}</option>)}</select>
           :<input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}/>}
    </div>
  );
  const empSel=(l,k)=>(<div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div><select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Sin asignar</option>{activeEmps.map(e=><option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}</select></div>);
  const sec=(e,l)=><div style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:1,margin:"14px 0 10px"}}>{e} {l}</div>;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:999,paddingTop:24,paddingBottom:24,overflowY:"auto"}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(680px,95vw)",fontFamily:"system-ui,sans-serif"}}>
        <div style={{padding:"22px 26px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>📹 Agregar video</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"14px 26px 26px"}}>
          {sec("📌","INFO GENERAL")}
          <div style={g2}><div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Cliente</div><select value={f.clientId} onChange={x=>set("clientId",x.target.value)} style={inp}><option value="">Seleccionar...</option>{activeClients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>{fld("Plataforma","platform","text",PLATFORMS)}</div>
          {fld("Título del video","title")}
          {fld("🔗 URL del video en TikTok","url")}
          <div style={g2}>{fld("Fecha","publishDate","date")}{fld("Duración (seg)","duration","number")}</div>
          <div style={g2}>{fld("🎭 Creador / Talent","creator")}{empSel("✂️ Editor","editor")}</div>
          <div style={g2}>{empSel("📱 Community Manager","cm")}{empSel("🎥 Productor","producer")}</div>
          {fld("💰 Pauta ($)","pauta","number")}
          {sec("🎨","ATRIBUTOS CREATIVOS")}
          <div style={g2}>{fld("🪝 Hook","hook","text",HOOKS)}{fld("🎬 Formato","format","text",FORMATS)}</div>
          <div style={g2}>{fld("CTA","cta","text",CTAS)}{fld("Disparador emocional","trigger","text",TRIGGERS)}</div>
          {fld("Pilar de contenido","pillar","text",PILLARS)}
          {sec("📊","MÉTRICAS")}
          <div style={g2}>{fld("👁 Vistas","views","number")}{fld("❤️ Me gusta","likes","number")}</div>
          <div style={g2}>{fld("💬 Comentarios","comments","number")}{fld("🔁 Compartidos","shares","number")}</div>
          <div style={g2}>{fld("🔖 Guardados","saves","number")}{fld("👤 Seguidores ganados","followers","number")}</div>
          {fld("⏱ Tiempo viz. promedio (seg)","watchTimeAvg","number")}
          {sec("📡","FUENTES DE TRÁFICO")}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>{fld("📱 % Para Ti","paraTi","number")}{fld("👥 % Siguiendo","siguiendo","number")}{fld("🔍 % Búsqueda","busqueda","number")}</div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}><Btn onClick={onClose}>Cancelar</Btn><Btn onClick={save} primary>Guardar ✓</Btn></div>
        </div>
      </div>
    </div>
  );
}


// ── EARLY METRICS MODAL ──────────────────────────────────────────────────────
function EarlyMetricsModal({card,onConfirm,onClose}){
  const days = card.publishDate ? Math.floor((new Date() - new Date(card.publishDate)) / 864e5) : 0;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(420px,95vw)",padding:32,fontFamily:"system-ui,sans-serif",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>⚠️</div>
        <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:8}}>¿Agregar métricas ahora?</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:24}}>
          Solo han pasado <strong>{days} día{days!==1?"s":""}</strong> desde la publicación.<br/>
          Lo ideal es esperar 7 días para que los datos sean representativos.<br/>
          <span style={{color:C.amber}}>¿Estás seguro de que los datos ya son suficientes?</span>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn onClick={onConfirm} primary>Sí, agregar métricas</Btn>
        </div>
      </div>
    </div>
  );
}

// ── VIDEO HUB ─────────────────────────────────────────────────────────────────
function VideoHubVideos({client,videos,role,onDeleteVideo,onBack}){
  const[q,setQ]=useState("");
  const[confirmDel,setConfirmDel]=useState(null);
  const filtered=[...videos.filter(v=>v.clientId===client.id)]
    .filter(v=>[v.title,v.creator,v.hook].some(x=>x?.toLowerCase().includes(q.toLowerCase())))
    .sort((a,b)=>new Date(b.publishDate)-new Date(a.publishDate));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:600,color:C.text}}>← Clientes</button>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:C.text}}>{client.emoji&&client.emoji+" "}{client.name}</div>
            <div style={{fontSize:12,color:C.muted}}>{filtered.length} videos publicados</div>
          </div>
        </div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar..."
          style={{...inp,width:200,fontSize:12,padding:"8px 12px"}}/>
      </div>
      {filtered.length===0
        ?<Card style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:40,marginBottom:12}}>🎬</div>
          <div style={{fontSize:15,fontWeight:700,color:C.text}}>Sin videos publicados</div>
          <div style={{fontSize:13,color:C.muted,marginTop:6}}>Los videos aparecen aquí cuando se agregan métricas desde el pipeline</div>
         </Card>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {filtered.map(v=>{
            const engV=v.views>0?(((v.likes+v.comments+v.shares+v.saves)/v.views)*100).toFixed(1)+"%":"—";
            return(
              <div key={v.id} style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:shadow,overflow:"hidden"}}>
                <div style={{padding:"14px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:11,color:C.muted}}>{v.publishDate}</span>
                    {v.hook&&<Tag>{v.hook}</Tag>}
                  </div>
                  <div style={{fontSize:14,fontWeight:800,color:C.text,lineHeight:1.3,marginBottom:6}}>{v.title}</div>
                  {v.format&&<Tag color={C.accent}>{v.format}</Tag>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 16px",gap:8}}>
                  {[[fmt(v.views),"👁 Vistas"],[engV,"💹 Eng."],[v.paraTi!=null?v.paraTi+"%":"—","📡 Para Ti"]].map(([val,label])=>(
                    <div key={label} style={{textAlign:"center",background:C.light,borderRadius:8,padding:"8px 4px"}}>
                      <div style={{fontSize:15,fontWeight:800,color:C.text}}>{val}</div>
                      <div style={{fontSize:9,color:C.muted,marginTop:2}}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"10px 16px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {v.creator&&<span style={{fontSize:11,color:C.muted}}>🎭 {v.creator}</span>}
                    {role==="admin"&&(confirmDel===v.id
                      ?<div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <span style={{fontSize:10,color:C.red,fontWeight:700}}>⚠️ ¿Eliminar?</span>
                          <button onClick={()=>{onDeleteVideo(v.id);setConfirmDel(null);}} style={{fontSize:10,padding:"2px 8px",background:C.red,border:"none",borderRadius:5,cursor:"pointer",color:"#fff",fontWeight:700}}>Sí</button>
                          <button onClick={()=>setConfirmDel(null)} style={{fontSize:10,padding:"2px 8px",background:C.light,border:`1px solid ${C.border}`,borderRadius:5,cursor:"pointer",color:C.text}}>No</button>
                        </div>
                      :<button onClick={()=>setConfirmDel(v.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:14,padding:2}}>🗑</button>
                    )}
                  </div>
                  {v.url
                    ?<a href={v.url} target="_blank" rel="noreferrer" style={{fontSize:12,fontWeight:700,color:C.accent,textDecoration:"none",background:C.accent+"12",padding:"5px 12px",borderRadius:20,border:`1px solid ${C.accent}30`}}>Ver en TikTok →</a>
                    :<span style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>Sin URL</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

function VideoHub({clients,videos,role,communityClientId,onDeleteVideo}){
  const[selectedClient,setSelectedClient]=useState(null);
  // Show ALL clients that have videos (including archived/inactive)
  const clientsWithVideos=clients.filter(c=>videos.some(v=>v.clientId===c.id));
  const clientsWithout=clients.filter(c=>c.status!=="archived"&&!videos.some(v=>v.clientId===c.id));
  const allVisible=[...clientsWithVideos, ...clientsWithout];

  if(selectedClient){
    const cl=clients.find(c=>c.id===selectedClient);
    return <VideoHubVideos client={cl} videos={videos} role={role} onDeleteVideo={onDeleteVideo} onBack={()=>setSelectedClient(null)}/>;
  }

  return(
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text}}>🎬 Video Hub</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>Biblioteca de contenido publicado por cliente</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
        {allVisible.map(c=>{
          const cVs=videos.filter(v=>v.clientId===c.id).sort((a,b)=>new Date(b.publishDate)-new Date(a.publishDate));
          const totalViews=cVs.reduce((s,v)=>s+v.views,0);
          const isArchived=c.status==="archived";
          return(
            <div key={c.id} onClick={()=>setSelectedClient(c.id)}
              style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:shadow,cursor:"pointer",overflow:"hidden",opacity:isArchived?.7:1}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=shadowMd;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=shadow;e.currentTarget.style.transform="none";}}>
              <div style={{padding:"18px 18px 14px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  {c.emoji&&<span style={{fontSize:26}}>{c.emoji}</span>}
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:C.text}}>{c.name}</div>
                    {isArchived&&<span style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1}}>ARCHIVADO</span>}
                  </div>
                </div>
              </div>
              <div style={{padding:"12px 18px 14px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{background:C.light,borderRadius:8,padding:10,textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:800,color:C.gold}}>{fmt(totalViews)}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:2}}>👁 Vistas</div>
                  </div>
                  <div style={{background:C.light,borderRadius:8,padding:10,textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:800,color:C.accent}}>{cVs.length}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:2}}>🎬 Videos</div>
                  </div>
                </div>
                {cVs[0]&&<div style={{marginTop:10,fontSize:11,color:C.muted}}>Último: {cVs[0].publishDate}</div>}
                {cVs.length===0&&<div style={{marginTop:10,fontSize:11,color:C.muted,fontStyle:"italic"}}>Sin videos aún</div>}
              </div>
              <div style={{padding:"8px 18px 12px",borderTop:`1px solid ${C.border}`}}>
                <span style={{fontSize:11,color:C.accent,fontWeight:600}}>Ver videos →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const[user,   setUser]   =useState(null);
  const[profile,setProfile]=useState(null);
  const[clients, setClients]=useState([]);
  const[employees,setEmps] =useState([]);
  const[videos,  setVideos]=useState([]);
  const[cards,   setCards] =useState([]);
  const[targets, setTargets]=useState({});
  const[loading, setLoading]=useState(true);
  const[page,      setPage]       =useState("dashboard");
  const[modal,     setModal]      =useState(null);
  const[range,     setRange]      =useState("all");
  const[pipelineClient,setPipelineClient]=useState(null);
  const[activeMonth,setActiveMonth]=useState(curMonth());

  // ── Auto-refresh token every 10 minutes to prevent session expiry ───────────
  useEffect(()=>{
    const interval = setInterval(async()=>{
      const s = localStorage.getItem("sb_auth");
      if(s) await sbRefreshToken();
    }, 10 * 60 * 1000); // every 10 minutes
    return()=>clearInterval(interval);
  },[]);

  // ── Check existing session ──────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      try{
        const session=await sbGetSession();
        if(session?.user){
          const prof=await sbGetOne("profiles","id",session.user.id);
          setUser(session.user);
          setProfile(prof||{role:"community",client_id:null,name:session.user.email});
        }
      }catch(e){console.error("Session error:",e);}
      setLoading(false);
    })();
  },[]);

  // ── Load all data ───────────────────────────────────────────────────────────
  const loadAll=useCallback(async()=>{
    const[cl,em,vi,ca,tg]=await Promise.all([
      sbGet("clients","&order=name.asc"),
      sbGet("employees","&order=name.asc"),
      sbGet("videos","&order=publish_date.desc"),
      sbGet("cards"),
      sbGet("targets"),
    ]);
    setClients(cl||[]);
    setEmps(em||[]);
    setVideos((vi||[]).map(dbToVideo));
    setCards((ca||[]).map(dbToCard));
    setTargets(dbToTargets(tg||[]));
  },[]);

  useEffect(()=>{ if(user)loadAll(); },[user,loadAll]);

  // ── Real-time polling (every 4s) ────────────────────────────────────────────
  useEffect(()=>{
    if(!user)return;
    const poll=setInterval(loadAll, 4000);
    return()=>clearInterval(poll);
  },[user,loadAll]);

  // ── Pipeline actions ────────────────────────────────────────────────────────
  const moveCard=useCallback(async(cardId,stageId,isPublish=false)=>{
    const card=cards.find(c=>c.id===cardId);if(!card)return;
    const updates={stage:stageId};
    if(isPublish||stageId==="publicado"){updates.publish_date=NOW.toISOString().slice(0,10);updates.stage="metricas";}
    if(stageId==="revision")updates.revision_count=(card.revisionCount||0)+1;
    await sbUpdate("cards","id",cardId,updates);
  },[cards]);

  const deleteCard=useCallback(async id=>{
    await sbDelete("cards","id",id);
  },[]);

  const logout=()=>{
    sbSignOut();
    setUser(null);setProfile(null);setClients([]);setEmps([]);setVideos([]);setCards([]);setTargets({});
  };

  const addVideo=useCallback(async v=>{
    await sbInsert("videos",videoToDB(v));
  },[]);
  const deleteVideo=useCallback(async id=>{
    await sbDelete("videos","id",id);
  },[]);

  const onSetTargets=useCallback(()=>{
    sbGet("targets").then(data=>{if(data)setTargets(dbToTargets(data));});
  },[]);

  // ── All hooks MUST be before conditional returns (React rules) ──────────────
  const role=profile?.role||"community";
  const comClientId=profile?.client_id||null;
  const filtered=useMemo(()=>filterByDate(videos,range),[videos,range]);
  const activeClientObj=clients.find(c=>c.id===page);
  const withData=clients.filter(c=>c.status!=="archived"&&cVids(filtered,c.id).length>0);
  const noData=clients.filter(c=>c.status!=="archived"&&cVids(filtered,c.id).length===0);

  // ── Loading / Login ─────────────────────────────────────────────────────────
  if(loading)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:8}}>TheContentHub</div>
        <div style={{fontSize:13,color:C.muted}}>Conectando...</div>
      </div>
    </div>
  );

  if(!user)return<Login onLogin={(u,p)=>{setUser(u);setProfile(p);}}/>;

  // ── COMMUNITY VIEW ──────────────────────────────────────────────────────────
  if(role==="community"){
    return(
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
        {/* Topbar */}
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:shadow,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18,fontWeight:900,color:C.text}}>TheContentHub</span>
            <span style={{background:C.accent+"18",color:C.accent,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>Community</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span style={{fontSize:11,color:C.muted}}>{profile?.name||user.email}</span>
            <button onClick={logout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>Cerrar sesión</button>
          </div>
        </div>
        {/* Tab switcher */}
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",gap:0,flexShrink:0}}>
          {[["pipeline","🗂 Pipeline"],["videohub","🎬 Video Hub"]].map(([id,label])=>(
            <button key={id} onClick={()=>setPage(id)} style={{padding:"12px 20px",border:"none",cursor:"pointer",fontSize:13,fontWeight:page===id?700:400,color:page===id?C.accent:C.muted,background:"transparent",borderBottom:page===id?`2px solid ${C.accent}`:"2px solid transparent"}}>
              {label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {page==="videohub"
            ?<VideoHub clients={clients} videos={filtered} role="community" communityClientId={null} onDeleteVideo={deleteVideo}/>
            :<PipelinePage clients={clients} employees={employees} cards={cards} videos={videos} targets={targets} role="community" communityClientId={null} onSetTargets={()=>{}} onMoveCard={moveCard} onDeleteCard={deleteCard} activeMonth={activeMonth} onMonthChange={setActiveMonth}/>
          }
        </div>
      </div>
    );
  }

  // ── ADMIN VIEW ──────────────────────────────────────────────────────────────
  const mainPages=[
    {id:"dashboard", label:"📊 Dashboard"},
    {id:"pipeline",  label:"🗂 Pipeline"},
    {id:"videohub",  label:"🎬 Video Hub"},
    {id:"analytics", label:"🧠 Analytics"},
    {id:"team",      label:"👥 Equipo"},
    {id:"settings",  label:"⚙️ Configuración"},
  ];
  const navItem=(id,label,dot)=>(
    <div key={id} onClick={()=>setPage(id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:page===id?600:400,color:page===id?C.sideGold:C.sideText,borderLeft:page===id?`2px solid ${C.sideGold}`:"2px solid transparent",background:page===id?"rgba(245,158,11,.1)":"transparent"}}>
      <span style={{fontSize:7,color:dot,flexShrink:0}}>●</span>{label}
    </div>
  );

  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",color:C.text,overflow:"hidden"}}>
      <div style={{width:220,background:C.sidebar,flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"20px 16px 14px",borderBottom:"1px solid #1E293B"}}>
          <div style={{fontSize:16,fontWeight:900,color:C.sideGold,letterSpacing:-0.5}}>TheContentHub</div>
          <div style={{fontSize:9,color:C.sideMuted,letterSpacing:3,marginTop:3}}>🚀 REVO LABS · ADMIN</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
          {mainPages.map(p=>(
            <div key={p.id} onClick={()=>setPage(p.id)} style={{padding:"9px 16px",cursor:"pointer",fontSize:13,fontWeight:page===p.id?600:400,color:page===p.id?C.sideGold:C.sideText,borderLeft:page===p.id?`2px solid ${C.sideGold}`:"2px solid transparent",background:page===p.id?"rgba(245,158,11,.1)":"transparent"}}>{p.label}</div>
          ))}
          {withData.length>0&&<><div style={{padding:"14px 16px 4px",fontSize:9,color:C.sideMuted,letterSpacing:3,fontWeight:700}}>ACTIVOS</div>{withData.map(c=>navItem(c.id,c.name,"#22C55E"))}</>}
          {noData.length>0&&<><div style={{padding:"14px 16px 4px",fontSize:9,color:C.sideMuted,letterSpacing:3,fontWeight:700}}>SIN DATOS</div>{noData.map(c=>navItem(c.id,c.name,"#334155"))}</>}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid #1E293B"}}>
          <div style={{fontSize:11,color:C.sideMuted}}>{profile?.name||user.email}</div>
          <div style={{fontSize:9,color:"#334155",marginTop:2}}>CSO · REVO Labs</div>
          <button onClick={logout} style={{marginTop:8,background:"none",border:"none",color:"#EF4444",fontSize:11,cursor:"pointer",padding:0}}>Cerrar sesión →</button>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:shadow}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>
            {page==="dashboard"?"📊 Dashboard":page==="pipeline"?"🗂 Pipeline":page==="videohub"?"🎬 Video Hub":page==="analytics"?"🧠 Analytics":page==="team"?"👥 Equipo":page==="settings"?"⚙️ Configuración":activeClientObj?.name||""}
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {(page==="analytics"||page==="videohub"||activeClientObj)&&<DateRangePicker value={range} onChange={setRange}/>}
            {page!=="pipeline"&&page!=="settings"&&page!=="dashboard"&&<Btn onClick={()=>setModal(activeClientObj?.id||"")} primary>+ Video</Btn>}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {page==="dashboard" &&<MonthlyDashboard clients={clients} cards={cards} videos={videos} targets={targets} activeMonth={activeMonth} onMonthChange={setActiveMonth} onGoToPipeline={(clientId)=>{setPipelineClient(clientId);setPage("pipeline");}}/>}
          {page==="videohub"  &&<VideoHub   clients={clients}  videos={filtered} role={role} communityClientId={null} onDeleteVideo={deleteVideo}/>}
          {page==="pipeline"  &&<PipelinePage clients={clients} employees={employees} cards={cards} videos={videos} targets={targets} role="admin" communityClientId={null} onSetTargets={onSetTargets} onMoveCard={moveCard} onDeleteCard={deleteCard} initialClient={pipelineClient} onClearInitialClient={()=>setPipelineClient(null)} activeMonth={activeMonth} onMonthChange={setActiveMonth}/>}
          {page==="analytics"  &&<AnalyticsPage videos={filtered} clients={clients}/>}
          {page==="team"      &&<TeamPage     videos={filtered}/>}
          {page==="settings"  &&<SettingsPage clients={clients} employees={employees} setClients={setClients} setEmployees={setEmps} userRole={role}/>}
          {activeClientObj       &&<ClientPage   client={activeClientObj} videos={filtered} onAdd={()=>setModal(activeClientObj.id)}/>}
        </div>
      </div>
      {modal!==null&&<AddModal clients={clients} employees={employees} defaultClientId={modal} onSave={addVideo} onClose={()=>setModal(null)}/>}
    </div>
  );
}
