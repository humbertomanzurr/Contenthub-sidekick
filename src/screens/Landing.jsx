import { useState } from "react";
import { sbGetOne, sbInsertX, sbSignIn, sbSignUp, sbUpdate } from "../lib/supabase";
import { BRAND, C, Logo, inp, shMd } from "../ui/theme";

// The three pillars, in the order the work actually happens. Numbering earns
// its place here: you organise before you scout, and you can only analyse what
// you already ran.
const PILLARS = [
  {
    n: "01",
    color: BRAND.red,
    name: "Organising",
    tag: "Pipeline, calendar, review",
    headline: "Every client's work, in one board that tells the truth.",
    body: "Six stages from brief to published. A review room where feedback is stamped to the second of the video it refers to, so nobody writes \"the bit near the start\" ever again. Send a cut back and the card stays marked until it's approved.",
    proof: ["Six-stage pipeline per client", "Timestamped review notes", "Shared calendar across every client", "Monthly goals set for all clients at once"],
  },
  {
    n: "02",
    color: BRAND.blue,
    name: "Scouting",
    tag: "Creator discovery",
    headline: "Shortlists of creators who actually exist.",
    body: "Search by niche, city, size and platform, or paste a profile link. Every result is checked against the platform's own domain before you see it — a made-up handle never reaches your list. Fewer real creators beats more invented ones.",
    proof: ["Verified on-platform profiles only", "Lists belong to a campaign and a client", "Status per creator, prospect to signed", "Numbers entered by a human, stamped with the date checked"],
  },
  {
    n: "03",
    color: BRAND.green,
    name: "Analysis",
    tag: "Client reporting",
    headline: "Numbers you can defend in the room.",
    body: "What's working is calculated from your own data, never summarised by a model. Which hooks travelled, which formats stalled, whether this month beat last. Printable client reports that don't need a slide deck built around them.",
    proof: ["Computed from your data, not generated", "Hook and format performance", "Agency-wide production health", "Printable per-client reports"],
  },
];

const PLANS = [
  {
    id: "free",
    accent: BRAND.green,
    eyebrow: "Free",
    title: "One client, one seat",
    lead: "The whole product, not a crippled preview. Everything a solo marketer needs to run one brand properly.",
    points: [
      "Full six-stage pipeline",
      "Review room with timestamped notes",
      "Calendar and monthly goals",
      "Script document and shoot planner",
      "Performance analytics",
    ],
    limit: "Limited to one client and one user.",
    cta: "Start free",
    solid: false,
  },
  {
    id: "agency",
    accent: BRAND.blue,
    eyebrow: "Agency",
    title: "Every client, your whole team",
    lead: "The same app, without the ceiling. For when you take on a second client, or hire someone.",
    points: [
      "Everything in Free",
      "Unlimited clients",
      "Unlimited team members, with roles",
      "Creator scouting and shortlists",
      "Printable client reports",
    ],
    limit: "Pricing announced soon — start free and upgrade when you outgrow it.",
    cta: "Start free, upgrade later",
    solid: true,
  },
];

