// Export all CouchDB models
export { default as CouchUser } from './CouchUser'
export { default as CouchTransaction } from './CouchTransaction'
export { default as CouchReferral } from './CouchReferral'
export { default as CouchWithdrawalRequest } from './CouchWithdrawalRequest'

// Export types
export type { ICouchUser } from './CouchUser'
export type { ICouchTransaction } from './CouchTransaction'
export type { ICouchReferral } from './CouchReferral'
export type { ICouchWithdrawalRequest } from './CouchWithdrawalRequest'

// Re-export database connection
export { connectToCouchDB, getCouchDB, CouchDBManager } from '@/lib/couchdb'
