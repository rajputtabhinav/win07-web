import { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchWithdrawalRequest, CouchUser } from '@/models/CouchModels'

// GET /api/admin/withdrawals - Get pending withdrawal requests
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'
    
    let withdrawalRequests
    if (status === 'all') {
      withdrawalRequests = await CouchWithdrawalRequest.getAllRequests(100)
    } else {
      withdrawalRequests = await CouchWithdrawalRequest.getRequestsByStatus(status as any, 100)
    }
    
    // Get user data for each withdrawal request
    const enrichedRequests = await Promise.all(
      withdrawalRequests.map(async (request) => {
        const user = await CouchUser.findByClerkId(request.clerkUserId)
        return {
          ...request,
          user: user ? {
            id: user._id,
            name: user.userName,
            email: user.userEmail,
            tier: user.tier,
            currentBalance: user.cashBalance
          } : null
        }
      })
    )
    
    return Response.json({
      success: true,
      withdrawalRequests: enrichedRequests.map(request => ({
        id: request._id,
        user: request.user,
        amount: request.amount,
        method: request.method,
        accountDetails: request.accountDetails,
        status: request.status,
        adminNotes: request.adminNotes,
        processedBy: request.processedBy,
        processedAt: request.processedAt,
        rejectionReason: request.rejectionReason,
        createdAt: request.createdAt,
        metadata: request.metadata
      }))
    })
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error)
    return Response.json(
      { error: 'Failed to fetch withdrawal requests' },
      { status: 500 }
    )
  }
})

// PATCH /api/admin/withdrawals - Update withdrawal request status
export const PATCH = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    const { userId: adminUserId } = (req as any).auth
    const body = await req.json()
    
    const { withdrawalId, action, notes, rejectionReason } = body
    
    if (!withdrawalId) {
      return Response.json(
        { error: 'Withdrawal ID is required' },
        { status: 400 }
      )
    }
    
    if (!['approve', 'reject', 'processing', 'complete'].includes(action)) {
      return Response.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
    const withdrawalRequest = await CouchWithdrawalRequest.findById(withdrawalId)
    
    if (!withdrawalRequest) {
      return Response.json(
        { error: 'Withdrawal request not found' },
        { status: 404 }
      )
    }
    
    if (withdrawalRequest.status !== 'pending' && action !== 'complete') {
      return Response.json(
        { error: 'Withdrawal request has already been processed' },
        { status: 400 }
      )
    }
    
    let updatedRequest
    
    switch (action) {
      case 'approve':
        updatedRequest = await CouchWithdrawalRequest.approveRequest(withdrawalId, adminUserId, notes)
        
        // Update user stats
        await CouchUser.updateStats(withdrawalRequest.clerkUserId, {
          totalWithdrawals: withdrawalRequest.amount,
          hasWithdrawnBasic: withdrawalRequest.userId ? true : undefined
        })
        break
        
      case 'reject':
        if (!rejectionReason) {
          return Response.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          )
        }
        
        updatedRequest = await CouchWithdrawalRequest.rejectRequest(withdrawalId, adminUserId, rejectionReason)
        
        // Refund the user's money
        await CouchUser.updateBalance(withdrawalRequest.clerkUserId, withdrawalRequest.amount, 0)
        break
        
      case 'processing':
        updatedRequest = await CouchWithdrawalRequest.markProcessing(withdrawalId, adminUserId)
        break
        
      case 'complete':
        updatedRequest = await CouchWithdrawalRequest.markCompleted(withdrawalId)
        break
        
      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return Response.json({
      success: true,
      message: `Withdrawal request ${action}d successfully`,
      withdrawalRequest: {
        id: updatedRequest._id,
        status: updatedRequest.status,
        processedBy: updatedRequest.processedBy,
        processedAt: updatedRequest.processedAt,
        adminNotes: updatedRequest.adminNotes,
        rejectionReason: updatedRequest.rejectionReason
      }
    })
  } catch (error) {
    console.error('Error updating withdrawal request:', error)
    return Response.json(
      { error: 'Failed to update withdrawal request' },
      { status: 500 }
    )
  }
})
