import { aiHeaders } from "../lib/supabase";
import { useState, useEffect } from "react";
import { C, BRAND, Card, Btn, inp, Logo, PlatformIcon } from "../ui/theme";
import { uuid } from "../lib/format";

// ── SHOT TYPES ────────────────────────────────────────────────────────────────
const SHOT_TYPES=["Close-up","Medium","Wide","Overhead","POV","Over the shoulder","Slow pan","Handheld","Static","Detail"];

// Sound matters very differently per platform, so the panel asks for different
// things rather than pretending trending audio is universal.
const SOUND_MODE={
  "TikTok":          {mode:"trend", note:"Trending audio drives reach here more than anywhere else."},
  "Instagram Reels": {mode:"trend", note:"Trending audio still moves reach, though less sharply than TikTok."},
  "YouTube Shorts":  {mode:"trend", note:"Shorts has an audio library, but trends matter less than the hook."},
  "Facebook":        {mode:"muted", note:"Most Facebook video is watched on mute — captions do the work, not the track."},
  "LinkedIn":        {mode:"none",  note:"Almost nobody plays LinkedIn video with sound on. Write for silence."},
  "YouTube":         {mode:"licensed", note:"Background music here is a licensing decision, not a trend one."},
};

const TIKTOK_SEARCH=q=>`https://www.tiktok.com/search?q=${encodeURIComponent(q)}`;

