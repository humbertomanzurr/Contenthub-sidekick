export const config = {
  runtime: 'edge',
  maxDuration: 60, // extend to 60s for web search calls
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, systemPrompt, useWebSearch } = await req.json();

    const body = {
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    };

    if (useWebSearch) {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    }

    // 55s timeout — under Vercel's 60s limit
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify(body),
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' },
    });

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
