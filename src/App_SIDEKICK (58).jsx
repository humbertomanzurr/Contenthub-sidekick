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
      await sbInsert("profiles",{id:u2.id,name:email,email,account_type:path});
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






const SCRIPT_ELEMENTS={
  "Hook starters":[
    "I almost didn't share this, but —",
    "Nobody talks about what happens after —",
    "The moment everything changed was —",
    "Here's what [X] years actually taught me —",
    "We were [X] months in when —",
    "Stop me if this sounds familiar —",
  ],
  "One-liners":[
    "The thing nobody told me before I started.",
    "It took me [X] years to learn this in [X] seconds.",
    "This is the version of the story people don't post.",
    "I was doing it wrong. Here's what changed.",
    "The result surprised even me.",
    "Simple. But not easy.",
  ],
  "Power words":[
    "Honest","Real","Nobody tells you","Unfiltered",
    "The truth about","What actually","Finally","Raw",
    "Behind the scenes","Before and after","The real reason",
  ],
  "CTAs":[
    "Tell me if this happened to you too.",
    "Save this if you need it later.",
    "What would you have done differently?",
    "This one's for whoever needed to hear it.",
    "Share this with someone building something.",
    "Follow for more honest takes on [topic].",
  ],
  "Transitions":[
    "Here's what I didn't expect —",
    "But then something shifted —",
    "The part that changed everything —",
    "And that's when I realized —",
    "Fast forward [X] months —",
    "What I know now that I didn't then —",
  ],
};

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
      {analytics?.hasPersonalData?(
        <div style={{padding:"8px 14px",background:"#FAFAFA",borderBottom:`1px solid ${C.border}`,fontSize:10,color:C.muted,lineHeight:1.5}}>
          {topHook&&<span>Your <strong style={{color:BRAND.red}}>{topHook}</strong> content performs best. </span>}
          {topFormat&&<span>Your audience responds to <strong style={{color:BRAND.blue}}>{topFormat}</strong> format.</span>}
        </div>
      ):(
        <div style={{padding:"7px 14px",background:"#FFFBEB",borderBottom:`1px solid #FCD34D`,fontSize:10,color:"#92400E",lineHeight:1.5,display:"flex",gap:6,alignItems:"flex-start"}}>
          <span style={{flexShrink:0}}>⚡</span>
          <span>Channel best practices for now — <strong>personalized insights unlock</strong> as you add video metrics.</span>
        </div>
      )}
      {!analytics?.hasPersonalData&&(
        <div style={{padding:"10px 14px 0"}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:500,letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>What works on {platform}</div>
          {(GENERIC_INSIGHTS[platform]||GENERIC_INSIGHTS["TikTok"]).map((ins,i)=>(
            <div key={i} style={{display:"flex",gap:6,marginBottom:7}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green,BRAND.red][i],flexShrink:0,marginTop:4}}/>
              <div style={{fontSize:11,color:C.text,lineHeight:1.45}}>
                {ins.insight}<span style={{display:"block",fontSize:10,color:C.muted,marginTop:1}}>{ins.sub}</span>
              </div>
            </div>
          ))}
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
  const[activeCategory,setActiveCategory]=useState("Hook starters");
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
  const dirs=(CHANNEL_DIRECTIONS[platform]||CHANNEL_DIRECTIONS["TikTok"]).filter(d=>d.field===focusField||focusField==="notes").slice(0,3);
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

          {/* LEFT — Elements sidebar */}
          <div style={{borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden",background:"#FAFAFA"}}>
            <div style={{padding:"10px 12px",borderBottom:`0.5px solid ${C.border}`}}>
              <div style={{fontSize:9,fontWeight:500,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Elements</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {Object.keys(SCRIPT_ELEMENTS).map(cat=>(
                  <button key={cat} onClick={()=>setActiveCategory(cat)}
                    style={{textAlign:"left",padding:"5px 8px",borderRadius:6,border:"none",background:activeCategory===cat?BRAND.red+"12":"transparent",color:activeCategory===cat?BRAND.red:C.muted,cursor:"pointer",fontSize:11,fontWeight:activeCategory===cat?500:400,transition:"all .15s"}}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"10px 10px"}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:8,lineHeight:1.4}}>Click to insert into focused section</div>
              {(SCRIPT_ELEMENTS[activeCategory]||[]).map((el,i)=>(
                <div key={i} onClick={()=>insertElement(el)}
                  style={{padding:"7px 9px",borderRadius:7,border:`0.5px solid ${C.border}`,marginBottom:5,cursor:"pointer",fontSize:11,color:C.text,lineHeight:1.4,background:C.surface,transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.red;e.currentTarget.style.background=BRAND.red+"08";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
                  {el}
                </div>
              ))}
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
              <div style={{fontSize:9,fontWeight:500,letterSpacing:1,textTransform:"uppercase",color:C.muted,margin:"12px 0 8px"}}>Directions · {focusField}</div>
              {dirs.map((d,i)=>(
                <div key={i} style={{padding:"7px 9px",borderRadius:7,border:`0.5px solid ${C.border}`,marginBottom:5,cursor:"pointer",background:C.surface,transition:"border-color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=insColors[i]}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:2}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:insColors[i],flexShrink:0}}/>
                    <div style={{fontSize:11,fontWeight:500,color:C.text}}>{d.label}</div>
                  </div>
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.35}}>{d.desc}</div>
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
      const ctrl=new AbortController();
      const t=setTimeout(()=>ctrl.abort(),50000);
      let r,d;
      try{
        r=await fetch("/api/chat",{
          method:"POST",
          signal:ctrl.signal,
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            messages:[{role:"user",content:`Find high-performing videos for this campaign: ${prompt}`}],
            systemPrompt:sys,
            useWebSearch:true
          })
        });
        clearTimeout(t);
        d=await r.json();
      }catch(fetchErr){
        clearTimeout(t);
        // Timeout or network error — use fallback refs
        d={content:null};
      }
      if(d&&d.content){
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
                <div style={{textAlign:"center",padding:"16px 8px",color:C.muted,fontSize:11,border:`1px dashed ${C.border}`,borderRadius:8,background:C.bg,lineHeight:1.6}}>
                  Set a goal above<br/>to fill your pipeline
                </div>
              )}
              {stage.id==="idea"&&[...Array(emptyCount)].map((_,i)=>(
                <div key={`e${i}`} onClick={()=>setShowAdd(true)} style={{background:C.surface,borderRadius:8,padding:12,marginBottom:8,border:`1px dashed ${C.border}`,cursor:"pointer",textAlign:"center",transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.red;e.currentTarget.style.background=BRAND.red+"06";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
                  <div style={{fontSize:16,marginBottom:3}}>+</div><div style={{fontSize:10,fontWeight:700,color:C.muted}}>Add idea</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {showAdd&&<AddVideoModal onClose={()=>setShowAdd(false)} onSave={v=>{onAdd(v);setShowAdd(false);if(tourStep===2)onTourNext&&onTourNext();}} month={month}/>}
      {metricsVid&&<MetricsModal video={metricsVid} onClose={()=>setMetricsVid(null)} onSave={m=>{onMetrics(metricsVid.id,m);setMetricsVid(null);if(tourStep===5)onTourNext&&onTourNext();}}/>}
      {overrideVid&&<EarlyMetricsModal video={overrideVid} onClose={()=>setOverrideVid(null)} onSave={m=>{onMetrics(overrideVid.id,m);setOverrideVid(null);}}/>}
      {shootCard&&<ShootPlanModal card={shootCard} businessProfile={businessProfile} onClose={()=>setShootCard(null)} onSave={s=>{onSaveShot(shootCard.id,s);setShootCard(null);}}/>}
      {shootViewCard&&<ShootPlanViewer card={shootViewCard} onClose={()=>setShootViewCard(null)} onReplan={()=>{setShootCard(shootViewCard);setShootViewCard(null);}}/>}
      {editCard&&<EditAdviceModal card={editCard} businessProfile={businessProfile} onClose={()=>setEditCard(null)} onSave={s=>{onSaveEdit(editCard.id,s);setEditCard(null);}}/>}
      {editViewCard&&<EditAdviceViewer card={editViewCard} onClose={()=>setEditViewCard(null)}/>}
      {scriptCard&&<ScriptDocument card={scriptCard} analytics={(()=>{
        const wm=videos.filter(v=>v.metricsAdded&&v.views>0);
        const grp=(vs,k)=>{const m={};vs.forEach(v=>{if(!v[k])return;if(!m[v[k]])m[v[k]]={n:0,s:0};m[v[k]].n++;m[v[k]].s+=v.views;});return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n)})).sort((a,b)=>b.avg-a.avg);};
        const topHook=grp(wm,"hook")[0]?.name;
        const topFormat=grp(wm,"format")[0]?.name;
        return{topHook,topFormat,hasPersonalData:wm.length>=3};
      })()}
      onSave={s=>{onSaveScript(scriptCard.id,s);setScriptCard(null);}} onClose={()=>setScriptCard(null)}/>}
      {confirmDel&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
        <div style={{background:C.surface,borderRadius:12,padding:24,width:320,boxShadow:"0 8px 32px rgba(0,0,0,.2)"}}>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:8}}>Delete this video?</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:20}}>This can't be undone.</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>setConfirmDel(null)} style={{padding:"7px 16px",border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12}}>Cancel</button>
            <button onClick={()=>{onDelete(confirmDel);setConfirmDel(null);}} style={{padding:"7px 16px",background:BRAND.red,color:"#FFF",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600}}>Delete</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── COMPONENT ALIASES ─────────────────────────────────────────────────────────
const ShootPlanModal=ShootDirector;
const ShootPlanViewer=ShotListViewer;
const EditAdviceModal=EditAdviceGenerator;
function EarlyMetricsModal({video,onClose,onSave}){
  return <MetricsModal video={video} onClose={onClose} onSave={onSave} early={true}/>;
}

// ── UTILITY ───────────────────────────────────────────────────────────────────
const shMd="0 4px 20px rgba(0,0,0,.1)";
const inp={width:"100%",padding:"10px 12px",border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,background:C.surface,color:C.text,outline:"none",fontFamily:"system-ui"};

// ── BUSINESS PROFILE SETUP ────────────────────────────────────────────────────
const BP_QUESTIONS=[
  {key:"businessName",label:"What's your business called?",hint:"The name you go by publicly",placeholder:"Iron Forge CrossFit — Austin, TX"},
  {key:"whatYouDo",label:"What do you make or do?",hint:"One sentence — be specific",placeholder:"A boutique gym helping busy professionals get strong"},
  {key:"audience",label:"Who watches your content?",hint:"Who are you making this for?",placeholder:"25-40 year olds who want to work out but say they have no time"},
  {key:"goal",label:"What do you want content to do?",hint:"What should viewers do or feel after watching?",placeholder:"Book a free trial class or just trust us more"},
  {key:"tone",label:"How does your brand sound?",hint:"Describe your voice — this shapes the creative directions",placeholder:"Energetic and real. Never corporate. Never pushy."},
];

function BusinessProfileSetup({onComplete,existing}){
  const[step,setStep]=useState(0);
  const[vals,setVals]=useState({businessName:"",whatYouDo:"",audience:"",goal:"",tone:"",...(existing||{})});
  const[showWelcome,setShowWelcome]=useState(!existing);
  const q=BP_QUESTIONS[step];
  const isLast=step===BP_QUESTIONS.length-1;
  const canNext=vals[q?.key]?.trim().length>0;
  const bColors=[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green,BRAND.red];

  if(showWelcome)return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(480px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"40px 36px",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,marginBottom:16,justifyContent:"center"}}>
          <div style={{width:16,height:24,borderRadius:4,background:BRAND.red}}/>
          <div style={{width:11,height:16,borderRadius:4,background:BRAND.yellow,marginBottom:3}}/>
          <div style={{width:18,height:11,borderRadius:4,background:BRAND.blue,marginBottom:7}}/>
          <div style={{width:10,height:19,borderRadius:4,background:BRAND.green,marginBottom:2}}/>
        </div>
        <div style={{fontSize:22,fontWeight:500,color:C.text,letterSpacing:-0.5,marginBottom:10}}>Welcome to ContentHub Sidekick</div>
        <div style={{fontSize:14,color:C.text,fontWeight:500,lineHeight:1.6,marginBottom:8}}>AI handles the clutter.<br/>You dive into the human part.</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:24}}>The pipeline, the research, the analytics — organized. So your brain stays free for the things it does that no algorithm ever could.</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
          {[["✦ Creativity",BRAND.red],["😂 Humour",BRAND.yellow],["🌊 True virality",BRAND.blue],["🎯 Point of view",BRAND.green]].map(([t,c])=>(
            <span key={t} style={{fontSize:11,color:c,background:c+"18",padding:"4px 12px",borderRadius:20,border:`1px solid ${c}30`,fontWeight:500}}>{t}</span>
          ))}
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Tell us about your brand — so we can make this feel like yours.</div>
        <button onClick={()=>setShowWelcome(false)} style={{padding:"12px 32px",background:C.text,color:"#FFF",border:"none",borderRadius:10,fontSize:14,fontWeight:500,cursor:"pointer"}}>Let's set it up →</button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(480px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"36px 32px"}}>
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {BP_QUESTIONS.map((_,i)=><div key={i} style={{height:4,borderRadius:20,flex:i===step?3:1,background:i<=step?bColors[i]:C.border,transition:"all .3s"}}/>)}
        </div>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:0.5,marginBottom:6,color:bColors[step]}}>{step+1} of {BP_QUESTIONS.length}</div>
        <div style={{fontSize:20,fontWeight:500,color:C.text,marginBottom:5,letterSpacing:-0.3}}>{q.label}</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.5}}>{q.hint}</div>
        <input autoFocus value={vals[q.key]} onChange={e=>setVals(p=>({...p,[q.key]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&canNext&&(isLast?onComplete(vals):setStep(s=>s+1))} placeholder={q.placeholder} style={{...inp,fontSize:14,padding:"12px 14px",marginBottom:22}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {step>0?<button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0}}>← Back</button>:<div/>}
          <button onClick={()=>canNext&&(isLast?onComplete(vals):setStep(s=>s+1))} disabled={!canNext} style={{padding:"10px 24px",background:canNext?C.text:C.border,color:canNext?"#FFF":C.muted,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:canNext?"pointer":"not-allowed"}}>
            {isLast?"Let's go →":"Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ANALYTICS PAGE ────────────────────────────────────────────────────────────
function AnalyticsPage({videos,businessProfile}){
  const vWithMet=videos.filter(v=>v.metricsAdded&&v.views>0);
  const totalViews=vWithMet.reduce((s,v)=>s+v.views,0);
  const avgViews=vWithMet.length?Math.round(totalViews/vWithMet.length):0;
  const grp=(k)=>{const m={};vWithMet.forEach(v=>{if(!v[k])return;if(!m[v[k]])m[v[k]]={n:0,s:0};m[v[k]].n++;m[v[k]].s+=v.views;});return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n),count:d.n})).sort((a,b)=>b.avg-a.avg);};
  const hookData=grp("hook");
  const formatData=grp("format");
  const sorted=[...vWithMet].sort((a,b)=>b.views-a.views);
  const best=sorted[0];const worst=sorted[sorted.length-1];
  const kpis=[["Total Views",totalViews.toLocaleString(),BRAND.red],["Avg Views",avgViews.toLocaleString(),BRAND.blue],["Videos Tracked",vWithMet.length,BRAND.green],["Best Hook",hookData[0]?.name||"—",BRAND.yellow]];

  if(vWithMet.length===0)return(
    <div style={{padding:32,textAlign:"center",color:C.muted}}>
      <div style={{fontSize:40,marginBottom:16}}>📊</div>
      <div style={{fontSize:18,fontWeight:500,color:C.text,marginBottom:8}}>No analytics yet</div>
      <div style={{fontSize:13,lineHeight:1.6}}>Publish a video and add metrics after 7 days.<br/>Your analytics will appear here.</div>
    </div>
  );

  return(
    <div style={{padding:20}}>
      <div style={{fontSize:18,fontWeight:500,color:C.text,marginBottom:20}}>Analytics</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {kpis.map(([l,v,c])=>(
          <Card key={l} style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{l}</div>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
          </Card>
        ))}
      </div>
      {hookData.length>0&&(
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:500,color:C.text,marginBottom:12}}>Hook performance</div>
          {hookData.slice(0,5).map((d,i)=>(
            <div key={d.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{fontSize:12,color:C.muted,width:120,flexShrink:0}}>{d.name}</div>
              <div style={{flex:1,background:C.light,borderRadius:20,height:8,overflow:"hidden"}}>
                <div style={{width:`${Math.round((d.avg/hookData[0].avg)*100)}%`,height:"100%",background:BRAND.red,borderRadius:20}}/>
              </div>
              <div style={{fontSize:11,color:C.muted,width:80,textAlign:"right",flexShrink:0}}>{d.avg.toLocaleString()} avg</div>
            </div>
          ))}
        </Card>
      )}
      {formatData.length>0&&(
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:500,color:C.text,marginBottom:12}}>Format performance</div>
          {formatData.slice(0,5).map((d)=>(
            <div key={d.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{fontSize:12,color:C.muted,width:120,flexShrink:0}}>{d.name}</div>
              <div style={{flex:1,background:C.light,borderRadius:20,height:8,overflow:"hidden"}}>
                <div style={{width:`${Math.round((d.avg/formatData[0].avg)*100)}%`,height:"100%",background:BRAND.blue,borderRadius:20}}/>
              </div>
              <div style={{fontSize:11,color:C.muted,width:80,textAlign:"right",flexShrink:0}}>{d.avg.toLocaleString()} avg</div>
            </div>
          ))}
        </Card>
      )}
      {best&&worst&&best.id!==worst.id&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Card><div style={{fontSize:10,color:BRAND.green,fontWeight:600,marginBottom:8}}>BEST PERFORMER</div><div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:4}}>{best.title}</div><div style={{fontSize:18,fontWeight:700,color:BRAND.green}}>{best.views?.toLocaleString()} views</div></Card>
          <Card><div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:8}}>LOWEST PERFORMER</div><div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:4}}>{worst.title}</div><div style={{fontSize:18,fontWeight:700,color:C.muted}}>{worst.views?.toLocaleString()} views</div></Card>
        </div>
      )}
    </div>
  );
}

