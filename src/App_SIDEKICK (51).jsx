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
const C={bg:"#FFFFFF",surface:"#FFFFFF",border:"#E8E8E8",text:"#111111",muted:"#555555",light:"#FAFAFA",accent:"#378ADD",gold:"#C89A00",green:"#1D9E75",red:"#E24B4A",amber:"#F59E0B",yellow:"#F0C040",purple:"#7F77DD"};
const BRAND={red:"#E24B4A",yellow:"#F0C040",blue:"#378ADD",green:"#1D9E75"};
const Logo=()=>(
  <div style={{display:"flex",alignItems:"flex-end",gap:3}}>
    <div style={{width:11,height:17,borderRadius:3,background:BRAND.red}}/>
    <div style={{width:8,height:11,borderRadius:3,background:BRAND.yellow,marginBottom:2}}/>
    <div style={{width:13,height:8,borderRadius:3,background:BRAND.blue,marginBottom:4}}/>
    <div style={{width:7,height:14,borderRadius:3,background:BRAND.green,marginBottom:1}}/>
  </div>
);
const sh="0 1px 3px rgba(0,0,0,.08)";
const shMd="0 4px 12px rgba(0,0,0,.1)";
const inp={width:"100%",background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"};
const Card=({children,pad=18,style={}})=><div style={{background:C.surface,borderRadius:12,padding:pad,border:`1px solid ${C.border}`,boxShadow:sh,...style}}>{children}</div>;
const Btn=({children,primary,onClick,small,disabled,style={}})=><button onClick={onClick} disabled={disabled} style={{padding:small?"6px 12px":"9px 18px",background:primary?C.text:C.surface,color:primary?"#FFF":C.text,border:`1px solid ${primary?C.text:C.border}`,borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontSize:small?12:13,fontWeight:600,opacity:disabled?.5:1,...style}}>{children}</button>;
const Tag=({c,color=C.gold})=><span style={{display:"inline-block",padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:600,background:color+"18",color,border:`1px solid ${color}30`,marginRight:3}}>{c}</span>;

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function Landing({onPath}){
  return(
    <div style={{minHeight:"100vh",background:"#FFFFFF",fontFamily:"system-ui,sans-serif"}}>
      {/* Nav */}
      <div style={{padding:"0 32px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid #E8E8E8"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <Logo/>
          <div style={{fontSize:14,fontWeight:500,color:"#111",letterSpacing:-0.2}}>ContentHub <span style={{fontWeight:400,color:"#888"}}>Sidekick</span></div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span onClick={()=>onPath("login")} style={{fontSize:12,color:"#555",cursor:"pointer"}}>Sign in</span>
          <button onClick={()=>onPath("creator")} style={{fontSize:12,padding:"5px 16px",borderRadius:6,border:"1px solid #DDD",background:"none",color:"#111",cursor:"pointer"}}>Start free trial</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{padding:"80px 32px 60px",textAlign:"center",maxWidth:700,margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:11,padding:"5px 14px",borderRadius:20,border:"0.5px solid #E8E8E8",color:"#555",marginBottom:28,background:"#FAFAFA"}}>
          <div style={{display:"flex",gap:4}}>
            {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:c}}/>)}
          </div>
          
        </div>

        <div style={{fontSize:40,fontWeight:500,lineHeight:1.18,letterSpacing:-1,color:"#111",marginBottom:16}}>
          Built for the people who make<br/>
          content{" "}
          <span style={{color:BRAND.red}}>worth</span>{" "}
          <span style={{color:BRAND.blue}}>watch</span>
          <span style={{color:BRAND.green}}>ing.</span>
        </div>

        <div style={{fontSize:15,color:"#555",lineHeight:1.7,maxWidth:480,margin:"0 auto 32px"}}>
          Plan campaigns, organize your pipeline, and track what actually resonates — so you can focus on making content that no AI could ever make.
        </div>

        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:12}}>
          <button onClick={()=>onPath("creator")} style={{padding:"12px 28px",background:"#111",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:500,cursor:"pointer"}}>Start free trial →</button>
          <button style={{padding:"12px 20px",background:"none",color:"#111",border:"1px solid #DDD",borderRadius:8,fontSize:14,cursor:"pointer"}}>See how it works</button>
        </div>
        <div style={{fontSize:11,color:"#AAA"}}>Not an AI video generator. A creative operating system built for humans.</div>

        {/* Steps */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,maxWidth:580,margin:"44px auto 0",border:"0.5px solid #E8E8E8",borderRadius:10,overflow:"hidden"}}>
          {[[BRAND.red,"01","Plan","Campaigns and pipeline organized in one place"],[BRAND.blue,"02","Create","AI surfaces data, you bring the creative direction"],[BRAND.green,"03","Learn","Analytics that tell you what your audience wants"]].map(([color,n,t,d])=>(
            <div key={n} style={{padding:"16px 18px",borderRight:"0.5px solid #E8E8E8",background:"white"}}>
              <div style={{width:"100%",height:3,borderRadius:2,background:color,marginBottom:12}}/>
              <div style={{fontSize:10,color:"#AAA",marginBottom:3,fontWeight:500}}>{n}</div>
              <div style={{fontSize:13,fontWeight:500,color:"#111"}}>{t}</div>
              <div style={{fontSize:11,color:"#777",marginTop:3,lineHeight:1.45}}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Manifesto */}
      <div style={{maxWidth:640,margin:"0 auto",padding:"0 32px 48px"}}>
        <div style={{padding:"28px 32px",borderRadius:12,background:"#FAFAFA",border:"0.5px solid #E8E8E8"}}>
          <p style={{fontSize:15,color:"#111",lineHeight:1.7,maxWidth:500,fontWeight:500}}>
            The feed is full of generated content.<br/>Yours doesn't have to be.
          </p>
          <p style={{fontSize:13,color:"#777",lineHeight:1.7,maxWidth:480,marginTop:10}}>
            AI does what AI is good at. You do what only you can.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 32px 56px"}}>
        <div style={{textAlign:"center",fontSize:11,color:"#AAA",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:20,fontWeight:500}}>Choose your plan</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[
            {path:"creator",gradient:`${BRAND.red},${BRAND.yellow}`,priceBg:"#FEF2F2",priceColor:"#991B1B",price:"From $29/mo",iconBg:"#FEF2F2",icon:"🏢",title:"Business",desc:"For companies and in-house marketers making content for their own brand.",features:["One brand, one pipeline","Campaign creator with AI research","Script, shoot plan, and edit advice","Hook and format analytics","Multi-platform tracking"],ctaBg:"#111",ctaColor:"white"},
            {path:"agency",gradient:`${BRAND.blue},${BRAND.green}`,priceBg:"#EFF6FF",priceColor:"#1E40AF",price:"Pro — from $79/mo",iconBg:"#EFF6FF",icon:"🏛️",title:"Agency",desc:"For content teams managing multiple clients and brands.",features:["Unlimited clients","Team roles and permissions","Per-client pipeline and analytics","Ready for Review with comments","Agency-wide progress dashboard"],ctaBg:BRAND.blue,ctaColor:"white"},
          ].map(card=>(
            <div key={card.path} style={{background:"white",border:"0.5px solid #E8E8E8",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div style={{height:3,background:`linear-gradient(90deg,${card.gradient})`}}/>
              <div style={{padding:24,display:"flex",flexDirection:"column",flex:1}}>
                <div style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,background:card.priceBg,color:card.priceColor,marginBottom:14,display:"inline-block",width:"fit-content"}}>{card.price}</div>
                <div style={{width:40,height:40,borderRadius:10,background:card.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:12}}>{card.icon}</div>
                <div style={{fontSize:17,fontWeight:500,color:"#111",marginBottom:5}}>{card.title}</div>
                <div style={{fontSize:12,color:"#666",lineHeight:1.55,marginBottom:16}}>{card.desc}</div>
                <div style={{display:"flex",flexDirection:"column",gap:7,flex:1,marginBottom:20}}>
                  {card.features.map(f=><div key={f} style={{display:"flex",gap:7,alignItems:"flex-start",fontSize:12,color:"#555"}}><span style={{color:BRAND.green,flexShrink:0,fontWeight:700}}>✓</span>{f}</div>)}
                </div>
                <button onClick={()=>onPath(card.path)} style={{display:"block",width:"100%",padding:"10px 0",background:card.ctaBg,color:card.ctaColor,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",marginTop:"auto"}}>
                  Start 14-day free trial
                </button>
                <div style={{textAlign:"center",fontSize:11,color:"#AAA",marginTop:10,cursor:"pointer"}}>▶ Watch a 90-second walkthrough</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ── AUTH SCREEN ───// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({path,onLogin,onBack}){
  const[mode,setMode]=useState(path==="login"?"login":"signup");
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const[pendingUser,setPendingUser]=useState(null); // set after signup to show BP setup
  const go=async()=>{
    if(!email||!pass||(mode==="signup"&&path!=="agency"&&!name)){setErr("Please fill in all fields");return;}
    setLoading(true);setErr("");
    if(mode==="signup"){
      const{user,error}=await sbSignUp(email,pass);
      if(error||!user){setErr("Could not create account.");setLoading(false);return;}
      const{user:u2,error:e2}=await sbSignIn(email,pass);
      if(e2||!u2){setErr("Account created — please sign in.");setMode("login");setLoading(false);return;}
      await sbInsert("profiles",{id:u2.id,name:path==="agency"?email:name,email,account_type:path});
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
    // Agency skips business profile setup — goes straight to login
    if(pendingUser.profile?.account_type==="agency"){
      onLogin(pendingUser.user,pendingUser.profile);
      return null;
    }
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



// ── AGENCY DB HELPERS ─────────────────────────────────────────────────────────
const getNotes = async (workspaceId, videoId) => {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/agency_card_notes?workspace_id=eq.${workspaceId}&video_id=eq.${encodeURIComponent(videoId)}&order=created_at.asc&select=*`, {headers:_h()});
    return r.ok ? await r.json() : [];
  } catch(e) { return []; }
};

const STAGES=[
  {id:"idea",      label:"Idea",       color:BRAND.red},
  {id:"production",label:"Production", color:BRAND.yellow},
  {id:"editing",   label:"Editing",    color:BRAND.blue},
  {id:"published", label:"Published",  color:BRAND.green},
];

const AGENCY_STAGES=[
  {id:"idea",      label:"Idea",             color:BRAND.red},
  {id:"production",label:"Production",        color:BRAND.yellow},
  {id:"editing",   label:"Editing",           color:BRAND.blue},
  {id:"review",    label:"Ready for Review",  color:"#F97316"},
  {id:"published", label:"Published",         color:BRAND.green},
];

const CHANNEL_DIRECTIONS={
  "TikTok":[
    {label:"Unfiltered confession",       desc:"Share something real before it's polished — audience feels trusted.",         field:"hook"},
    {label:"The thing nobody says",       desc:"Name the uncomfortable truth your audience already knows but hasn't heard.",   field:"hook"},
    {label:"Meaningful one-liner",        desc:"One sentence that lands before the edit. No setup needed.",                   field:"hook"},
    {label:"Story that earns its point",  desc:"Start in the middle. The lesson comes from living it, not explaining it.",    field:"body"},
    {label:"Honest behind-the-scenes",    desc:"Show the part that didn't work. That's what people actually want to see.",    field:"body"},
    {label:"Ask one real question",       desc:"Not 'comment below!' — an actual question you're genuinely curious about.",   field:"cta"},
  ],
  "Instagram Reels":[
    {label:"Impactful talk to camera",    desc:"Direct, unhurried. Like telling one person something that matters.",           field:"hook"},
    {label:"Visual that stops the scroll",desc:"The first frame does the work before they hear a word.",                      field:"hook"},
    {label:"One truth, beautifully said", desc:"A single idea worth saving. People save what resonates, not what entertains.",field:"hook"},
    {label:"The moment worth sharing",    desc:"Specific enough to be real, universal enough to be sent to a friend.",        field:"body"},
    {label:"Aesthetic with a message",    desc:"How it looks and what it says should be the same thing.",                     field:"body"},
    {label:"Invite them in",              desc:"Give them a reason to follow that isn't 'more content'.",                     field:"cta"},
  ],
  "YouTube Shorts":[
    {label:"The 3-second promise",        desc:"Say in 3 seconds what the next 55 seconds will give them.",                  field:"hook"},
    {label:"The question worth answering",desc:"Something they've searched but never found a human answer to.",               field:"hook"},
    {label:"Earned insight",              desc:"Something you can only say because you've actually done it.",                  field:"body"},
    {label:"One clear next step",         desc:"Not a subscribe ask — what should they do with what they just learned?",      field:"cta"},
  ],
  "YouTube":[
    {label:"The promise that earns 10 min",desc:"What are they getting that they couldn't get in 60 seconds?",               field:"hook"},
    {label:"Expert who talks like a human",desc:"You know more than them. Don't sound like it.",                             field:"hook"},
    {label:"Story with a real ending",    desc:"Something that actually resolved — not a cliffhanger for engagement.",        field:"body"},
    {label:"Action from the content",     desc:"Not 'like and subscribe' — an action that comes from what they just learned.",field:"cta"},
  ],
  "LinkedIn":[
    {label:"Insight from the trenches",   desc:"Something you learned the hard way that no course teaches.",                  field:"hook"},
    {label:"The counterintuitive take",   desc:"The opposite of what everyone says — and why you believe it.",                field:"hook"},
    {label:"What experience actually teaches",desc:"Not theory. What happened when you tried it.",                           field:"body"},
    {label:"Start a real conversation",   desc:"Ask something you're genuinely uncertain about.",                             field:"cta"},
  ],
  "Facebook":[
    {label:"The relatable moment",        desc:"Something that makes someone stop and think: that's exactly me.",             field:"hook"},
    {label:"Story first, lesson second",  desc:"Let the story breathe before you extract the meaning.",                      field:"body"},
    {label:"Give them a reason to share", desc:"Because it's true, not because you asked.",                                  field:"cta"},
  ],
};


const addNote = async (workspaceId, videoId, userId, authorName, note) => {
  try {
    await fetch(`${SB_URL}/rest/v1/agency_card_notes`, {
      method:"POST",
      headers:_h({"Prefer":"return=minimal"}),
      body:JSON.stringify({workspace_id:workspaceId,video_id:videoId,user_id:userId,author_name:authorName,note,created_at:new Date().toISOString()})
    });
  } catch(e) { console.error("addNote",e); }
};
const createWorkspace = async (name, userId) => {
  const wsId = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
  await sbInsert("workspaces", {id:wsId, name, owner_id:userId, created_at:new Date().toISOString()});
  await sbInsert("workspace_members", {workspace_id:wsId, user_id:userId, role:"admin", created_at:new Date().toISOString()});
  await sbUpdate("profiles","id",userId,{workspace_id:wsId});
  return wsId;
};
const getWorkspaceMember = async (userId) => {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/workspace_members?user_id=eq.${userId}&select=*,workspaces(*)`,{headers:_h()});
    if(!r.ok)return null;
    const d = await r.json();
    return d[0]||null;
  } catch(e){return null;}
};


// ── AGENCY ONBOARDING ─────────────────────────────────────────────────────────
function AgencyOnboarding({user,onComplete}){
  const[step,setStep]=useState(0);
  const[wsName,setWsName]=useState("");
  const[loading,setLoading]=useState(false);

  const finish=async()=>{
    if(!wsName.trim())return;
    setLoading(true);
    const wsId=await createWorkspace(wsName.trim(),user.id);
    setLoading(false);
    onComplete(wsId);
  };

  if(step===0)return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(500px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"40px 36px",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:16}}>🏛️</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:10,lineHeight:1.2}}>Welcome to Sidekick Agency</div>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:24,maxWidth:380,margin:"0 auto 24px"}}>
          Manage content pipelines for all your clients in one place. Every client gets their own board, targets, and creative direction tailored to their brand.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32,textAlign:"left",background:C.light,borderRadius:12,padding:"16px 18px"}}>
          {[
            ["🗂️","One pipeline per client","Idea → Production → Editing → Review → Published"],
            ["📊","Big picture dashboard","Monthly targets and health across all clients"],
            ["✨","Tailored creative direction","Channel-specific guidance based on each client's brand and analytics"],
          ].map(([e,t,d])=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{e}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{t}</div>
                <div style={{fontSize:11,color:C.muted}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>setStep(1)} style={{padding:"13px 32px",background:C.text,color:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer"}}>
          Let's set it up →
        </button>
      </div>
    </div>
  );

  if(step===1)return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(460px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"36px 32px"}}>
        {/* Progress */}
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {[0,1].map(i=><div key={i} style={{height:4,borderRadius:20,flex:i===0?3:1,background:i===0?C.accent:C.border,transition:"all .3s"}}/>)}
        </div>
        <div style={{fontSize:11,fontWeight:600,color:C.accent,letterSpacing:0.5,marginBottom:8}}>1 of 1</div>
        <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:6,letterSpacing:-0.3}}>
          What is your agency called?
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:22,lineHeight:1.5}}>
          This becomes your workspace name. Your team will see it when they join.
        </div>
        <input
          autoFocus
          value={wsName}
          onChange={e=>setWsName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&wsName.trim()&&setStep(2)}
          placeholder="e.g. REVO Labs, Spark Creative, Bold Media..."
          style={{...inp,fontSize:15,padding:"13px 14px",marginBottom:22}}
        />
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button
            onClick={()=>wsName.trim()&&setStep(2)}
            disabled={!wsName.trim()}
            style={{padding:"10px 24px",background:wsName.trim()?C.text:C.border,color:wsName.trim()?"#FFF":C.muted,border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:wsName.trim()?"pointer":"not-allowed"}}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2 — Handoff screen
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(500px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"40px 36px",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:14}}>🎉</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:8}}>
          You're all set, {wsName}!
        </div>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:28,maxWidth:380,margin:"0 auto 28px"}}>
          Your workspace is ready. Here's how it works:
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14,textAlign:"left",marginBottom:32}}>
          {[
            {n:"1",icon:"🏢",title:"Add your clients from the dashboard",desc:"Each client gets their own pipeline, goal, and progress tracking. Add as many as you need."},
            {n:"2",icon:"✨",title:"Creative direction per client",desc:"When you add a client, answer a few questions about their brand. The platform uses that to give channel-specific creative directions — not generic suggestions, their voice."},
            {n:"3",icon:"📊",title:"Track everything from the dashboard",desc:"See all your clients' progress at a glance. Drill into any client for their full pipeline and analytics."},
          ].map(item=>(
            <div key={item.n} style={{display:"flex",gap:12,alignItems:"flex-start",background:C.light,borderRadius:10,padding:"12px 14px"}}>
              <span style={{fontSize:20,flexShrink:0}}>{item.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}>{item.title}</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={finish}
          disabled={loading}
          style={{padding:"13px 32px",background:loading?C.border:C.text,color:loading?C.muted:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer"}}>
          {loading?"Setting up...":"Go to my dashboard →"}
        </button>
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





// ── AI BOX ICON ───────────────────────────────────────────────────────────────
function AIBoxIcon({onClick,active}){
  return(
    <button onClick={onClick} title="AI suggestions" style={{width:24,height:24,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,border:`0.5px solid ${active?"#378ADD":C.border}`,background:active?"#EFF6FF":C.surface,padding:0,transition:"all .15s"}}>
      <div style={{display:"flex",gap:1.5,alignItems:"flex-end"}}>
        <div style={{width:4,height:7,borderRadius:1,background:BRAND.red}}/>
        <div style={{width:3,height:4.5,borderRadius:1,background:BRAND.yellow,marginBottom:.5}}/>
        <div style={{width:5,height:3.5,borderRadius:1,background:BRAND.blue,marginBottom:1.5}}/>
        <div style={{width:3,height:6,borderRadius:1,background:BRAND.green,marginBottom:.5}}/>
      </div>
    </button>
  );
}

// ── AI ASSIST PANEL ───────────────────────────────────────────────────────────
function AIAssistPanel({platform,focusField,analytics,onUse,onClose}){
  const dirs=(CHANNEL_DIRECTIONS[platform]||CHANNEL_DIRECTIONS["TikTok"]).filter(d=>d.field===focusField||!focusField);
  const fieldColors={hook:BRAND.red,body:BRAND.yellow,cta:BRAND.blue,notes:BRAND.green};
  const topHook=analytics?.topHook;
  const topFormat=analytics?.topFormat;
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,.1)",overflow:"hidden"}}>
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
        <AIBoxIcon active/>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:500,color:C.text}}>Creative directions for {platform}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:1}}>Starting points — make them yours</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:0}}>×</button>
      </div>
      {(topHook||topFormat)&&(
        <div style={{padding:"8px 14px",background:"#FAFAFA",borderBottom:`1px solid ${C.border}`,fontSize:10,color:C.muted,lineHeight:1.5}}>
          {topHook&&<span>Your <strong style={{color:BRAND.red}}>{topHook}</strong> content performs best. </span>}
          {topFormat&&<span>Your audience responds to <strong style={{color:BRAND.blue}}>{topFormat}</strong> format.</span>}
        </div>
      )}
      <div style={{padding:10,display:"flex",flexDirection:"column",gap:7}}>
        {dirs.map((d,i)=>(
          <div key={i} onClick={()=>onUse(d)} style={{padding:"9px 11px",borderRadius:8,border:`0.5px solid ${C.border}`,cursor:"pointer",transition:"border-color .15s",background:C.surface}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=fieldColors[d.field]||BRAND.blue}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:fieldColors[d.field]||BRAND.blue,flexShrink:0}}/>
              <span style={{fontSize:10,fontWeight:500,color:C.text}}>{d.label}</span>
              <span style={{fontSize:9,color:C.muted,marginLeft:"auto",background:C.light,padding:"1px 6px",borderRadius:20}}>{d.field}</span>
            </div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:4}}>{d.desc}</div>
            <div style={{fontSize:9,color:BRAND.blue,fontWeight:500}}>Use as direction →</div>
          </div>
        ))}
      </div>
      <div style={{padding:"8px 14px",borderTop:`1px solid ${C.border}`,fontSize:10,color:C.muted,lineHeight:1.5,fontStyle:"italic"}}>
        These open a direction, not a script. The creative work is yours.
      </div>
    </div>
  );
}

