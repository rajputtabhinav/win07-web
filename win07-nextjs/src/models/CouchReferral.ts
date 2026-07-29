import { getCouchDB } from '@/lib/couchdb'

// Referral interface for CouchDB
export interface ICouchReferral {
  _id?: string
  _rev?: string
  type: 'referral'
  referrerUserId: string // User document ID reference
  referrerClerkId: string
  referredUserId?: string // User document ID reference (set when referred user signs up)
  referredClerkId: string
  referralCode: string
  status: 'pending' | 'completed' | 'failed'
  rewardAmount: number
  rewardPaid: boolean
  completedAt?: string
  depositRequirement: number // Minimum deposit required to complete referral
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// CouchDB Referral Model
export class CouchReferral {
  private static async getDb() {
    const db = await getCouchDB()
    if (!db) {
      throw new Error('Database not available')
    }
    return db
  }

  // Create new referral
  static async create(referralData: Partial<ICouchReferral>): Promise<ICouchReferral> {
    const db = await this.getDb()
    const now = new Date().toISOString()

    const referral: ICouchReferral = {
      type: 'referral',
      referrerUserId: referralData.referrerUserId!,
      referrerClerkId: referralData.referrerClerkId!,
      referredUserId: referralData.referredUserId,
      referredClerkId: referralData.referredClerkId!,
      referralCode: referralData.referralCode!,
      status: referralData.status || 'pending',
      rewardAmount: referralData.rewardAmount || 50, // Default ₹50 reward
      rewardPaid: referralData.rewardPaid || false,
      completedAt: referralData.completedAt,
      depositRequirement: referralData.depositRequirement || 150, // Default ₹150 deposit requirement
      metadata: referralData.metadata || {},
      createdAt: now,
      updatedAt: now
    }

    // Validate referral data
    const validation = this.validateReferral(referral)
    if (!validation.isValid) {
      throw new Error(`Referral validation failed: ${validation.errors.join(', ')}`)
    }

    return await db.create(referral)
  }

  // Find referral by ID
  static async findById(id: string): Promise<ICouchReferral | null> {
    const db = await this.getDb()
    return await db.getById(id)
  }

  // Find referral by code
  static async findByReferralCode(referralCode: string): Promise<ICouchReferral | null> {
    const db = await this.getDb()
    
    try {
      const referrals = await db.queryView('referrals', 'by_code', {
        key: [referralCode, 'pending'],
        limit: 1
      })
      return referrals.length > 0 ? referrals[0] : null
    } catch (error) {
      console.error('Error finding referral by code:', error)
      return null
    }
  }

  // Find referral by referred user
  static async findByReferredUser(referredClerkId: string): Promise<ICouchReferral | null> {
    const db = await this.getDb()
    
    try {
      const referrals = await db.queryView('referrals', 'by_referred', {
        key: referredClerkId,
        limit: 1
      })
      return referrals.length > 0 ? referrals[0] : null
    } catch (error) {
      console.error('Error finding referral by referred user:', error)
      return null
    }
  }

  // Get referrals by referrer
  static async getReferralsByReferrer(
    referrerClerkId: string,
    status?: ICouchReferral['status']
  ): Promise<ICouchReferral[]> {
    const db = await this.getDb()
    
    try {
      const key = status ? [referrerClerkId, status] : [referrerClerkId]
      return await db.queryView('referrals', 'by_referrer', {
        startkey: key,
        endkey: status ? key : [referrerClerkId, 'Z']
      })
    } catch (error) {
      console.error('Error getting referrals by referrer:', error)
      return []
    }
  }

  // Get referral statistics for a user
  static async getReferralStats(referrerClerkId: string): Promise<{
    totalReferrals: number
    completedReferrals: number
    pendingReferrals: number
    totalRewards: number
    paidRewards: number
  }> {
    const referrals = await this.getReferralsByReferrer(referrerClerkId)
    
    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalRewards: 0,
      paidRewards: 0
    }

    referrals.forEach(referral => {
      switch (referral.status) {
        case 'completed':
          stats.completedReferrals++
          stats.totalRewards += referral.rewardAmount
          if (referral.rewardPaid) {
            stats.paidRewards += referral.rewardAmount
          }
          break
        case 'pending':
          stats.pendingReferrals++
          break
      }
    })

    return stats
  }

  // Complete referral
  static async completeReferral(
    referralId: string,
    referredUserId: string,
    depositAmount: number
  ): Promise<ICouchReferral | null> {
    const db = await this.getDb()
    const referral = await this.findById(referralId)
    
    if (!referral) return null
    if (referral.status !== 'pending') return null
    if (depositAmount < referral.depositRequirement) {
      throw new Error(`Deposit amount (₹${depositAmount}) is below the requirement (₹${referral.depositRequirement})`)
    }

    const updates = {
      status: 'completed' as const,
      referredUserId,
      completedAt: new Date().toISOString(),
      metadata: {
        ...referral.metadata,
        completingDeposit: depositAmount,
        completedAt: new Date().toISOString()
      }
    }

    return await db.update(referralId, updates)
  }

