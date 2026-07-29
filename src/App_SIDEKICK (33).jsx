import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SB_URL = "https://dtpxqxwhehzyrtmrhiio.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cHhxeHdoZWh6eXJ0bXJoaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODUzNjMsImV4cCI6MjEwMDY2MTM2M30.qeYZV8B2sgF_2LE2hity97reHqg8oaQF1D39HHjFgbU";
let _token = null;

const _h = (x={}) => ({"apikey":SB_KEY,"Content-Type":"application/json","Authorization":`Bearer ${_token||SB_KEY}`,...x});
const sbGet = async (t,p="") => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?select=*${p}`,{headers:_h()}); return r.ok?await r.json():[];} catch(e){return [];} };
const sbGetOne = async (t,c,v) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?${c}=eq.${encodeURIComponent(v)}&select=*&limit=1`,{headers:_h()}); if(!r.ok)return null; const a=await r.json(); return a[0]||null;} catch(e){return null;} };
const sbInsert = async (t,d) => { 
  try { 
    const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:"POST",headers:_h({"Prefer":"return=minimal"}),body:JSON.stringify(Array.isArray(d)?d:[d])});
    if(!r.ok){const err=await r.text();console.error("sbInsert failed:",t,r.status,err);}
    return r.ok;
  } catch(e){console.error("sbInsert error:",e);return false;} 
};
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
            {path:"creator",badge:"From $29/mo",badgeBg:"#EFF6FF",badgeColor:"#1D4ED8",icon:"🏢",iconBg:"#EFF6FF",title:"Business",desc:"For companies and in-house marketers making content for their own brand.",features:["One brand, one pipeline","AI script and shoot planning","Monthly progress dashboard","Hook and format analytics","Multi-platform tracking"],cta:"Start 14-day free trial",ctaBg:C.text,ctaColor:"#FFF",ctaBorder:C.text,border:`2px solid ${C.accent}`},
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
  const[pendingUser,setPendingUser]=useState(null); // set after signup to show BP setup
  const go=async()=>{
    if(!email||!pass||(mode==="signup"&&!name)){setErr("Please fill in all fields");return;}
    setLoading(true);setErr("");
    if(mode==="signup"){
      const{user,error}=await sbSignUp(email,pass);
      if(error||!user){setErr("Could not create account.");setLoading(false);return;}
      const{user:u2,error:e2}=await sbSignIn(email,pass);
      if(e2||!u2){setErr("Account created — please sign in.");setMode("login");setLoading(false);return;}
      await sbInsert("profiles",{id:u2.id,name,email,account_type:path});
      // Show business profile setup before entering the app
      setPendingUser({user:u2,profile:{name,account_type:path}});
      setLoading(false);
      return;
    } else {
      const{user,error}=await sbSignIn(email,pass);
      if(error||!user){setErr("Wrong email or password.");setLoading(false);return;}
      const prof=await sbGetOne("profiles","id",user.id);
      onLogin(user,prof||{account_type:"creator"});
    }
    setLoading(false);
  };
  // After signup, show business profile setup before entering app
  if(pendingUser){
    return <BusinessProfileSetup
      onComplete={async(bp)=>{
        await sbUpdate("profiles","id",pendingUser.user.id,{business_profile:bp});
        localStorage.setItem(`sk_bp_done_${pendingUser.user.id}`,"1");
        onLogin(pendingUser.user,{...pendingUser.profile,business_profile:bp});
      }}
      existing={null}
    />;
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:340,padding:32,background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,marginBottom:14,padding:0}}>← Back</button>
        <div style={{fontSize:20,fontWeight:900,color:C.text,marginBottom:4}}>ContentHub Sidekick</div>
        <div style={{fontSize:12,color:C.accent,fontWeight:600,marginBottom:22}}>{path==="creator"?"Business":"Agency"} — {mode==="signup"?"Create account":"Sign in"}</div>
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
        {[["Working title","title","text"],["Target date","targetDate","date"]].map(([l,k,t])=>(
          <div key={k} style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div><input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} onKeyDown={x=>x.key==="Enter"&&save()} style={inp} placeholder={k==="title"?"e.g. Behind the scenes at our shop":""}/></div>
        ))}
        <div style={{marginBottom:18}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Platform</div><select value={f.platform} onChange={x=>set("platform",x.target.value)} style={inp}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={onClose}>Cancel</Btn><Btn onClick={save} primary>Add to pipeline ✓</Btn></div>
      </div>
    </div>
  );
}

// ── METRICS MODAL ─────────────────────────────────────────────────────────────
function MetricsModal({video,onSave,onClose}){
  const[f,sf]=useState({url:"",hook:"",format:"",cta:"",views:"",likes:"",comments:"",shares:"",saves:"",paraTi:"",siguiendo:"",busqueda:""});
  const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=()=>{const nums=["views","likes","comments","shares","saves","paraTi","siguiendo","busqueda"];const m={...f,...nums.reduce((o,k)=>({...o,[k]:f[k]!==""?+f[k]:null}),{})};onSave(m);onClose();};
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
          <div style={g2}>{fld("🔖 Saves","saves","number")}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:1,margin:"12px 0 8px"}}>📡 TRAFFIC SOURCES</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:8,background:"rgba(255,255,255,.05)",padding:"6px 10px",borderRadius:6}}>TikTok: For You / Following / Search · Instagram: Explore / Home / Other · YouTube: Suggested / Browse / Search</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>{fld("🚀 % Algorithmic","paraTi","number")}{fld("👥 % Followers","siguiendo","number")}{fld("🔍 % Search/Other","busqueda","number")}</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}><Btn onClick={onClose}>Cancel</Btn><Btn onClick={save} primary>Save metrics ✓</Btn></div>
        </div>
      </div>
    </div>
  );
}


// ── CONTEXTUAL TOUR ──────────────────────────────────────────────────────────
function TourBubble({step,total,emoji,title,body,action,onAction,onSkip,targetRef,side="bottom"}){
  const[rect,setRect]=useState(null);
  useEffect(()=>{
    const update=()=>{
      if(targetRef?.current){const r=targetRef.current.getBoundingClientRect();setRect(r);}
      else setRect(null);
    };
    update();
    const t=setTimeout(update,100); // small delay for DOM settle
    window.addEventListener("resize",update);
    return()=>{window.removeEventListener("resize",update);clearTimeout(t);};
  },[targetRef]);

  const GAP=12;
  let bLeft=window.innerWidth/2-140,bTop=window.innerHeight/2-100;
  let arrowH=null,arrowV=null;

  if(rect){
    if(side==="bottom"){ bTop=rect.bottom+GAP; bLeft=Math.min(Math.max(rect.left+rect.width/2-140,10),window.innerWidth-290); arrowH={top:-8,left:"50%",transform:"translateX(-50%)",borderL:"transparent",borderR:"transparent",borderB:C.text,borderT:"none"}; }
    if(side==="top"){ bTop=rect.top-GAP-170; bLeft=Math.min(Math.max(rect.left+rect.width/2-140,10),window.innerWidth-290); arrowH={bottom:-8,left:"50%",transform:"translateX(-50%)",borderL:"transparent",borderR:"transparent",borderT:C.text,borderB:"none"}; }
    if(side==="right"){ bTop=rect.top+rect.height/2-80; bLeft=rect.right+GAP; arrowV={left:-8,top:"50%",transform:"translateY(-50%)",borderT:"transparent",borderB:"transparent",borderR:C.text,borderL:"none"}; }
    if(side==="left"){ bTop=rect.top+rect.height/2-80; bLeft=rect.left-GAP-280; arrowV={right:-8,top:"50%",transform:"translateY(-50%)",borderT:"transparent",borderB:"transparent",borderL:C.text,borderR:"none"}; }
  }

  const mkArrow=(a)=>{
    if(!a)return null;
    const base={position:"absolute",width:0,height:0,border:"8px solid transparent"};
    const s={...base};
    if(a.borderB){s.borderTop="none";s.borderBottom=`8px solid ${a.borderB}`;s.borderLeft="8px solid transparent";s.borderRight="8px solid transparent";}
    if(a.borderT){s.borderBottom="none";s.borderTop=`8px solid ${a.borderT}`;s.borderLeft="8px solid transparent";s.borderRight="8px solid transparent";}
    if(a.borderR){s.borderLeft="none";s.borderRight=`8px solid ${a.borderR}`;s.borderTop="8px solid transparent";s.borderBottom="8px solid transparent";}
    if(a.borderL){s.borderRight="none";s.borderLeft=`8px solid ${a.borderL}`;s.borderTop="8px solid transparent";s.borderBottom="8px solid transparent";}
    if(a.top!==undefined)s.top=a.top; if(a.bottom!==undefined)s.bottom=a.bottom;
    if(a.left!==undefined)s.left=a.left; if(a.right!==undefined)s.right=a.right;
    if(a.transform)s.transform=a.transform;
    return<div style={s}/>;
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,fontFamily:"system-ui,sans-serif"}}>
      {/* Full dark overlay */}
      <div style={{position:"absolute",inset:0,background:"rgba(15,23,42,.78)"}}/>
      {/* Spotlight cutout on target element */}
      {rect&&<div style={{position:"fixed",top:rect.top-6,left:rect.left-6,width:rect.width+12,height:rect.height+12,borderRadius:10,boxShadow:`0 0 0 9999px rgba(15,23,42,.78)`,zIndex:10000,pointerEvents:"none",border:`2px solid ${C.accent}`,background:"transparent"}}/>}
      {/* Step dots */}
      <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6,zIndex:10001}}>
        {Array.from({length:total}).map((_,i)=>(
          <div key={i} style={{width:i===step-1?18:6,height:6,borderRadius:20,background:i<step?"#FFF":"rgba(255,255,255,.25)",transition:"all .25s"}}/>
        ))}
      </div>
      {/* Bubble */}
      <div style={{position:"fixed",top:Math.min(Math.max(bTop,12),window.innerHeight-220),left:Math.min(Math.max(bLeft,10),window.innerWidth-290),width:280,background:C.text,borderRadius:16,padding:"18px 18px 16px",boxShadow:"0 12px 40px rgba(0,0,0,.5)",zIndex:10001}}>
        {mkArrow(arrowH||arrowV)}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <span style={{fontSize:22}}>{emoji}</span>
          <div style={{fontSize:14,fontWeight:800,color:"#FFF",letterSpacing:-0.2}}>{title}</div>
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.65,marginBottom:14}}>{body}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onSkip} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:11,cursor:"pointer",padding:0}}>Skip tour</button>
          <button onClick={onAction} style={{padding:"8px 18px",background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",borderRadius:8,color:"#FFF",fontSize:13,fontWeight:700,cursor:"pointer"}}>{action}</button>
        </div>
      </div>
    </div>
  );
}




