// Simple setup script for CouchDB
// This script creates the initial database structure and design documents

const axios = require('axios')

const COUCHDB_URL = process.env.COUCHDB_URL || 'http://admin:password@127.0.0.1:5984'
const COUCHDB_DATABASE = process.env.COUCHDB_DATABASE || 'win07_platform'

// Helper function to make HTTP requests to CouchDB
async function couchRequest(method, path, data = null) {
  try {
    const url = `${COUCHDB_URL}${path}`
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (data) {
      config.data = data
    }
    
    const response = await axios(config)
    return response.data
  } catch (error) {
    if (error.response) {
      return { error: error.response.data, status: error.response.status }
    }
    throw error
  }
}

async function setupCouchDB() {
  try {
    console.log('🔗 Connecting to CouchDB:', COUCHDB_URL.replace(/\/\/.*@/, '//***:***@'))
    
    // Test connection
    const info = await couchRequest('GET', '/')
    if (info.error) {
      console.error('❌ Failed to connect to CouchDB:', info.error)
      return
    }
    
    console.log('✅ Connected to CouchDB:', info.couchdb, 'version', info.version)
    
    // Check if database exists, create if it doesn't
    console.log('📦 Setting up database:', COUCHDB_DATABASE)
    
    const dbCheck = await couchRequest('GET', `/${COUCHDB_DATABASE}`)
    if (dbCheck.error && dbCheck.status === 404) {
      // Database doesn't exist, create it
      const createResult = await couchRequest('PUT', `/${COUCHDB_DATABASE}`)
      if (createResult.error) {
        console.error('❌ Failed to create database:', createResult.error)
        return
      }
      console.log('✅ Created database:', COUCHDB_DATABASE)
    } else if (dbCheck.error) {
      console.error('❌ Error checking database:', dbCheck.error)
      return
    } else {
      console.log('✅ Database already exists:', COUCHDB_DATABASE)
    }
    
    // Create design documents for views (indexes)
    console.log('📝 Creating design documents...')
    
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

    // Function to create or update design document
    async function upsertDesignDoc(designDoc) {
      // Check if design document exists
      const existing = await couchRequest('GET', `/${COUCHDB_DATABASE}/${designDoc._id}`)
      
      if (existing._rev) {
        // Update existing design document
        designDoc._rev = existing._rev
      }
      
      const result = await couchRequest('PUT', `/${COUCHDB_DATABASE}/${designDoc._id}`, designDoc)
      if (result.error) {
        console.error(`❌ Failed to create ${designDoc._id}:`, result.error)
      } else {
        console.log(`✅ Created/updated ${designDoc._id}`)
      }
    }

    // Create all design documents
    await upsertDesignDoc(usersDesign)
    await upsertDesignDoc(transactionsDesign)
    await upsertDesignDoc(referralsDesign)
    await upsertDesignDoc(withdrawalRequestsDesign)

    console.log('🎉 CouchDB setup completed successfully!')
    
    // Show database info
    const dbInfo = await couchRequest('GET', `/${COUCHDB_DATABASE}`)
    console.log('📊 Database info:')
    console.log(`  - Database: ${dbInfo.db_name}`)
    console.log(`  - Documents: ${dbInfo.doc_count}`)
    console.log(`  - Disk size: ${Math.round(dbInfo.disk_size / 1024)} KB`)
    console.log(`  - Data size: ${Math.round(dbInfo.data_size / 1024)} KB`)
    
  } catch (error) {
    console.error('❌ Error setting up CouchDB:', error.message)
  }
}

// Run the setup
if (require.main === module) {
  setupCouchDB().catch(console.error)
}

module.exports = { setupCouchDB, couchRequest }
