import { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchUser } from '@/models/CouchModels'

// GET /api/admin/users - Get all users for admin panel
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { searchParams } = new URL(req.url)
    
    // Pagination parameters (simplified for CouchDB)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = (page - 1) * limit
    
    // Filter parameters
    const search = searchParams.get('search') || ''
    const tier = searchParams.get('tier')
    
    // Get users from CouchDB (simplified - no complex queries like MongoDB)
    let users: any[] = []
    
    if (tier && tier !== 'all') {
      // Get users by tier
      users = await CouchUser.getUsersByTier(tier)
    } else {
      // Get all users (limited approach for CouchDB)
      // In a real implementation, you'd set up proper views for this
      users = []
    }
    
    // Filter by search term if provided (client-side filtering for now)
    if (search) {
      users = users.filter(user => 
        user.userName.toLowerCase().includes(search.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        user.clerkUserId.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply pagination
    const paginatedUsers = users.slice(offset, offset + limit)
    const totalCount = users.length
    const totalPages = Math.ceil(totalCount / limit)
    
    // Calculate platform statistics (simplified)
    let platformStats = {
      totalUsers: users.length,
      totalCashBalance: users.reduce((sum, u) => sum + (u.cashBalance || 0), 0),
      totalBonusBalance: users.reduce((sum, u) => sum + (u.bonusBalance || 0), 0),
      totalDeposits: users.reduce((sum, u) => sum + (u.totalDeposits || 0), 0),
      totalWithdrawals: users.reduce((sum, u) => sum + (u.totalWithdrawals || 0), 0),
      totalWon: users.reduce((sum, u) => sum + (u.totalWon || 0), 0),
      totalLost: users.reduce((sum, u) => sum + (u.totalLost || 0), 0)
    }
    
    // Calculate tier distribution
    const tierCounts: Record<string, number> = {}
    users.forEach(user => {
      tierCounts[user.tier] = (tierCounts[user.tier] || 0) + 1
    })
    
    return Response.json({
      success: true,
      users: paginatedUsers.map(user => ({
        id: user._id,
        clerkUserId: user.clerkUserId,
        userName: user.userName,
        userEmail: user.userEmail,
        emoji: user.emoji,
        tier: user.tier,
        cashBalance: user.cashBalance,
        bonusBalance: user.bonusBalance,
        totalBalance: user.cashBalance + user.bonusBalance,
        totalWon: user.totalWon,
        totalLost: user.totalLost,
        totalDeposits: user.totalDeposits,
        totalWithdrawals: user.totalWithdrawals,
        hasWithdrawnBasic: user.hasWithdrawnBasic,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        // Calculate user analytics
        netProfit: user.totalWon - user.totalLost,
        riskLevel: user.totalLost > user.totalDeposits * 2 ? 'High' : 
                  user.totalLost > user.totalDeposits ? 'Medium' : 'Low',
        trustScore: Math.min(10, Math.max(1, 
          (user.totalDeposits / 1000) + 
          (user.createdAt ? (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30) : 0) // Account age in months
        )),
        memberAge: user.createdAt ? 
          Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      platformStats,
      tierStats: tierCounts
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
})