  // Mark referral reward as paid
  static async markRewardPaid(referralId: string): Promise<ICouchReferral | null> {
    const db = await this.getDb()
    return await db.update(referralId, { 
      rewardPaid: true,
      metadata: {
        rewardPaidAt: new Date().toISOString()
      }
    })
  }

  // Fail referral
  static async failReferral(referralId: string, reason: string): Promise<ICouchReferral | null> {
    const db = await this.getDb()
    return await db.update(referralId, {
      status: 'failed' as const,
      metadata: {
        failureReason: reason,
        failedAt: new Date().toISOString()
      }
    })
  }

  // Get referral leaderboard
  static async getLeaderboard(limit: number = 50): Promise<any[]> {
    const db = await this.getDb()
    
    try {
      // This would ideally use a reduce function, but we'll simulate it
      const completedReferrals = await db.queryView('referrals', 'by_referrer', {
        endkey: ['Z', 'completed']
      })
      
      // Group by referrer
      const referrerStats: Record<string, {
        referrerClerkId: string
        totalReferrals: number
        totalRewards: number
      }> = {}

      completedReferrals.forEach(referral => {
        if (referral.status === 'completed') {
          if (!referrerStats[referral.referrerClerkId]) {
            referrerStats[referral.referrerClerkId] = {
              referrerClerkId: referral.referrerClerkId,
              totalReferrals: 0,
              totalRewards: 0
            }
          }
          referrerStats[referral.referrerClerkId].totalReferrals++
          referrerStats[referral.referrerClerkId].totalRewards += referral.rewardAmount
        }
      })

      // Sort by total referrals and limit
      return Object.values(referrerStats)
        .sort((a, b) => b.totalReferrals - a.totalReferrals)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting referral leaderboard:', error)
      return []
    }
  }

  // Update referral
  static async updateReferral(id: string, updates: Partial<ICouchReferral>): Promise<ICouchReferral | null> {
    const db = await this.getDb()
    const filteredUpdates = { ...updates }
    delete filteredUpdates._id
    delete filteredUpdates._rev
    delete filteredUpdates.type // Don't allow changing the document type
    
    return await db.update(id, filteredUpdates)
  }

  // Generate unique referral code
  static generateReferralCode(userName: string, clerkUserId: string): string {
    const namePrefix = userName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()
    const idSuffix = clerkUserId.substring(clerkUserId.length - 4).toUpperCase()
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `${namePrefix}${idSuffix}${randomSuffix}`
  }

  // Check if referral code is available
  static async isReferralCodeAvailable(code: string): Promise<boolean> {
    const existing = await this.findByReferralCode(code)
    return !existing
  }

  // Create referral with unique code
  static async createWithUniqueCode(
    referralData: Partial<ICouchReferral>,
    userName: string
  ): Promise<ICouchReferral> {
    let code = this.generateReferralCode(userName, referralData.referrerClerkId!)
    let attempts = 0
    
    // Try up to 10 times to generate a unique code
    while (!await this.isReferralCodeAvailable(code) && attempts < 10) {
      code = this.generateReferralCode(userName, referralData.referrerClerkId! + attempts.toString())
      attempts++
    }
    
    if (attempts >= 10) {
      throw new Error('Could not generate unique referral code')
    }

    return await this.create({
      ...referralData,
      referralCode: code
    })
  }

  // Validate referral data
  static validateReferral(referralData: Partial<ICouchReferral>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!referralData.referrerUserId) {
      errors.push('Referrer User ID is required')
    }
    if (!referralData.referrerClerkId) {
      errors.push('Referrer Clerk ID is required')
    }
    if (!referralData.referredClerkId) {
      errors.push('Referred Clerk ID is required')
    }
    if (!referralData.referralCode) {
      errors.push('Referral code is required')
    }
    if (referralData.rewardAmount !== undefined && referralData.rewardAmount <= 0) {
      errors.push('Reward amount must be greater than 0')
    }
    if (referralData.depositRequirement !== undefined && referralData.depositRequirement <= 0) {
      errors.push('Deposit requirement must be greater than 0')
    }

    const validStatuses = ['pending', 'completed', 'failed']
    if (referralData.status && !validStatuses.includes(referralData.status)) {
      errors.push('Invalid status')
    }

    // Cannot refer yourself
    if (referralData.referrerClerkId === referralData.referredClerkId) {
      errors.push('Cannot refer yourself')
    }

    return { isValid: errors.length === 0, errors }
  }

  // Get pending referrals (for admin)
  static async getPendingReferrals(limit: number = 100): Promise<ICouchReferral[]> {
    return await this.getReferralsByStatus('pending', limit)
  }

  // Get referrals by status
  static async getReferralsByStatus(
    status: ICouchReferral['status'], 
    limit: number = 100
  ): Promise<ICouchReferral[]> {
    const db = await this.getDb()
    
    try {
      return await db.findByType('referral', {
        selector: { status },
        sort: [{ createdAt: 'desc' }],
        limit
      })
    } catch (error) {
      console.error('Error getting referrals by status:', error)
      return []
    }
  }

  // Delete referral (admin only)
  static async deleteReferral(id: string): Promise<boolean> {
    const db = await this.getDb()
    return await db.delete(id)
  }
}

export default CouchReferral
