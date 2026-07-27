import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SB_URL = "https://dtpxqxwhehzyrtmrhiio.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cHhxeHdoZWh6eXJ0bXJoaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODUzNjMsImV4cCI6MjEwMDY2MTM2M30.qeYZV8B2sgF_2LE2hity97reHqg8oaQF1D39HHjFgbU";
let _token = null;

const _h = (x={}) => ({"apikey":SB_KEY,"Content-Type":"application/json","Authorization":`Bearer ${_token||SB_KEY}`,...x});
const sbGet = async (t,p="") => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?select=*${p}`,{headers:_h()}); return r.ok?await r.json():[];} catch(e){return [];} };
const sbGetOne = async (t,c,v) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?${c}=eq.${encodeURIComponent(v)}&select=*&limit=1`,{headers:_h()}); if(!r.ok)return null; const a=await r.json(); return a[0]||null;} catch(e){return null;} };
const sbInsert = async (t,d) => { try { await fetch(`${SB_URL}/rest/v1/${t}`,{method:"POST",headers:_h({"Prefer":"return=minimal"}),body:JSON.stringify(Array.isArray(d)?d:[d])});} catch(e){} };
const sbUpdate = async (t,c,v,d) => { try { await fetch(`${SB_URL}/rest/v1/${t}?${c}=eq.${encodeURIComponent(v)}`,{method:"PATCH",headers:_h({"Prefer":"return=minimal"}),body:JSON.stringify(d)});} catch(e){} };
const sbDelete = async (t,c,v) => { try { await fetch(`${SB_URL}/rest/v1/${t}?${c}=eq.${encodeURIComponent(v)}`,{method:"DELETE",headers:_h()});} catch(e){} };
const sbUpsert = async (t,d,oc) => { try { await fetch(`${SB_URL}/rest/v1/${t}?on_conflict=${oc}`,{method:"POST",headers:_h({"Prefer":"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify(Array.isArray(d)?d:[d])}); } catch(e){} };
const sbSignIn = async (email,password) => { try { const r=await fetch(`${SB_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})}); const d=await r.json(); if(!r.ok)return{error:d}; _token=d.access_token; localStorage.setItem("sk_auth",JSON.stringify({token:d.access_token,refresh_token:d.refresh_token,user:d.user,expires_at:Date.now()+(d.expires_in||3600)*1000})); return{user:d.user,error:null};} catch(e){return{error:{message:e.message}};} };
const sbSignUp = async (email,password) => { try { const r=await fetch(`${SB_URL}/auth/v1/signup`,{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})}); const d=await r.json(); if(!r.ok)return{error:d}; return{user:d,error:null};} catch(e){return{error:{message:e.message}};} };
const sbSignOut = () => { _token=null; localStorage.removeItem("sk_auth"); };
const sbGetSession = async () => { try { const s=localStorage.getItem("sk_auth"); if(!s)return null; const{token,user,expires_at,refresh_token}=JSON.parse(s); if(expires_at&&Date.now()>expires_at-300000){ const r=await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token})}); if(r.ok){const d=await r.json();_token=d.access_token;localStorage.setItem("sk_auth",JSON.stringify({token:d.access_token,refresh_token:d.refresh_token||refresh_token,user:d.user,expires_at:Date.now()+(d.expires_in||3600)*1000}));return{user:d.user};}return null;} _token=token; return{user};} catch(e){return null;} };

const NOW=new Date();
const curMonth=()=>`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;
const monthLabel=m=>{const[y,mo]=m.split("-");return new Date(+y,+mo-1,1).toLocaleString("en-US",{month:"long",year:"numeric"});};
const addMonths=(m,n)=>{const[y,mo]=m.split("-");const d=new Date(+y,+mo-1+n,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;};
const daysSince=d=>d?Math.floor((NOW-new Date(d))/864e5):0;
const uid=()=>Math.random().toString(36).slice(2,10);
const fmt=n=>n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(0)+"K":String(n||0);
const engRate=v=>v.views>0?(((v.likes+v.comments+v.shares+v.saves)/v.views)*100).toFixed(1)+"%":"—";

const PLATFORMS=["TikTok","Instagram Reels","YouTube Shorts","YouTube","Facebook","LinkedIn"];
const HOOKS=["Impact","Curiosity","Story","Transformation","POV","Desire","Before/After","Question","Statistic","Problem","Controversy"];
const FORMATS=["Product Demo","Talking to Camera","Tutorial","Trend","Voice Over","Founder","Educational","Behind the Scenes","Lifestyle","Meme"];
const CTAS=["Follow","Save","Comment","Share","Visit Profile","Buy","DM me","Link in Bio","No CTA"];
const STAGES=[{id:"idea",label:"Idea",color:"#378ADD"},{id:"production",label:"Production",color:"#8B5CF6"},{id:"editing",label:"Editing",color:"#F59E0B"},{id:"published",label:"Published",color:"#059669"}];

const C={bg:"#F8FAFC",surface:"#FFFFFF",border:"#E2E8F0",text:"#0F172A",muted:"#64748B",light:"#F1F5F9",accent:"#2563EB",gold:"#D97706",green:"#059669",red:"#DC2626"};
const sh="0 1px 3px rgba(0,0,0,.08)";
const shMd="0 4px 12px rgba(0,0,0,.1)";
const inp={width:"100%",background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"};
const Card=({children,pad=18,style={}})=><div style={{background:C.surface,borderRadius:12,padding:pad,border:`1px solid ${C.border}`,boxShadow:sh,...style}}>{children}</div>;
const Btn=({children,primary,onClick,small,disabled,style={}})=><button onClick={onClick} disabled={disabled} style={{padding:small?"6px 12px":"9px 18px",background:primary?C.text:C.surface,color:primary?"#FFF":C.text,border:`1px solid ${primary?C.text:C.border}`,borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontSize:small?12:13,fontWeight:600,opacity:disabled?.5:1,...style}}>{children}</button>;
const Tag=({c,color=C.gold})=><span style={{display:"inline-block",padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:600,background:color+"18",color,border:`1px solid ${color}30`,marginRight:3}}>{c}</span>;

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function Landing({onPath}){
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 32px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:17,fontWeight:900,color:C.text,letterSpacing:-0.5}}>ContentHub <span style={{color:C.accent,fontWeight:400,fontSize:14}}>Sidekick</span></div>
        <span onClick={()=>onPath("login")} style={{fontSize:13,color:C.accent,cursor:"pointer",fontWeight:600}}>Sign in</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 24px",minHeight:"calc(100vh - 56px)"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:32,fontWeight:900,color:C.text,letterSpacing:-1,lineHeight:1.2,marginBottom:12}}>Know exactly what's working<br/>in your content</div>
          <div style={{fontSize:15,color:C.muted,maxWidth:460,margin:"0 auto",lineHeight:1.6}}>Track, analyze, and coordinate every video — whether you're a solo creator or running a full agency.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,width:"min(640px,100%)"}}>
          {[
            {path:"creator",badge:"Free forever",badgeBg:"#DCFCE7",badgeColor:"#15803D",icon:"👤",iconBg:"#EFF6FF",title:"Creator",desc:"For influencers and small businesses posting their own content.",features:["Track unlimited videos","Hook and format analytics","Monthly progress dashboard","TikTok URL library"],cta:"Start free — no card needed",ctaBg:C.light,ctaColor:C.text,ctaBorder:C.border,border:`1px solid ${C.border}`},
            {path:"agency",badge:"Pro — from $79/mo",badgeBg:"#EDE9FE",badgeColor:"#7C3AED",icon:"🏢",iconBg:"#EDE9FE",title:"Agency",desc:"For content teams managing multiple clients and brands.",features:["Unlimited clients","Team roles and permissions","Full production pipeline","Editor and CM accountability","Agency-wide analytics"],cta:"Start 14-day free trial",ctaBg:C.text,ctaColor:"#FFF",ctaBorder:C.text,border:`2px solid ${C.accent}`},
          ].map(card=>(
            <div key={card.path} style={{background:C.surface,borderRadius:16,border:card.border,boxShadow:sh,padding:26,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:card.badgeBg,color:card.badgeColor,width:"fit-content"}}>{card.badge}</div>
              <div style={{width:42,height:42,borderRadius:10,background:card.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{card.icon}</div>
              <div>
                <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:5}}>{card.title}</div>
                <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>{card.desc}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {card.features.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:C.muted}}><span style={{color:C.green}}>✓</span>{f}</div>)}
              </div>
              <button onClick={()=>onPath(card.path)} style={{marginTop:"auto",padding:"11px 0",background:card.ctaBg,color:card.ctaColor,border:`1px solid ${card.ctaBorder}`,borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>{card.cta}</button>
              <div style={{textAlign:"center",fontSize:11,color:C.muted,cursor:"pointer"}}>▶ Watch a 90-second walkthrough</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({path,onLogin,onBack}){
  const[mode,setMode]=useState(path==="login"?"login":"signup");
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const go=async()=>{
    if(!email||!pass||(mode==="signup"&&!name)){setErr("Please fill in all fields");return;}
    setLoading(true);setErr("");
    if(mode==="signup"){
      const{user,error}=await sbSignUp(email,pass);
      if(error||!user){setErr("Could not create account.");setLoading(false);return;}
      const{user:u2,error:e2}=await sbSignIn(email,pass);
      if(e2||!u2){setErr("Account created — please sign in.");setMode("login");setLoading(false);return;}
      await sbInsert("profiles",{id:u2.id,name,email,account_type:path});
      onLogin(u2,{name,account_type:path});
    } else {
      const{user,error}=await sbSignIn(email,pass);
      if(error||!user){setErr("Wrong email or password.");setLoading(false);return;}
      const prof=await sbGetOne("profiles","id",user.id);
      onLogin(user,prof||{account_type:"creator"});
    }
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:340,padding:32,background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,marginBottom:14,padding:0}}>← Back</button>
        <div style={{fontSize:20,fontWeight:900,color:C.text,marginBottom:4}}>ContentHub Sidekick</div>
        <div style={{fontSize:12,color:C.accent,fontWeight:600,marginBottom:22}}>{path==="creator"?"Creator":"Agency"} — {mode==="signup"?"Create account":"Sign in"}</div>
        {mode==="signup"&&<div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Your name</div><input value={name} onChange={x=>setName(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={inp} placeholder="Jane Creator"/></div>}
        <div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Email</div><input type="email" value={email} onChange={x=>setEmail(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={inp}/></div>
        <div style={{marginBottom:16}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Password</div><input type="password" value={pass} onChange={x=>setPass(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={inp}/></div>
        {err&&<div style={{color:C.red,fontSize:12,marginBottom:10}}>{err}</div>}
        <button onClick={go} disabled={loading} style={{width:"100%",padding:12,background:C.text,color:"#FFF",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1}}>{loading?"Loading...":(mode==="signup"?"Create account →":"Sign in →")}</button>
        <div style={{textAlign:"center",marginTop:12,fontSize:12,color:C.muted}}>
          {mode==="signup"?"Already have an account? ":"New here? "}
          <span onClick={()=>{setMode(m=>m==="signup"?"login":"signup");setErr("");}} style={{color:C.accent,cursor:"pointer",fontWeight:600}}>{mode==="signup"?"Sign in":"Sign up"}</span>
        </div>
      </div>
    </div>
  );
}

// ── GOAL MODAL ────────────────────────────────────────────────────────────────
function GoalModal({month,current,onSave,onClose}){
  const[val,setVal]=useState(current||8);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(380px,95vw)",padding:26}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>🎯 Monthly goal</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:18}}>How many videos do you want to publish in {monthLabel(month)}?</div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>Number of videos</div>
          <input type="number" min="1" max="60" value={val} onChange={x=>setVal(+x.target.value)} style={{...inp,width:120,textAlign:"center",fontSize:22,fontWeight:700,padding:"12px"}}/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={onClose}>Cancel</Btn><Btn onClick={()=>onSave(val)} primary>Set goal ✓</Btn></div>
      </div>
    </div>
  );
}

// ── ADD VIDEO MODAL ───────────────────────────────────────────────────────────
function AddVideoModal({month,onSave,onClose}){
  const[f,sf]=useState({title:"",platform:"TikTok",targetDate:""});
  const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=()=>{if(!f.title.trim())return;onSave({...f,id:"v"+uid(),stage:"idea",month,createdAt:new Date().toISOString()});onClose();};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(380px,95vw)",padding:26}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>Add a video</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        <div style={{fontSize:12,color:C.muted,marginBottom:18}}>Three things and you're done.</div>
        {[["Video title","title","text"],["Target date","targetDate","date"]].map(([l,k,t])=>(
          <div key={k} style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div><input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} onKeyDown={x=>x.key==="Enter"&&save()} style={inp} placeholder={k==="title"?"Give this video a title":""}/></div>
        ))}
        <div style={{marginBottom:18}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Platform</div><select value={f.platform} onChange={x=>set("platform",x.target.value)} style={inp}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={onClose}>Cancel</Btn><Btn onClick={save} primary>Add to pipeline ✓</Btn></div>
      </div>
    </div>
  );
}

// ── METRICS MODAL ─────────────────────────────────────────────────────────────
function MetricsModal({video,onSave,onClose}){
  const[f,sf]=useState({url:"",hook:"",format:"",cta:"",views:"",likes:"",comments:"",shares:"",saves:"",paraTi:"",siguiendo:"",busqueda:"",pauta:"0"});
  const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=()=>{const nums=["views","likes","comments","shares","saves","paraTi","siguiendo","busqueda","pauta"];const m={...f,...nums.reduce((o,k)=>({...o,[k]:f[k]!==""?+f[k]:null}),{})};onSave(m);onClose();};
  const fld=(l,k,t="text",opts)=>(<div style={{marginBottom:11}}><div style={{fontSize:11,color:C.muted,marginBottom:3,fontWeight:500}}>{l}</div>{opts?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Select...</option>{opts.map(o=><option key={o}>{o}</option>)}</select>:<input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}/> }</div>);
  const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:10};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:999,paddingTop:20,paddingBottom:20,overflowY:"auto",fontFamily:"system-ui"}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(520px,95vw)"}}>
        <div style={{padding:"20px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:15,fontWeight:800,color:C.text}}>📊 Add metrics</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{video.title}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"12px 24px 24px"}}>
          {fld("🔗 Video URL","url")}
          <div style={g2}>{fld("🪝 Hook","hook","text",HOOKS)}{fld("🎬 Format","format","text",FORMATS)}</div>
          {fld("CTA","cta","text",CTAS)}
          <div style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:1,margin:"12px 0 8px"}}>📊 METRICS</div>
          <div style={g2}>{fld("👁 Views","views","number")}{fld("❤️ Likes","likes","number")}</div>
          <div style={g2}>{fld("💬 Comments","comments","number")}{fld("🔁 Shares","shares","number")}</div>
          <div style={g2}>{fld("🔖 Saves","saves","number")}{fld("💰 Paid promo ($)","pauta","number")}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:1,margin:"12px 0 8px"}}>📡 TRAFFIC SOURCES</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>{fld("📱 % For You","paraTi","number")}{fld("👥 % Following","siguiendo","number")}{fld("🔍 % Search","busqueda","number")}</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}><Btn onClick={onClose}>Cancel</Btn><Btn onClick={save} primary>Save metrics ✓</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ── CREATOR DASHBOARD ─────────────────────────────────────────────────────────
function CreatorDashboard({videos,goals,month,onMonthChange,onSetGoal,onAddVideo,onMoveVideo,onMetrics,onDeleteVideo,userId}){
  const[showAdd,setShowAdd]=useState(false);
  const[showGoal,setShowGoal]=useState(false);
  const[metricsVid,setMetricsVid]=useState(null);
  const[confirmDel,setConfirmDel]=useState(null);
  const goal=goals[month]||0;
  const mVids=videos.filter(v=>v.month===month);
  const published=mVids.filter(v=>v.stage==="published"&&v.metricsAdded).length;
  const inProg=mVids.filter(v=>v.stage!=="published"||!v.metricsAdded).length;
  const pct=goal>0?Math.min(100,Math.round(published/goal*100)):null;
  const stageV=sid=>mVids.filter(v=>v.stage===sid);
  const emptyCount=Math.max(0,goal-mVids.length);
  const PLT={TikTok:"📱","Instagram Reels":"📸","YouTube Shorts":"🎬",YouTube:"▶️",Facebook:"👥",LinkedIn:"💼"};
  const isFirstTime=Object.keys(goals).length===0&&videos.length===0;
  return(
    <div>
      {isFirstTime&&!showGoal&&(
        <div style={{background:"#EFF6FF",border:`1px solid ${C.accent}30`,borderRadius:12,padding:"18px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:4}}>👋 Welcome to ContentHub Sidekick!</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>Start by setting your video goal for this month. It takes 5 seconds and everything else follows from there.</div>
          </div>
          <button onClick={()=>setShowGoal(true)} style={{flexShrink:0,padding:"10px 18px",background:C.accent,color:"#FFF",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Set my goal →</button>
        </div>
      )}
      {!isFirstTime&&goal===0&&(
        <div style={{background:"#FFFBEB",border:`1px solid ${C.gold}40`,borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{fontSize:13,color:C.muted}}>🎯 No goal set for {monthLabel(month)} yet.</div>
          <button onClick={()=>setShowGoal(true)} style={{padding:"6px 14px",background:C.gold,color:"#FFF",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>Set goal</button>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <button onClick={()=>onMonthChange(addMonths(month,-1))} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:13,color:C.text}}>←</button>
          <div style={{fontSize:15,fontWeight:700,color:C.text,minWidth:125,textAlign:"center"}}>{monthLabel(month)}</div>
          <button onClick={()=>onMonthChange(addMonths(month,1))} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:13,color:C.text}}>→</button>
          {month!==curMonth()&&<button onClick={()=>onMonthChange(curMonth())} style={{padding:"4px 9px",border:`1px solid ${C.border}`,borderRadius:7,background:C.light,cursor:"pointer",fontSize:11,color:C.muted}}>Today</button>}
        </div>
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>setShowGoal(true)} style={{padding:"6px 13px",border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted,fontWeight:600}}>🎯 {goal>0?`${goal} videos`:"Set goal"}</button>
          <Btn primary onClick={()=>setShowAdd(true)}>+ Add video</Btn>
        </div>
      </div>
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
          <div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:1,fontWeight:600,marginBottom:3}}>MONTHLY PROGRESS</div>
            <div style={{fontSize:20,fontWeight:800,color:pct===100?C.green:C.accent}}>{goal===0?"Set a goal to get started":pct===100?"🎉 Goal reached!":pct!==null?`${pct}% complete`:"0% complete"}</div>
          </div>
          {goal>0&&<div style={{textAlign:"right"}}><div style={{fontSize:28,fontWeight:900,color:C.text}}>{published}<span style={{fontSize:15,color:C.muted}}>/{goal}</span></div><div style={{fontSize:11,color:C.muted}}>published</div></div>}
        </div>
        {goal>0&&<><div style={{background:C.light,borderRadius:20,height:9,overflow:"hidden",marginBottom:6}}><div style={{width:`${pct||0}%`,height:"100%",background:pct===100?C.green:C.accent,borderRadius:20,transition:"width .4s"}}/></div><div style={{display:"flex",gap:14,fontSize:11,color:C.muted}}><span style={{color:C.accent,fontWeight:600}}>✅ {published} published</span><span>🎬 {inProg} in progress</span>{published<goal&&<span>📋 {goal-published} to go</span>}</div></>}
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>
        {STAGES.map(stage=>{
          const cards=stageV(stage.id);
          return(
            <div key={stage.id}
              onDragOver={e=>e.preventDefault()}
              onDragEnter={e=>{e.currentTarget.style.background=stage.color+"18";e.currentTarget.style.outline=`2px dashed ${stage.color}`;}}
              onDragLeave={e=>{e.currentTarget.style.background=C.light;e.currentTarget.style.outline="none";}}
              onDrop={e=>{e.preventDefault();e.currentTarget.style.background=C.light;e.currentTarget.style.outline="none";const vid=e.dataTransfer.getData("videoId");const from=e.dataTransfer.getData("fromStage");if(vid&&from!==stage.id)onMoveVideo(vid,stage.id);}}
              style={{background:C.light,borderRadius:10,padding:9,transition:"background .15s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:stage.color}}/><div style={{fontSize:11,fontWeight:700,color:C.text}}>{stage.label}</div></div>
                <span style={{fontSize:10,fontWeight:700,background:stage.color+"22",color:stage.color,padding:"1px 6px",borderRadius:20}}>{cards.length}</span>
              </div>
              {cards.map(v=>{
                const isPub=v.stage==="published";
                const daysGone=daysSince(v.publishDate||v.createdAt);
                const unlocked=isPub&&daysGone>=7;
                const hasMet=v.metricsAdded;
                const isCf=confirmDel===v.id;
                const lockPct=Math.min(100,Math.round((daysGone/7)*100));
                const unlockDate=()=>{const d=new Date(v.publishDate||v.createdAt);d.setDate(d.getDate()+7);return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});};
                return(
                  <div key={v.id} draggable
                    onDragStart={e=>{e.dataTransfer.setData("videoId",v.id);e.dataTransfer.setData("fromStage",stage.id);e.currentTarget.style.opacity="0.4";e.currentTarget.style.transform="rotate(2deg)";}}
                    onDragEnd={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}
                    style={{background:C.surface,borderRadius:12,padding:12,marginBottom:8,border:`1px solid ${hasMet?"#BBF7D0":unlocked&&isPub?"#BBF7D0":C.border}`,borderTop:`3px solid ${stage.color}`,boxShadow:"0 2px 6px rgba(0,0,0,.06)",cursor:"grab",transition:"box-shadow .15s,transform .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 6px rgba(0,0,0,.06)";e.currentTarget.style.transform="none";}}>
                    <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:6,lineHeight:1.35}}>{v.title}</div>
                    <div style={{fontSize:11,color:C.muted,marginBottom:8,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{background:C.light,padding:"2px 7px",borderRadius:20,fontSize:10}}>{PLT[v.platform]||"📱"} {v.platform}</span>
                      {v.targetDate&&<span style={{fontSize:10,color:C.muted}}>📅 {v.targetDate}</span>}
                    </div>
                    {isPub&&!hasMet&&!unlocked&&(
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:10,fontWeight:600,color:C.muted,marginBottom:4}}>📅 Come back {unlockDate()} to add metrics</div>
                        <div style={{background:C.light,borderRadius:20,height:5,overflow:"hidden"}}>
                          <div style={{width:`${lockPct}%`,height:"100%",background:lockPct>=85?C.green:C.accent,borderRadius:20,transition:"width .3s"}}/>
                        </div>
                        <div style={{fontSize:9,color:C.muted,marginTop:2}}>{7-daysGone} day{7-daysGone!==1?"s":""} remaining</div>
                      </div>
                    )}
                    {isPub&&!hasMet&&unlocked&&(
                      <div style={{marginBottom:8,padding:"6px 8px",background:"#DCFCE7",borderRadius:8,display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:13}}>✅</span>
                        <div><div style={{fontSize:11,fontWeight:700,color:C.green}}>Ready to add metrics!</div><div style={{fontSize:9,color:"#15803D"}}>7 days of data collected</div></div>
                      </div>
                    )}
                    {hasMet&&<div style={{marginBottom:8,padding:"5px 8px",background:"#DCFCE7",borderRadius:8,display:"inline-flex",alignItems:"center",gap:5}}><span style={{fontSize:11}}>📊</span><span style={{fontSize:10,fontWeight:700,color:C.green}}>Metrics added</span></div>}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                      {stage.id!=="published"&&<button onClick={()=>onMoveVideo(v.id,STAGES[STAGES.findIndex(s=>s.id===stage.id)+1]?.id)} style={{fontSize:10,padding:"3px 9px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.muted,fontWeight:500}}>→ {STAGES[STAGES.findIndex(s=>s.id===stage.id)+1]?.label}</button>}
                      {isPub&&!hasMet&&unlocked&&<button onClick={()=>setMetricsVid(v)} style={{fontSize:10,padding:"3px 9px",background:C.green,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>📊 Add metrics</button>}
                      {!isCf&&<button onClick={()=>setConfirmDel(v.id)} style={{fontSize:10,padding:"3px 7px",background:"none",border:"none",cursor:"pointer",color:C.muted}}>🗑</button>}
                      {isCf&&<div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:10,color:C.red,fontWeight:700}}>Delete?</span><button onClick={()=>{onDeleteVideo(v.id);setConfirmDel(null);}} style={{fontSize:10,padding:"2px 7px",background:C.red,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>Yes</button><button onClick={()=>setConfirmDel(null)} style={{fontSize:10,padding:"2px 7px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>No</button></div>}
                    </div>
                  </div>
                );
              })}
              {stage.id==="idea"&&[...Array(emptyCount)].map((_,i)=>(
                <div key={`e${i}`} onClick={()=>setShowAdd(true)} style={{background:C.surface,borderRadius:8,padding:12,marginBottom:7,border:`1px dashed ${C.border}`,cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background="#EFF6FF";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
                  <div style={{fontSize:16,marginBottom:3}}>+</div><div style={{fontSize:10,fontWeight:700,color:C.muted}}>Fill me out</div>
                </div>
              ))}
              {cards.length===0&&stage.id!=="idea"&&<div style={{textAlign:"center",padding:"18px 6px",color:C.muted,fontSize:10,border:`1px dashed ${C.border}`,borderRadius:7,background:C.bg}}>Nothing here yet</div>}
            </div>
          );
        })}
      </div>
      {showGoal&&<GoalModal month={month} current={goal} onSave={v=>{onSetGoal(month,v);setShowGoal(false);}} onClose={()=>setShowGoal(false)}/>}
      {showAdd&&<AddVideoModal month={month} onSave={v=>{onAddVideo({...v,userId});setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
      {metricsVid&&<MetricsModal video={metricsVid} onSave={m=>{onMetrics(metricsVid.id,m);setMetricsVid(null);}} onClose={()=>setMetricsVid(null)}/>}
    </div>
  );
}

// ── CREATOR VIDEOS ────────────────────────────────────────────────────────────
function CreatorVideos({videos,onDelete}){
  const[q,setQ]=useState("");
  const[cf,setCf]=useState(null);
  const pub=[...videos.filter(v=>v.metricsAdded)].filter(v=>[v.title,v.hook,v.format].some(x=>x?.toLowerCase().includes(q.toLowerCase()))).sort((a,b)=>new Date(b.publishDate||b.createdAt)-new Date(a.publishDate||a.createdAt));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><div style={{fontSize:20,fontWeight:800,color:C.text}}>🎬 Videos</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>{pub.length} published</div></div>
        <input value={q} onChange={x=>setQ(x.target.value)} placeholder="🔍 Search..." style={{...inp,width:180,fontSize:12,padding:"7px 11px"}}/>
      </div>
      {pub.length===0?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:10}}>🎬</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>No videos yet</div><div style={{fontSize:12,color:C.muted,marginTop:5}}>Add metrics to your published videos to see them here</div></Card>
      :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:13}}>
        {pub.map(v=>{
          const ev=engRate(v);const isCf=cf===v.id;
          return(
            <div key={v.id} style={{background:C.surface,borderRadius:11,border:`1px solid ${C.border}`,boxShadow:sh,overflow:"hidden"}}>
              <div style={{padding:"12px 14px 9px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:C.muted}}>{v.publishDate||v.createdAt}</span><span style={{fontSize:9,background:C.accent+"18",color:C.accent,padding:"2px 6px",borderRadius:20,fontWeight:600}}>{v.platform}</span></div>
                <div style={{fontSize:12,fontWeight:800,color:C.text,lineHeight:1.3,marginBottom:5}}>{v.title}</div>
                {v.hook&&<Tag c={v.hook}/>}{v.format&&<Tag c={v.format} color={C.accent}/>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"9px 14px",gap:5}}>
                {[[fmt(v.views),"👁 Views"],[ev,"💹 Eng."],[v.paraTi!=null?v.paraTi+"%":"—","📡 For You"]].map(([val,label])=>(
                  <div key={label} style={{textAlign:"center",background:C.light,borderRadius:6,padding:"6px 3px"}}><div style={{fontSize:13,fontWeight:800,color:C.text}}>{val}</div><div style={{fontSize:9,color:C.muted,marginTop:1}}>{label}</div></div>
                ))}
              </div>
              <div style={{padding:"7px 14px 11px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {!isCf?<button onClick={()=>setCf(v.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:12}}>🗑</button>:<div style={{display:"flex",gap:5,alignItems:"center"}}><span style={{fontSize:10,color:C.red,fontWeight:700}}>Delete?</span><button onClick={()=>{onDelete(v.id);setCf(null);}} style={{fontSize:9,padding:"2px 6px",background:C.red,border:"none",borderRadius:3,cursor:"pointer",color:"#fff",fontWeight:700}}>Yes</button><button onClick={()=>setCf(null)} style={{fontSize:9,padding:"2px 6px",background:C.light,border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.text}}>No</button></div>}
                {v.url?<a href={v.url} target="_blank" rel="noreferrer" style={{fontSize:11,fontWeight:700,color:C.accent,textDecoration:"none",background:C.accent+"12",padding:"4px 10px",borderRadius:20}}>Watch →</a>:<span style={{fontSize:10,color:C.muted,fontStyle:"italic"}}>No URL</span>}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}

// ── CREATOR ANALYTICS ─────────────────────────────────────────────────────────
function CreatorAnalytics({videos}){
  const wm=videos.filter(v=>v.metricsAdded&&v.views>0);
  const tv=wm.reduce((s,v)=>s+v.views,0);
  const ae=wm.length?(wm.reduce((s,v)=>s+(v.views>0?(v.likes+v.comments+v.shares+v.saves)/v.views:0),0)/wm.length*100).toFixed(1)+"%":"—";
  const wp=wm.filter(v=>v.paraTi!=null);
  const ap=wp.length?Math.round(wp.reduce((s,v)=>s+v.paraTi,0)/wp.length)+"%":"—";
  const grp=(vs,key)=>{const m={};vs.forEach(v=>{if(!v[key])return;if(!m[v[key]])m[v[key]]={n:0,s:0};m[v[key]].n++;m[v[key]].s+=v.views;});return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n),n:d.n})).sort((a,b)=>b.avg-a.avg);};
  const hd=grp(wm,"hook");const fd=grp(wm,"format");
  const top=[...wm].sort((a,b)=>b.views-a.views).slice(0,3);
  const ch=(data,title,color)=>(<Card><div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase"}}>{title}</div><ResponsiveContainer width="100%" height={160}><BarChart data={data.slice(0,6)} layout="vertical" margin={{left:0,right:18,top:0,bottom:0}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={92} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg"]}/><Bar dataKey="avg" radius={3}>{data.slice(0,6).map((_,i)=><Cell key={i} fill={i===0?color:i===1?color+"BB":"#CBD5E1"}/>)}</Bar></BarChart></ResponsiveContainer></Card>);
  if(wm.length===0)return(<div><div style={{marginBottom:20}}><div style={{fontSize:20,fontWeight:800,color:C.text}}>🧠 Analytics</div></div><Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:10}}>📊</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>No data yet</div><div style={{fontSize:12,color:C.muted,marginTop:5}}>Analytics appear after you add metrics to published videos</div></Card></div>);
  return(
    <div>
      <div style={{marginBottom:18}}><div style={{fontSize:20,fontWeight:800,color:C.text}}>🧠 Analytics</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>{wm.length} videos analyzed</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
        {[[fmt(tv),"👁 Total views",C.gold],[wm.length,"🎬 Videos",C.accent],[ae,"💹 Avg engagement",C.green],[ap,"📡 For You avg",C.accent]].map(([v,l,c])=>(
          <div key={l} style={{background:C.surface,borderRadius:10,padding:14,border:`1px solid ${C.border}`,boxShadow:sh}}><div style={{fontSize:10,color:C.muted,marginBottom:5}}>{l}</div><div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {ch(hd,"🪝 Avg views by hook",C.gold)}{ch(fd,"🎬 Avg views by format",C.accent)}
      </div>
      <Card><div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase"}}>🏆 Top videos</div>
        {top.map((v,i)=>(<div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}><div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:14}}>{i===0?"🥇":i===1?"🥈":"🥉"}</span><div><div style={{fontSize:12,fontWeight:600,color:C.text}}>{v.title}</div><div style={{fontSize:10,color:C.muted}}>{v.platform}</div></div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,color:C.gold}}>{fmt(v.views)}</div><div style={{fontSize:10,color:C.muted}}>{engRate(v)}</div></div></div>))}
      </Card>
    </div>
  );
}

// ── CREATOR APP SHELL ─────────────────────────────────────────────────────────
function CreatorApp({user,profile,onLogout}){
  const[page,setPage]=useState("dashboard");
  const[videos,setVideos]=useState([]);
  const[goals,setGoals]=useState({});
  const[month,setMonth]=useState(curMonth());
  const[loading,setLoading]=useState(true);

  const load=useCallback(async()=>{
    const[vs,gs]=await Promise.all([
      sbGet("creator_videos",`&user_id=eq.${user.id}&order=created_at.desc`),
      sbGet("creator_goals",`&user_id=eq.${user.id}`),
    ]);
    setVideos((vs||[]).map(r=>({id:r.id,userId:r.user_id,title:r.title,platform:r.platform,stage:r.stage,targetDate:r.target_date,publishDate:r.publish_date,url:r.url||"",hook:r.hook||"",format:r.format||"",cta:r.cta||"",views:r.views||0,likes:r.likes||0,comments:r.comments||0,shares:r.shares||0,saves:r.saves||0,paraTi:r.para_ti,siguiendo:r.siguiendo,busqueda:r.busqueda,pauta:r.pauta||0,metricsAdded:r.metrics_added||false,month:r.month,createdAt:r.created_at})));
    const gm={};(gs||[]).forEach(g=>{gm[g.month]=g.goal;});setGoals(gm);
    setLoading(false);
  },[user.id]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{const p=setInterval(load,5000);return()=>clearInterval(p);},[load]);

  const addV=useCallback(async v=>{await sbInsert("creator_videos",{id:v.id,user_id:user.id,title:v.title,platform:v.platform||"TikTok",stage:"idea",target_date:v.targetDate||null,publish_date:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,para_ti:null,siguiendo:null,busqueda:null,pauta:0,metrics_added:false,month:v.month||curMonth(),created_at:new Date().toISOString()});},[user.id]);
  const moveV=useCallback(async(id,st)=>{const up={stage:st};if(st==="published")up.publish_date=new Date().toISOString().slice(0,10);await sbUpdate("creator_videos","id",id,up);},[]);
  const saveM=useCallback(async(id,m)=>{await sbUpdate("creator_videos","id",id,{url:m.url||"",hook:m.hook||"",format:m.format||"",cta:m.cta||"",views:m.views||0,likes:m.likes||0,comments:m.comments||0,shares:m.shares||0,saves:m.saves||0,para_ti:m.paraTi||null,siguiendo:m.siguiendo||null,busqueda:m.busqueda||null,pauta:m.pauta||0,metrics_added:true});},[]);
  const delV=useCallback(async id=>{await sbDelete("creator_videos","id",id);},[]);
  const setGoal=useCallback(async(m,g)=>{await sbUpsert("creator_goals",{user_id:user.id,month:m,goal:g},"user_id,month");setGoals(p=>({...p,[m]:g}));},[user.id]);

  if(loading)return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:C.text}}>ContentHub Sidekick</div><div style={{fontSize:12,color:C.muted,marginTop:5}}>Loading...</div></div></div>);

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:sh}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:15,fontWeight:900,color:C.text,letterSpacing:-0.3}}>ContentHub <span style={{color:C.accent,fontWeight:400,fontSize:12}}>Sidekick</span></div>
          <span style={{background:C.accent+"18",color:C.accent,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20}}>Creator</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          {[["dashboard","Dashboard"],["videos","Videos"],["analytics","Analytics"]].map(([id,label])=>(
            <button key={id} onClick={()=>setPage(id)} style={{padding:"5px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:page===id?600:400,color:page===id?C.text:C.muted,background:page===id?C.light:"transparent",borderRadius:7}}>{label}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:11,color:C.muted}}>{profile?.name||user.email}</span>
          <button onClick={onLogout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}}>Sign out</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {page==="dashboard"&&<CreatorDashboard videos={videos} goals={goals} month={month} onMonthChange={setMonth} onSetGoal={setGoal} onAddVideo={addV} onMoveVideo={moveV} onMetrics={saveM} onDeleteVideo={delV} userId={user.id}/>}
        {page==="videos"&&<CreatorVideos videos={videos} onDelete={delV}/>}
        {page==="analytics"&&<CreatorAnalytics videos={videos}/>}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const[state,setState]=useState("loading");
  const[authPath,setAuthPath]=useState(null);
  const[user,setUser]=useState(null);
  const[profile,setProfile]=useState(null);

  useEffect(()=>{
    (async()=>{
      try{
        const s=await sbGetSession();
        if(s?.user){const p=await sbGetOne("profiles","id",s.user.id);setUser(s.user);setProfile(p);setState(p?.account_type||"creator");}
        else setState("landing");
      }catch(e){setState("landing");}
    })();
  },[]);

  useEffect(()=>{const iv=setInterval(async()=>{const s=localStorage.getItem("sk_auth");if(s)await sbGetSession();},10*60*1000);return()=>clearInterval(iv);},[]);

  const login=(u,p)=>{setUser(u);setProfile(p);setState(p?.account_type||"creator");};
  const logout=()=>{sbSignOut();setUser(null);setProfile(null);setState("landing");};
  const pick=path=>{if(path==="login"){setAuthPath(null);setState("auth");}else{setAuthPath(path);setState("auth");}};

  if(state==="loading")return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:C.text}}>ContentHub Sidekick</div><div style={{fontSize:12,color:C.muted,marginTop:5}}>Loading...</div></div></div>);
  if(state==="landing")return<Landing onPath={pick}/>;
  if(state==="auth")return<AuthScreen path={authPath||"creator"} onLogin={login} onBack={()=>setState("landing")}/>;
  if(state==="creator")return<CreatorApp user={user} profile={profile} onLogout={logout}/>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:380}}>
        <div style={{fontSize:30,marginBottom:14}}>🏢</div>
        <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:7}}>Agency portal</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:18}}>Coming soon. The full agency experience is being built here.</div>
        <button onClick={logout} style={{padding:"10px 22px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>Sign out</button>
      </div>
    </div>
  );
}
