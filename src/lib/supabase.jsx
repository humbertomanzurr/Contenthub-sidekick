import { uuid } from "./format";

const SB_URL = "https://dtpxqxwhehzyrtmrhiio.supabase.co";

const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cHhxeHdoZWh6eXJ0bXJoaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODUzNjMsImV4cCI6MjEwMDY2MTM2M30.qeYZV8B2sgF_2LE2hity97reHqg8oaQF1D39HHjFgbU";

let _token = null;

const _h = (x={}) => ({"apikey":SB_KEY,"Content-Type":"application/json","Authorization":`Bearer ${_token||SB_KEY}`,...x});

// ── ERROR VISIBILITY ─────────────────────────────────────────────────────────
// A request that failed must never be indistinguishable from one that found
// nothing. Every helper below used to swallow that difference, which is how a
// wrong RLS policy or a missing column shows up as an empty pipeline and a
// silent console. Reads still return []/null so no caller changes shape, but
// the failure is recorded and logged either way, and the mutations now report
// {ok,error} the way sbInsertX always did.
let _lastError = null;
const sbLastError = () => _lastError;

const _note = (t,op,status,message) => {
  _lastError = {table:t,op,status,message:String(message).slice(0,200),at:new Date().toISOString()};
  console.error(`[supabase] ${op} ${t} failed:`,status,message);
  return _lastError;
};

const _bad = async (t,op,r) => {
  const raw = await r.text().catch(()=>"");
  let msg = raw;
  try { const j=JSON.parse(raw); msg=j.message||j.hint||j.details||raw; } catch(e){}
  // With RLS on, 401/403 is nearly always an expired session rather than a
  // real denial — worth saying so, because the two look identical from here.
  if(r.status===401||r.status===403) msg=`${msg} (session may have expired — sign out and back in)`;
  return _note(t,op,r.status,msg);
};

const _net = (t,op,e) => _note(t,op,0,(e&&e.message)||"Network error");


const sbGet = async (t,p="") => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?select=*${p}`,{headers:_h()}); if(!r.ok){await _bad(t,"select",r);return [];} return await r.json();} catch(e){_net(t,"select",e);return [];} };

const sbGetOne = async (t,c,v) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?${c}=eq.${encodeURIComponent(v)}&select=*&limit=1`,{headers:_h()}); if(!r.ok){await _bad(t,"select",r);return null;} const a=await r.json(); return a[0]||null;} catch(e){_net(t,"select",e);return null;} };

const sbInsertX = async (t,d) => {
  try {
    const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:"POST",headers:_h({"Prefer":"return=minimal"}),body:JSON.stringify(Array.isArray(d)?d:[d])});
    if(r.ok)return{ok:true,error:null};
    const e2=await _bad(t,"insert",r);
    return{ok:false,error:`${e2.status} — ${e2.message}`};
  } catch(e){ return{ok:false,error:_net(t,"insert",e).message}; }
};

const sbInsert = async (t,d) => { 
  try { 
    const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:"POST",headers:_h({"Prefer":"return=minimal"}),body:JSON.stringify(Array.isArray(d)?d:[d])});
    if(!r.ok)await _bad(t,"insert",r);
    return r.ok;
  } catch(e){_net(t,"insert",e);return false;} 
};

const sbUpdate = async (t,c,v,d) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?${c}=eq.${encodeURIComponent(v)}`,{method:"PATCH",headers:_h({"Prefer":"return=minimal"}),body:JSON.stringify(d)}); if(!r.ok)return{ok:false,error:(await _bad(t,"update",r)).message}; return{ok:true,error:null};} catch(e){return{ok:false,error:_net(t,"update",e).message};} };

const sbDelete = async (t,c,v) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?${c}=eq.${encodeURIComponent(v)}`,{method:"DELETE",headers:_h()}); if(!r.ok)return{ok:false,error:(await _bad(t,"delete",r)).message}; return{ok:true,error:null};} catch(e){return{ok:false,error:_net(t,"delete",e).message};} };

