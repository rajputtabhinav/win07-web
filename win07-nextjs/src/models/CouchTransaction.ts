import { getCouchDB } from '@/lib/couchdb'

// Transaction interface for CouchDB
export interface ICouchTransaction {
  _id?: string
  _rev?: string
  type: 'transaction'
  userId: string // User document ID reference
  clerkUserId: string // For quick lookups
  transactionType: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'admin_deposit' | 'admin_withdrawal' | 'admin_adjustment' | 'referral_bonus'
  amount: number
  walletType: 'cash' | 'bonus'
  game?: string
  description: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  metadata?: Record<string, any> // For storing additional data like bet details, admin notes, etc.
  adminUserId?: string // Track which admin performed the action
  verificationData?: {
    paymentGateway?: string
    transactionId?: string
    verified: boolean
    verifiedAt?: string
  }
  createdAt: string
  updatedAt: string
}

// Valid games enum
export const VALID_GAMES = [
  'limbo', 'andar-bahar', 'teen-patti', 'plinko', 'wheel', 'mines', 
  'crash', 'aviator', 'blackjack', 'baccarat', 'dragon-tiger', 'system'
] as const

// CouchDB Transaction Model
export class CouchTransaction {
  private static async getDb() {
    const db = await getCouchDB()
    if (!db) {
      throw new Error('Database not available')
    }
    return db
  }

