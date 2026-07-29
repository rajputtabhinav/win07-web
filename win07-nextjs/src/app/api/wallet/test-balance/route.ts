import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  try {
    console.log('🧪 Test balance endpoint called')
    
    const { userId } = getAuth(req)
    console.log('User ID from auth:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simple test response without AI agent
    return NextResponse.json({
      success: true,
      userId,
      cashBalance: 1000,
      bonusBalance: 899,
      message: 'Test balance endpoint working'
    })
    
  } catch (error) {
    console.error('Test balance endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test balance failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
