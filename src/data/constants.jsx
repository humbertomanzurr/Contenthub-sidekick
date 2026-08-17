import { BRAND } from "../ui/theme";

const PLATFORMS=["TikTok","Instagram Reels","YouTube Shorts","YouTube","Facebook","LinkedIn"];

const HOOKS=["Impact","Curiosity","Story","Transformation","POV","Desire","Before/After","Question","Statistic","Problem","Controversy"];

const FORMATS=["Product Demo","Talking to Camera","Tutorial","Trend","Voice Over","Founder","Educational","Behind the Scenes","Lifestyle","Meme"];

const CTAS=["Follow","Save","Comment","Share","Visit Profile","Buy","DM me","Link in Bio","No CTA"];

const STAGES=[
  {id:"idea",      label:"Idea",       color:BRAND.red},
  {id:"production",label:"Production", color:BRAND.yellow},
  {id:"editing",   label:"Editing",    color:BRAND.blue},
  {id:"published", label:"Published",  color:BRAND.green},
];

const AGENCY_STAGES=[
  {id:"idea",      label:"Idea",             color:BRAND.red},
  {id:"production",label:"Production",        color:BRAND.yellow},
  {id:"editing",   label:"Editing",           color:BRAND.blue},
  {id:"review",    label:"Ready for Review",  color:"#F97316"},
  {id:"approved",  label:"Approved",          color:"#7F77DD"},
  {id:"published", label:"Published",         color:BRAND.green},
];

const SCRIPT_MOVES={
  hook:{
    _base:[
      {move:"Accuse them",            ask:"What does your audience do and quietly defend? Say it in six words, no softening.", push:"Read it back. If nobody would argue with it, it isn't an accusation yet."},
      {move:"Ask the wrong question", ask:"Open with something that sounds unrelated to the video. What is it?",                push:"Know the line that connects it back — but don't say it until the body."},
      {move:"Start at the worst moment",ask:"Skip the setup. Where had it already gone wrong?",                                 push:"Delete the first sentence you wrote. Does it still land without it?"},
      {move:"Say the number",         ask:"What single figure makes people stop? Lead with it, bare.",                          push:"Strip the context around it. A number with setup is a report, not a hook."},
      {move:"Admit something",        ask:"What do you leave out when you tell this story to strangers?",                       push:"If saying it costs you nothing, go one level down."},
    ],
    "TikTok":[
      {move:"Talk mid-thought",       ask:"Start as if the camera caught you already talking. What sentence did they walk in on?",push:"No greeting, no name, no 'so basically'. Begin at the verb."},
      {move:"Name what nobody says",  ask:"What does everyone in your world know but never posts?",                             push:"If it feels slightly risky to say out loud, it's the right one."},
    ],
    "Instagram Reels":[
      {move:"Lead with the frame",    ask:"Before a word is spoken, what's on screen? Describe it in one line.",                push:"Would that frame stop you if the sound were off?"},
      {move:"One sentence worth saving",ask:"What single idea would someone screenshot? Write only that.",                      push:"Cut every word that isn't doing work. Saves reward compression."},
    ],
    "YouTube Shorts":[
      {move:"Promise in three seconds",ask:"What do they get by the end? Say it flat, up front.",                              push:"Don't tease it. Teasing costs you the viewers who'd have stayed."},
    ],
    "YouTube":[
      {move:"Earn the ten minutes",   ask:"What can you give here that a 60-second version can't?",                            push:"If the short version would do, make the short version."},
    ],
    "LinkedIn":[
      {move:"Two lines, then the cut",ask:"Only two lines show before 'see more'. What are they?",                             push:"The second line should make stopping there feel unfinished."},
      {move:"Argue with the room",    ask:"What does your industry repeat that you think is wrong?",                           push:"Name who says it. Vague disagreement reads as posturing."},
    ],
    "Facebook":[
      {move:"That's exactly me",      ask:"What moment makes someone see themselves? Name the specific detail.",               push:"Specific beats universal. The detail is what makes it universal."},
    ],
  },
  body:{
    _base:[
      {move:"Show the part that failed",ask:"What went wrong that you'd normally edit out?",                                   push:"That's usually the part people came for."},
      {move:"One idea, no branches", ask:"State your single point in one sentence. Everything else supports it or goes.",      push:"Find the sentence that belongs in a different video. Cut it."},
      {move:"Give the specific",     ask:"Replace your vaguest sentence with a name, a number, or a date.",                    push:"Do it again with the next vaguest one."},
      {move:"Earn it, don't explain it",ask:"What happened that proves your point without you stating it?",                    push:"Now remove the sentence where you state it anyway."},
      {move:"Cut the throat-clearing",ask:"Delete your first two sentences. Where does the body actually start?",              push:"If nothing was lost, they were never the body."},
    ],
    "TikTok":[
      {move:"Keep it under 45",      ask:"Read it aloud and time it. What comes out to stay under 45 seconds?",                push:"Cut the explanation before you cut the story."},
    ],
    "Instagram Reels":[
      {move:"Make the look mean something",ask:"How does the way this looks say the same thing as the words?",                 push:"If the visuals are just b-roll, you have two videos fighting."},
    ],
    "YouTube":[
      {move:"Front-load the payoff", ask:"What's the most valuable thing you say? Move it earlier.",                           push:"Retention is decided long before your best point arrives."},
    ],
    "LinkedIn":[
      {move:"What it cost you",      ask:"What did you actually lose learning this?",                                          push:"The cost is the credential. Advice without it reads as theory."},
    ],
  },
  cta:{
    _base:[
      {move:"Ask what you don't know",ask:"What are you genuinely uncertain about here? Ask that instead.",                    push:"Real questions get real comments. Rhetorical ones get scrolled."},
      {move:"Make it a thought, not an ask",ask:"Rewrite your CTA as something you'd say to one friend.",                      push:"If it still sounds like a request, drop the verb."},
      {move:"Give them the reason",  ask:"Why would someone follow you after this specific video? Say that.",                  push:"'More content like this' is not a reason."},
      {move:"Leave it open",         ask:"What question does this video raise that you didn't answer?",                        push:"End there. The unanswered part is what gets shared."},
    ],
    "TikTok":[
      {move:"Invite the story back", ask:"What experience are you hoping someone tells you about?",                            push:"Ask for that story specifically, not for 'thoughts'."},
    ],
    "Instagram Reels":[
      {move:"Worth saving",          ask:"What makes this worth keeping? Say it plainly.",                                     push:"Naming the reason to save works better than asking for the save."},
    ],
    "YouTube":[
      {move:"Next step from the content",ask:"What should they do with what they just learned?",                              push:"Tie it to the video, not to the channel."},
    ],
    "LinkedIn":[
      {move:"Start the argument",    ask:"What would you want a stranger to push back on?",                                    push:"Comments drive reach here. Agreement doesn't produce comments."},
    ],
  },
  notes:{
    _base:[
      {move:"Name the tone",         ask:"In three words, how should this sound? Write them down.",                            push:"Check each take against those three words before you move on."},
      {move:"Where you'll rush",     ask:"Which line will you speed through when the camera's on?",                            push:"Mark it. That's the one to slow down and re-take."},
      {move:"The one shot you need", ask:"If only one shot comes out right, which is it?",                                     push:"Film that one first, while you still have energy."},
      {move:"What's in frame",       ask:"What's behind you? Decide now, not on the day.",                                     push:"Also decide where the light is coming from."},
    ],
  },
};

