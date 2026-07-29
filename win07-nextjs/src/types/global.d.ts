import { CouchDBManager } from '@/lib/couchdb'

declare global {
  var couchdb: {
    db: CouchDBManager | null
    promise: Promise<CouchDBManager> | null
  }
}
