import { useState } from "react";

function PlatformIcon({platform}){
  const p=platform||"";
  if(p==="TikTok") return <svg width="13" height="13" viewBox="0 0 24 24" fill="#111" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.73a4.85 4.85 0 01-1-.04z"/></svg>;
  if(p==="Instagram Reels"||p==="Instagram") return <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ig2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><rect width="22" height="22" x="1" y="1" rx="5" fill="url(#ig2)"/><rect width="14" height="14" x="5" y="5" rx="3" fill="none" stroke="white" strokeWidth="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="white" strokeWidth="1.8"/><circle cx="16.5" cy="7.5" r="1" fill="white"/></svg>;
  if(p==="YouTube"||p==="YouTube Shorts") return <svg width="14" height="10" viewBox="0 0 24 17" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="17" rx="4" fill="#FF0000"/><polygon points="9,3 20,8.5 9,14" fill="white"/></svg>;
  if(p==="LinkedIn") return <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#0077B5"/><path fill="white" d="M6.5 9h3v9h-3zM8 6a1.75 1.75 0 110 3.5A1.75 1.75 0 018 6zm4.5 3h2.9v1.3c.4-.75 1.4-1.5 2.9-1.5 3.1 0 3.7 2 3.7 4.7V18h-3v-4.2c0-1-.02-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18h-3V9z"/></svg>;
  if(p==="Facebook") return <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#1877F2"/><path fill="white" d="M16 8h-2.5C13 8 13 8.5 13 9v2h3l-.5 3H13v8h-3v-8H8v-3h2V9c0-2.2 1.3-3 3-3h3v2z"/></svg>;
  return <span style={{fontSize:9,fontWeight:600,color:"#888",background:"#F0F0F0",padding:"1px 4px",borderRadius:3}}>{p.slice(0,2).toUpperCase()}</span>;
}

const C={bg:"#FFFFFF",surface:"#FFFFFF",border:"#E8E8E8",text:"#111111",muted:"#555555",light:"#FAFAFA",accent:"#378ADD",gold:"#C89A00",green:"#1D9E75",red:"#E24B4A",amber:"#F59E0B",yellow:"#F0C040",purple:"#7F77DD"};

const BRAND={red:"#E24B4A",yellow:"#F0C040",blue:"#378ADD",green:"#1D9E75"};

const Logo=()=>(
  <div style={{display:"flex",alignItems:"flex-end",gap:3}}>
    <div style={{width:11,height:17,borderRadius:3,background:BRAND.red}}/>
    <div style={{width:8,height:11,borderRadius:3,background:BRAND.yellow,marginBottom:2}}/>
    <div style={{width:13,height:8,borderRadius:3,background:BRAND.blue,marginBottom:4}}/>
    <div style={{width:7,height:14,borderRadius:3,background:BRAND.green,marginBottom:1}}/>
  </div>
);

const sh="0 1px 3px rgba(0,0,0,.08)";

const shMd="0 4px 12px rgba(0,0,0,.1)";

const inp={width:"100%",background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"};

const Card=({children,pad=18,style={}})=><div style={{background:C.surface,borderRadius:12,padding:pad,border:`1px solid ${C.border}`,boxShadow:sh,...style}}>{children}</div>;

const Btn=({children,primary,onClick,small,disabled,style={}})=><button onClick={onClick} disabled={disabled} style={{padding:small?"6px 12px":"9px 18px",background:primary?C.text:C.surface,color:primary?"#FFF":C.text,border:`1px solid ${primary?C.text:C.border}`,borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontSize:small?12:13,fontWeight:600,opacity:disabled?.5:1,...style}}>{children}</button>;

const Tag=({c,color=C.gold})=><span style={{display:"inline-block",padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:600,background:color+"18",color,border:`1px solid ${color}30`,marginRight:3}}>{c}</span>;

// ── LANDING PAGE ──────────────────────────────────────────────────────────────

function AIBoxIcon({onClick,active}){
  return(
    <button onClick={onClick} title="AI suggestions" style={{width:24,height:24,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,border:`0.5px solid ${active?"#378ADD":C.border}`,background:active?"#EFF6FF":C.surface,padding:0,transition:"all .15s"}}>
      <div style={{display:"flex",gap:1.5,alignItems:"flex-end"}}>
        <div style={{width:4,height:7,borderRadius:1,background:BRAND.red}}/>
        <div style={{width:3,height:4.5,borderRadius:1,background:BRAND.yellow,marginBottom:.5}}/>
        <div style={{width:5,height:3.5,borderRadius:1,background:BRAND.blue,marginBottom:1.5}}/>
        <div style={{width:3,height:6,borderRadius:1,background:BRAND.green,marginBottom:.5}}/>
      </div>
    </button>
  );
}

// ── SCRIPT DOCUMENT ───────────────────────────────────────────────────────────

function Tip({text}){
  const[show,setShow]=useState(false);
  return(
    <span style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
      <span
        onMouseEnter={()=>setShow(true)}
        onMouseLeave={()=>setShow(false)}
        style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:C.border,color:C.muted,fontSize:9,fontWeight:700,cursor:"help",flexShrink:0,marginLeft:4,lineHeight:1}}>
        ?
      </span>
      {show&&(
        <div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",background:C.text,color:"#FFF",fontSize:11,lineHeight:1.5,padding:"8px 10px",borderRadius:8,width:200,zIndex:999,pointerEvents:"none",boxShadow:"0 4px 12px rgba(0,0,0,.2)"}}>
          {text}
          <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:`5px solid ${C.text}`}}/>
        </div>
      )}
    </span>
  );
}

// ── CREATOR ANALYTICS ─────────────────────────────────────────────────────────

function SkeletonBar({w="60%"}){
  return <div style={{height:10,borderRadius:20,background:"linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",backgroundSize:"200% 100%",width:w,marginBottom:6}}/>;
}

function SkeletonCard({children,title}){
  return(
    <Card style={{opacity:.55}}>
      <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase"}}>{title}</div>
      {children}
    </Card>
  );
}

export { AIBoxIcon, BRAND, Btn, C, Card, Logo, PlatformIcon, SkeletonBar, SkeletonCard, Tag, Tip, inp, sh, shMd };