// ── SCRIPT DOCUMENT ───────────────────────────────────────────────────────────
function ScriptDocument({card,analytics,onSave,onClose}){
  const[sections,setSections]=useState(()=>{
    try{const p=JSON.parse(card.script||"{}");return{hook:p.hook||"",body:p.body||"",cta:p.cta||"",notes:p.notes||""};}
    catch(e){return{hook:card.script||"",body:"",cta:"",notes:""};}
  });
  const[focusField,setFocusField]=useState("hook");
  const[showAI,setShowAI]=useState(false);
  const sectionDefs=[
    {key:"hook",label:"Hook",sublabel:"first 3 seconds",color:BRAND.red,placeholder:"What stops someone mid-scroll and makes them need to keep watching..."},
    {key:"body",label:"Body",sublabel:"the substance",color:BRAND.yellow,placeholder:"The content that earns the hook — your perspective, your story, your insight..."},
    {key:"cta",label:"Call to action",sublabel:"the invitation",color:BRAND.blue,placeholder:"What do you want them to feel, do, or think next..."},
    {key:"notes",label:"Notes",sublabel:"for filming",color:BRAND.green,placeholder:"Tone reminders, visual ideas, things to remember while recording..."},
  ];
  const wordCount=Object.values(sections).join(" ").trim().split(/\s+/).filter(Boolean).length;
  const estSec=Math.round(wordCount/2.5);

  const handleUseDirection=(d)=>{
    setFocusField(d.field);
    setShowAI(false);
  };

  const handleSave=()=>{
    onSave(JSON.stringify(sections));
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui",padding:16}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(0,0,0,.25)",width:"min(680px,100%)",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:2}}>Script</div>
            <div style={{fontSize:11,color:C.muted}}>{card.title} · {card.platform}</div>
          </div>
          <AIBoxIcon onClick={()=>setShowAI(s=>!s)} active={showAI}/>
          <button onClick={()=>{
            const w=window.open("","_blank");
            const s=sections;
            w.document.write(`<html><head><title>${card.title}</title><style>body{font-family:Georgia,serif;max-width:600px;margin:40px auto;color:#111;line-height:1.8}h1{font-size:20px;margin-bottom:4px}.meta{font-size:12px;color:#666;margin-bottom:28px}.sec{margin-bottom:24px}.sec-label{font-size:10px;font-weight:bold;letter-spacing:1.5px;color:#555;text-transform:uppercase;margin-bottom:8px}.sec-content{font-size:15px;white-space:pre-wrap;line-height:1.8}@media print{body{margin:20px}}</style></head><body><h1>${card.title}</h1><div class="meta">${card.platform} · ${new Date().toLocaleDateString()}</div>${[{k:"hook",l:"Hook"},{k:"body",l:"Body"},{k:"cta",l:"Call to action"}].map(({k,l})=>s[k]?`<div class="sec"><div class="sec-label">${l}</div><div class="sec-content">${s[k].replace(/</g,"&lt;")}</div></div>`:"").join("")}<script>window.onload=()=>{window.print()}<\/script></body></html>`);
            w.document.close();
          }} style={{fontSize:11,padding:"5px 11px",background:C.light,border:`0.5px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>🖨 Print</button>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:4}}>×</button>
        </div>

        <div style={{flex:1,overflowY:"auto",display:"grid",gridTemplateColumns:showAI?"1fr 300px":"1fr",gap:0}}>
          {/* Document */}
          <div style={{padding:"4px 0"}}>
            {sectionDefs.map(sec=>(
              <div key={sec.key} style={{padding:"12px 18px",borderBottom:`0.5px solid ${C.border}`,background:focusField===sec.key?sec.color+"06":"transparent",transition:"background .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:3,height:14,borderRadius:2,background:sec.color}}/>
                  <div style={{fontSize:10,fontWeight:500,color:C.text,textTransform:"uppercase",letterSpacing:1}}>{sec.label}</div>
                  <div style={{fontSize:10,color:C.muted}}>{sec.sublabel}</div>
                </div>
                <textarea
                  value={sections[sec.key]}
                  onChange={e=>setSections(p=>({...p,[sec.key]:e.target.value}))}
                  onFocus={()=>setFocusField(sec.key)}
                  placeholder={sec.placeholder}
                  style={{width:"100%",border:"none",outline:"none",background:"transparent",fontSize:13,color:sections[sec.key]?C.text:C.muted,lineHeight:1.7,resize:"none",fontFamily:"system-ui",minHeight:sec.key==="body"?80:48,padding:0}}
                />
              </div>
            ))}
          </div>

          {/* AI Panel */}
          {showAI&&(
            <div style={{borderLeft:`0.5px solid ${C.border}`,overflowY:"auto",padding:12}}>
              <AIAssistPanel platform={card.platform||"TikTok"} focusField={focusField} analytics={analytics} onUse={handleUseDirection} onClose={()=>setShowAI(false)}/>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"10px 18px",borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:11,color:C.muted}}>{wordCount} words · ~{estSec}s</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{padding:"7px 16px",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,color:C.text}}>Close</button>
            <button onClick={handleSave} style={{padding:"7px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:500}}>Save ✓</button>
          </div>
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



// ── EDIT ADVICE GENERATOR ─────────────────────────────────────────────────────
function EditAdviceGenerator({card,businessProfile,analytics,onSave,onClose}){
  const[loading,setLoading]=useState(false);
  const[generated,setGenerated]=useState(false);

  const generate=async()=>{
    setLoading(true);
    const bp=businessProfile||{};
    const pTiming={"TikTok":"30-60 seconds","Instagram Reels":"15-90 seconds","YouTube Shorts":"under 60 seconds","YouTube":"2-10 minutes","Facebook":"1-3 minutes","LinkedIn":"30-90 seconds"};
    const system=`You are an expert short-form video editor giving specific, actionable editing advice to a small business.

BUSINESS: ${bp.businessName||"Unknown"} — ${bp.whatYouDo||""}
BRAND TONE: ${bp.tone||"Not specified"}
PLATFORM: ${card.platform} (target length: ${pTiming[card.platform]||"match platform norms"})
VIDEO: "${card.title}"
HOOK TYPE: ${card.hook||"Not specified yet"}
FORMAT: ${card.format||"Not specified yet"}
${card.script?`SCRIPT:\n${card.script}`:"No script saved."}
${analytics?.topHook?`BEST PERFORMING HOOK FOR THIS BRAND: ${analytics.topHook}`:""}
${analytics?.topFormat?`BEST PERFORMING FORMAT FOR THIS BRAND: ${analytics.topFormat}`:""}

OUTPUT FORMAT:
Create a concise editing checklist using ☐ checkboxes. Group into 3 categories. Focus on what makes this specific video stronger based on its hook type, format, and platform. Be specific, not generic. The editor makes the creative calls — this is their reference, not a prescription.

Output exactly 4-5 bullet points. No categories, no headers, no essays. Each bullet is one line, super specific to this video.

Format:
EDITING ADVICE — [video title] ([platform])

☐ [tip 1 — most important, specific to their hook type]
☐ [tip 2 — pacing or cut style for this format]
☐ [tip 3 — audio recommendation]
☐ [tip 4 — text or caption tip]
☐ [tip 5 — only if you have something highly specific to add, skip if generic]

Rules:
- Max one line per bullet
- Reference their hook type, format, and brand tone specifically
- If they have performance data, reference it (e.g. "your POV hooks avg 2x more views — lean into that energy")
- Never write more than 5 bullets
- No explanations, no sub-bullets, no categories`;

    try{
      const r=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages:[{role:"user",content:`Generate editing advice for this video.`}],
          systemPrompt:system
        })
      });
      const d=await r.json();
      if(d.content){
        onSave(d.content);
        setGenerated(true);
      }
    }catch(e){console.error(e);}
    setLoading(false);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(0,0,0,.3)",width:"min(440px,100%)",padding:32,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>✂️</div>
        <div style={{fontSize:17,fontWeight:600,color:C.text,marginBottom:8}}>📊 Data-driven edit insights</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:8}}>
          Based on your hook type, format, and platform — a specific editing checklist for this video. Reference, not rules.
        </div>
        {!card.script&&<div style={{fontSize:11,color:C.amber,background:"#FFFBEB",padding:"6px 12px",borderRadius:8,marginBottom:16,border:`1px solid ${C.amber}40`}}>💡 Save a script first for more specific advice</div>}
        {card.script&&<div style={{fontSize:11,color:C.green,background:"#DCFCE7",padding:"6px 12px",borderRadius:8,marginBottom:16,border:"1px solid #BBF7D0"}}>📄 Script found — advice will be highly specific</div>}
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          <button onClick={onClose} style={{padding:"9px 20px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:13,color:C.text}}>Cancel</button>
          <button onClick={generate} disabled={loading} style={{padding:"9px 24px",background:loading?C.border:C.green,color:loading?C.muted:"#FFF",border:"none",borderRadius:8,cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:700}}>
            {loading?"Generating advice...":"✨ Generate now"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAdviceViewer({card,onRegenerate,onClose}){
  const[editing,setEditing]=useState(false);
  const[text,setText]=useState(card.editAdvice||"");

  const printAdvice=()=>{
    const win=window.open("","_blank");
    win.document.write(`<html><head><title>Editing Advice — ${card.title}</title>
    <style>body{font-family:Georgia,serif;max-width:600px;margin:40px auto;color:#111;line-height:1.8}h1{font-size:18px;margin-bottom:4px}.meta{font-size:12px;color:#666;margin-bottom:28px}.content{font-size:14px;white-space:pre-wrap}@media print{body{margin:20px}}</style></head>
    <body><h1>Editing Advice</h1>
    <div class="meta">${(card.title||"").replace(/</g,"&lt;")} · ${(card.platform||"").replace(/</g,"&lt;")}</div>
    <div class="content">${(text||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
    <script>window.onload=()=>{window.print();}<\/script></body></html>`);
    win.document.close();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(0,0,0,.3)",width:"min(600px,100%)",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div><div style={{fontSize:13,fontWeight:700,color:C.text}}>✂️ Editing Advice</div><div style={{fontSize:11,color:C.muted}}>{card.title} · {card.platform}</div></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={onRegenerate} style={{fontSize:11,padding:"5px 11px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:20,cursor:"pointer",color:C.green,fontWeight:600}}>✨ Regenerate</button>
            <button onClick={()=>setEditing(e=>!e)} style={{fontSize:11,padding:"5px 11px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>{editing?"👁 Preview":"✏️ Edit"}</button>
            <button onClick={printAdvice} style={{fontSize:11,padding:"5px 11px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>🖨 Print</button>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:4}}>×</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:20}}>
          {editing
            ?<textarea value={text} onChange={e=>setText(e.target.value)} style={{...inp,height:360,resize:"vertical",fontSize:13,lineHeight:1.7,fontFamily:"system-ui"}}/>
            :<div style={{fontSize:13,lineHeight:1.9,color:C.text,whiteSpace:"pre-wrap"}}>{text}</div>
          }
        </div>
        <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0}}>
          <button onClick={onClose} style={{padding:"7px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,color:C.text}}>Close</button>
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
              <div style={{fontSize:17,fontWeight:600,color:C.text,marginBottom:8,letterSpacing:-0.3}}>Production planner</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:6}}>Answer a few questions about your setup and get a shot-by-shot production checklist — so you can focus on the performance, not the logistics.</div>
              {card.script&&<div style={{fontSize:11,color:C.green,background:"#DCFCE7",padding:"5px 12px",borderRadius:20,marginBottom:20}}>📄 Script is saved — shot list will match it exactly</div>}
              {!card.script&&<div style={{fontSize:11,color:C.muted,background:C.light,padding:"5px 12px",borderRadius:20,marginBottom:20}}>💡 Tip: write a script first for a more precise shot list</div>}
              <button onClick={start} style={{padding:"11px 28px",background:"#F59E0B",color:"#FFF",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>🎥 Plan shoot with AI →</button>
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
              <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="3 people, names are Jake, Maria, and Luis, filming in the gym...  (Shift+Enter for new line)" style={{...inp,fontSize:13,padding:"9px 12px",resize:"none",height:42,lineHeight:1.5,fontFamily:"system-ui"}} disabled={loading}/>
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
    let sys=`You are a creative direction assistant. You help humans develop their own content ideas through questions and direction — never by writing scripts for them. Your role is to ask, provoke, and suggest directions. The human does the creative work.

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
- Ask 1-2 questions to understand the video idea, then give 2-3 creative directions — not a full script. Directions should be specific, human, and channel-appropriate. Always end with: "The creative work is yours."
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
              <div style={{fontSize:40,marginBottom:16}}>🧠</div>
              <div style={{fontSize:17,fontWeight:600,color:C.text,marginBottom:8,letterSpacing:-0.3}}>Script research assistant</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:6}}>
                Based on your analytics and what's worked for your brand, this gives you a framework to react to — the creative direction is always yours.
              </div>
              {businessProfile?.businessName&&(
                <div style={{fontSize:12,color:C.accent,background:C.accent+"12",padding:"6px 14px",borderRadius:20,marginBottom:24}}>
                  🏢 {businessProfile.businessName}
                </div>
              )}
              <button onClick={startChat} style={{padding:"11px 28px",background:C.text,color:"#FFF",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}><span>✨</span>
                Get creative direction →
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
                  ✓ Save this framework to my card
                </button>
              </div>
            )}
            <div style={{padding:"10px 14px 12px",display:"flex",gap:8}}>
              <textarea
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder="Keep refining... or save when ready ↑  (Shift+Enter for new line)"
                style={{...inp,fontSize:13,padding:"9px 12px",resize:"none",height:42,lineHeight:1.5,fontFamily:"system-ui"}}
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


// ── CAMPAIGN CREATOR ──────────────────────────────────────────────────────────
const QUICK_STARTS=[
  "Product launch campaign",
  "Seasonal holiday campaign",
  "Brand awareness on TikTok",
  "Creator collaboration series",
  "New brand content strategy",
];

const THUMB_COLORS=["#667eea,#764ba2","#f093fb,#f5576c","#4facfe,#00f2fe","#43e97b,#38f9d7","#fa709a,#fee140","#a18cd1,#fbc2eb","#ffecd2,#fcb69f","#ff9a9e,#fecfef","#96fbc4,#f9f586","#f6d365,#fda085","#89f7fe,#66a6ff","#fddb92,#d1fdff"];

function CampaignCreator({userId,businessProfile,videos,onSendToPipeline}){
  const[phase,setPhase]=useState("start"); // start|searching|refs|building|result
  const[input,setInput]=useState("");
  const[context,setContext]=useState("");
  const[refs,setRefs]=useState([]);
  const[selected,setSelected]=useState([]);
  const[campaign,setCampaign]=useState(null);
  const[loading,setLoading]=useState(false);
  const[pastCampaigns,setPastCampaigns]=useState([]);
  const bottomRef=useRef(null);

  useEffect(()=>{
    sbGet("campaigns",`&user_id=eq.${userId}&order=created_at.desc&limit=5`).then(d=>{
      setPastCampaigns(d||[]);
    });
  },[userId]);

  const bp=businessProfile||{};

  const searchRefs=async(prompt)=>{
    setContext(prompt);
    setPhase("searching");
    setLoading(true);
    try{
      const sys=`You are a content strategist. The user wants to build a social media campaign. Search the web for 10-12 real videos that performed well related to their campaign topic.

Business context:
- Business: ${bp.businessName||"Unknown"}
- What they do: ${bp.whatYouDo||""}
- Tone: ${bp.tone||""}

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "title": "video title",
    "platform": "Instagram/TikTok/YouTube",
    "views": "2.1M",
    "hookType": "POV/Story/Transformation/Curiosity/List/Emotional",
    "format": "Lifestyle/Tutorial/Founder/UGC/Before-After",
    "why": "one sentence on why it worked"
  }
]

Find real examples. Return exactly 10-12 items. JSON only.`;
      const r=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages:[{role:"user",content:`Find high-performing videos for this campaign: ${prompt}`}],
          systemPrompt:sys,
          useWebSearch:true
        })
      });
      const d=await r.json();
      if(d.content){
        try{
          const clean=d.content.replace(/```json|```/g,"").trim();
          const parsed=JSON.parse(clean);
          setRefs(parsed.slice(0,12));
          setPhase("refs");
        }catch(e){
          // Fallback refs if parsing fails
          setRefs([
            {title:"The moment nobody shows you",platform:"Instagram",views:"2.1M",hookType:"POV",format:"Lifestyle",why:"Intimate and relatable, felt real"},
            {title:"Before and after 30 days",platform:"Instagram",views:"4.3M",hookType:"Transformation",format:"Before-After",why:"Clear visual proof drove massive shares"},
            {title:"Why I built this for my mom",platform:"TikTok",views:"890K",hookType:"Story",format:"Founder",why:"Personal story created emotional connection"},
            {title:"She doesn't ask for much",platform:"Instagram",views:"7.8M",hookType:"Emotional",format:"Lifestyle",why:"Universal feeling, perfectly timed for the moment"},
            {title:"Real people, real results",platform:"TikTok",views:"3.2M",hookType:"Curiosity",format:"UGC",why:"Authentic UGC outperformed branded content 3x"},
            {title:"3 things that actually work",platform:"Instagram",views:"1.5M",hookType:"List",format:"Tutorial",why:"Actionable tips drove saves and shares"},
            {title:"What changed after I tried it",platform:"TikTok",views:"2.8M",hookType:"Story",format:"Lifestyle",why:"First-person narrative felt trustworthy"},
            {title:"The gift guide nobody makes",platform:"Instagram",views:"650K",hookType:"Curiosity",format:"List",why:"Filled a content gap people were searching for"},
            {title:"I switched my routine for 60 days",platform:"TikTok",views:"5.1M",hookType:"Transformation",format:"Before-After",why:"Long-term commitment resonated deeply"},
            {title:"No filter, no edits, just real",platform:"Instagram",views:"4.7M",hookType:"POV",format:"Lifestyle",why:"Anti-polish trend peaked engagement"},
          ]);
          setPhase("refs");
        }
      }
    }catch(e){console.error(e);}
    setLoading(false);
  };

  const buildCampaign=async()=>{
    if(selected.length===0)return;
    setPhase("building");
    setLoading(true);
    try{
      const selectedItems=refs.filter((_,i)=>selected.includes(i));
      const sys=`You are a senior content strategist. Based on the campaign brief and the reference videos the user selected, create a detailed campaign plan.

Business: ${bp.businessName||"Unknown"} — ${bp.whatYouDo||""}
Brand tone: ${bp.tone||"Not specified"}

Return ONLY valid JSON (no markdown) with this structure:
{
  "title": "Campaign name",
  "angle": "Core campaign angle in one sentence",
  "strategy": "2-sentence strategy description",
  "style": "What the user's selections tell you about their aesthetic preferences",
  "ideas": [
    {
      "title": "video idea title",
      "hook": "hook type",
      "format": "format type",
      "platform": "platform",
      "why": "one line on why this fits the campaign"
    }
  ]
}

Generate exactly 10 ideas. JSON only.`;
      const r=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages:[{role:"user",content:`Campaign brief: ${context}

Selected references:
${JSON.stringify(selectedItems,null,2)}`}],
          systemPrompt:sys
        })
      });
      const d=await r.json();
      if(d.content){
        try{
          const clean=d.content.replace(/```json|```/g,"").trim();
          const parsed=JSON.parse(clean);
          setCampaign(parsed);
          // Save to DB
          await sbInsert("campaigns",{
            id:"camp"+uid(),user_id:userId,
            title:parsed.title,
            brief:JSON.stringify(parsed),
            ideas:JSON.stringify(parsed.ideas||[]),
            month:curMonth(),
            created_at:new Date().toISOString()
          });
          // Refresh past campaigns
          sbGet("campaigns",`&user_id=eq.${userId}&order=created_at.desc&limit=5`).then(dd=>setPastCampaigns(dd||[]));
          setPhase("result");
        }catch(e){console.error("parse error",e);setPhase("refs");}
      }
    }catch(e){console.error(e);}
    setLoading(false);
  };

  const sendToPipeline=()=>{
    if(!campaign?.ideas)return;
    const ideas=campaign.ideas.map(idea=>({
      id:"v"+uid(),
      title:idea.title,
      platform:idea.platform||"TikTok",
      hook:idea.hook||"",
      format:idea.format||"",
      month:curMonth(),
      stage:"idea",
      targetDate:"",
      createdAt:new Date().toISOString()
    }));
    onSendToPipeline(ideas);
  };

  const reset=()=>{setPhase("start");setInput("");setContext("");setRefs([]);setSelected([]);setCampaign(null);};

  // ── START SCREEN ───────────────────────────────────────────────────────────
  if(phase==="start")return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:500,padding:"48px 24px",textAlign:"center"}}>
      <div style={{fontSize:28,fontWeight:500,color:C.text,marginBottom:32,letterSpacing:-0.5}}>What are you creating this month?</div>
      <div style={{width:"min(580px,100%)",position:"relative",marginBottom:20}}>
        <textarea
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&input.trim()){e.preventDefault();searchRefs(input.trim());}}}
          placeholder="Tell me about your brand, platform, and what you're trying to achieve... (Enter to search)"
          style={{...inp,borderRadius:24,padding:"14px 52px 14px 20px",fontSize:14,lineHeight:1.5,resize:"none",height:54,fontFamily:"system-ui",border:`1px solid ${C.border}`,boxShadow:"0 1px 6px rgba(0,0,0,.06)"}}
        />
        <button
          onClick={()=>input.trim()&&searchRefs(input.trim())}
          disabled={!input.trim()}
          style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:input.trim()?C.text:C.border,border:"none",cursor:input.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF"}}>
          <span style={{fontSize:16}}>↑</span>
        </button>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:44,maxWidth:560}}>
        {QUICK_STARTS.map(q=>(
          <button key={q} onClick={()=>{setInput(q);searchRefs(q);}} style={{padding:"7px 14px",border:`1px solid ${C.border}`,borderRadius:20,fontSize:12,color:C.muted,cursor:"pointer",background:C.surface}}>{q}</button>
        ))}
      </div>
      {pastCampaigns.length>0&&(
        <div style={{width:"min(580px,100%)",textAlign:"left"}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase"}}>Recent campaigns</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {pastCampaigns.map((c,i)=>{
              let brief={};try{brief=JSON.parse(c.brief||"{}");}catch(e){}
              return(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer"}}
                  onClick={()=>{try{const b=JSON.parse(c.brief);setCampaign(b);setPhase("result");}catch(e){}}}>
                  <div style={{width:28,height:28,borderRadius:6,background:["#EDE9FE","#EFF6FF","#DCFCE7","#FEF3C7","#FEE2E2"][i%5],display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                    {["✨","🎯","📊","🎬","🌟"][i%5]}
                  </div>
                  <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.title||"Campaign"}</div><div style={{fontSize:10,color:C.muted}}>{c.month}</div></div>
                  <span style={{fontSize:10,color:C.muted}}>→</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ── SEARCHING ──────────────────────────────────────────────────────────────
  if(phase==="searching")return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:500,padding:40,textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:20}}>🔍</div>
      <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Searching for real examples...</div>
      <div style={{fontSize:13,color:C.muted,maxWidth:400,lineHeight:1.6}}>Finding high-performing videos related to your campaign. Looking at what actually worked, not just what got boosted.</div>
      <div style={{marginTop:24,display:"flex",gap:5,alignItems:"flex-end"}}>
        {[[BRAND.red,18,10],[BRAND.yellow,11,7],[BRAND.blue,14,8],[BRAND.green,9,12]].map(([c,h,w],i)=>(
          <div key={i} style={{width:w,height:h,borderRadius:3,background:c,animation:`brandPulse 1.2s ${i*0.15}s ease-in-out infinite`}}/>
        ))}
      </div>
      <style>{`@keyframes brandPulse{0%,100%{opacity:.25;transform:scaleY(0.7)}50%{opacity:1;transform:scaleY(1)}}`}</style>
    </div>
  );

  // ── REFERENCE CARDS ────────────────────────────────────────────────────────
  if(phase==="refs")return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:4}}>{refs.length} real examples found</div>
          <div style={{fontSize:13,color:C.muted}}>Pick the ones that feel like your brand — the AI builds around what you select</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {selected.length>0&&<span style={{fontSize:12,color:C.accent,fontWeight:600}}>{selected.length} selected</span>}
          <button onClick={reset} style={{padding:"6px 12px",border:`1px solid ${C.border}`,borderRadius:8,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted}}>← Start over</button>
          <button
            onClick={buildCampaign}
            disabled={selected.length===0}
            style={{padding:"8px 18px",background:selected.length>0?C.text:C.border,color:selected.length>0?"#FFF":C.muted,border:"none",borderRadius:8,cursor:selected.length>0?"pointer":"not-allowed",fontSize:13,fontWeight:700}}>
            Build campaign →
          </button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
        {refs.map((ref,i)=>{
          const isSel=selected.includes(i);
          const colors=THUMB_COLORS[i%THUMB_COLORS.length].split(",");
          return(
            <div key={i} onClick={()=>setSelected(prev=>isSel?prev.filter(x=>x!==i):[...prev,i])}
              style={{border:`${isSel?"2px":"1px"} solid ${isSel?C.accent:C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",background:C.surface,transition:"border-color .15s,transform .15s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              {/* Thumbnail */}
              <div style={{height:100,background:`linear-gradient(135deg,${colors[0]},${colors[1]})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.85)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>▶</div>
                {isSel&&<div style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#FFF",fontWeight:700}}>✓</div>}
              </div>
              {/* Info */}
              <div style={{padding:"10px 12px"}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:5,lineHeight:1.35}}>{ref.title}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.accent+"18",color:C.accent,fontWeight:600}}>{ref.hookType}</span>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.light,color:C.muted}}>{ref.platform}</span>
                </div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.4}}>{ref.why}</div>
                <div style={{fontSize:10,fontWeight:600,color:C.green,marginTop:5}}>👁 {ref.views} views</div>
              </div>
            </div>
          );
        })}
      </div>
      {selected.length>0&&(
        <div style={{position:"sticky",bottom:16,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}>
          <div style={{fontSize:13,color:C.muted}}><span style={{fontWeight:700,color:C.text}}>{selected.length}</span> videos selected</div>
          <button onClick={buildCampaign} style={{padding:"10px 24px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:700}}>Build my campaign →</button>
        </div>
      )}
    </div>
  );

  // ── BUILDING ───────────────────────────────────────────────────────────────
  if(phase==="building")return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:500,padding:40,textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:20}}>✨</div>
      <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Building your campaign...</div>
      <div style={{fontSize:13,color:C.muted,maxWidth:400,lineHeight:1.6}}>Reading your selections, identifying the pattern, and creating a campaign tailored to your brand's aesthetic.</div>
      <div style={{marginTop:24,display:"flex",gap:5,alignItems:"flex-end"}}>
        {[[BRAND.red,18,10],[BRAND.yellow,11,7],[BRAND.blue,14,8],[BRAND.green,9,12]].map(([c,h,w],i)=>(
          <div key={i} style={{width:w,height:h,borderRadius:3,background:c,animation:`brandPulse 1.2s ${i*0.15}s ease-in-out infinite`}}/>
        ))}
      </div>
    </div>
  );

  // ── CAMPAIGN RESULT ────────────────────────────────────────────────────────
  if(phase==="result"&&campaign)return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.text,letterSpacing:-0.3,marginBottom:4}}>{campaign.title}</div>
          <div style={{fontSize:13,color:C.muted}}>{campaign.angle}</div>
        </div>
        <button onClick={reset} style={{padding:"6px 12px",border:`1px solid ${C.border}`,borderRadius:8,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted}}>New campaign</button>
      </div>

      {/* Strategy block */}
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:10,textTransform:"uppercase"}}>Campaign strategy</div>
        <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:10}}>{campaign.strategy}</div>
        {campaign.style&&<div style={{fontSize:12,color:C.accent,background:C.accent+"10",padding:"8px 12px",borderRadius:8,lineHeight:1.6,borderLeft:`3px solid ${C.accent}`}}>
          <strong>Based on your selections:</strong> {campaign.style}
        </div>}
      </Card>

      {/* 10 ideas */}
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>10 video ideas</div>
          <span style={{fontSize:11,background:"#DCFCE7",color:C.green,padding:"2px 8px",borderRadius:20,fontWeight:600}}>Ready to send to pipeline</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {(campaign.ideas||[]).map((idea,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.light,borderRadius:8,border:`1px solid ${C.border}`}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:C.accent+"18",color:C.accent,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,fontSize:13,color:C.text,fontWeight:500}}>{idea.title}</div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                {idea.hook&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.light,color:C.muted,border:`1px solid ${C.border}`}}>{idea.hook}</span>}
                {idea.format&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.light,color:C.muted,border:`1px solid ${C.border}`}}>{idea.format}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <button
        onClick={sendToPipeline}
        style={{width:"100%",padding:"13px 0",background:C.text,color:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer"}}>
        Send all 10 ideas to my pipeline →
      </button>
      <div style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:8}}>All 10 cards will appear in your Idea column, ready to move through the pipeline</div>
    </div>
  );

  return null;
}

