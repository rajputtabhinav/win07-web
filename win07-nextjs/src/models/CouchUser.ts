import { getCouchDB } from '@/lib/couchdb'
import { getUserEmoji } from '@/utils/user-emoji'

// User interface for CouchDB
export interface ICouchUser {
  _id?: string
  _rev?: string
  type: 'user'
  clerkUserId: string
  userName: string
  userEmail: string
  userFullName?: string
  cashBalance: number
  bonusBalance: number
  totalWon: number
  totalLost: number
  totalDeposits: number
  totalWithdrawals: number
  emoji: string
  tier: 'Basic' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  hasWithdrawnBasic: boolean
  isActive: boolean
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}

// User tier definitions
export const USER_TIERS = [
  {
    name: 'Basic' as const,
    minReferrals: 0,
    maxReferrals: 2,
    withdrawalLimit: 1000,
    color: 'text-gray-400',
    description: 'One-time withdrawal of ₹1000'
  },
  {
    name: 'Bronze' as const,
    minReferrals: 2,
    maxReferrals: 12,
    withdrawalLimit: 5000,
    color: 'text-orange-400',
    description: 'Up to ₹5000 per withdrawal'
  },
  {
    name: 'Silver' as const,
    minReferrals: 5,
    maxReferrals: 20,
    withdrawalLimit: 15000,
    color: 'text-gray-300',
    description: 'Up to ₹15000 per withdrawal'
  },
  {
    name: 'Gold' as const,
    minReferrals: 20,
    maxReferrals: 50,
    withdrawalLimit: 50000,
    color: 'text-yellow-400',
    description: 'Up to ₹50000 per withdrawal'
  },
  {
    name: 'Platinum' as const,
    minReferrals: 50,
    maxReferrals: null,
    withdrawalLimit: 100000,
    color: 'text-blue-400',
    description: 'Up to ₹100000 per withdrawal'
  }
]

// CouchDB User Model
export class CouchUser {
  private static async getDb() {
    const db = await getCouchDB()
    if (!db) {
      throw new Error('Database not available')
    }
    return db
  }

  // Create new user
  static async create(userData: Partial<ICouchUser>): Promise<ICouchUser> {
    const db = await this.getDb()
    const now = new Date().toISOString()

    // Assign emoji deterministically based on user ID
    const emojiList = ['😀', '😎', '🤠', '🥳', '😍', '🤑', '🎯', '🎲', '🎰', '🎮', '⭐', '🌟', '💫', '⚡', '🔥']
    const emojiIndex = userData.clerkUserId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % emojiList.length || 0

    const user: ICouchUser = {
      type: 'user',
      clerkUserId: userData.clerkUserId!,
      userName: userData.userName || 'User',
      userEmail: userData.userEmail!,
      userFullName: userData.userFullName,
      cashBalance: userData.cashBalance || 0,
      bonusBalance: userData.bonusBalance || 0,
      totalWon: userData.totalWon || 0,
      totalLost: userData.totalLost || 0,
      totalDeposits: userData.totalDeposits || 0,
      totalWithdrawals: userData.totalWithdrawals || 0,
      emoji: userData.emoji || emojiList[emojiIndex],
      tier: userData.tier || 'Basic',
      hasWithdrawnBasic: userData.hasWithdrawnBasic || false,
      isActive: userData.isActive !== false,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now
    }

    return await db.create(user)
  }

