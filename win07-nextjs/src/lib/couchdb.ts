import Nano from 'nano'
import { v4 as uuidv4 } from 'uuid'

// Environment variables
const COUCHDB_URL = process.env.COUCHDB_URL || 'http://admin:password@127.0.0.1:5984'
const COUCHDB_DATABASE = process.env.COUCHDB_DATABASE || 'win07_platform'

if (!COUCHDB_URL) {
  throw new Error('Please define the COUCHDB_URL environment variable inside .env.local')
}

// Initialize CouchDB connection
const nano = Nano(COUCHDB_URL)

// Database instance
let couchdb: Nano.DocumentScope<any>

// Global variable to cache the connection across hot reloads in development
let cached = (global as any).couchdb

if (!cached) {
  cached = (global as any).couchdb = { db: null, promise: null }
}

// CouchDB Connection Manager
export async function connectToCouchDB(): Promise<Nano.DocumentScope<any> | null> {
  if (cached.db) {
    return cached.db
  }

  if (!cached.promise) {
    cached.promise = initializeCouchDB().catch((error) => {
      console.error('❌ CouchDB connection error:', error.message || error)
      // For development: don't crash the app, just log the error
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Continuing without database for development...')
        return null
      }
      throw error
    })
  }

  try {
    cached.db = await cached.promise
  } catch (e) {
    cached.promise = null
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Database unavailable - some features may not work')
      return null
    }
    throw e
  }

  return cached.db
}

// Initialize CouchDB database and create necessary design documents
async function initializeCouchDB(): Promise<Nano.DocumentScope<any> | null> {
  try {
    // For development: Log connection attempts (hide credentials)
    console.log('🔗 Attempting to connect to CouchDB:', COUCHDB_URL.replace(/\/\/.*@/, '//***:***@'))
    
    // Check if database exists, create if it doesn't
    try {
      await nano.db.get(COUCHDB_DATABASE)
      console.log('✅ Connected to existing CouchDB database:', COUCHDB_DATABASE)
    } catch (error: any) {
      if (error.statusCode === 404) {
        await nano.db.create(COUCHDB_DATABASE)
        console.log('✅ Created new CouchDB database:', COUCHDB_DATABASE)
      } else {
        throw error
      }
    }

    couchdb = nano.use(COUCHDB_DATABASE)

    // Create design documents for views (indexes)
    await createDesignDocuments()

    return couchdb
  } catch (error: any) {
    console.error('❌ CouchDB initialization error:', error.message || error)
    
    // For development: Don't crash, return null to use mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 CouchDB not available - API will use mock data for development')
      return null
    }
    
    throw error
  }
}

// Create CouchDB design documents (views) for indexing and queries
async function createDesignDocuments() {
  try {
    // Users design document
    const usersDesign = {
      _id: '_design/users',
      views: {
        by_clerk_id: {
          map: `function(doc) {
            if (doc.type === 'user' && doc.clerkUserId) {
              emit(doc.clerkUserId, doc);
            }
          }`
        },
        by_email: {
          map: `function(doc) {
            if (doc.type === 'user' && doc.userEmail) {
              emit(doc.userEmail, doc);
            }
          }`
        },
        by_tier: {
          map: `function(doc) {
            if (doc.type === 'user' && doc.tier) {
              emit(doc.tier, doc);
            }
          }`
        },
        leaderboard: {
          map: `function(doc) {
            if (doc.type === 'user' && doc.totalWon !== undefined) {
              emit(doc.totalWon, {
                userName: doc.userName,
                emoji: doc.emoji,
                totalWon: doc.totalWon,
                tier: doc.tier
              });
            }
          }`
        }
      }
    }

    // Transactions design document
    const transactionsDesign = {
      _id: '_design/transactions',
      views: {
        by_user_and_type: {
          map: `function(doc) {
            if (doc.type === 'transaction') {
              emit([doc.clerkUserId, doc.transactionType], doc);
            }
          }`
        },
        by_user_and_date: {
          map: `function(doc) {
            if (doc.type === 'transaction') {
              emit([doc.clerkUserId, doc.createdAt], doc);
            }
          }`
        },
        by_status: {
          map: `function(doc) {
            if (doc.type === 'transaction' && doc.status) {
              emit([doc.status, doc.createdAt], doc);
            }
          }`
        },
        by_game: {
          map: `function(doc) {
            if (doc.type === 'transaction' && doc.game) {
              emit([doc.game, doc.transactionType], doc);
            }
          }`
        },
        pending_withdrawals: {
          map: `function(doc) {
            if (doc.type === 'transaction' && doc.transactionType === 'withdrawal' && doc.status === 'pending') {
              emit(doc.createdAt, doc);
            }
          }`
        }
      }
    }

    // Referrals design document
    const referralsDesign = {
      _id: '_design/referrals',
      views: {
        by_referrer: {
          map: `function(doc) {
            if (doc.type === 'referral' && doc.referrerClerkId) {
              emit([doc.referrerClerkId, doc.status], doc);
            }
          }`
        },
        by_referred: {
          map: `function(doc) {
            if (doc.type === 'referral' && doc.referredClerkId) {
              emit(doc.referredClerkId, doc);
            }
          }`
        },
        by_code: {
          map: `function(doc) {
            if (doc.type === 'referral' && doc.referralCode) {
              emit([doc.referralCode, doc.status], doc);
            }
          }`
        },
        leaderboard: {
          map: `function(doc) {
            if (doc.type === 'referral' && doc.status === 'completed') {
              emit(doc.referrerClerkId, 1);
            }
          }`,
          reduce: '_count'
        }
      }
    }

    // Withdrawal requests design document
    const withdrawalRequestsDesign = {
      _id: '_design/withdrawal_requests',
      views: {
        by_user: {
          map: `function(doc) {
            if (doc.type === 'withdrawal_request') {
              emit([doc.clerkUserId, doc.createdAt], doc);
            }
          }`
        },
        by_status: {
          map: `function(doc) {
            if (doc.type === 'withdrawal_request') {
              emit([doc.status, doc.createdAt], doc);
            }
          }`
        },
        pending_requests: {
          map: `function(doc) {
            if (doc.type === 'withdrawal_request' && doc.status === 'pending') {
              emit(doc.createdAt, doc);
            }
          }`
        }
      }
    }

    // Save design documents
    await upsertDocument(usersDesign)
    await upsertDocument(transactionsDesign)
    await upsertDocument(referralsDesign)
    await upsertDocument(withdrawalRequestsDesign)

    console.log('✅ CouchDB design documents created successfully')
  } catch (error) {
    console.error('❌ Error creating CouchDB design documents:', error)
    throw error
  }
}

