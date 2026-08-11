import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
function PlatformIcon({platform}){
  const p=platform||"";
  if(p==="TikTok") return <svg width="13" height="13" viewBox="0 0 24 24" fill="#111" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z"/></svg>;
  if(p==="Instagram Reels"||p==="Instagram") return <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ig2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><rect width="22" height="22" x="1" y="1" rx="5" fill="url(#ig2)"/><rect width="14" height="14" x="5" y="5" rx="3" fill="none" stroke="white" strokeWidth="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="white" strokeWidth="1.8"/><circle cx="16.5" cy="7.5" r="1" fill="white"/></svg>;
  if(p==="YouTube"||p==="YouTube Shorts") return <svg width="14" height="10" viewBox="0 0 24 17" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="17" rx="4" fill="#FF0000"/><polygon points="9,3 20,8.5 9,14" fill="white"/></svg>;
  if(p==="LinkedIn") return <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#0077B5"/><path fill="white" d="M6.5 9h3v9h-3zM8 6a1.75 1.75 0 110 3.5A1.75 1.75 0 018 6zm4.5 3h2.9v1.3c.4-.75 1.4-1.5 2.9-1.5 3.1 0 3.7 2 3.7 4.7V18h-3v-4.2c0-1-.02-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18h-3V9z"/></svg>;
  if(p==="Facebook") return <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#1877F2"/><path fill="white" d="M16 8h-2.5C13 8 13 8.5 13 9v2h3l-.5 3H13v8h-3v-8H8v-3h2V9c0-2.2 1.3-3 3-3h3v2z"/></svg>;
  return <span style={{fontSize:9,fontWeight:600,color:"#888",background:"#F0F0F0",padding:"1px 4px",borderRadius:3}}>{p.slice(0,2).toUpperCase()}</span>;
}



const SB_URL = "https://dtpxqxwhehzyrtmrhiio.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cHhxeHdoZWh6eXJ0bXJoaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODUzNjMsImV4cCI6MjEwMDY2MTM2M30.qeYZV8B2sgF_2LE2hity97reHqg8oaQF1D39HHjFgbU";
let _token = null;