  // Find user by Clerk ID
  static async findByClerkId(clerkUserId: string): Promise<ICouchUser | null> {
    const db = await this.getDb()
    
    try {
      const users = await db.queryView('users', 'by_clerk_id', {
        key: clerkUserId,
        limit: 1
      })
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error('Error finding user by clerk ID:', error)
      return null
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<ICouchUser | null> {
    const db = await this.getDb()
    
    try {
      const users = await db.queryView('users', 'by_email', {
        key: email.toLowerCase(),
        limit: 1
      })
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error('Error finding user by email:', error)
      return null
    }
  }

  // Get user by ID
  static async findById(id: string): Promise<ICouchUser | null> {
    const db = await this.getDb()
    return await db.getById(id)
  }

  // Update user
  static async updateUser(id: string, updates: Partial<ICouchUser>): Promise<ICouchUser> {
    const db = await this.getDb()
    const filteredUpdates = { ...updates }
    delete filteredUpdates._id
    delete filteredUpdates._rev
    
    return await db.update(id, filteredUpdates)
  }

  // Update last login
  static async updateLastLogin(clerkUserId: string): Promise<ICouchUser | null> {
    const user = await this.findByClerkId(clerkUserId)
    if (!user) return null

    return await this.updateUser(user._id!, {
      lastLoginAt: new Date().toISOString()
    })
  }

  // Get leaderboard
  static async getLeaderboard(limit: number = 50): Promise<any[]> {
    const db = await this.getDb()
    
    try {
      const users = await db.queryView('users', 'leaderboard', {
        descending: true,
        limit
      })
      return users.filter(user => user.isActive)
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  // Get tier limits for user
  static getTierLimits(tier: string) {
    const tierInfo = USER_TIERS.find(t => t.name === tier) || USER_TIERS[0]
    return {
      withdrawal: tierInfo.withdrawalLimit
    }
  }

  // Check if user can withdraw amount
  static canUserWithdraw(user: ICouchUser, amount: number): { allowed: boolean; reason?: string } {
    const limits = this.getTierLimits(user.tier)
    
    // Basic tier can only withdraw once
    if (user.tier === 'Basic' && user.hasWithdrawnBasic) {
      return { allowed: false, reason: 'Basic tier users can only withdraw once' }
    }
    
    if (amount > limits.withdrawal) {
      return { allowed: false, reason: `Maximum withdrawal for ${user.tier} tier is ₹${limits.withdrawal}` }
    }
    
    if (amount > user.cashBalance) {
      return { allowed: false, reason: 'Insufficient cash balance' }
    }
    
    return { allowed: true }
  }

  // Update user balance
  static async updateBalance(
    clerkUserId: string, 
    cashChange: number = 0, 
    bonusChange: number = 0
  ): Promise<ICouchUser | null> {
    const user = await this.findByClerkId(clerkUserId)
    if (!user) return null

    const updates = {
      cashBalance: Math.max(0, user.cashBalance + cashChange),
      bonusBalance: Math.max(0, user.bonusBalance + bonusChange)
    }

    return await this.updateUser(user._id!, updates)
  }

  // Update user stats
  static async updateStats(
    clerkUserId: string,
    updates: {
      totalWon?: number
      totalLost?: number
      totalDeposits?: number
      totalWithdrawals?: number
      hasWithdrawnBasic?: boolean
    }
  ): Promise<ICouchUser | null> {
    const user = await this.findByClerkId(clerkUserId)
    if (!user) return null

    const statsUpdates: any = {}
    if (updates.totalWon !== undefined) {
      statsUpdates.totalWon = user.totalWon + updates.totalWon
    }
    if (updates.totalLost !== undefined) {
      statsUpdates.totalLost = user.totalLost + updates.totalLost
    }
    if (updates.totalDeposits !== undefined) {
      statsUpdates.totalDeposits = user.totalDeposits + updates.totalDeposits
    }
    if (updates.totalWithdrawals !== undefined) {
      statsUpdates.totalWithdrawals = user.totalWithdrawals + updates.totalWithdrawals
    }
    if (updates.hasWithdrawnBasic !== undefined) {
      statsUpdates.hasWithdrawnBasic = updates.hasWithdrawnBasic
    }

    return await this.updateUser(user._id!, statsUpdates)
  }

  // Update user tier based on referrals
  static async updateTier(clerkUserId: string, referralCount: number): Promise<ICouchUser | null> {
    const user = await this.findByClerkId(clerkUserId)
    if (!user) return null

    let newTier = 'Basic'
    for (let i = USER_TIERS.length - 1; i >= 0; i--) {
      const tierDef = USER_TIERS[i]
      if (referralCount >= tierDef.minReferrals) {
        newTier = tierDef.name
        break
      }
    }

    if (user.tier !== newTier) {
      return await this.updateUser(user._id!, { tier: newTier as any })
    }

    return user
  }

  // Get users by tier
  static async getUsersByTier(tier: string): Promise<ICouchUser[]> {
    const db = await this.getDb()
    
    try {
      return await db.queryView('users', 'by_tier', {
        key: tier
      })
    } catch (error) {
      console.error('Error getting users by tier:', error)
      return []
    }
  }

  // Validate user data
  static validateUser(userData: Partial<ICouchUser>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!userData.clerkUserId) {
      errors.push('Clerk User ID is required')
    }
    if (!userData.userName) {
      errors.push('User name is required')
    }
    if (!userData.userEmail) {
      errors.push('User email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.userEmail)) {
      errors.push('Invalid email format')
    }

    if (userData.cashBalance !== undefined && userData.cashBalance < 0) {
      errors.push('Cash balance cannot be negative')
    }
    if (userData.bonusBalance !== undefined && userData.bonusBalance < 0) {
      errors.push('Bonus balance cannot be negative')
    }

    if (userData.tier && !USER_TIERS.some(t => t.name === userData.tier)) {
      errors.push('Invalid tier')
    }

    return { isValid: errors.length === 0, errors }
  }
}

export default CouchUser
