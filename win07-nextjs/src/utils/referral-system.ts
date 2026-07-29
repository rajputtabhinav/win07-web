import { errorHandler } from './error-handler'

export interface ReferralData {
  referrerId: string
  referrerName: string
  referrerEmail: string
  refereeId: string
  refereeName: string
  refereeEmail: string
  referralCode: string
  timestamp: Date
  status: 'pending' | 'completed' | 'rewarded'
  rewardAmount: number
  minimumDepositMet: boolean
}

export interface UserReferralInfo {
  referralCode: string
  referredBy?: string
  referralCount: number
  totalEarnings: number
  referrals: ReferralData[]
}

/**
 * Generate a unique referral code for a user
 */
export function generateReferralCode(userId: string, userName: string): string {
  // Create a code based on user name and ID
  const namePrefix = userName.slice(0, 3).toUpperCase()
  const userSuffix = userId.slice(-4).toUpperCase()
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase()
  
  return `${namePrefix}${userSuffix}${randomSuffix}`
}

/**
 * Validate if a referral code exists and is valid
 */
export function validateReferralCode(referralCode: string): { isValid: boolean, referrerInfo?: any } {
  try {
    if (!referralCode || referralCode.length < 6) {
      return { isValid: false }
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !localStorage) {
      return { isValid: false }
    }

    // Search through all user wallets to find the referral code owner
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith('wallet_')) {
        try {
          const walletData = JSON.parse(localStorage.getItem(key) || '{}')
          const referralInfo = walletData.referralInfo as UserReferralInfo
          
          if (referralInfo?.referralCode === referralCode.toUpperCase()) {
            return {
              isValid: true,
              referrerInfo: {
                id: key.replace('wallet_', ''),
                name: walletData.userName || 'Unknown User',
                email: walletData.userEmail || '',
                referralCode: referralInfo.referralCode
              }
            }
          }
        } catch (error) {
          continue // Skip invalid wallet data
        }
      }
    }

    return { isValid: false }
  } catch (error) {
    errorHandler.error('Error validating referral code', error as Error)
    return { isValid: false }
  }
}

/**
 * Process a referral when a new user signs up
 */
export function processReferral(
  referralCode: string,
  newUserId: string,
  newUserName: string,
  newUserEmail: string
): { success: boolean, message: string } {
  try {
    const validation = validateReferralCode(referralCode)
    
    if (!validation.isValid || !validation.referrerInfo) {
      return { success: false, message: 'Invalid referral code' }
    }

    const referrerId = validation.referrerInfo.id
    const referralData: ReferralData = {
      referrerId,
      referrerName: validation.referrerInfo.name,
      referrerEmail: validation.referrerInfo.email,
      refereeId: newUserId,
      refereeName: newUserName,
      refereeEmail: newUserEmail,
      referralCode: referralCode.toUpperCase(),
      timestamp: new Date(),
      status: 'pending',
      rewardAmount: 30, // ₹30 cash + ₹100 bonus per referral
      minimumDepositMet: false
    }

    // Add referral to referrer's wallet
    const referrerWalletKey = `wallet_${referrerId}`
    const referrerWalletData = JSON.parse(localStorage.getItem(referrerWalletKey) || '{}')
    
    if (!referrerWalletData.referralInfo) {
      referrerWalletData.referralInfo = {
        referralCode: validation.referrerInfo.referralCode,
        referralCount: 0,
        totalEarnings: 0,
        referrals: []
      }
    }

    referrerWalletData.referralInfo.referrals.push(referralData)
    referrerWalletData.referralInfo.referralCount = referrerWalletData.referralInfo.referrals.length
    localStorage.setItem(referrerWalletKey, JSON.stringify(referrerWalletData))

    // Set referred by info for new user
    const newUserWalletKey = `wallet_${newUserId}`
    const newUserWalletData = JSON.parse(localStorage.getItem(newUserWalletKey) || '{}')
    
    if (!newUserWalletData.referralInfo) {
      newUserWalletData.referralInfo = {
        referralCode: generateReferralCode(newUserId, newUserName),
        referralCount: 0,
        totalEarnings: 0,
        referrals: []
      }
    }
    
    newUserWalletData.referralInfo.referredBy = referrerId
    localStorage.setItem(newUserWalletKey, JSON.stringify(newUserWalletData))

    errorHandler.info('Referral processed successfully', {
      userId: newUserId,
      action: 'process_referral',
      data: { referralCode, referrerId }
    })

    return { 
      success: true, 
      message: `Welcome! You've been referred by ${validation.referrerInfo.name}. Complete your first deposit of ₹150+ to activate rewards!` 
    }
  } catch (error) {
    errorHandler.error('Error processing referral', error as Error)
    return { success: false, message: 'Failed to process referral' }
  }
}

