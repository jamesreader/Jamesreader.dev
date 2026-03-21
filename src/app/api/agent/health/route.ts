const BACKEND_URL = process.env.AGENT_BACKEND_URL || 'http://daedalus:8100';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return Response.json(
        { status: 'error', message: 'Backend unhealthy' },
        { status: 502 },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { status: 'error', message: 'Backend unreachable' },
      { status: 502 },
    );
  }
}
