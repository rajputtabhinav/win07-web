// Admin data management and real-time utilities for WIN07 platform

export interface AdminUser {
  id: string
  name: string
  email: string
  cashBalance: number
  bonusBalance: number
  totalWon: number
  totalLost: number
  gamesPlayed: number
  referralCount: number
  tier: string
  isActive: boolean
  lastActive: Date
  joinedAt: Date
  emoji: string
  ipAddress?: string
  deviceInfo?: string
  totalDeposits: number
  totalWithdrawals: number
  adminNotes?: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface AdminTransaction {
  id: string
  userId: string
  userName: string
  userEmoji: string
  type: 'deposit' | 'withdrawal' | 'win' | 'loss' | 'referral' | 'bonus' | 'admin_adjustment'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'reviewing'
  description: string
  gameId?: string
  timestamp: Date
  ipAddress?: string
  paymentMethod?: string
  adminNotes?: string
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalDeposits: number
  totalWithdrawals: number
  totalGamesPlayed: number
  platformRevenue: number
  pendingWithdrawals: number
  todayRegistrations: number
  monthlyActiveUsers: number
  averageDepositAmount: number
  conversionRate: number
  retentionRate: number
}

export interface GameAnalytics {
  gameId: string
  name: string
  totalPlayers: number
  uniquePlayers: number
  totalBets: number
  totalWinnings: number
  houseEdge: number
  popularity: number
  averageBetAmount: number
  peakHours: number[]
  dailyRevenue: number
  playerRetention: number
}

export interface SystemAlert {
  id: string
  type: 'security' | 'financial' | 'technical' | 'user_behavior' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
}

export class AdminDataManager {
  private static instance: AdminDataManager
  private realTimeData: {
    users: AdminUser[]
    transactions: AdminTransaction[]
    stats: AdminStats
    gameAnalytics: GameAnalytics[]
    alerts: SystemAlert[]
  }

  constructor() {
    this.realTimeData = {
      users: [],
      transactions: [],
      stats: this.getDefaultStats(),
      gameAnalytics: [],
      alerts: []
    }
  }

  static getInstance(): AdminDataManager {
    if (!AdminDataManager.instance) {
      AdminDataManager.instance = new AdminDataManager()
    }
    return AdminDataManager.instance
  }

  // Generate realistic admin data
  generateRealisticData() {
    // Generate users with realistic distribution
    const users = this.generateUsers(100)
    const transactions = this.generateTransactions(users, 500)
    const gameAnalytics = this.generateGameAnalytics()
    const alerts = this.generateSystemAlerts()
    const stats = this.calculateStats(users, transactions)

    this.realTimeData = {
      users,
      transactions,
      stats,
      gameAnalytics,
      alerts
    }

    return this.realTimeData
  }

