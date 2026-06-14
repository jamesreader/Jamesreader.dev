import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://100.112.124.72:8100';
const FETCH_TIMEOUT_MS = 120_000;  // total timeout for upstream connection + stream
const IDLE_TIMEOUT_MS = 45_000;    // idle timeout: emit fallback if no data in this window

const SSE_FALLBACK_ERROR =
  'data: {"type":"text","content":"The backend is not responding with content. Please try again."}\n\ndata: [DONE]\n\n';

const SSE_FALLBACK_UNREACHABLE =
  'data: {"type":"text","content":"Sorry, I couldn\'t reach the backend. Please try again."}\n\ndata: [DONE]\n\n';

/** Wrap a ReadableStream so it emits an SSE fallback error if idle for too long or
 *  if no text-type chunks arrive before the stream closes. */
function wrapWithIdleTimeout(
  upstream: ReadableStream<Uint8Array>,
  idleMs: number,
): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let hasSentContent = false;
  let timedOut = false;

  const encoder = new TextEncoder();

  function clearIdleTimer() {
    if (idleTimer !== null) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  function startIdleTimer(controller: ReadableStreamDefaultController<Uint8Array>) {
    clearIdleTimer();
    idleTimer = setTimeout(() => {
      timedOut = true;
      try {
        controller.enqueue(encoder.encode(SSE_FALLBACK_ERROR));
      } catch {
        // controller may already be closed
      }
      try {
        controller.close();
      } catch {
        // noop
      }
    }, idleMs);
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        startIdleTimer(controller);

        while (true) {
          const { done, value } = await reader.read();
          clearIdleTimer();

          if (timedOut) break;
          if (done) {
            // Stream ended — if no content was ever received, inject fallback
            if (!hasSentContent) {
              try {
                controller.enqueue(encoder.encode(SSE_FALLBACK_ERROR));
              } catch {
                // silenced
              }
            }
            controller.close();
            break;
          }

          if (value && value.length > 0) {
            // Check if this chunk contains text-type content (optimistic SSE scan)
            const text = new TextDecoder().decode(value);
            if (!hasSentContent && /"type"\s*:\s*"text"/.test(text)) {
              hasSentContent = true;
            }
            controller.enqueue(value);
          }

          // Reset idle timer for next chunk
          startIdleTimer(controller);
        }
      } catch {
        try { controller.close(); } catch { /* noop */ }
      } finally {
        clearIdleTimer();
        try { reader.releaseLock(); } catch { /* noop */ }
      }
    },

    cancel() {
      clearIdleTimer();
      try { reader.cancel(); } catch { /* noop */ }
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(fetchTimeout);
    }

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => 'Unknown error');
      return new Response(errText, { status: res.status });
    }

    // Wrap with idle timeout to prevent silent hangs
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
    console.error('Chat proxy error:', error);
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
