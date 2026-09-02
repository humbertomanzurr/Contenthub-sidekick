import { useMemo, useState } from "react";
import { uuid } from "../lib/format";
import { aiHeaders } from "../lib/supabase";
import { BRAND, Btn, C, Card, PlatformIcon, inp, shMd } from "../ui/theme";

// ── CAMPAIGN WORKSPACE ────────────────────────────────────────────────────────
// A campaign is the container, not a tab. Angles, the people who make them and
// the money behind both live in one place, because in practice they move
// together: a creator who never replies frees budget that could go to paid
// support instead, and a plan that cannot absorb that is a PDF.
//
// Nothing here is saved yet. State lives in the browser on purpose — the shape
// is still being argued about, and a schema is the expensive thing to change.

const money = n => "$" + Math.round(Number(n) || 0).toLocaleString("en-US");
const num = v => { const n = parseInt(String(v).replace(/[^\d]/g, ""), 10); return isFinite(n) ? n : 0; };

const PLATFORMS = ["TikTok", "Instagram", "YouTube"];

// Live = still costing you money. Everything else has released its budget.
const LIVE = ["proposed", "outreach", "confirmed"];
const T_STATE = {
  proposed:  ["Proposed",       C.muted],
  outreach:  ["Waiting on reply", C.amber],
  confirmed: ["Confirmed",      C.green],
  passed:    ["They passed",    C.red],
  silent:    ["No reply",       C.red],
  dropped:   ["Dropped",        C.red],
};
const A_REASONS = ["Off-brand", "Client won't approve", "Did this already", "Too expensive to shoot"];
const T_REASONS = ["Too expensive", "Wrong audience", "Used them recently", "Client vetoed"];

// The agreed fee is a fact; the planned amount is your own budget decision.
// Neither is ever guessed by the model, which is why no creator arrives with a
// price on their head.
const amountOf = t => (t.agreed != null && t.status === "confirmed" ? t.agreed : (t.planned || 0));

function Section({ eyebrow, title, right, children, note }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, letterSpacing: -0.2 }}>{title}</div>
        </div>
        {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
      </div>
      {note && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 10, maxWidth: 640 }}>{note}</div>}
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 11.5,
      border: `1px solid ${on ? C.text : C.border}`, background: on ? C.text : C.surface,
      color: on ? "#fff" : C.muted, fontWeight: on ? 600 : 400, whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function Pill({ label, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600,
      letterSpacing: 0.3, textTransform: "uppercase", padding: "2px 9px", borderRadius: 20,
      color, background: color + "18", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />{label}
    </span>
  );
}

function SmallBtn({ onClick, tone, children, disabled }) {
  const col = tone === "yes" ? C.green : tone === "no" ? C.red : C.muted;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "4px 10px", borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer",
      border: `0.5px solid ${C.border}`, background: C.surface, color: col,
      fontSize: 11, fontWeight: 600, opacity: disabled ? 0.45 : 1, whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function Reasons({ options, onPick, onCancel, question }) {
  return (
    <div style={{ marginTop: 9, padding: "10px 12px", background: C.light, border: `1px solid ${C.border}`, borderRadius: 9 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 7 }}>{question}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map(r => <SmallBtn key={r} onClick={() => onPick(r)}>{r}</SmallBtn>)}
        <SmallBtn onClick={onCancel}>Cancel</SmallBtn>
      </div>
    </div>
  );
}