  private generateUsers(count: number): AdminUser[] {
    const firstNames = [
      'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
      'Priya', 'Ananya', 'Kavya', 'Diya', 'Aadhya', 'Saanvi', 'Pari', 'Avni', 'Riya', 'Myra',
      'Rohit', 'Amit', 'Vikash', 'Ravi', 'Ajay', 'Suresh', 'Ramesh', 'Mahesh', 'Dinesh', 'Rakesh'
    ]
    
    const lastNames = [
      'Sharma', 'Singh', 'Kumar', 'Gupta', 'Patel', 'Reddy', 'Jain', 'Khan', 'Yadav', 'Verma',
      'Agarwal', 'Mishra', 'Mehta', 'Shah', 'Chopra', 'Malhotra', 'Arora', 'Kapoor', 'Bansal'
    ]

    const users: AdminUser[] = []

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${firstName} ${lastName}`
      
      // Realistic balance distribution (80% low, 15% medium, 5% high)
      let cashBalance: number
      const rand = Math.random()
      if (rand < 0.8) {
        cashBalance = 0 // Use only real deposits, no fake amounts
      } else if (rand < 0.95) {
        cashBalance = 0 // Use only real deposits, no fake amounts
      } else {
        cashBalance = 0 // Use only real deposits, no fake amounts
      }

      const bonusBalance = 0 // No fake bonus balance
      const totalWon = 0 // No fake winnings data  
      const totalLost = 0 // No fake losses data
      const gamesPlayed = Math.floor(Math.random() * 500) + 10
      const referralCount = Math.floor(Math.random() * 25)
      const isActive = Math.random() > 0.25 // 75% active users
      
      users.push({
        id: `user_${(i + 1).toString().padStart(3, '0')}`,
        name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
        cashBalance,
        bonusBalance,
        totalWon,
        totalLost,
        gamesPlayed,
        referralCount,
        tier: this.getTierFromReferrals(referralCount),
        isActive,
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        joinedAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
        emoji: this.getUserEmoji(`user_${i + 1}`),
        ipAddress: this.generateIPAddress(),
        deviceInfo: this.generateDeviceInfo(),
        totalDeposits: 0, // No fake deposit data
        totalWithdrawals: Math.floor(totalWon * 0.6),
        adminNotes: Math.random() > 0.9 ? 'VIP Customer' : undefined,
        riskLevel: this.calculateRiskLevel(cashBalance, gamesPlayed, referralCount)
      })
    }

    return users.sort((a, b) => b.cashBalance - a.cashBalance)
  }

  private generateTransactions(users: AdminUser[], count: number): AdminTransaction[] {
    const transactions: AdminTransaction[] = []
    const transactionTypes = ['deposit', 'withdrawal', 'win', 'loss', 'referral', 'bonus']
    const games = ['aviator', 'mines', 'crash', 'plinko', 'teen-patti', 'andar-bahar', 'wheel']

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)] as any
      
      let amount: number
      switch (type) {
        case 'deposit':
          amount = 0 // No fake transaction amounts
          break
        case 'withdrawal':
          amount = 0 // No fake transaction amounts
          break
        case 'win':
        case 'loss':
          amount = 0 // No fake transaction amounts
          break
        default:
          amount = 0 // No fake transaction amounts
      }

      transactions.push({
        id: `txn_${(i + 1).toString().padStart(6, '0')}`,
        userId: user.id,
        userName: user.name,
        userEmoji: user.emoji,
        type,
        amount,
        status: this.getRandomStatus(),
        description: this.getTransactionDescription(type, amount),
        gameId: ['win', 'loss'].includes(type) ? games[Math.floor(Math.random() * games.length)] : undefined,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        ipAddress: user.ipAddress,
        paymentMethod: ['deposit', 'withdrawal'].includes(type) ? this.getRandomPaymentMethod() : undefined
      })
    }

    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  private generateGameAnalytics(): GameAnalytics[] {
    const games = [
      { id: 'aviator', name: 'Aviator' },
      { id: 'mines', name: 'Mines' },
      { id: 'crash', name: 'Crash' },
      { id: 'plinko', name: 'Plinko' },
      { id: 'teen-patti', name: 'Teen Patti' },
      { id: 'andar-bahar', name: 'Andar Bahar' },
      { id: 'wheel', name: 'Wheel' },

      { id: 'baccarat', name: 'Baccarat' },
      { id: 'blackjack', name: 'Blackjack' }
    ]

    return games.map(game => {
      const totalPlayers = Math.floor(Math.random() * 500) + 100
      const uniquePlayers = Math.floor(totalPlayers * (0.6 + Math.random() * 0.3))
      const totalBets = Math.floor(Math.random() * 2000000) + 500000
      const houseEdge = Math.random() * 3 + 1 // 1-4%
      const totalWinnings = Math.floor(totalBets * (1 - houseEdge / 100))

      return {
        gameId: game.id,
        name: game.name,
        totalPlayers,
        uniquePlayers,
        totalBets,
        totalWinnings,
        houseEdge,
        popularity: Math.floor(Math.random() * 100),
        averageBetAmount: Math.floor(totalBets / totalPlayers),
        peakHours: [19, 20, 21, 22], // Peak gaming hours
        dailyRevenue: Math.floor(totalBets * houseEdge / 100 / 30),
        playerRetention: Math.random() * 40 + 60 // 60-100%
      }
    })
  }

  private generateSystemAlerts(): SystemAlert[] {
    const alertTemplates = [
      {
        type: 'security' as const,
        priority: 'high' as const,
        title: 'Suspicious Login Activity',
        message: 'Multiple failed login attempts detected from IP: 192.168.1.100'
      },
      {
        type: 'financial' as const,
        priority: 'medium' as const,
        title: 'Large Withdrawal Request',
        message: 'User requested withdrawal of ₹50,000 - requires manual review'
      },
      {
        type: 'technical' as const,
        priority: 'low' as const,
        title: 'Server Performance',
        message: 'API response time increased by 15% in the last hour'
      },
      {
        type: 'user_behavior' as const,
        priority: 'medium' as const,
        title: 'Unusual Betting Pattern',
        message: 'User showing consistent winning pattern - possible investigation needed'
      }
    ]

    return alertTemplates.map((template, index) => ({
      id: `alert_${index + 1}`,
      ...template,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)),
      isRead: Math.random() > 0.5,
      actionRequired: template.priority === 'high' || template.priority === 'critical'
    }))
  }

  private calculateStats(users: AdminUser[], transactions: AdminTransaction[]): AdminStats {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const todayRegistrations = users.filter(u => u.joinedAt >= today).length
    const monthlyActiveUsers = users.filter(u => u.lastActive >= thisMonth && u.isActive).length

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalDeposits,
      totalWithdrawals,
      totalGamesPlayed: users.reduce((sum, u) => sum + u.gamesPlayed, 0),
      platformRevenue: (totalDeposits - totalWithdrawals) * 0.05, // 5% platform fee
      pendingWithdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length,
      todayRegistrations,
      monthlyActiveUsers,
      averageDepositAmount: totalDeposits / Math.max(1, transactions.filter(t => t.type === 'deposit').length),
      conversionRate: (users.filter(u => u.totalDeposits > 0).length / users.length) * 100,
      retentionRate: (monthlyActiveUsers / users.length) * 100
    }
  }

  // Helper methods
  private getTierFromReferrals(count: number): string {
    if (count >= 120) return 'Grandmaster'
    if (count >= 50) return 'Platinum'
    if (count >= 10) return 'Gold'
    if (count >= 3) return 'Bronze'
    return 'Basic'
  }

  private getUserEmoji(userId: string): string {
    const emojis = ['🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🐵', '🦊', '🐺', '🐱', '🐶', '🐰', '🦔', '🐭', '🐹', '🐷']
    const index = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % emojis.length
    return emojis[index]
  }

  private generateIPAddress(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }

  private generateDeviceInfo(): string {
    const devices = ['iPhone 14', 'Samsung Galaxy S23', 'OnePlus 11', 'Pixel 7', 'Windows PC', 'MacBook Pro', 'iPad Air']
    return devices[Math.floor(Math.random() * devices.length)]
  }

  private calculateRiskLevel(balance: number, games: number, referrals: number): 'low' | 'medium' | 'high' {
    const score = (balance / 10000) + (games / 100) + (referrals / 10)
    if (score > 5) return 'high'
    if (score > 2) return 'medium'
    return 'low'
  }

  private getRandomStatus(): AdminTransaction['status'] {
    const statuses: AdminTransaction['status'][] = ['pending', 'completed', 'failed', 'cancelled', 'reviewing']
    const weights = [0.1, 0.8, 0.05, 0.03, 0.02] // Most transactions are completed
    
    const random = Math.random()
    let sum = 0
    
    for (let i = 0; i < statuses.length; i++) {
      sum += weights[i]
      if (random <= sum) return statuses[i]
    }
    
    return 'completed'
  }

  private getTransactionDescription(type: string, amount: number): string {
    const descriptions = {
      deposit: `UPI deposit of ₹${amount}`,
      withdrawal: `Withdrawal request for ₹${amount}`,
      win: `Game win: ₹${amount}`,
      loss: `Game loss: ₹${amount}`,
      referral: `Referral bonus: ₹${amount}`,
      bonus: `Welcome bonus: ₹${amount}`
    }
    return descriptions[type as keyof typeof descriptions] || `Transaction: ₹${amount}`
  }

  private getRandomPaymentMethod(): string {
    const methods = ['UPI', 'PhonePe', 'Google Pay', 'Paytm', 'Bank Transfer', 'IMPS', 'NEFT']
    return methods[Math.floor(Math.random() * methods.length)]
  }

  // Public methods for getting real-time data
  getAllUsers(): AdminUser[] {
    return this.realTimeData.users
  }

  getRecentTransactions(limit: number = 50): AdminTransaction[] {
    return this.realTimeData.transactions.slice(0, limit)
  }

  getStats(): AdminStats {
    return this.realTimeData.stats
  }

  getGameAnalytics(): GameAnalytics[] {
    return this.realTimeData.gameAnalytics
  }

  getSystemAlerts(): SystemAlert[] {
    return this.realTimeData.alerts
  }

  // Admin actions
  updateUserStatus(userId: string, isActive: boolean): boolean {
    const user = this.realTimeData.users.find(u => u.id === userId)
    if (user) {
      user.isActive = isActive
      return true
    }
    return false
  }

  addAdminNote(userId: string, note: string): boolean {
    const user = this.realTimeData.users.find(u => u.id === userId)
    if (user) {
      user.adminNotes = note
      return true
    }
    return false
  }

  updateTransactionStatus(transactionId: string, status: AdminTransaction['status']): boolean {
    const transaction = this.realTimeData.transactions.find(t => t.id === transactionId)
    if (transaction) {
      transaction.status = status
      return true
    }
    return false
  }

  markAlertAsRead(alertId: string): boolean {
    const alert = this.realTimeData.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.isRead = true
      return true
    }
    return false
  }

  private getDefaultStats(): AdminStats {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalGamesPlayed: 0,
      platformRevenue: 0,
      pendingWithdrawals: 0,
      todayRegistrations: 0,
      monthlyActiveUsers: 0,
      averageDepositAmount: 0,
      conversionRate: 0,
      retentionRate: 0
    }
  }
}

// Export singleton instance
export const adminDataManager = AdminDataManager.getInstance()
