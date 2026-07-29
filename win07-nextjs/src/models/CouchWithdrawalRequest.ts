import { getCouchDB } from '@/lib/couchdb'

// Withdrawal Request interface for CouchDB
export interface ICouchWithdrawalRequest {
  _id?: string
  _rev?: string
  type: 'withdrawal_request'
  userId: string // User document ID reference
  clerkUserId: string
  amount: number
  method: 'bank' | 'upi'
  accountDetails: {
    accountNumber?: string
    ifscCode?: string
    bankName?: string
    accountHolderName?: string
    upiId?: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'
  adminNotes?: string
  processedBy?: string // Admin user ID who processed this
  processedAt?: string
  rejectionReason?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// CouchDB Withdrawal Request Model
export class CouchWithdrawalRequest {
  private static async getDb() {
    const db = await getCouchDB()
    if (!db) {
      throw new Error('Database not available')
    }
    return db
  }

  // Create new withdrawal request
  static async create(withdrawalData: Partial<ICouchWithdrawalRequest>): Promise<ICouchWithdrawalRequest> {
    const db = await this.getDb()
    const now = new Date().toISOString()

    const withdrawal: ICouchWithdrawalRequest = {
      type: 'withdrawal_request',
      userId: withdrawalData.userId!,
      clerkUserId: withdrawalData.clerkUserId!,
      amount: withdrawalData.amount!,
      method: withdrawalData.method!,
      accountDetails: withdrawalData.accountDetails!,
      status: withdrawalData.status || 'pending',
      adminNotes: withdrawalData.adminNotes,
      processedBy: withdrawalData.processedBy,
      processedAt: withdrawalData.processedAt,
      rejectionReason: withdrawalData.rejectionReason,
      metadata: withdrawalData.metadata || {},
      createdAt: now,
      updatedAt: now
    }

    // Validate withdrawal data
    const validation = this.validateWithdrawal(withdrawal)
    if (!validation.isValid) {
      throw new Error(`Withdrawal validation failed: ${validation.errors.join(', ')}`)
    }

    return await db.create(withdrawal)
  }

  // Find withdrawal request by ID
  static async findById(id: string): Promise<ICouchWithdrawalRequest | null> {
    const db = await this.getDb()
    return await db.getById(id)
  }

  // Get pending withdrawal requests
  static async getPendingRequests(): Promise<ICouchWithdrawalRequest[]> {
    const db = await this.getDb()
    
    try {
      return await db.queryView('withdrawal_requests', 'pending_requests', {
        include_docs: true
      })
    } catch (error) {
      console.error('Error getting pending withdrawal requests:', error)
      return []
    }
  }

  // Get user's withdrawal history
  static async getUserWithdrawals(
    clerkUserId: string, 
    limit: number = 50
  ): Promise<ICouchWithdrawalRequest[]> {
    const db = await this.getDb()
    
    try {
      return await db.queryView('withdrawal_requests', 'by_user', {
        startkey: [clerkUserId, 'Z'],
        endkey: [clerkUserId, '0'],
        descending: true,
        limit
      })
    } catch (error) {
      console.error('Error getting user withdrawals:', error)
      return []
    }
  }

  // Get withdrawal requests by status
  static async getRequestsByStatus(
    status: ICouchWithdrawalRequest['status'],
    limit: number = 100
  ): Promise<ICouchWithdrawalRequest[]> {
    const db = await this.getDb()
    
    try {
      return await db.queryView('withdrawal_requests', 'by_status', {
        key: [status],
        limit
      })
    } catch (error) {
      console.error('Error getting withdrawal requests by status:', error)
      return []
    }
  }

  // Get withdrawal leaderboard (highest withdrawals)
  static async getWithdrawalLeaderboard(limit: number = 50): Promise<any[]> {
    const db = await this.getDb()
    
    try {
      const completedWithdrawals = await this.getRequestsByStatus('completed', 1000)
      
      // Group by user
      const userStats: Record<string, {
        clerkUserId: string
        totalWithdrawn: number
        withdrawalCount: number
        lastWithdrawal: string
      }> = {}

      completedWithdrawals.forEach(withdrawal => {
        if (!userStats[withdrawal.clerkUserId]) {
          userStats[withdrawal.clerkUserId] = {
            clerkUserId: withdrawal.clerkUserId,
            totalWithdrawn: 0,
            withdrawalCount: 0,
            lastWithdrawal: withdrawal.processedAt || withdrawal.createdAt
          }
        }
        
        userStats[withdrawal.clerkUserId].totalWithdrawn += withdrawal.amount
        userStats[withdrawal.clerkUserId].withdrawalCount++
        
        if (withdrawal.processedAt && withdrawal.processedAt > userStats[withdrawal.clerkUserId].lastWithdrawal) {
          userStats[withdrawal.clerkUserId].lastWithdrawal = withdrawal.processedAt
        }
      })

      // Sort by total withdrawn and limit
      return Object.values(userStats)
        .sort((a, b) => b.totalWithdrawn - a.totalWithdrawn)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting withdrawal leaderboard:', error)
      return []
    }
  }

  // Approve withdrawal request
  static async approveRequest(
    id: string, 
    adminClerkId: string, 
    notes?: string
  ): Promise<ICouchWithdrawalRequest | null> {
    const db = await this.getDb()
    const now = new Date().toISOString()
    
    return await db.update(id, {
      status: 'approved' as const,
      processedBy: adminClerkId,
      processedAt: now,
      adminNotes: notes,
      metadata: {
        approvedAt: now,
        approvedBy: adminClerkId
      }
    })
  }

  // Reject withdrawal request
  static async rejectRequest(
    id: string, 
    adminClerkId: string, 
    reason: string
  ): Promise<ICouchWithdrawalRequest | null> {
    const db = await this.getDb()
    const now = new Date().toISOString()
    
    return await db.update(id, {
      status: 'rejected' as const,
      processedBy: adminClerkId,
      processedAt: now,
      rejectionReason: reason,
      metadata: {
        rejectedAt: now,
        rejectedBy: adminClerkId,
        rejectionReason: reason
      }
    })
  }

  // Mark as processing
  static async markProcessing(
    id: string, 
    adminClerkId: string
  ): Promise<ICouchWithdrawalRequest | null> {
    const db = await this.getDb()
    const now = new Date().toISOString()
    
    return await db.update(id, {
      status: 'processing' as const,
      processedBy: adminClerkId,
      processedAt: now,
      metadata: {
        processingStartedAt: now,
        processingBy: adminClerkId
      }
    })
  }

  // Mark as completed
  static async markCompleted(id: string): Promise<ICouchWithdrawalRequest | null> {
    const db = await this.getDb()
    const now = new Date().toISOString()
    
    return await db.update(id, {
      status: 'completed' as const,
      metadata: {
        completedAt: now
      }
    })
  }

  // Get withdrawal statistics for admin dashboard
  static async getWithdrawalStats(): Promise<{
    totalRequests: number
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
    processingRequests: number
    completedRequests: number
    totalAmount: number
    pendingAmount: number
  }> {
    try {
      const allRequests = await this.getAllRequests(1000)
      
      const stats = {
        totalRequests: allRequests.length,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        processingRequests: 0,
        completedRequests: 0,
        totalAmount: 0,
        pendingAmount: 0
      }

      allRequests.forEach(request => {
        stats.totalAmount += request.amount
        
        switch (request.status) {
          case 'pending':
            stats.pendingRequests++
            stats.pendingAmount += request.amount
            break
          case 'approved':
            stats.approvedRequests++
            break
          case 'rejected':
            stats.rejectedRequests++
            break
          case 'processing':
            stats.processingRequests++
            break
          case 'completed':
            stats.completedRequests++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting withdrawal stats:', error)
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        processingRequests: 0,
        completedRequests: 0,
        totalAmount: 0,
        pendingAmount: 0
      }
    }
  }

  // Get all withdrawal requests
  static async getAllRequests(limit: number = 500): Promise<ICouchWithdrawalRequest[]> {
    const db = await this.getDb()
    
    try {
      return await db.findByType('withdrawal_request', {
        sort: [{ createdAt: 'desc' }],
        limit
      })
    } catch (error) {
      console.error('Error getting all withdrawal requests:', error)
      return []
    }
  }

  // Update withdrawal request
  static async updateRequest(id: string, updates: Partial<ICouchWithdrawalRequest>): Promise<ICouchWithdrawalRequest | null> {
    const db = await this.getDb()
    const filteredUpdates = { ...updates }
    delete filteredUpdates._id
    delete filteredUpdates._rev
    delete filteredUpdates.type // Don't allow changing the document type
    
    return await db.update(id, filteredUpdates)
  }

  // Validate withdrawal data
  static validateWithdrawal(withdrawalData: Partial<ICouchWithdrawalRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!withdrawalData.userId) {
      errors.push('User ID is required')
    }
    if (!withdrawalData.clerkUserId) {
      errors.push('Clerk User ID is required')
    }
    if (!withdrawalData.amount || withdrawalData.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }
    if (!withdrawalData.method || !['bank', 'upi'].includes(withdrawalData.method)) {
      errors.push('Valid withdrawal method is required (bank or upi)')
    }
    if (!withdrawalData.accountDetails) {
      errors.push('Account details are required')
    } else {
      if (withdrawalData.method === 'bank') {
        if (!withdrawalData.accountDetails.accountNumber) {
          errors.push('Bank account number is required')
        }
        if (!withdrawalData.accountDetails.ifscCode) {
          errors.push('IFSC code is required')
        }
        if (!withdrawalData.accountDetails.bankName) {
          errors.push('Bank name is required')
        }
        if (!withdrawalData.accountDetails.accountHolderName) {
          errors.push('Account holder name is required')
        }
      } else if (withdrawalData.method === 'upi') {
        if (!withdrawalData.accountDetails.upiId) {
          errors.push('UPI ID is required')
        }
        // Basic UPI ID validation
        if (withdrawalData.accountDetails.upiId && 
            !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/.test(withdrawalData.accountDetails.upiId)) {
          errors.push('Invalid UPI ID format')
        }
      }
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed']
    if (withdrawalData.status && !validStatuses.includes(withdrawalData.status)) {
      errors.push('Invalid status')
    }

    // Amount limits (basic validation)
    if (withdrawalData.amount && withdrawalData.amount > 100000) {
      errors.push('Withdrawal amount cannot exceed ₹100,000')
    }
    if (withdrawalData.amount && withdrawalData.amount < 100) {
      errors.push('Minimum withdrawal amount is ₹100')
    }

    return { isValid: errors.length === 0, errors }
  }

  // Get user's pending withdrawal amount
  static async getUserPendingAmount(clerkUserId: string): Promise<number> {
    const userWithdrawals = await this.getUserWithdrawals(clerkUserId, 100)
    
    return userWithdrawals
      .filter(w => w.status === 'pending' || w.status === 'approved' || w.status === 'processing')
      .reduce((total, w) => total + w.amount, 0)
  }

  // Check if user can make withdrawal
  static async canUserWithdraw(
    clerkUserId: string, 
    amount: number, 
    userTier: string,
    userCashBalance: number,
    hasWithdrawnBasic: boolean
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check tier limits
    const tierLimits = {
      Basic: 1000,
      Bronze: 5000,
      Silver: 15000,
      Gold: 50000,
      Platinum: 100000
    }
    
    const maxWithdrawal = tierLimits[userTier as keyof typeof tierLimits] || tierLimits.Basic
    
    // Basic tier can only withdraw once
    if (userTier === 'Basic' && hasWithdrawnBasic) {
      return { allowed: false, reason: 'Basic tier users can only withdraw once' }
    }
    
    if (amount > maxWithdrawal) {
      return { allowed: false, reason: `Maximum withdrawal for ${userTier} tier is ₹${maxWithdrawal}` }
    }
    
    if (amount > userCashBalance) {
      return { allowed: false, reason: 'Insufficient cash balance' }
    }

    // Check for existing pending withdrawals
    const pendingAmount = await this.getUserPendingAmount(clerkUserId)
    if (pendingAmount > 0) {
      return { 
        allowed: false, 
        reason: `You have a pending withdrawal of ₹${pendingAmount}. Please wait for it to be processed.` 
      }
    }
    
    return { allowed: true }
  }

  // Delete withdrawal request (admin only)
  static async deleteRequest(id: string): Promise<boolean> {
    const db = await this.getDb()
    return await db.delete(id)
  }
}

export default CouchWithdrawalRequest