function CampaignWorkspace({ clients, videos, userId, month, onSendToPipeline }) {
  const [clientId, setClientId] = useState(clients.length === 1 ? clients[0].id : null);
  const client = clients.find(c => c.id === clientId) || null;

  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState(["TikTok", "Instagram"]);
  const [market, setMarket] = useState("");
  const [total, setTotal] = useState(0);
  const [production, setProduction] = useState(0);
  const [talentBudget, setTalentBudget] = useState(0);
  const [testPct, setTestPct] = useState(40);

  const [angles, setAngles] = useState([]);
  const [talent, setTalent] = useState([]);
  const [log, setLog] = useState([]);
  const [frozen, setFrozen] = useState(null);

  const [genning, setGenning] = useState(false);
  const [genErr, setGenErr] = useState("");
  const [ownAngle, setOwnAngle] = useState("");

  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [searchRaw, setSearchRaw] = useState("");

  const note = (what, why) => setLog(l => [{ n: l.length + 1, what, why: why || "" }, ...l]);

  // ── MONEY ──────────────────────────────────────────────────────────────────
  const m = useMemo(() => {
    const live = talent.filter(t => LIVE.includes(t.status));
    const allocated = live.reduce((n, t) => n + amountOf(t), 0);
    const agreed = talent.filter(t => t.status === "confirmed").reduce((n, t) => n + (t.agreed || 0), 0);
    const pauta = Math.max(0, total - production - talentBudget);
    const test = Math.round(pauta * testPct / 100);
    return {
      live, allocated, agreed, pauta, test, scale: pauta - test,
      free: talentBudget - allocated, over: allocated > talentBudget,
    };
  }, [talent, total, production, talentBudget, testPct]);

  const briefReady = !!client && !!goal.trim() && total > 0;

  // ── ANGLES ─────────────────────────────────────────────────────────────────
  // No web search here: angles come from the brief and the client's own posting
  // history, which makes this the cheap half of the campaign. Talent is the
  // expensive half, and the two should never share a budget.
  const genAngles = async (extra) => {
    if (!briefReady || genning) return;
    setGenning(true); setGenErr("");
    const past = (videos || []).filter(v => v.clientId === clientId).slice(0, 25)
      .map(v => `- ${v.title}${v.platform ? ` (${v.platform})` : ""}`).join("\n");
    const already = angles.map(a => a.title).join(" | ");
    const sys = `You plan content angles for a brand campaign. An angle is a repeatable idea for a set of videos, not a single script.

Brand: ${client.name}
Campaign: ${goal}
Platforms: ${platforms.join(", ")}
${market ? `Market: ${market}` : ""}
${past ? `\nWhat they have posted recently:\n${past}` : ""}
${already ? `\nAlready on the plan, do not repeat these: ${already}` : ""}

Ground every angle in the brief, and in their past posts where you can see a pattern worth repeating. Say plainly when an angle is a judgement call rather than something their history supports.

Return ONLY a JSON array, no markdown:
[{"title":"short, concrete","note":"one or two sentences on why it fits and what it risks","platform":"TikTok","count":3,"format":"to camera"}]

${extra ? "Exactly 1 angle." : "Between 4 and 6 angles."}`;
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: aiHeaders(),
        body: JSON.stringify({ feature: "campaign", messages: [{ role: "user", content: goal }], systemPrompt: sys }),
      });
      const raw = await r.text();
      let d; try { d = JSON.parse(raw); } catch (e) { d = { error: raw.slice(0, 160) }; }
      if (d.error) { setGenErr(String(d.error).slice(0, 200)); setGenning(false); return; }
      const clean = (d.content || "").replace(/```json|```/g, "").trim();
      const a = clean.indexOf("["), b = clean.lastIndexOf("]");
      let list = [];
      if (a >= 0 && b > a) { try { list = JSON.parse(clean.slice(a, b + 1)); } catch (e) {} }
      if (!Array.isArray(list) || !list.length) {
        setGenErr(clean ? "The model replied, but not with a list of angles." : "The model replied with nothing.");
        setGenning(false); return;
      }
      const made = list.map(x => ({
        id: uuid(), title: String(x.title || "").slice(0, 120),
        note: String(x.note || "").slice(0, 400),
        platform: x.platform || platforms[0] || "TikTok",
        count: num(x.count) || 2, format: String(x.format || "").slice(0, 60),
        status: "proposed",
      })).filter(x => x.title);
      setAngles(p => [...p, ...made]);
      note(extra ? "Asked for one more angle" : `Generated ${made.length} angles`, extra ? "" : goal.slice(0, 70));
    } catch (e) { setGenErr(e.message || "Could not reach the model."); }
    setGenning(false);
  };

  const setAngle = (id, patch) => setAngles(p => p.map(a => a.id === id ? { ...a, ...patch } : a));
  const keptAngles = angles.filter(a => a.status === "kept" || a.status === "mine");
  const plannedVideos = keptAngles.reduce((n, a) => n + (a.count || 0), 0);

  const addOwnAngle = () => {
    const v = ownAngle.trim(); if (!v) return;
    setAngles(p => [...p, {
      id: uuid(), title: v, note: "Yours. Nothing computed behind it — it carries no evidence until it has run.",
      platform: platforms[0] || "TikTok", count: 2, format: "", status: "mine",
    }]);
    setOwnAngle(""); note(`Added your own angle: "${v.slice(0, 60)}"`);
  };

  // ── TALENT ─────────────────────────────────────────────────────────────────
  const runSearch = async () => {
    const query = q.trim(); if (!query || searching) return;
    setSearching(true); setSearchErr(""); setSearchRaw("");
    const sys = `You find real content creators on social media.

Search: ${query}
${market ? `Market: ${market}` : ""}

YOUR FIRST ACTION IS TO SEARCH. Do not answer from memory.

RULES:
- "profile_url" must be a link you actually saw in your search results. Do not build one from a pattern.
- Do not invent follower or engagement numbers. Leave them out entirely.
- Include everyone you genuinely found. The app checks every link and discards the ones that do not resolve to a real profile, so err towards including a creator you are unsure about rather than returning nothing.

Return ONLY a JSON array, no markdown:
[{"handle":"@username","platform":"TikTok","profile_url":"https://www.tiktok.com/@username","why":"one sentence on why they fit"}]

Up to 12 results.`;
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: aiHeaders(),
        body: JSON.stringify({ feature: "creators", messages: [{ role: "user", content: query }], systemPrompt: sys, useWebSearch: true, maxUses: 8 }),
      });
      const raw = await r.text();
      let d; try { d = JSON.parse(raw); } catch (e) { d = { error: raw.slice(0, 160) }; }
      if (d.error) { setSearchErr(String(d.error).slice(0, 200)); setSearching(false); return; }
      const clean = (d.content || "").replace(/```json|```/g, "").trim();
      const a = clean.indexOf("["), b = clean.lastIndexOf("]");
      let list = [];
      if (a >= 0 && b > a) { try { list = JSON.parse(clean.slice(a, b + 1)); } catch (e) {} }
      const known = new Set(talent.map(t => t.profile_url));
      const found = (Array.isArray(list) ? list : []).map(x => {
        const u = String(x.profile_url || "").trim();
        if (!/^https?:\/\//i.test(u)) return null;
        let host = ""; try { host = new URL(u).hostname.replace(/^www\./, "").toLowerCase(); } catch (e) { return null; }
        const plat = host.includes("tiktok") ? "TikTok" : host.includes("instagram") ? "Instagram"
                   : host.includes("youtu") ? "YouTube" : host.includes("facebook") ? "Facebook" : null;
        if (!plat) return null;
        const url = u.split("?")[0];
        if (known.has(url)) return null;
        known.add(url);
        return {
          id: uuid(), handle: String(x.handle || "").slice(0, 60) || "@unknown", platform: plat,
          profile_url: url, why: String(x.why || "").slice(0, 300),
          planned: 0, agreed: null, status: "proposed",
        };
      }).filter(Boolean);

      if (!found.length) {
        const det = Array.isArray(d.searchDetail) ? d.searchDetail : [];
        const ran = det.filter(x => typeof x.results === "number");
        const hits = ran.reduce((n, x) => n + x.results, 0);
        const errs = {}; det.filter(x => x.error).forEach(x => { errs[x.error] = (errs[x.error] || 0) + 1; });
        const bad = Object.keys(errs).map(k => `${errs[k]}× ${k}`).join(", ");
        setSearchErr(
          (!clean ? "The model replied with nothing"
            : a < 0 || b <= a ? "The reply was not a list"
            : "Nothing came back with a checkable profile link")
          + (det.length ? ` — ${ran.length} of ${det.length} searches returned ${hits} result${hits === 1 ? "" : "s"}${bad ? `, and ${bad}` : ""}`
                        : d.searchCalls ? ` — ${d.searchCalls} searches ran but returned no result blocks`
                        : " — and no web search ran at all"));
        setSearchRaw(clean.slice(0, 700));
      } else {
        setTalent(p => [...p, ...found]);
        note(`Found ${found.length} creator${found.length === 1 ? "" : "s"}`, query.slice(0, 70));
      }
    } catch (e) { setSearchErr(e.message || "Could not reach the model."); }
    setSearching(false);
  };

  const setT = (id, patch) => setTalent(p => p.map(t => t.id === id ? { ...t, ...patch } : t));

  const release = (t, label, why) => {
    const back = LIVE.includes(t.status) ? amountOf(t) : 0;
    setT(t.id, { status: label, asking: false, reason: why || null });
    note(`${t.handle} — ${T_STATE[label][0].toLowerCase()}`, back ? `${money(back)} back in the pot` : (why || ""));
  };

  // ── FORMALIZE ──────────────────────────────────────────────────────────────
  const formalize = () => {
    const conf = talent.filter(t => t.status === "confirmed");
    const wait = talent.filter(t => t.status === "outreach");
    setFrozen({
      at: log.length + 1,
      client: client.name, goal, market, platforms: [...platforms],
      total, production, talentBudget, pauta: m.pauta, test: m.test, scale: m.scale,
      videos: plannedVideos,
      angles: keptAngles.map(a => ({ title: a.title, platform: a.platform, count: a.count, format: a.format })),
      conf: conf.map(t => ({ handle: t.handle, platform: t.platform, agreed: t.agreed || 0 })),
      wait: wait.map(t => ({ handle: t.handle, planned: t.planned || 0 })),
      out: angles.filter(a => a.status === "dropped").map(a => ({ what: a.title, why: a.reason || "dropped" }))
        .concat(talent.filter(t => !LIVE.includes(t.status)).map(t => ({ what: t.handle, why: t.reason || T_STATE[t.status][0] }))),
    });
    note("Formalized the plan", `${plannedVideos} videos · ${conf.length} creators · ${money(total)}`);
  };

  // ── EMPTY STATES ───────────────────────────────────────────────────────────
  if (!clients.length) return (
    <Card><div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No clients yet</div>
      <div style={{ fontSize: 13, color: C.muted }}>Add a client first — a campaign belongs to one.</div>
    </div></Card>
  );

  if (!client) return (
    <Card><div style={{ padding: "22px 20px" }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 3 }}>Which client is this for?</div>
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>The campaign reads their posting history to ground its angles.</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {clients.map(c => (
          <button key={c.id} onClick={() => setClientId(c.id)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", cursor: "pointer",
            border: `0.5px solid ${C.border}`, borderRadius: 9, background: C.surface, fontSize: 13, color: C.text,
          }}>{c.emoji || "🏢"} {c.name}</button>
        ))}
      </div>
    </div></Card>
  );

  const bar = [
    { k: "Agreed", v: m.agreed, c: C.green },
    { k: "Planned", v: Math.max(0, m.allocated - m.agreed), c: C.accent },
    { k: "Unallocated", v: Math.max(0, m.free), c: C.border },
    { k: "Pauta", v: m.pauta, c: BRAND.yellow },
    { k: "Production", v: production, c: C.muted },
  ].filter(x => x.v > 0);

  return (
    <div style={{ maxWidth: 940 }}>
      {/* ── money ─────────────────────────────────────────────────────────── */}
      {total > 0 && (
        <Card style={{ marginBottom: 18 }}><div style={{ padding: "13px 16px 14px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            {[["Total", money(total), "as briefed"],
              ["Talent", money(m.allocated), `${m.over ? "over" : "of"} ${money(talentBudget)} · ${m.live.length} name${m.live.length === 1 ? "" : "s"}`],
              ["Pauta", money(m.pauta), `${testPct}% test · ${100 - testPct}% held`],
              ["Unallocated", money(Math.max(0, m.free)), m.over ? "budget exceeded" : m.free > 0 ? "waiting on a decision" : "fully allocated"],
            ].map(([k, v, s], i) => (
              <div key={k} style={{ flex: "1 1 140px", background: i === 0 ? C.light : C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 11px 9px" }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 0.9, textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.5, color: k === "Talent" && m.over ? C.red : C.text }}>{v}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden", gap: 2 }}>
            {bar.map(s => <div key={s.k} style={{ flex: s.v, background: s.c }} />)}
          </div>
          <div style={{ display: "flex", gap: "4px 14px", flexWrap: "wrap", marginTop: 8, fontSize: 11, color: C.muted }}>
            {bar.map(s => (
              <span key={s.k} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: s.c }} />{s.k} {money(s.v)}
              </span>
            ))}
          </div>
          {m.over && (
            <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 9, background: "#FEF2F2", border: "1px solid #FECACA", fontSize: 12, color: "#991B1B", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span>Agreed fees are {money(m.allocated - talentBudget)} over the talent budget.</span>
              <span style={{ marginLeft: "auto" }}>
                <SmallBtn onClick={() => { const need = m.allocated - talentBudget; setTalentBudget(b => b + need); note(`Moved ${money(need)} from pauta to talent`, "covers fees that came in high"); }}>Take it from pauta</SmallBtn>
              </span>
            </div>
          )}
          {!m.over && m.free > 0 && talent.some(t => !LIVE.includes(t.status)) && (
            <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 9, background: "#EFF6FF", border: "1px solid #BFDBFE", fontSize: 12, color: "#1E40AF", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span>{money(m.free)} is unallocated. It does not have to stay in talent.</span>
              <span style={{ marginLeft: "auto" }}>
                <SmallBtn onClick={() => { const mv = m.free; setTalentBudget(b => b - mv); note(`Moved ${money(mv)} from talent to pauta`, "fewer creators, more reach behind the ones who said yes"); }}>Move to pauta</SmallBtn>
              </span>
            </div>
          )}
        </div></Card>
      )}

      {/* ── brief ─────────────────────────────────────────────────────────── */}
      <Section eyebrow="What you are asking for" title="The brief"
        note="Everything below is built from these six fields. If one is wrong, the rest is wrong, and it is cheaper to find that out here."
        right={<button onClick={() => setClientId(null)} style={{ padding: "5px 11px", border: `0.5px solid ${C.border}`, borderRadius: 7, background: C.surface, cursor: "pointer", fontSize: 11, color: C.muted }}>Switch client</button>}>
        <Card><div style={{ padding: "16px 18px 18px" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 500 }}>What is the campaign?</div>
          <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder={`e.g. ${client.name} is jumping into September with a Back to School campaign, introducing a new product`}
            style={{ ...inp, height: 58, resize: "none", lineHeight: 1.5, marginBottom: 13 }} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 13 }}>
            <div style={{ flex: "1 1 200px" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 500 }}>Platforms</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PLATFORMS.map(p => (
                  <Chip key={p} on={platforms.includes(p)}
                    onClick={() => setPlatforms(ps => ps.includes(p) ? ps.filter(x => x !== p) : [...ps, p])}>{p}</Chip>
                ))}
              </div>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 500 }}>Market</div>
              <input value={market} onChange={e => setMarket(e.target.value)} placeholder="Mexico City and Monterrey" style={inp} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[["Total budget", total, setTotal, "12000"], ["Talent", talentBudget, setTalentBudget, "3000"], ["Production", production, setProduction, "1500"]].map(([label, val, set, ph]) => (
              <div key={label} style={{ flex: "1 1 140px" }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 500 }}>{label}</div>
                <input value={val || ""} onChange={e => set(num(e.target.value))} placeholder={ph} inputMode="numeric" style={inp} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
            Pauta is whatever is left: <b style={{ color: C.text }}>{money(m.pauta)}</b>. On most campaigns it is the biggest of the three,
            and it is the one people forget to plan.
          </div>
        </div></Card>
      </Section>

      {/* ── angles ────────────────────────────────────────────────────────── */}
      <Section eyebrow="What to make" title="Angles"
        note="Angles are written from the brief and this client's own posts — no web search, so they cost a fraction of a talent search. Keep the ones that fit and say why you dropped the rest; the reason is what makes the next suggestion better."
        right={<span style={{ fontSize: 11.5, color: C.muted }}>{keptAngles.length} kept · {plannedVideos} videos · {angles.filter(a => a.status === "dropped").length} dropped</span>}>
        <Card><div style={{ padding: angles.length ? 0 : "22px 20px" }}>
          {!angles.length && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginBottom: 4 }}>Nothing proposed yet</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>
                {briefReady ? "Fill in the brief above and generate." : "Add the campaign description and a total budget first."}
              </div>
              <Btn primary onClick={() => genAngles(false)} disabled={!briefReady || genning}>{genning ? "Thinking…" : "Generate angles"}</Btn>
            </div>
          )}
          {angles.map(a => {
            const dead = a.status === "dropped";
            return (
              <div key={a.id} style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, background: dead ? C.light : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: dead ? C.muted : C.text, textDecoration: dead ? "line-through" : "none" }}>{a.title}</span>
                  {a.status === "kept" && <Pill label="Kept" color={C.green} />}
                  {a.status === "mine" && <Pill label="Yours" color={C.accent} />}
                  {dead && <Pill label="Dropped" color={C.red} />}
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
                    <PlatformIcon platform={a.platform} />{a.count} videos{a.format ? ` · ${a.format}` : ""}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 5 }}>{a.note}</div>
                {dead && a.reason && <div style={{ fontSize: 11.5, color: C.red, marginTop: 5 }}>Dropped: {a.reason}</div>}
                {a.asking
                  ? <Reasons question="Why is it out? The next suggestion is only as good as this answer."
                      options={A_REASONS}
                      onPick={r => { setAngle(a.id, { status: "dropped", asking: false, reason: r }); note(`Dropped "${a.title.slice(0, 50)}"`, r); }}
                      onCancel={() => setAngle(a.id, { asking: false })} />
                  : <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                      {dead
                        ? <SmallBtn onClick={() => { setAngle(a.id, { status: "proposed", reason: null }); note(`Put "${a.title.slice(0, 50)}" back`); }}>Put it back</SmallBtn>
                        : <>
                            {a.status === "proposed" && <SmallBtn tone="yes" onClick={() => { setAngle(a.id, { status: "kept" }); note(`Kept "${a.title.slice(0, 50)}"`); }}>Keep</SmallBtn>}
                            <SmallBtn tone="no" onClick={() => setAngle(a.id, { asking: true })}>Drop</SmallBtn>
                          </>}
                    </div>}
              </div>
            );
          })}
          {angles.length > 0 && (
            <div style={{ display: "flex", gap: 8, padding: "11px 16px", background: C.light, flexWrap: "wrap", alignItems: "center" }}>
              <input value={ownAngle} onChange={e => setOwnAngle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addOwnAngle(); }}
                placeholder="Your own angle — the client's idea outranks ours"
                style={{ ...inp, flex: "1 1 240px", width: "auto", background: C.surface }} />
              <SmallBtn onClick={addOwnAngle}>Add</SmallBtn>
              <SmallBtn onClick={() => genAngles(true)} disabled={genning}>{genning ? "Thinking…" : "Propose 1 more"}</SmallBtn>
            </div>
          )}
        </div></Card>
        {genErr && <div style={{ marginTop: 8, fontSize: 11.5, color: C.red, lineHeight: 1.5 }}>{genErr}</div>}
        {keptAngles.length > 0 && (
          <div style={{ marginTop: 9 }}>
            <SmallBtn tone="yes" onClick={() => {
              onSendToPipeline(clientId, keptAngles.flatMap(a => Array.from({ length: a.count || 1 }, () => ({
                id: uuid(), title: a.title, platform: a.platform, hook: "", format: a.format || "",
                month, stage: "idea", targetDate: "", campaignId: null,
              }))));
              note(`Sent ${plannedVideos} cards to the pipeline`, keptAngles.length + " angles");
            }}>Send {plannedVideos} cards to the pipeline →</SmallBtn>
          </div>
        )}
      </Section>

      {/* ── talent ────────────────────────────────────────────────────────── */}
      <Section eyebrow="Who makes it" title="Talent"
        note="Nobody arrives with a price on their head — the search never invents follower counts or fees. You set what you are willing to pay, and replace it with what they actually asked for once they reply. A pass or a week of silence puts the money back in the pot above."
        right={<span style={{ fontSize: 11.5, color: C.muted }}>{m.live.length} live · {talent.filter(t => t.status === "confirmed").length} confirmed</span>}>
        <Card><div>
          <div style={{ display: "flex", gap: 8, padding: "13px 16px", flexWrap: "wrap", alignItems: "center", borderBottom: talent.length ? `1px solid ${C.border}` : "none" }}>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") runSearch(); }}
              placeholder={`e.g. food creators in ${market || "Monterrey"}, small accounts, TikTok`}
              style={{ ...inp, flex: "1 1 260px", width: "auto" }} />
            <Btn primary onClick={runSearch} disabled={searching || !q.trim()}>{searching ? "Searching…" : "Search"}</Btn>
          </div>
          {searchErr && (
            <div style={{ padding: "11px 16px", borderBottom: talent.length ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 3 }}>Nothing usable came back</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55 }}>{searchErr}</div>
              {searchRaw && <details style={{ marginTop: 7 }}>
                <summary style={{ fontSize: 10.5, color: C.muted, cursor: "pointer" }}>What the model actually replied</summary>
                <pre style={{ fontSize: 10, lineHeight: 1.5, color: C.muted, background: C.light, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", marginTop: 6, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 200, overflow: "auto" }}>{searchRaw}</pre>
              </details>}
            </div>
          )}
          {!talent.length && !searchErr && (
            <div style={{ padding: "18px 16px 20px", textAlign: "center", fontSize: 12.5, color: C.muted }}>
              No one yet. Describe who you need and the search goes and finds real profiles you can open.
            </div>
          )}
          {talent.map(t => {
            const dead = !LIVE.includes(t.status);
            const [label, col] = T_STATE[t.status];
            return (
              <div key={t.id} style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, background: dead ? C.light : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <PlatformIcon platform={t.platform} />
                  <a href={t.profile_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 13.5, fontWeight: 600, color: dead ? C.muted : C.text, textDecoration: "none" }}>{t.handle} ↗</a>
                  <span style={{ marginLeft: "auto" }}><Pill label={label} color={col} /></span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 5 }}>{t.why}</div>
                {t.reason && <div style={{ fontSize: 11.5, color: C.red, marginTop: 5 }}>Out: {t.reason}</div>}
                {t.asking
                  ? <Reasons question="Why not this one?" options={T_REASONS}
                      onPick={r => release(t, "dropped", r)}
                      onCancel={() => setT(t.id, { asking: false })} />
                  : (
                    <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap", alignItems: "center" }}>
                      {!dead && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: C.muted }}>{t.status === "confirmed" ? "Agreed" : "Planned"}</span>
                          <span style={{ fontSize: 12, color: C.muted }}>$</span>
                          <input
                            value={(t.status === "confirmed" ? t.agreed : t.planned) || ""}
                            onChange={e => setT(t.id, t.status === "confirmed" ? { agreed: num(e.target.value) } : { planned: num(e.target.value) })}
                            placeholder="0" inputMode="numeric"
                            style={{ ...inp, width: 88, padding: "5px 9px", fontSize: 12.5 }} />
                          {t.status === "confirmed" && t.planned > 0 && t.agreed !== t.planned && (
                            <span style={{ fontSize: 11, color: t.agreed > t.planned ? C.red : C.green }}>
                              {t.agreed > t.planned ? "+" : "−"}{money(Math.abs(t.agreed - t.planned))} vs planned
                            </span>
                          )}
                        </span>
                      )}
                      <span style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
                        {t.status === "proposed" && <>
                          <SmallBtn tone="yes" onClick={() => { setT(t.id, { status: "outreach" }); note(`Reached out to ${t.handle}`, money(t.planned) + " planned"); }}>Approve &amp; reach out</SmallBtn>
                          <SmallBtn tone="no" onClick={() => setT(t.id, { asking: true })}>Not this one</SmallBtn>
                        </>}
                        {t.status === "outreach" && <>
                          <SmallBtn tone="yes" onClick={() => { setT(t.id, { status: "confirmed", agreed: t.planned || 0 }); note(`${t.handle} said yes`, "type what they actually asked for"); }}>They said yes</SmallBtn>
                          <SmallBtn tone="no" onClick={() => release(t, "passed")}>They passed</SmallBtn>
                          <SmallBtn onClick={() => release(t, "silent")}>No reply, 7 days</SmallBtn>
                        </>}
                        {t.status === "confirmed" && <SmallBtn tone="no" onClick={() => setT(t.id, { asking: true })}>Pull out</SmallBtn>}
                        {dead && <SmallBtn onClick={() => { setT(t.id, { status: "proposed", reason: null }); note(`Put ${t.handle} back`); }}>Put back</SmallBtn>}
                      </span>
                    </div>
                  )}
              </div>
            );
          })}
        </div></Card>
      </Section>

      {/* ── pauta ─────────────────────────────────────────────────────────── */}
      {m.pauta > 0 && (
        <Section eyebrow="Paid support" title="Pauta"
          note="Creator fees buy the content. Pauta puts it in front of people who do not already follow them. Never allocate all of it up front — you cannot know which post deserves the money until some of them have run.">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Card style={{ flex: "1 1 260px" }}><div style={{ padding: "15px 17px 16px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <span style={{ fontSize: 23, fontWeight: 600, letterSpacing: -0.6, color: C.text }}>{money(m.test)}</span>
                <Pill label="Spending now" color={C.green} />
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>Test · first half</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 8 }}>
                Small, even amounts behind the first posts across {platforms.join(" and ")}. Its job is not reach — it is finding out which
                of the {plannedVideos || "planned"} videos deserve the rest.
              </div>
            </div></Card>
            <Card style={{ flex: "1 1 260px", background: C.light }}><div style={{ padding: "15px 17px 16px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <span style={{ fontSize: 23, fontWeight: 600, letterSpacing: -0.6, color: C.text }}>{money(m.scale)}</span>
                <Pill label="Held back" color={C.amber} />
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>Scale · second half</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 8 }}>
                Unassigned on purpose. Released only to posts that clear the bar, and concentrated on two or three winners rather
                than spread across everything. If nothing clears it, this does not get spent badly.
              </div>
            </div></Card>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 500 }}>Test / held split</span>
            <input type="range" min={20} max={70} step={5} value={testPct}
              onChange={e => setTestPct(+e.target.value)}
              onPointerUp={e => note(`Set the pauta split to ${e.target.value}% test`, `${100 - e.target.value}% held for whatever works`)}
              style={{ flex: "1 1 200px", accentColor: C.accent }} />
            <span style={{ fontSize: 11.5, color: C.muted }}>{testPct}% now · {100 - testPct}% held</span>
          </div>
        </Section>
      )}

      {/* ── formalize ─────────────────────────────────────────────────────── */}
      <Section eyebrow="The output" title="Formalize"
        note="Nothing above is a deliverable — it is a workspace. Formalizing freezes it into a plan: the numbers as they landed, the people who actually said yes at the fee they actually asked for, and the reasoning behind every drop.">
        <Card><div style={{ padding: "16px 18px 18px" }}>
          {[["Angles chosen", keptAngles.length > 0, `${keptAngles.length} kept · ${plannedVideos} videos`],
            ["Every angle decided", angles.filter(a => a.status === "proposed").length === 0, `${angles.filter(a => a.status === "proposed").length} still open`],
            ["Talent confirmed", talent.some(t => t.status === "confirmed"), `${talent.filter(t => t.status === "confirmed").length} signed · ${talent.filter(t => t.status === "outreach").length} waiting`],
            ["Budget balances", !m.over && total > 0, m.over ? money(m.allocated - talentBudget) + " over" : money(total)],
          ].map(([label, ok, meta]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: C.muted, padding: "3px 0" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? C.green : C.amber }} />
              {label}<span style={{ marginLeft: "auto", fontSize: 11 }}>{meta}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: "12px 0 13px" }}>
            {frozen
              ? "Frozen on the numbers below. Reopen and formalize again whenever a creator drops out or the budget changes — it costs nothing to run."
              : "You can formalize with things still open. The plan says plainly what is undecided rather than pretending it is settled."}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn primary onClick={formalize} disabled={!briefReady}>{frozen ? "Re-formalize" : "Formalize campaign"}</Btn>
            {frozen && <Btn onClick={() => { setFrozen(null); note("Reopened the plan"); }}>Reopen</Btn>}
            {frozen && <Btn onClick={() => window.print()}>Print / PDF</Btn>}
          </div>
        </div></Card>

        {frozen && (
          <Card style={{ marginTop: 14, boxShadow: shMd }}><div>
            <div style={{ display: "flex", height: 4 }}>
              {[BRAND.red, BRAND.yellow, BRAND.blue, BRAND.green].map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
            </div>
            <div style={{ padding: "22px 24px 24px" }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Campaign plan · formalized</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: C.text, letterSpacing: -0.3, marginTop: 3 }}>{frozen.client} · {frozen.goal.slice(0, 70)}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, marginBottom: 18 }}>
                Frozen at step {frozen.at}{frozen.market ? ` · ${frozen.market}` : ""} · {frozen.platforms.join(" and ")}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                {[[money(frozen.total), "Total"], [frozen.videos, "Videos"], [frozen.conf.length, "Creators"], [money(frozen.pauta), "Pauta"]].map(([v, k]) => (
                  <div key={k} style={{ flex: "1 1 110px", background: C.light, borderRadius: 9, padding: "10px 12px" }}>
                    <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: -0.5, color: C.text }}>{v}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 600, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>{k}</div>
                  </div>
                ))}
              </div>
              {[["What gets made", frozen.angles.map(a => [a.title, `${a.platform} · ${a.count} videos${a.format ? ` · ${a.format}` : ""}`, ""])],
                ["Who is making it", frozen.conf.map(t => [t.handle, t.platform, money(t.agreed)])
                  .concat(frozen.wait.length ? [["Still waiting", frozen.wait.map(w => w.handle).join(", "), money(frozen.wait.reduce((n, w) => n + w.planned, 0)) + " planned"]] : [])],
                ["Paid support", [["Test · first half", "spending now", money(frozen.test)], ["Scale · second half", "held, released on performance", money(frozen.scale)]]],
                ["What we are not doing, and why", frozen.out.map(o => [o.what, o.why, ""])],
              ].map(([heading, rows]) => (
                <div key={heading} style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 7 }}>{heading}</div>
                  {rows.length ? rows.map(([a, b, c], i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "6px 0", borderTop: i ? `1px solid ${C.light}` : "none", fontSize: 13, flexWrap: "wrap" }}>
                      <span style={{ color: C.text }}>{a}</span>
                      <span style={{ fontSize: 11.5, color: C.muted }}>{b}</span>
                      {c && <span style={{ marginLeft: "auto", fontSize: 12.5, color: C.text }}>{c}</span>}
                    </div>
                  )) : <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>Nothing here.</div>}
                </div>
              ))}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                Agreed fees are facts — confirmed by the creator. Profile links were opened and checked. Angle selection is grounded in
                this client's own posting history. The scale budget is deliberately unassigned, because nobody can know which post
                deserves it yet.
              </div>
            </div>
          </div></Card>
        )}
      </Section>

      {/* ── log ───────────────────────────────────────────────────────────── */}
      <Section eyebrow="Paper trail" title="What changed, and why"
        note="For the meeting where the client asks why you are not using the creator they saw last week.">
        <Card><div style={{ padding: "12px 16px" }}>
          {log.length ? log.map((e, i) => (
            <div key={e.n} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "6px 0", borderTop: i === 0 ? "none" : `1px solid ${C.light}`, fontSize: 12.5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10.5, color: C.muted, minWidth: 18 }}>{e.n}</span>
              <span style={{ color: C.text }}>{e.what}</span>
              {e.why && <span style={{ fontSize: 11.5, color: C.muted }}>— {e.why}</span>}
            </div>
          )) : <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>Nothing yet. Every decision you make above lands here.</div>}
        </div></Card>
      </Section>
    </div>
  );
}

export { CampaignWorkspace };
