// Database Startup and Initialization
import { connectMongoose, initializeDatabase } from './mongodb'
import { databaseService } from './database-service'

export async function initializeDatabaseSystem() {
  try {
    console.log('🚀 Initializing database system...')
    
    // Connect to MongoDB
    await connectMongoose()
    
    // Initialize database with indexes
    await initializeDatabase()
    
    // Initialize database service
    console.log('✅ Database system initialized successfully')
    
    return true
  } catch (error) {
    console.error('❌ Database system initialization failed:', error)
    throw error
  }
}

// Health check function
export async function performHealthCheck() {
  try {
    const health = await require('./mongodb').checkDatabaseHealth()
    console.log('📊 Database Health:', health)
    return health
  } catch (error) {
    console.error('❌ Health check failed:', error)
    return { connected: false, collections: [], error: error.message }
  }
}
