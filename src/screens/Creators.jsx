import { useEffect, useState } from "react";
import { uuid } from "../lib/format";
import { aiHeaders, sbDelete, sbGetWhere, sbInsertX, sbUpdate, sbUpsert } from "../lib/supabase";
import { BRAND, Btn, C, Card, PlatformIcon, inp, shMd } from "../ui/theme";

const CREATOR_PLATFORMS=["TikTok","Instagram Reels","YouTube","Facebook"];
const STATUSES=[
  {id:"prospecto",  label:"Prospect",  color:"#94A3B8"},
  {id:"contactado", label:"Contacted", color:BRAND.blue},
  {id:"respondio",  label:"Replied",  color:"#0EA5E9"},
  {id:"negociando", label:"Negotiating", color:BRAND.yellow},
  {id:"contratado", label:"Signed", color:BRAND.green},
  {id:"descartado", label:"Passed", color:C.red},
];
const statusOf=id=>STATUSES.find(s=>s.id===id)||STATUSES[0];

// Only a real profile URL on the platform's own domain counts. A creator we
// can't link to is a creator nobody can check.
const PROFILE_DOMAINS={
  "TikTok":["tiktok.com"],
  "Instagram Reels":["instagram.com"],
  "YouTube":["youtube.com","youtu.be"],
  "Facebook":["facebook.com"],
};
const parseProfile=raw=>{
  const u=(raw||"").trim();
  if(!/^https?:\/\//i.test(u))return null;
  let host,path;
  try{const p=new URL(u);host=p.hostname.replace(/^www\./,"").toLowerCase();path=p.pathname;}catch(e){return null;}
  const hit=Object.keys(PROFILE_DOMAINS).find(k=>PROFILE_DOMAINS[k].some(d=>host===d||host.endsWith("."+d)));
  if(!hit)return null;
  const m=path.match(/@([\w.\-]+)/)||path.match(/^\/([\w.\-]+)/);
  const handle=m?("@"+m[1].replace(/^@/,"")):"";
  if(!handle||handle==="@")return null;
  return{platform:hit,handle,profile_url:u.split("?")[0]};
};

const SEARCH_HINTS=[
  {key:"niche",   label:"niche",      chips:["Fitness","Beauty","Food","Fashion","Wellness","Parents","Tech","Travel"]},
  {key:"city",    label:"city",     chips:["CDMX","Guadalajara","Monterrey","Puebla","Querétaro","All of Mexico"]},
  {key:"size",    label:"size",     chips:["Under 5k","5k to 50k","50k to 200k","Over 200k"]},
  {key:"platform",label:"platform", chips:["TikTok","Instagram","YouTube"]},
];

function CreatorHub({workspaceId,clients}){
  const[creators,setCreators]=useState([]);
  const[lists,setLists]=useState([]);
  const[members,setMembers]=useState([]);
  const[openList,setOpenList]=useState(null);

  const[picks,setPicks]=useState({});     // chip selections
  const[query,setQuery]=useState("");
  const[results,setResults]=useState([]);
  const[searching,setSearching]=useState(false);
  const[searchErr,setSearchErr]=useState(null);
  const[searchRaw,setSearchRaw]=useState("");
  const[selected,setSelected]=useState([]);
  const[linkInput,setLinkInput]=useState("");
  const[linkErr,setLinkErr]=useState(null);
  const[addTo,setAddTo]=useState(null);   // pending "add these to a list"
  const[dataFor,setDataFor]=useState(null);
  const[newList,setNewList]=useState({name:"",clientId:""});

  const load=()=>{
    if(!workspaceId)return;
    sbGetWhere("creators","workspace_id",workspaceId,"&order=created_at.desc").then(r=>setCreators(r||[]));
    sbGetWhere("creator_lists","workspace_id",workspaceId,"&order=created_at.desc").then(async r=>{
      setLists(r||[]);
      const all=await Promise.all((r||[]).map(l=>sbGetWhere("creator_list_members","list_id",l.id)));
      setMembers(all.flat());
    });
  };
  useEffect(()=>{load();},[workspaceId]);

  const clientName=id=>(clients||[]).find(c=>c.id===id)?.name||"";
  const clientEmoji=id=>(clients||[]).find(c=>c.id===id)?.emoji||"🏢";
  const listsOf=creatorId=>members.filter(m=>m.creator_id===creatorId).map(m=>lists.find(l=>l.id===m.list_id)).filter(Boolean);
  const knownUrls=new Set(creators.map(c=>c.profile_url));

  const composed=(()=>{
    const bits=SEARCH_HINTS.map(h=>picks[h.key]).filter(Boolean);
    return bits.length?`Creators of ${bits.join(", ")}`:"";
  })();

  const saveCreator=async(c)=>{
    const row={id:uuid(),workspace_id:workspaceId,handle:c.handle,platform:c.platform,
      profile_url:c.profile_url,name:c.name||"",notes:c.notes||"",niche:picks.niche||"",city:picks.city||"",
      created_at:new Date().toISOString()};
    const existing=creators.find(x=>x.profile_url===c.profile_url);
    if(existing)return existing;
    const r=await sbInsertX("creators",row);
    if(!r.ok){console.error("saveCreator",r.error);return null;}
    setCreators(p=>[row,...p]);
    return row;
  };

  const addLink=async()=>{
    const p=parseProfile(linkInput);
    if(!p){setLinkErr("That doesn't look like a profile link.");return;}
    setLinkErr(null);
    const saved=await saveCreator(p);
    setLinkInput("");
    if(saved)setResults(r=>[{...p,saved:true},...r]);
  };

  const runSearch=async()=>{
    const q=(query||composed).trim();
    if(!q||searching)return;
    setSearching(true);setSearchErr(null);setSearchRaw("");setResults([]);setSelected([]);
    try{
      const sys=`You find real content creators on social media.

Search: ${q}

YOUR FIRST ACTION IS TO SEARCH. Do not answer from memory. Use the web search tool before writing anything.

RULES:
- "profile_url" MUST be a real link that appeared in your search results. Never invent one or build it from a pattern.
- If you cannot find the real profile, leave that creator out. Fewer real results is the correct outcome.
- Do not invent follower or engagement numbers. Do not include them at all.

Return ONLY a JSON array, no markdown:
[{"handle":"@username","platform":"TikTok","profile_url":"https://www.tiktok.com/@username","why":"one sentence on why they fit"}]

Up to 12 results.`;
      const r=await fetch("/api/chat",{method:"POST",headers:aiHeaders(),
        body:JSON.stringify({feature:"creators",messages:[{role:"user",content:q}],systemPrompt:sys,useWebSearch:true,maxUses:8})});
      const raw=await r.text();
      let d;try{d=JSON.parse(raw);}catch(e){d={error:raw.slice(0,140)};}
      if(d.error){setSearchErr(String(d.error).slice(0,180));setSearching(false);return;}
      const clean=(d.content||"").replace(/```json|```/g,"").trim();
      const a=clean.indexOf("["),b=clean.lastIndexOf("]");
      let list=[],parseErr="";
      if(a>=0&&b>a){try{list=JSON.parse(clean.slice(a,b+1));}catch(e){parseErr=e.message||"unparseable";}}
      const seen=new Set();
      const verified=(Array.isArray(list)?list:[]).map(x=>{
        const p=parseProfile(x.profile_url);
        if(!p)return null;
        if(seen.has(p.profile_url))return null;
        seen.add(p.profile_url);
        return{...p,why:x.why||""};
      }).filter(Boolean);
      setResults(verified);
      // Four different things can go wrong here and they need four different
      // answers. Collapsing them into one sentence tells you nothing about
      // which one you are looking at.
      if(!verified.length){
        const found=Array.isArray(list)?list.length:0;
        const why=!clean                 ? "the model replied with nothing at all"
                 :a<0||b<=a              ? "the reply was not a JSON list"
                 :parseErr               ? `the list would not parse (${parseErr})`
                 :!found                 ? "the list came back empty"
                 : `${found} name${found===1?"":"s"} came back, but not one had a real profile link on TikTok, Instagram, YouTube or Facebook`;
        const det=Array.isArray(d.searchDetail)?d.searchDetail:[];
        const ran=det.filter(x=>typeof x.results==="number");
        const hits=ran.reduce((n,x)=>n+x.results,0);
        const errs={};
        det.filter(x=>x.error).forEach(x=>{errs[x.error]=(errs[x.error]||0)+1;});
        const bad=Object.keys(errs).map(k=>`${errs[k]}× ${k}`).join(", ");
        // "Searched 7 times" is true whether the web gave back everything or
        // nothing. The counts are what separate the two.
        const searched=!det.length
          ? (d.searchCalls?` — ${d.searchCalls} search${d.searchCalls===1?"":"es"} were attempted but none returned a result block`
                          :" — and it never ran a web search")
          : ` — ${ran.length} of ${det.length} searches returned ${hits} result${hits===1?"":"s"} in total`
            +(bad?`, and ${bad}`:"");
        setSearchErr(why+searched);
        setSearchRaw(clean.slice(0,700));
      } else setSearchRaw("");
    }catch(e){setSearchErr(e.message||"Error");}
    setSearching(false);
  };

  const addSelectedToList=async(listId)=>{
    const rows=[];
    for(const r of selected.map(i=>results[i]).filter(Boolean)){
      const saved=await saveCreator(r);
      if(saved)rows.push({list_id:listId,creator_id:saved.id,status:"prospecto",added_at:new Date().toISOString()});
    }
    if(rows.length){
      const r=await sbUpsert("creator_list_members",rows,"list_id,creator_id");
      if(r&&!r.ok){setSearchErr(`Could not add to the list — ${r.error}`);return;}
    }
    setSelected([]);setAddTo(null);
    load();
  };

  const createList=async()=>{
    if(!newList.name.trim())return;
    const row={id:uuid(),workspace_id:workspaceId,name:newList.name.trim(),client_id:newList.clientId||null,created_at:new Date().toISOString()};
    const r=await sbInsertX("creator_lists",row);
    if(!r.ok){console.error(r.error);return;}
    setLists(p=>[row,...p]);
    setNewList({name:"",clientId:""});
    if(addTo==="new")await addSelectedToList(row.id);
    return row;
  };

  // ── list detail ───────────────────────────────────────────────────────────
  if(openList){
    const rows=members.filter(m=>m.list_id===openList.id)
      .map(m=>({...m,creator:creators.find(c=>c.id===m.creator_id)}))
      .filter(x=>x.creator);
    const counts=STATUSES.map(s=>({...s,n:rows.filter(r=>r.status===s.id).length}));
    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <button onClick={()=>{setOpenList(null);load();}} style={{padding:"6px 12px",border:`1px solid ${C.border}`,borderRadius:8,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted}}>← {"Lists"}</button>
          <div style={{fontSize:15,fontWeight:600,color:C.text}}>{openList.name}</div>
          {openList.client_id&&<span style={{fontSize:11,color:C.muted}}>{clientEmoji(openList.client_id)} {clientName(openList.client_id)}</span>}
          <span style={{marginLeft:"auto",fontSize:11,color:C.muted}}>{rows.length} {"creators"}</span>
        </div>

        <Card pad={14} style={{marginBottom:12}}>
          <div style={{display:"flex",gap:4,marginBottom:8}}>
            {counts.filter(c=>c.n>0).map(c=>(
              <div key={c.id} style={{flex:c.n,height:6,background:c.color,borderRadius:3}} title={`${c.label}: ${c.n}`}/>
            ))}
            {rows.length===0&&<div style={{flex:1,height:6,background:C.light,borderRadius:3}}/>}
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:10,color:C.muted}}>
            {counts.filter(c=>c.n>0).map(c=><span key={c.id} style={{color:c.id==="contratado"?BRAND.green:C.muted}}>{c.n} {c.label}</span>)}
            {rows.length===0&&<span>{"Nobody here yet."}</span>}
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {rows.map(r=>(
            <Card key={r.creator_id} pad={13}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <div style={{width:16,flexShrink:0,display:"flex"}}><PlatformIcon platform={r.creator.platform}/></div>
                <a href={r.creator.profile_url} target="_blank" rel="noopener noreferrer"
                  style={{fontSize:13,fontWeight:600,color:C.text,textDecoration:"none"}}>{r.creator.handle} ↗</a>
                {r.creator.followers>0&&(
                  <span style={{fontSize:10,color:C.muted}}>{r.creator.followers.toLocaleString("es-MX")} {"followers"}
                    {r.creator.checked_at&&<span style={{color:C.muted}}> · {"checked"} {r.creator.checked_at}</span>}
                  </span>
                )}
                <select value={r.status} onChange={async e=>{
                    await sbUpsert("creator_list_members",[{list_id:openList.id,creator_id:r.creator_id,status:e.target.value}],"list_id,creator_id");
                    setMembers(p=>p.map(m=>m.list_id===openList.id&&m.creator_id===r.creator_id?{...m,status:e.target.value}:m));
                  }}
                  style={{marginLeft:"auto",fontSize:11,padding:"4px 9px",borderRadius:20,border:`1px solid ${statusOf(r.status).color}`,background:statusOf(r.status).color+"14",color:statusOf(r.status).color,cursor:"pointer",outline:"none",fontWeight:600}}>
                  {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <button onClick={()=>setDataFor(r.creator)} style={{fontSize:10,padding:"4px 9px",borderRadius:20,border:`0.5px solid ${C.border}`,background:C.surface,cursor:"pointer",color:C.muted}}>{"+ data"}</button>
                <button onClick={async()=>{await sbDelete("creator_list_members","creator_id",r.creator_id);load();}}
                  style={{fontSize:14,background:"none",border:"none",color:C.muted,cursor:"pointer",padding:"0 2px"}}>×</button>
              </div>
              {r.creator.notes&&<div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginTop:7}}>{r.creator.notes}</div>}
            </Card>
          ))}
        </div>
        {dataFor&&<DataModal creator={dataFor} onClose={()=>setDataFor(null)} onSaved={()=>{setDataFor(null);load();}}/>}
      </div>
    );
  }

  // ── prospecting + lists ───────────────────────────────────────────────────
  return(
    <div>
      <Card pad={0} style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"16px 20px 18px"}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{"Prospecting"}</div>
          <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2,marginBottom:4}}>{"Who are you looking for?"}</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:14}}>{"Describe the creator you need, or paste the link of one you already found."}</div>

          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>{"Build your search"}</div>
          {SEARCH_HINTS.map(h=>(
            <div key={h.key} style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:C.muted,width:66,flexShrink:0}}>{h.label}</span>
              {h.chips.map(c=>{
                const on=picks[h.key]===c;
                return(
                  <button key={c} onClick={()=>setPicks(p=>({...p,[h.key]:on?undefined:c}))}
                    style={{fontSize:11,padding:"4px 10px",borderRadius:20,cursor:"pointer",
                      border:`1px solid ${on?C.text:C.border}`,background:on?C.light:C.surface,
                      color:on?C.text:C.muted,fontWeight:on?600:400}}>{c}</button>
                );
              })}
            </div>
          ))}

          <div style={{position:"relative",marginTop:12,marginBottom:10}}>
            <textarea value={query||composed} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();runSearch();}}}
              placeholder={"Food creators in Monterrey, 5k to 50k, TikTok"}
              style={{...inp,borderRadius:10,padding:"11px 48px 11px 14px",fontSize:13,lineHeight:1.5,resize:"none",height:46,fontFamily:"system-ui"}}/>
            <button onClick={runSearch} disabled={searching||!(query||composed).trim()}
              style={{position:"absolute",right:9,top:9,width:28,height:28,borderRadius:"50%",background:(query||composed).trim()?C.text:C.border,border:"none",cursor:"pointer",color:"#FFF",fontSize:14}}>↑</button>
          </div>

          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:11,color:C.muted,flexShrink:0}}>{"or"}</span>
            <input value={linkInput} onChange={e=>{setLinkInput(e.target.value);setLinkErr(null);}}
              onKeyDown={e=>e.key==="Enter"&&addLink()}
              placeholder={"Paste a TikTok or Instagram profile link"}
              style={{...inp,fontSize:12,padding:"8px 12px"}}/>
            <Btn onClick={addLink} disabled={!linkInput.trim()}>{"Analyse"}</Btn>
          </div>
          {linkErr&&<div style={{fontSize:11,color:C.red,marginTop:7}}>{linkErr}</div>}
        </div>
      </Card>

      {searching&&(
        <Card style={{marginBottom:16,textAlign:"center",padding:34}}>
          <div style={{fontSize:13,color:C.text,fontWeight:500,marginBottom:5}}>{"Searching…"}</div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.6,maxWidth:380,margin:"0 auto"}}>{"Only creators with a real, openable profile make it through."}</div>
        </Card>
      )}

      {searchErr&&!searching&&(
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:12,color:C.red,marginBottom:4,fontWeight:600}}>{"Nothing usable came back"}</div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.55}}>{searchErr}</div>
          {searchRaw&&<details style={{marginTop:8}}>
            <summary style={{fontSize:10.5,color:C.muted,cursor:"pointer",userSelect:"none"}}>
              {"What the model actually replied"}</summary>
            <pre style={{fontSize:10,lineHeight:1.5,color:C.muted,background:"#F8FAFC",
              border:"1px solid #E2E8F0",borderRadius:6,padding:"8px 10px",marginTop:6,
              whiteSpace:"pre-wrap",wordBreak:"break-word",maxHeight:220,overflow:"auto"}}>{searchRaw}</pre>
          </details>}
        </Card>
      )}

      {results.length>0&&(
        <>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:10,flexWrap:"wrap"}}>
            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>{"Results"} · {results.length}</div>
            {selected.length>0&&(
              <button onClick={()=>setAddTo("choose")}
                style={{fontSize:11,padding:"5px 12px",borderRadius:20,border:`1px solid ${C.text}`,background:C.text,color:"#FFF",cursor:"pointer",fontWeight:600}}>
                {"Add"} {selected.length} {"to a list"}
              </button>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:20}}>
            {results.map((r,i)=>{
              const already=knownUrls.has(r.profile_url);
              const inLists=already?listsOf((creators.find(c=>c.profile_url===r.profile_url)||{}).id):[];
              const on=selected.includes(i);
              return(
                <div key={r.profile_url} onClick={()=>{if(!already)setSelected(p=>on?p.filter(x=>x!==i):[...p,i]);}}
                  style={{background:C.surface,border:`1px solid ${on?BRAND.blue:C.border}`,borderRadius:10,padding:"12px 14px",cursor:already?"default":"pointer",opacity:already?.75:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <div style={{width:16,flexShrink:0,display:"flex"}}><PlatformIcon platform={r.platform}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.handle}</div>
                      <div style={{fontSize:10,color:C.muted}}>{r.platform}</div>
                    </div>
                    {on&&<span style={{fontSize:13,color:BRAND.blue}}>✓</span>}
                    {already&&<span style={{fontSize:9,color:"#C2410C",background:"#FFF7ED",border:"0.5px solid #FED7AA",borderRadius:20,padding:"1px 7px",whiteSpace:"nowrap"}}>{"Already saved"}</span>}
                  </div>
                  {r.why&&<div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:8}}>{r.why}</div>}
                  {inLists.length>0&&<div style={{fontSize:10,color:C.muted,marginBottom:7}}>{"In"} {inLists.map(l=>l.name).join(", ")}</div>}
                  <a href={r.profile_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                    style={{fontSize:10,color:BRAND.blue,textDecoration:"none",border:`0.5px solid ${BRAND.blue}40`,borderRadius:20,padding:"3px 9px"}}>{"View profile ↗"}</a>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:9}}>{"Lists"}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))",gap:10}}>
        {lists.map(l=>{
          const rows=members.filter(m=>m.list_id===l.id);
          const counts=STATUSES.map(s=>({...s,n:rows.filter(r=>r.status===s.id).length})).filter(c=>c.n>0);
          return(
            <Card key={l.id} pad={15} style={{cursor:"pointer"}} onClick={()=>setOpenList(l)}>
              <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{l.name}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>
                    {l.client_id?`${clientEmoji(l.client_id)} ${clientName(l.client_id)} · `:""}{rows.length} {"creators"}
                  </div>
                </div>
                <span style={{fontSize:10,color:C.muted,whiteSpace:"nowrap"}}>{"Open"} →</span>
              </div>
              <div style={{display:"flex",gap:4,marginBottom:7}}>
                {counts.length?counts.map(c=><div key={c.id} style={{flex:c.n,height:5,background:c.color,borderRadius:3}}/>)
                  :<div style={{flex:1,height:5,background:C.light,borderRadius:3}}/>}
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:10,color:C.muted}}>
                {counts.length?counts.map(c=><span key={c.id} style={{color:c.id==="contratado"?BRAND.green:C.muted}}>{c.n} {c.label}</span>)
                  :<span>{"Nobody here yet."}</span>}
              </div>
            </Card>
          );
        })}
        <div onClick={()=>setAddTo("new")}
          style={{border:`1px dashed ${C.border}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",minHeight:104,cursor:"pointer",fontSize:12,color:C.muted}}>
          + {"New list"}
        </div>
      </div>

      {addTo&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}
          onClick={e=>{if(e.target===e.currentTarget)setAddTo(null);}}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(420px,100%)",padding:22}}>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:4}}>
              {addTo==="new"?"New list":"Add to a list"}
            </div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:16}}>
              {addTo==="new"?"Name the campaign and pick the client it's for.":"Pick an existing list, or create one."}
            </div>
            {addTo==="choose"&&lists.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16,maxHeight:180,overflowY:"auto"}}>
                {lists.map(l=>(
                  <button key={l.id} onClick={()=>addSelectedToList(l.id)}
                    style={{textAlign:"left",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.light,cursor:"pointer",fontSize:12,color:C.text}}>
                    {l.name}
                    {l.client_id&&<span style={{color:C.muted,fontSize:10}}> · {clientName(l.client_id)}</span>}
                  </button>
                ))}
              </div>
            )}
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{"List name"}</div>
            <input value={newList.name} onChange={e=>setNewList(p=>({...p,name:e.target.value}))}
              placeholder={"Solanum summer"} style={{...inp,marginBottom:12}}/>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{"Client"}</div>
            <select value={newList.clientId} onChange={e=>setNewList(p=>({...p,clientId:e.target.value}))} style={{...inp,marginBottom:18}}>
              <option value="">{"No client"}</option>
              {(clients||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn onClick={()=>setAddTo(null)}>{"Cancel"}</Btn>
              <Btn primary disabled={!newList.name.trim()} onClick={createList}>{"Create ✓"}</Btn>
            </div>
          </div>
        </div>
      )}

      {dataFor&&<DataModal creator={dataFor} onClose={()=>setDataFor(null)} onSaved={()=>{setDataFor(null);load();}}/>}
    </div>
  );
}

// Numbers a person read off the profile. Dated, so a stale figure looks stale.
function DataModal({creator,onClose,onSaved}){
  const[f,setF]=useState({
    followers:creator.followers||"",avg_views:creator.avg_views||"",
    engagement:creator.engagement||"",notes:creator.notes||"",
  });
  const[err,setErr]=useState("");
  const[busy,setBusy]=useState(false);
  const num=v=>{const n=parseInt(String(v).replace(/[^\d]/g,""),10);return isFinite(n)?n:null;};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(420px,100%)",padding:22}}>
        <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:3}}>{creator.handle}</div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:16}}>
          {"Open the profile and type what you see. Dated, so everyone knows how fresh it is."}
        </div>
        <a href={creator.profile_url} target="_blank" rel="noopener noreferrer"
          style={{display:"inline-block",fontSize:11,color:BRAND.blue,textDecoration:"none",marginBottom:14}}>{"View profile ↗"}</a>
        {[["followers","Followers"],["avg_views","Average views"],["engagement","Engagement %"]].map(([k,label])=>(
          <div key={k} style={{marginBottom:11}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{label}</div>
            <input value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))} style={inp}/>
          </div>
        ))}
        <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{"Notes"}</div>
        <textarea value={f.notes} onChange={e=>setF(p=>({...p,notes:e.target.value}))}
          style={{...inp,height:64,resize:"none",lineHeight:1.5,marginBottom:18}}/>
        {err&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#991B1B",
          fontSize:11.5,lineHeight:1.5,padding:"8px 10px",borderRadius:8,marginBottom:12}}>{err}</div>}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={onClose}>{"Cancel"}</Btn>
          <Btn primary onClick={async()=>{
            setBusy(true);setErr("");
            const r=await sbUpdate("creators","id",creator.id,{
              followers:num(f.followers),avg_views:num(f.avg_views),
              engagement:parseFloat(String(f.engagement).replace(",","."))||null,
              notes:f.notes,checked_at:new Date().toISOString().slice(0,10)});
            setBusy(false);
            // Never close on a failed write. A tick over a 400 is how a whole
            // season of metrics goes missing without anyone noticing.
            if(r&&!r.ok){setErr(r.error||"Could not save.");return;}
            onSaved();
          }}>{busy?"Saving…":"Save ✓"}</Btn>
        </div>
      </div>
    </div>
  );
}

export { CreatorHub };
