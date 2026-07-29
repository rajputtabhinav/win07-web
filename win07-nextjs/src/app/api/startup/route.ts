// Database Startup API - Initialize MongoDB system
import { NextResponse } from 'next/server'
import { initializeDatabaseSystem, performHealthCheck } from '@/lib/database-startup'

export async function POST() {
  try {
    console.log('🚀 Starting database initialization...')
    
    // Initialize database system
    await initializeDatabaseSystem()
    
    // Perform health check
    const health = await performHealthCheck()
    
    return NextResponse.json({
      success: true,
      message: 'Database system initialized successfully',
      health,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Database startup failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const health = await performHealthCheck()
    
    return NextResponse.json({
      status: health.connected ? 'healthy' : 'unhealthy',
      health,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
