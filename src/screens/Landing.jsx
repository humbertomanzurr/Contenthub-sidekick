import { useState } from "react";
import { sbGetOne, sbInsertX, sbSignIn, sbSignUp, sbUpdate } from "../lib/supabase";
import { BusinessProfileSetup } from "./Business";
import { BRAND, C, Logo, inp, shMd } from "../ui/theme";

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
      if(!pr.ok){
        // The row already existed — a signup trigger usually creates one with a
        // default account_type. Overwrite it with the portal they actually chose.
        console.warn("profiles insert skipped, patching instead:",pr.error);
      }
      await sbUpdate("profiles","id",u2.id,{account_type:path});
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

export { AuthScreen, Landing };