const _h = (x={}) => ({"apikey":SB_KEY,"Content-Type":"application/json","Authorization":`Bearer ${_token||SB_KEY}`,...x});
const sbGet = async (t,p="") => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?select=*${p}`,{headers:_h()}); return r.ok?await r.json():[];} catch(e){return [];} };
const sbGetOne = async (t,c,v) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?${c}=eq.${encodeURIComponent(v)}&select=*&limit=1`,{headers:_h()}); if(!r.ok)return null; const a=await r.json(); return a[0]||null;} catch(e){return null;} };
const sbInsertX = async (t,d) => {
  try {
    const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:"POST",headers:_h({"Prefer":"return=minimal"}),body:JSON.stringify(Array.isArray(d)?d:[d])});
    if(r.ok)return{ok:true,error:null};
    const raw=await r.text();
    let msg=raw;
    try{const j=JSON.parse(raw);msg=j.message||j.hint||j.details||raw;}catch(e){}
    console.error("sbInsert failed:",t,r.status,raw);
    return{ok:false,error:`${r.status} — ${String(msg).slice(0,180)}`};
  } catch(e){ return{ok:false,error:e.message||"Network error"}; }
};
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
// agency_* tables use uuid columns; creator_* use text. A real UUID satisfies both.
const uuid=()=>{
  try{ if(typeof crypto!=="undefined"&&crypto.randomUUID) return crypto.randomUUID(); }catch(e){}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{
    const r=Math.random()*16|0, v=c==="x"?r:((r&0x3)|0x8);
    return v.toString(16);
  });
};
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
    if(!email||!pass){setErr("Please fill in all fields");return;}
    setLoading(true);setErr("");
    if(mode==="signup"){
      const{user,error}=await sbSignUp(email,pass);
      if(error||!user){setErr("Could not create account.");setLoading(false);return;}
      const{user:u2,error:e2}=await sbSignIn(email,pass);
      if(e2||!u2){setErr("Account created — please sign in.");setMode("login");setLoading(false);return;}
      try{localStorage.setItem(`sk_acct_${u2.id}`,path);}catch(e){}
      const pr=await sbInsertX("profiles",{id:u2.id,name:email,email,account_type:path});
      if(!pr.ok)console.error("profiles insert failed:",pr.error);
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
  const save=()=>{if(!f.title.trim())return;onSave({...f,id:uuid(),stage:"idea",month,createdAt:new Date().toISOString()});onClose();};
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
  const wsId = uuid();
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






// ── SCRIPT MOVES ──────────────────────────────────────────────────────────────
// A "move" is a direction, not a line. Each one asks a question the writer answers
// themselves. _base applies everywhere; the platform key adds what's specific to it.
const SCRIPT_MOVES={
  hook:{
    _base:[
      {move:"Accuse them",            ask:"What does your audience do and quietly defend? Say it in six words, no softening.", push:"Read it back. If nobody would argue with it, it isn't an accusation yet."},
      {move:"Ask the wrong question", ask:"Open with something that sounds unrelated to the video. What is it?",                push:"Know the line that connects it back — but don't say it until the body."},
      {move:"Start at the worst moment",ask:"Skip the setup. Where had it already gone wrong?",                                 push:"Delete the first sentence you wrote. Does it still land without it?"},
      {move:"Say the number",         ask:"What single figure makes people stop? Lead with it, bare.",                          push:"Strip the context around it. A number with setup is a report, not a hook."},
      {move:"Admit something",        ask:"What do you leave out when you tell this story to strangers?",                       push:"If saying it costs you nothing, go one level down."},
    ],
    "TikTok":[
      {move:"Talk mid-thought",       ask:"Start as if the camera caught you already talking. What sentence did they walk in on?",push:"No greeting, no name, no 'so basically'. Begin at the verb."},
      {move:"Name what nobody says",  ask:"What does everyone in your world know but never posts?",                             push:"If it feels slightly risky to say out loud, it's the right one."},
    ],
    "Instagram Reels":[
      {move:"Lead with the frame",    ask:"Before a word is spoken, what's on screen? Describe it in one line.",                push:"Would that frame stop you if the sound were off?"},
      {move:"One sentence worth saving",ask:"What single idea would someone screenshot? Write only that.",                      push:"Cut every word that isn't doing work. Saves reward compression."},
    ],
    "YouTube Shorts":[
      {move:"Promise in three seconds",ask:"What do they get by the end? Say it flat, up front.",                              push:"Don't tease it. Teasing costs you the viewers who'd have stayed."},
    ],
    "YouTube":[
      {move:"Earn the ten minutes",   ask:"What can you give here that a 60-second version can't?",                            push:"If the short version would do, make the short version."},
    ],
    "LinkedIn":[
      {move:"Two lines, then the cut",ask:"Only two lines show before 'see more'. What are they?",                             push:"The second line should make stopping there feel unfinished."},
      {move:"Argue with the room",    ask:"What does your industry repeat that you think is wrong?",                           push:"Name who says it. Vague disagreement reads as posturing."},
    ],
    "Facebook":[
      {move:"That's exactly me",      ask:"What moment makes someone see themselves? Name the specific detail.",               push:"Specific beats universal. The detail is what makes it universal."},
    ],
  },
  body:{
    _base:[
      {move:"Show the part that failed",ask:"What went wrong that you'd normally edit out?",                                   push:"That's usually the part people came for."},
      {move:"One idea, no branches", ask:"State your single point in one sentence. Everything else supports it or goes.",      push:"Find the sentence that belongs in a different video. Cut it."},
      {move:"Give the specific",     ask:"Replace your vaguest sentence with a name, a number, or a date.",                    push:"Do it again with the next vaguest one."},
      {move:"Earn it, don't explain it",ask:"What happened that proves your point without you stating it?",                    push:"Now remove the sentence where you state it anyway."},
      {move:"Cut the throat-clearing",ask:"Delete your first two sentences. Where does the body actually start?",              push:"If nothing was lost, they were never the body."},
    ],
    "TikTok":[
      {move:"Keep it under 45",      ask:"Read it aloud and time it. What comes out to stay under 45 seconds?",                push:"Cut the explanation before you cut the story."},
    ],
    "Instagram Reels":[
      {move:"Make the look mean something",ask:"How does the way this looks say the same thing as the words?",                 push:"If the visuals are just b-roll, you have two videos fighting."},
    ],
    "YouTube":[
      {move:"Front-load the payoff", ask:"What's the most valuable thing you say? Move it earlier.",                           push:"Retention is decided long before your best point arrives."},
    ],
    "LinkedIn":[
      {move:"What it cost you",      ask:"What did you actually lose learning this?",                                          push:"The cost is the credential. Advice without it reads as theory."},
    ],
  },
  cta:{
    _base:[
      {move:"Ask what you don't know",ask:"What are you genuinely uncertain about here? Ask that instead.",                    push:"Real questions get real comments. Rhetorical ones get scrolled."},
      {move:"Make it a thought, not an ask",ask:"Rewrite your CTA as something you'd say to one friend.",                      push:"If it still sounds like a request, drop the verb."},
      {move:"Give them the reason",  ask:"Why would someone follow you after this specific video? Say that.",                  push:"'More content like this' is not a reason."},
      {move:"Leave it open",         ask:"What question does this video raise that you didn't answer?",                        push:"End there. The unanswered part is what gets shared."},
    ],
    "TikTok":[
      {move:"Invite the story back", ask:"What experience are you hoping someone tells you about?",                            push:"Ask for that story specifically, not for 'thoughts'."},
    ],
    "Instagram Reels":[
      {move:"Worth saving",          ask:"What makes this worth keeping? Say it plainly.",                                     push:"Naming the reason to save works better than asking for the save."},
    ],
    "YouTube":[
      {move:"Next step from the content",ask:"What should they do with what they just learned?",                              push:"Tie it to the video, not to the channel."},
    ],
    "LinkedIn":[
      {move:"Start the argument",    ask:"What would you want a stranger to push back on?",                                    push:"Comments drive reach here. Agreement doesn't produce comments."},
    ],
  },
  notes:{
    _base:[
      {move:"Name the tone",         ask:"In three words, how should this sound? Write them down.",                            push:"Check each take against those three words before you move on."},
      {move:"Where you'll rush",     ask:"Which line will you speed through when the camera's on?",                            push:"Mark it. That's the one to slow down and re-take."},
      {move:"The one shot you need", ask:"If only one shot comes out right, which is it?",                                     push:"Film that one first, while you still have energy."},
      {move:"What's in frame",       ask:"What's behind you? Decide now, not on the day.",                                     push:"Also decide where the light is coming from."},
    ],
  },
};

// Single words are fair game to insert — they're vocabulary, not content.
const POWER_WORDS=["Honest","Real","Unfiltered","Raw","Nobody tells you","The truth about",
  "What actually","Finally","Behind the scenes","Before and after","The real reason","Quietly"];

// ── GENERIC CHANNEL INSIGHTS ──────────────────────────────────────────────────
const GENERIC_INSIGHTS={
  "TikTok":[
    {insight:"Open in the middle of a moment",sub:"Skip the setup — viewers decide in the first 2 seconds"},
    {insight:"Raw beats produced",sub:"Authentic, imperfect video outperforms polished content"},
    {insight:"Under 45 seconds is the sweet spot",sub:"Completion rate drops sharply after 60s on most accounts"},
    {insight:"Talk to one person, not an audience",sub:"Intimate tone drives saves and shares more than energy"},
    {insight:"The CTA should feel like a thought, not an ask",sub:"'Let me know if this happened to you' beats 'comment below'"},
  ],
  "Instagram Reels":[
    {insight:"The first frame is a visual decision",sub:"Before they hear anything, they've decided to watch or scroll"},
    {insight:"Saves signal real resonance",sub:"A saved Reel reaches farther than a liked one"},
    {insight:"Aesthetic and message should be the same thing",sub:"The feeling of the video is part of the content"},
    {insight:"One clear idea per Reel",sub:"Multi-point content underperforms on Reels vs TikTok"},
    {insight:"Captions matter more here",sub:"60%+ of Instagram Reels are watched without sound"},
  ],
  "YouTube":[
    {insight:"The title and thumbnail make the watch happen",sub:"The video itself keeps them — the packaging gets the click"},
    {insight:"The first 30 seconds need to pay off the title",sub:"Front-load the value, don't tease it"},
    {insight:"Watch time is the currency",sub:"A 10-min video at 70% watched beats a 3-min at 40%"},
    {insight:"Chapters improve retention",sub:"Viewers skip to what they need — that's not a bad thing"},
    {insight:"Subscribe CTAs work best mid-video",sub:"After value delivered, before the wrap-up"},
  ],
  "LinkedIn":[
    {insight:"The first line is the whole battle",sub:"Only the first 2 lines show before 'see more'"},
    {insight:"Earned insight outperforms advice",sub:"What you learned the hard way beats what you've read"},
    {insight:"Numbers in the first line stop the scroll",sub:"Specific beats vague every time"},
    {insight:"Comments drive reach more than likes",sub:"Write to provoke a response, not agreement"},
    {insight:"Post when your audience is at work",sub:"Tuesday–Thursday 8–10am consistently outperforms other windows"},
  ],
};


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

// ── SCRIPT DOCUMENT ───────────────────────────────────────────────────────────
function ScriptDocument({card,analytics,onSave,onClose}){
  const[sections,setSections]=useState(()=>{
    try{const p=JSON.parse(card.script||"{}");return{hook:p.hook||"",body:p.body||"",cta:p.cta||"",notes:p.notes||""};}
    catch(e){return{hook:card.script||"",body:"",cta:"",notes:""};}
  });
  const[focusField,setFocusField]=useState("hook");
  const[openMove,setOpenMove]=useState(null);
  const[chatInput,setChatInput]=useState("");
  const[chatMsgs,setChatMsgs]=useState([{role:"ai",text:"What part of this video feels hardest to write — the hook, the body, or the CTA?"}]);
  const[chatLoading,setChatLoading]=useState(false);
  const refs=useRef({});

  const sectionDefs=[
    {key:"hook",label:"Hook",sublabel:"first 3 seconds",color:BRAND.red,placeholder:"What stops someone mid-scroll and makes them stay..."},
    {key:"body",label:"Body",sublabel:"the substance",color:BRAND.yellow,placeholder:"The content that earns the hook — your perspective, your story, your insight..."},
    {key:"cta",label:"Call to action",sublabel:"the invitation",color:BRAND.blue,placeholder:"What do you want them to feel, do, or think next..."},
    {key:"notes",label:"Notes",sublabel:"for filming",color:BRAND.green,placeholder:"Tone reminders, visual ideas, things to remember while recording..."},
  ];

  const wordCount=Object.values(sections).join(" ").trim().split(/\s+/).filter(Boolean).length;
  const estSec=Math.round(wordCount/2.5);
  const platform=card.platform||"TikTok";
  const secColor={hook:BRAND.red,body:BRAND.yellow,cta:BRAND.blue,notes:BRAND.green}[focusField]||BRAND.red;
  const focusLabel={hook:"Hook",body:"Body",cta:"CTA",notes:"Notes"}[focusField]||"Hook";
  const moves=[...((SCRIPT_MOVES[focusField]||{})._base||[]),...((SCRIPT_MOVES[focusField]||{})[platform]||[])];
  const genericIns=(GENERIC_INSIGHTS[platform]||GENERIC_INSIGHTS["TikTok"]);
  const hasData=analytics?.hasPersonalData;
  const insColors=[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green,BRAND.red];

  const insertElement=(text)=>{
    const field=focusField||"hook";
    setSections(p=>({...p,[field]:p[field]+(p[field]?" ":"")+text}));
    refs.current[field]?.focus();
  };

  const sendChat=async()=>{
    if(!chatInput.trim()||chatLoading)return;
    const userMsg=chatInput.trim();
    setChatInput("");
    setChatMsgs(p=>[...p,{role:"user",text:userMsg}]);
    setChatLoading(true);
    try{
      const sys=`You are a creative direction assistant. Give brief, specific directions — never write the script. Under 50 words. End with one question. Platform: ${platform}. Video: "${card.title}". Current hook: "${sections.hook||"empty"}"`;
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:userMsg}],systemPrompt:sys})});
      const d=await r.json();
      if(d.content)setChatMsgs(p=>[...p,{role:"ai",text:d.content}]);
    }catch(e){setChatMsgs(p=>[...p,{role:"ai",text:"Try again in a moment."}]);}
    setChatLoading(false);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui",padding:12}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 24px 80px rgba(0,0,0,.3)",width:"min(1100px,100%)",height:"min(720px,95vh)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0,background:"#FAFAFA"}}>
          <Logo/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500,color:C.text}}>Script</div>
            <div style={{fontSize:10,color:C.muted}}>{card.title} · {platform}</div>
          </div>
          <button onClick={()=>{
            const w=window.open("","_blank");
            w.document.write(`<html><head><title>${card.title}</title><style>body{font-family:Georgia,serif;max-width:600px;margin:40px auto;color:#111;line-height:1.8}h1{font-size:20px;margin-bottom:4px}.meta{font-size:12px;color:#666;margin-bottom:28px}.sec{margin-bottom:24px}.sec-label{font-size:10px;font-weight:bold;letter-spacing:1.5px;color:#555;text-transform:uppercase;margin-bottom:8px}.sec-content{font-size:15px;white-space:pre-wrap;line-height:1.8}@media print{body{margin:20px}}</style></head><body><h1>${card.title}</h1><div class="meta">${platform} · ${new Date().toLocaleDateString()}</div>${sectionDefs.filter(s=>sections[s.key]).map(s=>`<div class="sec"><div class="sec-label">${s.label}</div><div class="sec-content">${sections[s.key].replace(/</g,"&lt;")}</div></div>`).join("")}<script>window.onload=()=>{window.print()}<\/script></body></html>`);
            w.document.close();
          }} style={{fontSize:10,padding:"4px 10px",background:C.light,border:`0.5px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>🖨 Print</button>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:"0 4px"}}>×</button>
        </div>

        {/* 3-panel body */}
        <div style={{flex:1,display:"grid",gridTemplateColumns:"200px 1fr 280px",overflow:"hidden"}}>

          {/* LEFT — Moves: provocations for the focused section */}
          <div style={{borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden",background:"#FAFAFA"}}>
            <div style={{padding:"10px 12px",borderBottom:`0.5px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:3,height:11,borderRadius:2,background:secColor,flexShrink:0}}/>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:C.text}}>{focusLabel} moves</div>
              </div>
              <div style={{fontSize:10,color:C.muted,lineHeight:1.45}}>Questions to push your thinking. You write the line.</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"10px 10px"}}>
              {moves.map((m,i)=>{
                const key=`${focusField}-${i}`;
                const open=openMove===key;
                return(
                  <div key={key} onClick={()=>setOpenMove(open?null:key)}
                    style={{borderRadius:8,border:`0.5px solid ${open?secColor:C.border}`,marginBottom:6,cursor:"pointer",background:open?secColor+"0A":C.surface,transition:"border-color .15s,background .15s",overflow:"hidden"}}
                    onMouseEnter={e=>{if(!open)e.currentTarget.style.borderColor=secColor+"80";}}
                    onMouseLeave={e=>{if(!open)e.currentTarget.style.borderColor=C.border;}}>
                    <div style={{padding:"8px 10px",display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:open?secColor:C.border,flexShrink:0,transition:"background .15s"}}/>
                      <div style={{fontSize:11,fontWeight:500,color:C.text,lineHeight:1.35,flex:1}}>{m.move}</div>
                      <div style={{fontSize:9,color:C.muted,transform:open?"rotate(90deg)":"none",transition:"transform .18s",flexShrink:0}}>›</div>
                    </div>
                    {open&&(
                      <div style={{padding:"0 10px 10px 21px"}}>
                        <div style={{fontSize:11,color:C.text,lineHeight:1.55,marginBottom:7}}>{m.ask}</div>
                        <div style={{fontSize:10,color:C.muted,lineHeight:1.5,paddingLeft:8,borderLeft:`2px solid ${secColor}40`}}>{m.push}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{borderTop:`0.5px solid ${C.border}`,padding:"9px 10px 11px",flexShrink:0}}>
              <div style={{fontSize:9,fontWeight:500,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:6}}>Power words</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {POWER_WORDS.map((w,i)=>(
                  <span key={i} onClick={()=>insertElement(w)}
                    style={{fontSize:10,padding:"3px 7px",borderRadius:20,border:`0.5px solid ${C.border}`,background:C.surface,color:C.muted,cursor:"pointer",transition:"all .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=secColor;e.currentTarget.style.color=secColor;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                    {w}
                  </span>
                ))}
              </div>
              <div style={{fontSize:9,color:C.muted,marginTop:6,lineHeight:1.4}}>Click to add to {focusLabel.toLowerCase()}</div>
            </div>
          </div>

          {/* CENTER — Writing doc */}
          <div style={{overflowY:"auto",borderRight:`1px solid ${C.border}`}}>
            {sectionDefs.map(sec=>(
              <div key={sec.key} onClick={()=>setFocusField(sec.key)}
                style={{padding:"14px 20px",borderBottom:`0.5px solid ${C.border}`,background:focusField===sec.key?sec.color+"07":"transparent",cursor:"text",transition:"background .2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:3,height:13,borderRadius:2,background:sec.color,flexShrink:0}}/>
                  <div style={{fontSize:9,fontWeight:600,color:C.text,textTransform:"uppercase",letterSpacing:1.2}}>{sec.label}</div>
                  <div style={{fontSize:9,color:C.muted}}>{sec.sublabel}</div>
                </div>
                <textarea
                  ref={el=>refs.current[sec.key]=el}
                  value={sections[sec.key]}
                  onChange={e=>setSections(p=>({...p,[sec.key]:e.target.value}))}
                  onFocus={()=>setFocusField(sec.key)}
                  placeholder={sec.placeholder}
                  style={{width:"100%",border:"none",outline:"none",background:"transparent",fontSize:14,color:sections[sec.key]?C.text:C.muted,lineHeight:1.75,resize:"none",fontFamily:"Georgia,serif",minHeight:sec.key==="body"?96:52,padding:0}}
                />
              </div>
            ))}
          </div>

          {/* RIGHT — Insights + Chat */}
          <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>

            {/* Insights — top 60% */}
            <div style={{flex:"0 0 60%",overflowY:"auto",borderBottom:`1px solid ${C.border}`,padding:"12px 14px",background:"#FAFAFA"}}>
              {!hasData?(
                <div style={{padding:"5px 8px",background:"#FFFBEB",border:`0.5px solid #FCD34D`,borderRadius:6,marginBottom:10,fontSize:9,color:"#92400E",lineHeight:1.5}}>
                  ⚡ Best practices for {platform} — your insights personalize as you track metrics
                </div>
              ):(
                <div style={{padding:"5px 8px",background:"#F0FBF6",border:`0.5px solid ${BRAND.green}40`,borderRadius:6,marginBottom:10,fontSize:9,color:BRAND.green,fontWeight:500}}>
                  ✦ Personalized based on your data
                </div>
              )}
              <div style={{fontSize:9,fontWeight:500,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:8}}>{platform} insights</div>
              {(hasData?[
                analytics?.topHook&&{text:`${analytics.topHook} hooks outperform everything else`,sub:"Lead with what works for you",color:BRAND.red},
                analytics?.topFormat&&{text:`${analytics.topFormat} is your strongest format`,sub:"Your audience trusts this style",color:BRAND.yellow},
              ].filter(Boolean):genericIns.map((ins,i)=>({text:ins.insight,sub:ins.sub,color:insColors[i]}))).map((ins,i)=>(
                <div key={i} style={{display:"flex",gap:6,marginBottom:9}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:ins.color,flexShrink:0,marginTop:4}}/>
                  <div>
                    <div style={{fontSize:11,color:C.text,lineHeight:1.4,fontWeight:500}}>{ins.text}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:1,lineHeight:1.35}}>{ins.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat — bottom 40% */}
            <div style={{flex:1,display:"flex",flexDirection:"column",padding:"10px 12px",gap:7,overflow:"hidden",minHeight:0}}>
              <div style={{fontSize:9,fontWeight:500,letterSpacing:1,textTransform:"uppercase",color:C.muted}}>Ask anything</div>
              <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
                {chatMsgs.map((m,i)=>(
                  <div key={i} style={{padding:"6px 9px",borderRadius:8,fontSize:11,lineHeight:1.5,background:m.role==="ai"?C.light:BRAND.blue+"14",border:`0.5px solid ${m.role==="ai"?C.border:BRAND.blue+"30"}`,color:C.text,maxWidth:"95%",alignSelf:m.role==="user"?"flex-end":"flex-start"}}>{m.text}</div>
                ))}
                {chatLoading&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>thinking...</div>}
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask about hook, angle, direction..." style={{flex:1,fontSize:11,padding:"6px 10px",border:`0.5px solid ${C.border}`,borderRadius:20,background:C.surface,color:C.text,outline:"none",fontFamily:"system-ui"}}/>
                <button onClick={sendChat} disabled={!chatInput.trim()||chatLoading} style={{width:26,height:26,borderRadius:"50%",background:chatInput.trim()&&!chatLoading?"#111":C.border,border:"none",cursor:"pointer",color:"#FFF",fontSize:12,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
              </div>
              <div style={{fontSize:9,color:C.muted,textAlign:"center"}}>Asks questions · never writes your script</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"8px 16px",borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:"#FAFAFA"}}>
          <div style={{fontSize:11,color:C.muted}}>{wordCount} words · ~{estSec}s</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{padding:"6px 14px",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:7,cursor:"pointer",fontSize:12,color:C.text}}>Close</button>
            <button onClick={()=>onSave(JSON.stringify(sections))} style={{padding:"6px 14px",background:"#111",color:"#FFF",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:500}}>Save ✓</button>
          </div>
        </div>
      </div>
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
const CAMPAIGN_PLATFORMS=["TikTok","Instagram Reels","YouTube Shorts","YouTube","Facebook","LinkedIn"];

// A result is only shown if its URL is real and lives on the chosen platform's own
// domain. Models will invent plausible-looking links, so anything unverifiable is dropped.
const PLATFORM_DOMAINS={
  "TikTok":["tiktok.com"],
  "Instagram Reels":["instagram.com"],
  "YouTube Shorts":["youtube.com","youtu.be"],
  "YouTube":["youtube.com","youtu.be"],
  "Facebook":["facebook.com","fb.watch"],
  "LinkedIn":["linkedin.com"],
};

const verifyRef=(r,platform)=>{
  if(!r||typeof r.url!=="string"||!r.title)return null;
  const u=r.url.trim();
  if(!/^https:\/\//i.test(u))return null;
  let host;
  try{host=new URL(u).hostname.replace(/^www\./,"").toLowerCase();}catch(e){return null;}
  const allowed=PLATFORM_DOMAINS[platform]||[];
  if(!allowed.some(d=>host===d||host.endsWith("."+d)))return null;
  return {...r,url:u,platform};
};

// Four passes at the same topic. Asking one call for 100 produces padding;
// asking four calls for different things produces range.
const SEARCH_ANGLES=[
  "the most viewed and most widely shared examples",
  "smaller creators or brands that broke out unexpectedly with this",
  "examples from the last few months specifically",
  "examples known for a strong hook in the opening seconds",
  "examples that led with a demonstration or a result",
  "examples where the creator talks straight to camera",
];


// ── CAMPAIGN INSIGHTS ─────────────────────────────────────────────────────────
// Derived from the references the user actually picked, not asked of the model.
const parseViews=v=>{
  if(typeof v==="number")return isFinite(v)?v:null;
  if(typeof v!=="string")return null;
  const m=v.replace(/,/g,"").match(/([\d.]+)\s*([KMB])?/i);
  if(!m)return null;
  const n=parseFloat(m[1]);
  if(!isFinite(n))return null;
  return Math.round(n*({K:1e3,M:1e6,B:1e9}[(m[2]||"").toUpperCase()]||1));
};
const topOf=(items,key)=>{
  const c={};
  items.forEach(x=>{const v=(x&&x[key]||"").trim();if(v)c[v]=(c[v]||0)+1;});
  const best=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];
  if(!best)return null;
  return {value:best,count:c[best],total:items.length,pct:Math.round(c[best]/items.length*100)};
};
const campaignInsights=(refs=[])=>{
  const list=Array.isArray(refs)?refs:[];
  const views=list.map(r=>parseViews(r.views)).filter(v=>v!==null).sort((a,b)=>a-b);
  const median=views.length?(views.length%2?views[(views.length-1)/2]:Math.round((views[views.length/2-1]+views[views.length/2])/2)):null;
  return {
    count:list.length,
    hook:topOf(list,"hookType"),
    format:topOf(list,"format"),
    medianViews:median,
    creators:new Set(list.map(r=>(r.creator||"").trim()).filter(Boolean)).size,
  };
};

// ── CAMPAIGN FILE ─────────────────────────────────────────────────────────────
function CampaignFile({file,onSendIdeas,onClose}){
  const sent=Array.isArray(file.sent)?file.sent:[];
  const ideas=Array.isArray(file.ideas)?file.ideas:[];
  const refs=Array.isArray(file.refs)?file.refs:[];
  const ins=campaignInsights(refs);
  const[picked,setPicked]=useState([]);
  const unsent=ideas.map((_,i)=>i).filter(i=>!sent.includes(i));
  const toggle=i=>setPicked(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]);

  const stat=(label,value,color)=>(
    <div style={{flex:"1 1 120px",background:C.light,borderRadius:8,padding:"9px 11px",borderLeft:`3px solid ${color}`}}>
      <div style={{fontSize:9,color:C.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:3}}>{label}</div>
      <div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.3}}>{value}</div>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 24px 80px rgba(0,0,0,.3)",width:"min(760px,100%)",height:"min(760px,94vh)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        <div style={{display:"flex",height:3,flexShrink:0}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>

        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"flex-start",gap:12,flexShrink:0,background:"#FAFAFA"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Campaign file</div>
            <div style={{fontSize:16,fontWeight:600,color:C.text,letterSpacing:-0.2,lineHeight:1.3}}>{file.title||"Campaign"}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              {file.platform&&<span style={{display:"inline-flex",alignItems:"center",gap:4}}><PlatformIcon platform={file.platform}/>{file.platform}</span>}
              {file.month&&<span>· {monthLabel(file.month)}</span>}
              <span>· {sent.length} of {ideas.length} in pipeline</span>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>

          {file.angle&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>The brief</div>
              <div style={{fontSize:14,color:C.text,lineHeight:1.6,fontWeight:500,marginBottom:8}}>{file.angle}</div>
              {file.strategy&&<div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>{file.strategy}</div>}
            </div>
          )}

          {ins.count>0&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>What your picks had in common</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {ins.hook&&stat("Dominant hook",`${ins.hook.value} · ${ins.hook.count} of ${ins.hook.total}`,BRAND.red)}
                {ins.format&&stat("Dominant format",`${ins.format.value} · ${ins.format.count} of ${ins.format.total}`,BRAND.yellow)}
                {ins.medianViews!==null&&stat("Median views",fmt(ins.medianViews),BRAND.blue)}
                {ins.creators>0&&stat("Distinct creators",`${ins.creators} of ${ins.count}`,BRAND.green)}
              </div>
              {file.style&&<div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginTop:9,paddingLeft:10,borderLeft:`2px solid ${C.border}`}}>{file.style}</div>}
            </div>
          )}

          {refs.length>0&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>References · {refs.length}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
                {refs.map((r,i)=>(
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                     style={{border:`0.5px solid ${C.border}`,borderRadius:8,padding:"9px 10px",textDecoration:"none",background:C.surface,display:"block",transition:"border-color .15s"}}
                     onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                     onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <div style={{fontSize:11,fontWeight:600,color:C.text,lineHeight:1.35,marginBottom:4}}>{r.title}</div>
                    <div style={{fontSize:9,color:C.muted,marginBottom:4}}>{r.creator||""}{r.views?` · ${r.views}`:""}</div>
                    <div style={{fontSize:9,color:C.accent,fontWeight:600}}>Watch ↗</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Ideas · {ideas.length}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {ideas.map((idea,i)=>{
              const isSent=sent.includes(i);
              const isPicked=picked.includes(i);
              return(
                <div key={i} onClick={()=>!isSent&&toggle(i)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:8,cursor:isSent?"default":"pointer",background:isSent?"#F6FCF9":isPicked?C.accent+"0C":C.light,border:`1px solid ${isSent?BRAND.green+"40":isPicked?C.accent:C.border}`,transition:"all .15s"}}>
                  <div style={{width:17,height:17,borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#FFF",background:isSent?BRAND.green:isPicked?C.accent:"transparent",border:`1.5px solid ${isSent?BRAND.green:isPicked?C.accent:C.border}`}}>
                    {(isSent||isPicked)?"✓":""}
                  </div>
                  <div style={{flex:1,fontSize:12,color:C.text,fontWeight:500,lineHeight:1.35}}>{idea.title}</div>
                  <div style={{display:"flex",gap:4,flexShrink:0,alignItems:"center"}}>
                    {idea.hook&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.surface,color:C.muted,border:`0.5px solid ${C.border}`}}>{idea.hook}</span>}
                    {isSent&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:BRAND.green+"18",color:BRAND.green,fontWeight:600}}>In pipeline</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{padding:"11px 20px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexShrink:0,background:"#FAFAFA"}}>
          <div style={{fontSize:11,color:C.muted}}>
            {unsent.length===0?"Every idea is in your pipeline.":`${unsent.length} idea${unsent.length===1?"":"s"} not sent yet`}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {unsent.length>0&&<button onClick={()=>setPicked(picked.length===unsent.length?[]:unsent)}
              style={{padding:"6px 12px",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:7,cursor:"pointer",fontSize:12,color:C.muted}}>
              {picked.length===unsent.length&&unsent.length>0?"Clear":"Select all"}
            </button>}
            <button onClick={onClose} style={{padding:"6px 14px",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:7,cursor:"pointer",fontSize:12,color:C.text}}>Close</button>
            <button onClick={()=>{if(picked.length)onSendIdeas(picked);}} disabled={picked.length===0}
              style={{padding:"7px 16px",background:picked.length?C.text:C.border,color:picked.length?"#FFF":C.muted,border:"none",borderRadius:7,cursor:picked.length?"pointer":"not-allowed",fontSize:12,fontWeight:600}}>
              Send {picked.length||""} to pipeline →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignCreator({userId,businessProfile,videos,onSendToPipeline}){
  const[phase,setPhase]=useState("start"); // start|searching|refs|building|result
  const[input,setInput]=useState("");
  const[context,setContext]=useState("");
  const[refs,setRefs]=useState([]);
  const[selected,setSelected]=useState([]);
  const[campaign,setCampaign]=useState(null);
  const[loading,setLoading]=useState(false);
  const[pastCampaigns,setPastCampaigns]=useState([]);
  const[platform,setPlatform]=useState(()=>{
    const counts={};
    (videos||[]).forEach(v=>{if(v.platform)counts[v.platform]=(counts[v.platform]||0)+1;});
    const top=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
    return CAMPAIGN_PLATFORMS.includes(top)?top:"TikTok";
  });
  const[streaming,setStreaming]=useState(false);
  const[batchDone,setBatchDone]=useState(0);
  const[dropped,setDropped]=useState(0);
  const[searchError,setSearchError]=useState(null);
  const[searchCalls,setSearchCalls]=useState(0);
  const[sawProse,setSawProse]=useState(false);
  const[slowestMs,setSlowestMs]=useState(0);
  const[needInfo,setNeedInfo]=useState(null);
  const[builderOpen,setBuilderOpen]=useState(false);
  const[bWhat,setBWhat]=useState("");
  const[bGoal,setBGoal]=useState("Launch");
  const[bAudience,setBAudience]=useState("");
  const bottomRef=useRef(null);
  const[campaignId,setCampaignId]=useState(null);
  const[picked,setPicked]=useState([]);
  const[sentIdeas,setSentIdeas]=useState([]);
  const[fileOpen,setFileOpen]=useState(null);

  useEffect(()=>{
    sbGet("campaigns",`&user_id=eq.${userId}&order=created_at.desc&limit=5`).then(d=>{
      const rows=d||[];
      setPastCampaigns(rows);
      // Scaffolding shows for a first campaign, then gets out of the way.
      if(rows.length===0)setBuilderOpen(true);
    });
  },[userId]);

  useEffect(()=>{
    if(businessProfile&&businessProfile.audience)setBAudience(a=>a||businessProfile.audience);
  },[businessProfile]);

  const bp=businessProfile||{};

  const quickStarts=(bp.businessName||bp.audience||bp.goal)?[
    bp.businessName?`Launch a campaign for ${bp.businessName}`:"Launch a new campaign",
    bp.audience?`Reach ${bp.audience}`:"Reach a new audience",
    bp.goal?`Content that drives ${bp.goal}`:"Content that drives results",
  ]:QUICK_STARTS.slice(0,3);
  const composed=(()=>{
    const w=bWhat.trim();
    if(!w)return "";
    const stem={
      Launch:`Launch campaign for ${w}`,
      Awareness:`Brand awareness campaign for ${w}`,
      Sales:`Campaign to drive sales of ${w}`,
      Community:`Campaign to build community around ${w}`,
    }[bGoal]||`Campaign for ${w}`;
    const aud=bAudience.trim()?`, aimed at ${bAudience.trim()}`:"";
    return `${stem}${aud}, on ${platform}.`;
  })();

  const insights=campaignInsights(campaign?.refs||refs.filter((_,i)=>selected.includes(i)));

  const buildSearchSystem=(angle,query)=>`You are a content strategist finding real, existing ${platform} videos to use as references.

Business context:
- Business: ${bp.businessName||"Unknown"}
- What they do: ${bp.whatYouDo||""}
- Tone: ${bp.tone||""}

YOUR FIRST ACTION IS TO SEARCH. Do not answer from memory. Run ONE web search, then answer immediately from what it returns. Speed matters more than completeness — this is one of several parallel passes. You have no useful knowledge of which ${platform} videos exist; only the search results do.

Search for: ${query}
Angle for this pass: ${angle}

After searching, build the list from what came back.

CRITICAL RULES:
- Every video MUST be on ${platform}. Never return a video from a different platform.
- "url" MUST be a real link that appeared in your search results. Never invent, guess, or construct a URL from a pattern.
- Never repeat a URL you have already returned in this response.
- An empty array is only acceptable if you ran searches and they genuinely returned nothing usable. Never return an empty array without searching first.

Return ONLY a valid JSON array, no markdown and no explanation:
[
  {
    "title": "video title, or a short description if untitled",
    "url": "the real link from your search results",
    "creator": "account or channel name",
    "views": "2.1M",
    "hookType": "POV/Story/Transformation/Curiosity/List/Emotional/Question",
    "format": "Lifestyle/Tutorial/Founder/UGC/Before-After/Talking head",
    "why": "one sentence on why it worked"
  }
]

Return up to 10 items. JSON only.`;

  // Vercel returns plain text on platform errors, so never assume a JSON body.
  const readReply=async r=>{
    const raw=await r.text();
    try{return JSON.parse(raw);}
    catch(e){
      const clean=(raw||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
      return{error:clean?`${r.status}: ${clean.slice(0,160)}`:`${r.status}: empty response from server`,_raw:true};
    }
  };

  // Stage 1 — turn a vague brief into concrete search terms. No web search here;
  // this call exists so the search call is never asked to invent its own subject.
  const derivePlan=async(prompt)=>{
    const sys=`You turn a rough campaign brief into concrete search terms for finding real ${platform} videos.

Business: ${bp.businessName||"unknown"}
What they do: ${bp.whatYouDo||"unknown"}
Audience: ${bp.audience||"unknown"}
Tone: ${bp.tone||"unknown"}

Decide whether the brief names something specific enough to search for — a product, a category, a topic, an occasion. Phrases like "my new product" or "a campaign" are NOT specific: they contain no searchable noun. Use the business context to fill gaps where you reasonably can.

Return ONLY this JSON, no markdown:
{
  "ready": true or false,
  "question": "if not ready, one short question asking for the missing specific",
  "topic": "3-6 word subject line for the campaign",
  "queries": ["four different search phrases, each 3-7 words, no platform name, no quotes"]
}

The four queries must attack the subject from different directions, not rephrase each other.`;
    try{
      const r=await fetch("/api/chat",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:prompt}],systemPrompt:sys})
      });
      const d=await readReply(r);
      if(!d||d.error||!d.content)return null;
      const c=d.content.replace(/```json|```/g,"").trim();
      const a=c.indexOf("{"),b=c.lastIndexOf("}");
      if(a<0||b<0)return null;
      return JSON.parse(c.slice(a,b+1));
    }catch(e){return null;}
  };

  const runBatch=async(prompt,angle,signal,query)=>{
    try{
      const r=await fetch("/api/chat",{
        method:"POST",signal,headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages:[{role:"user",content:`Search ${platform} for: ${query||prompt}\n\nCampaign context: ${prompt}\n\nStart searching now, then return the JSON array.`}],
          systemPrompt:buildSearchSystem(angle,query||prompt),
          useWebSearch:true,
          allowedDomains:PLATFORM_DOMAINS[platform]||[],
          maxUses:2
        })
      });
      const d=await readReply(r);
      if(d&&d.error)return{items:[],error:typeof d.error==="string"?d.error:JSON.stringify(d.error).slice(0,160),searched:0,ms:d.ms||0};
      if(!d||!d.content)return{items:[],error:"Empty response from search",searched:0};
      const searched=d.searchCalls||0;
      const ms=d.ms||0;
      const clean=d.content.replace(/```json|```/g,"").trim();
      const a=clean.indexOf("["),b=clean.lastIndexOf("]");
      if(a<0||b<0)return{items:[],error:null,searched,ms,noJson:true};
      try{
        const parsed=JSON.parse(clean.slice(a,b+1));
        return{items:Array.isArray(parsed)?parsed:[],error:null,searched,ms};
      }catch(pe){return{items:[],error:null,searched,noJson:true};}
    }catch(e){
      if(e.name==="AbortError")return{items:[],error:"Search timed out",searched:0};
      return{items:[],error:e.message||"Search failed",searched:0};
    }
  };

  const searchRefs=async(prompt)=>{
    setContext(prompt);
    setPhase("searching");
    setLoading(true);
    setRefs([]);setSelected([]);setDropped(0);setBatchDone(0);setSearchError(null);setSearchCalls(0);setSawProse(false);setNeedInfo(null);

    const plan=await derivePlan(prompt);
    if(plan&&plan.ready===false&&plan.question){
      setNeedInfo(plan.question);
      setBuilderOpen(true);
      setLoading(false);
      setPhase("start");
      return;
    }
    const queries=(plan&&Array.isArray(plan.queries)&&plan.queries.length)?plan.queries:[prompt,prompt,prompt,prompt];
    if(plan&&plan.topic)setContext(plan.topic);

    const seen=new Set();
    let tossed=0;
    const absorb=(raw)=>{
      const good=[];
      raw.forEach(r=>{
        const v=verifyRef(r,platform);
        if(!v){tossed++;return;}
        const key=v.url.split("?")[0].replace(/\/$/,"");
        if(seen.has(key)){tossed++;return;}
        seen.add(key);good.push(v);
      });
      setDropped(tossed);
      if(good.length)setRefs(prev=>[...prev,...good]);
      return good.length;
    };

    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),45000);
    let firstError=null, totalSearches=0, sawProse=false, slowest=0;
    const take=res=>{
      if(res.error&&!firstError)firstError=res.error;
      if(res.noJson)sawProse=true;
      if(res.ms)slowest=Math.max(slowest,res.ms);
      totalSearches+=res.searched||0;
      return absorb(res.items||[]);
    };

    // All passes run together — each is one search, so none of them blocks.
    // Whichever returns first opens the grid; the rest append behind it.
    setStreaming(true);
    let opened=false;
    await Promise.all(SEARCH_ANGLES.map(async(angle,idx)=>{
      await new Promise(res=>setTimeout(res,idx*400));
      const n=take(await runBatch(prompt,angle,ctrl.signal,queries[idx%queries.length]));
      setBatchDone(b=>b+1);
      if(n>0&&!opened){opened=true;setLoading(false);setPhase("refs");}
    }));
    setSearchError(firstError);
    setSearchCalls(totalSearches);
    setSawProse(sawProse);
    setSlowestMs(slowest);

    clearTimeout(timer);
    setStreaming(false);
    setLoading(false);
    setPhase("refs");
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
      const d=await readReply(r);
      if(d&&d.error){setPhase("refs");setSearchError(typeof d.error==="string"?d.error:"Could not build the campaign");setLoading(false);return;}
      if(d.content){
        try{
          const clean=d.content.replace(/```json|```/g,"").trim();
          const parsed=JSON.parse(clean);
          const cid=uuid();
          // The campaign file: brief, the picks that produced it, and what's been sent.
          const file={
            ...parsed,
            id:cid,
            platform,
            month:curMonth(),
            refs:selectedItems,
            sent:[],
            createdAt:new Date().toISOString(),
          };
          setCampaign(file);
          setCampaignId(cid);
          setSentIdeas([]);
          setPicked([]);
          await sbInsert("campaigns",{
            id:cid,user_id:userId,
            title:parsed.title,
            brief:JSON.stringify(file),
            ideas:JSON.stringify(parsed.ideas||[]),
            month:curMonth(),
            created_at:new Date().toISOString()
          });
          sbGet("campaigns",`&user_id=eq.${userId}&order=created_at.desc&limit=5`).then(dd=>setPastCampaigns(dd||[]));
          setPhase("result");
        }catch(e){console.error("parse error",e);setPhase("refs");}
      }
    }catch(e){console.error(e);}
    setLoading(false);
  };

  // Persist which ideas have gone out, so the file stays truthful when reopened.
  const markSent=async(file,indices)=>{
    const merged=Array.from(new Set([...(file.sent||[]),...indices])).sort((a,b)=>a-b);
    const next={...file,sent:merged};
    if(file.id)await sbUpdate("campaigns","id",file.id,{brief:JSON.stringify(next)});
    sbGet("campaigns",`&user_id=eq.${userId}&order=created_at.desc&limit=5`).then(dd=>setPastCampaigns(dd||[]));
    return next;
  };

  const pushIdeas=(file,indices)=>{
    const list=(file.ideas||[]).filter((_,i)=>indices.includes(i));
    if(!list.length)return;
    onSendToPipeline(list.map(idea=>({
      id:uuid(),
      title:idea.title,
      platform:idea.platform||file.platform||"TikTok",
      hook:idea.hook||"",
      format:idea.format||"",
      month:curMonth(),
      stage:"idea",
      targetDate:"",
      campaignId:file.id||null,
      campaignTitle:file.title||"",
      createdAt:new Date().toISOString()
    })));
  };

  const sendFromResult=async()=>{
    if(!campaign||!picked.length)return;
    pushIdeas(campaign,picked);
    const next=await markSent({...campaign,id:campaignId||campaign.id,sent:sentIdeas},picked);
    setSentIdeas(next.sent);
    setCampaign(c=>({...c,sent:next.sent}));
    setPicked([]);
  };

  const sendFromFile=async(indices)=>{
    if(!fileOpen)return;
    pushIdeas(fileOpen,indices);
    const next=await markSent(fileOpen,indices);
    setFileOpen(null);
  };

  const reset=()=>{setPhase("start");setInput("");setContext("");setRefs([]);setSelected([]);setCampaign(null);setStreaming(false);setBatchDone(0);setDropped(0);setSearchError(null);setSearchCalls(0);setSawProse(false);setNeedInfo(null);};

  // ── START SCREEN ───────────────────────────────────────────────────────────
  if(phase==="start")return(
    <div>
      {fileOpen&&<CampaignFile file={fileOpen} onSendIdeas={sendFromFile} onClose={()=>setFileOpen(null)}/>}
      <Card pad={0} style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"18px 20px 20px"}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>New campaign</div>
          <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2,marginBottom:4}}>What are you creating this month?</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:18}}>Pick a platform, describe the campaign, and Sidekick finds real videos you can open.</div>

          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Find references on</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
            {CAMPAIGN_PLATFORMS.map(p=>{
              const on=platform===p;
              return(
                <button key={p} onClick={()=>setPlatform(p)}
                  style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:on?600:400,color:on?C.text:C.muted,background:C.surface,border:`1px solid ${on?C.text:C.border}`,transition:"all .15s"}}>
                  <PlatformIcon platform={p}/>{p}
                </button>
              );
            })}
          </div>


          {/* Prompt builder — scaffolding for a first campaign, collapses once you've run one */}
          {!builderOpen&&(
            <div style={{marginBottom:12}}>
              <button onClick={()=>setBuilderOpen(true)}
                style={{background:"none",border:"none",padding:0,cursor:"pointer",fontSize:11,color:C.accent,fontWeight:500}}>
                Not sure what to write? Build it with prompts →
              </button>
            </div>
          )}
          {builderOpen&&(
            <div style={{border:`0.5px solid ${C.border}`,borderRadius:10,background:C.light,padding:"12px 13px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",marginBottom:11}}>
                <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",flex:1}}>Build your brief</div>
                <button onClick={()=>setBuilderOpen(false)}
                  style={{background:"none",border:"none",padding:0,cursor:"pointer",fontSize:11,color:C.muted}}>Hide</button>
              </div>

              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>What are you promoting?</div>
              <input
                value={bWhat}
                onChange={e=>setBWhat(e.target.value)}
                placeholder="cold brew concentrate"
                style={{...inp,fontSize:12,padding:"7px 10px",marginBottom:11,background:C.surface}}
              />

              <div style={{fontSize:10,color:C.muted,marginBottom:5}}>What should it do?</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:11}}>
                {["Launch","Awareness","Sales","Community"].map(g=>{
                  const on=bGoal===g;
                  return(
                    <button key={g} onClick={()=>setBGoal(g)}
                      style={{padding:"5px 11px",borderRadius:20,cursor:"pointer",fontSize:11,fontWeight:on?600:400,color:on?C.text:C.muted,background:C.surface,border:`1px solid ${on?C.text:C.border}`,transition:"all .15s"}}>
                      {g}
                    </button>
                  );
                })}
              </div>

              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Who's it for?</div>
              <input
                value={bAudience}
                onChange={e=>setBAudience(e.target.value)}
                placeholder="people who drink coffee at their desk"
                style={{...inp,fontSize:12,padding:"7px 10px",marginBottom:11,background:C.surface}}
              />

              <div style={{borderTop:`0.5px solid ${C.border}`,paddingTop:10}}>
                <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Your brief</div>
                <div style={{fontSize:12,color:composed?C.text:C.muted,lineHeight:1.55,marginBottom:9,fontStyle:composed?"normal":"italic"}}>
                  {composed||"Name what you're promoting and the brief writes itself."}
                </div>
                <button
                  onClick={()=>{if(composed){setInput(composed);setNeedInfo(null);setBuilderOpen(false);}}}
                  disabled={!composed}
                  style={{padding:"7px 14px",background:composed?C.text:C.border,color:composed?"#FFF":C.muted,border:"none",borderRadius:7,cursor:composed?"pointer":"not-allowed",fontSize:12,fontWeight:600}}>
                  Use this brief
                </button>
                <span style={{fontSize:10,color:C.muted,marginLeft:9}}>You can edit it before searching</span>
              </div>
            </div>
          )}
          <div style={{position:"relative",marginBottom:12}}>
            <textarea
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&input.trim()){e.preventDefault();searchRefs(input.trim());}}}
              placeholder="Describe the campaign — what you're launching, who it's for, what it should do."
              style={{...inp,borderRadius:10,padding:"11px 48px 11px 14px",fontSize:13,lineHeight:1.5,resize:"none",height:46,fontFamily:"system-ui"}}
            />
            <button
              onClick={()=>input.trim()&&searchRefs(input.trim())}
              disabled={!input.trim()}
              style={{position:"absolute",right:9,top:9,width:28,height:28,borderRadius:"50%",background:input.trim()?C.text:C.border,border:"none",cursor:input.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:14}}>↑</button>
          </div>

          {needInfo&&(
            <div style={{display:"flex",gap:8,alignItems:"flex-start",background:"#FFFBEB",border:`0.5px solid ${C.amber}50`,borderRadius:8,padding:"9px 11px",marginBottom:12}}>
              <span style={{fontSize:12,flexShrink:0}}>💡</span>
              <div style={{fontSize:11,color:"#92400E",lineHeight:1.55}}>
                {needInfo}
                <span style={{display:"block",color:C.muted,marginTop:3}}>Search needs a concrete noun — a product, category, or occasion.</span>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {quickStarts.map(q=>(
              <button key={q} onClick={()=>{setInput(q);searchRefs(q);}}
                style={{padding:"5px 11px",border:`0.5px solid ${C.border}`,borderRadius:20,fontSize:11,color:C.muted,cursor:"pointer",background:C.surface}}>{q}</button>
            ))}
          </div>
        </div>
      </Card>

      {pastCampaigns.length>0&&(
        <div>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Recent campaigns</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {pastCampaigns.map((c,i)=>{
              let file={};try{file=JSON.parse(c.brief||"{}");}catch(e){}
              const total=(file.ideas||[]).length;
              const done=(file.sent||[]).length;
              return(
                <div key={c.id} onClick={()=>setFileOpen({...file,id:file.id||c.id,title:file.title||c.title,month:file.month||c.month})}
                  style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",transition:"border-color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{width:4,height:30,borderRadius:2,background:[BRAND.red,BRAND.blue,BRAND.green,BRAND.yellow,C.purple][i%5],flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.title||"Campaign"}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:1}}>
                      {file.month?monthLabel(file.month):c.month}
                      {total>0&&` · ${done} of ${total} in pipeline`}
                      {file.platform&&` · ${file.platform}`}
                    </div>
                  </div>
                  <span style={{fontSize:11,color:C.muted}}>→</span>
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
      <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Searching {platform}…</div>
      <div style={{fontSize:13,color:C.muted,maxWidth:420,lineHeight:1.6}}>Four passes at your topic, each looking for something different. Only videos with a working link make it through — the first results appear as soon as they're ready.</div>
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
            <PlatformIcon platform={platform}/>
            {refs.length} {platform} {refs.length===1?"video":"videos"}
            {streaming&&<span style={{fontSize:11,fontWeight:500,color:C.muted,display:"inline-flex",alignItems:"center",gap:5}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:BRAND.blue,animation:"brandPulse 1s ease-in-out infinite"}}/>
              still searching · pass {Math.min(batchDone+1,SEARCH_ANGLES.length)} of {SEARCH_ANGLES.length}
            </span>}
          </div>
          <div style={{fontSize:13,color:C.muted}}>Every one opens. Pick the ones that feel like your brand — the campaign gets built around what you choose.</div>
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
      {dropped>0&&<div style={{fontSize:11,color:C.muted,marginBottom:16}}>{dropped} result{dropped===1?"":"s"} left out — no verifiable link, or not on {platform}.</div>}
      {dropped===0&&<div style={{marginBottom:16}}/>}

      {refs.length===0&&!streaming&&(
        <div style={{textAlign:"center",padding:"56px 24px",border:`1px dashed ${C.border}`,borderRadius:12,background:C.light}}>
          <div style={{fontSize:28,marginBottom:12}}>🔍</div>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>
            {searchError?"The search didn't run":`Nothing on ${platform} came back with a working link`}
          </div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.6,maxWidth:420,margin:"0 auto 14px"}}>
            {searchError
              ?"This is a connection problem, not an empty result — the search never reached the web."
              :searchCalls===0
                ?(sawProse
                    ?`The search never queried the web and replied in prose instead. Name the product or category directly — "my new product" gives it nothing to search for.`
                    :`The search ran but never queried the web. Name the product or category directly rather than describing it.`)
                :`${searchCalls} web ${searchCalls===1?"search":"searches"} ran on ${platform} and nothing public matched. Try naming the topic more specifically, or a different platform — some index far better than others.`}
          </div>
          {slowestMs>0&&<div style={{fontSize:10,color:C.muted,marginBottom:10}}>Slowest call: {(slowestMs/1000).toFixed(1)}s (ceiling is ~22s)</div>}
          {searchError&&<div style={{fontSize:11,color:C.red,background:"#FEF2F2",border:`0.5px solid ${C.red}30`,borderRadius:7,padding:"7px 11px",maxWidth:420,margin:"0 auto 16px",lineHeight:1.5,wordBreak:"break-word"}}>{searchError}</div>}
          <button onClick={reset} style={{padding:"9px 20px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Try another search</button>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
        {refs.map((ref,i)=>{
          const isSel=selected.includes(i);
          const colors=THUMB_COLORS[i%THUMB_COLORS.length].split(",");
          return(
            <div key={ref.url||i} onClick={()=>setSelected(prev=>isSel?prev.filter(x=>x!==i):[...prev,i])}
              style={{border:`${isSel?"2px":"1px"} solid ${isSel?C.accent:C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",background:C.surface,transition:"border-color .15s,transform .15s",display:"flex",flexDirection:"column"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              {/* Thumbnail — opens the real video */}
              <a href={ref.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                 title={`Open on ${platform}`}
                 style={{height:100,background:`linear-gradient(135deg,${colors[0]},${colors[1]})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",textDecoration:"none"}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#111",boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>▶</div>
                {isSel&&<div style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#FFF",fontWeight:700}}>✓</div>}
                {ref.creator&&<div style={{position:"absolute",bottom:6,left:8,fontSize:9,color:"#FFF",background:"rgba(0,0,0,.45)",padding:"2px 7px",borderRadius:20,maxWidth:"80%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ref.creator}</div>}
              </a>
              {/* Info */}
              <div style={{padding:"10px 12px",display:"flex",flexDirection:"column",flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:5,lineHeight:1.35}}>{ref.title}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                  {ref.hookType&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.accent+"18",color:C.accent,fontWeight:600}}>{ref.hookType}</span>}
                  {ref.format&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.light,color:C.muted}}>{ref.format}</span>}
                </div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.4,flex:1}}>{ref.why}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8,gap:6}}>
                  {ref.views&&<span style={{fontSize:10,fontWeight:600,color:C.green}}>👁 {ref.views}</span>}
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                     style={{marginLeft:"auto",fontSize:10,fontWeight:600,color:C.accent,textDecoration:"none",padding:"3px 9px",borderRadius:20,border:`0.5px solid ${C.accent}40`,whiteSpace:"nowrap"}}
                     onMouseEnter={e=>e.currentTarget.style.background=C.accent+"12"}
                     onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Watch ↗</a>
                </div>
              </div>
            </div>
          );
        })}
        {streaming&&[0,1,2,3].map(i=>(
          <div key={`sk${i}`} style={{border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",background:C.surface,opacity:.55}}>
            <div style={{height:100,background:C.light,animation:"brandPulse 1.4s ease-in-out infinite"}}/>
            <div style={{padding:"10px 12px"}}>
              <div style={{height:9,borderRadius:3,background:C.light,marginBottom:7}}/>
              <div style={{height:9,borderRadius:3,background:C.light,width:"70%"}}/>
            </div>
          </div>
        ))}
      </div>
      {selected.length>0&&(
        <div style={{position:"sticky",bottom:16,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}>
          <div style={{fontSize:13,color:C.muted}}><span style={{fontWeight:700,color:C.text}}>{selected.length}</span> videos selected</div>
          <button onClick={buildCampaign} style={{padding:"10px 24px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:700}}>Build my campaign →</button>
        </div>
      )}
      <style>{`@keyframes brandPulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
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
      <Card pad={0} style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"16px 20px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Campaign file</div>
              <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2,lineHeight:1.3}}>{campaign.title}</div>
              <div style={{fontSize:13,color:C.muted,marginTop:4,lineHeight:1.55}}>{campaign.angle}</div>
            </div>
            <button onClick={reset} style={{padding:"6px 12px",border:`0.5px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted,flexShrink:0}}>New campaign</button>
          </div>
          {campaign.strategy&&<div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{campaign.strategy}</div>}
        </div>
      </Card>

      {insights.count>0&&(
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>What your picks had in common</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[[insights.hook&&`${insights.hook.value} · ${insights.hook.count} of ${insights.hook.total}`,"Dominant hook",BRAND.red],
              [insights.format&&`${insights.format.value} · ${insights.format.count} of ${insights.format.total}`,"Dominant format",BRAND.yellow],
              [insights.medianViews!==null&&fmt(insights.medianViews),"Median views",BRAND.blue],
              [insights.creators>0&&`${insights.creators} of ${insights.count}`,"Distinct creators",BRAND.green]].map(([val,label,color])=>val?(
                <div key={label} style={{flex:"1 1 130px",background:C.light,borderRadius:8,padding:"9px 11px",borderLeft:`3px solid ${color}`}}>
                  <div style={{fontSize:9,color:C.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:3}}>{label}</div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.3}}>{val}</div>
                </div>
              ):null)}
          </div>
          {campaign.style&&<div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginTop:10,paddingLeft:10,borderLeft:`2px solid ${C.border}`}}>{campaign.style}</div>}
        </Card>
      )}

      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:10,flexWrap:"wrap"}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>{(campaign.ideas||[]).length} video ideas</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:11,color:C.muted}}>Pick the ones you want to make</span>
            <button onClick={()=>{const avail=(campaign.ideas||[]).map((_,i)=>i).filter(i=>!sentIdeas.includes(i));setPicked(picked.length===avail.length?[]:avail);}}
              style={{padding:"4px 10px",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:20,cursor:"pointer",fontSize:11,color:C.muted}}>
              {picked.length&&picked.length===(campaign.ideas||[]).filter((_,i)=>!sentIdeas.includes(i)).length?"Clear":"Select all"}
            </button>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {(campaign.ideas||[]).map((idea,i)=>{
            const isSent=sentIdeas.includes(i);
            const isPicked=picked.includes(i);
            return(
              <div key={i} onClick={()=>{if(isSent)return;setPicked(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]);}}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,cursor:isSent?"default":"pointer",background:isSent?"#F6FCF9":isPicked?C.accent+"0C":C.light,border:`1px solid ${isSent?BRAND.green+"40":isPicked?C.accent:C.border}`,transition:"all .15s"}}>
                <div style={{width:18,height:18,borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#FFF",background:isSent?BRAND.green:isPicked?C.accent:"transparent",border:`1.5px solid ${isSent?BRAND.green:isPicked?C.accent:C.border}`}}>
                  {(isSent||isPicked)?"✓":""}
                </div>
                <div style={{flex:1,fontSize:13,color:C.text,fontWeight:500,lineHeight:1.35}}>{idea.title}</div>
                <div style={{display:"flex",gap:4,flexShrink:0,alignItems:"center"}}>
                  {idea.hook&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.surface,color:C.muted,border:`0.5px solid ${C.border}`}}>{idea.hook}</span>}
                  {idea.format&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:C.surface,color:C.muted,border:`0.5px solid ${C.border}`}}>{idea.format}</span>}
                  {isSent&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:BRAND.green+"18",color:BRAND.green,fontWeight:600}}>In pipeline</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <button
        onClick={sendFromResult}
        disabled={picked.length===0}
        style={{width:"100%",padding:"13px 0",background:picked.length?C.text:C.border,color:picked.length?"#FFF":C.muted,border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:picked.length?"pointer":"not-allowed"}}>
        {picked.length?`Send ${picked.length} idea${picked.length===1?"":"s"} to my pipeline →`:"Select ideas to send"}
      </button>
      <div style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:8}}>
        {sentIdeas.length>0
          ?`${sentIdeas.length} already in your pipeline. The rest stay here — reopen this campaign any time.`
          :"Whatever you don't send stays in this campaign file for later."}
      </div>
    </div>
  );

  return null;
}

