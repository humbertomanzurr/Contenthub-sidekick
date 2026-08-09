export const config = {
  runtime: 'edge',
  maxDuration: 60,
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const {
      messages,
      systemPrompt,
      useWebSearch,
      allowedDomains,
      maxUses,
    } = await req.json();

    const body = {
      model: 'claude-sonnet-4-6',
      max_tokens: useWebSearch ? 8192 : 2048,
      system: systemPrompt,
      messages,
    };

    if (useWebSearch) {
      const tool = {
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: maxUses || 4,
      };
      // Pinning the domain is what makes results usable: without it the search
      // returns articles *about* videos, which carry no on-platform URL.
      if (Array.isArray(allowedDomains) && allowedDomains.length) {
        tool.allowed_domains = allowedDomains;
      }
      body.tools = [tool];
    }

    const controller = new AbortController();
    // Must fire BEFORE the platform's own limit, otherwise Vercel kills the
    // function and returns a plain-text error page instead of our JSON.
    const budget = useWebSearch ? 20000 : 15000;
    const timeout = setTimeout(() => controller.abort(), budget);

    // No anthropic-beta header — web_search_20250305 is generally available.
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      const detail =
        (data && data.error && data.error.message) ||
        (typeof data === 'string' ? data : JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: detail, status: response.status }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const blocks = Array.isArray(data.content) ? data.content : [];
    const text = blocks
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    // Surfaced so the client can tell "search ran and found nothing" apart
    // from "search never ran".
    const searchCalls = blocks.filter(b => b.type === 'server_tool_use').length;

    return new Response(
      JSON.stringify({
        content: text,
        searchCalls,
        stopReason: data.stop_reason || null,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return new Response(JSON.stringify({
      error: isTimeout ? 'Request timed out — try again' : err.message,
      timeout: isTimeout,
    }), {
      status: isTimeout ? 504 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
