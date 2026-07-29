import { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchUser, CouchTransaction } from '@/models/CouchModels'

// POST /api/admin/wallet/[action] - Admin wallet operations (deposit/withdraw)
export const POST = withAdminAuth(async (req: NextRequest, { params }: { params: { action: string } }) => {
  try {
    await connectToCouchDB()
    
    const { userId: adminUserId } = (req as any).auth
    const { action } = params
    const body = await req.json()
    
    const { targetUserId, amount, type, notes } = body
    
    // Validation
    if (!['deposit', 'withdraw'].includes(action)) {
      return Response.json(
        { error: 'Invalid action. Must be deposit or withdraw' },
        { status: 400 }
      )
    }
    
    if (!targetUserId) {
      return Response.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      )
    }
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return Response.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    if (!type || !['cash', 'bonus'].includes(type)) {
      return Response.json(
        { error: 'Invalid wallet type. Must be cash or bonus' },
        { status: 400 }
      )
    }
    
    // Find target user
    const targetUser = await CouchUser.findByClerkId(targetUserId)
    if (!targetUser) {
      return Response.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }
    
    // Perform the operation
    let newBalance: number
    let transactionType: string
    let description: string
    let oldBalance: number
    
    if (action === 'deposit') {
      // Add funds
      oldBalance = type === 'cash' ? targetUser.cashBalance : targetUser.bonusBalance
      
      if (type === 'cash') {
        await CouchUser.updateBalance(targetUserId, amount, 0)
        await CouchUser.updateStats(targetUserId, { totalDeposits: amount })
        newBalance = targetUser.cashBalance + amount
      } else {
        await CouchUser.updateBalance(targetUserId, 0, amount)
        newBalance = targetUser.bonusBalance + amount
      }
      
      transactionType = 'admin_deposit'
      description = `Admin deposit of ₹${amount} (${type}) - ${notes || 'No notes provided'}`
    } else {
      // Withdraw funds
      const currentBalance = type === 'cash' ? targetUser.cashBalance : targetUser.bonusBalance
      oldBalance = currentBalance
      
      if (currentBalance < amount) {
        return Response.json(
          { error: `Insufficient ${type} balance. Current: ₹${currentBalance}` },
          { status: 400 }
        )
      }
      
      if (type === 'cash') {
        await CouchUser.updateBalance(targetUserId, -amount, 0)
        await CouchUser.updateStats(targetUserId, { totalWithdrawals: amount })
        newBalance = targetUser.cashBalance - amount
      } else {
        await CouchUser.updateBalance(targetUserId, 0, -amount)
        newBalance = targetUser.bonusBalance - amount
      }
      
      transactionType = 'admin_withdrawal'
      description = `Admin withdrawal of ₹${amount} (${type}) - ${notes || 'No notes provided'}`
    }
    
    // Create transaction record
    const transaction = await CouchTransaction.create({
      userId: targetUser._id!,
      clerkUserId: targetUserId,
      transactionType: transactionType as any,
      amount,
      walletType: type as 'cash' | 'bonus',
      game: 'system',
      description,
      status: 'completed',
      adminUserId,
      metadata: {
        adminNotes: notes,
        performedBy: adminUserId,
        oldBalance,
        newBalance
      }
    })
    
    // Get updated user for response
    const updatedUser = await CouchUser.findByClerkId(targetUserId)
    
    return Response.json({
      success: true,
      message: `Successfully ${action}ed ₹${amount} ${action === 'deposit' ? 'to' : 'from'} ${targetUser.userName}'s ${type} wallet`,
      transaction: {
        id: transaction._id,
        type: transaction.transactionType,
        amount: transaction.amount,
        walletType: transaction.walletType,
        description: transaction.description,
        createdAt: transaction.createdAt
      },
      updatedUser: {
        id: updatedUser?._id,
        userName: updatedUser?.userName,
        cashBalance: updatedUser?.cashBalance || 0,
        bonusBalance: updatedUser?.bonusBalance || 0,
        totalBalance: (updatedUser?.cashBalance || 0) + (updatedUser?.bonusBalance || 0),
        totalDeposits: updatedUser?.totalDeposits || 0,
        totalWithdrawals: updatedUser?.totalWithdrawals || 0
      }
    })
  } catch (error) {
    console.error('Error performing admin wallet operation:', error)
    return Response.json(
      { error: 'Failed to perform wallet operation' },
      { status: 500 }
    )
  }
})