// ── CREATOR DASHBOARD ─────────────────────────────────────────────────────────
function CreatorDashboard({videos,goals,month,onMonthChange,onSetGoal,onAddVideo,onMoveVideo,onMetrics,onDeleteVideo,userId,refGoal,refAdd,refStages,refPublished,refLock,tourStep,showAddFromTour,onAddFromTourDone,onTourNext,businessProfile,onSaveScript}){
  const[showAdd,setShowAdd]=useState(false);
  // Sync external tour trigger
  useEffect(()=>{if(showAddFromTour){setShowAdd(true);onAddFromTourDone&&onAddFromTourDone();}}, [showAddFromTour]);
  const[showGoal,setShowGoal]=useState(false);
  const[metricsVid,setMetricsVid]=useState(null);
  const[confirmDel,setConfirmDel]=useState(null);
  const[overrideVid,setOverrideVid]=useState(null);
  const[scriptCard,setScriptCard]=useState(null);
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
                    <div style={{padding:"10px 12px 0",flex:1,minWidth:0,position:"relative"}}>
                      {/* Top row — platform icon + stage label + × delete on hover */}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <PlatformIcon platform={v.platform}/>
                        <span style={{fontSize:10,fontWeight:500,color:stage.color,letterSpacing:0.2}}>{stage.label}</span>
                        <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}}>
                          {(stage.id==="idea"||stage.id==="production")&&<AIBoxIcon onClick={()=>setScriptCard(v)}/>}
                          <button onClick={()=>setConfirmDel(v.id)}
                            style={{width:18,height:18,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"transparent",transition:"color .15s,background .15s",padding:0}}
                            onMouseEnter={e=>{e.currentTarget.style.color=BRAND.red;e.currentTarget.style.background="#FEE2E2";}}
                            onMouseLeave={e=>{e.currentTarget.style.color="transparent";e.currentTarget.style.background="none";}}>×</button>
                        </div>
                      </div>
                      {/* Title */}
                      <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:5,lineHeight:1.35,wordBreak:"break-word"}}>{v.title}</div>
                      {v.campaignTitle&&<div style={{display:"inline-flex",alignItems:"center",gap:4,marginBottom:6,fontSize:9,color:C.muted,background:C.light,border:`0.5px solid ${C.border}`,borderRadius:20,padding:"2px 7px",maxWidth:"100%",overflow:"hidden"}}><span style={{width:5,height:5,borderRadius:"50%",background:C.purple,flexShrink:0}}/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.campaignTitle}</span></div>}
                      {/* Date */}
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:7}}>
                        {v.targetDate&&<span style={{fontSize:10,color:C.muted}}>📅 {v.targetDate}</span>}
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
                      {/* Spacer */}

                        {isPub&&!hasMet&&unlocked&&<button onClick={()=>setMetricsVid(v)} style={{fontSize:10,padding:"4px 10px",background:C.green,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>📊 Add metrics</button>}
                        {!isCf&&<button onClick={()=>setConfirmDel(v.id)} style={{fontSize:10,padding:"4px 8px",background:"none",border:"none",cursor:"pointer",color:C.muted,marginLeft:"auto"}}>🗑</button>}
                        {isCf&&<div style={{display:"flex",gap:4,alignItems:"center",marginLeft:"auto"}}><span style={{fontSize:10,color:C.red,fontWeight:700}}>Delete?</span><button onClick={()=>{onDeleteVideo(v.id);setConfirmDel(null);}} style={{fontSize:10,padding:"2px 7px",background:C.red,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>Yes</button><button onClick={()=>setConfirmDel(null)} style={{fontSize:10,padding:"2px 7px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>No</button></div>}
                      </div>
                      {/* Pipeline progress boxes + Script button */}
                      {/* Progress boxes — fill per stage */}
                      <div style={{marginTop:8,marginLeft:-12,marginRight:-12,borderTop:`0.5px solid ${C.border}`,padding:"8px 12px",display:"flex",flexDirection:"column",gap:7}}>
                        <div style={{display:"flex",gap:3}}>
                          {STAGES.map((s,i)=>{
                            const stageIdx=STAGES.findIndex(st=>st.id===stage.id);
                            return <div key={s.id} style={{height:4,flex:1,borderRadius:2,background:i<=stageIdx?s.color:C.border,transition:"background .3s"}}/>;
                          })}
                        </div>
                        {(stage.id==="idea"||stage.id==="production")&&(
                          <button onClick={()=>setScriptCard(v)}
                            style={{width:"100%",padding:"7px 0",borderRadius:7,border:`1.5px solid ${v.script?BRAND.red:C.border}`,background:v.script?BRAND.red+"12":C.light,cursor:"pointer",fontSize:11,fontWeight:600,color:v.script?BRAND.red:C.muted,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.red;e.currentTarget.style.background=BRAND.red+"18";e.currentTarget.style.color=BRAND.red;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=v.script?BRAND.red:C.border;e.currentTarget.style.background=v.script?BRAND.red+"12":C.light;e.currentTarget.style.color=v.script?BRAND.red:C.muted;}}>
                            <div style={{width:7,height:7,borderRadius:1,background:"currentColor"}}/>
                            {v.script?(()=>{try{const p=JSON.parse(v.script);const wc=Object.values(p).join(" ").trim().split(" ").filter(w=>w).length;return wc>0?`Script · ${wc} words`:"Script written";}catch(e){return"Script written";}})():"Write your script"}
                          </button>
                        )}
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
      {scriptCard&&<ScriptDocument card={scriptCard} analytics={(()=>{
     const wm=videos.filter(v=>v.metricsAdded&&v.views>0);
     const grp=(vs,k)=>{const m={};vs.forEach(v=>{if(!v[k])return;if(!m[v[k]])m[v[k]]={n:0,s:0};m[v[k]].n++;m[v[k]].s+=v.views;});return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n)})).sort((a,b)=>b.avg-a.avg);};
     const topHook=grp(wm,"hook")[0]?.name;
     const topFormat=grp(wm,"format")[0]?.name;
     return{topHook,topFormat,hasPersonalData:wm.length>=3};
   })()}
     onSave={s=>{onSaveScript(scriptCard.id,s);setScriptCard(null);}} onClose={()=>setScriptCard(null)}/>}
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
          AI handles the clutter.<br/>You dive into the human part.
        </div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>
          The pipeline, the research, the analytics — organized by AI. So your brain stays free for the things it does that no algorithm ever could.
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
          {[["✦ Creativity",BRAND.red],["😂 Humour",BRAND.yellow],["🌊 True virality",BRAND.blue],["🎯 Point of view",BRAND.green]].map(([t,c])=>(
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
    setVideos((vs||[]).map(r=>({id:r.id,userId:r.user_id,title:r.title,platform:r.platform,stage:r.stage,targetDate:r.target_date,publishDate:r.publish_date,url:r.url||"",hook:r.hook||"",format:r.format||"",cta:r.cta||"",views:r.views||0,likes:r.likes||0,comments:r.comments||0,shares:r.shares||0,saves:r.saves||0,paraTi:r.para_ti,siguiendo:r.siguiendo,busqueda:r.busqueda,pauta:r.pauta||0,metricsAdded:r.metrics_added||false,month:r.month,createdAt:r.created_at,script:r.script||"",shotList:r.shot_list||"",editAdvice:r.edit_advice||"",campaignId:r.campaign_id||null,campaignTitle:r.campaign_title||""})));
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
    const newVid={id:v.id,userId:user.id,title:v.title,platform:v.platform||"TikTok",stage:"idea",targetDate:v.targetDate||null,publishDate:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,paraTi:null,siguiendo:null,busqueda:null,pauta:0,metricsAdded:false,month:v.month||curMonth(),campaignId:v.campaignId||null,campaignTitle:v.campaignTitle||"",createdAt:new Date().toISOString()};
    setVideos(prev=>[newVid,...prev]);
    const dbRow={id:v.id,user_id:user.id,title:v.title,platform:v.platform||"TikTok",stage:"idea",target_date:v.targetDate||null,publish_date:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,para_ti:null,siguiendo:null,busqueda:null,pauta:0,metrics_added:false,month:v.month||curMonth(),campaign_id:v.campaignId||null,campaign_title:v.campaignTitle||"",created_at:new Date().toISOString()};
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
        {page==="dashboard"&&<CreatorDashboard videos={videos} goals={goals} month={month} onMonthChange={setMonth} onSetGoal={setGoal} onAddVideo={(v)=>{addV(v);if(tourNext!==null){showStep(tourNext);setTourNext(null);}}} onMoveVideo={(id,st,pd)=>{moveV(id,st,pd);if(tourStep===4&&st==="published")showStep(5);if(st==="published"&&!localStorage.getItem(`sk_pub_${user.id}`)){localStorage.setItem(`sk_pub_${user.id}`,"1");setTimeout(()=>setShowPublishPopup(true),800);}}} onMetrics={saveM} onDeleteVideo={delV} userId={user.id} refGoal={refGoal} refAdd={refAdd} refStages={refStages} refPublished={refPublished} refLock={refLock} tourStep={tourStep} showAddFromTour={showAddFromTour} onAddFromTourDone={()=>{setShowAddFromTour(false);}} onTourNext={()=>{if(tourNext!==null){showStep(tourNext);setTourNext(null);}}} businessProfile={businessProfile} onSaveScript={saveScript}/>}
        {page==="campaigns"&&<CampaignCreator userId={user.id} businessProfile={businessProfile} videos={videos} onSendToPipeline={(ideas)=>{ideas.forEach(v=>addV({...v,id:v.id||"v"+uid(),month:v.month||curMonth(),stage:"idea",createdAt:new Date().toISOString()}));setPage("dashboard");}}/>}
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
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",display:"flex",alignItems:"stretch",justifyContent:"flex-end",zIndex:999,fontFamily:"system-ui,sans-serif"}}
         onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.surface,width:"min(400px,100vw)",height:"100vh",display:"flex",flexDirection:"column",boxShadow:"-8px 0 32px rgba(0,0,0,.16)"}}>

        <div style={{display:"flex",height:3,flexShrink:0}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>

        {/* Header */}
        <div style={{padding:"14px 18px",borderBottom:`0.5px solid ${C.border}`,flexShrink:0,background:"#FAFAFA"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Review notes</div>
              <div style={{fontSize:14,fontWeight:600,color:C.text,lineHeight:1.3,letterSpacing:-0.2}}>{video.title}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3,display:"flex",alignItems:"center",gap:5}}>
                <PlatformIcon platform={video.platform}/>{video.platform}
                <span>· {notes.length} note{notes.length===1?"":"s"}</span>
              </div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
          </div>
        </div>

        {/* Notes list */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:9}}>
          {loading&&(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[0,1].map(i=><div key={i} style={{height:52,borderRadius:10,background:C.light,animation:"notePulse 1.4s ease-in-out infinite"}}/>)}
            </div>
          )}
          {!loading&&notes.length===0&&(
            <div style={{textAlign:"center",padding:"48px 20px",color:C.muted}}>
              <div style={{width:34,height:34,borderRadius:9,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <div style={{width:14,height:2,borderRadius:2,background:C.border,boxShadow:`0 5px 0 ${C.border}, 0 -5px 0 ${C.border}`}}/>
              </div>
              <div style={{fontSize:13,color:C.text,fontWeight:500,marginBottom:4}}>No notes yet</div>
              <div style={{fontSize:11,lineHeight:1.6,maxWidth:220,margin:"0 auto"}}>Leave feedback for the editor, or approve the video if it's ready.</div>
            </div>
          )}
          {notes.map((n,i)=>{
            const isSendBack=n.note.startsWith("↩");
            const body=isSendBack?n.note.replace(/^↩\s*Sent back:\s*/,""):n.note;
            return(
              <div key={i} style={{display:"flex",gap:9}}>
                <div style={{width:26,height:26,borderRadius:8,flexShrink:0,background:isSendBack?"#FFF7ED":C.light,border:`0.5px solid ${isSendBack?"#FED7AA":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:isSendBack?"#C2410C":C.muted}}>
                  {(n.author_name||"T").slice(0,1).toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:600,color:C.text}}>{n.author_name||"Team"}</span>
                    <span style={{fontSize:10,color:C.muted}}>{timeAgo(n.created_at)}</span>
                    {isSendBack&&<span style={{fontSize:9,fontWeight:600,color:"#C2410C",background:"#FFF7ED",border:"0.5px solid #FED7AA",borderRadius:20,padding:"1px 7px"}}>Sent back</span>}
                  </div>
                  <div style={{fontSize:12,color:C.text,lineHeight:1.6,background:isSendBack?"#FFF7ED":C.light,border:`0.5px solid ${isSendBack?"#FED7AA":C.border}`,borderRadius:9,padding:"8px 10px",wordBreak:"break-word"}}>{body}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>

        {/* Send back */}
        {video.stage==="review"&&(
          <div style={{padding:"11px 16px",borderTop:`0.5px solid ${C.border}`,flexShrink:0,background:"#FAFAFA"}}>
            {!showSendBack?(
              <button onClick={()=>setShowSendBack(true)}
                style={{width:"100%",padding:"9px 0",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#F97316";e.currentTarget.style.color="#C2410C";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text;}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#F97316"}}/>Send back to Editing
              </button>
            ):(
              <div>
                <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:6}}>What needs to change?</div>
                <textarea value={sendBackNote} onChange={e=>setSendBackNote(e.target.value)}
                  placeholder="Be specific — the editor only sees this note."
                  style={{...inp,fontSize:12,height:66,resize:"none",lineHeight:1.55,marginBottom:8,background:C.surface}}/>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>{setShowSendBack(false);setSendBackNote("");}} style={{flex:1,padding:"8px 0",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,color:C.text}}>Cancel</button>
                  <button onClick={handleSendBack} disabled={!sendBackNote.trim()}
                    style={{flex:1,padding:"8px 0",background:sendBackNote.trim()?"#F97316":C.border,color:sendBackNote.trim()?"#FFF":C.muted,border:"none",borderRadius:8,cursor:sendBackNote.trim()?"pointer":"not-allowed",fontSize:12,fontWeight:600}}>Send back</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Composer */}
        <div style={{padding:"11px 16px 14px",borderTop:`0.5px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,alignItems:"flex-end"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Add a note…"
            style={{...inp,flex:1,fontSize:12,padding:"9px 11px",height:38,resize:"none",lineHeight:1.5,fontFamily:"system-ui"}}/>
          <button onClick={send} disabled={sending||!input.trim()}
            style={{width:34,height:34,borderRadius:"50%",background:sending||!input.trim()?C.border:C.text,color:"#FFF",border:"none",cursor:sending||!input.trim()?"not-allowed":"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
        </div>
      </div>
      <style>{`@keyframes notePulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
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
function AgencyDashboard({clientError,clients,videos,targets,month,onMonthChange,onSelectClient,onAddClient,onSetTarget,businessProfile}){
  const[showAddClient,setShowAddClient]=useState(false);
  const[newName,setNewName]=useState("");
  const[adding,setAdding]=useState(false);
  const[newEmoji,setNewEmoji]=useState("🏢");
  const[showEmoji,setShowEmoji]=useState(false);
  const[pendingProfileClient,setPendingProfileClient]=useState(null);
  const EMOJIS=["🏢","🍕","💪","✂️","🛍️","🍔","☕","🏠","💄","🎵","🐾","🌿","👗","🚗","📚","🎮","🏋️","🍜","🌮","🏪"];

  const addClient=async()=>{
    if(!newName.trim()||adding)return;
    setAdding(true);
    const name=newName.trim(), emoji=newEmoji;
    // Close first. Waiting on the insert + reload left the modal open, and
    // people click again — which is how you end up with three of the same client.
    setNewName("");setNewEmoji("🏢");setShowAddClient(false);
    try{
      const newClient=await onAddClient(name,emoji);
      if(newClient)setPendingProfileClient(newClient);
    }catch(e){console.error("addClient",e);}
    setAdding(false);
  };

  const totalGoal=clients.reduce((s,c)=>{const t=targets.find(t=>t.client_id===c.id&&t.month===month);return s+(t?.goal||0);},0);
  const totalPub=clients.reduce((s,c)=>s+videos.filter(v=>v.client_id===c.id&&v.month===month&&v.stage==="published").length,0);
  const pct=totalGoal>0?Math.min(100,Math.round(totalPub/totalGoal*100)):0;

  return(
    <div>
      {clientError&&(
        <div style={{background:"#FEF2F2",border:`1px solid ${C.red}35`,borderRadius:10,padding:"11px 14px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:C.red,marginBottom:3}}>That client didn't save</div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.55,wordBreak:"break-word"}}>{clientError}</div>
        </div>
      )}
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
            const cAll=videos.filter(v=>v.client_id===client.id);
            const cViews=cAll.reduce((a,v)=>a+(v.views||0),0);
            const cPub=cAll.filter(v=>v.stage==="published").length;
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
                <div style={{fontSize:9,color:C.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:5}}>All time</div>
                <div style={{display:"flex",gap:14,marginBottom:10,paddingBottom:10,borderBottom:`0.5px solid ${C.border}`}}>
                  <div>
                    <div style={{fontSize:9,color:C.muted,letterSpacing:.6,textTransform:"uppercase"}}>Videos</div>
                    <div style={{fontSize:15,fontWeight:700,color:C.text}}>{cAll.length}</div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:C.muted,letterSpacing:.6,textTransform:"uppercase"}}>Views</div>
                    <div style={{fontSize:15,fontWeight:700,color:cViews>0?C.text:C.muted}}>{cViews>0?fmt(cViews):"—"}</div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:C.muted,letterSpacing:.6,textTransform:"uppercase"}}>Published</div>
                    <div style={{fontSize:15,fontWeight:700,color:C.text}}>{cPub}</div>
                  </div>
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
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setShowAddClient(false)}>Cancel</Btn><Btn onClick={addClient} primary disabled={adding||!newName.trim()}>Add client ✓</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AGENCY CLIENT PIPELINE ──────────────────────────────────────────────────
function AgencyClientPipeline({client,videos,target,month,workspaceId,userId,userName,onAddVideo,onMoveVideo,onMetrics,onDeleteVideo,onSetTarget,onSaveScript,onBack}){
  const[showAdd,setShowAdd]=useState(false);
  const[showGoal,setShowGoal]=useState(false);
  const[metricsVid,setMetricsVid]=useState(null);
  const[overrideVid,setOverrideVid]=useState(null);
  const[publishDateModal,setPublishDateModal]=useState(null);
  const[publishDateVal,setPublishDateVal]=useState("");
  const[confirmDel,setConfirmDel]=useState(null);
  const[notesVid,setNotesVid]=useState(null);
  const[scriptCard,setScriptCard]=useState(null);
  const[noteCounts,setNoteCounts]=useState({});
  // Keyed on the review-stage ids so this doesn't refire on every video change.
  const revKey=(videos||[]).filter(v=>v.stage==="review").map(v=>v.id).sort().join(",");
  useEffect(()=>{
    const ids=revKey?revKey.split(","):[];
    if(!ids.length){setNoteCounts({});return;}
    let dead=false;
    Promise.all(ids.map(id=>getNotes(workspaceId,id).then(n=>[id,(n||[]).length]).catch(()=>[id,0])))
      .then(pairs=>{if(!dead)setNoteCounts(Object.fromEntries(pairs));});
    return()=>{dead=true;};
  },[revKey,workspaceId]);
  // Insights must reflect THIS client, not the agency as a whole.
  const clientAnalytics=(()=>{
    const withM=(videos||[]).filter(v=>v.metricsAdded&&v.views>0);
    const top=key=>{
      const agg={};
      withM.forEach(v=>{const k=(v[key]||"").trim();if(k){agg[k]=agg[k]||{n:0,views:0};agg[k].n++;agg[k].views+=v.views;}});
      return Object.keys(agg).sort((a,b)=>(agg[b].views/agg[b].n)-(agg[a].views/agg[a].n))[0]||null;
    };
    return {hasPersonalData:withM.length>=3,topHook:top("hook"),topFormat:top("format")};
  })();

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
                    style={{background:C.surface,borderRadius:10,marginBottom:8,border:`1px solid ${isRev?"#FED7AA":hasMet?"#BBF7D0":C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)",cursor:"grab",display:"flex",overflow:"hidden",transition:"box-shadow .15s,transform .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.06)";e.currentTarget.style.transform="none";}}>
                    <div style={{width:5,background:isRev?"#F97316":stage.color,flexShrink:0,borderRadius:"10px 0 0 10px"}}/>
                    <div style={{padding:"10px 12px 0",flex:1,minWidth:0,position:"relative"}}>

                      {/* Platform · stage · actions */}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <PlatformIcon platform={v.platform}/>
                        <span style={{fontSize:10,fontWeight:500,color:isRev?"#F97316":stage.color,letterSpacing:0.2}}>{isRev?"Ready for Review":stage.label}</span>
                        <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}}>
                          {(stage.id==="idea"||stage.id==="production")&&<AIBoxIcon onClick={()=>setScriptCard(v)}/>}
                          <button onClick={()=>setConfirmDel(v.id)}
                            style={{width:18,height:18,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"transparent",transition:"color .15s,background .15s",padding:0}}
                            onMouseEnter={e=>{e.currentTarget.style.color=BRAND.red;e.currentTarget.style.background="#FEE2E2";}}
                            onMouseLeave={e=>{e.currentTarget.style.color="transparent";e.currentTarget.style.background="none";}}>×</button>
                        </div>
                      </div>

                      <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:5,lineHeight:1.35,wordBreak:"break-word"}}>{v.title}</div>

                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:7}}>
                        {v.targetDate&&<span style={{fontSize:10,color:C.muted}}>📅 {v.targetDate}</span>}
                        {noteCounts[v.id]>0&&<span style={{fontSize:10,color:C.muted,display:"inline-flex",alignItems:"center",gap:3}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:C.purple}}/>{noteCounts[v.id]} note{noteCounts[v.id]===1?"":"s"}
                        </span>}
                      </div>

                      {isPub&&!hasMet&&!unlocked&&(
                        <div style={{marginBottom:8,padding:"7px 9px",background:"#F8FAFC",borderRadius:7,border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:10,fontWeight:600,color:C.muted,marginBottom:5}}>📅 Metrics unlock {unlockDate()}</div>
                          <div style={{background:C.border,borderRadius:20,height:4,overflow:"hidden"}}>
                            <div style={{width:`${lockPct}%`,height:"100%",background:lockPct>=85?C.green:C.accent,borderRadius:20,transition:"width .3s"}}/>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:3}}>
                            <span style={{fontSize:9,color:C.muted}}>{daysGone} of 7 days</span>
                            <span onClick={()=>setOverrideVid(v)} style={{fontSize:9,color:C.accent,cursor:"pointer",textDecoration:"underline"}}>Already have data?</span>
                          </div>
                        </div>
                      )}
                      {isPub&&!hasMet&&unlocked&&(
                        <div style={{marginBottom:8,padding:"7px 9px",background:"#DCFCE7",borderRadius:7,border:"1px solid #BBF7D0",display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:13}}>✅</span>
                          <div><div style={{fontSize:11,fontWeight:700,color:C.green}}>Ready to add metrics</div><div style={{fontSize:9,color:"#15803D"}}>7 days of data</div></div>
                        </div>
                      )}
                      {hasMet&&<div style={{marginBottom:8,padding:"5px 9px",background:"#DCFCE7",borderRadius:7,border:"1px solid #BBF7D0",display:"inline-flex",alignItems:"center",gap:5}}><span style={{fontSize:10}}>📊</span><span style={{fontSize:10,fontWeight:700,color:C.green}}>{fmt(v.views||0)} views</span></div>}

                      {/* Actions — Notes and Approve belong to Ready for Review only */}
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                        {isRev&&(
                          <button onClick={()=>setNotesVid(v)}
                            style={{fontSize:10,padding:"5px 11px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text,fontWeight:500,display:"inline-flex",alignItems:"center",gap:5,transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.purple;e.currentTarget.style.color=C.purple;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text;}}>
                            <span style={{width:5,height:5,borderRadius:"50%",background:C.purple}}/>Review notes
                          </button>
                        )}
                        {isRev&&<button onClick={()=>handleMove(v.id,"published")} style={{fontSize:10,padding:"5px 11px",background:BRAND.green,border:"none",borderRadius:20,cursor:"pointer",color:"#FFF",fontWeight:600}}>Approve ✓</button>}
                        {isPub&&!hasMet&&unlocked&&<button onClick={()=>setMetricsVid(v)} style={{fontSize:10,padding:"5px 11px",background:C.green,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:600}}>📊 Add metrics</button>}
                        {isCf&&<div style={{display:"flex",gap:4,alignItems:"center",marginLeft:"auto"}}><span style={{fontSize:10,color:C.red,fontWeight:700}}>Delete?</span><button onClick={()=>{onDeleteVideo(v.id);setConfirmDel(null);}} style={{fontSize:10,padding:"2px 7px",background:C.red,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>Yes</button><button onClick={()=>setConfirmDel(null)} style={{fontSize:10,padding:"2px 7px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>No</button></div>}
                      </div>

                      {/* Progress across the 5 agency stages + script entry */}
                      <div style={{marginTop:8,marginLeft:-12,marginRight:-12,borderTop:`0.5px solid ${C.border}`,padding:"8px 12px",display:"flex",flexDirection:"column",gap:7}}>
                        <div style={{display:"flex",gap:3}}>
                          {AGENCY_STAGES.map((st2,i2)=>{
                            const idx=AGENCY_STAGES.findIndex(x=>x.id===stage.id);
                            return <div key={st2.id} style={{height:4,flex:1,borderRadius:2,background:i2<=idx?st2.color:C.border,transition:"background .3s"}}/>;
                          })}
                        </div>
                        {(stage.id==="idea"||stage.id==="production")&&(
                          <button onClick={()=>setScriptCard(v)}
                            style={{width:"100%",padding:"7px 0",borderRadius:7,border:`1.5px solid ${v.script?BRAND.red:C.border}`,background:v.script?BRAND.red+"12":C.light,cursor:"pointer",fontSize:11,fontWeight:600,color:v.script?BRAND.red:C.muted,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.red;e.currentTarget.style.background=BRAND.red+"18";e.currentTarget.style.color=BRAND.red;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=v.script?BRAND.red:C.border;e.currentTarget.style.background=v.script?BRAND.red+"12":C.light;e.currentTarget.style.color=v.script?BRAND.red:C.muted;}}>
                            <div style={{width:7,height:7,borderRadius:1,background:"currentColor"}}/>
                            {v.script?(()=>{try{const p=JSON.parse(v.script);const wc=Object.values(p).join(" ").trim().split(/\s+/).filter(Boolean).length;return wc>0?`Script · ${wc} words`:"Script written";}catch(e){return"Script written";}})():"Write your script"}
                          </button>
                        )}
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
        {scriptCard&&<ScriptDocument card={scriptCard} analytics={clientAnalytics} onSave={s=>{onSaveScript&&onSaveScript(scriptCard.id,s);setScriptCard(null);}} onClose={()=>setScriptCard(null)}/>}
    </div>
  );
}

// ── AGENCY APP ────────────────────────────────────────────────────────────────
// ── AGENCY ANALYTICS ──────────────────────────────────────────────────────────
// Agency level answers "who needs attention". Client level answers "what's working".
// Every derived figure carries its n, and thin channels collapse rather than lie.
const median=arr=>{
  const a=arr.filter(x=>typeof x==="number"&&isFinite(x)).sort((x,y)=>x-y);
  if(!a.length)return null;
  return a.length%2?a[(a.length-1)/2]:Math.round((a[a.length/2-1]+a[a.length/2])/2);
};
const bestBy=(vids,key)=>{
  const agg={};
  vids.forEach(v=>{const k=(v[key]||"").trim();if(k){agg[k]=agg[k]||{n:0,views:0};agg[k].n++;agg[k].views+=(v.views||0);}});
  const best=Object.keys(agg).sort((a,b)=>(agg[b].views/agg[b].n)-(agg[a].views/agg[a].n))[0];
  return best?{value:best,n:agg[best].n}:null;
};
const MIN_PER_CHANNEL=3;

function AgencyAnalytics({clients,videos,targets,month,onMonthChange,onOpenClient}){
  const mVids=videos.filter(v=>v.month===month);
  const published=mVids.filter(v=>v.stage==="published");
  const measured=mVids.filter(v=>v.metricsAdded&&(v.views||0)>0);
  const totalViews=measured.reduce((a,v)=>a+(v.views||0),0);
  const med=median(measured.map(v=>v.views||0));
  const activeClients=clients.filter(c=>mVids.some(v=>v.clientId===c.id)).length;
  const maxGoal=Math.max(1,...clients.map(c=>(targets.find(t=>t.client_id===c.id&&t.month===month)?.goal)||0));

  const stat=(label,value,color)=>(
    <div style={{background:C.light,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${color}`}}>
      <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{label}</div>
      <div style={{fontSize:19,fontWeight:600,color:C.text,letterSpacing:-0.3}}>{value}</div>
    </div>
  );

  return(
    <div>
      {/* Agency wide */}
      <Card pad={0} style={{marginBottom:20,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"16px 20px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,marginBottom:16,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Agency analytics</div>
              <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2}}>{monthLabel(month)}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <button onClick={()=>onMonthChange(addMonths(month,-1))} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.text}}>←</button>
              <button onClick={()=>onMonthChange(addMonths(month,1))} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.text}}>→</button>
              {month!==curMonth()&&<button onClick={()=>onMonthChange(curMonth())} style={{padding:"5px 10px",border:`1px solid ${C.border}`,borderRadius:7,background:C.light,cursor:"pointer",fontSize:11,color:C.muted}}>This month</button>}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:9}}>
            {stat("Total views",totalViews>0?fmt(totalViews):"—",BRAND.blue)}
            {stat("Published",published.length,BRAND.green)}
            {stat("Median per video",med!==null?fmt(med):"—",BRAND.yellow)}
            {stat("Active clients",`${activeClients} of ${clients.length}`,BRAND.red)}
          </div>

          {clients.length>0&&(
            <div style={{marginTop:16,paddingTop:14,borderTop:`0.5px solid ${C.border}`}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:9}}>Output this month</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {clients.map((c,i)=>{
                  const cv=mVids.filter(v=>v.clientId===c.id);
                  const cp=cv.filter(v=>v.stage==="published").length;
                  const goal=(targets.find(t=>t.client_id===c.id&&t.month===month)?.goal)||0;
                  const pct=goal>0?Math.min(100,Math.round(cp/goal*100)):Math.min(100,Math.round(cp/maxGoal*100));
                  const color=goal>0?(pct>=80?BRAND.green:pct>=45?BRAND.blue:BRAND.red):C.border;
                  return(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:11,color:C.text,width:96,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.emoji} {c.name}</span>
                      <div style={{flex:1,height:7,background:C.light,borderRadius:4,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:4,transition:"width .4s"}}/>
                      </div>
                      <span style={{fontSize:11,color:C.muted,width:62,textAlign:"right"}}>{goal>0?`${cp} / ${goal}`:`${cp}`}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:9}}>By client</div>

      {clients.length===0&&(
        <Card><div style={{textAlign:"center",padding:"34px 20px",color:C.muted,fontSize:13}}>Add a client to start seeing analytics.</div></Card>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))",gap:12}}>
        {clients.map(c=>{
          const cv=mVids.filter(v=>v.clientId===c.id);
          const cm=cv.filter(v=>v.metricsAdded&&(v.views||0)>0);
          const cViews=cm.reduce((a,v)=>a+(v.views||0),0);
          const cPub=cv.filter(v=>v.stage==="published").length;
          const byChannel={};
          cm.forEach(v=>{const p=v.platform||"Other";(byChannel[p]=byChannel[p]||[]).push(v);});
          const channels=Object.keys(byChannel).sort((a,b)=>
            byChannel[b].reduce((s,v)=>s+v.views,0)-byChannel[a].reduce((s,v)=>s+v.views,0));
          const canSplit=channels.some(p=>byChannel[p].length>=MIN_PER_CHANNEL);
          const maxCh=Math.max(1,...channels.map(p=>byChannel[p].reduce((s,v)=>s+v.views,0)));
          const hook=bestBy(cm,"hook"), format=bestBy(cm,"format");
          return(
            <Card key={c.id} pad={16}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:13}}>
                <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
                  <div style={{width:28,height:28,borderRadius:8,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{c.emoji||"🏢"}</div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{fontSize:10,color:C.muted}}>{cPub} published · {cViews>0?fmt(cViews)+" views":"no metrics yet"}</div>
                  </div>
                </div>
                <button onClick={()=>printClientReport(c,cv,cm,month)}
                  style={{fontSize:10,padding:"5px 10px",border:`0.5px solid ${C.border}`,borderRadius:20,background:C.surface,cursor:"pointer",color:C.muted,whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                  Client report
                </button>
              </div>

              {cm.length===0?(
                <div style={{background:C.light,border:`0.5px solid ${C.border}`,borderLeft:`3px solid ${C.border}`,borderRadius:7,padding:"11px 12px"}}>
                  <div style={{fontSize:11,color:C.text,marginBottom:2}}>No metrics yet this month</div>
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>Add metrics to published videos and this fills in.</div>
                </div>
              ):(
                <>
                  {!canSplit&&(
                    <div style={{background:C.light,border:`0.5px solid ${C.border}`,borderLeft:`3px solid ${BRAND.yellow}`,borderRadius:7,padding:"11px 12px",marginBottom:13}}>
                      <div style={{fontSize:11,color:C.text,marginBottom:2}}>Not enough data to split by channel yet</div>
                      <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>Only {cm.length} video{cm.length===1?"":"s"} {cm.length===1?"has":"have"} metrics. Showing combined results until a channel has {MIN_PER_CHANNEL}.</div>
                    </div>
                  )}
                  <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>{canSplit?"What's working":"Across all channels"}</div>
                  <div style={{display:"flex",gap:7,marginBottom:canSplit?13:0}}>
                    <div style={{flex:1,background:C.light,borderRadius:7,padding:"7px 9px",borderLeft:`3px solid ${BRAND.red}`}}>
                      <div style={{fontSize:9,color:C.muted}}>Top hook</div>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{hook?hook.value:"—"} {hook&&<span style={{color:C.muted,fontWeight:400}}>n={hook.n}</span>}</div>
                    </div>
                    <div style={{flex:1,background:C.light,borderRadius:7,padding:"7px 9px",borderLeft:`3px solid ${BRAND.yellow}`}}>
                      <div style={{fontSize:9,color:C.muted}}>{canSplit?"Top format":"Median"}</div>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>
                        {canSplit?(format?format.value:"—"):fmt(median(cm.map(v=>v.views))||0)}
                        {canSplit&&format&&<span style={{color:C.muted,fontWeight:400}}> n={format.n}</span>}
                      </div>
                    </div>
                  </div>

                  {canSplit&&(
                    <>
                      <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>By channel</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {channels.map(p=>{
                          const list=byChannel[p];
                          const v=list.reduce((s,x)=>s+x.views,0);
                          const h=list.length>=MIN_PER_CHANNEL?bestBy(list,"hook"):null;
                          return(
                            <div key={p} style={{display:"flex",alignItems:"center",gap:7}}>
                              <div style={{width:16,flexShrink:0,display:"flex"}}><PlatformIcon platform={p}/></div>
                              <div style={{flex:1,height:6,background:C.light,borderRadius:4,overflow:"hidden"}}>
                                <div style={{width:`${Math.round(v/maxCh*100)}%`,height:"100%",background:BRAND.blue,borderRadius:4}}/>
                              </div>
                              <span style={{fontSize:10,color:C.muted,width:88,textAlign:"right",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                                {fmt(v)} · {h?h.value:`n=${list.length}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              <button onClick={()=>onOpenClient(c)}
                style={{width:"100%",marginTop:13,padding:"7px 0",background:C.light,border:`0.5px solid ${C.border}`,borderRadius:7,cursor:"pointer",fontSize:11,color:C.muted,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                Open pipeline →
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Printable client report. Every figure here is computed from saved metrics —
// nothing is written by a model, so anything on the page can be checked.
const printClientReport=(client,allVids,measured,month)=>{
  const esc=x=>String(x==null?"":x).replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const views=measured.reduce((a,v)=>a+(v.views||0),0);
  const med=median(measured.map(v=>v.views||0));
  const pub=allVids.filter(v=>v.stage==="published").length;
  const hook=bestBy(measured,"hook"), format=bestBy(measured,"format");
  const byCh={};
  measured.forEach(v=>{const p=v.platform||"Other";(byCh[p]=byCh[p]||[]).push(v);});
  const chRows=Object.keys(byCh)
    .sort((a,b)=>byCh[b].reduce((s,v)=>s+v.views,0)-byCh[a].reduce((s,v)=>s+v.views,0))
    .map(p=>{
      const list=byCh[p];
      const h=list.length>=MIN_PER_CHANNEL?bestBy(list,"hook"):null;
      return `<tr><td>${esc(p)}</td><td>${list.length}</td><td>${fmt(list.reduce((s,v)=>s+v.views,0))}</td><td>${h?esc(h.value)+` <span class="n">n=${h.n}</span>`:`<span class="n">too few videos</span>`}</td></tr>`;
    }).join("");
  const top=[...measured].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5)
    .map(v=>`<tr><td>${esc(v.title)}</td><td>${esc(v.platform||"")}</td><td>${esc(v.hook||"—")}</td><td>${fmt(v.views||0)}</td></tr>`).join("");
  const w=window.open("","_blank");
  w.document.write(`<html><head><title>${esc(client.name)} — ${esc(monthLabel(month))}</title><style>
    body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#111;line-height:1.6;padding:0 20px}
    .bar{display:flex;height:4px;margin-bottom:22px}.bar div{flex:1}
    h1{font-size:23px;margin:0 0 4px;letter-spacing:-.3px}
    .meta{font-size:13px;color:#666;margin-bottom:26px}
    h2{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#555;margin:26px 0 10px;font-family:system-ui,sans-serif}
    .grid{display:flex;gap:10px;margin-bottom:6px}
    .kpi{flex:1;border:1px solid #e8e8e8;border-radius:8px;padding:11px 13px}
    .kpi .l{font-size:10px;color:#666;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:.6px}
    .kpi .v{font-size:20px;font-weight:bold}
    table{width:100%;border-collapse:collapse;font-size:13px;font-family:system-ui,sans-serif}
    th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:1px solid #e8e8e8;padding:7px 8px}
    td{padding:7px 8px;border-bottom:1px solid #f2f2f2}
    .n{color:#888;font-size:11px}
    .note{font-size:12px;color:#666;background:#fafafa;border-left:3px solid #F0C040;padding:9px 12px;border-radius:5px;font-family:system-ui,sans-serif}
    .foot{margin-top:30px;font-size:11px;color:#888;font-family:system-ui,sans-serif;border-top:1px solid #e8e8e8;padding-top:12px}
    @media print{body{margin:16px}}
  </style></head><body>
    <div class="bar"><div style="background:#E24B4A"></div><div style="background:#F0C040"></div><div style="background:#378ADD"></div><div style="background:#1D9E75"></div></div>
    <h1>${esc(client.name)}</h1>
    <div class="meta">Content report · ${esc(monthLabel(month))}</div>
    <h2>Summary</h2>
    <div class="grid">
      <div class="kpi"><div class="l">Published</div><div class="v">${pub}</div></div>
      <div class="kpi"><div class="l">Total views</div><div class="v">${views>0?fmt(views):"—"}</div></div>
      <div class="kpi"><div class="l">Median per video</div><div class="v">${med!==null?fmt(med):"—"}</div></div>
      <div class="kpi"><div class="l">With metrics</div><div class="v">${measured.length}</div></div>
    </div>
    ${measured.length<MIN_PER_CHANNEL?`<div class="note">Based on ${measured.length} video${measured.length===1?"":"s"} with metrics. Treat these as early signals rather than conclusions.</div>`:""}
    <h2>What performed best</h2>
    <div class="grid">
      <div class="kpi"><div class="l">Top hook</div><div class="v">${hook?esc(hook.value):"—"}</div><div class="n">${hook?`across ${hook.n} video${hook.n===1?"":"s"}`:"no data yet"}</div></div>
      <div class="kpi"><div class="l">Top format</div><div class="v">${format?esc(format.value):"—"}</div><div class="n">${format?`across ${format.n} video${format.n===1?"":"s"}`:"no data yet"}</div></div>
    </div>
    ${chRows?`<h2>By channel</h2><table><tr><th>Channel</th><th>Videos</th><th>Views</th><th>Best hook</th></tr>${chRows}</table>`:""}
    ${top?`<h2>Top videos</h2><table><tr><th>Title</th><th>Channel</th><th>Hook</th><th>Views</th></tr>${top}</table>`:""}
    <div class="foot">Figures calculated from metrics recorded in ContentHub Sidekick. Averages over fewer than ${MIN_PER_CHANNEL} videos are shown with their sample size.</div>
    <script>window.onload=()=>{window.print();}<\/script>
  </body></html>`);
  w.document.close();
};

// ── AGENCY BRAINSTORM ─────────────────────────────────────────────────────────
// Same tool as Business, scoped to one client: its profile drives the search,
// its videos drive the platform default, and ideas land in its pipeline.
function AgencyBrainstorm({clients,videos,userId,month,onSendToPipeline}){
  const[clientId,setClientId]=useState(clients.length===1?clients[0].id:null);
  const client=clients.find(c=>c.id===clientId)||null;

  if(clients.length===0)return(
    <Card><div style={{textAlign:"center",padding:"48px 20px"}}>
      <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:6}}>No clients yet</div>
      <div style={{fontSize:13,color:C.muted}}>Add a client before brainstorming — every campaign belongs to one.</div>
    </div></Card>
  );

  if(!client)return(
    <div>
      <Card pad={0} style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"18px 20px 20px"}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Brainstorm</div>
          <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2,marginBottom:4}}>Who are we creating for?</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.55}}>Pick a client — their brand and audience shape what comes back.</div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        {clients.map(c=>{
          const n=videos.filter(v=>v.clientId===c.id).length;
          return(
            <div key={c.id} onClick={()=>setClientId(c.id)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",transition:"border-color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{width:30,height:30,borderRadius:8,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{c.emoji||"🏢"}</div>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{fontSize:10,color:C.muted}}>{n} video{n===1?"":"s"}</div>
              </div>
              <span style={{fontSize:11,color:C.muted}}>→</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // The client profile stands in for the business profile the tool expects.
  let cp={};
  try{cp=typeof client.client_profile==="string"?JSON.parse(client.client_profile||"{}"):(client.client_profile||{});}catch(e){cp={};}
  const bp={businessName:client.name,whatYouDo:cp.whatTheyDo||"",audience:cp.audience||"",goal:cp.goal||"",tone:cp.tone||""};

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
        <div style={{width:26,height:26,borderRadius:7,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{client.emoji||"🏢"}</div>
        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{client.name}</div>
        {clients.length>1&&<button onClick={()=>setClientId(null)} style={{marginLeft:"auto",padding:"5px 11px",border:`0.5px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:11,color:C.muted}}>Switch client</button>}
      </div>
      <CampaignCreator
        key={client.id}
        userId={userId}
        businessProfile={bp}
        videos={videos.filter(v=>v.clientId===client.id)}
        onSendToPipeline={ideas=>onSendToPipeline(client.id,ideas)}
      />
    </div>
  );
}

function AgencyApp({user,profile,onLogout}){
  const[clientError,setClientError]=useState(null);
  const[clients,setClients]=useState([]);
  const[videos,setVideos]=useState([]);
  const[targets,setTargets]=useState([]);
  const[month,setMonth]=useState(curMonth());
  const[selectedClient,setSelectedClient]=useState(null);
  const[page,setPage]=useState("dashboard");
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
    setClientError(null);
    const id=uuid();
    const newClient={id,name,emoji,workspace_id:wsId,client_profile:null};
    setClients(prev=>[...prev,newClient]);
    const res=await sbInsertX("agency_clients",{id,workspace_id:wsId,name,emoji,created_at:new Date().toISOString()});
    if(!res.ok){
      // Don't vanish the row — say why it didn't save.
      setClients(prev=>prev.filter(c=>c.id!==id));
      setClientError(res.error||"Could not save the client");
      return null;
    }
    setClientError(null);
    load(); // refresh in the background; the caller shouldn't wait on it
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

  const saveScript=useCallback(async(id,script)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,script}:v));
    await sbUpdate("agency_videos","id",id,{script});
  },[]);

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
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          {[["dashboard","Dashboard"],["brainstorm","Brainstorm"],["analytics","Analytics"]].map(([id,label])=>(
            <button key={id} onClick={()=>{setPage(id);setSelectedClient(null);}}
              style={{padding:"5px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:page===id&&!selectedClient?600:400,color:page===id&&!selectedClient?C.text:C.muted,background:page===id&&!selectedClient?C.light:"transparent",borderRadius:7}}>{label}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:C.muted}}>{profile?.name||user.email}</span>
          <button onClick={onLogout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}}>Sign out</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {selectedClient
          ?<AgencyClientPipeline client={selectedClient} videos={clientVids} target={clientTarget} month={month} workspaceId={wsId} userId={user.id} userName={profile?.name||user.email} onAddVideo={addVideo} onMoveVideo={moveVideo} onMetrics={saveMetrics} onDeleteVideo={deleteVideo} onSetTarget={setTarget} onSaveScript={saveScript} onBack={()=>setSelectedClient(null)}/>
          :page==="analytics"
          ?<AgencyAnalytics clients={clients} videos={videos} targets={targets} month={month} onMonthChange={setMonth} onOpenClient={c=>setSelectedClient(c)}/>
          :page==="brainstorm"
          ?<AgencyBrainstorm clients={clients} videos={videos} userId={user.id} month={month} onSendToPipeline={(clientId,ideas)=>{ideas.forEach(v=>addVideo({...v,clientId}));}}/>
          :<AgencyDashboard clientError={clientError} clients={clients} videos={videos} targets={targets} month={month} onMonthChange={setMonth} onSelectClient={c=>{setSelectedClient(c);}} onAddClient={addClient} onSetTarget={setTarget}/>
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
        if(s?.user){
          const p=await sbGetOne("profiles","id",s.user.id);
          const cached=localStorage.getItem(`sk_acct_${s.user.id}`);
          // The profiles row is the source of truth, but a failed read must not
          // silently demote an agency user to Business. Fall back to what we
          // recorded at sign-in, and repair the row when it's missing.
          let acct=p?.account_type||cached||null;
          // No profile row and nothing cached? Ask the data instead of guessing:
          // membership of a workspace means this is an agency account.
          if(!acct){
            const mem=await getWorkspaceMember(s.user.id);
            if(mem?.workspace_id)acct="agency";
          }
          acct=acct||"creator";
          // Only cache a value we actually established — never the fallback,
          // or a single failed read would pin an agency user to Business.
          if(p?.account_type||acct!=="creator"){
            try{localStorage.setItem(`sk_acct_${s.user.id}`,acct);}catch(e){}
          }
          if(p&&!p.account_type){sbUpdate("profiles","id",s.user.id,{account_type:acct});}
          if(!p){sbInsertX("profiles",{id:s.user.id,name:s.user.email,email:s.user.email,account_type:acct});}
          setUser(s.user);setProfile(p||{account_type:acct});setState(acct);
        }
        else setState("landing");
      }catch(e){setState("landing");}
    })();
  },[]);

  useEffect(()=>{const iv=setInterval(async()=>{const s=localStorage.getItem("sk_auth");if(s)await sbGetSession();},10*60*1000);return()=>clearInterval(iv);},[]);

  const login=(u,p)=>{
    const acct=p?.account_type||"creator";
    try{localStorage.setItem(`sk_acct_${u.id}`,acct);}catch(e){}
    setUser(u);setProfile(p);setState(acct);
  };
  const logout=()=>{sbSignOut();setUser(null);setProfile(null);setState("landing");};
  const pick=path=>{if(path==="login"){setAuthPath(null);setState("auth");}else{setAuthPath(path);setState("auth");}};

  if(state==="loading")return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:C.text}}>ContentHub Sidekick</div><div style={{fontSize:12,color:C.muted,marginTop:5}}>Loading...</div></div></div>);
  if(state==="landing")return<Landing onPath={pick}/>;
  if(state==="auth")return<AuthScreen path={authPath||"creator"} onLogin={login} onBack={()=>setState("landing")}/>;
  if(state==="creator")return<CreatorApp user={user} profile={profile} onLogout={logout}/>;

    if(state==="agency")return<AgencyApp user={user} profile={profile} onLogout={logout}/>;
  return null;
}
