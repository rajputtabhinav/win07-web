// Memory Sync Service for automatic user interaction tracking
// Integrates with the enhanced AI agent memory system

export interface MemoryInteraction {
  type: 'game' | 'deposit' | 'withdrawal' | 'referral' | 'support' | 'admin_action'
  timestamp: Date
  details: any
  outcome?: 'success' | 'failure' | 'pending'
  notes?: string
}

class MemorySyncService {
  private pendingUpdates: Map<string, MemoryInteraction[]> = new Map()
  private syncInterval: NodeJS.Timeout | null = null
  private isProcessing = false

  constructor() {
    // Start background sync process
    this.startBackgroundSync()
  }

  // Track a new user interaction
  public async trackInteraction(userId: string, interaction: Omit<MemoryInteraction, 'timestamp'>) {
    if (!userId) return

    const fullInteraction: MemoryInteraction = {
      ...interaction,
      timestamp: new Date()
    }

    // Add to pending updates
    const userUpdates = this.pendingUpdates.get(userId) || []
    userUpdates.push(fullInteraction)
    this.pendingUpdates.set(userId, userUpdates)

    // For critical interactions, sync immediately
    if (this.isCriticalInteraction(interaction)) {
      await this.syncUserMemory(userId)
    }
  }

  // Track game interaction
  public async trackGameInteraction(userId: string, gameData: {
    game: string
    betAmount: number
    winAmount: number
    outcome: 'win' | 'loss'
  }) {
    await this.trackInteraction(userId, {
      type: 'game',
      details: {
        game: gameData.game,
        betAmount: gameData.betAmount,
        winAmount: gameData.winAmount,
        profit: gameData.outcome === 'win' ? gameData.winAmount - gameData.betAmount : -gameData.betAmount
      },
      outcome: gameData.outcome === 'win' ? 'success' : 'failure'
    })
  }

  // Track financial interaction
  public async trackFinancialInteraction(userId: string, transactionData: {
    type: 'deposit' | 'withdrawal'
    amount: number
    method?: string
    status?: 'pending' | 'completed' | 'failed'
  }) {
    await this.trackInteraction(userId, {
      type: transactionData.type,
      details: {
        amount: transactionData.amount,
        method: transactionData.method,
        transactionType: transactionData.type
      },
      outcome: transactionData.status === 'completed' ? 'success' : 
               transactionData.status === 'failed' ? 'failure' : 'pending'
    })
  }

  // Track referral interaction
  public async trackReferralInteraction(userId: string, referralData: {
    referredUserId: string
    reward: number
    status: 'pending' | 'completed'
  }) {
    await this.trackInteraction(userId, {
      type: 'referral',
      details: {
        referredUserId: referralData.referredUserId,
        reward: referralData.reward
      },
      outcome: referralData.status === 'completed' ? 'success' : 'pending'
    })
  }

  // Track admin action
  public async trackAdminAction(userId: string, actionData: {
    action: string
    adminId: string
    details: any
    reason?: string
  }) {
    await this.trackInteraction(userId, {
      type: 'admin_action',
      details: {
        action: actionData.action,
        adminId: actionData.adminId,
        actionDetails: actionData.details
      },
      outcome: 'success',
      notes: actionData.reason
    })
  }

  // Check if interaction requires immediate sync
  private isCriticalInteraction(interaction: Omit<MemoryInteraction, 'timestamp'>): boolean {
    return (
      interaction.type === 'admin_action' ||
      (interaction.type === 'game' && interaction.details?.amount > 10000) ||
      (interaction.type === 'withdrawal' && interaction.details?.amount > 5000) ||
      interaction.outcome === 'failure'
    )
  }

  // Sync specific user's memory
  private async syncUserMemory(userId: string) {
    if (this.isProcessing) return

    const interactions = this.pendingUpdates.get(userId)
    if (!interactions || interactions.length === 0) return

    this.isProcessing = true

    try {
      // Send all pending interactions for this user
      for (const interaction of interactions) {
        await fetch('/api/admin/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateUserMemory',
            data: { userId, interaction },
            adminPassword: '24Kittu@24'
          })
        })
      }

      // Clear pending updates for this user
      this.pendingUpdates.delete(userId)
      console.log(`📝 Synced ${interactions.length} memory interactions for user ${userId}`)

    } catch (error) {
      console.error('Error syncing user memory:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Background sync process
  private startBackgroundSync() {
    this.syncInterval = setInterval(async () => {
      if (this.pendingUpdates.size === 0 || this.isProcessing) return

      // Process all pending updates
      const userIds = Array.from(this.pendingUpdates.keys())
      
      for (const userId of userIds) {
        await this.syncUserMemory(userId)
        
        // Add small delay between users to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }, 30000) // Sync every 30 seconds
  }

  // Get pending updates count
  public getPendingUpdatesCount(): number {
    return Array.from(this.pendingUpdates.values())
      .reduce((total, interactions) => total + interactions.length, 0)
  }

  // Force sync all pending updates
  public async forceSyncAll(): Promise<void> {
    const userIds = Array.from(this.pendingUpdates.keys())
    
    for (const userId of userIds) {
      await this.syncUserMemory(userId)
    }
  }

  // Cleanup
  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
}

// Singleton instance
export const memorySyncService = new MemorySyncService()

// Helper functions for easy integration
export const trackGamePlay = (userId: string, gameData: {
  game: string
  betAmount: number
  winAmount: number
  outcome: 'win' | 'loss'
}) => memorySyncService.trackGameInteraction(userId, gameData)

export const trackTransaction = (userId: string, transactionData: {
  type: 'deposit' | 'withdrawal'
  amount: number
  method?: string
  status?: 'pending' | 'completed' | 'failed'
}) => memorySyncService.trackFinancialInteraction(userId, transactionData)

export const trackReferral = (userId: string, referralData: {
  referredUserId: string
  reward: number
  status: 'pending' | 'completed'
}) => memorySyncService.trackReferralInteraction(userId, referralData)

export const trackAdminAction = (userId: string, actionData: {
  action: string
  adminId: string
  details: any
  reason?: string
}) => memorySyncService.trackAdminAction(userId, actionData)