// ── CREATOR DASHBOARD ─────────────────────────────────────────────────────────
function CreatorDashboard({videos,goals,month,onMonthChange,onSetGoal,onAddVideo,onMoveVideo,onMetrics,onDeleteVideo,userId,refGoal,refAdd,refStages,refPublished,refLock,tourStep,showAddFromTour,onAddFromTourDone,onTourNext,businessProfile,onSaveScript,onSaveShotList,onSaveEditAdvice}){
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
  const[editCard,setEditCard]=useState(null);
  const[editViewCard,setEditViewCard]=useState(null);
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
        <div style={{background:`linear-gradient(135deg,#FFF0F0,#FFF8EC,#EFF6FF)`,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
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
        {goal>0&&<><div style={{background:C.light,borderRadius:20,height:9,overflow:"hidden",marginBottom:6}}><div style={{width:`${pct||0}%`,height:"100%",background:pct===100?BRAND.green:`linear-gradient(90deg,${BRAND.red},${BRAND.blue})`,borderRadius:20,transition:"width .4s"}}/></div><div style={{display:"flex",gap:14,fontSize:11,color:C.muted}}><span style={{color:C.accent,fontWeight:600}}>✅ {published} published</span><span>🎬 {mVids.filter(v=>v.stage!=="published").length} in progress</span>{published<goal&&<span>📋 {goal-published} to go</span>}</div></>}
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
              <div style={{height:3,background:stage.color,marginBottom:9}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,padding:"0 9px"}}>
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
                    style={{background:C.surface,borderRadius:10,marginBottom:8,border:`1px solid ${stage.id==="published"?BRAND.green+"40":hasMet?"#BBF7D0":C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)",cursor:"grab",display:"flex",overflow:"hidden",transition:"box-shadow .15s,transform .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.06)";e.currentTarget.style.transform="none";}}>
                    {/* Thick left stripe */}
                    <div style={{width:5,background:stage.color,flexShrink:0,borderRadius:"10px 0 0 10px"}}/>
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
                      {(stage.id==="idea"||stage.id==="production")&&(
                        <button onClick={()=>setScriptCard(v)} style={{fontSize:10,padding:"3px 9px",background:v.script?"#FFF0F0":C.light,border:`1px solid ${v.script?BRAND.red+"40":C.border}`,borderRadius:20,cursor:"pointer",color:v.script?BRAND.red:C.muted,fontWeight:500}}>
                          {v.script?"📄 Script":"📄 Write script"}
                        </button>
                      )}
                      {/* AI Box in corner */}
                      <div style={{marginLeft:"auto"}}><AIBoxIcon onClick={()=>setScriptCard(v)}/></div>

                      )}
                      {stage.id==="production"&&(
                        v.shotList
                          ?<button onClick={()=>setShootViewCard(v)} style={{fontSize:10,padding:"4px 10px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:20,cursor:"pointer",color:"#92400E",fontWeight:600,fontSize:11,padding:"5px 12px"}}>🎬 Shot list ready</button>
                          :<button onClick={()=>setShootCard(v)} style={{fontSize:10,padding:"4px 10px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:20,cursor:"pointer",color:"#92400E",fontWeight:600}}>🎥 Plan the shoot</button>
                      )}
                      {stage.id==="editing"&&(
                        v.editAdvice
                          ?<button onClick={()=>setEditViewCard(v)} style={{fontSize:10,padding:"4px 10px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:20,cursor:"pointer",color:C.green,fontWeight:600,fontSize:11,padding:"5px 12px"}}>✂️ Edit advice ready</button>
                          :<button onClick={()=>setEditCard(v)} style={{fontSize:10,padding:"4px 10px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:20,cursor:"pointer",color:C.green,fontWeight:600,fontSize:11,padding:"5px 12px"}}>✨ Editing advice with AI</button>
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
                <div key={`e${i}`} onClick={()=>setShowAdd(true)} style={{background:C.surface,borderRadius:8,padding:12,marginBottom:7,border:`1px dashed ${C.border}`,cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.blue;e.currentTarget.style.background="#EFF6FF";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
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
      {scriptCard&&<ScriptDocument card={scriptCard} analytics={(()=>{const wm=videos.filter(v=>v.metricsAdded&&v.views>0);const grp=(vs,k)=>{const m={};vs.forEach(v=>{if(!v[k])return;if(!m[v[k]])m[v[k]]={n:0,s:0};m[v[k]].n++;m[v[k]].s+=v.views;});return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n)})).sort((a,b)=>b.avg-a.avg);};return{topHook:grp(wm,"hook")[0]?.name,topFormat:grp(wm,"format")[0]?.name};})()}
     onSave={s=>{onSaveScript(scriptCard.id,s);setScriptCard(null);}} onClose={()=>setScriptCard(null)}/>}
      {shootCard&&<ShootDirector card={shootCard} businessProfile={businessProfile} onSaveShotList={sl=>{onSaveShotList(shootCard.id,sl);setShootCard(null);}} onClose={()=>setShootCard(null)}/>}
      {editCard&&<EditAdviceGenerator card={editCard} businessProfile={businessProfile} analytics={{topHook:(()=>{const wm=videos.filter(v=>v.metricsAdded&&v.views>0);const m={};wm.forEach(v=>{if(!v.hook)return;if(!m[v.hook])m[v.hook]={n:0,s:0};m[v.hook].n++;m[v.hook].s+=v.views;});return Object.entries(m).sort((a,b)=>b[1].s/b[1].n-a[1].s/a[1].n)[0]?.[0]||null;})(),topFormat:(()=>{const wm=videos.filter(v=>v.metricsAdded&&v.views>0);const m={};wm.forEach(v=>{if(!v.format)return;if(!m[v.format])m[v.format]={n:0,s:0};m[v.format].n++;m[v.format].s+=v.views;});return Object.entries(m).sort((a,b)=>b[1].s/b[1].n-a[1].s/a[1].n)[0]?.[0]||null;})()}} onSave={advice=>{onSaveEditAdvice(editCard.id,advice);setEditCard(null);}} onClose={()=>setEditCard(null)}/>}
      {editViewCard&&<EditAdviceViewer card={editViewCard} onRegenerate={()=>{setEditCard(editViewCard);setEditViewCard(null);}} onClose={()=>setEditViewCard(null)}/>}
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


// ── TOOLTIP ───────────────────────────────────────────────────────────────────
function Tip({text}){
  const[show,setShow]=useState(false);
  return(
    <span style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
      <span
        onMouseEnter={()=>setShow(true)}
        onMouseLeave={()=>setShow(false)}
        style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:C.border,color:C.muted,fontSize:9,fontWeight:700,cursor:"help",flexShrink:0,marginLeft:4,lineHeight:1}}>
        ?
      </span>
      {show&&(
        <div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",background:C.text,color:"#FFF",fontSize:11,lineHeight:1.5,padding:"8px 10px",borderRadius:8,width:200,zIndex:999,pointerEvents:"none",boxShadow:"0 4px 12px rgba(0,0,0,.2)"}}>
          {text}
          <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:`5px solid ${C.text}`}}/>
        </div>
      )}
    </span>
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
      <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase",display:"flex",alignItems:"center"}}>{title}</div>
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
      {(()=>{
        const kpis=[
          [hasData?fmt(tv):"—","👁 Total views",C.gold,"Sum of all views across your published videos in this period."],
          [hasData?wm.length:"—","🎬 Videos tracked",C.accent,"Number of videos with metrics added. Add metrics after 7 days to grow this."],
          [hasData?ae:"—","💹 Avg engagement",C.green,"(Likes + comments + shares + saves) ÷ views. Industry average is 3-5%. Above 8% is excellent."],
          [hasData?aa:"—","🚀 Algorithmic reach",C.accent,"% of views from the platform pushing your content to new audiences. Above 70% means the algorithm is working for you."],
        ];
        return(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
            {kpis.map(([v,l,c,tip])=>(
              <div key={l} style={{background:C.surface,borderRadius:10,padding:14,border:`1px solid ${C.border}`,boxShadow:sh,opacity:hasData?1:.5}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:5,display:"flex",alignItems:"center"}}>{l}<Tip text={tip}/></div>
                <div style={{fontSize:22,fontWeight:800,color:hasData?c:C.border}}>{v}</div>
                {!hasData&&<SkeletonBar w="70%"/>}
              </div>
            ))}
          </div>
        );
      })()}

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
        {hasData?
          <Card><div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase",display:"flex",alignItems:"center"}}>🪝 Avg views by hook<Tip text="Which opening hook style gets the most views on average. Use your top hook more often to improve performance."/></div><ResponsiveContainer width="100%" height={160}><BarChart data={hd.slice(0,6)} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={92} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg views"]}/><Bar dataKey="avg" radius={4}>{hd.slice(0,6).map((_,i)=><Cell key={i} fill={i===0?C.gold:i===1?C.gold+"BB":"#CBD5E1"}/>)}</Bar></BarChart></ResponsiveContainer></Card>
          :<SkeletonCard title="🪝 Avg views by hook">{["80%","60%","45%","30%","20%"].map((w,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><SkeletonBar w="55px"/><SkeletonBar w={w}/></div>)}</SkeletonCard>
        }
        {hasData?
          <Card><div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase",display:"flex",alignItems:"center"}}>🎬 Avg views by format<Tip text="Which video format style gets the most views on average. This tells you what production style resonates with your audience."/></div><ResponsiveContainer width="100%" height={160}><BarChart data={fd.slice(0,6)} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={92} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg views"]}/><Bar dataKey="avg" radius={4}>{fd.slice(0,6).map((_,i)=><Cell key={i} fill={i===0?C.accent:i===1?C.accent+"BB":"#CBD5E1"}/>)}</Bar></BarChart></ResponsiveContainer></Card>
          :<SkeletonCard title="🎬 Avg views by format">{["70%","55%","40%","25%"].map((w,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><SkeletonBar w="55px"/><SkeletonBar w={w}/></div>)}</SkeletonCard>
        }
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {hasData?
          <Card><div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase",display:"flex",alignItems:"center"}}>📱 Views by platform<Tip text="Total views broken down by platform. Shows where your content performs best — useful if you post on multiple channels."/></div><ResponsiveContainer width="100%" height={120}><BarChart data={pd} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={92} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Views"]}/><Bar dataKey="views" radius={4}>{pd.map((_,i)=><Cell key={i} fill={i===0?C.gold:i===1?C.gold+"BB":"#CBD5E1"}/>)}</Bar></BarChart></ResponsiveContainer></Card>
          :<SkeletonCard title="📱 Views by platform">{["75%","45%","25%"].map((w,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><SkeletonBar w="55px"/><SkeletonBar w={w}/></div>)}</SkeletonCard>
        }
        {hasData?
          <Card><div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase",display:"flex",alignItems:"center"}}>📅 Best day to post<Tip text="Average views per publish day of the week. Post more on your best day to maximize reach."/></div><ResponsiveContainer width="100%" height={120}><BarChart data={dd} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={92} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg views"]}/><Bar dataKey="avg" radius={4}>{dd.map((_,i)=><Cell key={i} fill={i===0?C.green:i===1?C.green+"BB":"#CBD5E1"}/>)}</Bar></BarChart></ResponsiveContainer></Card>
          :<SkeletonCard title="📅 Best day to post">{["65%","80%","45%","70%","55%"].map((w,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><SkeletonBar w="30px"/><SkeletonBar w={w}/></div>)}</SkeletonCard>
        }
      </div>

      {/* Algorithmic reach breakdown */}
      {hasData&&wa.length>0&&(()=>{
        const avgS=Math.round(wa.reduce((s,v)=>s+(v.siguiendo||0),0)/wa.length);
        const avgB=Math.round(wa.reduce((s,v)=>s+(v.busqueda||0),0)/wa.length);
        const avgA=Math.round(wa.reduce((s,v)=>s+v.paraTi,0)/wa.length);
        return(
          <Card style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase",display:"flex",alignItems:"center"}}>📡 Traffic sources<Tip text="Where your views are coming from. Algorithmic = platform pushed it. Followers = people who follow you. Search = found through search."/></div>
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
          {[[best,"🏆 Your best video",C.green,"#DCFCE7","Your highest-view video. Study the hook, format, and platform — replicate what worked."],[worst,"⚠️ Your lowest",C.red,"#FEE2E2","Your lowest-view video. Compare it to your best — what was different about the hook or format?"]].map(([v,label,color,bg,tip])=>(
            <Card key={v.id} style={{borderTop:`3px solid ${color}`}}>
              <div style={{fontSize:10,fontWeight:700,color:color,letterSpacing:1,marginBottom:10,textTransform:"uppercase",display:"flex",alignItems:"center"}}>{label}<Tip text={tip}/></div>
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
    hint: "Be specific — this shapes the creative directions the platform suggests",
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
        <div style={{display:"flex",alignItems:"flex-end",gap:4,marginBottom:16,justifyContent:"center"}}>
          <div style={{width:16,height:24,borderRadius:4,background:BRAND.red}}/>
          <div style={{width:11,height:16,borderRadius:4,background:BRAND.yellow,marginBottom:3}}/>
          <div style={{width:18,height:11,borderRadius:4,background:BRAND.blue,marginBottom:7}}/>
          <div style={{width:10,height:19,borderRadius:4,background:BRAND.green,marginBottom:2}}/>
        </div>
        <div style={{fontSize:26,fontWeight:500,color:C.text,letterSpacing:-0.5,marginBottom:10,lineHeight:1.2}}>Welcome to ContentHub Sidekick</div>
        <div style={{fontSize:15,color:C.text,fontWeight:500,lineHeight:1.6,marginBottom:8}}>
          The place where your creative work actually gets to happen.
        </div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>
          ContentHub clears the mental clutter — organizing your pipeline, building campaign strategies, finding references, tracking analytics — so your brain is free to do what it's actually good at.
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
          {[["📋 Pipeline",BRAND.red],["🎯 Campaigns",BRAND.yellow],["🔍 References",BRAND.blue],["📊 Analytics",BRAND.green]].map(([t,c])=>(
            <span key={t} style={{fontSize:11,color:c,background:c+"18",padding:"4px 12px",borderRadius:20,border:`1px solid ${c}30`,fontWeight:500}}>{t}</span>
          ))}
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Tell us about your brand — so we can make this feel like yours.</div>
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
          {BP_QUESTIONS.map((_,i)=>{
            const colors=[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green,BRAND.red];
            return <div key={i} style={{height:4,borderRadius:20,flex:i===step?3:1,background:i<=step?colors[i]:C.border,transition:"all .3s"}}/>;
          })}
        </div>
        {/* Step number */}
        <div style={{fontSize:11,fontWeight:600,letterSpacing:0.5,marginBottom:8,color:[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green,BRAND.red][step]}}>
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
            style={{padding:"10px 24px",background:canNext?"#111":C.border,color:canNext?"#FFF":C.muted,border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:canNext?"pointer":"not-allowed",transition:"all .15s"}}
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
  const[showPublishPopup,setShowPublishPopup]=useState(false);
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
    setVideos((vs||[]).map(r=>({id:r.id,userId:r.user_id,title:r.title,platform:r.platform,stage:r.stage,targetDate:r.target_date,publishDate:r.publish_date,url:r.url||"",hook:r.hook||"",format:r.format||"",cta:r.cta||"",views:r.views||0,likes:r.likes||0,comments:r.comments||0,shares:r.shares||0,saves:r.saves||0,paraTi:r.para_ti,siguiendo:r.siguiendo,busqueda:r.busqueda,pauta:r.pauta||0,metricsAdded:r.metrics_added||false,month:r.month,createdAt:r.created_at,script:r.script||"",shotList:r.shot_list||"",editAdvice:r.edit_advice||""})));
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
  const saveEditAdvice=useCallback(async(id,advice)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,editAdvice:advice}:v));
    await sbUpdate("creator_videos","id",id,{edit_advice:advice});
  },[]);

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
      {tourStep===6&&<TourBubble step={6} total={6} emoji="📊" title="The more you track, the more it understands" body="After 7 days, add your video metrics. Over time the platform learns what hooks, formats, and platforms work for your brand — so the creative directions get more specific to you. Not generic. Yours." action="Check out Analytics →" onAction={()=>{finishTour();}} onSkip={finishTour} targetRef={refLock} side="left"/>}
      {showPublishPopup&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
          <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(0,0,0,.3)",width:"min(420px,95vw)",padding:32,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:16}}>🎉</div>
            <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:8,letterSpacing:-0.3}}>First video published!</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:8}}>
              Come back in 7 days to add this video's views and engagement.
            </div>
            <div style={{fontSize:13,color:C.text,fontWeight:600,lineHeight:1.7,marginBottom:20,padding:"12px 16px",background:C.accent+"10",borderRadius:10,border:`1px solid ${C.accent}20`}}>
              The platform uses that data to give you more specific creative directions over time. Not generic. Tailored to what actually works for your brand. 📈
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setShowPublishPopup(false)} style={{padding:"10px 20px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:13,color:C.text,fontWeight:600}}>Got it</button>
              <button onClick={()=>{setShowPublishPopup(false);setPage("analytics");}} style={{padding:"10px 20px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Check out Analytics →</button>
            </div>
            <div style={{fontSize:11,color:C.muted,marginTop:14}}>📧 We'll remind you by email in 7 days.</div>
          </div>
        </div>
      )}
      {showGoalModal&&<GoalModal month={month} current={goals[month]||0} onSave={async v=>{await setGoal(month,v);setShowGoalModal(false);if(tourNext!==null){showStep(tourNext);setTourNext(null);}}} onClose={()=>setShowGoalModal(false)}/>}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:sh}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Logo/><div style={{fontSize:14,fontWeight:500,color:"#111",letterSpacing:-0.2}}>ContentHub <span style={{fontWeight:400,color:"#888",fontSize:13}}>Sidekick</span></div></div>
          <span style={{background:C.accent+"18",color:C.accent,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20}}>Business</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          {[["dashboard","Dashboard"],["campaigns","Campaigns"],["analytics","Analytics"]].map(([id,label])=>(
            <button key={id} onClick={()=>setPage(id)} style={{padding:"5px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:page===id?600:400,color:page===id?C.text:C.muted,background:page===id?C.light:"transparent",borderRadius:7}}>{label}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:11,color:C.muted}}>{profile?.name||user.email}</span>
<button onClick={onLogout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}}>Sign out</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {page==="dashboard"&&<CreatorDashboard videos={videos} goals={goals} month={month} onMonthChange={setMonth} onSetGoal={setGoal} onAddVideo={(v)=>{addV(v);if(tourNext!==null){showStep(tourNext);setTourNext(null);}}} onMoveVideo={(id,st,pd)=>{moveV(id,st,pd);if(tourStep===4&&st==="published")showStep(5);if(st==="published"&&!localStorage.getItem(`sk_pub_${user.id}`)){localStorage.setItem(`sk_pub_${user.id}`,"1");setTimeout(()=>setShowPublishPopup(true),800);}}} onMetrics={saveM} onDeleteVideo={delV} userId={user.id} refGoal={refGoal} refAdd={refAdd} refStages={refStages} refPublished={refPublished} refLock={refLock} tourStep={tourStep} showAddFromTour={showAddFromTour} onAddFromTourDone={()=>{setShowAddFromTour(false);}} onTourNext={()=>{if(tourNext!==null){showStep(tourNext);setTourNext(null);}}} businessProfile={businessProfile} onSaveScript={saveScript} onSaveShotList={saveShotList} onSaveEditAdvice={saveEditAdvice}/>}
        {page==="campaigns"&&<CampaignCreator userId={user.id} businessProfile={businessProfile} videos={videos} onSendToPipeline={(ideas)=>{ideas.forEach(v=>addV({...v,id:"v"+uid(),month:curMonth(),stage:"idea",createdAt:new Date().toISOString()}));setPage("dashboard");}}/>}
        {page==="analytics"&&<CreatorAnalytics videos={videos}/>}
      </div>
    </div>
  );
}



// ── NOTES PANEL ───────────────────────────────────────────────────────────────
function NotesPanel({video,workspaceId,userId,userName,onClose,onSendBack}){
  const[notes,setNotes]=useState([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(true);
  const[sending,setSending]=useState(false);
  const[showSendBack,setShowSendBack]=useState(false);
  const[sendBackNote,setSendBackNote]=useState("");
  const bottomRef=useRef(null);

  useEffect(()=>{
    getNotes(workspaceId,video.id).then(n=>{setNotes(n||[]);setLoading(false);});
  },[video.id,workspaceId]);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[notes]);

  const send=async()=>{
    if(!input.trim()||sending)return;
    setSending(true);
    await addNote(workspaceId,video.id,userId,userName,input.trim());
    setNotes(prev=>[...prev,{author_name:userName,note:input.trim(),created_at:new Date().toISOString()}]);
    setInput("");
    setSending(false);
  };

  const handleSendBack=async()=>{
    if(!sendBackNote.trim())return;
    await addNote(workspaceId,video.id,userId,userName,`↩ Sent back: ${sendBackNote.trim()}`);
    onSendBack&&onSendBack(video.id,sendBackNote.trim());
    onClose();
  };

  const timeAgo=d=>{
    const m=Math.floor((new Date()-new Date(d))/60000);
    if(m<1)return"just now";if(m<60)return`${m}m ago`;
    const h=Math.floor(m/60);if(h<24)return`${h}h ago`;
    return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"flex-end",zIndex:999,fontFamily:"system-ui"}}>
      <div style={{background:C.surface,width:"min(380px,100vw)",height:"100vh",display:"flex",flexDirection:"column",boxShadow:"-4px 0 20px rgba(0,0,0,.15)"}}>
        {/* Header */}
        <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>📝 Notes</div>
              <div style={{fontSize:11,color:C.muted,maxWidth:280,lineHeight:1.3}}>{video.title}</div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:4,flexShrink:0}}>×</button>
          </div>
          {/* Send back button for review stage */}
          {video.stage==="review"&&!showSendBack&&(
            <button onClick={()=>setShowSendBack(true)} style={{marginTop:10,width:"100%",padding:"8px 0",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,color:"#92400E"}}>
              ↩ Send back to Editing
            </button>
          )}
          {showSendBack&&(
            <div style={{marginTop:10}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>What needs to be changed? (required)</div>
              <textarea value={sendBackNote} onChange={e=>setSendBackNote(e.target.value)} placeholder="e.g. The hook needs to be stronger, change the first 3 seconds..." style={{...inp,height:72,resize:"none",fontSize:12,fontFamily:"system-ui",marginBottom:8}} autoFocus/>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setShowSendBack(false)} style={{flex:1,padding:"7px 0",background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,cursor:"pointer",fontSize:12,color:C.text}}>Cancel</button>
                <button onClick={handleSendBack} disabled={!sendBackNote.trim()} style={{flex:1,padding:"7px 0",background:sendBackNote.trim()?"#F97316":"#E2E8F0",color:sendBackNote.trim()?"#FFF":C.muted,border:"none",borderRadius:7,cursor:sendBackNote.trim()?"pointer":"not-allowed",fontSize:12,fontWeight:700}}>Send back ↩</button>
              </div>
            </div>
          )}
        </div>

        {/* Notes list */}
        <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
          {loading&&<div style={{textAlign:"center",color:C.muted,fontSize:12,marginTop:20}}>Loading notes...</div>}
          {!loading&&notes.length===0&&<div style={{textAlign:"center",color:C.muted,fontSize:12,marginTop:40,lineHeight:1.6}}>No notes yet.<br/>Leave feedback for your team here.</div>}
          {notes.map((n,i)=>(
            <div key={i} style={{background:n.note.startsWith("↩")?`#FEF3C7`:C.light,borderRadius:10,padding:"10px 12px",border:`1px solid ${n.note.startsWith("↩")?"#FCD34D":C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:11,fontWeight:700,color:C.text}}>{n.author_name||"Team"}</span>
                <span style={{fontSize:10,color:C.muted}}>{timeAgo(n.created_at)}</span>
              </div>
              <div style={{fontSize:12,color:C.text,lineHeight:1.6}}>{n.note}</div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Leave a note... (Shift+Enter for new line)" style={{...inp,resize:"none",height:38,fontSize:12,lineHeight:1.5,fontFamily:"system-ui",flex:1}}/>
          <button onClick={send} disabled={sending||!input.trim()} style={{padding:"8px 14px",background:sending||!input.trim()?C.border:C.text,color:sending||!input.trim()?C.muted:"#FFF",border:"none",borderRadius:8,cursor:sending||!input.trim()?"not-allowed":"pointer",fontSize:12,fontWeight:700,flexShrink:0}}>Send</button>
        </div>
      </div>
    </div>
  );
}


// ── CLIENT PROFILE SETUP ──────────────────────────────────────────────────────
const CLIENT_QUESTIONS = [
  {key:"whatTheyDo",  label:"What does this client do?",         hint:"One sentence about their business",                   placeholder:"A boutique gym in Austin helping busy professionals get fit"},
  {key:"audience",    label:"Who is their target audience?",      hint:"Who watches or buys from them",                      placeholder:"25-40 year old professionals who want to work out but have no time"},
  {key:"goal",        label:"What is their content goal?",        hint:"What should viewers do after watching?",             placeholder:"Book a free trial class or visit the gym"},
  {key:"tone",        label:"How does their brand sound?",        hint:"Describe their voice — this shapes the creative directions suggested for their content", placeholder:"Energetic and motivating, never pushy or corporate"},
];

function ClientProfileSetup({client,onComplete,onSkip}){
  const[step,setStep]=useState(0);
  const[vals,setVals]=useState({whatTheyDo:"",audience:"",goal:"",tone:""});
  const q=CLIENT_QUESTIONS[step];
  const isLast=step===CLIENT_QUESTIONS.length-1;
  const canNext=vals[q?.key]?.trim().length>0;

  const next=()=>{
    if(isLast){onComplete(vals);return;}
    setStep(s=>s+1);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui",padding:24}}>
      <div style={{width:"min(480px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"36px 32px"}}>
        {/* Progress */}
        <div style={{display:"flex",gap:6,marginBottom:24}}>
          {CLIENT_QUESTIONS.map((_,i)=>(
            <div key={i} style={{height:4,borderRadius:20,flex:i===step?3:1,background:i<=step?BRAND.blue:C.border,transition:"all .3s"}}/>
          ))}
        </div>
        {/* Client name badge */}
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.light,border:`1px solid ${C.border}`,borderRadius:20,padding:"3px 10px",marginBottom:14,fontSize:11,color:C.muted}}>
          <span>{client.emoji}</span><span style={{fontWeight:600,color:C.text}}>{client.name}</span>
        </div>
        <div style={{fontSize:11,fontWeight:600,color:C.accent,letterSpacing:0.5,marginBottom:6}}>{step+1} of {CLIENT_QUESTIONS.length}</div>
        <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:5,letterSpacing:-0.3,lineHeight:1.3}}>{q.label}</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.5}}>{q.hint}</div>
        <input
          key={q.key}
          autoFocus
          value={vals[q.key]}
          onChange={e=>setVals(p=>({...p,[q.key]:e.target.value}))}
          onKeyDown={e=>e.key==="Enter"&&canNext&&next()}
          placeholder={q.placeholder}
          style={{...inp,fontSize:14,padding:"12px 14px",marginBottom:20}}
        />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onSkip} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0}}>Skip for now</button>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0}}>← Back</button>}
            <button onClick={next} disabled={!canNext} style={{padding:"10px 22px",background:canNext?"#111":C.border,color:canNext?"#FFF":C.muted,border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:canNext?"pointer":"not-allowed"}}>
              {isLast?"Save client profile ✓":"Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AGENCY DASHBOARD ──────────────────────────────────────────────────────────
function AgencyDashboard({clients,videos,targets,month,onMonthChange,onSelectClient,onAddClient,onSetTarget,businessProfile}){
  const[showAddClient,setShowAddClient]=useState(false);
  const[newName,setNewName]=useState("");
  const[newEmoji,setNewEmoji]=useState("🏢");
  const[showEmoji,setShowEmoji]=useState(false);
  const[pendingProfileClient,setPendingProfileClient]=useState(null);
  const EMOJIS=["🏢","🍕","💪","✂️","🛍️","🍔","☕","🏠","💄","🎵","🐾","🌿","👗","🚗","📚","🎮","🏋️","🍜","🌮","🏪"];

  const addClient=async()=>{
    if(!newName.trim())return;
    const newClient=await onAddClient(newName.trim(),newEmoji);
    setNewName("");setNewEmoji("🏢");setShowAddClient(false);
    // Trigger client profile setup
    if(newClient){setPendingProfileClient(newClient);}
  };

  const totalGoal=clients.reduce((s,c)=>{const t=targets.find(t=>t.client_id===c.id&&t.month===month);return s+(t?.goal||0);},0);
  const totalPub=clients.reduce((s,c)=>s+videos.filter(v=>v.client_id===c.id&&v.month===month&&v.stage==="published").length,0);
  const pct=totalGoal>0?Math.min(100,Math.round(totalPub/totalGoal*100)):0;

  return(
    <div>
      {/* Month nav */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <button onClick={()=>onMonthChange(addMonths(month,-1))} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:13}}>←</button>
          <div style={{fontSize:15,fontWeight:700,color:C.text,minWidth:125,textAlign:"center"}}>{monthLabel(month)}</div>
          <button onClick={()=>onMonthChange(addMonths(month,1))} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:13}}>→</button>
        </div>
        <Btn primary onClick={()=>setShowAddClient(true)}>+ Add client</Btn>
      </div>

      {/* Agency progress bar */}
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
          <div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:1,fontWeight:600,marginBottom:3}}>AGENCY PROGRESS — {monthLabel(month)}</div>
            <div style={{fontSize:20,fontWeight:800,color:pct===100?C.green:C.accent}}>{totalGoal===0?"Set targets per client to track progress":pct===100?"🎉 All targets hit!":pct+"%  complete across all clients"}</div>
          </div>
          {totalGoal>0&&<div style={{textAlign:"right"}}><div style={{fontSize:26,fontWeight:900,color:C.text}}>{totalPub}<span style={{fontSize:14,color:C.muted}}>/{totalGoal}</span></div><div style={{fontSize:11,color:C.muted}}>videos published</div></div>}
        </div>
        {totalGoal>0&&<><div style={{background:C.light,borderRadius:20,height:9,overflow:"hidden",marginBottom:6}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?BRAND.green:`linear-gradient(90deg,${BRAND.red},${BRAND.blue})`,borderRadius:20,transition:"width .4s"}}/></div><div style={{fontSize:11,color:C.muted}}>{clients.length} clients · {totalGoal-totalPub} videos remaining</div></>}
      </Card>

      {/* Client grid */}
      {clients.length===0?(
        <Card style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:36,marginBottom:10}}>🏛️</div>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>No clients yet</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Add your first client to start building their content pipeline.</div>
          <Btn primary onClick={()=>setShowAddClient(true)}>+ Add your first client</Btn>
        </Card>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:13}}>
          {clients.map(client=>{
            const cVids=videos.filter(v=>v.client_id===client.id&&v.month===month);
            const target=targets.find(t=>t.client_id===client.id&&t.month===month);
            const goal=target?.goal||0;
            const pub=cVids.filter(v=>v.stage==="published").length;
            const inProg=cVids.filter(v=>v.stage!=="published").length;
            const cpct=goal>0?Math.min(100,Math.round(pub/goal*100)):null;
            const health=cpct===null?"gray":cpct>=80?C.green:cpct>=40?C.amber:C.red;
            return(
              <div key={client.id} onClick={()=>onSelectClient(client)} style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:sh,padding:18,cursor:"pointer",transition:"box-shadow .15s,transform .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow=sh;e.currentTarget.style.transform="none";}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:10,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{client.emoji||"🏢"}</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>{client.name}</div>
                  </div>
                  <div style={{width:10,height:10,borderRadius:"50%",background:health}}/>
                </div>
                {goal>0?(
                  <>
                    <div style={{background:C.light,borderRadius:20,height:6,overflow:"hidden",marginBottom:7}}><div style={{width:`${cpct}%`,height:"100%",background:health,borderRadius:20,transition:"width .3s"}}/></div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted}}>
                      <span>{pub}/{goal} published</span>
                      <span>{inProg} in progress</span>
                    </div>
                  </>
                ):(
                  <div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>No target set for this month</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Client profile setup after adding */}
      {pendingProfileClient&&(
        <ClientProfileSetup
          client={pendingProfileClient}
          onComplete={async(profile)=>{
            await sbUpdate("agency_clients","id",pendingProfileClient.id,{client_profile:profile});
            setPendingProfileClient(null);
          }}
          onSkip={()=>setPendingProfileClient(null)}
        />
      )}
      {/* Add client modal */}
      {showAddClient&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(380px,95vw)",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:800,color:C.text}}>Add a client</div>
              <button onClick={()=>setShowAddClient(false)} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>×</button>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,position:"relative"}}>
              <button onClick={()=>setShowEmoji(e=>!e)} style={{width:46,height:46,border:`1px solid ${C.border}`,borderRadius:10,background:C.light,fontSize:22,cursor:"pointer",flexShrink:0}}>{newEmoji}</button>
              {showEmoji&&<div style={{position:"absolute",top:"110%",left:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:8,zIndex:99,display:"flex",flexWrap:"wrap",width:196,gap:3,boxShadow:shMd}}>{EMOJIS.map(e=><button key={e} onClick={()=>{setNewEmoji(e);setShowEmoji(false);}} style={{width:32,height:32,border:"none",background:"none",cursor:"pointer",fontSize:18,borderRadius:6}}>{e}</button>)}</div>}
              <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addClient()} placeholder="Client name..." style={{...inp,flex:1}}/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setShowAddClient(false)}>Cancel</Btn><Btn onClick={addClient} primary>Add client ✓</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AGENCY CLIENT PIPELINE ──────────────────────────────────────────────────
