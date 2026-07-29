import { NextRequest } from 'next/server'
import { initializeWebSocketServer } from '@/lib/websocket-server'

export async function GET(req: NextRequest) {
  try {
    // Initialize WebSocket server if not already running
    const wss = initializeWebSocketServer(8080)
    
    return new Response(JSON.stringify({
      success: true,
      message: 'WebSocket server initialized for admin real-time updates',
      port: 8080,
      connections: wss.clients.size
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error initializing WebSocket server:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to initialize WebSocket server'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
