import { useEffect } from 'react'
import { useWallet } from '@/contexts/wallet-context'

interface GameData {
  game: string
  betAmount: number
  winAmount: number
  outcome: 'win' | 'loss'
}

// Custom hook to sync user data with admin agent
export const useAdminSync = () => {
  const wallet = useWallet()

  // Sync user data whenever wallet state changes
  useEffect(() => {
    if (wallet.isInitialized) {
      syncUserData()
    }
  }, [
    wallet.cashBalance,
    wallet.indCoins,
    wallet.referralCount,
    wallet.adminAccess,
    wallet.isInitialized
  ])

  const syncUserData = async () => {
    try {
      // Get user data from wallet context
      const userData = {
        id: 'user_' + Date.now(), // In real app, this would be from Clerk
        email: 'user@win07pro.com', // In real app, this would be from Clerk
        name: 'Player ' + Math.floor(Math.random() * 1000), // In real app, this would be from Clerk
        signupDate: new Date().toISOString(),
        cashBalance: wallet.cashBalance,
        indCoins: wallet.indCoins,
        referralCount: wallet.referralCount,
        totalDeposits: wallet.transactions
          .filter(t => t.type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: wallet.transactions
          .filter(t => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0),
        gamesPlayed: wallet.transactions
          .filter(t => t.type === 'win' || t.type === 'loss')
          .length,
        totalWinnings: wallet.transactions
          .filter(t => t.type === 'win')
          .reduce((sum, t) => sum + t.amount, 0),
        totalLosses: wallet.transactions
          .filter(t => t.type === 'loss')
          .reduce((sum, t) => sum + t.amount, 0),
        tier: getUserTier(wallet.referralCount),
        lastActivity: new Date().toISOString(),
        status: 'online' as const,
        adminAccess: wallet.adminAccess.plan !== 'none' ? {
          plan: wallet.adminAccess.plan,
          expiresAt: wallet.adminAccess.expiresAt?.toString(),
          notificationsRemaining: wallet.adminAccess.notificationsRemaining
        } : undefined
      }

      // Send data to admin agent
      await fetch('/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateUser',
          data: userData,
          adminPassword: '24Kittu@24'
        })
      })
    } catch (error) {
      console.error('Failed to sync user data:', error)
    }
  }

  const syncGameActivity = async (gameData: GameData) => {
    try {
      const profit = gameData.outcome === 'win' 
        ? gameData.winAmount - gameData.betAmount
        : -gameData.betAmount

      const activityData = {
        userId: 'user_' + Date.now(),
        userName: 'Player ' + Math.floor(Math.random() * 1000),
        game: gameData.game,
        betAmount: gameData.betAmount,
        winAmount: gameData.winAmount,
        profit,
        outcome: gameData.outcome,
        timestamp: new Date().toISOString()
      }

      await fetch('/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addGameActivity',
          data: activityData,
          adminPassword: '24Kittu@24'
        })
      })
    } catch (error) {
      console.error('Failed to sync game activity:', error)
    }
  }

  const syncLiveEvent = async (type: string, description: string, amount?: number) => {
    try {
      const eventData = {
        type,
        userId: 'user_' + Date.now(),
        userName: 'Player ' + Math.floor(Math.random() * 1000),
        description,
        amount,
        timestamp: new Date().toISOString()
      }

      await fetch('/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addLiveEvent',
          data: eventData,
          adminPassword: '24Kittu@24'
        })
      })
    } catch (error) {
      console.error('Failed to sync live event:', error)
    }
  }

  return {
    syncUserData,
    syncGameActivity,
    syncLiveEvent
  }
}

// Helper function to determine user tier
function getUserTier(referralCount: number): string {
  if (referralCount >= 120) return 'Grandmaster'
  if (referralCount >= 10) return 'Gold'
  if (referralCount >= 3) return 'Bronze'
  return 'Basic'
}

// Auto-sync hook for components
export const useAutoSync = () => {
  const { syncUserData, syncGameActivity, syncLiveEvent } = useAdminSync()
  
  // Auto-sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      syncUserData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [syncUserData])

  // Sync on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncUserData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [syncUserData])

  return {
    syncGameActivity,
    syncLiveEvent
  }
}
