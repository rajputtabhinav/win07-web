// New MongoDB-based Admin Dashboard API
import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'
import { adminSessionManager } from '@/lib/admin-session'

// Verify admin authentication
async function verifyAdminAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    return await adminSessionManager.verifySession(token)
  }
  
  // Fallback to password verification
  const { adminPassword } = await req.json().catch(() => ({}))
  if (adminPassword) {
    const validPassword = process.env.ADMIN_PASSWORD || '24Kittu@24'
    return adminPassword === validPassword
  }
  
  return false
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const body = await req.json()
    const { action, data } = body

    switch (action) {
      case 'getAdminData':
        return await handleGetAdminData()
      
      case 'getWithdrawals':
        return await handleGetWithdrawals()
      
      case 'getDeposits':
        return await handleGetDeposits()
      
      case 'processWithdrawal':
        return await handleProcessWithdrawal(data)
      
      case 'verifyDeposit':
        return await handleVerifyDeposit(data)
      
      case 'updateUserWallet':
        return await handleUpdateUserWallet(data)
      
      case 'getUserData':
        return await handleGetUserData(data.userId)
      
      case 'forceRefresh':
        return await handleForceRefresh()
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleGetAdminData() {
  try {
    const [users, stats, gameActivity, pendingWithdrawals] = await Promise.all([
      databaseService.getAllUsers(100),
      databaseService.calculateAdminStats(),
      databaseService.getGameActivity(50),
      databaseService.getWithdrawalRequests('pending')
    ])

    // Calculate summary statistics
    const summary = {
      totalUsers: users.length,
      onlineUsers: users.filter(u => u.status === 'online').length,
      totalBalance: users.reduce((sum, u) => sum + u.cashBalance, 0),
      totalCoins: users.reduce((sum, u) => sum + u.indCoins, 0),
      topUsers: users
        .sort((a, b) => (b.totalWinnings - b.totalLosses) - (a.totalWinnings - a.totalLosses))
        .slice(0, 10)
    }

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.clerkUserId,
          email: user.email,
          name: user.name,
          signupDate: user.createdAt.toISOString(),
          cashBalance: user.cashBalance,
          bonusBalance: user.bonusBalance,
          indCoins: user.indCoins,
          referralCount: user.referralCount,
          referralEarnings: user.referralEarnings,
          totalDeposits: user.totalDeposits,
          totalWithdrawals: user.totalWithdrawals,
          gamesPlayed: user.gamesPlayed,
          totalWinnings: user.totalWinnings,
          totalLosses: user.totalLosses,
          tier: user.tier,
          lastActivity: user.lastActivity.toISOString(),
          status: user.status,
          adminAccess: user.adminAccess
        })),
        gameActivity: gameActivity.map(activity => ({
          id: activity._id,
          userId: activity.clerkUserId,
          userName: activity.userName,
          game: activity.game,
          betAmount: activity.betAmount,
          winAmount: activity.winAmount,
          profit: activity.profit,
          timestamp: activity.timestamp.toISOString(),
          outcome: activity.outcome
        })),
        liveEvents: [], // We'll populate this with real-time events
        systemStats: {
          totalUsers: stats.totalUsers,
          activeUsers: stats.activeUsers,
          totalDeposits: stats.totalDeposits,
          totalWithdrawals: stats.totalWithdrawals,
          totalGameRevenue: stats.totalGameRevenue,
          pendingWithdrawals: stats.pendingWithdrawals,
          lastUpdated: new Date().toISOString()
        },
        summary
      }
    })
  } catch (error) {
    console.error('Error getting admin data:', error)
    return NextResponse.json({ error: 'Failed to get admin data' }, { status: 500 })
  }
}

