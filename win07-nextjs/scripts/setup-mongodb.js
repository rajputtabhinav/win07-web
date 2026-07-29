// Simple setup script for MongoDB
// This script creates the initial database structure and indexes

const { MongoClient } = require('mongodb')

const MONGODB_URI = 'mongodb://127.0.0.1:27017/win07_platform'

async function setupMongoDB() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('win07_platform')
    
    // Create collections with proper indexes
    console.log('📦 Creating collections and indexes...')
    
    // Users collection
    const usersCollection = db.collection('users')
    await usersCollection.createIndex({ clerkUserId: 1 }, { unique: true })
    await usersCollection.createIndex({ userEmail: 1 })
    await usersCollection.createIndex({ tier: 1 })
    await usersCollection.createIndex({ totalWon: -1 })
    await usersCollection.createIndex({ totalDeposits: -1 })
    console.log('✅ Users collection indexes created')
    
    // Transactions collection
    const transactionsCollection = db.collection('transactions')
    await transactionsCollection.createIndex({ userId: 1, type: 1 })
    await transactionsCollection.createIndex({ clerkUserId: 1, createdAt: -1 })
    await transactionsCollection.createIndex({ type: 1, status: 1 })
    await transactionsCollection.createIndex({ game: 1, type: 1 })
    await transactionsCollection.createIndex({ createdAt: -1 })
    console.log('✅ Transactions collection indexes created')
    
    // Referrals collection
    const referralsCollection = db.collection('referrals')
    await referralsCollection.createIndex({ referrerClerkId: 1, status: 1 })
    await referralsCollection.createIndex({ referredClerkId: 1 }, { unique: true })
    await referralsCollection.createIndex({ referralCode: 1, status: 1 })
    console.log('✅ Referrals collection indexes created')
    
    // Withdrawal requests collection
    const withdrawalRequestsCollection = db.collection('withdrawalrequests')
    await withdrawalRequestsCollection.createIndex({ clerkUserId: 1, status: 1 })
    await withdrawalRequestsCollection.createIndex({ status: 1, createdAt: 1 })
    await withdrawalRequestsCollection.createIndex({ amount: -1 })
    console.log('✅ Withdrawal requests collection indexes created')
    
    console.log('🎉 MongoDB setup completed successfully!')
    
    // Show collection stats
    const collections = await db.collections()
    console.log('📊 Database collections:')
    for (const collection of collections) {
      const count = await collection.countDocuments()
      console.log(`  - ${collection.collectionName}: ${count} documents`)
    }
    
  } catch (error) {
    console.error('❌ Error setting up MongoDB:', error)
  } finally {
    await client.close()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run the setup
setupMongoDB().catch(console.error)
