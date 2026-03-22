import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://daedalus:8100';

// Parse directive patterns like [[scroll:projects]] from text
function parseDirectives(text: string) {
  const directivePattern = /\[\[([^:]+):([^\]]+)\]\]/g;
  const directives = [];
  let match;

  while ((match = directivePattern.exec(text)) !== null) {
    directives.push({
      type: match[1], // scroll, highlight, show-project
      target: match[2], // section id, project id, etc
    });
  }

  return directives;
}

// Remove directive tags from text
function stripDirectives(text: string): string {
  return text.replace(/\[\[([^:]+):([^\]]+)\]\]/g, '');
}

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

    // Transform the stream to parse directives
    const reader = res.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  // Before ending, check for any directives in the full response
                  if (fullResponse) {
                    const directives = parseDirectives(fullResponse);
                    for (const directive of directives) {
                      const directiveEvent = `data: ${JSON.stringify({
                        type: 'directive',
                        directive: directive.type,
                        target: directive.target,
                      })}\n\n`;
                      controller.enqueue(encoder.encode(directiveEvent));
                    }
                  }
                  controller.enqueue(value);
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'text' && parsed.content) {
                    fullResponse += parsed.content;
                    
                    // Strip directives from the text content before sending to client
                    const cleanContent = stripDirectives(parsed.content);
                    if (cleanContent) {
                      const cleanEvent = `data: ${JSON.stringify({
                        ...parsed,
                        content: cleanContent
                      })}\n\n`;
                      controller.enqueue(encoder.encode(cleanEvent));
                    }
                  } else {
                    // Pass through other event types unchanged
                    controller.enqueue(value);
                  }
                } catch {
                  // Not valid JSON, pass through as-is
                  controller.enqueue(value);
                }
              } else {
                // Non-data line, pass through
                controller.enqueue(encoder.encode(line + '\n'));
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
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