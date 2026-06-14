import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://daedalus:8100';
const FETCH_TIMEOUT_MS = 120_000;
const IDLE_TIMEOUT_MS = 45_000;

const SSE_FALLBACK_ERROR =
  'data: {"type":"text","content":"The evaluation service is not responding with content. Please try again."}\n\ndata: [DONE]\n\n';

const SSE_FALLBACK_UNREACHABLE =
  'data: {"type":"text","content":"Sorry, I couldn\'t reach the evaluation service. Please try again."}\n\ndata: [DONE]\n\n';

/** Wrap a ReadableStream so it emits an SSE fallback if idle too long or
 *  closes with no text content. */
function wrapWithIdleTimeout(
  upstream: ReadableStream<Uint8Array>,
  idleMs: number,
): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let hasSentContent = false;
  let timedOut = false;
  const encoder = new TextEncoder();

  function clearIdle() {
    if (idleTimer !== null) { clearTimeout(idleTimer); idleTimer = null; }
  }

  function startIdle(controller: ReadableStreamDefaultController<Uint8Array>) {
    clearIdle();
    idleTimer = setTimeout(() => {
      timedOut = true;
      try { controller.enqueue(encoder.encode(SSE_FALLBACK_ERROR)); } catch { /* noop */ }
      try { controller.close(); } catch { /* noop */ }
    }, idleMs);
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        startIdle(controller);
        while (true) {
          const { done, value } = await reader.read();
          clearIdle();
          if (timedOut) break;
          if (done) {
            if (!hasSentContent) {
              try { controller.enqueue(encoder.encode(SSE_FALLBACK_ERROR)); } catch { /* noop */ }
            }
            controller.close();
            break;
          }
          if (value && value.length > 0) {
            if (!hasSentContent && /"type"\s*:\s*"text"/.test(new TextDecoder().decode(value))) {
              hasSentContent = true;
            }
            controller.enqueue(value);
          }
          startIdle(controller);
        }
      } catch {
        try { controller.close(); } catch { /* noop */ }
      } finally {
        clearIdle();
        try { reader.releaseLock(); } catch { /* noop */ }
      }
    },
    cancel() {
      clearIdle();
      try { reader.cancel(); } catch { /* noop */ }
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let backendUrl: string;
    let fetchOptions: RequestInit;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      backendUrl = `${BACKEND_URL}/api/evaluate/upload`;
      fetchOptions = { method: 'POST', body: formData };
    } else {
      const body = await request.json();
      backendUrl = `${BACKEND_URL}/api/evaluate`;
      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      };
    }

    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(backendUrl, { ...fetchOptions, signal: controller.signal });
    } finally {
      clearTimeout(fetchTimeout);
    }

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => 'Unknown error');
      return new Response(errText, { status: res.status });
    }

    const wrappedBody = wrapWithIdleTimeout(res.body, IDLE_TIMEOUT_MS);

    return new Response(wrappedBody, {
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
    const body =
      error instanceof Error && error.name === 'AbortError'
        ? SSE_FALLBACK_ERROR
        : SSE_FALLBACK_UNREACHABLE;
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  }
}
