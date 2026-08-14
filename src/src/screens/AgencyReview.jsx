import { useCallback, useEffect, useRef, useState } from "react";
import { fmtTime, timeAgo } from "../lib/format";
import { addNote, getNotes } from "../lib/supabase";
import { BRAND, Btn, C, PlatformIcon, inp, shMd } from "../ui/theme";

function NotesPanel({video,workspaceId,userId,userName,onClose,onSendBack}){
  const[notes,setNotes]=useState([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(true);
  const[sending,setSending]=useState(false);
  const[showSendBack,setShowSendBack]=useState(false);
  const[sendBackNote,setSendBackNote]=useState("");
  const bottomRef=useRef(null);

  useEffect(()=>{
    getNotes(workspaceId,video.id).then(n=>{setNotes(n||[]);setLoading(false);});
  },[video.id,workspaceId]);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[notes]);

  const send=async()=>{
    if(!input.trim()||sending)return;
    setSending(true);
    await addNote(workspaceId,video.id,userId,userName,input.trim());
    setNotes(prev=>[...prev,{author_name:userName,note:input.trim(),created_at:new Date().toISOString()}]);
    setInput("");
    setSending(false);
  };

  const handleSendBack=async()=>{
    if(!sendBackNote.trim())return;
    await addNote(workspaceId,video.id,userId,userName,`↩ Sent back: ${sendBackNote.trim()}`);
    onSendBack&&onSendBack(video.id,sendBackNote.trim());
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",display:"flex",alignItems:"stretch",justifyContent:"flex-end",zIndex:999,fontFamily:"system-ui,sans-serif"}}
         onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.surface,width:"min(400px,100vw)",height:"100vh",display:"flex",flexDirection:"column",boxShadow:"-8px 0 32px rgba(0,0,0,.16)"}}>

        <div style={{display:"flex",height:3,flexShrink:0}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>

        {/* Header */}
        <div style={{padding:"14px 18px",borderBottom:`0.5px solid ${C.border}`,flexShrink:0,background:"#FAFAFA"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Notes</div>
              <div style={{fontSize:14,fontWeight:600,color:C.text,lineHeight:1.3,letterSpacing:-0.2}}>{video.title}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3,display:"flex",alignItems:"center",gap:5}}>
                <PlatformIcon platform={video.platform}/>{video.platform}
                <span>· {notes.length} note{notes.length===1?"":"s"}</span>
              </div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
          </div>
        </div>

        {/* Notes list */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:9}}>
          {loading&&(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[0,1].map(i=><div key={i} style={{height:52,borderRadius:10,background:C.light,animation:"notePulse 1.4s ease-in-out infinite"}}/>)}
            </div>
          )}
          {!loading&&notes.length===0&&(
            <div style={{textAlign:"center",padding:"48px 20px",color:C.muted}}>
              <div style={{width:34,height:34,borderRadius:9,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <div style={{width:14,height:2,borderRadius:2,background:C.border,boxShadow:`0 5px 0 ${C.border}, 0 -5px 0 ${C.border}`}}/>
              </div>
              <div style={{fontSize:13,color:C.text,fontWeight:500,marginBottom:4}}>No notes yet</div>
              <div style={{fontSize:11,lineHeight:1.6,maxWidth:220,margin:"0 auto"}}>Leave feedback for the editor, or approve the video if it's ready.</div>
            </div>
          )}
          {notes.map((n,i)=>{
            const isSendBack=n.note.startsWith("↩");
            const body=isSendBack?n.note.replace(/^↩\s*Sent back:\s*/,""):n.note;
            return(
              <div key={i} style={{display:"flex",gap:9}}>
                <div style={{width:26,height:26,borderRadius:8,flexShrink:0,background:isSendBack?"#FFF7ED":C.light,border:`0.5px solid ${isSendBack?"#FED7AA":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:isSendBack?"#C2410C":C.muted}}>
                  {(n.author_name||"T").slice(0,1).toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:600,color:C.text}}>{n.author_name||"Team"}</span>
                    <span style={{fontSize:10,color:C.muted}}>{timeAgo(n.created_at)}</span>
                    {isSendBack&&<span style={{fontSize:9,fontWeight:600,color:"#C2410C",background:"#FFF7ED",border:"0.5px solid #FED7AA",borderRadius:20,padding:"1px 7px"}}>Sent back</span>}
                  </div>
                  <div style={{fontSize:12,color:C.text,lineHeight:1.6,background:isSendBack?"#FFF7ED":C.light,border:`0.5px solid ${isSendBack?"#FED7AA":C.border}`,borderRadius:9,padding:"8px 10px",wordBreak:"break-word"}}>{body}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>

        {/* Send back */}
        {video.stage==="review"&&(
          <div style={{padding:"11px 16px",borderTop:`0.5px solid ${C.border}`,flexShrink:0,background:"#FAFAFA"}}>
            {!showSendBack?(
              <button onClick={()=>{
                  if(notes.length>0){onSendBack&&onSendBack(video.id,"");onClose();return;}
                  setShowSendBack(true);
                }}
                style={{width:"100%",padding:"9px 0",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#F97316";e.currentTarget.style.color="#C2410C";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text;}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#F97316"}}/>Send back to Editing{notes.length>0?` · ${notes.length} note${notes.length===1?"":"s"}`:""}
              </button>
            ):(
              <div>
                <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:6}}>What needs to change?</div>
                <textarea value={sendBackNote} onChange={e=>setSendBackNote(e.target.value)}
                  placeholder="Be specific — the editor only sees this note."
                  style={{...inp,fontSize:12,height:66,resize:"none",lineHeight:1.55,marginBottom:8,background:C.surface}}/>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>{setShowSendBack(false);setSendBackNote("");}} style={{flex:1,padding:"8px 0",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,color:C.text}}>Cancel</button>
                  <button onClick={handleSendBack} disabled={!sendBackNote.trim()}
                    style={{flex:1,padding:"8px 0",background:sendBackNote.trim()?"#F97316":C.border,color:sendBackNote.trim()?"#FFF":C.muted,border:"none",borderRadius:8,cursor:sendBackNote.trim()?"pointer":"not-allowed",fontSize:12,fontWeight:600}}>Send back</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Composer */}
        <div style={{padding:"11px 16px 14px",borderTop:`0.5px solid ${C.border}`,display:"flex",gap:8,flexShrink:0,alignItems:"flex-end"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Add a note…"
            style={{...inp,flex:1,fontSize:12,padding:"9px 11px",height:38,resize:"none",lineHeight:1.5,fontFamily:"system-ui"}}/>
          <button onClick={send} disabled={sending||!input.trim()}
            style={{width:34,height:34,borderRadius:"50%",background:sending||!input.trim()?C.border:C.text,color:"#FFF",border:"none",cursor:sending||!input.trim()?"not-allowed":"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
        </div>
      </div>
      <style>{`@keyframes notePulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  );
}


// ── CLIENT PROFILE SETUP ──────────────────────────────────────────────────────

const TS_RE=/^\[t=(\d+(?:\.\d+)?)\]\s*/;

const videoEmbed=url=>{
  const u=(url||"").trim();
  if(!u)return{kind:"none"};
  if(/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(u))return{kind:"file",src:u};
  const drive=u.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if(drive)return{kind:"embed",src:`https://drive.google.com/file/d/${drive[1]}/preview`,host:"Google Drive"};
  const yt=u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)/);
  if(yt)return{kind:"embed",src:`https://www.youtube.com/embed/${yt[1]}`,host:"YouTube"};
  const vimeo=u.match(/vimeo\.com\/(\d+)/);
  if(vimeo)return{kind:"embed",src:`https://player.vimeo.com/video/${vimeo[1]}`,host:"Vimeo"};
  return{kind:"link",src:u};
};

function ReviewRoom({video,workspaceId,userId,userName,onClose,onSendBack,onApprove}){
  const[notes,setNotes]=useState([]);
  const[loading,setLoading]=useState(true);
  const[input,setInput]=useState("");
  const[sending,setSending]=useState(false);
  const[at,setAt]=useState(0);           // playhead for file mode
  const[manual,setManual]=useState("");  // mm:ss for embed mode
  const[showSendBack,setShowSendBack]=useState(false);
  const[sendBackNote,setSendBackNote]=useState("");
  const vidRef=useRef(null);

  const emb=videoEmbed(video.videoUrl||video.url);
  const canAutoStamp=emb.kind==="file";

  const refresh=useCallback(()=>{
    getNotes(workspaceId,video.id).then(n=>{setNotes(n||[]);setLoading(false);}).catch(()=>setLoading(false));
  },[workspaceId,video.id]);
  useEffect(()=>{refresh();},[refresh]);

  const parseManual=str=>{
    const m=(str||"").trim().match(/^(?:(\d+):)?(\d{1,2})(?:\.(\d+))?$/);
    if(!m)return null;
    return (+(m[1]||0))*60+(+m[2])+(m[3]?+`0.${m[3]}`:0);
  };

  const send=async()=>{
    if(!input.trim()||sending)return;
    setSending(true);
    const t=canAutoStamp?at:parseManual(manual);
    const body=(t!==null&&t!==undefined&&!isNaN(t))?`[t=${Math.floor(t)}] ${input.trim()}`:input.trim();
    await addNote(workspaceId,video.id,userId,userName,body);
    setInput("");setManual("");
    refresh();
    setSending(false);
  };

  const seek=sec=>{
    if(vidRef.current){vidRef.current.currentTime=sec;vidRef.current.play?.();}
  };

  const stamped=notes.map(n=>{
    const m=(n.note||"").match(TS_RE);
    return {...n, t:m?parseFloat(m[1]):null, body:(n.note||"").replace(TS_RE,"")};
  }).sort((a,b)=>(a.t===null)-(b.t===null)||(a.t||0)-(b.t||0));

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.62)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui,sans-serif",padding:14}}
         onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 24px 80px rgba(0,0,0,.3)",width:"min(1040px,100%)",height:"min(700px,94vh)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        <div style={{display:"flex",height:3,flexShrink:0}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>

        <div style={{padding:"12px 18px",borderBottom:`0.5px solid ${C.border}`,display:"flex",alignItems:"flex-start",gap:12,flexShrink:0,background:"#FAFAFA"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Review</div>
            <div style={{fontSize:15,fontWeight:600,color:C.text,lineHeight:1.3,letterSpacing:-0.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{video.title}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3,display:"flex",alignItems:"center",gap:5}}>
              <PlatformIcon platform={video.platform}/>{video.platform}
              {video.revision&&<span style={{fontSize:9,fontWeight:700,color:"#FFF",background:"#EA580C",borderRadius:20,padding:"1px 7px"}}>REVISE</span>}
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
        </div>

        <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 330px",overflow:"hidden"}}>

          {/* Player */}
          <div style={{background:"#0B0B0C",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",minHeight:0,padding:10}}>
              {emb.kind==="file"&&(
                <video ref={vidRef} src={emb.src} controls
                  onTimeUpdate={e=>setAt(e.target.currentTime)}
                  style={{maxWidth:"100%",maxHeight:"100%",borderRadius:8,background:"#000"}}/>
              )}
              {emb.kind==="embed"&&(
                <iframe src={emb.src} title="Video" allow="autoplay; fullscreen" allowFullScreen
                  style={{width:"100%",height:"100%",border:"none",borderRadius:8,background:"#000"}}/>
              )}
              {emb.kind==="link"&&(
                <div style={{textAlign:"center",color:"#9CA3AF",padding:24}}>
                  <div style={{fontSize:13,marginBottom:8}}>This link can't be embedded</div>
                  <a href={emb.src} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#93C5FD"}}>Open the video in a new tab ↗</a>
                </div>
              )}
              {emb.kind==="none"&&(
                <div style={{textAlign:"center",color:"#9CA3AF",padding:24}}>
                  <div style={{fontSize:13,marginBottom:6}}>No video attached yet</div>
                  <div style={{fontSize:11,lineHeight:1.6,maxWidth:280}}>The editor adds the finished video when they send it for review.</div>
                </div>
              )}
            </div>
            <div style={{padding:"8px 12px",borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
              {canAutoStamp?(
                <>
                  <span style={{fontSize:11,color:"#E5E7EB",fontVariantNumeric:"tabular-nums"}}>{fmtTime(at)}</span>
                  <span style={{fontSize:10,color:"#6B7280"}}>notes attach to this moment</span>
                </>
              ):emb.kind==="embed"?(
                <>
                  <input value={manual} onChange={e=>setManual(e.target.value)} placeholder="0:00"
                    style={{width:62,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.16)",borderRadius:6,color:"#E5E7EB",fontSize:11,padding:"4px 7px",outline:"none",textAlign:"center",fontVariantNumeric:"tabular-nums"}}/>
                  <span style={{fontSize:10,color:"#6B7280",lineHeight:1.4}}>{emb.host} won't share its playhead — type the time, or attach an .mp4 for automatic stamps.</span>
                </>
              ):null}
              {(video.videoUrl||video.url)&&<a href={video.videoUrl||video.url} target="_blank" rel="noopener noreferrer" style={{marginLeft:"auto",fontSize:10,color:"#93C5FD",flexShrink:0}}>Open ↗</a>}
            </div>
          </div>

          {/* Notes */}
          <div style={{display:"flex",flexDirection:"column",overflow:"hidden",borderLeft:`0.5px solid ${C.border}`}}>
            <div style={{flex:1,overflowY:"auto",padding:"13px 14px",display:"flex",flexDirection:"column",gap:8}}>
              {loading&&[0,1].map(i=><div key={i} style={{height:48,borderRadius:9,background:C.light}}/>)}
              {!loading&&stamped.length===0&&(
                <div style={{textAlign:"center",padding:"40px 16px",color:C.muted}}>
                  <div style={{fontSize:12,color:C.text,fontWeight:500,marginBottom:4}}>No notes yet</div>
                  <div style={{fontSize:11,lineHeight:1.6}}>Play the video and leave feedback at the moment it matters.</div>
                </div>
              )}
              {stamped.map((n,i)=>{
                const isBack=n.body.startsWith("↩");
                const body=isBack?n.body.replace(/^↩\s*Sent back:\s*/,""):n.body;
                return(
                  <div key={i} style={{display:"flex",gap:8}}>
                    <div style={{width:24,height:24,borderRadius:7,flexShrink:0,background:isBack?"#FFF7ED":C.light,border:`0.5px solid ${isBack?"#FED7AA":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:isBack?"#C2410C":C.muted}}>
                      {(n.author_name||"T").slice(0,1).toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                        {n.t!==null&&(
                          <span onClick={()=>canAutoStamp&&seek(n.t)}
                            style={{fontSize:10,fontWeight:600,color:BRAND.blue,background:BRAND.blue+"14",border:`0.5px solid ${BRAND.blue}35`,borderRadius:20,padding:"1px 7px",cursor:canAutoStamp?"pointer":"default",fontVariantNumeric:"tabular-nums"}}>
                            {fmtTime(n.t)}
                          </span>
                        )}
                        <span style={{fontSize:11,fontWeight:600,color:C.text}}>{n.author_name||"Team"}</span>
                        <span style={{fontSize:10,color:C.muted}}>{timeAgo(n.created_at)}</span>
                        {isBack&&<span style={{fontSize:9,fontWeight:600,color:"#C2410C",background:"#FFF7ED",border:"0.5px solid #FED7AA",borderRadius:20,padding:"1px 6px"}}>Sent back</span>}
                      </div>
                      <div style={{fontSize:12,color:C.text,lineHeight:1.55,background:isBack?"#FFF7ED":C.light,border:`0.5px solid ${isBack?"#FED7AA":C.border}`,borderRadius:9,padding:"7px 10px",wordBreak:"break-word"}}>{body}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{padding:"10px 14px",borderTop:`0.5px solid ${C.border}`,display:"flex",gap:7,alignItems:"flex-end",flexShrink:0}}>
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder={canAutoStamp?`Note at ${fmtTime(at)}…`:"Add a note…"}
                style={{...inp,flex:1,fontSize:12,padding:"8px 10px",height:36,resize:"none",lineHeight:1.5,fontFamily:"system-ui"}}/>
              <button onClick={send} disabled={sending||!input.trim()}
                style={{width:32,height:32,borderRadius:"50%",background:sending||!input.trim()?C.border:C.text,color:"#FFF",border:"none",cursor:sending||!input.trim()?"not-allowed":"pointer",fontSize:13,flexShrink:0}}>↑</button>
            </div>

            <div style={{padding:"10px 14px 13px",borderTop:`0.5px solid ${C.border}`,flexShrink:0,background:"#FAFAFA"}}>
              {!showSendBack?(
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>{
                      // Already left feedback? Then the note is written — just send it back.
                      if(stamped.length>0){onSendBack(video.id,"");onClose();return;}
                      setShowSendBack(true);
                    }}
                    style={{flex:1,padding:"9px 0",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:"#F97316"}}/>Send back{stamped.length>0?` · ${stamped.length}`:""}
                  </button>
                  <button onClick={()=>{onApprove(video.id);onClose();}}
                    style={{flex:1,padding:"9px 0",background:BRAND.green,border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,color:"#FFF"}}>Approve ✓</button>
                </div>
              ):(
                <div>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:6}}>What needs to change?</div>
                  <textarea value={sendBackNote} onChange={e=>setSendBackNote(e.target.value)}
                    placeholder="The editor only sees this note."
                    style={{...inp,fontSize:12,height:60,resize:"none",lineHeight:1.5,marginBottom:7,background:C.surface}}/>
                  <div style={{display:"flex",gap:7}}>
                    <button onClick={()=>{setShowSendBack(false);setSendBackNote("");}} style={{flex:1,padding:"8px 0",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:12,color:C.text}}>Cancel</button>
                    <button onClick={async()=>{
                        if(!sendBackNote.trim())return;
                        await addNote(workspaceId,video.id,userId,userName,`↩ Sent back: ${sendBackNote.trim()}`);
                        onSendBack(video.id,sendBackNote.trim());
                        onClose();
                      }} disabled={!sendBackNote.trim()}
                      style={{flex:1,padding:"8px 0",background:sendBackNote.trim()?"#F97316":C.border,color:sendBackNote.trim()?"#FFF":C.muted,border:"none",borderRadius:8,cursor:sendBackNote.trim()?"pointer":"not-allowed",fontSize:12,fontWeight:600}}>Send back</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ATTACH VIDEO (editor, on the way to review) ───────────────────────────────

function AttachVideoModal({video,onSave,onClose}){
  const[url,setUrl]=useState(video.videoUrl||"");
  const emb=videoEmbed(url);
  const ok=url.trim().length>0;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(440px,95vw)",padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Send for review</div>
            <div style={{fontSize:15,fontWeight:600,color:C.text}}>Attach the finished video</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.55}}>Paste a link the reviewer can open — Drive, YouTube, Vimeo, or a direct file.</div>
        <input value={url} onChange={e=>setUrl(e.target.value)} autoFocus
          placeholder="https://drive.google.com/file/d/…"
          style={{...inp,fontSize:12,marginBottom:9}}/>
        {ok&&(
          <div style={{fontSize:10,color:C.muted,background:C.light,border:`0.5px solid ${C.border}`,borderLeft:`3px solid ${emb.kind==="file"?BRAND.green:emb.kind==="embed"?BRAND.blue:BRAND.yellow}`,borderRadius:7,padding:"8px 10px",marginBottom:14,lineHeight:1.55}}>
            {emb.kind==="file"&&"Direct file — the reviewer's notes will stamp themselves with the exact second."}
            {emb.kind==="embed"&&`${emb.host} — plays inside the review panel. ${emb.host} won't share its playhead, so the reviewer types the timestamp by hand.`}
            {emb.kind==="link"&&"This link can't be embedded. The reviewer can still open it in a new tab."}
          </div>
        )}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary disabled={!ok} onClick={()=>{onSave(url.trim());onClose();}}>Send for review →</Btn>
        </div>
      </div>
    </div>
  );
}

export { AttachVideoModal, NotesPanel, ReviewRoom, TS_RE, videoEmbed };