// ── SCRIPT VIEWER / EDITOR ────────────────────────────────────────────────────
function ScriptViewer({card,businessProfile,onSave,onRewrite,onClose}){
  const[editing,setEditing]=useState(false);
  const[text,setText]=useState(card.script||"");

  const printScript=()=>{
    const win=window.open("","_blank");
    win.document.write(`
      <html><head><title>${card.title}</title>
      <style>
        body{font-family:Georgia,serif;max-width:600px;margin:40px auto;color:#111;line-height:1.8}
        h1{font-size:20px;margin-bottom:4px}
        .meta{font-size:13px;color:#666;margin-bottom:32px}
        .script{font-size:15px;white-space:pre-wrap}
        .label{font-size:11px;font-weight:bold;letter-spacing:1px;color:#2563EB;text-transform:uppercase;margin-top:20px;margin-bottom:4px}
        @media print{body{margin:20px}}
      </style></head>
      <body>
        <h1>${card.title}</h1>
        <div class="meta">${card.platform} · ${businessProfile?.businessName||""} · ${new Date().toLocaleDateString()}</div>
        <div class="script">${text.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
        <script>window.onload=()=>{window.print();}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(0,0,0,.3)",width:"min(600px,100%)",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>📄 Script</div>
            <div style={{fontSize:11,color:C.muted}}>{card.title} · {card.platform}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={onRewrite} style={{fontSize:11,padding:"5px 11px",background:"#EDE9FE",border:"1px solid #C4B5FD",borderRadius:20,cursor:"pointer",color:"#7C3AED",fontWeight:600}}>✨ Rewrite with AI</button>
            <button onClick={()=>setEditing(e=>!e)} style={{fontSize:11,padding:"5px 11px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>{editing?"👁 Preview":"✏️ Edit"}</button>
            <button onClick={printScript} style={{fontSize:11,padding:"5px 11px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>🖨 Print / PDF</button>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:4}}>×</button>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:20}}>
          {editing
            ?<textarea
               value={text}
               onChange={e=>setText(e.target.value)}
               style={{...inp,height:340,resize:"vertical",fontSize:13,lineHeight:1.7,fontFamily:"system-ui"}}
             />
            :<div style={{fontSize:13,lineHeight:1.8,color:C.text,whiteSpace:"pre-wrap"}}>{text}</div>
          }
        </div>

        {/* Footer */}
        <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:11,color:C.muted}}>{text.split(" ").length} words · ~{Math.round(text.split(" ").length/2.5)}s</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{padding:"7px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,color:C.text}}>Close</button>
            {editing&&<button onClick={()=>{onSave(text);}} style={{padding:"7px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700}}>Save changes ✓</button>}
          </div>
        </div>
      </div>
    </div>
  );
}


// ── SHOOT DIRECTOR ────────────────────────────────────────────────────────────
function ShootDirector({card,businessProfile,onSaveShotList,onClose}){
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[started,setStarted]=useState(false);
  const bottomRef=useRef(null);

  const buildSystem=()=>{
    const bp=businessProfile||{};
    const hasScript=!!card.script;
    return `You are a shoot director helping a small business film a short-form social media video. You create practical, printable production sheets.

BUSINESS: ${bp.businessName||"Unknown"} — ${bp.whatYouDo||""}
PLATFORM: ${card.platform}
VIDEO TITLE: "${card.title}"
${hasScript?`SCRIPT (use these exact lines in the shot list):\n${card.script}`:"No script saved yet — work from the video concept and ask about the content direction."}

YOUR JOB:
1. Ask 2-3 quick setup questions: how many people, their names, filming location (indoor/outdoor), any specific equipment
2. Generate a complete production sheet that combines shot guidance WITH the script lines

OUTPUT FORMAT (use this exactly — square checkboxes for each shot):

PRODUCTION SHEET — [Video Title]
Platform: [platform] | Talent: [names] | Location: [location]
─────────────────────────────────────

☐ SHOT 1 — [HOOK] [Shot type e.g. Close-up on [Name]]
Lines: "[exact words from script]"
Notes: [framing, lighting, prop, or action note]

☐ SHOT 2 — [Shot type]
Lines: "[exact words]" OR Action: [what they do]
Notes: [any guidance]

[continue for all shots]

─────────────────────────────────────
WRAP CHECKLIST
☐ Review all shots on playback before leaving location
☐ Check audio is clear on at least 2 takes per shot
☐ Film one extra B-roll shot you didn't plan

Keep it practical for a small team with a smartphone. No jargon. Each shot should be self-contained so they can check it off and move on.`;
  };

  const start=async()=>{
    setStarted(true);setLoading(true);
    const opening={role:"user",content:`I need to plan the shoot for "${card.title}" on ${card.platform}.`};
    setMsgs([opening]);
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[opening],systemPrompt:buildSystem()})});
      const d=await r.json();
      if(d.content)setMsgs([opening,{role:"assistant",content:d.content}]);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input.trim()};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);setInput("");setLoading(true);
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMsgs,systemPrompt:buildSystem()})});
      const d=await r.json();
      if(d.content)setMsgs([...newMsgs,{role:"assistant",content:d.content}]);
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(0,0,0,.3)",width:"min(640px,100%)",height:"min(600px,90vh)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎥</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Shoot Director</div>
              <div style={{fontSize:11,color:C.muted}}>{card.title} · {card.platform}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:4}}>×</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
          {!started&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"24px 32px"}}>
              <div style={{fontSize:40,marginBottom:16}}>🎬</div>
              <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:8,letterSpacing:-0.3}}>Plan your shoot</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:6}}>Answer a few quick questions and get a numbered shot list you can follow on filming day — no guessing, no wasted takes.</div>
              {card.script&&<div style={{fontSize:11,color:C.green,background:"#DCFCE7",padding:"5px 12px",borderRadius:20,marginBottom:20}}>📄 Script is saved — shot list will match it exactly</div>}
              {!card.script&&<div style={{fontSize:11,color:C.muted,background:C.light,padding:"5px 12px",borderRadius:20,marginBottom:20}}>💡 Tip: write a script first for a more precise shot list</div>}
              <button onClick={start} style={{padding:"11px 28px",background:"#F59E0B",color:"#FFF",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>Plan the shoot →</button>
            </div>
          )}
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
              {m.role==="assistant"&&<div style={{fontSize:10,color:C.muted,marginBottom:4,marginLeft:2}}>Shoot Director</div>}
              <div style={{maxWidth:"88%",background:m.role==="user"?"#F59E0B":C.light,color:m.role==="user"?"#FFF":C.text,borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"10px 13px",fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap"}}>
                {m.content}
              </div>
              {m.role==="assistant"&&(
                <div style={{display:"flex",gap:8,marginTop:5,marginLeft:2}}>
                  <button onClick={()=>navigator.clipboard.writeText(m.content)} style={{fontSize:10,color:C.muted,background:"none",border:"none",cursor:"pointer",padding:0}}>Copy ↗</button>
                  <button onClick={()=>navigator.clipboard.writeText(m.content)} style={{fontSize:10,color:C.muted,background:"none",border:"none",cursor:"pointer",padding:0}}>Copy ↗</button>
                </div>
              )}
            </div>
          ))}
          {loading&&<div style={{background:C.light,borderRadius:"12px 12px 12px 3px",padding:"10px 14px",fontSize:13,color:C.muted,width:"fit-content"}}>🎥 Planning...</div>}
          <div ref={bottomRef}/>
        </div>
        {started&&(
          <div style={{borderTop:`1px solid ${C.border}`,flexShrink:0}}>
            {msgs.some(m=>m.role==="assistant")&&(
              <div style={{padding:"10px 14px 0"}}>
                <button onClick={()=>onSaveShotList(msgs.filter(m=>m.role==="assistant").pop()?.content||"")}
                  style={{width:"100%",padding:"9px 0",background:"#F59E0B",color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>
                  ✓ Save latest shot list to my card
                </button>
              </div>
            )}
            <div style={{padding:"10px 14px 12px",display:"flex",gap:8}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="3 people, names are Jake, Maria, and Luis, filming in the gym..." style={{...inp,fontSize:13,padding:"9px 12px"}} disabled={loading}/>
              <button onClick={send} disabled={loading||!input.trim()} style={{padding:"9px 16px",background:loading||!input.trim()?C.border:"#92400E",color:loading||!input.trim()?C.muted:"#FFF",border:"none",borderRadius:8,cursor:loading||!input.trim()?"not-allowed":"pointer",fontSize:13,fontWeight:700,flexShrink:0}}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShotListViewer({card,businessProfile,onSave,onReplan,onClose}){
  const[editing,setEditing]=useState(false);
  const[text,setText]=useState(card.shotList||"");

  const esc=s=>(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const printShotList=()=>{
    const win=window.open("","_blank");
    win.document.write(`<html><head><title>Shot List — ${card.title}</title>
    <style>body{font-family:Georgia,serif;max-width:640px;margin:40px auto;color:#111;line-height:1.8}h1{font-size:20px;margin-bottom:4px}.meta{font-size:13px;color:#666;margin-bottom:28px}.content{font-size:14px;white-space:pre-wrap}@media print{body{margin:20px}}</style></head>
    <body><h1>Shot List — ${esc(card.title)}</h1>
    <div class="meta">${esc(card.platform)} · ${esc(businessProfile?.businessName||"")} · ${new Date().toLocaleDateString()}</div>
    <div class="content">${esc(text)}</div>
    <script>window.onload=()=>{window.print();}<\/script></body></html>`);
    win.document.close();
  };

  const printFullSheet=()=>{
    const win=window.open("","_blank");
    win.document.write(`<html><head><title>Production Sheet — ${card.title}</title>
    <style>
      body{font-family:Georgia,serif;max-width:660px;margin:40px auto;color:#111;line-height:1.8}
      h1{font-size:22px;margin-bottom:4px;letter-spacing:-0.3px}
      .meta{font-size:13px;color:#666;margin-bottom:6px}
      .divider{border:none;border-top:1px solid #ddd;margin:24px 0}
      .section-label{font-size:11px;font-weight:bold;letter-spacing:1.5px;color:#2563EB;text-transform:uppercase;margin-bottom:10px}
      .script-block{background:#f8f9fa;border-left:3px solid #2563EB;padding:14px 16px;border-radius:4px;font-size:14px;white-space:pre-wrap;line-height:1.8;margin-bottom:8px}
      .script-note{font-size:12px;color:#666;margin-bottom:24px;font-style:italic}
      .shotlist{font-size:14px;white-space:pre-wrap;line-height:1.9}
      @media print{body{margin:20px}.script-block{break-inside:avoid}}
    </style></head>
    <body>
      <h1>${esc(card.title)}</h1>
      <div class="meta">${esc(card.platform)} · ${esc(businessProfile?.businessName||"")} · ${new Date().toLocaleDateString()}</div>
      <hr class="divider"/>
      <div class="section-label">Script</div>
      <div class="script-block">${esc(card.script)}</div>
      <div class="script-note">Use these lines as your reference during filming.</div>
      <hr class="divider"/>
      <div class="section-label">Shot List & Production Notes</div>
      <div class="shotlist">${esc(text)}</div>
      <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`);
    win.document.close();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(0,0,0,.3)",width:"min(600px,100%)",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div><div style={{fontSize:13,fontWeight:700,color:C.text}}>🎬 Shot List</div><div style={{fontSize:11,color:C.muted}}>{card.title} · {card.platform}</div></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={onReplan} style={{fontSize:11,padding:"5px 11px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:20,cursor:"pointer",color:"#92400E",fontWeight:600}}>🎥 Replan shoot</button>
            <button onClick={()=>setEditing(e=>!e)} style={{fontSize:11,padding:"5px 11px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>{editing?"👁 Preview":"✏️ Edit"}</button>
<button onClick={printShotList} style={{fontSize:11,padding:"5px 11px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>🖨 Shot list</button>
            {card.script
              ?<button onClick={printFullSheet} style={{fontSize:11,padding:"5px 11px",background:"#EDE9FE",border:"1px solid #C4B5FD",borderRadius:20,cursor:"pointer",color:"#7C3AED",fontWeight:600}}>🖨 Full production sheet</button>
              :<button disabled style={{fontSize:11,padding:"5px 11px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"not-allowed",color:C.muted,opacity:.5}} title="Save a script first to unlock this">🖨 Full sheet (save script first)</button>
            }
            <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:4}}>×</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:20}}>
          {editing
            ?<textarea value={text} onChange={e=>setText(e.target.value)} style={{...inp,height:340,resize:"vertical",fontSize:13,lineHeight:1.7,fontFamily:"system-ui"}}/>
            :<div style={{fontSize:13,lineHeight:1.8,color:C.text,whiteSpace:"pre-wrap"}}>{text}</div>
          }
        </div>
        <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:11,color:C.muted}}>{(text.match(/Shot \d+/g)||[]).length} shots planned</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{padding:"7px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,color:C.text}}>Close</button>
            {editing&&<button onClick={()=>onSave(text)} style={{padding:"7px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700}}>Save changes ✓</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI SCRIPT ASSISTANT ───────────────────────────────────────────────────────
function AIScriptChat({card, businessProfile, analytics, onSaveScript, onClose}){
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[started,setStarted]=useState(false);
  const bottomRef=useRef(null);

  // Build system prompt from business profile + analytics context
  const buildSystem=()=>{
    const bp=businessProfile||{};
    const topHook=analytics?.topHook||null;
    const topFormat=analytics?.topFormat||null;
    let sys=`You are a content script assistant for a small business. You help write short-form video scripts for social media.

BUSINESS CONTEXT:
- Business: ${bp.businessName||"Unknown business"}
- What they do: ${bp.whatYouDo||"Not specified"}
- Target audience: ${bp.audience||"Not specified"}
- Content goal: ${bp.goal||"Not specified"}
- Brand tone: ${bp.tone||"Not specified"}

CURRENT VIDEO:
- Title: "${card.title}"
- Platform: ${card.platform||"TikTok"}
- Stage: ${card.stage}`;

    if(topHook||topFormat){
      sys+=`

PERFORMANCE DATA (use this to guide recommendations):`;
      if(topHook) sys+=`
- Their best performing hook type: ${topHook}`;
      if(topFormat) sys+=`
- Their best performing format: ${topFormat}`;
    }

    sys+=`

GUIDELINES:
- Match their brand tone exactly — use the tone they described
- Platform lengths: TikTok=30-60s(150-250 words), Instagram Reels=15-90s, YouTube Shorts=<60s, YouTube=2-10min, Facebook=1-3min, LinkedIn=30-90s
- Always label sections: HOOK / BODY / CTA
- Hook must stop the scroll in the first 2-3 seconds
- Ask 1-2 clarifying questions first before writing the full script
- Stage directions in [brackets] where helpful
- Reference performance data when suggesting hooks or formats
- Keep it human and authentic — never generic`;

    return sys;
  };

  const startChat=async()=>{
    setStarted(true);
    setLoading(true);
    const openingMsg={role:"user",content:`I'm working on a video called "${card.title}" for ${card.platform}. Help me write a script.`};
    setMsgs([openingMsg]);
    try{
      const r=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[openingMsg],systemPrompt:buildSystem()})
      });
      const d=await r.json();
      if(d.content){
        setMsgs([openingMsg,{role:"assistant",content:d.content}]);
      }
    }catch(e){console.error(e);}
    setLoading(false);
  };

  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input.trim()};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try{
      const r=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:newMsgs,systemPrompt:buildSystem()})
      });
      const d=await r.json();
      if(d.content){
        setMsgs([...newMsgs,{role:"assistant",content:d.content}]);
      }
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[msgs,loading]);

  const copyText=(text)=>{
    navigator.clipboard.writeText(text);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(0,0,0,.3)",width:"min(640px,100%)",height:"min(600px,90vh)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✨</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Script Assistant</div>
              <div style={{fontSize:11,color:C.muted,maxWidth:300,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.title} · {card.platform}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:4}}>×</button>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
          {!started&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"24px 32px"}}>
              <div style={{fontSize:40,marginBottom:16}}>✍️</div>
              <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:8,letterSpacing:-0.3}}>Ready to write your script</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:6}}>
                The AI already knows your business, your audience, and what content has been working for you.
              </div>
              {businessProfile?.businessName&&(
                <div style={{fontSize:12,color:C.accent,background:C.accent+"12",padding:"6px 14px",borderRadius:20,marginBottom:24}}>
                  🏢 {businessProfile.businessName}
                </div>
              )}
              <button onClick={startChat} style={{padding:"11px 28px",background:C.text,color:"#FFF",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Start writing →
              </button>
            </div>
          )}

          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
              {m.role==="assistant"&&(
                <div style={{fontSize:10,color:C.muted,marginBottom:4,marginLeft:2}}>Script Assistant</div>
              )}
              <div style={{
                maxWidth:"88%",
                background:m.role==="user"?C.text:C.light,
                color:m.role==="user"?"#FFF":C.text,
                borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",
                padding:"10px 13px",
                fontSize:13,
                lineHeight:1.65,
                whiteSpace:"pre-wrap",
              }}>
                {m.content}
              </div>
              {m.role==="assistant"&&(
                <div style={{display:"flex",gap:10,marginTop:5,marginLeft:2}}>
                  <button onClick={()=>navigator.clipboard.writeText(m.content)} style={{fontSize:10,color:C.muted,background:"none",border:"none",cursor:"pointer",padding:0}}>Copy ↗</button>
                </div>
              )}
            </div>
          ))}

          {loading&&(
            <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <div style={{background:C.light,borderRadius:"12px 12px 12px 3px",padding:"10px 14px",fontSize:13,color:C.muted}}>
                <span style={{animation:"pulse 1s infinite"}}>✨ Writing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        {started&&(
          <div style={{borderTop:`1px solid ${C.border}`,flexShrink:0}}>
            {msgs.some(m=>m.role==="assistant")&&(
              <div style={{padding:"10px 14px 0",display:"flex",gap:8}}>
                <button onClick={()=>onSaveScript&&onSaveScript(msgs.filter(m=>m.role==="assistant").pop()?.content||"")}
                  style={{flex:1,padding:"9px 0",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>
                  ✓ Save latest response as script
                </button>
              </div>
            )}
            <div style={{padding:"10px 14px 12px",display:"flex",gap:8}}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
                placeholder="Keep refining... or save when ready ↑"
                style={{...inp,fontSize:13,padding:"9px 12px"}}
                disabled={loading}
              />
              <button onClick={send} disabled={loading||!input.trim()} style={{padding:"9px 16px",background:loading||!input.trim()?C.border:C.accent,color:loading||!input.trim()?C.muted:"#FFF",border:"none",borderRadius:8,cursor:loading||!input.trim()?"not-allowed":"pointer",fontSize:13,fontWeight:700,flexShrink:0}}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

// ── CREATOR DASHBOARD ─────────────────────────────────────────────────────────
function CreatorDashboard({videos,goals,month,onMonthChange,onSetGoal,onAddVideo,onMoveVideo,onMetrics,onDeleteVideo,userId,refGoal,refAdd,refStages,refPublished,refLock,tourStep,showAddFromTour,onAddFromTourDone,onTourNext,businessProfile,onSaveScript,onSaveShotList}){
  const[showAdd,setShowAdd]=useState(false);
  // Sync external tour trigger
  useEffect(()=>{if(showAddFromTour){setShowAdd(true);onAddFromTourDone&&onAddFromTourDone();}}, [showAddFromTour]);
  const[showGoal,setShowGoal]=useState(false);
  const[metricsVid,setMetricsVid]=useState(null);
  const[confirmDel,setConfirmDel]=useState(null);
  const[overrideVid,setOverrideVid]=useState(null);
  const[aiCard,setAiCard]=useState(null);
  const[scriptCard,setScriptCard]=useState(null);
  const[shootCard,setShootCard]=useState(null);
  const[shootViewCard,setShootViewCard]=useState(null);
  const goal=goals[month]||0;
  const mVids=videos.filter(v=>v.month===month);
  const published=mVids.filter(v=>v.stage==="published").length;
  const inProg=mVids.filter(v=>v.stage!=="published").length;
  const pct=goal>0?Math.min(100,Math.round(published/goal*100)):null;
  const stageV=sid=>mVids.filter(v=>v.stage===sid);
  const emptyCount=Math.max(0,goal-mVids.length);
  const PLT={TikTok:"📱","Instagram Reels":"📸","YouTube Shorts":"🎬",YouTube:"▶️",Facebook:"👥",LinkedIn:"💼"};
  const[publishDateModal,setPublishDateModal]=useState(null); // {vid, targetStage}
  const[publishDateVal,setPublishDateVal]=useState("");

  const handleMoveVideo=(id,newStage)=>{
    if(newStage==="published"){
      setPublishDateVal(new Date().toISOString().slice(0,10));
      setPublishDateModal({id,newStage});
    } else {
      onMoveVideo(id,newStage);
    }
  };
  const confirmPublish=()=>{
    if(!publishDateVal||!publishDateModal)return;
    onMoveVideo(publishDateModal.id,"published",publishDateVal);
    setPublishDateModal(null);
  };
  const isFirstTime=Object.keys(goals).length===0&&videos.length===0;
  return(
    <div>
      {isFirstTime&&!showGoal&&(
        <div style={{background:"#EFF6FF",border:`1px solid ${C.accent}30`,borderRadius:12,padding:"18px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:4}}>👋 Start by setting your video goal</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>How many videos do you want to publish this month? This fills your pipeline with slots to plan and once you set it, the tutorial walks you through the rest.</div>
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
          <button ref={refGoal} onClick={()=>setShowGoal(true)} style={{padding:"6px 13px",border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted,fontWeight:600}}>🎯 {goal>0?`${goal} videos`:"Set goal"}</button>
          <span ref={refAdd}><Btn primary onClick={()=>{setShowAdd(true);if(tourStep===2)onTourNext&&onTourNext();}}>+ Add idea</Btn></span>
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
        {goal>0&&<><div style={{background:C.light,borderRadius:20,height:9,overflow:"hidden",marginBottom:6}}><div style={{width:`${pct||0}%`,height:"100%",background:pct===100?C.green:C.accent,borderRadius:20,transition:"width .4s"}}/></div><div style={{display:"flex",gap:14,fontSize:11,color:C.muted}}><span style={{color:C.accent,fontWeight:600}}>✅ {published} published</span><span>🎬 {mVids.filter(v=>v.stage!=="published").length} in progress</span>{published<goal&&<span>📋 {goal-published} to go</span>}</div></>}
      </Card>
      <div ref={refStages} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>
        {STAGES.map(stage=>{
          const cards=stageV(stage.id);
          return(
            <div key={stage.id} ref={stage.id==="published"?refPublished:null}
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
                    onDragStart={e=>{e.dataTransfer.setData("videoId",v.id);e.dataTransfer.setData("fromStage",stage.id);e.currentTarget.style.opacity="0.35";e.currentTarget.style.transform="rotate(1.5deg) scale(1.02)";}}
                    onDragEnd={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}
                    style={{background:C.surface,borderRadius:10,marginBottom:8,border:`1px solid ${hasMet?"#BBF7D0":C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)",cursor:"grab",display:"flex",overflow:"hidden",transition:"box-shadow .15s,transform .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.06)";e.currentTarget.style.transform="none";}}>
                    {/* Thick left stripe */}
                    <div style={{width:4,background:stage.color,flexShrink:0,borderRadius:"10px 0 0 10px"}}/>
                    {/* Card content */}
                    <div style={{padding:"11px 12px",flex:1,minWidth:0}}>
                      {/* Stage dot + label */}
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:stage.color,flexShrink:0}}/>
                        <span style={{fontSize:10,fontWeight:600,color:stage.color,letterSpacing:0.3}}>{stage.label}</span>
                      </div>
                      {/* Title */}
                      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:7,lineHeight:1.35,wordBreak:"break-word"}}>{v.title}</div>
                      {/* Platform + date row */}
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,color:C.muted,background:C.light,padding:"2px 8px",borderRadius:20,border:`1px solid ${C.border}`,display:"inline-flex",alignItems:"center",gap:3}}>{PLT[v.platform]||"📱"} {v.platform}</span>
                        {v.targetDate&&<span style={{fontSize:10,color:C.muted,display:"inline-flex",alignItems:"center",gap:3}}>📅 {v.targetDate}</span>}
                      </div>
                      {/* 7-day lock */}
                      {isPub&&!hasMet&&!unlocked&&(
                        <div ref={refLock} style={{marginBottom:8,padding:"7px 9px",background:"#F8FAFC",borderRadius:7,border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:10,fontWeight:600,color:C.muted,marginBottom:5}}>📅 Come back {unlockDate()} for metrics</div>
                          <div style={{background:C.border,borderRadius:20,height:4,overflow:"hidden"}}>
                            <div style={{width:`${lockPct}%`,height:"100%",background:lockPct>=85?C.green:C.accent,borderRadius:20,transition:"width .3s"}}/>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                            <span style={{fontSize:9,color:C.muted}}>{daysGone} of 7 days</span>
                            <span onClick={()=>setOverrideVid(v)} style={{fontSize:9,color:C.accent,cursor:"pointer",textDecoration:"underline"}}>Already have data?</span>
                          </div>
                        </div>
                      )}
                      {/* Unlocked */}
                      {isPub&&!hasMet&&unlocked&&(
                        <div style={{marginBottom:8,padding:"7px 9px",background:"#DCFCE7",borderRadius:7,border:"1px solid #BBF7D0",display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:13}}>✅</span>
                          <div><div style={{fontSize:11,fontWeight:700,color:C.green}}>Ready to add metrics!</div><div style={{fontSize:9,color:"#15803D"}}>7 days of data — add them now</div></div>
                        </div>
                      )}
                      {hasMet&&<div style={{marginBottom:8,padding:"5px 9px",background:"#DCFCE7",borderRadius:7,border:"1px solid #BBF7D0",display:"inline-flex",alignItems:"center",gap:5}}><span style={{fontSize:10}}>📊</span><span style={{fontSize:10,fontWeight:700,color:C.green}}>Metrics added</span></div>}
                      {/* Actions */}
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                        {stage.id!=="published"&&<button onClick={()=>handleMoveVideo(v.id,STAGES[STAGES.findIndex(s=>s.id===stage.id)+1]?.id)} style={{fontSize:10,padding:"4px 10px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text,fontWeight:500}}>→ {STAGES[STAGES.findIndex(s=>s.id===stage.id)+1]?.label}</button>}
                      {(stage.id==="idea"||stage.id==="production")&&(
                        v.script
                          ?<button onClick={()=>setScriptCard(v)} style={{fontSize:10,padding:"4px 10px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:20,cursor:"pointer",color:C.green,fontWeight:600}}>📄 Script ready</button>
                          :<button onClick={()=>setAiCard(v)} style={{fontSize:10,padding:"4px 10px",background:"#EDE9FE",border:"1px solid #C4B5FD",borderRadius:20,cursor:"pointer",color:"#7C3AED",fontWeight:600}}>✨ Write script</button>
                      )}
                      {stage.id==="production"&&(
                        v.shotList
                          ?<button onClick={()=>setShootViewCard(v)} style={{fontSize:10,padding:"4px 10px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:20,cursor:"pointer",color:"#92400E",fontWeight:600}}>🎬 Shot list ready</button>
                          :<button onClick={()=>setShootCard(v)} style={{fontSize:10,padding:"4px 10px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:20,cursor:"pointer",color:"#92400E",fontWeight:600}}>🎥 Plan the shoot</button>
                      )}
                        {isPub&&!hasMet&&unlocked&&<button onClick={()=>setMetricsVid(v)} style={{fontSize:10,padding:"4px 10px",background:C.green,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>📊 Add metrics</button>}
                        {!isCf&&<button onClick={()=>setConfirmDel(v.id)} style={{fontSize:10,padding:"4px 8px",background:"none",border:"none",cursor:"pointer",color:C.muted,marginLeft:"auto"}}>🗑</button>}
                        {isCf&&<div style={{display:"flex",gap:4,alignItems:"center",marginLeft:"auto"}}><span style={{fontSize:10,color:C.red,fontWeight:700}}>Delete?</span><button onClick={()=>{onDeleteVideo(v.id);setConfirmDel(null);}} style={{fontSize:10,padding:"2px 7px",background:C.red,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>Yes</button><button onClick={()=>setConfirmDel(null)} style={{fontSize:10,padding:"2px 7px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>No</button></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {stage.id==="idea"&&goal===0&&cards.length===0&&(
                <div style={{textAlign:"center",padding:"16px 8px",color:C.muted,fontSize:11,border:`1px dashed ${C.border}`,borderRadius:8,background:C.bg,lineHeight:1.5}}>
                  Set a goal above<br/>to fill your pipeline
                </div>
              )}
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
      {publishDateModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,.2)",width:"min(380px,95vw)",padding:26}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:6}}>📱 When did you publish this?</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:18,lineHeight:1.5}}>If you published more than 7 days ago, metrics unlock immediately so you can add your data right away.</div>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>Publish date</div>
              <input type="date" value={publishDateVal} onChange={e=>setPublishDateVal(e.target.value)} style={{...inp}}/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setPublishDateModal(null)} style={{padding:"8px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:13,color:C.text}}>Cancel</button>
              <button onClick={confirmPublish} style={{padding:"8px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Mark as published ✓</button>
            </div>
          </div>
        </div>
      )}
      {overrideVid&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,.2)",width:"min(380px,95vw)",padding:26}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:6}}>📊 Add metrics early</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.5}}>The 7-day wait gives your video time to accumulate real data. But if you already have the numbers — or joined ContentHub after publishing — go ahead and add them now.</div>
            <div style={{padding:12,background:"#FFFBEB",borderRadius:8,border:`1px solid ${C.amber}40`,marginBottom:18}}>
              <div style={{fontSize:12,color:C.amber,fontWeight:600}}>"{overrideVid.title}"</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3}}>Published {overrideVid.publishDate}</div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setOverrideVid(null)} style={{padding:"8px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:13,color:C.text}}>Cancel</button>
              <button onClick={()=>{setMetricsVid(overrideVid);setOverrideVid(null);}} style={{padding:"8px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Add metrics now →</button>
            </div>
          </div>
        </div>
      )}
      {showAdd&&<AddVideoModal month={month} onSave={v=>{onAddVideo({...v,userId});setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
      {metricsVid&&<MetricsModal video={metricsVid} onSave={m=>{onMetrics(metricsVid.id,m);setMetricsVid(null);}} onClose={()=>setMetricsVid(null)}/>}
      {scriptCard&&<ScriptViewer card={scriptCard} businessProfile={businessProfile} onSave={s=>{onSaveScript(scriptCard.id,s);setScriptCard(null);}} onRewrite={()=>{setAiCard(scriptCard);setScriptCard(null);}} onClose={()=>setScriptCard(null)}/>}
      {shootCard&&<ShootDirector card={shootCard} businessProfile={businessProfile} onSaveShotList={sl=>{onSaveShotList(shootCard.id,sl);setShootCard(null);}} onClose={()=>setShootCard(null)}/>}
      {shootViewCard&&<ShotListViewer card={shootViewCard} businessProfile={businessProfile} onSave={sl=>{onSaveShotList(shootViewCard.id,sl);setShootViewCard(null);}} onReplan={()=>{setShootCard(shootViewCard);setShootViewCard(null);}} onClose={()=>setShootViewCard(null)}/>}
      {aiCard&&(()=>{
        const wm=videos.filter(v=>v.metricsAdded&&v.views>0);
        const grp=(vs,key)=>{const m={};vs.forEach(v=>{if(!v[key])return;if(!m[v[key]])m[v[key]]={n:0,s:0};m[v[key]].n++;m[v[key]].s+=v.views;});return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n)})).sort((a,b)=>b.avg-a.avg);};
        const analytics={topHook:grp(wm,"hook")[0]?.name,topFormat:grp(wm,"format")[0]?.name};
        return <AIScriptChat card={aiCard} businessProfile={businessProfile} analytics={analytics} onSaveScript={s=>{onSaveScript(aiCard.id,s);setAiCard(null);}} onClose={()=>setAiCard(null)}/>;
      })()}
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
        <div><div style={{fontSize:20,fontWeight:800,color:C.text}}>🎬 Video Hub</div><div style={{fontSize:12,color:C.muted,marginTop:3}}>{pub.length} published videos</div></div>
        <input value={q} onChange={x=>setQ(x.target.value)} placeholder="🔍 Search..." style={{...inp,width:180,fontSize:12,padding:"7px 11px"}}/>
      </div>
      {pub.length===0?<div>
        <div style={{background:"#EFF6FF",border:`1px solid ${C.accent}22`,borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:22}}>💡</span>
          <div><div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:2}}>Your video library lives here</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Once you publish a video and add metrics after 7 days, every video appears here as a card — with views, engagement, and a direct link to watch it.</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:13}}>
          {[1,2,3].map(i=>(
            <div key={i} style={{background:C.surface,borderRadius:11,border:`1px solid ${C.border}`,boxShadow:sh,overflow:"hidden",opacity:.35}}>
              <div style={{padding:"12px 14px 9px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={{height:10,width:80,background:C.border,borderRadius:20}}/><div style={{height:10,width:50,background:C.border,borderRadius:20}}/></div>
                <div style={{height:13,width:"90%",background:C.border,borderRadius:6,marginBottom:5}}/>
                <div style={{height:10,width:"60%",background:C.light,borderRadius:6}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"9px 14px",gap:5}}>
                {[1,2,3].map(j=><div key={j} style={{background:C.light,borderRadius:6,padding:10}}><div style={{height:14,background:C.border,borderRadius:4,marginBottom:4}}/><div style={{height:8,background:C.light,borderRadius:4}}/></div>)}
              </div>
              <div style={{padding:"7px 14px 11px",display:"flex",justifyContent:"space-between"}}><div style={{height:10,width:24,background:C.light,borderRadius:4}}/><div style={{height:24,width:80,background:C.light,borderRadius:20}}/></div>
            </div>
          ))}
        </div>
      </div>
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
function SkeletonBar({w="60%"}){
  return <div style={{height:10,borderRadius:20,background:"linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",backgroundSize:"200% 100%",width:w,marginBottom:6}}/>;
}
function SkeletonCard({children,title}){
  return(
    <Card style={{opacity:.55}}>
      <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase"}}>{title}</div>
      {children}
    </Card>
  );
}

function CreatorAnalytics({videos}){
  const wm=videos.filter(v=>v.metricsAdded&&v.views>0);
  const hasData=wm.length>0;

  // Computed metrics
  const tv=wm.reduce((s,v)=>s+v.views,0);
  const ae=wm.length?(wm.reduce((s,v)=>s+(v.views>0?(v.likes+v.comments+v.shares+v.saves)/v.views:0),0)/wm.length*100).toFixed(1)+"%":"—";
  const wa=wm.filter(v=>v.paraTi!=null);
  const aa=wa.length?Math.round(wa.reduce((s,v)=>s+v.paraTi,0)/wa.length)+"%":"—";

  const grp=(vs,key)=>{const m={};vs.forEach(v=>{if(!v[key])return;if(!m[v[key]])m[v[key]]={n:0,s:0};m[v[key]].n++;m[v[key]].s+=v.views;});return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n),n:d.n})).sort((a,b)=>b.avg-a.avg);};
  const hd=grp(wm,"hook");
  const fd=grp(wm,"format");

  // Platform breakdown
  const pd=(()=>{const m={};wm.forEach(v=>{if(!m[v.platform])m[v.platform]={views:0,n:0};m[v.platform].views+=v.views;m[v.platform].n++;});return Object.entries(m).map(([k,d])=>({name:k,views:d.views,n:d.n})).sort((a,b)=>b.views-a.views);})();

  // Best day to post
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dd=(()=>{const m={};wm.forEach(v=>{if(!v.publishDate)return;const d=days[new Date(v.publishDate).getDay()];if(!m[d])m[d]={n:0,s:0};m[d].n++;m[d].s+=v.views;});return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n),n:d.n})).sort((a,b)=>b.avg-a.avg);})();

  // Best vs worst
  const sorted=[...wm].sort((a,b)=>b.views-a.views);
  const best=sorted[0];const worst=sorted[sorted.length-1];

  const ch=(data,title,color,height=160)=>(
    <Card>
      <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase"}}>{title}</div>
      {data.length===0?<div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:12}}>No data yet</div>:
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data.slice(0,6)} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}>
          <XAxis type="number" hide/><YAxis type="category" dataKey="name" width={92} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg views"]}/>
          <Bar dataKey="avg" radius={4}>{data.slice(0,6).map((_,i)=><Cell key={i} fill={i===0?color:i===1?color+"BB":"#CBD5E1"}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>}
    </Card>
  );

  return(
    <div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:800,color:C.text}}>🧠 Analytics</div>
        <div style={{fontSize:12,color:C.muted,marginTop:3}}>{hasData?`${wm.length} videos analyzed`:"Add metrics to your first published video to unlock insights"}</div>
      </div>

      {/* KPI row — ghost if no data */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
        {[
          [hasData?fmt(tv):"—","👁 Total views",C.gold],
          [hasData?wm.length:"—","🎬 Videos tracked",C.accent],
          [hasData?ae:"—","💹 Avg engagement",C.green],
          [hasData?aa:"—","🚀 Algorithmic reach",C.accent],
        ].map(([v,l,c])=>(
          <div key={l} style={{background:C.surface,borderRadius:10,padding:14,border:`1px solid ${C.border}`,boxShadow:sh,opacity:hasData?1:.5}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:5}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,color:hasData?c:C.border}}>{v}</div>
            {!hasData&&<SkeletonBar w="70%"/>}
          </div>
        ))}
      </div>

      {!hasData&&(
        <div style={{background:"#EFF6FF",border:`1px solid ${C.accent}22`,borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:22}}>💡</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:2}}>Your analytics will live here</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Once you publish a video and add metrics after 7 days, this dashboard fills up automatically — showing you which hooks, formats, platforms, and days are driving your growth.</div>
          </div>
        </div>
      )}

      {/* Hook + Format charts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {hasData?ch(hd,"🪝 Avg views by hook",C.gold):
          <SkeletonCard title="🪝 Avg views by hook">
            {["80%","60%","45%","30%","20%"].map((w,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><SkeletonBar w="55px"/><SkeletonBar w={w}/></div>)}
          </SkeletonCard>
        }
        {hasData?ch(fd,"🎬 Avg views by format",C.accent):
          <SkeletonCard title="🎬 Avg views by format">
            {["70%","55%","40%","25%"].map((w,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><SkeletonBar w="55px"/><SkeletonBar w={w}/></div>)}
          </SkeletonCard>
        }
      </div>

      {/* Platform breakdown + Best day */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {hasData?ch(pd,"📱 Views by platform",C.gold,120):
          <SkeletonCard title="📱 Views by platform">
            {["75%","45%","25%"].map((w,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><SkeletonBar w="55px"/><SkeletonBar w={w}/></div>)}
          </SkeletonCard>
        }
        {hasData?ch(dd,"📅 Best day to post",C.green,120):
          <SkeletonCard title="📅 Best day to post">
            {["65%","80%","45%","70%","55%"].map((w,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><SkeletonBar w="30px"/><SkeletonBar w={w}/></div>)}
          </SkeletonCard>
        }
      </div>

      {/* Algorithmic reach breakdown */}
      {hasData&&wa.length>0&&(()=>{
        const avgS=Math.round(wa.reduce((s,v)=>s+(v.siguiendo||0),0)/wa.length);
        const avgB=Math.round(wa.reduce((s,v)=>s+(v.busqueda||0),0)/wa.length);
        const avgA=Math.round(wa.reduce((s,v)=>s+v.paraTi,0)/wa.length);
        return(
          <Card style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase"}}>📡 Traffic sources</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[[avgA+"%","🚀 Algorithmic",C.accent,"TikTok: For You · IG: Explore · YT: Suggested"],[avgS+"%","👥 Followers",C.gold,"TikTok: Following · IG: Home · YT: Browse"],[avgB+"%","🔍 Search",C.green,"All platforms: Search results"]].map(([v,l,c,sub])=>(
                <div key={l} style={{background:C.light,borderRadius:10,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:c,marginBottom:3}}>{v}</div>
                  <div style={{fontSize:11,fontWeight:600,color:C.text}}>{l}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:3,lineHeight:1.4}}>{sub}</div>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

      {/* Best vs Worst */}
      {hasData&&best&&worst&&best.id!==worst.id&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          {[[best,"🏆 Your best video",C.green,"#DCFCE7"],[worst,"⚠️ Your lowest",C.red,"#FEE2E2"]].map(([v,label,color,bg])=>(
            <Card key={v.id} style={{borderTop:`3px solid ${color}`}}>
              <div style={{fontSize:10,fontWeight:700,color:color,letterSpacing:1,marginBottom:10,textTransform:"uppercase"}}>{label}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6,lineHeight:1.3}}>{v.title}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                {[[fmt(v.views),"Views"],[engRate(v),"Engagement"]].map(([val,lbl])=>(
                  <div key={lbl} style={{background:bg,borderRadius:7,padding:"7px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:color}}>{val}</div><div style={{fontSize:9,color:C.muted}}>{lbl}</div></div>
                ))}
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {v.hook&&<span style={{fontSize:10,background:C.light,padding:"2px 7px",borderRadius:20,color:C.muted}}>{v.hook}</span>}
                {v.format&&<span style={{fontSize:10,background:C.light,padding:"2px 7px",borderRadius:20,color:C.muted}}>{v.format}</span>}
                {v.platform&&<span style={{fontSize:10,background:C.light,padding:"2px 7px",borderRadius:20,color:C.muted}}>{v.platform}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Top videos */}
      {hasData&&(
        <Card>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase"}}>🏆 All videos ranked</div>
          {sorted.map((v,i)=>(
            <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:13,minWidth:22}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{v.title}</div>
                  <div style={{fontSize:10,color:C.muted}}>{v.platform} · {v.publishDate}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:800,color:C.gold}}>{fmt(v.views)}</div>
                <div style={{fontSize:10,color:C.muted}}>{engRate(v)} eng</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {!hasData&&(
        <SkeletonCard title="🏆 All videos ranked">
          {[1,2,3].map(i=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}><SkeletonBar w="22px"/><div><SkeletonBar w="140px"/><SkeletonBar w="80px"/></div></div>
              <SkeletonBar w="50px"/>
            </div>
          ))}
        </SkeletonCard>
      )}
    </div>
  );
}


// ── BUSINESS PROFILE SETUP ────────────────────────────────────────────────────
const BP_QUESTIONS = [
  {
    key: "businessName",
    label: "What's your business called?",
    hint: "The name you go by publicly",
    placeholder: "Iron Forge CrossFit — Austin, TX",
    type: "text",
  },
  {
    key: "whatYouDo",
    label: "Describe what your business does in one sentence",
    hint: "Be specific — this shapes every script the AI writes",
    placeholder: "A CrossFit gym in Austin, TX helping competitive athletes reach their peak",
    type: "text",
  },
  {
    key: "audience",
    label: "Who are you talking to?",
    hint: "Your ideal customer or follower",
    placeholder: "25–40 year olds interested in fitness who have never tried CrossFit",
    type: "text",
  },
  {
    key: "goal",
    label: "What's your main goal with content?",
    hint: "What do you want people to do after watching?",
    placeholder: "Get people to book a free trial class at our gym",
    type: "text",
  },
  {
    key: "tone",
    label: "How does your brand sound?",
    hint: "This keeps the AI consistent with your voice",
    placeholder: "Real, educational, and community-focused — never salesy",
    type: "text",
  },
];

function BusinessProfileSetup({onComplete,existing}){
  const[step,setStep]=useState(-1); // -1 = intro screen
  const[vals,setVals]=useState({
    businessName:existing?.businessName||"",
    whatYouDo:existing?.whatYouDo||"",
    audience:existing?.audience||"",
    goal:existing?.goal||"",
    tone:existing?.tone||"",
  });
  const q=BP_QUESTIONS[step];
  const isLast=step===BP_QUESTIONS.length-1;
  const canNext=vals[q?.key]?.trim().length>0;

  const next=()=>{
    if(isLast){onComplete(vals);return;}
    setStep(s=>s+1);
  };

  // Intro screen
  if(step===-1) return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(480px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"40px 36px",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:16}}>🏢</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:10,lineHeight:1.2}}>Welcome to ContentHub Sidekick</div>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:16,maxWidth:380,margin:"0 auto 16px"}}>
          This is your <strong style={{color:C.text}}>content command center.</strong> You film and edit your videos with your own tools — ContentHub helps you organize ideas, write scripts with AI, plan shoots, and track what's working month by month.
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
          {["📋 Organize ideas","✨ Script with AI","🎥 Plan shoots","📊 Track results"].map(t=>(
            <span key={t} style={{fontSize:11,color:C.accent,background:C.accent+"12",padding:"4px 10px",borderRadius:20,border:`1px solid ${C.accent}22`}}>{t}</span>
          ))}
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:16}}>First, tell us about your brand so the AI knows your voice.</div>
        <br/>
        <button
          onClick={()=>setStep(0)}
          style={{padding:"13px 32px",background:C.text,color:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",letterSpacing:-0.2}}
        >
          Let's set it up →
        </button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(480px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"36px 32px"}}>
        {/* Progress dots */}
        <div style={{display:"flex",gap:6,marginBottom:32}}>
          {BP_QUESTIONS.map((_,i)=>(
            <div key={i} style={{height:4,borderRadius:20,flex:i===step?3:1,background:i<=step?C.accent:C.border,transition:"all .3s"}}/>
          ))}
        </div>
        {/* Step number */}
        <div style={{fontSize:11,fontWeight:600,color:C.accent,letterSpacing:0.5,marginBottom:8}}>
          {step+1} of {BP_QUESTIONS.length}
        </div>
        {/* Question */}
        <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:6,letterSpacing:-0.3,lineHeight:1.3}}>
          {q.label}
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:24,lineHeight:1.5}}>
          {q.hint}
        </div>
        {/* Input */}
        <input
          key={q.key}
          autoFocus
          type="text"
          value={vals[q.key]}
          onChange={e=>setVals(p=>({...p,[q.key]:e.target.value}))}
          onKeyDown={e=>e.key==="Enter"&&canNext&&next()}
          placeholder={q.placeholder}
          style={{...inp,fontSize:14,padding:"12px 14px",marginBottom:24}}
        />
        {/* Actions */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {step>0
            ?<button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0}}>← Back</button>
            :<div/>
          }
          <button
            onClick={next}
            disabled={!canNext}
            style={{padding:"10px 24px",background:canNext?C.text:C.border,color:canNext?"#FFF":C.muted,border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:canNext?"pointer":"not-allowed",transition:"all .15s"}}
          >
            {isLast?"Let's go →":"Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BusinessProfileModal({profile,onSave,onClose}){
  const[vals,setVals]=useState({
    businessName:profile?.businessName||"",
    whatYouDo:profile?.whatYouDo||"",
    audience:profile?.audience||"",
    goal:profile?.goal||"",
    tone:profile?.tone||"",
  });
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
      <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(500px,95vw)",padding:"28px 28px 24px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:C.text}}>Business profile</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>The AI uses this for every script it writes</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        {BP_QUESTIONS.map(q=>(
          <div key={q.key} style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:4}}>{q.label}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{q.hint}</div>
            <input
              type="text"
              value={vals[q.key]}
              onChange={e=>setVals(p=>({...p,[q.key]:e.target.value}))}
              placeholder={q.placeholder}
              style={inp}
            />
          </div>
        ))}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn onClick={()=>onSave(vals)} primary>Save profile ✓</Btn>
        </div>
      </div>
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
  const[businessProfile,setBusinessProfile]=useState(null);
  const[showProfileModal,setShowProfileModal]=useState(false);
  const[tourStep,setTourStep]=useState(0); // 0=off, 1-6=bubble showing, -1=action in progress
  const[tourNext,setTourNext]=useState(null); // step to show after current action completes
  const[showGoalModal,setShowGoalModal]=useState(false);
  const[showAddFromTour,setShowAddFromTour]=useState(false);
  const refGoal=useRef(null);
  const refAdd=useRef(null);
  const refStages=useRef(null);
  const refPublished=useRef(null);
  const refLock=useRef(null);

  const load=useCallback(async()=>{
    const[vs,gs,prof]=await Promise.all([
      sbGet("creator_videos",`&user_id=eq.${user.id}&order=created_at.desc`),
      sbGet("creator_goals",`&user_id=eq.${user.id}`),
      sbGetOne("profiles","id",user.id),
    ]);
    if(prof?.business_profile){
      setBusinessProfile(prof.business_profile);
    }
    setVideos((vs||[]).map(r=>({id:r.id,userId:r.user_id,title:r.title,platform:r.platform,stage:r.stage,targetDate:r.target_date,publishDate:r.publish_date,url:r.url||"",hook:r.hook||"",format:r.format||"",cta:r.cta||"",views:r.views||0,likes:r.likes||0,comments:r.comments||0,shares:r.shares||0,saves:r.saves||0,paraTi:r.para_ti,siguiendo:r.siguiendo,busqueda:r.busqueda,pauta:r.pauta||0,metricsAdded:r.metrics_added||false,month:r.month,createdAt:r.created_at,script:r.script||"",shotList:r.shot_list||""})));
    const gm={};(gs||[]).forEach(g=>{gm[g.month]=g.goal;});setGoals(gm);
    setLoading(false);
  },[user.id]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{const p=setInterval(load,60000);return()=>clearInterval(p);},[load]);

  // One-time tour check — only runs if business profile is already done
  useEffect(()=>{
    const tourDone=localStorage.getItem(`sk_tour_done_${user.id}`);
    const bpDone=localStorage.getItem(`sk_bp_done_${user.id}`);
    if(!tourDone && bpDone){
      setTimeout(()=>setTourStep(1), 900);
    }
  },[user.id]); // eslint-disable-line

  const addV=useCallback(async v=>{
    const newVid={id:v.id,userId:user.id,title:v.title,platform:v.platform||"TikTok",stage:"idea",targetDate:v.targetDate||null,publishDate:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,paraTi:null,siguiendo:null,busqueda:null,pauta:0,metricsAdded:false,month:v.month||curMonth(),createdAt:new Date().toISOString()};
    setVideos(prev=>[newVid,...prev]);
    const dbRow={id:v.id,user_id:user.id,title:v.title,platform:v.platform||"TikTok",stage:"idea",target_date:v.targetDate||null,publish_date:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,para_ti:null,siguiendo:null,busqueda:null,pauta:0,metrics_added:false,month:v.month||curMonth(),created_at:new Date().toISOString()};
    const ok=await sbInsert("creator_videos",dbRow);
    if(!ok){
      console.warn("Insert failed, trying upsert...");
      await sbUpsert("creator_videos",dbRow,"id");
    }
    await load();
  },[user.id,load]);
  const moveV=useCallback(async(id,st,pubDate)=>{
    const pd=pubDate||(st==="published"?new Date().toISOString().slice(0,10):undefined);
    setVideos(prev=>prev.map(v=>v.id===id?{...v,stage:st,publishDate:pd||v.publishDate}:v));
    const up={stage:st};
    if(st==="published"&&pd)up.publish_date=pd;
    await sbUpdate("creator_videos","id",id,up);
    load();
  },[load]);
  const saveShotList=useCallback(async(id,shotList)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,shotList}:v));
    await sbUpdate("creator_videos","id",id,{shot_list:shotList});
  },[]);

  const saveScript=useCallback(async(id,script)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,script}:v));
    await sbUpdate("creator_videos","id",id,{script});
  },[]);

  const saveM=useCallback(async(id,m)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,url:m.url||"",hook:m.hook||"",format:m.format||"",cta:m.cta||"",views:m.views||0,likes:m.likes||0,comments:m.comments||0,shares:m.shares||0,saves:m.saves||0,paraTi:m.paraTi||null,siguiendo:m.siguiendo||null,busqueda:m.busqueda||null,metricsAdded:true}:v));
    await sbUpdate("creator_videos","id",id,{url:m.url||"",hook:m.hook||"",format:m.format||"",cta:m.cta||"",views:m.views||0,likes:m.likes||0,comments:m.comments||0,shares:m.shares||0,saves:m.saves||0,para_ti:m.paraTi||null,siguiendo:m.siguiendo||null,busqueda:m.busqueda||null,pauta:0,metrics_added:true});
    load();
  },[load]);
  const delV=useCallback(async id=>{
    setVideos(prev=>prev.filter(v=>v.id!==id));
    await sbDelete("creator_videos","id",id);
    load();
  },[load]);
  const setGoal=useCallback(async(m,g)=>{
    setGoals(p=>({...p,[m]:g}));
    await sbUpsert("creator_goals",{user_id:user.id,month:m,goal:g},"user_id,month");
    await load();
  },[user.id,load]);

  if(loading)return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:C.text}}>ContentHub Sidekick</div><div style={{fontSize:12,color:C.muted,marginTop:5}}>Loading...</div></div></div>);

  const finishTour=()=>{localStorage.setItem(`sk_tour_done_${user.id}`,"1");setTourStep(0);setTourNext(null);};

  const saveBusinessProfile=async(bp)=>{
    setBusinessProfile(bp);
    setNeedsProfile(false);
    localStorage.setItem(`sk_bp_done_${user.id}`,"1");
    await sbUpdate("profiles","id",user.id,{business_profile:bp});
    // Start tour after profile if new user
    const isNew = !localStorage.getItem(`sk_tour_done_${user.id}`);
    if(isNew) setTimeout(()=>setTourStep(1), 600);
  };
  const showStep=(n)=>{if(n>6)finishTour();else setTourStep(n);};
  // Tour action handlers — hide overlay, open action, then advance on completion
  const tourAction1=()=>{setTourStep(-1);setTourNext(2);setShowGoalModal(true);}; // step1: open goal modal
  const tourAction2=()=>{setTourStep(-1);setTourNext(3);setShowAddFromTour(true);}; // step2: open add video
  const tourAction3=()=>showStep(4); // step3: just advance
  const tourAction4=()=>showStep(5); // step4: just advance
  const tourAction5=()=>showStep(6); // step5: just advance
  const tourAction6=()=>finishTour(); // step6: done

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      {showProfileModal&&<BusinessProfileModal profile={businessProfile} onSave={async(bp)=>{await saveBusinessProfile(bp);setShowProfileModal(false);}} onClose={()=>setShowProfileModal(false)}/>}
      {tourStep===1&&<TourBubble step={1} total={6} emoji="🎯" title="Set your monthly goal" body="Before anything — decide how many videos you want to publish this month. This becomes your north star and fills your pipeline with video slots." action="Set my goal →" onAction={tourAction1} onSkip={finishTour} targetRef={refGoal} side="bottom"/>}
      {tourStep===2&&<TourBubble step={2} total={6} emoji="➕" title="Add your first video idea" body="Think of a video you want to make this week for your brand. It doesn't have to be perfect — just give it a working title like 'Behind the scenes at the office' or 'How we make our product'. Click the button and add it now." action="Add a video →" onAction={tourAction2} onSkip={finishTour} targetRef={refAdd} side="bottom"/>}
      {tourStep===3&&<TourBubble step={3} total={6} emoji="🚀" title="Move through the stages" body="As you work on your video, drag the card forward — Idea to Production to Editing to Published. Each move tracks your real progress." action="Got it →" onAction={tourAction3} onSkip={finishTour} targetRef={refStages} side="top"/>}
      {tourStep===4&&<TourBubble step={4} total={6} emoji="📱" title="Publish it on social media" body="When your video is live on TikTok or Instagram, drag the card to Published. The app does not post for you — you publish it yourself, then mark it done here." action="Makes sense →" onAction={tourAction4} onSkip={finishTour} targetRef={refPublished} side="top"/>}
      {tourStep===5&&<TourBubble step={5} total={6} emoji="🔒" title="Wait 7 days" body="Your published video locks for 7 days. Why? Views and engagement keep growing all week. The data you capture on day 7 is way more accurate than day 1." action="Got it →" onAction={tourAction5} onSkip={finishTour} targetRef={refLock} side="left"/>}
      {tourStep===6&&<TourBubble step={6} total={6} emoji="📊" title="Come back and add your metrics" body="After 7 days, come back and tap Add metrics. Fill in your views, engagement, and traffic sources. This is where the app gets smart — it tells you exactly what hooks and formats are working for you." action="Let's go! 🚀" onAction={tourAction6} onSkip={finishTour} targetRef={refLock} side="left"/>}
      {showGoalModal&&<GoalModal month={month} current={goals[month]||0} onSave={async v=>{await setGoal(month,v);setShowGoalModal(false);if(tourNext!==null){showStep(tourNext);setTourNext(null);}}} onClose={()=>setShowGoalModal(false)}/>}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:sh}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:15,fontWeight:900,color:C.text,letterSpacing:-0.3}}>ContentHub <span style={{color:C.accent,fontWeight:400,fontSize:12}}>Sidekick</span></div>
          <span style={{background:C.accent+"18",color:C.accent,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20}}>Business</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          {[["dashboard","Dashboard"],["analytics","Analytics"],["videohub","Video Hub"]].map(([id,label])=>(
            <button key={id} onClick={()=>setPage(id)} style={{padding:"5px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:page===id?600:400,color:page===id?C.text:C.muted,background:page===id?C.light:"transparent",borderRadius:7}}>{label}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:11,color:C.muted}}>{profile?.name||user.email}</span>
<button onClick={onLogout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}}>Sign out</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {page==="dashboard"&&<CreatorDashboard videos={videos} goals={goals} month={month} onMonthChange={setMonth} onSetGoal={setGoal} onAddVideo={(v)=>{addV(v);if(tourNext!==null){showStep(tourNext);setTourNext(null);}}} onMoveVideo={(id,st,pd)=>{moveV(id,st,pd);if(tourStep===4&&st==="published")showStep(5);}} onMetrics={saveM} onDeleteVideo={delV} userId={user.id} refGoal={refGoal} refAdd={refAdd} refStages={refStages} refPublished={refPublished} refLock={refLock} tourStep={tourStep} showAddFromTour={showAddFromTour} onAddFromTourDone={()=>{setShowAddFromTour(false);}} onTourNext={()=>{if(tourNext!==null){showStep(tourNext);setTourNext(null);}}} businessProfile={businessProfile} onSaveScript={saveScript} onSaveShotList={saveShotList}/>}
        {page==="videohub"&&<CreatorVideos videos={videos} onDelete={delV}/>}
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
