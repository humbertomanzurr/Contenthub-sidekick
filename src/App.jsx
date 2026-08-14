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

  const login=(u,p)=>{
    const acct=p?.account_type||"creator";
    try{localStorage.setItem(`sk_acct_${u.id}`,acct);}catch(e){}
    setUser(u);setProfile(p);setState(acct);
  };
  const logout=()=>{sbSignOut();setUser(null);se
