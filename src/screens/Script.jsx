import { aiHeaders } from "../lib/supabase";
import { useRef, useState } from "react";
import { GENERIC_INSIGHTS, POWER_WORDS, SCRIPT_MOVES, SCRIPT_MOVES_MORE } from "../data/constants";
import { BRAND, C, Logo } from "../ui/theme";

function ScriptDocument({card,analytics,onSave,onClose}){
  const[sections,setSections]=useState(()=>{
    try{const p=JSON.parse(card.script||"{}");return{hook:p.hook||"",body:p.body||"",cta:p.cta||"",notes:p.notes||""};}
    catch(e){return{hook:card.script||"",body:"",cta:"",notes:""};}
  });
  const[focusField,setFocusField]=useState("hook");
  const[shuffle,setShuffle]=useState(0);
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
  // Full pool for this section and platform. Shown six at a time and reshuffled
  // on demand, so the same five don't greet you every single time.
  const pool=[
    ...((SCRIPT_MOVES[focusField]||{})._base||[]),
    ...((SCRIPT_MOVES[focusField]||{})[platform]||[]),
    ...((SCRIPT_MOVES_MORE[focusField]||{})._base||[]),
    ...((SCRIPT_MOVES_MORE[focusField]||{})[platform]||[]),
  ];
  const moves=(()=>{
    const a=[...pool];
    // Deterministic shuffle per (section, platform, shuffleSeed) so it only
    // changes when the writer asks, not on every keystroke.
    let seed=(focusField+platform).split("").reduce((h,c)=>h*31+c.charCodeAt(0),7)+shuffle*9973;
    const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
    for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a.slice(0,6);
  })();

  // What you already wrote in the section before this one. The panel quotes it
  // back so the next section has to connect to it rather than start fresh.
  const priorOrder=["hook","body","cta"];
  const priorIdx=priorOrder.indexOf(focusField);
  const prior=priorIdx>0?priorOrder.slice(0,priorIdx).map(k=>({key:k,label:{hook:"Hook",body:"Body",cta:"CTA"}[k],text:(sections[k]||"").trim(),color:{hook:BRAND.red,body:BRAND.yellow,cta:BRAND.blue}[k]})).filter(x=>x.text):[];
  const JOIN_Q={body:"Does the body earn what the hook promised?",cta:"Does the ask follow from what you just said?",notes:"Do these notes match the tone you wrote in?"}[focusField];
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
      const r=await fetch("/api/chat",{method:"POST",headers:aiHeaders(),body:JSON.stringify({feature:"script",messages:[{role:"user",content:userMsg}],systemPrompt:sys})});
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
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.45,flex:1}}>Questions to push your thinking. You write the line.</div>
                <button onClick={()=>{setShuffle(s=>s+1);setOpenMove(null);}} title="Show a different set"
                  style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11,padding:2,flexShrink:0}}>↻</button>
              </div>
            </div>

            {/* What you already wrote, so this section has to connect to it */}
            {prior.length>0&&(
              <div style={{padding:"9px 12px",borderBottom:`0.5px solid ${C.border}`,background:C.surface}}>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:C.muted,marginBottom:6}}>What you've written</div>
                {prior.map(p=>(
                  <div key={p.key} style={{borderLeft:`2px solid ${p.color}`,paddingLeft:7,marginBottom:6}}>
                    <div style={{fontSize:9,color:p.color,fontWeight:600,marginBottom:1}}>{p.label}</div>
                    <div style={{fontSize:10,color:C.text,lineHeight:1.45}}>
                      {p.text.length>90?p.text.slice(0,90).trim()+"…":p.text}
                    </div>
                  </div>
                ))}
                {JOIN_Q&&<div style={{fontSize:10,color:C.muted,lineHeight:1.45,fontStyle:"italic",marginTop:7}}>{JOIN_Q}</div>}
              </div>
            )}
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

export { ScriptDocument };
