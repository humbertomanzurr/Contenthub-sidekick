import { useEffect, useState } from "react";
import { sbGetOne, sbInsertX, sbSignIn, sbSignUp, sbUpdate } from "../lib/supabase";
import { BRAND, C, Logo, inp, shMd } from "../ui/theme";

// ── FIGURES ───────────────────────────────────────────────────────────────────
// Each pillar shows the actual surface rather than describing it. Someone who
// has never heard the word "pipeline" should be able to look at the first one
// and see that work moves left to right until it is finished.

const card = { background: "#FFF", border: "0.5px solid #E4E4E7", borderRadius: 6, padding: "6px 8px", fontSize: 10, color: "#333", lineHeight: 1.3 };

function PipelineFigure() {
  const cols = [
    { name: "Brief", color: BRAND.red, items: [{ t: "Studio tour" }, { t: "Founder Q&A" }] },
    { name: "Filming", color: BRAND.yellow, items: [{ t: "Product unboxing" }] },
    { name: "Editing", color: BRAND.blue, items: [{ t: "Before & after", flag: "SENT BACK" }] },
    { name: "Published", color: BRAND.green, items: [{ t: "Morning routine", meta: "56K views" }] },
  ];
  return (
    <div>
      {/* Four columns can't shrink below legibility, so on a phone this
          scrolls sideways inside itself rather than spilling off the page. */}
      <div style={{ overflowX: "auto", margin: "0 -2px", padding: "0 2px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(104px,1fr))", gap: 8, minWidth: 440 }}>
        {cols.map(c => (
          <div key={c.name} style={{ background: "#F7F8F9", borderRadius: 8, padding: 7, minHeight: 96 }}>
            <div style={{ height: 3, borderRadius: 2, background: c.color, marginBottom: 7 }} />
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: .6, textTransform: "uppercase", color: "#888", marginBottom: 6 }}>{c.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {c.items.map(it => (
                <div key={it.t} style={{ ...card, borderLeft: `4px solid ${c.color}` }}>
                  {it.t}
                  {it.meta && <div style={{ fontSize: 9, color: "#999", marginTop: 2 }}>{it.meta}</div>}
                  {it.flag && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: .5, color: BRAND.red, marginTop: 3 }}>↩ {it.flag}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#E8E8E8,#CFCFCF)" }} />
        <div style={{ fontSize: 10, color: "#999" }}>a video moves this way until it&rsquo;s live</div>
        <div style={{ color: "#CFCFCF", fontSize: 11 }}>&rarr;</div>
      </div>
    </div>
  );
}

function ScoutingFigure() {
  const rows = [
    { h: "@theglowdiary", f: "215K followers", ok: true },
    { h: "@skincarenotes", f: "48K followers", ok: true },
    { h: "@glowbymara", f: "profile not found", ok: false },
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>
        {["skincare", "Los Angeles", "10K–100K", "TikTok"].map(t => (
          <span key={t} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "#EEF4FC", color: "#2A6FB8", fontWeight: 500 }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {rows.map(r => (
          <div key={r.h} style={{ ...card, display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", opacity: r.ok ? 1 : .55, borderLeft: `4px solid ${r.ok ? BRAND.green : "#D8D8D8"}` }}>
            <span style={{ fontWeight: 600, fontSize: 11, textDecoration: r.ok ? "none" : "line-through", color: r.ok ? "#222" : "#999" }}>{r.h}</span>
            <span style={{ fontSize: 10, color: "#999" }}>{r.f}</span>
            <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: .4, color: r.ok ? BRAND.green : "#BBB" }}>
              {r.ok ? "✓ REAL" : "✕ DROPPED"}
            </span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "#999", marginTop: 10 }}>
        every profile is opened and checked before it reaches your list
      </div>
    </div>
  );
}

function AnalysisFigure() {
  const bars = [
    { label: "Starts with a question", v: 42, txt: "42K", color: BRAND.green },
    { label: "Starts with a number", v: 21, txt: "21K", color: BRAND.blue },
    { label: "Starts with a story", v: 11, txt: "11K", color: BRAND.yellow },
  ];
  const max = 42;
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: .6, textTransform: "uppercase", color: "#888", marginBottom: 10 }}>
        Average views by how the video opens
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {bars.map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 130, fontSize: 10.5, color: "#555", flexShrink: 0 }}>{b.label}</div>
            <div style={{ flex: 1, background: "#F0F1F3", borderRadius: 3, height: 16, overflow: "hidden" }}>
              <div style={{ width: `${(b.v / max) * 100}%`, height: "100%", background: b.color, borderRadius: 3 }} />
            </div>
            <div style={{ width: 34, fontSize: 10.5, color: "#333", fontWeight: 600, textAlign: "right", flexShrink: 0 }}>{b.txt}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "9px 11px", background: "#F1F8F5", border: `0.5px solid #CDE7DA`, borderRadius: 8, fontSize: 11, color: "#1B6B50", lineHeight: 1.5 }}>
        Your question hooks get <strong>3.8&times;</strong> the views of your story hooks &mdash; counted from your own 47 posts, not guessed.
      </div>
    </div>
  );
}

// The three pillars, in the order the work actually happens. Numbering earns
// its place here: you organize before you scout, and you can only analyze what
// you already ran.
const PILLARS = [
  {
    n: "01",
    color: BRAND.red,
    name: "Organizing",
    tag: "Keeping track of the work",
    headline: "Know what every client’s video is doing today.",
    plain: "Each video is a card. Drag it along as it gets made, and everyone on the team sees the same board. Comments on a cut are pinned to the exact second they refer to.",
    Figure: PipelineFigure,
  },
  {
    n: "02",
    color: BRAND.blue,
    name: "Scouting",
    tag: "Finding creators to work with",
    headline: "Build a shortlist of creators who are real.",
    plain: "Describe who you want and get back profiles that were actually opened and checked. Anything invented gets thrown out before you ever see it.",
    Figure: ScoutingFigure,
  },
  {
    n: "03",
    color: BRAND.green,
    name: "Analysis",
    tag: "Showing clients it worked",
    headline: "See which videos worked, and why.",
    plain: "Your own numbers, added up. Which openings travelled, which formats stalled, whether this month beat the one before — ready to print for the client.",
    Figure: AnalysisFigure,
  },
];

const PLANS = [
  {
    id: "free",
    accent: BRAND.green,
    eyebrow: "Free",
    price: "$0",
    per: "forever",
    title: "One brand, ten cards",
    lead: "The real product, not a demo. Everything you need to run one brand's content properly.",
    points: [
      "Pipeline from brief to published",
      "Review room with timestamped notes",
      "Script writing with AI questions",
      "Shoot planner and call sheet",
      "10 cards in progress at a time",
    ],
    limit: "Published cards don't count towards the ten — so the pipeline keeps working. You'll know you've outgrown it when you're deleting cards to make room.",
    cta: "Start free",
    solid: false,
  },
  {
    id: "business",
    accent: BRAND.blue,
    eyebrow: "Business",
    price: "$30",
    per: "per month",
    title: "One brand, no ceiling",
    lead: "For one brand run seriously — when you want to know what's working, not just what's shipped.",
    points: [
      "Everything in Free, uncapped",
      "Analytics on your own posts",
      "Creator search and shortlists",
      "Up to 3 people",
      "Printable reports",
    ],
    limit: "The step most people take first. Same app, same data — the limits just come off.",
    cta: "Start free, upgrade inside",
    solid: true,
  },
  {
    id: "agency",
    accent: C.purple,
    eyebrow: "Agency",
    price: "Let's talk",
    per: "",
    title: "Every client, your whole team",
    lead: "When one brand becomes several and you need roles, approvals and per-client reporting.",
    points: [
      "Everything in Business",
      "Unlimited clients",
      "Unlimited team, with roles",
      "Per-client pipelines and reports",
      "Agency-wide calendar",
    ],
    limit: "Nothing to migrate when you get here — Free, Business and Agency are the same app with different ceilings.",
    cta: "Start free",
    solid: false,
  },
];


// Inline styles can't hold a media query, so a narrow viewport is tracked in
// state instead. Without this both grids below keep their desktop columns and
// spill off the side of a phone.
function useNarrow(px = 760) {
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth < px);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < px);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, [px]);
  return narrow;
}

