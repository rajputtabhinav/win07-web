import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchUser } from '@/models/CouchModels'

// GET /api/wallet/balance - Get user's wallet balance
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const dbConnection = await connectToCouchDB()
    
    // If no database connection in development, return mock data
    if (!dbConnection && process.env.NODE_ENV === 'development') {
      console.log('🔄 Using mock wallet data - database not available')
      return Response.json({
        success: true,
        balance: {
          cash: 100,
          bonus: 50,
          total: 150
        },
        user: {
          id: 'mock_user_id',
          userName: 'Test User',
          email: 'test@example.com',
          emoji: '😊',
          tier: 'Basic',
          totalWon: 0,
          totalLost: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          hasWithdrawnBasic: false
        }
      })
    }
    
    const { userId } = (req as any).auth
    
    // Find or create user
    let user = await CouchUser.findByClerkId(userId)
    
    if (!user) {
      // Create new user with default values
      const { user: clerkUser } = (req as any).auth
      const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || ''
      const userName = clerkUser.fullName || clerkUser.firstName || 'User'
      
      user = await CouchUser.create({
        clerkUserId: userId,
        userName,
        userEmail,
        userFullName: userName,
        cashBalance: 0,
        bonusBalance: 0
      })
    }
    
    // Update last login
    await CouchUser.updateLastLogin(userId)
    
    return Response.json({
      success: true,
      balance: {
        cash: user.cashBalance,
        bonus: user.bonusBalance,
        total: user.cashBalance + user.bonusBalance
      },
      user: {
        id: user._id,
        userName: user.userName,
        email: user.userEmail,
        emoji: user.emoji,
        tier: user.tier,
        totalWon: user.totalWon,
        totalLost: user.totalLost,
        totalDeposits: user.totalDeposits,
        totalWithdrawals: user.totalWithdrawals,
        hasWithdrawnBasic: user.hasWithdrawnBasic
      }
    })
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return Response.json(
      { error: 'Failed to fetch wallet balance' },
      { status: 500 }
    )
  }
})
