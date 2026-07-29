// Secure Wallet Context - MongoDB Database Integration
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { logError, logInfo } from '@/lib/centralized-error-handler'

interface WalletState {
  cashBalance: number
  bonusBalance: number
  indCoins: number
  totalWinnings: number
  totalLosses: number
  gamesPlayed: number
  tier: string
  referralCount: number
  referralEarnings: number
  isLoading: boolean
  lastUpdated: Date | null
  adminAccess: {
    plan: string
    expiresAt: string | null
    notificationsRemaining: number
  }
}

interface Transaction {
  id: string
  type: string
  amount: number
  game?: string
  timestamp: Date
  status: string
}

interface WalletContextType {
  // Balance data
  cashBalance: number
  bonusBalance: number
  indCoins: number
  totalBalance: number
  
  // User stats
  totalWinnings: number
  totalLosses: number
  gamesPlayed: number
  tier: string
  referralCount: number
  referralEarnings: number
  
  // State
  isLoading: boolean
  lastUpdated: Date | null
  transactions: Transaction[]
  
  // Actions
  refreshBalance: () => Promise<void>
  deposit: (amount: number) => Promise<boolean>
  withdraw: (amount: number, method: string, accountDetails: any) => Promise<boolean>
  
  // Legacy compatibility methods
  hasAdminAccess: () => boolean
  placeChallenge: (amount: number, gameId: string) => boolean
  addWinning: (amount: number, gameId: string, multiplier?: number) => void
  purchaseAdminAccess: (plan: string) => boolean
  
  // Admin access data
  adminAccess: {
    plan: string
    expiresAt: string | null
    notificationsRemaining: number
  }
  
  // Utilities
  canAfford: (amount: number) => boolean
  formatCurrency: (amount: number) => string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [walletState, setWalletState] = useState<WalletState>({
    cashBalance: 0,
    bonusBalance: 0,
    indCoins: 899,
    totalWinnings: 0,
    totalLosses: 0,
    gamesPlayed: 0,
    tier: 'Basic',
    referralCount: 0,
    referralEarnings: 0,
    isLoading: true,
    lastUpdated: null,
    adminAccess: {
      plan: 'trial',
      expiresAt: null,
      notificationsRemaining: 5
    }
  })
  
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Initialize wallet data when user loads
  useEffect(() => {
    if (isLoaded && user) {
      refreshBalance()
    }
  }, [isLoaded, user])

