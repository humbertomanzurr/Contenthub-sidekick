import { useState } from "react";
import { AGENCY_STAGES } from "../data/constants";
import { MIN_PER_CHANNEL, addMonths, bestBy, curMonth, cycleTime, fmt, growthOf, median, monthLabel, onTimeRate, reworkRate, stuckCards } from "../lib/format";
import { BRAND, C, Card, PlatformIcon } from "../ui/theme";

function ClientAnalytics({client,videos,month,onBack,onOpenPipeline}){
  const[range,setRange]=useState("month"); // month | all
  const scoped=range==="month"?videos.filter(v=>v.month===month):videos;
  const measured=scoped.filter(v=>v.metricsAdded&&(v.views||0)>0);
  const totalViews=measured.reduce((a,v)=>a+(v.views||0),0);
  const typical=median(measured.map(v=>v.views||0));
  const eng=v=>(v.views>0)?((v.likes||0)+(v.comments||0)+(v.shares||0)+(v.saves||0))/v.views*100:null;
  const engRates=measured.map(eng).filter(x=>x!==null);
  const avgEng=engRates.length?Math.round(engRates.reduce((a,b)=>a+b,0)/engRates.length*10)/10:null;
  const sorted=[...measured].sort((a,b)=>(b.views||0)-(a.views||0));
  const best=sorted[0], worst=sorted[sorted.length-1];

  const rank=(key)=>{
    const agg={};
    measured.forEach(v=>{const k=(v[key]||"").trim();if(k){agg[k]=agg[k]||{n:0,views:0};agg[k].n++;agg[k].views+=v.views||0;}});
    return Object.keys(agg).map(k=>({key:k,n:agg[k].n,typical:Math.round(agg[k].views/agg[k].n)}))
      .sort((a,b)=>b.typical-a.typical);
  };
  const hooks=rank("hook"), formats=rank("format"), ctas=rank("cta");
  const platforms=(()=>{
    const agg={};
    measured.forEach(v=>{const k=v.platform||"Other";agg[k]=agg[k]||{n:0,views:0};agg[k].n++;agg[k].views+=v.views||0;});
    return Object.keys(agg).map(k=>({key:k,n:agg[k].n,total:agg[k].views,typical:Math.round(agg[k].views/agg[k].n)}))
      .sort((a,b)=>b.typical-a.typical);
  })();

  const bars=(rows,color,label,note)=>{
    if(!rows.length)return null;
    const max=Math.max(1,...rows.map(r=>r.typical));
    return(
      <Card pad={16} style={{marginBottom:12}}>
        <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:note?3:10}}>{label}</div>
        {note&&<div style={{fontSize:10,color:C.muted,marginBottom:10,lineHeight:1.5}}>{note}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {rows.map(r=>(
            <div key={r.key} style={{display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:11,color:C.text,width:104,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.key}</span>
              <div style={{flex:1,height:7,background:C.light,borderRadius:4,overflow:"hidden"}}>
                <div style={{width:`${Math.round(r.typical/max*100)}%`,height:"100%",background:r.n<3?color+"55":color,borderRadius:4}}/>
              </div>
              <span style={{fontSize:10,color:C.muted,width:78,textAlign:"right",whiteSpace:"nowrap"}}>{fmt(r.typical)} · n={r.n}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const vidCard=(v,tone)=>v?(
    <div style={{background:C.light,border:`0.5px solid ${C.border}`,borderLeft:`3px solid ${tone}`,borderRadius:8,padding:"10px 12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
        <PlatformIcon platform={v.platform}/>
        <span style={{fontSize:12,fontWeight:600,color:C.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.title}</span>
      </div>
      <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:3}}>{fmt(v.views||0)}</div>
      <div style={{fontSize:10,color:C.muted}}>
        {v.hook?`${v.hook} hook`:"no hook tagged"}{v.format?` · ${v.format}`:""}
        {eng(v)!==null?` · ${Math.round(eng(v)*10)/10}% engagement`:""}
      </div>
    </div>
  ):null;

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <button onClick={onBack} style={{padding:"6px 12px",border:`1px solid ${C.border}`,borderRadius:8,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted}}>← All clients</button>
        <div style={{width:28,height:28,borderRadius:8,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{client.emoji||"🏢"}</div>
        <div style={{fontSize:15,fontWeight:600,color:C.text}}>{client.name}</div>
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
          {[["month",monthLabel(month)],["all","All time"]].map(([id,label])=>(
            <button key={id} onClick={()=>setRange(id)}
              style={{padding:"5px 11px",borderRadius:20,border:`1px solid ${range===id?C.text:C.border}`,background:C.surface,cursor:"pointer",fontSize:11,fontWeight:range===id?600:400,color:range===id?C.text:C.muted}}>{label}</button>
          ))}
          <button onClick={()=>printClientReport(client,scoped,measured,month)} style={{padding:"5px 11px",border:`0.5px solid ${C.border}`,borderRadius:20,background:C.surface,cursor:"pointer",fontSize:11,color:C.muted}}>Report</button>
          <button onClick={onOpenPipeline} style={{padding:"5px 11px",border:`0.5px solid ${C.border}`,borderRadius:20,background:C.surface,cursor:"pointer",fontSize:11,color:C.muted}}>Pipeline →</button>
        </div>
      </div>

      {measured.length===0?(
        <Card><div style={{textAlign:"center",padding:"44px 20px"}}>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:5}}>No metrics recorded yet</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.6,maxWidth:340,margin:"0 auto"}}>Add metrics to published videos and this page fills in — hooks, formats, channels, and best and worst performers.</div>
        </div></Card>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:9,marginBottom:12}}>
            {[["Total views",totalViews>0?fmt(totalViews):"—",`${measured.length} with metrics`,BRAND.blue],
              ["Typical video",typical!==null?fmt(typical):"—","half do better, half worse",BRAND.yellow],
              ["Engagement",avgEng!==null?`${avgEng}%`:"—","likes+comments+shares+saves",BRAND.red],
              ["Published",scoped.filter(v=>v.stage==="published").length,range==="month"?monthLabel(month):"all time",BRAND.green]
            ].map(([l,v,s,c])=>(
              <Card key={l} pad={14} style={{borderLeft:`3px solid ${c}`}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{l}</div>
                <div style={{fontSize:19,fontWeight:600,color:C.text,letterSpacing:-0.3}}>{v}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:2}}>{s}</div>
              </Card>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:9,fontWeight:600,color:BRAND.green,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Best performer</div>
              {vidCard(best,BRAND.green)}
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Weakest performer</div>
              {vidCard(worst&&worst!==best?worst:null,BRAND.red)||<div style={{fontSize:11,color:C.muted,padding:"10px 12px"}}>Needs at least two measured videos.</div>}
            </div>
          </div>

          {bars(platforms,BRAND.blue,"Channels ranked","Typical views per video on each platform.")}
          {bars(hooks,BRAND.red,"Hooks ranked","Faded bars are averages over fewer than three videos — treat them as early signals.")}
          {bars(formats,BRAND.yellow,"Formats ranked")}
          {bars(ctas,BRAND.green,"Calls to action ranked")}
        </>
      )}
    </div>
  );
}

function AgencyAnalytics({clients,videos,targets,month,onMonthChange,onOpenClient}){
  const[detail,setDetail]=useState(null);
  const mVids=videos.filter(v=>v.month===month);
  const published=mVids.filter(v=>v.stage==="published");
  const measured=mVids.filter(v=>v.metricsAdded&&(v.views||0)>0);
  const totalViews=measured.reduce((a,v)=>a+(v.views||0),0);
  const typical=median(measured.map(v=>v.views||0));
  const activeClients=clients.filter(c=>mVids.some(v=>v.clientId===c.id)).length;
  const rw=reworkRate(mVids), ct=cycleTime(mVids), ot=onTimeRate(mVids);
  const stuck=stuckCards(videos.filter(v=>v.month===month));

  // Ranked on change, not raw views — raw views mostly measures who already
  // had an audience, which says nothing about the agency's contribution.
  const board=clients.map(c=>{
    const cAll=videos.filter(v=>v.clientId===c.id);
    const g=growthOf(cAll,month);
    return{client:c,...g,published:cAll.filter(v=>v.month===month&&v.stage==="published").length};
  }).filter(r=>r.pct!==null).sort((a,b)=>b.pct-a.pct);

  const channels={};
  measured.forEach(v=>{const p=v.platform||"Other";(channels[p]=channels[p]||[]).push(v);});
  const chBoard=Object.keys(channels).map(p=>({
    platform:p,n:channels[p].length,
    typical:median(channels[p].map(v=>v.views||0)),
  })).sort((a,b)=>(b.typical||0)-(a.typical||0));

  const kpi=(label,value,sub,color)=>(
    <div style={{background:C.light,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${color}`}}>
      <div style={{fontSize:10,color:C.muted,marginBottom:3}}>{label}</div>
      <div style={{fontSize:19,fontWeight:600,color:C.text,letterSpacing:-0.3,lineHeight:1.2}}>{value}</div>
      {sub&&<div style={{fontSize:9,color:C.muted,marginTop:2}}>{sub}</div>}
    </div>
  );

  if(detail)return <ClientAnalytics client={detail} videos={videos.filter(v=>v.clientId===detail.id)} month={month} onBack={()=>setDetail(null)} onOpenPipeline={()=>onOpenClient(detail)}/>;

  return(
    <div>
      <Card pad={0} style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"16px 20px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,marginBottom:16,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Agency health</div>
              <div style={{fontSize:17,fontWeight:600,color:C.text,letterSpacing:-0.2}}>{monthLabel(month)}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <button onClick={()=>onMonthChange(addMonths(month,-1))} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.text}}>←</button>
              <button onClick={()=>onMonthChange(addMonths(month,1))} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:12,color:C.text}}>→</button>
              {month!==curMonth()&&<button onClick={()=>onMonthChange(curMonth())} style={{padding:"5px 10px",border:`1px solid ${C.border}`,borderRadius:7,background:C.light,cursor:"pointer",fontSize:11,color:C.muted}}>This month</button>}
              <button onClick={()=>printAgencyReport(clients,videos,targets,month)}
                style={{padding:"5px 11px",border:`0.5px solid ${C.border}`,borderRadius:7,background:C.surface,cursor:"pointer",fontSize:11,color:C.muted}}>Agency report</button>
            </div>
          </div>

          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Delivery</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(132px,1fr))",gap:9,marginBottom:14}}>
            {kpi("Published",published.length,`${activeClients} of ${clients.length} clients active`,BRAND.green)}
            {kpi("On time",ot.pct===null?"—":`${ot.pct}%`,ot.total?`${ot.n} of ${ot.total} hit the date`:"no target dates set",ot.pct===null?C.border:ot.pct>=80?BRAND.green:ot.pct>=55?BRAND.yellow:BRAND.red)}
            {kpi("Brief → published",ct.days===null?"—":`${ct.days}d`,ct.n?`typical across ${ct.n}`:"nothing published yet",BRAND.blue)}
            {kpi("Rework",rw.pct===null?"—":`${rw.pct}%`,rw.total?`${rw.n} of ${rw.total} sent back`:"nothing reviewed yet",rw.pct===null?C.border:rw.pct<=20?BRAND.green:rw.pct<=40?BRAND.yellow:BRAND.red)}
          </div>

          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Reach</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(132px,1fr))",gap:9}}>
            {kpi("Total views",totalViews>0?fmt(totalViews):"—",`${measured.length} videos with metrics`,BRAND.blue)}
            {kpi("Typical video",typical!==null?fmt(typical):"—","half do better, half worse",BRAND.yellow)}
          </div>

          {stuck.length>0&&(
            <div style={{marginTop:16,paddingTop:14,borderTop:`0.5px solid ${C.border}`}}>
              <div style={{fontSize:9,fontWeight:600,color:"#C2410C",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Stuck · {stuck.length}</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {stuck.slice(0,5).map(v=>{
                  const c=clients.find(x=>x.id===v.clientId);
                  return(
                    <div key={v.id} style={{display:"flex",alignItems:"center",gap:9,background:"#FFF7ED",border:"0.5px solid #FED7AA",borderRadius:7,padding:"7px 10px"}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#C2410C",background:"#FFEDD5",borderRadius:20,padding:"1px 7px",flexShrink:0}}>{v.daysInStage}d</span>
                      <span style={{fontSize:11,color:C.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.title}</span>
                      <span style={{fontSize:10,color:C.muted,flexShrink:0}}>{c?c.name:""} · {(AGENCY_STAGES.find(s=>s.id===v.stage)||{}).label}</span>
                    </div>
                  );
                })}
                {stuck.length>5&&<div style={{fontSize:10,color:C.muted}}>+{stuck.length-5} more sitting past their stage limit.</div>}
              </div>
            </div>
          )}
        </div>
      </Card>

      {(board.length>0||chBoard.length>0)&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12,marginBottom:16}}>
          {board.length>0&&(
            <Card pad={16}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Client momentum</div>
              <div style={{fontSize:10,color:C.muted,marginBottom:10,lineHeight:1.5}}>Change against last month's typical video — not raw views, which mostly reflect who already had an audience.</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {board.map((r,i)=>(
                  <div key={r.client.id} style={{display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:10,color:C.muted,width:14}}>{i+1}</span>
                    <span style={{fontSize:12,color:C.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.client.emoji} {r.client.name}</span>
                    <span style={{fontSize:10,color:C.muted}}>{fmt(r.now)}</span>
                    <span style={{fontSize:11,fontWeight:600,width:52,textAlign:"right",color:r.pct>0?BRAND.green:r.pct<0?BRAND.red:C.muted}}>
                      {r.pct>0?"+":""}{r.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {chBoard.length>0&&(
            <Card pad={16}>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Channels</div>
              <div style={{fontSize:10,color:C.muted,marginBottom:10,lineHeight:1.5}}>Typical video by platform across every client — where the effort is paying off.</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {chBoard.map(r=>{
                  const max=Math.max(1,...chBoard.map(x=>x.typical||0));
                  return(
                    <div key={r.platform} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:16,flexShrink:0,display:"flex"}}><PlatformIcon platform={r.platform}/></div>
                      <div style={{flex:1,height:6,background:C.light,borderRadius:4,overflow:"hidden"}}>
                        <div style={{width:`${Math.round((r.typical||0)/max*100)}%`,height:"100%",background:BRAND.blue,borderRadius:4}}/>
                      </div>
                      <span style={{fontSize:10,color:C.muted,width:76,textAlign:"right",whiteSpace:"nowrap"}}>{r.typical!==null?fmt(r.typical):"—"} · n={r.n}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:9}}>By client</div>
      {clients.length===0&&<Card><div style={{textAlign:"center",padding:"34px 20px",color:C.muted,fontSize:13}}>Add a client to start seeing analytics.</div></Card>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {clients.map(c=>{
          const cAll=videos.filter(v=>v.clientId===c.id);
          const cv=cAll.filter(v=>v.month===month);
          const cm=cv.filter(v=>v.metricsAdded&&(v.views||0)>0);
          const cPub=cv.filter(v=>v.stage==="published").length;
          const cTyp=median(cm.map(v=>v.views||0));
          const cRw=reworkRate(cv);
          return(
            <Card key={c.id} pad={16}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:13}}>
                <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
                  <div style={{width:28,height:28,borderRadius:8,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{c.emoji||"🏢"}</div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{fontSize:10,color:C.muted}}>{cv.length} card{cv.length===1?"":"s"} this month</div>
                  </div>
                </div>
                <button onClick={()=>printClientReport(c,cv,cm,month)}
                  style={{fontSize:10,padding:"5px 10px",border:`0.5px solid ${C.border}`,borderRadius:20,background:C.surface,cursor:"pointer",color:C.muted,whiteSpace:"nowrap",flexShrink:0}}>Report</button>
              </div>

              {/* Three pillars: one delivery, one performance, one quality. */}
              <div style={{display:"flex",gap:7,marginBottom:12}}>
                <div style={{flex:1,background:C.light,borderRadius:7,padding:"8px 9px",borderLeft:`3px solid ${BRAND.green}`}}>
                  <div style={{fontSize:9,color:C.muted}}>Published</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text}}>{cPub}</div>
                </div>
                <div style={{flex:1,background:C.light,borderRadius:7,padding:"8px 9px",borderLeft:`3px solid ${BRAND.blue}`}}>
                  <div style={{fontSize:9,color:C.muted}}>Typical</div>
                  <div style={{fontSize:15,fontWeight:700,color:cTyp!==null?C.text:C.muted}}>{cTyp!==null?fmt(cTyp):"—"}</div>
                </div>
                <div style={{flex:1,background:C.light,borderRadius:7,padding:"8px 9px",borderLeft:`3px solid ${cRw.pct===null?C.border:cRw.pct<=20?BRAND.green:cRw.pct<=40?BRAND.yellow:BRAND.red}`}}>
                  <div style={{fontSize:9,color:C.muted}}>Rework</div>
                  <div style={{fontSize:15,fontWeight:700,color:cRw.pct!==null?C.text:C.muted}}>{cRw.pct===null?"—":`${cRw.pct}%`}</div>
                </div>
              </div>

              <button onClick={()=>setDetail(c)}
                style={{width:"100%",padding:"8px 0",background:C.text,border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,color:"#FFF"}}>
                Full analytics →
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Printable agency report — production health, not a highlight reel.

const printAgencyReport=(clients,videos,targets,month)=>{
  const esc=x=>String(x==null?"":x).replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const mV=videos.filter(v=>v.month===month);
  const pub=mV.filter(v=>v.stage==="published");
  const meas=mV.filter(v=>v.metricsAdded&&(v.views||0)>0);
  const rw=reworkRate(mV), ct=cycleTime(mV), ot=onTimeRate(mV);
  const stuck=stuckCards(mV);
  const rows=clients.map(c=>{
    const cv=mV.filter(v=>v.clientId===c.id);
    const cm=cv.filter(v=>v.metricsAdded&&(v.views||0)>0);
    const g=growthOf(videos.filter(v=>v.clientId===c.id),month);
    const r=reworkRate(cv);
    return `<tr><td>${esc(c.name)}</td><td>${cv.filter(v=>v.stage==="published").length}</td><td>${cm.length?fmt(median(cm.map(v=>v.views))):"—"}</td><td>${g.pct===null?"—":(g.pct>0?"+":"")+g.pct+"%"}</td><td>${r.pct===null?"—":r.pct+"%"}</td></tr>`;
  }).join("");
  const stuckRows=stuck.slice(0,10).map(v=>{
    const c=clients.find(x=>x.id===v.clientId);
    return `<tr><td>${esc(v.title)}</td><td>${esc(c?c.name:"")}</td><td>${esc((AGENCY_STAGES.find(s=>s.id===v.stage)||{}).label||v.stage)}</td><td>${v.daysInStage} days</td></tr>`;
  }).join("");
  const w=window.open("","_blank");
  w.document.write(`<html><head><title>Agency report — ${esc(monthLabel(month))}</title><style>
    body{font-family:Georgia,serif;max-width:760px;margin:40px auto;color:#111;line-height:1.6;padding:0 20px}
    .bar{display:flex;height:4px;margin-bottom:22px}.bar div{flex:1}
    h1{font-size:23px;margin:0 0 4px;letter-spacing:-.3px}
    .meta{font-size:13px;color:#666;margin-bottom:26px}
    h2{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#555;margin:26px 0 10px;font-family:system-ui,sans-serif}
    .grid{display:flex;gap:10px;flex-wrap:wrap}
    .kpi{flex:1;min-width:120px;border:1px solid #e8e8e8;border-radius:8px;padding:11px 13px}
    .kpi .l{font-size:10px;color:#666;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:.6px}
    .kpi .v{font-size:20px;font-weight:bold}
    .kpi .s{font-size:10px;color:#888;font-family:system-ui,sans-serif}
    table{width:100%;border-collapse:collapse;font-size:13px;font-family:system-ui,sans-serif}
    th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:1px solid #e8e8e8;padding:7px 8px}
    td{padding:7px 8px;border-bottom:1px solid #f2f2f2}
    .foot{margin-top:30px;font-size:11px;color:#888;font-family:system-ui,sans-serif;border-top:1px solid #e8e8e8;padding-top:12px}
    @media print{body{margin:16px}}
  </style></head><body>
    <div class="bar"><div style="background:#E24B4A"></div><div style="background:#F0C040"></div><div style="background:#378ADD"></div><div style="background:#1D9E75"></div></div>
    <h1>Agency report</h1>
    <div class="meta">${esc(monthLabel(month))} · ${clients.length} client${clients.length===1?"":"s"}</div>
    <h2>Delivery</h2>
    <div class="grid">
      <div class="kpi"><div class="l">Published</div><div class="v">${pub.length}</div></div>
      <div class="kpi"><div class="l">On time</div><div class="v">${ot.pct===null?"—":ot.pct+"%"}</div><div class="s">${ot.total?ot.n+" of "+ot.total:"no target dates"}</div></div>
      <div class="kpi"><div class="l">Brief → published</div><div class="v">${ct.days===null?"—":ct.days+"d"}</div><div class="s">${ct.n?"typical across "+ct.n:""}</div></div>
      <div class="kpi"><div class="l">Rework</div><div class="v">${rw.pct===null?"—":rw.pct+"%"}</div><div class="s">${rw.total?rw.n+" of "+rw.total+" sent back":""}</div></div>
    </div>
    <h2>Reach</h2>
    <div class="grid">
      <div class="kpi"><div class="l">Total views</div><div class="v">${meas.length?fmt(meas.reduce((a,v)=>a+v.views,0)):"—"}</div></div>
      <div class="kpi"><div class="l">Typical video</div><div class="v">${meas.length?fmt(median(meas.map(v=>v.views))):"—"}</div><div class="s">half do better, half worse</div></div>
    </div>
    ${rows?`<h2>By client</h2><table><tr><th>Client</th><th>Published</th><th>Typical</th><th>Change</th><th>Rework</th></tr>${rows}</table>`:""}
    ${stuckRows?`<h2>Cards past their stage limit</h2><table><tr><th>Card</th><th>Client</th><th>Stage</th><th>Waiting</th></tr>${stuckRows}</table>`:""}
    <div class="foot">Typical = median, so one viral video doesn't distort it. Change compares this month's typical video with last month's. Rework is the share of reviewed videos that were sent back at least once.</div>
    <script>window.onload=()=>{window.print();}<\/script>
  </body></html>`);
  w.document.close();
};

// Printable client report. Every figure here is computed from saved metrics —
// nothing is written by a model, so anything on the page can be checked.

const printClientReport=(client,allVids,measured,month)=>{
  const esc=x=>String(x==null?"":x).replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const views=measured.reduce((a,v)=>a+(v.views||0),0);
  const med=median(measured.map(v=>v.views||0));
  const pub=allVids.filter(v=>v.stage==="published").length;
  const hook=bestBy(measured,"hook"), format=bestBy(measured,"format");
  const byCh={};
  measured.forEach(v=>{const p=v.platform||"Other";(byCh[p]=byCh[p]||[]).push(v);});
  const chRows=Object.keys(byCh)
    .sort((a,b)=>byCh[b].reduce((s,v)=>s+v.views,0)-byCh[a].reduce((s,v)=>s+v.views,0))
    .map(p=>{
      const list=byCh[p];
      const h=list.length>=MIN_PER_CHANNEL?bestBy(list,"hook"):null;
      return `<tr><td>${esc(p)}</td><td>${list.length}</td><td>${fmt(list.reduce((s,v)=>s+v.views,0))}</td><td>${h?esc(h.value)+` <span class="n">n=${h.n}</span>`:`<span class="n">too few videos</span>`}</td></tr>`;
    }).join("");
  const top=[...measured].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5)
    .map(v=>`<tr><td>${esc(v.title)}</td><td>${esc(v.platform||"")}</td><td>${esc(v.hook||"—")}</td><td>${fmt(v.views||0)}</td></tr>`).join("");
  const w=window.open("","_blank");
  w.document.write(`<html><head><title>${esc(client.name)} — ${esc(monthLabel(month))}</title><style>
    body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#111;line-height:1.6;padding:0 20px}
    .bar{display:flex;height:4px;margin-bottom:22px}.bar div{flex:1}
    h1{font-size:23px;margin:0 0 4px;letter-spacing:-.3px}
    .meta{font-size:13px;color:#666;margin-bottom:26px}
    h2{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#555;margin:26px 0 10px;font-family:system-ui,sans-serif}
    .grid{display:flex;gap:10px;margin-bottom:6px}
    .kpi{flex:1;border:1px solid #e8e8e8;border-radius:8px;padding:11px 13px}
    .kpi .l{font-size:10px;color:#666;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:.6px}
    .kpi .v{font-size:20px;font-weight:bold}
    table{width:100%;border-collapse:collapse;font-size:13px;font-family:system-ui,sans-serif}
    th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:1px solid #e8e8e8;padding:7px 8px}
    td{padding:7px 8px;border-bottom:1px solid #f2f2f2}
    .n{color:#888;font-size:11px}
    .note{font-size:12px;color:#666;background:#fafafa;border-left:3px solid #F0C040;padding:9px 12px;border-radius:5px;font-family:system-ui,sans-serif}
    .foot{margin-top:30px;font-size:11px;color:#888;font-family:system-ui,sans-serif;border-top:1px solid #e8e8e8;padding-top:12px}
    @media print{body{margin:16px}}
  </style></head><body>
    <div class="bar"><div style="background:#E24B4A"></div><div style="background:#F0C040"></div><div style="background:#378ADD"></div><div style="background:#1D9E75"></div></div>
    <h1>${esc(client.name)}</h1>
    <div class="meta">Content report · ${esc(monthLabel(month))}</div>
    <h2>Summary</h2>
    <div class="grid">
      <div class="kpi"><div class="l">Published</div><div class="v">${pub}</div></div>
      <div class="kpi"><div class="l">Total views</div><div class="v">${views>0?fmt(views):"—"}</div></div>
      <div class="kpi"><div class="l">Median per video</div><div class="v">${med!==null?fmt(med):"—"}</div></div>
      <div class="kpi"><div class="l">With metrics</div><div class="v">${measured.length}</div></div>
    </div>
    ${measured.length<MIN_PER_CHANNEL?`<div class="note">Based on ${measured.length} video${measured.length===1?"":"s"} with metrics. Treat these as early signals rather than conclusions.</div>`:""}
    <h2>What performed best</h2>
    <div class="grid">
      <div class="kpi"><div class="l">Top hook</div><div class="v">${hook?esc(hook.value):"—"}</div><div class="n">${hook?`across ${hook.n} video${hook.n===1?"":"s"}`:"no data yet"}</div></div>
      <div class="kpi"><div class="l">Top format</div><div class="v">${format?esc(format.value):"—"}</div><div class="n">${format?`across ${format.n} video${format.n===1?"":"s"}`:"no data yet"}</div></div>
    </div>
    ${chRows?`<h2>By channel</h2><table><tr><th>Channel</th><th>Videos</th><th>Views</th><th>Best hook</th></tr>${chRows}</table>`:""}
    ${top?`<h2>Top videos</h2><table><tr><th>Title</th><th>Channel</th><th>Hook</th><th>Views</th></tr>${top}</table>`:""}
    <div class="foot">Figures calculated from metrics recorded in ContentHub Sidekick. Averages over fewer than ${MIN_PER_CHANNEL} videos are shown with their sample size.</div>
    <script>window.onload=()=>{window.print();}<\/script>
  </body></html>`);
  w.document.close();
};

// ── AGENCY BRAINSTORM ─────────────────────────────────────────────────────────
// Same tool as Business, scoped to one client: its profile drives the search,
// its videos drive the platform default, and ideas land in its pipeline.

export { AgencyAnalytics, ClientAnalytics, printAgencyReport, printClientReport };
