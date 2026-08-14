const NOW=new Date();

const curMonth=()=>`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;

const monthLabel=m=>{const[y,mo]=m.split("-");return new Date(+y,+mo-1,1).toLocaleString("en-US",{month:"long",year:"numeric"});};

const addMonths=(m,n)=>{const[y,mo]=m.split("-");const d=new Date(+y,+mo-1+n,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;};

const daysSince=d=>d?Math.floor((NOW-new Date(d))/864e5):0;

const uid=()=>Math.random().toString(36).slice(2,10);
// agency_* tables use uuid columns; creator_* use text. A real UUID satisfies both.

const uuid=()=>{
  try{ if(typeof crypto!=="undefined"&&crypto.randomUUID) return crypto.randomUUID(); }catch(e){}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{
    const r=Math.random()*16|0, v=c==="x"?r:((r&0x3)|0x8);
    return v.toString(16);
  });
};

const fmt=n=>n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(0)+"K":String(n||0);

const engRate=v=>v.views>0?(((v.likes+v.comments+v.shares+v.saves)/v.views)*100).toFixed(1)+"%":"—";

const timeAgo=d=>{
  const m=Math.floor((new Date()-new Date(d))/60000);
  if(m<1)return"just now";
  if(m<60)return`${m}m ago`;
  const h=Math.floor(m/60);
  if(h<24)return`${h}h ago`;
  return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
};

const fmtTime=sec=>{
  const s=Math.max(0,Math.floor(sec||0));
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
};

const median=arr=>{
  const a=arr.filter(x=>typeof x==="number"&&isFinite(x)).sort((x,y)=>x-y);
  if(!a.length)return null;
  return a.length%2?a[(a.length-1)/2]:Math.round((a[a.length/2-1]+a[a.length/2])/2);
};

const bestBy=(vids,key)=>{
  const agg={};
  vids.forEach(v=>{const k=(v[key]||"").trim();if(k){agg[k]=agg[k]||{n:0,views:0};agg[k].n++;agg[k].views+=(v.views||0);}});
  const best=Object.keys(agg).sort((a,b)=>(agg[b].views/agg[b].n)-(agg[a].views/agg[a].n))[0];
  return best?{value:best,n:agg[best].n}:null;
};

const MIN_PER_CHANNEL=3;

// ── PRODUCTION METRICS ────────────────────────────────────────────────────────
// A head of production is asking "is the machine working, and where is it jammed" —
// not "how many views did we get". These four answer that.

const DAY=864e5;

const daysBetween=(a,b)=>{
  if(!a||!b)return null;
  const d=(new Date(b)-new Date(a))/DAY;
  return isFinite(d)&&d>=0?d:null;
};

const pctOf=(n,d)=>d>0?Math.round(n/d*100):null;

// Rework: how much work came back from review. High means briefs or scripts
// aren't landing, and it burns editor hours invisibly.

const reworkRate=vids=>{
  const reached=vids.filter(v=>v.revision||["review","published"].includes(v.stage));
  if(!reached.length)return{pct:null,n:0,total:0};
  const redone=reached.filter(v=>v.revision).length;
  return{pct:pctOf(redone,reached.length),n:redone,total:reached.length};
};

// Cycle time: created → published. What you can honestly promise a client.

const cycleTime=vids=>{
  const spans=vids.filter(v=>v.stage==="published"&&v.publishDate&&v.createdAt)
    .map(v=>daysBetween(v.createdAt,v.publishDate)).filter(d=>d!==null);
  if(!spans.length)return{days:null,n:0};
  spans.sort((a,b)=>a-b);
  const mid=spans.length%2?spans[(spans.length-1)/2]:(spans[spans.length/2-1]+spans[spans.length/2])/2;
  return{days:Math.round(mid*10)/10,n:spans.length};
};

// On-time: did it publish by the date it was promised.

const onTimeRate=vids=>{
  const withTarget=vids.filter(v=>v.stage==="published"&&v.targetDate&&v.publishDate);
  if(!withTarget.length)return{pct:null,n:0,total:0};
  const onTime=withTarget.filter(v=>new Date(v.publishDate)<=new Date(v.targetDate)).length;
  return{pct:pctOf(onTime,withTarget.length),n:onTime,total:withTarget.length};
};

// Stuck: cards sitting too long in one stage. Catches a jam before it becomes
// a missed deadline. Falls back to createdAt until stage_changed_at is populated.

const STUCK_DAYS={idea:10,production:7,editing:7,review:3};

const stuckCards=vids=>vids
  .filter(v=>v.stage!=="published")
  .map(v=>{
    const since=v.stageChangedAt||v.createdAt;
    const days=daysBetween(since,new Date().toISOString());
    const limit=STUCK_DAYS[v.stage]??7;
    return{...v,daysInStage:days===null?null:Math.floor(days),limit};
  })
  .filter(v=>v.daysInStage!==null&&v.daysInStage>=v.limit)
  .sort((a,b)=>b.daysInStage-a.daysInStage);

// Ranking by raw views measures who already had an audience. Ranking by change
// measures what the agency contributed — so that's what we rank on.

const growthOf=(vids,month)=>{
  const now=vids.filter(v=>v.month===month&&v.metricsAdded&&v.views>0);
  const prev=vids.filter(v=>v.month===addMonths(month,-1)&&v.metricsAdded&&v.views>0);
  const mid=list=>{
    if(!list.length)return null;
    const a=list.map(v=>v.views).sort((x,y)=>x-y);
    return a.length%2?a[(a.length-1)/2]:Math.round((a[a.length/2-1]+a[a.length/2])/2);
  };
  const a=mid(prev), b=mid(now);
  if(a===null||b===null||a===0)return{pct:null,now:b,prev:a};
  return{pct:Math.round((b-a)/a*100),now:b,prev:a};
};

// ── CLIENT ANALYTICS ──────────────────────────────────────────────────────────
// Everything a client would want to see about their own content, in one place.

export { DAY, MIN_PER_CHANNEL, NOW, STUCK_DAYS, addMonths, bestBy, curMonth, cycleTime, daysBetween, daysSince, engRate, fmt, fmtTime, growthOf, median, monthLabel, onTimeRate, pctOf, reworkRate, stuckCards, timeAgo, uid, uuid };