// Single words are fair game to insert — they're vocabulary, not content.

const POWER_WORDS=["Honest","Real","Unfiltered","Raw","Nobody tells you","The truth about",
  "What actually","Finally","Behind the scenes","Before and after","The real reason","Quietly"];

// ── GENERIC CHANNEL INSIGHTS ──────────────────────────────────────────────────

const GENERIC_INSIGHTS={
  "TikTok":[
    {insight:"Open in the middle of a moment",sub:"Skip the setup — viewers decide in the first 2 seconds"},
    {insight:"Raw beats produced",sub:"Authentic, imperfect video outperforms polished content"},
    {insight:"Under 45 seconds is the sweet spot",sub:"Completion rate drops sharply after 60s on most accounts"},
    {insight:"Talk to one person, not an audience",sub:"Intimate tone drives saves and shares more than energy"},
    {insight:"The CTA should feel like a thought, not an ask",sub:"'Let me know if this happened to you' beats 'comment below'"},
  ],
  "Instagram Reels":[
    {insight:"The first frame is a visual decision",sub:"Before they hear anything, they've decided to watch or scroll"},
    {insight:"Saves signal real resonance",sub:"A saved Reel reaches farther than a liked one"},
    {insight:"Aesthetic and message should be the same thing",sub:"The feeling of the video is part of the content"},
    {insight:"One clear idea per Reel",sub:"Multi-point content underperforms on Reels vs TikTok"},
    {insight:"Captions matter more here",sub:"60%+ of Instagram Reels are watched without sound"},
  ],
  "YouTube":[
    {insight:"The title and thumbnail make the watch happen",sub:"The video itself keeps them — the packaging gets the click"},
    {insight:"The first 30 seconds need to pay off the title",sub:"Front-load the value, don't tease it"},
    {insight:"Watch time is the currency",sub:"A 10-min video at 70% watched beats a 3-min at 40%"},
    {insight:"Chapters improve retention",sub:"Viewers skip to what they need — that's not a bad thing"},
    {insight:"Subscribe CTAs work best mid-video",sub:"After value delivered, before the wrap-up"},
  ],
  "LinkedIn":[
    {insight:"The first line is the whole battle",sub:"Only the first 2 lines show before 'see more'"},
    {insight:"Earned insight outperforms advice",sub:"What you learned the hard way beats what you've read"},
    {insight:"Numbers in the first line stop the scroll",sub:"Specific beats vague every time"},
    {insight:"Comments drive reach more than likes",sub:"Write to provoke a response, not agreement"},
    {insight:"Post when your audience is at work",sub:"Tuesday–Thursday 8–10am consistently outperforms other windows"},
  ],
};