function Landing({ onPath }) {
  const [pillar, setPillar] = useState(0);
  const narrow = useNarrow();
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
          Human-made content, AI-kept order
        </div>

        <div style={{ fontSize: 42, fontWeight: 500, lineHeight: 1.14, letterSpacing: -1.2, color: "#111", marginBottom: 18 }}>
          Know where every video is.<br />
          And{" "}
          <span style={{ color: BRAND.red }}>what</span>{" "}
          <span style={{ color: BRAND.blue }}>it</span>{" "}
          <span style={{ color: BRAND.green }}>did.</span>
        </div>

        <div style={{ fontSize: 15.5, color: "#555", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 30px" }}>
          A board that runs brief to published, a review room where notes pin to the exact second of the cut, and reports a client can actually read &mdash; whether that client is your own company or your fiftieth.
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <button onClick={() => onPath("free")} style={{ padding: "12px 28px", background: "#111", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Start free →</button>
          <button onClick={() => document.getElementById("pillars")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "12px 20px", background: "none", color: "#111", border: "1px solid #DDD", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>See what it does</button>
        </div>
        <div style={{ fontSize: 11, color: "#AAA" }}>Free for one brand, forever. No card.</div>
      </div>

      {/* Two ways in. Whoever you are, one of these sentences is about you —
          which is the job the old hero was failing at, because it only ever
          described the agency. */}
      <div style={{ borderTop: "0.5px solid #E8E8E8", background: "#FFF", padding: "44px 32px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#AAA", marginBottom: 8, textAlign: "center" }}>Which one are you</div>
          <div style={{ fontSize: 23, fontWeight: 500, color: "#111", letterSpacing: -0.5, marginBottom: 6, lineHeight: 1.3, textAlign: "center" }}>
            One brand, or somebody else&rsquo;s.
          </div>
          <div style={{ fontSize: 13.5, color: "#777", marginBottom: 26, textAlign: "center", maxWidth: 500, margin: "0 auto 26px", lineHeight: 1.6 }}>
            It is the same app either way. What changes is how much of it you need.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: 14 }}>
            {[
              {
                id: "free", accent: BRAND.blue, who: "I run one brand",
                sub: "In-house marketer, founder, or someone running the content for a single company.",
                body: "Your pipeline, your scripts, your shoot plans and your own numbers. Nobody calls anybody a client, because there is only you and the brand you work on.",
                foot: "Free for ten cards in progress. $30 a month when you want the ceiling off.",
                cta: "Start free",
              },
              {
                id: "agency", accent: C.purple, who: "I run content for clients",
                sub: "An agency, or a freelancer with more than one brand to keep straight.",
                body: "Every client on one calendar, a team with roles and approvals, and reporting per client that you can put in front of them without rewriting it first.",
                foot: "Everything above, without the ceilings, across as many brands as you carry.",
                cta: "See the Agency plan",
              },
            ].map(o => (
              <div key={o.id} style={{ border: "0.5px solid #E8E8E8", borderRadius: 14, background: "#FFF", padding: "22px 22px 20px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  <div style={{ width: 22, height: 3, borderRadius: 2, background: o.accent }} />
                  <div style={{ width: 7, height: 3, borderRadius: 2, background: "#E8E8E8" }} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#111", letterSpacing: -0.3, marginBottom: 5 }}>{o.who}</div>
                <div style={{ fontSize: 12.5, color: "#888", lineHeight: 1.55, marginBottom: 11 }}>{o.sub}</div>
                <div style={{ fontSize: 13.5, color: "#555", lineHeight: 1.65, marginBottom: 14 }}>{o.body}</div>
                <div style={{ fontSize: 11.5, color: "#999", lineHeight: 1.55, marginBottom: 16, marginTop: "auto" }}>{o.foot}</div>
                <button onClick={() => onPath(o.id)} style={{ padding: "11px 18px", background: "#111", color: "white", border: "none", borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: "pointer", width: "100%" }}>{o.cta} &rarr;</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The one claim nobody else on this market is making, and it happens to
          be true of the code: the script assistant is forbidden from writing. */}
      <div style={{ borderTop: "0.5px solid #E8E8E8", background: "#FCFCFD", padding: "48px 32px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#AAA", marginBottom: 10 }}>Where the AI stops</div>
          <div style={{ fontSize: 25, fontWeight: 500, color: "#111", letterSpacing: -0.6, lineHeight: 1.3, marginBottom: 14 }}>
            It will not write your video for you.
          </div>
          <div style={{ fontSize: 14.5, color: "#555", lineHeight: 1.75, marginBottom: 18 }}>
            The script assistant is built to ask what your hook is actually promising and whether the ending
            earns it. It is not allowed to write the line &mdash; not as a limitation, as the point. Content that
            sounds like everybody else&rsquo;s is worth nothing, and that is precisely what you get from a machine
            writing your scripts.
          </div>
          <div style={{ fontSize: 13.5, color: "#777", lineHeight: 1.7 }}>
            What it does instead is the work nobody wants: keeping fifty cards straight, remembering which
            opening travelled furthest, checking a creator&rsquo;s profile actually exists, and adding up the month
            so you can show somebody. <strong style={{ color: "#111", fontWeight: 600 }}>You make it. It keeps it in order and tells you the truth about it.</strong>
          </div>
        </div>
      </div>

      {/* Pillars — click one, look at it. */}
      <div id="pillars" style={{ borderTop: "0.5px solid #E8E8E8", background: "#FCFCFD", padding: "56px 32px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#AAA", marginBottom: 8 }}>What it does</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: "#111", letterSpacing: -0.5, marginBottom: 6, maxWidth: 560, lineHeight: 1.3 }}>
            Three jobs, one place to do them.
          </div>
          <div style={{ fontSize: 13.5, color: "#777", marginBottom: 26 }}>Click one to see what it looks like.</div>

          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "244px 1fr", gap: narrow ? 12 : 20, alignItems: "start" }}>
            {/* Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PILLARS.map((p, i) => {
                const on = i === pillar;
                return (
                  <button key={p.n} onClick={() => setPillar(i)}
                    style={{ textAlign: "left", background: on ? "#FFF" : "transparent", border: on ? "0.5px solid #E4E4E7" : "0.5px solid transparent", borderLeft: `4px solid ${on ? p.color : "#E8E8E8"}`, borderRadius: 10, padding: "13px 15px", cursor: "pointer", boxShadow: on ? "0 1px 3px rgba(0,0,0,.05)" : "none" }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: on ? p.color : "#BBB", marginBottom: 3 }}>{p.n}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: on ? "#111" : "#777" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{p.tag}</div>
                  </button>
                );
              })}
            </div>

            {/* Detail — the figure does the explaining */}
            <div style={{ background: "#FFF", border: "0.5px solid #E8E8E8", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ height: 3, background: P.color }} />
              <div style={{ padding: "20px 24px 22px" }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: "#111", letterSpacing: -0.3, lineHeight: 1.35, marginBottom: 7 }}>{P.headline}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 18, maxWidth: 520 }}>{P.plain}</div>
                <div style={{ background: "#FAFBFC", border: "0.5px solid #EDEEF0", borderRadius: 10, padding: 14 }}>
                  <P.Figure />
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
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#AAA", marginBottom: 8 }}>Pricing</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: "#111", letterSpacing: -0.5, marginBottom: 10 }}>Same app three times. Only the ceiling moves.</div>
            <div style={{ fontSize: 13.5, color: "#666", lineHeight: 1.65, maxWidth: 500, margin: "0 auto" }}>
              Nothing to migrate and nothing to relearn when you move up — your board, your cards and your history stay exactly where they are. You're only ever buying room.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
            {PLANS.map(p => (
              <div key={p.id} style={{ background: "#FFF", border: `0.5px solid ${p.solid ? "#D8E4F2" : "#E8E8E8"}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: p.solid ? "0 2px 14px rgba(55,138,221,.09)" : "none" }}>
                <div style={{ height: 3, background: p.accent }} />
                <div style={{ padding: 26, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: p.accent, marginBottom: 8 }}>{p.eyebrow}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 26, fontWeight: 600, color: "#111", letterSpacing: -0.8 }}>{p.price}</span>
                    {p.per && <span style={{ fontSize: 12, color: "#999" }}>{p.per}</span>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#111", letterSpacing: -0.2, marginBottom: 8 }}>{p.title}</div>
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
      // account_type stays "agency" because both tiers run the same portal —
      // the plan is what differs. Written to the row as well as localStorage:
      // localStorage is per-device, so without the column a signup on one
      // browser would look like a different tier on another.
      await sbUpdate("profiles", "id", u2.id, { account_type: "agency" });
      const chosenPlan = path === "agency" ? "agency" : "free";
      const planWrite = await sbUpdate("profiles", "id", u2.id, { plan: chosenPlan });
      if (planWrite && !planWrite.ok) {
        // The column may not exist yet; localStorage carries it until it does.
        console.warn("profiles.plan not written — run security/plan.sql:", planWrite.error);
      }
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
