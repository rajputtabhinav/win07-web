import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchUser, CouchTransaction } from '@/models/CouchModels'

// POST /api/wallet/bet - Place a bet (deduct from balance)
export const POST = withAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { userId } = (req as any).auth
    const body = await req.json()
    
    const { amount, game, betDetails } = body
    
    // Validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return Response.json(
        { error: 'Invalid bet amount' },
        { status: 400 }
      )
    }
    
    if (!game || typeof game !== 'string') {
      return Response.json(
        { error: 'Game is required' },
        { status: 400 }
      )
    }
    
    const MAX_BET = 50000
    if (amount > MAX_BET) {
      return Response.json(
        { error: `Maximum bet amount is ₹${MAX_BET}` },
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
    
    // Check if user has sufficient balance
    if (user.cashBalance < amount) {
      return Response.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }
    
    // Update user balance and stats
    await CouchUser.updateBalance(userId, -amount, 0)
    await CouchUser.updateStats(userId, { totalLost: amount })
    
    // Get updated user data
    const updatedUser = await CouchUser.findByClerkId(userId)
    
    // Create transaction record
    const transaction = await CouchTransaction.create({
      userId: user._id!,
      clerkUserId: userId,
      transactionType: 'bet',
      amount,
      walletType: 'cash',
      game,
      description: `Bet of ₹${amount} on ${game}`,
      status: 'completed',
      metadata: {
        betDetails,
        gameSession: betDetails?.sessionId || Date.now()
      }
    })
    
    return Response.json({
      success: true,
      message: 'Bet placed successfully',
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
    console.error('Error placing bet:', error)
    return Response.json(
      { error: 'Failed to place bet' },
      { status: 500 }
    )
  }
})

// This endpoint can also handle refunds in case of game errors
export const PATCH = withAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { userId } = (req as any).auth
    const body = await req.json()
    
    const { transactionId, reason } = body
    
    if (!transactionId) {
      return Response.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }
    
    // Find the original bet transaction
    const originalTransaction = await CouchTransaction.findById(transactionId)
    
    if (!originalTransaction || 
        originalTransaction.clerkUserId !== userId ||
        originalTransaction.transactionType !== 'bet' ||
        originalTransaction.status !== 'completed') {
      return Response.json(
        { error: 'Bet transaction not found' },
        { status: 404 }
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
    
    // Refund the bet amount
    await CouchUser.updateBalance(userId, originalTransaction.amount, 0)
    await CouchUser.updateStats(userId, { totalLost: -originalTransaction.amount })
    
    // Get updated user data
    const updatedUser = await CouchUser.findByClerkId(userId)
    
    // Create refund transaction record
    const refundTransaction = await CouchTransaction.create({
      userId: user._id!,
      clerkUserId: userId,
      transactionType: 'admin_adjustment',
      amount: originalTransaction.amount,
      walletType: 'cash',
      game: originalTransaction.game,
      description: `Refund for bet #${transactionId}: ${reason}`,
      status: 'completed',
      metadata: {
        originalTransactionId: transactionId,
        refundReason: reason,
        refundType: 'bet_cancellation'
      }
    })
    
    return Response.json({
      success: true,
      message: 'Bet refunded successfully',
      refund: {
        amount: originalTransaction.amount,
        reason
      },
      newBalance: {
        cash: updatedUser?.cashBalance || 0,
        bonus: updatedUser?.bonusBalance || 0,
        total: (updatedUser?.cashBalance || 0) + (updatedUser?.bonusBalance || 0)
      }
    })
  } catch (error) {
    console.error('Error refunding bet:', error)
    return Response.json(
      { error: 'Failed to refund bet' },
      { status: 500 }
    )
  }
})
