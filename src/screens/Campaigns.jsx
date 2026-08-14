import { useEffect, useRef, useState } from "react";
import { CAMPAIGN_PLATFORMS, PLATFORM_DOMAINS, QUICK_STARTS, SEARCH_ANGLES, THUMB_COLORS } from "../data/constants";
import { curMonth, fmt, median, monthLabel, uuid } from "../lib/format";
import { sbGet, sbInsert, sbUpdate } from "../lib/supabase";
import { BRAND, C, Card, PlatformIcon, inp } from "../ui/theme";

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

export { CampaignCreator, CampaignFile, campaignInsights, parseViews, topOf, verifyRef };
