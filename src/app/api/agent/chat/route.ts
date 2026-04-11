import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://100.112.124.72:8100';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => 'Unknown error');
      return new Response(errText, { status: res.status });
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Chat proxy error:', error);
    return new Response(
      'data: {"type":"text","content":"Sorry, I couldn\'t reach the backend. Please try again."}\n\ndata: [DONE]\n\n',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
        },
      },
    );
  }
}