function AgencyClientPipeline({client,videos,target,month,workspaceId,userId,userName,onAddVideo,onMoveVideo,onMetrics,onDeleteVideo,onSetTarget,onBack}){
  const[showAdd,setShowAdd]=useState(false);
  const[showGoal,setShowGoal]=useState(false);
  const[metricsVid,setMetricsVid]=useState(null);
  const[overrideVid,setOverrideVid]=useState(null);
  const[publishDateModal,setPublishDateModal]=useState(null);
  const[publishDateVal,setPublishDateVal]=useState("");
  const[confirmDel,setConfirmDel]=useState(null);
  const[notesVid,setNotesVid]=useState(null);
  const[aiCard,setAiCard]=useState(null);
  const[scriptCard,setScriptCard]=useState(null);
  const[shootCard,setShootCard]=useState(null);
  const[shootViewCard,setShootViewCard]=useState(null);
  const[editCard,setEditCard]=useState(null);
  const[editViewCard,setEditViewCard]=useState(null);

  const goal=target?.goal||0;
  const mVids=videos.filter(v=>v.month===month);
  const pub=mVids.filter(v=>v.stage==="published").length;
  const pct=goal>0?Math.min(100,Math.round(pub/goal*100)):null;
  const emptyCount=Math.max(0,goal-mVids.length);
  const PLT={TikTok:"📱","Instagram Reels":"📸","YouTube Shorts":"🎬",YouTube:"▶️",Facebook:"👥",LinkedIn:"💼"};

  const handleMove=(id,newStage)=>{
    if(newStage==="published"){setPublishDateVal(new Date().toISOString().slice(0,10));setPublishDateModal({id,newStage});}
    else onMoveVideo(id,newStage);
  };

  const handleSendBack=(id,note)=>{
    onMoveVideo(id,"editing");
  };

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <button onClick={onBack} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,color:C.muted}}>← All clients</button>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          <span style={{fontSize:22}}>{client.emoji||"🏢"}</span>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>{client.name}</div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <button onClick={()=>setShowGoal(true)} style={{padding:"6px 13px",border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted,fontWeight:600}}>🎯 {goal>0?`${goal} videos`:"Set goal"}</button>
          <Btn primary onClick={()=>setShowAdd(true)}>+ Add idea</Btn>
        </div>
      </div>

      {/* Progress */}
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
          <div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:1,fontWeight:600,marginBottom:3}}>{client.name.toUpperCase()} — {monthLabel(month)}</div>
            <div style={{fontSize:18,fontWeight:800,color:pct===100?C.green:C.accent}}>{goal===0?"Set a goal to track progress":pct===100?"🎉 Target hit!":pct+"%  complete"}</div>
          </div>
          {goal>0&&<div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:900,color:C.text}}>{pub}<span style={{fontSize:13,color:C.muted}}>/{goal}</span></div><div style={{fontSize:11,color:C.muted}}>published</div></div>}
        </div>
        {goal>0&&<><div style={{background:C.light,borderRadius:20,height:8,overflow:"hidden",marginBottom:5}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?BRAND.green:`linear-gradient(90deg,${BRAND.red},${BRAND.blue})`,borderRadius:20,transition:"width .4s"}}/></div><div style={{fontSize:11,color:C.muted}}>{mVids.filter(v=>v.stage!=="published").length} in progress · {Math.max(0,goal-pub)} remaining</div></>}
      </Card>

      {/* 5-stage Kanban */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9}}>
        {AGENCY_STAGES.map(stage=>{
          const cards=mVids.filter(v=>v.stage===stage.id);
          const isReview=stage.id==="review";
          return(
            <div key={stage.id}
              onDragOver={e=>e.preventDefault()}
              onDragEnter={e=>{e.currentTarget.style.background=stage.color+"18";e.currentTarget.style.outline=`2px dashed ${stage.color}`;}}
              onDragLeave={e=>{e.currentTarget.style.background=C.light;e.currentTarget.style.outline="none";}}
              onDrop={e=>{e.preventDefault();e.currentTarget.style.background=C.light;e.currentTarget.style.outline="none";const vid=e.dataTransfer.getData("videoId");const from=e.dataTransfer.getData("fromStage");if(vid&&from!==stage.id)handleMove(vid,stage.id);}}
              style={{background:isReview?"#FFF7ED":C.light,borderRadius:10,padding:9,transition:"background .15s",border:isReview?"1px solid #FED7AA":"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:stage.color}}/><div style={{fontSize:10,fontWeight:700,color:C.text,lineHeight:1.2}}>{stage.label}</div></div>
                <span style={{fontSize:10,fontWeight:700,background:stage.color+"22",color:stage.color,padding:"1px 6px",borderRadius:20}}>{cards.length}</span>
              </div>
              {cards.map(v=>{
                const isPub=v.stage==="published";
                const isRev=v.stage==="review";
                const daysGone=daysSince(v.publishDate||v.createdAt);
                const unlocked=isPub&&daysGone>=7;
                const hasMet=v.metricsAdded;
                const lockPct=Math.min(100,Math.round((daysGone/7)*100));
                const unlockDate=()=>{const d=new Date(v.publishDate||v.createdAt);d.setDate(d.getDate()+7);return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});};
                const isCf=confirmDel===v.id;
                return(
                  <div key={v.id} draggable
                    onDragStart={e=>{e.dataTransfer.setData("videoId",v.id);e.dataTransfer.setData("fromStage",stage.id);e.currentTarget.style.opacity="0.35";e.currentTarget.style.transform="rotate(1.5deg) scale(1.02)";}}
                    onDragEnd={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}
                    style={{background:C.surface,borderRadius:10,marginBottom:8,border:`1px solid ${isRev?"#FED7AA":hasMet?"#BBF7D0":C.border}`,boxShadow:isRev?"0 2px 8px rgba(249,115,22,.15)":"0 1px 4px rgba(0,0,0,.06)",cursor:"grab",display:"flex",overflow:"hidden",transition:"box-shadow .15s,transform .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow=isRev?"0 2px 8px rgba(249,115,22,.15)":"0 1px 4px rgba(0,0,0,.06)";e.currentTarget.style.transform="none";}}>
                    <div style={{width:5,background:stage.color,flexShrink:0,borderRadius:"10px 0 0 10px"}}/>
                    <div style={{padding:"10px 11px",flex:1,minWidth:0}}>
                      {isRev&&<div style={{fontSize:9,fontWeight:700,background:"#FEF3C7",color:"#92400E",padding:"2px 7px",borderRadius:20,marginBottom:6,display:"inline-block"}}>⏳ Pending review</div>}
                      <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:5,lineHeight:1.3,wordBreak:"break-word"}}>{v.title}</div>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:7,flexWrap:"wrap"}}>
                        <span style={{fontSize:9,color:C.muted,background:C.light,padding:"2px 6px",borderRadius:20,border:`1px solid ${C.border}`}}>{PLT[v.platform]||"📱"} {v.platform}</span>
                        {v.targetDate&&<span style={{fontSize:9,color:C.muted}}>📅 {v.targetDate}</span>}
                      </div>
                      {isPub&&!hasMet&&!unlocked&&(<div style={{marginBottom:7,padding:"6px 8px",background:"#F8FAFC",borderRadius:6,border:`1px solid ${C.border}`}}><div style={{fontSize:9,fontWeight:600,color:C.muted,marginBottom:4}}>📅 Come back {unlockDate()} for metrics</div><div style={{background:C.border,borderRadius:20,height:3,overflow:"hidden"}}><div style={{width:`${lockPct}%`,height:"100%",background:lockPct>=85?C.green:C.accent,borderRadius:20}}/></div></div>)}
                      {isPub&&!hasMet&&unlocked&&(<div style={{marginBottom:7,padding:"6px 8px",background:"#DCFCE7",borderRadius:6,border:"1px solid #BBF7D0",display:"flex",alignItems:"center",gap:5}}><span>✅</span><span style={{fontSize:10,fontWeight:700,color:C.green}}>Ready for metrics</span></div>)}
                      {hasMet&&<div style={{marginBottom:7,padding:"4px 8px",background:"#DCFCE7",borderRadius:6,display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:9,fontWeight:700,color:C.green}}>📊 Metrics added</span></div>}
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                        {/* Notes button — always visible */}
                        <button onClick={()=>setNotesVid(v)} style={{fontSize:9,padding:"3px 8px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.muted,fontWeight:500}}>📝 Notes</button>
                        {/* Review stage — Approve button */}
                        {isRev&&<button onClick={()=>handleMove(v.id,"published")} style={{fontSize:9,padding:"3px 8px",background:C.green,border:"none",borderRadius:20,cursor:"pointer",color:"#FFF",fontWeight:700}}>✓ Approve</button>}
                        {/* AI tools */}
                        {(stage.id==="idea"||stage.id==="production")&&(v.script?<button onClick={()=>setScriptCard(v)} style={{fontSize:9,padding:"3px 8px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:20,cursor:"pointer",color:C.green,fontWeight:600}}>📄 Script</button>:<button onClick={()=>setAiCard(v)} style={{fontSize:9,padding:"3px 8px",background:"#EDE9FE",border:"1px solid #C4B5FD",borderRadius:20,cursor:"pointer",color:"#7C3AED",fontWeight:600}}>✨ Script AI</button>)}
                        {stage.id==="production"&&(v.shotList?<button onClick={()=>setShootViewCard(v)} style={{fontSize:9,padding:"3px 8px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:20,cursor:"pointer",color:"#92400E",fontWeight:600}}>🎬 Shots</button>:<button onClick={()=>setShootCard(v)} style={{fontSize:9,padding:"3px 8px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:20,cursor:"pointer",color:"#92400E",fontWeight:600}}>🎥 Plan</button>)}
                        {stage.id==="editing"&&(v.editAdvice?<button onClick={()=>setEditViewCard(v)} style={{fontSize:9,padding:"3px 8px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:20,cursor:"pointer",color:C.green,fontWeight:600}}>✂️ Edit</button>:<button onClick={()=>setEditCard(v)} style={{fontSize:9,padding:"3px 8px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:20,cursor:"pointer",color:C.green,fontWeight:600}}>✨ Edit AI</button>)}
                        {isPub&&!hasMet&&unlocked&&<button onClick={()=>setMetricsVid(v)} style={{fontSize:9,padding:"3px 8px",background:C.green,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>📊 Metrics</button>}
                        {!isCf&&<button onClick={()=>setConfirmDel(v.id)} style={{fontSize:9,padding:"3px 6px",background:"none",border:"none",cursor:"pointer",color:C.muted,marginLeft:"auto"}}>🗑</button>}
                        {isCf&&<div style={{display:"flex",gap:3,alignItems:"center",marginLeft:"auto"}}><span style={{fontSize:9,color:C.red,fontWeight:700}}>Delete?</span><button onClick={()=>{onDeleteVideo(v.id);setConfirmDel(null);}} style={{fontSize:9,padding:"1px 6px",background:C.red,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>Yes</button><button onClick={()=>setConfirmDel(null)} style={{fontSize:9,padding:"1px 6px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>No</button></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {stage.id==="idea"&&goal===0&&cards.length===0&&<div style={{textAlign:"center",padding:"14px 6px",color:C.muted,fontSize:10,border:`1px dashed ${C.border}`,borderRadius:8,background:C.bg,lineHeight:1.5}}>Set a goal<br/>to fill pipeline</div>}
              {stage.id==="idea"&&[...Array(emptyCount)].map((_,i)=><div key={`e${i}`} onClick={()=>setShowAdd(true)} style={{background:C.surface,borderRadius:8,padding:10,marginBottom:7,border:`1px dashed ${C.border}`,cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.blue;e.currentTarget.style.background="#EFF6FF";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}><div style={{fontSize:14,marginBottom:2}}>+</div><div style={{fontSize:9,fontWeight:700,color:C.muted}}>Fill me out</div></div>)}
              {cards.length===0&&stage.id!=="idea"&&<div style={{textAlign:"center",padding:"14px 6px",color:C.muted,fontSize:10,border:`1px dashed ${C.border}`,borderRadius:7,background:C.bg}}>Nothing here</div>}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showGoal&&<GoalModal month={month} current={goal} onSave={v=>{onSetTarget(client.id,month,v);setShowGoal(false);}} onClose={()=>setShowGoal(false)}/>}
      {showAdd&&<AddVideoModal month={month} onSave={v=>{onAddVideo({...v,clientId:client.id,workspaceId});setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
      {publishDateModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,.2)",width:"min(380px,95vw)",padding:26}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:6}}>📱 When did you publish this?</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:18,lineHeight:1.5}}>If published more than 7 days ago, metrics unlock immediately.</div>
            <div style={{marginBottom:18}}><div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>Publish date</div><input type="date" value={publishDateVal} onChange={e=>setPublishDateVal(e.target.value)} style={{...inp}}/></div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setPublishDateModal(null)}>Cancel</Btn><button onClick={()=>{if(!publishDateVal)return;onMoveVideo(publishDateModal.id,"published",publishDateVal);setPublishDateModal(null);}} style={{padding:"8px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Mark as published ✓</button></div>
          </div>
        </div>
      )}
      {overrideVid&&(<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}><div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,.2)",width:"min(380px,95vw)",padding:26}}><div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:6}}>📊 Add metrics early</div><div style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.5}}>If you already have the numbers, go ahead.</div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setOverrideVid(null)}>Cancel</Btn><button onClick={()=>{setMetricsVid(overrideVid);setOverrideVid(null);}} style={{padding:"8px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Add metrics now →</button></div></div></div>)}
      {metricsVid&&<MetricsModal video={metricsVid} onSave={m=>{onMetrics(metricsVid.id,m);setMetricsVid(null);}} onClose={()=>setMetricsVid(null)}/>}
      {notesVid&&<NotesPanel video={notesVid} workspaceId={workspaceId} userId={userId} userName={userName} onClose={()=>setNotesVid(null)} onSendBack={(id,note)=>{handleSendBack(id,note);setNotesVid(null);}}/>}
      {scriptCard&&<ScriptViewer card={scriptCard} businessProfile={null} onSave={()=>setScriptCard(null)} onRewrite={()=>{setAiCard(scriptCard);setScriptCard(null);}} onClose={()=>setScriptCard(null)}/>}
      {aiCard&&(()=>{return <AIScriptChat card={aiCard} businessProfile={null} analytics={{topHook:null,topFormat:null}} onSaveScript={()=>setAiCard(null)} onClose={()=>setAiCard(null)}/>;})()}
      {shootCard&&<ShootDirector card={shootCard} businessProfile={null} onSaveShotList={()=>setShootCard(null)} onClose={()=>setShootCard(null)}/>}
      {shootViewCard&&<ShotListViewer card={shootViewCard} businessProfile={null} onSave={()=>setShootViewCard(null)} onReplan={()=>{setShootCard(shootViewCard);setShootViewCard(null);}} onClose={()=>setShootViewCard(null)}/>}
      {editCard&&<EditAdviceGenerator card={editCard} businessProfile={null} analytics={{topHook:null,topFormat:null}} onSave={()=>setEditCard(null)} onClose={()=>setEditCard(null)}/>}
      {editViewCard&&<EditAdviceViewer card={editViewCard} onRegenerate={()=>{setEditCard(editViewCard);setEditViewCard(null);}} onClose={()=>setEditViewCard(null)}/>}
    </div>
  );
}

// ── AGENCY APP ────────────────────────────────────────────────────────────────
function AgencyApp({user,profile,onLogout}){
  const[clients,setClients]=useState([]);
  const[videos,setVideos]=useState([]);
  const[targets,setTargets]=useState([]);
  const[month,setMonth]=useState(curMonth());
  const[selectedClient,setSelectedClient]=useState(null);
  const[loading,setLoading]=useState(true);
  const[needsOnboarding,setNeedsOnboarding]=useState(false);
  const[wsId,setWsId]=useState(null);

  const load=useCallback(async()=>{
    const mem=await getWorkspaceMember(user.id);
    if(!mem){setNeedsOnboarding(true);setLoading(false);return;}
    const wid=mem.workspace_id;
    setWsId(wid);
    const[cls,vids,tgts]=await Promise.all([
      sbGetWhere("agency_clients","workspace_id",wid,"&order=created_at.asc"),
      sbGetWhere("agency_videos","workspace_id",wid,"&order=created_at.desc"),
      sbGetWhere("agency_targets","workspace_id",wid),
    ]);
    setClients(cls||[]);
    setVideos((vids||[]).map(r=>({id:r.id,clientId:r.client_id,workspaceId:r.workspace_id,title:r.title,platform:r.platform,stage:r.stage,targetDate:r.target_date,publishDate:r.publish_date,url:r.url||"",hook:r.hook||"",format:r.format||"",cta:r.cta||"",views:r.views||0,likes:r.likes||0,comments:r.comments||0,shares:r.shares||0,saves:r.saves||0,paraTi:r.para_ti,siguiendo:r.siguiendo,busqueda:r.busqueda,metricsAdded:r.metrics_added||false,script:r.script||"",shotList:r.shot_list||"",editAdvice:r.edit_advice||"",month:r.month,createdAt:r.created_at})));
    setTargets(tgts||[]);
    setLoading(false);
  },[user.id]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{const p=setInterval(load,60000);return()=>clearInterval(p);},[load]);

  const handleOnboardingComplete=async(newWsId)=>{setWsId(newWsId);setNeedsOnboarding(false);await load();};

  const addClient=useCallback(async(name,emoji)=>{
    const id="c"+uid();
    const newClient={id,name,emoji,workspace_id:wsId,client_profile:null};
    setClients(prev=>[...prev,newClient]);
    await sbInsert("agency_clients",{id,workspace_id:wsId,name,emoji,created_at:new Date().toISOString()});
    await load();
    return newClient;
  },[wsId,load]);

  const addVideo=useCallback(async(v)=>{
    const newV={id:v.id,clientId:v.clientId,workspaceId:wsId,title:v.title,platform:v.platform||"TikTok",stage:"idea",targetDate:v.targetDate||null,publishDate:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,paraTi:null,siguiendo:null,busqueda:null,metricsAdded:false,script:"",shotList:"",editAdvice:"",month:v.month||month,createdAt:new Date().toISOString()};
    setVideos(prev=>[newV,...prev]);
    await sbInsert("agency_videos",{id:v.id,workspace_id:wsId,client_id:v.clientId,title:v.title,platform:v.platform||"TikTok",stage:"idea",target_date:v.targetDate||null,publish_date:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,para_ti:null,siguiendo:null,busqueda:null,metrics_added:false,script:"",shot_list:"",edit_advice:"",month:v.month||month,created_at:new Date().toISOString()});
    await load();
  },[wsId,month,load]);

  const moveVideo=useCallback(async(id,st,pd)=>{
    const pubD=pd||(st==="published"?new Date().toISOString().slice(0,10):undefined);
    setVideos(prev=>prev.map(v=>v.id===id?{...v,stage:st,publishDate:pubD||v.publishDate}:v));
    const up={stage:st};if(st==="published"&&pubD)up.publish_date=pubD;
    await sbUpdate("agency_videos","id",id,up);
    await load();
  },[load]);

  const saveMetrics=useCallback(async(id,m)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,...m,metricsAdded:true}:v));
    await sbUpdate("agency_videos","id",id,{url:m.url||"",hook:m.hook||"",format:m.format||"",cta:m.cta||"",views:m.views||0,likes:m.likes||0,comments:m.comments||0,shares:m.shares||0,saves:m.saves||0,para_ti:m.paraTi||null,siguiendo:m.siguiendo||null,busqueda:m.busqueda||null,pauta:0,metrics_added:true});
    await load();
  },[load]);

  const deleteVideo=useCallback(async(id)=>{
    setVideos(prev=>prev.filter(v=>v.id!==id));
    await sbDelete("agency_videos","id",id);
  },[]);

  const setTarget=useCallback(async(clientId,mo,goal)=>{
    setTargets(prev=>{const ex=prev.find(t=>t.client_id===clientId&&t.month===mo);if(ex)return prev.map(t=>t.client_id===clientId&&t.month===mo?{...t,goal}:t);return[...prev,{client_id:clientId,month:mo,goal,workspace_id:wsId}];});
    await sbUpsert("agency_targets",{workspace_id:wsId,client_id:clientId,month:mo,goal},"workspace_id,client_id,month");
  },[wsId]);

  if(loading)return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:C.text}}>ContentHub Sidekick</div><div style={{fontSize:12,color:C.muted,marginTop:5}}>Loading your agency...</div></div></div>);
  if(needsOnboarding)return<AgencyOnboarding user={user} onComplete={handleOnboardingComplete}/>;

  const clientVids=selectedClient?videos.filter(v=>v.clientId===selectedClient.id):[];
  const clientTarget=selectedClient?targets.find(t=>t.client_id===selectedClient.id&&t.month===month):null;

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:sh}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Logo/><div style={{fontSize:14,fontWeight:500,color:"#111",letterSpacing:-0.2}}>ContentHub <span style={{fontWeight:400,color:"#888",fontSize:13}}>Sidekick</span></div></div>
          <span style={{background:"#EDE9FE",color:"#7C3AED",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20}}>Agency</span>
          {selectedClient&&<div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8}}><span style={{color:C.muted,fontSize:12}}>›</span><span style={{fontSize:13,fontWeight:600,color:C.text}}>{selectedClient.emoji} {selectedClient.name}</span></div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:C.muted}}>{profile?.name||user.email}</span>
          <button onClick={onLogout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}}>Sign out</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {!selectedClient
          ?<AgencyDashboard clients={clients} videos={videos} targets={targets} month={month} onMonthChange={setMonth} onSelectClient={c=>{setSelectedClient(c);}} onAddClient={addClient} onSetTarget={setTarget}/>
          :<AgencyClientPipeline client={selectedClient} videos={clientVids} target={clientTarget} month={month} workspaceId={wsId} userId={user.id} userName={profile?.name||user.email} onAddVideo={addVideo} onMoveVideo={moveVideo} onMetrics={saveMetrics} onDeleteVideo={deleteVideo} onSetTarget={setTarget} onBack={()=>setSelectedClient(null)}/>
        }
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

    if(state==="agency")return<AgencyApp user={user} profile={profile} onLogout={logout}/>;
  return null;
}