// ── SHOOT PLANNER ─────────────────────────────────────────────────────────────
function ShootPlanner({card,onSave,onClose}){
  const platform=card.platform||"TikTok";
  const sound=SOUND_MODE[platform]||SOUND_MODE["TikTok"];

  // Split the saved script into shots the first time this opens. After that the
  // plan is the source of truth, so edits here aren't overwritten.
  const initial=()=>{
    try{
      const saved=JSON.parse(card.shootPlan||"null");
      if(saved&&Array.isArray(saved.shots))return saved;
    }catch(e){}
    let sections={};
    try{sections=JSON.parse(card.script||"{}");}catch(e){sections={};}
    const shots=[];
    [["hook","Hook",BRAND.red],["body","Body",BRAND.yellow],["cta","CTA",BRAND.blue]].forEach(([key,label])=>{
      const text=(sections[key]||"").trim();
      if(!text)return;
      // One shot per sentence or line — a rough first pass the user can edit.
      text.split(/\n+|(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean).forEach(line=>{
        shots.push({id:uuid(),kind:"line",section:key,sectionLabel:label,text:line,talentId:null,locationId:null,shotType:"",seconds:""});
      });
    });
    return{talent:[],locations:[],shots,sound:"",soundNote:""};
  };

  const[plan,setPlan]=useState(initial);
  const[newTalent,setNewTalent]=useState("");
  const[newLocation,setNewLocation]=useState("");
  const[moods,setMoods]=useState([]);
  const[moodsLoading,setMoodsLoading]=useState(false);
  const[freeSearch,setFreeSearch]=useState("");
  const[chat,setChat]=useState([{role:"ai",text:"What's the one shot that has to work for this to land?"}]);
  const[chatInput,setChatInput]=useState("");
  const[chatBusy,setChatBusy]=useState(false);

  const TALENT_COLORS=[BRAND.red,BRAND.blue,BRAND.green,C.purple,"#F97316","#0EA5E9"];
  const talentColor=id=>{
    const i=plan.talent.findIndex(t=>t.id===id);
    return i<0?C.border:TALENT_COLORS[i%TALENT_COLORS.length];
  };
  const talentOf=id=>plan.talent.find(t=>t.id===id)||null;
  const locationOf=id=>plan.locations.find(l=>l.id===id)||null;

  const update=fn=>setPlan(p=>{const next=fn({...p});return next;});
  const setShot=(id,patch)=>update(p=>({...p,shots:p.shots.map(s=>s.id===id?{...s,...patch}:s)}));

  const addTalent=()=>{
    const name=newTalent.trim(); if(!name)return;
    update(p=>({...p,talent:[...p.talent,{id:uuid(),name}]}));
    setNewTalent("");
  };
  const addLocation=()=>{
    const name=newLocation.trim(); if(!name)return;
    update(p=>({...p,locations:[...p.locations,{id:uuid(),name}]}));
    setNewLocation("");
  };
  const blankBroll=()=>({id:uuid(),kind:"visual",section:"broll",sectionLabel:"B-roll",text:"",talentId:null,locationId:null,shotType:"",seconds:""});
  // Insert anywhere, not just at the end — b-roll usually belongs before the
  // hook or between sections, which appending could never express.
  const insertBrollAt=i=>update(p=>{const shots=[...p.shots];shots.splice(i,0,blankBroll());return{...p,shots};});
  const moveShot=(from,to)=>update(p=>{
    if(from===to||from<0||to<0||from>=p.shots.length||to>p.shots.length)return p;
    const shots=[...p.shots];
    const [moved]=shots.splice(from,1);
    shots.splice(from<to?to-1:to,0,moved);
    return{...p,shots};
  });
  const removeShot=id=>update(p=>({...p,shots:p.shots.filter(s=>s.id!==id)}));

  // Suggests what to search for. TikTok supplies what exists; the human chooses.
  const suggestMoods=async()=>{
    if(moodsLoading)return;
    setMoodsLoading(true);
    try{
      let sections={};try{sections=JSON.parse(card.script||"{}");}catch(e){}
      const sys=`You suggest short search phrases someone would type into ${platform}'s sound search to find music matching a video's mood.

Video: "${card.title}"
Hook: ${sections.hook||"not written"}
Body: ${(sections.body||"").slice(0,300)||"not written"}

Return ONLY a JSON array of 5 short phrases, 1-3 words each, describing the SOUND not the topic. Think tempo, mood, texture — "eerie slow build", "soft morning", "punchy upbeat". No hashtags, no song names, no explanation.`;
      const r=await fetch("/api/chat",{method:"POST",headers:aiHeaders(),
        body:JSON.stringify({feature:"shoot",messages:[{role:"user",content:"Suggest sound search phrases."}],systemPrompt:sys})});
      const raw=await r.text();
      let d;try{d=JSON.parse(raw);}catch(e){d=null;}
      if(d&&d.content){
        const clean=d.content.replace(/```json|```/g,"").trim();
        const a=clean.indexOf("["),b=clean.lastIndexOf("]");
        if(a>=0&&b>a){
          const parsed=JSON.parse(clean.slice(a,b+1));
          if(Array.isArray(parsed))setMoods(parsed.filter(x=>typeof x==="string").slice(0,5));
        }
      }
    }catch(e){console.error("suggestMoods",e);}
    setMoodsLoading(false);
  };

  const sendChat=async()=>{
    if(!chatInput.trim()||chatBusy)return;
    const msg=chatInput.trim();
    setChatInput("");
    setChat(c=>[...c,{role:"user",text:msg}]);
    setChatBusy(true);
    try{
      const sys=`You help someone plan a video shoot by asking questions — never by planning it for them. Under 50 words. End with one question. Platform: ${platform}. Video: "${card.title}". They have ${plan.shots.length} shots, ${plan.talent.length} talent, ${plan.locations.length} locations.`;
      const r=await fetch("/api/chat",{method:"POST",headers:aiHeaders(),
        body:JSON.stringify({feature:"shoot",messages:[{role:"user",content:msg}],systemPrompt:sys})});
      const raw=await r.text();
      let d;try{d=JSON.parse(raw);}catch(e){d=null;}
      setChat(c=>[...c,{role:"ai",text:(d&&d.content)?d.content:"Try that again in a moment."}]);
    }catch(e){setChat(c=>[...c,{role:"ai",text:"Try that again in a moment."}]);}
    setChatBusy(false);
  };

  // Script order is not shoot order. Group by location so you set up once.
  const grouped=(()=>{
    const map=new Map();
    plan.shots.forEach(s=>{
      const key=s.locationId||"__none";
      if(!map.has(key))map.set(key,[]);
      map.get(key).push(s);
    });
    const out=[];
    plan.locations.forEach(l=>{ if(map.has(l.id))out.push({location:l,shots:map.get(l.id)}); });
    if(map.has("__none"))out.push({location:null,shots:map.get("__none")});
    return out;
  })();
  const unassigned=plan.shots.filter(s=>!s.locationId||(s.kind==="line"&&!s.talentId));
  const totalSeconds=plan.shots.reduce((a,s)=>a+(parseFloat(s.seconds)||0),0);

  const printSheet=()=>{
    const esc=x=>String(x==null?"":x).replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const blocks=grouped.map(g=>`
      <div class="loc">
        <div class="loc-name">${esc(g.location?g.location.name:"Location not set")}</div>
        ${g.shots.map((s,i)=>`
          <div class="shot">
            <div class="shot-head">☐ Shot ${i+1} · ${esc(s.shotType||"shot type TBC")}${s.seconds?` · ~${esc(s.seconds)}s`:""}</div>
            ${s.kind==="line"
              ?`<div class="line">"${esc(s.text)}"</div><div class="who">${esc(talentOf(s.talentId)?.name||"talent TBC")} · ${esc(s.sectionLabel)}</div>`
              :`<div class="line">${esc(s.text||"(describe the shot)")}</div><div class="who">B-roll · no dialogue</div>`}
          </div>`).join("")}
      </div>`).join("");
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>Call sheet — ${esc(card.title)}</title><style>
      body{font-family:Georgia,serif;max-width:680px;margin:36px auto;color:#111;line-height:1.6;padding:0 20px}
      .bar{display:flex;height:4px;margin-bottom:20px}.bar div{flex:1}
      h1{font-size:22px;margin:0 0 4px;letter-spacing:-.3px}
      .meta{font-size:13px;color:#666;margin-bottom:22px}
      h2{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#555;margin:22px 0 8px;font-family:system-ui,sans-serif}
      .loc{margin-bottom:20px;border:1px solid #e8e8e8;border-radius:8px;padding:12px 14px}
      .loc-name{font-size:14px;font-weight:bold;margin-bottom:10px;font-family:system-ui,sans-serif}
      .shot{border-top:1px solid #f2f2f2;padding:9px 0}
      .shot-head{font-size:12px;font-family:system-ui,sans-serif;color:#555;margin-bottom:4px}
      .line{font-size:14px;margin-bottom:3px}
      .who{font-size:11px;color:#777;font-family:system-ui,sans-serif}
      .kit{font-size:12px;font-family:system-ui,sans-serif;color:#555;line-height:1.9}
      @media print{body{margin:14px}.loc{break-inside:avoid}}
    </style></head><body>
      <div class="bar"><div style="background:#E24B4A"></div><div style="background:#F0C040"></div><div style="background:#378ADD"></div><div style="background:#1D9E75"></div></div>
      <h1>${esc(card.title)}</h1>
      <div class="meta">${esc(platform)} · ${plan.shots.length} shots${totalSeconds?` · ~${Math.round(totalSeconds)}s of coverage`:""}${plan.sound?` · sound: ${esc(plan.sound)}`:""}</div>
      <h2>Shooting order — grouped by location</h2>
      ${blocks||"<p>No shots planned yet.</p>"}
      <h2>Before you leave</h2>
      <div class="kit">
        ☐ Play back every shot before you pack up<br>
        ☐ Two clean takes of each spoken line<br>
        ☐ One extra b-roll shot you didn't plan
      </div>
      <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`);
    w.document.close();
  };

  // A thin, quiet insert point that also accepts a dragged shot.
  const Divider=({index})=>(
    <div
      onDragOver={e=>{e.preventDefault();e.currentTarget.firstChild.style.background=C.accent;e.currentTarget.firstChild.style.height="3px";}}
      onDragLeave={e=>{e.currentTarget.firstChild.style.background="transparent";e.currentTarget.firstChild.style.height="1px";}}
      onDrop={e=>{
        e.preventDefault();
        e.currentTarget.firstChild.style.background="transparent";
        e.currentTarget.firstChild.style.height="1px";
        const from=parseInt(e.dataTransfer.getData("shotIndex"),10);
        if(!isNaN(from))moveShot(from,index);
      }}
      style={{position:"relative",height:14,display:"flex",alignItems:"center",cursor:"pointer"}}
      onMouseEnter={e=>{const b=e.currentTarget.lastChild;b.style.opacity="1";}}
      onMouseLeave={e=>{const b=e.currentTarget.lastChild;b.style.opacity="0";}}>
      <div style={{flex:1,height:1,background:"transparent",borderRadius:2,transition:"all .12s"}}/>
      <button onClick={()=>insertBrollAt(index)}
        style={{position:"absolute",left:"50%",transform:"translateX(-50%)",opacity:0,transition:"opacity .12s",fontSize:9,padding:"1px 9px",borderRadius:20,border:`0.5px solid ${C.border}`,background:C.surface,color:C.muted,cursor:"pointer",whiteSpace:"nowrap"}}>
        + b-roll here
      </button>
    </div>
  );

  const chip=(active,label,onClick,color)=>(
    <button onClick={onClick}
      style={{fontSize:9,padding:"2px 8px",borderRadius:20,cursor:"pointer",whiteSpace:"nowrap",
        border:active?`1px solid ${color||C.text}`:`1px dashed ${C.border}`,
        background:active?(color||C.text)+"18":"transparent",
        color:active?(color||C.text):C.muted}}>{label}</button>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:12}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 24px 80px rgba(0,0,0,.3)",width:"min(1120px,100%)",height:"min(740px,95vh)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        <div style={{display:"flex",height:3,flexShrink:0}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>

        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0,background:"#FAFAFA"}}>
          <Logo/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Shoot plan</div>
            <div style={{fontSize:13,fontWeight:500,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.title} · {platform}</div>
          </div>
          <button onClick={printSheet} style={{fontSize:10,padding:"5px 11px",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>Print call sheet</button>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:"0 4px"}}>×</button>
        </div>

        <div style={{flex:1,display:"grid",gridTemplateColumns:"185px 1fr 250px",overflow:"hidden"}}>

          {/* LEFT — who, where, what it sounds like */}
          <div style={{borderRight:`1px solid ${C.border}`,background:"#FAFAFA",overflowY:"auto",padding:"11px 11px 16px"}}>
            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Talent</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:8}}>
              {plan.talent.map(t=>{
                const n=plan.shots.filter(s=>s.talentId===t.id).length;
                return(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,background:C.surface,border:`0.5px solid ${C.border}`,borderLeft:`3px solid ${talentColor(t.id)}`,borderRadius:6,padding:"5px 8px"}}>
                    <span style={{fontSize:11,color:C.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                    <span style={{fontSize:9,color:C.muted}}>{n}</span>
                    <button onClick={()=>update(p=>({...p,talent:p.talent.filter(x=>x.id!==t.id),shots:p.shots.map(s=>s.talentId===t.id?{...s,talentId:null}:s)}))}
                      style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>×</button>
                  </div>
                );
              })}
            </div>
            <input value={newTalent} onChange={e=>setNewTalent(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTalent()}
              placeholder="+ Add talent" style={{...inp,fontSize:11,padding:"6px 8px",marginBottom:14,background:C.surface}}/>

            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Locations</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:8}}>
              {plan.locations.map(l=>(
                <div key={l.id} style={{display:"flex",alignItems:"center",gap:6,background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"5px 8px"}}>
                  <span style={{fontSize:11,color:C.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</span>
                  <span style={{fontSize:9,color:C.muted}}>{plan.shots.filter(s=>s.locationId===l.id).length}</span>
                  <button onClick={()=>update(p=>({...p,locations:p.locations.filter(x=>x.id!==l.id),shots:p.shots.map(s=>s.locationId===l.id?{...s,locationId:null}:s)}))}
                    style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
            <input value={newLocation} onChange={e=>setNewLocation(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLocation()}
              placeholder="+ Add location" style={{...inp,fontSize:11,padding:"6px 8px",marginBottom:14,background:C.surface}}/>

            {sound.mode!=="none"&&(
              <>
                <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>
                  {sound.mode==="muted"?"Sound & captions":sound.mode==="licensed"?"Background music":"Sound"}
                </div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.5,marginBottom:8}}>{sound.note}</div>
                {sound.mode==="trend"&&(
                  <>
                    {moods.length===0?(
                      <button onClick={suggestMoods} disabled={moodsLoading}
                        style={{width:"100%",padding:"6px 0",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:7,cursor:moodsLoading?"default":"pointer",fontSize:10,color:C.muted,marginBottom:7}}>
                        {moodsLoading?"Thinking…":"Suggest what to search for"}
                      </button>
                    ):(
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:7}}>
                        {moods.map((m,i)=>(
                          <a key={i} href={TIKTOK_SEARCH(m)} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:9,padding:"3px 8px",borderRadius:20,border:`0.5px solid ${C.border}`,background:C.surface,color:C.text,textDecoration:"none",whiteSpace:"nowrap"}}>
                            {m} ↗
                          </a>
                        ))}
                      </div>
                    )}
                    <div style={{display:"flex",gap:4,marginBottom:6}}>
                      <input value={freeSearch} onChange={e=>setFreeSearch(e.target.value)}
                        onKeyDown={e=>{if(e.key==="Enter"&&freeSearch.trim())window.open(TIKTOK_SEARCH(freeSearch.trim()),"_blank");}}
                        placeholder="Search your own words" style={{...inp,fontSize:10,padding:"5px 8px",background:C.surface}}/>
                    </div>
                    <div style={{fontSize:9,color:C.muted,lineHeight:1.45,marginBottom:9}}>Opens {platform.startsWith("TikTok")?"TikTok":"TikTok"} search — tap <strong>Sounds</strong> at the top to hear audio results.</div>
                  </>
                )}
                <input value={plan.sound} onChange={e=>update(p=>({...p,sound:e.target.value}))}
                  placeholder={sound.mode==="licensed"?"Track + licence":sound.mode==="muted"?"Background music (optional)":"Sound you picked"}
                  style={{...inp,fontSize:11,padding:"6px 8px",background:C.surface}}/>
              </>
            )}
            {sound.mode==="none"&&(
              <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderLeft:`3px solid ${BRAND.yellow}`,borderRadius:7,padding:"9px 10px"}}>
                <div style={{fontSize:10,color:C.text,marginBottom:3}}>Write for silence</div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>{sound.note}</div>
              </div>
            )}
          </div>

          {/* CENTRE — the shot list */}
          <div style={{overflowY:"auto",padding:"11px 14px 18px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9,gap:8}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Shot list · {plan.shots.length}</div>
              <button onClick={()=>insertBrollAt(plan.shots.length)} style={{fontSize:10,padding:"4px 10px",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>+ B-roll at the end</button>
            </div>

            {plan.shots.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
                <div style={{fontSize:13,color:C.text,fontWeight:500,marginBottom:5}}>No shots yet</div>
                <div style={{fontSize:11,lineHeight:1.6,maxWidth:280,margin:"0 auto"}}>Write a script and its lines land here automatically, or add b-roll shots by hand.</div>
              </div>
            )}

            {plan.shots.map((s,idx)=>{
              const secColor=s.kind==="visual"?BRAND.green:{hook:BRAND.red,body:BRAND.yellow,cta:BRAND.blue}[s.section]||C.border;
              return(
                <div key={s.id}>
                <Divider index={idx}/>
                <div draggable
                  onDragStart={e=>{e.dataTransfer.setData("shotIndex",String(idx));e.currentTarget.style.opacity=".45";}}
                  onDragEnd={e=>{e.currentTarget.style.opacity="1";}}
                  style={{borderLeft:`2px ${s.kind==="visual"?"dashed":"solid"} ${secColor}`,paddingLeft:9}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                    <span style={{fontSize:10,color:C.border,cursor:"grab",flexShrink:0,lineHeight:1}} title="Drag to reorder">⠿</span>
                    <span style={{fontSize:9,color:secColor,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>
                      {s.kind==="visual"?"B-roll · no dialogue":s.sectionLabel}
                    </span>
                    <button onClick={()=>removeShot(s.id)} style={{marginLeft:"auto",background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>×</button>
                  </div>
                  <div style={{background:C.light,border:`0.5px solid ${C.border}`,borderRadius:7,padding:"8px 10px"}}>
                    <textarea value={s.text} onChange={e=>setShot(s.id,{text:e.target.value})}
                      placeholder={s.kind==="visual"?"Bottle on the windowsill, morning light, slow pan right":"Line"}
                      style={{width:"100%",border:"none",outline:"none",background:"transparent",fontSize:12,color:C.text,lineHeight:1.5,resize:"vertical",minHeight:34,fontFamily:s.kind==="line"?"Georgia,serif":"system-ui",padding:0,marginBottom:6}}/>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                      {s.kind==="line"&&plan.talent.map(t=>chip(s.talentId===t.id,t.name,()=>setShot(s.id,{talentId:s.talentId===t.id?null:t.id}),talentColor(t.id)))}
                      {s.kind==="line"&&plan.talent.length===0&&<span style={{fontSize:9,color:C.muted}}>Add talent on the left →</span>}
                      {plan.locations.map(l=>chip(s.locationId===l.id,l.name,()=>setShot(s.id,{locationId:s.locationId===l.id?null:l.id})))}
                      <select value={s.shotType} onChange={e=>setShot(s.id,{shotType:e.target.value})}
                        style={{fontSize:9,padding:"2px 6px",borderRadius:20,border:`0.5px solid ${C.border}`,background:C.surface,color:s.shotType?C.text:C.muted,cursor:"pointer",outline:"none"}}>
                        <option value="">shot type</option>
                        {SHOT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                      <input value={s.seconds} onChange={e=>setShot(s.id,{seconds:e.target.value.replace(/[^\d.]/g,"")})}
                        placeholder="secs" style={{width:44,fontSize:9,padding:"3px 6px",borderRadius:20,border:`0.5px solid ${C.border}`,background:C.surface,color:C.text,outline:"none",textAlign:"center"}}/>
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
            <Divider index={plan.shots.length}/>
          </div>

          {/* RIGHT — shooting order, then chat */}
          <div style={{borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden",background:"#FAFAFA"}}>
            <div style={{flex:"0 0 58%",overflowY:"auto",padding:"11px 12px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Shooting order</div>
              <div style={{fontSize:10,color:C.muted,lineHeight:1.5,marginBottom:9}}>Grouped by location — set up once, get everything there.</div>

              {grouped.length===0&&<div style={{fontSize:11,color:C.muted}}>Assign locations and the shooting order appears here.</div>}

              {grouped.map((g,i)=>(
                <div key={i} style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:7,padding:"8px 10px",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                    <span style={{fontSize:11,fontWeight:600,color:g.location?C.text:C.muted}}>{g.location?g.location.name:"No location yet"}</span>
                    <span style={{marginLeft:"auto",fontSize:9,color:C.muted}}>{g.shots.length} shot{g.shots.length===1?"":"s"}</span>
                  </div>
                  {g.shots.map(s=>(
                    <div key={s.id} style={{fontSize:10,color:C.muted,lineHeight:1.6}}>
                      <span style={{color:s.kind==="visual"?C.muted:talentColor(s.talentId)}}>
                        {s.kind==="visual"?"B-roll":(talentOf(s.talentId)?.name||"talent TBC")}
                      </span>
                      {" · "}{s.shotType||"shot type TBC"}{s.seconds?` · ~${s.seconds}s`:""}
                    </div>
                  ))}
                </div>
              ))}

              {unassigned.length>0&&(
                <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderLeft:`3px solid ${BRAND.yellow}`,borderRadius:7,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:C.text,marginBottom:2}}>{unassigned.length} shot{unassigned.length===1?"":"s"} incomplete</div>
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.45}}>Missing talent or a location.</div>
                </div>
              )}

              {totalSeconds>0&&(
                <div style={{fontSize:10,color:C.muted,marginTop:8,lineHeight:1.5}}>
                  ~{Math.round(totalSeconds)}s of coverage planned.
                </div>
              )}
            </div>

            <div style={{flex:1,display:"flex",flexDirection:"column",padding:"10px 12px",gap:7,overflow:"hidden",minHeight:0}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Ask anything</div>
              <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
                {chat.map((m,i)=>(
                  <div key={i} style={{padding:"6px 9px",borderRadius:8,fontSize:11,lineHeight:1.5,background:m.role==="ai"?C.surface:BRAND.blue+"14",border:`0.5px solid ${m.role==="ai"?C.border:BRAND.blue+"30"}`,color:C.text,maxWidth:"95%",alignSelf:m.role==="user"?"flex-end":"flex-start"}}>{m.text}</div>
                ))}
                {chatBusy&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>thinking…</div>}
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
                  placeholder="Ask about coverage, order, pacing…"
                  style={{flex:1,fontSize:11,padding:"6px 10px",border:`0.5px solid ${C.border}`,borderRadius:20,background:C.surface,color:C.text,outline:"none",fontFamily:"system-ui"}}/>
                <button onClick={sendChat} disabled={!chatInput.trim()||chatBusy}
                  style={{width:26,height:26,borderRadius:"50%",background:chatInput.trim()&&!chatBusy?"#111":C.border,border:"none",cursor:"pointer",color:"#FFF",fontSize:12,flexShrink:0}}>↑</button>
              </div>
              <div style={{fontSize:9,color:C.muted,textAlign:"center"}}>Asks questions · never plans it for you</div>
            </div>
          </div>
        </div>

        <div style={{padding:"8px 16px",borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:"#FAFAFA"}}>
          <div style={{fontSize:11,color:C.muted}}>
            {plan.shots.length} shot{plan.shots.length===1?"":"s"} · {plan.locations.length} location{plan.locations.length===1?"":"s"}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{padding:"6px 14px",background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:7,cursor:"pointer",fontSize:12,color:C.text}}>Close</button>
            <button onClick={()=>onSave(JSON.stringify(plan))} style={{padding:"6px 14px",background:"#111",color:"#FFF",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:500}}>Save ✓</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ShootPlanner, SHOT_TYPES, SOUND_MODE };