  const refreshBalance = async () => {
    if (!user) return

    try {
      setWalletState(prev => ({ ...prev, isLoading: true }))
      
      const response = await fetch('/api/wallet/balance')
              
              if (response.ok) {
        const data = await response.json()
        
                    setWalletState(prev => ({
                      ...prev,
          cashBalance: data.cashBalance || 0,
          bonusBalance: data.bonusBalance || 0,
          indCoins: data.indCoins || 899,
          totalWinnings: data.user?.totalWinnings || prev.totalWinnings || 0,
          totalLosses: data.user?.totalLosses || prev.totalLosses || 0,
          gamesPlayed: data.user?.gamesPlayed || prev.gamesPlayed || 0,
          tier: data.user?.tier || prev.tier || 'Basic',
          referralCount: data.user?.referralCount || prev.referralCount || 0,
          referralEarnings: data.user?.referralEarnings || prev.referralEarnings || 0,
          lastUpdated: new Date(),
          isLoading: false
        }))

        logInfo('Wallet balance refreshed', { userId: user.id })
      } else {
        logError('Failed to fetch balance', undefined, { userId: user.id })
        setWalletState(prev => ({ ...prev, isLoading: false }))
            }
          } catch (error) {
      logError('Wallet refresh error', error instanceof Error ? error : new Error(String(error)), { userId: user.id })
      setWalletState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const deposit = async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0) return false

    try {
      const response = await fetch('/api/wallet/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
        })
        
        if (response.ok) {
        const data = await response.json()
              setWalletState(prev => ({
                ...prev,
          cashBalance: data.cashBalance,
          bonusBalance: data.bonusBalance,
          indCoins: data.indCoins
        }))
        
        toast.success(`Deposited ₹${amount.toLocaleString()}`)
        logInfo('Deposit successful', { userId: user.id, action: 'deposit' })
    return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Deposit failed')
        logError('Deposit failed', undefined, { userId: user.id, action: 'deposit' })
      return false
    }
    } catch (error) {
      logError('Deposit error', error instanceof Error ? error : new Error(String(error)), { userId: user.id, action: 'deposit' })
      toast.error('Deposit failed')
      return false
    }
  }

  const withdraw = async (amount: number, method: string, accountDetails: any): Promise<boolean> => {
    if (!user || amount <= 0) return false

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method, accountDetails })
      })
      
      if (response.ok) {
        const data = await response.json()
        setWalletState(prev => ({
          ...prev,
          cashBalance: data.cashBalance,
          bonusBalance: data.bonusBalance,
          indCoins: data.indCoins
        }))
        
        toast.success(data.message || `Withdrawal request submitted for ₹${amount.toLocaleString()}`)
        logInfo('Withdrawal requested', { userId: user.id, action: 'withdrawal' })
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Withdrawal failed')
        logError('Withdrawal failed', undefined, { userId: user.id, action: 'withdrawal' })
        return false
      }
    } catch (error) {
      logError('Withdrawal error', error instanceof Error ? error : new Error(String(error)), { userId: user.id, action: 'withdrawal' })
      toast.error('Withdrawal failed')
      return false
    }
  }

  const canAfford = (amount: number): boolean => {
    return (walletState.cashBalance + walletState.bonusBalance) >= amount
  }

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString()}`
  }

    // Legacy compatibility methods for existing components
  const hasAdminAccess = (): boolean => {
    return walletState.adminAccess.plan !== 'trial' && walletState.adminAccess.notificationsRemaining > 0
  }

  const placeChallenge = (amount: number, gameId: string): boolean => {
    // Legacy method - games should now use the secure game API
    console.warn('placeChallenge is deprecated, use secure game API instead')
    return canAfford(amount)
  }

  const addWinning = (amount: number, gameId: string, multiplier?: number): void => {
    // Legacy method - wins are now handled by secure game API
    console.warn('addWinning is deprecated, handled by secure game API')
    refreshBalance() // Refresh balance to get updated data from database
  }

  const purchaseAdminAccess = (plan: string): boolean => {
    const planCosts = {
      'basic': 1599,
      'premium': 1699,
      'ultimate': 1799
    }
    
    const cost = planCosts[plan as keyof typeof planCosts]
    if (!cost || walletState.indCoins < cost) {
      toast.error('Insufficient IND coins')
      return false
    }

    // Update admin access
    setWalletState(prev => ({
      ...prev,
      indCoins: prev.indCoins - cost,
      adminAccess: {
        plan,
        expiresAt: new Date(Date.now() + (plan === 'ultimate' ? 5 * 60 * 60 * 1000 : 45 * 60 * 1000)).toISOString(),
        notificationsRemaining: plan === 'ultimate' ? 150 : plan === 'premium' ? 56 : 38
      }
    }))

    toast.success(`${plan.charAt(0).toUpperCase() + plan.slice(1)} Admin Access activated!`)
    return true
  }

  const contextValue: WalletContextType = {
    // Balance data
    cashBalance: walletState.cashBalance,
    bonusBalance: walletState.bonusBalance,
    indCoins: walletState.indCoins,
    totalBalance: walletState.cashBalance + walletState.bonusBalance,
    
    // User stats
    totalWinnings: walletState.totalWinnings,
    totalLosses: walletState.totalLosses,
    gamesPlayed: walletState.gamesPlayed,
    tier: walletState.tier,
    referralCount: walletState.referralCount,
    referralEarnings: walletState.referralEarnings,
    
    // State
    isLoading: walletState.isLoading,
    lastUpdated: walletState.lastUpdated,
    transactions,
    
    // Actions
    refreshBalance,
    deposit,
    withdraw,
    
    // Legacy compatibility methods
    hasAdminAccess,
    placeChallenge,
    addWinning,
    purchaseAdminAccess,
    
    // Admin access data
    adminAccess: walletState.adminAccess,
    
    // Utilities
    canAfford,
    formatCurrency
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
