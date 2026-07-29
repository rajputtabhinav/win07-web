// Database Service Layer - Replaces AI Agent with MongoDB operations
import { connectMongoose } from './mongodb'
import { User, Transaction, Withdrawal, GameActivity, AdminAction } from '../models'
import type { IUser, ITransaction, IWithdrawal, IGameActivity, IAdminAction } from '../models'

class DatabaseService {
  private initialized = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return
    
    try {
      await connectMongoose()
      this.initialized = true
      console.log('✅ Database service initialized')
    } catch (error) {
      console.error('❌ Database service initialization failed:', error)
      throw error
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  // User Management
  async getUser(clerkUserId: string): Promise<IUser | null> {
    await this.ensureInitialized()
    return await User.findByClerkId(clerkUserId)
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    await this.ensureInitialized()
    
    // Generate emoji for user
    const emojis = ['😀', '😎', '🤠', '🥳', '😍', '🤑', '🎯', '🎲', '🎰', '🎮', '⭐', '🌟', '💫', '⚡', '🔥']
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]
    
    const user = new User({
      ...userData,
      emoji,
      cashBalance: userData.cashBalance || 0,
      bonusBalance: userData.bonusBalance || 899, // Welcome bonus
      indCoins: userData.indCoins || 899,
      tier: 'Basic',
      status: 'offline',
      riskLevel: 'low',
      isActive: true
    })
    
    return await user.save()
  }

  async getOrCreateUser(clerkUserId: string, userData?: Partial<IUser>): Promise<IUser> {
    const existingUser = await this.getUser(clerkUserId)
    if (existingUser) {
      return existingUser
    }
    
    return await this.createUser({
      clerkUserId,
      ...userData
    })
  }

  async updateUser(clerkUserId: string, updates: Partial<IUser>): Promise<IUser | null> {
    await this.ensureInitialized()
    
    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { 
        ...updates, 
        lastActivity: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    )
    
    return user
  }

  async getAllUsers(limit: number = 100): Promise<IUser[]> {
    await this.ensureInitialized()
    return await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
  }

  async getActiveUsers(): Promise<IUser[]> {
    await this.ensureInitialized()
    return await User.getActiveUsers()
  }

  // Transaction Management
  async createTransaction(transactionData: Omit<ITransaction, '_id'>): Promise<ITransaction> {
    await this.ensureInitialized()
    
    const transaction = new Transaction({
      ...transactionData,
      status: transactionData.status || 'completed'
    })
    
    return await transaction.save()
  }

  async getTransactions(clerkUserId?: string, limit: number = 50): Promise<ITransaction[]> {
    await this.ensureInitialized()
    
    if (clerkUserId) {
      return await Transaction.findByClerkUserId(clerkUserId, limit)
    }
    
    return await Transaction.getRecentTransactions(limit)
  }

  async getUserTransactionSummary(clerkUserId: string) {
    await this.ensureInitialized()
    return await Transaction.getUserTransactionSummary(clerkUserId)
  }

  // Withdrawal Management
  async createWithdrawalRequest(withdrawalData: Omit<IWithdrawal, '_id'>): Promise<IWithdrawal> {
    await this.ensureInitialized()
    
    const withdrawal = new Withdrawal(withdrawalData)
    return await withdrawal.save()
  }

  async getWithdrawalRequests(status?: string): Promise<IWithdrawal[]> {
    await this.ensureInitialized()
    
    if (status === 'pending') {
      return await Withdrawal.getPendingWithdrawals()
    } else if (status === 'processed') {
      return await Withdrawal.getProcessedWithdrawals()
    }
    
    return await Withdrawal.find().sort({ createdAt: -1 }).limit(100)
  }

  async updateWithdrawalStatus(
    withdrawalId: string, 
    status: string, 
    adminId: string,
    notes?: string,
    reason?: string
  ): Promise<IWithdrawal | null> {
    await this.ensureInitialized()
    
    const withdrawal = await Withdrawal.findById(withdrawalId)
    if (!withdrawal) return null
    
    if (status === 'approved') {
      return await withdrawal.approve(adminId, notes)
    } else if (status === 'rejected') {
      return await withdrawal.reject(adminId, reason || 'Admin rejected', notes)
    }
    
    withdrawal.status = status as any
    withdrawal.processedBy = adminId
    withdrawal.processedAt = new Date()
    if (notes) withdrawal.adminNotes = notes
    
    return await withdrawal.save()
  }

