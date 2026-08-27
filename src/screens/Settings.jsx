// ── SETTINGS ──────────────────────────────────────────────────────────────────
// Ported from ContentHubsV2, which had this screen while Sidekick never did —
// so a Sidekick agency could create a workspace and then had no way to invite
// anyone into it. The two schemas match (profiles and workspace_members carry
// the same columns), so this is the same screen with the i18n layer removed
// and the language tab dropped.

import { useEffect, useState } from "react";
import { sbDelete, sbGet, sbInsertX, sbSignUp, sbUpdate, sbUpsert } from "../lib/supabase";
import { BRAND, Btn, C, Card, inp } from "../ui/theme";

const EMOJIS=["🏪","👗","💪","💳","🚗","🏢","🍺","🍽️","❤️","💻","🏠","🎬","⭐","🔥","💡","🎯","🚀","💎","🌟","🌿","🎪","📱"];

const ROLES=[
  {id:"admin",  label:"Admin",   desc:"Sees every client, can publish and approve."},
  {id:"editor", label:"Editor",  desc:"Works in Editing, attaches finished videos."},
  {id:"member", label:"Community Manager", desc:"Schedules, writes scripts and moves cards."},
];

function SettingsPage({workspaceId,wsName,user,profile,tab,onTab,clients,onReload}){
  const[members,setMembers]=useState([]);
  const[wsEdit,setWsEdit]=useState(wsName||"");
  const[nameEdit,setNameEdit]=useState(profile?.name||"");
  const[clientEdits,setClientEdits]=useState({});
  const[note,setNote]=useState(null);
  const[emojiFor,setEmojiFor]=useState(null);
  const[delFor,setDelFor]=useState(null);
  const[menuId,setMenuId]=useState(null);
  const[editId,setEditId]=useState(null);
  const[editForm,setEditForm]=useState({name:"",role:"member"});
  useEffect(()=>{setWsEdit(wsName||"");},[wsName]);
  const[form,setForm]=useState({name:"",email:"",password:"",role:"member"});
  const[msg,setMsg]=useState(null);
  const[busy,setBusy]=useState(false);

  const load=async()=>{
    if(!workspaceId)return;
    const rows=await sbGet("workspace_members",`&workspace_id=eq.${workspaceId}`)||[];
    // Names live in profiles, so join them here — a list of uuids is unusable.
    const profs=await sbGet("profiles","")||[];
    const byId={};
    profs.forEach(p2=>{byId[p2.id]=p2;});
    setMembers(rows.map(r=>({...r,profile:byId[r.user_id]||null})));
  };
  useEffect(()=>{load();},[workspaceId]);

  const createUser=async()=>{
    if(busy)return;
    if(!form.name.trim()||!form.email.trim()||!form.password.trim()){
      setMsg({ok:false,text:"Fill in every field"});return;
    }
    if(form.password.length<6){
      setMsg({ok:false,text:"Password must be at least 6 characters"});return;
    }
    setBusy(true);setMsg(null);
    const{user:nu,error}=await sbSignUp(form.email.trim(),form.password);
    if(error||!nu){
      setBusy(false);
      setMsg({ok:false,text:(error?.message||error?.msg||"Could not create the account")});
      return;
    }
    const id=nu.id||nu.user?.id;
    if(id){
      // upsert, because a signup trigger may already have made a placeholder row
      await sbUpsert("profiles",{id,name:form.name.trim(),email:form.email.trim(),account_type:"agency"},"id");
      const r=await sbInsertX("workspace_members",{workspace_id:workspaceId,user_id:id,role:form.role,created_at:new Date().toISOString()});
      if(!r.ok){setBusy(false);setMsg({ok:false,text:r.error||"Account made, but not added to the workspace"});return;}
    }
    setMsg({ok:true,text:`${"Account created for"} ${form.email.trim()}`});
    setForm({name:"",email:"",password:"",role:"member"});
    setBusy(false);
    load();
  };

  const field=(label,key,type="text")=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{label}</div>
      <input type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} style={inp}/>
    </div>
  );

  return(
    <div>
      <Card pad={0} style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"15px 18px 0"}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{"Settings"}</div>
          <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2,marginBottom:12}}>{"Workspace"}</div>
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
            {[["users","Users"],["clients","Clients"],["workspace","Workspace"],["account","My account"],["language","Language"]].map(([id,label])=>(
              <button key={id} onClick={()=>onTab&&onTab(id)}
                style={{padding:"8px 13px",border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===id?600:400,
                  color:tab===id?C.text:C.muted,background:"transparent",
                  borderBottom:tab===id?`2px solid ${C.text}`:"2px solid transparent"}}>{label}</button>
            ))}
          </div>
        </div>
      </Card>

      {tab==="users"&&(
        <>
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{"Add someone to the team"}</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:14}}>
              {"They sign in with this email and password from any device."}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1"}}>{field("Full name","name")}</div>
              {field("Email","email","email")}
              {field("Temporary password","password","password")}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:500}}>{"Role"}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
              {ROLES.map(r=>{
                const on=form.role===r.id;
                return(
                  <button key={r.id} onClick={()=>setForm(p=>({...p,role:r.id}))} title={r.desc}
                    style={{padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:on?600:400,
                      color:on?C.text:C.muted,background:C.surface,border:`1px solid ${on?C.text:C.border}`}}>
                    {r.label}
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:14,paddingLeft:9,borderLeft:`2px solid ${C.border}`}}>
              {(ROLES.find(r=>r.id===form.role)||{}).desc||""}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <Btn primary onClick={createUser} disabled={busy}>{busy?"Creating…":"Create account ✓"}</Btn>
              {msg&&<span style={{fontSize:12,color:msg.ok?BRAND.green:C.red,lineHeight:1.5}}>{msg.text}</span>}
            </div>
            <div style={{fontSize:10,color:C.muted,lineHeight:1.55,marginTop:12,background:C.light,borderRadius:8,padding:"9px 11px"}}>
              {"If Supabase has email confirmation switched on, they'll need to confirm before signing in."}
            </div>
          </Card>

          <Card pad={0} style={{overflow:"hidden"}}>
            <div style={{padding:"14px 16px 12px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{"Team"}</div>
                <div style={{fontSize:15,fontWeight:600,color:C.text}}>{members.length} {members.length===1?"person":"people"}</div>
              </div>
              {msg&&<span style={{fontSize:11,color:msg.ok?BRAND.green:C.red}}>{msg.text}</span>}
            </div>

            {members.length===0?(
              <div style={{padding:"20px 16px",fontSize:12,color:C.muted}}>{"Nobody else yet."}</div>
            ):(
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 150px 44px",gap:10,padding:"8px 16px",background:C.light,borderTop:`0.5px solid ${C.border}`,borderBottom:`0.5px solid ${C.border}`}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.5,textTransform:"uppercase"}}>{"User"}</div>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.5,textTransform:"uppercase"}}>{"Access"}</div>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.5,textTransform:"uppercase",textAlign:"right"}}>{"Actions"}</div>
                </div>
                {members.map(m=>{
                  const me=m.user_id===user.id;
                  const nm=m.profile?.name||(me?(profile?.name||user.email):"—");
                  const em=m.profile?.email||(me?user.email:"");
                  const editing=editId===m.user_id;
                  return(
                    <div key={m.user_id} style={{borderBottom:`0.5px solid ${C.border}`}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 150px 44px",gap:10,padding:"11px 16px",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:C.light,border:`0.5px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:C.muted,flexShrink:0}}>
                            {(nm||"?").slice(0,1).toUpperCase()}
                          </div>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:500,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {nm}{me&&<span style={{color:C.muted,fontWeight:400}}> ({"you"})</span>}
                            </div>
                            {em&&<div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{em}</div>}
                          </div>
                        </div>
                        <div>
                          <span style={{fontSize:10,fontWeight:600,color:m.role==="admin"?BRAND.blue:C.muted,background:m.role==="admin"?BRAND.blue+"14":C.light,border:`0.5px solid ${m.role==="admin"?BRAND.blue+"40":C.border}`,borderRadius:20,padding:"3px 9px",whiteSpace:"nowrap"}}>
                            {(ROLES.find(r=>r.id===(m.role||"member"))||{}).label||"Community Manager"}
                          </span>
                        </div>
                        <div style={{textAlign:"right",position:"relative"}}>
                          <button onClick={()=>setMenuId(menuId===m.user_id?null:m.user_id)}
                            style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:C.muted,padding:"2px 6px",lineHeight:1}}>⋯</button>
                          {menuId===m.user_id&&(
                            <>
                              <div onClick={()=>setMenuId(null)} style={{position:"fixed",inset:0,zIndex:900}}/>
                              <div style={{position:"absolute",right:0,top:"100%",zIndex:901,width:170,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:"0 10px 28px rgba(0,0,0,.14)",padding:"5px 0",textAlign:"left"}}>
                                <button onClick={()=>{setEditId(m.user_id);setEditForm({name:nm,role:m.role||"member"});setMenuId(null);}}
                                  style={{display:"block",width:"100%",textAlign:"left",padding:"8px 12px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,color:C.text}}
                                  onMouseEnter={e=>e.currentTarget.style.background=C.light}
                                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{"Edit"}</button>
                                {!me&&(
                                  <button onClick={async()=>{
                                      setMenuId(null);
                                      await sbDelete("workspace_members","user_id",m.user_id);
                                      setMsg({ok:true,text:"Access removed"});load();
                                    }}
                                    style={{display:"block",width:"100%",textAlign:"left",padding:"8px 12px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,color:C.red}}
                                    onMouseEnter={e=>e.currentTarget.style.background=C.light}
                                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{"Remove access"}</button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {editing&&(
                        <div style={{padding:"0 16px 14px 54px",background:C.light}}>
                          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end",paddingTop:11}}>
                            <div style={{flex:"1 1 180px"}}>
                              <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:500}}>{"Display name"}</div>
                              <input value={editForm.name} onChange={e=>setEditForm(p2=>({...p2,name:e.target.value}))}
                                style={{...inp,fontSize:12,padding:"7px 10px",background:C.surface}}/>
                            </div>
                            <div style={{flex:"0 0 150px"}}>
                              <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:500}}>{"Access"}</div>
                              <select value={editForm.role} disabled={me}
                                onChange={e=>setEditForm(p2=>({...p2,role:e.target.value}))}
                                style={{...inp,fontSize:12,padding:"7px 10px",background:C.surface,cursor:me?"not-allowed":"pointer"}}>
                                {ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
                              </select>
                            </div>
                            <Btn onClick={()=>setEditId(null)}>{"Cancel"}</Btn>
                            <Btn primary onClick={async()=>{
                                if(editForm.name.trim())await sbUpdate("profiles","id",m.user_id,{name:editForm.name.trim()});
                                if(!me&&editForm.role!==m.role)
                                  await sbUpsert("workspace_members",[{workspace_id:workspaceId,user_id:m.user_id,role:editForm.role}],"workspace_id,user_id");
                                setEditId(null);setMsg({ok:true,text:"Saved ✓"});load();
                              }}>{"Save"}</Btn>
                          </div>
                          {me&&<div style={{fontSize:10,color:C.muted,marginTop:7}}>{"You can't change your own access."}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </Card>
        </>
      )}


      {tab==="clients"&&(
        <Card>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{"Clients"} · {(clients||[]).length}</div>
          {(clients||[]).length===0&&<div style={{fontSize:12,color:C.muted}}>{"No clients to manage yet."}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {(clients||[]).map(c=>{
              const val=clientEdits[c.id]!==undefined?clientEdits[c.id]:c.name;
              const dirty=val.trim()&&val.trim()!==c.name;
              return(
                <div key={c.id} style={{background:C.light,borderRadius:8,padding:"9px 11px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <button onClick={()=>setEmojiFor(emojiFor===c.id?null:c.id)} title={"Change emoji"}
                      style={{fontSize:16,background:C.surface,border:`1px solid ${emojiFor===c.id?C.text:C.border}`,borderRadius:7,cursor:"pointer",padding:"3px 7px",flexShrink:0}}>
                      {c.emoji||"🏢"}
                    </button>
                    <input value={val} onChange={e=>setClientEdits(p2=>({...p2,[c.id]:e.target.value}))}
                      style={{...inp,flex:1,fontSize:12,padding:"6px 9px",background:C.surface}}/>
                    <button disabled={!dirty}
                      onClick={async()=>{await sbUpdate("agency_clients","id",c.id,{name:val.trim()});setNote({ok:true,text:"Saved ✓"});onReload&&onReload();}}
                      style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${dirty?C.text:C.border}`,background:dirty?C.text:C.surface,color:dirty?"#FFF":C.muted,cursor:dirty?"pointer":"not-allowed",fontSize:11,fontWeight:600,flexShrink:0}}>
                      {"Save"}
                    </button>
                    <button onClick={()=>setDelFor(c.id)}
                      style={{padding:"6px 9px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,color:C.muted,cursor:"pointer",fontSize:11,flexShrink:0}}>
                      {"Delete"}
                    </button>
                  </div>
                  {emojiFor===c.id&&(
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:9}}>
                      {EMOJIS.map(e=>(
                        <button key={e} onClick={async()=>{await sbUpdate("agency_clients","id",c.id,{emoji:e});setEmojiFor(null);setNote({ok:true,text:"Saved ✓"});onReload&&onReload();}}
                          style={{fontSize:17,padding:"3px 6px",border:`1px solid ${c.emoji===e?C.text:C.border}`,borderRadius:7,cursor:"pointer",background:C.surface}}>{e}</button>
                      ))}
                    </div>
                  )}
                  {delFor===c.id&&(
                    <div style={{marginTop:9,background:"#FEF2F2",border:`1px solid ${C.red}30`,borderRadius:7,padding:"9px 11px"}}>
                      <div style={{fontSize:12,color:C.red,fontWeight:600,marginBottom:3}}>{"Delete this client?"}</div>
                      <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:9}}>{"This removes the client and everything in their pipeline."}</div>
                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>setDelFor(null)} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",fontSize:11,color:C.text}}>{"Cancel"}</button>
                        <button onClick={async()=>{await sbDelete("agency_clients","id",c.id);setDelFor(null);setNote({ok:true,text:"Saved ✓"});onReload&&onReload();}}
                          style={{padding:"6px 12px",borderRadius:7,border:"none",background:C.red,color:"#FFF",cursor:"pointer",fontSize:11,fontWeight:600}}>{"Yes, delete"}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {note&&<div style={{fontSize:12,color:note.ok?BRAND.green:C.red,marginTop:10}}>{note.text}</div>}
        </Card>
      )}

      {tab==="workspace"&&(
        <Card>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{"Workspace"}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{"Workspace name"}</div>
          <input value={wsEdit} onChange={e=>setWsEdie.target.value} style={{...inp,marginBottom:12}}/>
          <Btn primary disabled={!wsEdit.trim()||wsEdit.trim()===wsName}
            onClick={async()=>{await sbUpdate("workspaces","id",workspaceId,{name:wsEdit.trim()});setNote({ok:true,text:"Saved ✓"});onReload&&onReload();}}>
            {"Save"}
          </Btn>
          {note&&<span style={{fontSize:12,color:note.ok?BRAND.green:C.red,marginLeft:10}}>{note.text}</span>}
        </Card>
      )}

      {tab==="account"&&(
        <Card>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{"My account"}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{"Email"}</div>
          <div style={{fontSize:13,color:C.text,background:C.light,borderRadius:8,padding:"9px 12px",marginBottom:14}}>{user.email}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{"Display name"}</div>
          <input value={nameEdit} onChange={e=>setNameEdie.target.value} style={{...inp,marginBottom:12}}/>
          <Btn primary disabled={!nameEdit.trim()||nameEdit.trim()===(profile?.name||"")}
            onClick={async()=>{await sbUpdate("profiles","id",user.id,{name:nameEdit.trim()});setNote({ok:true,text:"Saved ✓"});}}>
            {"Save"}
          </Btn>
          {note&&<span style={{fontSize:12,color:note.ok?BRAND.green:C.red,marginLeft:10}}>{note.text}</span>}
        </Card>
      )}

    </div>
  );
}

export { SettingsPage };