function Landing({ onPath }) {
  const [pillar, setPillar] = useState(0);
  const P = PILLARS[pillar];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "system-ui,sans-serif" }}>

      {/* Nav */}
      <div style={{ padding: "0 32px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid #E8E8E8", position: "sticky", top: 0, background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)", zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Logo />
          <div style={{ fontSize: 14, fontWeight: 500, color: "#111", letterSpacing: -0.2 }}>ContentHub <span style={{ fontWeight: 400, color: "#888" }}>Sidekick</span></div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span onClick={() => onPath("login")} style={{ fontSize: 12, color: "#555", cursor: "pointer" }}>Sign in</span>
          <button onClick={() => onPath("free")} style={{ fontSize: 12, padding: "5px 16px", borderRadius: 6, border: "1px solid #DDD", background: "none", color: "#111", cursor: "pointer" }}>Start free</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "76px 32px 56px", textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 10, padding: "5px 14px", borderRadius: 20, border: "0.5px solid #E8E8E8", color: "#666", marginBottom: 26, background: "#FAFAFA", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[BRAND.red, BRAND.yellow, BRAND.blue, BRAND.green].map((c, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />)}
          </div>
          Built for content agencies
        </div>

        <div style={{ fontSize: 42, fontWeight: 500, lineHeight: 1.14, letterSpacing: -1.2, color: "#111", marginBottom: 18 }}>
          Run every client's content<br />
          like you run{" "}
          <span style={{ color: BRAND.red }}>your</span>{" "}
          <span style={{ color: BRAND.blue }}>best</span>{" "}
          <span style={{ color: BRAND.green }}>one.</span>
        </div>

        <div style={{ fontSize: 15.5, color: "#555", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 30px" }}>
          Pipelines, review, scouting and reporting for agencies juggling more brands than spreadsheets can hold. Start with one client for free — the same app, all the way up.
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <button onClick={() => onPath("free")} style={{ padding: "12px 28px", background: "#111", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Start free →</button>
          <button onClick={() => document.getElementById("pillars")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "12px 20px", background: "none", color: "#111", border: "1px solid #DDD", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>See what it does</button>
        </div>
        <div style={{ fontSize: 11, color: "#AAA" }}>No card. One client free, forever.</div>
      </div>

      {/* Pillars — click one, read it. */}
      <div id="pillars" style={{ borderTop: "0.5px solid #E8E8E8", background: "#FCFCFD", padding: "56px 32px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#AAA", marginBottom: 8 }}>What it does</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: "#111", letterSpacing: -0.5, marginBottom: 26, maxWidth: 560, lineHeight: 1.3 }}>
            Three jobs an agency actually has. Pick one.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
            {/* Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PILLARS.map((p, i) => {
                const on = i === pillar;
                return (
                  <button key={p.n} onClick={() => setPillar(i)}
                    style={{ textAlign: "left", background: on ? "#FFF" : "transparent", border: on ? "0.5px solid #E4E4E7" : "0.5px solid transparent", borderLeft: `4px solid ${on ? p.color : "#E8E8E8"}`, borderRadius: 10, padding: "13px 15px", cursor: "pointer", boxShadow: on ? "0 1px 3px rgba(0,0,0,.05)" : "none", transition: "background .15s" }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: on ? p.color : "#BBB", marginBottom: 3 }}>{p.n}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: on ? "#111" : "#777" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{p.tag}</div>
                  </button>
                );
              })}
            </div>

            {/* Detail */}
            <div style={{ background: "#FFF", border: "0.5px solid #E8E8E8", borderRadius: 14, overflow: "hidden", minHeight: 268 }}>
              <div style={{ height: 3, background: P.color }} />
              <div style={{ padding: "22px 26px 24px" }}>
                <div style={{ fontSize: 19, fontWeight: 500, color: "#111", letterSpacing: -0.3, lineHeight: 1.35, marginBottom: 10 }}>{P.headline}</div>
                <div style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65, marginBottom: 18 }}>{P.body}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 18px" }}>
                  {P.proof.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: "#555" }}>
                      <span style={{ color: P.color, flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The line we don't cross */}
      <div style={{ borderTop: "0.5px solid #E8E8E8", padding: "50px 32px", background: "#FFF" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 18 }}>
            {[BRAND.red, BRAND.yellow, BRAND.blue, BRAND.green].map((c, i) => <div key={i} style={{ width: 26, height: 3, borderRadius: 2, background: c }} />)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, color: "#111", letterSpacing: -0.4, lineHeight: 1.4, marginBottom: 12 }}>
            The AI does the research. It never writes your content.
          </div>
          <div style={{ fontSize: 13.5, color: "#666", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            It finds creators, checks that they're real, and calculates what your numbers mean. The hook, the joke, the point of view — those stay yours. We deleted the features that wrote for you, on purpose.
          </div>
        </div>
      </div>

      {/* Plans */}
      <div style={{ borderTop: "0.5px solid #E8E8E8", background: "#FCFCFD", padding: "56px 32px 72px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#AAA", marginBottom: 8 }}>Two ways in</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: "#111", letterSpacing: -0.5, marginBottom: 10 }}>Same app. One of them has a ceiling.</div>
            <div style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65, maxWidth: 500, margin: "0 auto" }}>
              There's no stripped-down version to graduate out of. You start on the real thing and lift the limit when your work outgrows it.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {PLANS.map(p => (
              <div key={p.id} style={{ background: "#FFF", border: `0.5px solid ${p.solid ? "#D8E4F2" : "#E8E8E8"}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: p.solid ? "0 2px 14px rgba(55,138,221,.09)" : "none" }}>
                <div style={{ height: 3, background: p.accent }} />
                <div style={{ padding: 26, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: p.accent, marginBottom: 10 }}>{p.eyebrow}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#111", letterSpacing: -0.3, marginBottom: 8 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 18 }}>{p.lead}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, marginBottom: 18 }}>
                    {p.points.map(f => (
                      <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: "#555" }}>
                        <span style={{ color: p.accent, flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11.5, color: "#999", lineHeight: 1.55, marginBottom: 16, paddingTop: 14, borderTop: "0.5px solid #F0F0F0" }}>{p.limit}</div>

                  <button onClick={() => onPath(p.id)}
                    style={{ display: "block", width: "100%", padding: "11px 0", background: p.solid ? BRAND.blue : "#111", color: "#FFF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: "auto" }}>
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#999" }}>
            Already have an account? <span onClick={() => onPath("login")} style={{ color: BRAND.blue, cursor: "pointer", fontWeight: 500 }}>Sign in</span>
          </div>
        </div>
      </div>

    </div>
  );
}


// ── AUTH SCREEN ───────────────────────────────────────────────────────────────

// path is "free" | "agency" | "login". Both plans land in the same agency
// portal — the free tier is the real product with a ceiling, not a separate
// stripped-down app — so account_type is "agency" either way. Which plan they
// picked is remembered locally until there is a column to enforce it against.
const PLAN_LABEL = { free: "Free", agency: "Agency" };

function AuthScreen({ path, onLogin, onBack }) {
  const [mode, setMode] = useState(path === "login" ? "login" : "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const go = async () => {
    if (!email || !pass) { setErr("Please fill in all fields"); return; }
    setLoading(true); setErr("");
    if (mode === "signup") {
      const { user, error } = await sbSignUp(email, pass);
      if (error || !user) { setErr("Could not create account."); setLoading(false); return; }
      const { user: u2, error: e2 } = await sbSignIn(email, pass);
      if (e2 || !u2) { setErr("Account created — please sign in."); setMode("login"); setLoading(false); return; }
      try {
        localStorage.setItem(`sk_acct_${u2.id}`, "agency");
        // Remembered so the app can show the right ceiling. Real enforcement
        // needs a column and a server check — this is not a gate.
        localStorage.setItem(`sk_plan_${u2.id}`, path === "agency" ? "agency" : "free");
      } catch (e) {}
      const pr = await sbInsertX("profiles", { id: u2.id, name: email, email, account_type: "agency" });
      if (!pr.ok) {
        // The row already existed — a signup trigger usually creates one with a
        // default account_type. Overwrite it with the portal they belong in.
        console.warn("profiles insert skipped, patching instead:", pr.error);
      }
      await sbUpdate("profiles", "id", u2.id, { account_type: "agency" });
      setPendingUser({ user: u2, profile: { name, account_type: "agency" } });
      setLoading(false);
      return;
    } else {
      const { user, error } = await sbSignIn(email, pass);
      if (error || !user) { setErr("Wrong email or password."); setLoading(false); return; }
      const prof = await sbGetOne("profiles", "id", user.id);
      onLogin(user, prof || { account_type: "agency" });
    }
    setLoading(false);
  };

  if (pendingUser) {
    // Everyone lands in the agency portal now, which has its own onboarding —
    // the business-profile step belonged to the old Business path.
    onLogin(pendingUser.user, pendingUser.profile);
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 340, padding: 32, background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: shMd }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, marginBottom: 14, padding: 0 }}>← Back</button>
        <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
          {[BRAND.red, BRAND.yellow, BRAND.blue, BRAND.green].map((c, i) => <div key={i} style={{ width: 22, height: 3, borderRadius: 2, background: c }} />)}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 4 }}>ContentHub Sidekick</div>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 22 }}>
          {path === "login" ? "Sign in" : `${PLAN_LABEL[path] || "Free"} — ${mode === "signup" ? "Create account" : "Sign in"}`}
        </div>

        <div style={{ marginBottom: 12 }}><div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 500 }}>Email</div><input type="email" value={email} onChange={x => setEmail(x.target.value)} onKeyDown={x => x.key === "Enter" && go()} style={inp} /></div>
        <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 500 }}>Password</div><input type="password" value={pass} onChange={x => setPass(x.target.value)} onKeyDown={x => x.key === "Enter" && go()} style={inp} /></div>
        {err && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{err}</div>}
        <button onClick={go} disabled={loading} style={{ width: "100%", padding: 12, background: C.text, color: "#FFF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>{loading ? "Loading..." : (mode === "signup" ? "Create account →" : "Sign in →")}</button>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: C.muted }}>
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <span onClick={() => { setMode(m => m === "signup" ? "login" : "signup"); setErr(""); }} style={{ color: C.accent, cursor: "pointer", fontWeight: 600 }}>{mode === "signup" ? "Sign in" : "Sign up"}</span>
        </div>
      </div>
    </div>
  );
}

export { AuthScreen, Landing };
