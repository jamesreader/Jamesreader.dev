import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://daedalus:8100';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      return Response.json(
        { error: 'Backend init failed', detail: errText },
        { status: res.status },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: 'Backend unreachable' },
      { status: 502 },
    );
  }
}