async function handleGetWithdrawals() {
  try {
    const [pending, processed] = await Promise.all([
      databaseService.getWithdrawalRequests('pending'),
      databaseService.getWithdrawalRequests('processed')
    ])

    return NextResponse.json({
      success: true,
      data: {
        pending: pending.map(w => ({
          id: w._id,
          userId: w.clerkUserId,
          userName: w.userName,
          amount: w.amount,
          method: w.method,
          upiId: w.accountDetails.upiId,
          accountDetails: w.accountDetails,
          requestTime: w.createdAt.toISOString(),
          status: w.status
        })),
        processed: processed.map(w => ({
          id: w._id,
          userId: w.clerkUserId,
          userName: w.userName,
          amount: w.amount,
          method: w.method,
          status: w.status,
          processedAt: w.processedAt?.toISOString(),
          adminNotes: w.adminNotes
        }))
      }
    })
  } catch (error) {
    console.error('Error getting withdrawals:', error)
    return NextResponse.json({ error: 'Failed to get withdrawals' }, { status: 500 })
  }
}

async function handleGetDeposits() {
  try {
    const deposits = await databaseService.getTransactions(undefined, 100)
    const depositTransactions = deposits.filter(t => t.type === 'deposit')

    return NextResponse.json({
      success: true,
      data: {
        pending: [], // Deposits are typically instant
        processed: depositTransactions.map(d => ({
          id: d._id,
          userId: d.clerkUserId,
          userName: d.description.includes('User deposit') ? 'User' : d.description,
          amount: d.amount,
          method: 'upi',
          status: d.status,
          timestamp: d.createdAt.toISOString(),
          verifiedAt: d.updatedAt.toISOString()
        }))
      }
    })
  } catch (error) {
    console.error('Error getting deposits:', error)
    return NextResponse.json({ error: 'Failed to get deposits' }, { status: 500 })
  }
}

async function handleProcessWithdrawal(data: any) {
  try {
    const { withdrawalId, status, adminNote } = data
    
    const withdrawal = await databaseService.updateWithdrawalStatus(
      withdrawalId,
      status,
      'admin',
      adminNote
    )

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    // If approved, update user's total withdrawals
    if (status === 'approved') {
      await databaseService.updateUser(withdrawal.clerkUserId, {
        totalWithdrawals: withdrawal.amount
      })
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal ${status} successfully`,
      withdrawal
    })
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 })
  }
}

async function handleVerifyDeposit(data: any) {
  try {
    const { depositId, status, adminNote } = data
    
    // For now, deposits are handled through transactions
    // This could be expanded based on your deposit verification needs
    
    return NextResponse.json({
      success: true,
      message: `Deposit ${status} successfully`
    })
  } catch (error) {
    console.error('Error verifying deposit:', error)
    return NextResponse.json({ error: 'Failed to verify deposit' }, { status: 500 })
  }
}

async function handleUpdateUserWallet(data: any) {
  try {
    const { userId, amount, type, walletType, reason } = data
    
    const user = await databaseService.updateUserWallet(
      userId,
      amount,
      type,
      walletType,
      reason,
      'admin'
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet updated successfully',
      user: {
        cashBalance: user.cashBalance,
        bonusBalance: user.bonusBalance,
        indCoins: user.indCoins
      }
    })
  } catch (error) {
    console.error('Error updating user wallet:', error)
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
  }
}

async function handleGetUserData(userId: string) {
  try {
    const user = await databaseService.getUser(userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.clerkUserId,
        email: user.email,
        name: user.name,
        cashBalance: user.cashBalance,
        bonusBalance: user.bonusBalance,
        indCoins: user.indCoins,
        totalDeposits: user.totalDeposits,
        totalWithdrawals: user.totalWithdrawals,
        gamesPlayed: user.gamesPlayed,
        totalWinnings: user.totalWinnings,
        totalLosses: user.totalLosses,
        tier: user.tier,
        referralCount: user.referralCount,
        referralEarnings: user.referralEarnings
      }
    })
  } catch (error) {
    console.error('Error getting user data:', error)
    return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 })
  }
}

async function handleForceRefresh() {
  try {
    // Force refresh by getting latest data
    const [users, stats, gameActivity] = await Promise.all([
      databaseService.getAllUsers(100),
      databaseService.calculateAdminStats(),
      databaseService.getGameActivity(50)
    ])

    return NextResponse.json({
      success: true,
      message: 'Data refreshed successfully',
      data: {
        users: users.length,
        stats,
        lastRefresh: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error force refreshing:', error)
    return NextResponse.json({ error: 'Failed to refresh data' }, { status: 500 })
  }
}
