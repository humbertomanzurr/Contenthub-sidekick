import { useEffect, useState } from "react";
import { getWorkspaceMember, sbGetOne, sbGetSession, sbInsertX, sbSessionSync, sbSignOut, sbUpdate } from "./lib/supabase";
import { AgencyApp } from "./screens/Agency";
import { CreatorApp } from "./screens/Business";
import { AuthScreen, Landing } from "./screens/Landing";
import { C } from "./ui/theme";

export default function App(){
  // Decide what to show from localStorage alone — no awaits, so a refresh can
  // never hang on a slow request. The database check happens afterwards and
  // only corrects things if they turn out to be wrong.
  const[state,setState]=useState(()=>{
    const s=sbSessionSync();
    if(!s?.user)return "landing";
    return localStorage.getItem(`sk_acct_${s.user.id}`)||"creator";
  });
  const[authPath,setAuthPath]=useState(null);
  const[user,setUser]=useState(()=>sbSessionSync()?.user||null);
  const[profile,setProfile]=useState(()=>{
    const s=sbSessionSync();
    return s?.user?{account_type:localStorage.getItem(`sk_acct_${s.user.id}`)||"creator"}:null;
  });

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        const s=await sbGetSession();
        if(cancelled)return;
        if(!s?.user){setUser(null);setProfile(null);setState("landing");return;}

        setUser(s.user);
        const p=await sbGetOne("profiles","id",s.user.id);
        if(cancelled)return;
        const cached=localStorage.getItem(`sk_acct_${s.user.id}`);

        // cached is written the moment the user picks a portal, so when the two
        // disagree the row is almost certainly a signup-trigger default.
        if(p&&cached&&p.account_type!==cached){
          sbUpdate("profiles","id",s.user.id,{account_type:cached});
          p.account_type=cached;
        }
        let acct=p?.account_type||cached||null;
        if(!acct){
          const mem=await getWorkspaceMember(s.user.id);
          if(cancelled)return;
          if(mem?.workspace_id)acct="agency";
        }
        acct=acct||"creator";

        // Only cache a value we actually established — never the fallback, or a
        // single failed read would pin an agency user to Business.
        if(p?.account_type||acct!=="creator"){
          try{localStorage.setItem(`sk_acct_${s.user.id}`,acct);}catch(e){}
        }
        if(p&&!p.account_type)sbUpdate("profiles","id",s.user.id,{account_type:acct});
        if(!p)sbInsertX("profiles",{id:s.user.id,name:s.user.email,email:s.user.email,account_type:acct});

        setProfile(p||{account_type:acct});
        setState(cur=>cur==="landing"||cur==="auth"?cur:acct);
      }catch(e){
        // A failed check must not strand anyone on a blank screen.
        console.warn("[sidekick] session check failed, keeping cached view",e);
      }
    })();
    return()=>{cancelled=true;};
  },[]);

  const login=(u,p)=>{
    const acct=p?.account_type||"creator";
    try{localStorage.setItem(`sk_acct_${u.id}`,acct);}catch(e){}
    setUser(u);setProfile(p);setState(acct);
  };
  const logout=()=>{sbSignOut();setUser(null);setProfile(null);setState("landing");};
  const pick=path=>{setAuthPath(path==="login"?null:path);setState("auth");};

  if(state==="landing")return<Landing onPath={pick}/>;
  if(state==="auth")return<AuthScreen path={authPath||"login"} onLogin={login} onBack={()=>setState("landing")}/>;
  if(state==="creator"&&user)return<CreatorApp user={user} profile={profile} onLogout={logout}/>;
  if(state==="agency"&&user)return<AgencyApp user={user} profile={profile} onLogout={logout}/>;
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",color:C.muted,fontSize:13}}>
      Loading…
    </div>
  );
}
