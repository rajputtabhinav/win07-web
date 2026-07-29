import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchTransaction } from '@/models/CouchModels'

// GET /api/wallet/transactions - Get user's transaction history
export const GET = withAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { userId } = (req as any).auth
    const { searchParams } = new URL(req.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100 per page
    const offset = (page - 1) * limit
    
    // Filter parameters
    const type = searchParams.get('type') // 'deposit', 'withdrawal', 'bet', 'win', etc.
    const game = searchParams.get('game')
    const status = searchParams.get('status')
    
    // Get transactions with filters
    const transactions = await CouchTransaction.getTransactionHistory(userId, {
      limit,
      offset,
      type: type || undefined,
      status: status || undefined
    })
    
    // Filter by game if specified (CouchDB view filtering is limited)
    let filteredTransactions = transactions
    if (game && game !== 'all') {
      filteredTransactions = transactions.filter(tx => tx.game === game)
    }
    
    // Get user transaction summary for statistics
    const summary = await CouchTransaction.getUserTransactionSummary(userId)
    
    // Calculate pagination info (approximation since CouchDB doesn't provide total count easily)
    const hasNextPage = transactions.length === limit
    const totalPages = hasNextPage ? page + 1 : page // Approximation
    
    return Response.json({
      success: true,
      transactions: filteredTransactions.map(tx => ({
        id: tx._id,
        type: tx.transactionType,
        amount: tx.amount,
        walletType: tx.walletType,
        game: tx.game,
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt,
        metadata: tx.metadata
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: filteredTransactions.length, // Approximate count
        hasNextPage,
        hasPrevPage: page > 1
      },
      summary: {
        deposit: {
          totalAmount: summary.totalDeposits,
          count: 0 // CouchDB doesn't easily provide counts
        },
        withdrawal: {
          totalAmount: summary.totalWithdrawals,
          count: 0
        },
        bet: {
          totalAmount: summary.totalBets,
          count: 0
        },
        win: {
          totalAmount: summary.totalWins,
          count: 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return Response.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
})
