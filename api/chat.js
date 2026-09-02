// Node serverless runtime, NOT edge.
// Edge functions must start responding within ~25s, and a single Anthropic
// web-search call regularly needs longer than that — every call was being
// killed at the ceiling. Node functions allow a much longer duration.
export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const started = Date.now();

  try {
    // The Node runtime parses JSON bodies for us, but be tolerant either way.
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { messages, systemPrompt, useWebSearch, allowedDomains, maxUses, feature } = payload;

    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages is required' });
    }

    // Fail loudly rather than letting Anthropic return a confusing 401.
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY is not set on this deployment',
        ms: Date.now() - started,
      });
    }

    // ── WHO IS ASKING ────────────────────────────────────────────────────
    // Every call here costs real money -- a search-enabled one runs about
    // 25 cents -- so this endpoint must not answer strangers. It was open to
    // the whole internet: an unauthenticated POST returned 200 and spent the
    // account's credit, with nothing bounding the bill but obscurity.
    //
    // Verification is a round trip to Supabase rather than a local signature
    // check, so it needs no new secret: the URL and anon key are the same
    // public pair that already ships in the browser bundle. It costs ~100ms,
    // which is nothing beside a 20-50s model call.
    const SB_URL = process.env.SUPABASE_URL;
    const SB_ANON = process.env.SUPABASE_ANON_KEY;
    if (!SB_URL || !SB_ANON) {
      return res.status(500).json({
        error: 'SUPABASE_URL / SUPABASE_ANON_KEY are not set on this deployment',
        ms: Date.now() - started,
      });
    }

    const authHeader = req.headers.authorization || '';
    const sessionToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';
    if (!sessionToken) {
      return res.status(401).json({
        error: 'Sign in to use this feature.',
        ms: Date.now() - started,
      });
    }

    // Don't let a slow auth check eat the whole request budget.
    const authCtl = new AbortController();
    const authTimer = setTimeout(() => authCtl.abort(), 8000);
    let who;
    try {
      who = await fetch(`${SB_URL}/auth/v1/user`, {
        signal: authCtl.signal,
        headers: { apikey: SB_ANON, Authorization: `Bearer ${sessionToken}` },
      });
    } catch (e) {
      // A throw here is almost never the network — it is the config. An
      // invalid URL and a header value carrying a stray newline both fail
      // instantly and identically, so name the cause instead of hiding it.
      const detail = (e && e.message) || String(e);
      const suspectUrl = !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SB_URL);
      const suspectKey = /\s/.test(SB_ANON);
      return res.status(503).json({
        error: 'Could not verify your session.',
        detail: String(detail).slice(0, 200),
        // Config shape, never the values themselves.
        supabaseUrlLooksWrong: suspectUrl,
        supabaseKeyHasWhitespace: suspectKey,
        urlLength: String(SB_URL || '').length,
        keyLength: String(SB_ANON || '').length,
        ms: Date.now() - started,
      });
    } finally {
      clearTimeout(authTimer);
    }

    // The auth check already fetched the user; keep the id so usage can be
    // attributed without a second round trip.
    let callerId = null;
    if (who.ok) {
      try { callerId = (await who.clone().json()).id || null; } catch (e) {}
    }

    if (!who.ok) {
      // Almost always an expired session rather than a real intruder, so say
      // the thing the user can act on.
      return res.status(401).json({
        error: 'Your session has expired. Sign out and back in.',
        ms: Date.now() - started,
      });
    }

    const body = {
      model: 'claude-opus-5',
      // Thinking is on by default on this model, and thinking tokens count
      // toward max_tokens — the old 8192/2048 pair would truncate mid-answer.
      max_tokens: useWebSearch ? 16000 : 4096,
      // Everything this endpoint does is retrieval and short answers, never
      // deep reasoning, so buy the least thinking that does the job. This is
      // what keeps latency near where it was before the model change.
      output_config: { effort: 'low' },
      system: systemPrompt,
      messages,
    };

    if (useWebSearch) {
      const tool = {
        // Dynamic filtering. Needs no anthropic-beta header — the header is
        // what was causing 400s back when this ran on the older tool version.
        type: 'web_search_20260209',
        name: 'web_search',
        max_uses: maxUses || 3,
      };
      // Pinning the domain is what makes results usable: without it the search
      // returns articles *about* videos, which carry no on-platform URL.
      if (Array.isArray(allowedDomains) && allowedDomains.length) {
        tool.allowed_domains = allowedDomains;
      }
      body.tools = [tool];
    }

    // Stop ourselves before the platform does, so the client always gets JSON
    // instead of Vercel's plain-text error page.
    const controller = new AbortController();
    // 20s was chosen for a non-thinking model. A short Script-panel question
    // now measures ~14s, which left almost no headroom; maxDuration is 60.
    const budget = useWebSearch ? 50000 : 40000;
    const timeout = setTimeout(() => controller.abort(), budget);

    let response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });
    } finally {
      clearTimeout(timeout);
    }

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return res.status(502).json({
        error: `Upstream returned non-JSON (${response.status})`,
        ms: Date.now() - started,
      });
    }

    if (!response.ok) {
      const detail = (data && data.error && data.error.message) || JSON.stringify(data);
      return res.status(response.status).json({
        error: String(detail).slice(0, 300),
        status: response.status,
        ms: Date.now() - started,
      });
    }

    // A refusal arrives as a normal 200 with empty text, so without this the
    // client would show a blank answer and no reason for it.
    if (data.stop_reason === 'refusal') {
      return res.status(200).json({
        content: '',
        refused: true,
        error: 'The model declined this request.',
        searchCalls: 0,
        ms: Date.now() - started,
        stopReason: 'refusal',
      });
    }

    const blocks = Array.isArray(data.content) ? data.content : [];
    const text = blocks
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    // Lets the client tell "searched and found nothing" apart from "never searched".
    const searchCalls = blocks.filter(b => b.type === 'server_tool_use').length;

    // ...but a search that ERRORS also counts as an attempt, so searchCalls
    // alone reported "searched 5 times" for five failures and no results.
    // Server tools never throw: a failure is an ordinary 200 whose result
    // block holds an error object instead of the usual array of hits.
    // Seen once against allowed_domains ['tiktok.com'], and not reproducible
    // on repeat runs -- so treat these as transient. They still burn the
    // max_uses budget when they happen, which is what turns one bad moment
    // into an answer with no results at all.
    const searchResults = blocks.filter(b => b.type === 'web_search_tool_result');
    const searchErrors = searchResults
      .map(b => (b.content && !Array.isArray(b.content) && b.content.error_code) || null)
      .filter(Boolean);

    // searchErrors only ever caught the blocks that carried an error object,
    // so a search returning zero hits looked exactly like one returning ten.
    // "Searched 7 times" was true and useless. Per-search outcomes are the
    // difference between "the web has nothing" and "the tool never ran".
    const searchDetail = searchResults.map(b => Array.isArray(b.content)
      ? { results: b.content.length }
      : { error: (b.content && b.content.error_code) || 'unknown' });

    // Record what this cost. Awaited, not fire-and-forget: this runs on Vercel,
    // where the function is frozen the moment the response is sent, so an
    // in-flight request that has not resolved is simply dropped. That is why
    // the first version of this logged nothing at all. The abort keeps a slow
    // or broken database from ever hanging a good answer, and a failure is
    // logged rather than swallowed — silent logging is worse than none, because
    // an empty table reads as "nothing happened" instead of "this is broken".
    // Raw counts only: rates change, and a stored dollar figure goes stale with
    // no way to recompute it.
    if (callerId) {
      const ac = new AbortController();
      const killLog = setTimeout(() => ac.abort(), 2500);
      try {
        const lg = await fetch(`${SB_URL}/rest/v1/ai_usage`, {
          signal: ac.signal,
          method: 'POST',
          headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}`,
                     'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({
            user_id: callerId,
            feature: typeof feature === 'string' ? feature.slice(0, 40) : null,
            model: body.model,
            input_tokens: (data.usage && data.usage.input_tokens) || 0,
            output_tokens: (data.usage && data.usage.output_tokens) || 0,
            cache_read: (data.usage && data.usage.cache_read_input_tokens) || 0,
            web_searches: (data.usage && data.usage.server_tool_use
              && data.usage.server_tool_use.web_search_requests) || 0,
            ms: Date.now() - started,
            ok: true,
          }),
        });
        if (!lg.ok) {
          console.error('ai_usage insert failed:', lg.status, (await lg.text()).slice(0, 300));
        }
      } catch (e) {
        console.error('ai_usage insert threw:', e.name === 'AbortError' ? 'timed out after 2.5s' : e.message);
      } finally {
        clearTimeout(killLog);
      }
    }

    return res.status(200).json({
      content: text,
      searchCalls,
      searchErrors,
      searchDetail,
      // What this call actually cost, passed straight through. Billable web
      // searches are counted separately from searchCalls because a search
      // that errors is not billed, and because search carries a per-request
      // charge on top of tokens. Without this there is no way to answer
      // "what does a user cost us a month", which is what pricing depends on.
      usage: data.usage ? {
        input: data.usage.input_tokens || 0,
        output: data.usage.output_tokens || 0,
        cacheRead: data.usage.cache_read_input_tokens || 0,
        cacheWrite: data.usage.cache_creation_input_tokens || 0,
        webSearches: (data.usage.server_tool_use
          && data.usage.server_tool_use.web_search_requests) || 0,
      } : null,
      ms: Date.now() - started,
      stopReason: data.stop_reason || null,
    });

  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? `Timed out after ${Date.now() - started}ms` : (err.message || 'Unknown error'),
      timeout: isTimeout,
      ms: Date.now() - started,
    });
  }
}