// Helper function to upsert design documents
async function upsertDocument(doc: any) {
  try {
    const existing = await couchdb.get(doc._id)
    doc._rev = existing._rev
    await couchdb.insert(doc)
  } catch (error) {
    if (error.statusCode === 404) {
      // Document doesn't exist, create it
      await couchdb.insert(doc)
    } else {
      throw error
    }
  }
}

// CouchDB Operations Helper Class
export class CouchDBManager {
  private db: Nano.DocumentScope<any>

  constructor(database: Nano.DocumentScope<any>) {
    this.db = database
  }

  // Generate UUID for document ID
  generateId(): string {
    return uuidv4()
  }

  // Create document
  async create(doc: any, id?: string): Promise<any> {
    const docId = id || this.generateId()
    const timestamp = new Date().toISOString()
    
    const document = {
      _id: docId,
      ...doc,
      createdAt: timestamp,
      updatedAt: timestamp
    }

    const result = await this.db.insert(document)
    return { ...document, _rev: result.rev }
  }

  // Get document by ID
  async getById(id: string): Promise<any | null> {
    try {
      return await this.db.get(id)
    } catch (error) {
      if (error.statusCode === 404) {
        return null
      }
      throw error
    }
  }

  // Update document
  async update(id: string, updates: any): Promise<any> {
    const doc = await this.getById(id)
    if (!doc) {
      throw new Error(`Document with id ${id} not found`)
    }

    const updatedDoc = {
      ...doc,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    const result = await this.db.insert(updatedDoc)
    return { ...updatedDoc, _rev: result.rev }
  }

  // Delete document
  async delete(id: string): Promise<boolean> {
    const doc = await this.getById(id)
    if (!doc) {
      return false
    }

    await this.db.destroy(id, doc._rev)
    return true
  }

  // Query view
  async queryView(designDoc: string, viewName: string, options: any = {}): Promise<any[]> {
    const result = await this.db.view(designDoc, viewName, options)
    return result.rows.map(row => row.value || row.doc)
  }

  // Find documents by type
  async findByType(type: string, options: any = {}): Promise<any[]> {
    const selector = { type, ...options.selector }
    
    try {
      const result = await this.db.find({
        selector,
        sort: options.sort,
        limit: options.limit,
        skip: options.skip
      })
      return result.docs
    } catch (error) {
      // Fallback to view if Mango queries not supported
      console.warn('Mango queries not supported, falling back to view')
      return []
    }
  }

  // Bulk operations
  async bulkInsert(docs: any[]): Promise<any[]> {
    const timestamp = new Date().toISOString()
    const documents = docs.map(doc => ({
      _id: doc._id || this.generateId(),
      ...doc,
      createdAt: doc.createdAt || timestamp,
      updatedAt: timestamp
    }))

    const result = await this.db.bulk({ docs: documents })
    return result
  }
}

// Helper function to disconnect (mainly for testing)
export async function disconnectFromCouchDB() {
  cached.db = null
  cached.promise = null
  console.log('👋 Disconnected from CouchDB')
}

// Export the connection for use in other modules
export default connectToCouchDB

// Export CouchDB instance getter
export async function getCouchDB(): Promise<CouchDBManager | null> {
  const db = await connectToCouchDB()
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 CouchDB not available - returning null for mock data handling')
      return null
    }
    throw new Error('CouchDB connection not available')
  }
  return new CouchDBManager(db)
}
