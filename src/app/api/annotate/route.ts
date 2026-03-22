import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://daedalus:8100'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/annotate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Annotation proxy error:', error)
    return Response.json(
      { annotation: null, error: 'Service unavailable' },
      { status: 500 }
    )
  }
}