// ── AGENCY CLIENT PROFILE SETUP ───────────────────────────────────────────────
const CLIENT_QUESTIONS=[
  {key:"whatTheyDo",label:"What does this client do?",hint:"One sentence about their business",placeholder:"A boutique gym in Austin helping busy professionals get fit"},
  {key:"audience",label:"Who is their target audience?",hint:"Who watches or buys from them",placeholder:"25-40 year old professionals who want to work out but have no time"},
  {key:"goal",label:"What is their content goal?",hint:"What should viewers do after watching?",placeholder:"Book a free trial class or visit the gym"},
  {key:"tone",label:"How does their brand sound?",hint:"Describe their voice",placeholder:"Energetic and motivating, never pushy or corporate"},
];

function ClientProfileSetup({client,onComplete,onSkip}){
  const[step,setStep]=useState(0);
  const[vals,setVals]=useState({whatTheyDo:"",audience:"",goal:"",tone:""});
  const q=CLIENT_QUESTIONS[step];
  const isLast=step===CLIENT_QUESTIONS.length-1;
  const canNext=vals[q?.key]?.trim().length>0;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui",padding:24}}>
      <div style={{width:"min(480px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"36px 32px"}}>
        <div style={{display:"flex",gap:6,marginBottom:24}}>
          {CLIENT_QUESTIONS.map((_,i)=><div key={i} style={{height:4,borderRadius:20,flex:i===step?3:1,background:i<=step?C.accent:C.border,transition:"all .3s"}}/>)}
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.light,border:`1px solid ${C.border}`,borderRadius:20,padding:"3px 10px",marginBottom:14,fontSize:11,color:C.muted}}>
          <span>{client.emoji}</span><span style={{fontWeight:600,color:C.text}}>{client.name}</span>
        </div>
        <div style={{fontSize:11,fontWeight:600,color:C.accent,letterSpacing:0.5,marginBottom:6}}>{step+1} of {CLIENT_QUESTIONS.length}</div>
        <div style={{fontSize:18,fontWeight:500,color:C.text,marginBottom:5,letterSpacing:-0.3}}>{q.label}</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:20}}>{q.hint}</div>
        <input key={q.key} autoFocus value={vals[q.key]} onChange={e=>setVals(p=>({...p,[q.key]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&canNext&&(isLast?onComplete(vals):setStep(s=>s+1))} placeholder={q.placeholder} style={{...inp,fontSize:14,padding:"12px 14px",marginBottom:20}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onSkip} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0}}>Skip for now</button>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0}}>← Back</button>}
            <button onClick={()=>canNext&&(isLast?onComplete(vals):setStep(s=>s+1))} disabled={!canNext} style={{padding:"10px 22px",background:canNext?C.text:C.border,color:canNext?"#FFF":C.muted,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:canNext?"pointer":"not-allowed"}}>{isLast?"Save client profile ✓":"Next →"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SUPABASE HELPERS ──────────────────────────────────────────────────────────
const SB_URL="https://dtpxqxwhehzyrtmrhiio.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cHhxeHdoZWh6eXJ0bXJoaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODUzNjMsImV4cCI6MjEwMDY2MTM2M30.qeYZV8B2sgF_2LE2hity97reHqg8oaQF1D39HHjFgbU";
let _token=null;
const _h=(extra={})=>({apikey:SB_KEY,Authorization:`Bearer ${_token||SB_KEY}`,"Content-Type":"application/json",...extra});
const sbGet=async(t,q="")=>{try{const r=await fetch(`${SB_URL}/rest/v1/${t}?select=*${q}`,{headers:_h()});return r.ok?await r.json():[];}catch(e){return[];}};
const sbInsert=async(t,d)=>{try{await fetch(`${SB_URL}/rest/v1/${t}`,{method:"POST",headers:_h({Prefer:"return=minimal"}),body:JSON.stringify(d)});}catch(e){}};
const sbUpdate=async(t,col,val,d)=>{try{await fetch(`${SB_URL}/rest/v1/${t}?${col}=eq.${encodeURIComponent(val)}`,{method:"PATCH",headers:_h({Prefer:"return=minimal"}),body:JSON.stringify(d)});}catch(e){}};
const sbDelete=async(t,col,val)=>{try{await fetch(`${SB_URL}/rest/v1/${t}?${col}=eq.${encodeURIComponent(val)}`,{method:"DELETE",headers:_h()});}catch(e){}};
const sbSignUp=async(email,pass)=>{try{const r=await fetch(`${SB_URL}/auth/v1/signup`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY},body:JSON.stringify({email,password:pass})});const d=await r.json();_token=d?.session?.access_token||null;return{user:d?.user,error:d?.error};}catch(e){return{error:e};}};
const sbSignIn=async(email,pass)=>{try{const r=await fetch(`${SB_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY},body:JSON.stringify({email,password:pass})});const d=await r.json();_token=d?.access_token||null;return{user:d?.user,error:d?.error};}catch(e){return{error:e};}};
const sbSignOut=async()=>{try{await fetch(`${SB_URL}/auth/v1/logout`,{method:"POST",headers:_h()});_token=null;}catch(e){}};
const uid=()=>Math.random().toString(36).slice(2,10);
const curMonth=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;};
const addMonths=(m,n)=>{const[y,mo]=m.split("-").map(Number);const d=new Date(y,mo-1+n,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;};
const monthLabel=(m)=>{const[y,mo]=m.split("-").map(Number);return new Date(y,mo-1,1).toLocaleString("en-US",{month:"long",year:"numeric"});};

// ── AGENCY DASHBOARD ──────────────────────────────────────────────────────────
function AgencyDashboard({wsId,onSelectClient,onAddClient}){
  const[clients,setClients]=useState([]);
  const[showAdd,setShowAdd]=useState(false);
  const[newName,setNewName]=useState("");
  const[newEmoji,setNewEmoji]=useState("🏢");
  const[pendingClient,setPendingClient]=useState(null);
  const EMOJIS=["🏢","🍕","💪","✂️","🛍️","🍔","☕","🏠","💄","🎵","🐾","🌿","👗","🚗","📚","🎮","🏋️","🍜","🌮","🏪"];

  useEffect(()=>{sbGet("agency_clients",`&workspace_id=eq.${wsId}&order=created_at.asc`).then(d=>setClients(d||[]));}, [wsId]);

  const addClient=async()=>{
    if(!newName.trim())return;
    const id="c"+uid();
    const newClient={id,workspace_id:wsId,name:newName.trim(),emoji:newEmoji,created_at:new Date().toISOString()};
    await sbInsert("agency_clients",newClient);
    setClients(p=>[...p,newClient]);
    setNewName("");setNewEmoji("🏢");setShowAdd(false);
    setPendingClient(newClient);
  };

  return(
    <div style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:18,fontWeight:500,color:C.text}}>Clients</div>
        <button onClick={()=>setShowAdd(true)} style={{padding:"8px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>+ Add client</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {clients.map(c=>(
          <div key={c.id} onClick={()=>onSelectClient(c)} style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:18,cursor:"pointer",transition:"box-shadow .15s"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.1)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{fontSize:28,marginBottom:8}}>{c.emoji}</div>
            <div style={{fontSize:15,fontWeight:500,color:C.text}}>{c.name}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:4}}>View pipeline →</div>
          </div>
        ))}
      </div>
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,width:"min(380px,95vw)",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:500,color:C.text}}>Add a client</div>
              <button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>×</button>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <button style={{width:52,height:52,borderRadius:10,background:C.light,border:`1px solid ${C.border}`,fontSize:24,cursor:"pointer"}}>{newEmoji}</button>
              <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&newName.trim()&&addClient()} placeholder="Client name..." style={{...inp,flex:1}}/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowAdd(false)} style={{padding:"8px 16px",border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.text}}>Cancel</button>
              <button onClick={addClient} disabled={!newName.trim()} style={{padding:"8px 16px",background:newName.trim()?C.text:C.border,color:"#FFF",border:"none",borderRadius:7,cursor:newName.trim()?"pointer":"not-allowed",fontSize:12,fontWeight:500}}>Add client ✓</button>
            </div>
          </div>
        </div>
      )}
      {pendingClient&&<ClientProfileSetup client={pendingClient} onComplete={async(profile)=>{await sbUpdate("agency_clients","id",pendingClient.id,{client_profile:profile});setPendingClient(null);}} onSkip={()=>setPendingClient(null)}/>}
    </div>
  );
}

// ── CREATOR APP ───────────────────────────────────────────────────────────────
function CreatorApp({user,profile,onSignOut}){
  const[page,setPage]=useState("dashboard");
  const[videos,setVideos]=useState([]);
  const[month,setMonth]=useState(curMonth());
  const[goal,setGoal]=useState(0);
  const bp=profile?.business_profile||{};
  const[needsProfile,setNeedsProfile]=useState(!bp.businessName&&!localStorage.getItem(`sk_bp_done_${user.id}`));

  useEffect(()=>{
    sbGet("creator_videos",`&user_id=eq.${user.id}&order=created_at.desc`).then(d=>setVideos(d||[]));
    sbGet("creator_goals",`&user_id=eq.${user.id}&month=eq.${month}`).then(d=>{if(d&&d[0])setGoal(d[0].goal||0);else setGoal(0);});
  },[user.id,month]);

  if(needsProfile)return <BusinessProfileSetup onComplete={async(bp)=>{await sbUpdate("profiles","id",user.id,{business_profile:bp});localStorage.setItem(`sk_bp_done_${user.id}`,"1");setNeedsProfile(false);}}/>;

  const addVideo=async(v)=>{
    const nv={...v,id:"v"+uid(),user_id:user.id,month:curMonth(),created_at:new Date().toISOString(),stage:"idea"};
    setVideos(p=>[nv,...p]);
    await sbInsert("creator_videos",nv);
  };
  const moveVideo=async(id,stage)=>{
    setVideos(p=>p.map(v=>v.id===id?{...v,stage,publish_date:stage==="published"?new Date().toISOString().slice(0,10):v.publish_date}:v));
    await sbUpdate("creator_videos","id",id,{stage,publish_date:stage==="published"?new Date().toISOString().slice(0,10):undefined});
  };
  const saveMetrics=async(id,m)=>{
    setVideos(p=>p.map(v=>v.id===id?{...v,...m,metrics_added:true}:v));
    await sbUpdate("creator_videos","id",id,{...m,metrics_added:true});
  };
  const saveScript=async(id,s)=>{setVideos(p=>p.map(v=>v.id===id?{...v,script:s}:v));await sbUpdate("creator_videos","id",id,{script:s});};
  const saveShotList=async(id,s)=>{setVideos(p=>p.map(v=>v.id===id?{...v,shot_list:s}:v));await sbUpdate("creator_videos","id",id,{shot_list:s});};
  const saveEdit=async(id,s)=>{setVideos(p=>p.map(v=>v.id===id?{...v,edit_advice:s}:v));await sbUpdate("creator_videos","id",id,{edit_advice:s});};
  const deleteVideo=async(id)=>{setVideos(p=>p.filter(v=>v.id!==id));await sbDelete("creator_videos","id",id);};
  const setGoalAndSave=async(g)=>{
    setGoal(g);
    const existing=await sbGet("creator_goals",`&user_id=eq.${user.id}&month=eq.${month}`);
    if(existing&&existing[0])await sbUpdate("creator_goals","id",existing[0].id,{goal:g});
    else await sbInsert("creator_goals",{id:"g"+uid(),user_id:user.id,month,goal:g,created_at:new Date().toISOString()});
  };

  const navColors={"dashboard":BRAND.red,"campaigns":BRAND.blue,"analytics":BRAND.green};

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 16px",height:48,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Logo/>
          <div style={{fontSize:14,fontWeight:500,color:"#111",letterSpacing:-0.2}}>ContentHub <span style={{fontWeight:400,color:"#888",fontSize:13}}>Sidekick</span></div>
        </div>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          {[["dashboard","Dashboard"],["campaigns","Campaigns"],["analytics","Analytics"]].map(([p,l])=>(
            <button key={p} onClick={()=>setPage(p)} style={{background:"none",border:"none",borderBottom:`2px solid ${page===p?(navColors[p]||C.accent):"transparent"}`,color:page===p?(navColors[p]||C.accent):C.muted,cursor:"pointer",fontSize:13,fontWeight:page===p?600:400,padding:"0 2px",paddingBottom:2,transition:"all .15s"}}>{l}</button>
          ))}
        </div>
        <button onClick={onSignOut} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>Sign out</button>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        {page==="dashboard"&&<CreatorDashboard user={user} videos={videos} month={month} goal={goal} onMonthChange={m=>{setMonth(m);sbGet("creator_goals",`&user_id=eq.${user.id}&month=eq.${m}`).then(d=>{if(d&&d[0])setGoal(d[0].goal||0);else setGoal(0);});}} onSetGoal={setGoalAndSave} onAdd={addVideo} onMove={moveVideo} onMetrics={saveMetrics} onDelete={deleteVideo} onSaveScript={saveScript} onSaveShot={saveShotList} onSaveEdit={saveEdit} businessProfile={bp}/>}
        {page==="campaigns"&&<CampaignCreator userId={user.id} businessProfile={bp} videos={videos} onSendToPipeline={(ideas)=>{ideas.forEach(v=>addVideo(v));setPage("dashboard");}}/>}
        {page==="analytics"&&<AnalyticsPage videos={videos} businessProfile={bp}/>}
      </div>
    </div>
  );
}

// ── AGENCY APP ────────────────────────────────────────────────────────────────
function AgencyApp({user,profile,wsId,onSignOut}){
  const[page,setPage]=useState("dashboard");
  const[selectedClient,setSelectedClient]=useState(null);
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 16px",height:48,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Logo/>
          <div style={{fontSize:14,fontWeight:500,color:"#111"}}>ContentHub <span style={{fontWeight:400,color:"#888",fontSize:13}}>Agency</span></div>
        </div>
        <div style={{display:"flex",gap:12}}>
          {selectedClient&&<button onClick={()=>setSelectedClient(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>← All clients</button>}
        </div>
        <button onClick={onSignOut} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>Sign out</button>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        {!selectedClient&&<AgencyDashboard wsId={wsId} onSelectClient={setSelectedClient} onAddClient={()=>{}}/>}
        {selectedClient&&<div style={{padding:20}}><div style={{fontSize:18,fontWeight:500,color:C.text,marginBottom:4}}>{selectedClient.emoji} {selectedClient.name}</div><div style={{fontSize:12,color:C.muted,marginBottom:20}}>Agency pipeline coming soon — use the client profile to guide AI directions.</div></div>}
      </div>
    </div>
  );
}

// ── AUTH HELPERS ──────────────────────────────────────────────────────────────
function AuthGate({path,onLogin}){
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const go=async()=>{
    if(!email||!pass){setErr("Please fill in all fields");return;}
    setLoading(true);setErr("");
    if(mode==="signup"){
      const{user,error}=await sbSignUp(email,pass);
      if(error||!user){setErr("Could not create account.");setLoading(false);return;}
      await sbInsert("profiles",{id:user.id,name:email,email,account_type:path,created_at:new Date().toISOString()});
      onLogin(user,{name:email,email,account_type:path});
    }else{
      const{user,error}=await sbSignIn(email,pass);
      if(error||!user){setErr("Wrong email or password.");setLoading(false);return;}
      const profiles=await sbGet("profiles",`&id=eq.${user.id}`);
      onLogin(user,profiles[0]||{name:email,email,account_type:path});
    }
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(400px,100%)",background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"36px 32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24,justifyContent:"center"}}>
          <Logo/>
          <div style={{fontSize:15,fontWeight:500,color:C.text}}>ContentHub {path==="agency"?"Agency":"Sidekick"}</div>
        </div>
        <div style={{display:"flex",gap:0,marginBottom:24,borderBottom:`1px solid ${C.border}`}}>
          {[["login","Sign in"],["signup","Create account"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"8px 0",background:"none",border:"none",borderBottom:`2px solid ${mode===m?BRAND.blue:"transparent"}`,color:mode===m?BRAND.blue:C.muted,cursor:"pointer",fontSize:13,fontWeight:mode===m?600:400,marginBottom:-1}}>{l}</button>
          ))}
        </div>
        {[["Email","email","email"],["Password","pass","password"]].map(([l,k,t])=>(
          <div key={k} style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
            <input type={t} value={k==="email"?email:pass} onChange={e=>k==="email"?setEmail(e.target.value):setPass(e.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={inp}/>
          </div>
        ))}
        {err&&<div style={{fontSize:12,color:BRAND.red,marginBottom:12}}>{err}</div>}
        <button onClick={go} disabled={loading} style={{width:"100%",padding:"11px 0",background:loading?C.border:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:loading?"not-allowed":"pointer",fontSize:14,fontWeight:500,marginTop:8}}>
          {loading?"...":(mode==="signup"?"Create account":"Sign in")}
        </button>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null);
  const[profile,setProfile]=useState(null);
  const[path,setPath]=useState(null);
  const[wsId,setWsId]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const stored=localStorage.getItem("sk_session");
    if(stored){
      try{
        const{user:u,profile:p,wsId:w}=JSON.parse(stored);
        _token=localStorage.getItem("sk_token")||null;
        setUser(u);setProfile(p);setPath(p?.account_type||"creator");setWsId(w||null);
      }catch(e){}
    }
    setLoading(false);
  },[]);

  const handleLogin=async(u,p)=>{
    let wId=null;
    if(p?.account_type==="agency"){
      const ws=await sbGet("workspaces",`&owner_id=eq.${u.id}&order=created_at.asc&limit=1`);
      if(ws&&ws[0])wId=ws[0].id;
    }
    setUser(u);setProfile(p);setPath(p?.account_type||"creator");setWsId(wId);
    localStorage.setItem("sk_session",JSON.stringify({user:u,profile:p,wsId:wId}));
    localStorage.setItem("sk_token",_token||"");
  };

  const handleSignOut=()=>{
    sbSignOut();setUser(null);setProfile(null);setPath(null);setWsId(null);
    localStorage.removeItem("sk_session");localStorage.removeItem("sk_token");
  };

  if(loading)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{display:"flex",gap:5,alignItems:"flex-end"}}>
        {[[BRAND.red,18,10],[BRAND.yellow,11,7],[BRAND.blue,14,8],[BRAND.green,9,12]].map(([c,h,w],i)=>(
          <div key={i} style={{width:w,height:h,borderRadius:3,background:c,animation:`brandPulse 1.2s ${i*0.15}s ease-in-out infinite`}}/>
        ))}
      </div>
      <style>{`@keyframes brandPulse{0%,100%{opacity:.25;transform:scaleY(0.7)}50%{opacity:1;transform:scaleY(1)}}`}</style>
    </div>
  );

  if(!user){
    if(!path)return <Landing onPath={setPath}/>;
    return <AuthGate path={path} onLogin={handleLogin}/>;
  }

  if(path==="agency"){
    if(!wsId)return <AgencyOnboarding user={user} onComplete={(wId)=>{setWsId(wId);localStorage.setItem("sk_session",JSON.stringify({user,profile,wsId:wId}));}}/>;
    return <AgencyApp user={user} profile={profile} wsId={wsId} onSignOut={handleSignOut}/>;
  }

  return <CreatorApp user={user} profile={profile} onSignOut={handleSignOut}/>;
}