  // Game Activity Management
  async recordGameActivity(activityData: Omit<IGameActivity, '_id'>): Promise<IGameActivity> {
    await this.ensureInitialized()
    
    const activity = new GameActivity(activityData)
    return await activity.save()
  }

  async getGameActivity(limit: number = 100): Promise<IGameActivity[]> {
    await this.ensureInitialized()
    return await GameActivity.getRecentActivity(limit)
  }

  async getUserGameStats(clerkUserId: string) {
    await this.ensureInitialized()
    return await GameActivity.getUserGameStats(clerkUserId)
  }

  async getGameStats(game?: string) {
    await this.ensureInitialized()
    return await GameActivity.getGameStats(game)
  }

  // Admin Action Logging
  async logAdminAction(actionData: Omit<IAdminAction, '_id'>): Promise<IAdminAction> {
    await this.ensureInitialized()
    return await AdminAction.logAction(actionData)
  }

  async getAdminActions(adminId?: string, limit: number = 100): Promise<IAdminAction[]> {
    await this.ensureInitialized()
    
    if (adminId) {
      return await AdminAction.findByAdminId(adminId, limit)
    }
    
    return await AdminAction.getRecentActions(limit)
  }

  // Statistics and Analytics
  async calculateAdminStats() {
    await this.ensureInitialized()
    
    const [
      totalUsers,
      activeUsers,
      totalDeposits,
      totalWithdrawals,
      totalGameRevenue,
      pendingWithdrawals,
      todayRegistrations
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ status: 'online' }),
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      GameActivity.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$profit', -1] } } } }
      ]),
      Withdrawal.countDocuments({ status: 'pending' }),
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ])

    return {
      totalUsers,
      activeUsers,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      totalGameRevenue: Math.max(0, totalGameRevenue[0]?.total || 0),
      pendingWithdrawals,
      todayRegistrations
    }
  }

  // User Wallet Operations
  async updateUserWallet(
    clerkUserId: string,
    amount: number,
    type: 'add' | 'subtract',
    walletType: 'cash' | 'bonus' | 'indCoins',
    reason: string,
    adminId?: string
  ): Promise<IUser | null> {
    await this.ensureInitialized()
    
    const user = await User.findOne({ clerkUserId })
    if (!user) return null
    
    const multiplier = type === 'add' ? 1 : -1
    const adjustedAmount = amount * multiplier
    
    if (walletType === 'cash') {
      user.cashBalance = Math.max(0, user.cashBalance + adjustedAmount)
      if (type === 'add') {
        user.totalDeposits += amount
      } else {
        user.totalWithdrawals += amount
      }
    } else if (walletType === 'bonus') {
      user.bonusBalance = Math.max(0, user.bonusBalance + adjustedAmount)
    } else if (walletType === 'indCoins') {
      user.indCoins = Math.max(0, user.indCoins + adjustedAmount)
    }
    
    await user.save()
    
    // Create transaction record
    await this.createTransaction({
      userId: user._id.toString(),
      clerkUserId,
      type: type === 'add' ? 'admin_deposit' : 'admin_withdrawal',
      amount,
      walletType: walletType === 'indCoins' ? 'cash' : walletType,
      description: `Admin ${type === 'add' ? 'added' : 'deducted'} ₹${amount} ${type === 'add' ? 'to' : 'from'} ${walletType} wallet. Reason: ${reason}`,
      status: 'completed',
      metadata: { adminId, reason }
    })
    
    // Log admin action
    if (adminId) {
      await this.logAdminAction({
        adminId,
        action: `wallet_${type}`,
        targetUserId: clerkUserId,
        targetUserName: user.name,
        details: { walletType, amount, reason },
        amount,
        reason,
        timestamp: new Date()
      })
    }
    
    return user
  }

  // Sync with Clerk users
  async syncWithClerk(clerkUsers: any[]): Promise<{ synced: number; errors: string[] }> {
    await this.ensureInitialized()
    
    let synced = 0
    const errors: string[] = []
    
    for (const clerkUser of clerkUsers) {
      try {
        await this.getOrCreateUser(clerkUser.id, {
          email: clerkUser.emailAddresses?.[0]?.emailAddress || 'no-email@win07pro.com',
          name: clerkUser.username || clerkUser.firstName || 'Anonymous Player',
          userName: clerkUser.username || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
        })
        synced++
      } catch (error) {
        errors.push(`Failed to sync user ${clerkUser.id}: ${error.message}`)
      }
    }
    
    return { synced, errors }
  }
}

// Singleton instance
export const databaseService = new DatabaseService()
