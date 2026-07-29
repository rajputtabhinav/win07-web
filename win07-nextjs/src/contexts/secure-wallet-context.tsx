"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { walletService, type WalletBalance, type UserData, type Transaction } from '@/lib/wallet-service'
import { getUserEmoji } from '@/utils/user-emoji'
import { generateReferralCode, getUserReferralInfo, completeReferral, type UserReferralInfo } from '@/utils/referral-system'

interface UserTier {
  name: 'Basic' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  minReferrals: number
  maxReferrals: number | null
  withdrawalLimit: number
  color: string
  description: string
}

interface WalletContextType {
  // Balance data
  balance: number // Combined cash + bonus balance
  cashBalance: number
  bonusBalance: number
  totalWon: number
  totalLost: number
  totalDeposits: number
  totalWithdrawals: number
  
  // User data
  userName: string
  userEmail: string
  userEmoji: string
  tier: string
  hasWithdrawnBasic: boolean
  
  // State management
  isLoading: boolean
  lastUpdated: Date | null
  transactions: Transaction[]
  referralInfo: UserReferralInfo | null
  
  // Game functions
  placeChallenge: (amount: number, gameId: string, betDetails?: any) => Promise<boolean>
  addWinning: (amount: number, gameId: string, winDetails?: any) => Promise<boolean>
  
  // Wallet functions
  deposit: (amount: number, paymentData?: any, verified?: boolean) => Promise<boolean>
  withdraw: (amount: number, method: 'bank' | 'upi', accountDetails: any) => Promise<boolean>
  
  // Data functions
  refreshBalance: () => Promise<boolean>
  getTransactions: (options?: any) => Promise<Transaction[]>
  
  // Utility functions
  getUserTier: () => UserTier
  getWithdrawalLimits: () => { maxWithdrawal: number; canWithdraw: boolean }
  canWithdraw: (amount: number) => { allowed: boolean; reason?: string }
  
  // Admin functions (for admin users only)
  isAdmin: () => boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function SecureWalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  
  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [referralInfo, setReferralInfo] = useState<UserReferralInfo | null>(null)
  