/**
 * Complete a referral and award rewards when user makes minimum deposit
 */
export function completeReferral(userId: string, depositAmount: number): { success: boolean, referrerRewarded?: boolean } {
  try {
    const userWalletKey = `wallet_${userId}`
    const userWalletData = JSON.parse(localStorage.getItem(userWalletKey) || '{}')
    
    if (!userWalletData.referralInfo?.referredBy || depositAmount < 150) {
      return { success: false }
    }

    const referrerId = userWalletData.referralInfo.referredBy
    const referrerWalletKey = `wallet_${referrerId}`
    const referrerWalletData = JSON.parse(localStorage.getItem(referrerWalletKey) || '{}')

    // Find the pending referral
    const referralIndex = referrerWalletData.referralInfo?.referrals?.findIndex(
      (ref: ReferralData) => ref.refereeId === userId && ref.status === 'pending'
    )

    if (referralIndex === -1) {
      return { success: false }
    }

    // Update referral status
    referrerWalletData.referralInfo.referrals[referralIndex].status = 'completed'
    referrerWalletData.referralInfo.referrals[referralIndex].minimumDepositMet = true

    // Award rewards to referrer
    referrerWalletData.cashBalance = (referrerWalletData.cashBalance || 0) + 30 // ₹30 cash
    referrerWalletData.bonusBalance = (referrerWalletData.bonusBalance || 0) + 100 // ₹100 bonus
    referrerWalletData.referralInfo.totalEarnings = (referrerWalletData.referralInfo.totalEarnings || 0) + 130
    
    // Increment referral count for tier calculations
    referrerWalletData.referralInfo.referralCount = (referrerWalletData.referralInfo.referralCount || 0) + 1

    // Add transaction record
    if (!referrerWalletData.transactions) {
      referrerWalletData.transactions = []
    }

    referrerWalletData.transactions.push({
      id: `ref_${Date.now()}`,
      type: 'referral_reward',
      amount: 130,
      timestamp: new Date(),
      description: `Referral reward for ${userWalletData.userName || 'New User'}`
    })

    localStorage.setItem(referrerWalletKey, JSON.stringify(referrerWalletData))

    // Mark referral as rewarded
    referrerWalletData.referralInfo.referrals[referralIndex].status = 'rewarded'
    localStorage.setItem(referrerWalletKey, JSON.stringify(referrerWalletData))

    errorHandler.info('Referral reward completed', {
      userId: referrerId,
      action: 'complete_referral',
      data: { refereeId: userId, rewardAmount: 130 }
    })

    return { success: true, referrerRewarded: true }
  } catch (error) {
    errorHandler.error('Error completing referral', error as Error)
    return { success: false }
  }
}

/**
 * Get user's referral information
 */
export function getUserReferralInfo(userId: string): UserReferralInfo | null {
  try {
    const walletKey = `wallet_${userId}`
    const walletData = JSON.parse(localStorage.getItem(walletKey) || '{}')
    
    return walletData.referralInfo || null
  } catch (error) {
    errorHandler.error('Error getting user referral info', error as Error)
    return null
  }
}

/**
 * Apply a referral code for an existing user (if they didn't use one during signup)
 */
export function applyReferralCode(
  userId: string,
  referralCode: string
): { success: boolean, message: string } {
  try {
    const userWalletKey = `wallet_${userId}`
    const userWalletData = JSON.parse(localStorage.getItem(userWalletKey) || '{}')
    
    // Check if user already has a referrer
    if (userWalletData.referralInfo?.referredBy) {
      return { success: false, message: 'You have already used a referral code' }
    }

    // Check if user is trying to use their own code
    if (userWalletData.referralInfo?.referralCode === referralCode.toUpperCase()) {
      return { success: false, message: 'You cannot use your own referral code' }
    }

    const validation = validateReferralCode(referralCode)
    
    if (!validation.isValid || !validation.referrerInfo) {
      return { success: false, message: 'Invalid referral code' }
    }

    // Process the referral
    const result = processReferral(
      referralCode,
      userId,
      userWalletData.userName || 'User',
      userWalletData.userEmail || ''
    )

    return result
  } catch (error) {
    errorHandler.error('Error applying referral code', error as Error)
    return { success: false, message: 'Failed to apply referral code' }
  }
}
