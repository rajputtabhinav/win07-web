import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchUser, CouchTransaction } from '@/models/CouchModels'

// POST /api/wallet/win - Add winnings to user balance
export const POST = withAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { userId } = (req as any).auth
    const body = await req.json()
    
    const { amount, game, winDetails } = body
    
    // Validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return Response.json(
        { error: 'Invalid win amount' },
        { status: 400 }
      )
    }
    
    if (!game || typeof game !== 'string') {
      return Response.json(
        { error: 'Game is required' },
        { status: 400 }
      )
    }
    
    // Find user
    const user = await CouchUser.findByClerkId(userId)
    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Update user balance and stats
    await CouchUser.updateBalance(userId, amount, 0)
    await CouchUser.updateStats(userId, { totalWon: amount })
    
    // Get updated user data
    const updatedUser = await CouchUser.findByClerkId(userId)
    
    // Create transaction record
    const transaction = await CouchTransaction.create({
      userId: user._id!,
      clerkUserId: userId,
      transactionType: 'win',
      amount,
      walletType: 'cash',
      game,
      description: `Win of ₹${amount} from ${game}`,
      status: 'completed',
      metadata: {
        winDetails,
        gameSession: winDetails?.sessionId || Date.now(),
        multiplier: winDetails?.multiplier,
        originalBet: winDetails?.originalBet
      }
    })
    
    return Response.json({
      success: true,
      message: 'Winnings added successfully',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        game: transaction.game,
        type: transaction.transactionType,
        createdAt: transaction.createdAt
      },
      newBalance: {
        cash: updatedUser?.cashBalance || 0,
        bonus: updatedUser?.bonusBalance || 0,
        total: (updatedUser?.cashBalance || 0) + (updatedUser?.bonusBalance || 0)
      }
    })
  } catch (error) {
    console.error('Error adding winnings:', error)
    return Response.json(
      { error: 'Failed to add winnings' },
      { status: 500 }
    )
  }
})
