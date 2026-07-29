import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchUser, CouchWithdrawalRequest, CouchTransaction } from '@/models/CouchModels'

// POST /api/wallet/withdraw - Create a withdrawal request
export const POST = withAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { userId } = (req as any).auth
    const body = await req.json()
    
    const { amount, method, accountDetails } = body
    
    // Validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return Response.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    if (!method || !['bank', 'upi'].includes(method)) {
      return Response.json(
        { error: 'Invalid withdrawal method' },
        { status: 400 }
      )
    }
    
    if (!accountDetails) {
      return Response.json(
        { error: 'Account details are required' },
        { status: 400 }
      )
    }
    
    // Validate account details based on method
    if (method === 'bank') {
      const { accountNumber, ifscCode, bankName, accountHolderName } = accountDetails
      if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
        return Response.json(
          { error: 'Complete bank details are required' },
          { status: 400 }
        )
      }
    } else if (method === 'upi') {
      const { upiId } = accountDetails
      if (!upiId) {
        return Response.json(
          { error: 'UPI ID is required' },
          { status: 400 }
        )
      }
    }
    
    // Find user
    const user = await CouchUser.findByClerkId(userId)
    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user can withdraw this amount
    const withdrawalCheck = await CouchWithdrawalRequest.canUserWithdraw(
      userId, 
      amount, 
      user.tier, 
      user.cashBalance, 
      user.hasWithdrawnBasic
    )
    if (!withdrawalCheck.allowed) {
      return Response.json(
        { error: withdrawalCheck.reason },
        { status: 400 }
      )
    }
    
    // Check for existing pending withdrawal
    const pendingAmount = await CouchWithdrawalRequest.getUserPendingAmount(userId)
    if (pendingAmount > 0) {
      return Response.json(
        { error: 'You already have a pending withdrawal request' },
        { status: 400 }
      )
    }
    
    // Create withdrawal request
    const withdrawalRequest = await CouchWithdrawalRequest.create({
      userId: user._id!,
      clerkUserId: userId,
      amount,
      method,
      accountDetails,
      status: 'pending',
      metadata: {
        userTier: user.tier,
        requestIP: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      }
    })
    
    // Temporarily hold the funds (reduce cash balance)
    await CouchUser.updateBalance(userId, -amount, 0)
    
    // Create transaction record
    const transaction = await CouchTransaction.create({
      userId: user._id!,
      clerkUserId: userId,
      transactionType: 'withdrawal',
      amount,
      walletType: 'cash',
      description: `Withdrawal request for ₹${amount} via ${method}`,
      status: 'pending',
      metadata: {
        withdrawalRequestId: withdrawalRequest._id,
        method,
        accountDetails
      }
    })
    
    // Get updated user data
    const updatedUser = await CouchUser.findByClerkId(userId)
    
    return Response.json({
      success: true,
      message: 'Withdrawal request created successfully. It will be processed within 24-48 hours.',
      withdrawalRequest: {
        id: withdrawalRequest._id,
        amount: withdrawalRequest.amount,
        method: withdrawalRequest.method,
        status: withdrawalRequest.status,
        createdAt: withdrawalRequest.createdAt
      },
      newBalance: {
        cash: updatedUser?.cashBalance || 0,
        bonus: updatedUser?.bonusBalance || 0,
        total: (updatedUser?.cashBalance || 0) + (updatedUser?.bonusBalance || 0)
      }
    })
  } catch (error) {
    console.error('Error creating withdrawal request:', error)
    return Response.json(
      { error: 'Failed to create withdrawal request' },
      { status: 500 }
    )
  }
})
