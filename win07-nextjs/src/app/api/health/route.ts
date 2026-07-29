import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/mongodb'

export async function GET() {
  try {
    const health = await checkDatabaseHealth()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: health,
      version: '2.0.0-mongodb'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      version: '2.0.0-mongodb'
    }, { status: 500 })
  }
}