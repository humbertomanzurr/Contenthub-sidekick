import { useCallback, useEffect, useRef, useState } from "react";
import { AGENCY_STAGES, CLIENT_QUESTIONS, STAGES } from "../data/constants";
import { addMonths, curMonth, daysSince, fmt, monthLabel, uuid } from "../lib/format";
import { createWorkspace, getNotes, getWorkspaceMember, sbDelete, sbGetWhere, sbInsert, sbInsertX, sbUpdate, sbUpsert } from "../lib/supabase";
import { AgencyAnalytics } from "./AgencyAnalytics";
import { SettingsPage } from "./Settings";
import { TourBubble } from "./Business";
import { PLANS, cardLimitReason, isSolo, planOf } from "../lib/plan";
import { AttachVideoModal, NotesPanel, ReviewRoom } from "./AgencyReview";
import { AddVideoModal, GoalModal, MetricsModal } from "./Business";
import { CampaignCreator } from "./Campaigns";
import { CampaignWorkspace } from "./CampaignWorkspace";
import { ScriptDocument } from "./Script";
import { ShootPlanner } from "./Shoot";
import { AIBoxIcon, BRAND, Btn, C, Card, Logo, PlatformIcon, inp, sh, shMd } from "../ui/theme";

function AgencyOnboarding({user,onComplete,solo}){
  const[step,setStep]=useState(0);
  const[wsName,setWsName]=useState("");
  const[loading,setLoading]=useState(false);

  const finish=async()=>{
    if(!wsName.trim())return;
    setLoading(true);
    const wsId=await createWorkspace(wsName.trim(),user.id);
    setLoading(false);
    onComplete(wsId);
  };

  if(step===0)return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(500px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"40px 36px",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:16}}>{solo?"🏪":"🏛️"}</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:10,lineHeight:1.2}}>
          {solo?"Welcome to ContentHub":"Welcome to Sidekick Agency"}
        </div>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:24,maxWidth:380,margin:"0 auto 24px"}}>
          {solo
            ?"Everything you make for your brand, in one place — planned, filmed, published, and measured. Nothing here posts for you and nothing writes for you."
            :"Manage content pipelines for all your clients in one place. Every client gets their own board, targets, and creative direction tailored to their brand."}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32,textAlign:"left",background:C.light,borderRadius:12,padding:"16px 18px"}}>
          {[
            ...(solo?[
              ["🗂️","One board for your brand","Idea → Production → Editing → Published"],
              ["🎯","A goal you can see","How many videos this month, and how close you are"],
              ["✨","Questions, not answers","The AI helps you think it through. You write it."],
            ]:[
              ["🗂️","One pipeline per client","Idea → Production → Editing → Review → Approved → Published"],
              ["📊","Big picture dashboard","Monthly targets and health across all clients"],
              ["✨","Tailored creative direction","Channel-specific guidance based on each client's brand and analytics"],
            ]),
          ].map(([e,t,d])=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{e}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{t}</div>
                <div style={{fontSize:11,color:C.muted}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>setStep(1)} style={{padding:"13px 32px",background:C.text,color:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer"}}>
          Let's set it up →
        </button>
      </div>
    </div>
  );

  if(step===1)return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(460px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"36px 32px"}}>
        {/* Progress */}
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {[0,1].map(i=><div key={i} style={{height:4,borderRadius:20,flex:i===0?3:1,background:i===0?C.accent:C.border,transition:"all .3s"}}/>)}
        </div>
        <div style={{fontSize:11,fontWeight:600,color:C.accent,letterSpacing:0.5,marginBottom:8}}>1 of 1</div>
        <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:6,letterSpacing:-0.3}}>
          {solo?"What is your brand called?":"What is your agency called?"}
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:22,lineHeight:1.5}}>
          {solo
            ?"We'll set up your pipeline under this name. You can change it later."
            :"This becomes your workspace name. Your team will see it when they join."}
        </div>
        <input
          autoFocus
          value={wsName}
          onChange={e=>setWsName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&wsName.trim()&&setStep(2)}
          placeholder="e.g. REVO Labs, Spark Creative, Bold Media..."
          style={{...inp,fontSize:15,padding:"13px 14px",marginBottom:22}}
        />
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button
            onClick={()=>wsName.trim()&&setStep(2)}
            disabled={!wsName.trim()}
            style={{padding:"10px 24px",background:wsName.trim()?C.text:C.border,color:wsName.trim()?"#FFF":C.muted,border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:wsName.trim()?"pointer":"not-allowed"}}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2 — Handoff screen
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"min(500px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"40px 36px",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:14}}>🎉</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:8}}>
          You're all set, {wsName}!
        </div>
        <div style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:28,maxWidth:380,margin:"0 auto 28px"}}>
          {solo?"Your board is ready. Here's the loop:":"Your workspace is ready. Here's how it works:"}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14,textAlign:"left",marginBottom:32}}>
          {[
            ...(solo?[
              {n:"1",icon:"🎯",title:"Set your goal for the month",desc:"Decide how many videos you want out. The board fills with slots so you can see the gap at a glance."},
              {n:"2",icon:"🗂️",title:"Move cards as the work moves",desc:"Idea, Production, Editing, Published. The board is only worth having if it says what is actually true."},
              {n:"3",icon:"📊",title:"Come back with the numbers",desc:"Once a video is out, add its views. Do that a few times and the app can start telling you what actually works for you."},
            ]:[
              {n:"1",icon:"🏢",title:"Add your clients from the dashboard",desc:"Each client gets their own pipeline, goal, and progress tracking. Add as many as you need."},
              {n:"2",icon:"✨",title:"Creative direction per client",desc:"When you add a client, answer a few questions about their brand. The platform uses that to give channel-specific creative directions — not generic suggestions, their voice."},
              {n:"3",icon:"📊",title:"Track everything from the dashboard",desc:"See all your clients' progress at a glance. Drill into any client for their full pipeline and analytics."},
            ]),
          ].map(item=>(
            <div key={item.n} style={{display:"flex",gap:12,alignItems:"flex-start",background:C.light,borderRadius:10,padding:"12px 14px"}}>
              <span style={{fontSize:20,flexShrink:0}}>{item.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}>{item.title}</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={finish}
          disabled={loading}
          style={{padding:"13px 32px",background:loading?C.border:C.text,color:loading?C.muted:"#FFF",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer"}}>
          {loading?"Setting up...":"Go to my dashboard →"}
        </button>
      </div>
    </div>
  );
}

// ── CONTEXTUAL TOUR ──────────────────────────────────────────────────────────

function ClientProfileSetup({client,onComplete,onSkip}){
  const[step,setStep]=useState(0);
  const[vals,setVals]=useState({whatTheyDo:"",audience:"",goal:"",tone:""});
  const q=CLIENT_QUESTIONS[step];
  const isLast=step===CLIENT_QUESTIONS.length-1;
  const canNext=vals[q?.key]?.trim().length>0;

  const next=()=>{
    if(isLast){onComplete(vals);return;}
    setStep(s=>s+1);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui",padding:24}}>
      <div style={{width:"min(480px,100%)",background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shMd,padding:"36px 32px"}}>
        {/* Progress */}
        <div style={{display:"flex",gap:6,marginBottom:24}}>
          {CLIENT_QUESTIONS.map((_,i)=>(
            <div key={i} style={{height:4,borderRadius:20,flex:i===step?3:1,background:i<=step?BRAND.blue:C.border,transition:"all .3s"}}/>
          ))}
        </div>
        {/* Client name badge */}
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.light,border:`1px solid ${C.border}`,borderRadius:20,padding:"3px 10px",marginBottom:14,fontSize:11,color:C.muted}}>
          <span>{client.emoji}</span><span style={{fontWeight:600,color:C.text}}>{client.name}</span>
        </div>
        <div style={{fontSize:11,fontWeight:600,color:C.accent,letterSpacing:0.5,marginBottom:6}}>{step+1} of {CLIENT_QUESTIONS.length}</div>
        <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:5,letterSpacing:-0.3,lineHeight:1.3}}>{q.label}</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.5}}>{q.hint}</div>
        <input
          key={q.key}
          autoFocus
          value={vals[q.key]}
          onChange={e=>setVals(p=>({...p,[q.key]:e.target.value}))}
          onKeyDown={e=>e.key==="Enter"&&canNext&&next()}
          placeholder={q.placeholder}
          style={{...inp,fontSize:14,padding:"12px 14px",marginBottom:20}}
        />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onSkip} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0}}>Skip for now</button>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,padding:0}}>← Back</button>}
            <button onClick={next} disabled={!canNext} style={{padding:"10px 22px",background:canNext?"#111":C.border,color:canNext?"#FFF":C.muted,border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:canNext?"pointer":"not-allowed"}}>
              {isLast?"Save client profile ✓":"Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AGENCY DASHBOARD ──────────────────────────────────────────────────────────

function AgencyDashboard({clientError,clients,videos,targets,month,onMonthChange,onSelectClient,onAddClient,onSetTarget,onReschedule,businessProfile}){
  const[showAddClient,setShowAddClient]=useState(false);
  const[newName,setNewName]=useState("");
  const[adding,setAdding]=useState(false);
  const[newEmoji,setNewEmoji]=useState("🏢");
  const[showEmoji,setShowEmoji]=useState(false);
  const[pendingProfileClient,setPendingProfileClient]=useState(null);
  const[trayOpen,setTrayOpen]=useState(false);
  const[dayOpen,setDayOpen]=useState(null);
  const[calOpen,setCalOpen]=useState(true);
  // Colours identify clients across the whole calendar.
  const CLIENT_COLORS=[BRAND.blue,BRAND.green,BRAND.red,BRAND.yellow,C.purple,"#F97316","#0EA5E9","#DB2777"];
  const colorOf=id=>CLIENT_COLORS[Math.max(0,clients.findIndex(c=>c.id===id))%CLIENT_COLORS.length];

  const mVids=videos.filter(v=>v.month===month);
  const agencyPub=mVids.filter(v=>v.stage==="published").length;
  const agencyGoal=clients.reduce((s,c)=>s+((targets.find(t=>t.client_id===c.id&&t.month===month)?.goal)||0),0);
  const agencyPct=agencyGoal>0?Math.min(100,Math.round(agencyPub/agencyGoal*100)):0;
  const agencyRevise=mVids.filter(v=>v.revision&&v.stage!=="published").length;
  const scheduled=mVids.filter(v=>v.targetDate);
  const unscheduled=mVids.filter(v=>!v.targetDate&&v.stage!=="published");
  const byDay={};
  scheduled.forEach(v=>{(byDay[v.targetDate]=byDay[v.targetDate]||[]).push(v);});

  // Month grid, Monday-first, padded to whole weeks.
  const[y,mo]=month.split("-").map(Number);
  const first=new Date(y,mo-1,1);
  const daysInMonth=new Date(y,mo,0).getDate();
  const lead=(first.getDay()+6)%7;
  const cells=[];
  for(let i=0;i<lead;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(`${month}-${String(d).padStart(2,"0")}`);
  while(cells.length%7)cells.push(null);
  const todayISO=new Date().toISOString().slice(0,10);

  const onDrop=(e,date)=>{
    e.preventDefault();
    e.currentTarget.style.background=C.light;
    const id=e.dataTransfer.getData("videoId");
    if(id&&date)onReschedule(id,date);
  };
  const EMOJIS=["🏢","🍕","💪","✂️","🛍️","🍔","☕","🏠","💄","🎵","🐾","🌿","👗","🚗","📚","🎮","🏋️","🍜","🌮","🏪"];

  const addClient=async()=>{
    if(!newName.trim()||adding)return;
    setAdding(true);
    const name=newName.trim(), emoji=newEmoji;
    // Close first. Waiting on the insert + reload left the modal open, and
    // people click again — which is how you end up with three of the same client.
    setNewName("");setNewEmoji("🏢");setShowAddClient(false);
    try{
      const newClient=await onAddClient(name,emoji);
      if(newClient)setPendingProfileClient(newClient);
    }catch(e){console.error("addClient",e);}
    setAdding(false);
  };


  return(
    <div>
      {clientError&&(
        <div style={{background:"#FEF2F2",border:`1px solid ${C.red}35`,borderRadius:10,padding:"11px 14px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:C.red,marginBottom:3}}>That client didn't save</div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.55,wordBreak:"break-word"}}>{clientError}</div>
        </div>
      )}
      {/* Month nav */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <button onClick={()=>onMonthChange(addMonths(month,-1))} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:13,color:C.text}}>←</button>
          <div style={{fontSize:15,fontWeight:700,color:C.text,minWidth:125,textAlign:"center"}}>{monthLabel(month)}</div>
          <button onClick={()=>onMonthChange(addMonths(month,1))} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:13,color:C.text}}>→</button>
          {month!==curMonth()&&<button onClick={()=>onMonthChange(curMonth())} style={{padding:"5px 10px",border:`1px solid ${C.border}`,borderRadius:7,background:C.light,cursor:"pointer",fontSize:11,color:C.muted}}>This month</button>}
        </div>
        <Btn primary onClick={()=>setShowAddClient(true)}>+ Add client</Btn>
      </div>
      {/* LEVEL 1 — the agency as a whole */}
      {clients.length>0&&(
        <Card pad={0} style={{marginBottom:14,overflow:"hidden"}}>
          <div style={{display:"flex",height:3}}>
            {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
          </div>
          <div style={{padding:"15px 18px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:14,marginBottom:10,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Agency · {monthLabel(month)}</div>
                <div style={{fontSize:19,fontWeight:600,color:C.text,letterSpacing:-0.3}}>
                  {agencyGoal>0?`${agencyPct}% of the month's target`:"Set targets per client to track progress"}
                </div>
              </div>
              {agencyGoal>0&&(
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:24,fontWeight:700,color:C.text,lineHeight:1}}>{agencyPub}<span style={{fontSize:13,color:C.muted,fontWeight:400}}> / {agencyGoal}</span></div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>published</div>
                </div>
              )}
            </div>
            {agencyGoal>0&&(
              <div style={{height:8,background:C.light,borderRadius:20,overflow:"hidden",marginBottom:8}}>
                <div style={{width:`${agencyPct}%`,height:"100%",background:agencyPct>=100?BRAND.green:`linear-gradient(90deg,${BRAND.red},${BRAND.blue})`,borderRadius:20,transition:"width .4s"}}/>
              </div>
            )}
            <div style={{display:"flex",gap:14,fontSize:11,color:C.muted,flexWrap:"wrap"}}>
              <span>{agencyPub} published</span>
              <span>{mVids.length-agencyPub} in pipeline</span>
              <span>{clients.length} client{clients.length===1?"":"s"}</span>
              {agencyRevise>0&&<span style={{color:"#C2410C"}}>{agencyRevise} needing revision</span>}
            </div>
          </div>
        </Card>
      )}

      {/* LEVEL 2 — each client's shape, at a glance */}
      {clients.length>0&&(
        <>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7,flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>By client · tap to open a pipeline</div>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {AGENCY_STAGES.map(st=>(
                <span key={st.id} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:9,color:C.muted}}>
                  <span style={{width:7,height:7,borderRadius:2,background:st.color}}/>{st.label==="Ready for Review"?"Review":st.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(215px,1fr))",gap:9,marginBottom:16}}>
            {clients.map(client=>{
              const cv=mVids.filter(v=>v.clientId===client.id);
              const target=targets.find(t=>t.client_id===client.id&&t.month===month);
              const goal=target?.goal||0;
              const pub=cv.filter(v=>v.stage==="published").length;
              const pct=goal>0?Math.min(100,Math.round(pub/goal*100)):null;
              const revise=cv.filter(v=>v.revision&&v.stage!=="published").length;
              const counts=AGENCY_STAGES.map(st=>cv.filter(v=>v.stage===st.id).length);
              // Bars are scaled to this client's own busiest stage, so a client with
              // 4 videos reads as clearly as one with 40.
              const peak=Math.max(1,...counts);
              const bar=pct===null?C.border:pct>=80?BRAND.green:pct>=40?BRAND.blue:C.red;
              return(
                <div key={client.id} onClick={()=>onSelectClient(client)}
                  style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 12px",cursor:"pointer",transition:"box-shadow .15s,transform .15s,border-color .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.09)";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.borderColor=colorOf(client.id);}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=C.border;}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <span style={{fontSize:13,flexShrink:0}}>{client.emoji||"🏢"}</span>
                    <span style={{flex:1,fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{client.name}</span>
                    {revise>0&&<span title={`${revise} needing revision`} style={{fontSize:8,fontWeight:700,color:"#FFF",background:"#EA580C",borderRadius:20,padding:"1px 5px",flexShrink:0}}>{revise}</span>}
                    <span style={{fontSize:11,color:pct!==null&&pct<40?C.red:C.muted,flexShrink:0}}>
                      {goal>0?<>{pub}<span style={{color:C.muted}}>/{goal}</span></>:cv.length}
                    </span>
                  </div>
                  <div style={{height:4,background:C.light,borderRadius:20,overflow:"hidden",marginBottom:9}}>
                    {pct!==null&&<div style={{width:`${pct}%`,height:"100%",background:bar,borderRadius:20,transition:"width .4s"}}/>}
                  </div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:4,height:34}}>
                    {AGENCY_STAGES.map((st,i)=>{
                      const n=counts[i];
                      const h=n===0?4:Math.max(6,Math.round(n/peak*28));
                      return(
                        <div key={st.id} title={`${st.label}: ${n}`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:0}}>
                          <div style={{width:"100%",height:h,background:st.color,opacity:n===0?.2:1,borderRadius:2,transition:"height .3s"}}/>
                          <div style={{fontSize:9,color:n===0?C.muted:C.text}}>{n}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {clients.length>0&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7,gap:8}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Schedule</div>
          <button onClick={()=>setCalOpen(o=>!o)} style={{padding:"4px 11px",border:`0.5px solid ${C.border}`,borderRadius:20,background:C.surface,cursor:"pointer",fontSize:11,color:C.muted}}>
            {calOpen?"Hide calendar":"Show calendar"}
          </button>
        </div>
      )}

      {clients.length===0?(
        <Card style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:36,marginBottom:10}}>🏛️</div>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>No clients yet</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Add your first client to start building their content pipeline.</div>
          <Btn primary onClick={()=>setShowAddClient(true)}>+ Add your first client</Btn>
        </Card>
      ):calOpen?(
        <>
          <Card pad={10} style={{marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d=>(
                <div key={d} style={{fontSize:9,color:C.muted,textAlign:"center",letterSpacing:.5}}>{d}</div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
              {cells.map((date,i)=>{
                if(!date)return <div key={i} style={{minHeight:78}}/>;
                const list=byDay[date]||[];
                const dayNum=Number(date.slice(-2));
                const isToday=date===todayISO;
                const isPast=date<todayISO;
                const weekend=[5,6].includes((i)%7);
                // Density ladder: full titles when there's room, compact rows when
                // there isn't, and a colour stack once it's beyond reading.
                const mode=list.length<=2?"full":list.length<=5?"compact":"stack";
                return(
                  <div key={date}
                    onDragOver={e=>{e.preventDefault();e.currentTarget.style.background=C.accent+"10";}}
                    onDragLeave={e=>{e.currentTarget.style.background=C.light;}}
                    onDrop={e=>onDrop(e,date)}
                    style={{background:C.light,borderRadius:7,padding:5,minHeight:78,border:isToday?`1px solid ${C.accent}`:"1px solid transparent",opacity:weekend&&!list.length?.55:1,transition:"background .15s"}}>
                    <div style={{fontSize:10,color:isToday?C.accent:C.muted,fontWeight:isToday?700:400,marginBottom:3}}>
                      {dayNum}{isToday?" · today":""}
                    </div>
                    {mode==="stack"?(
                      <div onClick={()=>setDayOpen(date)} style={{cursor:"pointer"}}>
                        <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:3}}>
                          {list.slice(0,6).map(v=>(
                            <div key={v.id} style={{height:3,borderRadius:2,background:colorOf(v.clientId)}}/>
                          ))}
                        </div>
                        <div style={{fontSize:9,color:C.muted}}>{list.length} videos</div>
                      </div>
                    ):list.map(v=>{
                      const col=colorOf(v.clientId);
                      const late=isPast&&v.stage!=="published";
                      return(
                        <div key={v.id} draggable
                          onDragStart={e=>{e.dataTransfer.setData("videoId",v.id);e.currentTarget.style.opacity=".4";}}
                          onDragEnd={e=>{e.currentTarget.style.opacity="1";}}
                          onClick={()=>{const c=clients.find(x=>x.id===v.clientId);if(c)onSelectClient(c);}}
                          title={`${v.title}${late?" · past its date":""}`}
                          style={{background:col+"18",borderLeft:`2px solid ${col}`,borderRadius:4,padding:mode==="full"?"3px 5px":"2px 4px",marginBottom:2,cursor:"grab",display:"flex",alignItems:"center",gap:4}}>
                          {late&&<span style={{width:4,height:4,borderRadius:"50%",background:C.red,flexShrink:0}}/>}
                          <span style={{fontSize:9,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.3}}>{v.title}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Card>

          {unscheduled.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:11,background:C.surface,border:`1px solid ${C.border}`,borderLeft:`3px solid ${BRAND.yellow}`,borderRadius:9,padding:"11px 14px"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:C.text}}>{unscheduled.length} card{unscheduled.length===1?"":"s"} with no date</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>They don't appear on the calendar until someone schedules them.</div>
              </div>
              <button onClick={()=>setTrayOpen(o=>!o)} style={{padding:"5px 12px",border:`0.5px solid ${C.border}`,borderRadius:20,background:C.surface,cursor:"pointer",fontSize:11,color:C.muted,flexShrink:0}}>
                {trayOpen?"Hide":"Show them"}
              </button>
            </div>
          )}
          {trayOpen&&unscheduled.length>0&&(
            <Card pad={12} style={{marginTop:8}}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Drag onto a day to schedule</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {unscheduled.map(v=>{
                  const col=colorOf(v.clientId);
                  return(
                    <div key={v.id} draggable
                      onDragStart={e=>{e.dataTransfer.setData("videoId",v.id);e.currentTarget.style.opacity=".4";}}
                      onDragEnd={e=>{e.currentTarget.style.opacity="1";}}
                      style={{background:col+"14",border:`0.5px solid ${col}50`,borderLeft:`3px solid ${col}`,borderRadius:6,padding:"5px 9px",cursor:"grab",fontSize:11,color:C.text,maxWidth:210,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {v.title}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      ):null}

      {dayOpen&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setDayOpen(null);}}
          style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
          <Card pad={0} style={{width:"min(420px,100%)",maxHeight:"80vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"13px 16px",borderBottom:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:14,fontWeight:600,color:C.text}}>{new Date(dayOpen+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
              <button onClick={()=>setDayOpen(null)} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>×</button>
            </div>
            <div style={{padding:12,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
              {(byDay[dayOpen]||[]).map(v=>{
                const col=colorOf(v.clientId);
                const c=clients.find(x=>x.id===v.clientId);
                return(
                  <div key={v.id} onClick={()=>{if(c)onSelectClient(c);}}
                    style={{background:C.light,borderLeft:`3px solid ${col}`,borderRadius:7,padding:"8px 11px",cursor:"pointer"}}>
                    <div style={{fontSize:12,color:C.text,marginBottom:2}}>{v.title}</div>
                    <div style={{fontSize:10,color:C.muted}}>{c?c.name:""} · {(AGENCY_STAGES.find(s=>s.id===v.stage)||{}).label}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Client profile setup after adding */}
      {pendingProfileClient&&(
        <ClientProfileSetup
          client={pendingProfileClient}
          onComplete={async(profile)=>{
            await sbUpdate("agency_clients","id",pendingProfileClient.id,{client_profile:profile});
            setPendingProfileClient(null);
          }}
          onSkip={()=>setPendingProfileClient(null)}
        />
      )}
      {/* Add client modal */}
      {showAddClient&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(380px,95vw)",padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:800,color:C.text}}>Add a client</div>
              <button onClick={()=>setShowAddClient(false)} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>×</button>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,position:"relative"}}>
              <button onClick={()=>setShowEmoji(e=>!e)} style={{width:46,height:46,border:`1px solid ${C.border}`,borderRadius:10,background:C.light,fontSize:22,cursor:"pointer",flexShrink:0}}>{newEmoji}</button>
              {showEmoji&&<div style={{position:"absolute",top:"110%",left:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:8,zIndex:99,display:"flex",flexWrap:"wrap",width:196,gap:3,boxShadow:shMd}}>{EMOJIS.map(e=><button key={e} onClick={()=>{setNewEmoji(e);setShowEmoji(false);}} style={{width:32,height:32,border:"none",background:"none",cursor:"pointer",fontSize:18,borderRadius:6}}>{e}</button>)}</div>}
              <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addClient()} placeholder="Client name..." style={{...inp,flex:1}}/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setShowAddClient(false)}>Cancel</Btn><Btn onClick={addClient} primary disabled={adding||!newName.trim()}>Add client ✓</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AGENCY CLIENT PIPELINE ──────────────────────────────────────────────────
// ── REVIEW ROOM ───────────────────────────────────────────────────────────────
// Notes are timestamped so feedback points at a moment, not a vibe.
// Direct video files (.mp4 etc) play in a <video> tag, so we can read the exact
// second. Drive/YouTube embeds are cross-origin — the browser will not expose
// their playhead — so those get a manual timestamp field instead.

function AgencyClientPipeline({client,videos,target,month,workspaceId,userId,userName,onAddVideo,onMoveVideo,onMetrics,onDeleteVideo,onSetTarget,onSaveScript,onSaveShoot,onBack,solo,canAnalytics=true,onUpsell}){
  // Review and Approved only mean something when a second person signs work
  // off. On a solo plan the board is Idea, Production, Editing, Published --
  // the four stages the old Business portal always used.
  const stages = solo ? STAGES : AGENCY_STAGES;
  const[showAdd,setShowAdd]=useState(false);
  const[showGoal,setShowGoal]=useState(false);
  // The guided tour from the old Business portal. Six steps, anchored to real
  // elements — it teaches by pointing at the thing, not by describing it.
  // Solo plans only: an agency arrives knowing what a pipeline is.
  const tourKey=`sk_tour_${userId}`;
  // 0 = off, 1..6 = a bubble is showing, -1 = bubble hidden while the user
  // actually performs the step. tourNext holds where to resume once they do.
  // Steps 1 and 2 ask for a real action and wait for it; the rest just read.
  const[tourStep,setTourStep]=useState(0);
  const[tourNext,setTourNext]=useState(null);
  const refGoal=useRef(null), refAdd=useRef(null), refStages=useRef(null), refPublished=useRef(null);
  useEffect(()=>{
    if(!solo)return;
    try{ if(!localStorage.getItem(tourKey)) setTourStep(1); }catch(e){}
  },[solo,tourKey]);
  const endTour=()=>{ setTourStep(0); setTourNext(null); try{ localStorage.setItem(tourKey,"done"); }catch(e){} };
  const showStep=n=>{ if(n>6)endTour(); else setTourStep(n); };
  // Called by whatever the user was asked to do. If they closed the modal
  // without doing it, resumeTour puts the bubble back rather than leaving the
  // tour stranded at -1 — the original could get stuck that way.
  const completeTourAction=()=>{ if(tourNext!==null){ showStep(tourNext); setTourNext(null); } };
  // Functional update, not a read of tourStep. AddVideoModal.save() calls
  // onSave() and then onClose() in the same handler, so completeTourAction
  // advanced the step and resumeTour immediately put it back using the stale
  // value it had closed over. Reading the pending step instead means a resume
  // can only ever fire when the tour really is still waiting.
  const resumeTour=()=>setTourStep(cur=>cur===-1?(tourNext!==null?tourNext-1:0):cur);
  // Self-healing. tourStep -1 means "a modal is open and we are waiting on it".
  // If no modal is actually open we are stranded: the user dismissed it by a
  // route that did not call back — Escape, a backdrop click, a close button
  // added later. Rather than trusting every dismissal path to remember the
  // tour, notice the impossible state and put the bubble back.
  useEffect(()=>{
    if(tourStep!==-1||tourNext===null)return;
    if(showGoal||showAdd)return;
    const t=setTimeout(()=>setTourStep(tourNext-1),150);
    return()=>clearTimeout(t);
  },[tourStep,tourNext,showGoal,showAdd]);
  const[metricsVid,setMetricsVid]=useState(null);
  const[publishDateModal,setPublishDateModal]=useState(null);
  const[publishDateVal,setPublishDateVal]=useState("");
  const[confirmDel,setConfirmDel]=useState(null);
  const[notesVid,setNotesVid]=useState(null);
  const[scriptCard,setScriptCard]=useState(null);
  const[shootCard,setShootCard]=useState(null);
  const[noteCounts,setNoteCounts]=useState({});
  const[attachVid,setAttachVid]=useState(null);
  const[reviewVid,setReviewVid]=useState(null);
  // Keyed on the review-stage ids so this doesn't refire on every video change.
  const[notesTick,setNotesTick]=useState(0);
  const revKey=(videos||[]).filter(v=>v.stage==="review"||v.stage==="editing").map(v=>v.id).sort().join(",");
  useEffect(()=>{
    const ids=revKey?revKey.split(","):[];
    if(!ids.length){setNoteCounts({});return;}
    let dead=false;
    Promise.all(ids.map(id=>getNotes(workspaceId,id).then(n=>[id,(n||[]).length]).catch(()=>[id,0])))
      .then(pairs=>{if(!dead)setNoteCounts(Object.fromEntries(pairs));});
    return()=>{dead=true;};
  },[revKey,workspaceId,notesTick]);
  // Insights must reflect THIS client, not the agency as a whole.
  const clientAnalytics=(()=>{
    const withM=(videos||[]).filter(v=>v.metricsAdded&&v.views>0);
    const top=key=>{
      const agg={};
      withM.forEach(v=>{const k=(v[key]||"").trim();if(k){agg[k]=agg[k]||{n:0,views:0};agg[k].n++;agg[k].views+=v.views;}});
      return Object.keys(agg).sort((a,b)=>(agg[b].views/agg[b].n)-(agg[a].views/agg[a].n))[0]||null;
    };
    return {hasPersonalData:withM.length>=3,topHook:top("hook"),topFormat:top("format")};
  })();

  const goal=target?.goal||0;
  const mVids=videos.filter(v=>v.month===month);
  const pub=mVids.filter(v=>v.stage==="published").length;
  const pct=goal>0?Math.min(100,Math.round(pub/goal*100)):null;
  const emptyCount=Math.max(0,goal-mVids.length);
  const PLT={TikTok:"📱","Instagram Reels":"📸","YouTube Shorts":"🎬",YouTube:"▶️",Facebook:"👥",LinkedIn:"💼"};

  const requestReview=v=>setAttachVid(v);

  const handleMove=(id,newStage)=>{
    // Doing the thing beats reading about it: if they publish while the tour
    // is still explaining publishing, move on.
    if(tourStep===4&&newStage==="published")showStep(5);
    const vid=(videos||[]).find(x=>x.id===id);
    // Nothing reaches review without a video to review.
    if(newStage==="review"&&vid&&!vid.videoUrl){setAttachVid(vid);return;}
    if(newStage==="published"){setPublishDateVal(new Date().toISOString().slice(0,10));setPublishDateModal({id,newStage});}
    // Coming back from review is a send-back however it happened — button or drag.
    else if(newStage==="editing"&&vid&&vid.stage==="review")onMoveVideo(id,newStage,undefined,{revision:true});
    else onMoveVideo(id,newStage);
  };

  const handleSendBack=(id,note)=>{
    onMoveVideo(id,"editing",undefined,{revision:true});
  };

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        {!solo&&(
        <button onClick={onBack} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,color:C.muted}}>← All clients</button>
        )}
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          <span style={{fontSize:22}}>{client.emoji||"🏢"}</span>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>{client.name}</div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <button ref={refGoal} onClick={()=>setShowGoal(true)} style={{padding:"6px 13px",border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted,fontWeight:600}}>🎯 {goal>0?`${goal} videos`:"Set goal"}</button>
          <span ref={refAdd}><Btn primary onClick={()=>{setShowAdd(true);if(tourStep===2){setTourStep(-1);setTourNext(3);}}}>+ Add idea</Btn></span>
        </div>
      </div>

      {/* Progress */}
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
          <div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:1,fontWeight:600,marginBottom:3}}>{client.name.toUpperCase()} — {monthLabel(month)}</div>
            <div style={{fontSize:18,fontWeight:800,color:pct===100?C.green:C.accent}}>{goal===0?"Set a goal to track progress":pct===100?"🎉 Target hit!":pct+"%  complete"}</div>
          </div>
          {goal>0&&<div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:900,color:C.text}}>{pub}<span style={{fontSize:13,color:C.muted}}>/{goal}</span></div><div style={{fontSize:11,color:C.muted}}>published</div></div>}
        </div>
        {goal>0&&<><div style={{background:C.light,borderRadius:20,height:8,overflow:"hidden",marginBottom:5}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?BRAND.green:`linear-gradient(90deg,${BRAND.red},${BRAND.blue})`,borderRadius:20,transition:"width .4s"}}/></div><div style={{fontSize:11,color:C.muted}}>{mVids.filter(v=>v.stage!=="published").length} in progress · {Math.max(0,goal-pub)} remaining</div></>}
      </Card>

      {/* 5-stage Kanban */}
      <div ref={refStages} style={{display:"grid",gridTemplateColumns:`repeat(${stages.length},1fr)`,gap:9}}>
        {stages.map(stage=>{
          // A card parked in Review or Approved has no column on a solo board.
          // Bucket it into the nearest stage that exists rather than letting it
          // disappear — an invisible card is worse than one in the wrong place.
          const bucket=v=>!solo?v.stage
            :v.stage==="review"?"editing"
            :v.stage==="approved"?"published"
            :v.stage;
          const cards=mVids.filter(v=>bucket(v)===stage.id);
          const isReview=stage.id==="review";
          return(
            <div key={stage.id}
              ref={stage.id==="published"?refPublished:null}
              onDragOver={e=>e.preventDefault()}
              onDragEnter={e=>{e.currentTarget.style.background=stage.color+"18";e.currentTarget.style.outline=`2px dashed ${stage.color}`;}}
              onDragLeave={e=>{e.currentTarget.style.background=C.light;e.currentTarget.style.outline="none";}}
              onDrop={e=>{e.preventDefault();e.currentTarget.style.background=C.light;e.currentTarget.style.outline="none";const vid=e.dataTransfer.getData("videoId");const from=e.dataTransfer.getData("fromStage");if(vid&&from!==stage.id)handleMove(vid,stage.id);}}
              style={{background:isReview?"#FFF7ED":C.light,borderRadius:10,padding:9,transition:"background .15s",border:isReview?"1px solid #FED7AA":"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:stage.color}}/><div style={{fontSize:10,fontWeight:700,color:C.text,lineHeight:1.2}}>{stage.label}</div></div>
                <span style={{fontSize:10,fontWeight:700,background:stage.color+"22",color:stage.color,padding:"1px 6px",borderRadius:20}}>{cards.length}</span>
              </div>
              {cards.map(v=>{
                const isPub=v.stage==="published";
                const isRev=v.stage==="review";
                const isApproved=v.stage==="approved";
                const daysGone=daysSince(v.publishDate||v.createdAt);
                const unlocked=isPub&&daysGone>=7;
                const hasMet=v.metricsAdded;
                const unlockDate=()=>{const d=new Date(v.publishDate||v.createdAt);d.setDate(d.getDate()+7);return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});};
                const isCf=confirmDel===v.id;
                const needsRevision=!!v.revision&&(stage.id==="editing"||stage.id==="review");
                const nCount=noteCounts[v.id]||0;
                return(
                  <div key={v.id} draggable
                    onDragStart={e=>{e.dataTransfer.setData("videoId",v.id);e.dataTransfer.setData("fromStage",stage.id);e.currentTarget.style.opacity="0.35";e.currentTarget.style.transform="rotate(1.5deg) scale(1.02)";}}
                    onDragEnd={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}
                    style={{background:C.surface,borderRadius:10,marginBottom:8,border:`1px solid ${needsRevision?"#FDBA74":isRev?"#FED7AA":hasMet?"#BBF7D0":C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)",cursor:"grab",display:"flex",overflow:"hidden",transition:"box-shadow .15s,transform .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.1)";e.currentTarget.style.transform="translateY(-1px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.06)";e.currentTarget.style.transform="none";}}>
                    <div style={{width:5,background:needsRevision?"#EA580C":isRev?"#F97316":stage.color,flexShrink:0,borderRadius:"10px 0 0 10px"}}/>
                    <div style={{padding:"10px 12px 0",flex:1,minWidth:0,position:"relative"}}>

                      {/* Platform · stage · actions */}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <PlatformIcon platform={v.platform}/>
                        <span style={{fontSize:10,fontWeight:500,color:needsRevision?"#EA580C":isRev?"#F97316":stage.color,letterSpacing:0.2}}>{isRev?"Ready for Review":stage.label}</span>
                        {needsRevision&&<span style={{fontSize:9,fontWeight:700,color:"#FFF",background:"#EA580C",borderRadius:20,padding:"1px 7px",letterSpacing:.3,flexShrink:0}}>REVISE</span>}
                        <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}}>
                          {(stage.id==="idea"||stage.id==="production"||stage.id==="editing")&&<AIBoxIcon onClick={()=>setScriptCard(v)}/>}
                          <button onClick={()=>setConfirmDel(v.id)}
                            style={{width:18,height:18,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"transparent",transition:"color .15s,background .15s",padding:0}}
                            onMouseEnter={e=>{e.currentTarget.style.color=BRAND.red;e.currentTarget.style.background="#FEE2E2";}}
                            onMouseLeave={e=>{e.currentTarget.style.color="transparent";e.currentTarget.style.background="none";}}>×</button>
                        </div>
                      </div>

                      <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:5,lineHeight:1.35,wordBreak:"break-word"}}>{v.title}</div>

                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:7}}>
                        {v.targetDate&&<span style={{fontSize:10,color:C.muted}}>📅 {v.targetDate}</span>}

                      </div>

                      {isPub&&!hasMet&&!unlocked&&(
                        <div style={{marginBottom:8,fontSize:10,color:C.muted,lineHeight:1.45}}>
                          Views usually keep climbing for about a week — numbers from {unlockDate()} will be steadier.
                        </div>
                      )}
                      {hasMet&&<div style={{marginBottom:8,padding:"5px 9px",background:"#DCFCE7",borderRadius:7,border:"1px solid #BBF7D0",display:"inline-flex",alignItems:"center",gap:5}}><span style={{fontSize:10}}>📊</span><span style={{fontSize:10,fontWeight:700,color:C.green}}>{fmt(v.views||0)} views</span></div>}

                      {/* Actions — Notes and Approve belong to Ready for Review only */}
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                        {isRev&&(
                          <button onClick={()=>setReviewVid(v)}
                            style={{fontSize:10,padding:"5px 11px",background:C.text,border:"none",borderRadius:20,cursor:"pointer",color:"#FFF",fontWeight:600,display:"inline-flex",alignItems:"center",gap:5}}>
                            ▶ Review video{nCount>0?` · ${nCount}`:""}
                          </button>
                        )}
                        {(!isRev&&(needsRevision||nCount>0))&&(
                          <button onClick={()=>setNotesVid(v)}
                            style={{fontSize:10,padding:"5px 11px",background:needsRevision?"#FFF7ED":nCount>0?C.purple+"12":C.surface,border:`1px solid ${needsRevision?"#FDBA74":nCount>0?C.purple+"55":C.border}`,borderRadius:20,cursor:"pointer",color:needsRevision?"#C2410C":nCount>0?C.purple:C.text,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5,transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.purple;e.currentTarget.style.color=C.purple;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=nCount>0?C.purple+"55":C.border;e.currentTarget.style.color=nCount>0?C.purple:C.text;}}>
                            <span style={{width:5,height:5,borderRadius:"50%",background:needsRevision?"#EA580C":nCount>0?C.purple:C.border}}/>{needsRevision?"Read notes":"Notes"}{nCount>0?` ${nCount}`:""}
                          </button>
                        )}
                        {stage.id==="approved"&&<button onClick={()=>handleMove(v.id,"published")} style={{fontSize:10,padding:"5px 11px",background:BRAND.green,border:"none",borderRadius:20,cursor:"pointer",color:"#FFF",fontWeight:600}}>Publish →</button>}
                        {stage.id==="editing"&&!solo&&<button onClick={()=>requestReview(v)} style={{fontSize:10,padding:"5px 11px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text,fontWeight:500}}>{v.videoUrl?"Send for review →":"Attach video →"}</button>}
                        {isPub&&!hasMet&&<button onClick={()=>canAnalytics
                          ?setMetricsVid(v)
                          :onUpsell&&onUpsell({title:"Tracking results is part of Business",
                              body:"Add this video's views and engagement, and the app starts learning which hooks and formats work for your brand. That is what the upgrade buys — the numbers are yours either way, we just can't do the maths for you yet."})} style={{fontSize:10,padding:"5px 11px",background:C.green,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:600}}>📊 Add metrics</button>}
                        {isCf&&<div style={{display:"flex",gap:4,alignItems:"center",marginLeft:"auto"}}><span style={{fontSize:10,color:C.red,fontWeight:700}}>Delete?</span><button onClick={()=>{onDeleteVideo(v.id);setConfirmDel(null);}} style={{fontSize:10,padding:"2px 7px",background:C.red,border:"none",borderRadius:20,cursor:"pointer",color:"#fff",fontWeight:700}}>Yes</button><button onClick={()=>setConfirmDel(null)} style={{fontSize:10,padding:"2px 7px",background:C.light,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",color:C.text}}>No</button></div>}
                      </div>

                      {/* Progress across the 5 agency stages + script entry */}
                      <div style={{marginTop:8,marginLeft:-12,marginRight:-12,borderTop:`0.5px solid ${C.border}`,padding:"8px 12px",display:"flex",flexDirection:"column",gap:7}}>
                        <div style={{display:"flex",gap:3}}>
                          {stages.map((st2,i2)=>{
                            const idx=stages.findIndex(x=>x.id===stage.id);
                            return <div key={st2.id} style={{height:4,flex:1,borderRadius:2,background:i2<=idx?st2.color:C.border,transition:"background .3s"}}/>;
                          })}
                        </div>
                        {(stage.id==="idea"||stage.id==="production"||stage.id==="editing")&&(
                          <button onClick={()=>setScriptCard(v)}
                            style={{width:"100%",padding:"7px 0",borderRadius:7,border:`1.5px solid ${v.script?BRAND.red:C.border}`,background:v.script?BRAND.red+"12":C.light,cursor:"pointer",fontSize:11,fontWeight:600,color:v.script?BRAND.red:C.muted,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.red;e.currentTarget.style.background=BRAND.red+"18";e.currentTarget.style.color=BRAND.red;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=v.script?BRAND.red:C.border;e.currentTarget.style.background=v.script?BRAND.red+"12":C.light;e.currentTarget.style.color=v.script?BRAND.red:C.muted;}}>
                            <div style={{width:7,height:7,borderRadius:1,background:"currentColor"}}/>
                            {v.script?(()=>{try{const p=JSON.parse(v.script);const wc=Object.values(p).join(" ").trim().split(/\s+/).filter(Boolean).length;return wc>0?`Script · ${wc} words`:"Script written";}catch(e){return"Script written";}})():"Write your script"}
                          </button>
                        )}
                        {false&&stage.id==="production"&&(
                          <button onClick={()=>setShootCard(v)}
                            style={{width:"100%",padding:"7px 0",borderRadius:7,border:`1.5px solid ${v.shootPlan?BRAND.yellow:C.border}`,background:v.shootPlan?BRAND.yellow+"18":C.light,cursor:"pointer",fontSize:11,fontWeight:600,color:v.shootPlan?"#8A6D00":C.muted,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.yellow;e.currentTarget.style.background=BRAND.yellow+"22";e.currentTarget.style.color="#8A6D00";}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=v.shootPlan?BRAND.yellow:C.border;e.currentTarget.style.background=v.shootPlan?BRAND.yellow+"18":C.light;e.currentTarget.style.color=v.shootPlan?"#8A6D00":C.muted;}}>
                            <div style={{width:7,height:7,borderRadius:1,background:"currentColor"}}/>
                            {v.shootPlan?(()=>{try{const p=JSON.parse(v.shootPlan);const n=(p.shots||[]).length;return n>0?`Shoot plan · ${n} shot${n===1?"":"s"}`:"Plan the shoot";}catch(e){return"Plan the shoot";}})():"Plan the shoot"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {stage.id==="idea"&&goal===0&&cards.length===0&&<div style={{textAlign:"center",padding:"14px 6px",color:C.muted,fontSize:10,border:`1px dashed ${C.border}`,borderRadius:8,background:C.bg,lineHeight:1.5}}>Set a goal<br/>to fill pipeline</div>}
              {stage.id==="idea"&&[...Array(emptyCount)].map((_,i)=><div key={`e${i}`} onClick={()=>setShowAdd(true)} style={{background:C.surface,borderRadius:8,padding:10,marginBottom:7,border:`1px dashed ${C.border}`,cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND.blue;e.currentTarget.style.background="#EFF6FF";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}><div style={{fontSize:14,marginBottom:2}}>+</div><div style={{fontSize:9,fontWeight:700,color:C.muted}}>Fill me out</div></div>)}
              {cards.length===0&&stage.id!=="idea"&&<div style={{textAlign:"center",padding:"14px 6px",color:C.muted,fontSize:10,border:`1px dashed ${C.border}`,borderRadius:7,background:C.bg}}>Nothing here</div>}
            </div>
          );
        })}
      </div>

      {/* Modals */}

      {solo&&tourStep===1&&<TourBubble step={1} total={6} emoji="🎯" targetRef={refGoal}
        title="Start with a number"
        body="Decide how many videos you want out this month. It is the one number the whole board is measured against, and it fills your pipeline with slots to fill."
        action="Set my goal →" onAction={()=>{setTourStep(-1);setTourNext(2);setShowGoal(true);}} onSkip={endTour}/>}

      {solo&&tourStep===2&&<TourBubble step={2} total={6} emoji="➕" targetRef={refAdd}
        title="Add your first idea"
        body="Think of one video you want to make this week. It does not have to be good yet — a working title is enough. You can rename it any time."
        action="Add a video →" onAction={()=>{setTourStep(-1);setTourNext(3);setShowAdd(true);}} onSkip={endTour}/>}

      {solo&&tourStep===3&&<TourBubble step={3} total={6} emoji="🚀" targetRef={refStages} side="top"
        title="Drag it as you go"
        body="Idea, Production, Editing, Published. Move the card when the work moves — the board is only useful if it says what is actually true."
        action="Got it →" onAction={()=>setTourStep(4)} onSkip={endTour}/>}

      {solo&&tourStep===4&&<TourBubble step={4} total={6} emoji="📱" targetRef={refPublished} side="top"
        title="You publish it, not us"
        body="Post the video wherever it lives — TikTok, Instagram, wherever — then drag the card to Published. This app never posts anything for you."
        action="Got it →" onAction={()=>setTourStep(5)} onSkip={endTour}/>}

      {solo&&tourStep===5&&<TourBubble step={5} total={6} emoji="📊" targetRef={refPublished} side="top"
        title="Then come back with the numbers"
        body="Views keep climbing for about a week, so a number from day seven tells you more than one from day one. You can add them whenever you like — it is a suggestion, not a lock."
        action="Got it →" onAction={()=>setTourStep(6)} onSkip={endTour}/>}

      {solo&&tourStep===6&&<TourBubble step={6} total={6} emoji="✨" targetRef={refStages} side="top"
        title="That is the whole loop"
        body="Plan, make, publish, record what happened. Do it a few times and the app can start telling you which openings and formats actually work for you — that part comes with Business."
        action="Let me at it →" onAction={endTour} onSkip={endTour}/>}

      {showGoal&&<GoalModal month={month} current={goal} onSave={v=>{onSetTarget(client.id,month,v);setShowGoal(false);completeTourAction();}} onClose={()=>{setShowGoal(false);resumeTour();}}/>}
      {showAdd&&<AddVideoModal month={month} onSave={v=>{onAddVideo({...v,clientId:client.id,workspaceId});setShowAdd(false);completeTourAction();}} onClose={()=>{setShowAdd(false);resumeTour();}}/>}
      {publishDateModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,fontFamily:"system-ui"}}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,.2)",width:"min(380px,95vw)",padding:26}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:6}}>📱 When did you publish this?</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:18,lineHeight:1.5}}>If published more than 7 days ago, metrics unlock immediately.</div>
            <div style={{marginBottom:18}}><div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>Publish date</div><input type="date" value={publishDateVal} onChange={e=>setPublishDateVal(e.target.value)} style={{...inp}}/></div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setPublishDateModal(null)}>Cancel</Btn><button onClick={()=>{if(!publishDateVal)return;onMoveVideo(publishDateModal.id,"published",publishDateVal);setPublishDateModal(null);}} style={{padding:"8px 16px",background:C.text,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Mark as published ✓</button></div>
          </div>
        </div>
      )}
      {metricsVid&&<MetricsModal video={metricsVid} onSave={m=>{onMetrics(metricsVid.id,m);setMetricsVid(null);}} onClose={()=>setMetricsVid(null)}/>}
      {attachVid&&<AttachVideoModal video={attachVid} onClose={()=>setAttachVid(null)}
        onSave={url=>onMoveVideo(attachVid.id,"review",undefined,{videoUrl:url})}/>}
      {reviewVid&&<ReviewRoom video={(videos||[]).find(x=>x.id===reviewVid.id)||reviewVid} workspaceId={workspaceId} userId={userId} userName={userName}
        onClose={()=>{setReviewVid(null);setNotesTick(t=>t+1);}}
        onApprove={id=>onMoveVideo(id,"approved")}
        onSendBack={(id,note)=>{handleSendBack(id,note);setReviewVid(null);}}/>}
      {notesVid&&<NotesPanel video={notesVid} workspaceId={workspaceId} userId={userId} userName={userName} onClose={()=>{setNotesVid(null);setNotesTick(t=>t+1);}} onResubmit={id=>{onMoveVideo(id,"review",undefined,{revision:false});setNotesVid(null);setNotesTick(t=>t+1);}} onSendBack={(id,note)=>{handleSendBack(id,note);setNotesVid(null);}}/>}
        {shootCard&&<ShootPlanner card={shootCard}
          onSave={p=>{onSaveShoot&&onSaveShoot(shootCard.id,p);setShootCard(null);}}
          onClose={()=>setShootCard(null)}/>}
        {scriptCard&&<ScriptDocument card={scriptCard} analytics={clientAnalytics} onSave={s=>{onSaveScript&&onSaveScript(scriptCard.id,s);setScriptCard(null);}} onClose={()=>setScriptCard(null)}/>}
    </div>
  );
}

// ── AGENCY APP ────────────────────────────────────────────────────────────────
// ── AGENCY ANALYTICS ──────────────────────────────────────────────────────────
// Agency level answers "who needs attention". Client level answers "what's working".
// Every derived figure carries its n, and thin channels collapse rather than lie.

function AgencyBrainstorm({clients,videos,userId,month,onSendToPipeline}){
  const[clientId,setClientId]=useState(clients.length===1?clients[0].id:null);
  const client=clients.find(c=>c.id===clientId)||null;

  if(clients.length===0)return(
    <Card><div style={{textAlign:"center",padding:"48px 20px"}}>
      <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:6}}>No clients yet</div>
      <div style={{fontSize:13,color:C.muted}}>Add a client before brainstorming — every campaign belongs to one.</div>
    </div></Card>
  );

  if(!client)return(
    <div>
      <Card pad={0} style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"18px 20px 20px"}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Brainstorm</div>
          <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2,marginBottom:4}}>Who are we creating for?</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.55}}>Pick a client — their brand and audience shape what comes back.</div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        {clients.map(c=>{
          const n=videos.filter(v=>v.clientId===c.id).length;
          return(
            <div key={c.id} onClick={()=>setClientId(c.id)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",transition:"border-color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{width:30,height:30,borderRadius:8,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{c.emoji||"🏢"}</div>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{fontSize:10,color:C.muted}}>{n} video{n===1?"":"s"}</div>
              </div>
              <span style={{fontSize:11,color:C.muted}}>→</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // The client profile stands in for the business profile the tool expects.
  let cp={};
  try{cp=typeof client.client_profile==="string"?JSON.parse(client.client_profile||"{}"):(client.client_profile||{});}catch(e){cp={};}
  const bp={businessName:client.name,whatYouDo:cp.whatTheyDo||"",audience:cp.audience||"",goal:cp.goal||"",tone:cp.tone||""};

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
        <div style={{width:26,height:26,borderRadius:7,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{client.emoji||"🏢"}</div>
        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{client.name}</div>
        {clients.length>1&&<button onClick={()=>setClientId(null)} style={{marginLeft:"auto",padding:"5px 11px",border:`0.5px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:11,color:C.muted}}>Switch client</button>}
      </div>
      <CampaignCreator
        key={client.id}
        userId={userId}
        businessProfile={bp}
        videos={videos.filter(v=>v.clientId===client.id)}
        onSendToPipeline={ideas=>onSendToPipeline(client.id,ideas)}
      />
    </div>
  );
}


// Shown when a ceiling is reached or a locked tab is opened. It states the
// limit, why it exists, and what upgrading changes — a paywall that does not
// explain itself reads as the product being broken.
function UpgradeSheet({reason,onClose}){
  if(!reason)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:14}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shMd,width:"min(420px,95vw)",overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:24}}>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Business · $30/mo</div>
          <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2,marginBottom:8}}>{reason.title}</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:16}}>{reason.body}</div>
          {reason.used!==undefined&&(
            <div style={{background:C.light,borderRadius:10,padding:"10px 12px",marginBottom:16,fontSize:12,color:C.text}}>
              {reason.used} of {reason.limit} cards in progress · published cards don't count
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:18}}>
            {["Unlimited cards in your pipeline","Analytics for your own posts","Talent search and shortlists","Up to 3 people on your team"].map(f=>(
              <div key={f} style={{display:"flex",gap:8,fontSize:12.5,color:C.text}}>
                <span style={{color:C.green,fontWeight:700}}>✓</span>{f}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={onClose}>Not yet</Btn>
            <Btn primary onClick={onClose}>Upgrade to Business</Btn>
          </div>
          <div style={{fontSize:11,color:C.muted,marginTop:10,textAlign:"center"}}>
            Billing isn't connected yet — this button does nothing so far.
          </div>
        </div>
      </div>
    </div>
  );
}

function AgencyApp({user,profile,onLogout}){
  const[clientError,setClientError]=useState(null);
  const[clients,setClients]=useState([]);
  const[videos,setVideos]=useState([]);
  const[targets,setTargets]=useState([]);
  const[month,setMonth]=useState(curMonth());
  const[selectedClient,setSelectedClient]=useState(null);
  const[page,setPage]=useState("dashboard");
  const[menuOpen,setMenuOpen]=useState(false);
  const[settingsTab,setSettingsTab]=useState("users");
  const[wsName,setWsName]=useState("");
  const[loading,setLoading]=useState(true);
  const[needsOnboarding,setNeedsOnboarding]=useState(false);
  const[wsId,setWsId]=useState(null);
  // One component serves every tier. Forking it into a separate "business
  // portal" is what let the old one rot: this repo still carries two copies of
  // AddVideoModal, MetricsModal and GoalModal for exactly that reason.
  const plan=planOf(profile,user.id);
  const solo=isSolo(plan);
  const[upsell,setUpsell]=useState(null);

  const load=useCallback(async()=>{
    try{
      const mem=await getWorkspaceMember(user.id);
      // A failed lookup must change nothing. Treating it as "no workspace" is
      // what was throwing people back into onboarding mid-session.
      if(mem&&mem.failed){setLoading(false);return;}
      if(!mem){
        // Only ever offer onboarding to someone who has never had a workspace.
        setWsId(w=>{if(!w)setNeedsOnboarding(true);return w;});
        setLoading(false);
        return;
      }
      const wid=mem.workspace_id;
      setWsId(wid);
      if(mem.workspaces?.name)setWsName(mem.workspaces.name);
      else sbGetWhere("workspaces","id",wid).then(r=>{if(r&&r[0]?.name)setWsName(r[0].name);});
      setNeedsOnboarding(false);
      const[cls,vids,tgts]=await Promise.all([
        sbGetWhere("agency_clients","workspace_id",wid,"&order=created_at.asc"),
        sbGetWhere("agency_videos","workspace_id",wid,"&order=created_at.desc"),
        sbGetWhere("agency_targets","workspace_id",wid),
      ]);
      setClients(cls||[]);
      setVideos((vids||[]).map(r=>({id:r.id,clientId:r.client_id,workspaceId:r.workspace_id,title:r.title,platform:r.platform,stage:r.stage,targetDate:r.target_date,publishDate:r.publish_date,url:r.url||"",hook:r.hook||"",format:r.format||"",cta:r.cta||"",views:r.views||0,likes:r.likes||0,comments:r.comments||0,shares:r.shares||0,saves:r.saves||0,paraTi:r.para_ti,siguiendo:r.siguiendo,busqueda:r.busqueda,metricsAdded:r.metrics_added||false,revision:r.revision||false,videoUrl:r.video_url||"",stageChangedAt:r.stage_changed_at||null,script:r.script||"",shootPlan:r.shoot_plan||"",shotList:r.shot_list||"",editAdvice:r.edit_advice||"",month:r.month,createdAt:r.created_at})));
      setTargets(tgts||[]);
    }catch(e){
      // Never strand the user on a spinner because one query threw.
      console.error("agency load failed:",e);
    }finally{
      setLoading(false);
    }
  },[user.id]);

  useEffect(()=>{load();},[load]);

  // A solo account has one brand. It exists as a client row so the schema is
  // identical to an agency's — upgrading is a flag, not a migration — but the
  // UI never says "client", because a solo marketer does not think of their own
  // brand as one. Create it on first run, then drop straight into its pipeline.
  useEffect(()=>{const p=setInterval(load,60000);return()=>clearInterval(p);},[load]);

  const handleOnboardingComplete=async(newWsId)=>{setWsId(newWsId);setNeedsOnboarding(false);await load();};

  const addClient=useCallback(async(name,emoji)=>{
    setClientError(null);
    // The first brand is created for a solo account automatically; a second is
    // what the Agency tier is for.
    if(clients.length>=plan.clients){
      setUpsell({title:"One brand on this plan",
        body:"Agency lifts the limit on clients and lets you invite your whole team. Everything you have built stays where it is."});
      return null;
    }
    const id=uuid();
    const newClient={id,name,emoji,workspace_id:wsId,client_profile:null};
    setClients(prev=>[...prev,newClient]);
    const res=await sbInsertX("agency_clients",{id,workspace_id:wsId,name,emoji,created_at:new Date().toISOString()});
    if(!res.ok){
      // Don't vanish the row — say why it didn't save.
      setClients(prev=>prev.filter(c=>c.id!==id));
      setClientError(res.error||"Could not save the client");
      return null;
    }
    setClientError(null);
    load(); // refresh in the background; the caller shouldn't wait on it
    return newClient;
  },[wsId,load,clients,plan]);

  // Guarded by a ref, not by state: addClient's identity changes whenever
  // `clients` does, so the effect re-runs on every list change. If a create
  // ever failed and rolled the optimistic row back, the list would return to
  // empty and this would retry forever. One attempt per session is enough —
  // a failure surfaces through clientError like any other.
  const autoBrand=useRef(false);
  useEffect(()=>{
    if(!solo||loading||needsOnboarding||!wsId)return;
    if(clients.length===0){
      if(autoBrand.current)return;
      autoBrand.current=true;
      addClient(wsName||"Mi marca","🏪");
      return;
    }
    if(!selectedClient)setSelectedClient(clients[0]);
  },[solo,loading,needsOnboarding,wsId,clients,selectedClient,wsName,addClient]);

  const addVideo=useCallback(async(v)=>{
    // Checked here rather than in the modal so every route to a new card goes
    // through it. Refusing with a reason, never silently.
    const blocked=cardLimitReason(plan,videos);
    if(blocked){setUpsell(blocked);return;}
    const newV={id:v.id,clientId:v.clientId,workspaceId:wsId,title:v.title,platform:v.platform||"TikTok",stage:"idea",targetDate:v.targetDate||null,publishDate:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,paraTi:null,siguiendo:null,busqueda:null,metricsAdded:false,script:"",shotList:"",editAdvice:"",month:v.month||month,createdAt:new Date().toISOString()};
    setVideos(prev=>[newV,...prev]);
    await sbInsert("agency_videos",{id:v.id,workspace_id:wsId,client_id:v.clientId,title:v.title,platform:v.platform||"TikTok",stage:"idea",target_date:v.targetDate||null,publish_date:null,url:"",hook:"",format:"",cta:"",views:0,likes:0,comments:0,shares:0,saves:0,para_ti:null,siguiendo:null,busqueda:null,metrics_added:false,script:"",shot_list:"",edit_advice:"",month:v.month||month,created_at:new Date().toISOString()});
    await load();
  },[wsId,month,load,plan,videos]);

  const moveVideo=useCallback(async(id,st,pd,opts)=>{
    const pubD=pd||(st==="published"?new Date().toISOString().slice(0,10):undefined);
    // A send-back stamps the card. The stamp persists through review so the
    // reviewer knows it's a second pass, and clears only once approved.
    const rev=opts&&opts.revision!==undefined?opts.revision:(st==="published"?false:undefined);
    const vurl=opts&&opts.videoUrl!==undefined?opts.videoUrl:undefined;
    setVideos(prev=>prev.map(v=>v.id===id?{...v,stage:st,stageChangedAt:new Date().toISOString(),publishDate:pubD||v.publishDate,
      ...(rev!==undefined?{revision:rev}:{}),...(vurl!==undefined?{videoUrl:vurl}:{})}:v));
    const now=new Date().toISOString();
    const up={stage:st,stage_changed_at:now};
    if(st==="published"&&pubD)up.publish_date=pubD;
    if(rev!==undefined)up.revision=rev;
    if(vurl!==undefined)up.video_url=vurl;
    await sbUpdate("agency_videos","id",id,up);
    await load();
  },[load]);

  const saveMetrics=useCallback(async(id,m)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,...m,metricsAdded:true}:v));
    await sbUpdate("agency_videos","id",id,{url:m.url||"",hook:m.hook||"",format:m.format||"",cta:m.cta||"",views:m.views||0,likes:m.likes||0,comments:m.comments||0,shares:m.shares||0,saves:m.saves||0,para_ti:m.paraTi||null,siguiendo:m.siguiendo||null,busqueda:m.busqueda||null,metrics_added:true});
    await load();
  },[load]);

  const reschedule=useCallback(async(id,date)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,targetDate:date}:v));
    await sbUpdate("agency_videos","id",id,{target_date:date});
  },[]);

  const saveShoot=useCallback(async(id,shootPlan)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,shootPlan}:v));
    await sbUpdate("agency_videos","id",id,{shoot_plan:shootPlan});
  },[]);

  const saveScript=useCallback(async(id,script)=>{
    setVideos(prev=>prev.map(v=>v.id===id?{...v,script}:v));
    await sbUpdate("agency_videos","id",id,{script});
  },[]);

  const deleteVideo=useCallback(async(id)=>{
    setVideos(prev=>prev.filter(v=>v.id!==id));
    await sbDelete("agency_videos","id",id);
  },[]);

  const setTarget=useCallback(async(clientId,mo,goal)=>{
    setTargets(prev=>{const ex=prev.find(t=>t.client_id===clientId&&t.month===mo);if(ex)return prev.map(t=>t.client_id===clientId&&t.month===mo?{...t,goal}:t);return[...prev,{client_id:clientId,month:mo,goal,workspace_id:wsId}];});
    await sbUpsert("agency_targets",{workspace_id:wsId,client_id:clientId,month:mo,goal},"workspace_id,client_id,month");
  },[wsId]);

  if(loading)return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}><div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:C.text}}>ContentHub Sidekick</div><div style={{fontSize:12,color:C.muted,marginTop:5}}>{solo?"Setting up your pipeline…":"Loading your agency…"}</div></div></div>);
  if(needsOnboarding)return<AgencyOnboarding user={user} solo={solo} onComplete={handleOnboardingComplete}/>;

  const clientVids=selectedClient?videos.filter(v=>v.clientId===selectedClient.id):[];
  const clientTarget=selectedClient?targets.find(t=>t.client_id===selectedClient.id&&t.month===month):null;

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:sh}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Logo/><div style={{fontSize:14,fontWeight:500,color:"#111",letterSpacing:-0.2}}>ContentHub <span style={{fontWeight:400,color:"#888",fontSize:13}}>Sidekick</span></div></div>
          <span style={{background:"#EDE9FE",color:"#7C3AED",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20}}>{plan.label}</span>
          {selectedClient&&!solo&&<div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8}}><span style={{color:C.muted,fontSize:12}}>›</span><span style={{fontSize:13,fontWeight:600,color:C.text}}>{selectedClient.emoji} {selectedClient.name}</span></div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          {(solo
              ?[["dashboard","Pipeline"],["campaign","Campaigns",!plan.talent],["analytics","Analytics",!plan.analytics]]
              :[["dashboard","Dashboard"],["campaign","Campaigns"],["analytics","Analytics"]]
            ).map(([id,label,locked])=>(
            locked
            ?<button key={id} onClick={()=>setUpsell({locked:label,title:`${label} is part of Business`,body:`Upgrade to see ${label.toLowerCase()} for your brand. Everything you have built stays exactly where it is.`})}
               style={{padding:"5px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:400,color:C.muted,background:"transparent",borderRadius:7,display:"inline-flex",alignItems:"center",gap:5}}>
               {label}<span style={{fontSize:9}}>🔒</span>
             </button>
            :
            <button key={id} onClick={()=>{setPage(id);setSelectedClient(solo?(clients[0]||null):null);}}
              style={{padding:"5px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:page===id&&!selectedClient?600:400,color:page===id&&!selectedClient?C.text:C.muted,background:page===id&&!selectedClient?C.light:"transparent",borderRadius:7}}>{label}</button>
          ))}
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setMenuOpen(o=>!o)}
            style={{display:"flex",alignItems:"center",gap:7,padding:"4px 10px 4px 4px",border:`1px solid ${menuOpen?C.text:C.border}`,borderRadius:20,background:C.surface,cursor:"pointer",fontSize:12,color:C.text}}>
            <span style={{width:22,height:22,borderRadius:7,background:C.accent,color:"#FFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>
              {(profile?.name||user.email||"?").trim().charAt(0).toUpperCase()}
            </span>
            {(profile?.name||user.email||"").split("@")[0]}
            <span style={{fontSize:9,color:C.muted,transform:menuOpen?"rotate(180deg)":"none",transition:"transform .15s"}}>▾</span>
          </button>
          {menuOpen&&(
            <>
              <div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:900}}/>
              <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:238,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:shMd,zIndex:901,padding:6}}>
                <div style={{display:"flex",alignItems:"center",gap:9,padding:"7px 8px 10px",borderBottom:`1px solid ${C.border}`,marginBottom:5}}>
                  <span style={{width:28,height:28,borderRadius:9,background:C.accent,color:"#FFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>
                    {(profile?.name||user.email||"?").trim().charAt(0).toUpperCase()}
                  </span>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:600,color:C.text}}>{profile?.name||user.email}</div>
                    <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{wsName||"Your agency"}</div>
                  </div>
                </div>
                {[["users","Users"],["clients","Clients"],["workspace","Workspace"],["account","My account"]].map(([id,label])=>(
                  <button key={id} onClick={()=>{setSettingsTab(id);setPage("settings");setSelectedClient(null);setMenuOpen(false);}}
                    style={{display:"block",width:"100%",textAlign:"left",padding:"8px 9px",border:"none",background:"transparent",cursor:"pointer",fontSize:12.5,color:C.text,borderRadius:8}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.light}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{label}</button>
                ))}
                <div style={{height:1,background:C.border,margin:"5px 4px"}}/>
                <button onClick={onLogout}
                  style={{display:"block",width:"100%",textAlign:"left",padding:"8px 9px",border:"none",background:"transparent",cursor:"pointer",fontSize:12.5,color:C.red,borderRadius:8}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.light}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>Sign out</button>
              </div>
            </>
          )}
        </div>
      </div>
      <UpgradeSheet reason={upsell} onClose={()=>setUpsell(null)}/>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {selectedClient
          ?<AgencyClientPipeline solo={solo} canAnalytics={plan.analytics} onUpsell={setUpsell} client={selectedClient} videos={clientVids} target={clientTarget} month={month} workspaceId={wsId} userId={user.id} userName={profile?.name||user.email} onAddVideo={addVideo} onMoveVideo={moveVideo} onMetrics={saveMetrics} onDeleteVideo={deleteVideo} onSetTarget={setTarget} onSaveScript={saveScript} onSaveShoot={saveShoot} onBack={()=>setSelectedClient(null)}/>
          :page==="analytics"
          ?<AgencyAnalytics clients={clients} videos={videos} targets={targets} month={month} onMonthChange={setMonth} onOpenClient={c=>setSelectedClient(c)}/>
          :page==="settings"
          ?<SettingsPage workspaceId={wsId} wsName={wsName} user={user} profile={profile}
             tab={settingsTab} onTab={setSettingsTab} clients={clients} onReload={load}/>
          :page==="campaign"
          ?<CampaignWorkspace clients={clients} videos={videos} userId={user.id} month={month}
             onSendToPipeline={(clientId,ideas)=>{ideas.forEach(v=>addVideo({...v,clientId}));}}/>
          :<AgencyDashboard clientError={clientError} clients={clients} videos={videos} targets={targets} month={month} onMonthChange={setMonth} onSelectClient={c=>{setSelectedClient(c);}} onAddClient={addClient} onSetTarget={setTarget} onReschedule={reschedule}/>
        }
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export { AgencyApp, AgencyBrainstorm, AgencyClientPipeline, AgencyDashboard, AgencyOnboarding, ClientProfileSetup };
