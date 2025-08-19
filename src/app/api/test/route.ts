import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('=== Test API Endpoint Called ===')
  
  const testData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasPostHogKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
      hasPostHogHost: !!process.env.NEXT_PUBLIC_POSTHOG_HOST,
    },
    apiInfo: {
      method: 'GET',
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    }
  }
  
  console.log('Test endpoint response:', testData)
  
  return NextResponse.json(testData)
}

export async function POST(request: NextRequest) {
  console.log('=== Test API POST Endpoint Called ===')
  
  try {
    const body = await request.json()
    console.log('Received POST body:', body)
    
    const testData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      receivedData: body,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasPostHogKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
        hasPostHogHost: !!process.env.NEXT_PUBLIC_POSTHOG_HOST,
      }
    }
    
    console.log('Test POST endpoint response:', testData)
    
    return NextResponse.json(testData)
  } catch (error) {
    console.error('Test POST endpoint error:', error)
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    )
  }
}
