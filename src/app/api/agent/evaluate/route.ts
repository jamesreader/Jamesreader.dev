import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://daedalus:8100';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let backendUrl: string;
    let fetchOptions: RequestInit;

    if (contentType.includes('multipart/form-data')) {
      // File upload — proxy FormData to /api/evaluate/upload
      const formData = await request.formData();
      backendUrl = `${BACKEND_URL}/api/evaluate/upload`;
      fetchOptions = {
        method: 'POST',
        body: formData,
      };
    } else {
      // JSON body — proxy to /api/evaluate
      const body = await request.json();
      backendUrl = `${BACKEND_URL}/api/evaluate`;
      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      };
    }

    const res = await fetch(backendUrl, fetchOptions);

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => 'Unknown error');
      return new Response(errText, { status: res.status });
    }

    // Passthrough the SSE stream — content blocks are parsed client-side
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
    console.error('Evaluate proxy error:', error);
    return new Response(
      'data: {"type":"text","content":"Sorry, I couldn\'t reach the evaluation service. Please try again."}\n\ndata: [DONE]\n\n',
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