// ── AI BOX ICON ───────────────────────────────────────────────────────────────

const QUICK_STARTS=[
  "Product launch campaign",
  "Seasonal holiday campaign",
  "Brand awareness on TikTok",
  "Creator collaboration series",
  "New brand content strategy",
];

const THUMB_COLORS=["#667eea,#764ba2","#f093fb,#f5576c","#4facfe,#00f2fe","#43e97b,#38f9d7","#fa709a,#fee140","#a18cd1,#fbc2eb","#ffecd2,#fcb69f","#ff9a9e,#fecfef","#96fbc4,#f9f586","#f6d365,#fda085","#89f7fe,#66a6ff","#fddb92,#d1fdff"];

const CAMPAIGN_PLATFORMS=["TikTok","Instagram Reels","YouTube Shorts","YouTube","Facebook","LinkedIn"];

// A result is only shown if its URL is real and lives on the chosen platform's own
// domain. Models will invent plausible-looking links, so anything unverifiable is dropped.

const PLATFORM_DOMAINS={
  "TikTok":["tiktok.com"],
  "Instagram Reels":["instagram.com"],
  "YouTube Shorts":["youtube.com","youtu.be"],
  "YouTube":["youtube.com","youtu.be"],
  "Facebook":["facebook.com","fb.watch"],
  "LinkedIn":["linkedin.com"],
};

const SEARCH_ANGLES=[
  "the most viewed and most widely shared examples",
  "smaller creators or brands that broke out unexpectedly with this",
  "examples from the last few months specifically",
  "examples known for a strong hook in the opening seconds",
  "examples that led with a demonstration or a result",
  "examples where the creator talks straight to camera",
];


// ── CAMPAIGN INSIGHTS ─────────────────────────────────────────────────────────
// Derived from the references the user actually picked, not asked of the model.

const BP_QUESTIONS = [
  {
    key: "businessName",
    label: "What's your business called?",
    hint: "The name you go by publicly",
    placeholder: "Iron Forge CrossFit — Austin, TX",
    type: "text",
  },
  {
    key: "whatYouDo",
    label: "Describe what your business does in one sentence",
    hint: "Be specific — this shapes the creative directions the platform suggests",
    placeholder: "A CrossFit gym in Austin, TX helping competitive athletes reach their peak",
    type: "text",
  },
  {
    key: "audience",
    label: "Who are you talking to?",
    hint: "Your ideal customer or follower",
    placeholder: "25–40 year olds interested in fitness who have never tried CrossFit",
    type: "text",
  },
  {
    key: "goal",
    label: "What's your main goal with content?",
    hint: "What do you want people to do after watching?",
    placeholder: "Get people to book a free trial class at our gym",
    type: "text",
  },
  {
    key: "tone",
    label: "How does your brand sound?",
    hint: "This keeps the AI consistent with your voice",
    placeholder: "Real, educational, and community-focused — never salesy",
    type: "text",
  },
];

const CLIENT_QUESTIONS = [
  {key:"whatTheyDo",  label:"What does this client do?",         hint:"One sentence about their business",                   placeholder:"A boutique gym in Austin helping busy professionals get fit"},
  {key:"audience",    label:"Who is their target audience?",      hint:"Who watches or buys from them",                      placeholder:"25-40 year old professionals who want to work out but have no time"},
  {key:"goal",        label:"What is their content goal?",        hint:"What should viewers do after watching?",             placeholder:"Book a free trial class or visit the gym"},
  {key:"tone",        label:"How does their brand sound?",        hint:"Describe their voice — this shapes the creative directions suggested for their content", placeholder:"Energetic and motivating, never pushy or corporate"},
];

export { AGENCY_STAGES, BP_QUESTIONS, CAMPAIGN_PLATFORMS, CLIENT_QUESTIONS, CTAS, FORMATS, GENERIC_INSIGHTS, HOOKS, PLATFORMS, PLATFORM_DOMAINS, POWER_WORDS, QUICK_STARTS, SCRIPT_MOVES, SEARCH_ANGLES, STAGES, THUMB_COLORS };