  // User and balance data
  const [balance, setBalance] = useState(0)
  const [cashBalance, setCashBalance] = useState(0)
  const [bonusBalance, setBonusBalance] = useState(0)
  const [totalWon, setTotalWon] = useState(0)
  const [totalLost, setTotalLost] = useState(0)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userEmoji, setUserEmoji] = useState('😊')
  const [tier, setTier] = useState('Basic')
  const [hasWithdrawnBasic, setHasWithdrawnBasic] = useState(false)

  // User tier definitions
  const USER_TIERS: UserTier[] = [
    {
      name: 'Basic',
      minReferrals: 0,
      maxReferrals: 2,
      withdrawalLimit: 1000,
      color: 'text-gray-400',
      description: 'One-time withdrawal of ₹1000'
    },
    {
      name: 'Bronze',
      minReferrals: 2,
      maxReferrals: 12,
      withdrawalLimit: 5000,
      color: 'text-orange-400',
      description: 'Up to ₹5000 per withdrawal'
    },
    {
      name: 'Silver',
      minReferrals: 5,
      maxReferrals: 20,
      withdrawalLimit: 15000,
      color: 'text-gray-300',
      description: 'Up to ₹15000 per withdrawal'
    },
    {
      name: 'Gold',
      minReferrals: 20,
      maxReferrals: 50,
      withdrawalLimit: 50000,
      color: 'text-yellow-400',
      description: 'Up to ₹50000 per withdrawal'
    },
    {
      name: 'Platinum',
      minReferrals: 50,
      maxReferrals: null,
      withdrawalLimit: 100000,
      color: 'text-blue-400',
      description: 'Up to ₹100000 per withdrawal'
    }
  ]

  // Admin email configuration
  const isAdmin = (): boolean => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return false
    const adminEmails = [
      'admin@win07pro.com',
      'support@win07pro.com',
      'abhinavrajput2424@gmail.com'
    ]
    return adminEmails.includes(user.emailAddresses[0].emailAddress)
  }

  // Initialize wallet data when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      initializeWallet()
      initializeReferralInfo()
    }
  }, [isLoaded, user])

  const initializeWallet = async () => {
    try {
      setIsLoading(true)
      const result = await walletService.getBalance()
      
      if (result.error) {
        // Only show error if it's not an auth issue (user might not be signed in yet)
        if (!result.error.includes('Unauthorized')) {
          console.error('Failed to load wallet:', result.error)
          toast.error('Failed to load wallet data')
        }
        return
      }

      if (result.balance && result.user) {
        // Update balance
        setCashBalance(result.balance.cash)
        setBonusBalance(result.balance.bonus)
        setBalance(result.balance.total)
        
        // Update user data
        setUserName(result.user.userName)
        setUserEmail(result.user.email)
        setUserEmoji(result.user.emoji)
        setTier(result.user.tier)
        setTotalWon(result.user.totalWon)
        setTotalLost(result.user.totalLost)
        setTotalDeposits(result.user.totalDeposits)
        setTotalWithdrawals(result.user.totalWithdrawals)
        setHasWithdrawnBasic(result.user.hasWithdrawnBasic)
        
        setLastUpdated(new Date())
        
        // Load recent transactions
        loadTransactions()
      }
    } catch (error) {
      console.error('Error initializing wallet:', error)
      // Don't show toast error for auth issues
      if (!error.message?.includes('Unauthorized')) {
        toast.error('Failed to initialize wallet')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const initializeReferralInfo = () => {
    if (!user?.id) return
    
    const referralData = getUserReferralInfo(user.id)
    setReferralInfo(referralData)
  }

  const loadTransactions = async () => {
    try {
      const result = await walletService.getTransactions({ limit: 50 })
      if (result.transactions) {
        setTransactions(result.transactions)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  // Refresh balance from server
  const refreshBalance = async (): Promise<boolean> => {
    try {
      const result = await walletService.getBalance()
      
      if (result.error) {
        console.error('Failed to refresh balance:', result.error)
        return false
      }

      if (result.balance && result.user) {
        setCashBalance(result.balance.cash)
        setBonusBalance(result.balance.bonus)
        setBalance(result.balance.total)
        setTotalWon(result.user.totalWon)
        setTotalLost(result.user.totalLost)
        setTotalDeposits(result.user.totalDeposits)
        setTotalWithdrawals(result.user.totalWithdrawals)
        setLastUpdated(new Date())
      }
      
      return true
    } catch (error) {
      console.error('Error refreshing balance:', error)
      return false
    }
  }

  // Place a bet
  const placeChallenge = async (amount: number, gameId: string, betDetails?: any): Promise<boolean> => {
    try {
      const result = await walletService.placeBet(amount, gameId, betDetails)
      
      if (result.error) {
        toast.error(result.error)
        return false
      }

      if (result.newBalance) {
        setCashBalance(result.newBalance.cash)
        setBonusBalance(result.newBalance.bonus)
        setBalance(result.newBalance.total)
        setTotalLost(prev => prev + amount)
        setLastUpdated(new Date())
      }
      
      // Refresh transactions
      loadTransactions()
      
      return true
    } catch (error) {
      console.error('Error placing bet:', error)
      toast.error('Failed to place bet')
      return false
    }
  }

  // Add winnings
  const addWinning = async (amount: number, gameId: string, winDetails?: any): Promise<boolean> => {
    try {
      const result = await walletService.addWinnings(amount, gameId, winDetails)
      
      if (result.error) {
        console.error('Failed to add winnings:', result.error)
        return false
      }

      if (result.newBalance) {
        setCashBalance(result.newBalance.cash)
        setBonusBalance(result.newBalance.bonus)
        setBalance(result.newBalance.total)
        setTotalWon(prev => prev + amount)
        setLastUpdated(new Date())
      }
      
      // Refresh transactions
      loadTransactions()
      
      return true
    } catch (error) {
      console.error('Error adding winnings:', error)
      return false
    }
  }

  // Make a deposit
  const deposit = async (amount: number, paymentData?: any, verified: boolean = false): Promise<boolean> => {
    try {
      const result = await walletService.deposit(amount, paymentData, verified)
      
      if (result.error) {
        toast.error(result.error)
        return false
      }

      if (result.message) {
        toast.success(result.message)
      }

      if (result.newBalance) {
        setCashBalance(result.newBalance.cash)
        setBonusBalance(result.newBalance.bonus)
        setBalance(result.newBalance.total)
        setTotalDeposits(prev => prev + amount)
        setLastUpdated(new Date())
      }
      
      // Check for pending referral completion
      if (referralInfo?.pendingReferralCode && amount >= 150) {
        try {
          await completeReferral(user?.id || '', referralInfo.pendingReferralCode, amount)
          toast.success('Referral bonus applied!')
          // Refresh referral info
          initializeReferralInfo()
        } catch (error) {
          console.error('Error completing referral:', error)
        }
      }
      
      // Refresh transactions
      loadTransactions()
      
      return true
    } catch (error) {
      console.error('Error making deposit:', error)
      toast.error('Failed to process deposit')
      return false
    }
  }

  // Request withdrawal
  const withdraw = async (amount: number, method: 'bank' | 'upi', accountDetails: any): Promise<boolean> => {
    try {
      const result = await walletService.withdraw(amount, method, accountDetails)
      
      if (result.error) {
        toast.error(result.error)
        return false
      }

      if (result.message) {
        toast.success(result.message)
      }

      if (result.newBalance) {
        setCashBalance(result.newBalance.cash)
        setBonusBalance(result.newBalance.bonus)
        setBalance(result.newBalance.total)
        setLastUpdated(new Date())
        
        // Update withdrawal status for Basic tier
        if (tier === 'Basic') {
          setHasWithdrawnBasic(true)
        }
      }
      
      // Refresh transactions
      loadTransactions()
      
      return true
    } catch (error) {
      console.error('Error requesting withdrawal:', error)
      toast.error('Failed to request withdrawal')
      return false
    }
  }

  // Get transactions with options
  const getTransactions = async (options: any = {}): Promise<Transaction[]> => {
    try {
      const result = await walletService.getTransactions(options)
      if (result.transactions) {
        setTransactions(result.transactions)
        return result.transactions
      }
      return []
    } catch (error) {
      console.error('Error getting transactions:', error)
      return []
    }
  }

  // Get user tier based on referral count
  const getUserTier = (): UserTier => {
    const referralCount = referralInfo?.referralCount || 0
    
    for (let i = USER_TIERS.length - 1; i >= 0; i--) {
      const tierDef = USER_TIERS[i]
      if (referralCount >= tierDef.minReferrals) {
        return tierDef
      }
    }
    
    return USER_TIERS[0] // Default to Basic
  }

  // Get withdrawal limits for current tier
  const getWithdrawalLimits = () => {
    const userTier = getUserTier()
    return {
      maxWithdrawal: userTier.withdrawalLimit,
      canWithdraw: tier !== 'Basic' || !hasWithdrawnBasic
    }
  }

  // Check if user can withdraw a specific amount
  const canWithdraw = (amount: number): { allowed: boolean; reason?: string } => {
    const limits = getWithdrawalLimits()
    
    if (!limits.canWithdraw) {
      return { allowed: false, reason: 'Basic tier users can only withdraw once' }
    }
    
    if (amount > limits.maxWithdrawal) {
      return { allowed: false, reason: `Maximum withdrawal for ${tier} tier is ₹${limits.maxWithdrawal}` }
    }
    
    if (amount > cashBalance) {
      return { allowed: false, reason: 'Insufficient cash balance' }
    }
    
    return { allowed: true }
  }

  const contextValue: WalletContextType = {
    // Balance data
    balance,
    cashBalance,
    bonusBalance,
    totalWon,
    totalLost,
    totalDeposits,
    totalWithdrawals,
    
    // User data
    userName,
    userEmail,
    userEmoji,
    tier,
    hasWithdrawnBasic,
    
    // State management
    isLoading,
    lastUpdated,
    transactions,
    referralInfo,
    
    // Game functions
    placeChallenge,
    addWinning,
    
    // Wallet functions
    deposit,
    withdraw,
    
    // Data functions
    refreshBalance,
    getTransactions,
    
    // Utility functions
    getUserTier,
    getWithdrawalLimits,
    canWithdraw,
    isAdmin
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export function useSecureWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useSecureWallet must be used within a SecureWalletProvider')
  }
  return context
}

// Export the context for use in other components
export { WalletContext }
