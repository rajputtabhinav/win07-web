import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchUser, CouchTransaction } from '@/models/CouchModels'

// POST /api/wallet/deposit - Process a deposit
export const POST = withAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { userId, isAdmin } = (req as any).auth
    const body = await req.json()
    
    const { amount, verified = false, paymentData } = body
    
    // Validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return Response.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    const MIN_DEPOSIT = 150
    if (amount < MIN_DEPOSIT) {
      return Response.json(
        { error: `Minimum deposit is ₹${MIN_DEPOSIT}` },
        { status: 400 }
      )
    }
    
    // Security check: Only verified deposits allowed (except for admin)
    if (!verified && !isAdmin) {
      return Response.json(
        { error: 'Deposit must be verified through payment gateway' },
        { status: 400 }
      )
    }
    
    // Large deposit check
    if (amount > 100000 && !isAdmin) {
      return Response.json(
        { error: 'Large deposits require additional verification' },
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
    
    // Create transaction record
    const transaction = await CouchTransaction.create({
      userId: user._id!,
      clerkUserId: userId,
      transactionType: 'deposit',
      amount,
      walletType: 'cash',
      description: `Deposit of ₹${amount}`,
      status: verified ? 'completed' : 'pending',
      verificationData: {
        verified,
        verifiedAt: verified ? new Date().toISOString() : undefined,
        paymentGateway: paymentData?.gateway,
        transactionId: paymentData?.transactionId
      },
      metadata: {
        paymentData,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      }
    })
    
    // If verified, update user balance
    if (verified) {
      await CouchUser.updateBalance(userId, amount, 0)
      await CouchUser.updateStats(userId, { totalDeposits: amount })
    }
    
    // Get updated user data
    const updatedUser = await CouchUser.findByClerkId(userId)
    
    return Response.json({
      success: true,
      message: verified ? 'Deposit successful' : 'Deposit pending verification',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        type: transaction.transactionType,
        createdAt: transaction.createdAt
      },
      newBalance: {
        cash: updatedUser?.cashBalance || user.cashBalance,
        bonus: updatedUser?.bonusBalance || user.bonusBalance,
        total: (updatedUser?.cashBalance || user.cashBalance) + (updatedUser?.bonusBalance || user.bonusBalance)
      }
    })
  } catch (error) {
    console.error('Error processing deposit:', error)
    return Response.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    )
  }
})
