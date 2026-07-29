import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Test endpoint called')
    console.log('Environment check:')
    console.log('- CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? '✅ Present' : '❌ Missing')
    console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Present' : '❌ Missing')
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      env: {
        clerk: !!process.env.CLERK_SECRET_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
