import { useEffect, useState } from "react";
import { getWorkspaceMember, sbGetOne, sbGetSession, sbInsertX, sbSignOut, sbUpdate } from "./lib/supabase";
import { AgencyApp } from "./screens/Agency";
import { CreatorApp } from "./screens/Business";
import { AuthScreen, Landing } from "./screens/Landing";
import { C } from "./ui/theme";

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
          // cached is written the moment the user picks a portal, so when the two
          // disagree the row is almost certainly a trigger default — repair it.
          if(p&&cached&&p.account_type!==cached){
            sbUpdate("profiles","id",s.user.id,{account_type:cached});
            p.account_type=cached;
          }
          let acct=p?.account_type||cached||null;
          // No profile row and nothing cached? Ask the data instead of guessing:
          // membership of a workspace means this is an agency account.
          if(!acct){
            const mem=await getWorkspaceMember(s.user.id);
            if(mem?.workspace_id)acct="agency";
          }
          acct=acct||"creator";
          console.log("[sidekick] portal restore →",{profileRow:!!p,accountType:p?.account_type||null,cached,resolved:acct});
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

export default App;
