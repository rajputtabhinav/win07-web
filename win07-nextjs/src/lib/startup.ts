// Startup script for WIN07 AI Agent System
import { adminAI } from './ai-agent'
import { initializeWebSocketServer } from './websocket-server'

let isInitialized = false

export async function initializeAISystem() {
  if (isInitialized) {
    console.log('🤖 AI System already initialized')
    return
  }

  try {
    console.log('🚀 Initializing WIN07 AI Agent System...')
    
    // Initialize WebSocket server for real-time updates
    const port = parseInt(process.env.WEBSOCKET_PORT || '8080')
    initializeWebSocketServer(port)
    
    // AdminAI is automatically initialized when imported
    console.log('✅ AI Agent System initialized successfully')
    console.log(`📡 WebSocket server running on port ${port}`)
    console.log('🎯 Admin dashboard ready for real-time updates')
    
    isInitialized = true
    
    return {
      success: true,
      message: 'AI Agent System initialized',
      websocketPort: port,
      features: [
        'Real-time user management',
        'AI-powered analytics',
        'Transaction monitoring',
        'Predictive intelligence',
        'WebSocket updates'
      ]
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize AI System:', error)
    return {
      success: false,
      error: 'Failed to initialize AI Agent System',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Auto-initialize when imported (for development)
if (process.env.NODE_ENV === 'development') {
  initializeAISystem()
}
