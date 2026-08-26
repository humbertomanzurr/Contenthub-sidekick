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
    const { messages, systemPrompt, useWebSearch, allowedDomains, maxUses } = payload;

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
    const budget = useWebSearch ? 50000 : 20000;
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

    return res.status(200).json({
      content: text,
      searchCalls,
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