const sbUpsert = async (t,d,oc) => { try { const r=await fetch(`${SB_URL}/rest/v1/${t}?on_conflict=${oc}`,{method:"POST",headers:_h({"Prefer":"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify(Array.isArray(d)?d:[d])}); if(!r.ok)return{ok:false,error:(await _bad(t,"upsert",r)).message}; return{ok:true,error:null};} catch(e){return{ok:false,error:_net(t,"upsert",e).message};} };

const sbSignIn = async (email,password) => { try { const r=await fetch(`${SB_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})}); const d=await r.json(); if(!r.ok)return{error:d}; _token=d.access_token; localStorage.setItem("sk_auth",JSON.stringify({token:d.access_token,refresh_token:d.refresh_token,user:d.user,expires_at:Date.now()+(d.expires_in||3600)*1000})); return{user:d.user,error:null};} catch(e){return{error:{message:e.message}};} };

const sbSignUp = async (email,password) => { try { const r=await fetch(`${SB_URL}/auth/v1/signup`,{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})}); const d=await r.json(); if(!r.ok)return{error:d}; return{user:d,error:null};} catch(e){return{error:{message:e.message}};} };

const sbSignOut = () => { _token=null; localStorage.removeItem("sk_auth"); };

// Reads the stored session without touching the network, so the app can render
// immediately on refresh instead of waiting on a request that might hang.
const sbSessionSync = () => {
  try {
    const s = localStorage.getItem("sk_auth");
    if (!s) return null;
    const { token, user, expires_at } = JSON.parse(s);
    if (!token || !user) return null;
    _token = token;
    return { user, expired: !!expires_at && Date.now() > expires_at - 60000 };
  } catch (e) { return null; }
};

const sbGetSession = async () => { try { const s=localStorage.getItem("sk_auth"); if(!s)return null; const{token,user,expires_at,refresh_token}=JSON.parse(s); if(expires_at&&Date.now()>expires_at-300000){ const r=await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token})}); if(r.ok){const d=await r.json();_token=d.access_token;localStorage.setItem("sk_auth",JSON.stringify({token:d.access_token,refresh_token:d.refresh_token||refresh_token,user:d.user,expires_at:Date.now()+(d.expires_in||3600)*1000}));return{user:d.user};}return null;} _token=token; return{user};} catch(e){return null;} };

const getNotes = async (workspaceId, videoId) => {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/agency_card_notes?workspace_id=eq.${workspaceId}&video_id=eq.${encodeURIComponent(videoId)}&order=created_at.asc&select=*`, {headers:_h()});
    if(!r.ok){ await _bad("agency_card_notes","select",r); return []; }
    return await r.json();
  } catch(e) { _net("agency_card_notes","select",e); return []; }
};

const addNote = async (workspaceId, videoId, userId, authorName, note) => {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/agency_card_notes`, {
      method:"POST",
      headers:_h({"Prefer":"return=minimal"}),
      body:JSON.stringify({workspace_id:workspaceId,video_id:videoId,user_id:userId,author_name:authorName,note,created_at:new Date().toISOString()})
    });
    // A review note that vanishes is worse than one that refuses to send.
    if(!r.ok) return {ok:false, error:(await _bad("agency_card_notes","insert",r)).message};
    return {ok:true, error:null};
  } catch(e) { return {ok:false, error:_net("agency_card_notes","insert",e).message}; }
};

const createWorkspace = async (name, userId) => {
  // Guard against a duplicate: if onboarding is somehow reached twice, reuse
  // the workspace that already exists rather than orphaning its data.
  const existing = await getWorkspaceMember(userId);
  if (existing && !existing.failed && existing.workspace_id) return existing.workspace_id;
  const wsId = uuid();
  await sbInsert("workspaces", {id:wsId, name, owner_id:userId, created_at:new Date().toISOString()});
  await sbInsert("workspace_members", {workspace_id:wsId, user_id:userId, role:"admin", created_at:new Date().toISOString()});
  await sbUpdate("profiles","id",userId,{workspace_id:wsId});
  return wsId;
};

// Returns the membership, or null when the user genuinely has no workspace,
// or {failed:true} when the request itself broke. Callers MUST tell these apart:
// treating a failed request as "no workspace" sends an existing agency back
// through onboarding and creates a duplicate workspace.
const getWorkspaceMember = async (userId) => {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/workspace_members?user_id=eq.${encodeURIComponent(userId)}&select=*`,{headers:_h()});
    if(!r.ok){console.error("getWorkspaceMember failed:",r.status,await r.text());return{failed:true};}
    const d = await r.json();
    if(d[0])return d[0];
    // Fall back to ownership: an owner without a members row is still an agency.
    const r2 = await fetch(`${SB_URL}/rest/v1/workspaces?owner_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,{headers:_h()});
    if(!r2.ok)return{failed:true};
    const w = await r2.json();
    return w[0]?{workspace_id:w[0].id,user_id:userId,role:"admin",workspaces:w[0]}:null;
  } catch(e){console.error("getWorkspaceMember error:",e);return{failed:true};}
};


// ── AGENCY ONBOARDING ─────────────────────────────────────────────────────────

export { sbLastError, sbSessionSync, SB_KEY, SB_URL, _h, _token, addNote, createWorkspace, getNotes, getWorkspaceMember, sbDelete, sbGet, sbGetOne, sbGetSession, sbInsert, sbInsertX, sbSignIn, sbSignOut, sbSignUp, sbUpdate, sbUpsert };