  // Create new transaction
  static async create(transactionData: Partial<ICouchTransaction>): Promise<ICouchTransaction> {
    const db = await this.getDb()
    const now = new Date().toISOString()

    const transaction: ICouchTransaction = {
      type: 'transaction',
      userId: transactionData.userId!,
      clerkUserId: transactionData.clerkUserId!,
      transactionType: transactionData.transactionType!,
      amount: transactionData.amount!,
      walletType: transactionData.walletType!,
      game: transactionData.game || 'system',
      description: transactionData.description!,
      status: transactionData.status || 'pending',
      metadata: transactionData.metadata || {},
      adminUserId: transactionData.adminUserId,
      verificationData: transactionData.verificationData,
      createdAt: now,
      updatedAt: now
    }

    // Validate transaction data
    const validation = this.validateTransaction(transaction)
    if (!validation.isValid) {
      throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`)
    }

    return await db.create(transaction)
  }

  // Find transaction by ID
  static async findById(id: string): Promise<ICouchTransaction | null> {
    const db = await this.getDb()
    return await db.getById(id)
  }

  // Get transaction history for user
  static async getTransactionHistory(
    clerkUserId: string, 
    options: {
      limit?: number
      offset?: number
      type?: string
      status?: string
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<ICouchTransaction[]> {
    const db = await this.getDb()
    
    try {
      const result = await db.queryView('transactions', 'by_user_and_date', {
        startkey: [clerkUserId, options.startDate || '0'],
        endkey: [clerkUserId, options.endDate || 'Z'],
        descending: true,
        limit: options.limit || 50,
        skip: options.offset || 0
      })
      
      let transactions = result || []
      
      // Filter by type if specified
      if (options.type) {
        transactions = transactions.filter(t => t.transactionType === options.type)
      }
      
      // Filter by status if specified
      if (options.status) {
        transactions = transactions.filter(t => t.status === options.status)
      }
      
      return transactions
    } catch (error) {
      console.error('Error getting transaction history:', error)
      return []
    }
  }

  // Get pending withdrawals
  static async getPendingWithdrawals(): Promise<ICouchTransaction[]> {
    const db = await this.getDb()
    
    try {
      return await db.queryView('transactions', 'pending_withdrawals', {
        include_docs: true
      })
    } catch (error) {
      console.error('Error getting pending withdrawals:', error)
      return []
    }
  }

  // Get game statistics
  static async getGameStats(game: string, days: number = 30): Promise<{
    totalBets: number
    totalWins: number
    betAmount: number
    winAmount: number
    transactionCount: number
  }> {
    const db = await this.getDb()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    try {
      const transactions = await db.queryView('transactions', 'by_game', {
        key: [game, 'bet']
      })
      
      const winTransactions = await db.queryView('transactions', 'by_game', {
        key: [game, 'win']
      })
      
      const recentTransactions = [...transactions, ...winTransactions].filter(t => 
        new Date(t.createdAt) >= startDate
      )
      
      const betTransactions = recentTransactions.filter(t => t.transactionType === 'bet')
      const winTransactionsRecent = recentTransactions.filter(t => t.transactionType === 'win')
      
      return {
        totalBets: betTransactions.length,
        totalWins: winTransactionsRecent.length,
        betAmount: betTransactions.reduce((sum, t) => sum + t.amount, 0),
        winAmount: winTransactionsRecent.reduce((sum, t) => sum + t.amount, 0),
        transactionCount: recentTransactions.length
      }
    } catch (error) {
      console.error('Error getting game stats:', error)
      return {
        totalBets: 0,
        totalWins: 0,
        betAmount: 0,
        winAmount: 0,
        transactionCount: 0
      }
    }
  }

  // Update transaction status
  static async updateStatus(
    id: string, 
    status: ICouchTransaction['status'], 
    adminUserId?: string,
    metadata?: Record<string, any>
  ): Promise<ICouchTransaction | null> {
    const db = await this.getDb()
    const transaction = await this.findById(id)
    
    if (!transaction) return null

    const updates: any = { status }
    if (adminUserId) updates.adminUserId = adminUserId
    if (metadata) updates.metadata = { ...transaction.metadata, ...metadata }

    return await db.update(id, updates)
  }

  // Approve transaction (admin action)
  static async approveTransaction(id: string, adminUserId: string): Promise<ICouchTransaction | null> {
    return await this.updateStatus(id, 'completed', adminUserId, {
      approvedAt: new Date().toISOString(),
      approvedBy: adminUserId
    })
  }

  // Reject transaction (admin action)
  static async rejectTransaction(
    id: string, 
    adminUserId: string, 
    reason: string
  ): Promise<ICouchTransaction | null> {
    return await this.updateStatus(id, 'failed', adminUserId, {
      rejectedAt: new Date().toISOString(),
      rejectedBy: adminUserId,
      rejectionReason: reason
    })
  }

  // Get transactions by status
  static async getTransactionsByStatus(
    status: ICouchTransaction['status'],
    limit: number = 100
  ): Promise<ICouchTransaction[]> {
    const db = await this.getDb()
    
    try {
      return await db.queryView('transactions', 'by_status', {
        key: [status],
        limit
      })
    } catch (error) {
      console.error('Error getting transactions by status:', error)
      return []
    }
  }

  // Get user transaction summary
  static async getUserTransactionSummary(clerkUserId: string): Promise<{
    totalDeposits: number
    totalWithdrawals: number
    totalBets: number
    totalWins: number
    pendingWithdrawals: number
  }> {
    const transactions = await this.getTransactionHistory(clerkUserId, { limit: 1000 })
    
    const summary = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalBets: 0,
      totalWins: 0,
      pendingWithdrawals: 0
    }

    transactions.forEach(t => {
      switch (t.transactionType) {
        case 'deposit':
          if (t.status === 'completed') {
            summary.totalDeposits += t.amount
          }
          break
        case 'withdrawal':
          if (t.status === 'completed') {
            summary.totalWithdrawals += t.amount
          } else if (t.status === 'pending') {
            summary.pendingWithdrawals += t.amount
          }
          break
        case 'bet':
          if (t.status === 'completed') {
            summary.totalBets += t.amount
          }
          break
        case 'win':
          if (t.status === 'completed') {
            summary.totalWins += t.amount
          }
          break
      }
    })

    return summary
  }

  // Update transaction
  static async updateTransaction(id: string, updates: Partial<ICouchTransaction>): Promise<ICouchTransaction | null> {
    const db = await this.getDb()
    const filteredUpdates = { ...updates }
    delete filteredUpdates._id
    delete filteredUpdates._rev
    delete filteredUpdates.type // Don't allow changing the document type
    
    return await db.update(id, filteredUpdates)
  }

  // Validate transaction data
  static validateTransaction(transactionData: Partial<ICouchTransaction>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!transactionData.userId) {
      errors.push('User ID is required')
    }
    if (!transactionData.clerkUserId) {
      errors.push('Clerk User ID is required')
    }
    if (!transactionData.transactionType) {
      errors.push('Transaction type is required')
    }
    if (!transactionData.amount || transactionData.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }
    if (!transactionData.walletType || !['cash', 'bonus'].includes(transactionData.walletType)) {
      errors.push('Valid wallet type is required (cash or bonus)')
    }
    if (!transactionData.description) {
      errors.push('Description is required')
    }
    if (transactionData.game && !VALID_GAMES.includes(transactionData.game as any)) {
      errors.push('Invalid game specified')
    }

    const validTransactionTypes = ['deposit', 'withdrawal', 'bet', 'win', 'admin_deposit', 'admin_withdrawal', 'admin_adjustment', 'referral_bonus']
    if (transactionData.transactionType && !validTransactionTypes.includes(transactionData.transactionType)) {
      errors.push('Invalid transaction type')
    }

    const validStatuses = ['pending', 'completed', 'failed', 'cancelled']
    if (transactionData.status && !validStatuses.includes(transactionData.status)) {
      errors.push('Invalid status')
    }

    return { isValid: errors.length === 0, errors }
  }

  // Get recent transactions (for admin dashboard)
  static async getRecentTransactions(limit: number = 50): Promise<ICouchTransaction[]> {
    const db = await this.getDb()
    
    try {
      // Get transactions sorted by creation date (most recent first)
      return await db.findByType('transaction', {
        sort: [{ createdAt: 'desc' }],
        limit
      })
    } catch (error) {
      console.error('Error getting recent transactions:', error)
      return []
    }
  }

  // Delete transaction (admin only)
  static async deleteTransaction(id: string): Promise<boolean> {
    const db = await this.getDb()
    return await db.delete(id)
  }
}

export default CouchTransaction
